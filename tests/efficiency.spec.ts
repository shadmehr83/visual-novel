import {test,expect} from '@playwright/test';
test('reset repairs preview geometry and provider assignments remain selectable',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('stillframe-workspace',JSON.stringify({previewCustom:true,previewLocked:false,previewWidth:280,previewHeight:180,docks:{'workspace-main':{mode:'left',x:0,y:0,width:320,height:600}}})));
 await page.goto('/');await page.getByRole('button',{name:'Windows & docking',exact:true}).click();await page.getByRole('button',{name:'Restore all window positions',exact:true}).click();await page.getByRole('button',{name:'Close dialog',exact:true}).click();
 await expect(page.getByRole('button',{name:'Reset preview window',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Unlock game preview window',exact:true}).click();await expect(page.getByRole('button',{name:'Resize game preview window',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Assistant',exact:true}).click();await page.getByRole('tab',{name:'API assistant',exact:true}).click();await page.getByLabel('Assistant task',{exact:true}).selectOption('system-ui');await page.getByLabel('AI task provider',{exact:true}).selectOption('anthropic');await page.getByLabel('Assistant task',{exact:true}).selectOption('dialogue');await expect(page.getByLabel('AI task provider',{exact:true})).toHaveValue('openai');
});
