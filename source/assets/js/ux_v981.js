/* DeepPet V9.81 — measurement-context and time-weighted engineering release. */
;(function(root){
 'use strict';
 const previous=root.render;
 if(typeof previous==='function')root.render=function(...args){
  const result=previous.apply(this,args);
  const badge=document.querySelector('#app .app-build-version');
  if(badge)badge.textContent='DeepPet · Version 9.81';
  return result;
 };
 root.DeepPetRelease981={version:'9.81',languages:['zh','zht','en','ja'],showcasePets:15,
  cardioWeights:{heart:.32,breath:.32,hrv:.20,stable:.16},
  energyRecoveryWeights:{energy:.40,recovery:.35,calm:.25},
  rhythmWeights:{calm:.58,stable:.42},
  evidence:['20hz-all-three-channels-agree',
   'verified-beat-time-spans-at-least-175s-of-180s-window',
   'supplier-metric-duration-bound-to-observed-window',
   'supplier-signal-quality-in-zero-one-range',
   'quiet-vitals-and-hrv-are-not-substituted-from-active-windows',
   'baseline-per-metric-requires-matched-rest-or-activity-context',
   'duration-weighted-heart-breath-and-activity-aggregates',
   'showcase-histories-and-approved-scoring-weights-unchanged'],
  interpretation:'veterinary-wellness-trend-engine;empirical-clinical-validation-not-yet-performed'};
})(window);
