import { readdir, writeFile } from "node:fs/promises";
const assets = (await readdir("dist/assets"))
  .filter((f) => !f.endsWith(".map"))
  .map((f) => "/assets/" + f);
const version = "stillframe-" + Date.now();
const media = (await readdir('dist/media/insta')).filter(f => /\.(mp4|jpg)$/.test(f)).map(f => '/media/insta/' + f + (f.endsWith('.mp4')?'?v=2.12.0':''));
await writeFile(
  "dist/sw.js",
  `const CACHE=${JSON.stringify(version)};const FILES=${JSON.stringify(["/", "/player.js", "/stillframe-studio.html", ...assets, ...media])};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('stillframe-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(new URL(e.request.url).pathname.startsWith('/api/'))return;if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request,{ignoreVary:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('/'):Response.error()))));});`,
);
