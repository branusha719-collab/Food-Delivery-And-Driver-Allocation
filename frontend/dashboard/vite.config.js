import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      port: 5174,
      // In dev, /api is forwarded to the backend so no CORS setup is needed.
      proxy: { "/api": env.VITE_DEV_PROXY_TARGET || "http://localhost:5000" },
    },
    test: { environment: "node", include: ["tests/**/*.test.js"] },
  };
});
