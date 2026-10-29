import type { Project, Scene } from "./model";
import { InstaFeed } from "./InstaFeed";
export function PhoneApps({
  screen,
  onOpen,
  project,
  appearance,
}: {
  project: Project;
  appearance?: NonNullable<Scene["phone"]>["appearance"];
  screen: "home" | "feed";
  onOpen: (screen: "home" | "feed" | "chat" | "settings") => void;
}) {
  const icon = (id: string, symbol: string) => {
    const asset = project.assets.find((a) => a.id === appearance?.icons[id]);
    return asset ? <img src={asset.data} alt="" /> : symbol;
  };
  return screen === "home" ? (
    <div className="phone-home-screen" data-no-advance>
      <div className="phone-clock">
        16:00<small>A quiet afternoon</small>
      </div>
      <div className="phone-app-grid">
        <button
          data-help="Open Ember messages on this fictional phone. This does not send anything to a real person or advance the story."
          onClick={() => onOpen("chat")}
        >
          <span>{icon("chat", "♡")}</span>Ember<small>Messages</small>
        </button>
        <button
          data-help="Open Insta’s illustrated video feed. Scroll to watch, like posts and read fictional comments. Browsing leaves story choices untouched."
          onClick={() => onOpen("feed")}
        >
          <span>{icon("feed", "▶")}</span>Insta<small>Video feed</small>
        </button>
        <button onClick={() => onOpen("settings")}>
          <span>{icon("settings", "⚙")}</span>Settings
          <small>Device appearance</small>
        </button>
        {appearance?.apps.map((app) => (
          <button key={app.id} onClick={() => onOpen(app.screen)}>
            <span>
              {app.icon ? (
                <img
                  src={project.assets.find((a) => a.id === app.icon)?.data}
                  alt=""
                />
              ) : (
                "◇"
              )}
            </span>
            {app.name}
          </button>
        ))}
        <div className="phone-app-disabled">
          ☀<small>Weather · decorative</small>
        </div>
      </div>
      <p className="small muted">
        Ember and Insta open. Other icons are scenery.
      </p>
    </div>
  ) : (
    <InstaFeed project={project} profile={project.assets.find(a => a.id === appearance?.profiles.feed)?.data} />
  );
}
