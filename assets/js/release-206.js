/* V10.214 — 4G-only product flow, date calendar, and wellness drill-down.
 * Presentation pairing never authenticates telemetry. Historical scores are read-only.
 */
(function(root){'use strict';
const L=(z,e,k)=>state.lang==='en'?e:state.lang==='ko'?k:state.lang==='zh'?toSimplified(z):z;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const dateOK=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||'')&&Number.isFinite(Date.parse(x+'T12:00:00Z'))&&new Date(x+'T12:00:00Z').toISOString().slice(0,10)===x;
const today=()=>iso(localDate());
const preview=()=>!state.emptyPreview&&state.connected===true&&state.deviceType==='4g'&&/^DP-VIRTUAL-4G-\d{3}$/.test(state.connectedId||'')&&state.dog<dogs.length&&(state.dog===0||!currentDog().dpFixtureInvalidated);
const paired=()=>!state.emptyPreview&&state.connected===true&&state.deviceType==='4g'&&gpsForCurrentPet();
const freshLocation=()=>{const v=state.geoPositionsByPet?.[String(state.dog)];return root.DeepPetLiveRadioSession?.matches?.(state.dog,state.connectedId)===true&&v?.source==='verified-4g-gps'&&v.deviceId===state.connectedId&&Array.isArray(v.point)&&v.point.length===2&&v.point.every(finite)&&v.point[0]>=0&&v.point[0]<=360&&v.point[1]>=0&&v.point[1]<=240&&finite(v.time)&&Date.now()-v.time>=-5000&&Date.now()-v.time<120000;};
const located=()=>paired()&&(preview()||freshLocation());
const calendarState=()=>{const c=state.dp204Calendar;return c&&state.tab==='deep'&&state.detail==='dp90-waveform'&&c.pet===state.dog&&c.epoch===state.dpPetEpoch&&[7,30].includes(c.range)?c:null;};
const grade=s=>!finite(s)?'none':s>=90?'normal':s>=80?'light':s>=60?'medium':'high';
const names=()=>({normal:L('健康','Healthy','건강'),light:L('低風險','Low risk','낮은 위험'),medium:L('中風險','Moderate risk','중간 위험'),high:L('高風險','High risk','높은 위험'),none:L('無資料','No data','자료 없음')});
function periodScores(c){
 if(state.emptyPreview||selectedBlank())return new Map();
 const rows=root.DeepPetSignalScoring?.getDaily(state.dog)||[];
 return new Map(rows.filter(r=>r&&dateOK(r.date)).map(r=>[r.date,r.scores?.[c.kind]??r.unified?.scores?.[c.kind]??null]));
}
function calendar(c){
 const scores=periodScores(c), labels=names();
 const dates=Array.from({length:c.range},(_,i)=>root.DeepPetUnifiedDeep.dateAdd(c.anchor,i-c.range+1));
 const weekdays=state.lang==='en'?['Mon','Tue','Wed','Thu','Fri','Sat','Sun']:state.lang==='ko'?['월','화','수','목','금','토','일']:['一','二','三','四','五','六','日'];
 const empty='<span class="dp905-cal-empty" aria-hidden="true"></span>'.repeat((new Date(dates[0]+'T12:00:00Z').getUTCDay()+6)%7);
 const cells=dates.map(d=>{const v=scores.get(d),g=grade(v),selected=d===state.dp90WaveDate;return `<button type="button" class="dp905-cal-day dp908-solid-day ${g}${selected?' dp204-selected':''}" data-action="dp204-wave-date" data-kind="${c.kind}" data-date="${d}" data-score="${finite(v)?v:''}" aria-pressed="${selected}" aria-label="${d} · ${labels[g]}${finite(v)?' · '+v+'/100':''}"><small>${d.slice(5,7)}/${d.slice(8)}</small><strong>${d.slice(8)}</strong><span class="dp908-day-mark" aria-hidden="true">${g==='normal'?'✓':g==='none'?'—':'•'}</span></button>`}).join('');
 return `<section class="card dp905-calendar-panel dp908-calendar-panel dp204-wave-calendar"><div class="dp905-cal-head"><h3>${L(`最近 ${c.range} 天`,`Last ${c.range} days`,`최근 ${c.range}일`)}</h3></div><p class="dp905-cal-help">${L('選擇日期查看當天波形','Select a date to view its waveform','날짜를 선택해 파형을 확인하세요')}</p><div class="dp905-calendar"><div class="dp905-weekdays">${weekdays.map(x=>`<span>${x}</span>`).join('')}</div><div class="dp905-calendar-grid">${empty}${cells}</div></div><div class="dp905-calendar-legend dp908-four-legend">${['normal','light','medium','high'].map(g=>`<span><i class="${g}"></i>${labels[g]}</span>`).join('')}</div><p class="dp204-calendar-note">${L('灰色：無有效分數','Grey: no valid score','회색: 유효 점수 없음')}</p></section>`;
}
function selectDate(c,date){if(!dateOK(date)||date>c.anchor||date<root.DeepPetUnifiedDeep.dateAdd(c.anchor,1-c.range))return;
 state.dp204Calendar=c;state.dp90WaveKind=c.kind;state.dp90WaveDate=date;state.dp905ChosenDate=date;state.dp905WaveMode='day';state.dp905WaveRange=c.range;state.dp932WaveDays=1;state.dp905PickedEvent=0;state.dp932WaveMinute=null;state.dp904WaveSelected=0;state.dp1059AlertFocus=null;state.dp919AlertReturnTab=null;state.dp1099AlertNeedsScroll=false;state.detail='dp90-waveform';state.tab='deep';state.deepType=0;state.modal='';render(true);
}
function openHistory(kind){const range=Number(state.range),anchor=dateOK(state.deepSelectedDate)?state.deepSelectedDate:today();const c={range,anchor,kind,pet:state.dog,epoch:state.dpPetEpoch};selectDate(c,anchor);}
// 4G-only purchase and pairing state. Saved Bluetooth ownership cannot be migrated to real 4G.
function normalizeStore(){state.shopSelection='4g';if(Array.isArray(state.shopCart))state.shopCart=state.shopCart.filter(x=>(typeof x==='string'?x:x?.kind)==='4g');if(state.modal==='pair-wizard')state.pairType='4g';}
const oldWizard=wizardView;wizardView=function(){state.pairType='4g';const html=oldWizard.apply(this,arguments);if(state.pairStage===5&&typeof root.DeepPetPairingBridge?.findResults!=='function'){return html.replace(/<h3>[^<]+<\/h3>/,`<h3>${L('4G 配對服務尚未連接','4G pairing service unavailable','4G 연결 서비스 없음')}</h3>`).replace(/<p>[^<]+<\/p>/,`<p>${L('目前尚未接入項圈的 4G 雲端配對服務。服務接通後才可驗證設備身分及開始同步。','The collar cloud pairing service is not connected. Device identity must be verified before syncing.','4G 클라우드 연결 서비스가 아직 연결되지 않았습니다. 기기 인증 후 동기화할 수 있습니다.')}</p>`);}return html;};
const oldMount=mountLiveWaves;
mountLiveWaves=function(...args){if(!located()||!preview()||state.detail==='dp90-waveform'&&state.dp90WaveDate&&state.dp90WaveDate!==today()){if(activeWaveFrame!=null){cancelAnimationFrame(activeWaveFrame);activeWaveFrame=null;}return;}return oldMount.apply(this,args);};
const oldGeoStatus=geoStatus,oldFence=geoHasActiveFence;
geoStatus=function(...args){return located()?oldGeoStatus.apply(this,args):'unknown';};
geoHasActiveFence=function(...args){return located()&&oldFence.apply(this,args);};
const oldGeoMap=geoMapSvg;
geoMapSvg=function(...args){if(!located())return `<div class="dp204-gps-wait">${L('等待有效 GPS 定位','Waiting for a valid GPS fix','유효한 GPS 위치 대기')}</div>`;return oldGeoMap.apply(this,args);};
const oldAction=onAction;
onAction=function(el){const a=el?.dataset?.action;
 if(a==='dp90-wave-open'&&[7,30].includes(Number(state.range))&&state.tab==='deep'&&!state.detail){openHistory(el.dataset.kind==='breath'?'breath':'heart');return;}
 if(a==='pair-commit'&&(/^DP-VIRTUAL-/i.test(state.pairSelected||'')||typeof root.DeepPetPairingBridge?.pair!=='function')){state.pairStage=5;state.pairSelected='';renderModal();return;}
 if(['gps-open','set-garden-mode','garden-gps-demo','gps-quick-demo'].includes(a)&&!located()){state.pairType='4g';return oldAction({dataset:{action:'device-find'}});}
 if(a==='dp204-wave-date'){const c=calendarState();if(c)selectDate(c,el.dataset.date);return;}
 if(calendarState()&&['dp905-detail-back','dp90-wave-back'].includes(a)){state.dp204Calendar=null;state.detail=null;state.dp905WaveMode=null;state.dp905WaveRange=null;state.dp932WaveDays=1;state.dp905ChosenDate=null;render(true);return;}
 if(a==='dp204-wellness-open'){state.dp928WellnessOrigin='me';state.tab='me';state.detail='age-detail';state.modal='';render(true);return;}
 if(a==='dp204-wellness-factor'){const evidence=$('#app .dp1015-evidence-card');if(evidence)evidence.open=true;const target=el.dataset.target;const area=$('#app .dp1054-source-groups');if(area){const node=area.children[target==='age'?1:0]||area;node.classList.add('dp204-source-highlight');node.scrollIntoView({block:'center'});node.setAttribute('tabindex','-1');node.focus({preventScroll:true});}return;}
 if(a==='device-find'||a==='gps-upgrade-4g'||a==='dp204-pair'){state.pairType='4g';return oldAction({dataset:{action:'device-find'}});}
 if(['pair-scan','pair-retry'].includes(a)&&typeof root.DeepPetPairingBridge?.findResults!=='function'){state.pairType='4g';state.pairStage=5;state.dp1041Scan=null;state.pairSelected='';renderModal();return;}
 if(a==='dp204-disconnect'){if(!preview()){toast(L('請透過裝置服務解除實際配對','Unpair through your device service','기기 서비스에서 연결을 해제하세요'));return;}state.connected=false;state.deviceType=null;state.connectedId='';state.connectedName='';state.gpsEnabled=false;state.geofenceEnabled=false;state.dp1041VirtualPair=null;dpRememberDevice();state.devicesByPet[String(state.dog)].dpExplicitUnpaired=true;persist();state.modal='';render(true);return;}
 if(['pair-method','pair-scan','pair-retry','pair-back-types'].includes(a)){state.pairType='4g';if(a==='pair-method')return;}
 if(a==='toggle-gps'){if(paired()){state.gpsEnabled=true;toast(L('4G 連線時定位保持啟用','Location remains enabled while 4G is connected','4G 연결 중 위치 사용이 유지됩니다'));}return;}
 normalizeStore();return oldAction.apply(this,arguments);
};
// The native date/back controls use capture handlers. Route our calendar before those handlers.
root.addEventListener('click',function(e){const b=e.target.closest?.('[data-action="dp204-wave-date"],[data-action="dp204-wellness-open"],[data-action="dp204-wellness-factor"],[data-action="dp204-pair"],[data-action="dp204-disconnect"]');const back=calendarState()&&e.target.closest?.('[data-dp932="wave-back"],[data-action="dp905-detail-back"],[data-action="dp90-wave-back"]');if(!b&&!back)return;e.preventDefault();e.stopImmediatePropagation();if(back){onAction({dataset:{action:'dp905-detail-back'}});return;}onAction(b);},true);
// On Me, preserve the existing canonical 30-day model and restore explicit drill-down.
function wellness(app){if(state.tab!=='me')return;
 if(!state.detail){const card=$('.dp928-model-card',app);if(!card)return;
  if(card.matches('button')&&!card.classList.contains('dp935-model-empty'))card.dataset.action='dp204-wellness-open';
  else if(!card.matches('button')&&!$('.dp204-wellness-entry',app)){const btn=document.createElement('button');btn.type='button';btn.className='cta full dp204-wellness-entry';btn.dataset.action='dp204-wellness-open';btn.textContent=L('查看詳細分析與計算來源 ›','View detailed analysis and sources ›','상세 분석 및 계산 근거 보기 ›');card.after(btn);}
  if(card.matches('button')&&!card.classList.contains('dp935-model-empty')){card.querySelector('.dp928-model-foot strong')?.remove();let foot=$('.dp928-model-foot',card);if(foot)foot.insertAdjacentHTML('beforeend',`<strong>${L('查看詳細分析與計算來源','View detailed analysis and sources','상세 분석 및 계산 근거 보기')} ›</strong>`);}
 }
 if(state.detail==='age-detail'){const card=$('.dp928-in-detail',app);if(!card)return;for(const [selector,target] of [['.dp928-wellness-metric','score'],['.dp928-age-metric','age']]){const area=$(selector,card);if(!area||$('.dp204-source-button',area))continue;const btn=document.createElement('button');btn.type='button';btn.className='dp204-source-button';btn.dataset.action='dp204-wellness-factor';btn.dataset.target=target;btn.textContent=L('查看計算依據 ›','View calculation basis ›','계산 근거 보기 ›');area.append(btn);}}
}
// Only these two detailed live channels depend on current GPS. Past dates are never changed.
function liveCard(app){if(state.tab!=='deep'||state.detail!=='dp90-waveform')return;
 const date=state.dp90WaveDate||state.dp905ChosenDate||today(),kind=state.dp90WaveKind==='breath'?'breath':'heart';
 const page=$('.app-main>.app-pad',app)||$('.app-main',app);if(!page)return;
 let section=$('.dp932-wave-section',page);const title=L('即時波形','Live waveform','실시간 파형');
 // Some N/A templates omit all three cards; add the live status without touching history.
 if(!section||!section.querySelector('.live-stream-card,canvas,[data-live-hr],[data-live-rr]')&&!/即時|实时|Live waveform|실시간/.test(section.querySelector('header b')?.textContent||'')){section=document.createElement('section');section.className='card dp932-wave-section dp204-live-section';const cal=$('.dp204-wave-calendar',page),head=$('.dp-independent-head',page);(cal||head||page.firstElementChild)?.after(section);}
 const isToday=date===today();
 const demo=isToday&&located()&&preview()&&periodScores({kind}).get(date)!=null;
 section.dataset.dp204Live=demo?'preview':isToday&&located()?'awaiting-signal':isToday?'disconnected':'historical';
 if(demo){section.innerHTML=`<header><b>${title}</b><small>${L('4G 連線預覽','4G connection preview','4G 연결 미리보기')}</small></header>${streamingPanel(kind,kind==='heart'?'#d97190':'#498fd8',kind==='heart'?L('心跳','Heart rate','심박'):L('呼吸','Breathing','호흡'),kind==='heart'?currentDog().hr:currentDog().rr)}`;return;}
 const msg=!isToday?L('歷史日期不顯示即時波形','Live waveform is not shown for a historical date','과거 날짜에는 실시간 파형이 표시되지 않습니다'):located()?L('等待項圈回傳有效即時波形','Waiting for valid live readings from the collar','유효한 실시간 파형 수신 대기'):L('請連接 4G + GPS 穿戴裝置','Connect your 4G + GPS wearable','4G + GPS 착용 기기를 연결하세요');
 section.innerHTML=`<header><b>${title}</b><small>${!isToday?date:located()?L('等待訊號','Waiting for signal','신호 대기'):L('未連線','Not connected','연결 안 됨')}</small></header><div class="dp204-gray-wave" role="img" aria-label="${msg}"><svg viewBox="0 0 320 76" aria-hidden="true"><path d="M12 38H308" stroke="#a0a9b7" stroke-width="2" fill="none"/></svg><strong>—</strong><p>${msg}</p></div>${isToday&&!located()?`<button type="button" class="cta full dp204-pair" data-action="dp204-pair">${L('配對 4G 項圈','Pair 4G collar','4G 목걸이 연결')}</button>`:''}`;
}
function normalizeCalendar(app){const c=calendarState();if(!c)return;const page=$('.app-main>.app-pad',app)||$('.app-main',app);if(!page)return;
 $$('.dp932-wave-calendar,.dp905-calendar-panel,.dp905-period-lead',page).forEach(x=>x.remove());
 const header=$('.dp-independent-head,.dp932-wave-header',page);if(header)header.insertAdjacentHTML('afterend',calendar(c));else page.insertAdjacentHTML('afterbegin',calendar(c));
}
// Scope old model-choice copy to known product surfaces, not pet data or owner notes.
function cleanProductUI(){for(const node of $$('#app .dp-owner-gps-card,#overlay-root .gps-modal,#app .dp1041-garden-locked,#app .device-center,#overlay-root .wizard-head,#overlay-root .pair-type-grid,#app .dp-store-page')){
 for(const b of $$('[data-type="bt"],[data-kind="bt"],[data-action="shop-select-product"]',node))b.remove();
 }
}
const beforeModal=renderModal;
renderModal=function(...args){const ret=beforeModal.apply(this,args);const modal=$('#overlay-root .modal-sheet');if(modal&&state.modal==='device-detail'&&preview()&&!modal.querySelector('[data-action="dp204-disconnect"]')){const btn=document.createElement('button');btn.type='button';btn.className='cta secondary full';btn.dataset.action='dp204-disconnect';btn.textContent=L('解除預覽配對','Disconnect preview pairing','미리보기 연결 해제');modal.append(btn);}return ret;};
const beforeRender=render;
render=function(...args){normalizeStore();if(state.connected&&state.deviceType==='4g')state.gpsEnabled=true;
 const result=beforeRender.apply(this,args),app=$('#app');if(!app)return result;
 wellness(app);normalizeCalendar(app);liveCard(app);cleanProductUI();
 // Rendered preview GPS is explicitly illustrative; real telemetry cannot be inferred from history.
 const home=$('#dp-owner-gps-card',app);if(home&&paired()&&!located()){const map=$('.dp-home-gps-map',home);if(map){map.classList.remove('is-located');map.classList.add('is-unlocated');map.innerHTML=`<div class="dp204-gps-wait">${L('等待有效 GPS 定位','Waiting for a valid GPS fix','유효한 GPS 위치 대기')}</div>`;}const status=$('.dp-owner-gps-status',home);if(status){status.classList.remove('active');status.textContent=L('定位未取得','Location unavailable','위치 없음');}$('.dp-home-map-fence-caption',home)?.remove();}
 if(home&&!located()){const map=$('.dp-home-gps-map',home);if(map){map.querySelector('svg.geo-preview-map')?.remove();map.classList.remove('is-located');map.classList.add('is-unlocated');}}
 if(home&&preview()){home.dataset.dp204Location='preview';const status=$('.dp-owner-gps-status',home);if(status)status.textContent=L('定位預覽','Location preview','위치 미리보기');}
 root.DeepPetBuildVersion='10.214';$$('.app-build-version',app).forEach(x=>x.textContent='DeepPet Version 10.214');return result;
};
root.DeepPet204=Object.freeze({version:'10.214',located,preview,grade,calendarState});
})(window);
