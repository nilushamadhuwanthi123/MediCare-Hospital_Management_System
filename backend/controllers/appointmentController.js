const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { notify } = require("../utils/notify");

// @route   POST /api/appointments
// @access  Private (patient, receptionist, admin)
const createAppointment = asyncHandler(async (req, res) => {
  const { doctor, appointmentDate, timeSlot } = req.body;

  const doctorExists = await Doctor.findById(doctor).populate("user", "name");
  if (!doctorExists) {
    throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
  }
  if (!doctorExists.isAvailable) {
    throw new AppError("This doctor is currently not accepting appointments", 400, "DOCTOR_UNAVAILABLE");
  }

  // Prevent double-booking the same doctor at the same date + time slot
  const clash = await Appointment.findOne({
    doctor,
    appointmentDate,
    timeSlot,
    status: { $in: ["pending", "confirmed"] },
  });

  if (clash) {
    throw new AppError(
      "This time slot is already booked for the selected doctor. Please choose another slot.",
      409,
      "SLOT_TAKEN"
    );
  }

  const appointment = await Appointment.create({ ...req.body, createdBy: req.user._id });
  await appointment.populate({ path: "patient", populate: { path: "user", select: "name" } });

  // Notify the doctor that a new appointment landed on their schedule
  await notify({
    recipient: doctorExists.user._id,
    title: "New appointment booked",
    message: `${appointment.patient?.user?.name || "A patient"} booked ${appointment.timeSlot} on ${new Date(
      appointment.appointmentDate
    ).toLocaleDateString()}.`,
    type: "appointment",
    link: "/doctor/appointments",
  });

  res.status(201).json({ success: true, data: appointment });
});

// @route   GET /api/appointments
// @access  Private — filtered by role, supports pagination/search/status/date filters
const getAppointments = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 200);
  const { status, from, to } = req.query;

  let filter = {};

  if (req.user.role === "patient") {
    const patientProfile = await Patient.findOne({ user: req.user._id });
    filter.patient = patientProfile?._id;
  } else if (req.user.role === "doctor") {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    filter.doctor = doctorProfile?._id;
  }
  // admin & receptionist see everything (no base filter)

  if (status) filter.status = status;
  if (from || to) {
    filter.appointmentDate = {};
    if (from) filter.appointmentDate.$gte = new Date(from);
    if (to) filter.appointmentDate.$lte = new Date(to);
  }

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate({ path: "patient", populate: { path: "user", select: "name phone" } })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .sort({ appointmentDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Appointment.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: appointments.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    data: appointments,
  });
});

// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({ path: "patient", populate: { path: "user", select: "name phone" } })
    .populate({ path: "doctor", populate: { path: "user", select: "name" } });

  if (!appointment) {
    throw new AppError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND");
  }

  res.status(200).json({ success: true, data: appointment });
});

// @route   PUT /api/appointments/:id
// @access  Private (admin, receptionist, doctor)
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate({
    path: "patient",
    populate: { path: "user", select: "name" },
  });

  if (!appointment) {
    throw new AppError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND");
  }

  if (req.body.appointmentDate || req.body.timeSlot) {
    const newDate = req.body.appointmentDate || appointment.appointmentDate;
    const newSlot = req.body.timeSlot || appointment.timeSlot;

    const clash = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor,
      appointmentDate: newDate,
      timeSlot: newSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (clash) {
      throw new AppError("New time slot is already booked", 409, "SLOT_TAKEN");
    }
  }

  const previousStatus = appointment.status;
  Object.assign(appointment, req.body);
  await appointment.save();

  if (req.body.status && req.body.status !== previousStatus && appointment.patient?.user) {
    await notify({
      recipient: appointment.patient.user._id,
      title: "Appointment update",
      message: `Your appointment on ${new Date(appointment.appointmentDate).toLocaleDateString()} is now ${appointment.status}.`,
      type: "appointment",
      link: "/patient/appointments",
    });
  }

  res.status(200).json({ success: true, data: appointment });
});

// @route   DELETE /api/appointments/:id
// @access  Private (admin, receptionist)
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate({
    path: "patient",
    populate: { path: "user", select: "name" },
  });

  if (!appointment) {
    throw new AppError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND");
  }

  appointment.status = "cancelled";
  await appointment.save();

  if (appointment.patient?.user) {
    await notify({
      recipient: appointment.patient.user._id,
      title: "Appointment cancelled",
      message: `Your appointment on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.timeSlot} was cancelled.`,
      type: "appointment",
      link: "/patient/appointments",
    });
  }

  res.status(200).json({ success: true, message: "Appointment cancelled", data: appointment });
});

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
};
