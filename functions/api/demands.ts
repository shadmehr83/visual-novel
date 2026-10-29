import { demandSchema } from "../../src/demandSchema";
import { demandMarkdown, demandPath } from "../../src/demands";
type Env = { GITHUB_PROJECT_TOKEN?: string; STUDIO_ACCESS_TOKEN?: string };
export function demandConfiguration(env: Env) {
  return Response.json(
    { configured: !!(env.GITHUB_PROJECT_TOKEN && env.STUDIO_ACCESS_TOKEN) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function publishDemand(request: Request, env: Env) {
  const error = (message: string, status: number) =>
    Response.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  if (!env.GITHUB_PROJECT_TOKEN || !env.STUDIO_ACCESS_TOKEN)
    return error(
      "Direct GitHub saving is not configured. Use the GitHub draft button; no OpenAI key is needed.",
      503,
    );
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return error("Same-origin requests only.", 403);
  if (
    request.headers.get("authorization") !== `Bearer ${env.STUDIO_ACCESS_TOKEN}`
  )
    return error("Incorrect studio password.", 401);
  if (Number(request.headers.get("content-length") || 0) > 64000)
    return error("Request log entry is too large.", 413);
  let demand;
  try {
    const text = await request.text();
    if (text.length > 24000)
      return error("Request log entry is too large.", 413);
    demand = demandSchema.parse(JSON.parse(text));
  } catch {
    return error("Provide a valid saved request of 1–8000 characters.", 400);
  }
  const path = demandPath(demand),
    markdown = demandMarkdown(demand);
  const url =
    "https://api.github.com/repos/shadmehr83/visual-novel/contents/" + path;
  const headers = {
    Authorization: `Bearer ${env.GITHUB_PROJECT_TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "Stillframe-Studio",
    "Content-Type": "application/json",
  };
  try {
    const existing = await fetch(url + "?ref=main", {
      headers,
      signal: AbortSignal.timeout(15000),
    });
    if (existing.ok) {
      const data = (await existing.json()) as {
        content?: string;
        html_url: string;
      };
      const bytes = Uint8Array.from(
        atob((data.content || "").replace(/\s/g, "")),
        (c) => c.charCodeAt(0),
      );
      if (new TextDecoder().decode(bytes) !== markdown)
        return error(
          "This request ID already has a different GitHub file. Existing records were preserved; save a new request instead.",
          409,
        );
      return Response.json({
        url: `https://github.com/shadmehr83/visual-novel/blob/main/${path}`,
        alreadySaved: true,
      });
    }
    if (existing.status !== 404)
      return error(
        "Could not read the GitHub inbox. Check the publisher’s repository access.",
        502,
      );
    const bytes = new TextEncoder().encode(markdown);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192)
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    const result = await fetch(url, {
      method: "PUT",
      headers,
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        branch: "main",
        message: "Log Stillframe request " + demand.id,
        content: btoa(binary),
      }),
    });
    if (!result.ok)
      return error(
        result.status === 409 || result.status === 422
          ? "The inbox changed during saving. Retry to check whether this request was saved."
          : "GitHub did not confirm the save. Your local log remains available.",
        result.status === 409 || result.status === 422 ? 409 : 502,
      );
    const data = (await result.json()) as { commit: { sha: string } };
    return Response.json({
      url: `https://github.com/shadmehr83/visual-novel/blob/main/${path}`,
      commit: data.commit.sha,
    });
  } catch {
    return error(
      "GitHub saving could not finish. Keep the local request and retry or use the GitHub draft button.",
      502,
    );
  }
}
