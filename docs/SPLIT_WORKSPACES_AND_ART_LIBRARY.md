# Stillframe 2.7: shared workspaces and complete artwork folders

## Open two workspaces

Press **Split view** beside the workspace tabs. Keep the Editor beside Dialogue advanced, Scenes advanced, Advanced devices or Update history, or choose two different advanced workspaces. The controls above the panes choose the main and second workspace. Either pane can host the Editor. Both panes work on one project, without a separate copy.

Choose **Side by side** or **One above the other**, drag the divider, or focus it and press arrow keys to resize. **Swap sides** reverses their visual order. **Close second workspace** returns to a single workspace. Split layout preferences are saved in this browser. Playback temporarily shows one game view and restores the chosen split after returning to editing.

Both panes share the same selected scene/dialogue, project and Undo history. Selecting a map box selects that dialogue in the editor. Text, routing and artwork edits appear immediately in both panes. The maps retain their own pan, zoom and scroll areas. The story library initially collapses when opening a split to leave more room for the scene; its toolbar button can reopen it.

## Select artwork directly from a dialogue map

In **Dialogue advanced**, select a dialogue box. In its details, **Image for this dialogue** includes **Dialogue background image folder** and **Dialogue background image**. Pick any saved image from a populated folder. This sets a temporary sub-scene for that dialogue. It does not replace the main scene background or another dialogue's shared view. If the image changes, masks from the old image are cleared rather than applied in the wrong place.

**Use an existing sub-scene** reuses an authored view. **Return this dialogue to main background** removes only this dialogue's override. The next dialogue keeps its own view. Scene maps also expose their scene background selector.

## Recover the missing library

Earlier updates could copy newer sub-scenes before importing all their image dependencies. This caused **Missing sub-scene background** during validation, left the local project unchanged and prevented its artwork folders from being populated. Version 2.7 imports the required assets before validating those updates and retries the focused artwork update for compatible saved projects.

The visible **Restore artwork** button retries the focused merge and saves the previous project as a recovery copy. It adds missing committed images, repairs the three saved outfit cards and fills folder memberships. It keeps custom images, folders, dialogue, scene settings and the protected café. It does not replace the complete project with the GitHub checkpoint.

In **Assets → Artwork folder**, the published library has:

- **Background scenes:** seven images, including the window and monitor close-ups.
- **Outfits & items:** three transparent outfit PNGs.
- **Profiles & app icons:** Maria's portrait and the three app icons.

Image selectors show counts and only list populated folders. A currently selected image remains available even when it belongs to a different folder. Existing custom folders remain intact.

## Retrieve images from GitHub on another computer

Open https://github.com/shadmehr83/visual-novel/tree/main/artwork . Each current project image is an ordinary file under `background-scenes`, `outfits-and-items` or `profiles-and-app-icons`. Click a file to preview or download it. `generated-originals` archives all 17 available generation originals, including earlier alternatives and full-resolution PNG sources of WebP images. Existing user-supplied references remain in `references/incoming`.

`artwork/manifest.json` maps project image IDs to files and includes dimensions and SHA-256 checksums. `node scripts/archive-artwork.mjs` refreshes the current-art archive without converting images. `node scripts/verify-artwork.mjs` checks the bytes of current images and generation originals. Archived alternatives do not enlarge the web app bundle.

The published project JSON includes all 14 current images and folder memberships. Later edits made in a browser still need a project export or an explicit project publication to move between computers; engine deployment alone does not publish browser-local edits.
