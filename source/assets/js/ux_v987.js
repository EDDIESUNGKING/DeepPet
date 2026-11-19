/* DeepPet V9.87 — deterministic same-day evidence and real-wear quality. */
(function(root){'use strict';
 const update=()=>{const badge=document.querySelector('#app .app-build-version');if(badge)badge.textContent='DeepPet · Version 9.87';};
 const previous=root.render;
 if(typeof previous==='function')root.render=function(...args){const result=previous.apply(this,args);update();return result;};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update,{once:true});else update();
 root.DeepPetRelease987={version:'9.87',release:'2026-11-14',showcasePets:15,
  evidence:['duplicate-date-rank-provenance-before-insertion-order',
   'equal-quality-conflicted-score-day-excluded','duplicate-day-not-double-counted',
   'live-20hz-unverified-wear-day-cannot-publish-healthy-composite',
   'unverified-supplier-hrv-gated-in-final-score','fifteen-rich-fixtures-preserved']};
})(typeof window!=='undefined'?window:globalThis);
