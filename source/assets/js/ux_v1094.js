/* DeepPet V10.95 | One Home/Deep navigation and presentation contract.
 * Measured scores are rendered by their existing evidence-aware component;
 * missing data occupies the same named sections without synthetic readings.
 */
(function(root){'use strict';
 const L=(zh,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const svg=(name,size)=>vicon(name,size);
 const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const noData=()=>L('暫無有效監測數據','No valid monitoring data','有効な測定データはありません','유효한 측정 데이터 없음');
 const noReading=()=>L('尚無這隻寵物的有效監測記錄；配對項圈並累積有效量測後，將在相同位置顯示分析。',
  'No valid recordings for this pet yet. Pair a collar and collect valid readings to see the analysis in these same sections.',
  'このペットの有効な測定記録はまだありません。首輪を接続すると同じ欄に分析が表示されます。',
  '이 반려동물의 유효한 측정 기록이 없습니다. 목걸이 연결 및 측정 후 같은 위치에 분석을 표시합니다.');
 const unmeasured=()=>{
  if(state.emptyPreview===true||selectedBlank()||dp58FreshPet()||isFreePet())return true;
  if(root.DeepPetSharedPage936?.virtualEmpty?.()){
   const verified=root.DeepPetSignalScoring?.getDaily?.(state.dog)||[];
   return !verified.some(x=>x?.source==='20hz-waveform'&&x.quality?.wearValid===true&&x.quality?.signalValid===true&&x.quality?.heartValid===true&&x.quality?.respValid===true&&x.quality?.timeContinuityValid===true&&Number(x.quality?.timeCoverage)>=.5&&Number(x.quality?.observedSeconds)>=900&&Number.isFinite(x.quality?.observedDayFraction));
  }
  if(typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements()){
   const verified=root.DeepPetSignalScoring?.getDaily?.(state.dog)||[];
   return !verified.some(x=>x?.source==='20hz-waveform'&&x.quality?.wearValid===true&&x.quality?.signalValid===true&&x.quality?.heartValid===true&&x.quality?.respValid===true&&x.quality?.timeContinuityValid===true&&Number(x.quality?.timeCoverage)>=.5&&Number(x.quality?.observedSeconds)>=900&&Number.isFinite(x.quality?.observedDayFraction));
  }
  return false;
 };
 const homeFromShared=()=>root.DeepPetSharedPage936?.render('home')||homeView();
 // Do not enter V9.35's separate New Pet / Blank Home template. Reuse the
 // *current* production Home factory in V9.36's isolated, no-signal context.
 blankHomeView=homeFromShared;
 dp58FreshHome=homeFromShared;
 freeCareHomeView=homeFromShared;

 const palette=[
  {key:'heart',accent:'#cf6684',bg:'#fff7f9',border:'#f2dce4',contrast:'#af5874',icon:'heart'},
  {key:'sleep',accent:'#52a97d',bg:'#f7fdf9',border:'#e6f3ea',contrast:'#347e60',icon:'moon'},
  {key:'activity',accent:'#4387dc',bg:'#f2f7ff',border:'#d8e7ff',contrast:'#306da8',icon:'activity'}
 ];
 const labels=()=>[t('heartCategory'),t('sleepCategory'),t('activeCategory')];
 const headlines=()=>[
  L('心肺綜合狀態','Overall heart & breathing status','心肺総合状態','심폐 종합 상태'),
  L('睡眠情況','Sleep & rest','睡眠状況','수면 상태'),
  L('精力與恢復狀態','Energy & recovery status','活力と回復状態','활력과 회복 상태')
 ];
 const na=()=>`<span class="dp1094-no-value" aria-label="${noData()}">N/A</span>`;
 const score=()=>`<div class="dp1094-score-slot dp-status-score" aria-label="${noData()}">${na()}</div>`;
 const chart=()=>`<div class="dp-owner-chart-box dp1094-no-chart"><div class="dp936-chart-na">N/A</div></div>`;
 const brief=(kind,days)=>`<p class="dp1094-data-message">${noReading()}</p>${days>1?`<p class="dp-owner-subsummary">${L(`最近${days}天 · 有效記錄日 N/A`,`Last ${days} days · Valid days N/A`,`直近${days}日 · 有効な記録日 N/A`,`최근 ${days}일 · 유효 기록일 N/A`)}</p>`:''}`;
 function heart(days){
  // The measured page uses V9.03's mainCard/metricCard for all four metrics.
  // Rendering that SAME factory with null values prevents another old shell.
  const render=root.DeepPetSharedCards903?.unmeasuredHeart;
  if(typeof render!=='function')throw Error('Missing canonical cardio metric factory');
  return render(days);
 }
 function sleep(days){
  if(days>1){
   const render=root.DeepPetSharedCards905?.unmeasuredSleepPeriod;
   if(typeof render!=='function')throw Error('Missing canonical sleep period factory');
   return render(days);
  }
  const facts=`<div class="dp-owner-sleep-facts"><div><span>${L('每晚睡眠與休息總時長','Nightly sleep & rest duration','一晩の休息時間','밤 수면·휴식 총시간')}</span><b>N/A</b></div><div><span>${L('夜間休息中斷','Rest interruptions','休息の中断','야간 휴식 중단')}</span><b>N/A</b></div></div>`;
  // Match the fully processed measured sleep-day DOM: same heading and main
  // dotted meter, alert, explanatory slot, facts, prior-night comparison,
  // sleep-wave container, and half-hour timeline controls. Only values vary.
  const meter=dpDeepDottedScore(null,'#aab0bc').replace('<b>—</b>','<b>N/A</b>')
    .replace('aria-label="—"','aria-label="N/A"');
  const head=`<div class="dp-owner-status-heading dp-heart-overall-heading dp1048-sleep-day-head dp1052-sleep-flow"><div class="dp1054-sleep-copy"><h2>${headlines()[1]}</h2><p class="dp1052-sleep-reason">${noReading()}</p></div><div class="dp1042-score-stack dp1046-primary-stack dp1054-sleep-meter">${meter}</div></div>`;
  const alert=`<div class="dp66-status-alert dp66-risk-na dp1098-no-sleep-alert"><b>N/A</b><span>${noData()}</span></div>`;
  const slots=`<div class="dp-sleep-slot-widget dp1098-empty-sleep-slots"><div class="sleep-date-timeline" role="group" aria-label="${noData()}">${Array.from({length:32},(_,i)=>`<button type="button" class="na" data-action="sleep-slot" data-day="-1" data-slot="${i}" aria-label="${noData()}" disabled></button>`).join('')}</div><div class="dp-sleep-scrub-track"><span class="dp-sleep-scrub-fill"></span><i class="dp-sleep-scrub-handle"></i></div><div class="sleep-slot-reading" aria-live="polite">N/A</div></div>`;
  return `<section class="card dp-owner-status-card dp-owner-sleep"><div class="dp-owner-status-inner">${head}${alert}${facts}<p class="dp-owner-sleep-difference">N/A</p><div class="dp-owner-sleep-legend"><strong>${L('睡眠與休息／活動時間軸','Rest and movement timeline','睡眠・活動の時間軸','수면·휴식/움직임 시간대')}</strong><span><i class="sleep"></i>${L('睡眠與休息','Sleep & rest','睡眠と休息','수면·휴식')}</span><span><i class="awake"></i>${L('活動','Movement','活動','활동')}</span></div><div class="dp-owner-sleep-timeline"><div class="dp-owner-sleep-wave">${chart()}</div>${slots}</div></div></section>`;
 }
 function energy(days){
  // Use the exact V9.01 measured Energy/Recovery card factory: three cards,
  // never the retired activity/two-minute-HR standalone metric labels.
  const render=root.DeepPetSharedCards901?.unmeasuredEnergy;
  if(typeof render!=='function')throw Error('Missing canonical recovery metric factory');
  return render(days);
 }
 const headingText=kind=>`<div><h2>${headlines()[kind]}</h2><p class="dp-heart-overall-verdict">${noData()}</p></div>`;
 const heading=kind=>`<div class="dp-owner-status-heading dp-heart-overall-heading">${headingText(kind)}${score()}</div>`;
 function emptyDeep(){
  const kind=Math.min(2,Math.max(0,Number(state.deepType)||0));
  const days=[1,7,30].includes(Number(state.range))?Number(state.range):7;
  const cp=palette[kind];
  const tabs=`<div class="tabs">${labels().map((l,i)=>`<button type="button" class="tab ${kind===i?'active':''}" data-action="deep-category" data-index="${i}" style="${kind===i?`background:${cp.bg};color:${cp.contrast};border-color:${cp.border}`:''}"><span class="tab-icon">${svg(palette[i].icon,20)}</span>${safe(l)}</button>`).join('')}</div>`;
  const ranges=`<div class="segment">${[1,7,30].map(k=>`<button type="button" class="seg-btn ${days===k?'active':''}" data-action="range" data-value="${k}">${k===1?L('單日','Day','1日','하루'):L(`${k}天`,`${k}D`,`${k}日`,`${k}일`)}</button>`).join('')}</div>`;
  // Keep the *same* date picker and route controls as a measured profile.
  const picker=deepDatePicker();
  const body=[heart,sleep,energy][kind](days);
  return `<div class="app-pad deep-themed deep-theme-${cp.key} dp-owner-deep dp1094-canonical-deep" data-layout="canonical" data-measurement-state="empty" style="--deep-accent:${cp.accent};--deep-soft:${cp.bg};--deep-border:${cp.border};--deep-contrast:${cp.contrast}">${bigHeader(t('deep'))}${tabs}${ranges}${picker}${days>1?`<p class="dp-range-quality">${noData()}</p>`:''}${body}<div class="footer-space"></div></div>`;
 }
 const measuredDeep=deepView;
 deepView=function(){return !state.detail&&unmeasured()?emptyDeep():measuredDeep();};
 // All historical dispatch names call this one view producer. Detail routes
 // stay on their existing evidence-guarded implementation.
 blankDeepView=()=>deepView();
 freeCareDeepView=()=>deepView();
 if(typeof dp58FreshEmptyTab==='function'){
  const prev=dp58FreshEmptyTab;
  dp58FreshEmptyTab=function(...args){return state.tab==='deep'?deepView():prev.apply(this,args);};
 }
 root.DeepPetCanonicalUI1094=Object.freeze({home:homeFromShared,deep:emptyDeep,unmeasured,palette,version:'10.95'});
})(window);
