import { animatedCharacterPose } from "./characterMotion";
import { usePaused } from "./PlaySession";
import { hingeWindow } from "./interactions";
import { useEffect, useRef, useState } from "react";
import type { Joint, Pose, Project, Scene } from "./model";
import { restingPose, samplePose } from "./cinematics";
function MovingPatch({
  joint,
  visits,
  idPrefix,
  scene,
  project,
  nodeId,
  playing,
  reduced,
}: {
  joint: Joint;
  visits: string[];
  idPrefix: string;
  scene: Scene;
  project: Project;
  nodeId: string;
  playing: boolean;
  reduced: boolean;
}) {
  const paused = usePaused();
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const [pose, setPose] = useState<Pose>(restingPose());
  const latest = useRef(pose);
  const destination = useRef(pose);
  const window = hingeWindow(
    joint,
    nodeId,
    playing
      ? visits
      : scene.nodes
          .slice(0, scene.nodes.findIndex((n) => n.id === nodeId) + 1)
          .map((n) => n.id),
    scene,
  );
  const chosen = window.ended
    ? undefined
    : joint.poses.find((p) => p.node === nodeId) ||
      (!playing
        ? [...joint.poses]
            .filter(
              (p) =>
                scene.nodes.findIndex((n) => n.id === p.node) <=
                scene.nodes.findIndex((n) => n.id === nodeId),
            )
            .sort(
              (a, b) =>
                scene.nodes.findIndex((n) => n.id === a.node) -
                scene.nodes.findIndex((n) => n.id === b.node),
            )
            .pop()
        : undefined);
  useEffect(() => {
    if (chosen) destination.current = chosen;
    const to = destination.current,
      from = latest.current;
    if (
      reduced ||
      window.ended ||
      (!joint.loop?.enabled && (joint.transition.style === "cut" || joint.transition.style === "snappy"))
    ) {
      latest.current = to;
      setPose(to);
      return;
    }
    let raf = 0;
    let origin = performance.now();
    let lastFrame = origin;
    const tick = (now: number) => {
      if (pausedRef.current) {
        origin += now - lastFrame;
        lastFrame = now;
        raf = requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;
      const t = Math.min(1, (now - origin) / (joint.transition.seconds * 1000));
      const next = samplePose(from, to, t, joint.transition.style);
      latest.current = next;
      setPose(animatedCharacterPose(next, window.ended ? undefined : joint.loop, (now - origin) / 1000));
      if (t < 1 || (joint.loop?.enabled && !window.ended)) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    JSON.stringify(chosen),
    JSON.stringify(joint.transition),
    JSON.stringify(joint.loop),
    window.ended,
    reduced,
    nodeId,
  ]);
  const region = joint.region,
    clip = idPrefix + "joint-clip-" + joint.id;
  const source = project.assets.find(
    (a) => a.id === (pose.asset || joint.source),
  );
  const cleanPlate = project.assets.find(a => a.id === joint.cleanPlate);
  if (!window.visible) return null;
  return (
    <g data-joint-layer={joint.id} data-joint-angle={pose.angle}>
      <defs>
        <clipPath id={clip}>
          {region.path ? (
            <path d={region.path} />
          ) : (
            <polygon
              points={region.points.map((p) => `${p.x},${p.y}`).join(" ")}
            />
          )}
        </clipPath>
      </defs>
      {cleanPlate && <image data-clean-plate={joint.id} href={cleanPlate.data} width="1000" height="563" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clip})`} />}
      {(joint.coverColor || (joint.loop?.enabled && joint.loop.kind === "blink")) && (
        <rect
          width="1000"
          height="563"
          fill={joint.coverColor || joint.loop?.eyelidColor || "#b18b7e"}
          clipPath={`url(#${clip})`}
        />
      )}
      <g
        opacity={pose.opacity}
        transform={`translate(${pose.x} ${pose.y}) translate(${joint.pivotX} ${joint.pivotY}) rotate(${pose.angle}) scale(${pose.scaleX} ${pose.scaleY}) translate(${-joint.pivotX} ${-joint.pivotY})`}
      >
        <g clipPath={`url(#${clip})`}>
          {source ? (
            <image
              href={source.data}
              width="1000"
              height="563"
              preserveAspectRatio={
                joint.source
                  ? "xMidYMid meet"
                  : scene.fit === "stretch"
                    ? "none"
                    : scene.fit === "cover"
                      ? "xMidYMid slice"
                      : "xMidYMid meet"
              }
            />
          ) : (
            <use href={"#" + idPrefix + "joint-source"} />
          )}
        </g>
      </g>
    </g>
  );
}
export function JointLayers(props: {
  visits: string[];
  idPrefix: string;
  scene: Scene;
  project: Project;
  nodeId: string;
  playing: boolean;
  reduced: boolean;
}) {
  return (
    <g
      transform={`translate(${props.scene.x * 10} ${props.scene.y * 5.63}) translate(500 281.5) scale(${props.scene.scale}) translate(-500 -281.5)`}
    >
      {(props.scene.joints || [])
        .filter((j) => j.enabled && j.region.enabled)
        .map((j) => (
          <MovingPatch key={j.id} {...props} joint={j} />
        ))}
    </g>
  );
}
