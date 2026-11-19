/* DeepPet V9.26 | Me > My device > collar-fitting reminder preview.
   This module never turns off urgent cardiopulmonary alerts. */
(function(root){'use strict';
const S='deepPet-wear-reminders-v926';
const petKey=()=>typeof dpCurrentPetId==='function'?dpCurrentPetId():`demo-${state.dog}`;
// SDK sessions identify a pet by its numeric storage index, while the Me
// settings use its stable public ID. Normalize both to the SAME pet key so
// a disabled reminder and a re-wear status never leak across pet switches.
const canonicalKey=id=>{if(id===undefined||id===null||String(id)==='')return petKey();const raw=String(id);return /^\d+$/.test(raw)&&typeof dpPetId==='function'?dpPetId(Number(raw))||raw:raw;};
const localized=(z,e,k,j)=>state.lang==='en'?e:state.lang==='ko'?k:state.lang==='ja'?j:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(z):z;
const enabled=(key=petKey())=>{try{const x=JSON.parse(localStorage.getItem(S)||'{}');return x[key]!==false;}catch{return true;}};
const setEnabled=(flag,key=petKey())=>{try{const x=JSON.parse(localStorage.getItem(S)||'{}');x[key]=!!flag;localStorage.setItem(S,JSON.stringify(x));}catch{};};
let popup=false,popupPetId=null; const lastStatus=new Map(),lastEvidence=new Map();
const collarIcon='<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" aria-hidden="true"><path d="M9 8v15c0 8 5 14 15 14s15-6 15-14V8"/><path d="M9 8h30v9H9z"/><path d="M21 17h6v5h-6z"/><path d="M20 37v5h8v-5"/></svg>';
const htmlEscape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function wearSettings(){const isOn=enabled();return `<section class="card dp926-wear-card" id="dp926-wear-card"><div class="dp926-wear-title"><span class="dp926-wear-icon" aria-hidden="true">${collarIcon}</span><div><strong>${localized('項圈佩戴提醒','Collar fit reminder','목걸이 착용 알림','首輪装着リマインダー')}</strong><small>${localized('連續訊號不足時，提醒檢查項圈貼合與連接','Check collar fit and connection after sustained signal loss','신호가 계속 부족하면 목걸이 착용과 연결을 확인하세요','信号が継続して不足したら装着と接続を確認')}</small></div></div><div class="dp926-wear-row"><span>${localized('提醒開關','Reminder switch','알림 스위치','通知スイッチ')}</span><button class="dp926-switch ${isOn?'on':''}" role="switch" aria-checked="${isOn}" aria-label="${localized('開關佩戴提醒','Toggle fitting reminders','착용 알림 전환','装着通知の切替')}" data-action="dp926-wear-toggle"><i></i></button></div><button type="button" class="dp926-test" data-action="dp926-wear-test">${localized('測試：模擬未佩戴好','Test: loose collar contact','테스트: 느슨한 목걸이','テスト：装着不良を再現')} <span>›</span></button><button type="button" class="dp926-test dp1044-wear-test" data-action="dp1044-wear-test-radio">${localized('測試：模擬訊號中斷','Test: signal interrupted','테스트: 신호 끊김','テスト：信号途絶')} <span>›</span></button><p class="dp926-wear-tip">${localized('兩種測試只預覽提醒樣式，不會斷開配對、修改健康分數或關閉緊急提醒。','Both previews leave device pairing, health scores and emergency alerts unchanged.','두 테스트 모두 연결 상태·건강 점수·긴급 알림에 영향을 주지 않습니다.','いずれも接続・スコア・緊急通知には影響しません。')}</p></section>`;}
function canonicalWearSettings(){
 let html=wearSettings();
 html=html.replace(localized('測試：模擬未佩戴好','Test: loose collar contact','테스트: 느슨한 목걸이','テスト：装着不良を再現'),
   localized('測試佩戴提醒','Test collar fit alert','착용 알림 테스트','装着通知テスト'));
 html=html.replace(localized('測試：模擬訊號中斷','Test: signal interrupted','테스트: 신호 끊김','テスト：信号途絶'),
   localized('測試訊號中斷提醒','Test signal-loss alert','신호 손실 알림 테스트','信号途絶通知テスト'));
 if(selectedBlank()){
  // Preserve all device-assistant rows and controls, but do not allow a pet
  // that has not been created to configure settings or open test dialogs.
  html=html.replace(/(<button\b[^>]*\bdata-action="(?:dp926-wear-toggle|dp926-wear-test|dp1044-wear-test-radio)"[^>]*)(>)/g,
   '$1 disabled aria-disabled="true"$2');
  html=html.replace(/(<p class="dp926-wear-tip">)[\s\S]*?(<\/p>)/,
   '$1'+localized('建立寵物檔案後可設定項圈提醒。','Add a pet to configure collar alerts.','반려동물 등록 후 알림을 설정하세요.','ペット登録後に通知を設定できます。')+'$2');
 }
 return html;
}
function close(){document.getElementById('dp926-wear-popup')?.remove();popup=false;popupPetId=null;}
function show(isDemo=false,key=petKey(),name='',scenario='contact'){
 if(popup)close();popup=true;popupPetId=key;
 const petLabel=htmlEscape(name||(key===petKey()?currentDog()?.name:''));
 const radioPreview=isDemo&&scenario==='radio';
 const heading=radioPreview?localized('訊號暫時中斷','Signal temporarily unavailable','신호가 일시적으로 끊겼습니다','信号が一時的に途絶しました'):localized('請重新佩戴項圈','Please re-fit the collar','목걸이를 다시 착용해 주세요','首輪を装着し直してください');
 const explanation=radioPreview?localized('項圈的連續心搏與呼吸訊號未能取得。請檢查裝置電量、連接及佩戴位置；訊號恢復且穩定後才會更新測量結果。','No continuous heart and breathing signal is available. Check battery, connection and collar position. Measurements update only after the signals settle.','심박·호흡 신호가 중단되었습니다. 배터리와 연결, 착용 위치를 확인하세요.','心拍と呼吸の連続信号を取得できません。電池・接続・装着位置をご確認ください。'):localized('心搏與呼吸訊號同時歸零或急降，暫時無法可靠量測。請重新佩戴、確認感測器貼合與裝置連接，恢復穩定訊號後再量測。','Both heart and breathing signals dropped to zero or near zero. Re-fit the collar, check sensor contact and connection, then measure again after the signals recover.','심박·호흡 신호가 동시에 0 또는 매우 낮은 값으로 떨어졌습니다. 착용과 연결을 확인한 뒤 다시 측정하세요.','心拍と呼吸の信号が同時にゼロ付近まで低下しました。装着し直し、接触と接続を確認して再測定してください。');
 const wrap=document.createElement('div');wrap.id='dp926-wear-popup';wrap.className='dp926-shade';
 wrap.innerHTML=`<div class="dp926-popup" role="dialog" aria-modal="true" aria-labelledby="dp926-wear-heading"><button class="dp926-popup-close" data-action="dp926-wear-close" aria-label="${localized('關閉','Close','닫기','閉じる')}">×</button><div class="dp926-popup-mark" aria-hidden="true">${collarIcon}</div>${petLabel?`<div class="dp926-popup-pet">${petLabel}</div>`:''}<h2 id="dp926-wear-heading">${heading}</h2><p>${explanation}</p><div class="dp926-message-note">${localized('訊號缺失不代表心跳或呼吸停止，也不會產生健康零分。若寵物有明顯呼吸困難、倒下或無反應，請立即尋求獸醫急診。','Signal loss does not mean breathing or heartbeat stopped; it does not cause a zero health score. Seek emergency veterinary care for distress or collapse.','신호 손실은 호흡·심장 정지나 건강 점수 0점을 뜻하지 않습니다. 실제 응급 증상에는 즉시 진료를 받으세요.','信号喪失は心停止・呼吸停止や健康スコア0点を意味しません。実際の症状があれば緊急受診してください。')}</div>${isDemo?`<small class="dp926-demo-label">${localized('僅預覽提醒 · 未更改真實裝置狀態','Preview only · device unchanged','미리보기 · 실제 장치 상태는 유지됩니다','表示テストのみ・実機状態は変更なし')}</small>`:''}<button class="dp926-popup-primary" data-action="dp926-wear-close">${localized('知道了，我會檢查','OK, I’ll check','확인하겠습니다','確認します')}</button>${isDemo?'':`<button class="dp926-popup-secondary" data-action="dp926-wear-disable">${localized('不再提醒佩戴','Turn off fit reminders','착용 알림 끄기','装着通知をオフ')}</button>`}</div>`;
 document.body.appendChild(wrap);
}
function process(input){
 const key=canonicalKey(input?.petId);const result=root.DeepPetWearDetector926.classify(input||{});
 // Do not repeat popups on every packet. Re-arm only after normal signal returns.
 if(result.kind==='normal')lastStatus.set(key,'normal');
 if(result.kind==='normal'||result.wearReminder)lastEvidence.set(key,{kind:result.kind,at:Date.now()});
 if(result.wearReminder&&enabled(key)&&lastStatus.get(key)!=='notified'){
  lastStatus.set(key,'notified');show(false,key,input?.petName||'');
 }
 return result;
}
const oldAction=onAction;
onAction=function(el){switch(el?.dataset?.action){
 case 'dp926-wear-test':{const r=root.DeepPetWearDetector926.classify(root.DeepPetWearDetector926.synthetic());if(r.wearReminder)show(true);return;}
 case 'dp1044-wear-test-radio':show(true,petKey(),'','radio');return;
 case 'dp926-wear-toggle':setEnabled(!enabled());if(enabled())lastStatus.delete(petKey());render(false);return;
 case 'dp926-wear-close':close();return;
 case 'dp926-wear-disable':setEnabled(false,popupPetId||petKey());close();if(state.tab==='me'&&!state.detail)render(false);return;
 default:return oldAction(el);
}};
const oldRender=render;
render=function(reset=false){oldRender(reset);
 if(popup&&popupPetId!==petKey())close();
 const app=document.getElementById('app');if(!app)return;
 // All Me states share the same device assistant. Missing profile/device
 // changes only eligibility and text, never the card's presence or geometry.
 if(state.tab==='me'&&!state.detail){
  const area=app.querySelector('.device-center');if(area&&!app.querySelector('#dp926-wear-card'))area.insertAdjacentHTML('afterend',canonicalWearSettings());
 }
 // Never permit later UX extensions to silently replace the two daily score cards.
 if(state.tab==='home'&&!state.detail&&!selectedBlank()&&!isFreePet()){
  const a=app.querySelector('.dp-health-lane'),b=app.querySelector('.dp-rhythm-lane');
  if(a&&b){a.dataset.dp926Daily='physiol';b.dataset.dp926Daily='rhythm';}
 }
 const label=app.querySelector('.app-build-version');if(label)label.textContent='DeepPet · Version 9.29';
};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&popup){e.preventDefault();close();}},true);
document.addEventListener('click',e=>{if(e.target?.id==='dp926-wear-popup')close();},true);
root.DeepPetWear926={enabled,setEnabled,process,preview:()=>show(true),previewRadio:()=>show(true,petKey(),'','radio'),close,
 statusFor:(key=petKey())=>{const x=lastEvidence.get(canonicalKey(key));return x&&Date.now()-x.at<=15*60000?x.kind:null;},version:'10.05'};
})(window);
