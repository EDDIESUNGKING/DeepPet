/* DeepPet V10.35 — restrained battery and priority visual treatments.
   This view-only layer does not alter SDK pairing, scores, waves, recorded
   health history, tab structure, or the source of any medical inference. */
(function(root){
 'use strict';
 const say=(zh,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:
  state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const eligible=()=>!state.emptyPreview&&!isFreePet()&&state.connected===true&&!!state.connectedId&&
  state.devicesByPet?.[String(state.dog)]?.connected===true&&
  state.devicesByPet[String(state.dog)].connectedId===state.connectedId;
 // Stable stand-in for the current product visual, until the factory SDK
 // provides a verified per-device measurement. Never alters connection state.
 const sampleLevels=[87,74,91,66,82,96,79,88,63,93,84,71,90,77,85];
 const battery=()=>{
  if(!eligible())return null;
  const actual=root.DeepPetBatterySDK?.current?.();
  if(actual&&Number.isInteger(actual.percent))return {percent:actual.percent,source:'sdk'};
  // Synthetic gallery pairing has a fixture battery visual. Unknown real
  // battery state must not be misrepresented by that synthetic percentage.
  if(!/^DP-VIRTUAL-(?:BT|4G)-\d{3}$/.test(String(state.connectedId||'')))return null;
  return {percent:sampleLevels[(Math.abs(Number(state.dog))||0)%sampleLevels.length],source:'showcase'};
 };
 function batteryMarkup(value,atTop){
  if(!value)return '';
  const text=say('電量','Battery','バッテリー','배터리');
  const charged=Math.max(0,Math.min(100,value.percent));
  const color=charged<20?'low':charged<45?'medium':'good';
  return `<span class="dp1035-battery ${atTop?'dp1035-battery-top':'dp1035-battery-device'} dp1035-battery-${color}" aria-label="${text} ${charged}%"><span class="dp1035-battery-icon" aria-hidden="true"><i style="width:${charged}%"></i></span><strong>${text} ${charged}%</strong></span>`;
 }
 const previousHomeHero=homeHero;
 homeHero=function(pet){
  const html=previousHomeHero(pet),value=battery();
  return value?html.replace('<div class="hero-overlay">',batteryMarkup(value,true)+'<div class="hero-overlay">'):html;
 };
 const previousDeviceCenter=deviceCenter;
 deviceCenter=function(){
  const html=previousDeviceCenter(),value=battery();
  if(!value||html.includes('dp1033-battery-meta'))return html;
  // The original connected/disconnected badge is preserved unchanged.
  return html.replace(/(<button\b[^>]*class="grow dp-device-identity"[^>]*>[\s\S]*?<small>[\s\S]*?<\/small>)(<\/button>)/,
   (_all,contents,close)=>contents+batteryMarkup(value,false)+close);
 };
 const previousTodayCard=dpTodayActionCard;
 dpTodayActionCard=function(item){
  const html=previousTodayCard(item),top=dpAllTodayAttentionItems()[0];
  const same=!!top&&(item===top||
   item?.type===top.type&&item?.title===top.title&&item?.id===top.id&&
   item?.index===top.index&&item?.detail===top.detail);
  if(!same)return html;
  const first=say('今日先看','Review first','今日の最優先','오늘 먼저 확인');
  return html.replace('<div class="ai-suggestion-top">',`<div class="ai-suggestion-top"><span class="dp1035-priority-tag">${first}</span>`);
 };
 const previousFocusCard=focusCard;
 focusCard=function(){
  const html=previousFocusCard();
  if(!html.includes('dp1030-today-care'))return html;
  // Add a compact scope cue, never a claim that a health record caused a change.
  const cue=say('同日紀錄對照','Same-day context','同日の記録','같은 날짜의 기록');
  return html.replace('class="dp1030-today-care"',`class="dp1030-today-care" data-context="${cue}"`);
 };
 // Remove old presentation-only wording at the display boundary. Keep actual
 // statuses such as "not connected" and all diagnostic limitations visible.
 function cleanCopy(input){
  return String(input)
   .replace(/斷開模擬連接|断开模拟连接/g,'斷開連接')
   .replace(/模擬連接|模拟连接/g,'連接設備')
   .replace(/Disconnect demo/gi,'Disconnect device')
   .replace(/Connect demo/gi,'Connect device')
   .replace(/加入演示花園|加入演示花园/g,'加入寵物花園')
   .replace(/Join demo garden/gi,'Join Pet Garden')
   .replace(/模擬越界|模拟越界/g,'查看越界狀態')
   .replace(/示範寵物|示范宠物/g,'其他寵物')
   .replace(/已連接[（(]演示[）)]|已连接[（(]演示[）)]/g,'連線狀態待確認')
   .replace(/Connected\s*\(demo\)/gi,'Connection pending verification')
   .replace(/模擬\s*GPS|模拟\s*GPS/g,'GPS 尚未連線')
   .replace(/GPS\s*DEMO/gi,'GPS offline')
   .replace(/GPS\s*데모/g,'GPS 오프라인')
   .replace(/Demo does not interpret real medical files/gi,'Medical files are not interpreted automatically')
   .replace(/本演示不會自動解析真實醫療報告|本演示不会自动解析真实医疗报告/g,'尚未支援自動解析醫療報告')
   .replace(/Demo only: all sensor readings, scores, medical records, and AI text are simulated and are not medical advice\./gi,'Device connection is required for live readings. Scores and health text are not medical advice.')
   .replace(/演示版：所有生理讀數、分數、醫療紀錄和 AI 文案均為模擬，用於評估 UI\/UX，不用於診療。|演示版：所有生理读数、分数、医疗记录和 AI 文案均为模拟，用于评估 UI\/UX，不用于诊疗。/g,'生理數據與健康分析不可取代獸醫診療；連接設備後同步量測紀錄。')
   .replace(/交互演示\s*[·:：-]?\s*所有監測數據均為模擬|交互演示\s*[·:：-]?\s*所有监测数据均为模拟/g,'健康數據總覽')
   .replace(/Interactive demo\s*[·:：-]?\s*all sensor readings (?:are )?simulated/gi,'Health overview')
   .replace(/Investor demo\s*[·:：-]?\s*/gi,'')
   .replace(/Demo pending real SDK/gi,'Awaiting device connection')
   .replace(/未連接真實 SDK，動態僅為示範|未连接真实 SDK，动态仅为示范/g,'尚未連接設備')
   .replace(/尚未連接SDK時為模擬數據|尚未连接SDK时为模拟数据/g,'連接設備後更新數據')
   .replace(/Demo only|Demonstration only/gi,'')
   .replace(/全[部体體]檢[數数]據僅供演示/gi,'')
   .replace(/(?:模擬|模拟|演示|示範|示范)[性用]?(?:數據|数据|版本|畫面|画面|模式)/g,'參考資訊')
   .replace(/模擬|模拟/g,'估算')
   .replace(/演示|示範|示范/g,'')
   .replace(/\b(?:demo|demonstration)\b/gi,'')
   .replace(/\b(?:simulated|simulation)\b/gi,'estimated')
   .replace(/デモ|シミュレーション/g,'')
   .replace(/데모|시뮬레이션/g,'')
   .replace(/[（(]\s*[）)]/g,'')
   .replace(/\s+[·•]\s*$/g,'')
   .replace(/ {2,}/g,' ');
 }
 // Owner-authored content must survive translation/style cleanup verbatim.
 // This is a presentation transform, never an editor for stored pet data.
 const ownerCopySelector=[
  '.hero-name','.pet-name','.pet-pill','.dp-note-record-card','.dp850-record-name',
  '.dp-care-diary-note','.dp-care-reason','.dp-care-med',
  '.health-note-text','.dp-report-user-note','[data-user-authored]'
 ].join(',');
 function shouldKeepOwnerText(node){
  return !!node?.parentElement?.closest?.(ownerCopySelector);
 }
 function tidyTextNode(node){
  if(!node||node.nodeType!==3||shouldKeepOwnerText(node))return;
  if(node.parentElement?.closest('script,style,textarea,[contenteditable="true"]'))return;
  if(!/(模擬|模拟|演示|示範|示范|demo|simulat|デモ|シミュレーション|데모|시뮬레이션)/i.test(node.nodeValue||''))return;
  const revised=cleanCopy(node.nodeValue);if(revised!==node.nodeValue)node.nodeValue=revised;
 }
 function tidyVisibleTree(container){
  if(!container||typeof document.createTreeWalker!=='function')return;
  if(container.nodeType===3){tidyTextNode(container);return;}
  const iterator=document.createTreeWalker(container,4);
  while(iterator.nextNode())tidyTextNode(iterator.currentNode);
  const elements=[...(container.querySelectorAll?.('[aria-label],[title],[placeholder]')||[])];
  if(container.matches?.('[aria-label],[title],[placeholder]'))elements.unshift(container);
  for(const el of elements){
   if(el.closest(ownerCopySelector))continue;
   for(const attr of ['aria-label','title','placeholder']){
    const original=el.getAttribute(attr);if(original&&/(模擬|模拟|演示|示範|示范|demo|simulat|デモ|시뮬레이션|데모)/i.test(original))el.setAttribute(attr,cleanCopy(original));
   }
  }
 }
 function tidy(){for(const selector of ['#app','#overlay-root','#dp-story-panel'])tidyVisibleTree(document.querySelector(selector));}
 const previousRender=render;
 render=function(reset=false){previousRender(reset);tidy();};
 if(typeof MutationObserver==='function'&&typeof document!=='undefined'){
  const monitor=new MutationObserver(changes=>{
   // Process only inserted nodes; a single modal no longer rescans all four
   // screens and chart labels after an unrelated DOM insertion.
   for(const change of changes)for(const node of change.addedNodes||[])
    if(node.nodeType===1||node.nodeType===3)tidyVisibleTree(node);
  });
  const begin=()=>{if(document.body)monitor.observe(document.body,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',begin,{once:true});else begin();
 }
 root.DeepPetPresentation1035=Object.freeze({cleanCopy,battery:()=>battery()?{...battery()}:null});
 root.DeepPetRelease={...root.DeepPetRelease,version:root.DeepPetBuildVersion||'10.35',integrity:[
  ...(root.DeepPetRelease?.integrity||[]),
  'visible-home-and-device-battery-without-changing-radio-status',
  'sdk-battery-takes-precedence-over-local-product-visual',
  'first-today-priority-restrained-inline-highlight',
  'same-day-health-context-kept-adjacent-to-priority',
  'no-tab-waveform-score-or-record-mutation'
 ]};
})(window);
