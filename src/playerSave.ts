import { z } from "zod";
import type { Project, Runtime } from "./model";
import { dialogueKey, type ExportScope } from "./exportScope";
const value = z.union([z.string(), z.number().finite(), z.boolean()]);
const position = { scene: z.string(), node: z.string() };
const runtimeSchema = z.object({
  ...position, values: z.record(value), visited: z.array(z.string()), history: z.array(z.string()),
  choices: z.array(z.string()), ended: z.boolean(), completedChapters: z.array(z.string()).optional(),
  nodeVisits: z.array(z.object(position)).optional(),
  phoneMessages: z.array(z.object({...position, sender:z.string(), text:z.string()})).optional(),
  responses: z.array(z.object({...position, text:z.string()})).optional(),
  memories: z.array(z.object({...position, choice:z.string(), knowledge:z.record(value)})).optional(),
  deviceBookmark: z.object({...position, entry:z.string(), path:z.array(z.string())}).optional(),
});
/** Ignore media bytes when generating a small deterministic save namespace. */
export function playerSaveKey(project: Project, scope?: ExportScope) {
  const data = JSON.stringify({...project, assets:project.assets.map(a=>({...a,data:a.data.length})), audioAssets:project.audioAssets?.map(a=>({...a,data:a.data.length})), demands:undefined, scope});
  let hash=2166136261;
  for(let i=0;i<data.length;i++) hash=Math.imul(hash ^ data.charCodeAt(i),16777619);
  return `stillframe-player-save-v1-${(hash>>>0).toString(16)}`;
}
export function readPlayerSave(storage: Pick<Storage,"getItem">, key:string, project:Project, scope?:ExportScope): Runtime | null {
  try {
    const stored=storage.getItem(key);
    if(!stored)return null;
    const r=runtimeSchema.parse(JSON.parse(stored));
    if(!project.scenes.find(s=>s.id===r.scene)?.nodes.some(n=>n.id===r.node))return null;
    if(scope && !scope.nodes.includes(dialogueKey(r.scene,r.node)))return null;
    if(Object.entries(project.variables).some(([k,v])=>typeof r.values[k]!==typeof v))return null;
    return r;
  } catch { return null; }
}
export function savePlayerProgress(storage: Pick<Storage,"setItem">, key:string, runtime:Runtime) {
  storage.setItem(key, JSON.stringify(runtimeSchema.parse(runtime)));
}
