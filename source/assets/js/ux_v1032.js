/* DeepPet V10.32 — restrained interaction polish, no data or route changes.
   Animations run only on a completed pet switch or an in-place Deep date
   change, after the destination has already been rendered. */
(function(root){
 'use strict';
 const owner=()=>state.emptyPreview?'blank':`pet:${state.dog}`;
 const deepSelection=()=>state.tab==='deep'?`${state.deepType}|${state.range}|${state.deepSelectedDate||''}`:null;
 let previousOwner=owner();
 let previousTab=state.tab;
 let previousDeep=deepSelection();
 const renderBeforePolish=render;
 render=function(reset=false){
  const nextOwner=owner(),nextDeep=deepSelection();
  const changedPet=nextOwner!==previousOwner;
  const changedDeep=!changedPet&&state.tab==='deep'&&previousTab==='deep'&&previousDeep!==null&&nextDeep!==previousDeep;
  // The existing renderer replaces the page before any transition, so a prior
  // pet's sensitive values are never left visible beneath the new page.
  renderBeforePolish(reset);
  const main=document.querySelector('#app .app-main');
  if(main){
   if(changedPet)main.classList.add('dp1032-pet-enter');
   else if(changedDeep&&main.querySelector('.dp-owner-deep'))main.classList.add('dp1032-date-focus');
  }
  previousOwner=nextOwner;
  previousTab=state.tab;
  previousDeep=nextDeep;
  document.querySelectorAll('#app .app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.32');
 };
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.32',integrity:[
  ...(root.DeepPetRelease?.integrity||[]),
  'same-pet-selection-preserves-current-context',
  'subtle-pet-switch-enter-after-identity-replacement',
  'in-place-deep-date-focus-without-wave-redraw-effects',
  'today-primary-item-static-focus-accent',
  'multi-line-accessible-toast-with-reduced-motion'
 ]};
})(window);
