/* DeepPet V10.75 — daily status and time-verified urgent episodes are distinct.
 * Triage only labels and filters existing evidence. It cannot create alerts.
 */
(function(root){'use strict';
 const minute=e=>Number.isInteger(e?.minute)&&e.minute>=0&&e.minute<1440;
 const seconds=e=>Number.isInteger(e?.localSecond)&&e.localSecond>=0&&e.localSecond<86400;
 const identity=(e,petId,date)=>e?.date===date&&(e.petId===undefined&&e.pet===undefined||Number(e.petId??e.pet)===Number(petId));
 function classify(event){
  if(!event||['daily-status','daily-score','low-score'].includes(event.source))return 'health-status';
  if(event.source==='rapid')return seconds(event)&&Array.isArray(event.observations)&&event.observations.length?'sudden':'unverified';
  if(event.source==='timed')return minute(event)?event.durationClass==='sudden'?'sudden':'sustained':'unverified';
  return 'unverified';
 }
 function emergencyOnly(events,{petId,date}){
  const seen=new Set(),result=[];
  for(const event of Array.isArray(events)?events:[]){
   if(!identity(event,petId,date))continue;
   const category=classify(event);
   if(!['sudden','sustained'].includes(category))continue;
   const clock=event.source==='rapid'?Math.floor(event.localSecond/60):event.minute;
   const channels=event.source==='rapid'?event.observations.map(o=>o.kind).sort().join('+'):event.kind||'';
   const id=`${event.source}|${clock}|${channels}`;
   if(seen.has(id))continue;seen.add(id);
   result.push({...event,dpEventClass:category});
  }
  return result;
 }
 function healthPriority(row,{date,petId}={}){
  if(!row?.scores||!Number.isFinite(row.scores.physiol)||!/^\d{4}-\d{2}-\d{2}$/.test(String(row.date)))return [];
  if(date!==undefined&&row.date!==date)return [];
  if(petId!==undefined&&row.petId!==undefined&&Number(row.petId)!==Number(petId))return [];
  if(row.source==='20hz-waveform'&&row.integrity?.realEvidenceValid!==true)return [];
  return ['cardio','sleep','activityRecovery'].flatMap(kind=>{
   const n=row.scores[kind];
   return Number.isFinite(n)&&n>=0&&n<=100&&Math.round(n)<80?[{kind,score:Math.round(n),date:row.date,category:'health-status',urgent:false}]:[];
  }).sort((a,b)=>a.score-b.score);
 }
 root.DeepPetEventTriage1075=Object.freeze({version:'10.75',classify,emergencyOnly,healthPriority});
})(window);
