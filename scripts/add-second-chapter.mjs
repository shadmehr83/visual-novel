// An editable draft continuation based on the source bible's continuity ledger.
// Run once when authoring the release; never overwrites an existing chapter setup.
import {readFile,writeFile} from 'node:fs/promises';
const file='projects/published.stillframe.json',p=JSON.parse(await readFile(file,'utf8'));
if(p.chapters?.length)throw Error('Chapters already exist; edit them in the studio.');
const originalIds=p.scenes.map(s=>s.id),bedroom=p.scenes.find(s=>s.id==='bedroom');
const n=(id,speaker,text,next,choices=[])=>({id,speaker,text,...(next?{next}:{}),choices,deviceVisible:false});
const choice=(id,text,target)=>({id,text,target,actions:[],note:'Chapter-two opening draft. Editable in Dialogue advanced.',sendAsMessage:false});
const ending='CHAPTER TWO · OPENING DRAFT\n\nThe rest of this chapter is not written yet. Continue authoring from this scene.';
function scene(id,title,lines,phone=false){
 const s=structuredClone(bedroom);s.id=id;s.title=title;s.subtitle='BEDROOM · THE NEXT MORNING';s.nodes=lines;s.entry=[];s.transition={style:'fade',seconds:.8};
 for(const key of ['subscenes','camera','items','exitTransition','effectBackup','keyframes','keyframesEnabled'])delete s[key];
 s.joints=[];s.sprites=[];
 if(phone){s.phone={...structuredClone(bedroom.phone),defaultScreen:'chat',entrance:{style:'slide',seconds:.5},typingSeconds:.65};for(const key of ['schedule','returnControl','dialogueRange'])delete s.phone[key];}
 else delete s.phone;
 p.scenes.push(s);return s;
}
function conversation(id,title,intro,message,responses){
 const first=n('morning','Narrator',intro,undefined,[choice('read','Read the message','message'),choice('later','Leave it until later','later')]);
 const msg={...n('message','Maria',message,undefined,responses.map((text,i)=>({...choice('reply-'+i,text,'reply-'+i),sendAsMessage:true}))),deviceVisible:true,deviceScreen:'chat'};
 const replies=responses.map((_,i)=>({...n('reply-'+i,'Maria',i===0?'That works for me. No need to settle the whole week before breakfast.':'Of course. Talk when you feel like it.','end'),deviceVisible:true,deviceScreen:'chat'}));
 return scene(id,title,[first,msg,...replies,n('later','Narrator','I set the phone down. Replying later does not turn a good conversation into a broken promise.','end'),n('end','Narrator',ending)],true);
}
conversation('chapter2-warm','A small reason to smile','Morning light finds the same room. Yesterday was a date, not a promise about everything after it. Still, I catch myself checking the phone.','Morning. I was going to send a very composed message, but I put my tea beside the kettle and forgot to make it. Strong start.', ['A good start by my standards. How is the tea situation now?','Morning. I have a few things to do first; I’ll message later.']);
conversation('chapter2-slow','Room to take it slowly','The café was real. I am still working out what I want from another meeting. This morning does not need to turn either of those things into a decision.','Morning. No need to make plans today. I hope the rest of your evening was all right.',['It was. I liked talking; I’m still figuring out the rest.','Thanks. I’d like a quiet morning; I’ll reply when I’m ready.']);
scene('chapter2-goodbye','A goodbye can stay a goodbye',[
 n('morning','Narrator','The next morning, there is no new message from Maria. I said I did not think it was a match. She heard me.',undefined,[choice('day','Get on with my day','day'),choice('remember','Think about the evening for a moment','remember')]),
 n('remember','Narrator','I can remember the warmth of the café without turning it into a reason to go back. A pleasant evening does not owe anybody a sequel.','end'),
 n('day','Narrator','There are ordinary things waiting: a book left open, a cup to wash, people I can make plans with. The day is still mine.','end'),n('end','Narrator',ending)
]);
conversation('chapter2-deferred','An open conversation','No café table to replay this morning. We agreed to keep talking rather than fit an afternoon into a calendar invitation. That is all we agreed to.','Morning. I found a horror film with a review that just says “technically a film.” A powerful recommendation.',['That sounds like an excellent use of a bad review.','Morning. I’m keeping today fairly quiet. Maybe we can talk later.']);
scene('chapter2-declined','A day without an appointment',[
 n('morning','Narrator','I chose not to meet yesterday. The room is the same this morning; there is no date to reconstruct and no apology waiting to be written.',undefined,[choice('day','Make a plan for myself','day'),choice('quiet','Keep the morning quiet','quiet')]),
 n('day','Narrator','A walk, perhaps. A message to someone I already know. I do not need to turn saying no to one thing into saying no to everything.','end'),
 n('quiet','Narrator','I leave the phone face down and open a book. Nothing has happened that needs correcting.','end'),n('end','Narrator',ending)
]);
scene('chapter2-quiet','The day carries on',[
 n('morning','Narrator','Morning arrives without making a plan for me. The street outside is already carrying on.',undefined,[choice('window','Stand by the window','window'),choice('book','Pick up the book','book')]),
 n('window','Narrator','People pass with bags, umbrellas, somewhere to be. I could go out later. For now, it is enough to notice them.','end'),
 n('book','Narrator','The bookmark is still on the same page. Some things are willing to wait without announcing it.','end'),n('end','Narrator',ending)
]);
const openings=p.scenes.filter(s=>!originalIds.includes(s.id));
const condition=(key,value)=>({key,op:'eq',value});
const rule=(id,label,scene,conditions,match='all')=>({id,label,scene,conditions,match});
p.chapters=[{
 id:'chapter-one',title:'The First Match',notes:'Original bedroom-to-café demo and its non-date branches. Completing a marked ending carries the actual story state into chapter two.',scenes:originalIds,startScene:originalIds[0],starts:[],next:'chapter-two',
 exits:[{scene:'bedroom',node:'stay'},{scene:'invitation',node:'deferred'},{scene:'invitation',node:'declined'},{scene:'journey',node:'turn-home'},{scene:'departure',node:'end'}]
},{id:'chapter-two',title:'The Space Between Messages',notes:'EDITABLE OPENING DRAFT. The source bible stops at the first date. These six starter scenarios extend its continuity rules without inventing evidence of danger, forcing another date, or overwriting the player’s impression. Slow and uncertain second-date answers share one cautious opening; declining a second date differs from not meeting at all. Only opening scenes are drafted.',scenes:openings.map(s=>s.id),startScene:'chapter2-quiet',
 starts:[rule('warm','Wants to meet again','chapter2-warm',[condition('second_meeting_interest','yes')]),rule('slow','Taking time or still uncertain','chapter2-slow',[condition('second_meeting_interest','slow'),condition('second_meeting_interest','uncertain')],'any'),rule('goodbye','Declined a second meeting','chapter2-goodbye',[condition('second_meeting_interest','no')]),rule('declined','Declined or cancelled the first date','chapter2-declined',[condition('date_declined',true)]),rule('deferred','Chose to keep chatting instead','chapter2-deferred',[condition('date_deferred',true)])],
 exits:openings.map(s=>({scene:s.id,node:'end'}))
}];
for(const s of p.scenes.filter(s=>originalIds.includes(s.id)))for(const row of s.nodes)row.text=row.text.replace('END OF DEMO — THE FIRST MATCH','END OF CHAPTER ONE — THE FIRST MATCH');
(p.contentUpdates??=[]).push('2.11.0');
await writeFile(file,JSON.stringify(p,null,2)+'\n');
console.log('Added chapter metadata and six draft openings. Preserved existing scene visuals and media.');
