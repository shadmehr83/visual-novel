import { useEffect, useRef, useState } from "react";
import type { Project, Scene } from "./model";
import { animateSprite } from "./animation";
import { Artwork } from "./Artwork";
import { sampleLightLoop, sceneLightLoop } from "./lighting";
export function Stage({
  project,
  scene,
  maskMode,
  onMask,
  playing,
  children,
}: {
  project: Project;
  scene: Scene;
  maskMode: boolean;
  onMask: (v: Scene["effects"]["mask"]) => void;
  playing: boolean;
  children?: React.ReactNode;
}) {
  const [time, setTime] = useState(0);
  const svg = useRef<SVGSVGElement>(null);
  const e = scene.effects;
  const loop = sceneLightLoop(scene);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const loopingLight = loop.enabled && e.light > 0 && !project.settings.reducedEffects && !reducedMotion;
  const lightLevel = loopingLight ? sampleLightLoop(loop, time) : 1;
  const lightIntensity = Math.min(1, e.light * lightLevel);
  useEffect(() => {
    setTime(0);
    if (!e.rain && !e.glass && !scene.keyframes?.length && !loopingLight) return;
    const origin = performance.now();
    let frame = 0;
    let previous = 0;
    const tick = (t: number) => {
      if (t - previous > 32) {
        setTime((t - origin) / 1000);
        previous = t;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [e.rain, e.glass, scene.id, JSON.stringify(scene.keyframes), loopingLight, loop.stepSeconds, loop.values.join(",")]);
  const points = e.mask.map((p) => `${p.x},${p.y}`).join(" ");
  const asset = project.assets.find((a) => a.id === scene.background);
  const transform = asset
    ? `translate(${scene.x * 10} ${scene.y * 5.63}) translate(500 281.5) scale(${scene.scale}) translate(-500 -281.5)`
    : undefined;
  const count = project.settings.reducedEffects
    ? Math.min(35, e.density)
    : e.density;
  return (
    <div className={"stage " + (maskMode ? "masking" : "")}>
      <svg
        ref={svg}
        viewBox="0 0 1000 563"
        role="img"
        aria-label={scene.title + " live stage"}
        data-light-level={lightLevel}
        onClick={(event) => {
          if (!maskMode || !svg.current) return;
          const pt = new DOMPoint(event.clientX, event.clientY).matrixTransform(
            svg.current.getScreenCTM()!.inverse(),
          );
          onMask([
            ...e.mask,
            {
              x: Math.max(
                0,
                Math.min(
                  1000,
                  asset
                    ? (pt.x - scene.x * 10 - 500) / scene.scale + 500
                    : pt.x,
                ),
              ),
              y: Math.max(
                0,
                Math.min(
                  563,
                  asset
                    ? (pt.y - scene.y * 5.63 - 281.5) / scene.scale + 281.5
                    : pt.y,
                ),
              ),
            },
          ]);
        }}
      >
        <defs>
          <radialGradient id="softLight">
            <stop stopColor="#ffdfab" stopOpacity={lightIntensity} />
            <stop offset="1" stopColor="#ffdfab" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vignette">
            <stop offset=".45" stopColor="#0b0f15" stopOpacity="0" />
            <stop offset="1" stopColor="#0b0f15" stopOpacity=".65" />
          </radialGradient>
          <mask id="rainMask">
            <rect
              width="1000"
              height="563"
              fill={e.mask.length < 3 || e.invert ? "white" : "black"}
            />
            {e.mask.length >= 3 && (
              <polygon
                transform={transform}
                points={points}
                fill={e.invert ? "black" : "white"}
              />
            )}
          </mask>
        </defs>
        <g
          style={{
            filter: `brightness(${e.brightness * (loopingLight ? 0.85 + lightLevel * 0.15 : 1)}) contrast(${e.contrast})`,
          }}
        >
          {asset ? (
            <g
              transform={`translate(${scene.x * 10} ${scene.y * 5.63}) translate(500 281.5) scale(${scene.scale}) translate(-500 -281.5)`}
            >
              <image
                href={asset.data}
                width="1000"
                height="563"
                preserveAspectRatio={
                  scene.fit === "stretch"
                    ? "none"
                    : scene.fit === "cover"
                      ? "xMidYMid slice"
                      : "xMidYMid meet"
                }
              />
            </g>
          ) : (
            <Artwork kind={scene.art} dynamicLight={loopingLight} />
          )}
        </g>
        <rect width="1000" height="563" fill={e.tint} opacity={e.tintOpacity} />
        <ellipse
          cx={e.lightX * 10}
          cy={e.lightY * 5.63}
          rx="380"
          ry="320"
          fill="url(#softLight)"
        />
        <g
          mask="url(#rainMask)"
          fill="none"
          stroke={e.color}
          opacity={e.opacity}
          strokeWidth="1.3"
        >
          {e.rain &&
            Array.from({ length: Math.round(count) }, (_, i) => {
              const x =
                ((i * 137.13 + (i % 5) * 27 + time * e.speed * e.angle * 2) %
                  1100) -
                50;
              const y =
                ((i * 79.31 + time * e.speed * (220 + (i % 7) * 17)) % 650) -
                45;
              return (
                <path key={i} d={`M${x} ${y}l${e.angle * 0.35} ${e.length}`} />
              );
            })}
          {e.glass &&
            Array.from({ length: 28 }, (_, i) => (
              <path
                key={"g" + i}
                strokeWidth={2 + (i % 3)}
                opacity=".5"
                d={`M${(i * 179) % 1000} ${(i * 89 + time * e.speed * 8) % 563}q-6 15 0 ${12 + (i % 7) * 5}`}
              />
            ))}
        </g>
        {(scene.sprites || []).map((original) => {
          const sprite = animateSprite(original, scene.keyframes || [], time);
          const image = project.assets.find((a) => a.id === sprite.asset);
          return (
            image && (
              <image
                key={sprite.id}
                href={image.data}
                x={-150}
                y={-300}
                width="300"
                height="300"
                opacity={sprite.opacity}
                transform={`translate(${sprite.x} ${sprite.y}) scale(${sprite.flip ? -sprite.scale : sprite.scale} ${sprite.scale})`}
              >
                <title>
                  {sprite.name} · {sprite.expression}
                </title>
              </image>
            )
          );
        })}
        {e.vignette && <rect width="1000" height="563" fill="url(#vignette)" />}
        {project.settings.guides && !playing && (
          <rect
            x="50"
            y="28"
            width="900"
            height="507"
            fill="none"
            stroke="#f6dcbd"
            strokeDasharray="7 8"
            opacity=".5"
          />
        )}
        {maskMode && (
          <g transform={transform}>
            <polygon
              points={points}
              fill="#e3b19b"
              fillOpacity=".18"
              stroke="#ffc8a7"
              strokeDasharray="5 4"
            />
            {e.mask.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="6" fill="#ffc8a7">
                <title>Mask vertex {i + 1}</title>
              </circle>
            ))}
          </g>
        )}
      </svg>
      {children}
    </div>
  );
}
