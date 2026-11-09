/* DeepPet V8.73: first-screen information architecture and navigation repairs.
   This layer retains the complete V8.72 project, chart handlers and pet-owned records. */
(function(){
'use strict';
const L=(zht,zh,en,ko,ja)=>({zht,zh,en,ko,ja})[state.lang]||en;
const fragment=html=>{const t=document.createElement('template');t.innerHTML=html;return t.content;};
const html=root=>{const d=document.createElement('div');d.append(root);return d.innerHTML;};
const escT=value=>esc(String(value??''));
const mean=a=>a.length?a.reduce((v,x)=>v+Number(x||0),0)/a.length:0;
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v).toFixed(d):'—';
function dateRows(days){return days===1?deepDateRows().filter(r=>r.date===deepChosenDate()):dayRowsWithIndex(days).filter(r=>validDaySample(r,r.idx).valid);}
function attention(score){return score>=90?L('表現很好','表现很好','is doing very well','매우 안정적','非常に良好'):score>=80?L('整體平穩','整体平稳','looks broadly steady','전반적으로 안정적','概ね安定'):score>=60?L('出現一些起伏','出现一些起伏','shows some variation','다소 변동이 있음','やや変動'):L('有較明顯的變化','有较明显的变化','has more pronounced variation','변동이 큼','変化が大きい');}
const storyPara=(content)=>`<p class="dp73-summary-line">${escT(content)}</p>`;
function daySummary(kind,row){
 const sc=dpOwnerDayScores(row,kind===2),rh=Number(row.heart),rr=Number(row.breath);
 if(kind===0){const score=sc.heart;
  return [
   L(`今天心肺${attention(score)}。心跳約 ${num(rh)} bpm、呼吸約 ${num(rr,1)} 次／分，安靜時的變化可與個體平常趨勢一起觀察。`,`今天心肺${attention(score)}。心跳约 ${num(rh)} bpm、呼吸约 ${num(rr,1)} 次／分，可对照它平常安静时的变化。`,`Cardiorespiratory status ${attention(score)} today. Heart rate is around ${num(rh)} bpm and breathing around ${num(rr,1)}/min.`,`오늘 심박 ${num(rh)}bpm, 호흡 ${num(rr,1)}회/분이며 심폐 상태가 ${attention(score)}.`,`心拍は約${num(rh)}bpm、呼吸は約${num(rr,1)}回/分です。心肺の状態は${attention(score)}。`),
   score>=80?L('目前沒有明顯的持續偏離；建議繼續留意休息時是否平順，以及活動後能否回到平常節奏。','目前没有明显的持续偏离；继续留意休息时是否平顺，以及活动后恢复情况。','No major sustained shift is apparent. Watch calm-time patterns and the return to baseline after activity.','뚜렷한 지속 변화는 적으며 휴식·활동 후 회복 흐름을 살펴보세요.','大きな持続的変化は目立ちません。安静時と活動後の回復を確認しましょう。'):L('部分時段與平常節奏有差異；可先檢查是否剛活動、緊張或環境炎熱，再觀察是否連續出現。','部分时段与平常节奏不同；先排除运动、紧张和炎热，再关注是否持续。','Some intervals differ from the usual pattern. Check activity, stress and heat before reviewing persistent changes.','활동·긴장·더위의 영향부터 확인하고 변화가 계속되는지 살펴보세요.','活動・緊張・暑さの影響を確認し、変化が続くか観察してください。')
  ];
 }
 if(kind===1){const st=dpNightSleepStats(row.idx),s=sc.sleep;
  return [
   L(`這晚睡眠與休息${attention(s)}，安靜休息約 ${dpMinutesText(st.minutes)}，夜間活動中斷 ${st.wakes} 次。`,`这晚睡眠与休息${attention(s)}，安静休息约 ${dpMinutesText(st.minutes)}，夜间活动中断 ${st.wakes} 次。`,`Rest ${attention(s)}. Estimated quiet rest was ${dpMinutesText(st.minutes)}, with ${st.wakes} overnight interruptions.`,`야간 휴식은 ${dpMinutesText(st.minutes)}, 중단 ${st.wakes}회로 ${attention(s)}.`,`静かな休息は${dpMinutesText(st.minutes)}、中断${st.wakes}回で、${attention(s)}。`),
   s>=80?L('夜間休息的連續性整體不錯；可結合醒來後的精神與白天活動，了解是否真正休息充足。','夜间休息连续性整体不错；结合醒来后的精神与白天活动来理解。','Rest appears relatively continuous. Compare with next-day energy and activity for fuller context.','휴식 연속성은 비교적 양호하며 다음 날 활력도 함께 살펴보세요.','比較的連続した休息です。翌日の元気や活動量も確認しましょう。'):L('夜間有較多起伏，建議留意環境、睡前活動與後續幾晚的變化；安靜不直接等同深睡。','夜间变化较多，留意环境、睡前活动与之后几晚；安静不等于深睡。','Rest was more interrupted. Review the environment, evening activity and upcoming nights; stillness does not prove deep sleep.','중단이 있어 환경과 잠들기 전 활동, 다음 며칠을 살펴보세요.','中断が多めです。環境や就寝前の活動、今後数晩の傾向を確認しましょう。')
  ];
 }
 const rec=dpOwnerRecoveryComparison(row),drop=rec?.average;
 return [
  L(`今天精力${attention(sc.energy)}，活動表現${attention(sc.activity)}。${Number.isFinite(drop)?`活動後兩分鐘心率下降約 ${num(drop)} bpm。`:'目前沒有足夠的有效兩分鐘恢復資料。'}`,`今天精力${attention(sc.energy)}，活动表现${attention(sc.activity)}。${Number.isFinite(drop)?`运动后两分钟心率下降约 ${num(drop)} bpm。`:'两分钟恢复记录暂不足。'}`,`Energy ${attention(sc.energy)} and activity ${attention(sc.activity)}. ${Number.isFinite(drop)?`Heart rate fell about ${num(drop)} bpm over two minutes after activity.`:'There are too few valid recovery readings.'}`,`오늘 활력은 ${attention(sc.energy)}이며 ${Number.isFinite(drop)?`활동 후 2분간 심박 약 ${num(drop)}bpm 감소했습니다.`:'회복 기록이 아직 부족합니다.'}`,`元気は${attention(sc.energy)}。${Number.isFinite(drop)?`活動後2分間の心拍低下は約${num(drop)}bpmです。`:'回復データが不足しています。'}`),
  sc.energyActivity>=80?L('活動與休息的銜接大致平順，保持規律散步與充足休息，並持續比較活動後的回落趨勢。','活动与休息衔接平顺，保持规律活动和充分休息，持续比较恢复趋势。','Activity and rest balance looks steady; follow the post-activity recovery trend over time.','활동과 휴식 균형이 비교적 안정적이며 회복 추세를 이어서 살펴보세요.','活動と休息のバランスは概ね安定しています。回復の傾向を継続して確認しましょう。'):L('今天的精力或活動有些波動；留意活動強度是否過高、休息是否充足，以及兩分鐘恢復是否持續偏慢。','今天精力或活动有波动；留意活动强度、休息和两分钟恢复是否持续偏慢。','Energy or activity varied; review exertion, rest and whether two-minute recovery remains slower than usual.','활동 강도와 휴식, 2분 회복이 계속 느린지 확인하세요.','元気や活動に変動があります。運動強度、休息、2分間の回復を見守りましょう。')
 ];
}
function periodSummary(kind,rows,days){
 const S=rows.map(row=>dpOwnerDayScores(row,kind===2));
 if(kind===0){const score=Math.round(mean(rows.map(row=>dpHeartComposite(row))));return [
  L(`最近 ${days} 天心肺${attention(score)}。心跳走勢約 ${num(mean(rows.map(r=>r.heart)))} bpm，呼吸走勢約 ${num(mean(rows.map(r=>r.breath)),1)} 次／分。`,`最近 ${days} 天心肺${attention(score)}。心跳约 ${num(mean(rows.map(r=>r.heart)))} bpm，呼吸约 ${num(mean(rows.map(r=>r.breath)),1)} 次／分。`,`Over ${days} days, cardiorespiratory status ${attention(score)}; heart rate averaged ${num(mean(rows.map(r=>r.heart)))} bpm and breathing ${num(mean(rows.map(r=>r.breath)),1)}/min.`,`최근 ${days}일 심박 약 ${num(mean(rows.map(r=>r.heart)))}bpm, 호흡 약 ${num(mean(rows.map(r=>r.breath)),1)}회/분으로 ${attention(score)}.`,`過去${days}日間は心拍約${num(mean(rows.map(r=>r.heart)))}bpm、呼吸約${num(mean(rows.map(r=>r.breath)),1)}回/分で、${attention(score)}。`),
  score>=80?L('多數記錄呈現相近的休息節奏；可重點看心率、呼吸曲線是否有長時間偏離，而非只看單次高低點。','多数记录呈现接近的休息节奏；重点看心率、呼吸曲线是否长期偏离。','Most records show a similar resting rhythm. Look for sustained shifts rather than isolated peaks.','대부분 비슷한 휴식 리듬이며 일시적인 피크보다 지속 변화가 중요한 관찰점입니다.','安静時のリズムは概ね似ています。単発の変化より継続的なずれを確認しましょう。'):L('這段時間心率或呼吸起伏較多；建議對照運動、環境溫度和安靜狀態，再觀察接下來的走勢。','这段时间心率或呼吸变化较多；结合运动、温度与安静状态继续观察。','Heart rate or breathing varied more. Compare with activity, temperature and rest before interpreting the trend.','심박·호흡 변화가 있어 운동, 온도, 휴식과 함께 추세를 보세요.','変動がやや大きいため、活動・気温・休息と合わせて確認してください。')
 ];}
 if(kind===1){const nights=rows.map(r=>dpNightSleepStats(r.idx)),minutes=Math.round(mean(nights.map(n=>n.minutes))),wakes=mean(nights.map(n=>n.wakes)),score=Math.round(mean(S.map(s=>s.sleep)));return [
  L(`最近 ${days} 天的睡眠與休息${attention(score)}。每晚安靜休息約 ${dpMinutesText(minutes)}，夜間平均中斷 ${num(wakes,1)} 次。`,`最近 ${days} 天睡眠与休息${attention(score)}。每晚安静休息约 ${dpMinutesText(minutes)}，夜间平均中断 ${num(wakes,1)} 次。`,`Over ${days} days, rest ${attention(score)}. Nightly quiet rest averaged ${dpMinutesText(minutes)}, with ${num(wakes,1)} interruptions.`,`최근 ${days}일 수면·휴식은 ${attention(score)}이며 밤 평균 휴식 ${dpMinutesText(minutes)}, 중단 ${num(wakes,1)}회입니다.`,`過去${days}日間の夜間休息は約${dpMinutesText(minutes)}、中断は平均${num(wakes,1)}回で、${attention(score)}。`),
  score>=80?L('休息時長與連續性大致維持平常水準。可觀察哪幾晚中斷較多，並對照白天活動與醒來後的精神。','休息时长和连续性大致维持平常；结合白天活动与醒来精神观察。','Duration and continuity are broadly consistent. Check which nights had more interruptions and the following day’s energy.','휴식의 길이와 연속성이 대체로 일정하며 중단이 많았던 날과 다음 날 활력을 함께 보세요.','休息時間と連続性は概ね一定です。中断が多い夜と翌日の元気を比べましょう。'):L('部分夜晚休息較分散或中斷增加。可先檢查溫度、噪音、睡前活動與作息是否改變，再看後續趨勢。','部分夜晚休息分散或中断增多；先检查温度、噪音、睡前运动和作息。','Some nights were more fragmented. Review temperature, noise and evening routines before judging the ongoing trend.','일부 밤에 휴식 중단이 많으니 온도·소음·저녁 활동을 함께 확인하세요.','休息が分断される夜があります。気温・騒音・就寝前の活動を確認しましょう。')
 ];}
 const energy=mean(S.map(x=>x.energy)),activity=mean(S.map(x=>x.activity)),recRows=rows.map(r=>dpOwnerRecoveryComparison(r)?.average).filter(Number.isFinite),drops=recRows.length?num(mean(recRows)):null,score=mean(S.map(x=>x.energyActivity));return [
  L(`最近 ${days} 天精力${attention(energy)}，活動${attention(activity)}。${drops!==null?`有效活動後的兩分鐘心率平均回落約 ${drops} bpm。`:'目前可比較的兩分鐘恢復記錄不足。'}`,`最近 ${days} 天精力${attention(energy)}，活动${attention(activity)}。${drops!==null?`两分钟心率回落约 ${drops} bpm。`:'两分钟恢复记录暂不足。'}`,`Across ${days} days, energy ${attention(energy)} and activity ${attention(activity)}. ${drops!==null?`The two-minute post-activity drop averaged about ${drops} bpm.`:'Not enough comparable recovery readings.'}`,`최근 ${days}일 활력 ${attention(energy)}, 활동 ${attention(activity)}. ${drops!==null?`활동 후 2분 심박 감소 약 ${drops}bpm.`:'회복 데이터가 부족합니다.'}`,`過去${days}日間の元気は${attention(energy)}。${drops!==null?`活動後2分間の心拍低下は約${drops}bpmです。`:'回復データがまだ不足しています。'}`),
  score>=80?L('精力與活動後回穩表現整體協調；可繼續比較每天運動強度與休息的平衡，不需要只追求更高活動量。','精力和活动后恢复整体协调；关注活动与休息的平衡，不必只追求更高活动量。','Energy, rest and recovery are broadly balanced. Compare exertion and recovery; more activity is not always better.','활동량만 늘리기보다는 활동과 휴식의 균형, 회복 추세를 유지하세요.','活動量だけを増やさず、休息と回復のバランスを確認しましょう。'):L('部分日子的精力或恢復有較大變動，建議觀察運動後兩分鐘回落是否持續偏慢，以及隔日是否較疲累。','部分日子精力或恢复波动较大；留意运动后恢复和次日疲劳。','Energy or recovery fluctuated on some days. Watch two-minute recovery and next-day fatigue trends.','일부 날짜의 회복이 흔들려 운동 후 심박 감소와 다음 날 피로를 확인하세요.','元気や回復に変動があります。2分間の回復と翌日の疲れを確認しましょう。')
 ];
}
function replaceNarrative(root,container,lines){
 if(!container)return;
 container.querySelectorAll(':scope > .dp73-narrative').forEach(x=>x.remove());
 const div=document.createElement('div');div.className='dp73-narrative';div.innerHTML=lines.map(storyPara).join('');
 container.append(div);return div;
}
function amendDeep(root){const days=state.range,kind=Number(state.deepType),rows=dateRows(days),row=days===1?rows[0]:null;
 if(!rows.length)return;
 const lines=days===1?daySummary(kind,row):periodSummary(kind,rows,days);
 if(kind===0&&days>1){const card=root.querySelector('.dp68-period-heart');if(card){const header=card.querySelector('.dp68-period-overall');const sub=header?.querySelector('div > p');if(sub)sub.textContent=dpOwnerStatus(Math.round(mean(rows.map(r=>dpHeartComposite(r)))));const info=replaceNarrative(root,card,lines);header?.after(info);const redundant=card.querySelector('.dp68-period-avg');if(redundant)redundant.remove();}}
 else{const card=root.querySelector(days===1?'.dp-owner-status-card':'.dp-owner-period-card');if(card){const inner=card.querySelector('.dp-owner-status-inner')||card;const header=inner.querySelector('.dp-owner-status-heading,.dp-heart-period-overall,.dp-sleep-period-score-head');const mainLine=inner.querySelector(':scope > p:not([class])');if(mainLine)mainLine.remove();
 const info=replaceNarrative(root,inner,lines);header?.after(info);
 if(days>1){inner.querySelectorAll('.dp-owner-subsummary').forEach(p=>{if(/平均分|平均值|Mean over|Average of daily|기간 평균|period average|최근\d+일 평균/.test(p.textContent))p.remove();});const headline=header?.querySelector('p');if(headline&&/\d+\.?\d*\s*\/100|平均分|Average of daily/.test(headline.textContent))headline.textContent=dpOwnerStatus(Math.round(mean(rows.map(r=>dpOwnerDayScores(r,kind===2)[kind===1?'sleep':'energyActivity']))));}
 }}
 // The two data-driven paragraphs supersede old status footnotes (notably 'X of N days' and 'metrics listed below'). Preserve sleep's useful overnight comparison.
 if(kind!==1||days>1){root.querySelectorAll('.dp68-period-heart > .dp69-cause,.dp-owner-status-inner > .dp69-cause,.dp-owner-period-card > .dp69-cause').forEach(note=>note.remove());}
 // Replace leftover generic filler under each score tile with an actual interpretation.
 const subs=[...root.querySelectorAll('.dp-energy-score-panel,.dp-activity-score-panel,.dp-recovery-score-panel,.dp-energy-period-panel')];
 subs.forEach((panel,i)=>{const k=panel.classList.contains('dp-energy-score-panel')?'energy':panel.classList.contains('dp-activity-score-panel')?'activity':panel.classList.contains('dp-recovery-score-panel')?'recovery':['energy','activity','recovery'][i%3];const scores=rows.map(r=>dpOwnerDayScores(r,true));const ss=k==='recovery'?scores.map(x=>x.recovery).filter(Number.isFinite):scores.map(x=>x[k]).filter(Number.isFinite);const v=Math.round(mean(ss));const phrase=k==='energy'?v>=80?L('精力維持平常節奏，活動與休息之間的轉換大致自然。','精力维持平常节奏，活动与休息的切换自然。','Energy is broadly consistent with the usual rhythm.','활력이 대체로 평소 수준입니다.','元気は概ね普段どおりです。'):L('精力起伏較多，請結合休息、食慾與隔日活動一起觀察。','精力起伏较多，结合休息、食欲与次日活动观察。','Energy has varied; compare rest and next-day activity.','활력 변화가 있어 휴식·식욕도 확인하세요.','元気の変動があり、休息や食欲も確認しましょう。'):k==='activity'?v>=80?L('活動強度與平常接近，建議保持規律而不過量。','活动强度接近平常，保持规律但不过量。','Movement resembles the usual pattern; avoid overexertion.','평소 활동 패턴과 비슷합니다.','活動強度は概ね普段どおりです。'):L('活動量或強度和平常不同，留意是否因天氣、作息或不適造成。','活动量与平常不同，关注天气、作息和不适因素。','Activity differs from usual; review routine and conditions.','활동량 변화의 원인을 살펴보세요.','活動量が普段と異なります。'):v>=80?L('兩分鐘內心率回落表現平順，持續觀察不同活動強度下的變化。','两分钟内心率回落平顺，关注不同活动强度下的变化。','Two-minute heart-rate recovery appears steady for the recorded activities.','2분 회복 양상이 비교적 안정적입니다.','2分間の心拍回復は概ね安定しています。'):L('活動後的回落較平常有差異，先比較活動強度與休息條件。','活动后的心率回落与平常不同，结合活动强度和休息条件比较。','Recovery differs from the usual pattern; compare similar activity levels.','회복 상태가 달라 비슷한 운동 조건에서 비교하세요.','回復に変化があり、同じ運動条件で比較してください。');
  const target=panel.querySelector('.dp69-cause,.dp-owner-subsummary,.dp71-energy-explain p');if(target){target.textContent=phrase;target.classList.add('dp73-metric-summary')}else{const p=document.createElement('p');p.className='dp73-metric-summary';p.textContent=phrase;panel.querySelector('.dp-vital-heading')?.after(p);}const headCopy=panel.querySelector('.dp-vital-heading > div:first-child');const primary=panel.querySelector(':scope > .dp73-metric-summary');if(primary&&headCopy){headCopy.append(primary);headCopy.classList.add('dp73-metric-head-copy');}
 });
 // A ring already shows the average score. The trend caption should explain movement, not repeat that score.
 root.querySelectorAll('.dp68-rhythm-chart').forEach((card,index)=>{
  const label=index===0?L('放鬆與平穩度','放松与平稳度','rest and steadiness','휴식·안정도','休息と安定'):L('負荷調節','负荷调节','load regulation','부하 조절','負荷調節');
  const points=rows.map(r=>rhythmData().values?.[r.idx]).filter(Boolean).map(v=>dpOwnerQualityValue(rhythmPositiveValue(index===0?'calm':'load',v)));
  if(!points.length)return;
  const delta=points.at(-1)-points[0],peak=Math.max(...points)-Math.min(...points);
  const direction=delta>=3?L('近期比開始時更平順。','近期比开始时更平稳。','The latest readings are steadier than the first.','초반보다 최근 수치가 안정적입니다.','最近は初期より安定しています。'):delta<=-3?L('近期比開始時有較多起伏。','近期比开始时波动更多。','The latest readings show more variation than the first.','최근에는 초반보다 변화가 큽니다.','最近は初期より変動が大きめです。'):L('前後走勢接近，沒有明顯的持續偏離。','前后走势接近，没有明显持续偏离。','The beginning and latest readings remain similar.','초반과 최근 변화는 크지 않습니다.','初期と最近の値は概ね近いです。');
  const line=L(`這 ${days} 天${label}的變化${peak<10?'較小':'較明顯'}。${direction}`,`最近 ${days} 天${label}的变化${peak<10?'较小':'较明显'}。${direction}`,`Across ${days} days, ${label} ${peak<10?'varied modestly':'varied more noticeably'}. ${direction}`,`최근 ${days}일 ${label} 변화를 확인하세요. ${direction}`,`過去${days}日間の${label}の推移です。${direction}`);
  const p=card.querySelector(':scope > p');if(p){p.textContent=line;p.classList.add('dp73-rhythm-trend');}
 });
 // The app displays graded alerts separately. Keep those grades when concerning,
 // but make the sleep category's titles and narrative consistently green.
 root.querySelectorAll('.dp70-rhythm-score-ring').forEach(r=>r.classList.add('dp73-centered-ring'));
}
const previousDeepView=deepView;
deepView=function(){const root=fragment(previousDeepView());if(!state.detail)try{amendDeep(root)}catch(err){console.warn('DeepPet summary fallback',err);}return html(root);};

// Put infrequently used records AFTER the veterinarian report action.
const previousHealthView=healthView;
healthView=function(){const root=fragment(previousHealthView());if(!state.detail){
 const vet=root.querySelector('.health-engagement-card.vet'),recovery=root.querySelector('.dp70-feature-recovery'),notes=root.querySelector('.dp70-feature-notes');
 if(vet){const parent=vet.parentNode,after=vet.nextSibling;for(const el of [recovery,notes])if(el)parent.insertBefore(el,after);}
 }return html(root);};

function ageExplanation(){const base=baselineProfile(),last=demoRecords(state.dog).at(-1)||{};const points=[
 ['heart',last.heart,base.heart,L('心率','心率','heart rate','심박','心拍')],
 ['breath',last.breath,base.breath,L('呼吸','呼吸','breathing','호흡','呼吸')],
 ['sleep',last.sleep,base.sleep,L('休息時間','休息时间','quiet rest','휴식','休息')],
 ['rmssd',last.rmssd,base.rm,'RMSSD'],['sdnn',last.sdnn,base.sd,'SDNN']
 ].map(([key,v,ref,name])=>({name,diff:Math.abs(Number(v)-Number(ref))/Math.max(1,Math.abs(Number(ref)))})).filter(x=>Number.isFinite(x.diff)).sort((a,b)=>b.diff-a.diff);
 const topics=points.slice(0,2).map(x=>x.name).join('、');const diff=bioAgeDelta().diff;
 return L(`推估主要參考近期的${topics||'心肺與休息'}變化，${diff<0?'近期整體趨勢相對平穩':diff>0?'部分指標與個體基準有所偏離':'整體與個體基準接近'}；屬趨勢估算，不等於實際壽命。`,`推估参考近期${topics||'心肺与休息'}变化，${diff<0?'整体趋势相对平稳':diff>0?'部分指标偏离个体基准':'整体接近个体基准'}；并非寿命预测。`,`Estimated from recent ${topics||'heart and rest'} patterns; ${diff<0?'trends look relatively steady':diff>0?'some measures differ from baseline':'measures are close to baseline'}. Not a lifespan prediction.`,`최근 ${topics||'심폐 및 휴식'} 추세를 참고한 추정치이며 실제 수명을 뜻하지 않습니다.`,`最近の${topics||'心肺と休息'}の傾向による推定で、寿命の予測ではありません。`);
}
// Me age: one tap -> detailed full page -> Back returns to Me, no intermediary accordions.
const previousMeView=meView;
meView=function(){const root=fragment(previousMeView()),age=root.querySelector('.dp68-age-me');if(age){const valid=signalQuality().valid,bio=valid?bioAgeDelta():null,diff=bio?.diff??null,sign=diff===null?'':diff<0?'−':diff>0?'+':'±';const el=document.createElement('button');el.type='button';el.className='card dp73-age-hero';el.dataset.action='age-detail';el.setAttribute('aria-label',L('查看 AI 推算年齡的完整說明','查看 AI 推算年龄的完整说明','Open detailed age estimate','AI 나이 추정 상세 보기','AI年齢推定の詳細を見る'));
 el.innerHTML=`<div class="dp73-age-head"><span class="dp73-age-icon" aria-hidden="true">${vicon('activity',21)}</span><div><b>${L('AI 推算生理年齡','AI 推算生理年龄','AI-estimated biological age','AI 추정 생체 나이','AI推定生理年齢')}</b><small>${L('依個體健康趨勢估算','依个体健康趋势估算','Based on personal health trends','개인 건강 추세 기반','個体の健康傾向から推定')}</small></div><span class="dp73-age-chevron" aria-hidden="true">${vicon('chev',20)}</span></div><div class="dp73-age-figures"><div class="dp73-estimated"><small>${L('推算年齡','推算年龄','Estimated age','추정 나이','推定年齢')}</small><strong>${valid?bio.bio.toFixed(1):'—'}<em>${t('years')}</em></strong></div><div class="dp73-age-comparison"><small>${L('實際年齡','实际年龄','Actual age','실제 나이','実年齢')}</small><b>${num(currentDog().age,1)} ${t('years')}</b>${valid?`<span class="dp73-difference">${sign}${Math.abs(diff).toFixed(1)} ${t('years')}</span>`:''}</div></div><p class="dp73-age-why">${valid?escT(ageExplanation()):escT(L('有效監測資料正在累積，尚無足夠資料推算年齡。','有效监测数据正在累积，暂不能推算年龄。','Valid observations are still building; an estimate is not available yet.','유효 기록을 더 수집해야 합니다.','有効な記録を蓄積中です。'))}</p><span class="dp73-age-detail-label">${L('點擊查看趨勢與詳細說明','点击查看趋势与详细说明','View trend and detailed explanation','추세와 자세한 설명 보기','傾向と詳しい説明を見る')} →</span>`;
 age.replaceWith(el);}
 return html(root);};
})();
