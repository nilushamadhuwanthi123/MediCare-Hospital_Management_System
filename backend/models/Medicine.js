const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    genericName: {
      type: String,
      default: "",
    },
    category: {
      type: String, // e.g. "Antibiotic", "Painkiller", "Vitamin"
      required: true,
    },
    manufacturer: {
      type: String,
      default: "",
    },
    batchNumber: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    quantityInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 20, // alert threshold for low stock
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    supplier: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Virtual flag for low stock — used by frontend to show alerts
medicineSchema.virtual("isLowStock").get(function () {
  return this.quantityInStock <= this.reorderLevel;
});

medicineSchema.set("toJSON", { virtuals: true });
medicineSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Medicine", medicineSchema);
