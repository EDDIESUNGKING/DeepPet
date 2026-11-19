/* DeepPet V9.35 | Investor gallery: single app shell, optional onboarding overlay.
 * No health scores are synthesized here. The gallery's 15 monitored profiles and
 * Blank / New Pet use existing data and existing save/delete handlers.
 */
(function(root){'use strict';
 const lang=(zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const isIntroPet=()=>selectedBlank()||dp58FreshPet()||isFreePet();
 const id=()=>selectedBlank()?'blank':String(state.dog);
 const profile=()=>selectedBlank()?null:currentDog();
 const hasProfile=()=>{const d=profile();return !!(d&&String(d.name||'').trim()&&d.species&&d.breed&&d.breed.en&&d.breed.en!=='Not set'&&Number.isFinite(Number(d.age))&&Number(d.age)>=0&&Number(d.weight)>0&&d.photo);};
 // Match the monitored pet's Home card structure; only the values differ.
 function emptyHome(){
  const d=profile(),name=esc(d?.name||lang('還沒有寵物資料','No pet yet','반려동물 정보 없음','ペット未登録'));
  const photo=d?.photo?`linear-gradient(90deg,rgba(33,37,55,.54),rgba(33,37,55,.10)),url('${esc(d.photo)}')`:`linear-gradient(120deg,#5b5fc4,#b192dc 60%,#e4cbf2)`;
  const meta=d?`${esc(d.breed?.en||d.breed?.zh||'N/A')} · ${esc(d.age??'N/A')} ${lang('歲','yr','세','歳')} · ${esc(d.weight??'N/A')} kg`:lang('點擊建立名字、品種與照片','Create a pet profile','반려동물 정보 입력','プロフィールを作成');
  const noRing=()=>dpDotScore(null,'health').replace('<strong>—</strong>','<strong>N/A</strong>');
  const noRing2=()=>dpDotScore(null,'rhythm').replace('<strong>—</strong>','<strong>N/A</strong>');
  const wh=lang('等待有效量測','Waiting for valid readings','유효 측정 대기','測定待ち');
  const status=lang('目前沒有監測資料','No sensor readings yet','측정된 데이터 없음','記録なし');
  const hero=`<section role="button" tabindex="0" class="home-hero-poster dp58-centered-hero dp935-empty-hero" data-action="${d?'edit-pet':'pet-add'}" style="background-image:${photo}"><div class="hero-overlay"><div class="hero-name">${name}</div><div class="hero-meta">${meta}</div><div class="hero-tag">${status} · N/A</div></div></section>`;
  const summary=`<section class="card summary-card dp-combined-summary dp-aurora-summary dp68-summary dp935-empty-summary"><div class="summary-top"><div class="summary-day"><strong>${lang('今日總結','Daily summary','오늘의 요약','今日のまとめ')}</strong><span> · ${fmtDate(localDate(),true)}</span></div></div><div class="dp-summary-lanes"><button class="dp-summary-lane dp-health-lane" data-action="show-summary" style="--score-color:#aab0bc"><span class="dp-lane-meter">${noRing()}</span><span class="dp-lane-copy"><strong>${lang('生理狀態評分','Physiological status score','생리 상태','生理状態')}</strong><span class="dp-lane-description">${wh}</span><small>${lang('心肺 · 睡眠 · 精力與恢復','Cardio · Sleep · Energy','심폐 · 수면 · 활력','心肺・睡眠・回復')}</small></span></button><button class="dp-summary-lane dp-rhythm-lane" data-action="rhythm-detail" style="--score-color:#aab0bc"><span class="dp-lane-meter">${noRing2()}</span><span class="dp-lane-copy"><strong>${lang('身體節奏分數','Body rhythm score','몸 리듬 점수','リズム')}</strong><span class="dp-lane-description">${wh}</span><small>${lang('放鬆與平穩度 · 心搏節奏','Rest · Heart rhythm','안정 · 심박','休息・心拍')}</small></span></button></div></section>`;
  const focus=`<section class="card dp-today-focus dp935-empty-focus"><div class="row spread"><b>${lang('今日最值得知道','Today’s focus','오늘의 핵심','今日の注目')}</b><small>N/A</small></div><p>${lang('尚無當日待辦與監測提醒','No daily observations or reminders yet','오늘의 알림 없음','今日の記録なし')}</p></section>`;
  const model=`<button type="button" class="card dp928-model-card dp934-model-card dp935-model-empty" data-dp931="model-empty"><div class="dp928-model-head"><span><b>${lang('寵物健康模型','Pet Wellness Model','반려동물 건강 모델','ペット健康モデル')}</b><small>${lang('近30天','Last 30 days','최근 30일','直近30日')}</small></span><span>›</span></div><div class="dp928-metric-grid"><div class="dp928-wellness-metric"><small>${lang('整體健康評分','Overall wellness score','전체 건강 점수','健康スコア')}</small>${noRing()}</div><div class="dp928-age-metric"><small>${lang('AI 推算生理年齡','AI-estimated wellness age','AI 나이','AI推定年齢')}</small><div class="dp928-age-shimmer"><div><strong>N/A</strong><em>${lang('歲','yr','세','歳')}</em></div><span class="dp928-age-comparison">± N/A</span></div></div></div><div class="dp928-model-foot"><span>${wh}</span><strong>${lang('查看分析','View analysis','분석 보기','詳細')} ›</strong></div></button>`;
  const gps=`<section class="card dp-owner-gps-card dp-home-map-card dp935-empty-gps"><div class="dp-owner-gps-head"><span class="dp-owner-gps-icon">📍</span><div><strong>${lang('GPS 定位','GPS Location','GPS 위치','GPS位置')}</strong><small>${lang('藍牙沒有定位，4G 項圈支援電子圍欄','4G collar required for location and geofencing','4G 전용','4G版のみ')}</small></div><span class="dp-owner-gps-status">N/A</span></div><div class="dp-home-gps-map is-unlocated"><div class="dp-home-map-notice"><b>${lang('目前沒有位置資料','No location data','위치 기록 없음','位置情報なし')}</b></div></div><button class="dp-owner-gps-button dp-home-gps-action" data-action="device-find">${lang('連接 4G 項圈','Pair 4G collar','4G 목걸이 연결','4G首輪を接続')} ›</button></section>`;
  return `<div class="app-pad home-page-v30 dp935-empty-home">${homePetStrip()}${hero}${summary}${focus}${gps}<button type="button" class="card me-heart-moment-entry dp935-empty-moment" data-action="heart-moment"><span>💗</span><span>${lang('心跳時刻','Heart Moments','심박 순간','心拍の瞬間')}</span><small>N/A</small><span>›</span></button><div class="footer-space"></div></div>`;
 }
 blankHomeView=emptyHome; dp58FreshHome=emptyHome; freeCareHomeView=emptyHome;
 let visible=false, trackedKey=null, resumable=null;
 const opened=new Set();
 const progress=()=>state.dp935GuideProgress||(state.dp935GuideProgress={});
 const confirmed=()=>!!state.dp935ProfileConfirmed?.[id()];
 function stage(){return hasProfile()&&confirmed()?Math.max(progress()[id()]||1,2):1;}
 function advance(n){if(n>=2&&(!hasProfile()||!confirmed()))return;progress()[id()]=Math.max(progress()[id()]||1,n);persist();}
 function dismiss(mark=true){visible=false;document.getElementById('dp935-guide-root')?.remove();if(mark&&isIntroPet())opened.add(id());}
 // Resuming a setup step is owned by the pet that opened it. The sole allowed
 // identity transition is Blank -> the newly created profile at its next index.
 function resumeSession(kind){return {kind,owner:id(),epoch:state.dpPetEpoch,extraCount:(state.petExtras||[]).length,fromBlank:selectedBlank()};}
 function resumeOwnsCurrent(r){return !!r&&(
  (r.owner===id()&&r.epoch===state.dpPetEpoch)||
  (r.kind==='profile'&&r.fromBlank&&!selectedBlank()&&state.dog===dogs.length+r.extraCount&&
   (state.petExtras||[]).length===r.extraCount+1&&state.dpPetEpoch>r.epoch)
 );}
 function tiles(){const st=stage();const line=(num,ico,title,desc,action,enabled=true)=>`<button type="button" class="dp935-step ${enabled?'':'dp935-locked'}" data-dp935="${action}" ${enabled?'':'disabled aria-disabled="true"'}><span class="dp935-step-number">${num}</span><span class="dp935-step-icon">${ico}</span><span class="dp935-step-copy"><strong>${title}</strong><small>${desc}</small></span><span class="dp935-chevron">›</span></button>`;
  return `<div class="dp935-guide-content"><header class="dp935-guide-head"><div><small>DeepPet · ${lang('新寵物導覽','Pet onboarding','새 반려동물','ペット登録')}</small><h2>${lang('認識你的寵物','Welcome to DeepPet','DeepPet 시작','DeepPetへようこそ')}</h2></div><button type="button" class="dp935-close" data-dp935="close" aria-label="${lang('關閉導覽','Close guide','닫기','閉じる')}">✕</button></header>
  <button type="button" class="dp935-tour" data-dp935="tour"><span class="dp935-play">▶</span><span><strong>${lang('60 秒認識 DeepPet','Discover DeepPet in 60 seconds','60초 DeepPet 소개','60秒でDeepPetを知る')}</strong><small>${lang('先了解每日監測、深入分析、健康管理與長期趨勢','See sensing, trends, care and long-term insights','기능 둘러보기','機能を確認')}</small></span><span>›</span></button>
  <div class="dp935-steps">${line('01','🐕',lang('建立寵物基本資料','Pet profile','반려동물 정보','プロフィール'),hasProfile()&&confirmed()?lang('資料已儲存，可隨時修改','Profile saved · Edit anytime','저장됨','保存済み'):lang('必填照片、名字、類型、品種、年齡與體重，並儲存','Photo, name, species, breed, age and weight · Save required','사진·이름·품종·나이·체중 저장 필수','写真・名前・種類・品種・年齢・体重の保存が必要'),'profile')}
  ${line('02','📶',lang('連接 DeepPet 項圈','Connect DeepPet collar','목걸이 연결','首輪接続'),lang('可以配對，沒有項圈也可以略過','Pair now or skip if you do not have one','연결 또는 건너뛰기','接続またはスキップ'),'pair',st>=2)}
  ${st>=2?`<button type="button" class="dp935-skip-pair" data-dp935="skip-pair">${lang('沒有項圈，先略過第 02 步','No collar · Skip step 02','기기 없이 건너뛰기','接続せずに次へ')}</button>`:''}${line('03','🩺',lang('免費健康管理','Free health management','건강관리','健康管理'),lang('體檢、飲食、用藥、疫苗、驅蟲','Exams, food, medications, vaccines, deworming','검진·급여·약·백신','検診・食事・投薬'),'care',st>=3)}</div>
  <div class="dp935-guide-footer"><button class="dp935-secondary" data-dp935="close">${lang('先看看 APP','Explore the app','앱 살펴보기','アプリを見る')}</button><button class="dp935-primary" data-dp935="finish" ${st<2?'disabled aria-disabled="true"':''}>${st<2?lang('請先完成 01','Complete step 01','01단계 먼저 완료','01を完了してください'):lang('開始使用','Start using','시작하기','利用開始')}</button></div>
  <p class="dp935-note">${lang('關閉後仍可查看 Home、Deep、Health、Me。未測量的項目為 N/A。','Close at any time. All four tabs remain available; unavailable values show N/A.','닫아도 모든 탭을 볼 수 있습니다.','閉じても4つのタブを使用できます。')}</p></div>`;
 }
 function show(force=false){if(!isIntroPet())return;const k=id();if(!force&&opened.has(k))return;visible=true;opened.add(k);let existing=document.getElementById('dp935-guide-root');if(!existing){existing=document.createElement('div');existing.id='dp935-guide-root';existing.className='dp935-guide-overlay';document.body.appendChild(existing);}existing.innerHTML=`<div class="dp935-backdrop" data-dp935="close"></div><section class="dp935-guide" role="dialog" aria-modal="true" aria-label="${lang('新寵物引導','Pet setup guide','반려동물 안내','ペットガイド')}">${tiles()}</section>`;}
 function popupReturnIfReady(){if(!resumable)return;const r=resumable;if(!resumeOwnsCurrent(r)){resumable=null;return;}if(!isIntroPet())return;if(r.kind==='profile'&&hasProfile()&&confirmed()&&!state.modal){advance(2);resumable=null;show(true);}if(r.kind==='pair'&&state.connected&&!state.modal){advance(3);resumable=null;show(true);}}
 // Update on actual pet switch; no repeat on every tab/date/detail render.
 const preceding=render;
 render=function(reset=false){preceding(reset);if(!root.document)return;const current=isIntroPet()?id():null;if(current!==trackedKey){trackedKey=current;dismiss(false);if(resumable&&!resumeOwnsCurrent(resumable))resumable=null;if(current&&!opened.has(current))show();}
  popupReturnIfReady();
  const app=document.getElementById('app');if(!app)return;
  if(isIntroPet()){
   const strip=app.querySelector('.pet-top-strip-wrap');
   if(strip&&!app.querySelector('.dp935-reopen'))strip.insertAdjacentHTML('afterend',`<button class="dp935-reopen" data-dp935="open">${lang('新寵物使用說明','New pet guide','새 반려동물 안내','新規ペットガイド')} <span>›</span></button>`);
   // Remove legacy wizard blocks from ALL tabs. The guide is now a layer,
   // never a second Home or Health page.
   app.querySelectorAll('.dp932-wizard,.dp934-intro-page,.dp931-first-steps,.dp924-tour-entry,.dp931-tour-entry').forEach(x=>x.remove());
  }
  // Never inherit a monitored pet's examination card while Blank / New Pet is active.
  if(isIntroPet())app.querySelectorAll('.dp916-home-card,.dp916-home-exam-card,.dp916-health-card,.dp916-care-card').forEach(x=>{if(x.closest('.dp931-empty-health,.dp931-newcomer-page,.dp931-empty-deep,.dp931-empty-me'))x.remove();});
  // Prevent the social card from being clipped by stale card rules.
  for(const card of app.querySelectorAll('[data-action="garden-detail"]'))if(card.classList.contains('dp934-nearby'))card.classList.add('dp935-nearby');
  app.querySelectorAll('.app-build-version').forEach(x=>x.textContent='DeepPet · Version 9.35');
 };
 document.addEventListener('keydown',e=>{const h=e.target?.closest?.('.dp935-empty-hero');if(h&&['Enter',' '].includes(e.key)){e.preventDefault();onAction(h);}},true);
 document.addEventListener('click',function(e){const b=e.target.closest?.('[data-dp935]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const a=b.dataset.dp935;
  if(a==='close'){dismiss();return;}
  if(a==='finish'){if(!hasProfile()||!confirmed()){show(true);toast(lang('請先填寫並儲存完整寵物資料','Save the complete pet profile in step 01 first','반려동물 정보를 먼저 저장하세요','先にプロフィールを保存してください'));return;}dismiss();return;}
  if(a==='open'){show(true);return;}
  if(a==='tour'){dismiss();resumable=resumeSession('tour');state.tourStep=0;state.modal='tour';renderModal();return;}
  if(a==='profile'){dismiss();resumable=resumeSession('profile');openModal(selectedBlank()?'pet-add':'edit-pet');return;}
  if(a==='skip-pair'&&stage()>=2){advance(3);show(true);return;}
  if(a==='pair'&&stage()>=2){dismiss();resumable=resumeSession('pair');onAction({dataset:{action:'device-find'}});return;}
  if(a==='care'&&stage()>=3){dismiss();state.tab='health';state.detail=null;render(true);return;}
 },true);
 const priorAction=onAction;
 onAction=function(el){const a=el?.dataset?.action;
  if((a==='save-pet'||a==='pet-add-save')&&resumable?.kind==='profile'){
   const session=resumable,originalPet=state.dog,originalEpoch=state.dpPetEpoch;
   const result=priorAction(el);
   // Only a completed form save, not opening/cancelling a prefilled profile,
   // unlocks step 02. Confirmation belongs to the selected pet only.
   // Photo processing is asynchronous in the existing save handler. Wait for
   // that actual handler to finish before checking whether the form was saved;
   // otherwise the microtask races against image decoding and stays locked.
   Promise.resolve(result).then(()=>{if(resumable!==session||!resumeOwnsCurrent(session))return;
    if(a==='save-pet'&&(state.dog!==originalPet||state.dpPetEpoch!==originalEpoch))return;
    if(a==='pet-add-save'&&session.fromBlank&&selectedBlank())return;
    if(isIntroPet()&&!state.modal&&hasProfile()){
    state.dp935ProfileConfirmed??={};state.dp935ProfileConfirmed[id()]=true;persist();advance(2);resumable=null;show(true);
   }}).catch(err=>console.warn('DeepPet profile save did not complete',err));
   return result;
  }
  if(a==='tour-enter'&&resumable?.kind==='tour'){const ret=priorAction(el);resumable=null;show(true);return ret;}
  // Existing form/save logic remains authoritative; do not bypass validation.
  return priorAction(el);
 };
 // Caller can explicitly resume step 2 after declining a collar.
 root.DeepPetGuide935={show,close:dismiss,advance,stage,valid:hasProfile,active:()=>visible,profile:id};
 queueMicrotask(()=>{try{render(false);}catch(e){console.warn('DeepPet guide init',e)}});
 })(window);
