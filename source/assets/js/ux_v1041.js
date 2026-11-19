/* DeepPet V10.41 — explicit photo mapping, single-value UI, visual collar pairing.
   Virtual connections are presentation-only and never authenticate sensor data. */
(function(root){'use strict';
 const say=(zh,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const virtualId=id=>/^DP-VIRTUAL-(BT|4G)-\d{3}$/.test(String(id||''));
 const photoPaths=['assets/tour/intro_four_dogs.png','assets/tour/user_stage02.png','assets/tour/user_stage03.png','assets/tour/user_stage04.png'];
 // Source mapping is deliberately ordinal: uploaded image 1 is stage 2, etc.
 const tourBefore=tourContent;
 tourContent=function(){const n=Math.min(3,Math.max(0,Number(state.tourStep)||0)),html=tourBefore();
  return html.replace(/(<div class="dp1037-tour-hero[^>]*><img src=")[^"]+/,`$1${photoPaths[n]}`);
 };
 // Never revive a preview connection merely from saved local pairing metadata.
 const originalLiveMatch=root.DeepPetLiveRadioSession?.matches;
 if(typeof originalLiveMatch==='function')root.DeepPetLiveRadioSession=Object.freeze({matches:(index,id)=>!virtualId(id)&&originalLiveMatch(index,id)});
 let scanSerial=0,pairSerial=0;
 const testDevices=type=>[1,2,3,4].map((n)=>({id:`DP-VIRTUAL-${type==='4g'?'4G':'BT'}-${String(n).padStart(3,'0')}`,name:`DeepPet ${type==='4g'?'4G + GPS':'Bluetooth'} ${String(n).padStart(2,'0')}`,signal:n===1?'●●●●':n===2?'●●●○':n===3?'●●○○':'●○○○'}));
 const virtualResults=()=>{const s=state.dp1041Scan;return s&&s.ready&&s.pet===state.dog&&s.epoch===state.dpPetEpoch&&s.type===state.pairType?testDevices(s.type):[]};
 const realSearch=dpPairSearchResults;
 dpPairSearchResults=function(){return typeof root.DeepPetPairingBridge?.findResults==='function'?realSearch():virtualResults()};
 const previousWizard=wizardView;
 wizardView=function(){let html=previousWizard();if(state.pairStage===1&&typeof root.DeepPetPairingBridge?.findResults!=='function'){
  html=html.replace(/<div class="dp1031-preview-entry">[\s\S]*?<\/div>\s*$/,'');
  if(state.dp1041Scan&&!state.dp1041Scan.ready)html=html.replace(/<h3>[^<]+<\/h3>/,`<h3>${say('正在搜尋可連接的項圈…','Finding nearby collars…','接続可能な首輪を検索中…','연결 가능한 목걸이 검색 중…')}</h3>`);
 }
  if(virtualId(state.pairSelected)&&typeof root.DeepPetPairingBridge?.pair!=='function'){
   if(state.pairStage===2)html=html.replace(/<h3>[^<]+<\/h3>/,`<h3>${say('確認選擇的項圈','Confirm your chosen collar','選択した首輪の確認','선택한 목걸이 확인')}</h3>`);
   if(state.pairStage===3)html=html.replace(/<h3>[^<]+<\/h3>/,`<h3>${say('正在建立連線…','Connecting to collar…','首輪に接続中…','목걸이 연결 중…')}</h3>`);
  }
  return html;};
 function virtualPairOk(){const s=state.dp1041VirtualPair;return !!(s&&state.connected&&state.dog===s.pet&&state.dpPetEpoch===s.epoch&&state.connectedId===s.id&&virtualId(s.id))}
 const modalBefore=modalUI;
 modalUI=function(){if(state.modal!=='pair-success'||!virtualPairOk())return modalBefore();
  const type=state.deviceType==='4g'?'4G + GPS':'Bluetooth';
  return `<div class="dp1041-success" role="status" aria-live="polite"><div class="dp1041-connect-check" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27"/><path d="m18 32 10 10 19-21"/></svg></div><p class="dp1041-success-kicker">DEEPPET · ${type}</p><h2>${say('項圈已連接','Collar connected','首輪の接続が完了','목걸이 연결됨')}</h2><p>${esc(currentDog().name)} · ${say('可以開始使用項圈功能','Ready for collar features','首輪の機能をご利用いただけます','목걸이 기능을 사용할 수 있습니다')}</p><div class="dp1041-success-steps"><span>✓ ${say('找到設備','Found','検出','발견')}</span><span>✓ ${say('建立連線','Connected','接続','연결')}</span><span>✓ ${say('完成','Done','完了','완료')}</span></div><button type="button" class="cta full" data-action="dp1041-pair-done">${say('完成','Done','完了','완료')} →</button></div>`;
 };
 const actionBefore=onAction;
 onAction=function(target){const action=target?.dataset?.action;
  if(action==='dp1041-pair-done'&&state.modal==='pair-success'&&virtualPairOk()){state.modal='';state.pairStage=0;render(true);return;}
  if(action==='garden-gps-demo'){toast(say('附近地圖需要連接 4G 項圈','Nearby map requires a connected 4G collar','周辺地図には4G首輪の接続が必要です','주변 지도는 4G 목걸이 연결이 필요합니다'));return;}
  if(action==='set-garden-mode'&&['map','list'].includes(target?.dataset?.mode)&&!(gpsForCurrentPet()&&state.gpsEnabled)){toast(say('連接 4G 項圈後可查看地圖與列表','Connect a 4G collar to access map and list','4G首輪で地図と一覧が利用できます','4G 목걸이 연결 후 지도와 목록을 볼 수 있습니다'));return;}
  if(action==='pair-scan'&&state.pairType&&typeof root.DeepPetPairingBridge?.findResults!=='function'){
   const serial=++scanSerial,pet=state.dog,epoch=state.dpPetEpoch,type=state.pairType;
   state.dp1041Scan={pet,epoch,type,ready:false};state.pairStage=1;root.__dpPairScanVisualBusy=true;renderModal();
   setTimeout(()=>{const s=state.dp1041Scan;if(serial!==scanSerial||!s||s.pet!==state.dog||s.epoch!==state.dpPetEpoch||s.type!==state.pairType||state.modal!=='pair-wizard'||state.pairStage!==1)return;s.ready=true;root.__dpPairScanVisualBusy=false;renderModal();},750);return;
  }
  if(action==='pair-commit'&&virtualId(state.pairSelected)&&typeof root.DeepPetPairingBridge?.pair!=='function'){
   const device=virtualResults().find(x=>x.id===state.pairSelected);
   if(!device||selectedBlank()||!root.DeepPetPersonalization941?.profileComplete?.(currentDog(),true)){toast(say('請先完成寵物的基本資料','Complete the pet profile first','ペット情報を登録してください','반려동물 정보를 먼저 등록하세요'));return;}
   const serial=++pairSerial,pet=state.dog,epoch=state.dpPetEpoch,type=state.pairType,id=device.id;
   state.pairStage=3;renderModal();
   setTimeout(()=>{if(serial!==pairSerial||state.dog!==pet||state.dpPetEpoch!==epoch||state.pairSelected!==id||state.pairType!==type||state.modal!=='pair-wizard'||state.pairStage!==3)return;
    // The same fixture ID may not belong to two pet profiles at once.
    for(const [owner,record] of Object.entries(state.devicesByPet||{}))if(Number(owner)!==pet&&record?.connectedId===id)state.devicesByPet[owner]={connected:false,deviceType:null,connectedName:'',connectedId:'',gpsEnabled:false,geofenceEnabled:false};
    state.connected=true;state.connectedId=id;state.deviceType=type;state.connectedName=device.name;state.gpsEnabled=type==='4g';state.gpsDeviceOwner=type==='4g'?pet:null;state.geofenceEnabled=false;state.gardenGpsDemo=false;state.gardenDemoGpsPet=null;state.gardenMode='map';
    state.dp1041VirtualPair={pet,epoch,id,type};dpRememberDevice();if(typeof persist==='function')persist();state.tab='me';state.detail=null;state.modal='pair-success';render(true);
   },1300);return;
  }
  return actionBefore(target);
 };
 const oldGarden=gardenView;
 gardenView=function(){if(gpsForCurrentPet()&&state.gpsEnabled)return oldGarden();
  return `<div class="garden-overview dp1041-garden-locked"><div class="garden-top"><span class="garden-kicker">DeepPet</span><h3>${say('附近的寵物','Nearby pets','近くのペット','주변 반려동물')}</h3></div><div class="garden-locked"><span class="dp1041-lock-icon" aria-hidden="true">⌖</span><b>${say('連接 4G 項圈即可使用','Connect a 4G collar to continue','4G首輪の接続が必要です','4G 목걸이를 연결해 주세요')}</b><p>${say('藍牙版專注健康監測；附近寵物地圖與列表需 4G 項圈。','Bluetooth provides health monitoring. A 4G collar is required for the nearby-pet map and list.','Bluetooth版は健康管理用。地図と一覧には4G版が必要です。','블루투스는 건강 모니터링 전용이며 지도와 목록은 4G가 필요합니다.')}</p><button class="cta full" type="button" data-action="device-find">${say('連接 4G 項圈','Pair a 4G collar','4G首輪を接続','4G 목걸이 연결')}</button></div></div>`;
 };
 const cleanupScores=(app)=>{
  for(const lane of app.querySelectorAll('.dp-summary-lanes .dp-summary-lane')){
   lane.querySelectorAll('.dp999-daily-delta,.dp1039-day-delta,.dp105-score-stamp,.dp1013-score-evidence').forEach(e=>e.remove());
   const changes=[...lane.querySelectorAll('.dp1040-score-change')];changes.slice(1).forEach(e=>e.remove());
   const first=changes[0];if(first){const title=lane.querySelector('.dp1040-score-title');if(title&&first.parentElement!==title)title.append(first);}
  }
 };
 function completeProfileInHero(app){
  app.querySelectorAll('.dp1040-pet-basics').forEach(x=>x.remove());
  if(state.tab!=='home'||state.emptyPreview||!dp58FreshPet()||state.detail)return;
  const pet=currentDog(),hero=app.querySelector('.dp935-empty-home .dp935-empty-hero'),overlay=hero?.querySelector('.hero-overlay');if(!overlay)return;
  const breed=pet.breed?.[state.lang]||pet.breed?.en||pet.breed?.zh||'—';
  let identity=overlay.querySelector('.dp1039-profile-identity');if(!identity){identity=document.createElement('div');identity.className='dp1039-profile-identity';overlay.append(identity);}
  identity.innerHTML=`<span>${say('名字','Name','名前','이름')}: ${esc(pet.name)}</span><span>${say('品種','Breed','品種','품종')}: ${esc(breed)}</span><span>${say('年齡','Age','年齢','나이')}: ${esc(pet.age)} ${say('歲','yr','歳','세')}</span><span>${say('體重','Weight','体重','체중')}: ${esc(pet.weight)} kg</span>`;
 }
 function healthCleanup(app){const section=app.querySelector('.dp941-prevention');if(!section)return;
  section.querySelectorAll('.dp1039-prevention-intro,.dp1011-prevention-intro,.dp941-prevention-note').forEach(e=>e.remove());
  const heading=section.querySelector('.dp941-prevention-heading');if(!heading)return;
  const p=document.createElement('p');p.className='dp1041-prevention-intro';p.textContent=say('依據寵物的品種、年紀、體重，結合日常的健康紀錄，由 DeepPet AI 計算引擎推估值得留意的健康重點。','DeepPet AI identifies health priorities from your pet’s breed, age, weight and everyday health records.','品種・年齢・体重と日常の健康記録からDeepPet AIが注目点を推定します。','품종·나이·체중과 일상 건강 기록을 바탕으로 DeepPet AI가 건강 관리 포인트를 제안합니다.');heading.after(p);
 }
 function deepStatuses(app){
  const view=app.querySelector('.dp-owner-deep');if(!view)return;
  const engine=root.DeepPetUX1040;
  // Only a status under the score ring is retained; duplicated heading grades
  // and duplicate button decorations cannot compete for this space.
  for(const col of view.querySelectorAll('.dp903-score-col,.dp901-score-col,.dp1040-score-stack')){
   col.querySelectorAll('.dp1040-status').forEach((e,i)=>{if(i)e.remove();});
  }
  for(const head of view.querySelectorAll('.dp-sleep-period-score-head,.dp-owner-status-heading,.dp-heart-period-overall')){
   const ring=head.querySelector('.dp-status-score[data-score]');if(!ring||ring.dataset.score===''||ring.dataset.score==null||!Number.isFinite(Number(ring.dataset.score)))continue;
   let stack=ring.closest('.dp1040-score-stack');
   if(!stack){stack=document.createElement('div');stack.className='dp1040-score-stack';ring.before(stack);stack.append(ring);}
   stack.querySelectorAll('.dp1040-status').forEach((el,i)=>{if(i)el.remove();});
   let status=stack.querySelector('.dp1040-status');const n=Number(ring.dataset.score);
   if(!status){status=document.createElement('span');stack.append(status);}
   status.className=`dp1040-status dp1040-tier-${engine.tier(n)}`;status.textContent=engine.label(n);
   status.dataset.dp1040Score=String(n);status.dataset.dp1040Key=head.classList.contains('dp-sleep-period-score-head')||Number(state.deepType)===1?'sleep':Number(state.deepType)===0?'cardio':'activityRecovery';
   status.setAttribute('role','button');status.tabIndex=0;
   head.querySelectorAll(':scope > .dp1039-risk-chip,:scope > .dp1040-status').forEach(e=>e.remove());
  }
 }
 const previousRender=render;
 render=function(reset=false){previousRender(reset);const app=document.getElementById('app');if(!app)return;
  if(state.tab==='home'&&!state.detail)cleanupScores(app);
  if(state.tab==='home'||state.tab==='me')completeProfileInHero(app);
  if(state.tab==='health'&&!state.detail)healthCleanup(app);
  if(state.tab==='deep'&&!state.detail)deepStatuses(app);
  app.querySelectorAll('.app-build-version').forEach(e=>e.textContent='DeepPet Version '+(root.DeepPetBuildVersion||'10.41'));
 };
 root.DeepPetUX1041=Object.freeze({version:'10.41',photoPaths,virtualId,testDevices,virtualResults,virtualPairOk});
 root.DeepPetRelease={...root.DeepPetRelease,version:root.DeepPetBuildVersion||'10.41',integrity:[...(root.DeepPetRelease?.integrity||[]),'exact-three-user-tour-images','single-home-delta','one-hero-profile-identity','pale-card-backgrounds','virtual-collar-pairing-with-no-radio-authentication','4g-only-nearby-map-list']};
})(window);
