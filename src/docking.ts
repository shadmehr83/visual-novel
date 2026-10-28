import {z} from 'zod';
export const dockModes=['home','float','left','right','top','bottom','split'] as const;
export type DockMode=typeof dockModes[number];
export const dockPanelSchema=z.object({mode:z.enum(dockModes),returnTo:z.enum(dockModes).optional(),x:z.number().finite(),y:z.number().finite(),width:z.number().min(220).max(2200),height:z.number().min(140).max(1600)});
export type PanelLayout=z.infer<typeof dockPanelSchema>;
export type DockLayouts=Record<string,PanelLayout>;
export function panelLayout(layouts:DockLayouts,id:string):PanelLayout {
 const large=/preview|workspace/.test(id),dialogue=id==='dialogue';
 return layouts[id]||{mode:'home',x:100,y:160,width:large?850:dialogue?700:320,height:large?580:dialogue?380:600};
}
export function restoreDock(layouts:DockLayouts,id:string):DockMode {
 const wanted=layouts[id]?.returnTo||'home';
 if(wanted==='home'||wanted==='float')return 'home';
 const occupied=new Set(Object.entries(layouts).filter(([other])=>other!==id).map(([,p])=>p.mode));
 return !occupied.has(wanted)?wanted:(['right','left','top','bottom','split'] as const).find(p=>!occupied.has(p))||'home';
}
export function snapDock(x:number,y:number,rect:{left:number;top:number;width:number;height:number},distance=42):DockMode|null {
 if(x<rect.left-20||y<rect.top-20||x>rect.left+rect.width+20||y>rect.top+rect.height+20)return null;
 const edges:[DockMode,number][]=[['left',Math.abs(x-rect.left)],['right',Math.abs(x-rect.left-rect.width)],['top',Math.abs(y-rect.top)],['bottom',Math.abs(y-rect.top-rect.height)]];
 edges.sort((a,b)=>a[1]-b[1]);
 if(edges[0][1]<=distance)return edges[0][0];
 if(Math.abs(x-rect.left-rect.width*.65)<55&&Math.abs(y-rect.top-rect.height*.5)<60)return 'split';
 return null;
}
export function boundPanel(p:PanelLayout,width:number,height:number):PanelLayout {
 const w=Math.min(p.width,Math.max(220,width-16)),h=Math.min(p.height,Math.max(140,height-16));
 return {...p,width:w,height:h,x:Math.max(0,Math.min(width-w,p.x)),y:Math.max(0,Math.min(height-h,p.y))};
}
