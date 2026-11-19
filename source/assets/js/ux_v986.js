/* DeepPet V9.86 — qualified pet evidence and truthful day denominators. */
(function(root){'use strict';
 const update=()=>{
  const badge=document.querySelector('#app .app-build-version');
  if(badge)badge.textContent='DeepPet · Version 9.86';
 };
 const previous=root.render;
 if(typeof previous==='function')root.render=function(...args){
  const result=previous.apply(this,args);update();return result;
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update,{once:true});
 else update();
 root.DeepPetRelease986={version:'9.86',release:'2026-11-14',showcasePets:15,
  evidence:['identity-required-for-selected-pet-trends','named-pet-report-owner-required',
   'out-of-range-component-values-excluded','trend-advice-reports-actual-day-counts',
   'sdk-epoch-range-check-before-state-mutation','new-pet-no-data-reason-honored']};
})(typeof window!=='undefined'?window:globalThis);
