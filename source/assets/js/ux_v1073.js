/* DeepPet V10.73 — final cross-route structural guard.
 * An empty state is a value state, not a second page design.  These checks
 * only remove obsolete duplicate containers; no measurements are generated.
 */
(function(root){'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const healthName=()=>L('健康管理','Health management','健康管理','건강 관리');
 const forthcoming=()=>L('近期健康提醒','Upcoming care','近日のケア','다가오는 건강 관리');
 function upcomingAllPage(){
  const rows=typeof dpUpcomingCareItems==='function'?dpUpcomingCareItems():[];
  const contents=typeof dpUpcomingCareMarkup==='function'?dpUpcomingCareMarkup(rows):'';
  return `<div class="app-pad care-record-page dp1073-upcoming-page"><button type="button" class="back-btn" data-action="health-back">‹ ${healthName()}</button><h1 class="app-title">${forthcoming()}</h1><section class="card care-todo dp1073-upcoming-list">${contents}</section><div class="footer-space"></div></div>`;
 }
 const originalHealth=healthView;
 healthView=function(...args){
  if(state.tab==='health'&&state.detail==='upcoming-all')return upcomingAllPage();
  return originalHealth.apply(this,args);
 };
 // A registered but unmeasured pet has the same Me profile/device/store/
 // nearby/family/settings navigation as a measured pet.  Only an entirely
 // blank profile needs the restricted Add Pet page.
 const priorFreeMe=freeCareMeView,priorFreshTab=typeof dp58FreshEmptyTab==='function'?dp58FreshEmptyTab:null;
 freeCareMeView=function(...args){return state.tab==='me'&&!state.detail?meView.apply(this,args):priorFreeMe.apply(this,args);};
 if(priorFreshTab)dp58FreshEmptyTab=function(...args){
  return state.tab==='me'&&!state.detail&&!(typeof selectedBlank==='function'&&selectedBlank())?meView.apply(this,args):priorFreshTab.apply(this,args);
 };
 const originalAction=onAction;
 onAction=function(target){
  if(target?.dataset?.action==='dp909-health-more'){
   state.tab='health';state.detail='upcoming-all';state.modal='';render(true);return;
  }
  return originalAction.apply(this,arguments);
 };
 const dropAdditional=(nodes,keep)=>{for(const item of nodes)if(item!==keep)item.remove();};
 function normalizeHealth(){
  if(state.tab!=='health'||state.detail)return;
  const page=document.querySelector('#app .dp1070-health-page');if(!page)return;
  if(page.classList.contains('dp1075-health-page'))return;
  // Never allow an old reports button/hero, a duplicate management header,
  // or a second recovery / extra-record row to survive the final render.
  page.querySelectorAll('.dp1064-report-entry,.health-item[data-page="reports"],.dp916-care-card').forEach(x=>x.remove());
  const exams=[...page.querySelectorAll(':scope > .dp1070-exam')];
  dropAdditional(exams,exams.find(x=>x.classList.contains('dp1071-exam'))||exams[0]);
  const lists=[...page.querySelectorAll(':scope > .dp1063-care-list')];dropAdditional(lists,lists[0]);
  const list=lists[0];if(!list)return;
  for(const key of ['food','med','vaccines','deworming','recovery-care','notes']){
   const nodes=key==='food'?[...list.querySelectorAll(':scope > .food-feature')]:[...list.querySelectorAll(`.health-item[data-page="${key}"]`)];
   dropAdditional(nodes,nodes[0]);
  }
  // A single main section title is placed before the one management list.
  const sectionHeads=[...page.querySelectorAll(':scope > .section-head')];
  const management=sectionHeads.filter(x=>/^(健康管理|Health management|Health care|健康ケア|건강 관리)$/.test(x.textContent.trim()));
  dropAdditional(management,management.at(-1));
  page.classList.add('dp1073-canonical-health');
 }
 function normalizeDeep(){
  if(state.tab!=='deep')return;
  const page=document.querySelector('#app .app-pad');if(!page)return;
  if(page.classList.contains('dp1073-empty-compact')){
   // No generated N/A circles, calendar blocks or per-metric placeholders.
   page.querySelectorAll('.dp1068-na-metric,.dp1068-na-energy-metric,.dp1063-na-meter,.dp1063-no-data-chart,.dp1063-calendar').forEach(x=>x.remove());
  }
  // Each deep-detail score and explanatory card is unique to its route.
  if(state.detail){
   const scores=[...page.querySelectorAll(':scope > .dp1068-detail-score')];dropAdditional(scores,scores[0]);
  }
  const candidates=page.querySelectorAll('.dp903-open-wave,.dp905-day-detail-link,.dp1063-details-btn,.dp908-energy-period-open,.dp901-metric-card [data-action*="detail"],.dp901-expand>summary,.dp903-expand>summary');
  for(const item of candidates){
   const plain=(item.textContent||'').replace(/[›»→➜➔❯⟩]/g,'').trim();
   if(!/^(查看詳細數據|查看详细数据|View detailed data|詳細データを見る|상세 데이터 보기)$/i.test(plain))continue;
   item.classList.add('dp1073-single-chevron');
   item.replaceChildren(document.createTextNode(L('查看詳細數據','View detailed data','詳細データを見る','상세 데이터 보기')));
   const chevron=document.createElement('span');chevron.className='dp1073-detail-chevron';chevron.setAttribute('aria-hidden','true');chevron.textContent='›';item.append(chevron);
  }
 }
 function normalizeHome(){
  if(state.tab!=='home'||state.detail)return;
  const page=document.querySelector('#app .app-pad');if(!page)return;
  // A single urgent card is the sole destination for timed heart/breathing
  // changes.  Legacy summary notices must not duplicate that event list.
  const urgent=[...page.querySelectorAll('.dp936-urgent')];dropAdditional(urgent,urgent[0]);
  page.querySelectorAll('.dp1073-obsolete-alert-copy').forEach(el=>el.remove());
 }
 function normalizeMe(){
  if(state.tab!=='me'||state.detail)return;
  const page=document.querySelector('#app .app-pad');if(!page)return;
  const profile=[...page.querySelectorAll(':scope > .profile-hero')];dropAdditional(profile,profile[0]);
  const device=[...page.querySelectorAll(':scope > .device-center')];dropAdditional(device,device[0]);
  const settingHeaders=[...page.querySelectorAll(':scope > .section-head')].filter(x=>/^(應用設定|App settings|Settings|설정|設定)$/.test(x.textContent.trim()));
  dropAdditional(settingHeaders,settingHeaders[0]);
 }
 function validateStructure(){
  normalizeHome();normalizeDeep();normalizeHealth();normalizeMe();
  const app=document.getElementById('app');if(!app)return;
  // Historical patches occasionally left a second back arrow as a pseudo
  // element.  Every detail action has one inline chevron only.
  if(state.tab==='deep')app.classList.add('dp1073-deep-buttons');
 }
 const oldRender=render;
 render=function(...args){const result=oldRender.apply(this,args);validateStructure();return result;};
 root.DeepPetUX1073=Object.freeze({version:'10.73',upcomingAllPage,validateStructure,normalizeHealth,normalizeDeep,normalizeHome,normalizeMe});
})(window);
