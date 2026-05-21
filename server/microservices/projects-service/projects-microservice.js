import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";

import { config } from "./config/config.js";
import connectDB from "./config/mongoose.js";
import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";

connectDB();

const app = express();

const allowedOrigins = process.env.CLIENT_ORIGINS
  ? process.env.CLIENT_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "http://localhost:4000"];

const authServiceUrl =
  process.env.AUTH_SERVICE_URL || "http://localhost:4001/graphql";

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs: gql(typeDefs), resolvers }]),
  introspection: true,
});

await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => {
      const cookie = req.headers.cookie || "";
      let user = null;

      try {
        const res = await fetch(authServiceUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            cookie,
          },
          body: JSON.stringify({
            query: `
              query {
                currentUser {
                  id
                  username
                  email
                  role
                }
              }
            `,
          }),
        });

        const json = await res.json();
        user = json?.data?.currentUser || null;
      } catch {
        user = null;
      }

      console.log("📁 Projects verified user:", user);

      return {
        user,
        requireAuth() {
          if (!user) {
            throw new Error("Authentication required");
          }
        },
      };
    },
  }),
);

app.listen(PORT, () => {
  console.log(`🔐 Projects service running on port ${PORT}`);
});
