/* DeepPet V10.39 — pet-specific status explanations, calm home and complete month calendar.
   This display layer never writes sensor readings, lab records, or score values. */
(function(root){'use strict';
 const L=(zht,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zht):zht;
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const isNum=x=>x!==null&&x!==undefined&&x!==''&&Number.isFinite(Number(x));
 const tier=x=>!isNum(x)?'unknown':Number(x)>=90?'healthy':Number(x)>=80?'mild':Number(x)>=60?'moderate':'high';
 const label=x=>({healthy:L('健康','Healthy','健康','건강'),mild:L('輕風險','Mild risk','軽度リスク','경도 위험'),moderate:L('中風險','Moderate risk','中リスク','중간 위험'),high:L('高風險','High risk','高リスク','높은 위험'),unknown:L('資料不足','Not enough data','データ不足','자료 부족')})[tier(x)];
 const scoreIn=el=>{const meter=el?.matches?.('[data-score]')?el:el?.querySelector?.('.dp-status-score[data-score],.dp-dotted-meter[data-score]');return meter&&isNum(meter.getAttribute('data-score'))?Number(meter.getAttribute('data-score')):null;};
 const badge=(score,metric)=>`<button type="button" class="dp1039-risk-chip dp1039-tier-${tier(score)}" data-dp1039-score="${score}" data-dp1039-metric="${escape(metric)}" aria-label="${escape(metric)} · ${label(score)} · ${score}/100 · ${L('點擊查看原因','Tap for reasons','理由を表示','이유 보기')}">${label(score)} <span aria-hidden="true">ⓘ</span></button>`;
 function actualReason(metric,score){
  const n=Number(score),theTier=tier(n);
  const base={healthy:L('與目前個體參考模式相近，未見達到提醒門檻的偏離。','Close to this pet’s reference pattern, without a score-level alert.','個体基準に近い状態です。','개체 기준에 가깝습니다.'),mild:L('與個體平常模式有輕度偏離，值得留意後續趨勢。','A mild deviation from this pet’s reference pattern; watch the trend.','個体基準から軽度の変化があります。','개체 기준 대비 가벼운 변화가 있습니다.'),moderate:L('多項指標或單項變化使此分數落在中風險區間，建議查看近日趨勢。','A larger or accumulated change places the score in the moderate range; review recent trends.','指標の変化が中リスク帯に入っています。','변화가 중간 위험 구간에 해당합니다.'),high:L('此項分數明顯偏離個體參考模式，已落入高風險提醒區間；請核對訊號品質及相關健康紀錄。','This score differs substantially from the pet reference and falls in the high-alert band; review signal quality and health records.','基準から大きく変化し高リスク帯にあります。','기준 대비 변화가 커 높은 위험 구간입니다.')};
  const isRecovery=/恢復|恢复|recover|回復|회복/i.test(metric),isCalm=/放鬆|放松|平穩|steadiness|relax|安定|안정/i.test(metric),isSleep=/睡眠|休息|sleep|rest/i.test(metric),isHeart=/心肺|心跳|呼吸|heart|cardio|breath|心拍|심박/i.test(metric);
  let method=isRecovery?L('依活動停止後 2 分鐘心率回落幅度，與同一隻寵物過往相近活動量的有效紀錄比較。','Compares the two-minute post-activity heart-rate drop with verified prior sessions of similar exertion.','活動後2分間の心拍低下量を同程度の過去の活動と比較します。','활동 종료 후 2분 심박 감소량을 비슷한 활동과 비교합니다.'):
   isCalm?L('依安靜時心搏間隔變化、HRV 與個體基準的接近程度評估，並非情緒判斷。','Compares quiet-time beat intervals and HRV with this pet’s baseline; it is not an emotion diagnosis.','安静時の心拍間隔とHRVを個体基準と比較します。','안정 시 심박 간격과 HRV를 개체 기준과 비교합니다.'):
   isSleep?L('依夜間安靜休息時長、活動中斷與多日趨勢計分；靜止不直接等同於深睡。','Scores quiet rest duration, interruptions and trends; stillness alone does not prove deep sleep.','休息時間と中断・推移を比較します。','휴식 시간과 중단 및 변화 추세를 비교합니다.'):
   isHeart?L('依有效心跳、呼吸及心搏節奏趨勢與該寵物的個體參考作比較。','Compares qualified heart, breathing and heartbeat-pattern changes with this pet’s reference.','心拍・呼吸・心拍リズムを個体基準と比較します。','심박·호흡·리듬을 개체 기준과 비교합니다.'):
   L('依本項有效監測數據及個體長期趨勢分級。','Graded from valid readings and this pet’s long-term trends.','有効な記録と長期傾向に基づきます。','유효 기록과 장기 추세를 기준으로 합니다.');
  if(isRecovery&&state.range===1){try{const row=deepDateRows().find(r=>r.date===deepChosenDate()),rec=row?dpOwnerRecoveryComparison(row):null;if(rec&&Number.isFinite(rec.average)&&Number.isFinite(rec.reference))method+=' '+L(`所選日期 2 分鐘回落 ${rec.average.toFixed(1)} bpm；相似活動參考 ${rec.reference.toFixed(1)} bpm。`,`Two-minute drop ${rec.average.toFixed(1)} bpm versus ${rec.reference.toFixed(1)} bpm for similar sessions.`,`2分間の回復 ${rec.average.toFixed(1)} bpm、比較基準 ${rec.reference.toFixed(1)} bpm。`,`2분 회복 ${rec.average.toFixed(1)} bpm, 기준 ${rec.reference.toFixed(1)} bpm.`);}catch(_){/* explanation remains bounded to observed score */}}
  const range=state.range===1?L('單日','Day','単日','하루'):L(`最近 ${state.range} 日`,`Last ${state.range} days`,`直近${state.range}日`,`최근 ${state.range}일`);
  return {headline:`${metric} · ${range}`,sub:`${Math.round(n)}/100 · ${label(n)}`,method,reason:base[theTier]};
 }
 function openReason(btn){const score=Number(btn.dataset.dp1039Score),metric=btn.dataset.dp1039Metric||L('綜合狀態','Overall status','総合状態','종합 상태');if(!Number.isFinite(score))return;
  const details=actualReason(metric,score);document.querySelector('.dp1039-reason-layer')?.remove();
  const wrap=document.createElement('div');wrap.className='dp1039-reason-layer';wrap.innerHTML=`<div class="dp1039-reason-backdrop" data-dp1039-close></div><section class="dp1039-reason-sheet" role="dialog" aria-modal="true" aria-label="${escape(details.headline)}"><button class="dp1039-reason-close" type="button" data-dp1039-close aria-label="${L('關閉','Close','閉じる','닫기')}">×</button><small>${escape(details.headline)}</small><h2 class="dp1039-tier-${tier(score)}">${escape(details.sub)}</h2><p>${escape(details.reason)}</p><p>${escape(details.method)}</p><small>${L('分級屬健康趨勢提示，不代替獸醫判斷。','Trend guidance only, not a veterinary diagnosis.','獣医師の診断に代わるものではありません。','수의학적 진단을 대신하지 않습니다.')}</small></section>`;
  document.body.append(wrap);wrap.querySelector('button')?.focus();
 }
 document.addEventListener('click',e=>{const target=e.target.closest?.('[data-dp1039-score],[data-dp1039-close]');if(!target)return;e.preventDefault();e.stopImmediatePropagation();if(target.hasAttribute('data-dp1039-close'))document.querySelector('.dp1039-reason-layer')?.remove();else openReason(target);},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelector('.dp1039-reason-layer')?.remove();},true);
 const oldToday=dpTodayCareItems;
 dpTodayCareItems=function(){return oldToday().filter(x=>x.type!=='recovery'||!!carePlanForPet().started).map(x=>({...x,title:String(x.title).replace(/^(今日|今天)(?=用藥|用药|恢復|恢复)/,'')}));};
 const oldFocus=focusCard;focusCard=function(){return String(oldFocus()).replace(/<span class="dp1035-priority-tag">[^<]*<\/span>/g,'');};
 const oldMore=dpTodayMorePage;dpTodayMorePage=function(){return String(oldMore()).replace(/<span class="dp1035-priority-tag">[^<]*<\/span>/g,'');};
 // Display a complete current calendar month; the eligibility algorithm still
 // calculates 14 valid measurement dates from its original 45-day window.
 function monthGrid(){const now=localDate(),yy=now.getFullYear(),mm=now.getMonth(),length=new Date(yy,mm+1,0).getDate();
  const first=(new Date(yy,mm,1).getDay()+6)%7,rows=dpUsesRealMeasurements()?[]:demoRecords(state.dog),idxByDate=new Map(rows.map((r,i)=>[r.date,i]));
  const engine=root.DeepPetSignalScoring,verified=new Set(dpUsesRealMeasurements()?(engine?.getFeatures?.(state.dog)||[]).filter(x=>x?.source==='20hz-waveform'&&engine?.isVerifiedWear?.(x)===true).map(x=>x.date):[]);
  const cells=Array.from({length:first},()=>'<span class="dp1039-calendar-spacer" aria-hidden="true"></span>');
  for(let d=1;d<=length;d++){const date=`${yy}-${String(mm+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,idx=idxByDate.get(date),future=d>now.getDate();
   const valid=!future&&(dpUsesRealMeasurements()?verified.has(date):!selectedBlank()&&!dp58FreshPet()&&!isFreePet()&&idx!==undefined&&qualityForDay(idx).valid);
   const classname=future?'future':valid?'valid':'invalid',symbol=future?'—':valid?'✓':'×',content=`<small>${d}</small><strong>${symbol}</strong>`;
   cells.push(!future&&!dpUsesRealMeasurements()&&idx!==undefined?`<button type="button" class="dp1039-day ${classname}" data-action="quality-day" data-index="${idx}" data-available="true" aria-label="${date}: ${valid?'valid':'invalid'}">${content}</button>`:`<span class="dp1039-day ${classname}" aria-label="${date}: ${valid?'valid':future?'future':'invalid'}">${content}</span>`);
  }
  return `<div class="dp1039-month-calendar"><div class="dp1039-month-title">${yy} / ${String(mm+1).padStart(2,'0')} · ${L('整月記錄','Month overview','月間記録','월간 기록')}</div><div class="dp1039-weekdays">${[L('一','Mon','月','월'),L('二','Tue','火','화'),L('三','Wed','水','수'),L('四','Thu','木','목'),L('五','Fri','金','금'),L('六','Sat','土','토'),L('日','Sun','日','일')].map(x=>`<span>${x}</span>`).join('')}</div><div class="quality-days-grid dp1039-month-grid">${cells.join('')}</div></div>`;
 }
 const originalGrid=qualityDayGrid;qualityDayGrid=function(){return monthGrid()+`<p class="quality-days-caption">${L('✓ 為有效量測日；× 為未形成有效記錄。14 天基準累計的是有效日，不要求連續。','✓ valid measurement; × not a valid recording. The 14-day baseline counts eligible days, not consecutive calendar dates.','✓ 有効日、× 無効日。14日基準は連続不要です。','✓ 유효일, × 무효일. 14일 기준은 연속일 필요가 없습니다.')}</p>`;};
 const oldBase=dpBaselineStandalonePage;dpBaselineStandalonePage=function(){let html=oldBase();
  html=html.replace(/最近14個日曆日的記錄|最近14个日历日的记录/g,'最近十四日的記錄').replace(/Recording status for the last 14 calendar dates/g,'Recent 14-day records').replace(/최근 14일 달력의 측정 상태/g,'최근 14일 기록');
  // The truly blank page constructs its own 14-slot grid; replace only that
  // standalone grid, leaving a populated baseline's month grid untouched.
  if(html.includes('dp938-empty-baseline'))html=html.replace(/<div class="quality-days-grid">[\s\S]*?<\/div>/,monthGrid());
  return html;};
 function newPetInfo(app){if(state.emptyPreview||!dp58FreshPet()||state.tab!=='home'||state.detail)return;
  const p=currentDog(),hero=app.querySelector('.dp935-empty-home .dp935-empty-hero');if(!hero||!p)return;
  const species=p.species==='cat'?L('貓','Cat','猫','고양이'):L('犬','Dog','犬','강아지');
  let detail=hero.querySelector('.dp1039-profile-identity');if(!detail){detail=document.createElement('div');detail.className='dp1039-profile-identity';hero.querySelector('.hero-overlay')?.append(detail);}
  detail.innerHTML=`<span>${L('名字','Name','名前','이름')}: ${escape(p.name)}</span><span>${L('類別','Type','種類','종류')}: ${species}</span><span>${L('品種','Breed','品種','품종')}: ${escape(p.breed?.[state.lang]||p.breed?.en||p.breed?.zh||'—')}</span><span>${L('年齡','Age','年齢','나이')}: ${escape(p.age)} ${L('歲','yr','歳','세')}</span><span>${L('體重','Weight','体重','체중')}: ${escape(p.weight)} kg</span>`;
 }
 function fixHome(app){app.querySelectorAll('.dp-summary-lanes .dp105-score-stamp,.dp-summary-lanes .dp1013-score-evidence,.dp-summary-lanes time,.dp1035-priority-tag').forEach(x=>x.remove());
  // Neither score may use a non-adjacent previous observation as "yesterday".
  const scores=root.DeepPetSignalScoring?.getDaily?.(state.dog)||[],current=iso(localDate()),yesterday=iso(dateAdd(localDate(),-1));
  const today=scores.find(x=>x?.date===current),prior=scores.find(x=>x?.date===yesterday);
  for(const [css,key] of [['.dp-health-lane','physiol'],['.dp-rhythm-lane','rhythm']]){
   const lane=app.querySelector(`.dp-summary-lanes ${css}`);if(!lane)continue;
   lane.querySelectorAll('.dp1039-day-delta,.dp105-score-stamp').forEach(x=>x.remove());
   const actual=scoreIn(lane),previous=prior?.scores?.[key];
   if(!isNum(actual)||!isNum(previous)||!isNum(today?.scores?.[key]))continue;
   // Only the SAME daily engine produces both figures; protect against
   // a display adapter rendering a different score than the measured day.
   if(Math.abs(actual-today.scores[key])>1)continue;
   const delta=Math.round(Number(actual)-Number(previous)),elt=document.createElement('span');elt.className='dp1039-day-delta '+(delta>0?'up':delta<0?'down':'flat');elt.textContent=delta>0?`+${delta}`:String(delta);elt.setAttribute('aria-label',L(`比昨天${delta>0?'增加':delta<0?'減少':'持平'} ${Math.abs(delta)} 分`,`Versus yesterday: ${delta>0?'+':''}${delta} points`,`前日比 ${delta>0?'+':''}${delta}`,`어제 대비 ${delta>0?'+':''}${delta}`));lane.querySelector('.dp-lane-copy strong')?.after(elt);
  }
  app.querySelectorAll('.dp-today-focus .dp1035-priority-tag').forEach(x=>x.remove());
  for(const x of app.querySelectorAll('.dp-today-focus .dp-today-action .ai-suggestion-top,.dp-today-more-page .dp-today-action .ai-suggestion-top')){
   // Only the leading *task label*, never user-authored medical notes.
   const title=x.querySelector('b,strong');if(title&&/^(今日|今天)(用藥|用药|恢復|恢复)/.test(title.textContent))title.textContent=title.textContent.replace(/^(今日|今天)/,'');
  }
  newPetInfo(app);
 }
 function fixHealth(app){const pad=app.querySelector('.app-main>.app-pad');if(!pad)return;
  if(pad.classList.contains('dp1075-health-page'))return;
  const prevention=pad.querySelector('.dp941-prevention'),exam=pad.querySelector('.dp916-health-card,.dp914-report-hero'),plan=pad.querySelector('.dp916-care-card');
  if(prevention){const h=prevention.querySelector('.dp941-prevention-heading h2');if(h)h.textContent=L('預防性健康管理','Preventive Health Management','予防健康管理','예방 건강 관리');
   const note=L('依據寵物的品種、年齡與體重，結合可用的個體健康紀錄，由 DeepPet AI 計算引擎推估值得留意的健康重點。','DeepPet AI identifies pet-specific preventive priorities using breed, age, weight and available health records.','品種・年齢・体重と記録からAIが注意点を推定します。','품종·나이·체중과 기록을 바탕으로 AI가 건강 관리 핵심 사항을 분석합니다.');
   let intro=prevention.querySelector('.dp1039-prevention-intro');if(!intro){intro=document.createElement('p');intro.className='dp1039-prevention-intro';prevention.querySelector('.dp941-prevention-heading')?.after(intro);}intro.textContent=note;
  }
  const heads=[...pad.querySelectorAll(':scope>.section-head')],upHead=heads.find(x=>/近期健康提醒|Upcoming care|다가오는 건강|今後の/.test(x.textContent||'')),todoHead=heads.find(x=>/今日待辦|今日待办|Today.?s tasks|오늘 해야/.test(x.textContent||'')),careHead=heads.find(x=>/健康管理|Health management|건강 관리/.test(x.textContent||''));
  if(todoHead){const section=todoHead.nextElementSibling;if(section?.classList.contains('care-todo')&&!section.classList.contains('dp-upcoming-care'))section.remove();todoHead.remove();}
  const upcoming=pad.querySelector('.dp-upcoming-care'),header=pad.firstElementChild;
  if(prevention)header?.after(prevention);
  if(exam)(prevention||header)?.after(exam);
  if(upHead)(exam||prevention||header)?.after(upHead);
  if(upcoming)upHead?.after(upcoming);
  if(plan)(upcoming||upHead||exam||prevention)?.after(plan);
  if(careHead&&plan)plan.after(careHead);
 }
 function markGrade(element,score,metric){if(!isNum(score))return;
  const old=element.querySelector(':scope>.dp1039-risk-chip');if(old)old.remove();
  element.insertAdjacentHTML('beforeend',badge(Math.round(Number(score)),metric));
  const node=element.querySelector(':scope>.dp1039-risk-chip');if(node)node.setAttribute('data-dp1039-score',String(Math.round(Number(score))));
  const card=element.closest('.dp901-metric-card,.dp903-metric-card,.dp901-status-panel,.dp903-overview,.dp-owner-status-card,.dp-owner-period-card');
  if(card)card.dataset.dp1039Tier=tier(score);
 }
 function fixDeep(app){const rootView=app.querySelector('.dp-owner-deep');if(!rootView)return;
  rootView.querySelectorAll('.dp1013-deep-evidence,.dp105-score-stamp').forEach(x=>x.remove());
  // The grade always reads the EXACT numeric score rendered inside its card.
  const seen=new Set();
  for(const card of rootView.querySelectorAll('.dp901-metric-card,.dp903-metric-card')){
   const meter=card.querySelector('.dp901-score-col .dp-status-score,.dp903-score-col .dp-status-score'),score=scoreIn(meter);
   const area=card.querySelector('.dp901-card-head,.dp903-score-col')||card;
   const name=card.querySelector('h3')?.textContent?.trim()||L('生理指標','Health metric','健康指標','건강 지표');
   const old=card.querySelector('.dp901-score-tag,.dp903-grade');if(old)old.remove();
   if(isNum(score)){markGrade(area,score,name);seen.add(area);}
  }
  for(const head of rootView.querySelectorAll('.dp901-overall-head,.dp903-overview-head,.dp-owner-status-heading,.dp-sleep-period-score-head,.dp-heart-period-overall')){
   const score=scoreIn(head),name=head.querySelector('h2')?.textContent?.trim()||L('綜合狀態','Overall status','総合状態','종합 상태');
   if(isNum(score))markGrade(head,score,name);
  }
  // Old inline status colors were keyed to stale variants of the score; make
  // both the grade and background follow the adjacent visible score ring.
  for(const section of rootView.querySelectorAll('.dp66-inline-risk,.dp66-period-risk')){
   const card=section.closest('.dp-vital-panel,.dp901-metric-card,.dp-owner-period-card,.dp-owner-status-card');
   const score=scoreIn(card),name=card?.querySelector('b,h3,h2')?.textContent?.trim()||L('狀態','Status','状態','상태');
   if(!isNum(score))continue;
   section.querySelector('b')?.remove();section.querySelector('.dp1039-risk-chip')?.remove();
   section.insertAdjacentHTML('afterbegin',badge(score,name));
   section.dataset.dp1039Tier=tier(score);
  }
  // Rhythm/load cards show a numeric /100 next to a legacy grade tag. Carry
  // that actual value into the same tappable, correctly colored grade control.
  for(const rhythm of rootView.querySelectorAll('.dp66-rhythm-item')){
   const source=rhythm.querySelector('.dp68-rhythm-score'),raw=source?.textContent||'';
   const m=raw.match(/\b(100|\d{1,2})\s*\/\s*100\b/);
   const n=m?Number(m[1]):null,name=rhythm.querySelector(':scope>b,.dp68-rhythm-head>b')?.textContent?.trim()||L('節奏','Rhythm','リズム','리듬');
   if(!isNum(n))continue;
   rhythm.querySelectorAll('.dp66-grade-badge,.dp69-grade,.dp1039-risk-chip').forEach(node=>node.remove());
   rhythm.insertAdjacentHTML('beforeend',badge(n,name));rhythm.dataset.dp1039Tier=tier(n);
  }
  // Explicitly surface Sleep's 7/30-day grade even when the legacy range
  // view provided a number but its risk line was visually collapsed.
  if(state.deepType===1&&state.range>1){const head=rootView.querySelector('.dp-sleep-period-score-head');if(head&&isNum(scoreIn(head))&&!head.querySelector(':scope>.dp1039-risk-chip'))markGrade(head,scoreIn(head),L('睡眠休息','Sleep & rest','睡眠・休息','수면·휴식'));}
 }
 const priorRender=render;
 render=function(reset=false){priorRender(reset);const app=document.getElementById('app');if(!app)return;
  if(state.tab==='home'&&!state.detail)fixHome(app);
  if(state.tab==='health'&&!state.detail)fixHealth(app);
  if(state.tab==='deep'&&!state.detail)fixDeep(app);
  app.querySelectorAll('.app-build-version').forEach(x=>x.textContent='DeepPet Version '+(root.DeepPetBuildVersion||'10.39'));
 };
 root.DeepPetUX1039=Object.freeze({version:'10.39',tier,label,monthGrid,actualReason});
 root.DeepPetRelease={...root.DeepPetRelease,version:root.DeepPetBuildVersion||'10.39',integrity:[...(root.DeepPetRelease?.integrity||[]),'month-wide-baseline-check-grid','numeric-grade-specific-clickable-reasons','two-yesterday-score-deltas','recovery-todo-gated-by-owner-start','clean-tour-step-indicators-and-full-head-images']};
})(window);
