import { it, expect } from "vitest";
import { savedProject } from "./savedProject";
import { restoreSavedOutfits } from "./outfits";
import { validateProject } from "./model";
it("restores missing saved outfits while preserving existing cards, background and added options", () => {
  const saved = savedProject(),
    p = savedProject(),
    s = p.scenes.find((s) => s.id === "outfit")!,
    art = s.background;
  s.items!.options[0].description = "My own description";
  s.items!.options.splice(1, 1);
  s.items!.options.push({
    id: "custom",
    label: "My custom item",
    description: "Keep me",
    asset: null,
    choice: s.nodes[0].choices[0].id,
  });
  s.items!.enabled = false;
  restoreSavedOutfits(p, saved);
  expect(s.background).toBe(art);
  expect(s.items!.options).toHaveLength(4);
  expect(
    s.items!.options.find((i) => i.id === "comfortable")!.description,
  ).toBe("My own description");
  expect(s.items!.options.some((i) => i.id === "custom")).toBe(true);
  expect(s.items!.enabled).toBe(true);
  restoreSavedOutfits(p, saved);
  expect(s.items!.options).toHaveLength(4);
  expect(() => validateProject(p)).not.toThrow();
});
it("restores an absent picker and its images without replacing the wardrobe dialogue or routes", () => {
  const saved = savedProject(),
    p = savedProject(),
    s = p.scenes.find((s) => s.id === "outfit")!,
    nodes = structuredClone(s.nodes);
  delete s.items;
  p.assets = p.assets.filter((a) => !a.id.startsWith("outfit-"));
  restoreSavedOutfits(p, saved);
  expect(s.nodes).toEqual(nodes);
  expect(s.items!.options).toHaveLength(3);
  expect(p.assets.filter((a) => a.id.startsWith("outfit-"))).toHaveLength(3);
  expect(() => validateProject(p)).not.toThrow();
});

it("recovers original images even when the outfit cards themselves still exist", () => {
  const original = savedProject(),
    p = savedProject();
  p.assets = p.assets.filter((a) => !a.id.startsWith("outfit-"));
  restoreSavedOutfits(p, original);
  expect(p.scenes.find((s) => s.id === "outfit")!.items!.options).toHaveLength(
    3,
  );
  expect(p.assets.filter((a) => a.id.startsWith("outfit-"))).toHaveLength(3);
  expect(() => validateProject(p)).not.toThrow();
});
