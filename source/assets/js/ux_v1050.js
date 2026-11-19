/* DeepPet V10.50 — explain the *reason* for each score and a useful next step.
 * Interpretation is relative to this pet's observations. It is not a diagnosis.
 * Scores, missing dates, report classifications, pets and care logs are unchanged. */
(function(root){
 'use strict';
 const L=(zht,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:
   state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zht):zht;
 const good=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100;
 const round=n=>good(n)?Math.round(n):null;
 const mean=a=>{const v=a.filter(good);return v.length?v.reduce((s,x)=>s+x,0)/v.length:null;};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const metricNames={heart:L('心跳','heart rate','心拍','심박'),breath:L('呼吸','breathing','呼吸','호흡'),
   hrv:'HRV',stable:L('心搏節奏','heartbeat rhythm','心拍リズム','심박 리듬'),
   energy:L('精力','energy','活力','활력'),recovery:L('恢復','recovery','回復','회복'),
   calm:L('放鬆與平穩度','rest & steadiness','安静時の安定度','휴식 안정도'),
   cardio:L('心肺','heart & breathing','心肺','심폐'),
   sleep:L('睡眠休息','sleep & rest','睡眠・休息','수면·휴식'),
   activityRecovery:L('精力與恢復','energy & recovery','活力・回復','활력·회복')};
 const scope=days=>{
   const rows=days===1?(()=>{const date=typeof deepChosenDate==='function'?deepChosenDate():null;
     const r=demoRecords(state.dog).map((x,idx)=>({...x,idx})).find(x=>x.date===date);
     return r?[r]:[];})():dayRowsWithIndex(days);
   // Real collars save only verified dates. Calendar indices are not offsets
   // into that sparse array (and can differ after missed/invalid days).
   const byDate=new Map((root.DeepPetSignalScoring?.getDaily?.(state.dog)||[])
     .filter(x=>x?.date).map(x=>[x.date,x.scores]));
   const real=typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements();
   const features=real?new Map((root.DeepPetSignalScoring?.getFeatures?.(state.dog)||[])
     .filter(x=>x?.date).map(x=>[x.date,x])):null;
   return rows.filter(r=>validDaySample(r,r.idx)?.valid===true).map(r=>({
     row:!real?r:(()=>{const f=features.get(r.date);return {...r,heart:f?.heartRate??null,
       breath:f?.breathRate??null,rmssd:f?.rmssd??null,sdnn:f?.sdnn??null};})(),
     scores:byDate.get(r.date)||null
   })).filter(x=>x.scores);
 };
 const get=(samples,key)=>round(mean(samples.map(x=>x.scores?.[key])));
 const severity=n=>n===null?-1:n>=90?0:n>=80?1:n>=60?2:3;
 const lead=(n,what)=>{
   const title=what||L('這項表現','this area','この項目','이 항목');
   if(n===null)return L(`${title}目前沒有足夠記錄，暫不能評分。`,
     `There are not enough valid readings to score ${title}.`,
     `${title}の有効記録がまだ不足しています。`,`${title}의 유효 기록이 부족합니다.`);
   if(n>=90)return L(`${title}${n}分，與牠平常的狀態接近。`,
     `${title}: ${n}/100, close to this pet's usual pattern.`,
     `${title}は${n}点で、普段に近い状態です。`,`${title} ${n}점으로 평소와 비슷합니다.`);
   if(n>=80)return L(`${title}${n}分，與平常略有差異。`,
     `${title}: ${n}/100, slightly different from usual.`,
     `${title}は${n}点で、普段と少し違います。`,`${title} ${n}점으로 평소와 조금 다릅니다.`);
   if(n>=60)return L(`${title}${n}分，與平常差異較明顯。`,
     `${title}: ${n}/100, noticeably different from usual.`,
     `${title}は${n}点で、普段との差が目立ちます。`,`${title} ${n}점으로 평소와 차이가 큽니다.`);
   return L(`${title}${n}分，與平常有很大落差，屬持續觀察的優先項目。`,
     `${title}: ${n}/100, far from its usual pattern and a priority to check.`,
     `${title}は${n}点で、普段との差が大きく、優先的な確認が必要です。`,
     `${title} ${n}점으로 평소와 큰 차이가 있어 우선 확인이 필요합니다.`);
 };
 const reason={
   heart:L('同樣休息或活動情境下，心率與過去有效記錄偏離。','Heart rate differs from earlier readings in comparable rest or activity.','同じ安静・活動状況で、心拍が以前と異なります。','비슷한 휴식·활동에서 심박이 이전과 다릅니다.'),
   breath:L('相近狀態下的呼吸速度與牠的日常範圍不一致。','Breathing rate differs from its usual range in comparable conditions.','同じ状態で、呼吸数が普段の範囲と異なります。','비슷한 상태에서 호흡수가 평소 범위와 다릅니다.'),
   hrv:L('心跳間隔的短期變化（HRV）偏離自己的歷史基準；不是單純越高越好。','Beat-interval variability (HRV) differs from its own history; higher is not always better.','心拍間隔の変化（HRV）が自己基準から外れています。単純に高いほど良いわけではありません。','심박 간격 변화(HRV)가 평소 기준과 다릅니다. 높을수록 무조건 좋은 것은 아닙니다.'),
   stable:L('安靜時的心搏間隔節奏比平常不穩定；這不是心電圖診斷。','Quiet-time beat timing is less consistent with its usual rhythm; this is not an ECG diagnosis.','安静時の心拍間隔が普段より不規則です。心電図診断ではありません。','쉴 때 심박 간격이 평소보다 불규칙합니다. 심전도 진단은 아닙니다.'),
   energy:L('活動與休息的分配和平常不一樣，可能有活力不足或休息安排改變。','The mix of activity and rest differs from its usual routine, suggesting lower energy or a changed routine.','活動と休息の配分が普段と異なり、活力や生活リズムに変化が見られます。','활동과 휴식 패턴이 평소와 달라 활력이나 생활 리듬 변화가 보입니다.'),
   recovery:L('活動停止後兩分鐘，心率回落表現比牠以往相近活動弱；這是在看身體回復速度。','Over the two minutes after activity, heart-rate recovery was weaker than after similar previous activity.','運動後2分間の心拍の戻りが、同程度の以前の活動より弱い傾向です。','활동 후 2분 심박 회복이 비슷한 이전 활동보다 느립니다.'),
   calm:L('安靜休息時，心跳間隔與牠平常的節奏差距較大；不能從這項推斷開心或難過。','Quiet-time beat intervals differ from this pet’s baseline; this does not reveal happiness or sadness.','安静時の心拍間隔が普段と異なります。感情を判定するものではありません。','쉴 때 심박 간격이 평소와 다릅니다. 감정 판정은 아닙니다.')
 };
 const advice={
   heart:L('先在安靜時核對項圈讀數，避免剛運動完就比較。','Check collar readings at quiet rest; avoid comparing immediately after exercise.','安静時の測定を確認し、運動直後との比較を避けてください。','조용히 쉴 때 측정값을 확인하고 운동 직후와 비교하지 마세요.'),
   breath:L('觀察安靜時的呼吸是否持續偏快或費力，並記下異常時段。','Check whether breathing remains fast or labored at rest and note when it happens.','安静時の速い呼吸や呼吸のしづらさが続くか確認してください。','쉴 때 빠르거나 힘든 호흡이 계속되는지 확인하세요.'),
   hrv:L('固定在相似的安靜時段比較，並一起看睡眠和活動後恢復。','Compare similar quiet periods and review sleep and post-activity recovery together.','同じ安静時間帯で比較し、睡眠や運動後の回復も確認してください。','비슷한 휴식 시간대와 수면·운동 후 회복을 함께 살펴보세요.'),
   stable:L('先確認項圈貼合與訊號，再看接下來幾天是否持續偏離。','Check fit and signal, then see whether the change persists over several days.','装着状態と信号を確認し、数日続くか見てください。','착용 상태와 신호를 확인한 뒤 며칠간 지속되는지 살펴보세요.'),
   energy:L('維持規律散步和休息，留意牠是否比平常不願活動。','Keep a familiar balance of walks and rest; watch for reluctance to move.','普段の散歩と休息を保ち、活動を嫌がる様子がないか確認してください。','평소 산책과 휴식을 유지하고 활동을 꺼리는지 보세요.'),
   recovery:L('先降低過量活動，讓牠充分休息，再比較相近活動量後的兩分鐘恢復。','Avoid overexertion, allow recovery, then compare the two-minute result after similar effort.','無理な運動を避け休息を取り、同じ運動量で再確認してください。','과도한 운동을 피하고 충분히 쉰 뒤 비슷한 활동 후 회복을 비교하세요.'),
   calm:L('優先保持安靜的休息環境，再確認項圈貼合及安靜時的後續數據。','Provide a quiet rest environment, check fit, and compare later resting readings.','静かな休息環境と装着を確認し、次の安静時測定と比べてください。','조용한 휴식 환경과 착용 상태를 확인한 뒤 다음 기록과 비교하세요.')
 };
 function metricNote(key,n){
   const s=severity(n),name=metricNames[key];
   if(s<0)return lead(null,name);
   if(s===0)return lead(n,name)+L('目前維持原有生活節奏即可。',' Continue the usual routine.','今の生活リズムを続けましょう。','평소 생활 리듬을 유지하세요.');
   let text=lead(n,name)+reason[key];
   if(s>=2)text+=' '+advice[key];
   if(s===1)text+=' '+L('接下來一兩天再比較即可。','Compare again over the next day or two.','今後1〜2日も比較してください。','앞으로 하루이틀 더 비교하세요.');
   if(s===3)text+=' '+L('若連續偏低或精神變差，請盡快諮詢獸醫；若呼吸費力或站立不穩，應立即就醫。',
     'If scores stay low or energy worsens, contact a vet promptly; labored breathing or inability to stand needs emergency care.',
     '低下が続く、元気がない場合は早めに獣医師へ。呼吸困難や起立困難は直ちに受診してください。',
     '낮은 점수가 지속되거나 무기력하면 신속히 수의사와 상담하세요. 호흡 곤란이나 기립 장애가 있으면 즉시 진료받으세요.');
   return text;
 }
 const weakest=(samples,keys,count=2)=>keys.map(k=>({key:k,value:get(samples,k)})).filter(x=>x.value!==null)
   .sort((a,b)=>a.value-b.value).slice(0,count);
 const namesWithScores=items=>items.map(x=>`${metricNames[x.key]} ${x.value}/100`).join(L('、',', ','・',', '));
 function overallNote(samples,kind,days){
   const key=kind===0?'cardio':'activityRecovery',items=weakest(samples,kind===0?['heart','breath','hrv','stable']:['energy','recovery','calm']);
   const n=get(samples,key),s=severity(n);if(s<0)return lead(null,metricNames[key]);
   const period=days===1?L('今天','Today','今日','오늘'):L(`近${days}天`,`Over ${days} days`,`直近${days}日`,`최근 ${days}일`);
   if(s===0)return L(`${period}${metricNames[key]}${n}分；這段期間的記錄和自己的基準接近，繼續保持即可。`,
     `${period}, ${metricNames[key]} averaged ${n}/100 and stayed close to the usual pattern.`,
     `${period}の${metricNames[key]}は${n}点。普段に近い状態です。`,
     `${period} ${metricNames[key]} ${n}점으로 평소와 비슷합니다.`);
   const factors=items.length?namesWithScores(items):L('幾項指標','several measures','複数の指標','여러 지표');
   const base=L(`${period}${metricNames[key]}${n}分，主要受${factors}拉低。`,
     `${period}, ${metricNames[key]} was ${n}/100, mainly lowered by ${factors}.`,
     `${period}の${metricNames[key]}は${n}点。主に${factors}が低めです。`,
     `${period} ${metricNames[key]} ${n}점으로 주로 ${factors} 점수가 낮습니다.`);
   return base+(s===1?L('建議持續對照牠平常的節奏。',' Keep comparing with its normal routine.','普段の状態と引き続き比較してください。','평소와 계속 비교하세요.'):
     L('先處理得分最低的項目，讓休息、活動與量測情境一致。',' Start with the lowest-scoring area and compare under similar rest/activity conditions.','最も低い項目から確認し、同じ休息・活動条件で比べてください。','가장 낮은 항목부터 확인하고 비슷한 휴식·활동 조건에서 비교하세요.'))+
     (s===3?L('連續多日偏低或出現明顯不適時，建議儘快向獸醫求助。',' If this persists or the pet seems unwell, consult a vet promptly.','続く場合や明らかな異変があれば早めに受診してください。','계속 낮거나 이상이 있으면 신속히 수의사에게 상담하세요.'):'');
 }
 function sleepNote(samples,days){
   const n=get(samples,'sleep'),s=severity(n);
   if(s<0)return lead(null,metricNames.sleep);
   const nights=samples.map(x=>dpNightSleepStats(x.row.idx)).filter(Boolean);
   const duration=mean(nights.map(x=>x.minutes)),wakes=mean(nights.map(x=>x.wakes));
   const nightsText=duration===null?'':L(`安靜休息平均約 ${dpMinutesText(Math.round(duration))}、夜間中斷約 ${(wakes??0).toFixed(1)} 次。`,
     `Average quiet rest was ${Math.round(duration/60*10)/10}h with about ${(wakes??0).toFixed(1)} interruptions per night.`,
     `安静休息は平均約${Math.round(duration/60*10)/10}時間、夜間中断は約${(wakes??0).toFixed(1)}回です。`,
     `조용한 휴식은 평균 ${Math.round(duration/60*10)/10}시간, 밤중 중단은 약 ${(wakes??0).toFixed(1)}회입니다.`);
   const count=samples.filter(x=>good(x.scores?.sleep)&&x.scores.sleep<60).length;
   const context=days===1?L(`今天睡眠休息${n}分。`,`Sleep and rest today: ${n}/100.`,
     `今日の睡眠・休息は${n}点です。`,`오늘 수면·휴식은 ${n}점입니다.`):
     L(`近${days}天平均${n}分，${count}個有效日低於60分。`,
       `Over ${days} days, the average was ${n}/100, with ${count} valid days below 60.`,
       `直近${days}日の平均は${n}点で、60点未満が${count}日です。`,
       `최근 ${days}일 평균 ${n}점이고 60점 미만이 ${count}일입니다.`);
   if(s===0)return context+L('休息連續性和日常節奏大致正常；保持規律作息即可。',
     ' Rest continuity and routine are close to usual; keep regular rest.',
     '休息の連続性は普段に近く、規則的な生活を続けましょう。',
     '휴식 패턴이 평소와 비슷하니 규칙적인 생활을 유지하세요.');
   const pattern=s===1?L('休息節奏有少量偏離。',' Rest routine differs slightly from usual.','休息パターンに小さな変化があります。','휴식 패턴에 약간 변화가 있습니다.'):
     s===2?L('休息連續性或每日節奏與平常偏離較大。',' Rest continuity or daily timing differs noticeably from usual.','休息の連続性や時間帯が普段と異なります。','휴식의 연속성이나 시간이 평소와 다릅니다.'):
     L('這是明顯低分，代表休息模式與個體基準差距很大；即使前後變化不大，仍是持續偏低，不代表正常。',
       ' This is a very low score: rest differs greatly from its own baseline. Even if the trend is flat, persistent low scores are not normal.',
       '明らかな低得点です。前後で変化が少なくても、継続する低得点は正常を意味しません。',
       '매우 낮은 점수입니다. 앞뒤 변화가 작더라도 지속적인 저점수는 정상이라는 뜻이 아닙니다.');
   const action=s===1?L('下一晚留意是否恢復平常。',' Check whether the next night returns to normal.','次の夜も確認してください。','다음 밤도 확인하세요.'):
     L('先保持安靜睡眠環境、固定作息並確認項圈貼合。',' Start with a quiet rest area, consistent routine and proper collar fit.',
       '静かな休息環境と規則的な生活、装着状態を確認してください。','조용한 환경과 규칙적인 생활, 목줄 착용 상태를 확인하세요.');
   return context+pattern+' '+nightsText+L('單看休息時長不能判斷品質。',' Rest duration alone does not establish sleep quality.',
     '時間だけでは睡眠の質を判定できません。','휴식 시간만으로 수면의 질을 알 수 없습니다.')+' '+action+
     (s===3?L('若持續多晚低分，或精神、食慾明顯改變，請盡快請獸醫評估。',
       ' If low scores persist or appetite or energy changes noticeably, seek veterinary advice promptly.',
       '数晩続く、または元気・食欲が変わった場合は早めに獣医師へ。',
       '며칠 지속되거나 식욕·활력이 달라지면 신속히 수의사에게 문의하세요.'):'');
 }
 function daySleepHeading(samples){
   const n=get(samples,'sleep');if(n===null)return lead(null,metricNames.sleep);
   const st=dpNightSleepStats(samples[0].row.idx),time=dpMinutesText(st.minutes);
   if(n>=90)return L(`今天${n}分，休息節奏接近平常。安靜休息約${time}，夜間中斷${st.wakes}次。`,
     `Today ${n}/100; rest was close to usual (${time}, ${st.wakes} interruptions).`,
     `今日${n}点。休息は普段に近い状態です。`,`오늘 ${n}점으로 휴식이 평소와 비슷합니다.`);
   if(n>=80)return L(`今天${n}分，休息節奏略有偏離。安靜休息約${time}，中斷${st.wakes}次；下一晚再觀察。`,
     `Today ${n}/100; rest differs slightly. Quiet rest: ${time}, ${st.wakes} interruptions.`,
     `今日${n}点。休息に少し変化があります。`,`오늘 ${n}점으로 휴식 패턴에 약간 차이가 있습니다.`);
   return L(`今天${n}分，${n<60?'休息模式與平常落差很大':'休息節奏與平常偏離明顯'}。安靜休息約${time}、夜間中斷${st.wakes}次；即使時間夠長，也不代表睡得安穩。`,
     `Today ${n}/100: rest differs ${n<60?'greatly':'noticeably'} from usual. Quiet rest: ${time}, ${st.wakes} interruptions; duration alone does not prove quality.`,
     `今日${n}点。休息が普段と異なります。時間だけでは睡眠の質は分かりません。`,
     `오늘 ${n}점으로 휴식이 평소와 다릅니다. 시간만으로 수면의 질을 알 수 없습니다.`);
 }
 function daySleepAction(samples){const n=get(samples,'sleep');
   if(n===null||n>=90)return '';
   if(n>=80)return L('保持規律作息，再觀察下一晚即可。',' Keep a regular routine and compare the next night.',
     '規則正しい生活を続け、次の夜も確認してください。','규칙적인 생활을 유지하고 다음 밤을 확인하세요.');
   return L('建議先維持安靜睡眠環境、固定作息並確認項圈貼合。若連續低分，或精神、食慾變差，請儘快諮詢獸醫。',
     'Keep rest quiet and regular and check collar fit. If scores remain low or appetite/energy worsens, contact a vet promptly.',
     '静かな休息環境と装着を確認し、低得点や不調が続けば獣医師へ。',
     '조용한 휴식과 착용 상태를 확인하고 낮은 점수나 이상이 지속되면 수의사에게 문의하세요.');
 }
 function replaceText(node,value){if(node)node.textContent=value;}
 function fixDeep(){
   if(state.tab!=='deep'||(state.detail&&state.detail!=='dp908-energy-calendar'))return;
   const days=Number(state.range),kind=Number(state.deepType);
   if(![1,7,30].includes(days)||![0,1,2].includes(kind))return;
   const samples=scope(days);if(!samples.length)return;
   if(kind===0){
     const card=document.querySelector('#app .dp903-heart');if(!card)return;
     replaceText(card.querySelector('.dp903-overview-copy>p'),overallNote(samples,0,days));
     for(const key of ['heart','breath','hrv','stable']){
       const target=card.querySelector(`[data-dp903-metric="${key}"] .dp903-metric-left>p`);
       replaceText(target,metricNote(key,get(samples,key)));
     }
   }
   if(kind===1){
     if(days===1){
       const card=document.querySelector('#app .dp-owner-sleep'),head=card?.querySelector('.dp1048-sleep-day-head');
       const left=head?.firstElementChild;
       if(left){
         // The hidden generic verdict used to leave a tall, blank left column.
         // Put the pet's actual sleep reason and next step directly below the title.
         left.querySelectorAll('.dp1050-sleep-day-priority').forEach(el=>el.remove());
         const p=document.createElement('p');p.className='dp1050-sleep-day-priority';p.textContent=daySleepHeading(samples);left.append(p);
       }
       // Don't repeat a disconnected boilerplate paragraph below that heading.
       const old=card?.querySelector('.dp-owner-status-inner > p:not(.dp-owner-sleep-difference)');
       if(old)old.textContent=daySleepAction(samples);
     }else{
       const card=document.querySelector('#app .dp905-sleep-summary');
       replaceText(card?.querySelector('.dp905-sleep-head>div:first-child>p:not(.dp1048-sleep-conclusion)'),
         L('期間重點','Period summary','期間のポイント','기간 요약'));
       replaceText(card?.querySelector('.dp1048-sleep-conclusion'),sleepNote(samples,days));
     }
   }
   if(kind===2){
     const card=document.querySelector('#app .dp901-health-score');if(!card)return;
     const all=card.querySelectorAll('.dp901-metric-card');
     ['energy','recovery','calm'].forEach((key,i)=>replaceText(all[i]?.querySelector('.dp901-metric-desc'),metricNote(key,get(samples,key))));
     if(days===1)replaceText(card.querySelector('.dp901-overall-desc'),overallNote(samples,2,days));
     else{
       replaceText(card.querySelector('.dp901-period-notes>b'),L('期間重點','Period summary','期間のポイント','기간 요약'));
       replaceText(card.querySelector('.dp901-period-notes>p'),overallNote(samples,2,days));
     }
   }
 }
 function labReasons(score,items){
   if(score===null)return L('這份報告目前缺少可核對的適用參考區間，暫時不能判讀。',
     'This report lacks enough applicable references to assign a score.',
     '適用できる基準値が不足し、判定できません。','적용 가능한 참고 범위가 부족해 점수를 매길 수 없습니다.');
   const sorted=items.filter(x=>good(x.score)).sort((a,b)=>a.score-b.score);
   const low=sorted.filter(x=>x.score<80),veryLow=sorted.filter(x=>x.score<60);
   if(score>=90)return L(`這份體檢${score}分，已評估項目大致位於適用參考區間內；保持原有追蹤即可。`,
     `This exam scored ${score}/100. Assessed values are generally within applicable reference intervals.`,
     `この検査は${score}点。評価可能項目は概ね基準範囲内です。`,`검진 ${score}점으로 평가 항목이 대체로 참고 범위 안에 있습니다.`);
   const priority=sorted.slice(0,Math.min(score<60?3:score<80?2:1,low.length||1));
   const name=x=>{const info=typeof labI18n==='function'?labI18n(x.name):null;
     return info?.known?`${state.lang==='en'?info.en:state.lang==='ja'?info.ja:state.lang==='ko'?info.ko:info.zh}（${info.code}）`:x.name;};
   const names=priority.map(x=>`${name(x)} ${Math.round(x.score)}/100`).join(L('、',', ','・',', '));
   const intro=L(`體檢${score}分，主要由${names}等指標拉低；其中${veryLow.length}項明顯偏離、${low.length}項低於80分。`,
     `Exam: ${score}/100. The largest contributors were ${names}; ${veryLow.length} items scored below 60 and ${low.length} below 80.`,
     `検査は${score}点。主に${names}が低く、60点未満は${veryLow.length}項目です。`,
     `검진 ${score}점으로 ${names} 등이 주요 원인이며 60점 미만 항목은 ${veryLow.length}개입니다.`);
   const next=score<60?L('優先帶原始檢驗報告給獸醫，核對檢測值、單位、適用年齡／體重的參考區間與必要的複查項目；不能只憑總分自行用藥。',
     ' Take the original report to a vet promptly to review values, units, age/weight-specific ranges and any repeat tests; do not medicate based on this score.',
     '原本の検査票を獣医師に見せ、数値・単位・適用範囲と再検査を確認してください。自己判断で投薬しないでください。',
     '원본 검사표를 수의사에게 보여 주고 수치·단위·적용 범위와 재검사를 확인하세요. 점수만 보고 투약하지 마세요.'):
     L('對照原始報告與獸醫建議，優先追蹤低分項目，不必自行改動所有飲食或用藥。',
       ' Compare the original report and veterinary advice; follow up the lowest results first.',
       '原本の検査票と獣医師の助言を照合し、低得点項目から経過確認してください。',
       '원본 검사표와 수의사 소견을 보고 낮은 항목부터 추적하세요.');
   return intro+' '+next;
 }
 function addExamExplanation(){
   if(state.tab!=='health'||!['dp921-list','dp921-report','reports'].includes(state.detail))return;
   const all=typeof root.dp914ReportRecords==='function'?root.dp914ReportRecords(state.dog):[];
   const groups=new Map();
   for(const row of all){const key=`${row.reportId||'legacy:'+row.date}::${row.date}`;
     if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}
   // profile() belongs to ux_v921's private closure; using it here throws
   // ReferenceError whenever the owner opens a report list or detail page.
   // Use the public selected-pet accessor shared by the other Health screens.
   const pet={...currentDog(),petId:String(state.dog)};
   const evidence=root.DeepPetLabEvidence;
   if(!evidence?.assess)return;
   const evaluated=[...groups.entries()].map(([key,rows])=>({key,rows,result:evidence.assess(rows,pet,iso(localDate()))}));
   const page=document.querySelector('#app .dp921-page');if(!page)return;
   if(state.detail==='dp921-report'){
     const title=page.querySelector('.dp921-details-head'),score=title?.querySelector('.dp921-score');
     const n=score?Number.parseInt(score.textContent,10):NaN;
     const date=title?.textContent.match(/\d{4}-\d{2}-\d{2}/)?.[0];
     const reportKey=page.querySelector('[data-dp921="edit-report"]')?.dataset.id;
     const found=evaluated.find(x=>x.key===reportKey)||evaluated.find(x=>x.result.latest===date&&Math.round(x.result.score)===n);
     if(found){const p=document.createElement('p');p.className='dp1050-exam-reason';
       p.textContent=labReasons(round(found.result.score),found.result.records);
       title.insertAdjacentElement('afterend',p);}
   }else{
     for(const entry of page.querySelectorAll('.dp921-report-entry')){
       const found=evaluated.find(x=>x.key===entry.dataset.id);
       if(!found||!good(found.result.score)||found.result.score>=90)continue;
       const cell=entry.querySelector('.dp921-report-copy');if(!cell)continue;
       const p=document.createElement('small');p.className='dp1050-exam-list-reason';
       const sorted=found.result.records.filter(x=>good(x.score)).sort((a,b)=>a.score-b.score);
       p.textContent=L(`較低項目：${sorted.slice(0,2).map(x=>typeof labI18n==='function'&&labI18n(x.name).known?`${labI18n(x.name).zh}（${labI18n(x.name).code}）`:x.name).join('、')}；點開查看原因與建議。`,
         `Lowest: ${sorted.slice(0,2).map(x=>x.name).join(', ')}. Open for next steps.`,
         `低得点項目：${sorted.slice(0,2).map(x=>x.name).join('・')}。`,
         `낮은 항목: ${sorted.slice(0,2).map(x=>x.name).join(', ')}.`);
       cell.append(p);
     }
   }
 }
 function addRecapReasons(){
   if(state.tab!=='health'||state.detail!=='summary')return;
   const panels=document.querySelectorAll('#app .dp850-score-panel');if(panels.length<2)return;
   panels.forEach((panel,idx)=>{
     const parts=[...panel.querySelectorAll('.dp850-part')].map(el=>({name:el.querySelector('span')?.textContent?.trim(),
       score:Number.parseInt(el.querySelector('b')?.textContent,10)})).filter(x=>good(x.score)).sort((a,b)=>a.score-b.score);
     const samples=scope(state.healthSummaryDays===30?30:7),summary=get(samples,idx===0?'physiol':'rhythm');
     if(summary===null||!parts.length)return;
     const bad=parts.filter(x=>x.score<90).slice(0,2),s=severity(summary);
     const culprits=(bad.length?bad:[parts[0]]).map(x=>`${x.name} ${x.score}/100`).join(L('、',', ','・', ', '));
     const intro=s===0?L('整體接近平常；維持目前的休息和活動節奏。',
       'Close to usual. Keep the current rest and activity routine.',
       '全体として普段に近い状態です。','전반적으로 평소와 비슷합니다.'):
       L(`平均${summary}分，主要需要留意${culprits}。`,
         `Average ${summary}/100; focus first on ${culprits}.`,
         `平均${summary}点。主に${culprits}を確認してください。`,
         `평균 ${summary}점으로 ${culprits}부터 살펴보세요.`);
     const guidance=idx===0?L('先按得分最低的方向調整：睡眠低就保持安靜與規律休息；精力低就避免過度活動；心肺低就複核安靜時的心率與呼吸。',
       'For poor sleep, keep rest quiet and consistent; for low energy, avoid overexertion; for low cardio, recheck quiet-time heart rate and breathing.',
       '睡眠が低ければ休息環境、活力が低ければ運動量、心肺が低ければ安静時の心拍・呼吸を確認してください。',
       '수면이 낮으면 휴식 환경, 활력이 낮으면 무리한 운동, 심폐가 낮으면 안정 시 심박과 호흡을 확인하세요.'):
       L('在相似的安靜時段觀察心跳節奏，先確認項圈貼合；單一分數不代表情緒。',
         'Compare quiet-time heartbeat patterns under similar conditions and check fit; a score is not an emotion reading.',
         '同じ安静時間帯の心拍と装着を確認してください。感情の判定ではありません。',
         '비슷한 휴식 시간대의 심박과 착용 상태를 확인하세요. 감정 점수는 아닙니다.');
     const follow=s===3?L('若多日持續低分或出現明顯不適，請安排獸醫評估。',
       ' If scores stay low or the pet seems unwell, arrange a vet review.',
       '低得点が続く、または異変があれば受診してください。',
       '낮은 점수가 지속되거나 이상이 있으면 수의사와 상담하세요.'):' ';
     const p=document.createElement('p');p.className='dp1050-recap-reason';
     p.textContent=intro+(s===0?'':' '+guidance+' '+follow);
     panel.append(p);
   });
 }
 const previousRender=render;
 render=function(reset=false){previousRender(reset);fixDeep();addExamExplanation();addRecapReasons();
   document.querySelectorAll('.app-build-version').forEach(el=>el.textContent='DeepPet Version '+(root.DeepPetBuildVersion||'10.50'));
 };
 root.DeepPetUX1050={version:'10.50',metricNote,sleepNote,overallNote,labReasons,scope};
})(window);
