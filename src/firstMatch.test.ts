import { expect, it } from "vitest";
import { savedProject } from "./savedProject";
import { start, advance } from "./model";
import preserved from "../docs/story/preserved-cafe.json";

function play(
  overrides: (text: string, scene: string) => boolean = () => false,
) {
  const p = savedProject();
  let r = start(p);
  const lines: string[] = [];
  for (let step = 0; step < 240 && !r.ended; step++) {
    const s = p.scenes.find((s) => s.id === r.scene)!;
    const n = s.nodes.find((n) => n.id === r.node)!;
    lines.push(n.text);
    const available = n.choices.filter(
      (c) => !c.condition || r.values[c.condition.key] === c.condition.equals,
    );
    const c =
      available.find((c) => overrides(c.text, s.id)) ||
      (n.id === "room"
        ? available.find((c) => ["notification", "browse-feed"].includes(c.target))
        : available[0]);
    r = advance(p, r, c?.id);
  }
  expect(r.ended).toBe(true);
  return { r, lines };
}

it("preserves every cafe visual setting and the original PNG bytes", () => {
  const p = savedProject();
  const { nodes, entry, ...visuals } = p.scenes.find((s) => s.id === "cafe")!;
  expect(visuals).toEqual(preserved.scene);
  const image = p.assets.find((a) => a.id === visuals.background)!;
  let fingerprint = 2166136261;
  for (let i = 0; i < image.data.length; i++)
    fingerprint =
      Math.imul(fingerprint ^ image.data.charCodeAt(i), 16777619) >>> 0;
  expect(fingerprint).toBe(preserved.imageDataFingerprint);
  expect(nodes).toHaveLength(79);
  expect(nodes.some((n) => n.id === "goodbye")).toBe(false);
});

it("plays from bedroom through every cafe topic to a hopeful ending without an API", () => {
  const { r, lines } = play();
  expect(r.visited).toEqual([
    "bedroom",
    "messages",
    "invitation",
    "outfit",
    "journey",
    "cafe",
    "departure",
  ]);
  expect(r.values.date_agreed).toBe(true);
  expect(r.values.second_meeting_interest).toBe("yes");
  expect(lines.some((t) => t.includes("orange peel"))).toBe(true);
  expect(lines.some((t) => t.includes("almost cancelled"))).toBe(true);
  expect(
    lines.filter((t) => t.includes("I had spent the walk here")),
  ).toHaveLength(1);
  expect(
    lines.some((t) => t.includes("ten minutes complaining about cake")),
  ).toBe(true);
});

it.each([
  ["I don’t think I’m up for meeting today", "date_declined"],
  ["I’m not sure about today", "date_deferred"],
])("respects a non-date invitation branch: %s", (prefix, flag) => {
  const { r } = play(
    (text, scene) => scene === "invitation" && text.startsWith(prefix),
  );
  expect(r.values[flag]).toBe(true);
  expect(r.visited).not.toContain("cafe");
  expect(r.values.date_agreed).toBe(false);
});

it("allows dismissing a notification and leaving the app unopened", () => {
  const { r } = play(
    (text) =>
      text === "Dismiss the notification" ||
      text === "Leave the phone alone for today",
  );
  expect(r.values.notification_dismissed).toBe(true);
  expect(r.visited).toEqual(["bedroom"]);
});

it("respects declining a second meeting and sends no followup", () => {
  const { r, lines } = play((text) =>
    text.startsWith("I don’t think it’s a match"),
  );
  expect(r.values.second_meeting_interest).toBe("no");
  expect(
    lines.some((t) => t.includes("ten minutes complaining about cake")),
  ).toBe(false);
});

it("outfits are cosmetic and asking for a public place still permits the date", () => {
  const { r } = play(
    (text) =>
      text.startsWith("I’d rather meet somewhere public") ||
      text === "Familiar / low effort",
  );
  expect(r.values.outfit_choice).toBe("familiar");
  expect(r.values.boundary_set).toBe(true);
  expect(r.values.date_agreed).toBe(true);
  expect(r.values.suspicion).toBe(0);
});

it("keeps every departure branch in the new phone scene and leaves valid exits from each café reflection", () => {
  const p = savedProject(),
    cafe = p.scenes.find((s) => s.id === "cafe")!,
    departure = p.scenes.at(-1)!;
  expect(departure.id).toBe("departure");
  expect(departure.phone?.contact).toBe("Maria");
  expect(departure.phone?.enabled).toBe(true);
  expect(departure.nodes.map((n) => n.id)).toEqual(
    expect.arrayContaining([
      "goodbye",
      "again",
      "contact",
      "after-message",
      "end",
    ]),
  );
  for (const id of ["reflect-neutral", "reflect-warm", "reflect-guarded"])
    expect(cafe.nodes.find((n) => n.id === id)!.choices[0]).toMatchObject({
      target: "departure",
      sendAsMessage: false,
    });
  expect(departure.nodes.find((n) => n.id === "after-message")!.speaker).toBe(
    "Maria",
  );
  expect(
    new Set(
      departure.nodes
        .find((n) => n.id === "after-message")!
        .choices.map((c) => c.id),
    ).size,
  ).toBe(4);
  expect(p.assets.find((a) => a.id === departure.background)!.data).toMatch(
    /^data:image\/webp;base64,/,
  );
});

it.each([
  ["I’d be open to meeting again.", "slow"],
  ["I’m glad we met.", "uncertain"],
])("preserves the %s departure branch and follow-up", (prefix, interest) => {
  const { r, lines } = play((text) => text.startsWith(prefix));
  expect(r.visited.at(-1)).toBe("departure");
  expect(r.values.second_meeting_interest).toBe(interest);
  expect(
    lines.some((t) => t.includes("ten minutes complaining about cake")),
  ).toBe(true);
});
