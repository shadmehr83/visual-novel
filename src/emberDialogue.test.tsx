import {it,expect,vi,afterEach} from 'vitest';
import {render,fireEvent,screen,cleanup} from '@testing-library/react';
import {PhoneUI} from './PhoneUI';
import {demo} from './demo';
import {makeDevice} from './deviceFrame';
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
function phone(separate=false){
 vi.stubGlobal('matchMedia',vi.fn(()=>({matches:true})));
 Object.defineProperty(HTMLElement.prototype,'scrollTo',{configurable:true,value:vi.fn()});
 const project=demo(),scene=project.scenes[0];scene.phone=makeDevice(scene);delete scene.phone.schedule;scene.phone.defaultScreen='chat';
 const node={id:'chat-test',speaker:'Maria',text:'Only inside Ember',deviceScreen:'chat' as const,deviceDialogue:!separate,choices:[{id:'reply',text:'Chat-only reply',target:'chat-test',actions:[],note:''}]};
 scene.nodes=[node];project.instaFeed={autoplay:false,repeat:false,comments:false,volume:0,posts:[]};
 return render(<PhoneUI project={project} scene={scene} node={node} runtime={null} onStep={()=>{}} onReply={()=>{}} />);
}
it('leaving Ember hides its dialogue and choices on Home and other apps; reopening restores them',()=>{
 const {container}=phone();expect(screen.queryByRole('button',{name:'Chat-only reply'})).not.toBeNull();
 fireEvent.click(screen.getByLabelText('Back to phone home'));
 expect(container.querySelector('.device-story-progress')).toBeNull();
 expect(screen.queryByRole('button',{name:'Chat-only reply'})).toBeNull();
 expect(screen.getByRole('button',{name:/Weather/}).querySelector('img')?.getAttribute('src')).toMatch(/^data:image\/webp;base64,/);
 for(const app of ['Weather','Settings','Insta']){
  fireEvent.click(screen.getByRole('button',{name:new RegExp(app)}));
  expect(container.querySelector('.device-story-progress')).toBeNull();
  expect(screen.queryByRole('button',{name:'Chat-only reply'})).toBeNull();
  fireEvent.click(screen.getByLabelText('Back to phone home'));
 }
 fireEvent.click(screen.getByRole('button',{name:/Ember/}));
 expect(screen.queryByRole('button',{name:'Chat-only reply'})).not.toBeNull();
 expect(container.querySelector('.device-story-progress')).toBeNull();
});
it('intentionally separate narration and choices remain outside while browsing Home',()=>{
 const {container}=phone(true);fireEvent.click(screen.getByLabelText('Back to phone home'));
 expect(container.querySelector('.device-story-progress')?.textContent).toContain('Only inside Ember');
 expect(screen.queryByRole('button',{name:'Chat-only reply'})).not.toBeNull();
});
