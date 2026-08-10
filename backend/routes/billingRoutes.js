const express = require("express");
const router = express.Router();

const {
  createBill,
  getAllBills,
  getBillById,
  downloadInvoicePdf,
  updatePaymentStatus,
} = require("../controllers/billingController");
const { createBillingSchema, updatePaymentSchema } = require("../validations/billingValidation");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, authorize("admin", "receptionist"), validate(createBillingSchema), createBill)
  .get(protect, getAllBills); // access control handled inside the controller — patients get only their own bills

router.get("/:id", protect, getBillById);
router.get("/:id/pdf", protect, downloadInvoicePdf);

router.put(
  "/:id/payment",
  protect,
  authorize("admin", "receptionist"),
  validate(updatePaymentSchema),
  updatePaymentStatus
);

module.exports = router;
