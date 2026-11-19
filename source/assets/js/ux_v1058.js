/* DeepPet V10.58 — consistent score geometry, single metric detail entry,
 * exam-ring provenance and compact care progress. Presentation only: this
 * module never changes actual readings, saved records or scoring weights. */
(function(root){
 'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:
  state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100;
 const svgNS='http://www.w3.org/2000/svg';
 const elt=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};

 // Only combine controls when a second control really exists in the SAME
 // metric card. This intentionally leaves the three composite controls alone.
 function metricDetails(){
  if(state.tab!=='deep'||state.detail)return;
  const cardio=document.querySelector('#app .dp903-heart');
  for(const key of ['heart','breath']){
   const card=cardio?.querySelector(`[data-dp903-metric="${key}"]`);
   if(!card?.querySelector('[data-action="dp90-wave-open"]'))continue;
   card.querySelector('.dp1055-details')?.remove();
   const button=card.querySelector('.dp903-open-wave');
   if(button)button.textContent=L('查看詳細數據 ›','View detailed data ›','詳細データを見る ›','상세 데이터 ›');
  }
  const energyCards=document.querySelectorAll('#app .dp901-health-score .dp901-metric-card');
  for(const [index,key] of [[0,'energy'],[1,'recovery']]){
   const card=energyCards[index];if(!card)return;
   const reason=card.querySelector('.dp1055-details');
   const pageButton=card.querySelector('.dp905-day-detail-link,.dp908-energy-period-open');
   const dataExpand=card.querySelector('details.dp901-expand');
   if(pageButton){reason?.remove();pageButton.textContent=L('查看詳細數據 ›','View detailed data ›','詳細データを見る ›','상세 데이터 ›');}
   else if(dataExpand&&reason){
    // Recovery's existing "detailed data" is a fold, not a separate route.
    // Move the evidence inside that fold, above its existing graph unchanged.
    const body=dataExpand.querySelector('.dp901-expand-body');
    if(body){body.prepend(compactEvidenceFrom(reason,key));reason.remove();}
    const summary=dataExpand.querySelector('summary');
    if(summary)summary.textContent=L('查看詳細數據','View detailed data','詳細データを見る','상세 데이터');
   }
  }
 }
 function compactEvidenceFrom(reason,key){
  const result=elt('div',`dp1058-detail-evidence dp1058-${key}`),head=elt('b','dp1058-insight-title',L('主要原因與建議','Main findings and next step','主な原因と対応','주요 원인과 다음 단계'));
  result.append(head);
  for(const row of reason.querySelectorAll('.dp1055-evidence section')){
   const p=elt('p','dp1058-evidence-row');
   const title=elt('strong','',row.querySelector('b')?.textContent||'');
   p.append(title,document.createTextNode(row.querySelector('p')?.textContent||''));result.append(p);
  }
  return result;
 }
 function daySamples(date){
  if(!date)return [];
  const scoped=root.DeepPetUX1050?.scope?.(30)||[];
  const chosen=scoped.filter(x=>x.row?.date===date);
  if(chosen.length)return chosen;
  // Do not borrow a different pet's readings or the current day's explanation.
  const rows=typeof demoRecords==='function'?demoRecords(state.dog):[];
  const daily=root.DeepPetSignalScoring?.getDaily?.(state.dog)||[];
  const byDate=new Map(daily.filter(x=>x?.date).map(x=>[x.date,x.scores]));
  return rows.flatMap((row,i)=>row.date===date&&byDate.has(row.date)&&
   (typeof validDaySample!=='function'||validDaySample(row,i)?.valid)?[{row:{...row,idx:i},scores:byDate.get(row.date)}]:[]);
 }
 function showReasonOnDataPage(){
  if(state.tab!=='deep')return;
  const detail=state.detail;
  const key=detail==='dp905-energy-day'?'energy':detail==='dp90-waveform'?(state.dp90WaveKind==='breath'?'breath':'heart'):null;
  if(!key)return;
  const date=detail==='dp905-energy-day'?state.dp905ChosenDate:(state.dp905WaveMode==='day'?state.dp905ChosenDate:state.dp90WaveDate);
  const samples=daySamples(date),data=samples.length?root.DeepPetUX1055?.insight?.(key,samples,1):null;
  if(!data||!data.details?.length)return;
  const destination=document.querySelector('#app .dp905-overview, #app .dp904-wave-page .dp904-wave-card:nth-of-type(2), #app .dp90-wave-plot-card, #app .dp932-wave-page .card');
  if(!destination||destination.querySelector('.dp1058-detail-evidence'))return;
  const box=elt('div',`dp1058-detail-evidence dp1058-${key}`);
  box.append(elt('b','dp1058-insight-title',L('這項分數的主要原因','Why this score','この点数の主な理由','점수의 주요 원인')));
  box.append(elt('p','dp1058-insight-lead',data.headline));
  if(data.action)box.append(elt('p','dp1058-insight-next',L('先做：','Next: ','まず：','먼저: ')+data.action));
  for(const item of data.details){
   const row=elt('p','dp1058-evidence-row');row.append(elt('strong','',item.title+' · '),document.createTextNode(item.text));box.append(row);
  }
  const chart=destination.querySelector('.dp908-inspect-chart,.dp905-inspect-chart,.dp904-wave-chart,.dp905-wave-inspector,svg');
  if(chart){const top=chart.closest('.dp908-inspect-chart,.dp905-inspect-chart,.dp904-wave-chart,.dp905-wave-inspector')||chart;top.before(box);}
  else{const stats=destination.querySelector('.dp905-day-stats');if(stats)stats.after(box);else destination.prepend(box);}
 }

 // The same 54-dot proportional arc as dpDottedSvg()/dpDeepDottedScore().
 // Never paint a 100% dotted border for an 18% examination score.
 function examDots(){
  const selectors=['.dp921-page .dp921-score','.dp916-health-card .dp916-large-score',
   '.dp916-detail .dp916-large-score','.dp916-home-score','.dp938-score-ring'];
  document.querySelectorAll('#app '+selectors.join(',#app ')).forEach(node=>{
   if(node.querySelector('.dp1058-exam-svg'))return;
   const first=[...node.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim());
   const raw=(first?.textContent||node.textContent||'').trim();
   const scoreMatch=/^(\d{1,3})(?=\D|$)/.exec(raw),number=scoreMatch?Number(scoreMatch[1]):null;
   const n=valid(number)?number:null;
   node.classList.add('dp1058-exam-dots');
   if(n===null)return;
   const color=getComputedStyle(node).color,svg=document.createElementNS(svgNS,'svg');
   svg.setAttribute('viewBox','0 0 114 114');svg.setAttribute('aria-hidden','true');svg.classList.add('dp1058-exam-svg');
   const count=54,lit=Math.round(n/100*count);
   for(let i=0;i<count;i++){
    const a=i*2*Math.PI/count-Math.PI/2,c=document.createElementNS(svgNS,'circle');
    c.setAttribute('cx',(57+48*Math.cos(a)).toFixed(2));c.setAttribute('cy',(57+48*Math.sin(a)).toFixed(2));
    c.setAttribute('r','2.25');c.setAttribute('fill',color);c.setAttribute('opacity',i<lit?'1':'.19');svg.append(c);
   }
   node.prepend(svg);node.dataset.dp1058Dots=String(lit);node.dataset.dp1058Score=String(n);
  });
 }
 function careProgress(){
  if(state.tab!=='health'||state.detail)return;
  // Do not append historical percentage widgets to the one canonical card
  // system, which must retain identical geometry across all pet profiles.
  if(document.querySelector('#app .dp1075-health-page'))return;
  document.querySelectorAll('#app .dp916-care-card').forEach(x=>x.remove());
  const entries=root.DeepPetHealthInsights?.care?.()||[];
  for(const entry of entries){
   if(entry.key==='food')continue;// Food already has a kcal % + progress in its own primary row.
   const row=document.querySelector(`#app .care-menu .health-item[data-page="${entry.page}"]`);
   const grow=row?.querySelector('.grow');if(!grow||grow.querySelector('.dp1058-care-meter'))continue;
   const value=valid(entry.value)?Math.round(entry.value):null;
   const block=elt('div','dp1058-care-meter');
   block.append(elt('span','dp1058-care-percent',value===null?L('未安排','No plan','予定なし','계획 없음'):`${value}%`));
   const track=elt('span','dp1058-care-track'),fill=elt('i','');fill.style.width=`${value??0}%`;track.append(fill);block.append(track);
   block.setAttribute('aria-label',entry.label+' · '+(value===null?L('未安排','No plan','予定なし','계획 없음'):`${value}%`));
   grow.append(block);
  }
 }
 function careTypography(){
  if(state.tab!=='health'||!state.detail)return;
  const content=document.querySelector('#app .care-record-page');if(!content)return;
  if(state.detail==='med'){
   content.classList.add('dp1058-med-page');
   const cards=[...content.querySelectorAll('.card')];
   const history=cards.find(c=>/服藥歷史|服药历史|Dose history|복약 이력/i.test(c.querySelector('h2,h3,.section-title')?.textContent||''));
   if(history)history.classList.add('dp1058-med-history');
  }
  if(state.detail==='food'){
   const cards=[...content.querySelectorAll('.card')];
   const nutrition=cards.find(c=>/營養換算說明|营养换算说明|How nutrition is estimated|영양 환산 안내/i.test(c.querySelector('h2,h3,.section-title')?.textContent||''));
   if(nutrition)nutrition.classList.add('dp1058-nutrition');
  }
 }
 function chartMarker(){
  if(state.tab!=='health'||state.detail!=='summary')return;
  for(const panel of document.querySelectorAll('#app .dp850-score-panel')){
   panel.querySelectorAll('.dp1011-curve-tip,.dp905-point-reading,.dp938-chart-tooltip').forEach(x=>x.remove());
   for(const svg of panel.querySelectorAll('.dp850-curve svg')){
    const dots=[...svg.querySelectorAll('circle')].filter(x=>x.querySelector('title'));
    if(!dots.length||svg.dataset.dp1058Hover==='1')continue;
    svg.dataset.dp1058Hover='1';
    const update=e=>{
     const rect=svg.getBoundingClientRect(),v=svg.viewBox.baseVal;
     const x=e&&Number.isFinite(e.clientX)?v.x+(e.clientX-rect.left)/Math.max(rect.width,1)*v.width:Number(dots.at(-1).getAttribute('cx'));
     const point=dots.reduce((a,b)=>Math.abs(Number(a.getAttribute('cx'))-x)<=Math.abs(Number(b.getAttribute('cx'))-x)?a:b);
     const px=Number(point.getAttribute('cx')),py=Number(point.getAttribute('cy'));
     let marker=svg.querySelector('.dp1058-chart-marker');
     if(!marker){
      marker=document.createElementNS(svgNS,'g');marker.classList.add('dp1058-chart-marker');marker.setAttribute('pointer-events','none');
      const line=document.createElementNS(svgNS,'line');line.setAttribute('stroke','#7d9ab4');line.setAttribute('stroke-width','1.1');line.setAttribute('stroke-dasharray','3 4');
      const halo=document.createElementNS(svgNS,'circle');halo.setAttribute('fill','#fff');halo.setAttribute('stroke','#294f8f');halo.setAttribute('stroke-width','2.7');halo.setAttribute('r','6.8');
      marker.append(line,halo);svg.append(marker);
     }
     const line=marker.children[0],halo=marker.children[1];line.setAttribute('x1',px);line.setAttribute('x2',px);
     line.setAttribute('y1',Math.max(v.y+6,10));line.setAttribute('y2',Math.min(v.y+v.height-8,py+15));
     halo.setAttribute('cx',px);halo.setAttribute('cy',py);marker.style.display='';
     // Older chart hover handlers also fire: let the in-chart tooltip (V10.52)
     // display the exact nearest value while this marker highlights the point.
     svg.dataset.dp1012Selected=String(dots.indexOf(point));
    };
    svg.addEventListener('pointermove',update);svg.addEventListener('pointerdown',update);
    svg.addEventListener('focus',()=>update(null));
    svg.addEventListener('pointerleave',()=>{const marker=svg.querySelector('.dp1058-chart-marker');if(marker)marker.style.display='none';});
   }
  }
 }
 const earlier=render;
 render=function(reset=false){
  earlier(reset);
  metricDetails();showReasonOnDataPage();examDots();careProgress();careTypography();chartMarker();
  document.querySelectorAll('.app-build-version').forEach(el=>{el.textContent='DeepPet Version '+(root.DeepPetBuildVersion||'10.58');});
 };
 root.DeepPetUX1058={version:'10.58',daySamples};
})(window);
