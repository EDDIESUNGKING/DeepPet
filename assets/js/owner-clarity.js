/* DeepPet V10.140 — owner-facing explanations, risk ordering, and two-metric alert actions.
 * Presentation and navigation only: no physiology scores, device streams, persisted
 * records, date histories or risk thresholds are modified. */
(function(root){'use strict';
 const L=(tw,zh,en,ja,ko)=>({zht:tw,zh,en,ja,ko})[state.lang]||tw;
 const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const looksLikeUrgentScore=x=>x?.type==='deep'&&Number.isFinite(x.score)&&x.score>=0&&x.score<=100;
 function priority(item){
  const id=String(item.id||'');
  const clinical=looksLikeUrgentScore(item)&&!['deep-recovery-2m','quiet-breath-watch'].includes(id);
  if(clinical&&item.score<20)return 0;
  if(clinical&&Number(item.continuityDays)>=2&&item.score<80)return 1;
  if(item.type==='report'&&item.priority===1)return 2;
  if(clinical&&item.score<60)return 3;
  if(clinical&&item.score<80)return 4;
  if(item.type==='report')return 5;
  if(item.type==='vax'||item.type==='deworm')return 6;
  if(item.type==='med')return 7;
  if(clinical)return 8;
  if(item.type==='deep')return 9; // unscored trend/observation: not a 0/100 emergency
  if(item.type==='recovery')return 10;
  if(item.type==='chat')return 11;
  return 12;
 }
 const oldSort=typeof dpAllTodayAttentionItems==='function'?dpAllTodayAttentionItems:null;
 if(oldSort){
  dpAllTodayAttentionItems=function(){
   // Existing registries, including owner-scoped due dates, are authoritative.
   // Do not create emergency events from a low *daily* score.
   const list=oldSort();
   return list.map((item,index)=>({item,index})).sort((a,b)=>
    priority(a.item)-priority(b.item)||
    (looksLikeUrgentScore(a.item)&&looksLikeUrgentScore(b.item)?a.item.score-b.item.score:0)||
    Number(b.item.continuityDays||0)-Number(a.item.continuityDays||0)||
    String(a.item.scheduledTime||'99:99').localeCompare(String(b.item.scheduledTime||'99:99'))||
    a.index-b.index).map(x=>x.item);
  };
 }
 // Short, nontechnical, on-demand help. The main score is never hidden.
 const glossary={
  zht:{title:'HRV、RMSSD、SDNN 看什麼？',hrv:'比較相同休息情境的恢復趨勢；數值越高不一定越好。',rmssd:'反映相鄰心搏間隔的短期變化，宜在安靜時比較。',sdnn:'反映整段有效心搏間隔的變化，宜比較相同量測時長。'},
  zh:{title:'HRV、RMSSD、SDNN 看什么？',hrv:'比较相同休息情境的恢复趋势；数值越高不一定越好。',rmssd:'反映相邻心搏间隔的短期变化，宜在安静时比较。',sdnn:'反映整段有效心搏间隔的变化，宜比较相同测量时长。'},
  en:{title:'What do HRV, RMSSD & SDNN tell you?',hrv:'Compare recovery at similar rest conditions; higher is not always better.',rmssd:'Short-term changes between adjacent beats; compare during quiet rest.',sdnn:'Variation across valid beat intervals; compare equal recording lengths.'},
  ja:{title:'HRV・RMSSD・SDNN は何を見る？',hrv:'休息・回復の全体的な傾向を見る目安。',rmssd:'短時間のリラックス状態を見る目安。',sdnn:'一定時間の全体的な変化を見る目安。'},
  ko:{title:'HRV·RMSSD·SDNN은 무엇을 볼까요?',hrv:'비슷한 휴식 상태에서 회복 추세를 비교하세요. 높다고 항상 좋은 것은 아닙니다.',rmssd:'인접한 심박 간격의 단기 변화로, 안정 시 비교하세요.',sdnn:'유효 심박 간격의 전체 변화로, 같은 측정 길이를 비교하세요.'}
 };
 function explainHRV(){
  if(state.tab!=='deep'||state.detail)return;
  const page=document.querySelector('#app .dp-owner-deep');if(!page)return;
  // Legacy help was inserted in energy as well as in 7/30-day pages. Remove
  // it in the originating render stage, not with CSS display:none.
  page.querySelectorAll('.dp129-hrv-details, .dp140-hrv-glossary').forEach(n=>n.remove());
  if(Number(state.deepType)!==0||Number(state.range)!==1)return;
  const node=page.querySelector('[data-dp903-metric="hrv"] .dp903-metric-left') ||
   [...page.querySelectorAll('.dp903-metric-left')].find(n=>/^HRV\b/i.test(n.querySelector('h3')?.textContent.trim()||''));
  if(!node)return;
  const x=glossary[state.lang]||glossary.zht;
  const card=document.createElement('details');card.className='dp140-hrv-glossary';
  card.setAttribute('aria-label','HRV RMSSD SDNN');
  const head=document.createElement('summary');head.textContent=x.title;card.append(head);
  const body=document.createElement('div');body.className='dp140-hrv-glossary-body';
  for(const name of ['hrv','rmssd','sdnn']){
   const line=document.createElement('p');line.className='dp140-hrv-term';
   const bold=document.createElement('b');bold.textContent=name.toUpperCase();
   const explain=document.createElement('span');explain.textContent=x[name];
   line.append(bold,explain);body.append(line);
  }
  card.append(body);node.append(card);
 }
 function alignRelatedButton(){
  if(state.tab!=='deep'||state.detail)return;
  document.querySelectorAll('#app .dp-owner-deep .dp131-linked-button').forEach(btn=>{
   btn.classList.add('dp140-related-left');
   if([7,30].includes(Number(state.range))){btn.classList.add('dp141-period-bold');btn.style.setProperty('font-weight','750','important');}
  });
 }
 const actions={
  zht:{heart:'查看心跳',breath:'查看呼吸'},zh:{heart:'查看心率',breath:'查看呼吸'},
  en:{heart:'View heart rate',breath:'View breathing'},ja:{heart:'心拍を見る',breath:'呼吸を見る'},ko:{heart:'심박 보기',breath:'호흡 보기'}
 };
 function dualAlertButtons(){
  if(state.tab!=='home'||state.detail)return;
  const rootApp=document.querySelector('#app');if(!rootApp)return;
  const lab=actions[state.lang]||actions.zht;
  rootApp.querySelectorAll('button.dp1059-alert-item[data-action="dp1059-alert-open"][data-peer="breath"],button.dp1059-alert-item[data-action="dp1059-alert-open"][data-peer="heart"]').forEach(old=>{
   const k=old.dataset.kind,peer=old.dataset.peer;
   if(!['heart','breath'].includes(k)||!['heart','breath'].includes(peer)||k===peer)return;
   const panel=document.createElement('article');panel.className=old.className+' dp140-dual-alert';
   panel.setAttribute('role','group');panel.setAttribute('aria-label',old.getAttribute('aria-label')||'');
   // Copy the existing title, verified local time and arrow-free visual summary.
   const symbol=old.querySelector('.dp1059-alert-symbol')?.cloneNode(true);
   const summary=old.querySelector('.dp1059-alert-copy')?.cloneNode(true);
   const head=document.createElement('div');head.className='dp140-dual-head';
   if(symbol)head.append(symbol);if(summary)head.append(summary);panel.append(head);
   const controls=document.createElement('div');controls.className='dp140-dual-controls';
   for(const metric of ['heart','breath']){
    const button=document.createElement('button');button.type='button';button.className='dp140-alert-choice';
    button.dataset.action='dp1059-alert-open';
    for(const name of ['date','minute','second','eventType'])if(old.dataset[name]!==undefined)button.dataset[name]=old.dataset[name];
    const isPrimary=metric===k;
    if(!isPrimary&&old.dataset.peerEventType)button.dataset.eventType=old.dataset.peerEventType;
    button.dataset.kind=metric;
    button.dataset.value=old.dataset[isPrimary?'value':'peerValue'];
    button.dataset.peer=isPrimary?peer:k;
    button.dataset.peerValue=old.dataset[isPrimary?'peerValue':'value'];
    button.textContent=lab[metric];
    button.setAttribute('aria-label',`${lab[metric]} · ${old.dataset.date||''} ${old.dataset.minute||''}`);
    controls.append(button);
   }
   panel.append(controls);old.replaceWith(panel);
  });
 }
 function cleanDigest(){
  if(state.tab!=='home')return;
  const translations={zht:['已到期・待確認','依健康風險、持續低分、到期事項排序'],zh:['已到期・待确认','按健康风险、持续低分、到期事项排序'],en:['Due · to confirm','Sorted by health concerns, repeated lows, due tasks'],ja:['期限到来・要確認','健康リスク・低得点の継続・期限順'],ko:['기한 도래 · 확인 필요','건강 위험·지속 저점·기한순']};
  const words=translations[state.lang]||translations.zht;
  document.querySelectorAll('#app .dp1029-today-digest span').forEach(el=>{
   if(/逾期待確認|逾期待确认|Overdue to confirm|기한 초과 확인|期限切れ・要確認/.test(el.textContent)){
    el.textContent=el.textContent.replace(/逾期待確認|逾期待确认|Overdue to confirm|기한 초과 확인|期限切れ・要確認/,words[0]);
   } else if(/依今日分數|按今日分数|Ordered by today|今日の点数|오늘 점수/.test(el.textContent))el.textContent=words[1];
  });
 }
 const oldRender=render;
 render=function(...args){const result=oldRender.apply(this,args);explainHRV();alignRelatedButton();dualAlertButtons();cleanDigest();return result;};
 root.DeepPetUX1140=Object.freeze({version:'10.140',priority,glossary});
})(window);
