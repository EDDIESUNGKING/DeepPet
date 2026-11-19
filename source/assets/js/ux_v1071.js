/* DeepPet V10.71 — one report/health component and source-linked showcase alerts.
 * Presentation is shared; an unmeasured pet never receives an invented score.
 */
(function(root){'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const noData=()=>root.DeepPetUX1068?.isEmpty?.()===true;
 const examTitle=()=>L('體檢分析','Exam analysis','検診分析','검진 분석');
 const uploadTitle=()=>L('上傳／建立體檢報告','Upload / create examination report','検診結果を登録・作成','검진 보고서 업로드·작성');
 const missing=()=>L('暫無數據','No data yet','データなし','아직 데이터 없음');
 // The original data-fixture is the ONE graph source, even if a consumer asks
 // for heart only. Alert title and zoomed waveform must share exact minutes.
 const originalSignals=typeof dpSignals==='function'?dpSignals:null;
 // The 8.33 fixture schema is deliberately stable across launches.
 // Alert scenarios have their own revision and must never invalidate all
 // saved showcase snapshots through demoRecords() on every startup.
 state.dpShowcaseScenarioVersion=833;
 state.dpAlertScenarioVersion='v1079-score-independent-acutes';
 if(originalSignals)dpSignals=function(date,wanted=null){
  const gallery=root.DeepPetContextAlerts1061?.eligible?.()===true&&date===iso(localDate());
  if(!gallery)return originalSignals(date,wanted);
  // Keep the original rest/sleep channel. The historical wrapper narrowed
  // dpSignals(date) from four channels to three, so overnight summaries and
  // rest timelines could silently lose their 1,440-minute rest series.
  const all=originalSignals(date,['heart','breath','activity','rest']);
  if(!all||!['heart','breath','activity'].every(k=>Array.isArray(all[k])&&all[k].length===1440))return originalSignals(date,wanted);
  const data={...all,heart:all.heart.slice(),breath:all.breath.slice(),activity:all.activity.slice()};
  // Gallery health scores describe longer periods, while sudden heart/breath
  // episodes can affect a pet in any score band. Every gallery pet receives
  // a separate timed waveform episode from the earlier V10.68 layer; severe
  // profiles add multiple examples here. Independent detection remains based
  // on the actual minute traces, not the score category.
  const severe=[2,3,7,8,10,12,14].includes(state.dog);
  const own=typeof allPets==='function'?allPets()[state.dog]:null;
  // Seven low-score showcase cases must not share precisely the same event
  // times and values. This variation is deterministic per pet and is applied
  // to the plotted data itself, so labels and waveform drill-down agree.
  const offset=((state.dog*37)%101)-50;
  const cat=own?.species==='cat';
  const pulseHigh=cat?252-(state.dog%2)*3:238+(state.dog%4)*4;
  const breathHigh=70+(state.dog%5);
  const pulseLow=37+(state.dog%4);
  const breathLow=6+(state.dog%3);
  const sample=[
   {at:330+offset,heart:pulseHigh,breath:breathHigh},
   {at:520+offset,heart:pulseLow,breath:breathLow},
   {at:805+offset,heart:pulseHigh-4},
   {at:1030+offset,breath:breathLow+1},
   {at:1240+offset,breath:breathHigh-1,gradual:true}
  ];
  const picks=severe?(state.dog===3?sample:sample.slice(0,4)):[ ];
  for(const episode of picks){
   for(let m=episode.at-19;m<=episode.at+(episode.gradual?29:9);m++)data.activity[m]=0;
   for(let m=episode.at;m<episode.at+(episode.gradual?27:8);m++){
    const pct=episode.gradual?Math.min(1,(m-episode.at)/21):1;
    if(Number.isFinite(episode.heart))data.heart[m]=episode.gradual?Number((all.heart[episode.at-1]+(episode.heart-all.heart[episode.at-1])*pct).toFixed(1)):episode.heart;
    if(Number.isFinite(episode.breath))data.breath[m]=episode.gradual?Number((all.breath[episode.at-1]+(episode.breath-all.breath[episode.at-1])*pct).toFixed(1)):episode.breath;
   }
  }
  return Array.isArray(wanted)?Object.fromEntries(wanted.filter(k=>k in data).map(k=>[k,data[k]])):data;
 };
 function homeTodo(){
  if(state.tab!=='home'||state.detail)return;
  const node=document.querySelector('#app .dp1001-empty-todos .focus-eyebrow');if(!node||node.querySelector('svg'))return;
  const label=node.textContent.trim();node.replaceChildren();
  if(typeof vicon==='function')node.insertAdjacentHTML('afterbegin',vicon('spark',17));
  node.append(document.createTextNode(' '+label));
 }
 // Retired: the old report-card DOM replacement duplicated the canonical
 // V10.76 Health view. No legacy renderer may mutate dp1075-health-page.
 function commonReport(){}
 function alignDetail(){
  if(state.tab!=='deep')return;
  const rootEl=document.getElementById('app');if(!rootEl)return;
  // All three destinations use the SAME score-dependent 54-dot ring as Deep.
  const ring=rootEl.querySelector('.dp1068-detail-score .dp1068-detail-ring');
  if(ring&&!ring.classList.contains('dp1071-dotted')){
   const number=Number(ring.textContent.trim()),valid=Number.isFinite(number)&&ring.textContent.trim()!=='N/A';
   const score=valid?Math.max(0,Math.min(100,number)):null;
   const color=score===null?'#aab0bc':typeof scoreScheme==='function'?scoreScheme(score).color:'#aab0bc';
   ring.classList.add('dp1071-dotted','dp-uniform-dotted','dp-status-score');
   ring.style.setProperty('--sc',color);ring.dataset.score=score===null?'':String(score);
   ring.innerHTML=`${dpDottedSvg(score??0,color)}<div class="stat-inner"><b>${score??'—'}</b><small>${score===null?'':'/100'}</small></div>`;
  }
  // A detailed-data action may inherit arrows from both markup and ::after.
  const candidates=rootEl.querySelectorAll('.dp903-open-wave,.dp905-day-detail-link,.dp1063-details-btn,.dp908-energy-period-open,.dp901-metric-card [data-action*="detail"],.dp901-expand>summary,.dp903-expand>summary');
  for(const item of candidates){
   const plain=item.textContent.replace(/[›»→➜➔❯⟩]/g,'').trim();
   if(!/詳細|详细|detail|見る|보기/i.test(plain))continue;
   item.classList.add('dp1071-one-arrow');
   item.replaceChildren(document.createTextNode(L('查看詳細數據','View detailed data','詳細データを見る','상세 데이터 보기')));
   const icon=document.createElement('span');icon.className='dp1071-inline-arrow';icon.setAttribute('aria-hidden','true');icon.textContent='›';item.append(icon);
  }
 }
 function briefDailySleep(){
  if(state.tab!=='deep'||state.detail||noData()||Number(state.deepType)!==1||Number(state.range)!==1)return;
  const rows=root.DeepPetUX1068?.scope?.(1)||[];
  const sample=rows.at(-1),score=sample?.scores?.sleep;
  if(!Number.isFinite(score))return;
  let minutes=null,wakes=null;
  // dpNightSleepStats is generated from showroom night slots. Never turn
  // those slots into a factual sleep-duration explanation for a real pet.
  const real=typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements();
  if(!real&&Number.isInteger(sample.row?.idx)&&typeof dpNightSleepStats==='function')try{
   const stats=dpNightSleepStats(sample.row.idx);
   if(Number.isFinite(stats?.minutes))minutes=stats.minutes;
   if(Number.isFinite(stats?.wakes))wakes=stats.wakes;
  }catch{}
  const risk=score>=90?L('健康','Healthy','健康','건강'):score>=80?L('低風險','Mild risk','低リスク','낮은 위험'):score>=60?L('中風險','Moderate risk','中リスク','중간 위험'):L('高風險','High risk','高リスク','높은 위험');
  const facts=[Number.isFinite(minutes)?L(`有效休息約 ${(minutes/60).toFixed(1)} 小時`,`about ${(minutes/60).toFixed(1)} h of recorded rest`,`記録された休息約${(minutes/60).toFixed(1)}時間`,`기록된 휴식 약 ${(minutes/60).toFixed(1)}시간`):'',Number.isFinite(wakes)?L(`夜間中斷 ${wakes} 次`,`${wakes} night interruptions`,`夜間中断${wakes}回`,`야간 중단 ${wakes}회`):''].filter(Boolean).join(L('，',', ','、',', '));
  const sentence=real?score>=90?L('本次有效量測的休息評分位於健康區間；尚無可核對的夜間中斷次數。','Verified rest score is in the healthy band; night interruption counts are not yet available.','有効な休息スコアは良好です。夜間中断回数は未確認です。','유효한 휴식 점수는 양호하나 야간 중단 횟수는 확인되지 않았습니다。'):
   L(`${risk}（${Math.round(score)} 分）：有效評分偏低。尚無可核對的夜間中斷與時長資料，因此暫不推斷具體原因。`,`${risk} (${Math.round(score)}/100): the verified score is lower. Duration and interruptions are not verified, so no specific cause is claimed.`,`${risk}（${Math.round(score)}点）：有効スコアは低めですが、時間・中断回数は未確認のため原因は断定できません。`,`${risk} (${Math.round(score)}점): 점수가 낮으나 휴식 시간과 중단 횟수가 확인되지 않아 원인을 단정하지 않습니다.`):score>=90?
   L(`${facts||'本次睡眠記錄'}，睡眠分數位於健康區間。`,`${facts||'This sleep record'}; score is in the healthy band.`,`${facts||'今回の睡眠記録'}。健康範囲です。`,`${facts||'이번 수면 기록'}, 건강 범위입니다.`):
   L(`${risk}（${Math.round(score)} 分）：${facts||'目前缺乏可核對的睡眠時長與中斷資料'}。請與牠平時有效夜晚比較。`,`${risk} (${Math.round(score)}/100): ${facts||'no verifiable duration or interruption data'}. Compare with prior valid nights.`,`${risk}（${Math.round(score)}点）：${facts||'検証可能な睡眠記録が不足'}。過去の夜と比較してください。`,`${risk} (${Math.round(score)}점): ${facts||'확인 가능한 수면 기록 부족'}. 과거 유효한 밤과 비교하세요.`);
  const page=document.querySelector('#app .dp-owner-deep');if(!page)return;
  const display=page.querySelector('.dp1052-sleep-reason,.dp1051-sleep-full-reason');
  if(display)display.textContent=sentence;
  if(display)page.querySelectorAll('.dp1051-sleep-full-reason,.dp1052-sleep-reason').forEach(el=>{if(el!==display)el.remove();});
 }
 const previous=render;
 render=function(...args){const value=previous.apply(this,args);homeTodo();commonReport();alignDetail();briefDailySleep();return value;};
 root.DeepPetUX1071=Object.freeze({version:'10.71',commonReport,homeTodo,alignDetail});
})(window);
