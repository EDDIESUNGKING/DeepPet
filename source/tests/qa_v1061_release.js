/* V10.61: low score != emergency; contextual anomaly and tour regression. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const text=f=>fs.readFileSync(path.join(root,f),'utf8');
const A=require('../assets/algorithm/context-alerts-v1061.js');
assert.equal(A.version,'10.61');
const today='2026-11-17',n=1440;
const sample=(heart=80,breath=18,activity=5)=>({heart:Array(n).fill(heart),breath:Array(n).fill(breath),activity:Array(n).fill(activity)});
const d=i=>new Date(Date.parse(today+'T12:00:00Z')-i*86400000).toISOString().slice(0,10);
const history=Array.from({length:14},(_,i)=>({date:d(i+1),valid:true,series:sample()}));
const base=A.baseline(history,today,'heart','day-rest');
assert.equal(base.ready,true);assert.equal(base.eligibleDays,14);assert.equal(base.center,80);
const active=sample();for(let i=540;i<564;i++){active.heart[i]=136;active.breath[i]=33;}
const alerts=A.detect({date:today,series:active,history});
assert(alerts.some(e=>e.kind==='heart'&&e.minute>=540&&e.minute<=563&&e.type==='high'));
assert(alerts.some(e=>e.kind==='breath'&&e.type==='high'));
assert(alerts.every(e=>e.date===today&&e.baselinePhase==='personalized'&&e.baselineDays===14));
assert(alerts.every(e=>e.minute>=540&&e.minute<564),'all anomalies marked at their actual observed minutes');
const walking=sample();for(let i=510;i<580;i++){walking.heart[i]=144;walking.breath[i]=36;walking.activity[i]=76;}
assert.equal(A.detect({date:today,series:walking,history}).length,0,'walking must not be an urgent event');
const recovery=sample();for(let i=510;i<537;i++){recovery.heart[i]=144;recovery.breath[i]=36;recovery.activity[i]=76;}
for(let i=537;i<545;i++){recovery.heart[i]=136;recovery.breath[i]=33;}
assert.equal(A.detect({date:today,series:recovery,history}).length,0,'post-exercise short recovery must not trigger');
const spike=sample();spike.heart[600]=200;spike.breath[600]=51;
assert.equal(A.detect({date:today,series:spike,history}).length,0,'one-minute spike is inadequate');
const missing=sample();for(let i=550;i<560;i++){missing.heart[i]=null;missing.breath[i]=NaN;}
assert.equal(A.detect({date:today,series:missing,history}).length,0,'invalid signal is never an event');
const nightHistory=history.map(h=>({date:h.date,valid:true,series:(()=>{const s=sample();
 for(let i=0;i<420;i++)s.heart[i]=54;for(let i=1260;i<1440;i++)s.heart[i]=54;return s;})()}));
const normalSleep=sample();for(let i=0;i<420;i++)normalSleep.heart[i]=54;
for(let i=1260;i<1440;i++)normalSleep.heart[i]=54;
assert.equal(A.detect({date:today,series:normalSleep,history:nightHistory}).length,0,
 'healthy night-vs-day resting shift is normal for this pet');
const fewer=history.slice(0,6);assert.equal(A.baseline(fewer,today,'heart','day-rest').ready,false);
const modest=sample();for(let i=570;i<595;i++)modest.heart[i]=112;
assert.equal(A.detect({date:today,series:modest,history:fewer}).length,0,'provisional threshold more conservative');
const earliest=sample();for(let i=650;i<680;i++){earliest.heart[i]=170;earliest.breath[i]=41;}
assert(A.detect({date:today,series:earliest,history:[]}).some(e=>e.kind==='heart'&&
 e.baselinePhase==='provisional'&&e.baselineDays===0),
 'before 14 days, sufficiently large sustained quiet changes can use a conservative same-day reference');
const before=A.detect({date:today,series:active,history});
assert.deepEqual(A.detect({date:today,series:active,history:[...history,{date:d(-1),valid:true,series:sample(200,55)}]}),before,
 'future readings must never change a historical alert');
assert.equal(A.detect({date:today,series:sample(),history}).length,0,
 'a low daily score elsewhere cannot create a timed alert without the deviation');

// Adapter owner/isolation and real-SDK fallback. The real mode must not call
// synthetic dpSignals() even when a showcase score remains in memory.
const state={dog:7,lang:'zht',tourStep:3,emptyPreview:false,petOverrides:{},baselineDaysByPet:{}};
const dog=()=>({dpFixtureInvalidated:false,dpFreshPet:false,freeCare:false});
const records=Array.from({length:30},(_,i)=>({date:d(29-i)}));
const ctx={state,window:null,DeepPetContextAlertAlgorithm1061:A,
 dogs:Array(15).fill(0).map(dog),allPets:()=>Array(15).fill(0).map(dog),
 demoRecords:()=>records,validDaySample:()=>({valid:true}),dpUsesRealMeasurements:()=>false,
 dpSignals:()=>sample(),DeepPetUX1059:{combineCoincident:v=>v}};
ctx.window=ctx;vm.runInNewContext(text('assets/js/ux_v1061.js'),ctx);
assert.equal(state.tourStep,0,'restart tour even if local storage retained stage four');
assert.equal(ctx.DeepPetContextAlerts1061.forCurrentPet(today,{date:today}).length,0);
state.dog=17;assert.deepEqual(Array.from(ctx.DeepPetContextAlerts1061.forCurrentPet(today,{date:today})),[],'new pet may not reuse gallery traces');
state.dog=7;ctx.dpUsesRealMeasurements=()=>true;
assert.equal(ctx.DeepPetContextAlerts1061.forCurrentPet(today,{date:today}).length,0,'unverified real score is rejected');
ctx.DeepPetSignalScoring={getFeatures:()=>[{source:'20hz-waveform',date:today}],isVerifiedWear:()=>true};
assert.equal(ctx.DeepPetContextAlerts1061.forCurrentPet(today,{date:today,source:'20hz-waveform',integrity:{realEvidenceValid:true}}),null,
 'valid real score with no genuine minute series falls back to verified SDK events');
assert.match(text('assets/js/ux_v935.js'),/if\(a==='tour'\)\{[^}]*state\.tourStep=0/);
assert.match(text('assets/js/app_03.js'),/\.\.\.stored,tourStep:0/);
assert.match(text('assets/js/app_03.js'),/chartPoint,tourStep,signalQualityByPet/);
assert.match(text('assets/js/ux_v1037.js'),/dp1061-feature-hero/);
assert.match(text('assets/js/ux_v1037.js'),/<strong>24\/7<\/strong>/);
assert.match(text('assets/js/ux_v1060.js'),/combineForHome\(timed,\[\],rapid\)/,'historical low-score injection must remain retired');
assert.match(text('assets/js/ux_v1060.js'),/DeepPetEventTriage1075/,'verified events use the new triage gate');
assert.equal(text('VERSION.txt').trim(),'DeepPet V10.101');
const html=text('index.html');
assert.match(html,/deeppet-v10101-[a-f0-9]{12}\.css/);
assert.match(html,/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log('PASS V10.61: day/night individual baselines, exercise and short-spike rejection, prior-only 14-day conditioning, exact time, owner isolation, tour stage-one reset.');
