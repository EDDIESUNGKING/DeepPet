/* DeepPet V8.74 — layout correctness and category theme consistency.
 * Runs after V8.73 and acts on its rendered DOM without changing pet data,
 * score calculations, navigation, medical cautions in other app sections, or graphs. */
(function(){
'use strict';
function dom(markup){const t=document.createElement('template');t.innerHTML=markup;return t.content;}
function serialize(fragment){const div=document.createElement('div');div.appendChild(fragment);return div.innerHTML;}
const olderDeepView=deepView;
function correctOverview(root){
 const kind=Number(state.deepType),days=Number(state.range);
 const head=kind===0&&days>1?root.querySelector('.dp68-period-overall'):
  days===1?root.querySelector('.dp-owner-status-heading'):
  kind===1?root.querySelector('.dp-sleep-period-score-head'):root.querySelector('.dp-heart-period-overall');
 if(!head)return;
 const textColumn=head.querySelector(':scope > div:first-child'),narrative=root.querySelector('.dp73-narrative');
 if(!textColumn||!narrative)return;
 // Put both actual observations immediately after the status verdict.
 textColumn.appendChild(narrative);
 const verdict=[...textColumn.children].find(el=>el.matches('p')&&!el.classList.contains('dp73-summary-line'));
 if(verdict)verdict.classList.add('dp74-overview-verdict');
 head.classList.add('dp74-overview-head');textColumn.classList.add('dp74-overview-copy');
 // The ring/grade is floated to the right so paragraphs naturally use the space
 // underneath it as soon as the text reaches that line, rather than leaving an empty row.
 const score=[...head.children].find(el=>el!==textColumn);
 if(score){score.classList.add('dp74-overview-score');head.insertBefore(score,textColumn);}
 // Duplicate score and generic status text were replaced by V8.73's data-based narrative.
 if(kind===0){root.querySelectorAll('.dp68-data-disclaimer,.dp66-demo-hint').forEach(e=>e.remove());}
}
function compactSubcards(root){
 if(Number(state.deepType)!==2)return;
 root.querySelectorAll('.dp-energy-score-panel,.dp-activity-score-panel,.dp-recovery-score-panel,.dp-energy-period-panel').forEach(card=>{
  const head=card.querySelector('.dp-vital-heading');
  if(!head)return;
  // Previous versions displayed another sentence after the actual explanation.
  // The factual score and chart remain visible, only the duplicated filler disappears.
  for(const el of card.querySelectorAll(':scope > .dp-owner-subsummary,:scope > .dp69-cause')){
   if(el.classList.contains('dp73-metric-summary'))continue;
   // V8.69 may put the old generic comparison here; the V8.73 status text supersedes it.
   if(card.querySelector('.dp73-metric-summary'))el.remove();
  }
  const primary=head.querySelector('.dp73-metric-summary');
  if(primary){primary.classList.add('dp74-metric-interpretation');}
 });
 // V8.71 also adds a second relaxation-advice block outside the day card.
 // Keep its specific guidance but remove the redundant "Normal · Rest & steadiness" label.
 root.querySelectorAll('.dp71-advice > b').forEach(label=>{
  if(/放鬆與平穩度|放松与平稳度|Rest\s*&\s*steadiness|휴식과 안정|休息と安定/i.test(label.textContent)){
   const advice=label.parentElement;advice.classList.add('dp74-relaxation-advice');label.remove();
  }
 });
 root.querySelectorAll('.dp66-rhythm-item,.dp68-rhythm-chart').forEach(card=>{
  card.classList.add('dp74-rhythm-card');
  const head=card.querySelector('.dp68-rhythm-head');
  const observation=card.querySelector(':scope > p');
  const score=head?[...head.children].find(el=>el.matches('.dp70-rhythm-aside,.dp68-rhythm-score')):null;
  if(head&&observation&&score){
   head.insertBefore(score,head.firstChild);head.append(observation);
   if(card.matches('.dp66-rhythm-item')){for(const foot of card.querySelectorAll(':scope > small')){foot.classList.add('dp74-rhythm-footnote');head.append(foot);}}
   head.classList.add('dp74-rhythm-flowhead');score.classList.add('dp74-rhythm-flow-score');
  }
  // Drop the duplicate "Normal · Rest & steadiness" headline; preserve the
  // meaningful underlying interpretation of resting HRV and daily fluctuation.
  for(const extra of card.querySelectorAll('.dp71-advice')){
   extra.querySelector(':scope > b')?.remove();
   extra.classList.add('dp74-relaxation-advice');
  }
  // Avoid tautological labels like "Normal rest & steadiness": the card heading
  // is already present, and the explanation underneath describes the trend.
  card.querySelectorAll('.dp68-grade-inline').forEach(e=>e.remove());
 });
}
function heartTheme(root){
 if(Number(state.deepType)!==0)return;
 const heart=root.querySelector('.deep-theme-heart')||root.querySelector('.dp-owner-deep');
 if(!heart)return;
 heart.classList.add('dp74-heart-palette');
 const lead=heart.querySelector('.dp68-period-lead');
 if(lead){const notes={zht:'日期卡呈現每天的心肺狀態；驚嘆號表示當天心跳或呼吸需另外留意，點選日期可查看詳情。',zh:'日期卡显示每天的心肺状态；感叹号表示当天心跳或呼吸需要另外留意，点击日期可查看详情。',en:'Each date shows that day’s heart and breathing status; ! marks readings worth reviewing. Tap a date for details.',ko:'날짜별 심폐 상태와 추가 확인이 필요한 항목(!)을 확인하세요.',ja:'日付ごとの心肺状態を示します。！は心拍・呼吸に注意が必要な日です。'};lead.textContent=notes[state.lang]||notes.en;}
 // Existing charts can encode their colors directly in SVG attributes; correct
 // colored series without touching ring colors (graded score hues are meaningful).
 heart.querySelectorAll('svg path[stroke],svg polyline[stroke],svg line[stroke]').forEach(el=>{
  if(el.closest('.dp-status-score,.dp-dotted-meter,.dp-uniform-dotted,.dp-uniform-dot-svg,.dp-dot-meter-center'))return;
  const stroke=(el.getAttribute('stroke')||'').toLowerCase();
  const m=stroke.match(/^#([0-9a-f]{6})$/);
  if(!m)return;
  const rgb=[1,3,5].map(i=>parseInt(m[1].slice(i-1,i+1),16));
  const [r,g,b]=rgb;
  // Only replace non-neutral blue/green/orange data strokes, not neutral grid axes.
  if((b>r*1.13 && b>g*1.07 && b-g>20)||(g>r*1.12 && g>b*.90 && g-r>25)||(r>g*1.3&&g>b*1.18&&g>85))el.setAttribute('stroke','#c85479');
 });
}
deepView=function(){const tree=dom(olderDeepView());if(!state.detail){try{correctOverview(tree);compactSubcards(tree);heartTheme(tree);}catch(e){console.warn('DeepPet V8.74 overview fallback',e);}}return serialize(tree);};
})();
