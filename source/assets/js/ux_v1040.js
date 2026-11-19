/* DeepPet V10.40 — one score, one original status, evidence-led reasons.
   A presentation-only repair; no readings or risk cutoffs are overwritten. */
(function(root){'use strict';
 const L=(zh,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
 const avg=values=>{const a=values.filter(finite).map(Number);return a.length?a.reduce((s,v)=>s+v,0)/a.length:null;};
 const fmt=(x,places=0)=>finite(x)?Number(x).toFixed(places):'—';
 const tier=n=>!finite(n)?'unknown':Number(n)>=90?'healthy':Number(n)>=80?'mild':Number(n)>=60?'moderate':'high';
 const label=n=>({healthy:L('健康','Healthy','健康','건강'),mild:L('輕風險','Mild risk','軽度リスク','경도 위험'),moderate:L('中風險','Moderate risk','中リスク','중간 위험'),high:L('高風險','High risk','高リスク','높은 위험'),unknown:L('資料不足','Insufficient data','データ不足','자료 부족')})[tier(n)];
 const meterScore=el=>{const meter=el?.matches?.('.dp-status-score[data-score]')?el:el?.querySelector?.('.dp-status-score[data-score]');return meter&&finite(meter.dataset.score)?Number(meter.dataset.score):null;};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const period=()=>Number(state.range)===1?L('本日','Today','今日','오늘'):L(`最近 ${Number(state.range)||7} 日`,`Last ${Number(state.range)||7} days`,`直近${Number(state.range)||7}日`,`최근 ${Number(state.range)||7}일`);
 function sourceRows(){
  // Never attribute the investor fixture's fabricated measurements to a pet
  // with a real 20 Hz SDK stream. These rows must pass the original verified
  // wearing gate and retain their originating sensor feature object.
  if(typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements()){
   const api=root.DeepPetSignalScoring,features=api?.getFeatures?.(state.dog)||[];
   return features.filter(r=>r?.source==='20hz-waveform'&&api?.isVerifiedWear?.(r)===true)
    .map((r,idx)=>({...r,heart:r.heartRate,breath:r.breathRate,activity:r.motionMean,idx,dp1040Real:true}));
  }
  return (typeof demoRecords==='function'?demoRecords(state.dog):[]).map((r,idx)=>({...r,idx}));
 }
 function activeRows(){
  const rows=sourceRows();
  const valid=rows.filter(r=>r.dp1040Real||typeof validDaySample!=='function'||validDaySample(r,r.idx)?.valid===true);
  if(Number(state.range)===1){const chosen=typeof deepChosenDate==='function'?deepChosenDate():state.deepSelectedDate||iso(localDate());return valid.filter(r=>r.date===chosen);}
  const last=iso(localDate()),start=iso(dateAdd(localDate(),1-(Number(state.range)||7)));
  return valid.filter(r=>r.date>=start&&r.date<=last);
 }
 function keyFor(group){
  const explicit=group.closest('.dp903-metric-card')?.dataset.dp903Metric;
  if(explicit)return explicit;
  const title=group.closest('.dp901-metric-card,.dp-vital-panel,.dp66-rhythm-item')?.querySelector('h3,b')?.textContent||'';
  if(/恢復|恢复|recovery|回復|회복/i.test(title))return 'recovery';
  if(/放鬆|放松|平穩|calm|steadiness|リラックス|안정/i.test(title))return 'calm';
  if(/精力|energy|活力|활력/i.test(title))return 'energy';
  if(/呼吸|breath|呼吸|호흡/i.test(title))return 'breath';
  if(/心跳|心率|heart rate|心拍|심박/i.test(title))return 'heart';
  if(/HRV|RMSSD|SDNN/i.test(title))return 'hrv';
  if(/心搏|rhythm|リズム|리듬/i.test(title))return 'stable';
  if(group.closest('.dp903-overview.dp903-heart,.dp-heart-period-overall'))return 'cardio';
  if(group.closest('.dp903-overview,.dp901-overall-head,.dp-period-activity'))return 'activityRecovery';
  return Number(state.deepType)===0?'cardio':Number(state.deepType)===1?'sleep':'activityRecovery';
 }
 function nameFor(group,key){
  const card=group.closest('.dp903-metric-card,.dp901-metric-card,.dp-vital-panel,.dp66-rhythm-item');
  const title=card?.querySelector('h3,.dp903-metric-left h3,.dp901-card-copy h3,b')?.textContent?.trim();
  if(title)return title;
  return ({cardio:L('心肺綜合狀態','Cardio status','心肺総合状態','심폐 종합 상태'),sleep:L('睡眠休息','Sleep and rest','睡眠・休息','수면·휴식'),activityRecovery:L('精力與恢復','Energy and recovery','活力・回復','활력·회복')})[key]||key;
 }
 function attachStatus(col,key){
  const score=meterScore(col),old=col.querySelector(':scope > .dp903-grade,:scope > .dp901-score-tag,:scope > .dp1040-status');
  if(!finite(score)){if(old){old.textContent=label(null);old.removeAttribute('data-dp1040-score');}return;}
  const status=old||document.createElement('span');
  status.className=`dp1040-status dp1040-tier-${tier(score)}`;
  status.textContent=label(score);status.setAttribute('role','button');status.setAttribute('tabindex','0');
  status.setAttribute('data-dp1040-score',String(Math.round(score)));status.setAttribute('data-dp1040-key',key);
  status.setAttribute('aria-label',`${nameFor(col,key)} · ${label(score)} · ${L('查看原因','Why this result','理由を見る','이유 보기')}`);
  if(!old)col.appendChild(status);
  const card=col.closest('.dp903-metric-card,.dp901-metric-card');if(card)card.dataset.dp1039Tier=tier(score);
 }
 function ensureScoreStack(head,key){
  if(!head||head.querySelector('.dp903-score-col,.dp901-score-col'))return;
  const ring=[...head.children].find(x=>x.matches?.('.dp-status-score[data-score]'))||head.querySelector(':scope > .dp-status-score[data-score]');
  if(!ring)return;
  const wrap=document.createElement('div');wrap.className='dp1040-score-stack';ring.before(wrap);wrap.append(ring);attachStatus(wrap,key);
 }
 function normalizeDeep(app){
  const view=app.querySelector('.dp-owner-deep');if(!view)return;
  // V10.39 inserted separate buttons in the heading. Remove them all; the
  // original score-under-ring status is now the sole interactive affordance.
  view.querySelectorAll('.dp1039-risk-chip').forEach(n=>n.remove());
  view.querySelectorAll('.dp903-overview-copy>h3,.dp901-overall-copy>.dp901-overall-verdict').forEach(n=>n.remove());
  view.querySelectorAll('.dp66-period-risk,.dp66-inline-risk,.dp69-grade,.dp66-grade-badge').forEach(n=>n.remove());
  // Some older 7/30-day renderers combine another grade and repeated /100
  // average inside the heading's left paragraph. The score ring already
  // provides both the number and (below it) its unique status.
  for(const head of view.querySelectorAll('.dp-heart-period-overall,.dp-sleep-period-score-head,.dp-owner-status-heading')){
   for(const p of head.querySelectorAll(':scope > div:first-child > p')){
    if(p.matches('.dp-heart-overall-verdict,.dp-owner-subsummary')||/^(健康|轻风险|輕風險|中風險|中风险|高風險|高风险|Healthy|Mild risk|Moderate risk|High risk)/i.test(p.textContent.trim()))p.remove();
   }
  }
  for(const col of view.querySelectorAll('.dp903-score-col,.dp901-score-col'))attachStatus(col,keyFor(col));
  // Sleep's period view uses a bare score ring (not a score column), which is
  // why its 7/30-day risk grade kept disappearing in earlier releases.
  for(const sel of ['.dp-owner-status-heading','.dp-sleep-period-score-head','.dp-heart-period-overall','.dp74-overview-head','.dp-vital-heading']){
   for(const head of view.querySelectorAll(sel)){ensureScoreStack(head,keyFor(head));}
  }
  // Legacy heart/sleep detail cards sometimes wrap the number inside a
  // dp69-score-aside. These also need their one status *below* the number.
  for(const ring of view.querySelectorAll('.dp-status-score[data-score]')){
   if(ring.closest('.dp903-score-col,.dp901-score-col,.dp1040-score-stack'))continue;
   const aside=ring.closest('.dp69-score-aside,.dp68-rhythm-score');
   if(aside)attachStatus(aside,keyFor(aside));
  }
  view.querySelectorAll('.dp-heart-overall-verdict').forEach(n=>{if(n.closest('.dp-sleep-period-score-head,.dp-owner-status-heading,.dp-heart-period-overall'))n.remove();});
  // A few legacy rhythm cards use a plain /100 value without a ring.
  for(const card of view.querySelectorAll('.dp66-rhythm-item')){
   const scoreText=card.querySelector('.dp68-rhythm-score')?.textContent||'',m=scoreText.match(/\b(100|\d{1,2})\s*\/\s*100\b/);
   if(!m)continue;const container=card.querySelector('.dp68-rhythm-score');
   let status=container.querySelector('.dp1040-status');if(!status){status=document.createElement('span');status.className='dp1040-status';container.append(status);}
   const n=Number(m[1]);status.className=`dp1040-status dp1040-tier-${tier(n)}`;status.textContent=label(n);status.setAttribute('role','button');status.tabIndex=0;status.dataset.dp1040Score=String(n);status.dataset.dp1040Key=keyFor(card);
  }
 }
 function compared(values,ref){if(!finite(values)||!finite(ref))return '';
  const diff=Number(values)-Number(ref);return Math.abs(diff)<.05?L('，與較早紀錄接近','; similar to earlier readings','、以前の記録と同程度','; 이전 기록과 유사'):
   diff>0?L(`，較早前高 ${fmt(diff,1)}` ,`; up ${fmt(diff,1)} vs earlier`,`、以前より ${fmt(diff,1)} 高い`,`; 이전보다 ${fmt(diff,1)} 높음`):
          L(`，較早前低 ${fmt(-diff,1)}`,`; down ${fmt(-diff,1)} vs earlier`,`、以前より ${fmt(-diff,1)} 低い`,`; 이전보다 ${fmt(-diff,1)} 낮음`);
 }
 function actualCause(key,score,origin){
  if(tier(score)==='healthy')return L('這段時間的有效評分接近日常參考，沒有需要優先處理的分數偏離；仍應觀察實際精神、食慾與呼吸。','Eligible scores are close to this pet’s routine. Continue observing appetite, energy and breathing; a high score is not a diagnosis.','有効スコアは普段に近い状態です。食欲・元気・呼吸も引き続き観察してください。','유효 점수가 평소와 비슷합니다. 식욕, 활력, 호흡도 함께 관찰하세요.');
  const rows=activeRows(),scope=origin?.closest('.dp903-overview,.dp901-health-score,.dp-owner-status-card,.dp-owner-period-card');
  if(['cardio','activityRecovery'].includes(key)&&scope){
   const entries=[...scope.querySelectorAll('.dp903-metric-card,.dp901-metric-card')].map(card=>({name:card.querySelector('h3')?.textContent?.trim(),score:meterScore(card)})).filter(x=>x.name&&finite(x.score)).sort((a,b)=>a.score-b.score);
   if(entries.length){const focus=entries.slice(0,Math.min(2,entries.length));return L(`主要受到${focus.map(x=>`${x.name} ${x.score} 分`).join('、')}影響；這些是此項綜合分中相對較低的指標。`,`The lowest contributing measures are ${focus.map(x=>`${x.name} ${x.score}/100`).join(' and ')}.`,`低い項目は${focus.map(x=>`${x.name} ${x.score}点`).join('、')}です。`,`영향이 큰 하위 지표는 ${focus.map(x=>`${x.name} ${x.score}점`).join(', ')}입니다.`);}
  }
  if(!rows.length)return L('本期沒有可核對的有效逐日記錄，暫不能提供具體原因。','No eligible daily evidence is available for a specific explanation.','比較できる有効な日次記録がありません。','비교 가능한 유효 일일 기록이 없습니다.');
  const all=sourceRows(),startIdx=rows[0].idx;
  const prior=all.slice(Math.max(0,startIdx-14),startIdx).filter(r=>r.dp1040Real||validDaySample(r,r.idx)?.valid);
  if(key==='heart'||key==='breath'){
   const prop=key==='heart'?'heart':'breath',unit=key==='heart'?'bpm':L('次／分','/min','回/分','회/분');
   const here=avg(rows.map(r=>r[prop])),before=avg(prior.map(r=>r[prop]));
   return L(`${period()}平均${key==='heart'?'心率':'呼吸'} ${fmt(here,1)} ${unit}${compared(here,before)}；請對照同一時段的活動量與曲線波動。`,`${period()} average ${key==='heart'?'heart rate':'breathing'}: ${fmt(here,1)} ${unit}${compared(here,before)}. Compare activity and the corresponding trend.`,`${period()}：${fmt(here,1)} ${unit}。日内推移と活動を確認してください。`,`${period()} 평균 ${fmt(here,1)} ${unit}; 활동량과 시간대별 추세를 확인하세요.`);
  }
  if(key==='sleep'){
   if(rows[0].dp1040Real){const nights=rows.map(r=>r.restHours).filter(finite);
    return nights.length?L(`${period()}每晚平均記錄到 ${fmt(avg(nights),1)} 小時安靜休息；目前資料未提供可核對的夜間中斷次數。`,`${period()} averaged ${fmt(avg(nights),1)} hours of recorded quiet rest per night. Verified interruption counts are not available.`,`${period()}の安静休息は平均 ${fmt(avg(nights),1)} 時間です。`,`${period()} 평균 안정 휴식은 ${fmt(avg(nights),1)}시간입니다.`):L('這段期間沒有可核對的夜間休息時長，無法說明睡眠分數的具體原因。','No verified nightly rest duration is available to explain this score.','睡眠時間の有効データがありません。','검증된 야간 휴식 시간이 없습니다.');}
   const nights=rows.map(r=>typeof dpNightSleepStats==='function'?dpNightSleepStats(r.idx):null).filter(Boolean);
   if(nights.length)return L(`${period()}每晚平均安靜休息 ${fmt(avg(nights.map(x=>x.minutes))/60,1)} 小時，平均中斷 ${fmt(avg(nights.map(x=>x.wakes)),1)} 次；睡眠分數根據休息時長及中斷情況形成。`,`${period()} averaged ${fmt(avg(nights.map(x=>x.minutes))/60,1)} hours of quiet rest and ${fmt(avg(nights.map(x=>x.wakes)),1)} interruptions per night; those patterns inform the rest score.`,`${period()}、夜間の平均休息は${fmt(avg(nights.map(x=>x.minutes))/60,1)}時間、中断${fmt(avg(nights.map(x=>x.wakes)),1)}回です。`,`${period()} 밤 평균 휴식 ${fmt(avg(nights.map(x=>x.minutes))/60,1)}시간, 중단 ${fmt(avg(nights.map(x=>x.wakes)),1)}회입니다.`);
  }
  if(key==='recovery'){
   if(rows[0].dp1040Real){const drop=avg(rows.map(r=>r.recoveryDrop));return finite(drop)?L(`${period()}有實際兩分鐘心率回落紀錄，平均下降 ${fmt(drop,1)} bpm。`,`${period()} verified two-minute heart-rate decline averaged ${fmt(drop,1)} bpm.`,`${period()}の実測2分間心拍低下は平均 ${fmt(drop,1)} bpm。`,`${period()} 검증된 2분 심박 하강 평균 ${fmt(drop,1)} bpm.`):L('本期未取得可核對的兩分鐘恢復記錄，暫無法解釋恢復分級。','No verified two-minute recovery is available to explain the grade.','2分間の回復記録がありません。','검증된 2분 회복 기록이 없습니다.');}
   const rec=rows.map(r=>typeof dpOwnerRecoveryComparison==='function'?dpOwnerRecoveryComparison(r):null).filter(x=>x&&finite(x.average));
   const drop=avg(rec.map(r=>r.average)),reference=avg(rec.map(r=>r.reference));
   if(finite(drop))return L(`${period()}活動結束後兩分鐘內，心率平均下降 ${fmt(drop,1)} bpm${finite(reference)?`；相似活動的過往參考為 ${fmt(reference,1)} bpm`:''}。恢復分數反映回落幅度的比較。`,`${period()}: two-minute heart-rate drop ${fmt(drop,1)} bpm${finite(reference)?`, versus ${fmt(reference,1)} bpm for similar prior exertion`:''}. The recovery score reflects that comparison.`,`${period()}の2分間の心拍低下は${fmt(drop,1)} bpmです。`,`${period()} 2분 심박 하강은 ${fmt(drop,1)} bpm입니다.`);
  }
  if(key==='hrv'){
   const rm=avg(rows.map(r=>r.rmssd)),sd=avg(rows.map(r=>r.sdnn)),old=avg(prior.map(r=>r.rmssd));
   return L(`${period()} RMSSD ${fmt(rm,1)} ms、SDNN ${fmt(sd,1)} ms${finite(old)?`；早前 RMSSD 均值 ${fmt(old,1)} ms`:''}。本項比較的是心搏間隔變化與自身紀錄。`,`${period()} RMSSD ${fmt(rm,1)} ms, SDNN ${fmt(sd,1)} ms${finite(old)?`; previous RMSSD ${fmt(old,1)} ms`:''}. The score compares beat-interval variation.`,`${period()} RMSSD ${fmt(rm,1)} ms、SDNN ${fmt(sd,1)} ms。`,`${period()} RMSSD ${fmt(rm,1)}ms, SDNN ${fmt(sd,1)}ms.`);
  }
  if(key==='energy'){
   const current=avg(rows.map(r=>r.activity)),before=avg(prior.map(r=>r.activity));
   return L(`${period()}活動量指標平均 ${fmt(current,1)}${compared(current,before)}；精力分數還結合休息與活動節奏。`,`${period()} activity index ${fmt(current,1)}${compared(current,before)}; energy also reflects rest and activity timing.`,`${period()}活動指数 ${fmt(current,1)}。休息と活動のリズムも評価します。`,`${period()} 활동 지표 ${fmt(current,1)}; 휴식 및 활동 리듬도 반영합니다.`);
  }
  if(key==='calm'||key==='stable'){
   if(rows[0].dp1040Real)return L('本期已確認有有效心搏訊號，但沒有足夠的對應安靜時分項證據可解釋這一分級。','Verified heartbeat data exists, but sufficient quiet-time evidence for this particular grade is unavailable.','心拍信号は有効ですが、この項目の理由を示すデータが不足しています。','심박 신호는 확인됐지만 이 등급에 대한 안정 시 근거가 부족합니다.');
   const value=r=>{const raw=rhythmData()?.values?.[r.idx];return raw&&typeof rhythmPositiveValue==='function'?rhythmPositiveValue(key,raw):null;};
   const current=avg(rows.map(value)),before=avg(prior.map(value));
   return L(`${period()}${key==='calm'?'放鬆與平穩度':'心搏節奏穩定度'}平均 ${fmt(current,0)} 分${compared(current,before)}；此結果來自安靜時心搏變化。`,`${period()} ${key==='calm'?'calm/steadiness':'heartbeat stability'} averaged ${fmt(current,0)}/100${compared(current,before)}, using quiet-time beat patterns.`,`${period()}平均 ${fmt(current,0)} 点。安静時の心拍変動を比較します。`,`${period()} 평균 ${fmt(current,0)}점, 안정 시 심박 패턴을 비교합니다.`);
  }
  return L(`${period()}的有效分數為 ${Math.round(score)}，請查看此項下方的具體趨勢。`,`The eligible period score is ${Math.round(score)}. See its underlying trend.`,`期間スコアは ${Math.round(score)} 点です。`,`기간 점수는 ${Math.round(score)}점입니다.`);
 }
 function openCause(target){const score=Number(target.dataset.dp1040Score),key=target.dataset.dp1040Key||'sleep';if(!Number.isFinite(score))return;
  const name=nameFor(target,key),why=actualCause(key,score,target);document.querySelector('.dp1040-reason-layer')?.remove();
  const wrap=document.createElement('div');wrap.className='dp1040-reason-layer';wrap.innerHTML=`<div class="dp1040-reason-backdrop" data-dp1040-dismiss></div><section class="dp1040-reason-sheet" role="dialog" aria-modal="true" aria-label="${esc(name)}"><button class="dp1040-reason-close" data-dp1040-dismiss aria-label="${L('關閉','Close','閉じる','닫기')}" type="button">×</button><small>${esc(name)} · ${esc(period())}</small><h2 class="dp1040-tier-${tier(score)}">${esc(label(score))} · ${Math.round(score)}/100</h2><p>${esc(why)}</p></section>`;
  document.body.append(wrap);wrap.querySelector('.dp1040-reason-close')?.focus();
 }
 document.addEventListener('click',e=>{const badge=e.target.closest?.('[data-dp1040-score]');if(badge){e.preventDefault();e.stopImmediatePropagation();openCause(badge);return;}
  if(e.target.closest?.('[data-dp1040-dismiss]')){e.preventDefault();document.querySelector('.dp1040-reason-layer')?.remove();}},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelector('.dp1040-reason-layer')?.remove();if(['Enter',' '].includes(e.key)&&e.target?.matches?.('[data-dp1040-score]')){e.preventDefault();openCause(e.target);}},true);
 function fixToday(app){
  for(const lane of app.querySelectorAll('.dp-summary-lanes .dp-summary-lane')){
   lane.querySelectorAll('.dp999-daily-delta,.dp1039-day-delta,.dp105-score-stamp,.dp1013-score-evidence,.dp1040-score-change').forEach(n=>n.remove());
   const heading=lane.querySelector('.dp-lane-copy>strong'),titleRow=lane.querySelector('.dp1040-score-title');
   if(heading&&!titleRow){const holder=document.createElement('span');holder.className='dp1040-score-title';heading.before(holder);holder.append(heading);}
  }
  if(selectedBlank()||dp58FreshPet()||isFreePet()||!signalQuality().valid)return;
  const records=demoRecords(state.dog),today=iso(localDate()),yest=iso(dateAdd(localDate(),-1));
  const idx=records.findIndex(r=>r.date===today),prev=records[idx-1];
  if(idx<1||!prev||prev.date!==yest||!validDaySample(prev,idx-1)?.valid||!validDaySample(records[idx],idx)?.valid)return;
  const previous=dpOwnerDayScores({...prev,idx:idx-1},true),prevPhys=dpPhysiolComposite(previous.heart,previous.sleep,previous.energyActivity);
  const prevRhythm=rhythmCompositeScore(rhythmData()?.values?.[idx-1]);
  for(const [selector,oldScore] of [['.dp-health-lane',prevPhys],['.dp-rhythm-lane',prevRhythm]]){
   const lane=app.querySelector(`.dp-summary-lanes ${selector}`),now=lane?meterScore(lane):null;
   if(!lane||!finite(now)||!finite(oldScore))continue;
   const diff=Math.round(now)-Math.round(oldScore),el=document.createElement('span');el.className=`dp1040-score-change ${diff>0?'up':diff<0?'down':'flat'}`;
   el.textContent=diff>0?`▲ +${diff}`:diff<0?`▼ −${Math.abs(diff)}`:'→ 0';
   el.setAttribute('aria-label',L(`比昨天${diff>0?'增加':diff<0?'減少':'持平'} ${Math.abs(diff)} 分`,`Versus yesterday: ${diff>0?'+':''}${diff}`,`前日比 ${diff>0?'+':''}${diff}`,`어제 대비 ${diff>0?'+':''}${diff}`));
   lane.querySelector('.dp1040-score-title')?.append(el);
  }
 }
 function profileOnlyBasics(app){
  if(state.emptyPreview||!dp58FreshPet()||state.detail)return;
  const pet=currentDog(),name=pet.name||'',breed=typeof breedText==='function'?breedText(pet):pet.breed?.en||'';
  if(!name||!breed||!finite(pet.age)||!finite(pet.weight)||Number(pet.weight)<=0)return;
  // A first-time, profile-only pet uses dp58FreshEmptyTab() for Me, not the
  // ordinary .profile-hero. Always show all four details in either renderer.
  const target=state.tab==='home'?app.querySelector('.dp935-empty-hero,.home-hero-poster'):state.tab==='me'?app.querySelector('.dp58-first-page .dp58-first-empty,.dp931-profile-hero,.profile-hero'):null;
  if(!target)return;
  target.querySelectorAll('.dp1039-profile-identity').forEach(x=>x.remove());
  target.parentElement?.querySelectorAll(':scope>.dp1040-pet-basics').forEach(x=>x.remove());
  const info=document.createElement('section');info.className='dp1040-pet-basics';
  info.innerHTML=`<span><small>${L('名字','Name','名前','이름')}</small><strong>${esc(name)}</strong></span><span><small>${L('品種','Breed','品種','품종')}</small><strong>${esc(breed)}</strong></span><span><small>${L('年齡','Age','年齢','나이')}</small><strong>${esc(pet.age)} ${L('歲','yr','歳','세')}</strong></span><span><small>${L('體重','Weight','体重','체중')}</small><strong>${esc(pet.weight)} kg</strong></span>`;
  target.after(info);
 }
 const original=render;
 render=function(reset=false){original(reset);const app=document.getElementById('app');if(!app)return;
  if(state.tab==='deep'&&!state.detail)normalizeDeep(app);
  if(state.tab==='home'&&!state.detail)fixToday(app);
  // Me already shows the four basics in the shared profile hero. Inserting
  // an extra card only for Lucky created a different DOM hierarchy there.
  if(state.tab==='home'&&!state.detail)profileOnlyBasics(app);
  app.querySelectorAll('.app-build-version').forEach(el=>el.textContent='DeepPet Version '+(root.DeepPetBuildVersion||'10.40'));
 };
 root.DeepPetUX1040=Object.freeze({version:'10.40',tier,label,activeRows,actualCause,normalizeDeep,profileOnlyBasics});
 root.DeepPetRelease={...root.DeepPetRelease,version:root.DeepPetBuildVersion||'10.40',integrity:[...(root.DeepPetRelease?.integrity||[]),'single-under-score-existing-status-no-new-risk-buttons','evidence-specific-metric-reasons','visible-sleep-period-status','full-lucky-basics-on-home-and-me','side-by-side-yesterday-arrows','noncropped-onboarding-pet-art']};
})(window);
