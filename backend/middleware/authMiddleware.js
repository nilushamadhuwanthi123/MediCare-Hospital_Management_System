const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies JWT token and attaches user to req.user
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: "User no longer exists" });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: "Account has been deactivated" });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }
};

// Restricts a route to specific roles. Usage: authorize("admin", "doctor")
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not permitted to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
