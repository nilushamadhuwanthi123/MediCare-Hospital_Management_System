const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Mongoose will attempt to reconnect automatically.");
    });
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error("Check that MONGO_URI in your .env file is correct and that MongoDB is reachable.");
    process.exit(1);
  }
};

module.exports = connectDB;
