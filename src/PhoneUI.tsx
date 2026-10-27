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
}: {
  project: Project;
  scene: Scene;
  node: Node;
  runtime: Runtime | null;
  onStep: (id?: string) => void;
  onReply: (text: string, choiceId?: string) => void;
  onRestart?: () => void;
}) {
  const config = scene.phone!;
  const [typing, setTyping] = useState(false);
  const feed = useRef<HTMLDivElement>(null);
  const reduced =
    project.settings.reducedEffects ||
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    setTyping(
      !!runtime &&
        node.speaker === config.contact &&
        config.typingSeconds > 0 &&
        !reduced,
    );
    const timer = setTimeout(
      () => setTyping(false),
      config.typingSeconds * 1000,
    );
    return () => clearTimeout(timer);
  }, [node.id, config.typingSeconds, reduced]);
  const messages = runtime
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
      : [];
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
          left: config.x + "%",
          top: config.y + "%",
          width: config.width + "%",
          "--phone-height":
            Math.min(96, Math.max(40, (config.width / 44) * 94)) + "%",
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
          <span aria-hidden>‹</span>
          {avatar ? (
            <img src={avatar.data} alt="" />
          ) : (
            <span className="contact-monogram">
              {config.contact.slice(0, 1)}
            </span>
          )}
          <div>
            <b>{config.contact}</b>
            <small>{config.title}</small>
          </div>
          <span>···</span>
        </header>
        <div className="device-feed" ref={feed} aria-live="polite">
          <p className="device-date">Today · Nearside</p>
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
          {!currentIsMessage && <p className="device-narration">{node.text}</p>}
        </div>
        <div className="device-actions">
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
              {node.allowCustomResponse !== false && (
                <SelfReply
                  choices={choices}
                  nodeId={node.id}
                  onSend={onReply}
                />
              )}
            </>
          )}
        </div>
        {config.keyboard && choices.length > 0 && !typing && (
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
        <div className="device-home" />
      </div>
    </section>
  );
}
