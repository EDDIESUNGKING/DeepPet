/* DeepPet V9.83 — per-pet score, lab, alert, and recent-trend provenance. */
;(function(root){
 'use strict';
 const previous=root.render;
 if(typeof previous==='function')root.render=function(...args){
  const result=previous.apply(this,args);
  const badge=document.querySelector('#app .app-build-version');
  if(badge)badge.textContent='DeepPet · Version 9.83';
  return result;
 };
 root.DeepPetRelease983={version:'9.83',languages:['zh','zht','en','ja'],showcasePets:15,
  preservedTabs:['home','deep','health','me'],publicDeepRanges:[1,7,30],personalBaselineDays:14,
  preservedWeights:{cardio:{heart:.32,breath:.32,hrv:.20,stable:.16},
   activityRecovery:{energy:.40,recovery:.35,calm:.25},
   bodyState:{cardio:.42,sleep:.30,activityRecovery:.28},rhythm:{calm:.58,stable:.42}},
  evidence:['calendar-period-rejects-mixed-pet-identity-before-date-dedup',
   'legacy-lab-status-cannot-override-incompatible-veterinary-reference',
   'lab-reports-check-owner-before-report-and-date-grouping',
   'informational-extrema-never-gate-health-scores',
   'real-alert-requires-same-owner-and-verified-signal-provenance',
   'verified-sdk-days-persist-pet-identity-and-isolate-storage-buckets',
   'recent-14-day-trends-require-45-day-recency-context',
   'all-fifteen-rich-pet-histories-and-existing-color-tiers-preserved'],
  interpretation:'wellness-engineering-audit;clinical-thresholds-require-independent-veterinary-validation'};
})(window);
