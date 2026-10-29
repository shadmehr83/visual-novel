import {test,expect} from '@playwright/test';
import {demo} from '../src/demo';
test('item window closes after confirmation and ordinary dialogue is accessible',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Keep local project',exact:true}).click();
 const p=demo(),s=p.scenes[0];p.scenes=[s];s.nodes=[{id:'pick',speaker:'Narrator',text:'Choose coat',choices:[{id:'coat',text:'Wear coat',target:'after',actions:[],note:''}]},{id:'after',speaker:'Narrator',text:'Ready to leave',choices:[]}];s.items={enabled:true,title:'Clothing',blur:3,showSelected:false,options:[{id:'coat-item',label:'Coat',description:'Warm coat',asset:null,choice:'coat'}]};
 await page.locator('input[accept=".json"]').setInputFiles({name:'item.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});
 await page.getByRole('button',{name:'Play story',exact:true}).click();await page.getByRole('button',{name:/Coat Inspect item/}).click();await page.getByRole('button',{name:'Choose Coat',exact:true}).click();
 await expect(page.locator('.scene-in .item-overlay')).toHaveCount(0);await expect(page.locator('.scene-in .dialogue-overlay')).toContainText('Ready to leave');
});
