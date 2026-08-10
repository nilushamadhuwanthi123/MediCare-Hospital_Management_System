const express = require("express");
const router = express.Router();

const {
  getAllPatients,
  getPatientById,
  updatePatient,
  addMedicalHistory,
} = require("../controllers/patientController");

const { updatePatientSchema, addMedicalHistorySchema } = require("../validations/patientValidation");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, authorize("admin", "doctor", "receptionist"), getAllPatients);

router
  .route("/:id")
  .get(protect, getPatientById) // role check for "own record" handled inside controller
  .put(protect, validate(updatePatientSchema), updatePatient);

router.post(
  "/:id/medical-history",
  protect,
  authorize("admin", "doctor"),
  validate(addMedicalHistorySchema),
  addMedicalHistory
);

module.exports = router;
