import { Moon, Sun } from "lucide-react";
import { V3, type Design, type Palette } from "./ui";
// Settings → Studio design (by Claude): switch between the Stillframe 3.1 design and the classic
// studio, and between the light and dark palettes. Both designs use the same project and history.
export function StudioDesign({ palette, onPalette, onDesign }: {
  palette: Palette;
  onPalette: (p: Palette) => void;
  onDesign: (d: Design) => void;
}) {
  return (
    <section className="design-switch" aria-label="Studio design">
      <h3>Studio design</h3>
      <p className="small">
        Both designs edit the same project and show the same Update history. Stillframe 3.1 opens on
        every start; the classic design stays until you close this tab.
      </p>
      <div className="design-options" role="group" aria-label="Studio design">
        <button
          aria-pressed={V3}
          data-help="Use the Stillframe 3.1 design: engine-style panels, foldable controls, light or dark palette. The page reloads; your work is saved first."
          onClick={() => !V3 && onDesign("v3")}
        >
          <b>Stillframe 3.1</b>
          <small>Engine-style layout, foldable controls, light or dark palette.</small>
        </button>
        <button
          aria-pressed={!V3}
          data-help="Use the classic studio design for this tab. The page reloads; your work is saved first. A new start opens Stillframe 3.1 again."
          onClick={() => V3 && onDesign("classic")}
        >
          <b>Classic</b>
          <small>The previous studio layout and colours.</small>
        </button>
      </div>
      {V3 && (
        <div className="palette-switch">
          <span>Palette</span>
          <div role="group" aria-label="Palette">
            <button aria-pressed={palette === "light"} data-help="Light palette for the Stillframe 3.1 design." onClick={() => onPalette("light")}>
              <Sun size={14} aria-hidden="true" />Light
            </button>
            <button aria-pressed={palette === "dark"} data-help="Dark palette: the classic studio's colours in the Stillframe 3.1 layout. The stage, phone and game keep their own colours." onClick={() => onPalette("dark")}>
              <Moon size={14} aria-hidden="true" />Dark
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
