/* DeepPet V9.36 — investor gallery, one actual page structure for all pets.
   Blank / New Pet use the normal page renderer with no monitored data.
   No cross-pet numerical data is filled, and no daily exam penalties are introduced.
 */
(function(root){'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tr=(zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:(state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh);
const blank=()=>state.emptyPreview===true;
const realPet=()=>!blank()&&dpUsesRealMeasurements();
const realEvidence=()=>realPet()?(root.DeepPetSignalScoring?.getDaily?.(state.dog)||[]).filter(x=>x?.source==='20hz-waveform'&&x.quality?.heartValid===true&&x.quality?.respValid===true&&x.quality?.wearValid===true&&x.quality?.signalValid===true&&x.quality?.timeContinuityValid===true&&Number(x.quality?.timeCoverage)>=.5&&Number.isFinite(x.quality?.observedSeconds)&&x.quality.observedSeconds>=900&&Number.isFinite(x.quality?.observedDayFraction)&&Math.abs(x.quality.observedDayFraction-x.quality.observedSeconds/86400)<1e-5&&(x.quality.samplingMode!=='scheduled'||Number.isFinite(x.quality.scheduledSeconds)&&x.quality.scheduledSeconds>=1800&&x.quality.scheduledSeconds<=86400)&&Math.abs(x.quality.timeCoverage-Math.min(1,x.quality.observedSeconds/(x.quality.samplingMode==='scheduled'?x.quality.scheduledSeconds:86400)))<1e-5):[];
// A verified collar day changes the PAGE LAYOUT to the measured design even
// when a composite score is still N/A. Score availability is a separate gate.
const hasRealScore=()=>realEvidence().length>0;
// No fixed index is reserved for New Pet: users may add other pets first, and
// the sample New Pet may later have authentic verified measurements.
const unmeasured=()=>blank()||(!blank()&&(dp58FreshPet()||isFreePet()))||(realPet()&&!hasRealScore());
const key=()=>blank()?'blank':String(state.dog);
const priorRender=render,prevFresh=dp58FreshPet,prevFree=isFreePet,prevBlank=selectedBlank,originalSignals=dpSignals;
let lastProfile=null,inRenderer=false,expanded=false,virtualEmptyRender=false,virtualBlankRender=false;
// The demo's minute-value generator must never manufacture a wave or event for New Pet/Blank.
dpSignals=function(date,wanted){
 // A different pet may be scored while a New Pet view is being assembled.
 // Only the actually unmeasured identity can return empty streams: otherwise
 // the per-pet score engine caches empty data for Luna/Coco/Leo until refresh.
 if(Number(state.dog)>=15&&virtualEmptyRender){
  const keys=Array.isArray(wanted)&&wanted.length?wanted:['heart','breath','activity','rest'];
  return Object.fromEntries(keys.map(k=>[k,[]]));
 }
 return originalSignals(date,wanted);
};
function normalForEmpty(run){
 const originalDog=state.dog,wasBlank=state.emptyPreview;
 // Blank is NOT the 16th (New Pet) profile. Borrowing pet 15 here allowed
 // its medicines, care reminders and saved fields to appear under Blank.
 const shadowDog=wasBlank?allPets().length+1000:originalDog;
 const originalOverrides=state.petOverrides?.[shadowDog];
 const b=wasBlank;const oldVirtual=virtualEmptyRender,oldBlankVirtual=virtualBlankRender;virtualEmptyRender=true;virtualBlankRender=b;
 // Supply harmless fixture fields only to legacy layout functions. All saved
 // per-pet records for this unused index are absent by construction.
 if(b){state.dog=shadowDog;state.emptyPreview=false;state.petOverrides??={};state.petOverrides[shadowDog]={...(dogs[0]||{}),name:tr('空白檔案','No pet yet','빈 프로필','未登録'),photo:'',age:null,weight:null,heightCm:null,breed:{zh:'N/A',zht:'N/A',en:'N/A',ko:'N/A'},dpFreshPet:true};}
 const pf=dp58FreshPet,free=isFreePet,sb=selectedBlank,save=persist;
 dp58FreshPet=()=>false;isFreePet=()=>false;selectedBlank=()=>false;
 // Core render() calls persist(). Saving during the temporary identity switch
 // previously overwrote New Pet's workspace/device settings on Blank navigation.
 persist=()=>true;
 try{return run();}finally{persist=save;virtualEmptyRender=oldVirtual;virtualBlankRender=oldBlankVirtual;dp58FreshPet=pf;isFreePet=free;selectedBlank=sb;if(b){state.dog=originalDog;state.emptyPreview=wasBlank;if(originalOverrides===undefined)delete state.petOverrides[shadowDog];else state.petOverrides[shadowDog]=originalOverrides;}
  // Persist only the restored REAL identity (including the Blank selection),
  // never the artificial renderer-only profile.
  save();}
}
// All four pages and details follow the exact SAME renderer as Milo.
const normalView={home:()=>homeView(),deep:deepView,health:healthView,me:meView};
function shared(tab){return normalForEmpty(()=>normalView[tab]());}
// The release's last routing layer can reuse the live, measured Home factory
// for every identity without inheriting an obsolete v9.xx empty page.
root.DeepPetSharedPage936={render:shared,virtualEmpty:()=>virtualEmptyRender};
blankHomeView=()=>shared('home');blankDeepView=()=>shared('deep');blankHealthView=()=>shared('health');blankMeView=()=>shared('me');
dp58FreshHome=()=>shared('home');freeCareHomeView=()=>shared('home');freeCareDeepView=()=>shared('deep');freeCareHealthView=()=>shared('health');freeCareMeView=()=>shared('me');
if(typeof dp924FreshHealthView==='function')dp924FreshHealthView=()=>shared('health');
if(typeof dp58FreshEmptyTab==='function')dp58FreshEmptyTab=()=>shared(state.tab==='deep'?'deep':state.tab==='me'?'me':'health');
// Empty and unpaired pets must never run the 30-day demonstration waveform,
// score, nightly-summary, or recovery generators. They build hundreds of
// nodes and may format null readings, leaving the UI unresponsive on mobile.
// Keep the actual Deep/Health shell and navigation, with truly unavailable
// values, until verified pet-specific sensor records exist.
function noSignalDeep(){
 const tab=Math.max(0,Math.min(2,Number(state.deepType)||0)),days=[1,7,30].includes(Number(state.range))?Number(state.range):7;
 const real=realPet(),today=iso(localDate()),anchor=days===1?(state.deepSelectedDate||today):today;
 const scores=real?root.DeepPetBCG?.calendarWindow?.(realEvidence(),days,anchor)||[]:[];
 const avg=(key)=>{const vals=scores.map(x=>x.scores?.[key]).filter(Number.isFinite);return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;};
 const mainKey=['cardio','sleep','activityRecovery'][tab];
 const mainScore=avg(mainKey),metricKeys=[['heart','breath','hrv','stable'],['sleep',null,null],['energy','recovery','calm']][tab];
 const scoreMarkup=(s)=>Number.isFinite(s)?`<strong style="color:${scoreScheme(s).color}">${s}<small>/100</small></strong>`:'<strong>N/A <small>/100</small></strong>';
 const cp=[{color:'#c65e82',soft:'#fff5f8',border:'#f0d8e3',key:'heart'}, {color:'#40a078',soft:'#f2fbf6',border:'#d7eee2',key:'sleep'}, {color:'#4287dc',soft:'#f1f7ff',border:'#d9e9fd',key:'activity'}][tab];
 const names=[tr('心肺狀態','Heart & breathing','심폐 상태','心肺'),tr('睡眠休息','Sleep & rest','수면·휴식','睡眠・休息'),tr('精力與恢復','Energy & recovery','활력과 회복','活力・回復')];
 const details=[
  [tr('心跳狀況','Heart-rate status','심박 상태','心拍'),tr('呼吸狀況','Breathing status','호흡','呼吸'),tr('HRV · RMSSD / SDNN','HRV · RMSSD / SDNN','HRV','HRV'),tr('心搏節奏穩定度','Heartbeat rhythm stability','심박 리듬 안정도','心拍リズムの安定度')],
  [tr('休息情況','Rest duration','휴식 시간','休息時間'),tr('夜間中斷','Rest interruptions','휴식 중단','休息中断'),tr('睡眠與休息時間軸','Sleep & rest timeline','수면·휴식','睡眠・休息の推移')],
  [tr('精力情況','Energy status','활력 상태','活力'),tr('恢復情況','Recovery','회복','回復'),tr('放鬆與平穩度','Calm & steadiness','안정·평온','安静・安定')]
 ][tab];
 const msg=real&&Number.isFinite(mainScore)?tr('僅顯示已驗證的每日摘要；尚未取得原始時序波形。','Verified daily summaries only; raw time-series waves are not yet available.','검증된 일일 요약만 표시하며 원시 파형은 아직 없습니다.','検証済みの日次要約のみ表示。生波形は未取得です。'):tr('等待項圈配對及有效量測，尚無可計算的生理指標。','Awaiting a paired collar and valid recordings. No sensor-derived scores are available.','목걸이 연결 및 유효한 측정 데이터가 필요합니다.','首輪の接続と有効な測定データをお待ちください。');
 const date=iso(localDate());
 const dayScores=new Map(scores.map(x=>[x.date,x.scores?.[mainKey]]));
 const calendar=days>1?`<div class="dp936-energy-day-grid dp943-empty-calendar" aria-label="${tr('有效日期','Available dates','유효 날짜','有効日')}">${Array.from({length:days},(_,i)=>{const d=iso(dateAdd(localDate(),i-days+1)),s=dayScores.get(d),valid=Number.isFinite(s);return `<button type="button" data-action="deep-day-view" data-date="${d}" class="${d===state.deepSelectedDate?'active':''}"><b>${d.slice(5)}</b><small ${valid?`style="color:${scoreScheme(s).color}"`:''}>${valid?Math.round(s)+'/100':'N/A'}</small></button>`;}).join('')}</div>`:'';
 const noData='<div class="dp936-chart-na dp943-no-signal">N/A</div>';
 return `<div class="app-pad deep-themed deep-theme-${cp.key} dp-owner-deep dp943-empty-deep" style="--deep-accent:${cp.color};--deep-soft:${cp.soft};--deep-border:${cp.border};--deep-contrast:${cp.color}">${bigHeader(t('deep'))}<div class="tabs">${names.map((n,i)=>`<button type="button" class="tab ${i===tab?'active':''}" data-action="deep-category" data-index="${i}"><span class="tab-icon">${['♡','☾','⚡'][i]}</span>${n}</button>`).join('')}</div><div class="segment">${[1,7,30].map(n=>`<button type="button" class="seg-btn ${days===n?'active':''}" data-action="range" data-value="${n}">${n===1?tr('當天','Today','오늘','今日'):n+'D'}</button>`).join('')}</div>${calendar}<section class="card dp-owner-status-card dp-owner-period-card"><div class="dp-owner-status-heading dp-heart-overall-heading"><div><h2>${names[tab]}</h2><p class="dp-heart-overall-verdict">${msg}</p></div><div class="dp943-empty-main-score">${Number.isFinite(mainScore)?`<span style="color:${scoreScheme(mainScore).color}">${mainScore}</span>`:'N/A'} <small>/100</small></div></div><div class="dp943-empty-metrics">${details.map((n,i)=>`<div class="dp-vital-panel"><div class="dp-vital-heading"><div><b>${n}</b>${scoreMarkup(avg(metricKeys[i]))}</div></div>${noData}</div>`).join('')}</div></section><div class="footer-space"></div></div>`;
}
function noSignalHealth(){
 const care=[['med',t('med'),t('medHint'),'#f3efff'],['vaccines',t('vaccines'),t('vaccineHint'),'#fff2e6'],['deworming',tr('驅蟲計畫','Deworming','구충','駆虫'),'#eaf7ee'],['notes',t('notes'),t('notesHint'),'#edf2ff'],['recovery-care',tr('恢復情況','Recovery check','회복 상태','回復の確認'),'#edf6ff']];
 const planned=virtualBlankRender?[]:dpTodayCareItems(),upcoming=virtualBlankRender?[]:dpUpcomingCareItems(),food=virtualBlankRender?null:targetFood(),valid=Number.isFinite(food)&&food>0,consumed=virtualBlankRender?0:todayFood();
 // Today's to-do registry lists ONLY pending tasks. Using its length as the
 // denominator made "0/3" appear even when two other planned actions were
 // already completed. Use the same scheduled-plan evidence as the full page.
 const activePlans=virtualBlankRender?[]:(root.DeepPetHealthInsights?.care?.()||[]).filter(x=>Number.isFinite(x.value));
 const progress=activePlans.length?Math.round(activePlans.reduce((n,x)=>n+x.value,0)/activePlans.length):null;
 const plan=`<section class="card dp916-care-card"><h3>${tr('計畫完成度','Plan completion','계획 완료율','計画達成率')}</h3><strong>${progress===null?'N/A':progress+'%'}</strong></section>`;
 return `<div class="app-pad dp943-empty-health">${bigHeader(t('health'))}${dp67WatchMain()}<div class="section-head"><h2 class="section-title">${t('careToday')}</h2><span class="pill">${planned.length}</span></div><section class="card care-todo">${dpHealthTodayTasksMarkup(planned)}</section><div class="section-head"><h2 class="section-title">${tr('近期健康提醒','Upcoming care','다가오는 건강 관리','今後のケア')}</h2></div><section class="card care-todo dp-upcoming-care">${dpUpcomingCareMarkup(upcoming)}</section>${plan}<div class="section-head"><h2 class="section-title">${t('healthCare')}</h2></div><section class="card flat care-menu">${care.map(([key,title,hint,bg])=>`<button type="button" class="health-item" data-action="health-detail" data-page="${key}"><span class="thumb" style="background:${bg}">✦</span><span class="grow"><div class="lbl">${title}</div><div class="hint">${hint}</div></span><span>›</span></button>`).join('')}<button type="button" class="health-item" data-action="health-detail" data-page="reports"><span class="thumb">🩺</span><span class="grow"><div class="lbl">${t('reports')}</div></span><span>›</span></button></section><button type="button" class="card food-feature" data-action="health-detail" data-page="food"><div class="food-feature-top"><div class="food-illustration">🥣</div><div class="grow"><b>${t('food')}</b><div class="food-feature-sub">${tr('每日飲食建議與記錄','Daily food plan & log','일일 식사 계획','毎日の食事')}</div></div></div><div class="food-feature-main"><div><strong>${valid?consumed:'N/A'}</strong><span> / ${valid?food:'N/A'} kcal</span></div><div class="food-pct">${valid&&consumed>0?Math.round(consumed/food*100)+'%':'—'}</div></div><div class="food-progress"><i style="width:${valid?Math.min(100,Math.round(consumed/food*100)):0}%"></i></div></button><div class="footer-space"></div></div>`;
}
const deepOriginal=deepView,healthOriginal=healthView;
deepView=function(){
 // Verified daily summaries do not establish minute-level rhythm/sleep
 // timelines. Show the final measured day scores but never the gallery's
 // simulated waves or derived details for any real/edited pet.
 // Real owner pets graduate to the exact measured Deep renderer as soon as
 // a valid 20 Hz day produces a score. Previously they were trapped forever
 // in the legacy noSignalDeep() layout, even after successful ingestion.
 if(realPet()&&!hasRealScore())return state.detail==='dp90-waveform'?blankWaveDetail():noSignalDeep();
 if(state.detail==='dp936-energy-detail')return energyDetail();
 if(state.detail==='dp90-waveform'&&virtualEmptyRender)return blankWaveDetail();
 if(virtualEmptyRender)return noSignalDeep();
 return deepOriginal();
};
healthView=function(){if(virtualEmptyRender&&!state.detail)return noSignalHealth();return healthOriginal();};
// shared() originally retained pre-wrapper function references. As a result,
// navigating New Pet → Deep still ran the expensive legacy 1,440-point demo
// renderer even though a no-signal page existed. Route shared navigation
// through the actual guarded view functions, for both Blank and New Pet.
normalView.deep=()=>deepView();
normalView.health=()=>healthView();
// Me must follow the latest renderer too.  The original snapshot above was
// taken at V9.36, before several baseline, battery and profile refinements.
// A blank profile was therefore silently using an older Me page than Lucky
// and measured pets even after Health had been unified.
normalView.me=()=>meView();
function blankWaveDetail(){const kind=state.dp90WaveKind==='breath'?'breath':'heart';const date=state.dp90WaveDate||iso(localDate());const days=[7,30].includes(state.dp932WaveDays)?state.dp932WaveDays:1;
 const title=kind==='heart'?tr('心跳波形與變化','Heart rate changes','심박 변화','心拍変化'):tr('呼吸波形與變化','Breathing changes','호흡 변화','呼吸変化');
 const calendar=days===1?'':`<section class="card dp932-wave-calendar"><h3>${tr('選擇日期','Choose a date','날짜 선택','日付選択')} · ${days}D</h3><div class="dp932-wave-dates">${Array.from({length:days},(_,i)=>{const dt=iso(dateAdd(localDate(),i-days+1));return `<button data-dp932="wave-date" data-date="${dt}" class="${dt===date?'selected':''}"><small>${dt.slice(5)}</small><em>N/A</em></button>`}).join('')}</div></section>`;
 const card=(heading,inner)=>`<section class="card dp932-wave-section"><header><b>${heading}</b><small>${date}</small></header>${inner}</section>`;
 const na='<div class="dp936-chart-na">N/A</div>';
 return `<div class="app-pad dp932-wave-page"><header class="dp-independent-head"><button data-dp932="wave-back">←</button><b>${title}</b></header><p class="dp932-wave-subtitle">${date} · N/A</p>${calendar}${card(tr('即時波形','Live waveform','실시간 파형','リアルタイム波形'),na)}${card(tr('全天波形與變化時段','Full-day trend and changes','전체 변화','一日変化'),na+'<div class="dp932-wave-events">N/A</div>')}${card(tr('時段放大 · 與標記時間同步','Zoom · selected time','확대','拡大'),na)}</div>`;
}
// Prevent score explanation formulas in consumer UI; formulas remain in the engineering Word specification.
function removeConsumerFormula(app){app.querySelectorAll('.dp924-score-equation,.dp924-equation-final,.dp924-equation-warning').forEach(e=>e.remove());
 for(const e of app.querySelectorAll('p,small')){if(/(模型展示.*疾病診斷|model demonstration.*diagnos|今日身體狀態怎樣計算|How today.s body score is calculated)/i.test(e.textContent||''))e.remove();}}
function stripFake(app){
 // Empty states have no stored sensor readings. Zero or old demo values may not leak into the UI.
 for(const el of app.querySelectorAll('.dp-dot-meter-center strong,.dp928-age-shimmer strong,.dp928-age-comparison,.dp928-age-metric strong,.dp-score-ring strong,.score-value,.value-number')){
  if(el.querySelector('svg'))continue;const t=el.textContent?.trim()||'';if(/^([+\-−]?\d+(?:\.\d+)?(?:\s*years?|\s*yr|\s*歲)?)$/.test(t)||t==='—')el.textContent='N/A';
 }
 for(const el of app.querySelectorAll('.dp928-model-card .dp928-age-metric, .dp928-model-card .dp928-wellness-metric')){
  if(el.classList.contains('dp928-age-metric'))for(const n of el.querySelectorAll('strong,.dp928-age-comparison'))n.textContent='N/A';
  else for(const n of el.querySelectorAll('.dp-dot-meter-center strong'))n.textContent='N/A';
 }
 // No bogus live event or data chart, and no fake daily task from demo fixture.
 for(const el of app.querySelectorAll('.dp932-alerts,.dp932-energy-markers,.dp932-energy-highlow,.dp925-home-alerts'))el.remove();
 for(const el of app.querySelectorAll('.dp-health-lane .dp-dot-meter-center strong,.dp-rhythm-lane .dp-dot-meter-center strong'))el.textContent='N/A';
 for(const el of app.querySelectorAll('.dp-score-status,.dp932-model-status,.dp932-age-status'))if(/Healthy|Very well|Good|很|良好|平穩|稳定|안정|良い/i.test(el.textContent||''))el.textContent='N/A';
 for(const el of app.querySelectorAll('.dp928-trend-graphic svg,.seven-day-chart svg,.dp-chart-inspector svg')){el.style.visibility='hidden';let holder=el.parentElement;if(holder&&!holder.querySelector('.dp936-chart-na'))holder.insertAdjacentHTML('beforeend','<div class="dp936-chart-na">N/A</div>');}
 for(const e of app.querySelectorAll('.dp-range-quality,.dp-baseline-days'))e.textContent=tr('N/A · 尚未有有效量測','N/A · No valid readings','N/A · 측정 전','N/A · 記録なし');
 for(const e of app.querySelectorAll('.dp-owner-gps-status,.dp-pet-gps-status'))e.textContent='N/A';
 for(const e of app.querySelectorAll('.dp-health-exam-coverage,.dp916-completeness,.dp-report-coverage'))if(/0%|completeness|完整度/i.test(e.textContent))e.textContent='N/A';
 for(const e of app.querySelectorAll('.dp928-model-card .dp928-model-foot span'))e.textContent=tr('等待有效量測','Awaiting readings','측정 대기','測定待ち');
 const wn=document.createTreeWalker(app,NodeFilter.SHOW_TEXT);let nd;while((nd=wn.nextNode()))if(nd.nodeValue.trim()==='—')nd.nodeValue='N/A';
 // Do not expose zero / suggested calories as actually recorded food data.
 for(const e of app.querySelectorAll('section.card,section.care-menu,.care-plan-card,.card')){
  if(e.querySelector('[data-action="food-target"]')||e.classList.contains('dp916-care-card')){
    const walk=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let n;
    while((n=walk.nextNode())){const v=n.nodeValue.trim();if(/^0\s*\/\s*\d+\s*kcal$/i.test(v)||(/^0$/.test(v)&&/Daily feeding target|飲食目標/.test(e.textContent)))n.nodeValue='N/A';}
  }
 }
 for(const e of app.querySelectorAll('.dp928-age-metric'))if(blank())for(const node of e.querySelectorAll('small,span'))if(/Actual age|實際年齡|实际年龄|실제|実年齢/.test(node.textContent||''))node.textContent=tr('實際年齡 N/A','Actual age N/A','실제 나이 N/A','実年齢 N/A');
 for(const e of app.querySelectorAll('.dp-baseline-card,.dp-baseline-days,.baseline-status'))if(/0\/14|0\/30|14 valid/.test(e.textContent))for(const n of e.querySelectorAll('small,span'))if(/0\/14|0\/30/.test(n.textContent))n.textContent='N/A';
 const selectors=['.dp-today-focus','.dp932-alerts','.dp66-urgent-home'];for(const sel of selectors)for(const e of app.querySelectorAll(sel))e.remove();
 // No diary data is created just because breed/weight exists.
 const todayKey=`${state.dog}-${iso(localDate())}`;
 const savedMeals=state.mealItems?.[todayKey];
 const hasSavedFood=!blank()&&(Number(state.foodTarget?.[state.dog])>0||(Array.isArray(savedMeals)&&savedMeals.length>0));
 // A user-entered diet target is a real care record even without sensor readings.
 // Do not mask it as N/A simply because this pet has no collar history.
 if(!hasSavedFood){
  for(const e of app.querySelectorAll('.dp-health-food-progress,.food-consumed,.food-current,.dp-care-plan-completion .percentage,.dp70-food-numbers'))e.textContent='N/A';
  for(const n of app.querySelectorAll('.dp70-food-track i'))n.style.width='0%';
 }
 const textWalker=document.createTreeWalker(app,NodeFilter.SHOW_TEXT);let item;
 while(item=textWalker.nextNode()){
   let text=item.nodeValue;
   if(/Record completeness|檔案完整度|档案完整度|數據完整度|数据完整度/.test(text))text='';
   text=text.replace(/—/g,'N/A').replace(/0\s*\/\s*14\s*(?:valid days?|有效天)?/gi,'N/A').replace(/0\s*\/\s*30\s*(?:valid days?|有效天)?/gi,'N/A').replace(/\b0\s*\/\s*7\b/g,'N/A').replace(/\b0 days flagged\b/gi,'N/A');
   if(blank())text=text.replace(/N\/A\s+(?:Rd\.|Road|Lane)/g,'N/A').replace(/ID\s*[·:]\s*DP-[A-Z0-9-]+/gi,'ID · N/A').replace(/\b(?:Park Rd\.|Pet Lane|Park)\b/g,'N/A');
   if(text!==item.nodeValue)item.nodeValue=text;
 }

 for(const e of app.querySelectorAll('.dp928-model-card .dp928-model-foot span'))e.textContent=tr('等待有效量測','Awaiting readings','측정 대기','測定待ち');
}
function patchEmptySleep(app){
  if(state.tab!=='deep'||Number(state.deepType)!==1||Number(state.range)!==1||state.detail)return;
  const card=app.querySelector('.dp-owner-status-card:not(.dp-owner-sleep)');
  if(!card||card.querySelector('.dp-owner-status-inner'))return;
  const n='N/A',title=tr('睡眠與休息','Sleep & rest','수면·휴식','睡眠・休息'),no=tr('尚無有效睡眠紀錄','No valid sleep readings','유효한 수면 기록 없음','有効な睡眠記録なし');
  card.classList.add('dp-owner-sleep');
  card.innerHTML=`<div class="dp-owner-status-inner"><div class="dp-sleep-period-score-head"><div><h2>${title}</h2><p class="dp-heart-overall-verdict">${no}</p></div><div class="dp90-unavailable">${n}</div></div><p class="dp-owner-subsummary">${no}</p><div class="dp-owner-sleep-facts"><div><span>${tr('每晚睡眠與休息總時長','Nightly sleep & rest duration','밤 수면·휴식 총시간','一晩の睡眠・休息時間')}</span><b>${n}</b></div><div><span>${tr('夜間休息中斷','Rest interruptions','휴식 중단','休息中断')}</span><b>${n}</b></div></div><div class="dp-owner-sleep-legend"><strong>${tr('睡眠與休息／活動時間軸','Rest and movement timeline','수면·휴식/움직임 시간대','休息／活動の時間軸')}</strong><span><i class="sleep"></i>${title}</span><span><i class="awake"></i>${tr('活動','Movement','움직임','活動')}</span></div><div class="dp-owner-sleep-timeline"><div class="dp936-chart-na">${n}</div></div></div>`;
}
function updateBlankText(app){if(!blank())return;
 // Replace basic profile text in the shared normal template (not another page design).
 for(const el of app.querySelectorAll('.home-hero-poster,.me-profile-card,.me-profile-head,.dp-pet-header')){
  for(const node of [...el.querySelectorAll('*')])if(node.children.length===0&&/^(New Pet|Shiba Inu|柴犬|시바견)(\s*·.*)?$/i.test(node.textContent?.trim()||''))node.textContent=tr('N/A','N/A','N/A','N/A');
  if(el.classList.contains('home-hero-poster')){el.style.backgroundImage='linear-gradient(120deg,#6659b3,#ad9ce0,#e7d8f6)';el.classList.add('dp936-no-photo');}
 }
 const pill=app.querySelector('[data-action="select-pet"][data-index="15"]'),info=state.petExtras?.[0];if(pill&&info){pill.classList.remove('active');const img=pill.querySelector('img');if(img&&info.photo)img.src=info.photo;const label=pill.querySelector('span');if(label)label.textContent=typeof dp58FreshDisplayName==='function'?dp58FreshDisplayName(info):info.name||'New Pet';}
 app.querySelector('[data-action="select-blank"]')?.classList.add('active');
 // Blank is a different gallery choice; do not display the New Pet's profile or photo.
 for(const e of app.querySelectorAll('.home-hero-poster .hero-meta,.me-profile-card .pet-meta,.me-profile-head small'))e.textContent='N/A';
 const walker=document.createTreeWalker(app,NodeFilter.SHOW_TEXT);let text;while(text=walker.nextNode())if(/null\s*(?:yr|years?|kg|歲|세)|N\/A\s*·\s*null/.test(text.nodeValue))text.nodeValue=text.nodeValue.replace(/null/g,'N/A');
}
function removeOutdatedHome(app){if(state.tab!=='home')return;
 app.querySelectorAll('.dp-today-focus,.dp931-empty-focus,.dp932-alerts,.dp935-empty-moment,.me-heart-moment-entry,.dp66-urgent-home,.dp66-urgent-card,.dp916-home-card,.dp916-home-exam-card,.dp925-open-exams,.dp921-home-exam-link,.dp905-milo-demo,.dp936-home-todo').forEach(e=>e.remove());
 // No missing-data-only To-do card: it was an extra Home component that Milo
 // never rendered, so Lucky and Blank had a different section count and order.
}
function detectEvents(){if(unmeasured())return [];
 const date=iso(localDate());
 // Home alerts must be exactly the evidence reconciled into today's scores.
 // Relative peaks alone may be chart markers, but are NOT scored alerts.
 const scored=root.DeepPetSignalScoring?.getDaily?.(state.dog)?.find(x=>x?.date===date);
 if(!scored||!Number.isFinite(scored.scores?.physiol))return [];
 const q=scored.quality||{};
 const real=scored.source==='20hz-waveform';
 if(real&&(q.heartValid!==true||q.respValid!==true||q.timeContinuityValid!==true||q.wearValid!==true||q.signalValid!==true||!(Number(q.timeCoverage)>=.5)||!Number.isFinite(q.observedSeconds)||q.observedSeconds<900||!Number.isFinite(q.observedDayFraction)||Math.abs(q.observedDayFraction-q.observedSeconds/86400)>=1e-5||(q.samplingMode==='scheduled'&&(!Number.isFinite(q.scheduledSeconds)||q.scheduledSeconds<1800||q.scheduledSeconds>86400))||Math.abs(q.timeCoverage-Math.min(1,q.observedSeconds/(q.samplingMode==='scheduled'?q.scheduledSeconds:86400)))>=1e-5))return [];
 const scoredEvents=(scored.integrity?.alerts||[]).filter(e=>['heart','breath'].includes(e.kind)&&e.date===date&&Number.isFinite(e.value)&&Number.isFinite(e.minute))
  .map(e=>({...e,type:e.value>=e.reference?'high':'low',deviation:e.relative??0}))
  .sort((a,b)=>(b.relative||0)-(a.relative||0));
 if(real||scoredEvents.length)return scoredEvents;
 // Investor-gallery profiles: only their dated valid minute traces may
 // produce a timed episode. Never copy a showroom event into real/new pets.
 const p=allPets()[state.dog],r=demoRecords(state.dog),idx=r.findIndex(x=>x.date===date);
 if(!Number.isInteger(state.dog)||state.dog>=dogs.length||p?.dpFixtureInvalidated||p?.dpFreshPet||p?.freeCare||idx<0||validDaySample(r[idx],idx)?.valid!==true)return [];
 const events=['heart','breath'].map(kind=>typeof root.dp911EventFor==='function'?root.dp911EventFor(date,kind):null)
  .filter(e=>e&&Number.isFinite(e.value)&&Number.isFinite(e.minute))
  .map(e=>({...e,type:e.diff>=0?'high':'low',deviation:e.relative})).sort((a,b)=>b.deviation-a.deviation);
 if(events.length)return events;
 // A low daily composite is NOT proof of a sudden attack. Still disclose
 // persistent low component scores as observation priorities, with no fake
 // spike time or invented acute vital reading.
 return ['heart','breath'].map(kind=>({kind,score:scored.scores?.[kind]}))
  .filter(e=>Number.isFinite(e.score)&&e.score<60)
  .map(e=>({...e,type:'sustained',source:'daily-score',date,minute:null,severity:3,level:'high'}));
}
// Shared evidence selector for later alert presentations. The source of truth
// remains this function; consumers must distinguish minute events from daily scores.
root.DeepPetAlertEvidence936={detectEvents};
function alertPanel(app){if(state.tab!=='home')return;
 const main=app.querySelector('.home-page-v30');if(!main)return;
 main.querySelectorAll('.dp936-urgent').forEach(e=>e.remove());
 const ev=detectEvents(),visible=expanded?ev:ev.slice(0,3);
 const name={heart:tr('心率','Heart rate','심박','心拍'),breath:tr('呼吸','Breathing','호흡','呼吸'),activity:tr('活動強度','Activity intensity','활동 강도','活動強度')};
 const labels=visible.map((e,i)=>e.source==='daily-score'?
  `<button type="button" class="dp936-alert-item" data-dp936="alert-summary" data-kind="${e.kind}"><span class="dp936-alert-time">${tr('本日','Today','오늘','今日')}</span><strong>${name[e.kind]} · ${tr('持續低分','Low daily score','낮은 하루 점수','低スコア')} ${Math.round(e.score)}/100</strong><small class="dp1054-alert-context">${tr('非突發事件，請查看心肺分析','Not a sudden event; review cardio details','돌발 사건이 아닌 일일 점수입니다','急変ではなく日別の点数です')}</small><span>›</span></button>`:
  `<button type="button" class="dp936-alert-item" data-dp936="alert" data-kind="${e.kind}" data-date="${e.date}" data-minute="${e.minute}"><span class="dp936-alert-time">${String(Math.floor(e.minute/60)).padStart(2,'0')}:${String(e.minute%60).padStart(2,'0')}</span><strong>${name[e.kind]} ${e.type==='high'?'↑':'↓'} ${e.value.toFixed(1)} ${e.kind==='heart'?'bpm':e.kind==='breath'?tr('次／分','/min','회/분','回/分'):''}</strong><span>›</span></button>`).join('');
 const block=`<section class="card dp936-urgent"><div class="dp936-urgent-head"><b>${tr('應急提醒','Urgent alerts','긴급 알림','緊急のお知らせ')}</b><small>${ev.length?ev.length:'0'}</small></div>${labels||`<div class="dp936-urgent-empty">${tr('今日沒有符合門檻的突發心跳或呼吸變化','No qualifying sudden heart or breathing changes today','오늘 급격한 심박·호흡 변화 없음','本日は対象となる急変なし')}</div>`}${ev.length>3?`<button class="dp936-more" data-dp936="more">${expanded?tr('收起','Show less','접기','閉じる'):'More'}</button>`:''}</section>`;
 const summary=main.querySelector('.summary-card'),focus=main.querySelector('.dp928-model-card');
 if(summary)summary.insertAdjacentHTML('afterend',block);else if(focus)focus.insertAdjacentHTML('beforebegin',block);else main.insertAdjacentHTML('afterbegin',block);
}
function tabLabelFix(app){if(state.tab!=='deep')return;
 const third=app.querySelectorAll('.tabs .tab')[2];if(third){const text=tr('精力與恢復狀態','Energy & Recovery Status','활력과 회복 상태','活力と回復状態');for(const n of third.childNodes)if(n.nodeType===Node.TEXT_NODE&&n.textContent.trim())n.textContent=text;}
 for(const e of app.querySelectorAll('.dp932-energy-markers,.dp932-energy-changes,.dp932-energy-highlow,.dp-energy-markers'))if(state.detail!=='dp936-energy-detail')e.remove();
 for(const el of app.querySelectorAll('span,b,strong')){
  if(/^(健康|Healthy|良好|Good|건강|良好)$/.test(el.textContent?.trim()||'')){el.classList.add('dp936-healthy-green');}
 }
}
function closeLegacy(app){removeConsumerFormula(app);
 // Do not show calculations or private weighting on any user-facing score dialog.
 app.querySelectorAll('.dp924-score-equation,.dp-score-formula,.score-formula').forEach(e=>e.remove());
}
function setupCharts(app){
 // The plotted 1,440 minute samples and time-selected zoom use the same source.
 if(state.tab!=='deep')return;
 const kind=state.dp90WaveKind==='breath'?'breath':'heart';
 if(state.detail==='dp936-energy-detail'){const date=state.dp936EnergyDate||iso(localDate());for(const svg of app.querySelectorAll('.dp936-energy-svg')){svg.dataset.dp936Source='activity';svg.dataset.dp936Date=date;svg.dataset.dp936A=svg.dataset.start||0;svg.dataset.dp936B=svg.dataset.end||1439;}return;}
 if(state.detail==='dp90-waveform'){
  const date=state.dp90WaveDate||iso(localDate());const wave=unmeasured()?[]:originalSignals(date,[kind])?.[kind]||[];
  for(const [i,svg] of [...app.querySelectorAll('.dp932-wave-section svg.dp932-chart')].entries()){
   if(!Array.isArray(wave)||wave.length!==1440)continue;
   let chosen=Number.isInteger(state.dp932WaveMinute)?state.dp932WaveMinute:null;
   const observed=root.DeepPetChange932?.detect(wave,{kind,maxEvents:35})||[];
   const selected=observed.find(e=>e.minute===chosen)||[...observed].sort((a,b)=>b.minute-a.minute)[0];
   if(!Number.isInteger(chosen)||chosen<0||chosen>1439)chosen=selected?.minute??720;
   const a=i===0?0:Math.max(0,chosen-30),b=i===0?1439:Math.min(1439,chosen+30);
   svg.dataset.dp936Source=kind;svg.dataset.dp936Date=date;svg.dataset.dp936A=a;svg.dataset.dp936B=b;
  }
 }
}
let tooltip=null;
function renderTooltip(e,svg){const kind=svg.dataset.dp936Source;if(!kind)return;
 const date=svg.dataset.dp936Date,vals=originalSignals(date,[kind])?.[kind];if(!Array.isArray(vals)||vals.length!==1440)return;
 const rect=svg.getBoundingClientRect(),vbox=svg.viewBox.baseVal,x=(e.clientX-rect.left)*vbox.width/(rect.width||1);const a=Number(svg.dataset.dp936A),b=Number(svg.dataset.dp936B);
 let minute=Math.max(a,Math.min(b,Math.round(a+(x-37)/313*(b-a))));if(kind==='activity')minute=Math.max(a,Math.min(b,Math.round(minute/5)*5));const val=vals[minute];if(!Number.isFinite(val))return;
 if(!tooltip){tooltip=document.createElement('div');tooltip.className='dp935-hover-tip dp936-wave-tooltip';document.body.appendChild(tooltip);}
 const unit=kind==='heart'?'bpm':kind==='breath'?tr('次／分','/min','회/분','回/分'):'';
 tooltip.textContent=`${date} ${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')} · ${Number(val).toFixed(1)} ${unit}`;
 tooltip.style.left=Math.max(5,Math.min(window.innerWidth-205,e.clientX+9))+'px';tooltip.style.top=Math.max(5,e.clientY-48)+'px';
}
function energyDetail(){const date=state.dp936EnergyDate||iso(localDate()),recorded=typeof demoRecords==='function'&&typeof qualityForDay==='function'?(()=>{const i=demoRecords(state.dog).findIndex(r=>r.date===date);return i>=0&&qualityForDay(i,state.dog).valid;})():true,d=(virtualEmptyRender||unmeasured()||!recorded)?[]:originalSignals(date,['activity'])?.activity||[];
 const back=tr('返回精力與恢復狀態','Back to energy & recovery','뒤로','戻る');
 const title=tr('精力情況 · 詳細數據','Energy & activity · Details','활동 상세','活動の詳細');
 const events=d.length===1440?root.DeepPetChange932.detect(d,{kind:'activity',maxEvents:35}):[];
 const raw=Number.isInteger(state.dp936EnergyMinute)?state.dp936EnergyMinute:null;
 const latest=[...events].sort((a,b)=>b.minute-a.minute)[0];
 const chosen=d.length===1440?(raw!==null&&raw>=0&&raw<1440?raw:(latest?.minute??720)):null;
 const selectedValue=chosen!==null?Number(d[chosen]):null,time=chosen===null?'N/A':`${String(Math.floor(chosen/60)).padStart(2,'0')}:${String(chosen%60).padStart(2,'0')}`;
 const markers=events.map(e=>`<button data-dp936="energy-select" data-minute="${e.minute}" class="dp936-energy-marker ${e.minute===chosen?'selected':''}"><span>${String(Math.floor(e.minute/60)).padStart(2,'0')}:${String(e.minute%60).padStart(2,'0')} ${e.type==='high'?'↑':'↓'}</span><strong>${Number(e.value).toFixed(1)}</strong></button>`).join('');
 return `<div class="app-pad dp936-energy-page"><header class="dp-independent-head"><button data-dp936="back-energy">←</button><b>${title}</b></header><div class="segment">${[1,7,30].map(n=>`<button data-dp936="energy-range" data-range="${n}" class="seg-btn ${Number(state.range)===n?'active':''}">${n===1?tr('當天','Day','오늘','今日'):n+'D'}</button>`).join('')}</div>${Number(state.range)>1?`<div class="dp936-energy-day-grid">${Array.from({length:state.range},(_,i)=>{const date=iso(dateAdd(localDate(),i-state.range+1));return `<button data-dp936="energy-date" data-date="${date}" class="${date===state.dp936EnergyDate?'active':''}">${date.slice(5)}</button>`}).join('')}</div>`:''}<section class="card dp936-energy-chart"><h3>${tr('全天活動與精力變化','Daily activity and energy','활동 변화','活動変化')} · ${date}</h3>${chosen!==null?`<div class="dp938-event-summary"><span>◎ ${tr('已選事件','Selected event','선택된 이벤트','選択された変化')}</span><b>${date} ${time}</b><strong>${selectedValue.toFixed(1)} /100</strong></div>`:''}<div class="dp936-energy-graph">${d.length===1440?energySVG(d,events,0,1439,chosen):'<div class="dp936-chart-na">N/A</div>'}</div><div class="dp936-energy-markers"><h4>${tr('高低變化時段','Notable high and low periods','높낮이 시간','高低変化の時間帯')}</h4>${markers||'<p>N/A</p>'}</div></section><section class="card dp936-energy-chart dp938-energy-zoom"><h3>${tr('時段放大 · 與標記時間同步','Zoom · selected time','선택 시간 확대','選択時刻を拡大')}</h3>${chosen!==null?`<div class="dp932-zoom-stats"><span>${date} ${time}</span><strong>${selectedValue.toFixed(1)} /100</strong></div><div class="dp936-energy-graph">${energySVG(d,events,Math.max(0,chosen-30),Math.min(1439,chosen+30),chosen)}</div>`:'<div class="dp936-chart-na">N/A</div>'}</section></div>`;
}
function energySVG(values,events,start=0,end=1439,chosen=null){const W=360,H=180,L=37,R=10,T=18,B=32;const hi=Math.max(100,...values.slice(start,end+1));const X=i=>L+(W-L-R)*(i-start)/Math.max(1,end-start),Y=v=>T+(hi-v)/hi*(H-T-B);
 const stride=end-start>250?5:1,points=[];for(let m=start;m<=end;m+=stride)points.push(m);if(points.at(-1)!==end)points.push(end);
 const path=points.map((m,i)=>`${i?'L':'M'}${X(m).toFixed(2)},${Y(values[m]).toFixed(2)}`).join(' ');
 const mark=chosen!==null&&chosen>=start&&chosen<=end?`<line x1="${X(chosen)}" x2="${X(chosen)}" y1="${T}" y2="${H-B}" stroke="#f35d76" stroke-width="1.8" stroke-dasharray="4 4"/><circle class="dp938-selected-event" cx="${X(chosen)}" cy="${Y(values[chosen])}" r="8" fill="#fff" stroke="#f35d76" stroke-width="3"/><circle cx="${X(chosen)}" cy="${Y(values[chosen])}" r="3.2" fill="#f35d76"/>`:'';
 const time=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
 return `<svg class="dp936-energy-svg dp932-chart" data-start="${start}" data-end="${end}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Activity by minute">${[0,.5,1].map(f=>`<line x1="${L}" y1="${Y(hi*f)}" x2="350" y2="${Y(hi*f)}" stroke="#e3eaf5"/><text x="32" y="${Y(hi*f)+4}" text-anchor="end" fill="#687a94" font-size="10">${(hi*f).toFixed(0)}</text>`).join('')}<path d="${path}" fill="none" stroke="#4287dc" stroke-width="2.3"/>${events.filter(e=>e.minute>=start&&e.minute<=end).map(e=>`<circle cx="${X(e.minute)}" cy="${Y(e.value)}" r="5" stroke="${e.type==='high'?'#e2775d':'#5294db'}" fill="white" stroke-width="2" data-dp936="energy-select" data-minute="${e.minute}"/>`).join('')}${mark}<text x="${L}" y="175" font-size="10" fill="#687a94">${time(start)}</text><text x="195" y="175" font-size="10" fill="#687a94">${time(Math.floor((start+end)/2))}</text><text x="350" y="175" text-anchor="end" font-size="10" fill="#687a94">${time(end)}</text><text x="${L}" y="11" font-size="10" fill="#687a94">${tr('強度','Intensity','강도','強度')}</text></svg>`;
}
// Wire actual normal page functions for both empty gallery states. Preserve caller state after rendering.
render=function(reset=false){if(inRenderer)return priorRender(reset);inRenderer=true;
 const actual=realPet();
 // Reconcile legacy synthetic care records before Home, Health or Me reads
 // any pet-owned reminders, food totals, exams or medical history.
 if(actual)dpPruneOwnerShowcaseRecords();
 const isEmpty=unmeasured(),measured=actual&&hasRealScore(),petKey=key(),b=blank();
 // Invalidate a formerly selected identity before rendering the new one.
 if(lastProfile!==petKey&&!isEmpty)root.DeepPetSignalScoring?.invalidate?.(state.dog);
 try{
  // The original 30-day gallery renderer always synthesizes minute data.
  // Actual owner pets must use the safe, measured-day shell even after pairing.
  if(isEmpty||actual)normalForEmpty(()=>priorRender(reset));else priorRender(reset);
 }catch(err){console.error('render V9.36',err);throw err;}
 finally{inRenderer=false;}
 const app=document.getElementById('app');if(!app)return;
 // A profile switch is independent from tab switches or 1/7/30-day changes.
 if(lastProfile!==petKey){lastProfile=petKey;expanded=false;if(isEmpty){root.DeepPetGuide935?.show(true);}else root.DeepPetGuide935?.close(false);}
 closeLegacy(app);removeOutdatedHome(app);
 for(const n of app.querySelectorAll('small,span,p'))if(/^(Record completeness|報告完整度|档案完整度|檔案完整度|데이터 완성도)/i.test(n.textContent?.trim()||''))n.remove();
 if(isEmpty||(actual&&state.tab!=='deep')){stripFake(app);app.querySelectorAll('.dp73-narrative').forEach(e=>e.remove());patchEmptySleep(app);if(b)updateBlankText(app);}
 // In Deep, the only non-N/A values are explicitly sourced from 20 Hz
 // verified daily scores. Never replace those legitimate scores with N/A.
 if(actual&&measured&&state.tab==='home'){
  const today=realEvidence().find(x=>x.date===iso(localDate()));
  const values=today?.scores;
  const card=app.querySelector('.summary-card');
  if(card){
   const item=(k,label)=>{const n=values?.[k];return `<div class="dp945-measured-item"><small>${label}</small><strong style="color:${Number.isFinite(n)?scoreScheme(n).color:'#94a3b8'}">${Number.isFinite(n)?Math.round(n):'N/A'}</strong><small>${Number.isFinite(n)?'/100':''}</small></div>`;};
   card.innerHTML=`<h2>${tr('今日總結','Today’s summary','오늘 요약','今日のまとめ')}</h2><div class="dp945-measured-summary">${item('physiol',tr('身體狀態','Body condition','신체 상태','身体状態'))}${item('rhythm',tr('身體節奏','Body rhythm','몸 리듬','身体リズム'))}</div><p>${tr('僅顯示已驗證的本日項圈資料','Only today’s verified collar data is shown','오늘 검증된 데이터만 표시','本日の検証済みデータのみ表示')}</p>`;
  }
 }
 tabLabelFix(app);alertPanel(app);setupCharts(app);
 for(const e of app.querySelectorAll('.app-build-version'))e.textContent='DeepPet · Version 9.37';
};
document.addEventListener('pointermove',e=>{const svg=e.target.closest?.('svg[data-dp936-source]');if(svg)renderTooltip(e,svg);else if(tooltip){tooltip.remove();tooltip=null;}},true);
document.addEventListener('click',e=>{const t=e.target.closest?.('[data-dp936]');if(!t)return;const act=t.dataset.dp936;e.preventDefault();e.stopImmediatePropagation();
 if(act==='more'){expanded=!expanded;render(false);return;}
 if(act==='alert-summary'){state.tab='deep';state.deepType=0;state.range=1;state.detail=null;render(true);return;}
 if(act==='alert'){const kind=t.dataset.kind,date=t.dataset.date,minute=Number(t.dataset.minute);state.tab='deep';state.range=1;state.deepSelectedDate=date;
  if(kind==='activity'){state.deepType=2;state.detail='dp936-energy-detail';state.dp936EnergyDate=date;state.dp936EnergyMinute=minute;}
  else{state.deepType=0;state.detail='dp90-waveform';state.dp90WaveKind=kind;state.dp90WaveDate=date;state.dp932WaveDays=1;state.dp932WaveMinute=minute;}
  render(true);return;}
 if(act==='back-energy'){state.tab='deep';state.detail=null;state.deepType=2;render(true);return;}
 if(act==='energy-range'){state.range=Number(t.dataset.range);render(true);return;}
 if(act==='energy-date'){state.dp936EnergyDate=t.dataset.date;render(true);return;}
 if(act==='energy-select'){state.dp936EnergyMinute=Number(t.dataset.minute);render(false);return;}
},true);
// A truly blank profile has no owner record; never mutate Milo's data under index 0.
document.addEventListener('click',e=>{
 if(!blank())return;
 const r=e.target.closest?.('[data-dp921]'),a=e.target.closest?.('[data-action]');
 const action=a?.dataset.action;
 const healthAction=state.tab==='health'&&(['health-detail','dp921-open-latest','dp921-list','dp916-add-exam','dp916-open-exam'].includes(action));
 const profileAction=['edit-pet','avatar-change','save-pet'].includes(action);
 if(r||healthAction||profileAction){e.preventDefault();e.stopImmediatePropagation();
   if(typeof toast==='function')toast(tr('請先建立寵物檔案，再保存寵物健康紀錄','Create a pet profile before saving health records','먼저 프로필을 만드세요','先にプロフィールを登録'));
   if(healthAction||profileAction)openModal('pet-add');
 }
},true);
// Deep > Energy detailed-data entry; content itself stays in the regular Deep category.
document.addEventListener('click',e=>{if(state.tab!=='deep'||state.deepType!==2||state.detail||unmeasured())return;
 const t=e.target.closest?.('[data-action="dp905-energy-day-link"],[data-action="dp90-wave-open"],[data-action="deep-detail"],[data-action="deep-drill"]');
 if(!t)return; e.preventDefault();e.stopImmediatePropagation();state.detail='dp936-energy-detail';state.dp936EnergyDate=state.deepSelectedDate||iso(localDate());render(true);
},true);

const baseModal=renderModal;
renderModal=function(){baseModal();const overlay=document.getElementById('overlay-root');if(!overlay)return;
 overlay.querySelectorAll('.dp924-score-equation,.dp924-equation-final,.dp924-equation-warning,.score-formula').forEach(el=>el.remove());
 overlay.querySelectorAll('.dp921-lineage').forEach(e=>e.remove());
 const lead=overlay.querySelector('.summary-detail-lead');if(lead){const strong=lead.querySelector('strong');lead.innerHTML=strong?strong.outerHTML:'';}
 for(const el of overlay.querySelectorAll('p,small,.notices'))if(/(模型展示.*疾病診斷|model demonstration.*diagnos|These are modeled this pet’s trends|not diagnostic evidence|平均.*兩|exactly two measures|Average of exactly two|42%|30%.*28%|計算公式|權重公式|今日分數說明|today.s score is calculated)/i.test(el.textContent||''))el.remove();
 if(unmeasured())for(const el of overlay.querySelectorAll('.score-ring strong,.dp-dot-meter-center strong,.summary-three-rings strong,.score-value,.summary-score strong'))if(/^\d+(?:\.\d+)?$/.test(el.textContent.trim()))el.textContent='N/A';
};

root.DeepPetQA936={isEmpty:unmeasured,virtualBlank:()=>virtualBlankRender,events:detectEvents,version:'9.36',normalViewUsed:()=>!!document.querySelector('.deep-themed,.dp-owner-deep,.home-page-v30')};
})(window);
