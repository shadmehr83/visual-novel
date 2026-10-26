import { describe, it, expect } from "vitest";
import { demo } from "./demo";
import { advance, start, enter, validateProject } from "./model";
describe("Project validation", () => {
  it("validates the complete demo", () =>
    expect(validateProject(demo()).scenes).toHaveLength(4));
  it("rejects unsupported versions", () =>
    expect(() => validateProject({ ...demo(), schemaVersion: 9 })).toThrow());
  it("rejects missing targets", () => {
    const p = demo();
    p.scenes[0].nodes[1].choices[0].target = "missing";
    expect(() => validateProject(p)).toThrow("Missing choice target");
  });
  it("rejects unknown protected state actions", () => {
    const p = demo();
    p.scenes[0].nodes[1].choices[0].actions = [
      { key: "inventedWeapon", op: "set", value: true },
    ];
    expect(() => validateProject(p)).toThrow("Unknown state key");
  });
  it("rejects numeric actions against flags", () => {
    const p = demo();
    p.scenes[0].nodes[1].choices[0].actions = [
      { key: "delayed", op: "add", value: 1 },
    ];
    expect(() => validateProject(p)).toThrow("Invalid action");
  });
  it("rejects missing assets", () => {
    const p = demo();
    p.scenes[0].background = "not-an-image";
    expect(() => validateProject(p)).toThrow("Missing background");
  });
  it("rejects out-of-range particles", () => {
    const p = demo();
    p.scenes[0].effects.density = 20000;
    expect(() => validateProject(p)).toThrow();
  });
  it("rejects malformed imported images", () => {
    const p = demo();
    p.assets.push({
      id: "x",
      name: "bad",
      mime: "image/png",
      width: 1,
      height: 1,
      data: "javascript:alert(1)",
      tags: "",
      notes: "",
      approved: false,
      reference: false,
    });
    expect(() => validateProject(p)).toThrow();
  });
  it("round-trips bundled assets, masks and dialogue", () => {
    const p = demo();
    p.assets.push({
      id: "art",
      name: "art.png",
      mime: "image/png",
      width: 1,
      height: 1,
      data: "data:image/png;base64,YQ==",
      tags: "test",
      notes: "original",
      approved: true,
      reference: false,
    });
    p.scenes[0].background = "art";
    expect(validateProject(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });
});
describe("Authored runtime", () => {
  it("initialises distinct relationship and practical variables", () => {
    const r = start(demo());
    expect(r.values.trust).toBe(0);
    expect(r.values.independence).toBe(0);
    expect(r.values.housing).toBe(true);
  });
  it("records delay separately from opening the message", () => {
    const p = demo();
    let r = advance(p, start(p));
    r = advance(p, r, "wait");
    expect(r.values.delayed).toBe(true);
    expect(r.values.messageOpened).toBe(false);
    r = advance(p, r, "open-later");
    expect(r.values.messageOpened).toBe(true);
    expect(r.scene).toBe("messages");
  });
  it("does not advance past unanswered choices", () => {
    const p = demo();
    expect(() => advance(p, advance(p, start(p)))).toThrow("Choose a reply");
  });
  it("rejects stale/double choice resolution", () => {
    const p = demo();
    const r = advance(p, advance(p, start(p)), "open");
    expect(() => advance(p, r, "open")).toThrow("unavailable");
  });
  it("applies scene entry actions once per playthrough", () => {
    const p = demo();
    p.scenes[0].entry = [{ key: "trust", op: "add", value: 1 }];
    const r = start(p);
    expect(enter(p, r, "bedroom").values.trust).toBe(1);
  });
  it("filters choices by authored conditions", () => {
    const p = demo();
    p.scenes[0].nodes[1].choices[0].condition = {
      key: "messageOpened",
      equals: true,
    };
    expect(() => advance(p, advance(p, start(p)), "open")).toThrow(
      "unavailable",
    );
  });
  it("completes the full opening and records a clue without confirming an interpretation", () => {
    const p = demo();
    let r = start(p);
    r = advance(p, r);
    r = advance(p, r, "open");
    r = advance(p, r, "playful");
    r = advance(p, r);
    r = advance(p, r, "yes");
    r = advance(p, r, "casual");
    r = advance(p, r, "book");
    r = advance(p, r, "warm");
    r = advance(p, r, "notice");
    expect(r.values.stallObserved).toBe(true);
    expect(r.values.outfit).toBe("jumper");
    expect(r.values.item).toBe("book");
    r = advance(p, r);
    r = advance(p, r);
    expect(r.ended).toBe(true);
    expect(advance(p, r)).toEqual(r);
    expect(r.values).not.toHaveProperty("maliceConfirmed");
  });
  it("restarts cleanly", () => {
    const p = demo();
    let r = advance(p, start(p));
    r = advance(p, r, "wait");
    expect(start(p).values.delayed).toBe(false);
  });
  it("is deterministic and resumes from serialized state", () => {
    const p = demo();
    const r = advance(p, start(p));
    expect(advance(p, r, "wait")).toEqual(
      advance(p, JSON.parse(JSON.stringify(r)), "wait"),
    );
  });
});
