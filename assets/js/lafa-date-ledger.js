/* DeepPet LAFA V10.139: the single-source day ledger.
   No cross-day fallback; no changes to other pets' scores or templates.
   7/30 day UI uses the exact same per-date records as Day and detail. */
(function(root){'use strict';
const calc=root.DeepPetMiloAdaptiveScores;if(!calc||typeof render!=='function')return;
const $=(s,r=document)=>r?.querySelector(s),$$=(s,r=document)=>Array.from(r?.querySelectorAll(s)||[]);
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const isLafa=()=>state.dog===0&&!state.emptyPreview&&!((typeof selectedBlank==='function')&&selectedBlank());
const L=(z,e,ja,ko)=>state.lang==='en'?e:state.lang==='ja'?(ja??e):state.lang==='ko'?(ko??e):state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(z):z;
// Same native calendar structure, built from dates alone. No gallery-pet render or data access.
function calendarShell(kind,range,end){
 const anchor=/^\d{4}-\d{2}-\d{2}$/.test(end||'')&&Number.isFinite(Date.parse(end+'T12:00:00Z'))?end:iso(localDate());
 const dates=Array.from({length:range},(_,i)=>new Date(Date.parse(anchor+'T12:00:00Z')-(range-1-i)*86400000).toISOString().slice(0,10));
 const blank='<span class="dp905-cal-empty" aria-hidden="true"></span>'.repeat((new Date(dates[0]+'T12:00:00Z').getUTCDay()+6)%7);
 const cells=dates.map(d=>`<button class="dp905-cal-day dp908-solid-day none" data-action="dp905-date-open" data-kind="${kind}" data-date="${d}" data-score="" title="${d}" aria-label="${d}"><small>${d.slice(5,7)}/${d.slice(8)}</small><strong>${d.slice(8)}</strong><span class="dp908-day-mark" aria-hidden="true">—</span></button>`).join('');
 const legend=[['normal',L('健康','Healthy','健康','건강')],['light',L('低風險','Mild','低リスク','낮은 위험')],['medium',L('中風險','Moderate','中リスク','중간 위험')],['high',L('高風險','Risk','高リスク','높은 위험')]].map(([k,v])=>`<span><i class="${k}"></i>${v}</span>`).join('');
 return `<section class="card dp905-calendar-panel dp908-calendar-panel"><div class="dp905-cal-head"><h3>${L('逐日查看','Daily review','日別確認','일별 확인')}</h3><small>N/A</small></div><p class="dp905-cal-help"></p><div class="dp905-calendar"><div class="dp905-weekdays">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(w=>`<span>${w}</span>`).join('')}</div><div class="dp905-calendar-grid">${blank}${cells}</div></div><div class="dp905-calendar-legend dp908-four-legend">${legend}</div><p class="dp905-sim-note"></p></section>`;
}
root.DeepPetLafaCalendarShell=calendarShell;
const color=v=>v>=90?'normal':v>=80?'light':v>=60?'medium':'high';
const mapMetric={heart:'heart',breath:'breath',sleep:'sleep',energy:'energy',recovery:'recovery',calm:'calm',hrv:'hrv',stable:'stable',cardio:'cardio',activityRecovery:'activityRecovery'};
function rawAt(date,metric){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return null;const v=calc.dayScores(date)[mapMetric[metric]||metric];return v&&v.coverage?.observedMin>0?v:null;
}
function realAt(date,metric){if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return null;
 const v=calc.dayScores(date)[mapMetric[metric]||metric];
 return v&&finite(v.score)&&v.coverage?.observedMin>0?v:null;
}
// Map weekly/monthly calendar dates to the exact date in the user-selected row.
function calendar(page){const cells=$$('[data-action="dp905-date-open"][data-date]',page);
 if(!cells.length)return;
 const anchor=state.deepSelectedDate;
 if([7,30].includes(Number(state.range))&&/^\d{4}-\d{2}-\d{2}$/.test(anchor||'')){
  const end=new Date(anchor+'T12:00:00Z').getTime();
  cells.forEach((el,i)=>{const day=new Date(end-(cells.length-1-i)*86400000).toISOString().slice(0,10);el.dataset.date=day;const num=$(':scope>strong',el);if(num)num.textContent=day.slice(8);});
  const grid=cells[0].parentElement;$$('.dp905-cal-empty',grid).forEach(el=>el.remove());
  const first=new Date(cells[0].dataset.date+'T12:00:00Z');const blanks=(first.getUTCDay()+6)%7;
  for(let i=0;i<blanks;i++){const el=document.createElement('span');el.className='dp905-cal-empty';el.setAttribute('aria-hidden','true');grid.prepend(el);}
 }
 let withData=0;for(const el of cells){const day=el.dataset.date,kind=el.dataset.kind;
  const metric=mapMetric[kind]||kind,s=realAt(day,metric)?.score,raw=rawAt(day,metric);
  if(raw)withData++;
  el.classList.remove('none','normal','light','medium','high');el.classList.add(finite(s)?color(s):'none');
  el.dataset.score=finite(s)?String(s):'';
  const dayName=day.slice(5).replace('-','/'),sm=$(':scope>small',el),mark=$('.dp908-day-mark',el);
  if(sm)sm.textContent=dayName;
  if(mark)mark.textContent=finite(s)?(s>=90?'✓':'•'):(raw?'•':'—');
  const badge=finite(s)?s+'/100':(raw?L('有波形資料，分數待核對','Waveform evidence, score not qualified','波形あり、スコア未確定','파형 있음, 점수 미확정'):L('無資料','No data','データなし','데이터 없음'));
  if(raw&&!finite(s))el.classList.add('dp-lafa-measured-no-score');else el.classList.remove('dp-lafa-measured-no-score');
  el.title=day+' · '+badge;el.setAttribute('aria-label',day+' · '+badge);
  // Remove the original gallery event marker; only recorded events may be shown.
  $$('.dp911-calendar-flag',el).forEach(n=>n.remove());
 }
 const area=cells[0].closest('.dp905-calendar-panel');if(area){
  const head=$('.dp905-cal-head small',area);if(head)head.textContent=L(`${withData} 天有量測紀錄（共 ${cells.length} 天）`,`${withData} recorded days of ${cells.length}`,`${cells.length}日中${withData}日に記録あり`,`${cells.length}일 중 ${withData}일 기록 있음`);
  const note=$('.dp905-cal-help',area);if(note)note.textContent=L('只按該日的資料顯示分數；空白日期不沿用其他日期。點選日期查看詳情。','Scores only for the exact recorded date. Empty days are not backfilled. Select a date to inspect.','各日の記録のみで評価します。日付を選択して詳細を確認できます。','해당 날짜의 기록으로만 평가합니다. 날짜를 선택하여 상세 내용을 확인하세요.');
  const sim=$('.dp905-sim-note',area);if(sim)sim.textContent=L('每一天的分數、圖表和詳細數據採用同一日期的資料。','Each day uses its own source for score, chart and detail.','スコア・グラフ・詳細は同じ日付のデータを使用します。','점수, 그래프 및 상세 정보는 같은 날짜의 데이터를 사용합니다.');
 }
}
function chronology(){const current=/^\d{4}-\d{2}-\d{2}$/.test(state.deepSelectedDate||'')?state.deepSelectedDate:((typeof iso==='function'&&typeof localDate==='function')?iso(localDate()):String(calc.dates.at(-1)));
 const n=Number(state.range);if(![7,30].includes(n))return;
 // Preserve existing charts, inspector cards and native dimensions; replace only
 // plotted values and hover provenance, NEVER a fixture-derived curve.
 $$('.app-main .dp-vital-trend .dp-chart-inspector').forEach(ins=>{
  const svg=$('svg',ins);if(!svg)return;
  const raw=(ins.getAttribute('aria-label')||svg.getAttribute('aria-label')||'').toLowerCase();
  const metric=/hrv/.test(raw)?'hrv':/rhythm|stable/.test(raw)?'stable':/breath|respirat/.test(raw)?'breath':/heart|rate/.test(raw)?'heart':/recover/.test(raw)?'recovery':/calm|rest/.test(raw)?'calm':/activ|energy/.test(raw)?'energy':state.deepType===0?'cardio':'activityRecovery';
  const start=new Date(current+'T12:00:00Z').getTime(),dates=Array.from({length:n},(_,i)=>new Date(start-(n-1-i)*86400000).toISOString().slice(0,10));
  const values=dates.map(d=>realAt(d,metric)?.score??null);
  const W=350,H=166,lf=38,rt=346,top=12,bt=133;let last=null,paths=[],dots=[];
  const x=i=>lf+(rt-lf)*i/Math.max(1,n-1),y=v=>bt-(bt-top)*v/100;
  values.forEach((v,i)=>{if(!finite(v)){last=null;return;}const X=x(i).toFixed(2),Y=y(v).toFixed(2);
   paths.push((last===i-1?'L':'M')+X+' '+Y);last=i;
   dots.push(`<circle data-lafa-date="${dates[i]}" data-lafa-metric="${metric}" cx="${X}" cy="${Y}" r="4.3" fill="${state.deepType===0?'#cf6684':'#4387dc'}" tabindex="0" role="button"><title>${dates[i]} · ${v}/100</title></circle>`);
  });
  const guides=[0,50,100].map(v=>`<line x1="${lf}" y1="${y(v)}" x2="${rt}" y2="${y(v)}" stroke="#e9eaf0"/><text x="${lf-5}" y="${y(v)+4}" text-anchor="end" font-size="10" fill="#8790a3">${v}</text>`).join('');
  const at=[0,Math.floor((n-1)/2),n-1].map((i,j)=>`<text x="${x(i)}" y="159" font-size="9.5" fill="#8590a1" text-anchor="${j===0?'start':j===2?'end':'middle'}">${dates[i].slice(5).replace('-','/')}</text>`).join('');
  svg.innerHTML=guides+(paths.length?`<path d="${paths.join(' ')}" stroke="${state.deepType===0?'#cf6684':'#4387dc'}" stroke-width="2.5" fill="none"/>${dots.join('')}`:`<text x="192" y="72" text-anchor="middle" fill="#89919d" font-size="13">N/A</text>`)+at;
  svg.dataset.lafaLedger=metric;ins.removeAttribute('data-inspector-id');
  const read=$('.dp-chart-current',ins);if(read)read.textContent=values.filter(finite).length?L(`${values.filter(finite).length} 條有資料日期`,`${values.filter(finite).length} recorded dates`,`${values.filter(finite).length}日分の記録`,`${values.filter(finite).length}일 기록`):'N/A';
 });
}
function periodSummary(){if(![7,30].includes(Number(state.range)))return;
 const d=/^\d{4}-\d{2}-\d{2}$/.test(state.deepSelectedDate||'')?state.deepSelectedDate:((typeof iso==='function'&&typeof localDate==='function')?iso(localDate()):calc.dates.at(-1));
 const n=Number(state.range),metric=state.deepType===0?'cardio':state.deepType===1?'sleep':'activityRecovery';
 const period=calc.period(d,n,metric),cnt=period.qualifiedDays;
 const quality=$('.app-main .dp-range-quality');if(quality)quality.textContent=L(`有分數 ${cnt}/${n} 日；達觀測門檻 ${period.fullEvidenceDays} 日。`,`Scored ${cnt}/${n} days; ${period.fullEvidenceDays} meet coverage criteria.`,`得点あり ${cnt}/${n}日、観測基準を満たす日 ${period.fullEvidenceDays}日。`,`점수 있음 ${cnt}/${n}일, 관측 기준 충족 ${period.fullEvidenceDays}일.`);
 const periodNotice=$('.app-main .dp905-sleep-summary .dp905-sleep-head p');if(periodNotice)periodNotice.textContent=L(`有分數 ${cnt}/${n} 日；達觀測門檻 ${period.fullEvidenceDays} 日；期間分數須通過有效日門檻。`,`Scored ${cnt}/${n} days; ${period.fullEvidenceDays} meet coverage criteria; period score requires sufficient eligible days.`,`得点あり ${cnt}/${n}日、観測基準を満たす日 ${period.fullEvidenceDays}日。期間スコアには十分な有効日数が必要です。`,`점수 있음 ${cnt}/${n}일, 관측 기준 충족 ${period.fullEvidenceDays}일. 기간 점수에는 충분한 유효 일수가 필요합니다.`);
}
// Reuse the EXISTING scored-pet calendar template for the two period pages
// that previously lacked a selectable per-day calendar. No new CSS/visual
// component and no changes to the other pets' pages or fixture scores.
function ensurePeriodCalendar(){
 if(state.detail||![7,30].includes(Number(state.range))||state.deepType===1)return;
 const main=$('.app-main .dp-owner-deep');if(!main||$('.dp905-calendar-panel',main)||typeof deepView!=='function')return;
 const kind=state.deepType===0?'cardio':'activityRecovery';
 main.insertAdjacentHTML('beforeend',calendarShell(kind,Number(state.range),state.deepSelectedDate));
}
function validContext(){
 if(!isLafa()||state.tab!=='deep')return;
 const day=state.detail==='dp90-waveform'?(state.dp90WaveDate||state.deepSelectedDate):state.detail==='dp905-sleep-day'?(state.dp905ChosenDate||state.deepSelectedDate):state.detail==='dp905-energy-day'?(state.dp936EnergyDate||state.dp905ChosenDate||state.deepSelectedDate):state.deepSelectedDate;
 if(!state.detail&&Number(state.range)===1&&/^\d{4}-\d{2}-\d{2}$/.test(day||'')){
  // The same day ledger governs the explanation, not just the numeric ring.
  if(state.deepType===2){
   const names=['energy','recovery','calm'];
   $$('.app-main .dp901-metric-card').forEach((card,i)=>{if(!rawAt(day,names[i])){
    $$(':scope>p',card).forEach(e=>{if(!e.classList.contains('dp-observation-note'))e.textContent='';});
   }});
   if(!rawAt(day,'activityRecovery'))$$('.app-main .dp901-health-score>p').forEach(el=>el.textContent='');
  }
  if(state.deepType===1&&!rawAt(day,'sleep')){
   $$('.app-main p').filter(el=>/只有白天|白天心率|daytime heart|night .*missing|this time only/.test(el.textContent||'')).forEach(el=>el.textContent='');
  }
  if(state.deepType===0&&!rawAt(day,'cardio')){
   $$('.app-main .dp903-overview-copy>p:not(.dp-observation-note)').forEach(el=>el.textContent='');
  }
  const metric=state.deepType===0?'cardio':state.deepType===1?'sleep':'activityRecovery';
  if(!realAt(day,metric)){
   // Do not show a fixture's health conclusion without same-day evidence.
   const page=$('.app-main');
   $$('.dp903-overview-copy>p:not(.dp-observation-note), .dp901-overall-copy>p:not(.dp-observation-note), .dp-owner-status-summary',page).forEach(el=>{if(!el.closest('.dp-observation-note'))el.textContent='';});
  }
 }
 ensurePeriodCalendar();
 calendar($('.app-main'));
 if(!state.detail){
  if(Number(state.range)===1){$$('.app-main .dp-observation-grade').forEach(el=>{
   const wrap=el.closest('.dp903-score-col,.dp901-score-col,.dp-observation-scored');
   const raw=wrap?.querySelector('.dp-status-score')?.dataset.score;
   const num=raw!==undefined&&raw!==''?Number(raw):NaN;
   if(Number.isFinite(num)){
    const zh=num>=90?'健康':num>=80?'輕度風險':num>=60?'中度風險':'高度風險';
    const en=num>=90?'Healthy':num>=80?'Mild risk':num>=60?'Moderate risk':'High risk';
    el.textContent=L(zh,en,num>=90?'健康':num>=80?'軽度リスク':num>=60?'中度リスク':'高リスク',num>=90?'건강':num>=80?'낮은 위험':num>=60?'중간 위험':'높은 위험');
   }else el.textContent='';
  });}
  periodSummary();chronology();
  if([7,30].includes(Number(state.range))){
   const n=Number(state.range), now=/^\d{4}-\d{2}-\d{2}$/.test(day||'')?day:((typeof iso==='function'&&typeof localDate==='function')?iso(localDate()):calc.dates.at(-1)),anchor=new Date(now+'T12:00:00Z').getTime();
   const days=Array.from({length:n},(_,i)=>new Date(anchor-(n-1-i)*86400000).toISOString().slice(0,10));
   const obs=(key)=>days.filter(d=>rawAt(d,key)).length;
   if(state.deepType===0){
    $$('.app-main p').filter(el=>/本次實測中位數|本段心率中位數|本段呼吸中位數|最近.*?變化|Recorded median/.test(el.textContent||'')).forEach(el=>{el.textContent=L(`本期間心跳 ${obs('heart')} 天、呼吸 ${obs('breath')} 天有實測；請選擇具體日期查看當天波形和高低點。`,`Recorded heart ${obs('heart')} days, breathing ${obs('breath')} days; inspect each recorded date for traces.`,`心拍 ${obs('heart')}日、呼吸 ${obs('breath')}日の記録があります。日付を選択して波形を確認できます。`,`심박 ${obs('heart')}일, 호흡 ${obs('breath')}일 기록이 있습니다. 날짜를 선택하여 파형을 확인하세요.`);});
   }
   if(state.deepType===1){const text=$('.app-main .dp905-sleep-summary>p');if(text)text.textContent=L(`本期間有 ${obs('sleep')} 個日期的休息觀測紀錄；期間分數須通過有效日門檻。`,`There are ${obs('sleep')} dates with rest observations; a period score requires sufficient eligible days.`,`休息観測の記録が${obs('sleep')}日あります。期間スコアには十分な有効日数が必要です。`,`휴식 관측 기록 ${obs('sleep')}일. 기간 점수에는 충분한 유효 일수가 필요합니다.`);}
   if(state.deepType===2){
    $$('.app-main .dp901-metric-card>p').forEach(e=>e.textContent='');
   }
  }
 }
 if(state.detail==='dp90-waveform'&&state.dp905WaveMode!=='day'&&[7,30].includes(Number(state.dp905WaveRange))){
  // Period wave inspection is a native calendar, not a single-day waveform.
  const lead=$('.dp905-period-lead p');if(lead){const cells=$$('[data-action="dp905-date-open"]');const available=cells.filter(x=>!!rawAt(x.dataset.date,x.dataset.kind)).length;
   lead.textContent=L(`本期間有 ${available} 條日期紀錄。選擇有資料的一天，再查看全天波形和高低點。`,`There are ${available} recorded dates. Choose one to inspect its full-day waveform and extrema.`,`${available}日分の記録があります。日付を選択して波形と変化点を確認できます。`,`${available}일 기록이 있습니다. 날짜를 선택하여 하루 파형과 변화 지점을 확인하세요.`);
  }
 }
}
const earlier=render;render=function(reset=false){earlier(reset);try{validContext();}catch(err){console.error('LAFA date ledger consistency',err);}};
// Unit terminology only in history/calendar count components (all pets);
// never rewrite location names or other uses of 「處」.
function fixUnits(){for(const el of $$('.dp905-calendar-panel .dp905-cal-head small,.dp905-period-lead p,.dp905-wave-period .dp905-cal-head small')){
 const v=el.textContent||'';el.textContent=v.replace(/(\d+|兩)\s*處(?=\s|資料|紀錄|記錄|$)/g,'$1 條').replace(/(\d+|两)\s*处(?=\s|数据|记录|$)/g,'$1 条');
}}
const prevRender=render;render=function(reset=false){prevRender(reset);try{fixUnits();}catch(err){console.error('Deep history unit',err);}};
document.addEventListener('mouseover',ev=>{const dot=ev.target?.closest?.('circle[data-lafa-date]');if(!dot||!isLafa())return;
 const text=$('.dp-chart-current',dot.closest('.dp-chart-inspector'));if(text)text.textContent=dot.dataset.lafaDate+' · '+dot.querySelector('title')?.textContent.split(' · ')[1];},true);
document.addEventListener('click',ev=>{const dot=ev.target?.closest?.('circle[data-lafa-date]');if(!dot||!isLafa())return;ev.preventDefault();ev.stopImmediatePropagation();state.deepSelectedDate=dot.dataset.lafaDate;state.range=1;state.detail=null;render(true);},true);
root.DeepPetLafaDateLedger=Object.freeze({version:'v10.139-strict-date-no-fallback',realAt:(date,key)=>realAt(date,key)?.score??null,periodUnlock:[7,30],otherPetsScoresUntouched:true});
})(window);
