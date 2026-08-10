const mongoose = require("mongoose");

// A tiny generic counter collection used to hand out atomic, race-condition-free
// sequence numbers (e.g. invoice numbers) even when multiple requests hit the
// server at the same time. Using Billing.countDocuments() for this (as a naive
// implementation would) is unsafe under concurrency — two simultaneous requests
// can read the same count and generate a duplicate invoice number.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "invoiceNumber"
  seq: { type: Number, default: 0 },
});

counterSchema.statics.getNextSequence = async function (name) {
  const counter = await this.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

module.exports = mongoose.model("Counter", counterSchema);
