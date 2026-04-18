import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import {
  ApolloGateway,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} from "@apollo/gateway";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:3000", // 🚨 ADDED: Shell App
      "http://localhost:3001", // ADDED: Projects App (just in case)
      "http://localhost:3002", // ADDED: AI Review App (just in case)
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:4001",
      "http://localhost:4002",
      "http://localhost:4000",
    ],
    credentials: true,
  }),
);

class CookieForwardingDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    if (context.cookie) {
      request.http.headers.set("cookie", context.cookie);
    }
  }

  didReceiveResponse({ response, context }) {
    const setCookie = response.http.headers.get("set-cookie");
    if (setCookie && context?.res) {
      context.res.setHeader("set-cookie", setCookie);
    }
    return response;
  }
}

// const gateway = new ApolloGateway({
//   supergraphSdl: new IntrospectAndCompose({
//     subgraphs: [
//       {
//         name: "auth",
//         url: `http://localhost:${process.env.AUTH_PORT || 4001}/graphql`,
//       },
//       {
//         name: "projects",
//         url: `http://localhost:${process.env.PROJECTS_PORT || 4002}/graphql`,
//       },
//     ],
//   }),
//   buildService({ url }) {
//     return new CookieForwardingDataSource({ url });
//   },
// });

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      {
        name: "auth",
        url: `http://localhost:${process.env.AUTH_PORT || 4001}/graphql`,
      },
      {
        name: "projects",
        url: `http://localhost:${process.env.PROJECTS_PORT || 4002}/graphql`,
      },
      {
        name: "aiReview",
        url: `http://localhost:${process.env.AI_REVIEW_PORT || 5003}/graphql`,
      },
    ],
  }),
  buildService({ url }) {
    return new CookieForwardingDataSource({ url });
  },
});
const server = new ApolloServer({
  gateway,
  introspection: true,
});

await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req, res }) => ({
      cookie: req.headers.cookie || "",
      req,
      res,
    }),
  }),
);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Gateway running at http://localhost:${PORT}/graphql`);
});
