/* DeepPet V10.127 — compact, cause-first presentation for owner-facing UI.
 * Display only the critical verified evidence, not a dump of every scoring
 * factor. No scores, thresholds, dates, pet records or SDK data are changed.
 */
(function(root){'use strict';
 const good=x=>typeof x==='number'&&Number.isFinite(x);
 const lang=(tw,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const band=n=>!good(n)?-1:n<20?4:n<60?3:n<80?2:n<90?1:0;
 const limit=t=>t>=3?10:t===2?6:t===1?5:2;
 const meta={
  cardio:['心肺綜合狀態','Cardio-respiratory status','심폐 상태','心肺の状態'],heart:['心跳','Heart rate','심박','心拍'],breath:['呼吸','Breathing','호흡','呼吸'],
  hrv:['HRV','HRV','HRV','HRV'],stable:['心搏節奏穩定度','Heartbeat stability','심박 안정도','拍動の安定度'],sleep:['睡眠休息','Sleep and rest','수면·휴식','睡眠と休息'],
  activityRecovery:['精力與恢復','Energy and recovery','활력·회복','活力と回復'],energy:['精力','Energy','활력','活力'],recovery:['活動後恢復','Post-activity recovery','활동 후 회복','活動後の回復'],
  calm:['放鬆與平穩度','Calmness','안정도','落ち着き']
 };
 const comp={cardio:['breath','heart','hrv','stable'],activityRecovery:['energy','calm','recovery']};
 const name=k=>lang(...(meta[k]||[k,k,k,k]));
 const shortName=k=>k==='recovery'?lang('恢復','Recovery','회복','回復'):name(k);
 const all=()=>root.DeepPetSignalScoring?.getDaily?.(state.dog)||[];
 const featuresFor=row=>(root.DeepPetSignalScoring?.getFeatures?.(state.dog)||[]).find(x=>x?.date===row?.date)||{};
 const rawFor=row=>typeof demoRecords==='function'?(demoRecords(state.dog)||[]).find(x=>x?.date===row?.date)||{}:{};
 const records=(days,dateOverride=null)=>{
  if(days===1&&/^\d{4}-\d{2}-\d{2}$/.test(dateOverride||''))return all().filter(x=>x?.date===dateOverride);
  const xs=root.DeepPetEvidenceNarrative124?.period?.(days);
  if(Array.isArray(xs))return xs;
  const now=typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):new Date().toISOString().slice(0,10);
  const chosen=days===1&&/^\d{4}-\d{2}-\d{2}$/.test(state.deepSelectedDate||'')?state.deepSelectedDate:now;
  const end=Date.parse(chosen+'T12:00:00Z');
  return all().filter(x=>{const d=Date.parse(x.date+'T12:00:00Z');return d<=end&&d>end-days*86400000;});
 };
 const mean=(rs,k)=>{const ns=rs.map(r=>r.scores?.[k]).filter(good);return ns.length?Math.round(ns.reduce((a,b)=>a+b,0)/ns.length):null;};
 const n=x=>Math.round(x*10)/10;
 function fact(k,row){
  const f=featuresFor(row),raw=rawFor(row),fr=row?.fixtureEvidence?.references||{},refs=row?.baseline?.references||{};
  const val=(key)=>good(f[key])?f[key]:good(raw[key])?raw[key]:null;
  const ref=(key,fixture)=>good(refs?.[key]?.ref)?refs[key].ref:good(fr?.[fixture||key])?fr[fixture||key]:null;
  function cmp(title,value,baseline,unit){
   if(!good(value))return null;
   const v=n(value),u=unit||'';
   if(!good(baseline)||baseline<=0)return lang(`${title}${v}${u}，缺少可比的個體參考。`,`${title}: ${v}${u}; no matched reference.`,`${title} ${v}${u}, 비교 기준 없음.`,`${title}${v}${u}、比較記録なし。`);
   const delta=Math.round(Math.abs((value-baseline)/baseline)*100),up=value>baseline;
   if(delta<3)return lang(`${title}${v}${u}，接近參考${n(baseline)}${u}。`,`${title} ${v}${u}, close to usual ${n(baseline)}${u}.`,`${title} ${v}${u}, 평소 ${n(baseline)}${u}과 비슷합니다.`,`${title}${v}${u}、普段の${n(baseline)}${u}とほぼ同じ。`);
   return lang(`${title}${v}${u}，比參考${n(baseline)}${u}${up?'高':'低'}約${delta}%。`,`${title} ${v}${u} vs ${n(baseline)}${u} (${delta}% ${up?'higher':'lower'}).`,`${title} ${v}${u}, 기준 ${n(baseline)}${u}보다 약 ${delta}% ${up?'높음':'낮음'}.`,`${title}${v}${u}、比較値${n(baseline)}${u}より約${delta}%${up?'高い':'低い'}。`);
  }
  switch(k){
   case 'heart':return cmp(lang('安靜心跳','Resting heart rate','안정 심박 ','安静時心拍'),val('quietHeartRate'),ref('quietHeartRate','heart'),' bpm');
   case 'breath':return cmp(lang('安靜呼吸','Resting breathing','안정 호흡 ','安静時呼吸'),val('quietBreathRate'),ref('quietBreathRate','breath'),lang('次／分','/min','회/분','回/分'));
   case 'hrv':{
    const a=cmp('RMSSD ',val('rmssd'),ref('rmssd'),' ms');
    const b=cmp('SDNN ',val('sdnn'),ref('sdnn'),' ms');
    return [a,b].filter(Boolean).map((x,i)=>i===0?x.replace(/[。.]$/,''):x).join(lang('；','; ','; ','、'))||null;
   }
   case 'stable':return row.source==='20hz-waveform'?
    cmp(lang('安靜心搏節奏','Resting beat pattern','안정 심박 패턴 ','安静時拍動'),val('quietRhythm'),ref('quietRhythm'),''):
    cmp('SDNN ',val('sdnn'),ref('sdnn'),' ms');
   case 'sleep':return cmp(lang('有效休息','Recorded rest','휴식 ','休息時間'),val('restHours'),ref('restHours','sleep'),lang('小時',' h','시간','時間'));
   case 'energy':return cmp(lang('活動量','Movement','활동량 ','活動量'),row.source==='20hz-waveform'?val('motionMean'):val('activity'),row.source==='20hz-waveform'?ref('motionMean','activity'):ref('activity'),'');
   case 'recovery':return cmp(lang('兩分鐘心率回落','Heart-rate fall in 2 min','2분 심박 감소 ','2分間の心拍低下'),val('recoveryDrop'),ref('recoveryDrop','recovery'),' bpm');
   case 'calm':{const s=row.scores||{},keys=['breath','hrv','heart','sleep'].filter(k=>good(s[k])).sort((a,b)=>s[a]-s[b]).slice(0,3);
    return keys.length?lang(`相關低分：${keys.map(k=>name(k)+s[k]+'分').join('、')}，請一起核對安靜狀態。`,`Related low scores: ${keys.map(k=>name(k)+' '+s[k]).join('; ')}. Check quiet condition.`,
     `관련 저점: ${keys.map(k=>name(k)+' '+s[k]).join(', ')}. 쉬는 동안 상태를 확인하세요.`,`関連する低得点：${keys.map(k=>name(k)+s[k]+'点').join('、')}。安静時を確認。`):null;} 
  }
  return null;
 }
 function advice(t,historical){
  if(t>=3){return historical?
   lang('這是歷史低分；先看最新呼吸與精神。若現在呼吸困難、虛脫或牙齦發藍，立即送獸醫急診。','This is a dated result. Check the latest readings and your pet now; breathing distress, collapse or blue gums needs emergency veterinary care.','과거 기록입니다. 최신 수치와 현재 호흡·활력을 확인하고 호흡곤란·쓰러짐·푸른 잇몸이면 즉시 응급진료를 받으세요.','過去の記録です。最新値と現在の呼吸・元気を確認し、呼吸困難・虚脱・歯ぐきの青変があれば救急受診を。'):
   lang('立即停下運動、安靜休息並核對讀數；若呼吸困難、虛脫或牙齦發藍，立即送獸醫急診。','Stop extra exercise, allow quiet rest and verify readings. Breathing distress, collapse or blue gums needs emergency veterinary care.','지금 운동을 멈추고 쉬게 하며 측정값을 확인하세요. 호흡곤란·쓰러짐·푸른 잇몸이면 즉시 응급진료를 받으세요.','今すぐ運動を止めて安静にし、装着と測定値を確認。呼吸困難・虚脱・歯ぐきの青変は救急受診を。');}
  if(t===2)return lang('持續變差請聯絡獸醫。','Reduce activity; ask a vet if it worsens.','활동을 줄이세요. 계속 나빠지면 수의사와 상담하세요.','運動を控え、悪化が続く場合は獣医師に相談。');
  if(t===1)return lang('下次再看數值、精神和食慾。','Recheck readings, energy and appetite.','다음 측정값·활력·식욕을 확인하세요.','次回は数値と元気・食欲を確認。');
  return lang('目前大致穩定，持續日常觀察。','Generally stable; continue routine observation.','대체로 안정적입니다. 평소처럼 관찰하세요.','おおむね安定。普段どおり観察を。');
 }
 function heading(score,t,k,historical){
  const verb=t===4?lang('極端高風險','Critical monitoring alert','최고 경계','最優先警戒'):
   t===3?lang('高度警戒','High alert','높은 경계','高度警戒'):
   t===2?lang('中風險','Needs attention','주의 필요','要注意'):
   t===1?lang('低風險','Mild change','낮은 위험','軽い変化'):
   lang('健康','Stable','안정','安定');
  return lang(`${verb}｜${shortName(k)}${score}/100${historical?'（歷史記錄）':''}`,`${verb}: ${shortName(k)} ${score}/100${historical?' (past record)':''}`,
   `${verb}: ${shortName(k)} ${score}/100${historical?' (지난 기록)':''}`,`${verb}：${name(k)}${score}/100${historical?'（過去の記録）':''}`);
 }
 function summary(key,days=1,dateOverride=null){
  const rows=records(days,dateOverride).filter(x=>good(x?.scores?.[key]));
  if(!rows.length)return {score:null,tier:-1,lines:[lang('尚無有效資料。','No verified readings.','유효한 기록 없음.','有効な記録がありません。')],date:'',limit:2};
  const shown=days===1?rows.at(-1).scores[key]:mean(rows,key);
  const worst=rows.reduce((a,b)=>a.scores[key]<=b.scores[key]?a:b),lo=worst.scores[key];
  const t=Math.max(band(shown),days>1?band(lo):0);
  const today=typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):new Date().toISOString().slice(0,10);
  const historical=days!==1||worst.date!==today;
  const roles=['lead'];
  const periodLead=days>1?lang(
   `${days}天${t===4?'曾有極端低分':t>=3?'高風險':t===2?'中風險':t===1?'低風險':'健康'}｜${name(key)}均${shown}分，最低${lo}分（${worst.date.slice(5)}）`,
   `${days}d ${t===4?'critical low':t>=3?'high risk':t===2?'moderate':t===1?'mild':'stable'} · ${name(key)} avg ${shown}, worst ${lo} (${worst.date.slice(5)})`,
   `${days}일 ${t===4?'극단적 저점':t>=3?'고위험':t===2?'중위험':t===1?'저위험':'안정'} · ${name(key)} 평균 ${shown}, 최저 ${lo} (${worst.date.slice(5)})`,
   `${days}日${t===4?'著しい低得点あり':t>=3?'高リスク':t===2?'中リスク':t===1?'低リスク':'安定'}・${name(key)}平均${shown}点、最低${lo}点（${worst.date.slice(5)}）`):null;
  const lines=[periodLead||heading(shown,t,key,historical&&days===1)];
  const source=days>1?worst:rows.at(-1);
  const s=source.scores||{},parts=(comp[key]||[key]).filter(k=>good(s[k])).sort((a,b)=>s[a]-s[b]);
  if(comp[key]&&parts.length){
   roles.push('components');
   const order=parts.slice(0,t>=3?4:t===2?3:2);
   lines.push(lang(`關鍵分項：${order.map(k=>name(k)+s[k]+'分').join('、')}。`,`Key scores: ${order.map(k=>name(k)+' '+s[k]).join('; ')}.`,
    `주요 점수: ${order.map(k=>name(k)+' '+s[k]).join(', ')}.`,`主な下位点：${order.map(k=>name(k)+s[k]+'点').join('、')}。`));
  }
  // The reason is *measured* first. Show only the most informative 1–2
  // inputs; avoid repeating an entire eight-metric ledger on every card.
  const reasonKeys=(comp[key]||[key]).filter(k=>good(s[k])&&s[k]<90).sort((a,b)=>s[a]-s[b]);
  let count=0;
  for(const k of reasonKeys){if(count>=(t>=3?2:1))break;
   const measurement=fact(k,source);
   if(!measurement)continue;
   lines.push(comp[key]?`${name(k)}${s[k]}/100：${measurement}`:measurement);roles.push('fact');
   count++;
  }
  if(count===0&&t>=1){roles.push('fact');lines.push(lang('目前缺少足夠可比的原始值，不能猜測低分原因；請檢查資料與配戴。','Comparable measurements are missing; review data and collar fit instead of guessing.','비교 자료가 부족하므로 원인을 추측하지 말고 측정과 착용을 확인하세요.','比較測定が不足しています。原因を推測せずデータと装着を確認してください。'));}
  if(t>=2||t===1){roles.push('action');lines.push(advice(t,historical));}
  if(t===0){lines.splice(1);roles.splice(1);} // healthy composite and sub-items both stay short
  return {key,score:shown,tier:t,lines,roles,date:source.date,limit:limit(t),historical};
 }
 function paragraphs(node,data,home=false){
  if(!node)return;
  const max=home?4:data.limit;
  node.replaceChildren();node.classList.add('dp127-compact');node.dataset.dp127Max=String(max);
  const lines=home?data.lines.slice(1,2):data.lines;
  for(const [i,str] of lines.entries()){
   const p=document.createElement('p');p.className=i===0?'dp127-first':'dp127-line';p.dataset.dp127Role=data.roles?.[i]||'note';p.textContent=str;node.append(p);
  }
  // Fit the ACTUAL rendered text in the supported viewport. We remove low
  // priority measurements before ever suppressing the urgent owner action.
  // If unavoidable, trim the lead rather than leaving the layout overflowing.
  fitLines(node,max);
 }
 function visualLines(node){
  let lines=0;
  for(const p of node.querySelectorAll(':scope > p')){
   const style=getComputedStyle(p),lh=parseFloat(style.lineHeight)||20;
   lines+=Math.max(1,Math.ceil((p.getBoundingClientRect().height-0.4)/lh));
  }
  return lines;
 }
 function fitLines(node,max){
  let nodes=[...node.querySelectorAll(':scope > p')],n=visualLines(node),steps=0;
  while(n>max&&nodes.length>2&&steps++<15){
   const facts=nodes.filter(x=>x.dataset.dp127Role==='fact');
   const rank=x=>({components:0,note:1,fact:facts.length>1?2:99,period:4,lead:100,action:100}[x.dataset.dp127Role]??50);
   const candidates=nodes.filter(x=>rank(x)<90);
   if(!candidates.length)break;
   candidates.sort((a,b)=>rank(a)-rank(b)||nodes.indexOf(b)-nodes.indexOf(a));candidates[0].remove();
   nodes=[...node.querySelectorAll(':scope > p')];n=visualLines(node);
  }
  let trim=0;
  while(n>max&&trim++<30){
   // Prefer trimming the longest row; preserve its conclusion at the end.
   nodes=[...node.querySelectorAll(':scope > p')];
   const pool=nodes.filter(x=>x.dataset.dp127Role!=='action');
   const biggest=(pool.length?pool:nodes).reduce((a,b)=>a.textContent.length>b.textContent.length?a:b);
   const input=biggest.textContent;if(input.length<20)break;
   biggest.textContent=input.slice(0,Math.max(18,Math.floor(input.length*0.87))).replace(/[，；、\s]+$/,'')+'…';
   n=visualLines(node);
  }
  n=visualLines(node);
  node.dataset.dp127Measured=String(n);
 }
 function applyDeep(){
  if(state.tab!=='deep'||state.detail)return;
  const deep=document.querySelector('#app .dp-owner-deep');if(!deep)return;
  const d=[1,7,30].includes(Number(state.range))?Number(state.range):1,kind=Number(state.deepType);
  const keys=kind===0?['cardio','heart','breath','hrv','stable']:kind===1?['sleep']:['activityRecovery','energy','recovery','calm'];
  const targets=[...deep.querySelectorAll('.dp116-evidence-copy')];
  targets.forEach((el,i)=>{const k=keys[i];if(k)paragraphs(el,summary(k,d));});
  if(kind===1)deep.querySelectorAll('.dp73-narrative').forEach(el=>el.remove());
  // One observation/advice box per tab, not a repeated stack of alerts.
  const boxes=[...deep.querySelectorAll('.dp-deep-alert-reasons')];
  if(boxes.length){
   for(const extra of boxes.slice(1))extra.remove();
   const box=boxes[0];box.classList.add('dp127-one-observation');
   const heading=box.querySelector('.dp-deep-alert-heading');if(heading){
    const b=heading.querySelector('b');if(b)b.textContent=d===1?lang('今日觀察與建議','Today’s observation','오늘의 관찰과 조언','今日の観察と提案'):
     lang('期間觀察建議','Period observation','기간 관찰·제안','期間中の観察と提案');
   }
   const text=box.querySelector('.dp-deep-alert-lines');
   if(text){const key=keys[0],data=summary(key,d);text.replaceChildren();const p=document.createElement('p');
    p.className='dp127-observation-text';
    const primary=data.lines.find((x,i)=>data.roles?.[i]==='fact')||data.lines[1]||data.lines[0];
    const action=data.lines.find((x,i)=>data.roles?.[i]==='action');
    p.textContent=[primary,action].filter(Boolean).join(' ');text.append(p);
    fitLines(text,8);
    const more=document.createElement('button');more.type='button';more.className='dp127-details-link';more.dataset.dp127Open=key;
    more.textContent=lang('查看簡明詳情 ›','View concise details ›','간단한 자세히 보기 ›','簡潔な詳細を見る ›');text.append(more);
   }
  }
 }
 function applyDetail(){
  if(state.tab!=='deep'||!state.detail)return;
  const k=state.detail==='dp90-waveform'?(state.dp90WaveKind==='breath'?'breath':'heart'):
   state.detail==='dp905-sleep-day'?'sleep':
   ['dp905-energy-day','dp936-energy-detail','dp908-energy-calendar'].includes(state.detail)?'energy':null;
  if(!k)return;
  const target=document.querySelector('#app .dp1068-detail-why .dp116-evidence-copy');if(!target)return;
  let d=1;
  if(state.detail==='dp908-energy-calendar')d=[7,30].includes(Number(state.range))?Number(state.range):7;
  else if(state.dp905WaveMode==='period')d=[7,30].includes(Number(state.dp905WaveRange))?Number(state.dp905WaveRange):1;
  const date=state.detail==='dp905-sleep-day'?state.dp905ChosenDate:
   state.detail==='dp90-waveform'?(state.dp905ChosenDate||state.dp90WaveDate):
   (state.dp936EnergyDate||state.dp905ChosenDate||state.deepSelectedDate);
  paragraphs(target,summary(k,d,d===1?date:null));
 }
 function homeBrief(){
  if(state.tab!=='home'||(state.detail&&state.detail!=='today-all'))return;
  const today=(typeof iso==='function'&&typeof localDate==='function')?iso(localDate()):new Date().toISOString().slice(0,10);
  const row=all().find(x=>x?.date===today);
  for(const card of document.querySelectorAll('#app .dp-today-action')){
   const index=Number(card.dataset.index),heading=card.querySelector('.ai-suggestion-title')?.textContent||'';
   let key=card.classList.contains('dp-today-deep')&&[0,1,2].includes(index)?['cardio','sleep','activityRecovery'][index]:null;
   const match=heading.match(/HRV|心搏節奏|heartbeat stability|呼吸|Breath|心跳|Heart rate|睡眠|Sleep|精力|Energy/i);
   if(match){if(/HRV/i.test(match[0]))key='hrv';else if(/心搏節奏|heartbeat stability/i.test(match[0]))key='stable';else if(/呼吸|Breath/i.test(match[0]))key='breath';else if(/心跳|Heart rate/i.test(match[0]))key='heart';}
   const body=card.querySelector('.ai-suggestion-body');
   const sub=card.querySelector('.ai-suggestion-sub');
   if(row&&key&&body){
    const s=summary(key,1,today);const f=s.lines.slice(1).filter(x=>!/(立即停止|立即送|Stop extra exercise|今すぐ運動)/.test(x));
    body.replaceChildren();const p=document.createElement('p');p.className='dp127-home-reason';
    p.textContent=(f.find(x=>/%|比參考|比参考|vs \d+|보다 약|より約/.test(x))||f[0]||'').slice(0,140);
    body.append(p);
    // V10.139: users already know the entire task card is clickable.
    // Retain severity; remove "tap / click for causes" in all locales.
    if(sub)sub.textContent=s.tier>=3?lang('高度警戒','High alert','높은 경계','高度警戒'):
     s.tier===2?lang('中風險','Moderate risk','중위험','中リスク'):
     lang('今日提醒','Today’s reminder','오늘 알림','今日の通知');
   }else if(body){
    const first=body.querySelector('p')?.textContent||'';
    body.replaceChildren();const p=document.createElement('p');p.className='dp127-home-reason';p.textContent=first.slice(0,120);body.append(p);
   }
   card.querySelector('.dp1030-score-context')?.remove();
   card.classList.add('dp127-home-card');
  }
  // Fix legacy mixed-English labels in the same owner-facing Home area.
  // This does not alter scores, translations stored in data, or any links.
  const counter=document.querySelector('#app .focus-count');
  if(counter){const m=counter.textContent.match(/(\d+)/);if(m)counter.textContent=lang(`${m[1]} 項`,` ${m[1]} items`,`총 ${m[1]}개`,`全${m[1]}件`).trim();}
  const digest=document.querySelectorAll('#app .dp1029-today-digest > span');
  const bases=[
   [ '最高優先', 'Top priority', '최우선', '最優先' ],
   [ '持續低分', 'Persistently low', '지속 저점', '低得点が継続' ],
   [ '逾期待確認', 'Overdue to confirm', '기한 초과 확인', '期限切れ・要確認' ]
  ];
  digest.forEach((el,i)=>{const m=el.textContent.match(/(\d+)/);if(m&&bases[i])el.textContent=`${lang(...bases[i])}：${m[1]}`;});
  document.querySelectorAll('#app .dp-lane-copy').forEach((lane,i)=>{
   const main=lane.querySelector('strong'),sub=lane.querySelector('small');
   if(main&&i===0)main.textContent=lang('身體狀態評分','Body status score','신체 상태 점수','身体の状態スコア');
   if(main&&i===1)main.textContent=lang('身體節奏評分','Body rhythm score','신체 리듬 점수','身体リズムスコア');
   if(sub)sub.textContent=i===0?lang('心肺 · 睡眠 · 精力','Cardio · Sleep · Energy','심폐 · 수면 · 활력','心肺 · 睡眠 · 活力'):
     lang('放鬆平穩 · 心搏節奏穩定','Calmness · Heartbeat stability','편안함 · 박동 안정','落ち着き · 拍動の安定');
  });
  // Other Home cards with legacy long descriptions are visually shortened;
  // actionable cards still work and open their normal dedicated screens.
 }
 function fixDeepLabels(){
  if(state.tab!=='deep'||state.detail)return;
  const d=document.querySelector('#app .dp-owner-deep');if(!d)return;
  d.querySelectorAll('button[data-action="range"]').forEach(btn=>{
   const n=Number(btn.dataset.value);btn.textContent=n===1?lang('單日','Day','하루','1日'):n===7?lang('7天','7 days','7일','7日'):lang('30天','30 days','30일','30日');
  });
  d.querySelectorAll('button[data-action="deep-day-jump"]').forEach(btn=>{
   const v=Number(btn.dataset.days);btn.textContent=v===-1?lang('昨天','Yesterday','어제','昨日'):v===0?lang('今天','Today','오늘','今日'):btn.textContent;
  });
  d.querySelectorAll('b').forEach(el=>{
   const raw=el.textContent.trim();if(raw==='Select a day'||raw==='Choose a day')el.textContent=lang('選擇日期','Choose a day','날짜 선택','日付を選択');
  });
 }
 function renderCompact(){applyDeep();applyDetail();homeBrief();fixDeepLabels();
  root.DeepPetBuildVersion='10.128';
  document.querySelectorAll('#app .app-build-version').forEach(el=>{el.textContent=el.textContent.replace(/10\.12[0-7]/g,'10.128');});
}
 const previous=render;
 render=function(...args){const result=previous.apply(this,args);renderCompact();return result;};
 function openOne(key){
  document.querySelector('.dp127-detail-page')?.remove();
  const days=[1,7,30].includes(Number(state.range))?Number(state.range):1;
  const d=summary(key,days);const page=document.createElement('section');
  page.className='dp127-detail-page';page.setAttribute('role','region');page.setAttribute('aria-label',name(key));
  const bar=document.createElement('header');bar.className='dp127-detail-bar';
  const back=document.createElement('button');back.type='button';back.className='dp127-back';back.textContent=lang('‹ 返回','‹ Back','‹ 뒤로','‹ 戻る');bar.append(back);
  const title=document.createElement('h2');title.textContent=name(key);bar.append(title);page.append(bar);
  const box=document.createElement('article');box.className='dp127-detail-article';
  const hint=document.createElement('small');hint.textContent=lang('評分是監測提示，不是疾病診斷。','Monitoring scores are not a diagnosis.','점수는 진단이 아닙니다.','点数は診断ではありません。');
  page.append(box,hint);document.getElementById('app')?.append(page);paragraphs(box,d);
  const close=()=>page.remove();back.addEventListener('click',close,{once:true});
  page.scrollTop=0;back.focus();
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-dp127-open]');if(!button)return;
  event.preventDefault();event.stopPropagation();openOne(button.dataset.dp127Open);
 },true);
 root.DeepPetCompactUI127=Object.freeze({version:'10.127',summary,fitLines,visualLines,renderCompact});
 if(document.querySelector('#app .app-main'))setTimeout(()=>{try{renderCompact();}catch(e){console.error('Compact display',e);}},0);
})(window);
