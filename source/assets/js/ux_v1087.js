/* DeepPet V10.87: presentation copy, without visible demo/simulation tags.
   Keep the original waveform engine, fixtures, event sources, pet identities,
   CSS class names and app actions untouched. Only rendered text is cleaned. */
(() => {
 'use strict';

 // Keep health/safety cautions; remove labels explaining that a showroom is
 // a showroom. User-entered state, record provenance and API keys stay intact.
 const copy={
  zh:{demo:'',notLive:'',connected:'已连接',connect:'连接设备',disconnect:'断开连接',gardenDemo:'附近宠物',gardenOff:'位置共享默认关闭。',join:'加入宠物花园',exported:'摘要已生成',disclaimer:'健康信息仅供参考，出现异常时请咨询兽医。',noFiles:'请核对报告内容后保存。',uploadHint:'文件已选择，请确认信息。'},
  zht:{demo:'',notLive:'',connected:'已連接',connect:'連接設備',disconnect:'斷開連接',gardenDemo:'附近寵物',gardenOff:'位置共享預設關閉。',join:'加入寵物花園',exported:'摘要已產生',disclaimer:'健康資訊僅供參考，出現異常時請諮詢獸醫。',noFiles:'請核對報告內容後保存。',uploadHint:'已選擇檔案，請確認資訊。'},
  en:{demo:'',notLive:'',connected:'Connected',connect:'Connect device',disconnect:'Disconnect',gardenDemo:'Nearby pets',gardenOff:'Location sharing is off by default.',join:'Join Pet Garden',exported:'Summary created',disclaimer:'Health information is for reference; consult a veterinarian about concerns.',noFiles:'Review the report before saving.',uploadHint:'File selected. Please confirm the details.'},
  ko:{demo:'',notLive:'',connected:'연결됨',connect:'기기 연결',disconnect:'연결 해제',gardenDemo:'주변 반려동물',gardenOff:'위치 공유는 기본적으로 꺼져 있습니다.',join:'펫 가든 참여',exported:'요약이 생성되었습니다',disclaimer:'건강 정보는 참고용입니다. 이상이 있으면 수의사와 상담하세요.',noFiles:'보고서 내용을 확인한 후 저장하세요.',uploadHint:'파일을 선택했습니다. 내용을 확인하세요.'},
  ja:{demo:'',notLive:'',connected:'接続済み',connect:'デバイスを接続',disconnect:'接続を解除',gardenDemo:'近くのペット',gardenOff:'位置情報の共有は初期設定でオフです。',join:'ペットガーデンに参加',exported:'要約を作成しました',disclaimer:'健康情報は参考用です。異常がある場合は獣医師に相談してください。',noFiles:'内容を確認してから保存してください。',uploadHint:'ファイルを選択しました。内容を確認してください。'}
 };
 if(typeof LANG==='object'){
  for(const [language,strings] of Object.entries(copy)){
   if(LANG[language])Object.assign(LANG[language],strings);
  }
 }

 const blocked=/(示範|示范|模擬|模拟|演示|示例|範例|范例|示意|demo|demonstrat|simulat|illustrativ|mock(?:up)?|example|데모|시뮬레이션|모의|예시|체험용|デモ|シミュレーション|体験版|例示)/i;
 function clean(input){
  const raw=String(input??'');
  if(!blocked.test(raw))return raw;
  // Entire explanatory notices are not useful inside a presentation UI.
  if(/^\s*(?:交互演示|本演示|演示版|示範版|示范版|模擬版|模拟版|demo(?:nstration)?(?:\s+only)?\s*[:：·—-]|interactive demo\b)/i.test(raw)){
   return '';
  }
  let value=raw
   .replace(/示範|示范|模擬|模拟|演示|示例|範例|范例|示意/g,'')
   .replace(/\b(?:interactive\s+demo|demos?|demonstrat(?:ion|ions|ed|ing|e|es)|simulat(?:ion|ions|ed|e|ing)|illustrativ(?:e|ely)|mock(?:up)?s?|examples?)\b/gi,'')
   .replace(/데모|시뮬레이션|모의|예시|체험용|デモ|シミュレーション|体験版|例示/g,'')
   .replace(/[（(]\s*[）)]/g,'')
   .replace(/\s*[·｜|]\s*(?=$)/g,'')
   .replace(/^\s*[·｜|]\s*/g,'')
   .replace(/\s{2,}/g,' ')
   .trim();
  if(/^[·•\-—:：,，。.!！?？｜|\s]+$/.test(value))value='';
  return value;
 }
 // The pure function is exposed only for deterministic regression testing.
 window.DeepPetPresentationCleanV1087=clean;

 // UI labels may be cleaned for presentation, but a guardian's own words are
 // records, not copywriting. Preserve exact saved field values (including a
 // pet legitimately named "Demo") before touching rendered text or alt text.
 const ownerText=new Set();
 const ownerFields=new Set(['name','text','note','notes','brand','clinic','title','description','reasonNote','message','comment','label']);
 const ownerBuckets=['petExtras','petOverrides','notesByDog','medsByDog','medHistoryByPet','vaxByDog','vaccineOverridesByDog','userReportEntries','mealItems','foodLogsByDay','gardenMessagesByPet','carePlans','carePlanHistoryByPet','behaviorLogs','dewormByPet','checkoutForm'];
 function refreshOwnerText(){
  ownerText.clear();
  if(typeof state==='undefined'||!state||typeof state!=='object')return;
  const remember=v=>{if(typeof v==='string'&&v.trim()&&v.length<=2000)ownerText.add(v.trim());};
  const visit=(value,depth=0)=>{
   if(!value||depth>8)return;
   if(Array.isArray(value)){for(const item of value)visit(item,depth+1);return;}
   if(typeof value!=='object'||value.sample===true||value.demo===true||value.source==='sample')return;
   for(const [key,part] of Object.entries(value)){
    if(typeof part==='string'&&ownerFields.has(key))remember(part);
    else if(part&&typeof part==='object'&&!['photo','data','image','blob','file','attachment'].includes(key))visit(part,depth+1);
   }
  };
  for(const key of ownerBuckets)visit(state[key]);
  if(typeof dogs!=='undefined'&&Array.isArray(dogs))for(const pet of dogs)remember(pet?.name);
 }
 function isOwnerContent(raw){return ownerText.has(String(raw??'').trim());}
 window.DeepPetPresentationPreservesOwnerTextV1089=isOwnerContent;

 const uiRoots=['#app','#overlay-root','#dp-story-panel','#dp-intro-root'];
 function cleanElement(el){
  if(!el||el.nodeType!==1)return;
  if(el.matches?.('.demo-ribbon')){el.remove();return;}
  for(const attr of ['aria-label','title','placeholder','alt']){
   if(el.hasAttribute?.(attr)){
    const raw=el.getAttribute(attr),value=isOwnerContent(raw)?raw:clean(raw);
    if(raw!==value)el.setAttribute(attr,value);
   }
  }
 }
 function cleanTree(root){
  if(!root)return;
  if(root.nodeType===3){if(root.parentElement?.matches?.('script,style,textarea,code')||isOwnerContent(root.nodeValue))return;const value=clean(root.nodeValue);if(value!==root.nodeValue)root.nodeValue=value;return;}
  if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
  if(root.nodeType===1){cleanElement(root);if(!root.isConnected)return;}
  if(typeof document.createTreeWalker!=='function')return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
   if(node.nodeType===3){if(node.parentElement?.matches?.('script,style,textarea,code')||isOwnerContent(node.nodeValue))continue;const value=clean(node.nodeValue);if(value!==node.nodeValue)node.nodeValue=value;}
   else cleanElement(node);
  }
 }
 function cleanScreens(){for(const selector of uiRoots)cleanTree(document.querySelector(selector));}

 if(typeof render==='function'){
  const previous=render;
  render=function(...args){const result=previous(...args);refreshOwnerText();cleanScreens();return result;};
 }
 if(typeof renderModal==='function'){
  const previous=renderModal;
  renderModal=function(...args){const result=previous(...args);refreshOwnerText();cleanTree(document.querySelector('#overlay-root'));return result;};
 }
 if(typeof toast==='function'){
  const previous=toast;
  toast=function(message){return previous(clean(message));};
 }
 if(typeof MutationObserver==='function'&&document.body){
  const observer=new MutationObserver(changes=>{
   refreshOwnerText();
   for(const change of changes){
    if(change.type==='characterData')cleanTree(change.target);
    else if(change.type==='attributes')cleanElement(change.target);
    else for(const node of change.addedNodes)cleanTree(node);
   }
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder','alt']});
 }
 refreshOwnerText();
 cleanScreens();
})();
