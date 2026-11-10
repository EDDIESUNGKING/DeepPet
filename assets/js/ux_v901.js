/* DeepPet V9.01 — layout repair & avatar preload patch */
(function(){
'use strict';
const tx=(zht,zh,en,ko,ja)=>state.lang==='zh'?zh:state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?(ja||en):zht;
const num=v=>v===null||v===undefined||!Number.isFinite(Number(v))?null:Number(v);
const safe=(v,d=0)=>v===null||v===undefined||!Number.isFinite(Number(v))?'—':Number(v).toFixed(d);
const avg=arr=>arr.length?arr.reduce((s,x)=>s+x,0)/arr.length:null;
const avgScore=arr=>arr.length?dpOwnerQualityValue(avg(arr)):null;
const scoreTheme=s=>s===null?'none':s>=90?'normal':s>=80?'light':s>=60?'medium':'high';
const gradeText=s=>s===null?tx('資料不足','数据不足','Insufficient data','데이터 부족','データ不足'):s>=90?tx('健康','健康','Healthy','건강','健康'):s>=80?tx('低風險','低风险','Mild','가벼운 주의','軽度注意'):s>=60?tx('中風險','中风险','Moderate','중간 주의','中程度注意'):tx('高風險','高风险','Risk','높은 주의','高度注意');
const statusText=s=>s===null?tx('資料不足','数据不足','Insufficient data','데이터 부족','データ不足'):s>=90?tx('表現很好','表现很好','Doing great','매우 좋아요','とても良好'):s>=80?tx('狀態穩定','状态稳定','Looking steady','안정적이에요','安定しています'):s>=60?tx('稍微留意','稍微留意','Keep an eye on it','조금 살펴봐요','少し注意'):tx('需要多留意','需要多留意','Needs attention','주의가 필요해요','注意が必要');
function scoreCol(score,color){
  const theme=scoreTheme(score), ring=score===null?'<div class="dp90-unavailable">—</div>':dpDeepDottedScore(score,color||scoreScheme(score).color);
  return `<div class="dp901-score-col ${theme}">${ring}<span class="dp901-score-tag">${gradeText(score)}</span></div>`;
}
function expander(label,body){
  if(!body)return '';
  return `<details class="dp901-expand"><summary>${label}</summary><div class="dp901-expand-body">${body}</div></details>`;
}
function metricCard(title,score,description,options={}){
  const {color,metaHtml='',chartLabel='',chartHtml=''}=options;
  return `<section class="dp901-metric-card"><div class="dp901-card-head"><div class="dp901-card-copy"><h3>${title}</h3></div>${scoreCol(score,color)}</div><p class="dp901-metric-desc">${description}</p>${metaHtml}${expander(chartLabel,chartHtml)}</section>`;
}
function rhythmHelp(){
  return `<details class="dp901-rhythm-help"><summary>${tx('什麼是心搏節奏穩定度？','什么是心搏节奏稳定度？','What is heartbeat rhythm stability?','심박 리듬 안정도란?','心拍リズム安定度とは？')}</summary><p>${tx('比較有效心搏間隔的規律性、短期變化與這隻寵物自己的個體基準。分數越高，代表越接近平常模式。這不是心電圖，也不能單獨診斷心律不整。','比较有效心搏间隔的规律性、短期变化与这只宠物自己的个体基准。分数越高，代表越接近平常模式。这不是心电图，也不能单独诊断心律失常。','It compares valid beat-interval consistency and short-term variation with this pet’s own baseline. Higher scores mean the pattern is closer to usual. It is not an ECG and cannot diagnose arrhythmia on its own.','유효 심박 간격의 규칙성과 단기 변화를 개인 기준과 비교합니다. 점수가 높을수록 평소 패턴에 가깝습니다. 심전도나 부정맥 진단은 아닙니다.','有効な心拍間隔の規則性と短期変動を、この子自身の基準と比較します。高いほど普段のパターンに近いことを示します。心電図ではなく、不整脈診断はできません。')}</p></details>`;
}
function recoveryNarrative(recovery){
  if(!recovery)return tx('當天沒有足夠品質的活動結束點與心率序列，暫不給出恢復分數。','当天没有足够质量的活动结束点与心率序列，暂不显示恢复分数。','There is no valid activity-end / heart-rate pair, so a recovery score is withheld.','유효한 회복 자료가 없어 회복 점수를 표시하지 않습니다.','有効な回復データがないため、回復点数は表示しません。');
  return tx(`活動結束後兩分鐘，心率平均下降 ${safe(recovery.average,1)} bpm。${recovery.reference!==null?`與同一隻寵物、相近活動的前期均值 ${safe(recovery.reference,1)} bpm 比較，差異 ${recovery.diff>=0?'+':''}${safe(recovery.diff,1)} bpm。`:'相近活動紀錄仍在建立比較基準。'}`,
            `活动结束后两分钟，心率平均下降 ${safe(recovery.average,1)} bpm。${recovery.reference!==null?`与同一只宠物、相近活动的前期均值 ${safe(recovery.reference,1)} bpm 比较，差异 ${recovery.diff>=0?'+':''}${safe(recovery.diff,1)} bpm。`:'类似活动记录仍在建立比较基准。'}`,
            `Heart rate dropped ${safe(recovery.average,1)} bpm within two minutes after activity stopped. ${recovery.reference!==null?`Compared with a prior mean of ${safe(recovery.reference,1)} bpm for similar efforts, the difference is ${recovery.diff>=0?'+':''}${safe(recovery.diff,1)} bpm.`:'Comparable prior efforts are still limited.'}`,
            `활동 종료 후 2분 동안 심박수가 평균 ${safe(recovery.average,1)} bpm 감소했습니다.`,
            `活動終了後2分間で心拍数は平均 ${safe(recovery.average,1)} bpm 低下しました。`);
}
function energyDayView(cp,row){
  const scores=dpOwnerDayScores(row,true), raw=rhythmData().values[row.idx], calm=raw?dpOwnerQualityValue(rhythmPositiveValue('calm',raw)):null, recovery=dpOwnerRecoveryComparison(row), recScore=recovery?.score??null;
  const overall=scores.energyActivity;
  const lead=tx(`今天精力 ${scores.energy} 分；${recScore===null?'恢復紀錄不足':`恢復 ${recScore} 分`}。身體節奏中的放鬆與平穩度為 ${calm??'—'} 分。`,
                `今天精力 ${scores.energy} 分；${recScore===null?'恢复记录不足':`恢复 ${recScore} 分`}。身体节奏中的放松与平稳度为 ${calm??'—'} 分。`,
                `Energy is ${scores.energy}/100 today; ${recScore===null?'recovery is not yet available':`recovery is ${recScore}/100`}. Rest & steadiness is ${calm??'—'}/100.`,
                `오늘 활력은 ${scores.energy}점이며 회복은 ${recScore===null?'자료 부족':recScore+'점'}입니다.`,
                `今日の活力は ${scores.energy} 点、回復は ${recScore===null?'データ不足':recScore+' 点'}です。`);
  const energy=metricCard(
    tx('精力情況','精力情况','Energy status','활력 상태','活力状況'),
    scores.energy,
    tx('由活動與休息記錄估算當日精力，需與這隻寵物自己的日常模式比較。','由活动与休息记录估算当日精力，需与这只宠物自己的日常模式比较。','Estimated from movement and rest, and should be compared with this pet’s own routine.','활동·휴식 패턴으로 추정한 활력입니다.','活動と休息から推定した活力で、この子自身の普段の状態と比べて看ます。'),
    {color:scoreScheme(scores.energy).color, chartLabel:tx('查看精力趨勢','查看精力趋势','View energy trend','활력 추세 보기','活力推移を見る'), chartHtml:dpEnergyHourlyChart(row,scores.energy)}
  );
  const recoveryMeta=recovery?`<div class="dp901-meta-row"><span class="dp901-meta-chip">${tx('停止時','停止时','At stop','종료 시','停止時')} <b>${safe(recovery.peak,1)} bpm</b></span><span class="dp901-meta-chip">${tx('兩分鐘後','两分钟后','After 2 min','2분 후','2分後')} <b>${safe(recovery.at2,1)} bpm</b></span></div>`:'';
  const recover=metricCard(
    tx('恢復情況','恢复情况','Recovery status','회복 상태','回復状況'),
    recScore,
    recoveryNarrative(recovery),
    {color:recScore===null?'#aab0bc':scoreScheme(recScore).color, metaHtml:recoveryMeta, chartLabel:recovery?tx('查看兩分鐘心率下降曲線','查看两分钟心率下降曲线','View 2-minute HR recovery','2분 심박 회복 보기','2分間の心拍回復を見る'):'', chartHtml:recovery?dpOwnerRecoveryCurve(row,recovery):''}
  );
  const calmCard=metricCard(
    tx('放鬆與平穩度','放松与平稳度','Rest & steadiness','휴식과 안정도','リラックスと安定度'),
    calm,
    tx('根據安靜時的心搏間隔與 HRV 變化，和這隻寵物的個體基準比較；不能單獨診斷情緒或疾病。','根据安静时的心搏间隔与 HRV 变化，与这只宠物的个体基准比较；不能单独诊断情绪或疾病。','Compares quiet-time beat intervals and HRV with this pet’s own baseline; it is not an emotion or disease diagnosis.','휴식 중 심박 간격과 HRV를 개인 기준과 비교합니다.','安静時の心拍間隔と HRV を個体基準と比較します。感情や病気の診断ではありません。')
  );
  return `<section class="card dp901-health-score dp901-status-panel"><div class="dp901-overall-head"><div class="dp901-overall-copy"><h2>${tx('精力與恢復狀態','精力与恢复状态','Energy & Recovery','활력과 회복 상태','活力と回復状態')}</h2><p class="dp901-overall-verdict">${statusText(overall)}</p></div>${scoreCol(overall,scoreScheme(overall).color)}</div><p class="dp901-overall-desc">${lead}</p>${energy}${recover}${calmCard}${dpMetricUsageNotes(2)}</section>`;
}
function energyPeriodView(cp,days){
  const rows=dayRowsWithIndex(days).filter(r=>validDaySample(r,r.idx).valid);
  if(!rows.length)return `<section class="card">${tx('有效資料不足','有效数据不足','Not enough valid data','유효 데이터 부족','有効データ不足')}</section>`;
  const scoreList=rows.map(r=>dpOwnerDayScores(r,true)), rhythmValues=rhythmData().values;
  const energyVals=scoreList.map(s=>s.energy).filter(Number.isFinite);
  const recoveryVals=scoreList.map(s=>s.recovery).filter(v=>v!==null&&Number.isFinite(v));
  const calmPairs=rows.map((row,i)=>({row,v:rhythmValues[row.idx]?dpOwnerQualityValue(rhythmPositiveValue('calm',rhythmValues[row.idx])):null}));
  const calmVals=calmPairs.map(x=>x.v).filter(v=>v!==null&&Number.isFinite(v));
  const overall=avgScore(scoreList.map(s=>s.energyActivity));
  const e=avgScore(energyVals), r=avgScore(recoveryVals), c=avgScore(calmVals);
  const recoveryData=rows.map(r=>dpOwnerRecoveryComparison(r)).filter(Boolean), dropAvg=avg(recoveryData.map(x=>x.average).filter(Number.isFinite));
  const half=Math.floor(rows.length/2), front=rows.slice(0,half), back=rows.slice(half);
  const partDiff=key=>{
    const frontVals=front.map(x=>dpOwnerDayScores(x,true)[key]).filter(v=>v!==null&&Number.isFinite(v));
    const backVals=back.map(x=>dpOwnerDayScores(x,true)[key]).filter(v=>v!==null&&Number.isFinite(v));
    return frontVals.length&&backVals.length?avg(backVals)-avg(frontVals):null;
  };
  const energyDiff=partDiff('energy'), recDiff=partDiff('recovery');
  const intro1=tx(`最近 ${days} 天精力平均 ${e??'—'} 分；${energyDiff===null?'有效資料不足以比較前後半段':Math.abs(energyDiff)<3?'前後半段整體接近':`後半段比前半段${energyDiff>=0?'高':'低'}約 ${Math.abs(energyDiff).toFixed(0)} 分`}。`,
                  `最近 ${days} 天精力平均 ${e??'—'} 分；${energyDiff===null?'有效数据不足以比较前后半段':Math.abs(energyDiff)<3?'前后半段整体接近':`后半段比前半段${energyDiff>=0?'高':'低'}约 ${Math.abs(energyDiff).toFixed(0)} 分`}。`,
                  `Over the last ${days} days, energy averaged ${e??'—'}/100; ${energyDiff===null?'there is not enough data to compare early vs later days':Math.abs(energyDiff)<3?'the two halves are broadly similar':`the latter half is about ${Math.abs(energyDiff).toFixed(0)} points ${energyDiff>=0?'higher':'lower'} than the first half`}.`,
                  `최근 ${days}일 활력 평균은 ${e??'—'}점입니다.`,
                  `直近 ${days} 日の活力平均は ${e??'—'} 点です。`);
  const intro2=tx(`恢復平均 ${r??'—'} 分；${dropAvg===null?'尚無足夠有效的兩分鐘回落量':`活動後兩分鐘心率平均下降 ${safe(dropAvg,1)} bpm`}。${recDiff===null?'':Math.abs(recDiff)<3?'前後半段恢復表現接近。':`後半段恢復分數${recDiff>0?'上升':'下降'}約 ${Math.abs(recDiff).toFixed(0)} 分。`}`,
                  `恢复平均 ${r??'—'} 分；${dropAvg===null?'尚无足够有效的两分钟下降幅度':`活动后两分钟心率平均下降 ${safe(dropAvg,1)} bpm`}。${recDiff===null?'':Math.abs(recDiff)<3?'前后半段恢复表现接近。':`后半段恢复分数${recDiff>0?'上升':'下降'}约 ${Math.abs(recDiff).toFixed(0)} 分。`}`,
                  `Recovery averaged ${r??'—'}/100; ${dropAvg===null?'valid two-minute drop data is limited':`the average two-minute post-activity HR drop was ${safe(dropAvg,1)} bpm`}.`,
                  `회복 평균은 ${r??'—'}점입니다.`,
                  `回復平均は ${r??'—'} 点です。`);
  const intro3=tx(`放鬆與平穩度平均 ${c??'—'} 分；這項分數比較安靜時的心搏與個體基準，不代表情緒診斷。`,
                  `放松与平稳度平均 ${c??'—'} 分；此分数比较安静时的心搏与个体基准，不代表情绪诊断。`,
                  `Rest & steadiness averaged ${c??'—'}/100 and compares quiet-time beat patterns with the personal baseline; it is not an emotion diagnosis.`,
                  `휴식·안정도 평균은 ${c??'—'}점입니다.`,
                  `リラックスと安定度の平均は ${c??'—'} 点です。`);
  const energyPairs=rows.map((row,i)=>({row,v:scoreList[i].energy})).filter(x=>Number.isFinite(x.v));
  const recoveryPairs=rows.map((row,i)=>({row,v:scoreList[i].recovery})).filter(x=>x.v!==null&&Number.isFinite(x.v));
  const calmValidPairs=calmPairs.filter(x=>x.v!==null&&Number.isFinite(x.v));
  const energyCard=metricCard(tx('精力情況','精力情况','Energy status','활력 상태','活力状況'),e,tx('比較精力以及活動／休息的日常變化。','比较精力以及活动／休息的日常变化。','Compares energy together with daily movement and rest patterns.','활력과 일상 활동·휴식을 비교합니다.','活力と日々の活動・休息を比較します。'),{color:e===null?'#aab0bc':scoreScheme(e).color,chartLabel:tx('查看每日趨勢','查看每日趋势','View daily trend','일별 추세 보기','日別推移を見る'),chartHtml:energyPairs.length>1?dpOwnerPeriodMetricChart(energyPairs.map(x=>x.row),'energy','#4387dc',energyPairs.map(x=>x.v),'/100'):tx('有效資料不足','有效数据不足','Not enough valid data','유효 데이터 부족','有効データ不足')});
  const recoveryCard=metricCard(tx('恢復情況','恢复情况','Recovery status','회복 상태','回復状況'),r,tx('以活動停止後兩分鐘心率下降量，和這隻寵物過往相近活動量的有效紀錄比較。','以活动停止后两分钟心率下降量，与这只宠物过往相近活动量的有效记录比较。','Uses the two-minute post-activity HR drop and compares it with this pet’s own valid history from similar effort levels.','활동 후 2분 심박 감소량을 유사 활동 기록과 비교합니다.','活動後2分間の心拍低下量を、同じ子の類似活動記録と比較します。'),{color:r===null?'#aab0bc':scoreScheme(r).color,chartLabel:tx('查看每日趨勢','查看每日趋势','View daily trend','일별 추세 보기','日別推移を見る'),chartHtml:recoveryPairs.length>1?dpOwnerPeriodMetricChart(recoveryPairs.map(x=>x.row),'recovery','#4387dc',recoveryPairs.map(x=>x.v),'/100'):tx('有效資料不足','有效数据不足','Not enough valid data','유효 데이터 부족','有効データ不足')});
  const calmCard=metricCard(tx('放鬆與平穩度','放松与平稳度','Rest & steadiness','휴식과 안정도','リラックスと安定度'),c,tx('比較安靜時的心搏間隔、RMSSD 與 SDNN 和個體基準；不能單獨推斷情緒或疾病。','比较安静时的心搏间隔、RMSSD 与 SDNN 和个体基准；不能单独推断情绪或疾病。','Compares quiet-time beat intervals, RMSSD and SDNN with the personal baseline; it should not be used alone to infer emotion or disease.','휴식 중 심박 간격과 HRV를 개인 기준과 비교합니다.','安静時の心拍間隔や HRV を個体基準と比較します。'),{color:c===null?'#aab0bc':scoreScheme(c).color,chartLabel:tx('查看每日趨勢','查看每日趋势','View daily trend','일별 추세 보기','日別推移を見る'),chartHtml:calmValidPairs.length>1?dpOwnerPeriodMetricChart(calmValidPairs.map(x=>x.row),'calm','#4387dc',calmValidPairs.map(x=>x.v),'/100'):tx('有效資料不足','有效数据不足','Not enough valid data','유효 데이터 부족','有効データ不足')});
  return `<section class="card dp901-health-score dp901-status-panel"><div class="dp901-overall-head"><div class="dp901-overall-copy"><h2>${tx('精力與恢復狀態','精力与恢复状态','Energy & Recovery','활력과 회복 상태','活力と回復状態')}</h2><p class="dp901-overall-verdict">${statusText(overall)}</p></div>${scoreCol(overall,scoreScheme(overall).color)}</div><div class="dp901-period-notes"><p>${intro1}</p><p>${intro2}</p><p>${intro3}</p></div>${energyCard}${recoveryCard}${calmCard}${dpMetricUsageNotes(2)}</section>`;
}
// Replace heartbeat rhythm stability card with a stable right-score layout.
const oldRhythmDay=dpOwnerRhythmCard;
dpOwnerRhythmCard=function(row,cp){
  const now=rhythmData().values[row.idx];
  if(!now)return oldRhythmDay(row,cp);
  const val=dpOwnerQualityValue(rhythmPositiveValue('stable',now));
  const peak=dp66DemoPeak(row.date,'heart');
  const base=tx(`當日穩定度 ${val}/100。${peak?.time?`心率序列在 ${peak.time} 附近有較明顯的變化，請先回看佩戴、活動或呼吸干擾。`:'分數反映今天心搏間隔與平常模式的接近程度。'}這是趨勢提示，不是心電圖診斷。`,
                `当日稳定度 ${val}/100。${peak?.time?`心率序列在 ${peak.time} 附近有较明显的变化，请先回看佩戴、活动或呼吸干扰。`:'分数反映今天心搏间隔与平常模式的接近程度。'}这是趋势提示，不是心电图诊断。`,
                `${val}/100 today. ${peak?.time?`A more noticeable change appears around ${peak.time}; first review fit, movement or breathing interference.`:'The score reflects how close today’s beat-interval pattern is to the usual pattern.'} This is a trend prompt, not an ECG diagnosis.`,
                `오늘 안정도는 ${val}/100입니다. 추세 참고용이며 심전도 진단이 아닙니다.`,
                `本日の安定度は ${val}/100 です。傾向を見るための指標で、心電図診断ではありません。`);
  return `<section class="card dp901-rhythm-card"><div class="dp901-rhythm-head"><div class="dp901-rhythm-copy"><h3>${tx('心搏節奏穩定度','心搏节奏稳定度','Heartbeat rhythm stability','심박 리듬 안정도','心拍リズム安定度')}</h3><p class="dp901-rhythm-desc">${base}</p></div>${scoreCol(val,(cp&&cp.accent)||scoreScheme(val).color)}</div>${rhythmHelp()}</section>`;
};
const oldRhythmPeriod=dp66PeriodRhythm;
dp66PeriodRhythm=function(rows,cp){
  const all=rhythmData().values, values=rows.map(r=>all[r.idx]).filter(Boolean).map(v=>dpOwnerQualityValue(rhythmPositiveValue('stable',v)));
  const avgVal=values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):null;
  const desc=avgVal===null?tx('這段時間有效資料不足。','这段时间有效数据不足。','Not enough valid data in this period.','이 기간 유효 데이터가 부족합니다.','この期間は有効データが不足しています。'):
    avgVal>=80?tx('這段時間的心搏節奏大致接近平常模式，可繼續觀察是否維持穩定。','这段时间的心搏节奏大致接近平常模式，可继续观察是否维持稳定。','During this period, heartbeat rhythm is broadly close to the usual pattern; continue to watch whether it stays stable.','이 기간 심박 리듬은 대체로 평소와 비슷합니다.','この期間の心拍リズムは概ね普段に近い状態です。'):
    tx('這段時間的心搏節奏起伏較明顯，建議配合呼吸、活動與佩戴品質一起回看。','这段时间的心搏节奏起伏较明显，建议配合呼吸、活动与佩戴质量一起回看。','Heartbeat rhythm varies more noticeably in this period; review it together with breathing, activity and signal quality.','이 기간 심박 리듬 변동이 더 뚜렷합니다.','この期間は心拍リズムの変動がやや大きく見られます。');
  return `<section class="card dp901-rhythm-card"><div class="dp901-rhythm-head"><div class="dp901-rhythm-copy"><h3>${tx('心搏節奏穩定度','心搏节奏稳定度','Heartbeat rhythm stability','심박 리듬 안정도','心拍リズム安定度')}</h3><p class="dp901-rhythm-desc">${desc}</p></div>${scoreCol(avgVal,(cp&&cp.accent)||scoreScheme(avgVal).color)}</div>${rhythmHelp()}</section>`;
};
const prevDay=dpOwnerDayDetail;
dpOwnerDayDetail=function(kind,cp,row){
  if(kind!==2)return prevDay(kind,cp,row);
  return energyDayView(cp,row);
};
const prevPeriod=dpOwnerPeriodDetail;
dpOwnerPeriodDetail=function(kind,cp,days){
  if(kind!==2)return prevPeriod(kind,cp,days);
  return energyPeriodView(cp,days);
};
// Avatar preload so the small profile image in Me doesn't flash or load slowly.
const avatarCache=new Set();
function fastAvatarSource(url){return typeof url==='string'&&url.includes('assets/demo_score_portraits/')&&url.endsWith('.jpg')?url.slice(0,-4)+'_thumb.webp':url;}
function preload(src){
  if(!src||avatarCache.has(src))return;
  avatarCache.add(src);
  const img=new Image();
  img.decoding='async';
  img.loading='eager';
  img.fetchPriority='high';
  img.src=src;
}
function primeAvatars(){
  try{
    const dog=currentDog?.();
    if(dog?.photo)preload(fastAvatarSource(dog.photo));
    (typeof allPets==='function'?allPets():[]).slice(0,4).forEach(p=>p?.photo&&preload(fastAvatarSource(p.photo)));
    document.querySelectorAll('img.pet-avatar, img.story-avatar, .profile-hero img.pet-avatar, .pet-avatar-tap img').forEach(img=>{
      const src=img.currentSrc||img.src;
      if(src)preload(fastAvatarSource(src));
      img.loading='eager';
      img.decoding='async';
      img.fetchPriority='high';
      img.classList.add('dp901-fixed-avatar');
    });
  }catch(e){console.warn('avatar preload skipped',e)}
}
const oldRender=render;
render=function(reset=false){ oldRender(reset); requestAnimationFrame(primeAvatars); };
requestAnimationFrame(primeAvatars);
})();
