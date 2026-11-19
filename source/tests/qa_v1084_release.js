/* V10.84: past solo periods must use the actual date/channel coverage, and
 * missing activity must never be called a seven-day vitality peak. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
const source=read('assets/js/app_03.js');
const from=source.indexOf('function dpVitalityHours(');
const to=source.indexOf('function dpMomentRows(',from);
assert(from>=0&&to>from);
const today='2026-11-18',yesterday='2026-11-17';
const session={start:yesterday+'T23:00:00.000Z',end:today+'T01:00:00.000Z'};
const sample=(hr,rr)=>({heart:Array(1440).fill(hr),breath:Array(1440).fill(rr),activity:Array(1440).fill(10)});
const previous=sample(80,14),current=sample(82,15);
const snapshots={[yesterday]:previous,[today]:current};
const state={dog:0,dpSoloByPet:{0:[session]}};
const ctx={state,
 iso:d=>d.toISOString().slice(0,10),localDate:()=>new Date(today+'T12:00:00.000Z'),
 dateAdd:(d,n)=>new Date(d.getTime()+n*86400000),
 dpSignals:date=>snapshots[date]||{heart:[],breath:[],activity:[]},
 dpAverage:v=>{const good=v.filter(Number.isFinite);return good.reduce((a,b)=>a+b,0)/Math.max(1,good.length);},
 signalQuality:()=>({valid:false}), // today's status MUST NOT gate historic evidence
 label3:zh=>zh,dpTime:m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`,
 Math,Number,Array,Date
};
vm.runInNewContext(source.slice(from,to),ctx);
const full=ctx.dpSoloSummary(session);
assert.equal(full.minutes,120,'cross-midnight elapsed duration is 120 minutes');
assert.equal(full.coverage,1,'60 minutes from each calendar day are paired');
assert.equal(full.share,100,'historical data remain available when today’s signal check fails');
assert.equal(full.events,0,'truly observed unchanged readings may report zero');
// Lose the second date's heart channel: the previous one-hour subset does NOT
// justify a whole two-hour steady percentage or a "0 events" claim.
snapshots[today]={...current,heart:[]};
const partial=ctx.dpSoloSummary(session);
assert.equal(partial.coverage,.5);
assert.equal(partial.share,null);
assert.equal(partial.events,null);
assert.match(ctx.dpSoloModal(),/這段時間有效心肺與動靜記錄不足/);
assert.match(ctx.dpSoloModal(),/心肺變化<\/small><b>—<\/b>/);
// Reject zero heart rates and missing activity as unpaired minutes.
snapshots[today]={...current,heart:Array(1440).fill(0)};
assert.equal(ctx.dpSoloSummary(session).share,null);
snapshots[today]={...current,activity:[]};
assert.equal(ctx.dpSoloSummary(session).events,null);
// An earlier completed session should work without today's readings at all.
snapshots[yesterday]=previous;
const oldDay={start:yesterday+'T14:00:00.000Z',end:yesterday+'T16:00:00.000Z'};
assert.equal(ctx.dpSoloSummary(oldDay).coverage,1);
assert.equal(ctx.dpSoloSummary(oldDay).share,100);

for(const key of Object.keys(snapshots))delete snapshots[key];
assert.equal(ctx.dpVitalityHours(),'','zero calendar days cannot invent a 00:00 peak');
const dates=Array.from({length:7},(_,i)=>ctx.iso(ctx.dateAdd(ctx.localDate(),-i)));
const move=()=>({heart:[],breath:[],activity:Array.from({length:1440},(_,m)=>m>=840&&m<960?80:10)});
snapshots[dates[0]]=move();snapshots[dates[1]]=move();
assert.equal(ctx.dpVitalityHours(),'','one or two days cannot support a usual seven-day pattern');
snapshots[dates[2]]=move();
assert.match(ctx.dpVitalityHours(),/14:00–16:00/,'three days support the observed peak');
for(const d of dates.slice(0,3))snapshots[d]={heart:[],breath:[],activity:Array(1440).fill(0)};
assert.equal(ctx.dpVitalityHours(),'','zero measured movement is not a misleading active peak');
for(const d of dates.slice(0,3))snapshots[d]={heart:[],breath:[],activity:Array(1440).fill(NaN)};
assert.equal(ctx.dpVitalityHours(),'','nonfinite activity is not a valid observation day');

assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.css/);
console.log('PASS V10.84: dated solo session independent of today, cross-midnight paired coverage, truthful N/A and non-invented seven-day vitality');
