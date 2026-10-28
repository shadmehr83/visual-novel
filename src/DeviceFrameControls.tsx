import { effectiveDevice } from "./deviceShared";
import type { Project, Scene } from "./model";
import { RangeInput } from "./RangeInput";
import { changeDeviceFrame, deviceBox, fitDeviceFrame } from "./deviceFrame";
export function DeviceFrameControls({
  project,
  scene,
  update,
  onAvatar,
}: {
  onAvatar?: (id: string | null) => void;
  project: Project;
  scene: Scene;
  update: (f: (s: Scene) => void) => void;
}) {
  const d = scene.phone ? effectiveDevice(project, scene) : undefined;
  if (!d) return null;
  const box = deviceBox(d);
  return (
    <section className="property-section">
      <h3>Device frame & contact</h3>
      <p>
        Width changes only the right edge; height changes only the lower edge.
        The upper-left corner stays fixed. Enable proportion lock when you want
        both dimensions to scale together.
      </p>
      <label>
        Device shape
        <select
          aria-label="Device shape"
          value={d.device}
          onChange={(e) =>
            update((s) => {
              s.phone!.device = e.target.value as typeof d.device;
            })
          }
        >
          <option value="phone">Phone</option>
          <option value="desktop">Computer / laptop</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          aria-label="Lock device proportions"
          checked={!!d.lockAspect}
          onChange={(e) =>
            update((s) =>
              changeDeviceFrame(s.phone!, { lockAspect: e.target.checked }),
            )
          }
        />
        Lock frame proportions
      </label>
      <button onClick={() => update((s) => fitDeviceFrame(s.phone!))}>
        Fit standard device proportions
      </button>
      {(["x", "y", "width", "height"] as const).map((key) => (
        <label key={key}>
          Device {key} · {Math.round(box[key] * 10) / 10}%
          <RangeInput
            aria-label={"Device " + key}
            data-help={
              key === "width"
                ? "Change only the frame width from its left edge. Turn on Lock frame proportions to scale height with it."
                : key === "height"
                  ? "Change only the frame height from its top edge. Content scrolls inside the device when needed."
                  : "Place the frame’s upper-left corner in scene percentages."
            }
            type="range"
            min={key === "width" ? 5 : key === "height" ? 20 : 0}
            max={key === "height" ? 98 : key === "y" ? 80 : 95}
            step=".1"
            value={Math.round(box[key] * 10) / 10}
            onChange={(e) =>
              update((s) =>
                changeDeviceFrame(s.phone!, { [key]: +e.target.value }),
              )
            }
          />
        </label>
      ))}
      <label>
        Contact name
        <input
          aria-label="Device contact"
          value={d.contact}
          onChange={(e) =>
            update((s) => {
              s.phone!.contact = e.target.value;
            })
          }
        />
      </label>
      <label>
        Contact status
        <input
          aria-label="Device contact status"
          value={d.title}
          onChange={(e) =>
            update((s) => {
              s.phone!.title = e.target.value;
            })
          }
        />
      </label>
      <label>
        Contact portrait
        <select
          aria-label="Device portrait"
          value={d.avatar || ""}
          data-help="Choose the contact’s face from project images. With shared phone appearance enabled, this portrait also appears on phones in other scenes. Select Initials to use a letter instead."
          onChange={(e) =>
            onAvatar
              ? onAvatar(e.target.value || null)
              : update((s) => {
                  s.phone!.avatar = e.target.value || null;
                })
          }
        >
          <option value="">Initials</option>
          {project.assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Typing delay · {d.typingSeconds}s
        <RangeInput
          aria-label="Device typingSeconds"
          type="range"
          min="0"
          max="5"
          step=".1"
          value={d.typingSeconds}
          onChange={(e) =>
            update((s) => {
              s.phone!.typingSeconds = +e.target.value;
            })
          }
        />
      </label>
      <label>
        Device entrance
        <select
          aria-label="Device entrance"
          value={d.entrance.style}
          onChange={(e) =>
            update((s) => {
              s.phone!.entrance.style = e.target
                .value as typeof d.entrance.style;
            })
          }
        >
          {["cut", "snappy", "smooth", "slide", "fade"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={d.keyboard}
          onChange={(e) =>
            update((s) => {
              s.phone!.keyboard = e.target.checked;
            })
          }
        />
        Show decorative keyboard with replies
      </label>
      <button
        className="danger"
        data-help="Remove only this scene’s device overlay and configuration. The background and dialogue remain. Undo restores the device."
        onClick={() =>
          update((s) => {
            delete s.phone;
          })
        }
      >
        Remove device UI
      </button>
    </section>
  );
}
