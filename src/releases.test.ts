import { it, expect } from "vitest";
import { ENGINE_VERSION, releases } from "./releases";
import pkg from "../package.json";
it("names every recorded milestone and supplies distinct feature directions", () => {
  expect(releases[0].version).toBe(ENGINE_VERSION);
  expect(pkg.version).toBe(ENGINE_VERSION);
  expect(releases).toHaveLength(41);
  expect(new Set(releases.map((r) => r.version)).size).toBe(releases.length);
  expect(
    new Set(releases.flatMap((r) => (r.commit ? [r.commit] : []))).size,
  ).toBe(39);
  for (const r of releases) {
    expect(Number.isFinite(Date.parse(r.timestamp || ""))).toBe(true);
    expect(r.features.length).toBeGreaterThan(0);
    for (const f of r.features) {
      expect(f.name.length).toBeGreaterThan(3);
      expect(f.description.length).toBeGreaterThan(20);
      expect(f.steps.length).toBeGreaterThanOrEqual(2);
    }
  }
});
