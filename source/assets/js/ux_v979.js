/* DeepPet V9.79 — preserve medical-scoring lineage in every detail view. */
;(function(root){
 'use strict';
 const previous=root.render;
 if(typeof previous==='function')root.render=function(...args){
  const result=previous.apply(this,args);
  const badge=document.querySelector('#app .app-build-version');
  if(badge)badge.textContent='DeepPet · Version 9.79';
  return result;
 };
 root.DeepPetRelease979={version:'9.79',languages:['zh','zht','en','ja'],showcasePets:15,
  cardioWeights:{heart:.32,breath:.32,hrv:.20,stable:.16},
  energyRecoveryWeights:{energy:.40,recovery:.35,calm:.25},
  rhythmWeights:{calm:.58,stable:.42},
  improvements:['rhythm-dialog-no-equal-average-claim',
   'rhythm-null-subscore-remains-unavailable-not-red-zero',
   'rhythm-guidance-does-not-claim-all-normal-when-component-missing',
   'hrv-evidence-uses-verified-same-date-raw-metrics-for-owner-pets',
   'hrv-evidence-requires-both-valid-rmssd-and-sdnn',
   'hrv-evidence-displays-real-valid-day-count',
   'complete-japanese-rhythm-finding-text'],
  medicalValidation:'candidate-wellness-only'};
})(window);
