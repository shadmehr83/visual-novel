import { onRequestGet, onRequestPost } from "./api/assistant";
export default {
  async fetch(
    request: Request,
    env: Parameters<typeof onRequestPost>[0]["env"] & {
      ASSETS: { fetch: (r: Request) => Promise<Response> };
    },
  ) {
    const path = new URL(request.url).pathname;
    if (path === "/api/assistant") {
      if (request.method === "GET") return onRequestGet({ env });
      if (request.method === "POST") return onRequestPost({ request, env });
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET, POST" },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
