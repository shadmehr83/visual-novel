import { expect, it } from "vitest";
import { savedProject } from "./savedProject";

it("loads the complete uploaded artwork and authored rain, lighting, motion and camera settings as independent copies", () => {
  const project = savedProject();
  const cafe = project.scenes.find((scene) => scene.id === "cafe")!;
  const background = project.assets.find(
    (asset) => asset.id === cafe.background,
  )!;
  expect(background.name).toBe("Rainy Café Conversation.png");
  expect(background.data).toMatch(/^data:image\/png;base64,iVBORw0KGgo/);
  expect(background.width).toBe(1536);
  expect(background.height).toBe(1024);
  expect(cafe.effects).toMatchObject({
    brightness: 1,
    light: 0.22,
    lightX: 68,
    lightY: 85,
    density: 56,
    speed: 1,
    angle: -2,
    length: 6,
    opacity: 0.14,
    lightLoop: {
      enabled: true,
      values: [0, 1, 1.5, 0, 1, 0, 1.75, 1],
      stepSeconds: 2.5,
    },
  });
  expect(cafe.effects.rainZones?.map((r) => r.points.length)).toEqual([23, 4]);
  expect(cafe.effects.rainZones?.[0].name).toBe("right window");
  expect(cafe.effects.lights).toHaveLength(2);
  expect(cafe.effects.lights?.[0]).toMatchObject({
    x: 902,
    y: 140,
    radius: 51,
    intensity: 1.9,
  });
  expect(cafe.effects.motionZones?.[0]).toMatchObject({
    strength: 2,
    direction: -62,
  });
  expect(project.scenes.find((s) => s.id === "bedroom")?.background).toBe(
    "first-match-bedroom",
  );
  expect(project.assets).toHaveLength(9);
  const portrait = project.assets.find((a) => a.id === "maria-device-profile")!;
  expect(portrait.data).toMatch(/^data:image\/png;base64,/);
  expect(portrait.id).not.toBe(cafe.background);
  expect(project.scenes.find((s) => s.id === "messages")?.phone?.avatar).toBe(
    portrait.id,
  );
  cafe.effects.rainZones![0].points[0].x = 0;
  cafe.effects.lightX = 0;
  const fresh = savedProject().scenes.find((scene) => scene.id === "cafe")!;
  expect(fresh.effects.lightX).toBe(68);
  expect(fresh.effects.rainZones![0].points[0].x).not.toBe(0);
});
