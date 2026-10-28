import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {demo} from '../src/demo';
import type {Project} from '../src/model';
const pixel='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY9sAAAAASUVORK5CYII=';
function fixture(){
 const p=demo();p.id='shared-workspace-test';p.title='Shared workspaces';p.scenes=p.scenes.slice(0,2);
 p.assets=[{id:'background',name:'Rainy window',folder:'Background scenes',data:pixel,mime:'image/png',width:1,height:1,tags:'',notes:'',approved:true,reference:false},
 {id:'outfit',name:'A saved outfit',folder:'Outfits & items',data:pixel,mime:'image/png',width:1,height:1,tags:'',notes:'',approved:true,reference:false},
 {id:'avatar',name:'Maria profile',folder:'Profiles & app icons',data:pixel,mime:'image/png',width:1,height:1,tags:'',notes:'',approved:true,reference:false}];
 for(const s of p.scenes){s.effects.rain=false;s.effects.glass=false;s.background=null;delete s.phone;delete s.items;delete s.subscenes;s.nodes=[{id:'a',speaker:'Narrator',text:'The opening',next:'b',choices:[]},{id:'b',speaker:'Narrator',text:'The window',choices:[]}];}
 return p;
}
async function openFixture(page:Page){await page.goto('/');await page.locator('input[accept=".json"]').setInputFiles({name:'shared.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture()))});await expect(page.getByLabel('Project title')).toHaveValue('Shared workspaces');}
test.use({viewport:{width:2215,height:1252}});
test('dialogue artwork, text and selection sync with the editor; panes resize, stack and switch workspaces',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await openFixture(page);
 await page.getByRole('button',{name:'Split view',exact:true}).click();
 const main=page.getByRole('region',{name:'Main workspace pane',exact:true}),side=page.getByRole('region',{name:'Second workspace pane',exact:true});
 await expect(main.locator('#studio-editor')).toBeVisible();await expect(side.getByRole('heading',{name:'Dialogue advanced',exact:true})).toBeVisible();
 await side.locator('[data-flow-card="node:b"]').click();
 await expect(main.getByLabel('Dialogue text',{exact:true})).toHaveValue('The window');
 const picker=side.getByLabel('Dialogue background image',{exact:true});
 await side.getByLabel('Dialogue background image folder',{exact:true}).selectOption('Background scenes');await picker.selectOption('background');
 await expect(main.locator('.scene-in .stage > svg image').first()).toHaveAttribute('href',pixel);
 await side.getByLabel('Map dialogue text',{exact:true}).fill('Our shared window view');
 await expect(main.getByLabel('Dialogue text',{exact:true})).toHaveValue('Our shared window view');
 await expect(main.locator('.scene-in .dialogue-overlay p')).toHaveText('Our shared window view');
 await page.getByLabel('Resize workspace panes',{exact:true}).focus();await page.keyboard.press('ArrowRight');
 await expect(page.getByLabel('Resize workspace panes',{exact:true})).toHaveAttribute('aria-valuenow','60');
 const beforeMain=await main.boundingBox(),beforeSide=await side.boundingBox();expect(beforeMain!.x).toBeLessThan(beforeSide!.x);expect(beforeMain!.width).toBeGreaterThan(beforeSide!.width);
 await page.getByRole('button',{name:'Swap sides',exact:true}).click();expect((await main.boundingBox())!.x).toBeGreaterThan((await side.boundingBox())!.x);
 await page.getByLabel('Workspace arrangement',{exact:true}).selectOption('stacked');
 expect((await main.boundingBox())!.y).toBeGreaterThan((await side.boundingBox())!.y);
 await page.getByLabel('Workspace arrangement',{exact:true}).selectOption('side-by-side');
 await page.getByLabel('Second workspace',{exact:true}).selectOption('scenes');await expect(side.getByRole('heading',{name:'Scenes advanced',exact:true})).toBeVisible();
 await page.getByLabel('Main workspace',{exact:true}).selectOption('dialogues');
 await expect(main.getByRole('heading',{name:'Dialogue advanced',exact:true})).toBeVisible();
 // Each map owns its SVG marker; multiple maps must not reference duplicate document IDs.
 const markers=await page.locator('.flow-wires marker').evaluateAll(nodes=>nodes.map(n=>n.id));expect(new Set(markers).size).toBe(2);
 await page.getByLabel('Second workspace',{exact:true}).selectOption('editor');
 await expect(page.getByLabel('Second workspace',{exact:true})).toHaveValue('editor');
 await expect(side.locator('#studio-editor')).toBeVisible();await expect(main.getByRole('heading',{name:'Dialogue advanced',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Close second workspace',exact:true}).click();await expect(side).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('the old saved-project update populates all artwork folders before copying sub-scenes',async({page})=>{
 test.setTimeout(90000);
 const p=JSON.parse(readFileSync('projects/published.stillframe.json','utf8')) as Project;p.contentUpdates=[];
 p.assets=p.assets.filter(a=>!a.id.startsWith('outfit-')&&!a.id.startsWith('studio-icon-')&&!['first-match-window','first-match-monitor'].includes(a.id));
 for(const a of p.assets)delete a.folder;
 for(const s of p.scenes){if(s.phone?.appearance)s.phone.appearance.icons={};delete s.subscenes;for(const n of s.nodes)delete n.view;}
 delete p.scenes.find(s=>s.id==='outfit')!.items;
 await page.goto('/');
 // Seed a valid legacy browser save, exactly the path that previously failed on startup.
 await page.evaluate(async data=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('stillframe-studio',1);r.onupgradeneeded=()=>r.result.createObjectStore('projects');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});await new Promise<void>((resolve,reject)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').put({project:data,runtime:null},'current');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();},p);
 await page.reload();await page.getByRole('button',{name:'Assets',exact:true}).click();
 await expect(page.locator('.snapshot-toolbar')).not.toContainText('could not be applied');
 for(const [folder,count]of [['Outfits & items',3],['Profiles & app icons',4],['Background scenes',7]] as const){await page.getByLabel('Artwork folder',{exact:true}).selectOption(folder);await expect(page.locator('.asset-card')).toHaveCount(count);}
 await expect(page.getByRole('link',{name:/Browse saved artwork folders on GitHub/})).toHaveAttribute('href','https://github.com/shadmehr83/visual-novel/tree/main/artwork');
 await page.getByRole('button',{name:'Restore artwork',exact:true}).click();
 await expect(page.locator('.snapshot-toolbar')).toContainText('Restored the published artwork library');
 await expect(page.getByRole('button',{name:'Restore previous local project',exact:true})).toBeVisible();
});
