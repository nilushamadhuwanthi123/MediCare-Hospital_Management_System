const Billing = require("../models/Billing");
const Patient = require("../models/Patient");
const Counter = require("../models/Counter");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { notify } = require("../utils/notify");
const { streamInvoicePdf } = require("../utils/generateInvoicePdf");

// Generates a sequential invoice number like INV-000001 using an atomic
// counter — safe even when two invoices are created at the exact same time.
const generateInvoiceNumber = async () => {
  const seq = await Counter.getNextSequence("invoiceNumber");
  return `INV-${String(seq).padStart(6, "0")}`;
};

// @route   POST /api/billing
// @access  Private (admin, receptionist)
const createBill = asyncHandler(async (req, res) => {
  const { items, discount = 0, tax = 0 } = req.body;

  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = Math.max(subTotal - discount + tax, 0);

  const invoiceNumber = await generateInvoiceNumber();

  const bill = await Billing.create({
    ...req.body,
    subTotal,
    grandTotal,
    invoiceNumber,
    issuedBy: req.user._id,
  });

  const patient = await Patient.findById(bill.patient).populate("user", "name");
  if (patient?.user) {
    await notify({
      recipient: patient.user._id,
      title: "New invoice issued",
      message: `Invoice ${bill.invoiceNumber} for Rs. ${grandTotal.toLocaleString()} has been generated.`,
      type: "billing",
      link: "/patient/billing",
    });
  }

  res.status(201).json({ success: true, data: bill });
});

// @route   GET /api/billing
// @access  Private — admin/receptionist see everything; patients see only their own invoices
// Supports pagination (page, limit), search (by invoice number), and status filter.
const getAllBills = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const { search, status } = req.query;

  const filter = {};

  if (req.user.role === "patient") {
    const ownPatientProfile = await Patient.findOne({ user: req.user._id });
    // No profile yet (e.g. brand-new account) => no invoices possible
    filter.patient = ownPatientProfile ? ownPatientProfile._id : null;
  } else if (!["admin", "receptionist"].includes(req.user.role)) {
    throw new AppError("Not authorized to view invoices", 403, "FORBIDDEN");
  }

  if (status) filter.paymentStatus = status;
  if (search) filter.invoiceNumber = { $regex: search, $options: "i" };

  const [bills, total] = await Promise.all([
    Billing.find(filter)
      .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Billing.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: bills.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    data: bills,
  });
});

// @route   GET /api/billing/:id
// @access  Private
const getBillById = asyncHandler(async (req, res) => {
  const bill = await Billing.findById(req.params.id).populate({
    path: "patient",
    populate: { path: "user", select: "name email phone address" },
  });

  if (!bill) {
    throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  }

  res.status(200).json({ success: true, data: bill });
});

// @route   GET /api/billing/:id/pdf
// @access  Private
// Streams a branded, printable PDF version of the invoice.
const downloadInvoicePdf = asyncHandler(async (req, res) => {
  const bill = await Billing.findById(req.params.id).populate({
    path: "patient",
    populate: { path: "user", select: "name email phone address" },
  });

  if (!bill) {
    throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  }

  // Patients may only download their own invoice
  if (req.user.role === "patient") {
    const ownPatientProfile = await Patient.findOne({ user: req.user._id });
    if (!ownPatientProfile || ownPatientProfile._id.toString() !== bill.patient._id.toString()) {
      throw new AppError("Not authorized to access this invoice", 403, "FORBIDDEN");
    }
  }

  streamInvoicePdf(res, bill);
});

// @route   PUT /api/billing/:id/payment
// @access  Private (admin, receptionist)
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const bill = await Billing.findById(req.params.id);

  if (!bill) {
    throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  }

  Object.assign(bill, req.body);
  await bill.save();

  const patient = await Patient.findById(bill.patient).populate("user", "name");
  if (patient?.user && req.body.paymentStatus) {
    await notify({
      recipient: patient.user._id,
      title: "Invoice status updated",
      message: `Invoice ${bill.invoiceNumber} is now marked as ${bill.paymentStatus}.`,
      type: "billing",
      link: "/patient/billing",
    });
  }

  res.status(200).json({ success: true, data: bill });
});

module.exports = { createBill, getAllBills, getBillById, downloadInvoicePdf, updatePaymentStatus };
