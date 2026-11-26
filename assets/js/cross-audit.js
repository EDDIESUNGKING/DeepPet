/* DeepPet V10.134 — one source of truth for evidence-backed domain links.
 * A daily domain score is not a verified cause of another domain's score.
 * Shared rest/breathing inputs create mathematical covariance; expose this.
 * Real minute-level linkage is unavailable unless all timestamped source
 * streams are verified and bound to the SAME pet; never synthesize it.
 */
(function(root){'use strict';
const valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100;
const dateOK=s=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;};
const localDay=()=>typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):new Date().toISOString().slice(0,10);
function period(petIndex,days=7,asOf=null){
 const n=[1,7,30].includes(Number(days))?Number(days):7;
 const date=asOf||localDay();if(!dateOK(date))return {status:'invalid-date',petIndex,days:n};
 const ending=Date.parse(date+'T12:00:00Z'),start=ending-(n-1)*86400000;
 const rows=root.DeepPetSignalScoring?.getDaily?.(petIndex)||[];const byDate=new Map(),conflicts=new Set();
 for(const r of rows){if(!dateOK(r?.date))continue;const t=Date.parse(r.date+'T12:00:00Z');if(t<start||t>ending)continue;
  // Real-source days without verified wear or quality-approved scores cannot
  // be used as evidence of a temporal relationship.
  if(r.source==='20hz-waveform'&&root.DeepPetSignalScoring?.isVerifiedWear?.(r)!==true)continue;
  if(byDate.has(r.date)){const old=byDate.get(r.date);
   if(JSON.stringify(old?.scores)!==JSON.stringify(r?.scores))conflicts.add(r.date);
   continue;
  }byDate.set(r.date,r);
 }
 for(const d of conflicts)byDate.delete(d);
 const all=[...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date));
 const a=all.filter(r=>valid(r.scores?.cardio)&&valid(r.scores?.sleep));
 const b=all.filter(r=>valid(r.scores?.sleep)&&valid(r.scores?.energy));
 const c=all.filter(r=>valid(r.scores?.cardio)&&valid(r.scores?.sleep)&&valid(r.scores?.energy));
 const count=(rs,keys)=>rs.filter(r=>keys.every(k=>r.scores[k]<60)).length;
 return Object.freeze({status:'daily-only',petIndex,days:n,date,
  validDates:all.filter(x=>['cardio','sleep','energy'].some(k=>valid(x.scores?.[k]))).map(x=>x.date),observedDays:all.filter(x=>['cardio','sleep','energy'].some(k=>valid(x.scores?.[k]))).length,
  missingDates:n-all.filter(x=>['cardio','sleep','energy'].some(k=>valid(x.scores?.[k]))).length,ambiguousDates:[...conflicts].sort(),
  cardioSleepComparable:a.length,cardioSleepBothLow:count(a,['cardio','sleep']),
  sleepEnergyComparable:b.length,sleepEnergyBothLow:count(b,['sleep','energy']),
  threeComparable:c.length,allThreeLow:count(c,['cardio','sleep','energy']),
  nightToNextDayVerified:false,minuteAlignmentVerified:false,causationEstablished:false,
  // Shared features already influence more than one domain; the joint low
  // scores therefore are NOT independent evidence of a pathophysiologic link.
  sharedScoringFeatures:['sleep includes nightBreathRate when available','energy includes restHours','calm includes heart and breathing']});
}
function minuteOverlap(input){
 const keys=['heart','breath','sleep','energy'];const pid=String(input?.petUid||'');
 if(!pid)return Object.freeze({status:'pet-identity-required',verified:false,cardioSleepBins:0});
 const streams={};for(const k of keys){const rows=input[k];if(!Array.isArray(rows)||!rows.length)return Object.freeze({status:'four-verified-streams-required',verified:false,cardioSleepBins:0});
  if(rows.some(x=>String(x?.petUid||'')!==pid||x.verified!==true||x.valid===false||x.quality===false||!Number.isFinite(Date.parse(x.at))))return Object.freeze({status:'unverified-or-mixed-stream',verified:false,cardioSleepBins:0});
  streams[k]=rows;
 }
 const link=root.DeepPetSignalGuard132?.timeLinked?.(streams.heart,streams.breath,streams.sleep,streams.energy,{bucketMs:60000});
 return Object.freeze({...link,status:link?'time-aligned':'time-link-unavailable',verified:!!link,causationEstablished:false});
}
root.DeepPetCrossAudit133=Object.freeze({version:'10.134',period,minuteOverlap});
// Last-render wrapper prevents older, versioned UI modules from repainting
// the footer with stale V10.132 metadata; does not change scores or records.
if(typeof render==='function'){
 const priorRender=render;
 render=function(...args){const out=priorRender.apply(this,args);root.DeepPetBuildVersion='10.204';
  document.querySelectorAll('#app .app-build-version').forEach(el=>{el.textContent=el.textContent.replace(/10\.13[0-8]/g,'10.199');});
  return out;};
}
root.DeepPetBuildVersion='10.204';
function showBuild134(){root.DeepPetBuildVersion='10.204';document.querySelectorAll('#app .app-build-version').forEach(el=>{el.textContent=el.textContent.replace(/10\.(?:12[89]|13[0-8])/g,'10.199');});}
if(document.readyState==='complete')showBuild134();
else root.addEventListener('load',()=>setTimeout(showBuild134,0),{once:true});
})(window);
