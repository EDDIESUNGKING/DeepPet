/* DeepPet V10.55 — short, evidence-linked owner explanations with optional detail.
 * Presentation only. Scores, pet histories, measurements and alerts remain owned
 * by the existing validated-data gates and scoring engine. */
(function(root){
 'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:
  state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 const good=n=>finite(n)&&n>=0&&n<=100;
 const average=arr=>{const vals=arr.filter(finite);return vals.length?vals.reduce((s,n)=>s+n,0)/vals.length:null;};
 const shown=n=>finite(n)?String(Math.round(n)):'—';
 const score=(samples,key)=>average(samples.map(x=>x?.scores?.[key]).filter(good));
 // Grade the integer actually shown in the ring. 89.6 displays 90, so the
 // copy must not call that same displayed score a 'mild risk'.
 const rank=n=>!good(n)?-1:Math.round(n)>=90?0:Math.round(n)>=80?1:Math.round(n)>=60?2:3;
 const labels={heart:['心跳','Heart rate','心拍','심박'],breath:['呼吸','Breathing','呼吸','호흡'],
  hrv:['HRV','HRV','HRV','HRV'],stable:['心搏節奏','Beat steadiness','心拍リズム','심박 리듬'],
  cardio:['心肺','Cardio','心肺','심폐'],sleep:['睡眠休息','Sleep and rest','睡眠・休息','수면·휴식'],
  energy:['精力','Energy','活力','활력'],recovery:['恢復','Recovery','回復','회복'],
  calm:['放鬆與平穩度','Calm and steadiness','安静時の安定度','휴식 안정도'],
  activityRecovery:['精力與恢復','Energy and recovery','活力と回復','활력·회복'],
  physiol:['生理狀態','Physical status','生理状態','생리 상태'],rhythm:['身體節奏','Body rhythm','身体リズム','신체 리듬']};
 const label=key=>labels[key]?L(...labels[key]):key;
 const compositions={cardio:['heart','breath','hrv','stable'],activityRecovery:['energy','recovery','calm'],
  physiol:['cardio','sleep','activityRecovery'],rhythm:['calm','stable']};
 const actions={
  heart:['先在安靜時看心率，避免拿運動後的數值比較。','Check heart rate at quiet rest, not just after exercise.','安静時の心拍を確認してください。','안정 시 심박을 확인하세요.'],
  breath:['先看安靜時呼吸是否費力或持續偏快。','Check whether quiet-time breathing stays fast or labored.','安静時に速い呼吸や苦しさがないか確認。','안정 시 호흡이 빠르거나 힘든지 확인하세요.'],
  hrv:['固定在相近的休息時段比較HRV，並一起看睡眠。','Compare HRV during similar quiet periods alongside sleep.','同じ安静時のHRVと睡眠を比較。','같은 안정 시간의 HRV와 수면을 비교하세요.'],
  stable:['先確認項圈貼合，再看安靜時的心搏節奏。','Check collar fit, then quiet-time beat steadiness.','装着を確認し、安静時の心拍を比較。','목줄 착용을 확인하고 안정 시 심박을 보세요.'],
  sleep:['先維持安靜、固定的休息環境，今晚再比對。','Keep rest quiet and regular, then compare the next night.','静かな休息環境を保ち、次の夜も比較。','조용하고 규칙적인 휴식 후 다음 날 비교하세요.'],
  energy:['先減少過量活動，留意牠是否比平時不愛動。','Avoid overexertion and watch for reduced willingness to move.','無理な運動を避け、普段との違いを観察。','과도한 활동을 줄이고 평소보다 덜 움직이는지 보세요.'],
  recovery:['先讓牠充分休息，對照相近活動後兩分鐘的恢復。','Allow rest and compare two-minute recovery after similar activity.','同程度の活動後2分間の回復を比較。','충분히 쉬게 하고 비슷한 활동 후 2분 회복을 비교하세요.'],
  calm:['保持安靜環境並確認項圈貼合，再看休息時的數據。','Keep a quiet environment, check fit and compare resting readings.','静かな環境と装着を確認。','조용한 환경에서 착용과 안정 시 수치를 확인하세요.']};
 const remedy=key=>actions[key]?L(...actions[key]):key==='cardio'?L('先核對安靜時心跳和呼吸。','Check quiet-time heart rate and breathing.','安静時の心拍と呼吸を確認。','안정 시 심박과 호흡을 확인하세요.'):
  key==='activityRecovery'?L('先調整活動與休息，再看恢復變化。','Balance activity and rest, then check recovery.','活動と休息を整えて回復を確認。','활동과 휴식 균형을 맞추고 회복을 확인하세요.'):
  key==='rhythm'?L('先在安靜時確認節奏和佩戴狀態。','Check beat rhythm and collar fit at rest.','安静時のリズムと装着を確認。','안정 시 심박 리듬과 착용을 확인하세요.'):
  L('先處理分數最低的項目。','Start with the lowest-scoring area.','低い項目から確認。','낮은 점수부터 확인하세요.');
 function influences(key,samples){
  const weights=root.DeepPetScoreIntegrity?.weights?.[key]||{};
  return (compositions[key]||[]).map(k=>({key:k,n:score(samples,k),w:weights[k]??0}))
   .filter(x=>good(x.n)).map(x=>({...x,impact:(100-x.n)*x.w})).sort((a,b)=>b.impact-a.impact||a.n-b.n);
 }
 const splitDate=date=>/^\d{4}-\d{2}-\d{2}$/.test(date||'');
 function previous(samples){
  if(!samples.length||typeof demoRecords!=='function')return [];
  const first=samples.map(x=>x.row?.date).filter(splitDate).sort()[0];
  if(!first)return [];
  const daily=root.DeepPetSignalScoring?.getDaily?.(state.dog)||[];
  // Real collars may have sparse accepted days. Never borrow daily[i] from
  // the calendar's i-th slot: score records and calendar slots differ.
  const byDate=new Map(daily.filter(x=>splitDate(x?.date)).map(x=>[x.date,x.scores]));
  return demoRecords(state.dog).map((row,i)=>({row:{...row,idx:i},scores:byDate.get(row.date)||null}))
   .filter(x=>x.row.date<first&&x.scores&&typeof validDaySample==='function'&&validDaySample(x.row,x.row.idx)?.valid).slice(-7);
 }
 // Each explanation must point to a measured input that the score engine
 // actually uses. A low score or a long sleep duration is NOT a cause.
 const drivers={
  heart:[['quietHeartRate',.58,.10,'安靜時心率','quiet heart rate','次／分'],['heartSpread',.26,.18,'一天內心率起伏','daily heart-rate variation','次／分'],['heartRate',.16,.15,'整日平均心率','daily mean heart rate','次／分']],
  breath:[['quietBreathRate',.55,.10,'安靜時呼吸速度','quiet breathing rate','次／分'],['breathSpread',.29,.20,'呼吸速度起伏','breathing-rate variation','次／分'],['breathRate',.16,.13,'整日平均呼吸速度','daily mean breathing rate','次／分']],
  hrv:[['rmssd',.60,.18,'相鄰心跳間隔的變化（RMSSD）','beat-to-beat variation (RMSSD)','ms'],['sdnn',.40,.20,'整段心跳間隔的變化（SDNN）','beat-interval variation (SDNN)','ms']],
  stable:[['quietRhythm',.70,.22,'安靜時心搏節奏指標','quiet-time beat rhythm',''],['heartSpread',.30,.20,'心率起伏','heart-rate variation','次／分']],
  sleep:[['restHours',.34,.21,'安靜休息時間','quiet rest duration','小時'],['restFraction',.33,.17,'整天保持安靜的比例','quiet-rest share',''],['nightBreathRate',.20,.12,'夜間呼吸速度','night breathing rate','次／分'],['motionVariation',.13,.24,'休息與活動切換幅度','rest/activity fluctuations','']],
  energy:[['motionMean',.46,.21,'日間活動強度','daytime activity intensity',''],['motionVariation',.22,.27,'活動起伏','activity fluctuations',''],['restHours',.32,.21,'安靜休息時間','quiet rest duration','小時']],
  recovery:[['recoveryDrop',.82,.25,'活動後兩分鐘心率下降幅度','two-minute heart-rate drop','次／分'],['quietHeartRate',.18,.13,'休息時心率','resting heart rate','次／分']],
  calm:[['rmssd',.21,.18,'相鄰心跳間隔的變化（RMSSD）','beat-to-beat variation (RMSSD)','ms'],['sdnn',.14,.20,'整段心跳間隔的變化（SDNN）','beat-interval variation (SDNN)','ms'],['quietHeartRate',.30,.13,'休息時心率','resting heart rate','次／分'],['quietBreathRate',.20,.13,'休息時呼吸速度','resting breathing rate','次／分'],['restFraction',.15,.19,'安靜休息比例','quiet-rest share','']]
 };
 const median=nums=>{const xs=nums.filter(finite).sort((a,b)=>a-b);return xs.length?xs[Math.floor((xs.length-1)/2)]:null;};
 const sameFeatureFamily=(a,b)=>a?.source===b?.source||
   ['minute-demo-no-interbeat','sdk-demo-fixture'].includes(a?.source)&&
   ['minute-demo-no-interbeat','sdk-demo-fixture'].includes(b?.source);
 function measuredDrivers(key,samples){
  const parts=drivers[key];if(!parts||!samples.length)return [];
  const features=root.DeepPetSignalScoring?.getFeatures?.(state.dog)||[];
  const reports=new Map((root.DeepPetSignalScoring?.getDaily?.(state.dog)||[]).map(x=>[x.date,x]));
  const byDate=new Map(features.filter(x=>x?.date).map(x=>[x.date,x]));
  const found=[];
  for(const s of samples){
   const date=s.row?.date,f=byDate.get(date);if(!f)continue;
   const refs=reports.get(date)?.baseline?.references||{};
   for(const [field,weight,tolerance,zh,en,unit] of parts){
    const actual=f[field];if(!finite(actual))continue;
    let reference=refs[field]?.ref;
    if(!finite(reference)||reference<=0){
     // Only earlier same-family days of this owner can become a comparison.
     const history=features.filter(x=>x?.date<date&&sameFeatureFamily(x,f)&&finite(x[field])&&x[field]>=0)
      .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,14).map(x=>x[field]);
     if(history.length>=3)reference=median(history);
    }
    if(field==='recoveryDrop'&&(!finite(reference)||reference<=0)){
     const effort=f.recoveryEvents?.filter(x=>finite(x.intensity)&&x.intensity>0)||[];
     const similar=features.filter(x=>x?.date<date&&sameFeatureFamily(x,f)).flatMap(x=>x.recoveryEvents||[])
      .filter(x=>finite(x.drop)&&finite(x.intensity)&&effort.some(e=>Math.abs(e.intensity-x.intensity)<=Math.max(.001,e.intensity*.25)))
      .map(x=>x.drop);
     if(similar.length>=3)reference=median(similar);
    }
    if(!finite(reference)||reference<=0)continue;
    const delta=actual-reference,relative=delta/reference;
    if(Math.abs(relative)<.025)continue;
    // Rank clues by the same feature weights and approximate relative
    // tolerances as the scoring model; do not claim an exact point deduction.
    const signal=weight*(1-Math.exp(-.5*Math.pow(relative/Math.max(.01,tolerance),2)));
    if(!finite(signal))continue;
    found.push({key,field,date,actual,reference,delta,relative,signal,zh,en,unit});
   }
  }
  // Across 7/30 days show the strongest observed deviation AND how often it
  // repeated; do not quietly pretend a single worst day lasted all month.
  const grouped=new Map();
  for(const row of found){const group=grouped.get(row.field)||[];group.push(row);grouped.set(row.field,group);}
  return [...grouped.values()].map(rows=>{
   rows.sort((a,b)=>b.signal-a.signal);return {...rows[0],count:rows.length,days:rows.map(x=>x.date)};
  }).sort((a,b)=>b.signal-a.signal).slice(0,3);
 }
 function driverPhrase(x,days){
  const name=state.lang==='en'?x.en:x.zh,unit=state.lang==='en'?({'次／分':'/min','小時':'h'}[x.unit]||x.unit):x.unit;
  const percent=x.field==='restFraction';
  const number=v=>Number((percent?v*100:v).toFixed(x.unit==='小時'?1:x.unit==='次／分'?1:percent?0:2)).toString();
  const shownUnit=percent?'%':unit;
  const delta=Math.round(Math.abs(x.relative)*100),direction=x.delta>0?L('偏高','higher','高め','높음'):L('偏低','lower','低め','낮음');
  // Historical single-day review must not label an older score as "Today".
  const today=typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):null;
  const when=days===1&&x.date===today?L('今天','Today','今日','오늘'):x.date;
  return L(`${when}${name} ${number(x.actual)}${shownUnit}，相較同條件參考 ${number(x.reference)}${shownUnit}${direction}約${delta}%。`,
   `${when}: ${name} ${number(x.actual)} ${shownUnit}, ${delta}% ${x.delta>0?'above':'below'} its comparable reference of ${number(x.reference)} ${shownUnit}.`,
   `${when}の${name}は${number(x.actual)}${shownUnit}、比較基準${number(x.reference)}${shownUnit}から約${delta}%ずれています。`,
   `${when} ${name} ${number(x.actual)}${shownUnit}, 비교 기준 ${number(x.reference)}${shownUnit}와 약 ${delta}% 차이입니다.`);
 }
 function concreteReason(key,samples,days){
  const observed=measuredDrivers(key,samples);
  let sleepContext='';
  if(key==='sleep'&&typeof dpNightSleepStats==='function'){
   const nights=samples.map(x=>{try{return dpNightSleepStats(x.row.idx);}catch{return null;}})
    .filter(x=>finite(x?.minutes)&&finite(x?.wakes));
   const duration=average(nights.map(x=>x.minutes)),wakes=average(nights.map(x=>x.wakes));
   if(finite(duration)&&finite(wakes))sleepContext=L(`安靜休息約${(duration/60).toFixed(1)}小時、夜間中斷約${wakes.toFixed(1)}次；時間長或只中斷幾次，不代表整晚休息就穩定。`,
    `Quiet rest was about ${(duration/60).toFixed(1)} hours with ${wakes.toFixed(1)} interruptions. Duration and interruption count alone do not determine the score.`,
    `休息約${(duration/60).toFixed(1)}時間、中断約${wakes.toFixed(1)}回。時間だけで睡眠の点数は決まりません。`,
    `안정 휴식 약 ${(duration/60).toFixed(1)}시간, 중단 ${wakes.toFixed(1)}회입니다. 시간만으로 점수가 결정되지 않습니다.`);
  }
  if(!observed.length)return L('目前可核對的量測明細或同條件參考值還不夠，無法誠實判定是哪個波動拉低分數；先累積可比較的記錄。',
   'Verified feature details or comparable references are missing, so the exact source of the low score cannot be established yet.',
   '比較できる測定値が不足しており、低得点の原因を特定できません。',
   '비교 가능한 측정값이 부족하여 낮은 점수의 원인을 특정할 수 없습니다.');
  const frequency=days>1?L(`本期${observed[0].count}個有效日有這類差距。`,`This gap appeared on ${observed[0].count} valid days.`,`期間中${observed[0].count}日に同様の差がありました。`,`기간 ${observed[0].count}일에 이런 차이가 있었습니다.`):'';
  return sleepContext+' '+L('最明顯的變化是：','The clearest measured change: ','大きな変化：','주요 변화: ')+
   observed.slice(0,2).map(x=>driverPhrase(x,days)).join(' ')+frequency+
   L('這是評分使用的觀察線索，不等於已確定的疾病原因。','These are scoring inputs, not a confirmed medical cause.','採点に使った観察値であり、病気の原因とは限りません。','점수에 사용된 관찰값이며 질병 원인을 확정하지 않습니다.');
 }
 function evidenceFor(key,samples,days){
  if(drivers[key])return concreteReason(key,samples,days);
  const field={heart:'heart',breath:'breath',energy:'activity',hrv:'rmssd'}[key];
  if(field){
   const curr=average(samples.map(x=>x.row?.[field]).filter(finite));
   const prior=average(previous(samples).map(x=>x.row?.[field]).filter(finite));
   const unit=key==='heart'||key==='breath'?L('次／分','/min','回／分','회／분'):key==='hrv'?' ms':'';
   if(finite(curr)){
    const title=key==='hrv'?'RMSSD':key==='energy'?L('活動指數','Activity index','活動指数','활동 지수'):label(key);
    const data=`${title} ${curr.toFixed(key==='hrv'?1:0)}${unit}`;
    if(finite(prior)&&prior>0&&previous(samples).length>=3){
     const diff=curr-prior,tol=key==='heart'?2:key==='breath'?1:key==='hrv'?2:8;
     const direction=Math.abs(diff)<tol?L('接近','near','ほぼ同じ','유사'):
      diff>0?L('高於','above','より高い','높음'):L('低於','below','より低い','낮음');
     return L(`${data}；較早有效日 ${prior.toFixed(key==='hrv'?1:0)}${unit}，目前${direction}先前平均。需結合當時活動情況。`,
      `${data}; earlier valid days averaged ${prior.toFixed(key==='hrv'?1:0)}${unit}. Currently ${direction} that average; activity context matters.`,
      `${data}。以前の有効日平均 ${prior.toFixed(key==='hrv'?1:0)}${unit} と比較してください。`,
      `${data}; 이전 유효일 평균 ${prior.toFixed(key==='hrv'?1:0)}${unit} 와 비교하세요.`);
    }
    return L(`${data}；目前缺少足夠可比較的先前記錄，還不能只憑此值確定偏高或偏低。`,
     `${data}. No sufficient comparable earlier reading to determine direction.`,
     `${data}。比較できる過去記録が不足しています。`,
     `${data}. 비교할 과거 데이터가 부족합니다.`);
   }
  }
  if(key==='sleep'&&typeof dpNightSleepStats==='function'){
   const stats=samples.map(x=>{try{return dpNightSleepStats(x.row.idx);}catch(_){return null;}}).filter(Boolean);
   if(stats.length){
    const hrs=average(stats.map(x=>finite(x.minutes)?x.minutes/60:null));
    const wakes=average(stats.map(x=>finite(x.wakes)?x.wakes:null));
    if(finite(hrs)&&finite(wakes))return L(`安靜休息約 ${hrs.toFixed(1)} 小時，夜間平均中斷 ${wakes.toFixed(1)} 次。休息時間長不代表沒有被打斷。`,
     `Quiet rest ${hrs.toFixed(1)} h; night interruptions averaged ${wakes.toFixed(1)}. Duration does not prove continuity.`,
     `安静休息 ${hrs.toFixed(1)} 時間、夜間中断平均 ${wakes.toFixed(1)} 回。`,
     `안정 휴식 ${hrs.toFixed(1)}시간, 밤중 중단 평균 ${wakes.toFixed(1)}회.`);
   }
  }
  if(key==='recovery'&&typeof dpOwnerRecoveryComparison==='function'){
   const rec=samples.slice(-3).map(x=>{try{return dpOwnerRecoveryComparison(x.row);}catch(_){return null;}}).filter(x=>finite(x?.average));
   if(rec.length)return L(`最近 ${rec.length} 個有效時段，活動後兩分鐘心率平均回落 ${average(rec.map(x=>x.average)).toFixed(1)} 次／分。`,
    `${rec.length} valid activity periods: two-minute heart-rate drop ${average(rec.map(x=>x.average)).toFixed(1)} bpm on average.`,
    `直近${rec.length}回の2分間心拍低下は平均 ${average(rec.map(x=>x.average)).toFixed(1)} 回／分。`,
    `최근 유효 운동 ${rec.length}회, 2분 심박 하강 평균 ${average(rec.map(x=>x.average)).toFixed(1)}회/분.`);
  }
  const vals=samples.map(x=>x.scores?.[key]).filter(good);
  if(vals.length)return L(`有效評分介於 ${shown(Math.min(...vals))}–${shown(Math.max(...vals))} 分；分數代表綜合變化，不能推斷單一疾病原因。`,
   `Valid scores ranged ${shown(Math.min(...vals))}–${shown(Math.max(...vals))}; the score alone does not prove a medical cause.`,
   `有効スコア ${shown(Math.min(...vals))}～${shown(Math.max(...vals))} 点。`,
   `유효 점수 ${shown(Math.min(...vals))}~${shown(Math.max(...vals))}점입니다.`);
  return L('這段期間沒有足夠的可比較數據。','Not enough comparable observations in this period.','比較に十分な記録がありません。','비교할 기록이 충분하지 않습니다.');
 }
 function persistence(key,samples,days){
  const vals=samples.map(x=>x.scores?.[key]).filter(good),low=vals.filter(v=>v<60).length;
  if(!vals.length)return L('有效資料不足。','Not enough valid readings.','記録が不足しています。','유효 기록이 부족합니다.');
  if(days===1){
   const pri=score(previous(samples),key),cur=score(samples,key);
   const chosen=samples[0]?.row?.date;
   const today=typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):null;
   const subject=chosen&&chosen!==today?chosen:L('今天','Today','今日','오늘');
   if(finite(pri)&&previous(samples).length>=3)return L(`與之前有效日平均 ${shown(pri)} 分相比，${subject}${Math.abs(cur-pri)<5?'相近':cur>pri?'較好':'較低'}。`,
    `Earlier valid days averaged ${shown(pri)}/100; the result for ${subject} is ${Math.abs(cur-pri)<5?'close to':cur>pri?'higher than':'lower than'} that average.`,
    `過去の有効日平均 ${shown(pri)} 点と比較。`,`이전 유효일 평균 ${shown(pri)}점과 비교하세요.`);
   return L('單日不足以判斷是否持續，請與之後的安靜狀態比較。','One day cannot establish persistence; compare future quiet observations.','1日だけでは持続の判断はできません。','하루 기록만으로 지속 여부를 판단할 수 없습니다.');
  }
  const short= L(`本期 ${vals.length} 個有效日，${low} 日低於60分。`,
    `${low} of ${vals.length} valid days were below 60.`,
    `有効${vals.length}日のうち${low}日が60点未満。`,
    `유효 ${vals.length}일 중 ${low}일이 60점 미만입니다.`);
  if(vals.length<4)return short;
  const cut=Math.floor(vals.length/2),early=average(vals.slice(0,cut)),late=average(vals.slice(cut));
  if(!finite(early)||!finite(late))return short;
  const delta=late-early;
  return short+' '+(Math.abs(delta)<5?
    L('前後變化不大；若仍低分，就代表持續偏低。','Little change across the period; a low score remains low.','前後差は小さく、低い場合は継続して低水準です。','앞뒤 변화는 작아도 낮은 점수는 계속 낮은 상태입니다.'):
    delta>0?L(`後半比前半好約${shown(delta)}分，但仍應看目前風險。`,`Later days improved by about ${shown(delta)} points; check the current risk.`,`後半は約${shown(delta)}点改善。`,`후반은 약 ${shown(delta)}점 개선됐습니다.`):
    L(`後半比前半低約${shown(-delta)}分，應留意是否繼續下降。`,`Later days fell by about ${shown(-delta)} points; monitor further change.`,`後半は約${shown(-delta)}点低下。`,`후반은 약 ${shown(-delta)}점 하락했습니다.`));
 }
 function recoverySignal(key,focus){
  if(focus?.length){const names=focus.map(x=>label(x.key)).join(L('、',', ','・', ', '));
   return L(`接下來在相近條件下，${names}的分數持續回升，才算有改善跡象。`,
    `Look for sustained improvement in ${names} under comparable conditions.`,
    `同じ条件で${names}の点数が継続して改善するか確認。`,
    `비슷한 조건에서 ${names} 점수가 지속적으로 좋아지는지 확인하세요.`);}
  return L(`未來數次在相近情況下，${label(key)}回到牠平常的範圍，才算有改善跡象。`,
   `Look for ${label(key)} returning toward its usual range over several comparable readings.`,
   `同じ条件で${label(key)}が普段の範囲に戻るか確認。`,
   `비슷한 조건에서 ${label(key)}가 평소 범위로 돌아오는지 확인하세요.`);
 }
 function insight(key,samples,days){
  const n=score(samples,key),level=rank(n),items=influences(key,samples);
  if(level<0)return {headline:L('資料不足，暫時無法分析。','Not enough readings to analyze.','記録が不足しています。','기록이 부족합니다.'),action:'',details:[],score:null,level:-1,focus:[]};
  const focus=items.filter(x=>x.n<90).slice(0,level>=3?3:level>=2?2:1);
  const primary=focus[0]?.key||key;
  const names=focus.map(x=>label(x.key)).join(L('、',', ','・', ', '));
  let headline;
  if(level===0){
   const outlier=items.find(x=>x.n<80);
   headline=outlier?L(`綜合分數不錯，但${label(outlier.key)}較低，仍值得留意。`,
     `The overall score is good, but ${label(outlier.key)} is lower and still worth checking.`,
     `総合点は良好ですが、${label(outlier.key)}には注意が必要です。`,
     `전체 점수는 좋지만 ${label(outlier.key)} 점수는 낮아 살펴봐야 합니다.`):
    L('這段期間整體狀態良好。','Overall readings are favorable in this period.','全体として良好な状態です。','이 기간 전반적으로 좋은 상태입니다.');
  }
  else if(items.length)headline=level===1?L(`${names}略有偏低。`,`${names} is mildly lower.`,`${names}がやや低めです。`,`${names}가 약간 낮습니다.`):
   level===2?L(`主要是${names}拉低分數。`,`Main lower contributors: ${names}.`,`主に${names}が点数を下げています。`,`주요 낮은 항목은 ${names}입니다.`):
   L(`${names}明顯偏低，應優先關注。`,`${names} is especially low and needs priority attention.`,`${names}が大きく低下。優先確認が必要です。`,`${names} 점수가 매우 낮아 먼저 확인해야 합니다.`);
  else headline=level===1?L('這項狀態略有偏低。','This area is mildly lower.','この状態は少し低めです。','이 항목은 약간 낮습니다.'):
   level===2?L('這項狀態明顯偏低。','This area is notably low.','この状態は明らかに低めです。','이 항목은 뚜렷하게 낮습니다.'):
   L('這項狀態很低，應優先留意。','This area is very low and needs attention.','この状態はかなり低めです。','이 항목이 매우 낮아 확인이 필요합니다.');
  // Low scores must explain WHY, using an observed scoring input, instead of
  // repeating a score range or blaming two interruptions without evidence.
  if(level>=2){
   const clues=measuredDrivers(primary,samples),main=clues[0];
   if(main){
    const name=state.lang==='en'?main.en:main.zh,delta=Math.round(Math.abs(main.relative)*100);
    const direction=main.delta>0?L('偏高','higher','高め','높음'):L('偏低','lower','低め','낮음');
    headline=L(`這項分數${level===3?'非常低':'偏低'}，主要要回看${name}：${main.date}比參考${direction}約${delta}%。`,
      `This score is ${level===3?'very low':'low'}; check ${name} on ${main.date}, ${delta}% ${main.delta>0?'above':'below'} its reference.`,
      `点数が低く、${main.date}の${name}が基準から約${delta}%ずれています。`,
      `점수가 낮으며 ${main.date}의 ${name}이 기준과 약 ${delta}% 차이 납니다.`);
   }else headline=L('這項分數偏低，但目前缺少可核對的主要波動原因；不能把分數當作診斷。',
     'The score is low, but the readings do not yet establish which change drove it.',
     '点数は低いものの、主な測定上の理由はまだ特定できません。',
     '점수는 낮지만 어떤 변화가 주원인인지 확인할 데이터가 부족합니다.');
  }
  const action=level===0&&items.some(x=>x.n<80)?remedy(items.find(x=>x.n<80).key):level===0?L('維持現在的生活節奏即可。','Keep the familiar routine.','普段の生活を続けてください。','평소 생활을 유지하세요.'):
   remedy(items.length?primary:key);
  const details=[];
  if(level>=2&&focus.length&&key!==focus[0].key)details.push({title:L('主要影響','Main contributors','主な影響','주요 영향'),
   text:focus.map(x=>`${label(x.key)} ${shown(x.n)}/100`).join(L('、',', ','・', ', '))});
  details.push({title:L('數據依據','Measured evidence','測定データ','측정 근거'),text:evidenceFor(items.length?primary:key,samples,days)});
  details.push({title:L('持續多久','How long','継続状況','지속 기간'),text:persistence(key,samples,days)});
  details.push({title:L('怎樣算改善','Improvement to look for','改善の目安','개선 확인'),text:recoverySignal(key,focus)});
  if(level===3)details.push({title:L('需要注意','Seek help when','注意点','주의'),text:L('如果連續低分或精神、食慾明顯改變，請儘快聯繫獸醫；呼吸費力、倒下或牙齦發藍要立即就醫。',
    'Contact a vet for persistent lows or clear appetite/energy changes. Labored breathing, collapse or blue gums need urgent veterinary care.',
    '低下が続く、元気や食欲が変わる場合は獣医師に相談。呼吸困難や倒れた場合は緊急受診。',
    '낮은 점수가 지속되거나 식욕·활력이 변하면 수의사와 상담하세요. 호흡 곤란이나 쓰러짐은 즉시 진료받으세요.')});
  return {headline,action,details,score:n,level,focus};
 }
 function detailElement(data){
  const details=document.createElement('details');details.className='dp1055-details';
  const summary=document.createElement('summary');summary.textContent=L('查看詳細原因與改善','Why and how to improve','原因と改善を見る','원인과 개선 보기');
  const arrow=document.createElement('span');arrow.className='dp1055-chevron';arrow.textContent='›';arrow.setAttribute('aria-hidden','true');summary.append(arrow);details.append(summary);
  const body=document.createElement('div');body.className='dp1055-evidence';
  for(const item of data.details){const section=document.createElement('section'),b=document.createElement('b'),p=document.createElement('p');
   b.textContent=item.title;p.textContent=item.text;section.append(b,p);body.append(section);}
  details.append(body);return details;
 }
 function insertNarrative(p,data,wrap){
  if(!p||!data)return;
  p.textContent=data.headline;p.classList.add('dp1055-headline');
  const parent=wrap||p.parentElement;if(!parent)return;
  const after=document.createElement('div');after.className='dp1055-bottom';
  if(data.action){const action=document.createElement('p');action.className='dp1055-next';
   const label=document.createElement('b');label.textContent=L('先做：','Next: ','まず：','먼저: ');action.append(label,document.createTextNode(data.action));after.append(action);}
  if(data.details.length)after.append(detailElement(data));
  p.insertAdjacentElement('afterend',after);
 }
 function deep(){
  if(state.tab!=='deep'||state.detail||![1,7,30].includes(Number(state.range)))return;
  const days=Number(state.range),samples=root.DeepPetUX1050?.scope?.(days)||[];if(!samples.length)return;
  if(Number(state.deepType)===0){
   const card=document.querySelector('#app .dp903-heart');if(!card)return;
   insertNarrative(card.querySelector('.dp903-overview-copy>p'),insight('cardio',samples,days));
   for(const key of ['heart','breath','hrv','stable'])insertNarrative(card.querySelector(`[data-dp903-metric="${key}"] .dp903-metric-left>p`),insight(key,samples,days));
  }
  if(Number(state.deepType)===1){
   const card=document.querySelector(days===1?'#app .dp-owner-sleep':'#app .dp905-sleep-summary');
   const p=card?.querySelector('.dp1052-sleep-reason');if(!p)return;
   insertNarrative(p,insight('sleep',samples,days));
  }
  if(Number(state.deepType)===2){
   const card=document.querySelector('#app .dp901-health-score');if(!card)return;
   insertNarrative(days===1?card.querySelector('.dp901-overall-desc'):card.querySelector('.dp901-period-notes>p'),insight('activityRecovery',samples,days));
   const all=card.querySelectorAll('.dp901-metric-card');
   ['energy','recovery','calm'].forEach((key,i)=>insertNarrative(all[i]?.querySelector('.dp901-metric-desc'),insight(key,samples,days)));
   // The full two-minute recovery explanation belongs in expanded evidence.
   const extra=card.querySelector('.dp911-recovery-label'),detail=all[1]?.querySelector('.dp1055-details .dp1055-evidence');
   if(extra&&detail){const section=document.createElement('section'),b=document.createElement('b'),p=document.createElement('p');
    b.textContent=L('活動後測量','Post-activity reading','運動後測定','활동 후 측정');p.textContent=extra.textContent;section.append(b,p);detail.append(section);extra.remove();}
  }
 }
 function recap(){
  if(state.tab!=='health'||state.detail!=='summary')return;
  const days=Number(state.healthSummaryDays)===30?30:7,samples=root.DeepPetUX1050?.scope?.(days)||[];
  if(!samples.length)return;
  document.querySelectorAll('#app .dp850-score-panel').forEach((panel,i)=>{
   const p=panel.querySelector('.dp1050-recap-reason');
   const result=insight(i===0?'physiol':'rhythm',samples,days);
   insertNarrative(p,result);
  });
 }
 function exam(){
  if(state.tab!=='health'||state.detail!=='dp921-report')return;
  const p=document.querySelector('#app .dp1050-exam-reason');if(!p)return;
  const records=typeof root.dp914ReportRecords==='function'?root.dp914ReportRecords(state.dog):[];
  const pet={...currentDog(),petId:String(state.dog)};
  // Only use the report currently displayed; never mix separate exams.
  const shownDate=document.querySelector('#app .dp921-details-head')?.textContent.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  const selected=document.querySelector('#app [data-dp921="edit-report"]')?.dataset.id;
  const rows=records.filter(x=>x.date===shownDate&&(!selected||
    `${String(x.reportId||'legacy:'+x.date)}::${x.date}`===selected));
  const result=root.DeepPetLabEvidence?.assess?.(rows,pet,shownDate);
  if(!rows.length||!result||!good(result.score))return;
  const scored=(result.records||[]).filter(x=>good(x.score)).sort((a,b)=>a.score-b.score);
  const low=scored.filter(x=>x.score<90),n=result.score,level=rank(n),focus=low.slice(0,level===3?3:2);
  const bilingual=x=>{const entry=typeof labI18n==='function'?labI18n(x.name):null;
   const translated=entry?.known?state.lang==='en'?entry.en:state.lang==='ja'?entry.ja:state.lang==='ko'?entry.ko:entry.zh:x.name;
   return entry?.known?`${translated}（${entry.code}）`:String(x.name||'');};
  const names=focus.map(bilingual).join(L('、',', ','、', ', '));
  const headline=level===0?L('已評估項目大致穩定。','Assessed results are broadly favorable.','評価項目は概ね良好です。','평가된 항목은 대체로 양호합니다.'):
   L(`主要是${names||'部分檢驗項目'}拉低分數。`,`Lower results: ${names||'some examined items'}.`,`低い検査項目：${names||'一部の結果'}。`,`낮은 항목: ${names||'일부 검사 결과'}.`);
  const explainLab=x=>{
   const r=x.reference,measured=finite(r?.value)?r.value:finite(Number(x.value))?Number(x.value):null;
   const unit=r?.unit||x.unit||'',range=r?.ok===true?`${r.low}–${r.high} ${unit}`:null;
   const position=range&&finite(measured)?measured<r.low?L('低於下限','below the minimum','下限未満','하한 미만'):
    measured>r.high?L('高於上限','above the maximum','上限超過','상한 초과'):
    L('位於範圍內，但須核對原報告標記','within range; verify the original flag','基準内・原報告を確認','기준 내, 원본 표시 확인'):null;
   return `${bilingual(x)}：${finite(measured)?measured+' '+unit:L('數值待核對','Value pending','数値を確認','수치 확인 필요')}。${range?
    L(`參考 ${range}，${position}。`,`Reference ${range}; ${position}.`,`基準 ${range}、${position}。`,`기준 ${range}, ${position}.`):
    L('缺少可核對的適用參考範圍，請先確認原始檢驗單。','No verified applicable reference interval; check the original report.',
     '適用基準範囲を原票で確認してください。','적용 참고 범위를 원본에서 확인하세요.')}`;
  };
  const details=[{title:L('偏離的項目','Flagged results','注意項目','주의 항목'),text:focus.map(explainLab).join(' ')||L('沒有明顯偏低的項目。','No notable low result.','大きく低い項目はありません。','특별히 낮은 항목이 없습니다.')},
    {title:L('核對方式','Review with report','確認方法','확인 방법'),text:L('點開各項檢驗查看實際值、適用參考區間與單位；沒有可靠範圍的項目不應當作確診。','Expand each result for its value, units and applicable reference; missing ranges are not a diagnosis.','各項目の値・単位・基準範囲を確認してください。','각 항목의 수치·단위·적용 기준을 확인하세요.')},
    {title:L('怎樣算改善','Improvement to look for','改善の目安','개선 확인'),text:L('按獸醫建議複查偏離項目；回到適用範圍並維持穩定才是改善跡象。','Recheck flagged results as advised; moving toward the applicable range is a positive sign.','獣医師の指示で再検査し、適用範囲への回復を確認。','수의사 지시에 따라 재검하고 적용 범위 회복을 확인하세요.')}];
  insertNarrative(p,{headline,action:level>=2?L('帶原始報告給獸醫，優先核對低分項目。','Review the lowest results with a vet and the original report.','原本を獣医師に見せて低い項目を確認。','원본 보고서로 낮은 항목을 수의사와 확인하세요.'):'',details});
 }
 const priorRender=render;
 render=function(reset=false){priorRender(reset);deep();recap();exam();
  document.querySelectorAll('.app-build-version').forEach(x=>x.textContent='DeepPet Version '+(root.DeepPetBuildVersion||'10.55'));
 };
 root.DeepPetUX1055={version:'10.55',insight,influences,evidenceFor,persistence};
})(window);
