/* DeepPet V10.14 — a single visible precision contract for wellness age. */
(function(root){'use strict';
 const formatYears=value=>root.DeepPetMetric1015?.format('age',value)??(typeof value==='number'&&Number.isFinite(value)?value.toFixed(1):'—');
 const roundedDifference=(estimate,actual)=>{
  if(!Number.isFinite(estimate)||!Number.isFinite(actual))return null;
  return root.DeepPetMetric1015?.difference('age',estimate,actual)??Math.round((Number(formatYears(estimate))-Number(formatYears(actual)))*10)/10;
 };
 const priorRender=render;
 render=function(reset=false){
  priorRender(reset);
  const app=document.getElementById('app');if(!app)return;
  // The same health-model field appears in Home, Me and "View analysis".
  // Always read the current selected pet; do not cache a preceding pet's age.
  const candidates=app.querySelectorAll('.dp928-model-card .dp928-age-metric strong');
  if(candidates.length){
   const age=root.DeepPetAudit925?.model?.(state.dog)?.ageYears;
   for(const element of candidates)element.textContent=formatYears(age);
  }
  app.querySelectorAll('.app-build-version').forEach(element=>element.textContent='DeepPet · Version 10.14');
 };
 root.DeepPetAgePrecision1014={version:'10.14',formatYears,roundedDifference};
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.14',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'wellness-age-home-analysis-single-decimal','age-differences-match-rendered-values','pet-scoped-age-render']};
})(window);
