import { demandConfiguration, publishDemand } from "./api/demands";
import { publishProject } from "./api/project";
import { onRequestGet, onRequestPost } from "./api/assistant";
import { onReplyGet, onReplyOptions, onReplyPost } from "./api/reply";
export default {
  async fetch(
    request: Request,
    env: Parameters<typeof onRequestPost>[0]["env"] & {
      GITHUB_PROJECT_TOKEN?: string;
      ASSETS: { fetch: (r: Request) => Promise<Response> };
    },
  ) {
    const path = new URL(request.url).pathname;
    if (path === "/api/demands") {
      if (request.method === "GET") return demandConfiguration(env);
      if (request.method === "POST") return publishDemand(request, env);
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET, POST" },
      });
    }
    if (path === "/api/project")
      return ["GET", "POST"].includes(request.method)
        ? publishProject(request, env)
        : new Response("Method not allowed", { status: 405 });
    if (path === "/api/assistant") {
      if (request.method === "GET") return onRequestGet({ env });
      if (request.method === "POST") return onRequestPost({ request, env });
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET, POST" },
      });
    }
    if (path === "/api/reply") {
      if (request.method === "GET") return onReplyGet({ env });
      if (request.method === "POST") return onReplyPost({ request, env });
      if (request.method === "OPTIONS") return onReplyOptions();
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET, POST, OPTIONS" },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
