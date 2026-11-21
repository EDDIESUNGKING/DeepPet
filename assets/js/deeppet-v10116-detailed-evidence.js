/* DeepPet V10.125: complete measured causes + adaptive graded narration.
 * This layer never assigns a target score, invents acute events, or diagnoses disease.
 */
(function(root){'use strict';
 const L=(tw,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:
   state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const one=x=>finite(x)?(Math.round(x*10)/10).toFixed(1):'—';
 const pct=(x,ref)=>finite(x)&&finite(ref)&&ref>0?Math.round(100*(x-ref)/ref):null;
 const absPct=(x,ref)=>Math.abs(pct(x,ref)??0);
 const currentDate=()=>iso(localDate());
 const all=()=>root.DeepPetSignalScoring?.getDaily?.(state.dog)||[];
 const today=()=>all().find(x=>x?.date===currentDate())||null;
 function period(days){
  // A selected historical day must show THAT day's reasons, not today's.
  const chosen=days===1&&/^\d{4}-\d{2}-\d{2}$/.test(state.deepSelectedDate||'')?state.deepSelectedDate:currentDate();
  const t=Date.parse(chosen+'T12:00:00Z');
  return all().filter(x=>x&&x.date&&Date.parse(x.date+'T12:00:00Z')>t-days*86400000&&
   Date.parse(x.date+'T12:00:00Z')<=t&&finite(x.scores?.physiol)).sort((a,b)=>a.date.localeCompare(b.date));}
 const average=(rows,key)=>{const v=rows.map(x=>x.scores?.[key]).filter(finite);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null;};
 const latest=(rows)=>rows.at(-1)||null;
 const evidence=(row)=>row?.fixtureEvidence?.references?row.fixtureEvidence:null;
 const feature=(row)=>root.DeepPetSignalScoring?.getFeatures?.(state.dog)?.find(x=>x?.date===row?.date)||{};
 const label={heart:()=>L('心跳','heart rate','심박','心拍'),breath:()=>L('呼吸','breathing','호흡','呼吸'),
  hrv:()=>L('心率變異 HRV','heart-rate variability HRV','심박변이도 HRV','心拍変動 HRV'),
  stable:()=>L('心搏節奏穩定度','beat-pattern stability','박동 패턴 안정도','拍動パターンの安定性'),
  sleep:()=>L('睡眠休息','sleep and rest','수면·휴식','睡眠・休息'),
  energy:()=>L('精力與活動','energy and activity','활력·활동','活力・活動'),
  recovery:()=>L('活動後恢復','post-activity recovery','활동 후 회복','活動後の回復'),
  calm:()=>L('放鬆與平穩度','rest and steadiness','휴식·안정도','落ち着きと安定性'),
  cardio:()=>L('心肺綜合狀態','cardio-respiratory condition','심폐 종합 상태','心肺の総合状態'),
  activityRecovery:()=>L('精力與恢復綜合狀態','energy and recovery condition','활력·회복 종합 상태','活力・回復の総合状態'),
  rhythm:()=>L('身體節奏','body rhythm','신체 리듬','身体リズム')};
 const tier=s=>!finite(s)?-1:s<20?4:s<60?3:s<80?2:s<90?1:0;
 function lead(score,key){const subject=label[key]?.()||key;
  const t=tier(score);
  if(t===-1)return L(`${subject}尚無有效讀數。`,`${subject}: no verified reading.`,`${subject}: 유효한 측정이 없습니다.`,`${subject}：有効な測定がありません。`);
  if(t===4)return L(`【最高級別警戒｜極端高風險｜立即處理】${subject}只有 ${score}/100 分！這是極其嚴重的監測偏離，絕不是輕微波動。現在立刻停止額外運動、讓寵物在安全安靜環境休息，親自檢查呼吸、精神、站立與活動能力，逐條核對下面的異常數據。若有呼吸費力、牙齦發藍或倒下，立即送獸醫急診；低分本身並不等於疾病確診。`,
   `CRITICAL ALERT · EXTREME HIGH RISK: ${subject} is only ${score}/100. This is a profound measured deviation. Stop extra exertion now, let the pet rest quietly, and examine breathing, alertness and ability to stand. Review all abnormal readings below. Laboured breathing, blue gums or collapse needs emergency veterinary care; a score is not a diagnosis.`,
   `최고 경계 · 극단적 고위험: ${subject} ${score}/100점으로 매우 심각한 측정 편차입니다. 지금 추가 운동을 중단하고 조용히 쉬게 하며 호흡·의식·기립 상태와 아래 이상 수치를 즉시 확인하세요. 호흡 곤란·푸른 잇몸·쓰러짐은 응급 진료 대상이며 점수만으로 진단하지 않습니다.`,
   `最高警戒・極めて高いリスク：${subject}は${score}/100点です。重大な測定上の変化です。今すぐ運動を中止して安静にし、呼吸・意識・起立能力と以下の数値を確認してください。呼吸困難・青い歯ぐき・虚脱は救急受診が必要ですが点数だけでは診断できません。`);
  if(t===3)return L(`【高度警戒｜高風險｜立即查明】${subject}只有 ${score}/100 分，屬嚴重且不可忽略的監測異常。現在就暫停運動負荷、讓牠安靜休息，核對下方每項偏離數字與最近趨勢；若持續異常或合併精神、呼吸、活動能力下降，應儘快聯絡獸醫。`,
   `HIGH ALERT · HIGH RISK: ${subject} is only ${score}/100. Pause exertion and check the pet now. Review every measured deviation and contact a veterinarian promptly for persistent changes or worsening breathing, alertness or mobility.`,
   `높은 경계 · 고위험: ${subject} ${score}/100점으로 심각한 측정 편차입니다. 지금 운동을 멈추고 쉬게 하며 아래 이상 수치를 확인하세요. 지속되거나 호흡·의식·활동 상태가 나빠지면 신속히 진료받으세요.`,
   `高度警戒・高リスク：${subject}は${score}/100点で重大な測定上の変化があります。今すぐ運動負荷を止めて安静にし、下記の数値を確認してください。持続または症状悪化時は早めに獣医師へ。`);
  if(t===2)return L(`【需要重視・中風險】${subject} ${score}/100 分，已不是完全正常的變化；必須留意主要數據並追蹤是否惡化。`,`MODERATE RISK · TAKE NOTICE: ${subject} is ${score}/100. Measured changes need follow-up and should not be ignored.`,`중위험 · 주의 필요: ${subject} ${score}/100점으로 변화를 추적해야 합니다.`,`中リスク・注意：${subject}は${score}/100点で、変化を追跡する必要があります。`);
  if(t===1)return L(`低風險：${subject} ${score}/100 分，輕度偏離平常，留意變化即可。`,`LOW RISK: ${subject} is ${score}/100, slightly different from usual.`,`저위험: ${subject} ${score}/100점으로 평소와 약간 다릅니다.`,`低リスク：${subject}は${score}/100点で普段と少し異なります。`);
  return L(`健康：${subject} ${score}/100 分，相關量測大致穩定。`,`HEALTHY: ${subject} is ${score}/100; readings are broadly steady.`,`건강: ${subject} ${score}/100점으로 대체로 안정적입니다.`,`健康：${subject}は${score}/100点でおおむね安定しています。`);
 }
 function quantified(key,row){
  const ref=evidence(row)?.references;if(!ref)return [];
  const f=feature(row),s=row.scores||{},raw=typeof demoRecords==='function'?demoRecords(state.dog).find(r=>r.date===row.date)||{}:{};
  const sourceLabel=evidence(row)?.referenceFrom==='declared-initial-case-reference'?
   L('案例的初始參考（尚非成熟個體基準）','initial case reference (not a mature personal baseline)','초기 사례 기준(확립된 개체 기준 아님)','初期ケースの基準（確立した個体基準ではない）'):
   L('較早的有效紀錄','earlier valid observations','이전 유효 기록','以前の有効記録');
  const relevant=(x,refValue,unit,tw,en,ko,ja)=>{
   if(!finite(x)||!finite(refValue)||refValue<=0)return null;
   const localizedUnit=unit==='次/分'?L('次／分','breaths/min','회/분','回/分'):
    unit==='小時'?L('小時','hours','시간','時間'):
    unit==='活動單位'?L('活動單位','activity units','활동 단위','活動単位'):unit;
   const change=pct(x,refValue),direction=change>=0?L('高','higher','높','高'):L('低','lower','낮','低');
   return L(`${tw}實測 ${one(x)} ${localizedUnit}，比對${sourceLabel}約 ${one(refValue)} ${localizedUnit}，相差 ${absPct(x,refValue)}%（${change>=0?'偏高':'偏低'}）。`,
    `${en}: measured ${one(x)} ${localizedUnit} versus ${sourceLabel} of ${one(refValue)} ${localizedUnit} (${absPct(x,refValue)}% ${change>=0?'higher':'lower'}).`,
    `${ko}: 측정 ${one(x)} ${localizedUnit}, ${sourceLabel} ${one(refValue)} ${localizedUnit} 대비 ${absPct(x,refValue)}% ${change>=0?'높음':'낮음'}.`,
    `${ja}：測定 ${one(x)} ${localizedUnit}、${sourceLabel} ${one(refValue)} ${localizedUnit} と比べ ${absPct(x,refValue)}% ${change>=0?'高い':'低い'}。`);
  };
  const m={
   heart:()=>[relevant(f.quietHeartRate,ref.heart,'bpm','安靜心率','Resting heart rate','안정 시 심박','安静時心拍'),
    L(`這不是只「略快」：安靜心跳已比牠較早的有效參考高出約 ${absPct(f.quietHeartRate,ref.heart)}%，因此心率子分項降至 ${s.heart}/100。請在完全安靜時再次觀察，確認是否持續心跳過快、精神變差或不願活動。`,
     `This is not a small change: the resting rate is about ${absPct(f.quietHeartRate,ref.heart)}% above this pet's reference, aligning with the ${s.heart}/100 heart score. Recheck at rest and watch for weakness or persistent rapid breathing.`,
     `단순한 작은 차이가 아닙니다. 안정 시 심박이 개별 기준보다 약 ${absPct(f.quietHeartRate,ref.heart)}% 높아 심박 점수가 ${s.heart}/100입니다. 안정 시 다시 확인하고 무기력 또는 지속적인 빠른 호흡을 살펴보세요.`,
     `わずかな差ではありません。安静時心拍が個体基準より約${absPct(f.quietHeartRate,ref.heart)}%高く、心拍評価は${s.heart}/100です。安静時に再確認してください。`),
     finite(f.heartRate)&&finite(f.quietHeartRate)?L(`同日全天心率平均約 ${one(f.heartRate)} bpm，安靜時仍約 ${one(f.quietHeartRate)} bpm；連相對安靜的時段都沒有回到牠較早約 ${one(ref.heart)} bpm 的有效參考水平。這是當日實際趨勢，不能只用「運動後暫時偏快」帶過。`,`Day-wide mean heart rate was ${one(f.heartRate)} bpm; even quiet-time rate was ${one(f.quietHeartRate)} bpm versus an earlier ${one(ref.heart)} bpm reference. This change is not explained away by post-exercise acceleration alone.`,`하루 평균 심박 ${one(f.heartRate)}bpm, 안정 시에도 ${one(f.quietHeartRate)}bpm으로 초기 기준 ${one(ref.heart)}bpm보다 높습니다.`,`終日平均心拍${one(f.heartRate)}bpm、安静時も${one(f.quietHeartRate)}bpmで、初期基準${one(ref.heart)}bpmより高い状態です。`):null],
   breath:()=>[relevant(f.quietBreathRate,ref.breath,'次/分','安靜呼吸','Resting breathing','안정 시 호흡','安静時呼吸'),
    L(`安靜時呼吸與自己的參考差距很大，呼吸只有 ${s.breath}/100 分。若同時出現呼吸費力、張口喘氣、牙齦發紫或無法平臥，應立即尋求獸醫急診。`,
     `The resting breathing change is substantial and the breathing component is ${s.breath}/100. Laboured breathing, open-mouth distress, blue gums or inability to lie comfortably warrants emergency veterinary care.`,
     `안정 시 호흡이 개별 기준과 크게 다르고 호흡 점수는 ${s.breath}/100입니다. 힘든 호흡·입을 벌리고 헐떡임·푸른 잇몸이 있으면 즉시 응급 진료를 받으세요.`,
     `安静時呼吸が個体基準から大きく外れ、呼吸評価は${s.breath}/100です。呼吸困難、口を開けた苦しそうな呼吸、歯ぐきの青紫色は直ちに救急受診してください。`),
     finite(f.breathRate)&&finite(f.quietBreathRate)?L(`同日全天呼吸平均約 ${one(f.breathRate)} 次／分，安靜時仍達 ${one(f.quietBreathRate)} 次／分；呼吸加快不只出現在活動時。尤其呼吸只有 ${s.breath}/100，應立刻觀察呼吸是否費力，而不只是關注數字。`,`Day-wide breathing averaged ${one(f.breathRate)}/min, and quiet-time breathing remained ${one(f.quietBreathRate)}/min. The faster pattern was not confined to active periods; check breathing effort as well as the ${s.breath}/100 score.`,`하루 평균 호흡 ${one(f.breathRate)}회/분, 안정 시에도 ${one(f.quietBreathRate)}회/분으로 높아 활동 중에만 생긴 변화가 아닙니다.`,`終日平均呼吸${one(f.breathRate)}回/分、安静時も${one(f.quietBreathRate)}回/分で、活動時だけの変化ではありません。`):null],
   hrv:()=>[relevant(f.rmssd,ref.rmssd,'ms','RMSSD','RMSSD','RMSSD','RMSSD'),
     relevant(f.sdnn,ref.sdnn,'ms','SDNN','SDNN','SDNN','SDNN'),
     L(`兩項 HRV 觀測都偏低時，不能只用一句「恢復指標下降」概括：RMSSD 與 SDNN 同時明顯縮小，才使 HRV 合成子分項降至 ${s.hrv}/100。這表示心搏間期變化模式與早期紀錄差距很大，不能據此診斷特定疾病。`,
      `Both HRV summaries derived from beat intervals are low; RMSSD and SDNN decreased together, giving HRV ${s.hrv}/100. They are related summaries, not two independent sensor channels or a disease diagnosis.`,
      `같은 박동 간격 기록에서 산출한 RMSSD와 SDNN이 함께 낮아 HRV 점수는 ${s.hrv}/100입니다. 두 값은 독립 센서가 아니며 질병 진단도 아닙니다.`,
      `RMSSDとSDNNがともに低く、HRVは${s.hrv}/100点です。拍動間隔の変動が過去と大きく違うことを示しますが、診断ではありません。`)],
   stable:()=>[relevant(f.sdnn,ref.sdnn,'ms','心搏間期變化 SDNN','Beat-interval variation SDNN','박동 간격 변동 SDNN','拍動間隔変動 SDNN'),
    L(`穩定度只有 ${s.stable}/100，不是單次「起伏較大」就扣成低分，而是有效 SDNN 觀測與早期基準差距極大。這是機械訊號的變化一致性指標，並非心電圖心律不整診斷。`,
     `Stability is ${s.stable}/100 because verified SDNN departs substantially from the earlier reference, not because of one isolated fluctuation. This is not an ECG arrhythmia diagnosis.`,
     `안정도 ${s.stable}/100은 단일 변동 때문이 아니라 SDNN이 과거 기준에서 크게 벗어났기 때문입니다. 심전도 부정맥 진단이 아닙니다.`,
     `安定度${s.stable}/100は、単発の揺れではなくSDNNが過去の基準から大きく外れているためです。心電図による不整脈診断ではありません。`)],
   sleep:()=>{const idx=typeof demoRecords==='function'?demoRecords(state.dog).findIndex(r=>r.date===row.date):-1;
     const night=idx>=0&&typeof dpNightSleepStats==='function'?dpNightSleepStats(idx):null;
     return [relevant(f.restHours,ref.sleep,'小時','夜間休息','Night-time quiet rest','야간 휴식','夜間休息'),
      night&&finite(night.wakes)?L(`同一晚的休息記錄還出現 ${night.wakes} 次中斷；時間大幅縮短又多次被打斷，值得立即核對睡眠環境、夜間呼吸及精神食慾。`,
       `That night also had ${night.wakes} interruptions. The shortened rest and repeated breaks deserve prompt review of the sleeping environment, breathing, energy and appetite.`,
       `그날 밤 휴식도 ${night.wakes}회 중단되었습니다. 휴식 시간이 크게 줄고 여러 번 끊겨 환경·야간 호흡·활력을 빠르게 확인하세요.`,
       `同じ夜に${night.wakes}回の中断もあります。休息短縮と中断の双方を確認してください。`):null,
      L(`睡眠 ${s.sleep}/100 分，主要來自可核對的休息時長大幅縮短；不是單純說「休息了幾小時」就足以交代。若持續多晚，請儘快諮詢獸醫。`,
       `Sleep is ${s.sleep}/100, driven by a substantial decrease in observed quiet-rest duration. Repeated nights of this pattern warrant prompt veterinary advice.`,
       `수면 ${s.sleep}/100은 확인된 휴식 시간의 큰 감소에서 비롯됩니다. 여러 밤 지속되면 수의사 상담을 권합니다.`,
       `睡眠${s.sleep}/100は休息時間の大幅な短縮が中心です。続く場合は早めに獣医師へ相談してください。`)];},
   energy:()=>[relevant(raw.activity,ref.activity,'活動單位','每日活動量','Daily movement','하루 활동량','日中活動量'),
    L(`活動量顯著少於自己的早期紀錄，同一天的休息也不足，兩者共同把精力子分項壓到 ${s.energy}/100。若不願起身、明顯無力或同時呼吸異常，應及時聯絡獸醫。`,
     `Movement is substantially below the earlier record, with reduced rest as well; together they correspond to an energy score of ${s.energy}/100. Seek prompt advice for weakness or concurrent breathing difficulty.`,
     `활동량과 휴식이 함께 줄어 활력 점수는 ${s.energy}/100입니다. 일어나기 어려워하거나 호흡이 힘들면 신속히 진료받으세요.`,
     `活動量と休息がともに低下し、活力は${s.energy}/100です。起き上がれない、呼吸が苦しい場合は早めに受診してください。`),
     relevant(f.restHours,ref.sleep,'小時','同日有效休息','Same-day recorded quiet rest','같은 날 유효 휴식','同日の有効休息')],
   recovery:()=>[relevant(f.recoveryDrop,ref.recovery,'bpm','運動後兩分鐘心率下降','Two-minute post-activity heart-rate drop','운동 후 2분 심박 감소','運動後2分の心拍低下'),
    L(`這次心率回落幅度比早期類似紀錄少約 ${absPct(f.recoveryDrop,ref.recovery)}%，所以活動後恢復分項是 ${s.recovery}/100。這項有偏差，但若仍高於其他嚴重低分子項，不能誤寫成它單獨造成整體極低分。`,
     `The two-minute fall is about ${absPct(f.recoveryDrop,ref.recovery)}% smaller than earlier comparable episodes, giving recovery ${s.recovery}/100. It should not be blamed alone for an extremely low overall result if other components are much worse.`,
     `2분 심박 감소폭이 과거 유사 기록보다 약 ${absPct(f.recoveryDrop,ref.recovery)}% 작아 회복 점수는 ${s.recovery}/100입니다. 다른 항목이 더 낮다면 전체 저점의 유일한 원인으로 설명하지 않습니다.`,
     `2分間の心拍低下が過去より約${absPct(f.recoveryDrop,ref.recovery)}%小さく、回復は${s.recovery}/100です。他の項目がさらに低い場合、これだけを原因としません。`)],
   calm:()=>[L(`安靜時心率 ${one(f.quietHeartRate)} bpm（參考 ${one(ref.heart)}）、呼吸 ${one(f.quietBreathRate)} 次/分（參考 ${one(ref.breath)}）；HRV ${s.hrv}/100、心率 ${s.heart}/100、呼吸 ${s.breath}/100、睡眠 ${s.sleep}/100 同時拉低放鬆與平穩度至 ${s.calm}/100。`,
     `At rest: heart ${one(f.quietHeartRate)} bpm (reference ${one(ref.heart)}), breathing ${one(f.quietBreathRate)}/min (reference ${one(ref.breath)}). HRV ${s.hrv}, heart ${s.heart}, breathing ${s.breath} and sleep ${s.sleep} combine to produce a calm score of ${s.calm}/100.`,
     `안정 시 심박 ${one(f.quietHeartRate)}(기준 ${one(ref.heart)}), 호흡 ${one(f.quietBreathRate)}(기준 ${one(ref.breath)}). HRV ${s.hrv}, 심박 ${s.heart}, 호흡 ${s.breath}, 휴식 ${s.sleep}이 함께 낮아 휴식 안정도가 ${s.calm}/100입니다.`,
     `安静時心拍${one(f.quietHeartRate)}（基準${one(ref.heart)}）、呼吸${one(f.quietBreathRate)}（基準${one(ref.breath)}）。HRV${s.hrv}、心拍${s.heart}、呼吸${s.breath}、睡眠${s.sleep}が重なり安定度${s.calm}/100です。`)],
   cardio:()=>[L(`心肺有四項實際評分依據：心跳 ${s.heart}/100、呼吸 ${s.breath}/100、HRV ${s.hrv}/100、心搏穩定度 ${s.stable}/100。心跳及呼吸是主要觀察，HRV 與節奏穩定度也參與綜合評估及最低弱項保護，所以心肺才降至 ${s.cardio}/100；不能只說「心跳呼吸偏快」。其中 HRV 與穩定度共用部分心搏間期資料，不是四個獨立感測器。`,
    `Cardio is supported by four measured subscores: heart ${s.heart}/100, breathing ${s.breath}/100, HRV ${s.hrv}/100, and beat stability ${s.stable}/100. Heart and breathing are primary inputs; HRV, stability and protection against a very weak component also affect the ${s.cardio}/100 result. HRV and stability partly share beat-interval observations, rather than being four independent sensors.`,
    `심폐의 네 근거는 심박 ${s.heart}/100, 호흡 ${s.breath}/100, HRV ${s.hrv}/100, 박동 안정도 ${s.stable}/100입니다. 심박·호흡이 주요 입력이며 HRV·안정도와 취약 지표 보호가 종합 ${s.cardio}/100에 함께 영향을 줍니다. 이들은 모두 독립 센서가 아닙니다.`,
    `心肺の根拠は心拍${s.heart}/100、呼吸${s.breath}/100、HRV${s.hrv}/100、拍動安定度${s.stable}/100です。心拍・呼吸が主な入力で、HRV・安定度と特に低い項目の補正も総合${s.cardio}/100に影響します。すべて独立センサーではありません。`),
    ...quantified('heart',row).slice(0,1),...quantified('breath',row).slice(0,1),
    ...quantified('hrv',row).slice(0,2)],
   activityRecovery:()=>[L(`構成項目：精力 ${s.energy}/100、活動後恢復 ${s.recovery}/100、放鬆平穩 ${s.calm}/100。精力與平穩兩方面同時大幅下降，使綜合分數僅 ${s.activityRecovery}/100；恢復並非唯一原因。`,
    `Contributors: energy ${s.energy}, post-activity recovery ${s.recovery}, steadiness ${s.calm} out of 100. Low energy and calm occur together, producing ${s.activityRecovery}/100; recovery alone is not the cause.`,
    `활력 ${s.energy}, 활동 후 회복 ${s.recovery}, 안정도 ${s.calm}점입니다. 활력과 안정도가 함께 크게 낮아 종합 ${s.activityRecovery}/100이며 회복만의 문제는 아닙니다.`,
    `活力${s.energy}、回復${s.recovery}、安定性${s.calm}点。活力と安定性の低下が重なり総合${s.activityRecovery}/100です。`),
    ...quantified('energy',row).slice(0,1),...quantified('recovery',row).slice(0,1),
    ...quantified('calm',row).slice(0,1)],
   rhythm:()=>[L(`心搏穩定度 ${s.stable}/100、放鬆與平穩度 ${s.calm}/100，同時低分才使身體節奏只有 ${s.rhythm}/100。這是研究型趨勢指標，不能代替心電圖或獸醫診察。`,
    `Stability ${s.stable}/100 and calm ${s.calm}/100 are both low, producing body rhythm ${s.rhythm}/100. This research trend does not replace an ECG or veterinary assessment.`,
    `박동 안정도 ${s.stable}점, 휴식 안정도 ${s.calm}점이 모두 낮아 신체 리듬 ${s.rhythm}/100입니다. 심전도 진단은 아닙니다.`,
    `拍動の安定性${s.stable}点、落ち着き${s.calm}点がともに低いため身体リズム${s.rhythm}/100です。心電図診断ではありません。`)]
  };
  return (m[key]?.()||[]).filter(Boolean);
 }
 const components={cardio:['heart','breath','hrv','stable'],activityRecovery:['energy','recovery','calm'],
  calm:['heart','breath','hrv','sleep'],rhythm:['stable','calm']};
 function contributingScores(key,rows){
  const fields=components[key];if(!fields)return null;
  const entries=fields.map(k=>({k,n:average(rows,k)})).filter(x=>finite(x.n)).sort((a,b)=>a.n-b.n);
  if(!entries.length)return null;
  const fmt=items=>items.map(x=>`${label[x.k]?.()||x.k} ${x.n}/100`).join(L('、',', ','、','、'));
  const high=entries.filter(x=>x.n<60),medium=entries.filter(x=>x.n>=60&&x.n<80);
  const low=entries.filter(x=>x.n>=80&&x.n<90),healthy=entries.filter(x=>x.n>=90);
  return L(`逐項核對：高風險 ${high.length} 項${high.length?'：'+fmt(high):'（無）'}；中風險 ${medium.length} 項${medium.length?'：'+fmt(medium):'（無）'}；低風險 ${low.length} 項${low.length?'：'+fmt(low):'（無）'}；健康 ${healthy.length} 項${healthy.length?'：'+fmt(healthy):'（無）'}。高風險與多個中風險偏離可同時拉低綜合分數，但共用原始資料的指標不能當成完全獨立的異常。`,
   `Verified components by severity: high risk ${high.length}${high.length?': '+fmt(high):' (none)'}; moderate risk ${medium.length}${medium.length?': '+fmt(medium):' (none)'}; low risk ${low.length}${low.length?': '+fmt(low):' (none)'}; healthy ${healthy.length}${healthy.length?': '+fmt(healthy):' (none)'}. Severe and multiple moderate changes can compound. Some components share source observations.`,
   `실측 세부 항목: 고위험 ${high.length}개${high.length?': '+fmt(high):' (없음)'}; 중위험 ${medium.length}개${medium.length?': '+fmt(medium):' (없음)'}; 저위험 ${low.length}개${low.length?': '+fmt(low):' (없음)'}; 건강 ${healthy.length}개${healthy.length?': '+fmt(healthy):' (없음)'}. 고위험과 여러 중위험 변화가 함께 종합 점수를 낮출 수 있으며 일부 원자료가 겹칩니다.`,
   `実測の内訳：高リスク${high.length}項目${high.length?'：'+fmt(high):'（なし）'}；中リスク${medium.length}項目${medium.length?'：'+fmt(medium):'（なし）'}；低リスク${low.length}項目${low.length?'：'+fmt(low):'（なし）'}；健康${healthy.length}項目${healthy.length?'：'+fmt(healthy):'（なし）'}。高リスクと複数の中リスクの重なりが総合点に影響します。元データを共有する項目もあります。`);
 }
 // The owner must be able to see the COMPLETE eight-indicator burden behind
 // a very poor daily score.  Do not relabel moderate (60–79) readings as
 // severe, and do not interpret related derived scores as independent sensors.
 const measuredDomains=['heart','breath','hrv','stable','sleep','energy','recovery','calm'];
 function allIndicatorBurden(row){
  if(!row?.scores)return null;
  const entries=measuredDomains.map(k=>({k,n:row.scores[k]})).filter(x=>finite(x.n)).sort((a,b)=>a.n-b.n);
  if(!entries.length)return null;
  const get=(lo,hi)=>entries.filter(x=>x.n>=lo&&x.n<hi);
  const hi=get(0,60),mid=get(60,80),mild=get(80,90),ok=get(90,101),unknown=measuredDomains.length-entries.length;
  const list=xs=>xs.map(x=>`${label[x.k]?.()||x.k} ${x.n}/100`).join(L('、',', ','、','、'));
  return L(`【全盤八項數據核對｜${row.date}】已核實 ${entries.length} 項：高風險 ${hi.length} 項${hi.length?'（'+list(hi)+'）':''}；中風險 ${mid.length} 項${mid.length?'（'+list(mid)+'）':''}；低風險 ${mild.length} 項${mild.length?'（'+list(mild)+'）':''}；健康 ${ok.length} 項${ok.length?'（'+list(ok)+'）':''}${unknown?'；另有 '+unknown+' 項缺有效資料':''}。這些是同一日真實的子分數，嚴重偏離和多項中度偏離共同解釋低分；衍生指標可能共用原始數據。`,
   `ALL EIGHT MONITORED SUBSCORES · ${row.date}: ${entries.length} verified. High risk ${hi.length}${hi.length?' ('+list(hi)+')':''}; moderate ${mid.length}${mid.length?' ('+list(mid)+')':''}; low ${mild.length}${mild.length?' ('+list(mild)+')':''}; healthy ${ok.length}${ok.length?' ('+list(ok)+')':''}${unknown?'; '+unknown+' unavailable':''}. Severe and multiple moderate deviations account for a poor day; derived indices can share raw observations.`,
   `8개 관찰 지표 전체 점검 · ${row.date}: 유효 ${entries.length}개. 고위험 ${hi.length}개${hi.length?' ('+list(hi)+')':''}; 중위험 ${mid.length}개${mid.length?' ('+list(mid)+')':''}; 저위험 ${mild.length}개${mild.length?' ('+list(mild)+')':''}; 건강 ${ok.length}개${ok.length?' ('+list(ok)+')':''}${unknown?'; 결측 '+unknown+'개':''}. 심한 이상과 여러 중등도 변화가 함께 낮은 점수의 근거가 됩니다. 일부 파생 지표의 원자료는 중복됩니다.`,
   `8つの観測指標の全件照合・${row.date}：有効${entries.length}項目。高リスク${hi.length}件${hi.length?'（'+list(hi)+'）':''}、中リスク${mid.length}件${mid.length?'（'+list(mid)+'）':''}、低リスク${mild.length}件${mild.length?'（'+list(mild)+'）':''}、健康${ok.length}件${ok.length?'（'+list(ok)+'）':''}${unknown?'、欠測'+unknown+'件':''}。複数の中程度と重大な変化が低得点の根拠となり、一部は元データを共有します。`);
 }
 // Production copy is assembled from a 16-band catalog and scored evidence,
 // never hard-coded for Leo, Coco, or any other profile. The adapter keeps
 // real collar reference provenance separate from gallery fixtures.
 function adaptiveLines(key,row,days,periodRows=[]){
  const writer=root.DeepPetAdaptiveRisk124;
  if(!writer?.describe||!row?.scores||!finite(row.scores[key]))return [];
  const live=row.source==='20hz-waveform',own=evidence(row)?.references||{},base=row.baseline?.references||{},f=feature(row);
  const lookup=(field,oldKey)=>finite(base[field]?.ref)?base[field].ref:finite(own[oldKey])?own[oldKey]:null;
  const references={quietHeartRate:lookup('quietHeartRate','heart'),quietBreathRate:lookup('quietBreathRate','breath'),
   rmssd:lookup('rmssd','rmssd'),sdnn:lookup('sdnn','sdnn'),restHours:lookup('restHours','sleep'),
   recoveryDrop:lookup('recoveryDrop','recovery'),motionMean:lookup('motionMean','activity'),
   quietRhythm:lookup('quietRhythm','quietRhythm')};
  let raw=null,idx=-1;
  if(!live&&typeof demoRecords==='function'){
   const records=demoRecords(state.dog)||[];idx=records.findIndex(x=>x?.date===row.date);
   raw=idx>=0?records[idx]:null;
   references.activity=lookup('activity','activity');
  }
  const restInterruptions=live?f.restInterruptions:idx>=0&&typeof dpNightSleepStats==='function'?
   dpNightSleepStats(idx)?.wakes:null;
  const chosenFeature={...f};if(!live&&finite(raw?.activity))chosenFeature.activity=raw.activity;
  const history=all().filter(x=>x?.date<=row.date&&x?.source===row.source&&finite(x?.scores?.[key]));
  const context={key,keyName:label[key]?.()||key,score:row.scores[key],date:row.date,scores:row.scores,
   source:row.source,features:chosenFeature,references,days,isCurrent:row.date===currentDate(),
   restInterruptions,history,periodRows,translate:(tw,en,ko,ja)=>L(tw,en,ko,ja)};
  // Explain every recorded contributor BEFORE the score-band warning. For a
  // severe result this is a complete 8-item ledger, with all comparable raw
  // features, including the actual direction and magnitude of each change.
  const plain=root.DeepPetPlainReasons126?.explain?.(context)||[];
  const causes=root.DeepPetCompleteCauses125?.explain?.(context)?.lines||[];
  return [...plain,...causes,...writer.describe(context).lines];
 }
 // The pre-existing display-case expansions describe specific directions.
 // Only use them when the selected date actually supports that direction.
 // Otherwise the adaptive engine provides evidence-matched alternate language.
 function legacyDirectionMatches(key,row){
  const s=row?.scores||{},f=feature(row),r=evidence(row)?.references||{};
  const ratio=(value,base)=>finite(value)&&finite(base)&&base>0?(value-base)/base:null;
  const rises=(value,base)=>{const d=ratio(value,base);return d!==null&&d>=0.05;};
  const falls=(value,base)=>{const d=ratio(value,base);return d!==null&&d<=-0.05;};
  const raw=typeof demoRecords==='function'?demoRecords(state.dog)?.find(x=>x.date===row.date):null;
  switch(key){
   case 'heart':return rises(f.quietHeartRate,r.heart);
   case 'breath':return rises(f.quietBreathRate,r.breath);
   case 'hrv':return falls(f.rmssd,r.rmssd)&&falls(f.sdnn,r.sdnn);
   case 'stable':return falls(f.sdnn,r.sdnn);
   case 'sleep':return falls(f.restHours,r.sleep);
   case 'energy':return falls(raw?.activity,r.activity)&&finite(s.sleep)&&s.sleep<60;
   case 'recovery':return falls(f.recoveryDrop,r.recovery);
   case 'calm':return rises(f.quietHeartRate,r.heart)&&rises(f.quietBreathRate,r.breath)&&finite(s.hrv)&&s.hrv<60;
   case 'cardio':return ['heart','breath','hrv','stable'].filter(k=>finite(s[k])&&s[k]<80).length>=2;
   case 'activityRecovery':return ['energy','calm','recovery'].filter(k=>finite(s[k])&&s[k]<80).length>=2;
   case 'rhythm':return finite(s.stable)&&s.stable<80&&finite(s.calm)&&s.calm<80;
   default:return true;
  }
 }
 function severityReasons(key,row){
  if(!legacyDirectionMatches(key,row))return [];
  const s=row.scores||{},f=feature(row),ref=evidence(row)?.references||{};
  const change=(v,b)=>finite(v)&&finite(b)&&b>0?`${absPct(v,b)}%`:L('明顯','substantially','크게','大きく');
  const reasons={
   heart:()=>[
    L(`這是安靜狀態下的心跳升高，並非僅因跑動後暫時變快；相對個體參考上升 ${change(f.quietHeartRate,ref.heart)}，高風險分數與這項實測偏差相互對應。`,`The heart rate is elevated while resting, not merely after activity. It is ${change(f.quietHeartRate,ref.heart)} above this pet's own reference and corresponds to a high-risk heart score.`,`운동 직후가 아니라 안정 중 심박이 기준보다 ${change(f.quietHeartRate,ref.heart)} 높습니다.`,`운動後ではなく安静時の心拍が個体基準を${change(f.quietHeartRate,ref.heart)}上回っています。`),
    L('心跳長時間偏快可能伴隨不適、疼痛、緊張或呼吸負擔，單憑項圈資料無法確定原因；若安靜時仍持續偏快，請儘快向獸醫核對。','Prolonged rapid resting heartbeats can accompany discomfort, pain, stress or breathing strain; a collar cannot identify the cause. Promptly seek veterinary assessment if persistent.','안정 시 빠른 심박이 지속되면 불편감·통증·스트레스·호흡 부담 등을 수의사와 확인하세요.','安静時の頻脈が続く場合は、痛みや呼吸の負担などを獣医師に確認してください。')],
   breath:()=>[
    L(`安靜時呼吸比自己的參考加快 ${change(f.quietBreathRate,ref.breath)}，且呼吸子分只有 ${s.breath}/100；這種差距不能輕描淡寫成「稍微偏快」。`,`Resting breathing is ${change(f.quietBreathRate,ref.breath)} faster than its own reference, with a breathing score of ${s.breath}/100. This is much more than a slight change.`,`안정 시 호흡이 기준보다 ${change(f.quietBreathRate,ref.breath)} 빨라졌으며 호흡 점수는 ${s.breath}/100입니다.`,`安静時呼吸が基準より${change(f.quietBreathRate,ref.breath)}速く、呼吸評価は${s.breath}/100です。`),
    L('優先觀察是否在沒有運動、炎熱或興奮的情況下仍持續急促；若呼吸明顯費力、張口喘氣、牙齦發藍或無法平躺，立即就診獸醫急診。','Confirm whether rapid breathing persists without exercise, heat or excitement. Laboured breathing, open-mouth distress, blue gums or inability to lie flat needs emergency veterinary care.','운동·더위·흥분 없이도 빠른 호흡이 지속되는지 확인하세요. 힘든 호흡·푸른 잇몸·편히 눕지 못함은 응급 진료가 필요합니다.','運動・暑さ・興奮がなくても続くか確認し、呼吸困難や青い歯ぐきは救急受診してください。')],
   hrv:()=>[
    L(`RMSSD 與 SDNN 兩項都顯著降低：前者約下降 ${change(f.rmssd,ref.rmssd)}，後者約下降 ${change(f.sdnn,ref.sdnn)}。這是同一批心搏間期紀錄的兩種統計結果同時偏離，不能誤稱為兩個獨立感測器，更不能只寫「恢復指標下降」。`,`Two related HRV statistics fell sharply: RMSSD by about ${change(f.rmssd,ref.rmssd)} and SDNN by about ${change(f.sdnn,ref.sdnn)}. Both come from beat-interval recordings, not two independent sensors; together they explain the low HRV score.`,`RMSSD는 약 ${change(f.rmssd,ref.rmssd)}, SDNN은 약 ${change(f.sdnn,ref.sdnn)} 감소했습니다. 같은 박동 간격 자료의 서로 다른 통계이므로 독립 센서 두 개를 뜻하지 않습니다.`,`RMSSDは約${change(f.rmssd,ref.rmssd)}、SDNNは約${change(f.sdnn,ref.sdnn)}低下。同じ拍動間隔データから得た異なる統計であり、独立した2つのセンサーではありません。`),
    L('安靜時心搏間期的自然變化明顯縮小，值得連同睡眠不足、安靜心率與佩戴品質一併追蹤；HRV 低分本身不是某種心臟病的確診。','The normally varying intervals between beats have narrowed. Review rest, heart rate and signal quality together; this does not itself diagnose cardiac disease.','박동 간격 변동이 크게 줄었습니다. 수면·심박·신호 품질과 함께 확인해야 하며 심장 질환 진단은 아닙니다.','拍動間隔の変動が大きく縮小しています。睡眠・心拍・測定品質とともに確認してください。')],
   stable:()=>[
    L(`與參考相比，SDNN 約下降 ${change(f.sdnn,ref.sdnn)}，表示可量測的心搏間期變化大幅縮小；這裡真正異常的是「變化不足」，不能誤寫成單純起伏很大。`,`SDNN is about ${change(f.sdnn,ref.sdnn)} lower, meaning measured beat-interval variation narrowed markedly. Calling this only a bigger fluctuation would be inaccurate.`,`SDNN이 약 ${change(f.sdnn,ref.sdnn)} 감소해 박동 간격 변동이 크게 줄었습니다. 단순한 큰 흔들림이 아닙니다.`,`SDNNが約${change(f.sdnn,ref.sdnn)}低下し、拍動間隔の変動が大幅に縮小しています。`),
    L('這項低分應與 HRV、安靜心跳和訊號品質交叉比對；它不是心電圖，也不能單靠它判定心律不整。','Cross-check this with HRV, resting heart rate and signal quality. A collar variability trend is not an ECG arrhythmia diagnosis.','HRV·안정 시 심박·신호 품질을 함께 비교하세요. 심전도 진단을 대신하지 않습니다.','HRV・安静時心拍・信号品質と照合してください。心電図の診断ではありません。')],
   sleep:()=>[
    L(`有效休息時間比早期參考縮短約 ${change(f.restHours,ref.sleep)}，表示本次可記錄的安靜休息顯著不足；只有 ${s.sleep}/100 分的主因是這個大幅落差，不是僅僅「昨晚睡了幾小時」。`,`Recorded quiet rest is about ${change(f.restHours,ref.sleep)} shorter than the earlier reference, a substantial loss of recovery time. That measured deficit underlies the ${s.sleep}/100 sleep score.`,`유효 휴식 시간이 과거 기준보다 약 ${change(f.restHours,ref.sleep)} 짧아 수면 점수는 ${s.sleep}/100입니다.`,`記録された休息時間が基準より約${change(f.restHours,ref.sleep)}短く、睡眠スコアは${s.sleep}/100です。`),
    L('休息時間大幅縮短若連續出現，可能影響白天精神、活動意願與恢復；請查看夜間是否頻繁醒來、環境是否干擾，以及是否合併呼吸異常。','Repeatedly shortened rest may affect daytime energy, willingness to move and recovery. Check interruptions, the sleeping environment and concurrent breathing changes.','짧은 휴식이 반복되면 낮의 활력·활동·회복에 영향을 줄 수 있습니다. 중단 횟수와 호흡을 확인하세요.','休息短縮が続くと日中の元気や回復に影響し得ます。夜間の中断や呼吸も確認してください。')],
   energy:()=>[
    L(`每日活動量比個體參考少約 ${change((typeof demoRecords==='function'?demoRecords(state.dog).find(x=>x.date===row.date)?.activity:null),ref.activity)}，同一天睡眠休息也只有 ${s.sleep}/100。活動量與休息雙重下降，使精力項目降至 ${s.energy}/100。`,`Daily movement is far below its own reference, and sleep on the same date scores only ${s.sleep}/100. Poor activity and insufficient rest together align with energy ${s.energy}/100.`,`하루 활동량이 기준보다 크게 줄고 같은 날 수면도 ${s.sleep}/100으로 낮아 활력 점수는 ${s.energy}/100입니다.`,`活動量が大きく減り、同日の睡眠も${s.sleep}/100点で、活力は${s.energy}/100です。`),
    L('若牠比平時明顯不願走動、起身困難，或者精力下降又合併呼吸急促，請儘快讓獸醫評估；不應自行以更多運動來「補分」。','If reluctant to move, struggling to rise, or less active with rapid breathing, seek veterinary advice promptly; do not force exercise to improve a score.','움직이기 싫어하거나 일어나기 어렵고 빠른 호흡까지 동반된다면 빨리 진료받으세요.','動きたがらない、立てない、呼吸が速い場合は早めに受診し、無理に運動させないでください。')],
   recovery:()=>[
    L(`同樣觀察活動結束後兩分鐘，這次心率下降幅度比可比參考少約 ${change(f.recoveryDrop,ref.recovery)}，代表心率回落得較慢，因此恢復分項為 ${s.recovery}/100。`,`Over the same two minutes after activity, the heart-rate fall was about ${change(f.recoveryDrop,ref.recovery)} smaller than comparable earlier readings: a slower return, corresponding to recovery ${s.recovery}/100.`,`활동 후 같은 2분 동안 심박 감소폭이 과거 대비 약 ${change(f.recoveryDrop,ref.recovery)} 작아 회복 점수는 ${s.recovery}/100입니다.`,`活動後の同じ2分間で心拍低下幅が過去より約${change(f.recoveryDrop,ref.recovery)}小さく、回復${s.recovery}/100です。`),
    L('應對照相近的活動強度與佩戴品質，再看是否連續多次恢復較慢；若同時出現喘得厲害、虛弱或倒下，立即就醫。','Compare similar activity levels and measurement quality, then check whether the slower recovery persists. Severe breathlessness, weakness or collapse needs urgent care.','비슷한 활동 강도에서 반복 확인하세요. 심한 호흡 곤란·쇠약·쓰러짐은 응급 진료가 필요합니다.','同程度の活動で再確認してください。強い息切れや虚脱があれば緊急受診してください。')],
   calm:()=>[
    L(`安靜時心跳比參考快約 ${change(f.quietHeartRate,ref.heart)}，呼吸快約 ${change(f.quietBreathRate,ref.breath)}，HRV 又只有 ${s.hrv}/100；多種休息時異常同時存在，不能只寫「不夠放鬆」。`,`At rest, heart rate is about ${change(f.quietHeartRate,ref.heart)} higher, breathing about ${change(f.quietBreathRate,ref.breath)} faster, while HRV is only ${s.hrv}/100. Several simultaneous changes undermine rest/steadiness.`,`안정 시 심박과 호흡이 높고 HRV가 ${s.hrv}/100으로 낮아 휴식 안정도가 크게 떨어졌습니다.`,`安静時心拍と呼吸が高く、HRVも${s.hrv}/100で、複数の異常が重なっています。`),
    L('這項分數低不是情緒判斷，而是安靜時心率、呼吸、HRV 和休息時間共同出現不利變化；請先讓寵物保持安靜並檢查呼吸負擔。','This is a reading-based pattern, not a judgement of emotion: heart, breathing, HRV and rest all contribute. Keep the pet quiet and assess breathing difficulty.','감정 판단이 아니라 심박·호흡·HRV·휴식 기록이 함께 나빠진 것입니다.','感情の判定ではなく、心拍・呼吸・HRV・休息の測定値が重なった結果です。')],
   cardio:()=>[
    L(`心肺的實際分項是心率 ${s.heart}/100、呼吸 ${s.breath}/100、HRV ${s.hrv}/100、節奏穩定度 ${s.stable}/100，這些真實分項共同形成 ${s.cardio}/100 的綜合分。優先查看低於 60 分的異常，不得把健康分項也說成嚴重偏離；HRV 與穩定度部分共用心搏間期資料。`,`Cardio scores are heart ${s.heart}, breathing ${s.breath}, HRV ${s.hrv}, stability ${s.stable}; together they form ${s.cardio}/100. Prioritize the sub-scores actually below 60 and do not call healthy components abnormal. HRV and stability share some beat-interval data.`,`심폐 세부 점수는 심박 ${s.heart}, 호흡 ${s.breath}, HRV ${s.hrv}, 안정도 ${s.stable}점입니다. 실제로 60점 미만인 항목을 우선 확인하세요.`,`心肺の下位評価は心拍${s.heart}、呼吸${s.breath}、HRV${s.hrv}、安定度${s.stable}点です。実際に60点未満の項目を優先してください。`),
    L('最先確認安靜時的呼吸負擔與心跳是否持續異常，再核對 HRV 與訊號品質；如有呼吸費力、倒下、牙齦發藍或無法平臥，請立即就診獸醫急診。','First verify resting breathing and heart rate, then HRV and signal quality. Difficult breathing, collapse, blue gums or inability to lie flat warrants immediate emergency veterinary care.','안정 시 호흡과 심박을 먼저 확인하세요. 호흡 곤란·쓰러짐·푸른 잇몸은 즉시 응급 진료를 받으세요.','安静時の呼吸と心拍を優先してください。呼吸困難・虚脱・青い歯ぐきはすぐに救急受診してください。')],
   rhythm:()=>[
    L(`身體節奏 ${s.rhythm}/100 由心搏穩定度 ${s.stable}/100 與放鬆平穩度 ${s.calm}/100 共同評估；必須分別確認哪些分項真的低於 60 分，而不是將一次瞬間心跳誤判成兩項嚴重異常。`,`Body rhythm ${s.rhythm}/100 combines beat stability ${s.stable}/100 and calm ${s.calm}/100. Check which components are actually below 60; a single beat is not two separate abnormalities.`,`신체 리듬 ${s.rhythm}점은 박동 안정도 ${s.stable}점과 휴식 안정도 ${s.calm}점으로 구성됩니다. 실제 60점 미만 항목을 확인하세요.`,`身体リズム${s.rhythm}点は拍動安定度${s.stable}点と休息安定度${s.calm}点から構成されます。実際に60点未満の項目を確認してください。`),
    L('對照安靜時心率、HRV 和當日休息，並確認項圈配戴及訊號品質。節奏分數不是心電圖，不代表已確診心律不整。','Review quiet heart rate, HRV, rest and signal quality. A rhythm score is not an ECG diagnosis of arrhythmia.','안정 시 심박·HRV·휴식 및 신호 품질을 함께 확인하세요. 부정맥 진단은 아닙니다.','安静時心拍・HRV・休息・信号品質を照合してください。心電図診断ではありません。')],
   activityRecovery:()=>[
    L(`精力 ${s.energy}/100、活動後恢復 ${s.recovery}/100、放鬆平穩 ${s.calm}/100，共同形成精力與恢復 ${s.activityRecovery}/100。請特別查看其中真正極低的分項以及活動量、休息時長的對比；兩分鐘恢復只是其中一項，不能單獨解釋全部低分。`,`Energy ${s.energy}, recovery ${s.recovery} and calm ${s.calm} combine to ${s.activityRecovery}/100. Examine the truly low components and measured movement/rest changes; two-minute recovery alone cannot explain every low score.`,`활력 ${s.energy}, 회복 ${s.recovery}, 안정도 ${s.calm}가 합쳐져 ${s.activityRecovery}/100입니다. 실제로 매우 낮은 항목을 먼저 확인하세요.`,`活力${s.energy}、回復${s.recovery}、安静度${s.calm}で総合${s.activityRecovery}/100です。実際に極端に低い項目を確認してください。`),
    L('應同時看當日活動大幅減少、睡眠不足、安靜心率過快及 HRV 下降，這四種異常疊加時必須提高注意；如果精神與呼吸也明顯變差，請儘快聯絡獸醫。','Check the combined loss of movement, short rest, rapid resting heart rate and low HRV. Prompt veterinary advice is appropriate if energy or breathing worsens noticeably.','활동 감소·휴식 부족·빠른 안정 심박·낮은 HRV가 함께 나타나면 주의를 높이세요.','活動減少・休息不足・安静時頻脈・低HRVが重なる場合、元気や呼吸の悪化に注意してください。')]
  };
  return (reasons[key]?.()||[]).filter(Boolean);
 }
 // Every high-risk metric must explain the magnitude and a next action,
 // including constituent metrics on all three Deep tabs. A severe monitoring
 // score is never presented as a diagnosed acute illness.
 function urgentContext(key,row){
  if(!legacyDirectionMatches(key,row))return [
   L(`【實際異常方向要分開判讀】${label[key]?.()||key}只有 ${row.scores?.[key]}/100，但當日讀數不支持舊版範例的單一「增加／減少」方向。上面已按真實條件列出相符資訊；請勿用同一套原因解釋所有低分。`,
    `CHECK THE ACTUAL DIRECTION: ${label[key]?.()||key} is ${row.scores?.[key]}/100, but this reading does not support the example's assumed increase/decrease. Review the evidence-matched findings above.`,
    `실제 변화 방향 확인: ${label[key]?.()||key} ${row.scores?.[key]}점이지만 예시의 상승·하강 가정과 일치하지 않습니다. 실측 근거를 확인하세요.`,
    `実際の変化方向を確認：${label[key]?.()||key}は${row.scores?.[key]}点ですが、例示の増加・減少とは一致しません。実測根拠を確認してください。`),
   L('【現在就要做】先停止額外活動、保持安靜，核實當前呼吸、精神、站立能力及項圈配戴品質。多項異常持續時儘快聯絡獸醫；不要強迫重複運動測試。',
    'ACT NOW: Pause exertion, check current breathing, alertness, ability to stand and collar quality. Seek veterinary advice for persistent changes; do not force repeat exercise testing.',
    '지금 확인: 무리한 활동을 중단하고 호흡·의식·기립·착용 상태를 확인하세요. 지속되면 수의사에게 상담하세요.',
    '今すぐ確認：運動を止め、呼吸・意識・起立・装着を確認してください。異常が持続する場合は獣医師へ。'),
   L('【急診徵兆才需急診】若當下真的有呼吸費力、牙齦發藍、虛脫或意識改變，立即獸醫急診；不能因數字低就冒稱已確診嚴重疾病。',
    'EMERGENCY SIGNS REQUIRE EMERGENCY CARE: Current breathing distress, blue gums, collapse or altered awareness warrants emergency veterinary care. The score alone is not a diagnosis.',
    '응급 징후: 지금 호흡 곤란·푸른 잇몸·쓰러짐·의식 변화가 있으면 즉시 응급 진료받으세요. 점수만으로 진단하지 않습니다.',
    '救急症状：今の呼吸困難・青い歯ぐき・虚脱・意識変化があれば獣医救急へ。点数だけでは診断できません。')];
  const s=row.scores||{},f=feature(row),ref=evidence(row)?.references||{};
  const raw=typeof demoRecords==='function'?demoRecords(state.dog).find(x=>x.date===row.date)||{}:{};
  const rate=(x,r)=>finite(x)&&finite(r)&&r>0?`${absPct(x,r)}%`:L('明顯','markedly','크게','大幅に');
  const evidenceLines={
   heart:()=>L(`【心跳異常的嚴重程度】安靜時 ${one(f.quietHeartRate)} bpm，參考 ${one(ref.heart)} bpm，偏高 ${rate(f.quietHeartRate,ref.heart)}；同日呼吸 ${s.breath}/100、HRV ${s.hrv}/100。請立即核對是否連安靜休息時仍持續快速，不可只看一次活動後心率。`,`SERIOUS HEART DEVIATION: Resting ${one(f.quietHeartRate)} bpm versus ${one(ref.heart)} (${rate(f.quietHeartRate,ref.heart)} higher); breathing ${s.breath}/100 and HRV ${s.hrv}/100. Check now whether it persists at true rest.`,`심박 심각 경고: 안정 시 ${one(f.quietHeartRate)}bpm(기준 ${one(ref.heart)}, ${rate(f.quietHeartRate,ref.heart)} 높음). 호흡 ${s.breath}점, HRV ${s.hrv}점도 함께 확인하세요.`,`心拍の重大な変化：安静時${one(f.quietHeartRate)}bpm（基準${one(ref.heart)}、${rate(f.quietHeartRate,ref.heart)}高い）。呼吸${s.breath}点、HRV${s.hrv}点も確認してください。`),
   breath:()=>L(`【呼吸異常的嚴重程度】安靜時每分鐘 ${one(f.quietBreathRate)} 次，參考 ${one(ref.breath)} 次，偏高 ${rate(f.quietBreathRate,ref.breath)}；同日心跳 ${s.heart}/100。請立刻直接觀察胸腹起伏、呼吸聲及能否安穩躺下，不能把這種高風險簡化成「呼吸偏快」。`,`SERIOUS BREATHING DEVIATION: Resting ${one(f.quietBreathRate)}/min versus ${one(ref.breath)} (${rate(f.quietBreathRate,ref.breath)} higher); heart ${s.heart}/100. Inspect chest/abdominal effort, breathing noise and comfortable resting now.`,`호흡 심각 경고: 안정 시 분당 ${one(f.quietBreathRate)}회(기준 ${one(ref.breath)}, ${rate(f.quietBreathRate,ref.breath)} 높음). 가슴·복부 호흡 노력과 소리를 즉시 확인하세요.`,`呼吸の重大な変化：安静時毎分${one(f.quietBreathRate)}回（基準${one(ref.breath)}、${rate(f.quietBreathRate,ref.breath)}高い）。胸腹部の動きと呼吸音を今すぐ確認してください。`),
   hrv:()=>L(`【HRV 嚴重下降】RMSSD ${one(f.rmssd)} ms（參考 ${one(ref.rmssd)}，下降 ${rate(f.rmssd,ref.rmssd)}）、SDNN ${one(f.sdnn)} ms（參考 ${one(ref.sdnn)}，下降 ${rate(f.sdnn,ref.sdnn)}）；並核對心跳 ${s.heart}/100、睡眠 ${s.sleep}/100。這兩項來自相關的心搏間期紀錄，不能誤作兩個獨立感測器。`,`MAJOR HRV DECLINE: RMSSD ${one(f.rmssd)} versus ${one(ref.rmssd)} ms (${rate(f.rmssd,ref.rmssd)} lower), SDNN ${one(f.sdnn)} versus ${one(ref.sdnn)} ms (${rate(f.sdnn,ref.sdnn)} lower). Compare heart ${s.heart}/100 and sleep ${s.sleep}/100; these statistics share beat-interval data.`,`HRV 심각 하락: RMSSD ${one(f.rmssd)}ms(기준 ${one(ref.rmssd)}), SDNN ${one(f.sdnn)}ms(기준 ${one(ref.sdnn)})로 크게 낮습니다. 심박과 수면도 함께 확인하세요.`,`HRVの重大な低下：RMSSD ${one(f.rmssd)}ms（基準${one(ref.rmssd)}）、SDNN ${one(f.sdnn)}ms（基準${one(ref.sdnn)}）です。心拍・睡眠も照合してください。`),
   stable:()=>L(`【心搏節奏穩定度嚴重異常】SDNN ${one(f.sdnn)} ms，參考 ${one(ref.sdnn)} ms，下降 ${rate(f.sdnn,ref.sdnn)}；同日 HRV ${s.hrv}/100。這是心搏間期變化大幅縮小的監測異常，應立即核對訊號品質與安靜時心率，不能直接寫成心律不整。`,`SERIOUS BEAT-PATTERN CHANGE: SDNN ${one(f.sdnn)} vs ${one(ref.sdnn)} ms (${rate(f.sdnn,ref.sdnn)} lower); HRV ${s.hrv}/100. Recheck sensor quality and resting heart rate; this does not diagnose arrhythmia.`,`박동 패턴 심각 경고: SDNN ${one(f.sdnn)}ms(기준 ${one(ref.sdnn)}), HRV ${s.hrv}점입니다. 센서 품질과 안정 시 심박을 즉시 확인하세요.`,`拍動パターンの重大な変化：SDNN${one(f.sdnn)}ms（基準${one(ref.sdnn)}）、HRV${s.hrv}点。信号品質と安静時心拍を確認してください。`),
   sleep:()=>L(`【休息嚴重不足｜立即找原因】當日有效休息僅 ${one(f.restHours)} 小時，早期參考 ${one(ref.sleep)} 小時，縮短 ${rate(f.restHours,ref.sleep)}；同日精力 ${s.energy}/100、放鬆平穩度 ${s.calm}/100。這不只是「睡少一點」，必須立即檢查夜間中斷、呼吸與不適，讓寵物安全安靜休息。`,`SEVERE REST DEFICIT: Only ${one(f.restHours)} hours versus ${one(ref.sleep)} (${rate(f.restHours,ref.sleep)} less), with energy ${s.energy}/100 and steadiness ${s.calm}/100. Review interruptions, breathing and discomfort now and allow undisturbed rest.`,`심각한 휴식 부족: ${one(f.restHours)}시간(기준 ${one(ref.sleep)})으로 크게 줄었고 활력 ${s.energy}점, 안정도 ${s.calm}점입니다. 지금 밤중 깨움·호흡·불편감을 확인하고 쉬게 하세요.`,`重大な休息不足：${one(f.restHours)}時間（基準${one(ref.sleep)}）まで短縮し、活力${s.energy}点・安静度${s.calm}点です。中断・呼吸・不快感を今すぐ確認し安静にしてください。`),
   energy:()=>L(`【精力極度下降｜不可當成懶散】當日活動量 ${one(raw.activity)}（參考 ${one(ref.activity)}，減少 ${rate(raw.activity,ref.activity)}），同日休息 ${one(f.restHours)} 小時（參考 ${one(ref.sleep)}，減少 ${rate(f.restHours,ref.sleep)}）；放鬆平穩度 ${s.calm}/100。活動與休息雙重不足，必須立即停止額外活動、檢查能否起身及精神食慾，讓牠安靜休息。`,`SEVERE ENERGY DROP: Movement ${one(raw.activity)} versus ${one(ref.activity)} (${rate(raw.activity,ref.activity)} less), rest ${one(f.restHours)} versus ${one(ref.sleep)} hours (${rate(f.restHours,ref.sleep)} less), steadiness ${s.calm}/100. Stop extra exertion, check mobility and alertness and let the pet rest now.`,`심각한 활력 저하: 활동 ${one(raw.activity)}(기준 ${one(ref.activity)}), 휴식 ${one(f.restHours)}시간(기준 ${one(ref.sleep)})이 함께 감소했습니다. 지금 운동을 중단하고 기립·의식·식욕을 확인하세요.`,`重大な活力低下：活動量${one(raw.activity)}（基準${one(ref.activity)}）と休息${one(f.restHours)}時間（基準${one(ref.sleep)}）が同時に減少。今すぐ運動をやめ、起立・意識・食欲を確認してください。`),
   recovery:()=>L(`【活動後恢復異常｜先停止負荷】活動後兩分鐘心率回落僅 ${one(f.recoveryDrop)} bpm（可比參考 ${one(ref.recovery)} bpm，少 ${rate(f.recoveryDrop,ref.recovery)}），應立即停止追加運動，觀察安靜時心跳與呼吸是否恢復，不要為了提高分數重複做負荷測試。`,`SERIOUS RECOVERY CHANGE: Two-minute heart-rate fall ${one(f.recoveryDrop)} bpm versus ${one(ref.recovery)} (${rate(f.recoveryDrop,ref.recovery)} less). Stop extra exercise and reassess quiet heart and breathing rather than repeating exertion tests.`,`회복 심각 경고: 2분 심박 감소 ${one(f.recoveryDrop)}bpm(기준 ${one(ref.recovery)})입니다. 추가 운동을 멈추고 안정 시 호흡·심박을 확인하세요.`,`回復の重大な変化：2分間の心拍低下${one(f.recoveryDrop)}bpm（基準${one(ref.recovery)}）。運動を中止して安静時の呼吸と心拍を確認してください。`),
   calm:()=>L(`【安靜狀態也有多項嚴重偏離】心率 ${one(f.quietHeartRate)} bpm（參考 ${one(ref.heart)}），呼吸每分鐘 ${one(f.quietBreathRate)} 次（參考 ${one(ref.breath)}），HRV ${s.hrv}/100、睡眠 ${s.sleep}/100。這不是一句「不夠放鬆」能帶過，現在就讓牠休息並核對呼吸負擔。`,`MULTIPLE SERIOUS RESTING DEVIATIONS: Heart ${one(f.quietHeartRate)} vs ${one(ref.heart)} bpm, breathing ${one(f.quietBreathRate)} vs ${one(ref.breath)}/min, HRV ${s.hrv}/100 and sleep ${s.sleep}/100. Let the pet rest and assess breathing effort now.`,`안정 시 복합 심각 이상: 심박 ${one(f.quietHeartRate)}(기준 ${one(ref.heart)}), 호흡 ${one(f.quietBreathRate)}(기준 ${one(ref.breath)}), HRV ${s.hrv}점, 수면 ${s.sleep}점입니다. 지금 쉬게 하고 호흡을 확인하세요.`,`安静時の複数の重大な変化：心拍${one(f.quietHeartRate)}（基準${one(ref.heart)}）、呼吸${one(f.quietBreathRate)}（基準${one(ref.breath)}）、HRV${s.hrv}点、睡眠${s.sleep}点です。`),
   cardio:()=>L(`【心肺多項重大異常｜最高優先核對】心跳 ${s.heart}/100、呼吸 ${s.breath}/100、HRV ${s.hrv}/100、心搏節奏穩定度 ${s.stable}/100；安靜心率 ${one(f.quietHeartRate)} bpm（參考 ${one(ref.heart)}），安靜呼吸 ${one(f.quietBreathRate)} 次／分（參考 ${one(ref.breath)}）。先查看當下呼吸負擔與精神，再檢查心率及訊號品質。`,`MULTIPLE SERIOUS CARDIO-RESPIRATORY CHANGES: Heart ${s.heart}/100, breath ${s.breath}/100, HRV ${s.hrv}/100, beat stability ${s.stable}/100; resting heart ${one(f.quietHeartRate)} vs ${one(ref.heart)} bpm, breathing ${one(f.quietBreathRate)} vs ${one(ref.breath)}/min. Check breathing effort and alertness first.`,`심폐 복합 심각 이상: 심박 ${s.heart}점, 호흡 ${s.breath}점, HRV ${s.hrv}점, 안정도 ${s.stable}점입니다. 안정 시 심박·호흡과 의식을 지금 확인하세요.`,`心肺の複数の重大な変化：心拍${s.heart}点、呼吸${s.breath}点、HRV${s.hrv}点、拍動安定度${s.stable}点です。安静時呼吸と意識を最優先で確認してください。`),
   activityRecovery:()=>L(`【精力與恢復多項重大異常】精力 ${s.energy}/100、放鬆平穩度 ${s.calm}/100、活動後恢復 ${s.recovery}/100；活動量 ${one(raw.activity)}（參考 ${one(ref.activity)}），休息 ${one(f.restHours)} 小時（參考 ${one(ref.sleep)}）。這是活動、休息與安靜時表現多項下降，現在應停止額外負荷並確認站立、精神與呼吸。`,`MULTIPLE SERIOUS ENERGY/RECOVERY CHANGES: Energy ${s.energy}/100, steadiness ${s.calm}/100, recovery ${s.recovery}/100; movement ${one(raw.activity)} vs ${one(ref.activity)}, rest ${one(f.restHours)} vs ${one(ref.sleep)} hours. Stop extra exertion and assess mobility, alertness and breathing now.`,`활력·회복 복합 심각 이상: 활력 ${s.energy}점, 안정도 ${s.calm}점, 회복 ${s.recovery}점, 활동 ${one(raw.activity)}(기준 ${one(ref.activity)}), 휴식 ${one(f.restHours)}시간(기준 ${one(ref.sleep)})입니다. 지금 활동을 중단하고 기립·호흡을 확인하세요.`,`活力・回復の複数の重大な変化：活力${s.energy}点、安静度${s.calm}点、回復${s.recovery}点。活動量${one(raw.activity)}（基準${one(ref.activity)}）と休息${one(f.restHours)}時間（基準${one(ref.sleep)}）を確認してください。`),
   rhythm:()=>L(`【身體節奏重大偏離】心搏節奏穩定度 ${s.stable}/100、放鬆平穩度 ${s.calm}/100，SDNN ${one(f.sdnn)} ms（參考 ${one(ref.sdnn)}）。多項低分需要立即核對安靜時心跳、HRV 與配戴品質，但不可把這個分數當成心電圖診斷。`,`SERIOUS BODY-RHYTHM CHANGE: Beat stability ${s.stable}/100, steadiness ${s.calm}/100, SDNN ${one(f.sdnn)} vs ${one(ref.sdnn)} ms. Check resting heart, HRV and signal quality; this is not an ECG diagnosis.`,`신체 리듬 심각 경고: 박동 안정도 ${s.stable}점, 휴식 안정도 ${s.calm}점, SDNN ${one(f.sdnn)}ms(기준 ${one(ref.sdnn)}). 심박·HRV·착용 상태를 즉시 확인하세요.`,`身体リズムの重大な変化：拍動安定度${s.stable}点、安静度${s.calm}点、SDNN${one(f.sdnn)}ms（基準${one(ref.sdnn)}）。安静時心拍・HRV・信号品質を確認してください。`)
  };
  const evidenceLine=evidenceLines[key]?.();
  const action=key==='sleep'||key==='energy'||key==='activityRecovery'?
   L('【現在就要做】先停止額外運動、提供安靜安全的休息環境，立即確認精神、食慾、能否站起及是否呼吸費力；若明顯虛弱或持續異常，應當天諮詢獸醫。','ACT NOW: Stop extra exertion and provide quiet rest. Check alertness, appetite, mobility and breathing effort. Arrange same-day veterinary advice if severe or persistent.','지금 활동을 멈추고 쉬게 하며 의식·식욕·기립·호흡을 확인하세요. 심각하거나 계속되면 당일 진료받으세요.','今すぐ運動を止め安静にし、意識・食欲・起立・呼吸を確認してください。強い異常が続くなら当日獣医師へ。'):
   L('【現在就要做】先停止額外運動，在安靜狀態直接觀察呼吸、心跳與精神，並確認項圈配戴及訊號是否有效；多次異常或持續偏離請當天聯絡獸醫。','ACT NOW: Pause exertion; observe resting breathing, heart rate and alertness and check collar signal quality. Contact a vet today if abnormalities persist or recur.','지금 운동을 멈추고 안정 시 호흡·심박·의식과 신호 상태를 확인하세요. 반복되거나 지속되면 당일 수의사와 상담하세요.','今すぐ運動を止め、安静時の呼吸・心拍・意識と装着状態を確認してください。持続・反復時は当日獣医師へ。');
  const emergency=L('【不得等待的危險徵兆】如果當下出現呼吸費力、牙齦或舌頭發藍、虛脫、無法站立或意識明顯改變，立即送獸醫急診，不要等下一次分數。只有分數低、沒有實際症狀，仍須確認資料品質與請獸醫判讀，不能直接宣稱已患重病。','EMERGENCY SIGNS: Laboured breathing, blue gums or tongue, collapse, inability to stand or altered awareness requires emergency veterinary care now. A low score alone is not a disease diagnosis.','응급 징후: 호흡 곤란·푸른 잇몸·쓰러짐·기립 불가·의식 변화가 있으면 점수를 기다리지 말고 응급 진료받으세요. 낮은 점수 자체가 진단은 아닙니다.','救急の兆候：呼吸困難・青い歯ぐき・虚脱・起立不能・意識の変化があれば次の点数を待たず救急受診してください。低スコアだけで診断はできません。');
  return [evidenceLine,action,emergency].filter(Boolean);
 }
 // The extremely low tier must never feel like a neutral measurement report.
 // Its urgency is a call to examine the pet NOW; emergency treatment is
 // conditionally triggered by observable distress, not inferred from a score.
 function extremeVigilance(key,row,days){
  if(!legacyDirectionMatches(key,row))return [];
  const s=row.scores||{},f=feature(row),ref=evidence(row)?.references||{};
  // Selecting a past date does NOT make a past observation a present emergency.
  const onToday=row.date===currentDate();
  const severeCount=keys=>keys.filter(k=>finite(s[k])&&s[k]<60).length;
  const specific={
   heart:()=>[
    L(`【立即警惕】安靜心跳已達 ${one(f.quietHeartRate)} bpm，這項本身只有 ${s.heart} 分。請先停止運動和刺激，親自確認牠是否仍持續跳得過快；不要把這種極端低分簡化成「偏快」。`,`ACT NOW: Resting heart rate is ${one(f.quietHeartRate)} bpm and the heart component is ${s.heart}/100. Stop exertion, examine the pet in person, and check whether the rapid rate persists.`,`즉시 확인: 안정 시 심박 ${one(f.quietHeartRate)} bpm, 심박 점수 ${s.heart}점입니다. 운동을 멈추고 빠른 심박이 지속되는지 직접 확인하세요.`,`直ちに確認：安静時心拍${one(f.quietHeartRate)}bpm、心拍${s.heart}点です。運動を止め、速い心拍が続くか確認してください。`),
    L(`【高度警戒】同日呼吸只有 ${s.breath}/100、HRV 只有 ${s.hrv}/100；心跳並不是唯一異常。若心跳持續急促又合併呼吸吃力、極度虛弱或倒下，立即聯絡獸醫急診。`,`HIGH ALERT: Breathing is also ${s.breath}/100 and HRV ${s.hrv}/100. The heart is not the only abnormal channel. Rapid beating with breathing difficulty, severe weakness or collapse needs emergency care.`,`고도 경계: 호흡 ${s.breath}점과 HRV ${s.hrv}점도 낮습니다. 빠른 심박과 호흡 곤란·심한 쇠약·쓰러짐이 동반되면 응급 진료받으세요.`,`高度警戒：呼吸${s.breath}点、HRV${s.hrv}点も低下。頻脈と呼吸困難・虚脱が重なる場合は救急受診してください。`)],
   breath:()=>[
    L(`【立即警惕】安靜呼吸已達每分鐘 ${one(f.quietBreathRate)} 次；牠的呼吸項目僅 ${s.breath}/100。這是極大的個體差距，應立刻檢查呼吸是否急促、費力、有腹部用力或異常聲音。`,`ACT NOW: Resting breathing is ${one(f.quietBreathRate)}/min with a breathing score of ${s.breath}/100. Examine breathing effort, abdominal movement and unusual breathing sounds immediately.`,`즉시 확인: 안정 시 호흡이 분당 ${one(f.quietBreathRate)}회이며 호흡 점수는 ${s.breath}점입니다. 힘든 호흡·복부 움직임·이상 소리를 지금 확인하세요.`,`直ちに確認：安静時呼吸は毎分${one(f.quietBreathRate)}回、呼吸${s.breath}点です。呼吸努力・腹部の動き・異音を確認してください。`),
    L('【急診警訊】若見到呼吸費力、張口急喘、牙齦或舌頭發藍、脖子伸長才能呼吸、無法安穩躺下或倒下，這已不是等下一次評分的情況，必須立即送獸醫急診。','EMERGENCY SIGNS: Laboured/open-mouth breathing, blue gums or tongue, neck extension to breathe, inability to rest comfortably or collapse require immediate emergency veterinary care; do not wait for another score.','응급 징후: 힘든 입벌림 호흡·푸른 잇몸·목을 뻗는 호흡·쓰러짐이 있다면 다음 점수를 기다리지 말고 즉시 응급 진료받으세요.','救急の兆候：苦しい開口呼吸、青い歯ぐき、首を伸ばす呼吸、虚脱があれば次のスコアを待たず救急受診してください。')],
   hrv:()=>[
    L(`【高度警戒】RMSSD ${one(f.rmssd)} ms 與 SDNN ${one(f.sdnn)} ms 同時明顯縮小，HRV 只剩 ${s.hrv}/100。這是同一批心搏間期資料的兩項統計結果同步偏離，絕不能只寫一句「比平時低」，也不能誤稱兩個獨立感測器。`,`HIGH ALERT: RMSSD ${one(f.rmssd)} ms and SDNN ${one(f.sdnn)} ms are both markedly reduced; HRV is only ${s.hrv}/100. These are two related statistics from beat intervals, not two independent sensor channels.`,`고도 경계: RMSSD ${one(f.rmssd)}ms와 SDNN ${one(f.sdnn)}ms가 함께 크게 감소해 HRV는 ${s.hrv}점입니다. 서로 관련된 박동 간격 통계이지 독립 센서가 아닙니다.`,`高度警戒：RMSSD ${one(f.rmssd)}msとSDNN ${one(f.sdnn)}msがともに大幅に低下し、HRVは${s.hrv}点です。別々の独立センサーではありません。`),
    L(`【優先確認】同日心跳 ${s.heart}/100、呼吸 ${s.breath}/100，請把 HRV 的極低分與這些同步異常一起核對；立即安排安靜重測及訊號品質檢查，並儘快請獸醫評估持續異常。HRV 低分本身不能診斷心臟病。`,`PRIORITY CHECK: Heart ${s.heart}/100 and breathing ${s.breath}/100 are also low. Review these together, repeat at rest and seek prompt veterinary advice for persistent changes; low HRV alone is not a cardiac diagnosis.`,`우선 확인: 심박 ${s.heart}점, 호흡 ${s.breath}점도 낮습니다. 함께 재측정하고 계속 이상하면 신속히 수의사와 상담하세요. HRV만으로 진단하지 않습니다.`,`優先確認：心拍${s.heart}点、呼吸${s.breath}点も低下。安静時に再測定し、続く場合は獣医師に相談してください。HRVだけで診断はできません。`)],
   stable:()=>[
    L(`【高度警戒】心搏節奏穩定度只有 ${s.stable}/100，SDNN 僅 ${one(f.sdnn)} ms，與有效基準 ${one(ref.sdnn)} ms 相去甚遠。真正要警惕的是心搏間期變化模式嚴重偏離，不是簡單「起伏比較明顯」。`,`HIGH ALERT: Beat-pattern stability is ${s.stable}/100; SDNN is ${one(f.sdnn)} ms against ${one(ref.sdnn)} ms previously. The beat-interval pattern is markedly different, not merely a larger fluctuation.`,`고도 경계: 박동 안정도 ${s.stable}점, SDNN ${one(f.sdnn)}ms(기준 ${one(ref.sdnn)}ms)로 차이가 큽니다.`,`高度警戒：拍動安定度${s.stable}点、SDNN ${one(f.sdnn)}ms（基準${one(ref.sdnn)}ms）と大きく異なります。`),
    L(`【交叉核對】同日 HRV 只有 ${s.hrv}/100，請同時確認安靜心率、呼吸和配戴品質。若出現暈倒、無力或明顯呼吸費力，立即就醫；此分數不能代替心電圖診斷心律不整。`,`CROSS-CHECK: HRV is also ${s.hrv}/100. Review resting heart rate, breathing and collar contact. Collapse or difficult breathing needs emergency care; this is not an ECG arrhythmia diagnosis.`,`교차 확인: HRV도 ${s.hrv}점입니다. 심박·호흡·착용 상태를 함께 확인하세요. 쓰러짐이나 호흡 곤란은 응급 진료가 필요합니다.`,`照合：HRVも${s.hrv}点。安静時心拍・呼吸・装着状態を確認し、虚脱や呼吸困難なら救急受診してください。`)],
   sleep:()=>[
    L(`【嚴重休息警戒】有效休息只有 ${one(f.restHours)} 小時，早期參考約 ${one(ref.sleep)} 小時，縮短幅度極大；睡眠僅 ${s.sleep}/100，代表牠這段有效休息紀錄已嚴重偏離習慣，不可輕描淡寫。`,`SEVERE REST ALERT: Quiet rest was only ${one(f.restHours)} h versus ${one(ref.sleep)} h previously. Sleep is ${s.sleep}/100, a major reduction in observed rest.`,`심각한 휴식 경고: 휴식 ${one(f.restHours)}시간, 기준 ${one(ref.sleep)}시간으로 크게 줄어 수면 ${s.sleep}점입니다.`,`重大な休息警告：休息${one(f.restHours)}時間、基準${one(ref.sleep)}時間と大きく減り、睡眠${s.sleep}点です。`),
    L(`【立刻查原因】同日精力 ${s.energy}/100、放鬆平穩 ${s.calm}/100 也很低；請立即確認夜間是否因不適、疼痛、環境干擾或呼吸問題反覆醒來。若多晚持續，務必儘快聯絡獸醫。`,`FIND THE CAUSE: Energy ${s.energy}/100 and steadiness ${s.calm}/100 are also low. Check for discomfort, pain, disturbances or breathing problems interrupting rest. Consult a vet promptly if repeated.`,`즉시 원인 확인: 활력 ${s.energy}점·안정도 ${s.calm}점도 낮습니다. 통증·불편·호흡 문제·환경 방해가 있는지 확인하세요.`,`原因を直ちに確認：活力${s.energy}点・安定度${s.calm}点も低い状態です。痛みや呼吸の問題で眠りが妨げられていないか確認してください。`)],
   energy:()=>[
    L(`【明顯衰弱風險警戒】精力僅 ${s.energy}/100，同日睡眠 ${s.sleep}/100、放鬆平穩 ${s.calm}/100；活動減少不是單一懶散表現，而是多項健康監測紀錄一起下滑。`,`MARKED ENERGY-DECLINE ALERT: Energy is ${s.energy}/100, alongside sleep ${s.sleep}/100 and steadiness ${s.calm}/100. Low movement is part of several simultaneous departures, not simply laziness.`,`심각한 활력 저하 경고: 활력 ${s.energy}점, 수면 ${s.sleep}점, 안정도 ${s.calm}점이 함께 낮습니다. 단순히 게으른 것이 아닙니다.`,`著しい活力低下の警告：活力${s.energy}点、睡眠${s.sleep}点、安定度${s.calm}点と複数が低下しています。`),
    L('【立即觀察】確認牠是否真的不願活動、起身困難、食慾下降或和平時明顯不同；不要強迫運動。若無法站立、虛脫或合併呼吸困難，立即送獸醫急診。','OBSERVE NOW: Check for unwillingness to move, trouble standing, appetite loss or marked change in behavior. Do not force exercise. Collapse, inability to stand or breathing difficulty requires emergency care.','지금 활동 의지·기립 어려움·식욕 저하를 확인하고 억지로 운동시키지 마세요. 쓰러짐·호흡 곤란은 응급 진료가 필요합니다.','今すぐ活動意欲・起立困難・食欲低下を確認し、無理に運動させないでください。虚脱や呼吸困難は救急受診してください。')],
   recovery:()=>[
    L(`【異常恢復警戒】兩分鐘內心率只下降 ${one(f.recoveryDrop)} bpm，先前可比記錄約 ${one(ref.recovery)} bpm；若分數已極低，代表這段心率回落模式與平常嚴重不同，應停止進一步負荷並核對。`,`RECOVERY ALERT: The two-minute heart-rate fall was ${one(f.recoveryDrop)} bpm versus ${one(ref.recovery)} bpm previously. If recovery is extremely low, stop further exertion and confirm the slowdown.`,`회복 경고: 2분 심박 감소폭 ${one(f.recoveryDrop)}bpm, 기준 ${one(ref.recovery)}bpm입니다. 매우 낮으면 활동을 멈추고 확인하세요.`,`回復警告：2分間の心拍低下${one(f.recoveryDrop)}bpm、基準${one(ref.recovery)}bpmです。極端な低下時は運動を中止し確認してください。`),
    L('【加強警惕】持續回落緩慢又伴有虛弱、喘不過氣或倒下時，不要等待下次活動測試，立即就醫；單次兩分鐘指標不能確診疾病。','WATCH CLOSELY: Persistently slow recovery with weakness, severe breathlessness or collapse warrants emergency care; do not repeat exercise testing to prove it. One recovery reading is not a diagnosis.','회복이 계속 느리고 쇠약·심한 호흡 곤란·쓰러짐이 있으면 다시 운동 시험을 하지 말고 응급 진료받으세요.','回復が遅く、強い息切れや虚脱がある場合は運動を繰り返さず救急受診してください。')],
   calm:()=>[
    L(`【多項同步核對】放鬆平穩僅 ${s.calm}/100；心率 ${s.heart}/100、呼吸 ${s.breath}/100、HRV ${s.hrv}/100、睡眠 ${s.sleep}/100，其中 ${severeCount(['heart','breath','hrv','sleep'])} 項落在高風險區。請立即核對安靜狀態是否也持續偏離平常。`,`MULTIPLE READINGS: Rest/steadiness ${s.calm}/100, heart ${s.heart}, breathing ${s.breath}, HRV ${s.hrv}, sleep ${s.sleep}; ${severeCount(['heart','breath','hrv','sleep'])} components are high risk. Check current resting status now.`,`복합 수치 확인: 안정도 ${s.calm}점, 심박 ${s.heart}점, 호흡 ${s.breath}점, HRV ${s.hrv}점, 수면 ${s.sleep}점 중 ${severeCount(['heart','breath','hrv','sleep'])}개가 고위험입니다.`,`複数の測定値：安静度${s.calm}点、心拍${s.heart}点、呼吸${s.breath}点、HRV${s.hrv}点、睡眠${s.sleep}点のうち${severeCount(['heart','breath','hrv','sleep'])}項目が高リスクです。`),
    L('【立即查看】安靜環境下觀察心跳與呼吸是否持續異常，檢查佩戴與訊號；若喘氣費力、虛脫或牙齦發藍，立刻就診急診。','CHECK NOW: Assess resting heart and breathing and signal quality. Laboured breathing, collapse or blue gums requires immediate emergency care.','지금 안정 시 심박·호흡과 신호 품질을 확인하세요. 호흡 곤란·쓰러짐·푸른 잇몸은 응급 진료가 필요합니다.','今すぐ安静時の心拍・呼吸と信号品質を確認してください。呼吸困難・虚脱・青い歯ぐきは救急受診です。')],
   cardio:()=>[
    L(`【最高優先】心肺僅 ${s.cardio}/100，呼吸 ${s.breath}/100、HRV ${s.hrv}/100、心搏穩定 ${s.stable}/100、心跳 ${s.heart}/100；其中 ${severeCount(['heart','breath','hrv','stable'])} 項低於 60 分，必須逐項看原因。HRV 與穩定度共用部分原始資料，不能當成四個獨立感測器。`,`TOP PRIORITY: Cardio ${s.cardio}/100, breathing ${s.breath}, HRV ${s.hrv}, stability ${s.stable}, heart ${s.heart}; ${severeCount(['heart','breath','hrv','stable'])} components are high risk. HRV and stability partly share beat-interval data and are not independent sensors.`,`최우선 경고: 심폐 ${s.cardio}점, 호흡 ${s.breath}점, HRV ${s.hrv}점, 안정도 ${s.stable}점, 심박 ${s.heart}점 중 ${severeCount(['heart','breath','hrv','stable'])}개가 고위험입니다.`,`最優先警告：心肺${s.cardio}点、呼吸${s.breath}点、HRV${s.hrv}点、安定度${s.stable}点、心拍${s.heart}点のうち${severeCount(['heart','breath','hrv','stable'])}項目が高リスクです。`),
    L('【立刻檢查寵物】現在先看呼吸是否費力，再看精神、站立能力、牙齦顏色與心跳。若出現呼吸困難、發藍或倒下，直接去獸醫急診；若安靜後仍多項異常，也應當天聯絡獸醫。','EXAMINE THE PET NOW: Check breathing effort, awareness, ability to stand, gum color and heart rate. Breathing distress, blue gums or collapse needs emergency care; persistent abnormal resting signs warrant same-day veterinary contact.','지금 호흡·의식·기립·잇몸 색·심박을 확인하세요. 호흡 곤란·푸른 잇몸·쓰러짐은 응급 진료, 안정 후에도 이상하면 당일 수의사에게 문의하세요.','今すぐ呼吸・意識・起立・歯ぐきの色・心拍を確認。呼吸困難・チアノーゼ・虚脱は救急、安静後も異常なら当日獣医師へ。')],
   activityRecovery:()=>[
    L(`【多系統嚴重警戒】精力與恢復綜合僅 ${s.activityRecovery}/100，精力 ${s.energy}/100、平穩 ${s.calm}/100、恢復 ${s.recovery}/100，其中 ${severeCount(['energy','calm','recovery'])} 項落入高風險。應逐一核對活動量、睡眠、安靜時心肺狀態和兩分鐘恢復數據，不得只寫「精力稍差」。`,`MULTI-SYSTEM ALERT: Energy/recovery ${s.activityRecovery}/100, energy ${s.energy}, calm ${s.calm}, recovery ${s.recovery}; ${severeCount(['energy','calm','recovery'])} components are high-risk. Review movement, rest, resting heart/breathing and two-minute recovery.`,`복합 심각 경고: 활력·회복 ${s.activityRecovery}점, 활력 ${s.energy}점, 안정도 ${s.calm}점, 회복 ${s.recovery}점 중 ${severeCount(['energy','calm','recovery'])}개가 고위험입니다.`,`複数項目の重大警告：活力・回復${s.activityRecovery}点、活力${s.energy}点、安静度${s.calm}点、回復${s.recovery}点のうち${severeCount(['energy','calm','recovery'])}項目が高リスクです。`),
    L('【立即確認】請看寵物是否仍能自在站立、行走和正常呼吸，先停止負荷、讓牠休息。若明顯無力、倒下或呼吸費力，立即就醫；只有兩分鐘恢復較差並不足以解釋全部極低分。','CHECK NOW: Verify comfortable standing, walking and breathing; avoid exertion. Collapse or difficult breathing needs emergency care. The two-minute recovery reading alone cannot explain the whole low score.','지금 서기·걷기·호흡을 확인하고 무리한 활동을 피하세요. 쓰러짐·호흡 곤란은 응급 진료가 필요합니다.','今すぐ起立・歩行・呼吸を確認し運動を控えさせてください。虚脱や呼吸困難は救急受診してください。')],
   rhythm:()=>[
    L(`【嚴重節奏警戒】身體節奏 ${s.rhythm}/100，心搏穩定 ${s.stable}/100 與放鬆平穩 ${s.calm}/100 同時低分；不是一個微小的節奏波動。`,`SEVERE RHYTHM ALERT: Body rhythm ${s.rhythm}/100, beat stability ${s.stable}/100 and rest/steadiness ${s.calm}/100 are simultaneously low.`,`심각한 리듬 경고: 몸의 리듬 ${s.rhythm}점, 박동 안정도 ${s.stable}점, 휴식 안정도 ${s.calm}점이 함께 낮습니다.`,`重大なリズム警告：身体リズム${s.rhythm}点、拍動安定度${s.stable}点、安静度${s.calm}点が同時に低下しています。`),
    L('【需當下核對】同步檢查安靜心率、呼吸及感測品質；若真的暈厥、倒下、虛弱或呼吸困難，應緊急就醫，不能把心搏節奏分數當成心電圖診斷。','CHECK CURRENT CONDITION: Review resting heart, breathing and sensor quality. Fainting, collapse, weakness or breathing distress needs urgent care; rhythm score is not an ECG diagnosis.','지금 안정 시 심박·호흡·센서 품질을 확인하세요. 실신·쓰러짐·호흡 곤란은 응급 진료받으세요.','現在の安静時心拍・呼吸・測定品質を確認し、失神・虚脱・呼吸困難があれば救急受診してください。')]
  };
  const lines=(specific[key]?.()||[]).filter(Boolean);
  // Brachycephalic anatomy warrants closer attention to actual breathing
  // difficulty, without assigning a diagnosis from breed or score alone.
  const breed=typeof currentDog==='function'?currentDog()?.breed?.en:null;
  if(key==='breath'&&['Pug','French Bulldog','English Bulldog','Boston Terrier','Shih Tzu'].includes(breed)){
   lines.push(L('【短鼻犬特別提醒】這隻寵物屬短鼻犬種，出現安靜時持續呼吸急促、明顯吸氣噪音或呼吸費力時，更需要提高警覺並儘快讓獸醫評估；犬種本身並不代表已確診呼吸道疾病。','BRACHYCEPHALIC BREED NOTE: This short-nosed breed deserves extra attention if rapid breathing, noisy inspiration or increased breathing effort persists at rest. Seek veterinary assessment; breed alone does not diagnose airway disease.','단두종 주의: 쉬는 중에도 빠른 호흡·거친 들숨 소리·호흡 노력이 계속되면 특히 주의하고 수의사에게 확인하세요. 품종만으로 질병을 진단하지는 않습니다.','短頭種への注意：安静時にも速い呼吸、吸気の異音、努力呼吸が続く場合は特に注意して受診してください。犬種だけでは病気と診断できません。'));
  }
  if(!onToday)lines.unshift(L(`【歷史紀錄警示】下列極低分來自 ${row.date}${days>1?`（最近 ${days} 天的期間內）`:''}，不能據此斷定寵物此刻正在急症。請與最新有效紀錄和當下狀態比較；若現在仍呼吸費力、虛脫或牙齦發藍，立即送醫。`,`HISTORICAL ALERT: These extreme values were recorded on ${row.date}${days>1?` within the ${days}-day window`:''}. They do not prove an emergency right now. Check current symptoms and the latest valid record; present breathing distress, collapse or blue gums requires emergency care.`,`이전 기록 경고: 극히 낮은 수치는 ${row.date} 기록이며 지금 응급 상황이라는 뜻은 아닙니다. 최신 기록과 현재 호흡·의식·잇몸 색을 확인하고 위험 징후가 있으면 즉시 진료받으세요.`,`過去の記録に関する警告：極端な低値は${row.date}の記録で、現在の救急状態を意味しません。最新の状態を確認し、今も呼吸困難・虚脱・チアノーゼがあれば救急受診してください。`));
  return lines;
 }
 function distribution(rows,key,days){
  const v=rows.map(x=>x.scores?.[key]).filter(finite),counts=[v.filter(x=>x<60).length,v.filter(x=>x>=60&&x<80).length,v.filter(x=>x>=80&&x<90).length,v.filter(x=>x>=90).length];
  return L(`最近 ${days} 天有 ${v.length} 天有效記錄：高風險 ${counts[0]} 天（0–59）、中風險 ${counts[1]} 天（60–79）、低風險 ${counts[2]} 天（80–89）、健康 ${counts[3]} 天（90–100）。這是逐日量測的分布，不是預設分數。`,
   `Across the last ${days} calendar days, ${v.length} were valid: ${counts[0]} high-risk (<60), ${counts[1]} moderate (60–79), ${counts[2]} low (80–89), and ${counts[3]} healthy (90+). These are recorded daily results.`,
   `최근 ${days}일 유효 ${v.length}일: 고위험 ${counts[0]}일, 중위험 ${counts[1]}일, 저위험 ${counts[2]}일, 건강 ${counts[3]}일입니다.`,
   `直近${days}日の有効記録は${v.length}日：高リスク${counts[0]}日、中リスク${counts[1]}日、低リスク${counts[2]}日、健康${counts[3]}日です。`);
 }
 function followUp(key,risk,isCurrent=true){
  if(risk===0)return L('保持規律監測即可。','Continue routine monitoring.','평소대로 관찰하세요.','通常どおり見守ってください。');
  if(risk===1)return L('下次在相似的安靜或活動條件下再比對，觀察有否回到自己的基準。','Compare again under similar resting or activity conditions.','비슷한 조건에서 다음 측정과 비교하세요.','次回も同じ条件で比較してください。');
  if(risk===2)return L('應在接下來的有效記錄中加強追蹤，並核對活動、睡眠和項圈佩戴是否改變；若持續惡化，請諮詢獸醫。','Track subsequent valid readings and check movement, rest and collar fit. Seek veterinary advice if deterioration persists.','다음 유효 기록을 추적하고 계속 나빠지면 수의사와 상담하세요.','次の記録を追跡し、悪化が続けば獣医師へ相談してください。');
  if(!isCurrent)return L('這是歷史監測結果：應核對最近一次有效量測與寵物現在的呼吸、精神及站立能力。若目前仍見呼吸費力、虛脫或發紺，立即送獸醫急診；不能只因過去某一天低分，就當作現在確診急症。','This is a historical result. Check the latest valid measurement and the pet’s current breathing, alertness and ability to stand. Breathing distress, collapse or blue gums now requires emergency care; a past score alone is not a diagnosis.','과거의 모니터링 결과입니다. 최신 측정과 현재 호흡·의식·기립을 확인하세요. 지금 호흡 곤란·쓰러짐·푸른 잇몸이 있다면 응급 진료받으세요.','過去の測定結果です。最新の記録と現在の呼吸・意識・起立を確認してください。今も呼吸困難・虚脱・チアノーゼがあれば救急受診してください。');
  return key==='breath'||key==='cardio'?L('今天先確認牠在完全安靜時能否舒適呼吸；如果呼吸費力、牙齦發藍、站不穩或倒下，不要等待下一次分數，立即就醫。','Check quiet-time breathing now. Laboured breathing, blue gums, inability to stand or collapse requires emergency care without waiting for another score.','지금 안정 시 호흡을 확인하세요. 호흡 곤란·푸른 잇몸·쓰러짐은 점수를 기다리지 말고 응급 진료받으세요.','今すぐ安静時の呼吸を確認し、呼吸困難・青い歯ぐき・虚脱はすぐ救急受診してください。'):
   L('這是高風險監測訊號：先安排安靜休息與重測，逐項核對上述數據；若反覆低分或精神、食慾、呼吸、起身能力明顯變差，請儘快請獸醫評估。','This is a high-risk monitoring result. Allow quiet rest, recheck the readings and contact a vet promptly for repeated lows or clear changes in energy, appetite, breathing or ability to stand.','고위험 관찰 결과입니다. 휴식 후 다시 측정하고 점수 저하가 반복되거나 활력·호흡·식욕이 나빠지면 진료받으세요.','高リスクの測定結果です。安静・再測定を行い、低下が続く、元気や呼吸が悪化する場合は早めに受診してください。');
 }
 const lowestRow=(rows,key)=>rows.filter(x=>finite(x?.scores?.[key]))
  .reduce((best,row)=>!best||row.scores[key]<best.scores[key]?row:best,null);
 function periodRisk(rows,key,days){
  const mean=tier(days===1?latest(rows)?.scores?.[key]:average(rows,key));
  const worst=days>1?lowestRow(rows,key)?.scores?.[key]:null;
  return days>1&&finite(worst)&&worst<60?Math.max(mean,tier(worst)):mean;
 }
 function historicalHighRiskLead(key,rows,days){
  const worst=lowestRow(rows,key),score=worst?.scores?.[key],mean=average(rows,key);
  const highDays=rows.filter(x=>finite(x.scores?.[key])&&x.scores[key]<60).length;
  const tag=score<20?L('期間極端高風險日','EXTREME HIGH-RISK DAY','기간 내 극단적 고위험일','期間内の極端な高リスク日'):
   L('期間高風險日','HIGH-RISK DAY','기간 내 고위험일','期間内の高リスク日');
  return L(`【${tag}｜優先警戒】${label[key]()}最近 ${days} 天平均雖為 ${mean}/100，但 ${worst.date} 曾跌到 ${score}/100（滿分 100），期間共有 ${highDays} 天高風險！這些嚴重低分不能被平均值淡化。立即核對最低分當天的實測數據及最近一次有效量測，確認當下精神、呼吸與站立能力；若目前有呼吸費力、發紺或倒下，立即送醫。歷史低分本身不代表此刻已確診急症。`,
   `【${tag} · PRIORITY ALERT】The ${days}-day mean for ${label[key]()} is ${mean}/100, but it fell to ${score}/100 on ${worst.date}; ${highDays} days were high risk. The average must not conceal this. Check that date and the latest valid reading now. Present laboured breathing, blue gums or collapse needs emergency care; a historical score alone does not diagnose a current emergency.`,
   `【${tag} · 우선 경고】${days}일 평균은 ${mean}점이나 ${worst.date}에 ${score}점까지 떨어졌고 고위험일이 ${highDays}일입니다. 평균으로 심각한 날을 가리지 말고 당시 수치와 최신 상태를 즉시 확인하세요. 현재 호흡 곤란·푸른 잇몸·쓰러짐은 응급 진료 대상입니다.`,
   `【${tag}・優先警告】${days}日平均${mean}点でも${worst.date}には${score}点まで低下し、高リスク日は${highDays}日ありました。平均で重大な異常日を見落とさず、当日の数値と最新の状態を確認してください。今の呼吸困難・チアノーゼ・虚脱は救急受診が必要です。`);
 }
 function selectedPastHighRiskLead(key,row){
  const score=row.scores?.[key],subject=label[key]?.()||key;
  return L(`【所選歷史日期｜嚴重高風險紀錄】${row.date} 的${subject}曾只有 ${score}/100 分，屬必須重視的嚴重監測偏離，但這不是今天的新讀數。請立即對照最新有效測量及寵物現在的呼吸、精神和站立能力；如果此刻仍呼吸費力、發紺或倒下，直接送獸醫急診。下列分條原因均引用 ${row.date} 的資料，不能當成今天已確診急症。`,
   `PAST-DATE HIGH-RISK RECORD: On ${row.date}, ${subject} scored only ${score}/100. This was serious, but it is not a new reading today. Check the most recent valid data and the pet's current breathing, alertness and mobility. Current breathing distress, blue gums or collapse requires emergency care; a past score is not a diagnosis.`,
   `선택한 과거 고위험 기록: ${row.date}의 ${subject} 점수는 ${score}/100입니다. 당시 심각한 편차였으나 오늘의 새 측정값은 아닙니다. 최신 수치와 현재 호흡·의식·기립을 즉시 확인하세요. 지금 호흡 곤란·쓰러짐은 응급 진료가 필요합니다.`,
   `選択した過去の高リスク記録：${row.date}の${subject}は${score}/100点でした。重大な過去の変化ですが本日の新規測定ではありません。最新の記録と今の呼吸・意識・起立を確認し、現在の呼吸困難・虚脱は救急受診してください。`);
 }
 // Live 20-Hz collar records are NOT demo fixtures. Their supported metric
 // references live in row.baseline.references[featureKey].ref. Never borrow
 // demo activity, personal baselines, or SDNN as an invented stability cause.
 const realInputs={
  heart:['quietHeartRate','heartSpread','heartRate'],
  breath:['quietBreathRate','breathSpread','breathRate'],
  hrv:['rmssd','sdnn'],stable:['quietRhythm','heartSpread'],
  sleep:['restHours','restFraction','nightBreathRate','motionVariation'],
  energy:['motionMean','motionVariation','restHours'],
  recovery:['recoveryDrop','quietHeartRate'],
  calm:['quietHeartRate','quietBreathRate','restFraction','rmssd','sdnn'],
  cardio:['quietHeartRate','quietBreathRate','heartSpread','breathSpread'],
  activityRecovery:['motionMean','restHours','quietHeartRate','quietBreathRate','recoveryDrop'],
  rhythm:['quietRhythm','heartSpread','quietHeartRate','quietBreathRate']};
 const realField={
  quietHeartRate:['安靜心率','Resting heart rate','안정 시 심박수','安静時心拍数','bpm'],
  heartRate:['全天心率','Day-wide heart rate','하루 심박수','終日の心拍数','bpm'],
  heartSpread:['心率波動幅度','Heart-rate spread','심박 변동 폭','心拍変動幅','bpm'],
  quietBreathRate:['安靜呼吸頻率','Resting breathing rate','안정 시 호흡수','安静時呼吸数','/min'],
  breathRate:['全天呼吸頻率','Day-wide breathing rate','하루 호흡수','終日の呼吸数','/min'],
  breathSpread:['呼吸波動幅度','Breathing-rate spread','호흡 변동 폭','呼吸変動幅','/min'],
  rmssd:['RMSSD','RMSSD','RMSSD','RMSSD','ms'],sdnn:['SDNN','SDNN','SDNN','SDNN','ms'],
  quietRhythm:['心搏間期節奏變化','Beat-interval pattern variation','박동 간격 패턴 변화','拍動間隔の変動',''],
  restHours:['有效休息時長','Observed quiet-rest duration','관측된 휴식 시간','観測された休息時間','h'],
  restFraction:['安靜時段比例','Quiet-time proportion','휴식 시간 비율','安静時間の割合',''],
  nightBreathRate:['夜間呼吸頻率','Night-time breathing rate','야간 호흡수','夜間呼吸数','/min'],
  motionMean:['活動強度指標','Movement-intensity index','활동 강도 지표','活動強度指標',''],
  motionVariation:['活動規律變化','Movement-pattern variation','활동 패턴 변동','活動パターン変動',''],
  recoveryDrop:['活動後兩分鐘心率回落','Two-minute post-exertion heart-rate fall','활동 후 2분 심박 감소','活動後2分間の心拍低下','bpm']};
 function realMeasuredLine(field,row){
  const observed=feature(row)?.[field],entry=row.baseline?.references?.[field],reference=entry?.ref;
  if(!finite(observed))return null;
  const [tw,en,ko,ja,unit]=realField[field]||[field,field,field,field,''];
  const name=L(tw,en,ko,ja),value=one(observed)+(unit?' '+unit:'');
  if(!finite(reference)||reference<=0)return L(`${name}實測 ${value}；這一項尚無同條件的有效對照值，不會編造偏離百分比。`,
   `${name}: measured ${value}. No eligible like-for-like reference for this field; no deviation percentage is invented.`,
   `${name}: 측정 ${value}. 비교 가능한 유효 기준값이 없어 편차율을 만들지 않습니다.`,
   `${name}：実測${value}。比較可能な基準がないため偏差率を作りません。`);
  const delta=pct(observed,reference),magnitude=Math.abs(delta),higher=delta>=0;
  const source=entry.kind==='matched-exertion'?
   L(`先前 ${entry.matchedEpisodes} 次活動強度相近的心率回落參考`,`reference from ${entry.matchedEpisodes} earlier similarly intense activity episodes`,`이전 유사 강도 활동 ${entry.matchedEpisodes}회의 회복 기준`,`過去の近い強度の運動${entry.matchedEpisodes}回の回復基準`):
   entry.kind==='prior-comparable'?
   L(`先前 ${entry.priorValidWear} 個同來源有效日的中位參考`,`median of ${entry.priorValidWear} earlier eligible same-source days`,`동일 출처 유효 기록 ${entry.priorValidWear}일의 중앙값`,`過去の同一ソース有効日${entry.priorValidWear}日の中央値`):
   (entry.weight||0)>0?
   L('個體歷史與同類群組的組合參考','blended personal/cohort reference','개체·집단 혼합 기준','個体履歴・群の複合基準'):
   L('群組參考（尚非完整個體基準）','cohort reference (not yet a full personal baseline)','집단 기준(완전한 개체 기준 아님)','群の基準（完全な個体基準ではない）');
  return L(`${name}實測 ${value}；${source} ${one(reference)}${unit?' '+unit:''}，${higher?'高出':'低於'} ${magnitude}%。這是實測與可用參考的差距，不等於單項疾病診斷。`,
   `${name}: ${value} versus ${one(reference)}${unit?' '+unit:''} (${source}), ${magnitude}% ${higher?'higher':'lower'}. This is a measured difference, not a diagnosis.`,
   `${name}: ${value}, ${source} ${one(reference)}${unit?' '+unit:''} 대비 ${magnitude}% ${higher?'높음':'낮음'}. 측정 차이는 진단이 아닙니다.`,
   `${name}：${value}、${source}${one(reference)}${unit?' '+unit:''}より${magnitude}%${higher?'高い':'低い'}。診断ではありません。`);
 }
 function realExplanation(key,rows,days){
  const anchor=latest(rows),low=days===1?anchor:lowestRow(rows,key),score=days===1?anchor?.scores?.[key]:average(rows,key);
  const risk=periodRisk(rows,key,days),severe=low&&risk>=3&&finite(low.scores?.[key]);
  if(!finite(score))return [lead(score,key)];
  const historical=days>1&&severe&&low.scores[key]<60;
  const past=days===1&&anchor.date!==currentDate()&&risk>=3;
  const lines=[historical?historicalHighRiskLead(key,rows,days):past?selectedPastHighRiskLead(key,anchor):lead(score,key)];
  if(days>1){lines.push(distribution(rows,key,days));lines.push(L(`最近有效日 ${anchor.date} 為 ${anchor.scores?.[key]??'—'}/100，期間最低日 ${low.date} 為 ${low.scores[key]}/100。以下只引用最低日的實測，請區分歷史事件與此刻狀況。`,
   `Latest valid day ${anchor.date}: ${anchor.scores?.[key]??'—'}/100; lowest day ${low.date}: ${low.scores[key]}/100. Evidence below is from that date, not necessarily now.`,
   `최근 유효일 ${anchor.date}: ${anchor.scores?.[key]??'—'}점, 최저일 ${low.date}: ${low.scores[key]}점. 아래 수치는 최저일의 기록입니다.`,
   `最新有効日${anchor.date}：${anchor.scores?.[key]??'—'}点、最低日${low.date}：${low.scores[key]}点。以下は最低日の記録です。`));}
  if(risk===0)return [...lines,...adaptiveLines(key,low||anchor,days,rows)];
  const row=low||anchor,s=row.scores||{},input=realInputs[key]||[],f=feature(row);
  if(risk>=3)lines.push(allIndicatorBurden(row));
  const scoredComponents={cardio:['heart','breath'],activityRecovery:['energy','recovery','calm'],rhythm:['stable','calm'],calm:['heart','breath','hrv','sleep']};
  const components=scoredComponents[key]||[];
  if(components.length){const comps=components.filter(k=>finite(s[k]));
   lines.push(L(`在 ${row.date} 可核對的子項：${comps.map(k=>`${label[k]?.()||k} ${s[k]}/100`).join('、')}。其中高風險子項須優先查看；不能把缺測或健康項目當成同樣嚴重。`,
    `On ${row.date}, recorded sub-scores: ${comps.map(k=>`${label[k]?.()||k} ${s[k]}/100`).join('; ')}. Prioritize actually low components; do not call missing or healthy ones abnormal.`,
    `${row.date} 세부 점수: ${comps.map(k=>`${label[k]?.()||k} ${s[k]}점`).join(', ')}. 실제 낮은 항목을 먼저 확인하세요.`,
    `${row.date}の下位評価：${comps.map(k=>`${label[k]?.()||k} ${s[k]}点`).join('、')}。実際に低い項目を優先してください。`));}
  const facts=input.map(k=>({key:k,line:realMeasuredLine(k,row),deviation:finite(f[k])&&finite(row.baseline?.references?.[k]?.ref)&&row.baseline.references[k].ref>0?
   absPct(f[k],row.baseline.references[k].ref):null})).filter(x=>x.line);
  facts.sort((a,b)=>(b.deviation??-1)-(a.deviation??-1));
  const count=risk>=3?5:risk===2?2:1;
  lines.push(...facts.slice(0,count).map(x=>x.line));
  lines.push(...adaptiveLines(key,row,days,rows));
  if(risk<3)return [...lines,followUp(key,risk,row.date===currentDate())];
  const related=['heart','breath','hrv','stable','sleep','energy','recovery','calm'].filter(k=>finite(s[k])&&s[k]<60);
  lines.push(L(`【具體警戒依據】${row.date} 的${label[key]?.()||key}僅 ${s[key]}/100；同日其他可核對的高風險子項有 ${related.length?related.map(k=>`${label[k]?.()||k} ${s[k]}/100`).join('、'):'無其他已確認的低分子項'}。這是多指標監測結果，不是只憑顯示顏色製造的警訊。`,
   `EVIDENCE PRIORITY: On ${row.date}, ${label[key]?.()||key} was ${s[key]}/100. Other actually low monitored components: ${related.length?related.map(k=>`${label[k]?.()||k} ${s[k]}/100`).join('; '):'none verified'}. These are recorded scores, not invented clinical events.`,
   `측정 근거: ${row.date} ${label[key]?.()||key} ${s[key]}점. 확인된 다른 저점: ${related.length?related.map(k=>`${label[k]?.()||k} ${s[k]}점`).join(', '):'없음'}.`,
   `測定根拠：${row.date}の${label[key]?.()||key}は${s[key]}点。他の低い実測項目：${related.length?related.map(k=>`${label[k]?.()||k} ${s[k]}点`).join('、'):'確認なし'}。`));
  lines.push(L(`【偏離解讀】本項涉及 ${input.map(k=>L(...realField[k].slice(0,4))).join('、')}；應逐項看上面的有效數值、方向與品質，不能以一個數字推斷全部器官出問題。`,
   `DEVIATION CONTEXT: Inputs include ${input.map(k=>realField[k][1]).join(', ')}. Inspect actual readings, direction and quality; a low score alone does not prove organ damage.`,
   `편차 해석: ${input.map(k=>realField[k][2]).join(', ')} 등 기록을 함께 살피세요. 낮은 점수만으로 질병을 진단하지 않습니다.`,
   `偏差の解釈：${input.map(k=>realField[k][3]).join('、')}をそれぞれ確認してください。得点だけでは病気と診断できません。`));
  lines.push(L('【先核對佩戴與資料品質】檢查項圈鬆緊、寵物當時是否真正安靜、錄製時段及訊號品質；有缺測值的項目只能標示無資料，不得假填為異常。',
   'CHECK SIGNAL QUALITY: Verify collar fit, actual resting context, observed windows and signal validity. Missing measurements must never be filled with invented abnormalities.',
   '신호 품질 확인: 목걸이 착용·안정 상태·측정 구간·신호 유효성을 확인하세요. 결측치를 이상 수치로 채우지 않습니다.',
   '信号品質の確認：装着状態、安静条件、測定時間帯、信号の有効性を確認してください。欠測値を異常として補完しません。'));
  lines.push(L('【第一優先：直接觀察】現在親眼查看呼吸是否費力、是否能正常站立、意識反應及牙齦顏色。高風險監測分數要引起重視，但不能代替這些當下症狀判斷。',
   'FIRST: LOOK AT THE PET. Check breathing effort, ability to stand, alertness and gum colour now. A monitoring score cannot substitute for current clinical signs.',
   '우선 직접 관찰: 지금 호흡 곤란 여부, 기립 상태, 의식 반응, 잇몸 색을 확인하세요. 점수만으로 응급을 판단하지 않습니다.',
   'まず直接観察：今の呼吸の負担、起立、意識、歯ぐきの色を確認してください。得点は臨床症状の代わりになりません。'));
  lines.push(L('【現在就要做】先停止額外運動與負荷，讓寵物在安全、安靜的環境休息；確認最新有效紀錄是否仍有同樣偏離。',
   'ACT NOW: Pause additional exertion, allow safe quiet rest, and check whether the latest valid reading still shows the change.',
   '지금 해야 할 일: 추가 운동을 중단하고 조용히 쉬게 하며 최신 유효 기록에서도 변화가 이어지는지 확인하세요.',
   '今すぐ行うこと：運動を止め、安全で静かな場所で休ませ、最新の有効記録にも同じ変化があるか確認してください。'));
  lines.push(L('【需要立即急診的徵兆】若實際出現呼吸費力、舌頭或牙齦發藍、倒下、失去意識或無法站立，應立即聯絡獸醫急診；不應等待 App 再次評分。',
   'EMERGENCY SIGNS: Actual laboured breathing, blue tongue/gums, collapse, loss of consciousness or inability to stand needs emergency veterinary attention. Do not wait for another app score.',
   '응급 신호: 실제 호흡 곤란, 푸른 혀·잇몸, 쓰러짐, 의식 소실, 기립 불가는 즉시 응급 진료가 필요합니다.',
   '救急の徴候：実際の呼吸困難、青い舌や歯ぐき、虚脱、意識喪失、起立不能なら直ちに獣医救急へ。'));
  lines.push(L('【持續異常也不可忽略】如果安靜後仍持續偏離、精神食慾下降或多次讀數反覆嚴重偏差，應在當天聯絡獸醫，並提供日期與實測數值供判讀。',
   'PERSISTENT CHANGES MATTER: If deviations recur at rest or energy/appetite falls, contact a vet the same day and share dated actual measurements.',
   '지속적 이상도 중요합니다: 안정 시 반복되거나 활력·식욕이 떨어지면 당일 수의사에게 날짜와 측정 수치를 공유하세요.',
   '持続・反復も重要：安静時の変化が続く、元気や食欲が落ちる場合は当日獣医師に相談し、日時と数値を示してください。'));
  if(risk===4){lines.push(L('【極端低分需加強警戒】此項低於 20/100，偏離級別遠高於一般追蹤；現在就確認，不要將「稍快」「稍少」「觀察看看」當成足夠的說明。',
   'EXTREME SCORE: Below 20/100 requires immediate attention to the verified change; calling it merely “slightly off” would understate the monitoring result.',
   '극단적 저점: 20점 미만이면 확인된 변화에 지금 주의를 기울여야 하며 가벼운 편차로 표현하면 안 됩니다.',
   '極端な低得点：20点未満なら直ちに記録と状態を照合してください。軽い変化として扱いません。'));}
  lines.push(L('【判讀界線】分數是有效量測與可比參考下的監測偏離，不是心臟病、呼吸衰竭、心律不整或任何疾病的確診；疑慮須由獸醫檢查。',
   'LIMITATION: A monitoring score is not a diagnosis of heart disease, respiratory failure, arrhythmia or any other illness. Veterinary assessment is required.',
   '해석의 한계: 측정 점수는 심장병·호흡 부전·부정맥 등의 진단이 아닙니다. 필요하면 수의사 진찰을 받으세요.',
   '判定の限界：監視スコアは心疾患・呼吸不全・不整脈などの確定診断ではありません。必要なら獣医師へ。'));
  return lines.filter(Boolean);
 }
 function explanation(key,rows,days){
  if(!rows.length)return [];
  if(rows.some(x=>x?.source==='20hz-waveform'))return realExplanation(key,rows,days);
  const anchor=latest(rows),value=days===1?anchor.scores?.[key]:average(rows,key),averageRisk=tier(value);
  const lowRow=days===1?anchor:lowestRow(rows,key),worst=lowRow?.scores?.[key];
  const risk=periodRisk(rows,key,days),historicalAlert=days>1&&finite(worst)&&worst<60;
  const selectedPastAlert=days===1&&anchor.date!==currentDate()&&risk>=3;
  if(risk===-1)return [lead(value,key)];
  const lines=[historicalAlert?historicalHighRiskLead(key,rows,days):selectedPastAlert?selectedPastHighRiskLead(key,anchor):lead(value,key)];
  if(days>1)lines.push(distribution(rows,key,days));
  if(days>1&&finite(worst)&&worst<20&&averageRisk<4&&!historicalAlert){
   lines.push(L(`【期間內曾有極端異常】儘管 ${days} 天平均是 ${value}/100（${risk===0?'健康':risk===1?'低風險':risk===2?'中風險':'高風險'}），${lowRow.date} 的單日${label[key]()}竟只有 ${worst}/100。平均值不能抹掉這一天的警訊；請查看當天多項數據及最新有效日，若此刻仍有呼吸費力、虛脫或發紺等徵兆立即就醫。`,`SEVERE DAY WITHIN THE PERIOD: Although the ${days}-day mean is ${value}/100, on ${lowRow.date} the daily ${label[key]()} score fell to ${worst}/100. The mean must not hide this day. Review that date and the latest reading; current respiratory distress, collapse or blue gums needs emergency care.`,`기간 내 극단적 이상일: ${days}일 평균 ${value}점과 달리 ${lowRow.date}의 ${label[key]()} 점수는 ${worst}점이었습니다. 평균이 위험한 하루를 가리게 해서는 안 됩니다. 최신 상태를 확인하세요.`,`期間内の著しい異常日：${days}日平均${value}点でも${lowRow.date}の${label[key]()}は${worst}点でした。平均で最低日を見落とさず、現在の状態と照合してください。`));
  }
  if(risk===0)return [...lines,...adaptiveLines(key,lowRow||anchor,days,rows)];
  if(days>1){
   const initial=rows[0]?.scores?.[key],now=anchor.scores?.[key];
   lines.push(L(`這段時間最低是 ${lowRow.date} 的 ${lowRow.scores[key]}/100，最近有效日 ${anchor.date} 為 ${now}/100；首個有效日是 ${initial}/100。請優先看低分日期，不要被期間平均掩蓋。`,
    `Lowest day: ${lowRow.date} (${lowRow.scores[key]}/100); most recent valid day: ${anchor.date} (${now}/100); first valid day: ${initial}/100. The average must not hide a severe day.`,
    `최저 ${lowRow.date} ${lowRow.scores[key]}점, 최근 ${anchor.date} ${now}점, 최초 유효일 ${initial}점입니다.`,
    `最低は${lowRow.date}の${lowRow.scores[key]}点、直近${anchor.date}は${now}点、初日${initial}点です。`));
  }
  if(risk>=2){
   const useWorst=days>1&&risk>=3&&lowRow;
   const componentsLine=contributingScores(key,useWorst?[lowRow]:days===1?[anchor]:rows);
   if(componentsLine){
    if(useWorst)lines.push(L(`以下分項屬 ${lowRow.date} 的實際低分當天，不是整個 ${days} 天的平均子分。`,`The following components are from the actual low-scoring day ${lowRow.date}, not mean component values over ${days} days.`,`아래 세부 점수는 ${days}일 평균이 아니라 ${lowRow.date}의 실제 최저일 기록입니다.`,`以下の下位評価は${days}日間の平均ではなく、最低点の日${lowRow.date}の記録です。`));
    lines.push(componentsLine);
   }
  }
  // Multi-day explanations MUST cite a real low day: the most recent reading
  // may be healthy even while the 7-/30-day composite is a risk result.
  const principal=lowRow||anchor;
  if(principal!==anchor&&risk>=2)lines.push(L(`以下具體數值取自最低分的 ${principal.date}，不是隨意用最後一天代替整段期間。`,`The following measured evidence comes from the lowest-scoring day, ${principal.date}, not a convenient final-day snapshot.`,`다음 수치는 최저일 ${principal.date}의 실제 기록입니다.`,`以下は最低日${principal.date}の測定値です。`));
  if(risk>=3)lines.push(allIndicatorBurden(principal));
  // The old slice(0,5) hid most of the actual scored reasons. The complete
  // ledger below now emits every verified observation and every subscore for
  // a high-risk day, with explicit missing-reference notices when necessary.
  lines.push(...adaptiveLines(key,principal,days,rows));
  if(risk>=3){
   lines.push(...urgentContext(key,principal));
   if(days>1&&principal.date!==anchor.date&&anchor.scores?.[key]<60){
    lines.push(L(`最近有效日 ${anchor.date} 仍只有 ${anchor.scores[key]}/100，代表嚴重異常並未在這段記錄內完全解除。`,`The latest valid day ${anchor.date} is still only ${anchor.scores[key]}/100, so the severe low has not fully resolved.`,`최근 유효일 ${anchor.date}도 ${anchor.scores[key]}점으로 낮은 상태가 이어집니다.`,`直近の${anchor.date}も${anchor.scores[key]}点で、低い状態が続いています。`));
   }
  }
  lines.push(followUp(key,risk,principal?.date===currentDate()));
  if(risk>=3)lines.push(L('注意：上述是有效量測偏差與監測風險，不能單靠分數確診疾病；是否需要緊急處置須看寵物當下的呼吸、意識與精神等症狀。','These are measured deviations and monitoring-risk signals, not a diagnosis. Urgency depends on current breathing, consciousness and condition.','이는 측정 편차와 관찰 위험이며 진단이 아닙니다. 응급 여부는 실제 증상에 따라 결정됩니다.','測定差と監視上のリスクを示すもので診断ではありません。緊急性は実際の症状で判断してください。'));
  return lines.filter(Boolean);
 }
 function showLines(node,lines,score,whole=false,forcedRisk=null){if(!node||!lines?.length)return;
  const risk=forcedRisk??tier(score),parent=document.createElement('div');
  parent.className='dp116-evidence-copy dp117-risk-'+(risk>=3?'high':risk===2?'medium':risk===1?'low':'healthy')+(risk===4?' dp120-risk-extreme':'');
  const title=document.createElement('p');title.className='dp117-risk-lead';title.textContent=lines[0];parent.append(title);
  if(risk>=3&&lines.length>1){
   const list=document.createElement('ol');list.className='dp117-risk-reasons';
   for(const part of lines.slice(1)){if(!part)continue;const li=document.createElement('li');li.textContent=part;if(/^(【先看真正原因】|【這個分數主要差在哪裡】|WHY THE SCORE IS LOW|WHAT CHANGED|점수가 낮은 이유|어떤 점이 달라졌나요|低い点数の理由|何が変わった)/.test(part))li.classList.add('dp126-owner-core');list.append(li);}
   parent.append(list);
  }else for(const part of lines.slice(1)){if(!part)continue;const p=document.createElement('p');p.textContent=part;parent.append(p);}
  if(whole)node.replaceChildren(parent);else node.replaceWith(parent);
 }
 function updateDeep(){if(state.tab!=='deep'||state.detail||!document.querySelector('#app .dp-owner-deep'))return;
  const days=[1,7,30].includes(Number(state.range))?Number(state.range):1,rows=period(days),kind=Number(state.deepType),rootEl=document.querySelector('#app .dp-owner-deep');
  // Protect real-collar profiles against borrowed demo values, but never
  // ignore valid demo days just because old builds forgot to ship references.
  if(!rows.length||!(evidence(latest(rows))||latest(rows)?.source==='20hz-waveform'))return;
  const shown=k=>days===1?latest(rows).scores?.[k]:average(rows,k);
  if(kind===0){showLines(rootEl.querySelector('.dp903-overview-copy>p'),explanation('cardio',rows,days),shown('cardio'),false,periodRisk(rows,'cardio',days));
   ['heart','breath','hrv','stable'].forEach(k=>showLines(rootEl.querySelector(`[data-dp903-metric="${k}"] .dp903-metric-left>p`),explanation(k,rows,days),shown(k),false,periodRisk(rows,k,days)));
  }else if(kind===1)showLines(rootEl.querySelector('.dp1052-sleep-reason'),explanation('sleep',rows,days),shown('sleep'),false,periodRisk(rows,'sleep',days));
  else if(kind===2){const card=rootEl.querySelector('.dp901-health-score');if(!card)return;
   const top=days===1?card.querySelector('.dp901-overall-desc'):card.querySelector('.dp901-period-notes');
   // Period notes used to have THREE older paragraphs. Replace the full
   // block so no contradictory leftover one-liners survive underneath.
   showLines(top,explanation('activityRecovery',rows,days),shown('activityRecovery'),days>1,periodRisk(rows,'activityRecovery',days));
   const cards=card.querySelectorAll('.dp901-metric-card');['energy','recovery','calm'].forEach((k,i)=>showLines(cards[i]?.querySelector('.dp901-metric-desc'),explanation(k,rows,days),shown(k),false,periodRisk(rows,k,days)));}
 }
 // Earlier screen wrappers (10.68 / 10.111 / 10.121) still replace the
 // detailed waveform, sleep and energy-page reasons with one generic sentence.
 // These nested pages are as important as the three Deep overview screens.
 // Rebuild their explanation from the same dated score and evidence source.
 function updateDetail(){
  if(state.tab!=='deep'||!state.detail||root.DeepPetUX1068?.isEmpty?.())return;
  const detail=state.detail;
  const key=detail==='dp90-waveform'?(state.dp90WaveKind==='breath'?'breath':'heart'):
   detail==='dp905-sleep-day'?'sleep':
   ['dp905-energy-day','dp936-energy-detail','dp908-energy-calendar'].includes(detail)?'energy':null;
  if(!key)return;
  const card=document.querySelector('#app .dp1068-detail-score');
  const reason=card?.querySelector('.dp1068-detail-why>p');
  if(!reason)return;
  const specifiedRange=state.dp905WaveMode==='period'&&[7,30].includes(Number(state.dp905WaveRange))?Number(state.dp905WaveRange):0;
  const days=detail==='dp908-energy-calendar'?
   ([7,30].includes(Number(state.range))?Number(state.range):7):
   specifiedRange||([7,30].includes(Number(state.dp932WaveDays))&&state.dp905WaveMode==='period'?Number(state.dp932WaveDays):1);
  const date=key==='energy'?
   (detail==='dp936-energy-detail'?(state.dp936EnergyDate||state.dp905ChosenDate||state.deepSelectedDate):
    (state.dp905ChosenDate||state.dp936EnergyDate||state.deepSelectedDate)):
   key==='sleep'?state.dp905ChosenDate:
   state.dp905WaveMode==='day'?(state.dp905ChosenDate||state.dp90WaveDate):state.dp90WaveDate;
  const rows=days===1&&/^\d{4}-\d{2}-\d{2}$/.test(date||'')?
   all().filter(x=>x?.date===date&&finite(x.scores?.physiol)):
   period(days);
  if(!rows.length||!(evidence(latest(rows))||latest(rows)?.source==='20hz-waveform'))return;
  const shown=days===1?latest(rows).scores?.[key]:average(rows,key);
  const oldRing=Number(card.querySelector('.dp1068-detail-ring')?.textContent?.trim());
  // A stale or different legacy window must not display one score beside
  // another score's explanation. Only enhance matching render states.
  if(!finite(shown)||!finite(oldRing)||Math.abs(Math.round(shown)-Math.round(oldRing))>1)return;
  const lines=explanation(key,rows,days),risk=periodRisk(rows,key,days);
  if(!lines.length)return;
  showLines(reason,lines,shown,false,risk);
  card.classList.add('dp122-detail-evidence');
  if(days>1)card.classList.add('dp122-detail-period');
  if(risk===4)card.classList.add('dp122-detail-extreme');
 }
 // V10.50's scope() was still taking every day/date from demoRecords(), even
 // for a real pet with 20-Hz verified SDK days. As a result a genuinely
 // measured pet could show N/A or borrow a gallery date in detailed views.
 // Keep the gallery calendar path intact; isolate the real source completely.
 if(root.DeepPetUX1050&&typeof root.DeepPetUX1050.scope==='function'){
  const legacyScope=root.DeepPetUX1050.scope;
  root.DeepPetUX1050.scope=function(days=1){
   if(typeof dpUsesRealMeasurements!=='function'||!dpUsesRealMeasurements(state.dog))return legacyScope.apply(this,arguments);
   const range=[1,7,30].includes(Number(days))?Number(days):1;
   const detail=state.detail;
   const detailDate=detail==='dp90-waveform'&&state.dp905WaveMode==='day'?
    (state.dp905ChosenDate||state.dp90WaveDate):
    detail==='dp905-sleep-day'?state.dp905ChosenDate:
    ['dp905-energy-day','dp936-energy-detail'].includes(detail)?
     (state.dp936EnergyDate||state.dp905ChosenDate):null;
   const selected=detailDate||state.deepSelectedDate;
   const chosen=range===1&&/^\d{4}-\d{2}-\d{2}$/.test(selected||'')?selected:currentDate();
   const end=Date.parse(chosen+'T12:00:00Z');
   const features=new Map((root.DeepPetSignalScoring?.getFeatures?.(state.dog)||[])
    .filter(x=>x?.date).map(x=>[x.date,x]));
   return (root.DeepPetSignalScoring?.getDaily?.(state.dog)||[])
    .filter(x=>x?.source==='20hz-waveform'&&finite(x?.scores?.physiol)&&
     Date.parse(x.date+'T12:00:00Z')<=end&&Date.parse(x.date+'T12:00:00Z')>end-range*86400000)
    .sort((a,b)=>a.date.localeCompare(b.date))
    .map(x=>({row:{date:x.date,...(features.get(x.date)||{}),source:'20hz-waveform'},scores:x.scores}));
  };
 }
 const oldDeepItems=dpTodayDeepItems;
 dpTodayDeepItems=function(...args){const out=oldDeepItems.apply(this,args),row=today();if(!(evidence(row)||row?.source==='20hz-waveform'))return out;
  const domain={heart:0,breath:0,hrv:0,stable:0,sleep:1,energy:2,recovery:2,calm:2};
  for(const item of out){if(!/^deep-[012]$/.test(String(item.id)))continue;
   const key=['cardio','sleep','activityRecovery'][item.index];const lines=explanation(key,[row],1);
   if(lines.length){item.detail=lines[0];item.lines=lines;item.priority=tier(item.score)>=3?0:item.priority;}}
  const added=[];for(const [key,index] of Object.entries(domain)){
   const n=row.scores?.[key];if(!finite(n)||n>=30)continue;
   const lines=explanation(key,[row],1);
   // Multiple independently abnormal measured indicators deserve separate
   // high-priority follow-up cards, not fabricated simultaneous acute events.
   if(lines.length)added.push({id:'deep-metric-'+key,type:'deep',index,score:n,
    title:L('高優先追蹤','Priority follow-up','우선 확인','優先確認')+' · '+label[key]()+` ${n}/100`,
    detail:lines[0],lines,page:'deep',icon:index===1?'moon':index===2?'activity':'heart',priority:0,date:currentDate()});
  }
  return [...out,...added].sort((a,b)=>a.priority-b.priority||(a.score??100)-(b.score??100));
 };
 // A 3/100 action cannot retain the inherited generic 「分數偏低」 subtitle.
 // Use the actual item score; never attach a severity label to a non-scored task.
 const previousActionCard=dpTodayActionCard;
 dpTodayActionCard=function(item){
  const markup=previousActionCard(item);
  if(item?.type!=='deep'||!finite(item.score))return markup;
  const score=item.score;
  const status=score<20?L('極端高風險 · 立即停止負荷、休息並檢查','Extreme high risk · stop exertion and check now','극단적 고위험 · 운동 중단 및 즉시 확인','極端な高リスク · 運動中止・直ちに確認'):
   score<60?L('高度警戒 · 高風險，現在就核對異常','High alert · high risk, check now','높은 경계 · 고위험, 지금 확인','高度警戒・高リスク、今すぐ確認'):
   score<80?L('中風險 · 需要重視及追蹤','Moderate risk · follow up closely','중위험 · 주의 깊게 추적','中リスク · 注意して経過観察'):
   score<90?L('低風險 · 留意下次變化','Low risk · watch next reading','저위험 · 다음 변화 관찰','低リスク · 次の変化を確認'):
   L('今日量測觀察','Today’s measurement review','오늘 측정 검토','本日の測定確認');
  return markup.replace(/(<div class="ai-suggestion-sub">)[\s\S]*?(<\/div>)/,(_,open,close)=>open+status+close);
 };
 const prevRender=render;
 render=function(...args){const ret=prevRender.apply(this,args);updateDeep();updateDetail();return ret;};
 // The full examination card must be clickable, including its blank padding.
 document.addEventListener('click',e=>{
  const summary=e.target?.closest?.('.dp1015-evidence-card>summary');
  if(summary){e.preventDefault();e.stopPropagation();const details=summary.parentElement;details.open=!details.open;return;}
  const card=e.target?.closest?.('.dp916-health-card,.dp916-home-card');
  if(card&&!e.target.closest('button,a,input,select,details')){e.preventDefault();root.DeepPetExam921?.showList?.();}
 },true);
 root.DeepPetEvidenceNarrative124=Object.freeze({version:'10.126',period,explanation,quantified,updateDeep,updateDetail,allIndicatorBurden,adaptiveLines});
 root.DeepPetEvidenceNarrative125=root.DeepPetEvidenceNarrative124;
 root.DeepPetBuildVersion='10.126';
 document.querySelectorAll?.('#app .app-build-version')?.forEach(el=>{el.textContent='DeepPet Version 10.126';});
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.126',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'evidence-first-four-language-low-score-copy','score-tiered-today-action-labels','all-pet-longitudinal-eligibility',
  'per-pet-nearby-and-chat','lab-four-risk-levels-and-priority-sorting','risk-tiered-day-7-30-reason-lists','shipped-score-baseline-evidence',
  'tier-extreme-critical-vigilance','primary-veterinary-triage-language','nested-deep-detail-dated-evidence',
  'hrv-shared-signal-provenance','historical-vs-present-risk','severe-day-within-average-warning',
  'all-eight-monitored-subscores-by-risk-tier','four-tier-component-burden',
  '16-adaptive-score-bands','measured-scenario-rule-selection','historical-context-safe-adaptive-explanations',
  'all-eight-fully-measured-causes','unlimited-high-risk-evidence-ledger','period-wide-all-component-severity-counts']};
 // The main bundle renders once before this final evidence layer is loaded.
 // Refresh that first screen so a restored pet is not left with pre-10.122
 // one-line language until its owner changes tabs for the first time.
 if(typeof setTimeout==='function'&&typeof render==='function'&&
    document.querySelector?.('#app .app-main')){
  setTimeout(()=>{try{render(false);}catch(error){console.error('DeepPet initial evidence refresh',error);}},0);
 }
})(window);
