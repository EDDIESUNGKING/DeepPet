/* DeepPet V10.97 — owner lifecycle and cross-state button contract.
 * One visual structure across gallery, profile-only and completely blank pets.
 * No writes or physiology are synthesized for the blank identity.
 */
(function(root){'use strict';
 if(typeof onAction!=='function')return;
 const prior=onAction;
 const blankMeControls=new Set(['edit-pet','avatar-change','dp-friend-menu']);
 const harmlessHealthControls=new Set([
  'health-back','health-summary-range','food-window','food-day',
  'report-toggle-more','report-trends-open','report-open'
 ]);
 const profileCreate=()=>prior({dataset:{action:'pet-add'}});
 onAction=function(target){
  const action=target?.dataset?.action;
  if(state.emptyPreview===true&&action){
   // Keep all original profile buttons/icons visible, but never edit Milo's
   // identity or photograph when the selected profile is actually blank.
   if(state.tab==='me'&&!state.detail&&blankMeControls.has(action))return profileCreate();
   // Blank Health details use the exact ordinary forms. The forms cannot
   // mutate an unregistered animal: offer profile creation on save/add.
   if(state.tab==='health'&&state.detail&&target?.closest?.('.care-record-page')&&
      !harmlessHealthControls.has(action))return profileCreate();
  }
  return prior.apply(this,arguments);
 };
 const hasAcceptedOwnerDay=()=>state.emptyPreview!==true&&typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements()&&
  (root.DeepPetSignalScoring?.getDaily?.(state.dog)||[]).some(d=>d?.source==='20hz-waveform'&&root.DeepPetSignalScoring?.isVerifiedWear?.(d)===true);
 root.DeepPetOwnerLifecycle1097=Object.freeze({
  version:'10.97',
  isProfileBlank:()=>state.emptyPreview===true,
  isAwaitingSignals:()=>state.emptyPreview!==true&&typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements()&&!hasAcceptedOwnerDay(),
  hasVerifiedSignals:hasAcceptedOwnerDay
 });
})(window);
