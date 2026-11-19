/* DeepPet V9.17 | Candidate evidence assessment. This is NOT a clinical diagnostic score.
   Patient factors select an applicable laboratory reference; age/weight/height are NOT
   automatic penalties. Missing or contradictory references never produce a numeric risk.
*/
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetLabEvidence=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const DOMAIN_WEIGHTS={cardiac:.26,resp:.20,renal:.17,hepatic:.11,metabolic:.16,blood:.10};
const clamp=(v,lo=0,hi=100)=>Math.max(lo,Math.min(hi,v));
const finite=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&Number.isFinite(Number(v));
const num=v=>finite(v)?Number(v):null;
const DAY=86400000;
// All four explicit identity fields must agree before a laboratory reference
// can affect the selected pet. A conflicting profile.id is not metadata.
const ownerClaims=x=>[x?.petId,x?.ownerPetId,x?.profile?.petId,x?.profile?.id].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='').map(String);
const ownerConflict=x=>new Set(ownerClaims(x)).size>1;
const ownerKey=x=>{const ids=ownerClaims(x),fallback=x?.profile?.id;
 return ownerConflict(x)?null:ids[0]??(fallback===null||fallback===undefined||String(fallback).trim()===''?null:String(fallback));};
const localToday=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
function strictDate(d){if(!/^\d{4}-\d{2}-\d{2}$/.test(d||''))return false;const t=Date.parse(d+'T12:00:00Z');return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===d;}
function birthAge(birthDate,day){if(!strictDate(birthDate)||!strictDate(day)||birthDate>day)return null;
 return (Date.parse(day+'T12:00:00Z')-Date.parse(birthDate+'T12:00:00Z'))/(365.2425*DAY);
}
function family(name){const n=String(name||'').toUpperCase();
 if(/NT.?PROBNP|TROPONIN|CARDIAC|ECHO|心臟|心脏|心超|心肌/.test(n))return 'cardiac';
 if(/SPO2|BLOOD GAS|RESPIR|氣道|气道|呼吸|血氧|氧飽和|氧饱和|LUNG/.test(n))return 'resp';
 if(/CREA|CREATININE|\bBUN\b|SDMA|腎|肾|尿素/.test(n))return 'renal';
 if(/\bALT\b|\bAST\b|\bALP\b|\bGGT\b|BILE|TBIL|肝|胆紅|胆红/.test(n))return 'hepatic';
 if(/GLU|FRUCTOSAMINE|\bBCS\b|CHOL|TRIG|TRIGLY|BODY CONDITION|OBESITY|肥胖|體況|体况|糖|體重|体重/.test(n))return 'metabolic';
 return 'blood';
}
const normUnit=s=>String(s||'').toLowerCase().replace(/μ|µ/g,'u').replace(/\s/g,'');
const conversion={
  'crea':{ 'mg/dl>umol/l':88.4,'umol/l>mg/dl':1/88.4 },
  'creatinine':{'mg/dl>umol/l':88.4,'umol/l>mg/dl':1/88.4},
  'glu':{'mg/dl>mmol/l':1/18.018,'mmol/l>mg/dl':18.018},
  'glucose':{'mg/dl>mmol/l':1/18.018,'mmol/l>mg/dl':18.018}
};
function matchUnit(value,unit,refUnit,name){const a=normUnit(unit),b=normUnit(refUnit);if(!a||!b)return {value:null,unit:b,error:'reference_unit_required'};if(a===b)return {value,unit:b,converted:false};const n=String(name||'').trim().toLowerCase(),factor=(conversion[n]||{})[a+'>'+b];return factor?{value:value*factor,unit:b,converted:true}:{value:null,unit:b,error:'unit_mismatch'};}
function context(profile={},day){profile=profile&&typeof profile==='object'?profile:{};
 let years=birthAge(profile.birthDate,day);const weight=num(profile.weightKg??profile.weight),height=num(profile.heightCm);
 const t=strictDate(day)?Date.parse(day+'T12:00:00Z'):NaN,now=Date.now();
 if(years===null){years=num(profile.ageYears??profile.age);
  if(years!==null&&Number.isFinite(t))years=Math.max(0,years-Math.max(0,now-t)/DAY/365.2425);
 }
 return {species:String(profile.species||'').toLowerCase(),breed:String(profile.breed?.en||profile.breed||'').toLowerCase(),ageYears:years,weightKg:weight,heightCm:height,bcs:num(profile.bcs)};
}
function reference(row,profile={},date){profile=profile&&typeof profile==='object'?profile:{};
 if(ownerConflict(row)||ownerConflict(profile))return {ok:false,reason:'conflicting_pet_identity'};
 const reportOwner=ownerKey(row),targetOwner=ownerKey(profile);
 if(reportOwner&&targetOwner&&reportOwner!==targetOwner)return {ok:false,reason:'pet_identity_mismatch'};
 const c=context(profile,date);
 const reportedAge=num(row.ageAtExamYears),reportedWeight=num(row.weightAtExamKg);
 if(reportedAge!==null&&reportedAge<0||reportedWeight!==null&&reportedWeight<=0)return {ok:false,reason:'invalid_exam_snapshot'};
 if(reportedAge!==null)c.ageYears=reportedAge;
 if(reportedWeight!==null)c.weightKg=reportedWeight;
 else if(date&&Date.parse(date+'T12:00:00Z')<Date.now()-30*DAY)c.weightKg=null;
 const test=String(row.name||'').toUpperCase().trim();
 // BCS uses the veterinary 1–9 body-condition scheme, and only when actually measured.
 let low=num(row.referenceLow??row.refLow),high=num(row.referenceHigh??row.refHigh),basis='laboratory';
 if(test==='BCS'&&low===null&&high===null&&normUnit(row.unit)==='/9'){low=c.species==='cat'?5:4;high=5;basis='WSAVA_BCS';}
 if(low===null||high===null||high<=low&&basis!=='WSAVA_BCS'){
   // Exact BCS target of 5/9 (cat): tolerate equal bounds for distance scoring.
   if(!(basis==='WSAVA_BCS'&&low===5&&high===5))return {ok:false,reason:'missing_reference'};
 }
 const constraints=[['referenceAgeMinYears','referenceAgeMaxYears','ageYears'],['referenceWeightMinKg','referenceWeightMaxKg','weightKg'],['referenceHeightMinCm','referenceHeightMaxCm','heightCm']];
 for(const [mi,ma,key] of constraints){const a=num(row[mi]),b=num(row[ma]);if(a!==null||b!==null){
  if(key==='ageYears'&&num(row.ageAtExamYears)===null&&date&&Date.parse(date+'T12:00:00Z')<Date.now()-30*DAY&&birthAge(profile.birthDate,date)===null)return {ok:false,reason:'historical_age_unverified'};
  if(c[key]===null)return {ok:false,reason:'profile_required'};
  if(a!==null&&c[key]<a||b!==null&&c[key]>b)return {ok:false,reason:'reference_not_applicable'};
 }}
 if(row.referenceSpecies&&String(row.referenceSpecies).toLowerCase()!==c.species)return {ok:false,reason:'species_mismatch'};
 if(row.referenceBreed&&(!c.breed||!c.breed.includes(String(row.referenceBreed).toLowerCase())))return {ok:false,reason:'breed_mismatch'};
 // IMPORTANT: a lab interval that is explicitly adult-only cannot be applied to a juvenile.
 if(row.referenceLifeStage==='adult'){
  if(num(row.ageAtExamYears)===null&&date&&Date.parse(date+'T12:00:00Z')<Date.now()-30*DAY&&birthAge(profile.birthDate,date)===null)return {ok:false,reason:'historical_age_unverified'};
  if(c.ageYears===null)return {ok:false,reason:'profile_required'};
  if(c.ageYears<1)return {ok:false,reason:'age_incompatible'};
 }
 const v=num(row.value);if(v===null)return {ok:false,reason:'missing_value'};
 if(!normUnit(row.unit))return {ok:false,reason:'unit_required'};
 const referenceUnit=row.referenceUnit||(row.source==='sample'?row.unit:null);
 const transformed=matchUnit(v,row.unit,referenceUnit,row.name);if(transformed.error)return {ok:false,reason:transformed.error};
 return {ok:true,low,high,value:transformed.value,unit:transformed.unit,basis,referenceSource:row.referenceSource||'report',converted:transformed.converted,ageAtExam:c.ageYears,weightAtExam:c.weightKg,heightCm:c.heightCm};
}
function item(row,profile={},date){const r=reference(row,profile,date||row.date||localToday());const status=String(row.status||'unknown').toLowerCase();
 if(!r.ok){
   // A missing value/reference in bundled historic records can retain its
   // original flag-only presentation. It must NEVER override explicit proof
   // that this interval belongs to another species, age, body size, owner or
   // incompatible unit. The earlier broad fallback converted these errors
   // into 96-point 'normal' results.
   const historicFlagOnly=new Set(['missing_reference','reference_unit_required','unit_required','missing_value']);
   if(row.source==='sample'&&historicFlagOnly.has(r.reason)&&['normal','alert','critical'].includes(status))
    return {...row,family:family(row.name),score:status==='normal'?96:status==='alert'?55:30,level:status==='normal'?0:status==='alert'?1:2,kind:'fixture_status',reason:r.reason};
   return {...row,family:family(row.name),score:null,level:null,kind:'unverified',reason:r.reason};
 }
 const width=Math.max(Math.abs(r.high-r.low),r.basis==='WSAVA_BCS'?1:1e-9);
 const excess=r.value<r.low?r.low-r.value:r.value>r.high?r.value-r.high:0;
 let score;
 if(r.basis==='WSAVA_BCS'){
   // Ordinal body-condition scale must NOT be treated as a blood-lab concentration.
   // Research-only monotonic categories, not validated organ-disease likelihoods.
   const off=Math.max(0,r.low-r.value,r.value-r.high);
   score=off===0?96:off===1?84:off===2?65:off===3?43:30;
 }else score=excess===0?96:Math.round(clamp(90*Math.exp(-3.0*Math.pow(excess/width,1.12)),5,89));
 // A laboratory critical flag must never be hidden by a numerically small deviation.
 if(status==='critical')score=Math.min(score,45);
 const flagged=['alert','abnormal','critical'].includes(status),inRange=excess===0;
 if(flagged&&inRange||['normal','healthy','ok'].includes(status)&&!inRange){
  return {...row,family:family(row.name),score:null,level:null,kind:'needs_review',reason:'value_flag_conflict',reference:r};
 }
 const level=score>=90?0:score>=80?1:score>=60?2:3;
 return {...row,family:family(row.name),score,level,kind:'numeric',deviation:excess/width,reference:r};
}
function assess(entries=[],profile={},date=localToday()){
 profile=profile&&typeof profile==='object'?profile:{};
 const ref=Date.parse(date+'T12:00:00Z');if(!strictDate(date))return empty('invalid_date');
 const eligible=(Array.isArray(entries)?entries:[]).filter(x=>x&&strictDate(x.date)&&Date.parse(x.date+'T12:00:00Z')<=ref);
 if(!eligible.length)return empty('no_current_report');
 // A mixed-owner input must not become a plausible single examination after
 // same-date/report-ID grouping. Untagged legacy records are accepted only
 // when ALL records are untagged, keeping existing showroom histories intact.
 const tags=new Set(eligible.map(ownerKey).filter(Boolean)),target=ownerKey(profile);
 if(ownerConflict(profile)||eligible.some(ownerConflict)||tags.size>1||(tags.size===1&&eligible.some(x=>ownerKey(x)===null))||
   (target&&tags.size===1&&!tags.has(target)))return empty('mixed_pet_identity');
 // A reused imported ID on a different examination day is a separate report.
 const groups=[...new Map(eligible.map(x=>[(x.reportId||('legacy:'+x.date))+'\u0000'+x.date,{id:x.reportId||('legacy:'+x.date),date:x.date}])).values()].sort((a,b)=>b.date.localeCompare(a.date)||String(b.id).localeCompare(String(a.id)));
 function examine(group){
  const day=group.date;
  const current=eligible.filter(x=>(x.reportId||('legacy:'+x.date))===group.id&&x.date===day);
  // All tests from one physical examination must agree on test-day profile.
  // Mixed imported ages/weights must not yield an artificially coherent score.
  const conflict=(field,tolerance)=>{const values=current.map(x=>num(x[field])).filter(x=>x!==null);
   return values.length>1&&Math.max(...values)-Math.min(...values)>tolerance;};
  const reportProfileConflict=conflict('ageAtExamYears',.1)||conflict('weightAtExamKg',.1);
  const records=current.map(x=>{const assessed=item(x,profile,day);
   return reportProfileConflict?{...assessed,score:null,level:null,kind:'needs_review',reason:'report_profile_conflict'}:assessed;});
  const count=records.filter(x=>Number.isFinite(x.score)).length;
  const domains=Object.entries(DOMAIN_WEIGHTS).map(([key,weight])=>{
   const rows=records.filter(x=>x.family===key&&Number.isFinite(x.score));
   const avg=rows.length?rows.reduce((a,x)=>a+x.score,0)/rows.length:null;
   const min=rows.length?Math.min(...rows.map(x=>x.score)):null;
   const score=rows.length?Math.round(.70*avg+.30*min):null;
   return {key,weight,count:rows.length,score,alerts:rows.filter(x=>x.score<90)};
  });
  const observed=domains.filter(x=>x.score!==null),totalW=observed.reduce((a,x)=>a+x.weight,0);
  const sufficient=count>=2&&observed.length>=2;
  let score=sufficient?Math.round(observed.reduce((a,x)=>a+x.score*x.weight,0)/totalW):null;
  const alerts=records.filter(x=>Number.isFinite(x.score)&&x.score<90);
  // The report total is an actual renormalized weighted mean of the domain
  // scores shown to the owner. Prior severity caps could report 29 even when
  // EVERY visible domain was >=53. Keep severe individual findings prominent
  // in alerts, but do not secretly apply extra penalties to the total.
  // Consequently min(domain score) <= total <= max(domain score), allowing
  // only one-point display rounding at the boundary.
  if(score!==null)score=Math.round(clamp(score));
  const daysOld=Math.max(0,Math.round((ref-Date.parse(day+'T12:00:00Z'))/DAY));
  const usableNum=records.filter(x=>x.kind==='numeric').length;
  const quality=observed.length>=2?Math.min(1,totalW/.6):0;
  const confidence=Math.round(clamp(100*Math.exp(-daysOld/180)*quality*(count?(.4+.6*usableNum/count):0)));
  return {present:true,score,reportId:group.id,latest:day,daysOld,records,domains,alerts,count,confidence,coverage:Math.round(clamp(100*totalW)),source:'mixed',profile:{...context(profile,day),ageYears:num(current[0]?.ageAtExamYears)??context(profile,day).ageYears,weightKg:num(current[0]?.weightAtExamKg)??(Date.parse(day+'T12:00:00Z')<Date.now()-30*DAY?null:context(profile,day).weightKg)},reason:reportProfileConflict?'report_profile_conflict':score===null?'insufficient_scope':'scored'};
 }
 const scanned=groups.map(examine),chosen=scanned.find(x=>x.score!==null)||scanned[0];
 const pending=scanned.filter(x=>x.latest>chosen.latest&&x.score===null);
 // Carry explicit report owner to downstream prevention and long-term models;
 // without it, a validated result can lose its per-pet lineage on handoff.
 return {...chosen,petId:target||(tags.size===1?[...tags][0]:null),mostRecentSubmitted:groups[0]?.date??null,pendingLatest:pending[0]?.latest??null,
  pendingCount:pending.reduce((n,x)=>n+x.records.length,0),pendingRecords:pending.flatMap(x=>x.records),
  pendingAlerts:pending.flatMap(x=>x.alerts)};
}
function empty(reason){return {present:false,score:null,latest:null,daysOld:null,records:[],domains:[],alerts:[],count:0,confidence:0,coverage:0,reason};}
return {version:'candidate-lab-v2.1',assess,item,reference,context,birthAge,family,DOMAIN_WEIGHTS,matchUnit};
});
