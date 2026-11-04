import { expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useState } from "react";
import { demo } from "./demo";
import { useWindowSync } from "./windowSync";
import type { Project } from "./model";

// Linked windows (by Claude): two studio windows share edits and the selected dialogue.
function useStudio(start: Project) {
  const [project, setProject] = useState(start);
  const [sel, setSel] = useState({ sceneId: start.scenes[0].id, nodeId: start.scenes[0].nodes[0].id });
  const sync = useWindowSync({ loaded: true, project, setProject, ...sel, onSelect: (sceneId, nodeId) => setSel({ sceneId, nodeId }) });
  return { project, setProject, sel, setSel, sync };
}
it("shows an edit and a selection from one window in the other, without sending artwork again", async () => {
  const base = demo();
  base.assets = [{ id: "art", name: "Art", width: 1, height: 1, mime: "image/png", data: "data:image/png;base64,AAAA", tags: "", notes: "", approved: false, reference: false }];
  const a = renderHook(() => useStudio(base));
  const b = renderHook(() => useStudio(structuredClone(base)));
  await waitFor(() => expect(a.result.current.sync.linked).toBe(1));
  await waitFor(() => expect(b.result.current.sync.linked).toBe(1));
  act(() => a.result.current.setProject({ ...a.result.current.project, title: "Edited on the control screen" }));
  await waitFor(() => expect(b.result.current.project.title).toBe("Edited on the control screen"));
  expect(b.result.current.project.assets[0].data).toBe("data:image/png;base64,AAAA");
  // The receiving window does not echo the change back as its own.
  expect(b.result.current.sync.remote.current).toBe(b.result.current.project);
  // And back the other way, from the preview window to the control window.
  act(() => b.result.current.setProject({ ...b.result.current.project, title: "Edited on the main screen" }));
  await waitFor(() => expect(a.result.current.project.title).toBe("Edited on the main screen"));
  const scene = base.scenes[1];
  act(() => a.result.current.setSel({ sceneId: scene.id, nodeId: scene.nodes[0].id }));
  await waitFor(() => expect(b.result.current.sel.sceneId).toBe(scene.id));
  a.unmount();
  await waitFor(() => expect(b.result.current.sync.linked).toBe(0));
  b.unmount();
});
