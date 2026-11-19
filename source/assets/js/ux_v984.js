/* DeepPet V9.84 — identity-chain verification and longitudinal chart continuity. */
;(function(root){
 'use strict';
 const previous=root.render;
 if(typeof previous==='function')root.render=function(...args){
  const result=previous.apply(this,args);
  const badge=document.querySelector('#app .app-build-version');
  if(badge)badge.textContent='DeepPet · Version 9.84';
  return result;
 };
 root.DeepPetRelease984={version:'9.84',languages:['zh','zht','en','ja'],showcasePets:15,
  preservedTabs:['home','deep','health','me'],publicDeepRanges:[1,7,30],personalBaselineDays:14,
  preservedWeights:{cardio:{heart:.32,breath:.32,hrv:.20,stable:.16},
   activityRecovery:{energy:.40,recovery:.35,calm:.25},
   bodyState:{cardio:.42,sleep:.30,activityRecovery:.28},rhythm:{calm:.58,stable:.42}},
  evidence:['long-term-model-binds-owner-to-pet-profile',
   'prevention-trend-requires-matching-owner',
   'report-and-alerts-reject-conflicting-owner-fields',
   'old-exam-rows-bound-to-pet-slot-in-memory-without-mutation',
   'real-sdk-session-requires-unique-pet-identity',
   'longitudinal-charts-do-not-bridge-unobserved-calendar-days',
   'fifteen-rich-pet-histories-and-records-preserved'],
  interpretation:'deterministic wellness review; veterinary thresholds still need independent validation'};
})(window);
