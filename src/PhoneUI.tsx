import { deviceBox } from "./deviceFrame";
import { PhoneApps } from "./PhoneApps";
import {
  DeviceAppearanceControls,
  type DeviceAppearance,
} from "./DeviceAppearance";
import { usePaused } from "./PlaySession";
import { deviceScreen, allowsReply } from "./interactions";
import { useEffect, useRef, useState } from "react";
import type { Project, Scene, Runtime, Node } from "./model";
import { SelfReply } from "./SelfReply";
export function PhoneUI({
  project,
  scene,
  node,
  runtime,
  onStep,
  onReply,
  onRestart,
  onAppearance,
  onUpload,
  screenOverride,
}: {
  screenOverride?: "home" | "chat" | "feed" | "settings";
  project: Project;
  scene: Scene;
  node: Node;
  runtime: Runtime | null;
  onStep: (id?: string) => void;
  onReply: (text: string, choiceId?: string) => void;
  onRestart?: () => void;
  onAppearance?: (a: DeviceAppearance) => void;
  onUpload?: (a: Project["assets"][number], target: string) => void;
}) {
  const config = scene.phone!;
  const box = deviceBox(config);
  const paused = usePaused();
  const [localAppearance, setLocalAppearance] = useState(config.appearance);
  const appearance = config.appearance || localAppearance;
  const wallpaper = project.assets.find((a) => a.id === appearance?.wallpaper);
  const effective =
    screenOverride ||
    deviceScreen(
      scene,
      node,
      runtime?.nodeVisits
        ?.filter((v) => v.scene === scene.id)
        .map((v) => v.node),
    );
  const [screen, setScreen] = useState<"home" | "feed" | "chat" | "settings">(
    effective === "off" ? "home" : effective,
  );
  useEffect(() => {
    if (effective !== "off") setScreen(effective);
  }, [effective, scene.id]);
  const [typing, setTyping] = useState(false);
  const feed = useRef<HTMLDivElement>(null);
  const reduced =
    project.settings.reducedEffects ||
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    setTyping(
      !!runtime &&
        screen === "chat" &&
        node.speaker === config.contact &&
        config.typingSeconds > 0 &&
        !reduced &&
        !paused,
    );
    if (paused) return;
    const timer = setTimeout(
      () => setTyping(false),
      config.typingSeconds * 1000,
    );
    return () => clearTimeout(timer);
  }, [node.id, config.typingSeconds, reduced, screen, paused]);
  const messages = (
    runtime
      ? runtime.phoneMessages || []
      : [config.contact, "You"].includes(node.speaker)
        ? [
            {
              scene: scene.id,
              node: node.id,
              sender: node.speaker,
              text: node.text,
            },
          ]
        : []
  ).filter(
    (m) =>
      project.scenes.find((s) => s.id === m.scene)?.phone?.contact ===
      config.contact,
  );
  useEffect(() => {
    feed.current?.scrollTo({
      top: feed.current.scrollHeight,
      behavior: reduced ? "instant" : "smooth",
    });
  }, [messages.length, typing, node.id]);
  const choices = node.choices.filter(
    (c) =>
      !c.condition || runtime?.values[c.condition.key] === c.condition.equals,
  );
  const avatar = project.assets.find((a) => a.id === config.avatar);
  const currentIsMessage = messages.some(
    (m) => m.scene === scene.id && m.node === node.id && m.text === node.text,
  );
  return (
    <section
      className={
        "device-overlay " +
        (reduced ? "device-reduced " : "") +
        (config.device === "desktop" ? "device-desktop" : "")
      }
      aria-label="Phone conversation"
      style={
        {
          left: box.x + "%",
          top: box.y + "%",
          transform: "none",
          "--frame-width": box.width + "%",
          "--frame-height": box.height + "%",
          "--device-bg": appearance?.background || "#211e29",
          "--device-text": appearance?.textColor || "#eee1e9",
          "--device-font": appearance?.font || "Arial",
          "--device-size": (appearance?.fontSize || 14) + "px",
          "--device-wallpaper": wallpaper ? `url("${wallpaper.data}")` : "none",
          "--device-duration": `${config.entrance.seconds}s`,
        } as React.CSSProperties
      }
    >
      <div
        className={
          "device-shell device-" + (reduced ? "cut" : config.entrance.style)
        }
      >
        <div className="device-status">
          <span>16:00</span>
          <span>◔ ▰</span>
        </div>
        <header className="device-contact">
          {config.mode === "phone-system" && (
            <button
              type="button"
              aria-label="Back to phone home"
              data-help="Return to the phone home screen. This does not undo a story choice or delete messages."
              onClick={() => setScreen("home")}
            >
              ‹
            </button>
          )}
          {avatar ? (
            <img src={avatar.data} alt="" />
          ) : (
            <span className="contact-monogram">
              {config.contact.slice(0, 1)}
            </span>
          )}
          <div>
            <b>
              {screen === "chat"
                ? config.contact
                : screen === "feed"
                  ? "Insta"
                  : screen === "settings"
                    ? "Settings"
                    : config.device === "desktop"
                      ? "Computer"
                      : "Phone"}
            </b>
            <small>
              {screen === "chat"
                ? config.title
                : screen === "feed"
                  ? "Fictional offline feed"
                  : "Local device"}
            </small>
          </div>
          <span>···</span>
        </header>
        {config.mode === "phone-system" && screen !== "home" && (
          <nav className="phone-app-nav" data-no-advance>
            <button onClick={() => setScreen("home")}>Home</button>
            <button onClick={() => setScreen("chat")}>Ember</button>
            <button onClick={() => setScreen("feed")}>Insta</button>
          </nav>
        )}
        {node.phoneNotice && (
          <button
            className="phone-notification"
            data-help="Open this story notification. If an authored Open reply is available, its branch is followed; otherwise this opens the chat app."
            onClick={() => {
              const c = choices.find((c) => /open|read.*message/i.test(c.text));
              if (c) onStep(c.id);
              else setScreen("chat");
            }}
          >
            {node.phoneNotice}
            <small>Open notification</small>
          </button>
        )}
        {screen === "settings" ? (
          <DeviceAppearanceControls
            compact
            project={project}
            value={appearance}
            onChange={(a) => {
              setLocalAppearance(a);
              onAppearance?.(a);
            }}
            onUpload={onUpload}
          />
        ) : screen !== "chat" ? (
          <PhoneApps
            screen={screen}
            onOpen={setScreen}
            project={project}
            appearance={appearance}
          />
        ) : (
          <div className="device-feed" ref={feed} aria-live="polite">
            <p className="device-date">Today · Ember</p>
            {messages.map((m, i) =>
              typing && m.node === node.id && m.scene === scene.id ? null : (
                <div
                  key={i}
                  className={
                    "message-bubble " +
                    (m.sender === "You" ? "message-you" : "message-contact")
                  }
                >
                  <span>{m.text}</span>
                  <small>{m.sender === "You" ? "You" : config.contact}</small>
                </div>
              ),
            )}
            {typing && (
              <div
                className="typing-bubble"
                aria-label={config.contact + " is typing"}
              >
                <i />
                <i />
                <i />
              </div>
            )}
            {!currentIsMessage && (
              <p className="device-narration">{node.text}</p>
            )}
          </div>
        )}
        <div className="device-actions">
          {screen !== "chat" && <p className="device-narration">{node.text}</p>}
          {runtime?.ended ? (
            <div>
              <p>End of conversation</p>
              {onRestart && <button onClick={onRestart}>Restart story</button>}
            </div>
          ) : typing ? (
            <span className="small muted">{config.contact} is typing…</span>
          ) : (
            <>
              {choices.length ? (
                <div className="device-replies">
                  {choices.map((c) => (
                    <button key={c.id} onClick={() => onStep(c.id)}>
                      {c.text}
                    </button>
                  ))}
                </div>
              ) : (
                <button className="device-continue" onClick={() => onStep()}>
                  Continue
                </button>
              )}
              {allowsReply(scene, node, true) && (
                <SelfReply
                  choices={choices}
                  nodeId={node.id}
                  onSend={onReply}
                />
              )}
            </>
          )}
        </div>
        {screen === "chat" &&
          config.keyboard &&
          choices.length > 0 &&
          !typing && (
            <div className="device-keyboard" aria-hidden>
              {[
                "Q W E R T Y U I O P",
                "A S D F G H J K L",
                "⇧ Z X C V B N M ⌫",
              ].map((row) => (
                <div key={row}>
                  {row.split(" ").map((key) => (
                    <span key={key}>{key}</span>
                  ))}
                </div>
              ))}
              <div>
                <span className="space-key">space</span>
              </div>
            </div>
          )}
        {config.mode === "phone-system" && (
          <button
            className="device-home"
            aria-label="Phone home"
            data-help="Return to the home screen without deleting messages or rewinding the story."
            onClick={() => setScreen("home")}
          />
        )}
      </div>
    </section>
  );
}
