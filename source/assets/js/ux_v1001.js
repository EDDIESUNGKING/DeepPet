/* DeepPet V10.01: restore Home's today-only to-dos, remove duplicate Health list,
   and retain New Pet's complete identity across Home and Me. No score changes. */
(function(root){'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const label=(zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const todayTitle=()=>label('今日待辦','Today’s to-dos','오늘 할 일','今日のタスク');
 const nameOf=d=>typeof dp58FreshDisplayName==='function'?dp58FreshDisplayName(d):String(d.name||'New Pet');
 const breedOf=d=>typeof breedText==='function'?breedText(d):d.breed?.en||'';
 const profileOnly=()=>!selectedBlank()&&(dp58FreshPet()||isFreePet());

 function homeToday(main){
  // V9.36 removed the original daily-focus component on every Home render,
  // including the fifteen established gallery pets. Restore that component
  // in its original Home position; never manufacture readings for empty pets.
  main.querySelectorAll('.dp936-home-todo').forEach(n=>n.remove());
  if(main.querySelector('.dp-today-focus'))return;
  const empty=selectedBlank()||profileOnly();
  const content=empty?
   // Exactly the same focus-watch header, spark icon and color inherited by
   // the measured pet's active Today To-dos. Only its list is empty.
   `<section class="focus-feature focus-watch dp-today-focus dp1001-empty-todos"><div class="row spread"><span class="focus-eyebrow">${vicon('spark',17)} ${todayTitle()}</span><span class="focus-count">0 ${label('項','items','건','件')}</span></div><p>${label('今天尚無待辦事項','No to-dos for today','오늘 할 일이 없습니다','本日の予定はありません')}</p></section>`:
   typeof focusCard==='function'?focusCard():'';
  if(!content)return;
  const anchor=main.querySelector('.dp936-urgent,.summary-card,.dp-combined-summary');
  if(anchor)anchor.insertAdjacentHTML('afterend',content);
  else main.querySelector('.dp928-model-card,.dp-owner-gps-card,.footer-space')?.insertAdjacentHTML('beforebegin',content);
  const title=main.querySelector('.dp-today-focus .focus-eyebrow');
  if(title){const icon=title.querySelector('svg');title.replaceChildren();if(icon)title.append(icon);title.append(document.createTextNode(' '+todayTitle()));}
 }

 function healthNoTodayDuplicate(main){
  // The daily registry is now accessible through Home, including its full
  // list and record-level navigation. Keep Health's original order, feeding
  // plan, medication, examinations, vaccinations, and upcoming reminders.
  for(const list of main.querySelectorAll(':scope > .care-todo:not(.dp-upcoming-care)')){
   const heading=list.previousElementSibling;
   if(heading?.matches('.section-head')&&heading.querySelector('.section-title'))heading.remove();
   list.remove();
  }
 }

 function newPetIdentity(main){
  if(!profileOnly())return;
  const d=currentDog(),name=String(nameOf(d)||'New Pet'),breed=breedOf(d);
  const age=Number.isFinite(Number(d.age))?String(d.age):'N/A';
  const weight=Number.isFinite(Number(d.weight))&&Number(d.weight)>0?String(d.weight):'N/A';
  const ageUnit=label('歲','years','세','歳');
  const meta=`${breed} · ${age} ${ageUnit} · ${weight} kg`;
  if(state.tab==='home'){
   const hero=main.querySelector('.home-hero-poster,.dp58-first-hero');
   if(hero){
    const heroName=hero.querySelector('.hero-name,.dp58-first-name');if(heroName)heroName.textContent=name;
    let profile=hero.querySelector('.hero-meta,.dp1001-profile-metadata');
    if(profile)profile.textContent=meta;
    else hero.insertAdjacentHTML('beforeend',`<div class="dp1001-profile-metadata">${esc(meta)}</div>`);
    const heroPhoto=d.dpFreshDemo&&!state.petOverrides?.[state.dog]?.photo?'assets/new_pet_shiba_hero_v1002.jpg':d.photo;
    if(heroPhoto&&hero.style.backgroundImage&&!hero.style.backgroundImage.includes(heroPhoto))
     hero.style.backgroundImage=`linear-gradient(90deg,rgba(33,37,55,.49),rgba(33,37,55,.08)),url(${JSON.stringify(heroPhoto)})`;
   }
  }
  if(state.tab==='me'){
   const hero=main.querySelector('.profile-hero');if(!hero)return;
   const avatar=hero.querySelector('img.pet-avatar');
   if(avatar){const photo=d.photo||(d.dpFreshDemo?'assets/new_pet_shiba_v1002.jpg':'assets/pet-photo-placeholder.svg');if(avatar.getAttribute('src')!==photo)avatar.setAttribute('src',photo);avatar.alt=name;}
   const nameNode=hero.querySelector('.pet-name');if(nameNode)nameNode.textContent=name;
   const metaNode=hero.querySelector('.pet-caption');if(metaNode)metaNode.textContent=meta;
  }
 }

 const previous=render;
 render=function(reset=false){
  previous(reset);const main=document.querySelector('#app .app-main>.app-pad');if(!main)return;
  if(state.tab==='home'&&state.detail==='today-all'){
   const heading=main.querySelector('.dp-today-more-page .dp-independent-head b');
   if(heading)heading.textContent=todayTitle();
  }else if(!state.detail){
   if(state.tab==='home')homeToday(main);
   if(state.tab==='health')healthNoTodayDuplicate(main);
   if(['home','me'].includes(state.tab))newPetIdentity(main);
  }
  document.querySelectorAll('#app .app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.01');
 };
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.01',integrity:[...(root.DeepPetRelease?.integrity||[]),'today-todos-home-only','today-more-record-routes','new-pet-complete-basic-profile']};
 root.DeepPetUX1001={version:'10.01',homeToday,healthNoTodayDuplicate,newPetIdentity};
})(window);
