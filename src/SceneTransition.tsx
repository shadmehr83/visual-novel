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
}: {
  scene: Scene;
  playing: boolean;
  reduced: boolean;
  children: ReactNode;
}) {
  const previous = useRef(scene.id),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [outgoing, setOutgoing] = useState<ReactNode>(null);
  const last = useRef(children);
  const lastScene = useRef(scene);
  const selectedTransition = useRef(scene.transition);
  if (previous.current !== scene.id)
    selectedTransition.current =
      lastScene.current.exitTransition || scene.transition;
  const transition = playing ? selectedTransition.current : scene.transition;
  useEffect(() => {
    setOutgoing(null);
    if (
      previous.current !== scene.id &&
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
    previous.current = scene.id;
    lastScene.current = scene;
    return () => clearTimeout(timer.current);
  }, [scene.id, playing, reduced]);
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
        key={scene.id}
        className={`scene-in ${active ? "scene-in-" + transition.style : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
