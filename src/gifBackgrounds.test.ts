import {it,expect} from 'vitest';
import {savedProject} from './savedProject';
import {integrateCafeMotion} from './cafeMotionUpdate';
import {validateProject} from './model';
it('validates GIF assets, cake cues and retained original artwork',()=>{
 const p=savedProject(),c=p.scenes.find(s=>s.id==='cafe')!;
 expect(p.assets.find(a=>a.id===c.background)?.mime).toBe('image/gif');
 expect(c.nodes.find(n=>n.id==='beat-10')!.view).toBe('cake-arrives');
 expect(p.assets.find(a=>a.name==='Rainy Café Conversation.png')?.mime).toBe('image/png');
 expect(()=>validateProject(p)).not.toThrow();
});
it('updates default views once while preserving dialogue and custom backgrounds',()=>{
 const source=savedProject(),p=savedProject();p.contentUpdates=p.contentUpdates!.filter(x=>x!=='2.15.0');
 const c=p.scenes.find(s=>s.id==='cafe')!;c.background='2021e333-3387-4b6e-ad86-281b140a8cca';c.nodes.find(n=>n.id==='beat-10')!.text='My cake dialogue';
 const next=integrateCafeMotion(p,source)!;expect(next.scenes.find(s=>s.id==='cafe')!.nodes.find(n=>n.id==='beat-10')!.text).toBe('My cake dialogue');expect(integrateCafeMotion(next,source)).toBeNull();
 c.background=null;expect(integrateCafeMotion(p,source)!.scenes.find(s=>s.id==='cafe')!.background).toBeNull();
});
