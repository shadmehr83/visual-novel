// Stillframe 3 (by Claude): the studio runs from an optimised build instead of the
// development server, which is several times faster and uses about half the memory.
// The build is redone automatically after each code change; refresh the page to load it.
import { build, preview } from "vite";

const port = Number(process.env.PORT || 5174);
const outDir = "dist-v3";
let server;
// The bundled artwork chunks are large by design, so their size warning is left out.
const watcher = await build({ build: { outDir, emptyOutDir: true, watch: {}, chunkSizeWarningLimit: 8192 }, logLevel: "warn" });
watcher.on("event", async (event) => {
  if (event.code === "BUNDLE_END") await event.result?.close();
  if (event.code === "ERROR") console.error("Stillframe 3 build failed:", event.error?.message || event.error);
  if (event.code !== "END") return;
  if (server) return console.log(`Stillframe 3 rebuilt ${new Date().toLocaleTimeString()} — refresh the page to see it.`);
  // --open (used by "Start Stillframe 3.cmd") opens the studio in the browser once it is ready.
  server = await preview({ build: { outDir }, preview: { port, strictPort: true, host: "localhost", open: process.argv.includes("--open") } });
  console.log(`Stillframe 3 is ready at http://localhost:${port}/`);
});
