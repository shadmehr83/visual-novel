import { expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
// Runs as Stillframe 3, which marks the five latest releases.
vi.hoisted(() => {
  document.documentElement.dataset.ui = "v3";
});
import { RecentFeatures } from "./RecentFeatures";

// New-feature marks (by Claude): recent controls are marked with their version; the game and older controls stay unmarked.
it("marks recent controls, but not inside the game or from older releases", async () => {
  document.body.innerHTML = `<details><summary>Export &amp; share</summary></details>
    <label><input type="checkbox" aria-label="Timed decision"> Timed decision</label>
    <div class="stage-frame"><button aria-label="Dark palette">◐</button></div>
    <button>✦ Ask Claude</button><button aria-label="Dark palette">◐</button>`;
  const view = render(<RecentFeatures />);
  await new Promise((r) => setTimeout(r, 200));
  const [inGame, older, palette] = document.querySelectorAll<HTMLElement>("button");
  expect(document.querySelector<HTMLElement>("summary")!.dataset.new).toBe("v3.1.0");
  expect(document.querySelector<HTMLInputElement>("input")!.dataset.recent).toBe("2.30.0-claude");
  expect(document.querySelector<HTMLElement>("label")!.dataset.new).toBe("v2.30.0");
  expect(palette.dataset.recent).toBe("3.1.1-claude");
  expect(inGame.dataset.recent).toBeUndefined();
  expect(older.dataset.recent).toBeUndefined();
  view.unmount();
});
