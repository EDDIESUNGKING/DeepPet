/* DeepPet V10.45: 20 Hz data EVERY second, evidence-gated outputs, separate
 * activity contexts, authentic 14-day context reference, and strict fault vs
 * physiological anomaly isolation. No physical SDK is assumed. */
'use strict';
const assert=require('node:assert/strict');
globalThis.DeepPetWearReadiness1044=require('../assets/algorithm/wear-readiness-v1044.js');
const S=require('../assets/algorithm/second-by-second-v1045.js');
globalThis.DeepPetSecondStream1045=S;
const SDK=require('../assets/algorithm/sdk20hz-adapter.js');
const start=Date.UTC(2026,10,16,0,0,0),id='Milo-verified';
const wave=(i,scale)=>Array.from({length:20},(_,j)=>Math.sin((i*20+j)/scale));
const metric=(name,value,i,context='rest',petId=id)=>({verified:true,source:'verified_sdk',petId,context,
 observedEndEpochMs:start+i*1000,observedSeconds:name==='heart'?12:name==='breath'?30:60,value});
const frame=(i,overrides={})=>({petId:id,connected:true,qualityVerified:true,contextVerified:true,
 activityContext:'rest',startEpochMs:start+i*1000,date:'2026-11-16',startLocalSecond:i,
 heartWave:wave(i,5),breathWave:wave(i,25),motionWave:Array(20).fill(0),
 sdkMetrics:{heart:metric('heart',82,i),breath:metric('breath',19,i),
  rmssd:metric('rmssd',40,i),sdnn:metric('sdnn',60,i),nnvgr:metric('nnvgr',.5,i)},...overrides});
const s=S.create({petId:id});
let heartFirst=null,breathFirst=null,hrvFirst=null,rolling=0;
for(let i=0;i<75;i++){
 const out=s.update(frame(i));
 assert.equal(out.samplingIntervalSeconds,1);
 assert.equal(out.at,start+i*1000);
 if(i===0)assert.equal(out.metrics.heart,null,'first second is analyzed but no reliable number yet');
 if(out.metrics.heart!==null){heartFirst??=i;rolling++;}
 if(out.metrics.breath!==null)breathFirst??=i;
 if(out.metrics.rmssd!==null)hrvFirst??=i;
 if(i>=38)assert.equal(out.metrics.breath,19,'rolling respiratory rate updates EACH subsequent second');
}
assert(heartFirst>=12&&heartFirst<=20,`heart window appeared at ${heartFirst}s`);
assert(breathFirst>=30&&breathFirst<=38,`respiratory window appeared at ${breathFirst}s`);
assert(hrvFirst>=60&&hrvFirst<=68,`HRV window appeared at ${hrvFirst}s`);
assert(rolling>50,'steady readings are processed each second, not periodically');

const stale=S.create({petId:id});
for(let i=0;i<45;i++){
 const f=frame(i);if(i>=35)f.sdkMetrics.breath={...f.sdkMetrics.breath,observedEndEpochMs:start+(i-4)*1000};
 const o=stale.update(f);if(i>=35)assert.equal(o.metrics.breath,null,'stale metric cannot become fresh via new waveform');
}
const misowned=S.create({petId:id});
assert.throws(()=>misowned.update(frame(0,{petId:'Other'})),/pet_identity_mismatch/);

const abrupt=S.create({petId:id});
for(let i=0;i<72;i++)abrupt.update(frame(i));
let zero=abrupt.update(frame(72,{heartWave:Array(20).fill(0),breathWave:Array(20).fill(0)}));
assert.equal(zero.metrics.heart,null,'flat contacts are NOT a measured heart rate of zero');
assert.equal(zero.acuteCandidate,null,'flat signals cannot raise a cardiopulmonary event');
zero=abrupt.update(frame(73,{connected:false}));
assert.equal(zero.metrics.breath,null);
assert.equal(zero.reason,'radio_unavailable');
assert.equal(abrupt.update(frame(74)).metrics.heart,null,'reconnect must settle again');

const history=Array.from({length:14},(_,i)=>({petId:id,date:new Date(start-(i+1)*86400000).toISOString().slice(0,10),
 context:'rest',source:'verified_sdk',verified:true,verifiedMinutes:30,heart:80+(i%3),breath:19+(i%3)}));
const ref=S.buildContextReference({petId:id,context:'rest',at:start,history});
assert.equal(ref.validDays,14);assert.equal(ref.context,'rest');assert.equal(ref.source,'computed_14day');
assert.equal(S.buildContextReference({petId:id,context:'sleep',at:start,history}),null,'sleep cannot borrow quiet reference');
assert.equal(S.buildContextReference({petId:id,context:'rest',at:start,history:history.slice(1)}),null);
assert.equal(S.buildContextReference({petId:'Other',context:'rest',at:start,history}),null);
assert.equal(S.buildContextReference({petId:id,context:'rest',at:start,history:[...history,{...history[0],heart:150}]}),null,
 'contradictory copies of a historical date must not be selected silently');
