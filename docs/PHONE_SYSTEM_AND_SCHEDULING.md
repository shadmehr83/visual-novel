# Phone system, scheduling and simpler navigation

Current device controls are in the **Advanced devices** workspace. The original outfit picker is in **Items & outfits** beside Dialogue. See [the 2.2 guide](DEVICES_AND_PREVIEW.md) for current locations and preview resizing.

For the current simpler start/end schedule, device Settings, split docks and pause controls, see [Device simplification](DEVICE_SIMPLIFICATION.md). The individual-dialogue schedule below is now advanced.

## Where each tool lives

- **Outfits & Items**: wardrobe/book cards, descriptions, PNG selection, confirmation paths and background blur. This is the existing outfit picker, now explicitly named.
- **Phone**: create the phone system, choose original chat-only or full phone mode, and schedule Off/Home/Insta/Chat on individual dialogues.
- **Cinematics**: hinge selections, pivots, saved poses and their optional start/end dialogue range; Device placement and appearance controls now live in Phone.
- **Light Library**: save one local lamp as a favourite, including its colour, radius and loop. Select a favourite and click the artwork to place copies.
- **Effect Presets**: reusable complete rain, lighting, motion or all-effect categories. This is the previous Presets tab with a clearer name.

## Hinge start and end

Enable **Restrict hinge to a dialogue range** on a hinge. Pick its start and end dialogues. The layer appears when its start is actually reached, remains active through the end dialogue, then either hides or holds its last pose according to **After end dialogue**. Poses still define the individual movements; a range does not itself invent an animation. Author preview uses the dialogue list; playback follows the recorded actual path. Range visits survive runtime saving. Deleting a range endpoint removes the restriction to avoid broken references.

## Phone screens inside one scene

The original chat UI remains selectable. **Phone system** adds a home screen, working Ember and Insta app buttons, a functional back/home button and an offline fictional scrolling feed. Camera/weather icons are decorative; the feed cards are styled local mock posts, not real videos or a connection to a social network.

For each dialogue, select **Off**, **Home**, **Feed**, **Chat** or **Inherit**. A switch takes effect when the chosen dialogue is entered; to switch after a line, schedule its following dialogue. Inherit follows the last authored screen on the branch actually played. Off hides the phone and shows normal dialogue. This changes the interface without replacing the scene background. Existing phone position and entrance controls remain in Cinematics.

Home/app navigation is local exploration and does not itself progress the story. The story actions stay accessible under the app. A notification can follow an authored Open choice, or open chat if there is no such choice. Actual authored messages remain separate from browsing. No invented messages are sent to Maria.

The demo opening now keeps the bedroom visible initially, raises the phone for the notification, and uses Insta at **Keep scrolling for a while**. The later notification offers opening the message or leaving it for today. The messages and invitation continue with the same phone system and saved transcript. The café artwork and effect settings are unchanged.

## Reusable individual lights

The Light Library default is exactly **0.5 → 1 → 0.5, one second per step**. Place a default light, adjust it with the existing lighting controls, then choose it under **Light to save**, name it and save a favourite. Choose that favourite in **Placement preset** and arm **Place lights on scene**. Each artwork click creates one independent light at that point; repeat for several lights, then stop placing. Each stamp supports Undo. Placement uses scene coordinates, pauses camera framing while armed, and does not copy an old affected-area mask to unrelated artwork. Favourites are included in project exports and published checkpoints.

## Story progression

The playback header has **Advance story** with Continue-only, Enter and Click-the-scene modes. Continue buttons remain usable in every mode. The shortcuts do not select choices, resolve QTEs, submit typed text, or activate while an authored message is still typing. Inputs, buttons, links and phone home/feed interactions keep their own behaviour. The selected mode is stored in project settings and included in the standalone player; a standalone player's changed mode lasts for that session.

## Hover help

The tooltip lookup now has dedicated explanations for item operations, phone scheduling, hinge pose/range fields, individual-light favourites, preset categories, typography and most core effect controls. Exact numeric fields reuse the corresponding setting explanation. Author notes and tooltip text are not instructions to the AI or new story facts.
