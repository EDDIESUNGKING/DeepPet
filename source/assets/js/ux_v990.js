/* DeepPet V9.90: showroom wellness and portrait restoration.
   V9.92 correction: Blank and profile-only New Pet are TWO intentional,
   independently selectable states. Never redirect or migrate Blank to New Pet. */
(function(root){'use strict';
 root.DeepPetRelease={version:'9.90',name:'DeepPet',tourWidthCssPx:393,petSwitch:'blank-and-profile-only-new-pet'};
 const newPetIndex=()=>allPets().findIndex(p=>p?.dpFreshDemo===true);
 // The original gallery ordering and dpActivateBlank() already support both
 // identities. The V9.90 overrides accidentally erased that distinction.
 function preserveNewPetPortrait(app){
  const id=newPetIndex();if(id<0||state.dog!==id||state.emptyPreview)return;
  const hero=app.querySelector('.home-hero-poster');
  if(hero&&!state.petOverrides?.[id]?.photo&&!hero.style.backgroundImage.includes('new_pet_shiba_hero_v1002.jpg')){
   // A CSS background silently disappears on a broken uploaded URL. A second
   // background layer is a visual fallback, not a mutation of the saved photo.
   hero.style.backgroundImage += ', url("assets/new_pet_shiba_hero_v1002.jpg")';
  }
 }
 function restoreWellnessCard(app){
  if(state.emptyPreview||state.detail||state.tab!=='me')return;
  if(app.querySelector('.dp928-model-card'))return;
  const api=root.DeepPetAudit925;
  if(!api||typeof api.modelCard!=='function')return;
  const html=api.modelCard();
  const pad=app.querySelector('.app-main>.app-pad');if(!pad)return;
  const anchor=state.tab==='home'?pad.querySelector('.summary-card,.home-summary,.dp-today-focus'):
   pad.querySelector('.profile-hero,.me-profile-card,.me-profile-head');
  if(anchor)anchor.insertAdjacentHTML('afterend',html);
  else{const footer=pad.querySelector('.footer-space');if(footer)footer.insertAdjacentHTML('beforebegin',html);else pad.insertAdjacentHTML('beforeend',html);}
 }
 const previousRender=render;
 render=function(reset=false){
  previousRender(reset);
  const app=document.getElementById('app');if(!app)return;
  preserveNewPetPortrait(app);
  restoreWellnessCard(app);
  for(const el of app.querySelectorAll('.app-build-version'))el.textContent='DeepPet · Version 9.90';
 };
 document.addEventListener('error',event=>{
  const img=event.target;
  if(!(img instanceof HTMLImageElement)||img.dataset.dp990Fallback==='yes')return;
  const holder=img.closest('[data-action="select-pet"],.me-profile-card,.me-profile-head');
  if(!holder)return;
  const index=Number(holder.dataset.index??state.dog);
  if(index!==newPetIndex())return;
  img.dataset.dp990Fallback='yes';img.src='assets/new_pet_shiba_v1002.jpg';
 },true);
 root.DeepPetUX990={version:'9.90',newPetIndex,visibleOrder:()=>showcasePetOrder(),wellness:(index=state.dog)=>root.DeepPetAudit925?.model?.(index)};
})(window);
