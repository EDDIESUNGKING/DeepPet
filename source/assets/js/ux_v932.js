/* DeepPet V9.32 | sequential first-use setup, consistent N/A states, trend extrema.
   The existing health-score formulas are deliberately unchanged. */
(function(root){'use strict';
const tr=(zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isFirst=()=>selectedBlank()||dp58FreshPet()||isFreePet();
const identity=()=>selectedBlank()?'blank':String(state.dog);
const getStep=()=>state.dp932Steps?.[identity()]??0;
function stepTo(v){state.dp932Steps??={};state.dp932Steps[identity()]=Math.max(0,Math.min(4,v));persist();}
const photoSaved=()=>!!state.dp932PhotoByPet?.[identity()];
const named=d=>d&&String(d.name||'').trim()&&!/^(New Pet|新寵物|新宠物)$/i.test(String(d.name).trim());
function ready(){const d=selectedBlank()?null:currentDog();return !!(d&&named(d)&&d.species&&d.breed&&d.breed.en!=='Not set'&&Number(d.age)>0&&Number(d.weight)>0&&Number(d.heightCm)>0&&photoSaved());}
const phase=()=>isFirst()?getStep():4;
// Gallery mode: investor can switch freely; no compulsory three-step registration.
function navBlocked(){return false;}
function uiButton(label,action,extra=''){return `<button type="button" data-dp932="${action}" ${extra}>${label}</button>`;}
function wizard(){const st=phase(),d=selectedBlank()?null:currentDog(),image=d?.photo?`<img src="${esc(d.photo)}" alt=""/>`:'<span>🐾</span>';
 const phaseTitle=st===0?tr('先認識 DeepPet','Discover DeepPet first','DeepPet 소개','DeepPet紹介'):st===1?tr('先完成寵物檔案','Complete your pet profile','프로필 완성','プロフィール作成'):st===2?tr('選擇是否配對項圈','Connect a collar or skip','목걸이 연결','首輪接続'):tr('健康管理可以先填或稍後再填','Health records are optional','건강記録任意','健康記録は任意');
 const tour=`<button class="dp932-tour-first" data-action="tour-open"><span class="dp932-tour-mark">▶</span><span><small>${tr('60 秒認識 DeepPet','DeepPet in 60 seconds','DeepPet 60초','DeepPet 60秒')}</small><strong>${tr('了解每天監測、深度分析、照護與長期健康','Daily sensing, deeper trends, care and wellness','건강 기능 소개','機能を紹介')}</strong></span><span>›</span></button>`;
 const hero=`<button type="button" class="dp932-hero ${st===0?'dp932-locked':''}" data-dp932="profile"><span class="dp932-hero-image">${image}</span><span class="dp932-hero-copy"><small>${tr('第一步 · 認識你的寵物','Step 1 · Your pet','1단계','ステップ1')}</small><b>${esc(d?.name||tr('還沒有寵物資料','No pet profile','반려동물 정보 없음','未登録'))}</b><em>${d&&named(d)?`${esc(breedText(d))} · ${esc(d.age||'N/A')} ${tr('歲','yrs','세','歳')} · ${esc(d.weight||'N/A')} kg`:tr('填寫照片、種類、品種、姓名、年齡、體重及肩高','Photo, species, breed, name, age, weight and height required','프로필과 사진 입력','写真と基本情報を入力')}</em><strong>${st>=2?'✓ '+tr('已完成','Complete','완료','完了'):st===0?tr('先完成 60 秒介紹','Complete the 60-second introduction first','소개 먼저','まず紹介を見る'):tr('填寫完整寵物資料','Create complete pet profile','프로필 만들기','登録する')}</strong></span></button>`;
 const second=`<section class="dp932-phase ${st<2?'locked':st>2?'done':''}"><header><b>02</b><strong>${tr('連接 DeepPet 項圈','Connect DeepPet collar','목걸이 연결','首輪を接続')}</strong></header><p>${tr('可配對藍牙健康版或 4G 定位版；沒有購買也可以跳過。','Bluetooth health or 4G GPS. You may skip this step.','목걸이가 없으면 건너뛰기','購入前ならスキップできます')}</p>${uiButton(tr('搜尋附近設備','Find nearby collars','기기 검색','首輪検索'),'pair',st!==2?'disabled':'')}${uiButton(tr('暫時跳過連接','Skip pairing for now','연결 건너뛰기','スキップ'),'skip-pair',st!==2?'disabled':'')}</section>`;
 const careChoices=[['🩺',tr('體檢分析','Health examinations','건강 검진','検診'),'reports'],['🥣',tr('飲食目標','Food goals','식事','食事'),'food'],['💊',tr('用藥記錄','Medication','약','投薬'),'med'],['💉',tr('疫苗記錄','Vaccinations','예방접종','予防接種'),'vaccines'],['🐛',tr('驅蟲記錄','Deworming','구충','駆虫'),'deworming']];
 const third=`<section class="dp932-phase ${st<3?'locked':st>3?'done':''}"><header><b>03</b><strong>${tr('健康管理（可略過）','Health records (optional)','건강 관리','健康記録')}</strong></header><p>${tr('僅需按需要記錄以下五項；尚未填寫的保持 N/A。','Only these five care categories; unused entries remain N/A.','필요한 기록만 작성','必要な項目のみ記録')}</p><div class="dp932-care-grid">${careChoices.map(([ico,label,key])=>`<button data-dp932="care" data-kind="${key}" ${st!==3?'disabled':''}><span>${ico}</span>${label} ›</button>`).join('')}</div>${uiButton(tr('完成並進入首頁','Finish and open Home','완료','完了'),'finish',st!==3?'disabled':'')}${uiButton(tr('略過健康管理，進入首頁','Skip care and open Home','건너뛰기','スキップ'),'skip-care',st!==3?'disabled':'')}</section>`;
 return `<div class="app-pad dp932-wizard">${homePetStrip()}<section class="dp932-header"><small>DeepPet · START</small><h2>${phaseTitle}</h2><p>${tr('完成 60 秒介紹後依次進行第一、第二及第三步；未完成的步驟不能提前進入。','After the 60-second introduction, complete steps 1–3 in order.','차례대로 진행하세요','順番に進めてください')}</p></section>${tour}${hero}${second}${third}<div class="footer-space"></div></div>`;
}
const originalBlankHome=blankHomeView, originalFreshHome=dp58FreshHome, originalFreeHome=freeCareHomeView;
blankHomeView=function(){return navBlocked()?wizard():originalBlankHome();};
dp58FreshHome=function(){return navBlocked()?wizard():originalFreshHome();};
freeCareHomeView=function(){return navBlocked()?wizard():originalFreeHome();};
// Detectors operate on one source of truth. Never infer emergency illness from a conspicuous demo peak.
const detector=root.DeepPetChange932;
function readings(kind,date){try{
 if(typeof demoRecords==='function'&&typeof qualityForDay==='function'){
  const i=demoRecords(state.dog).findIndex(r=>r.date===date);
  if(i<0||!qualityForDay(i,state.dog).valid)return null;
 }
 const x=dpSignals(date,[kind]),a=x?.[kind];
 return Array.isArray(a)&&a.length===1440&&a.every(Number.isFinite)?a:null;
}catch{return null;}}
function changes(kind,date){const a=readings(kind,date);return a?detector.detect(a,{kind,maxEvents:35}):[];}
function time(i){return String(Math.floor(i/60)).padStart(2,'0')+':'+String(i%60).padStart(2,'0');}
function chart(series,events,chosen,kind,full=true){const W=360,H=180,L=37,R=10,T=20,B=34,a=full?0:Math.max(0,chosen-30),b=full?1439:Math.min(1439,chosen+30),stride=1;const samples=[];for(let i=a;i<=b;i+=stride)samples.push(i);if(samples.at(-1)!==b)samples.push(b);
 const vals=samples.map(i=>series[i]);const lo=Math.min(...vals),hi=Math.max(...vals),margin=Math.max(2,(hi-lo)*.12),low=lo-margin,high=hi+margin;
 const x=m=>L+(W-L-R)*(m-a)/(b-a||1),y=v=>T+(high-v)/(high-low||1)*(H-T-B);
 const lines=samples.map((m,i)=>`${i?'L':'M'}${x(m).toFixed(2)} ${y(series[m]).toFixed(2)}`).join(' ');
 const axes=[0,.5,1].map(q=>{const yy=T+(H-T-B)*q;return `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" stroke="#e3eaf5"/><text x="${L-5}" y="${yy+3}" text-anchor="end" font-size="10" fill="#73829b">${(high-(high-low)*q).toFixed(0)}</text>`}).join('');
 const xlabels=(full?[0,360,720,1080,1439]:[a,Math.round((a+b)/2),b]).map((m,i,arr)=>`<text x="${x(m)}" y="${H-7}" text-anchor="${i===0?'start':i===arr.length-1?'end':'middle'}" font-size="9.5" fill="#79859d">${time(m)}</text>`).join('');
 const pins=events.filter(e=>e.minute>=a&&e.minute<=b).map(e=>{const color=e.type==='high'?'#f06d69':'#4287df',selected=e.minute===chosen;return `<g class="dp932-chart-point" data-dp932="choose-event" data-minute="${e.minute}" role="button" tabindex="0" aria-label="${time(e.minute)} ${e.type}"><circle cx="${x(e.minute)}" cy="${y(series[e.minute])}" r="${selected?7.5:5.1}" fill="#ffffff" stroke="${color}" stroke-width="2"/><circle cx="${x(e.minute)}" cy="${y(series[e.minute])}" r="2.4" fill="${color}"/></g>`;}).join('');
 const marker=Number.isInteger(chosen)&&chosen>=a&&chosen<=b?`<line x1="${x(chosen)}" y1="${T}" x2="${x(chosen)}" y2="${H-B}" stroke="#f35d76" stroke-width="1.5" stroke-dasharray="4 4"/><circle class="dp938-selected-event" cx="${x(chosen)}" cy="${y(series[chosen])}" r="8" stroke="#f35d76" stroke-width="3" fill="#fff"/><circle cx="${x(chosen)}" cy="${y(series[chosen])}" r="3" fill="#f35d76"/><title>${time(chosen)} · ${series[chosen]?.toFixed(1)}</title>`:'';
 return `<svg class="dp932-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Daily changes"><text x="${L}" y="11" fill="#7285a0" font-size="10">${kind==='heart'?'bpm':kind==='breath'?tr('次/分','/min','회/분','回/分'):tr('活動強度','Activity','활동','活動')}</text>${axes}<path d="${lines}" fill="none" stroke="${kind==='heart'?'#d36d8e':kind==='breath'?'#42a3bf':'#5294d8'}" stroke-width="2.25" stroke-linecap="round"/>${pins}${marker}${xlabels}</svg>`;
}
function waveDetail(){const kind=state.dp90WaveKind==='breath'?'breath':'heart',date=state.dp90WaveDate||iso(localDate()),days=[7,30].includes(state.dp932WaveDays)?state.dp932WaveDays:1,arr=readings(kind,date),ev=arr?changes(kind,date):[],minute=Number.isInteger(state.dp932WaveMinute)?state.dp932WaveMinute:null,latest=ev.length?[...ev].sort((a,b)=>b.minute-a.minute)[0]:null,chosen=arr&&minute!==null&&minute>=0&&minute<1440?(ev.find(e=>e.minute===minute)||{minute,value:arr[minute],type:'selected'}):latest;
 const title=kind==='heart'?tr('心跳波形與變化','Heart rate changes','심박 변화','心拍変化'):tr('呼吸波形與變化','Breathing changes','호흡 변화','呼吸変化');
 const nav=`<header class="dp-independent-head"><button type="button" data-dp932="wave-back" aria-label="Back">←</button><b>${title}</b></header>`;
 const calendar=days===1?'':`<section class="card dp932-wave-calendar"><h3>${tr(`最近 ${days} 天 · 選擇日期`,`Choose a date · ${days} days`,`${days}일`,`日付選択`)}</h3><div class="dp932-wave-dates">${Array.from({length:days},(_,i)=>{const dt=iso(dateAdd(localDate(),i-days+1)),count=changes(kind,dt).length;return `<button type="button" data-dp932="wave-date" data-date="${dt}" class="${dt===date?'selected':''}"><small>${dt.slice(5)}</small>${count?`<b>${count} ${tr('處','changes','건','件')}</b>`:'<em>N/A</em>'}</button>`}).join('')}</div></section>`;
 if(!arr)return `<div class="app-pad dp932-wave-page">${nav}${calendar}<section class="card dp932-wave-empty">${tr('所選日期沒有有效資料','No valid data for this date','측정 없음','記録なし')} · N/A</section></div>`;
 const unit=kind==='heart'?'bpm':tr('次／分','/min','회/분','回/分'),choices=ev.length?ev.map(e=>`<button class="dp932-event-chip ${e.minute===chosen.minute?'selected':''}" data-dp932="choose-event" data-minute="${e.minute}"><span>${e.type==='high'?'↑':'↓'} ${time(e.minute)}</span><b>${e.value.toFixed(1)} ${unit}</b></button>`).join(''):'<p>N/A</p>';
 return `<div class="app-pad dp932-wave-page">${nav}<p class="dp932-wave-subtitle">${esc(currentDog().name)} · ${date} · ${tr('明顯高低變化標記','Notable highs and lows','변화 기록','高低変化')}</p>${calendar}<section class="card dp932-wave-section"><header><b>${tr('即時波形','Live waveform','실시간 파형','リアルタイム波形')}</b><small>${tr('未連接真實 SDK，動態僅為示範','Demo pending real SDK','데모','デモ')}</small></header>${streamingPanel(kind,kind==='heart'?'#d97190':'#498fd8',title,kind==='heart'?currentDog().hr:currentDog().rr)}</section><section class="card dp932-wave-section"><header><b>${tr('全天波形與變化時段','Full-day trend and changes','전체 변화','一日変化')}</b><small>${date}</small></header>${chart(arr,ev,chosen?.minute??720,kind,true)}<div class="dp932-wave-legend"><span>↑ ${tr('高點','High','높음','高')}</span><span>↓ ${tr('低點','Low','낮음','低')}</span></div><div class="dp932-wave-events">${choices}</div></section><section class="card dp932-wave-section"><header><b>${tr('時段放大 · 與標記時間同步','Zoom · selected time','확대','拡大')}</b></header>${chosen?`<div class="dp932-zoom-stats"><span>${date} ${time(chosen.minute)}</span><strong>${chosen.value.toFixed(1)} ${unit}</strong><small>${chosen.type==='high'?'↑':'↓'} ${tr('相對變化','Relative change','변화','相対変化')}</small></div>${chart(arr,ev,chosen.minute,kind,false)}`:`<div class="dp932-wave-empty">N/A · ${tr('今天沒有達到標記條件的高低點','No notable relative extremes','변화 없음','変化なし')}</div>`}</section><p class="dp932-demo-note">${tr('這些標記是分鐘趨勢中相對明顯的高低變化，不等於醫療級異常或緊急疾病診斷；僅憑訊號中斷不能判定呼吸停止。','Relative minute-trend markers, not validated medical emergencies. Signal loss does not prove apnea.','의료 진단 아님','診断ではありません')}</p></div>`;
}
const originalDeep=deepView;
function energyMarkers(){
 if(state.tab!=='deep'||state.deepType!==2||isFirst()||state.detail)return '';
 const selectedDate=state.range===1?(deepChosenDate?.()||iso(localDate())):iso(localDate()),dates=state.range===1?[selectedDate]:Array.from({length:state.range===30?30:7},(_,i)=>iso(dateAdd(localDate(),i-(state.range===30?29:6))));
 const all=dates.map(date=>({date,series:readings('activity',date)})),events=all.flatMap(({date,series})=>series?detector.detect(series,{kind:'activity',maxEvents:22}).map(x=>({...x,date})):[]);
 const today=all.find(x=>x.date===selectedDate),ev=today?.series?events.filter(e=>e.date===selectedDate):[],one=ev.find(e=>e.minute===Number(state.dp932EnergyMinute))||ev[0];
 return `<section class="card dp932-energy-changes"><h3>${tr('活動與精力變化高低點','Activity and energy changes','활동 변화','活動変化')}</h3><p>${tr('結合活動強度觀察變化時間；高活動量或安靜休息本身不代表疾病。','View activity highs/lows. Activity peaks or rest alone are not illnesses.','활동량 변화','活動変化')}</p>${state.range===1&&today?.series?`${chart(today.series,ev,one?.minute??720,'activity',true)}<div class="dp932-wave-events">${ev.map(e=>`<button class="dp932-event-chip" data-dp932="energy-minute" data-minute="${e.minute}">${e.type==='high'?'↑':'↓'} ${time(e.minute)} · ${e.value.toFixed(0)}</button>`).join('')}</div>${one?`<div class="dp932-zoom-stats">${selectedDate} ${time(one.minute)} · ${tr('活動強度','Activity','활동','活動')} ${one.value.toFixed(0)}</div>${chart(today.series,ev,one.minute,'activity',false)}`:'<p>N/A</p>'}`:`<div class="dp932-energy-days">${dates.map(date=>`<button data-dp932="energy-day" data-date="${date}"><b>${date.slice(5)}</b><small>${events.filter(e=>e.date===date).length||'N/A'}</small></button>`).join('')}</div>`}</section>`;
}
deepView=function(){if(state.detail==='dp90-waveform')return waveDetail();const page=originalDeep();if(state.deepType!==2||isFirst())return page;const card=energyMarkers();return page.replace('<div class="footer-space"></div>',card+'<div class="footer-space"></div>');};
function dailyAlerts(){if(state.tab!=='home'||isFirst())return '';const date=iso(localDate()),p=changes('heart',date),q=changes('breath',date),activity=changes('activity',date),all=[...p.map(e=>({...e,kind:'heart'})),...q.map(e=>({...e,kind:'breath'})),...activity.map(e=>({...e,kind:'activity'}))].sort((a,b)=>a.minute-b.minute);if(!all.length)return '';
 const shown=state.dp932AllAlerts?all:all.slice(0,3);const list=shown.map(e=>`<button type="button" data-dp932="alert-open" data-kind="${e.kind}" data-minute="${e.minute}"><b>${e.kind==='heart'?'💓':e.kind==='breath'?'🌬️':'🏃'} ${e.type==='high'?'↑':'↓'} ${time(e.minute)}</b><span>${e.kind==='heart'?tr('心率','Heart rate','심박','心拍'):e.kind==='breath'?tr('呼吸','Breathing','호흡','呼吸'):tr('活動強度','Activity','활동','活動')} ${e.value.toFixed(1)} ${e.kind==='heart'?'bpm':e.kind==='breath'?tr('次/分','/min','/min','/min'):''}</span></button>`).join('');
 return `<section class="card dp932-alerts"><header><b>${tr('今日生理變化提醒','Today’s physiological changes','오늘 변화 알림','本日の変化')}</b><small>${all.length} ${tr('處標記','markers','건','件')}</small></header><p>${tr('提示今日值得回看的明顯高低點；不等於緊急疾病判定。','Notable highs/lows for review, not emergency diagnoses.','변화 확인','診断ではありません')}</p><div>${list}</div>${all.length>3?uiButton(state.dp932AllAlerts?tr('收起','Show less','접기','閉じる'):tr('More · 查看全部','More · View all','모두 보기','すべて表示'),'alert-more'):''}</section>`;
}
const oldModal=renderModal;
renderModal=function(){oldModal();if(!navBlocked()||!['pet-add','edit-pet'].includes(state.modal))return;const f=document.getElementById('dp931-pet-photo'),height=document.querySelector('#addPetHeight,#petHeightInput');if(f){f.required=true;const small=f.parentElement?.querySelector('small');if(small)small.textContent=tr('首次建立必須上傳寵物正面照','Pet photo required during setup','사진 필수','写真必須');}if(height){height.required=true;const label=height.parentElement?.querySelector('.form-label');if(label)label.textContent=tr('肩高（必填）cm','Shoulder height (required) cm','어깨 높이 필수','肩高 必須');}const age=document.getElementById('addPetAge');if(age&&!age.dataset.dp932Clean){age.value='';age.dataset.dp932Clean='1';}}
const prevAction=onAction;
let dp932SavingPhoto=false;
async function checkedPhoto(file){
 if(!file||!/^image\//.test(file.type)||file.size>12*1024*1024)throw new Error('invalid-image');
 const blob=URL.createObjectURL(file);try{
  const img=new Image();img.src=blob;await img.decode();if(img.naturalWidth<20||img.naturalHeight<20)throw new Error('invalid-dimensions');
  const ratio=Math.min(1,720/Math.max(img.naturalWidth,img.naturalHeight));const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/jpeg',.78);
 }finally{URL.revokeObjectURL(blob);}
}
onAction=async function(el){const a=el?.dataset?.action;
 if(a==='tour-enter'&&navBlocked()){prevAction(el);stepTo(1);state.tab='home';render(true);return;}
 if(a==='pet-add-save'&&navBlocked()){
  if(dp932SavingPhoto)return;
  const img=document.getElementById('dp931-pet-photo')?.files?.[0],name=document.getElementById('addPetName')?.value?.trim(),height=Number(document.getElementById('addPetHeight')?.value);
  if(!img||!named({name})||!Number.isFinite(height)||height<=0){toast(tr('第一步必須填寫完整資料並上傳照片（含肩高）','Complete all required fields, including pet photo and height','필수 항목 입력','必須項目を入力'));return;}
  dp932SavingPhoto=true;
  const petIndex=state.dog,petEpoch=state.dpPetEpoch,petModal=state.modal;
  try{const photo=await checkedPhoto(img);if(state.dog!==petIndex||state.dpPetEpoch!==petEpoch||state.modal!==petModal)return;const old=state.petExtras.length;prevAction(el);
   if(state.petExtras.length===old+1){state.petOverrides??={};state.petOverrides[state.dog]={...(state.petOverrides[state.dog]||{}),photo};state.dp932PhotoByPet??={};state.dp932PhotoByPet[identity()]=true;stepTo(2);state.tab='home';render(true);persist();}
  }catch(e){toast(tr('照片讀取失敗，請重新上傳清晰照片','Unable to read image; choose a valid pet photo','사진 파일 오류','画像を確認'));}finally{dp932SavingPhoto=false;}return;
 }
 if(a==='save-pet'&&navBlocked()){
  if(dp932SavingPhoto)return;
  const img=document.getElementById('dp931-pet-photo')?.files?.[0],name=document.getElementById('petNameInput')?.value?.trim(),height=Number(document.getElementById('petHeightInput')?.value);
  if((!img&&!photoSaved())||!named({name})||!Number.isFinite(height)||height<=0){toast(tr('寵物照片、姓名與肩高為必填','Pet photo, name and height are required','필수 입력','入力必須'));return;}
  dp932SavingPhoto=true;
  const petIndex=state.dog,petEpoch=state.dpPetEpoch,petModal=state.modal;
  try{const photo=img?await checkedPhoto(img):currentDog().photo;if(state.dog!==petIndex||state.dpPetEpoch!==petEpoch||state.modal!==petModal)return;prevAction(el);
   if(state.modal!=='edit-pet'){state.petOverrides??={};state.petOverrides[state.dog]={...(state.petOverrides[state.dog]||{}),photo};state.dp932PhotoByPet??={};state.dp932PhotoByPet[identity()]=true;stepTo(2);state.tab='home';render(true);persist();}
  }catch(e){toast(tr('照片讀取失敗，請重新上傳','Unable to read photo; select another image','사진 파일 오류','画像を確認'));}finally{dp932SavingPhoto=false;}return;
 }
 if(navBlocked()&&['device-find','health-detail','dp921-open-latest','dp921-list'].includes(a)&&phase()<2){toast(tr('請先完成前一步','Please finish the previous step','이전 단계','前のステップ'));return;}
 if(a==='dp90-wave-open'){state.dp932WaveDays=[7,30].includes(state.range)?state.range:1;state.dp932WaveMinute=null;}
 if(a==='dp90-wave-back'){state.dp932WaveMinute=null;}
 return prevAction(el);
};
const oldRender=render;
render=function(reset=false){
 if(navBlocked()&&state.pairStage===4&&state.connected&&phase()===2){stepTo(3);state.modal='';state.tab='home';state.detail=null;}
 if(navBlocked()&&!(state.dp932CareDetail&&state.tab==='health')){state.tab='home';state.detail=null;}
 oldRender(reset);const app=document.getElementById('app');if(!app)return;
 if(navBlocked()){
  app.querySelectorAll('.nav-button').forEach(x=>{x.setAttribute('aria-disabled','true');x.classList.add('dp932-nav-locked');});
  if(state.dp932CareDetail&&state.tab==='health'){
   const main=app.querySelector('.app-main');if(main)main.insertAdjacentHTML('afterbegin',`<div class="dp932-care-return">${uiButton('← '+tr('返回第三步','Back to step 3','돌아가기','戻る'),'care-back')}</div>`);
  }
 } else if(isFirst()) {
  // Demo-only empty profiles must never inherit the examination/plan summary
  // that the old global Health decorator inserts BEFORE the pet switcher.
  // Their only known facts are profile fields (for New Pet), never 96/100 from Milo.
  if(state.tab==='health')app.querySelectorAll('.dp931-empty-health > .dp916-health-card,.dp931-empty-health > .dp916-care-card').forEach(el=>el.remove());
  if(state.tab==='home')app.querySelectorAll('.dp916-home-card,.dp916-home-exam-card,.dp925-open-exams,.dp921-home-exam-link,.dp-health-exam-home').forEach(el=>el.remove());
  // Keep the optional introduction and setup demonstration visible.
  const small=app.querySelector('.dp931-profile-hero small');if(small)small.textContent=tr('寵物資料','Pet profile','반려동물','ペット情報');
  const walker=document.createTreeWalker(app,NodeFilter.SHOW_TEXT);let text;while((text=walker.nextNode()))if(text.nodeValue.trim()==='—')text.nodeValue=text.nodeValue.replace('—','N/A');
 }
 if(!navBlocked())for(const card of app.querySelectorAll('.dp928-model-card')){
  const m=root.DeepPetAudit925?.model?.();if(!m||!Number.isFinite(m.score))continue;
  const score=card.querySelector('.dp928-wellness-metric');if(score&&!score.querySelector('.dp932-model-status')){
    const status=m.score>=90?tr('近期整體表現很好','Doing very well','상태 좋음','良好'):m.score>=80?tr('近期狀態平穩','Looking steady','안정적','安定'):m.score>=60?tr('部分指標值得留意','Some areas need attention','관찰 필요','要注意'):tr('建議查看近期變化','Review recent changes','변화 확인','変化を確認');
    score.insertAdjacentHTML('beforeend',`<span class="dp932-model-status">${status}</span>`);
  }
  const age=card.querySelector('.dp928-age-metric');if(age&&!age.querySelector('.dp932-age-status')&&Number.isFinite(m.ageYears)&&Number.isFinite(m.actualAge)){
    const delta=root.DeepPetMetric1015?.difference('age',m.ageYears,m.actualAge)??Math.round((Number(m.ageYears.toFixed(1))-Number(m.actualAge.toFixed(1)))*10)/10;const verdict=delta<0?tr('推算年齡較年輕','Estimated younger','젊게 추정','若く推定'):delta>0?tr('推算年齡較年長','Estimated older','높게 추정','高く推定'):tr('推算年齡接近實際','Close to actual age','유사','ほぼ同じ');
    age.insertAdjacentHTML('beforeend',`<span class="dp932-age-status">${verdict}</span>`);
  }
 }
 app.querySelectorAll('.app-build-version').forEach(el=>el.textContent='DeepPet · Version 9.33');
 if(state.tab==='home'&&!navBlocked()){const main=app.querySelector('.app-main');if(main){const markup=dailyAlerts();if(markup){const focus=main.querySelector('.dp-today-focus,.dp931-empty-focus,.summary-card');if(focus)focus.insertAdjacentHTML('afterend',markup);else main.insertAdjacentHTML('afterbegin',markup);}}}
};
const origTour=tourContent;
// Existing four-stage graphical intro is reused, while the setup gate determines which step unlocks next.
const prevModalAction=onAction;
function action(k,el){if(k==='profile'){if(phase()===0){toast(tr('請先看完 60 秒介紹','Finish the 60-second introduction first','소개 먼저','紹介を先に'));return;}openModal(selectedBlank()?'pet-add':'edit-pet');return;}
 if(k==='pair'){if(phase()===2){state.tab='home';state.detail=null;onAction({dataset:{action:'device-find'}});}return;}
 if(k==='skip-pair'){if(phase()===2){stepTo(3);render(true);}return;}
 if(k==='care'){if(phase()!==3)return;state.dp932CareDetail=el.dataset.kind;state.tab='health';state.detail=el.dataset.kind;render(true);return;}
 if(k==='care-back'){state.dp932CareDetail=null;state.tab='home';state.detail=null;render(true);return;}
 if(k==='finish'||k==='skip-care'){if(phase()===3){stepTo(4);state.dp932CareDetail=null;state.tab='home';state.detail=null;render(true);}return;}
 if(k==='wave-back'){
  const origin=state.dp919AlertReturnTab;
  state.dp919AlertReturnTab=null;state.dp1059AlertFocus=null;state.dp1099AlertNeedsScroll=false;
  state.detail=null;state.dp932WaveMinute=null;
  if(origin)state.tab=origin;
  render(true);return;
 }
 if(k==='choose-event'){state.dp932WaveMinute=Number(el.dataset.minute);render(false);return;}
 if(k==='wave-date'){state.dp90WaveDate=el.dataset.date;state.dp932WaveMinute=null;render(false);return;}
 if(k==='alert-more'){state.dp932AllAlerts=!state.dp932AllAlerts;render(false);return;}
 if(k==='energy-minute'){state.dp932EnergyMinute=Number(el.dataset.minute);render(false);return;}
 if(k==='energy-day'){state.range=1;state.deepSelectedDate=el.dataset.date;state.dp1007DayManuallyChosen=true;state.dp932EnergyMinute=null;render(true);return;}
 if(k==='alert-open'&&el.dataset.kind==='activity'){
  state.dp919AlertReturnTab=state.tab;state.dp1099EnergyNeedsScroll=true;
  state.tab='deep';state.deepType=2;state.detail=null;state.range=1;state.deepSelectedDate=iso(localDate());state.dp1007DayManuallyChosen=false;state.dp932EnergyMinute=Number(el.dataset.minute);render(true);return;
 }
 if(k==='alert-open'){
  state.dp919AlertReturnTab=state.tab;state.dp1099AlertNeedsScroll=true;
  const alertDate=iso(localDate()),alertMinute=Number(el.dataset.minute);
  state.dp1059AlertFocus={pet:state.dog,date:alertDate,minute:alertMinute,kind:el.dataset.kind,peer:null};
  state.tab='deep';state.deepType=0;state.detail='dp90-waveform';state.dp90WaveKind=el.dataset.kind;state.dp90WaveDate=alertDate;state.dp932WaveDays=1;state.dp932WaveMinute=alertMinute;render(true);return;
 }
}
document.addEventListener('click',e=>{const el=e.target.closest?.('[data-dp932]');if(!el)return;e.preventDefault();e.stopImmediatePropagation();action(el.dataset.dp932,el);},true);
document.addEventListener('click',e=>{if(!navBlocked())return;const tab=e.target.closest?.('.nav-button');if(tab){e.preventDefault();e.stopImmediatePropagation();state.tab='home';state.detail=null;render(true);toast(tr('請先完成三個設定步驟','Complete setup first','먼저 설정','初期設定を完了'));}},true);
// Allow accessible keyboard entry on chart markers.
document.addEventListener('keydown',e=>{const el=e.target.closest?.('.dp932-chart-point');if(el&&['Enter',' '].includes(e.key)){e.preventDefault();action('choose-event',{dataset:{minute:el.dataset.minute}});}},true);
root.DeepPetUX932={stage:()=>phase(),ready,changes,version:'9.32'};
})(window);
