const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema({
  description: { type: String, required: true }, // e.g. "Consultation Fee", "X-Ray", "Medicine"
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

const billingSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    items: [billItemSchema],
    subTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "insurance", "bank-transfer", "online"],
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Billing", billingSchema);
