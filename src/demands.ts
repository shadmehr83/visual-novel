import type { Project } from "./model";
import { demandSchema, type Demand } from "./demandSchema";
import { ENGINE_VERSION } from "./releases";
export const REPO = "https://github.com/shadmehr83/visual-novel";
export function makeDemand(
  project: Project,
  sceneId: string,
  nodeId: string,
  text: string,
): Demand {
  const scene =
    project.scenes.find((s) => s.id === sceneId) || project.scenes[0];
  const node = scene.nodes.find((n) => n.id === nodeId) || scene.nodes[0];
  return demandSchema.parse({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
    text,
    status: "open",
    context: {
      projectId: project.id,
      projectTitle: project.title,
      sceneId: scene.id,
      sceneTitle: scene.title,
      nodeId: node.id,
      dialogue: node.text.slice(0, 500),
    },
  });
}
export function demandPath(demand: Demand) {
  return `demands/inbox/${new Date(demand.createdAt).toISOString().replace(/[:.]/g, "-")}_${demand.id}.md`;
}
export function demandMarkdown(d: Demand) {
  const context = JSON.stringify(d.context, null, 2).replace(/`/g, "\\u0060");
  return `# Stillframe request ${d.id}\n\nRecorded: ${d.createdAt}\nEngine: ${d.engineVersion}\nInitial status: open\n\n## Requested change\n\n${d.text
    .split("\n")
    .map((line) => "> " + line)
    .join(
      "\n",
    )}\n\n## Authoring context\n\n\`\`\`json\n${context}\n\`\`\`\n\nThis is a request log, not evidence of implementation or automatic delivery to a chat. Only request text and scene context are exported; no artwork or credential fields are attached.\n`;
}
export function demandHandoff(d: Demand) {
  return `Please implement this Stillframe project request in shadmehr83/visual-novel.\n\nRequest ID: ${d.id}\nRecorded: ${d.createdAt}\nEngine: ${d.engineVersion}\nProject: ${d.context.projectTitle}\nScene: ${d.context.sceneTitle} (${d.context.sceneId})\nDialogue: ${d.context.nodeId}\nCurrent line: ${d.context.dialogue}\n${d.githubUrl ? "GitHub request: " + d.githubUrl + "\n" : ""}\nRequested change:\n${d.text}\n\nThis handoff contains text context only. The full editable project and any unpublished images are separate from this request.`;
}
export function chatDestination(text: string, existing: string) {
  if (existing) {
    const url = new URL(existing);
    if (
      url.protocol !== "https:" ||
      !["chatgpt.com", "chat.openai.com"].includes(url.hostname) ||
      url.username ||
      url.password
    )
      throw Error("Use an HTTPS ChatGPT conversation link.");
    return url.href;
  }
  const url = "https://chatgpt.com/?q=" + encodeURIComponent(text);
  return url.length <= 6000 ? url : "https://chatgpt.com/";
}
export function githubDemandDraft(demand: Demand) {
  const url = new URL(REPO + "/new/main");
  url.searchParams.set("filename", demandPath(demand));
  url.searchParams.set("value", demandMarkdown(demand));
  url.searchParams.set("message", "Log Stillframe request " + demand.id);
  return url.href.length <= 7600 ? url.href : null;
}
export function downloadText(
  text: string,
  filename: string,
  type = "text/markdown",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
