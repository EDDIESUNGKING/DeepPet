/* Cohort evidence layer: species, age and weight matched reference rows, no arbitrary age or weight penalties.
   Never infer clinical norms from 15 fictional pets. In the absence of an independently validated
   reference population, the system explicitly reports missing peer evidence. */
(function(root,factory){const a=factory();if(typeof module==='object'&&module.exports)module.exports=a;if(root)root.DeepPetCohort920=a;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const fin=x=>typeof x==='number'&&Number.isFinite(x),cap=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
 function match(profile,rows){const species=String(profile.species||'').toLowerCase(),age=Number(profile.ageYears??profile.age),kg=Number(profile.weightKg??profile.weight);
  if(!fin(age)||!fin(kg)||kg<=0)return [];
  return (rows||[]).filter(r=>r.verified===true&&r.n>=30&&String(r.species||'').toLowerCase()===species&&age>=r.ageMin&&age<=r.ageMax&&kg>=r.weightMin&&kg<=r.weightMax&&r.sourceId&&r.methodId);
 }
 function metric(value,reference){if(!fin(value)||!reference||!fin(reference.low)||!fin(reference.high)||reference.high<=reference.low)return null;
  const width=reference.high-reference.low,dist=value<reference.low?(reference.low-value)/width:value>reference.high?(value-reference.high)/width:0;
  return Math.round(cap(dist===0?96:90*Math.exp(-3*dist)));
 }
 function merge(personalScores,features,profile,registry=[]){const rows=match(profile,registry).sort((a,b)=>{const width=r=>(r.ageMax-r.ageMin)*100+(r.weightMax-r.weightMin);return width(a)-width(b)||b.n-a.n;});const ref=rows[0];if(!ref)return {scores:{...personalScores},available:false,reason:'no_validated_matched_peer_reference',weightPeer:0,weightPersonal:1};
  const result={...personalScores},audit={};const keys=[['heart','quietHeartRate'],['breath','quietBreathRate']];
  for(const [k,raw] of keys){const peer=metric(features?.[raw],ref.metrics?.[raw]);if(fin(peer)&&fin(result[k])){audit[k]={peer,personal:result[k],measured:features[raw],interval:ref.metrics[raw]};result[k]=Math.round(.70*peer+.30*result[k]);}}
  const impact=Object.keys(audit).length>0;
  return {scores:result,available:impact,reason:impact?'matched_reference':'missing_measurement',weightPeer:impact?.70:0,weightPersonal:impact?.30:1,sourceId:impact?ref.sourceId:null,comparison:audit};
 }
 return {version:'9.20-peer-layer',match,metric,merge};
});
