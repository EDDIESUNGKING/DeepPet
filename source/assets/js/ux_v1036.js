/* DeepPet V10.36 — owner-safe copy, exact priority marker and verified battery notice.
   Do not change any sensor values, scores, dates, pairing state or navigation. */
(function(root){
 'use strict';
 const say=(zht,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:
  state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zht):zht;
 const marker=()=>`<span class="dp1035-priority-tag">${say('今日先看','Review first','今日の最優先','오늘 먼저 확인')}</span>`;
 const stripMarker=html=>String(html).replace(/<span class="dp1035-priority-tag">[^<]*<\/span>/g,'');
 function onePriorityInExistingList(html){
  const clean=stripMarker(html),list=clean.indexOf('<div class="dp-today-list">');
  if(list<0)return clean;
  const start=clean.indexOf('<button ',list),end=start<0?-1:clean.indexOf('</button>',start),top=start<0?-1:clean.indexOf('<div class="ai-suggestion-top">',start);
  if(start<0||end<0||top<0||top>end||!clean.slice(start,end).includes('dp-today-action'))return clean;
  const insert=top+'<div class="ai-suggestion-top">'.length;
  return clean.slice(0,insert)+marker()+clean.slice(insert);
 }
 // Source identity and rank are computed once in the original focus/list
 // builders. This local presentation step labels the *rendered first item*,
 // even when several records happen to have identical titles.
 const oldTodayCard=dpTodayActionCard;
 dpTodayActionCard=function(item){return stripMarker(oldTodayCard(item));};
 const oldFocus=focusCard;
 focusCard=function(){return onePriorityInExistingList(oldFocus());};
 const oldMore=dpTodayMorePage;
 dpTodayMorePage=function(){return onePriorityInExistingList(oldMore());};

 const oldDeviceCenter=deviceCenter;
 deviceCenter=function(){
  const html=oldDeviceCenter(),verified=root.DeepPetBatterySDK?.current?.();
  if(state.emptyPreview||state.connected!==true||!state.connectedId||
    !verified||!Number.isInteger(verified.percent)||verified.percent<0||verified.percent>20||
    !html.includes('dp1033-battery-meta'))return html;
  const title=say('電量偏低，建議充電','Battery low · charge soon','電池残量が少なくなっています','배터리 부족 · 충전해 주세요');
  const note=`<p class="dp1036-battery-attention" role="status"><span aria-hidden="true">▱</span>${title}</p>`;
  return html.replace('<div class="device-center-actions">',note+'<div class="device-center-actions">');
 };
 root.DeepPetQuality1036=Object.freeze({onePriorityInExistingList,stripMarker});
 root.DeepPetRelease={...root.DeepPetRelease,version:root.DeepPetBuildVersion||'10.36',integrity:[
  ...(root.DeepPetRelease?.integrity||[]),
  'exactly-one-first-today-priority-marker',
  'protect-owner-authored-pet-names-and-health-notes',
  'incremental-ui-copy-cleanup',
  'real-sdk-only-low-battery-warning-at-20-percent',
  'home-deep-health-me-and-original-waveforms-unchanged'
 ]};
})(window);
