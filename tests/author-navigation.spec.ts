import {test,expect} from '@playwright/test';
import {demo} from '../src/demo';
test('author can step back, restore forward and jump without restarting',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Keep local project',exact:true}).click();const p=demo();p.scenes=p.scenes.slice(0,1);p.scenes[0].nodes=[{id:'a',speaker:'Narrator',text:'First line',next:'b',choices:[]},{id:'b',speaker:'Narrator',text:'Second line',next:'c',choices:[]},{id:'c',speaker:'Narrator',text:'Third line',choices:[]}];
 await page.locator('input[accept=".json"]').setInputFiles({name:'navigation.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await page.getByRole('button',{name:'Author’s playthrough',exact:true}).click();const toolbar=page.locator('.author-play-toolbar');
 await expect(toolbar.getByRole('button',{name:'Previous dialogue',exact:true})).toBeDisabled();
 await page.locator('.scene-in').getByRole('button',{name:'Continue',exact:true}).click();await expect(page.locator('.scene-in .dialogue-overlay')).toContainText('Second line');
 await toolbar.getByRole('button',{name:'Previous dialogue',exact:true}).click();await expect(page.locator('.scene-in .dialogue-overlay')).toContainText('First line');
 await toolbar.getByRole('button',{name:'Next dialogue',exact:true}).click();await expect(page.locator('.scene-in .dialogue-overlay')).toContainText('Second line');
 await page.getByLabel('Jump to dialogue in author playthrough').selectOption(JSON.stringify([p.scenes[0].id,'c']));await expect(page.locator('.scene-in .dialogue-overlay')).toContainText('Third line');
 await toolbar.getByRole('button',{name:'Previous dialogue',exact:true}).click();await expect(page.locator('.scene-in .dialogue-overlay')).toContainText('Second line');
});
