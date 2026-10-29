import { integrateChapterUpdate } from "./chapters";
import type { Project } from "./model";
import { integrateDemoUpdates } from "./demoUpdates";
import { integrateDeviceUpdate } from "./deviceUpdates";
import { integrateLibraryUpdate } from "./libraryUpdate";
/** Old versions must resolve their image dependencies before any intermediate validation. */
export function integrateContentUpdates(local: Project, source: Project, forceArtwork = false): Project | null {
  const demo = integrateDemoUpdates(local, source) || local;
  const device = integrateDeviceUpdate(demo, source) || demo;
  const library = integrateLibraryUpdate(device, source, forceArtwork) || device;
  return integrateChapterUpdate(library, source) || (library !== local ? library : null);
}
