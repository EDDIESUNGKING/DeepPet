/* DeepPet V9.19 — unified score / evidence reconciliation.
 * Research prototype, not a veterinary severity classifier. This module deliberately
 * keeps raw sensor observations separate from candidate wellness scores.
 * Event thresholds and grade gates MUST be calibrated with real labelled datasets.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetScoreIntegrity=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const valid=x=>typeof x==='number'&&Number.isFinite(x);
const validScore=x=>valid(x)&&x>=0&&x<=100;
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
const round=x=>valid(x)?Math.round(clamp(x)):null;
const G=x=>!valid(x)?'unavailable':x>=90?'Healthy':x>=80?'Mild':x>=60?'Moderate':'Risk';
const W={cardio:{heart:.32,breath:.32,hrv:.20,stable:.16},activityRecovery:{energy:.40,recovery:.35,calm:.25},physiol:{cardio:.42,sleep:.30,activityRecovery:.28},rhythm:{calm:.58,stable:.42}};
// Owner-only scoring contract: cardio is the mean of heart/breath, and energy
// recovery is the mean of its three visible metrics. Preserve all 15 gallery
// fixtures and their historical synthetic scoring weights exactly as before.
const OWNER_W={cardio:{heart:.5,breath:.5},activityRecovery:{energy:1/3,recovery:1/3,calm:1/3}};
function weighted(s,w,required=[]){
 if(required.some(k=>!validScore(s[k])))return null;
 const keys=Object.keys(w).filter(k=>validScore(s[k])),sum=keys.reduce((a,k)=>a+w[k],0);
 return sum<.55?null:round(keys.reduce((a,k)=>a+w[k]*s[k],0)/sum);
}
 // Prevent a poor mandatory vital score from being masked by the composite.
 // HRV/stability ARE weighted inputs, but as non-ECG proxies they do not on
 // their own establish an emergency severity grade.
function riskGuard(base,components){
 if(!validScore(base))return null;
 const observed=components.filter(validScore);
 if(!observed.length)return null;
 const lowest=Math.min(...observed);
 const ceiling=lowest<60?59:lowest<80?79:lowest<90?89:100;
 return Math.min(round(base),ceiling);
}
const C={light:{heart:89,breath:89,stableHeart:82,calmHeart:94,stableBreath:94,calmBreath:85,overall:89},medium:{heart:74,breath:74,stableHeart:64,calmHeart:82,stableBreath:84,calmBreath:68,overall:79},high:{heart:54,breath:54,stableHeart:46,calmHeart:63,stableBreath:68,calmBreath:47,overall:59}};
function rating(level){return level==='high'?3:level==='medium'?2:level==='light'?1:0;}
const ownerClaims=x=>[x?.petId,x?.ownerPetId,x?.profile?.petId,x?.profile?.id].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='').map(String);
const ownerConflict=x=>new Set(ownerClaims(x)).size>1;
// The numeric index is retained for backward compatibility. A stable pet UID
// prevents records from being reassigned if a user-created profile is replaced
// at that index; these two distinct namespaces must not be compared directly.
const stableClaims=x=>[x?.petUid,x?.ownerPetUid,x?.profile?.petUid].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='').map(String);
const stableConflict=x=>new Set(stableClaims(x)).size>1;
const stableOwner=x=>stableClaims(x)[0]||null;
const ownerKey=x=>{const ids=ownerClaims(x),fallback=x?.profile?.id;
 return ownerConflict(x)?null:ids[0]??(fallback===null||fallback===undefined||String(fallback).trim()===''?null:String(fallback));};
// A real-device warning and its daily score must share the SAME evidence
// gate. Accepting a high-severity event from a rejected wear day creates
// contradictory UI: "insufficient data" alongside an emergency alert.
function realEvidenceValidForBase(base){
 const q=base?.quality||{},day=base?.date,scheduled=q.samplingMode==='scheduled';
 if(!base||base.source!=='20hz-waveform'||!['continuous','scheduled',undefined,null,''].includes(q.samplingMode)||
  q.motionInterference===true||q.heartValid!==true||q.respValid!==true||q.wearValid!==true||
  q.signalValid!==true||q.timeContinuityValid!==true||!/^\d{4}-\d{2}-\d{2}$/.test(day||''))return false;
 const parsed=new Date(day+'T12:00:00Z');if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==day)return false;
 const budget=scheduled?q.scheduledSeconds:86400;
 return valid(q.observedSeconds)&&q.observedSeconds>=900&&q.observedSeconds<=86400&&
  (!scheduled||valid(budget)&&budget>=1800&&budget<=86400&&q.observedSeconds<=budget)&&
  valid(q.observedDayFraction)&&Math.abs(q.observedDayFraction-q.observedSeconds/86400)<1e-5&&
  valid(q.timeCoverage)&&q.timeCoverage>=.5&&Math.abs(q.timeCoverage-Math.min(1,q.observedSeconds/budget))<1e-5;
}
function verifiedEvent(e,date,base=null){
 // Informational extrema may be useful on a waveform, but they are not
 // confirmed medical/wellness alerts and must never cap top-line scores.
 if(!e||ownerConflict(e)||ownerConflict(base)||stableConflict(e)||stableConflict(base)||e.informational===true||e.isInformational===true||!['heart','breath'].includes(e.kind)||e.date!==date||!valid(e.minute)||e.minute<0||e.minute>=1440||
  !valid(e.value)||!valid(e.reference)||e.reference<=0||!valid(e.relative)||e.relative<0)return null;
 const eventOwner=ownerKey(e),baseOwner=ownerKey(base);
 if(eventOwner&&baseOwner&&eventOwner!==baseOwner)return null;
 if(stableOwner(e)&&stableOwner(base)&&stableOwner(e)!==stableOwner(base))return null;
 // For an actual sensor day, require device-bound provenance and a strictly
 // matching pet identity. A numeric deviation alone is not a verified alert.
 if(base?.source==='20hz-waveform'&&(!baseOwner||eventOwner!==baseOwner||
  (stableOwner(base)&&stableOwner(e)!==stableOwner(base))||
  e.signalVerified!==true||!realEvidenceValidForBase(base)))return null;
 // Recorded labels and relative changes may be stale. Never score an event whose
 // displayed numbers contradict its claimed change; derive severity independently.
 const measured=Math.abs(e.value-e.reference)/e.reference;
 if(!Number.isFinite(measured)||measured>5||Math.abs(measured-e.relative)>Math.max(.01,.02*measured))return null;
 const gates=e.kind==='heart'?[.095,.18,.45]:[.10,.22,.50];
 if(measured<gates[0])return null;
 const level=measured>=gates[2]?'high':measured>=gates[1]?'medium':'light';
 return {...e,relative:measured,level};
}
function eventLimit(e){
 const limits=e.kind==='heart'?[.095,.18,.45]:[.10,.22,.50];
 const ratio=(x,a,b)=>clamp((x-a)/(b-a),0,1);
 if(e.level==='light')return Math.round(89-9*ratio(e.relative,limits[0],limits[1]));
 if(e.level==='medium')return Math.round(79-19*ratio(e.relative,limits[1],limits[2]));
 return Math.round(59-20*ratio(e.relative,limits[2],Math.max(.75,limits[2]*1.8)));
}
function reportLimit(index){
 if(!valid(index)||index>=90)return 100;
 if(index>=80)return Math.min(89,Math.round(.7*index+.3*89));
 if(index>=60)return Math.min(79,Math.round(.7*index+.3*79));
 return Math.min(59,Math.round(.8*index+.2*59));
}
function reconcile(base,events=[],options={}){
 // A day carrying mutually contradictory pet identifiers is not a valid
 // scoring input even if the event list is empty.
 if(!base||ownerConflict(base)||stableConflict(base))return null;
 const s={...(base.scores||{})},sensor={...(base.reportEvidence?.bcgScores||s)};
 // A corrupt or imported out-of-range component is missing data, not an
 // exceptional super-healthy or dangerously low physiological observation.
 for(const key of ['heart','breath','hrv','stable','sleep','energy','recovery','calm'])
  if(!validScore(s[key]))s[key]=null;
 // Integration boundary: a 20 Hz packet labelled "real" is not automatically
 // a valid wear day. Never publish an apparently healthy daily score from a
 // disconnected, time-invalid or barely observed collar. The rich synthetic
 // showroom fixtures retain their explicitly different, pre-existing path.
 const q=base.quality||{},realDay=base.source==='20hz-waveform';
 const realEvidenceValid=!realDay||realEvidenceValidForBase(base);
 if(!realEvidenceValid)for(const key of ['heart','breath','hrv','stable','sleep','energy','recovery','calm'])s[key]=null;
 if(realDay&&q.hrvValid!==true||realDay&&!['verified_beat_timestamps','sdk_quality_gated_metric'].includes(q.hrvProvenance))s.hrv=null;
 const accepted=(Array.isArray(events)?events:[]).map(e=>verifiedEvent(e,base.date,base)).filter(Boolean);
 // If several verified changes share a severity band, select the strongest
 // measured change for the visible alert, not merely its input-list order.
 // Overall caps already consider every accepted event below.
 const strongest=(a,b)=>rating(b.level)-rating(a.level)||b.relative-a.relative;
 const observed={heart:accepted.filter(e=>e.kind==='heart').sort(strongest)[0]||null,
  breath:accepted.filter(e=>e.kind==='breath').sort(strongest)[0]||null};
 // Insufficient HRV or unverified 20 Hz beat timing must not be indistinguishable
 // from a fully observed 100/100 rhythm assessment.
 if(!valid(s.hrv)){
  if(valid(s.calm))s.calm=Math.min(s.calm,94);
  if(valid(s.stable))s.stable=Math.min(s.stable,94);
 }
 let highest=0, eventGradeLimit=100;
 for(const kind of ['heart','breath']){
  const e=observed[kind];if(!e)continue;
  const cap=C[e.level];highest=Math.max(highest,rating(e.level));eventGradeLimit=Math.min(eventGradeLimit,eventLimit(e));
  if(valid(s[kind]))s[kind]=Math.min(s[kind],cap[kind]);
  const stab=kind==='heart'?'stableHeart':'stableBreath',calm=kind==='heart'?'calmHeart':'calmBreath';
  if(valid(s.stable))s.stable=Math.min(s.stable,cap[stab]);
  if(valid(s.calm))s.calm=Math.min(s.calm,cap[calm]);
 }
 // Laboratory organ-test findings do not assert beat-to-beat rhythmic irregularity.
 // Accordingly, a report never directly caps calm/stable/rhythm (even if recent).
 const exam=base.reportEvidence; // retained for long-term wellness only
 s.rhythm=riskGuard(weighted(s,W.rhythm,['calm','stable']),[s.calm,s.stable]);
 // If a real collar cannot verify the beat-timing evidence needed for HRV,
 // a seemingly green rhythm score would overstate confidence. Keep the
 // original rhythm component weights and mark its grade as provisional.
 if(realDay&&!validScore(s.hrv)&&validScore(s.rhythm))s.rhythm=Math.min(s.rhythm,89);
 // A verified change marker must never coexist with a falsely reassuring green
 // overall result. Apply the same explicitly documented severity ceiling to
 // the affected domain and to today's two top-line score families. This is a
 // conservative presentation policy, NOT a probability of disease.
 const cardioWeights=realDay?OWNER_W.cardio:W.cardio;
 const recoveryWeights=realDay?OWNER_W.activityRecovery:W.activityRecovery;
 const cardioRaw=weighted(s,cardioWeights,['heart','breath']);
 const cardioCoverage=Object.entries(cardioWeights).reduce((sum,[key,weight])=>sum+(validScore(s[key])?weight:0),0);
 s.cardio=riskGuard(cardioRaw,[s.heart,s.breath]);
 if(valid(s.cardio)&&(!validScore(s.hrv)||!validScore(s.stable)))s.cardio=Math.min(s.cardio,89);
 const recoveryRaw=weighted(s,recoveryWeights,['energy','recovery','calm']);
 s.activityRecovery=riskGuard(recoveryRaw,[s.energy,s.recovery,s.calm]);
 // The daily result is EXACTLY its three displayed sensor domains.  Historical
 // laboratory findings never change today's score, even when tested today.
 const alertCeiling=accepted.length?Math.min(...accepted.map(e=>Math.min(C[e.level].overall,eventLimit(e)))):100;
 if(valid(s.cardio))s.cardio=Math.min(s.cardio,alertCeiling);
 // A confirmed breathing alert is a whole-body safety issue as well. The
 // rhythm score retains its own 58/42 components; only its displayed risk
 // grade is capped, so neither daily headline can remain reassuringly green.
 if(valid(s.rhythm)&&accepted.length)s.rhythm=Math.min(s.rhythm,alertCeiling);
 const physical=riskGuard(weighted(s,W.physiol,['cardio','sleep','activityRecovery']),[s.cardio,s.sleep,s.activityRecovery]);
 const finalScore=valid(physical)?Math.min(physical,alertCeiling):null;
 s.physiol=finalScore;
 const lineage={cardio:s.cardio,sleep:s.sleep,activityRecovery:s.activityRecovery,
  componentWeights:{cardio:{...cardioWeights},activityRecovery:{...recoveryWeights}},
  cardioWeightedRaw:cardioRaw,cardioCoverage,activityRecoveryWeightedRaw:recoveryRaw,
  sensorComposite:physical,examScore:null,examWeight:0,examCandidateBlend:physical,
  examGradeGate:100,examGradeAdjustment:0,afterExam:physical,eventAdjustment:valid(physical)?finalScore-physical:0,
  final:finalScore,eventLimit:alertCeiling,observedEventSeverity:highest,
  method:(realDay?'owner cardio (heart + breath) / 2; owner energy/recovery (energy + recovery + calm) / 3; HRV and rhythm are independent sub-scores; ':'gallery cardio 32% heart + 32% breath + 20% quality-eligible HRV + 16% mechanical stability; recovery 40% energy + 35% matched two-minute recovery + 25% calm; ')+
   'body state 42% cardio + 30% sleep + 28% energy/recovery; mandatory vital guard; accepted-change ceiling; no laboratory input'};
 const grade=Object.fromEntries(Object.entries(s).map(([k,v])=>[k,G(v)]));
 return {...base,scores:s,grade,scoreLineage:lineage,integrity:{version:'1.7',rawSensorScores:sensor,
  alerts:accepted.map(e=>({date:e.date,kind:e.kind,minute:e.minute,time:e.time,level:e.level,relative:e.relative,value:e.value,reference:e.reference})),
  dominantEvents:Object.fromEntries(['heart','breath'].map(kind=>[kind,observed[kind]?{minute:observed[kind].minute,level:observed[kind].level,relative:observed[kind].relative}:null])),
  eventGradeGate:eventGradeLimit,hasValidHrv:validScore(s.hrv),realEvidenceValid,unavailableReason:!realEvidenceValid?'unverified_wear_day':null,reportGradeGate:null,
  note:'wellness change indicators; candidate policy gates are not calibrated veterinary risk probabilities'}};
}
 return {version:'1.7',weights:W,eventCaps:C,reconcile,weighted,riskGuard,eventLimit,reportLimit,grade:G,verifiedEvent,realEvidenceValid:realEvidenceValidForBase,stableOwner};
});
