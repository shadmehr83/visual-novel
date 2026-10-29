import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},serviceWorkers:'block'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));const context=page.context();
 const html=await readFile('dist/stillframe-studio.html','utf8');
 await page.route('https://chapter-offline.test/',r=>r.fulfill({contentType:'text/html',body:html}));
 await context.setOffline(true);await page.goto('https://chapter-offline.test/');
 await page.getByRole('tab',{name:'Chapters advanced',exact:true}).click();
 await page.getByRole('navigation',{name:'Story chapters',exact:true}).getByRole('button',{name:/The Space Between Messages/}).click();
 assert.equal(await page.locator('.chapter-scene').count(),6);await page.screenshot({path:'/tmp/stillframe-chapters.png'});
 await page.getByRole('button',{name:'Back to editor',exact:true}).click();
 const p=JSON.parse(await readFile('projects/published.stillframe.json','utf8'));p.title='Offline chapter test';p.id='offline-chapter-test';
 p.scenes=p.scenes.slice(0,2);for(const s of p.scenes){delete s.phone;delete s.subscenes;delete s.camera;s.joints=[];s.items=undefined;s.transition={style:'cut',seconds:.1};}
 p.scenes[0].nodes=[{id:'pick',speaker:'Narrator',text:'Set a boundary.',choices:[{id:'boundary',text:'I need time.',target:'end',actions:[{key:'boundary_set',op:'set',value:true}],note:''}]},{id:'end',speaker:'Narrator',text:'Chapter one ends.',choices:[]}];
 p.scenes[1].nodes=[{id:'opening',speaker:'Narrator',text:'Your boundary is remembered.',choices:[]}];
 p.chapters=[{id:'c1',title:'Before',notes:'',scenes:[p.scenes[0].id],startScene:p.scenes[0].id,starts:[],exits:[{scene:p.scenes[0].id,node:'end'}],next:'c2'},{id:'c2',title:'After',notes:'',scenes:[p.scenes[1].id],startScene:p.scenes[1].id,starts:[{id:'respect',label:'Boundary respected',scene:p.scenes[1].id,match:'all',conditions:[{key:'boundary_set',op:'eq',value:true}]}],exits:[]}];
 await page.locator('input[accept=".json"]').setInputFiles({name:'offline-chapters.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});
 await page.waitForFunction(()=>document.querySelector('[aria-label="Project title"]')?.value==='Offline chapter test');
 const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Export playable HTML',exact:true}).click();const player=await readFile(await(await downloading).path(),'utf8');
 await page.route('https://chapter-player.test/',r=>r.fulfill({contentType:'text/html',body:player}));await page.goto('https://chapter-player.test/');
 await page.getByRole('button',{name:'I need time.',exact:true}).click();await page.locator('.scene-in').getByRole('button',{name:'Continue',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.scene-in .dialogue-overlay')?.textContent?.includes('Your boundary is remembered.'));
 assert((await page.locator('.chapter-badge').textContent()).includes('After'));assert.deepEqual(errors,[]);
 console.log('PASS: offline studio exposes all six chapter drafts; its standalone player carries prior state into the next chapter without a network connection or page errors.');
}finally{await browser.close();}
