/* A dated source label, not a health-score override. Preserve existing layout. */
(function(root){'use strict';const prior=render;
render=function(){const ret=prior.apply(this,arguments);try{
 if(state.dog!==0||state.tab!=='deep'||state.emptyPreview)return ret;
 const main=document.querySelector('.app-main');if(!main)return ret;
 const date=state.detail==='dp90-waveform'?state.dp90WaveDate:state.detail==='dp905-sleep-day'?state.dp905ChosenDate:state.detail==='dp905-energy-day'?(state.dp905ChosenDate||state.dp936EnergyDate):state.deepSelectedDate;
 const day=date,n=Number(state.range)||1,period=n>1&&!state.detail;
 // Historical raw-vs-summary evidence is rendered synchronously by the final
 // wrapper, so observers cannot silently replace the end-of-day explanation.
 if(!state.detail&&state.deepType===0&&n===1){const e=root.DeepPetMiloWaveQC?.lastConnectedHRV?.[date];if(e){
 const card=main.querySelector('[data-dp903-metric="hrv"]');const host=card?.querySelector('.dp903-metric-left')||card||main;
 let note=host.querySelector('[data-dp145-hrv-evidence]');if(!note){note=document.createElement('p');note.dataset.dp145HrvEvidence='';note.className='dp145-hrv-evidence';host.append(note);}note.style.cssText='font-size:11px;line-height:1.45;color:#67758a;margin:5px 0;overflow-wrap:anywhere;';
 const raw=String(e.lastRawPacketAt).slice(11,19),last=String(e.lastObservedAt).slice(11,16),vm=Number(e.validMinutes||0).toFixed(2),ex=Number(e.excludedMinutes||0).toFixed(2),cov=(100*(e.signalConfidence||0)).toFixed(1);
 note.textContent=({en:`Last raw ${raw}; summary ${last}. Candidate NN ${vm} min; excluded ${ex} min; coverage ${cov}%. Waveform estimate; beat identification may affect accuracy.`,zht:`原始波形截至 ${raw}；摘要截至 ${last}。有效候選間隔 ${vm} 分鐘；排除 ${ex} 分鐘；覆蓋 ${cov}%。波形估算，逐搏辨識可能影響準確度。`,zh:`原始波形截至 ${raw}；摘要截至 ${last}。有效候选间隔 ${vm} 分钟；排除 ${ex} 分钟；覆盖 ${cov}%。波形估算，逐搏识别可能影响准确度。`,ko:`마지막 원시 파형 ${raw}, 요약 ${last}. 후보 NN ${vm}분, 제외 ${ex}분, 범위 ${cov}%. 박동 검출에 따라 추정 정확도가 달라질 수 있습니다.`})[state.lang];
 }}

 // Legacy period sleep template uses its own rolling endpoint; enforce the selected date ledger.
 if(!state.detail&&state.deepType===1&&/^\d{4}-\d{2}-\d{2}$/.test(date||'')){
  const head=main.querySelector(period?'.dp905-sleep-summary .dp905-sleep-head':'.dp-owner-sleep .dp-owner-status-heading');
  if(head){const v=root.DeepPetMiloAdaptiveScores.period(date,n,'sleep').score;const target=head.querySelector('.dp-status-score,.stat-bubble,.dp90-unavailable')||head.lastElementChild;
   if(target&&target!==head.firstElementChild)target.outerHTML=dpDeepDottedScore(v,'#52a97d').replace('<b>—</b><small>/100</small>','<b>N/A</b><small></small>');}
 }

 const calc=root.DeepPetMiloAdaptiveScores,containsFixture=period?calc.dates.some(d=>d<=date&&d>=root.DeepPetUnifiedDeep.dateAdd(date,1-n)&&calc.usesFixture(d)):calc.usesFixture(day);
 if(!containsFixture)return ret;
 const lang=state.lang,localized=(z,zh,en,ja,ko)=>({zh,zht:z,en,ja,ko}[lang]||en);
 const label=period?localized('期間含展示波形；各日按其來源顯示。','期间含展示波形；各日按其来源显示。','Includes presentation data, not new measurements.','期間には合成波形が含まれます。','기간에는 합성 파형이 포함됩니다.'):
 localized(day+' · 產品展示波形，非即時量測。',day+' · 产品展示波形，非实时测量。',day+' · Presentation waveforms, not new measurements.',day+' · 合成3信号波形（実測ではありません）。',day+' · 합성 3채널 파형 (실측 아님).');
 const note=document.createElement('p');note.dataset.lafaSource='synthetic-waveform';note.className='dp-observation-note';note.style.cssText='margin:6px 12px 8px;font-size:11px;line-height:1.5;color:#67758a;';note.textContent=label;
 const host=main.querySelector('.dp-owner-deep')||main.firstElementChild||main;host.prepend(note);
 if(period)return ret;
 // Avoid describing the generated day as device-captured data.
 const walk=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);let t;while(t=walk.nextNode()){
  if(t.parentElement?.closest('[data-lafa-source]'))continue;
  const next=t.nodeValue.replace(/實測/g,'波形計算').replace(/实测/g,'波形计算').replace(/\bRecorded\b/g,'Waveform-derived').replace(/\bMeasured\b/g,'Calculated').replace(/\bmeasured\b/g,'calculated').replace(/\bActual measurement\b/gi,'Waveform-derived value').replace(/実測/g,'波形計算').replace(/실측/g,'파형 계산');if(next!==t.nodeValue)t.nodeValue=next;
 }
 if(!state.detail&&state.deepType===0){const m=root.DeepPetMiloAdaptiveScores.dayScores(day).unified,h=m.hrv;
  const hrv=host.querySelector('[data-dp903-metric="hrv"] .dp903-metric-left > p');if(hrv&&h)hrv.textContent=`RMSSD ${h.rmssd.toFixed(1)} ms · SDNN ${h.sdnn.toFixed(1)} ms · NNVGR ${h.nvgr.toFixed(1)} bpm · ${h.minutes} min`;
  const stable=host.querySelector('[data-dp903-metric="stable"] .dp903-metric-left > p');if(stable)stable.textContent=localized('依同一心搏波形逐搏間隔計算。','依同一心搏波形逐搏间隔计算。','Calculated from the same waveform-derived beat intervals.','同じ波形の拍動間隔から計算。','같은 파형의 박동 간격으로 계산.');}
 if(!state.detail&&state.deepType===1){const m=root.DeepPetMiloAdaptiveScores.dayScores(day).unified.rest;const note2=document.createElement('p');note2.className='dp-observation-note';note2.textContent=localized(`夜間 ${m.night.hours} 小時、白天 ${m.day.hours} 小時；當日 00:00–24:00；實測與展示資料分開。`,`夜间 ${m.night.hours} 小时、白天 ${m.day.hours} 小时；当日 00:00–24:00；实测与展示数据分开。`,`Night quiet rest ${m.night.hours} h; daytime ${m.day.hours} h. Calculated within the selected calendar day; Recorded and presentation dates remain separate.`,`夜間 ${m.night.hours} h、日中 ${m.day.hours} h。選択日のみを集計。`,`야간 ${m.night.hours} h, 주간 ${m.day.hours} h. 선택한 날짜만 집계.`);host.append(note2);}
 }catch(e){console.error('dated source label',e);}return ret;};
})(window);
