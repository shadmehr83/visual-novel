import { afterEach, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { unfoldAround, useFolds } from "./folds";

// Foldable groups (by Claude): the All effects view starts folded, other tabs open, and a click toggles.
afterEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
});
const frame = () => new Promise((r) => setTimeout(r, 40));
it("folds groups in the All view, keeps other tabs open and toggles on click", async () => {
  document.body.innerHTML = `<aside class="inspector">
    <div class="effects-dock" data-inspector="Atmosphere" data-panel="All"><section class="property-section"><h3>Falling rain</h3><label>Density <input></label></section></div>
    <div class="properties-dock" data-inspector="Background" data-panel="All"><section class="property-section"><h3>Background image</h3><p>Pick one</p></section></div>
  </aside>`;
  const view = renderHook(() => useFolds(true));
  await frame();
  const [rain, background] = document.querySelectorAll<HTMLElement>(".property-section");
  expect(rain.dataset.v3Fold).toBe("closed");
  expect(background.dataset.v3Fold).toBe("open");
  rain.querySelector("h3")!.click();
  expect(rain.dataset.v3Fold).toBe("open");
  expect(JSON.parse(localStorage.getItem("stillframe3-folds")!)["Atmosphere/All|Falling rain"]).toBe(true);
  rain.querySelector("h3")!.click();
  unfoldAround(rain.querySelector("input")!);
  expect(rain.dataset.v3Fold).toBe("open");
  view.unmount();
});
