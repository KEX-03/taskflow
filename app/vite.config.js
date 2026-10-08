import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Matches the backend's default FRONTEND_ORIGIN (http://localhost:3000)
    port: 3000,
    // Fail instead of silently moving to another port (which CORS would block)
    strictPort: true,
  },
});
