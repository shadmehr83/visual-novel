import { afterEach, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { demo } from "./demo";
import { start, type Node } from "./model";
import { StoryTimer } from "./StoryTimer";
import { NewGameSetup } from "./NewGameSetup";
import { autoContinuePreference, decisionTimer, readingSeconds, timedDecisionsPreference } from "./storyTiming";

// Story timers (by Claude): reading times, timed decisions and the player's auto-continue switch.
afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});
it("gives short lines 3 s, one line 4 s and two lines 8 s", () => {
  expect(readingSeconds("Hi. You made it.", 1)).toBe(3);
  expect(readingSeconds("I knew it would rain the moment I left the umbrella at home.", 1)).toBe(4);
  expect(readingSeconds("I knew it would rain the moment I left the umbrella at home, and of course it did.", 2)).toBe(8);
});
const line = (extra: Partial<Node>): Node => ({ id: "t", speaker: "Maria", text: "Hello there, you made it.", choices: [], ...extra });
const choices = [
  { id: "a", text: "Yes", target: "x", actions: [], note: "" },
  { id: "b", text: "No", target: "x", actions: [], note: "" },
];
it("only counts down decisions whose own switch and the project switch are on", () => {
  const p = demo();
  const node = line({ choices, timedChoice: { enabled: true, seconds: 5 } });
  expect(decisionTimer(p, node)?.seconds).toBe(5);
  p.settings.timedDecisions = false;
  expect(decisionTimer(p, node)).toBeNull();
});
it("takes the chosen reply when a timed decision runs out", () => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance", "setTimeout"] });
  const p = demo();
  const onChoose = vi.fn(), onContinue = vi.fn();
  render(<StoryTimer project={p} node={line({ choices, timedChoice: { enabled: true, seconds: 2, choice: "b" } })} runtime={start(p)} text="Choose" onChoose={onChoose} onContinue={onContinue} />);
  act(() => vi.advanceTimersByTime(1500));
  expect(onChoose).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(700));
  expect(onChoose).toHaveBeenCalledWith("b");
  expect(onContinue).not.toHaveBeenCalled();
});
it("lets the player turn timed decisions off", () => {
  const p = demo();
  timedDecisionsPreference.set(p, false);
  const view = render(<StoryTimer project={p} node={line({ choices, timedChoice: { enabled: true, seconds: 2 } })} runtime={start(p)} text="Choose" onChoose={() => {}} onContinue={() => {}} />);
  expect(view.container.querySelector(".story-timer")).toBeNull();
  act(() => timedDecisionsPreference.set(p, true));
  expect(view.container.querySelector(".story-timer")).not.toBeNull();
});
it("asks new players how to continue and whether to time the story", () => {
  const p = demo();
  p.scenes[0].nodes[0] = line({ choices, timedChoice: { enabled: true, seconds: 5 } });
  const onMode = vi.fn(), onBegin = vi.fn();
  const view = render(<NewGameSetup project={p} mobile={false} mode="continue" onMode={onMode} onBegin={onBegin} onBack={() => {}} />);
  fireEvent.click(view.getByLabelText(/Press Enter/));
  expect(onMode).toHaveBeenCalledWith("enter");
  fireEvent.click(view.getByLabelText(/Yes, move on by itself/));
  expect(autoContinuePreference.get(p)).toBe(true);
  fireEvent.click(view.getByLabelText(/No, let me take my time/));
  expect(timedDecisionsPreference.get(p)).toBe(false);
  expect(view.getByText(/change these settings anytime/)).toBeTruthy();
  fireEvent.click(view.getByRole("button", { name: "Start the story" }));
  expect(onBegin).toHaveBeenCalled();
  view.unmount();
  // Phones have no Enter key, and stories without timed decisions skip that question.
  const plain = render(<NewGameSetup project={demo()} mobile mode="screen" onMode={() => {}} onBegin={() => {}} onBack={() => {}} />);
  expect(plain.queryByLabelText(/Press Enter/)).toBeNull();
  expect(plain.queryByText("Should decisions have a time limit?")).toBeNull();
});
it("continues plain lines only while the player has auto-continue on", () => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance", "setTimeout"] });
  const p = demo();
  const onContinue = vi.fn();
  const view = render(<StoryTimer project={p} node={line({})} runtime={start(p)} text="Hello there, you made it." onChoose={() => {}} onContinue={onContinue} />);
  expect(view.container.querySelector(".story-timer")).toBeNull();
  act(() => autoContinuePreference.set(p, true));
  expect(view.container.querySelector(".story-timer")).not.toBeNull();
  act(() => vi.advanceTimersByTime(3200));
  expect(onContinue).toHaveBeenCalledTimes(1);
});
