import { cloneData as structuredClone } from "./cloneData";
import { AssetPicker } from "./AssetPicker";
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
  area = "all",
}: {
  area?: "all" | "appearance" | "apps";
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
  const upload = (
    target: string,
    name = target === "wallpaper"
      ? "wallpaper"
      : (
          {
            chat: "Ember icon",
            feed: "Insta icon",
            settings: "Settings icon",
            weather: "Weather icon",
          } as Record<string, string>
        )[target] || "app icon",
  ) => (
    <label className="device-upload">
      Upload {name}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
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
      className={compact ? "phone-settings-content" : "property-section"}
      data-effect-panel={compact ? undefined : "Phone"}
    >
      <h3>{compact ? "Device Settings" : "Phone & computer appearance"}</h3>
      <p>
        Only the device changes. Scene artwork and the Stillframe editor keep
        their own appearance.
      </p>
      <label data-help="Show a rainy-weather widget below the phone’s home-screen clock. Switch off to hide only the widget; the Weather app stays available.">
        <input type="checkbox" aria-label="Show weather widget" checked={appearance.weatherWidget !== false} onChange={e => set("weatherWidget", e.target.checked)} />
        Show weather widget
      </label>
      {area !== "apps" && (
        <>
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
          <AssetPicker project={project} label="Device wallpaper" value={appearance.wallpaper} empty="Solid background" onChange={id => set("wallpaper", id)} />
          {onUpload && upload("wallpaper")}
        </>
      )}
      {area !== "appearance" && (
        <>
          <h4>App icons & shortcuts</h4>
          <p>Custom app shortcuts open one of the built-in offline screens.</p>
          {["chat", "feed", "settings", "weather"].map((id) => (
            <div key={id}>
              <AssetPicker project={project} label={id + " app icon"} initialFolder="Profiles & app icons" value={appearance.icons[id]} empty="Default symbol" onChange={image => set("icons", {...appearance.icons, [id]: image || ""})} />
              {onUpload && upload(id)}
            </div>
          ))}
          <h4>App profile pictures</h4>
          {["chat", "feed"].map(id => <div key={id}>
            <AssetPicker project={project} label={id + " profile image"} initialFolder="Profiles & app icons" value={appearance.profiles[id]} empty="No profile image" onChange={image => set("profiles", {...appearance.profiles, [id]: image || ""})} />
            {appearance.profiles[id] && <img className="device-profile-picture" alt={id + " profile"} src={project.assets.find(a => a.id === appearance.profiles[id])?.data} />}
            {onUpload && upload("profile:" + id, (id === "chat" ? "Ember" : "Insta") + " profile image")}
          </div>)}
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
                  {["home", "chat", "feed", "settings", "weather"].map((s) => (
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
              {onUpload && upload(app.id, app.name + " icon")}
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
  else if (target.startsWith("profile:")) a.profiles[target.slice(8)] = asset.id;
  else if (["chat", "feed", "settings"].includes(target))
    a.icons[target] = asset.id;
  else
    a.apps = a.apps.map((app) =>
      app.id === target ? { ...app, icon: asset.id } : app,
    );
  return a;
}
