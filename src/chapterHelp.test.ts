import { it, expect } from "vitest";
import { describeControl } from "./HoverHelp";
it("describes every chapter control with its own action instead of generic scene help", () => {
  const main = document.createElement("main");
  main.className = "chapter-workspace";
  const controls = [
    "Chapter title",
    "Chapter author notes",
    "Default chapter starting scene",
    "Next chapter",
    "Complete chapter at cafe:end",
    "Chapter for bedroom",
    "Scenario name 1",
    "Scenario starting scene 1",
    "Match scenario 1",
    "Scenario 1 condition 1 variable",
    "Scenario 1 condition 1 comparison",
    "Scenario 1 condition 1 value",
    "Higher priority",
    "Lower priority",
    "Add condition",
    "Remove condition",
    "Remove scenario",
    "Add starting scenario",
    "Preview trust",
    "Reset test values",
    "Add chapter",
    "Add opening or scene to this chapter",
  ];
  const descriptions = controls.map((label) => {
    const button = document.createElement("button");
    button.setAttribute("aria-label", label);
    main.append(button);
    return describeControl(button).text;
  });
  expect(new Set(descriptions).size).toBe(controls.length);
  expect(descriptions.join(" ")).not.toContain("Arrange the workspace");
  expect(descriptions.every((text) => text.length < 210)).toBe(true);
  expect(descriptions[8]).toContain("All requires");
  expect(descriptions[12]).toContain("earlier");
});
