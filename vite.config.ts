import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    cors: true,
    allowedHosts: [
      'a17a93fb-2a99-4aeb-a9d6-8623996352b4-00-2sbuhlm6da7pp.janeway.replit.dev'
    ],
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
