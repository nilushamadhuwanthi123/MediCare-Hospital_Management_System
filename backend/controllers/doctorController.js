const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// @route   POST /api/doctors
// @access  Private (admin only)
const createDoctorProfile = asyncHandler(async (req, res) => {
  const existing = await Doctor.findOne({ user: req.body.user });
  if (existing) {
    throw new AppError("Doctor profile already exists for this user", 400, "DUPLICATE_DOCTOR_PROFILE");
  }

  const doctor = await Doctor.create(req.body);
  res.status(201).json({ success: true, data: doctor });
});

// @route   GET /api/doctors
// @access  Public
// Supports pagination, search-by-name (via user population match is done client-side
// friendly by searching specialization/department), and filters.
const getAllDoctors = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const { department, specialization, search } = req.query;

  const filter = {};
  if (department) filter.department = department;
  if (specialization) filter.specialization = specialization;
  if (search) {
    filter.$or = [
      { specialization: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
    ];
  }

  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .populate("user", "name email phone profileImage")
      .skip((page - 1) * limit)
      .limit(limit),
    Doctor.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: doctors.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    data: doctors,
  });
});

// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate("user", "name email phone profileImage");

  if (!doctor) {
    throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
  }
  res.status(200).json({ success: true, data: doctor });
});

// Splits a doctor's working window for a given day into fixed slots (default 30 min)
// and removes ones that are already booked. This is what powers the "pick a time"
// step of the real-world appointment booking flow.
const buildSlotsForWindow = (startTime, endTime, slotMinutes = 30) => {
  const slots = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let cursor = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (cursor + slotMinutes <= end) {
    const from = cursor;
    const to = cursor + slotMinutes;
    const fmt = (mins) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    slots.push(`${fmt(from)} - ${fmt(to)}`);
    cursor = to;
  }
  return slots;
};

// @route   GET /api/doctors/:id/slots?date=YYYY-MM-DD
// @access  Public
const getDoctorSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) {
    throw new AppError("A date query parameter (YYYY-MM-DD) is required", 400, "MISSING_DATE");
  }

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
  }

  const requestedDate = new Date(date);
  const dayName = requestedDate.toLocaleDateString("en-US", { weekday: "long" });

  const windows = doctor.availability.filter((slot) => slot.day === dayName);
  if (!windows.length || !doctor.isAvailable) {
    return res.status(200).json({ success: true, data: { day: dayName, slots: [] } });
  }

  const allSlots = windows.flatMap((w) => buildSlotsForWindow(w.startTime, w.endTime));

  const dayStart = new Date(requestedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(requestedDate);
  dayEnd.setHours(23, 59, 59, 999);

  const bookedAppointments = await Appointment.find({
    doctor: doctor._id,
    appointmentDate: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ["pending", "confirmed"] },
  }).select("timeSlot");

  const bookedSlots = new Set(bookedAppointments.map((a) => a.timeSlot));
  const availableSlots = allSlots.filter((slot) => !bookedSlots.has(slot));

  res.status(200).json({ success: true, data: { day: dayName, slots: availableSlots, totalSlots: allSlots.length } });
});

// @route   PUT /api/doctors/:id
// @access  Private (admin, or the doctor themselves)
const updateDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
  }

  if (req.user.role === "doctor" && doctor.user.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized to update this profile", 403, "FORBIDDEN");
  }

  Object.assign(doctor, req.body);
  await doctor.save();

  res.status(200).json({ success: true, data: doctor });
});

// @route   DELETE /api/doctors/:id
// @access  Private (admin only)
const deleteDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
  }

  await doctor.deleteOne();
  res.status(200).json({ success: true, message: "Doctor profile removed" });
});

module.exports = {
  createDoctorProfile,
  getAllDoctors,
  getDoctorById,
  getDoctorSlots,
  updateDoctorProfile,
  deleteDoctorProfile,
};
