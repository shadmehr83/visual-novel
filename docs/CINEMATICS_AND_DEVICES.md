# Hinge poses, foreground objects, device UI and fullscreen

Open the latest published project with `https://visual-novel-8b9.pages.dev/?snapshot=github` after deployment. Existing local work receives a recovery copy. The new controls are under **Atmosphere → Cinematics**. New settings live in the complete project JSON and travel with save/export/publish and standalone players.

## Small articulated movements

1. Select the scene, then **Add hinge region**. Draw around a finger, eyelid, fabric fold or other small area.
2. Use **Edit hinge selection** to refine it. The shared toolbar supports polygon, colour wand, edge selection, circular brush, eraser and locked outer boundaries, just as for rain/light/motion.
3. Choose **Place hinge pivot** and click where the joint rotates. A gold cross marks the hinge. Pivot coordinates can also be adjusted with sliders.
4. Select the first dialogue slide under **Pose dialogue**, then **Save resting pose for this slide**.
5. Select the next desired slide and change x/y offsets, angle, horizontal/vertical scale and opacity. This creates the slide's pose. Selecting it previews the movement. During playback, entered slides animate to their saved poses; slides without a pose keep the last destination. Branches use their actual entered node, not a timer guessing which slide comes next.
6. Choose snappy/cut, smooth, slide or fade and a duration. Smooth uses eased interpolation; slide uses an easing curve with independent movement offsets; fade hides the old pose, swaps at the midpoint and reveals the new one.

These are **masked 2D transforms**, not skeletal skinning, anatomical reconstruction or automatic new facial expressions. They suit subtle movements. For an eye/face expression, import a scene-aligned replacement image and select it under **Expression replacement image** for that pose. Only the selected region is replaced. Scale can suggest a blink; a new smile needs authored artwork.

Moving pixels copied from a flat painting does not reveal what was behind them. Use a transparent foreground asset over a clean background for clean movement. **Cover original pixels** fills the source region with a chosen colour as a simple alternative; it is not AI inpainting. A badly matched cover or large rotation can expose seams. The underlying image files are not edited.

## Foreground motion without moving the background

Choose **Add foreground object**, select an imported source image, and give it poses on different slides. Transparent PNGs work well. Source objects preserve their aspect ratio and can be scaled, translated, rotated, faded or slid upward while the scene's background remains fixed. The source region clips the object and moves with it; a full-frame region is initially supplied. Existing sprite keyframe animation remains available separately.

## Scene transitions

**Scene entrance** controls the incoming scene: cut/snappy, smooth blend, horizontal slide, or fade out to darkness and back in. Duration is adjustable. Leaving-scene controls are inert during the transition, and leaving-scene QTE/audio components are not restarted. Reduced motion/effects skips transition animation. These controls do not change a background image or its lighting settings.

## Reusable phone / desktop conversation

**Add device UI** provides a rendered phone, contact header, message feed, typing dots, reply options and optional keyboard. **Device shape** also supports a desktop-shaped panel for later reuse. Position, width, contact, portrait, typing delay and entrance style are configurable. No screenshot is required per message.

The demo's Messages and Invitation scenes share the new bedroom painting. The phone slides up for the first conversation and stays visually in place for the invitation. The feed uses the entered authored dialogue, actual chosen replies and self-replies; it scrolls as messages arrive. Typing dots briefly precede contact messages, and a decorative keyboard rises beneath reply options. The keyboard is a visual presentation, not a second input method; **Self-reply** opens the real text input. Options that merely navigate, rather than send a chat message, use the choice flag `sendAsMessage: false`.

Transcripts are part of local runtime saves. They record actual events instead of rendering unchosen branches or guessing which messages were sent. Typing animation does not contact an AI provider or a real person. Self-replies are recorded and advance along the authored path; automatic NPC improvisation has not been added. The existing provider/voice authoring assistant can propose validated hinge, transition and device edits for review, in addition to its previous operations. It still requires the existing server AI configuration; this release does not configure credentials.

The contact is now **Maria**. No new face portrait was generated from the mood-board characters. The phone uses an initial until the author selects a portrait. If a portrait is created later, use the woman in **Rainy Café Conversation.png** as the character reference.

## Playback controls

During non-choice dialogue, **Self-reply** expands a small input instead of keeping a form under every line. It can still be disabled per node by the author. The published script enables it again. It does not bypass authored choices or QTEs.

**Fullscreen** enlarges the playback area and removes the surrounding workspace from view. **Exit fullscreen** or Escape restores the editor. Browsers without native fullscreen receive a presentation view. Standalone exported players include these controls too. The scene picker in the studio's playtest can jump to a scene for preview; the standalone player follows the authored route.

## Artwork and the protected café

The bedroom, wardrobe and journey backgrounds were regenerated using the supplied mood board and the uploaded café painting as style references. They use the same charcoal, dusty mauve, blue-grey and amber painterly language. Messages reuse the bedroom instead of a phone screenshot. Three updated environments plus the untouched café PNG are embedded in complete exports.

No procedural window rain or window distortion was placed over the new paintings: rain is already painted into them and an approximate mask could overlap objects. The bedroom gets a restrained existing-engine camera approach (no bob); the street gets a small existing-engine walking approach. Neither has automatic footsteps enabled. The final café's original image, framing, masks, lights, cycles, motion settings and camera fields are unchanged; only the requested Maria name and restored self-reply availability affect its script.

The later authoring update adds exact numeric slider inputs, branching self-replies, effect presets, notes/deletion, story typography and item overlays. It also places subtle environmental effects on the newer backgrounds. See [authoring refinements](AUTHORING_REFINEMENTS.md); that update supersedes the earlier notes about disabled procedural window rain and self-replies being restricted to non-choice dialogue.
