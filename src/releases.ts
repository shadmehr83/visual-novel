export const ENGINE_VERSION = "2.3.0";
export type ReleaseFeature = {
  name: string;
  description: string;
  steps: string[];
  action?: string;
};
export type Release = {
  version: string;
  name: string;
  date: string;
  commit?: string;
  features: ReleaseFeature[];
};
const f = (
  name: string,
  description: string,
  path: string,
  action?: string,
): ReleaseFeature => ({ name, description, steps: path.split(" → "), action });
export const releases: Release[] = [
  {
    version: "2.3.0",
    name: "Phone navigation and missing story updates",
    date: "2026-10-28",
    features: [
      f(
        "Integrate the missing café departure into saved projects",
        "Compatible older First Match projects receive the rainy After the café scene on normal reload. Existing backgrounds, effects, other scenes and edited farewell lines are preserved; the previous project is backed up.",
        "Open or reload the studio → Scenes library → After the café; Restore previous local project opens the recovery copy",
        "library:Scenes",
      ),
      f(
        "Home and back in every device mode",
        "The back arrow and labelled Home button remain available in phone and computer interfaces, including older configurations that open directly to chat. They stay outside the app scroll area.",
        "Open a device scene → Use the header back arrow or Home button → Choose Ember, Insta or Settings",
        "devices",
      ),
      f(
        "Texting controls only inside chat",
        "Home, Insta and Settings no longer contain a second dialogue pane, reply choices or the texting keyboard. Reopen Ember to see conversation text and authored replies.",
        "Advanced devices → Open Home or Insta in the preview → Open Ember to show messages and reply controls",
        "devices",
      ),
      f(
        "Separate story controls when browsing the phone",
        "Authored opening actions such as continuing the story or choosing to open an app stay outside the handset while Home/feed is shown. Actual texting choices remain inside chat, and navigation does not advance unseen chat lines.",
        "Play story → Browse the opening phone Home/feed → Use story actions outside the device or open Ember to text",
        "editor",
      ),
      f(
        "Add departure without replacing a project",
        "A focused update button can add the missing departure to a copied project. It preserves custom café loops and creates a recovery copy instead of replacing the full project with a snapshot.",
        "Editor → Project banner → Add missing café departure (shown only when the scene is absent)",
        "editor",
      ),
    ],
  },
  {
    version: "2.2.0",
    commit: "24935cf",
    name: "Dedicated devices and a flexible preview",
    date: "2026-10-28",
    features: [
      f(
        "Advanced devices workspace",
        "A full workspace groups phone and computer controls into Frame & placement, Timing, Appearance, Apps, and Dialogue & replies. Existing Home, Ember, Insta and Settings remain available.",
        "Top tabs → Advanced devices → Choose a scene with a device → Select a settings section",
        "devices",
      ),
      f(
        "Independent device frame resizing",
        "Width moves the right edge without changing height or drifting diagonally. Height moves the lower edge. Optional proportion lock scales both dimensions around a fixed upper-left corner.",
        "Advanced devices → Frame & placement → Device width or Device height; enable Lock frame proportions when wanted",
        "devices",
      ),
      f(
        "Resizable and lockable preview window",
        "Unlock and resize the entire game preview pane, not just its artwork zoom. Fill preview space gives the scene more height; lock saves that allocation while the dialogue editor uses the remainder.",
        "Editor → Preview footer → Unlock window → Drag its lower-right corner or Fill preview space → Lock window",
        "editor",
      ),
      f(
        "Saved outfits in the dialogue panel",
        "The original three clothing cards and inspect/confirm flow are preserved. The dialogue panel now has an Items & outfits tab and a direct shortcut to the saved wardrobe selection.",
        "Editor → Items & outfits beside Dialogue → Open saved outfit selection; or Edit → Saved outfit selection",
        "wardrobe",
      ),
      f(
        "Recover missing outfit cards without replacing a project",
        "An explicit restore button adds missing demo cards and images while keeping existing custom cards, descriptions, backgrounds and dialogue routes.",
        "Editor → Items & outfits → Restore missing demo outfits",
        "items",
      ),
      f(
        "Additional items keep their own choice routes",
        "New item cards create independent confirmation choices and direct uploads remain available. Enabling/disabling a picker retains its existing cards. Normal dialogue and device self-reply are kept.",
        "Editor → Items & outfits → Add item for current dialogue → Upload image and choose its destination",
        "items",
      ),
      f(
        "Full app preview and scrolling feed",
        "Browse Home, Ember, scrolling Insta and Settings in the device workspace preview. Add custom app shortcuts and icons without altering story progression or removing the original apps.",
        "Advanced devices → Apps → Enable full app system or Add app shortcut; browse using Preview app buttons",
        "devices",
      ),
    ],
  },
  {
    version: "2.1.0",
    commit: "0aa0629",
    name: "After the café",
    date: "2026-10-28",
    features: [
      f(
        "Separate rainy departure scene",
        "The café goodbye, second-meeting choices and follow-up messages now continue in a separate scene after the café, preserving all branches and the original café visuals.",
        "Editor → Scenes library → After the café; during playback choose Step outside after the café reflection",
        "library:Scenes",
      ),
      f(
        "Return to Maria’s phone chat",
        "The departure plays through the existing phone interface. Maria’s follow-up is an incoming message with authored replies, and the ending closes the phone. Declining a second meeting still skips the follow-up.",
        "Editor → Select After the café → Phone; Play story from the café to continue into the phone sequence",
        "devices",
      ),
      f(
        "Rainy pavement background",
        "A new downward-looking illustration shows rain ripples on wet paving and warm reflected café light. It is embedded in portable project exports and leaves the café’s original background untouched.",
        "Editor → Select After the café → Scene properties → Background",
        "background",
      ),
    ],
  },
  {
    version: "2.0.0",
    commit: "77b169e",
    name: "Connected story workspace",
    date: "2026-10-28",
    features: [
      f(
        "Scenes advanced",
        "Move scene boxes, see their real exits, name routes and connect a dialogue branch to another scene.",
        "Top tabs → Scenes advanced → Select a scene → Add a scene branch, or drag an output dot to a scene input",
        "scenes",
      ),
      f(
        "Dialogue advanced",
        "Arrange dialogue boxes and connect Continue, reply and timed-action paths. It edits the same project as the original editor.",
        "Top tabs → Dialogue advanced → Choose scene → Drag a box heading or connect its output to another input",
        "dialogues",
      ),
      f(
        "Named routes",
        "Label a branch Friendly route or Hostile route without changing the text shown to the player. Existing state actions and conditions survive reconnection.",
        "Dialogue advanced → Click a route label or connecting line → Route name",
        "dialogues",
      ),
      f(
        "Graph navigation and saved layouts",
        "Pan, zoom, search, fit all, focus a selection and auto arrange. Box coordinates travel with project exports and GitHub snapshots; moving a box does not change story order.",
        "Scenes advanced or Dialogue advanced → Map toolbar → Find, Fit all, Focus selection or Auto arrange",
        "scenes",
      ),
      f(
        "Top menu and workspaces",
        "File, Edit, View, Effects and Instructions organise commands above the workspace. The original editor and its settings remain available.",
        "Top menu → Choose a menu; switch back using the Editor tab",
        "editor",
      ),
      f(
        "Dock controls at the top",
        "Keep controls above the stage, with an adjustable dock height. Left, right and floating placement still work.",
        "View → Dock controls at top; drag the divider below the dock to resize",
        "dock:top",
      ),
      f(
        "Version history and feature directions",
        "Browse every recorded milestone, search for a feature and open its current control location. Previous milestone numbers were assigned retrospectively from Git history.",
        "Top tabs → Update history → Search or expand a release",
        "updates",
      ),
    ],
  },
  {
    version: "1.15.0",
    name: "Simpler devices and safer playback",
    date: "2026-10-28",
    commit: "16b90c1",
    features: [
      f(
        "Simple device timing",
        "Show a device from one dialogue through another, with optional advanced individual overrides.",
        "Top tabs → Advanced devices → Timing → Interaction timing → Simple start & end dialogues",
        "devices",
      ),
      f(
        "Stable app navigation and computer layout",
        "Home, Ember messages, Insta and Settings share one device system. Opening an app does not advance dialogue. Choose the wider computer shape when needed.",
        "Top tabs → Advanced devices → Frame & placement → Device shape → Computer / laptop",
        "devices",
      ),
      f(
        "Device Settings and custom apps",
        "Change device-only wallpaper, font, colours and text size; upload icons and add shortcuts to built-in screens. The Settings app exposes device appearance during play.",
        "Top tabs → Advanced devices → Appearance; during playback open Home → Settings",
        "devices",
      ),
      f(
        "Independent device self-reply",
        "Allow custom replies in device dialogue separately from the normal dialogue overlay.",
        "Editor → Select dialogue → Dialogue editor → Allow custom response in device dialogue",
        "dialogue",
      ),
      f(
        "Pause and Escape recovery",
        "Pause controls, effect animation, sound and timed choices. Escape exits editor playtest; in the exported player it toggles pause. Render recovery avoids a permanently blank page.",
        "Editor → Play story → Pause menu; press Escape to return to editing",
        "editor",
      ),
      f(
        "Separate docks",
        "Show Effects & interactions beside Scene properties with independent scrolling.",
        "Editor → Controls placement → Two separate docks",
        "layout",
      ),
      f(
        "Active layer switches",
        "Toggle an effect for immediate comparison while retaining saved positions, masks and intensity values.",
        "Editor → Scene properties → Active",
        "active",
      ),
      f(
        "Direct item image upload",
        "Add an item even without existing choices, then upload its picture directly. Item text and controls are larger.",
        "Editor → Outfits & Items → Add item picker → Add item for current dialogue → Upload item image",
        "effect:Outfits & Items",
      ),
      f(
        "Outgoing scene effects",
        "Choose the transition used when leaving a scene; it can override the next scene’s entrance.",
        "Editor → Scene properties → Transitions → After this scene · exit effect",
        "transitions",
      ),
      f(
        "Maria’s separate profile portrait",
        "A new rainlit portrait keeps the café character’s style in a different composition. It can be imported into an existing local project without replacing that project.",
        "Advanced devices → Appearance → Use Maria’s new profile portrait",
        "devices",
      ),
      f(
        "Clearer phone and lighting controls",
        "Moved device placement into Phone, clarified chat-only versus app mode, and hid foreground overlays while placing lights so clicks reach the artwork.",
        "Editor → Phone, or Light Library → Place lights on scene",
        "effect:Light Library",
      ),
    ],
  },
  {
    version: "1.14.0",
    name: "Scheduled screens and light favourites",
    date: "2026-10-28",
    commit: "254cc74",
    features: [
      f(
        "Hinge dialogue range",
        "Choose the dialogue where a hinge starts and ends, then hide it or hold its final pose.",
        "Editor → Cinematics → Expand a hinge → Restrict hinge to a dialogue range",
        "effect:Cinematics",
      ),
      f(
        "Same-scene app switches",
        "Change the displayed device screen on authored dialogues without creating extra scenes. The old per-line schedule now lives under Advanced.",
        "Top tabs → Advanced devices → Timing → Advanced dialogue screen schedule; for a range enable Advanced overrides first",
        "devices",
      ),
      f(
        "Phone home and offline feed",
        "Functional back/Home buttons and a fictional scrolling feed accompany messages. Apps now use the names Ember and Insta.",
        "Advanced devices → Apps → Device experience → Device with apps; in playback use the device Home button",
        "devices",
      ),
      f(
        "Individual light favourites",
        "Save one lamp’s colour, radius and cycle, then reuse it with a click on the scene. The default loop is 0.5 → 1 → 0.5 at one second per step.",
        "Editor → Light Library → Save individual light favourite; choose Placement preset → Place lights on scene",
        "effect:Light Library",
      ),
      f(
        "Playback advance options",
        "Choose Continue only, Enter key, or clicking the scene. Choices, forms and timed interactions still require their own input.",
        "Editor → Play story → Advance story selector above the scene",
        "editor",
      ),
      f(
        "Named panels and specific help",
        "Explicit Outfits & Items and Effect Presets names and control-specific hover explanations make tools easier to locate.",
        "Editor → Effects menu → Choose a named panel; hover or focus a control",
        "effect:Outfits & Items",
      ),
    ],
  },
  {
    version: "1.13.0",
    name: "Items, presets and authoring refinements",
    date: "2026-10-27",
    commit: "e5b7548",
    features: [
      f(
        "Item and outfit inspection",
        "Show clothing, books or custom PNG items as foreground cards; inspect before confirming an authored choice, with optional background blur.",
        "Editor → Outfits & Items → Add item picker → Add item for current dialogue",
        "effect:Outfits & Items",
      ),
      f(
        "Reusable rain, lighting and motion setups",
        "Save whole categories or all scene effects as a named preset, then apply them in other scenes. Review copied masks against new artwork.",
        "Editor → Effect Presets → Enter name → Choose category → Save; select a saved preset to apply",
        "effect:Effect Presets",
      ),
      f(
        "Dialogue notes and deletion",
        "Add private planning notes and delete an accidental node. Incoming links and related data are repaired; Undo restores the edit.",
        "Editor → Select a dialogue → Author note or Delete dialogue node",
        "dialogue",
      ),
      f(
        "Numbered destinations",
        "Next-dialogue and choice targets show scene and dialogue numbers with speaker/text context.",
        "Editor → Dialogue editor → Next dialogue or a choice’s destination selector",
        "dialogue",
      ),
      f(
        "Exact slider values",
        "Sliders have paired numeric fields for precise coordinates and repeatable settings.",
        "Editor → Select an effect → Type into the numeric field beside its slider",
        "effect:Lighting",
      ),
      f(
        "Fonts and character colours",
        "Choose editor typography separately from story dialogue typography and character name colours.",
        "View → Appearance → Interface appearance or Story typography & speaker colours",
        "appearance",
      ),
      f(
        "Phone replies and proportions",
        "Narrower handset proportions and self-reply alongside multi-choice replies improve phone playback.",
        "Advanced devices → Frame & placement for size; Play story → Self-reply → Select authored path → Send",
        "devices",
      ),
      f(
        "Authored subtle environmental effects",
        "Carefully masked rain, local lamp cycles, slight foliage motion and camera approaches were applied to earlier scenes. The café visuals were preserved.",
        "Editor → Select bedroom, wardrobe or journey scene → Rain, Lighting, Motion or Camera",
        "effect:Lighting",
      ),
    ],
  },
  {
    version: "1.12.0",
    name: "Hinges and foreground devices",
    date: "2026-10-27",
    commit: "6390bb2",
    features: [
      f(
        "Hinges and small joint motion",
        "Select a region, place a pivot, then save position, rotation, scale and opacity poses on dialogue slides.",
        "Editor → Cinematics → Add hinge → Select its region → Place pivot → Save poses on dialogues",
        "effect:Cinematics",
      ),
      f(
        "Expression replacement and foreground objects",
        "Swap a selected region’s artwork or use a transparent foreground asset. Flat-image patches do not reconstruct hidden background.",
        "Editor → Cinematics → Expand hinge → Choose source/replacement artwork and pose settings",
        "effect:Cinematics",
      ),
      f(
        "Pose and scene transitions",
        "Choose cut, snappy, smooth, sliding or fading motion between poses and scene entrances.",
        "Editor → Cinematics → Hinge transition; for scenes use Scene changes",
        "effect:Cinematics",
      ),
      f(
        "Device conversation interface",
        "A styled phone/chat overlay supports authored message history, typing indicators, a decorative keyboard and phone or desktop shape.",
        "Editor → Phone → Add phone system → Device placement & contact",
        "devices",
      ),
      f(
        "Custom replies and fullscreen",
        "Self-reply expands only when requested and follows a selected authored path. Fullscreen enlarges playback.",
        "Editor → Play story → Self-reply, or fullscreen button above the scene",
        "editor",
      ),
      f(
        "Maria and new opening artwork",
        "Renamed the girl Maria and integrated matching bedroom, wardrobe and street art. The manually edited café was retained.",
        "Editor → Scenes library → Select an opening scene; Characters lists Maria",
        "library:Scenes",
      ),
    ],
  },
  {
    version: "1.11.2",
    name: "Reference archive",
    date: "2026-10-27",
    commit: "282f111",
    features: [
      f(
        "Archived supplied image collection",
        "Stored the supplied ZIP’s images together with an inventory and checksums for future art work. They do not automatically replace scene backgrounds.",
        "GitHub repository → references → incoming → Reference inventory and archived files",
      ),
    ],
  },
  {
    version: "1.11.1",
    name: "Opening and café reference board",
    date: "2026-10-27",
    commit: "5359105",
    features: [
      f(
        "Recorded visual reference",
        "Saved the supplied opening/phone/café mood reference for later use without applying it to the final café image.",
        "GitHub repository → references → incoming → Supplied visual reference",
      ),
    ],
  },
  {
    version: "1.11.0",
    name: "The First Match story adaptation",
    date: "2026-10-27",
    commit: "d0ca7ec",
    features: [
      f(
        "Scripted opening and café routes",
        "Adapted the story bible into linked opening and café dialogue, with invitation choices, boundaries, observations and multiple endings.",
        "Editor → Scenes library → Select a scene → Dialogue; use Play story to follow a route",
        "dialogue",
      ),
      f(
        "Mood-matched placeholder scenes",
        "Opening scenes received backgrounds matching the mood brief, ready for later replacement. Original café artwork and effects were protected.",
        "Editor → Select an opening scene → Scene properties → Background",
        "background",
      ),
      f(
        "Source and implementation notes",
        "Kept extracted document sources and the story mapping alongside the project.",
        "GitHub repository → docs → story → IMPLEMENTATION.md and source documents",
      ),
    ],
  },
  {
    version: "1.10.1",
    name: "Portable authored checkpoint",
    date: "2026-10-27",
    commit: "35de011",
    features: [
      f(
        "Uploaded project saved in GitHub",
        "Published the uploaded checkpoint with original embedded artwork, lighting, rain, motion and camera settings for retrieval from another computer.",
        "Editor → File → Open project for your exported JSON; Load GitHub snapshot loads the committed checkpoint",
        "save",
      ),
    ],
  },
  {
    version: "1.10.0",
    name: "Unified selection and brush tools",
    date: "2026-10-27",
    commit: "d9e1e5a",
    features: [
      f(
        "Brush and eraser",
        "Paint or remove affected pixels with a circular brush and adjustable radius. Each stroke supports Undo.",
        "Editor → Edit a rain, local light, motion or hinge region → Selection tools → Paint brush or Eraser",
        "effect:Rain",
      ),
      f(
        "Locked outer boundary",
        "Lock a polygon/automatic selection, optionally empty its inside, then paint only within it for precise masking.",
        "Editor → Region selection → Lock selection as outer boundary → Start empty inside boundary → Paint brush",
        "effect:Rain",
      ),
      f(
        "Shared wand and edge tools",
        "One toolbar offers Polygon, Colour wand and Snap to edges for all region effects. Strict/Broad reach presets simplify tolerance; selection is local image processing, not semantic AI.",
        "Editor → Region’s Edit selection / brush → Selection tools → Choose tool and Selection reach",
        "effect:Lighting",
      ),
    ],
  },
  {
    version: "1.9.1",
    name: "Dialogue layout refinement",
    date: "2026-10-27",
    commit: "9232d40",
    features: [
      f(
        "Expanded page dialogue editing",
        "Switching between pinned, full-page and hidden dialogue modes properly expands the editing area.",
        "View → Layout → Dialogue layout → Full page scrolling or Pinned scrolling panel",
        "layout",
      ),
    ],
  },
  {
    version: "1.9.0",
    name: "Camera depth and workspace comfort",
    date: "2026-10-27",
    commit: "2df1e97",
    features: [
      f(
        "Camera approach and walking movement",
        "Animate a zoom/focal approach with optional bob and sway to suggest walking toward a point.",
        "Editor → Camera → Enable camera → Set focal point, zoom, duration, bob and sway",
        "effect:Camera",
      ),
      f(
        "Footsteps",
        "Use generated placeholder steps or imported audio with a camera move. Playback sound must be enabled explicitly.",
        "Editor → Camera → Configure footsteps; Play story → Enable scene sound",
        "effect:Camera",
      ),
      f(
        "Resizable and collapsible workspace",
        "Collapse the story library, resize panels, change preview zoom and choose pinned/page/hidden dialogue layouts.",
        "View → Layout, or drag a panel divider; use Hide story for extra preview room",
        "layout",
      ),
      f(
        "Themes and panel colours",
        "Choose dark, light or warm editor themes and customise each panel background independently.",
        "View → Appearance → Interface theme and panel backgrounds",
        "appearance",
      ),
      f(
        "Delayed descriptive hover help",
        "Hover or focus a control to see its explanation; help can be disabled in Appearance.",
        "View → Appearance → Delayed hover help",
        "appearance",
      ),
      f(
        "Effect activity count",
        "A count above the workspace opens a list of configured visual effects; it is not a GPU performance measurement.",
        "Top menu → Effects count, or Scene properties → Active",
        "active",
      ),
    ],
  },
  {
    version: "1.8.0",
    name: "Dockable controls and selective motion",
    date: "2026-10-26",
    commit: "bf8b8f2",
    features: [
      f(
        "Independent scrolling controls",
        "The inspector and dialogue area scroll without pushing the scene out of view. Named effect panels shorten long control lists.",
        "Editor → Effects menu → Choose Rain, Lighting or Motion",
        "effect:Rain",
      ),
      f(
        "Left, right and floating docks",
        "Place or drag the control window around the editing workspace while keeping the stage visible.",
        "View → Dock controls left/right or Floating controls; use Drag window when floating",
        "dock:float",
      ),
      f(
        "Selected-area lighting without a radius",
        "Illuminate only a chosen mask to add depth instead of relying on circular falloff.",
        "Editor → Lighting → Local light → Light coverage → Selected area only (no radius)",
        "effect:Lighting",
      ),
      f(
        "Wind and cloth / foliage motion",
        "Apply gentle sway and distortion inside a drawn or automatically selected region. It is a small 2D displacement, not physical cloth simulation.",
        "Editor → Motion → Add motion zone → Select region → Set strength, direction and cycle",
        "effect:Motion",
      ),
    ],
  },
  {
    version: "1.7.0",
    name: "Multiple effect zones and project publishing",
    date: "2026-10-26",
    commit: "4df4a84",
    features: [
      f(
        "Multiple rain regions",
        "Create independent named rain zones with polygon or approximate colour-wand selection; enabled regions combine into the weather mask.",
        "Editor → Rain → Add rain zone → Draw or select its area",
        "effect:Rain",
      ),
      f(
        "Global and local lights",
        "Use whole-scene illumination or local lights with their own position, radius, colour and animated intensity.",
        "Editor → Lighting → Add global light or Add local light",
        "effect:Lighting",
      ),
      f(
        "Dedicated affected light areas",
        "Constrain light to a face, arm or object with a selected region; spread can change the local footprint with its intensity cycle.",
        "Editor → Lighting → Local light → Add dedicated affected area → Draw or use selection tools",
        "effect:Lighting",
      ),
      f(
        "Custom normal dialogue replies",
        "Allow an expandable Self-reply on authored non-choice dialogue without changing narrative state automatically.",
        "Editor → Dialogue → Allow custom response in normal dialogue; Play story → Self-reply",
        "dialogue",
      ),
      f(
        "Hide dialogue while editing",
        "Move the dialogue overlay out of the preview to see and edit the full background.",
        "Editor → Hide dialogue above the scene; click Show dialogue to restore it",
        "editor",
      ),
      f(
        "Complete project saves and optional publisher",
        "Save portable JSON with assets and all effects; an optional authenticated server publisher can update only the project snapshot in GitHub.",
        "File → Save project, or Editor → Save → Publish directly to GitHub",
        "save",
      ),
    ],
  },
  {
    version: "1.6.1",
    name: "Snapshot recovery",
    date: "2026-10-26",
    commit: "adfd600",
    features: [
      f(
        "Open committed café with local recovery",
        "Loading the GitHub snapshot selects the preserved café and keeps a recovery copy of different local work.",
        "Editor → Load GitHub snapshot; Restore previous local project returns to the recovery copy",
        "editor",
      ),
    ],
  },
  {
    version: "1.6.0",
    name: "Cross-device project checkpoint",
    date: "2026-10-26",
    commit: "6c45162",
    features: [
      f(
        "Embedded exported project in GitHub",
        "The committed project snapshot includes uploaded backgrounds and authored effects. Website code updates and browser-local edits remain separate.",
        "Editor → Load GitHub snapshot; to move newer local edits use File → Save project and Open project on the other device",
        "save",
      ),
    ],
  },
  {
    version: "1.5.0",
    name: "Editable light intensity loops",
    date: "2026-10-26",
    commit: "4d8d93e",
    features: [
      f(
        "Loop intensity sequence",
        "Enter a repeating list of intensity multipliers with smooth fades and seconds per step. Reduced motion holds the base light intensity.",
        "Editor → Lighting → Loop lighting → Intensity sequence → Apply light sequence",
        "effect:Lighting",
      ),
    ],
  },
  {
    version: "1.4.0",
    name: "Café ambience",
    date: "2026-10-26",
    commit: "d9a4aa3",
    features: [
      f(
        "Subtle flicker and selected motion",
        "Introduced lamp variation and gentle plant/person shading motion in the café checkpoint, preserved as authored visual settings.",
        "Editor → Select café → Lighting or Motion → Inspect its existing zones",
        "effect:Lighting",
      ),
    ],
  },
  {
    version: "1.3.0",
    name: "Hosting and AI handoff",
    date: "2026-10-26",
    commit: "0a63b09",
    features: [
      f(
        "Project and hosting documentation",
        "Collected engine/source/download links, deployment steps and AI setup. AI still needs its server-side provider configuration.",
        "GitHub repository → docs → AI_SETUP.md and DEPLOY_CLOUDFLARE.md; for the in-app helper use Assistant",
        "assistant",
      ),
    ],
  },
  {
    version: "1.2.0",
    name: "Single-file local studio",
    date: "2026-10-26",
    commit: "4feca74",
    features: [
      f(
        "Offline HTML editor",
        "Download a self-contained studio and open it in a browser. Local authoring works without hosting; remote AI still needs the configured server.",
        "File → Download local editor → Open the downloaded HTML in a browser",
        "local-editor",
      ),
    ],
  },
  {
    version: "1.1.0",
    name: "AI, sound and interactive playback",
    date: "2026-10-26",
    commit: "b36af25",
    features: [
      f(
        "Provider AI assistant",
        "Ask for supported scene/dialogue/effect edits, review the proposal and apply or reject it. Requires Cloudflare server-side secrets for online requests.",
        "Editor → Assistant (sparkle icon) → Enter studio password → Ask AI → Review proposal",
        "assistant",
      ),
      f(
        "Voice input and read-aloud",
        "Dictate a request with browser speech recognition and optionally read proposals aloud. Microphone support and permissions depend on the browser.",
        "Editor → Assistant → Speak your request → Review transcript before sending",
        "assistant",
      ),
      f(
        "Sprites and expressions",
        "Import and place character sprites, select expressions, and author sprite keyframes.",
        "Editor → Tools (speaker icon) → Sprites and keyframes",
        "tools",
      ),
      f(
        "Audio tracks",
        "Import scene music/ambience and set looping and volume. The player explicitly enables sound.",
        "Editor → Tools → Audio → Import audio; Play story → Enable scene sound",
        "tools",
      ),
      f(
        "Timed choices / QTEs",
        "Author timed prompts with success and timeout dialogue destinations and accessibility controls.",
        "Editor → Select a dialogue → Tools → Timed interaction / QTE",
        "tools",
      ),
      f(
        "Standalone playable export",
        "Export the authored story and embedded assets as a playable HTML file without an AI dependency.",
        "File → Export playable HTML → Open the downloaded game in a browser",
        "export-player",
      ),
    ],
  },
  {
    version: "1.0.0",
    name: "Stillframe studio foundation",
    date: "2026-10-26",
    commit: "24b4a6e",
    features: [
      f(
        "Scene and dialogue editors",
        "Create and edit scenes, lines and reply branches using the original list-based editor.",
        "Editor → Scenes library → Select a scene → Dialogue panel",
        "dialogue",
      ),
      f(
        "Backgrounds and asset library",
        "Import artwork, fit and position it, and retain original embedded images in complete project files.",
        "Editor → Scene properties → Background → Import background; Assets opens the image library",
        "background",
      ),
      f(
        "Atmosphere, lighting and rain",
        "Adjust grading, tint, soft light, weather, vignette and the original rain mask with live preview.",
        "Editor → Scene properties → Atmosphere; use Effects → Lighting or Rain for related tools",
        "effect:Lighting",
      ),
      f(
        "Characters, narrative state and observations",
        "Maintain character notes, variables, conditional choices and authored interpretations of clues.",
        "Editor → Characters or State in the library; Dialogue → State & clues shows runtime values",
        "state",
      ),
      f(
        "Playtest and event history",
        "Play the authored branches and inspect the recorded choice/transition history separately from software update history.",
        "Editor → Play story; View → Playthrough event log",
        "events",
      ),
      f(
        "Autosave, undo, project import and export",
        "Browser autosave retains work on this device; complete project JSON moves it between devices. Undo/Redo reverses edits.",
        "File → Save project or Open project; Edit → Undo or Redo",
        "save",
      ),
      f(
        "Cloudflare web delivery",
        "A built static package makes the studio available over HTTPS. Git-connected Pages deploys main automatically once configured.",
        "Internet browser → Open visual-novel-8b9.pages.dev; hosting instructions are in docs/DEPLOY_CLOUDFLARE.md",
      ),
    ],
  },
];
