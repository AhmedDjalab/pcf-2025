import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command }) => {
  if (command === "serve") {
    // Development config
    return {
      plugins: [react()],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "src"),
          src: path.resolve(__dirname, "./src"),
        },
      },
      server: {
        port: 3000,
        open: true,
      },
      define: {
        global: "window",
      },
    };
  } else {
    // Production / build config
    return {
      plugins: [react()],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "src"),
          src: path.resolve(__dirname, "./src"),
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
        global: "window",
      },
      build: {
        target: "es2020",
        assetsInlineLimit: 0,
      },
      assetsInclude: ["**/*.wasm"],
    };
  }
});
