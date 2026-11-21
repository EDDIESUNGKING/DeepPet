/* DeepPet V10.125 · complete measured-cause ledger.
 * A poor score is the RESULT of scored observations.  Never invent readings
 * to justify a score, omit verified low sub-scores, or mistake context for a
 * separate disease.  No pet names or display-case scores occur in this file.
 */
(function(root){'use strict';
 const fin=v=>typeof v==='number'&&Number.isFinite(v);
 const fmt=v=>fin(v)?(Math.round(v*10)/10).toFixed(1):'—';
 const tr=(c,tw,en,ko,ja)=>c.translate(tw,en,ko,ja);
 const keys=['heart','breath','hrv','stable','sleep','energy','recovery','calm'];
 const names={
  heart:['心跳','heart rate','심박','心拍'],breath:['呼吸','breathing','호흡','呼吸'],
  hrv:['HRV','HRV','HRV','HRV'],stable:['心搏節奏穩定度','beat-pattern stability','박동 패턴 안정도','拍動パターン安定度'],
  sleep:['睡眠休息','sleep/rest','수면·휴식','睡眠・休息'],energy:['精力與活動','energy/activity','활력·활동','活力・活動'],
  recovery:['活動後恢復','post-activity recovery','활동 후 회복','活動後回復'],calm:['放鬆平穩度','rest/steadiness','휴식 안정도','安静度']};
 const fields={
  quietHeartRate:['安靜心率','resting heart rate','안정 시 심박','安静時心拍','bpm'],
  heartRate:['全天平均心率','day-wide mean heart rate','하루 평균 심박','終日平均心拍','bpm'],
  heartSpread:['心率波動幅度','heart-rate spread','심박 변동 폭','心拍変動幅','bpm'],
  quietBreathRate:['安靜呼吸','resting breathing','안정 시 호흡','安静時呼吸','/min'],
  breathRate:['全天平均呼吸','day-wide breathing rate','하루 평균 호흡','終日平均呼吸','/min'],
  breathSpread:['呼吸波動幅度','breathing-rate spread','호흡 변동 폭','呼吸変動幅','/min'],
  rmssd:['RMSSD','RMSSD','RMSSD','RMSSD','ms'],sdnn:['SDNN','SDNN','SDNN','SDNN','ms'],
  quietRhythm:['安靜心搏節奏變化','resting beat-pattern variation','안정 시 박동 패턴','安静時拍動パターン',''],
  restHours:['有效休息時長','observed quiet-rest hours','실측 휴식 시간','有効休息時間','h'],
  restFraction:['安靜時段比例','quiet-time proportion','안정 구간 비율','安静時間割合',''],
  nightBreathRate:['夜間呼吸','night-time breathing','야간 호흡','夜間呼吸','/min'],
  activity:['每日活動量','daily movement','하루 활동량','日中活動量',''],
  motionMean:['活動強度指標','movement intensity','활동 강도','活動強度',''],
  motionVariation:['活動規律變化','movement-pattern variation','활동 패턴 변동','活動パターン変化',''],
  recoveryDrop:['兩分鐘心率回落幅度','two-minute heart-rate fall','2분 심박 감소폭','2分間心拍低下幅','bpm']};
 const real={
  heart:['quietHeartRate','heartSpread','heartRate'],
  breath:['quietBreathRate','breathSpread','breathRate'],
  hrv:['rmssd','sdnn'],stable:['quietRhythm','heartSpread'],
  sleep:['restHours','restFraction','nightBreathRate','motionVariation'],
  energy:['motionMean','motionVariation','restHours'],
  recovery:['recoveryDrop','quietHeartRate'],
  calm:['quietHeartRate','quietBreathRate','rmssd','sdnn','restFraction']};
 const gallery={
  heart:['quietHeartRate','heartRate'],breath:['quietBreathRate','breathRate'],
  hrv:['rmssd','sdnn'],stable:['sdnn'],sleep:['restHours'],
  energy:['activity','restHours'],recovery:['recoveryDrop'],
  calm:['quietHeartRate','quietBreathRate','rmssd','sdnn','restHours']};
 const scoreRisk=s=>!fin(s)?-1:s<20?4:s<60?3:s<80?2:s<90?1:0;
 const severity=(c,s)=>scoreRisk(s)>=4?tr(c,'極端高風險','EXTREME RISK','극단적 고위험','極端な高リスク'):
  scoreRisk(s)===3?tr(c,'高風險','HIGH RISK','고위험','高リスク'):
  scoreRisk(s)===2?tr(c,'中風險','MODERATE RISK','중위험','中リスク'):
  scoreRisk(s)===1?tr(c,'低風險','LOW RISK','저위험','低リスク'):
  tr(c,'健康','HEALTHY','건강','健康');
 function fieldFact(c,k){
  const value=c.features?.[k],reference=c.references?.[k],entry=fields[k];
  if(!entry||!fin(value))return null;
  const name=tr(c,...entry.slice(0,4)),unit=entry[4]?' '+entry[4]:'';
  if(!fin(reference)||reference<=0)return tr(c,
   `${name}實測 ${fmt(value)}${unit}；目前沒有同源、同條件的有效參考，無法算出偏離幅度。`,
   `${name}: measured ${fmt(value)}${unit}; no valid like-for-like source reference, so a deviation percentage cannot be established.`,
   `${name} ${fmt(value)}${unit}; 동일 출처의 비교 가능한 기준이 없어 편차율을 산출할 수 없습니다.`,
   `${name}実測${fmt(value)}${unit}。同条件の比較基準がないため偏差率は算出できません。`);
  const delta=100*(value-reference)/reference,mag=Math.round(Math.abs(delta));
  const up=delta>0,change=delta<0;
  return tr(c,
   `${name}實測 ${fmt(value)}${unit}，可比參考 ${fmt(reference)}${unit}，${up?'增加':change?'減少':'相同'} ${mag}%。`,
   `${name}: ${fmt(value)}${unit} vs matched reference ${fmt(reference)}${unit}, ${up?'up':change?'down':'unchanged'} ${mag}%.`,
   `${name} ${fmt(value)}${unit}, 기준 ${fmt(reference)}${unit} 대비 ${up?'증가':change?'감소':'같음'} ${mag}%.`,
   `${name}実測${fmt(value)}${unit}、基準${fmt(reference)}${unit}より${up?'増加':change?'減少':'変化なし'}${mag}%。`);
 }
 function metricInterpretation(c,k){
  const s=c.scores||{},f=c.features||{},ref=c.references||{},score=s[k];
  const changed=(id)=>fin(f[id])&&fin(ref[id])&&ref[id]>0?100*(f[id]-ref[id])/ref[id]:null;
  const heart=changed('quietHeartRate'),breath=changed('quietBreathRate'),rm=changed('rmssd'),sd=changed('sdnn'),
   sleep=changed('restHours'),activity=changed(c.source==='20hz-waveform'?'motionMean':'activity');
  switch(k){
   case 'heart':return heart===null?tr(c,'心跳子分很低，但缺少可驗證的安靜基準；不可捏造心跳偏快或偏慢的原因。','The heart score is low, but resting comparison is unverified; do not invent an increased or decreased rate.','심박 점수는 낮지만 안정 시 기준이 없어 증가·감소 원인을 임의로 만들 수 없습니다.','心拍得点は低いものの安静時基準がなく、増減を推測できません。'):
    heart>=0?tr(c,`安靜心率比個體基準增加約 ${Math.round(heart)}%，心跳卻只有 ${score}/100；差距越大，這項分數越差，絕不是「稍微偏快」。請核對安靜條件與訊號。`,`Resting heart rate is about ${Math.round(heart)}% above its matched baseline and the heart score is only ${score}/100. This is a major measured deviation, not merely “slightly fast.” Verify rest and signal quality.`,`안정 시 심박이 기준보다 약 ${Math.round(heart)}% 증가하여 심박 점수는 ${score}/100입니다. 단순히 조금 빠른 상태가 아닙니다.`,`安静時心拍は基準より約${Math.round(heart)}%増え、心拍得点は${score}/100です。単なる軽い増加ではありません。`):
    tr(c,'安靜心率相對參考下降，原因方向與心跳過快完全不同；需核對睡眠、訊號及當下精神。','Resting heart rate fell: the direction is opposite to tachycardia. Check sleep, signal quality and alertness.','안정 시 심박이 감소했으며 빈맥과는 방향이 다릅니다. 수면·신호·의식을 확인하세요.','安静時心拍は低下しており、頻脈とは逆の変化です。睡眠・信号・意識を確認してください。');
   case 'breath':return breath===null?tr(c,'呼吸低分缺少可比的安靜呼吸基準，不能無依據宣稱呼吸加快。','A low breathing score lacks a matched resting baseline; faster breathing cannot be asserted without evidence.','호흡 점수는 낮지만 비교 기준이 없어 빨라졌다고 단정할 수 없습니다.','呼吸得点は低いものの比較基準がなく、呼吸数増加とは断定できません。'):
    breath>=0?tr(c,`安靜呼吸比個體基準增加約 ${Math.round(breath)}%，呼吸子分只有 ${score}/100，偏離幅度非常明顯。必須直接觀察胸腹起伏與呼吸是否費力，不能只寫「偏快」。`,`Resting breathing is about ${Math.round(breath)}% above the pet's baseline, with breathing only ${score}/100. The difference is substantial; assess actual respiratory effort rather than just saying “fast.”`,`안정 시 호흡이 기준보다 약 ${Math.round(breath)}% 증가해 호흡 ${score}/100점입니다. 호흡 노력을 직접 확인하세요.`,`安静時呼吸は基準より約${Math.round(breath)}%増え、呼吸は${score}/100点。実際の呼吸努力を確認してください。`):
    tr(c,'記錄顯示安靜呼吸下降，不是變快；先排除深睡和訊號問題。','The measured breathing rate fell, not rose; check deep sleep and sensor quality first.','호흡은 증가가 아니라 감소했습니다. 깊은 수면과 신호 문제를 확인하세요.','呼吸は増加ではなく減少しており、深睡眠と信号品質を確認してください。');
   case 'hrv':return rm!==null&&sd!==null&&rm<0&&sd<0?
    tr(c,'RMSSD 與 SDNN 兩種心搏間期統計同步下降，兩個差距都須交代；它們來自相關原始訊號，不是兩個獨立疾病。','Both RMSSD and SDNN decreased. Report both deviations; they share beat-interval source data and do not imply two diseases.','RMSSD와 SDNN이 함께 감소했으나 같은 박동 간격 원자료를 공유하므로 독립 질환 두 개가 아닙니다.','RMSSDとSDNNがともに低下しましたが、元の拍動間隔データを共有しており、二つの病気を意味しません。'):
    tr(c,'必須分別看 RMSSD、SDNN 的實際增減方向；不能假定兩者都下降，也不能單憑 HRV 確診疾病。','Inspect RMSSD and SDNN directions separately. Do not assume both fell or infer disease from HRV alone.','RMSSD와 SDNN의 방향을 각각 확인해야 하며 둘 다 감소했다고 단정할 수 없습니다.','RMSSDとSDNNの変化方向を別々に確認し、両方が低下したとは断定しません。');
   case 'stable':return c.source==='20hz-waveform'?
    tr(c,'此記錄應以安靜心搏節奏特徵和波形品質核對，不能用其他來源的 SDNN 代替；此分數也不是心電圖診斷。','Review this record using the resting beat-pattern feature and waveform quality. SDNN from a different source cannot replace it, and the score is not an ECG diagnosis.','이 기록은 안정 시 박동 패턴과 파형 품질로 확인해야 하며 다른 출처의 SDNN으로 대체하거나 심전도 진단으로 볼 수 없습니다.','この記録では安静時拍動パターンと波形品質を確認し、別のデータ源のSDNNで代用したり心電図診断としたりはできません。'):
    tr(c,'這項穩定度分數以心搏間期 SDNN 與有效參考的差距為依據，不代表單憑一兩次心搏起伏就能確診心律不整。','This stability score reflects beat-interval SDNN deviation from a valid reference, not a diagnosis of arrhythmia from a few beats.','이 안정도 점수는 유효 기준 대비 SDNN 편차를 반영하며 몇 번의 박동만으로 부정맥을 진단하지 않습니다.','この安定度得点は有効な基準に対するSDNN偏差に基づき、数拍の変化だけで不整脈を診断するものではありません。');
   case 'sleep':return sleep!==null&&sleep<0?tr(c,
    `有效休息時長比可比基準大幅縮短 ${Math.round(-sleep)}%，當日睡眠只有 ${score}/100。這代表安靜休息時段嚴重不足，正是低睡眠分的主要可核對依據；若夜間中斷有紀錄會另外列明，不會冒充已計入扣分。`,
    `Verified quiet rest was ${Math.round(-sleep)}% shorter than reference and sleep scored only ${score}/100. This substantial loss of recorded rest explains the poor sleep measure; interruptions are separate observations unless actually scored.`,
    `유효 휴식이 기준보다 ${Math.round(-sleep)}% 줄어 수면 점수는 ${score}/100입니다. 야간 중단은 실제 감점 요인으로 쓰였을 때만 구분합니다.`,
    `有効休息時間が基準より${Math.round(-sleep)}%短く、睡眠得点は${score}/100です。中断回数は減点に用いた場合のみ区別します。`):tr(c,
     '休息時長與有效基準尚未證明大幅縮短；不能為了低睡眠分，硬說已量測到睡眠不足。請檢查真正的評分資料來源。',
     'A large rest-duration deficit is not verified here. Do not assert sleep loss simply to justify the score; check the actual scored source.',
     '휴식 시간의 큰 감소가 확인되지 않았으므로 낮은 점수를 설명하려고 수면 부족을 만들어서는 안 됩니다.',
     '休息時間の大幅減少が確認できないため、低得点を正当化するために不足を捏造しません。');
   case 'energy':return fin(s.sleep)&&s.sleep<80?
    tr(c,`精力只有 ${score}/100；實測活動量${activity!==null&&activity<0?'減少 '+Math.round(-activity)+'%':'須另行核對方向'}，同日睡眠也只有 ${s.sleep}/100${sleep!==null&&sleep<0?'，有效休息減少 '+Math.round(-sleep)+'%':''}。這是多項量測同時不理想，不能淡化成「今天懶得動」。`,`Energy is only ${score}/100; measured movement ${activity!==null&&activity<0?'fell '+Math.round(-activity)+'%':'needs directional verification'}, and same-day sleep is ${s.sleep}/100${sleep!==null&&sleep<0?' with rest down '+Math.round(-sleep)+'%':''}. Multiple observations, not “laziness,” need review.`,`활력 ${score}/100점, 활동량${activity!==null&&activity<0?' '+Math.round(-activity)+'% 감소':' 변화 방향 확인 필요'}, 수면 ${s.sleep}/100점입니다. 복합 변화입니다.`,`活力は${score}/100点、活動${activity!==null&&activity<0?Math.round(-activity)+'%減少':'の方向は要確認'}、睡眠${s.sleep}/100点です。単なる怠慢ではありません。`):
    tr(c,'精力低分需要先核對實際活動變化；若睡眠仍正常，不能謊稱「睡眠不足共同造成」。','Check measured movement change. If sleep is normal, do not claim poor sleep also caused the low energy score.','활동 변화부터 확인하며 수면이 정상이라면 수면 부족이 원인이라고 쓰지 않습니다.','活動変化を先に確認し、睡眠が正常なら睡眠不足も原因とは書きません。');
   case 'recovery':return tr(c,'兩分鐘內心率實際回落幅度必須與相近活動強度的記錄比較；沒有可比事件，不能杜撰回落慢了多少。','Compare the two-minute heart-rate fall only with similarly intense activity. Without matched episodes, a slower percentage cannot be invented.','2분 심박 회복은 비슷한 운동 강도와 비교해야 하며 유사 사건이 없으면 감소율을 임의로 만들지 않습니다.','2分間の心拍低下は同程度の活動と比較し、比較例がなければ低下率を作りません。');
   case 'calm':{const parts=['heart','breath','hrv','sleep'].filter(x=>fin(s[x])&&s[x]<80)
     .sort((a,b)=>s[a]-s[b]).map(x=>`${tr(c,...names[x])} ${s[x]}/100`);
    return parts.length?tr(c,`放鬆平穩度由相互關聯的安靜心肺、HRV 與睡眠子項組成；當日較弱的有：${parts.join('、')}。不能把它們當成獨立疾病。`,`Rest/steadiness combines related resting, HRV and sleep indices. Weaker recorded components: ${parts.join('; ')}. They are not independent diagnoses.`,`안정도는 관련 심폐·HRV·수면 지표로 구성됩니다. 낮은 항목: ${parts.join(', ')}. 독립 진단이 아닙니다.`,`安静度は関連する心肺・HRV・睡眠項目で構成されます。低い項目：${parts.join('、')}。独立した診断ではありません。`):
    tr(c,'現有相關子分沒有顯示多項同步偏離，應另查此分數的有效來源，不能硬說「心肺全部異常」。','Related subscores do not show multiple simultaneous deviations; review the source rather than asserting multiple abnormalities.','관련 점수에서 복수의 이상이 보이지 않아 원자료를 재확인해야 합니다.','関連する下位得点には複数の変化がなく、元データを確認します。');}
  }
  return '';
 }
 function periodLines(c){
  if(!(c.days>1)||!Array.isArray(c.periodRows)||!c.periodRows.length)return [];
  const rows=c.periodRows.filter(x=>x?.source===c.source); // periodRows are date-limited by the caller
  const out=[tr(c,`【${c.days} 天分數發生頻率｜不是只看最低日】以下每一項列出這段期間確實有幾天屬高風險。`,`FREQUENCY ACROSS ${c.days} DAYS: Each item counts actual high-risk days, not only the worst date.`,
   `${c.days}일 위험 빈도: 최저일뿐 아니라 각 항목의 실제 고위험 날짜 수를 표시합니다.`,
   `${c.days}日間のリスク頻度：最低日だけでなく各項目の高リスク日数を示します。`)];
  for(const key of keys){
   const valid=rows.filter(x=>fin(x?.scores?.[key]));if(!valid.length)continue;
   const bad=valid.filter(x=>x.scores[key]<60),mid=valid.filter(x=>x.scores[key]>=60&&x.scores[key]<80),
    low=valid.reduce((a,b)=>a.scores[key]<=b.scores[key]?a:b);
   out.push(tr(c,`${tr(c,...names[key])}：有效 ${valid.length} 日，高風險 ${bad.length} 日、中風險 ${mid.length} 日；最低 ${low.scores[key]}/100（${low.date}）。`,
    `${tr(c,...names[key])}: ${valid.length} valid days; ${bad.length} high-risk, ${mid.length} moderate; worst ${low.scores[key]}/100 (${low.date}).`,
    `${tr(c,...names[key])}: 유효 ${valid.length}일, 고위험 ${bad.length}일, 중위험 ${mid.length}일, 최저 ${low.scores[key]}점(${low.date}).`,
    `${tr(c,...names[key])}：有効${valid.length}日、高リスク${bad.length}日、中リスク${mid.length}日、最低${low.scores[key]}点（${low.date}）。`));
  }
  return out;
 }
 function explain(context){
  const c=context||{},level=scoreRisk(c.scores?.[c.key]);
  if(level<1)return {lines:[],ledger:[],measured:[]};
  // Distinguish direct scoring constituents from other same-day health flags.
  // E.g. low resting heart rate does not mathematically cause a sleep score;
  // sleep duration is the sleep-specific explanation, the heart result is an
  // accompanying finding that the owner must nevertheless be able to review.
  const directByKey={cardio:['heart','breath','hrv','stable'],
   sleep:['sleep'],activityRecovery:['energy','recovery','calm'],
   rhythm:['stable','calm'],calm:['calm','heart','breath','hrv','sleep'],
   energy:['energy','sleep']};
  const direct=new Set(directByKey[c.key]||[c.key]);
  if(c.key==='energy'&&!(fin(c.scores.sleep)&&c.scores.sleep<80))direct.delete('sleep');
  const chosen=level>=3?keys:level===2?keys.filter(k=>fin(c.scores?.[k])&&c.scores[k]<80):
   keys.filter(k=>k===c.key||fin(c.scores?.[k])&&c.scores[k]<80);
  const ordered=chosen.filter(k=>fin(c.scores?.[k])).sort((a,b)=>
   Number(direct.has(b))-Number(direct.has(a))||c.scores[a]-c.scores[b]);
  const high=keys.filter(k=>fin(c.scores?.[k])&&c.scores[k]<60),med=keys.filter(k=>fin(c.scores?.[k])&&c.scores[k]>=60&&c.scores[k]<80);
  const out=[];if(level>=3)out.push(tr(c,
   `【全部原因與同日問題｜${c.date}】八項中高風險 ${high.length} 項、中風險 ${med.length} 項。先列本頁分數的直接構成依據，再列同日其他監測問題；後者需要注意，但不能假稱它直接造成本項扣分。每組內按低分優先展開全部實測。`,
   `COMPLETE CAUSE REVIEW · ${c.date}: ${high.length} of eight indices high risk, ${med.length} moderate. Direct scoring contributors come first, followed by other same-day problems. Other findings must not be falsely blamed for this particular score.`,
   `전체 원인 및 동시 문제 · ${c.date}: 고위험 ${high.length}개, 중위험 ${med.length}개입니다. 해당 점수의 직접 구성 요소와 같은 날 다른 문제를 구분해 표시합니다.`,
   `全原因と同日の所見・${c.date}：高リスク${high.length}項目、中リスク${med.length}項目。得点の直接要素と、同日の他の所見を分けて表示します。`));
  const periods=periodLines(c);if(level>=3&&periods.length)out.push(...periods);
  const ledger=[],measured=[];
  for(const [idx,k] of ordered.entries()){
   const score=c.scores[k],name=tr(c,...names[k]),sev=severity(c,score);
   const isDirect=direct.has(k);
   const included=(c.source==='20hz-waveform'?real:gallery)[k]||[];
   const observed=included.filter(f=>fin(c.features?.[f]));
   ledger.push({key:k,score,direct:isDirect,available:observed.length,fields:[...observed]});
   const isHealthy=score>=90;
   out.push(tr(c,
    `【${isDirect?'直接原因':'同日其他問題'} ${idx+1}｜${name} ${score}/100｜${sev}】${isHealthy?'此項沒有低分，不應視為主要問題。':isDirect?'這項確實參與本頁分數，以下逐條核對其實測差距。':'這項有偏離，必須完整呈現，但不能把它說成本頁分數的直接扣分來源。'}`,
    `${isDirect?'DIRECT CAUSE':'OTHER SAME-DAY FINDING'} ${idx+1} · ${name} ${score}/100 · ${sev}: ${isHealthy?'Not a low component; do not blame it.':isDirect?'This scored component contributes to the selected metric; review measured differences below.':'A real deviation to report, but not a direct scoring input to this particular metric.'}`,
    `${isDirect?'직접 원인':'동일 날짜의 다른 문제'} ${idx+1} · ${name} ${score}/100 · ${sev}: ${isHealthy?'낮은 항목이 아닙니다.':isDirect?'이 페이지의 점수 구성 요소로 실측값을 확인합니다.':'관련 문제이지만 이 페이지 점수의 직접 감점 요인은 아닙니다.'}`,
    `${isDirect?'直接要因':'同日の他の所見'}${idx+1}・${name} ${score}/100・${sev}：${isHealthy?'低得点ではありません。':isDirect?'このページの得点に関係する実測要素です。':'実際の変化ですが、この得点を直接下げた項目ではありません。'}`));
   if(isHealthy)continue;
   for(const field of observed){const fact=fieldFact(c,field);if(fact){
    out.push(tr(c,`實測依據：${fact}`,`Measured evidence: ${fact}`,`실측 근거: ${fact}`,`実測根拠：${fact}`));
    measured.push({key:k,field,hasReference:fin(c.references?.[field])&&c.references[field]>0});
   }}
   if(!observed.length)out.push(tr(c,
    '【缺乏可核對的原始值】此子分存在，但目前未提供可重算該分的量測特徵；不能虛構數據或百分比作為低分理由。',
    'MISSING MEASUREMENT: This subscore exists, but its underlying measured input is unavailable. A fabricated reading or percentage cannot justify it.',
    '원자료 부족: 점수는 있지만 원인 측정값이 없어 숫자나 비율을 임의로 만들지 않습니다.',
    '元データ不足：得点はありますが測定値がなく、数値や偏差率を捏造しません。'));
   if(level>=2||score<60)out.push(metricInterpretation(c,k));
  }
  const constituents={cardio:['heart','breath','hrv','stable'],activityRecovery:['energy','recovery','calm'],
   rhythm:['stable','calm'],calm:['heart','breath','hrv','sleep']};
  if(level>=3&&constituents[c.key]){
   const seq=constituents[c.key].filter(k=>fin(c.scores?.[k])).sort((a,b)=>c.scores[a]-c.scores[b]);
   const list=seq.map(k=>`${tr(c,...names[k])} ${c.scores[k]}/100`).join(tr(c,'、','; ','、','、'));
   out.push(tr(c,`【這個綜合分真正的構成】${c.keyName} ${c.scores[c.key]}/100 由以下已計分子項共同形成（按低到高）：${list}。低分項與多項中度偏離累積會壓低綜合表現，不能只把責任推給一項。`,
    `ACTUAL COMPOSITE CONTRIBUTORS: ${c.keyName} ${c.scores[c.key]}/100 uses these scored components, worst first: ${list}. Several deviations compound; no one field alone explains the full result.`,
    `종합 점수의 실제 구성: ${c.keyName} ${c.scores[c.key]}/100은 ${list}에 근거하며 여러 편차가 함께 작용합니다.`,
    `総合点の実際の構成：${c.keyName} ${c.scores[c.key]}/100は${list}から成り、複数の変化が重なります。`));
  }
  return {lines:out.filter(Boolean),ledger,measured};
 }
 root.DeepPetCompleteCauses125=Object.freeze({version:'10.125',keys,real,gallery,explain});
})(window);
