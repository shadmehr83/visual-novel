import {it,expect} from 'vitest';
import {savedProject} from './savedProject';
import {advance,start} from './model';
import {deviceDialogue} from './interactions';
it('never records room exploration as texts and only activates authored chat',()=>{const p=savedProject();let r={...start(p),node:'room'};r=advance(p,r,'monitor-19');expect(r.phoneMessages||[]).toEqual([]);const s=p.scenes[0];expect(deviceDialogue(s,s.nodes.find(n=>n.id==='cycle')!)).toBe(false);const chat=p.scenes[1];expect(deviceDialogue(chat,chat.nodes.find(n=>n.speaker===chat.phone!.contact)!)).toBe(true);});
it('respects an explicit texting range and per-dialogue overrides',()=>{const p=savedProject(),s=p.scenes[1];s.phone!.dialogueRange={enabled:true,start:s.nodes[2].id,end:s.nodes[4].id};const n=s.nodes[1];n.deviceScreen='chat';expect(deviceDialogue(s,n,[n.id])).toBe(false);n.deviceDialogue=true;expect(deviceDialogue(s,n,[n.id])).toBe(true);n.deviceDialogue=false;expect(deviceDialogue(s,n,[s.nodes[2].id,n.id])).toBe(false);});
