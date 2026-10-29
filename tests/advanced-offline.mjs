import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true});
try{
 const version=JSON.parse(await readFile('package.json','utf8')).version;
 const html=await readFile('dist/stillframe-studio.html','utf8');
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1500,height:1000}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.route('https://advanced-studio.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await context.setOffline(true);await page.goto('https://advanced-studio.test/');
 await page.getByRole('button',{name:'v'+version,exact:true}).waitFor();await page.getByRole('tab',{name:'Update history',exact:true}).click();await page.getByLabel('Search update history').fill('Individual light favourites');await page.getByRole('heading',{name:'Individual light favourites',exact:true}).waitFor();
 await page.getByRole('tab',{name:'Advanced devices',exact:true}).click();await page.getByRole('button',{name:'Open existing app system',exact:true}).click();await page.locator('.device-preview-apps').getByRole('button',{name:'Insta',exact:true}).click();await page.getByLabel('Insta scrolling feed').waitFor();await page.getByLabel('Insta scrolling feed').evaluate(e=>{e.scrollTop=150;});assert.ok(await page.getByLabel('Insta scrolling feed').evaluate(e=>e.scrollTop)>0);
 await page.getByRole('tab',{name:'Dialogue advanced',exact:true}).click();await page.getByLabel('Advanced map scene').selectOption('bedroom');const heading=page.locator('[data-flow-card="node:wake"] .flow-card-heading');await heading.focus();await page.keyboard.press('ArrowRight');
 const download=page.waitForEvent('download');await page.locator('.studio-menu').getByText('File',{exact:true}).click();await page.getByRole('button',{name:'Export project JSON',exact:true}).click();const p=JSON.parse(await readFile(await (await download).path(),'utf8'));assert.ok(p.flowLayout.dialogues.bedroom['node:wake']);assert.equal(p.schemaVersion,1);
 const original=JSON.parse(await readFile('projects/published.stillframe.json','utf8'));assert.deepEqual(p.scenes,original.scenes);assert.deepEqual(p.assets,original.assets);assert.deepEqual(errors,[]);
 console.log('PASS: offline 2.0 studio exposes named history and editable dialogue maps; exported JSON keeps graph positions and preserves the complete story and artwork.');
}finally{await browser.close();}
