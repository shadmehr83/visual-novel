import { enter, start, type Project, type Runtime } from './model';
export type ExportScope = { nodes: string[]; scene: string; node: string };
export const dialogueKey = (scene: string, node: string) => JSON.stringify([scene,node]);
export function exportScope(p: Project, first: string, last: string): ExportScope {
 const entries=p.scenes.flatMap(s=>s.nodes.map(n=>({scene:s.id,node:n.id,key:dialogueKey(s.id,n.id)})));
 const a=entries.findIndex(n=>n.key===first), b=entries.findIndex(n=>n.key===last);
 if(a<0||b<a) throw Error('Choose an end dialogue at or after the start dialogue.');
 return {nodes:entries.slice(a,b+1).map(n=>n.key),scene:entries[a].scene,node:entries[a].node};
}
export function startScope(p:Project,scope?:ExportScope):Runtime {
 if(!scope)return start(p);
 const base=enter(p,{scene:'',node:'',values:{...p.variables},visited:[],history:[],choices:[],ended:false},scope.scene);
 return {...base,node:scope.node,nodeVisits:[{scene:scope.scene,node:scope.node}],phoneMessages:[]};
}
export function limitScope(before:Runtime,after:Runtime,scope?:ExportScope):Runtime {
 if(scope && !before.ended && dialogueKey(before.scene,before.node)===scope.nodes.at(-1))return {...before,ended:true};
 if(!scope||scope.nodes.includes(dialogueKey(after.scene,after.node)))return after;
 return {...before,ended:true,history:[...before.history,'Export range complete']};
}
