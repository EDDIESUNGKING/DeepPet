/* DeepPet V10.62: research-only, seconds-level, independently evidenced
 * vital-rate change candidates. Requires manufacturer-verified rolling rates;
 * does NOT diagnose apnea, choking, myocardial infarction or arrhythmia.
 * This is separate from V10.61's minute-level sustained trend detector.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetRapidEvents1062=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 const median=items=>{const s=items.filter(finite).sort((a,b)=>a-b);return s.length?(s[Math.floor((s.length-1)/2)]+s[Math.floor(s.length/2)])/2:null;};
 const modes=['heart-high','heart-low','breath-high','breath-low'];
 function create({petId,referenceProvider=null,confirmSeconds=6,cooldownSeconds=180}={}){
  if(petId===null||petId===undefined||String(petId).trim()==='')throw Error('pet_identity_required');
  if(!Number.isInteger(confirmSeconds)||confirmSeconds<4||confirmSeconds>20)throw Error('unsafe_confirmation_window');
 const id=String(petId),history=[],recentEvidence=[],streaks=Object.fromEntries(modes.map(k=>[k,0])),lastReport=new Map();
  let lastAt=null,context=null,lastActivityAt=null;
  const clear=()=>{history.length=0;recentEvidence.length=0;for(const k of modes)streaks[k]=0;};
  const validRef=(ref,ctx)=>ref?.verified===true&&ref.source==='computed_14day'&&ref.validDays>=14&&
   String(ref.petId)===id&&ref.context===ctx&&finite(ref.heart)&&finite(ref.breath)&&ref.heart>10&&ref.breath>1;
  function update(frame={},live={}){
   const at=live.at;
   if(String(frame.petId)!==id||String(live.petId)!==id)throw Error('rapid_event_pet_identity_mismatch');
   if(!finite(at)||at!==frame.startEpochMs||at%1000!==0)throw Error('rapid_event_verified_second_required');
   if(lastAt!==null&&at!==lastAt+1000)clear();lastAt=at;
   if(frame.activityContext==='active'||frame.activityContext==='recovery')lastActivityAt=at;
   const ctx=live.context;
   const ready=frame.connected===true&&frame.qualityVerified===true&&frame.contextVerified===true&&
    live.signalSettled===true&&live.contextEvidence==='verified'&&['rest','sleep'].includes(ctx)&&
    frame.activityContext===ctx&&(lastActivityAt===null||at-lastActivityAt>=180000);
   if(!ready){clear();context=null;return null;}
   if(context!==ctx){clear();context=ctx;}
   const heart=live.metrics?.heart,breath=live.metrics?.breath;
   const hOK=finite(heart)&&heart>=10&&heart<=320;
   const bOK=finite(breath)&&breath>=1&&breath<=120;
   // A missing/flat signal is a fitting problem, never a respiratory arrest.
   if(!hOK&&!bOK){clear();return null;}
   // Evidence contains only real manufacturer-verified, owner-matched one-
   // second rate observations. Never interpolate missing seconds or label
   // these derived vital rates as the raw 20 Hz BCG waveform.
   recentEvidence.push({at,heart:hOK?Number(heart.toFixed(1)):null,
    breath:bOK?Number(breath.toFixed(1)):null});
   if(recentEvidence.length>24)recentEvidence.shift();
   const ref=typeof referenceProvider==='function'?referenceProvider({petId:id,context:ctx,at,date:frame.date}):null;
   const personalized=validRef(ref,ctx);
   const required=personalized?30:60; // provisional reference needs more prior clean quiet observations
   const preceding=history.filter(r=>at-r.at<=90000);
   const baseline={heart:median(preceding.map(r=>r.heart)),breath:median(preceding.map(r=>r.breath))};
   const enoughHeart=preceding.filter(r=>finite(r.heart)).length>=required;
   const enoughBreath=preceding.filter(r=>finite(r.breath)).length>=required;
   // Only compare a change against an independently established PRE-event
   // quiet reference, never against the newly abnormal samples themselves.
   const limits={};
   for(const [key,value,good] of [['heart',heart,hOK&&enoughHeart],['breath',breath,bOK&&enoughBreath]]){
    const center=baseline[key];
    if(!good||!finite(center)||center<=0)continue;
    const historical=personalized?ref[key]:center;
    // A large disagreement between the previous quiet hour and the 14-day
    // reference is a developing trend, not proof of a seconds-long jump.
    if(personalized&&(center<historical*.65||center>historical*1.5))continue;
    const level=personalized?(key==='heart'?.45:.70):(key==='heart'?.60:.95);
    const floor=personalized?(key==='heart'?24:9):(key==='heart'?35:14);
    // The verified 14-day same-context physiological median now directly
    // influences the individualized threshold. The pre-event 90s median
    // remains essential to distinguish a *sudden* shift from an old trend.
    // Never substitute the 14-day average WELLNESS SCORE for HR/RR units.
    const adjusted=personalized ? .6*historical+.4*center : center;
    const difference=Math.max(floor,adjusted*level);
    limits[key]={center:adjusted,reference14day:personalized?historical:null,
     recentReference:center,high:adjusted+difference,low:Math.max(1,adjusted-difference),difference};
   }
   const detected=[];
   for(const [key,value] of [['heart',heart],['breath',breath]])for(const direction of ['high','low']){
    const mode=`${key}-${direction}`,bounds=limits[key];
    const crosses=bounds&&(direction==='high'?value>=bounds.high:value<=bounds.low);
    streaks[mode]=crosses?streaks[mode]+1:0;
    if(streaks[mode]!==confirmSeconds||at-(lastReport.get(mode)??-Infinity)<cooldownSeconds*1000)continue;
    lastReport.set(mode,at);
    detected.push({kind:key,type:direction,value:Number(value.toFixed(1)),baseline:Number(bounds.center.toFixed(1)),
     // Save the actual threshold used at the time of detection. Later
     // evidence verification must not recompute it from mutable history.
     threshold:Number((direction==='high'?bounds.high:bounds.low).toFixed(3)),
     reference14day:finite(bounds.reference14day)?Number(bounds.reference14day.toFixed(1)):null,
     recentReference:Number(bounds.recentReference.toFixed(1))});
   }
   if(!Object.values(streaks).some(Boolean)){
    history.push({at,heart:hOK?heart:null,breath:bOK?breath:null});
    if(history.length>90)history.shift();
   }
   if(!detected.length)return null;
   return Object.freeze({source:'verified_second_stream',petId:id,at,context:ctx,
    phase:personalized?'personalized_14day':'provisional_quiet_reference',
    secondsConfirmed:confirmSeconds,observations:detected,
    evidence:Object.freeze(recentEvidence.map(row=>Object.freeze({...row}))),
    verifiedRate:true,diagnosis:null,notification:'in_app_only'});
  }
  return Object.freeze({update,reset:clear});
 }
 return Object.freeze({version:'10.62',create});
});
