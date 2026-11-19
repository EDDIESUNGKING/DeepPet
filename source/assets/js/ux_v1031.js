/* DeepPet V10.31 — verified pairing celebration and decorative device pulse.
   This layer never changes sensor samples, scores, navigation, or collar ownership. */
(function(root){
 'use strict';
 const say=(zh,en,ja,ko)=>{
  if(state.lang==='ja')return ja;
  if(state.lang==='ko')return ko;
  if(state.lang==='en')return en;
  return state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 };
 let ceremony=null,ceremonySerial=0,ceremonyTimer=0;
 let previewExpires=0,previewOwner=null,previewClearTimer=0;
 const samePet=p=>p&&p.petIndex===state.dog&&p.petEpoch===state.dpPetEpoch;
 const isDemoPair=()=>/DEMO|SIMULAT/i.test(String(state.connectedId||''));
 const previewIsVisible=()=>previewOwner&&samePet(previewOwner)&&Date.now()<previewExpires&&!state.connected;
 const svgWave=`<span class="dp1031-wave-visual" aria-hidden="true">
   <svg class="dp1031-wave-heart" viewBox="0 0 520 105" preserveAspectRatio="none" focusable="false"><defs>
    <linearGradient id="dp1031-ecg-gradient" x1="0" x2="1"><stop offset="0" stop-color="#5a83ff"/><stop offset=".5" stop-color="#53f6e3"/><stop offset="1" stop-color="#65b0ff"/></linearGradient></defs>
    <g class="dp1031-wave-track" fill="none" stroke="url(#dp1031-ecg-gradient)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
     <path d="M0 55 H55 L65 51 L75 55 H98 L109 40 L122 83 L138 13 L154 64 L166 54 H204 L217 57 L234 55 H270 L283 55 H305 L315 51 L325 55 H348 L359 40 L372 83 L388 13 L404 64 L416 54 H454 L467 57 L484 55 H520"/>
     <path transform="translate(520 0)" d="M0 55 H55 L65 51 L75 55 H98 L109 40 L122 83 L138 13 L154 64 L166 54 H204 L217 57 L234 55 H270 L283 55 H305 L315 51 L325 55 H348 L359 40 L372 83 L388 13 L404 64 L416 54 H454 L467 57 L484 55 H520"/>
    </g></svg>
   <svg class="dp1031-wave-breath" viewBox="0 0 520 105" preserveAspectRatio="none" focusable="false"><g class="dp1031-breath-track" fill="none" stroke="#66c6ef" stroke-width="1.7" stroke-linecap="round" opacity=".53">
    <path d="M0 69 C45 69 44 44 88 44 S134 69 176 69 S222 44 264 44 S310 69 352 69 S398 44 440 44 S486 69 520 69"/>
    <path transform="translate(520 0)" d="M0 69 C45 69 44 44 88 44 S134 69 176 69 S222 44 264 44 S310 69 352 69 S398 44 440 44 S486 69 520 69"/>
   </g></svg>
  </span>`;
 const oldDeviceCenter=deviceCenter;
 deviceCenter=function(){
  let html=oldDeviceCenter();
  const paired=state.connected===true,preview=!!previewIsVisible(),synthetic=paired&&isDemoPair();
  if(!paired&&!preview)return html;
  const text=synthetic?say('4G 尚未驗證連線','4G connection not verified','4G接続未確認','4G 연결 미확인'):
   preview?say('尚未連接設備','No device paired','機器は未接続','기기 연결 안 됨'):
   say('配對狀態動效 · 不是即時生理波形','Paired-state animation · not live sensor data','接続状態の演出・生体波形ではありません','연결 효과 · 실시간 생체파형 아님');
  html=html.replace('class="card device-center"',`class="card device-center dp1031-wave-ready ${synthetic||preview?'dp1031-wave-preview':'dp1031-wave-confirmed'}"`);
  html=html.replace('<div class="device-center-top">',`${svgWave}<div class="device-center-top">`);
  if(synthetic){
   html=html.replace(/<span class="pill ok">[^<]*<\/span>/,`<span class="pill dp1031-demo-pill">${say('未核驗','Not verified','未確認','미확인')}</span>`);
   html=html.replace(/<small>[^<]*<\/small>/,`<small>${say('4G GPS 尚未確認設備連線','4G GPS connection unconfirmed','4G GPS接続未確認','4G GPS 연결 미확인')}</small>`);
  }
  return html;
 };
 const oldWizardView=wizardView;
 wizardView=function(){
  const html=oldWizardView();
  if(state.pairStage!==1||typeof root.DeepPetPairingBridge?.findResults==='function')return html;
  return html+`<div class="dp1031-preview-entry"><p>${say('設備配對服務尚未開啟，目前沒有項圈連線。','Device pairing service is unavailable. No collar is connected.','接続サービスが利用できません。首輪は未接続です。','기기 연결 서비스를 이용할 수 없습니다. 현재 연결된 목걸이가 없습니다.')}</p><button type="button" class="dp1031-preview-button" data-action="dp1031-preview-connection">✦ ${say('查看連接效果','View connection experience','接続画面を見る','연결 화면 보기')}</button></div>`;
 };
 const oldModalUI=modalUI;
 modalUI=function(){
  if(state.modal!=='pair-success')return oldModalUI();
  const demo=ceremony?.preview!==false;
  const type=ceremony?.type==='4g'?'4G + GPS':'Bluetooth';
  const heading=demo?say('設備連接畫面','Device connection','機器の接続','기기 연결 화면'):
   say('項圈配對成功！','Collar paired successfully!','首輪の接続が完了しました！','목걸이 연결 완료!');
  const lead=demo?say('目前尚未找到或連接項圈，請在設備配對服務開啟後完成配對。','No collar has been discovered or connected. Pair a collar once the device service is available.','首輪はまだ検出・接続されていません。接続サービスの利用開始後に接続してください。','아직 목걸이를 찾거나 연결하지 않았습니다. 기기 서비스가 활성화되면 연결하세요.'):
   say('設備型號與身分已驗證，已為目前寵物建立配對。','Device identity and model verified. The collar is paired to this pet.','機器のIDと機種を確認し、このペットに接続しました。','기기 ID와 모델 검증을 마치고 해당 반려동물에 연결했습니다.');
  const status=demo?say('未連接','NOT CONNECTED','未接続','미연결'):'VERIFIED PAIRING';
  const next=demo?say('返回設備頁面','Back to devices','機器画面へ戻る','기기 화면으로'):
   say('繼續 · 查看佩戴提示','Continue · Fit guide','次へ・装着ガイド','계속 · 착용 안내');
  const emblem=demo?'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="43"/><path d="M50 30 V58 M50 72 V74"/></svg>':'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="43"/><path d="M28 51 L44 66 L73 34"/></svg>';
  const steps=demo?`<span>○ ${say('搜尋設備','Search device','機器の検索','기기 검색')}</span><span>○ ${say('核驗型號','Verify model','機種の確認','모델 확인')}</span><span>○ ${say('完成配對','Pair device','機器を接続','기기 연결')}</span>`:
   `<span>✓ ${say('找到設備','Found','検出','검색')}</span><span>✓ ${say('確認型號','Verified','確認','인증')}</span><span>✓ ${say('完成配對','Paired','接続','연결')}</span>`;
  return `<div class="dp1031-success-scene ${demo?'dp1031-preview-scene':''}" role="status" aria-live="polite">
    <div class="dp1031-success-stars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="dp1031-success-eyebrow">DEEPPET <span>·</span> ${status}</div>
    <div class="dp1031-success-orbit" aria-hidden="true"><div class="dp1031-orbit dp1031-orbit-one"></div><div class="dp1031-orbit dp1031-orbit-two"></div><div class="dp1031-success-check">${emblem}</div></div>
    <h2>${heading}</h2><p class="dp1031-success-lead">${lead}</p>
    <div class="dp1031-success-device"><span class="dp1031-success-device-icon" aria-hidden="true">${type==='Bluetooth'?'ᛒ':'⌁'}</span><span><small>${say('項圈類型','Collar model','首輪タイプ','목걸이 종류')}</small><strong>DeepPet ${type}</strong></span><span class="dp1031-success-device-tick">${demo?'—':'✓'}</span></div>
    <div class="dp1031-steps">${steps}</div>
    <button type="button" class="dp1031-success-next" data-action="dp1031-success-next">${next} <span aria-hidden="true">→</span></button>
    <small class="dp1031-auto-note">${say('動畫結束後自動繼續','Automatically continues after the animation','演出後に自動で進みます','애니메이션 후 자동 진행')}</small>
   </div>`;
 };
 function startTimer(){
  clearTimeout(ceremonyTimer);const serial=++ceremonySerial;
  ceremonyTimer=setTimeout(()=>{if(serial===ceremonySerial)finishSuccess();},2900);
 }
 function finishSuccess(){
  if(state.modal!=='pair-success')return;
  if(!samePet(ceremony)){ceremony=null;state.modal='';renderModal();return;}
  const p=ceremony;ceremony=null;clearTimeout(ceremonyTimer);++ceremonySerial;
  if(p.preview){
   state.modal='';previewOwner={petIndex:p.petIndex,petEpoch:p.petEpoch};previewExpires=Date.now()+11000;
   render(true);
   clearTimeout(previewClearTimer);
   previewClearTimer=setTimeout(()=>{if(!previewOwner||!samePet(previewOwner))return;previewExpires=0;if(state.tab==='me'&&!state.detail)render();},11200);
  }else{
   // Original one-level wear-fit step remains unchanged and appears automatically.
   state.modal='fit-guide';renderModal();
  }
 }
 const oldOnAction=onAction;
 onAction=function(target){
  const action=target?.dataset?.action;
  if(action==='dp1031-success-next'){finishSuccess();return;}
  if(action==='dp1031-preview-connection'){
   if(state.modal!=='pair-wizard'||state.pairStage!==1||typeof root.DeepPetPairingBridge?.findResults==='function')return;
   // Never call a pairing bridge, mutate connected/type/ID, or claim device telemetry.
   ceremony={preview:true,petIndex:state.dog,petEpoch:state.dpPetEpoch,type:state.pairType};
   state.modal='pair-success';render(true);startTimer();return;
  }
  return oldOnAction(target);
 };
 root.DeepPetConnectionFX=Object.freeze({
  beginVerified(info){
   if(!info||!samePet(info)||state.modal!=='pair-success'||state.connected!==true||
      state.deviceType!==info.type||state.connectedId!==info.deviceId)return false;
   ceremony={preview:false,petIndex:info.petIndex,petEpoch:info.petEpoch,type:info.type};
   startTimer();return true;
  },
  finishSuccess,
  isPreviewActive:()=>!!previewIsVisible()
 });
 const oldRender=render;
 render=function(reset=false){
  oldRender(reset);
  document.querySelectorAll('#app .app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.31');
 };
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.31',integrity:[...(root.DeepPetRelease?.integrity||[]),'verified-pair-success-check-celebration','paired-device-decorative-animated-wave','reduced-motion-success-and-wave','nonpairing-preview-with-visible-disclosure','no-fabricated-battery-percentage']};
})(window);
