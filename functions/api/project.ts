import { validateProject } from "../../src/model";
export async function publishProject(
  request: Request,
  env: { GITHUB_PROJECT_TOKEN?: string; STUDIO_ACCESS_TOKEN?: string },
) {
  const error = (message: string, status: number) =>
    Response.json({ error: message }, { status });
  if (!env.GITHUB_PROJECT_TOKEN || !env.STUDIO_ACCESS_TOKEN)
    return error(
      "Direct publishing is not configured. Save the project file and upload it to the projects folder, or configure the server token.",
      503,
    );
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return error("Same-origin publishing only", 403);
  if (
    request.headers.get("authorization") !== `Bearer ${env.STUDIO_ACCESS_TOKEN}`
  )
    return error("Incorrect studio password", 401);
  try {
    const text = await request.text();
    if (text.length > 20 * 1024 * 1024)
      return error(
        "Direct publish is limited to 20 MB. Save the file instead.",
        413,
      );
    const project = validateProject(JSON.parse(text));
    const url =
      "https://api.github.com/repos/shadmehr83/visual-novel/contents/projects/published.stillframe.json";
    const headers = {
      Authorization: `Bearer ${env.GITHUB_PROJECT_TOKEN}`,
      Accept: "application/vnd.github.object+json",
      "User-Agent": "Stillframe-Studio",
      "Content-Type": "application/json",
    };
    const existing = await fetch(url + "?ref=main", {
      headers,
      signal: AbortSignal.timeout(15000),
    });
    if (!existing.ok)
      return error(
        "Could not read the GitHub project file. Check repository permissions.",
        502,
      );
    const { sha } = (await existing.json()) as { sha: string };
    const bytes = new TextEncoder().encode(JSON.stringify(project, null, 2));
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192)
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    const result = await fetch(url, {
      method: "PUT",
      headers,
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        message: "Update authored studio project",
        branch: "main",
        sha,
        content: btoa(binary),
      }),
    });
    if (!result.ok)
      return error(
        result.status === 409
          ? "GitHub changed while publishing. Refresh and try again."
          : "GitHub publish failed. Your local project is unchanged.",
        result.status === 409 ? 409 : 502,
      );
    const data = (await result.json()) as { commit: { sha: string } };
    return Response.json({ commit: data.commit.sha });
  } catch {
    return error(
      "Project validation or publishing failed. Save a local backup and retry.",
      502,
    );
  }
}
