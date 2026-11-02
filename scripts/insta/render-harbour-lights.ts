// Renders the fifth Insta clip, "harbour-lights", as a 24-second 360x640 cinemagraph (by Claude).
// Same approach as make-insta-videos.py but without ffmpeg: the original wet harbour-street painting stays
// unmodified; a slow pan, falling rain, shimmering puddles, flickering lamplight and rain sound are added
// here and encoded with the browser's WebCodecs into an H.264/AAC MP4.
// Run with `npm run dev`, open /scripts/insta/render.html, and start `node scripts/insta/receive.mjs`
// first so the finished files are written to public/media/insta/.
import { ArrayBufferTarget, Muxer } from "mp4-muxer";

const NAME = "harbour-lights";
const W = 360, H = 640, FPS = 24, SECONDS = 24, RATE = 48000;
const FRAMES = FPS * SECONDS;
const status = (s: string) => { document.getElementById("status")!.textContent = s; };

// Deterministic randomness so the clip is reproducible.
function rng(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(Error("Could not load " + src));
  img.src = src;
});

const r = rng(2611);
// Rain streaks; whole numbers of falls per 24 s keep the loop seamless.
const rain = Array.from({ length: 140 }, () => ({ x: r(), phase: r(), falls: 18 + Math.floor(r() * 14), len: 10 + r() * 16, alpha: 0.08 + r() * 0.12 }));
// Glints on the wet paving.
const glints = Array.from({ length: 60 }, () => ({ x: r(), y: 0.74 + r() * 0.24, phase: r(), speed: [1, 2, 3, 4][Math.floor(r() * 4)] }));

function draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, t: number) {
  const loop = t / SECONDS; // 0..1
  // Portrait crop pans slowly across the street and back (cosine) for a seamless loop.
  const scale = (H / img.height) * 1.04;
  const dw = img.width * scale, dh = img.height * scale;
  const travel = dw - W;
  const x = -travel * (0.28 + 0.24 * (0.5 - 0.5 * Math.cos(loop * Math.PI * 2)));
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(img, x, (H - dh) / 2, dw, dh);
  // Warm lamplight breathing.
  const flicker = 0.1 + 0.025 * Math.sin(t * 1.7) + 0.015 * Math.sin(t * 4.9 + 0.8);
  const lamp = ctx.createLinearGradient(0, 0, 0, H);
  lamp.addColorStop(0, `rgba(255,180,110,${flicker * 0.6})`);
  lamp.addColorStop(0.6, `rgba(255,170,90,${flicker})`);
  lamp.addColorStop(1, "rgba(255,170,90,0)");
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = lamp;
  ctx.fillRect(0, 0, W, H);
  // Glints shimmering on the paving.
  ctx.globalCompositeOperation = "lighter";
  for (const g of glints) {
    const a = Math.max(0, Math.sin((loop * g.speed + g.phase) * Math.PI * 2)) * 0.22;
    ctx.fillStyle = `rgba(255,200,130,${a})`;
    ctx.fillRect(W * g.x, H * g.y, 6, 1.4);
  }
  // Falling rain.
  ctx.strokeStyle = "rgba(220,225,240,1)";
  ctx.lineWidth = 1;
  for (const d of rain) {
    const p = (loop * d.falls + d.phase) % 1;
    const y = p * (H + 40) - 20, xx = W * d.x + p * 18;
    ctx.globalAlpha = d.alpha;
    ctx.beginPath();
    ctx.moveTo(xx, y);
    ctx.lineTo(xx + 3, y + d.len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // Vignette.
  ctx.globalCompositeOperation = "source-over";
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
  v.addColorStop(0, "rgba(10,8,12,0)");
  v.addColorStop(1, "rgba(10,8,12,0.5)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

// Rain on stone, gutter drips and a faint distant fairground hum. No music.
function soundtrack() {
  const n = RATE * SECONDS, left = new Float32Array(n), right = new Float32Array(n);
  const rand = rng(77);
  let hiL = 0, hiR = 0, low = 0;
  const drips = Array.from({ length: 30 }, () => rand() * SECONDS);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const wl = rand() * 2 - 1, wr = rand() * 2 - 1;
    hiL += 0.35 * (wl - hiL);
    hiR += 0.35 * (wr - hiR);
    low += 0.003 * (rand() * 2 - 1 - low);
    const hum = 0.004 * Math.sin(2 * Math.PI * 55 * t) * (0.6 + 0.4 * Math.sin(t * 0.3));
    let drip = 0;
    for (const d of drips) if (t >= d && t < d + 0.25) {
      const k = t - d;
      drip += 0.03 * Math.exp(-k * 40) * Math.sin(2 * Math.PI * (900 + 300 * Math.sin(d)) * k);
    }
    const fade = Math.min(1, t / 0.4, (SECONDS - t) / 0.4);
    left[i] = (hiL * 0.05 + low * 0.6 + hum + drip) * fade;
    right[i] = (hiR * 0.05 + low * 0.6 + hum + drip * 0.7) * fade;
  }
  return [left, right];
}

async function render() {
  const img = await loadImage("/artwork/cafe-animation/street-source.png");
  const view = document.getElementById("view") as HTMLCanvasElement;
  const ctx = view.getContext("2d")!;
  const video = { codec: "avc1.42001f", width: W, height: H, bitrate: 320_000, framerate: FPS }; // ~1 MB like the other clips
  if (!(await VideoEncoder.isConfigSupported(video)).supported) throw Error("H.264 encoding is not available in this browser.");
  const aac = { codec: "mp4a.40.2", sampleRate: RATE, numberOfChannels: 2, bitrate: 96_000 };
  const useAac = (await AudioEncoder.isConfigSupported(aac)).supported;
  const audio = useAac ? aac : { codec: "opus", sampleRate: RATE, numberOfChannels: 2, bitrate: 96_000 };
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width: W, height: H, frameRate: FPS },
    audio: { codec: useAac ? "aac" : "opus", numberOfChannels: 2, sampleRate: RATE },
    fastStart: "in-memory",
  });
  const venc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: (e) => status("video error: " + e.message) });
  venc.configure(video);
  for (let f = 0; f < FRAMES; f++) {
    draw(ctx, img, f / FPS);
    const frame = new VideoFrame(view, { timestamp: Math.round((f * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
    venc.encode(frame, { keyFrame: f % (FPS * 2) === 0 });
    frame.close();
    if (f % 48 === 0) { status(`video ${f}/${FRAMES}`); await venc.flush(); }
  }
  await venc.flush();
  const aenc = new AudioEncoder({ output: (c, m) => muxer.addAudioChunk(c, m), error: (e) => status("audio error: " + e.message) });
  aenc.configure(audio);
  const [l, rr] = soundtrack();
  for (let i = 0; i < l.length; i += 1024) {
    const len = Math.min(1024, l.length - i), data = new Float32Array(len * 2);
    data.set(l.subarray(i, i + len), 0);
    data.set(rr.subarray(i, i + len), len);
    const chunk = new AudioData({ format: "f32-planar", sampleRate: RATE, numberOfFrames: len, numberOfChannels: 2, timestamp: Math.round((i * 1e6) / RATE), data });
    aenc.encode(chunk);
    chunk.close();
  }
  await aenc.flush();
  muxer.finalize();
  const mp4 = new Blob([muxer.target.buffer], { type: "video/mp4" });
  draw(ctx, img, 8);
  const poster = await new Promise<Blob>((res) => view.toBlob((b) => res(b!), "image/jpeg", 0.86));
  status(`saving (${(mp4.size / 1024).toFixed(0)} KB, audio ${useAac ? "AAC" : "Opus"})…`);
  for (const [name, blob] of [[NAME + ".mp4", mp4], [NAME + ".jpg", poster]] as const) {
    const res = await fetch("http://127.0.0.1:5199/save?name=" + name, { method: "POST", body: blob });
    if (!res.ok) throw Error("Saving " + name + " failed: " + (await res.text()));
  }
  status(`done: ${(mp4.size / 1024).toFixed(0)} KB, audio ${useAac ? "AAC" : "Opus"}`);
}
render().catch((e) => status("failed: " + (e as Error).message));
