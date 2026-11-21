/* DeepPet V10.138 — evidence-bound compositional explanations.
 * 16 risk bands × 10 domains × measured direction × interacting subscores × history
 * × source validity × 5 languages. No clinical diagnosis from a numeric score.
 * Pure renderer: NO score, pet, sensor, or storage mutations.
 */
(function(root){'use strict';
 const LX=['zht','zh','en','ja','ko'];
 const ok=x=>typeof x==='number'&&Number.isFinite(x);
 const fmt=x=>Math.round(x*10)/10;
 const bands=[9,19,29,39,49,59,64,69,74,79,82,85,89,94,97,100];
 const tier=s=>!ok(s)||s<=0?-1:bands.findIndex(n=>s<=n);
 const K=['cardio','heart','breath','hrv','stable','sleep','activityRecovery','energy','recovery','calm'];
 const N={cardio:['心肺','心肺','heart and breathing','心肺','심폐'],heart:['心跳','心跳','heart rate','心拍','심박'],breath:['呼吸','呼吸','breathing','呼吸','호흡'],hrv:['心跳間隔變化','心跳间隔变化','HRV','心拍間隔の変化','심박 간격 변화'],stable:['心搏節奏','心搏节奏','heartbeat pattern','拍動リズム','박동 리듬'],sleep:['睡眠','睡眠','sleep','睡眠','수면'],activityRecovery:['精力與恢復','精力与恢复','energy and recovery','活力と回復','활력·회복'],energy:['精力','精力','energy','元気','활력'],recovery:['活動後恢復','活动后恢复','post-activity recovery','活動後の回復','활동 후 회복'],calm:['放鬆平穩','放松平稳','calmness','落ち着き','안정감']};
 const intensity=[
  ['極端危險訊號','极端危险信号','an extreme warning','非常に強い警告','매우 심각한 경고'],
  ['極高度警訊','极高度警讯','a critical warning','強い警告','매우 높은 경고'],
  ['非常嚴重異常','非常严重异常','a very serious change','非常に深刻な変化','매우 심각한 변화'],
  ['嚴重異常','严重异常','a serious change','深刻な変化','심각한 변화'],
  ['多項明顯異常','多项明显异常','a major concern','大きな異常','뚜렷한 이상'],
  ['高風險異常','高风险异常','a high-risk change','高リスクの変化','고위험 변화'],
  ['接近高風險','接近高风险','near high risk','高リスクに近い','고위험에 근접'],
  ['明顯偏離','明显偏离','a noticeable deviation','はっきりした変化','뚜렷한 편차'],
  ['需要追蹤','需要追踪','a change to track','経過観察が必要','관찰이 필요한 변화'],
  ['中度變化','中度变化','a moderate difference','中程度の変化','중간 정도의 변화'],
  ['接近中風險','接近中风险','near moderate risk','中リスクに近い','중위험에 근접'],
  ['輕度變化','轻度变化','a mild difference','軽い変化','경미한 변화'],
  ['小幅差異','小幅差异','a small difference','小さな変化','작은 차이'],
  ['整體穩定','整体稳定','generally stable','おおむね安定','대체로 안정'],
  ['表現良好','表现良好','doing well','良好','양호'],
  ['接近最佳','接近最佳','near usual best','良好な状態','매우 양호']
 ];
 const choose=(a,li)=>a?.[li]??a?.[0]??'';
 const abschange=(v,b)=>ok(v)&&ok(b)&&b>0?Math.round(Math.abs((v-b)*100/b)):null;
 const stateOf=(key,datum,row)=>{
  let d=(typeof datum==='function'?datum(key,row):null)||{};
  const valid=ok(d.value)&&d.value!==0&&ok(d.base)&&d.base>0;
  const dir=!valid?'unknown':d.value>d.base?'up':d.value<d.base?'down':'same';
  return {d,dir,valid,pct:valid?abschange(d.value,d.base):null};
 };
 const rawValue=(key,datum,row)=>{
  const d=(typeof datum==='function'?datum(key,row):null)||{};
  return {value:d.value,base:d.base,unit:d.unit,other:d.other,otherBase:d.otherBase};
 };
 const units={heart:['次／分','次/分','bpm','回/分','회/분'],breath:['次／分','次/分','breaths/min','回/分','회/분'],hrv:['毫秒','毫秒','ms','ms','ms'],stable:['毫秒','毫秒','ms','ms','ms'],sleep:['小時','小时','hours','時間','시간'],energy:['','', '', '', ''],recovery:['次','次','bpm','回','회'],calm:['','', '', '', '']};
 function metricObservation(key,datum,row,li,short=false,ultra=false){
  const d=rawValue(key,datum,row);const label=choose(N[key]||[key],li);const uv=choose(units[key]||[''],li);
  if(!ok(d.value)||d.value===0){
   if(short)return choose([`${label}缺少有效讀數`,`${label}缺少有效读数`,`${label}: valid reading missing`,`${label}の有効値なし`,`${label} 유효 측정 없음`],li);
   return choose([`${label}缺少有效讀數，不能猜測原因`,`${label}缺少有效读数，不能猜测原因`,
    `${label} has no verified reading; the cause is unknown`,`${label}の有効な測定値がなく、原因は不明`,
    `${label}에 유효한 측정값이 없어 원인을 단정할 수 없음`],li);
  }
  if(!ok(d.base)||d.base<=0)return choose([
   `${label}${fmt(d.value)}${uv}，尚無可比基準`,`${label}${fmt(d.value)}${uv}，暂无可比基准`,
   `${label} ${fmt(d.value)} ${uv}; no comparable baseline yet`,`${label}${fmt(d.value)}${uv}。比較基準が未確立`,
   `${label} ${fmt(d.value)}${uv}; 비교 기준 없음`],li);
  const p=abschange(d.value,d.base),high=d.value>d.base;
  const delta=choose(high?['升高','升高','higher','上昇','증가']:['下降','下降','lower','低下','감소'],li);
  const strength=choose(p>=60?['大幅','大幅','sharply','大幅','크게']:p>=30?['明顯','明显','noticeably','明らかに','뚜렷하게']:p>=12?['有所','有所','somewhat','やや','다소']:['輕微','轻微','slightly','少し','약간'],li);
  if(short){
   if(!ultra)return choose([
    `${label}${fmt(d.value)}${uv}，平常${fmt(d.base)}，${delta}${p}%`,
    `${label}${fmt(d.value)}${uv}，平常${fmt(d.base)}，${delta}${p}%`,
    `${label} ${fmt(d.value)} vs ${fmt(d.base)} ${uv} (${p}% ${delta})`,
    `${label}${fmt(d.value)}${uv}、普段${fmt(d.base)}より${p}%${delta}`,
    `${label} ${fmt(d.value)}${uv}, 평소 ${fmt(d.base)} 대비 ${p}% ${delta}`],li);
   return choose([
    `${label}${strength}${delta}（${p}%）`,`${label}${strength}${delta}（${p}%）`,
    `${label} ${p}% ${delta}`,`${label}が${p}%${delta}`,`${label} ${p}% ${delta}`],li);
  }
  return choose([
   `${label}${fmt(d.value)}${uv}，平常${fmt(d.base)}${uv}，${strength}${delta}${p}%`,
   `${label}${fmt(d.value)}${uv}，平常${fmt(d.base)}${uv}，${strength}${delta}${p}%`,
   `${label} ${fmt(d.value)} ${uv} vs usual ${fmt(d.base)} ${uv}, ${p}% ${delta}`,
   `${label}${fmt(d.value)}${uv}、普段${fmt(d.base)}${uv}より${p}%${delta}`,
   `${label} ${fmt(d.value)}${uv}, 평소 ${fmt(d.base)}${uv} 대비 ${p}% ${delta}`],li);
 }
 // These are genuinely distinct situation-specific owner actions, not universal risk tails.
 const FIRST={
  cardio:{double:['先停止活動，確認安靜時心跳和呼吸是否同時異常','先停止活动，确认安静时心跳和呼吸是否同时异常','Stop activity and recheck both pulse and breathing at rest','運動を止め、安静時の心拍と呼吸を一緒に確認','활동을 멈추고 안정 시 심박과 호흡을 함께 확인'],single:['先確認最差的心肺項目，再查看安靜時的實測值','先确认最差的心肺项目，再查看安静时的实测值','Review the lowest heart/breathing item and its resting readings','最も低い心肺項目と安静時の値を確認','가장 낮은 심폐 항목과 안정 시 수치를 확인'],unknown:['先確認心肺的有效原始數據與項圈訊號','先确认心肺的有效原始数据和项圈信号','Check valid heart/breathing data and collar contact first','心肺の測定データと装着状態を先に確認','심폐 측정값과 목걸이 접촉부터 확인']},
  heart:{up:['讓牠安靜，確認心跳是否持續明顯過快','让它安静，确认心跳是否持续明显过快','Keep your pet quiet and check whether the pulse stays fast','安静にし、心拍が速いままか確認','안정시키고 심박이 계속 빠른지 확인'],down:['立刻查看清醒反應，核對心跳有沒有持續過慢','立即查看清醒反应，核对心跳有没有持续过慢','Check responsiveness and whether the pulse remains unusually slow','反応と心拍の遅さが続くか確認','반응과 심박이 계속 느린지 확인'],same:['核對實測心跳及計分來源，避免誤判','核对实际心跳和计分来源，避免误判','Check the pulse reading and why the score is low','心拍数と採点根拠を確認','실제 심박값과 점수 근거 확인'],unknown:['先核對波形與項圈接觸，再重新量心跳','先核对波形与项圈接触，再重新量心跳','Check waveform and collar contact before repeating pulse measurement','波形と装着を確認して再測定','파형과 착용 상태 확인 후 재측정']},
  breath:{up:['立即觀察有沒有張口喘氣、胸腹用力或喘不停','立即观察有没有张口喘气、胸腹用力或喘不停','Look now for laboured, open-mouth or persistent rapid breathing','口呼吸や胸腹を大きく使う苦しい呼吸がないか確認','입벌림 호흡·힘겨운 호흡·계속되는 빠른 호흡을 확인'],down:['立即觀察呼吸是否平順、有沒有實際停頓','立即观察呼吸是否平顺、有没有实际停顿','Check whether breaths are steady or truly pausing','呼吸の間隔が安定しているか、実際の停止がないか確認','호흡이 고르고 실제 멈춤이 있는지 확인'],same:['核對呼吸波形與低分的其他計分依據','核对呼吸波形与低分的其他计分依据','Check the breathing waveform and scoring inputs','呼吸波形と採点根拠を確認','호흡 파형과 점수 근거 확인'],unknown:['先觀察實際胸腹起伏，並檢查項圈位置','先观察实际胸腹起伏，并检查项圈位置','Observe chest movement and check collar placement','胸腹の動きを見て装着位置を確認','가슴 움직임을 관찰하고 목걸이 위치 확인']},
  hrv:{down:['安靜重測心跳間隔，核對 RMSSD 和 SDNN 是否一起下降','安静复测心跳间隔，核对 RMSSD 和 SDNN 是否一起下降','Retest at rest and see whether both RMSSD and SDNN are lower','安静時に再測定し、RMSSDとSDNNの両方を確認','휴식 중 다시 측정하고 RMSSD·SDNN 모두 하락했는지 확인'],up:['比較兩項 HRV 原始指標，核對為何分數降低','比较两项 HRV 原始指标，核对为何分数降低','Compare both HRV measures and verify the scoring inputs','2つのHRV指標と採点根拠を確認','HRV 두 지표와 점수 근거 확인'],same:['讀數接近平常卻低分，先核對演算法與訊號品質','读数接近平常却低分，先核对算法和信号质量','Score and readings disagree: verify signal and scoring','数値は普段に近いのに低得点です。測定と計算を確認','측정값과 낮은 점수가 어긋나면 신호·계산 확인'],unknown:['確認 HRV 的有效原始資料，再於安靜時重測','确认 HRV 的有效原始数据，再于安静时复测','Confirm valid HRV data and repeat at rest','有効なHRV記録を確かめて再測定','유효한 HRV 자료를 확인하고 안정 시 재측정']},
  stable:{general:['核對有效心搏波形與脈搏是否規律','核对有效心搏波形与脉搏是否规律','Review heartbeat waveform and whether pulse is regular','心拍波形と実際の脈の規則性を確認','심박 파형과 실제 맥박의 규칙성 확인']},
  sleep:{short:['先檢查休息中斷、夜間環境，再比對同一夜的心跳與呼吸','先检查休息中断、夜间环境，再对照同一夜的心跳与呼吸','Review interrupted rest, sleep environment and same-night pulse/breathing','休息の中断、環境、同じ夜の心拍と呼吸を確認','잠이 끊긴 이유·환경·같은 밤 심박·호흡을 확인'],long:['核對睡眠記錄是否包含長時間靜躺，並檢查計分依據','核对睡眠记录是否包含长时间静躺，并检查计分依据','Check whether quiet lying was mistaken for sleep and review score inputs','横になっている時間と睡眠の判別・採点を確認','조용히 누워있던 시간이 수면으로 처리됐는지 확인'],unknown:['先確認休息時間軸是否有有效記錄，再核對環境和疼痛','先确认休息时间轴是否有有效记录，再核对环境和疼痛','Check valid rest records, disturbances and possible pain','休息記録、環境、痛みの可能性を確認','유효한 휴식 기록·환경·통증 가능성 확인']},
  activityRecovery:{sleep:['先看精力與恢復各自的低分，再查看對應睡眠日','先看精力与恢复各自的低分，再查看对应睡眠日','Review the weak energy/recovery parts and the matching sleep day','活力・回復の低い項目と該当日の睡眠を確認','활력·회복 저점 항목과 같은 날 수면을 확인'],generic:['分別查看活動量、運動後恢復和放鬆數值','分别查看活动量、运动后恢复和放松数值','Review movement, post-activity recovery and calmness separately','活動量、運動後の回復、落ち着きを別々に確認','활동량·활동 후 회복·안정도를 각각 확인']},
  energy:{sleep:['先查看前一晚及當日的睡眠是否也明顯不足','先查看前一晚及当天的睡眠是否也明显不足','Check whether the previous night or same-day rest was also poor','前夜・当日の睡眠も不足していないか確認','전날 밤과 당일 수면도 부족했는지 확인'],generic:['核對牠是否真的少動、無力或食慾改變','核对是否真的少动、无力或食欲改变','Check real movement, weakness and appetite change','動きが少ないか、脱力や食欲変化を確認','실제 활동 감소·무력감·식욕 변화를 확인']},
  recovery:{down:['降低運動強度，核對兩分鐘後心跳是否反覆回落較慢','降低运动强度，核对两分钟后心跳是否反复回落较慢','Reduce exertion and check repeated 2-minute recovery after similar activity','運動を控え、同じ強度の運動後2分の回復を比較','운동 강도를 낮추고 비슷한 활동 뒤 2분 회복을 비교'],up:['恢復速度反而較快，先核對活動強度與計分差異','恢复速度反而较快，先核对活动强度与计分差异','Recovery was faster; check activity matching and scoring','回復は速いため、運動強度と計算条件を確認','회복은 빨라졌으므로 운동 강도와 계산 조건 확인'],same:['恢復值接近平常，先核對分數是否受到其他項目影響','恢复值接近平常，先核对分数是否受到其他项目影响','Recovery looks usual; inspect other scoring inputs','回復値が普段に近いので他の採点条件を確認','회복 수치가 평소와 비슷해 다른 산출 조건 확인'],unknown:['先確定有相似強度的活動記錄，才能比較恢復','先确定有相似强度的活动记录，才能比较恢复','Check activity intensity and timing before judging recovery','運動強度と記録時刻を確認してから比較','활동 강도와 기록 시간을 확인한 뒤 비교']},
  calm:{breathing:['先讓牠遠離刺激，觀察安靜時喘氣及不安是否持續','先让它远离刺激，观察安静时喘气和不安是否持续','Reduce stimulation; watch persistent panting and agitation at rest','刺激を減らし、安静時の荒い呼吸と落ち着かなさを確認','자극을 줄이고 휴식 중 헐떡임과 불안을 확인'],generic:['檢查吵雜、疼痛、項圈不適與休息不足','检查噪音、疼痛、项圈不适与休息不足','Check disturbance, pain, collar discomfort and poor rest','騒音、痛み、装着の不快感、休息不足を確認','소음·통증·목걸이 불편·휴식 부족 확인']}
 };
 const NEXT={
  cardio:[['若心跳與呼吸都持續明顯異常，立即聯絡獸醫；喘不過氣直接急診','若心跳与呼吸都持续明显异常，立即联系兽医；喘不过气直接急诊','Both remain severely abnormal? Contact a vet now; breathing distress needs ER','心拍と呼吸の強い異常が続けば今すぐ獣医へ。呼吸困難は救急','심박·호흡 이상이 심하게 지속되면 즉시 진료. 호흡곤란은 응급실'],['若反覆同時異常，今天請獸醫評估；先別增加活動','若反复同时异常，今天请兽医评估；先别增加活动','If repeated together, contact a vet today; avoid exertion','繰り返す場合は今日獣医へ。運動を控えてください','반복되면 오늘 진료. 활동을 늘리지 마세요']],
  heart:[['心跳持續極端異常或突然倒下，立即就醫；昏倒屬急診','心跳持续极端异常或突然倒下，立即就医；昏倒属急诊','Persistent extreme pulse or collapse needs urgent veterinary care','極端な心拍異常が続く・倒れる場合は直ちに受診','극심한 심박 이상 지속·쓰러짐은 즉시 응급 진료'],['若安靜時仍反覆異常，今天聯絡獸醫；突然虛弱則立即就醫','若安静时仍反复异常，今天联系兽医；突然虚弱则立即就医','Repeated abnormal resting pulse needs vet advice today; sudden weakness is urgent','安静時にも繰り返すなら今日獣医へ。急な脱力は至急受診','쉬어도 반복되면 오늘 진료. 갑작스러운 무력은 즉시 진료']],
  breath:[['呼吸費力、持續張口喘或牙齦發藍，直接急診；不能只等分數回升','呼吸费力、持续张口喘或牙龈发蓝，直接急诊；不能只等分数回升','Laboured breathing or blue gums needs ER immediately; do not wait for a score','呼吸困難・口呼吸の持続・歯ぐきの青変なら直ちに救急','호흡곤란·입벌림 호흡 지속·푸른 잇몸이면 즉시 응급'],['安靜時仍持續呼吸異常，今天請獸醫評估；呼吸費力直接急診','安静时仍持续呼吸异常，今天请兽医评估；呼吸费力直接急诊','Persistent abnormal breathing at rest needs vet review today; distress means ER','安静時も異常が続くなら今日受診。苦しい呼吸は救急','안정 중 호흡 이상이 지속되면 오늘 진료. 호흡곤란은 응급']],
  hrv:[['若同時精神很差、呼吸或心跳異常，立即請獸醫評估；HRV不能單獨確診心臟病','若同时精神很差、呼吸或心跳异常，立即请兽医评估；HRV不能单独确诊心脏病','If lethargy or pulse/breathing problems coexist, call a vet now; HRV is not a diagnosis','元気低下や心拍・呼吸異常を伴うなら早急に獣医へ。HRVだけでは診断不可','무기력·심박·호흡 문제 동반 시 즉시 상담. HRV만으로 진단 불가'],['若反覆低分又明顯無力，今天聯絡獸醫；先確認量測品質','若反复低分又明显无力，今天联系兽医；先确认测量质量','Repeated low HRV with weakness needs vet advice today; check signal first','低値が繰り返され脱力もあれば今日獣医へ。信号も確認','반복 저점과 무력 동반 시 오늘 진료. 신호도 점검']],
  stable:[['若實際脈搏明顯亂跳、昏倒或突然無力，立即就醫；分數不是心律不整診斷','若实际脉搏明显乱跳、昏倒或突然无力，立即就医；分数不是心律失常诊断','Truly erratic pulse, fainting or weakness needs urgent care; score is not a diagnosis','実際の不規則な脈・失神・脱力なら直ちに受診。点数だけでは診断不可','실제 불규칙 맥박·실신·무력 시 즉시 진료. 점수는 진단이 아님'],['反覆偏離又伴無力，今天請獸醫評估心跳波形','反复偏离又伴无力，今天请兽医评估心跳波形','Recurring deviation with weakness needs a vet waveform review today','乱れと脱力が続けば今日獣医に波形を相談','이상과 무력이 반복되면 오늘 파형 진료 상담']],
  sleep:[['夜間呼吸費力或難以喚醒，立即急診；多夜嚴重睡不好也應今天請獸醫檢查','夜间呼吸费力或难以唤醒，立即急诊；多夜严重睡不好也应今天请兽医检查','Laboured night breathing or difficulty waking needs ER; repeated severe sleep loss needs a vet today','夜間の呼吸困難・起こせない場合は救急。重い睡眠不足が続けば今日獣医へ','야간 호흡곤란·깨우기 어려움은 응급. 심한 수면 부족 반복 시 오늘 진료'],['如果連續多夜睡不好、白天沒精神，今天向獸醫反映夜間記錄','如果连续多夜睡不好、白天没精神，今天向兽医反映夜间记录','Repeated poor nights with low energy need a vet review of night records','眠れない夜が続き元気もなければ今日夜間記録を獣医へ','여러 밤 수면 부족과 무기력 동반 시 오늘 야간 기록 상담']],
  activityRecovery:[['若突然無法站立或反應變差，立即急診；其他情況先分清哪項最差','若突然无法站立或反应变差，立即急诊；其他情况先分清哪项最差','Sudden inability to stand or reduced response means ER; otherwise locate the lowest component','急に立てない・反応低下は救急。まず低い項目を確認','갑자기 못 서거나 반응 저하는 응급. 낮은 세부 항목을 먼저 확인'],['若精神明顯下降或恢復變慢持續，今天請獸醫評估','若精神明显下降或恢复变慢持续，今天请兽医评估','Ongoing lethargy or slow recovery deserves a vet review today','元気低下・回復遅延が続けば今日獣医へ','기력 저하·회복 지연이 지속되면 오늘 진료']],
  energy:[['若突然站不住或反應很差，直接急診；持續極度沒精神要立即聯絡獸醫','若突然站不住或反应很差，直接急诊；持续极度没精神要立即联系兽医','Unable to stand or barely responsive means ER; profound lethargy needs urgent care','急に立てない・反応が鈍い場合は救急。重い無気力も早急に受診','못 서거나 반응이 둔하면 응급. 심한 무기력 지속 시 즉시 진료'],['食慾與步態也變差時，今天請獸醫檢查；先讓牠充分休息','食欲与步态也变差时，今天请兽医检查；先让它充分休息','If appetite and gait worsen, see a vet today; allow rest','食欲・歩行も悪化なら今日獣医へ。まず休息を','식욕·보행도 악화하면 오늘 진료. 충분히 휴식']],
  recovery:[['活動後仍長時間喘、明顯虛弱或無法恢復，立即就醫；先停止運動','活动后仍长时间喘、明显虚弱或无法恢复，立即就医；先停止运动','Prolonged panting, weakness or poor recovery after activity needs urgent care; stop exertion','運動後も長く喘ぐ・脱力・回復しない場合は至急受診。運動中止','활동 뒤 지속 헐떡임·무력·회복 안 됨은 즉시 진료. 운동 중단'],['若同等運動後多次恢復偏慢，今天請獸醫評估，不只歸因於年紀','若同等运动后多次恢复偏慢，今天请兽医评估，不只归因于年龄','Repeated slow recovery after similar effort merits a vet review today; not age alone','同程度の運動後の回復が遅ければ今日獣医へ。年齢だけと決めない','비슷한 운동 후 회복이 반복해 느리면 오늘 진료. 나이 탓만 하지 않기']],
  calm:[['安靜時仍一直喘、明顯疼痛或反應下降，立即就醫；先減少環境刺激','安静时仍一直喘、明显疼痛或反应下降，立即就医；先减少环境刺激','Persistent resting panting, obvious pain or poor response needs urgent vet care; reduce stimulation','安静時の荒い呼吸・強い痛み・反応低下が続けば早急に受診','쉬어도 헐떡임·통증·반응 저하 지속 시 즉시 진료'],['在安靜環境仍持續緊張或看起來疼痛，今天請獸醫評估','在安静环境仍持续紧张或看起来疼痛，今天请兽医评估','Agitation or pain in a calm place warrants vet advice today','静かな場所でも落ち着かない・痛そうなら今日獣医へ','조용해도 불안·통증이 지속되면 오늘 진료']]
 };
 // Distinct escalation decisions for all 16 bands, independent of the metric.
 // The metric-specific first step always remains primary; this modifies urgency,
 // not medical diagnoses. Also used in compact/very-short phone layouts.
 const BAND_NEXT=[
  ['不能只等下一次同步才處理','不能只等下一次同步才处理','do not wait for the next sync','次の同期まで待たずに確認','다음 동기화까지 기다리지 말기'],
  ['務必立刻核對當下狀況','务必立即核对当下情况','check the current condition immediately','今の状態を直ちに確認','현재 상태를 즉시 확인'],
  ['確認異常是否反覆發生','确认异常是否反复发生','check whether this repeats','繰り返していないか確認','반복되는지 확인'],
  ['核對持續時間及最新數據','核对持续时间及最新数据','check duration and latest reading','継続時間と最新値を確認','지속 시간과 최신 수치 확인'],
  ['比較連續記錄，重複就問獸醫','比较连续记录，重复就问兽医','compare repeated readings; ask a vet','繰り返す場合は獣医に相談','반복 측정 비교 후 상담'],
  ['持續低分請安排獸醫評估','持续低分请安排兽医评估','persistent low scores merit a vet review','低得点が続けば獣医へ','저점 지속 시 진료'],
  ['接近高風險，今天再比對','接近高风险，今天再比对','near high risk: recheck today','高リスクに近いため今日再確認','고위험 근접, 오늘 재확인'],
  ['兩天內再查是否持續','两天内再查是否持续','check persistence within two days','2日以内に継続を確認','이틀 내 지속 여부 확인'],
  ['接下來三天追蹤變化','接下来三天追踪变化','track the next three days','3日間の変化を追跡','향후 3일간 관찰'],
  ['持續紀錄這週的走勢','持续记录本周走势','watch this week’s trend','今週の変化を確認','이번 주 추이 확인'],
  ['下次量測比對即可','下次测量对比即可','compare next reading','次回の測定と比較','다음 측정 비교'],
  ['每天留意是否加重','每天留意是否加重','watch for worsening','悪化しないか毎日確認','매일 악화 여부 확인'],
  ['正常記錄並留意新變化','正常记录并留意新变化','routine record; watch for new changes','通常の記録を続ける','일상 기록 유지'],
  ['維持日常觀察','维持日常观察','continue usual observation','普段どおり観察','평소대로 관찰'],
  ['照平常作息即可','照平常作息即可','keep the normal routine','普段の生活を続ける','평소 생활 유지'],
  ['目前保持即可','目前保持即可','continue as usual','今の状態を維持','현재 상태 유지']
 ];
 const PERIOD_NEXT=[
  ['若目前仍有嚴重異常，立即聯絡獸醫','若目前仍有严重异常，立即联系兽医','if still severe now, contact a vet urgently','今も重い異常なら直ちに獣医へ','현재도 심한 이상이면 즉시 진료'],
  ['核對今天是否仍出現極低分','核对今天是否仍出现极低分','check if today is also critically low','今日も極端な低得点か確認','오늘도 극저점인지 확인'],
  ['反覆發生就今天聯絡獸醫','反复发生就今天联系兽医','vet advice today if recurring','繰り返すなら今日獣医へ','반복되면 오늘 진료'],
  ['對照最新有效數據和持續時間','对照最新有效数据和持续时间','compare latest readings and duration','最新値と続いた時間を確認','최신 기록과 지속 시간을 비교'],
  ['記錄哪些日子出現反覆異常','记录哪些日子出现反复异常','note the dates with repeated changes','繰り返した日を記録','반복된 날짜 기록'],
  ['持續多天低分再安排評估','持续多天低分再安排评估','seek advice if low over many days','低得点が何日も続けば相談','여러 날 저점이면 진료 상담'],
  ['留意近期是否接近高風險','留意近期是否接近高风险','watch for worsening toward high risk','高リスクに近づくか確認','고위험으로 악화하는지 확인'],
  ['兩天後再核對走勢','两天后再核对走势','check the trend again in two days','2日後に推移を再確認','이틀 뒤 추이 재확인'],
  ['看下一個三天的有效數據','看下一个三天的有效数据','review the next three valid days','次の3日間の有効値を確認','다음 3일 유효 자료 확인'],
  ['觀察接下來一週的變化','观察接下来一周的变化','observe the coming week','今後1週間の変化を確認','다음 주 변화 관찰'],
  ['與下次有效量測比較','与下次有效测量比较','compare the next valid reading','次の有効値と比較','다음 유효값과 비교'],
  ['留意是否有新的偏離','留意是否有新的偏离','watch for new deviations','新しい変化に注意','새로운 변화 확인'],
  ['繼續正常追蹤','继续正常追踪','keep routine tracking','通常の記録を続ける','정기 기록 유지'],
  ['日常觀察即可','日常观察即可','routine observation','通常の観察','일상 관찰'],
  ['保持原來作息','保持原来作息','keep usual routine','普段の生活を維持','일상 유지'],
  ['持續保持即可','持续保持即可','continue as usual','現状を維持','계속 유지']
 ];
 const SHORT_NEXT=[
  ['持續嚴重即就醫','持续严重即就医','vet now if severe','続けば緊急受診','심하면 즉시 진료'],
  ['持續就立即就醫','持续就立即就医','urgent vet if ongoing','続けば直ちに受診','지속 시 즉시 진료'],
  ['今天問獸醫','今天问兽医','vet today if ongoing','続けば今日受診','지속 시 오늘 진료'],
  ['今天重測並就醫','今天复测并就医','recheck today; vet if low','今日再測定し受診','오늘 재검 후 진료'],
  ['反覆則問獸醫','反复则问兽医','vet if recurring','繰り返せば獣医へ','반복 시 진료'],
  ['持續低分要評估','持续低分要评估','vet if low persists','低点が続けば受診','저점 지속 시 진료'],
  ['今天再量','今天再测','recheck today','今日再確認','오늘 재측정'],
  ['兩天內再看','两天内再看','check in two days','2日以内に確認','이틀 내 확인'],
  ['三天內追蹤','三天内追踪','track three days','3日間を確認','3일간 관찰'],
  ['看本週走勢','看本周走势','watch this week','今週の推移確認','이번 주 추이'],
  ['下次再比對','下次再对比','recheck next time','次回も比較','다음 측정 비교'],
  ['每日留意','每天留意','observe daily','毎日観察','매일 관찰'],
  ['維持記錄','维持记录','keep tracking','記録を続ける','기록 유지'],
  ['正常觀察','正常观察','routine check','通常の観察','일상 관찰'],
  ['保持作息','保持作息','keep routine','普段どおり','일상 유지'],
  ['繼續保持','继续保持','continue as usual','維持する','계속 유지']
 ];
 const LIGHT=[
  ['持續偏離就今天聯絡獸醫','持续偏离就今天联系兽医','contact a vet today if it persists','続く場合は今日獣医に相談','지속되면 오늘 수의사 상담'],
  ['若接連出現，今天與獸醫討論','若接连出现，今天与兽医讨论','if repeated, discuss it with a vet today','繰り返す場合は今日獣医へ','반복되면 오늘 진료 상담'],
  ['這幾天要密切比對變化','这几天要密切对比变化','compare changes closely over the next days','数日間の変化を詳しく確認','며칠간 변화를 자세히 확인'],
  ['先看下一次有效數據是否改善','先看下一次有效数据是否改善','review the next valid reading for improvement','次の有効な値で改善を確認','다음 유효 측정값에서 개선 여부 확인'],
  ['如果又變差，安排獸醫評估','如果再次变差，安排兽医评估','arrange a vet review if it worsens again','再び悪化するなら獣医へ','다시 악화하면 진료 상담'],
  ['先記錄並核對是否持續','先记录并核对是否持续','track whether it persists','継続するか記録','지속 여부 기록'],
  ['注意是否連續幾天偏離','注意是否连续几天偏离','watch for consecutive changed days','数日続くか確認','연속되는지 관찰'],
  ['下次同條件量測再核對','下次同条件测量再核对','compare with the next similar reading','次の同条件の測定と比較','다음 유사 조건 측정과 비교'],
  ['維持正常作息並留意趨勢','维持正常作息并留意趋势','keep the routine and watch the trend','普段どおり過ごし、変化を確認','평소 생활을 유지하며 추이 관찰'],
  ['有新症狀再提早評估','有新症状再提前评估','seek advice earlier if new symptoms appear','新しい症状があれば早めに相談','새 증상이 있으면 일찍 상담'],
  ['下次量測與平常比較即可','下次测量与平常比较即可','compare the next reading to usual','次回の値を普段と比較','다음 수치를 평소와 비교'],
  ['先觀察，不必為單次小變化緊張','先观察，不必为单次小变化紧张','observe without overreacting to one mild shift','軽い一度の変化なら様子を見る','일회성 경미 변화는 관찰'],
  ['正常追蹤即可','正常追踪即可','routine monitoring is enough','通常の記録を続ける','정기 기록 유지']
 ];
 const countScores=(rows,key)=>{const vals=(Array.isArray(rows)?rows:[]).filter(x=>ok(x?.scores?.[key])&&x.scores[key]>0&&x.scores[key]<=100);return {valid:vals.length,high:vals.filter(x=>x.scores[key]<60).length,extreme:vals.filter(x=>x.scores[key]<20).length,moderate:vals.filter(x=>x.scores[key]>=60&&x.scores[key]<80).length};};
 function compose({key,score,days=1,row={},rows=[],datum,lang='zht',compact=false,veryShort=false}){
  const li=Math.max(0,LX.indexOf(lang));const t=tier(score),period=Number(days)>1;
  const tr=(...z)=>choose(z,li),nm=k=>choose(N[k]||[k],li),raw=(k)=>stateOf(k,datum,row);
  if(t<0)return {cause:tr('原因：有效資料不足，無法判定','原因：有效数据不足，无法判断','Cause: not enough valid readings','理由：有効データ不足','원인: 유효한 자료 부족'),action:tr('建議：檢查項圈位置並重新量測','建议：检查项圈位置并重新测量','Next: check collar fit and retest','対応：装着を確認して再測定','조치: 목걸이를 점검하고 재측정'),id:'missing',tier:-1};
  const scores=row?.scores||{},scoreVal=k=>ok(scores[k])&&scores[k]>0?scores[k]:null;
  const abnormal=k=>scoreVal(k)!==null&&scoreVal(k)<80;
  const critical=k=>scoreVal(k)!==null&&scoreVal(k)<20;
  const scoredSort=ks=>ks.filter(k=>scoreVal(k)!==null).sort((a,b)=>scores[a]-scores[b]);
  const ks=key==='cardio'?scoredSort(['breath','heart','hrv','stable']):key==='activityRecovery'?scoredSort(['energy','recovery','calm']):[key];
  const lead=ks[0]||key, d=raw(lead),kdir=raw(key).dir;
  const observed=metricObservation(lead,datum,row,li,compact||veryShort,veryShort);
  const detail=period?countScores(rows,key):null;
  let context='general';
  if(key==='cardio')context=critical('breath')&&critical('heart')?'double':lead==='breath'?'breath-led':lead==='heart'?'heart-led':'single';
  else if(key==='sleep')context=abnormal('heart')&&abnormal('breath')?'both-cardio':abnormal('heart')||abnormal('breath')?'cardio':'independent';
  else if(key==='energy'||key==='activityRecovery')context=abnormal('sleep')?'sleep':'generic';
  else if(key==='calm')context=abnormal('breath')?'breathing':'generic';
  else if(key==='hrv'){
   const h=rawValue('hrv',datum,row);
   const rm=ok(h.value)&&ok(h.base)&&h.base>0?h.value/h.base:null;
   const sd=ok(h.other)&&ok(h.otherBase)&&h.otherBase>0?h.other/h.otherBase:null;
   context=rm!==null&&sd!==null&&rm>=.95&&sd>=.95?'conflict':rm!==null&&sd!==null&&rm<.75&&sd<.75?'bothlow':kdir;
  }
  else if(key==='recovery')context=kdir==='down'?'down':kdir==='up'?'up':'unknown';
  else if(key==='heart'||key==='breath')context=kdir;
  // Domain-specific measured reason, including real co-occurrence only, never a causal claim.
  let msg='';
  if(key==='cardio'||key==='activityRecovery'){
   const first=ks.slice(0,2).map(k=>`${nm(k)}${scores[k]}`).join(tr('、','、',', ','・','·'));
   msg=tr(`低分主因是${first}分；${observed}`,`低分主因是${first}分；${observed}`,
     `Main low subscores: ${first}; ${observed}`,`主な低得点は${first}点。${observed}`,`주요 저점은 ${first}점. ${observed}`);
  }else msg=observed;
  // Calm is a composite derived from quiet-time physiology. It does not have
  // a single directly measured "calmness" unit. Explain matching components
  // instead of contradicting a valid calm score with "no valid reading".
  if(key==='calm'){
   const related=scoredSort(['breath','hrv','heart']).filter(k=>scores[k]<80).slice(0,2);
   if(related.length){
    const part=related.map(k=>`${nm(k)}${Math.round(scores[k])}`).join(tr('、','、',', ','・','·'));
    msg=tr(`這項分數綜合安靜時狀態；同日${part}分也有偏離，建議一起核對`,
      `这项分数综合安静时状态；同日${part}分也有偏离，建议一起核对`,
      `This combines quiet-time signals; ${part} also differed that day; compare them`,
      `安静時の複合評価です。同日${part}点も変化しており、合わせて確認`,
      `안정 시 여러 신호를 합친 점수로 같은 날 ${part}점도 변해 함께 확인`);
   }else{
    msg=tr('這是多項安靜狀態指標的綜合分數；其他心肺項目未見同等低分，請核對當天睡眠與訊號品質',
      '这是多项安静状态指标的综合分数；其他心肺项目未见同等低分，请核对当天睡眠与信号质量',
      'This is a combined rest-state score; other heart/breathing scores were not equally low. Check rest and signal quality',
      '安静時の複合点数です。他の心肺指標は同じ程度には低下していないため、休息と信号品質を確認',
      '안정 시 복합 점수이며 다른 심폐 점수는 비슷하게 낮지 않아 휴식·신호 품질 확인');
   }
  }
  const crossBits=[];
  if(key==='sleep'){
   if(context==='both-cardio')crossBits.push(tr(`同日心跳${scores.heart}分、呼吸${scores.breath}分也低，需查看同夜記錄`, `同日心跳${scores.heart}分、呼吸${scores.breath}分也低，需查看同夜记录`,
     `Pulse ${scores.heart} and breathing ${scores.breath} were also low that day; review the night records`,
     `同日の心拍${scores.heart}点・呼吸${scores.breath}点も低く、夜間記録を確認`,
     `같은 날 심박 ${scores.heart}점·호흡 ${scores.breath}점도 낮아 야간 기록 확인`));
   else if(context==='cardio'){
    const k=abnormal('breath')?'breath':'heart';crossBits.push(tr(`同日${nm(k)}${scores[k]}分也異常，建議對照夜間時間軸`,`同日${nm(k)}${scores[k]}分也异常，建议对照夜间时间轴`,
     `${nm(k)} was also low (${scores[k]}); compare the night timeline`,
     `同日の${nm(k)}も${scores[k]}点。夜の記録と比較`,
     `같은 날 ${nm(k)} ${scores[k]}점도 낮아 야간 기록 확인`));
   }
  }else if(key==='energy'||key==='activityRecovery'){
   if(context==='sleep')crossBits.push(tr(`同日睡眠${scores.sleep}分也低，可能同時影響精神狀態`,`同日睡眠${scores.sleep}分也低，可能同时影响精神状态`,
     `Sleep was also low (${scores.sleep}) on this day; review it alongside energy`,
     `同日の睡眠も${scores.sleep}点。活力と合わせて確認`,
     `같은 날 수면 ${scores.sleep}점도 낮아 활력과 함께 확인`));
  }else if(key==='hrv'){
   if(context==='conflict')crossBits.push(tr('兩項HRV讀數接近平常，低分和來源不一致，先檢查計分','两项HRV读数接近平常，低分与来源不一致，先检查计分',
    'Both raw HRV measures are near usual; verify the score before drawing conclusions',
    'HRVの2値は普段に近いため採点元を確認',
    'HRV 두 지표가 평소와 비슷해 점수 근거 확인 필요'));
   else if(context==='bothlow')crossBits.push(tr('RMSSD和SDNN都明顯下降','RMSSD和SDNN都明显下降',
    'Both RMSSD and SDNN fell', 'RMSSDとSDNNがともに低下','RMSSD와 SDNN이 함께 감소'));
  }else if(key==='calm'&&context==='breathing')crossBits.push(tr(`同日呼吸${scores.breath}分也異常`,`同日呼吸${scores.breath}分也异常`,
   `Breathing was also low (${scores.breath})`, `同日の呼吸も${scores.breath}点`,`같은 날 호흡도 ${scores.breath}점`));
  else if(key==='cardio'&&context==='double')crossBits.push(tr('安靜時心跳和呼吸同時高風險，應優先核對','安静时心跳和呼吸同时高风险，应优先核对',
   'Pulse and breathing are both severely abnormal; check together',
   '心拍と呼吸の同時異常を優先確認','심박·호흡 동시 이상을 우선 확인'));
  if((key==='heart'||key==='breath') && abnormal(key==='heart'?'breath':'heart')){
    const related=key==='heart'?'breath':'heart';
    crossBits.push(tr(`同日${nm(related)}${scores[related]}分也異常，需一起查看`,
      `同日${nm(related)}${scores[related]}分也异常，需一起查看`,
      `${nm(related)} was also abnormal (${scores[related]}) on the same day`,
      `同日の${nm(related)}も${scores[related]}点。合わせて確認`,
      `같은 날 ${nm(related)}도 ${scores[related]}점. 함께 확인`));
  }
  if(key==='recovery'&&abnormal('energy')){
    crossBits.push(tr(`同日精力${scores.energy}分也低，應分開核對恢復和活動量`,
      `同日精力${scores.energy}分也低，应分别核对恢复和活动量`,
      `Energy was also low (${scores.energy}); assess recovery and activity separately`,
      `同日の活力も${scores.energy}点。回復と活動量は別々に確認`,
      `같은 날 활력 ${scores.energy}점도 낮아 회복과 활동을 각각 확인`));
  }
  const st=tr(...intensity[t]);
  const needsSourceReview=!d.valid&&['heart','breath','hrv','stable','sleep','energy','recovery'].includes(key);
  const prefix=needsSourceReview?tr('資料需要核對：','数据需要核对：','Reading needs review: ','測定値の確認が必要：','측정 근거 확인: ')
   :t<=12?`${st}${li===2?': ':li===3?'。':li===4?': ':'：'}`:'';
  let cause=tr(`原因：${prefix}${msg}`,`原因：${prefix}${msg}`,`Cause: ${prefix}${msg}`,`理由：${prefix}${msg}`,`원인: ${prefix}${msg}`);
  // Only one most useful cross-domain cue: avoid overwhelming a mobile card.
  if(!compact&&!veryShort&&crossBits.length)cause+=tr(`；${crossBits[0]}`,`；${crossBits[0]}`,`; ${crossBits[0]}`,`。${crossBits[0]}`,`. ${crossBits[0]}`);
  // Period valid/high/extreme-day totals are already shown in the status lead.
  // Do not repeat them again inside the cause paragraph.
  // Choose primary owner action by clinical domain, direction and related data.
  let which='general';
  if(key==='cardio')which=context==='double'?'double':'single';
  if(key==='heart'||key==='breath')which=kdir;
  if(key==='hrv')which=context==='conflict'?'same':context==='bothlow'?'down':kdir;
  if(key==='sleep')which=kdir==='up'?'long':kdir==='down'?'short':'unknown';
  if(key==='activityRecovery')which=context==='sleep'?'sleep':'generic';
  if(key==='energy')which=context==='sleep'?'sleep':'generic';
  if(key==='recovery')which=kdir;
  if(key==='calm')which=context==='breathing'?'breathing':'generic';
  const dict=FIRST[key]||FIRST.cardio;
  let first=choose(dict[which]||dict.unknown||dict.general||dict.single||Object.values(dict)[0],li);
  // A past 7/30-day record must not issue instructions as though it is happening now.
  if(period){
   const pastFirst={
    cardio:['找出心肺最差的日期，對照當時心跳與呼吸','找出心肺最差的日期，对照当时心跳与呼吸','Find low-scoring dates and compare pulse with breathing','心肺が悪かった日の心拍と呼吸を比較','심폐가 나빴던 날의 심박·호흡을 비교'],
    heart:['回看心跳異常集中在哪些日期及時段','回看心跳异常集中在哪些日期和时段','Review which days and times had abnormal pulse','心拍が異常だった日時を確認','심박 이상이 나타난 날짜와 시간을 확인'],
    breath:['回看呼吸急促或減慢的日期，核對當時是否安靜','回看呼吸急促或减慢的日期，核对当时是否安静','Review abnormal breathing days and whether your pet was resting','呼吸が速い・遅い日と安静状態を確認','호흡이 빨라지거나 느려진 날과 휴식 상태 확인'],
    hrv:['比較 HRV 低分日的訊號品質及當天心跳','比较 HRV 低分日的信号质量和当天心跳','Compare signal quality and pulse on low-HRV days','HRVが低い日の信号品質と心拍を確認','HRV 저점일의 신호 품질과 심박 확인'],
    stable:['回看低分當天的有效波形與實際心跳','回看低分当天的有效波形与实际心跳','Review the waveforms and actual pulse on low-score days','低得点の日の波形と実際の脈を確認','저점일 파형과 실제 맥박을 확인'],
    sleep:['找出睡得最少的夜晚，查看中斷與同夜呼吸','找出睡得最少的夜晚，查看中断和同夜呼吸','Find the worst nights and review interruptions and breathing','休息が少ない夜の中断と呼吸を確認','잠이 적었던 밤의 중단과 호흡을 확인'],
    activityRecovery:['找出精力或恢復最差的日期，再對照睡眠','找出精力或恢复最差的日期，再对照睡眠','Find the low-energy/recovery days and compare sleep','活力・回復が低い日と睡眠を比較','활력·회복이 낮은 날의 수면을 비교'],
    energy:['核對活動量最低的日期和相鄰夜晚的睡眠','核对活动量最低的日期和相邻夜晚的睡眠','Review the least-active days and adjacent nights of rest','活動が少ない日と前後の睡眠を確認','활동이 적었던 날과 전후 수면을 확인'],
    recovery:['核對恢復慢的日期與當時活動強度','核对恢复慢的日期与当时活动强度','Compare slow-recovery days with exercise intensity','回復が遅い日と運動の強さを比較','회복이 느렸던 날의 운동 강도를 비교'],
    calm:['查找持續不安的日期，對照休息與呼吸','查找持续不安的日期，对照休息与呼吸','Review restless days alongside sleep and breathing','落ち着きがない日と睡眠・呼吸を比較','불안했던 날과 수면·호흡을 비교']};
   first=choose(pastFirst[key],li)||first;
  }
  // Invalid source values require signal review, not a made-up biological condition.
  if(!d.valid&& !['cardio','activityRecovery','calm'].includes(key)){
   first=tr('先檢查原始量測與佩戴品質，再核對這項分數','先检查原始测量与佩戴质量，再核对这项分数',
    'Check the source reading and collar fit before interpreting this score',
    '元の測定値と装着を確認してから点数を判断',
    '원시 측정값과 착용 상태를 확인한 뒤 점수 판단');
  }
  let next='';
  if(t<=1)next=choose(NEXT[key]?.[0]||NEXT.cardio[0],li);
  else if(t<=5)next=choose(NEXT[key]?.[1]||NEXT.cardio[1],li);
  else if(t<=12)next=choose(LIGHT[Math.min(t-4,LIGHT.length-1)],li);
  else next=choose(LIGHT[12],li);
  // Every severity sub-band has its own escalation; keep metric-specific first step.
  // A pair of scores in the same broad risk color must not get identical advice.
  if(t<=12)next+=`${li===2?'; ':li===3?'。':li===4?'. ':'；'}${choose(BAND_NEXT[t],li)}`;
  // Extra urgency for genuinely concurrent heart/breathing abnormalities, not just a score.
  if((key==='cardio'||key==='sleep')&&context==='both-cardio'&&t<=5){
   next=choose(NEXT.breath[t<=1?0:1],li)+(li===2?'; ':li===3?'。':li===4?'. ':'；')+choose(BAND_NEXT[t],li);
  }
  if(key==='hrv'&&context==='conflict')next=tr('先核對計分與訊號，不要把低分當成心臟病','先核对计分与信号，不要把低分当成心脏病','First verify the score and signal; low HRV is not a diagnosis','まず計算と信号を確認。心疾患とは断定しません','먼저 점수·신호 확인. 심장병으로 단정 금지');
  if(period){
   const now=tr('這是歷史紀錄，先比較最新狀態','这是历史记录，先比较最新状态','This is historical; first compare the latest readings','過去の記録です。まず最新の状態を確認','과거 기록이므로 최신 상태부터 확인');
   const sfx=t<=5?tr('若現在仍嚴重異常，今天聯絡獸醫','如果现在仍严重异常，今天联系兽医','If the abnormality is still present now, contact a vet today','現在も重い異常が続くなら今日獣医へ','현재도 심한 이상이 지속되면 오늘 진료'):tr('再追蹤接下來的有效記錄','再追踪接下来的有效记录','Track subsequent valid readings','その後の有効な記録も確認','다음 유효 기록도 관찰');
   // Keep the 16-band distinction in historical views too; never paste the
   // same generic advice across 7/30-day cards.
   next=`${now}${li===2?'; ':li===3?'。':li===4?'. ':'；'}${choose(PERIOD_NEXT[t],li)}`;
  }
  if(veryShort){
   // Domain-specific short action: keep the reason AND the action within actual phone lines.
   const br={
    cardio:['查最差心肺日','查最差心肺日','Review worst cardio days','心肺の低得点日を確認','심폐 저점일 확인'],
    heart:kdir==='down'?['核對心跳過慢','核对心跳过慢','Check slow pulse','遅い心拍を確認','느린 심박 확인']:['核對心跳過快','核对心跳过快','Check fast pulse','速い心拍を確認','빠른 심박 확인'],
    breath:kdir==='down'?['核對呼吸過慢','核对呼吸过慢','Check slow breathing','遅い呼吸を確認','느린 호흡 확인']:['核對呼吸急促','核对呼吸急促','Check rapid breathing','速い呼吸を確認','빠른 호흡 확인'],
    hrv:['查HRV與訊號','查HRV与信号','Review HRV and signal','HRVと信号を確認','HRV·신호 확인'],
    stable:['查心搏波形','查心搏波形','Review beat waveform','心拍波形を確認','심박 파형 확인'],
    sleep:['查夜間休息與呼吸','查夜间休息与呼吸','Review sleep and breaths','睡眠と呼吸を確認','수면·호흡 확인'],
    activityRecovery:['核對精力、恢復與睡眠','核对精力、恢复与睡眠','Review energy and rest','活力と睡眠を確認','활력·수면 확인'],
    energy:['查活動與睡眠','查活动与睡眠','Review energy and sleep','活力と睡眠を確認','활력·수면 확인'],
    recovery:['查活動後恢復','查活动后恢复','Review recovery','運動後の回復を確認','활동 후 회복 확인'],
    calm:['查安靜時的喘氣與不安','查安静时的喘气与不安','Review calm breathing','安静時の呼吸を確認','안정 시 호흡 확인']};
   first=choose(br[key],li)||first;
   // A genuinely short, evidence-bearing two-part line, not the old generic fallback.
   let clipped=metricObservation(lead,datum,row,li,true,true);
   if(key==='cardio'||key==='activityRecovery'){
     const firstTwo=ks.slice(0,2).map(k=>`${nm(k)}${scores[k]}`).join(tr('、','、',', ','・','·'));
     clipped=tr(`${firstTwo}分拖低總分；${clipped}`,`${firstTwo}分拉低总分；${clipped}`,
       `${firstTwo} lower the total; ${clipped}`,`${firstTwo}点が低下。${clipped}`,`${firstTwo}점 하락. ${clipped}`);
   }
   if(key==='calm'){
    const xs=scoredSort(['breath','hrv','heart']).filter(k=>scores[k]<80).slice(0,2);
    clipped=xs.length?tr(`安靜狀態與${xs.map(k=>nm(k)+scores[k]).join('、')}分同時偏離`,
      `安静状态与${xs.map(k=>nm(k)+scores[k]).join('、')}分同时偏离`,
      `Rest signals differ with ${xs.map(k=>nm(k)+scores[k]).join(', ')}`,
      `安静指標と${xs.map(k=>nm(k)+scores[k]).join('・')}点に変化`,
      `안정도·${xs.map(k=>nm(k)+scores[k]).join('·')}점 함께 변화`):
      tr('安靜狀態綜合分數偏低，需核對資料','安静状态综合分数偏低，需核对数据',
       'Low combined calm score; verify inputs','安静時の複合点数を確認','안정도 복합 점수 근거 확인');
   }
   if(key==='hrv'&&context==='conflict')clipped=tr('HRV低分與兩項原始讀數不一致','HRV低分与两项原始读数不一致','Low HRV score conflicts with source readings','HRV点数と測定値が不一致','HRV 점수와 측정값 불일치');
   cause=tr(`原因：${clipped}`,`原因：${clipped}`,`Cause: ${clipped}`,`理由：${clipped}`,`원인: ${clipped}`);
   next=choose(SHORT_NEXT[t],li);
  }
  const separator=li===3?'。':li===4?'. ':li===2?'; ':'；';
  let action=tr(`建議：${first}${separator}${next}`,`建议：${first}${separator}${next}`,`Next: ${first}${separator}${next}`,`対応：${first}${separator}${next}`,`조치: ${first}${separator}${next}`);
  if(compact&&!veryShort){
   // Keep only owner action and domain-specific danger cue on narrower cards.
   const small=period?tr('比對最新狀態','对比最新状态','compare latest','最新の状態を確認','최신 상태 비교')+(li===2?'; ':li===3?'。':li===4?'. ':'；')+choose(PERIOD_NEXT[t],li):choose(BAND_NEXT[t],li);
   action=tr(`建議：${first}${separator}${small}`,`建议：${first}${separator}${small}`,`Next: ${first}${separator}${small}`,`対応：${first}${separator}${small}`,`조치: ${first}${separator}${small}`);
  }
  const id=[key,t,context,which,kdir,period?`d${days}`:'d1',crossBits.length?1:0,d.valid?'ref':'noref',veryShort?'s':compact?'c':'f'].join('|');
  return {cause,action,id,tier:t,severity:st,context,related:crossBits,validReading:d.valid,period,distinctContext:which};
 }
 root.DeepPetNarrative138=Object.freeze({version:'10.139',compose,tier,metricObservation,countScores,domains:K});
})(window);
