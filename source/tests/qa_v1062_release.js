/* V10.62 research smoke tests: seconds-level acute candidate + owner-only Home. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
const Rapid=require('../assets/algorithm/rapid-events-v1062.js');
assert.equal(Rapid.version,'10.62');
const id='DP-210001',at0=Date.UTC(2026,10,17,2,0,0);
const ref={source:'computed_14day',verified:true,validDays:14,petId:id,context:'rest',heart:80,breath:20};
const baseline=()=>ref;
const frame=(i,attrs={})=>({petId:id,startEpochMs:at0+i*1000,connected:true,qualityVerified:true,
 contextVerified:true,activityContext:'rest',date:'2026-11-17',startLocalSecond:7200+i,...attrs});
const live=(i,h=80,b=20,attrs={})=>({petId:id,at:at0+i*1000,signalSettled:true,context:'rest',
 contextEvidence:'verified',metrics:{heart:h,breath:b},...attrs});
function run(changes={},options={}){const s=Rapid.create({petId:id,referenceProvider:options.ref===undefined?baseline:options.ref});const hits=[];
 for(let i=0;i<(options.length||110);i++){
  const row=changes[i]||{};const e=s.update(frame(i,row.frame||{}),live(i,row.heart??80,row.breath??20,row.live||{}));
  if(e)hits.push(e);
 }return hits;}
const high=run(Object.fromEntries(Array.from({length:6},(_,j)=>[90+j,{heart:146}])),{length:96});
assert.equal(high.length,1,'six qualified seconds trigger with no daily score');
assert.equal(high[0].observations[0].kind,'heart');assert.equal(high[0].at,at0+95000);
assert.equal(high[0].phase,'personalized_14day');
assert.equal(run({90:{heart:225},91:{heart:80}},{length:100}).length,0,'one-second spike rejected');
const suddenBreath=run(Object.fromEntries(Array.from({length:6},(_,j)=>[90+j,{breath:42}])),{length:96});
assert.equal(suddenBreath.length,1,'breath alone does not require high HR');
assert.equal(suddenBreath[0].observations[0].kind,'breath');
const combined=run(Object.fromEntries(Array.from({length:6},(_,j)=>[90+j,{heart:146,breath:42}])),{length:96});
assert.equal(combined.length,1);assert.equal(combined[0].observations.length,2,'coincident rate changes combined');
const lowHeart=run(Object.fromEntries(Array.from({length:6},(_,j)=>[90+j,{heart:42}])),{length:96});
assert.equal(lowHeart.length,1);assert.equal(lowHeart[0].observations[0].type,'low');
const noReference=run(Object.fromEntries(Array.from({length:6},(_,j)=>[90+j,{heart:150}])),{ref:()=>null,length:96});
assert.equal(noReference.length,1);assert.equal(noReference[0].phase,'provisional_quiet_reference');
assert.equal(run(Object.fromEntries(Array.from({length:6},(_,j)=>[35+j,{heart:200}])),{ref:()=>null,length:45}).length,0,
 'no alert without enough prior verified quiet observations');
const weak=Object.fromEntries(Array.from({length:10},(_,j)=>[90+j,{heart:200,frame:{qualityVerified:false}}]));
assert.equal(run(weak,{length:105}).length,0,'unverified contact invalidates fast events');
const exercise=Object.fromEntries(Array.from({length:20},(_,j)=>[80+j,{heart:200,breath:58,frame:{activityContext:'active'},live:{context:'active'}}]));
assert.equal(run(exercise,{length:110}).length,0,'exercise does not generate acute rest-time events');
const recentlyActive={};for(let i=75;i<81;i++)recentlyActive[i]={heart:180,frame:{activityContext:'active'},live:{context:'active'}};
for(let i=82;i<95;i++)recentlyActive[i]={heart:180};
assert.equal(run(recentlyActive,{length:100}).length,0,'post-exercise recovery does not masquerade as a sudden quiet-time event');
const signalLoss=Object.fromEntries(Array.from({length:8},(_,j)=>[90+j,{heart:200,breath:60,frame:{connected:false},live:{signalSettled:false}}]));
assert.equal(run(signalLoss,{length:104}).length,0,'no collar != apnea');
assert.throws(()=>Rapid.create({petId:id}).update(frame(1),{...live(1),petId:'other'}),/identity/);

// SDK 20Hz integration: the old 5-minute path isn't the gate for a 6-sec
// candidate, and the paired owner's callback receives both metrics and time.
globalThis.DeepPetWearReadiness1044=require('../assets/algorithm/wear-readiness-v1044.js');
globalThis.DeepPetSecondStream1045=require('../assets/algorithm/second-by-second-v1045.js');
globalThis.DeepPetRapidEvents1062=Rapid;
const SDK=require('../assets/algorithm/sdk20hz-adapter.js');
const wave=(i,period)=>Array.from({length:20},(_,j)=>Math.sin((i*20+j)/period));
const metric=(name,value,i)=>({verified:true,source:'verified_sdk',petId:id,context:'rest',
 observedEndEpochMs:at0+i*1000,observedSeconds:name==='heart'?12:30,value});
const sdkFrame=(i,h,b)=>({...frame(i),heartWave:wave(i,5),breathWave:wave(i,24),motionWave:Array(20).fill(0),
 sdkMetrics:{heart:metric('heart',h,i),breath:metric('breath',b,i)}});
const callbacks=[],sdk=SDK.createSession({petId:id},{referenceProvider:baseline,onAcuteCandidate:e=>callbacks.push(e)});
for(let i=0;i<100;i++)sdk.pushSecond(sdkFrame(i,i>=90?145:80,20));
assert.equal(callbacks.filter(x=>x.source==='verified_second_stream').length,1,'SDK immediate six-second verified heart alert');
assert.equal(callbacks[0].localSecond,7295);assert.equal(callbacks[0].secondsConfirmed,6);

const state={dog:0,tab:'home',lang:'zht',emptyPreview:false,dpRapidEventsByPet:{}};
const fakeNode=()=>({className:'',dataset:{},innerHTML:'',textContent:'',append(){},remove(){},querySelector(){return null;}});
const appended=[];const panel={dataset:{},querySelectorAll:()=>[],querySelector:()=>null,append:x=>appended.push(x)};
const ctx={window:null,state,render:()=>{},persist:()=>true,dpCurrentPetId:()=>id,
 selectedBlank:()=>false,dp58FreshPet:()=>false,isFreePet:()=>false,
 document:{addEventListener:()=>{},querySelector:()=>panel,createElement:fakeNode},iso:()=> '2026-11-17',localDate:()=>({}),
 dpUsesRealMeasurements:()=>true,DeepPetContextAlerts1061:{forCurrentPet:()=>[]},DeepPetSignalScoring:{getDaily:()=>[]},
 DeepPetUX1059:{alertMarkup:()=>''}};ctx.window=ctx;
vm.runInNewContext(read('assets/js/ux_v1062.js'),ctx);
vm.runInNewContext(read('assets/js/ux_v1060.js'),ctx);
const candidate={...high[0],date:'2026-11-17',localSecond:7295};
assert.equal(ctx.DeepPetUrgentEvents1062.capture(candidate),true);
assert.match(appended.at(-1).innerHTML,/2026-11-17 02:01:35/);
assert.match(appended.at(-1).innerHTML,/data-second="35"/);
assert.match(appended.at(-1).innerHTML,/心率突然升至/);
assert.equal(ctx.DeepPetUrgentEvents1062.forCurrentPet('2026-11-17').length,1);
state.dog=1;ctx.dpCurrentPetId=()=> 'DP-210002';ctx.render();
assert.equal(ctx.DeepPetUrgentEvents1062.forCurrentPet('2026-11-17').length,0,'no cross-pet event');
assert.equal(ctx.DeepPetUrgentEvents1062.capture({...candidate,source:'gallery'}),false);
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log('PASS V10.62: six-second verified cardiac/respiratory events, owner isolation, exercise and signal rejection, SDK and Home routing.');
