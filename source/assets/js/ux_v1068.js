/* DeepPet V10.68 — source-linked risk descriptions and one UI contract.
 * All simulated acute events below belong solely to explicitly bundled
 * showroom profiles. They are never accepted as owner/SDK measurements. */
(function(root){'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const good=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=100;
 const average=a=>{const n=a.filter(Number.isFinite);return n.length?n.reduce((v,x)=>v+x,0)/n.length:null;};
 const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const isEmpty=()=>state.emptyPreview===true||typeof selectedBlank==='function'&&selectedBlank()||typeof dp58FreshPet==='function'&&dp58FreshPet()||typeof isFreePet==='function'&&isFreePet()||typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements()&&!(root.DeepPetSignalScoring?.getDaily?.(state.dog)||[]).some(x=>x?.source==='20hz-waveform'&&x?.quality?.heartValid===true&&x?.quality?.respValid===true&&x?.quality?.wearValid===true&&x?.quality?.signalValid===true&&x?.quality?.timeContinuityValid===true&&Number(x?.quality?.timeCoverage)>=.5&&Number(x?.quality?.observedSeconds)>=900&&Number.isFinite(x?.quality?.observedDayFraction));
 const showroom=()=>typeof root.DeepPetContextAlerts1061?.eligible==='function'&&root.DeepPetContextAlerts1061.eligible();
 // Sudden events are independent of a pet's historical health score. Every
 // gallery profile may illustrate a separately timed acute waveform episode,
 // including a high-scoring pet; seven severe showcase profiles also have
 // multiple additional events. Only source-minute signals, never daily score,
 // drive the detector. New/blank or real-device owners remain excluded.
 const timedShowcaseProfiles=new Set(Array.from({length:15},(_,i)=>i));
 const tier=s=>!good(s)?-1:Math.round(s)>=90?0:Math.round(s)>=80?1:Math.round(s)>=60?2:3;
 const risk=s=>!good(s)?'N/A':tier(s)===0?L('健康','Healthy','健康','건강'):tier(s)===1?L('低風險','Mild risk','低リスク','낮은 위험'):tier(s)===2?L('中風險','Moderate risk','中リスク','중간 위험'):L('高風險','High risk','高リスク','높은 위험');
 const names={heart:()=>L('心跳狀況','Heart-rate status','心拍の状態','심박 상태'),breath:()=>L('呼吸狀況','Breathing status','呼吸状態','호흡 상태'),hrv:()=>L('HRV','HRV','HRV','HRV'),stable:()=>L('心搏節奏穩定度','Heartbeat rhythm stability','心拍リズムの安定度','심박 리듬 안정도'),sleep:()=>L('睡眠情況','Sleep status','睡眠状況','수면 상태'),energy:()=>L('精力情況','Energy status','活力の状態','활력 상태'),recovery:()=>L('恢復情況','Recovery status','回復状態','회복 상태'),calm:()=>L('放鬆與平穩度','Calm and steadiness','安静時の安定度','안정도')};
 const field={heart:['heart',' bpm'],breath:['breath',L(' 次／分',' /min',' 回／分',' 회/분')],energy:['activity',''],hrv:['rmssd',' ms']};
 const scope=days=>root.DeepPetUX1050?.scope?.(days)?.filter(x=>x?.row&&x?.scores)||[];
 const scoreOf=(samples,key)=>average(samples.map(x=>x.scores?.[key]).filter(good));
 const shown=n=>Number.isFinite(n)?String(Math.round(n)):'N/A';
 const baseline= (samples,key)=>{
  const rows=typeof demoRecords==='function'?demoRecords(state.dog):[],first=samples.map(x=>x.row?.date).filter(Boolean).sort()[0];
  if(!first)return null;
  const prior=rows.map((row,i)=>({row,idx:i})).filter(x=>x.row.date<first&&typeof validDaySample==='function'&&validDaySample(x.row,x.idx)?.valid).slice(-14);
  const k=field[key]?.[0];if(!k||prior.length<3)return null;
  const numbers=prior.map(x=>x.row[k]).filter(Number.isFinite);return numbers.length>=3?average(numbers):null;
 };
 function description(key,samples,days){
  const score=scoreOf(samples,key),rank=tier(score),name=names[key]?.()||key;
  if(rank<0)return L('尚無有效量測資料，無法評分。','No valid readings for scoring.','有効データがありません。','유효 측정값이 없습니다.');
  const values=samples.map(x=>x.scores?.[key]).filter(good),low=values.filter(x=>x<60).length,below=values.filter(x=>x<80).length;
  const raw=field[key]&&average(samples.map(x=>x.row[field[key][0]]).filter(Number.isFinite));
  const former=baseline(samples,key),unit=field[key]?.[1]||'';
  const first=Number.isFinite(raw)?`${name} ${key==='breath'||key==='hrv'?raw.toFixed(1):Math.round(raw)}${unit}`:name;
  const relation=Number.isFinite(former)&&Number.isFinite(raw)&&former>0?
   L(`，與較早有效日平均 ${key==='breath'||key==='hrv'?former.toFixed(1):Math.round(former)}${unit} 相比${raw>=former?'升高':'下降'} ${Math.abs((raw-former)/former*100).toFixed(1)}%`,`; versus an earlier valid mean of ${former.toFixed(1)}${unit}, ${raw>=former?'up':'down'} ${Math.abs((raw-former)/former*100).toFixed(1)}%`,`、以前の平均より ${Math.abs((raw-former)/former*100).toFixed(1)}% ${raw>=former?'増加':'低下'}`,`; 이전 기록 대비 ${Math.abs((raw-former)/former*100).toFixed(1)}% ${raw>=former?'증가':'감소'}`):'';
  const n=values.length,daysText=days===1?L('所選日期','Selected day','選択日','선택한 날짜'):L(`最近${days}天的${n}個有效日`,`the ${n} valid days in this ${days}-day window`,`${days}日間の有効${n}日`,`${days}일 중 유효 ${n}일`);
  const distribution=days===1?'':L(`；其中${below}日低於80分、${low}日低於60分`,`；${below} days below 80, ${low} below 60`,`、80点未満${below}日・60点未満${low}日`,`；80점 미만 ${below}일, 60점 미만 ${low}일`);
  const sleepEvidence=key==='sleep'&&typeof dpNightSleepStats==='function'?samples.map(x=>{try{return dpNightSleepStats(x.row.idx);}catch{return null;}}).filter(x=>Number.isFinite(x?.wakes)&&Number.isFinite(x?.minutes)):[];
  const sleepText=sleepEvidence.length?L(`；平均夜間中斷 ${average(sleepEvidence.map(x=>x.wakes)).toFixed(1)} 次、有效休息 ${(average(sleepEvidence.map(x=>x.minutes))/60).toFixed(1)} 小時`,`; ${average(sleepEvidence.map(x=>x.wakes)).toFixed(1)} night interruptions and ${(average(sleepEvidence.map(x=>x.minutes))/60).toFixed(1)} h of rest`,`；夜間中断平均 ${average(sleepEvidence.map(x=>x.wakes)).toFixed(1)} 回`,`；야간 중단 평균 ${average(sleepEvidence.map(x=>x.wakes)).toFixed(1)}회`):'';
  const recoveries=key==='recovery'&&typeof dpOwnerRecoveryComparison==='function'?
   samples.map(x=>{try{return dpOwnerRecoveryComparison(x.row);}catch{return null;}}).filter(x=>Number.isFinite(x?.average)):[];
  const validRef=recoveries.filter(x=>Number.isFinite(x.reference));
  const recoveryText=recoveries.length?L(`；活動後2分鐘心率平均回落 ${average(recoveries.map(x=>x.average)).toFixed(1)} bpm${validRef.length?`，同等活動的過往平均 ${average(validRef.map(x=>x.reference)).toFixed(1)} bpm`:'；相似活動的比較基準尚不足'}`,`; heart rate fell ${average(recoveries.map(x=>x.average)).toFixed(1)} bpm over two minutes${validRef.length?`; comparable prior drop ${average(validRef.map(x=>x.reference)).toFixed(1)} bpm`:' (no sufficient comparable prior sessions)'}`,`；運動後2分の平均心拍低下 ${average(recoveries.map(x=>x.average)).toFixed(1)} bpm`,`；활동 후 2분 평균 심박 감소 ${average(recoveries.map(x=>x.average)).toFixed(1)} bpm`):'';
  const extra=recoveryText||sleepText;
  const hasComparison=Number.isFinite(former)&&Number.isFinite(raw)&&former>0;
  if(rank===0)return hasComparison?
   L(`${daysText} ${first}${relation}，本期分數位於健康區間。`,`For ${daysText}, ${first}${relation}; the score is in the healthy band.`,`${daysText}の${first}${relation}。スコアは良好です。`,`${daysText} ${first}${relation}. 점수는 건강 범위입니다.`):
   L(`${daysText} ${first}，本期分數位於健康區間；尚無足夠先前有效日供個體比較。`,`For ${daysText}, ${first}; the score is in the healthy band, but prior valid days are insufficient for a personal comparison.`,`${daysText}の${first}。スコアは良好ですが、個体比較用の履歴が不足しています。`,`${daysText} ${first}. 점수는 건강 범위이나 개인 비교 기록이 부족합니다.`);
  const why=key==='stable'?L('本項以安靜時心率起伏及有效心搏間隔變化評分；需要足夠歷史資料才能斷言偏離個體基準。','Quiet-time heart-rate fluctuations and validated beat intervals contribute to this score; without comparable history a personal deviation cannot be claimed.','安静時の心拍変動と有効な拍間隔から評価します。','안정 시 심박 변동과 유효한 박동 간격을 반영합니다.'):
    key==='energy'?hasComparison?L(`本期活動指數相對較早有效日${raw<former?'下降':'上升'}，表示活動模式有變化；單靠分數不能確定精神不佳或疾病。`,`The activity index is ${raw<former?'lower':'higher'} than earlier valid days, showing a change in movement rather than a proven illness.`,`過去の活動指数と異なります。`,`과거 활동 지수와 차이가 있습니다.`):L('目前只可確認活動指數和精力評分；歷史比較不足，不能直接判斷比平時少動或推斷疾病。','Only the current activity index and energy score are established; without history, reduced movement or illness cannot be inferred.','現在の活動指数のみ確認可能です。','현재 활동 지수만 확인할 수 있습니다.'):
    key==='sleep'?sleepEvidence.length?L('此分數綜合休息時間與中斷情況；若要判斷是否比平時變差，仍須比較先前有效夜晚。','Rest duration and observed interruptions inform the score; previous valid nights are needed to establish deterioration.','休息時間と中断状況を合わせて評価します。','휴식 시간과 중단 횟수를 평가합니다.'):L('目前缺少可核對的休息時長或中斷資料，不能直接聲稱睡眠連續性變差。','Rest duration and interruptions are not verifiable here; a decline in continuity cannot be claimed.','確認可能な睡眠データが不足しています。','확인 가능한 수면 데이터가 부족합니다.'):
    key==='recovery'?validRef.length?L('在相近活動條件下，兩分鐘心率回落與過往可比較時段有差距，導致恢復評分下降。','Two-minute heart-rate decline differs from comparable prior activity, contributing to the recovery score.','類似運動後の回復基準との差を反映します。','유사 활동 후 회복 기준과 차이가 있습니다.'):L('尚無足夠相近活動的舊紀錄可確認恢復變慢，不能只憑低分斷言恢復能力下降。','Comparable prior recovery sessions are insufficient to claim slower recovery from this score alone.','類似運動との比較記録が不足しています。','비슷한 활동의 비교 자료가 부족합니다.'):
    key==='calm'?L('本項結合休息時心率、呼吸及活動波動評分；若未建立可比較的安靜時基準，尚不能斷言偏離日常模式。','This score combines resting heart rate, breathing and movement fluctuations; a departure from usual calm periods cannot be claimed without a comparable baseline.','安静時の心拍・呼吸・活動変動を組み合わせたスコアです。','휴식 중 심박·호흡·움직임 변동을 함께 평가합니다.'):
    key==='hrv'?hasComparison?L('HRV 與先前有效值不同；升降幅度必須結合當時休息和活動情況，不表示越高越健康。','HRV differs from earlier valid readings; direction needs rest and activity context.','以前のHRVと異なります。','이전 HRV와 차이가 있습니다.'):L('尚缺至少三個可比較的先前有效日，不能聲稱 HRV 偏離個體基準。','At least three comparable prior days are missing; a personal HRV deviation cannot be claimed.','比較可能な過去記録が不足しています。','비교 가능한 이전 기록이 부족합니다.'):
    hasComparison?L('與較早有效日數值相比已有可計算差距；需結合安靜與活動情境判斷，低分不等同突發事件。','Measured readings differ from earlier valid days; context matters, and a low score is not an acute event.','過去の有効日との差があります。','이전 유효일과 차이가 있습니다.'):L('沒有足夠的先前有效日作個體比較，因此只能說明目前數值和已計算的分數，不能聲稱已發生突發心肺異常。','Without enough prior valid days, only the current measured value and computed score are established; no sudden event is inferred.','過去の比較記録が足りません。','과거 비교 기록이 부족합니다.');
  const lead=L(`${daysText}得 ${shown(score)} 分（${risk(score)}）。${first}${relation}${extra}${distribution}。`,`Score ${shown(score)} (${risk(score)}) over ${daysText}. ${first}${relation}${extra}${distribution}.`,` ${daysText} ${shown(score)}点（${risk(score)}）。${first}${relation}${extra}${distribution}。`,`${daysText} ${shown(score)}점（${risk(score)}）。${first}${relation}${extra}${distribution}.`);
  return rank===1?lead:rank===2?`${lead} ${why}`:`${lead} ${why} ${L(`本期最低 ${Math.round(Math.min(...values))} 分、最高 ${Math.round(Math.max(...values))} 分；分數偏低，但是否有突發異常，須核對發生時間及原始量測曲線。`,`Scores ranged ${Math.round(Math.min(...values))}–${Math.round(Math.max(...values))}; low scores alone do not establish an acute event. Check the timestamped original readings.`,`最低${Math.round(Math.min(...values))}点、最高${Math.round(Math.max(...values))}点。急変かどうかは元データで確認してください。`,`최저 ${Math.round(Math.min(...values))}, 최고 ${Math.round(Math.max(...values))}점. 급성 이상 여부는 원본 데이터를 확인하세요.`)}`;
 }
 // All fifteen gallery cases may carry a timed seven-minute acute episode;
 // the underlying long-term score does not veto an independently detected
 // event. Neither blank nor new owners may inherit the showroom waveform.
 // Bump only the detector's ephemeral fixture key; an earlier render may
 // already have cached a no-event result before this last bundle layer loads.
 // Do not overwrite the saved showcase-fixture migration marker here.
 const priorSignals=typeof dpSignals==='function'?dpSignals:null;
 if(priorSignals)dpSignals=function(date,wanted=null){
  const data=priorSignals(date,wanted);
  if(!showroom()||!timedShowcaseProfiles.has(state.dog)||date!==iso(localDate())||!data||!Array.isArray(data.activity))return data;
  const d=state.dog,kind=d%2===0?'heart':'breath';
  if(!Array.isArray(data[kind])||data[kind].length!==1440||data.activity.length!==1440)return data;
  const start=605+(d%5)*24,series={...data,[kind]:data[kind].slice(),activity:data.activity.slice()};
  for(let m=start-16;m<start+8;m++)series.activity[m]=0;
  // A clearly separate, fixed showroom episode. Values remain in valid bounds.
  const value=kind==='heart'?244:70;
  for(let m=start;m<start+7;m++)series[kind][m]=value;
  return series;
 };
 // Retired: the previous empty-Health injector could create a second exam
 // card and replace the dp1075-health-page hierarchy. One canonical renderer
 // now handles every pet, including truly blank/new profiles.
 function equalHealth(){}
 function rewriteDeepReasons(){
  if(state.tab!=='deep'||state.detail||isEmpty())return;
  const days=[1,7,30].includes(Number(state.range))?Number(state.range):1,samples=scope(days);if(!samples.length)return;
  const deep=document.querySelector('#app .dp-owner-deep');if(!deep)return;
  deep.querySelectorAll('.dp903-score-method,.dp1064-method').forEach(x=>{if(x.querySelector('.dp903-score-method')||x.classList.contains('dp903-score-method'))x.remove();});
  const rewrite=(node,key)=>{if(!node)return;node.textContent=description(key,samples,days);node.classList.add('dp1068-risk-description');const next=node.nextElementSibling;if(next?.classList.contains('dp1055-bottom'))next.remove();};
  if(Number(state.deepType)===0){
   for(const key of ['heart','breath','hrv','stable'])rewrite(deep.querySelector(`[data-dp903-metric="${key}"] .dp903-metric-left>p`),key);
   const stable=deep.querySelector('[data-dp903-metric="stable"]');if(stable&&!stable.querySelector('.dp1068-rhythm-composition')){
    const p=document.createElement('p');p.className='dp1068-rhythm-composition';p.textContent=L('評分依據：安靜時的心率起伏、有效心搏間隔變化，以及與個體歷史基準的差距。','Components: quiet heart-rate fluctuations, valid beat-interval changes, and deviation from personal history.','評価要素：安静時の心拍変化・拍間隔・個体基準との差。','평가 요소: 안정 시 심박 변화, 박동 간격, 개인 기준 편차.');stable.append(p);
   }
  }else if(Number(state.deepType)===2){
   const cards=[...deep.querySelectorAll('.dp901-health-score .dp901-metric-card')];['energy','recovery','calm'].forEach((k,i)=>rewrite(cards[i]?.querySelector('.dp901-metric-desc'),k));
  }else{rewrite(deep.querySelector('.dp1052-sleep-reason'),'sleep');}
 }
 function detailReasons(){
  if(state.tab!=='deep'||!state.detail)return;
  // The unmeasured detail already has a single neutral explanation.
  // Do not prepend the old N/A risk-score card to that canonical screen.
  if(isEmpty())return;
  const detail=state.detail;
  const key=detail==='dp90-waveform'?(state.dp90WaveKind==='breath'?'breath':'heart'):
   ['dp905-energy-day','dp936-energy-detail','dp908-energy-calendar'].includes(detail)?'energy':
   detail==='dp905-sleep-day'?'sleep':null;
  if(!key)return;
  const page=document.querySelector('#app .app-pad');if(!page)return;
  page.querySelectorAll('.dp1058-detail-evidence').forEach(x=>x.remove());
  if(page.querySelector('.dp1068-detail-score'))return;
  const waveRange=state.dp905WaveMode==='period'&&[7,30].includes(Number(state.dp905WaveRange))?Number(state.dp905WaveRange):0;
  const days=detail==='dp908-energy-calendar'?[7,30].includes(Number(state.range))?Number(state.range):7:
   waveRange||([7,30].includes(Number(state.dp932WaveDays))&&state.dp905WaveMode==='period'?Number(state.dp932WaveDays):1);
  const date=key==='energy'?(detail==='dp936-energy-detail'?(state.dp936EnergyDate||state.dp905ChosenDate||state.deepSelectedDate):(state.dp905ChosenDate||state.dp936EnergyDate||state.deepSelectedDate)):
   key==='sleep'?state.dp905ChosenDate:state.dp905WaveMode==='day'?(state.dp905ChosenDate||state.dp90WaveDate):state.dp90WaveDate;
  // The empty profile may still have the previously selected gallery index.
  // Never let a detail card accidentally borrow that pet's historical score.
  const samples=isEmpty()?[]:days===1?scope(30).filter(x=>x.row.date===date):scope(days);
  const value=scoreOf(samples,key);
  // A measured pet may still have an unmeasured selected day.  Missing data
  // is a neutral state, never a giant N/A score/risk circle.
  if(!good(value))return;
  const r=risk(value);
  const section=document.createElement('section');section.className='card dp1068-detail-score';
  section.innerHTML=`<div class="dp1068-detail-score-head"><div><p class="dp1068-detail-label">${names[key]()}</p><h2>${r}</h2><small>${days===1?escape(date||''):L(`最近${days}天`,`Last ${days} days`,`${days}日間`,`최근 ${days}일`)}</small></div><div class="dp1068-detail-ring dp1068-risk-${tier(value)}">${good(value)?Math.round(value):'N/A'}</div></div><div class="dp1068-detail-risk dp1068-risk-${tier(value)}">${good(value)?r:'N/A'}</div><div class="dp1068-detail-why"><h3>${tier(value)===0?L('目前的量測結論','Measured finding','計測結果','측정 결과'):tier(value)<0?L('目前沒有有效數據','No valid readings','有効データなし','유효 기록 없음'):L(`為什麼是${r}？`,`Why ${r}?`,`${r}の理由`,`${r}인 이유`)}</h3><p>${isEmpty()?'N/A':description(key,samples,days)}</p></div>`;
  const first=page.querySelector(':scope > .card');if(first)first.before(section);else page.append(section);
 }
 function examLayout(){
  if(state.tab!=='health'||!state.detail)return;
  const app=document.getElementById('app');if(!app||!app.querySelector('.dp921-page'))return;
  for(const node of app.querySelectorAll('.dp921-score')){
   if(node.parentElement?.classList.contains('dp1068-exam-score-wrap'))continue;
   const label=node.querySelector('small')?.textContent?.trim()||'N/A';node.querySelectorAll(':scope > small').forEach(x=>x.remove());
   const wrap=document.createElement('span');wrap.className='dp1068-exam-score-wrap';
   node.before(wrap);wrap.append(node);
   const below=document.createElement('span');below.className='dp1068-exam-risk';below.textContent=label;wrap.append(below);
  }
  // Unscorable measurements are explicitly N/A, never a phantom status.
  const walker=document.createTreeWalker(app,NodeFilter.SHOW_TEXT);let textNode;
  while(textNode=walker.nextNode())if(/待核對|待核对|Pending review|Needs review|確認待ち|검토 필요/i.test(textNode.nodeValue||'')){
   textNode.nodeValue=textNode.nodeValue.replace(/待核對|待核对|Pending review|Needs review|確認待ち|검토 필요/gi,'N/A');
  }
 }
 function cleanTerminology(){
  if(state.tab!=='health')return;
  const app=document.getElementById('app');if(!app)return;
  const walker=document.createTreeWalker(app,NodeFilter.SHOW_TEXT);let t;
  while(t=walker.nextNode())if(/待核對|待核对|Pending review|確認待ち|검토 필요/i.test(t.nodeValue||''))
   t.nodeValue=t.nodeValue.replace(/待核對|待核对|Pending review|確認待ち|검토 필요/gi,'N/A');
 }
 function arrows(){
  const app=document.getElementById('app');if(!app)return;
  const candidates=app.querySelectorAll('.dp903-open-wave,.dp905-day-detail-link,.dp1063-details-btn,.dp903-expand>summary,.dp901-expand>summary,.dp66-expand>summary,.dp908-energy-period-open');
  for(const e of candidates){
   e.classList.add('dp1068-single-arrow');
   const raw=(e.textContent||'').replace(/[›»→➜➔❯]/g,'').trim();
   const hasData=/查看|View|見る|보기|추세|趨勢|趋势/i.test(raw);
   if(!hasData)continue;
   const isDetail=/詳細|详细|detail|詳細データ|상세/i.test(raw);
   const label=isDetail?L('查看詳細數據','View detailed data','詳細データを見る','상세 데이터 보기'):raw;
   e.replaceChildren(document.createTextNode(label+' '));const arrow=document.createElement('span');arrow.className='dp1068-inline-arrow';arrow.textContent='›';arrow.setAttribute('aria-hidden','true');e.append(arrow);
  }
 }
 function tutorial(){
  if(state.modal!=='tour'||Number(state.tourStep)!==0)return;
  const note=document.querySelector('#overlay-root .dp1061-feature-note');if(!note)return;
  const extra=note.querySelector('.dp1063-urgent-value');
  if(extra)extra.textContent=L('更重要的是，若心率突然大幅升高或下降，或呼吸出現突發異常，連續監測能協助及早發現變化並提醒主人查看。','More importantly, continuous monitoring can flag abrupt heart-rate or breathing changes for timely review.','急激な心拍・呼吸の変化に気づき、飼い主に確認を促します。','급격한 심박·호흡 변화를 감지해 보호자에게 알려줍니다.');
  if(!note.querySelector('.dp1068-bcg-explain')){const p=document.createElement('span');p.className='dp1068-bcg-explain';p.textContent=L('BCG（Ballistocardiography，心搏微振動圖）：透過項圈感測心搏造成的微小身體振動。','BCG (Ballistocardiography) senses tiny body vibrations associated with heartbeats.','BCG（心弾動図）は心拍による微小な振動を計測します。','BCG(탄도심장도)는 심박에 따른 미세한 진동을 감지합니다.');note.prepend(p);}
 }
 function labelShowroomAlerts(){
  if(state.tab!=='home'||!showroom())return;
  const panel=document.querySelector('#app .dp936-urgent');if(!panel)return;
  for(const item of panel.querySelectorAll('.dp1059-alert-item')){
   if(item.querySelector('.dp1068-showroom-tag'))continue;
   const t=document.createElement('small');t.className='dp1068-showroom-tag';t.textContent=L('展示情境 · 非真實項圈警報','Showcase example · not a real collar alert','展示例・実測警報ではありません','예시 상황 · 실제 경보 아님');item.querySelector('.dp1059-alert-copy')?.append(t);
  }
 }
 const earlierRender=render;
 render=function(...args){const result=earlierRender.apply(this,args);equalHealth();rewriteDeepReasons();detailReasons();examLayout();cleanTerminology();arrows();labelShowroomAlerts();return result;};
 const earlierModal=renderModal;
 renderModal=function(...args){const result=earlierModal.apply(this,args);tutorial();return result;};
 root.DeepPetUX1068=Object.freeze({version:'10.68',description,scope,isEmpty,showroom});
})(window);
