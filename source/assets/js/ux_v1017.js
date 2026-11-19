/* DeepPet V10.17 — interpret existing models inside their original pages.
 * Home/Deep = today; Health review = longitudinal events; Me = long-term model/baseline.
 */
(function(root){'use strict';
 const Core=root.DeepPetInsights1018;if(!Core)return;
 const L=(tw,cn,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'?cn:tw;
 const e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const score=x=>root.DeepPetMetric1015?.format('score',x)??(finite(x)?String(Math.round(x)):'—');
 const day=()=>typeof iso==='function'?iso(localDate()):new Date().toISOString().slice(0,10);
 const fresh=()=>selectedBlank()||dp58FreshPet()||isFreePet();

 function modelExplanation(){
  const m=root.DeepPetAudit925?.model?.(state.dog);
  const result=Core.explainModel(m);
  if(!result.available)return `<div class="dp1017-explain"><b>${L('目前無法解釋長期分數','目前无法解释长期分数','Long-term score unavailable','長期スコアは未表示','장기 점수 없음')}</b><p>${L('有效的長期資料尚不足；不推算分數來源或生理年齡。','有效长期数据不足；不推算评分来源或生理年龄。','Not enough valid longitudinal evidence; no score or age is inferred.','有効な長期記録が不足しているため推定しません。','유효한 장기 기록이 부족해 추정하지 않습니다.')}</p></div>`;
  const component=result.physiology===null||result.rhythm===null?L('分項資料尚不完整','分项数据尚不完整','Component values not fully available','内訳はまだ不完全です','세부 점수가 부족합니다'):
   `${L('近30天有效日均分','近30天有效日均分','Valid-day means over 30 days','直近30日の有効日平均','최근 30일 유효일 평균')}：${L('生理狀態','生理状态','Physiological status','生理状態','생리 상태')} ${score(result.physiology)} × 75% + ${L('生理節奏','生理节奏','Physiological rhythm','生理リズム','생리 리듬')} ${score(result.rhythm)} × 25%`;
  const rounding=L('分項只顯示整數，實際以未四捨五入的均值加權後再取整，因此手算可能差1分。','分项仅显示整数，实际先使用未舍入的均值加权再取整，因此手算可能相差1分。','Components are displayed as integers; final weighting uses unrounded means, so hand calculations may differ by one point.','表示は整数ですが計算には丸め前の値を使用するため、1点の差が出る場合があります。','표시 수치는 정수이지만 실제 계산은 반올림 전 평균값을 사용해 최대 1점 차이가 날 수 있습니다.');
  const major=result.mainFactor==='physiology'?L('生理狀態分項對整體扣分影響較大','生理状态分项对整体扣分影响较大','The physiological-status component contributes more to the score gap','生理状態の寄与が大きい','생리 상태의 영향이 더 큽니다'):
   result.mainFactor==='rhythm'?L('生理節奏分項對整體扣分影響較大','生理节奏分项对整体扣分影响较大','The rhythm component contributes more to the score gap','生理リズムの寄与が大きい','생리 리듬의 영향이 더 큽니다'):
   result.mainFactor==='balanced'?L('兩個分項對整體扣分的影響接近','两个分项对整体扣分的影响接近','Both components contribute similarly','両項目の寄与はほぼ同じ','두 항목의 영향이 비슷합니다'):
   L('目前無法判定哪個分項影響較大','目前无法判定哪个分项影响较大','The main component cannot be determined','主な項目は特定できません','주요 항목을 특정할 수 없습니다');
  const exam=result.examUsed?(result.examEffect>0?
   L(`參考 ${result.examDate} 的體檢紀錄後，整體分數較量測綜合分降低 ${result.examEffect} 分；體檢不會把偏低的生理分數調高。`,`参考 ${result.examDate} 的体检记录后，整体分数比量测综合分降低 ${result.examEffect} 分；体检不会抬高偏低的生理分数。`,`The exam dated ${result.examDate} reduced the sensor composite by ${result.examEffect} points; an exam cannot raise an already low sensor score.`,`検診 ${result.examDate} の結果により ${result.examEffect} 点低下。低い測定スコアを引き上げません。`,`검진 ${result.examDate} 반영으로 ${result.examEffect}점 감소했으며 낮은 센서 점수를 올리지 않습니다.`):
   L(`已參考 ${result.examDate} 的體檢紀錄；本次沒有降低整體分數。`,`已参考 ${result.examDate} 的体检记录；本次没有降低整体分数。`,`The exam dated ${result.examDate} was considered without reducing the score.`,`検診 ${result.examDate} を参照し、点数に減点はありません。`,`검진 ${result.examDate} 기록은 참고했지만 감점은 없습니다.`)):
   L('本次長期模型沒有採用可用的體檢分數；不推測未記錄的體檢結果。','本次长期模型没有采用可用的体检分数；不推测未记录的结果。','No eligible exam score was used; missing test results are not inferred.','今回参照できる検診スコアはありません。','이번 분석에 적용된 검진 점수는 없습니다.');
  const age=result.ageAvailable?L('AI 生理年齡由同一個長期健康分數推算；健康分數較低，估計年齡較高。這是健康觀察指標，不是實際壽命或疾病診斷。','AI 生理年龄来自同一个长期健康分数；健康分数较低时估计年龄较高。这是健康观察指标，不是实际寿命或疾病诊断。','Estimated wellness age follows the same long-term score inversely. It is a wellness index, not a lifespan prediction or diagnosis.','推定年齢は長期スコアに逆連動する健康指標であり、寿命や診断ではありません。','추정 건강 나이는 장기 점수에 반비례하는 참고 지표이며 수명 예측이나 진단이 아닙니다.'):
   L('目前資料不足以顯示 AI 生理年齡；不以空缺資料推算。','目前资料不足以显示 AI 生理年龄；不以缺失数据推算。','Insufficient evidence for an estimated wellness age.','推定年齢を表示するための記録が不足しています。','추정 건강 나이를 표시하기에 기록이 부족합니다.');
  return `<div class="dp1017-explain" data-insight-pet="${e(state.dog)}" data-period="30d"><b>${L('這次分數為什麼是','这次分数为什么是','Why this score is','今回のスコアの根拠','이번 점수의 근거')} ${score(result.score)}？</b><p>${e(component)}</p><p>${e(rounding)}</p><p>${e(major)}。${e(L('這是數學權重的影響，不代表已找出疾病原因。','这是数学权重的影响，不代表已找到疾病原因。','This describes score weighting, not a medical cause.','重み付けの説明であり、病因の特定ではありません。','점수 가중치 설명이며 질병 원인 판단은 아닙니다.'))}</p><p>${e(exam)}</p><p>${e(age)}</p><p>${e(L('此30天模型不會直接將寵物與其他寵物排名；群體參考只在有適用且可靠資料的項目中使用。','此30天模型不直接给宠物做群体排名；仅在参考数据适用且可靠时使用群体基准。','This 30-day model does not rank pets against other pets. Group references require suitable verified evidence.','この30日モデルは他のペットとの順位付けをしません。','이 30일 모델은 다른 반려동물과 순위를 비교하지 않습니다.'))}</p></div>`;
 }

 function stageCopy(phase){
  switch(phase.key){
   case 'no-profile':return L('尚未建立寵物基本資料；先完成姓名、品種、年齡與體重。','尚未建立宠物基本资料；先填写名称、品种、年龄及体重。','Set up this pet’s name, breed, age and weight first.','まず名前・品種・年齢・体重を登録してください。','이름·품종·나이·체중을 먼저 등록하세요.');
   case 'no-evidence':return L('已可保留寵物基本資料，但尚無健康監測紀錄；目前不顯示健康基準。','可保留宠物基本资料，但尚无健康监测记录；目前不显示健康基准。','The pet profile is available, but no monitoring history exists yet. No baseline is shown.','基本情報はありますが測定記録がないため、基準は表示しません。','기본 정보는 있으나 측정 기록이 없어 기준을 표시하지 않습니다.');
   case 'collecting':return L(`已累積 ${phase.days}/14 個有效日，還需 ${phase.missing} 個有效日；日期無須連續。`,`已累计 ${phase.days}/14 个有效日，还需要 ${phase.missing} 个有效日；不要求连续。`,`Collected ${phase.days}/14 valid days; ${phase.missing} more needed. Days need not be consecutive.`,`有効日 ${phase.days}/14 日。あと ${phase.missing} 日、連続でなくても構いません。`,`유효일 ${phase.days}/14일, ${phase.missing}일 추가 필요하며 연속일 필요는 없습니다.`);
   case 'ready-next-day':return L('今天剛達到14個有效日。今天的分數不追溯改算；下一個有效量測日才開始使用完整自身基準。','今天刚达到14个有效日。今天的分数不追溯重算；下一个有效量测日才开始使用完整自身基准。','The 14th valid day is complete. Today’s score is not revised; the full baseline begins with the next valid day.','14有効日に到達しました。今日の点数は再計算せず、次の有効日から適用します。','14일이 충족되었습니다. 오늘 점수는 재계산하지 않고 다음 유효일부터 적용합니다.');
   default:return L('已建立寵物自身基準，可用來對照後續有效日的變化；今日分數仍屬今日，長期結果仍屬長期。','已建立宠物自身基准，可用于对比后续有效日的变化；今日分数与长期结果分别计算。','Pet-specific baseline established for subsequent valid days; daily and long-term scores remain separate.','自身基準を作成しました。日別と長期のスコアは別々です。','반려동물 자체 기준이 준비되었습니다. 일일 점수와 장기 결과는 별개입니다.');
  }
 }

 function insertBaseline(app){
  const standalone=app.querySelector('.dp-baseline-standalone');if(!standalone)return;
  let phase;
  if(fresh())phase=Core.baselineStage(null,{hasProfile:!selectedBlank()});
  else phase=Core.baselineStage(baselineProfile(),{today:day()});
  const target=standalone.querySelector('.baseline-phase-status')||standalone.querySelector('.dp938-empty-baseline-score');
  if(!target||standalone.querySelector('.dp1017-baseline-interpretation'))return;
  if(phase.key==='ready-next-day'){
   const heading=standalone.querySelector('.baseline-stage-head h3');
   if(heading)heading.textContent=L('14個有效日已完成 · 待下一有效日啟用','14个有效日已完成 · 待下一个有效日启用','14 valid days complete · activates on next valid day','14有効日完了・次の有効日から適用','유효 14일 완료 · 다음 유효일부터 적용');
   const stage=standalone.querySelector('.dp-baseline-stage-card strong');
   if(stage)stage.textContent=L('待下一有效日啟用','待下一个有效日启用','Pending next valid day','次の有効日から適用','다음 유효일 대기');
  }
  if(phase.key==='no-evidence'){
   const small=standalone.querySelector('.dp938-empty-baseline-score small');
   if(small)small.textContent=L('尚無健康監測資料','尚无健康监测数据','No monitoring history yet','測定記録はまだありません','아직 측정 기록이 없습니다');
  }
  target.insertAdjacentHTML('afterend',`<p class="dp1017-baseline-interpretation" data-baseline-stage="${e(phase.key)}" data-scope="45-calendar-days">${e(stageCopy(phase))}</p>`);
 }

 function eventComparison(){
  const period=state.healthSummaryDays===30?30:7;
  const source=root.DeepPetTrust1013?.evidence?.(period,state.dog),records=root.DeepPetUX999?.care?.()||[];
  if(!source)return '';
  const comparison=Core.compareEvents(source.rows,records,{start:source.start,end:source.date,windowDays:3,maxEvents:3,petId:state.dog});
  const title=L('健康事件前後的分數對照','健康事件前后的分数对照','Scores before and after recorded events','記録前後のスコア比較','건강 기록 전후 점수 비교');
  const intro=L('只比對事件前3天與後3天各至少2個實際有效評分日；事件當天不計入。','仅对比事件前后各3天内至少2个有效评分日；事件当天不计入。','Compares at least two actual valid scored days within the three calendar days before and after each event; excludes the event day.','記録日前後3日間で各2日以上の有効記録がある場合のみ比較します。','기록일 전후 3일간 각 2일 이상의 유효 점수만 비교합니다.');
  const span=(v)=>!finite(v)?'—':`${v>0?'+':v<0?'−':''}${Math.abs(v).toFixed(1)}`;
  const names={med:L('用藥','用药','Medication','投薬','투약'),vaccine:L('疫苗','疫苗','Vaccine','予防接種','접종'),exam:L('體檢','体检','Checkup','健診','검진'),food:L('飲食','饮食','Food','食事','식사'),activity:L('活動','活动','Activity','活動','활동'),recovery:L('恢復','恢复','Recovery','回復','회복'),note:L('記錄','记录','Note','記録','기록')};
  const entries=comparison.compared.map(row=>{
   const labels=row.events.map(item=>`${names[item.type]||names.note} · ${item.title}`).slice(0,3);
   const extra=row.eventCount>3?L(`，另有 ${row.eventCount-3} 條`,`，另有 ${row.eventCount-3} 条`,`, plus ${row.eventCount-3} more`,`、他 ${row.eventCount-3} 件`,` 외 ${row.eventCount-3}건`):'';
   const overlap=row.multipleEvents?L('同日有多項健康事件，無法將變化歸因於其中一項。','同日有多项健康事件，无法将变化归因于其中一项。','Several events occurred on this date; changes cannot be assigned to one event.','同日に複数の記録があり、個別の影響は特定できません。','같은 날 여러 기록이 있어 개별 원인을 판단할 수 없습니다.'):row.overlappingOtherEvents?L('比較期間還有其他健康事件，無法分離各自影響。','比较期间还有其他健康事件，无法区分各自影响。','Other events overlap these comparison days; separate effects cannot be determined.','比較期間中に他の記録もあり、影響は分離できません。','비교 기간에 다른 기록도 있어 영향을 분리할 수 없습니다.') :'';
   return `<li><strong>${e(row.date)} · ${labels.map(e).join(' / ')}${e(extra)}</strong><span>${e(L('生理狀態','生理状态','Physiological status','生理状態','생리 상태'))} ${span(row.physiologyDelta)} ${e(L('分','分','pts','点','점'))} · ${e(L('生理節奏','生理节奏','Physiological rhythm','生理リズム','생리 리듬'))} ${span(row.rhythmDelta)} ${e(L('分','分','pts','点','점'))}</span><small>${e(L(`前 ${row.beforeDays} 個有效日／後 ${row.afterDays} 個有效日`,`前 ${row.beforeDays} 个有效日／后 ${row.afterDays} 个有效日`,`${row.beforeDays} days before / ${row.afterDays} days after`, `前 ${row.beforeDays} 日／後 ${row.afterDays} 日`,`이전 ${row.beforeDays}일 / 이후 ${row.afterDays}일`))}${overlap?` · ${e(overlap)}`:''}</small></li>`;
  }).join('');
  const fallback=e(comparison.recordedEvents?L('這段期間的記錄尚缺足夠的事件前後有效分數；保留紀錄，不推測效果。','这段期间的记录缺少足够的事件前后有效分数；保留记录，不推测效果。','Not enough valid before/after scores for recorded events. No effect is inferred.','比較できる前後の有効記録が不足しています。','전후 유효 점수가 부족해 효과를 추정하지 않습니다.'):
   L('這段期間沒有可比對的已記錄健康事件。','这段期间没有可对比的健康事件记录。','No recorded care event to compare in this period.','比較できる記録はありません。','비교할 기록이 없습니다.'));
  const hidden=comparison.limitedForDisplay?`<p class="dp1017-causality">${e(L(`另有 ${comparison.limitedForDisplay} 個日期有可比對記錄，請在原健康記錄中查看；此處僅展示最近3個。`,`另有 ${comparison.limitedForDisplay} 个日期可对比，此处仅展示最近3个。`,`${comparison.limitedForDisplay} more comparable date(s); this section shows the latest three.`,`他 ${comparison.limitedForDisplay} 件の比較可能日があります。`,`비교 가능한 날짜 ${comparison.limitedForDisplay}개가 더 있습니다.`))}</p>`:'';
  return `<div class="dp1017-event-interpretation" data-period="${period}d" data-evidence-pet="${e(state.dog)}"><h4>${e(title)}</h4><p>${e(intro)}</p>${entries?`<ul>${entries}</ul>`:`<p>${fallback}</p>`}${hidden}<p class="dp1017-causality">${e(L('前後變化只表示時間上的關聯，不能認定是藥物、疫苗、飲食或活動造成，也不能代表治療效果。','前后变化只表示时间相关，不能认定由药物、疫苗、饮食或活动造成，也不代表治疗效果。','Before/after differences show timing only, not causation, a treatment effect or a diagnosis.','前後の変化から因果関係や治療効果を判断できません。','전후 변화는 시간적 연관일 뿐 인과관계나 치료 효과를 뜻하지 않습니다.'))}</p></div>`;
 }

 const previous=render;
 render=function(reset=false){
  previous(reset);
  const app=document.getElementById('app');if(!app)return;
  const daily=state.tab==='home'&&!state.detail?app.querySelector('.dp-summary-lanes'):null;
  if(daily)daily.dataset.timeScope='calendar-day';
  const deep=state.tab==='deep'&&!state.detail?app.querySelector('.dp-owner-deep'):null;
  if(deep)deep.dataset.timeScope=state.range===30?'30-calendar-days':state.range===14?'14-calendar-days':state.range===7?'7-calendar-days':'calendar-day';
  if(state.tab==='me'&&state.detail==='age-detail'){
   const card=app.querySelector('.dp1015-evidence-content');
   if(card&&!card.querySelector('.dp1017-explain'))card.insertAdjacentHTML('afterbegin',modelExplanation());
   const modelCard=app.querySelector('.dp928-model-card');if(modelCard)modelCard.dataset.timeScope='30-calendar-days';
  }
  if(state.tab==='me'&&state.detail==='baseline-page')insertBaseline(app);
  if(state.tab==='health'&&state.detail==='summary'&&!fresh()){
   const body=app.querySelector('.dp1013-event-content');
   if(body&&!body.querySelector('.dp1017-event-interpretation'))body.insertAdjacentHTML('beforeend',eventComparison());
   app.querySelectorAll('.dp850-score-panel').forEach(x=>x.dataset.timeScope=state.healthSummaryDays===30?'30-calendar-days':'7-calendar-days');
  }
  app.querySelectorAll('.app-build-version').forEach(x=>x.textContent='DeepPet · Version 10.18');
 };
 root.DeepPetUX1017=Object.freeze({version:'10.18',modelExplanation,eventComparison,stageCopy});
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.18',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'model-score-explanation-from-existing-engine','baseline-stage-honest-transition','same-day-events-share-one-comparison','reference-null-safe','daily-vs-long-term-scope-preserved']};
})(window);
