import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/leads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/run": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/timeline": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/outputs": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/reset": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
