import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true, // Ensure proper handling of routes in dev mode
  },
  build: {
    outDir: 'dist',
  },
});