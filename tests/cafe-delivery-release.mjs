import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true});
try {
 const page=await browser.newPage({viewport:{width:1500,height:1100},serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.getByRole('button',{name:'Keep local project',exact:true}).click();
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download local editor',exact:true}).click();
 const file=await pending,html=await readFile(await file.path(),'utf8');assert.equal(file.suggestedFilename(),'stillframe-studio.html');assert(html.includes('data-stillframe-standalone="true"'));assert(html.length>25*1024*1024);
 await page.route('https://cafe-offline.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await page.context().setOffline(true);await page.goto('https://cafe-offline.test/');
 await page.getByRole('button',{name:'Keep local project',exact:true}).click();await page.getByRole('button',{name:'v2.21.0',exact:true}).waitFor();
 assert.deepEqual(errors,[]);console.log('PASS: compressed production download restores the complete offline editor above 25 MiB, and opens offline with no page errors.');
}finally{await browser.close();}
