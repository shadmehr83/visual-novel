export function chapterHelp(
  name: string,
  element: HTMLElement,
): string | undefined {
  if (!element.closest(".chapter-workspace")) return;
  const exact: Record<string, string> = {
    "back to editor":
      "Return to the scene editor. Chapter edits stay saved in this project.",
    "organise existing scenes into chapter one":
      "Group the existing scenes into one chapter without rewriting their dialogue.",
    "add chapter":
      "Create a chapter with one new opening scene. Choose its entry rules and next chapter here.",
    "chapter title":
      "Name shown for this chapter in the editor and player’s chapter badge.",
    "chapter author notes":
      "Planning notes saved with the chapter; hidden during story playback.",
    "default chapter starting scene":
      "Opening used when none of this chapter’s conditional rules match.",
    "next chapter":
      "Chapter entered after a checked ending. No next chapter ends the story here.",
    "edit scene & dialogues":
      "Open this scene in the editor to change its artwork, effects and dialogue.",
    "add opening or scene to this chapter":
      "Create a scene inside this chapter. Assign it as a default or conditional opening if needed.",
    "remove condition":
      "Delete only this comparison. The scenario and its other conditions remain.",
    "add condition":
      "Add a saved-variable comparison. Empty scenarios never override the default opening.",
    "higher priority":
      "Check this scenario earlier. The first matching scenario chooses the chapter’s opening.",
    "lower priority": "Check this scenario later, after the rule above it.",
    "remove scenario":
      "Remove this opening rule. Its destination scene and dialogue are kept.",
    "add starting scenario":
      "Add a conditional opening rule. Rules run top to bottom once when the chapter begins.",
    "test a previous chapter’s state":
      "Try sample variable values to see which opening wins. These values do not change your story or playthrough.",
    "reset test values":
      "Reset the test inputs to the project’s starting values; saved story state stays unchanged.",
  };
  if (exact[name]) return exact[name];
  if (name.startsWith("complete chapter at "))
    return "Mark this ending as a chapter exit. Continue then enters Next chapter; an existing dialogue connection still takes priority.";
  if (name.startsWith("chapter for "))
    return "Move this scene into another chapter. Its artwork and dialogue remain; chapter entry and exit references are repaired.";
  if (name.startsWith("add unassigned scene:"))
    return "Include this existing scene in the selected chapter without copying or rewriting it.";
  if (/^scenario name \d+$/.test(name))
    return "An author-only label for this opening rule, such as Warm morning.";
  if (/^scenario starting scene \d+$/.test(name))
    return "Scene entered when this rule is the first match. It must belong to this chapter.";
  if (/^match scenario \d+$/.test(name))
    return "All requires every comparison to pass. Any requires at least one. An empty rule never matches.";
  if (/^scenario \d+ condition \d+ variable$/.test(name))
    return "Saved story variable to check at chapter entry, such as trust or outfit.";
  if (/^scenario \d+ condition \d+ comparison$/.test(name))
    return "How to compare the saved value: equal, different, or a numeric threshold such as at least.";
  if (/^scenario \d+ condition \d+ value$/.test(name))
    return "Value this rule compares against. Use true/false for flags, a number for scores, or text for named choices.";
  if (name.startsWith("preview "))
    return "Temporary test value used to preview the chosen opening. It does not change saved variables or player progress.";
  if (element.closest('nav[aria-label="Story chapters"]'))
    return "Select this chapter to edit its scenes, opening rules and endings.";
  return undefined;
}
