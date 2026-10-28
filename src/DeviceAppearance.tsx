import { useState } from "react";
import { deviceAppearanceSchema, type Project, type Scene } from "./model";
import { readImage } from "./storage";
export type DeviceAppearance = NonNullable<
  NonNullable<Scene["phone"]>["appearance"]
>;
export function DeviceAppearanceControls({
  project,
  value,
  onChange,
  onUpload,
  compact = false,
}: {
  project: Project;
  value?: DeviceAppearance;
  onChange: (value: DeviceAppearance) => void;
  onUpload?: (asset: Project["assets"][number], target: string) => void;
  compact?: boolean;
}) {
  const appearance = value || deviceAppearanceSchema.parse({});
  const [error, setError] = useState("");
  const set = <K extends keyof DeviceAppearance>(
    key: K,
    v: DeviceAppearance[K],
  ) => onChange({ ...appearance, [key]: v });
  const upload = (target: string) => (
    <label className="device-upload">
      Upload {target === "wallpaper" ? "wallpaper" : target + " icon"}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          try {
            const a = await readImage(f);
            onUpload?.(a, target);
            setError("");
          } catch (e) {
            setError(String(e));
          }
        }}
      />
    </label>
  );
  return (
    <section
      className={compact ? "phone-settings-screen" : "property-section"}
      data-effect-panel={compact ? undefined : "Phone"}
    >
      <h3>{compact ? "Device Settings" : "Phone & computer appearance"}</h3>
      <p>
        Only the device changes. Scene artwork and the Stillframe editor keep
        their own appearance.
      </p>
      <label>
        Device background colour
        <input
          aria-label="Device background colour"
          type="color"
          value={appearance.background}
          onChange={(e) => set("background", e.target.value)}
        />
      </label>
      <label>
        Device text colour
        <input
          aria-label="Device text colour"
          type="color"
          value={appearance.textColor}
          onChange={(e) => set("textColor", e.target.value)}
        />
      </label>
      <label>
        Device font
        <select
          aria-label="Device font"
          value={appearance.font}
          onChange={(e) =>
            set("font", e.target.value as DeviceAppearance["font"])
          }
        >
          {["Arial", "Verdana", "Trebuchet MS", "Georgia", "monospace"].map(
            (f) => (
              <option key={f}>{f}</option>
            ),
          )}
        </select>
      </label>
      <label>
        Device text size · {appearance.fontSize}px
        <input
          aria-label="Device text size"
          type="range"
          min="10"
          max="22"
          value={appearance.fontSize}
          onChange={(e) => set("fontSize", +e.target.value)}
        />
      </label>
      <label>
        Device wallpaper
        <select
          aria-label="Device wallpaper"
          value={appearance.wallpaper || ""}
          onChange={(e) => set("wallpaper", e.target.value || null)}
        >
          <option value="">Solid background</option>
          {project.assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      {onUpload && upload("wallpaper")}
      {!compact && (
        <>
          <h4>App icons & shortcuts</h4>
          <p>Custom app shortcuts open one of the built-in offline screens.</p>
          {["chat", "feed", "settings"].map((id) => (
            <div key={id}>
              <label>
                {id === "chat"
                  ? "Ember messages"
                  : id === "feed"
                    ? "Insta"
                    : "Settings"}{" "}
                icon
                <select
                  aria-label={id + " app icon"}
                  value={appearance.icons[id] || ""}
                  onChange={(e) =>
                    set("icons", { ...appearance.icons, [id]: e.target.value })
                  }
                >
                  <option value="">Default symbol</option>
                  {project.assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              {onUpload && upload(id)}
            </div>
          ))}
          {appearance.apps.map((app, i) => (
            <details key={app.id} open>
              <summary>{app.name}</summary>
              <label>
                App name
                <input
                  value={app.name}
                  maxLength={40}
                  onChange={(e) =>
                    set(
                      "apps",
                      appearance.apps.map((a, j) =>
                        j === i
                          ? { ...a, name: e.target.value || "New app" }
                          : a,
                      ),
                    )
                  }
                />
              </label>
              <label>
                App opens
                <select
                  value={app.screen}
                  onChange={(e) =>
                    set(
                      "apps",
                      appearance.apps.map((a, j) =>
                        j === i
                          ? {
                              ...a,
                              screen: e.target.value as typeof app.screen,
                            }
                          : a,
                      ),
                    )
                  }
                >
                  {["home", "chat", "feed", "settings"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                App image
                <select
                  value={app.icon || ""}
                  onChange={(e) =>
                    set(
                      "apps",
                      appearance.apps.map((a, j) =>
                        j === i ? { ...a, icon: e.target.value || null } : a,
                      ),
                    )
                  }
                >
                  <option value="">Default symbol</option>
                  {project.assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              {onUpload && upload(app.id)}
              <button
                onClick={() =>
                  set(
                    "apps",
                    appearance.apps.filter((a) => a.id !== app.id),
                  )
                }
              >
                Remove shortcut {app.name}
              </button>
            </details>
          ))}
          <button
            disabled={appearance.apps.length >= 12}
            onClick={() =>
              set("apps", [
                ...appearance.apps,
                {
                  id: crypto.randomUUID(),
                  name: "New app",
                  icon: null,
                  screen: "feed",
                },
              ])
            }
          >
            Add app shortcut
          </button>
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
export function withDeviceUpload(
  value: DeviceAppearance | undefined,
  asset: Project["assets"][number],
  target: string,
) {
  const a = structuredClone(value || deviceAppearanceSchema.parse({}));
  if (target === "wallpaper") a.wallpaper = asset.id;
  else if (["chat", "feed", "settings"].includes(target))
    a.icons[target] = asset.id;
  else
    a.apps = a.apps.map((app) =>
      app.id === target ? { ...app, icon: asset.id } : app,
    );
  return a;
}
