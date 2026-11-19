/* DeepPet 9.03 — score-source unification, uniform Deep metric layout and standalone social navigation.
   Scores are illustrative within-pet trend scores, NOT validated clinical danger thresholds. */
(function(){
'use strict';
const L=(a,b,c,d,e)=>state.lang==='zh'?b:state.lang==='en'?c:state.lang==='ko'?d:state.lang==='ja'?(e||c):a;
const finite=v=>v===null||v===undefined||v===''||!Number.isFinite(Number(v))?null:Number(v);
const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
const avgScore=a=>a.length?Math.round(avg(a)):null;
const safe=(v,n=0)=>finite(v)===null?'—':Number(v).toFixed(n);
const grade=s=>s===null?L('資料不足','数据不足','Insufficient data','자료 부족','データ不足'):s>=90?L('健康','健康','Healthy','건강','健康'):s>=80?L('低風險','低风险','Mild','가벼운 주의','軽度注意'):s>=60?L('中風險','中风险','Moderate','중간 주의','中程度注意'):L('高風險','高风险','Risk','높은 주의','高度注意');
const verdict=s=>s===null?L('資料不足','数据不足','Insufficient data','자료 부족','データ不足'):s>=90?L('健康','健康','Healthy','건강','健康'):s>=80?L('低風險','低风险','Mild','낮은 위험','低リスク'):s>=60?L('中風險','中风险','Moderate','중간 위험','中リスク'):L('高風險','高风险','Risk','높은 위험','高リスク');
const tier=s=>s===null?'none':s>=90?'normal':s>=80?'light':s>=60?'medium':'high';
const color=s=>s===null?'#a9b0bd':scoreScheme(s).color;
const complete=a=>a.every(x=>finite(x)!==null);
const clipped=x=>Math.round(Math.max(0,Math.min(100,Number(x))));
// HRV has no clinical universal normal threshold. For this simulation, compare RMSSD
// and SDNN against preceding valid dates; avoid learning future dates as a baseline.
function hrvScore(row){
 const rows=demoRecords(state.dog),i=Number.isInteger(row.idx)?row.idx:rows.findIndex(x=>x.date===row.date);
 if(i<0||!validDaySample(row,i).valid)return null;
 const prev=rows.slice(Math.max(0,i-14),i).filter((r,j)=>validDaySample(r,Math.max(0,i-14)+j).valid);
 if(prev.length<3)return null;
 const scores=['rmssd','sdnn'].map(k=>{
  const value=finite(row[k]),v=prev.map(r=>finite(r[k])).filter(x=>x!==null&&x>0),ref=avg(v);
  if(value===null||value<=0||v.length<3||ref===null||ref<=0)return null;
  const dev=Math.abs(value-ref)/ref;
  return dev<=.15?95:dev<=.25?85:dev<=.40?70:45;
 });
 return complete(scores)?avgScore(scores):null;
}
function four(row){
 const engine=window.DeepPetSignalScoring?.getDaily?.(state.dog);
 const live=engine?.find(day=>day?.date===row?.date)?.scores;
 if(live)return {heart:live.heart,breath:live.breath,hrv:live.hrv,stable:live.stable,all:live.cardio};
 if(typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements())return {heart:null,breath:null,hrv:null,stable:null,all:null};
 const idx=Number.isInteger(row.idx)?row.idx:demoRecords(state.dog).findIndex(x=>x.date===row.date);
 if(idx<0||!validDaySample(row,idx).valid)return {heart:null,breath:null,hrv:null,stable:null,all:null};
 const r={...row,idx},m=rhythmData().values[idx],values=[dpOwnerVitalScore(r,'heart'),dpOwnerVitalScore(r,'breath'),hrvScore(r),m?clipped(rhythmPositiveValue('stable',m)):null];
 const scores={heart:values[0],breath:values[1],hrv:values[2],stable:values[3]};
 const integrity=window.DeepPetScoreIntegrity;
 let composite=integrity?.weighted(scores,integrity.weights.cardio,['heart','breath'])??null;
 if(composite!==null){composite=integrity.riskGuard(composite,[scores.heart,scores.breath]);if(scores.hrv===null||scores.stable===null)composite=Math.min(composite,89);}
 return {...scores,all:composite};
}
function three(row){
 const all=demoRecords(state.dog),idx=Number.isInteger(row?.idx)?row.idx:all.findIndex(x=>x.date===row?.date);
 const live=window.DeepPetSignalScoring?.getDaily?.(state.dog)?.find(day=>day?.date===row?.date)?.scores;
 if(live)return {energy:live.energy,recovery:live.recovery,calm:live.calm,all:live.activityRecovery};
 if(typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements())return {energy:null,recovery:null,calm:null,all:null};
 if(idx<0||!validDaySample(row,idx).valid)return {energy:null,recovery:null,calm:null,all:null};
 const r={...row,idx},v=dpOwnerDayScores(r,true),m=rhythmData().values[idx],rec=dpOwnerRecoveryComparison(r),parts=[finite(v.energy),finite(rec?.score),m&&finite(m.calm)!==null?clipped(m.calm):null];
 const scores={energy:parts[0],recovery:parts[1],calm:parts[2]},integrity=window.DeepPetScoreIntegrity;
 const composite=integrity?.riskGuard(integrity.weighted(scores,integrity.weights.activityRecovery,['energy','recovery','calm']),parts)??null;
 return {...scores,all:composite};
}
const previousDayScores=dpOwnerDayScores;
dpOwnerDayScores=function(row,withRecovery=false){
 const v=previousDayScores(row,true),h=four(row),e=threeRaw(row,v);
 v.heart=h.all;v.energy=e.energy;v.recovery=e.recovery;v.calm=e.calm;v.energyActivity=e.all;v.energyRecovery=e.all;
 return v;
};
// Avoid recursively calling dpOwnerDayScores from three().
function threeRaw(row,v){
 if(typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements()){
  const live=window.DeepPetSignalScoring?.getDaily?.(state.dog)?.find(day=>day?.date===row?.date)?.scores;
  return live?{energy:live.energy,recovery:live.recovery,calm:live.calm,all:live.activityRecovery}:{energy:null,recovery:null,calm:null,all:null};
 }
 const idx=Number.isInteger(row.idx)?row.idx:demoRecords(state.dog).findIndex(x=>x.date===row.date);
 if(idx<0||!validDaySample(row,idx).valid)return {energy:null,recovery:null,calm:null,all:null};
 const m=rhythmData().values[idx],rec=dpOwnerRecoveryComparison({...row,idx}),parts=[finite(v.energy),finite(rec?.score),m&&finite(m.calm)!==null?clipped(m.calm):null];
 const scores={energy:parts[0],recovery:parts[1],calm:parts[2]},integrity=window.DeepPetScoreIntegrity;
 const composite=integrity?.riskGuard(integrity.weighted(scores,integrity.weights.activityRecovery,['energy','recovery','calm']),parts)??null;
 return {...scores,all:composite};
}
// Compat consumers of the original heart/composite functions see exactly the same four items.
dpHeartComposite=function(row){return four(row).all;};
dpOwnerPeriodHeartScore=function(rows){const valid=rows.map(four).map(x=>x.all).filter(x=>finite(x)!==null);return avgScore(valid);};
// Keep Today composite strictly aligned with the Deep sub-metrics.
const previousUnified=dpTodayUnifiedScores;
dpTodayUnifiedScores=function(){const v=previousUnified(),rows=demoRecords(state.dog),idx=rows.length-1,cur={...rows[idx],idx},h=four(cur),b=dpOwnerDayScores(cur,true);v.heart=h.all;v.energy=b.energy;v.recovery=b.recovery;v.calm=b.calm;v.stable=rhythmData().values[idx]?.stable??null;v.energyActivity=b.energyActivity;return v;};

function scoreBlock(score,main=false){return `<div class="dp903-score-col ${main?'main':'sub'} ${tier(score)}">${score===null?'<div class="dp903-no-score">—</div>':dpDeepDottedScore(score,color(score))}<span class="dp903-grade">${grade(score)}</span></div>`;}
function metricName(key){return ({heart:L('心跳狀況','心跳状况','Heart rate','심박 상태','心拍状況'),breath:L('呼吸狀況','呼吸状况','Breathing','호흡 상태','呼吸状況'),hrv:'HRV',stable:L('心搏節奏穩定度','心搏节奏稳定度','Heartbeat rhythm stability','심박 리듬 안정도','心拍リズム安定度')})[key]||key};
function details(body,title){return body?`<details class="dp903-expand"><summary>${title||L('查看趨勢','查看趋势','View trend','추세 보기','推移を見る')}</summary><div class="dp903-expand-body">${body}</div></details>`:'';}
function metricCard(key,n,desc,extras='',chart=''){
 return `<section class="dp903-metric-card" data-dp903-metric="${key}"><div class="dp903-metric-left"><h3>${metricName(key)}</h3><p>${desc}</p></div>${scoreBlock(n)}${extras}${chart}</section>`;
}
function mainCard(title,number,desc,metrics,kind){
 return `<section class="card dp903-overview dp903-${kind}" data-dp903-composite="${number===null?'':number}"><div class="dp903-overview-head"><div class="dp903-overview-copy"><h2>${title}</h2><h3>${verdict(number)}</h3><p>${desc}</p></div>${scoreBlock(number,true)}</div><div class="dp903-metric-list">${metrics.join('')}</div><p class="dp903-score-method">${kind==='heart'?L('心肺綜合分綜合心跳、呼吸、HRV 與心搏節奏趨勢，缺少必要有效訊號時不計分。','心肺综合分综合心跳、呼吸、HRV 和心搏节奏趋势，缺少必要有效信号时不计分。','Overall cardio combines heart, breathing, HRV and rhythm trends; insufficient signal means no score.','심박·호흡·HRV·리듬 추세를 종합합니다.','心拍・呼吸・HRV・リズム傾向を総合します。'):L('精力與恢復綜合分根據精力、兩分鐘恢復及放鬆平穩度的表現計算。','精力与恢复综合分综合精力、两分钟恢复和放松平稳度。','Energy and recovery combines energy, post-activity recovery and rest/steadiness.','활력·회복·안정도를 종합합니다.','活力・回復・安静度を総合します。')}</p></section>`;
}
// V10.95: the unmeasured heart page is built by the EXACT same metricCard,
// scoreBlock and mainCard factories as the measured 1/7/30-day pages.
// No sample row or another pet's data is evaluated here.
function unmeasuredHeart(days){
 const notice=L('目前尚無有效監測數據；相同的四項分析會在量測後顯示。','目前尚无有效监测数据；相同的四项分析会在测量后显示。','No valid recordings yet. These same four panels will display results after measuring.','아직 유효 측정이 없습니다. 같은 네 항목에 결과가 표시됩니다.','有効な測定データはまだありません。計測後に同じ4項目へ表示します。');
 const wave=key=>`<button type="button" class="dp903-open-wave" data-action="dp90-wave-open" data-kind="${key}">${L('查看詳細數據','查看详细数据','View detailed data','상세 데이터 보기','詳細データを見る')} ›</button>`;
 const dailyTrend=()=>details('<div class="dp936-chart-na">N/A</div>',L('查看每日分數趨勢','查看每日分数趋势','Daily score trend','일별 점수 추세','日別点数の推移'));
 const stableHelp=`<details class="dp903-beat-help"><summary>${L('什麼是心搏節奏穩定度？','什么是心搏节奏稳定度？','What is heartbeat rhythm stability?','심박 리듬 안정도란?','心拍リズム安定度とは？')}</summary><p>${L('需有有效心搏間隔才能與個體基準比較。','需有有效心搏间隔才能与个体基准比较。','Valid beat intervals are needed for comparison with this pet’s baseline.','유효 박동 간격이 필요합니다.','有効な拍間隔の記録が必要です。')}</p></details>`;
 const desc={
  heart:L('平均心率與個體歷史比較會顯示在此。','平均心率与个体历史比较会显示在此。','Daily heart rate and its personal comparison appear here.','심박수와 개인 기준 비교가 여기에 표시됩니다.','心拍数と個体比較を表示します。'),
  breath:L('平均呼吸與相近活動狀態的比較會顯示在此。','平均呼吸与相近活动状态的比较会显示在此。','Breathing and activity-matched comparisons appear here.','호흡과 활동 조건별 비교가 표시됩니다.','呼吸数と活動別比較を表示します。'),
  hrv:L('依 RMSSD、SDNN 和個體歷史有效記錄分析 HRV。','依 RMSSD、SDNN 和个体历史有效记录分析 HRV。','HRV uses valid RMSSD, SDNN and personal baseline records.','HRV는 RMSSD·SDNN 기록을 사용합니다.','HRVはRMSSD・SDNNを用います。'),
  stable:L('比對有效心搏間隔變化及個體平常節奏。','比对有效心搏间隔变化及个体平常节奏。','Compares valid beat intervals with this pet’s usual rhythm.','유효 박동 간격과 평소 리듬을 비교합니다.','拍間隔と普段のリズムを比較します。')
 };
 const metrics=['heart','breath','hrv','stable'].map(key=>metricCard(key,null,desc[key],
   key==='heart'||key==='breath'?wave(key):key==='hrv'?dp904HrvHelp():days===1?stableHelp:'',
   days>1&&(key==='hrv'||key==='stable')?dailyTrend():''));
 return mainCard(L('心肺綜合狀態','心肺综合状态','Overall heart & breathing','심폐 종합 상태','心肺総合状態'),null,notice,metrics,'heart');
}
window.DeepPetSharedCards903=Object.freeze({unmeasuredHeart,metricNames:['heart','breath','hrv','stable']});
function dp904HrvHelp(){return `<div class="dp904-hrv-help"><b>${L('RMSSD','RMSSD','RMSSD','RMSSD','RMSSD')}</b>：${L('相鄰心跳間隔在短時間內的變化。','相邻心跳间隔在短时间内的变化。','Short-term changes between successive beat intervals.','인접 심박 간격의 단기 변화.','連続する心拍間隔の短期変動。')}<br><b>SDNN</b>：${L('一段有效監測時間內，心跳間隔整體的變化幅度。兩者都應和這隻寵物自己的基準比較，並非越大越健康。','一段有效监测时间内，心跳间隔整体的变化幅度。两项都应与这只宠物自己的基准比较，不是越大越健康。','Overall variability of beat intervals over a valid segment. Both are compared with this pet’s own baseline; higher is not always healthier.','유효 구간 전체 심박 간격의 변화 정도. 반려동물 자체 기준과 비교합니다.','有効な期間全体の心拍間隔の変動です。個体基準と比較します。')}</div>`;}
function dayHeart(cp,row){
 const daily=window.DeepPetSignalScoring?.getFeatures?.(state.dog);
 const real=typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements();
 // Match verified features to the selected calendar date; unrecorded dates
 // must never borrow measurements from a neighbouring day or gallery row.
 const extracted=daily?.find(day=>day?.date===row?.date);
 if(extracted)row={...row,heart:extracted.heartRate,breath:extracted.breathRate,rmssd:extracted.rmssd,sdnn:extracted.sdnn};
 else if(real)row={...row,heart:null,breath:null,rmssd:null,sdnn:null};
 const h=four(row),i=row.idx,r=rhythmData().values[i];
 const timed=kind=>`<button class="dp903-open-wave" type="button" data-action="dp90-wave-open" data-kind="${kind}">${L('查看波形','查看波形','View waveform','파형 보기','波形を見る')} ›</button>`;
 const hrdesc=L(`當日平均心率 ${safe(row.heart,0)} bpm；依照個體過往有效心率記錄比較。`,`当日平均心率 ${safe(row.heart,0)} bpm；与这只宠物过去有效记录比较。`,`Daily average ${safe(row.heart,0)} bpm, compared with this pet's valid history.`,`일평균 심박수 ${safe(row.heart,0)} bpm.`,`本日の平均心拍 ${safe(row.heart,0)} bpm。`);
 const rrdesc=L(`當日平均呼吸 ${safe(row.breath,1)} 次／分；請結合休息及活動狀態觀察。`,`当日平均呼吸 ${safe(row.breath,1)} 次／分；结合休息及活动情况比较。`,`Daily average breathing ${safe(row.breath,1)}/min; compare similar rest and activity states.`,`일평균 호흡 ${safe(row.breath,1)}회/분.`,`本日の平均呼吸 ${safe(row.breath,1)}回/分。`);
 const hrvDesc=L(`RMSSD ${safe(row.rmssd,1)} ms、SDNN ${safe(row.sdnn,1)} ms；分數參考同一隻寵物之前有效紀錄的相對變化，不是絕對疾病門檻。`,`RMSSD ${safe(row.rmssd,1)} ms、SDNN ${safe(row.sdnn,1)} ms；评分依据同宠物历史有效记录的相对变化，不是疾病门槛。`,`RMSSD ${safe(row.rmssd,1)} ms, SDNN ${safe(row.sdnn,1)} ms. Scored by deviation from this pet's valid prior readings, not clinical cutoffs.`,`RMSSD ${safe(row.rmssd,1)}ms, SDNN ${safe(row.sdnn,1)}ms.`,`RMSSD ${safe(row.rmssd,1)}ms、SDNN ${safe(row.sdnn,1)}ms。`);
 const rhythmDesc=L('看安靜時每分鐘心率變化是否接近平常，不是逐搏心律診斷。','看安静时每分钟心率变化是否接近平常，不是逐搏心律诊断。','Compares resting minute-by-minute heart-rate regularity, not beat-to-beat ECG rhythm.','휴식 시 분 단위 심박 추세를 비교합니다.','安静時の分単位の心拍変化を比較します。');
 const metrics=[metricCard('heart',h.heart,hrdesc,timed('heart')),metricCard('breath',h.breath,rrdesc,timed('breath')),metricCard('hrv',h.hrv,hrvDesc,dp904HrvHelp()),metricCard('stable',h.stable,rhythmDesc,`<details class="dp903-beat-help"><summary>${L('什麼是心搏節奏穩定度？','什么是心搏节奏稳定度？','What is heartbeat rhythm stability?','심박 리듬 안정도란?','心拍リズム安定度とは？')}</summary><p>${L('以有效心搏間隔的變化與個體基準比較，分數越高表示越接近平常模式。並非變化越小就越健康，不能判定心律不整。','以有效心搏间隔与个体基准比较，分数越高表示越接近平常模式。不是变化越小就越健康，不能判定心律失常。','Compares valid beat intervals with the individual baseline. High scores mean close to usual; it cannot diagnose arrhythmia.','이 반려동물의 심박 간격 기준과 비교하며 부정맥 진단이 아닙니다.','個体基準と比べた傾向で、不整脈の診断ではありません。')}</p></details>` )];
 return mainCard(L('心肺綜合狀態','心肺综合状态','Overall heart & breathing','심폐 종합 상태','心肺総合状態'),h.all,L('當日四項指標的分數使用同一個有效資料基準；點開各模塊可查看趨勢與波形。','当日四项分数来自同一只宠物的有效记录；可展开查看趋势与波形。','The four indicator scores refer to this pet’s valid history; open each section to review trends.','네 점수는 반려동물의 유효 기록을 기준으로 합니다.','4項目を同じ基準で評価します。'),metrics,'heart');
}
function periodHeart(cp,days){
 const entries=dayRowsWithIndex(days).filter(r=>validDaySample(r,r.idx).valid).map(r=>({r,v:four(r)}));
 const valid=entries.filter(x=>x.v.all!==null);const keys=['heart','breath','hrv','stable'];
 const byKey=Object.fromEntries(keys.map(k=>[k,entries.filter(x=>x.v[k]!==null)]));
 const vals=Object.fromEntries(keys.map(k=>[k,byKey[k].length?avgScore(byKey[k].map(x=>x.v[k])):null]));
 const overall=valid.length?avgScore(valid.map(x=>x.v.all)):null;
 const intro=L(`近 ${days} 天心肺趨勢已更新。點開各項，可查看每日變化與計算依據。`,`近 ${days} 天心肺趋势已更新。点开各项，可查看每日变化与计算依据。`,`Heart and breathing trends for the last ${days} days are ready. Open an indicator for daily changes and details.`,`최근 ${days}일 심폐 추세입니다. 각 항목을 눌러 자세히 확인하세요.`,`直近 ${days} 日間の心肺の傾向です。各項目で詳細を確認できます。`);
 const trend=k=>details(byKey[k].length>1?dpOwnerPeriodMetricChart(byKey[k].map(x=>x.r),k,'#ba5376',byKey[k].map(x=>x.v[k]),'/100'):L('有效資料不足','有效数据不足','Not enough data','데이터 부족','有効データ不足'),L('查看每日分數趨勢','查看每日分数趋势','Daily score trend','일별 점수 추세','日別点数'));
 const featureByDate=new Map((window.DeepPetSignalScoring?.getFeatures?.(state.dog)||[])
  .filter(x=>x?.date).map(x=>[x.date,x]));
 const rm=byKey.hrv.length?avg(byKey.hrv.map(x=>finite(featureByDate.get(x.r.date)?.rmssd)).filter(x=>x!==null)):null,
  sd=byKey.hrv.length?avg(byKey.hrv.map(x=>finite(featureByDate.get(x.r.date)?.sdnn)).filter(x=>x!==null)):null;
 const descriptions={
 heart:L('心跳狀況取有效日心跳分數的平均，避免混用單次值。','心跳状况取有效日心跳评分的平均，不混用单次数值。','Mean of valid daily heart-rate scores.','유효 심박 점수 평균.','有効日の心拍平均。'),
 breath:L('呼吸狀況取有效日呼吸分數的平均。','呼吸状况取有效日呼吸评分的平均。','Mean of valid daily breathing scores.','유효 호흡 점수 평균.','有効日の呼吸平均。'),
 hrv:L(`HRV 平均分取同一批有效日的 HRV 分數平均；RMSSD ${safe(rm,1)} ms，SDNN ${safe(sd,1)} ms。`,`HRV 平均分来自同一批有效日的 HRV 分数；RMSSD ${safe(rm,1)} ms、SDNN ${safe(sd,1)} ms。`,`HRV mean score on the same valid days; RMSSD ${safe(rm,1)} ms and SDNN ${safe(sd,1)} ms.`,`HRV 평균; RMSSD ${safe(rm,1)}ms, SDNN ${safe(sd,1)}ms.`,`HRV 平均；RMSSD ${safe(rm,1)}ms、SDNN ${safe(sd,1)}ms。`),
 stable:L('安靜心率的分鐘級規律度，以各有效日評分平均，不重複使用 HRV 分數。','安静心率的分钟级规律度，取有效日评分平均，不重复使用 HRV 分数。','Mean of valid daily quiet-minute regularity scores, calculated separately from HRV.','분당 심박 안정도 평균입니다.','分単位の心拍変化の平均です。')
 };
 return mainCard(L('心肺綜合狀態','心肺综合状态','Overall heart & breathing','심폐 종합 상태','心肺総合状態'),overall,intro,keys.map(k=>metricCard(k,vals[k],descriptions[k],(k==='heart'||k==='breath')?`<button class="dp903-open-wave" data-action="dp90-wave-open" data-kind="${k}">${L('查看詳細數據','查看详细数据','View detailed data','상세 데이터 보기','詳細データを見る')} ›</button>`:k==='hrv'?dp904HrvHelp():'',k==='heart'||k==='breath'?'':trend(k))),'heart');
}
function threePeriodScores(days){
 const rows=dayRowsWithIndex(days).filter(r=>validDaySample(r,r.idx).valid),observations=rows.map(r=>({r,v:three(r)}));
 const valid=observations.filter(x=>finite(x.v.all)!==null&&x.v.all>=0&&x.v.all<=100);
 // Each sub-score has its OWN valid-day denominator. Missing recovery/calm
 // must not silently become zero merely because another daily sub-score was
 // available and contributed to the composite.
 const keys=['energy','recovery','calm'],vals=Object.fromEntries(keys.map(k=>{
  const measured=observations.map(x=>finite(x.v[k])).filter(x=>x!==null&&x>=0&&x<=100);
  return [k,measured.length?avgScore(measured):null];
 }));
 return {valid,vals,overall:valid.length?avgScore(valid.map(x=>x.v.all)):null};
}
const priorDayDetail=dpOwnerDayDetail;
dpOwnerDayDetail=function(kind,cp,row){if(kind===0)return dayHeart(cp,row);return priorDayDetail(kind,cp,row);};
const priorPeriodDetail=dpOwnerPeriodDetail;
dpOwnerPeriodDetail=function(kind,cp,days){
 if(kind===0)return periodHeart(cp,days);
 if(kind!==2)return priorPeriodDetail(kind,cp,days);
 const result=priorPeriodDetail(kind,cp,days),data=threePeriodScores(days);
 const root=document.createElement('div');root.innerHTML=result;
 const overview=root.querySelector('.dp901-overall-head .dp901-score-col');
 if(overview){overview.outerHTML=scoreBlock(data.overall,true);}
 const status=root.querySelector('.dp901-overall-verdict');if(status)status.textContent=verdict(data.overall);
 const panel=root.querySelector('.dp901-health-score');if(panel)panel.dataset.dp903Composite=data.overall===null?'':data.overall;
 // Score cards use exactly the same valid days as the combined score, preventing off-by-one rounding gaps.
 const panels=root.querySelectorAll('.dp901-metric-card');
 ['energy','recovery','calm'].forEach((k,i)=>{
  const card=panels[i],val=data.vals[k];if(!card)return;
  const meter=card.querySelector('.dp901-score-col');if(meter)meter.outerHTML=scoreBlock(val,false);
 });
 return root.innerHTML;
};
const prevDeep=deepView;
deepView=function(){
 const markup=prevDeep();if(state.detail==='dp90-waveform')return markup;
 const root=document.createElement('div');root.innerHTML=markup;
 // Remove stale standalone HRV and rhythm cards from earlier wrappers when the new four-card layout is present.
 if(state.deepType===0){const primary=root.querySelector('.dp903-heart');if(primary){
  root.querySelectorAll('.dp71-hrv,.dp901-rhythm-card,.dp66-rhythm-short,.dp90-wave-shortcuts,.dp-hrv-visible').forEach(el=>{if(!primary.contains(el))el.remove();});
 }}
 // All three Deep categories use the same primary circular score dimensions.
 if(state.deepType===1){root.querySelectorAll('.dp-owner-status-heading .dp-status-score,.dp74-overview-head .dp-status-score,.dp-heart-period-overall .dp-status-score,.dp-sleep-period-score-head .dp-status-score').forEach(el=>el.classList.add('dp903-main-ring'));}
 return root.innerHTML;
};

// Keep title and back control of age detail consistent with its entry point.
const oldAge=dpAgeFullPage;
dpAgeFullPage=function(){
 const root=document.createElement('div');root.innerHTML=oldAge();
 const title=root.querySelector('.dp-independent-head b');if(title)title.textContent=L('AI 推算生理年齡','AI推算生理年龄','AI estimated biological age','AI 추정 생리 나이','AI 推定生理年齢');
 root.querySelectorAll('[data-action="age-detail-back"]').forEach((el,i)=>{if(!el.closest('.dp-independent-head'))el.remove();});
 return root.innerHTML;
};

// Standalone nearby-pets navigator: Map | List | Messages | Friends.
const oldGarden=gardenView;
function messageUnreadCount(){
 return Object.keys(dpChatStore()).filter(k=>dpFriendAuthorizedForThread(k)).reduce((sum,key)=>sum+dpThreadUnread(key),0);
}
function inboxOnly(){
 const root=document.createElement('div');root.innerHTML=gardenInbox();
 root.querySelectorAll('.dp-social-inbox').forEach(el=>el.remove());
 const badge=root.querySelector('.garden-inbox .pill');
 if(badge){const count=messageUnreadCount();const conversations=Object.keys(dpChatStore()).filter(k=>dpFriendAuthorizedForThread(k)&&(dpChatStore()[k]||[]).length).length;
   badge.textContent=String(conversations)+(count?` · ${count} ${L('未讀','未读','unread','안 읽음','未読')}`:'');}
 return root.innerHTML;
}
function friendsOnly(){
 dpSocialSeedShowcase();
 return `<section class="dp903-friends-page"><div class="dp903-friends-heading"><h3>${L('好友與申請','好友与申请','Friends & requests','친구 및 요청','友だちと申請')}</h3><button class="dp903-add-friend" data-action="dp-friend-menu">＋ ${L('加好友','加好友','Add friend','친구 추가','友だち追加')}</button></div>${dpFriendRequestsContent()}</section>`;
}
gardenView=function(){
 const mode=['map','list','messages','friends'].includes(state.gardenMode)?state.gardenMode:'map';
 if(mode==='friends')return `<div class="garden-overview dp903-garden-overview">${gardenTopAndTabs(mode)}${friendsOnly()}</div>`;
 const oldMode=state.gardenMode;state.gardenMode=mode;
 const root=document.createElement('div');root.innerHTML=oldGarden();state.gardenMode=oldMode;
 const tabs=root.querySelector('.garden-tabs');if(tabs)tabs.outerHTML=fourTabs(mode);
 if(mode==='messages'){
  const oldInbox=root.querySelector('.garden-inbox');if(oldInbox)oldInbox.outerHTML=inboxOnly();
 }
 return root.innerHTML;
};
function fourTabs(mode){return `<div class="garden-tabs dp903-garden-tabs">${[
 ['map',L('地圖','地图','Map','지도','地図')],['list',L('列表','列表','List','목록','リスト')],['messages',L('訊息','讯息','Messages','메시지','メッセージ')],['friends',L('好友','好友','Friends','친구','友だち')]
 ].map(([m,n])=>`<button type="button" class="${mode===m?'active':''}" data-action="dp903-garden-mode" data-mode="${m}">${n}${m==='messages'&&messageUnreadCount()?` <span class="dp-tab-unread">${messageUnreadCount()}</span>`:''}${m==='friends'&&dpPendingToMe().length?` <span class="dp-tab-unread">${dpPendingToMe().length}</span>`:''}</button>`).join('')}</div>`;}
function gardenTopAndTabs(mode){
 return `<div class="garden-top"><span class="garden-kicker">DeepPet Pet Garden</span><h3>${L('附近的毛孩，都在這裡相遇','附近的毛孩，都在这里相遇','Meet pets nearby','근처 반려동물과 만나보세요','近くのペット')}</h3><p>${L('地圖與距離是互動示例，並非真實附近用戶。','地图与距离是互动示例，并非真实附近用户。','Map and distances are illustrative only.','지도와 거리는 예시입니다.','地図はデモです。')}</p></div>${fourTabs(mode)}`;
}
function gardenStandalone(){return `<div class="app-pad dp-independent-page dp903-garden-page"><header class="dp-independent-head"><button type="button" data-action="dp903-garden-back" aria-label="Back">←</button><b>${L('附近的寵物','附近的宠物','Nearby pets','주변 반려동물','近くのペット')}</b></header>${gardenView()}<div class="footer-space"></div></div>`;}
function petProfileStandalone(){return `<div class="app-pad dp-independent-page dp903-profile-page"><header class="dp-independent-head"><button data-action="dp903-profile-back">←</button><b>${L('寵物公開檔案','宠物公开档案','Public pet profile','공개 프로필','公開プロフィール')}</b></header>${gardenPublicProfile()}<div class="footer-space"></div></div>`;}
const originalMe=meView;
meView=function(){if(state.detail==='dp903-garden')return gardenStandalone();if(state.detail==='dp903-profile')return petProfileStandalone();return originalMe();};
const originalChat=chatFullPage;
chatFullPage=function(){
 const root=document.createElement('div');root.innerHTML=originalChat();
 root.querySelectorAll('.dp-chat-more-wrap,.dp-chat-demo-indicator').forEach(e=>e.remove());
 return root.innerHTML;
};
const originalBottom=bottomNav;
bottomNav=function(){if((state.tab==='me'&&['dp903-garden','dp903-profile','chat'].includes(state.detail))||(state.tab==='deep'&&state.detail==='dp90-waveform'))return '';return originalBottom();};
const originalAction=onAction;
onAction=function(target){
 const action=target?.dataset?.action;
 // The rhythm-stability card moved into the four-card heart section. Keep the
 // Home score shortcut pointing to that exact card rather than a removed legacy card.
 if(action==='dp90-rhythm-nav'){
  const isStable=target.dataset.key==='stable';
  state.modal='';state.tab='deep';state.detail=null;state.deepType=isStable?0:2;state.range=1;
  state.deepSelectedDate=iso(localDate());state.dp1007DayManuallyChosen=false;render(true);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const selector=isStable?'[data-dp903-metric="stable"]':'.dp902-calm-target';
    const el=document.querySelector(selector),sc=document.getElementById('main-scroll');
    if(!el||!sc)return;
    const pos=el.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop-25;
    sc.scrollTo({top:Math.max(0,pos),behavior:'instant'});
    el.classList.add('dp902-jump-highlight');
    setTimeout(()=>{if(el.isConnected)el.classList.remove('dp902-jump-highlight');},3700);
  }));
  return;
 }
 if(action==='garden-detail'||action==='garden-inbox-open'){
  state.dp903GardenOrigin={tab:state.tab,detail:state.detail};state.modal='';state.tab='me';state.detail='dp903-garden';state.gardenMode=action==='garden-inbox-open'?'messages':(state.gardenMode||'map');render(true);return;
 }
 if(action==='dp903-garden-back'){
  state.modal='';const origin=state.dp903GardenOrigin||{tab:'me',detail:null};state.tab=origin.tab||'me';state.detail=origin.detail&&origin.detail!=='dp903-garden'?origin.detail:null;render(true);return;
 }
 if(action==='dp903-garden-mode'||action==='set-garden-mode'){
  state.gardenMode=['map','list','messages','friends'].includes(target.dataset.mode)?target.dataset.mode:'map';state.modal='';state.tab='me';state.detail='dp903-garden';render(true);return;
 }
 if(action==='chat-to-inbox'){
  state.tab='me';state.modal='';state.detail='dp903-garden';state.gardenMode='messages';render(true);return;
 }
 if(action==='garden-select-pet'||action==='garden-close-pet'||action==='toggle-garden-visibility'||action==='garden-gps-demo'||action==='garden-enable-gps'||action==='garden-follow'){
  const before=state.detail;
  const r=originalAction(target);
  if(before==='dp903-garden'){state.modal='';state.detail='dp903-garden';state.tab='me';render(true);}return r;
 }
 if(action==='garden-open-profile'){
  state.dp903ProfileReturn=state.detail==='chat'?'chat':'dp903-garden';state.gardenProfileId=target.dataset.id||state.chatWith;state.modal='';state.tab='me';state.detail='dp903-profile';render(true);return;
 }
 if(action==='garden-profile-back'||action==='dp903-profile-back'){
  state.tab='me';state.modal='';state.detail=state.dp903ProfileReturn==='chat'?'chat':'dp903-garden';render(true);return;
 }
 if(action==='garden-profile-message'){
  const id=target.dataset.id||state.gardenProfileId;
  if(!dpFriendAuthorizedForThread(id)){
    toast(L('需要雙方同意成為好友後才能傳送訊息。','需要双方同意成为好友后才能发送讯息。','Both pet owners must accept friendship before messaging.','양측 친구 동의가 필요합니다.','友だち承認後にメッセージできます。'));
    return;
  }
  dpOpenChat(id);return;
 }
 if(action==='dp-friend-accept'||action==='dp-friend-deny'||action==='dp-friend-request'){
  const result=originalAction(target);if(state.detail==='dp903-garden'||state.detail==='dp903-profile'){state.modal='';render(true);}return result;
 }
 if(action==='dp-friend-chat'){
  // Existing friend records open the full-screen chat, returning to the Messages tab.
  state.gardenMode='messages';const result=originalAction(target);return result;
 }
 if(action==='garden-message'||action==='garden-open-selected-chat'){
  const id=action==='garden-message'?target.dataset.id:state.gardenSelected;
  if(!dpFriendAuthorizedForThread(id)){
    // No modal for a not-yet-friend pet; open a full-screen public profile.
    state.gardenProfileId=id;state.dp903ProfileReturn='dp903-garden';
    state.tab='me';state.modal='';state.detail='dp903-profile';render(true);
    return;
  }
  state.gardenMode='messages';return originalAction(target);
 }
 return originalAction(target);
};
})();
