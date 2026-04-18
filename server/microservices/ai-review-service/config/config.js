import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

//--------------------------------------------------
// Configuration for AI Review Service (2026)
//--------------------------------------------------

export const config = {
  // MongoDB (same DB as others, different collection)
  db: process.env.MONGO_URI,

  // Session secret (same pattern as other services)
  SESSION_SECRET: process.env.SESSION_SECRET || "lab3_secret",

  // Service port (NEW)
  port: process.env.AI_REVIEW_PORT || 5003,
};

//--------------------------------------------------
// Development-only logging
//--------------------------------------------------

if (process.env.NODE_ENV !== "ai-review") {
  console.log("🤖 AI Review Service initialized");
  console.log(`🚀 AI Review Service running on port: ${config.port}`);
}
