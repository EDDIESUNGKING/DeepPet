/* DeepPet V10.30 — evidence-aware explanations inside existing cards. */
(function(root){'use strict';
 const logic=()=>root.DeepPetCareIntelligence1030;
 const say=(zh,en,ja,ko)=>dp1028Text(zh,en,ja,ko);
 const asScore=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=100;
 const scoreDelta=x=>Math.abs(x).toFixed(1).replace(/\.0$/,'');
 const oldDeep=deepView;
 deepView=function(){
  const html=oldDeep(),days=state.range;
  if(state.detail||![7,30].includes(days)||!html.includes('dp1029-period-insight')||!logic())return html;
  const {records,real}=dp1029PeriodSource(days),metrics=dp1029TrendMetrics(state.deepType,real);
  const result=root.DeepPetCareIntelligence1029?.periodHighlight(records,{days,end:iso(localDate()),metrics});
  if(!result?.ready||!result.highlight)return html;
  const focus=result.highlight,metric=metrics.find(x=>x.key===focus.key);
  const pattern=logic().periodPattern(focus,{displayThreshold:metric?.threshold||0});
  const desc={
   'supported-recent':say('最近連續三個自然日都維持在前段平均的同一側，屬於較連續的變化。','The latest three consecutive days stayed on the same side of the earlier average, supporting a more persistent change.','直近の連続3日間が前半平均の同じ側にあり、変化が継続している可能性があります。','최근 연속 3일이 전반 평균의 같은 쪽에 있어 변화가 이어지는 양상입니다.'),
   'change-not-confirmed-sustained':say('前後平均確實不同，但尚不能證明最近三個自然日都持續同向；先看下方每日走勢。','The averages differ, but a three-consecutive-day pattern is not established. Review the dated trend below.','前後の平均は異なりますが、直近3日間の継続は確認できません。日別推移を確認してください。','평균은 다르지만 최근 연속 3일의 지속 양상은 확인되지 않았습니다.'),
   'steady-with-fluctuation':say('前後平均接近，但有相鄰兩天的短期起伏；不能把它解讀成整段持續變差。','Period averages are similar, but adjacent-day fluctuation occurred. This is not evidence of sustained deterioration.','前後の平均は近いものの、隣接する日には変動があります。継続的な悪化とは限りません。','전후 평균은 비슷하지만 인접한 날짜의 변동이 있습니다. 지속 악화를 뜻하지는 않습니다.'),
   steady:say('前後平均接近，暫未看到足以支持持續改變的證據。','Earlier and later averages are similar; there is insufficient evidence of a sustained shift.','前後の平均は近く、継続的な変化を示す証拠はまだありません。','전후 평균이 비슷하며 지속 변화의 근거는 아직 부족합니다.')
  }[pattern.code];
  if(!desc)return html;
  const note=`<div class="dp1030-pattern"><strong>${say('變化型態','Change pattern','変化の傾向','변화 양상')}</strong><span>${esc(desc)}</span><small>${say(`前段 ${focus.earlyDays} 個有效日 · 後段 ${focus.lateDays} 個有效日`,`Early: ${focus.earlyDays} recorded days · Later: ${focus.lateDays}`,`前半${focus.earlyDays}日 · 後半${focus.lateDays}日`,`전반 ${focus.earlyDays}일 · 후반 ${focus.lateDays}일`)}</small></div>`;
  const start=html.indexOf('<section class="card dp1029-period-insight">');
  const lead=html.indexOf('<div class="dp1029-insight-lead">',start);
  const end=lead<0?-1:html.indexOf('</div>',lead);
  return end<0?html:html.slice(0,end+6)+note+html.slice(end+6);
 };
 function priorDomainScores(index){
  const date=iso(localDate()),key=['cardio','sleep','activityRecovery'][index];
  if(dpUsesRealMeasurements()){
   return (root.DeepPetSignalScoring?.getDaily?.(state.dog)||[]).map(x=>({date:x.date,score:x.scores?.[key]}));
  }
  const field=['heart','sleep','energyActivity'][index];
  return dayRowsWithIndex(7).filter(r=>r.date!==date&&validDaySample(r,r.idx).valid)
   .map(r=>({date:r.date,score:dpOwnerDayScores(r)[field]}));
 }
 const oldCard=dpTodayActionCard;
 dpTodayActionCard=function(item){
  const html=oldCard(item),m=/^deep-([012])$/.exec(String(item?.id||''));
  if(!m||!asScore(item.score)||!logic())return html;
  const result=logic().todayComparedWithRecent(priorDomainScores(Number(m[1])),{date:iso(localDate()),score:item.score});
  if(!result.ready)return html;
  const difference=result.direction==='steady'?
   say('接近前6天的可比日平均','Near the comparable-day mean of the previous 6 days','直近6日間の記録平均に近い','최근 6일 기록 평균과 비슷함'):
   result.direction==='up'?say(`比前6天可比日平均高 ${scoreDelta(result.delta)} 分`,`Higher by ${scoreDelta(result.delta)} points than recent recorded days`,`直近の記録平均より${scoreDelta(result.delta)}点高い`,`최근 기록 평균보다 ${scoreDelta(result.delta)}점 높음`):
   say(`比前6天可比日平均低 ${scoreDelta(result.delta)} 分`,`Lower by ${scoreDelta(result.delta)} points than recent recorded days`,`直近の記録平均より${scoreDelta(result.delta)}点低い`,`최근 기록 평균보다 ${scoreDelta(result.delta)}점 낮음`);
  const yesterday=result.yesterdayDelta===null?'':` · ${Math.abs(result.yesterdayDelta)<1?
   say('與昨天接近','Near yesterday','前日と近い','어제와 비슷함'):
   result.yesterdayDelta>0?say(`較昨天高 ${scoreDelta(result.yesterdayDelta)} 分`,`Up ${scoreDelta(result.yesterdayDelta)} from yesterday`,`前日より${scoreDelta(result.yesterdayDelta)}点高い`,`어제보다 ${scoreDelta(result.yesterdayDelta)}점 높음`):
   say(`較昨天低 ${scoreDelta(result.yesterdayDelta)} 分`,`Down ${scoreDelta(result.yesterdayDelta)} from yesterday`,`前日より${scoreDelta(result.yesterdayDelta)}点低い`,`어제보다 ${scoreDelta(result.yesterdayDelta)}점 낮음`)}`;
  const line=`<div class="dp1030-score-context"><b>${say('與牠自己的近期比較','Compared with this pet’s recent days','最近の個体記録との比較','반려동물의 최근 기록과 비교')}</b><span>${difference}${yesterday}</span><small>${say(`前6個自然日有 ${result.pastDays} 天可比 · 平均 ${result.mean.toFixed(1)}/100`,`Previous 6 calendar days: ${result.pastDays} comparable · mean ${result.mean.toFixed(1)}/100`,`直近6日中${result.pastDays}日比較可能 · 平均${result.mean.toFixed(1)}/100`,`최근 6일 중 ${result.pastDays}일 비교 가능 · 평균 ${result.mean.toFixed(1)}/100`)}</small></div>`;
  return html.replace(/<\/button>$/,line+'</button>');
 };
 function todayCareSummary(){
  if(!root.dp1029PeriodCareRows||!root.DeepPetCareIntelligence1029)return '';
  const date=iso(localDate());
  const items=root.DeepPetCareIntelligence1029.periodCareContext(root.dp1029PeriodCareRows(1),{days:1,end:date,keyDates:[date]}).featured;
  if(!items.length)return '';
  const shown=items.slice(0,2).map(x=>`${x.time?x.time+' · ':''}${x.title}`.slice(0,90));
  const extra=items.length>shown.length?say(` · 另 ${items.length-shown.length} 筆在 Health`,` · ${items.length-shown.length} more in Health`,` · 残り${items.length-shown.length}件はHealth`,` · 나머지 ${items.length-shown.length}건은 Health`):'';
  return `<div class="dp1030-today-care"><b>${say('今天已有的健康背景','Health records already logged today','本日の健康記録','오늘의 건강 기록')}</b><span>${shown.map(esc).join(' · ')}${extra}</span><small>${say('僅顯示同日紀錄，不代表它造成了生理變化。','Same-day records are context, not proof of a cause.','同日の記録は原因を示しません。','같은 날짜의 기록은 원인의 증거가 아닙니다.')}</small></div>`;
 }
 const oldFocus=focusCard;
 focusCard=function(){const html=oldFocus();if(!html.includes('<div class="dp-today-list">'))return html;
  const context=todayCareSummary();return context?html.replace('<div class="dp-today-list">',context+'<div class="dp-today-list">'):html;
 };
 const oldRender=render;
 render=function(reset=false){oldRender(reset);document.querySelectorAll('#app .app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.30');};
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.30',integrity:[...(root.DeepPetRelease?.integrity||[]),'period-pattern-evidence-classification','home-low-score-personal-history','today-care-context-home-no-new-route','preserved-scores-waveforms-navigation']};
})(window);
