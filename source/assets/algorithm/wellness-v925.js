/* DeepPet V9.25 | Candidate longitudinal wellness model.
 * Different time axis from today's sensor scores. No upload-time inputs.
 * Engineering-only, NOT a validated clinical diagnosis, predictor of death or life span.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetWellness925=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const valid=x=>typeof x==='number'&&Number.isFinite(x);
const validScore=x=>valid(x)&&x>=0&&x<=100;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const round=x=>Math.round(x);
const exactDate=d=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(d||''))return false;
 const ms=Date.parse(d+'T12:00:00Z');return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===d;};
const dateNumber=d=>exactDate(d)?Date.parse(d+'T12:00:00Z'):null;
// Treat every explicit owner claim as authoritative, including profile.id.
// Omitting the fourth claim used to let a row for pet 0 with profile.id=1
// contribute to pet 0's thirty-day model.
const ownerClaims=x=>[x?.petId,x?.ownerPetId,x?.profile?.petId,x?.profile?.id].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='').map(String);
const ownerConflict=x=>new Set(ownerClaims(x)).size>1;
const ownerKey=x=>{const ids=ownerClaims(x),fallback=x?.profile?.id;
 return ownerConflict(x)?null:ids[0]??(fallback===null||fallback===undefined||String(fallback).trim()===''?null:String(fallback));};
function canonicalDays(rows){
 const grouped=new Map();for(const r of rows){if(!grouped.has(r.date))grouped.set(r.date,[]);grouped.get(r.date).push(r);}
 const priority=r=>[r.source==='20hz-waveform'?2:1,r.source==='20hz-waveform'&&valid(r.quality?.observedSeconds)?r.quality.observedSeconds:0,
  r.source==='20hz-waveform'&&valid(r.quality?.timeCoverage)?r.quality.timeCoverage:0];
 const compare=(a,b)=>{const x=priority(a),y=priority(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return 0;};
 const same=(a,b)=>[...new Set([...Object.keys(a.scores||{}),...Object.keys(b.scores||{})])].every(k=>Object.is(a.scores?.[k],b.scores?.[k]));
 const days=[],excluded=[];for(const [date,group] of grouped){
  const top=group.reduce((best,r)=>compare(r,best)>0?r:best,group[0]);
  if(group.filter(r=>compare(r,top)===0).every(r=>same(r,top)))days.push(top);else excluded.push(date);
 }
 return {days:days.sort((a,b)=>a.date.localeCompare(b.date)),excluded};
}
// Presentation index, not actual biological age. One score point moves the
// estimated wellness age in the opposite direction by exactly 0.08 years.
function ageFromScore(actualAge,wellnessScore){if(!valid(actualAge)||actualAge<0||!valid(wellnessScore)||wellnessScore<0||wellnessScore>100)return null;
 const delta=round((85-wellnessScore)*8)/100;
 return {ageYears:round(Math.max(.1,actualAge+delta)*100)/100,deltaYears:delta,unit:'years',pointsPerYear:12.5};}
function evaluate(records=[], report=null, pet={}, ageEngine=null, asOfDate=null){
 const all=(Array.isArray(records)?records:[]).filter(x=>{
  if(!x||!exactDate(x.date)||!validScore(x.scores?.physiol)||!validScore(x.scores?.rhythm))return false;
  const q=x.quality||{};
  // The demo fixture is clearly separate from actual collar telemetry; only
  // real recordings must have affirmative, not merely non-failed, QC flags.
  if(x.source==='20hz-waveform')return q.heartValid===true&&q.respValid===true&&q.timeContinuityValid===true&&q.wearValid===true&&q.signalValid===true&&Number(q.timeCoverage)>=.5&&valid(q.observedSeconds)&&q.observedSeconds>=900&&q.observedSeconds<=86400&&valid(q.observedDayFraction)&&Math.abs(q.observedDayFraction-q.observedSeconds/86400)<1e-5&&(q.samplingMode!=='scheduled'||valid(q.scheduledSeconds)&&q.scheduledSeconds>=1800&&q.scheduledSeconds<=86400)&&Math.abs(q.timeCoverage-Math.min(1,q.observedSeconds/(q.samplingMode==='scheduled'?q.scheduledSeconds:86400)))<1e-5;
  // All 15 stock pets are explicitly identified synthetic showroom cases.
  // The V9.73 case-calibration path changed this tag without updating the
  // longitudinal consumer model. Reject arbitrary/unmarked records, but do
  // not discard every legitimate 30-day showroom score after that rename.
  return ['synthetic-demo-fixture','synthetic-extreme-showcase-v973'].includes(x.dataProvenance)&&
   ['sdk-demo-fixture','minute-demo-no-interbeat'].includes(x.source)&&
   q.heartValid!==false&&q.respValid!==false&&q.timeContinuityValid!==false&&q.wearValid!==false&&q.signalValid!==false;
 });
 const identity=ownerKey,target=identity(pet),identities=new Set(all.map(identity).filter(Boolean));
 if(ownerConflict(pet)||all.some(ownerConflict)||identities.size>1||identities.size===1&&all.some(x=>identity(x)===null))
  return {available:false,reason:'mixed_pet_identity',date:null,score:null,ageYears:null,reportWeight:0,days:0};
 if(target&&identities.size&&!(identities.size===1&&identities.has(target)))
  return {available:false,reason:'pet_identity_mismatch',date:null,score:null,ageYears:null,reportWeight:0,days:0};
 // A pet-specific 30-day model must be backed by explicitly attributed days.
 // Keep ownerless legacy single-pet calculations only for anonymous callers.
 if(target&&all.length&&identities.size===0)
  return {available:false,reason:'pet_identity_unverified',date:null,score:null,ageYears:null,reportWeight:0,days:0};
 const canonical=canonicalDays(all),distinct=canonical.days;
 if(!distinct.length)return {available:false,reason:canonical.excluded.length?'ambiguous_daily_evidence':'no_sensor_days',date:null,score:null,ageYears:null,ageAvailable:false,
  actualAge:valid(pet?.age)?pet.age:null,reportWeight:0,days:0,stale:false,lastObservedDate:null,grade:'unavailable',excludedAmbiguousDays:canonical.excluded};
 const latest=exactDate(asOfDate)?asOfDate:(distinct.at(-1)?.date||null);
 if(!latest)return {available:false,reason:'no_sensor_days',date:null,score:null,ageYears:null,reportWeight:0,days:0};
 const anchor=dateNumber(latest);
 const last30=distinct.filter(x=>{const ms=dateNumber(x.date);return ms!==null&&ms<=anchor&&ms>anchor-30*86400000;});
 const mean=k=>last30.reduce((s,r)=>s+r.scores[k],0)/last30.length;
 // A last available reading is not necessarily a current reading.
 const lastObservedDate=distinct.filter(x=>dateNumber(x.date)<=anchor).at(-1)?.date||null;
 const daysSinceLast=lastObservedDate===null?null:Math.round((anchor-dateNumber(lastObservedDate))/86400000);
 const stale=daysSinceLast===null||daysSinceLast>7;
 const enough=last30.length>=7&&!stale;
 const physical=enough?mean('physiol'):null,rhythm=enough?mean('rhythm'):null;
 const sensorScore=enough?round(.75*physical+.25*rhythm):null;
 // Laboratory examDate is the only temporal field. Uploaded/edited timestamps
 // are deliberately NEVER accepted as arguments to this function.
 const testedAt=report?.latest,detected=dateNumber(testedAt),daysOld=detected!==null?round((anchor-detected)/86400000):null;
 const examOwner=identity(report),examAligned=!ownerConflict(report)&&(!target||examOwner===target);
 const examUsable=enough&&examAligned&&validScore(report?.score)&&Number.isInteger(daysOld)&&daysOld>=0;
 const testedDomains=(Array.isArray(report?.domains)?report.domains:[]).filter(x=>x&&x.count>0).length;
 const numericCount=(Array.isArray(report?.records)?report.records:[]).filter(x=>x&&x.kind==='numeric').length;
 const count=Number(report?.count)||0;
 // Coverage limits a one- or two-domain report from dominating all of health.
 const scope=clamp(count/8,0,1)*clamp(testedDomains/4,0,1);
 const numerics=count?clamp(numericCount/count,0,1):0;
 const recency=examUsable?Math.exp(-Math.log(20)*daysOld/365):0;
 const weight=examUsable?Math.min(.60,.60*scope*numerics*recency):0;
 // A normal lab panel cannot erase an independently low physiological trend.
 // Laboratory evidence may lower this long-term composite, but never boost
 // a concerning sensor trend into a reassuring green score.
 const candidate=examUsable?round((1-weight)*sensorScore+weight*Math.min(sensorScore,report.score)):sensorScore;
 const score=enough?clamp(candidate,0,100):null;
 // Score and estimated wellness age MUST come from the SAME longitudinal
 // evidence. Older versions called a separate age engine and could show both
 // curves rising together. This is a reversible demonstration index, not a
 // clinically validated biological age or predicted lifespan.
 const ageValid=enough&&last30.length>=14&&valid(score)&&valid(pet?.age);
 let ageYears=null,ageAdjustment=0;
 if(ageValid){
  const age=ageFromScore(pet.age,score);ageAdjustment=age.deltaYears;ageYears=age.ageYears;
 }
 const history=last30.map(x=>({date:x.date,body:x.scores.physiol,rhythm:x.scores.rhythm}));
 return {available:enough,reason:enough?null:stale?'stale_monitoring':'insufficient_longitudinal_days',date:latest,score,sensorScore,physiology:valid(physical)?round(physical):null,
  rhythm:valid(rhythm)?round(rhythm):null,days:last30.length,windowDays:30,history,reportScore:examUsable?report.score:null,
  reportDate:examUsable?testedAt:null,reportId:examUsable?report.reportId:null,reportWeight:weight,reportDaysOld:examUsable?daysOld:null,
  ageYears,actualAge:valid(pet?.age)?pet.age:null,ageAdjustment,ageAvailable:ageValid,
  lastObservedDate,daysSinceLast,stale,grade:!valid(score)?'unavailable':score>=90?'healthy':score>=80?'mild':score>=60?'moderate':'risk',
  excludedAmbiguousDays:canonical.excluded,modelVersion:'longitudinal-v925-research',isClinicallyValidated:false};
}
function triage(s={}){
 // Missing waves, low confidence or an offline collar cannot identify cardiac
 // or respiratory arrest. Never turn a disconnected sensor into an emergency.
 if(!s.connected||!s.signalValid||!s.timestampsValid)return {kind:'unavailable',emergency:false,reason:'signal_unavailable'};
 if(s.verifiedMedicalEmergency===true&&s.vetValidatedAlgorithm===true)return {kind:'priority',emergency:true,reason:'confirmed_review_required'};
 if(s.deviationConfirmed===true)return {kind:'review',emergency:false,reason:'persistent_change'};
 return {kind:'normal',emergency:false,reason:'no_valid_event'};
}
return {version:'9.44',evaluate,ageFromScore,triage};
});
