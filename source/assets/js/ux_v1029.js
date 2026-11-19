/* DeepPet V10.29 — concrete answers, same Home / Deep / Health / Me. */
(function(root){'use strict';
 const intelligence=()=>root.DeepPetCareIntelligence1029;
 function locale(zh,en,ja,ko){return dp1028Text(zh,en,ja,ko);}
 function brief(value,key){return Number(value).toFixed(key==='restHours'||key==='breath'||key==='wakes'?1:0);}
 function periodCareRows(days){
  // Original records stay in Health; this is a bounded, read-only view of
  // the selected period with no manual annotation or inferred event clocks.
  const out=[],owner=String(state.dog),end=iso(localDate()),start=iso(dateAdd(localDate(),-(days-1)));
  const inWindow=date=>typeof date==='string'&&date>=start&&date<=end&&/^\d{4}-\d{2}-\d{2}$/.test(date);
  for(let offset=days-1;offset>=0;offset--){
   const date=iso(dateAdd(localDate(),-offset));
   out.push(...dp1028DayCareRecords(date));
  }
  // Completed vaccinations are actual dated care only when their completion
  // date was explicitly documented. An appointment date is not a shot date.
  for(const v of typeof allVaxForDog==='function'?allVaxForDog():[]){
   if(v?.status!=='done'||!inWindow(v.doneDate))continue;
   out.push({date:v.doneDate,time:'',title:locale('已確認接種','Vaccination confirmed','接種確認済み','접종 확인')+' · '+dpL10nSample(String(v.name||v.vaccine||''))});
  }
  // Group actual dated examination entries by their original report ID;
  // Health continues to own every individual test, range and interpretation.
  const reportRows=typeof root.dp914ReportRecords==='function'?root.dp914ReportRecords(state.dog):state.userReportEntries?.[owner]||[];
  const reports=new Map();
  for(const r of Array.isArray(reportRows)?reportRows:[]){
   if(!inWindow(r?.date))continue;
   const claims=[r.petId,r.ownerPetId,r.profile?.petId].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='');
   if(claims.some(id=>String(id)!==owner))continue;
   const key=`${r.date}|${r.reportId||r.id||r.name||'record'}`;
   if(!reports.has(key))reports.set(key,{date:r.date,count:0,clinic:String(r.clinic||r.institution||''),name:String(r.name||'')});
   reports.get(key).count++;
  }
  for(const r of reports.values())out.push({date:r.date,time:'',title:locale('體檢紀錄','Exam record','検査記録','검사 기록')+' · '+dpL10nSample(r.clinic||r.name||locale('已儲存報告','Saved report','保存済みの結果','저장된 보고서'))+(r.count>1?` · ${r.count} ${locale('項','entries','項目','항목')}`:'')});
  // Existing recovery check-ins are observations, not inferred symptoms.
  const care=typeof carePlanForPet==='function'?carePlanForPet():null;
  for(const c of Array.isArray(care?.checkins)?care.checkins:[]){
   if(!inWindow(c?.date))continue;
   out.push({date:c.date,time:'',title:locale('恢復觀察已記錄','Recovery check-in recorded','回復経過の記録','회복 관찰 기록')});
  }
  return out;
 }
 function careLine(event){
  const clock=event.time?` · ${esc(event.time)}`:'';
  return `<li><time>${esc(event.date)}${clock}</time><span>${esc(event.title)}</span></li>`;
 }
 function periodCareMarkup(days,highlight){
  const engine=intelligence(),end=iso(localDate()),keys=[highlight?.low?.date,highlight?.high?.date,highlight?.step?.to].filter(Boolean);
  const records=engine.periodCareContext(periodCareRows(days),{days,end,keyDates:keys});
  const keyItems=records.featured.slice(0,6),keyRemaining=records.featured.slice(6);
  const otherFirst=records.other.slice(0,3),otherRemaining=records.other.slice(3);
  const unknown=locale('沒有相同日期的健康紀錄，不能猜測變化原因。','No care records on these highlighted dates; no cause is inferred.','該当日の健康記録はありません。原因は推測しません。','강조 날짜에 건강 기록이 없어 원인을 추정하지 않습니다.');
  const featured=records.featured.length?`<ul>${keyItems.map(careLine).join('')}</ul>`:`<p>${unknown}</p>`;
  const after=keyRemaining.length?`<details class="dp1029-inline-details"><summary>${locale(`同日期另有 ${keyRemaining.length} 筆紀錄`,`Show ${keyRemaining.length} more records on highlighted dates`,`該当日の残り${keyRemaining.length}件`,`강조 날짜의 나머지 ${keyRemaining.length}건`)}</summary><ul>${keyRemaining.map(careLine).join('')}</ul></details>`:'';
  const other=records.other.length?`<div class="dp1029-other-context"><b>${locale(`其他日期的健康紀錄 · ${records.other.length} 筆`,`Care records on other dates · ${records.other.length}`,`ほかの日の記録 · ${records.other.length}件`,`다른 날짜 기록 · ${records.other.length}건`)}</b><ul>${otherFirst.map(careLine).join('')}</ul>${otherRemaining.length?`<details class="dp1029-inline-details"><summary>${locale(`展開其餘 ${otherRemaining.length} 筆`,`Expand ${otherRemaining.length} more`,`残り${otherRemaining.length}件を表示`,`나머지 ${otherRemaining.length}건 펼치기`)}</summary><ul>${otherRemaining.map(careLine).join('')}</ul></details>`:''}</div>`:'';
  return `<div class="dp1029-care-period"><h4>${locale('變化日期的健康背景','Care context on change dates','変化日の健康記録','변화 날짜의 건강 기록')}</h4><p>${locale('下列記錄按同一天對照；原始完整紀錄仍在 Health。','Matched by calendar date only. Complete original records remain in Health.','同じ日付の記録を並べています。元の全記録はHealthにあります。','같은 날짜의 기록만 나열합니다. 원본 전체 기록은 Health에 있습니다.')}</p>${featured}${after}${other}<small>${locale('同日出現不代表因果關係；原定用藥時刻不等於實際給藥時刻。','Same-day timing does not establish causation; planned medication times are not actual administration times.','同日の記録は因果関係を示しません。予定投薬時刻は実際の投薬時刻ではありません。','같은 날 기록은 인과관계를 뜻하지 않으며 예정 투약 시각은 실제 투약 시각이 아닙니다.')}</small></div>`;
 }
 function periodInsight(kind,days){
  const engine=intelligence();if(!engine||![7,30].includes(days))return '';
  const {records,real}=dp1029PeriodSource(days),metrics=dp1029TrendMetrics(kind,real);
  const result=engine.periodHighlight(records,{days,end:iso(localDate()),metrics});
  if(!result.ready)return '';
  const metric=metrics.find(m=>m.key===result.highlight.key),focus=result.highlight;
  if(!metric)return '';
  const change=focus.direction==='steady'?locale('前後兩段平均接近','Similar averages in both halves','前半と後半の平均は近い','전반과 후반의 평균이 비슷함'):
   focus.direction==='up'?locale('後半平均增加','Higher in the later half','後半の平均が増加','후반 평균 증가'):locale('後半平均減少','Lower in the later half','後半の平均が減少','후반 평균 감소');
  const difference=focus.delta>0?'+':'';
  const extrema=focus.low&&focus.high?`<div class="dp1029-high-low"><div><small>${locale('期間最低記錄','Lowest recorded','期間内の最小値','기간 최저 기록')}</small><b>${esc(focus.low.date)} · ${brief(focus.low.value,focus.key)} ${esc(metric.unit)}</b></div><div><small>${locale('期間最高記錄','Highest recorded','期間内の最大値','기간 최고 기록')}</small><b>${esc(focus.high.date)} · ${brief(focus.high.value,focus.key)} ${esc(metric.unit)}</b></div></div>`:'';
  const step=focus.step?`<p class="dp1029-day-step">${locale('最大相鄰日差異','Largest change between adjacent recorded days','隣接日の最大差','연속 이틀 간 최대 차이')}：${esc(focus.step.from)} → ${esc(focus.step.to)} · ${focus.step.delta>0?'+':''}${brief(focus.step.delta,focus.key)} ${esc(metric.unit)}</p>`:'';
  const heading=focus.direction==='steady'?locale('這段時間的前後平均接近','Period averages are similar','前後の平均はほぼ同じ','기간 전후 평균이 비슷함'):locale('這段時間先看哪項變化','Most notable change in this period','期間内の主な変化','기간 중 주목할 변화');
  return `<section class="card dp1029-period-insight"><h3>${heading}</h3><div class="dp1029-insight-lead"><b>${esc(metric.name)}</b><span>${change} · ${difference}${brief(focus.delta,focus.key)} ${esc(metric.unit)}</span></div><p>${locale(`前段 ${brief(focus.before,focus.key)}，後段 ${brief(focus.after,focus.key)}；以實際可比日期計算。`,`First half ${brief(focus.before,focus.key)}; later half ${brief(focus.after,focus.key)}, using actual dated observations.`,`前半${brief(focus.before,focus.key)}、後半${brief(focus.after,focus.key)}。記録がある日だけで比較。`,`전반 ${brief(focus.before,focus.key)}, 후반 ${brief(focus.after,focus.key)}. 실제 기록 날짜만 비교.`)}</p>${extrema}${step}${periodCareMarkup(days,focus)}<p class="dp1029-neutral-note">${locale('高低值是觀察結果，不是健康好壞排名；活動與休息可影響數值。下方原曲線和每日詳細資料完整保留。','High and low readings are observations, not health rankings. Activity and rest affect readings. Original charts and daily details remain below.','最大・最小値は健康の良否を意味しません。元のグラフと日別詳細は維持されています。','높고 낮은 수치는 건강 순위가 아닙니다. 기존 그래프와 날짜별 상세는 유지됩니다.')}</p></section>`;
 }
 // Put the answer BEFORE the original period charts, immediately below the
 // existing date/range controls. The V10.28 comparisons, all curves and
 // detailed rows remain below it; users don't need to scroll to the bottom.
 const oldDeep=deepView;
 deepView=function(){
  const html=oldDeep();if(state.detail||![7,30].includes(state.range))return html;
  const marker='<section class="card dp-owner-period-card',at=html.indexOf(marker);
  if(at<0)return html;
  const summary=periodInsight(state.deepType,state.range);
  return summary?html.slice(0,at)+summary+html.slice(at):html;
 };
 function nowMinutes(){const now=new Date();return now.getHours()*60+now.getMinutes();}
 function todayDigest(items){
  const decision=intelligence()?.todayDecision(items,{nowMinutes:nowMinutes()});if(!decision)return '';
  const parts=[];
  if(decision.urgent)parts.push(locale(`最高優先 ${decision.urgent} 項`,`Top-priority items: ${decision.urgent}`,`最優先${decision.urgent}件`,`최우선 ${decision.urgent}건`));
  if(decision.persistent)parts.push(locale(`連續偏低 ${decision.persistent} 項`,`Persistently low: ${decision.persistent}`,`低値継続${decision.persistent}件`,`지속 낮음 ${decision.persistent}건`));
  if(decision.scheduledDue)parts.push(locale(`原定時間已到、待確認 ${decision.scheduledDue} 項`,`Scheduled time passed; confirm: ${decision.scheduledDue}`,`予定時刻経過・要確認${decision.scheduledDue}件`,`예정 시간 경과·확인 필요 ${decision.scheduledDue}건`));
  if(!parts.length)parts.push(locale('依今日分數、照護待辦與時間優先排列','Ordered by today’s scores, care tasks and schedule','今日の点数・ケア予定・時間順に表示','오늘 점수·돌봄 일정·시간순으로 정렬'));
  return `<div class="dp1029-today-digest">${parts.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
 }
 const oldFocus=focusCard;
 focusCard=function(){const html=oldFocus();if(!html.includes('dp-today-list'))return html;
  const line=todayDigest(dpAllTodayAttentionItems());return html.replace('<div class="dp-today-list">',line+'<div class="dp-today-list">');};
 const oldMore=dpTodayMorePage;
 dpTodayMorePage=function(){const html=oldMore(),line=todayDigest(dpAllTodayAttentionItems());
  return html.replace('<div class="dp-today-list">',line+'<div class="dp-today-list">');};
 const labelFor=code=>({
  'low-score-priority':locale('今日分數偏低 · 優先查看','Low daily score · review first','今日の低スコア・優先確認','오늘 낮은 점수·먼저 확인'),
  'persistent-low-score':locale('連續多天偏低 · 查看7天紀錄','Low for consecutive days · review 7-day trend','低スコア継続・7日間を確認','연속 낮은 점수·7일 추세 확인'),
  'low-score':locale('今日核心分數低於90','Core score below 90 today','本日の主要スコア90未満','오늘 주요 점수 90 미만'),
  'physiological-event':locale('已記錄的生理變化 · 回看詳情','Recorded physiological change · review details','記録された生理変化・詳細確認','기록된 생리 변화·상세 확인'),
  'scheduled-time-passed':locale('原定時間已到 · 待確認是否完成','Scheduled time passed · confirm status','予定時刻経過・実施確認','예정 시간 경과·완료 여부 확인'),
  'scheduled-today':locale('今天安排的用藥 · 待確認','Medication scheduled today · awaiting confirmation','本日の投薬予定・要確認','오늘 투약 예정·확인 필요'),
  'exam-review':locale('今天有體檢紀錄需要查看','Exam record needs review today','本日の検査結果を確認','오늘 검사 결과 확인'),
  'care-plan':locale('照護安排需核對完成狀態','Check completion of care plan','ケア予定の実施確認','돌봄 일정 완료 여부 확인'),
  'today-message':locale('今天有未讀留言','Unread message from today','本日の未読メッセージ','오늘 읽지 않은 메시지'),
  'today-care':locale('今天需要處理的健康紀錄','Care record to handle today','本日確認する健康記録','오늘 처리할 건강 기록')
 })[code]||locale('今日需留意','Review today','本日確認','오늘 확인');
 const oldActionCard=dpTodayActionCard;
 dpTodayActionCard=function(item){const html=oldActionCard(item),decision=intelligence()?.todayDecision([item],{nowMinutes:nowMinutes()});
  if(!decision)return html;
  return html.replace(/(<div class="ai-suggestion-sub">)[^<]*(<\/div>)/,(_,a,b)=>a+esc(labelFor(decision.reason(item)))+b);
 };
 const previousRender=render;
 render=function(reset=false){previousRender(reset);document.querySelectorAll('#app .app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.29');};
 // Public read-only source reused by the next explanation layer; the original
 // Health-owned records and the source of period context stay identical.
 root.dp1029PeriodCareRows=periodCareRows;
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.29',integrity:[...(root.DeepPetRelease?.integrity||[]),'dated-extreme-and-adjacent-day-summary','long-range-care-context-no-causality','today-actionable-priority-explanations','event-score-label-consistency','architecture-and-waveforms-preserved']};
})(window);
