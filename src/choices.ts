import type { Choice, Project } from "./model";
/** A disabled branch retains its target, actions and authoring metadata. */
export function choiceAvailable(choice: Choice, values?: Project["variables"]) {
  return choice.enabled !== false && (!choice.condition || values?.[choice.condition.key] === choice.condition.equals);
}
