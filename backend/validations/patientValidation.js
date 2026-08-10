const Joi = require("joi");

const updatePatientSchema = Joi.object({
  bloodGroup: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"),
  allergies: Joi.array().items(Joi.string()),
  chronicConditions: Joi.array().items(Joi.string()),
  emergencyContact: Joi.object({
    name: Joi.string().allow(""),
    phone: Joi.string().allow(""),
    relation: Joi.string().allow(""),
  }),
  insuranceProvider: Joi.string().allow(""),
  insuranceNumber: Joi.string().allow(""),
})
  .min(1)
  .options({ abortEarly: false });

const addMedicalHistorySchema = Joi.object({
  condition: Joi.string().min(2).max(200).required().messages({
    "string.empty": "Condition is required",
  }),
  diagnosedDate: Joi.date().max("now"),
  notes: Joi.string().allow("").max(1000),
}).options({ abortEarly: false });

module.exports = { updatePatientSchema, addMedicalHistorySchema };
