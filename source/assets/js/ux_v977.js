/* DeepPet V9.77 — provenance-safe home advice, resting respiration and care timeline.
   Proven 15-pet showroom fixtures and previously approved scoring weights are unchanged. */
;(function(root){
 'use strict';
 const previous=root.render;
 if(typeof previous==='function')root.render=function(...args){
  const result=previous.apply(this,args);
  const footer=document.querySelector('#app .app-build-version');
  if(footer)footer.textContent='DeepPet · Version 9.77';
  return result;
 };
 root.DeepPetRelease977={version:'9.77',languages:['zh','zht','en','ja'],showcasePets:15,
  cardioWeights:{heart:.32,breath:.32,hrv:.20,stable:.16},
  energyRecoveryWeights:{energy:.40,recovery:.35,calm:.25},
  improvements:['null-score-does-not-become-red-zero',
   'owner-today-advice-derived-from-verified-signal-features',
   'no-synthetic-owner-respiratory-alerts',
   'true-owner-low-motion-breathing-trends',
   'owner-care-timeline-uses-verified-physiology',
   'localized-four-language-dynamic-advice'],
  medicalValidation:'candidate-wellness-trend-only'};
})(window);
