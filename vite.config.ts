import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) =>
          id.includes("/projects/published.stillframe.json")
            ? "published-story"
            : undefined,
      },
    },
  },
  test: { environment: "jsdom", include: ["src/**/*.test.ts*"] },
});
