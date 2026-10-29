import {it,expect} from 'vitest';
import {demo} from './demo';
import {sceneView} from './SceneViews';
import {validateProject} from './model';
it('isolates view effects and includes view audio only while its dialogue is active',()=>{
 const p=demo(),s=p.scenes[0];
 const effect=structuredClone(s.effects);effect.brightness=.6;
 s.subscenes=[{id:'close',title:'Close-up',background:null,transition:{style:'cut',seconds:.1},effects:effect,audio:[{id:'buzz',volume:.3,loop:true}]}];
 s.nodes[0].view='close';
 expect(sceneView(s,s.nodes[0].id).effects.brightness).toBe(.6);
 expect(sceneView(s,s.nodes[0].id).audio?.[0].id).toBe('buzz');
 expect(sceneView(s,s.nodes[1].id)).toBe(s);
 expect(s.effects.brightness).not.toBe(.6);
 expect(()=>validateProject(p)).toThrow('Missing sub-scene audio asset');
});
