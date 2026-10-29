import { test, expect } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { demo } from "../src/demo";
import { makeDevice } from "../src/deviceFrame";
function fixture() {
 const p=demo();p.id="compact-export-test";p.scenes=p.scenes.slice(0,1);p.assets=[];p.audioAssets=[];p.instaFeed={autoplay:false,repeat:false,comments:false,volume:0,posts:[]};delete p.chapters;
 const s=p.scenes[0];s.background=null;s.effects.rain=false;s.effects.glass=false;
 s.phone=makeDevice(s);s.phone.schedule=undefined;s.phone.defaultScreen="chat";s.phone.typingSeconds=0;
 s.nodes=[
 {id:"a",speaker:"Narrator",text:"Opening narrative",deviceVisible:false,choices:[],next:"b",allowCustomResponse:false},
 {id:"b",speaker:"Maria",text:"Choose your reply inside chat",deviceVisible:true,deviceScreen:"chat",deviceDialogue:true,allowPhoneCustomResponse:false,choices:[{id:"yes",text:"Available reply",target:"c",actions:[],note:""},{id:"no",text:"Disabled reply",target:"d",actions:[],note:"",enabled:false}]},
 {id:"c",speaker:"Maria",text:"Saved conversation position",deviceVisible:true,deviceScreen:"chat",deviceDialogue:true,allowPhoneCustomResponse:false,next:"d",choices:[]},
 {id:"d",speaker:"Narrator",text:"Unsaved later position",deviceVisible:false,choices:[],allowCustomResponse:false},
 ];return p;
}
async function game(page: import('@playwright/test').Page, mobile:boolean) {
 await page.route('**/player.js',async route=>route.fulfill({contentType:'application/javascript',body:await readFile('dist/player.js','utf8')}));
 await page.goto('/');
 await page.getByRole('button',{name:'Keep local project',exact:true}).click();
 await page.locator('input[accept=".json"]').setInputFiles({name:'compact-test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture()))});
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:mobile?'Export phone game':'Export playable HTML',exact:true}).click();
 const file=await download;
 expect(file.suggestedFilename()).toBe(mobile?'visual-novel-phone.html':'visual-novel-player.html');
 const html=await readFile((await file.path())!,'utf8');
 await writeFile(mobile ? '/tmp/actual-phone-export.html' : '/tmp/actual-desktop-export.html',html);
 await page.route('**/exported-test-game',route=>route.fulfill({contentType:'text/html',body:html}));
 await page.goto('/exported-test-game');
}
test('phone export fills portrait and landscape viewports, keeps chat choices inside, and saves/quits correctly',async({page})=>{
 test.setTimeout(90000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await game(page,true);
 await page.setViewportSize({width:390,height:844});
 await expect(page.locator('.standalone-experience')).toHaveAttribute('data-progression','screen');
 await expect(page.getByRole('heading',{level:1})).toHaveCount(0);
 await expect(page.getByLabel('Advance story',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Fullscreen',exact:true})).toHaveCount(0);
 const stage=page.locator('.scene-in .stage');
 const bounds=await stage.boundingBox();expect(bounds!.width).toBe(390);expect(bounds!.height).toBe(844);
 await page.locator('.dialogue-overlay p').click();
 await expect(page.getByRole('button',{name:'Available reply',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Disabled reply',exact:true})).toHaveCount(0);
 await expect(page.locator('.device-story-progress')).toHaveCount(0);
 await expect(page.locator('.device-keyboard')).toHaveCount(0);
 expect((await page.locator('.device-overlay').boundingBox())!.width).toBeGreaterThan(300);
 expect(await page.locator('.device-shell').evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
 await stage.locator('svg').click({position:{x:5,y:100}});
 await expect(page.getByRole('button',{name:'Available reply',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Available reply',exact:true}).click();
 await expect(page.locator('.device-feed')).toContainText('Saved conversation position');
 await page.getByRole('button',{name:'Pause menu',exact:true}).click();
 await expect(page.getByLabel('Story sound volume')).toBeVisible();
 await expect(page.getByLabel('Advance story',{exact:true})).toHaveValue('screen');
 await page.getByRole('button',{name:'Save and quit',exact:true}).click();
 await expect(page.getByRole('button',{name:'Continue saved game'})).toBeVisible();
 await page.reload();
 await page.getByRole('button',{name:'Continue saved game'}).click();
 await expect(page.locator('.device-feed')).toContainText('Saved conversation position');
 await page.locator('.device-feed').click({position:{x:20,y:30}});
 await expect(page.locator('.dialogue-overlay')).toContainText('Unsaved later position');
 await page.getByRole('button',{name:'Pause menu',exact:true}).click();
 await page.getByRole('button',{name:'Quit without saving',exact:true}).click();
 await page.getByRole('button',{name:'Continue saved game'}).click();
 await expect(page.locator('.device-feed')).toContainText('Saved conversation position');
 await page.setViewportSize({width:844,height:390});
 const landscape=await stage.boundingBox();expect(landscape!.width).toBe(844);expect(landscape!.height).toBe(390);
 await page.screenshot({path:'/tmp/phone-export-landscape.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'/tmp/phone-export-portrait.png'});
 expect(errors).toEqual([]);
});
test('normal export places settings in pause and fullscreen contains the stage without a toolbar gap',async({page})=>{
 test.setTimeout(90000);
 await game(page,false);
 await expect(page.locator('.standalone-experience')).toHaveAttribute('data-progression','continue');
 await expect(page.getByLabel('Story sound volume')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Pause menu',exact:true}).click();
 await page.getByLabel('Advance story',{exact:true}).selectOption('enter');
 await page.getByRole('button',{name:'Fullscreen',exact:true}).click();
 await expect(page.getByRole('button',{name:'Exit fullscreen',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Resume story',exact:true}).click();
 await expect(page.getByRole('button',{name:'Exit fullscreen',exact:true})).toHaveCount(0);
 const geometry=await page.locator('.standalone-experience').evaluate(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,padding:getComputedStyle(el).padding}));
 expect(geometry.padding).toBe('0px');expect(geometry.width).toBe(await page.evaluate(()=>innerWidth));expect(geometry.height).toBe(await page.evaluate(()=>innerHeight));
 await page.keyboard.press('Enter');
 await expect(page.getByRole('button',{name:'Available reply',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Pause menu',exact:true}).click();
 await page.getByRole('button',{name:'Exit fullscreen',exact:true}).click();
 await expect(page.getByRole('button',{name:'Fullscreen',exact:true})).toBeVisible();
});
test('reply enabled checkbox keeps its destination while hiding it in play',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Keep local project',exact:true}).click();
 const p=fixture();delete p.scenes[0].phone;p.scenes[0].nodes=p.scenes[0].nodes.slice(1);p.scenes[0].nodes[0].deviceVisible=false;
 await page.locator('input[accept=".json"]').setInputFiles({name:'choices.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});
 const target=page.getByLabel('Choice 1 target',{exact:true});await expect(target).toHaveValue('c');
 await page.getByLabel('Enable choice 1',{exact:true}).uncheck();
 await expect(target).toHaveValue('c');
 await page.getByLabel('Enable choice 1',{exact:true}).check();
 await expect(target).toHaveValue('c');
});
