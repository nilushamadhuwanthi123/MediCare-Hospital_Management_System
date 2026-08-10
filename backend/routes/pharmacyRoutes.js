const express = require("express");
const router = express.Router();

const {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/pharmacyController");

const { createMedicineSchema, updateMedicineSchema } = require("../validations/pharmacyValidation");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, authorize("admin"), validate(createMedicineSchema), createMedicine)
  .get(protect, authorize("admin", "doctor", "receptionist"), getAllMedicines);

router
  .route("/:id")
  .get(protect, authorize("admin", "doctor", "receptionist"), getMedicineById)
  .put(protect, authorize("admin"), validate(updateMedicineSchema), updateMedicine)
  .delete(protect, authorize("admin"), deleteMedicine);

module.exports = router;
