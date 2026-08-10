const User = require("../models/User");
const Patient = require("../models/Patient");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, gender, address, dateOfBirth } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("User with this email already exists", 400, "EMAIL_TAKEN");
  }

  // Self-registration is only allowed for patients; staff accounts are
  // provisioned by an admin so this can't be used to grant elevated access.
  const safeRole = role === "patient" || !role ? "patient" : "patient";

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: safeRole,
    gender,
    address,
    dateOfBirth,
  });

  if (user.role === "patient") {
    await Patient.create({ user: user._id });
  }

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user,
      token: generateToken(user._id),
    },
  });
});

// @route   POST /api/auth/create-staff
// @access  Private (admin only)
// The only legitimate way to create a doctor/receptionist/admin account —
// public registration can never grant anything above "patient".
const createStaffUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, gender, address, dateOfBirth } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("User with this email already exists", 400, "EMAIL_TAKEN");
  }

  const user = await User.create({ name, email, password, phone, role, gender, address, dateOfBirth });

  res.status(201).json({
    success: true,
    message: `${role} account created successfully`,
    data: { user },
  });
});

// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated. Contact admin.", 403, "ACCOUNT_DEACTIVATED");
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user,
      token: generateToken(user._id),
    },
  });
});

// @route   GET /api/auth/me
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

// @route   PUT /api/auth/me
// @access  Private
// Lets any logged-in user update their own basic profile fields.
const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone", "address", "gender", "dateOfBirth", "profileImage"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

  res.status(200).json({ success: true, data: user });
});

// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    throw new AppError("Provide your current password and a new password of at least 6 characters", 400, "INVALID_PASSWORD_INPUT");
  }

  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(currentPassword))) {
    throw new AppError("Current password is incorrect", 401, "INVALID_CREDENTIALS");
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: "Password updated successfully" });
});

module.exports = { registerUser, createStaffUser, loginUser, getMyProfile, updateMyProfile, changePassword };
