/* DeepPet V10.48 — readable Deep conclusions, compact device and baseline UI.
 * Keep the existing pages, pet records, measured gaps and score data model. */
(function(root){
 'use strict';
 const L=(zh,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:
   state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100;
 const mean=vals=>vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
 const periodRows=days=>dayRowsWithIndex(days).filter(r=>validDaySample(r,r.idx)?.valid===true)
   .sort((a,b)=>a.date.localeCompare(b.date));
 function scoreAt(row,key,engine){
   // Use the exact calendar date; sparse SDK rows have no positional index
   // correspondence with the thirty visual calendar slots.
   const line=Array.isArray(engine)?engine.find(x=>x?.date===row.date):null;
   if(line)return valid(line.scores?.[key])?line.scores[key]:null;
   if(Array.isArray(engine)&&engine.length)return null;
   // A new owner's verified-but-unscored day is not a showroom fixture.
   // Never turn an absent real score into an estimate from demo formulas.
   if(typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements(state.dog))return null;
   const s=dpOwnerDayScores(row,true);
   if(key==='cardio')return valid(s.heart)?s.heart:null;
   if(key==='energy')return valid(s.energy)?s.energy:null;
   if(key==='recovery')return valid(s.recovery)?s.recovery:null;
   if(key==='sleep')return valid(s.sleep)?s.sleep:null;
   if(key==='activityRecovery')return valid(s.energyActivity)?s.energyActivity:null;
   const rhythm=rhythmData()?.values?.[row.idx];
   if((key==='calm'||key==='stable')&&rhythm&&valid(rhythm[key]))return rhythm[key];
   return null;
 }
 function scores(days,key){
   const engine=root.DeepPetSignalScoring?.getDaily?.(state.dog);
   return periodRows(days).map(r=>({date:r.date,value:scoreAt(r,key,engine)}));
 }
 function chartScores(days,key){
   const engine=root.DeepPetSignalScoring?.getDaily?.(state.dog);
   return dayRowsWithIndex(days).map(r=>({date:r.date,
     value:validDaySample(r,r.idx)?.valid===true?scoreAt(r,key,engine):null}));
 }
 const averageOf=pts=>mean(pts.map(p=>p.value).filter(valid));
 function change(pts){
   const observed=pts.filter(p=>valid(p.value));
   if(observed.length<4)return '';
   const halfway=Math.floor(observed.length/2);
   const diff=mean(observed.slice(halfway).map(p=>p.value))-mean(observed.slice(0,halfway).map(p=>p.value));
   if(diff>4)return L('，後半段比前半段好一些','; the later days improved','。後半は少し改善','; 후반부가 개선됐어요');
   if(diff< -4)return L('，後半段比前半段稍弱','; the later days were lower','。後半はやや低下','; 후반부는 조금 낮았어요');
   return L('，前後變化不大','; little change between early and later days','。前後で大きな変化はありません','; 전후 변화가 크지 않아요');
 }
 function wellbeing(s){return s===null?L('資料尚不足','not enough readings','記録が不足','기록 부족'):
   s>=90?L('表現很好','looking very good','とても良好','매우 좋아요'):
   s>=80?L('整體穩定','generally steady','おおむね安定','대체로 안정적'):
   s>=60?L('有些起伏','some changes to watch','やや変動あり','다소 변화 있음'):
   L('需要多留意','needs a closer look','注意して確認','좀 더 살펴봐야 해요');}
 function sleepSummary(days){
   const list=scores(days,'sleep'),n=averageOf(list);
   if(n===null)return L('這段時間的有效睡眠記錄不足，暫時無法判斷變化。',
     'Not enough valid sleep records yet.','有効な休息記録が不足しています。','유효한 휴식 기록이 부족합니다.');
   return L(`近${days}天睡眠休息${wellbeing(n)}${change(list)}。`,
     `Sleep and rest were ${wellbeing(n)} over ${days} days${change(list)}.`,
     `直近${days}日間の睡眠・休息は${wellbeing(n)}${change(list)}。`,
     `최근 ${days}일의 수면·휴식은 ${wellbeing(n)}${change(list)}.`);
 }
 function heartSummary(days){
   const cardio=scores(days,'cardio'),hrv=scores(days,'hrv'),stable=scores(days,'stable');
   const overall=averageOf(cardio),h=averageOf(hrv),s=averageOf(stable);
   const desc=(n,good,poor)=>n===null?L('記錄不足','unavailable','記録不足','기록 부족'):n>=80?good:poor;
   return L(`近${days}天心肺整體${wellbeing(overall)}；HRV${desc(h,'大致接近平常','有些變化')}，心搏節奏${desc(s,'較平穩','起伏較多')}${change(cardio)}。`,
     `Over ${days} days, heart and breathing were ${wellbeing(overall)}; HRV was ${desc(h,'near usual','more variable')} and heartbeat timing was ${desc(s,'steady','less steady')}${change(cardio)}.`,
     `直近${days}日間の心肺は${wellbeing(overall)}。HRVは${desc(h,'通常に近い','変化あり')}、心拍リズムは${desc(s,'安定','変動あり')}${change(cardio)}。`,
     `최근 ${days}일 심폐는 ${wellbeing(overall)}. HRV ${desc(h,'평소와 비슷','변화 있음')}, 심박 리듬 ${desc(s,'안정','변동 있음')}${change(cardio)}.`);
 }
 function energySummary(days){
   const all=scores(days,'activityRecovery'),energy=scores(days,'energy'),recovery=scores(days,'recovery'),calm=scores(days,'calm');
   const e=averageOf(energy),r=averageOf(recovery),c=averageOf(calm);
   const term=(s,good,bad)=>s===null?L('資料不足','not yet available','記録不足','기록 부족'):s>=80?good:bad;
   return L(`近${days}天精力${term(e,'大致充足','較平常偏弱')}，活動後恢復${term(r,'大致順利','有時比較慢')}，休息時${term(c,'心搏較平穩','心搏起伏較多')}${change(all)}。`,
     `Over ${days} days, energy was ${term(e,'fairly good','lower than usual')}, post-activity recovery ${term(r,'generally normal','sometimes slower')}, and quiet-time beats ${term(c,'steady','more variable')}${change(all)}.`,
     `直近${days}日間の活力は${term(e,'良好','やや低下')}、活動後の回復は${term(r,'順調','やや遅い')}、安静時の心拍は${term(c,'安定','変動あり')}${change(all)}。`,
     `최근 ${days}일 활력은 ${term(e,'좋음','낮음')}, 회복은 ${term(r,'순조로움','느린 편')}, 휴식 중 심박은 ${term(c,'안정','변동 있음')}${change(all)}.`);
 }
 function plainDescription(key){
   if(key==='recovery')return L('活動結束後，心跳通常會逐漸慢下來。這項分數看牠在兩分鐘內，是否能像平常一樣恢復；同樣活動量下，回落較快通常代表恢復較好。',
     'After activity, the heart rate normally comes down. This score compares its two-minute recovery with similar activity on usual days; quicker recovery under similar effort is generally better.',
     '運動後の心拍が2分間でいつも通りに落ち着くかを見ます。同じ運動量では、速く戻るほど回復が良い傾向です。',
     '활동 후 2분 동안 심박이 평소처럼 내려가는지 살펴봅니다.');
   return L('看牠安靜休息時，心跳的節奏是不是接近平常。越接近平常，分數越高；這不代表牠開心或不開心。',
     'Looks at whether heartbeat timing during quiet rest is close to this pet’s usual pattern. A higher score means closer to usual, not happier.',
     '安静時の心拍リズムが普段に近いかを示します。高得点は気分の良さを意味しません。',
     '쉴 때 심박 리듬이 평소와 비슷한지 보여줍니다. 감정을 뜻하지 않습니다.');
 }
 // V10.46 already inserts a score curve from actual dated observations and
 // a neutral waiting label when there are fewer than two valid score days.
 // The old Me wrapper deleted that curve and displayed the SAME invented
 // decorative wave for Milo, Lucky and Blank. Do not override valid evidence.
 const previousDevice=deviceCenter;
 deviceCenter=function(){
   const host=document.createElement('div');host.innerHTML=previousDevice();
   const row=host.querySelector('.dp1046-device-battery-row');if(!row)return host.innerHTML;
   const value=row.querySelector('.dp1046-battery-number')?.textContent?.trim(),known=/^(?:100|[1-9]?\d)%$/.test(value||'');
   const pct=known?Number(value.slice(0,-1)):0;
   row.classList.add('dp1048-battery-inline');
   const freshness=row.querySelector('small')?.textContent?.trim();
   row.innerHTML=`<span class="dp1035-battery-icon" aria-hidden="true"><i style="width:${pct}%"></i></span><strong class="dp1048-battery-value">${known?value:'N/A'}</strong>`;
   row.setAttribute('aria-label',L('電量','Battery','電池残量','배터리')+' '+(known?value:'N/A')+(freshness?', '+freshness:''));
   return host.innerHTML;
 };
 const previousDeep=deepView;
 deepView=function(){
   const wrap=document.createElement('div');wrap.innerHTML=previousDeep();
   if(state.tab!=='deep'||state.detail&&state.detail!=='dp908-energy-calendar')return wrap.innerHTML;
   const days=Number(state.range),kind=Number(state.deepType);
   if(![1,7,30].includes(days))return wrap.innerHTML;
   if(kind===1&&days===1){
     const head=wrap.querySelector('.dp-owner-sleep .dp-owner-status-heading');
     if(head){head.classList.add('dp1048-sleep-day-head');const title=head.querySelector('h2');
       if(title)title.textContent=L('睡眠情況','Sleep & rest','睡眠状況','수면 상태');}
   }
   if(kind===1&&days>1){
     const card=wrap.querySelector('.dp905-sleep-summary'),head=card?.querySelector('.dp905-sleep-head'),copy=head?.querySelector('div:first-child');
     if(card&&head&&copy){
       head.classList.add('dp1048-sleep-period-head');
       const title=copy.querySelector('h2'),sub=copy.querySelector('p');
       if(title)title.textContent=L('睡眠情況','Sleep & rest','睡眠状況','수면 상태');
       if(sub)sub.textContent=L(`近${days}天睡眠休息總結`,`Sleep & rest · ${days} days`,`直近${days}日の睡眠・休息`,`최근 ${days}일 수면·휴식`);
       card.querySelectorAll(':scope > p').forEach(p=>p.remove());
       const p=document.createElement('p');p.className='dp1048-sleep-conclusion';p.textContent=sleepSummary(days);copy.append(p);
     }
   }
   if(kind===0&&days>1){
     const desc=wrap.querySelector('.dp903-heart .dp903-overview-copy>p');
     if(desc)desc.textContent=heartSummary(days);
   }
   if(kind===2){
     const cards=[...wrap.querySelectorAll('.dp901-health-score .dp901-metric-card')];
     for(const [i,key] of [[1,'recovery'],[2,'calm']]){
       const desc=cards[i]?.querySelector('.dp901-metric-desc');if(desc)desc.textContent=plainDescription(key);
     }
     if(days===1){
       // The old daily card read recovery and calm from legacy proxies while
       // the period cards already used the unified dated engine result.
       // Present the same recovery/calm values on both screens.
       const chosen=typeof deepChosenDate==='function'?deepChosenDate():null;
       const row=demoRecords(state.dog).map((r,idx)=>({...r,idx})).find(r=>r.date===chosen);
       if(row&&validDaySample(row,row.idx)?.valid){
         const engine=root.DeepPetSignalScoring?.getDaily?.(state.dog);
         for(const [i,key] of [[1,'recovery'],[2,'calm']]){
           const n=scoreAt(row,key,engine),col=cards[i]?.querySelector('.dp901-score-col');
           if(!col)continue;
           const grade=n===null?L('資料不足','No data','記録不足','데이터 부족'):
             n>=90?L('健康','Healthy','良好','건강'):
             n>=80?L('低風險','Mild','軽度','낮은 위험'):
             n>=60?L('中風險','Moderate','中程度','중간 위험'):
             L('高風險','Needs attention','要注意','주의 필요');
           col.innerHTML=(n===null?'<div class="dp90-unavailable">N/A</div>':
             dpDeepDottedScore(n,scoreScheme(n).color))+
             `<span class="dp901-score-tag">${grade}</span>`;
         }
         const lead=wrap.querySelector('.dp901-health-score .dp901-overall-desc');
         const overall=scoreAt(row,'activityRecovery',engine);
         if(lead)lead.textContent=L(`今天精力與恢復${wellbeing(overall)}。下方可查看各項狀態。`,
           `Energy and recovery are ${wellbeing(overall)} today. See the three areas below.`,
           `今日の活力と回復は${wellbeing(overall)}。下の項目をご覧ください。`,
           `오늘 활력과 회복은 ${wellbeing(overall)}. 아래 항목을 확인하세요.`);
       }
     }
     if(days>1){
       const notes=wrap.querySelector('.dp901-health-score .dp901-period-notes');
       if(notes)notes.innerHTML=`<b>${L('期間重點','Period summary','期間のまとめ','기간 요약')}</b><p></p>`;
       if(notes?.querySelector('p'))notes.querySelector('p').textContent=energySummary(days);
       // The recovery detail must plot the exact dated scores used in its
       // parent card; do not mix its /100 score with bpm recovery-drop units.
       const body=cards[1]?.querySelector('.dp901-expand-body');
       if(body&&root.DeepPetTrendDisplay1046?.chart){
         body.innerHTML=root.DeepPetTrendDisplay1046.chart(chartScores(30,'recovery'),days,{
           kind:'recovery',title:L('每日恢復表現','Daily recovery score','日別の回復スコア','일별 회복 점수'),
           color:'#3e82d0',unit:'/100',mode:'score'});
       }
     }
     if(state.detail==='dp908-energy-calendar'){
       const card=wrap.querySelector('.dp905-energy-calendar');
       if(card){
         const charts=[...card.querySelectorAll('.dp1046-trend')];
         if(charts.length===2){charts[0].remove();
           const title=charts[1].querySelector('.dp1046-trend-title b');
           if(title)title.textContent=L('每日精力變化','Daily energy trend','日別活力の変化','일별 활력 변화');}
         const h=card.querySelector('h3'),p=card.querySelector(':scope > p');
         if(h)h.textContent=L('精力情況','Energy status','活力状況','활력 상태');
         if(p)p.textContent=L('看看這段時間每天的精力表現。點選下方日期，可查看當天的活動與休息。',
           'See how daily energy changed. Tap a date below for activity and rest details.',
           '日ごとの活力を確認し、日付を選ぶと詳細を見られます。',
           '날짜별 활력을 확인하고 날짜를 눌러 자세히 볼 수 있습니다.');
       }
     }
   }
   return wrap.innerHTML;
 };
 const previousRender=render;
 render=function(reset=false){previousRender(reset);document.querySelectorAll('.app-build-version').forEach(el=>el.textContent='DeepPet Version '+(root.DeepPetBuildVersion||'10.48'));};
})(window);
