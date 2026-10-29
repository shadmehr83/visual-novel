import {it,expect,vi,afterEach} from 'vitest';
import {produce,setAutoFreeze} from 'immer';
import {demo} from './demo';
import {providerCompletion} from './aiProviders';
setAutoFreeze(false);afterEach(()=>vi.unstubAllGlobals());
it('shares unchanged media and retains reversible story edits',()=>{const p=demo();const next=produce(p,d=>{d.scenes[0].title='Updated';});expect(next.assets).toBe(p.assets);expect(next.scenes[1]).toBe(p.scenes[1]);expect(p.scenes[0].title).not.toBe('Updated');});
it('routes Claude requests through its server adapter',async()=>{const f=vi.fn().mockResolvedValue(Response.json({content:[{type:'text',text:'{"operations":[]}'}]}));vi.stubGlobal('fetch',f);expect(await providerCompletion('anthropic',{ANTHROPIC_API_KEY:'test'},'JSON only',{})).toContain('operations');expect(f.mock.calls[0][0]).toBe('https://api.anthropic.com/v1/messages');expect(JSON.parse(f.mock.calls[0][1].body).system).toBe('JSON only');});
it('can clone selected mask data inside an immutable edit',async()=>{const {cloneData}=await import('./cloneData');const p=demo();expect(()=>produce(p,d=>{d.scenes[0].effects.mask=cloneData(d.scenes[0].effects.mask);})).not.toThrow();});
