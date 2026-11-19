/* V10.82: a historic event must remain the exact Heart Moment shown, saved
 * and exported, regardless of previously saved moments or today's index. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
const source=read('assets/js/app_03.js');
const begin=source.indexOf('function dpMomentRows()');
const end=source.indexOf('function dpPosterPath(',begin);
assert(begin>=0&&end>begin,'Heart Moment source functions must stay available');
const today='2026-11-18',past='2026-11-15';
const events={
 [past]:[{minute:100,hr:110,rr:21},{minute:543,hr:114,rr:23}],
 [today]:[{minute:100,hr:80,rr:15},{minute:300,hr:88,rr:16}]
};
const savedPast={date:past,minute:543,hr:114,rr:23};
const savedToday={date:today,minute:100,hr:80,rr:15};
const state={dog:2,dpPetEpoch:5,dpEventDate:past,dpEventIndex:1,dpMomentsByPet:{2:[savedPast,savedToday]}};
const opened=[];
const ctx={state,
 dpEventsFor:day=>events[day]||[],dpSignals:day=>({heart:Array(1440).fill(day===past?112:82),breath:Array(1440).fill(day===past?23:15)}),
 dpAverage:xs=>xs.reduce((a,b)=>a+b,0)/Math.max(1,xs.length),
 iso:()=>today,localDate:()=>new Date(today),demoRecords:()=>[],
 dpCareCommit:(_paths,act)=>{act();return true},openModal:where=>opened.push(where),renderModal:()=>{},toast:()=>{},t:()=>'',
 label3:tw=>tw,dpTime:minute=>String(minute),dpChart:()=>'',Math
};
vm.runInNewContext(source.slice(begin,end),ctx,{filename:'heart_moment_functions.js'});
assert.equal(ctx.dpMomentActiveEvent().date,today,'Without a focus, saved latest is the existing default');
const caseStart=source.indexOf("  case 'dp-event-to-moment':");
const caseEnd=source.indexOf("  case 'dp-solo':",caseStart);
assert(caseStart>=0&&caseEnd>caseStart);
vm.runInNewContext(`function actMoment(action){switch(action){${source.slice(caseStart,caseEnd)}default:break;}}`,ctx);
const countBefore=state.dpMomentsByPet[2].length;
ctx.actMoment('dp-event-to-moment');
assert.equal(state.dpMomentsByPet[2].length,countBefore,'Opening an existing historic event must not duplicate it');
assert.deepEqual(opened,['heart-moment']);
assert.equal(ctx.dpMomentActiveEvent().date,past,'Selected historic date must win over latest saved event');
assert.equal(ctx.dpMomentActiveEvent().minute,543,'Selected historic minute must survive navigation');
assert.equal(ctx.dpMomentStats().e.date,past,'Share/export stats must use the focused date');
assert.match(ctx.dpMomentShareLine(),/2026-11-15/);
assert.equal(ctx.dpMomentCardContext().e.date,past,'Poster must use the exact chosen historic event');
ctx.actMoment('dp-moment-save');
assert.equal(state.dpMomentsByPet[2].length,countBefore,'Saving focused event again must not insert a current-day unrelated event');
assert.equal(state.dpMomentsByPet[2].filter(x=>x.date===today).length,1);
state.dog=3;state.dpPetEpoch=6;
assert.equal(ctx.dpMomentFocusCurrent(),null,'A different pet must not inherit another pet’s event focus');
assert.equal(ctx.dpMomentActiveEvent().date,today);
state.dog=2;state.dpPetEpoch=7;
assert.equal(ctx.dpMomentFocusCurrent(),null,'Switching back to same pet still invalidates old visit focus');
const directStart=source.indexOf(" case 'heart-moment':state.dpMomentFocus=null;");
const directEnd=source.indexOf(" case 'care-detail':",directStart);
assert(directStart>=0&&directEnd>directStart,'Direct Heart Moment entry must clear dated-event context');
vm.runInNewContext(`function actDirect(action){switch(action){${source.slice(directStart,directEnd)}default:break;}}`,ctx);
ctx.actDirect('heart-moment');
assert.equal(state.dpMomentFocus,null);
assert.equal(state.dpEventIndex,0);
const html=read('index.html');
assert.match(html,/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(html,/deeppet-v10101-[a-f0-9]{12}\.css/);
console.log('PASS V10.82: selected historical moment, share and poster stay date/minute-consistent; no duplicate save, no cross-pet focus');
