import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

//--------------------------------------------------
// Configuration for AI Review Service
//--------------------------------------------------

export const config = {
  // MongoDB for AI review results and metadata
  db: process.env.MONGO_URI,

  // Session secret, shared with auth-related services when needed
  SESSION_SECRET: process.env.SESSION_SECRET || "lab3_secret",

  // Service port
  port: process.env.PORT || process.env.AI_REVIEW_PORT || 5003,
};

//--------------------------------------------------
// Development-only logging
//--------------------------------------------------

if (process.env.NODE_ENV !== "test") {
  console.log("🤖 AI Review Service initialized");
  console.log(`🚀 AI Review Service running on port: ${config.port}`);
}
