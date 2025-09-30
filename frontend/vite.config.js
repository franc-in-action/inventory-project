// vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5144,
    strictPort: true,
    allowedHosts: ["erp.francisshirima.me"],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setupTests.js",
  },
});
