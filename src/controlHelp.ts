export function specificHelp(
  label: string,
  element: HTMLElement,
): string | undefined {
  const name = label.toLowerCase().replace(/ exact value$/, "");
  if (name.includes("after end dialogue"))
    return "Hide removes the moved layer after leaving its end dialogue. Hold keeps the final pose visible without further movement.";

  if (name.includes("phone interaction timing"))
    return "Simple timing uses one start and one end dialogue. Existing schedule keeps your older individual switches until you choose to replace them.";
  if (name.includes("start phone"))
    return "The device appears when this dialogue is reached. Earlier dialogue stays in the normal scene view.";
  if (name.includes("end phone"))
    return "This is the last dialogue with the device visible. It closes on the next dialogue along the path you play.";
  if (name.includes("advanced") && name.includes("override"))
    return "Let individual dialogues switch the displayed app within the start/end range. Leave this off for one uninterrupted interaction.";
  if (name.includes("device experience"))
    return "Messages only opens the conversation directly. Device with apps also lets the player visit Home, Insta and device Settings without advancing dialogue.";
  if (name.includes("separate controls"))
    return "Show Effects & interactions and Scene properties side by side, each with its own scroll area. Turn off to combine them in one dock.";
  if (name.includes("upload image for"))
    return "Import an image directly for this item card. It is embedded in your project export and never replaces the scene background.";
  if (
    name.includes("phone custom") ||
    name.includes("custom response in device")
  )
    return "Show Self-reply inside the device for this dialogue, independently of the normal scene dialogue setting. Typed text follows your authored next path.";
  if (name.includes("device background colour"))
    return "Change only the phone or computer interior. Choose Solid background under wallpaper to see the full colour.";
  if (name.includes("device font"))
    return "Typeface inside this device only. Story dialogue and the editor interface have separate font controls.";
  if (name.includes("device text size"))
    return "Size of text inside the device, in pixels. Editor and normal story dialogue fonts are separate.";
  if (name.includes("device text colour"))
    return "Text colour inside the device. Pick a colour with enough contrast against its wallpaper.";
  if (name.includes("device wallpaper"))
    return "Use an imported image behind the device apps. It never changes the scene background.";
  if (name.includes("scene exit transition"))
    return "Queue this effect when the story leaves this scene. It overrides the destination scene’s entrance; it does not play between dialogues in the same scene.";
  if (name.startsWith("enable "))
    return "Enable or temporarily disable this specific visual layer. Its coordinates, masks and timing remain saved for reuse.";
  if (name.includes("scenes advanced"))
    return "Open the whole-story scene map. Drag scene headings to arrange boxes, name route branches, and open a scene’s dialogue map. It uses your existing project.";
  if (name.includes("dialogue advanced"))
    return "Open the selected scene’s dialogue map. Connect replies, Continue and timed-action paths with lines. Moving a box changes its saved layout only.";
  if (name.includes("update history") || name.includes("engine version"))
    return "Browse versioned engine changes and directions to each feature’s current location. This is separate from the playthrough event log.";
  if (name === "fit all")
    return "Zoom and pan so all boxes in this map are visible. Use Focus selection to return to a readable view of one box.";
  if (name === "focus selection")
    return "Centre the selected scene or dialogue box and restore a readable zoom level. Story connections stay unchanged.";
  if (name.includes("find in flow map"))
    return "Find boxes by their scene title, speaker or dialogue text, then choose a result to centre it on the map.";
  if (
    name === "route name" ||
    name === "route label" ||
    name.includes("new branch route label")
  )
    return "An author-only name beside a map branch, such as Friendly route. It does not replace the reply text shown to the player.";
  if (name.includes("dock controls at top") || name === "dock top")
    return "Place the controls above the scene. Drag the bottom edge of that dock to choose its height. Left, right and floating docks remain available.";
  if (name.includes("add branch connection"))
    return "Add this reply and its destination to the selected dialogue. If it previously used Continue, that original route is kept as another reply.";
  if (name.includes("open original editor"))
    return "Return to the list-based editor for this selected scene and dialogue. Both editors share the same story and Undo history.";
  if (name.includes("auto arrange"))
    return "Space the boxes automatically using their existing connections. This saves graph coordinates and leaves dialogue order and story paths unchanged.";
  const rules: [RegExp, string][] = [
    [
      /add device ui|add phone system/,
      "Create a device panel for this scene. Phone system includes Home, chat and Insta; configure its per-dialogue screen schedule in the Phone tab.",
    ],
    [
      /device entrance/,
      "Choose how the phone or desktop panel first appears: instant, soft movement, slide upward or fade in. This is separate from scene transitions.",
    ],
    [
      /device shape/,
      "Phone uses a narrow handset frame; Desktop uses a wider computer-style panel with the same authored dialogue feed.",
    ],
    [
      /device portrait/,
      "Choose an imported contact portrait for the device header. No image generation or face replacement happens here.",
    ],
    [
      /device contact|contact name/,
      "Name shown in the chat header. It should match the speaker name on incoming dialogue lines.",
    ],
    [
      /remove item picker/,
      "Remove this scene’s clothing/book inspection overlay and its item mappings. Dialogue and choices remain. Undo restores the picker.",
    ],
    [
      /add item picker/,
      "Create an item inspection overlay for this scene. Add cards and connect each Choose button to an existing dialogue choice.",
    ],
    [
      /add item for current dialogue/,
      "Add one card to the selected dialogue’s choices. Give it a picture, description and confirmation path.",
    ],
    [
      /item name/,
      "The name displayed on this item card and its Choose button. This does not rename a scene or character.",
    ],
    [
      /description/,
      "Text shown when the player inspects this item, before confirming a choice.",
    ],
    [
      /png.*image/,
      "Choose imported artwork for this item card. Transparent PNGs sit over the blurred background without replacing the scene.",
    ],
    [
      /confirm follows choice/,
      "Select the authored choice that runs only when the player confirms this item. Its state changes and destination are preserved.",
    ],
    [
      /background blur/,
      "Blur only the scene behind the item cards. Zero keeps the background sharp; higher pixel values bring the item into focus.",
    ],
    [
      /overlay title/,
      "Heading shown above the item cards, for example Choose an outfit or Inspect a book.",
    ],
    [
      /remove item /,
      "Delete this card from the picker. Its underlying dialogue choice is not deleted.",
    ],
    [
      /see other options/,
      "Close this item’s description and return to the other cards. No choice is committed.",
    ],
    [
      /choose .*|inspect item/,
      "Inspecting opens a description. Choose confirms this item and follows its authored dialogue path.",
    ],
    [
      /restrict hinge/,
      "Activate this moved region only after its start dialogue is entered, through its end dialogue. This follows the actual branch played.",
    ],
    [
      /start.*dialogue/,
      "The dialogue that activates this hinge. Before it is reached, the moved layer is hidden. Save poses separately to define its movement.",
    ],
    [
      /end.*dialogue/,
      "The final dialogue where this hinge remains active. After leaving it, hide the layer or hold its last pose.",
    ],
    [
      /after end dialogue/,
      "Hide removes the moved layer after its end dialogue; Hold keeps its final pose visible. The original painting is not edited.",
    ],
    [
      /pose dialogue/,
      "Choose which dialogue owns the pose you are editing. Position, angle, scale and opacity are recalled when that dialogue is entered.",
    ],
    [
      /place hinge pivot/,
      "Click the artwork to choose the hinge’s rotation centre, such as a finger joint. This does not move the selected pixels yet.",
    ],
    [
      /pivotx/,
      "Horizontal rotation centre in the background’s 1000-unit coordinate system. It stays fixed while the selected patch rotates.",
    ],
    [
      /pivoty/,
      "Vertical rotation centre in the background’s 563-unit coordinate system. Use Place hinge pivot to set it with one click.",
    ],
    [
      /pose angle/,
      "Rotate the selected patch around its hinge pivot. Small angles suit fingers or cloth; large rotations can expose gaps.",
    ],
    [
      /pose scalex/,
      "Stretch or compress the selected patch horizontally. One preserves its width. This is a 2D transform, not a new expression drawing.",
    ],
    [
      /pose scaley/,
      "Stretch or compress the patch vertically. A small change can suggest an eyelid movement or cloth compression.",
    ],
    [
      /pose opacity/,
      "Visibility of this moved patch at the selected dialogue: zero hides it and one makes it fully visible.",
    ],
    [
      /pose x/,
      "Horizontal movement from the patch’s original position, in scene units. Positive moves right; negative moves left.",
    ],
    [
      /pose y/,
      "Vertical movement from the patch’s original position. Positive moves down; negative moves up.",
    ],
    [
      /save resting pose/,
      "Save zero movement, zero rotation, normal scale and full visibility for this dialogue as a reference pose.",
    ],
    [
      /expression.*image/,
      "Replace only the selected patch with aligned artwork for this dialogue, such as a different eyelid or smile.",
    ],
    [
      /cover original/,
      "Fill the original selected area with a flat matching colour before moving the patch. This is a simple cover, not reconstruction of hidden background.",
    ],
    [
      /source image/,
      "Use a separate imported foreground object instead of copying pixels from the background. Transparent artwork avoids leaving the original object behind.",
    ],
    [
      /remove this slide/,
      "Delete only this dialogue’s hinge pose. Other saved poses and the selected region remain.",
    ],
    [
      /remove hinge/,
      "Delete this articulated layer, its mask, pivot and poses. The original background remains; Undo restores the layer.",
    ],
    [
      /device experience/,
      "Original chat UI keeps the previous messaging panel. Phone system adds the Home screen and a fictional scrolling Insta app.",
    ],
    [
      /screen for current dialogue|screen at dialogue/,
      "Choose the phone screen when this dialogue is entered. Inherit keeps the last authored screen along the path played; Off shows normal scene dialogue.",
    ],
    [
      /default phone screen/,
      "Initial screen when no dialogue-specific switch has been reached: Home, Insta feed or chat.",
    ],
    [
      /notification.*dialogue|phone notification text/,
      "Show this notification above the current phone app. Opening it follows an available authored Open choice when present.",
    ],
    [
      /device enabled|remove device/,
      "Enable or remove the device configuration for this scene. Dialogue-level screen scheduling is available in the Phone tab.",
    ],
    [
      /device x/,
      "Horizontal phone/desktop position as a percentage of the scene width. Fifty is the middle.",
    ],
    [
      /device y/,
      "Vertical phone/desktop position as a percentage of scene height. Fifty centres it vertically.",
    ],
    [
      /device width/,
      "Scale the device while keeping the phone’s narrow proportions. It is capped to fit within the scene.",
    ],
    [
      /typingseconds/,
      "Delay before an authored contact message appears. Typing dots are presentation, not a live AI request.",
    ],
    [
      /keyboard/,
      "Show a decorative keyboard below authored chat choices. Use Self-reply for actual text entry.",
    ],
    [
      /advance story/,
      "Choose Continue-only, Enter, or a click on the scene. Choices and timed interactions always require their own controls; typing never advances the story.",
    ],
    [
      /light to save/,
      "Choose one existing local light whose colour, radius, intensity and cycle you want to store as a favourite.",
    ],
    [
      /light favourite name/,
      "Name this individual lamp preset so you can recognise it on other scenes, for example Candle 0.5–1–0.5.",
    ],
    [
      /save individual light/,
      "Save just the selected lamp’s settings and timing in the project. Use it later at new positions without rebuilding its cycle.",
    ],
    [
      /placement preset/,
      "Choose a saved individual lamp or the default gentle cycle. Placement copies settings at each click, without copying an old mask.",
    ],
    [
      /place lights on scene/,
      "Arm click placement. Each click on the artwork creates a local light at that position; repeat to place more, then Stop placing.",
    ],
    [
      /stop placing lights/,
      "Leave light placement mode so clicks on the artwork stop creating lamps. Existing lamps remain editable.",
    ],
    [
      /delete favourite/,
      "Remove this saved lamp from the library. Lights already placed from it remain in their scenes.",
    ],
    [
      /preset category/,
      "Rain stores weather parameters and regions; lighting stores illumination and cycles; motion stores sway regions; all stores the complete effects setup.",
    ],
    [
      /preset name/,
      "Name a reusable effect setup. Presets are saved in your project and exported with it.",
    ],
    [
      /save effect preset/,
      "Store the current scene’s selected effect category. It can later replace that category in another scene, with Undo support.",
    ],
    [
      /apply /,
      "Copy this saved preset to the current scene. Whole-category presets replace that category; check mask placement against the new artwork.",
    ],
    [
      /delete preset/,
      "Remove this saved effect setup from the project. Scenes already using its settings are unchanged.",
    ],
    [
      /interface font size/,
      "Size of editor controls and labels in pixels. This browser preference does not resize the story’s dialogue.",
    ],
    [
      /interface font/,
      "Choose the editor’s font. This is separate from the font used in exported story dialogue.",
    ],
    [
      /dialogue font size/,
      "Size of story dialogue text in pixels, saved in the project and included in exported players.",
    ],
    [
      /dialogue font/,
      "Choose the story dialogue typeface. This changes story text, not the editor’s control font.",
    ],
    [
      /name colour/,
      "Colour used for this character’s name above spoken dialogue, helping distinguish multiple speakers.",
    ],
    [
      /dialogue author note/,
      "Private planning note for this dialogue. Saved and exported with the project, but never displayed in the player.",
    ],
    [
      /delete dialogue node/,
      "Remove this dialogue and repair incoming links where possible. The scene must retain one node. Undo restores deleted content.",
    ],
    [
      /next dialogue/,
      "Choose the numbered line to play after Continue. Empty ends the path. Choice nodes use their own numbered destinations instead.",
    ],
    [
      /outfits & items/,
      "Open clothing, books and other inspectable item cards. This is where the wardrobe picker is authored, not in Camera.",
    ],
    [
      /effect presets/,
      "Open reusable whole-category rain, lighting and motion setups. Individual lamp favourites are in Light Library.",
    ],
    [
      /light library/,
      "Open individual light favourites and click-to-place lighting. Save a selected lamp’s loop once, then stamp it on other scenes.",
    ],
    [
      /^phone$/,
      "Open phone mode and the per-dialogue screen schedule: Off, Home, Insta or chat.",
    ],
  ];
  const result = rules.find(([pattern]) => pattern.test(name))?.[1];
  if (result)
    return / exact value$/.test(label.toLowerCase())
      ? "Enter an exact numeric value. " + result
      : result;
  if (/distortion/i.test(name))
    return "Amount of small ripple distortion inside this motion region. Zero leaves a rigid sway; large values can make cloth or foliage look watery.";
  if (/strength/i.test(name))
    return "Maximum motion displacement in scene units for this selected region. Small values suit gentle cloth or leaf movement.";
  if (/direction/i.test(name))
    return "Direction of this region’s sway in degrees. It changes the motion axis, not the object’s pose angle.";
  if (/seconds$/.test(name) && !/transition/.test(name))
    return "Period of this repeating motion cycle in seconds. Larger values make the movement slower.";
  const context =
    element.closest("section")?.querySelector("h3")?.textContent || "";
  if (/radius/i.test(name))
    return "Size of this local light’s soft footprint in scene units. It is independent of brightness; selected-area-only lights use their mask instead.";
  if (/intensity sequence/i.test(name))
    return "Comma-separated brightness multipliers for this light’s loop. For example 0.5, 1, 0.5 gives a gentle dim–bright–dim cycle.";
  if (/seconds per step/i.test(name))
    return "Duration of each transition between adjacent light-loop values. One second and three values creates a three-second repeating cycle.";
  if (/loop lighting/i.test(name))
    return "Repeat this light’s authored intensity sequence with smooth interpolation. Disable it for constant illumination.";
  if (/tint strength/i.test(name))
    return "Amount of the ambient colour wash mixed over the scene. Zero removes the wash without changing the image.";
  if (/ambient tint/i.test(name))
    return "Colour of the ambient wash over the scene; its separate strength control determines how visible it is.";
  if (/brightness/i.test(name))
    return "Multiply the scene’s base brightness. One keeps the painted exposure; this is separate from local lamps.";
  if (/contrast/i.test(name))
    return "Increase or reduce the difference between light and dark painted areas. One keeps the original contrast.";
  if (/density/i.test(name))
    return "Number of procedural raindrops. This changes rainfall amount, not speed or opacity.";
  if (/rain.*speed|^speed$/i.test(name))
    return "How fast procedural rain travels through the selected regions. Zero pauses the drops.";
  if (/angle/i.test(name) && /rain/i.test(context))
    return "Slant of falling rain. Negative values lean left; positive values lean right.";
  return undefined;
}
