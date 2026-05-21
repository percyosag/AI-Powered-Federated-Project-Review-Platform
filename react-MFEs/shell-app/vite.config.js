import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

const withRemoteEntry = (url) => {
  const cleanUrl = url.replace(/\/$/, "");
  return `${cleanUrl}/assets/remoteEntry.js`;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const authAppUrl = env.VITE_AUTH_APP_URL || "http://localhost:5174";
  const projectsAppUrl = env.VITE_PROJECTS_APP_URL || "http://localhost:5175";
  const aiReviewAppUrl = env.VITE_AI_REVIEW_APP_URL || "http://localhost:5176";

  return {
    plugins: [
      react(),
      federation({
        name: "shellApp",
        remotes: {
          authApp: withRemoteEntry(authAppUrl),
          projectsApp: withRemoteEntry(projectsAppUrl),
          aiReviewApp: withRemoteEntry(aiReviewAppUrl),
        },
        shared: ["react", "react-dom", "@apollo/client", "graphql"],
      }),
    ],
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});
