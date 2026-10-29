import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Project } from "./model";

export function ImagePreview({ asset, onClose }: { asset?: Project["assets"][number]; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  if (!asset) return null;
  return createPortal(<dialog ref={dialog} className="image-preview-dialog" aria-label="Artwork preview" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <header><div><strong>{asset.name}</strong><small>{asset.width} × {asset.height} pixels · Original artwork</small></div><button autoFocus onClick={onClose} data-help="Close the enlarged image and return to editing. Escape also closes this preview.">Close preview</button></header>
    <img src={asset.data} alt={asset.name} decoding="async" />
  </dialog>, document.body);
}
