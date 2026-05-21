import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

//--------------------------------------------------
// Configuration for projects-service
// Session-based authentication through auth-service
//--------------------------------------------------

export const config = {
  // MongoDB for projects, feature requests, and drafts
  db: process.env.MONGO_URI,

  // Session secret, shared with auth-related services when needed
  SESSION_SECRET: process.env.SESSION_SECRET || "lab3_secret",

  // Service port
  port: process.env.PORT || process.env.PROJECTS_PORT || 4002,
};

//--------------------------------------------------
// Development-only logging
//--------------------------------------------------

if (process.env.NODE_ENV !== "test") {
  console.log("🔐 Projects Service using session-based authentication");
  console.log(`🚀 Projects Microservice running on port: ${config.port}`);
}
