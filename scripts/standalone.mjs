import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
const result = await build({
  entryPoints: ["src/main.tsx"],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2022",
  minify: true,
  jsx: "automatic",
  write: false,
  outfile: "studio.js",
  define: {
    "process.env.NODE_ENV": '"production"',
    "import.meta.env.PROD": "false",
  },
});
const js = result.outputFiles.find((f) => f.path.endsWith(".js")).text;
const css = result.outputFiles.find((f) => f.path.endsWith(".css")).text;
const player = await readFile("dist/player.js", "utf8");
const html = `<!doctype html><html lang="en" data-stillframe-standalone="true"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#171a1c"><title>Stillframe — Local Visual Novel Studio</title><style>${css.replace(/<\/style/gi, "<\\/style")}</style></head><body><div id="root"></div><script type="application/json" id="bundled-player">${JSON.stringify(player).replace(/</g, "\\u003c")}</script><script>${js.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;
await writeFile("dist/stillframe-studio.html", html);
console.log("Built self-contained editor:", Buffer.byteLength(html), "bytes");
