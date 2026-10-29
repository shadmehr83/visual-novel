# Chapters and mouse resizing (2.11)

## Resize without accidentally moving a window

- Drag the **top edge of Dialogue editor** up or down to change its height.
- Drag the **inner edge of Effects & interactions** left or right to change its
  width. The story library keeps its existing resize divider.
- Resize floating windows at any edge or corner. Resize panels docked to the outer
  workspace at their visible divider.
- Only the **six-dot grip** initiates dragging a panel out of its dock. A click on
  that grip does nothing; move at least six pixels while holding to start dragging.
  The rest of the title bar is safe to click. The explicit pop-out and Restore
  buttons and Move placement menu remain available.
- Sizes and docking positions stay in this browser's workspace settings. They do
  not alter the story, images or effects. Divider arrow keys also resize panels.

## Chapter → scene → dialogue

**Chapters advanced** is a new studio workspace. The story library has a chapter
selector and a chapter count; its scene list shows that chapter's scenes. Scene
and dialogue advanced workspaces remain available. The selected chapter is also
labelled above the preview and in the exported player.

A chapter stores its scene membership, default starting scene, ordered conditional
starting scenarios, marked ending dialogues and optional next chapter. Adding a
chapter creates one opening scene. Add more opening scenes in that chapter, or
move existing scenes using their chapter selectors. A chapter keeps at least one
scene. Existing projects without chapter data retain their previous runtime
behavior until organised into chapters.

## Conditional openings from the previous chapter

1. In **Chapters advanced**, select the chapter you are entering.
2. Choose its **Default starting scene** for cases where no rule matches.
3. Add a **starting scenario** and choose one of that chapter's scenes.
4. Add conditions using existing story variables. Use `equals`/`does not equal`
   for text or booleans; numbers also support greater than, at least, less than and
   at most. Select whether all or any conditions must match.
5. Order scenarios by priority. The first matching rule wins. Empty rules are
   inactive. The engine uses actual saved values at chapter entry and preserves
   them afterward; it does not reset them or infer choices from dialogue wording.
6. Open **Test a previous chapter's state** to try sample values and see which
   opening would win. This sandbox changes neither initial variables nor a saved
   playthrough.
7. In the outgoing chapter, choose **Next chapter** and check its ending dialogues.
   Continuing from one of these endings completes the current chapter and enters
   the selected opening. An unchecked terminal line ends the story. If you add a
   normal dialogue connection or choices to a marked ending, that explicit route
   is followed first.

Chapter structure, rules and notes survive complete project export/import,
IndexedDB autosave and standalone player export. The event history records the
chosen opening and chapter completion. A compatible older First Match project
receives the chapter scaffold and missing starter scenes once, with a recovery
copy through the existing content-update mechanism. Existing authored chapters
and custom scene artwork are never replaced by this migration.

## Chapter two: editable opening drafts

The uploaded story bible ends with the first-date demo. It gives continuity rules
and later possibilities, not a finished second-chapter script. These are new,
editable starter scenes, labelled as drafts rather than a complete chapter:

| Recorded chapter-one outcome | Chapter-two opening |
| --- | --- |
| `second_meeting_interest = "yes"` | A small reason to smile |
| `second_meeting_interest = "slow"` or `"uncertain"` | Room to take it slowly |
| `second_meeting_interest = "no"` | A goodbye can stay a goodbye |
| `date_declined = true` | A day without an appointment |
| `date_deferred = true` | An open conversation |
| No rule matches, including leaving the app unopened | The day carries on |

The original seven scenes form chapter one, **The First Match**. Chapter two is
**The Space Between Messages**, with six starting scenes and five conditional
rules plus its default. A polite refusal stays a refusal: those openings do not
invent a new message from Maria or force another meeting. All openings are short
and stop at an explicit draft endpoint so you can continue writing them.

They reuse the established bedroom artwork and restrained effects as temporary
atmosphere. Existing café artwork, lighting, rain masks and other visual settings
are unchanged. Chapter-one terminal captions now say End of Chapter One; none of
its branches is overwritten. Existing local dialogue text is preserved on upgrade.
