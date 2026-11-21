/* DeepPet 10.139 — period copy and duplicate Deep summary cleanup.
   Does not modify device streams, scores, records, risk levels or event detection. */
(function(){'use strict';
 const original=render;
 render=function(...args){
  const result=original.apply(this,args);
  if(state.tab==='deep'&&!state.detail){
   const page=document.querySelector('#app .dp-owner-deep');
   if(page){
    // This box restates the same score/description already shown in the
    // composite card below it; preserve all real emergency notices elsewhere.
    page.querySelectorAll('.dp-deep-alert-reasons').forEach(box=>box.remove());
    page.querySelectorAll('.dp127-one-observation').forEach(box=>box.remove());
    // Outdated duplicated RMSSD/SDNN explanation in the Energy tab.
    // The single-day cardio HRV glossary is the intended explanation home.
    if(Number(state.deepType)===2)page.querySelectorAll('.dp908-calm-evidence').forEach(box=>box.remove());
   }
  }
  return result;
 };
 window.DeepPetPeriodClarity142=Object.freeze({version:'10.139-period-clarity'});
})();
