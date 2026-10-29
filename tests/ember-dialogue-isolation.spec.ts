import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {demo} from '../src/demo';
import {makeDevice} from '../src/deviceFrame';
function fixture(){
 const p=demo();p.scenes=p.scenes.slice(0,1);p.settings.progression='enter';p.instaFeed={autoplay:false,repeat:false,comments:false,volume:0,posts:[]};
 const s=p.scenes[0];s.effects.rain=false;s.phone=makeDevice(s);delete s.phone.schedule;s.phone.defaultScreen='chat';s.phone.typingSeconds=0;
 s.nodes=[{id:'chat',speaker:'Maria',text:'Only inside Ember',deviceVisible:true,deviceScreen:'chat',deviceDialogue:true,choices:[{id:'reply',text:'A chat-only reply',target:'after',actions:[],note:''}]},{id:'after',speaker:'Maria',text:'After the reply',deviceVisible:true,deviceScreen:'chat',deviceDialogue:true,next:'aside',choices:[]},{id:'aside',speaker:'Narrator',text:'A deliberately separate thought',deviceVisible:true,deviceScreen:'chat',deviceDialogue:false,choices:[{id:'back',text:'Keep talking',target:'chat',actions:[],note:''}]}];
 return p;
}
async function leaveChat(page:import('@playwright/test').Page,scope:import('@playwright/test').Locator){
 await expect(scope.locator('.device-replies')).toContainText('A chat-only reply');
 await scope.getByLabel('Back to phone home',{exact:true}).click();
 await expect(scope.locator('.device-overlay')).toHaveAttribute('data-device-screen','home');
 await expect(scope.locator('.device-story-progress')).toHaveCount(0);
 await expect(scope.getByRole('button',{name:'A chat-only reply',exact:true})).toHaveCount(0);
 const weather=scope.locator('.phone-app-grid').getByRole('button',{name:/Weather/});
 await expect(weather.locator('img')).toBeVisible();
 await weather.click();await expect(scope.getByRole('region',{name:'Weekly weather'})).toBeVisible();
 await expect(scope.locator('.device-story-progress')).toHaveCount(0);
 await scope.getByLabel('Back to phone home',{exact:true}).click();
 await scope.locator('.phone-app-grid').getByRole('button',{name:/Settings/}).click();
 await expect(scope.locator('.device-story-progress')).toHaveCount(0);
 await scope.getByLabel('Back to phone home',{exact:true}).click();
 await scope.locator('.phone-app-grid').getByRole('button',{name:/Insta/}).click();
 await expect(scope.locator('.device-story-progress')).toHaveCount(0);
 await scope.getByLabel('Back to phone home',{exact:true}).click();
 await scope.locator('.phone-app-grid').getByRole('button',{name:/Ember/}).click();
 await expect(scope.locator('.device-replies')).toContainText('A chat-only reply');
}
test('advanced preview keeps chat replies only in Ember, while explicit narration remains separate',async({page})=>{
 test.setTimeout(60000);await page.goto('/');await page.getByRole('button',{name:'Keep local project',exact:true}).click();
 await page.locator('input[accept=".json"]').setInputFiles({name:'ember.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture()))});
 await page.getByRole('tab',{name:'Advanced devices',exact:true}).click();
 const preview=page.locator('.device-live-preview');
 await preview.locator('.phone-app-grid').getByRole('button',{name:/Ember/}).click();
 await leaveChat(page,preview);
 // Selecting another authored line is distinct from browsing an app.
 await page.getByLabel('Device workspace dialogue',{exact:true}).selectOption('aside');
 await expect(preview.locator('.device-story-progress')).toContainText('A deliberately separate thought');
});
test('playback and exported player cannot expose or advance chat dialogue from another app',async({page})=>{
 test.setTimeout(90000);await page.route('**/player.js',async route=>route.fulfill({contentType:'application/javascript',body:await readFile('dist/player.js','utf8')}));
 await page.goto('/');await page.getByRole('button',{name:'Keep local project',exact:true}).click();
 await page.locator('input[accept=".json"]').setInputFiles({name:'ember.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture()))});
 await page.getByRole('button',{name:'Play story',exact:true}).click();
 const scene=page.locator('.scene-in');await leaveChat(page,scene);
 await scene.getByRole('button',{name:'A chat-only reply',exact:true}).click();
 await expect(scene.locator('.device-feed')).toContainText('After the reply');
 await scene.getByLabel('Back to phone home',{exact:true}).click();
 await page.locator('.preview-area').click({position:{x:5,y:100}});await page.keyboard.press('Enter');
 await expect(scene.locator('.device-story-progress')).toHaveCount(0);
 await scene.locator('.phone-app-grid').getByRole('button',{name:/Ember/}).click();
 await expect(scene.locator('.device-feed')).toContainText('After the reply');
 await page.getByRole('button',{name:'Back to editor',exact:true}).click();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export phone game',exact:true}).click();
 const html=await readFile((await (await download).path())!,'utf8');
 await page.route('**/isolated-game',r=>r.fulfill({contentType:'text/html',body:html}));await page.goto('/isolated-game');
 await page.setViewportSize({width:390,height:844});const game=page.locator('.scene-in');await leaveChat(page,game);
 await game.getByRole('button',{name:'A chat-only reply',exact:true}).click();
 await game.getByLabel('Back to phone home',{exact:true}).click();
 await game.locator('.stage>svg').click({position:{x:2,y:100}});
 await expect(game.locator('.device-story-progress')).toHaveCount(0);
 await game.locator('.phone-app-grid').getByRole('button',{name:/Ember/}).click();await expect(game.locator('.device-feed')).toContainText('After the reply');
});
