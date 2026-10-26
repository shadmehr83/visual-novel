// Run against `npm run preview -- --port 4173` after a production build.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true});
try {
  const context=await browser.newContext();
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173');
  await page.getByText('Saved on this device').waitFor();
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button',{name:'Play story'}).click();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('button',{name:'Open the message',exact:true}).click();
  await page.getByRole('button',{name:'I have a ranked list.',exact:false}).waitFor();
  assert.deepEqual(errors,[]);
  console.log('PASS: production shell reloads offline; authored choices and transitions work offline; no page errors.');
} finally { await browser.close(); }
