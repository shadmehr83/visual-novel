import { publishedDataPlugin } from "./scripts/published-data-plugin";
import { claudeLocalPlugin } from "./scripts/claude-local-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [publishedDataPlugin(), claudeLocalPlugin(), react()],
  build: {
    rollupOptions: {
      // play.html is the shareable game-only page; it never loads the editor.
      input: { main: "index.html", play: "play.html" },
      output: {
        manualChunks: (id: string) =>
          id.startsWith("\0virtual:published-media-") ? id.slice(1).replace(":", "-") : undefined,
      },
    },
  },
  test: { environment: "jsdom", include: ["src/**/*.test.ts*"] },
});
