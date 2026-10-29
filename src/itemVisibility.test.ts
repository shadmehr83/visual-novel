import {it,expect} from 'vitest';
import {demo} from './demo';
import {hasItemUI} from './ItemOverlay';
it('closes the picker on unrelated dialogues and respects a chosen dialogue restriction',()=>{
 const p=demo(),s=p.scenes[0],n=s.nodes[1];s.items={enabled:true,title:'Items',blur:3,options:[{id:'item',label:'Coat',description:'',asset:null,choice:n.choices[0].id}]};
 expect(hasItemUI(s,n)).toBe(true);expect(hasItemUI(s,s.nodes[0])).toBe(false);
 s.items.onlyAt=s.nodes[0].id;expect(hasItemUI(s,n)).toBe(false);
});
