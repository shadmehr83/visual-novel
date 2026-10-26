# Authored projects — separate from engine code

`published.stillframe.json` is the complete published authoring project. It contains the imported original image/audio bytes, scene settings, masks/zones, lights/cycles, sprites, and dialogue. The engine loads this JSON on a fresh device, or through **Load GitHub snapshot**. Engine source stays in `src/`; updating this project file does not require editing engine code.

## Save your work

1. In the studio, press the header **Save project file** icon. Choose **Save complete project file**. On supporting Chrome/Edge browsers this opens a file picker and subsequent saves update the same file. **Save project file as…** lets you choose another location. Other browsers request a JSON download instead.
2. Keep the file named **published.stillframe.json**. It includes the artwork, not just effect settings. An exported image or player HTML is not the editable project backup.
3. Open this `projects/` folder on GitHub, choose **Add file → Upload files**, upload your `published.stillframe.json` replacing the existing file, and commit to `main`. Do not upload secrets.
4. Wait for the Cloudflare deployment to succeed. On the other device use the studio's **Load GitHub snapshot** button or the explicit `?snapshot=github` link. Existing local work gets a recovery copy.

Browser autosave is local to the device. Saving a file does not upload it to GitHub; committing or using the configured publishing button does. Later edits on a new device still need another file save/publish. Automatic merge or continuous cloud synchronization is not implemented.

## Optional one-button GitHub publishing

The editor's **Save & move your project → Publish directly to GitHub** panel can publish this one file through the Cloudflare server.

Configure these server secrets, then redeploy:
- `GITHUB_PROJECT_TOKEN`: a fine-grained GitHub token restricted to `shadmehr83/visual-novel`, with repository **Contents: Read and write** permission. Server-side only; never enter it into the editor or commit it.
- `STUDIO_ACCESS_TOKEN`: the existing studio password, entered by the owner into **Studio publish password** in the editor.

POST `/api/project` requires that password and the same-origin browser request. It validates the project and writes only `projects/published.stillframe.json` on `main`, using the file's SHA to detect concurrent changes. It cannot choose an arbitrary repository or edit engine files. Direct publishing is limited to 20 MB; save/download the project file for larger exports. A successful commit triggers the connected Cloudflare build; it does not itself prove deployment success. Original artwork/audio becomes part of the repository and follows its visibility. No live GitHub write was performed by automated tests; mocked tests check the fixed path, authentication, encoding and response handling.

Other project JSON backups can be kept in this folder using distinct filenames. Only `published.stillframe.json` is loaded by the engine. Use **Open project** for other backups. Source history keeps older committed versions available.

## Latest uploaded checkpoint

On 27 October 2026, `published.stillframe_4.json` was saved here as `published.stillframe.json` without changing its contents. It includes four scenes, the embedded 1536 × 1024 café PNG, two café rain zones, two café lights, café motion settings, and bedroom lighting/motion/camera settings. Empty motion selections are preserved as authored; they require an affected area before they visibly move anything.

After deployment, open **https://visual-novel-8b9.pages.dev/?snapshot=github** to explicitly load this published checkpoint on any computer. Existing different local work receives a recovery copy. Opening the normal website preserves that browser's autosaved project instead. The engine is maintained in this same repository; the checkpoint file stores the editable project and its embedded assets. Later changes require another export/publish to update the checkpoint.
