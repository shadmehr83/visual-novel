import { it, expect } from "vitest";
import { deviceBox, changeDeviceFrame, makeDevice } from "./deviceFrame";
import { demo } from "./demo";
import { validateProject } from "./model";
it("retains legacy handset geometry until edited and changes width without diagonal drift", () => {
  const p = demo(),
    s = p.scenes[0];
  s.phone = makeDevice(s);
  const a = deviceBox(s.phone);
  expect(a.height).toBe(94);
  expect(a.width / a.height).toBeCloseTo((0.563 * 9) / 19.5);
  changeDeviceFrame(s.phone, { width: 35 });
  const b = deviceBox(s.phone);
  expect(b.x).toBe(a.x);
  expect(b.y).toBe(a.y);
  expect(b.height).toBe(a.height);
  expect(b.width).toBe(35);
  expect(() => validateProject(p)).not.toThrow();
});
it("keeps the top-left anchor fixed when explicitly resizing with proportion lock", () => {
  const p = demo(),
    d = makeDevice(p.scenes[0]);
  changeDeviceFrame(d, { lockAspect: true });
  const a = deviceBox(d);
  changeDeviceFrame(d, { width: 18 });
  const b = deviceBox(d);
  expect(b.x).toBe(a.x);
  expect(b.y).toBe(a.y);
  expect(b.width / b.height).toBeCloseTo(a.width / a.height);
  changeDeviceFrame(d, { height: 70 });
  const c = deviceBox(d);
  expect(c.width / c.height).toBeCloseTo(a.width / a.height);
  expect(c.x).toBe(a.x);
});
it("desktop frames also resize a single edge and remain in project exports", () => {
  const p = demo(),
    s = p.scenes[0];
  s.phone = { ...makeDevice(s), device: "desktop" };
  const a = deviceBox(s.phone);
  changeDeviceFrame(s.phone, { height: 65 });
  const b = deviceBox(s.phone);
  expect(b.width).toBe(a.width);
  expect(b.y).toBe(a.y);
  const copy = validateProject(JSON.parse(JSON.stringify(p)));
  expect(deviceBox(copy.scenes[0].phone!)).toEqual(b);
});

it("fits a standard laptop silhouette without moving its top-left corner", async () => {
  const { fitDeviceFrame } = await import("./deviceFrame");
  const p = demo(),
    d = { ...makeDevice(p.scenes[0]), device: "desktop" as const },
    a = deviceBox(d);
  fitDeviceFrame(d);
  const b = deviceBox(d);
  expect(b.x).toBe(a.x);
  expect(b.y).toBe(a.y);
  expect((b.width * 1000) / (b.height * 563)).toBeCloseTo(1.6);
});
