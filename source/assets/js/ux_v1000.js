/* DeepPet V10.00 — targeted quality repairs; no new tabs, cards or score rules. */
(function(root){'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const t=(zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const nameOf=d=>String(d.name||'').trim()||'New Pet';
 const breedOf=d=>typeof breedText==='function'?breedText(d):d.breed?.en||'';
 function makeProfile(d){
  const photo=esc(d.photo||(d.dpFreshDemo?'assets/new_pet_shiba_v1002.jpg':'assets/pet-photo-placeholder.svg'));
  return `<section class="card profile-hero dp1000-profile-only"><div class="profile-glow"></div><div class="pet-profile"><button type="button" class="pet-avatar-tap" data-action="avatar-change" aria-label="${t('更換寵物照片','Change pet photo','사진 변경','写真を変更')}"><img class="pet-avatar" src="${photo}" alt="${esc(nameOf(d))}"/><span class="pet-avatar-camera">✎</span></button><div class="grow"><div class="pet-name">${esc(nameOf(d))}</div><div class="pet-caption">${esc(breedOf(d))} · ${esc(d.age)} ${t('歲','years','세','歳')} · ${esc(d.weight)} kg</div><div class="device-identity">${t('尚未配對設備','No paired device','연결된 기기 없음','機器未接続')}</div></div></div><div class="profile-actions"><button data-action="pet-switch">${t('切換寵物','Switch pets','반려동물 전환','ペットを切り替え')}</button><button data-action="edit-pet">${t('編輯資料','Edit profile','프로필 수정','プロフィール編集')}</button><button data-action="avatar-change">${t('更換頭像','Change photo','사진 변경','写真変更')}</button></div></section>`;
 }
 function profileOnlyMe(app){
  if(state.tab!=='me'||state.detail)return;
  const main=app.querySelector('.app-main>.app-pad');if(!main)return;
  const blank=selectedBlank(),d=blank?null:currentDog();
  const fresh=!blank&&(dp58FreshPet()||isFreePet());
  if(blank){
   // Keep EXACTLY the same profile-hero structure used for Milo and Lucky.
   // Replacing the hero with an unrelated empty-profile-card was a separate
   // Me template. Only its fields and actions may vary for a blank identity.
   const hero=main.querySelector('.profile-hero');
   if(!hero)return;
   hero.classList.add('dp1093-empty-profile');
   hero.setAttribute('data-profile-state','blank');
   const img=hero.querySelector('.pet-avatar');
   if(img){img.src='assets/pet-photo-placeholder.svg';img.alt='';}
   const name=hero.querySelector('.pet-name');if(name)name.textContent=t('尚未建立寵物','No pet yet','반려동물 미등록','ペット未登録');
   const caption=hero.querySelector('.pet-caption');if(caption)caption.textContent=t('姓名、品種、年齡與體重待填寫','Add name, breed, age and weight','이름·품종·나이·체중을 입력하세요','名前・品種・年齢・体重を登録');
   const device=hero.querySelector('.device-identity');if(device)device.textContent=t('尚未配對設備','No paired device','연결된 기기 없음','機器未接続');
   const id=hero.querySelector('.dp-profile-id');if(id)id.textContent='ID · N/A';
   // Preserve the SAME edit/photo/social icons and labels as a measured pet.
   // Their original actions are intercepted for the blank identity and lead
   // to profile creation; converting every button to "Add pet" had removed
   // its SVG children and created duplicate, indistinguishable controls.
   return;
  }
  if(!fresh||!d||!String(d.name||'').trim())return;
  // New Pet / profile-only owner pet: all identity fields are known, whereas
  // physiological history, scores and care logs remain absent (N/A).
  let hero=main.querySelector('.profile-hero');
  if(!hero){
   const empty=main.querySelector('.empty-profile-card,.dp58-first-empty,.dp931-empty-me');
   if(empty)empty.insertAdjacentHTML('beforebegin',makeProfile(d));
   else main.querySelector('.section-head,.card,.footer-space')?.insertAdjacentHTML('beforebegin',makeProfile(d));
   hero=main.querySelector('.profile-hero');
  }
  if(!hero)return;
  hero.classList.add('dp1000-profile-only');
  // Never reuse the previous pet's avatar/name when switching tabs/pets.
  const img=hero.querySelector('.pet-avatar');if(img){const desired=d.photo||(d.dpFreshDemo?'assets/new_pet_shiba_v1002.jpg':'assets/pet-photo-placeholder.svg');if(img.getAttribute('src')!==desired)img.setAttribute('src',desired);img.alt=nameOf(d);}
  const name=hero.querySelector('.pet-name');if(name)name.textContent=nameOf(d);
  const meta=hero.querySelector('.pet-caption');if(meta)meta.textContent=`${breedOf(d)} · ${d.age} ${t('歲','years','세','歳')} · ${d.weight} kg`;
  for(const redundant of main.querySelectorAll('.empty-profile-card,.dp58-first-empty,.dp931-empty-me'))redundant.remove();
 }
 const previous=render;
 render=function(reset=false){previous(reset);const app=document.getElementById('app');if(!app)return;
  profileOnlyMe(app);
  for(const element of app.querySelectorAll('.app-build-version'))element.textContent='DeepPet · Version 10.00';
 };
 document.addEventListener('error',event=>{
  const img=event.target;if(!(img instanceof HTMLImageElement)||!img.matches('.dp1000-profile-only .pet-avatar')||img.dataset.dp1000Fallback)return;
  if(selectedBlank()||!currentDog().dpFreshDemo||state.petOverrides?.[state.dog]?.photo)return;
  img.dataset.dp1000Fallback='1';img.src='assets/new_pet_shiba_v1002.jpg';
 },true);
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.00',integrity:['two-distinct-empty-profiles','BCG-heart-and-respiratory-waves','transparent-wave-details','continuous-30-day-showcase-trends','real-data-gap-preservation','unaltered-fixture-scores']};
 root.DeepPetUX1000={version:'10.00',profileOnlyMe};
})(window);
