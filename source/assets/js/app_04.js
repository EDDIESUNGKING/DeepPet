
(function(){
'use strict';
const panel=document.getElementById('dp-story-panel'),body=document.getElementById('dp-story-body');
let tab='heart',started=0,raf=0,activePet='',image=null,elapsed=0,renderToken=0,activeVideo=null;
let photoChoiceSerial=0,portraitWriteQueue=Promise.resolve();
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pet=()=>typeof currentDog==='function'?currentDog():{name:'Pet'};
const key=()=>String(state.dog);
const valid=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const number=(r,ks)=>{for(const k of ks){if(valid(r?.[k]))return Number(r[k])}return null};
const fmt=(v,d=0)=>v===null?'—':v.toFixed(d);
const mean=(r,k)=>{const a=r.map(x=>number(x,k)).filter(v=>v!==null);return a.length?a.reduce((s,v)=>s+v,0)/a.length:null};
const validScore=v=>valid(v)&&Number(v)>=0&&Number(v)<=100;
const currentIdentity=()=>state.emptyPreview?'blank':key();
// Heart Moments can display owner data only after the SAME 20 Hz day has passed
// the canonical scoring engine. A caller-supplied score is never verification.
function verifiedOwnerRows(index){
 if(state.emptyPreview||!Number.isInteger(index)||index<dogs.length||index>=allPets().length)return [];
 const engine=window.DeepPetSignalScoring;
 let features,scores;
 try{features=engine?.getFeatures?.(index);scores=engine?.getDaily?.(index);}catch(e){return []}
 if(!Array.isArray(features)||!Array.isArray(scores))return [];
 // A verified collar day can have usable heart/breath/HRV measurements before
 // enough historical baseline exists to calculate the overall wellness score.
 // Presence of a composite score must not determine whether the day exists.
 const byDate=new Map(scores.filter(s=>s?.date&&s.source==='20hz-waveform').map(s=>[s.date,s]));
 const rows=new Map();
 for(const f of features){
  const q=f?.quality,date=f?.date;
  const parsed=/^\d{4}-\d{2}-\d{2}$/.test(date||'')?new Date(date+'T12:00:00Z'):null;
  const seconds=q?.observedSeconds,scheduled=q?.scheduledSeconds;
  const denominator=q?.samplingMode==='scheduled'?scheduled:86400;
  if(f?.source!=='20hz-waveform'||!parsed||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date||
   q?.heartValid!==true||q?.respValid!==true||q?.wearValid!==true||q?.signalValid!==true||q?.timeContinuityValid!==true||
   !Number.isFinite(seconds)||seconds<900||seconds>86400||
   (q.samplingMode==='scheduled'&&(!Number.isFinite(scheduled)||scheduled<1800||scheduled>86400))||
   !Number.isFinite(q?.timeCoverage)||q.timeCoverage<.5||
   !Number.isFinite(q?.observedDayFraction)||Math.abs(q.observedDayFraction-seconds/86400)>1e-5||
   Math.abs(q.timeCoverage-Math.min(1,seconds/denominator))>1e-5)continue;
  const assessed=byDate.get(date);if(!assessed)continue;
  const nonnegative=v=>Number.isFinite(v)&&v>=0?v:null;
  const unitScore=v=>validScore(v)?Number(v):null;
  rows.set(date,{date,petId:String(index),score:unitScore(assessed.scores?.physiol),rhythm:unitScore(assessed.scores?.rhythm),
   heart:nonnegative(f.heartRate),breath:nonnegative(f.breathRate),rmssd:nonnegative(f.rmssd),
   sleep:nonnegative(f.restHours),recovery:unitScore(assessed.scores?.activityRecovery)});
 }
 return [...rows.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
function db(){return new Promise((resolve,reject)=>{
 let settled=false;
 const timer=setTimeout(()=>{if(!settled){settled=true;reject(Error('Photo storage unavailable'));}},8000);
 const finish=(error,value)=>{if(settled){value?.close?.();return;}settled=true;clearTimeout(timer);error?reject(error):resolve(value)};
 try{
  const req=indexedDB.open('deeppet-heart-portraits',1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('photos'))req.result.createObjectStore('photos')};
  req.onsuccess=()=>finish(null,req.result);
  req.onerror=()=>finish(req.error||Error('Photo storage unavailable'));
  req.onblocked=()=>finish(Error('Photo storage blocked'));
 }catch(error){finish(error)}
})}
async function photoGet(k){try{const d=await db();return await new Promise(resolve=>{
 let settled=false;
 const finish=value=>{if(settled)return;settled=true;clearTimeout(timer);try{d.close()}catch(_e){}resolve(value||null)};
 const timer=setTimeout(()=>finish(null),5000);
 try{
  const q=d.transaction('photos','readonly').objectStore('photos').get(k);
  q.onsuccess=()=>finish(q.result);
  q.onerror=()=>finish(null);
 }catch(_error){finish(null)}
})}catch(e){return null}}
async function photoSet(k,v){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('photos','readwrite');t.objectStore('photos').put(v,k);t.oncomplete=()=>{d.close();resolve()};t.onerror=()=>{d.close();reject(t.error)}})}
 async function photoDelete(k){try{const d=await db();return await new Promise(resolve=>{const t=d.transaction('photos','readwrite');t.objectStore('photos').delete(k);t.oncomplete=()=>{d.close();resolve()};t.onerror=()=>{d.close();resolve()}})}catch(e){}}
function readData(n){
 const k=key(),realRows=verifiedOwnerRows(Number(k));
 // No saved stand-alone aggregate may bypass the official SDK quality gate.
 const isReal=realRows.length>0;
 const isGallery=!state.emptyPreview&&Number(state.dog)<dogs.length&&!pet().dpFixtureInvalidated;
 const all=isReal?realRows:(isGallery&&typeof demoRecords==='function'?demoRecords(state.dog):[]);
 // Gallery's legacy `score` is independent of the canonical daily engine.
 // Only Home/Deep's date-matched reconciled score may enter Heart Moments.
 const canonical=new Map();
 if(isGallery){
  try{for(const day of window.DeepPetSignalScoring?.getDaily?.(Number(k))||[])
   if(day?.date)canonical.set(day.date,day.scores||{});
  }catch(err){console.warn('Heart Moment score source unavailable',err);}
 }
 const unique=new Map();
 for(const r of all){
  if(!r||!/^\d{4}-\d{2}-\d{2}$/.test(r.date||''))continue;
  if(r.petId!==undefined&&String(r.petId)!==k)continue;
  if(!isGallery){unique.set(r.date,r);continue;}
  const s=canonical.get(r.date);
  unique.set(r.date,validScore(s?.physiol)?{...r,score:Number(s.physiol),rhythm:validScore(s.rhythm)?Number(s.rhythm):null}:{date:r.date,score:null,rhythm:null});
 }
 const today=typeof localDate==='function'?localDate():new Date();
 const dates=[];for(let i=n-1;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);dates.push([d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'))}
 return {rows:dates.map(date=>unique.get(date)||{date}),real:isReal,dates};
}
function score(r){return number(r,['score','healthScore'])}
function mood(v){return v===null?{label:'等待有效数据',color:'#77839a',kind:'neutral'}:v>=90?{label:'開心活力',color:'#23965b',kind:'happy'}:v>=80?{label:'平穩自然',color:'#387de5',kind:'calm'}:v>=60?{label:'有點不開心',color:'#d88a2e',kind:'soft'}:{label:'明顯不開心',color:'#d05d68',kind:'sad'}}
function sourcePhoto(){return pet().photo||pet().avatar||''}
function stop(){cancelAnimationFrame(raf);raf=0;started=0;if(activeVideo){const v=activeVideo;activeVideo=null;v.pause();v.removeAttribute('src');v.remove();}}
function load(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
function stageDraw(){const c=document.getElementById('dp-petcanvas');if(!c)return;const x=c.getContext('2d'),w=c.width,h=c.height;x.fillStyle='#25293c';x.fillRect(0,0,w,h);if(!image){x.fillStyle='#fff';x.textAlign='center';x.font='24px sans-serif';x.fillText(state.lang==='ja'?'最初にペットの写真を選択':state.lang==='en'?'Upload a pet photo to begin':state.lang==='zht'?'請先上傳寵物照片':'请先上传宠物照片',w/2,h/2);return}const scale=Math.max(w/image.width,h/image.height),dw=image.width*scale,dh=image.height*scale;x.drawImage(image,(w-dw)/2,(h-dh)/2,dw,dh)}
function wave(id,breath=false){const c=document.getElementById(id);if(!c)return;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.beginPath();for(let i=0;i<c.width;i++){const p=i/(breath?105:75),z=breath?Math.sin(p*2*Math.PI)*.35:(()=>{const q=p%1;return q>.42&&q<.50?Math.sin((q-.42)/.08*Math.PI)*.85:q>.50&&q<.57?-.25*Math.sin((q-.50)/.07*Math.PI):Math.sin(q*Math.PI*2)*.05})();const y=c.height*.52-z*c.height*.43;i?x.lineTo(i,y):x.moveTo(i,y)}x.strokeStyle=breath?'#72c7ff':'#ff8fae';x.lineWidth=3;x.stroke()}
function header(){return `<div class="dp-story-source">${esc(pet().name)} · ${state.lang==='ja'?'現在のペット':state.lang==='en'?'Current pet':state.lang==='zht'?'目前寵物':'当前宠物'}</div>`}
async function heart(){
 stop();
 const token=++renderToken,k=key(),p=pet(),locale=({zh:'zh',zht:'zht',en:'en',ja:'en',ko:'ko'})[state.lang]||'en';
 const T={
 zh:{save:'保存图片',close:'关闭',scan:'正在感受心跳',collect:'正在读取心跳与呼吸',processing:'正在分析心率变异',ready:'本次测量完成',remaining:'秒',of:'共 60 秒',detail:'持续积累有效数据，可让趋势判断更加稳定',from30:'HRV 初步估计',initial:'首次测量约需 60 秒',generating:'正在生成专属表情',aiWait:'正在准备匹配分数的照片，请稍候',aiOff:'分数已获得，专属表情照片尚未生成',takePhoto:'上传宠物正面照片',approve:'需要将宠物照片发送至 AI 图片服务，生成与健康分数对应的静态表情。是否同意？',saveFail:'保存失败，请重试',hr:'心率',rr:'呼吸',hrv:'HRV',noData:'等待有效数据',happy:'开心活力',calm:'平稳自然',soft:'需要关注',sad:'明显低落',happyDetail:'活力充沛 · 状态优秀',calmDetail:'状态平稳 · 继续保持',softDetail:'略显疲倦 · 适度休息',sadDetail:'活力偏低 · 建议关注',good:'良好',steady:'一般',low:'偏低',seconds:'秒',simulation:'模拟体验',pending:'表情图片准备中',noImage:'尚未选择宠物照片',tapUpload:'点击上传照片'},
 zht:{save:'儲存圖片',close:'關閉',scan:'正在感受心跳',collect:'正在讀取心跳與呼吸',processing:'正在分析心率變異',ready:'本次測量完成',remaining:'秒',of:'共 60 秒',detail:'持續累積有效數據，可讓趨勢判斷更加穩定',from30:'HRV 初步估計',initial:'首次測量約需 60 秒',generating:'正在生成專屬表情',aiWait:'正在準備符合分數的照片，請稍候',aiOff:'分數已取得，專屬表情照片尚未生成',takePhoto:'上傳寵物正面照片',approve:'需要將寵物照片傳送至 AI 圖片服務，產生與健康分數對應的靜態表情。是否同意？',saveFail:'儲存失敗，請再試一次',hr:'心率',rr:'呼吸',hrv:'HRV',noData:'等待有效數據',happy:'開心活力',calm:'平穩自然',soft:'需要關注',sad:'明顯低落',happyDetail:'活力充沛 · 狀態優秀',calmDetail:'狀態平穩 · 繼續保持',softDetail:'略顯疲倦 · 適度休息',sadDetail:'活力偏低 · 建議關注',good:'良好',steady:'一般',low:'偏低',seconds:'秒',simulation:'模擬體驗',pending:'表情照片準備中',noImage:'尚未選擇寵物照片',tapUpload:'點擊上傳照片'},
 en:{save:'Save image',close:'Close',scan:'Listening to their heartbeat',collect:'Reading heart and breathing rhythms',processing:'Analyzing heart rate variability',ready:'Measurement complete',remaining:'sec',of:'of 60 seconds',detail:'More valid readings over time can improve trend estimates',from30:'Preliminary HRV',initial:'First measurement takes about 60 seconds',generating:'Creating this pet’s expression',aiWait:'Preparing the photo matching the score',aiOff:'Score ready. Expression photo not yet generated',takePhoto:'Upload a front-facing pet photo',approve:'To create a score-matched expression, we need to send this pet photo to an AI image service. Do you agree?',saveFail:'Could not save the image. Try again',hr:'Heart rate',rr:'Breathing',hrv:'HRV',noData:'Waiting for valid readings',happy:'Happy & energetic',calm:'Calm & comfortable',soft:'Needs attention',sad:'Low energy',happyDetail:'Bright and energetic',calmDetail:'Steady and relaxed',softDetail:'A little tired · allow rest',sadDetail:'Low energy · worth checking',good:'Good',steady:'Moderate',low:'Low',seconds:'sec',simulation:'Demo readings',pending:'Expression pending',noImage:'No pet photo selected',tapUpload:'Tap to upload a pet photo'},
 ko:{save:'이미지 저장',close:'닫기',scan:'심장 박동을 확인하고 있어요',collect:'심박과 호흡 리듬을 측정하고 있어요',processing:'심박변이도를 분석하고 있어요',ready:'측정 완료',remaining:'초',of:'총 60초',detail:'더 많은 유효 데이터가 쌓이면 추세 분석이 안정될 수 있어요',from30:'HRV 예비 추정',initial:'첫 측정은 약 60초 걸려요',generating:'맞춤 표정 생성 중',aiWait:'점수에 맞는 사진을 준비하고 있어요',aiOff:'점수는 완료됐지만 표정 사진은 아직 생성되지 않았어요',takePhoto:'반려동물 정면 사진 업로드',approve:'건강 점수에 맞는 정지 이미지를 만들기 위해 반려동물 사진을 AI 이미지 서비스로 전송해야 합니다. 동의하시나요?',saveFail:'이미지 저장에 실패했습니다. 다시 시도하세요',hr:'심박수',rr:'호흡',hrv:'HRV',noData:'유효한 데이터 대기 중',happy:'활기차고 행복함',calm:'안정적이고 편안함',soft:'주의 필요',sad:'활력 저하',happyDetail:'활기차고 좋은 상태',calmDetail:'안정적이고 편안한 상태',softDetail:'조금 피곤함 · 휴식 권장',sadDetail:'활력이 낮음 · 확인 권장',good:'양호',steady:'보통',low:'낮음',seconds:'초',simulation:'시뮬레이션',pending:'표정 사진 준비 중',noImage:'반려동물 사진이 없습니다',tapUpload:'눌러서 사진 업로드'}
 }[locale];
 if(state.lang==='ja')Object.assign(T,{
  save:'画像を保存',close:'閉じる',scan:'心拍を感じています',collect:'心拍と呼吸を確認中',
  processing:'HRVを分析しています',ready:'測定完了',remaining:'秒',of:'合計60秒',
  detail:'有効な記録が増えると傾向をより安定して評価できます',from30:'HRVの予備推定',
  initial:'初回の測定には約60秒かかります',generating:'表情画像を準備しています',
  aiWait:'スコアに合う写真を準備しています',aiOff:'スコアは取得しましたが表情写真はまだ生成されていません',
  takePhoto:'ペットの正面写真をアップロード',approve:'AI画像サービスに写真を送信して表情画像を作成します。同意しますか？',
  saveFail:'保存できませんでした。もう一度お試しください',hr:'心拍数',rr:'呼吸',hrv:'HRV',
  noData:'有効なデータを待っています',happy:'元気で幸せ',calm:'落ち着いています',soft:'要確認',sad:'元気が低下',
  happyDetail:'活発で良い状態',calmDetail:'落ち着いた状態',softDetail:'やや疲れ気味・休息を',sadDetail:'元気が低下・確認を',
  good:'良好',steady:'普通',low:'低め',seconds:'秒',simulation:'模擬データ',
  pending:'表情画像を準備中',noImage:'ペットの写真がありません',tapUpload:'タップして写真を選択'});
 const grades={happy:{color:'#67e7a9'},calm:{color:'#6ac0ff'},soft:{color:'#ffbc68'},sad:{color:'#ff8592'}};
 const grade=v=>v>=90?'happy':v>=80?'calm':v>=60?'soft':'sad';
 const data=readData(30),today=data.rows[data.rows.length-1],history=data.rows.filter(r=>score(r)!==null);
 const observed=data.rows.filter(r=>number(r,['heart','hr','breath','rr','rmssd'])!==null);
 const isDemo=!state.emptyPreview&&Number(state.dog)<dogs.length&&!p.dpFixtureInvalidated;
 const todayKey=data.dates.at(-1);
 const acquired=state.dpHeartAcquired?.[k];
 const latestValidDay=(data.real?observed:history).at(-1)?.date||null;
 const lastRealDate=data.real&&latestValidDay!==todayKey?latestValidDay:null;
 // A newly created pet never receives invented heart/breath/HRV readings.
 // The countdown remains available only for genuine device-backed sessions;
 // this offline WebApp does not claim that a 60-second animation is a scan.
 const firstMeasurement=false;
 const existing=isDemo||(data.real&&history.length>0);
 const recordedScore=score(today)??(history.length?score(history[history.length-1]):null);
 // A 60-second introductory simulation must never outrank a verified collar day.
 const defaultScore=data.real?recordedScore:isDemo?recordedScore:null;
 const initialHR=number(today,['heart','hr'])??number(observed.at(-1),['heart','hr']);
 const initialRR=number(today,['breath','rr'])??number(observed.at(-1),['breath','rr']);
 const initialRM=number(today,['rmssd'])??number(observed.at(-1),['rmssd']);
 const partialReadings=data.real&&defaultScore===null&&(initialHR!==null||initialRR!==null||initialRM!==null);
 const hasDisplayData=defaultScore!==null||partialReadings||firstMeasurement;
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
  <img id="dp54-photo" class="dp54-photo" alt="${esc(p.name)}" draggable="false"/>
  <div class="dp54-vignette"></div><div class="dp54-stars" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <header class="dp54-top"><button type="button" id="dp54-download" aria-label="${T.save}" title="${T.save}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></svg></button><strong class="dp54-name">${esc(p.name)}</strong><button type="button" id="dp54-exit" aria-label="${T.close}" title="${T.close}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></header>
  <div class="dp54-lower"><div id="dp54-center" class="dp54-center">
   <div id="dp54-clock" class="dp54-clock dp57-countdown" ${scoreVisible?'hidden':''}><svg class="dp54-clock-svg" viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="dp54-clock-grad" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffcead"/><stop offset=".48" stop-color="#ff98cd"/><stop offset="1" stop-color="#f7b0fa"/></linearGradient></defs><circle cx="100" cy="100" r="87" class="dp54-track"/><circle id="dp54-arc" cx="100" cy="100" r="87" class="dp54-arc"/></svg><span class="dp54-glow-dot"></span><span class="dp57-orbit" aria-hidden="true"></span><div class="dp54-clocktext"><span class="dp54-clock-label">${C.title}</span><span class="dp57-clock-subtitle">${C.subtitle}</span><strong id="dp54-time">01:00</strong><small class="dp57-total-time">${C.ofTime}</small><svg class="dp57-clock-heart" viewBox="0 0 36 30" fill="none" aria-hidden="true"><path d="M18 27 5 15C-1 9 4 2 11 3c3 0 5 2 7 5 2-3 4-5 7-5 7-1 12 6 6 12L18 27Z" stroke="#ffc7d6" stroke-width="1.7"/><path d="M5 15h7l3-5 5 10 3-5h8" stroke="#ffc7d6" stroke-width="1.8" stroke-linejoin="round"/></svg></div></div>
   <div id="dp54-result" class="dp54-resultline" ${scoreVisible?'':'hidden'}><div class="dp54-scorecircle"><strong id="dp-health-score">${scoreVisible?Math.round(resultScore):'—'}</strong><small>/100</small></div><div class="dp54-score-desc"><strong id="dp-health-label">${scoreVisible?T[displayedGrade]:''}</strong><small id="dp-health-detail">${scoreVisible?T[displayedGrade+'Detail']:''}</small></div><div class="dp54-hrvcircle"><span>HRV</span><strong id="dp-hrv-value">${scoreVisible?fmt(initialRM,1):'—'}</strong><small id="dp-hrv-status">${scoreVisible?(initialRM>=55?T.good:initialRM>=35?T.steady:T.low):'—'}</small></div></div>
  <div id="dp57-countdown-caption" class="dp57-countdown-caption" ${scoreVisible?'hidden':''}><strong>${C.caption}</strong><span>${C.foot}</span></div>${lastRealDate?`<p class="dp54-hint">${locale==='en'?'Latest verified collar day':locale==='ko'?'최근 유효 목걸이 기록':locale==='zht'?'最近有效項圈紀錄':'最近有效项圈记录'}：${esc(lastRealDate)}</p>`:''}<p id="dp54-hint" class="dp54-hint">${scoreVisible?'':('')}</p>
  </div>
  <div class="dp54-waves"><div class="dp54-wave-row"><span class="dp54-wavehead"><svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 25S2 17 2 9A6.5 6.5 0 0 1 14 5a6.5 6.5 0 0 1 12 4c0 8-12 16-12 16z"/></svg><strong id="dp-hr-live">${initialHR===null?'—':Math.round(initialHR)}</strong><small>BPM</small></span><canvas id="dp-wave" width="470" height="65" aria-label="${T.hr}"></canvas><span class="dp54-wave-note" ${isDemo?'hidden':''}>${locale==='en'?'Daily summary only · no live waveform':locale==='ko'?'일일 요약만 있음 · 실시간 파형 없음':locale==='zht'?'僅有每日摘要 · 暫無即時波形':locale==='ja'?'日次概要のみ・リアルタイム波形なし':'仅有每日摘要 · 暂无实时波形'}</span></div>
  <div class="dp54-wave-row"><span class="dp54-wavehead dp54-breath"><svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 4v9c-3-5-5-6-7-6C2 7 1 11 1 16c0 5 2 8 6 8 3 0 5-2 6-6m2-14v9c3-5 5-6 7-6 4 0 5 4 5 9 0 5-2 8-6 8-3 0-5-2-6-6"/></svg><strong id="dp-rr-live">${initialRR===null?'—':Math.round(initialRR)}</strong><small>${locale==='en'?' /min':locale==='ko'?'회/분':locale==='zh'?'次/分':'次/分'}</small></span><canvas id="dp-breathwave" width="470" height="65" aria-label="${T.rr}"></canvas><span class="dp54-wave-note" ${isDemo?'hidden':''}>${locale==='en'?'Daily summary only · no live waveform':locale==='ko'?'일일 요약만 있음 · 실시간 파형 없음':locale==='zht'?'僅有每日摘要 · 暫無即時波形':locale==='ja'?'日次概要のみ・リアルタイム波形なし':'仅有每日摘要 · 暂无实时波形'}</span></div></div>
  <input id="dp-story-upload" class="dp54-upload-input" type="file" accept="image/*" aria-label="${T.takePhoto}"/>
  <button type="button" id="dp54-upload-guide" class="dp54-upload-guide" hidden>${T.tapUpload}</button>
  </div></section>`;
 body.innerHTML=markup;
 const stage=document.getElementById('dp54-stage'),img=document.getElementById('dp54-photo');
 // The currently selected pet's ordinary portrait is always shown first.
 // Slow/blocked local photo storage may upgrade this image, but can never
 // leave the screen blank while the optional expression photo is fetched.
 const safePortrait=p.photo||p.avatar||'';
 const photoGuide=()=>document.getElementById('dp54-upload-guide');
 if(safePortrait){img.src=safePortrait;img.style.opacity='1';img.decoding='async';}
 img.addEventListener('error',()=>{
  if(token!==renderToken||key()!==k)return;
  if(safePortrait&&img.getAttribute('src')!==safePortrait){img.src=safePortrait;return;}
  img.removeAttribute('src');stage.classList.add('dp54-no-photo');
  const guide=photoGuide();if(guide){guide.hidden=false;guide.onclick=()=>document.getElementById('dp-story-upload')?.click();}
 });
 // Neither an unworn gallery day nor an unpaired owner pet may enter the
 // 60-second simulation or display made-up live heart/breath values.
 if(!scoreVisible&&!firstMeasurement){
  const clock=document.getElementById('dp54-clock'),caption=document.getElementById('dp57-countdown-caption');
  if(clock)clock.hidden=true;if(caption)caption.hidden=true;
  const hint=document.getElementById('dp54-hint');if(hint)hint.textContent=partialReadings?
   (locale==='en'?'Readings available · overall score is still building':locale==='ko'?'측정 기록이 있으며 종합 점수는 산출 중입니다':locale==='zht'?'已有有效量測，綜合評分尚在累積':'已有有效测量，综合评分尚在积累'):T.noData;
  if(!partialReadings)for(const id of ['dp-hr-live','dp-rr-live']){const label=document.getElementById(id);if(label)label.textContent='—';}
  stage.classList.remove('dp54-measuring');stage.classList.add('dp54-unready');
 }
 if(scoreVisible&&initialRM===null){const hrv=document.getElementById('dp-hrv-status');if(hrv)hrv.textContent='—';}
 if(firstMeasurement){stage.classList.add('dp57-preview','dp58-first-measure');stage.dataset.preview='new-pet-first-reading';}
 const setSrc=async(url,{reveal=false}={})=>{
  if(!url)return false;
  const test=new Image();
  const ok=await new Promise(resolve=>{
   let settled=false;const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);test.onload=null;test.onerror=null;resolve(ok)};
   const timer=setTimeout(()=>finish(false),5000);
   test.onload=()=>finish(true);test.onerror=()=>finish(false);test.src=url;
  });
  if(ok&&token===renderToken&&key()===k){img.src=url;img.style.opacity='1';if(reveal)stage.classList.add('dp54-sharp');return true}
  return false;
 };
 const pickFile=()=>document.getElementById('dp-story-upload')?.click();
 const demoImage=(g)=>{
  const demo={0:['Milo',95],1:['Luna',84],2:['Coco',38],3:['Leo',22],4:['Poppy',80],5:['Nori',98],6:['Miso',77],7:['Mochi',35],8:['Kiki',17],9:['Max',87],10:['Rex',38],11:['Bella',97],12:['Dodo',61],13:['Snowy',84],14:['Nana',53]};
  const petCase=demo[Number(k)];
  if(!petCase)return null;
  // One prebuilt portrait exists per pet. A mismatched facial expression is
  // more misleading than the neutral uploaded portrait fallback.
  if(grade(petCase[1])!==g)return null;
  // Use the fixture's verified portrait path, not a filename reconstructed
  // from the score. This keeps image replacements consistent across Home,
  // the profile picker, and Heart Moments.
  return dogs[Number(k)]?.photo||null;
 };
 const stored=isDemo?null:await photoGet(k);if(token!==renderToken||key()!==k)return;
 const basePhoto=stored||safePortrait;
 let selectedImageUrl=null;
 if(scoreVisible&&displayedGrade){
  if(precomputed&&!stored){selectedImageUrl=demoImage(grade(defaultScore));}
  else selectedImageUrl=await photoGet(`expression:${k}:${displayedGrade}`);
 }
 if(selectedImageUrl){const ok=await setSrc(selectedImageUrl,{reveal:true});if(ok){finalImage=img;}else selectedImageUrl=null;}
 if(!selectedImageUrl){const fallback=basePhoto; if(fallback) await setSrc(fallback,{reveal:scoreVisible});if(scoreVisible&&!p.dpFreshPet){stage.classList.add('dp54-unready');document.getElementById('dp54-hint').textContent='';}}
 if(token!==renderToken)return;
 initialImage=img;
 if(!img.src){stage.classList.add('dp54-no-photo');document.getElementById('dp54-upload-guide').hidden=false;document.getElementById('dp54-upload-guide').onclick=pickFile;}
 const photoInput=document.getElementById('dp-story-upload');
 photoInput.onchange=e=>{
  const f=e.target.files?.[0],request=++photoChoiceSerial;
  const owns=()=>request===photoChoiceSerial&&token===renderToken&&key()===k&&!state.emptyPreview&&panel.classList.contains('open')&&tab==='heart';
  if(!f)return;
  if(!f.type.startsWith('image/')||f.size>12*1024*1024){if(owns())alert(T.saveFail);return;}
  const reader=new FileReader();
  reader.onload=()=>{
   if(!owns())return;
   const data=reader.result;
   // Sequential commits guarantee that a newer choice wins even if an older
   // IndexedDB transaction was already pending when the second file arrived.
   portraitWriteQueue=portraitWriteQueue.catch(()=>{}).then(async()=>{
    if(!owns())return;
    const decoded=await load(data);
    if(!owns())return;
    if(!decoded.naturalWidth||!decoded.naturalHeight)throw Error('invalid image');
    await photoSet(k,data);
    if(!owns())return;
    await Promise.all(['happy','calm','soft','sad'].map(g=>photoDelete(`expression:${k}:${g}`)));
    if(owns())heart();
   }).catch(err=>{if(owns()){console.error(err);alert(T.saveFail)}});
  };
  reader.onerror=()=>{if(owns())alert(T.saveFail)};
  reader.readAsDataURL(f);
 };
 document.getElementById('dp54-exit').onclick=e=>{e.preventDefault();e.stopPropagation();closeHeartScreen()};
 const setHint=(txt)=>{const el=document.getElementById('dp54-hint');if(el)el.textContent=txt};
 async function generateExpression(scoreValue,allowPrompt=true){
  if(!basePhoto||token!==renderToken)return false;
  const sourcePhotoSerial=photoChoiceSerial;
  const g=grade(scoreValue);
  const cached=await photoGet(`expression:${k}:${g}`);
  if(cached){const success=await setSrc(cached,{reveal:true});if(success){finalImage=img;stage.classList.remove('dp54-unready');setHint('');return true}}
  if(precomputed&&!stored){const success=await setSrc(demoImage(g),{reveal:true});if(success){finalImage=img;stage.classList.remove('dp54-unready');setHint('');return true}}
  // The key remains on the server; never send an uploaded pet's face without consent.
  if(allowPrompt&&!state.dpImageCloudConsent){
   if(!window.confirm(T.approve)){stage.classList.add('dp54-unready');setHint('');return false;}
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
   // A late cloud response must not populate the cache for an older portrait.
   if(token!==renderToken||key()!==k||sourcePhotoSerial!==photoChoiceSerial||!panel.classList.contains('open')||tab!=='heart')return false;
   await photoSet(`expression:${k}:${g}`,json.image);
   if(token===renderToken&&key()===k){const ok=await setSrc(json.image,{reveal:true});if(ok){finalImage=img;stage.classList.remove('dp54-unready');setHint('')}}
   awaitingGeneration=false;return true;
  }catch(err){if(token===renderToken&&key()===k&&panel.classList.contains('open')){console.warn('Expression image service unavailable:',err.message);setHint('');stage.classList.add('dp54-unready')}awaitingGeneration=false;return false;}
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
  // A missing or still-loading portrait cannot freeze a valid 60-second
  // reading. The no-data path above never starts this animation.
  const time=(now-liveStart)/1000;
  const hr=initialHR===null?null:Math.max(40,Math.round(initialHR+2*Math.sin(time*.53)+Math.sin(time*1.27)));
  const rr=initialRR===null?null:Math.max(8,Math.round(initialRR+1.2*Math.sin(time*.42)+.6*Math.sin(time*.89)));
  const sec=Math.floor(time);
  if(sec!==lastSecond){lastSecond=sec;const h=document.getElementById('dp-hr-live'),r=document.getElementById('dp-rr-live');if(h)h.textContent=hr??'—';if(r)r.textContent=rr??'—';}
  if(hr!==null)drawWave('dp-wave',hr,false,time);
  if(rr!==null)drawWave('dp-breathwave',rr,true,time);
  if(firstMeasurement&&!scoreVisible){
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
    // V10.33: one gentle result-only halo when the actual 60-second flow
    // finishes; this does not alter the score, photo, or countdown timing.
    stage.classList.add('dp1033-heart-complete');
    state.dpHeartAcquired??={};state.dpHeartAcquired[k]={date:todayKey,score:resultScore,heart:hr,breath:rr,rmssd:initialRM,simulated:!data.real};if(typeof persist==='function')persist();
    stage.classList.add('dp54-sharp');
    if(firstMeasurement){stage.classList.remove('dp58-first-measure');stage.classList.add('dp58-first-done');}
    if(!p.dpFreshPet&&!(precomputed&&!stored&&selectedImageUrl)){generateExpression(resultScore,true);}
   }
  }
  raf=requestAnimationFrame(animate);
 }
 // Historical 20 Hz summaries contain daily averages but NOT raw waveform
 // samples. Only the 15 explicit gallery cases may animate illustrative
 // traces. An owner must never see invented heartbeat jitter or sine waves.
 if(isDemo&&scoreVisible&&(initialHR!==null||initialRR!==null))raf=requestAnimationFrame(animate);
 function screenshot(){
  const cw=720,ch=1280,cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const ctx=cv.getContext('2d');
  const picture=img.complete&&img.naturalWidth?img:null;
  if(picture){ctx.filter='none';const scale=Math.max(cw/picture.naturalWidth,ch/picture.naturalHeight),dw=picture.naturalWidth*scale,dh=picture.naturalHeight*scale;ctx.drawImage(picture,(cw-dw)/2,(ch-dh)/2,dw,dh);ctx.filter='none'}else{ctx.fillStyle='#193035';ctx.fillRect(0,0,cw,ch)}
  const grad=ctx.createLinearGradient(0,320,0,ch);grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(.65,'rgba(0,0,0,.43)');grad.addColorStop(1,'rgba(0,0,0,.89)');ctx.fillStyle=grad;ctx.fillRect(0,300,cw,ch-300);
  ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 42px Arial,sans-serif';ctx.fillText(p.name,cw/2,92);
  if(scoreVisible&&resultScore!==null){ctx.fillStyle=grades[grade(resultScore)].color;ctx.font='bold 92px Arial';ctx.fillText(Math.round(resultScore),cw/2,900);ctx.font='30px Arial';ctx.fillText(T[grade(resultScore)],cw/2,940);ctx.fillStyle='#fff';ctx.font='28px Arial';ctx.fillText(`HRV ${fmt(initialRM,1)} ms`,cw/2,990)}
  else{ctx.font='bold 36px Arial';ctx.fillText(partialReadings?(locale==='en'?'Score building':'綜合評分累積中'):
   hasDisplayData?(document.getElementById('dp54-time')?.textContent||'01:00'):T.noData,cw/2,880);
   ctx.font='25px Arial';if(hasDisplayData&&!partialReadings)ctx.fillText(T.scan,cw/2,920)}
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
 const reviewOwner=currentIdentity(),reviewName=pet().name;
 document.getElementById('dp-save-review').onclick=()=>{if(currentIdentity()!==reviewOwner||!panel.classList.contains('open')||tab!==(n===7?'week':'month'))return;const c=document.createElement('canvas');c.width=900;c.height=1200;const x=c.getContext('2d');x.fillStyle='#f9f7ff';x.fillRect(0,0,900,1200);const gradient=x.createLinearGradient(0,0,900,400);gradient.addColorStop(0,'#5444a9');gradient.addColorStop(1,'#a88de6');x.fillStyle=gradient;x.fillRect(0,0,900,400);x.fillStyle='white';x.font='bold 42px sans-serif';x.fillText('DeepPet · '+reviewName+' '+title+'回顾',45,85);x.font='bold 120px sans-serif';x.fillText(fmt(a),45,245);x.font='28px sans-serif';x.fillText('平均健康分数 · '+available.length+'/'+n+' 天',45,315);x.fillStyle='#514a76';x.font='bold 36px sans-serif';x.fillText('健康指标',45,475);x.font='32px sans-serif';[['平均心率',fmt(hr)+' BPM'],['平均呼吸',fmt(rr,1)+' 次/分'],['平均睡眠',fmt(sl,1)+' 小时'],['平均恢复',fmt(rec)],['平均 RMSSD',fmt(rm,1)+' ms']].forEach(([k,v],i)=>x.fillText(k+'    '+v,55,550+i*70));x.fillText('每日健康趋势',45,970);const bw=790/n;r.forEach((q,i)=>{const v=score(q);if(v!==null){x.fillStyle=mood(v).color;x.fillRect(50+i*bw,1110-v*1.1,Math.max(3,bw-3),v*1.1)}});x.font='20px sans-serif';x.fillStyle='#777';x.fillText(d.real?'已导入项圈记录':'尚未连接项圈',45,1170);const link=document.createElement('a');link.download='DeepPet_'+reviewOwner+'_'+(n===7?'Weekly':'Monthly')+'.png';link.href=c.toDataURL('image/png');link.click()};
}
// Four-language weekly/monthly review, including the exported canvas. The
// original review remains for historical regression comparisons only.
function reviewV973(n){
 panel.classList.remove('dp-heart-full','dp54-full');stop();++renderToken;
 const T=(zh,zht,en,ja)=>state.lang==='ja'?ja:state.lang==='en'?en:state.lang==='zh'?zh:zht;
 const d=readData(n),r=d.rows,valid=r.filter(x=>score(x)!==null),avg=mean(r,['score','healthScore']);
 const hr=mean(r,['heart','hr']),rr=mean(r,['breath','rr']),sleep=mean(r,['sleep','rest']),rec=mean(r,['recovery']),rm=mean(r,['rmssd']);
 const best=valid.length?valid.reduce((a,b)=>score(a)>=score(b)?a:b):null;
 const worst=valid.length?valid.reduce((a,b)=>score(a)<=score(b)?a:b):null;
 const former=mean(readData(n*2).rows.slice(0,n),['score','healthScore']);
 const delta=avg===null||former===null?null:avg-former;
 const period=T(n===7?'本周':'本月',n===7?'本週':'本月',n===7?'This week':'This month',n===7?'今週':'今月');
 const unit=T('天','天','days','日'),point=T('分','分','pts','点');
 const bars=r.map(x=>{const v=score(x);return `<div class="dp-bar-col"><i title="${esc(x.date)} ${fmt(v)}" style="height:${v===null?2:Math.max(4,v)}%;background:${v===null?'#d7d7e4':mood(v).color}"></i></div>`}).join('');
 const measure=[
  [T('平均心率','平均心率','Avg heart rate','平均心拍数'),`${fmt(hr)} BPM`],
  [T('平均呼吸','平均呼吸','Avg breathing','平均呼吸数'),`${fmt(rr,1)} /min`],
  [T('平均睡眠','平均睡眠','Avg sleep','平均睡眠時間'),`${fmt(sleep,1)} h`],
  [T('平均恢复','平均恢復','Avg recovery','平均回復'),fmt(rec)],
  ['HRV · RMSSD',`${fmt(rm,1)} ms`],
  [T('相比上期','相比上期','Versus previous period','前期間との比較'),delta===null?'—':`${delta>0?'+':''}${fmt(delta,1)} ${point}`]
 ];
 const note=d.real?T('已导入记录，请核对来源。','已匯入紀錄，請核對來源。','Imported records; confirm their source.','取り込んだ記録です。出典を確認してください。'):
  T('模拟数据，并非项圈实测。','模擬數據，並非項圈實測。','Synthetic data, not collar measurements.','模擬データです。首輪の実測値ではありません。');
 body.innerHTML=`<div class="dp-story-source">${esc(pet().name)} · ${T('当前宠物','目前寵物','Current pet','現在のペット')}</div><div class="dp-review-hero"><span>${esc(pet().name)} · ${period}${T('回顾','回顧',' review','の振り返り')}</span><div class="dp-review-score">${fmt(avg)}<small>${avg===null?'':' / 100'}</small></div><div>${T('平均健康分数','平均健康分數','Average health score','平均健康スコア')} · ${valid.length}/${n} ${unit}</div><div>${esc(d.dates[0])} — ${esc(d.dates.at(-1))}</div></div><div class="dp-story-metric">${measure.map(([label,value])=>`<div>${label}<b>${value}</b></div>`).join('')}</div><h3>${n} ${unit} · ${T('健康评分趋势','健康評分趨勢','Health score trend','健康スコアの推移')}</h3><div class="dp-story-chart">${bars}</div><p class="dp-story-foot">${T('缺失日期不参与平均值计算','欠測日は平均値に含めません','Missing days are excluded from averages','欠測日は平均に含めません')}</p><div class="dp-review-highlight">🏆 ${T('最佳','最佳','Best','最高')}：${best?`${best.date} (${fmt(score(best))})`:'—'}<br>📉 ${T('较低','較低','Lowest','最低')}：${worst?`${worst.date} (${fmt(score(worst))})`:'—'}</div><div class="dp-review-story">${valid.length?T('以上仅描述模拟趋势，不构成医疗判断。','以上僅描述模擬趨勢，不構成醫療判斷。','These are synthetic trends, not a medical assessment.','模擬データの傾向であり、診断ではありません。'):T('暂无有效评分。','暫無有效評分。','No valid score yet.','有効なスコアがありません。')}</div><button id="dp-save-review">${T('保存回顾图片','儲存回顧圖片','Save review image','振り返り画像を保存')}</button><p class="dp-story-foot">${note}</p>`;
 const owner=currentIdentity(),name=pet().name;
 document.getElementById('dp-save-review').onclick=()=>{
  if(currentIdentity()!==owner||!panel.classList.contains('open'))return;
  const canvas=document.createElement('canvas');canvas.width=900;canvas.height=1200;
  const context=canvas.getContext('2d');context.fillStyle='#f9f7ff';context.fillRect(0,0,900,1200);
  context.fillStyle='#5444a9';context.fillRect(0,0,900,360);context.fillStyle='white';
  context.font='bold 42px sans-serif';context.fillText(`DeepPet · ${name.slice(0,18)} · ${period}`,36,78);
  context.font='bold 120px sans-serif';context.fillText(fmt(avg),40,246);
  context.font='28px sans-serif';context.fillText(`${valid.length}/${n} ${unit}`,42,316);
  context.fillStyle='#514a76';context.font='bold 30px sans-serif';
  measure.forEach(([label,value],i)=>context.fillText(`${label}  ${value}`,42,445+i*79));
  const bw=800/n;r.forEach((row,i)=>{const v=score(row);if(v!==null){context.fillStyle=mood(v).color;context.fillRect(48+i*bw,1060-v*1.25,Math.max(2,bw-3),v*1.25)}});
  context.fillStyle='#706a86';context.font='22px sans-serif';context.fillText(note.slice(0,50),42,1143);
  const a=document.createElement('a');a.download=`DeepPet_${owner}_${n===7?'Weekly':'Monthly'}.png`;a.href=canvas.toDataURL('image/png');a.click();
 };
}
function show(){if(tab!=='heart')panel.classList.remove('dp-heart-full','dp54-full');activePet=currentIdentity();document.getElementById('dp-review-tabs').style.display=tab==='heart'?'none':'flex';const title=state.lang==='ja'?['心拍の瞬間','健康の振り返り']:state.lang==='en'?['Heart Moments','Health Review']:state.lang==='zh'?['心跳时刻','健康回顾']:['心跳時刻','健康回顧'];document.querySelector('#dp-story-card h2').textContent=tab==='heart'?title[0]:title[1];document.querySelectorAll('[data-dptab]').forEach(b=>{b.classList.toggle('active',b.dataset.dptab===tab);b.textContent=state.lang==='ja'?(b.dataset.dptab==='week'?'今週の振り返り':'今月の振り返り'):state.lang==='en'?(b.dataset.dptab==='week'?'Weekly review':'Monthly review'):state.lang==='zh'?(b.dataset.dptab==='week'?'本周回顾':'本月回顾'):b.dataset.dptab==='week'?'本週回顧':'本月回顧'});tab==='heart'?heart():reviewV973(tab==='week'?7:30)}
// V8.47: the home Heart Moments entry opens the final stage directly.
// Capture phase prevents the legacy intermediary modal from opening.
document.addEventListener('click',function(e){
 const trigger=e.target.closest?.('[data-action="heart-moment"], #dp-heart-integrated');
 if(!trigger)return;
 if(state.emptyPreview)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 if(typeof state!=='undefined' && state.modal){state.modal=null;if(typeof renderModal==='function')renderModal();}
 tab='heart';panel.classList.add('open');show();
},true);
document.addEventListener('click',e=>{if(e.target.closest?.('#dp-heart-integrated')){tab='heart';panel.classList.add('open');show()}else if(e.target.closest?.('#dp-week-review')){tab='week';panel.classList.add('open');show()}else if(e.target.closest?.('#dp-month-review')){tab='month';panel.classList.add('open');show()}});
function closeHeartScreen(){stop();++renderToken;panel.classList.remove('open','dp-heart-full','dp54-full');if(typeof render==='function')render(false);}
const exit=document.getElementById('dp-story-close');exit.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeHeartScreen()});panel.addEventListener('click',e=>{if(e.target===panel)closeHeartScreen()});
document.querySelectorAll('[data-dptab]').forEach(b=>b.onclick=()=>{tab=b.dataset.dptab;show()});
// When the original app switches pets, refresh the open Heart Moments screen.
const watch=new MutationObserver(()=>{if(panel.classList.contains('open')&&activePet!==currentIdentity()){if(state.emptyPreview)closeHeartScreen();else show()}});watch.observe(document.body,{childList:true,subtree:true});
// The Heart panel is outside the normal app render tree. Handle pet changes
// directly; a body-only MutationObserver could miss changes within #app.
const previousActivate=dpActivatePet,previousBlank=dpActivateBlank;
dpActivatePet=function(index){const ok=previousActivate(index);if(ok&&panel.classList.contains('open'))show();return ok;};
dpActivateBlank=function(){const result=previousBlank();if(panel.classList.contains('open'))closeHeartScreen();return result;};
// V9.74: both review graphs use the same validated daily scores as Home/Deep.
// Missing dates break the line; a laboratory score cannot substitute for a
// missing collar day. The exported image uses these two exact series as well.
function reviewV974(n){
 panel.classList.remove('dp-heart-full','dp54-full');stop();++renderToken;
 const T=(zh,zht,en,ja)=>state.lang==='ja'?ja:state.lang==='en'?en:state.lang==='zh'?zh:zht;
 const d=readData(n),rows=d.rows,prev=readData(n*2).rows.slice(0,n);
 const status=T('身体状态评分','身體狀態評分','Body state score','身体状態スコア');
 const rhythm=T('身体节奏评分','身體節奏評分','Body rhythm score','身体リズムスコア');
 const entries=[{key:'score',label:status,color:'#dc618c'},{key:'rhythm',label:rhythm,color:'#5085ce'}];
 const value=(row,key)=>validScore(row?.[key])?Number(row[key]):null;
 const meanKey=(list,key)=>{const x=list.map(r=>value(r,key)).filter(v=>v!==null);return x.length?Math.round(x.reduce((a,b)=>a+b,0)/x.length):null};
 const xy=(i,v)=>[38+(i/Math.max(1,n-1))*320,17+(100-v)*1.60];
 const segments=(list,key)=>{const groups=[];let pending=[];list.forEach((row,i)=>{const v=value(row,key);if(v===null){if(pending.length)groups.push(pending);pending=[];}else pending.push(xy(i,v));});if(pending.length)groups.push(pending);return groups;};
 const paths=(list,key)=>segments(list,key).map(group=>group.length===1?
  `<circle cx="${group[0][0].toFixed(1)}" cy="${group[0][1].toFixed(1)}" r="3.3" />`:
  `<polyline points="${group.map(p=>p.map(x=>x.toFixed(1)).join(',')).join(' ')}" fill="none" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
 const ticks=[0,25,50,75,100].map(v=>{const y=xy(0,v)[1];return `<line x1="38" y1="${y}" x2="360" y2="${y}" stroke="#e1e7f0" stroke-width="1"/><text x="31" y="${y+3}" text-anchor="end" font-size="10" fill="#63748b">${v}</text>`;}).join('');
 const graph=`<svg viewBox="0 0 380 220" role="img" aria-label="${T('两条健康评分趋势','兩條健康評分趨勢','Two health score trends','2つの健康スコアの推移')}" style="display:block;width:100%;height:auto">
  ${ticks}<line x1="38" y1="177" x2="360" y2="177" stroke="#8b99b1"/>
  ${entries.map(e=>`<g stroke="${e.color}" fill="${e.color}">${paths(rows,e.key)}</g>`).join('')}
  <text x="38" y="201" font-size="10" fill="#63748b">${d.dates[0]}</text>
  <text x="360" y="201" font-size="10" fill="#63748b" text-anchor="end">${d.dates.at(-1)}</text>
  <text x="200" y="215" font-size="10" fill="#63748b" text-anchor="middle">${T('日期','日期','Date','日付')}</text></svg>`;
 const sums=entries.map(e=>({ ...e,avg:meanKey(rows,e.key),prev:meanKey(prev,e.key),count:rows.filter(r=>value(r,e.key)!==null).length}));
 const bestWorst=e=>{const observed=rows.filter(r=>value(r,e.key)!==null);if(!observed.length)return '—';const sorted=[...observed].sort((a,b)=>value(a,e.key)-value(b,e.key));return `${T('最佳','最佳','Best','最高')} ${sorted.at(-1).date} ${value(sorted.at(-1),e.key)} · ${T('最低','最低','Lowest','最低')} ${sorted[0].date} ${value(sorted[0],e.key)}`;};
 const name=pet().name,owner=currentIdentity(),isGallery=!state.emptyPreview&&state.dog<dogs.length&&!pet().dpFixtureInvalidated;
 const note=d.real?T('数据来自已验证的项圈记录。','資料來自已驗證的項圈紀錄。','Verified collar records.','確認済みの首輪データです。'):
  isGallery?T('这些是模拟数据，不是项圈实测。','這些是模擬資料，不是項圈實測。','Synthetic sample data, not collar readings.','首輪の実測値ではなく模擬データです。'):
  T('没有有效测量时不生成健康评分。','沒有有效量測時不生成健康評分。','No scores without valid readings.','有効な測定がない場合、スコアは生成されません。');
 body.innerHTML=`<div class="dp-story-source">${esc(name)} · ${T('当前宠物','目前寵物','Current pet','現在のペット')}</div>
  <div class="dp-review-hero"><span>${n===7?T('本周回顾','本週回顧','Weekly review','今週の振り返り'):T('本月回顾','本月回顧','Monthly review','今月の振り返り')}</span>
  <div>${esc(d.dates[0])} — ${esc(d.dates.at(-1))}</div></div>
  <div class="dp-story-metric" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
  ${sums.map(x=>`<div><span style="color:${x.color}">${x.label}</span><b>${x.avg===null?'—':x.avg+'/100'}</b><small>${x.count}/${n} ${T('有效天','有效天','valid days','有効日')}</small></div>`).join('')}</div>
  <h3>${T('两项评分每日趋势','兩項評分每日趨勢','Daily trends for both scores','2つのスコアの日別推移')}</h3>
  <div class="dp-story-chart" style="background:white;border-radius:14px;padding:10px 6px">${graph}</div>
  <div class="dp-review-highlight">${sums.map(x=>`<p><span style="color:${x.color};font-weight:700">${x.label}</span><br>${bestWorst(x)}<br>${T('相比前期','相比前期','Versus prior period','前期間比')}：${x.avg===null||x.prev===null?'—':(x.avg-x.prev>0?'+':'')+(x.avg-x.prev)}</p>`).join('')}</div>
  <p class="dp-story-foot">${T('缺测日期为空白，不能当作零分。','缺測日期為空白，不能當作零分。','Missing dates are gaps, not zero scores.','欠測日は0点ではなく空白として扱います。')}</p>
  <button id="dp-save-review">${T('保存回顾图片','儲存回顧圖片','Save review image','振り返り画像を保存')}</button>
  <p class="dp-story-foot">${note}</p>`;
 document.getElementById('dp-save-review').onclick=()=>{
  if(!panel.classList.contains('open')||currentIdentity()!==owner||tab!==(n===7?'week':'month'))return;
  const canvas=document.createElement('canvas');canvas.width=900;canvas.height=1200;
  const c=canvas.getContext('2d');c.fillStyle='#fbfcff';c.fillRect(0,0,900,1200);
  c.fillStyle='#252e50';c.font='bold 44px sans-serif';c.fillText('DeepPet · '+name.slice(0,17),46,80);
  c.font='28px sans-serif';c.fillText(d.dates[0]+' — '+d.dates.at(-1),46,132);
  sums.forEach((e,i)=>{c.fillStyle=e.color;c.font='bold 30px sans-serif';c.fillText(e.label,48,230+i*122);c.font='bold 62px sans-serif';c.fillText(e.avg===null?'—':String(e.avg)+'/100',48,302+i*122);});
  const cx=i=>65+i/Math.max(1,n-1)*790,cy=v=>980-(v/100)*425;
  c.strokeStyle='#e3e8f1';c.fillStyle='#64748b';c.font='21px sans-serif';
  for(const mark of [0,25,50,75,100]){const y=cy(mark);c.beginPath();c.moveTo(65,y);c.lineTo(855,y);c.stroke();c.fillText(String(mark),23,y+6);}
  entries.forEach(e=>{c.strokeStyle=e.color;c.lineWidth=5;let startedLine=false;rows.forEach((row,i)=>{const v=value(row,e.key);if(v===null){startedLine=false;return;}if(!startedLine){c.beginPath();c.moveTo(cx(i),cy(v));startedLine=true;}else{c.lineTo(cx(i),cy(v));}const next=value(rows[i+1],e.key);if(i===rows.length-1||next===null){c.stroke();startedLine=false;}});});
  c.fillStyle='#64748b';c.font='23px sans-serif';c.fillText(d.dates[0],65,1030);c.fillText(d.dates.at(-1),625,1030);
  c.fillText(note.slice(0,44),45,1120);
  const a=document.createElement('a');a.download=`DeepPet_${owner}_${n===7?'Weekly':'Monthly'}.png`;a.href=canvas.toDataURL('image/png');a.click();
 };
}
reviewV973=reviewV974;
window.DeepPetHeartMoments={close:closeHeartScreen,open:()=>{if(state.emptyPreview)return;tab='heart';panel.classList.add('open');show()},refresh:()=>{if(panel.classList.contains('open'))show()},ingestVerifiedDailyRecords:(petIndex,records)=>{
 if(!Array.isArray(records))throw Error('records must be an array');
 const index=Number(petIndex);if(!Number.isInteger(index)||index<dogs.length||index>=allPets().length)return {accepted:false,reason:'only_user_pet'};
 const approved=verifiedOwnerRows(index),requested=new Set(records.filter(r=>r&&String(r.petId)===String(index)).map(r=>r.date));
 // Store only canonical, engine-scored projections; foreign, future, unverified
 // and caller-invented scores cannot become "valid" by naming this API.
 const selected=approved.filter(r=>requested.has(r.date));
 state.dpVerifiedDailyRecords??={};state.dpVerifiedDailyRecords[String(index)]=selected;
 if(typeof persist==='function')persist();if(panel.classList.contains('open')&&state.dog===index)show();
 return {accepted:selected.length>0,count:selected.length};
}};
})();
