import {it,expect} from 'vitest';
import {snapDock,restoreDock,panelLayout,boundPanel,type DockLayouts} from './docking';
import {workspaceSchema} from './workspace';
it('snaps near workspace edges and the split target, and ignores unrelated positions',()=>{
 const rect={left:100,top:160,width:1000,height:700};
 expect(snapDock(108,450,rect)).toBe('left');expect(snapDock(1090,450,rect)).toBe('right');expect(snapDock(600,165,rect)).toBe('top');expect(snapDock(600,855,rect)).toBe('bottom');
 expect(snapDock(750,510,rect)).toBe('split');expect(snapDock(450,350,rect)).toBeNull();expect(snapDock(30,450,rect)).toBeNull();
});
it('restores the prior dock or chooses the next free slot without displacing another panel',()=>{
 const p=panelLayout({},'dialogue');const layouts:DockLayouts={dialogue:{...p,mode:'float',returnTo:'left'}};
 expect(restoreDock(layouts,'dialogue')).toBe('left');layouts.library={...p,mode:'left'};expect(restoreDock(layouts,'dialogue')).toBe('right');
 for(const mode of ['right','top','bottom','split'] as const)layouts[mode]={...p,mode};expect(restoreDock(layouts,'dialogue')).toBe('home');
 expect(layouts.library.mode).toBe('left');
});
it('keeps floating windows reachable after viewport changes and roundtrips docking preferences',()=>{
 const p={...panelLayout({},'preview'),mode:'float' as const,x:1700,y:1000,width:1000,height:700};
 const small=boundPanel(p,800,600);expect(small.x+small.width).toBeLessThanOrEqual(800);expect(small.y+small.height).toBeLessThanOrEqual(600);
 expect(workspaceSchema.parse({docks:{preview:small}}).docks.preview).toEqual(small);
 expect(()=>workspaceSchema.parse({docks:{preview:{...small,width:9999}}})).toThrow();
});
