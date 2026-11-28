/* DeepPet V10.199 · Milo time-bounded observational scoring.
   Uses received real measurements; never invents an IBI, sleep stage or clinical baseline.
   These are initial comparison scores, not veterinary-validated health diagnoses.
   Owner journal is browser-local; no other pets are modified by this module. */
(function(root){'use strict';
const history=root.DeepPetMiloHistory545?.samples||[],b0=root.DeepPetMiloPetHealth20261122?.records||[];
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const med=v=>{let a=v.filter(finite).sort((x,y)=>x-y);if(!a.length)return null;let i=a.length>>1;return a.length%2?a[i]:(a[i-1]+a[i])/2;};
const avg=v=>{v=v.filter(finite);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null;};
const sd=v=>{let m=avg(v);return m===null?null:Math.sqrt(avg(v.map(x=>(x-m)**2)));};
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const score=n=>finite(n)?Math.round(clamp(n)):null;
const gaussian=(v,ref,tol,asym=1)=>{if(!finite(v)||!finite(ref)||ref<=0)return null;let z=(v-ref)/(Math.abs(ref)*tol);if(z>0)z*=asym;return score(100*Math.exp(-.5*(z/1.65)**2));};
const weighted=(parts,weights)=>{let sum=0,total=0,used=[];for(let k of Object.keys(weights)){if(finite(parts[k])){sum+=parts[k]*weights[k];total+=weights[k];used.push(k);}}return {score:total?score(sum/total):null,weight:+total.toFixed(2),used,complete:total>.999};};
const h=history.map((r,i)=>({day:r[0].slice(0,10),time:r[0].slice(11,16),ts:r[0],hr:r[1]||null,rr:r[2]||null,motion:r[3],classification:r[4],source:'historical',seconds:120,idx:i}));
// Preserve each original B0 second-rate observation. Do not take a minute
// median before the canonical source-priority and anomaly scoring logic.
const live=b0.flatMap(r=>{const at=Date.parse(r.at);if(r.quality!=='valid'||!finite(at)||!finite(r.hr)||!finite(r.rr)||r.hr<=0||r.rr<=0)return [];
 const ts=new Date(Math.floor(at/1000)*1000+8*3600000).toISOString().slice(0,19);
 if(ts.slice(0,10)!==r.localDate||ts.slice(11,19)!==r.localTime.slice(0,8))return [];
 return [{day:ts.slice(0,10),time:ts.slice(11,16),ts,hr:r.hr,rr:r.rr,motion:null,source:'b0',seconds:1,packetCount:1}];});
const rows=[...h,...live].sort((a,b)=>a.ts.localeCompare(b.ts));
const syntheticDate=root.DeepPetLafaWave23.date;
const today=()=>typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):new Date(Date.now()+8*3600000).toISOString().slice(0,10);
const fixtureDates=()=>{const out=[],U=root.DeepPetUnifiedDeep,end=today(),first=U.dateAdd(end,-44);for(let d=first>syntheticDate?first:syntheticDate;d<=end;d=U.dateAdd(d,1))out.push(d);return out;};
const dates=[...new Set([...rows.map(x=>x.day),...fixtureDates()])].sort();
const usesFixture=d=>d>=syntheticDate&&d<=today()&&!inDay(d).length&&!inputHRV.some(r=>r.date===d);
const displayRows=d=>usesFixture(d)?root.DeepPetLafaWave23.rows(d):inDay(d);
let refreshDateKey=null;function refreshDates(){const key=today()+"|"+rows.length+"|"+inputHRV.length;if(key===refreshDateKey)return dates;const next=[...new Set([...rows.map(x=>x.day),...inputHRV.map(x=>x.date),...fixtureDates()])].sort();dates.splice(0,dates.length,...next);refreshDateKey=key;return dates;}
function observed(rowsInput){
 const r=rowsInput.filter(x=>finite(x.hr)&&x.hr>0&&finite(x.rr)&&x.rr>0).slice().sort((a,b)=>a.ts.localeCompare(b.ts));
 if(!r.length)return null;
 // B0 one-second packets and A2 historical
 // readings cover a two-minute interval. Their capture times sometimes
 // overlap. Calculate time UNION rather than sum overlapping durations.
 const intervals=r.flatMap(x=>{const t=Date.parse(x.ts+'+08:00'),end=Date.parse(x.ts.slice(0,10)+'T00:00:00+08:00')+86400000;if(!finite(t)||!finite(end)||!finite(x.seconds)||x.seconds<=0)return [];if(Array.isArray(x.secondOffsets)){const startSecond=new Date(t).getUTCSeconds(),offsets=[...new Set(x.secondOffsets)];if(offsets.length!==Math.floor(x.seconds)||offsets.some(k=>!Number.isInteger(k)||k<startSecond||k>=60))return [];return offsets.map(k=>({a:t+(k-startSecond)*1000,b:Math.min(end,t+(k-startSecond+1)*1000)}));}return [{a:t,b:Math.min(end,t+Math.max(0,Math.min(120,x.seconds))*1000)}];})
  .filter(x=>Number.isFinite(x.a)&&Number.isFinite(x.b)&&x.b>x.a).sort((x,y)=>x.a-y.a);
 const merged=[];
 for(const v of intervals){const p=merged.at(-1);if(p&&v.a<=p.b){p.b=Math.max(p.b,v.b);}else merged.push({...v});}
 const total=merged.reduce((sum,x)=>sum+(x.b-x.a),0)/60000;
 const fmt=t=>new Date(t+8*3600000).toISOString().slice(0,19);
 return {start:merged.length?fmt(merged[0].a):null,end:merged.length?fmt(merged.at(-1).b):null,
  segments:merged.map(x=>({start:fmt(x.a),end:fmt(x.b),observedMin:(x.b-x.a)/60000})),
  sampleCount:r.length,observedMin:total,source:[...new Set(r.map(x=>x.source))],overlapDeduplicated:true};
}
function pack(value,records,method,level='initial',extra={}){return {score:score(value),coverage:observed(records),method,level,...extra};}
const rowsByDay=new Map();for(const r of rows){if(!rowsByDay.has(r.day))rowsByDay.set(r.day,[]);rowsByDay.get(r.day).push(r);}
const inDay=d=>rowsByDay.get(d)||[];
const sampleGood=r=>finite(r.hr)&&r.hr>0&&finite(r.rr)&&r.rr>0;
function activeTransitions(d){const a=h.filter(x=>x.day===d&&sampleGood(x));let out=[];
 for(let i=1;i<a.length;i++){
  const x=a[i-1],y=a[i];if((Date.parse(y.ts+'+08:00')-Date.parse(x.ts+'+08:00'))!==120000)continue;
  if(x.motion>=45&&y.motion<=27){out.push({start:x.ts,end:y.ts,from:x.hr,to:y.hr,fromRR:x.rr,toRR:y.rr,drop:x.hr-y.hr,fromRR:x.rr,motionFrom:x.motion,motionTo:y.motion});}
 }return out;
}
function latestWindow(samples,minutes,minObserved=15){
 if(!samples.length)return [];
 const sorted=samples.slice().sort((a,b)=>a.ts.localeCompare(b.ts));
 const t=Date.parse(sorted.at(-1).ts+'+08:00');
 for(const m of [minutes,Math.max(120,minutes*2),240,480]){
  const chosen=sorted.filter(x=>t-Date.parse(x.ts+'+08:00')<=m*60000);
  if((observed(chosen)?.observedMin||0)>=minObserved)return chosen;
 }
 return sorted;
}
/* Score V2: time-bounded WITHIN-MILO observational consistency, NOT a health
   diagnosis. An independent veterinary reference is required before issuing
   validated clinical-risk scores. No zero-value imputation; units retained.
   Every output includes the contributing observation window and data source. */
const histGood=h.filter(x=>sampleGood(x));
const histQuiet=histGood.filter(x=>finite(x.motion)&&x.motion<=25);
// Baseline policy is shared with DeepPetBCG.scoreDay():
// Before FOURTEEN qualified PRIOR recording dates: use an applicable GROUP
// reference ONLY; never use 1-13 days of this pet as its scoring reference.
// After 14 qualified days in the latest 45 calendar days, beginning with the
// NEXT day: 70% group + 30% recent fourteen QUALIFIED prior-day references.
// Adult large-dog REST values below come from the 703-dog AI-COLLAR study,
// Frontiers in Veterinary Science (2025), doi:10.3389/fvets.2025.1667355.
// They are COHORT medians, not veterinary risk cutoffs or all-day norms.
const LARGE_DOG_REST_COHORT=Object.freeze({
  species:'dog',minWeightKg:20,ageMinYears:1,ageMaxYears:10,
  heartBpm:59.5,respPerMin:15.6,
  citation:'AI-COLLAR 703 dogs; adult large dogs >20kg, quiet resting medians; doi:10.3389/fvets.2025.1667355'
});
const MILO_PROFILE=Object.freeze({species:'dog',weightKg:55,ageYears:6,breed:'Alaskan Malamute'});
const profileForLafa=()=>typeof allPets==='function'?{...MILO_PROFILE,...(allPets()[0]||{}),...(typeof state==='object'?state.petOverrides?.[0]||{}:{})}:MILO_PROFILE;

// Cosmetic profile fields cannot change physiology or invalidate a numerical snapshot.
const scoreProfileFingerprint=p=>JSON.stringify(Object.entries(p).filter(([k])=>!['name','nameEn','photo','dpPhotoConfirmed','chestCm','neckCm','agePrecision'].includes(k)).sort(([a],[b])=>a.localeCompare(b)));
// EARLY OBSERVATION CONTRACT (NOT veterinary health percentiles):
// 14 valid days upgrades personalization, NEVER unlocks the first score.
// These group-stage *engineering* motion/recovery scales are documented as
// uncalibrated. They must not be labelled as species-validated risk scores.
const EARLY=Object.freeze({activeMotionThreshold:45,quietMotionThreshold:25,
  activeFractionTarget:.35,quietFractionTarget:.40,motionSdScale:50,
  twoMinuteReturnFractionTarget:.35});
const obsFraction=(v,target)=>finite(v)?score(100*Math.min(1,Math.max(0,v)/target)):null;
function metricTargets(date){
 const stage=baselineStage(date);
 let active=EARLY.activeFractionTarget,quiet=EARLY.quietFractionTarget,
     recovery=EARLY.twoMinuteReturnFractionTarget;
 if(stage.ready){
  const perDay=stage.priorDates.map(d=>rows.filter(x=>x.day===d&&finite(x.motion)&&sampleGood(x))).filter(a=>a.length>=15);
  if(perDay.length>=14){
   const pa=med(perDay.map(a=>a.filter(x=>x.motion>=EARLY.activeMotionThreshold).length/a.length)),
         pq=med(perDay.map(a=>a.filter(x=>x.motion<=EARLY.quietMotionThreshold).length/a.length));
   active=Math.max(.10,.7*active+.3*pa);
   quiet=Math.max(.15,.7*quiet+.3*pq);
  }
  const perDayDrops=stage.priorDates.map(d=>selectedDrops(d).top).filter(a=>a.length>=1);
  if(perDayDrops.length>=14){const values=perDayDrops.map(a=>med(a.map(x=>Math.max(0,x.drop)/Math.max(12,x.from-LARGE_DOG_REST_COHORT.heartBpm))));
   recovery=Math.max(.10,.7*recovery+.3*med(values));
  }
 }
 return {active,quiet,recovery,stage};
}
function groupEarlyEnergy(motionRows,targets){
 const values=motionRows.filter(x=>finite(x.motion)).map(x=>x.motion),n=values.length;
 if(!n)return {scores:{},observed:0};
 const active=values.filter(x=>x>=EARLY.activeMotionThreshold).length/n,
       quiet=values.filter(x=>x<=EARLY.quietMotionThreshold).length/n;
 const scores={intensity:obsFraction(active,targets.active),
  regularity:n>=2?volatilityScore(sd(values),EARLY.motionSdScale):null,
  rest:obsFraction(quiet,targets.quiet)};
 return {scores,observed:n,activeFraction:active,quietFraction:quiet};
}
function groupEarlyRecovery(peakEvents,target){
 // Normalization by EXCESS over an ADULT LARGE-DOG REST MEDIAN is an initial
 // engineering movement/HR-return INDEX, not validated post-exercise fitness.
 const events=peakEvents.filter(x=>finite(x.from)&&finite(x.drop));
 const values=events.map(x=>{const available=Math.max(12,x.from-LARGE_DOG_REST_COHORT.heartBpm);
   const returned=Math.max(0,x.drop)/available;
   return obsFraction(returned,target);
 });
 return {score:med(values),eventScores:values};
}

function eligibleBaselineDate(date){const U=root.DeepPetUnifiedDeep;return !usesFixture(date)&&U.baselineEligible(U.fromRows(date,inDay(date)),MILO_PROFILE);}
function baselineStage(date){const U=root.DeepPetUnifiedDeep,inputs=new Map();const get=d=>{if(!inputs.has(d))inputs.set(d,U.fromRows(d,usesFixture(d)?[]:inDay(d)));return inputs.get(d);};const ref=U.reference(profileForLafa(),date,get,dates.filter(d=>!usesFixture(d)),"lafa-real");return {...ref,source:ref.personalWeight>0?'group-plus-personal':'group-only',personalBeginsAfter14thDay:true};}
function verifiedGroupQuietReference(key){
 if(MILO_PROFILE.species!=='dog'||MILO_PROFILE.weightKg<=LARGE_DOG_REST_COHORT.minWeightKg||
    MILO_PROFILE.ageYears<=LARGE_DOG_REST_COHORT.ageMinYears||MILO_PROFILE.ageYears>=LARGE_DOG_REST_COHORT.ageMaxYears)return null;
 return key==='hr'?LARGE_DOG_REST_COHORT.heartBpm:key==='rr'?LARGE_DOG_REST_COHORT.respPerMin:null;
}
function refFor(date,key,quietVerified){
 const stage=baselineStage(date),group=quietVerified?verifiedGroupQuietReference(key):null;
 // An unknown movement state is NOT evidence of quiet rest.
 if(!finite(group))return {ref:null,stage,source:'unavailable-context-or-group'};
 if(!stage.ready)return {ref:group,group,personal:null,source:'group',stage};
 const prior=stage.priorDates.map(x=>{
   const entries=inDay(x).filter(r=>sampleGood(r)&&finite(r.motion)&&r.motion<=25);
   return entries.length>=8?med(entries.map(z=>z[key])):null;
 }).filter(finite);
 // Metric-specific baseline: no 30% personal weight until fourteen usable
 // GROUP-COMPARABLE quiet daily summaries are actually available.
 if(prior.length<14)return {ref:group,group,personal:null,source:'group-metric-history-insufficient',stage};
 const personal=med(prior);
 return {ref:.7*group+.3*personal,group,personal,source:'blended',stage};
}
function compareReference(date,key,value,quietVerified,scale){
 const reference=refFor(date,key,quietVerified);
 return {score:finite(reference.ref)?withinPersonal(value,reference.ref,scale(reference.ref)):null,...reference};
}
function withinPersonal(value,reference,scale){
 if(!finite(value)||!finite(reference)||!finite(scale)||scale<=0)return null;
 return score(100*Math.exp(-.5*((value-reference)/scale)**2));
}
function volatilityScore(value,scale){
 if(!finite(value)||!finite(scale)||scale<=0)return null;
 // Smaller *minute-scale* changes are not penalized. This is NOT beat HRV.
 return score(100*Math.exp(-.5*(value/scale)**2));
}
function percentileRank(observations,value){
 if(!finite(value)||!observations.length)return null;
 const a=observations.filter(finite);if(a.length<20)return null;
 const below=a.filter(x=>x<value).length,eq=a.filter(x=>x===value).length;
 return score(100*(below+.5*eq)/a.length);
}
function selectedDrops(d){
 // 12 calendar hours ending at the most recent recorded HR/RR sample for d.
 const day=rows.filter(x=>x.day===d&&sampleGood(x)).sort((a,b)=>a.ts.localeCompare(b.ts));
 if(!day.length)return {all:[],top:[],drop:null,maxDrop:null,start:null,end:null};
 const end=Date.parse(day.at(-1).ts+'+08:00'),start=end-12*3600*1000;
 const a=rows.filter(x=>{const t=Date.parse(x.ts+'+08:00');return x.day===d&&sampleGood(x)&&t>=start&&t<=end;});
 const pairs=[];
 for(let i=0;i<a.length-1;i++){
  const x=a[i],y=a[i+1];const dt=Date.parse(y.ts+'+08:00')-Date.parse(x.ts+'+08:00');
  if(dt!==120000||!finite(x.motion)||!finite(y.motion)||x.motion<45||y.motion>27)continue;
  pairs.push({start:x.ts,end:y.ts,from:x.hr,to:y.hr,drop:x.hr-y.hr,fromRR:x.rr,motionFrom:x.motion,motionTo:y.motion});
 }
 // Select the highest starting HR events (top five), then use the median of
 // positive two-minute falls. This avoids cherry-picking a single maximum.
 // The requested peak-followed-by-FALL index is conditioned on verified
 // two-minute decreases, not every arbitrary point; no fall => zero index,
 // never invent a recovery event. Report how many pairs were eligible.
 const falling=pairs.filter(x=>x.drop>0).sort((x,y)=>y.from-x.from||y.drop-x.drop);
 const top=falling.slice(0,5); // No actual decrease = no observed return event; never fabricate recovery.
 return {all:pairs,top,drop:med(top.map(x=>x.drop)),maxDrop:pairs.length?Math.max(...pairs.map(x=>x.drop)):null,
   start:a[0]?.ts||null,end:a.at(-1)?.ts||null};
}
// LAFA-only, evidence-gated score consistency layer.  This is a PRODUCT
// OBSERVATION heuristic (not a clinical causal claim). It never fabricates
// missing measurements and it never touches any other pet's fixture scores.
function segmentOverlapMinutes(a,b){
 const as=a?.segments||[],bs=b?.segments||[];let overlap=0;
 for(const x of as)for(const y of bs){
  const start=Math.max(Date.parse(x.start+'+08:00'),Date.parse(y.start+'+08:00'));
  const end=Math.min(Date.parse(x.end+'+08:00'),Date.parse(y.end+'+08:00'));
  if(Number.isFinite(start)&&Number.isFinite(end)&&end>start)overlap+=(end-start)/60000;
 }return overlap;
}
function reconcileLinkedScores({cardio,sleep,energy},day){
 const overlap=segmentOverlapMinutes(cardio?.coverage,sleep?.coverage);
 const trustworthyCardio=finite(cardio?.score)&&cardio?.weight>=.64&&
   (cardio?.coverage?.observedMin||0)>=15;
 const trustworthyRest=finite(sleep?.score)&&
   sleep?.level?.startsWith('rest-estimate-24h')&&
   sleep?.motionScaleUncertain!==true&&!sleep?.partialNight&&
   (sleep?.coverage?.observedMin||0)>=240;
 // Observed co-occurrence is not one-way causation. Never rewrite a raw
 // 24-hour rest score or movement-derived energy score to fit a pre-set story.
 // If the OEM motion 0–120 scale is not calibrated, no automated deduction.
 const flags=[];
 if(trustworthyCardio&&trustworthyRest&&overlap>=20&&cardio.score<65&&sleep.score<75)
   flags.push('same-period-cardio-and-rest-deviation');
 if(trustworthyRest&&finite(energy?.score)&&sleep.score<60&&energy.score<75)
   flags.push('rest-and-energy-deviation');
 return {day,version:'signal-observed-no-score-cap-2',steps:[],flags,
  sources:{cardioEvidence:trustworthyCardio,sleepEvidence:trustworthyRest,cardioRestOverlapMin:overlap},
  interpretation:'All scores remain calculated from their own observed channels. Clinical causal links are not assumed.'};
}
// 24-hour rest observation: selected date 08:00→next date 08:00;
// night = selected 20:00→next 08:00 (60%), day = selected 08:00→20:00 (40%).
// Treat 119/120 OEM motion values as UNCERTAIN until the supplier's units and
// saturation meaning are certified, not automatically as 120% activity.
// This reports quiet-rest candidates, not proven sleep/REM/deep stages.
function restObservation24(d){
 const next=new Date(Date.parse(d+'T12:00:00Z')+86400000).toISOString().slice(0,10);
 // Include newly ingested SDK motion; otherwise the score remains frozen while the detailed trace advances.
 const good=rows.filter(x=>(x.source==='historical'||x.source==='sdk')&&sampleGood(x)&&finite(x.motion));
 // Prefer the newly received record for an identical measurement timestamp.
 const byTime=new Map();for(const x of good){const prev=byTime.get(x.ts);if(!prev||x.source==='sdk')byTime.set(x.ts,x);}
 const unique=[...byTime.values()];
 const day=unique.filter(x=>x.ts>=d+'T08:00'&&x.ts<d+'T20:00');
 const night=unique.filter(x=>x.ts>=d+'T20:00'&&x.ts<next+'T08:00');
 const full=[...day,...night].sort((a,b)=>a.ts.localeCompare(b.ts));
 const hrMed=med(full.map(x=>x.hr)),rrMed=med(full.map(x=>x.rr));
 const classification=new Map();
 const classify=portion=>{
  const ordered=portion.slice().sort((a,b)=>a.ts.localeCompare(b.ts));let quietSeconds=0,runSeconds=0,maxRunSeconds=0,events=0,prev=null,estimatedSaturation=0;
  for(let i=0;i<ordered.length;i++){
   const x=ordered[i],prior=ordered[i-1],after=ordered[i+1];
   const prevHr=prior?.hr??x.hr,nextHr=after?.hr??x.hr;
   const prevRr=prior?.rr??x.rr,nextRr=after?.rr??x.rr;
   const stableHr=Math.abs(x.hr-prevHr)<=8&&Math.abs(x.hr-nextHr)<=8;
   const stableRr=Math.abs(x.rr-prevRr)<=4&&Math.abs(x.rr-nextRr)<=4;
   const moderateHr=finite(hrMed)&&x.hr<=hrMed*1.07+3;
   const moderateRr=finite(rrMed)&&x.rr<=rrMed*1.12+1;
   const saturated=x.motion>=119;
   if(saturated)estimatedSaturation++;
   const resting=(x.motion<=25&&stableHr&&stableRr)||
     (saturated&&moderateHr&&moderateRr&&stableHr&&stableRr);
   classification.set(x.ts,resting);
   const duration=Math.max(1,Math.min(120,Number(x.seconds)||120));
   const contiguous=prev!==null&&Date.parse(x.ts+'+08:00')-Date.parse(prev.ts+'+08:00')===Math.max(1,Math.min(120,Number(prev.seconds)||120))*1000;
   if(resting){quietSeconds+=duration;runSeconds=contiguous?runSeconds+duration:duration;if(!contiguous||!prev?.wasResting)events++;maxRunSeconds=Math.max(runSeconds,maxRunSeconds);}else runSeconds=0;
   prev={ts:x.ts,seconds:duration,wasResting:resting};
  }
  const coverage=observed(ordered)?.observedMin||0;
  const hours=quietSeconds/3600,observedHours=coverage/60;
  const enough=coverage>=90&&ordered.length>=30;
  const target=portion===night?8:4;
  const totalSeconds=ordered.reduce((a,x)=>a+Math.max(1,Math.min(120,Number(x.seconds)||120)),0);
  const quietFraction=totalSeconds?quietSeconds/totalSeconds:null;
  const duration=score(100*Math.min(1,hours/target));
  const regularity=quietSeconds>0?score(100*Math.min(1,(maxRunSeconds/quietSeconds)/.42)):0;
  const fraction=quietFraction!==null?score(100*Math.min(1,quietFraction/.65)):null;
  const partScore=enough&&fraction!==null?score(.72*duration+.19*fraction+.09*regularity):null;
  return {score:partScore,hours:+hours.toFixed(2),observedHours:+observedHours.toFixed(2),
   quietFraction,restBlocks:events,longestRestHours:+(maxRunSeconds/3600).toFixed(2),
   saturationFraction:ordered.length?estimatedSaturation/ordered.length:null,
   durationScore:duration,fractionScore:fraction,continuityScore:regularity,
   observedRecords:ordered.length,qualified:enough};
 };
 const a=classify(night),b=classify(day);
 const combinedScore=finite(a.score)&&finite(b.score)?score(.60*a.score+.40*b.score):null;
 const saturationFraction=full.length?full.filter(x=>x.motion>=119).length/full.length:null;
 return {score:combinedScore,night:a,day:b,totalQuietHours:+(a.hours+b.hours).toFixed(2),
  nightWeight:.60,dayWeight:.40,evidence:full,coverage:observed(full),
  timeline:full.map(x=>({ts:x.ts,seconds:Math.max(1,Math.min(120,Number(x.seconds)||120)),resting:!!classification.get(x.ts),hr:x.hr,rr:x.rr,motion:x.motion})),
  motionScaleUncertain:saturationFraction!==null&&saturationFraction>.20,
  motionAtLimitFraction:saturationFraction,source:full.some(x=>x.source==='sdk')?'A2-plus-SDK-heart-breath-motion-24h-rest-estimate':'A2-historical-heart-breath-motion-24h-rest-estimate',
  stagedSleepVerified:false,qualified:a.qualified&&b.qualified};
}
// V10.142 real-source adapter: the only daily numerical calculation is the shared model.
const unifiedDayCache=new Map(),dayRevisions=new Map();
const touchDay=date=>dayRevisions.set(date,(dayRevisions.get(date)||0)+1);
function dayScores(d){
 refreshDates();const U0=root.DeepPetUnifiedDeep,sourceAnchor=U0.storedAnchor(usesFixture(d)?'synthetic:0':'lafa-real');
 const prefix=dates.filter(x=>x<=d).map(x=>[x,inDay(x).length,inputHRV.filter(r=>r.date===x).length,dayRevisions.get(x)||0]);
 const cacheKey=JSON.stringify([d,prefix,d>=today()?'open-day':'closed-day',sourceAnchor?.lastDate<d?sourceAnchor:null,scoreProfileFingerprint(profileForLafa()),root.DeepPetMiloWaveQC?.version??'pending']);
 const cached=unifiedDayCache.get(d);if(cached?.key===cacheKey)return cached.value;
 const cacheValue=v=>{unifiedDayCache.delete(d);unifiedDayCache.set(d,{key:cacheKey,value:v});while(unifiedDayCache.size>64)unifiedDayCache.delete(unifiedDayCache.keys().next().value);return v;};
 // Exact offline results may be reused ONLY while the bundled data, physical
 // profile, stored baseline anchors and owner journal still match the inputs.
 // SDK/HRV updates or profile changes bypass the snapshot and use the same engine.
 const snapshot=root.DeepPetLafaPrecomputed;
 // Future dates use their own date-seeded waveforms; never replay a snapshot.

 if(snapshot?.matchesSource?.()&&today()>=snapshot.date&&!rows.some(r=>r.source==='sdk'&&r.day<=d)&&!inputHRV.some(r=>r.date<=d)&&root.DeepPetMiloWaveQC?.version===snapshot.qc.version&&scoreProfileFingerprint(profileForLafa())===scoreProfileFingerprint(snapshot.scoreProfile)){
  let anchorsMatch=false;try{anchorsMatch=root.localStorage.getItem('dp-initial-anchor-v1:lafa-real')===snapshot.rawAnchor&&root.localStorage.getItem('dp-initial-anchor-v1:synthetic:0')===snapshot.fixtureAnchor;}catch{}
  if(anchorsMatch){const pre=snapshot.day(d);if(pre)return cacheValue(pre);}
 }

 const U=root.DeepPetUnifiedDeep,inputs=new Map();
 const synthetic=usesFixture(d);
 const get=date=>{if(!inputs.has(date))inputs.set(date,synthetic?(usesFixture(date)?U.fromSeries(date,root.DeepPetLafaWave23.capture(date)):U.fromSeries(date,{})):U.fromRows(date,usesFixture(date)?[]:inDay(date)));return inputs.get(date);};
 const verified=latestQualifiedHRV(d,{mode:'historical'}),estimate=root.DeepPetMiloWaveQC?.lastConnectedHRV?.[d];
 const q=ownerWaveHrvForDay(d,get(d));
 const inferred=estimate&&estimate.measurementDate===d?{rmssd:estimate.rmssdMs,sdnn:estimate.sdnnMs,confidence:estimate.qualified?1:estimate.signalConfidence,qualified:estimate.qualified===true,regularity:estimate.regularity??null,nvgr:estimate.nvgr,minutes:estimate.minutes,validMinutes:estimate.validMinutes,excludedMinutes:estimate.excludedMinutes,segmented:estimate.segmented,source:estimate.source,start:estimate.start,end:estimate.end}:null;
 const selectedHrv=synthetic?root.DeepPetLafaWave23.hrv(d):q;
 const profile=profileForLafa(),priorDates=synthetic?Array.from({length:29},(_,i)=>U.dateAdd(d,i-29)).filter(date=>usesFixture(date)):dates.filter(date=>!usesFixture(date));
 const model=synthetic?root.DeepPetRawGallery143.scoreDay(0,d,priorDates,profile):U.scoreDay({date:d,profile,get,priorDates,anchorKey:"lafa-real",hrv:selectedHrv,getHrv:date=>{if(usesFixture(date))return null;return ownerWaveHrvForDay(date,get(date));}});
 model.petId="0";model.dataProvenance=synthetic?root.DeepPetLafaWave23.source:"owner-A2-B0-SDK";
 const a=get(d),valid=a.filter(sampleGood),motion=valid.filter(x=>finite(x.motion)&&x.motion>=0&&x.motion<119&&x.motionSeconds>0).map(x=>({...x,seconds:x.motionSeconds,...(Array.isArray(x.validOffsets)?{secondOffsets:x.validOffsets}:{})})),quiet=motion.filter(x=>x.motion<=25),r=model.rest;
 const v={date:d,dataProvenance:model.dataProvenance,unified:model,baseline:model.ref,linkAudit:model.linkAudit,vitals:{...model.vitals,coverageMin:model.observedMinutes,latestWindowMin:observed(quiet)?.observedMin||0},evidence:observed(valid),night:observed(r.timeline),activity:observed(motion)};
 for(const key of ['heart','breath','cardio','stable','sleep','energy','recovery','calm','activityRecovery','hrv']){
  const records=['heart','breath','cardio','calm'].includes(key)?quiet:['energy','activityRecovery','recovery'].includes(key)?motion:[];
  v[key]=pack(model.scores[key],records,'V10.199 shared three-channel model','shared-observation',{details:model.details[key]||{},notFull:key==='sleep'?r.partial:!model.weights[key]?.complete});
  if(model.weights[key])Object.assign(v[key],model.weights[key],{notFull:!model.weights[key].complete});if(model.evidence?.complete&&key in model.evidence.complete)v[key].notFull=!model.evidence.complete[key];
 }
 v.sleep={...v.sleep,level:'rest-estimate-24h',nightHours:r.night.hours,dayHours:r.day.hours,quietHours24:r.restHours,nightScore:r.night.score,dayScore:r.day.score,partialNight:r.partial,nightInterruptions:r.all.interruptions,details:{night:r.night,day:r.day,timeline:r.timeline},coverage:observed(r.timeline)};
 const selected=selectedHrv,coverage=selected?{start:selected.start,end:selected.end,observedMin:selected.validMinutes??selected.minutes,nominalMin:selected.minutes,segmented:!!selected.segmented,segments:selected.segmented?[]:[{start:selected.start,end:selected.end,observedMin:selected.minutes}]}:null;
 v.hrv={...(synthetic?{mode:'historical',lastRecordedAt:selected?.end,nvgr:selected?.nvgr,source:root.DeepPetLafaWave23.source}:selected===q&&q?{measurementDate:d,mode:'historical',lastRecordedAt:q.end,source:q.source,nvgr:q.nvgr,regularity:q.regularity}:v.hrv),score:model.scores.hrv,researchIndex:model.candidateHrvScore??(!synthetic&&inferred?.qualified!==true&&finite(estimate?.researchScore)?estimate.researchScore:null),level:synthetic?'synthetic-waveform-derived':selected===q&&q?'hrv-engineering-index':inferred?'bcg-prototype-estimate':'no-data',unverified:!model.hrvVerified,estimateIncluded:model.estimatedHrv,minutes:model.hrv?.minutes,rmssd:model.hrv?.rmssd??null,sdnn:model.hrv?.sdnn??null,coverage};
 const ev=model.details.recovery.events;v.recovery={...v.recovery,events:ev,primary:model.details.recovery.primary,medianDropBpm:model.details.recovery.drop,maxDropBpm:ev.length?Math.max(...ev.map(e=>e.drop)):null,recoveryDown:ev.filter(e=>e.drop>0).length,exerciseConfirmed:false,rawCandidateIndex:model.scores.recovery};
 v.stable={...v.stable,trueBeatBased:finite(model.scores.stable),estimateIncluded:model.estimatedHrv,coverage:model.hrvAccepted?coverage:null};
 return cacheValue(v);
}
// Strictly accept authenticated beat timestamps, not pulse-rate averages.
// An SDK may call pushQualifiedHRV() on future sync; the measurement timestamp
// and observed duration must be retained so users know EXACTLY which session.
// A long or old HRV average is NEVER a real-time safety signal.
// All comparisons use the pet's local Singapore clock, not browser locale.
const inputHRV=[];
// A retransmitted SDK session is not a new measurement. Preserve the first
// accepted record; a conflicting retransmission needs explicit reconciliation.
function storeHRV(record){
 const duplicate=inputHRV.some(r=>r.date===record.date&&r.start===record.start&&r.end===record.end&&r.durationSec===record.durationSec&&r.source===record.source);
 if(duplicate)return false;
 inputHRV.push(record);touchDay(record.date);if(!dates.includes(record.date)){dates.push(record.date);dates.sort();}return true;
}
const SGT_MS=8*3600000, HRV_LIVE_MAX_AGE_MS=5*60000;
const sgtDateAt=epoch=>new Date(epoch+SGT_MS).toISOString().slice(0,10);
const sgtTimestamp=epoch=>new Date(epoch+SGT_MS).toISOString().slice(0,19);
const parseSgtDateTime=value=>{const t=String(value||'');if(!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(t))return NaN;const full=t.length===16?t+':00':t,b=Date.parse(full+'+08:00');return finite(b)&&sgtTimestamp(b)===full?b:NaN;};
const parseSourceTime=value=>{if(typeof value!=='string')return NaN;const m=/^(\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?)(?:\.\d{1,3})?(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/i.exec(value);if(!m)return parseSgtDateTime(value);if(!finite(parseSgtDateTime(m[1])))return NaN;return Date.parse(value);};
// On a live day, a recent 5-minute NN window is required to label an HRV
// as current. A recent 30/60-minute *summary* alone is background/trend,
// since a last-minute deterioration may be diluted by its preceding data.
// For a historical date the latest recording is shown ONLY as historical.
function qualifiedHRVStatus(date,options={}){
 const asOfMs=finite(options.asOfMs)?options.asOfMs:Date.now(),mode=options.mode==='live'||options.mode==='historical'?options.mode:(date===sgtDateAt(asOfMs)?'live':'historical');
 const dayEnd=Date.parse(date+'T23:59:59.999+08:00'),cutoff=Math.min(asOfMs,dayEnd);
 const last=root.DeepPetHrvWindowPolicy.session(inputHRV,cutoff,parseSgtDateTime,Date.parse(date+'T00:00:00+08:00'));
 if(!last)return {status:'no-data',mode,selected:null,lastRecordedAt:null,lastAgeMinutes:null,reason:'No verified NN/IBI HRV recording through selected date'};
 const age=Math.max(0,(asOfMs-parseSgtDateTime(last.end))/60000),same=last.date===date;
 const status=mode==='live'?(age<=5?'fresh':'historical-available'):(same?'historical':'previous-date');
 return {status,mode,selected:last,lastRecordedAt:last.end,lastAgeMinutes:+age.toFixed(2),measurementDate:last.date,previousDate:!same,background:last,reason:'Latest qualified endpoint, longest available tier; actual date retained; live only when fresh'};
}
function computeHRV(beatTimesMs,deviceHr,opts={}){
 const minDuration=300,minBeats=40; // duration, valid intervals and independent verification determine sufficiency
 if(!Array.isArray(beatTimesMs)||beatTimesMs.length<minBeats)return null;
 const nn=[];for(let i=1;i<beatTimesMs.length;i++){
  let v=beatTimesMs[i]-beatTimesMs[i-1];if(!(v>=220&&v<=2200))return null;nn.push(v);
 }
 const peakSpan=(beatTimesMs.at(-1)-beatTimesMs[0])/1000;
 // First-to-last peak span excludes partial cycles at both boundaries. Never
 // require it to equal 300s for a 300s waveform. Exact capture length is
 // preferred; otherwise infer one cycle only for authenticated beat timestamps.
 const actualSpan=peakSpan+avg(nn)/1000;
 const duration=finite(opts.captureDurationSec)?opts.captureDurationSec:actualSpan;
 // Capture duration does not manufacture the missing NN intervals. Reject an
 // apparent 60-minute recording whose beat timestamps span only 5 minutes.
 if(finite(opts.captureDurationSec)&&Math.abs(actualSpan-opts.captureDurationSec)>Math.max(4,opts.captureDurationSec*.02))return null;
 if(duration+0.1<minDuration)return null;
 let bad=0;for(let i=1;i<nn.length;i++)if(Math.abs(nn[i]-nn[i-1])/Math.max(nn[i],nn[i-1])>.2)bad++;
 // Do not apply a rigid human-style 5% successive-NN jump rule to dogs.
 // Keep the fraction for review; provider must independently validate beat
 // morphology, contact and canine respiratory sinus arrhythmia.
 // Large NN variability is a review flag, not automatic rejection of a provider-verified beat stream.
 const bpm=60000/avg(nn);
 if(finite(deviceHr)&&Math.abs(bpm-deviceHr)/deviceHr>.08)return null;
 const metrics=root.DeepPetUnifiedHrvMath.metrics(beatTimesMs);if(!metrics)return null;
 return {rmssd:metrics.rmssd,sdnn:metrics.sdnn,regularity:metrics.regularity,bpm,beats:metrics.beatCount,durationSec:duration,artifactFraction:bad/Math.max(1,nn.length-1)};
}
function validateAndPushHRV(item){
 if(item?.petId!==undefined&&!['Milo','LAFA','拉菲'].includes(item.petId))return false;
 if(!item||!/^\d{4}-\d{2}-\d{2}$/.test(item.date||'')||!item.start||!item.end)return false;
 const a=parseSgtDateTime(item.start),b=parseSgtDateTime(item.end);
 // Reject malformed, cross-date mislabelled and future-dated sessions; do
 // not import the previous day's high HRV as the new day's value.
 if(!finite(a)||!finite(b)||b<=a||b-a>86400000||sgtDateAt(b)!==item.date||b>Date.now()+60000)return false;
 const verifiedBeatSource=item.qualityConfirmed===true&&['vendor-sdk','verified-bcg','verified-ecg'].includes(item.source);
 // Authenticated timestamp sessions can retain any good subwindow even if
 // a later segment is interrupted. A time mask never creates a replacement beat.
 if(verifiedBeatSource&&Array.isArray(item.beatTimesMs)){
  const ts=item.beatTimesMs,quality=item.beatQuality??ts.map(()=>true),duration=b-a;
  if(ts.length<40||!Array.isArray(quality)||quality.length!==ts.length||!quality.every(v=>typeof v==='boolean')||!ts.every((v,i)=>Number.isFinite(v)&&(!i||v>ts[i-1])))return false;
  if(item.intervalMask!==undefined&&(!Array.isArray(item.intervalMask)||item.intervalMask.length!==ts.length-1||!item.intervalMask.every(v=>typeof v==='boolean')))return false;
  const epoch=ts[0]>=a&&ts.at(-1)<=b+50,relative=ts[0]>=0&&ts.at(-1)<=duration+50;
  if(!epoch&&!relative)return false;const times=epoch?ts:ts.map(v=>a+v);
  // Split time-stamped raw sessions at local midnight: keep good pieces on each day, never join them.
  let stored=false;
  for(const d of new Set(times.map(sgtDateAt))){const found=root.DeepPetHrvWindowPolicy.beatWindow(times,quality,root.DeepPetUnifiedHrvMath,{minTime:Date.parse(d+'T00:00:00+08:00'),maxTime:Date.parse(d+'T00:00:00+08:00')+86400000,intervalMask:item.intervalMask});if(!found)continue;
   const m=found.m,end=found.selected.at(-1),start=found.selected[0];
   stored=storeHRV({date:d,start:sgtTimestamp(start),end:sgtTimestamp(end),durationSec:found.n*60,rmssd:m.rmssd,sdnn:m.sdnn,bpm:m.bpm,regularity:m.regularity,beats:m.beatCount,source:'qualified-beat-timestamps-backtracked',windowKind:'backtracked',validMinutes:found.validMinutes,excludedMinutes:found.excludedMinutes,segmented:found.segmented,beatEvidence:{times:found.selected.map(t=>t-Date.parse(d+'T00:00:00+08:00')),mask:found.mask.slice()}})||stored;
  }return stored;
 }
 // A provider-certified aggregate cannot be split or expanded into NN data.
 if(sgtDateAt(a)!==item.date||item.qualityConfirmed!==true||item.source!=='vendor-sdk'||!finite(item.rmssd)||!finite(item.sdnn)||item.rmssd<0||item.sdnn<0||!finite(item.deviceHr)||item.deviceHr<=0||!finite(item.durationSec)||!root.DeepPetHrvWindowPolicy.tiers.some(n=>item.durationSec>=n*60&&item.durationSec<=n*60+6)||Math.abs((b-a)/1000-item.durationSec)>6)return false;
 return storeHRV({date:item.date,start:sgtTimestamp(a),end:sgtTimestamp(b),rmssd:item.rmssd,sdnn:item.sdnn,bpm:item.deviceHr,durationSec:item.durationSec,beats:item.beats||null,source:'vendor-sdk',windowKind:'vendor-aggregate'});
}

function ownerWaveHrv(r,date){if(r?.date!==date||r.source!=='qualified-beat-timestamps-backtracked'||!r.beatEvidence)return null;return {...r,source:'verified-beat-timestamps',qualified:true,nvgr:r.bpm,minutes:r.durationSec/60};}
function ownerWaveHrvForDay(date,observations){const U=root.DeepPetUnifiedDeep,cutoff=Math.min(Date.now(),Date.parse(date+'T23:59:59.999+08:00'));const candidates=inputHRV.filter(r=>r.date===date&&r.source==='qualified-beat-timestamps-backtracked'&&parseSgtDateTime(r.end)<=cutoff).sort((a,b)=>b.end.localeCompare(a.end)||b.durationSec-a.durationSec);for(const r of candidates){const h=ownerWaveHrv(r,date);if(h&&U.hrvEvidence(h,date).accepted&&U.hrvBoundToObservation(observations,h,date))return h;}return null;}
function latestQualifiedHRV(date,options={}){
 const status=qualifiedHRVStatus(date,options),r=status.selected;
 if(!r){
  const inspected=rows.filter(x=>x.day===date&&x.source==='b0');
  return pack(null,inspected,`Current HRV unavailable: ${status.reason}. Historical 30/60-minute values never substitute for now.`,status.status,
   {freshness:status.status,mode:status.mode,lastRecordedAt:status.lastRecordedAt,
    lastAgeMinutes:status.lastAgeMinutes,backgroundDurationMin:status.background?.durationSec/60||null});
 }
 const stage=baselineStage(date);
 // These are NONCLINICAL engineering display indices, not disease diagnoses.
 const comp=root.DeepPetUnifiedHrvMath.components(r.rmssd,r.sdnn,r.bpm,root.DeepPetUnifiedDeep.group(profileForLafa())),rm=comp?score(comp.rmssdIndex):null,sn=comp?score(comp.sdnnIndex):null;
 return {score:root.DeepPetUnifiedHrvMath.score(r.rmssd,r.sdnn,1,null,r.bpm,root.DeepPetUnifiedDeep.group(profileForLafa())),nvgr:r.bpm,coverage:{start:r.start,end:r.end,
   segments:r.segmented?[]:[{start:r.start,end:r.end,observedMin:+(r.durationSec/60).toFixed(1)}],observedMin:r.validMinutes??r.durationSec/60,nominalMin:r.durationSec/60,segmented:!!r.segmented},
  level:'hrv-engineering-index',notFull:r.durationSec<300,
  freshness:status.status,mode:status.mode,lastRecordedAt:r.end,lastAgeMinutes:status.lastAgeMinutes,measurementDate:r.date,previousDate:status.previousDate,
  backgroundDurationMin:status.background?.durationSec/60||null,
  method:'Latest verified endpoint; 60/30/10/5 minute priority. Historical date retained. Not a validated canine clinical score.',
  rmssd:r.rmssd,sdnn:r.sdnn,regularity:r.regularity,source:r.source,baseline:stage,details:{rmssdIndex:rm,sdnnIndex:sn}};
}
// This is an independent ACUTE SIGNAL monitor, NOT an HRV diagnosis.
// Vital changes must be evaluated even if a 5/30/60m HRV average was high.
// Relative deltas are engineering candidates requiring signal-quality and
// activity-context checks; they are NOT veterinary emergency cut-offs.
function currentVitalSnapshot(options={}){
 const asOfMs=finite(options.asOfMs)?options.asOfMs:Date.now(),date=sgtDateAt(asOfMs);
 const observationEnd=r=>{const t=parseSgtDateTime(r.ts);if(!finite(t)||!finite(r.seconds)||r.seconds<=0)return NaN;const seconds=Array.isArray(r.secondOffsets)&&r.secondOffsets.length?r.secondOffsets.at(-1)-new Date(t).getUTCSeconds()+1:r.seconds;return t+seconds*1000;};
 const current=rows.filter(r=>r.day===date&&sampleGood(r)&&
  finite(observationEnd(r))&&observationEnd(r)<=asOfMs&&
  asOfMs-observationEnd(r)<=180000).sort((a,b)=>a.ts.localeCompare(b.ts));
 const hrv=qualifiedHRVStatus(date,{asOfMs,mode:'live'});
 if(!current.length)return {status:'no-current-vitals',date,asOf:sgtTimestamp(asOfMs),
  heartBpm:null,breathPerMin:null,possibleAbruptChange:false,hrvStatus:hrv.status,
  reassuringHrvAllowed:false,reason:'No valid HR/RR observation in latest 3 minutes; do not display old good HRV as current.'};
 const reference=rows.filter(r=>r.day===date&&sampleGood(r)&&
  finite(observationEnd(r))&&observationEnd(r)<asOfMs-300000&&
  observationEnd(r)>=asOfMs-3600000);
 const nowHr=med(current.map(x=>x.hr)),nowRr=med(current.map(x=>x.rr));
 const prevHr=reference.length>=4?med(reference.map(x=>x.hr)):null;
 const prevRr=reference.length>=4?med(reference.map(x=>x.rr)):null;
 const hrChange=finite(prevHr)?Math.abs(nowHr-prevHr):null;
 const rrChange=finite(prevRr)?Math.abs(nowRr-prevRr):null;
 // Screening for abrupt within-day changes. A suspected transition never
 // certifies disease, and cannot be inferred from a stale high HRV value.
 const possibleAbruptChange=reference.length>=4&&current.length>=2&&
  ((hrChange>=15&&hrChange/Math.max(1,prevHr)>=.30)||
   (rrChange>=6&&rrChange/Math.max(1,prevRr)>=.35));
 return {status:possibleAbruptChange?'sudden-vital-change-candidate':'recent-vitals-observed',
  date,asOf:sgtTimestamp(asOfMs),lastVitalAt:current.at(-1).ts,
  heartBpm:nowHr,breathPerMin:nowRr,priorHeartBpm:prevHr,priorBreathPerMin:prevRr,
  possibleAbruptChange,hrvStatus:hrv.status,
  reassuringHrvAllowed:hrv.status==='fresh'&&!possibleAbruptChange,
  reason:possibleAbruptChange?'Potential abrupt HR/RR change in recent samples; independent of any HRV average. Needs context/artifact review.':
  'Fresh vitals observed; HRV remains separate and is NOT a real-time emergency detector.',
  motionScaleUncalibrated:true,clinicalThresholdValidated:false};
}
// STRICT DATE CONTRACT: do not borrow another calendar day's observations.
// A score, time label, narrative, history graph and calendar cell must resolve
// from the SAME requested date. A different day's data requires user selection.
function lastRelevant(d,key){
 const v=dayScores(d)[key];
 return {...v,measuredDate:d,requestedDate:d,fallback:false};
}

// A PERIOD day must qualify for the EXACT metric being displayed. A valid
// cardiopulmonary day does not establish a sleep, movement or recovery day.
// Partial overnight observations remain visible on their own dates but must
// not count toward seven/thirty complete sleep nights.
function validPeriodDay(d,key='cardio'){return finite(dayScores(d).unified.scores[key]);}
function period(d,n,key){if(n===1)return lastRelevant(d,key);
 const expected=Array.from({length:n},(_,i)=>root.DeepPetUnifiedDeep.dateAdd(d,i-n+1));
 const items=expected.map(x=>dayScores(x));const result=root.DeepPetUnifiedDeep.period(items.map(x=>x.unified),n,key,d);
 return {...result,level:result.complete?'period':result.qualifiedDays?'partial-period':'locked',coverage:result.qualifiedDays?{start:expected[0],end:d,segments:[],observedMin:items.filter(x=>result.qualifiedDates.includes(x.date)).reduce((sum,x)=>sum+(x[key]?.coverage?.observedMin||0),0)}:null,notFull:!result.complete,method:'Mean of same-metric recorded days; lowest score and low-score day counts retained; evidence completeness tracked separately',measuredDate:d,requestedDate:d};
}
// Future SDK adapter: pass NEW owner-verified observations, then call render().
// The score model recalculates the newest qualified 60-minute window on demand;
// no 24-hour waiting gate. Records for another pet are rejected.
const ingested=new Set(rows.map(x=>x.source+'|'+(x.ts.length===16?x.ts+':00':x.ts)));
function ingestMeasurements(payload){
 if(!['Milo','LAFA','拉菲'].includes(payload?.petId)||!Array.isArray(payload.records))return {accepted:0,rejected:payload?.records?.length||0,reason:'pet_identity_required'};
 let accepted=0,rejected=0,fixtureConflicts=0;const acceptedRows=[];
 for(const row of payload.records){
  if(!row||(row.petId!==undefined&&!['Milo','LAFA','拉菲'].includes(row.petId))||row.qualityConfirmed===false||row.quality===false||row.quality==='invalid'||row.contactGood===false){rejected++;continue;}
  const stamp=typeof row.localTime==='string'&&row.localTime.includes('T')?row.localTime:row.at;
  let epoch=parseSourceTime(stamp);
  if(typeof row.localTime==='string'&&row.localTime.includes('T')&&row.at!==undefined){const other=parseSourceTime(row.at);if(!finite(other)||!finite(epoch)||Math.abs(other-epoch)>=1000){rejected++;continue;}}
  // A time-only label cannot replace the full timestamp. Explicit offsets are converted to SGT.
  if(!finite(epoch)||epoch>Date.now()+60000){rejected++;continue;}
  const time=sgtTimestamp(epoch),hr=row.hr,rr=row.rr,m=row.motion==null?null:row.motion;
  const seconds=row.observedSeconds;
  const exact=seconds===1&&row.rateWindowSeconds===1&&row.peakProvenance==='verified-beat-timestamps'&&row.qualityConfirmed===true&&row.contactGood===true&&m!==null;
  const observationSecond=Number(time.slice(11,13))*3600+Number(time.slice(14,16))*60+Number(time.slice(17,19));
  // Explicit but malformed arrival evidence must not become an immediate-arrival alert.
  if(exact&&row.availableSecond!==undefined&&(!finite(row.availableSecond)||row.availableSecond<observationSecond+1||row.availableSecond>86400||epoch+(row.availableSecond-observationSecond)*1000>Date.now()+60000)){rejected++;continue;}
  if(!finite(hr)||!finite(rr)||hr<1||hr>(exact?350:240)||rr<1||rr>120||
     !Number.isInteger(seconds)||seconds<1||seconds>60||
     (m!==null&&(!finite(m)||m<0||m>120))){rejected++;continue;}
  let offsets;if(row.secondOffsets!==undefined){if(!Array.isArray(row.secondOffsets)){rejected++;continue;}
   offsets=[...new Set(row.secondOffsets)].sort((a,b)=>a-b);const startSec=Number(time.slice(17,19));
   if(offsets.length!==seconds||offsets.some(k=>!Number.isInteger(k)||k<startSec||k>=60)){rejected++;continue;}}
  // A source cannot claim seconds outside the supplied calendar day.
  if(seconds>(86400-(Number(time.slice(11,13))*3600+Number(time.slice(14,16))*60+Number(time.slice(17,19))))){rejected++;continue;}
  // Real SDK records take precedence over the entire synthetic calendar day; never blend sources.
    // An aggregate cannot claim observations after the import time (one-minute clock tolerance).
  const endEpoch=epoch+(offsets?offsets.at(-1)-Number(time.slice(17,19))+1:seconds)*1000;
  if(endEpoch>Date.now()+60000){rejected++;continue;}
  const id='sdk|'+time;if(ingested.has(id)){rejected++;continue;}
  if(usesFixture(time.slice(0,10)))fixtureConflicts++;
  const proof=exact?{rateWindowSeconds:1,peakProvenance:'verified-beat-timestamps',qualityConfirmed:true,contactGood:true,...(finite(row.availableSecond)&&row.availableSecond>=Number(time.slice(11,13))*3600+Number(time.slice(14,16))*60+Number(time.slice(17,19))+1&&row.availableSecond<=86400?{availableSecond:row.availableSecond}:{})}:{};
  ingested.add(id);rows.push({day:time.slice(0,10),time:time.slice(11,16),ts:time,hr,rr,motion:m,source:'sdk',seconds,...proof,...(offsets?{secondOffsets:offsets}:{})});acceptedRows.push({localTime:time,hr,rr,motion:m,observedSeconds:seconds,...proof,...(offsets?{secondOffsets:offsets}:{})});accepted++;
 }
 if(accepted){rows.sort((a,b)=>a.ts.localeCompare(b.ts));rowsByDay.clear();for(const r of rows){if(!rowsByDay.has(r.day))rowsByDay.set(r.day,[]);rowsByDay.get(r.day).push(r);}refreshDates();
 }
 if(accepted){for(const d of new Set(acceptedRows.map(x=>x.localTime.slice(0,10))))touchDay(d);journal.records=journal.records.concat(acceptedRows);if(!restoring&&!batchImport)saveJournal();}
 // Persist measurements before refreshing UI; a rendering failure must not interrupt storage.
 if(accepted&&!restoring&&!batchImport&&typeof root.render==='function'&&typeof state!=='undefined'&&state.dog===0&&state.tab==='deep')root.render(false);
 return {accepted,rejected,fixtureConflicts,...(fixtureConflicts&&accepted?{reason:'real_sdk_day_replaces_gallery_without_mixing'}:{}),storage:storageStatus,latestDate:dates.at(-1),
  realtimeSignalStatus:currentVitalSnapshot(),
  refresh:'Call render(false) after importing; check realtimeSignalStatus for separately evaluated current HR/RR changes. This is a screening candidate, not a clinical emergency detector.'};
}
// Per-browser owner-only journal. Replay validated observations, never blend with gallery data.
const journalKey='DeepPet.investor.LAFA.observations.v213';
let journal={schema:1,owner:'LAFA',records:[],hrv:[]},restoring=false,storageStatus='not-saved',storageWritable=true,lastSavedRaw=null,batchImport=false;
const validJournal=p=>p?.schema===1&&(p.owner===undefined||p.owner==='LAFA')&&Array.isArray(p.records)&&Array.isArray(p.hrv);
function saveJournal(){if(!storageWritable){storageStatus='storage-unavailable';return false;}try{const serialized=JSON.stringify(journal);if(serialized.length>4000000){storageStatus='quota-exceeded-export-required';return false;}const current=root.localStorage.getItem(journalKey);if(current!==lastSavedRaw&&current!==serialized){storageStatus='storage-conflict-export-required';return false;}if(current!==serialized)root.localStorage.setItem(journalKey,serialized);lastSavedRaw=serialized;storageStatus='saved';return true;}catch(e){storageStatus='storage-unavailable-export-required';return false;}}
function pushQualifiedHRV(item){const accepted=validateAndPushHRV(item);if(accepted){const clean={};for(const k of ['date','start','end','source','qualityConfirmed','rmssd','sdnn','deviceHr','durationSec','beats'])if(['string','number','boolean'].includes(typeof item[k]))clean[k]=item[k];for(const k of ['beatTimesMs','beatQuality','intervalMask'])if(Array.isArray(item[k]))clean[k]=item[k].slice();journal.hrv.push(clean);if(!restoring&&!batchImport)saveJournal();}return accepted;}
function restoreJournal(){try{const raw=root.localStorage?.getItem(journalKey);lastSavedRaw=raw??null;if(!raw){storageStatus=root.localStorage?'empty':'storage-unavailable';return;}const parsed=JSON.parse(raw);if(!validJournal(parsed)||raw.length>4000000)throw Error('invalid storage');restoring=true;const r=ingestMeasurements({petId:'LAFA',records:parsed.records});let h=0;for(const entry of parsed.hrv)if(pushQualifiedHRV(entry))h++;storageStatus=r.rejected||h!==parsed.hrv.length?'restored-with-rejections':'restored';}catch(e){storageWritable=false;storageStatus='storage-unavailable-or-invalid';}finally{restoring=false;}}
function exportJournal(){return JSON.parse(JSON.stringify({...journal,initialAnchor:root.DeepPetUnifiedDeep.storedAnchor('lafa-real')}));}
function importJournal(payload){if(!validJournal(payload)||JSON.stringify(payload).length>4000000)return {accepted:0,hrvAccepted:0,rejected:0,reason:'invalid-backup'};let r,hrvAccepted=0;batchImport=true;try{r=ingestMeasurements({petId:'LAFA',records:payload.records});for(const item of payload.hrv)if(pushQualifiedHRV(item))hrvAccepted++;}finally{batchImport=false;if(r?.accepted||hrvAccepted)saveJournal();}const anchorRestored=payload.initialAnchor&&payload.owner==='LAFA'?root.DeepPetUnifiedDeep.restoreAnchor('lafa-real',payload.initialAnchor,profileForLafa(),today()):false;if(anchorRestored)unifiedDayCache.clear();if((r.accepted||hrvAccepted||anchorRestored)&&typeof root.render==='function'&&typeof state!=='undefined'&&state.dog===0&&state.tab==='deep')root.render(false);return {...r,hrvAccepted,hrvRejected:payload.hrv.length-hrvAccepted,anchorRestored,anchorRejected:!!payload.initialAnchor&&!anchorRestored,storage:storageStatus};}

restoreJournal();
root.DeepPetMiloAdaptiveScores=Object.freeze({version:'10.199-owner-journal',get dates(){return refreshDates().filter(d=>d<=today())},historyRows:h.length,liveMinutes:new Set(live.map(r=>r.ts.slice(0,16))).size,liveRateRows:live.length,
 usesFixture,storageStatus:()=>storageStatus,exportJournal,importJournal,dayScores,dayRows:(date)=>displayRows(date).map(x=>({...x,...(Array.isArray(x.secondOffsets)?{secondOffsets:x.secondOffsets.slice()}:{})})),recordedDayRows:(date)=>inDay(date).map(x=>({...x,...(Array.isArray(x.secondOffsets)?{secondOffsets:x.secondOffsets.slice()}:{})})),baselineStage:(d)=>dayScores(d).baseline,lastRelevant,validPeriodDay,period,computeHRV,pushQualifiedHRV,qualifiedHRVStatus,latestQualifiedHRV,currentVitalSnapshot,ingestMeasurements,observed,activeTransitions,reconcileLinkedScores,segmentOverlapMinutes});
})(window);
