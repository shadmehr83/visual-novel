import {chromium} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
try {
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1450,height:1000}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const html=await readFile('dist/stillframe-studio.html','utf8');
 await page.route('https://demand-offline.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await context.setOffline(true);await page.goto('https://demand-offline.test/');
 await page.getByRole('button',{name:'v2.17.0',exact:true}).waitFor();
 await page.getByRole('button',{name:'Assistant',exact:true}).click();await page.getByLabel('AI demand request',{exact:true}).fill('Adjust this lamp after reviewing the scene.');await page.getByRole('button',{name:'Save request',exact:true}).click();
 const wait=page.waitForEvent('download');await page.getByRole('button',{name:'Export request log',exact:true}).click();const log=JSON.parse(await readFile(await(await wait).path(),'utf8'));assert.equal(log.requests.length,1);assert.equal(log.requests[0].text,'Adjust this lamp after reviewing the scene.');
 await page.locator('.studio-menu').getByText('File',{exact:true}).click();const full=page.waitForEvent('download');await page.getByRole('button',{name:'Export project JSON',exact:true}).click();const project=JSON.parse(await readFile(await(await full).path(),'utf8'));assert.equal(project.demands[0].id,log.requests[0].id);
 const playerWait=page.waitForEvent('download');await page.getByRole('button',{name:'Export playable HTML',exact:true}).click();const player=await readFile(await(await playerWait).path(),'utf8');const data=JSON.parse(player.match(/<script id="story-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);assert.equal(data.demands,undefined);
 const original=JSON.parse(await readFile('projects/published.stillframe.json','utf8'));assert.deepEqual(project.scenes,original.scenes);assert.deepEqual(project.assets,original.assets);assert.deepEqual(errors,[]);
 console.log('PASS: offline editor saves and exports timestamped demands in the request log and complete project without changing scene or artwork data.');
} finally {await browser.close();}
