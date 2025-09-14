import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      src: path.resolve(__dirname, "./src"), // keep CRA-style "src/..."
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  define: {
    global: "window", // 👈 polyfill global
  },
});
