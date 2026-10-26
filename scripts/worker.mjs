import { build } from "esbuild";
await build({
  entryPoints: ["functions/worker.ts"],
  outfile: "dist/_worker.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
});
await build({
  entryPoints: ["src/Player.tsx"],
  outfile: "dist/player.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2022",
  minify: true,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
});
