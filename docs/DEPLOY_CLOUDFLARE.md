# Publish Stillframe on Cloudflare Pages

Core editing and authored playback require no API keys. The optional AI helper requires the Cloudflare worker and secrets described in AI_SETUP.md. No Cloudflare account is connected to the development session, so publication must be completed in your account.

## Fastest: Direct Upload

1. Download `stillframe-cloudflare.zip` provided with this delivery. It contains the production files with `index.html` at the archive root.
2. Sign in to your Cloudflare dashboard. In **Workers & Pages**, create a **Pages** project and choose **Direct Upload** / drag-and-drop deployment.
3. Choose a project name such as `my-visual-novel-studio`, upload the ZIP (or its extracted contents), and deploy.
4. Cloudflare supplies the HTTPS `*.pages.dev` address. Open it to use the editor online. If the project name is taken, choose another; this document does not reserve a URL.

Keep the downloaded project JSON backups. Your public address hosts the editor; projects stay private in the browser you use. Opening that address on another device will not automatically sync work. Use Export/Open to move your project. Anyone who knows the address can load their own separate local editor; there is no login or shared cloud database.

## Future deployments from Git

If you prefer automatic deployment, connect the GitHub repository and branch containing this app using Cloudflare Pages Git integration:

- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `24`
- Environment/API secrets: none

Cloudflare Direct Upload projects and Git-integrated projects have different setup modes; choose the Git mode for a new project if automatic deployments are required.

To create a fresh manual package, run `npm ci`, `npm run build`, then ZIP the **contents** of `dist` (not the enclosing folder). Deploy at the domain root. The generated `sw.js` enables offline reload after its first successful installation. The `_headers` file prevents stale service-worker script caching and adds basic response headers.
