import { ImagePreview } from "./ImagePreview";
import { useState } from "react";
import type { Project } from "./model";
type Asset = Project["assets"][number];
export const ART_FOLDERS = ["Background scenes", "Outfits & items", "Profiles & app icons", "Character snippets", "Clean plates", "Other artwork"];
export function assetFolder(a: Asset) {
  if (a.folder) return a.folder;
  if (/^outfit-|outfit item/i.test(a.id + " " + a.name)) return "Outfits & items";
  if (/profile|portrait|studio-icon-|app icon/i.test(a.id + " " + a.name)) return "Profiles & app icons";
  if (/first-match-|environment|café conversation|background/i.test(a.id + " " + a.name)) return "Background scenes";
  return "Other artwork";
}
export function artworkFolders(assets: Asset[]) {
  const populated = new Set(assets.map(assetFolder));
  return [...ART_FOLDERS.filter(f => populated.has(f)), ...[...populated].filter(f => !ART_FOLDERS.includes(f)).sort()];
}
export function AssetPicker({ project, value, onChange, label, empty = "No image", initialFolder = "" }: {
  project: Project; value?: string | null; onChange: (id: string | null) => void; label: string; empty?: string; initialFolder?: string;
}) {
  const [preview, setPreview] = useState(false);
  const [folder, setFolder] = useState(initialFolder);
  const selected = project.assets.find(a => a.id === value);
  // A current selection is always available, even if its folder differs from the filter.
  const assets = project.assets.filter(a => !folder || assetFolder(a) === folder || a.id === value);
  return <div className="artwork-picker">
    <label>{label} folder<select aria-label={label + " folder"} value={folder} onChange={e => setFolder(e.target.value)} data-help="Filter the saved artwork by folder. Changing this filter does not replace the currently selected image.">
      <option value="">All folders ({project.assets.length})</option>{artworkFolders(project.assets).map(f => <option key={f} value={f}>{f} ({project.assets.filter(a => assetFolder(a) === f).length})</option>)}
    </select></label>
    <p className="artwork-count">{project.assets.filter(a => !folder || assetFolder(a) === folder).length} saved images{folder ? " in " + folder : " available"}</p>
    {folder && !project.assets.some(a => assetFolder(a) === folder) && <p className="small muted">No images in this folder yet. Choose All folders, import artwork, or use Restore artwork above the workspace.</p>}
    <label>{label}<select aria-label={label} value={value || ""} onChange={e => onChange(e.target.value || null)}>
      <option value="">{empty}</option>{artworkFolders(assets).map(f => <optgroup label={f} key={f}>{assets.filter(a => assetFolder(a) === f).map(a => <option value={a.id} key={a.id}>{a.name}</option>)}</optgroup>)}
    </select></label>
    {selected && <><button type="button" className="artwork-expand" aria-label={"Expand " + selected.name} data-help="Open a larger view of the selected artwork. Press Escape or Close preview to return." onClick={() => setPreview(true)}><img className="artwork-selection" src={selected.data} alt={selected.name} loading="lazy" decoding="async" /><span>Expand image</span></button>{preview && <ImagePreview asset={selected} onClose={() => setPreview(false)} />}</>}
  </div>;
}
