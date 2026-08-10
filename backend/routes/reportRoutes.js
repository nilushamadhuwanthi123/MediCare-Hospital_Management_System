const express = require("express");
const router = express.Router();

const {
  getDashboardSummary,
  getPatientSummary,
  exportPatientsCsv,
  exportBillingCsv,
  exportAppointmentsCsv,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/dashboard-summary", protect, authorize("admin", "receptionist", "doctor"), getDashboardSummary);
router.get("/patient-summary", protect, authorize("patient"), getPatientSummary);

router.get("/export/patients", protect, authorize("admin", "receptionist"), exportPatientsCsv);
router.get("/export/billing", protect, authorize("admin", "receptionist"), exportBillingCsv);
router.get("/export/appointments", protect, authorize("admin", "receptionist"), exportAppointmentsCsv);

module.exports = router;
