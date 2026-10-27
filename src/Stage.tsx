import { JointLayers } from "./JointLayers";
import { createBrush, dab, maskPath, clipToBoundary } from "./brush";
import { useEffect, useRef, useState } from "react";
import type { Project, Scene, Region } from "./model";
import { sampleMotion } from "./motion";
import { sampleCamera } from "./camera";
import { imageMask } from "./wand";
import type { RegionEditor } from "./Zones";
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
  regionEditor = null,
  onRegion,
  previewTick = 0,
  nodeId = scene.nodes[0].id,
  idPrefix = "",
  itemFocus = false,
  onPivot,
  onPlaceLight,
  visits = [],
}: {
  project: Project;
  scene: Scene;
  maskMode: boolean;
  onMask: (v: Scene["effects"]["mask"]) => void;
  playing: boolean;
  children?: React.ReactNode;
  regionEditor?: RegionEditor | null;
  onRegion?: (r: Region) => void;
  previewTick?: number;
  nodeId?: string;
  idPrefix?: string;
  itemFocus?: boolean;
  visits?: string[];
  onPlaceLight?: (x: number, y: number) => void;
  onPivot?: (x: number, y: number) => void;
}) {
  const stroke = useRef<{
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    region: Region;
    last: { x: number; y: number };
  } | null>(null);
  const [strokePreview, setStrokePreview] = useState<string | null>(null);
  const [brushCursor, setBrushCursor] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [wandError, setWandError] = useState("");
  const [wandBusy, setWandBusy] = useState(false);
  const [time, setTime] = useState(0);
  const svg = useRef<SVGSVGElement>(null);
  const e = scene.effects;
  const loop = sceneLightLoop(scene);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const zonedAnimation =
    e.lights?.some((l) => l.enabled && l.cycle.enabled) &&
    !project.settings.reducedEffects &&
    !reducedMotion;
  const zoneLevel = (l: NonNullable<typeof e.lights>[number]) =>
    l.cycle.enabled && !project.settings.reducedEffects && !reducedMotion
      ? sampleLightLoop(l.cycle, time)
      : 1;
  const globalLevel = (e.lights || [])
    .filter((l) => l.enabled && l.kind === "global")
    .reduce((n, l) => n * l.intensity * zoneLevel(l), 1);
  const storedRegion =
    regionEditor?.kind === "joint"
      ? scene.joints?.find((j) => j.id === regionEditor.id)?.region
      : regionEditor?.kind === "motion"
        ? e.motionZones?.find((w) => w.id === regionEditor.id)?.region
        : regionEditor?.kind === "rain"
          ? e.rainZones?.find((r) => r.id === regionEditor.id)
          : e.lights?.find((l) => l.id === regionEditor?.id)?.region;
  const activeRegion =
    storedRegion && strokePreview !== null
      ? { ...storedRegion, points: [], path: strokePreview }
      : storedRegion;
  const camera = scene.camera?.enabled
    ? sampleCamera(
        scene.camera,
        time,
        project.settings.reducedEffects || reducedMotion,
      )
    : null;
  const cameraTransform =
    camera && !maskMode && !regionEditor && !onPlaceLight
      ? `translate(${camera.x} ${camera.y}) scale(${camera.zoom})`
      : undefined;
  const loopingLight =
    loop.enabled &&
    e.light > 0 &&
    !project.settings.reducedEffects &&
    !reducedMotion;
  const lightLevel = loopingLight ? sampleLightLoop(loop, time) : 1;
  const lightIntensity = Math.min(1, e.light * lightLevel);
  useEffect(() => {
    setTime(0);
    if (
      !e.rain &&
      !e.glass &&
      !scene.keyframes?.length &&
      !loopingLight &&
      !zonedAnimation &&
      !(
        scene.camera?.enabled &&
        !project.settings.reducedEffects &&
        !reducedMotion
      ) &&
      !(
        e.motionZones?.some((w) => w.enabled) &&
        !project.settings.reducedEffects &&
        !reducedMotion
      )
    )
      return;
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
  }, [
    e.rain,
    e.glass,
    scene.id,
    JSON.stringify(scene.keyframes),
    loopingLight,
    loop.stepSeconds,
    loop.values.join(","),
    zonedAnimation,
    e.lights,
    scene.camera,
    playing,
    previewTick,
    e.motionZones,
    reducedMotion,
    project.settings.reducedEffects,
  ]);
  const points = e.mask.map((p) => `${p.x},${p.y}`).join(" ");
  const asset = project.assets.find((a) => a.id === scene.background);
  const transform = asset
    ? `translate(${scene.x * 10} ${scene.y * 5.63}) translate(500 281.5) scale(${scene.scale}) translate(-500 -281.5)`
    : undefined;
  const count = project.settings.reducedEffects
    ? Math.min(35, e.density)
    : e.density;
  function pointAt(clientX: number, clientY: number) {
    const p = new DOMPoint(clientX, clientY).matrixTransform(
      svg.current!.getScreenCTM()!.inverse(),
    );
    return {
      x: Math.max(
        0,
        Math.min(
          1000,
          asset ? (p.x - scene.x * 10 - 500) / scene.scale + 500 : p.x,
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          563,
          asset ? (p.y - scene.y * 5.63 - 281.5) / scene.scale + 281.5 : p.y,
        ),
      ),
    };
  }
  function paint(clientX: number, clientY: number) {
    if (!stroke.current || !regionEditor) return;
    const p = pointAt(clientX, clientY);
    try {
      dab(
        stroke.current.ctx,
        stroke.current.region,
        p.x,
        p.y,
        regionEditor.radius || 25,
        regionEditor.mode === "erase",
        stroke.current.last,
      );
      stroke.current.last = p;
      setStrokePreview(maskPath(stroke.current.canvas));
    } catch (error) {
      setWandError(String(error));
      stroke.current = null;
      setStrokePreview(null);
    }
  }
  return (
    <div
      className={
        "stage " +
        (itemFocus ? "item-focus " : "") +
        (maskMode || regionEditor ? "masking" : "")
      }
      style={
        {
          "--item-blur": (scene.items?.blur || 0) + "px",
        } as React.CSSProperties
      }
    >
      <svg
        ref={svg}
        viewBox="0 0 1000 563"
        role="img"
        aria-label={scene.title + " live stage"}
        data-light-level={lightLevel}
        data-global-light-level={globalLevel}
        style={{ touchAction: regionEditor ? "none" : undefined }}
        onPointerDown={(event) => {
          if (
            !storedRegion ||
            !regionEditor ||
            !["brush", "erase"].includes(regionEditor.mode)
          )
            return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          setWandError("");
          const p = pointAt(event.clientX, event.clientY);
          stroke.current = {
            ...createBrush(storedRegion),
            region: storedRegion,
            last: p,
          };
          paint(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (regionEditor && ["brush", "erase"].includes(regionEditor.mode)) {
            setBrushCursor(pointAt(event.clientX, event.clientY));
            paint(event.clientX, event.clientY);
          }
        }}
        onPointerLeave={() => {
          if (!stroke.current) setBrushCursor(null);
        }}
        onPointerUp={() => {
          if (!stroke.current) return;
          try {
            const path = maskPath(stroke.current.canvas);
            onRegion?.({ ...stroke.current.region, points: [], path });
          } catch (error) {
            setWandError(String(error));
          } finally {
            stroke.current = null;
            setStrokePreview(null);
          }
        }}
        onPointerCancel={() => {
          stroke.current = null;
          setStrokePreview(null);
        }}
        onClick={async (event) => {
          if (onPlaceLight) {
            const p = new DOMPoint(
              event.clientX,
              event.clientY,
            ).matrixTransform(svg.current!.getScreenCTM()!.inverse());
            onPlaceLight(
              Math.max(0, Math.min(1000, p.x)),
              Math.max(0, Math.min(563, p.y)),
            );
            return;
          }
          if (regionEditor?.mode === "pivot") {
            const p = pointAt(event.clientX, event.clientY);
            onPivot?.(p.x, p.y);
            return;
          }
          if (regionEditor && ["brush", "erase"].includes(regionEditor.mode))
            return;
          if (regionEditor && activeRegion && svg.current && onRegion) {
            const point = new DOMPoint(
              event.clientX,
              event.clientY,
            ).matrixTransform(svg.current.getScreenCTM()!.inverse());
            const x = Math.max(
              0,
              Math.min(
                1000,
                asset
                  ? (point.x - scene.x * 10 - 500) / scene.scale + 500
                  : point.x,
              ),
            );
            const y = Math.max(
              0,
              Math.min(
                563,
                asset
                  ? (point.y - scene.y * 5.63 - 281.5) / scene.scale + 281.5
                  : point.y,
              ),
            );
            setWandError("");
            if (regionEditor.mode === "polygon") {
              if (activeRegion.points.length >= 200) {
                setWandError("Maximum 200 points per region.");
                return;
              }
              onRegion({
                ...activeRegion,
                path: undefined,
                points: [...activeRegion.points, { x, y }],
              });
            } else {
              if (!asset) {
                setWandError(
                  "Import a background image before using the magic wand.",
                );
                return;
              }
              if (wandBusy) return;
              setWandBusy(true);
              try {
                onRegion(
                  clipToBoundary({
                    ...activeRegion,
                    points: [],
                    path: await imageMask(
                      asset.data,
                      scene.fit,
                      x,
                      y,
                      regionEditor.tolerance,
                      regionEditor.mode === "edge",
                    ),
                  }),
                );
              } catch (error) {
                setWandError(String(error));
              } finally {
                setWandBusy(false);
              }
            }
            return;
          }
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
          {!!scene.joints?.length && (
            <g id={idPrefix + "joint-source"}>
              {asset ? (
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
              ) : (
                <Artwork idPrefix={idPrefix + "joint-art-"} kind={scene.art} />
              )}
            </g>
          )}
          <radialGradient id={idPrefix + "softLight"}>
            <stop stopColor="#ffdfab" stopOpacity={lightIntensity} />
            <stop offset="1" stopColor="#ffdfab" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={idPrefix + "vignette"}>
            <stop offset=".45" stopColor="#0b0f15" stopOpacity="0" />
            <stop offset="1" stopColor="#0b0f15" stopOpacity=".65" />
          </radialGradient>
          <mask id={idPrefix + "rainMask"}>
            <rect
              width="1000"
              height="563"
              fill={
                e.invert || (!e.rainZones?.length && e.mask.length < 3)
                  ? "white"
                  : "black"
              }
            />
            {e.rainZones
              ?.filter((r) => r.enabled)
              .map((r) =>
                r.path ? (
                  <path
                    key={r.id}
                    transform={transform}
                    d={r.path}
                    fill={e.invert ? "black" : "white"}
                  />
                ) : r.points.length >= 3 ? (
                  <polygon
                    key={r.id}
                    transform={transform}
                    points={r.points.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill={e.invert ? "black" : "white"}
                  />
                ) : null,
              )}
            {e.mask.length >= 3 && (
              <polygon
                transform={transform}
                points={points}
                fill={e.invert ? "black" : "white"}
              />
            )}
          </mask>
          {(e.lights || [])
            .filter((l) => l.kind === "local")
            .map((l) => (
              <g key={l.id}>
                <radialGradient id={idPrefix + "zone-falloff-" + l.id}>
                  <stop
                    stopColor="white"
                    stopOpacity={Math.min(1, l.intensity * zoneLevel(l))}
                  />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id={idPrefix + "zone-radius-" + l.id}>
                  {l.shape === "region" ? (
                    <rect
                      width="1000"
                      height="563"
                      fill="white"
                      fillOpacity={Math.min(1, l.intensity * zoneLevel(l))}
                    />
                  ) : (
                    <ellipse
                      cx={l.x}
                      cy={l.y}
                      rx={Math.max(
                        1,
                        l.radius * (1 + l.spread * (zoneLevel(l) - 1)),
                      )}
                      ry={Math.max(
                        1,
                        l.radius * (1 + l.spread * (zoneLevel(l) - 1)),
                      )}
                      fill={"url(#" + idPrefix + "zone-falloff-" + l.id + ")"}
                    />
                  )}
                </mask>
                <radialGradient id={idPrefix + "zone-gradient-" + l.id}>
                  <stop
                    stopColor={l.color}
                    stopOpacity={Math.min(1, l.intensity * zoneLevel(l))}
                  />
                  <stop offset="1" stopColor={l.color} stopOpacity="0" />
                </radialGradient>
                <mask id={idPrefix + "zone-mask-" + l.id}>
                  <rect
                    width="1000"
                    height="563"
                    fill={l.region || l.shape === "region" ? "black" : "white"}
                  />
                  {l.region?.enabled &&
                    (l.region.path ? (
                      <path
                        transform={transform}
                        d={l.region.path}
                        fill="white"
                      />
                    ) : (
                      <polygon
                        transform={transform}
                        points={l.region.points
                          .map((p) => `${p.x},${p.y}`)
                          .join(" ")}
                        fill="white"
                      />
                    ))}
                </mask>
              </g>
            ))}
          {(e.motionZones || []).map((w) => {
            const offset = sampleMotion(
              w,
              time,
              project.settings.reducedEffects || reducedMotion,
            );
            return (
              <g key={w.id}>
                <mask id={idPrefix + "motion-mask-" + w.id}>
                  <rect width="1000" height="563" fill="black" />
                  {w.region.enabled &&
                    (w.region.path ? (
                      <path
                        transform={transform}
                        d={w.region.path}
                        fill="white"
                      />
                    ) : (
                      <polygon
                        transform={transform}
                        points={w.region.points
                          .map((p) => `${p.x},${p.y}`)
                          .join(" ")}
                        fill="white"
                      />
                    ))}
                </mask>
                <filter
                  id={idPrefix + "motion-filter-" + w.id}
                  x="-10%"
                  y="-10%"
                  width="120%"
                  height="120%"
                  colorInterpolationFilters="sRGB"
                >
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.012 0.035"
                    numOctaves="2"
                    seed="17"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale={offset.warp}
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                  <feOffset dx={offset.dx} dy={offset.dy} />
                </filter>
              </g>
            );
          })}
        </defs>
        <g
          data-camera-transform={cameraTransform || "none"}
          transform={cameraTransform}
        >
          <g style={{ filter: `brightness(${globalLevel})` }}>
            <g
              id={idPrefix + "scene-base"}
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
                <Artwork
                  idPrefix={idPrefix}
                  kind={scene.art}
                  dynamicLight={loopingLight}
                />
              )}
            </g>
            <rect
              width="1000"
              height="563"
              fill={e.tint}
              opacity={e.tintOpacity}
            />
            <ellipse
              cx={e.lightX * 10}
              cy={e.lightY * 5.63}
              rx="380"
              ry="320"
              fill={"url(#" + idPrefix + "softLight)"}
            />
            <g
              mask={"url(#" + idPrefix + "rainMask)"}
              fill="none"
              stroke={e.color}
              opacity={e.opacity}
              strokeWidth="1.3"
            >
              {e.rain &&
                Array.from({ length: Math.round(count) }, (_, i) => {
                  const x =
                    ((i * 137.13 +
                      (i % 5) * 27 +
                      time * e.speed * e.angle * 2) %
                      1100) -
                    50;
                  const y =
                    ((i * 79.31 + time * e.speed * (220 + (i % 7) * 17)) %
                      650) -
                    45;
                  return (
                    <path
                      key={i}
                      d={`M${x} ${y}l${e.angle * 0.35} ${e.length}`}
                    />
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
            <g id={idPrefix + "scene-sprites"}>
              {(scene.sprites || []).map((original) => {
                const sprite = animateSprite(
                  original,
                  scene.keyframes || [],
                  time,
                );
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
            </g>
            <JointLayers
              visits={visits}
              idPrefix={idPrefix}
              key={scene.id}
              scene={scene}
              project={project}
              nodeId={nodeId}
              playing={playing}
              reduced={
                project.settings.reducedEffects ||
                reducedMotion ||
                !!regionEditor
              }
            />
            <g id={idPrefix + "scene-motion"}>
              {(e.motionZones || [])
                .filter((w) => w.enabled)
                .map((w) => {
                  const offset = sampleMotion(
                    w,
                    time,
                    project.settings.reducedEffects || reducedMotion,
                  );
                  return (
                    <g
                      key={w.id}
                      data-motion-zone={w.id}
                      data-motion-offset={offset.dx}
                      mask={"url(#" + idPrefix + "motion-mask-" + w.id + ")"}
                    >
                      <g
                        filter={
                          "url(#" + idPrefix + "motion-filter-" + w.id + ")"
                        }
                      >
                        <use href={"#" + idPrefix + "scene-base"} />
                        <use href={"#" + idPrefix + "scene-sprites"} />
                      </g>
                    </g>
                  );
                })}
            </g>
          </g>
          {(e.lights || [])
            .filter((l) => l.enabled && l.kind === "local")
            .map((l) => (
              <g
                key={l.id}
                data-light-zone={l.id}
                mask={"url(#" + idPrefix + "zone-mask-" + l.id + ")"}
                style={{ mixBlendMode: "screen" }}
              >
                <g
                  mask={"url(#" + idPrefix + "zone-radius-" + l.id + ")"}
                  style={{
                    filter: `brightness(${1 + l.intensity * zoneLevel(l)})`,
                  }}
                >
                  <use href={"#" + idPrefix + "scene-base"} />
                  <use href={"#" + idPrefix + "scene-sprites"} />
                  <use href={"#" + idPrefix + "scene-motion"} />
                  <rect
                    width="1000"
                    height="563"
                    fill={l.color}
                    opacity=".15"
                  />
                </g>
              </g>
            ))}
          {e.vignette && (
            <rect
              width="1000"
              height="563"
              fill={"url(#" + idPrefix + "vignette)"}
            />
          )}
        </g>
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
        {regionEditor?.kind === "joint" &&
          scene.joints
            ?.filter((j) => j.id === regionEditor.id)
            .map((j) => (
              <g key={j.id} transform={transform} pointerEvents="none">
                <circle
                  cx={j.pivotX}
                  cy={j.pivotY}
                  r="8"
                  fill="none"
                  stroke="#ffda82"
                />
                <path
                  d={`M${j.pivotX - 14} ${j.pivotY}h28M${j.pivotX} ${j.pivotY - 14}v28`}
                  stroke="#ffda82"
                />
              </g>
            ))}
        {regionEditor && activeRegion && (
          <g transform={transform} pointerEvents="none">
            {activeRegion.path ? (
              <path d={activeRegion.path} fill="#ffc8a7" fillOpacity=".25" />
            ) : (
              <polygon
                points={activeRegion.points
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ")}
                fill="#ffc8a7"
                fillOpacity=".15"
                stroke="#ffc8a7"
              />
            )}
            {activeRegion.points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="5" fill="#ffc8a7" />
            ))}
          </g>
        )}
        {activeRegion?.boundary && regionEditor && (
          <g transform={transform} pointerEvents="none">
            {activeRegion.boundary.path ? (
              <path
                d={activeRegion.boundary.path}
                fill="none"
                stroke="#aee8ff"
                strokeDasharray="5 5"
              />
            ) : (
              <polygon
                points={activeRegion.boundary.points
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ")}
                fill="none"
                stroke="#aee8ff"
                strokeDasharray="5 5"
              />
            )}
          </g>
        )}
        {brushCursor &&
          regionEditor &&
          ["brush", "erase"].includes(regionEditor.mode) && (
            <g transform={transform} pointerEvents="none">
              <circle
                data-brush-cursor
                cx={brushCursor.x}
                cy={brushCursor.y}
                r={regionEditor.radius || 25}
                fill="none"
                stroke={regionEditor.mode === "erase" ? "#ff9292" : "#ffe4a7"}
                strokeWidth="2"
              />
            </g>
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
      {wandError && (
        <div className="mask-hint" role="alert">
          {wandError}
        </div>
      )}
      {wandBusy && (
        <div className="mask-hint">Selecting connected colours…</div>
      )}
      {children}
    </div>
  );
}
