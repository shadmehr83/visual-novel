import { useState } from "react";
import type { Joint, Project, Scene } from "./model";
import { drawGeometry } from "./brush";
import { sceneView } from "./SceneViews";
export async function extractSnippet(
  project: Project,
  scene: Scene,
  nodeId: string,
  joint: Joint,
): Promise<Project["assets"][number]> {
  const view = sceneView(scene, nodeId);
  const source = project.assets.find(
    (a) => a.id === (joint.source || view.background),
  );
  if (!source) throw Error("Import a background or source image first.");
  if (!joint.region.path && joint.region.points.length < 3)
    throw Error("Select the character area before saving a snippet.");
  const image = new Image();
  image.src = source.data;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 563;
  const ctx = canvas.getContext("2d")!;
  const mask = document.createElement("canvas");
  mask.width = 1000;
  mask.height = 563;
  const mc = mask.getContext("2d")!;
  mc.fillStyle = "white";
  drawGeometry(mc, joint.region);
  if (joint.region.boundary) {
    mc.globalCompositeOperation = "destination-in";
    drawGeometry(mc, joint.region.boundary);
  }
  const fit = joint.source ? "contain" : view.fit;
  const scale =
    fit === "cover"
      ? Math.max(1000 / image.width, 563 / image.height)
      : Math.min(1000 / image.width, 563 / image.height);
  const w = fit === "stretch" ? 1000 : image.width * scale,
    h = fit === "stretch" ? 563 : image.height * scale;
  ctx.drawImage(image, (1000 - w) / 2, (563 - h) / 2, w, h);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(mask, 0, 0);
  return {
    id: crypto.randomUUID(),
    name: joint.name + " · masked snippet.png",
    folder: "Character snippets",
    mime: "image/png",
    width: 1000,
    height: 563,
    data: canvas.toDataURL("image/png"),
    tags: "character, masked, hinge",
    notes:
      "Aligned transparent patch from " +
      source.name +
      ". Original artwork preserved.",
    approved: false,
    reference: false,
  };
}
export function SnippetControls({
  project,
  scene,
  nodeId,
  joint,
  onSave,
}: {
  project: Project;
  scene: Scene;
  nodeId: string;
  joint: Joint;
  onSave: (a: Project["assets"][number]) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <button
        disabled={busy}
        data-help="Save only the selected pixels as a transparent image in Character snippets and use it for this hinge. It keeps its scene alignment. The original background is untouched."
        onClick={async () => {
          setBusy(true);
          try {
            onSave(await extractSnippet(project, scene, nodeId, joint));
            setError("");
          } catch (e) {
            setError(String(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Saving snippet…" : "Save selected snippet to gallery"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
