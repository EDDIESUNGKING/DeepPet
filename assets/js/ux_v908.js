/* DeepPet 9.08 — consistent status vocabulary, sync and deterministic hover readings. */
(function(){
'use strict';
const labels={
 zh:{good:'健康',low:'轻风险',mid:'中风险',high:'高风险'},
 zht:{good:'健康',low:'輕風險',mid:'中風險',high:'高風險'},
 en:{good:'Healthy',low:'Low Risk',mid:'Middle Risk',high:'High Risk'},
 ko:{good:'건강',low:'낮은 위험',mid:'중간 위험',high:'높은 위험'},
 ja:{good:'健康',low:'低リスク',mid:'中リスク',high:'高リスク'}
};
const LANG=()=>labels[state.lang]||labels.zht;
function grade(v){return v===null||v===undefined?'—':v>=90?LANG().good:v>=80?LANG().low:v>=60?LANG().mid:LANG().high;}
// Display labels alone, never rewrite user-entered medical records or explanatory paragraphs.
function statusLabels(root){
 if(!root)return;
 const match={
 '正常':'good','Normal':'good','表現很好':'good','表现很好':'good','Doing great':'good',
 '狀態穩定':'low','状态稳定':'low','Looking steady':'low',
 '稍微留意':'mid','Keep an eye on it':'mid',
 '需要多留意':'high','Needs attention':'high',
 'Low concern':'low','Moderate concern':'mid','High concern':'high',
 '轻风险':'low','輕風險':'low','中风险':'mid','中風險':'mid','高风险':'high','高風險':'high'
 };
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node;
 while(node=walker.nextNode()){
   const value=(node.nodeValue||'').trim();const level=match[value];
   if(!level)continue;
   // Only status-like labels. Don't touch arbitrary input records or button copies.
   const p=node.parentElement;
   if(!p||p.closest('[contenteditable],textarea,script,style,input'))continue;
   if(!p.closest('.dp903-score-col,.dp901-score-col,.dp903-overview,.dp905-calendar-panel,.dp908-calendar-panel,.dp90-indicator,.dp75-risk,.dp71-risk,.dp69-grade,.dp90-status,.dp901-score-tag,.summary-ring-status,.dp903-grade,.pill,.dp907-risk,.dp905-sleep-day,.dp-rhythm-summary,.dp90-rhythm-detail,.summary-detail-v44,.dp-status-score,.dp-owner-deep,.dp-home-summary,.summary-card'))continue;
   node.nodeValue=node.nodeValue.replace(value,LANG()[level]);
 }
}
// A small but real day-to-day change calculated from observed activity and rest,
// not from random values. This is still modeled demonstration data.
const beforeScores=dpOwnerDayScores;
dpOwnerDayScores=function(row,withRecovery=false){
 const s=beforeScores(row,withRecovery);
 if(!row||!Number.isFinite(Number(s.energy))||s.energy===null)return s;
 const records=demoRecords(state.dog),i=Number.isInteger(row.idx)?row.idx:records.findIndex(r=>r.date===row.date);
 if(i<0)return s;
 const prev=records.slice(Math.max(0,i-14),i);
 const valid=prev.filter(x=>Number.isFinite(Number(x.activity))&&Number.isFinite(Number(x.sleep)));
 if(valid.length>=3){
  const refA=valid.reduce((sum,x)=>sum+Number(x.activity),0)/valid.length;
  const refS=valid.reduce((sum,x)=>sum+Number(x.sleep),0)/valid.length;
  const a=Number(row.activity),sleep=Number(row.sleep);
  if(Number.isFinite(a)&&Number.isFinite(sleep)){
    const activityDeviation=Math.abs(a-refA)/Math.max(1,refA);
    const restDeviation=Math.abs(sleep-refS);
    const penalty=Math.max(0,Math.min(8,Math.round(activityDeviation*19+restDeviation*2.5)));
    const next=Math.max(0,Math.min(100,Math.round(Number(s.energy))-penalty));
    s.energy=next;
    const rr=Number.isFinite(Number(s.recovery))&&s.recovery!==null?s.recovery:null;
    const rhythm=rhythmData().values[i];
    const calm=rhythm?dpOwnerQualityValue(rhythmPositiveValue('calm',rhythm)):null;
    s.energyActivity=rr===null||calm===null?null:Math.round((next+rr+calm)/3);
  }
 }
 return s;
};
// Heart/breathing/energy demo signal graph uses the same source for curve and inspection.
function inspectPosition(holder,ev){
 const svg=holder.querySelector('svg');if(!svg)return;
 let x;
 try{const p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;x=p.matrixTransform(svg.getScreenCTM().inverse()).x;}
 catch{const rect=svg.getBoundingClientRect();x=36+(ev.clientX-rect.left)/rect.width*(360-36-12);}
 const a=Number(holder.dataset.start),b=Number(holder.dataset.end);
 const ratio=Math.min(1,Math.max(0,(x-36)/(360-36-12)));
 const minute=Math.max(a,Math.min(b,Math.round(a+(b-a)*ratio)));
 const date=holder.dataset.date,metric=holder.dataset.metric,source=metric==='energy'?'activity':metric;
 const raw=dpSignals(date,[source])?.[source]||[],v=raw[minute];
 if(!Number.isFinite(v))return;
 const hh=String(Math.floor(minute/60)).padStart(2,'0'),mm=String(minute%60).padStart(2,'0'),unit=holder.dataset.unit||'';
 const r=holder.querySelector('.dp908-chart-readout');if(r)r.textContent=`${date} ${hh}:${mm} · ${Number(v).toFixed(1)} ${unit}`;
 let line=svg.querySelector('.dp908-cursor-line');
 if(!line){line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('class','dp908-cursor-line');line.setAttribute('stroke','#3677ab');line.setAttribute('stroke-width','1.5');line.setAttribute('stroke-dasharray','4 3');line.setAttribute('pointer-events','none');svg.appendChild(line);}
 const vx=36+(360-36-12)*(minute-a)/Math.max(1,b-a);
 line.setAttribute('x1',vx);line.setAttribute('x2',vx);line.setAttribute('y1',14);line.setAttribute('y2',143);
 holder.dataset.readMinute=String(minute);
}
for(const eventName of ['pointermove','pointerdown','click'])document.addEventListener(eventName,ev=>{
 const el=ev.target.closest?.('.dp908-inspect-chart');if(el)inspectPosition(el,ev);
}, {passive:true});
document.addEventListener('keydown',ev=>{
 const el=ev.target.closest?.('.dp908-inspect-chart');if(!el||!['ArrowLeft','ArrowRight'].includes(ev.key))return;
 ev.preventDefault();const v=Number(el.dataset.readMinute)||Number(el.dataset.start)||0;
 const svg=el.querySelector('svg');if(!svg)return;
 const next=Math.min(Number(el.dataset.end),Math.max(Number(el.dataset.start),v+(ev.key==='ArrowRight'?1:-1)));
 const a=Number(el.dataset.start),b=Number(el.dataset.end),px=36+(360-36-12)*(next-a)/Math.max(1,b-a);
 const point=svg.createSVGPoint();point.x=px;point.y=55;
 const screen=point.matrixTransform(svg.getScreenCTM());inspectPosition(el,{clientX:screen.x,clientY:screen.y});
});
// Daily 7/30-day energy scores: exact data-bound hover/click rather than static SVG title.
function inspectDaily(holder,ev){
 const svg=holder.querySelector('svg');if(!svg)return;
 let pts;try{pts=JSON.parse(decodeURIComponent(holder.dataset.dailyPoints||''));}catch{return;}
 if(!pts.length)return;
 let x;
 try{const pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;x=pt.matrixTransform(svg.getScreenCTM().inverse()).x;}
 catch{const box=svg.getBoundingClientRect();x=30+(ev.clientX-box.left)/box.width*(360-30-12);}
 const idx=Math.max(0,Math.min(pts.length-1,Math.round((x-30)/(360-30-12)*(pts.length-1))));
 const item=pts[idx],readout=holder.querySelector('.dp908-chart-readout');
 const value=item.score===null?'—':item.score+'/100';
 if(readout)readout.textContent=item.date+' · '+value+' · '+grade(item.score);
 holder.dataset.selectedIndex=String(idx);
 let line=svg.querySelector('.dp908-cursor-line');
 if(!line){line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('class','dp908-cursor-line');line.setAttribute('stroke','#3677ab');line.setAttribute('stroke-width','1.5');line.setAttribute('stroke-dasharray','4 3');line.setAttribute('pointer-events','none');svg.appendChild(line);}
 const vx=30+(360-30-12)*idx/Math.max(1,pts.length-1);
 line.setAttribute('x1',vx);line.setAttribute('x2',vx);line.setAttribute('y1',15);line.setAttribute('y2',119);
}
for(const evName of ['pointermove','pointerdown','click'])document.addEventListener(evName,event=>{
 const holder=event.target.closest?.('.dp908-daily-inspector');if(holder)inspectDaily(holder,event);
},{passive:true});
// Sleep axis and green/grey stripes share the same 32 half-hour bins and the same parent.
document.addEventListener('pointerover',ev=>{
 const target=ev.target.closest?.('.dp908-synced-sleep .sleep-date-timeline button[data-slot]');
 if(!target)return;
 const parent=target.closest('.dp908-synced-sleep');if(parent)dpSyncSleepSlot(parent,Number(target.dataset.slot),true);
});
function calmEvidence(){
 if(state.tab!=='deep'||Number(state.deepType)!==2||state.detail)return;
 const root=document.querySelector('.dp-owner-deep')||document.querySelector('.app-main');if(!root)return;
 const cards=root.querySelectorAll('.dp901-metric-card,.dp903-metric-card');const card=[...cards].find(c=>/放鬆與平穩度|放松与平稳度|Rest\s*&\s*steadiness/i.test(c.querySelector('h3')?.textContent||''));if(!card)return;
 const days=state.range===1?1:[7,30].includes(Number(state.range))?Number(state.range):7;
 let rows=state.range===1?demoRecords(state.dog).filter(r=>r.date===deepChosenDate()).map(r=>({...r,idx:demoRecords(state.dog).findIndex(x=>x.date===r.date)})):dayRowsWithIndex(days);
 rows=rows.filter(r=>validDaySample(r,r.idx).valid&&dpOwnerDayScores(r,true).energyActivity!==null);
 const mean=k=>{const a=rows.map(r=>Number(r[k])).filter(Number.isFinite);return a.length?a.reduce((s,x)=>s+x,0)/a.length:null;};
 const rm=mean('rmssd'),sd=mean('sdnn');if(rm===null||sd===null)return;
 const b=document.createElement('p');b.className='dp908-calm-evidence';
 b.textContent=state.lang==='en'?`From the same valid days: RMSSD ${rm.toFixed(1)} ms · SDNN ${sd.toFixed(1)} ms. The steadiness score reflects HRV and beat-interval patterns, not random chart values.`:state.lang==='zh'?`同批有效数据：RMSSD ${rm.toFixed(1)} ms · SDNN ${sd.toFixed(1)} ms。放松与平稳度与心搏间隔和 HRV 数据关联。`:`同批有效資料：RMSSD ${rm.toFixed(1)} ms · SDNN ${sd.toFixed(1)} ms。放鬆與平穩度與心搏間隔及 HRV 關聯。`;
 card.append(b);
}
function cleanupUi(){
 const root=document.getElementById('app');statusLabels(root);statusLabels(document.getElementById('overlay-root'));
 calmEvidence();
}
const oldRender=render;
render=function(reset=false){oldRender(reset);cleanupUi();};
const oldModal=renderModal;
renderModal=function(){oldModal();statusLabels(document.getElementById('overlay-root'));};
// Keep startup deferred until all layers have initialized.
try{render(true)}catch(err){console.error('DeepPet V9.08 startup failed',err);}
})();
