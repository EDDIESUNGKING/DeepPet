/* Add owned PetHealth evidence to canonical DeepPet V10.139 slots, never replace
   homeView/deepView or another pet's fixtures; no fabricated 0-100 health risk. */
(function(root){'use strict';
 const engine=root.DeepPetMiloVerifiedPipeline;
 if(!engine)return;
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const isMilo=()=>state.dog===0&&!state.emptyPreview&&!(typeof selectedBlank==='function'&&selectedBlank());
 const T=(zh,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const $=(s,scope=document)=>scope?.querySelector(s);
 const lastDay=engine.latestDate;
 const originalReal=dpUsesRealMeasurements,originalDog=currentDog,originalPrune=dpPruneOwnerShowcaseRecords;
 dpUsesRealMeasurements=function(idx=state.dog){if(Number(idx)===0&&state.tab==='health'&&isMilo())return false;return originalReal(idx);};
 currentDog=function(){const pet=originalDog();if(isMilo()&&state.tab==='health'){pet.dpFixtureInvalidated=false;pet.dpOwnerReal=false;}return pet;};
 dpPruneOwnerShowcaseRecords=function(idx=state.dog){if(Number(idx)===0)return false;return originalPrune(idx);};
 let manualDate=false,lastSelected=-1;
 const previousChosen=deepChosenDate;
 function selectedDay(){return /^\d{4}-\d{2}-\d{2}$/.test(state.deepSelectedDate||'')?state.deepSelectedDate:lastDay;}
 deepChosenDate=function(){return isMilo()&&state.tab==='deep'&&Number(state.range)===1?selectedDay():previousChosen();};
 function prepare(){if(!isMilo()){lastSelected=state.dog;return;}if(lastSelected!==0&&!manualDate&&state.tab==='deep'&&Number(state.range)===1)state.deepSelectedDate=lastDay;lastSelected=0;}
 const originalRender=render;
 render=function(reset=false){prepare();originalRender(reset);try{decorate();}catch(err){console.error('Milo verified readings',err);}};
 function add(el,tag,css,content,prepend=false){if(!el)return;const node=document.createElement(tag);node.className=css;node.innerHTML=content;if(prepend)el.prepend(node);else el.append(node);return node;}
 function summaryText(kind,stats){const m=kind==='heart'?stats.heart:stats.breath,
    min=kind==='heart'?stats.hrMin:stats.rrMin,max=kind==='heart'?stats.hrMax:stats.rrMax,
    unit=kind==='heart'?'bpm':T('次／分','/min','回／分','회/분');
   return stats.pairedValid?T(`本次實測中位數 ${m} ${unit}，範圍 ${min}–${max}。`,`Measured median ${m} ${unit}, range ${min}–${max}.`,`今回の測定中央値 ${m} ${unit}（${min}–${max}）。`,`이번 실측 중앙값 ${m} ${unit}, 범위 ${min}–${max}.`):T('所選日期沒有有效量測。','No valid readings on this date.','この日の有効データはありません。','해당 날짜의 유효 측정값이 없습니다.');
 }
 function mainDeep(){
  const main=$('.app-main .dp-owner-deep');if(!main||state.detail)return;
  const n=Number(state.range)||1,selected=selectedDay();
  const rows=n===1?engine.dayRows(selected):engine.inRange(selected,n),stats=engine.describe(rows);
  const dpQuality=$('.dp-range-quality',main);
  if(dpQuality)dpQuality.textContent=stats.pairedValid?T(`本期間有 ${new Set(rows.filter(r=>r.quality==='valid').map(r=>r.localDate)).size} 天量測記錄；尚不能將短時間記錄當成全天分數。`,`Recorded observations are available; short sessions do not establish full-day scores.`,`短時間記録を1日分のスコアとして扱いません。`,`단시간 기록을 하루 전체 점수로 사용하지 않습니다.`):T('本期間尚無可用的實測資料。','No usable recorded readings in this period.','この期間に測定記録はありません。','해당 기간에 실측 자료가 없습니다.');
  if(state.deepType===0){
   const head=$('.dp903-overview-copy > p',main);
   if(head)head.textContent=stats.pairedValid?T('已取得實測心率與呼吸；完整心肺分數仍需已驗證基準及其他指標。','Heart and breathing measured; the full score needs verified reference and additional inputs.','心拍・呼吸は測定済み。他の指標と基準が必要です。','심박과 호흡 실측 완료, 종합 점수는 추가 근거가 필요합니다.'):T('目前沒有可計分的實測資料。','No scorable measured data for this period.','採点可能な記録がありません。','점수 산정에 필요한 자료가 없습니다.');
   for(const kind of ['heart','breath']){
    const card=$(`[data-dp903-metric="${kind}"]`,main);if(!card)continue;
    const p=$('.dp903-metric-left > p',card);
    const review=stats.pairedValid?engine.events(kind,rows.at(-1)?.localDate||selected):[];
    const evidence=review.length?T(`找到 ${review.length} 段持續相對變化，先回看時間與佩戴情況。`,`Found ${review.length} sustained relative change(s); review timing and wearing context.`,`連続した相対変化 ${review.length} 件を確認。`,`지속적인 상대 변화 ${review.length}건을 확인했습니다.`):T('沒有達到本次連續變化標記條件的時段。','No sustained relative review marker was found.','連続した相対変化のマーカーはありません。','지속적인 상대 변화 구간이 없습니다.');
    if(p)p.textContent=summaryText(kind,stats)+' '+evidence+' '+T('尚需當日合格量測及適用的群體參考；第一天即可評估，不需要先建立14天個體基準。','A qualified same-day reading and applicable group reference are needed; a 14-day personal baseline is NOT required for the first score.','当日の有効記録と集団基準が必要で、14日間を待つ必要はありません。','당일 유효 기록과 집단 참고가 필요하며 14일을 기다릴 필요는 없습니다.');
    const left=$('.dp903-metric-left',card);
    const title=$('h3',left);
    if(title&&stats.pairedValid){const value=kind==='heart'?stats.heart:stats.breath,unit=kind==='heart'?'bpm':T('次／分','/min','回／分','회/분');
     title.insertAdjacentHTML('afterend',`<span class="milo-verified-value">${e(value)} ${unit}</span>`);}
   }
   const hrv=$('[data-dp903-metric="hrv"] .dp903-metric-left > p',main);
   if(hrv)hrv.textContent=T('原廠封包未提供可驗證的逐搏間隔，不能由整數心率推算 RMSSD、SDNN。','No validated beat intervals: RMSSD and SDNN cannot be derived from integer heart rate.','拍動間隔がなくRMSSD・SDNNは算出できません。','박동간 간격이 없어 RMSSD·SDNN 산출이 불가합니다.');
   const stable=$('[data-dp903-metric="stable"] .dp903-metric-left > p',main);
   if(stable)stable.textContent=T('已得到心率趨勢，但原始波形尚未驗證逐搏時間；心搏節奏分數保留空值。','Heart-rate trend exists, but beat timing is unverified; rhythm score remains unavailable.','心拍間隔が未検証のためリズムスコアは算出できません。','박동 시점 검증이 없어 리듬 점수를 계산하지 않습니다.');
   const method=$('.dp903-score-method',main);if(method)method.textContent=T('已將心率、呼吸輸入實測分析；全天綜合分數不使用短時段資料填補。','Measured heart and breathing feed the session analysis; day scores are never filled from short recordings.','短時間の計測で一日全体の点数を作りません。','짧은 측정으로 하루 점수를 채우지 않습니다.');
  }else if(state.deepType===1){
   const p=$('.dp1052-sleep-reason, .dp1054-sleep-copy > p, .dp-owner-sleep .dp-owner-status-heading p',main);
   if(p)p.textContent=T('這次只有白天心率與呼吸；沒有夜間連續動靜與睡眠紀錄，不能推算睡眠分數。','Only daytime rates were recorded; no verified overnight movement or sleep data.','夜間の動静・睡眠データがないため睡眠スコアを計算できません。','야간 동작 및 수면 데이터가 없어 수면 점수를 계산할 수 없습니다.');
  }else if(state.deepType===2){
   const p=$('.dp901-overall-desc',main);
   if(p)p.textContent=T('本次缺少經驗證的動靜與活動停止時間，無法評估精力、兩分鐘恢復及放鬆狀態。','Verified motion and post-exercise start times were not captured; energy and recovery remain unavailable.','活動量・運動終了時刻の検証データがありません。','검증된 활동량과 운동 종료 시점이 없습니다.');
  }
  const date=$('#deepDayDate',main);if(date){date.min=engine.firstDate;date.max=typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):lastDay;if(n===1)date.value=selectedDay();}
 }
 const median=v=>{if(!v.length)return null;const a=[...v].sort((x,y)=>x-y),i=a.length>>1;return a.length%2?a[i]:(a[i-1]+a[i])/2;};
 function xyPlot(vals,kind,windowTitle,selected=null){
  if(vals.length<2)return `<div class="dp936-chart-na">N/A</div>`;
  const X=360,Y=172,l=38,r=10,t=18,b=36,key=kind==='heart'?'hr':'rr';
  const ok=vals.filter(x=>x.quality==='valid'&&finite(x[key]));if(ok.length<2)return `<div class="dp936-chart-na">N/A</div>`;
  const points=ok.filter((x,i)=>i%Math.max(1,Math.floor(ok.length/160))===0||i===ok.length-1),min=Math.min(...ok.map(x=>x[key]))-4,max=Math.max(...ok.map(x=>x[key]))+4;
  const start=Date.parse(vals[0].at),end=Date.parse(vals.at(-1).at),span=Math.max(1,end-start);
  const xv=x=>l+(X-l-r)*(Date.parse(x.at)-start)/span,yv=x=>t+(Y-t-b)*(1-(x-min)/Math.max(1,max-min));
  // Each time series is drawn in a separate SVG. Disconnected sessions are NEVER linked.
  const d=points.map((p,i)=>(i?'L':'M')+xv(p).toFixed(2)+' '+yv(p[key]).toFixed(2)).join(' ');
  // Exact recorded timestamp markers: only measured rows, never interpolated.
  const flagged=engine.events(kind,vals[0].localDate).map((ev,i)=>{
    const mid=vals.find(r=>r.localTime.slice(0,5)===ev.time&&r.quality==='valid'&&finite(r[key]));
    return mid?`<circle class="milo-verified-review-dot" data-event-index="${i}" cx="${xv(mid).toFixed(2)}" cy="${yv(mid[key]).toFixed(2)}" r="4.5" fill="#fff" stroke="#db5267" stroke-width="2.6"><title>${e(ev.time)}: ${e(mid[key])}</title></circle>`:'';
  }).join('');
  return `<div class="milo-verified-segment"><div class="milo-verified-segment-label">${e(windowTitle)}</div><svg class="dp904-trend-svg" viewBox="0 0 ${X} ${Y}" role="img" aria-label="${e(windowTitle)}"><text x="${l-3}" y="${t+4}" text-anchor="end" font-size="10" fill="#6a7990">${max.toFixed(0)}</text><text x="${l-3}" y="${Y-b+4}" text-anchor="end" font-size="10" fill="#6a7990">${min.toFixed(0)}</text><line x1="${l}" y1="${Y-b}" x2="${X-r}" y2="${Y-b}" stroke="#dce3eb"/><path d="${d}" fill="none" stroke="${kind==='heart'?'#bb5477':'#487fb8'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>${flagged}<text x="${l}" y="${Y-10}" font-size="10" fill="#62738a">${e(vals[0].localTime.slice(0,5))}</text><text x="${X-r}" y="${Y-10}" text-anchor="end" font-size="10" fill="#62738a">${e(vals.at(-1).localTime.slice(0,5))}</text></svg></div>`;
 }
 function plotRaw(data,key){
  const seq=data.flatMap(r=>Array.isArray(r[key])?r[key]:[]);if(seq.length<20)return '';
  const W=360,H=95,lim=Math.max(1,Math.ceil(seq.length/500)),segments=[];
  for(let i=0;i<seq.length;i+=lim){const x=seq.slice(i,i+lim);let mn=0,mx=0;for(let j=1;j<x.length;j++){if(x[j]<x[mn])mn=j;if(x[j]>x[mx])mx=j;}for(const j of [...new Set([mn,mx])].sort((a,b)=>a-b))segments.push([i+j,x[j]]);}
  const lo=Math.min(...seq)-1,hi=Math.max(...seq)+1,dy=Math.max(1,hi-lo);
  const d=segments.map(([i,v],j)=>(j?'L':'M')+(8+(W-16)*i/Math.max(1,seq.length-1)).toFixed(1)+','+(8+(H-16)*(1-(v-lo)/dy)).toFixed(1)).join(' ');
  return `<div class="milo-verified-segment"><b>${key==='channelA'?'A':'B'} · ${T('未確認原始訊號通道','Unidentified raw channel','未確認の信号','미확인 원시 채널')}</b><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${key}"><path stroke="#9b8bc7" stroke-width="1.8" fill="none" d="${d}"/></svg></div>`;
 }
 function detailed(){
  const shell=$('.app-main .dp90-wave-page');if(!shell)return;
  const kind=state.dp90WaveKind==='breath'?'breath':'heart',key=kind==='heart'?'hr':'rr',day=String(state.dp90WaveDate||selectedDay());
  const x=engine.measuredDay(day),stats=engine.describe(engine.dayRows(day)),events=engine.events(kind,day);
  const title=kind==='heart'?T('心跳狀況','Heart rate','心拍状態','심박 상태'):T('呼吸狀況','Breathing','呼吸状態','호흡 상태');
  const unit=kind==='heart'?'bpm':T('次／分','/min','回／分','회/분');
  const val=kind==='heart'?stats.heart:stats.breath,low=kind==='heart'?stats.hrMin:stats.rrMin,high=kind==='heart'?stats.hrMax:stats.rrMax;
  const sessions=[];let prev=null,group=[];
  for(const row of engine.dayRows(day)){
   const delta=prev?Date.parse(row.at)-Date.parse(prev.at):0;
   if(group.length&&delta>12000){sessions.push(group);group=[];}
   group.push(row);prev=row;
  }if(group.length)sessions.push(group);
  const labelTime=s=>s[0]?.localTime?.slice(0,5)+'–'+s.at(-1)?.localTime?.slice(0,5);
  const status=stats.pairedValid?T('有實測紀錄 · 尚無可靠全天健康分數','Measured · day-level health score not established','実測あり・一日健康点は未確定','실측 있음 · 하루 건강 점수 미확정'):T('資料不足','Insufficient data','データ不足','자료 부족');
  const assessment=stats.pairedValid?T(`本次${title}中位數為 ${val} ${unit}（${low}–${high} ${unit}）。未驗證個體基準與佩戴情境，不能把短時波動直接判斷為疾病。`,
   `Measured median ${val} ${unit} (${low}–${high}). There is no verified baseline or wearing context to classify medical risk.`,
   `測定中央値 ${val} ${unit}（${low}～${high}）。医学的なリスクは判定できません。`,`측정 중앙값 ${val} ${unit} (${low}–${high}); 의료 위험은 판정하지 않습니다.`):T('所選日期沒有足夠的實測數值。','No usable measurements on the selected day.','有効な測定値がありません。','유효 측정값이 없습니다.');
  const validSessions=sessions.filter(s=>s.some(r=>r.quality==='valid'));
  const summary=`<section class="card dp904-wave-card"><div class="dp904-wave-title"><span class="dp904-step">01</span><h3>${title}</h3></div><div class="milo-verified-summary"><div><small>${T('狀況','Status','状況','상태')}</small><strong>${status}</strong></div><div><small>${T('本次量測','Observed values','測定値','측정값')}</small><strong>${val===null?'N/A':`${val} ${unit}`}</strong></div><div><small>${T('時間','Time','時刻','시간')}</small><strong>${e(validSessions.map(labelTime).join('、')||'—')}</strong></div></div><div class="milo-verified-conclusion"><b>${T('結論','Conclusion','結論','결론')}</b><p>${assessment}</p></div></section>`;
  const graphs=sessions.filter(s=>s.some(r=>r.quality==='valid')).map(s=>xyPlot(s,kind,labelTime(s))).join('');
  const chart=`<section class="card dp904-wave-card"><div class="dp904-wave-title"><span class="dp904-step">02</span><h3>${T('實測時間曲線','Recorded time series','測定記録','실측 시간 추세')}</h3></div>${graphs||'<div class="dp936-chart-na">N/A</div>'}<p class="dp904-small-note">${T('這是已匯入的歷史讀數，並非目前即時連線；中斷處不會被補值。','Imported historical data, not a live stream; missing intervals are not interpolated.','保存された計測でありリアルタイムではありません。','저장된 측정이며 실시간 스트림이 아닙니다.')}</p></section>`;
  const index=Math.max(0,Math.min(events.length-1,Number(state.dpMiloEventPick||0))),picked=events[index]||null;
  const eventButtons=events.map((v,i)=>`<button type="button" class="dp904-event-choice ${i===index?'active':''}" data-action="milo-event-pick" data-index="${i}"><b>${v.time}–${v.endTime}</b><span>${v.delta>0?'+':''}${v.delta} ${unit}</span></button>`).join('');
  const chosen=picked?`<div class="dp904-focus-values"><div><small>${T('變化時間','Time','時刻','시간')}</small><b>${day} ${picked.time}</b></div><div><small>${T('本段代表值','Observed median','測定中央値','측정 중앙값')}</small><b>${picked.value} ${unit}</b></div><div><small>${T('與本次中位數差','Difference vs this capture','今回との差','이번 측정과 차이')}</small><b>${picked.delta>0?'+':''}${picked.delta} ${unit}</b></div></div><p class="dp904-small-note">${T('這是相對於本次記錄的連續變化，不等於經過獸醫驗證的緊急異常。','A sustained relative change within this recording, not a clinically verified emergency.','今回の相対変化であり、緊急事態の診断ではありません。','이번 기록의 상대 변화이며 응급 진단이 아닙니다.')}</p>`:`<p>${T('未找到連續兩個有效分鐘都超過本次波動門檻的時段。','No two-minute sustained change exceeded the capture-relative threshold.','連続2分の相対変化は検出されませんでした。','2분 연속 변화 구간이 발견되지 않았습니다.')}</p>`;
  const focus=picked?engine.dayRows(day).filter(r=>r.quality==='valid'&&Math.abs(Date.parse(r.at)-Date.parse(day+'T'+picked.time+':00+08:00'))<=180000):[];
  const focusChart=focus.length>=3?xyPlot(focus,kind,T(`放大 ${picked.time} 前後3分鐘`,`Zoom around ${picked.time}`,`${picked.time} 前後の拡大`,`${picked.time} 주변 확대`)):'';
  const eventCard=`<section class="card dp904-wave-card"><div class="dp904-wave-title"><span class="dp904-step">03</span><h3>${T('值得回看的變化時段','Time points worth reviewing','確認する時間帯','확인할 변화 구간')}</h3></div><div class="dp904-events">${eventButtons}</div>${chosen}${focusChart}<p class="dp904-small-note">${T('門檻：同次量測中位數的持續偏離；只用於查看波形，不是健康診斷或一級警報。','Thresholds flag sustained departures from this capture median for review only.','記録内の比較のみで、健康診断には使用しません。','기록 내 변화 표시이며 진단이 아닙니다.')}</p></section>`;
  const rawSegments=sessions.filter(s=>s.some(r=>r.quality==='valid')).slice(0,3);
  const rawSection=engine.rawChannelsAvailable?`<section class="card dp904-wave-card"><details class="milo-verified-raw"><summary>${T('查看原始20Hz雙通道波形（物理意義尚待確認）','Raw 20 Hz channels (identity unverified)','原波形の確認','20Hz 원시 파형')}</summary>${rawSegments.map(s=>`<p class="milo-verified-segment-label">${labelTime(s)}</p>${plotRaw(s,'channelA')}${plotRaw(s,'channelB')}`).join('')}</details></section>`:'';
  const old=$('.dp1073-detail-empty',shell);
  if(old){old.outerHTML=summary+chart+eventCard+rawSection;}
  else{
   // A full day detail route may use the measured shell; retain its header/back
   // and replace only the card stack, never the entire Deep page.
   shell.querySelectorAll('section.card').forEach(n=>n.remove());
   shell.insertAdjacentHTML('beforeend',summary+chart+eventCard+rawSection);
  }
 }
 function decorate(){if(!isMilo())return;document.querySelectorAll('.app-main .dp130-sync').forEach(node=>node.remove());if(state.tab==='deep'&&state.detail==='dp90-waveform')return;else if(state.tab==='deep')mainDeep();
  // Crucial: Home is never decorated. There is NO recent-live-heart-rate row.
 }
 document.addEventListener('change',event=>{if(isMilo()&&state.tab==='deep'&&event.target?.id==='deepDayDate')manualDate=true;},true);
 document.addEventListener('click',event=>{const b=event.target?.closest?.('[data-action="milo-event-pick"]');if(!b||!isMilo())return;event.stopImmediatePropagation();event.preventDefault();state.dpMiloEventPick=Number(b.dataset.index)||0;render(false);},true);
 if(!window.__dpBooting&&document.getElementById('app'))try{render(false);}catch(err){console.error('Milo initial render',err);}
 root.DeepPetMiloUIAdapter=Object.freeze({version:'10.139-canonical-ui-evidence',date:lastDay,source:'PetHealth recorded B0 sensor readings',noMedicalScoresWithoutProvenance:true});
})(window);
