const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
} = require("../controllers/appointmentController");

const { createAppointmentSchema, updateAppointmentSchema } = require("../validations/appointmentValidation");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, authorize("patient", "receptionist", "admin"), validate(createAppointmentSchema), createAppointment)
  .get(protect, getAppointments);

router
  .route("/:id")
  .get(protect, getAppointmentById)
  .put(protect, authorize("admin", "receptionist", "doctor"), validate(updateAppointmentSchema), updateAppointment)
  .delete(protect, authorize("admin", "receptionist"), cancelAppointment);

module.exports = router;
