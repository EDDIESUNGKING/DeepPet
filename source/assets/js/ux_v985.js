/* DeepPet V9.85: recency-safe exam interpretation and verified waveform lineage. */
(function(root){'use strict';
 const update=()=>{
  const badge=document.querySelector('#app .app-build-version');
  if(badge)badge.textContent='DeepPet · Version 9.85';
 };
 const previous=root.render;
 if(typeof previous==='function')root.render=function(...args){
  const result=previous.apply(this,args);update();return result;
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update,{once:true});
 else update();
 root.DeepPetRelease985={version:'9.85',recencyDays:180,release:'2026-11-14'};
})(typeof window!=='undefined'?window:globalThis);
