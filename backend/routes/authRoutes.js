const express = require("express");
const router = express.Router();

const {
  registerUser,
  createStaffUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require("../controllers/authController");
const {
  registerSchema,
  loginSchema,
  createStaffSchema,
  changePasswordSchema,
  updateProfileSchema,
} = require("../validations/authValidation");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiters");

router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/create-staff", protect, authorize("admin"), validate(createStaffSchema), createStaffUser);

router.get("/me", protect, getMyProfile);
router.put("/me", protect, validate(updateProfileSchema), updateMyProfile);
router.put("/change-password", protect, validate(changePasswordSchema), changePassword);

module.exports = router;
