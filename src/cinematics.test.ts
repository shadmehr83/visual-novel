import { expect, it } from "vitest";
import { applyProposal, aiContext } from "./ai";
import { samplePose, restingPose } from "./cinematics";
import { savedProject } from "./savedProject";
import { validateProject, advance, start, respond } from "./model";
it("interpolates a joint around independent offsets/angles and fades between positions", () => {
  const a = restingPose("a"),
    b = { ...restingPose("b"), x: 100, y: 30, angle: 60 };
  expect(samplePose(a, b, 0.5, "smooth")).toMatchObject({
    x: 50,
    y: 15,
    angle: 30,
    opacity: 1,
  });
  expect(samplePose(a, b, 0.2, "snappy").angle).toBe(60);
  expect(samplePose(a, b, 0.49, "fade").x).toBe(0);
  expect(samplePose(a, b, 0.5, "fade")).toMatchObject({ x: 100, opacity: 0 });
  expect(samplePose(a, b, 1, "fade")).toMatchObject({ x: 100, opacity: 1 });
});
it("rejects dangling joint pose and expression references", () => {
  const p = savedProject();
  p.scenes[0].joints = [
    {
      id: "finger",
      name: "Finger",
      enabled: true,
      pivotX: 200,
      pivotY: 200,
      region: { id: "r", name: "r", enabled: true, points: [] },
      transition: { style: "smooth", seconds: 0.5 },
      poses: [{ ...restingPose("missing-node") }],
    },
  ];
  expect(() => validateProject(p)).toThrow("Missing joint pose dialogue");
  p.scenes[0].joints[0].poses[0].node = p.scenes[0].nodes[0].id;
  p.scenes[0].joints[0].poses[0].asset = "missing-art";
  expect(() => validateProject(p)).toThrow("Missing expression image");
});
it("records actual chosen phone replies, persists transcripts and includes self-replies without inventing AI dialogue", () => {
  const p = savedProject();
  const phone = p.scenes.find((s) => s.id === "messages")!;
  p.scenes = [phone];
  phone.nodes = [
    {
      id: "hello",
      speaker: "Maria",
      text: "Hello.",
      choices: [
        {
          id: "reply",
          text: "Hi Maria.",
          target: "next",
          actions: [],
          note: "",
        },
      ],
    },
    {
      id: "next",
      speaker: "Maria",
      text: "Nice to meet you.",
      choices: [],
      next: "end",
    },
    { id: "end", speaker: "Narrator", text: "End", choices: [] },
  ];
  let r = advance(p, start(p), "reply");
  expect(r.phoneMessages?.map((m) => m.text)).toEqual([
    "Hello.",
    "Hi Maria.",
    "Nice to meet you.",
  ]);
  r = respond(p, JSON.parse(JSON.stringify(r)), "My own words");
  expect(r.phoneMessages?.at(-1)?.text).toBe("My own words");
  expect(r.responses?.at(-1)?.text).toBe("My own words");
  expect(r.node).toBe("end");
});
it("keeps one shared device background and the cafe portrait source untouched", () => {
  const p = savedProject();
  const phone = p.scenes.find((s) => s.id === "messages")!,
    invitation = p.scenes.find((s) => s.id === "invitation")!;
  expect(phone.background).toBe(invitation.background);
  expect(phone.phone?.contact).toBe("Maria");
  expect(p.assets.some((a) => a.id === "first-match-phone")).toBe(false);
  expect(p.characters[0].name).toBe("Maria");
});

it("the voice/provider assistant can propose a validated hinge edit without asset bytes", () => {
  const p = savedProject(),
    s = p.scenes[0];
  const joint = {
    id: "hand",
    name: "Hand",
    enabled: true,
    pivotX: 200,
    pivotY: 200,
    region: { id: "hand", name: "Hand", enabled: true, points: [] },
    transition: { style: "smooth", seconds: 0.4 },
    poses: [{ ...restingPose(s.nodes[0].id), angle: 10 }],
  };
  const result = applyProposal(p, {
    explanation: "Move the selected hand",
    assumptions: ["Author supplies the affected mask"],
    operations: [{ type: "joint", scene: s.id, joint }],
  });
  expect(result.scenes[0].joints?.[0].poses[0].angle).toBe(10);
  expect(JSON.stringify(aiContext(result))).not.toContain("data:image/");
  expect(p.scenes[0].joints).toBeUndefined();
});
