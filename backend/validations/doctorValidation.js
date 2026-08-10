const Joi = require("joi");

const availabilitySchema = Joi.object({
  day: Joi.string()
    .valid("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
    .required(),
  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({ "string.pattern.base": "Start time must be in HH:MM format" }),
  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({ "string.pattern.base": "End time must be in HH:MM format" }),
});

const createDoctorSchema = Joi.object({
  user: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  specialization: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Specialization is required",
  }),
  qualification: Joi.string().min(2).max(200).required().messages({
    "string.empty": "Qualification is required",
  }),
  experienceYears: Joi.number().min(0).max(70).default(0),
  department: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Department is required",
  }),
  consultationFee: Joi.number().min(0).required().messages({
    "number.base": "Consultation fee must be a number",
  }),
  availability: Joi.array().items(availabilitySchema),
  bio: Joi.string().allow("").max(1000),
}).options({ abortEarly: false });

const updateDoctorSchema = Joi.object({
  specialization: Joi.string().min(2).max(100),
  qualification: Joi.string().min(2).max(200),
  experienceYears: Joi.number().min(0).max(70),
  department: Joi.string().min(2).max(100),
  consultationFee: Joi.number().min(0),
  availability: Joi.array().items(availabilitySchema),
  bio: Joi.string().allow("").max(1000),
  isAvailable: Joi.boolean(),
})
  .min(1)
  .options({ abortEarly: false });

module.exports = { createDoctorSchema, updateDoctorSchema };
