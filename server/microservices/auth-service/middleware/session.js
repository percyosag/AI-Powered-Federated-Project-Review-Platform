import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import session from "express-session";
import MongoStore from "connect-mongo";

export const sessionMiddleware = session({
  name: "sid",
  secret: process.env.SESSION_SECRET || "best_test_secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl:
      process.env.MONGO_URI || "mongodb://localhost:27017/authServiceDB",
    collectionName: "sessions",
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24,
  },
});
