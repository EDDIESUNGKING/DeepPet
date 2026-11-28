/* DeepPet V10.131 — measured cause + appropriate action for EVERY Deep score.
 * IMPORTANT: correlations describe co-occurring dates only, NEVER causation.
 * Does not change sensor scoring, per-pet records, missing-data policy,
 * exam fusion, live Milo BLE, or emergency-event triggers.
 */
(function(root){'use strict';
const valid=n=>typeof n==='number'&&Number.isFinite(n);
const L=(a,b,c,d,e)=>({zht:a,zh:b,en:c,ja:d,ko:e})[state.lang]||a;
const labels={
 cardio:['心肺','心肺','Heart & breathing','心肺','심폐'],heart:['心跳','心跳','Heart rate','心拍','심박'],breath:['呼吸','呼吸','Breathing','呼吸','호흡'],
 hrv:['HRV','HRV','HRV','HRV','HRV'],stable:['心搏節奏','心搏节奏','Beat pattern','拍動リズム','박동 리듬'],sleep:['睡眠','睡眠','Sleep','睡眠','수면'],
 activityRecovery:['精力與恢復','精力与恢复','Energy & recovery','活力と回復','활력·회복'],energy:['精力','精力','Energy','活力','활력'],
 recovery:['活動後恢復','活动后恢复','Recovery after activity','運動後の回復','운동 후 회복'],calm:['放鬆平穩','放松平稳','Calmness','落ち着き','안정도']};
const keyName=k=>({zht:labels[k]?.[0],zh:labels[k]?.[1],en:labels[k]?.[2],ja:labels[k]?.[3],ko:labels[k]?.[4]})[state.lang]||k;
const levels=[
 [9,['最高警戒','最高警戒','Critical alert','最優先警戒','최고 경계']],
 [19,['極高度警戒','极高度警戒','Very high alert','非常に強い警戒','매우 높은 경계']],
 [29,['非常嚴重','非常严重','Very serious','非常に深刻','매우 심각']],
 [39,['嚴重偏離','严重偏离','Serious change','大きなずれ','심각한 변화']],
 [49,['多項明顯異常','多项明显异常','Multiple changes','複数の異常','여러 항목 이상']],
 [59,['高風險','高风险','High risk','高リスク','고위험']],
 [64,['接近高風險','接近高风险','Near high risk','高リスクに近い','고위험에 근접']],
 [69,['明顯需要注意','明显需要注意','Needs close attention','特に注意','주의 필요']],
 [74,['持續留意','持续留意','Monitor closely','継続して確認','지속 관찰']],
 [79,['中度變化','中度变化','Moderate change','中程度の変化','중간 수준 변화']],
 [82,['接近中風險','接近中风险','Near moderate risk','中リスクに近い','중위험에 근접']],
 [85,['輕度偏離','轻度偏离','Mild change','軽い変化','경미한 변화']],
 [89,['輕微變化','轻微变化','Small change','小さな変化','작은 변화']],
 [94,['整體穩定','整体稳定','Generally stable','おおむね安定','대체로 안정']],
 [97,['狀態良好','状态良好','Doing well','良好','양호']],
 [100,['接近平常最佳','接近平常最佳','Near usual best','普段の良い状態に近い','평소 좋은 상태에 가까움']]
];
const level=n=>valid(n)?levels.find(x=>n<=x[0])?.[1]?.[['zht','zh','en','ja','ko'].indexOf(state.lang)]||levels.find(x=>n<=x[0])?.[1]?.[0]:L('資料不足','资料不足','Not enough data','データ不足','자료 부족');
const band=n=>!valid(n)?-1:n<60?3:n<80?2:n<90?1:0;
const maxlines=n=>!valid(n)?2:band(n)===3?10:band(n)===2?6:band(n)===1?5:2;
const round=n=>Math.round(n*10)/10;
const today=()=>typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):new Date().toISOString().slice(0,10);
const noProfileData=()=>state.emptyPreview===true||state.dog===31;
const rowsFor=()=>noProfileData()?[]:(root.DeepPetSignalScoring?.getDaily?.(state.dog)||[]);
const featuresFor=r=>(root.DeepPetSignalScoring?.getFeatures?.(state.dog)||[]).find(x=>x?.date===r?.date)||{};
const rawFor=r=>typeof demoRecords==='function'?(demoRecords(state.dog)||[]).find(x=>x?.date===r?.date)||{}:{};
const get=n=>valid(n)?n:null;
function list(days){
 if(noProfileData())return [];
 if(days===1){const sum=root.DeepPetCompactUI127?.summary?.('cardio',1);const selected=state.deepSelectedDate||sum?.date||today();return rowsFor().filter(x=>x&&x.date===selected);}
 const ext=root.DeepPetEvidenceNarrative124?.period?.(days);
 if(Array.isArray(ext))return ext.filter(x=>x&&x.scores);
 const base=Date.parse(today()+'T12:00:00Z');return rowsFor().filter(x=>x&&Date.parse(x.date+'T12:00:00Z')<=base&&Date.parse(x.date+'T12:00:00Z')>base-days*86400000);
}
function datum(key,row){
 const f=featuresFor(row),r=rawFor(row),refs=row?.baseline?.references||{},fixture=row?.fixtureEvidence?.references||{};
 function getVal(k){return valid(f[k])?f[k]:valid(r[k])?r[k]:null;}
 function ref(k,old){return get(refs[k]?.ref)??get(fixture[old||k]);}
 if(key==='heart')return {value:getVal('quietHeartRate'),base:ref('quietHeartRate','heart'),unit:'bpm'};
 if(key==='breath')return {value:getVal('quietBreathRate'),base:ref('quietBreathRate','breath'),unit:'min'};
 if(key==='hrv')return {value:getVal('rmssd'),base:ref('rmssd'),other:getVal('sdnn'),otherBase:ref('sdnn'),unit:'ms'};
 if(key==='stable')return {value:getVal('sdnn'),base:ref('sdnn'),unit:'ms',method:'proxy'};
 if(key==='sleep')return {value:getVal('restHours'),base:ref('restHours','sleep'),unit:'h'};
 if(key==='energy')return row?.source==='20hz-waveform'?{value:getVal('motionMean'),base:ref('motionMean','activity'),unit:'motion'}:
  {value:getVal('activity'),base:ref('activity','activity'),unit:'activity'};
 if(key==='recovery')return {value:getVal('recoveryDrop'),base:row?.source==='20hz-waveform'?ref('recoveryDrop','recovery'):(get(fixture.recovery)??ref('recoveryDrop','recovery')),unit:'bpm'};
 return {};
}
function changeName(v,b,preferUp=false){
 if(!valid(v)||!valid(b)||b<=0)return null;
 const pct=Math.abs((v-b)/b)*100, up=v>b;
 const adjective=pct>=60?L('大幅','大幅','far','大幅に','크게'):pct>=30?L('明顯','明显','clearly','明らかに','뚜렷하게'):pct>=12?L('有些','有些','somewhat','やや','다소'):L('略微','略微','slightly','少し','약간');
 const direction=up?L('升高','升高','higher','高い','높음'):L('下降','下降','lower','低い','낮음');
 return {pct:Math.round(pct),up,adjective,direction,near:pct<12};
}
function fact(key,row){
 const d=datum(key,row),v=d.value,b=d.base,delta=changeName(v,b);
 if(key==='cardio'||key==='activityRecovery'){
  const k=key==='cardio'?['breath','heart','hrv','stable']:['energy','recovery','calm'];
  const a=k.filter(x=>valid(row?.scores?.[x])).sort((x,y)=>row.scores[x]-row.scores[y]).slice(0,3);
  if(!a.length)return L('缺少有效分項，不能推定原因。','缺少有效分项，不能推定原因。','Missing valid components; no cause inferred.','内訳が不足しており原因は推定できません。','유효한 세부 점수가 부족해 원인을 추정하지 않습니다.');
  const f=a.map(k=>`${keyName(k)}${row.scores[k]}`).join(L('、','、',', ','・',', '));
  return L(`主要是${f}分，同時拉低總分。`,`主要是${f}分，同时拉低总分。`,`Main low subscores: ${f}; they lower this composite.`,`主な低得点は${f}点で、総合点を下げています。`,`주요 저점은 ${f}점이며 종합 점수를 낮춥니다.`);
 }
 if(key==='calm'){
  const a=['breath','hrv','heart'].filter(k=>valid(row?.scores?.[k])).sort((x,y)=>row.scores[x]-row.scores[y]).slice(0,2);
  if(a.length)return L(`放鬆指標偏低，當天${a.map(k=>keyName(k)+row.scores[k]+'分').join('、')}也偏低；需一起核對休息狀態。`,
   `放松指标偏低，当天${a.map(k=>keyName(k)+row.scores[k]+'分').join('、')}也偏低；需核对休息状态。`,
   `Calmness is low alongside ${a.map(k=>keyName(k)+' '+row.scores[k]).join(' and ')}; compare true resting periods.`,
   `落ち着きの点数が低く、同日に${a.map(k=>keyName(k)+row.scores[k]+'点').join('・')}も低下。安静時を確認してください。`,
   `안정도 점수가 낮고 같은 날 ${a.map(k=>keyName(k)+row.scores[k]+'점').join('·')}도 낮습니다. 휴식 상태를 확인하세요.`);
 }
 if(!valid(v))return L('原始量測不足，不能猜測低分原因。','原始测量不足，不能猜测低分原因。','Raw readings missing; the reason cannot be guessed.','元の測定値が不足し、原因は推測できません。','원본 측정값이 부족해 원인을 추측할 수 없습니다.');
 const a=round(v),x=valid(b)?round(b):null,txt=delta?`${delta.adjective}${delta.direction}`:null;
 const noBase=L('尚無可比的個體基準','暂无可比的个体基准','no matched personal baseline','比較できる個体基準なし','비교할 개별 기준 없음');
 if(key==='heart')return x===null?
  L(`安靜心跳${a}次／分，${noBase}。`,`安静心跳${a}次/分，${noBase}。`,`Resting pulse ${a}/min; ${noBase}.`,`安静時心拍${a}回/分。${noBase}。`,`안정 심박 ${a}회/분. ${noBase}.`):
  L(`安靜心跳${a}次／分，平常約${x}次，${txt}。`,`安静心跳${a}次/分，平常约${x}次，${txt}。`,`Resting pulse ${a}/min vs usual ${x}, ${delta?.up?'higher':'lower'}.`,`安静時心拍${a}回/分、普段${x}回、${delta?.up?'増加':'低下'}。`,`안정 심박 ${a}회/분, 평소 ${x}회보다 ${delta?.up?'증가':'감소'}.`);
 if(key==='breath')return x===null?L(`安靜呼吸${a}次／分，${noBase}。`,`安静呼吸${a}次/分，${noBase}。`,`Resting breaths ${a}/min; ${noBase}.`,`安静時呼吸${a}回/分。${noBase}。`,`안정 호흡 ${a}회/분. ${noBase}.`):
  L(`安靜呼吸${a}次／分，平常約${x}次，${txt}。`,`安静呼吸${a}次/分，平常约${x}次，${txt}。`,`Resting breaths ${a}/min vs usual ${x}, ${delta?.up?'higher':'lower'}.`,`安静時呼吸${a}回/分、普段${x}回、${delta?.up?'増加':'低下'}。`,`안정 호흡 ${a}회/분, 평소 ${x}회보다 ${delta?.up?'증가':'감소'}.`);
 if(key==='hrv'&&x!==null&&valid(d.other)&&valid(d.otherBase)&&d.otherBase>0){
  const rmRatio=v/b,sdRatio=d.other/d.otherBase;
  if(row?.scores?.hrv<60&&rmRatio>=.95&&sdRatio>=.95)return L('HRV評分偏低，但目前RMSSD、SDNN接近平常；需核對其他計分條件與原始資料，不能以此推斷疾病。',
    'HRV评分偏低，但RMSSD、SDNN接近平常；需核对其他计分条件和原始数据，不能据此推断疾病。',
    'HRV score is low, but RMSSD and SDNN are near usual. Check score inputs; this does not prove disease.',
    'HRV点数は低い一方、RMSSD・SDNNは普段に近い値です。計算条件を再確認してください。',
    'HRV 점수는 낮지만 RMSSD·SDNN은 평소와 비슷합니다. 점수 계산 조건과 원자료를 확인하세요.');
 }
 if(key==='hrv')return x===null?L(`心跳間隔變化指標RMSSD為${a}毫秒，${noBase}。`,`心跳间隔变化指标RMSSD为${a}毫秒，${noBase}。`,`Beat-interval measure RMSSD ${a}ms; ${noBase}.`,`心拍間隔の指標RMSSDは${a}ms。${noBase}。`,`박동 간격 지표 RMSSD ${a}ms. ${noBase}.`):
  L(`心跳間隔變化${txt}：RMSSD ${a}、平常${x}毫秒。`,`心跳间隔变化${txt}：RMSSD ${a}，平常${x}毫秒。`,`Beat-interval variation ${delta?.up?'rose':'fell'}: RMSSD ${a}ms vs usual ${x}.`,`心拍間隔の変化が${delta?.up?'増加':'低下'}：RMSSD ${a}ms、普段${x}ms。`,`박동 간격 변화가 ${delta?.up?'증가':'감소'}: RMSSD ${a}ms, 평소 ${x}ms.`);
 if(key==='stable')return x===null?L(`心搏節奏指標${a}毫秒，${noBase}；不能當作心律不整診斷。`,`心搏节奏指标${a}毫秒，${noBase}；不能诊断心律不齐。`,`Beat-pattern proxy ${a}ms; no baseline. Not an arrhythmia diagnosis.`,`拍動指標${a}ms、比較値なし。不整脈の診断ではありません。`,`박동 지표 ${a}ms, 기준 없음. 부정맥 진단은 아닙니다.`):
  L(`節奏相關指標SDNN ${a}毫秒，平常${x}，${txt}；不等於心臟病。`,`节奏相关指标SDNN ${a}毫秒，平常${x}，${txt}；不等于心脏病。`,`SDNN ${a}ms vs usual ${x}, ${delta?.up?'higher':'lower'}; not proof of heart disease.`,`拍動関連のSDNN ${a}ms、普段${x}ms。心疾患の証明ではありません。`,`박동 관련 SDNN ${a}ms, 평소 ${x}ms. 심장병의 증거는 아닙니다.`);
 if(key==='sleep')return x===null?L(`記錄到${a}小時休息，${noBase}。`,`记录到${a}小时休息，${noBase}。`,`Recorded ${a}h of rest; ${noBase}.`,`休息${a}時間を記録。${noBase}。`,`휴식 ${a}시간 기록. ${noBase}.`):
  L(`休息${a}小時，平常約${x}小時，${txt}。`,`休息${a}小时，平常约${x}小时，${txt}。`,`Rest ${a}h vs usual ${x}h, ${delta?.up?'longer':'shorter'}.`,`休息${a}時間、普段${x}時間、${delta?.up?'長い':'短い'}状態です。`,`휴식 ${a}시간, 평소 ${x}시간보다 ${delta?.up?'김':'짧음'}.`);
 if(key==='energy')return x===null?L(`活動量${a}，${noBase}。`,`活动量${a}，${noBase}。`,`Activity index ${a}; ${noBase}.`,`活動指数${a}、${noBase}。`,`활동 지수 ${a}. ${noBase}.`):
  L(`活動量${a}，平常約${x}，${txt}。`,`活动量${a}，平常约${x}，${txt}。`,`Activity index ${a} vs usual ${x}, ${delta?.up?'higher':'lower'}.`,`活動指数${a}、普段${x}、${delta?.up?'増加':'低下'}。`,`활동 지수 ${a}, 평소 ${x}보다 ${delta?.up?'증가':'감소'}.`);
 if(key==='recovery'&&x!==null&&delta?.up&&row?.scores?.recovery<60)return L('這次心跳回落不比參考慢，但恢復分數偏低；需核對活動強度及計分依據，不能直接判定恢復差。',
  '这次心跳回落不比参考慢，但恢复分数偏低；需核对运动强度及计分依据，不能直接判定恢复差。',
  'Pulse recovery was not slower than usual despite the low score. Check exercise intensity and score inputs.',
  '回復の速度は普段より遅くないのに点数が低いため、運動強度と計算条件を確認してください。',
  '회복 속도는 평소보다 느리지 않지만 점수가 낮습니다. 운동 강도와 점수 계산을 확인하세요.');
 if(key==='recovery')return x===null?L(`活動後兩分鐘心跳回落${a}次／分，${noBase}。`,`活动后两分钟心跳回落${a}次/分，${noBase}。`,`Pulse fell ${a}/min in 2 min; ${noBase}.`,`運動後2分間で心拍が${a}回/分低下。${noBase}。`,`활동 2분 뒤 심박 ${a}회/분 감소. ${noBase}.`):
  L(`活動後兩分鐘心跳回落${a}次，平常約${x}次，恢復${delta?.up?'較快':'較慢'}。`,`活动后两分钟心跳回落${a}次，平常约${x}次，恢复${delta?.up?'较快':'较慢'}。`,`Pulse fell ${a}/min in 2 min vs usual ${x}; recovery ${delta?.up?'faster':'slower'}.`,`運動後2分で心拍が${a}低下、普段${x}。回復が${delta?.up?'速い':'遅い'}。`,`활동 후 2분 심박 감소 ${a}, 평소 ${x}. 회복이 ${delta?.up?'빠름':'느림'}.`);
 return null;
}
// Relative scores communicate severity, not an actual cardiac arrest/respiratory arrest diagnosis.
// Never interpret a low heart SCORE as a low pulse RATE: the measured direction may be up.
const affectedScore=n=>valid(n)&&n>0&&n<80; // zero is unusable/unknown; it is not proof of organ failure
const strongest=(values)=>Math.min(...values.filter(affectedScore));
const vocab=(score)=>({zht:['最高警戒','極高度警戒','非常嚴重','嚴重異常','明顯異常','高風險','接近高風險','明顯偏離','需持續追蹤','中度偏離'],zh:['最高警戒','极高度警戒','非常严重','严重异常','明显异常','高风险','接近高风险','明显偏离','需持续追踪','中度偏离'],en:['Critical alert','Extreme alert','Very serious','Serious anomaly','Significant anomaly','High risk','Near high risk','Marked deviation','Needs close follow-up','Moderate deviation'],ja:['最優先警戒','極めて高い警戒','非常に深刻','重大な異常','明らかな異常','高リスク','高リスクに近い','明らかな変化','継続観察が必要','中程度の変化'],ko:['최고 경계','극도로 높은 경계','매우 심각','심각한 이상','뚜렷한 이상','고위험','고위험에 근접','뚜렷한 변화','지속 관찰 필요','중간 수준 변화']})[state.lang||'zht']?.[[9,19,29,39,49,59,64,69,74,79].findIndex(x=>score<=x)]||level(score);
function riskAction(score,mode='day'){
 // Period descriptions must not imply that an old episode is still happening now.
 if(mode==='period'){
  if(score<=19)return L('曾出現極端異常，現在先確認寵物狀況；若仍異常，立即聯絡獸醫。','曾出现极端异常，现在先确认宠物状况；若仍异常，立即联系兽医。','Past scores were critically low. Check your pet now; contact a vet immediately if abnormal now.','過去に極端な低得点。今の様子を確認し、異常が続けば直ちに獣医へ。','과거 극단적 저점이 있었습니다. 지금 상태를 확인하고 이상이 지속되면 즉시 진료 상담.');
  if(score<=39)return L('這段期間曾有嚴重異常；請核對最新狀況，仍異常就立即聯絡獸醫。','这段时间出现过严重异常；核对最新状态，仍异常就立即联系兽医。','There were serious lows. Check current readings; call a vet immediately if still abnormal.','期間内に重い異常がありました。今の値も異常ならすぐ獣医へ。','기간 중 심각한 이상이 있었습니다. 현재도 이상하면 즉시 진료 상담.');
  if(score<=59)return L('這段期間多次值得重視；請核對目前狀況並聯絡獸醫評估。','这段时间多次值得重视；请核对目前状态并联系兽医评估。','Review current readings and contact a vet for assessment.','現在の値を確認し、獣医に相談してください。','현재 측정값을 확인하고 수의사와 상담하세요.');
  return L('請持續比對最新記錄；若變差或反覆發生，聯絡獸醫。','持续对比最新记录；若变差或反复出现，联系兽医。','Track the latest records; ask a vet if it worsens or keeps recurring.','最新記録を比較し、悪化・反復なら獣医へ。','최신 기록을 비교하고 악화·반복되면 수의사에게 문의하세요.');
 }
 if(score<=9)return L('極端異常！現在立即查看呼吸與精神；若持續異常，立即就醫。喘不過氣、昏倒或牙齦發藍，直接急診。',
 '极端异常！现在立即检查呼吸和精神；持续异常立即就医。喘不过气、昏倒或牙龈发蓝，直接急诊。',
 'Critical readings: check breathing and alertness now. If still abnormal, seek immediate vet care; distress/collapse/blue gums mean ER.',
 '極端な異常です。今すぐ呼吸と意識を確認。異常が続けば直ちに受診。呼吸困難・失神・歯ぐきの青変は救急へ。',
 '극단적 이상입니다! 지금 호흡·의식을 확인하고 이상이 지속되면 즉시 진료. 호흡곤란·실신·푸른 잇몸은 응급진료.');
 if(score<=19)return L('極嚴重！立即確認寵物狀況；安靜時仍異常請立即就醫，呼吸困難或倒下直接急診。',
 '极严重！立即确认宠物状态；安静时仍异常请立即就医，呼吸困难或倒下直接急诊。',
 'Extremely serious: check now; seek immediate veterinary care if abnormal at rest. Distress/collapse means ER.',
 '極めて深刻です。今すぐ確認し、安静時も異常なら直ちに受診。呼吸困難や失神は救急へ。',
 '매우 심각합니다! 지금 확인하고 휴식 중에도 이상하면 즉시 진료. 호흡곤란·실신은 응급진료.');
 if(score<=39)return L('嚴重異常！先確認佩戴及休息狀態；若仍明顯異常，立即聯絡獸醫。',
 '严重异常！先确认佩戴和休息状态；仍明显异常就立即联系兽医。',
 'Serious anomaly: check collar fit and resting condition; contact a vet immediately if it persists.',
 '重大な異常。装着と安静状態を確認し、続けば直ちに獣医に相談。',
 '심각한 이상! 착용·휴식 상태를 확인하고 지속되면 즉시 수의사 상담.');
 if(score<=59)return L('高風險，現在核對休息時的數值；若反覆或持續，今天聯絡獸醫。',
 '高风险，现在核对休息时的数值；反复或持续就今天联系兽医。',
 'High risk: recheck at rest now; if persistent or repeated, contact a vet today.',
 '高リスク。安静時に再確認し、続く・繰り返す場合は今日獣医へ。',
 '고위험. 휴식 중 재확인하고 반복·지속되면 오늘 진료 상담.');
 if(score<=69)return L('有明顯異常，請核對同日數據；若持續變差，聯絡獸醫。',
 '有明显异常，请核对同日数据；持续变差就联系兽医。',
 'A marked change: compare same-day readings; ask a vet if it keeps worsening.',
 '明らかな変化です。同日の記録を確認し、悪化が続けば獣医へ。',
 '뚜렷한 변화입니다. 같은 날 기록을 확인하고 계속 악화되면 진료 상담.');
 return L('有中度變化，留意近期趨勢，必要時再測量。',
 '有中度变化，留意近期趋势，必要时再测量。',
 'Moderate change: monitor the trend and repeat a reliable measurement if needed.',
 '中程度の変化。推移を見て必要なら再測定。',
 '중간 수준 변화입니다. 추이를 살펴보고 필요하면 재측정하세요.');
}
function relatedNames(list,s){
 const join=state.lang==='en'?', ':state.lang==='ja'?'・':state.lang==='ko'?'·':'、';
 const unit=state.lang==='en'?'':state.lang==='ja'?'点':state.lang==='ko'?'점':'分';
 return list.map(k=>`${keyName(k)}${s[k]}${unit}`).join(join);
}
function signalDirection(key,row){
 // Only add a physiological direction if an actual measured value and comparable baseline exist.
 const d=datum(key,row);
 if(!valid(d.value)||!valid(d.base)||d.base<=0)return '';
 const pct=Math.round(100*(d.value-d.base)/d.base);
 if(Math.abs(pct)<15)return '';
 if(key==='heart')return L(`（實測心跳${pct>0?'加快':'減慢'}）`,`（实测心跳${pct>0?'加快':'减慢'}）`,` (measured pulse ${pct>0?'faster':'slower'})`,`（実測心拍は${pct>0?'速い':'遅い'}）`,` (측정 심박 ${pct>0?'증가':'감소'})`);
 if(key==='breath')return L(`（實測呼吸${pct>0?'加快':'減慢'}）`,`（实测呼吸${pct>0?'加快':'减慢'}）`,` (measured breaths ${pct>0?'faster':'slower'})`,`（実測呼吸は${pct>0?'速い':'遅い'}）`,` (측정 호흡 ${pct>0?'증가':'감소'})`);
 return '';
}
function dayLink(key,row){
 if(!row?.scores)return null;
 if(row.source==='20hz-waveform'&&root.DeepPetSignalScoring?.isVerifiedWear?.(row)!==true)return null;
 const s=row.scores,poor=k=>affectedScore(s[k]);
 if(!poor(key))return null;
 let selected=[],target=null,kind='';
 if(key==='sleep'){selected=['heart','breath'].filter(poor);target=0;kind='sleep-cardio';}
 else if((key==='energy'||(key==='activityRecovery'&&poor('energy')))&&poor('sleep')){selected=['sleep'];target=1;kind='energy-sleep';}
 else if(key==='cardio'&&poor('sleep')){selected=['sleep'];target=1;kind='cardio-sleep';}
 if(!selected.length)return null;
 const relevant=strongest(selected.map(k=>s[k]));
 const urgency=relevant;const lvl=vocab(urgency);
 const details=relatedNames(selected,s);
 const trend=selected.filter(k=>k==='heart'||k==='breath').map(k=>signalDirection(k,row)).filter(Boolean).join('');
 const title=L(`同日${details}${trend}｜${lvl}。`,`同日${details}${trend}｜${lvl}。`,`Same-day ${details}${trend} · ${lvl}.`,`同日${details}${trend}｜${lvl}。`,`같은 날 ${details}${trend} · ${lvl}.`);
 return {to:target,kind,score:urgency,relatedScore:relevant,critical:urgency<=19,severity:lvl,txt:`${title} ${riskAction(urgency)}`};
}
function periodLink(key,rows,days,score){
 if(!valid(score)||!Array.isArray(rows)||days===1)return null;
 const focus=key==='sleep'?'sleep-cardio':(key==='energy'||key==='activityRecovery')?'energy-sleep':key==='cardio'?'cardio-sleep':null;
 if(!focus)return null;
 const unique=new Map(),conflict=new Set();
 for(const r of rows){if(!r||typeof r.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(r.date))continue;
  if(r.source==='20hz-waveform'&&root.DeepPetSignalScoring?.isVerifiedWear?.(r)!==true)continue;
  if(unique.has(r.date)){conflict.add(r.date);continue;}unique.set(r.date,r);
 }
 for(const d of conflict)unique.delete(d);
 const matched=[...unique.values()].filter(r=>{const s=r.scores||{},poor=k=>affectedScore(s[k]);
  if(!poor(key))return false;
  if(focus==='sleep-cardio')return poor('heart')||poor('breath');
  if(focus==='energy-sleep')return poor('sleep')&&(key!=='activityRecovery'||poor('energy'));
  return poor('sleep');
 });
 const count=matched.length;if(!count)return null;
 const getRelevant=r=>focus==='sleep-cardio'?strongest(['heart','breath'].map(k=>r.scores[k])):r.scores.sleep;
 const worst=Math.min(...matched.map(getRelevant));
 const relatedWorst=Math.min(...matched.map(getRelevant));
 const critical=matched.filter(r=>getRelevant(r)<=19).length;
 const high=matched.filter(r=>getRelevant(r)<60).length;
 const target=focus==='sleep-cardio'?0:1, lvl=vocab(worst);
 const name=focus==='sleep-cardio'?L('心跳／呼吸與睡眠','心跳／呼吸与睡眠','pulse/breathing and sleep','心拍／呼吸と睡眠','심박·호흡과 수면'):
  focus==='energy-sleep'?L('睡眠與精力','睡眠与精力','sleep and energy','睡眠と活力','수면과 활력'):
  L('心肺與睡眠','心肺与睡眠','cardio and sleep','心肺と睡眠','심폐와 수면');
 const summary=L(`${days}天內${count}天${name}同時異常（${high}天高風險${critical?`、${critical}天極端低分`:''}），最低${worst}分｜${lvl}。`,
  `${days}天内${count}天${name}同时异常（${high}天高风险${critical?`、${critical}天极端低分`:''}），最低${worst}分｜${lvl}。`,
  `${count}/${days} days had both ${name} affected (${high} high-risk${critical?`, ${critical} critical`:''}); lowest ${worst} · ${lvl}.`,
  `${days}日中${count}日、${name}が共に異常（高リスク${high}日${critical?`・極端${critical}日`:''}）。最低${worst}点｜${lvl}。`,
  `${days}일 중 ${count}일 ${name} 동시 이상(고위험 ${high}일${critical?`, 극단적 저점 ${critical}일`:''}), 최저 ${worst}점 · ${lvl}.`);
 return {to:target,kind:focus,count,high,critical,worst,relatedWorst,score:worst,severity:lvl,txt:`${summary} ${riskAction(worst,'period')}`};
}
function linkLabel(link,days){
 const target=link.to===0?L('查看心肺','查看心肺','See cardio','心肺を見る','심폐 보기'):L('查看睡眠','查看睡眠','See sleep','睡眠を見る','수면 보기');
 const label=link.score<=9?L('最高警戒','最高警戒','CRITICAL','最優先警戒','최고 경계'):
 link.score<=19?L('極度嚴重','极度严重','Extreme','極めて深刻','매우 심각'):
 link.score<=39?L('嚴重異常','严重异常','Serious','重大な異常','심각한 이상'):
 link.score<=59?L('高風險','高风险','High risk','高リスク','고위험'):
 link.score<=69?L('明顯異常','明显异常','Noticeable','明らかな異常','뚜렷한 이상'):
 L('中度異常','中度异常','Moderate','中程度','중간 이상');
 if(days>1)return L(`${days}天內${link.count}天同時異常｜最低${link.worst}分・${label} · ${target} ›`,
  `${days}天内${link.count}天同时异常｜最低${link.worst}分·${label} · ${target} ›`,
  `${link.count}/${days} days affected · worst ${link.worst} · ${label} · ${target} ›`,
  `${days}日中${link.count}日異常・最低${link.worst}点・${label} · ${target} ›`,
  `${days}일 중 ${link.count}일 이상 · 최저${link.worst}점 · ${label} · ${target} ›`);
 return L(`同日${label}（最低${link.relatedScore}分） · ${target} ›`,
  `同日${label}（最低${link.relatedScore}分） · ${target} ›`,
  `Same-day ${label} (related score ${link.relatedScore}) · ${target} ›`,
  `同日${label}（関連${link.relatedScore}点） · ${target} ›`,
  `같은 날 ${label}(관련 ${link.relatedScore}점) · ${target} ›`);
}

function tailored(key,period,compact=false){
 const day={
 heart:[
  '先讓寵物安靜下來核對心跳；安靜時仍異常，立即聯絡獸醫。若虛脫或喘不過氣，直接急診。',
  '先让宠物安静下来核对心跳；安静时仍异常，立即联系兽医。若虚脱或喘不过气，直接急诊。',
  'Recheck pulse at rest. If still abnormal, call a vet now; collapse or breathing distress means ER.',
  '安静にして心拍を再確認。異常が続けばすぐ獣医へ。虚脱・呼吸困難は救急。',
  '휴식 중 심박을 다시 확인하고 이상이 지속되면 즉시 수의사에게 연락하세요. 쓰러짐·호흡곤란은 응급진료.'
 ],breath:[
  '現在檢查有沒有喘得費力、張口呼吸或牙齦發藍；有就直接急診。安靜時反覆異常，也要立即聯絡獸醫。',
  '现在检查是否呼吸费力、张口喘气或牙龈发蓝；有就直接急诊。安静时反复异常也要立即联系兽医。',
  'Watch for laboured or open-mouth breathing and blue gums: ER now. Repeated abnormal resting breaths need an immediate vet call.',
  '今すぐ苦しい呼吸・口呼吸・歯ぐきの青変を確認。あれば救急へ。安静時の異常が続けば獣医へ。',
  '숨을 힘들게 쉬거나 입을 벌리고 숨 쉬거나 잇몸이 파랗다면 즉시 응급진료. 안정 시에도 반복되면 수의사에게 연락하세요.'
 ],hrv:[
  '先在安靜、訊號穩定時重新測量。HRV低分不能判定心臟衰竭；若同時精神差、呼吸異常或持續偏低，今天聯絡獸醫。',
  '先在安静、信号稳定时重新测量。HRV低分不能判断心力衰竭；若同时精神差、呼吸异常或持续偏低，今天联系兽医。',
  'Recheck HRV at rest; low HRV alone is not heart failure. If paired with low energy or breathing changes, call a vet today.',
  '安静・安定した信号で再測定。HRVだけで心不全とは判断できません。元気低下や呼吸異常を伴うなら今日獣医へ。',
  '휴식 중 HRV를 재측정하세요. 낮은 HRV만으로 심부전을 뜻하지 않습니다. 기력·호흡 이상이 함께 있으면 오늘 진료 상담.'
 ],stable:[
  '先確認訊號與心跳節奏是否真的異常；這個分數不能確診心律不整。若有明顯虛弱、昏倒或節奏持續異常，立即聯絡獸醫。',
  '先确认信号与心跳节奏是否真的异常；这个分数不能诊断心律不齐。若明显虚弱、昏倒或节奏持续异常，立即联系兽医。',
  'Verify the beat pattern; this score alone cannot diagnose arrhythmia. Weakness, fainting or persistent irregular beats need urgent vet care.',
  '測定と拍動を確認。この点数だけでは不整脈と診断できません。失神・強い脱力・異常が続く場合はすぐ獣医へ。',
  '박동과 신호를 확인하세요. 점수만으로 부정맥을 진단할 수 없습니다. 심한 무력감·실신·지속적인 이상은 즉시 진료 상담.'
 ],recovery:[
  '先減輕活動量，核對同等運動後兩分鐘心跳回落多少；若多次恢復很慢或伴隨無力，今天聯絡獸醫。年齡可能有影響，但不能單靠年齡解釋。',
  '先减少活动，核对同样运动后两分钟心跳回落多少；若多次恢复很慢或伴随无力，今天联系兽医。年龄可能影响，但不能只归因于年龄。',
  'Reduce exertion and compare 2-minute recovery after similar activity. Repeated slow recovery or weakness merits a vet call today; age alone is not the cause.',
  '運動を控え、同程度の運動後2分の回復を比較。遅れが続く・脱力がある場合は今日獣医へ。年齢だけで判断しないでください。',
  '활동량을 줄이고 비슷한 활동 후 2분 회복을 비교하세요. 반복적으로 느리거나 무력하면 오늘 진료 상담. 나이만으로 판단할 수 없습니다.'
 ],calm:[
  '先排除噪音、緊張和配戴干擾，也要核對心跳與呼吸；若休息時仍顯著異常或精神差，今天聯絡獸醫。',
  '先排除噪音、紧张和佩戴干扰，也要核对心跳与呼吸；若休息时仍明显异常或精神差，今天联系兽医。',
  'Check noise, stress, collar fit, pulse and breaths. If still very low at rest or your pet looks unwell, call a vet today.',
  '騒音・緊張・装着状態と心拍・呼吸を確認。安静時も低く元気がなければ今日獣医へ。',
  '소음·긴장·착용 상태와 심박·호흡을 확인하세요. 휴식 중에도 낮고 기력이 없으면 오늘 수의사 상담.'
 ]
 };
 const trend={
 cardio:['多天心肺低分，先比對最近安靜時心跳與呼吸；若今天仍明顯異常，立即聯絡獸醫。','多天心肺低分，先对比最新安静时心跳和呼吸；今天仍异常，立即联系兽医。','Repeated cardio lows: check current resting pulse and breathing. If still abnormal, call a vet today.','心肺の低得点が続いています。最新の安静時心拍・呼吸も異常なら今日獣医へ。','심폐 저점이 반복됩니다. 최신 안정 심박·호흡도 이상하면 오늘 진료 상담.'],
 heart:['多天心跳異常，先核對最新安靜心率；若仍偏離，今天聯絡獸醫。','多天心跳异常，核对最新安静心率；仍偏离就今天联系兽医。','Repeated pulse lows: recheck current resting pulse; if still abnormal, call a vet today.','心拍の異常日が続いています。最新の安静時心拍を確認し、続けば今日獣医へ。','심박 이상이 여러 날 반복됩니다. 최신 안정 심박도 낮은 점수면 오늘 진료 상담.'],
 breath:['多天呼吸異常，今天確認安靜呼吸是否費力；若喘不過氣，直接急診。','多天呼吸异常，今天确认安静时是否费力；喘不过气直接急诊。','Repeated breathing lows: check resting effort now. Breathing distress means ER.','呼吸の異常日が続いています。安静時に苦しければすぐ救急へ。','호흡 이상이 반복됩니다. 안정 시 호흡이 힘들다면 즉시 응급진료.'],
 hrv:['多天HRV偏低，先比對相同休息條件；若精神差或持續下降，聯絡獸醫。','多天HRV偏低，先对比相同休息条件；若精神差或持续下降，联系兽医。','Repeated HRV lows: compare matching rest periods; ask a vet if energy is poor or it keeps falling.','HRVの低い日が続いています。休息条件を揃えて比べ、元気がなければ獣医へ。','HRV 저점이 반복됩니다. 휴식 조건을 맞춰 비교하고 기력이 낮으면 진료 상담.'],
 stable:['多天心搏節奏指標偏低，核對有效波形；若有虛弱或實際心跳不規則，請獸醫評估。','多天心搏节奏指标偏低，核对有效波形；若虚弱或心跳不规则，请兽医评估。','Repeated beat-pattern lows: verify the signal; ask a vet about weakness or truly irregular beats.','拍動指標の低い日が続いています。測定を確認し、脱力や不規則な拍動があれば獣医へ。','박동 지표 저점이 반복됩니다. 신호를 확인하고 무력감이나 불규칙 박동이 있으면 진료 상담.'],
 sleep:['多天休息不足，先查夜間呼吸、疼痛和環境；持續睡不好請聯絡獸醫。','多天休息不足，先检查夜间呼吸、疼痛和环境；持续睡不好请联系兽医。','Repeated short rest: check night breathing, pain and the sleep space; ask a vet if it continues.','休息不足の日が続いています。夜間の呼吸・痛み・環境を確認し、続けば獣医へ。','휴식 부족이 반복됩니다. 야간 호흡·통증·환경을 살피고 지속되면 진료 상담.'],
 activityRecovery:['多天精力與恢復偏低，先查睡眠、活動變化與恢復速度；若現在仍無力請聯絡獸醫。','多天精力与恢复偏低，核对睡眠、活动变化和恢复速度；仍无力请联系兽医。','Repeated low energy/recovery: check sleep, activity and 2-minute recovery; call a vet if weakness remains.','活力・回復が低い日が続いています。睡眠・活動・回復を確認し、脱力が続けば獣医へ。','활력·회복 저점이 반복됩니다. 수면·활동·회복을 확인하고 무력하면 진료 상담.'],
 energy:['多天活動量下降，先看睡眠、疼痛與步態；突然無力時不要等待。','多天活动量下降，先看睡眠、疼痛和步态；突然无力时不要等待。','Repeated low activity: check sleep, pain and walking; sudden weakness needs urgent care.','活動が低い日が続きます。睡眠・痛み・歩き方を確認。急な脱力はすぐ受診。','활동 저하가 반복됩니다. 수면·통증·보행을 확인하고 갑작스런 무력감은 즉시 진료.'],
 recovery:['多天活動後恢復慢，減輕運動並比較相似強度；持續異常請聯絡獸醫。','多天活动后恢复慢，减少运动并比较相似强度；持续异常联系兽医。','Repeated slow recovery: reduce exertion and compare similar activities; ask a vet if it persists.','回復が遅い日が続いています。運動を控えて同条件で比べ、続けば獣医へ。','운동 후 회복이 느린 날이 반복됩니다. 활동을 줄이고 비슷한 강도로 비교 후 지속되면 진료 상담.'],
 calm:['多天放鬆度偏低，先查安靜環境、心跳與呼吸；若持續異常聯絡獸醫。','多天放松度偏低，检查安静环境、心跳和呼吸；持续异常联系兽医。','Repeated low calmness: check rest conditions, pulse and breaths; ask a vet if it continues.','落ち着きの低い日が続きます。静かな環境・心拍・呼吸を確認し、続けば獣医へ。','안정도가 낮은 날이 반복됩니다. 환경·심박·호흡을 확인하고 지속되면 진료 상담.']
 };
 const x=(period?trend:day)[key];if(!x)return null;const ix=['zht','zh','en','ja','ko'].indexOf(state.lang);return x[ix<0?0:ix];
}
function advice(key,score,period){
 if(!valid(score))return '';
 const severe=score<20,high=score<60,moderate=score<80,mild=score<90;
 if(period!==1){
  if(high&&tailored(key,true))return tailored(key,true);
  if(high)return L('請優先核對最近有效數據及精神、呼吸；若異常仍在，今天聯絡獸醫。出現呼吸費力、倒下或牙齦發藍，直接急診。',
   '请优先核对最新有效数据及精神、呼吸；异常仍在，今天联系兽医。呼吸费力、倒下或牙龈发蓝，直接急诊。',
   'Check the newest readings and how your pet is now. If still abnormal, call a vet today. Laboured breathing, collapse or blue gums needs emergency care.',
   '最新値と今の呼吸・様子を確認し、異常が続けば今日中に獣医へ。呼吸困難・虚脱は救急へ。',
   '최신 수치와 현재 상태를 확인하세요. 이상이 지속되면 오늘 수의사에게 연락하고 호흡곤란·쓰러짐은 응급진료가 필요합니다.');
  if(moderate)return L('近況仍偏低，持續幾天請聯絡獸醫。','近期仍偏低，持续几天请联系兽医。','If recent readings remain low, speak to a vet.','最近も低い場合は獣医師に相談。','최근에도 낮은 수치가 이어지면 수의사와 상담하세요.');
  return L('比較最近有效記錄即可。','继续比较最近的有效记录。','Compare with recent verified days.','最近の有効記録と比較してください。','최근 유효 기록과 비교하세요.');
 }
 if(key==='heart'||key==='breath'||key==='cardio'){
  if(high&&tailored(key,false))return tailored(key,false);
  if(severe)return L('現在請確認安靜時的呼吸與反應，立即聯絡獸醫評估；如正在喘不過氣、倒下或牙齦發藍，直接送急診。',
   '现在检查安静时的呼吸和反应，立即联系兽医评估；如喘不过气、倒下或牙龈发蓝，直接送急诊。',
   'Check resting breathing and responsiveness now; contact a vet immediately. Laboured breathing, collapse or blue gums means emergency care.',
   '今すぐ安静時の呼吸と反応を確認し、獣医に連絡。呼吸困難・虚脱・歯ぐきの青変なら救急へ。',
   '지금 안정 시 호흡과 반응을 확인하고 즉시 수의사에게 연락하세요. 호흡곤란·쓰러짐·푸른 잇몸이면 응급진료를 받으세요.');
  if(high)return L('安靜時仍這樣異常，今天聯絡獸醫；喘得費力或虛脫就直接急診。','安静时仍这样异常，今天联系兽医；呼吸费力或虚脱直接急诊。','If abnormal at rest, call a vet today; distress or collapse needs emergency care.','安静時も異常なら今日中に獣医へ。呼吸困難や虚脱なら救急へ。','안정 시에도 이상하면 오늘 수의사에게 연락하고 호흡곤란·쓰러짐이면 응급진료를 받으세요.');
 }
 if(key==='sleep'){
  if(high)return L('先看是否疼痛、呼吸不順、頻繁被吵醒，提供安靜環境；若精神差或持續睡不好，今天聯絡獸醫。','先检查疼痛、呼吸不顺或频繁被吵醒，提供安静环境；若精神差或持续睡不好，今天联系兽医。','Check pain, breathing and interruptions; offer a quiet rest area. Poor energy or ongoing sleep trouble warrants a vet call today.','痛み・呼吸・中断の有無を確認し、静かな場所へ。元気がない・眠れない状態が続くなら今日獣医へ。','통증·호흡·자주 깨는지 확인하고 조용히 쉬게 하세요. 기력이 없거나 수면 문제가 계속되면 오늘 수의사에게 연락하세요.');
 }
 if(key==='energy'||key==='activityRecovery'){
  if(high)return L('先確認是否休息不足、疼痛或精神突然變差；若持續無力、不能站立或反應變差，立即聯絡獸醫。','先检查休息不足、疼痛或精神突然变差；若持续无力、站不起来或反应变差，立即联系兽医。','Check sleep, pain and sudden low energy. Marked weakness, inability to stand or reduced responsiveness needs urgent veterinary care.','睡眠不足・痛み・元気の急な低下を確認。立てない・反応が鈍い場合は直ちに獣医へ。','수면 부족·통증·기력의 급격한 저하를 확인하세요. 서지 못하거나 반응이 둔하면 즉시 진료받으세요.');
 }
 if(key==='hrv'||key==='stable'||key==='calm'||key==='recovery'){
  if(high&&tailored(key,false))return tailored(key,false);
  if(high)return L('先在安靜且訊號穩定時重新確認；若同時精神很差、呼吸異常或反覆出現，今天聯絡獸醫。','先在安静、信号稳定时重新确认；若同时精神很差、呼吸异常或反复出现，今天联系兽医。','Recheck at rest with a reliable signal. If paired with weakness, breathing changes or repeated lows, call a vet today.','安静・安定した信号で再確認。元気低下や呼吸異常を伴う、または繰り返す場合は今日獣医へ。','안정된 신호로 휴식 중 다시 확인하세요. 기력 저하·호흡 변화가 함께 있거나 반복되면 오늘 수의사에게 연락하세요.');
 }
 if(moderate)return L('下次在相同條件下重測；若持續變差，聯絡獸醫。','下次在相同条件下复测；若持续变差，联系兽医。','Recheck under similar conditions; ask a vet if it persists.','同じ条件で再測定し、続く場合は獣医へ。','비슷한 조건에서 다시 측정하고 지속되면 수의사에게 상담하세요.');
 if(mild)return L('繼續留意下次的讀數與精神。','继续留意下次读数和精神状态。','Watch the next readings and your pet’s behaviour.','次の測定と様子を確認。','다음 측정값과 상태를 확인하세요.');
 return L('保持目前作息，繼續觀察。','保持目前作息，继续观察。','Keep the usual routine and observe.','いつもの生活を続けて様子を見ましょう。','평소 생활을 유지하며 관찰하세요.');
}
// V10.136. These three parts remain individually visible even when the UI is narrow:
// (1) graded status, (2) evidence-backed reason, (3) metric-specific next action.
// A risk *score* never diagnoses cardiac arrest, suffocation or heart failure.
function gradedCause(key,row){
 const m=root.DeepPetNarrative138?.compose({key,score:arguments[2]??row?.scores?.[key],days:arguments[3]||1,row,rows:arguments[4]||[row],datum,lang:state.lang});
 if(m)return m.cause;
 const sc=row?.scores||{},n=k=>valid(sc[k])&&sc[k]>0?sc[k]:null;
 const measured=k=>datum(k,row),fmt=k=>{
  const d=measured(k);if(!valid(d.value))return null;
  const value=round(d.value),base=valid(d.base)&&d.base>0?round(d.base):null;
  const units=k==='sleep'?L('小時','小时','h','時間','시간'):k==='heart'||k==='breath'?L('次/分','次/分','/min','回/分','회/분'):k==='hrv'||k==='stable'?'ms':k==='recovery'?L('次','次','bpm','回','회'):'';
  if(base===null)return L(`${keyName(k)}${value}${units}（基準不足）`,`${keyName(k)}${value}${units}（基准不足）`,`${keyName(k)} ${value}${units} (no baseline)`,`${keyName(k)}${value}${units}（基準不足）`,`${keyName(k)} ${value}${units}(기준 부족)`);
  const percent=Math.round(Math.abs(100*(d.value-d.base)/d.base));
  const trend=d.value>d.base?L('升高','升高','higher','増加','증가'):d.value<d.base?L('下降','下降','lower','低下','감소'):L('接近','接近','near','同程度','비슷함');
  const suffix=d.value===d.base?'':L(`，${trend}${percent}%`,`，${trend}${percent}%`,`, ${percent}% ${trend}`,`、${percent}%${trend}`,`, ${percent}% ${trend}`);
  return L(`${keyName(k)}${value}${units}（平常${base}）${suffix}`,`${keyName(k)}${value}${units}（平常${base}）${suffix}`,`${keyName(k)} ${value}${units} (usual ${base})${suffix}`,`${keyName(k)}${value}${units}（通常${base}）${suffix}`,`${keyName(k)} ${value}${units}(평소 ${base})${suffix}`);
 };
 const top=ks=>ks.filter(k=>n(k)!==null).sort((a,b)=>n(a)-n(b));
 const packed=ks=>top(ks).slice(0,2).map(k=>`${keyName(k)}${n(k)}`).join(L('、','、',', ','・','·'));
 const short=k=>fmt(k)||L(`${keyName(k)}缺少可比原始數值`,`${keyName(k)}缺少可比原始数值`,`${keyName(k)} lacks comparable readings`,`${keyName(k)}の比較値が不足`,`${keyName(k)} 비교 수치 부족`);
 const main=(textZh,textCn,textEn,textJa,textKo)=>L('主要原因：'+textZh,'主要原因：'+textCn,'Main reason: '+textEn,'主な理由：'+textJa,'주된 이유: '+textKo);
 if(key==='cardio'){
  const keys=top(['breath','heart','hrv','stable']);const a=keys.slice(0,2);
  if(!a.length)return main('心跳、呼吸等有效分項不足。','心跳、呼吸等有效分项不足。','insufficient valid heart and breathing components.','心拍・呼吸などの有効データが不足。','심박·호흡 등 유효한 세부 수치 부족.');
  const scored=packed(['breath','heart','hrv','stable']);
  const names=keyName(a[0]);const first=fmt(a[0]);
  return main(`${scored}分拖低總分；${first||names+'缺少原始量測'}。`,`${scored}分拉低总分；${first||names+'缺少原始测量'}。`,`${scored} lower the total; ${first||names+' has no raw reading'}.`,`${scored}点が総合点を下げています。${first||names+'の元データなし'}。`,`${scored}점이 총점을 낮춥니다. ${first||names+' 원시 측정 없음'}.`);
 }
 if(key==='activityRecovery'){
  const keys=top(['energy','recovery','calm']),summary=packed(['energy','recovery','calm']);
  const leading=keys[0];if(!leading)return main('精力、恢復等有效分項不足。','精力、恢复等有效分项不足。','energy/recovery components are missing.','活力・回復の有効データが不足。','활력·회복 세부 점수 부족.');
  return main(`${summary}分拉低總分；${short(leading)}。`,`${summary}分拉低总分；${short(leading)}。`,`${summary} lower the total; ${short(leading)}.`,`${summary}点が総合点を下げています。${short(leading)}。`,`${summary}점이 총점을 낮춥니다. ${short(leading)}.`);
 }
 if(key==='heart'){
  const d=measured('heart'),direction=valid(d.value)&&valid(d.base)?d.value>d.base?L('安靜時心跳明顯加快','安静时心跳明显加快','resting pulse is much faster','安静時心拍が速い','휴식 시 심박 증가'):L('安靜時心跳明顯減慢','安静时心跳明显减慢','resting pulse is much slower','安静時心拍が遅い','휴식 시 심박 감소'):L('心跳分數偏低，但缺可比基準','心跳分数偏低，但缺可比基准','pulse score is low but baseline is missing','心拍点数は低いが比較値不足','심박 점수가 낮지만 기준 부족');
  return main(`${direction}；${short('heart')}。`,`${direction}；${short('heart')}。`,`${direction}; ${short('heart')}.`,`${direction}。${short('heart')}。`,`${direction}; ${short('heart')}.`);
 }
 if(key==='breath'){
  const d=measured('breath'),direction=valid(d.value)&&valid(d.base)?d.value>d.base?L('安靜時呼吸明顯加快','安静时呼吸明显加快','resting breathing is much faster','安静時の呼吸が速い','휴식 중 호흡 증가'):L('安靜時呼吸明顯減慢','安静时呼吸明显减慢','resting breathing is much slower','安静時の呼吸が遅い','휴식 중 호흡 감소'):L('呼吸分數偏低，但缺可比基準','呼吸分数偏低，但缺可比基准','breathing score is low but baseline is missing','呼吸点数は低いが比較値不足','호흡 점수가 낮지만 기준 부족');
  return main(`${direction}；${short('breath')}。`,`${direction}；${short('breath')}。`,`${direction}; ${short('breath')}.`,`${direction}。${short('breath')}。`,`${direction}; ${short('breath')}.`);
 }
 if(key==='hrv'){
  const d=measured('hrv');const rs=valid(d.value)&&valid(d.base)&&d.base>0?d.value/d.base:null,ss=valid(d.other)&&valid(d.otherBase)&&d.otherBase>0?d.other/d.otherBase:null;
  if(rs!==null&&ss!==null&&rs>=.95&&ss>=.95&&n('hrv')<60)return main('HRV低分，但兩項讀數仍接近平常，需核對計分來源，不能推定疾病。','HRV低分，但两项读数接近平常，需核对计分来源，不能推断疾病。','low HRV score conflicts with near-normal readings; check score inputs, not a diagnosis.','HRV低得点でも2指標は普段に近く、算出元を確認。病名は推定しません。','HRV 점수는 낮지만 두 지표는 평소와 비슷합니다. 계산 근거 확인 필요.');
  const sd=valid(d.other)?L(`；SDNN ${round(d.other)}ms`,`；SDNN ${round(d.other)}ms`,`, SDNN ${round(d.other)}ms`,`、SDNN ${round(d.other)}ms`,`, SDNN ${round(d.other)}ms`):'';
  return main(`心跳間隔的變化偏離平常；${short('hrv')}${sd}。`,`心跳间隔的变化偏离平常；${short('hrv')}${sd}。`,`beat-to-beat variation differs from usual; ${short('hrv')}${sd}.`,`心拍間隔の変化が普段と異なります。${short('hrv')}${sd}。`,`심박 간격 변화가 평소와 다릅니다. ${short('hrv')}${sd}.`);
 }
 if(key==='stable')return main(`心搏節奏指標異常；${short('stable')}，不等於確診心律不整。`,`心搏节奏指标异常；${short('stable')}，不等于确诊心律失常。`,`beat-pattern score is abnormal; ${short('stable')}; this does not diagnose arrhythmia.`,`拍動リズムの指標が異常。${short('stable')}。不整脈の診断ではありません。`,`박동 리듬 지표 이상. ${short('stable')}; 부정맥 확진은 아닙니다.`);
 if(key==='sleep'){
  const d=measured('sleep'),known=valid(d.value)&&valid(d.base)&&d.base>0;
  const pulse=top(['heart','breath']).filter(k=>n(k)<80);
  const related=pulse.length?L(`同日${packed(pulse)}分也異常，可一起查看。`,`同日${packed(pulse)}分也异常，可一起查看。`,`same-day ${packed(pulse)} are also low; review together.`,`同日${packed(pulse)}点も低下。合わせて確認。`,`같은 날 ${packed(pulse)}점도 낮아 함께 확인 필요.`):L('可能與環境、疼痛或休息中斷有關，需查證。','可能与环境、疼痛或休息中断有关，需核实。','check the sleep space, pain or interruptions as possible factors.','環境・痛み・中断などを確認。','환경·통증·중단 여부 확인 필요.');
  return main(`${known&&d.value<d.base?'休息明顯縮短；':'休息狀態異常；'}${short('sleep')}。${related}`,`${known&&d.value<d.base?'休息明显缩短；':'休息状态异常；'}${short('sleep')}。${related}`,`${known&&d.value<d.base?'rest is much shorter':'rest is abnormal'}; ${short('sleep')}. ${related}`,`${known&&d.value<d.base?'休息時間が短縮':'休息状態に異常'}。${short('sleep')}。${related}`,`${known&&d.value<d.base?'휴식시간 크게 감소':'휴식 상태 이상'}; ${short('sleep')}. ${related}`);
 }
 if(key==='energy'){
  const sleep=n('sleep');const rel=sleep!==null&&sleep<80?L(`同日睡眠${sleep}分也異常。`,`同日睡眠${sleep}分也异常。`,`sleep was also low (${sleep}).`,`同日の睡眠も${sleep}点。`,`같은 날 수면도 ${sleep}점.`):L('需檢查疼痛、活動安排與食慾。','需检查疼痛、活动安排与食欲。','check pain, activity and appetite.','痛み・活動・食欲も確認。','통증·활동·식욕 확인 필요.');
  return main(`活動量下降或偏離平常；${short('energy')}。${rel}`,`活动量下降或偏离平常；${short('energy')}。${rel}`,`activity differs from usual; ${short('energy')}. ${rel}`,`活動が普段と異なります。${short('energy')}。${rel}`,`활동량이 평소와 다릅니다. ${short('energy')}. ${rel}`);
 }
 if(key==='recovery'){
  const d=measured('recovery');const direction=valid(d.value)&&valid(d.base)&&d.base>0&&d.value<d.base?L('活動後心跳回落比平常慢','活动后心跳回落比平常慢','pulse drops more slowly after activity','運動後の心拍回復が遅い','활동 후 심박 회복 느림'):L('恢復分數偏低，需核對運動強度與量測','恢复分数偏低，需核对运动强度与测量','recovery score is low; check exercise intensity and reading','回復点数が低く、運動強度と測定を要確認','회복 점수 낮아 활동 강도·측정 확인 필요');
  return main(`${direction}；${short('recovery')}。`,`${direction}；${short('recovery')}。`,`${direction}; ${short('recovery')}.`,`${direction}。${short('recovery')}。`,`${direction}; ${short('recovery')}.`);
 }
 if(key==='calm')return main(`放鬆狀態評分偏低，同日${packed(['breath','hrv','heart'])}分也值得核對；不代表已確診疾病。`,`放松状态评分偏低，同日${packed(['breath','hrv','heart'])}分也需核对；不能直接诊断疾病。`,`calmness score is low; same-day ${packed(['breath','hrv','heart'])} need review, not a diagnosis.`,`落ち着きの点数が低く、同日${packed(['breath','hrv','heart'])}点も確認が必要。`,`안정도 점수가 낮고 같은 날 ${packed(['breath','hrv','heart'])}점도 확인 필요.`);
 return fact(key,row)||'';
}
// V10.137: recommendations are differentiated by BOTH the metric and the 16-tier risk
// system, as well as measurement direction and day/period context. No severity template
// should ever replace the measurement-specific action. A score is NOT a diagnosis.
const LANG_INDEX=()=>Math.max(0,['zht','zh','en','ja','ko'].indexOf(state.lang));
const tr=(arr)=>arr[LANG_INDEX()]||arr[0];
const join137=()=>state.lang==='ja'?'。':state.lang==='ko'?'. ':state.lang==='en'?'; ':'；';
const RISK_BOUNDS=[9,19,29,39,49,59,64,69,74,79,82,85,89,94,97,100];
const riskTier=(score)=>!valid(score)||score<=0?-1:RISK_BOUNDS.findIndex(x=>score<=x);
function actionContext137(key,row){
 const d=datum(key,row||{}),sc=row?.scores||{};
 const dir=valid(d.value)&&valid(d.base)&&d.base>0 ? (d.value>d.base?'up':d.value<d.base?'down':'same'):'unknown';
 if(key==='heart')return dir==='up'?'fast':dir==='down'?'slow':'unknown';
 if(key==='breath')return dir==='up'?'fast':dir==='down'?'slow':'unknown';
 if(key==='hrv'){
  const a=valid(d.value)&&valid(d.base)&&d.base>0?d.value/d.base:null;
  const b=valid(d.other)&&valid(d.otherBase)&&d.otherBase>0?d.other/d.otherBase:null;
  return a!==null&&b!==null&&a>=.95&&b>=.95?'conflict':a!==null&&a<.7&&b!==null&&b<.7?'both-low':'unknown';
 }
 if(key==='sleep')return valid(d.value)&&valid(d.base)&&d.base>0&&d.value<d.base?'short':'unknown';
 if(key==='energy')return dir==='down'?'low':'unknown';
 if(key==='recovery')return dir==='down'?'slow':'unknown';
 if(key==='cardio')return valid(sc.breath)&&sc.breath<20&&valid(sc.heart)&&sc.heart<20?'double':'single';
 if(key==='activityRecovery')return valid(sc.energy)&&sc.energy<60&&valid(sc.sleep)&&sc.sleep<80?'sleep-linked':'generic';
 if(key==='calm')return valid(sc.breath)&&sc.breath<60?'breathing':'general';
 return 'general';
}
// Each clinical domain has a distinct first action. These are observational steps, not diagnoses.
const FIRST_STEP_137={
 cardio:{double:["先讓牠停止活動，核對安靜時心跳與呼吸是否仍一起異常","先让它停止活动，核对安静时心跳与呼吸是否仍一起异常","Stop activity and check whether resting pulse and breathing are both still abnormal","運動を止め、安静時の心拍と呼吸が同時に異常か確認","활동을 멈추고 휴식 중 심박·호흡이 함께 이상한지 확인"],single:["先核對最低的心肺分項，並重新量安靜時心跳、呼吸","先核对最低的心肺分项，并复测安静时心跳、呼吸","Review the lowest cardio component and recheck resting pulse and breaths","最も低い心肺項目を確認し、安静時の心拍・呼吸を再測定","가장 낮은 심폐 항목과 안정 시 심박·호흡을 다시 확인"]},
 heart:{fast:["先讓牠安靜休息，重新確認心跳是否仍明顯過快","先让它安静休息，再确认心跳是否仍明显过快","Keep your pet at rest and check if the pulse is still unusually fast","安静にし、心拍が速いままか再確認","편히 쉬게 한 뒤 심박이 여전히 빠른지 확인"],slow:["立刻確認牠的反應與心跳，排除測量接觸不良","立即检查反应和心跳，并排除接触不良","Check responsiveness and slow pulse; rule out poor sensor contact","反応と遅い心拍を確認し、センサーの接触不良を除外","반응과 느린 심박을 확인하고 센서 접촉 불량을 점검"],unknown:["在安靜狀態重新量心跳，確認讀數方向與佩戴品質","在安静状态重测心跳，确认变化方向和佩戴质量","Recheck resting pulse, direction of change and collar contact","安静時に心拍を再測定し、変化の方向と装着を確認","안정 시 심박을 다시 재고 변화 방향과 착용을 확인"]},
 breath:{fast:["立刻觀察胸腹起伏、是否張口喘氣及呼吸是否費力","立即观察胸腹起伏、是否张口喘气、呼吸是否费力","Check chest movement, open-mouth panting and effort to breathe now","胸腹の動き、口呼吸、苦しそうな呼吸がないか今確認","가슴 움직임·입벌림 호흡·숨쉬기 힘든지 즉시 확인"],slow:["立刻確認牠是否能平穩呼吸、有沒有明顯停頓","立即确认能否平稳呼吸，有没有明显停顿","Check whether breathing is regular and whether there are real pauses","呼吸が規則的か、明らかな停止がないか今確認","호흡이 규칙적인지 멈춤이 있는지 즉시 확인"],unknown:["觀察實際胸腹起伏，核對呼吸波形是否受項圈位置影響","观察实际胸腹起伏，核对呼吸波形是否受项圈位置影响","Observe real breathing effort and check collar contact","実際の胸腹の動きと装着位置を確認","실제 가슴 움직임과 목걸이 위치를 확인"]},
 hrv:{'both-low':["先在安靜、訊號穩定時重測心跳間隔，再核對當天心跳與呼吸","先在安静、信号稳定时复测心跳间隔，再核对当天心跳与呼吸","Repeat beat-interval measurement at rest; compare pulse and breathing","静かな環境で心拍間隔を再測定し、心拍と呼吸も確認","안정된 상태에서 HRV를 다시 측정하고 심박·호흡을 확인"],conflict:["這個低分與兩項HRV原始讀數不一致，先核對資料來源與算法","这个低分与两项HRV原始读数不一致，先核对数据来源和算法","HRV score conflicts with both source values; check scoring inputs first","低得点と元の2指標が一致しません。計算元を先に確認","낮은 점수가 두 원시 지표와 맞지 않아 계산 근거부터 확인"],unknown:["先檢查項圈訊號，再在相同休息條件下重新測量HRV","先检查项圈信号，再在相同休息条件下重新测量HRV","Check the signal and retest HRV under matching resting conditions","装着状態を確認し、同じ休息条件でHRVを再測定","착용 신호를 확인하고 같은 휴식 조건에서 HRV 재측정"]},
 stable:{general:["先確認波形品質與實際心跳是否規律，留意有沒有突然虛弱","先确认波形质量和实际心跳是否规律，留意是否突然无力","Verify waveform quality and pulse rhythm; check for sudden weakness","波形と実際の拍動を確認し、急な脱力がないか見る","파형과 실제 맥박을 확인하고 갑자기 힘이 빠지는지 살펴보기"]},
 sleep:{short:["先查當晚休息被打斷的原因，再對照同夜心跳與呼吸","先检查当晚休息被打断的原因，再对照同夜心跳与呼吸","Check why rest was disrupted; compare pulse and breaths from that night","休息が途切れた理由と同じ夜の心拍・呼吸を確認","잠이 끊긴 이유와 같은 밤 심박·호흡을 함께 확인"],unknown:["核對夜間有效休息、噪音、疼痛與呼吸變化","核对夜间有效休息、噪音、疼痛和呼吸变化","Review valid rest, noise, possible pain and night breathing","有効な休息、騒音、痛み、夜間の呼吸を確認","실제 수면·소음·통증·야간 호흡 변화 확인"]},
 activityRecovery:{'sleep-linked':["先看精力與恢復哪一項拉低總分，再對照前一晚睡眠","先看精力与恢复哪项拉低总分，再对照前一晚睡眠","Check which energy/recovery subscore fell and compare the preceding night","活力・回復のどちらが低いか確認し、前夜の睡眠と比べる","활력·회복 중 낮은 항목을 보고 전날 밤 수면과 비교"],generic:["先分開核對活動量、運動後恢復及休息狀態","先分别核对活动量、运动后恢复和休息状态","Check activity, recovery after exercise and rest separately","活動量・運動後回復・休息を別々に確認","활동량·운동 후 회복·휴식을 각각 확인"]},
 energy:{low:["先確認有沒有突然走不動、食慾改變，再檢查前一晚睡眠","先确认是否突然走不动、食欲改变，再检查前一晚睡眠","Check for sudden weakness or appetite change, then review the previous night","急な脱力や食欲変化と、前夜の睡眠を確認","갑작스러운 무력감·식욕 변화와 전날 수면 확인"],unknown:["核對實際活動量與步態，再看同日睡眠記錄","核对实际活动量和步态，再看同日睡眠记录","Review measured activity and gait, then compare sleep","活動量と歩き方を確認し、睡眠記録と比較","실제 활동량·걸음걸이와 수면 기록 확인"]},
 recovery:{slow:["先減少劇烈運動，核對相似活動後兩分鐘心跳下降速度","先减少剧烈运动，核对相似活动后两分钟心跳下降速度","Reduce exertion; compare 2-minute pulse recovery after similar activity","激しい運動を控え、同程度の運動後2分の心拍回復を比較","격한 운동을 줄이고 비슷한 운동 후 2분 심박 회복 비교"],unknown:["核對這次運動強度與量測時機，再比較兩分鐘恢復","核对这次运动强度与测量时机，再比较两分钟恢复","Check exertion and measurement timing before judging recovery","運動強度と測定時間を確認して回復を比較","운동 강도와 측정 시점을 확인한 뒤 회복 비교"]},
 calm:{breathing:["先讓牠在安靜處休息，確認是否喘氣、疼痛或持續不安","先让它在安静处休息，确认是否喘气、疼痛或持续不安","Provide quiet rest; check panting, pain and persistent agitation","静かな場所で休ませ、荒い呼吸・痛み・落ち着かなさを確認","조용히 쉬게 하고 헐떡임·통증·불안이 계속되는지 확인"],general:["檢查環境刺激、疼痛及佩戴是否干擾，再核對心跳與呼吸","检查环境刺激、疼痛和项圈是否干扰，再核对心跳与呼吸","Check disturbance, pain, collar fit, pulse and breathing","騒音・痛み・装着状態と心拍・呼吸を確認","소음·통증·목걸이 착용·심박·호흡 확인"]}
};
// Domain-specific consequences replace the formerly shared, copy-pasted emergency tail.
// Severe words describe the urgency of *checking*, not a diagnosis inferred from a score.
const FOLLOW_UP_137={
 cardio:[
  ["若安靜時兩項仍嚴重異常，立刻聯絡獸醫；喘不過氣或反應差直接急診。","安静时两项仍严重异常就立即联系兽医；喘不过气或反应差直接急诊。","If both stay severe at rest, contact a vet now; difficult breathing or poor response needs ER.","安静時も両方重い異常なら直ちに獣医へ。呼吸困難・反応低下は救急。","쉬어도 둘 다 심하게 이상하면 즉시 진료. 호흡곤란·반응 저하는 응급실."],
  ["若休息後仍多項異常，今天請獸醫評估；喘得費力直接急診。","休息后仍多项异常，今天请兽医评估；呼吸费力直接急诊。","If several remain abnormal after rest, see a vet today; laboured breathing means ER.","休息後も複数異常なら今日獣医へ。苦しい呼吸は救急。","쉰 뒤에도 여러 수치가 이상하면 오늘 진료. 숨쉬기 힘들면 응급실."]],
 heart:[
  ["若心跳持續明顯異常或突然站不穩，立刻就醫；昏倒直接急診。","心跳持续明显异常或突然站不稳，立即就医；昏倒直接急诊。","If pulse stays extreme or your pet becomes unsteady, seek care now; fainting means ER.","心拍異常が続く・ふらつくなら直ちに受診。失神は救急。","심박 이상이 계속되거나 휘청이면 즉시 진료. 실신은 응급실."],
  ["安靜後心跳仍反覆異常，今天聯絡獸醫；突然虛弱則立即就醫。","休息后心跳反复异常，今天联系兽医；突然无力立即就医。","Repeated abnormal resting pulse needs a vet today; sudden weakness needs urgent care.","休息時の心拍異常が続けば今日獣医へ。急な脱力は直ちに受診。","안정 심박 이상이 반복되면 오늘 상담. 갑자기 무력하면 즉시 진료."]],
 breath:[
  ["若呼吸費力、張口喘不停或牙齦發藍，直接急診；持續異常也應立即就醫。","呼吸费力、张口喘不停或牙龈发蓝直接急诊；持续异常也应立即就医。","Laboured/open-mouth breathing or blue gums means ER; ongoing abnormal breaths need urgent care.","呼吸困難・口呼吸・青い歯ぐきは救急。異常が続く場合も直ちに受診。","숨쉬기 힘들거나 입벌림 호흡·푸른 잇몸이면 응급실. 지속 이상도 즉시 진료."],
  ["若安靜時仍持續呼吸急促或不規則，今天就醫評估；費力呼吸直接急診。","安静时仍持续呼吸急促或不规则，今天就医评估；呼吸费力直接急诊。","Persistent abnormal resting breathing needs a vet today; laboured breathing means ER.","安静時も呼吸異常が続けば今日獣医へ。苦しい呼吸は救急。","휴식 중 호흡 이상이 계속되면 오늘 진료. 호흡곤란은 응급실."]],
 hrv:[
  ["這不代表心臟衰竭；若同時明顯無力、心跳或呼吸異常，立即請獸醫評估。","这不代表心力衰竭；若同时明显无力、心跳或呼吸异常，立即请兽医评估。","This does not diagnose heart failure; weakness or abnormal pulse/breaths alongside it needs prompt vet review.","心不全の診断ではありません。脱力や心拍・呼吸の異常もあれば早急に獣医へ。","심부전 진단은 아닙니다. 무력감·심박·호흡 이상이 동반되면 즉시 상담."],
  ["若多次重測仍低、又有精神變差，今天向獸醫確認；單靠HRV不可診斷。","多次复测仍低且精神变差，今天咨询兽医；不能仅凭HRV诊断。","If repeat HRV stays low and energy worsens, ask a vet today; HRV alone is not a diagnosis.","再測定でも低く元気もなければ今日獣医へ。HRVだけで診断しません。","재측정에도 낮고 기력이 떨어지면 오늘 상담. HRV만으로 진단하지 않습니다."]],
 stable:[
  ["若昏倒、突發無力或實際心跳明顯亂跳，立即就醫；這個分數本身不能確診心律不整。","昏倒、突然无力或心跳明显乱跳时立即就医；分数本身不能确诊心律失常。","Fainting, sudden weakness or truly irregular pulse needs urgent care; this score cannot diagnose arrhythmia.","失神・急な脱力・明らかな不整拍動なら直ちに受診。点数だけでは診断できません。","실신·갑작스런 무력·실제 불규칙 심박이면 즉시 진료. 점수만으로 확진 불가."],
  ["若反覆出現或伴虛弱，今天請獸醫評估心跳；先排除波形干擾。","反复出现或伴无力，今天请兽医评估心跳；先排除波形干扰。","If recurrent or paired with weakness, have a vet check the pulse today; rule out noisy signal.","繰り返す・脱力があれば今日獣医へ。波形の乱れを先に除外。","반복되거나 무력하면 오늘 진료. 먼저 파형 오류를 제외."]],
 sleep:[
  ["若睡覺時明顯喘不過氣或難以喚醒，直接急診；嚴重休息不足持續則今天請獸醫檢查。","睡觉时明显喘不过气或难以唤醒，直接急诊；严重休息不足持续则今天请兽医检查。","Breathing distress or difficulty waking needs ER; persistent major sleep loss needs a vet today.","睡眠中の呼吸困難・起こせない場合は救急。強い睡眠不足が続くなら今日獣医へ。","수면 중 호흡곤란·깨우기 어려움은 응급실. 심한 수면 부족이 지속되면 오늘 진료."],
  ["若多夜睡不好或精神持續下降，安排獸醫評估；先排除噪音、疼痛和夜間呼吸問題。","多夜睡不好或精神持续下降，安排兽医评估；先检查噪音、疼痛和夜间呼吸。","Repeated poor nights or falling energy warrants a vet review; check noise, pain and night breathing.","眠れない夜が続く・元気が落ちるなら獣医へ。騒音・痛み・夜間呼吸を確認。","여러 밤 잠을 못 자거나 기력이 떨어지면 진료. 소음·통증·야간 호흡 확인."]],
 activityRecovery:[
  ["若突然站不穩或反應變差，直接急診；其他情況先確認哪個子項最差並聯絡獸醫。","突然站不稳或反应变差直接急诊；其他情况先确认最差子项并联系兽医。","Sudden inability to stand or reduced response means ER; otherwise review the worst component with a vet.","急に立てない・反応低下は救急。それ以外は最も低い項目を獣医と確認。","갑자기 못 서거나 반응 저하는 응급실. 그 외에는 가장 낮은 항목을 수의사와 확인."],
  ["如無力持續或恢復越來越慢，今天請獸醫評估；避免再做高強度活動。","无力持续或恢复越来越慢，今天请兽医评估；避免高强度活动。","Ongoing weakness or slower recovery needs a vet today; avoid heavy exercise.","脱力が続く・回復が遅くなるなら今日獣医へ。激しい活動は控える。","무력감 지속·회복 악화 시 오늘 진료. 격한 활동은 피하기."]],
 energy:[
  ["若突然無法站立或反應不清，直接急診；明顯沒精神且持續，立即聯絡獸醫。","突然站不起来或反应不清直接急诊；明显没精神且持续，立即联系兽医。","Unable to stand or barely responding means ER; persistent profound fatigue needs urgent vet care.","急に立てない・反応が鈍いなら救急。強い元気低下が続けば直ちに獣医へ。","못 서거나 반응이 둔하면 응급실. 심한 무기력 지속 시 즉시 진료."],
  ["若食慾、步態也變差，今天請獸醫評估；先讓牠充分休息。","食欲、步态也变差，今天请兽医评估；先让它充分休息。","If appetite or walking also worsens, seek a vet review today; allow rest.","食欲や歩行も悪ければ今日獣医へ。まず休息を。","식욕·보행도 나빠지면 오늘 진료. 충분히 쉬게 하기."]],
 recovery:[
  ["若活動後一直無法恢復、虛弱或呼吸不順，立即就醫；先停止運動。","运动后一直无法恢复、无力或呼吸不顺立即就医；先停止运动。","Failure to recover after exercise, weakness or breathing trouble needs urgent care; stop exercise.","運動後も回復せず、脱力・呼吸異常があれば直ちに受診。運動中止。","운동 뒤 회복이 안 되거나 무력·호흡 문제가 있으면 즉시 진료. 운동 중단."],
  ["若同等活動後多次恢復偏慢，今天向獸醫確認；不要只歸因於年齡。","同等活动后多次恢复偏慢，今天咨询兽医；不要只归因于年龄。","Repeated slow recovery after comparable exercise merits vet advice; do not blame age alone.","同程度の運動後も回復が遅ければ今日獣医へ。年齢だけのせいにしない。","비슷한 운동 후 반복적으로 회복이 느리면 오늘 상담. 나이 탓만 하지 말기."]],
 calm:[
  ["若休息時一直喘、看起來很痛或反應變差，立即就醫；先排除環境刺激。","休息时一直喘、明显疼痛或反应变差立即就医；先排除环境刺激。","Ongoing panting at rest, severe pain or reduced response warrants urgent care; reduce disturbances.","安静時の荒い呼吸・強い痛み・反応低下は直ちに受診。刺激を減らす。","쉬어도 헐떡임·심한 통증·반응 저하가 있으면 즉시 진료. 자극 줄이기."],
  ["若安靜環境中仍無法平復或伴疼痛，今天請獸醫評估。","安静环境中仍无法平静或伴疼痛，今天请兽医评估。","If still agitated in a calm place or visibly painful, call a vet today.","静かな環境でも落ち着かない・痛そうなら今日獣医へ。","조용한 곳에서도 진정하지 못하거나 아파 보이면 오늘 진료."]]
};
// Every high-risk sub-band changes the response urgency, not merely the label.
const HIGH_BAND_ACT_137=[
 ["現在就確認牠是否能正常呼吸和站立","现在立即确认能否正常呼吸和站立","Check breathing and ability to stand right now","呼吸と起立の状態を今すぐ確認","지금 호흡과 서 있을 수 있는지 확인"],
 ["不要只等待下一筆資料，立即核對目前狀態","不要只等下一次测量，立即核对当前状态","Do not wait for another reading: check your pet now","次の測定を待たず、今の様子を確認","다음 측정을 기다리지 말고 지금 상태 확인"],
 ["今天優先安排獸醫評估","今天优先安排兽医评估","Arrange a vet assessment today","今日中に獣医の診察を優先","오늘 수의사 진료를 우선 예약"],
 ["先在休息時重新確認；若仍異常，今天找獸醫","先在休息时重新确认；仍异常今天找兽医","Recheck at rest; contact a vet today if still unusual","休息時に再確認し、続けば今日獣医へ","휴식 중 재확인하고 지속되면 오늘 진료 상담"],
 ["現在比較連續兩次有效量測，確認是否一直偏離","现在对比两次有效测量，确认是否持续偏离","Compare two valid readings to see if the change persists","有効な測定2回を比較し、変化が続くか確認","유효 측정 2회를 비교해 변화 지속 여부 확인"],
 ["記錄這次異常，短時間內再測；反覆出現再請獸醫評估","记录本次异常，短时间内复测；反复出现请兽医评估","Record this event and recheck soon; ask a vet if it recurs","今回の変化を記録し、近日再測。反復なら獣医へ","이번 변화를 기록하고 곧 재측정. 반복되면 진료 상담"]
];
const COMPACT_STEP_137={
 cardio:["複查安靜時心跳和呼吸","复查安静时心跳和呼吸","recheck resting pulse and breaths","安静時の心拍・呼吸を再確認","안정 심박·호흡 재확인"],
 heart:["核對心跳方向和精神反應","核对心跳方向和精神反应","check pulse direction and alertness","心拍の変化と反応を確認","심박 변화·반응 확인"],
 breath:["觀察呼吸是否費力或停頓","观察呼吸是否费力或停顿","check breathing effort and pauses","呼吸の苦しさ・停止を確認","호흡곤란·멈춤 확인"],
 hrv:["先核對訊號並在安靜時重測","先核对信号并在安静时复测","verify signal and retest at rest","信号を確認し安静時に再測定","신호 확인 후 휴식 중 재측정"],
 stable:["核對波形及有無虛弱、暈倒","核对波形及有无虚弱、昏倒","check waveform, weakness or fainting","波形・脱力・失神を確認","파형·무력·실신 확인"],
 sleep:["查看休息中斷、夜間呼吸與疼痛","查看休息中断、夜间呼吸和疼痛","check interruptions, night breaths and pain","睡眠中断・夜間呼吸・痛みを確認","수면 중단·야간 호흡·통증 확인"],
 activityRecovery:["查精力、恢復與前夜睡眠","查精力、恢复和前夜睡眠","review energy, recovery and prior sleep","活力・回復・前夜の睡眠を確認","활력·회복·전날 수면 확인"],
 energy:["查看是否無力、食慾差及睡眠不足","查看是否无力、食欲差及睡眠不足","check weakness, appetite and sleep","脱力・食欲・睡眠を確認","무력감·식욕·수면 확인"],
 recovery:["減少運動並比較兩分鐘心跳回落","减少运动并比较两分钟心跳回落","reduce exertion and compare 2-min recovery","運動を控え2分後の回復を比較","활동 줄이고 2분 회복 비교"],
 calm:["安靜休息，檢查疼痛和呼吸","安静休息，检查疼痛和呼吸","rest quietly; check pain and breaths","静かに休ませ痛みと呼吸を確認","조용히 쉬고 통증·호흡 확인"]
};
const COMPACT_ALERT_137={
 cardio:["持續雙重異常立即就醫","持续双重异常立即就医","both remain abnormal: urgent vet","両方続けば直ちに受診","둘 다 지속되면 즉시 진료"],
 heart:["昏倒直接急診","昏倒直接急诊","fainting: ER now","失神は救急","실신은 응급실"],
 breath:["呼吸困難直接急診","呼吸困难直接急诊","laboured breathing: ER","呼吸困難は救急","호흡곤란은 응급실"],
 hrv:["合併呼吸異常立即問獸醫","合并呼吸异常立即咨询兽医","breathing change too: urgent vet","呼吸異常もあればすぐ獣医へ","호흡 이상 동반 시 즉시 진료"],
 stable:["虛脫或真實亂跳立即就醫","虚脱或心跳确实紊乱立即就医","collapse/irregular pulse: urgent care","虚脱・拍動の乱れは受診","쓰러짐·불규칙 맥박이면 즉시 진료"],
 sleep:["夜間喘不過氣立即急診","夜间喘不过气立即急诊","night breathing distress: ER","夜間の呼吸困難は救急","야간 호흡곤란은 응급실"],
 activityRecovery:["無法站立直接急診","无法站立直接急诊","unable to stand: ER","立てないなら救急","서지 못하면 응급실"],
 energy:["突然無力站不穩立即就醫","突然无力站不稳立即就医","sudden weakness: urgent care","急な脱力はすぐ受診","갑작스런 무력은 즉시 진료"],
 recovery:["仍虛弱或喘不順請立即就醫","仍虚弱或喘不顺请立即就医","weakness/breathing trouble: urgent care","脱力・呼吸異常なら受診","무력·호흡 이상 시 즉시 진료"],
 calm:["持續喘氣或劇痛立即就醫","持续喘气或剧痛立即就医","ongoing panting/severe pain: urgent care","荒い呼吸・激痛なら受診","지속적 헐떡임·심한 통증 시 즉시 진료"]
};
const PERIOD_FIRST_137={
 cardio:["回看最差那天是哪幾項心肺指標同時異常","回看最差那天哪些心肺指标同时异常","review which cardio readings fell together on the worst day","最低日の心肺指標で何が同時に変化したか確認","가장 나쁜 날 어떤 심폐 수치가 함께 변했는지 확인"],
 heart:["核對低分日心跳是太快還是太慢","核对低分日心跳是太快还是太慢","check whether low-score days had fast or slow pulse","低得点日の心拍が速いか遅いか確認","저점 날 심박이 빨랐는지 느렸는지 확인"],
 breath:["查看那些天安靜時是否反覆呼吸急促或停頓","查看那些天休息时是否反复呼吸急促或停顿","review repeated rapid breaths or pauses on those days","該当日の安静時呼吸が速すぎる・止まるか確認","그 날 휴식 중 빠른 호흡·멈춤 반복 확인"],
 hrv:["比對低分日的HRV與當時休息、訊號品質","对比低分日HRV与当时休息、信号质量","compare HRV lows with rest conditions and signal quality","HRV低得点日と休息条件・信号品質を比較","HRV 저점 날 휴식 조건·신호 품질 비교"],
 stable:["回查低分日的波形與心跳節奏是否可靠","回查低分日波形和心跳节奏是否可靠","review waveform reliability on low-score days","低得点日の波形と拍動を確認","저점 날 파형·박동 신뢰도 확인"],
 sleep:["對照休息最差的夜晚是否頻繁中斷、呼吸也異常","对照休息最差的夜晚是否频繁中断、呼吸也异常","review disruptions and breathing on the worst nights","休息が最も悪い夜の中断・呼吸を確認","수면이 가장 나쁜 밤의 중단·호흡 확인"],
 activityRecovery:["找出哪些天精力、恢復與前晚睡眠同時變差","找出哪些天精力、恢复和前晚睡眠同时变差","identify days when energy, recovery and prior sleep fell together","活力・回復と前夜の睡眠が共に悪い日を確認","활력·회복·전날 밤 수면이 함께 나빠진 날 확인"],
 energy:["對照精力最差的幾天，前一晚是否休息不足","对照精力最差的几天，前一晚是否休息不足","compare energy lows with the preceding nights","活力が最も低い日の前夜の睡眠を確認","활력이 낮은 날의 전날 수면 확인"],
 recovery:["比較恢復最慢那幾天的活動強度是否相近","比较恢复最慢那几天的活动强度是否相近","compare exercise intensity on slow-recovery days","回復が遅い日の運動強度を比較","회복이 느린 날 활동 강도 비교"],
 calm:["查找不安定的幾天是否有環境刺激、疼痛或呼吸改變","查找不平静的几天是否有环境刺激、疼痛或呼吸变化","check disturbance, pain or breathing on low-calmness days","落ち着きがない日の環境・痛み・呼吸を確認","불안한 날 소음·통증·호흡 확인"]
};
const PERIOD_FOLLOW_137={
 cardio:["若今天安靜時心跳與呼吸仍一起異常，立即就醫；喘得費力直接急診。","若今天安静时心跳与呼吸仍一起异常，立即就医；呼吸费力直接急诊。","If both resting pulse and breaths remain abnormal today, seek urgent care; laboured breathing means ER.","今日も安静時に心拍・呼吸が共に異常なら直ちに受診。呼吸困難は救急。","오늘도 안정 심박·호흡이 함께 이상하면 즉시 진료. 호흡곤란은 응급실."],
 heart:["若今天心跳仍異常，請獸醫確認；若突然昏倒，直接急診。","若今天心跳仍异常，请兽医确认；突然昏倒直接急诊。","If today's resting pulse is still abnormal, ask a vet; fainting means ER.","今日も心拍異常が続けば獣医へ。失神は救急。","오늘도 안정 심박 이상이면 진료 상담. 실신은 응급실."],
 breath:["若今天仍持續呼吸急促或緩慢，聯絡獸醫；呼吸費力直接急診。","若今天仍持续呼吸急促或缓慢，联系兽医；呼吸费力直接急诊。","If resting breaths remain unusually fast or slow, call a vet; breathing distress means ER.","今日も呼吸が速い・遅いままなら獣医へ。苦しい呼吸は救急。","오늘도 호흡이 너무 빠르거나 느리면 진료 상담. 호흡곤란은 응급실."],
 hrv:["若今天HRV仍很低，先核對訊號；同時心肺異常則請獸醫評估。","若今天HRV仍很低，先核对信号；同时心肺异常则请兽医评估。","If today's HRV is still low, verify the signal; seek a vet if pulse or breaths are also abnormal.","今日もHRVが低ければ信号を確認。心肺にも異常があれば獣医へ。","오늘도 HRV가 낮으면 신호 확인. 심폐 이상도 있으면 진료 상담."],
 stable:["若今天仍出現不規則心跳或明顯無力，請獸醫評估。","若今天仍出现心跳不规则或明显无力，请兽医评估。","If irregular pulse or weakness is present today, ask a vet to assess it.","今日も不規則な心拍・強い脱力があるなら獣医へ。","오늘도 불규칙 맥박·무력감이 있으면 진료 상담."],
 sleep:["今晚繼續觀察睡眠中斷與呼吸；若睡著時喘不過氣，直接急診。","今晚继续观察睡眠中断和呼吸；睡着时呼吸困难直接急诊。","Watch interruptions and breathing tonight; breathing distress during sleep means ER.","今夜も中断と呼吸を確認。就寝中の呼吸困難は救急。","오늘 밤 수면 중단·호흡 확인. 자는 중 호흡곤란이면 응급실."],
 activityRecovery:["若今天仍明顯無力，請獸醫評估；無法站立直接急診。","若今天仍明显无力，请兽医评估；无法站立直接急诊。","If weakness is still marked today, see a vet; inability to stand means ER.","今日も強い脱力なら獣医へ。立てなければ救急。","오늘도 무력감이 심하면 진료. 서지 못하면 응급실."],
 energy:["若今天活動量仍大降且反應差，請獸醫評估；站不穩直接就醫。","若今天活动量仍大降且反应差，请兽医评估；站不稳直接就医。","If activity is still very low with poor response, seek care; unsteadiness needs prompt attention.","今日も活動が少なく反応が悪い場合は獣医へ。ふらつくなら早急に受診。","오늘도 활동·반응 저하가 심하면 진료. 휘청이면 즉시 진료."],
 recovery:["若今天同等活動後心跳仍恢復慢，減輕活動並請獸醫核對。","若今天同等活动后心跳仍恢复慢，减少活动并请兽医核对。","If today's recovery is still slow after similar activity, reduce exertion and ask a vet.","今日も同程度の運動後に回復が遅ければ活動を減らして獣医へ。","오늘도 비슷한 활동 후 회복이 느리면 활동 줄이고 진료 상담."],
 calm:["若今天休息仍持續喘氣、疼痛或不安，請獸醫評估。","若今天休息仍持续喘气、疼痛或不安，请兽医评估。","If panting, pain or agitation persist at rest today, ask a vet.","今日も休息時に荒い呼吸・痛み・不安が続けば獣医へ。","오늘도 쉬는데 헐떡임·통증·불안이 지속되면 진료 상담."]
};
const ESCALATION_137=[
 ["若當下仍嚴重異常，立即請獸醫處理；呼吸困難、昏倒或牙齦發藍，直接急診。","当下仍严重异常就立即就医；呼吸困难、昏倒或牙龈发蓝直接急诊。","If the problem is ongoing, get urgent vet care. Breathing distress, collapse or blue gums: ER now.","今も重い異常なら直ちに受診。呼吸困難・失神・青い歯ぐきは救急。","지금도 심각하면 즉시 진료. 호흡곤란·실신·푸른 잇몸은 응급실."],
 ["若休息後仍明顯異常，立即聯絡獸醫；出現虛脫或喘不過氣，直接急診。","休息后仍明显异常立即联系兽医；虚脱或喘不过气直接急诊。","If still abnormal after rest, call a vet now; collapse or laboured breathing means ER.","休息後も異常ならすぐ獣医へ。虚脱・呼吸困難は救急。","쉬어도 이상하면 바로 수의사에게 연락. 쓰러지거나 숨쉬기 힘들면 응급실."],
 ["請今天安排獸醫評估；如果精神突然變差或呼吸費力，立即急診。","请今天安排兽医评估；若精神突然变差或呼吸费力立即急诊。","Arrange a vet assessment today; sudden deterioration or difficult breathing needs urgent care.","今日中に獣医へ。急な元気低下・呼吸困難は救急。","오늘 수의사 상담. 갑자기 나빠지거나 숨쉬기 힘들면 응급진료."],
 ["安靜時仍明顯異常或短時間反覆出現，今天請獸醫評估。","安静时仍明显异常或短时间反复出现，今天请兽医评估。","If it persists at rest or recurs soon, consult a vet today.","安静時にも続く・短時間に繰り返す場合は今日獣医へ。","휴식 중 지속되거나 곧 반복되면 오늘 수의사 상담."],
 ["優先確認近期是否多次異常，今天聯絡獸醫討論下一步。","优先确认近期是否多次异常，今天联系兽医讨论下一步。","Check whether the change repeats and talk to a vet today.","繰り返すか確認し、今日獣医に相談。","반복 여부를 확인하고 오늘 수의사와 상담."],
 ["在相近條件下再測一次；仍偏離就安排獸醫評估。","在相近条件下复测；仍偏离就安排兽医评估。","Repeat under comparable conditions; arrange a vet review if still changed.","同条件で再測定し、続くなら獣医へ。","비슷한 조건에서 재측정하고 지속되면 진료 상담."],
 ["接近高風險，接下來兩天密切比對；若變差聯絡獸醫。","接近高风险，未来两天密切比对；若变差联系兽医。","Near high risk: monitor closely over the next two days; call a vet if worse.","高リスクに近いため今後2日注意。悪化時は獣医へ。","고위험에 가까워 이틀간 주의. 악화 시 수의사 상담."],
 ["明顯偏離，先排除干擾並比對下次有效量測。","明显偏离，先排除干扰并对比下次有效测量。","Noticeable change: rule out signal issues and compare the next valid reading.","明らかな変化。測定の乱れを除き、次の有効値と比較。","뚜렷한 변화. 신호 문제를 제외하고 다음 유효 측정과 비교."],
 ["先留意是否持續兩三天；若變差，請獸醫評估。","先观察是否持续两三天；若变差，请兽医评估。","Watch for persistence over a few days; ask a vet if it worsens.","数日続くか確認し、悪化なら獣医へ。","며칠 지속되는지 관찰하고 악화 시 진료 상담."],
 ["目前屬中度變化，維持日常紀錄並留意新症狀。","目前属于中度变化，继续记录并留意新症状。","Moderate change: keep regular records and watch for new symptoms.","中程度の変化。記録を続け、新たな症状に注意。","중간 정도 변화. 평소 기록을 유지하고 새 증상 관찰."],
 ["接近中風險，下一次量測再核對相同項目。","接近中风险，下次测量再核对相同项目。","Near moderate risk: recheck this metric next time.","中リスクに近いため次回も同じ項目を確認。","중위험에 가까워 다음 측정에서 재확인."],
 ["輕度變化，維持正常作息並觀察趨勢。","轻度变化，维持正常作息并观察趋势。","Mild change: keep the usual routine and watch the trend.","軽い変化。普段の生活を保ち、推移を確認。","경미한 변화. 평소 생활 유지하며 추이 관찰."],
 ["只有輕微差異，下次量測時再比對即可。","只有轻微差异，下次测量时再对比即可。","Small change: compare it at the next measurement.","小さな差です。次回の測定で比較。","작은 차이. 다음 측정에서 비교."],
 ["狀況大致穩定，照平常作息即可。","状态大致稳定，保持日常作息即可。","Generally stable: keep the normal routine.","おおむね安定。普段どおりで大丈夫です。","대체로 안정적입니다. 평소대로 유지하세요."],
 ["狀況良好，繼續保持。","状态良好，继续保持。","Doing well: continue as usual.","良好です。そのまま続けましょう。","양호합니다. 계속 유지하세요."],
 ["目前接近平常最佳狀態。","目前接近平常最佳状态。","Near your pet's usual best.","普段の良い状態に近いです。","평소 좋은 상태에 가깝습니다."]
];
function gradedAction(key,score,days,source,compact=false){
 const m=root.DeepPetNarrative138?.compose({key,score,days,row:source,rows:arguments[5]||[source],datum,lang:state.lang,compact});
 if(m)return m.action;
 const ix=riskTier(score);
 if(ix<0)return L('量測不足，先確認項圈接觸及有效資料。','测量不足，先确认项圈接触和有效数据。','Insufficient readings; check collar contact and signal.','有効データ不足。装着状態を確認。','자료 부족. 목걸이와 신호 확인.');
 if(ix>=13)return L(`建議：${tr(ESCALATION_137[ix])}`,`建议：${tr(ESCALATION_137[ix])}`,`Next: ${tr(ESCALATION_137[ix])}`,`対応：${tr(ESCALATION_137[ix])}`,`조치: ${tr(ESCALATION_137[ix])}`);
 const profile=FIRST_STEP_137[key]||FIRST_STEP_137.cardio;
 const condition=actionContext137(key,source);
 const period=days>1;
 const specific=period?tr(PERIOD_FIRST_137[key]||PERIOD_FIRST_137.cardio):tr(profile[condition]||profile.general||Object.values(profile)[0]);
 if(period){
  const hist=ix<=1?L('這段期間曾出現極低分，','这段时间曾出现极低分，','Critically low days occurred; ','この期間に極端な低得点があり、','이 기간에 매우 낮은 점수가 있었으며 '):ix<=5?L('這段期間多次偏低，','这段时间多次偏低，','Low days occurred; ','この期間には低い日があり、','이 기간에 낮은 날이 있었으며 '):L('期間曾有偏離，','期间曾有偏离，','Some days changed; ','この期間に変化があり、','이 기간에 변화가 있었으며 ');
  const tail=tr(PERIOD_FOLLOW_137[key]||PERIOD_FOLLOW_137.cardio);
  const main=compact?`${hist}${specific}。`: `${hist}${specific}${join137()}${tail}`;
  return L(`建議：${main}`,`建议：${main}`,`Next: ${main}`,`対応：${main}`,`조치: ${main}`);
 }
 // Never state that low HRV or a proprietary rhythm proxy diagnoses cardiac failure.
 // The highest scores still get a forceful action only when paired with verified symptoms.
 const follow=FOLLOW_UP_137[key]||FOLLOW_UP_137.cardio;
 const suffix=ix===0?tr(follow[0]):ix===1?tr(follow[1]):tr(ESCALATION_137[ix]);
 const main=`${specific}${join137()}${suffix}`;
 return L(`建議：${main}`,`建议：${main}`,`Next: ${main}`,`対応：${main}`,`조치: ${main}`);
}

// Period guidance is about the DISTRIBUTION of recorded low days, not a
// worst-day diagnosis. The day calendar underneath is the drill-down surface.
function periodCopy(key,days,xs,average){
 const total=xs.length;
 const low=xs.filter(x=>x.scores[key]<80).length;
 const severe=xs.filter(x=>x.scores[key]<60).length;
 const mild=xs.filter(x=>x.scores[key]>=80&&x.scores[key]<90).length;
 const name=keyName(key);
 const period=L(days===7?'最近7天':'最近30天',days===7?'最近7天':'最近30天',days===7?'In the last 7 days':'In the last 30 days',days===7?'直近7日':'直近30日',days===7?'최근 7일':'최근 30일');
 const incomplete=total<Math.ceil(days*0.5);
 let reason;
 if(low===total){
  reason=L(`${period}有${total}天有效記錄，${name}每天都偏低${severe?`（其中${severe}天明顯偏低）`:''}，影響了期間整體評分。`,
   `${period}有${total}天有效记录，${name}每天都偏低${severe?`（其中${severe}天明显偏低）`:''}，影响了期间整体评分。`,
   `${period}, ${name} was low on all ${total} valid day(s)${severe?`, including ${severe} markedly low`:''}, affecting the period score.`,
   `${period}の有効記録${total}日すべてで${name}が低め${severe?`（うち${severe}日は大きく低下）`:''}で、期間の評価に影響しました。`,
   `${period} 동안 기록이 유효한 ${total}일 모두 ${name} 점수가 낮아 기간 평가에 영향을 주었습니다.`);
 }else if(low){
  reason=L(`${period}有${total}天有效記錄，其中${low}天${name}分數偏低${severe?`（${severe}天明顯偏低）`:''}，拉低了期間評分。`,
   `${period}有${total}天有效记录，其中${low}天${name}分数偏低${severe?`（${severe}天明显偏低）`:''}，拉低了期间评分。`,
   `${period}, ${name} was low on ${low} of ${total} valid days${severe?` (${severe} markedly low)`:''}, lowering the period score.`,
   `${period}の有効記録${total}日のうち${low}日で${name}が低め${severe?`（特に低い日${severe}日）`:''}で、期間の評価を下げました。`,
   `${period} 유효한 ${total}일 중 ${low}일 ${name} 점수가 낮아 기간 평가에 영향을 주었습니다.`);
 }else if(mild){
  reason=L(`${period}有${total}天有效記錄，${name}整體大致平穩，${mild}天有輕微變化。`,
   `${period}有${total}天有效记录，${name}整体大致平稳，${mild}天有轻微变化。`,
   `${period}, ${name} was generally steady over ${total} valid days, with ${mild} mildly changed day(s).`,
   `${period}の有効記録${total}日では${name}は概ね安定、${mild}日に軽い変化がありました。`,
   `${period} 유효한 ${total}일 중 ${name}는 대체로 안정적이며 ${mild}일 가벼운 변화가 있었습니다.`);
 }else{
  reason=L(`${period}有${total}天有效記錄，${name}整體穩定，沒有明顯低分日。`,
   `${period}有${total}天有效记录，${name}整体稳定，没有明显低分日。`,
   `${period}, ${name} was steady across ${total} valid days, with no clearly low-scored days.`,
   `${period}の有効記録${total}日は${name}が安定しており、大きく低い日はありません。`,
   `${period} 유효한 ${total}일에서 ${name}는 안정적이며 뚜렷한 저점은 없었습니다.`);
 }
 const caveat=incomplete?L('有效記錄較少，暫不代表整段期間的完整情況。',
  '有效记录较少，暂不代表整段期间的完整情况。',
  'Few days were recorded, so this may not represent the full period.',
  '記録日が少ないため、期間全体を代表するとは限りません。',
  '기록일이 적어 전체 기간을 대표하지 않을 수 있습니다。'):'';
 const action=(low||mild)?L('建議選擇分數較低的日期，查看當天情況。',
  '建议选择分数较低的日期，查看当天情况。',
  'Choose a lower-scoring date to review that day.',
  '点数が低い日を選び、その日の内容を確認してください。',
  '점수가 낮은 날짜를 선택해 해당 날짜를 확인하세요.'):
  L('可選擇日期，查看當天情況。','可选择日期，查看当天情况。',
   'Choose a date to review that day.',
   '日付を選んで、その日の詳細を確認できます。',
   '날짜를 선택해 자세히 볼 수 있습니다.');
 return {reason:[reason,caveat].filter(Boolean).join(' '),action,low,severe,total};
}
function desc(key,days=1,override=null){
 const rs=days===1&&override?rowsFor().filter(x=>x?.date===override):list(days);
 const xs=rs.filter(x=>valid(x?.scores?.[key])&&x.scores[key]>=0&&x.scores[key]<=100).sort((a,b)=>a.date.localeCompare(b.date));
 if(!xs.length)return {key,score:null,rows:[],lines:[L('尚無有效量測，無法評分。','暂无有效测量，无法评分。','No valid reading to score yet.','有効な測定がありません。','유효한 측정 자료가 없습니다.')],max:2,to:null};
 const score=days===1?xs.at(-1).scores[key]:Math.round(xs.reduce((a,b)=>a+b.scores[key],0)/xs.length);
 const worst=xs.reduce((a,b)=>a.scores[key]<=b.scores[key]?a:b),source=days===1?xs.at(-1):worst;
 const severe=xs.filter(x=>x.scores[key]<20).length,high=xs.filter(x=>x.scores[key]<60).length;
 const links=days===1?dayLink(key,source):periodLink(key,xs,days,score);
 if(days>1){
  const copy=periodCopy(key,days,xs,score);
  return {key,score,days,source,worst:worst.scores[key],sourceDate:source.date,
   high:copy.low,severe:copy.severe,rows:xs,
   lines:[level(score),copy.reason,copy.action],max:7,
   to:links?.to??null,link:links||null,periodSummary:true};
 }

 const isHealthy=score>=90;
 const lead=days===1?
  L(`${keyName(key)}${score}分｜${level(score)}。`,`${keyName(key)}${score}分｜${level(score)}。`,`${keyName(key)} ${score}/100 · ${level(score)}.`,`${keyName(key)}${score}点｜${level(score)}。`,`${keyName(key)} ${score}점｜${level(score)}.`):
  L(`${days}天有效${xs.length}天，均${score}分；${high}天高風險${severe?`，其中${severe}天極低`:''}，最低${worst.scores[key]}分。`,
  `${days}天有效${xs.length}天，均${score}分；${high}天高风险${severe?`，其中${severe}天极低`:''}，最低${worst.scores[key]}分。`,
  `${days}d (${xs.length} valid) avg ${score}; ${high} high-risk day(s)${severe?`, ${severe} critically low`:''}; worst ${worst.scores[key]}.`,
  `${days}日中${xs.length}日有効、平均${score}点。高リスク${high}日${severe?`・特に低い日${severe}日`:''}、最低${worst.scores[key]}点。`,
  `${days}일 중 유효 ${xs.length}일, 평균 ${score}점; 고위험 ${high}일${severe?`, 매우 낮음 ${severe}일`:''}; 최저 ${worst.scores[key]}점.`);
 const lines=[lead];
 if(isHealthy){if(days===1)lines.push(advice(key,score,1));return {key,score,days,rows:xs,lines,max:2,to:days>1&&links?.score<60?links.to:null,link:days>1&&links?.score<60?links:null};}
 // All subcards show both the actual reason and the action, not a risk label alone.
 // In 7/30-day views a dated worst-day example is NOT asserted to be today's state.
 const reason=key==='hrv'&&score===0?L(
  'HRV逐搏波形計算為極低分；仍有量測資料，請對照RMSSD、SDNN及佩戴狀態。',
  'HRV逐搏波形计算为极低分；仍有测量数据，请对照RMSSD、SDNN及佩戴状态。',
  'Beat-derived HRV score is extremely low; measurement exists. Compare RMSSD, SDNN, and fit.',
  '逐拍HRV推定値が非常に低いです。RMSSD、SDNNと装着状態を確認してください。',
  'HRV 점수가 매우 낮습니다. RMSSD, SDNN 및 착용 상태를 확인하세요.'):
  gradedCause(key,source,days>1?Math.min(score,worst.scores[key]):score,days,xs);
 const dated=days>1?L(`最低分當天（${source.date}）：`,`最低分当天（${source.date}）：`,`Worst day (${source.date}): `,`最低日（${source.date}）：`,`최저일(${source.date}): `):'';
 if(reason)lines.push(dated+reason);
 // Cross-domain note is supplemental and must not replace the metric's own cause.
 // Keep the navigate button separately below the 3 required lines.
 const action=gradedAction(key,days>1?Math.min(score,worst.scores[key]):score,days,source,false,xs);
 if(action)lines.push(action);
 return {key,score,days,source,high,severe,worst:worst.scores[key],sourceDate:source.date,rows:xs,lines,max:maxlines(score),to:links?.to??null,link:links||null};
}
function tightLead(d){
 if(d.days===1)return L(`${keyName(d.key)}${d.score}分｜${level(d.score)}`,`${keyName(d.key)}${d.score}分｜${level(d.score)}`,`${d.key==='recovery'?'Recovery':keyName(d.key)} ${d.score} · ${d.score<60?'High':d.score<80?'Watch':'Stable'}`,`${keyName(d.key)}${d.score}点・${level(d.score)}`,`${d.key==='recovery'?'회복':keyName(d.key)} ${d.score}점`);
 return L(`${d.days}天有效${d.rows?.length||0}天均${d.score}分；高風險${d.high}天，最低${d.worst}。`,`${d.days}天有效${d.rows?.length||0}天均${d.score}分；高风险${d.high}天，最低${d.worst}。`,`${d.days}d (${d.rows?.length||0} valid) avg${d.score}; risky ${d.high}d; min${d.worst}.`,`${d.days}日・有効${d.rows?.length||0}日・平均${d.score}点・高リスク${d.high}日。`,`${d.days}일 중 유효${d.rows?.length||0}일·평균${d.score}점·위험${d.high}일·최저${d.worst}점.`);
}
function tightFact(d){
 const row=d.source;if(!row)return d.lines[1]||'';
 if(d.key==='cardio'||d.key==='activityRecovery'){
  const ks=(d.key==='cardio'?['breath','heart','hrv','stable']:['energy','calm','recovery']).filter(k=>valid(row.scores?.[k])).sort((a,b)=>row.scores[a]-row.scores[b]).slice(0,3);
  const text=ks.map(k=>keyName(k)+' '+row.scores[k]).join(L('、','、',', ','・',', '));
  return L(`主要低分：${text}。`,`主要低分：${text}。`,`Low scores: ${ks.map(k=>({energy:'Energy',calm:'Calm',recovery:'Recovery',breath:'Breaths',heart:'Pulse',hrv:'HRV',stable:'Beat'}[k]||k)+row.scores[k]).join(', ')}.`,`主な低得点：${text}。`,`주요 저점: ${text}.`);
 }
 if(d.key==='recovery'){const o=datum('recovery',row);if(valid(o.value)&&valid(o.base))return L(`兩分鐘回落${round(o.value)}次，平常${round(o.base)}次。`,`两分钟回落${round(o.value)}次，平常${round(o.base)}次。`,`2-min HR fall ${round(o.value)} vs ${round(o.base)} bpm.`,`2分間の心拍低下${round(o.value)}、普段${round(o.base)}。`,`2분 후 심박 감소 ${round(o.value)}, 평소 ${round(o.base)}.`);}
 if(d.key==='calm')return L(`同日呼吸${row.scores?.breath}、HRV${row.scores?.hrv}分也偏低。`,`同日呼吸${row.scores?.breath}、HRV${row.scores?.hrv}分也偏低。`,`Breathing ${row.scores?.breath}, HRV ${row.scores?.hrv} also low.`,`同日の呼吸${row.scores?.breath}点・HRV${row.scores?.hrv}点も低下。`,`같은 날 호흡 ${row.scores?.breath}점·HRV ${row.scores?.hrv}점도 낮음.`);
 const x=datum(d.key,row),v=x.value,b=x.base;
 if(!valid(v)||!valid(b))return d.lines[1]||'';
 const v1=round(v),b1=round(b),u=d.key==='hrv'?'ms':d.key==='sleep'?'h':d.key==='stable'?'ms':d.key==='energy'?'':d.key==='recovery'?'bpm':'/min';
 const direction=v<b?L('下降','下降','down','低下','감소'):L('升高','升高','up','増加','증가');
 const key=d.key==='heart'?L('心跳','心跳','Pulse','心拍','심박'):d.key==='breath'?L('呼吸','呼吸','Breaths','呼吸','호흡'):d.key==='hrv'?'RMSSD':d.key==='stable'?'SDNN':d.key==='sleep'?L('休息','休息','Rest','休息','휴식'):d.key==='energy'?L('活動量','活动量','Activity','活動','활동'):L('兩分鐘心跳回落','两分钟心跳回落','2-min drop','2分間心拍低下','2분 심박 감소');
 return L(`${key}${v1}${u}，平常${b1}${u}，${direction}。`,`${key}${v1}${u}，平常${b1}${u}，${direction}。`,`${key} ${v1}${u} (usual ${b1}${u}), ${v<b?'lower':'higher'}.`,`${key}${v1}${u}、普段${b1}${u}、${direction}。`,`${key} ${v1}${u}, 평소 ${b1}${u}보다 ${direction}.`);
}
function tightAction(d){
 if(d.score<60 && d.key==='hrv')return L('安靜時重測；若精神差或持續偏低，今天找獸醫。','安静时复测；若精神差或持续偏低，今天找兽医。','Recheck at rest; if still low and unwell, call vet today.','安静時に再測定。低得点と元気低下が続けば今日獣医へ。','휴식 중 재측정. 저점과 기력 저하가 계속되면 오늘 진료 상담.');
 if(d.score<60 && d.key==='recovery')return L('減輕運動；恢復持續慢或虛弱，今天找獸醫。','减少活动；恢复持续慢或虚弱，今天找兽医。','Reduce exertion; persistent slow recovery or weakness: call vet.','運動を控え、回復の遅れや脱力が続けば今日獣医へ。','운동을 줄이고 회복 지연·무력이 계속되면 진료 상담.');
 if(d.score>=80)return L('繼續觀察。','继续观察。','Keep watching.','経過を確認。','경과를 확인하세요.');
 if(d.score>=60)return L('持續變差請聯絡獸醫。','持续变差请联系兽医。','If still low, ask a vet.','悪化が続けば獣医へ。','악화가 지속되면 진료 상담.');
 return L('異常仍在，今天聯絡獸醫；喘不過氣或倒下，立即急診。','异常仍在，今天联系兽医；喘不过气或倒下，立即急诊。','If still low, call a vet today. Breathing distress/collapse: ER.','異常が続けば今日獣医へ。呼吸困難・虚脱は救急。','이상이 지속되면 오늘 수의사에게 연락. 호흡곤란·쓰러짐은 응급진료.');
}
// Width-safe evidence and action: always retain both, never show a naked risk label.
function compactCause136(d,shorter=false){
 const m=root.DeepPetNarrative138?.compose({key:d.key,score:d.days>1?Math.min(d.score,d.worst):d.score,days:d.days||1,row:d.source,rows:d.rows,datum,lang:state.lang,compact:true,veryShort:shorter});
 if(m)return m.cause;
 const r=d.source,k=d.key;
 const v=datum(k,r||{}),scores=r?.scores||{};
 const lbl=keyName(k), date=d.days>1&&r?.date? r.date.slice(5)+' ':'';
 const unit=k==='sleep'?'h':k==='heart'||k==='breath'?'/min':k==='hrv'||k==='stable'?'ms':k==='recovery'?'bpm':'';
 if(shorter&&valid(v.value)&&valid(v.base)&&v.base>0){
  const a=round(v.value),b=round(v.base), up=v.value>v.base;
  const noun={heart:['心跳','心跳','pulse','心拍','심박'],breath:['呼吸','呼吸','breaths','呼吸','호흡'],sleep:['休息','休息','rest','休息','휴식'],energy:['活動量','活动量','activity','活動量','활동량'],recovery:['恢復','恢复','recovery','回復','회복'],hrv:['心跳變化','心跳变化','HRV','HRV','HRV'],stable:['節奏','节奏','beat pattern','拍動','박동']}[k];
  if(noun){const nm=tr(noun),direction=up?L('升高','升高','higher','増加','증가'):L('下降','下降','lower','低下','감소');
   return L(`原因：${date}${nm}${a}，平常${b}，${direction}。`,`原因：${date}${nm}${a}，平常${b}，${direction}。`,`Cause: ${date}${nm} ${a} vs ${b}, ${direction}.`,`理由：${date}${nm}${a}、通常${b}、${direction}。`,`원인: ${date}${nm} ${a}, 평소 ${b}, ${direction}.`);
  }
 }
 // Plain-language compact reasons; never show programmer shorthand such as "5.5h/9.5 down".
 if(valid(v.value)&&valid(v.base)&&v.base>0){
  const a=round(v.value),b=round(v.base),up=v.value>v.base;
  if(k==='heart'||k==='breath'){
   const noun=k==='heart'?L('心跳','心跳','pulse','心拍','심박'):L('呼吸','呼吸','breaths','呼吸','호흡');
   const dir=up?L('偏快','偏快','faster','速い','빠름'):L('偏慢','偏慢','slower','遅い','느림');
   return L(`原因：${date}安靜時${noun}${a}次／分，平常${b}次，${dir}。`,`原因：${date}安静时${noun}${a}次/分，平常${b}次，${dir}。`,`Cause: ${date}resting ${noun} ${a}/min vs ${b}, ${dir}.`,`理由：${date}安静時${noun}${a}回/分、通常${b}回、${dir}。`,`원인: ${date}안정 ${noun} ${a}회/분, 평소 ${b}회, ${dir}.`);
  }
  if(k==='sleep')return L(`原因：${date}休息${a}小時，平常${b}小時，${up?'明顯增加':'明顯不足'}。`,`原因：${date}休息${a}小时，平常${b}小时，${up?'明显增加':'明显不足'}。`,`Cause: ${date}rest ${a}h vs usual ${b}h, ${up?'longer':'much shorter'}.`,`理由：${date}休息${a}時間、通常${b}時間、${up?'増加':'不足'}。`,`원인: ${date}휴식 ${a}시간, 평소 ${b}시간보다 ${up?'증가':'부족'}.`);
  if(k==='energy')return L(`原因：${date}活動量${a}，平常約${b}，${up?'明顯增加':'下降很多'}。`,`原因：${date}活动量${a}，平常约${b}，${up?'明显增加':'下降很多'}。`,`Cause: ${date}activity ${a} vs usual ${b}, ${up?'higher':'much lower'}.`,`理由：${date}活動量${a}、通常${b}、${up?'増加':'大幅低下'}。`,`원인: ${date}활동량 ${a}, 평소 ${b}보다 ${up?'증가':'크게 감소'}.`);
  if(k==='recovery')return L(`原因：${date}兩分鐘心跳回落${a}次，平常${b}次，${up?'較快':'恢復較慢'}。`,`原因：${date}两分钟心跳回落${a}次，平常${b}次，${up?'较快':'恢复较慢'}。`,`Cause: ${date}2-min pulse drop ${a} vs usual ${b}, ${up?'faster':'slower recovery'}.`,`理由：${date}2分間の心拍低下${a}回、通常${b}回、${up?'速い':'回復が遅い'}。`,`원인: ${date}2분 심박 감소 ${a}회, 평소 ${b}회, ${up?'빠름':'회복 느림'}.`);
  if(k==='hrv'||k==='stable'){
   const noun=k==='hrv'?L('心跳間隔變化','心跳间隔变化','heart variability','心拍間隔変化','심박 간격 변화'):L('節奏變化','节奏变化','beat-pattern change','拍動の変化','박동 변화');
   return L(`原因：${date}${noun}${a}毫秒，平常${b}，${up?'增加':'下降很多'}。`,`原因：${date}${noun}${a}毫秒，平常${b}，${up?'增加':'下降很多'}。`,`Cause: ${date}${noun} ${a}ms vs usual ${b}, ${up?'higher':'lower'}.`,`理由：${date}${noun}${a}ms、通常${b}ms、${up?'増加':'低下'}。`,`원인: ${date}${noun} ${a}ms, 평소 ${b}ms보다 ${up?'증가':'감소'}.`);
  }
 }
 if(k==='calm'){
  const sc=r?.scores||{},related=['breath','hrv','heart'].filter(x=>valid(sc[x])&&sc[x]>0&&sc[x]<80).slice(0,2);
  const list=related.map(x=>keyName(x)+sc[x]).join(L('、','、',', ','・','·'));
  return L(`原因：${date}放鬆度低，${list||'相關量測'}需一起核對。`,`原因：${date}放松度低，${list||'相关测量'}需一起核对。`,`Cause: ${date}low calmness; check ${list||'source readings'}.`,`理由：${date}落ち着きが低下。${list||'測定値'}も確認。`,`원인: ${date}안정도 낮음. ${list||'측정값'}도 확인.`);
 }
 let vstr='';if(valid(v.value))vstr=String(round(v.value))+unit;
 if(valid(v.base)&&v.base>0&&!shorter){vstr+=L(`／平常${round(v.base)}`,`／平常${round(v.base)}`,` vs ${round(v.base)}`,`／通常${round(v.base)}`,` /평소${round(v.base)}`);}
 if(k==='cardio'||k==='activityRecovery'){
  const keys=k==='cardio'?['breath','heart','hrv','stable']:['energy','calm','recovery'];
  const lo=keys.filter(x=>valid(scores[x])&&scores[x]>0).sort((a,b)=>scores[a]-scores[b]).slice(0,shorter?1:2);
  return L(`原因：${date}${lo.map(x=>keyName(x)+scores[x]+'分').join('、')}拖低總分。`,`原因：${date}${lo.map(x=>keyName(x)+scores[x]+'分').join('、')}拉低总分。`,`Cause: ${date}${lo.map(x=>keyName(x)+' '+scores[x]).join(', ')} lower total.`,`理由：${date}${lo.map(x=>keyName(x)+scores[x]+'点').join('・')}が低下。`,`원인: ${date}${lo.map(x=>keyName(x)+scores[x]+'점').join('·')}이 총점 하락.`);
 }
 if(!vstr){return L(`原因：${date}${lbl}低分，但原始量測不足，須核對。`,`原因：${date}${lbl}低分，但原始测量不足，需核对。`,`Cause: ${date}${lbl} scored low; source reading needs checking.`,`理由：${date}${lbl}低得点だが元データ不足。`,`원인: ${date}${lbl} 저점이지만 원시 데이터 부족.`);}
 const direction=valid(v.base)&&v.base>0?(v.value>v.base?L('升','升','up','増','증'):v.value<v.base?L('降','降','down','減','감'):''):'';
 const core=`${lbl}${vstr}`;
 return L(`原因：${date}${core}${direction}。`,`原因：${date}${core}${direction}。`,`Cause: ${date}${core} (${direction}).`,`理由：${date}${core}${direction}。`,`원인: ${date}${core} ${direction}.`);
}
function compactAction136(d,shorter=false){
 const m=root.DeepPetNarrative138?.compose({key:d.key,score:d.score,days:d.days||1,row:d.source,rows:d.rows,datum,lang:state.lang,compact:true,veryShort:shorter});
 if(m)return m.action;
 // The compact text is still metric- and tier-specific, not a generic fallback.
 const ix=riskTier(d.score),a=tr(COMPACT_STEP_137[d.key]||COMPACT_STEP_137.cardio);
 if(ix<0)return gradedAction(d.key,d.score,d.days||1,d.source,true);
 if(shorter){
  const quick={cardio:['核對最新心肺','核对最新心肺','review cardio','最新の心肺を確認','최근 심폐 확인'],heart:['重新量安靜心跳','重新量安静心跳','recheck resting pulse','安静時心拍を再確認','안정 심박 재측정'],breath:['確認呼吸是否費力','确认呼吸是否费力','check breathing effort','呼吸の苦しさを確認','호흡곤란 확인'],hrv:['安靜時重測HRV','安静时复测HRV','retest HRV at rest','安静時にHRV再測定','휴식 중 HRV 재측정'],stable:['核對心跳與波形','核对心跳与波形','check beat waveform','拍動波形を確認','심박 파형 확인'],sleep:['查夜間呼吸與中斷','查夜间呼吸与中断','check night breathing','夜間呼吸を確認','야간 호흡 확인'],activityRecovery:['查最低分項與睡眠','查最低分项与睡眠','check worst score/sleep','低得点と睡眠を確認','저점 항목·수면 확인'],energy:['看精神與昨夜睡眠','看精神和昨夜睡眠','check energy and sleep','元気と睡眠を確認','기력·수면 확인'],recovery:['核對兩分鐘恢復','核对两分钟恢复','check 2-min recovery','2分間の回復を確認','2분 회복 확인'],calm:['查疼痛與安靜呼吸','查疼痛和安静呼吸','check pain/breaths','痛みと安静時呼吸','통증·휴식 호흡 확인']};
  const q=tr(quick[d.key]||quick.cardio);
  if(ix>=10)return L(`建議：${q}。`,`建议：${q}。`,`Next: ${q}.`,`対応：${q}。`,`조치: ${q}.`);
  const t=ix<=1?(d.days>1?L('現仍異常才立即就醫','现仍异常才立即就医','urgent care if ongoing now','今も異常なら受診','현재도 이상하면 즉시 진료'):L('持續異常立即就醫','持续异常立即就医','urgent care if ongoing','続けば直ちに受診','지속되면 즉시 진료')):ix<=5?L('持續異常今天問獸醫','持续异常今天问兽医','vet today if ongoing','続けば今日獣医へ','지속되면 오늘 진료'):ix<=9?L('反覆出現問獸醫','反复出现问兽医','vet if recurring','繰り返せば獣医へ','반복되면 진료'):L('下次再比對','下次再对比','compare next time','次回も比較','다음에 비교');
  return L(`建議：${q}；${t}。`,`建议：${q}；${t}。`,`Next: ${q}; ${t}.`,`対応：${q}。${t}。`,`조치: ${q}. ${t}.`);
 }
 if(ix>=13)return gradedAction(d.key,d.score,d.days||1,d.source,true);
 const period=d.days>1;
 let follow;
 if(ix<=1)follow=period?tr(COMPACT_ALERT_137[d.key]||COMPACT_ALERT_137.cardio):tr(COMPACT_ALERT_137[d.key]||COMPACT_ALERT_137.cardio);
 else if(ix<=5)follow=tr(HIGH_BAND_ACT_137[ix]);
 else follow=tr(ESCALATION_137[ix]);
 return L(`建議：${a}；${follow}。`,`建议：${a}；${follow}。`,`Next: ${a}; ${follow}.`,`対応：${a}。${follow}。`,`조치: ${a}. ${follow}.`);
}

function lineCount(node){let n=0;for(const p of node.querySelectorAll(':scope > p')){const lh=parseFloat(getComputedStyle(p).lineHeight)||20; n+=Math.max(1,Math.ceil((p.getBoundingClientRect().height-.4)/lh));}return n;}
function compactSeverity140(data){
 // The score is already in the ring. Keep only the severity label here,
 // in all 5 languages, on 1/7/30 days; do not replace true causes/actions.
 return valid(data.score)?level(data.score):(data.lines?.[0]||L('資料不足','资料不足','Not enough data','データ不足','자료 부족'));
}
function mount(node,data,options={}){
 if(!node)return;
 node.classList.add('dp127-compact','dp131-linked');node.dataset.dp127Max=String(data.max);
 const full=data.lines.filter(Boolean),lines=full.slice();
 if(valid(data.score)&&lines.length)lines[0]=compactSeverity140(data);
 function show(){node.replaceChildren();for(let i=0;i<lines.length;i++){const p=document.createElement('p');p.className=i===0?'dp127-first dp131-lead':'dp131-reason';p.dataset.dp131Role=i===0?'lead':i===lines.length-1?'action':'evidence';p.textContent=lines[i];node.append(p);}}
 show();
 // Mandatory content order: score, source-backed cause, actionable response.
 // If the viewport is narrow, shorten prose instead of deleting the cause/action.
 if(!data.periodSummary && lineCount(node)>data.max && data.score<90 && data.source){
  lines.splice(0,lines.length,compactSeverity140(data),compactCause136(data),compactAction136({...data,score:data.days>1?Math.min(data.score,data.worst):data.score}));show();
 }
 if(!data.periodSummary && lineCount(node)>data.max && data.score<90 && data.source){
  lines.splice(0,lines.length,compactSeverity140(data),compactCause136(data,true),compactAction136({...data,score:data.max<=5?data.score:data.days>1?Math.min(data.score,data.worst):data.score},true));show();
 }
 // Healthy 1-2 lines only; preserve no fake urgency.
 if(!data.periodSummary && data.max===2&&lineCount(node)>2){lines.splice(1);show();}
 node.dataset.dp131Measured=String(lineCount(node));
 if(options.nav&&data.to!==null&&data.to!==undefined){
  const b=document.createElement('button');b.type='button';b.className='dp131-linked-button';b.dataset.dp131Goto=String(data.to);
  b.textContent=data.link?linkLabel(data.link,data.days):L('查看相關資料 ›','查看相关数据 ›','See related data ›','関連記録を見る ›','관련 기록 보기 ›');node.append(b);
 }
}
function update(){
 if(state.tab!=='deep'||noProfileData())return;
 const days=[1,7,30].includes(Number(state.range))?Number(state.range):1;
 if(!state.detail){
  const main=document.querySelector('#app .dp-owner-deep');if(!main)return;
  const type=Number(state.deepType)||0;
  const keys=type===0?['cardio','heart','breath','hrv','stable']:type===1?['sleep']:['activityRecovery','energy','recovery','calm'];
  const els=[...main.querySelectorAll('.dp116-evidence-copy')];
  els.forEach((el,i)=>{
   // V10.139 layout fix: explanation belongs UNDER the title in the left
   // column; the ring stays in a fixed, independent right column. Never
   // append long text as a third full-width grid item after the score.
   const tile=el.closest('.dp903-metric-card');
   const overview=el.closest('.dp903-overview-head');
   const sleepHead=el.closest('.dp905-sleep-head');
   if(tile){
    const left=tile.querySelector(':scope > .dp903-metric-left');
    if(left){const secondary=left.querySelector(':scope > .dp129-hrv-details');
     if(secondary)left.insertBefore(el,secondary);else left.append(el);}
   }else if(overview){
    overview.querySelector(':scope > .dp903-overview-copy')?.append(el);
   }else if(sleepHead){
    sleepHead.querySelector(':scope > .dp1054-sleep-copy')?.append(el);
   }
   if(keys[i])mount(el,desc(keys[i],days),{nav:i===0});
  });
  // If legacy rendering left N/A while the SAME selected date has a scored
  // record, project only that score into its corresponding ring. No inferred score.
  if((type===0||type===2)&&typeof dpDeepDottedScore==='function'&&typeof scoreScheme==='function'){
   const hosts=type===0?
    [[main.querySelector('.dp903-overview-head .dp903-score-col'),'cardio'],
     ...[...main.querySelectorAll('.dp903-metric-card[data-dp903-metric]')].map(tile=>[tile.querySelector('.dp903-score-col'),tile.dataset.dp903Metric])]:
    [[main.querySelector('.dp901-overall-head .dp901-score-col'),'activityRecovery'],
     ...[...main.querySelectorAll('.dp901-metric-card')].map((tile,i)=>[tile.querySelector('.dp901-score-col'),['energy','recovery','calm'][i]])];
   for(const [host,key] of hosts){if(!host||!key||!labels[key])continue;
    const missing=host.querySelector('.dp903-no-score,.dp90-unavailable,.dp-status-score[data-score=""]');
    if(!missing)continue;
    const sameSource=desc(key,days);
    if(!valid(sameSource.score)||sameSource.score<=0)continue;
    missing.outerHTML=dpDeepDottedScore(sameSource.score,scoreScheme(sameSource.score).color);
    host.classList.remove('none');
   }
  }
  // One scoring source for text and score ring. Older day-render wrappers can
  // leave an N/A ring even when the matching date has a valid scored sleep row.
  // Never manufacture a value: only project the existing scored daily record.
  if(type===1&&typeof dpDeepDottedScore==='function'&&typeof scoreScheme==='function'){
   const summary=desc('sleep',days);
   const ring=main.querySelector('.dp1054-sleep-meter .dp-status-score[data-score=""]');
   if(ring&&valid(summary.score))ring.outerHTML=dpDeepDottedScore(summary.score,scoreScheme(summary.score).color);
  }
  // V10.139 layout fix: period sleep could incorrectly retain an N/A
  // placeholder despite the same engine containing real scored days.
  // Project ONLY the valid existing 7/30-day average, never a fabricated score.
  if(type===1 && days>1 && typeof dpDeepDottedScore==='function' && typeof scoreScheme==='function'){
   const d=desc('sleep',days),head=main.querySelector('.dp905-sleep-head.dp1048-sleep-period-head');
   const missing=head?.querySelector(':scope > .dp90-unavailable');
   if(missing && valid(d.score)){
    const stack=document.createElement('div');
    stack.className='dp1042-score-stack dp1046-primary-stack dp1054-sleep-meter dp140-restored-period-ring';
    stack.innerHTML=dpDeepDottedScore(d.score,scoreScheme(d.score).color);
    missing.replaceWith(stack);
   }
   // The old placeholder paragraph claimed that every night's count was N/A,
   // contradicting the scored-day evidence above. Do not invent minutes or
   // interruptions: show only the verified scored-day count.
   const periodNote=main.querySelector('.dp905-sleep-summary > p');
   if(periodNote && valid(d.score) && /N\/A|尚無有效|暂无有效|No valid/.test(periodNote.textContent||'')){
    periodNote.textContent=L(`最近${days}天有${d.rows.length}個有效睡眠評分日；逐夜休息時長與中斷統計需完整的原始時序，暫不提供平均值。`,
     `最近${days}天有${d.rows.length}个有效睡眠评分日；逐夜休息时长与中断统计需完整原始记录，暂不提供平均值。`,
     `There are ${d.rows.length} scored sleep days in the last ${days}; night-duration and interruption averages need verified minute-level records.`,
     `直近${days}日の睡眠評価有効記録は${d.rows.length}日。休息時間や中断回数の平均は、詳細記録が確認できるまで表示しません。`,
     `최근 ${days}일 중 수면 점수 유효일 ${d.rows.length}일. 야간 휴식 시간과 중단 평균은 상세 기록 확인 후 표시합니다.`);
   }
  }
  // A legacy empty-preview pass may leave a false N/A quality banner on
  // a scored period. Only update when valid current-pet readings exist.
  if(days>1){
   const d=desc(keys[0],days),q=main.querySelector('.dp-range-quality');
   if(q && valid(d.score) && d.rows?.length){
    q.textContent=L(`最近${days}天 · ${d.rows.length}個有效記錄日`,
     `最近${days}天 · ${d.rows.length}个有效记录日`,
     `Last ${days} days · ${d.rows.length} valid recording days`,
     `直近${days}日・有効記録${d.rows.length}日`,
     `최근 ${days}일 · 유효기록 ${d.rows.length}일`);
   }
  }
  // Limit to ONE observation with a metric-specific reason instead of the same
  // emergency paragraph on all tabs. Preserve the original placement.
  const boxes=[...main.querySelectorAll('.dp-deep-alert-reasons')];boxes.slice(1).forEach(x=>x.remove());
  if(boxes.length){
   const data=desc(keys[0],days),panel=boxes[0].querySelector('.dp-deep-alert-lines');
   if(panel){panel.replaceChildren();const p=document.createElement('p');p.className='dp131-observation';p.textContent=data.lines.slice(1).filter(Boolean).slice(0,2).join(' ');panel.append(p);
    const b=document.createElement('button');b.type='button';b.className='dp127-details-link';b.dataset.dp127Open=keys[0];b.textContent=L('查看簡明詳情 ›','查看简明详情 ›','Read concise details ›','短い説明を見る ›','간단한 설명 보기 ›');panel.append(b);}
  }
  return;
 }
 const k=state.detail==='dp90-waveform'?(state.dp90WaveKind==='breath'?'breath':'heart'):
  state.detail==='dp905-sleep-day'?'sleep':
  ['dp905-energy-day','dp936-energy-detail','dp908-energy-calendar'].includes(state.detail)?'energy':null;
 if(k){const target=document.querySelector('#app .dp1068-detail-why .dp116-evidence-copy');if(target){
  const rng=state.detail==='dp908-energy-calendar'?[7,30].includes(days)?days:7:1;
  const selected=state.dp905ChosenDate||state.dp90WaveDate||state.dp936EnergyDate||state.deepSelectedDate;
  mount(target,desc(k,rng,rng===1?selected:null));}}
}
function updateOpenDetail(explicitKey=null){if(noProfileData())return;const x=document.querySelector('#app .dp127-detail-page .dp127-detail-article');if(!x)return;
 const key= x.parentElement?.getAttribute('aria-label');const known=(explicitKey&&labels[explicitKey]?explicitKey:null)||Object.keys(labels).find(k=>key===keyName(k));
 if(known)mount(x,desc(known,[1,7,30].includes(Number(state.range))?Number(state.range):1));
}
const original=render;
render=function(...args){const out=original.apply(this,args);try{update();root.DeepPetBuildVersion='10.204';document.querySelectorAll('#app .app-build-version').forEach(el=>{el.textContent=el.textContent.replace(/10\.1(?:3[0-8]|2[0-9])/g,'10.199');});}catch(e){console.warn('DeepPet linked explanations:',e);}return out;};
document.addEventListener('click',e=>{
 const b=e.target?.closest?.('[data-dp131-goto]');if(b){e.preventDefault();e.stopImmediatePropagation();state.tab='deep';state.deepType=Number(b.dataset.dp131Goto);state.detail=null;render(true);return;}
 const open=e.target?.closest?.('[data-dp127-open]');if(open){const k=open.dataset.dp127Open;queueMicrotask(()=>{try{updateOpenDetail(k);}catch(e){console.warn(e);}});}
},true);
function crossPeriod(days,petIndex=state.dog){
 const dayRows=(root.DeepPetSignalScoring?.getDaily?.(petIndex)||[]).filter(x=>x&&x.scores);
 const range=[1,7,30].includes(Number(days))?Number(days):1;
 const anchor=Date.parse(today()+'T12:00:00Z');
 const usable=dayRows.filter(x=>{const dt=Date.parse(x.date+'T12:00:00Z');return Number.isFinite(dt)&&dt<=anchor&&dt>anchor-range*86400000;});
 const pairCount=(a,b)=>usable.filter(x=>valid(x.scores[a])&&valid(x.scores[b])&&x.scores[a]<60&&x.scores[b]<60).length;
 return Object.freeze({days:range,observedDays:usable.length,cardioSleepSameDay:pairCount('cardio','sleep'),sleepEnergySameDay:pairCount('sleep','energy'),
  simultaneousHoursVerified:false,causationEstablished:false,petIndex});
}
root.DeepPetLinkedNarrative131=Object.freeze({version:'10.139',desc,gradedCause,gradedAction,riskTier,actionContext137,dayLink,periodLink,linkLabel,riskAction,datum,level,maxlines,lineCount,crossPeriod});
})(window);
