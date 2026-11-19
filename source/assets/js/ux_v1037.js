/* DeepPet V10.37 — focused onboarding, clean dates, owner-owned photos. */
(function(root){'use strict';
 const say=(zh,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:
  state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 // Every panel uses a deliberate pictorial SVG, not an emoji or a plain block.
 const palettes={phys:['#0f9d8d','#d8f9ee'],rhythm:['#496fd7','#dfecff'],cardio:['#d26688','#ffeaf1'],sleep:['#7565bf','#ece7ff'],
  exam:['#1d91a0','#e0f7fa'],med:['#ad71b8','#f9e9fb'],vax:['#5897dc','#e6f2ff'],food:['#d39b45','#fff2d7'],
  age:['#7966c9','#eee9ff'],wellness:['#30a87c','#e1faed']};
 function art(type){
  const [ink,bg]=palettes[type]||palettes.phys;
  const shapes={
   phys:'<circle cx="40" cy="40" r="28" fill="white" opacity=".87"/><path d="M14 41h12l5-13 9 27 8-17 5 4h14" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="62" cy="18" r="8" fill="currentColor" opacity=".13"/>',
   rhythm:'<circle cx="40" cy="40" r="27" fill="none" stroke="currentColor" stroke-width="3" opacity=".25"/><circle cx="40" cy="40" r="19" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="70 44"/><circle cx="40" cy="40" r="8" fill="currentColor" opacity=".18"/><path d="M7 44h16l5-7 9 14 7-19 7 12h21" fill="none" stroke="currentColor" stroke-width="2.7"/>',
   cardio:'<path d="M16 29a11 11 0 0 1 19-8l5 6 5-6a11 11 0 0 1 19 8c0 14-24 29-24 29S16 43 16 29Z" fill="white" stroke="currentColor" stroke-width="2.5"/><path d="M12 42h17l5-11 9 20 6-9h19" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" fill="none"/>',
   sleep:'<path d="M47 13c-21 10-21 41 6 49-21 12-43-3-43-23 0-17 16-30 37-26Z" fill="white" stroke="currentColor" stroke-width="2.5"/><path d="m57 17 2 6 6 2-6 2-2 6-2-6-6-2 6-2ZM63 42l1 4 4 1-4 1-1 4-1-4-4-1 4-1Z" fill="currentColor"/>',
   exam:'<rect x="19" y="10" width="43" height="59" rx="7" fill="white" stroke="currentColor" stroke-width="2.8"/><rect x="28" y="19" width="25" height="5" rx="2" fill="currentColor" opacity=".35"/><path d="M27 42h8l4-9 7 17 4-8h7" stroke="currentColor" stroke-width="3" fill="none"/><path d="M28 59h23" stroke="currentColor" stroke-width="3" opacity=".35"/>',
   med:'<rect x="13" y="27" width="54" height="27" rx="13.5" transform="rotate(-28 40 40)" fill="white" stroke="currentColor" stroke-width="3"/><path d="m34 23 13 24" stroke="currentColor" stroke-width="3"/><circle cx="54" cy="63" r="4" fill="currentColor" opacity=".45"/><circle cx="63" cy="57" r="3" fill="currentColor" opacity=".28"/>',
   vax:'<path d="m40 10 24 9v17c0 14-8 24-24 34-16-10-24-20-24-34V19Z" fill="white" stroke="currentColor" stroke-width="3"/><path d="M40 25v28M26 39h28" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>',
   food:'<path d="M15 41h50l-6 22H21Z" fill="white" stroke="currentColor" stroke-width="3"/><path d="M19 40c5-12 12-7 21-11 9 4 16-1 21 11" stroke="currentColor" stroke-width="2.5" fill="none"/><path d="M27 18c4 6 0 8 0 11M39 12c6 7 0 10 0 14M51 18c4 6 0 8 0 11" stroke="currentColor" stroke-width="3" opacity=".6" fill="none"/>',
   age:'<circle cx="40" cy="40" r="25" fill="white" stroke="currentColor" stroke-width="2.5"/><path d="M31 28h18M30 51h20M40 27v26" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".55"/><circle cx="40" cy="40" r="7" fill="currentColor" opacity=".22"/><circle cx="16" cy="15" r="4" fill="currentColor"/><circle cx="64" cy="65" r="4" fill="currentColor"/>',
   wellness:'<circle cx="40" cy="40" r="26" fill="white" stroke="currentColor" stroke-width="3" opacity=".42"/><path d="M40 14a26 26 0 1 1-24.5 34" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/><path d="m29 39 8 8 15-17" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
  };
  return `<svg class="dp1037-art" viewBox="0 0 80 80" role="img" aria-hidden="true" style="color:${ink};--tile-bg:${bg}" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="18" fill="${bg}"/>${shapes[type]||shapes.phys}</svg>`;
 }
 const stages=()=>[
  {key:'bcg',image:'assets/tour/intro_four_dogs.png',title:say('BCG：每秒守護牠的心跳與呼吸','BCG: continuous heart & breathing insights','BCG：心拍と呼吸を連続モニタリング','BCG: 심박과 호흡 연속 모니터링'),
   desc:say('BCG（Ballistocardiography，心搏震動圖）透過心臟搏動產生的微小身體振動，持續捕捉心跳與呼吸節奏。DeepPet 設計為全天 24 小時、每週 7 天、每秒連續監測，讓細微變化也能被記錄；相較於每數分鐘才取樣一次的間歇式方案，能保留更完整的趨勢細節。核心訊號辨識準確度目標達 90% 以上。','BCG (ballistocardiography) detects tiny body movements caused by heartbeats to track heart and breathing rhythms. DeepPet is designed for continuous, second-by-second, 24/7 monitoring, capturing subtleties missed between intermittent measurements taken minutes apart. Core signal recognition targets over 90% accuracy.','BCG（心弾動図）は心拍による微小な体の振動を捉えます。DeepPetは24時間365日、秒単位の連続監視を目指し、数分おきの間欠測定では見えにくい細かな変化まで追います。主要信号の認識精度目標は90%以上です。','BCG(탄도심장도)는 심장박동으로 생기는 미세한 신체 진동을 감지합니다. DeepPet은 주 7일 하루 24시간 초 단위 연속 모니터링을 목표로 하며 수분 간격 측정보다 세밀한 추세를 포착합니다. 핵심 신호 인식 정확도 목표는 90% 이상입니다.'),
   note:say('4G 版本還能讓你身處異地時查看位置與設定電子圍欄；藍牙版專注健康監測。','The 4G collar also adds remote location viewing and geofencing; Bluetooth focuses on health monitoring.','4G版は遠隔位置確認とジオフェンスにも対応。Bluetooth版は健康管理専用です。','4G 모델은 원격 위치 확인과 지오펜스를 지원하며 Bluetooth 모델은 건강 모니터링에 집중합니다.'),tiles:[]},
  {key:'scores',image:'assets/onboarding/scenes/scene_02.webp',title:say('看懂每天生理狀態與身體節奏','Understand daily physiology and body rhythm','毎日の生理状態と身体リズムを知る','매일의 생리 상태와 신체 리듬 이해'),
   desc:say('結合心肺、HRV、睡眠、精力與恢復，形成生理狀態評分；再深入分析放鬆與平穩度、心搏節奏穩定度，形成完整的身體節奏評分。可查看單日、7 天及 30 天的變化。','Heart and breathing, HRV, sleep, energy and recovery shape the physiological status score. Calmness, steadiness and heartbeat-rhythm stability form the complete body rhythm score. Review 1, 7 or 30 days.','心肺・HRV・睡眠・活力と回復を生理状態スコアに、落ち着きと心拍リズムの安定を身体リズムスコアに統合。1日・7日・30日の変化を確認できます。','심폐·HRV·수면·활력·회복으로 생리 상태 점수를, 휴식 안정도·심박 리듬 안정도로 신체 리듬 점수를 만듭니다. 1·7·30일 변화를 확인하세요.'),
   tiles:[['phys',say('生理狀態評分','Physiological status score','生理状態スコア','생리 상태 점수')],['rhythm',say('身體節奏評分','Body rhythm score','身体リズムスコア','신체 리듬 점수')],['cardio',say('心肺與睡眠','Cardio & sleep','心肺と睡眠','심폐와 수면')],['sleep',say('精力與恢復','Energy & recovery','活力と回復','활력과 회복')]]},
  {key:'care',image:'assets/onboarding/scenes/scene_03.webp',title:say('完整健康追蹤，讓日常管理更有方向','Full health tracking in one place','健康記録をまとめて管理','건강 기록과 관리를 한곳에서'),
   desc:say('體檢報告、用藥、疫苗，以及飲食與活動紀錄，都能在同一處管理。已儲存且完成核對的體檢報告會自動納入 AI 寵物健康模型校正，使後續分析更貼近寵物本身。','Manage examinations, medication, vaccines, food and activity together. Saved and reviewed examination results automatically inform personalization of the pet AI wellness model.','検診・投薬・予防接種・食事・活動をまとめて管理。保存・確認した検診結果はAIペット健康モデルの個別調整に自動反映します。','검진·투약·예방접종·식사·활동을 관리합니다. 저장하고 확인한 검진 결과를 AI 반려동물 건강 모델 보정에 자동 반영합니다.'),
   tiles:[['exam',say('體檢報告','Exam reports','健康診断','건강 검진')],['med',say('用藥紀錄','Medication','投薬記録','투약 기록')],['vax',say('疫苗紀錄','Vaccinations','予防接種','예방접종')],['food',say('飲食與活動','Food & activity','食事と活動','식사와 활동')]]},
  {key:'model',image:'assets/onboarding/scenes/scene_05.webp',title:say('AI 推算生理年齡與整體健康評分','AI biological age & overall wellness','AI推定生理年齢と総合健康スコア','AI 추정 생리 나이와 종합 건강 점수'),
   desc:say('基於前三步的深度分析，Deep AI 依長期有效監測整理完整的健康評分，並結合實際年齡推算 AI 生理年齡；體重與年齡也用於個體化預防建議及適用體檢參考，幫助你掌握寵物的身體狀態、長期變化與值得關注的方向。','Building on the first three steps, Deep AI uses valid long-term readings for a wellness score and combines that score with actual age to estimate AI biological age. Weight and age also personalize preventive advice and applicable exam references, helping you follow changes and what needs attention.','最初の3ステップの分析と有効な長期記録から健康スコアを算出し、実年齢と合わせてAI推定生理年齢を示します。体重と年齢は個別の予防アドバイスや検診基準にも活用し、変化と注意点を分かりやすく伝えます。','앞선 세 단계의 분석과 유효한 장기 기록으로 건강 점수를 만들고 실제 나이와 함께 AI 추정 생리 나이를 제시합니다. 체중과 나이는 맞춤 예방 안내와 적절한 검진 기준에도 활용하여 건강 변화와 주의점을 이해하도록 돕습니다.'),
   tiles:[['age',say('AI 推算生理年齡','AI biological age','AI推定生理年齢','AI 추정 생리 나이')],['wellness',say('整體健康評分','Overall health score','総合健康スコア','종합 건강 점수')]]}
 ];
 // Preserve existing tour actions and stage state. Only the interior scrolls;
 // both action buttons stay at the same bottom position on all four stages.
 tourContent=function(){
  const i=Math.min(3,Math.max(0,Number(state.tourStep)||0)),p=stages()[i],num=String(i+1).padStart(2,'0');
  const hero=`<div class="dp1037-tour-hero ${i===0?'dp1037-four-dogs':''}"><img src="${p.image}" alt="${esc(p.title)}" loading="eager"/></div>`;
  const tiles=p.tiles.length?`<div class="dp1037-tour-tiles ${p.tiles.length===2?'dp1037-two-tiles':''}">${p.tiles.map(([kind,title])=>`<div class="dp1037-tour-tile">${art(kind)}<strong>${esc(title)}</strong></div>`).join('')}</div>`:'';
  const first=i===0?`<div class="dp1061-feature-hero"><div class="dp1061-feature"><strong>24/7</strong><small>${say('全天連續感測','Continuous monitoring','毎日連続センシング','연중 상시 감지')}</small></div><div class="dp1061-feature"><strong>${say('每秒','Every second','毎秒','매초')}</strong><small>${say('捕捉心跳與呼吸節奏','Heart & breathing rhythms','心拍・呼吸リズム','심박·호흡 리듬')}</small></div></div><p class="dp1061-feature-note">${say('利用 <b>BCG 微振動感測</b>，在項圈貼合、訊號有效時連續追蹤。不同於按數分鐘間隔記錄的方案，可保留更完整的變化細節。','<b>BCG motion sensing</b> follows heart and breathing rhythms while the collar fits and signal quality is good. Continuous sensing preserves detail between interval-based checks.','<b>BCGの微振動検知</b>で、装着と信号が良好なとき心拍・呼吸を継続記録。間欠測定の間に起こる変化も捉えやすくなります。','<b>BCG 미세진동 센싱</b>으로 올바른 착용 및 양호한 신호일 때 심박과 호흡을 연속 관찰합니다. 간헐적 기록 사이의 변화를 더 자세히 포착합니다。')} ${say('不同產品的量測間隔可能從數分鐘到約半小時不等；DeepPet 透過優化電源管理，可每秒連續感測。續航目標：藍牙版超過 5 天，4G 版 2–3 天；實際會依使用情況而異。','Other products may measure at intervals ranging from minutes to about half an hour. DeepPet supports second-by-second continuous sensing with optimized power use. Battery targets: over 5 days for Bluetooth, 2–3 days for 4G; actual runtime varies.','製品によっては数分から約30分間隔で測定します。DeepPetは省電力設計で秒単位の連続検知を実現。目標駆動時間はBluetooth版が5日超、4G版が2～3日で、使用条件により変わります。','다른 제품은 수분에서 약 30분 간격으로 측정할 수 있습니다. DeepPet은 전력 관리를 최적화해 초 단위로 연속 감지합니다. 목표 배터리 사용 시간은 블루투스 5일 초과, 4G 2~3일이며 실제 사용 조건에 따라 달라집니다.')}</p>`:`<p>${esc(p.desc)}</p>`;
  return `<section class="dp931-tour dp1037-tour" data-dp1037-stage="${i+1}"><div class="dp1037-tour-scroll" tabindex="0">${hero}<div class="dp1037-tour-copy"><h2>${esc(p.title)}</h2>${first}${p.note?`<div class="dp1037-tour-side-note"><b>4G</b><span>${esc(p.note)}</span></div>`:''}</div>${tiles}</div><footer class="dp1037-tour-footer"><div class="dp931-tour-steps">${[0,1,2,3].map(j=>`<i class="${j===i?'now':j<i?'passed':''}"></i>`).join('')}</div><div class="dp931-tour-actions"><button type="button" data-action="tour-back" ${i===0?'disabled':''}>${say('上一步','Back','戻る','이전')}</button><button type="button" data-action="${i===3?'tour-enter':'tour-next'}">${i===3?say('開始使用','Get started','始める','시작하기'):say('下一個階段','Next','次へ','다음 단계')} →</button></div></footer></section>`;
 };
 const previous=render;
 render=function(reset=false){
  previous(reset);
  const app=document.getElementById('app');if(!app)return;
  // This is *only* a presentation change. Evidence dates are retained in the
  // underlying data model, chart axes and dated Health records.
  if(state.tab==='home'&&!state.detail){
   app.querySelectorAll('.dp-summary-lanes .dp1013-score-evidence,.dp1030-today-care').forEach(n=>n.remove());
  }
  if(state.tab==='deep'&&!state.detail){
   app.querySelectorAll('.dp1013-deep-evidence,.dp105-score-stamp').forEach(n=>n.remove());
  }
  // The two score names are product terminology; never relabel the second one
  // as "physiological rhythm" even if an older render adapter did so.
  for(const el of app.querySelectorAll('.dp-rhythm-lane .dp-lane-copy>strong,.dp931-rhythm-lane .dp-lane-copy>strong')){
   el.textContent=say('身體節奏評分','Body rhythm score','身体リズムスコア','신체 리듬 점수');
  }
  app.querySelectorAll('.app-build-version').forEach(n=>n.textContent='DeepPet Version '+(root.DeepPetBuildVersion||'10.37'));
 };
 root.DeepPetUX1037=Object.freeze({version:'10.37',stages:()=>stages().map(x=>({key:x.key,title:x.title,image:x.image,tileCount:x.tiles.length}))});
 root.DeepPetRelease={...root.DeepPetRelease,version:root.DeepPetBuildVersion||'10.37',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'four-stage-tour-with-fixed-footer-scrollable-content-and-illustrations','uncluttered-score-date-layout',
  'strict-home-tasks-not-logged-context','named-new-pet-with-complete-identity','heart-photo-local-asset-origin-fix']};
})(window);
