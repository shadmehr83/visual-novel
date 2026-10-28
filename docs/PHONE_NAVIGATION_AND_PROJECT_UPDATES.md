# Stillframe 2.3 — phone navigation and the missing departure

## The scene after the café

The published project contains **After the café**, with its downward-looking rainy pavement background, departure dialogue, second-meeting branches and Maria’s phone follow-up. Earlier studio versions kept a browser’s older local project when the engine updated, so that browser could still show six scenes even after the new scene was committed to GitHub.

Compatible older First Match projects now receive a focused update on normal reload. It adds the missing scene/background, moves standard café departure dialogue into that scene, preserves edited farewell text and keeps café backgrounds/effects, other scenes and user assets unchanged. Edited extra farewell nodes are retained when they can move safely. Custom loops back into café topics are kept in place with an additional outside route. Existing departure scenes are never overwritten.

The previous workspace is saved atomically under a recovery key before the updated project becomes current. **Restore previous local project** offers the latest recovery copy. A playthrough saved midway through the old departure resumes at that same dialogue in the new scene, with its narrative state/history preserved and the phone range activated.

Other novels are not automatically modified. A copied project with a `cafe` scene can explicitly choose **Add missing café departure** in the Editor banner. The update adds missing required assets/state defaults and validates the entire result before saving. If it cannot integrate safely, the current project remains usable and the update error is shown.

## Home and back

The header’s **Back to phone home** arrow and a labelled **Home** button remain available in every mode, including older chat-first configurations and computer frames. App navigation sits outside the content scroll area, so scrolling a conversation or Insta cannot scroll it away.

The two device experience settings choose the initial screen; they no longer remove Home or the app system. Home, Ember, Insta and Settings can be opened without choosing a story reply or resetting conversation history.

## One app area on the phone

**Home**, **Insta** and **Settings** show their own app content. They do not render the conversation text, reply composer or keyboard underneath. Open **Ember** to see dialogue and texting options again. This also applies to the Advanced devices authoring preview, including old chat-first configurations.

When an opening dialogue explicitly calls for Home/feed and offers narrative actions (for example Open the app, Keep scrolling or Continue story), those controls are displayed separately outside the handset. Actual chat replies stay within Ember. Enter/screen advance does not silently progress an authored chat while the player is browsing another app.

All prior advanced device settings, outfit cards, self-reply in chat, scene/dialogue maps, frame sizing and lockable preview controls are retained. Project format remains schema version 1.
