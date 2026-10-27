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

it('QTE outcomes record their entered dialogue for screen switches and hinge ranges', async()=>{const {resolveQte}=await import('./model');const p=demo();p.scenes[0].nodes=[{id:'quiz',speaker:'Narrator',text:'Wait',choices:[],qte:{prompt:'Act',seconds:1,success:'end',timeout:'end'}},{id:'end',speaker:'Narrator',text:'Done',choices:[]}];const r=resolveQte(p,start(p),'success');expect(r.nodeVisits?.at(-1)?.node).toBe('end');});
