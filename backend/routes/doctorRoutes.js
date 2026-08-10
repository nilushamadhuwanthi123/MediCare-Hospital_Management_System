const express = require("express");
const router = express.Router();

const {
  createDoctorProfile,
  getAllDoctors,
  getDoctorById,
  getDoctorSlots,
  updateDoctorProfile,
  deleteDoctorProfile,
} = require("../controllers/doctorController");

const { createDoctorSchema, updateDoctorSchema } = require("../validations/doctorValidation");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(getAllDoctors) // public — patients browse doctors
  .post(protect, authorize("admin"), validate(createDoctorSchema), createDoctorProfile);

router.get("/:id/slots", getDoctorSlots); // public — used by the appointment booking wizard

router
  .route("/:id")
  .get(getDoctorById) // public
  .put(protect, authorize("admin", "doctor"), validate(updateDoctorSchema), updateDoctorProfile)
  .delete(protect, authorize("admin"), deleteDoctorProfile);

module.exports = router;
