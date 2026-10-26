import { validateProject, type Project } from "./model";
export async function exportPlayer(project: Project) {
  validateProject(project);
  const embedded = document.getElementById("bundled-player")?.textContent;
  let code: string;
  if (embedded) {
    code = JSON.parse(embedded);
  } else {
    const script = await fetch("/player.js");
    if (
      !script.ok ||
      !(script.headers.get("content-type") || "").includes("javascript")
    )
      throw Error(
        "Standalone player export is available from a production build or the downloadable local editor.",
      );
    code = await script.text();
  }
  const style = Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((r) => r.cssText);
      } catch {
        return [];
      }
    })
    .join("\n");
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Visual novel player</title><style>${style.replace(/<\/style/gi, "<\\/style")}</style></head><body><div id="root"></div><script id="story-data" type="application/json">${JSON.stringify(project).replace(/</g, "\\u003c")}</script><script>${code.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "visual-novel-player.html";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
