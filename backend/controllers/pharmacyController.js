const Medicine = require("../models/Medicine");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { notifyMany } = require("../utils/notify");

const alertAdminsIfLowStock = async (medicine) => {
  if (medicine.quantityInStock > medicine.reorderLevel) return;

  const admins = await User.find({ role: "admin", isActive: true }).select("_id");
  await notifyMany(
    admins.map((a) => a._id),
    {
      title: "Low stock alert",
      message: `${medicine.name} is running low (${medicine.quantityInStock} left, reorder level ${medicine.reorderLevel}).`,
      type: "pharmacy",
      link: "/admin/pharmacy",
    }
  );
};

// @route   POST /api/pharmacy
// @access  Private (admin only)
const createMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.create(req.body);
  await alertAdminsIfLowStock(medicine);
  res.status(201).json({ success: true, data: medicine });
});

// @route   GET /api/pharmacy
// @access  Private (admin, doctor, receptionist)
// Supports pagination, search-by-name, category filter, and low-stock filter.
const getAllMedicines = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 200);
  const { lowStock, category, search } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: "i" };
  if (lowStock === "true") filter.$expr = { $lte: ["$quantityInStock", "$reorderLevel"] };

  const [medicines, total] = await Promise.all([
    Medicine.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Medicine.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: medicines.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    data: medicines,
  });
});

// @route   GET /api/pharmacy/:id
// @access  Private
const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    throw new AppError("Medicine not found", 404, "MEDICINE_NOT_FOUND");
  }
  res.status(200).json({ success: true, data: medicine });
});

// @route   PUT /api/pharmacy/:id
// @access  Private (admin only)
const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    throw new AppError("Medicine not found", 404, "MEDICINE_NOT_FOUND");
  }

  Object.assign(medicine, req.body);
  await medicine.save();
  await alertAdminsIfLowStock(medicine);

  res.status(200).json({ success: true, data: medicine });
});

// @route   DELETE /api/pharmacy/:id
// @access  Private (admin only)
const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    throw new AppError("Medicine not found", 404, "MEDICINE_NOT_FOUND");
  }

  await medicine.deleteOne();
  res.status(200).json({ success: true, message: "Medicine removed from inventory" });
});

module.exports = { createMedicine, getAllMedicines, getMedicineById, updateMedicine, deleteMedicine };
