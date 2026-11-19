/* DeepPet 9.11 — a single evidence lineage for risk flags, trend scores and user-facing summaries.
 * The records in this prototype are embedded examples. Grades compare within-pet patterns,
 * not a medically validated risk of apnea, cardiac arrest or disease. */
(function(){
'use strict';
const L=(tw,cn,en,ko,ja)=>state.lang==='zh'?cn:state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?(ja||en):tw;
const finite=x=>x===null||x===undefined||x===''||!Number.isFinite(Number(x))?null:Number(x);
const avg=a=>{const vals=a.map(finite).filter(x=>x!==null);return vals.length?vals.reduce((s,v)=>s+v,0)/vals.length:null;};
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const grade=s=>s===null?L('資料不足','数据不足','Insufficient data','자료 부족','データ不足'):scoreLabel(s);
const fmt=(n,places=1)=>finite(n)===null?'—':Number(n).toFixed(places);
const padded=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const escText=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const cache=new Map();
function clearEventCache(petIndex=null){
 if(petIndex===null){cache.clear();quietCache.clear();return;}
 for(const key of cache.keys())if(key.startsWith(String(petIndex)+':'))cache.delete(key);
 for(const key of quietCache.keys())if(key.startsWith(String(petIndex)+':'))quietCache.delete(key);
}
window.dp911ClearEventCache=clearEventCache;
function eventRevision(petIndex){
 const bridge=window.DeepPetSignalBridge;
 const signal=typeof bridge?.getRevision==='function'?bridge.getRevision(petIndex):bridge?.revisionByPet?.[petIndex]??bridge?.revision??0;
 const profile=state.petOverrides?.[petIndex]||{};
 // Do not serialize a possibly multi-megabyte owner photo for every event.
 return [signal,profile.age,profile.weight,profile.dpFixtureInvalidated,profile.dpFreshPet].join('|');
}
function computeEvent(date,kind){
 if(!['heart','breath'].includes(kind))return null;
 // Only built-in demonstration slots may have synthetic showcase events;
 // new/blank/owner-added pets never inherit those events.
 const pet=allPets()[state.dog];
 if(!Number.isInteger(state.dog)||state.dog<0||state.dog>=dogs.length||!pet||pet.dpFixtureInvalidated||pet.dpFreshPet||pet.freeCare)return null;
 const rows=demoRecords(state.dog),r=rows.find(x=>x.date===date),index=rows.indexOf(r);
 if(!r||index<0||!validDaySample(r,index).valid)return null;
 const signals=dpSignals(date,[kind,'activity']),series=signals?.[kind],motion=signals?.activity;
 if(!series||series.length!==1440||!motion||motion.length!==1440)return null;
 const peak=dp66DemoPeak(date,kind),t=peak?.time;
 const preferred=/^\d{2}:\d{2}$/.test(t||'')?Number(t.slice(0,2))*60+Number(t.slice(3)):null;
 // Compare similar activity windows in the SAME trace, excluding the candidate itself.
 // Scores here indicate a change worth reviewing, not a clinical emergency probability.
 function candidate(minute){
  const activity=motion[minute];
  // Require a short, sustained change; a single noisy sample is not a priority event.
  const value=avg(series.slice(Math.max(0,minute-2),Math.min(1440,minute+3)));
  if(value===null)return null;
  const refs=[];
  for(let i=Math.max(0,minute-90);i<=Math.min(1439,minute+90);i++){
   if(Math.abs(i-minute)<=9||Math.abs(motion[i]-activity)>14)continue;
   if(Number.isFinite(series[i]))refs.push(series[i]);
  }
  const baseline=refs.length>=20?avg(refs):avg(series.slice(Math.max(0,minute-75),Math.min(1440,minute+76)).filter((v,i)=>Math.abs(i-75)>9));
  if(baseline===null||baseline<=0)return null;
  const difference=value-baseline,relative=Math.abs(difference)/baseline;
  return {date,kind,minute,time:padded(minute),value,reference:baseline,diff:difference,relative};
 }
 const candidates=preferred!==null?[candidate(preferred)]:[];
 // A twenty-minute rolling peak may miss a shorter real episode. Scan the
 // remaining observed trace when that peak does not meet even mild criteria.
 const mild=kind==='heart'?.095:.10,moderate=kind==='heart'?.18:.22,high=kind==='heart'?.45:.50;
 if(!candidates[0]||candidates[0].relative<mild){
  for(let i=30;i<1410;i+=4)candidates.push(candidate(i));
 }
 const item=candidates.filter(Boolean).sort((a,b)=>b.relative-a.relative)[0];if(!item)return null;
 if(item.relative<mild)return null;
 const severity=item.relative>=high?3:item.relative>=moderate?2:1;
 return {...item,severity,level:severity===1?'light':severity===2?'medium':'high'};
}
window.dp911EventFor=function(date,kind){
 const key=state.dog+':'+date+':'+kind+':'+eventRevision(state.dog);if(cache.has(key))return cache.get(key);
 const answer=computeEvent(date,kind);cache.set(key,answer);
 if(cache.size>800)cache.clear();return answer;
};
// Stable rhythm should NOT reuse RMSSD/SDNN weights already included in HRV.
// Here the demonstration uses quiet-minute heart-rate trend regularity, a distinct
// feature with its own limitations (not ECG beat-to-beat rhythm diagnosis).
const quietCache=new Map();
function quietVariation(date){
 const key=state.dog+':'+date+':'+eventRevision(state.dog);if(quietCache.has(key))return quietCache.get(key);
 const values=dpSignals(date,['heart','activity']),h=values?.heart||[],a=values?.activity||[];
 if(h.length!==1440||a.length!==1440)return null;
 const pairs=[];
 for(let i=1;i<1440;i++)if(a[i]<24&&a[i-1]<24&&Number.isFinite(h[i])&&Number.isFinite(h[i-1]))pairs.push(Math.abs(h[i]-h[i-1]));
 const result=pairs.length>=35?avg(pairs):null;quietCache.set(key,result);return result;
}
const originalRhythm=rhythmData;
rhythmData=function(){
 const result=originalRhythm(),revision=eventRevision(state.dog);if(result.dp911Scoring===state.dog&&result.dp911Revision===revision)return result;
 for(let i=0;i<result.rows.length;i++){
  const row=result.rows[i],value=quietVariation(row.date),from=Math.max(0,i-14),prior=result.rows.slice(from,i).map(x=>quietVariation(x.date)).filter(x=>x!==null);
  const reference=prior.length>=3?avg(prior):value;
  // Closer to this pet's previous quiet-hour stability yields a higher score.
  const relative=value===null||reference===null?null:Math.abs(value-reference)/Math.max(.15,reference);
  result.values[i].stable=relative===null?null:dpOwnerQualityValue(95-Math.min(55,relative*65));
  // Calm is computed from preceding valid RMSSD/SDNN/NNVGR measurements only.
  // Never learn a pet's earlier score from dates that occurred later.
  const start=Math.max(0,i-14),prev=result.rows.slice(start,i).filter((r,j)=>validDaySample(r,start+j).valid);
  if(prev.length<3){result.values[i].calm=null;result.values[i].recover=null;}
  else{
   const baseline={sd:avg(prev.map(r=>r.sdnn)),rm:avg(prev.map(r=>r.rmssd)),hr:avg(prev.map(r=>r.nvgr))};
   const measures=rhythmMeasures(row,baseline);
   result.values[i].calm=measures.calm;result.values[i].recover=measures.recover;
  }
 }
 result.today=result.values.at(-1);result.dp911Scoring=state.dog;result.dp911Revision=revision;
 return result;
};
// Body rhythm uses only the two visible, independently defined components.
rhythmCompositeScore=function(m=rhythmData().today){
 const c=finite(m?.calm),stable=finite(m?.stable);
 if(c===null||stable===null)return null;
 const i=window.DeepPetScoreIntegrity;
 return i?.riskGuard(i.weighted({calm:c,stable},i.weights.rhythm,['calm','stable']),[c,stable])??null;
};
// Ensure period energy is EXACTLY the mean of daily numbers in the calendar.
const oldPeriod=dpOwnerPeriodDetail;
dpOwnerPeriodDetail=function(kind,cp,days){
 const html=oldPeriod(kind,cp,days);if(kind!==2||![7,30].includes(Number(days)))return html;
 const root=document.createElement('div');root.innerHTML=html;
 const rows=dayRowsWithIndex(days).filter(r=>validDaySample(r,r.idx).valid);
 const measured=rows.map(r=>({r,parts:dpOwnerDayScores(r,true)}));
 const perKey=Object.fromEntries(['energy','recovery','calm'].map(k=>[k,measured.filter(x=>finite(x.parts[k])!==null)]));
 const daily=measured.filter(x=>[x.parts.energy,x.parts.recovery,x.parts.calm,x.parts.energyActivity].every(v=>finite(v)!==null));
 const e=avg(perKey.energy.map(x=>x.parts.energy)),rec=avg(perKey.recovery.map(x=>x.parts.recovery)),calm=avg(perKey.calm.map(x=>x.parts.calm));
 const rounded={energy:e===null?null:Math.round(e),recovery:rec===null?null:Math.round(rec),calm:calm===null?null:Math.round(calm)};
 // A period's parent score is the mean of daily authoritative weighted scores,
 // not an equal average of three submetrics with different valid-day counts.
 const composite=daily.length?Math.round(avg(daily.map(x=>x.parts.energyActivity))):null;
 const main=root.querySelector('.dp901-overall-head .dp901-score-col,.dp903-overview-head .dp903-score-col');
 if(main){const ring=composite===null?'—':dpDeepDottedScore(composite,scoreScheme(composite).color);main.classList.remove('normal','light','medium','high');main.classList.add(composite===null?'none':composite>=90?'normal':composite>=80?'light':composite>=60?'medium':'high');main.innerHTML=ring+`<span class="dp903-grade">${grade(composite)}</span>`;}
 const top=root.querySelector('.dp901-overall-verdict,.dp903-overview-copy>h3');if(top)top.textContent=grade(composite);
 const box=root.querySelector('.dp901-period-notes,.dp90-period-story');if(box){
  const all=document.createElement('div');all.className='dp911-valid-period';
  all.innerHTML=`<p>${L('各項有效評分日','各项有效评分日','Valid scoring days','유효 점수 날짜','有効採点日')} · ${L('精力','精力','Energy','활력','活力')} <b>${perKey.energy.length}/${days}</b> · ${L('恢復','恢复','Recovery','회복','回復')} <b>${perKey.recovery.length}/${days}</b> · ${L('放鬆','放松','Rest','휴식','休息')} <b>${perKey.calm.length}/${days}</b></p>`;
  box.prepend(all);
  // Replace stale legacy text that still describes the old pre-calendar computation.
  const lines=[...box.querySelectorAll(':scope > p')];
  const lead=[
   L(`精力平均 ${fmt(e,1)} 分；逐日分數與日曆一致。`,`精力平均 ${fmt(e,1)} 分；与日历中的逐日分数一致。`,`Energy mean ${fmt(e,1)}, derived from the same calendar day scores.`,`활력 평균 ${fmt(e,1)}점.`,`活力平均 ${fmt(e,1)}点。`),
   L(`恢復平均 ${fmt(rec,1)} 分；依活動後兩分鐘下降量與相近活動的有效紀錄比較。`,`恢复平均 ${fmt(rec,1)} 分；以活动后两分钟心率下降量与相近活动记录比较。`,`Recovery mean ${fmt(rec,1)}; based on the two-minute post-activity HR drop versus comparable efforts.`,`회복 평균 ${fmt(rec,1)}점.`,`回復平均 ${fmt(rec,1)}点。`),
   L(`放鬆與平穩度平均 ${fmt(calm,1)} 分，依這些有效日的 RMSSD、SDNN 與心搏趨勢計算。`,`放松与平稳度平均 ${fmt(calm,1)} 分，取同一批有效日的 RMSSD、SDNN 与心搏趋势。`,`Rest & steadiness mean ${fmt(calm,1)}, from the same valid days' HRV and quiet-time beat patterns.`,`휴식·안정도 평균 ${fmt(calm,1)}점.`,`リラックスと安定度平均 ${fmt(calm,1)}点。`)
  ];
  lines.forEach((el,i)=>{if(lead[i])el.textContent=lead[i];});
 }
 const cards=[...root.querySelectorAll('.dp901-metric-card,.dp903-metric-card')];
 for(const [i,key] of ['energy','recovery','calm'].entries()){
  const card=cards[i],val=rounded[key];if(!card)continue;
  const meter=card.querySelector('.dp901-score-col,.dp903-score-col,.dp901-indicator,.dp903-score-col');
  if(meter){meter.innerHTML=`${val===null?'—':dpDeepDottedScore(val,scoreScheme(val).color)}<span class="dp903-grade">${grade(val)}</span>`;}
  const paragraph=card.querySelector('.dp901-metric-desc,.dp903-metric-left>p');
  if(paragraph&&key==='energy')paragraph.textContent=L(`精力期間平均 ${fmt(e,1)} 分，依日曆內每日分數計算；數值越高代表越接近這隻寵物的習慣狀態。`,`精力期间平均 ${fmt(e,1)} 分，与日历中的每日分数使用相同计算来源。`,`Energy period mean ${fmt(e,1)}; calculated from the same daily scores displayed in the calendar.`,`일별 기록의 평균입니다.`,`カレンダーと同じ日別点数の平均です。`);
  const trend=card.querySelector('details.dp66-expand,details.dp901-expand,details.dp903-expand');
  if(trend&&key!=='energy'){
   const entries=perKey[key];
   const content=entries.length>1?dpOwnerPeriodMetricChart(entries.map(x=>x.r),key,'#4387dc',entries.map(x=>x.parts[key]),'/100'):
     L('有效資料不足','有效数据不足','Insufficient data','자료 부족','有効データ不足');
   const sum=trend.querySelector('summary')?.outerHTML||`<summary>${L('查看每日趨勢','查看每日趋势','View daily trend','일별 추세','日別推移')}</summary>`;
   trend.innerHTML=sum+content;
  }
 }
 return root.innerHTML;
};
// A recorded event is referenced by all three places: Home, calendar and waveform.
const oldUrgent=dp66UrgentHome;
dp66UrgentHome=function(){
 if(selectedBlank()||dp58FreshPet()||!signalQuality().valid)return '';
 const today=demoRecords(state.dog).at(-1)?.date||iso(localDate()),entries=['breath','heart'].map(kind=>dp911EventFor(today,kind)).filter(Boolean);
 if(!entries.length)return '';
 const names={heart:L('心跳狀況','心跳状况','Heart rate','심박','心拍'),breath:L('呼吸狀況','呼吸状况','Breathing','호흡','呼吸')};
 const heart=entries.find(x=>x.kind==='heart'),breath=entries.find(x=>x.kind==='breath');
 const together=heart&&breath&&Math.abs(heart.minute-breath.minute)<=20&&Math.min(heart.severity,breath.severity)>=2;
 const sameTime=together?`<div class="dp911-coincident-event"><b>${L('心跳與呼吸同時明顯變化','心跳与呼吸同时明显变化','Heart and breathing changed together','심박과 호흡이 함께 변화','心拍と呼吸が同時に変化')}</b><small>${heart.time} · ${fmt(heart.value,1)} bpm / ${breath.time} · ${fmt(breath.value,1)} ${L('次／分','次／分','/min','회/분','回／分')}。${L('請優先核對當時活動和實際狀態；不表示已發生窒息。','请优先核对当时活动与实际状态；不代表发生窒息。','Check the activity and the animal’s actual condition; this is not proof of suffocation.','실제 상태를 확인하세요.','実際の様子をご確認ください。')}</small></div>`:'';
 const rows=entries.map(x=>{
  const risk=x.severity===1?L('低風險','低风险','Mild','낮은 위험','低リスク'):x.severity===2?L('中風險','中风险','Moderate','중간 위험','中リスク'):L('高風險','高风险','Risk','높은 위험','高リスク');
  const unit=x.kind==='heart'?'bpm':L('次／分','次／分','/min','회/분','回／分');
  const direction=x.diff>=0?L('偏高','偏高','Higher','높음','高い'):L('偏低','偏低','Lower','낮음','低い');
  return `<button class="dp905-milo-item" data-action="dp911-alert-open" data-kind="${x.kind}" data-date="${x.date}" data-minute="${x.minute}"><span class="dp905-milo-risk ${x.level}">${risk}</span><span><b>${names[x.kind]} · ${x.time} · ${direction}</b><small>${fmt(x.value,1)} ${unit} · ${L('同活動參考','同活动参考','Similar-activity reference','유사 활동 기준','同活動基準')} ${fmt(x.reference,1)} ${unit}</small></span><span aria-hidden="true">›</span></button>`;
 }).join('');
 return `<section class="card dp905-milo-demo"><div class="dp905-milo-heading"><b>${L('應急提醒','应急提醒','Priority alerts','우선 알림','優先通知')}</b></div>${sameTime}${rows}<p class="dp911-alert-context">${L('這些是與當時活動相近的個體差異提示，不代表已診斷疾病；如呼吸困難、倒下或牙齦發藍，應立即就醫。','这些是相近活动状态下的这只宠物的变化提示，不是疾病诊断。呼吸困难、倒下或牙龈发蓝应立即就医。','These changes are compared with similar activity, not a disease diagnosis. Seek urgent veterinary care for breathing distress, collapse or blue gums.','비슷한 활동 상황과 비교한 변화입니다.','同活動時の変化です。')}</p></section>`;
};
// Chart curves and event detail share the same minute. Don't reset to 07:30.
const previousAction=onAction;
onAction=function(target){
 if(target?.dataset?.action==='dp911-alert-open'){
  const kind=target.dataset.kind==='breath'?'breath':'heart',date=target.dataset.date;
  const event=dp911EventFor(date,kind);if(!event)return;
  state.tab='deep';state.deepType=0;state.range=1;state.detail='dp90-waveform';state.modal='';
  state.dp90WaveKind=kind;state.dp90WaveDate=date;state.dp905WaveMode='single';state.dp905WaveRange=1;
  state.dp904WaveSelected=0;state.dp911FocusedEvent=event;
  render(true);return;
 }
 return previousAction(target);
};
// All score/status copy must come from scoreLabel(score), not fixed old prose.
function unifyModalStatuses(){
 const root=document.getElementById('overlay-root');if(!root)return;
 for(const el of root.querySelectorAll('.summary-ring-item,.dp-rhythm-summary .summary-ring-item')){
  const score=finite(el.querySelector('[data-score]')?.dataset.score)||finite((el.getAttribute('data-hint')||'').match(/(\d+)\/100/)?.[1]);
  if(score===null)continue;
  const status=el.querySelector('.summary-ring-status');if(status){const rest=status.textContent.includes('›')?' ›':'';status.textContent=scoreLabel(score)+rest;}
 }
}
const oldModal=renderModal;
renderModal=function(){oldModal();unifyModalStatuses();};
// Sleep records belong to the morning on which the overnight period ends.
function sleepDates(){
 if(state.tab!=='deep')return;
 const root=document.getElementById('app');if(!root)return;
 for(const page of root.querySelectorAll('.dp905-sleep-day')){
  if(page.querySelector('.dp911-sleep-period'))continue;
  const date=state.dp905ChosenDate;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))continue;
  const prev=new Date(Date.parse(date+'T12:00:00Z')-86400000).toISOString().slice(0,10);
  const tip=document.createElement('p');tip.className='dp911-sleep-period';
  tip.textContent=L(`睡眠歸屬：${date}（${prev} 20:00 至 ${date} 12:00）`,`睡眠日期：${date}（${prev} 20:00 至 ${date} 12:00）`,`Sleep assigned to ${date}: from ${prev} 20:00 to ${date} 12:00`,`수면 날짜 ${date}`,`睡眠日付 ${date}`);
  page.querySelector('h3')?.insertAdjacentElement('beforebegin',tip);
  const idx=demoRecords(state.dog).findIndex(r=>r.date===date),record=demoRecords(state.dog)[idx];
  if(record&&finite(record.sleep)!==null){
   const total=Number(record.sleep),night=dpNightSleepStats(idx).minutes/60;
   if(total-night>0.26){
    const extra=document.createElement('p');extra.className='dp911-sleep-period';
    extra.textContent=L(`全天安靜休息 ${fmt(total,1)} 小時；下方時間軸只涵蓋 20:00–12:00，其中 ${fmt(night,1)} 小時在圖內，另有 ${fmt(total-night,1)} 小時在時段外。`,`全天安静休息 ${fmt(total,1)} 小时；下方时间轴只覆盖 20:00–12:00，其中 ${fmt(night,1)} 小时在图内，另有 ${fmt(total-night,1)} 小时在时段外。`,`Daily quiet rest ${fmt(total,1)}h; the 20:00–12:00 timeline shows ${fmt(night,1)}h, with ${fmt(total-night,1)}h outside the displayed window.`,`하루 조용한 휴식 ${fmt(total,1)}시간 중 차트에 ${fmt(night,1)}시간 표시.`,`1日の静かな休息 ${fmt(total,1)}時間中、図は${fmt(night,1)}時間です。`);
    tip.insertAdjacentElement('afterend',extra);
   }
  }
 }
}
function harmonizeCalendar(){
 const root=document.getElementById('app');if(!root)return;
 for(const cell of root.querySelectorAll('.dp905-calendar-panel .dp905-cal-day')){
  const kind=cell.dataset.kind,date=cell.dataset.date;
  if(!['heart','breath'].includes(kind)||cell.querySelector('.dp911-calendar-flag'))continue;
  const e=dp911EventFor(date,kind);if(!e)continue;
  cell.insertAdjacentHTML('beforeend',`<span class="dp911-calendar-flag" aria-label="${L('需要回看','需要回看','Review change','변화 확인','変化を確認')}">!</span>`);
 }
}
function fixSummaryAndPeriod(){
 const root=document.getElementById('app');if(!root)return;
 sleepDates();harmonizeCalendar();
 // Every daily recovery score needs an explicit baseline and sample count.
 for(const el of root.querySelectorAll('.dp901-metric-card,.dp903-metric-card')){
  const title=(el.querySelector('h3')?.textContent||'').toLowerCase();
  if(!/恢復情況|恢复情况|recovery status/.test(title)||el.querySelector('.dp911-recovery-label'))continue;
  if(state.range!==1||state.detail)continue;
  const row=demoRecords(state.dog).find(r=>r.date===deepChosenDate());if(!row)continue;
  const idx=demoRecords(state.dog).indexOf(row);const rec=dpOwnerRecoveryComparison({...row,idx});
  const info=document.createElement('p');info.className='dp911-recovery-label';
  info.textContent=rec?L(`今天 ${rec.count} 次有效活動，平均兩分鐘下降 ${fmt(rec.average,1)} bpm；選定活動下降 ${fmt(rec.drop,1)} bpm。${rec.reference===null?'尚未建立同強度的過往比較基準，暫不評分。':`相近活動歷史平均 ${fmt(rec.reference,1)} bpm。`}`,`今天 ${rec.count} 次有效活动，两分钟平均下降 ${fmt(rec.average,1)} bpm；所选活动下降 ${fmt(rec.drop,1)} bpm。${rec.reference===null?'尚未有足够相近活动的历史基准，暂不评分。':`相近活动历史平均 ${fmt(rec.reference,1)} bpm。`}`,`Today: ${rec.count} valid activity events; mean drop ${fmt(rec.average,1)} bpm; selected event drop ${fmt(rec.drop,1)} bpm. ${rec.reference===null?'No comparable baseline yet—score withheld.':`Comparable historical mean ${fmt(rec.reference,1)} bpm.`}`,`오늘 유효 운동 ${rec.count}회, 평균 ${fmt(rec.average,1)} bpm.`,`本日有効な活動 ${rec.count} 回、平均 ${fmt(rec.average,1)} bpm。`):L('今天沒有足夠的兩分鐘恢復紀錄。','今天没有足够的两分钟恢复记录。','No valid 2-minute recovery record today.','유효 회복 데이터 부족','有効な回復データが不足しています。');
  el.append(info);
 }
}
const oldRender=render;
render=function(reset=false){oldRender(reset);fixSummaryAndPeriod();};
})();
