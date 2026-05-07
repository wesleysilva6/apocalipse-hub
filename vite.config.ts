import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  },
  server: {
    port: 5173,
    host: "0.0.0.0"
  },
  preview: {
    port: 5173,
    host: "0.0.0.0"
  }
});
