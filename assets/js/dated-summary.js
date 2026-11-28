/* V10.206: immutable dated archive projection. Does not synthesize observations
 * when the wall clock advances. Calendar slots, not past scores, roll forward. */
(function(root){'use strict';
 const fields=['rows','signature','models','days','scores','quality','alerts','hrvs','aggregates'];
 const archiveDate='2026-11-25';
 const add=(d,n)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
 const dateOK=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d+'T12:00:00Z'))&&add(d,0)===d;
 const emptyRow=date=>({date,food:null,weight:null,heart:null,breath:null,activity:null,rmssd:null,sdnn:null,nvgr:null,sleep:null,recovery:null,bio:null,sleepInterruptions:null,dpSignalInterrupted:true});
 const scoreKeys=['heart','breath','hrv','stable','cardio','sleep','energy','recovery','calm','activityRecovery','physiol','rhythm'];
 const validScore=v=>v===null||Number.isFinite(v)&&v>=0&&v<=100;
 function validDated(a,pet,asOf){
  if(!dateOK(asOf)||a?.pet!==pet||a.asOf!==asOf||!fields.every(k=>Array.isArray(a[k])&&a[k].length===30)||!Array.isArray(a.ref?.priorDates)||!Array.isArray(a.progress?.priorDates))return false;
  return a.rows.every((r,i)=>{const date=add(asOf,i-29),m=a.models[i],s=a.scores[i],d=a.days[i],q=a.quality[i],alerts=a.alerts[i];
   if(r?.date!==date||a.signature[i]?.[0]!==date||typeof q?.valid!=='boolean'||!Array.isArray(alerts))return false;
   // An incomplete or corrupted snapshot must never generate a mixed day's health score.
   if(m===null||s===null||d===null)return m===null&&s===null&&d===null&&!q.valid&&alerts.length===0;
   if(![m,s,d].every(x=>x?.date===date&&x.petId===String(pet))||!q.valid||!m.ref||!m.rest||!m.details||!m.linkAudit||!s.scores||!m.scores)return false;
   return scoreKeys.every(k=>Object.hasOwn(s.scores,k)&&Object.hasOwn(m.scores,k)&&validScore(s.scores[k])&&s.scores[k]===m.scores[k]);
  });
 }
 // Enforce agreement between a dated summary and its detailed waveform, not
 // only bounds and identity. Preserve null slots and compare unrounded aggregates.
 const waveKeys=['heart','breath','activity'];
 const validMetric=(v,k)=>v===null||typeof v==='number'&&Number.isFinite(v)&&(k==='activity'?v>=0:v>0)&&v<=({heart:350,breath:120,activity:120})[k];
 const mean=a=>{let n=0,sum=0;for(const v of a)if(Number.isFinite(v)){n++;sum+=v;}return n?sum/n:null;};
 const sameMetric=(a,b)=>a===null||b===null?a===b:Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=0.001;
 function matchesWave(d,a,i){
  if(!a||!Number.isInteger(i)||i<0||i>=30||!a.models?.[i]||d?.pet!==a.pet||d.date!==a.rows?.[i]?.date)return false;
  const g=a.aggregates?.[i];if(!g?.daily||!g?.hourly)return false;
  for(const k of waveKeys){const v=d[k],h=g.hourly[k];if(!Array.isArray(v)||v.length!==1440||!v.every(x=>validMetric(x,k))||!Array.isArray(h)||h.length!==24||!sameMetric(mean(v),g.daily[k]))return false;
   for(let j=0;j<24;j++)if(!sameMetric(mean(v.slice(j*60,j*60+60)),h[j]))return false;
  }
  if(g.activeMinutes!==d.activity.filter(v=>Number.isFinite(v)&&v>=35).length)return false;
  const h=a.hrvs?.[i],w=d.hrv;if(!!h!==!!w)return false;
  if(h)for(const k of ['rmssd','sdnn','nvgr','regularity','start','end'])if(k==='start'||k==='end'?h[k]!==w[k]:!sameMetric(h[k]??null,w[k]??null))return false;
  return true;
 }
 function validArchive(a,pet){return validDated(a,pet,archiveDate);}
 function missingQuality(limits){return {durationMin:null,contactPct:null,motionPct:null,nnIntervals:null,usableFraction:null,limits,reasons:['no_record'],valid:false,points:null,quiet:false,contact:'unknown',observedDayMinutes:0};}
 // No new inputs: the last 14 eligible prior days are unchanged until the
 // 45-day cutoff removes one. Then personalization weight is exactly zero.
 function referenceAt(a,date,groupRef){const old=a.progress;
  if(!old||!Array.isArray(old.priorDates))throw Error('Missing archived baseline');
  const prior=old.priorDates.filter(d=>d<date&&d>=add(date,-45));
  if(prior.length===old.priorDates.length)return old;
  const cal=(old.personalCalibrationDays||[]).filter(x=>prior.includes(x.date));
  return {...groupRef,initialAnchor:old.initialAnchor,priorDates:prior,validPriorDays:prior.length,ready:false,personalCalibrationDays:cal,personalHeartEligibleDays:cal.filter(x=>x.heart?.eligible&&x.heartMedian>=groupRef.hrLow&&x.heartMedian<=groupRef.hrHigh).length,personalBreathEligibleDays:cal.filter(x=>x.breath?.eligible&&x.breathMedian>=groupRef.rrLow&&x.breathMedian<=groupRef.rrHigh).length};
 }
 function projectAvailable(a,pet,asOf,groupRef){if(!validDated(a,pet,a?.asOf)||!dateOK(asOf)||asOf<a.asOf||a.asOf<archiveDate)throw Error('Invalid dated archive');if(asOf===a.asOf)return a;
  const byDate=new Map(a.rows.map((r,i)=>[r.date,i])),out={...a,asOf,archiveAsOf:a.asOf,ref:referenceAt(a,asOf,groupRef),progress:referenceAt(a,add(asOf,1),groupRef)};
  for(const k of fields)out[k]=[];
  const limits=a.quality.find(q=>q?.limits)?.limits;
  for(let j=0;j<30;j++){const date=add(asOf,j-29),i=byDate.get(date);if(i!==undefined){for(const k of fields)out[k].push(a[k][i]);continue;}
   out.rows.push(emptyRow(date));out.signature.push([date,null,null,null,null,null,false]);out.quality.push(missingQuality(limits));out.alerts.push([]);for(const k of ['models','days','scores','hrvs','aggregates'])out[k].push(null);
  }
  return out;
 }
 function project(a,pet,asOf,groupRef){if(!validArchive(a,pet))throw Error('Invalid dated archive');return projectAvailable(a,pet,asOf,groupRef);}
 // Investor-only replay of a complete, internally consistent source day.
 // The original dated archive remains immutable; new dates are stable on reload.
 function rollPreview(a,pet,asOf,groupRef){
  // Historical archive can be read exactly; new days must come from the wave worker.
  return project(a,pet,asOf,groupRef);
 }

 const api=Object.freeze({archiveDate,add,validArchive,validDated,matchesWave,project,projectAvailable,referenceAt,rollPreview});root.DeepPetDatedSummary=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
