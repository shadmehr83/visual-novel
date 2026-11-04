import { Moon, Sun } from "lucide-react";
import { STILLFRAME3, V3, type Design, type Palette } from "./ui";
// Settings → Studio design (by Claude): switch between the Stillframe 3 design and the classic
// studio, and between light and dark. Both designs use the same project and Update history.
export function StudioDesign({ palette, onPalette, onDesign }: {
  palette: Palette;
  onPalette: (p: Palette) => void;
  onDesign: (d: Design) => void;
}) {
  return (
    <section className="design-switch" aria-label="Studio design">
      <h3>Studio design</h3>
      <p className="small">
        Both designs edit the same project and show the same Update history.{" "}
        {STILLFRAME3
          ? "Stillframe 3 opens on every start; the classic design stays until you close this tab."
          : "Your choice is remembered in this browser."}
      </p>
      <div className="design-options" role="group" aria-label="Studio design">
        <button
          aria-pressed={V3}
          data-help="Use the Stillframe 3 design: engine-style panels, foldable controls, light or dark palette. The page reloads; your work is saved first."
          onClick={() => !V3 && onDesign("v3")}
        >
          <b>Stillframe 3</b>
          <small>Engine-style layout, foldable controls, light or dark palette.</small>
        </button>
        <button
          aria-pressed={!V3}
          data-help={"Use the classic studio design. The page reloads; your work is saved first." + (STILLFRAME3 ? " A new start opens Stillframe 3 again." : "")}
          onClick={() => V3 && onDesign("classic")}
        >
          <b>Classic</b>
          <small>The previous studio layout and colours.</small>
        </button>
      </div>
      <div className="palette-switch">
        <span>{V3 ? "Palette" : "Theme"}</span>
        <div role="group" aria-label={V3 ? "Palette" : "Theme"}>
          <button aria-pressed={palette === "light"} data-help={V3 ? "Light palette for the Stillframe 3 design." : "Light interface theme for the classic design."} onClick={() => onPalette("light")}>
            <Sun size={14} aria-hidden="true" />Light
          </button>
          <button aria-pressed={palette === "dark"} data-help={V3 ? "Dark palette: the classic studio's colours in the Stillframe 3 layout. The stage, phone and game keep their own colours." : "Dark interface theme for the classic design."} onClick={() => onPalette("dark")}>
            <Moon size={14} aria-hidden="true" />Dark
          </button>
        </div>
      </div>
    </section>
  );
}
