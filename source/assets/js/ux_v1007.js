/* DeepPet V10.07: calendar-day rollover and honest sparse-period labels.
 * This is a rendering/evidence annotation only. The four-tab architecture,
 * score equations, pet fixtures, source images and device paths are unchanged. */
(function(root){'use strict';
 const dateKey=()=>iso(localDate());
 const validScore=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100;
 const localized=(traditional,simplified,english,korean,japanese)=>
  state.lang==='en'?english:state.lang==='ko'?korean:state.lang==='ja'?japanese:
  state.lang==='zh'?simplified:traditional;
 let observedDay=dateKey();
 function reconcileDay(){
  const next=dateKey();
  if(next===observedDay)return false;
  const previous=observedDay;observedDay=next;
  // Only an automatically/current-day Deep selection moves with midnight.
  // Intentionally selected older days remain selected for historical review.
  if(state.deepSelectedDate===previous&&!state.dp1007DayManuallyChosen)state.deepSelectedDate=next;
  root.DeepPetSignalScoring?.invalidate?.();
  return true;
 }
 function refreshIfDayChanged(){
  if(!['home','deep'].includes(state.tab)||state.modal||state.detail)return false;
  if(typeof document==='undefined'||document.visibilityState==='hidden')return false;
  if(document.querySelector?.('#dp-intro-root')||
    document.activeElement?.matches?.('input,textarea,select,[contenteditable="true"]'))return false;
  if(dateKey()===observedDay)return false;
  // A calendar refresh is not navigation. Retain the current reading position
  // in long Home/Deep pages rather than unexpectedly jumping to the top.
  render(false);
  return true;
 }
 function sparsePeriod(){
  if(state.tab!=='deep'||state.detail||![7,30].includes(Number(state.range)))return null;
  const n=Number(state.range),anchor=dateKey();
  const daily=root.DeepPetSignalScoring?.getDaily?.(state.dog)||[];
  const rows=root.DeepPetBCG?.calendarWindow?.(daily,n,anchor)||[];
  const domain=['cardio','sleep','activityRecovery'][Number(state.deepType)]||'cardio';
  // Each Deep tab has its own evidence gate. Do not claim a day was observed
  // for sleep merely because cardio (or another domain) has a numeric score.
  const count=rows.filter(row=>validScore(row?.scores?.[domain])).length;
  return count<n?{count,range:n,domain}:null;
 }
 function labelSparsePeriod(){
  const evidence=sparsePeriod();if(!evidence||!evidence.count)return;
  const {count,range}=evidence;
  // Existing date stamps already belong to the selected Deep period. Make
  // data gaps explicit so a 30-day calendar is not mistaken for 30 observations.
  const fragment=localized(` · ${count}/${range} 日有分數`,` · ${count}/${range} 天有分数`,
   ` · ${count}/${range} scored days`,` · 점수 ${count}/${range}일`,
   ` · スコア ${count}/${range}日`);
  document.querySelectorAll('#app .dp105-score-stamp').forEach(stamp=>{
   // Annotate only the selected domain's existing MAIN score. Repeating the
   // domain count beside heart, breath or recovery sub-scores falsely implies
   // that every individual metric has the same amount of evidence.
   if(!stamp.closest?.('.dp903-score-col.main,.dp901-overall-head,.dp903-overview-head,.dp-owner-status-heading,.dp-sleep-period-score-head,.dp905-sleep-head')||stamp.dataset.dp108Count)return;
   stamp.dataset.dp108Count=`${count}/${range}`;
   stamp.textContent+=fragment;
   stamp.title=localized('僅統計此健康維度有有效分數的日期；各子指標可用天數可能不同。',
    '仅统计此健康维度有有效分数的日期；各子指标可用天数可能不同。',
    'Counted days contain an eligible score for this health domain; individual metrics may have different coverage.',
    '해당 건강 영역의 유효 점수가 있는 날만 집계합니다. 세부 지표의 기록일은 다를 수 있습니다.',
    'この健康項目の有効スコアがある日だけを集計します。個別指標の有効日数は異なる場合があります。');
  });
 }
 const priorRender=render;
 render=function(reset=false){
  reconcileDay();
  priorRender(reset);
  labelSparsePeriod();
  document.querySelectorAll('#app .app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.07');
 };
 if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible')refreshIfDayChanged();
 });
 root.addEventListener?.('pageshow',refreshIfDayChanged);
 root.setInterval?.(refreshIfDayChanged,60000);
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.07',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'foreground-local-midnight-refresh','sparse-period-recorded-day-disclosure']};
 root.DeepPetUX1007={version:'10.07',reconcileDay,refreshIfDayChanged,sparsePeriod,
  get observedDay(){return observedDay;}};
})(window);
