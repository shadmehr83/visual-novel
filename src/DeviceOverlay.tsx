import { useState, type ComponentProps } from "react";
import { PhoneUI } from "./PhoneUI";
import { canPutAway, returnDestination } from "./deviceReturn";
/** Adds an author-controlled leave/reopen action without changing the device's apps. */
export function DeviceOverlay(props: ComponentProps<typeof PhoneUI> & { onPutAway?: () => void }) {
  const { scene, node, runtime } = props;
  const [stowedAt, setStowedAt] = useState("");
  const stowed = stowedAt === scene.id + ":" + node.id;
  const allowed = canPutAway(scene, node, runtime?.nodeVisits?.filter(v => v.scene === scene.id).map(v => v.node));
  const desktop = (node.deviceKind || scene.phone?.device) === "desktop";
  return <>
    <div style={stowed ? {display: "none"} : {display: "contents"}}><PhoneUI {...props} /></div>
    {allowed && !node.qte && !runtime?.ended && <button className="put-device-away" data-no-advance
      data-help={stowed ? "Reopen the device at the same dialogue. Your messages and choices are kept." : "Put this device away and return to the authored destination or the last choice menu. Reopening resumes the same dialogue. With no return destination, the device is temporarily hidden and can be reopened."}
      onClick={() => {
        if (stowed) setStowedAt("");
        else if (runtime && returnDestination(scene, node, runtime) && props.onPutAway) props.onPutAway();
        else setStowedAt(scene.id + ":" + node.id);
      }}>
      {stowed ? (desktop ? "Return to computer" : "Pick phone back up") : (desktop ? "Step back from computer" : "Put phone away")}
    </button>}
  </>;
}
