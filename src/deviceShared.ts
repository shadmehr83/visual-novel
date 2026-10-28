import { deviceAppearanceSchema, type Project, type Scene } from "./model";
import { makeDevice } from "./deviceFrame";
type Appearance = NonNullable<NonNullable<Scene["phone"]>["appearance"]>;
// Keep old scene-specific choices until the author explicitly saves shared defaults.
export function sharedDevice(project: Project) {
  const configured =
    project.scenes.find(
      (s) =>
        s.phone?.appearance && Object.keys(s.phone.appearance.icons).length,
    )?.phone || project.scenes.find((s) => s.phone?.appearance)?.phone;
  return (
    project.deviceDefaults || {
      appearance: configured?.appearance,
      avatar:
        project.scenes.find((s) => s.phone?.avatar)?.phone?.avatar ||
        project.assets.find((a) => a.id === "maria-device-profile")?.id ||
        null,
    }
  );
}
export function effectiveDevice(project: Project, scene: Scene) {
  const phone = scene.phone!;
  if (phone.independentAppearance) return phone;
  const defaults = sharedDevice(project);
  const base = defaults.appearance || deviceAppearanceSchema.parse({});
  const local = phone.appearance;
  const inherited = local
    ? {
        ...base,
        ...local,
        icons: { ...base.icons, ...local.icons },
        profiles: { ...base.profiles, ...local.profiles },
      }
    : base;
  return {
    ...phone,
    appearance: project.deviceDefaults?.appearance || inherited,
    avatar:
      project.deviceDefaults?.avatar !== undefined
        ? project.deviceDefaults.avatar
        : phone.avatar || defaults.avatar || null,
  };
}
export function ensureDevice(project: Project, scene: Scene) {
  if (!scene.phone) {
    scene.phone = makeDevice(scene, project.characters[0]?.name || "Maria");
    Object.assign(scene.phone, structuredClone(sharedDevice(project)));
  }
  return scene.phone;
}
export function saveDeviceAppearance(
  project: Project,
  sceneId: string,
  appearance: Appearance,
) {
  const scene = project.scenes.find((s) => s.id === sceneId)!;
  const phone = ensureDevice(project, scene);
  phone.appearance = appearance;
  if (!phone.independentAppearance)
    project.deviceDefaults = {
      ...structuredClone(sharedDevice(project)),
      appearance,
    };
}
export function saveDeviceAvatar(
  project: Project,
  sceneId: string,
  avatar: string | null,
) {
  const phone = ensureDevice(
    project,
    project.scenes.find((s) => s.id === sceneId)!,
  );
  phone.avatar = avatar;
  if (!phone.independentAppearance)
    project.deviceDefaults = {
      ...structuredClone(sharedDevice(project)),
      avatar,
    };
}
export function setDeviceIndependent(
  project: Project,
  sceneId: string,
  independent: boolean,
) {
  const scene = project.scenes.find((s) => s.id === sceneId)!;
  const device = structuredClone(effectiveDevice(project, scene));
  scene.phone = { ...device, independentAppearance: independent };
}
