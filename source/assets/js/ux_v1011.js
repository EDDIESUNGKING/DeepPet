/* DeepPet V10.11 — identity, terminology, visual/summary integrity.
 * Preserve four tabs, core formulas, safety rules and all 15 showcase records. */
(function(root){'use strict';
 const L=(z,e,k,j)=>state.lang==='en'?e:state.lang==='ko'?k:state.lang==='ja'?j:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(z):z;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const demoIndex=()=>allPets().findIndex(p=>p?.dpFreshDemo===true);
 const demoPhoto='assets/new_pet_shiba_v1002.jpg';
 const photoFor=p=>p?.dpFreshDemo&&!p?.dpUserProfileSaved&&!state.petOverrides?.[state.dog]?.photo?demoPhoto:p?.photo||demoPhoto;
 const isGallery=()=>!selectedBlank()&&state.dog>=0&&state.dog<15&&!dpUsesRealMeasurements();

 // Reconcile an old gallery persistence record without changing owner-edited
 // profiles, the truly empty sample or any individual care/score collection.
 for(const p of state.petExtras||[])if(p?.dpFreshDemo&&!p.dpUserProfileSaved){
  if(!p.name||/^(空白檔案|空白档案|Blank|New Pet|新寵物|新宠物)$/i.test(String(p.name).trim()))p.name='Lucky';
  p.photo=demoPhoto;
  p.breed={zh:'柴犬',zht:'柴犬',en:'Shiba Inu',ko:'시바견',ja:'柴犬'};
  p.age=2;p.weight=9;
 }

 function repairNewPet(app){
  const ix=demoIndex();if(ix<0)return;
  const d=allPets()[ix],fresh=state.dog===ix&&!selectedBlank(),name=String(d.name||'Lucky');
  for(const target of app.querySelectorAll(`[data-action="select-pet"][data-index="${ix}"]`)){
   const caption=target.querySelector('span:last-child');if(caption)caption.textContent=name;
   const img=target.querySelector('img');if(img&&!d.dpUserProfileSaved&&!state.petOverrides?.[ix]?.photo){img.src=demoPhoto;img.alt=L('柴犬','Shiba Inu','시바견','柴犬');}
  }
  if(!fresh)return;
  const avatar=app.querySelector('.edit-avatar img,.avatar-image-preview img,.dp935-profile-image img,.dp934-profile-image img,.dp932-hero-image img,.dp1000-profile-only img.pet-avatar');
  if(avatar){avatar.src=photoFor(d);avatar.alt=name;avatar.addEventListener('error',()=>{if(avatar.src.includes('new_pet_shiba_v1002.jpg'))return;avatar.src=demoPhoto;},{once:true});}
  const edit=app.querySelector('.edit-avatar');if(edit){
   edit.querySelectorAll('img:not(:first-child)').forEach(node=>node.remove());
   const img=edit.querySelector('img');if(img&&!img.getAttribute('src'))img.src=demoPhoto;
  }
  const inputs=app.querySelectorAll('#petNameInput');for(const input of inputs)if(!d.dpUserProfileSaved)input.value=name;
  for(const hero of app.querySelectorAll('.dp58-first-hero,.dp935-empty-hero'))if(!d.dpUserProfileSaved&&!state.petOverrides?.[ix]?.photo)hero.style.backgroundImage=`url('${demoPhoto}')`;
 }

 function terminology(app){
  // The same score must have the same name in all four tabs and in dialogs.
  // Text nodes only: do not mutate SVG markup, script JSON or data keys.
  const translate=s=>s
   .replace(/身體狀態/g,'生理狀態').replace(/身体状态/g,'生理状态')
   .replace(/BODY STATUS/g,'PHYSIOLOGICAL STATUS')
   .replace(/Body status/g,'Physiological status')
   .replace(/Body Status/g,'Physiological Status')
   .replace(/body status/g,'physiological status');
  const walker=document.createTreeWalker(app,NodeFilter.SHOW_TEXT);let n;
  while((n=walker.nextNode())){
   if(n.parentElement?.closest('script,style'))continue;
   const updated=translate(n.nodeValue);if(updated!==n.nodeValue)n.nodeValue=updated;
  }
  app.querySelectorAll('[aria-label],[title]').forEach(el=>{
   for(const key of ['aria-label','title'])if(el.hasAttribute(key))el.setAttribute(key,translate(el.getAttribute(key)));
  });
 }

 function urgentAboveSummary(app){
  if(state.tab!=='home'||state.detail)return;
  const main=app.querySelector('.home-page-v30');if(!main)return;
  const urgent=main.querySelector('.dp936-urgent');if(!urgent)return;
  const empty=urgent.querySelector('.dp936-urgent-empty');
  if(empty){empty.textContent=L('目前沒有當日應急提醒','No emergency alerts today','오늘 응급 알림이 없습니다','本日の緊急通知はありません');urgent.querySelector('.dp936-urgent-head small')?.remove();}
  const photo=main.querySelector('.home-hero-poster,.dp58-first-hero,.blank-home-hero');
  const summary=main.querySelector('.summary-card,.dp-combined-summary');
  if(photo&&photo.parentElement===urgent.parentElement)photo.insertAdjacentElement('afterend',urgent);
  else if(summary)summary.insertAdjacentElement('beforebegin',urgent);
 }

 function preventiveCare(app){
  if(state.tab!=='health'||state.detail)return;
  // The canonical Health component already distinguishes complete profiles,
  // new pets and wholly blank pets. This former blanket copy incorrectly
  // asserted breed-based analysis even when no pet profile existed.
  if(app.querySelector('.dp1075-health-page'))return;
  const parent=app.querySelector('.dp941-prevention,.dp67-prevention,.dp70-watch-hero');if(!parent)return;
  const d=currentDog();
  const statement=L('根據寵物的品種、年齡與體重，推估值得優先留意的健康重點。',
   'Based on your pet’s breed, age and weight, we estimate the health priorities worth watching.',
   '품종·나이·체중을 바탕으로 주의할 건강 항목을 안내합니다.',
   '品種・年齢・体重から、注意したい健康ポイントを推定します。');
  const heading=parent.querySelector('.dp67-hero p,.dp70-watch-heading p');
  if(heading)heading.textContent=statement;
  if(parent.matches('.dp941-prevention')&&!parent.querySelector('.dp1011-prevention-intro')&&d?.breed){
   const intro=document.createElement('p');intro.className='dp1011-prevention-intro';intro.textContent=statement;
   parent.querySelector('.dp941-prevention-heading')?.insertAdjacentElement('afterend',intro);
  }
  const breedName=()=>typeof d?.breed==='string'?d.breed:
   state.lang==='en'?d?.breed?.en:state.lang==='ja'?(d?.breed?.ja||d?.breed?.zht||d?.breed?.zh):state.lang==='zh'?(d?.breed?.zh||d?.breed?.en):state.lang==='ko'?(d?.breed?.ko||d?.breed?.en):(d?.breed?.zht||d?.breed?.zh||d?.breed?.en);
  const breed=parent.querySelector('.dp67-profile span:first-child,.dp70-watch-profile span:first-child');
  if(breed&&breedName())breed.textContent=breedName();
  const meta=parent.querySelector('.dp941-profile-meta');
  if(meta&&breedName()&&Number.isFinite(Number(d.age))&&Number.isFinite(Number(d.weight)))
   meta.textContent=`${breedName()} · ${Number(d.age).toFixed(1)} ${L('歲','years','세','歳')} · ${Number(d.weight).toFixed(1)} kg`;
  // The subtitle already covers the inference basis; no second duplicate.
  const repeat=parent.querySelector('.dp68-watch-intro p');if(repeat)repeat.remove();
  parent.querySelector('.dp1003-reference-note')?.remove();
  const ready=parent.querySelector('.dp941-prevention-note');
  if(ready&&/依品種、年齡與體重提供的預防建議|Based on this pet’s breed, age and weight|품종·나이·체중 기반 권장|品種・年齢・体重に基づく提案/.test(ready.textContent))ready.remove();
 }

 function simplifyMore(app){
  if(state.tab==='home')for(const el of app.querySelectorAll('.dp-today-more-button,.dp999-more>summary,.dp68-more>summary,.dp936-more')){
   if(el.classList.contains('dp-today-more-button')){
    const icon=el.querySelector('svg');el.replaceChildren(document.createTextNode('More'));if(icon)el.append(icon);
   }else if(el.classList.contains('dp936-more')&&el.textContent.trim()!=='More')continue;
   else el.textContent='More';
  }
  if(state.tab==='health')for(const el of app.querySelectorAll('.dp999-more>summary,.dp992-toggle'))el.textContent='More';
 }

 function recapPoints(app){
  if(state.tab!=='health'||state.detail!=='summary')return;
  const panels=app.querySelectorAll('.dp850-score-panel');
  for(const [index,panel] of panels.entries()){
   const curve=panel.querySelector('.dp850-curve');if(!curve)continue;
   const chart=curve.querySelector('svg');if(!chart)continue;
   chart.setAttribute('tabindex','0');chart.setAttribute('aria-label',L('滑鼠移至日期查看每日分數','Hover or tap to inspect each daily score','날짜를 선택해 점수 확인','各日を選択して点数を見る'));
   const circleList=[...chart.querySelectorAll('circle')];
   // The cursor locks onto the nearest recorded day; the larger active marker
   // makes numeric values visible even on touch-sized screens.
   let tip=curve.querySelector('.dp1011-curve-tip');if(!tip){tip=document.createElement('output');tip.className='dp1011-curve-tip';tip.setAttribute('aria-live','polite');curve.append(tip);}
   const show=e=>{
    if(!circleList.length)return;
    const bounds=chart.getBoundingClientRect(),view=chart.viewBox.baseVal;
    const sx=Number.isFinite(e.clientX)?view.x+(e.clientX-bounds.left)/Math.max(1,bounds.width)*view.width:circleList.at(-1).cx.baseVal.value;
    const near=circleList.reduce((a,b)=>Math.abs(a.cx.baseVal.value-sx)<Math.abs(b.cx.baseVal.value-sx)?a:b);
    const source=near.querySelector('title')?.textContent||'';if(!source)return;
    const [date,value]=source.split(' · ');
    tip.textContent=`${date}　${value} / 100`;
    tip.style.display='block';
    const fraction=(near.cx.baseVal.value-view.x)/Math.max(1,view.width);
    tip.style.left=`${Math.min(85,Math.max(15,100*fraction))}%`;
   };
   chart.addEventListener('pointermove',show);chart.addEventListener('pointerdown',show);chart.addEventListener('focus',()=>show({}));
   chart.addEventListener('pointerleave',()=>{tip.style.display='none';});
   if(index===1){
    const fold=document.createElement('details');fold.className='dp1011-rhythm-fold';
    const head=document.createElement('summary');head.textContent=L('查看生理節奏趨勢','Show physiological rhythm trend','생리 리듬 추세 보기','生理リズムの推移を見る');
    curve.replaceWith(fold);fold.append(head,curve);
   }
  }
  // Explicitly list genuine excluded calendar dates. Do not connect and
  // invent invalid 20-Hz measurements; Luna's showroom fixture has been
  // corrected to a fully observed week.
  const days=state.healthSummaryDays===30?30:7,missing=dayRowsWithIndex(days).filter(r=>!validDaySample(r,r.idx).valid);
  if(missing.length&&panels.length){
   const list=missing.map(r=>`${r.date}（${validDaySample(r,r.idx).reasons.map(qualityIssueName).join('、')}）`).join('；');
   const notice=document.createElement('p');notice.className='dp1011-missing-note';
   notice.textContent=L(`缺測／未通過品質檢查的日期：${list}。不補造當日分數。`,
    `Missing or quality-excluded dates: ${missing.map(r=>r.date).join(', ')}. No scores have been invented.`,
    `측정 제외 날짜: ${missing.map(r=>r.date).join(', ')}. 점수를 추정하지 않습니다.`,
    `欠測・品質除外日：${missing.map(r=>r.date).join('、')}。点数の補完はしません。`);
   panels[0].insertAdjacentElement('beforeend',notice);
  }
 }

 function vetMissing(app){
  if(state.modal!=='vet-brief'||!app.querySelector('.vet-report-root'))return;
  const d=vetReportData(),missing=d.usable.filter(x=>!x.valid).map(x=>x.record);
  if(!missing.length)return;
  const note=app.querySelector('.vet-data-note');if(!note)return;
  const list=missing.map(r=>`${r.date}（${validDaySample(r,r.idx).reasons.map(qualityIssueName).join('、')}）`).join('；');
  note.insertAdjacentHTML('beforeend',`<br/><span class="dp1011-missing-note">${esc(L('缺測說明：'+list+'。缺測日不計入平均。',
   'Excluded dates: '+missing.map(r=>r.date).join(', ')+'. Excluded values are not averaged.',
   '제외 날짜: '+missing.map(r=>r.date).join(', '),'欠測日：'+missing.map(r=>r.date).join('、')))}</span>`);
 }

 const kindName={med:'用藥',vaccine:'疫苗',exam:'體檢',food:'飲食',activity:'活動',recovery:'恢復',note:'額外記錄'};
 function careAllPage(){
  const data=root.DeepPetUX999?.care?.()||[];
  const headings={med:['用藥','Medication'],vaccine:['疫苗','Vaccines'],exam:['體檢','Exams'],food:['飲食','Food'],activity:['活動','Activity'],recovery:['恢復','Recovery'],note:['額外記錄','Notes']};
  const route={med:'med',vaccine:'vaccines',exam:'reports',food:'food',activity:'notes',recovery:'recovery-care',note:'notes'};
  return `<div class="app-pad dp1011-care-all"><header class="dp-independent-head"><button type="button" data-action="dp1011-care-back">←</button><b>${L('近期健康管理 · 全部紀錄','Recent care · All records','최근 건강 기록','最近のケア記録')}</b></header><p class="subtitle">${L('按日期整理各項記錄，選擇任何項目即可前往原有健康管理詳細頁。','Records in date order; select an item to open its original Health detail page.','날짜순 기록입니다. 항목을 선택하면 상세 내용을 볼 수 있습니다.','日付順に記録を表示します。項目から詳細へ進めます。')}</p><div class="dp1011-care-list">${data.map(r=>`<button class="card dp1011-care-row" data-action="health-detail" data-page="${route[r.type]||'notes'}"><span class="dp1011-care-date">${esc(r.date)}${r.time?' · '+esc(r.time):''}</span><span class="dp1011-care-name"><b>${esc(L(headings[r.type]?.[0]||kindName[r.type]||'記錄',headings[r.type]?.[1]||r.type,headings[r.type]?.[1]||r.type,headings[r.type]?.[1]||r.type))}</b> · ${esc(r.title||'')}</span><span>›</span></button>`).join('')||`<p>${L('尚無健康管理紀錄','No care records yet','건강 관리 기록 없음','記録がありません')}</p>`}</div><div class="footer-space"></div></div>`;
 }

 const priorAction=onAction;
 onAction=function(el){
  const action=el?.dataset?.action;
  if(action==='dp1011-care-back'){navTo('health');return;}
  // A retained old button should reach the current Health records overview,
  // never set the retired dp1011-care-all route that no longer has a page.
  if(action==='dp1011-care-all-open'){navTo('health');return;}
  return priorAction(el);
 };
 // dp999-more belongs to the Health upcoming-reminders <details> disclosure.
 // Never capture its native click and mistake that reminder expansion for the
 // recent-health-records archive. The archive has its own explicit action.

 const previousModal=renderModal;
 renderModal=function(){
  previousModal();
  const overlay=document.querySelector('#overlay-root');
  if(overlay){repairNewPet(overlay);terminology(overlay);}
 };

 const previousRender=render;
 render=function(reset=false){
  previousRender(reset);
  const app=document.getElementById('app');if(!app)return;
  // The obsolete archive renderer is retired. Current Health navigation
  // remains inside its shared detail component, with no HTML replacement.
  repairNewPet(app);
  terminology(app);
  const guide=document.querySelector('#dp935-guide-root');if(guide)terminology(guide);
  urgentAboveSummary(app);
  preventiveCare(app);
  simplifyMore(app);
  recapPoints(app);
  vetMissing(app);
  app.querySelectorAll('.app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.11');
 };
 root.DeepPetUX1011={version:'10.11',repairNewPet,recapPoints,careAllPage};
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.11',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'new-pet-shiba-identity-editor','urgent-above-summary-no-na','single-decimal-ai-age',
  'daily-inverse-wellness-trends','schematic-four-stage-tour','weekly-value-hover',
  'luna-complete-showcase-week','real-missing-days-annotated','terminology-unified']};
})(window);
