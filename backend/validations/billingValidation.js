const Joi = require("joi");

const billItemSchema = Joi.object({
  description: Joi.string().required(),
  quantity: Joi.number().min(1).default(1),
  unitPrice: Joi.number().min(0).required(),
  total: Joi.number().min(0).required(),
});

const createBillingSchema = Joi.object({
  patient: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  appointment: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  items: Joi.array().items(billItemSchema).min(1).required().messages({
    "array.min": "At least one bill item is required",
  }),
  discount: Joi.number().min(0).default(0),
  tax: Joi.number().min(0).default(0),
  paymentMethod: Joi.string().valid("cash", "card", "insurance", "bank-transfer", "online"),
}).options({ abortEarly: false });

const updatePaymentSchema = Joi.object({
  paymentStatus: Joi.string().valid("unpaid", "partial", "paid", "refunded").required(),
  amountPaid: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid("cash", "card", "insurance", "bank-transfer", "online").required(),
}).options({ abortEarly: false });

module.exports = { createBillingSchema, updatePaymentSchema };
