// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:3443",
        changeOrigin: true,
        secure: false, // accept self-signed cert in dev
        // no rewrite!
      },
    },
  },
});
