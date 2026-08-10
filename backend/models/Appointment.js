const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String, // e.g. "10:00 - 10:30"
      required: true,
    },
    reasonForVisit: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "", // doctor's notes after consultation
    },
    prescribedMedicines: [
      {
        medicineName: { type: String },
        dosage: { type: String },
        duration: { type: String },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // could be patient themselves, or receptionist booking on their behalf
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent double-booking same doctor at same date+timeSlot
appointmentSchema.index({ doctor: 1, appointmentDate: 1, timeSlot: 1 }, { unique: false });

module.exports = mongoose.model("Appointment", appointmentSchema);
