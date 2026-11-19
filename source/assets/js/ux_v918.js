/* DeepPet V9.18 — score-lineage repair and interface consistency.
 * Presentation consumes DeepPetSignalScoring, never re-computes a competing score.
 * No risk diagnosis; quality/coverage is disclosed separately from health grades.
 */
(function(){'use strict';
const api=()=>window.DeepPetSignalScoring;
const valid=x=>typeof x==='number'&&Number.isFinite(x);
const text=(zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:zh;
const format=x=>valid(x)?String(Math.round(x)):'—';
const percent=x=>valid(x)?Math.round(x*100)+'%':'—';
const grade=x=>valid(x)?scoreLabel(x):text('資料不足','Insufficient data','자료 부족','データ不足');
function selected(){
 const all=api()?.getDaily(state.dog)||[];const length=Number(state.range||1);
 // 7/30-day panels always mean the latest calendar window. A previously
 // selected historical ONE-day date must not shift only this adapter backward.
 const days=length===1?[all.find(x=>x?.date===deepChosenDate())||null]:window.DeepPetBCG.calendarWindow(all,length,iso(localDate()));
 return {all,days:days.filter(Boolean),range:length,features:api()?.getFeatures(state.dog)||[]};
}
function value(days,key){const xs=days.map(x=>x?.scores?.[key]).filter(valid);return xs.length?Math.round(xs.reduce((a,b)=>a+b,0)/xs.length):null;}
function readout(days,key){const n=value(days,key),label=grade(n);return {score:n,label,days:days.filter(x=>valid(x?.scores?.[key])).length};}
function scoreWithCoverage(days,key){return ''; /* Internal validity handled by scoreDay; show only results. */}
function explain(key,ctx){
 const {days,features,range}=ctx,r=readout(days,key);
 const one=range===1;const present=days[0],feat=features.find(x=>x?.date===present?.date)||{};
 const lead=scoreWithCoverage(days,key);
 const loss=()=>text('本項缺少足夠有效訊號，不將未測得的指標補成高分。','Not enough valid signal; unmeasured indicators are not filled with invented scores.','유효 데이터 부족','有効な信号が不足しています。');
 if(!valid(r.score))return loss();
 switch(key){
 case 'heart':return lead+' '+text('依相同活動狀態下的心率與個體歷史作加權比較；這不是心電圖診斷。','Weighted comparison of heart-rate trends at similar activity levels against this pet’s history. Not an ECG diagnosis.','심박 추세와 개체 기준 비교','活動状態を揃えた心拍傾向との比較です。');
 case 'breath':return lead+' '+text('依安靜呼吸、呼吸波動及持續變化加權；需確認活動與配戴品質。','Weighted from quiet-time respiratory rate, variability and persistence; review movement and signal quality.','安静時呼吸と変動を比較します。','安静時呼吸と変動を比較します。');
 case 'hrv':{
  if(!days.some(x=>valid(x?.scores?.hrv)))return loss();
  const featuresByDate=new Map(features.filter(x=>x?.date).map(x=>[x.date,x]));
  const used=days.map(x=>featuresByDate.get(x?.date)).filter(x=>valid(x?.rmssd)&&valid(x?.sdnn));
  const mean=k=>used.length?(used.reduce((s,x)=>s+x[k],0)/used.length).toFixed(1):'—';
  return lead+' '+text(`RMSSD ${mean('rmssd')} ms（短期心搏間隔變化）；SDNN ${mean('sdnn')} ms（整段心搏間隔變化）。需可靠逐搏時間戳。`,`RMSSD ${mean('rmssd')} ms (short-term beat interval variation); SDNN ${mean('sdnn')} ms (overall interval variation). Requires validated beat timestamps.`,`RMSSD·SDNN은 검증된 박동 간격이 필요합니다.`,`RMSSD・SDNNには検証済みの拍動時刻が必要です。`);
 }
 case 'stable':return lead+' '+text('比較安靜時心率節奏的規律程度與個體基準，不等同 ECG 心律分析。','Quiet-time heart-rate pattern regularity relative to this pet’s history; not ECG rhythm analysis.','심박 리듬 추세','心拍傾向であり心電図診断ではありません。');
 case 'energy':return lead+' '+text('依動靜強度、規律性及休息比例推算；曲線的百分比是活動指數，不代表健康分數，越高不一定越好。','Uses motion level, regularity and rest. Percentages in the activity chart describe activity intensity—not health score; higher is not necessarily better.','활동 강도 지수입니다.','活動強度指数です。');
 case 'recovery':return lead+' '+text('活動停止後兩分鐘心率下降幅度，需與同一隻寵物相近強度的過往有效活動比較；沒有基準時不給分。','Two-minute post-activity heart-rate drop compared with previous similar-effort events; no score without a comparable baseline.','유사 활동 대비 회복 점수입니다.','同程度の活動からの回復を比較します。');
 case 'calm':return lead+' '+text('依安靜心率、呼吸及休息比例比較個體基準。只有逐搏資料可信時，才另外納入 HRV。','Compares resting heart rate, breathing and quiet-time share to this pet’s baseline. HRV is included only when valid beat intervals exist.','휴식 심박·호흡 기준','安静時の心拍・呼吸と基準の比較です。');
 case 'sleep':return lead+' '+text('依休息時長、安靜比例、夜間呼吸及連續性加權；未取得有效夜間資料時不推斷睡眠階段。','Weighted from rest duration, quiet proportion, overnight breathing and continuity. No sleep-stage claim without suitable night data.','수면·휴식 추세','休息時間・連続性などを評価します。');
 default:return lead;
 }
}
function harmonizeDeep(){
 if(state.tab!=='deep')return;
 const root=document.getElementById('app');if(!root)return;
 const ctx=selected(),section=Number(state.deepType);
 const parent=section===0?'cardio':section===1?'sleep':'activityRecovery';
 const main=value(ctx.days,parent);
 const mainVerdict=root.querySelector('.dp903-overview-copy > h3,.dp901-overall-verdict');
 if(mainVerdict)mainVerdict.textContent=grade(main);
 const mainSummary=root.querySelector('.dp903-overview-copy > p,.dp901-overall-desc');
 if(mainSummary)mainSummary.textContent=scoreWithCoverage(ctx.days,parent)+' '+text('由下方有效指標加權計算，可逐項查看變化。','Weighted from valid metrics below; review each for context.','지표별 가중 점수입니다.','下記の指標を加重して算出。');
 // This page must not contain a numeric summary generated by the older engine.
 const oldNotes=root.querySelector('.dp901-period-notes');
 if(section===2&&oldNotes){const e=readout(ctx.days,'energy'),r=readout(ctx.days,'recovery'),c=readout(ctx.days,'calm');oldNotes.innerHTML=`<p>${text('期間重點：','Period summary: ','기간 요약: ','期間のまとめ：')}${text('精力','Energy','활력','活力')} ${e.label} · ${text('恢復','Recovery','회복','回復')} ${r.label} · ${text('放鬆','Rest','휴식','休息')} ${c.label}。</p>`;}
 const metricNodes=root.querySelectorAll('.dp903-metric-card[data-dp903-metric]');
 metricNodes.forEach(node=>{const key=node.dataset.dp903Metric,paragraph=node.querySelector('.dp903-metric-left > p');if(paragraph)paragraph.textContent=explain(key,ctx);});
 if(section===2){
  root.querySelectorAll('.dp901-metric-card').forEach((node,i)=>{
   const k=['energy','recovery','calm'][i],paragraph=node.querySelector('.dp901-metric-desc');
   if(paragraph)paragraph.textContent=explain(k,ctx);
  });
 }
 if(section===0){
  // The waveform is the only source for raw heart/breath rates; score descriptions are derived from scoring engine.
  root.querySelectorAll('.dp903-open-wave').forEach(node=>{
   if(/查看波形|View waveform/.test(node.textContent||''))node.textContent=text('查看詳細數據 ›','View details ›','상세 데이터 ›','詳細データ ›');
  });
 }
 // Grade cards follow the same threshold in Chinese and English regardless of earlier legacy templates.
 root.querySelectorAll('.dp903-metric-card[data-dp903-metric]').forEach(node=>{
  const k=node.dataset.dp903Metric,n=value(ctx.days,k),t=node.querySelector('.dp903-grade');if(t)t.textContent=grade(n);
 });
 root.querySelectorAll('.dp901-metric-card').forEach((node,i)=>{
  const k=['energy','recovery','calm'][i],n=value(ctx.days,k),t=node.querySelector('.dp901-score-tag,.dp903-grade');if(t)t.textContent=grade(n);
 });
}
function harmonizeCalendar(){
 if(state.tab!=='deep')return;
 const all=api()?.getDaily(state.dog)||[];
 document.querySelectorAll('#app .dp905-cal-day[data-date][data-kind]').forEach(node=>{
  const kind=node.dataset.kind,map={heart:'heart',breath:'breath',sleep:'sleep',energy:'energy'},key=map[kind];if(!key)return;
  const day=all.find(x=>x?.date===node.dataset.date),n=day?.scores?.[key];
  node.classList.remove('normal','light','medium','high','none');node.classList.add(!valid(n)?'none':n>=90?'normal':n>=80?'light':n>=60?'medium':'high');
  node.dataset.score=valid(n)?String(n):'';
  node.title=`${node.dataset.date} · ${grade(n)} · ${format(n)}/100`;
  node.setAttribute('aria-label',node.title);
  const mark=node.querySelector('.dp908-day-mark');if(mark)mark.textContent=!valid(n)?'—':n>=90?'✓':'•';
 });
}
function harmonizeAge(){
 const root=document.getElementById('app');if(!root)return;
 const all=api()?.getDaily(state.dog)||[],features=api()?.getFeatures(state.dog)||[];
 const estimate=window.DeepPetBCG?.biologicalAge(currentDog().age,features,all);
 const available=!!estimate&&valid(estimate.estimateYears);
 if(!available){
  // Older components used actual age as an estimated-age fallback. Never expose it as measured age.
  root.querySelectorAll('.dp73-estimated strong,.dp70-age-metrics > div:first-child strong,.dp68-age-me summary > strong,.dp67-age summary > b,.age-modal-big > div:first-child strong').forEach(x=>{x.textContent='—';});
  root.querySelectorAll('.dp73-difference,.dp70-age-diff,.bio-age-modal-delta,.dp73-age-why').forEach(x=>x.remove());
 }
 if(state.tab!=='me'||state.detail!=='age-detail')return;
 const page=root.querySelector('.dp-age-full');if(!page)return;
 page.querySelectorAll('button[data-action="age-detail-back"]').forEach((b,i)=>{if(i>0)b.remove();});
 const title=page.querySelector('.dp-independent-head b');if(title)title.textContent=text('AI 推算生理年齡','AI-estimated wellness age','AI 추정 건강 나이','AI推定健康年齢');
 const ageNode=page.querySelector('.age-modal-big > div:first-child strong');
 if(ageNode)ageNode.innerHTML=available?`${estimate.estimateYears.toFixed(1)} <small>${text('歲','years','세','歳')}</small>`:'—';
 page.querySelectorAll('.bio-age-modal-delta').forEach(x=>x.remove());
 const oldReasons=page.querySelector('.dp-age-explanation');if(oldReasons)oldReasons.remove();
 const outdatedFactors=page.querySelectorAll('.dp-age-metric');outdatedFactors.forEach(x=>x.remove());
 const scoreDays=window.DeepPetBCG.calendarWindow(all.filter(x=>valid(x?.scores?.physiol)&&valid(x?.scores?.rhythm)),14,iso(localDate()));
 const mean=k=>{const vals=scoreDays.map(x=>x.scores[k]).filter(valid);return vals.length?Math.round(vals.reduce((s,x)=>s+x,0)/vals.length):null;};
 const card=document.createElement('section');card.className='dp918-age-basis';
 const entries=[['physiol',text('身體狀態 · 最終分','Final body state','최종 신체 점수','身体状態の最終値')],['cardio',text('心肺','Cardio','심폐','心肺')],['sleep',text('睡眠與休息','Sleep & rest','수면·휴식','睡眠・休息')],['activityRecovery',text('精力與恢復','Energy & recovery','활력·회복','活力・回復')],['rhythm',text('身體節奏','Body rhythm','신체 리듬','身体リズム')]];
 card.innerHTML=`<b>${text('近 14 個有效日的模型輸入','Model inputs · last 14 valid days','최근 14일 모델 입력','直近14有効日のモデル入力')}</b><div class="dp918-age-grid">${entries.map(([k,label])=>`<div><span>${label}</span><strong>${format(mean(k))}</strong></div>`).join('')}</div><p>${available?text('推算指數 = 近 14 有效日最終身體狀態 75% ＋ 身體節奏 25%。若指數低於 82，不得顯示比實際年齡年輕。本結果並非臨床生理年齡。','Index = 75% mean final body score + 25% rhythm score over 14 valid days. Poor scores cannot yield a younger age. Not clinically validated.','검증되지 않은 건강 추세 나이','臨床検証されていない健康傾向年齢です。'):text('有效評分日不足，暫不顯示推算年齡。實際年齡仍保留在右側。','Not enough valid pet scoring days to calculate an estimate. Actual age remains visible.','유효 자료 부족','有効な日数が足りません。')}</p>`;
 const target=page.querySelector('.age-modal-big');if(target)target.insertAdjacentElement('afterend',card);
 page.querySelectorAll('.notices').forEach(x=>{if(/RMSSD|SDNN|演示|illustrative|예시/.test(x.textContent||''))x.textContent=text('推算使用有效心肺、休息、精力恢復與節奏趨勢；只有足夠的有效日才顯示結果。非疾病診斷。','Uses valid cardio, rest, recovery and rhythm trends. Shows an estimate only with enough valid days. Not a diagnosis.','유효한 장기 추세만 사용','有効な経時データに基づく参考値です。');});
}
const oldRender=render;
render=function(reset=false){oldRender(reset);harmonizeDeep();harmonizeCalendar();harmonizeAge();};
const oldModal=renderModal;
renderModal=function(){oldModal();/* all modal score values are created through dpTodayUnifiedScores */};
window.DeepPetAudit918={version:'9.18',snapshot:(petIndex=state.dog)=>{
  const all=api()?.getDaily(petIndex)||[];
  return {petIndex,dates:all.map(x=>x?.date),daily:all.map(x=>({date:x?.date,scores:x?.scores,confidence:x?.confidence,report:x?.reportEvidence?{score:x.reportEvidence.score,latest:x.reportEvidence.latest,pendingLatest:x.reportEvidence.pendingLatest}:null})),
    period7:window.DeepPetBCG.periodScores(all,7,iso(localDate())),period30:window.DeepPetBCG.periodScores(all,30,iso(localDate()))};
}};
})();
