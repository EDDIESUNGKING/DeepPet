/* DeepPet V10.53 — evidence-specific, concise narratives on the existing UI.
 * Does not modify owner fixtures, stored health records, or scoring formulas. */
(function(root){
 'use strict';
 const L=(zht,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:
   state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zht):zht;
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 const usable=v=>finite(v)&&v>=0&&v<=100;
 const mean=xs=>{const a=xs.filter(finite);return a.length?a.reduce((s,x)=>s+x,0)/a.length:null;};
 const round=n=>finite(n)?Math.round(n):null;
 const scores=days=>root.DeepPetUX1050?.scope?.(days)||[];
 const grade=n=>n===null?-1:n>=90?0:n>=80?1:n>=60?2:3;
 const terms={heart:['心跳','heart rate','心拍','심박'],breath:['呼吸','breathing','呼吸','호흡'],
  hrv:['HRV','HRV','HRV','HRV'],stable:['心搏節奏','heartbeat rhythm','心拍リズム','심박 리듬'],
  cardio:['心肺狀態','heart and breathing','心肺','심폐'],sleep:['睡眠休息','sleep and rest','睡眠・休息','수면·휴식'],
  energy:['精力','energy','活力','활력'],recovery:['恢復','recovery','回復','회복'],
  calm:['放鬆與平穩度','rest and steadiness','安静時の安定度','휴식 안정도'],
  activityRecovery:['精力與恢復','energy and recovery','活力と回復','활력과 회복']};
 const name=key=>terms[key]?L(...terms[key]):key;
 function scoreFor(samples,key){return round(mean(samples.map(x=>x.scores?.[key]).filter(usable)));}
 function prevRows(samples){
   if(!samples.length||typeof demoRecords!=='function')return [];
   const first=samples[0].row.date;
   return demoRecords(state.dog).map((row,idx)=>({...row,idx})).filter(x=>x.date<first&&
     typeof validDaySample==='function'&&validDaySample(x,x.idx)?.valid===true).slice(-14);
 }
 const format=(n,precision=0)=>finite(n)?Number(n).toFixed(precision):'—';
 function measuredReason(key,samples){
   const field=key==='heart'?'heart':key==='breath'?'breath':key==='energy'?'activity':null;
   const units=key==='heart'?L('次/分','bpm','回/分','회/분'):key==='breath'?L('次/分','breaths/min','回/分','회/분'):'';
   if(field){
     const periodActual=mean(samples.map(x=>x.row[field]));
     const previous=prevRows(samples),historic=mean(previous.map(x=>x[field]));
     const within=samples.length>=8?mean(samples.slice(0,7).map(x=>x.row[field])):null;
     const prior=historic===null?within:historic;
     // No older reference? Compare disjoint early/late weeks, never the
     // 30-day average against a seven-day subset of itself.
     const actual=historic===null&&within!==null?
       mean(samples.slice(-7).map(x=>x.row[field])):periodActual;
     const basis=historic===null?L('本期前段有效日','the earlier valid days in this period','期間前半の有効日','기간 앞부분 유효일'):
       L('較早的有效監測日','earlier valid recording days','過去の有効測定日','이전 유효 측정일');
     const scope=historic===null&&within!==null?L('本期最近7個有效日','the latest 7 valid days','期間直近の有効7日','기간 최근 유효 7일'):
       L('本期','this period','今期','이번 기간');
     if(actual!==null&&prior!==null&&prior>0){
       const delta=actual-prior,threshold=key==='energy'?18:key==='breath'?1.1:2;
       const direction=Math.abs(delta)<threshold?L('接近','near','ほぼ同じ','비슷한'):
         delta>0?L('高於','above','より高い','높은'):L('低於','below','より低い','낮은');
       const a=key==='energy'?L('活動強度指數','activity intensity index','活動強度','활동 강도'):
         key==='heart'?L('心率','heart rate','心拍数','심박수'):L('呼吸頻率','breathing rate','呼吸数','호흡수');
       return L(`${scope}${a}平均 ${format(actual)}${units}；${basis}平均 ${format(prior)}${units}，目前${direction}該參考。還需結合當時安靜或活動的情況，不能只憑平均值判定原因。`,
        `${scope} ${a} averaged ${format(actual)} ${units}; ${basis} averaged ${format(prior)} ${units}. This is ${direction} that reference; rest and activity context matter.`,
        `${a}平均${format(actual)}${units}、${basis}平均${format(prior)}${units}。活動状態も併せて確認してください。`,
        `${a} 평균 ${format(actual)}${units}, ${basis} 평균 ${format(prior)}${units}. 활동 상태도 함께 비교하세요.`);
     }
     if(actual!==null)return L(`本期${aFor(key)}平均 ${format(actual)}${units}；缺少相近條件的對照日，不能只憑這個平均值判定偏快或偏慢。`,
       `Average ${aFor(key)}: ${format(actual)} ${units}; not enough comparable dates for a directional claim.`,
       `平均${aFor(key)}：${format(actual)}${units}。比較日が不足しています。`,
       `${aFor(key)} 평균 ${format(actual)}${units}, 비교 기록이 부족합니다.`);
   }
   if(key==='recovery'&&samples.length){
     const observed=samples.slice(-3).map(x=>{
       if(typeof dpOwnerRecoveryComparison!=='function')return null;
       const result=dpOwnerRecoveryComparison(x.row);
       return result&&finite(result.average)?result:null;
     }).filter(Boolean);
     if(observed.length){
       const avg=mean(observed.map(x=>x.average));
       const reference=mean(observed.map(x=>x.reference));
       const compare=reference===null?'':L(`，過往相近活動參考約 ${format(reference,1)} 次/分`,
          `, versus ${format(reference,1)} bpm after similar prior activity`,
          `、過去の同程度の活動では約${format(reference,1)}回/分`,
          `, 이전 비슷한 활동은 약 ${format(reference,1)}회/분`);
       return L(`最近 ${observed.length} 個有效活動時段，活動後兩分鐘心率平均回落 ${format(avg,1)} 次/分${compare}；回落幅度須在相近運動量下比較。`,
         `Across the latest ${observed.length} valid sessions, the two-minute heart-rate drop was ${format(avg,1)} bpm${compare}. Compare similar exertion.`,
         `活動後2分間の心拍低下は平均${format(avg,1)}回/分（${observed.length}回）。`,
         `활동 후 2분 심박 하강 평균 ${format(avg,1)}회/분 (${observed.length}회)입니다.`);
     }
   }
   if(key==='hrv'){
     const rm=mean(samples.map(x=>x.row.rmssd)),sd=mean(samples.map(x=>x.row.sdnn));
     const priorRm=mean(prevRows(samples).map(x=>x.rmssd));
     const compare=priorRm===null?'':L(`；先前有效日 RMSSD 平均 ${format(priorRm,1)} ms`,
       `; prior valid-day RMSSD averaged ${format(priorRm,1)} ms`,
       `、過去のRMSSD平均${format(priorRm,1)}ms`,`; 이전 RMSSD 평균 ${format(priorRm,1)}ms`);
     if(rm!==null&&sd!==null)return L(`RMSSD 平均 ${format(rm,1)} ms、SDNN 平均 ${format(sd,1)} ms${compare}。評分需對照相同休息情境與量測時長，高低不能單獨判斷健康。`,
       `RMSSD averaged ${format(rm,1)} ms and SDNN ${format(sd,1)} ms${compare}. Compare like-for-like quiet conditions and measurement lengths; a number alone is not a health verdict.`,
       `RMSSD平均${format(rm,1)}ms、SDNN平均${format(sd,1)}ms。個体の安静時基準と比較しています。`,
       `RMSSD 평균 ${format(rm,1)}ms, SDNN ${format(sd,1)}ms이며 평소 안정 기준과 비교합니다.`);
   }
   const validScores=samples.map(x=>x.scores?.[key]).filter(usable);
   if(validScores.length>1){
     const lo=Math.round(Math.min(...validScores)),hi=Math.round(Math.max(...validScores));
     const low=validScores.filter(x=>x<60).length;
     return L(`有效日${name(key)}落在 ${lo}–${hi} 分${low?`，其中 ${low} 日低於60分`:''}；請結合下方每天的變化判斷是否持續。`,
       `Valid-day ${name(key)} scores ranged from ${lo} to ${hi}/100${low?`, with ${low} days below 60`:''}. Check the dated trend for persistence.`,
       `日別スコアは${lo}～${hi}点で、普段との変化を示します。`,
       `일별 점수는 ${lo}~${hi}점으로 평소와의 차이를 나타냅니다.`);
   }
   return L('目前只有這次有效評分；單一分數無法說明偏離原因，請在相近條件下累積記錄。','Only this score is available. A single value cannot establish the cause; compare future readings under similar conditions.',
     '普段との違いを表す点数です。','평소 패턴과 차이를 나타내는 점수입니다.');
 }
 function aFor(key){return key==='energy'?L('活動強度指數','activity intensity','活動強度','활동 강도'):
  key==='heart'?L('心率','heart rate','心拍数','심박수'):L('呼吸頻率','breathing rate','呼吸数','호흡수');}
 const steps={
  heart:['先在相近的安靜時間確認心率；如果仍明顯偏快或偏慢，請記下時段與活動狀況。','Recheck heart rate during similar quiet rest and note persistent changes.','同じ安静時に心拍数を再確認してください。','비슷한 휴식 시간대에 심박수를 다시 확인하세요.'],
  breath:['留意休息時是否持續呼吸偏快、鼻翼擴張或費力；如有呼吸費力，立即就醫。','Watch for persistent fast or labored breathing at rest; labored breathing needs urgent veterinary care.','安静時の呼吸数や呼吸困難に注意してください。','안정 시 빠르거나 힘든 호흡이 지속되면 진료받으세요.'],
  hrv:['固定在相同的安靜時段比較，並和睡眠中斷、活動後恢復一起看。','Compare quiet periods under similar conditions alongside sleep and post-activity recovery.','同じ安静時刻で睡眠や回復と併せて確認してください。','비슷한 휴식 시간과 수면·회복을 함께 확인하세요.'],
  stable:['先確認項圈貼合、活動干擾和心搏訊號，再比較接下來幾次安靜讀數。','Check collar fit and motion artifacts, then compare subsequent quiet recordings.','装着と動きの影響を確認し、次回の安静時と比べてください。','착용·움직임 영향을 확인하고 다음 안정 시 기록과 비교하세요.'],
  energy:['維持規律散步和休息，若明顯不願活動或精神下降，先減少負荷並留意變化。','Keep a familiar walk/rest routine; if reluctant to move, ease the load and observe.','散歩と休息を整え、活動を嫌がる場合は負担を減らしてください。','평소 산책과 휴식을 유지하되 활동을 꺼리면 부담을 낮추세요.'],
  recovery:['這項看的是活動結束後兩分鐘的心率回落；先避免過量運動，對照相近運動量後的恢復。','This tracks the two-minute heart-rate drop after exertion; avoid overexertion and compare similar sessions.','運動後2分間の心拍回復を比べ、過度な運動を避けてください。','활동 후 2분 심박 회복을 비교하고 과도한 활동을 피하세요.'],
  calm:['安排安靜舒適的休息空間，觀察休息時心搏節奏是否逐步回到牠平常的範圍；這不是情緒翻譯。','Provide a calm rest area and track whether quiet-time beat timing returns to usual; this is not emotion detection.','静かな休息環境で心拍間隔が普段に戻るか確認してください。','조용한 환경에서 심박 간격이 평소로 돌아오는지 확인하세요.']
 };
 const action=key=>steps[key]?L(...steps[key]):'';
 function metricExplanation(key,samples,days,displayScore){
   const n=usable(displayScore)?round(displayScore):scoreFor(samples,key),level=grade(n);
   if(level<0)return L('目前有效資料不足，尚無法判定這項狀態。','Not enough valid readings for this area.','有効な記録が不足しています。','유효한 자료가 부족합니다.');
   // Title, score ring and grade already explain the subject and severity.
   // Narrative is reserved for evidence and an actionable, non-duplicated next step.
   if(level===0)return L('這項評分較好，維持熟悉的作息並持續觀察即可。','This score is favorable; continue the regular routine and observe.',
     'この項目は良好です。普段の生活を維持してください。','점수가 좋은 편이니 평소 일과를 유지하며 관찰하세요.');
   // A grade says how concerning the score is, not by itself how far a raw
   // measurement is from a comparable personal baseline.
   const verdict=level===1?L('這項評分略低。','This score is mildly low.','この点数はやや低めです。','이 점수는 다소 낮습니다.'):
     level===2?L('這項評分明顯偏低。','This score is notably low.','この点数は明らかに低めです。','이 점수는 뚜렷하게 낮습니다.'):
     L('這項評分很低，應優先關注。','This score is very low and needs prompt attention.','この点数はかなり低く、優先して確認が必要です。','이 점수가 매우 낮아 우선 확인이 필요합니다.');
   let explanation=verdict+' '+measuredReason(key,samples);
   if(level>=2)explanation+=' '+action(key);
   if(level===1)explanation+=' '+L('下一次在相近狀況下再比對即可。',' Compare again under similar conditions.','次回同じ条件で比べてください。','다음에 같은 조건에서 비교하세요.');
   if(level===3)explanation+=' '+L('若持續多日低分，或食慾、精神及行動明顯改變，請儘快請獸醫評估。',
     ' If low scores persist or appetite, energy or movement changes markedly, seek veterinary advice promptly.',
     '低得点が続く、元気や食欲に変化がある場合は早めに獣医師へ。',
     '낮은 점수가 지속되거나 식욕·활력이 변하면 수의사와 상담하세요.');
   return explanation;
 }
 function compositeExplanation(keys,composite,samples,days){
   const scored=keys.map(key=>({key,n:scoreFor(samples,key)})).filter(x=>x.n!==null).sort((a,b)=>a.n-b.n);
   const n=scoreFor(samples,composite),level=grade(n);
   if(level<0)return L('尚無有效評分。','Not enough valid scored days.','有効な点数がありません。','유효 점수가 없습니다.');
   const first=scored.slice(0,level===3?3:2);
   const parts=first.map(x=>`${name(x.key)} ${x.n}/100`).join(L('、',', ','・', ', '));
   if(level===0)return L('參與本項評分的指標整體分數較好，目前沒有特別突出的低分子項。',
     'The scored components are favorable, without a notably low component.',
     '対象となる指標の点数は概ね良好で、特に低い項目はありません。',
     '반영된 항목의 점수가 전반적으로 좋고 특별히 낮은 세부 항목은 없습니다.');
   return L(`拉低這項綜合評分的主要是${parts}。各項細節與改善方式請看下方分項。`,
     `Lowest components: ${parts}. See each section below for distinct evidence and next steps.`,
     `低い項目は${parts}です。各項目の記録と対処を確認してください。`,
     `낮은 항목은 ${parts}입니다. 각 항목에서 근거와 다음 단계를 확인하세요.`);
 }
 function sleepExplanation(samples,days){
   const n=scoreFor(samples,'sleep'),level=grade(n);if(level<0)return L('睡眠有效記錄不足。','Not enough sleep readings.','睡眠記録が不足しています。','수면 기록이 부족합니다.');
   const nights=samples.map(x=>typeof dpNightSleepStats==='function'?dpNightSleepStats(x.row.idx):null).filter(Boolean);
   const duration=round(mean(nights.map(x=>x.minutes))),wake=mean(nights.map(x=>x.wakes));
   const low=samples.filter(x=>usable(x.scores?.sleep)&&x.scores.sleep<60).length;
   const period=days===1?L('今天','Today','今日','오늘'):L(`近${days}天`,`Over ${days} days`,`直近${days}日`,`최근 ${days}일`);
   // The large number in the score ring already identifies the score.
   const lead=days===1?'':L(`${period}有${low}個有效日低於60分；`,
     `${low} valid days fell below 60 during this period; `,
     `${period}は${low}日が60点未満で、`,`이 기간 ${low}일이 60점 미만이며, `);
   if(level===0)return L('本期休息評分較好，維持規律的休息節奏即可。',
     'Sleep and rest scored favorably; keep a consistent routine.',
     '休息の点数は良好です。規則的な生活を続けましょう。',
     '수면·휴식 점수가 양호하니 규칙적인 일과를 유지하세요.');
   const fact=duration===null?'':L(`安靜休息平均約 ${dpMinutesText(duration)}、夜間中斷約 ${format(wake,1)} 次。`,
     `Quiet rest averaged ${format(duration/60,1)} h with ${format(wake,1)} interruptions.`,
     `安静時の休息は平均${format(duration/60,1)}時間、中断は約${format(wake,1)}回。`,
     `안정 휴식 평균 ${format(duration/60,1)}시간, 중단 ${format(wake,1)}회입니다.`);
   const reason=level===1?L('休息節奏略有偏離。',' Rest timing differs slightly.','休息の時間帯に小さな変化があります。','휴식 패턴에 작은 변화가 있습니다.'):
     level===2?L('休息連續性或每日節奏與平常差距較大。',' Rest timing or continuity differs noticeably from normal.','休息の連続性や時間が普段と違います。','휴식의 연속성이나 시간이 평소와 다릅니다.'):
     L(days===1?'這次休息狀態明顯偏低；即使休息時間長，也不代表睡得安穩。':
         low>=Math.max(2,Math.ceil(samples.length/2))?'多個有效日明顯偏低；即使前後變化不大，也不能視為正常。':
         '本期平均明顯偏低，應特別檢視低分日期的夜間中斷與作息。',
       days===1?'Rest is well below the usual score; long duration alone does not mean restorative sleep.':
         low>=Math.max(2,Math.ceil(samples.length/2))?'Many valid days scored very low; little trend change does not mean healthy rest.':
         'The period average is very low; review the poorest nights and interruptions.',
       '休息状態が大きく低下しています。夜間の中断に注意してください。',
       '휴식 점수가 크게 낮아 야간 중단을 살펴봐야 합니다.');
   const advice=level===1?L('下一晚在相同作息下再觀察。',' Compare again next night under the same routine.','次の夜も比較してください。','다음 날 밤 다시 비교하세요.'):
     L('先檢查夜間噪音、活動中斷和項圈貼合，維持規律休息。',
       ' Check nighttime disturbances and collar fit, and keep rest regular.',
       '夜間の中断と装着状態を確認し、規則的な休息を保ってください。',
       '야간 방해와 착용을 확인하고 규칙적인 휴식을 유지하세요.');
   return lead+reason+' '+fact+' '+advice+(level===3?L(' 若多晚持續偏低或精神、食慾明顯下降，請儘快諮詢獸醫。',
     ' If low scores continue or appetite and energy decline, seek veterinary advice promptly.',
     '低得点や食欲・元気の低下が続く場合は早めに獣医師へ。',
     '낮은 점수나 식욕·활력 저하가 계속되면 수의사와 상담하세요.'):'');
 }
 function displayScore(node){const attr=node?.querySelector?.('.dp-status-score[data-score]')?.dataset.score;
   return attr!==undefined&&attr!==''&&usable(Number(attr))?Number(attr):null;}
 function cleanSleep(samples,days){
   const card=document.querySelector(days===1?'#app .dp-owner-sleep':'#app .dp905-sleep-summary');
   const head=card?.querySelector(days===1?'.dp1048-sleep-day-head':'.dp1048-sleep-period-head');
   if(!card||!head)return;
   head.classList.add('dp1052-sleep-flow');
   const side=head.querySelector('.dp1046-primary-stack,.dp1042-score-stack,.dp1040-score-stack');
   const left=[...head.children].find(x=>x!==side&&x.querySelector?.('h2'));
   if(!left)return;
   // The older v10.48 stylesheet targets the FIRST direct child as copy.
   // Putting the score stack first makes its grid-column rule collide with
   // the copy, which caused the severe blank gap and text/ring overlap.
   if(head.firstElementChild!==left)head.insertBefore(left,head.firstChild);
   if(side&&left.nextElementSibling!==side)head.insertBefore(side,left.nextSibling);
   left.classList.add('dp1054-sleep-copy');
   if(side)side.classList.add('dp1054-sleep-meter');
   head.querySelectorAll('.dp1050-sleep-day-priority,.dp1048-sleep-conclusion').forEach(x=>x.remove());
   card.querySelectorAll('.dp1051-sleep-full-reason').forEach(x=>x.remove());
   // A legacy fixed verdict and the new explanation must never coexist.
   // Preserve the title, replace all old top-row prose with ONE evidence text.
   left.querySelectorAll(':scope > p').forEach(x=>x.remove());
   if(days===1){
     for(const p of card.querySelectorAll('.dp-owner-status-inner>p:not(.dp-owner-sleep-difference)'))p.remove();
   }else{
     const eyebrow=document.createElement('p');eyebrow.className='dp1054-period-kicker';
     eyebrow.textContent=L('期間重點：','Period focus:','期間のポイント：','기간 핵심:');left.append(eyebrow);
   }
   const p=document.createElement('p');p.className='dp1052-sleep-reason';
   p.textContent=sleepExplanation(samples,days);left.append(p);
 }
 function fixDeep(){
   if(state.tab!=='deep'||state.detail)return;
   const days=Number(state.range),kind=Number(state.deepType);if(![1,7,30].includes(days))return;
   const samples=scores(days);if(!samples.length)return;
   if(kind===1){cleanSleep(samples,days);return;}
   if(kind===0){
     const card=document.querySelector('#app .dp903-heart');if(!card)return;
     const headline=card.querySelector('.dp903-overview-copy>p');
     // Use the same four components as the scoring engine, in every range.
     if(headline)headline.textContent=compositeExplanation(['heart','breath','hrv','stable'],'cardio',samples,days);
     for(const key of ['heart','breath','hrv','stable']){
       const rootCard=card.querySelector(`[data-dp903-metric="${key}"]`);
       const p=rootCard?.querySelector('.dp903-metric-left>p');
       if(p)p.textContent=metricExplanation(key,samples,days,displayScore(rootCard));
     }
   }
   if(kind===2){
     const card=document.querySelector('#app .dp901-health-score');if(!card)return;
     const group=card.querySelectorAll('.dp901-metric-card');
     ['energy','recovery','calm'].forEach((key,i)=>{
       const p=group[i]?.querySelector('.dp901-metric-desc');
       if(p)p.textContent=metricExplanation(key,samples,days,displayScore(group[i]));
     });
     const total=compositeExplanation(['energy','recovery','calm'],'activityRecovery',samples,days);
     const p=days===1?card.querySelector('.dp901-overall-desc'):card.querySelector('.dp901-period-notes>p');
     if(p)p.textContent=total;
   }
 }
 function detailLinks(){
   if(state.tab!=='deep')return;
   const label=L('查看詳細數據','View detailed data','詳細データを見る','상세 데이터 보기');
   document.querySelectorAll('#app .dp-owner-deep .dp903-expand>summary,#app .dp-owner-deep .dp901-expand>summary,#app .dp-owner-deep .dp66-expand>summary,#app .dp-owner-deep .dp905-day-detail-link').forEach(el=>{
     el.textContent=label;el.classList.add('dp1052-detail-link');
   });
 }
 function summaryCopy(samples,days,index,panel){
   const parts=[...panel.querySelectorAll('.dp850-part')].map(x=>({name:x.querySelector('span')?.textContent?.trim(),n:Number.parseInt(x.querySelector('b')?.textContent,10)}))
     .filter(x=>x.name&&usable(x.n)).sort((a,b)=>a.n-b.n);
   const key=index===0?'physiol':'rhythm',series=samples.map(x=>x.scores?.[key]).filter(usable),n=round(mean(series));
   if(n===null)return L('期間內有效分數不足。','Not enough valid scored days.','有効な点数が不足しています。','유효 점수가 부족합니다.');
   const min=round(Math.min(...series)),bad=series.filter(x=>x<60).length;
   const first=parts[0],second=parts[1],level=grade(n);
   if(level===0)return L('本期主要指標分數良好，維持目前的休息與活動節奏即可。',
     'The main scores are favorable this period; keep the current rest and activity routine.',
     '主な点数は良好です。今の生活リズムを維持しましょう。',
     '주요 점수가 양호하니 휴식과 활동 리듬을 유지하세요.');
   const priority=[first,level===3?second:null].filter(Boolean).map(x=>`${x.name} ${x.n}/100`).join(L('、',', ','・', ', '));
   const base=L(`近${days}天最低一天${min}分${bad?`，共有${bad}個低於60分的有效日`:''}；需要優先留意${priority}。`,
     `The lowest day was ${min}/100${bad?`, with ${bad} valid days below 60`:''}. Priorities: ${priority}.`,
     `最低点は${min}点。優先項目：${priority}。`,
     `최저점 ${min}점. 우선 확인할 항목: ${priority}.`);
   let next='';
   if(index===0){const keyHint=/睡眠|sleep/i.test(first?.name||'')?'sleep':/心肺|heart|breath/i.test(first?.name||'')?'cardio':'activityRecovery';
     next=keyHint==='sleep'?L('優先查看睡眠中斷、睡前活動及固定作息。','Prioritize night interruptions and regular rest.','睡眠中断と生活リズムを確認してください。','야간 중단과 휴식 리듬을 확인하세요.'):
       keyHint==='cardio'?L('先在相似的安靜條件下核對心率和呼吸。','Recheck heart and breathing during comparable quiet rest.','同じ安静時に心拍と呼吸を確認してください。','비슷한 휴식 시간에 심박과 호흡을 확인하세요.'):
       L('先調整過量活動並比較活動後兩分鐘恢復。','Avoid overexertion and compare two-minute recovery after activity.','過度な運動を避け、2分間の回復を確認してください。','과도한 활동을 피하고 2분 회복을 비교하세요.');
   }else next=/心搏|heart|rhythm/i.test(first?.name||'')?action('stable'):action('calm');
   return base+' '+next+(level===3?L(' 若持續低分或明顯不適，請獸醫評估。',' Seek veterinary advice if persistently low or visibly unwell.',
     '低得点や異変が続けば受診してください。','낮은 점수나 이상이 계속되면 진료받으세요.'):'');
 }
 function inPlotTooltip(svg,point){
   const view=svg.viewBox.baseVal;if(!view||!point)return;
   const title=point.querySelector('title')?.textContent||'';const [date,val]=title.split(' · ');
   if(!date||!val)return;
   const x=Number(point.getAttribute('cx')),y=Number(point.getAttribute('cy'));
   if(!Number.isFinite(x)||!Number.isFinite(y))return;
   let g=svg.querySelector('.dp1052-inspector');
   if(!g){g=document.createElementNS('http://www.w3.org/2000/svg','g');g.classList.add('dp1052-inspector');g.setAttribute('pointer-events','none');
     const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');rect.setAttribute('rx','6');rect.setAttribute('width','106');rect.setAttribute('height','24');rect.setAttribute('fill','#204667');
     const txt=document.createElementNS('http://www.w3.org/2000/svg','text');txt.setAttribute('x','53');txt.setAttribute('y','16');txt.setAttribute('text-anchor','middle');txt.setAttribute('font-size','9.5');txt.setAttribute('fill','#ffffff');
     g.append(rect,txt);svg.append(g);}
   const xx=Math.max(view.x+3,Math.min(view.x+view.width-110,x-53));
   const yy=y>=view.y+40?y-33:Math.min(view.y+view.height-27,y+8);
   g.setAttribute('transform',`translate(${xx.toFixed(1)} ${yy.toFixed(1)})`);
   g.children[1].textContent=`${date.slice(5).replace('-','/')}  ${val}/100`;
   g.style.display='';
 }
 function chartTooltip(){
   if(state.tab!=='health'||state.detail!=='summary')return;
   document.querySelectorAll('#app .dp850-score-panel .dp850-curve').forEach(curve=>{
     const svg=curve.querySelector('svg');if(!svg)return;
     const circles=[...svg.querySelectorAll('circle')].filter(c=>c.querySelector('title'));
     if(!circles.length)return;
     const show=e=>{
       const box=svg.viewBox.baseVal,r=svg.getBoundingClientRect();
       const x=e&&Number.isFinite(e.clientX)?box.x+(e.clientX-r.left)/Math.max(1,r.width)*box.width:
         circles[Math.max(0,Math.min(circles.length-1,Number(svg.dataset.dp1012Selected)||circles.length-1))].getAttribute('cx');
       const p=circles.reduce((best,c)=>Math.abs(Number(c.getAttribute('cx'))-x)<Math.abs(Number(best.getAttribute('cx'))-x)?c:best);
       inPlotTooltip(svg,p);
       document.querySelector('.dp938-chart-tooltip')?.remove();
     };
     svg.addEventListener('pointermove',show);svg.addEventListener('pointerdown',show);
     svg.addEventListener('focus',()=>show(null));
     svg.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key))setTimeout(()=>show(null),0);});
     svg.addEventListener('pointerleave',()=>{const g=svg.querySelector('.dp1052-inspector');if(g)g.style.display='none';});
     curve.querySelector('.dp1011-curve-tip')?.remove();
   });
 }
 function recap(){
   if(state.tab!=='health'||state.detail!=='summary')return;
   const redundant=document.querySelector('#app .dp1013-event-card');if(redundant)redundant.remove();
   const days=Number(state.healthSummaryDays)===30?30:7,s=scores(days);
   document.querySelectorAll('#app .dp850-score-panel').forEach((panel,index)=>{
     const p=panel.querySelector('.dp1050-recap-reason');if(p&&s.length)p.textContent=summaryCopy(s,days,index,panel);
   });
   chartTooltip();
 }
 function labExplanation(raw,assessment){
   const n=usable(assessment?.score)?Math.round(assessment.score):null,r=assessment?.reference;
   const value=finite(r?.value)?r.value:Number(raw.value),ref=r?.ok===true;
   const unit=r?.unit||raw.referenceUnit||raw.unit||'';
   const interval=ref?`${format(r.low,1)}–${format(r.high,1)} ${unit}`:
     L('原始報告未提供可核對的適用參考區間','No verifiable applicable reference interval',
       '適用できる基準範囲なし','적용 가능한 기준 범위 없음');
   if(n===null)return L(`適用正常範圍：${interval}。目前單位、檢驗背景或數值需核對，不能編造風險等級。`,
     `Reference: ${interval}. Verify units and report context before grading.`,
     `基準範囲：${interval}。確認が必要です。`,`기준 범위: ${interval}. 확인이 필요합니다.`);
   const label=n>=90?L('健康','Healthy','健康','건강'):n>=80?L('輕風險','Mild concern','軽度リスク','경도 위험'):
     n>=60?L('中風險','Moderate concern','中リスク','중간 위험'):L('重風險','High concern','高リスク','높은 위험');
   const position=ref?(value<r.low?L('低於參考下限','below the reference minimum','基準下限より低い','기준 하한보다 낮음'):
     value>r.high?L('高於參考上限','above the reference maximum','基準上限より高い','기준 상한보다 높음'):
     L('在參考區間內','within the reference interval','基準内','기준 범위 내')):
     L('此分級依原報告的異常標記，數值參考區間仍需核對','Based on original flagged status; numeric reference is unavailable',
       '原報告のフラグに基づく評価で参照範囲は未確認','원본 표시를 기반으로 하며 기준 범위 미확인');
   return L(`適用正常範圍：${interval}。本次 ${format(value,1)} ${raw.unit||unit}，${position}，因此目前為${label}（${n}/100）。${n<80?'優先對照原始檢驗單、年齡體重適用區間，必要時請獸醫複查。':'可依原有追蹤計畫觀察。'}`,
     `Applicable normal range: ${interval}. Result ${format(value,1)} ${raw.unit||unit}, ${position}; ${label} (${n}/100). ${n<80?'Review the original report and ask a vet about follow-up.':'Continue routine follow-up.'}`,
     `基準範囲：${interval}。測定値${format(value,1)} ${raw.unit||unit}、${position}。${label}（${n}点）。`,
     `정상 범위: ${interval}. 결과 ${format(value,1)} ${raw.unit||unit}, ${position}; ${label} (${n}점).`);
 }
 const previousVet=vetReportContent;
 vetReportContent=function(d){
   const html=previousVet(d),wrap=document.createElement('div');wrap.innerHTML=html;
   const table=wrap.querySelector('.vet-report-lab-table');if(!table)return html;
   const rows=Array.isArray(d.labs)?d.labs:[],pet={...d.pet,petId:String(state.dog)};
   const labels=['healthy','mild','moderate','risk'],counts={healthy:0,mild:0,moderate:0,risk:0,pending:0};
   const trs=[...table.querySelectorAll('tbody>tr')];
   rows.forEach((raw,i)=>{
     const tr=trs[i],assessment=root.DeepPetLabEvidence?.item?.(raw,pet,raw.date);if(!tr)return;
     const n=assessment?.score,code=usable(n)?n>=90?'healthy':n>=80?'mild':n>=60?'moderate':'risk':'pending';counts[code]++;
     const td=tr.querySelector('td:first-child');if(!td)return;
     const details=document.createElement('details');details.className='dp1052-lab-detail';
     const summary=document.createElement('summary');summary.textContent=L('查看正常範圍與原因','Reference range & reason','基準範囲と理由','정상 범위와 이유');
     const p=document.createElement('p');p.textContent=labExplanation(raw,assessment);
     details.append(summary,p);td.append(details);
   });
   const head=wrap.querySelector('.vet-report-lab-head span:last-child');
   if(head)head.textContent=labels.map((k,i)=>`${[L('健康','Healthy','健康','건강'),L('輕風險','Mild','軽度','낮은 위험'),L('中風險','Moderate','中リスク','중간 위험'),L('重風險','High','高リスク','높은 위험')][i]} ${counts[k]}`).join(' · ')+(counts.pending?` · ${L('資料不足','Pending','未判定','자료 부족')} ${counts.pending}`:'');
   return wrap.innerHTML;
 };
 const previousRender=render;
 render=function(reset=false){previousRender(reset);document.body.classList.toggle('dp1052-summary-active',state.tab==='health'&&state.detail==='summary');fixDeep();detailLinks();recap();
   document.querySelectorAll('.app-build-version').forEach(x=>x.textContent='DeepPet Version '+(root.DeepPetBuildVersion||'10.53'));
 };
 root.DeepPetUX1052={version:'10.53',metricExplanation,compositeExplanation,sleepExplanation,summaryCopy,labExplanation};
})(window);
