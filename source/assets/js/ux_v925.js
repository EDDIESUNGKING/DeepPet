/* DeepPet V9.25 | Consumer-facing split: TODAY is TODAY; Me is 30-day wellness. */
(function(root){'use strict';
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const h=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const t=(zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?(ja||en):state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const n=x=>finite(x)?String(Math.round(x)):'—';
 const pct=x=>`${(x*100).toFixed(1)}%`;
 const petData=(pet,index)=>({petId:String(index),age:pet.age,weight:pet.weight,species:pet.species});
 const model=(index=state.dog)=>{
  const asOf=typeof iso==='function'?iso(localDate()):new Date().toISOString().slice(0,10);
  // Never silently use Milo when a stale/invalid pet ID is requested.
  // Keep the same N/A object contract so Home and Me remain safe to render.
  const base=Number.isInteger(index)&&index>=0?allPets()[index]:null;
  if(!base)return root.DeepPetWellness925.evaluate([],null,{},null,asOf);
  const days=root.DeepPetSignalScoring?.getDaily(index)||[];
  const pet={...base,...(state.petOverrides?.[index]||{})};
  const records=typeof root.dp914ReportRecords==='function'?root.dp914ReportRecords(index):[];
  const exam=root.DeepPetLabEvidence?.assess(records,{...pet,petId:String(index)},asOf)||null;
  return root.DeepPetWellness925.evaluate(days,exam,petData(pet,index),(age,_,r)=>root.DeepPetBCG?.biologicalAge(age,[],r),asOf);
 };
 const color=s=>!finite(s)?'#94a3b8':s>=90?'#249c70':s>=80?'#3c91cc':s>=60?'#e89a32':'#de5b65';
 const grade=s=>!finite(s)?t('尚無長期結果','Long-term result pending','장기 결과 없음','長期結果を準備中'):s>=90?t('健康','Healthy','양호','良好'):s>=80?t('低風險','Mild','낮은 위험','軽度'):s>=60?t('中風險','Moderate','보통 위험','中程度'):t('需要留意','Needs attention','주의 필요','要注意');
 const empty=()=>selectedBlank()||dp58FreshPet()||isFreePet();
 // Consumer results use one shared card in Home, Me and the full-detail page.
 const title=()=>t('寵物健康模型','Pet Wellness Model','반려동물 건강 모델','ペット健康モデル');
 const scoreText=v=>root.DeepPetMetric1015?.format('score',v)??(finite(v)?Math.round(v):'—');
 const ageText=v=>root.DeepPetMetric1015?.format('age',v)??(finite(v)?v.toFixed(1):'—');
 const diffText=(m)=>{
   if(!finite(m.ageYears)||!finite(m.actualAge))return t('累積監測後顯示比較','Comparison appears with more readings','추가 측정 후 비교','記録が増えると比較できます');
   // Derive the spoken difference from the SAME displayed one-decimal values.
   // Rounding the unrendered raw difference separately can claim, for example,
   // "4.3 - 0.0 = 4.2" even though the visible numbers disagree.
   const actual=ageText(m.actualAge),current=ageText(m.ageYears);
   const d=root.DeepPetMetric1015?.difference('age',m.ageYears,m.actualAge)??Math.round((Number(current)-Number(actual))*10)/10;
   const ad=ageText(Math.abs(d));
   // Consumer copy identifies the result, never exposes arithmetic steps.
   if(d<0)return `${t('較實際年齡年輕','Younger than actual age by','실제 나이보다 젊음','実年齢より若い')} ${ad} ${t('歲','years','세','歳')}`;
   if(d>0)return `${t('較實際年齡年長','Older than actual age by','실제 나이보다 많음','実年齢より高い')} ${ad} ${t('歲','years','세','歳')}`;
   return t('與實際年齡接近','Close to actual age','실제 나이와 비슷','実年齢に近い');
 };
 function dotRing(v){
   const count=48,active=finite(v)?Math.round(Math.max(0,Math.min(100,v))*count/100):0,c=color(v);
   const dots=Array.from({length:count},(_,i)=>{
     const a=(i/count)*Math.PI*2-Math.PI/2,x=68+55*Math.cos(a),y=68+55*Math.sin(a);
     return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.8" fill="${i<active?c:'#dfe6f1'}" />`;
   }).join('');
   return `<div class="dp928-ring" role="img" aria-label="${h(t('整體健康評分','Overall wellness score','전체 점수','総合スコア'))}: ${scoreText(v)}"><svg viewBox="0 0 136 136" aria-hidden="true">${dots}</svg><span class="dp928-ring-center" style="color:${c}">${scoreText(v)}<small>${finite(v)?'/100':''}</small></span></div>`;
 }
 const modelNote=m=>m.stale&&m.lastObservedDate?t(`最近一次有效監測：${m.lastObservedDate}。近期沒有新資料。`,`Last valid reading: ${m.lastObservedDate}. No recent data.`,`최근 측정: ${m.lastObservedDate}`,`最終測定：${m.lastObservedDate}`):!m.available?t('累積有效監測後顯示長期結果','Long-term results appear after sufficient monitoring','측정이 쌓이면 결과가 나타납니다','記録が増えると結果を表示'):'';
 function sharedModelCard(m,detailMode=false){
   return `<${detailMode?'div':'button'} class="card dp928-model-card ${detailMode?'dp928-in-detail':''}" ${detailMode?'':'type="button" data-action="dp925-wellness-open"'}>
    <div class="dp928-model-head"><span class="dp928-model-symbol">✦</span><span class="dp928-model-title"><b>${detailMode?t('近三十天身體健康數據分析','Analysis of Body Health Data over the Last 30 Days','최근 30일 신체 건강 데이터 분석','過去30日間の健康データ分析'):title()}</b><small>${t('最近 30 天','Last 30 days','최근 30일','直近30日')}</small></span>${detailMode?'':'<span class="dp928-model-arrow">›</span>'}</div>
    <div class="dp928-metric-grid"><div class="dp928-wellness-metric"><small>${t('整體健康評分','Overall wellness score','전체 건강 점수','総合健康スコア')}</small>${dotRing(m.score)}<span class="dp928-grade" style="color:${color(m.score)}">${grade(m.score)}</span></div>
    <div class="dp928-age-metric"><small>${t('AI 推算生理年齡','AI-estimated wellness age','AI 추정 나이','AI 推定年齢')}</small><div class="dp928-age-shimmer"><span class="dp928-age-sparkle">✧</span><span class="dp928-age-comparison">${diffText(m)}</span><div><strong>${ageText(m.ageYears)}</strong><em>${t('歲','years','세','歳')}</em></div></div><span class="dp928-actual">${t('實際年齡','Actual age','실제 나이','実際の年齢')} ${ageText(m.actualAge)} ${t('歲','years','세','歳')}</span></div></div>
    <div class="dp928-model-foot">${modelNote(m)?`<span>${modelNote(m)}</span>`:''}${detailMode?'':`<strong>${t('查看分析來源','View analysis sources','분석 출처 보기','分析元を見る')} ›</strong>`}</div>
   </${detailMode?'div':'button'}>`;
 }
 function modelCard(){return sharedModelCard(model(),false);}
 const dateMs=x=>Date.parse(x+'T12:00:00Z');
 function historyModels(pet,index){
   const all=root.DeepPetSignalScoring?.getDaily(index)||[];
   const today=typeof iso==='function'?iso(localDate()):new Date().toISOString().slice(0,10);
   const list=all.filter(r=>r&&/^\d{4}-\d{2}-\d{2}$/.test(r.date||'')&&Number.isFinite(r.scores?.physiol)&&Number.isFinite(r.scores?.rhythm)&&r.date<=today).sort((a,b)=>a.date.localeCompare(b.date));
   const recent=list.filter(r=>dateMs(today)-dateMs(r.date)<30*86400000);
   const reports=typeof root.dp914ReportRecords==='function'?root.dp914ReportRecords(index):[];
   const currentAge=Number(pet.age),todayMs=dateMs(today);
   const compute=(rows,date)=>{
     const pastAge=Math.max(0.05,currentAge-(todayMs-dateMs(date))/(365.25*86400000));
     const samePet={...pet,age:pastAge};
     const exam=root.DeepPetLabEvidence?.assess(reports,{...samePet,petId:String(index)},date)||null;
     // Compare 30-day wellness age at one fixed chronological age so the two
     // trend curves have exactly inverse directions (no day-to-day age drift).
     return root.DeepPetWellness925.evaluate(rows,exam,{petId:String(index),age:currentAge,weight:pet.weight,species:pet.species},null,date);
   };
   const gallery=index>=0&&index<15&&typeof dpUsesRealMeasurements==='function'&&!dpUsesRealMeasurements(index)&&!pet.dpFixtureInvalidated;
   return recent.map(r=>{
     const observed=compute(list.filter(x=>x.date<=r.date),r.date);
     if(!gallery)return {date:r.date,...observed};
     // The 30-day summary is a long-term average and can correctly stay
     // almost flat. The CHART is explicitly the per-day wellness signal;
     // it uses the original engine's valid daily scores (never random noise).
     // Keep the shared 75/25 weighting and derive age from this same score,
     // ensuring higher daily wellness always maps to lower estimated age.
     const daily=Math.round(.75*r.scores.physiol+.25*r.scores.rhythm);
     const age=root.DeepPetWellness925.ageFromScore(currentAge,daily);
     return {date:r.date,...observed,available:true,score:daily,ageYears:age?.ageYears??null,dailyGallerySignal:true};
   });
 }
 function lineChart(points,key,units){
   const rows=points.filter(x=>finite(x[key])&&x.available);
   if(rows.length<2)return `<div class="dp928-no-chart">${t('有效趨勢資料正在累積','Trend data is building','추세 데이터 수집 중','記録を蓄積中')}</div>`;
   const W=360,H=178,L=46,R=11,T=15,B=32;
   const arr=rows.map(x=>x[key]),mn=Math.min(...arr),mx=Math.max(...arr),agePad=Math.max(.025,(mx-mn)*.18);
   let lo=key==='score'?Math.max(0,Math.floor((mn-2)/5)*5):Math.floor((mn-agePad)*10)/10;
   let hi=key==='score'?Math.min(100,Math.max(lo+1,Math.ceil((mx+2)/5)*5)):Math.ceil((mx+agePad)*10)/10;
   // In age mode five ticks are each shown with one decimal: use a minimum
   // four-tenths range to avoid visually duplicated labels (4.2, 4.2, 4.3...).
   if(key!=='score'&&hi-lo<.4){const middle=(lo+hi)/2;lo=Math.floor((middle-.2)*10)/10;hi=Number((lo+.4).toFixed(1));}
   const span=Math.max(.1,hi-lo),valOf=r=>r[key],xFor=d=>L+(dateMs(d)-dateMs(rows[0].date))/Math.max(1,dateMs(rows.at(-1).date)-dateMs(rows[0].date))*(W-L-R),yFor=v=>T+(hi-v)/span*(H-T-B);
   // All 15 investor-gallery pets represent continuous wearing. Join their
   // existing observed data points without editing any score or age fixture.
   // Once a REAL pet has a missing/invalid calendar day, retain the gap.
   const showcaseContinuous=typeof state!=='undefined'&&state.dog>=0&&state.dog<15&&typeof dpUsesRealMeasurements==='function'&&!dpUsesRealMeasurements()&&typeof currentDog==='function'&&!currentDog().dpFixtureInvalidated;
   const line=rows.map((p,i)=>`${i&&(showcaseContinuous||dateMs(p.date)-dateMs(rows[i-1].date)===86400000)?'L':'M'}${xFor(p.date).toFixed(1)} ${yFor(valOf(p)).toFixed(1)}`).join(' ');
   const displayTick=value=>root.DeepPetMetric1015?.format(key==='score'?'score':'age',value)??(key==='score'?String(Math.round(value)):value.toFixed(1));
   const ticks=[0,1,2,3,4].map(i=>{const value=lo+(hi-lo)*i/4,y=yFor(value);return `<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" stroke="#e8edf5"/><text x="${L-7}" y="${y+3}" font-size="10" text-anchor="end" fill="#8793aa">${displayTick(value)}</text>`}).join('');
   const start=rows[0].date.slice(5),end=rows.at(-1).date.slice(5);
   const dots=rows.map(p=>`<circle class="dp938-trend-point" data-date="${p.date}" data-value="${displayTick(valOf(p))}" data-unit="${h(units)}" cx="${xFor(p.date)}" cy="${yFor(valOf(p))}" r="4" fill="${key==='score'?'#368fc0':'#8b6bd5'}"><title>${p.date}: ${displayTick(valOf(p))} ${units}</title></circle>`).join('');
   return `<div class="dp928-trend-graphic"><svg data-dp938-chart="${key}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${h(units)} trend, ${h(start)} to ${h(end)}"><text x="${L}" y="10" font-size="10" fill="#657590">${units}</text>${ticks}<path d="${line}" fill="none" stroke="${key==='score'?'#368fc0':'#8b6bd5'}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>${dots}<text x="${L}" y="${H-9}" font-size="10" fill="#7b8ba3">${start}</text><text x="${W-R}" y="${H-9}" text-anchor="end" font-size="10" fill="#7b8ba3">${end}</text><text x="${W/2}" y="${H-1}" text-anchor="middle" font-size="10" fill="#7b8ba3">${t('日期','Date','날짜','日付')}</text></svg></div>`;
 }
 const factor=(name,sub,to,icon)=>`<button type="button" class="dp928-factor-button dp938-factor-${to}" data-action="dp928-source" data-target="${to}"><span class="dp938-factor-icon" aria-hidden="true">${icon}</span><span><b>${name}</b><small>${sub}</small></span><span class="dp938-factor-arrow" aria-hidden="true">↗</span></button>`;
 function detail(){
  const m=model(),pet=currentDog();const chartData=historyModels(pet,state.dog);
  return `<div class="app-pad dp-independent-page dp928-wellness-page"><header class="dp-independent-head dp928-page-header"><button type="button" data-action="dp928-model-back" aria-label="${t('返回','Back','뒤로','戻る')}">←</button><b>${title()}</b></header>
   ${sharedModelCard(m,true)}
   <section class="dp928-detail-panel"><div class="dp928-panel-heading"><span class="dp928-heading-icon">◉</span><div><h3>${t('近 30 天健康趨勢','30-day wellness trend','30일 건강 추세','30日健康推移')}</h3><p>${t('查看每日的健康變化；上方為整段期間的健康結果','Daily wellness changes and the overall period result','일별 건강 변화와 기간 전체 결과','日別の健康変化と期間全体の結果')}</p></div></div>${lineChart(chartData,'score',t('分','Score','점','点'))}</section>
   <section class="dp928-detail-panel"><div class="dp928-panel-heading"><span class="dp928-heading-icon dp928-age-icon">✧</span><div><h3>${t('AI 推算生理年齡趨勢','AI wellness age trend','AI 추정 나이 추세','AI 推定年齢推移')}</h3><p>${t('追蹤健康狀態對應的年齡估計，並非實際生物年齡或壽命預測','A wellness-age estimate, not biological age or lifespan prediction','건강 추세 추정치이며 실제 생물학적 나이는 아닙니다.','健康傾向の推定値で、生物学的年齢ではありません。')}</p></div></div>${lineChart(chartData,'ageYears',t('歲','Years','세','歳'))}</section>
   <section class="dp928-detail-panel"><div class="dp928-panel-heading"><span class="dp928-heading-icon">✦</span><div><h3>${t('查看分析來源','Analysis sources','분석 출처','分析元')}</h3><p>${t('分別查看兩項結果所使用的資訊類別','The information sources for each result are listed separately','두 결과의 자료 출처를 구분했습니다.','2つの結果の資料元を分けて表示')}</p></div></div>
   <div class="dp1054-source-groups"><div><h4>${t('整體健康評分來源','Overall wellness score sources','종합 건강 점수 출처','総合健康スコアの資料元')}</h4><p>${t('近期心跳、呼吸、HRV、心搏節奏、睡眠休息、精力與活動後恢復、放鬆與平穩度，以及符合適用條件的體檢紀錄。','Recent heart rate, breathing, HRV, beat regularity, sleep, activity, post-exercise recovery, calm/steadiness and eligible checkup records.','심박, 호흡, HRV, 심박 리듬, 수면, 활동·회복 및 유효 검진 기록.','心拍、呼吸、HRV、心拍リズム、睡眠、活動・回復と有効な健診記録。')}</p></div><div><h4>${t('AI 推算生理年齡來源','AI-estimated wellness age sources','AI 추정 나이 출처','AI推定年齢の資料元')}</h4><p>${t('寵物實際年齡，以及上述整體健康評分的近期有效結果；心肺、睡眠、精力恢復、身體節奏及適用體檢資訊經由整體健康結果反映。','Chronological age and the recent overall wellness result above; the relevant cardio, sleep, energy/recovery, rhythm and checkup evidence feeds the overall wellness result.','실제 나이와 최근 종합 건강 점수 및 그 근거 자료.','実年齢と最近の総合健康スコア、その根拠となる資料。')}</p></div></div>
   ${factor(t('心肺、呼吸與心搏變化','Heart, breathing & rhythm','심박·호흡 추세','心肺・呼吸・心拍'),t('Deep · 心肺狀態','Deep · Cardio','Deep · 심폐','Deep · 心肺'),'cardio','♥')}
   ${factor(t('睡眠與休息','Sleep & rest','수면·휴식','睡眠と休息'),t('Deep · 睡眠休息','Deep · Rest','Deep · 휴식','Deep · 休息'),'sleep','☾')}
   ${factor(t('精力、活動與恢復','Energy, activity & recovery','활력·활동·회복','活動・回復'),t('Deep · 精力活動','Deep · Energy','Deep · 활력','Deep · 活動'),'energy','⌁')}
   ${factor(t('身體節奏與長期基準','Body rhythm & this pet’s baseline','몸 리듬·반려동물 자체 기준','リズム・この子の基準'),t('Me · 14 天健康基準','Me · 14-day baseline','Me · 14일 기준','Me · 14日基準'),'baseline','◎')}
   ${factor(t('體檢分析與歷史紀錄','Examinations & history','검진 분석·기록','検診分析・記録'),m.reportDate?t(`最近檢測：${m.reportDate}`,`Latest test: ${m.reportDate}`,`최근 검사: ${m.reportDate}`,`最終検査: ${m.reportDate}`):t('查看體檢報告','View reports','검진 보기','検診を見る'),'exams','✚')}
   </section><div class="footer-space"></div></div>`;
 }
 // Reuse the already-supported 'age-detail' route to avoid breaking existing
 // navigation and back behavior; replace its content rather than stacking pages.
 dpAgeFullPage=detail;
 const previousAction=onAction;
 onAction=function(el){
  if(el?.dataset?.action==='dp925-wellness-open'){state.dp928WellnessOrigin=state.tab;state.tab='me';state.detail='age-detail';state.modal='';render(true);return;}
  if(el?.dataset?.action==='dp928-model-back'){const origin=['home','health','me'].includes(state.dp928WellnessOrigin)?state.dp928WellnessOrigin:'me';state.tab=origin;state.detail=null;state.modal='';render(true);return;}
  if(el?.dataset?.action==='dp928-source'){const target=el.dataset.target;
    state.detail=null;state.modal='';
    if(target==='exams'){state.tab='health';render(true);root.DeepPetExam921?.showList?.();return;}
    if(target==='baseline'){state.tab='me';state.detail='baseline-page';render(true);return;}
    state.tab='deep';state.deepType=target==='sleep'?1:target==='energy'?2:0;state.range=30;render(true);return;
  }
  if(el?.dataset?.action==='dp925-open-exams'){state.tab='health';state.detail=null;state.modal='';render(true);root.DeepPetExam921?.showList?.();return;}
  return previousAction(el);
 };
 const priorRender=render;
 render=function(reset=false){priorRender(reset);
  const app=document.getElementById('app');if(!app)return;
  // No extra accuracy/completeness percentages in consumer UI.
  if(state.tab==='me'&&!state.detail&&!empty()){
   app.querySelectorAll('.dp68-age-me,.dp67-age,.dp73-age-card,.dp73-age-hero,.dp70-age-card,.dp73-age-preview,.dp73-age-box').forEach(x=>x.remove());
   const profile=app.querySelector('.profile-hero');if(profile&&!app.querySelector('.dp925-wellness-card'))profile.insertAdjacentHTML('afterend',modelCard());
  }
  if(state.tab==='home'&&!state.detail&&!empty()){
   const gps=app.querySelector('#dp-owner-gps-card');const focal=app.querySelector('.dp-today-focus');
   // Wellness model is exclusively under Me; Home summarizes TODAY only.
   app.querySelectorAll('.dp928-model-card').forEach(node=>node.remove());
   const alert=app.querySelector('.dp905-milo-demo,.dp66-urgent-card');
   if(alert&&!alert.querySelector('.dp925-urgent-note'))alert.insertAdjacentHTML('beforeend',`<p class="dp925-urgent-note">${t('這是需要關注的心跳／呼吸變化提示，不是呼吸停止或心臟驟停診斷。訊號遺失不等於生命徵象停止。如親眼發現呼吸困難、突然倒下、牙齦發藍或無反應，立即尋求獸醫急診。','These alerts show changes, not a diagnosis of stopped breathing or cardiac arrest. Loss of signal is not cessation of vital signs. Seek emergency veterinary care for breathing distress, collapse, blue gums or unresponsiveness.','신호 끊김은 호흡 정지를 의미하지 않습니다. 실제 응급 증상에는 즉시 진료를 받으세요.','信号途絶は呼吸停止ではありません。症状があれば直ちに獣医へ。')}</p>`);
  }
 };
 root.DeepPetAudit925={model,modelCard,day:(index=state.dog)=>root.DeepPetSignalScoring?.getDaily(index)||[],version:'9.90'};
})(window);
