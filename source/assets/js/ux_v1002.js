/* DeepPet V10.02 — breed-photo integrity and safe profile fallback. */
(function(root){'use strict';
 const previous=render;
 render=function(reset=false){
  previous(reset);
  document.querySelectorAll('#app .app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.02');
 };
 // A missing user-uploaded photo must not be silently replaced with the
 // showcase Shiba Inu. Render a neutral paw until a real photo is uploaded.
 document.addEventListener('error',event=>{
  const img=event.target;
  if(!(img instanceof HTMLImageElement)||img.dataset.dp1002Placeholder)return;
  const holder=img.closest('[data-action="select-pet"],.dp1000-profile-only,.profile-hero');
  if(!holder)return;
  const index=Number(holder.dataset.index??state.dog);
  const pet=allPets()[index];
  if(!pet||pet.dpFreshDemo||index<dogs.length||selectedBlank())return;
  if(!img.matches('img.pet-avatar,[data-action="select-pet"] img'))return;
  img.dataset.dp1002Placeholder='1';
  img.src='assets/pet-photo-placeholder.svg';
 },true);
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.02',integrity:[...(root.DeepPetRelease?.integrity||[]),'verified-breed-photo-identity','asset-cache-busting','neutral-photo-fallback','showcase-profile-plausibility']};
 root.DeepPetUX1002={version:'10.02'};
})(window);
