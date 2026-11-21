/* DeepPet V10.124 · owner-facing adaptive risk explanation engine.
 * Declarative 16 score bands + evidence-conditional scenario families.
 * No preset pet scores, diagnoses, unsupported symptoms or fabricated alerts.
 */
(function(root){'use strict';
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 const number=v=>finite(v)?(Math.round(v*10)/10).toFixed(1):'—';
 const bands=[
  [0,9,'E01',['極端高風險・最高監測警戒','EXTREME RISK · HIGHEST MONITORING ALERT','극단적 고위험 · 최고 감시 경고','極端な高リスク・最高度の監視警戒']],
  [10,19,'E02',['極端高風險・重大異常','EXTREME RISK · MAJOR DEVIATION','극단적 고위험 · 중대한 편차','極端な高リスク・重大な変化']],
  [20,29,'H01',['高風險・非常嚴重','HIGH RISK · VERY SEVERE CHANGE','고위험 · 매우 심한 변화','高リスク・非常に大きな変化']],
  [30,39,'H02',['高風險・顯著惡化','HIGH RISK · SUBSTANTIAL CHANGE','고위험 · 뚜렷한 변화','高リスク・著しい変化']],
  [40,49,'H03',['高風險・多項需優先核對','HIGH RISK · PRIORITY REVIEW','고위험 · 우선 확인','高リスク・優先的な確認']],
  [50,59,'H04',['高風險・不可忽略的偏離','HIGH RISK · IMPORTANT DEVIATION','고위험 · 무시할 수 없는 변화','高リスク・見過ごせない変化']],
  [60,64,'M01',['中風險・接近高風險界線','MODERATE RISK · NEAR HIGH-RISK BAND','중위험 · 고위험 경계에 근접','中リスク・高リスク帯に近い']],
  [65,69,'M02',['中風險・明顯偏離','MODERATE RISK · MARKED DIFFERENCE','중위험 · 뚜렷한 편차','中リスク・明確な差']],
  [70,74,'M03',['中風險・需要密切追蹤','MODERATE RISK · CLOSE FOLLOW-UP','중위험 · 면밀한 추적 필요','中リスク・注意深い追跡']],
  [75,79,'M04',['中風險・需要持續關注','MODERATE RISK · FOLLOW UP','중위험 · 지속 관찰','中リスク・経過観察']],
  [80,82,'L01',['低風險・接近中風險界線','LOW RISK · NEAR MODERATE BAND','저위험 · 중위험 경계에 근접','低リスク・中リスク帯に近い']],
  [83,85,'L02',['低風險・輕度偏離','LOW RISK · MILD DEVIATION','저위험 · 가벼운 편차','低リスク・軽い変化']],
  [86,89,'L03',['低風險・接近健康範圍','LOW RISK · NEAR HEALTHY BAND','저위험 · 건강 범위에 근접','低リスク・健康帯に近い']],
  [90,94,'N01',['健康・持續觀察','HEALTHY · CONTINUE ROUTINE CHECKS','건강 · 일상 관찰 지속','健康・通常の観察を継続']],
  [95,97,'N02',['健康・整體穩定','HEALTHY · GENERALLY STEADY','건강 · 전반적으로 안정','健康・おおむね安定']],
  [98,100,'N03',['健康・接近個體基準','HEALTHY · CLOSE TO REFERENCE','건강 · 기준에 근접','健康・基準に近い']]
 ].map(([lo,hi,id,labels])=>Object.freeze({lo,hi,id,labels}));
 // Real production inputs may be decimal scores. Normalizing before lookup
 // prevents gaps such as 9.5, but an invalid/out-of-range score is never rated.
 const whole=s=>finite(s)&&s>=0&&s<=100?Math.round(s):null;
 const risk=s=>{const n=whole(s);return n===null?-1:n<20?4:n<60?3:n<80?2:n<90?1:0;};
 const band=score=>{const n=whole(score);return n===null?null:bands.find(b=>n>=b.lo&&n<=b.hi)||null;};
 // Score-specific intervention intensity is distinct in all 16 bands.
 // The reading-specific reasons are selected separately from the rules below.
 const bandAdvice={
  E01:['【最高優先】極端偏離不可延後核對：現在先親眼看呼吸、意識、站立與精神，再逐項檢查有效讀數；若已有急症徵兆立即就醫。','HIGHEST PRIORITY: Inspect breathing, awareness and ability to stand now; verify valid readings. Emergency signs require emergency care.','최고 우선: 지금 호흡·의식·기립 상태와 유효 수치를 확인하고 응급 증상이 있으면 즉시 진료받으세요.','最優先：今の呼吸・意識・起立と有効な測定値を確認し、救急症状があれば直ちに受診してください。'],
  E02:['【極高度警戒】重大偏離應立刻再次核對安靜條件、配戴與多項讀數；如果異常仍在或精神變差，應儘快請獸醫評估。','EXTREME ALERT: Promptly recheck resting context, fit and multiple readings; promptly seek veterinary input if persistent or condition worsens.','극고위험: 안정 조건·착용·다수 측정값을 즉시 재확인하고 지속되면 신속히 진료받으세요.','極めて強い警戒：安静条件・装着・複数の記録を直ちに確認し、持続する場合は早期受診してください。'],
  H01:['【非常嚴重的監測偏離】請優先查明最差的測量項目及其變化幅度，暫停不必要的活動負荷，今天安排專業諮詢。','VERY SEVERE MONITORING DEVIATION: Review the largest measured changes first, avoid unnecessary exertion and arrange professional advice today.','매우 심한 감시 편차: 가장 큰 측정 변화부터 확인하고 무리한 활동을 피하며 오늘 상담하세요.','非常に大きな監視上の差：最大の変化を先に確認し、無理な運動を避けて当日相談してください。'],
  H02:['【顯著惡化警示】請把今天的實測與同條件基準並排查看，核對是否連續惡化；若反覆出現，盡快與獸醫討論。','SUBSTANTIAL CHANGE: Compare matched measurements side by side and check for repeated deterioration; contact a vet promptly if recurring.','현저한 변화: 같은 조건의 기준과 대조하고 반복 악화되면 빠르게 수의사에게 문의하세요.','著しい変化：同条件の基準と並べて比較し、反復して悪化する場合は早めに相談してください。'],
  H03:['【高優先檢查】多項記錄偏離時，先處理分數最低且有實際讀數支持的項目，再看是否同步影響休息與活動。','PRIORITY REVIEW: Start with the worst score supported by measured readings, then check coincident rest and activity changes.','우선 확인: 실제 수치로 뒷받침되는 가장 낮은 지표부터 보고 휴식·활동 변화를 함께 살피세요.','優先確認：実測に裏付けられた最低項目から確認し、休息と活動の変化も見てください。'],
  H04:['【不能忽略】已越過高風險界線；請確認是否測量條件改變，並安排近期追蹤，不能只用一句「略有偏差」帶過。','DO NOT DISMISS: This is below the high-risk boundary. Verify measurement context and arrange a near-term follow-up.','무시하지 마세요: 고위험 경계 아래이므로 측정 조건을 확인하고 조속히 재평가하세요.','見過ごさないでください：高リスクの境界を下回るため測定条件を確認し、早期に追跡してください。'],
  M01:['【接近高風險】請優先查看數值偏差最大的子項；若下次有效日繼續下降，應提高追蹤密度並諮詢獸醫。','NEAR HIGH RISK: Review the largest deviation; increase follow-up and seek advice if the next valid reading declines.','고위험에 근접: 가장 큰 편차를 확인하고 다음 유효 측정에서 더 악화되면 상담하세요.','高リスクに近い状態：最大の差を確認し、次の有効記録でも低下するなら相談してください。'],
  M02:['【中度但明顯】對照同一寵物的有效基準，特別留意是否有不只一項同步偏離，近期重新測量確認。','MARKED MODERATE CHANGE: Compare personal reference and check whether more than one measure changed together; recheck soon.','뚜렷한 중간 위험: 개별 기준과 비교하고 여러 지표 동시 변화를 확인한 뒤 조속히 재측정하세요.','明確な中程度の変化：個体基準と複数項目を照合し、近いうちに再測定してください。'],
  M03:['【持續追蹤】有足夠偏離值得留意；在相同休息／活動條件下看下一批數據，記錄是否進一步下降。','CONTINUED FOLLOW-UP: Repeat under comparable rest/activity context and record whether the next reading worsens.','지속 추적: 유사한 휴식·활동 조건에서 다음 측정을 비교하며 악화 여부를 기록하세요.','継続追跡：同じ休息・活動条件で次の記録と比べ、悪化の有無を記録してください。'],
  M04:['【早期提醒】目前屬中風險較輕的區段；留意重複偏離與日常精神活動，不必因單次分數推定疾病。','EARLY MODERATE NOTICE: Watch for repeat deviations and daily activity; one score alone does not establish illness.','중위험 초기 알림: 반복 편차와 일상 활력을 관찰하고 점수 하나로 질병을 단정하지 마세요.','中リスクの早期通知：反復と日常の元気を観察し、単一の点数で病気とは判断しません。'],
  L01:['【低風險但接近中風險】留意有沒有新的子項一起下降，下一次有效資料請與今天並列比較。','LOW RISK NEAR MODERATE: Watch for additional declining sub-indices and compare the next valid reading.','중위험 경계에 가까운 저위험: 다른 지표 저하 여부를 살피고 다음 기록과 비교하세요.','中リスクに近い低リスク：他の項目の低下に注意し、次回の記録と比較してください。'],
  L02:['【輕度偏離】不需要因單次結果過度緊張，維持正常觀察，看看這項數字是否回到個體習慣。','MILD DEVIATION: Continue routine observation and see whether this measurement returns toward personal reference.','가벼운 편차: 평소 관찰을 유지하고 개인 기준으로 돌아오는지 확인하세요.','軽い変化：通常の観察を続け、個体基準に戻るか確認してください。'],
  L03:['【接近健康】整體變化輕微，保留讀數與日期，作為未來比較的參考。','NEAR HEALTHY: Keep the dated measurement as reference for future comparison.','건강 범위에 근접: 날짜와 수치를 보관해 다음 비교에 활용하세요.','健康域に近い状態：日付と測定値を残し、次回比較に役立ててください。'],
  N01:['【健康範圍】繼續規律觀察，若後續有持續改變再對照個體平常水準。','HEALTHY RANGE: Continue routine checks and compare any persistent later change with personal baseline.','건강 범위: 일상 확인을 이어 가고 변화가 지속되면 개별 기준과 비교하세요.','健康範囲：通常の確認を続け、持続する変化があれば個体基準と比較してください。'],
  N02:['【整體穩定】目前監測分數與既有參考相近，照常維持休息與活動紀錄即可。','GENERALLY STEADY: The monitoring score is close to reference; maintain normal rest/activity tracking.','전반적으로 안정: 평소 휴식·활동 기록을 유지하세요.','概ね安定：通常どおり休息と活動の記録を続けてください。'],
  N03:['【接近最佳區間】目前沒有由此項分數顯示的明顯偏離；維持正常觀察，毋須額外警報。','CLOSE TO TOP BAND: No material deviation is indicated by this score; continue routine checks without extra alarm.','최상위 구간에 근접: 이 점수에서 뚜렷한 편차가 보이지 않아 일상 관찰을 유지하세요.','最上位帯に近い状態：この点数では大きな変化は示されず、通常の観察を続けてください。']
 };
 const T=(c,tw,en,ko,ja)=>c.translate(tw,en,ko,ja);
 const val=(c,k)=>c.features?.[k];
 const ref=(c,k)=>c.references?.[k];
 const shift=(c,k)=>finite(val(c,k))&&finite(ref(c,k))&&ref(c,k)>0?
  Math.round(100*(val(c,k)-ref(c,k))/ref(c,k)):null;
 const drop=(c,k)=>finite(shift(c,k))?-shift(c,k):null;
 const available=(c,k)=>finite(val(c,k))&&finite(ref(c,k))&&ref(c,k)>0;
 const sub=c=>Object.entries(c.scores||{}).filter(([k,v])=>
  ['heart','breath','hrv','stable','sleep','energy','recovery','calm'].includes(k)&&finite(v));
 const count=(c,a,b)=>sub(c).filter(([,v])=>v>=a&&v<b).length;
 const has=(c,...names)=>names.includes(c.key);
 const between=(c,a,b)=>c.risk>=a&&c.risk<=b;
 const isOneDayApart=(a,b)=>a&&b&&/\d{4}-\d{2}-\d{2}/.test(a)&&/\d{4}-\d{2}-\d{2}/.test(b)&&
  (Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))===86400000;
 function trailing(c){return (c.history||[]).filter(x=>x?.date<=c.date&&finite(x.scores?.[c.key])).sort((a,b)=>a.date.localeCompare(b.date));}
 const prev=c=>trailing(c).filter(x=>x.date<c.date).at(-1)||null;
 const transition=c=>{const old=prev(c)?.scores?.[c.key];return finite(old)?Math.round(c.score-old):null;};
 const groupOf=id=>id.includes('heart')?'heart':id.includes('breath')?'breath':
  id.includes('sleep')?'sleep':id.includes('hrv')?'hrv':id.includes('energy')?'energy':
  id.includes('recovery')?'recovery':id.includes('stability')?'stability':id;
 const make=(id,keys,minRisk,priority,test,copy)=>({id,keys,minRisk,priority,test,copy,group:groupOf(id)});
 const rules=[
  make('heart-rising-over40',['heart','cardio','calm','rhythm'],2,110,c=>shift(c,'quietHeartRate')>=40,
   c=>T(c,`【安靜心率大幅上升】${number(val(c,'quietHeartRate'))} bpm，參考 ${number(ref(c,'quietHeartRate'))} bpm，增幅 ${shift(c,'quietHeartRate')}%。這是安靜時也存在的巨大差距；請核實寵物是否真正安靜、佩戴是否正常及當下精神與呼吸。`,`RESTING HEART RATE SHARPLY HIGHER: ${number(val(c,'quietHeartRate'))} versus ${number(ref(c,'quietHeartRate'))} bpm (+${shift(c,'quietHeartRate')}%). Verify true rest, collar contact, current breathing and alertness.`,`안정 시 심박이 ${number(val(c,'quietHeartRate'))}bpm으로 기준 ${number(ref(c,'quietHeartRate'))}보다 ${shift(c,'quietHeartRate')}% 높습니다. 안정 상태·착용·호흡을 확인하세요.`,`安静時心拍${number(val(c,'quietHeartRate'))}bpm、基準${number(ref(c,'quietHeartRate'))}bpmより${shift(c,'quietHeartRate')}%高い状態です。安静条件と呼吸を確認してください。`)),
  make('heart-rising-over20',['heart','cardio','calm','rhythm'],1,72,c=>shift(c,'quietHeartRate')>=20,
   c=>T(c,`安靜心率 ${number(val(c,'quietHeartRate'))} bpm，比有效參考 ${number(ref(c,'quietHeartRate'))} bpm 高 ${shift(c,'quietHeartRate')}%；請在相似安靜條件下追蹤是否持續。`,`Resting heart ${number(val(c,'quietHeartRate'))} bpm is ${shift(c,'quietHeartRate')}% above ${number(ref(c,'quietHeartRate'))} bpm; compare under like-for-like quiet conditions.`,`안정 시 심박 ${number(val(c,'quietHeartRate'))}bpm으로 기준보다 ${shift(c,'quietHeartRate')}% 높습니다.`,`安静時心拍${number(val(c,'quietHeartRate'))}bpmで基準より${shift(c,'quietHeartRate')}%高く、同条件で再確認してください。`)),
  make('heart-falling-over20',['heart','cardio','calm','rhythm'],1,86,c=>drop(c,'quietHeartRate')>=20,
   c=>T(c,`【心率偏低而非偏快】安靜心率 ${number(val(c,'quietHeartRate'))} bpm，較可比參考低 ${drop(c,'quietHeartRate')}%。方向是下降，不能誤寫成心跳加速；請核對當時是否睡眠、訊號品質及目前活動精神。`,`LOWER, NOT FASTER HEART RATE: Resting ${number(val(c,'quietHeartRate'))} bpm is ${drop(c,'quietHeartRate')}% below reference. Do not label this as rapid heartbeats; check sleep context, signal quality and the pet's condition.`,`심박이 빠른 것이 아니라 낮습니다. 안정 시 ${number(val(c,'quietHeartRate'))}bpm으로 기준보다 ${drop(c,'quietHeartRate')}% 낮습니다.`,`頻脈ではなく心拍数の低下です。安静時${number(val(c,'quietHeartRate'))}bpmで基準より${drop(c,'quietHeartRate')}%低く、睡眠状態と信号を確認してください。`)),
  make('breath-rising-over40',['breath','cardio','calm'],2,112,c=>shift(c,'quietBreathRate')>=40,
   c=>T(c,`【安靜呼吸明顯加快】${number(val(c,'quietBreathRate'))} 次／分，比參考 ${number(ref(c,'quietBreathRate'))} 次／分高 ${shift(c,'quietBreathRate')}%。立即親眼看胸腹起伏、是否呼吸費力；若合併開口喘氣、發紺或虛脫，立即尋求獸醫急診。`,`RESTING BREATHING MARKEDLY FASTER: ${number(val(c,'quietBreathRate'))}/min versus ${number(ref(c,'quietBreathRate'))}/min (+${shift(c,'quietBreathRate')}%). Observe actual breathing effort now. Laboured breathing, blue gums or collapse requires emergency veterinary care.`,`안정 시 호흡 ${number(val(c,'quietBreathRate'))}회/분, 기준보다 ${shift(c,'quietBreathRate')}% 빠릅니다. 호흡 곤란·푸른 잇몸·쓰러짐은 응급 진료 대상입니다.`,`安静時呼吸${number(val(c,'quietBreathRate'))}回/分で基準より${shift(c,'quietBreathRate')}%速くなっています。呼吸努力を直接確認し、呼吸困難やチアノーゼがあれば救急受診してください。`)),
  make('breath-rising-over20',['breath','cardio','calm'],1,74,c=>shift(c,'quietBreathRate')>=20,
   c=>T(c,`安靜呼吸 ${number(val(c,'quietBreathRate'))} 次／分，比可比參考高 ${shift(c,'quietBreathRate')}%。活動、炎熱或興奮都可能干擾，請先確認牠在真正休息時的呼吸。`,`Quiet-time breathing ${number(val(c,'quietBreathRate'))}/min is ${shift(c,'quietBreathRate')}% above reference. Confirm true rest without exercise, heat or excitement.`,`안정 시 호흡이 기준보다 ${shift(c,'quietBreathRate')}% 높습니다. 운동·더위·흥분 여부를 확인하세요.`,`安静時呼吸が基準より${shift(c,'quietBreathRate')}%多く、運動・暑さ・興奮がない状態で照合してください。`)),
  make('breath-falling-over20',['breath','cardio','calm'],1,85,c=>drop(c,'quietBreathRate')>=20,
   c=>T(c,`【呼吸頻率下降】安靜呼吸 ${number(val(c,'quietBreathRate'))} 次／分，較參考低 ${drop(c,'quietBreathRate')}%；這不是「呼吸偏快」。請先核對睡眠、呼吸有否正常起伏與波形訊號品質，不要只憑頻率診斷。`,`BREATHING RATE LOWER: ${number(val(c,'quietBreathRate'))}/min is ${drop(c,'quietBreathRate')}% below reference, not faster. Verify sleep state, visible breathing movements and sensor quality.`,`호흡이 빨라진 것이 아니라 기준보다 ${drop(c,'quietBreathRate')}% 감소했습니다. 수면·호흡 움직임·신호 품질을 확인하세요.`,`呼吸が速いのではなく基準より${drop(c,'quietBreathRate')}%低下しています。睡眠・呼吸の動き・信号を確認してください。`)),
  make('hrv-both-falling',['hrv','stable','cardio','calm','rhythm'],2,98,c=>drop(c,'rmssd')>=30&&drop(c,'sdnn')>=30,
   c=>T(c,`【兩項 HRV 統計同步大幅下降】RMSSD ${number(val(c,'rmssd'))} ms（低 ${drop(c,'rmssd')}%）、SDNN ${number(val(c,'sdnn'))} ms（低 ${drop(c,'sdnn')}%）。這兩項取自相關的心搏間期資料，不能當成兩台獨立感測器，也不能單憑此確診心律不整。`,`BOTH HRV STATISTICS MARKEDLY LOWER: RMSSD ${number(val(c,'rmssd'))} ms (-${drop(c,'rmssd')}%), SDNN ${number(val(c,'sdnn'))} ms (-${drop(c,'sdnn')}%). They share beat-interval source data; this is not an ECG diagnosis.`,`RMSSD ${number(val(c,'rmssd'))}ms(-${drop(c,'rmssd')}%), SDNN ${number(val(c,'sdnn'))}ms(-${drop(c,'sdnn')}%)가 함께 감소했습니다. 같은 박동 간격 자료 기반이며 심전도 진단이 아닙니다.`,`RMSSD${number(val(c,'rmssd'))}ms（-${drop(c,'rmssd')}%）、SDNN${number(val(c,'sdnn'))}ms（-${drop(c,'sdnn')}%）がともに減少。元データを共有し、心電図診断ではありません。`)),
  make('hrv-rmssd-falling',['hrv','cardio','calm'],1,76,c=>drop(c,'rmssd')>=20,
   c=>T(c,`RMSSD 比相同來源的可比參考低 ${drop(c,'rmssd')}%，請對照當日休息、心跳與配戴品質；單一 HRV 指數不能推定疾病。`,`RMSSD is ${drop(c,'rmssd')}% below a comparable reference. Check rest, heart rate and signal quality; one HRV statistic is not a diagnosis.`,`RMSSD가 기준보다 ${drop(c,'rmssd')}% 낮습니다. 휴식·심박·신호 품질을 함께 확인하세요.`,`RMSSDは基準より${drop(c,'rmssd')}%低く、休息・心拍・信号品質と照合してください。`)),
  make('stability-pattern-lower',['stable','rhythm','cardio'],1,79,c=>drop(c,'sdnn')>=25,
   c=>T(c,`心搏間期變化 SDNN 比可比參考低 ${drop(c,'sdnn')}%。這反映變化幅度收窄，不能錯寫成心搏「起伏過大」；也不能當成心電圖心律不整診斷。`,`Beat-interval SDNN is ${drop(c,'sdnn')}% lower than reference: measured variation narrowed, not increased. This is not an ECG arrhythmia diagnosis.`,`박동 간격 SDNN이 기준보다 ${drop(c,'sdnn')}% 낮아 변동 폭이 줄었습니다. 부정맥 진단이 아닙니다.`,`SDNNは基準より${drop(c,'sdnn')}%低く、間隔変動は縮小しています。心電図診断ではありません。`)),
  make('stability-real-rhythm',['stable','rhythm'],2,90,c=>c.source==='20hz-waveform'&&available(c,'quietRhythm')&&Math.abs(shift(c,'quietRhythm'))>=30,
   c=>T(c,`真實項圈的安靜心搏節奏指標為 ${number(val(c,'quietRhythm'))}，與同來源參考相差 ${Math.abs(shift(c,'quietRhythm'))}%；請核對心搏波形與佩戴品質，這不是診斷心律不整。`,`Verified collar quiet-time beat-pattern value ${number(val(c,'quietRhythm'))}, ${Math.abs(shift(c,'quietRhythm'))}% different from its matched source reference. Review waveform quality; not a rhythm diagnosis.`,`실측 박동 패턴 ${number(val(c,'quietRhythm'))}가 동일 출처 기준과 ${Math.abs(shift(c,'quietRhythm'))}% 다릅니다.`,`実測拍動パターン${number(val(c,'quietRhythm'))}は同一ソースの基準と${Math.abs(shift(c,'quietRhythm'))}%異なります。`)),
  make('sleep-duration-down40',['sleep','energy','activityRecovery','calm'],2,103,c=>drop(c,'restHours')>=40,
   c=>T(c,`【夜間有效休息大幅縮短】僅 ${number(val(c,'restHours'))} 小時，原參考 ${number(ref(c,'restHours'))} 小時，減少 ${drop(c,'restHours')}%。請核對當晚是否因環境、活動或不適而頻繁起身，並觀察精神與呼吸；這些可能原因尚未由項圈確診。`,`QUIET REST SHARPLY SHORTER: ${number(val(c,'restHours'))} h versus ${number(ref(c,'restHours'))} h (-${drop(c,'restHours')}%). Check actual interruptions, environment and comfort; the collar cannot establish why.`,`휴식 ${number(val(c,'restHours'))}시간으로 기준보다 ${drop(c,'restHours')}% 줄었습니다. 환경·불편·호흡을 확인하세요.`,`休息${number(val(c,'restHours'))}時間で基準より${drop(c,'restHours')}%短くなっています。環境や不快感、呼吸を確認してください。`)),
  make('sleep-duration-down15',['sleep','energy','activityRecovery','calm'],1,67,c=>drop(c,'restHours')>=15,
   c=>T(c,`有效休息約 ${number(val(c,'restHours'))} 小時，比參考短 ${drop(c,'restHours')}%；下一晚請留意是否恢復平常的安靜休息時間。`,`Observed quiet rest ${number(val(c,'restHours'))} h is ${drop(c,'restHours')}% shorter than reference; compare subsequent nights.`,`휴식이 기준보다 ${drop(c,'restHours')}% 짧아 이후 밤에도 확인하세요.`,`休息が基準より${drop(c,'restHours')}%短く、翌夜以降も照合してください。`)),
  make('sleep-interruption-context',['sleep','energy','activityRecovery'],2,78,c=>finite(c.restInterruptions)&&c.restInterruptions>=5,
   c=>T(c,`當晚還觀察到 ${c.restInterruptions} 次休息中斷。這是需另外核對的睡眠連續性線索；若現行睡眠分數主要按時長計算，不能把中斷次數謊稱為已計入扣分。`,`The night also had ${c.restInterruptions} observed interruptions. Review rest continuity separately; do not claim interruptions contributed to a duration-based score unless they actually did.`,`밤중 중단 ${c.restInterruptions}회가 관측됐습니다. 현재 점수에 직접 반영되지 않았다면 감점 원인으로 단정할 수 없습니다.`,`夜間中断が${c.restInterruptions}回ありました。ただし点数に直接反映されていない場合、減点要因とは断定できません。`)),
  make('energy-movement-down40',['energy','activityRecovery'],2,101,c=>drop(c,'activity')>=40||drop(c,'motionMean')>=40,
   c=>{const name=available(c,'activity')?'activity':'motionMean';return T(c,`【活動量顯著下降】本日活動量測 ${number(val(c,name))}，比可比參考減少 ${drop(c,name)}%。這是實際運動／活動紀錄下滑，不能只說「今天比較懶」；請觀察是否有明顯不願起身或活動能力下降。`,`MOVEMENT MARKEDLY LOWER: ${number(val(c,name))}, down ${drop(c,name)}% from reference. This is a measured movement change, not a diagnosis or simply “laziness.” Observe ability and willingness to move.`,`활동 지표 ${number(val(c,name))}로 기준보다 ${drop(c,name)}% 감소했습니다. 기립·활동 상태를 확인하세요.`,`活動指標${number(val(c,name))}は基準より${drop(c,name)}%低下。起立や活動意欲を確認してください。`)}),
  make('energy-movement-down15',['energy','activityRecovery'],1,68,c=>drop(c,'activity')>=15||drop(c,'motionMean')>=15,
   c=>{const name=available(c,'activity')?'activity':'motionMean';return T(c,`活動量測比可比參考少 ${drop(c,name)}%；請追蹤是否連續幾天偏低，並同時查看睡眠與精神。`,`Movement is ${drop(c,name)}% below reference; track whether the change continues and review rest and alertness.`,`활동량이 기준보다 ${drop(c,name)}% 낮아 수면·활력과 함께 추적하세요.`,`活動量が基準より${drop(c,name)}%低く、休息とともに追跡してください。`)}),
  make('recovery-decline40',['recovery','activityRecovery'],2,105,c=>drop(c,'recoveryDrop')>=40,
   c=>T(c,`【兩分鐘心率回落明顯變慢】本次回落 ${number(val(c,'recoveryDrop'))} bpm，與可比的 ${number(ref(c,'recoveryDrop'))} bpm 相比少 ${drop(c,'recoveryDrop')}%。請停止額外負荷並核對相近活動強度與心跳訊號，不應為了「補分」強迫運動。`,`TWO-MINUTE HEART-RATE FALL MARKEDLY SMALLER: ${number(val(c,'recoveryDrop'))} versus ${number(ref(c,'recoveryDrop'))} bpm (-${drop(c,'recoveryDrop')}%). Stop added exertion; compare matched activity and signal quality.`,`2분 심박 감소폭 ${number(val(c,'recoveryDrop'))}bpm으로 기준보다 ${drop(c,'recoveryDrop')}% 작습니다. 추가 운동을 중단하세요.`,`2分間の心拍低下${number(val(c,'recoveryDrop'))}bpmは基準より${drop(c,'recoveryDrop')}%小さく、追加運動を止めて照合してください。`)),
  make('recovery-decline15',['recovery','activityRecovery'],1,66,c=>drop(c,'recoveryDrop')>=15,
   c=>T(c,`兩分鐘的心率回落幅度比相近活動參考少 ${drop(c,'recoveryDrop')}%；應留意是否重複出現，不能以一次結果推定器官疾病。`,`The two-minute heart-rate fall was ${drop(c,'recoveryDrop')}% smaller than matched reference; watch for repetition, not a disease diagnosis.`,`2분 심박 회복 폭이 기준보다 ${drop(c,'recoveryDrop')}% 작아 반복 여부를 관찰하세요.`,`2分間の心拍低下が基準より${drop(c,'recoveryDrop')}%小さく、継続するか確認してください。`)),
  make('calm-multiple-resting-changes',['calm','cardio'],2,96,c=>shift(c,'quietHeartRate')>=20&&shift(c,'quietBreathRate')>=20,
   c=>T(c,`【真正安靜時也有雙重偏離】心跳高 ${shift(c,'quietHeartRate')}%、呼吸高 ${shift(c,'quietBreathRate')}%。兩者同時出現在安靜時，應親眼核對呼吸是否費力及寵物精神，並檢查項圈訊號品質。`,`TWO RESTING CHANGES: Heart +${shift(c,'quietHeartRate')}% and breathing +${shift(c,'quietBreathRate')}% relative to reference. Assess the pet and verify signal quality.`,`안정 중 심박 +${shift(c,'quietHeartRate')}%, 호흡 +${shift(c,'quietBreathRate')}%로 함께 높습니다.`,`安静時に心拍+${shift(c,'quietHeartRate')}%、呼吸+${shift(c,'quietBreathRate')}%の重なりがあります。`)),
  make('burden-many-severe',['cardio','activityRecovery','calm','rhythm','heart','breath','sleep','energy','hrv','stable'],3,88,c=>count(c,0,60)>=5,
   c=>T(c,`【多個嚴重子項並存】當日八項監測中已有 ${count(c,0,60)} 項落在 0–59 分，並非單一小問題；請逐項看上面的實際數值，不要將相關衍生指標誤當成獨立疾病。`,`MULTIPLE SEVERE SUBSCORES: ${count(c,0,60)} of eight monitored indices are below 60. Review the actual measurements, not a count of supposed independent diseases.`,`관찰 지표 8개 중 ${count(c,0,60)}개가 60점 미만입니다. 관련 원자료를 중복 질병으로 해석하지 마세요.`,`8指標のうち${count(c,0,60)}項目が60点未満です。元データの重複を独立した病気とみなさないでください。`)),
  make('burden-severe-and-moderate',['cardio','activityRecovery','calm','rhythm','heart','breath','sleep','energy'],3,87,c=>count(c,0,60)>=2&&count(c,60,80)>=3,
   c=>T(c,`【嚴重與中度異常累積】高風險 ${count(c,0,60)} 項，加上中風險 ${count(c,60,80)} 項，共同構成廣泛偏離；不能只列出高風險兩項，就假裝其他中度偏離不存在。`,`COMBINED SEVERE AND MODERATE BURDEN: ${count(c,0,60)} high-risk plus ${count(c,60,80)} moderate subscores. Both groups matter; moderate changes must not be hidden.`,`고위험 ${count(c,0,60)}개와 중위험 ${count(c,60,80)}개가 함께 나타났습니다.`,`高リスク${count(c,0,60)}項目と中リスク${count(c,60,80)}項目が重なっています。`)),
  make('trend-sharp-daily-drop',['heart','breath','hrv','stable','sleep','energy','recovery','calm','cardio','activityRecovery','rhythm'],2,83,c=>finite(transition(c))&&transition(c)<=-20,
   c=>T(c,`【與前次有效日相比快速下降】${c.keyName}從 ${prev(c).scores[c.key]}/100 降至 ${c.score}/100，下降 ${Math.abs(transition(c))} 分（${prev(c).date} → ${c.date}）。這是有日期可核對的變化，並不代表已確認某項急性疾病。`,`DATE-LINKED SHARP DROP: ${c.keyName} fell from ${prev(c).scores[c.key]}/100 to ${c.score}/100 (down ${Math.abs(transition(c))} points, ${prev(c).date} → ${c.date}). This is a measured trend, not a diagnosis.`,`이전 유효일 ${prev(c).date}의 ${prev(c).scores[c.key]}점에서 ${c.date}의 ${c.score}점으로 ${Math.abs(transition(c))}점 하락했습니다.`,`前回有効日${prev(c).date}の${prev(c).scores[c.key]}点から${c.date}の${c.score}点へ${Math.abs(transition(c))}点低下しました。`)),
  make('trend-sustained-two-days',['heart','breath','hrv','stable','sleep','energy','recovery','calm','cardio','activityRecovery','rhythm'],3,89,c=>{const a=trailing(c),p=a.at(-2),n=a.at(-1);return p&&n&&isOneDayApart(p.date,n.date)&&p.scores[c.key]<60&&n.scores[c.key]<60;},
   c=>T(c,`【連續有效日仍為高風險】${prev(c).date} ${prev(c).scores[c.key]}/100、${c.date} ${c.score}/100，兩個相鄰日都低於 60。應對照更新的有效讀數，不能用單次回升的其他指標掩蓋這段持續偏離。`,`REPEATED HIGH-RISK DAYS: ${prev(c).date} ${prev(c).scores[c.key]}/100 and ${c.date} ${c.score}/100 are adjacent below-60 days. Check the newest verified readings.`,`연속 유효일 ${prev(c).date} ${prev(c).scores[c.key]}점, ${c.date} ${c.score}점 모두 60점 미만입니다.`,`連続した有効日${prev(c).date} ${prev(c).scores[c.key]}点、${c.date} ${c.score}点はいずれも60点未満です。`)),
  make('trend-improving-after-low',['heart','breath','hrv','stable','sleep','energy','recovery','calm','cardio','activityRecovery','rhythm'],1,80,c=>{const p=prev(c)?.scores?.[c.key];return finite(p)&&p<60&&c.score>=60&&c.score-p>=10;},
   c=>T(c,`【已有改善但仍須核對】${c.keyName}由 ${prev(c).scores[c.key]}/100 回升至 ${c.score}/100，改善 ${transition(c)} 分；目前仍應按 ${c.score}/100 的實際分級追蹤，不能誤稱已完全正常。`,`IMPROVING, NOT YET AUTOMATICALLY NORMAL: ${c.keyName} rose from ${prev(c).scores[c.key]}/100 to ${c.score}/100 (+${transition(c)}). Follow its actual current band.`,`이전 ${prev(c).scores[c.key]}점에서 ${c.score}점으로 ${transition(c)}점 개선됐지만 현재 등급을 기준으로 추적해야 합니다.`,`前回${prev(c).scores[c.key]}点から${c.score}点へ${transition(c)}点改善しましたが、現在の実際の区分で追跡してください。`)),
  make('signal-missing-reference',['heart','breath','hrv','stable','sleep','energy','recovery','calm'],2,52,c=>!Object.values(c.references||{}).some(finite),
   c=>T(c,'【可比參考不足】本日分數可供監測，但沒有可核對的個體對照值；不會杜撰百分比或把尚未量測的現象當作問題。','COMPARISON LIMITATION: No verified like-for-like personal reference is available. No invented percentage or missing-value abnormality will be reported.','비교 가능한 개별 기준이 없어 편차율을 임의로 만들지 않습니다.','比較可能な個体基準がなく、偏差率や異常を捏造しません。'))
 ];
 function describe(input){
  const c={...input,risk:risk(input.score)};
  const b=band(c.score);
  if(!b||!c.translate)return {band:null,lines:[],rules:[]};
  const current=(c.isCurrent&&c.days===1);
  const t=T(c,b.labels[0],b.labels[1],b.labels[2],b.labels[3]);
  const suffix=current?T(c,'當日','today','당일','当日'):T(c,'所選記錄日','recorded date','선택 기록일','選択記録日');
  const bandLine=T(c,`【${t}】${suffix} ${c.date} 的${c.keyName}為 ${c.score}/100。請按照下面的實際測量差距與變化趨勢判讀，監測分數本身不等於疾病確診。`,
   `${t}: ${c.keyName} ${c.score}/100 on ${c.date}. Check actual readings and trends below; a monitoring score is not a disease diagnosis.`,
   `${t}: ${c.date} ${c.keyName} ${c.score}/100점입니다. 아래 실제 측정값과 추세를 확인하세요. 점수는 진단이 아닙니다.`,
   `${t}：${c.date}の${c.keyName}は${c.score}/100点。下記の実測値と傾向を確認してください。得点だけでは診断できません。`);
  const scoreAdvice=T(c,...bandAdvice[b.id]);
  if(c.risk===0)return {band:b.id,lines:[bandLine,scoreAdvice],rules:[]};
  const matches=rules.filter(r=>c.risk>=r.minRisk&&r.keys.includes(c.key)&&r.test(c)).sort((a,b)=>b.priority-a.priority);
  const unique=new Set(),chosen=[];
  const limit=c.risk>=4?5:c.risk===3?4:c.risk===2?2:1;
  for(const rule of matches){if(unique.has(rule.group))continue;unique.add(rule.group);chosen.push(rule);if(chosen.length>=limit)break;}
  const lines=[bandLine,scoreAdvice,...chosen.map(r=>r.copy(c))];
  if(c.risk>=3){
   lines.push(T(c,`【優先逐項複核】這一天有 ${count(c,0,60)} 項基本子分低於 60 分、${count(c,60,80)} 項在 60–79 分；請依低分順序核對實際測量、安靜條件和配戴品質，不要只看一個紅色總分。`,
    `PRIORITY CROSS-CHECK: ${count(c,0,60)} high-risk and ${count(c,60,80)} moderate monitored subscores on this date. Review the actual readings, resting context and signal quality, not just one red total.`,
    `우선 확인: 해당 날짜 고위험 ${count(c,0,60)}개, 중위험 ${count(c,60,80)}개입니다. 실제 수치·안정 조건·신호 품질을 확인하세요.`,
    `優先確認：当日は高リスク${count(c,0,60)}項目、中リスク${count(c,60,80)}項目です。実測値と安静条件・信号品質を照合してください。`));
   lines.push(T(c,`【不能等待的情況】若寵物現在實際呼吸費力、牙齦發藍、倒下、意識改變或無法站立，請立即聯絡獸醫急診；若只是歷史低分，應先核對最新有效量測和現在的症狀。`,
    `DO NOT WAIT FOR THESE SIGNS: Current laboured breathing, blue gums, collapse, altered awareness or inability to stand needs veterinary emergency care. For an older score, compare the latest measurement and current signs first.`,
    `응급 징후: 현재 호흡 곤란·푸른 잇몸·쓰러짐·의식 변화·기립 불가가 있으면 즉시 응급 진료를 받으세요. 과거 점수는 최신 상태와 비교하세요.`,
    `待てない兆候：今の呼吸困難、青い歯ぐき、虚脱、意識の変化、起立不能は獣医救急へ。過去の得点は最新の状態と照合してください。`));
  }else if(c.risk===2)lines.push(T(c,`【加強追蹤】${c.date} 的${c.keyName}已有明顯偏離；在相近的休息與活動條件下比對接下來的有效讀數，若連續惡化請諮詢獸醫。`,
   `FOLLOW UP MORE CLOSELY: ${c.keyName} differed from reference on ${c.date}; compare subsequent verified readings under similar conditions and consult a vet if deterioration continues.`,
   `추적 관찰: ${c.date}의 ${c.keyName} 변화가 확인되어 유사 조건의 다음 측정과 비교하세요.`,
   `経過観察：${c.date}の${c.keyName}の変化を、同条件の次の有効記録と比較してください。`));
  return {band:b.id,lines,rules:chosen.map(r=>r.id)};
 }
 root.DeepPetAdaptiveRisk124=Object.freeze({version:'10.124',bands,ruleCatalog:rules.map(r=>({id:r.id,keys:[...r.keys],minRisk:r.minRisk,priority:r.priority})),band,describe});
})(window);
