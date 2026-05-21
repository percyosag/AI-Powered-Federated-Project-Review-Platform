import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { expressMiddleware } from "@as-integrations/express5";

import { connectDB } from "./config/db.js";
import { sessionMiddleware } from "./middleware/session.js";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import User from "./models/user.js";

const app = express();
const allowedOrigins = process.env.CLIENT_ORIGINS
  ? process.env.CLIENT_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "http://localhost:4000"];

const PORT = process.env.PORT || process.env.AUTH_PORT || 4001;

await connectDB();

const server = new ApolloServer({
  schema: buildSubgraphSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
  introspection: true,
});

await server.start();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Auth service is running");
});

app.use(
  "/graphql",
  sessionMiddleware,
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      let user = null;

      try {
        if (req.session?.userId) {
          user = await User.findById(req.session.userId);
        }
      } catch (error) {
        console.error("Context user load error:", error.message);
      }

      return { req, res, user };
    },
  }),
);

app.listen(PORT, () => {
  console.log(`🤖 Auth GraphQL running on port ${config.port}`);
});
