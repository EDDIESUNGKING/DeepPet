/* DeepPet V10.126: owner-first explanations based ONLY on verified score inputs.
 * These are not preset narratives for a particular pet or diagnosis.
 * This module is read-only: it never alters scores, observations or history.
 */
(function(root){'use strict';
 const good=x=>typeof x==='number'&&Number.isFinite(x);
 const txt=(c,tw,en,ko,ja)=>c.translate(tw,en,ko,ja);
 const number=x=>Math.round(x*10)/10;
 const subs=['heart','breath','hrv','stable','sleep','energy','recovery','calm'];
 const names={heart:['心跳','heart rate','심박','心拍'],breath:['呼吸','breathing','호흡','呼吸'],hrv:['心跳間隔變化（HRV）','heart-rate variation (HRV)','심박 간격 변화(HRV)','心拍間隔の変化（HRV）'],stable:['心搏節奏穩定度','heartbeat stability','심박 안정도','心拍の安定度'],sleep:['睡眠休息','rest and sleep','수면과 휴식','睡眠と休息'],energy:['精力與活動','energy and movement','활력과 활동','元気と活動'],recovery:['活動後恢復','recovery after activity','활동 후 회복','活動後の回復'],calm:['放鬆與平穩度','calm and rest','안정과 휴식','落ち着きと安静']};
 const direct={cardio:['heart','breath','hrv','stable'],activityRecovery:['energy','recovery','calm'],rhythm:['stable','hrv'],calm:['calm','heart','breath','hrv'],energy:['energy','sleep'],heart:['heart'],breath:['breath'],hrv:['hrv'],stable:['stable'],sleep:['sleep'],recovery:['recovery']};
 const formatChange=(c,field,unit,labels)=>{
  const value=c.features?.[field],base=c.references?.[field];
  if(!good(value))return null;
  const title=txt(c,...labels);
  const v=number(value),u=unit===' 次／分'?txt(c,' 次／分',' breaths/min',' 회/분',' 回/分'):unit===' 小時'?txt(c,' 小時',' hours',' 시간',' 時間'):unit||'';
  if(!good(base)||base<=0)return txt(c,
   `${title}是 ${v}${u}，但尚無相同條件的有效參考，現在不能確定比平常高或低多少。`,
   `${title} is ${v}${u}. There is no like-for-like reference yet, so the size of the change is unknown.`,
   `${title}은(는) ${v}${u}입니다. 비교 가능한 기준이 없어 변화 폭은 아직 알 수 없습니다.`,
   `${title}は${v}${u}ですが、同じ条件の比較記録がないため変化の大きさは不明です。`);
  const change=Math.round(Math.abs((value-base)*100/base));
  if(change===0)return txt(c,
   `${title}是 ${v}${u}，和可比參考 ${number(base)}${u} 接近。`,
   `${title} is ${v}${u}, close to the matched reference of ${number(base)}${u}.`,
   `${title} ${v}${u}으로 비교 기준 ${number(base)}${u}과 비슷합니다.`,
   `${title}は${v}${u}で、比較値の${number(base)}${u}に近い状態です。`);
  const up=value>base;
  return txt(c,
   `${title}是 ${v}${u}，可比參考約 ${number(base)}${u}，${up?'高':'低'}了約 ${change}%。`,
   `${title}: ${v}${u} versus reference ${number(base)}${u} — about ${change}% ${up?'higher':'lower'}.`,
   `${title} ${v}${u}, 비교 기준값 ${number(base)}${u}보다 약 ${change}% ${up?'높습니다':'낮습니다'}.`,
   `${title}は${v}${u}、比較基準値${number(base)}${u}より約${change}%${up?'高く':'低く'}なっています。`);
 };
 function evidence(c,k){
  const wave=c.source==='20hz-waveform';
  const a={
   heart:[['quietHeartRate',' bpm',['安靜時心跳','heart rate at rest','쉬는 동안 심박','安静時の心拍']],['heartRate',' bpm',['有效時段平均心跳','mean heart rate during valid observations','유효 측정 구간 평균 심박','有効測定区間の平均心拍']]],
   breath:[['quietBreathRate',' 次／分',['安靜時呼吸','breaths at rest','쉬는 동안 호흡','安静時の呼吸']],['breathRate',' 次／分',['有效時段平均呼吸','mean breathing rate during valid observations','유효 측정 구간 평균 호흡','有効測定区間の平均呼吸']]],
   hrv:[['rmssd',' ms',['短時間心跳間隔變化（RMSSD）','short-term beat variation (RMSSD)','짧은 시간 심박 간격 변화(RMSSD)','短時間の心拍間隔変化（RMSSD）']],['sdnn',' ms',['整段心跳間隔變化（SDNN）','overall beat variation (SDNN)','전체 심박 간격 변화(SDNN)','全体の心拍間隔変化（SDNN）']]],
   stable:wave?[['quietRhythm','',['安靜時心搏節奏指標','resting heartbeat pattern','안정 시 심박 패턴','安静時の心拍パターン']]]:[['sdnn',' ms',['心跳間隔變化（SDNN）','overall interval variability (SDNN)','박동 간격 변화(SDNN)','心拍間隔の変化（SDNN）']]],
   sleep:[['restHours',' 小時',['記錄到的休息時間','recorded rest','기록된 휴식','記録された休息']]],
   energy:wave?[['motionMean','',['活動強度','movement level','활동 강도','活動量']]]:[['activity','',['每日活動量','daily movement','하루 활동량','一日の活動量']]],
   recovery:[['recoveryDrop',' bpm',['活動後兩分鐘心跳下降幅度','heart-rate fall two minutes after activity','활동 후 2분간 심박 감소','活動後2分間の心拍低下']]],
   calm:[['quietHeartRate',' bpm',['安靜時心跳','heart rate at rest','쉬는 동안 심박','安静時の心拍']],['quietBreathRate',' 次／分',['安靜時呼吸','breaths at rest','쉬는 동안 호흡','安静時の呼吸']]]
  };
  const out=[];for(const [field,unit,label] of a[k]||[]){const line=formatChange(c,field,unit,label);if(line)out.push(line);}
  return out;
 }
 const band=s=>s<10?0:s<20?1:s<30?2:s<40?3:s<50?4:s<60?5:s<65?6:s<70?7:s<75?8:s<80?9:s<83?10:s<86?11:s<90?12:s<95?13:s<98?14:15;
 function explain(c){
  const s=c.scores||{},score=s[c.key];if(!good(score)||!c.translate)return [];
  const level=score<20?4:score<60?3:score<80?2:score<90?1:0;
  if(level===0)return [];
  const b=band(score),name=c.keyName||c.key,context=Number(c.days)>1;
  const isPast=!c.isCurrent || context;
  const out=[];
  if(level>=3){out.push(txt(c,
   `【先看真正原因】${name}只有 ${score}/100。${context?'以下以期間最低分的實際日期為例；不是說整段期間每天都一樣差。':'下面按實際資料把低分原因分開說明。'}這是${b<=1?'非常極端':b<=3?'非常明顯':'不可忽略'}的監測偏離，先核對寵物現在的狀況。`,
   `WHY THE SCORE IS LOW: ${name} is ${score}/100. ${context?'The details below come from the actual worst day, not every day in the period.':'The measured reasons are listed separately below.'} This is ${b<=1?'an extreme':b<=3?'a major':'a significant'} monitoring difference. Check how your pet is now.`,
   `점수가 낮은 이유: ${name} ${score}/100점입니다. ${context?'아래 수치는 기간 중 최저일의 기록이며 매일 같은 상태였다는 뜻이 아닙니다.':'실제 기록의 원인을 아래에 나누어 설명합니다.'} 현재 반려동물의 상태를 먼저 확인하세요.`,
   `低い点数の理由：${name}は${score}/100点です。${context?'以下は期間中の最低点の日の記録で、毎日同じ状態だったという意味ではありません。':'実際の数値を項目別に説明します。'}まず現在の様子を確認してください。`));}
  else out.push(txt(c,
   `【這個分數主要差在哪裡】${name} ${score}/100；下面列出這次有證據的主要變化，方便你判斷是否持續。`,
   `WHAT CHANGED: ${name} is ${score}/100. The main measured changes are below, so you can see whether they continue.`,
   `어떤 점이 달라졌나요? ${name} ${score}/100점입니다. 아래 실제 변화를 확인하세요.`,
   `何が変わったのでしょうか？${name}は${score}/100点です。主な変化を以下で確認できます。`));
  const group=(direct[c.key]||[c.key]).filter(k=>good(s[k])&&(s[k]<90||k===c.key)).sort((a,b)=>s[a]-s[b]);
  const relevant=group.length?group:[c.key];
  for(const k of relevant){
   const val=s[k];if(!good(val))continue;
   const label=txt(c,...(names[k]||[k,k,k,k]));
   const list=evidence(c,k);
   const description=val<20?txt(c,'這一項非常低，不能當成小幅變動。','This is extremely low; do not dismiss it as a small change.','매우 낮은 점수이며 작은 변화로 보면 안 됩니다.','非常に低い点数で、軽い変化として見逃せません。'):
    val<60?txt(c,'此項分數偏低，先核對有效量測及參考範圍。','This score is low; check valid readings and their reference range.','점수가 낮습니다. 유효 측정값과 기준 범위를 확인하세요.','普段との違いが大きく、優先して確認が必要です。'):
    val<80?txt(c,'這一項已有值得追蹤的差距。','This change is worth following up.','추적할 만한 변화가 있습니다.','追跡が必要な変化があります。'):
    txt(c,'此項分數略低；查看量測值及近期趨勢。','Slightly lower score; review the readings and recent trend.','점수가 약간 낮습니다. 측정값과 최근 추세를 확인하세요.','軽い変化です。');
   const advice={heart:['留意安靜時心跳是否持續偏離，並觀察精神與活動意願。','Check whether the resting heart rate stays unusual; observe alertness and willingness to move.','안정 시 심박 변화가 지속되는지, 활력과 움직임을 확인하세요.','安静時の心拍の変化と元気を確認してください。'],breath:['留意休息時呼吸是否持續偏快或費力。','Observe whether breathing remains fast or laboured at rest.','휴식 중 호흡이 계속 빠르거나 힘든지 확인하세요.','安静時の呼吸の速さや苦しさを確認してください。'],hrv:['在相近的安靜時段及量測長度下比較，先排除動作干擾。','Compare quiet recordings of similar duration after checking motion interference.','움직임 영향을 확인하고 비슷한 길이의 안정 시 기록을 비교하세요.','同じ長さの安静時記録を比較し、体動の影響を確認してください。'],stable:['核對安靜時波形品質，觀察節奏異常是否反覆。','Check resting waveform quality and whether unusual rhythm recurs.','안정 시 파형 품질과 불규칙한 패턴의 반복 여부를 확인하세요.','安静時の波形品質と変化の繰り返しを確認してください。'],sleep:['留意休息時間是否充足，以及夜間是否頻繁醒來或移動。','Observe rest duration and repeated waking or movement overnight.','휴식 시간과 밤중에 자주 깨거나 움직이는지 확인하세요.','休息時間と夜間の覚醒や体動を確認してください。'],energy:['觀察日常活動意願、精神及食慾是否較平時改變。','Observe changes in usual movement, alertness and appetite.','평소 대비 활동 의욕, 활력과 식욕 변화를 확인하세요.','普段の活動意欲や食欲の変化を確認してください。'],recovery:['比較相近活動後的休息時段，留意喘氣或心跳偏快是否持續。','Compare rest after similar activity; watch for persistent panting or fast heartbeat.','비슷한 활동 후 휴식 기록에서 헐떡임이나 빠른 심박이 지속되는지 확인하세요.','同程度の活動後に呼吸や心拍が落ち着くか確認してください。'],calm:['在安靜環境觀察呼吸、姿勢及是否容易安定下來。','Observe breathing, posture and settling in a quiet environment.','조용한 환경에서 호흡, 자세와 안정되는 모습을 확인하세요.','静かな環境で呼吸や姿勢、落ち着き方を確認してください。']};
   const detail=advice[k]&&list.length?txt(c,...advice[k]):description;
   out.push(txt(c,`【${label} ${val}/100】${detail}`,`${label} ${val}/100: ${detail}`,`${label} ${val}/100: ${detail}`,`${label} ${val}/100：${detail}`));
   if(list.length)out.push(...list);
   else out.push(txt(c,
    `目前未取得能解釋這項分數的原始量測值；必須先核對資料與佩戴品質，不能猜原因。`,
    `The raw measurement behind this score is missing. Check the data and collar fit rather than guessing the cause.`,
    `점수의 근거가 되는 원시 측정값이 없습니다. 원인을 추측하지 말고 착용과 자료를 확인하세요.`,
    `得点の元になる測定値がありません。原因を推測せず、装着と記録を確認してください。`));
  }
  if(level>=3){
   const extra=subs.filter(k=>!relevant.includes(k)&&good(s[k])&&s[k]<60).sort((a,b)=>s[a]-s[b]);
   if(extra.length)out.push(txt(c,
    `【同一天還有其他低分】${extra.map(k=>txt(c,...names[k])+' '+s[k]+'/100').join('、')}。這些也要檢查，但不一定直接決定本頁分數。`,
    `OTHER LOW SCORES THAT DAY: ${extra.map(k=>txt(c,...names[k])+' '+s[k]+'/100').join('; ')}. Review them too, but they may not directly determine this page's score.`,
    `같은 날의 다른 저점: ${extra.map(k=>txt(c,...names[k])+' '+s[k]+'/100').join(', ')}. 함께 살펴보되 이 화면 점수의 직접 원인과 구분하세요.`,
    `同じ日のほかの低得点：${extra.map(k=>txt(c,...names[k])+' '+s[k]+'/100').join('、')}。この画面の直接要因とは区別してください。`));
   out.push(isPast?txt(c,
    '【先核對現在狀況】這是所選日期的記錄，不能直接認定此刻仍在發生。請看最新讀數與現在的呼吸、精神和站立能力。',
    'CHECK THE PRESENT: This is a dated record, not proof the same problem is happening right now. Compare the latest reading and current breathing, alertness and ability to stand.',
    '현재 상태 확인: 과거 기록만으로 지금도 이상이 있다고 단정할 수 없습니다. 최신 기록과 호흡·활력·기립을 확인하세요.',
    '現在の確認：過去の記録だけで今も異常とは言えません。最新記録と呼吸、元気、立てるかを確認してください。'):
    txt(c,
    '【現在就要做】先停止額外運動、讓寵物在涼爽安靜的地方休息，確認項圈是否貼合、讀數是否持續異常。若目前呼吸費力、牙齦發藍、倒下或無法站立，立即聯絡獸醫急診。',
    'ACT NOW: Stop extra exercise, let your pet rest somewhere cool and quiet, and check collar fit and repeat readings. If breathing is laboured, gums turn blue, or the pet collapses or cannot stand, seek emergency veterinary care now.',
    '지금 해야 할 일: 추가 운동을 멈추고 조용하고 시원한 곳에서 쉬게 한 뒤 착용 상태와 재측정을 확인하세요. 현재 호흡 곤란·푸른 잇몸·쓰러짐·기립 불가가 있으면 즉시 응급 진료를 받으세요.',
    '今すぐ：運動を止め、涼しく静かな場所で休ませ、装着と再測定を確認してください。今、呼吸困難・歯ぐきの青変・虚脱・起立不能がある場合は直ちに救急受診してください。'));
  }
  return out.filter(Boolean);
 }
 root.DeepPetPlainReasons126=Object.freeze({version:'10.126',explain,band});
})(window);
