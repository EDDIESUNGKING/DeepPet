/* DeepPet V9.31 — unified first-visit UX and transparent display-only patch.
   Keeps the V9.30 scoring engine unchanged; no zero placeholders enter scoring. */
(function(root){
'use strict';
const l=(zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const blank=()=>selectedBlank();
const novice=()=>selectedBlank()||dp58FreshPet()||isFreePet();
const info=()=>!blank()?currentDog():null;
const profileReady=()=>{const d=info();return !!(d&&d.age!==null&&d.age!==undefined&&String(d.age).trim()!==''&&Number(d.age)>=0&&Number(d.weight)>0&&d.breed&&d.breed.en!=='Not set'&&d.breed.zh!=='未設定');};
const noData='—';
const blankMeter=()=>{const dots=Array.from({length:54},(_,i)=>{const a=i*2*Math.PI/54-Math.PI/2;return `<circle cx="${(57+48*Math.cos(a)).toFixed(2)}" cy="${(57+48*Math.sin(a)).toFixed(2)}" r="2.25" fill="#adb6c7" opacity=".25"/>`;}).join('');return `<span class="dp931-dotted-meter" aria-label="No score yet"><svg viewBox="0 0 114 114" aria-hidden="true">${dots}</svg><span class="dp931-dotted-center"><strong>—</strong><small>/100</small></span></span>`;};

const rings=()=>`<section class="card summary-card dp-combined-summary dp-aurora-summary dp931-empty-summary"><div class="summary-top"><div class="summary-day"><strong>${l('今日總結','Today','오늘 요약','今日のまとめ')}</strong></div></div><div class="dp-summary-lanes"><div class="dp-summary-lane dp931-health-lane" style="--score-color:#9ca7b8"><span class="dp-lane-meter">${blankMeter()}</span><span class="dp-lane-copy"><strong>${l('生理狀態評分','Physical status','생리 상태','生理状態')}</strong><span class="dp-lane-description">${l('等待當日有效監測','Waiting for daily readings','오늘 측정 대기','測定待ち')}</span><small>${l('心肺 · 睡眠 · 精力與恢復','Cardio · Sleep · Energy','심폐 · 수면 · 회복','心肺・睡眠・回復')}</small></span></div><div class="dp-summary-lane dp931-rhythm-lane" style="--score-color:#9ca7b8"><span class="dp-lane-meter">${blankMeter()}</span><span class="dp-lane-copy"><strong>${l('身體節奏分數','Body rhythm score','몸의 리듬','身体リズム')}</strong><span class="dp-lane-description">${l('等待當日有效監測','Waiting for daily readings','오늘 측정 대기','測定待ち')}</span><small>${l('放鬆與平穩度 · 心搏節奏','Rest · Heart rhythm','안정 · 심박 리듬','安定・心拍')}</small></span></div></div></section>`;
const dotRingEmpty=()=>`<div class="dp931-empty-ring" aria-label="No valid score"><span>—</span><small>/100</small></div>`;
const modelEmpty=()=>`<button type="button" class="card dp931-model-empty" data-dp931="model-empty"><div class="dp931-model-title">✧ <b>${l('寵物健康模型','Pet Wellness Model','반려동물 건강 모델','ペット健康モデル')}</b><small>${l('近30天','Last 30 days','최근 30일','直近30日')}</small></div><div class="dp931-model-pair"><div><small>${l('整體健康評分','Overall wellness','전체 건강 점수','総合スコア')}</small>${dotRingEmpty()}</div><div><small>${l('AI 推算生理年齡','AI estimated age','AI 추정 나이','AI 推定年齢')}</small><strong>—<em>${l('歲','yr','세','歳')}</em></strong><span>± —</span></div></div><footer>${l('累積監測後會顯示結果','Results appear after monitoring','측정 후 결과 표시','測定後に表示')} <span>›</span></footer></button>`;
const photoHero=(d)=>{
 const ready=profileReady(); const title=d?h(d.name):l('還沒有寵物資料','No pet profile yet','반려동물 정보 없음','ペット情報がありません');
 const img=d?.photo?`<img src="${h(d.photo)}" alt=""/>`:`<span class="dp931-empty-photo">🐾</span>`;
 const meta=d&&ready?`${h(d.species==='cat'?l('貓','Cat','고양이','猫'):l('狗','Dog','강아지','犬'))} · ${h(breedText(d))} · ${h(d.age)} ${l('歲','years','세','歳')} · ${h(d.weight)} kg`:d?l('請補齊類型、品種、年齡及體重','Complete species, breed, age and weight','종류, 품종, 나이, 체중을 입력','種類・品種・年齢・体重を入力'):l('點擊建立名字、種類、品種、年齡、體重及照片','Tap to add name, species, breed, age, weight and photo','이름·종류·품종·나이·체중·사진 추가','名前・種類・品種・年齢・体重・写真を入力');
 return `<button type="button" class="dp931-profile-hero" data-action="${d?'edit-pet':'pet-add'}">${img}<span><small>${ready?l('已建立的寵物檔案','Pet profile','반려동물 프로필','ペットプロフィール'):l('第一步 · 認識你的寵物','Step 1 · Your pet','1단계 · 반려동물','ステップ1 · ペット')}</small><strong>${title}</strong><em>${meta}</em><b>${d?l('修改基本資料與照片','Edit profile and photo','프로필·사진 수정','プロフィール・写真を編集'):l('建立寵物健康檔案','Create pet profile','반려동물 등록','ペット情報を作成')} ›</b></span></button>`;
};
function stages(d){const ready=profileReady(),paired=!!state.connected&&!!d;return `<div class="dp931-first-steps"><section class="dp931-first-step"><div class="dp931-step-head"><span>${paired?'✓':'02'}</span><b>${l('連接 DeepPet 項圈','Connect DeepPet collar','목걸이 연결','首輪を接続')}</b></div><p>${paired?l('項圈已配對。監測資料會在有效測量後出現。','Collar paired. Results appear after valid monitoring.','목걸이 연결 완료','接続済み'):l('連接項圈以開始心搏、呼吸與長期趨勢監測；4G 版本另有電子圍欄。','Pair a collar for vital sensing; 4G also adds geofencing.','목걸이 연결과 4G 위치 기능','接続して測定開始')}</p><button type="button" data-action="${paired?'device-detail':ready?'device-find':d?'edit-pet':'pet-add'}">${paired?l('查看已連接項圈','View paired collar','연결된 기기 보기','接続済み首輪を見る'):ready?l('搜尋附近項圈','Find nearby collar','기기 검색','首輪を検索'):l('先完善寵物檔案，再連接項圈','Complete pet profile first','먼저 프로필 완성','まずプロフィールを完成')} ›</button></section><section class="dp931-first-step"><div class="dp931-step-head"><span>03</span><b>${l('免費健康管理','Free health management','무료 건강 관리','無料の健康管理')}</b></div><p>${l('即使還沒有項圈，也可以整理體檢、疫苗、用藥、驅蟲及飲食記錄。','Health records work even without a collar.','목걸이 없이 건강 기록 가능','首輪がなくても記録できます。')}</p><button type="button" data-dp931="open-health">${l('開始健康管理','Open health records','건강 관리 시작','健康管理へ')} ›</button></section></div>`;}
function gpsFrame(d){const fourG=!!state.connected&&(state.deviceType==='4g');return `<button type="button" class="card dp931-empty-gps" data-action="${fourG?'gps-open':profileReady()?'device-find':d?'edit-pet':'pet-add'}"><span>📍</span><div><strong>${l('位置與電子圍欄（4G）','Location & Geofence (4G)','위치 · 지오펜스','位置とジオフェンス')}</strong><small>${fourG?l('已連接 4G 項圈；查看位置','4G connected · View location','4G 연결됨','4G接続済み'):l('目前無定位數據；藍牙版不支援定位','No location data · Bluetooth has no GPS','위치 기록 없음','位置データなし')}</small></div><b>›</b></button>`;}
function pageHome(){const d=info();return `<div class="app-pad home-page-v30 dp931-newcomer-page">${homePetStrip()}${photoHero(d)}${dp924TourEntry()}${stages(d)}<section class="dp931-placeholder-status"><b>${l('現在狀態','Current status','현재 상태','現在の状態')}</b><span>${l('尚未取得有效監測','No sensor readings yet','측정 없음','測定なし')}</span></section>${rings()}<section class="card dp931-empty-focus"><b>${l('今日最值得知道','Today’s focus','오늘의 핵심','今日の注目')}</b><p>${l('尚無待辦或監測提醒','No tasks or sensor alerts yet','할 일이나 알림 없음','まだ記録がありません')}</p></section>${modelEmpty()}${gpsFrame(d)}<button type="button" class="card dp931-heart-start" data-action="heart-moment">💗 ${l('心跳時刻','Heart Moments','심박 순간','心拍のひととき')} <span>›</span></button><div class="footer-space"></div></div>`;}
blankHomeView=pageHome;dp58FreshHome=pageHome;freeCareHomeView=pageHome;
// All three Deep sections exist even without sensor recordings.
function pageDeep(){const idx=Number(state.deepType)||0;const captions=[l('心肺狀態','Cardio & breathing','심폐 상태','心肺'),l('睡眠休息','Sleep & rest','수면·휴식','睡眠'),l('精力與恢復','Energy & recovery','활력과 회복','回復')];const paired=!!state.connected;const labels=[['心跳狀況','呼吸狀況','HRV','心搏節奏穩定度'],['睡眠分數','淺睡','深睡','REM'],['精力情況','恢復情況','放鬆與平穩度']][idx];return `<div class="app-pad dp931-empty-deep">${homePetStrip()}${bigHeader(t('deep'))}<div class="dp931-deep-tabs">${captions.map((name,i)=>`<button data-dp931="deep-tab" data-index="${i}" class="${idx===i?'selected':''}">${name}</button>`).join('')}</div><div class="dp931-date-tabs">${[1,7,30].map(n=>`<button data-dp931="period" data-days="${n}" class="${state.range===n?'selected':''}">${n===1?l('當天','Today','오늘','今日'):n+l('天',' days','일','日')}</button>`).join('')}</div><section class="card dp931-empty-deep-main"><header><span>${captions[idx]}</span><strong>—<small>/100</small></strong></header><p>${l('尚未有有效生理資料','No valid sensor data yet','측정된 데이터 없음','測定データなし')}</p><div class="dp931-empty-chart"><i></i><i></i><i></i><i></i><i></i><i></i></div></section><div class="dp931-metric-mini">${labels.map(n=>`<div><small>${n}</small><strong>—</strong></div>`).join('')}</div><button class="card dp931-empty-link" data-action="${paired?'device-detail':blank()?'pet-add':'device-find'}">${paired?l('項圈已連接，等待有效量測資料','Collar connected; awaiting valid readings','측정 대기','測定待ち'):l('連接設備後開始記錄；目前所有結果保持空白','Pair a collar to start; scores remain blank','연결 후 기록 시작','接続すると計測開始')} ›</button><div class="footer-space"></div></div>`;}
blankDeepView=pageDeep;freeCareDeepView=pageDeep;
dp58FreshEmptyTab=function(){return state.tab==='deep'?pageDeep():state.tab==='me'?pageMe():pageHealth();};
function pageHealth(){const d=info(),items=[['🥣',l('飲食目標','Food goals','식사 목표','食事') ,'food'],['💊',l('用藥計畫','Medication','복약','投薬'),'med'],['🩺',l('體檢分析','Health examinations','건강검진','検診'),'reports'],['💉',l('疫苗計畫','Vaccinations','예방접종','予防接種'),'vaccines'],['🐛',l('驅蟲計畫','Deworming','구충','駆虫'),'deworming'],['📝',l('額外記錄','Extra records','기타 기록','追加記録'),'notes']];if(d&&state.detail&&state.detail!=='dp921-report'&&state.detail!=='dp921-list')return healthView();return `<div class="app-pad dp931-empty-health">${homePetStrip()}${bigHeader(t('health'))}<section class="card dp931-empty-health-intro"><h3>${l('健康管理','Health management','건강 관리','健康管理')}</h3><p>${l('可建立及保存真實記錄；未輸入的項目保持空白。','Add your own records; empty fields remain empty.','직접 기록을 추가하세요.','実際の記録を入力')}</p></section>${items.map(([emoji,name,kind])=>`<button type="button" class="card dp931-health-row" data-dp931="health-open" data-kind="${kind}"><span>${emoji}</span><div><strong>${name}</strong><small>N/A · ${l('尚無資料','No records yet','기록 없음','記録なし')}</small></div><b>›</b></button>`).join('')}<div class="footer-space"></div></div>`;}
blankHealthView=pageHealth;dp924FreshHealthView=pageHealth;freeCareHealthView=pageHealth;
function pageMe(){if(state.detail==='dp931-wellness-empty')return emptyWellnessDetail();const d=info();return `<div class="app-pad dp931-empty-me">${homePetStrip()}${bigHeader(t('me'))}<section class="card dp931-me-profile">${d?`<img src="${h(d.photo||'')}" alt=""/>`:'<span class="dp931-me-placeholder">🐾</span>'}<div><strong>${d?h(d.name):l('尚未建立寵物','No pet yet','등록된 반려동물 없음','ペット未登録')}</strong><small>${d&&profileReady()?`${h(breedText(d))} · ${d.age} ${l('歲','years','세','歳')} · ${d.weight} kg`:l('可填寫寵物姓名、品種、年齡、體重與照片','Add name, breed, age, weight and photo','프로필 입력','情報を入力')}</small></div><button data-action="${d?'edit-pet':'pet-add'}">${l('編輯','Edit','편집','編集')}</button></section>${modelEmpty()}<section class="card dp931-me-section"><h3>${l('14 天健康基準','14-day health baseline','14일 건강 기준','14日健康基準')}</h3><p>N/A · ${l('等待有效監測日','Awaiting valid monitoring days','측정 데이터 대기','測定記録待ち')}</p></section><section class="card dp931-me-section"><h3>${l('我的設備','My device','내 기기','デバイス')}</h3><p>${state.connected?l('項圈已連接：','Paired collar: ','목걸이 연결됨: ','接続済み：')+h(state.connectedName||'DeepPet'):l('尚未連接項圈','No collar paired','연결된 목걸이 없음','未接続')}</p><button type="button" data-action="${state.connected?'device-detail':d?'device-find':'pet-add'}">${state.connected?l('查看項圈設定','View collar settings','기기 설정','首輪設定'):l('搜尋並連接項圈','Find and pair collar','기기 검색','首輪を探す')}</button></section><button type="button" class="card dp931-garden-new dp931-garden-empty" data-action="garden-detail"><div class="dp931-garden-copy"><small>DeepPet · ${l('寵物社群','Pet community','펫 커뮤니티','ペットコミュニティ')}</small><strong>${l('附近寵物','Nearby pets','주변 반려동물','近くのペット')}</strong><span>${l('20 公里內 · 可選擇是否分享位置','Within 20 km · Sharing is optional','20km 이내','20km以内')}</span><b>${l('查看附近寵物','Explore nearby pets','주변 보기','近くのペットを見る')} →</b></div><div class="dp931-garden-photo"><img src="assets/onboarding/scenes/scene_01.webp" alt=""/></div></button><section class="card dp931-me-section"><h3>${l('設定與管理','Settings & management','설정','設定')}</h3><button data-action="language-detail">${l('語言設定','Language','언어','言語')}</button><button data-action="alerts">${l('提醒與通知','Alerts & notifications','알림','通知')}</button><button data-action="privacy-detail">${l('隱私與資料','Privacy & data','정보 보호','プライバシー')}</button></section><div class="app-build-version">DeepPet · Version 9.33</div><div class="footer-space"></div></div>`;}
blankMeView=pageMe;freeCareMeView=pageMe;

function emptyWellnessDetail(){return `<div class="app-pad dp931-empty-wellness-detail"><header class="dp-independent-head"><button type="button" data-dp931="model-back" aria-label="Back">←</button><b>${l('寵物健康模型','Pet Wellness Model','반려동물 건강 모델','ペット健康モデル')}</b></header><h3>${l('近30天分析','Last 30 days','최근 30일','直近30日')}</h3>${modelEmpty()}<section class="card"><h3>${l('近30天趨勢','30-day trends','30일 추세','30日間の推移')}</h3><div class="dp931-empty-chart"><i></i><i></i><i></i><i></i></div><p>${l('尚無可分析的有效監測日，請先累積生理資料。','No valid days are available yet.','측정 기록 없음','記録なし')}</p></section><section class="card"><h3>${l('健康評分與 AI 年齡參考項目','Wellness sources','참조 항목','参考項目')}</h3>${[['心肺狀態','Cardio',0],['睡眠休息','Sleep',1],['精力與恢復','Energy',2],['體檢分析','Exam analysis',3]].map(([z,e,i])=>`<button class="dp931-health-row" data-dp931="model-factor" data-index="${i}"><span>${['🫀','🌙','⚡','🩺'][i]}</span><strong>${l(z,e,e,e)}</strong><b>›</b></button>`).join('')}</section></div>`;}

// Tour: more photographs/illustrations, correct order (monitor/pair -> Deep -> Health -> model).
const T=[
 {title:['日常守護與電子圍欄','Daily monitoring & geofence','일상 관찰','日常ケア'],desc:['了解心跳、呼吸、休息與活動；4G 版另有電子圍欄。','Heart, breathing, sleep and activity; geofence needs 4G.','심박·호흡·활동','心拍・呼吸'],image:'assets/onboarding/scenes/scene_01.webp',tiles:[['💓','心跳','Heart'],['🌬️','呼吸','Breathing'],['🛏️','休息','Rest'],['📍','電子圍欄（4G）','Geofence (4G)']]},
 {title:['連接項圈 · 深度週期分析','Pair collar · Deep analysis','목걸이 연결과 분석','首輪と分析'],desc:['透過項圈觀察當天、7 天與 30 天的心肺、睡眠、精力與恢復趨勢。','Pair a collar and explore today, 7-day and 30-day trends.','오늘·7일·30일 분석','当日・7日・30日'],image:'assets/onboarding/scenes/scene_02.webp',tiles:[['🫀','心肺狀態','Cardio'],['🌙','睡眠休息','Sleep'],['⚡','精力與恢復','Energy'],['📈','7 / 30 天趨勢','7 / 30-day trends']]},
 {title:['健康記錄與體檢分析','Health records & exams','건강 기록','健康記録'],desc:['即使沒有購買項圈，也能保存體檢、用藥、疫苗、驅蟲和飲食記錄。','Health records work without purchasing a collar.','목걸이 없이 기록','首輪なしでも利用'],image:'assets/onboarding/scenes/scene_03.webp',tiles:[['🩺','體檢報告','Exams'],['💊','用藥','Medicine'],['💉','疫苗與驅蟲','Vaccines'],['🥣','飲食記錄','Food']]},
 {title:['寵物健康模型與 AI 年齡','Wellness model & AI age','건강 모델','健康モデル'],desc:['結合最近 30 天的有效生理趨勢與適用的體檢紀錄，提供整體健康分數及 AI 推算年齡。','See the 30-day wellness model and AI estimated age.','30일 건강 추세','30日健康傾向'],image:'assets/onboarding/scenes/scene_04.webp',tiles:[['🟢','整體健康評分','Wellness score'],['✨','AI 推算年齡','AI age'],['📊','30 天趨勢','30-day trends'],['📝','體檢參考','Exam history']]}
];
tourContent=function(){const i=Math.max(0,Math.min(3,Number(state.tourStep)||0)),p=T[i],zh=state.lang!=='en';return `<section class="dp931-tour"><header><small>${l('60 秒認識 DeepPet','DeepPet in 60 seconds','DeepPet 60초','DeepPet 60秒')}</small><b>${i+1} / 4 · ${(i+1)*15} ${l('秒','sec','초','秒')}</b></header><div class="dp931-tour-hero"><img src="${p.image}" alt=""/><div><span>${String(i+1).padStart(2,'0')} / 04</span><h2>${state.lang==='ja'?p.title[3]:state.lang==='en'?p.title[1]:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(p.title[0]):p.title[0]}</h2></div></div><p>${state.lang==='ja'?p.desc[3]:state.lang==='en'?p.desc[1]:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(p.desc[0]):p.desc[0]}</p><div class="dp931-tour-tiles">${p.tiles.map(([ico,cn,en])=>`<div><span>${ico}</span><strong>${state.lang==='ja'?(window.JA_PHRASES?.[cn]||en):state.lang==='en'?en:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(cn):cn}</strong></div>`).join('')}</div><div class="dp931-tour-steps">${T.map((_,j)=>`<i class="${j===i?'now':j<i?'passed':''}"></i>`).join('')}</div><div class="dp931-tour-actions"><button data-action="tour-back" ${i===0?'disabled':''}>${l('上一步','Back','뒤로','戻る')}</button><button data-action="${i===3?'tour-enter':'tour-next'}">${i===3?l('開始使用','Get started','시작','開始'):l('下一步','Next','다음','次へ')} →</button></div></section>`;};
const prevAction=onAction;
onAction=function(el){const a=el?.dataset?.action;
 if(a==='pet-add-save'){
   const before=(state.petExtras||[]).length;const uploaded=document.querySelector('#dp931-pet-photo')?.files?.[0];
   prevAction(el);
   if((state.petExtras||[]).length>before){state.tab='home';state.detail=null;const target=state.dog;const extra=state.petExtras?.[target-dogs.length];if(extra){extra.dpFreshPet=true;extra.freeCare=true;}if(uploaded)savePhoto(uploaded,target);render(true);persist();}return;
 }
 if(a==='pair-commit'&&novice()){
   const owner=state.dog,epoch=state.dpPetEpoch;
   prevAction(el);
   const request=dpPairCommitRequest;
   setTimeout(()=>{if(state.dog===owner&&state.dpPetEpoch===epoch&&dpPairCommitRequest===request&&state.pairStage===4&&state.tab==='me'&&state.dog>=dogs.length){state.tab='home';state.detail=null;render(true);}},1050);
   return;
 }
 if(a==='save-pet'){
   const target=state.dog,uploaded=document.querySelector('#dp931-pet-photo')?.files?.[0];prevAction(el);if(uploaded&&state.modal!=='edit-pet')savePhoto(uploaded,target);return;
 }
 return prevAction(el);
};
let dp931PhotoSerial=0;
async function savePhoto(file,target){
 if(!file||!file.type.startsWith('image/')||file.size>12*1024*1024)return;
 const ownerEpoch=state.dpPetEpoch,request=++dp931PhotoSerial;
 const stillCurrent=()=>state.dog===target&&state.dpPetEpoch===ownerEpoch&&request===dp931PhotoSerial;
 try{
  const original=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
  if(!stillCurrent())return;
  const img=new Image();img.src=original;await img.decode();
  if(!stillCurrent())return;
  if(img.naturalWidth<20||img.naturalHeight<20)throw Error('invalid photo dimensions');
  const s=Math.min(1,720/Math.max(img.naturalWidth,img.naturalHeight)),cv=document.createElement('canvas');
  cv.width=Math.max(1,Math.round(img.naturalWidth*s));cv.height=Math.max(1,Math.round(img.naturalHeight*s));
  cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
  const photo=cv.toDataURL('image/jpeg',.78);
  if(!stillCurrent())return;
  state.petOverrides??={};const had=Object.prototype.hasOwnProperty.call(state.petOverrides,target),previous=state.petOverrides[target];
  state.petOverrides[target]={...(previous||{}),photo};
  if(!persist()){
   if(had)state.petOverrides[target]=previous;else delete state.petOverrides[target];
   return;
  }
  render(true);
 }catch(e){if(stillCurrent())console.warn('Photo was not saved',e);}
}
const oldRenderModal=renderModal;
renderModal=function(){oldRenderModal();if(!['pet-add','edit-pet'].includes(state.modal))return;const dialog=document.querySelector('.modal-sheet');if(!dialog||document.getElementById('dp931-pet-photo'))return;const target=dialog.querySelector('#addPetName,#petNameInput');if(!target)return;const el=document.createElement('div');el.className='dp931-photo-input';el.innerHTML=`<label for="dp931-pet-photo">📷 ${l('上傳寵物頭像','Upload pet photo','사진 업로드','写真アップロード')}</label><input id="dp931-pet-photo" type="file" accept="image/*"/><small>${l('可選；保存後仍可修改照片','Optional; can be changed later','선택 사항','任意')}</small>`;target.parentElement?.insertBefore(el,target);};
// Functional clicks for new empty states. Use one delegated listener, not dormant buttons.
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-dp931]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const a=b.dataset.dp931;
 if(a==='deep-tab'){state.deepType=Number(b.dataset.index)||0;render(true);}
 else if(a==='period'){state.range=Number(b.dataset.days)||1;render(true);}
 else if(a==='open-health'){state.tab='health';state.detail=null;render(true);}
 else if(a==='health-open'){if(blank()){openModal('pet-add');return;}state.tab='health';state.detail=b.dataset.kind;render(true);}
 else if(a==='model-empty'){state.dp931ModelOrigin=state.tab;state.tab='me';state.detail='dp931-wellness-empty';render(true);}
 else if(a==='model-back'){state.tab=state.dp931ModelOrigin==='home'?'home':'me';state.detail=null;render(true);}
 else if(a==='model-factor'){const i=Number(b.dataset.index);state.detail=null;state.tab=i===3?'health':'deep';if(i!==3)state.deepType=i;render(true);}
},true);
const priorRender=render;
render=function(reset=false){priorRender(reset);const app=document.getElementById('app');if(!app)return;
 // Preserve all currently valid score computations; polish the model card only.
 for(const card of app.querySelectorAll('.dp928-model-card')){
  card.classList.add('dp931-wellness-polished');
  card.querySelectorAll('.dp928-grade').forEach(x=>x.remove());
  const comp=card.querySelector('.dp928-age-comparison');if(comp){const m=root.DeepPetAudit925?.model?.();if(m&&Number.isFinite(m.ageYears)&&Number.isFinite(m.actualAge)){const display=root.DeepPetMetric1015?.signed('age',m.ageYears,m.actualAge);const shown=Number(m.ageYears.toFixed(1)),actual=Number(m.actualAge.toFixed(1)),delta=Math.round((shown-actual)*10)/10;comp.textContent=(display||((delta>0?'+':delta<0?'−':'±')+Math.abs(delta).toFixed(1)))+' '+l('歲','yr','세','歳');}else comp.textContent='± —';}
  const r=card.querySelector('.dp928-ring');if(r&&!r.dataset.dp931Sync){const model=root.DeepPetAudit925?.model?.();if(model&&Number.isFinite(model.score)){r.innerHTML=dpDotScore(model.score,'health');r.classList.add('dp931-scorelike');r.dataset.dp931Sync='yes';}}
 }
 if(!novice()&&state.tab==='home'&&!state.detail){
   app.querySelectorAll('.dp916-home-card,.dp925-open-exams,.dp921-home-exam-link,.dp-health-exam-home').forEach(x=>x.remove());
 }
 // Standardize all Me nearby-pets surfaces without covering the text.
 app.querySelectorAll('.garden-entry.dp-garden-entry').forEach(el=>{const entry=l('附近寵物','Nearby pets','주변 반려동물','近くのペット');el.classList.add('dp931-garden-new');el.innerHTML=`<div class="dp931-garden-copy"><small>DeepPet · ${l('寵物社群','Pet community','펫 커뮤니티','ペットコミュニティ')}</small><strong>${entry}</strong><span>${l('20 公里內的寵物 · 地圖與交流','Pets within 20 km · map & friends','20km 이내 반려동물','20km圏内のペット')}</span><b>${l('查看附近寵物','Explore nearby pets','주변 보기','周辺を見る')} →</b></div><div class="dp931-garden-photo"><img src="assets/onboarding/scenes/scene_01.webp" alt=""/></div>`;});
 app.querySelectorAll('.garden-result-head span').forEach(el=>{el.textContent=l('20 公里內 · 展示','Within 20 km · demo','20km 이내','20km以内');});
 // Deep date selectors use Today, 7 days and 30 days. Baseline is a separate feature.
 app.querySelectorAll('.app-build-version').forEach(el=>el.textContent='DeepPet · Version 9.31');
 if(['pet-add','edit-pet'].includes(state.modal))renderModal();
};
root.DeepPetUX931={version:'9.31',novice:()=>novice(),ready:()=>profileReady(),tourStages:T.length};
})(window);
