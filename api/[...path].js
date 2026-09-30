/**
 * Vercel serverless entry for the MediCare HMS API.
 *
 * Wraps the existing Express app so it runs as a serverless function.
 * MongoDB connection is cached per warm instance to avoid exhausting
 * the Atlas connection limit.
 */
const mongoose = require('mongoose');

// Load env before anything that reads process.env
require('dotenv').config();

const app = require('../backend/server');

let connecting = null;

function connectOnce() {
  if (!connecting) {
    connecting = (async () => {
      if (mongoose.connection.readyState === 1) return;
      mongoose.set('strictQuery', true);
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 5,
      });
    })().catch((err) => {
      connecting = null;
      throw err;
    });
  }
  return connecting;
}

module.exports = async function handler(req, res) {
  try {
    await connectOnce();
  } catch (err) {
    console.error('[medicare] Mongo connection failed:', err.message);
    res.status(503).json({
      success: false,
      message: 'The database is not reachable right now. Please try again in a moment.',
    });
    return;
  }

  return app(req, res);
};
