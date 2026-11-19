/* DeepPet V9.76 release metadata — verified signal/temporal evidence hygiene.
   Previously agreed user-visible weighting, colors, and navigation stay fixed. */
;(function(root){
 'use strict';
 const previous=root.render;
 if(typeof previous==='function')root.render=function(...args){
  const result=previous.apply(this,args);
  const footer=document.querySelector('#app .app-build-version');
  if(footer)footer.textContent='DeepPet · Version 9.76';
  return result;
 };
 root.DeepPetRelease976={version:'9.76',languages:['zh','zht','en','ja'],showcasePets:15,
  cardioWeights:{heart:.32,breath:.32,hrv:.20,stable:.16},
  energyRecoveryWeights:{energy:.40,recovery:.35,calm:.25},
  improvements:['typed-array-waveform-support','strict-alignment','observed-night-quiet-time',
   'epoch-second-precision','quality-gated-hrv-timestamps','comparable-effort-recovery',
   'verified-strongest-event'],
  medicalValidation:'candidate-wellness-trend-only'};
})(window);
