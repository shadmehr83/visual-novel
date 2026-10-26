import { useEffect, useState } from "react";
export function describeControl(el: HTMLElement) {
  const name =
    el.getAttribute("aria-label") ||
    el.getAttribute("title") ||
    (el instanceof HTMLInputElement || el instanceof HTMLSelectElement
      ? el.labels?.[0]?.textContent
      : el.textContent) ||
    "Control";
  const label = name.trim().replace(/\s+/g, " ").slice(0, 100);
  const help = el.dataset.help;
  if (help) return { label, text: help };
  const rules: [RegExp, string][] = [
    [
      /hide dialogue|show dialogue/i,
      "Move the story dialogue overlay out of the way while editing artwork. Toggle it back whenever needed; the authored text is unchanged.",
    ],
    [
      /zoom|camera|depth|focal/i,
      "Move the view toward a chosen point in the scene. Zoom crops the existing artwork; it does not create new room geometry.",
    ],
    [
      /bob|sway|shake|step/i,
      "Small periodic movement suggests walking. Lower amounts are gentler; reduced motion pauses visual rocking. Footsteps need sound enabled.",
    ],
    [
      /save|export|publish/i,
      "Browser autosave stays on this device. A complete project JSON includes original artwork, audio and scene settings. Publish or upload that file to share it across devices.",
    ],
    [
      /wand|tolerance/i,
      "Select connected colours around your click in imported artwork. Higher tolerance selects more colours. This is local approximate selection; polygons help with multicoloured objects.",
    ],
    [
      /radius|spread/i,
      "Radius controls the soft light footprint; spread changes that radius with its intensity cycle. Selected-area lighting ignores the radius and illuminates its mask.",
    ],
    [
      /intensity|brightness|light/i,
      "Adjust the amount of light. A cycle multiplies the base intensity. Global illumination affects the scene; local lights can be restricted to painted regions.",
    ],
    [
      /rain|density|drop|opacity|angle/i,
      "Tune procedural rain. Enabled rain regions combine into one affected area. Opacity controls transparency; density controls the number of drops.",
    ],
    [
      /motion|strength|distortion|direction/i,
      "Sway and ripple the pixels inside a selected region. Use gentle amounts for cloth or plants. Original images remain unchanged.",
    ],
    [
      /scene|library|panel|layout|controls|collapse|expand|width|height/i,
      "Arrange the workspace without changing your story. Panels scroll separately in pinned mode. Page mode restores full-page scrolling; hidden removes the bottom editor.",
    ],
    [
      /cycle|sequence|seconds|duration|speed/i,
      "Control animation timing. Longer durations are slower. Lighting sequences fade smoothly between values; motion repeats according to its cycle.",
    ],
    [
      /dialogue|response|speaker|choice/i,
      "Author dialogue and branching choices. Custom responses are recorded in the playthrough and follow the authored next transition.",
    ],
    [
      /theme|colour|color|appearance|background/i,
      "Interface colours change only the editor. Scene artwork and lighting are saved separately in your project.",
    ],
    [
      /reduced|disable/i,
      "Pause or disable visual effects to reduce movement and rendering work. Your effect settings are retained.",
    ],
  ];
  const match = rules.find(([pattern]) => pattern.test(label));
  return {
    label,
    text:
      match?.[1] ||
      (el instanceof HTMLInputElement && el.type === "range"
        ? "Drag to adjust this value. The preview updates immediately; project properties support Undo."
        : "Use this control to edit or select the named setting. Scene changes preview immediately; interface preferences stay on this browser."),
  };
}
export function HoverHelp({ enabled }: { enabled: boolean }) {
  const [tip, setTip] = useState<{
    label: string;
    text: string;
    left: number;
    top: number;
  } | null>(null);
  useEffect(() => {
    if (!enabled) {
      setTip(null);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    let target: HTMLElement | null = null;
    const hide = () => {
      clearTimeout(timer);
      setTip(null);
      target = null;
    };
    const over = (event: Event) => {
      const element = (event.target as Element)?.closest<HTMLElement>(
        "button,input,select,textarea,summary,[data-help]",
      );
      if (
        !element ||
        element === target ||
        element.matches("input[type=password],input[type=file]")
      )
        return;
      hide();
      target = element;
      timer = setTimeout(() => {
        if (!element.isConnected) return;
        const box = element.getBoundingClientRect();
        if (box.bottom < 0 || box.top > innerHeight) return;
        setTip({
          ...describeControl(element),
          left: Math.max(
            8,
            Math.min(
              innerWidth - 288,
              box.left > 300 ? box.left - 286 : box.right + 10,
            ),
          ),
          top: Math.max(8, Math.min(innerHeight - 270, box.top)),
        });
      }, 700);
    };
    const out = (event: PointerEvent) => {
      if (
        target &&
        event.relatedTarget instanceof Node &&
        target.contains(event.relatedTarget)
      )
        return;
      hide();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    document.addEventListener("pointerover", over);
    document.addEventListener("focusin", over);
    document.addEventListener("pointerout", out);
    document.addEventListener("focusout", hide);
    document.addEventListener("scroll", hide, true);
    document.addEventListener("keydown", key);
    return () => {
      hide();
      document.removeEventListener("pointerover", over);
      document.removeEventListener("focusin", over);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("focusout", hide);
      document.removeEventListener("scroll", hide, true);
      document.removeEventListener("keydown", key);
    };
  }, [enabled]);
  return tip ? (
    <div
      role="tooltip"
      className="hover-help"
      style={{ left: tip.left, top: tip.top }}
    >
      <b>{tip.label}</b>
      <p>{tip.text}</p>
      {/camera|zoom|depth|focal/i.test(tip.label) && (
        <svg viewBox="0 0 200 60" aria-label="Camera zoom toward a focal point">
          <rect
            x="5"
            y="5"
            width="180"
            height="50"
            fill="none"
            stroke="currentColor"
          />
          <rect
            x="105"
            y="16"
            width="55"
            height="29"
            fill="none"
            stroke="currentColor"
            strokeDasharray="4 3"
          />
          <path d="M45 30H95m-9-6 9 6-9 6" fill="none" stroke="currentColor" />
        </svg>
      )}
    </div>
  ) : null;
}
