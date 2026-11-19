/* DeepPet V9.89: real-mode charts and fit quality use the SAME accepted day
   selected for scoring, not an arbitrary raw saved-array entry. The existing
   fifteen showroom fixtures and all their rich records are left untouched. */
(function(){
 'use strict';
 window.DeepPetRelease={version:'9.89',name:'DeepPet',verifiedIngestion:'canonical-quality-ranked'};
 const scoring=()=>window.DeepPetSignalScoring;
 const realMode=index=>{
  const animal={...(allPets()[index]||{}),...(state.petOverrides?.[index]||{})};
  return index>=dogs.length||animal.dpFixtureInvalidated===true||animal.dpFreshPet===true||animal.freeCare===true;
 };
 const verifiedDay=(index,date)=>{
  const features=scoring()?.getFeatures?.(index);
  return Array.isArray(features)?features.find(d=>d?.date===date&&d.source==='20hz-waveform'&&scoring()?.isVerifiedWear?.(d)===true)||null:null;
 };
 if(typeof dpSignals==='function'){
  const priorSignals=dpSignals;
  dpSignals=function(date,wanted=null){
   if(realMode(state.dog)&&!verifiedDay(state.dog,date)){
    const out={};for(const key of wanted||['heart','breath','activity','rest'])out[key]=[];
    return out;
   }
   return priorSignals(date,wanted);
  };
 }
 if(typeof qualityForDay==='function'){
  const priorQuality=qualityForDay;
  qualityForDay=function(index,dogIndex=state.dog){
   const existing=priorQuality(index,dogIndex);
   if(!realMode(dogIndex))return existing;
   const date=iso(dateAdd(localDate(),index-29)),day=verifiedDay(dogIndex,date);
   if(!day)return {...existing,durationMin:null,contactPct:null,motionPct:null,nnIntervals:null,
    usableFraction:null,valid:false,reasons:['no_record'],points:null,quiet:false,contact:'unknown'};
   const q=day.quality||{},value=key=>typeof q[key]==='number'&&Number.isFinite(q[key])?q[key]:null;
   const seconds=value('observedSeconds'),motion=value('motionPct'),contact=value('contactPct'),intervals=value('nnIntervals');
   return {...existing,durationMin:seconds===null?null:+(seconds/60).toFixed(1),
    contactPct:contact,motionPct:motion,nnIntervals:intervals,usableFraction:value('usableFraction'),
    valid:true,reasons:[],points:intervals,
    quiet:motion!==null&&motion<=existing.limits.motionMax,
    contact:contact!==null&&contact>=existing.limits.contactMin?'good':'unknown'};
  };
 }
})();
