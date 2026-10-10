import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  base: process.env.GITHUB_ACTIONS === "true" ? "/LUCKYVOID/" : "/",
  plugins: [react(), tailwindcss()],
  server: { host: "0.0.0.0", port: 5173, strictPort: true, allowedHosts: [".app.github.dev", ".githubpreview.dev"] },
  preview: {host: "0.0.0.0", allowedHosts: [".app.github.dev", ".githubpreview.dev"]},
  test: { environment: "node", include: ["src/**/*.test.ts"] },
} as Parameters<typeof defineConfig>[0]);
