import { spawn } from "node:child_process";
import { createServer } from "node:net";
const socket = createServer();
await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
const port = socket.address().port;
await new Promise((resolve) => socket.close(resolve));
const base = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--strictPort",
  ],
  { stdio: "inherit" },
);
let failed = false;
server.on("exit", () => {
  failed = true;
});
try {
  let ready = false;
  for (let i = 0; i < 100 && !failed; i++) {
    try {
      const r = await fetch(base);
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!ready || failed) throw Error("Production preview did not start.");
  for (const script of ["tests/standalone.mjs", "tests/offline.mjs"])
    await new Promise((resolve, reject) => {
      const test = spawn(process.execPath, [script], {
        stdio: "inherit",
        env: { ...process.env, PRODUCTION_URL: base },
      });
      test.on("error", reject);
      test.on("exit", (code) =>
        code === 0 ? resolve() : reject(Error(`${script} failed (${code})`)),
      );
    });
} finally {
  server.kill("SIGTERM");
}
