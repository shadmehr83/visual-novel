import { publishedDataPlugin } from "./scripts/published-data-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [publishedDataPlugin(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) =>
          id.startsWith("\0virtual:published-media-") ? id.slice(1).replace(":", "-") : undefined,
      },
    },
  },
  test: { environment: "jsdom", include: ["src/**/*.test.ts*"] },
});
