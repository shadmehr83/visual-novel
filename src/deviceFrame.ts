import type { Scene } from "./model";
export type Device = NonNullable<Scene["phone"]>;
export function deviceBox(d: Device) {
  const height =
    d.frameHeight ??
    (d.device === "desktop"
      ? 85
      : Math.min(96, Math.max(40, (d.width / 44) * 94)));
  const width =
    d.frameWidth ??
    (d.device === "desktop" ? d.width : (height * 0.563 * 9) / 19.5);
  return {
    x: d.anchor === "top-left" ? d.x : d.x - width / 2,
    y: d.anchor === "top-left" ? d.y : d.y - height / 2,
    width,
    height,
  };
}
export function changeDeviceFrame(
  d: Device,
  patch: Partial<{
    x: number;
    y: number;
    width: number;
    height: number;
    lockAspect: boolean;
  }>,
) {
  const old = deviceBox(d);
  let x = Math.max(0, Math.min(95, patch.x ?? old.x)),
    y = Math.max(0, Math.min(80, patch.y ?? old.y)),
    width = patch.width ?? old.width,
    height = patch.height ?? old.height;
  const locked = patch.lockAspect ?? d.lockAspect ?? false,
    ratio = d.frameRatio ?? old.width / old.height;
  if (locked) {
    if (patch.width !== undefined) height = width / ratio;
    else if (patch.height !== undefined) width = height * ratio;
    const fit = Math.min(1, (100 - x) / width, (100 - y) / height);
    width *= fit;
    height *= fit;
  }
  d.anchor = "top-left";
  d.x = x;
  d.y = y;
  d.frameWidth = Math.max(5, Math.min(95, 100 - x, width));
  d.frameHeight = Math.max(20, Math.min(98, 100 - y, height));
  d.lockAspect = locked;
  if (patch.lockAspect === true || !d.frameRatio)
    d.frameRatio = old.width / old.height;
}
export function makeDevice(scene: Scene, contact = "Maria"): Device {
  return {
    enabled: true,
    mode: "phone-system",
    defaultScreen: "home",
    device: "phone",
    contact,
    title: "Ember · Online",
    avatar: null,
    x: 65,
    y: 50,
    width: 44,
    entrance: { style: "slide", seconds: 0.7 },
    typingSeconds: 0.65,
    keyboard: true,
    schedule: {
      start: scene.nodes[0].id,
      end: scene.nodes.at(-1)!.id,
      screen: "home",
      advanced: false,
    },
  };
}

export function fitDeviceFrame(d: Device) {
  const b = deviceBox(d),
    ratio = 0.563 * (d.device === "desktop" ? 16 / 10 : 9 / 19.5),
    width = Math.min(
      d.device === "desktop" ? 70 : (94 * 0.563 * 9) / 19.5,
      100 - Math.max(0, b.x),
      (100 - Math.max(0, b.y)) * ratio,
    ),
    locked = !!d.lockAspect;
  changeDeviceFrame(d, { width, height: width / ratio, lockAspect: false });
  d.lockAspect = locked;
  d.frameRatio = ratio;
}
