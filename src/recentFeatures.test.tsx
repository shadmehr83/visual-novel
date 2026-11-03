import { expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
// Runs as Stillframe 3, which marks the five latest releases.
vi.hoisted(() => {
  document.documentElement.dataset.ui = "v3";
});
import { RecentFeatures } from "./RecentFeatures";

// New-feature marks (by Claude): recent controls are marked, matched by full or starting name; the game stays unmarked.
it("marks recent controls by name or name start, but not inside the game", async () => {
  document.body.innerHTML = `<button>✦ Ask Claude</button><button aria-label="Enlarge background of Café">⤢</button>
    <label><input type="checkbox" aria-label="Dialogue switched on"> Dialogue switched on</label>
    <div class="stage-frame"><button>✦ Ask Claude</button></div><button>Old control</button>`;
  const view = render(<RecentFeatures />);
  await new Promise((r) => setTimeout(r, 200));
  const [ask, enlarge, inGame, old] = document.querySelectorAll<HTMLElement>("button");
  expect(ask.dataset.recent).toBe("2.29.0-claude");
  expect(ask.dataset.new).toBe("v2.29.0");
  expect(enlarge.dataset.recent).toBe("2.29.0-claude");
  expect(document.querySelector<HTMLInputElement>("input")!.dataset.recent).toBe("2.29.0-claude");
  expect(document.querySelector<HTMLElement>("label")!.dataset.new).toBe("v2.29.0");
  expect(inGame.dataset.recent).toBeUndefined();
  expect(old.dataset.recent).toBeUndefined();
  view.unmount();
});
