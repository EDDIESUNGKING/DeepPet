/* DeepPet V10.76 — one authoritative Health renderer and detail entry.
 * A pet's measurement state changes values and actions, never card geometry.
 */
(function(root){'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const noProfile=()=>state.emptyPreview===true||typeof selectedBlank==='function'&&selectedBlank();
 const noMeasurements=()=>noProfile()||typeof dp58FreshPet==='function'&&dp58FreshPet()||typeof isFreePet==='function'&&isFreePet()||root.DeepPetUX1068?.isEmpty?.()===true;
 const title=()=>L('健康管理','Health management','健康管理','건강 관리');
 const reportTitle=()=>L('體檢分析','Exam analysis','検診分析','검진 분석');
 const noData=()=>L('暫無數據','No data yet','データなし','아직 데이터 없음');
 const escText=s=>typeof esc==='function'?esc(String(s)):String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function reportCard(){
  let report=null;
  if(!noProfile())try{report=root.DeepPetHealthInsights?.report?.()||null;}catch{}
  const valid=Number.isFinite(report?.score)&&report.score>=0&&report.score<=100;
  const score=valid?Math.round(report.score):null;
  const grade=score===null?'none':score>=90?'healthy':score>=80?'mild':score>=60?'moderate':'risk';
  const status=score===null?noData():score>=90?L('健康','Healthy','健康','건강'):score>=80?L('低風險','Mild risk','低リスク','낮은 위험'):score>=60?L('中風險','Moderate risk','中リスク','중간 위험'):L('高風險','High risk','高リスク','높은 위험');
  const description=score!==null?L('已依有效檢驗數據建立體檢分析。','Analysis from saved examination results.','登録済みの結果を分析しました。','저장된 검사 결과를 분석했습니다.'):
   noProfile()?L('建立寵物檔案後，可加入體檢報告。','Add a pet to start examination records.','ペット登録後に検診記録を追加できます。','반려동물 등록 후 검사 기록을 추가하세요.'):
   L('尚未建立體檢記錄；新增報告後將顯示分析結果。','Add a report to see examination insights.','結果を追加すると分析を表示します。','검진 기록을 추가하면 분석이 표시됩니다.');
  const label=noProfile()?L('新增寵物','Add pet','ペットを追加','반려동물 추가'):L('上傳／建立體檢報告','Upload / create examination report','検診結果を登録・作成','검진 보고서 업로드·작성');
  const action=noProfile()?'data-action="pet-add"':'data-dp916="wizard"';
  // V10.96: an isolated 70px exam component. Do not use dp916-large-score:
  // older global score decorators could turn its SVG into an oversized ring
  // or move it out of the Exam card during subsequent DOM passes.
  const dots=score===null?'':`<svg class="dp1096-exam-dots" width="70" height="70" viewBox="0 0 70 70" aria-hidden="true">${Array.from({length:54},(_,i)=>{
   const angle=i*2*Math.PI/54-Math.PI/2,cx=(35+29*Math.cos(angle)).toFixed(2),cy=(35+29*Math.sin(angle)).toFixed(2);
   return `<circle cx="${cx}" cy="${cy}" r="1.9" fill="currentColor" opacity="${i<Math.round(score/100*54)?'1':'.18'}"/>`;
  }).join('')}</svg>`;
  const value=`<div class="dp1096-exam-score ${grade}" data-score-state="${score===null?'missing':'scored'}"><span class="dp1096-exam-score-value"><strong>${score??'—'}</strong>${score===null?'':'<small>/100</small>'}</span>${dots}</div>`;
  return `<section class="dp916-health-card dp1070-exam dp1071-exam dp1075-exam" aria-label="${reportTitle()}"><div class="dp916-between"><div class="dp1071-exam-copy"><div class="dp1071-exam-heading"><span class="dp914-report-illustration" aria-hidden="true">${vicon('report',27)}</span><div><h3>${reportTitle()}</h3><p>${description}</p></div></div></div><div class="dp1071-exam-score-col">${value}<span class="dp1071-exam-status ${grade}">${status}</span></div></div><div class="dp916-actions"><button type="button" class="dp916-primary" ${action}>${vicon('plus',16)} ${label}</button><button type="button" class="dp916-secondary" ${noProfile()?'data-action="health-detail" data-page="reports"':'data-dp916="open"'}>${L('查看體檢紀錄','View exam records','検診記録を見る','검진 기록 보기')}</button></div></section>`;
 }
 function foodCard(){
  let kcal=NaN;
  // Food energy depends on an existing profile, not on live collar readings.
  // Lucky's complete Shiba profile can show an estimate while all sensor
  // scores remain N/A; only a truly blank profile has no energy estimate.
  if(!noProfile())try{kcal=Number(targetFood());}catch{}
  const amount=Number.isFinite(kcal)&&kcal>0?`${Math.round(kcal)} kcal`:noData();
  return `<button type="button" class="card food-feature dp1070-food dp1071-food dp1072-food" data-action="health-detail" data-page="food"><span class="dp1072-food-icon" aria-hidden="true">${vicon('food',26)}</span><span class="dp1072-food-copy"><strong class="dp1072-food-title">${L('飲食目標','Food target','食事目標','식사 목표')}</strong><small class="dp1072-food-subtitle">${L('每日飲食目標','Daily food target','毎日の食事目標','일일 식사 목표')}</small></span><span class="dp1072-food-calories">${amount}</span></button>`;
 }
 const careSpecs=()=>[
  {page:'med',icon:'med',bg:'#f3efff',title:t('med'),sub:t('medHint')},
  {page:'vaccines',icon:'vaccine',bg:'#fff2e6',title:t('vaccines'),sub:t('vaccineHint')},
  {page:'deworming',icon:'shield',bg:'#eaf7ee',title:L('驅蟲紀錄','Deworming records','駆虫記録','구충 기록'),sub:L('管理驅蟲日期與紀錄','Manage dates and records','記録と予定','일정 및 기록')},
  {page:'recovery-care',icon:'activity',bg:'#edf6ff',title:L('恢復情況','Recovery status','回復状況','회복 상황'),sub:L('生病、術後以及日常恢復追蹤','Track illness, post-surgery and daily recovery','病気・術後・日常の回復を記録','질병·수술 후·일상 회복 추적')},
  {page:'notes',icon:'notes',bg:'#edf2ff',title:L('額外記錄','Additional records','追加記録','추가 기록'),sub:L('補充健康與照護相關資訊','Additional health and care information','健康とケアの補足情報','건강과 돌봄 관련 추가 정보')}
 ];
 const careRow=r=>`<button type="button" class="health-item dp1071-shared-row ${['recovery-care','notes'].includes(r.page)?'dp1072-uniform-care':''}" data-action="health-detail" data-page="${r.page}"><span class="thumb" style="background:${r.bg}">${vicon(r.icon,23)}</span><span class="grow"><div class="lbl">${r.title}</div><div class="hint">${r.sub}</div></span>${vicon('chev',19)}</button>`;
 function preventionCard(){
  // DeepPetUX941 installs the pet-specific prevention data adapter before
  // this renderer loads.  Its SAME card supports gallery pets, Lucky, new
  // registered pets and the fully blank profile.  Never branch on signals
  // into the obsolete "vitals + trend buttons" design.
  return dp67WatchMain();
 }
 function engagement(kind){
  const summary=kind==='summary',name=summary?L('健康總結','Health review','健康まとめ','건강 요약'):L('一鍵生成就醫就診資料','Prepare veterinary visit materials','獣医受診資料を作成','수의사 진료 자료 생성');
  const info=summary?L('心肺、睡眠、精力與日常健康紀錄的本週／本月回顧','Weekly and monthly review of heart, sleep, energy and care records','心肺・睡眠・活力と健康記録の週／月まとめ','심폐·수면·활력 및 건강 기록 주간·월간 리뷰'):
   L('整理單日、7天、30天有效趨勢與健康紀錄','Compiles valid Day / 7 / 30-day trends and care records','1日・7日・30日の有効な傾向と健康記録','하루·7일·30일 추세와 건강 기록을 정리');
  const icon=summary?'activity':'report';
  return `<button type="button" class="health-engagement-card ${summary?'dp-health-summary-link':'vet'} health-watermark-card" data-action="${summary?'health-detail':'vet-brief'}" ${summary?'data-page="summary"':''}><div class="health-engagement-watermark" aria-hidden="true">${vicon(icon,74)}</div><div class="health-engagement-icon">${vicon(icon,22)}</div><span class="grow"><b>${name}</b><small>${info}</small></span>${vicon('chev',17)}</button>`;
 }
 function canonicalHealth(){
  // No branch can instantiate an older blank Health template. This is the
  // one markup producer for measured, unmeasured and fully blank identities.
  const rows=careSpecs();
  let upcoming=[];try{upcoming=dpUpcomingCareItems()||[];}catch{}
  const visible=upcoming.slice(0,3),more=upcoming.length>3?`<button class="dp1075-health-more" type="button" data-action="dp909-health-more">${L('查看全部','View all','すべて見る','전체 보기')} ${vicon('chev',15)}</button>`:'';
  const ahead=upcoming.length?dpUpcomingCareMarkup(visible):dpUpcomingCareMarkup([]);
  const prevention=preventionCard();
  return `<div class="app-pad dp1070-health-page dp1073-canonical-health dp1075-health-page" data-layout="canonical" data-pet="${escText(state.dog)}" data-measurement-state="${noMeasurements()?'empty':'measured'}">${bigHeader(t('health'))}${prevention}${reportCard()}<div class="section-head"><h2 class="section-title">${L('近期健康提醒','Upcoming care','近日のケア','다가오는 건강 관리')}</h2></div><section class="card care-todo dp-upcoming-care">${ahead}${more}</section><div class="section-head"><h2 class="section-title">${title()}</h2></div><section class="dp1063-care-list">${foodCard()}<div class="card flat care-menu">${rows.slice(0,3).map(careRow).join('')}</div>${engagement('summary')}${engagement('vet')}<div class="card flat care-menu">${rows.slice(3).map(careRow).join('')}</div></section><div class="footer-space"></div></div>`;
 }
 const specializedHealthDetail=healthView;
 function canonicalDetail(){
  // The complete Upcoming Care list is reached by the canonical More button.
  // It was formerly a healthView wrapper and disappeared when the overview
  // became canonical. Route explicitly to its current live detail page.
  if(['upcoming-all','dp1049-upcoming-all'].includes(state.detail)&&!noProfile())return root.DeepPetUX1073?.upcomingAllPage?.()||healthDetail();
  // Preserve two feature-specific prevention drill-down pages; never invoke
  // their obsolete overview templates for ordinary Health navigation.
  if(!noProfile()&&['dp905-watch-all','dp70-watch'].includes(state.detail))return specializedHealthDetail();
  if(!noProfile())return healthDetail();
  // Render the REAL Health detail factory under an isolated, record-free
  // temporary identity. Its fields, forms, sections and icon layout are the
  // same as Milo/Lucky; no gallery or Lucky data can enter a blank profile.
  const shared=root.DeepPetSharedPage936?.render;
  if(typeof shared==='function'){
   const html=shared('health');
   if(state.detail!=='food'||!root.document?.createElement)return html;
   // The genuine Food page is retained, including its cards, forms, icons,
   // toggles and 7-day history. No profile must NEVER acquire a fictitious
   // 100 kcal goal through arithmetic on null height/weight fields.
   const box=root.document.createElement('div');box.innerHTML=html;
   const page=box.querySelector('.care-record-page');if(!page)return html;
   page.dataset.layout='canonical';page.dataset.measurementState='empty';
   for(const node of page.querySelectorAll('.dp-food-overview .food-hero b,.dp-food-overview .dp-food-guide b,.dp-food-overview .row.spread b'))node.textContent='N/A';
   const explain=page.querySelector('.dp-food-overview .dp-food-explain');
   if(explain)explain.textContent=L('建立寵物檔案後，將依品種、年齡及體重估算飲食目標。','Create a pet profile to calculate its daily food target.','ペットを登録すると食事目標を計算できます。','반려동물을 등록하면 식사 목표를 계산합니다.');
   for(const bar of page.querySelectorAll('.dp-food-overview .food-progress i'))bar.style.width='0%';
   return box.innerHTML;
  }
  // Same Health detail container, back action and typography as every pet.
  // Only the internal data state is different, so no previous dog's records
  // can leak into a profile that has not been created.
  const titles={food:L('飲食目標','Food target','食事目標','식사 목표'),med:t('med'),vaccines:t('vaccines'),
   deworming:L('驅蟲紀錄','Deworming records','駆虫記録','구충 기록'),notes:t('notes'),
   reports:reportTitle(),'report-entry':reportTitle(),'report-trends':reportTitle(),
   'recovery-care':L('恢復情況','Recovery status','回復状態','회복 상태'),
   summary:L('健康總結','Health review','健康まとめ','건강 요약'),
   'upcoming-all':L('近期健康提醒','Upcoming care','近日のケア','다가오는 건강 관리'),
   'vet-empty':L('獸醫就診資料','Veterinary visit materials','獣医受診資料','수의사 진료 자료')};
  const label=titles[state.detail]||title();
  return `<div class="app-pad care-record-page dp1076-shared-health-detail" data-layout="canonical" data-measurement-state="empty"><button type="button" class="back-btn" data-action="health-back">‹ ${t('health')}</button><div class="row spread mb12"><h1 class="app-title">${label}</h1></div><section class="card dp1070-empty-summary dp1073-detail-empty" aria-live="polite"><h2>${label}</h2><p>${L('建立寵物檔案後，即可在此保存與查看健康紀錄。','Create a pet profile to save and view health records here.','ペット登録後に健康記録を保存・確認できます。','반려동물을 등록하면 건강 기록을 저장하고 확인할 수 있습니다.')}</p><button type="button" class="cta full" data-action="pet-add">${L('新增寵物','Add pet','ペットを追加','반려동물 추가')}</button></section><div class="footer-space"></div></div>`;
 }
 // All callers — including old routing names — are a single data-driven
 // component. Historical Health templates no longer participate in dispatch.
 const canonical=()=>state.detail?canonicalDetail():canonicalHealth();
 healthView=canonical;
 blankHealthView=canonical;
 freeCareHealthView=canonical;
 if(typeof dp924FreshHealthView==='function')dp924FreshHealthView=canonical;
 if(typeof dp58FreshEmptyTab==='function'){
  const previousEmptyEntry=dp58FreshEmptyTab;
  dp58FreshEmptyTab=function(...args){return state.tab==='health'?canonical():previousEmptyEntry.apply(this,args);};
 }
 root.DeepPetCanonicalUI1075=Object.freeze({version:'10.76',canonicalHealth,canonicalDetail,reportCard,foodCard,careSpecs,preventionCard,noMeasurements});
})(window);
