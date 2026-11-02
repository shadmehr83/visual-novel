import { usePaused } from "./PlaySession";
import { viewKey, viewTransition } from "./viewTransitions";
import { SceneAudio, Qte } from "./EngineTools";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
} from "react";
import type { Scene } from "./model";
export function SceneTransition({
  scene,
  playing,
  reduced,
  children,
  nodeId,
}: {
  scene: Scene;
  playing: boolean;
  reduced: boolean;
  children: ReactNode;
  nodeId?: string;
}) {
  const key =
    viewKey(scene, nodeId) +
    (scene.nodes.find((n) => n.id === nodeId)?.viewTransition
      ? ":cue:" + nodeId
      : "");
  const incoming = useRef<HTMLDivElement>(null),
    root = useRef<HTMLDivElement>(null);
  const position = useRef<number | undefined>(undefined);
  const content = isValidElement<{ onGifPosition?: (time: number) => void }>(
    children,
  )
    ? cloneElement(children, {
        onGifPosition: (time) => {
          position.current = time;
        },
      })
    : children;
  const previous = useRef(key),
    timer = useRef(0);
  const paused = usePaused(),
    pausedRef = useRef(paused);
  pausedRef.current = paused;
  const [outgoing, setOutgoing] = useState<ReactNode>(null);
  const last = useRef(content);
  const lastScene = useRef(scene);
  const lastNode = useRef(nodeId);
  const selectedTransition = useRef(viewTransition(scene, nodeId));
  if (previous.current !== key)
    selectedTransition.current = viewTransition(
      scene,
      nodeId,
      lastScene.current,
      lastNode.current,
    );
  const transition = playing ? selectedTransition.current : scene.transition;
  // Before paint, so the first frame of the new view is already covered by the old one.
  useLayoutEffect(() => {
    setOutgoing(null);
    if (
      previous.current !== key &&
      playing &&
      !reduced &&
      transition &&
      !["cut", "snappy"].includes(transition.style)
    ) {
      // Restart the visual entrance without remounting a GIF on the same view.
      incoming.current?.getAnimations().forEach((a) => {
        a.currentTime = 0;
        a.play();
      });
      const old = last.current;
      setOutgoing(
        isValidElement<{
          playing: boolean;
          children: ReactNode;
          idPrefix: string;
          gifFrozenTime?: number;
          onGifPosition?: (time: number) => void;
        }>(old)
          ? cloneElement(
              old,
              {
                playing: false,
                idPrefix: "leaving-",
                gifFrozenTime: position.current,
                onGifPosition: undefined,
              },
              Children.toArray(old.props.children).filter(
                (child) =>
                  !isValidElement(child) ||
                  (child.type !== SceneAudio && child.type !== Qte),
              ),
            )
          : old,
      );
      let elapsed = 0,
        held = 0,
        lastTime = performance.now();
      const tick = (now: number) => {
        const step = now - lastTime;
        lastTime = now;
        // Wait (up to 1.5 s) for an incoming GIF's first frame, so the old picture
        // never fades into an empty one (by Claude).
        const waiting = held < 1500 && !!incoming.current?.querySelector("[data-gif-pending]");
        if (waiting) held += step;
        else if (!pausedRef.current) elapsed += step;
        root.current?.toggleAttribute("data-waiting", waiting);
        if (elapsed >= transition.seconds * 1000) setOutgoing(null);
        else timer.current = requestAnimationFrame(tick);
      };
      timer.current = requestAnimationFrame(tick);
    }
    previous.current = key;
    lastScene.current = scene;
    return () => {
      cancelAnimationFrame(timer.current);
      root.current?.removeAttribute("data-waiting");
    };
  }, [key, playing, reduced]);
  useEffect(() => {
    last.current = content;
    lastScene.current = scene;
    lastNode.current = nodeId;
  });
  const active = playing && !reduced && transition;
  return (
    <div
      ref={root}
      className="scene-transition"
      data-transition-seconds={transition?.seconds || 0}
      data-transition-style={transition?.style || "cut"}
      style={
        {
          "--scene-duration": `${transition?.seconds || 0.5}s`,
        } as React.CSSProperties
      }
    >
      {outgoing && (
        <div
          className={`scene-out scene-out-${transition?.style}`}
          aria-hidden
          inert
        >
          {outgoing}
        </div>
      )}
      <div
        ref={incoming}
        key={viewKey(scene, nodeId)}
        className={`scene-in ${active ? "scene-in-" + transition.style : ""}`}
      >
        {content}
      </div>
    </div>
  );
}
