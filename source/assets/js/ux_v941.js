/* DeepPet 9.42 — profile / pairing / evidence gates and UI synchronization. */
(function(root){'use strict';
const A=root.DeepPetPersonalization941;
if(!A){console.error('DeepPet V9.42 personalization engine missing');return;}
const t=(zht,zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:state.lang==='zh'?zh:zht;
const esc941=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Registration is not a permanent "empty" flag. Once a real owner's verified
// 20 Hz day is accepted, the regular measured actions and navigation apply.
const fresh=()=>selectedBlank()||dp58FreshPet()||isFreePet()||(Number(state.dog)>=15&&!(root.DeepPetSignalScoring?.getDaily?.(state.dog)||[]).some(x=>x?.source==='20hz-waveform'&&x.quality?.heartValid===true&&x.quality?.respValid===true&&x.quality?.wearValid===true&&x.quality?.signalValid===true&&x.quality?.timeContinuityValid===true&&Number(x.quality?.timeCoverage)>=.5&&Number(x.quality?.observedSeconds)>=900));
const pet=()=>selectedBlank()?null:currentDog();
const profileValid=()=>A.profileComplete(pet(),true);
const hasSignals=()=>!selectedBlank()&&(state.dog<dogs.length||!!state.connected)&&(root.DeepPetSignalScoring?.getDaily?.(state.dog)||[]).some(x=>x?.date===todayKey()&&Number.isFinite(x.scores?.physiol)&&x.quality?.heartValid===true&&x.quality?.respValid===true&&(x.source!=='20hz-waveform'||(x.quality?.wearValid===true&&x.quality?.signalValid===true&&x.quality?.timeContinuityValid===true&&Number(x.quality?.timeCoverage)>=.5&&Number.isFinite(x.quality?.observedSeconds)&&x.quality.observedSeconds>=900&&Number.isFinite(x.quality?.observedDayFraction)&&Math.abs(x.quality.observedDayFraction-x.quality.observedSeconds/86400)<1e-5&&(x.quality.samplingMode!=='scheduled'||Number.isFinite(x.quality.scheduledSeconds)&&x.quality.scheduledSeconds>=1800&&x.quality.scheduledSeconds<=86400)&&Math.abs(x.quality.timeCoverage-Math.min(1,x.quality.observedSeconds/(x.quality.samplingMode==='scheduled'?x.quality.scheduledSeconds:86400)))<1e-5)));
const hasDevice=()=>{const pairing=state.devicesByPet?.[String(state.dog)];return !selectedBlank()&&state.connected===true&&!!state.connectedId&&pairing?.connected===true&&pairing.connectedId===state.connectedId&&pairing.deviceType===state.deviceType;};
const todayKey=()=>typeof iso==='function'?iso(localDate()):new Date().toISOString().slice(0,10);
const remindProfile=()=>{const msg=t('請先完成並儲存照片、姓名、物種、品種、年齡及體重。','请先完成并保存照片、姓名、物种、品种、年龄及体重。','Complete and save a photo, name, species, breed, age and weight first.','사진·이름·품종·나이·체중을 먼저 저장하세요.','写真・名前・種類・品種・年齢・体重を先に保存してください。');
 toast(msg);if(state.modal!=='pet-add'&&state.modal!=='edit-pet')openModal(selectedBlank()?'pet-add':'edit-pet');};
const remindDevice=()=>toast(t('目前沒有項圈量測資料。請先連接項圈並取得有效訊號。','目前没有项圈量测资料。请先连接项圈并取得有效信号。','No collar measurement yet. Pair a collar and collect valid signal data.','목걸이를 연결하고 유효한 측정을 시작하세요.','まず首輪を接続し、有効な測定を取得してください。'));
const remind4g=()=>toast(t('附近寵物與定位需要已連接的 4G 項圈；藍牙版不提供定位。','附近宠物与定位需要已连接的 4G 项圈；蓝牙版不提供定位。','Nearby and GPS need a paired 4G collar; Bluetooth does not provide location.','주변 기능은 4G 목걸이 연결 후 사용할 수 있습니다.','位置情報には4G首輪の接続が必要です。'));
const delay=()=>{const target={...pet(),petId:String(state.dog)};return A.prevention(target,root.DeepPetSignalScoring?.getDaily?.(state.dog)||[],root.DeepPetLabEvidence?.assess?.(root.dp914ReportRecords?.(state.dog)||[],target,todayKey())||null,state.lang,todayKey());};
const refactoredWatch=dp67WatchItems;
dp67WatchItems=function(p,type){if(!p||!A.profileBasicsComplete(p))return [];
  // Profile/routine advice is always grounded in the explicit profile, not
  // monitoring fixtures. Retain only distinct breed-specific legacy cues.
  const evidence=delay();
  const safeBreedCues=new Set(['airway','cat-airway','cardiac','breed-cat-heart','profile-check']);
  const breed=refactoredWatch(p,type).filter(x=>safeBreedCues.has(x.code));
  return [...evidence.items.slice(),...breed];
};
function preventionPanel(inHome=false){const p=pet(),data=delay(),items=p&&A.profileBasicsComplete(p)?dp67WatchItems(p,dp67ClassifyBreed(p)):[];
 const name=t('預防性健康管理','预防性健康管理','Preventive health management','예방 건강 관리','予防健康管理');
 const head=`<div class="dp941-prevention-heading"><span class="dp941-prevent-icon">✦</span><div><small>${t('個體化健康建議','个体化健康建议','Personalized health advice','맞춤형 건강 조언','個別の健康アドバイス')}</small><h2>${name}</h2></div></div>`;
 const meta=A.profileBasicsComplete(p)?`<p class="dp941-profile-meta">${esc941(p.breed?.en||p.breed?.zh||'')} · ${Number(p.age).toFixed(1)} ${t('歲','岁','years','세','歳')} · ${Number(p.weight).toFixed(1)} kg</p>`:'';
 const basis=t('依品種、年齡、體重與個體有效記錄整理；體檢項目僅參考適用且可核對的檢驗區間。','依品种、年龄、体重与个体有效记录整理；体检项目仅参考适用且可核对的检验区间。','Based on breed, age, weight and qualified readings; exams are considered only with applicable verified ranges.','품종·나이·체중과 유효 기록을 바탕으로 하며 검진 결과는 확인된 참고범위만 반영합니다.','品種・年齢・体重と有効記録に基づき、検査結果は確認できる適用範囲のみ参照します。');
 const caption=`<p class="dp941-prevention-note">${esc941(data.message)}</p>`;
 const content=!data.available?`<p class="dp941-empty-prevention">${esc941(data.message)}</p>`:`<h3>${t('推估需要留意的重點','推估需要留意的重点','Pet-specific care priorities','개별 건강 권장','推定される注意点')}</h3><div class="dp941-care-list">${items.slice(0,3).map((x,i)=>`<button type="button" class="dp941-care-row" data-action="dp70-watch-open" data-code="${esc941(x.code)}"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc941(x.name)}</strong><em>${x.source==='monitoring'?'◉':'↗'}</em></button>`).join('')}</div>${items.length>3?`<button type="button" class="dp941-prevent-more" data-action="dp905-watch-more">${t('查看全部','查看全部','View all','전체 보기','すべてを見る')} · ${items.length} →</button>`:''}${caption}`;
 return `<section class="card dp941-prevention ${inHome?'dp941-prevention-mini':''}">${head}${meta}${content}</section>`;
}
dp67WatchMain=()=>preventionPanel(false);
dp67HomePrevention=()=>preventionPanel(true);
const previousEnergy=dpAutoEnergy,previousTarget=targetFood;
dpAutoEnergy=function(){const v=A.diet(pet());return v.available?v.targetKcal:null;};
targetFood=function(){if(!A.profileBasicsComplete(pet()))return null;const saved=Number(state.foodTarget?.[state.dog]);return saved>0?saved:A.diet(pet()).targetKcal;};
const featureWithoutSignal=new Set(['heart-moment','live-heart','live-breath','dp-events','dp-solo','dp-event-to-moment','dp-moment-save']);
const needs4g=new Set(['garden-detail','gps-open','gps-home-enable','garden-enable-gps','garden-gps-demo','gps-sim-position','toggle-gps','toggle-fence']);
const allowBeforeProfile=new Set(['nav','select-pet','select-blank','pet-switch','pet-add','edit-pet','pet-add-save','save-pet','avatar-change','avatar-camera','avatar-gallery','avatar-save','avatar-cancel','tour-open','tour-next','tour-back','tour-enter','modal-close','modal-outside','language','lang','change-lang','shop-open','shop-buy','shop-product','store-open','go-shop','reset-demo']);
// Blank and profile-only pets exist so engineers can inspect the exact four
// no-data page layouts. Browsing these pages must not force an Edit Pet modal.
// Actual measurements, alerts, pairing and record-writing remain gated.
const inspectionActions=new Set(['health-detail','health-back','deep-category','range','deep-day-view','deep-select-day','deep-day-step','deep-day-jump','food-day','food-window','health-summary-range','baseline-detail','baseline-page-back','age-detail-back','owner-all-nights-open','owner-all-nights-back','dp924-back-home','empty-open-health','free-open-health','dp70-watch-open','dp905-watch-more']);
const inspectionSubActions=new Set(['back-health','open-report','back','wave-back','wave-date','day','day-select','energy-date','back-energy','range','open-list','list','details','detail','close','expand','collapse']);
function inspectionBrowse(el,action){return inspectionActions.has(action)||['dp916','dp921','dp932','dp936'].some(prefix=>inspectionSubActions.has(el?.dataset?.[prefix]));}
function isStore(el){const val=String([el?.dataset?.action,el?.dataset?.page,el?.dataset?.detail,el?.dataset?.kind,el?.getAttribute?.('href')].join(' '));return /(?:shop|store|product|cart|checkout|purchase)/i.test(val);}
function mustGateAction(action,el){if(!fresh())return false;
 // The existing New Pet Heart Moments entry is explicitly a 60-second local
 // example, not a verified collar measurement. Preserve that first-use path
 // without allowing it to create a daily health score or baseline day.
 if(action==='heart-moment'&&!selectedBlank()&&dp58FreshPet())return false;
 if(!profileValid()){
   if(allowBeforeProfile.has(action)||inspectionBrowse(el,action)||isStore(el)||action==='')return false;
   remindProfile();return true;
 }
 // Location and nearby services require actual paired and authorized 4G
 // telemetry; a profile alone or Bluetooth health-only collar is not enough.
 if(needs4g.has(action)&&!(hasDevice()&&state.deviceType==='4g')){remind4g();return true;}
 if(featureWithoutSignal.has(action)&&!hasSignals()){remindDevice();return true;}
 return false;}
const oldAction=onAction;
onAction=function(el){if(mustGateAction(el?.dataset?.action||'',el))return;return oldAction(el);};
// Capture before legacy document-capture handlers for all non-[data-action]
// controls. Required for blank-profile Health/report dialogs and GPS buttons.
root.addEventListener('click',ev=>{const el=ev.target?.closest?.('button,[role="button"],a');if(!el||!fresh())return;
  if(el.closest('#dp-intro-root')||el.closest('.dp928-tour,.dp938-tour')||el.closest('.dp935-guide,.dp935-guide-overlay')||el.closest('.pet-top-strip-wrap')||el.closest('.app-bottom-nav,.bottom-nav')||el.closest('.dp-language-picker,.language-picker,.lang-selector'))return;
  const a=el.dataset?.action||'';
  if(a==='heart-moment'&&!selectedBlank()&&dp58FreshPet())return;
  const dpAttrs=['dp916','dp921','dp932','dp936','dp934','dp931','dp935','dp914','dp70','dp905','dp67'].map(x=>el.dataset?.[x]).filter(Boolean);
  const allowProfile=/^(pet-add|edit-pet|save-pet|pet-add-save|avatar-|tour-|modal-|select-|lang|change-lang|profile$|close$|open$)/.test(a)||/^(profile|close|open|tour|skip-pair)$/.test(dpAttrs[0]||'');
  if(!profileValid()&&!allowProfile&&!inspectionBrowse(el,a)&&!isStore(el)&&!(el.closest('[role="dialog"]')&&el.closest('.modal-sheet')?.querySelector('#addPetName,#petNameInput'))){
   // Mere tab selection remains accessible to inspect correctly empty pages.
   const tab=el.closest('.bottom-nav,.bottom-nav-wrap,.nav-bar,[data-tab]');if(tab)return;
   ev.preventDefault();ev.stopImmediatePropagation();remindProfile();return;
  }
  if(profileValid()&&!hasSignals()&&a==='heart-moment'){ev.preventDefault();ev.stopImmediatePropagation();remindDevice();return;}
  if(profileValid()&&(!hasDevice()||state.deviceType!=='4g')&&(a==='garden-detail'||a==='gps-open'||a==='garden-gps-demo')){ev.preventDefault();ev.stopImmediatePropagation();remind4g();}
 },true);
// The selected pet's scored cache should be recomputed with its own signals,
// including after switching away from an empty profile (no cross-pet overlay).
const priorSwitch=dpActivatePet;
dpActivatePet=function(index){const result=priorSwitch(index);if(result)root.DeepPetSignalScoring?.invalidate?.(index);return result;};
function syncHealthUI(app){if(state.tab!=='health'||state.detail)return;
 const pad=app.querySelector('.app-main>.app-pad');if(!pad)return;
 const heads=[...pad.querySelectorAll('.section-head')];
 const match=(terms)=>heads.find(x=>terms.some(v=>(x.textContent||'').includes(v)));
 const todayHead=match(['今日待辦','今日待办','今天需要處理','今天需要处理','Today’s tasks','Today tasks','오늘 해야','今日の']);
 const upcomingHead=match(['近期健康提醒','Upcoming care','다가오는 건강','今後の']);
 const plan=pad.querySelector('.dp916-care-card');
 const first=pad.querySelector('.dp941-prevention,.dp916-health-card,.dp914-report-hero');
 if(first&&todayHead&&todayHead.nextElementSibling?.classList.contains('care-todo')){const node=todayHead.nextElementSibling;pad.insertBefore(todayHead,first);todayHead.after(node);}
 if(todayHead&&upcomingHead&&upcomingHead.nextElementSibling?.classList.contains('care-todo')){const node=upcomingHead.nextElementSibling;todayHead.nextElementSibling.after(upcomingHead);upcomingHead.after(node);}
 const afterUpcoming=upcomingHead?.nextElementSibling;
 if(plan){plan.querySelector('h3')?.replaceChildren(document.createTextNode(t('計畫完成度','计划完成度','Plan completion','계획 완료율','計画達成率')));if(afterUpcoming)afterUpcoming.after(plan);}
 const target=A.diet(pet()),active=target.available&&profileValid();
 const feature=pad.querySelector('.food-feature');if(feature){const total=dpFoodTotals();const goal=active?targetFood():null;
  const strong=feature.querySelector('.food-feature-main strong');if(strong)strong.textContent=active?String(total.kcal):'N/A';
  const fraction=feature.querySelector('.food-feature-main span');if(fraction)fraction.textContent=active?`/ ${goal} kcal`:' / N/A';
  const ratio=feature.querySelector('.food-pct');if(ratio)ratio.textContent=active&&total.meals.length?`${Math.round(100*total.kcal/Math.max(1,goal))}%`:'—';
  const bar=feature.querySelector('.food-progress i');if(bar)bar.style.width=active&&total.meals.length?Math.min(100,Math.round(100*total.kcal/Math.max(1,goal)))+'%':'0%';}
}
function syncLanguage(app){
 const tour=document.querySelector('#overlay-root .dp938-tour');if(tour){const science=tour.querySelector('.dp938-science-plate>span');if(science)science.textContent=t('BCG · 心搏／呼吸偵測','BCG · 心搏／呼吸检测','BCG · HEARTBEAT / BREATHING','BCG · 심박 / 호흡','BCG · 心拍／呼吸');}
 for(const el of app.querySelectorAll('.app-build-version'))el.textContent='DeepPet · Version 9.69';
 // The V9.25 shared model card is authoritative for age formatting. A former
 // age-detail-only patch forced two decimals and disagreed with Home/Me.
 // Do not override its one-decimal age, actual age or rounded delta here.
}
const oldRender=render;
render=function(reset=false){oldRender(reset);const app=document.getElementById('app');if(!app)return;syncHealthUI(app);syncLanguage(app);};
const oldModal=renderModal;renderModal=function(){oldModal();syncLanguage(document.getElementById('app')||document.body);};
root.DeepPetUX941={version:'9.89',profileValid,hasSignals,canPair:()=>profileValid(),food:()=>A.diet(pet()),prevention:delay,ready:()=>fresh()?'new-profile':'demo',isolatedPetId:()=>selectedBlank()?'blank':String(state.dog)};
})(window);
