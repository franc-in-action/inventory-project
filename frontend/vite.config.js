// vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5144,
  },
  test: {
    globals: true, // ✅ allows using `test()` and `expect()` like in Jest
    environment: "jsdom", // ✅ simulates browser environment
    setupFiles: "./tests/setupTests.js", // optional, if you have test setup
  },
});
