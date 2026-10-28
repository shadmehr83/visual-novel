import { SceneAudio, Qte } from "./EngineTools";
import {
  useEffect,
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
  const view = scene.subscenes?.find(v => v.id === scene.nodes.find(n => n.id === nodeId)?.view);
  const key = scene.id + ":" + (view?.id || "main");
  const previous = useRef(key),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [outgoing, setOutgoing] = useState<ReactNode>(null);
  const last = useRef(children);
  const lastScene = useRef(scene);
  const selectedTransition = useRef(scene.transition);
  if (previous.current !== key)
    selectedTransition.current =
      view?.transition || (previous.current.startsWith(scene.id + ":") ? { style: "fade", seconds: 0.65 } : lastScene.current.exitTransition || scene.transition);
  const transition = playing ? selectedTransition.current : scene.transition;
  useEffect(() => {
    setOutgoing(null);
    if (
      previous.current !== key &&
      playing &&
      !reduced &&
      transition &&
      !["cut", "snappy"].includes(transition.style)
    ) {
      const old = last.current;
      setOutgoing(
        isValidElement<{
          playing: boolean;
          children: ReactNode;
          idPrefix: string;
        }>(old)
          ? cloneElement(
              old,
              { playing: false, idPrefix: "leaving-" },
              Children.toArray(old.props.children).filter(
                (child) =>
                  !isValidElement(child) ||
                  (child.type !== SceneAudio && child.type !== Qte),
              ),
            )
          : old,
      );
      timer.current = setTimeout(
        () => setOutgoing(null),
        transition.seconds * 1000,
      );
    }
    previous.current = key;
    lastScene.current = scene;
    return () => clearTimeout(timer.current);
  }, [key, playing, reduced]);
  useEffect(() => {
    last.current = children;
    lastScene.current = scene;
  });
  const active = playing && !reduced && transition;
  return (
    <div
      className="scene-transition"
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
        key={key}
        className={`scene-in ${active ? "scene-in-" + transition.style : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
