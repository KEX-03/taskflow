const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌  MONGO_URI is not defined in .env");
    process.exit(1);
  }
  try {
    console.log("⏳  Connecting to MongoDB...");
    // Give up after 10s instead of Mongoose's default 30s, so a wrong URI fails fast
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌  MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
