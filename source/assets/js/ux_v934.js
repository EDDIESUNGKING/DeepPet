/* DeepPet V9.34 — investor-gallery scenario: guided Blank/New Pet Home, consistent content after exit. */
(function(root){'use strict';
const tx=(a,b,c,d)=>state.lang==='en'?b:state.lang==='ko'?c:state.lang==='ja'?d:(state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(a):a);
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fresh=()=>selectedBlank()||dp58FreshPet()||isFreePet();
const key=()=>selectedBlank()?'blank':String(state.dog);
const steps=()=>state.dp934Steps||(state.dp934Steps={});
const level=()=>Number.isInteger(steps()[key()])?steps()[key()]:0;
function setLevel(n,target=key()){steps()[target]=Math.max(0,Math.min(4,n));persist();}
const wizardActive=()=>false; // V9.35: investor gallery always uses normal four-page shell; guide is dismissible popup.
const basic=()=>selectedBlank()?null:currentDog();
const profileValid=(d)=>!!(d&&String(d.name||'').trim()&&d.species&&d.breed&&d.breed.en&&d.breed.en!=='Not set'&&Number.isFinite(Number(d.age))&&Number(d.age)>=0&&Number(d.weight)>0&&d.photo);
const btn=(label,action,enabled=true,extra='')=>`<button type="button" class="dp934-step-btn ${extra}" data-dp934="${action}" ${enabled?'':'disabled aria-disabled="true"'}>${label}</button>`;
function onboard(){const st=level(),d=basic(),name=d?.name||tx('尚未建立寵物','No pet profile','반려동물 정보 없음','ペット情報なし');const meta=profileValid(d)?`${esc(d.breed?.zh||d.breed?.en||'')} · ${d.age} ${tx('歲','yr','세','歳')} · ${d.weight} kg`:tx('照片、姓名、種類、品種、年齡、體重及肩高','Photo, name, breed, age, weight and height','사진·이름·품종·나이·체중','写真・名前・品種・年齢・体重');
const image=d?.photo?`<img src="${esc(d.photo)}" alt=""/>`:'<span class="dp934-pet-placeholder">🐾</span>';
const roleInfo=tx('體檢分析、飲食目標、用藥、疫苗及驅蟲，填或略過均可。','Exams, nutrition, medication, vaccines and deworming are optional.','건강 기록은 선택 사항','健康記録は任意');
return `<div class="app-pad dp934-intro-page" data-dp934-stage="${st}">${homePetStrip()}
 <div class="dp934-setup-header"><b>${tx('認識 DeepPet','Discover DeepPet','DeepPet 소개','DeepPet紹介')}</b><small>${tx('投資人展示 · 新寵物體驗','Investor demo · New pet experience','시연','デモ')}</small></div>
 <button type="button" class="dp934-tour" data-action="tour-open"><span class="dp934-tour-icon">▶</span><span><strong>${tx('60 秒認識 DeepPet','DeepPet in 60 seconds','DeepPet 60초','DeepPet 60秒')}</strong><small>${tx('先了解常規監測、深度分析、健康管理及長期模型','Learn sensing, trends, care and the wellness model','기능 알아보기','機能紹介')}</small></span><b>›</b></button>
 <button type="button" class="dp934-profile dp934-${st<1?'closed':'open'}" data-dp934="profile" ${st<1?'disabled aria-disabled="true"':''}>
   <span class="dp934-profile-image">${image}</span><span class="dp934-profile-copy"><small>01 · ${tx('認識你的寵物','Your pet profile','반려동물 정보','ペット情報')}</small><strong>${esc(name)}</strong><em>${meta}</em><span>${st>1?'✓ '+tx('已保存','Saved','저장됨','保存済み'):tx('填寫並保存寵物資料','Complete and save pet information','정보 저장','情報を保存')}</span></span>
 </button>
 <section class="dp934-phase ${st<2?'dp934-disabled':''}"><div class="dp934-phase-head"><span>02</span><strong>${tx('連接 DeepPet 項圈','Connect DeepPet collar','목걸이 연결','首輪を接続')}</strong></div><p>${tx('連接藍牙健康版或 4G 定位版；沒有項圈可以跳過。','Pair a Bluetooth or 4G collar, or skip.','기기 연결 또는 건너뛰기','接続またはスキップ')}</p><div class="dp934-actions">${btn(tx('搜尋附近項圈','Find nearby collars','기기 찾기','首輪を探す'),'pair',st===2)}${btn(tx('暫時跳過','Skip pairing','건너뛰기','スキップ'),'skip-pair',st===2,'secondary')}</div></section>
 <section class="dp934-phase ${st<3?'dp934-disabled':''}"><div class="dp934-phase-head"><span>03</span><strong>${tx('健康管理（可略過）','Health management (optional)','건강 관리','健康管理')}</strong></div><p>${roleInfo}</p><div class="dp934-health-grid">${[['🩺',tx('體檢分析','Exams','검진','検診'),'reports'],['🥣',tx('飲食目標','Nutrition','식단','食事'),'food'],['💊',tx('用藥記錄','Medication','복약','投薬'),'med'],['💉',tx('疫苗記錄','Vaccinations','예방접종','予防接種'),'vaccines'],['🐾',tx('驅蟲記錄','Deworming','구충','駆虫'),'deworming']].map(([e,n,k])=>`<button type="button" data-dp934="care" data-kind="${k}" ${st!==3?'disabled aria-disabled="true"':''}><span>${e}</span><b>${n}</b><em>›</em></button>`).join('')}</div><div class="dp934-actions">${btn(tx('開始使用','Start using','시작하기','利用開始'),'start',st===3)}${btn(tx('略過並開始使用','Skip care & start','건너뛰기','スキップ'),'skip-care',st===3,'secondary')}</div></section>
 </div>`;
}
function normalEmpty(original){const div=document.createElement('div');div.innerHTML=original();div.querySelectorAll('.dp931-first-steps,.dp924-tour-entry,.dp931-tour-entry,[data-action="tour-open"]').forEach(el=>el.remove());const p=div.querySelector('.dp931-profile-hero');if(p){p.classList.add('dp934-ordinary-profile');const small=p.querySelector('small');if(small)small.textContent=tx('寵物基本資料','Pet profile','반려동물 프로필','基本情報');}return div.innerHTML;}
const oldBlankHome=blankHomeView,oldFreshHome=dp58FreshHome,oldFreeHome=freeCareHomeView;
blankHomeView=function(){return wizardActive()?onboard():normalEmpty(oldBlankHome);};
dp58FreshHome=function(){return wizardActive()?onboard():normalEmpty(oldFreshHome);};
freeCareHomeView=function(){return wizardActive()?onboard():normalEmpty(oldFreeHome);};
let pairingComingFromWizard=false;
const oldAction=onAction;
onAction=function(el){const a=el?.dataset?.action;
 if(a==='tour-enter'&&wizardActive()&&state.modal==='tour') {oldAction(el);if(level()===0)setLevel(1);state.tab='home';state.detail=null;render(true);return;}
 if(a==='pet-add-save'&&wizardActive()&&level()===1){
  const file=document.getElementById('dp931-pet-photo')?.files?.[0];const name=document.getElementById('addPetName')?.value?.trim();const age=document.getElementById('addPetAge')?.value;const weight=Number(document.getElementById('addPetWeight')?.value);const height=Number(document.getElementById('addPetHeight')?.value);
  if(!file||!file.type.startsWith('image/')||!name||!Number.isFinite(Number(age))||age===''||Number(age)<0||weight<=0||height<=0){toast(tx('第一步需要照片、姓名、年齡、體重及肩高','Step 1 requires a photo, name, age, weight and height','필수 정보를 입력하세요','必須項目を入力'));return;}
  const before=state.petExtras?.length||0;oldAction(el);
  if((state.petExtras?.length||0)>before){setLevel(2,String(state.dog));state.tab='home';state.detail=null;render(true);}
  return;
 }
 if(a==='save-pet'&&wizardActive()&&level()===1){const before=state.modal;oldAction(el);if(before==='edit-pet'&&state.modal!=='edit-pet'&&profileValid(basic())){setLevel(2);state.tab='home';state.detail=null;render(true);}return;}
 if(a==='pair-commit'&&wizardActive()&&level()===2){pairingComingFromWizard=true;oldAction(el);return;}
 return oldAction(el);
};
function garden(){const app=document.getElementById('app');if(!app)return;for(const el of app.querySelectorAll('[data-action="garden-detail"]')){if(!el.matches('.garden-entry,.dp-garden-entry,.dp931-garden-new,.dp934-nearby'))continue;
 el.className='card dp934-nearby';el.setAttribute('aria-label',tx('附近寵物，查看20公里內的寵物','Nearby pets within 20 km','20km 이내 반려동물','20km以内のペット'));
 el.innerHTML=`<span class="dp934-nearby-copy"><small>DeepPet · ${tx('寵物社群','Pet community','펫 커뮤니티','コミュニティ')}</small><strong>${tx('附近寵物','Nearby pets','근처 반려동물','近くのペット')}</strong><em>${tx('探索 20 公里內的寵物與交流','Meet pets within 20 km','20km 이내','20km以内')}</em><b>${tx('查看附近寵物','Explore nearby pets','주변 보기','周辺を見る')} →</b></span><span class="dp934-nearby-photo"><img src="assets/icons/nearby-pets-banner.webp" alt=""/></span>`;
 }}
function model(){const app=document.getElementById('app');if(!app)return;for(const card of app.querySelectorAll('.dp928-model-card')){card.classList.add('dp934-model-card');const m=root.DeepPetAudit925?.model?.();if(Number.isFinite(m?.score)){const center=card.querySelector('.dp-dot-meter-center strong');if(center)center.textContent=String(Math.round(m.score));}
  const ring=card.querySelector('.dp928-wellness-metric');if(ring)ring.setAttribute('data-score-ready',Number.isFinite(m?.score)?'true':'false');
 }}
const oldRender=render;
render=function(reset=false){if(wizardActive()&&state.tab==='home'){state.detail=null;}
 if(pairingComingFromWizard&&fresh()&&level()===2&&state.connected){pairingComingFromWizard=false;setLevel(3);state.tab='home';state.detail=null;state.modal='';}
 oldRender(reset);
 const app=document.getElementById('app');if(!app)return;
 if(wizardActive()&&state.tab==='home'){
  const nav=app.querySelector('.bottom-nav,.bottom-nav-wrap,.app-bottom-nav,.nav-bar');if(nav)nav.classList.add('dp934-nav-hidden');
  const root=app.querySelector('.app-main');if(root)root.classList.add('dp934-wizard-main');
 }
 if(state.dp934CareFromWizard&&state.dp934CareWizardPet===key()&&level()===3&&state.tab==='health'){
  const main=app.querySelector('.app-main');if(main&&!main.querySelector('.dp934-care-return'))main.insertAdjacentHTML('afterbegin',`<div class="dp934-care-return"><button type="button" data-dp934="care-back">← ${tx('返回第三步健康管理','Back to step 03','3단계로 돌아가기','ステップ03へ戻る')}</button><small>${tx('僅需選填體檢、飲食、用藥、疫苗、驅蟲','Choose one of the five optional health records','건강 기록 선택','必要な記録だけ選択')}</small></div>`);
 }
 if(state.tab==='me')garden();model();
 app.querySelectorAll('.app-build-version').forEach(el=>el.textContent='DeepPet · Version 9.34');
};
function handler(action,el){const st=level();if(action==='profile'){if(st<1)return;openModal(selectedBlank()?'pet-add':'edit-pet');return;}
 if(action==='pair'&&st===2){pairingComingFromWizard=true;oldAction({dataset:{action:'device-find'}});return;}
 if(action==='skip-pair'&&st===2){setLevel(3);render(true);return;}
 if(action==='care'&&st===3){const kind=el.dataset.kind;state.dp934CareFromWizard=true;state.dp934CareWizardPet=key();state.tab='health';state.detail=kind;render(true);return;}
 if(action==='care-back'){state.dp934CareFromWizard=false;state.tab='home';state.detail=null;state.modal='';render(true);return;}
 if(action==='start'||action==='skip-care'){if(st!==3)return;setLevel(4);state.dp934CareFromWizard=false;state.tab='home';state.detail=null;state.modal='';render(true);return;}
}
document.addEventListener('click',e=>{const el=e.target.closest?.('[data-dp934]');if(!el)return;e.preventDefault();e.stopImmediatePropagation();if(el.disabled)return;handler(el.dataset.dp934,el);},true);
root.DeepPetUX934={version:'9.34',stage:()=>level(),active:wizardActive,model:()=>root.DeepPetAudit925?.model?.()};
})(window);
