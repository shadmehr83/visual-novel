// Saves the browser-rendered Insta clip (scripts/insta/render.html) into public/media/insta/.
// Local only: listens on 127.0.0.1 and accepts the two known file names.
import { createServer } from "node:http";
import { writeFile, mkdir } from "node:fs/promises";
const allowed = new Set(["harbour-lights.mp4", "harbour-lights.jpg"]);
createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  const name = new URL(req.url, "http://x").searchParams.get("name");
  if (req.method !== "POST" || !allowed.has(name)) { res.statusCode = 400; return res.end("unknown file"); }
  const parts = [];
  for await (const p of req) parts.push(p);
  const data = Buffer.concat(parts);
  await writeFile(`public/media/insta/${name}`, data);
  if (name.endsWith(".mp4")) {
    await mkdir("public/media/insta/compact", { recursive: true });
    await writeFile(`public/media/insta/compact/${name}`, data);
  }
  console.log("saved", name, data.length, "bytes");
  res.end("ok");
}).listen(5199, "127.0.0.1", () => console.log("Waiting for the rendered clip on http://127.0.0.1:5199"));
