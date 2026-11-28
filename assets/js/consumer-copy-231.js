/* Customer-facing copy only. Never alter recorded data, actions, scores or source identifiers. */
(function(){'use strict';
 const rules=[
 [/含(?:示例|示範|示范|演示)(?:資料|数据|數據)/g,'含非實測紀錄'],
 [/(?:示範|示例|範例|展示|演示|模擬)(?:資料|數據|紀錄|记录)/g,'非實測紀錄'],
 [/(?:示范|示例|范例|展示|演示|模拟)(?:数据|资料|记录)/g,'非实测记录'],
 [/(?:範例|示例)行程/g,'待確認行程'],
 [/(?:示例|范例)行程/g,'待确认行程'],
 [/確認模擬付款/g,'確認不扣款流程'],[/确认模拟付款/g,'确认不扣款流程'],[/模擬付款完成/g,'不扣款流程完成'],[/模拟付款完成/g,'不扣款流程完成'],
 [/模擬連接/g,'本機配對預覽'],[/模拟连接/g,'本机配对预览'],
 [/模擬(?:GPS| GPS)/g,'GPS 預覽（非即時定位）'],[/模拟(?:GPS| GPS)/g,'GPS 预览（非实时定位）'],
 [/(?:示範|示范|示例|範例|范例|演示|模擬|模拟)(?:版|模式|體驗|体验)/g,'功能預覽'],
 [/(?:示範|示例|範例|展示|演示|模擬)(?=波形|訊號|信號|讀數|數值|量測|測量|結果|趨勢|圖表|預警|警報)/g,'非實測'],
 [/(?:示范|示例|范例|展示|演示|模拟)(?=波形|信号|读数|数值|测量|结果|趋势|图表|预警|警报)/g,'非实测'],
 [/(?:示範|示范|示例|範例|范例|演示|模擬|模拟)/g,'預覽'],
 [/\b(?:includes sample data|demo data|sample data|example data|demonstration records|sample records|simulated readings|demo readings|simulated values|simulated data|presentation data)\b/gi,'Records not from live measurements'],
 [/\b(?:demo|simulated) payment complete\b/gi,'No-charge checkout completed'],
 [/\bconfirm simulated payment\b/gi,'Confirm no-charge checkout'],
 [/\bconnected \(demo\)/gi,'Connection preview (not paired)'],
 [/\bGPS demo\b/gi,'GPS preview (not live location)'],
 [/\b(?:simulated|demo|illustrative|presentation) (?:waveforms?|signals?|sensor readings|minute readings|health readings)\b/gi,'Generated records (not device readings)'],
 [/\b(?:simulated|synthetic)\b/gi,'generated'],
 [/\billustrative schedule\b/gi,'Unconfirmed schedule'],
 [/\b(?:demonstrations?|demos?|illustrative)\b/gi,'preview'],
 [/\bsimulations?\b/gi,'local preview'],
 [/예시 데이터 포함|(?:데모|예시|샘플|모의|시뮬레이션)\s*(?:데이터|자료|기록|측정값|수치)/g,'실측이 아닌 기록'],
 [/모의 결제 완료/g,'결제 없는 절차 완료'],[/모의 결제 확인/g,'결제 없는 절차 확인'],
 [/(?:데모|시연|예시|모의|시뮬레이션|체험용)/g,'미리보기']
 ];
 function clean(value){let s=String(value);for(const [a,b] of rules){const replacement=typeof state!=='undefined'&&state.lang==='zh'?b.replaceAll('非實測紀錄','非实测记录').replaceAll('非實測','非实测').replaceAll('預覽','预览').replaceAll('功能預覽','功能预览'):b;s=s.replace(a,replacement);}return s;}
 // Preserve explicit source notices and actual user-entered values; only visible UI copy is processed.
 const excluded='script,style,textarea,input,[contenteditable=true],.pet-name,.dp-pet-name';
 function text(n){if(n.parentElement&&!n.parentElement.closest(excluded)){const v=clean(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;}}
 function attrs(e){if(e.closest('script,style,[contenteditable=true],.pet-name,.dp-pet-name'))return;for(const a of ['title','aria-label','alt','placeholder']){const v=e.getAttribute(a);if(v!==null){const x=clean(v);if(x!==v)e.setAttribute(a,x);}}}
 function walk(n){if(n.nodeType===3){text(n);return;}if(n.nodeType!==1||n.closest(excluded))return;attrs(n);const w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);let t;while(t=w.nextNode())text(t);for(const e of n.querySelectorAll('[title],[aria-label],[alt],[placeholder]'))attrs(e);}
 function refresh(){for(const e of document.querySelectorAll('#app,#overlay-root,#dp-story-panel,#dp-intro-root'))walk(e);}
 if(typeof render==='function'){const prev=render;render=function(...args){const r=prev.apply(this,args);refresh();return r;};}
 // Printed reports use a separate window; normalize their visible text before export.
 if(typeof vetReportContent==='function'){const previous=vetReportContent;vetReportContent=function(...args){const t=document.createElement('template');t.innerHTML=previous.apply(this,args);for(const n of t.content.childNodes)walk(n);return t.innerHTML;};}
 // Observe late-rendered dialogs/toasts and asynchronous data panels without rescanning the entire page on every change.
 const observer=new MutationObserver(entries=>{for(const r of entries){if(r.type==='characterData')text(r.target);else if(r.type==='attributes')attrs(r.target);else for(const n of r.addedNodes)walk(n);}});
 observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','alt','placeholder']});
 for(const key of ['alert','confirm']){const original=window[key];window[key]=function(message){return original.call(window,clean(message));};}
 refresh();
 window.DeepPetConsumerCopy231=Object.freeze({clean,refresh});
})();
