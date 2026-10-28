import { it, expect } from "vitest";
import { demo } from "./demo";
import { deviceScreen, hingeWindow } from "./interactions";
import { makePlacedLight } from "./LightLibrary";
import { describeControl } from "./HoverHelp";
import { start, advance, validateProject } from "./model";
it("inherits phone switches along the played branch and preserves chat-only compatibility", () => {
  const s = demo().scenes[0];
  s.phone = {
    enabled: true,
    device: "phone",
    contact: "Maria",
    title: "Online",
    avatar: null,
    x: 50,
    y: 50,
    width: 44,
    entrance: { style: "cut", seconds: 0.1 },
    typingSeconds: 0,
    keyboard: false,
  };
  s.nodes[0].deviceScreen = "feed";
  expect(deviceScreen(s, s.nodes[1], [s.nodes[0].id, s.nodes[1].id])).toBe(
    "feed",
  );
  delete s.nodes[0].deviceScreen;
  expect(deviceScreen(s, s.nodes[0])).toBe("chat");
  s.phone.mode = "phone-system";
  expect(deviceScreen(s, s.nodes[0])).toBe("home");
});
it("hinge windows wait for their actual start, include the end, and hold or hide afterwards", () => {
  const s = demo().scenes[0];
  const j: any = { range: { start: "a", end: "c", after: "hide" } };
  expect(hingeWindow(j, "b", ["b"], s).visible).toBe(false);
  expect(hingeWindow(j, "a", ["a"], s).visible).toBe(true);
  expect(hingeWindow(j, "c", ["a", "c"], s).visible).toBe(true);
  expect(hingeWindow(j, "d", ["a", "c", "d"], s).visible).toBe(false);
  j.range.after = "hold";
  expect(hingeWindow(j, "d", ["a", "c", "d"], s)).toEqual({
    visible: true,
    ended: true,
  });
});
it("stamped individual lights copy their cycle and do not copy old masks or ids", () => {
  const a = makePlacedLight(undefined, 100, 200),
    b = makePlacedLight(a, 300, 400);
  expect(b.cycle).toEqual({
    enabled: true,
    values: [0.5, 1, 0.5],
    stepSeconds: 1,
  });
  expect(b.id).not.toBe(a.id);
  expect(b.x).toBe(300);
  b.cycle.values[0] = 0;
  expect(a.cycle.values[0]).toBe(0.5);
});
it("specific tooltips explain removal, item confirmation and individual lamp presets differently", () => {
  const el = document.createElement("button");
  el.textContent = "Remove item picker";
  expect(describeControl(el).text).toContain("Dialogue and choices remain");
  el.textContent = "Save individual light favourite";
  expect(describeControl(el).text).toContain("selected lamp");
});
it("records visited dialogue for persisted ranges and phone scheduling", () => {
  const p = demo();
  const r = advance(p, start(p));
  expect(r.nodeVisits?.length).toBe(2);
  expect(JSON.parse(JSON.stringify(r)).nodeVisits[1].node).toBe(r.node);
});

it("QTE outcomes record their entered dialogue for screen switches and hinge ranges", async () => {
  const { resolveQte } = await import("./model");
  const p = demo();
  p.scenes[0].nodes = [
    {
      id: "quiz",
      speaker: "Narrator",
      text: "Wait",
      choices: [],
      qte: { prompt: "Act", seconds: 1, success: "end", timeout: "end" },
    },
    { id: "end", speaker: "Narrator", text: "Done", choices: [] },
  ];
  const r = resolveQte(p, start(p), "success");
  expect(r.nodeVisits?.at(-1)?.node).toBe("end");
});

it("simple device ranges ignore leftover directives, include their end and follow the visited branch", () => {
  const s = demo().scenes[0];
  s.phone = {
    enabled: true,
    mode: "phone-system",
    device: "phone",
    contact: "Maria",
    title: "Online",
    avatar: null,
    x: 50,
    y: 50,
    width: 44,
    entrance: { style: "cut", seconds: 0.1 },
    typingSeconds: 0,
    keyboard: false,
    schedule: { start: "b", end: "c", screen: "feed", advanced: false },
  };
  s.nodes = [
    { id: "a", speaker: "Narrator", text: "a", choices: [] },
    {
      id: "b",
      speaker: "Narrator",
      text: "b",
      choices: [],
      deviceScreen: "chat",
    },
    { id: "c", speaker: "Narrator", text: "c", choices: [] },
    { id: "d", speaker: "Narrator", text: "d", choices: [] },
  ];
  expect(deviceScreen(s, s.nodes[0], ["a"])).toBe("off");
  expect(deviceScreen(s, s.nodes[1], ["a", "b"])).toBe("feed");
  expect(deviceScreen(s, s.nodes[2], ["a", "b", "c"])).toBe("feed");
  expect(deviceScreen(s, s.nodes[3], ["a", "b", "c", "d"])).toBe("off");
  expect(deviceScreen(s, s.nodes[3], ["a", "d"])).toBe("off");
  s.phone.schedule!.advanced = true;
  expect(deviceScreen(s, s.nodes[2], ["a", "b", "c"])).toBe("chat");
});
it("normal and device self-reply permissions are independent in rendering and runtime", async () => {
  const { respond } = await import("./model");
  const { allowsReply } = await import("./interactions");
  const p = demo(),
    s = p.scenes[0];
  s.phone = {
    enabled: true,
    device: "phone",
    contact: "Maria",
    title: "Online",
    avatar: null,
    x: 50,
    y: 50,
    width: 44,
    entrance: { style: "cut", seconds: 0.1 },
    typingSeconds: 0,
    keyboard: false,
  };
  const n = s.nodes[0];
  n.allowCustomResponse = false;
  n.allowPhoneCustomResponse = true;
  expect(allowsReply(s, n, false)).toBe(false);
  expect(allowsReply(s, n, true)).toBe(true);
  expect(() => respond(p, start(p), "Hello")).not.toThrow();
  n.allowPhoneCustomResponse = false;
  expect(() => respond(p, start(p), "Hello")).toThrow(
    "Custom reply unavailable",
  );
});
it("active controls restore grading and lamp intensity without discarding their values", async () => {
  const { activities } = await import("./EffectSummary");
  const s = demo().scenes[0];
  s.effects.light = 0.37;
  s.effects.brightness = 0.83;
  s.effects.contrast = 1.21;
  activities(s)
    .find((x) => x.id === "light")!
    .toggle(s);
  expect(s.effects.light).toBe(0);
  activities(s)
    .find((x) => x.id === "light")!
    .toggle(s);
  expect(s.effects.light).toBe(0.37);
  activities(s)
    .find((x) => x.id === "grading")!
    .toggle(s);
  expect(s.effects.brightness).toBe(1);
  activities(s)
    .find((x) => x.id === "grading")!
    .toggle(s);
  expect(s.effects.brightness).toBe(0.83);
  expect(s.effects.contrast).toBe(1.21);
});
