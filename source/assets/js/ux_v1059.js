/* DeepPet V10.59 — one dated, measured event -> one exact selected chart minute.
 * No all-day low score is presented as a sudden emergency. The investor-gallery
 * minute series is illustrative, never substituted for a real collar recording. */
(function(root){
 'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:
  state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const minuteText=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const types={heart:{name:()=>L('心率','Heart rate','心拍数','심박수'),unit:'bpm'},
  breath:{name:()=>L('呼吸','Breathing','呼吸数','호흡수'),unit:()=>L('次／分','/min','回／分','회/분')}};
 const precise=n=>Number(Number(n).toFixed(1)).toString();
 const uniqueId=x=>`${x.kind}|${x.date}|${x.minute}`;
 function gallerySignal(kind,date,minute){
  // A real/edited/new pet MUST NOT borrow the showroom's generated trace.
  if(typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements())return null;
  const pet=typeof allPets==='function'?allPets()[state.dog]:null;
  if(!Number.isInteger(state.dog)||state.dog<0||state.dog>=dogs.length||
    !pet||pet.dpFixtureInvalidated||pet.dpFreshPet||pet.freeCare||state.emptyPreview)return null;
  const records=typeof demoRecords==='function'?demoRecords(state.dog):[];
  const i=records.findIndex(x=>x.date===date);
  if(i<0||typeof validDaySample==='function'&&validDaySample(records[i],i)?.valid!==true)return null;
  try{const readings=dpSignals(date,[kind])?.[kind];return Array.isArray(readings)&&readings.length===1440&&Number.isFinite(readings[minute])?readings[minute]:null;}
  catch{return null;}
 }
 function collectAlerts(panel){
  return [...panel.querySelectorAll('.dp936-alert-item[data-dp936="alert"]')].flatMap(node=>{
   const kind=node.dataset.kind,date=node.dataset.date,minute=Number(node.dataset.minute);
   if(!types[kind]||!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!Number.isInteger(minute)||minute<0||minute>1439)return [];
   const old=node.querySelector('strong')?.textContent||'';
   const number=old.match(/(?:↑|↓)\s*(-?\d+(?:\.\d+)?)/);
   const plotted=gallerySignal(kind,date,minute);
   const value=Number.isFinite(plotted)?plotted:number?Number(number[1]):NaN;
   if(!Number.isFinite(value)||value<=0)return [];
   return [{kind,date,minute,type:old.includes('↓')?'low':'high',value}];
  });
 }
 function combineCoincident(rows){
  const consumed=new Set(),result=[];
  for(const event of rows){
   if(consumed.has(uniqueId(event)))continue;
   consumed.add(uniqueId(event));
   // "Simultaneous" is reserved for two independently recorded changes
   // on the EXACT same calendar minute and in the SAME direction.
   const other=rows.find(x=>x.kind!==event.kind&&x.date===event.date&&x.minute===event.minute&&
    x.type===event.type&&!consumed.has(uniqueId(x)));
   if(other){consumed.add(uniqueId(other));result.push({...event,kind:'combined',
    primary:event.kind==='heart'?event:other,secondary:event.kind==='heart'?other:event});}
   else result.push(event);
  }
  return result;
 }
 function title(event){
  if(event.durationClass==='sustained'&&event.kind!=='combined'){
   return `${types[event.kind].name()} ${event.type==='high'?L('持續偏高','stayed elevated','高めの状態が継続','높은 상태 지속'):L('持續偏低','stayed low','低めの状態が継続','낮은 상태 지속')} · ${precise(event.value)} ${typeof types[event.kind].unit==='function'?types[event.kind].unit():types[event.kind].unit}`;
  }
  const direction=event.type==='high'?L('突然升至','suddenly rose to','急に上昇','급상승'):
   L('突然降至','suddenly fell to','急に低下','급하강');
  const single=x=>`${types[x.kind].name()} ${direction} ${precise(x.value)} ${typeof types[x.kind].unit==='function'?types[x.kind].unit():types[x.kind].unit}`;
  if(event.kind!=='combined')return single(event);
  const a=event.primary,b=event.secondary;
  return `${L('心率與呼吸同時','Heart rate and breathing both ','心拍数と呼吸数が同時に','심박수와 호흡수가 동시에 ')}${event.type==='high'?L('升高','rose','上昇','상승'):L('降低','fell','低下','하강')} · ${precise(a.value)} bpm / ${precise(b.value)} ${L('次／分','/min','回／分','회/분')}`;
 }
 function alertMarkup(e){
  const primary=e.kind==='combined'?e.primary:e;
  const other=e.kind==='combined'?e.secondary:null;
  return `<button type="button" class="dp936-alert-item dp1059-alert-item" data-action="dp1059-alert-open" data-kind="${primary.kind}" data-date="${escape(e.date)}" data-minute="${e.minute}" data-value="${primary.value}" data-peer="${other?.kind||''}" data-peer-value="${other?.value??''}" data-event-type="${e.type}" aria-label="${escape(title(e)+' · '+e.date+' '+minuteText(e.minute))}"><span class="dp1059-alert-symbol" aria-hidden="true">${e.type==='high'?'↑':'↓'}</span><span class="dp1059-alert-copy"><strong>${escape(title(e))}</strong><time datetime="${e.date}T${minuteText(e.minute)}">${e.date} ${minuteText(e.minute)}</time></span><span class="dp1059-alert-arrow" aria-hidden="true">›</span></button>`;
 }
 function updateHomeAlerts(){
  if(state.tab!=='home')return;
  const panel=document.querySelector('#app .dp936-urgent');if(!panel)return;
  if(panel.dataset.dp1059Ready==='1')return;
  panel.dataset.dp1059Ready='1';
  const alerts=combineCoincident(collectAlerts(panel));
  const oldItems=panel.querySelectorAll('.dp936-alert-item');
  const more=panel.querySelector('.dp936-more');
  // Remove the former "本日 / 持續低分 / 非突發事件" rows entirely.
  oldItems.forEach(x=>x.remove());
  const placeholder=panel.querySelector('.dp936-urgent-empty');
  if(alerts.length){
   placeholder?.remove();
   const list=document.createElement('div');list.className='dp1059-alert-list';list.innerHTML=alerts.map(alertMarkup).join('');
   more?more.before(list):panel.append(list);
  }else if(!placeholder){
   const empty=document.createElement('p');empty.className='dp936-urgent-empty';
   empty.textContent=L('暫無突發變化','No sudden changes','急な変化はありません','급격한 변화 없음');
   more?more.before(empty):panel.append(empty);
  }else placeholder.textContent=L('暫無突發變化','No sudden changes','急な変化はありません','급격한 변화 없음');
  // The number formerly included non-events and cannot be used as a count.
  panel.querySelector('.dp936-urgent-head small')?.remove();
  if(!alerts.length)more?.remove();
 }
 function graphicLabel(focus){
  const kind=focus.kind;
  const entry=(k,m)=>{const sampled=Number.isInteger(focus.second)?null:gallerySignal(k,focus.date,m);
   const fallback=focus.values?.[k];const value=Number.isFinite(sampled)?sampled:Number.isFinite(fallback)?fallback:null;
   return Number.isFinite(value)?`${types[k].name()} ${precise(value)} ${typeof types[k].unit==='function'?types[k].unit():types[k].unit}`:types[k].name();};
  const peer=focus.peer&&types[focus.peer]?focus.peer:null;
  return `${focus.date} ${minuteText(focus.minute)}${Number.isInteger(focus.second)?':'+String(focus.second).padStart(2,'0'):''} · ${entry(kind,focus.minute)}${peer?' / '+entry(peer,focus.minute):''}`;
 }
 const svgNS='http://www.w3.org/2000/svg';
 function drawCircle(svg,marker,focus,scope){
  if(!marker||svg.querySelector('.dp1059-focus-halo'))return;
  const cx=Number(marker.getAttribute('cx')),cy=Number(marker.getAttribute('cy'));
  if(!Number.isFinite(cx)||!Number.isFinite(cy))return;
  const g=document.createElementNS(svgNS,'g');g.classList.add('dp1059-focus-halo');
  g.setAttribute('pointer-events','none');
  // The frame marks the abnormal interval, and the concentric ring pinpoints
  // its exact minute. Both charts use the original selected raw data point.
  const frame=document.createElementNS(svgNS,'rect');
  const px=scope==='overview'?Math.max(37,cx-7):Math.max(37,cx-25);
  const width=scope==='overview'?14:50;
  for(const [k,v] of Object.entries({x:px,y:20,width:Math.min(width,350-px),height:126,rx:5,
   fill:'#ec557b','fill-opacity':'.075',stroke:'#d52d63','stroke-width':'1.7','stroke-dasharray':'5 3'}))frame.setAttribute(k,String(v));
  const ring=document.createElementNS(svgNS,'circle');for(const [k,v] of Object.entries({cx,cy,r:12,fill:'none',stroke:'#d52d63','stroke-width':3}))ring.setAttribute(k,String(v));
  const core=document.createElementNS(svgNS,'circle');for(const [k,v] of Object.entries({cx,cy,r:3.5,fill:'#d52d63'}))core.setAttribute(k,String(v));
  const hint=document.createElementNS(svgNS,'title');hint.textContent=graphicLabel(focus);
  g.append(frame,ring,core,hint);svg.append(g);
  svg.classList.add('dp1059-focused-svg');
  svg.setAttribute('aria-label',graphicLabel(focus));
 }
 function focusDetail(){
  const focus=state.dp1059AlertFocus;
  if(!focus||state.tab!=='deep'||state.detail!=='dp90-waveform'||
    focus.pet!==state.dog||focus.date!==state.dp90WaveDate||focus.kind!==state.dp90WaveKind||
    focus.minute!==state.dp932WaveMinute)return;
  const page=document.querySelector('#app .dp932-wave-page, #app .dp904-wave-page');if(!page)return;
  const charts=[...page.querySelectorAll('.dp932-wave-section svg.dp932-chart')];
  const overview=page.querySelectorAll('.dp932-wave-section')[1];
  const box=document.createElement('div');box.className='dp1059-focus-label';
  box.innerHTML=`<span aria-hidden="true">◎</span><strong>${escape(graphicLabel(focus))}</strong>`;
  if(Number.isInteger(focus.second)){
   const precision=document.createElement('small');precision.className='dp1059-focus-precision';
   precision.textContent=L('框線標出事件所在分鐘；秒數與事件值取自逐秒量測。','Chart highlights the event minute; seconds and event value come from the second-by-second feed.','グラフは発生した分を表示。秒数と値は秒単位の測定結果です。','차트는 사건이 발생한 분을 표시하며 초 단위 값은 실측 스트림에서 가져옵니다.');
   box.append(precision);
  }
  if(focus.peer&&types[focus.peer]){
   const link=document.createElement('button');link.type='button';link.dataset.action='dp1059-alert-peer';
   link.textContent=focus.peer==='breath'?L('看同時呼吸曲線 ›','View breathing at this time ›','同時刻の呼吸を見る ›','같은 시각 호흡 보기 ›'):
    L('看同時心率曲線 ›','View heart rate at this time ›','同時刻の心拍数を見る ›','같은 시각 심박수 보기 ›');
   box.append(link);
  }
  if(overview&&!overview.querySelector('.dp1059-focus-label'))overview.querySelector('header')?.after(box);
  if(charts.length){
   charts.forEach((svg,index)=>drawCircle(svg,svg.querySelector('.dp938-selected-event'),focus,index===0?'overview':'zoom'));
  }else if(!page.querySelector('.dp1059-focus-unavailable')){
   const n=document.createElement('p');n.className='dp1059-focus-unavailable';
   n.textContent=L('此時段尚無可核對的逐分鐘曲線，無法標記位置。','No verified minute-by-minute chart available to mark this time.','この時刻の確認可能な曲線がないため、位置を表示できません。','해당 시각의 검증된 분 단위 곡선이 없어 위치를 표시할 수 없습니다.');
   page.querySelector('.card')?.prepend(n);
  }
 }
 function openAlert(button){
  const kind=button.dataset.kind,date=button.dataset.date,minute=Number(button.dataset.minute);
  if(!types[kind]||!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!Number.isInteger(minute)||minute<0||minute>=1440)return;
  const peer=button.dataset.peer&&types[button.dataset.peer]?button.dataset.peer:null;
  // A real second-stamped alert already carries its verified SDK value.
  // Never let a showroom's illustrative per-minute reading replace it.
  const verifiedSecond=button.dataset.second!==undefined;
  const values={};for(const k of [kind,peer].filter(Boolean)){
   const originalValue=k===kind?Number(button.dataset.value):Number(button.dataset.peerValue);
   const measured=verifiedSecond?null:gallerySignal(k,date,minute);
   values[k]=Number.isFinite(measured)?measured:Number.isFinite(originalValue)?originalValue:null;
  }
  const seconds=button.dataset.second===undefined?null:Number(button.dataset.second);
  // The alert is often opened from Home; its wave back action must return
  // to the actual origin instead of a Deep tab the user never visited.
  state.dp919AlertReturnTab=state.tab;
  // V10.99: the destination is the abnormal interval, not the top of the page.
  state.dp1099AlertNeedsScroll=true;
  state.dp1059AlertFocus={pet:state.dog,date,minute,second:Number.isInteger(seconds)&&seconds>=0&&seconds<60?seconds:null,kind,peer,values,type:button.dataset.eventType};
  state.modal='';state.tab='deep';state.deepType=0;state.range=1;state.deepSelectedDate=date;
  state.detail='dp90-waveform';state.dp90WaveKind=kind;state.dp90WaveDate=date;
  state.dp932WaveMinute=minute;state.dp932WaveDays=1;state.dp904WaveSelected=0;
  state.dp905WaveRange=1;state.dp905WaveMode='single';
  render(true);
 }
 document.addEventListener('click',e=>{
  const button=e.target.closest?.('[data-action="dp1059-alert-open"], [data-action="dp1059-alert-peer"]');
  if(!button)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(button.dataset.action==='dp1059-alert-open')openAlert(button);
  else{
   const focus=state.dp1059AlertFocus;if(!focus||!focus.peer)return;
   const old=focus.kind;focus.kind=focus.peer;focus.peer=old;
   state.dp1099AlertNeedsScroll=true;
   state.dp90WaveKind=focus.kind;state.dp932WaveMinute=focus.minute;render(true);
  }
 },true);
 const before=render;
 render=function(reset=false){before(reset);updateHomeAlerts();focusDetail();};
 root.DeepPetUX1059={version:'10.59',collectAlerts,combineCoincident,alertMarkup,graphicLabel,gallerySignal};
})(window);
