/* DeepPet V10.73: verified sudden change, baseline, timestamp and evidence. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const rapid=require('../assets/algorithm/rapid-events-v1062.js');
const id='actual-owner-2026',start=Date.UTC(2026,10,17,9,30,0);
const ref=n=>({source:'computed_14day',verified:true,validDays:14,petId:id,context:'rest',heart:n,breath:20});
const frame=i=>({petId:id,startEpochMs:start+i*1000,connected:true,qualityVerified:true,
 contextVerified:true,activityContext:'rest'});
const live=(i,h,b)=>({petId:id,at:start+i*1000,signalSettled:true,
 context:'rest',contextEvidence:'verified',metrics:{heart:h,breath:b}});
function detect({reference=null,high=146,breath=20,changeAt=90,last=96}={}){
 const engine=rapid.create({petId:id,referenceProvider:()=>reference}),out=[];
 for(let i=0;i<last;i++){
  const hit=engine.update(frame(i),live(i,i>=changeAt?high:80,i>=changeAt?breath:20));
  if(hit)out.push(hit);
 }
 return out;
}
const personal=detect({reference:ref(80)});
assert.equal(personal.length,1,'Six seconds of measured sudden cardiac change');
assert.equal(personal[0].at,start+95000,'Exact final sample timestamp');
assert.equal(personal[0].evidence.at(-1).at,personal[0].at);
assert(personal[0].evidence.length>=6,'Real per-second samples included');
assert(personal[0].evidence.every((x,i,a)=>i===0||x.at===a[i-1].at+1000),'No inserted missing seconds');
assert.equal(personal[0].observations[0].reference14day,80);
assert.equal(detect({reference:ref(120)}).length,0,'14-day heart-rate reference changes the actual threshold');
assert.equal(detect().length,1,'Before 14 days, conservative self-observed quiet baseline works');
assert.equal(detect({changeAt:93,last:96}).length,0,'3-second sample does not count as confirmed emergency');
assert.equal(detect({reference:ref(80),high:80,breath:42})[0].observations[0].kind,'breath','Independent respiratory rise');
assert.equal(detect({reference:ref(80),high:146,breath:42})[0].observations.length,2,'Combined simultaneous event');
const tracked={dog:0,lang:'zht',tab:'home',detail:null,emptyPreview:false,dpRapidEventsByPet:{}};
const owner=()=>id,ctx={window:null,state:tracked,render:()=>{},persist:()=>{},dpCurrentPetId:owner,
 selectedBlank:()=>false,dp58FreshPet:()=>false,isFreePet:()=>false,
 document:{addEventListener:()=>{},getElementById:()=>null},console};ctx.window=ctx;
vm.runInNewContext(read('assets/js/ux_v1062.js'),ctx);
const measured={...personal[0],date:'2026-11-17',localSecond:9*3600+31*60+35};
assert.equal(ctx.DeepPetUrgentEvents1062.capture(measured),true);
const saved=ctx.DeepPetUrgentEvents1062.forCurrentPet('2026-11-17');
assert.equal(saved.length,1);assert.equal(saved[0].evidence.length,personal[0].evidence.length);
assert.equal(saved[0].at,start+95000);
const tag=ctx.DeepPetUrgentEvents1062.alertMarkup(saved[0]);
assert.match(tag,/2026-11-17 09:31:35/);assert.match(tag,/data-second="35"/);
ctx.render=()=>{};
ctx.state.tab='deep';ctx.state.detail='dp90-waveform';
vm.runInNewContext(read('assets/js/ux_v1065.js'),ctx);
const evidence=ctx.DeepPetUX1065.evidencePanel(saved[0]);
assert.match(evidence,/2026-11-17 09:31:35/);
assert.match(evidence,/14天同情境/);
assert.match(evidence,/逐秒量測/);
assert.match(evidence,/<polyline/);assert.match(evidence,/dp1065-event-halo/);
assert(!evidence.includes('窒息確診'),'No diagnosis');
const invalid={...measured,evidence:[{at:start,heart:80,breath:20},{at:start+2500,heart:146,breath:20}]};
assert.equal(ctx.DeepPetUrgentEvents1062.capture(invalid),false,'No fake interpolation of gap');
assert.equal(ctx.DeepPetUrgentEvents1062.capture({...measured,evidence:personal[0].evidence.map((x,i,a)=>
 i===a.length-1?{...x,heart:55}:x)}),false,'Event reading must match the precise marked source point');
globalThis.DeepPetWearReadiness1044=require('../assets/algorithm/wear-readiness-v1044.js');
globalThis.DeepPetSecondStream1045=require('../assets/algorithm/second-by-second-v1045.js');
globalThis.DeepPetRapidEvents1062=rapid;
const sdk=require('../assets/algorithm/sdk20hz-adapter.js');
const session=sdk.createSession({petId:id},{referenceProvider:()=>ref(80)});
assert.throws(()=>session.pushSecond({...frame(0),date:'2026-11-18',startLocalSecond:9*3600+30*60,
 timezoneOffsetMinutes:0}),/second_event_local_epoch_timestamp_disagreement/,'Reject wrong native displayed date');
const history=Array.from({length:14},(_,i)=>({petId:id,source:'verified_sdk',verified:true,context:'rest',
 date:new Date(Date.UTC(2026,9,30+i)).toISOString().slice(0,10),verifiedMinutes:40,heart:80,breath:20}));
const fromHistory=[],automatic=sdk.createSession({petId:id},{verifiedHistory:history,
 onAcuteCandidate:e=>fromHistory.push(e)});
const waveform=(i,p)=>Array.from({length:20},(_,j)=>Math.sin((i*20+j)/p));
for(let i=0;i<96;i++){
 const metric=(value,min)=>({verified:true,source:'verified_sdk',petId:id,context:'rest',
  observedEndEpochMs:start+i*1000,observedSeconds:min,value});
 automatic.pushSecond({...frame(i),date:'2026-11-17',startLocalSecond:9*3600+30*60+i,
  timezoneOffsetMinutes:0,heartWave:waveform(i,5),breathWave:waveform(i,24),motionWave:Array(20).fill(0),
  sdkMetrics:{heart:metric(i>=90?146:80,12),breath:metric(20,30)}});
}
assert.equal(fromHistory.length,1,'SDK auto-generates own 14-day verified context reference');
assert.equal(fromHistory[0].phase,'personalized_14day');
assert.equal(fromHistory[0].evidence.at(-1).at,fromHistory[0].at);
tracked.dog=1;ctx.dpCurrentPetId=()=> 'different-pet';
assert.equal(ctx.DeepPetUrgentEvents1062.forCurrentPet('2026-11-17').length,0);
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
assert(read('assets/js/ux_v1060.js').includes('realPet?[]:timedAlerts(date)'), 'Real owner cannot inherit gallery fallback');
console.log('PASS V10.65: personalized and pre-baseline acute gating, exact second, immutable evidence plot, no fake gaps, real pet isolation');
