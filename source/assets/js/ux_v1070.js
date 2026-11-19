/* DeepPet V10.70: a single empty-state contract and canonical health hierarchy.
 * This module changes presentation only. It never invents a sensor reading.
 */
(function(root){'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const noData=()=>root.DeepPetUX1068?.isEmpty?.()===true;
 const text=()=>L('目前尚未收到這隻寵物的有效監測數據。收到有效數據後，這裡會顯示相應的分析。','No valid monitoring data has been received for this pet yet. The corresponding analysis will appear here when data arrives.','このペットの有効な測定データはまだありません。受信後に分析を表示します。','이 반려동물의 유효한 측정 데이터가 아직 없습니다. 데이터가 수신되면 분석 결과가 표시됩니다.');
 function normalizeDeep(){
  if(state.tab!=='deep'||state.detail||!noData())return;
  const page=document.querySelector('#app .dp1063-empty-deep');if(!page)return;
  page.classList.add('dp1070-empty-deep');
  const section=page.querySelector('.dp1063-empty-card');if(section&&!page.classList?.contains?.('dp1073-empty-compact')){
   const labels=[L('心肺狀態','Heart & breathing','心肺状態','심폐 상태'),L('睡眠狀態','Sleep','睡眠','수면'),L('精力與恢復','Energy & recovery','活力と回復','활력과 회복')];
   const label=labels[Math.max(0,Math.min(2,Number(state.deepType)||0))];
   section.className='card dp1063-empty-card dp1070-empty-summary';
   section.innerHTML=`<div class="dp1070-empty-icon" aria-hidden="true">${typeof vicon==='function'?vicon(['heart','moon','activity'][Math.max(0,Math.min(2,Number(state.deepType)||0))],28):'○'}</div><h2>${label}</h2><p>${text()}</p>`;
  }
  // An empty day grid full of N/A placeholders is not evidence and obscures
  // the range selector; day selection remains available above the summary.
  page.querySelectorAll('.dp1063-calendar,.dp1063-no-data-chart,.dp1068-na-metric,.dp1068-na-energy-metric').forEach(x=>x.remove());
  const date=page.querySelector('.deep-date-shortcut[data-days="0"]');
  if(date){const today=typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):'';
   const active=state.deepSelectedDate===today;date.classList.toggle('dp1070-today',active);date.setAttribute('aria-pressed',String(active));}
 }
 const topHeading=el=>el?.querySelector('.section-title,h2')?.textContent?.trim()||'';
 function normalizeHealth(){
  if(state.tab!=='health'||state.detail)return;
  const page=document.querySelector('#app .app-pad');if(!page)return;
  // V10.75 owns this page as a single template: never rebuild its contents.
  if(page.classList.contains('dp1075-health-page'))return;
  page.classList.add('dp1070-health-page');
  const blank=noData();
  const title=page.querySelector(':scope > .view-header .app-title');if(title)title.textContent=L('健康管理','Health management','健康管理','건강 관리');
  // The existing measured-pet component is the design source for the empty
  // profile too. Do not reconstruct a second visual version.
  let prevention=page.querySelector(':scope > .dp941-prevention');
  if(blank){
   const old=page.querySelector(':scope > .dp67-prevention');
   const template=document.createElement('div');
   if(typeof dp67WatchMain==='function')template.innerHTML=dp67WatchMain();
   prevention=template.querySelector('.dp941-prevention');
   if(prevention){if(old)old.replaceWith(prevention);else page.append(prevention);}
   else if(old){prevention=old;}
  }
  if(!prevention)prevention=page.querySelector(':scope > .dp941-prevention,:scope > .dp67-prevention');
  const preventName=prevention?.querySelector('.dp941-prevention-heading h2');
  if(preventName)preventName.textContent=L('預防性健康管理','Preventive Health Management','予防健康管理','예방 건강 관리');
  // Empty profiles may have inherited an older score-based report card.
  // Prefer the explicitly blank, identity-isolated card in that case.
  let exam=blank?page.querySelector(':scope > .dp914-report-hero'):page.querySelector(':scope > .dp916-health-card,:scope > .dp914-report-hero');
  if(!exam)exam=page.querySelector('.dp914-report-hero,.dp916-health-card');
  for(const redundant of page.querySelectorAll(':scope > .dp916-health-card,:scope > .dp914-report-hero'))if(redundant!==exam)redundant.remove();
  // The legacy completion card describes the same health-management rows
  // already present below and breaks the requested four-section hierarchy.
  page.querySelectorAll(':scope > .dp916-care-card').forEach(el=>el.remove());
  if(exam){
   exam.classList.add('dp1070-exam');
   const examTitle=exam.querySelector('.dp914-report-headcopy h2,.dp916-between h3');if(examTitle)examTitle.textContent=L('體檢分析','Exam analysis','検診分析','검진 분석');
   if(blank){
    // Don't show the old empty "N/A" as though it were an exam result.
    exam.querySelectorAll('.dp914-report-sub').forEach(el=>el.textContent=L('尚無體檢紀錄','No examination records yet','検診記録なし','검진 기록 없음'));
   }
  }
  // Keep only the proper top exam card, never a separate reports button.
  page.querySelectorAll('.dp1064-report-entry,.health-item[data-page="reports"]').forEach(el=>{
   if(el.classList.contains('health-item')&&el.closest('.dp1064-report-entry'))el.closest('.dp1064-report-entry').remove();else el.remove();
  });
  const heads=[...page.querySelectorAll(':scope > .section-head')];
  let remindersHead=heads.find(el=>/近期健康提醒|Upcoming care|近日のケア|다가오는 건강/.test(topHeading(el)));
  let careHead=heads.find(el=>/^(健康管理|Health management|Health care|健康ケア|건강 관리)$/.test(topHeading(el)));
  if(!careHead){careHead=document.createElement('div');careHead.className='section-head';careHead.innerHTML=`<h2 class="section-title">${L('健康管理','Health management','健康管理','건강 관리')}</h2>`;page.append(careHead);}
  for(const duplicate of heads)if(duplicate!==careHead&&/^(健康管理|Health management|Health care|健康ケア|건강 관리)$/.test(topHeading(duplicate)))duplicate.remove();
  let reminders=page.querySelector(':scope > .dp-upcoming-care');
  const list=page.querySelector(':scope > .dp1063-care-list');
  const header=page.querySelector(':scope > .view-header');
  // Stable canonical order; moving existing nodes retains original actions,
  // event handlers, identifiers and measured-pet content.
  let anchor=header;
  for(const el of [prevention,exam,remindersHead,reminders,careHead,list]){
   if(!el||!anchor||el===anchor)continue;
   anchor.insertAdjacentElement('afterend',el);anchor=el;
  }
  if(list){
   const food=list.querySelector(':scope > .food-feature');
   if(food){food.classList.add('dp1070-food');
    if(blank){
     const value=food.querySelector('.food-feature-main strong');if(value)value.textContent=L('暫無數據','No data yet','データなし','아직 데이터 없음');
     const denominator=food.querySelector('.food-feature-main span');if(denominator)denominator.textContent='';
     const percent=food.querySelector('.food-pct');if(percent)percent.textContent=L('待建立','Pending','未登録','미등록');
     const track=food.querySelector('.food-progress i');if(track)track.style.width='0%';
    }
   }
   const menus=[...list.querySelectorAll(':scope > .care-menu')];
   // The original blank template used inline spans, whereas populated pets
   // use block-level label/hint. Enforce the same DOM vocabulary on both.
   for(const menu of menus){for(const item of menu.querySelectorAll('.health-item')){
    for(const cls of ['lbl','hint']){const old=item.querySelector('.'+cls);if(old&&old.tagName!=='DIV'){const newer=document.createElement('div');newer.className=old.className;newer.innerHTML=old.innerHTML;old.replaceWith(newer);}}
   }}
   const summary=list.querySelector('.dp-health-summary-link'),vet=list.querySelector('.health-engagement-card.vet');
   if(summary){const label=summary.querySelector('b');if(label)label.textContent=L('健康總結','Health review','健康まとめ','건강 요약');}
   if(vet){const label=vet.querySelector('b');if(label)label.textContent=L('一鍵生成獸醫就診資料','Prepare veterinary visit materials','獣医受診資料を作成','수의사 진료 자료 생성');}
   // Exact order inside the common component, even after prior legacy
   // patches tried to append a second menu or report entry.
   const mainMenu=menus[0],lastMenu=menus.at(-1);
   if(food&&mainMenu)food.after(mainMenu);
   if(mainMenu&&summary)mainMenu.after(summary);
   if(summary&&vet)summary.after(vet);
   if(vet&&lastMenu&&lastMenu!==mainMenu)vet.after(lastMenu);
  }
  if(blank){
   page.querySelectorAll('.dp1068-blank-exam .dp914-report-sub').forEach(el=>el.textContent=L('尚無體檢紀錄','No examination records yet','検診記録なし','검진 기록 없음'));
  }
 }
 const before=render;
 render=function(...args){const result=before.apply(this,args);normalizeDeep();normalizeHealth();return result;};
 root.DeepPetUX1070=Object.freeze({version:'10.70',normalizeDeep,normalizeHealth});
})(window);
