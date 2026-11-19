/* DeepPet V10.33 — three restrained visual refinements.
   The battery contract is a real-SDK-only adapter, not a sensor simulation.
   No health scoring, waveform data, routing or persistent pairing state changes. */
(function(root){
 'use strict';
 const locale=(zht,en,ja,ko)=>{
  if(state.lang==='en')return en;
  if(state.lang==='ja')return ja;
  if(state.lang==='ko')return ko;
  return state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zht):zht;
 };
 const batteryBySession=new Map();
 const lastBatteryRequest=new Map();
 const pendingBattery=new Set();
 const baselineObserved=new Map();
 const MAX_BATTERY_AGE=15*60*1000;
 const REQUEST_GAP=60*1000;
 const ownerKey=()=>state.emptyPreview?'blank':`pet:${state.dog}`;
 const isDemoId=id=>/DEMO|SIMULAT|^DP-(?:BT|4G)(?:-\d+)?$/i.test(String(id||''));
 function currentSession(){
  if(state.emptyPreview||state.connected!==true||!state.connectedId||!['bt','4g'].includes(state.deviceType)||isDemoId(state.connectedId))return null;
  const index=state.dog,id=state.connectedId;
  if(root.DeepPetLiveRadioSession?.matches?.(index,id)!==true)return null;
  return {petIndex:index,deviceId:id,type:state.deviceType,petEpoch:state.dpPetEpoch,
   key:`${index}|${id}|${state.deviceType}|${state.dpPetEpoch}`};
 }
 function matchesSession(snapshot){
  const now=currentSession();
  return !!now&&!!snapshot&&now.key===snapshot.key;
 }
 function parseVerifiedBattery(value,snapshot){
  if(!value||typeof value!=='object'||value.verified!==true||value.source!=='sdk'||
     value.petIndex!==snapshot.petIndex||value.deviceId!==snapshot.deviceId||value.type!==snapshot.type||
     typeof value.percent!=='number'||!Number.isInteger(value.percent)||value.percent<0||value.percent>100)return null;
  // The factory bridge must report when it sampled the battery. An inferred
  // timestamp or a stale SDK cache must not be presented as a fresh reading.
  const sampledAt=typeof value.sampledAt==='string'?Date.parse(value.sampledAt):NaN;
  const age=Date.now()-sampledAt;
  if(!Number.isFinite(sampledAt)||age< -5000||age>MAX_BATTERY_AGE)return null;
  return {percent:value.percent,sampledAt};
 }
 function batteryForCurrent(){
  const session=currentSession();if(!session)return null;
  const value=batteryBySession.get(session.key);
  if(!value||Date.now()-value.sampledAt>MAX_BATTERY_AGE)return null;
  return value;
 }
 function displayBattery(value){
  const clockLocale=state.lang==='ja'?'ja-JP':state.lang==='en'?'en-GB':state.lang==='ko'?'ko-KR':state.lang==='zh'?'zh-CN':'zh-TW';
  const time=new Intl.DateTimeFormat(clockLocale,{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value.sampledAt));
  const name=locale('電量','Battery','バッテリー','배터리');
  const updated=locale('最後更新','Updated','最終更新','마지막 갱신');
  return `<span class="dp1033-battery-meta"><span class="dp1033-battery-level" aria-hidden="true">▰</span><strong>${name} ${value.percent}%</strong><span class="dp1033-battery-time">${updated} ${time}</span></span>`;
 }
 const oldDeviceCenter=deviceCenter;
 deviceCenter=function(){
  let html=oldDeviceCenter();
  const value=batteryForCurrent();
  if(!value)return html;
  // Compact inline detail inside the EXISTING device button/card: no new
  // destination, no new button and no interference with the decorative wave.
  return html.replace(/(<button\b[^>]*class="grow dp-device-identity"[^>]*>[\s\S]*?<small>[\s\S]*?<\/small>)(<\/button>)/,
   (_match,content,close)=>content+displayBattery(value)+close);
 };
 function receiveBattery(payload){
  const session=currentSession();
  if(!session)return false;
  const value=parseVerifiedBattery(payload,session);
  if(!value)return false;
  const prior=batteryBySession.get(session.key);
  if(prior&&value.sampledAt<prior.sampledAt)return false;
  batteryBySession.set(session.key,value);
  if(!prior||prior.percent!==value.percent||prior.sampledAt!==value.sampledAt){
   if(state.tab==='me'&&document.querySelector('#app .device-center'))render(false);
  }
  return true;
 }
 async function refreshBattery(){
  const session=currentSession(),bridge=root.DeepPetPairingBridge;
  if(!session||typeof bridge?.getBatteryStatus!=='function'||pendingBattery.has(session.key))return false;
  const now=Date.now();
  if(now-(lastBatteryRequest.get(session.key)||0)<REQUEST_GAP)return false;
  lastBatteryRequest.set(session.key,now);
  pendingBattery.add(session.key);
  try{
   const status=await bridge.getBatteryStatus({petIndex:session.petIndex,deviceId:session.deviceId,type:session.type});
   return matchesSession(session)?receiveBattery(status):false;
  }catch(_error){
   // No percentage, connectivity claim or warning is manufactured on failure.
   return false;
  }finally{pendingBattery.delete(session.key);}
 }
 root.DeepPetBatterySDK=Object.freeze({
  receiveVerifiedStatus:receiveBattery,
  refreshFromSDK:refreshBattery,
  current:()=>{const x=batteryForCurrent();return x?{...x}:null;}
 });

 const oldRender=render;
 render=function(reset=false){
  const previousPet=ownerKey();
  oldRender(reset);
  if(state.emptyPreview||state.connected!==true){
   for(const key of batteryBySession.keys())if(key.startsWith(`${state.dog}|`))batteryBySession.delete(key);
  }
  // Only Me/baseline views can celebrate a GENUINE transition from fewer
  // than 14 valid days to 14 valid days. Already-complete showcase pets do
  // not replay the celebration whenever the screen opens.
  if(!state.emptyPreview&&state.tab==='me'){
   // The same baseline calendar can be shown as an existing Me standalone
   // page or its original modal overlay; prefer the currently visible one.
   const target=document.querySelector('#overlay-root .baseline-detail-wrap')||
    document.querySelector('#app .baseline-detail-wrap')||document.querySelector('#app .dp-owner-baseline-me');
   if(target){
    try{
     const baseline=baselineProfile(),ready=baseline.ready===true&&baseline.days>=14;
     const last=baselineObserved.get(previousPet);
     baselineObserved.set(previousPet,ready);
     if(last===false&&ready){
      target.classList.add('dp1033-baseline-finished');
      const validChecks=target.querySelectorAll?.('.quality-days-grid .valid')||[];
      validChecks[validChecks.length-1]?.classList.add('dp1033-last-valid-glow');
     }
    }catch(_error){/* Baseline engine, not visuals, owns all validity decisions. */}
   }
  }
  if(state.tab==='me'&&document.querySelector('#app .device-center'))void refreshBattery();
  const buildVersion=typeof root.DeepPetBuildVersion==='string'&&/^\d+\.\d+$/.test(root.DeepPetBuildVersion)?root.DeepPetBuildVersion:null;
  document.querySelectorAll('#app .app-build-version').forEach(node=>{node.textContent=buildVersion?`DeepPet Version ${buildVersion}`:'DeepPet Version';});
 };
 // At most one SDK battery request a minute while the user is looking at Me.
 // Hidden tabs or absent SDK bridges cause no radio requests.
 if(typeof setInterval==='function')setInterval(()=>{
  if(document.visibilityState!=='hidden'&&state.tab==='me'&&document.querySelector('#app .device-center'))void refreshBattery();
 },60000);
 root.DeepPetRelease={...root.DeepPetRelease,version:root.DeepPetBuildVersion||root.DeepPetRelease?.version,integrity:[
  ...(root.DeepPetRelease?.integrity||[]),
  'heart-result-one-shot-60s-halo',
  'verified-14-day-baseline-transition-only',
  'real-sdk-battery-percent-and-sampled-at-only',
  'per-pet-per-radio-session-battery-isolation',
  'no-unsupported-battery-or-fabricated-timestamps'
 ]};
})(window);
