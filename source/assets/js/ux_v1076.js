/* DeepPet V10.77: canonical route QA, readable Deep status and deterministic
 * score geometry. Historical patch layers are not allowed to rerender Health.
 * This module never modifies measurements, scores or emergency evidence. */
(function(root){'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:
  state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 // The epoch changes each time the pet switcher activates a profile. A->B->A
 // is a NEW visit; a stale route from the first A visit must not reopen.
 const ownIdentity=()=>String(state.dog)+'|'+(state.emptyPreview===true?'blank':'profile')+'|'+(Number(state.dpPetEpoch)||0);
 const snapshot=()=>({owner:ownIdentity(),tab:state.tab,detail:state.detail||null,modal:state.modal||'',
  deepType:Number(state.deepType)||0,range:Number(state.range)||1,
  deepSelectedDate:state.deepSelectedDate||null,dp90WaveKind:state.dp90WaveKind||null,
  dp90WaveDate:state.dp90WaveDate||null,dp932WaveMinute:state.dp932WaveMinute??null});
 const routeKey=r=>[r.owner,r.tab,r.detail,r.modal,r.deepType,r.range,r.deepSelectedDate,
  r.dp90WaveKind,r.dp90WaveDate,r.dp932WaveMinute].join('|');
 let last=snapshot(),restoring=false,historyReady=false,backDepth=0;
 function remember(next){
  if(!root.history?.pushState||!root.history?.replaceState)return;
  try{
   if(!historyReady){root.history.replaceState({...(root.history.state||{}),deepPetRoute:last},'');historyReady=true;}
   if(next.owner!==last.owner){
    // Changing pets creates a new source-of-truth context; a browser Back
    // must not resurrect a previous pet's cached scores or detail state.
    root.history.replaceState({...(root.history.state||{}),deepPetRoute:next},'');
   }else if(routeKey(next)!==routeKey(last)){
    // UI back and successful editor dismissal must replace the route. The
    // former unconditional push reopened the old detail/editor on Back.
    const goingBack=backDepth>0||(last.modal&&!next.modal);
    if(goingBack)root.history.replaceState({...(root.history.state||{}),deepPetRoute:next},'');
    else root.history.pushState({deepPetRoute:next},'');
   }
   last=next;
  }catch{}
 }
 root.addEventListener?.('popstate',event=>{
  const old=event.state?.deepPetRoute;
  if(!old||restoring)return;
  // Unsaved draft edits deserve the same confirmation as the visible Close.
  const editing=['pet-add','edit-pet','avatar-choice','record-editor','med-edit','vax-edit','report-edit','meal-edit','report-import'];
  if(state.modal&&editing.includes(state.modal)&&old.modal!==state.modal&&
    typeof root.confirm==='function'&&!root.confirm(L('離開後未保存的修改將被捨棄，確定返回嗎？','Discard unsaved changes and go back?','保存していない変更を破棄して戻りますか？','저장하지 않은 변경 내용을 버리고 돌아갈까요?'))){
   root.history?.forward?.();return;
  }
  restoring=true;
  try{
   if(state.modal&&typeof closeModal==='function')closeModal();
   if(old.owner!==ownIdentity()){
    // Do not switch identity as a side effect of a Back gesture.
    state.tab='home';state.detail=null;state.modal='';
   }else{
    state.tab=['home','deep','health','me'].includes(old.tab)?old.tab:'home';
    state.detail=old.detail;state.modal='';state.deepType=old.deepType;
    state.range=old.range;state.deepSelectedDate=old.deepSelectedDate;
    state.dp90WaveKind=old.dp90WaveKind;state.dp90WaveDate=old.dp90WaveDate;
    state.dp932WaveMinute=old.dp932WaveMinute;
   }
   state.dp1059AlertFocus=null;state.dp919AlertReturnTab=null;
   render(true);last=snapshot();
   // Back/Forward never resurrects an old editor with stale, cross-pet data.
   if(old.modal&&root.history?.replaceState)root.history.replaceState({...(root.history.state||{}),deepPetRoute:last},'');
  }finally{restoring=false;}
 });
 function simpleFinding(score){
  if(!Number.isFinite(score))return L('目前沒有足夠資料，暫時無法判斷。','Not enough data to assess this period.','データ不足のため判断できません。','데이터 부족으로 아직 판단할 수 없습니다.');
  if(score>=90)return L('這段時間狀態良好，繼續保持目前的照顧方式。','Looking good in this period. Keep up the usual care.','この期間は良好です。いつものケアを続けましょう。','이 기간은 양호합니다. 평소 관리를 유지하세요.');
  if(score>=80)return L('有一點變化，先觀察接下來幾天是否恢復。','A small change. Watch whether it settles over the next few days.','少し変化があります。数日間の様子を見ましょう。','약간의 변화가 있습니다. 며칠 더 지켜보세요.');
  if(score>=60)return L('變化比較明顯，點開曲線看看從何時開始。','A noticeable change. Check the chart to see when it began.','変化が目立ちます。グラフで始まった時間を確認しましょう。','변화가 뚜렷합니다. 그래프에서 시작 시점을 확인하세요.');
  return L('這段時間狀態偏差，請查看異常時段；若牠也不舒服，盡快聯絡獸醫。','This period looks concerning. Check the abnormal times; contact a vet promptly if your pet seems unwell.','この期間は注意が必要です。異常な時間を確認し、具合が悪ければ獣医師へ。','이 기간은 주의가 필요합니다. 이상 시간대를 확인하고 상태가 나쁘면 수의사에게 연락하세요.');
 }
 function briefDeepDetail(){
  if(state.tab!=='deep'||!state.detail)return;
  for(const card of document.querySelectorAll('#app .dp1068-detail-score')){
   const circle=card.querySelector('.dp1068-detail-ring');
   if(!circle)continue;
   const raw=circle.dataset.score||circle.querySelector('.stat-inner b')?.textContent||circle.textContent;
   const parsed=Number(String(raw).trim()),score=Number.isFinite(parsed)&&parsed>=0&&parsed<=100?parsed:NaN;
   const p=card.querySelector('.dp1068-detail-why p');if(p)p.textContent=simpleFinding(score);
  }
 }
 function equalizeScoreAccessibility(){
  // Existing score/date points and thresholds are untouched. Missing values
  // remain neutral; no post-render template is inserted.
  document.querySelectorAll('#app .dp1075-exam .dp1071-exam-score-col').forEach(col=>{
   col.setAttribute('data-score-layout','unified');
   const ring=col.querySelector(':scope > .dp1096-exam-score,:scope > .dp916-large-score');
   const status=col.querySelector(':scope > .dp1071-exam-status');
   if(ring&&status)status.setAttribute('aria-label',status.textContent.trim());
  });
 }
 function canonicalVersion(){
  // Earlier functional components must remain in the bundle, but several
  // still write their historical version badge during nested render calls.
  // Commit the one release identity AFTER every view has finished rendering.
  const version=String(root.DeepPetBuildVersion||'').trim();
  if(!/^\d+\.\d+$/.test(version))return;
  document.querySelectorAll('#app .app-build-version').forEach(el=>{
   const label=`DeepPet Version ${version}`;
   if(el.textContent!==label)el.textContent=label;
  });
  root.DeepPetRelease={...root.DeepPetRelease,version};
 }
 const previous=render;
 render=function(...args){
  const next=snapshot();if(!restoring)remember(next);
  const value=previous.apply(this,args);
  briefDeepDetail();equalizeScoreAccessibility();canonicalVersion();
  last=snapshot();return value;
 };
 // Most dialogs only call renderModal(), not render(). They must participate
 // in Back history too, otherwise the browser leaves an editor on screen
 // while restoring its underlying page to an unrelated historical route.
 if(typeof renderModal==='function'){
  const oldModalRender=renderModal;
  renderModal=function(...args){
   const next=snapshot();if(!restoring)remember(next);
   const value=oldModalRender.apply(this,args);last=snapshot();return value;
  };
 }
 if(typeof onAction==='function'){
  const oldAction=onAction;
  onAction=function(target){
   const key=String(target?.dataset?.action||'');
   const backwards=/(?:^|-)back(?:-|$)/.test(key)||['modal-close','modal-outside','shop-close'].includes(key);
   if(backwards)backDepth++;
   try{return oldAction.apply(this,arguments);}finally{if(backwards)backDepth--;}
  };
 }
 root.DeepPetUX1076=Object.freeze({version:'10.76',snapshot,routeKey,simpleFinding,canonicalVersion});
})(window);
