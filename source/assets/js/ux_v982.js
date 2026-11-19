/* DeepPet V9.82 — owner-safe baselines, chronological evidence, and coupled trends. */
;(function(root){
 'use strict';
 const previous=root.render;
 if(typeof previous==='function')root.render=function(...args){
  const result=previous.apply(this,args);
  const badge=document.querySelector('#app .app-build-version');
  if(badge)badge.textContent='DeepPet · Version 9.82';
  return result;
 };
 root.DeepPetRelease982={version:'9.82',languages:['zh','zht','en','ja'],showcasePets:15,
  preservedTopTabs:['home','deep','health','me'],
  publicDeepRanges:[1,7,30],personalBaselineDays:14,
  cardioWeights:{heart:.32,breath:.32,hrv:.20,stable:.16},
  energyRecoveryWeights:{energy:.40,recovery:.35,calm:.25},
  rhythmWeights:{calm:.58,stable:.42},
  evidence:[
   'owner-bound-history-across-baseline-and-long-term-wellness',
   'chronological-last-fourteen-valid-days-not-array-index',
   'strictly-increasing-window-contained-beat-timestamps',
   'all-declared-20hz-rates-validated-at-sdk-append',
   'normal-labs-never-upgrade-concerning-wearable-trends',
   'two-channel-declines-need-two-of-three-concordant-recent-days',
   'missing-composite-has-zero-declared-score-confidence',
   'existing-fifteen-case-records-and-severity-colors-unchanged'],
  interpretation:'individual-wellness-trend-prototype;requires-veterinary-ecg-validation'};
})(window);
