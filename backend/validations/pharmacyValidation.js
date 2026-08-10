const Joi = require("joi");

const createMedicineSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    "string.empty": "Medicine name is required",
  }),
  genericName: Joi.string().allow("").max(150),
  category: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Category is required",
  }),
  manufacturer: Joi.string().allow("").max(150),
  batchNumber: Joi.string().required().messages({
    "string.empty": "Batch number is required",
  }),
  unitPrice: Joi.number().min(0).required().messages({
    "number.base": "Unit price must be a number",
  }),
  quantityInStock: Joi.number().min(0).required().messages({
    "number.base": "Quantity in stock must be a number",
  }),
  reorderLevel: Joi.number().min(0).default(20),
  expiryDate: Joi.date().greater("now").required().messages({
    "date.greater": "Expiry date must be in the future",
  }),
  supplier: Joi.string().allow("").max(150),
}).options({ abortEarly: false });

const updateMedicineSchema = Joi.object({
  name: Joi.string().min(2).max(150),
  genericName: Joi.string().allow("").max(150),
  category: Joi.string().min(2).max(100),
  manufacturer: Joi.string().allow("").max(150),
  batchNumber: Joi.string(),
  unitPrice: Joi.number().min(0),
  quantityInStock: Joi.number().min(0),
  reorderLevel: Joi.number().min(0),
  expiryDate: Joi.date().greater("now"),
  supplier: Joi.string().allow("").max(150),
})
  .min(1)
  .options({ abortEarly: false });

module.exports = { createMedicineSchema, updateMedicineSchema };
