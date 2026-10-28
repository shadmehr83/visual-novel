import {test,expect,type Page} from '@playwright/test';
import {demo} from '../src/demo';
function fixture(){const p=demo();p.id='dock-search-fixture';p.title='Panel studio';p.scenes=p.scenes.slice(0,1);const s=p.scenes[0];s.title='Rainy room';s.effects.rain=false;s.effects.glass=false;s.effects.lights=[];s.nodes=[{id:'start',speaker:'Narrator',text:'The window is quiet.',choices:[],next:'end'},{id:'end',speaker:'Narrator',text:'Another page.',choices:[]}];return p;}
async function load(page:Page){await page.goto('/');await page.locator('input[accept=".json"]').setInputFiles({name:'panels.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture()))});await expect(page.getByLabel('Project title')).toHaveValue('Panel studio');}
async function place(page:Page,title:string,mode:string){await page.locator(`summary[aria-label="Move ${title}"]`).click();await page.getByRole('button',{name:title+' · '+mode,exact:true}).click();}
test.use({viewport:{width:1800,height:1150}});
test('active effect names open their exact settings without changing their separate toggles',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await load(page);
 await page.locator('.inspector-tabs').getByRole('button',{name:'Active',exact:true}).click();
 await expect(page.getByLabel('Enable Rain on glass',{exact:true})).not.toBeChecked();
 await page.getByRole('button',{name:'Open settings for Rain on glass',exact:true}).click();
 await expect(page.locator('.inspector')).toHaveAttribute('data-panel','Rain');
 await expect(page.getByLabel('Rain on glass',{exact:true})).toBeVisible();await expect(page.getByLabel('Rain on glass',{exact:true})).not.toBeChecked();
 await page.locator('.inspector-tabs').getByRole('button',{name:'Active',exact:true}).click();
 await page.getByLabel('Enable Rain on glass',{exact:true}).check();await expect(page.locator('.inspector')).toHaveAttribute('data-inspector','Active');
 await page.getByRole('button',{name:'Open settings for Rain on glass',exact:true}).click();await expect(page.getByLabel('Rain on glass',{exact:true})).toBeChecked();
 expect(errors).toEqual([]);
});
test('dialogue floats, edits, snaps on drag, finds another free dock on restore and moves into a split column',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await load(page);
 await page.getByRole('button',{name:'Pop out Dialogue editor',exact:true}).click();
 const floating=page.locator('[data-floating-panel="dialogue"]');await expect(floating).toBeVisible();
 await floating.getByLabel('Dialogue text',{exact:true}).fill('Edited in a floating window.');
 await expect(page.locator('.scene-in .dialogue-overlay p')).toHaveText('Edited in a floating window.');
 const handle=await floating.locator(':scope > .panel-chrome').boundingBox(),surface=await page.locator('.dock-surface').boundingBox();
 await page.mouse.move(handle!.x+65,handle!.y+12);await page.mouse.down();await page.mouse.move(surface!.x+8,surface!.y+surface!.height*.55,{steps:12});
 await expect(page.getByLabel('Window snap targets',{exact:true})).toBeVisible();await page.mouse.up();
 await expect(page.locator('[data-dock-slot="left"] [data-resident-panel="dialogue"]')).toBeVisible();
 await place(page,'Dialogue editor','float');await place(page,'Story library','left');
 await page.getByRole('button',{name:'Restore Dialogue editor',exact:true}).click();
 await expect(page.locator('[data-dock-slot="right"] [data-resident-panel="dialogue"]')).toBeVisible();
 await place(page,'Dialogue editor','split');await expect(page.locator('[data-dock-slot="split"] [data-resident-panel="dialogue"]')).toBeVisible();
 await place(page,'Dialogue editor','top');await expect(page.locator('[data-dock-slot="top"] [data-resident-panel="dialogue"]')).toBeVisible();
 await place(page,'Dialogue editor','home');
 await expect(page.locator('.bottom-panel').getByLabel('Dialogue text',{exact:true})).toHaveValue('Edited in a floating window.');
 expect(errors).toEqual([]);
});
test('whole workspaces float and restore; main search opens features, dialogue and window settings',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await load(page);
 await page.getByRole('button',{name:'Pop out Main workspace',exact:true}).click();await expect(page.locator('[data-floating-panel="workspace-main"]')).toBeVisible();
 await expect(page.locator('[data-floating-panel="workspace-main"] .stage')).toBeVisible();
 await page.getByRole('button',{name:'Restore Main workspace',exact:true}).click();await expect(page.locator('[data-floating-panel="workspace-main"]')).toHaveCount(0);
 await page.keyboard.press('Control+k');const dialog=page.getByRole('dialog',{name:'Search studio features',exact:true});await expect(dialog).toBeVisible();
 await page.getByLabel('Search all studio features',{exact:true}).fill('rain on glass');await page.keyboard.press('Enter');
 await expect(page.getByLabel('Rain on glass',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:/Search features/}).click();await page.getByLabel('Search all studio features',{exact:true}).fill('active');await page.locator('.feature-search-results button').first().click();
 await expect(page.locator('.inspector')).toHaveAttribute('data-inspector','Active');
 await page.keyboard.press('Control+k');await page.getByLabel('Search all studio features',{exact:true}).fill('Another page');await page.locator('.feature-search-results button').first().click();await expect(page.getByLabel('Dialogue text',{exact:true})).toHaveValue('Another page.');
 await page.keyboard.press('Control+k');await page.getByLabel('Search all studio features',{exact:true}).fill('window docking');await page.locator('.feature-search-results button').first().click();
 const windows=page.getByRole('dialog',{name:'Windows & docking',exact:true});await expect(windows).toBeVisible();
 await page.getByLabel('Dialogue editor window placement',{exact:true}).selectOption('float');
 await page.getByRole('button',{name:'Restore all window positions',exact:true}).click();await expect(page.getByLabel('Dialogue editor window placement',{exact:true})).toHaveValue('home');
 await page.getByRole('button',{name:'Close dialog',exact:true}).click();
 await page.getByRole('button',{name:'Pop out Dialogue editor',exact:true}).hover();await expect(page.getByRole('tooltip')).toContainText('Float Dialogue editor');
 expect(errors).toEqual([]);
});

