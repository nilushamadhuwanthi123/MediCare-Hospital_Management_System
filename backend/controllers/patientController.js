const Patient = require("../models/Patient");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { notify } = require("../utils/notify");

// @route   GET /api/patients
// @access  Private (admin, doctor, receptionist)
// Supports pagination + search by name/email (via a lightweight $lookup-free approach:
// we search on the populated user after fetching, which is fine at hospital-scale data volumes).
const getAllPatients = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 200);
  const { search } = req.query;

  let query = Patient.find().populate("user", "name email phone gender dateOfBirth");

  if (search) {
    const User = require("../models/User");
    const matchingUsers = await User.find({
      role: "patient",
      $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
    }).select("_id");
    query = Patient.find({ user: { $in: matchingUsers.map((u) => u._id) } }).populate(
      "user",
      "name email phone gender dateOfBirth"
    );
  }

  const total = await Patient.countDocuments(query.getFilter());
  const patients = await query
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: patients.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    data: patients,
  });
});

// @route   GET /api/patients/:id
// @access  Private (admin, doctor, receptionist, or the patient themselves)
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate(
    "user",
    "name email phone gender dateOfBirth address"
  );

  if (!patient) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }

  if (req.user.role === "patient" && patient.user._id.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized to view this record", 403, "FORBIDDEN");
  }

  res.status(200).json({ success: true, data: patient });
});

// @route   PUT /api/patients/:id
// @access  Private (admin, doctor, or the patient themselves)
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }

  if (req.user.role === "patient" && patient.user.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized to update this record", 403, "FORBIDDEN");
  }

  Object.assign(patient, req.body);
  await patient.save();

  res.status(200).json({ success: true, data: patient });
});

// @route   POST /api/patients/:id/medical-history
// @access  Private (admin, doctor only)
const addMedicalHistory = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate("user", "name");

  if (!patient) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }

  patient.medicalHistory.push({ ...req.body, addedBy: req.user._id });
  await patient.save();

  await notify({
    recipient: patient.user._id,
    title: "Medical record updated",
    message: `A new entry (${req.body.condition}) was added to your medical history.`,
    type: "medical-record",
    link: "/patient/records",
  });

  res.status(201).json({ success: true, data: patient });
});

module.exports = { getAllPatients, getPatientById, updatePatient, addMedicalHistory };
