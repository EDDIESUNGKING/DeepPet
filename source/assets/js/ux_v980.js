/* DeepPet V9.80 — four-language evidence-honest HRV release contract. */
;(function(root){
 'use strict';
 const previous=root.render;
 if(typeof previous==='function')root.render=function(...args){
  const result=previous.apply(this,args);
  const badge=document.querySelector('#app .app-build-version');
  if(badge)badge.textContent='DeepPet · Version 9.80';
  return result;
 };
 root.DeepPetRelease980={version:'9.80',languages:['zh','zht','en','ja'],showcasePets:15,
  cardioWeights:{heart:.32,breath:.32,hrv:.20,stable:.16},
  energyRecoveryWeights:{energy:.40,recovery:.35,calm:.25},
  rhythmWeights:{calm:.58,stable:.42},
  evidence:['paired-dated-eligible-rmssd-and-sdnn','no-null-to-zero-averages',
   '14-valid-hrv-days-required-for-personal-hrv-reference',
   'species-aware-resting-hrv-context','strict-showcase-hrv-quality-gate',
   'same-valid-source-across-deep-and-calm-summary',
   'four-locales-hrv-help','cached-feline-hrv-only-correction'],
  validation:'candidate-veterinary-wellness-trend-model;not-disease-probability'};
})(window);
