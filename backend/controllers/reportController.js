const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Billing = require("../models/Billing");
const Medicine = require("../models/Medicine");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { toCsv } = require("../utils/csv");

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

// @route   GET /api/reports/dashboard-summary
// @access  Private (admin, receptionist, doctor)
// Returns the KPI cards + small charts shown on each dashboard's overview page.
const getDashboardSummary = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalPatients,
    totalDoctors,
    todayAppointments,
    pendingAppointments,
    lowStockCount,
    revenueAgg,
    revenueByMonth,
    appointmentsByStatus,
    appointmentsByDepartment,
  ] = await Promise.all([
    Patient.countDocuments(),
    Doctor.countDocuments(),
    Appointment.countDocuments({ appointmentDate: { $gte: startOfToday(), $lte: endOfToday() } }),
    Appointment.countDocuments({ status: "pending" }),
    Medicine.countDocuments({ $expr: { $lte: ["$quantityInStock", "$reorderLevel"] } }),
    Billing.aggregate([
      { $match: { paymentStatus: { $in: ["paid", "partial"] } } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]),
    Billing.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$amountPaid" },
          invoices: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Appointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Appointment.aggregate([
      {
        $lookup: { from: "doctors", localField: "doctor", foreignField: "_id", as: "doctorInfo" },
      },
      { $unwind: "$doctorInfo" },
      { $group: { _id: "$doctorInfo.department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueTrend = revenueByMonth.map((row) => ({
    label: `${monthNames[row._id.month - 1]} ${row._id.year}`,
    revenue: row.revenue,
    invoices: row.invoices,
  }));

  res.status(200).json({
    success: true,
    data: {
      totalPatients,
      totalDoctors,
      todayAppointments,
      pendingAppointments,
      lowStockCount,
      totalRevenue: revenueAgg[0]?.total || 0,
      revenueTrend,
      appointmentsByStatus: appointmentsByStatus.map((r) => ({ status: r._id, count: r.count })),
      appointmentsByDepartment: appointmentsByDepartment.map((r) => ({ department: r._id || "General", count: r.count })),
    },
  });
});

// @route   GET /api/reports/patient-summary
// @access  Private (doctor, patient-self)
// Small stats used on the patient-facing overview page.
const getPatientSummary = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return res.status(200).json({ success: true, data: { upcomingAppointments: 0, unpaidInvoices: 0, totalVisits: 0 } });
  }

  const [upcomingAppointments, unpaidInvoices, totalVisits] = await Promise.all([
    Appointment.countDocuments({ patient: patient._id, appointmentDate: { $gte: startOfToday() }, status: { $in: ["pending", "confirmed"] } }),
    Billing.countDocuments({ patient: patient._id, paymentStatus: { $in: ["unpaid", "partial"] } }),
    Appointment.countDocuments({ patient: patient._id, status: "completed" }),
  ]);

  res.status(200).json({ success: true, data: { upcomingAppointments, unpaidInvoices, totalVisits } });
});

// @route   GET /api/reports/export/patients
// @access  Private (admin, receptionist)
const exportPatientsCsv = asyncHandler(async (req, res) => {
  const patients = await Patient.find().populate("user", "name email phone gender dateOfBirth address");

  const csv = toCsv(patients, [
    { label: "Name", accessor: (p) => p.user?.name },
    { label: "Email", accessor: (p) => p.user?.email },
    { label: "Phone", accessor: (p) => p.user?.phone },
    { label: "Gender", accessor: (p) => p.user?.gender },
    { label: "Blood Group", key: "bloodGroup" },
    { label: "Insurance Provider", key: "insuranceProvider" },
    { label: "Registered On", accessor: (p) => new Date(p.createdAt).toLocaleDateString() },
  ]);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="patients-export-${Date.now()}.csv"`);
  res.status(200).send(csv);
});

// @route   GET /api/reports/export/billing
// @access  Private (admin, receptionist)
const exportBillingCsv = asyncHandler(async (req, res) => {
  const bills = await Billing.find().populate({ path: "patient", populate: { path: "user", select: "name email" } }).sort({ createdAt: -1 });

  const csv = toCsv(bills, [
    { label: "Invoice #", key: "invoiceNumber" },
    { label: "Patient", accessor: (b) => b.patient?.user?.name },
    { label: "Sub Total", key: "subTotal" },
    { label: "Discount", key: "discount" },
    { label: "Tax", key: "tax" },
    { label: "Grand Total", key: "grandTotal" },
    { label: "Amount Paid", key: "amountPaid" },
    { label: "Status", key: "paymentStatus" },
    { label: "Method", key: "paymentMethod" },
    { label: "Date", accessor: (b) => new Date(b.createdAt).toLocaleDateString() },
  ]);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="billing-export-${Date.now()}.csv"`);
  res.status(200).send(csv);
});

// @route   GET /api/reports/export/appointments
// @access  Private (admin, receptionist)
const exportAppointmentsCsv = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find()
    .populate({ path: "patient", populate: { path: "user", select: "name" } })
    .populate({ path: "doctor", populate: { path: "user", select: "name" } })
    .sort({ appointmentDate: -1 });

  const csv = toCsv(appointments, [
    { label: "Patient", accessor: (a) => a.patient?.user?.name },
    { label: "Doctor", accessor: (a) => a.doctor?.user?.name },
    { label: "Department", accessor: (a) => a.doctor?.department },
    { label: "Date", accessor: (a) => new Date(a.appointmentDate).toLocaleDateString() },
    { label: "Time Slot", key: "timeSlot" },
    { label: "Status", key: "status" },
    { label: "Reason", key: "reasonForVisit" },
  ]);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="appointments-export-${Date.now()}.csv"`);
  res.status(200).send(csv);
});

module.exports = {
  getDashboardSummary,
  getPatientSummary,
  exportPatientsCsv,
  exportBillingCsv,
  exportAppointmentsCsv,
};
