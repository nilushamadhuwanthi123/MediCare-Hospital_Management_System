const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true,
  },
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true }, // e.g. "17:00"
});

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    department: {
      type: String,
      required: true,
    },
    consultationFee: {
      type: Number,
      required: true,
      default: 0,
    },
    availability: [availabilitySchema],
    bio: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
