import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { alphabet85, encode85, decode85 } from "./base85.mjs";
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
// The single-file editor embeds smaller copies of the same 24-second clips.
// The web editor serves the full 360×640 versions as separate cacheable assets.
const media = {};
for (const name of ['rain-walk', 'tea-and-pages', 'midnight-monitor', 'last-tram']) {
  media[`/media/insta/${name}.mp4`] = 'data:video/mp4;base64,' + (await readFile(`public/media/insta/compact/${name}.mp4`)).toString('base64');
  media[`/media/insta/${name}.jpg`] = 'data:image/jpeg;base64,' + (await readFile(`public/media/insta/${name}.jpg`)).toString('base64');
}
// Decode locally using the browser's native gzip support. This is lossless and
// keeps the single-file editor below Pages' 25 MiB asset limit as the UI grows.
const payload = `window.__stillframeFeedMedia=${JSON.stringify(media)};const player=document.createElement('script');player.type='application/json';player.id='bundled-player';player.textContent=${JSON.stringify(JSON.stringify(player))};document.body.appendChild(player);\n${js}`;
const compressed = gzipSync(payload, { level: 9 });
const packed = encode85(compressed);
const loader = `(async()=>{try{if(typeof DecompressionStream!=="function")throw Error("Please use a current Chrome, Edge, Firefox or Safari browser.");const bytes=(${decode85.toString()})(${JSON.stringify(packed)},${JSON.stringify(alphabet85)},${compressed.length});const code=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text();const script=document.createElement("script");script.textContent=code;document.body.appendChild(script);}catch(error){const root=document.getElementById("root");root.setAttribute("role","alert");root.textContent="Could not open the offline editor. "+error.message;}})();`;
const html = `<!doctype html><html lang="en" data-stillframe-standalone="true"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#171a1c"><title>Stillframe — Local Visual Novel Studio</title><style>${css.replace(/<\/style/gi, "<\\/style")}</style></head><body><div id="root">Opening your studio…</div><script>${loader}</script></body></html>`;
if (Buffer.byteLength(html) >= 25 * 1024 * 1024)
  throw Error(`Standalone editor exceeds Cloudflare's 25 MiB per-file limit: ${Buffer.byteLength(html)} bytes.`);
await writeFile("dist/stillframe-studio.html", html);
console.log("Built self-contained editor:", Buffer.byteLength(html), "bytes");
