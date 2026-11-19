/* V10.56: exact owner-supplied collar photos in every pairing step and modal.
   The immutable COLLARS mapping in app_03.js also serves Me and the store.
   This layer never changes model selection, radio pairing, or device ownership. */
(function(root){'use strict';
 const photo=model=>model==='4g'?COLLARS.g4:COLLARS.bt;
 const name=model=>model==='4g'?'DeepPet 4G + GPS':'DeepPet Bluetooth';
 function picture(model,klass){
  const type=model==='4g'?'4g':'bt';
  return `<img class="${klass}" data-dp-product="${type}" src="${photo(type)}" alt="${name(type)}" decoding="async"/>`;
 }
 const originalWizard=wizardView;
 wizardView=function(){
  const raw=originalWizard(),holder=document.createElement('div');holder.innerHTML=raw;
  // Reassert exact physical variants, even after a language or step switch.
  holder.querySelectorAll('.pair-type-grid [data-type]').forEach(button=>{
   const model=button.dataset.type,image=button.querySelector('img');
   if(image&&['bt','4g'].includes(model)){
    image.src=photo(model);image.alt=name(model);image.dataset.dpProduct=model;
   }
  });
  const model=state.pairType==='4g'?'4g':'bt';
  if(state.pairStage===1){
   holder.querySelectorAll('.found-device .signal-icon').forEach(icon=>{
    icon.innerHTML=picture(model,'dp1056-scan-product');
   });
  }
  if(state.pairStage===3||state.pairStage===5){
   const heading=holder.querySelector('.wizard-head');
   if(heading){
    const selected=state.pairStage===5?'4g':model;
    heading.insertAdjacentHTML('afterbegin',picture(selected,'dp1056-progress-product'));
   }
  }
  holder.querySelectorAll('.pair-picked img').forEach(image=>{
   image.src=photo(model);image.alt=name(model);image.dataset.dpProduct=model;
  });
  return holder.innerHTML;
 };
 const originalModal=modalUI;
 modalUI=function(){
  const raw=originalModal();
  if(state.modal!=='pair-success')return raw;
  const holder=document.createElement('div');holder.innerHTML=raw;
  const model=state.connected?(state.deviceType==='4g'?'4g':'bt'):(state.pairType==='4g'?'4g':'bt');
  const scene=holder.querySelector('.dp1041-success,.dp1031-success-scene');
  if(scene){
   const anchor=scene.querySelector('.dp1041-success-kicker,.dp1031-success-device');
   if(anchor)anchor.insertAdjacentHTML('afterend',picture(model,'dp1056-success-product'));
  }
  return holder.innerHTML;
 };
 root.DeepPetProductPhotos1056=Object.freeze({bt:COLLARS.bt,g4:COLLARS.g4});
})(window);
