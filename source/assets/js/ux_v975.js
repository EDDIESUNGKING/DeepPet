/* DeepPet V9.75 release metadata.  Weighting is a testable candidate policy,
   not a veterinary-validated diagnostic probability. */
;(function(root){
 'use strict';
 const previous=root.render;
 if(typeof previous==='function')root.render=function(...args){
  const result=previous.apply(this,args);
  const footer=document.querySelector('#app .app-build-version');
  if(footer)footer.textContent='DeepPet · Version 9.75';
  return result;
 };
 root.DeepPetRelease975={version:'9.75',languages:['zh','zht','en','ja'],showcasePets:15,
  cardioWeights:{heart:.32,breath:.32,hrv:.20,stable:.16},
  energyRecoveryWeights:{energy:.40,recovery:.35,calm:.25},
  medicalValidation:'candidate-wellness-trend-only'};
})(window);
