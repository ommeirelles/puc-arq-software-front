import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import * as path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@types": path.resolve(__dirname, "./src/types.ts"),
      "@src": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 4173,
    host: true,
  },
});
