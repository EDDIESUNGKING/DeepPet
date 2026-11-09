
(function(){
'use strict';
const panel=document.getElementById('dp-story-panel'),body=document.getElementById('dp-story-body');
let tab='heart',started=0,raf=0,activePet='',image=null,elapsed=0,renderToken=0,activeVideo=null;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pet=()=>typeof currentDog==='function'?currentDog():{name:'Pet'};
const key=()=>String(state.dog);
const valid=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const number=(r,ks)=>{for(const k of ks){if(valid(r?.[k]))return Number(r[k])}return null};
const fmt=(v,d=0)=>v===null?'—':v.toFixed(d);
const mean=(r,k)=>{const a=r.map(x=>number(x,k)).filter(v=>v!==null);return a.length?a.reduce((s,v)=>s+v,0)/a.length:null};
function db(){return new Promise((resolve,reject)=>{const req=indexedDB.open('deeppet-heart-portraits',1);req.onupgradeneeded=()=>req.result.createObjectStore('photos');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function photoGet(k){try{const d=await db();return await new Promise(resolve=>{const q=d.transaction('photos','readonly').objectStore('photos').get(k);q.onsuccess=()=>{d.close();resolve(q.result||null)};q.onerror=()=>{d.close();resolve(null)}})}catch(e){return null}}
async function photoSet(k,v){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('photos','readwrite');t.objectStore('photos').put(v,k);t.oncomplete=()=>{d.close();resolve()};t.onerror=()=>{d.close();reject(t.error)}})}
 async function photoDelete(k){try{const d=await db();return await new Promise(resolve=>{const t=d.transaction('photos','readwrite');t.objectStore('photos').delete(k);t.oncomplete=()=>{d.close();resolve()};t.onerror=()=>{d.close();resolve()}})}catch(e){}}
function readData(n){
 const k=key(), raw=state.dpVerifiedDailyRecords?.[k];
 // Real records must be explicitly ingested from the verified collar/SDK pipeline.
 const isReal=Array.isArray(raw)&&raw.length>0;
 const all=isReal?raw:(pet().dpFreshPet?[]:(typeof demoRecords==='function'?demoRecords(state.dog):[]));
 const unique=new Map();
 for(const r of all){if(r&&/^\d{4}-\d{2}-\d{2}$/.test(r.date||'')&&r.petId!==undefined&&String(r.petId)!==k)continue;if(r&&/^\d{4}-\d{2}-\d{2}$/.test(r.date||''))unique.set(r.date,r)}
 const today=typeof localDate==='function'?localDate():new Date();
 const dates=[];for(let i=n-1;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);dates.push([d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'))}
 return {rows:dates.map(date=>unique.get(date)||{date}),real:isReal,dates};
}
function score(r){return number(r,['score','healthScore'])}
function mood(v){return v===null?{label:'等待有效数据',color:'#77839a',kind:'neutral'}:v>=90?{label:'開心活力',color:'#23965b',kind:'happy'}:v>=80?{label:'平穩自然',color:'#387de5',kind:'calm'}:v>=60?{label:'有點不開心',color:'#d88a2e',kind:'soft'}:{label:'明顯不開心',color:'#d05d68',kind:'sad'}}
function sourcePhoto(){return pet().photo||pet().avatar||''}
function stop(){cancelAnimationFrame(raf);raf=0;started=0;if(activeVideo){const v=activeVideo;activeVideo=null;v.pause();v.removeAttribute('src');v.remove();}}
function load(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
function stageDraw(){const c=document.getElementById('dp-petcanvas');if(!c)return;const x=c.getContext('2d'),w=c.width,h=c.height;x.fillStyle='#25293c';x.fillRect(0,0,w,h);if(!image){x.fillStyle='#fff';x.textAlign='center';x.font='24px sans-serif';x.fillText('首次请上传当前宠物照片',w/2,h/2);return}const scale=Math.max(w/image.width,h/image.height),dw=image.width*scale,dh=image.height*scale;x.drawImage(image,(w-dw)/2,(h-dh)/2,dw,dh)}
function wave(id,breath=false){const c=document.getElementById(id);if(!c)return;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.beginPath();for(let i=0;i<c.width;i++){const p=i/(breath?105:75),z=breath?Math.sin(p*2*Math.PI)*.35:(()=>{const q=p%1;return q>.42&&q<.50?Math.sin((q-.42)/.08*Math.PI)*.85:q>.50&&q<.57?-.25*Math.sin((q-.50)/.07*Math.PI):Math.sin(q*Math.PI*2)*.05})();const y=c.height*.52-z*c.height*.43;i?x.lineTo(i,y):x.moveTo(i,y)}x.strokeStyle=breath?'#72c7ff':'#ff8fae';x.lineWidth=3;x.stroke()}
function header(){return `<div class="dp-story-source">${esc(pet().name)} · 当前宠物</div>`}
async function heart(){
 stop();
 const token=++renderToken,k=key(),p=pet(),locale=({zh:'zh',zht:'zht',en:'en',ko:'ko'})[state.lang]||'en';
 const T={
 zh:{save:'保存图片',close:'关闭',scan:'正在感受心跳',collect:'正在读取心跳与呼吸',processing:'正在分析心率变异',ready:'本次测量完成',remaining:'秒',of:'共 60 秒',detail:'持续积累有效数据，可让趋势判断更加稳定',from30:'HRV 初步估计',initial:'首次测量约需 60 秒',generating:'正在生成专属表情',aiWait:'正在准备匹配分数的照片，请稍候',aiOff:'分数已获得，专属表情照片尚未生成',takePhoto:'上传宠物正面照片',approve:'需要将宠物照片发送至 AI 图片服务，生成与健康分数对应的静态表情。是否同意？',saveFail:'保存失败，请重试',hr:'心率',rr:'呼吸',hrv:'HRV',noData:'等待有效数据',happy:'开心活力',calm:'平稳自然',soft:'需要关注',sad:'明显低落',happyDetail:'活力充沛 · 状态优秀',calmDetail:'状态平稳 · 继续保持',softDetail:'略显疲倦 · 适度休息',sadDetail:'活力偏低 · 建议关注',good:'良好',steady:'一般',low:'偏低',seconds:'秒',simulation:'模拟体验',pending:'表情图片准备中',noImage:'尚未选择宠物照片',tapUpload:'点击上传照片'},
 zht:{save:'儲存圖片',close:'關閉',scan:'正在感受心跳',collect:'正在讀取心跳與呼吸',processing:'正在分析心率變異',ready:'本次測量完成',remaining:'秒',of:'共 60 秒',detail:'持續累積有效數據，可讓趨勢判斷更加穩定',from30:'HRV 初步估計',initial:'首次測量約需 60 秒',generating:'正在生成專屬表情',aiWait:'正在準備符合分數的照片，請稍候',aiOff:'分數已取得，專屬表情照片尚未生成',takePhoto:'上傳寵物正面照片',approve:'需要將寵物照片傳送至 AI 圖片服務，產生與健康分數對應的靜態表情。是否同意？',saveFail:'儲存失敗，請再試一次',hr:'心率',rr:'呼吸',hrv:'HRV',noData:'等待有效數據',happy:'開心活力',calm:'平穩自然',soft:'需要關注',sad:'明顯低落',happyDetail:'活力充沛 · 狀態優秀',calmDetail:'狀態平穩 · 繼續保持',softDetail:'略顯疲倦 · 適度休息',sadDetail:'活力偏低 · 建議關注',good:'良好',steady:'一般',low:'偏低',seconds:'秒',simulation:'模擬體驗',pending:'表情照片準備中',noImage:'尚未選擇寵物照片',tapUpload:'點擊上傳照片'},
 en:{save:'Save image',close:'Close',scan:'Listening to their heartbeat',collect:'Reading heart and breathing rhythms',processing:'Analyzing heart rate variability',ready:'Measurement complete',remaining:'sec',of:'of 60 seconds',detail:'More valid readings over time can improve trend estimates',from30:'Preliminary HRV',initial:'First measurement takes about 60 seconds',generating:'Creating a personal expression',aiWait:'Preparing the photo matching the score',aiOff:'Score ready. Expression photo not yet generated',takePhoto:'Upload a front-facing pet photo',approve:'To create a score-matched expression, we need to send this pet photo to an AI image service. Do you agree?',saveFail:'Could not save the image. Try again',hr:'Heart rate',rr:'Breathing',hrv:'HRV',noData:'Waiting for valid readings',happy:'Happy & energetic',calm:'Calm & comfortable',soft:'Needs attention',sad:'Low energy',happyDetail:'Bright and energetic',calmDetail:'Steady and relaxed',softDetail:'A little tired · allow rest',sadDetail:'Low energy · worth checking',good:'Good',steady:'Moderate',low:'Low',seconds:'sec',simulation:'Demo readings',pending:'Expression pending',noImage:'No pet photo selected',tapUpload:'Tap to upload a pet photo'},
 ko:{save:'이미지 저장',close:'닫기',scan:'심장 박동을 확인하고 있어요',collect:'심박과 호흡 리듬을 측정하고 있어요',processing:'심박변이도를 분석하고 있어요',ready:'측정 완료',remaining:'초',of:'총 60초',detail:'더 많은 유효 데이터가 쌓이면 추세 분석이 안정될 수 있어요',from30:'HRV 예비 추정',initial:'첫 측정은 약 60초 걸려요',generating:'맞춤 표정 생성 중',aiWait:'점수에 맞는 사진을 준비하고 있어요',aiOff:'점수는 완료됐지만 표정 사진은 아직 생성되지 않았어요',takePhoto:'반려동물 정면 사진 업로드',approve:'건강 점수에 맞는 정지 이미지를 만들기 위해 반려동물 사진을 AI 이미지 서비스로 전송해야 합니다. 동의하시나요?',saveFail:'이미지 저장에 실패했습니다. 다시 시도하세요',hr:'심박수',rr:'호흡',hrv:'HRV',noData:'유효한 데이터 대기 중',happy:'활기차고 행복함',calm:'안정적이고 편안함',soft:'주의 필요',sad:'활력 저하',happyDetail:'활기차고 좋은 상태',calmDetail:'안정적이고 편안한 상태',softDetail:'조금 피곤함 · 휴식 권장',sadDetail:'활력이 낮음 · 확인 권장',good:'양호',steady:'보통',low:'낮음',seconds:'초',simulation:'시뮬레이션',pending:'표정 사진 준비 중',noImage:'반려동물 사진이 없습니다',tapUpload:'눌러서 사진 업로드'}
 }[locale];
 const grades={happy:{color:'#67e7a9'},calm:{color:'#6ac0ff'},soft:{color:'#ffbc68'},sad:{color:'#ff8592'}};
 const grade=v=>v>=90?'happy':v>=80?'calm':v>=60?'soft':'sad';
 const data=readData(30),today=data.rows[data.rows.length-1],history=data.rows.filter(r=>score(r)!==null);
 const isDemo=Number(state.dog)<15;
 const todayKey=data.dates.at(-1);
 const acquired=state.dpHeartAcquired?.[k];
 const firstMeasurement=!!p.dpFreshPet&&!valid(acquired?.score);
 const existing=isDemo||valid(acquired?.score)||(data.real&&history.length>=2);
 const recordedScore=score(today)??(history.length?score(history[history.length-1]):null);
 const defaultScore=valid(acquired?.score)?Number(acquired.score):recordedScore;
 const initialHR=number(today,['heart','hr'])??number(history.at(-1),['heart','hr'])??(66+Number(k)%16);
 const initialRR=number(today,['breath','rr'])??number(history.at(-1),['breath','rr'])??(17+Number(k)%6);
 const initialRM=number(today,['rmssd'])??number(history.at(-1),['rmssd'])??(p.dpFreshDemo?93:(46+Number(k)%15));
 const precomputed=(isDemo&&Number.isInteger(Number(k)));
 let resultScore=existing&&defaultScore!==null?defaultScore:null;
 let displayedGrade=resultScore!==null?grade(resultScore):null;
 let finalImage=null,initialImage=null;
 let countdownStart=performance.now(),awaitingGeneration=false,scoreVisible=resultScore!==null;
 const stageColor=displayedGrade?grades[displayedGrade].color:'#ff9bbf';
 const C={
 zh:{title:'心跳时刻',subtitle:'健康评估中',ofTime:'／01:00',caption:'正在采集心跳、呼吸与 HRV 数据',foot:'持续积累有效数据，能让健康趋势判断更加稳定',preview:'首次使用 · 模拟测量'},
 zht:{title:'心跳時刻',subtitle:'健康評估中',ofTime:'／01:00',caption:'正在收集心跳、呼吸與 HRV 資料',foot:'持續累積有效資料，能讓健康趨勢判斷更加穩定',preview:'首次使用 · 模擬測量'},
 en:{title:'Heart Moment',subtitle:'Measurement in progress',ofTime:'/ 01:00',caption:'Collecting heart rhythm, breathing and HRV data',foot:'More valid readings over time can improve trend estimates',preview:'First-time · Simulated measurement'},
 ko:{title:'심장 박동 순간',subtitle:'건강 상태 측정 중',ofTime:'/ 01:00',caption:'심박, 호흡, HRV 데이터를 수집하고 있어요',foot:'유효한 데이터가 더 쌓이면 건강 추세 분석이 안정될 수 있어요',preview:'첫 측정 · 시뮬레이션'}
 }[locale];
 panel.classList.add('dp-heart-full','dp54-full');
 const markup=`<section id="dp54-stage" class="dp54-stage ${scoreVisible?'dp54-result':'dp54-measuring'}" style="--mood:${stageColor}">
  <img id="dp54-photo" crossorigin="anonymous" class="dp54-photo" alt="${esc(p.name)}" draggable="false"/>
  <div class="dp54-vignette"></div><div class="dp54-stars" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <header class="dp54-top"><button type="button" id="dp54-download" aria-label="${T.save}" title="${T.save}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></svg></button><strong class="dp54-name">${esc(p.name)}</strong><button type="button" id="dp54-exit" aria-label="${T.close}" title="${T.close}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></header>
  <div class="dp54-lower"><div id="dp54-center" class="dp54-center">
   <div id="dp54-clock" class="dp54-clock dp57-countdown" ${scoreVisible?'hidden':''}><svg class="dp54-clock-svg" viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="dp54-clock-grad" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffcead"/><stop offset=".48" stop-color="#ff98cd"/><stop offset="1" stop-color="#f7b0fa"/></linearGradient></defs><circle cx="100" cy="100" r="87" class="dp54-track"/><circle id="dp54-arc" cx="100" cy="100" r="87" class="dp54-arc"/></svg><span class="dp54-glow-dot"></span><span class="dp57-orbit" aria-hidden="true"></span><div class="dp54-clocktext"><span class="dp54-clock-label">${C.title}</span><span class="dp57-clock-subtitle">${C.subtitle}</span><strong id="dp54-time">01:00</strong><small class="dp57-total-time">${C.ofTime}</small><svg class="dp57-clock-heart" viewBox="0 0 36 30" fill="none" aria-hidden="true"><path d="M18 27 5 15C-1 9 4 2 11 3c3 0 5 2 7 5 2-3 4-5 7-5 7-1 12 6 6 12L18 27Z" stroke="#ffc7d6" stroke-width="1.7"/><path d="M5 15h7l3-5 5 10 3-5h8" stroke="#ffc7d6" stroke-width="1.8" stroke-linejoin="round"/></svg></div></div>
   <div id="dp54-result" class="dp54-resultline" ${scoreVisible?'':'hidden'}><div class="dp54-scorecircle"><strong id="dp-health-score">${scoreVisible?Math.round(resultScore):'—'}</strong><small>/100</small></div><div class="dp54-score-desc"><strong id="dp-health-label">${scoreVisible?T[displayedGrade]:''}</strong><small id="dp-health-detail">${scoreVisible?T[displayedGrade+'Detail']:''}</small></div><div class="dp54-hrvcircle"><span>HRV</span><strong id="dp-hrv-value">${scoreVisible?fmt(initialRM,1):'—'}</strong><small id="dp-hrv-status">${scoreVisible?(initialRM>=55?T.good:initialRM>=35?T.steady:T.low):'—'}</small></div></div>
   <div id="dp57-countdown-caption" class="dp57-countdown-caption" ${scoreVisible?'hidden':''}><strong>${C.caption}</strong><span>${C.foot}</span></div><p id="dp54-hint" class="dp54-hint">${scoreVisible?'':('')}</p>
  </div>
  <div class="dp54-waves"><div class="dp54-wave-row"><span class="dp54-wavehead"><svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 25S2 17 2 9A6.5 6.5 0 0 1 14 5a6.5 6.5 0 0 1 12 4c0 8-12 16-12 16z"/></svg><strong id="dp-hr-live">${Math.round(initialHR)}</strong><small>BPM</small></span><canvas id="dp-wave" width="470" height="65" aria-label="${T.hr}"></canvas></div>
  <div class="dp54-wave-row"><span class="dp54-wavehead dp54-breath"><svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 4v9c-3-5-5-6-7-6C2 7 1 11 1 16c0 5 2 8 6 8 3 0 5-2 6-6m2-14v9c3-5 5-6 7-6 4 0 5 4 5 9 0 5-2 8-6 8-3 0-5-2-6-6"/></svg><strong id="dp-rr-live">${Math.round(initialRR)}</strong><small>${locale==='en'?' /min':locale==='ko'?'회/분':locale==='zh'?'次/分':'次/分'}</small></span><canvas id="dp-breathwave" width="470" height="65" aria-label="${T.rr}"></canvas></div></div>
  <input id="dp-story-upload" class="dp54-upload-input" type="file" accept="image/*" aria-label="${T.takePhoto}"/>
  <button type="button" id="dp54-upload-guide" class="dp54-upload-guide" hidden>${T.tapUpload}</button>
  </div></section>`;
 body.innerHTML=markup;
 const stage=document.getElementById('dp54-stage'),img=document.getElementById('dp54-photo');
 if(firstMeasurement){stage.classList.add('dp57-preview','dp58-first-measure');stage.dataset.preview='new-pet-first-reading';}
 const setSrc=async(url,{reveal=false}={})=>{
  if(!url)return false;
  const test=new Image();
  const ok=await new Promise(resolve=>{test.onload=()=>resolve(true);test.onerror=()=>resolve(false);test.src=url});
  if(ok&&token===renderToken&&key()===k){img.src=url;img.style.opacity='1';if(reveal)stage.classList.add('dp54-sharp');return true}
  return false;
 };
 const pickFile=()=>document.getElementById('dp-story-upload')?.click();
 const demoImage=(g)=>{
  const demo={0:['Milo',95],1:['Luna',84],2:['Coco',38],3:['Leo',22],4:['Poppy',80],5:['Nori',98],6:['Miso',77],7:['Mochi',35],8:['Kiki',17],9:['Max',87],10:['Rex',38],11:['Bella',97],12:['Dodo',61],13:['Snowy',84],14:['Nana',53]};
  const petCase=demo[Number(k)];
  if(!petCase)return null;
  return `assets/demo_score_portraits/${String(Number(k)).padStart(2,'0')}_${petCase[0]}_${petCase[1]}_${grade(petCase[1])}.jpg`;
 };
 const stored=isDemo?null:await photoGet(k);if(token!==renderToken||key()!==k)return;
 const basePhoto=stored||sourcePhoto();
 let selectedImageUrl=null;
 if(scoreVisible&&displayedGrade){
  if(precomputed&&!stored){selectedImageUrl=demoImage(grade(defaultScore));}
  else selectedImageUrl=await photoGet(`expression:${k}:${displayedGrade}`);
 }
 if(selectedImageUrl){const ok=await setSrc(selectedImageUrl,{reveal:true});if(ok){finalImage=img;}else selectedImageUrl=null;}
 if(!selectedImageUrl){const fallback=basePhoto; if(fallback) await setSrc(fallback,{reveal:scoreVisible});if(scoreVisible&&!p.dpFreshPet){stage.classList.add('dp54-unready');document.getElementById('dp54-hint').textContent=T.aiOff;}}
 if(token!==renderToken)return;
 initialImage=img;
 if(!img.src){stage.classList.add('dp54-no-photo');document.getElementById('dp54-upload-guide').hidden=false;document.getElementById('dp54-upload-guide').onclick=pickFile;}
 const photoInput=document.getElementById('dp-story-upload');
 photoInput.onchange=async e=>{const f=e.target.files?.[0];if(!f||!f.type.startsWith('image/'))return; const reader=new FileReader();reader.onload=async()=>{try{await photoSet(k,reader.result);await Promise.all(['happy','calm','soft','sad'].map(g=>photoDelete(`expression:${k}:${g}`)));if(key()===k)heart()}catch(err){console.error(err);alert(T.saveFail)}};reader.readAsDataURL(f)};
 document.getElementById('dp54-exit').onclick=e=>{e.preventDefault();e.stopPropagation();closeHeartScreen()};
 const setHint=(txt)=>{const el=document.getElementById('dp54-hint');if(el)el.textContent=txt};
 async function generateExpression(scoreValue,allowPrompt=true){
  if(!basePhoto||token!==renderToken)return false;
  const g=grade(scoreValue);
  const cached=await photoGet(`expression:${k}:${g}`);
  if(cached){const success=await setSrc(cached,{reveal:true});if(success){finalImage=img;stage.classList.remove('dp54-unready');setHint('');return true}}
  if(precomputed&&!stored){const success=await setSrc(demoImage(g),{reveal:true});if(success){finalImage=img;stage.classList.remove('dp54-unready');setHint('');return true}}
  // The key remains on the server; never send an uploaded pet's face without consent.
  if(allowPrompt&&!state.dpImageCloudConsent){
   if(!window.confirm(T.approve)){stage.classList.add('dp54-unready');setHint(T.aiOff);return false;}
   state.dpImageCloudConsent=true;if(typeof persist==='function')persist();
  }
  awaitingGeneration=true;stage.classList.add('dp54-unready');setHint(T.aiWait);
  try{
   const original=basePhoto;
   let input=original;
   // Normalize to JPEG and bound payload size. Uploaded images may be larger than a function request limit.
   const sourceImg=await load(original);
   const cv=document.createElement('canvas'),sc=Math.min(1,1024/Math.max(sourceImg.width,sourceImg.height));
   cv.width=Math.max(1,Math.round(sourceImg.width*sc));cv.height=Math.max(1,Math.round(sourceImg.height*sc));cv.getContext('2d').drawImage(sourceImg,0,0,cv.width,cv.height);input=cv.toDataURL('image/jpeg',.85);
   const res=await fetch('/.netlify/functions/pet-expression',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({image:input,grade:g,species:p.species||'dog',petName:p.name})});
   if(!res.ok)throw Error(`AI service ${res.status}`);
   const json=await res.json();if(!json.image||!json.image.startsWith('data:image/'))throw Error('missing image');
   await photoSet(`expression:${k}:${g}`,json.image);
   if(token===renderToken&&key()===k){const ok=await setSrc(json.image,{reveal:true});if(ok){finalImage=img;stage.classList.remove('dp54-unready');setHint('')}}
   awaitingGeneration=false;return true;
  }catch(err){console.warn('Expression image service unavailable:',err.message);if(token===renderToken){setHint(T.aiOff);stage.classList.add('dp54-unready')}awaitingGeneration=false;return false;}
 }
 // For previously measured custom pets, use their cached score and image immediately; never replay countdown.
 if(scoreVisible&&!selectedImageUrl&&!precomputed&&basePhoto&&!p.dpFreshPet){generateExpression(resultScore,true)}
 const liveStart=performance.now(),measureTime=60000;
 const drawWave=(id,rate,isBreath,t)=>{
  const c=document.getElementById(id);if(!c)return;const ctx=c.getContext('2d'),W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
  const period=60/Math.max(isBreath?8:35,rate);
  const span=isBreath?17:6;
  for(let px=0;px<W;px++){
   const tim=t-span+px/W*span;
   const phase=((tim/period)%1+1)%1;
   let v;if(isBreath){v=Math.sin(2*Math.PI*phase)*(.60+.05*Math.sin(t*.3));}
   else{v=phase>.40&&phase<.45?Math.sin((phase-.40)/.05*Math.PI)*.91:phase>.47&&phase<.56?-.27*Math.sin((phase-.47)/.09*Math.PI):Math.sin(phase*6.28)*.045;}
   const y=H*.53-H*.42*v;px?ctx.lineTo(px,y):ctx.moveTo(px,y)
  }
  ctx.strokeStyle=isBreath?'#70d6ff':'#ff9abf';ctx.lineWidth=3.2;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=9;ctx.stroke();ctx.shadowBlur=0;
 };
 let lastSecond=-1;
 function animate(now){
  if(token!==renderToken||!panel.classList.contains('open')||key()!==k||tab!=='heart')return;
  if(!img.src){raf=requestAnimationFrame(animate);return;}
  const time=(now-liveStart)/1000;
  const hr=Math.max(40,Math.round(initialHR+2*Math.sin(time*.53)+Math.sin(time*1.27)));
  const rr=Math.max(8,Math.round(initialRR+1.2*Math.sin(time*.42)+.6*Math.sin(time*.89)));
  const sec=Math.floor(time);
  if(sec!==lastSecond){lastSecond=sec;const h=document.getElementById('dp-hr-live'),r=document.getElementById('dp-rr-live');if(h)h.textContent=hr;if(r)r.textContent=rr;}
  drawWave('dp-wave',hr,false,time);drawWave('dp-breathwave',rr,true,time);
  if(!scoreVisible){
   const pct=Math.min(1,time/60),circle=document.getElementById('dp54-arc');
   const orbitDot=document.querySelector('#dp54-clock .dp54-glow-dot');if(orbitDot)orbitDot.style.transform=`translate(-50%,-50%) rotate(${pct*360}deg) translateY(-87px)`;
   if(circle)circle.style.strokeDashoffset=String(546.637*(1-pct));
   const clock=document.getElementById('dp54-time');if(clock){const remaining=Math.max(0,Math.ceil(60-time));clock.textContent=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`}
   // First-time demo keeps the full-bleed portrait visible throughout. Results remain hidden until measurement completes.
   const info=document.getElementById('dp54-info');if(info)info.textContent=time<30?T.collect:T.processing;
   if(firstMeasurement){stage.style.setProperty('--dp57-progress',String(pct));}
   // Preserve blur until we know which expression the score maps to; do not reveal a wrong smiling base photo.
   // V8.56: never blur or hide the pet image, even while the 60s clock is running.
   stage.style.setProperty('--dp54-blur',firstMeasurement?'12px':'0px');
   if(time>=60){
    scoreVisible=true;
    const fallbackTarget=defaultScore??Math.max(48,Math.min(97,Math.round(69+(initialRM-36)*.46)));
    resultScore=Math.round(fallbackTarget);
    displayedGrade=grade(resultScore);
    stage.style.setProperty('--mood',grades[displayedGrade].color);
    const val=document.getElementById('dp-health-score');if(val)val.textContent=resultScore;
    document.getElementById('dp-health-label').textContent=T[displayedGrade];
    document.getElementById('dp-health-detail').textContent=T[displayedGrade+'Detail'];
    document.getElementById('dp-hrv-value').textContent=fmt(initialRM,1);
    document.getElementById('dp-hrv-status').textContent=initialRM>=55?T.good:initialRM>=35?T.steady:T.low;
    document.getElementById('dp54-clock').hidden=true;
    const caption=document.getElementById('dp57-countdown-caption');if(caption)caption.hidden=true;
    if(firstMeasurement){const h=document.getElementById('dp54-hint');if(h)h.textContent='';}
    document.getElementById('dp54-result').hidden=false;
    stage.classList.remove('dp54-measuring');stage.classList.add('dp54-result');
    state.dpHeartAcquired??={};state.dpHeartAcquired[k]={date:todayKey,score:resultScore,heart:hr,breath:rr,rmssd:initialRM,simulated:!data.real};if(typeof persist==='function')persist();
    stage.classList.add('dp54-sharp');
    if(firstMeasurement){stage.classList.remove('dp58-first-measure');stage.classList.add('dp58-first-done');}
    if(!p.dpFreshPet&&!(precomputed&&!stored&&selectedImageUrl)){generateExpression(resultScore,true);}
   }
  }
  raf=requestAnimationFrame(animate);
 }
 raf=requestAnimationFrame(animate);
 function screenshot(){
  const cw=720,ch=1280,cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const ctx=cv.getContext('2d');
  const picture=img.complete&&img.naturalWidth?img:null;
  if(picture){ctx.filter='none';const scale=Math.max(cw/picture.naturalWidth,ch/picture.naturalHeight),dw=picture.naturalWidth*scale,dh=picture.naturalHeight*scale;ctx.drawImage(picture,(cw-dw)/2,(ch-dh)/2,dw,dh);ctx.filter='none'}else{ctx.fillStyle='#193035';ctx.fillRect(0,0,cw,ch)}
  const grad=ctx.createLinearGradient(0,320,0,ch);grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(.65,'rgba(0,0,0,.43)');grad.addColorStop(1,'rgba(0,0,0,.89)');ctx.fillStyle=grad;ctx.fillRect(0,300,cw,ch-300);
  ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 42px Arial,sans-serif';ctx.fillText(p.name,cw/2,92);
  if(scoreVisible&&resultScore!==null){ctx.fillStyle=grades[grade(resultScore)].color;ctx.font='bold 92px Arial';ctx.fillText(Math.round(resultScore),cw/2,900);ctx.font='30px Arial';ctx.fillText(T[grade(resultScore)],cw/2,940);ctx.fillStyle='#fff';ctx.font='28px Arial';ctx.fillText(`HRV ${fmt(initialRM,1)} ms`,cw/2,990)}
  else{ctx.font='bold 55px Arial';ctx.fillText(document.getElementById('dp54-time')?.textContent||'01:00',cw/2,880);ctx.font='25px Arial';ctx.fillText(T.scan,cw/2,920)}
  ctx.textAlign='left';ctx.font='bold 30px Arial';ctx.fillStyle='#ffafc9';ctx.fillText(`♥ ${document.getElementById('dp-hr-live').textContent} BPM`,44,1090);
  ctx.drawImage(document.getElementById('dp-wave'),285,1047,386,62);
  ctx.fillStyle='#8ddfff';ctx.fillText(`${document.getElementById('dp-rr-live').textContent} /min`,44,1190);ctx.drawImage(document.getElementById('dp-breathwave'),285,1147,386,62);
  return cv.toDataURL('image/png');
 }
 document.getElementById('dp54-download').onclick=e=>{e.preventDefault();e.stopPropagation();try{
  const png=screenshot();const filename=`DeepPet_${p.name}_HeartMoment.png`;
  const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(ios&&typeof navigator.share==='function'&&window.File){
   const bytes=atob(png.split(',')[1]),buffer=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)buffer[i]=bytes.charCodeAt(i);
   const file=new File([buffer],filename,{type:'image/png'});
   if(!navigator.canShare||navigator.canShare({files:[file]})){navigator.share({files:[file],title:p.name}).catch(err=>{if(err.name!=='AbortError')console.warn(err)});}
   else{const link=document.createElement('a');link.download=filename;link.href=png;document.body.appendChild(link);link.click();link.remove()}
  }else{const link=document.createElement('a');link.download=filename;link.href=png;document.body.appendChild(link);link.click();link.remove()}
  const btn=document.getElementById('dp54-download');btn?.classList.add('dp54-saved');setTimeout(()=>btn?.classList.remove('dp54-saved'),1200);
 }catch(err){console.error('Screenshot failed',err);alert(T.saveFail)}};
}

 function review(n){panel.classList.remove('dp-heart-full','dp54-full');stop();++renderToken;const d=readData(n),r=d.rows,available=r.filter(x=>score(x)!==null),a=mean(r,['score','healthScore']),hr=mean(r,['heart','hr']),rr=mean(r,['breath','rr']),sl=mean(r,['sleep','rest']),rec=mean(r,['recovery']),rm=mean(r,['rmssd']),best=available.length?available.reduce((x,y)=>score(x)>=score(y)?x:y):null,worst=available.length?available.reduce((x,y)=>score(x)<=score(y)?x:y):null;const prior=readData(n*2).rows.slice(0,n);const priorAvg=mean(prior,['score','healthScore']);const delta=a!==null&&priorAvg!==null?a-priorAvg:null;
 const title=n===7?'本周':'本月',bars=r.map(x=>{const v=score(x);return `<div class="dp-bar-col"><i title="${esc(x.date)} ${fmt(v)}" style="height:${v===null?2:Math.max(4,v)}%;background:${v===null?'#d7d7e4':mood(v).color}"></i></div>`}).join('');
 body.innerHTML=`${header()}<div class="dp-review-hero"><span>${esc(pet().name)} · ${title}回顾</span><div class="dp-review-score">${fmt(a)}<small>${a===null?'':' / 100'}</small></div><div>平均健康分数 · ${available.length}/${n} 天有效评分</div><div>${esc(d.dates[0])} — ${esc(d.dates.at(-1))}</div></div><div class="dp-story-metric"><div>💗 平均心率<b>${fmt(hr)} <small>BPM</small></b></div><div>🌬 平均呼吸<b>${fmt(rr,1)} <small>次/分</small></b></div><div>🌙 平均睡眠<b>${fmt(sl,1)} <small>小时</small></b></div><div>✨ 平均恢复<b>${fmt(rec)}</b></div><div>HRV · RMSSD<b>${fmt(rm,1)} <small>ms</small></b></div><div>较前${n}天<b>${delta===null?'—':(delta>0?'+':'')+fmt(delta,1)} <small>分</small></b></div></div><h3>${n} 天健康分数趋势</h3><div class="dp-story-chart">${bars}</div><p class="dp-story-foot">${esc(d.dates[0])} — ${esc(d.dates.at(-1))} · 缺失日期不参与平均值计算</p><div class="dp-review-highlight">🏆 最佳：${best?esc(best.date)+'（'+fmt(score(best))+' 分）':'暂无有效评分'}<br>📉 较低：${worst?esc(worst.date)+'（'+fmt(score(worst))+' 分）':'暂无有效评分'}</div><div class="dp-review-story">${available.length?`这${n}天，${esc(pet().name)}的平均健康分数为 ${fmt(a)} 分。${delta===null?'暂无可比的上一周期数据。':delta>0?'相比上一周期有所提高。':delta<0?'相比上一周期有所下降。':'与上一周期基本持平。'}`:'这段时间尚无有效健康评分，等待项圈上传记录。'}</div><button id="dp-save-review">保存${title}回顾图片</button><p class="dp-story-foot">${d.real?'数据来自当前宠物已导入的记录，须由接入端验证来源和有效性。':'目前展示的是原 APP 内建演示记录，非真实项圈数据。'} 不跨宠物混用记录，不补造缺失天数。</p>`;
 document.getElementById('dp-save-review').onclick=()=>{const c=document.createElement('canvas');c.width=900;c.height=1200;const x=c.getContext('2d');x.fillStyle='#f9f7ff';x.fillRect(0,0,900,1200);const gradient=x.createLinearGradient(0,0,900,400);gradient.addColorStop(0,'#5444a9');gradient.addColorStop(1,'#a88de6');x.fillStyle=gradient;x.fillRect(0,0,900,400);x.fillStyle='white';x.font='bold 42px sans-serif';x.fillText('DeepPet · '+pet().name+' '+title+'回顾',45,85);x.font='bold 120px sans-serif';x.fillText(fmt(a),45,245);x.font='28px sans-serif';x.fillText('平均健康分数 · '+available.length+'/'+n+' 天',45,315);x.fillStyle='#514a76';x.font='bold 36px sans-serif';x.fillText('健康指标',45,475);x.font='32px sans-serif';[['平均心率',fmt(hr)+' BPM'],['平均呼吸',fmt(rr,1)+' 次/分'],['平均睡眠',fmt(sl,1)+' 小时'],['平均恢复',fmt(rec)],['平均 RMSSD',fmt(rm,1)+' ms']].forEach(([k,v],i)=>x.fillText(k+'    '+v,55,550+i*70));x.fillText('每日健康趋势',45,970);const bw=790/n;r.forEach((q,i)=>{const v=score(q);if(v!==null){x.fillStyle=mood(v).color;x.fillRect(50+i*bw,1110-v*1.1,Math.max(3,bw-3),v*1.1)}});x.font='20px sans-serif';x.fillStyle='#777';x.fillText(d.real?'已导入项圈记录':'演示数据 · 非实测',45,1170);const link=document.createElement('a');link.download='DeepPet_'+key()+'_'+(n===7?'Weekly':'Monthly')+'.png';link.href=c.toDataURL('image/png');link.click()};
}
function show(){if(tab!=='heart')panel.classList.remove('dp-heart-full','dp54-full');activePet=key();document.getElementById('dp-review-tabs').style.display=tab==='heart'?'none':'flex';document.querySelector('#dp-story-card h2').textContent=tab==='heart'?'心跳時刻':'健康回顧';document.querySelectorAll('[data-dptab]').forEach(b=>b.classList.toggle('active',b.dataset.dptab===tab));tab==='heart'?heart():review(tab==='week'?7:30)}
// V8.47: the home Heart Moments entry opens the final stage directly.
// Capture phase prevents the legacy intermediary modal from opening.
document.addEventListener('click',function(e){
 const trigger=e.target.closest?.('[data-action="heart-moment"], #dp-heart-integrated');
 if(!trigger)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 if(typeof state!=='undefined' && state.modal){state.modal=null;if(typeof renderModal==='function')renderModal();}
 tab='heart';panel.classList.add('open');show();
},true);
document.addEventListener('click',e=>{if(e.target.closest?.('#dp-heart-integrated')){tab='heart';panel.classList.add('open');show()}else if(e.target.closest?.('#dp-week-review')){tab='week';panel.classList.add('open');show()}else if(e.target.closest?.('#dp-month-review')){tab='month';panel.classList.add('open');show()}});
function closeHeartScreen(){stop();++renderToken;panel.classList.remove('open','dp-heart-full','dp54-full');if(typeof render==='function')render(false);}
const exit=document.getElementById('dp-story-close');exit.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeHeartScreen()});panel.addEventListener('click',e=>{if(e.target===panel)closeHeartScreen()});
document.querySelectorAll('[data-dptab]').forEach(b=>b.onclick=()=>{tab=b.dataset.dptab;show()});
// When the original app switches pets, refresh the open Heart Moments screen.
const watch=new MutationObserver(()=>{if(panel.classList.contains('open')&&activePet!==key())show()});watch.observe(document.body,{childList:true,subtree:false});
window.DeepPetHeartMoments={close:closeHeartScreen,open:()=>{tab='heart';panel.classList.add('open');show()},refresh:()=>{if(panel.classList.contains('open'))show()},ingestVerifiedDailyRecords:(petIndex,records)=>{if(!Array.isArray(records))throw Error('records must be an array');state.dpVerifiedDailyRecords??={};state.dpVerifiedDailyRecords[String(petIndex)]=records.filter(r=>r&&r.date&&String(r.petId)===String(petIndex));if(typeof persist==='function')persist();if(panel.classList.contains('open'))show()}};
})();
