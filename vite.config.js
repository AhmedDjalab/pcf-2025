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
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  optimizeDeps: {
    exclude: ["web-ifc"],
  },
  define: {
    global: "window", // 👈 polyfill global
  },

  build: {
    target: "es2020",
    assetsInlineLimit: 0, 
  },
  assetsInclude: ["**/*.wasm"], 
});
