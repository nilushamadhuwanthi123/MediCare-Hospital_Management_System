const Joi = require("joi");

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({ "string.pattern.base": "Invalid ID format" });

const createAppointmentSchema = Joi.object({
  patient: objectId.required(),
  doctor: objectId.required(),
  appointmentDate: Joi.date().greater("now").required().messages({
    "date.greater": "Appointment date must be in the future",
    "any.required": "Appointment date is required",
  }),
  timeSlot: Joi.string().required().messages({
    "string.empty": "Time slot is required",
  }),
  reasonForVisit: Joi.string().min(3).max(500).required().messages({
    "string.min": "Please provide a short reason for the visit",
    "string.empty": "Reason for visit is required",
  }),
}).options({ abortEarly: false });

const updateAppointmentSchema = Joi.object({
  appointmentDate: Joi.date().greater("now"),
  timeSlot: Joi.string(),
  reasonForVisit: Joi.string().min(3).max(500),
  status: Joi.string().valid("pending", "confirmed", "completed", "cancelled", "no-show"),
  notes: Joi.string().allow("").max(2000),
  prescribedMedicines: Joi.array().items(
    Joi.object({
      medicineName: Joi.string().required(),
      dosage: Joi.string().required(),
      duration: Joi.string().required(),
    })
  ),
})
  .min(1)
  .options({ abortEarly: false })
  .messages({ "object.min": "At least one field must be provided to update" });

module.exports = { createAppointmentSchema, updateAppointmentSchema };
