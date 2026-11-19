/* DeepPet V10.06: unobtrusive score-period labels and live-baseline evidence.
 * Preserve every existing page, card, score weight, and demo pet record. */
(function(root){'use strict';
 const loc=(z,e,k,j)=>state.lang==='en'?e:state.lang==='ko'?k:state.lang==='ja'?j:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(z):z;
 const dated=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||'')?x:null;
 const daily=()=>root.DeepPetSignalScoring?.getDaily?.(state.dog)||[];
 const hasScore=x=>x&&['physiol','rhythm','cardio','sleep','activityRecovery'].some(key=>Number.isFinite(x.scores?.[key]));
 const dateLabel=()=>{
  const range=Number(state.range)||1,anchor=dated(state.deepSelectedDate)||iso(localDate());
  if(range===1){const found=daily().find(x=>x?.date===anchor);return hasScore(found)?anchor:null;}
  if(![7,30].includes(range))return null;
  const list=root.DeepPetBCG?.calendarWindow?.(daily(),range,anchor)||[];
  const valid=list.filter(hasScore).sort((a,b)=>a.date.localeCompare(b.date));
  if(!valid.length)return null;
  return valid.length===1?valid[0].date:`${valid[0].date} – ${valid.at(-1).date}`;
 };
 function stamp(el,when){if(!el||!when||el.querySelector(':scope > .dp105-score-stamp'))return;
  const span=document.createElement('small');span.className='dp105-score-stamp';span.textContent=when;
  span.title=loc('分數依這段時間的有效資料計算；沒有逐秒證據就不顯示虛構時刻。','Scores use eligible data from this date/period; no invented clock time.','해당 날짜·기간의 유효 기록을 사용하며 측정 시간을 지어내지 않습니다.','対象期間の有効データを使用し、測定時刻は推測しません。');
  el.appendChild(span);
 }
 function annotate(){
  if(['show-summary','rhythm-detail'].includes(state.modal)){
   const observed=daily().find(x=>x?.date===iso(localDate()));
   if(hasScore(observed))for(const button of document.querySelectorAll('#overlay-root .summary-ring-item')){
    if(button.querySelector('.dp90-unavailable,.dp903-no-score'))continue;
    stamp(button,observed.date);
   }
  }
  const app=document.getElementById('app');if(!app||state.detail)return;
  if(state.tab==='home'){
   const today=daily().find(x=>x?.date===iso(localDate()));if(!today)return;
   for(const [sel,key] of [['.dp-health-lane','physiol'],['.dp-rhythm-lane','rhythm']]){
    if(!Number.isFinite(today.scores?.[key]))continue;
    const button=app.querySelector(sel);if(!button)continue;
    stamp(button.querySelector('.dp-lane-copy'),today.date);
   }
  }
  if(state.tab!=='deep')return;
  const when=dateLabel();if(!when)return;
  for(const el of app.querySelectorAll('.dp903-score-col,.dp901-score-col')){
   if(el.querySelector('.dp903-no-score,.dp90-unavailable'))continue;
   stamp(el,when);
  }
  for(const el of app.querySelectorAll('.dp-vital-heading,.dp905-sleep-head,.dp-sleep-period-score-head,.dp-owner-status-heading')){
   if(!el.querySelector('.dp-status-score,.dp-dotted-meter,.dp-dot-meter'))continue;
   const copy=el.querySelector(':scope > div:first-child');if(copy)stamp(copy,when);
  }
 }
 const priorModal=modalUI;
 modalUI=function(){const html=priorModal();if(state.modal!=='rhythm-detail')return html;
  const today=daily().find(x=>x?.date===iso(localDate()));
  if(!today||!Number.isFinite(today.scores?.rhythm))return html;
  const label=loc('分數資料日期','Score data date','점수 기준 날짜','スコアの記録日');
  return html.replace('<div class="summary-three-rings',`<p class="dp105-modal-period"><b>${label}：</b><time datetime="${today.date}">${today.date}</time></p><div class="summary-three-rings`);
 };
 const priorRender=render;
 render=function(reset=false){priorRender(reset);annotate();
  document.querySelectorAll('#app .app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.06');
 };
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.06',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'dated-every-visible-score','device-zero-refit-not-health-zero','rolling-real-baseline-update','strict-score-date-evidence','lab-summary-independent-of-collar','pet-id-persisted-at-creation']};
 root.DeepPetUX1005={version:'10.06',dateLabel};
})(window);
