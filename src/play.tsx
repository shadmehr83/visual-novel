// Shareable play-only page (by Claude): /play opens the published story as a game with no editor.
// Add ?layout=phone for the phone player, and ?code=<PLAYTEST_TOKEN> so characters answer self-replies live.
import "./style.css";
import "./advanced.css";
import "./devices.css";
import "./insta.css";
import "./docking.css";
import { savedProject } from "./savedProject";

const params = new URL(location.href).searchParams;
const data = (id: string, value: unknown) => {
  const tag = document.createElement("script");
  tag.type = "application/json";
  tag.id = id;
  tag.textContent = JSON.stringify(value).replace(/</g, "\\u003c");
  document.body.appendChild(tag);
};
// The project text is embedded the same way a playable HTML export embeds it.
const project = savedProject();
data("story-data", { ...project, demands: undefined });
data("player-target", params.get("layout") === "phone" ? "phone" : "desktop");
const code = params.get("code");
if (code) data("claude-play", { endpoint: "/api/reply", token: code });
document.title = project.title + (code ? " · Claude edition" : "");
void import("./Player");
