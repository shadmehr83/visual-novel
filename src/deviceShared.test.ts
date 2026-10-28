import { it, expect } from "vitest";
import { savedProject } from "./savedProject";
import {
  effectiveDevice,
  ensureDevice,
  saveDeviceAppearance,
  saveDeviceAvatar,
  setDeviceIndependent,
} from "./deviceShared";
import { deviceDialogue, deviceScreen } from "./interactions";
import { validateProject, start } from "./model";
it("dialogue overrides show and hide a device outside its disabled scene schedule without changing the schedule", () => {
  const p = savedProject(),
    s = p.scenes[0],
    n = s.nodes[0];
  s.phone!.enabled = false;
  const original = structuredClone(s.phone!.schedule);
  expect(deviceScreen(s, n)).toBe("off");
  n.deviceVisible = true;
  n.deviceScreen = "chat";
  n.deviceDialogue = true;
  n.speaker = "Maria";
  expect(deviceScreen(s, n)).toBe("chat");
  expect(deviceDialogue(s, n)).toBe(true);
  expect(start(p).phoneMessages?.at(-1)?.text).toBe(n.text);
  n.deviceVisible = false;
  expect(deviceScreen(s, n)).toBe("off");
  expect(s.phone!.schedule).toEqual(original);
});
it("new scene devices inherit icons and Maria’s face and survive portable project validation", () => {
  const p = savedProject(),
    s = p.scenes.find((s) => !s.phone)!;
  ensureDevice(p, s);
  expect(effectiveDevice(p, s).avatar).toBe("maria-device-profile");
  expect(Object.keys(effectiveDevice(p, s).appearance!.icons)).toHaveLength(3);
  s.nodes[0].deviceVisible = true;
  s.nodes[0].deviceDialogue = false;
  const restored = validateProject(JSON.parse(JSON.stringify(p)));
  expect(
    effectiveDevice(
      restored,
      restored.scenes.find((x) => x.id === s.id)!,
    ).appearance!.icons,
  ).toEqual(effectiveDevice(p, s).appearance!.icons);
  expect(
    restored.scenes.find((x) => x.id === s.id)!.nodes[0].deviceVisible,
  ).toBe(true);
});
it("shared edits follow across scenes while independent devices retain their saved appearance", () => {
  const p = savedProject(),
    a = p.scenes[0],
    b = p.scenes[1],
    c = p.scenes[2];
  setDeviceIndependent(p, c.id, true);
  const prior = structuredClone(effectiveDevice(p, c));
  saveDeviceAppearance(p, a.id, {
    ...effectiveDevice(p, a).appearance!,
    icons: { chat: "studio-icon-settings" },
    background: "#fafafa",
  });
  saveDeviceAvatar(p, a.id, "maria-device-profile");
  expect(effectiveDevice(p, b).appearance!.background).toBe("#fafafa");
  expect(effectiveDevice(p, b).appearance!.icons.chat).toBe(
    "studio-icon-settings",
  );
  expect(effectiveDevice(p, c)).toEqual(prior);
  expect(
    validateProject(JSON.parse(JSON.stringify(p))).deviceDefaults?.appearance
      ?.icons.chat,
  ).toBe("studio-icon-settings");
});
it("rejects broken shared image references", () => {
  const p = savedProject();
  p.deviceDefaults = { avatar: "missing" };
  expect(() => validateProject(p)).toThrow("Missing shared device image");
});
