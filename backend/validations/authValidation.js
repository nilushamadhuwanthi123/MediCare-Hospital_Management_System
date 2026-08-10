const Joi = require("joi");

// Used when a new user registers (any role)
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp("^(?=.*[a-zA-Z])(?=.*[0-9]).+$"))
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "string.pattern.base": "Password must contain at least one letter and one number",
      "string.empty": "Password is required",
    }),
  phone: Joi.string()
    .pattern(new RegExp("^[0-9+\\-\\s]{7,15}$"))
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
      "string.empty": "Phone number is required",
    }),
  // NOTE: `role` is intentionally NOT accepted here for privilege-escalation safety —
  // public self-registration always creates a "patient" account. Staff accounts
  // (doctor/receptionist/admin) are provisioned separately via createStaffSchema,
  // which is only reachable through an admin-protected route.
  gender: Joi.string().valid("male", "female", "other"),
  address: Joi.string().allow("").max(300),
  dateOfBirth: Joi.date().less("now").messages({
    "date.less": "Date of birth must be in the past",
  }),
}).options({ abortEarly: false });

// Used for login
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
}).options({ abortEarly: false });

// Used by an admin to provision a staff account (doctor / receptionist / admin)
const createStaffSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp("^(?=.*[a-zA-Z])(?=.*[0-9]).+$"))
    .required()
    .messages({
      "string.pattern.base": "Password must contain at least one letter and one number",
    }),
  phone: Joi.string()
    .pattern(new RegExp("^[0-9+\\-\\s]{7,15}$"))
    .required(),
  role: Joi.string().valid("admin", "doctor", "receptionist").required(),
  gender: Joi.string().valid("male", "female", "other"),
  address: Joi.string().allow("").max(300),
  dateOfBirth: Joi.date().less("now"),
}).options({ abortEarly: false });

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(6)
    .pattern(new RegExp("^(?=.*[a-zA-Z])(?=.*[0-9]).+$"))
    .required()
    .messages({ "string.pattern.base": "Password must contain at least one letter and one number" }),
}).options({ abortEarly: false });

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  phone: Joi.string().pattern(new RegExp("^[0-9+\\-\\s]{7,15}$")),
  address: Joi.string().allow("").max(300),
  gender: Joi.string().valid("male", "female", "other"),
  dateOfBirth: Joi.date().less("now"),
  profileImage: Joi.string().allow("").max(1000),
}).options({ abortEarly: false });

module.exports = { registerSchema, loginSchema, createStaffSchema, changePasswordSchema, updateProfileSchema };
