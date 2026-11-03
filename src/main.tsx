import { RecoveryBoundary } from "./RecoveryBoundary";
import { createRoot } from "react-dom/client";
import App from "./App";
import { STILLFRAME3 } from "./v3/ui";
import "./style.css";
import "./advanced.css";
import "./devices.css";
import "./insta.css";
import "./docking.css";
import "./v3/stillframe3.css";
import "./v3/stillframe31.css";
createRoot(document.getElementById("root")!).render(
  <RecoveryBoundary>
    <App />
  </RecoveryBoundary>,
);
// Stillframe 3 runs from a local build that changes often, so it never registers the offline cache.
if (import.meta.env.PROD && !STILLFRAME3 && "serviceWorker" in navigator)
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* Editing remains available without offline reload support. */
    });
  });
