/* DeepPet 9.39 — shared numeric chart hover and safe new-pet measurement state. */
(function(root){'use strict';
 const tx=(zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const fresh=()=>Number(state.dog)>=15||selectedBlank()||dp58FreshPet()||isFreePet();
 const rawDaily=()=>root.DeepPetSignalScoring?.getDaily?.(state.dog)||[];
 const noReadings=()=>fresh()&&rawDaily().length===0;
 const noDataMsg=()=>tx('尚無有效量測數據 · N/A','No valid measurements yet · N/A','유효한 측정 없음 · N/A','有効な測定なし · N/A');
 const previousAudit=qualityAuditCard,previousGrid=qualityDayGrid,previousDay=qualityDayDetail;
 qualityAuditCard=function(){if(!noReadings())return previousAudit();return `<section class="quality-audit dp938-empty-quality"><h4>${tx('本次量測品質','Current recording quality','현재 측정 품질','測定品質')}</h4><p>${noDataMsg()}</p><div class="quality-audit-grid">${[['有效量測時長','Recording duration'],['波形貼合估計','Signal contact'],['活動干擾','Motion interference'],['有效心搏間期','Clean intervals']].map(([zh,en])=>`<div class="quality-audit-item"><small>${tx(zh,en,en,en)}</small><strong>N/A</strong></div>`).join('')}</div></section>`;};
 qualityDayGrid=function(){if(!noReadings())return previousGrid();return `<div class="quality-days-grid">${Array.from({length:14},(_,i)=>{const date=iso(dateAdd(localDate(),i-13));return `<span class="dp938-no-day"><small>${date.slice(5)}</small><strong>—</strong></span>`}).join('')}</div><p class="quality-days-caption">${noDataMsg()}</p>`;};
 qualityDayDetail=function(){if(!noReadings())return previousDay();return `<div class="quality-day-detail"><h3>${tx('量測品質','Recording quality','측정 품질','測定品質')}</h3><p>${noDataMsg()}</p></div>`;};
 let tip=null;
 function hide(){if(tip){tip.remove();tip=null;}}
 function nearestSVGPoint(svg,event){
  const nodes=Array.from(svg.querySelectorAll('.dp938-trend-point,circle:has(>title),g.dp-lab-point'));
  if(!nodes.length)return null;
  let point;
  try{const p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;point=p.matrixTransform(svg.getScreenCTM().inverse());}catch{return null;}
  let match=null,distance=Infinity;
  for(const node of nodes){const circle=node.tagName.toLowerCase()==='circle'?node:node.querySelector('circle');if(!circle)continue;
   const cx=Number(circle.getAttribute('cx'));if(!Number.isFinite(cx))continue;
   const d=Math.abs(cx-point.x);if(d<distance){distance=d;match=node;}}
  if(!match)return null;
  if(match.classList.contains('dp938-trend-point'))return `${match.dataset.date} · ${match.dataset.value} ${match.dataset.unit||''}`;
  if(match.classList.contains('dp-lab-point'))return `${match.dataset.date} · ${match.dataset.value}`;
  return match.querySelector('title')?.textContent||null;
 }
 document.addEventListener('pointermove',event=>{
  const svg=event.target.closest?.('svg');
  // Waveform inspectors and 1,440-minute charts already own exact-time cursors.
  if(!svg||svg.closest('.dp-chart-inspector')||svg.matches('[data-dp936-source]')){hide();return;}
  const selected=svg.matches('[data-dp938-chart],.dp-signal-svg,.dp-summary-mini-svg,.dp-lab-trend-svg,.rhythm-curve,.age-science-chart,.vet-line-chart')||svg.closest('.dp850-curve');
  if(!selected){hide();return;}
  const label=nearestSVGPoint(svg,event);
  if(!label){hide();return;}
  if(!tip){tip=document.createElement('div');tip.className='dp938-chart-tooltip';document.body.appendChild(tip);}
  tip.textContent=label;
  tip.style.left=Math.max(5,Math.min(innerWidth-215,event.clientX+12))+'px';
  tip.style.top=Math.max(5,event.clientY-43)+'px';
 },true);
 document.addEventListener('pointercancel',hide,true);
 // V9.39: a visible dot ON the plotted line, not merely a floating value.
 // Works with daily/7D/30D, full-day, period zoom and physiological charts.
 let hoverSvg=null,hoverGroup=null;
 const svgNS='http://www.w3.org/2000/svg';
 function clearHoverPoint(){if(hoverGroup){hoverGroup.remove();hoverGroup=null;}hoverSvg=null;}
 function linePointAtX(node,x){
  if(typeof node.getTotalLength!=='function'||typeof node.getPointAtLength!=='function')return null;
  let total;try{total=node.getTotalLength();}catch{return null;}
  if(!Number.isFinite(total)||total<25)return null;
  let lo=0,hi=total,first=node.getPointAtLength(0),last=node.getPointAtLength(total);
  const asc=first.x<=last.x;
  for(let j=0;j<18;j++){const mid=(lo+hi)/2,p=node.getPointAtLength(mid);if((p.x<x)===asc)lo=mid;else hi=mid;}
  return node.getPointAtLength((lo+hi)/2);
 }
 function inspectHoverPoint(svg,event){
  // Trend charts only: map outlines, product illustrations and other decorative
  // SVG geometry are not data and must never acquire a misleading chart dot.
  if(svg.closest('.dp938-tour,.dp928-tour')||svg.classList.contains('line-icon')||
   !svg.matches('[data-dp938-chart],.dp932-chart,.dp936-energy-svg,.dp-minute-svg,.dp-detail-curve,.dp-signal-svg,.dp-context-svg,.dp-owner-chart,.dp-summary-mini-svg,.dp-lab-trend-svg,.mini-chart,.rhythm-curve,.age-science-chart,.vet-line-chart,.week-chart-svg,.deep-time-svg,.dp-overlay-svg,.live-wave')&&
   !svg.closest('.dp850-curve,.dp-chart-inspector'))return clearHoverPoint();
  let cursor;try{const p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;cursor=p.matrixTransform(svg.getScreenCTM().inverse());}catch{return clearHoverPoint();}
  let selected=null,priority=Infinity;
  for(const path of svg.querySelectorAll('path[d],polyline[points]')){
   if(path.closest('.dp939-hover-point')||path.getAttribute('stroke')==='none')continue;
   let box;try{box=path.getBBox();}catch{continue;}
   if(box.width<90||box.height<1)continue;
   const p=linePointAtX(path,cursor.x);if(!p)continue;
   const dist=Math.abs(p.y-cursor.y);
   if(dist<priority){selected=p;priority=dist;}
  }
  if(!selected){
   // Some plots use independent titled circles rather than one SVG path.
   for(const circle of svg.querySelectorAll('circle:has(>title),.dp938-trend-point circle,.dp-lab-point circle')){
    const cx=Number(circle.getAttribute('cx')),cy=Number(circle.getAttribute('cy'));
    if(!Number.isFinite(cx)||!Number.isFinite(cy))continue;
    const dist=Math.hypot(cx-cursor.x,cy-cursor.y);
    if(dist<priority){selected={x:cx,y:cy};priority=dist;}
   }
   if(priority>55)selected=null;
  }
  if(!selected)return clearHoverPoint();
  if(hoverSvg!==svg){clearHoverPoint();hoverSvg=svg;hoverGroup=document.createElementNS(svgNS,'g');hoverGroup.classList.add('dp939-hover-point');hoverGroup.setAttribute('pointer-events','none');svg.appendChild(hoverGroup);
   const line=document.createElementNS(svgNS,'line');line.setAttribute('stroke','#3385d8');line.setAttribute('stroke-width','1.2');line.setAttribute('stroke-dasharray','3 4');line.setAttribute('opacity','.7');hoverGroup.appendChild(line);
   const halo=document.createElementNS(svgNS,'circle');halo.setAttribute('r','7.2');halo.setAttribute('fill','#ffffff');halo.setAttribute('stroke','#3385d8');halo.setAttribute('stroke-width','2.2');hoverGroup.appendChild(halo);
   const dot=document.createElementNS(svgNS,'circle');dot.setAttribute('r','3.2');dot.setAttribute('fill','#3385d8');hoverGroup.appendChild(dot);
  }
  const vb=svg.viewBox.baseVal,h=vb?.height||180;
  const guide=hoverGroup.children[0];guide.setAttribute('x1',selected.x);guide.setAttribute('x2',selected.x);guide.setAttribute('y1','11');guide.setAttribute('y2',String(h-26));
  for(const circle of [hoverGroup.children[1],hoverGroup.children[2]]){circle.setAttribute('cx',selected.x);circle.setAttribute('cy',selected.y);}
 }
 document.addEventListener('pointermove',event=>{
  const svg=event.target.closest?.('svg');
  if(svg)inspectHoverPoint(svg,event);else clearHoverPoint();
 },true);
 document.addEventListener('pointercancel',clearHoverPoint,true);
 document.addEventListener('touchend',clearHoverPoint,true);
 root.DeepPetUX938={version:'9.39',noReadings,ageMonotonic:true};
 const previousRender=render;
 render=function(reset=false){previousRender(reset);
  const app=document.getElementById('app');
  if(!app)return;
  // The older Health prevention panel used a separate biological-age engine.
  // Unify that visible age with Home/Me's longitudinal score-derived model;
  // a newly created pet must show N/A instead of a demo Shiba's old estimate.
  for(const old of app.querySelectorAll('.dp67-age')){
   const m=root.DeepPetAudit925?.model?.()||{},s=Number.isFinite(m.score)?Math.round(m.score):'N/A';
   const a=Number.isFinite(m.ageYears)?m.ageYears.toFixed(1):'N/A';
   const ageLabel=tx('AI 推算生理年齡','AI-estimated wellness age','AI 추정 건강 나이','AI推定健康年齢');
   old.outerHTML=`<button type="button" class="card dp938-consistent-age" data-action="dp925-wellness-open"><span><b>${ageLabel}</b><small>${tx('近 30 天身體健康分析 · 點擊查看','30-day health analysis · View details','30일 건강 분석','直近30日間の健康分析')}</small></span><span class="dp938-age-results"><strong>${a} <small>${tx('歲','years','세','歳')}</small></strong><em>${s} / 100</em></span><span aria-hidden="true">›</span></button>`;
  }
  app.querySelectorAll('.app-build-version').forEach(e=>e.textContent='DeepPet · Version 9.39');
 };
})(window);
