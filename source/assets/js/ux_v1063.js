/* DeepPet V10.63 — one presentation contract for measured and unmeasured pets.
 * A blank measurement changes values, not the navigation, copy, order, icons
 * or component geometry. This layer never manufactures physiological samples.
 */
(function(root){'use strict';
 const loc=(z,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:(state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(z):z);
 const dateNow=()=>iso(localDate());
 const dayAt=n=>iso(dateAdd(localDate(),n));
 const icon=(key,size=19)=>typeof vicon==='function'?vicon(key,size):'';
 const unavailable=()=>state.emptyPreview===true||typeof selectedBlank==='function'&&selectedBlank()||typeof dp58FreshPet==='function'&&dp58FreshPet()||typeof isFreePet==='function'&&isFreePet();
 const noVerifiedSensor=()=>{
  if(typeof dpUsesRealMeasurements!=='function'||!dpUsesRealMeasurements())return false;
  const samples=root.DeepPetSignalScoring?.getDaily?.(state.dog)||[];
  return !samples.some(x=>x?.source==='20hz-waveform'&&x.quality?.heartValid===true&&x.quality?.respValid===true&&x.quality?.wearValid===true&&x.quality?.signalValid===true&&x.quality?.timeContinuityValid===true&&Number(x.quality?.timeCoverage)>=.5&&Number(x.quality?.observedSeconds)>=900&&Number.isFinite(x.quality?.observedDayFraction));
 };
 const hue=[{key:'heart',accent:'#cf6684',soft:'#fff7f9',border:'#f2dce4'},{key:'sleep',accent:'#52a97d',soft:'#f7fdf9',border:'#e6f3ea'},{key:'activity',accent:'#4387dc',soft:'#f2f7ff',border:'#d8e7ff'}];
 const names=()=>[loc('心肺狀態','Heart & breathing','心肺状態','심폐 상태'),loc('睡眠狀態','Sleep status','睡眠状態','수면 상태'),loc('精力與恢復狀態','Energy & recovery','活力と回復','활력과 회복')];
 const title=kind=>[loc('心肺綜合狀態','Overall heart & breathing status','心肺総合状態','심폐 종합 상태'),loc('睡眠情況','Sleep status','睡眠状況','수면 상태'),loc('精力與恢復狀態','Energy & recovery status','活力と回復状態','활력과 회복 상태')][kind];
 const noReadings=()=>loc('目前尚未收到這隻寵物的有效監測數據。收到有效數據後，這裡會顯示相應的分析。','No valid monitoring data has been received for this pet yet. The corresponding analysis will appear here when data arrives.','このペットの有効な測定データはまだありません。受信後に分析を表示します。','이 반려동물의 유효한 측정 데이터가 아직 없습니다. 데이터가 수신되면 분석 결과가 표시됩니다.');
 const dateControls=days=>{
  const selected=/^\d{4}-\d{2}-\d{2}$/.test(String(state.deepSelectedDate||''))?state.deepSelectedDate:dateNow();
  if(days!==1)return `<div class="deep-date-compact"><span>${loc('期間','Period','期間','기간')} · ${dayAt(1-days)} – ${dateNow()}</span><button class="deep-date-link" data-action="deep-select-day">${icon('calendar',14)} ${loc('查看指定日期','Choose a day','日付を選択','날짜 선택')}</button></div>`;
  return `<div class="deep-day-picker" aria-label="${loc('選擇單日日期','Choose a single day','日付選択','날짜 선택')}"><div class="deep-day-picker-top"><b>${loc('選擇單日','Select a day','1日を選択','하루 선택')}</b><span>${selected}</span></div><div class="deep-day-picker-actions"><button class="deep-day-arrow" data-action="deep-day-step" data-delta="-1" aria-label="${loc('前一天','Previous day','前日','이전 날짜')}">‹</button><input type="date" id="deepDayDate" class="deep-date-input" value="${selected}" min="${dayAt(-29)}" max="${dateNow()}"/><button class="deep-day-arrow" data-action="deep-day-step" data-delta="1" aria-label="${loc('後一天','Next day','翌日','다음 날짜')}">${icon('chev',18)}</button><button class="deep-date-shortcut" data-action="deep-day-jump" data-days="-1">${loc('昨天','Yesterday','昨日','어제')}</button><button class="deep-date-shortcut" data-action="deep-day-jump" data-days="0">${loc('今天','Today','今日','오늘')}</button></div></div>`;
 };
 function emptyDeep(){
  const kind=Math.min(2,Math.max(0,Number(state.deepType)||0)),days=[1,7,30].includes(Number(state.range))?Number(state.range):1,cp=hue[kind],n=names(),label=title(kind);
  const menu=`<div class="tabs">${n.map((s,i)=>`<button type="button" class="tab ${kind===i?'active':''}" data-action="deep-category" data-index="${i}" style="${kind===i?`background:${cp.soft};color:${cp.accent};border-color:${cp.border}`:''}"><span class="tab-icon">${icon(['heart','moon','activity'][i],20)}</span>${s}</button>`).join('')}</div>`;
  const segment=`<div class="segment">${[1,7,30].map(k=>`<button type="button" class="seg-btn ${days===k?'active':''}" data-action="range" data-value="${k}">${k===1?loc('單日','Day','1日','하루'):loc(`${k}天`,`${k}D`,`${k}日`,`${k}일`)}</button>`).join('')}</div>`;
  // The formerly separate N/A metrics, dotted circles and empty day calendar
  // were a second, obsolete UI.  An unmeasured pet now uses only the same
  // category/range controls with one accessible, neutral explanation.
  const main=`<section class="card dp-owner-status-card dp-owner-${cp.key} dp1063-empty-card dp1070-empty-summary" aria-live="polite"><span class="dp1070-empty-icon" aria-hidden="true">${icon(['heart','moon','activity'][kind],28)}</span><h2>${label}</h2><p>${noReadings()}</p></section>`;
  return `<div class="app-pad deep-themed deep-theme-${cp.key} dp-owner-deep dp1063-empty-deep dp1073-empty-compact dp1070-empty-deep" style="--deep-accent:${cp.accent};--deep-soft:${cp.soft};--deep-border:${cp.border};--deep-contrast:${cp.accent}">${bigHeader(t('deep'))}${menu}${segment}${dateControls(days)}${main}<div class="footer-space"></div></div>`;
 }
 const careRows=()=>[
  ['med',t('med'),t('medHint'),'med','#f3efff'],
  ['vaccines',t('vaccines'),t('vaccineHint'),'vaccine','#fff2e6'],
  ['deworming',loc('驅蟲紀錄','Deworming records','駆虫記録','구충 기록'),loc('管理驅蟲日期與紀錄','Manage dates and records','記録と予定','일정 및 기록'),'vaccine','#eaf7ee'],
  ['recovery-care',loc('恢復情況','Recovery status','回復状態','회복 상태'),loc('生病、術後以及日常恢復追蹤','Track illness, post-surgery and daily recovery','病気・術後・日常の回復を記録','질병·수술 후·일상 회복 추적'),'activity','#edf6ff'],
  ['notes',loc('額外記錄','Additional records','追加記録','추가 기록'),loc('記錄觀察變化與預防反饋','Record observed changes and preventive feedback','観察の変化と予防ケアの結果を記録','관찰 변화와 예방 관리 결과 기록'),'notes','#edf2ff']
 ];
 const item=([page,name,hint,ic,bg])=>`<button class="health-item" data-action="health-detail" data-page="${page}"><span class="thumb" style="background:${bg}">${icon(ic,23)}</span><span class="grow"><span class="lbl">${name}</span><span class="hint">${hint}</span></span>${icon('chev',19)}</button>`;
 const infoCard=(kind)=>{const summary=kind==='summary',head=summary?loc('健康總結','Health review','健康まとめ','건강 요약'):loc('一鍵生成獸醫就診資料','Prepare veterinary visit materials','獣医受診資料を作成','수의사 진료 자료 생성');return `<button class="health-engagement-card ${summary?'dp-health-summary-link':'vet'} health-watermark-card" data-action="${summary?'health-detail':'vet-brief'}" ${summary?'data-page="summary"':''}><div class="health-engagement-watermark" aria-hidden="true">${icon(summary?'activity':'report',74)}</div><div class="health-engagement-icon">${icon(summary?'activity':'report',22)}</div><span class="grow"><b>${head}</b><small>${summary?loc('心肺、睡眠、精力與日常健康紀錄的本週／本月回顧','Weekly and monthly review of heart, sleep, energy and care records','心肺・睡眠・活力と健康記録の週／月まとめ','심폐·수면·활력 및 건강 기록 주간·월간 리뷰'):loc('整理單日、7天、30天有效趨勢與健康紀錄','Compiles valid Day / 7 / 30-day trends and care records','1日・7日・30日の有効な傾向と健康記録','하루·7일·30일 추세와 건강 기록을 정리')}</small></span>${icon('chev',17)}</button>`;};
 function emptyHealth(){
  const heading=`<div class="section-head dp1063-only-heading"><h2 class="section-title">${t('healthCare')}</h2></div>`;
  const food=`<button class="card food-feature dp1072-food" data-action="health-detail" data-page="food"><span class="dp1072-food-icon" aria-hidden="true">${icon('food',26)}</span><span class="dp1072-food-copy"><strong class="dp1072-food-title">${loc('飲食目標','Food target','食事目標','식사 목표')}</strong><small class="dp1072-food-subtitle">${loc('每日飲食目標','Daily food target','毎日の食事目標','일일 식사 목표')}</small></span><span class="dp1072-food-calories">${loc('暫無數據','No data yet','データなし','아직 데이터 없음')}</span></button>`;
  const rows=careRows();
  return `<div class="app-pad dp1063-empty-health">${bigHeader(t('health'))}<div class="section-head"><h2 class="section-title">${loc('近期健康提醒','Upcoming care','近日のケア','다가오는 건강 관리')}</h2></div><section class="card care-todo dp-upcoming-care"><div class="empty-inline">${loc('目前沒有已安排的提醒','No care reminders scheduled','予定されたケアのお知らせはありません','예정된 관리 알림 없음')}</div></section>${heading}<section class="dp1063-care-list">${food}<div class="card flat care-menu">${rows.slice(0,3).map(item).join('')}</div>${infoCard('summary')}${infoCard('vet')}<div class="card flat care-menu">${rows.slice(3).map(item).join('')}</div></section><div class="footer-space"></div></div>`;
 }
 // The same no-data layout is used for a blank profile and for a named pet
 // whose collar has not produced verified samples, without a second UX branch.
 const priorBlankDeep=blankDeepView,priorFreeDeep=freeCareDeepView,priorBlankHealth=blankHealthView,priorFreeHealth=freeCareHealthView,priorFreshHealth=typeof dp924FreshHealthView==='function'?dp924FreshHealthView:null;
 blankDeepView=()=>state.detail?priorBlankDeep():emptyDeep();
 freeCareDeepView=()=>state.detail?priorFreeDeep():emptyDeep();
 if(typeof dp58FreshEmptyTab==='function')dp58FreshEmptyTab=()=>state.tab==='deep'?(state.detail?deepView():emptyDeep()):state.tab==='health'?(state.detail?healthView():emptyHealth()):state.tab==='me'?blankMeView():emptyHealth();
 blankHealthView=()=>state.detail?priorBlankHealth():emptyHealth();
 freeCareHealthView=()=>state.detail?priorFreeHealth():emptyHealth();
 if(priorFreshHealth)dp924FreshHealthView=()=>state.detail?priorFreshHealth():emptyHealth();
 const deepBefore=deepView,healthBefore=healthView;
 deepView=function(){if((unavailable()||noVerifiedSensor())&&!state.detail)return emptyDeep();return deepBefore();};
 healthView=function(){if((unavailable()||noVerifiedSensor())&&!state.detail)return emptyHealth();return healthBefore();};
 function markNoScore(holder){
  const walker=document.createTreeWalker(holder,NodeFilter.SHOW_TEXT);let n;
  while(n=walker.nextNode()){
   let v=n.nodeValue;
   if(v.includes('牠'))v=v.replace(/牠/g,state.lang==='zh'?'宠物':'寵物');
   v=v.replace(/(?:僅|仅)\s*EAF711/gi,'').replace(/(?:僅|仅)\s*EDF6FF/gi,'').replace(/\b(?:EAF711|EDF6FF)\b/gi,'');
   if(v.includes('N/A'))v=v.replace(/N\s*\/\s*A\s*(?:\/|／)\s*100/gi,'N/A');
   n.nodeValue=v;
  }
  for(const e of holder.querySelectorAll('[aria-label],[title],[placeholder]'))for(const a of ['aria-label','title','placeholder'])if(e.hasAttribute(a))e.setAttribute(a,e.getAttribute(a).replace(/牠/g,state.lang==='zh'?'宠物':'寵物').replace(/N\s*\/\s*A\s*\/\s*100/gi,'N/A'));
  for(const e of holder.querySelectorAll('small,span'))if(/^\s*[／/]\s*100\s*$/.test(e.textContent||'')){
    const parent=e.parentElement;const text=(parent?.textContent||'').replace(e.textContent||'','').trim();
    if(/N\s*\/\s*A|^—$|^–$/.test(text)||unavailable()&&(/score|meter|ring|stat|value|dp943/i.test(String(parent?.className||''))))e.remove();
  }
  if(unavailable()){
   for(const e of holder.querySelectorAll('.dp-dot-meter-center,.dp-status-score,.score-core,.dp943-empty-main-score,.dp931-score-circle,.stat-inner,.dp1063-na-meter')){
    if(/N\s*\/\s*A|—/.test(e.textContent||'')){
      e.querySelectorAll('small').forEach(s=>/^\s*[／/]\s*100\s*$/.test(s.textContent||'')&&s.remove());
      e.setAttribute('aria-label','N/A');
    }
   }
  }
 }
 function arrangeCare(rootApp){
  if(state.tab!=='health'||state.detail||unavailable())return;
  // The V10.75 renderer already owns the entire care layout. Older DOM
  // relocation must never create a second card group inside that layout.
  if(rootApp.querySelector('.dp1075-health-page'))return;
  const pad=rootApp.querySelector('.app-pad'),food=pad?.querySelector('.food-feature'),menu=pad?.querySelector('.care-menu');if(!pad||!food||!menu)return;
  const headings=[...pad.querySelectorAll(':scope > .section-head')];const h=headings.find(e=>/健康管理|Health management|Health care|健康管理|건강 관리|健康ケア/i.test(e.textContent||''));
  if(!h)return;
  const list=document.createElement('section');list.className='dp1063-care-list';h.insertAdjacentElement('afterend',list);
  list.appendChild(food);
  const entries=[...menu.querySelectorAll('.health-item')],byPage=p=>entries.find(e=>e.dataset.page===p);
  const makeMenu=els=>{if(!els.length)return;const section=document.createElement('div');section.className='card flat care-menu';els.forEach(e=>section.append(e));list.append(section);};
  makeMenu(['med','vaccines','deworming'].map(byPage).filter(Boolean));
  const summary=pad.querySelector('.health-engagement-card.dp-health-summary-link'),vet=pad.querySelector('.health-engagement-card.vet');
  if(summary)list.append(summary);if(vet)list.append(vet);
  makeMenu(['recovery-care','notes','reports'].map(byPage).filter(Boolean));
  for(const e of entries)if(e.parentElement===menu)list.append(e);
  if(!menu.children.length)menu.remove();
  for(const el of headings)if(el!==h&&/^(?:健康管理|Health management|Health care|건강 관리|健康ケア)$/i.test((el.textContent||'').trim()))el.remove();
 }
 // Keep the photo control in its own row, after (not beside) the name.
 function decorateTour(){if(state.modal!=='tour'||Number(state.tourStep)!==0)return;const p=document.querySelector('#overlay-root .dp1061-feature-note');if(p&&!p.querySelector('.dp1063-urgent-value'))p.insertAdjacentHTML('beforeend',`<span class="dp1063-urgent-value">${loc('更重要的是，若心率突然大幅升高、下降，或呼吸出現突發異常，連續監測能協助及早發現變化並提醒主人查看。這是異常提示，不等於診斷心臟疾病或窒息。','More importantly, continuous readings can flag sudden heart-rate or breathing changes so the owner can check promptly. These are alerts to possible changes, not a diagnosis of heart disease or choking.','急な心拍や呼吸の変化に早く気づくためのアラートです。病気の診断ではありません。','급격한 심박·호흡 변화에 빠르게 주의하도록 돕는 알림입니다. 질병 진단은 아닙니다.')}</span>`);}
 const modalBefore=renderModal;
 renderModal=function(...args){const result=modalBefore.apply(this,args);const overlay=document.getElementById('overlay-root');if(overlay)markNoScore(overlay);if(state.modal==='tour'){decorateTour();return result;}if(!['pet-add','edit-pet'].includes(state.modal))return result;
  const name=document.querySelector('#addPetName,#petNameInput'),file=document.querySelector('#dp931-pet-photo'),block=file?.closest('.dp931-photo-input');if(!name||!file||!block)return result;
  name.insertAdjacentElement('afterend',block);block.classList.add('dp1063-photo-field');file.removeAttribute('capture');file.accept='image/*';
  let head=block.querySelector('.dp1063-upload-head');if(!head){head=document.createElement('div');head.className='dp1063-upload-head';head.textContent=loc('上傳頭部照片','Pet headshot','顔写真の追加','얼굴 사진 추가');block.insertBefore(head,file);}
  let trigger=block.querySelector('.dp1063-upload-trigger');if(!trigger){trigger=document.createElement('button');trigger.type='button';trigger.className='dp1063-upload-trigger';trigger.innerHTML=`${icon('camera',19)} <span>${loc('拍照或上傳圖片','Take photo or upload image','撮影または画像をアップロード','사진 촬영 또는 업로드')}</span>`;file.insertAdjacentElement('afterend',trigger);trigger.addEventListener('click',()=>file.click());}
  const legacy=block.querySelector('label');if(legacy)legacy.hidden=true;
  const note=block.querySelector('small');if(note)note.textContent=loc('上傳後可拖動、縮放並裁切頭像','Drag, zoom and crop after selecting a photo','選択後、移動・拡大して切り抜けます','선택 후 이동·확대·자르기');
  if(!file.dataset.dp1063Crop){file.dataset.dp1063Crop='1';file.addEventListener('change',()=>{const chosen=file.files?.[0];if(chosen&&chosen.type.startsWith('image/'))openCrop(file,chosen);});}
  for(const id of ['addPetAge','addPetWeight','addPetHeight']){const el=document.getElementById(id);if(el){el.placeholder='';if(state.modal==='pet-add'&&!el.dataset.dp1063Clean){el.value='';el.dataset.dp1063Clean='1';}}}
  document.getElementById('addPetBcs')?.closest('div')?.remove();return result;
 };
 function openCrop(file,chosen){
  document.getElementById('dp1063-crop-overlay')?.remove();
  const url=URL.createObjectURL(chosen),photo=new Image();photo.onload=()=>{
   const overlay=document.createElement('div');overlay.className='dp1063-crop-overlay';overlay.id='dp1063-crop-overlay';overlay.innerHTML=`<div class="dp1063-crop-sheet" role="dialog" aria-modal="true" aria-label="${loc('調整寵物頭像','Crop pet photo','ペットの写真を調整','반려동물 사진 조정')}"><h3>${loc('調整寵物頭像','Crop pet photo','写真を調整','사진 자르기')}</h3><p>${loc('移動照片，將寵物頭部放在圓框中央','Drag to center the face in the circle','顔を円の中央に移動','얼굴을 원 중앙에 배치')}</p><div class="dp1063-crop-stage"><canvas id="dp1063-crop-canvas" width="640" height="640"></canvas><div class="dp1063-crop-circle" aria-hidden="true"></div></div><label>${loc('縮放','Zoom','拡大','확대')}<input type="range" id="dp1063-crop-zoom" min="1" max="3" step="0.01" value="1"/></label><div class="dp1063-crop-actions"><button type="button" data-dp1063-crop="cancel">${loc('取消','Cancel','キャンセル','취소')}</button><button type="button" data-dp1063-crop="save">${loc('使用裁切照片','Use cropped photo','この写真を使用','자른 사진 사용')}</button></div></div>`;
   document.body.appendChild(overlay);const canvas=overlay.querySelector('canvas'),ctx=canvas.getContext('2d'),slider=overlay.querySelector('input'),side=640;let zoom=1,dx=0,dy=0,down=null;
   const dimensions=()=>{const factor=Math.max(side/photo.width,side/photo.height)*zoom;return [photo.width*factor,photo.height*factor];};
   const draw=()=>{const [w,h]=dimensions();dx=Math.max((side-w)/2,Math.min((w-side)/2,dx));dy=Math.max((side-h)/2,Math.min((h-side)/2,dy));ctx.clearRect(0,0,side,side);ctx.drawImage(photo,(side-w)/2+dx,(side-h)/2+dy,w,h);};draw();
   slider.addEventListener('input',()=>{zoom=Number(slider.value);draw();});
   canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,dx,dy};canvas.setPointerCapture(e.pointerId);});
   canvas.addEventListener('pointermove',e=>{if(!down)return;const ratio=side/(canvas.getBoundingClientRect().width||side);dx=down.dx+(e.clientX-down.x)*ratio;dy=down.dy+(e.clientY-down.y)*ratio;draw();});
   canvas.addEventListener('pointerup',()=>{down=null;});canvas.addEventListener('pointercancel',()=>{down=null;});
   const cleanup=()=>{overlay.remove();URL.revokeObjectURL(url);};
   overlay.querySelector('[data-dp1063-crop="cancel"]').addEventListener('click',()=>{file.value='';cleanup();});
   overlay.querySelector('[data-dp1063-crop="save"]').addEventListener('click',()=>{draw();canvas.toBlob(blob=>{if(!blob)return;try{const transfer=new DataTransfer();transfer.items.add(new File([blob],`deeppet-pet-${Date.now()}.jpg`,{type:'image/jpeg',lastModified:Date.now()}));file.files=transfer.files;}catch(e){console.warn('Crop file assignment unavailable',e);return;}let preview=file.parentElement.querySelector('.dp1063-cropped-preview');if(!preview){preview=document.createElement('img');preview.className='dp1063-cropped-preview';file.parentElement.appendChild(preview);}preview.src=canvas.toDataURL('image/jpeg',.85);cleanup();},'image/jpeg',.92);});
  };photo.onerror=()=>{URL.revokeObjectURL(url);file.value='';};photo.src=url;
 }
 // All tour openings, including those reached through an old modal link,
 // must start at stage one. Stepping within a currently open tour is preserved.
 let lastTourOpen=false;const renderBefore=render;
 render=function(...args){
  if(state.modal==='tour'&&!lastTourOpen&&Number(state.tourStep)!==0){state.tourStep=0;}
  lastTourOpen=state.modal==='tour';
  const result=renderBefore.apply(this,args),app=document.getElementById('app'),overlay=document.getElementById('overlay-root');
  if(app){arrangeCare(app);markNoScore(app);}
  if(overlay){markNoScore(overlay);decorateTour();}
  return result;
 };
 // Empty profiles must use the same date navigation as measured pets, without
 // asking a synthetic demoRecords() source to supply date bounds.
 document.addEventListener('click',e=>{
  if(state.tab!=='deep'||!unavailable()||state.detail)return;
  const button=e.target.closest('[data-action]');if(!button)return;
  const action=button.dataset.action;
  if(!['deep-day-step','deep-day-jump','deep-select-day','deep-day-view'].includes(action))return;
  e.preventDefault();e.stopImmediatePropagation();
  let chosen=state.deepSelectedDate||dateNow();
  if(action==='deep-day-step')chosen=iso(dateAdd(new Date(chosen+'T12:00:00Z'),Number(button.dataset.delta)||0));
  if(action==='deep-day-jump')chosen=dayAt(Number(button.dataset.days)||0);
  if(action==='deep-day-view')chosen=button.dataset.date;
  if(action==='deep-select-day'){state.range=1;chosen=state.deepSelectedDate||dateNow();}
  state.deepSelectedDate=chosen<dayAt(-29)?dayAt(-29):chosen>dateNow()?dateNow():chosen;
  if(action!=='deep-select-day')state.dp1007DayManuallyChosen=true;
  state.range=1;render(true);
 },true);
 document.addEventListener('change',e=>{
  if(state.tab!=='deep'||!unavailable()||e.target?.id!=='deepDayDate')return;
  e.preventDefault();e.stopImmediatePropagation();
  const value=String(e.target.value||'');
  if(/^\d{4}-\d{2}-\d{2}$/.test(value)){state.deepSelectedDate=value<dayAt(-29)?dayAt(-29):value>dateNow()?dateNow():value;state.dp1007DayManuallyChosen=true;render(true);}
 },true);
 root.DeepPetUX1063=Object.freeze({version:'10.63',emptyDeep,emptyHealth,contract:'same tabs, date controls, icons and care order; absent samples are N/A'});
})(window);
