/* DeepPet V10.42 | precise device/score UI and sustained baseline alerts. */
(function(root){'use strict';
 const L=(zh,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const isFixture=id=>/^DP-VIRTUAL-(?:BT|4G)-\d{3}$/.test(String(id||''));
 const validNum=x=>x!==null&&x!==undefined&&x!==''&&Number.isFinite(Number(x));
 const engine=root.DeepPetUX1040;
 // V10.43: the pre-existing contact/signal-loss mechanism is authoritative.
 // No second manual 'not worn' switch or synthetic disconnect state.
 const previousAction=onAction;
 onAction=function(target){
  if(target?.dataset?.action==='dp1042-joint-open'){
   const info=analyzeDay(target.dataset.date||iso(localDate())).joint;
   if(!info)return;document.querySelector('.dp1042-alert-layer')?.remove();
   const layer=document.createElement('div');layer.className='dp1042-alert-layer';
   layer.innerHTML=`<div class="dp1042-alert-shade" data-action="dp1042-joint-close"></div><section role="dialog" aria-modal="true" aria-label="${L('心肺聯合變化','Combined heart-breathing change','心肺の同時変化','심폐 동시 변화')}" class="dp1042-alert-dialog"><button type="button" data-action="dp1042-joint-close" aria-label="Close" class="dp1042-alert-close">×</button><h2>${L('呼吸與心率同時突然改變','Sudden breathing and heart-rate change','呼吸と心拍数が急変','호흡 및 심박수 급변')}</h2><p><b>${esc(info.time)}</b> · ${L('心率','Heart rate','心拍数','심박수')} ${info.heart.toFixed(0)} bpm（${L('自身參考','own usual','個体基準','개별 기준')} ${info.referenceHeart.toFixed(0)}）；${L('呼吸','Breathing','呼吸','호흡')} ${info.breath.toFixed(0)}/${L('分','min','分','분')}（${L('自身參考','own usual','個体基準','개별 기준')} ${info.referenceBreath.toFixed(0)}）。</p><p>${alertCaution()}</p><button type="button" class="cta full" data-action="dp1042-joint-close">${L('了解','Got it','閉じる','확인')}</button></section>`;
   document.body.append(layer);layer.querySelector('button')?.focus();return;
  }
  if(target?.dataset?.action==='dp1042-joint-close'){document.querySelector('.dp1042-alert-layer')?.remove();return;}
  return previousAction(target);
 };
 document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelector('.dp1042-alert-layer')?.remove();});

 // A date-specific reference is formed only from earlier eligible days with
 // the same owner. 4G/GPS and Bluetooth presentation pairing never authorizes
 // real telemetry; actual-owner alerts require an explicitly verified bridge.
 const alertsCache=new Map();
 function getDay(date){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return null;
  const all=demoRecords(state.dog),row=all.find(x=>x.date===date),idx=all.indexOf(row);
  if(!row||idx<0||!validDaySample(row,idx)?.valid)return null;
  const s=dpSignals(date,['heart','breath','activity']);
  if(![s?.heart,s?.breath,s?.activity].every(a=>Array.isArray(a)&&a.length===1440))return null;
  return {date,heart:s.heart,breath:s.breath,activity:s.activity,valid:true};
 }
 function analyzeDay(date){
  const none={ready:false,events:[],joint:null,reason:'no_qualified_signal'};
  if(selectedBlank()||dp58FreshPet()||state.emptyPreview)return none;
  const real=state.dog>=dogs.length||currentDog()?.dpFixtureInvalidated;
  if(real){
   const bridge=root.DeepPetVerifiedTrendWindowBridge;
   const paired=state.devicesByPet?.[String(state.dog)];
   if(!paired?.connected||!root.DeepPetLiveRadioSession?.matches?.(state.dog,paired.connectedId)||
      typeof bridge?.getVerifiedWindows!=='function')return none;
   const verified=bridge.getVerifiedWindows(state.dog,date);
   if(verified?.source!=='20hz-waveform'||verified?.ownerId!==String(state.dog)||
      verified?.date!==date||verified?.verified!==true||verified?.valid!==true)return none;
   if(![verified.heart,verified.breath,verified.activity,verified.quality].every(a=>Array.isArray(a)&&a.length===1440)||
      !Array.isArray(verified.history)||verified.history.some(r=>
       r?.source!=='20hz-waveform'||r?.ownerId!==String(state.dog)||r?.valid!==true||
       ![r.quality,r.heart,r.breath,r.activity].every(a=>Array.isArray(a)&&a.length===1440)))return none;
   return root.DeepPetTrendAlerts1043?.evaluate(verified)||none;
  }
  const key=[state.dog,date,JSON.stringify(state.signalQualityByPet?.[String(state.dog)]||{}),
   state.petOverrides?.[state.dog]?.dpFixtureInvalidated||false].join('|');
  if(alertsCache.has(key))return alertsCache.get(key);
  const rows=demoRecords(state.dog),earlier=rows.filter(x=>x.date<date).slice(-30),current=getDay(date);
  if(!current)return none;
  const history=earlier.map(x=>getDay(x.date)).filter(Boolean);
  const out=root.DeepPetTrendAlerts1043?.evaluate({...current,history})||none;
  out.events=out.events.map(x=>({...x,date}));if(out.joint)out.joint.date=date;
  alertsCache.set(key,out);if(alertsCache.size>125)alertsCache.clear();return out;
 }
 const formerEvent=root.dp911EventFor;
 root.dp911EventFor=function(date,kind){
  if(!['heart','breath'].includes(kind))return null;
  const current=analyzeDay(date);
  if(current.ready===true)return current.events.find(x=>x.kind===kind)||null;
  // Only synthetic gallery pets may use the older provisional activity-
  // adjusted example before baseline readiness. Real pet data must NEVER
  // fall through to a synthetic/demo event after bridge/quality failure.
  const gallery=state.dog<dogs.length&&!currentDog()?.dpFixtureInvalidated;
  return gallery&&current.reason==='under_14_eligible_days'&&typeof formerEvent==='function'?formerEvent(date,kind):null;
 };
 function alertCaution(){const d=currentDog(),breed=String(d?.breed?.en||d?.breed?.zh||'').toLowerCase(),short=/pug|bulldog|french|八哥|巴哥|鬥牛|斗牛|法鬥|法斗/.test(breed);
  return L(`這只是持續且有效的心率／呼吸聯動變化，無法證明窒息或呼吸道阻塞。${short?'短鼻犬更需留意呼吸費力與喘鳴。':''}如有明顯呼吸費力、牙齦發藍或倒下，請立即聯絡急診獸醫。`,
   `This sustained change does not diagnose choking or airway obstruction. ${short?'Short-nosed breeds merit extra attention for labored/noisy breathing. ':''}Seek emergency veterinary care for breathing distress, blue gums or collapse.`,
   `心拍と呼吸の変化だけでは窒息や気道閉塞は診断できません。呼吸困難・歯ぐきの青紫色・失神時は緊急受診してください。`,
   `동시 변화만으로 질식이나 기도 폐쇄를 진단할 수 없습니다. 호흡 곤란·잇몸 청색증·쓰러짐 시 즉시 응급 동물병원에 연락하세요.`);
 }
 dp66UrgentHome=function(){
  if(selectedBlank()||dp58FreshPet()||!signalQuality().valid)return '';
  const date=iso(localDate()),analysis=analyzeDay(date);
  if(!analysis.ready){const kinds=['heart','breath'].map(k=>root.dp911EventFor(date,k)).filter(Boolean);if(!kinds.length)return '';}
  const events=['breath','heart'].map(k=>root.dp911EventFor(date,k)).filter(Boolean);
  if(!events.length&&!analysis.joint)return '';
  const rows=events.map(x=>{const kind=x.kind==='heart'?L('心率','Heart rate','心拍数','심박수'):L('呼吸','Breathing','呼吸','호흡'),
   sign=x.direction==='low'?L('突然偏低','suddenly low','急低下','급격한 감소'):x.direction==='high'?L('突然偏高','suddenly high','急上昇','급격한 증가'):L('變化明顯','marked change','変化が大きい','변화 큼');
   return `<button class="dp905-milo-item" type="button" data-action="dp911-alert-open" data-date="${esc(date)}" data-kind="${esc(x.kind)}" data-minute="${x.minute}"><span class="dp905-milo-risk ${x.level}">${x.severity>=3?L('高風險','High','高リスク','고위험'):L('中風險','Moderate','中リスク','중위험')}</span><span><b>${kind} ${sign} · ${esc(x.time)}</b><small>${x.value.toFixed(0)} ${x.kind==='heart'?'bpm':L('次／分','/min','回/分','회/분')} · ${L('自身參考','Own baseline','個体基準','개별 기준')} ${x.reference.toFixed(0)}</small></span><span aria-hidden="true">›</span></button>`;
  }).join('');
  const j=analysis.joint,combined=j?`<button type="button" class="dp1042-joint-alert" data-action="dp1042-joint-open" data-date="${esc(date)}"><span class="dp1042-joint-flag">!</span><span><strong>${L('呼吸異常＋心率突然升高','Breathing change + rapid heart-rate rise','呼吸異常＋心拍上昇','호흡 변화 + 심박수 급증')}</strong><small>${esc(j.time)} · ${L('兩項在安靜時持續同時改變；點擊查看依據','Sustained simultaneous change at rest · see evidence','安静時に同時変化・詳細を見る','안정 시 동시 변화 · 자세히 보기')}</small></span><span>›</span></button>`:'';
  return `<section class="card dp905-milo-demo dp1042-alert-section"><div class="dp905-milo-heading"><b>${L('應急提醒','Urgent alerts','緊急通知','긴급 알림')}</b></div>${combined}${rows}<p class="dp911-alert-context">${L('依同一隻寵物先前的有效安靜紀錄與相近活動比較。這些不是疾病診斷；如出現呼吸費力、牙齦發藍或倒下，請立即就醫。','Compared with this pet’s prior valid resting records at similar activity. Not a diagnosis. Seek urgent veterinary care for labored breathing, blue gums or collapse.','安静時の個体基準に基づく参考情報で、診断ではありません。','반려동물의 안정 시 기준과 비교한 참고 정보이며 진단이 아닙니다.')}</p></section>`;
 };

 // One primary score => one directly-under-ring clickable status, including
 // sleep on 1, 7 and 30 days. Never touch other metric cards' own statuses.
 function statusFor(host,key){
  const ring=host?.querySelector('.dp-status-score[data-score]');if(!ring)return;
  const score=ring.dataset.score;
  const duplicates=['.dp1040-status','.dp903-grade','.dp901-score-tag','.dp69-grade','.dp75-risk','.dp1039-risk-chip','.dp66-inline-risk','.dp66-grade-badge','.dp90-status'];
  for(const selector of duplicates)host.querySelectorAll(selector).forEach(x=>x.remove());
  const parent=ring.parentElement;
  let stack=host.querySelector(':scope>.dp1042-score-stack');
  if(!stack){stack=document.createElement('div');stack.className='dp1042-score-stack';host.append(stack);}
  if(ring.parentElement!==stack)stack.append(ring);
  for(const empty of host.querySelectorAll('.dp1040-score-stack,.dp69-score-aside,.dp75-overview-aside'))
   if(empty!==stack&&!empty.querySelector('.dp-status-score')&&!empty.textContent.trim())empty.remove();
  if(validNum(score)){
   const n=Number(score),s=document.createElement('span');s.className=`dp1040-status dp1040-tier-${engine.tier(n)} dp1042-only-grade`;
   s.textContent=engine.label(n);s.dataset.dp1040Score=String(n);s.dataset.dp1040Key=key;
   s.setAttribute('role','button');s.tabIndex=0;s.setAttribute('aria-label',`${engine.label(n)} · ${L('查看原因','Why this grade','理由を見る','이유 보기')}`);
   stack.append(s);
  }
  if(parent!==stack&&parent?.classList?.contains('dp1040-score-stack')&&!parent.children.length)parent.remove();
 }
 function cleanDeep(app){const deep=app.querySelector('.dp-owner-deep');if(!deep)return;
  for(const host of deep.querySelectorAll('.dp903-overview-head .dp903-score-col,.dp901-overall-head .dp901-score-col,.dp903-metric-card .dp903-score-col,.dp901-metric-card .dp901-score-col')){
   // Original meter columns already reserve space for a single grade.
   host.querySelectorAll('.dp1040-status,.dp903-grade,.dp901-score-tag,.dp69-grade').forEach(x=>x.remove());
   const ring=host.querySelector('.dp-status-score[data-score]'),n=Number(ring?.dataset.score);
   if(!ring||!validNum(ring.dataset.score))continue;
   const s=document.createElement('span');s.className=`dp1040-status dp1040-tier-${engine.tier(n)}`;
   let key=Number(state.deepType)===0?'cardio':'activityRecovery';
   const metric=host.closest('.dp903-metric-card,.dp901-metric-card');
   if(metric){key=metric.dataset.dp903Metric||['energy','recovery','calm'][[...metric.parentElement.children].filter(x=>x.classList?.contains('dp901-metric-card')).indexOf(metric)]||key;}
   s.textContent=engine.label(n);s.dataset.dp1040Score=String(n);s.dataset.dp1040Key=key;s.setAttribute('role','button');s.tabIndex=0;host.append(s);
  }
  for(const host of deep.querySelectorAll('.dp-owner-status-heading,.dp-sleep-period-score-head,.dp-heart-period-overall,.dp905-sleep-summary>.dp905-sleep-head')){
   const key=Number(state.deepType)===1?'sleep':Number(state.deepType)===0?'cardio':'activityRecovery';
   statusFor(host,key);
  }
  // Legacy inline status immediately below the main header is a duplicate
  // of the under-ring grade, not a separate risk dimension.
  if(Number(state.deepType)===1)deep.querySelectorAll('.dp-owner-status-card>.dp66-status-alert,.dp-owner-period-card>.dp66-period-risk').forEach(x=>x.remove());
 }
 const prevRender=render;
 render=function(reset=false){prevRender(reset);const app=document.getElementById('app');if(!app)return;
  if(state.tab==='deep'&&!state.detail)cleanDeep(app);
  app.querySelectorAll('.app-build-version').forEach(x=>x.textContent='DeepPet Version '+(root.DeepPetBuildVersion||'10.43'));
 };
 root.DeepPetUX1042=Object.freeze({version:'10.42',analyzeDay,cleanDeep,isFixture});
 root.DeepPetRelease={...root.DeepPetRelease,version:root.DeepPetBuildVersion||'10.43',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'showcase-pets-default-paired-without-false-sdk','unpaired-have-no-battery','existing-automatic-contact-loss-signal-handling','paired-device-numeric-battery','single-sleep-grade-on-day-7-30','bounded-baseline-chart','14-valid-day-sustained-hr-rr-directional-alerts','joint-respiratory-heart-alert-is-not-diagnosis',
  'context-matched-personal-alert-reference','strict-minute-quality-truth','no-motion-transition-false-alert','robust-fourteen-day-personal-mean','minimum-period-score-coverage']};
})(window);
