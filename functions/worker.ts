import { demandConfiguration, publishDemand } from "./api/demands";
import { publishProject } from "./api/project";
import { onRequestGet, onRequestPost } from "./api/assistant";
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
      return request.method === "POST"
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
    return env.ASSETS.fetch(request);
  },
};
