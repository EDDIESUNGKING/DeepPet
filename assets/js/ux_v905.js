/* DeepPet V9.05: three-scope analysis navigation, inspectable timelines and care UX.
   All example times/flags are from fictional demo trends, not medical detection. */
(function(){
'use strict';
const T=(zhT,zh,en,ko,ja)=>state.lang==='zh'?zh:state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?(ja||en):zhT;
const e=x=>typeof esc==='function'?esc(String(x??'')):String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const vnum=n=>n===null||n===undefined||!Number.isFinite(Number(n))?null:Number(n);
const val=(n,d=0)=>vnum(n)===null?'—':Number(n).toFixed(d);
const avg=a=>a.length?a.reduce((s,n)=>s+n,0)/a.length:null;
const dateTitle=date=>date?.slice(5).replace('-','/')||'—';
const toMinute=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const scores=()=>({heart:0,sleep:1,energy:2});
const isValid=r=>!!r&&validDaySample(r,r.idx).valid;
const modalWarning=()=>T('資料為互動示範，不代表真實設備已驗證疾病異常。','数据为交互演示，不代表真实设备已验证疾病异常。','Interactive demo values; these are not validated clinical alerts.','대화형 데모이며 임상적 진단이 아닙니다.','対話型デモであり、臨床診断ではありません。');
function rowFor(date){const i=demoRecords(state.dog).findIndex(x=>x.date===date);return i<0?null:{...demoRecords(state.dog)[i],idx:i};}
function dayScore(row,metric){if(!isValid(row))return null;const s=dpOwnerDayScores(row,true);if(metric==='heart')return dpOwnerVitalScore(row,'heart');if(metric==='breath')return dpOwnerVitalScore(row,'breath');if(metric==='sleep')return s.sleep;if(metric==='energy')return s.energy;return null;}
function dayGrade(row,metric){const score=dayScore(row,metric);return score===null?'none':score>=90?'normal':score>=80?'light':score>=60?'medium':'high';}
function metricLabel(metric){return ({heart:T('心跳狀況','心跳状况','Heart rate','심박','心拍'),breath:T('呼吸狀況','呼吸状况','Breathing','호흡','呼吸'),sleep:T('睡眠狀態','睡眠状态','Sleep & rest','수면','睡眠'),energy:T('精力情況','精力情况','Energy status','활력','活力')})[metric]||metric;}
const ratingText=score=>score===null?T('資料不足','数据不足','Insufficient data','자료 부족','データ不足'):score>=90?T('健康','健康','Healthy','건강','健康'):score>=80?T('低風險','低风险','Mild','낮은 위험','低リスク'):score>=60?T('中風險','中风险','Moderate','중간 위험','中リスク'):T('高風險','高风险','Risk','높은 위험','高リスク');
function trendEvents(kind, date){
 const series=dpSignals(date,[kind])?.[kind];if(!Array.isArray(series)||!series.length)return [];
 const existing=dpEventsFor(date).filter(x=>Number.isFinite(x.minute)).map(x=>({minute:Math.max(0,Math.min(1439,Math.floor(x.minute))),priority:Number(x.score)||0}));
 const peak=dp66DemoPeak(date,kind),str=peak?.time;
 if(/^\d{2}:\d{2}$/.test(str||''))existing.push({minute:Math.min(1439,Number(str.slice(0,2))*60+Number(str.slice(3))),priority:999});
 // Marker targets are demo change candidates; always retain the exact reading at that minute.
 const selected=[];
 for(const p of existing.sort((a,b)=>b.priority-a.priority)){
   if(selected.every(s=>Math.abs(s.minute-p.minute)>65))selected.push(p);
   if(selected.length>=3)break;
 }
 if(!selected.length)selected.push({minute:720,priority:0});
 return selected.sort((a,b)=>a.minute-b.minute);
}
function yChart(raw,events,minute,kind,whole=false){
 const a=whole?0:Math.max(0,minute-30),b=whole?1439:Math.min(raw.length-1,minute+30),w=360,h=178,l=36,r=12,top=17,bot=35;
 const sample=whole?Array.from({length:241},(_,i)=>({m:Math.min(b,i*6),v:raw[Math.min(b,i*6)]})):raw.slice(a,b+1).map((v,i)=>({m:a+i,v}));
 const nums=sample.map(p=>p.v).filter(Number.isFinite);if(!nums.length)return '';
 const lo=Math.floor((Math.min(...nums)-3)/5)*5,hi=Math.ceil((Math.max(...nums)+3)/5)*5;
 const x=m=>l+(w-l-r)*(m-a)/Math.max(1,b-a),y=q=>top+(hi-q)*(h-top-bot)/Math.max(1,hi-lo);
 const curve=sample.map((p,i)=>(i?'L':'M')+x(p.m).toFixed(2)+','+y(p.v).toFixed(2)).join(' ');
 const ygrid=[0,.5,1].map(f=>`<line x1="${l}" x2="${w-r}" y1="${top+(h-top-bot)*f}" y2="${top+(h-top-bot)*f}" stroke="#e9edf4"/><text x="${l-6}" y="${top+(h-top-bot)*f+3}" text-anchor="end" fill="#8995a7" font-size="10">${val(hi-(hi-lo)*f,0)}</text>`).join('');
 const ticks=(whole?[0,360,720,1080,1439]:[a,Math.floor((a+b)/2),b]).map((m,i,arr)=>`<text x="${x(m)}" y="${h-10}" font-size="9.8" text-anchor="${i===0?'start':i===arr.length-1?'end':'middle'}" fill="#7f8ea3">${toMinute(m)}</text>`).join('');
 const markers=events.filter(p=>p.minute>=a&&p.minute<=b).map(p=>`<circle cx="${x(p.minute)}" cy="${y(raw[p.minute])}" r="${whole?8:12}" fill="#fff5f6" stroke="#e65c68" stroke-width="2.5"/><circle cx="${x(p.minute)}" cy="${y(raw[p.minute])}" r="3" fill="#e65c68"/>`).join('');
 return `<svg class="dp905-signal-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${e(metricLabel(kind))}">${ygrid}<path d="${curve}" fill="none" stroke="${kind==='heart'?'#bd5073':kind==='breath'?'#4388bf':'#497dbb'}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>${markers}${ticks}</svg>`;
}
function inspectChart(svg,metric,date,start,end,unit){
 return `<div class="dp908-inspect-chart" data-metric="${metric}" data-date="${date}" data-start="${start}" data-end="${end}" data-unit="${e(unit)}" tabindex="0" role="group" aria-label="${e(metricLabel(metric))}">${svg}<div class="dp908-chart-readout" aria-live="polite">${T('移動滑鼠或點擊曲線，讀取當時時間與數值','移动鼠标或点击曲线，读取对应时间与数值','Hover or tap the chart to inspect the exact time and value','그래프에서 시간과 값을 확인하세요','グラフから時間と値を確認')}</div></div>`;
}
function panelTitle(n,title){return `<div class="dp905-section-title"><span>${n}</span><h3>${title}</h3></div>`;}
function detailBack(label=''){return `<header class="dp-independent-head"><button data-action="dp905-detail-back" aria-label="Back">←</button><b>${label}</b></header>`;}
function calendar(rows,metric){
 const list=rows.map(row=>({row,score:dayScore(row,metric)}));
 const flagged=list.filter(x=>x.score!==null&&x.score<90).length;
 const wd=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
 const first=list[0]?.row.date,weekday=first?((new Date(first+'T12:00:00').getDay()+6)%7):0;
 const blank=Array.from({length:weekday},()=>'<span class="dp905-cal-empty" aria-hidden="true"></span>').join('');
 const cells=list.map(({row,score})=>{
  const grade=dayGrade(row,metric),mark=score===null?'—':score>=90?'✓':'•';
  return `<button class="dp905-cal-day dp908-solid-day ${grade}" data-action="dp905-date-open" data-kind="${metric}" data-date="${row.date}" data-score="${score===null?'':score}" title="${row.date} ${ratingText(score)}${score===null?'':` ${score}/100`}" aria-label="${row.date} ${ratingText(score)} ${score===null?'':score+'/100'}"><small>${row.date.slice(5,7)}/${row.date.slice(8)}</small><strong>${row.date.slice(8)}</strong><span class="dp908-day-mark" aria-hidden="true">${mark}</span></button>`;
 }).join('');
 const legend=[['normal',T('健康','健康','Healthy','건강','健康')],['light',T('低風險','低风险','Mild','낮은 위험','低リスク')],['medium',T('中風險','中风险','Moderate','중간 위험','中リスク')],['high',T('高風險','高风险','Risk','높은 위험','高リスク')]].map(([k,label])=>`<span><i class="${k}"></i>${label}</span>`).join('');
 return `<section class="card dp905-calendar-panel dp908-calendar-panel"><div class="dp905-cal-head"><h3>${T('逐日查看','逐日查看','Daily review','일별 확인','日別確認')}</h3><small>${flagged} ${T('天需要回看','天需要回看','days flagged','일 주의','日間に確認')}</small></div><p class="dp905-cal-help">${T('整格顏色對應健康等級；點擊日期進入當日詳情。','整格颜色代表健康等级，点击日期查看当天详情。','Each date uses its full grade color. Select any day to open detailed readings.','각 날짜의 색상은 상태를 표시합니다.','色は健康状態を表し、日付を選択できます。')}</p><div class="dp905-calendar"><div class="dp905-weekdays">${wd.map(w=>`<span>${w}</span>`).join('')}</div><div class="dp905-calendar-grid">${blank}${cells}</div></div><div class="dp905-calendar-legend dp908-four-legend">${legend}</div><p class="dp905-sim-note">${modalWarning()}</p></section>`;
}
function wavePeriod(){
 const range=[7,30].includes(Number(state.range))?Number(state.range):7,metric=state.dp90WaveKind==='breath'?'breath':'heart';
 const rows=dayRowsWithIndex(range);const count=rows.filter(r=>{const s=dayScore(r,metric);return s!==null&&s<90}).length;
 return `<div class="app-pad dp905-page dp905-wave-period">${detailBack(metricLabel(metric)+' · '+range+T('天','天',' days','일','日'))}<section class="card dp905-period-lead"><h2>${range} ${T('天數據總覽','天数据总览','day overview','일 요약','日間の概要')}</h2><p>${T(`這 ${range} 天共有 ${count} 天出現值得回看的示範變化。請先選日期，再看全天曲線及具體時段。`,`这 ${range} 天有 ${count} 天出现值得回看的示范变化。先选择日期，再看全天曲线和具体时段。`,`${count} of the past ${range} days have demo changes worth reviewing. Choose a date for the full-day graph and zoomed interval.`,`${range}일 중 ${count}일에 변화가 표시됩니다.`,`${range}日中${count}日に確認項目があります。`)}</p></section>${calendar(rows,metric)}</div>`;
}
function dayDetail(metric,date){
 const row=rowFor(date),dataMetric=metric==='energy'?'activity':metric,raw=dpSignals(date,[dataMetric])?.[dataMetric];
 if(!isValid(row)||!Array.isArray(raw)||raw.length!==1440)return `<div class="app-pad dp905-page">${detailBack(metricLabel(metric))}<section class="card">${T('當日有效數據不足','当天有效数据不足','Insufficient data for this date','자료 부족','データ不足')}</section></div>`;
 const s=dayScore(row,metric),events=s!==null&&s<90?trendEvents(dataMetric,date):[],chosen=events.length?events[Math.max(0,Math.min(events.length-1,Number(state.dp905PickedEvent)||0))]:null,unit=metric==='heart'?'bpm':metric==='breath'?T('次／分','次／分','/min','회/분','回／分'):'%';
 const mean=avg(raw.filter(Number.isFinite)),list=events.map((p,i)=>`<button data-action="dp905-event-pick" data-index="${i}" class="dp905-event-button ${p.minute===chosen?.minute?'active':''}"><b>${toMinute(p.minute)}</b><small>${val(raw[p.minute],1)} ${unit}</small></button>`).join('');
 return `<div class="app-pad dp905-page">${detailBack(metricLabel(metric)+' · '+dateTitle(date))}<section class="card dp905-overview"><h2>${date} ${metricLabel(metric)}</h2><div class="dp905-day-stats"><span>${T('當日平均','当日平均','Daily mean','일 평균','日平均')} <b>${val(mean,1)} ${unit}</b></span><span>${T('值得回看','值得回看','Review points','확인 시간','確認箇所')} <b>${events.length}</b></span></div><p>${T('圖中紅圈為示範變化時段，並非臨床確診的異常。','图中红圈为示范变化时段，并非临床确诊的异常。','Red circles mark demo changes, not clinically confirmed anomalies.','빨간 원은 데모 변화입니다.','赤丸はデモの変化です。')}</p>${inspectChart(yChart(raw,events,chosen?.minute??720,dataMetric,true),metric,date,0,1439,unit)}</section>${chosen?`<section class="card dp905-zoom">${panelTitle('02',T('選擇需要放大的時段','选择需要放大的时段','Choose a time to zoom','확대 시간 선택','拡大する時間帯'))}<div class="dp905-event-row">${list}</div>${inspectChart(yChart(raw,events,chosen.minute,dataMetric,false),metric,date,Math.max(0,chosen.minute-30),Math.min(raw.length-1,chosen.minute+30),unit)}<div class="dp905-key-values"><div><small>${T('日期時間','日期时间','Exact time','일시','日時')}</small><b>${date} ${toMinute(chosen.minute)}</b></div><div><small>${metricLabel(metric)}</small><b>${val(raw[chosen.minute],1)} ${unit}</b></div><div><small>${T('當日參考均值','当日参考均值','Daily reference','일 기준','当日基準')}</small><b>${val(mean,1)} ${unit}</b></div></div><p class="dp905-sim-note">${T('以上為逐分鐘示範資料；真實項圈 SDK、偵測門檻與獸醫驗證尚未整合。','以上为逐分钟示范数据；真实项圈 SDK、检测阈值与兽医验证尚未整合。','Simulated minute readings, not sensor-validated event detection.','데모 자료입니다.','シミュレーションデータです.')}</p></section>`:`<section class="card dp905-no-event">${T('這一天沒有需優先標記的變化，全天趨勢仍可查看。','这一天没有需要优先标记的变化，全天趋势仍可查看。','No change is flagged for this day. The daily trend remains available.','이날은 표시할 주의 변화가 없습니다.','この日は注意すべき変化がありません。')}</section>`}</div>`;
}
function sleepPeriod(cp,days){
 const rows=dayRowsWithIndex(days).filter(r=>r);const valid=rows.filter(isValid),s=valid.map(r=>dpOwnerDayScores(r,true).sleep).filter(Number.isFinite),total=s.length?Math.round(avg(s)):null;
 const nights=valid.map(r=>dpNightSleepStats(r.idx));const mins=avg(nights.map(n=>n.minutes)),wakes=avg(nights.map(n=>n.wakes));
 return `<section class="card dp905-sleep-summary"><div class="dp905-sleep-head"><div><h2>${T('睡眠情況','睡眠情况','Sleep & rest','수면','睡眠')}</h2><p>${T('近期睡眠休息總結','近期睡眠休息总结','Period sleep overview','기간 수면 요약','期間睡眠の概要')}</p></div>${total===null?'<span>—</span>':dpDeepDottedScore(total,scoreScheme(total).color)}</div><p>${T(`最近 ${days} 天有效記錄 ${valid.length} 晚；平均休息 ${mins===null?'—':dpMinutesText(Math.round(mins))}，平均每晚中斷 ${val(wakes,1)} 次。`,`最近 ${days} 天有效记录 ${valid.length} 晚；平均休息 ${mins===null?'—':dpMinutesText(Math.round(mins))}，平均每晚中断 ${val(wakes,1)} 次。`,`Valid nights: ${valid.length}/${days}; average rest ${mins===null?'—':dpMinutesText(Math.round(mins))}, mean interruptions ${val(wakes,1)} per night.`,`유효한 밤 ${valid.length}일, 평균 휴식 ${val(mins,0)}분.`,`有効記録${valid.length}夜、平均休息${val(mins,0)}分。`)}</p></section>${calendar(rows,'sleep')}`;
}
function sleepDay(date){
 const row=rowFor(date);if(!row||!isValid(row))return `<div class="app-pad dp905-page">${detailBack(metricLabel('sleep'))}<section class="card">${T('有效記錄不足','有效记录不足','Insufficient valid data','자료 부족','データ不足')}</section></div>`;
 const stats=dpNightSleepStats(row.idx),s=dayScore(row,'sleep');
 return `<div class="app-pad dp905-page">${detailBack(metricLabel('sleep')+' · '+dateTitle(date))}<section class="card dp905-sleep-day"><div class="dp905-sleep-head"><div><h2>${date} ${metricLabel('sleep')}</h2><p>${ratingText(s)}</p></div>${dpDeepDottedScore(s,scoreScheme(s).color)}</div><div class="dp905-day-stats"><span>${T('睡眠與休息','睡眠与休息','Sleep & rest','수면·휴식','睡眠と休息')} <b>${dpMinutesText(stats.minutes)}</b></span><span>${T('夜間中斷','夜间中断','Interruptions','중단','中断')} <b>${stats.wakes}</b></span></div><h3>${T('當晚休息時間軸','当晚休息时间轴','Night timeline','야간 시간대','夜間の時間軸')}</h3><div class="dp-owner-sleep-timeline dp908-synced-sleep">${dpOwnerSleepWave(row)}${sleepMatrixDate(row.idx)}</div><p class="dp905-sim-note">${T('項圈動靜推估安靜休息，不能以此診斷深睡、REM 或疾病。','项圈动静估算安静休息，不能据此诊断深睡、REM 或疾病。','Rest inferred from movement; this does not establish true REM/deep sleep or a diagnosis.','움직임을 통한 휴식 추정입니다.','動静から休息を推定しています。')}</p></section></div>`;
}
function dailyTrend(rows,metric){
 const pts=rows.map(r=>({date:r.date,score:dayScore(r,metric)}));
 const W=360,H=150,L=30,R=12,Tp=15,B=31,x=i=>L+(W-L-R)*i/Math.max(1,pts.length-1),y=n=>Tp+(100-n)*(H-Tp-B)/100;
 const valid=pts.map((p,i)=>({...p,i})).filter(p=>p.score!==null);
 const poly=valid.map((p,j)=>(j===0?'M':'L')+x(p.i).toFixed(1)+','+y(p.score).toFixed(1)).join(' ');
 const yticks=[0,25,50,75,100].map(n=>`<line x1="${L}" x2="${W-R}" y1="${y(n)}" y2="${y(n)}" stroke="#e6ebf2"/><text x="${L-4}" y="${y(n)+3}" text-anchor="end" font-size="9" fill="#8c96a7">${n}</text>`).join('');
 const xticks=pts.map((p,i)=>i===0||i===pts.length-1||(pts.length<=7)||i%7===0?`<text x="${x(i)}" y="${H-9}" text-anchor="${i===0?'start':i===pts.length-1?'end':'middle'}" font-size="9" fill="#7d8fa5">${dateTitle(p.date)}</text>`:'').join('');
 const dots=valid.map(p=>`<circle cx="${x(p.i)}" cy="${y(p.score)}" r="3.5" fill="#fff" stroke="#4388c7" stroke-width="1.8"><title>${p.date} ${p.score}/100</title></circle>`).join('');
 const payload=encodeURIComponent(JSON.stringify(pts.map(p=>({date:p.date,score:p.score}))));
 return `<div class="dp908-daily-inspector" data-daily-points="${payload}" tabindex="0" role="group" aria-label="${metricLabel(metric)}"><svg class="dp905-daily-trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="${metricLabel(metric)}">${yticks}<path d="${poly}" fill="none" stroke="#4388c7" stroke-width="2.8" stroke-linecap="round"/>${dots}${xticks}</svg><div class="dp908-chart-readout" aria-live="polite">${T('滑鼠移動或點擊曲線查看逐日分數','移动鼠标或点击曲线查看每日分数','Hover or tap for each day’s exact score','일별 점수를 확인하세요','日別点数を確認')}</div></div>`;
}
const oldPeriod=dpOwnerPeriodDetail;
dpOwnerPeriodDetail=function(kind,cp,days){
 if(kind===1&&[7,30].includes(Number(days)))return sleepPeriod(cp,days);
 const original=oldPeriod(kind,cp,days);
 if(kind!==2||![7,30].includes(Number(days)))return original;
 const root=document.createElement('div');root.innerHTML=original;
 const panel=root.querySelector('.dp901-metric-card,.dp903-metric-card[data-dp903-metric="energy"]');
 if(panel){
   const details=panel.querySelector('details.dp901-expand,details.dp66-expand,details.dp903-expand');
   if(details)details.remove();
   panel.insertAdjacentHTML('beforeend',`<button class="dp905-day-detail-link dp908-energy-period-open" data-action="dp908-energy-period-open">${T('查看詳細數據','查看详细数据','View detailed data','상세 데이터','詳細データを見る')} ›</button>`);
 }
 return root.innerHTML;
};
function energyCalendarPage(){
 const range=[7,30].includes(Number(state.range))?Number(state.range):7;
 const rows=dayRowsWithIndex(range);
 return `<div class="app-pad dp905-page dp908-energy-calendar-page">${detailBack(T('精力情況','精力情况','Energy status','활력','活力')+' · '+range+T('天','天',' days','일','日'))}<section class="card dp905-energy-calendar"><h3>${T('期間精力分數趨勢','期间精力分数趋势','Period energy scores','기간 활력','期間の活力')}</h3><p>${T('每天的精力分數直接取當天有效記錄，不使用隨機數據。選擇日曆日期可查看全天強度與放大的變化時段。','每日精力分数来自当天有效记录，不采用随机数据。点选日历日期查看全天曲线及放大时段。','Scores come from each day’s valid records. Select a calendar date to see the full-day trend and zoomed changes.','날짜별 활력 기록입니다.','日別の有効データを表示します。')}</p>${dailyTrend(rows,'energy')}</section>${calendar(rows,'energy')}</div>`;
}
// Four-card heart analysis: one link per heart/breathing metric, in each period.
const baseDeep=deepView;
deepView=function(){
 if(state.detail==='dp905-sleep-day')return sleepDay(state.dp905ChosenDate);
 if(state.detail==='dp905-energy-day')return dayDetail('energy',state.dp905ChosenDate);
 if(state.detail==='dp908-energy-calendar')return energyCalendarPage();
 if(state.detail==='dp90-waveform'){
   if([7,30].includes(Number(state.dp905WaveRange))&&state.dp905WaveMode!=='day')return wavePeriod();
   if(state.dp905WaveMode==='day')return dayDetail(state.dp90WaveKind==='breath'?'breath':'heart',state.dp905ChosenDate||state.dp90WaveDate);
 }
 let html=baseDeep();
 if(state.detail)return html;
 if(state.deepType===2&&Number(state.range)===1){
   const root=document.createElement('div');root.innerHTML=html;
   const energy=root.querySelector('.dp901-metric-card');
   if(energy){
     energy.querySelector('details.dp901-expand, details.dp66-expand, details')?.remove();
     energy.insertAdjacentHTML('beforeend',`<button class="dp905-day-detail-link" data-action="dp905-energy-day-link">${T('查看詳細數據','查看详细数据','View detailed data','상세 데이터','詳細データを見る')} ›</button>`);
   }
   return root.innerHTML;
 }
 if(state.deepType!==0)return html;
 return html.replace(/查看波形|查看心跳趨勢|查看心跳趋势|查看呼吸趨勢|查看呼吸趋势|View waveform|파형 보기|波形を見る/g,T('查看詳細數據','查看详细数据','View detailed data','상세 데이터','詳細データを見る'));
};
// Home rhythm: exactly two equally-sized score cards rather than old 3-column shell.
const oldRhythm=rhythmDetailModal;
rhythmDetailModal=function(){return oldRhythm().replace('summary-three-rings dp90-two-rings','summary-three-rings dp90-two-rings dp905-two-rings');};
// Prevention: show the TOP THREE priorities immediately, only show More when >3.
const priorHomePrevention=dp67HomePrevention;
dp67HomePrevention=function(){
 const D=dp67PreventionData(),items=dp67WatchItems(D.p,D.type);if(!items.length)return priorHomePrevention();
 const label=T('推估需要留意的重點','推估需要留意的重点','Priority areas to monitor','우선 관찰 항목','注意すべきポイント');
 const button=(x,i)=>`<button type="button" class="dp905-priority" data-action="dp70-watch-open" data-code="${e(x.code)}"><span>${String(i+1).padStart(2,'0')}</span><b>${e(x.name)}</b><span aria-hidden="true">›</span></button>`;
 return `<section class="card dp905-prevent-home"><div class="dp905-prev-head"><span aria-hidden="true">♥</span><div><small>${T('預防性健康管理','预防性健康管理','PREVENTIVE HEALTH','예방 관리','予防ケア')}</small><h3>${T('心肺預防','心肺预防','Heart & breathing care','심폐 예방','心肺ケア')}</h3></div></div><p>${e(breedText(D.p))} · ${D.p.age} ${t('years')} · ${D.p.weight} kg</p><h4>${label}</h4>${items.slice(0,3).map(button).join('')}${items.length>3?`<button class="dp905-more" data-action="dp905-watch-more">More · +${items.length-3} ›</button>`:''}<small class="dp905-sim-note">${modalWarning()}</small></section>`;
};
const priorWatch=dp67WatchMain;
dp67WatchMain=function(){
 const D=dp67PreventionData(),items=dp67WatchItems(D.p,D.type);
 const row=(x,i)=>`<button type="button" class="dp70-watch-row" data-action="dp70-watch-open" data-code="${e(x.code)}"><span class="dp70-watch-index">${String(i+1).padStart(2,'0')}</span><span class="dp70-watch-label">${e(x.name)}</span><span aria-hidden="true">›</span></button>`;
 return `<section class="dp70-watch-hero"><div class="dp70-watch-heading"><small>${T('預防性健康管理','预防性健康管理','PREVENTIVE CARE','예방 관리','予防ケア')}</small><h2>${T('心肺預防','心肺预防','Heart & breathing care','심폐 예방','心肺ケア')}</h2><p>${e(breedText(D.p))} · ${D.p.age} ${t('years')} · ${D.p.weight} kg</p></div><div class="dp70-watch-overview"><div class="dp70-watch-overview-heading"><strong>${T('推估需要留意的重點','推估需要留意的重点','Suggested care priorities','추천 관리 항목','推奨ケア項目')}</strong></div>${items.slice(0,3).map(row).join('')}${items.length>3?`<button class="dp905-more" data-action="dp905-watch-more">More · +${items.length-3} ›</button>`:''}</div><p class="dp70-prevention-note">${modalWarning()}</p></section>`;
};
function watchAllPage(){
 const D=dp67PreventionData(),items=dp67WatchItems(D.p,D.type);
 return `<div class="app-pad dp905-page">${detailBack(T('全部預防重點','全部预防重点','All prevention priorities','예방 항목','予防項目'))}<section class="card dp905-all-watch"><h2>${T('這隻寵物的建議留意項目','这只宠物的建议留意项目','Suggested care priorities','추천 관찰 항목','推奨ケア項目')}</h2>${items.map((it,i)=>`<button data-action="dp70-watch-open" data-code="${e(it.code)}" class="dp905-priority"><span>${i+1}</span><b>${e(it.name)}</b><span>›</span></button>`).join('')}<p class="dp905-sim-note">${modalWarning()}</p></section></div>`;
}
const oldHealth=healthView;
healthView=function(){if(state.detail==='dp905-watch-all')return watchAllPage();return oldHealth();};
// Calendar and prevention detail screens have their own back controls; remove the main tabs.
const oldBottom=bottomNav;
bottomNav=function(){if((state.tab==='deep'&&['dp905-sleep-day','dp905-energy-day','dp908-energy-calendar'].includes(state.detail))||(state.tab==='health'&&state.detail==='dp905-watch-all'))return '';return oldBottom();};
// Show all y-axis values and exact date-score pairs for weekly and monthly reviews.
dpReviewPeriodCurve=function(series,color,title,dates){
 const n=series.length;if(!n)return '';
 const wide=n>7,w=wide?Math.max(640,n*41):350,h=173,l=42,r=15,top=17,b=40,dx=(w-l-r)/Math.max(1,n-1);
 const x=i=>l+i*dx,y=score=>top+(100-Math.max(0,Math.min(100,Number(score))))*(h-top-b)/100;
 const pts=series.map((s,i)=>({i,v:vnum(s)})).filter(p=>p.v!==null);
 const path=pts.map((p,i)=>(i?'L':'M')+x(p.i).toFixed(1)+','+y(p.v).toFixed(1)).join(' ');
 const grid=[0,20,40,60,80,100].map(z=>`<line x1="${l}" x2="${w-r}" y1="${y(z)}" y2="${y(z)}" stroke="#e5eaf2"/><text x="${l-6}" y="${y(z)+4}" text-anchor="end" font-size="11" fill="#728297">${z}</text>`).join('');
 const ticks=dates.map((d,i)=>`<text x="${x(i)}" y="${h-11}" text-anchor="${i===0?'start':i===n-1?'end':'middle'}" font-size="${wide?10:10.5}" fill="#71829a">${dateTitle(d)}</text>`).join('');
 const dots=pts.map(p=>`<circle cx="${x(p.i)}" cy="${y(p.v)}" r="4.4" fill="#fff" stroke="${color}" stroke-width="2"><title>${dates[p.i]} · ${Math.round(p.v)}/100</title></circle>`).join('');
 // Each x-position is selectable via a hit target, including on touch devices.
 const hits=pts.map(p=>`<rect x="${x(p.i)-dx/2}" y="${top}" width="${Math.max(14,dx)}" height="${h-top-b}" fill="transparent" tabindex="0" role="button" data-action="dp905-review-point" data-date="${dates[p.i]}" data-score="${Math.round(p.v)}" aria-label="${dates[p.i]} ${Math.round(p.v)}/100"><title>${dates[p.i]} · ${Math.round(p.v)}/100</title></rect>`).join('');
 return `<div class="dp905-review-chart"><div class="dp905-curve-caption">${T('期間趨勢 · 點擊日期查看數值','期间趋势 · 点击日期查看数值','Period trend · tap any date','기간 추세','期間トレンド')}</div><div class="dp905-plot-scroll"><svg viewBox="0 0 ${w} ${h}" style="width:${w}px;min-width:${w}px;display:block" role="img" aria-label="${T('每日分數','每日分数','Daily scores','일일 점수','日別点数')}">${grid}<path d="${path}" fill="none" stroke="${color}" stroke-width="2.8" stroke-linecap="round"/>${dots}${ticks}${hits}</svg></div><div class="dp905-point-reading" aria-live="polite">${T('點擊圖上任何日期查看該天分數','点击图上任一日期查看当天分数','Tap a date to see its exact score','날짜를 선택하세요','日付を選択してください')}</div></div>`;
};
// All actions are synchronous UI interactions, with return paths kept explicit.
const originalAction=onAction;
onAction=function(target){
 const a=target?.dataset?.action;
 if(a==='dp908-energy-period-open'){state.detail='dp908-energy-calendar';state.modal='';state.tab='deep';state.deepType=2;render(true);return;}
 if(a==='dp905-energy-day-link'){state.dp905OriginDetail=null;state.dp905ChosenDate=deepChosenDate();state.dp905PickedEvent=0;state.modal='';state.tab='deep';state.deepType=2;state.detail='dp905-energy-day';render(true);return;}
 if(a==='dp905-milo-alert'){state.modal='';state.tab='deep';state.deepType=0;state.range=1;state.dp905WaveRange=1;state.dp905WaveMode='single';state.detail='dp90-waveform';state.dp90WaveKind=target.dataset.kind==='breath'?'breath':'heart';state.dp90WaveDate=demoRecords(state.dog).at(-1)?.date||iso(localDate());state.dp904WaveSelected=0;render(true);return;}
 if(a==='dp905-watch-more'){state.tab='health';state.detail='dp905-watch-all';state.modal='';render(true);return;}
 if(a==='dp905-review-point'){
  const holder=target.closest('.dp905-review-chart'),reading=holder?.querySelector('.dp905-point-reading');if(reading)reading.textContent=target.dataset.date+' · '+target.dataset.score+'/100';return;
 }
 if(a==='dp90-wave-open'){
  state.dp905WaveRange=[7,30].includes(Number(state.range))?Number(state.range):1;
  state.dp905WaveMode=state.dp905WaveRange===1?'single':'period';
  return originalAction(target);
 }
 if(a==='dp905-date-open'){
  const kind=target.dataset.kind,date=target.dataset.date;if(!date)return;
  state.dp905OriginDetail=state.detail;state.dp905ChosenDate=date;state.dp905PickedEvent=0;
  state.modal='';state.tab='deep';
  if(kind==='sleep'){state.deepType=1;state.detail='dp905-sleep-day';}
  else if(kind==='energy'){state.deepType=2;state.detail='dp905-energy-day';}
  else{state.deepType=0;state.dp90WaveKind=kind==='breath'?'breath':'heart';state.dp90WaveDate=date;state.dp905WaveMode='day';state.detail='dp90-waveform';}
  render(true);return;
 }
 if(a==='dp905-event-pick'){state.dp905PickedEvent=Number(target.dataset.index)||0;render(false);return;}
 if(a==='dp905-detail-back'){
  if(state.detail==='dp905-energy-day'&&state.dp905OriginDetail==='dp908-energy-calendar'){state.detail='dp908-energy-calendar';render(true);return;}
  if(state.detail==='dp908-energy-calendar'){state.detail=null;render(true);return;}
  if(state.tab==='health'&&state.detail==='dp905-watch-all'){state.detail=null;render(true);return;}
  if(state.detail==='dp90-waveform'&&state.dp905WaveMode==='day'){
   state.dp905WaveMode='period';state.dp905ChosenDate=null;state.dp904WaveSelected=0;render(true);return;
  }
  state.detail=null;render(true);return;
 }
 if(a==='dp90-wave-back'){state.dp905WaveMode=null;state.dp905WaveRange=null;return originalAction(target);}
 return originalAction(target);
};
// Milo-only clearly labeled demonstration reminders, without changing his health score.
const priorUrgent=dp66UrgentHome;
dp66UrgentHome=function(){
 if(state.dog!==0)return priorUrgent();
 const row=demoRecords(0).at(-1),date=row?.date||iso(localDate());
 const demoTime=kind=>{const t=dp66DemoPeak(date,kind)?.time;return /^\d{2}:\d{2}$/.test(t||'')?t:(kind==='heart'?'17:30':'10:40');};
 const item=(kind,level,summary)=>`<button data-action="dp905-milo-alert" data-kind="${kind}" class="dp905-milo-item"><span class="dp905-milo-risk ${level}">${level==='light'?T('低風險','低风险','Mild','낮은 주의','軽度'):T('中風險','中风险','Moderate','중간 주의','中程度')}</span><span><b>${metricLabel(kind)} · ${demoTime(kind)}</b><small>${summary}</small></span><span>›</span></button>`;
 return `<section class="card dp905-milo-demo"><div class="dp905-milo-heading"><b>${T('今日即時變化提醒','今日即时变化提醒','Today’s changes','오늘의 변화','今日の変化')}</b><small>${T('Milo 示範資料','Milo 示范数据','Milo demo','Milo 데모','Miloデモ')}</small></div>${item('breath','light',T('活動後呼吸變化，先回看當時活動與氣溫。','活动后呼吸变化，建议先核对活动和气温。','Post-activity breathing change; check movement and heat.','활동 후 호흡 변화를 확인하세요.','運動後の呼吸変化を確認。'))}${item('heart','medium',T('心率短暫偏離平常，建議檢查佩戴與活動干擾。','心率短暂偏离平常，建议检查佩戴和活动干扰。','Brief heart-rate deviation; review fit and movement.','심박 변화와 착용 상태를 확인하세요.','心拍変化と装着状態を確認。'))}<p>${modalWarning()}</p></section>`;
};
// Hook keyboard and touch on the chart hit rectangles without costly page rebuilds.
document.addEventListener('keydown',ev=>{if(ev.key!=='Enter'&&ev.key!==' ')return;const el=ev.target.closest?.('[data-action="dp905-review-point"]');if(el){ev.preventDefault();onAction(el);}});
document.addEventListener('pointerover',ev=>{const el=ev.target.closest?.('[data-action="dp905-review-point"]');if(el)onAction(el);});
})();
