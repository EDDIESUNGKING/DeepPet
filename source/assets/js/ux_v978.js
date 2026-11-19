/* DeepPet V9.78 — explanation/source consistency, with scoring inputs unchanged. */
;(function(root){
 'use strict';
 const previous=root.render;
 if(typeof previous==='function')root.render=function(...args){
  const result=previous.apply(this,args);
  const footer=document.querySelector('#app .app-build-version');
  if(footer)footer.textContent='DeepPet · Version 9.78';
  return result;
 };
 root.DeepPetRelease978={version:'9.78',languages:['zh','zht','en','ja'],showcasePets:15,
  cardioWeights:{heart:.32,breath:.32,hrv:.20,stable:.16},
  energyRecoveryWeights:{energy:.40,recovery:.35,calm:.25},
  physiologyWeights:{cardio:.42,sleep:.30,activityRecovery:.28},
  rhythmWeights:{calm:.58,stable:.42},
  improvements:['live-home-narrative-ignores-missing-domain-subscores',
   'home-cardio-explanation-names-all-four-contributing-indicators',
   'same-day-lowest-subscore-shown-in-deep-advice',
   'alert-reasons-match-scoring-domain-and-date',
   'four-language-dynamic-subscore-explanations'],
  medicalValidation:'candidate-wellness-trend-only'};
})(window);
