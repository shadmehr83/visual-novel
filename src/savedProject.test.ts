import { expect, it } from "vitest";
import { savedProject } from "./savedProject";

it("preserves the exported background and authored cafe lighting as independent copies", () => {
  const project = savedProject();
  const cafe = project.scenes.find(scene => scene.id === "cafe")!;
  const background = project.assets.find(asset => asset.id === cafe.background)!;
  expect(background.name).toBe("Rainy Caf\u00e9 Conversation.png");
  expect(background.data).toMatch(/^data:image\/png;base64,/);
  expect(cafe.effects).toMatchObject({ brightness: .78, light: .04, lightX: 53, lightY: 77,
    density: 200, speed: 1.1, angle: 0, length: 8, opacity: .15,
    lightLoop: { enabled: true, values: [0, 1, 1.5, 0, 1, 0, 1.5, 1], stepSeconds: 1 } });
  expect(cafe.effects.mask).toHaveLength(8);
  cafe.effects.lightX = 0;
  expect(savedProject().scenes.find(scene => scene.id === "cafe")!.effects.lightX).toBe(53);
});
