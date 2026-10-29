import {it,expect} from 'vitest';
import {demo} from './demo';
import {exportScope,dialogueKey,startScope,limitScope} from './exportScope';
it('starts at a selected dialogue and stops inclusively or at a branch leaving the range',()=>{
 const p=demo(),s=p.scenes[0],a=s.nodes[0],b=s.nodes[1];
 const scope=exportScope(p,dialogueKey(s.id,a.id),dialogueKey(s.id,b.id));
 const r=startScope(p,scope);expect(r.node).toBe(a.id);
 expect(limitScope(r,{...r,node:b.id},scope).ended).toBe(false);
 expect(limitScope({...r,node:b.id},{...r,node:a.id},scope).ended).toBe(true);
 expect(limitScope(r,{...r,node:'outside'},scope).ended).toBe(true);
 expect(()=>exportScope(p,dialogueKey(s.id,b.id),dialogueKey(s.id,a.id))).toThrow();
});
