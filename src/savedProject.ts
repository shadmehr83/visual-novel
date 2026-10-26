import saved from "./saved-project.json";
import { validateProject } from "./model";

// A fresh copy keeps editor changes separate from the published snapshot.
export function savedProject() {
  return validateProject(structuredClone(saved));
}
