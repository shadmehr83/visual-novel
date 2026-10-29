import {it,expect} from 'vitest';
import {savedProject} from './savedProject';
import {integratePlayerContent} from './playerContentUpdate';
it('updates matching chat placement once without replacing custom dialogue or cafe artwork/effects',()=>{
 const source=savedProject(),local=savedProject();local.contentUpdates=local.contentUpdates!.filter(v=>v!=='2.20.0');
 const s=local.scenes[2],n=s.nodes.find(n=>n.id==='confirm')!;delete n.deviceDialogue;delete n.deviceVisible;delete n.deviceScreen;s.phone!.keyboard=true;
 const edited=local.scenes[1].nodes.find(n=>n.choices.length && n.id!=='ask-wants')!;edited.text='My custom dialogue';edited.deviceDialogue=false;
 const cafe=local.scenes.find(s=>s.id==='cafe')!;cafe.effects.brightness=.74;
 const result=integratePlayerContent(local,source)!;
 expect(result.scenes[2].nodes.find(v=>v.id===n.id)!.deviceDialogue).toBe(true);
 expect(result.scenes[2].phone!.keyboard).toBe(false);
 expect(result.scenes[1].nodes.find(v=>v.id===edited.id)!.deviceDialogue).toBe(false);
 expect(result.scenes.find(s=>s.id==='cafe')).toEqual(cafe);
 result.scenes[2].phone!.keyboard=true;
 expect(integratePlayerContent(result,source)).toBeNull();
 expect(integratePlayerContent({...local,id:'another-project'},source)).toBeNull();
});
