import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { buildSubgraphSchema } from "@apollo/subgraph";
import cookieParser from "cookie-parser";
import gql from "graphql-tag";

import { config } from "./config/config.js";
import { connectDB } from "./config/mongoose.js";
import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";

const app = express();
const allowedOrigins = process.env.CLIENT_ORIGINS
  ? process.env.CLIENT_ORIGINS.split(",").map((origin) => origin.trim())
  : [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:4000",
    ];

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

async function startServer() {
  await connectDB();

  const server = new ApolloServer({
    schema: buildSubgraphSchema([
      {
        typeDefs: gql(typeDefs),
        resolvers,
      },
    ]),
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        req,
        res,
      }),
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "ai-review-service",
      port: config.port,
    });
  });

  app.listen(config.port, () => {
    console.log(`🤖 AI Review GraphQL running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start AI Review Service:", err);
  process.exit(1);
});
