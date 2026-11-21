/* V10.128: display-only Deep typography/locale consistency.
 * Preserve pet data, thresholds, score values, dates, actions and icons.
 */
(function(root){'use strict';
 if(typeof render!=='function')return;
 const locale=()=>state.lang==='zh'?'zh':state.lang==='en'?'en':state.lang==='ko'?'ko':state.lang==='ja'?'ja':'tw';
 const words={
  tw:{period:'期間',choose:'查看指定日期',recent:n=>`最近${n}天`,valid:n=>`${n}個有效記錄日`,weekdays:['一','二','三','四','五','六','日'],notice:'監測分數僅供日常觀察參考，不能取代獸醫診斷。'},
  zh:{period:'期间',choose:'查看指定日期',recent:n=>`最近${n}天`,valid:n=>`${n}个有效记录日`,weekdays:['一','二','三','四','五','六','日'],notice:'监测分数仅供日常观察参考，不能代替兽医诊断。'},
  en:{period:'Period',choose:'Choose a day',recent:n=>`Last ${n} days`,valid:n=>`${n} valid recording days`,weekdays:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],notice:'Monitoring scores are for routine observation, not a veterinary diagnosis.'},
  ko:{period:'기간',choose:'날짜 선택',recent:n=>`최근 ${n}일`,valid:n=>`유효 기록 ${n}일`,weekdays:['월','화','수','목','금','토','일'],notice:'모니터링 점수는 일상 관찰용이며 수의사의 진단을 대신하지 않습니다.'},
  ja:{period:'期間',choose:'日付を選択',recent:n=>`直近${n}日`,valid:n=>`有効な記録${n}日`,weekdays:['月','火','水','木','金','土','日'],notice:'測定スコアは日常の参考情報であり、獣医師の診断に代わるものではありません。'}
 };
 function update(){
  if(state.tab!=='deep'||state.detail)return;
  const deep=document.querySelector('#app .dp-owner-deep');if(!deep)return;
  const l=words[locale()],d=Number(state.range)||1;
  if(d>1){
   const label=deep.querySelector('.deep-date-compact > span');
   if(label){const s=label.textContent,mark=s.indexOf('·');if(mark>=0)label.textContent=l.period+' · '+s.slice(mark+1).trim();}
   const dateBtn=deep.querySelector('.deep-date-compact .deep-date-link');
   if(dateBtn){dateBtn.childNodes.forEach(n=>{if(n.nodeType===Node.TEXT_NODE&&n.textContent.trim())n.textContent=' '+l.choose;});}
   const count=deep.querySelector('.dp-range-quality');
   if(count){const all=(count.textContent.match(/\d+/g)||[]);const total=all.length?Number(all.at(-1)):null;
    if(Number.isFinite(total))count.textContent=l.recent(d)+' · '+l.valid(total);
   }
  }
  deep.querySelectorAll('.dp905-weekdays').forEach(el=>{
   const spans=el.querySelectorAll(':scope > span');
   if(spans.length===7)spans.forEach((span,i)=>{span.textContent=l.weekdays[i];});
  });
  // The source period-calendar helper is still reused across legacy routes.
  // Remove incidental showcase disclaimers from the owner-facing Deep screen.
  deep.querySelectorAll('.dp905-calendar-panel .dp905-sim-note').forEach(el=>{el.textContent=l.notice;});
 }
 const previous=render;
 render=function(...args){const result=previous.apply(this,args);update();root.DeepPetBuildVersion='10.128';return result;};
 root.DeepPetDeepPolish128=Object.freeze({version:'10.128',update});
 if(document.querySelector('#app .app-main'))update();
})(window);