test('separate docks float independently, retain resized bounds after reload, and suspend floats during playback',async({page})=>{
 test.setTimeout(60000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await load(page);
 await page.getByRole('button',{name:'Pop out Controls',exact:true}).click();
 const controls=page.locator('[data-floating-panel="controls"]');await expect(controls).toBeVisible();
 await controls.locator('.inspector-tabs').getByRole('button',{name:'Active',exact:true}).click();
 await controls.getByRole('button',{name:'Open settings for Rain on glass',exact:true}).click();
 await expect(controls.getByLabel('Rain on glass',{exact:true})).toBeVisible();
 await controls.getByRole('button',{name:'Restore Controls',exact:true}).click();
 await page.getByLabel('Separate controls and properties docks',{exact:true}).check();
 await page.getByRole('button',{name:'Pop out Effects',exact:true}).click();
 await page.getByRole('button',{name:'Pop out Scene properties',exact:true}).click();
 const properties=page.locator('[data-floating-panel="properties"]');await expect(properties).toBeVisible();
 await expect(page.locator('[data-floating-panel="effects"]')).toBeVisible();
 const r=await properties.boundingBox();await page.mouse.move(r!.x+r!.width-3,r!.y+r!.height-3);await page.mouse.down();await page.mouse.move(r!.x+r!.width+90,r!.y+r!.height+60,{steps:10});await page.mouse.up();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('stillframe-workspace')||'{}').docks?.properties?.width||0)).toBeGreaterThan(370);
 await page.reload();await expect(page.locator('[data-floating-panel="properties"]')).toBeVisible();
 expect((await page.locator('[data-floating-panel="properties"]').boundingBox())!.width).toBeGreaterThan(370);
 await page.getByRole('button',{name:'Windows & docking',exact:true}).click();await page.getByRole('button',{name:'Restore all window positions',exact:true}).click();await page.getByRole('button',{name:'Close dialog',exact:true}).click();
 await expect(page.locator('[data-floating-panel]')).toHaveCount(0);
 await page.getByRole('button',{name:'Pop out Dialogue editor',exact:true}).click();await expect(page.locator('[data-floating-panel="dialogue"]')).toBeVisible();
 await page.getByRole('button',{name:'Play story',exact:true}).click();await expect(page.locator('[data-floating-panel]')).toHaveCount(0);
 await page.getByRole('button',{name:'Back to editor',exact:true}).click();await expect(page.locator('[data-floating-panel="dialogue"]')).toBeVisible();expect(errors).toEqual([]);
});
