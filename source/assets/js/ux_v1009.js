/* V10.09: evidence dates belong to the individual scored metric.
 * Correct the existing date stamps in place; no new cards, screens, numeric
 * scoring rules, gallery records, or synthetic measurement timestamps. */
(function(root){'use strict';
 const valid=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=100;
 const today=()=>iso(localDate());
 const domain=()=>['cardio','sleep','activityRecovery'][Number(state.deepType)]||'cardio';
 const dated=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||'')?x:today();
 function dateForKey(key){
  if(!['cardio','sleep','activityRecovery','heart','breath','hrv','stable','energy','recovery','calm'].includes(key))return null;
  const range=Number(state.range)||1;
  if(![1,7,30].includes(range))return null;
  const anchor=range===1&&typeof deepChosenDate==='function'?deepChosenDate():today();
  const daily=root.DeepPetSignalScoring?.getDaily?.(state.dog)||[];
  const rows=range===1?daily.filter(row=>row?.date===anchor):
   root.DeepPetBCG?.calendarWindow?.(daily,range,anchor)||[];
  const present=rows.filter(row=>valid(row?.scores?.[key])).sort((a,b)=>a.date.localeCompare(b.date));
  if(!present.length)return null;
  const first=present[0].date,last=present[present.length-1].date;
  return first===last?first:`${first} – ${last}`;
 }
 function keyForStamp(stamp){
  const metric=stamp.closest?.('[data-dp903-metric]');
  const name=metric?.dataset?.dp903Metric;
  if(['heart','breath','hrv','stable'].includes(name))return name;
  const energy=stamp.closest?.('.dp901-metric-card');
  if(energy){
   const siblings=Array.from(energy.parentElement?.querySelectorAll?.('.dp901-metric-card')||[]);
   return ['energy','recovery','calm'][siblings.indexOf(energy)]||null;
  }
  if(stamp.closest?.('.dp903-score-col.main,.dp901-overall-head,.dp903-overview-head,.dp-owner-status-heading,.dp-sleep-period-score-head,.dp905-sleep-head'))return domain();
  return null; // Keep other cards' established date annotations unchanged.
 }
 function fixRendered(){
  if(state.tab!=='deep'||state.detail)return;
  for(const stamp of document.querySelectorAll('#app .dp105-score-stamp')){
   const key=keyForStamp(stamp);if(!key)continue;
   const visible=String(stamp.textContent||'');
   const match=/^\d{4}-\d{2}-\d{2}(?:\s+–\s+\d{4}-\d{2}-\d{2})?/.exec(visible);
   if(!match)continue;
   const eligible=dateForKey(key);
   // A score without this metric's dated evidence cannot acquire a date just
   // because a DIFFERENT score has observations in this window.
   if(!eligible){stamp.remove?.();continue;}
   const suffix=visible.slice(match[0].length); // retains the 7/30 main-domain completeness label
   stamp.textContent=eligible+suffix;
   stamp.dataset.dp109Metric=key;
   if(!stamp.dataset.dp108Count){
    stamp.title=state.lang==='en'?'Only this score’s eligible observation dates are shown; no clock time is inferred.':
     state.lang==='ko'?'이 점수의 유효 측정 날짜만 표시하며 시각을 추정하지 않습니다.':
     state.lang==='ja'?'この指標の有効な記録日だけを表示し、測定時刻は推測しません。':
     state.lang==='zh'?'仅显示本指标确有有效记录的日期，不推测测量时刻。':
      '僅顯示本指標確有有效記錄的日期，不推測量測時刻。';
   }
  }
 }
 const prior=render;
 render=function(reset=false){
  prior(reset);
  fixRendered();
  document.querySelectorAll('#app .app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.09');
 };
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.09',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'per-component-actual-score-dates','safe-real-event-time-text']};
 root.DeepPetUX1009={version:'10.09',dateForKey,keyForStamp,fixRendered};
})(window);