assert.equal(S.buildContextReference({petId:id,context:'rest',at:start,history:history.map(x=>({...x,verifiedMinutes:10}))}),null);
assert.equal(S.buildContextReference({petId:id,context:'rest',at:start,history:history.map(x=>({...x,source:'gallery'}))}),null);

const high=S.create({petId:id,referenceProvider:()=>ref});let alerts=0;
for(let i=0;i<90;i++){
 const f=frame(i);if(i>=70){f.sdkMetrics.heart.value=140;f.sdkMetrics.breath.value=42;}
 const o=high.update(f);if(o.acuteCandidate)alerts++;
 if(i<84)assert.equal(o.acuteCandidate,null,'single-second spike and first 14s do not raise an event');
}
assert(alerts>=1,'15s of BOTH qualified, context-matched channels creates a non-diagnostic candidate');
const highAtFitting=S.create({petId:id,referenceProvider:()=>ref});
for(let i=0;i<90;i++){
 const f=frame(i);f.sdkMetrics.heart.value=140;f.sdkMetrics.breath.value=42;
 assert.equal(highAtFitting.update(f).acuteCandidate,null,'immediately high after first contact is not a proven sudden rise');
}
const lowBreath=S.create({petId:id,referenceProvider:()=>ref});let mixed=false;
for(let i=0;i<92;i++){
 const f=frame(i);if(i>=70){f.sdkMetrics.heart.value=140;f.sdkMetrics.breath.value=7;}
 const o=lowBreath.update(f);if(o.acuteCandidate?.direction==='hr_high_rr_low')mixed=true;
}
assert(mixed,'non-zero, source-verified low breathing plus high HR is considered without confusing it with flat signal');
const bogus=S.create({petId:id,referenceProvider:()=>({...ref,source:'unverified'})});
for(let i=0;i<90;i++){
 const f=frame(i);if(i>=70){f.sdkMetrics.heart.value=140;f.sdkMetrics.breath.value=42;}
 assert.equal(bogus.update(f).acuteCandidate,null,'an unverified baseline cannot trigger an alert');
}
const onlyHeart=S.create({petId:id,referenceProvider:()=>ref});
for(let i=0;i<90;i++){
 const f=frame(i);if(i>=70)f.sdkMetrics.heart.value=140;
 assert.equal(onlyHeart.update(f).acuteCandidate,null,'single-channel HR alone cannot be a COMBINED emergency');
}

const contexts=S.create({petId:id,referenceProvider:()=>ref});
for(let i=0;i<67;i++)contexts.update(frame(i));
for(let i=67;i<77;i++){
 const f=frame(i,{activityContext:'active',sdkMetrics:{}});
 const o=contexts.update(f);assert.equal(o.acuteCandidate,null);
}
let recovery=false,restAfter=false;
for(let i=77;i<220;i++){
 const o=contexts.update(frame(i));
 if(o.context==='recovery'){recovery=true;assert.equal(o.acuteCandidate,null,'post-exercise is not sleeping/quiet alert');}
 if(i>=200&&o.context==='rest')restAfter=true;
}
assert(recovery,'two-minute recovery class exists');assert(restAfter,'context returns to rest after recovery');

const updates=[],historyStatus=[];const sdk=SDK.createSession({petId:id},{connected:true,
 onSecondUpdate:s=>updates.push(s),onSignalReadiness:s=>historyStatus.push(s)});
for(let i=0;i<63;i++)sdk.pushSecond(frame(i));
assert.equal(updates.length,63,'63 independent one-second callbacks');
assert.equal(sdk.status.pendingChunks,2,'each 30 good consecutive seconds is written to historical buffer');
assert.equal(sdk.status.pendingVerifiedSeconds,3);
assert(historyStatus.length>=30);
sdk.pushSecond(frame(63,{connected:false}));
assert.equal(sdk.status.pendingVerifiedSeconds,0,'disconnect discards partial 30s historical segment');
assert.equal(sdk.status.perSecondStream.signalSettled,false);
assert.equal(sdk.pushSecond(frame(64)).historyChunkSaved,false);
assert.throws(()=>sdk.pushSecond(frame(64)),/duplicate_or_backward/);
assert.equal(sdk.status.petId,id);
console.log('PASS DeepPet V10.45: 1s×20Hz, qualified 12/30/60s, four contexts, 14 verified distinct days, owner/source isolation, broken signal, 15s joint trends, 30s history aggregation.');
