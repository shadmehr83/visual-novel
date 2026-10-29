import {test,expect} from '@playwright/test';
import {demo} from '../src/demo';
test('advanced scenes exposes tracks and music keeps position through dialogue, subscene, volume and pause',async({page})=>{
 test.setTimeout(90000);
 await page.addInitScript(()=>{
  const Native=window.Audio;(window as any).__tracks=[];
  (window as any).Audio=function(src?:string){const a=new Native(src);(window as any).__tracks.push(a);return a;};
 });
 await page.goto('/');await page.getByRole('button',{name:'Keep local project',exact:true}).click();
 const p=demo(),s=p.scenes[0];p.scenes=[s];s.effects.rain=false;s.audio=[{id:'music',volume:.36,loop:true}];
 const fs=await import('node:fs/promises');const music=await fs.readFile('references/audio/cafe-first-meeting.ogg');p.audioAssets=[{id:'music',name:'Café score',data:'data:audio/ogg;base64,'+music.toString('base64')}];
 s.nodes=[{id:'a',speaker:'Narrator',text:'Before cake',next:'b',choices:[],allowCustomResponse:false},{id:'b',speaker:'Narrator',text:'With cake',view:'cake',choices:[],allowCustomResponse:false}];s.subscenes=[{id:'cake',title:'Cake view',background:null,transition:{style:'cut',seconds:.1}}] as any;
 await page.locator('input[accept=".json"]').setInputFiles({name:'music.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});
 await page.getByRole('tab',{name:'Scenes advanced',exact:true}).click();await page.getByRole('region',{name:'Scene soundtracks'}).waitFor();
 await expect(page.getByRole('region',{name:'Scene soundtracks'}).locator('audio')).toHaveCount(1);
 await page.getByLabel('Scene track volume 1 exact value',{exact:true}).fill('0.4');
 await page.getByRole('tab',{name:'Editor',exact:true}).click();await page.getByRole('button',{name:'Play story',exact:true}).click();
 await page.waitForFunction(()=>((window as any).__tracks||[]).some((a:HTMLAudioElement)=>a.loop&&a.currentTime>.2));
 const identity=await page.evaluate(()=>{const a=(window as any).__tracks.find((a:HTMLAudioElement)=>a.loop);(window as any).__music=a;return a.currentTime;});
 await page.locator('.scene-in').getByRole('button',{name:'Continue',exact:true}).click();await expect(page.locator('.scene-in')).toContainText('With cake');
 await expect.poll(()=>page.evaluate(()=>(window as any).__music.currentTime)).toBeGreaterThan(identity);
 expect(await page.evaluate(()=>(window as any).__tracks.filter((a:HTMLAudioElement)=>a.loop).length)).toBe(1);
 await page.getByRole('button',{name:'Pause menu',exact:true}).click();const position=await page.evaluate(()=>(window as any).__music.currentTime);await page.getByLabel('Story sound volume',{exact:true}).focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');await page.getByRole('button',{name:'Resume story',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).__music.currentTime)).toBeGreaterThanOrEqual(position);
 expect(await page.evaluate(()=>(window as any).__tracks.filter((a:HTMLAudioElement)=>a.loop).length)).toBe(1);
});
