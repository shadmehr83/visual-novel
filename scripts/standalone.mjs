import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
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
// Decode locally using the browser's native gzip support. This is lossless and
// keeps the single-file editor below Pages' 25 MiB asset limit as the UI grows.
const packed = gzipSync(js, { level: 9 }).toString("base64");
const loader = `(async()=>{try{if(typeof DecompressionStream!=="function")throw Error("Please use a current Chrome, Edge, Firefox or Safari browser.");const raw=atob(${JSON.stringify(packed)}),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const code=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text();const script=document.createElement("script");script.textContent=code;document.body.appendChild(script);}catch(error){const root=document.getElementById("root");root.setAttribute("role","alert");root.textContent="Could not open the offline editor. "+error.message;}})();`;
const html = `<!doctype html><html lang="en" data-stillframe-standalone="true"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#171a1c"><title>Stillframe — Local Visual Novel Studio</title><style>${css.replace(/<\/style/gi, "<\\/style")}</style></head><body><div id="root">Opening your studio…</div><script type="application/json" id="bundled-player">${JSON.stringify(player).replace(/</g, "\\u003c")}</script><script>${loader}</script></body></html>`;
if (Buffer.byteLength(html) >= 25 * 1024 * 1024)
  throw Error("Standalone editor exceeds Cloudflare's 25 MiB per-file limit.");
await writeFile("dist/stillframe-studio.html", html);
console.log("Built self-contained editor:", Buffer.byteLength(html), "bytes");
