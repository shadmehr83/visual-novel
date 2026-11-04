import { publishedDataPlugin } from "./scripts/published-data-plugin";
import { claudeLocalPlugin } from "./scripts/claude-local-plugin";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
// Local Stillframe 3 (by Claude): `npm run stillframe3` builds in "stillframe3" mode, which marks the
// studio page so it opens in the Stillframe 3 design and skips the offline cache. Same code as hosted.
const stillframe3Page = (mode: string): Plugin => ({
  name: "stillframe3-page",
  transformIndexHtml: (html, ctx) =>
    mode === "stillframe3" && ctx.path === "/index.html"
      ? html.replace('<html lang="en">', '<html lang="en" data-sf3>').replace("<title>Stillframe —", "<title>Stillframe 3 —").replace('content="#171a1c"', 'content="#f4f3ef"')
      : html,
});
export default defineConfig(({ mode }) => ({
  plugins: [publishedDataPlugin(), claudeLocalPlugin(), react(), stillframe3Page(mode)],
  build: {
    rollupOptions: {
      // play.html is the shareable game-only page; it never loads the editor.
      input: { main: "index.html", play: "play.html", admin: "admin.html" },
      output: {
        manualChunks: (id: string) =>
          id.startsWith("\0virtual:published-media-") ? id.slice(1).replace(":", "-") : undefined,
      },
    },
  },
  test: { environment: "jsdom", include: ["src/**/*.test.ts*"] },
}));
