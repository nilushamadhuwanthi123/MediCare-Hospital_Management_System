const mongoose = require("mongoose");

const medicalHistoryEntrySchema = new mongoose.Schema(
  {
    condition: { type: String, required: true },
    diagnosedDate: { type: Date },
    notes: { type: String, default: "" },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // doctor or admin who added this entry
    },
  },
  { timestamps: true }
);

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      default: "Unknown",
    },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    medicalHistory: [medicalHistoryEntrySchema],
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relation: { type: String, default: "" },
    },
    insuranceProvider: {
      type: String,
      default: "",
    },
    insuranceNumber: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
