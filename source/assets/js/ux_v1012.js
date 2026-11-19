/* DeepPet V10.12 — verified record navigation, report evidence, accessibility. */
(function(root){'use strict';
 const L=(zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

 // Only the archive for recorded care history opens the full-record page.
 // The separately located upcoming-care <details> must continue expanding
 // in-place, and never navigate to unrelated historical records.
 function routeRecentCare(app){
  if(state.tab!=='health'||state.detail)return;
  for(const button of app.querySelectorAll('.dp992-timeline .dp992-toggle')){
   button.removeAttribute('data-dp992');
   button.setAttribute('data-action','dp1011-care-all-open');
   button.textContent='More';
   button.setAttribute('aria-label',L('查看近期健康管理全部紀錄','See all recent health-care records','최근 건강 기록 전체 보기','最近の健康管理記録をすべて表示'));
  }
  for(const summary of app.querySelectorAll('.dp-upcoming-care .dp999-more>summary')){
   const opened=!!summary.parentElement?.open;
   summary.textContent=opened?L('收起','Show less','접기','閉じる'):'More';
   summary.setAttribute('aria-label',opened?
    L('收起近期健康提醒','Collapse upcoming health reminders','예정된 건강 알림 접기','今後のケア通知を閉じる'):
    L('展開近期健康提醒','Expand upcoming health reminders','예정된 건강 알림 펼치기','今後のケア通知を展開'));
  }
 }

 // The saved report is also rendered into a new print/PDF window, so its
 // evidence annotation must be in HTML generation, NOT just post-render DOM.
 const previousVetContent=vetReportContent;
 vetReportContent=function(d){
  let html=previousVetContent(d);
  if(d.sensor&&Array.isArray(d.usable)){
   const excluded=d.usable.filter(x=>!x.valid);
   if(excluded.length){
    const detail=excluded.map(x=>{
     const date=String(x.record?.date||'');
     const idx=x.record?.idx;
     const quality=Number.isInteger(idx)?validDaySample(x.record,idx):null;
     const reasons=(quality?.reasons||[]).map(qualityIssueName).filter(Boolean);
     return `${date}${reasons.length?' ('+reasons.join('、')+')':''}`;
    }).join('；');
    const english=excluded.map(x=>esc(x.record?.date||'')).join(', ');
    const note=L(`無效／缺測日期：${detail}。這些日期不參與平均，亦不以推估值填補。`,
     `Excluded or missing dates: ${english}. These days are not averaged or filled with estimated values.`,
     `측정 제외 날짜: ${english}. 이 날짜는 평균에서 제외하며 추정값으로 채우지 않습니다.`,
     `欠測・除外日：${english}。平均に含めず推定値で補完しません。`);
    html=html.replace('</p></section><section class="vet-report-section vet-trend-section">',
     `<br/><span class="dp1012-report-exclusions">${esc(note)}</span></p></section><section class="vet-report-section vet-trend-section">`);
   }
  }

  // Original report used rhythmData().values.slice() with no valid-day filter;
  // invalid signal days and unavailable real measurements could show 0/100
  // or an inflated average. Align by the original calendar index and never
  // include a score from a quality-excluded day.
  const title=label3('身體節奏指標摘要','Body rhythm summary','몸 리듬 요약');
  const start=`<section class="vet-report-section"><h2>${title}</h2>`;
  const beginning=html.indexOf(start);
  if(beginning!==-1){
   const end=html.indexOf('</section>',beginning+start.length);
   if(end!==-1){
    const values=Array.isArray(rhythmData()?.values)?rhythmData().values:[];
    const valid=(d.usable||[]).filter(item=>item.valid&&Number.isInteger(item.record?.idx));
    const parts=[
     ['calm',L('放鬆與平穩度','Calmness and steadiness','편안함과 안정감','落ち着きと安定度')],
     ['stable',L('心搏節奏穩定度','Heartbeat rhythm stability','심박 리듬 안정도','心拍リズムの安定度')]
    ];
    const cards=parts.map(([key,name])=>{
     const observed=valid.map(item=>({date:item.record.date,value:rhythmPositiveValue(key,values[item.record.idx])}))
      .filter(item=>typeof item.value==='number'&&Number.isFinite(item.value));
     const mean=observed.length?Math.round(observed.reduce((sum,item)=>sum+item.value,0)/observed.length):null;
     const time=observed.length?`${esc(observed[0].date)} – ${esc(observed.at(-1).date)}`:L('尚無有效紀錄','No valid readings','유효 측정 없음','有効な記録なし');
     return `<div><small>${esc(name)}</small><strong>${mean===null?'—':mean}<em> / 100</em></strong><small class="dp1012-evidence-window">${time}<br/>${observed.length} ${L('個有效日','valid days','유효일','有効日')}</small></div>`;
    }).join('');
    const foot=L('僅使用該日期品質合格且能計算分數的紀錄；沒有有效數據就不顯示分數。',
     'Only quality-passed, scoreable days contribute. No valid readings means no score.',
     '품질 검사를 통과하고 점수를 계산할 수 있는 날짜만 반영합니다.',
     '品質検査済みで得点化できる日だけを集計します。');
    const replacement=`<section class="vet-report-section"><h2>${L('生理節奏指標摘要','Physiological rhythm summary','생리 리듬 요약','生理リズム指標の概要')}</h2><div class="vet-stat-grid">${cards}</div><p class="vet-method-note">${foot}</p></section>`;
    html=html.slice(0,beginning)+replacement+html.slice(end+'</section>'.length);
   }
  }
  // The chart renderer really breaks the line at missing dates. The old
  // report claimed that it drew across gaps; correct the method statement.
  const inaccurate=[
   '每張曲線依日期順序連接有效量測點；灰色短刻痕代表缺測／排除日期，跨越該日期的連線只是視覺連接，不代表當日有量測。',
   'Each chart connects valid observations in date order. Gray ticks mark excluded days; connecting across them is visual only, not an inferred measurement.',
   '차트 선은 날짜순 유효 관측값만 연결합니다. 회색 표시는 무효 날짜이며 선이 지나가도 측정값을 추정하지 않습니다.'
  ];
  const accurate=[
   '每張曲線只連接相鄰的有效日期，遇到缺測或品質排除日便斷線；灰色短刻痕標示排除日期。',
   'Chart lines join only consecutive valid days and break across missing or excluded dates; gray ticks mark exclusions.',
   '차트 선은 연속된 유효 날짜만 연결하며 누락·제외 날짜에서는 끊깁니다.'
  ];
  for(let i=0;i<inaccurate.length;i++)html=html.replace(inaccurate[i],accurate[i]);
  return html;
 };

 // Keyboard-operated score charts, including date and exact integer score.
 // Existing pointer and touch inspection remains available unchanged.
 function keyboardScorePlots(app){
  if(state.tab!=='health'||state.detail!=='summary')return;
  for(const chart of app.querySelectorAll('.dp850-curve svg[tabindex]')){
   const circles=[...chart.querySelectorAll('circle')].filter(c=>c.querySelector('title'));
   if(!circles.length)continue;
   chart.setAttribute('aria-keyshortcuts','ArrowLeft ArrowRight Home End');
   chart.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    let index=Number(chart.dataset.dp1012Selected);
    if(!Number.isInteger(index)||index<0)index=circles.length-1;
    if(event.key==='ArrowLeft')index=Math.max(0,index-1);
    if(event.key==='ArrowRight')index=Math.min(circles.length-1,index+1);
    if(event.key==='Home')index=0;
    if(event.key==='End')index=circles.length-1;
    chart.dataset.dp1012Selected=String(index);
    const point=circles[index],tip=chart.closest('.dp850-curve')?.querySelector('.dp1011-curve-tip');
    if(!tip)return;
    const [date,value]=(point.querySelector('title')?.textContent||'').split(' · ');
    if(!date||!value)return;
    tip.textContent=`${date}　${value} / 100`;
    tip.style.display='block';
    const box=chart.viewBox.baseVal;
    tip.style.left=`${Math.min(85,Math.max(15,100*(point.cx.baseVal.value-box.x)/Math.max(1,box.width)))}%`;
   });
  }
 }

 const priorRender=render;
 render=function(reset=false){
  priorRender(reset);
  const app=document.getElementById('app');if(!app)return;
  routeRecentCare(app);keyboardScorePlots(app);
  app.querySelectorAll('.app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.12');
 };
 root.DeepPetUX1012={version:'10.12',routeRecentCare,keyboardScorePlots};
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.12',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'upcoming-more-is-native-expansion','history-more-opens-record-archive',
  'report-gap-dates-in-print','quality-filtered-rhythm-mean','keyboard-score-points']};
})(window);
