/* DeepPet V9.04: lightweight, three-layer heart/breath waveform page.
   The bundled minute-level demo is NOT live hardware data or medical anomaly detection. */
(function(){
'use strict';
const L=(a,b,c,d,e)=>state.lang==='zh'?b:state.lang==='en'?c:state.lang==='ko'?d:state.lang==='ja'?(e||c):a;
const fixed=(n,d=1)=>Number.isFinite(Number(n))?Number(n).toFixed(d):'—';
function streamData(kind,date){
 const v=dpSignals(date,['heart','breath']);
 if(!v[kind]||v[kind].length!==1440)return null;
 const raw=v[kind];
 const events=dpEventsFor(date).filter(e=>Number.isFinite(e.minute));
 const primary=dp66DemoPeak(date,kind),start=primary?.time&&/^\d\d:\d\d$/.test(primary.time)?Number(primary.time.slice(0,2))*60+Number(primary.time.slice(3)):720;
 const points=events.map(e=>({minute:e.minute,score:e.score||0}));
 if(!points.some(e=>Math.abs(e.minute-start)<45))points.push({minute:start,score:999});
 const result=[];
 for(const e of points.sort((a,b)=>b.score-a.score)){
   if(result.every(r=>Math.abs(r.minute-e.minute)>70))result.push(e);
   if(result.length>=3)break;
 }
 return {raw,v,events:result.sort((a,b)=>a.minute-b.minute),mean:raw.reduce((a,b)=>a+b,0)/raw.length};
}
const time=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
function svgTrend(raw,events,chosen,kind,fullDay){
 const W=360,H=180,l=36,r=12,t=20,b=33;
 const start=fullDay?0:Math.max(0,chosen-30),end=fullDay?1439:Math.min(1439,chosen+30);
 const values=fullDay?Array.from({length:241},(_,i)=>raw[Math.min(1439,i*6)]):raw.slice(start,end+1);
 const lo=Math.floor((Math.min(...values)-3)/5)*5,hi=Math.ceil((Math.max(...values)+3)/5)*5;
 const x=m=>l+(W-l-r)*(m-start)/(end-start),y=v=>t+(hi-v)/Math.max(1,hi-lo)*(H-t-b);
 const path=values.map((v,i)=>`${i?'L':'M'}${x(Math.min(end,start+(fullDay?6:1)*i)).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
 const grid=[0,.5,1].map(f=>{const yy=t+(H-t-b)*f;return `<line x1="${l}" y1="${yy}" x2="${W-r}" y2="${yy}" stroke="#e8edf4"/><text x="${l-5}" y="${yy+4}" text-anchor="end" font-size="10" fill="#8793a4">${fixed(hi-(hi-lo)*f,0)}</text>`}).join('');
 const ticks=(fullDay?[0,360,720,1080,1439]:[start,Math.round((start+end)/2),end]).map((m,i,a)=>`<text x="${x(m)}" y="${H-8}" text-anchor="${i===0?'start':i===a.length-1?'end':'middle'}" font-size="10" fill="#7c8c9f">${time(m)}</text>`).join('');
 const mark=(fullDay?events:[{minute:chosen}]).filter(e=>e.minute>=start&&e.minute<=end).map(e=>{
  const px=x(e.minute),py=y(raw[e.minute]),active=e.minute===chosen;
  return `<circle cx="${px}" cy="${py}" r="${fullDay?(active?8:5):11}" fill="#fff9fa" stroke="${active?'#e24d62':'#d68887'}" stroke-width="${active?2.6:2}"/><circle cx="${px}" cy="${py}" r="2.5" fill="#e24d62"/><line x1="${px}" x2="${px}" y1="${py+10}" y2="${H-b+3}" stroke="#e24d62" stroke-dasharray="3 4" opacity=".65"/>`;
 }).join('');
 const unit=kind==='heart'?'bpm':L('次／分','次／分','/min','회/분','回／分');
 return `<svg class="dp904-trend-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${fullDay?'24-hour overview':'Detailed flagged interval'}"><text x="${l}" y="12" fill="#7e899a" font-size="10">${unit}</text>${grid}<path d="${path}" stroke="${kind==='heart'?'#bb5477':'#487fb8'}" fill="none" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>${mark}${ticks}</svg>`;
}
function breedContext(kind){
 const dog=currentDog(),breed=String(breedText(dog)||'')+' '+String(dog.breed?.en||'');
 if(kind==='breath'&&/pug|巴哥|法鬥|法斗|french.bulldog|boston.terrier|波士頓|波士顿/i.test(breed))
   return `<section class="card dp904-breed-note"><b>${L('短鼻犬呼吸觀察','短鼻犬呼吸观察','Short-nosed breed guidance','단두종 호흡 관찰','短頭種の呼吸')}</b><p>${L('巴哥、法鬥等短鼻犬應優先留意安靜時喘氣、呼吸費力或活動後難以平復。這些模擬波形不能確診呼吸道阻塞；若實際呼吸困難、昏厥或牙齦發藍，應立即就醫。','巴哥、法斗等短鼻犬需优先留意安静时喘气、呼吸费力或活动后难以缓解。模拟波形不能确诊气道阻塞；实际出现呼吸困难、晕厥或牙龈发蓝应立即就医。','Watch for labored breathing at rest and poor recovery after activity. This simulated chart cannot diagnose airway obstruction; seek urgent veterinary care for severe breathing difficulty, collapse or blue gums.','호흡 곤란, 실신, 잇몸 청색증이 있으면 즉시 수의사에게 진료를 받으세요.','安静時の呼吸困難や運動後の回復の遅れに注意し、重い症状は緊急受診してください。')}</p></section>`;
 if(/malamute|阿拉斯加/i.test(breed))
   return `<section class="card dp904-breed-note"><b>${L('大型犬照護背景','大型犬照护背景','Large-dog context','대형견 돌봄','大型犬のケア')}</b><p>${L('可另外在健康管理追蹤體重、關節與活動耐受；心肺曲線不能診斷腸胃或關節疾病。','可另外在健康管理追踪体重、关节与活动耐受；心肺曲线不能诊断肠胃或关节疾病。','Track weight, joint care and exercise tolerance separately. Heart/breathing curves cannot diagnose gastrointestinal or joint disease.','체중·관절·활동을 별도로 관리하세요.','体重、関節、運動耐性は別途確認します。')}</p></section>`;
 return '';
}
function page(){
 const kind=state.dp90WaveKind==='breath'?'breath':'heart',date=state.dp90WaveDate||iso(localDate()),data=streamData(kind,date);
 const name=kind==='heart'?L('心跳','心跳','Heart rate','심박','心拍'):L('呼吸','呼吸','Breathing','호흡','呼吸');
 const back=`<header class="dp-independent-head"><button data-action="dp90-wave-back" aria-label="Back">←</button><b>${name}${L('波形','波形',' waveform',' 파형','波形')}</b></header>`;
 if(!data)return `<div class="app-pad dp90-wave-page dp904-wave-page">${back}<section class="card">${L('所選日期沒有有效波形資料','所选日期没有有效波形数据','No valid data on selected day','유효 데이터 없음','有効データがありません')}</section></div>`;
 const events=data.events.length?data.events:[{minute:720,score:0}],index=Math.max(0,Math.min(events.length-1,Number(state.dp904WaveSelected)||0)),selected=events[index],unit=kind==='heart'?'bpm':L('次／分','次／分','/min','회/분','回／分');
 const idx=demoRecords(state.dog).findIndex(r=>r.date===date),rec=demoRecords(state.dog)[idx];
 const dateTabs=demoRecords(state.dog).slice(-7).map(x=>`<button class="dp904-date-button ${x.date===date?'active':''}" type="button" data-action="dp904-wave-day" data-date="${x.date}">${x.date.slice(5)}</button>`).join('');
 const eventChoices=events.map((e,i)=>`<button class="dp904-event-choice ${i===index?'active':''}" data-action="dp904-wave-event" data-index="${i}"><b>${time(e.minute)}</b><span>${fixed(data.raw[e.minute],1)} ${unit}</span></button>`).join('');
 const disclaimer=L('本頁波形和標記使用示範資料；尚未接入真實項圈 SDK。圈選的是相對變化時段，不代表已診斷異常、呼吸暫停或猝死風險。','本页波形及标记来自模拟数据，尚未接入真实项圈 SDK。圈选的是相对变化时段，不代表确诊异常、呼吸暂停或猝死风险。','The waveform and markers are simulated, not live SDK data. Flagged segments indicate relative changes, not diagnosed apnea, arrhythmia or sudden-death risk.','데모 신호이며 의학적 진단이 아닙니다.','デモデータであり、診断やリスク予測ではありません。');
 return `<div class="app-pad dp90-wave-page dp904-wave-page">${back}<div class="dp904-wave-pet"><strong>${currentDog().name}</strong><span>${date}</span></div>
 <section class="card dp904-wave-card"><div class="dp904-wave-title"><span class="dp904-step">01</span><h3>${L('即時波形','实时波形','Live waveform','실시간 파형','リアルタイム波形')}</h3></div>${streamingPanel(kind,kind==='heart'?'#c64c70':'#387fe1',name,kind==='heart'?currentDog().hr:currentDog().rr)}<p class="dp904-small-note">${L('動態示例（8 秒滾動），目前不是實際設備即時監測。','动态示例（最近8秒），目前并非设备实时数据。','Animated 8-second demo, not a live sensor stream.','8초 데모 파형입니다.','8秒のデモです。')}</p></section>
 <section class="card dp904-wave-card"><div class="dp904-wave-title"><span class="dp904-step">02</span><h3>${L('全天波形與變化時段','全天波形与变化时段','Daily overview & changes','하루 전체 파형','1日の波形')}</h3></div><div class="dp904-date-strip">${dateTabs}</div>${svgTrend(data.raw,events,selected.minute,kind,true)}<p class="dp904-small-note">${L('紅圈標記需回看的示範變化時段。點選時間，下方立即放大。','红圈标记值得回看的示范变化时段。点击时间，下方显示放大波形。','Red markers show sample intervals worth reviewing. Select a time to zoom below.','표시 시간을 선택하면 확대됩니다.','赤丸の時間帯を選ぶと下に拡大表示します。')}</p><div class="dp904-events">${eventChoices}</div></section>
 <section class="card dp904-wave-card"><div class="dp904-wave-title"><span class="dp904-step">03</span><h3>${L('時段放大：準確時間與數值','时段放大：准确时间与数值','Zoomed segment & readings','구간 확대','時間帯の拡大')}</h3></div><div class="dp904-focus-values"><div><small>${L('標記時間','标记时间','Flagged time','표시 시간','時刻')}</small><b>${date} ${time(selected.minute)}</b></div><div><small>${name}</small><b>${fixed(data.raw[selected.minute],1)} ${unit}</b></div><div><small>${L('當日均值','当日均值','Day average','당일 평균','当日平均')}</small><b>${fixed(data.mean,1)} ${unit}</b></div></div>${svgTrend(data.raw,events,selected.minute,kind,false)}<p class="dp904-small-note">${L('以上是標記時間前後約30分鐘、逐分鐘的模擬讀數；不是 20Hz 原始 BCG 波形。','以上为标记时间前后约30分钟的逐分钟示范读数，不是 20Hz 原始 BCG 波形。','Simulated one-minute values in a ±30-minute window; not a raw 20Hz BCG waveform.','표시 시점 전후 30분 데모입니다.','前後30分間のデモです。')}</p></section>
 ${breedContext(kind)}<p class="dp904-warning">${disclaimer}</p><div class="footer-space"></div></div>`;
}
const originalDeep=deepView;
deepView=function(){return state.detail==='dp90-waveform'?page():originalDeep();};
const originalAction=onAction;
onAction=function(target){
 const action=target?.dataset?.action;
 if(action==='dp904-wave-event'){state.dp904WaveSelected=Number(target.dataset.index)||0;render(false);return;}
 if(action==='dp904-wave-day'){state.dp90WaveDate=target.dataset.date;state.dp904WaveSelected=0;render(false);return;}
 if(action==='dp90-wave-open'){state.dp904WaveSelected=0;}
 return originalAction(target);
};
// Load only small display-sized avatars on icon surfaces; original photo retained for full-screen use.
const thumbBase='assets/demo_score_portraits/';
const thumbCache=new Map();
function optimizedAvatar(img){
 const raw=img.getAttribute('src')||'';
 if(!raw.includes(thumbBase)||!raw.endsWith('.jpg'))return;
 const small=raw.slice(0,-4)+'_thumb.webp';
 img.src=small;img.loading='eager';img.decoding='async';img.fetchPriority='high';
}
const oldRender=render;
render=function(reset=false){oldRender(reset);document.querySelectorAll('img.pet-avatar,.pet-pill img,.profile-hero .pet-avatar,.story-avatar,.dp-owner-pet-avatar').forEach(optimizedAvatar);};
})();
