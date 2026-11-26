/* DeepPet V10.199 LAFA: data-neutral detail components.
   Preserve canonical component classes; never render another pet as a template. */
(function(root){'use strict';
const calc=root.DeepPetMiloAdaptiveScores,engine=root.DeepPetMiloVerifiedPipeline;
if(!calc||typeof render!=='function'||typeof deepView!=='function')return;
const $=(s,c=document)=>c?.querySelector(s),$$=(s,c=document)=>Array.from(c?.querySelectorAll(s)||[]),ok=x=>typeof x==='number'&&Number.isFinite(x);
const lafa=()=>state.dog===0&&!state.emptyPreview&&!(typeof selectedBlank==='function'&&selectedBlank());
const L=(zh,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stamp=t=>String(t).slice(11,16),ymd=t=>String(t).slice(0,10),mins=t=>{const v=String(t).slice(11).split(':');return Number(v[0])*60+Number(v[1])+(Number(v[2])||0)/60;},parseTS=t=>Date.parse(String(t).length>16?t+'+08:00':t+':00+08:00');
const copyDate=date=>/^\d{4}-\d{2}-\d{2}$/.test(date||'')?date:((typeof iso==='function'&&typeof localDate==='function')?iso(localDate()):'0000-00-00');
let picked=null,pickedEnergy=null,lastDetail='';
// Detail components never select another pet or carry an example score.
function detailScoreShell(day){const dots=Array.from({length:54},(_,i)=>{const a=i*Math.PI*2/54;return `<circle cx="${57+48*Math.sin(a)}" cy="${57-48*Math.cos(a)}" fill="#89919d" opacity=".19" r="2.25"/>`;}).join('');return `<section class="card dp1068-detail-score"><div class="dp1068-detail-score-head"><div><p class="dp1068-detail-label"></p><h2>N/A</h2><small>${day}</small></div><div class="dp1068-detail-ring dp1068-risk-4 dp1071-dotted dp-uniform-dotted dp-status-score" data-score="" style="--sc:#89919d"><svg aria-hidden="true" class="dp-uniform-dot-svg" viewBox="0 0 114 114">${dots}</svg><div class="stat-inner"><b>N/A</b><small></small></div></div></div><div class="dp1068-detail-risk dp1068-risk-4">N/A</div><div class="dp1068-detail-why"><h3></h3><p></p></div></section>`;}
function detailShell(day,kind){const label=kind==='heart'?L('心跳波形與變化','Heart rate changes','心拍変化','심박 변화'):kind==='breath'?L('呼吸波形與變化','Breathing changes','呼吸変化','호흡 변화'):kind==='sleep'?L('睡眠情況','Sleep & rest','睡眠状態','수면 상태'):L('精力情況','Energy status','活動状態','활력 상태');const nav=`<header class="dp-independent-head"><button type="button" data-action="dp905-detail-back" aria-label="${L('返回','Back','戻る','뒤로')}">←</button><b>${label} · ${day}</b></header>`,summary=detailScoreShell(day),svg='<svg class="dp932-chart" viewBox="0 0 360 180" role="img"></svg>';
if(kind==='heart'||kind==='breath'){const card=(title,body)=>`<section class="card dp932-wave-section"><header><b>${title}</b><small>${day}</small></header>${body}</section>`;return `<div class="app-pad dp932-wave-page">${nav}<p class="dp932-wave-subtitle"></p>${summary}${card(L('即時波形','Live waveform','リアルタイム波形','실시간 파형'),'<div class="dp936-chart-na">N/A</div>')}${card(L('全天波形與變化時段','Full-day trend and changes','一日変化','전체 변화'),svg+`<div class="dp932-wave-legend"><span>↑ ${L('高點','High','高','높음')}</span><span>↓ ${L('低點','Low','低','낮음')}</span></div><div class="dp932-wave-events"></div>`)}${card(L('時段放大 · 與標記時間同步','Zoom · selected time','拡大 · 選択時刻','확대 · 선택 시간'),`<div class="dp932-zoom-stats"><span></span><strong>N/A</strong><small></small></div>${svg}`)}</div>`;}
if(kind==='sleep'){const idx=demoRecords(0).findIndex(r=>r.date===day);const timeline=idx>=0?dpOwnerSleepWave({date:day,idx})+sleepMatrixDate(idx):`<div class="sleep-date-timeline" style="grid-template-columns:repeat(48,minmax(0,1fr))">${Array.from({length:48},(_,i)=>`<button class="missing" data-action="sleep-slot" data-slot="${i}"></button>`).join('')}</div><div class="sleep-slot-reading"></div>`;return `<div class="app-pad dp905-page">${nav}${summary}<section class="card dp905-sleep-day"><div class="dp905-sleep-head"><div><h2>${day} ${label}</h2><p>N/A</p></div>${dpDeepDottedScore(null,'#89919d')}</div><div class="dp905-day-stats"><span>${L('睡眠與休息','Sleep & rest','睡眠と休息','수면·휴식')} <b>N/A</b></span><span>${L('休息中斷','Rest interruptions','休息の中断','휴식 중단')} <b>N/A</b></span></div><h3>${L('全天休息時間軸','24-hour rest timeline','24時間の休息時間軸','24시간 휴식 시간대')}</h3><div class="dp-owner-sleep-timeline dp908-synced-sleep">${timeline}</div></section></div>`;}
const motion=`<svg class="dp905-signal-svg" viewBox="0 0 360 180" role="img"><text x="30" y="17">120</text><text x="30" y="80">60</text><text x="30" y="143">0</text><path d="" fill="none" stroke="#5294d8" stroke-width="2.25"/><circle r="4" fill="#fff" stroke="#5294d8"/><text x="36" y="164">00:00</text><text x="192" y="164">12:00</text><text x="348" y="164" text-anchor="end">24:00</text></svg>`;const inspector=`<div class="dp908-inspect-chart">${motion}<div class="dp908-chart-readout" aria-live="polite"></div></div>`;return `<div class="app-pad dp905-page">${nav}${summary}<section class="card dp905-overview"><h2>${day} ${label}</h2><div class="dp905-day-stats"><span>${L('當日動靜','Daily movement','一日の動静','일일 움직임')} <b>N/A</b></span><span>${L('值得回看','Review points','確認箇所','확인 시간')} <b>N/A</b></span></div><p></p>${inspector}<div class="dp909-percent-guide"><p></p></div></section><section class="card dp905-zoom"><div class="dp905-section-title"><span>02</span><h3>${L('選擇需要放大的時段','Choose a time to zoom','拡大する時間帯','확대 시간 선택')}</h3></div><div class="dp905-event-row"></div>${inspector}<div class="dp905-key-values"><div><small>${L('日期時間','Exact time','日時','일시')}</small><b>N/A</b></div><div><small>${label}</small><b>N/A</b></div><div><small>${L('當日參考','Daily reference','当日基準','일 기준')}</small><b>N/A</b></div></div><p class="dp905-sim-note"></p></section><section class="card dp905-no-event"></section></div>`;}
function currentDay(){return copyDate(state.detail==='dp90-waveform'?state.dp90WaveDate:state.detail==='dp905-sleep-day'?state.dp905ChosenDate:state.detail==='dp905-energy-day'?(state.dp905ChosenDate||state.dp936EnergyDate):state.deepSelectedDate);}
function rows(day){
 // The waveform/detail screen and Deep headline must consume the same
 // date-scoped measurements, including post-launch SDK imports.
 const source=calc.dayRows?.(day)||[];
 return source.filter(r=>r.hr>0&&r.rr>0).map(r=>({
  time:r.ts,hr:r.hr,breath:r.rr,motion:r.motion,
  interval:r.source==='b0'?1:Math.max(1,Math.min(120,r.seconds||120))/60
 })).sort((a,b)=>a.time.localeCompare(b.time));
}
function middle(v){if(!v.length)return null;const a=[...v].sort((x,y)=>x-y);return a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2;}
function level(score){if(!ok(score))return ['N/A','#89919d',4,L('資料不足','Insufficient data','データ不足','자료 부족')];return score>=90?['normal','#24a56c',0,L('健康','Healthy','健康','건강')]:score>=80?['light','#3984df',1,L('輕度風險','Mild risk','軽度リスク','낮은 위험')]:score>=60?['medium','#e3a34b',2,L('中度風險','Moderate risk','中度リスク','중간 위험')]:['high','#d55656',3,L('高度風險','High risk','高リスク','높은 위험')];}
function ring(scope,score){const el=$('.dp1068-detail-ring',scope);if(!el)return;const [_,color,rank]=level(score);el.dataset.score=ok(score)?String(score):'';el.style.setProperty('--sc',color);el.className=el.className.replace(/dp1068-risk-\d+/g,'').trim()+` dp1068-risk-${rank}`;
const val=$('.stat-inner b',el);if(val)val.textContent=ok(score)?String(score):'N/A';const small=$('.stat-inner small',el);if(small)small.textContent=ok(score)?'/100':'';
const dots=$$('circle',el);dots.forEach((d,i)=>{d.setAttribute('fill',color);d.setAttribute('opacity',ok(score)&&i/Math.max(1,dots.length)<score/100?'1':'0.19');});
const label=$('.dp1068-detail-risk',scope);if(label){label.textContent=ok(score)?level(score)[3]:level(null)[3];label.className=label.className.replace(/dp1068-risk-\d+/g,'').trim()+` dp1068-risk-${rank}`;}
const hdr=$('.dp1068-detail-score-head h2',scope);if(hdr)hdr.textContent=ok(score)?level(score)[3]:level(null)[3];}
function nativeInnerRing(panel,score){const el=$('.stat-bubble.dp-status-score',panel);if(!el)return;const [_,color]=level(score);el.dataset.score=ok(score)?String(score):'';el.style.setProperty('--sc',color);const val=$('.stat-inner b',el);if(val)val.textContent=ok(score)?String(score):'N/A';const sub=$('.stat-inner small',el);if(sub)sub.textContent=ok(score)?'/100':'';$$('circle',el).forEach((dot,i,all)=>{dot.setAttribute('fill',color);dot.setAttribute('opacity',ok(score)&&i/Math.max(1,all.length)<score/100?'1':'0.19');});const badge=$('.dp90-status,.dp74-status,.dp-owner-score-status',panel);if(badge)badge.textContent=ok(score)?level(score)[3]:level(null)[3];}
function setSummary(el,score,day,msg,kind){ring(el,score);const name=$('.dp1068-detail-label',el);if(name)name.textContent=kind==='sleep'?L('睡眠休息狀態','Sleep status','睡眠状態','수면 상태'):kind==='energy'?L('精力狀態','Energy status','活動状態','활력 상태'):kind==='breath'?L('呼吸狀態','Breathing status','呼吸状態','호흡 상태'):L('心跳狀態','Heart-rate status','心拍状態','심박 상태');const date=$('.dp1068-detail-score-head small',el);if(date)date.textContent=day;const reason=$('.dp1068-detail-why h3',el);if(reason)reason.textContent=L('觀測依據','Measured finding','観測根拠','측정 근거');const finding=$('.dp1068-detail-why p',el);if(finding)finding.textContent=msg;}
function trace(svg,points,key,lo,hi,a,b,color,focus=false,markers=[]){if(!svg)return;const W=360,H=180,left=37,right=10,top=20,bottom=34;const x=n=>left+(W-left-right)*(n-a)/Math.max(1,b-a),y=n=>top+(hi-n)/Math.max(.01,hi-lo)*(H-top-bottom);
let path='',prior=null;for(const r of points){const m=mins(r.time),v=r[key];if(m<a||m>b||!ok(v))continue;const connected=prior&&m-prior.minute<=Math.max(.1,r.interval+.1)&&ymd(r.time)===ymd(prior.time);path+=(connected?'L':'M')+x(m).toFixed(2)+' '+y(v).toFixed(2)+' ';prior={minute:m,time:r.time};}
const lines=[0,.5,1].map(q=>{const yy=top+(H-top-bottom)*q;return `<line x1="${left}" x2="${W-right}" y1="${yy}" y2="${yy}" stroke="#e3eaf5"/><text x="${left-5}" y="${yy+3}" text-anchor="end" font-size="10" fill="#73829b">${(hi-(hi-lo)*q).toFixed(0)}</text>`}).join('');
const labels=[a,(a+b)/2,b].map((m,i)=>{const mm=Math.round(m);return `<text x="${x(m)}" y="${H-7}" text-anchor="${i===0?'start':i===2?'end':'middle'}" font-size="9.5" fill="#79859d">${String(Math.floor(mm/60)).padStart(2,'0')}:${String(mm%60).padStart(2,'0')}</text>`;}).join('');
const circles=markers.filter(m=>m?.row&&ok(m.row[key])&&mins(m.row.time)>=a&&mins(m.row.time)<=b).map(m=>{const cx=x(mins(m.row.time)).toFixed(2),cy=y(m.row[key]).toFixed(2);return `<circle class="dp932-event-spot" cx="${cx}" cy="${cy}" r="5.5" stroke="${m.type==='high'?'#d95656':'#3984df'}" stroke-width="2.5" fill="#fff"><title>${esc(m.row.time)} · ${m.type==='high'?'↑':'↓'} ${m.row[key]}</title></circle>`;}).join('');
svg.innerHTML=`<text x="${left}" y="11" fill="#7285a0" font-size="10">${key==='hr'?'bpm':L('次/分','/min','回/分','회/분')}</text>${lines}<path d="${path}" fill="none" stroke="${color}" stroke-width="2.25" stroke-linecap="round"/>${circles}${labels}`;
svg.dataset.lafaRecorded='true';svg.setAttribute('aria-label',L('拉菲實測趨勢（缺測不連線）','LAFA recorded trend, gaps disconnected','実測傾向','실측 추세'));}
function extrema(points,key){const data=points.filter(v=>ok(v[key]));if(!data.length)return [];const ordered=[...data].sort((x,y)=>x[key]-y[key]);const picks=[];for(const [type,arr] of [['low',ordered],['high',[...ordered].reverse()]]){for(const r of arr){if(picks.filter(x=>x.type===type).length>=3)break;if(picks.some(x=>Math.abs(parseTS(x.row.time)-parseTS(r.time))<8*60000))continue;picks.push({type,row:r});}}
return picks.sort((x,y)=>x.row.time.localeCompare(y.row.time));}
function heartBreath(page,day,kind){const key=kind==='heart'?'hr':'breath',sc=calc.period(day,1,kind),points=rows(day),valid=points.filter(x=>ok(x[key]));const head=$('.dp932-wave-subtitle',page);if(head)head.textContent=`${L('拉菲','LAFA','ラフィ','라피')} · ${day} · ${L('實測時段；缺測不補值','Recorded samples; gaps unfilled','実測記録','실측 기록')}`;
const summary=$('.dp1068-detail-score',page),unit=kind==='heart'?'bpm':L('次／分','/min','回／分','회/분');const med=middle(valid.map(x=>x[key]));const max=valid.length?Math.max(...valid.map(x=>x[key])):null,min=valid.length?Math.min(...valid.map(x=>x[key])):null;
setSummary(summary,sc.score,day,valid.length?L(`本日實測${kind==='heart'?'心率':'呼吸'}中位數 ${med} ${unit}，範圍 ${min}–${max} ${unit}；高低點依實測時間標記，非醫療警報。`,`Recorded median ${med} ${unit}, range ${min}–${max}; highs and lows indicate recorded changes, not medical alerts.`,`中央値${med}、範囲${min}～${max}`,`중앙값 ${med}, 범위 ${min}–${max}`):L('本日沒有合格實測資料，未顯示假分數。','No valid recordings this date; no fabricated score.','記録なし','유효 기록 없음'),kind);
const sections=$$('.dp932-wave-section',page);if(sections[0]){const status=$('header small',sections[0]);if(status)status.textContent=L('尚未即時連線','No live device connected','リアルタイム未接続','실시간 미연결');const stream=$('[data-live-hr],[data-live-rr]',sections[0]);if(stream){stream.removeAttribute('data-live-hr');stream.removeAttribute('data-live-rr');stream.textContent='—';}const canvas=$('canvas.stream-canvas',sections[0]);if(canvas)canvas.style.visibility='hidden';}
const all=sections[1],zoom=sections[2];if(!all||!zoom)return;const [low,high]=valid.length?[Math.min(...valid.map(x=>x[key]))-4,Math.max(...valid.map(x=>x[key]))+4]:[0,100];const chart=$('svg.dp932-chart',all);trace(chart,valid,key,low,high,0,1439,kind==='heart'?'#d36d8e':'#42a3bf');const dateSmall=$('header small',all);if(dateSmall)dateSmall.textContent=day;
const events=extrema(valid,key);trace(chart,valid,key,low,high,0,1439,kind==='heart'?'#d36d8e':'#42a3bf',false,events);const buttons=$('.dp932-wave-events',all);const selected=events.find(x=>x.row.time===picked?.time&&x.type===picked?.type)||events.find(x=>x.type==='high')||events[0];if(buttons){buttons.innerHTML=events.length?events.map(v=>`<button type="button" class="dp932-event-chip ${v===selected?'selected':''}" data-lafa-point="${esc(v.row.time)}" data-lafa-kind="${v.type}"><span>${v.type==='high'?'↑':'↓'} ${stamp(v.row.time)}</span><b>${v.row[key]} ${unit}</b></button>`).join(''):L('本日沒有可標記的有效高低點。','No valid extrema recorded.','変化点なし','변화점 없음');}
const zoomTitle=$('header b',zoom);if(zoomTitle)zoomTitle.textContent=L('放大 · 選定時間','Zoom · selected time','拡大 · 選択時刻','확대 · 선택 시간');const focus=$('.dp932-zoom-stats',zoom);if(focus){const a=$('span',focus),b=$('strong',focus),c=$('small',focus);if(a)a.textContent=selected?selected.row.time.replace('T',' '):day;if(b)b.textContent=selected?selected.row[key]+' '+unit:'N/A';if(c)c.textContent=selected?selected.type==='high'?L('↑ 本日較高觀測點','↑ Recorded high','↑ 高い観測点','↑ 높은 측정점'):L('↓ 本日較低觀測點','↓ Recorded low','↓ 低い観測点','↓ 낮은 측정점'):L('缺少資料','No data','資料なし','데이터 없음');}
// A rapid event selects its observed minute, not an unrelated daily extremum.
const alert=state.dp1059AlertFocus,alertActive=alert?.pet===state.dog&&alert.date===day&&alert.kind===kind&&Number.isInteger(alert.minute)&&alert.minute===state.dp932WaveMinute;
const center=alertActive?alert.minute:selected?mins(selected.row.time):720;
const from=Math.max(0,center-30),to=Math.min(1439,center+30),zoomSvg=$('svg.dp932-chart',zoom);
trace(zoomSvg,valid,key,low,high,from,to,kind==='heart'?'#d36d8e':'#42a3bf',true,alertActive?[]:selected?[selected]:[]);
if(alertActive){
 const frame=(svg,a,b)=>{if(!svg)return;const ns='http://www.w3.org/2000/svg',r=document.createElementNS(ns,'rect');const at=37+313*(alert.minute-a)/Math.max(1,b-a);r.setAttribute('x',String(Math.max(37,Math.min(336,at-7))));r.setAttribute('y','20');r.setAttribute('width','14');r.setAttribute('height','126');r.setAttribute('rx','3');r.setAttribute('fill','none');r.setAttribute('stroke','#d52d63');r.setAttribute('stroke-width','1.5');r.setAttribute('stroke-dasharray','4 3');r.dataset.dp167AlertMinute=String(alert.minute);svg.append(r);};
 frame(chart,0,1439);frame(zoomSvg,from,to);
 const label=$('.dp932-zoom-stats',zoom);if(label){const a=$('span',label),b=$('strong',label),c=$('small',label);if(a)a.textContent=day+' '+String(Math.floor(center/60)).padStart(2,'0')+':'+String(center%60).padStart(2,'0')+(Number.isInteger(alert.second)?':'+String(alert.second).padStart(2,'0'):'');if(b)b.textContent=ok(alert.values?.[kind])?alert.values[kind]+' '+unit:'N/A';if(c)c.textContent=L('提醒原始觀測值；圖框為所在分鐘','Alert reading; frame marks its minute','通知値・発生分を表示','알림 측정값 · 해당 분 표시');}
 buttons?.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));
}
}
// The LAFA 24h graph and 48-slot strip MUST use the same per-record
// quiet-rest predicate and the same 08:00 -> next-day 08:00 sleep date
// contract as milo-adaptive-scores.js/restObservation24().
const sleepBinCache=new Map();
function sleepBins(day){
 const histLen=root.DeepPetMiloHistory545?.samples?.length||0;
 const liveLen=root.DeepPetMiloPetHealth20261122?.records?.length||0;
 const key=day+'|'+histLen+'|'+liveLen;
 // SDK imports can change readings without changing A2/B0 array lengths.
 // Rebuild from the score engine on every render, avoiding a stale 48-slot UI.
 const start=Date.parse(day+'T00:00:00+08:00'),end=start+24*3600000;
 const next=new Date(Date.parse(day+'T12:00:00Z')+86400000).toISOString().slice(0,10);
 const timeline=calc.dayScores(day).sleep?.details?.timeline||[];
 const samples=timeline.map(x=>({...x,absolute:parseTS(x.ts)}))
  .filter(r=>Number.isFinite(r.absolute)&&r.absolute>=start&&r.absolute<end)
  .sort((a,b)=>a.absolute-b.absolute);
 const out=Array.from({length:48},(_,i)=>{
  const from=start+i*30*60000,to=from+30*60000;
  const block=samples.filter(r=>r.absolute>=from&&r.absolute<to);
  const seconds=block.reduce((s,r)=>s+r.seconds,0);
  const quietSeconds=block.filter(r=>r.resting).reduce((s,r)=>s+r.seconds,0);
  const quiet=block.filter(r=>r.resting).length;
  const mode=seconds<300?'missing':quietSeconds/seconds>=.5?'sleep':'awake';
  const stamp=t=>new Date(t+8*3600000).toISOString().slice(0,16).replace('T',' ');
  return {index:i,from:stamp(from),to:stamp(to),mode,count:block.length,quiet,
          mean:middle(block.map(r=>r.motion))};
 });
 return out;
}
function lafaSelectSlot(container,index,fromTimeline=true){
 if(!container)return;
 const buttons=$$('.sleep-date-timeline button[data-lafa-slot]',container);
 if(!buttons.length)return;
 const i=Math.max(0,Math.min(buttons.length-1,Number(index)||0));
 buttons.forEach((b,j)=>b.classList.toggle('selected-slot',j===i));
 const scrub=$('.dp-sleep-scrub-track',container);if(scrub)scrub.style.setProperty('--sleep-scrub',`${(i+.5)/buttons.length*100}%`);
 const current=buttons[i],text=current?.title||'';
 const reading=$('.sleep-slot-reading',container);if(reading)reading.textContent=text;
 const chart=$('.dp-owner-sleep-wave .dp-chart-inspector',container);
 if(chart){
  const label=$('.dp-chart-current',chart);if(label)label.textContent=text;
  if(fromTimeline&&typeof inspectPoint==='function')inspectPoint(chart,i);
 }
}
// Preserve the native pointer, touch and keyboard handlers, but prevent their
// gallery-demo source from rewriting LAFA's real observations on hover/drag.
if(typeof dpSyncSleepSlot==='function'){
 const baseSync=dpSyncSleepSlot;
 dpSyncSleepSlot=function(container,index,fromTimeline=true){
  if(lafa()&&container?.querySelector('.sleep-date-timeline button[data-lafa-slot]')){
   lafaSelectSlot(container,index,fromTimeline);return;
  }
  return baseSync(container,index,fromTimeline);
 };
}
function syncTimeline(el,day){
 if(!el)return;
 const bins=sleepBins(day),buttons=$$('.sleep-date-timeline [data-action="sleep-slot"]',el);
 if(buttons.length!==48){console.error('LAFA sleep timeline requires 48 native slots, received '+buttons.length);return;}
 buttons.forEach((btn,i)=>{
  const b=bins[i];btn.className=b.mode;btn.dataset.lafaSlot=String(i);
  btn.dataset.lafaDay=day;btn.dataset.slot=String(i);
  btn.title=`${b.from}–${b.to} · ${b.mode==='sleep'?L('低動靜休息候選','Possible quiet rest','低活動','낮은 움직임'):b.mode==='awake'?L('有動靜','Movement','活動','움직임'):L('缺測','Missing','欠測','누락')}`;
  btn.setAttribute('aria-label',btn.title);
  btn.style.backgroundColor=b.mode==='missing'?'#e8ebee':'';
 });
 const chart=$('.dp-owner-sleep-wave .dp-chart-inspector',el),svg=$('svg',chart);
 if(chart&&svg){
  const obj=typeof plotRegistry!=='undefined'?plotRegistry[Number(chart.dataset.inspectorId)]:null;
  const values=bins.map(x=>x.mode==='missing'?null:x.mode==='sleep'?1:0);
  const W=obj?.width||350,H=obj?.height||125,lf=obj?.left||35,rt=obj?.right||4,top=obj?.top||10,bt=obj?.bottom||27;
  const span=W-lf-rt,ph=H-top-bt;
  const ys=values.map(v=>v===null?top:v===1?top:top+ph);
  if(obj){obj.values=values;obj.dates=bins.map(()=>day);
   obj.timeLabels=bins.map(b=>b.from+'–'+b.to);
   obj.yCoords=ys;obj.xRatios=bins.map((_,i)=>(i+.5)/48);}
  let path='',last=false;
  values.forEach((v,i)=>{if(v===null){last=false;return;}
   const x=lf+span*(i+.5)/48;
   path+=(last?'L':'M')+x.toFixed(2)+' '+ys[i].toFixed(2)+' ';
   last=true;
  });
  const line=$('path',svg);if(line)line.setAttribute('d',path);
  const labels=$$('text',svg);const ticks=labels.slice(-5);
  if(ticks.length===5){['00:00','06:00','12:00','18:00','24:00'].forEach((s,i)=>ticks[i].textContent=s);}
  svg.dataset.lafaSleepSource=day;
  svg.setAttribute('aria-label',L('拉菲24小時休息／活動（缺測斷開）','LAFA 24-hour rest/movement; gaps disconnected','24時間の動静','24시간 움직임'));
 }
 const tip=$('.sleep-slot-reading',el);
 if(tip)tip.textContent=L('移到時間格可查看實測狀態與精確時段','Hover over intervals for recorded time and status','区間に触れて時刻を確認','구간에 마우스를 올려 확인');
 el.dataset.lafaNight=day;el.dataset.lafaWindow='selected00:00-selected24:00';
}
function fillSleep(page,day){const v=calc.period(day,1,'sleep'),summary=$('.dp1068-detail-score',page);setSummary(summary,v.score,day,L('依全天低動靜、心率與呼吸計算的休息觀測分；不能判定真正睡眠階段。','Calendar-day quiet-rest observation based on motion and vitals; sleep stages not established.','夜間休息観測です','야간 휴식 관측'),'sleep');if(!ok(v.score)&&!(v.coverage?.observedMin>0)){const finding=$('.dp1068-detail-why p',page);if(finding)finding.textContent=L('該日沒有足夠的休息觀測。','Insufficient rest observations for this date.','この夜の記録はありません','해당 날짜 야간 기록 없음');}const panel=$('.dp905-sleep-day',page);if(!panel)return;const head=$('.dp905-sleep-head h2',panel);if(head)head.textContent=day+' '+L('睡眠情況','Sleep & rest','睡眠状態','수면 상태');nativeInnerRing(panel,v.score);const verdict=$('.dp905-sleep-head p',panel);if(verdict)verdict.textContent=ok(v.score)?level(v.score)[3]:level(null)[3];const stats=$$('.dp905-day-stats b',panel);if(stats[0])stats[0].textContent=(v.coverage?.observedMin>0&&ok(v.quietHours24))?Math.round(v.quietHours24*10)/10+' '+L('小時候選','h possible rest','時間候補','시간 후보'):'N/A';if(stats[1])stats[1].textContent=(v.coverage?.observedMin>0&&ok(v.nightInterruptions))?v.nightInterruptions+' '+L('次動靜變化','movement transitions','動静','움직임 변화'):'—';syncTimeline($('.dp-owner-sleep-timeline',panel),day);}
function motionSvg(svg,r,start=0,end=1439,focus=null){if(!svg)return;const p=$('path',svg);if(p){let d='',prior=null;for(const row of r){const minute=mins(row.time);if(minute<start||minute>end)continue;const connected=prior!==null&&minute-prior<=2.1;const x=36+312*(minute-start)/Math.max(1,end-start),y=143-126*row.motion/120;d+=(connected?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)+' ';prior=minute;}p.setAttribute('d',d);}
 const circles=$$('circle',svg);for(const c of circles){const f=focus&&mins(focus.time)>=start&&mins(focus.time)<=end?focus:null;if(!f){c.remove();continue;}const fx=36+312*(mins(f.time)-start)/Math.max(1,end-start),fy=143-126*f.motion/120;c.setAttribute('cx',fx.toFixed(2));c.setAttribute('cy',fy.toFixed(2));}
 const labels=$$('text',svg);for(let i=0;i<Math.min(3,labels.length);i++)labels[i].textContent=String(120-i*60);const ticks=labels.slice(3);const clock=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');ticks.forEach((e,i)=>e.textContent=clock(start+(end-start)*i/Math.max(1,ticks.length-1)));svg.dataset.lafaRealMotion='true';svg.dataset.lafaStart=String(start);svg.dataset.lafaEnd=String(end);svg.setAttribute('aria-label',L('拉菲實測動靜（缺測不連線）','LAFA measured movement, with gaps','実測の動静','실측 움직임'));}
function fillEnergy(page,day){const v=calc.period(day,1,'energy'),r=rows(day).filter(x=>ok(x.motion)),summary=$('.dp1068-detail-score',page);setSummary(summary,v.score,day,L('精力依同日有效動靜、心肺與睡眠聯動計算，缺測不補值。','Energy uses linked motion, cardio and rest observations; missing inputs are not imputed.','活動の参考評価','활동 참고 점수'),'energy');if(!r.length){const finding=$('.dp1068-detail-why p',page);if(finding)finding.textContent=L('當日沒有有效動靜資料。','No verified movement for this date.','活動記録なし','움직임 기록 없음');}const area=$('.dp905-overview',page);if(!area)return;const stats=$$('.dp905-day-stats b',area),mean=middle(r.map(x=>x.motion));if(stats[0])stats[0].textContent=ok(mean)?mean.toFixed(1)+' /120':'—';const notable=extrema(r,'motion');const selected=notable.find(x=>x.row.time===pickedEnergy)||notable.find(x=>x.type==='high')||notable[0];if(stats[1])stats[1].textContent=String(notable.length);
const heading=$('h2',area);if(heading)heading.textContent=day+' '+L('精力情況','Energy status','活動状態','활력 상태');
const guide=$('.dp909-percent-guide p',area);if(guide)guide.textContent=L('原廠動靜指標為 0–120，並非健康百分比；無紀錄的時段不補值。','OEM motion index ranges 0–120, not a health percentage. Gaps are not filled.','動静指標は0～120です','움직임 지수는 0~120입니다');
const intro=$('.dp905-overview>p',page);if(intro)intro.textContent=L('圖上顯示實際動靜趨勢；選取下方高低點可放大，無資料處保留空白。','Actual movement timeline. Select recorded highs/lows to zoom; gaps remain empty.','高低点を選択して確認','높고 낮은 지점을 눌러 확대');
const note=$('.dp909-day-note p',area);if(note)note.textContent=L('高低變化點僅代表實測相對變化，不表示疾病或醫療警報。','Marked highs and lows are relative recorded changes, not medical alerts.','変動点は診断ではありません','변화 지점은 의료 경보가 아닙니다');
motionSvg($('.dp905-signal-svg',area),r,0,1439,selected?.row);
const readout=$('.dp908-chart-readout',area);if(readout)readout.textContent=L('移至曲線查看原始動靜值與實際時間','Hover to inspect recorded motion and time','計測時刻を確認','측정 시각 확인');
const zoom=$('.dp905-zoom',page);if(zoom&&notable.length){const eventRow=$('.dp905-event-row',zoom);if(eventRow)eventRow.innerHTML=notable.map(e=>`<button type="button" class="dp905-event-button ${e===selected?'active':''}" data-lafa-energy="${esc(e.row.time)}"><b>${e.type==='high'?'↑':'↓'} ${stamp(e.row.time)}</b><small>${e.row.motion.toFixed(1)} /120</small></button>`).join('');const m=mins(selected.row.time),begin=Math.max(0,m-30),end=Math.min(1439,m+30);motionSvg($('.dp905-signal-svg',zoom),r,begin,end,selected.row);const statsZoom=$$('.dp905-key-values b',zoom);if(statsZoom[0])statsZoom[0].textContent=selected.row.time.replace('T',' ');if(statsZoom[1])statsZoom[1].textContent=selected.row.motion.toFixed(1)+' /120';if(statsZoom[2])statsZoom[2].textContent=ok(mean)?mean.toFixed(1)+' /120':'—';const noteZoom=$('.dp905-sim-note',zoom);if(noteZoom)noteZoom.textContent=L('選取的是項圈實際動靜變化，非模擬事件或醫療診斷。','Selected changes are from recorded collar data, not demo events or a diagnosis.','実測の動静変化です','실측 움직임 변화입니다');}
if(!notable.length){const row=$('.dp905-event-row',page);if(row)row.innerHTML='';const zoom=$('.dp905-zoom',page);if(zoom){motionSvg($('.dp905-signal-svg',zoom),[],0,1439,null);$$('.dp905-key-values b',zoom).forEach(e=>e.textContent='—');}}
const absent=$('.dp905-no-event',page);if(absent&&notable.length)absent.remove();else if(absent)absent.textContent=r.length?L('當日有動靜資料，但沒有符合篩選的高低點。','Motion samples exist, but no review points meet selection.','変化点なし','변화점 없음'):L('當日缺少有效動靜紀錄，保留原版詳情位置。','No valid movement recorded for this date.','記録なし','기록 없음');}

// Build 7/30-day detail from the EXACT scored-gallery calendar component.
// The gallery's score values are zeroed immediately; the date ledger fills each day.
function nativePeriodCalendar(kind,range){
 const cal=root.DeepPetLafaCalendarShell?.(kind,range,state.deepSelectedDate);if(!cal)return '';
 const title=kind==='heart'?L('心跳波形與變化','Heart-rate changes','心拍波形','심박 변화'):L('呼吸波形與變化','Breathing changes','呼吸変化','호흡 변화');
 const card=`<section class="card dp905-period-lead"><h2>${range} ${L('天數據總覽','day overview','日間の概要','일 요약')}</h2><p>${L('選擇有實測資料的日期，查看該日全天波形、高低點及放大時段。','Select a recorded date to inspect its true full-day trace and extrema.','実測日を選択','기록일을 선택하세요')}</p></section>`;
 return `<div class="app-pad dp905-page dp905-wave-period"><header class="dp-independent-head"><button type="button" data-action="dp905-detail-back" aria-label="Back">←</button><b>${title} · ${range}${L('天',' days','日','일')}</b></header>${card}${cal}</div>`;
}
function hydrateEnergyPeriod(page,range){
 // Populate a data-neutral dp1046-trend SVG from the selected date ledger.
 const source=$('.dp1046-trend',page),svg=$('svg',source);
 const note=$('.dp905-energy-calendar>p',page);if(note)note.textContent=L('未滿有效天數時不顯示期間分數。圖中只畫當日真正已有的觀測分數。','Period total locked; this chart shows only recorded daily observations.','期間総合点は未解錠です','기간 점수 잠김');
 if(!source||!svg)return;
 const days=$$('[data-action="dp905-date-open"][data-date]',page).map(el=>el.dataset.date);
 if(!days.length)return;
 const points=days.map((date,i)=>({date,value:calc.dayScores(date).energy?.score??null,i}));
 const x=i=>43+295*i/Math.max(1,points.length-1),y=v=>135-120*v/100;
 let last=false;const parts=[],dots=[];
 points.forEach((p,i)=>{if(!ok(p.value)){last=false;return;}const X=x(i).toFixed(2),Y=y(p.value).toFixed(2);parts.push((last?'L':'M')+X+' '+Y);last=true;dots.push(`<circle cx="${X}" cy="${Y}" r="3.2" fill="#fff" stroke="#4b87dc" stroke-width="2"><title>${p.date} · ${p.value} /100</title></circle>`);});
 const labels=[0,Math.floor((points.length-1)/2),points.length-1].map((idx,i)=>`<text x="${x(idx)}" y="165" text-anchor="${i===0?'start':i===2?'end':'middle'}" font-size="9" fill="#73839b">${points[idx].date.slice(5).replace('-','/')}</text>`).join('');
 const grid=[100,50,0].map(v=>`<line x1="43" x2="338" y1="${y(v)}" y2="${y(v)}" stroke="#dfe6f1"/><text x="37" y="${y(v)+3}" text-anchor="end" fill="#657a91" font-size="10">${v}</text>`).join('');
 svg.innerHTML=grid+`<line x1="43" x2="338" y1="135" y2="135" stroke="#9babc0"/>`+`<path d="${parts.join(' ')}" stroke="#4b87dc" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`+dots.join('')+labels;
 source.dataset.chartValues=JSON.stringify(points.map(p=>({date:p.date,value:p.value})));
 source.dataset.lafaActualDaily='true';
 const tip=$('.dp1046-trend-readout',source);if(tip)tip.textContent=L('請選擇下方日期查看當日實測。','Select a recorded date below.','日付を選択','날짜를 선택');
}
function addNative(){if(!lafa()||state.tab!=='deep')return;const detail=state.detail||'';const main=$('.app-main');if(!main)return;const day=currentDay();
if(detail==='dp90-waveform'&&state.dp905WaveMode!=='day'&&([7,30].includes(Number(state.dp905WaveRange))||[7,30].includes(Number(state.range)))){const range=[7,30].includes(Number(state.dp905WaveRange))?Number(state.dp905WaveRange):Number(state.range);const native=nativePeriodCalendar(state.dp90WaveKind==='breath'?'breath':'heart',range);if(native)main.innerHTML=native;return;}
if(detail==='dp908-energy-calendar'&&[7,30].includes(Number(state.range))){const range=Number(state.range),cal=root.DeepPetLafaCalendarShell?.('energy',range,state.deepSelectedDate);if(cal){main.innerHTML=`<div class="app-pad dp905-page dp908-energy-calendar-page"><header class="dp-independent-head"><button type="button" data-action="dp905-detail-back" aria-label="Back">←</button><b>${L('精力情況','Energy status','活力','활력')} · ${range}${L('天',' days','日','일')}</b></header><section class="card dp905-energy-calendar"><h3>${L('期間精力分數趨勢','Period energy scores','期間の活力','기간 활력')}</h3><p></p><div class="dp1046-trend" role="group"><svg viewBox="0 0 360 180" role="img" aria-label="${L('精力分數','Energy scores','活力点数','활력 점수')}"></svg><div class="dp1046-trend-readout" aria-live="polite"></div></div></section>${cal}</div>`;hydrateEnergyPeriod(main,range);}return;}
if(['dp90-waveform','dp905-sleep-day','dp905-energy-day'].includes(detail)){
 if(lastDetail!==detail+'|'+day){picked=null;pickedEnergy=null;lastDetail=detail+'|'+day;}
 const kind=detail==='dp90-waveform'?(state.dp90WaveKind==='breath'?'breath':'heart'):detail==='dp905-sleep-day'?'sleep':'energy';main.innerHTML=detailShell(day,kind);
 const page=main.firstElementChild;if(!page)return;page.dataset.lafaCanonical='true';if(detail==='dp90-waveform')heartBreath(page,day,state.dp90WaveKind==='breath'?'breath':'heart');else if(detail==='dp905-sleep-day')fillSleep(page,day);else fillEnergy(page,day);return;
}
if(!detail){
 const nativePage=$('.dp-owner-deep',main);if(nativePage){nativePage.classList.remove('dp1094-canonical-deep');if(state.deepType===0)nativePage.classList.add('dp74-heart-palette');if(state.deepType===2){$('.dp901-health-score',nativePage)?.classList.add('dp902-flow');const metric=$$('.dp901-metric-card',nativePage);metric[2]?.classList.add('dp902-calm-target');}}
 if(state.deepType===1&&Number(state.range)===1){
  const timeline=$('.dp-owner-sleep-timeline',main);if(timeline){const idx=demoRecords(0).findIndex(r=>r.date===day);if(idx>=0){timeline.innerHTML=dpOwnerSleepWave({date:day,idx})+sleepMatrixDate(idx);syncTimeline(timeline,day);}
   const host=$('.dp-owner-deep',main);if(host&&calc.dayScores(day).sleep.coverage?.observedMin>0&&!$('.dp71-night-link',host)){
    const source=document.createElement('section');source.className='card dp71-card dp71-night-link';source.innerHTML=`<div class="dp71-mainhead"><div><h3>${L('夜間心肺 × 睡眠觀察','Overnight heart–breathing × rest','夜間心拍・呼吸と休息','야간 심폐 × 휴식 관찰')}</h3><p>${L('夜間休息與心肺趨勢觀察','Rest and nighttime heart/breathing','夜間の休息と心拍・呼吸','야간 휴식과 심폐 추세')}</p></div><span class="dp71-risk normal">${L('觀察','Observe','観察','관찰')}</span></div><div class="dp71-night-facts"><p></p><p></p></div><p class="dp71-night-next"></p>`;
    const prev=copyDate(new Date(Date.parse(day+'T12:00:00Z')-86400000).toISOString().slice(0,10));const night=[...rows(prev).filter(x=>mins(x.time)>=1200),...rows(day).filter(x=>mins(x.time)<720)];const hr=middle(night.map(x=>x.hr).filter(ok)),br=middle(night.map(x=>x.breath).filter(ok));
    const facts=$$('.dp71-night-facts p',source);if(facts[0])facts[0].textContent=ok(hr)?L(`夜間心率觀測中位數 ${hr} bpm`,`Observed night HR median ${hr} bpm`,`夜間心拍中央値 ${hr} bpm`,`야간 심박 중앙값 ${hr} bpm`):L('本晚缺少心率觀測','No night HR observations','心拍記録なし','심박 기록 없음');
    if(facts[1])facts[1].textContent=ok(br)?L(`夜間呼吸觀測中位數 ${br} 次／分`,`Observed night breathing median ${br}/min`,`夜間呼吸中央値 ${br}/分`,`야간 호흡 중앙값 ${br}/분`):L('本晚缺少呼吸觀測','No night breathing observations','呼吸記録なし','호흡 기록 없음');
    const next=$('.dp71-night-next',source);if(next)next.textContent=L('夜間心肺與低動靜僅作並列觀察，不能證明因果或診斷睡眠階段。','Overnight vitals and quiet movement are observations, not proof of causation or sleep stages.','因果関係を示しません。','인과 관계를 의미하지 않습니다.');host.appendChild(source);
   }
  }
 }
}
}
const old=render;render=function(reset=false){old(reset);try{addNative();}catch(e){console.error('LAFA canonical template data',e);}};
root.addEventListener('click',ev=>{if(!lafa()||state.tab!=='deep')return;
 const cal=ev.target?.closest?.('[data-action="dp905-date-open"][data-date]');
 if(cal){const day=cal.dataset.date,kind=cal.dataset.kind;if(!/^\d{4}-\d{2}-\d{2}$/.test(day||''))return;
  ev.preventDefault();ev.stopImmediatePropagation();
  state.dp905OriginDetail=state.detail;state.dp905ChosenDate=day;state.dp905PickedEvent=0;state.dp932WaveMinute=null;
  state.tab='deep';state.modal='';
  if(kind==='cardio'||kind==='activityRecovery'){
   // A main-page aggregate calendar date leads to that same date's ORIGINAL Deep tab.
   state.deepType=kind==='cardio'?0:2;state.range=1;state.deepSelectedDate=day;state.dp1007DayManuallyChosen=true;state.detail=null;
  }
  else if(kind==='sleep'){state.deepType=1;state.detail='dp905-sleep-day';}
  else if(kind==='energy'){state.deepType=2;state.dp936EnergyDate=day;state.detail='dp905-energy-day';}
  else{state.deepType=0;state.dp90WaveKind=kind==='breath'?'breath':'heart';state.dp90WaveDate=day;state.dp905WaveMode='day';state.detail='dp90-waveform';}
  render(true);return;
 }
 const chip=ev.target?.closest?.('.dp932-wave-page[data-lafa-canonical] [data-lafa-point]');if(chip){ev.preventDefault();ev.stopImmediatePropagation();picked={time:chip.dataset.lafaPoint,type:chip.dataset.lafaKind};state.dp932WaveMinute=null;render(false);return;}
const energy=ev.target?.closest?.('[data-lafa-energy]');if(energy){ev.preventDefault();ev.stopImmediatePropagation();pickedEnergy=energy.dataset.lafaEnergy;render(false);return;}
const sleep=ev.target?.closest?.('[data-lafa-slot]');if(sleep){ev.preventDefault();ev.stopImmediatePropagation();showSlot(sleep);}},true);
function showSlot(el){const container=el.closest('.dp-owner-sleep-timeline');if(!container||!lafa())return;lafaSelectSlot(container,Number(el.dataset.lafaSlot),true);}
document.addEventListener('mousemove',ev=>{if(!lafa()||state.detail!=='dp905-energy-day')return;const svg=ev.target?.closest?.('.dp905-page[data-lafa-canonical] svg[data-lafa-real-motion]');if(!svg)return;const rect=svg.getBoundingClientRect();const fraction=((ev.clientX-rect.left)/Math.max(1,rect.width)-.10)/.867;const from=Number(svg.dataset.lafaStart),to=Number(svg.dataset.lafaEnd);const minute=Math.max(from,Math.min(to,from+Math.max(0,Math.min(1,fraction))*(to-from)));const rr=rows(currentDay()).filter(x=>ok(x.motion));const closest=rr.reduce((b,x)=>Math.abs(mins(x.time)-minute)<Math.abs(mins(b?.time||'2026-11-20T23:59')-minute)?x:b,null);const readout=$('.dp908-chart-readout',svg.closest('.dp908-inspect-chart'));if(readout&&closest){readout.textContent=closest.time.replace('T',' ')+' · '+closest.motion+' /120';ev.stopImmediatePropagation();}},true);
document.addEventListener('mouseover',ev=>{if(!lafa())return;const el=ev.target?.closest?.('[data-lafa-slot]');if(el)showSlot(el);},true);
document.addEventListener('focusin',ev=>{if(!lafa())return;const el=ev.target?.closest?.('[data-lafa-slot]');if(el)showSlot(el);},true);
root.DeepPetLafaCanonicalTemplate=Object.freeze({version:'v10.199-neutral-detail-components',source:'date-scoped detail components and LAFA data; no cross-pet template rendering',otherPetsUntouched:true});
try{if(lafa()&&state.tab==='deep')render(false);}catch(e){console.error('LAFA canonical initial',e);}
})(window);
