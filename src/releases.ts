export const ENGINE_VERSION = "2.20.3";
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
  timestamp?: string;
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
 {version:"2.20.3",name:"Navigate author playthrough dialogue",date:"2026-10-30",timestamp:"2026-10-29T14:55:56.168300+00:00",features:[f("Previous, next and direct dialogue jumps", "Restore previous visited story positions or jump to numbered dialogue without restarting. Direct jumps keep current variables without applying skipped branch actions; project edits remain saved.", "Author’s playthrough → Previous dialogue or dialogue selector", "author-play")]},
 {version:"2.20.2",name:"Item picker closes cleanly",date:"2026-10-30",timestamp:"2026-10-29T14:46:40.176816+00:00",features:[f("Item window visibility and background", "The picker closes on unrelated dialogue after choosing an outfit. Limit its appearance to a selected dialogue and choose or reset its panel background colour.", "Outfits & Items → Show item picker on", "items")]},
 {version:"2.20.1",name:"Ember dialogue stays in Ember",date:"2026-10-30",timestamp:"2026-10-29T14:26:03.266993+00:00",features:[
 f("Chat dialogue stays inside its app", "Returning Home or browsing Insta, Weather or Settings hides Ember dialogue and replies instead of moving them outside. Reopening Ember restores the conversation; deliberate separate narration is retained.", "Phone → Ember → Back to Home → Ember", "devices"),
 f("Painted Weather app icon", "Weather has a matching painterly umbrella icon, including in existing saved projects and offline exports. Change it with the other app icons.", "Advanced devices → Apps → weather app icon", "devices")
 ]},
 {version:"2.20.0",name:"Compact phone exports and reversible replies",date:"2026-10-30",timestamp:"2026-10-29T13:58:39.184037+00:00",features:[
 f("Enable or disable a reply", "Hide a reply during play without deleting its destination, text, conditions or state actions. Restore it with the same Enabled checkbox.", "Dialogue editor → Choice → Enabled", "editor"),
 f("Phone-optimized playable game", "Export a viewport-filling phone player with larger device, compact dialogue and tap-to-continue. Desktop exports retain authored text and device sizes.", "Library footer → Export phone game", "export-player"),
 f("All game settings in Pause", "Both exports put sound, volume, progression and fullscreen inside Pause, alongside Save and quit and Quit without saving. Saved progress resumes in the same browser.", "Playable game → Pause menu → Save and quit", "editor"),
 f("Continuous invitation chat", "Invitation replies stay inside Ember; the deliberate question and Keep talking menu stays separate. Authored devices start with their decorative keyboard hidden.", "Scene 3 → Invitation chat", "devices")
 ]},
 {version:"2.19.0",name:"Cross-device saves and scoped exports",date:"2026-10-29",timestamp:"2026-10-29T13:00:22.749680+00:00",features:[
 f("Clear local and GitHub saving", "Choose a save destination and explicitly publish a complete project when connected. On opening, choose the latest GitHub save or retain local work with recovery protection.", "Save project file → Save destination", "save"),
 f("Individual image expansion", "Every artwork card has its own expand icon, so large previews no longer require scrolling to the end of the library.", "Assets → Image expand icon", "library:Assets"),
 f("Scoped playable exports", "Export the entire story, one chapter, a scene range or an inclusive dialogue range. Leaving the range finishes the exported demo.", "Library footer → Advanced playable export", "editor")
 ]},
 {version:"2.18.2",name:"Phone weather and app-specific headers",date:"2026-10-29",timestamp:"2026-10-29T12:47:15.633714+00:00",features:[
 f("Rainy-week Weather app", "Open Weather from the phone home screen to see all seven rainy days. Toggle the clock’s weather widget in Advanced devices, standard phone appearance or the phone’s Settings app.", "Advanced devices → Appearance → Show weather widget", "devices"),
 f("Contact strip only in chat", "The contact portrait and conversation name appear only in Ember messages. Other apps use a simple navigation heading, without changing your artwork.", "Phone Home → Ember or Insta", "devices")
 ]},
 {version:"2.18.1",name:"Leaner saves and artwork previews",date:"2026-10-29",timestamp:"2026-10-29T12:38:23.981636+00:00",features:[
 f("Lightweight progress saves", "Story advances save progress separately from unchanged artwork. Library thumbnails load on demand and hidden-tab scene animation pauses.", "Editor → Play story", "editor"),
 f("Expand artwork", "Select an asset and open Expand image, or click an artwork picker preview. View the image larger and close with Escape or Close preview.", "Assets → Select an image → Expand image", "library:Assets")
 ]},
 {version:"2.18.0",name:"Smoothness, stable workspaces and provider routing",date:"2026-10-29",timestamp:"2026-10-29T11:03:30.659208+00:00",features:[
 f("Stable workspace resets", "Reset clears stale preview geometry. Whole workspaces cannot dock inside their own child panels; resizing and floating remain available.", "Windows & docking → Restore all window positions", "windows"),
 f("Lighter editing and animation", "Edits share unchanged project data instead of copying embedded media. GIF rendering is capped near 30 frames per second.", "Editor → Scene controls", "editor"),
 f("Cilia provider assignments", "Assign OpenAI or Claude separately to dialogue, system UI suggestions and effects. Each selected provider needs its own server key.", "Assistant → API assistant → Assistant task", "assistant"),
 f("Recent features and individual destinations", "Recent controls are marked for two releases. Update entries have clickable titles, descriptions and links to individual affected areas.", "Update history → Select an update", "updates")
 ]},
 {version:"2.17.0",commit:"b135e0f",name:"AI Demand Export and timestamped update history",date:"2026-10-29",timestamp:"2026-10-29T10:26:17Z",features:[
 f("AI Demand Export", "Dictate and log a change request with its scene, dialogue, timestamp and engine version. Copy/open ChatGPT, download the handoff or prepare a GitHub inbox file. Existing-chat submission still requires Send in ChatGPT.", "Assistant → AI Demand Export", "assistant"),
 f("GitHub request inbox", "Request files live separately in demands/inbox. The GitHub draft flow uses your browser login; direct saving is available when the existing publisher is configured. A saved file does not execute a task.", "Assistant → AI Demand Export → Save request in GitHub", "assistant"),
 f("Update times and concise controls", "Update history shows recorded times in Sydney, including seconds. The toolbar shows only the version; chapter controls have short, specific hover help.", "Update history → Recorded time or Chapters advanced", "updates")
 ]},
 {version:"2.16.0",commit:"227fad7",name:"GIF film editor and precise transition timing",date:"2026-10-29",timestamp:"2026-10-29T10:16:13Z",features:[
 f("Slow, pause and cue GIFs", "Scrub a GIF filmstrip, type exact source-frame times, choose 0.01–16× speed, hold a still frame or play once then freeze. Dialogue cues can play, resume, pause or run one cycle without changing the background asset.", "Scenes advanced → Background sequence → Click GIF thumbnail → GIF film editor", "scenes"),
 f("Editable transitions on the film timeline", "Scene entrances, exits, each sub-scene and returns to the main view have exact duration fields. Individual dialogues can override the transition, with settings retained in project and playable HTML exports.", "Scenes advanced → Background sequence → Transition duration", "scenes"),
 f("Resizable advanced inspector", "Clicking a GIF thumbnail widens its film editor. Drag the map’s right divider or use Panel width to choose the size; keyboard resizing and browser persistence are supported.", "Scenes advanced → Panel width or divider", "scenes")
 ]},
 {version:"2.15.0",commit:"ff24df9",name:"GIF backgrounds and visual background sequences",date:"2026-10-29",timestamp:"2026-10-29T08:46:00Z",features:[
 f("Animated background uploads", "Upload GIFs using the normal background picker or the dedicated Upload GIF background button. Animation bytes stay in project exports and the offline editor, with matched still fallbacks for the included café loops.", "Background → Upload GIF background", "background"),
 f("Visual scene background sequence", "Scenes advanced displays thumbnail cards for main and sub-scene backgrounds, GIF labels, transition arrows, editable styles and exact dialogue triggers. Add a still or GIF directly to a chosen dialogue.", "Scenes advanced → Select scene → Background sequence", "scenes"),
 f("Steady café animation and forward street", "Café loops reuse the fixed original painting with local blink and flame patches, then cue a matched cake-on-table loop. The departure looks down a wet street toward a distant Ferris wheel and ice-cream lights.", "Story → A table by the window or After the café", "scenes")
 ]},
  {version:"2.14.0",commit:"5fb7d63",name:"Character motion, chapter repair and wet streets",date:"2026-10-29",timestamp:"2026-10-29T07:54:25Z",features:[
    f("Chapters that create and retain their scenes", "Add chapter no longer navigates to an opening before it exists. Older First Match workspaces put the six morning openings into chapter two while retaining the farewell as chapter one’s ending.", "Chapters advanced → Add chapter", "chapters"),
    f("Masked character motion and saved snippets", "Hinges support gentle repeating head tilt, eye drift and short eyelid blinks alongside dialogue poses and activation ranges. Extract selected pixels into the Character snippets folder, move a patch by dragging and optionally cover its old position with an aligned clean plate.", "Cinematics → Add hinge region → Character motion", "effect:Cinematics"),
    f("Rain impact ripples and layered sound", "Reflective puddles on the approach and farewell have masked impact rings instead of pavement distortion. Original splash and heel-to-toe sounds layer with rain, and morning openings use a matching daylight bedroom with phone chat only on message dialogues.", "Motion → Rain impacts or Sound → Add background ambience", "effect:Motion")
  ]},
  { version: "2.13.0", commit:"78deec2", name: "Author’s playthrough and live editing", date: "2026-10-29",timestamp:"2026-10-29T06:48:45Z", features: [
    f("Edit while playing", "Author’s playthrough keeps dialogue, replies, notes, backgrounds and normal scene controls editable. The editor follows the actual dialogue and scene, and changes autosave with Undo available.", "Header → Author’s playthrough → Edit current dialogue", "author-play"),
    f("Safe live debugging", "Automatic dialogue steps and timed actions wait while you type. Route links and dialogue deletion stay locked during playback. Phone messages update when their current authored line is edited, without replaying choices.", "Author’s playthrough → Dialogue or scene controls", "author-play"),
    f("Phone buzz and mouse light placement", "The second bedroom dialogue plays an original double vibration. Local radial lights have a Move light with mouse button beside their X/Y coordinates; one scene click moves the selected light without changing its loop.", "Lighting → Local light → Move light with mouse", "effect:Lighting")
  ]},
  {version:"2.12.0",commit:"2962460",name:"Draggable comments and animated feed scenes",date:"2026-10-29",timestamp:"2026-10-29T04:46:16Z",features:[
    f("Compact comments with finger-like mouse gestures", "Comments use a short header and a single-line reply composer. Drag the sheet header up to the phone’s top or down to shrink it; drag the comments themselves to scroll. Likes, saved replies and story choices stay intact.", "Insta → Comments → Drag header or comment list", "devices"),
    f("Independent scene action and original sound", "The four 24-second feed clips add windblown leaves, puddle splashes, moving book pages, curling steam, an animated monitor and a passing city view. New original sound designs include a short piano composition for the reading clip.", "Phone Home → Insta → Play and unmute", "devices"),
    f("Reusable media archive", "Original paintings, earlier clips and exact soundtracks remain saved alongside new animation assets, audio stems, effects and music. Older embedded backups can opt into the new included video sources without replacing uploads or post settings.", "Advanced devices → Insta feed → Use updated included animations or GitHub media archive", "devices")
  ]},
  {version:"2.11.0",commit:"98e674b",name:"Mouse resizing and branching chapters",date:"2026-10-29",timestamp:"2026-10-29T03:46:26Z",features:[
    f("Resize edges and deliberate window dragging", "Resize dialogue vertically and effects horizontally by dragging their dividers. Floating panels resize at every edge. Only dragging the six-dot grip detaches a window; clicking the title or grip leaves it docked.", "Dialogue editor top edge → Drag up/down; Effects inner edge → Drag left/right", "windows"),
    f("Chapters with conditional starting scenes", "Group scenes into chapters, author ordered all/any state rules, preview the selected starting scene and choose chapter ending dialogues. The next chapter retains prior choices and resolves its opening once on entry.", "Chapters advanced → Select chapter → Conditional starting scenarios", "chapters"),
    f("Six editable chapter-two openings", "The Space Between Messages has short draft starts for warm, cautious, goodbye, deferred, declined and quiet routes. These extend the source bible’s continuity rules and stop at explicit draft endpoints. Existing artwork, phone apps and café effects are preserved.", "Story library → Story chapter → The Space Between Messages", "chapters")
  ]},
  {version:"2.10.0", commit:"3098c7e", name:"Insta video feed and local reactions", date:"2026-10-29",timestamp:"2026-10-29T03:12:32Z", features:[
    f("Four original illustrated videos", "Watch four distinct 24-second clips with atmospheric rain, lamplight, gentle camera motion and original ambient sound, matching the game’s painterly style and the protagonist’s quiet, dryly funny interests. Home, Ember, notifications and dialogue schedules are preserved.", "Phone Home → Insta → Scroll videos", "devices"),
    f("Working likes and fictional comments", "Toggle one heart per post, read varied authored reactions and leave a local reply. Player reactions stay saved in the browser without changing story choices. Videos pause while comments or the pause menu are open and when scrolled away.", "Insta → Heart or Comments → Post locally", "devices"),
    f("Dedicated Insta authoring and portable clips", "Upload more videos, edit accounts, captions and authored comments, reorder posts and set autoplay, replay and feed volume in the new Insta feed tab. Complete project and playable HTML exports include media bytes for use on another device.", "Advanced devices → Insta feed → Upload more feed videos", "devices")
  ]},
  {version:"2.9.0", commit:"e3c2989", name:"Phone controls made clear", date:"2026-10-29",timestamp:"2026-10-28T17:45:19Z", features:[
    f("Phone switches on every dialogue", "Show or hide the phone directly in the dialogue map, original editor or simple Phone panel. Keep story dialogue separate, or integrate it into Ember chat. Choose Home, Insta or Ember without opening Advanced devices. Overrides affect only the selected dialogue; reset returns to the existing schedule.", "Dialogue advanced → Select a box → Phone on this dialogue", "dialogues"),
    f("Shared contact portraits and app icons", "Phone appearance is shared by default: saved icons, wallpaper and contact portrait follow the device across scenes and survive project export. Disable sharing in Advanced devices for an independent scene. Existing scene artwork, outfits and effect settings remain intact.", "Advanced devices → Use shared phone appearance → Apps or Frame & placement", "devices"),
    f("Visible switches and independent settings bars", "On/off switches now have bounded tracks and explicit ON/OFF states. Effects and interactions form one labelled tool row, while scene and workspace settings form another. Selecting Phone highlights Phone without also highlighting Atmosphere.", "Editor → Effects & interactions → Phone", "effect:Phone"),
    f("Published docking and search update", "The previously unpublished v2.8 docking windows, direct effect links and main feature search are included with this release. The studio displays both its version number and release name.", "Studio header → Search features or Update history")
  ]},
  {version:"2.8.0", commit:"9371bc8", name:"Direct effect settings, docking windows and studio search", date:"2026-10-29",timestamp:"2026-10-28T17:27:04Z", features:[
    f("Active layers open their own settings", "Click an effect name in Active to open its settings, including named light, motion and hinge layers. The independent checkbox still toggles the layer; opening settings never enables or disables it.", "Editor → Active → Click an effect name", "active"),
    f("Floating panels, restore and snap docking", "Panel title bars have small Pop out and Move icons. Float, resize, restore or dock the library, controls, preview, dialogue and workspace panes. Drag near an edge to preview snapping; restore chooses another free dock if the old one is occupied. Separate effects and properties docks can float independently.", "Panel title bar → Pop out or Move → Drag to a highlighted edge; Windows & docking → Restore all window positions", "windows"),
    f("Movable dialogue editor", "Place dialogue above the scene, at an edge, in a floating window or in a separate split column. The same dialogue, notes, items, state and event log remain synchronized with the preview.", "Dialogue editor title bar → Move → Dock top, Floating window or Split beside workspace", "dialogue"),
    f("Main studio feature search", "Search features, settings, scene names, dialogue, artwork and current effects from the main header. Results open the correct workspace or setting and highlight the requested control. Search stays local and does not execute an effect toggle.", "Search features or Ctrl+K / Command+K → Type a feature → Select a result"),
    f("Specific help for new workspace tools", "Delayed hover descriptions explain pop-out, restore, docking, snap targets, shared workspace selectors, search results and dialogue artwork instead of repeating a generic description.", "Hover a new icon, button or selector for a moment → Read its description", "appearance")
  ]},
  {version:"2.7.0", commit:"38906b4", name:"Populated artwork folders and shared split workspaces", date:"2026-10-29",timestamp:"2026-10-28T16:23:07Z", features:[
    f("Recovered artwork library and GitHub image folders", "Older saved projects now import all image dependencies before adding new sub-scenes, fixing the Missing sub-scene background update failure. Restore artwork retries a focused merge with a recovery copy. Every published image and all available generation originals are also archived as ordinary files in GitHub folders.", "Editor → Restore artwork → Assets → Artwork folder; GitHub → artwork"),
    f("Shared side-by-side and stacked workspaces", "Split view opens two workspaces sharing one project and selected dialogue. Edit alongside scene or dialogue maps, device settings or update history. Choose the pair, swap sides and resize their divider; playback temporarily uses one game view.", "Studio workspaces → Split view → Choose Second workspace → Drag the divider"),
    f("Artwork selection directly from dialogue maps", "Select a dialogue box and choose its background image from populated artwork folders in the map details. Each dialogue can have its own temporary image without changing a shared view or the main scene background. The companion editor previews that same dialogue immediately.", "Dialogue advanced → Select a box → Image for this dialogue → Choose a folder and image", "dialogues")
  ]},
  {version:"2.6.0", commit:"84515e4", name:"Artwork folders, device return routes and player progress", date:"2026-10-29",timestamp:"2026-10-28T15:49:52Z", features:[
    f("Artwork folders and restored clothing", "Missing published images are added to compatible saved projects with a recovery copy. Choose backgrounds, clothing and profile artwork from named folders. The room window and wardrobe now open their matching sub-scenes, and outfit cards retain inspect-before-confirm.", "Editor → Assets → Artwork folder; or Outfits & Items → Inspect a saved outfit → Choose it", "wardrobe"),
    f("Dialogue-based device return controls", "Enable a put-away button for a dialogue range or an individual dialogue. Return to a selected point or the last choice menu; reopening the original route resumes your phone or computer dialogue without replaying its state actions. Existing phone apps are unchanged.", "Advanced devices → Timing → Put device away · return route", "devices"),
    f("Visible layout placement and toggleable tools", "Click the selected tool again to close its library panel. Move tools to the top or left, place controls on any dock, and adjust panel sizes and dialogue layout from the visible placement strip or Project settings.", "Editor → Tools placement or Controls placement → Layout & project settings", "workspace"),
    f("Fullscreen pause menu and route viewer", "Pause and fullscreen controls stay inside the game area, including fullscreen. The pause menu includes fullscreen and a read-only progress map showing visited dialogues, chosen replies and question marks for unexplored routes.", "Play story → Pause menu → View Current Progress")
  ]},
  {version:"2.5.0", commit:"d1bcec5", name:"Independent devices and rainy window views", date:"2026-10-28",timestamp:"2026-10-28T09:47:10Z", features:[f("Independent texting activation", "Ordinary story actions never become messages. Configure dialogue placement and texting start/end in Advanced devices. Monitor interaction opens the desktop separately; window and monitor close-ups have glass-specific rain.", "Advanced devices → Dialogue & replies → Dialogue placement or Texting start/end", "devices")]},
  {
    version: "2.4.0", commit: "bef5f98", name: "Sound, wardrobe and close-up storytelling", date: "2026-10-28",timestamp:"2026-10-28T09:21:25Z",
    features: [
      f("Restored clothing cards and visible chosen outfits", "The three saved clothing images can be inspected, worn and reconsidered. The chosen image stays visible with its result dialogue; missing links in compatible older projects are repaired with a recovery copy.", "Editor → Items & outfits → Open saved outfit selection; during playback inspect a card, choose it, or See the other outfits", "wardrobe"),
      f("Reusable sound library and master volume", "Original notification, rain, muffled room rain, wet footsteps, closet and coat sound designs are included. Assign ambience or dialogue/reply/item cues and upload additional audio. Walking is enabled in scenes five and seven; rain in one, four and seven.", "Editor → Effect panels → Sound → Add background ambience or assign a sound cue; Play story → Sound volume", "effect:Sound"),
      f("Feed-first phone opening and notification sound", "Checking the phone opens the scrolling Insta feed, followed by an animated Ember notification with a gentle chime. Opening a notification follows the authored reply route. Home, apps and the existing handset layout are retained.", "Play story → Another evening → Check the phone → Tap the notification or choose Open the app now", "devices"),
      f("App images and independent profile uploads", "Three original app icons are included. Ember and Insta each have an independent profile image, editable both in the phone Settings app and the studio’s Advanced devices workspace.", "Advanced devices → Apps → App profile pictures; or Phone Home → Settings → Upload Ember or Insta profile image", "devices"),
      f("Phone keyboard toggle", "Show or hide the decorative keyboard while chatting. Authors can choose its initial state; players can toggle it in chat or the phone Settings app.", "Advanced devices → Dialogue & replies → Show phone keyboard by default; Chat → Show keyboard or Hide keyboard", "devices"),
      f("Temporary sub-scenes and a monitor close-up", "A dialogue can use a temporary background view inside its existing scene. The monitor now has a matching desk illustration, and returning to the room fades back to the main image. Main-view masks are not applied to unrelated close-ups.", "Editor → Effect panels → Sub-scenes → Add sub-scene for this dialogue → Choose its image; choose Original scene on the returning dialogue", "effect:Sub-scenes"),
      f("Quick dialogue and reply boxes", "Every dialogue map box has + Dialogue and + Reply actions. Quick connected dialogue also lets you choose incoming and outgoing nodes. Inserting a Continue keeps its previous destination; adding a reply preserves existing routes.", "Dialogue advanced → Use + Dialogue or + Reply on a box; or Quick connected dialogue → Choose incoming/outgoing → Add connected dialogue", "dialogues"),
    ],
  },
  {
    version: "2.3.0",
    commit: "3c16fbf",
    name: "Phone navigation and missing story updates",
    date: "2026-10-28", timestamp:"2026-10-28T08:31:33Z",
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
    date: "2026-10-28", timestamp:"2026-10-28T04:36:30Z",
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
    date: "2026-10-28", timestamp:"2026-10-28T04:16:23Z",
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
    date: "2026-10-28", timestamp:"2026-10-28T03:45:25Z",
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
    date: "2026-10-28", timestamp:"2026-10-28T02:26:16Z",
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
    date: "2026-10-28", timestamp:"2026-10-27T13:48:43Z",
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
    date: "2026-10-27", timestamp:"2026-10-27T12:37:00Z",
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
    date: "2026-10-27", timestamp:"2026-10-27T08:52:54Z",
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
    date: "2026-10-27", timestamp:"2026-10-27T08:17:12Z",
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
    date: "2026-10-27", timestamp:"2026-10-27T08:14:05Z",
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
    date: "2026-10-27", timestamp:"2026-10-27T07:40:07Z",
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
    date: "2026-10-27", timestamp:"2026-10-26T14:00:58Z",
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
    date: "2026-10-27", timestamp:"2026-10-26T13:42:46Z",
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
    date: "2026-10-27", timestamp:"2026-10-26T13:26:14Z",
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
    date: "2026-10-27", timestamp:"2026-10-26T13:22:23Z",
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
    date: "2026-10-26", timestamp:"2026-10-26T12:31:25Z",
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
    date: "2026-10-26", timestamp:"2026-10-26T11:55:47Z",
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
    date: "2026-10-26", timestamp:"2026-10-26T11:24:22Z",
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
    date: "2026-10-26", timestamp:"2026-10-26T21:41:40+11:00",
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
    date: "2026-10-26", timestamp:"2026-10-26T19:45:23+11:00",
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
    date: "2026-10-26", timestamp:"2026-10-26T19:33:46+11:00",
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
    date: "2026-10-26", timestamp:"2026-10-26T07:29:57Z",
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
    date: "2026-10-26", timestamp:"2026-10-26T07:20:16Z",
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
    date: "2026-10-26", timestamp:"2026-10-26T04:01:13Z",
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
    date: "2026-10-26", timestamp:"2026-10-26T03:30:12Z",
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
