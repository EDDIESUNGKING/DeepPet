/* V10.61: independently detected, quality-gated, rest-context alerts only. */
(function(root){
 'use strict';
 const detector=root.DeepPetContextAlertAlgorithm1061;
 const cache=new Map();
 function eligible(){
  if(state.emptyPreview===true||!Number.isInteger(state.dog)||state.dog<0||state.dog>=dogs.length)return false;
  const p={...allPets()[state.dog],...(state.petOverrides?.[state.dog]||{})};
  return !!p&&!p.dpFixtureInvalidated&&!p.dpFreshPet&&!p.freeCare&&
   !(typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements());
 }
 function currentSeries(date){
  try{return dpSignals(date,['heart','breath','activity']);}catch{return null;}
 }
 function realCandidates(date,scored){
  // Real pets never use the gallery baseline. A complete, verified owner-owned
  // minute series is required for this detector. Until then, retain the older
  // separate verified-SDK alert channel (null signals safe fallback).
  const scoring=root.DeepPetSignalScoring;
  if(scored.source!=='20hz-waveform'||scored.integrity?.realEvidenceValid!==true)return [];
  const records=scoring?.getFeatures?.(state.dog)||[];
  const verified=records.filter(r=>r?.source==='20hz-waveform'&&
   scoring?.isVerifiedWear?.(r)===true&&r.date<=date);
  if(!verified.some(r=>r.date===date))return [];
  const today=currentSeries(date);
  if(!today||!['heart','breath','activity'].every(k=>Array.isArray(today[k])&&today[k].length===1440))return null;
  const history=verified.filter(r=>r.date<date).map(r=>({date:r.date,valid:true,series:currentSeries(r.date)}));
  // Without three eligible context-matched days, the previous explicit,
  // quality-checked real collar event feed is the only authorized fallback.
  if(history.length<3)return null;
  const events=detector.detect({date,series:today,history});
  return root.DeepPetUX1059?.combineCoincident?.(events)||events;
 }
 function forCurrentPet(date,scored){
  if(!scored||scored.date!==date)return [];
  if(typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements())return realCandidates(date,scored);
  if(!eligible())return [];
  const records=demoRecords(state.dog),todayIndex=records.findIndex(r=>r.date===date);
  if(todayIndex<0||validDaySample(records[todayIndex],todayIndex)?.valid!==true)return [];
  const key=`${state.dog}|${date}|${state.baselineDaysByPet?.[state.dog]??'default'}|${state.dpAlertScenarioVersion??'base'}`;
  if(cache.has(key))return cache.get(key);
  const history=records.flatMap((row,index)=>{
   if(row.date>=date||validDaySample(row,index)?.valid!==true)return [];
   return [{date:row.date,valid:true,series:currentSeries(row.date)}];
  });
  const events=detector.detect({date,series:currentSeries(date),history});
  const combined=root.DeepPetUX1059?.combineCoincident?.(events)||events;
  cache.set(key,combined);
  if(cache.size>90)cache.clear();
  return combined;
 }
 // The UI tour is ephemeral. Never let an old localStorage value or a new
 // code archive resume it at stage 4. Pet records and preferences are intact.
 if(typeof state==='object')state.tourStep=0;
 root.DeepPetContextAlerts1061=Object.freeze({version:'10.61',forCurrentPet,eligible});
})(window);
