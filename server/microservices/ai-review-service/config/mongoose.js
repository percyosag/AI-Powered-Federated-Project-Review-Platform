import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.db);
    console.log("🤖 AI Review connected to MongoDB");
  } catch (err) {
    console.error("❌ AI Review DB connection error:", err.message);
    process.exit(1);
  }
};
