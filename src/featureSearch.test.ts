import {it,expect} from 'vitest';
import {demo} from './demo';
import {featureCatalog,findFeatures} from './searchIndex';
import {activitySetting,activities} from './EffectSummary';
import {makePlacedLight} from './LightLibrary';
it('finds the requested features and real project dialogue without mutating settings',()=>{
 const p=demo(),s=p.scenes[0];s.nodes[0].text='A unique rainlit appointment';
 const before=JSON.stringify(p),index=featureCatalog(p,s);
 expect(findFeatures(index,'active')[0].action).toBe('active');expect(findFeatures(index,'rain on glass')[0]).toMatchObject({action:'effect:Rain',target:'Rain on glass'});
 expect(findFeatures(index,'scenes advanced')[0].action).toBe('scenes');expect(findFeatures(index,'window docking')[0].action).toBe('windows');
 expect(findFeatures(index,'rainlit appointment')[0]).toMatchObject({scene:s.id,node:s.nodes[0].id});
 expect(JSON.stringify(p)).toBe(before);expect(findFeatures(index,'nonexistenttoken891')).toEqual([]);
});
it('routes named local effects to their own settings, separately from their toggles',()=>{
 const p=demo(),s=p.scenes[0],light=makePlacedLight(undefined,250,200);light.name='Desk candle';s.effects.lights=[light];
 const route=findFeatures(featureCatalog(p,s),'Desk candle')[0];expect(route).toMatchObject({action:'effect:Lighting',zone:light.id});
 const before=JSON.stringify(s);expect(activitySetting(s,'glass')).toEqual({action:'effect:Rain',label:'Rain on glass'});expect(activitySetting(s,light.id).zone).toBe(light.id);expect(JSON.stringify(s)).toBe(before);
 const rain=activities(s).find(a=>a.id==='rain')!;const value=s.effects.rain;rain.toggle(s);expect(s.effects.rain).toBe(!value);
});
