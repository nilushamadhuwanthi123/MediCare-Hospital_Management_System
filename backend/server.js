const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const requestId = require("./middleware/requestId");
const sanitize = require("./middleware/sanitize");
const { apiLimiter } = require("./middleware/rateLimiters");

dotenv.config();

const app = express();

// --- Core middleware ---------------------------------------------------
app.use(requestId);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : "*",
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(sanitize);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
}

// Basic rate limiting to prevent brute-force / abuse (auth routes have their own, stricter limit)
app.use("/api", apiLimiter);

// --- Health checks -------------------------------------------------------
app.get("/", (req, res) => {
  res.json({ success: true, message: "MediCare Hospital Management System API is running" });
});

app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    success: true,
    uptimeSeconds: Math.round(process.uptime()),
    database: dbStates[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// --- Routes ----------------------------------------------------------------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/patients", require("./routes/patientRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/billing", require("./routes/billingRoutes"));
app.use("/api/pharmacy", require("./routes/pharmacyRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;

const start = async () => {
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`MediCare HMS API running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
};

// Only auto-start when this file is run directly (not when imported by tests)
if (require.main === module) {
  start();
}

// --- Resilience: never let one bad promise/exception silently kill the process
// without at least logging it, and shut down cleanly on deploy restarts. ---
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

module.exports = app;
