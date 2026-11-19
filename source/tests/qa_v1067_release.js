/* DeepPet V10.73: independent six-second threshold proof and honest timestamps. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const Rapid=require('../assets/algorithm/rapid-events-v1062.js');
const id='v1067-real-pet',start=Date.UTC(2026,10,17,9,30,0);
const engine=Rapid.create({petId:id,referenceProvider:()=>({source:'computed_14day',verified:true,
 validDays:14,petId:id,context:'rest',heart:80,breath:20})});
let real=null;
for(let i=0;i<96;i++){
 const frame={petId:id,startEpochMs:start+i*1000,date:'2026-11-17',
  connected:true,qualityVerified:true,contextVerified:true,activityContext:'rest'};
 const live={petId:id,at:start+i*1000,context:'rest',contextEvidence:'verified',
  signalSettled:true,metrics:{heart:i>=90?146:80,breath:20}};
 real=engine.update(frame,live)||real;
}
assert(real,'Genuine reference-aware 6-second event must exist');
assert.equal(real.observations[0].threshold,116,'Actual event retains its exact detection threshold');
const state={dog:0,lang:'zht',tab:'home',detail:null,emptyPreview:false,dpRapidEventsByPet:{}};
const ctx={window:null,state,dpCurrentPetId:()=>id,render:()=>{},persist:()=>true,
 selectedBlank:()=>false,dp58FreshPet:()=>false,isFreePet:()=>false,
 document:{getElementById:()=>null},console};ctx.window=ctx;
vm.runInNewContext(read('assets/js/ux_v1062.js'),ctx);
const occurred={...real,date:'2026-11-17',localSecond:9*3600+31*60+35,timezoneOffsetMinutes:0};
assert.equal(ctx.DeepPetUrgentEvents1062.capture(occurred),true,'Original source-proven event saved');
const corrupted=real.evidence.map((v,i)=>i===real.evidence.length-2?{...v,heart:80}:v);
assert.equal(ctx.DeepPetUrgentEvents1062.capture({...occurred,evidence:corrupted}),false,
 'All claimed consecutive seconds must cross the actual recorded threshold, not just final point');
assert.equal(ctx.DeepPetUrgentEvents1062.capture({...occurred,observations:real.observations.map(o=>({
  ...o,threshold:undefined}))}),false,'Absent archived threshold cannot claim independently verified event');
assert.equal(ctx.DeepPetUrgentEvents1062.capture({...occurred,observations:[...real.observations,
  {kind:'breath',type:'high',value:40,baseline:20,threshold:34}]}),false,
 'A second metric cannot be attached unless its own six seconds cross its threshold');
assert.equal(ctx.DeepPetUrgentEvents1062.capture({...occurred,observations:[...real.observations,
  {kind:'heart',type:'low',value:60,baseline:80,threshold:45}]}),false,
 'One instant cannot be recorded as both high and low for the same channel');
assert.equal(ctx.DeepPetUrgentEvents1062.capture({...occurred,timezoneOffsetMinutes:null}),true,
 'A valid device-reported local time may be retained without falsely claiming timezone verification');
ctx.render=()=>{};state.tab='deep';state.detail='dp90-waveform';
vm.runInNewContext(read('assets/js/ux_v1065.js'),ctx);
const confirmed={...occurred};
assert.match(ctx.DeepPetUX1065.evidencePanel(confirmed),/時間已核對/);
assert.match(ctx.DeepPetUX1065.evidencePanel({...confirmed,timezoneOffsetMinutes:null}),/設備回報時間/);
for(const lang of ['en','ja','ko','zh']){
 state.lang=lang;
 const verified=ctx.DeepPetUX1065.evidencePanel(confirmed),unverified=ctx.DeepPetUX1065.evidencePanel({...confirmed,timezoneOffsetMinutes:null});
 assert(verified!==unverified,`${lang}: source time provenance must be distinguishable`);
}
// Real SDK delivery must be failure-isolated: the owner's archival path
// remains alive if a third-party notification hook throws, and vice versa.
globalThis.DeepPetWearReadiness1044=require('../assets/algorithm/wear-readiness-v1044.js');
globalThis.DeepPetSecondStream1045=require('../assets/algorithm/second-by-second-v1045.js');
globalThis.DeepPetRapidEvents1062=Rapid;
const SDK=require('../assets/algorithm/sdk20hz-adapter.js');
const wave=(i,p)=>Array.from({length:20},(_,j)=>Math.sin((i*20+j)/p));
const feed=(session)=>{
 for(let i=0;i<96;i++){
  const at=start+i*1000;
  const metrics=(value,seconds)=>({verified:true,source:'verified_sdk',petId:id,
   context:'rest',observedEndEpochMs:at,observedSeconds:seconds,value});
  session.pushSecond({petId:id,startEpochMs:at,date:'2026-11-17',startLocalSecond:9*3600+30*60+i,
   timezoneOffsetMinutes:0,connected:true,qualityVerified:true,contextVerified:true,
   activityContext:'rest',heartWave:wave(i,5),breathWave:wave(i,24),motionWave:Array(20).fill(0),
   sdkMetrics:{heart:metrics(i>=90?146:80,12),breath:metrics(20,30)}});
 }
};
const ref=()=>({source:'computed_14day',verified:true,validDays:14,petId:id,
 context:'rest',heart:80,breath:20});
let saved=0,delivered=0,errors=0;
globalThis.DeepPetUrgentEvents1062={capture:()=>{saved++;return true;}};
feed(SDK.createSession({petId:id},{referenceProvider:ref,
 onAcuteCandidate:()=>{throw Error('host_notification_failed');},onAcuteError:()=>errors++}));
assert.equal(saved,1,'An external callback failure cannot erase the local event');
assert.equal(errors,1,'Notification failure is surfaced to error reporting');
globalThis.DeepPetUrgentEvents1062={capture:()=>{throw Error('local_storage_failed');}};
feed(SDK.createSession({petId:id},{referenceProvider:ref,
 onAcuteCandidate:()=>delivered++,onAcuteError:()=>errors++}));
assert.equal(delivered,1,'A local storage failure cannot suppress the external alert callback');
assert.equal(errors,2,'Storage failure is reported independently');
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log('PASS V10.67: archived threshold independently proves all consecutive seconds; five-language clock provenance');
