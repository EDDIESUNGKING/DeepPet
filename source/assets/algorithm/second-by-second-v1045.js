/* DeepPet V10.45: one-second, 20 Hz stream processing. Research-only.
 * EVERY second is ingested immediately; there is no 12-second sampling delay.
 * Readiness is separate from the evidence needed to publish HR/RR/HRV.
 * All decisions are owner-scoped; no user-entered activity annotations.
 */
(function(root,factory){const api=factory(root?.DeepPetWearReadiness1044);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetSecondStream1045=api;})(typeof globalThis!=='undefined'?globalThis:this,function(readinessModule){'use strict';
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const signalPresent=a=>Array.isArray(a)&&a.length===20&&a.every(finite)&&Math.max(...a)-Math.min(...a)>1e-6;
 const contexts=new Set(['sleep','rest','active','recovery']);
 const EMPTY=()=>({heart:null,breath:null,rmssd:null,sdnn:null,nnvgr:null});
 const median=items=>{const a=items.filter(finite).sort((x,y)=>x-y);return a.length?(a[Math.floor((a.length-1)/2)]+a[Math.floor(a.length/2)])/2:null;};
 // Build the ONLY admissible live reference from 14 separate, earlier,
 // context-specific days. Input records must originate from a verified SDK
 // feed; neither gallery data nor another pet's cached sample is eligible.
 function buildContextReference({petId,context,at,date=null,history=[]}={}){
  if(petId===null||petId===undefined||!['rest','sleep'].includes(context)||!finite(at)||!Array.isArray(history))return null;
  // Native events carry a verified local date; midnight in the owner's
  // timezone need not be midnight UTC. Earlier-day eligibility is local.
  const today=/^\d{4}-\d{2}-\d{2}$/.test(date||'')?date:new Date(at).toISOString().slice(0,10);
  const id=String(petId),earliest=new Date(Date.parse(today+'T12:00:00Z')-45*86400000).toISOString().slice(0,10);
  const chosen=new Map(),disputed=new Set();
  for(const r of history){
   if(!r||String(r.petId)!==id||r.context!==context||r.source!=='verified_sdk'||r.verified!==true||
    typeof r.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||r.date>=today||r.date<earliest||
    !finite(r.verifiedMinutes)||r.verifiedMinutes<30||!finite(r.heart)||!finite(r.breath)||
    r.heart<=10||r.breath<=1||r.heart>320||r.breath>120)continue;
   // Reject contradictory copies of one date, rather than selecting the
   // convenient one and inflating apparent reference confidence.
   const prior=chosen.get(r.date);
   if(prior&&(prior.heart!==r.heart||prior.breath!==r.breath))disputed.add(r.date);
   if(!prior||r.verifiedMinutes>prior.verifiedMinutes)chosen.set(r.date,r);
  }
  for(const day of disputed)chosen.delete(day);
  const rows=[...chosen.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-14);
  if(rows.length<14)return null;
  return Object.freeze({source:'computed_14day',verified:true,petId:id,context,validDays:14,
   heart:median(rows.map(r=>r.heart)),breath:median(rows.map(r=>r.breath)),
   firstDate:rows[0].date,lastDate:rows.at(-1).date});
 }
 const allowed=(x,key,minimum,at,id,context)=>x&&x.verified===true&&x.source==='verified_sdk'&&String(x.petId)===id&&
  x.context===context&&finite(x.observedEndEpochMs)&&x.observedEndEpochMs<=at&&at-x.observedEndEpochMs<=1000&&
  finite(x.observedSeconds)&&x.observedSeconds>=minimum&&finite(x.value)&&
  (key==='heart'?x.value>=10&&x.value<=320:key==='breath'?x.value>=1&&x.value<=120:x.value>0&&x.value<5000);
 function create({petId,minimumHeartSec=12,minimumBreathSec=30,minimumHrvSec=60,referenceProvider=null}={}){
  if(petId===null||petId===undefined||String(petId).trim()==='')throw Error('pet_identity_required');
  const id=String(petId),ready=(readinessModule||globalThis.DeepPetWearReadiness1044)?.create();
  if(!ready)throw Error('wear_readiness_module_required');
  let lastMs=null,seconds=0,context='unknown',pending='unknown',pendingCount=0,lastActiveMs=null,stableSec=0,
   half=null,latest=ready.snapshot();
  const log=[];let acuteCount=0,acuteDirection=null,normalCount=0,anchored=false,lastNormalAt=null;
  function reset(kind='awaiting_signal'){
   half=null;seconds=0;context='unknown';pending='unknown';pendingCount=0;stableSec=0;acuteCount=0;acuteDirection=null;normalCount=0;anchored=false;lastNormalAt=null;lastActiveMs=null;
   latest=ready.reset(kind);
  }
  function returnState(at,reason='collecting',values=EMPTY()){
   return Object.freeze({petId:id,at,processedSeconds:seconds,signalState:latest.status,signalSettled:latest.settled,
    context,contextEvidence:context==='unknown'?'insufficient':'verified',metrics:values,reason,
    acuteCandidate:null,samplingIntervalSeconds:1});
  }
  function update(frame={}){
   if(String(frame.petId)!==id)throw Error('second_frame_pet_identity_mismatch');
   const ms=frame.startEpochMs;
   if(!finite(ms)||ms%1000!==0)throw Error('one_second_epoch_timestamp_required');
   if(lastMs!==null&&ms<=lastMs)throw Error('duplicate_or_backward_second_frame');
   if(lastMs!==null&&ms!==lastMs+1000)reset('awaiting_signal');
   lastMs=ms;seconds++;
   if(frame.connected!==true){reset('signal_unavailable');return returnState(ms,'radio_unavailable');}
   const h=frame.heartWave,b=frame.breathWave,m=frame.motionWave;
   if(![h,b,m].every(x=>Array.isArray(x)&&x.length===20&&x.every(finite))){
    reset('signal_unavailable');return returnState(ms,'incomplete_20hz_frame');
   }
   const waveOK=signalPresent(h)&&signalPresent(b);
   // The SDK must positively attest source quality. Non-flat signals alone
   // cannot make an ECG-equivalent heart-rate or respiratory claim.
   const accepted=waveOK&&frame.qualityVerified===true;
   if(half){
    const combined={connected:true,timestampMs:half.at,heartWave:half.h.concat(h),breathWave:half.b.concat(b),
     qualityAccepted:half.accepted&&accepted};
    latest=ready.update(combined);half=null;
   }else half={at:ms,h,b,accepted};
   if(!accepted){stableSec=0;acuteCount=0;acuteDirection=null;normalCount=0;anchored=false;lastNormalAt=null;log.length=0;}
   else stableSec++;

   // Explicit classification may come from the factory's verified movement
   // classifier. A supplied raw motion trace does NOT by itself prove sleep.
   // During transitions the context is unknown, not yesterday's old class.
   const identified=frame.contextVerified===true&&contexts.has(frame.activityContext)?frame.activityContext:'unknown';
   // The first 2 minutes after a verified active -> rest transition form a
   // distinct recovery context. A fast heart rate there is not compared with
   // sleep/resting reference or called a sudden quiet-time emergency.
   const proposed=identified==='rest'&&lastActiveMs!==null&&ms-lastActiveMs<120000?'recovery':identified;
   if(proposed===pending)pendingCount++;
   else {pending=proposed;pendingCount=1;}
   if(proposed==='active')lastActiveMs=ms;
   const wait=proposed==='active'?3:5;
   if(pendingCount>=wait&&proposed!==context){context=proposed;stableSec=0;log.length=0;acuteCount=0;acuteDirection=null;normalCount=0;anchored=false;lastNormalAt=null;}
   if(proposed!==context){context='unknown';stableSec=0;log.length=0;acuteCount=0;acuteDirection=null;normalCount=0;anchored=false;lastNormalAt=null;}
   if(!accepted||!latest.settled)return returnState(ms,!accepted?'poor_signal':'settling');

   const stableContext=contexts.has(context);
   const values=EMPTY(),input=frame.sdkMetrics||{};
   // Source data arrives each second; rates become visible after enough
   // CONTINUOUS, context-consistent evidence, and only if factory verified.
   // Every subsequent second can refresh a valid rolling result.
   if(stableContext&&stableSec>=minimumHeartSec&&allowed(input.heart,'heart',minimumHeartSec,ms,id,context))values.heart=input.heart.value;
   if(stableContext&&stableSec>=minimumBreathSec&&allowed(input.breath,'breath',minimumBreathSec,ms,id,context))values.breath=input.breath.value;
   if(stableContext&&stableSec>=minimumHrvSec){
    for(const key of ['rmssd','sdnn','nnvgr'])if(allowed(input[key],key,minimumHrvSec,ms,id,context))values[key]=input[key].value;
   }

   // A separate rapid *candidate*, not a diagnosis or a push alert. All 14
   // historical days, context match and source-quality claims are mandatory.
   // Missing, single-channel, exercising and post-exertion evidence cannot
   // be promoted to a joint cardiopulmonary emergency.
   let acuteCandidate=null;
   const ref=typeof referenceProvider==='function'?referenceProvider({petId:id,context,at:ms,date:frame.date}):null;
   const rested=lastActiveMs===null||ms-lastActiveMs>=180000;
   const comparable=(context==='sleep'||context==='rest')&&rested&&
    ref?.verified===true&&ref.source==='computed_14day'&&String(ref.petId)===id&&ref.context===context&&ref.validDays>=14&&
    finite(ref.heart)&&finite(ref.breath)&&ref.heart>0&&ref.breath>0;
   if(comparable&&values.heart!==null&&values.breath!==null){
    log.push({at:ms,heart:values.heart,breath:values.breath});if(log.length>60)log.shift();
    const inOwnQuietBand=values.heart>=ref.heart*.80&&values.heart<=ref.heart*1.20&&
     values.breath>=ref.breath*.70&&values.breath<=ref.breath*1.30;
    if(inOwnQuietBand){normalCount++;if(normalCount>=30){anchored=true;lastNormalAt=ms;}}
    else normalCount=0;
    const hHigh=values.heart>=Math.max(ref.heart*1.35,ref.heart+16),
     hLow=values.heart<=Math.min(ref.heart*.72,ref.heart-15),
     bHigh=values.breath>=Math.max(ref.breath*1.5,ref.breath+7),
     bLow=values.breath<=Math.min(ref.breath*.6,ref.breath-6);
    const candidate=hHigh&&bHigh?'hr_high_rr_high':hHigh&&bLow?'hr_high_rr_low':hLow&&bLow?'hr_low_rr_low':null;
    if(candidate===acuteDirection&&candidate!==null)acuteCount++;else {acuteDirection=candidate;acuteCount=candidate?1:0;}
    // A high rate at the instant of first contact can be the pet's transient
    // activity rather than a sudden change. Require 30s of preceding normal
    // same-context observations before calling a rise/drop "sudden".
    if(anchored&&lastNormalAt!==null&&ms-lastNormalAt<=45000&&acuteCount>=15&&log.length>=15){acuteCandidate=Object.freeze({kind:'joint_candidate',direction:candidate,
     secondsConfirmed:acuteCount,heart:values.heart,breath:values.breath,baselineHeart:ref.heart,baselineBreath:ref.breath,
     context,petId:id,verified:false,diagnosis:null,advice:'check_pet_and_seek_veterinary_care_if_distress'});}
   }else{acuteCount=0;acuteDirection=null;normalCount=0;anchored=false;lastNormalAt=null;log.length=0;}
   return Object.freeze({petId:id,at:ms,processedSeconds:seconds,signalState:latest.status,
    signalSettled:latest.settled,context,contextEvidence:stableContext?'verified':'insufficient',metrics:values,
    reason:values.heart!==null||values.breath!==null?'rolling_measurement':'waiting_for_qualified_metrics',
    acuteCandidate,samplingIntervalSeconds:1});
  }
  return Object.freeze({update,snapshot:()=>returnState(lastMs),reset});
 }
 return Object.freeze({version:'10.45',create,signalPresent,buildContextReference});
});
