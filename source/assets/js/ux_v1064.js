/* DeepPet V10.64 — content audit and evidence-safe navigation.
 * Release rule: a pet without verified sensor readings can never reach
 * generated waveform evidence through an otherwise valid details link.
 * The existing showcase fixtures and all real health records are untouched.
 */
(function(root){'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const unmeasured=()=>state.emptyPreview===true||typeof selectedBlank==='function'&&selectedBlank()||typeof dp58FreshPet==='function'&&dp58FreshPet()||typeof isFreePet==='function'&&isFreePet()||typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements()&&!(root.DeepPetSignalScoring?.getDaily?.(state.dog)||[]).some(x=>x?.source==='20hz-waveform'&&x?.quality?.heartValid===true&&x?.quality?.respValid===true&&x?.quality?.wearValid===true&&x?.quality?.signalValid===true&&x?.quality?.timeContinuityValid===true&&Number(x?.quality?.timeCoverage)>=.5&&Number(x?.quality?.observedSeconds)>=900&&Number.isFinite(x?.quality?.observedDayFraction));

 // The same dictionary is consumed by both populated and empty navigation.
 const categories={zh:['心肺状态','睡眠状态','精力与恢复状态'],zht:['心肺狀態','睡眠狀態','精力與恢復狀態'],en:['Heart & breathing','Sleep status','Energy & recovery status'],ja:['心肺状態','睡眠状態','活力と回復状態'],ko:['심폐 상태','수면 상태','활력과 회복 상태']};
 if(typeof LANG==='object'&&LANG){for(const [language,labels] of Object.entries(categories))if(LANG[language]){
  LANG[language].heartCategory=labels[0];LANG[language].sleepCategory=labels[1];LANG[language].activeCategory=labels[2];
 }}

 const noReadingMessage=()=>L('目前尚未收到這隻寵物的有效監測數據。收到有效數據後，這裡會顯示相應的分析。','No valid monitoring data has been received for this pet yet. The corresponding analysis will appear here when data arrives.','このペットの有効な測定データはまだありません。受信後に分析を表示します。','이 반려동물의 유효한 측정 데이터가 아직 없습니다. 데이터가 수신되면 분석 결과가 표시됩니다.');
 const safeDetail=()=>{
  const kind=state.dp90WaveKind==='breath'?'breath':'heart',wave=state.detail==='dp90-waveform';
  const label=wave?(kind==='heart'?L('心跳詳細數據','Heart-rate details','心拍の詳細','심박 상세'):L('呼吸詳細數據','Breathing details','呼吸の詳細','호흡 상세')):Number(state.deepType)===1?L('睡眠詳細數據','Sleep details','睡眠の詳細','수면 상세'):L('精力與恢復詳細數據','Energy & recovery details','活力と回復の詳細','활력·회복 상세');
  const requestedDate=wave?state.dp90WaveDate:state.deepSelectedDate;
  const date=/^\d{4}-\d{2}-\d{2}$/.test(String(requestedDate||''))?requestedDate:iso(localDate());
  const selected=Math.max(0,Math.min(2,Number(state.deepType)||0));
  const icons=['heart','moon','activity'];
  const petName=typeof currentDog==='function'&&!(typeof selectedBlank==='function'&&selectedBlank())?String(currentDog().name||''):L('尚未建立寵物檔案','No pet profile yet','ペット未登録','반려동물 프로필 없음');
  const safeName=typeof esc==='function'?esc(petName):petName.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return `<div class="app-pad dp90-wave-page dp1064-unmeasured-detail dp1073-unmeasured-detail"><header class="dp-independent-head"><button type="button" data-action="dp90-wave-back" aria-label="${L('返回深度分析','Back to Deep','分析に戻る','심층 분석으로')}">←</button><b>${label}</b></header><div class="dp90-wave-pet"><b>${safeName}</b><span>${date}</span></div><section class="card dp1070-empty-summary dp1073-detail-empty" aria-live="polite"><span class="dp1070-empty-icon" aria-hidden="true">${typeof vicon==='function'?vicon(icons[selected],28):''}</span><h2>${label}</h2><p>${noReadingMessage()}</p></section><div class="footer-space"></div></div>`;
 };
 const beforeDeep=deepView,beforeBlank=blankDeepView,beforeFree=freeCareDeepView;
 deepView=function(...args){return unmeasured()&&state.detail?safeDetail():beforeDeep.apply(this,args);};
 blankDeepView=function(...args){return state.detail?safeDetail():beforeBlank.apply(this,args);};
 freeCareDeepView=function(...args){return state.detail?safeDetail():beforeFree.apply(this,args);};
 if(typeof dp58FreshEmptyTab==='function'){
  const freshBefore=dp58FreshEmptyTab;
  dp58FreshEmptyTab=function(...args){return state.tab==='deep'&&state.detail?safeDetail():freshBefore.apply(this,args);};
 }

 // The alternate empty-Health detail was removed. V10.76 delegates every
 // pet state to one canonical Health component and a neutral data branch.
 const beforeAction=onAction;
 onAction=function(target){
  if(typeof selectedBlank==='function'&&selectedBlank()&&target?.dataset?.action==='vet-brief'){
   state.tab='health';state.detail='vet-empty';render(true);return;
  }
  return beforeAction.apply(this,arguments);
 };

 // Today's actionable tasks belong to Home only. Health retains upcoming
 // care plus all management modules and their original interactive routes.
 const beforeHealth=healthView;
 healthView=function(...args){const html=beforeHealth.apply(this,args);
  if(state.tab!=='health'||state.detail||unmeasured())return html;
  const host=document.createElement('div');host.innerHTML=html;
  const parent=host.querySelector('.app-pad');if(!parent)return html;
  for(const heading of [...parent.querySelectorAll(':scope > .section-head')]){
   const text=(heading.querySelector('h2')?.textContent||'').trim();
   if(text.startsWith(t('careToday'))){
    const next=heading.nextElementSibling;
    if(next?.classList?.contains('care-todo')&&!next.classList.contains('dp-upcoming-care'))next.remove();
    heading.remove();
   }
  }
  return host.innerHTML;
 };

 // The standard edit form must not reintroduce BCS after Add Pet removed it.
 // A recorded BCS in an old owner's health model remains intact internally.
 const beforeModal=renderModal;
 renderModal=function(...args){const result=beforeModal.apply(this,args);
  if(state.modal==='edit-pet'){
   const field=document.getElementById('petBcsInput');const cell=field?.closest('.form-grid > div');
   if(cell){const grid=cell.parentElement;cell.remove();grid?.classList.add('dp1064-height-only');}
  }
  return result;
 };

 function compactExplanations(){
  if(state.tab!=='deep'||state.detail)return;
  const app=document.getElementById('app');if(!app)return;
  // Avoid repeating the identical unavailable-data sentence under every N/A.
  if(unmeasured()){
   for(const p of app.querySelectorAll('.dp1063-na-panel .dp-owner-subsummary'))p.remove();
   return;
  }
  // Keep the technical method accessible without repeating it above the
  // actionable daily evidence. Do not conceal critical safety advice.
  for(const paragraph of app.querySelectorAll('.dp903-score-method')){
   if(paragraph.closest('details.dp1064-method'))continue;
   const disclosure=document.createElement('details');disclosure.className='dp1064-method';
   const summary=document.createElement('summary');summary.textContent=L('評分依據','How this score is calculated','スコアの算出根拠','점수 산출 근거');
   paragraph.before(disclosure);disclosure.append(summary,paragraph);
  }
 }
 const beforeRender=render;
 render=function(...args){
  if(typeof selectedBlank==='function'&&selectedBlank()&&state.tab==='health'&&state.detail==='vet-report')state.detail='vet-empty';
  // Historical careReport() injected a second report-entry button inside
  // Health.  The one canonical top-level Exam analysis card supersedes it.
  const result=beforeRender.apply(this,args);compactExplanations();return result;
 };
 root.DeepPetUX1064=Object.freeze({version:'10.64',unmeasured,safeDetail,features:Object.freeze(['no duplicate Today To-do in Health','verified no-data detail routes','unified Deep labels','one-click technical disclosure','BCS-free edit form'])});
})(window);
