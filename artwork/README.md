# Stillframe artwork library

These are ordinary image files extracted byte-for-byte from the published project. Open any folder and click an image to view or download it from any computer. The studio embeds these same images in project exports. `manifest.json` records image IDs, folders, dimensions, file sizes and SHA-256 checksums.

## Background scenes (7)

- [Rainy Café Conversation.png](background-scenes/2021e333-3387-4b6e-ad86-281b140a8cca.png)
- [The First Match — bedroom environment.png](background-scenes/first-match-bedroom.png)
- [The First Match — wardrobe environment.png](background-scenes/first-match-wardrobe.png)
- [The First Match — journey environment.png](background-scenes/first-match-journey.png)
- [After the café · rainy pavement.webp](background-scenes/first-match-departure.webp)
- [Bedroom · monitor close-up](background-scenes/first-match-monitor.webp)
- [At the window · rainy city](background-scenes/first-match-window.webp)

## Outfits & items (3)

- [comfortable outfit item.png](outfits-and-items/outfit-comfortable.png)
- [smart outfit item.png](outfits-and-items/outfit-smart.png)
- [familiar outfit item.png](outfits-and-items/outfit-familiar.png)

## Profiles & app icons (4)

- [Maria · rainlit profile.png](profiles-and-app-icons/maria-device-profile.png)
- [chat app icon](profiles-and-app-icons/studio-icon-chat.webp)
- [feed app icon](profiles-and-app-icons/studio-icon-feed.webp)
- [settings app icon](profiles-and-app-icons/studio-icon-settings.webp)

## Generated originals and earlier artwork

[Generated originals](generated-originals/) contains every original image-generation output available from this project, including earlier alternatives and the full-resolution PNG originals for images distributed as WebP in the engine. `generated-originals/manifest.json` records their checksums. They are archived without changing image bytes. Earlier user-supplied reference images remain under [`references/incoming`](../references/incoming/). Unused originals are archived in GitHub without increasing the engine download.

To refresh the current-art export after updating the committed project, run `node scripts/archive-artwork.mjs`. This does not change the project or its scene settings.
