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
const compressed = gzipSync(payload, { level: 9, memLevel: 9 });
const packed = encode85(compressed);
const loader = `(async()=>{try{if(typeof DecompressionStream!=="function")throw Error("Please use a current Chrome, Edge, Firefox or Safari browser.");const bytes=(${decode85.toString()})(${JSON.stringify(packed)},${JSON.stringify(alphabet85)},${compressed.length});const code=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text();const script=document.createElement("script");script.textContent=code;document.body.appendChild(script);}catch(error){const root=document.getElementById("root");root.setAttribute("role","alert");root.textContent="Could not open the offline editor. "+error.message;}})();`;
const html = `<!doctype html><html lang="en" data-stillframe-standalone="true"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#171a1c"><title>Stillframe — Local Visual Novel Studio</title><style>${css.replace(/<\/style/gi, "<\\/style")}</style></head><body><div id="root">Opening your studio…</div><script>${loader}</script></body></html>`;
await writeFile("downloads/stillframe-studio.html", html);
const delivery = gzipSync(html, {level:9});
if(delivery.length >= 25*1024*1024)throw Error("Compressed offline editor exceeds the Pages asset limit.");
await writeFile("dist/stillframe-studio.html.gz",delivery);
console.log("Built complete single-file editor:",Buffer.byteLength(html),"bytes; compressed download:",delivery.length,"bytes");

await writeFile("dist/stillframe-studio.html", `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Download Stillframe editor</title><body style="font:18px system-ui;padding:30px;background:#201c28;color:#eee"><h1>Stillframe local editor</h1><p>Your complete studio includes the artwork, music and offline player.</p><button id="download">Download single-file editor</button><p id="status"></p><script>document.getElementById('download').onclick=async()=>{try{const r=await fetch('/stillframe-studio.html.gz');if(!r.ok)throw Error('Please retry after the deployment finishes.');const b=new Uint8Array(await r.arrayBuffer());const html=b[0]===31&&b[1]===139?await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text():new TextDecoder().decode(b);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download='stillframe-studio.html';a.click();document.getElementById('status').textContent='Open the downloaded HTML file to use your studio offline.';}catch(e){document.getElementById('status').textContent=e.message;}};</script>`);
