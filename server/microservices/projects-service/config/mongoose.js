// import mongoose from "mongoose";
// import { config } from "./config.js"; // Use default import
// //

// const connectDB = async () => {
//   try {
//     if (!config.db) {
//       throw new Error(
//         "MongoDB URI is undefined. Check your environment variables.",
//       );
//     }

//     await mongoose.connect(config.db, {dbName: "projectsServiceDB",});

//     console.log(`✅ Projects Service connected to MongoDB at ${config.db}`);
//   } catch (error) {
//     console.error(
//       "❌ Error connecting to MongoDB (Projects Service):", error.message,);
//     process.exit(1);
//   }
// };
// //
// export default connectDB;

import mongoose from "mongoose";
import { config } from "./config.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.db);
    console.log("🤖 PROJECTS connected to MongoDB");
  } catch (err) {
    console.error("❌ PROJECTS DB connection error:", err.message);
    process.exit(1);
  }
};
export default connectDB;
