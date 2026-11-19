/* DeepPet V8.75 — targeted Deep score alignment, original severity colors,
   and a friendly nearby-pets icon. No changes to stored readings or scoring. */
(function(){
'use strict';
const toFragment=markup=>{const template=document.createElement('template');template.innerHTML=markup;return template.content;};
const toMarkup=fragment=>{const parent=document.createElement('div');parent.append(fragment);return parent.innerHTML;};
const numeric=n=>n===null||n===undefined||n===''?null:(Number.isFinite(Number(n))?Number(n):null);
const tier=n=>n===null?'missing':n>=90?'normal':n>=80?'low':n>=60?'medium':'high';
const statusName=n=>{
 const labels={
  zht:['健康','低風險','中風險','高風險','資料不足'],
  zh:['健康','低风险','中风险','高风险','数据不足'],
  en:['Healthy','Mild','Moderate','Risk','Insufficient data'],
  ko:['정상','경미한 위험','중간 위험','높은 위험','자료 부족'],
  ja:['正常','軽度リスク','中度リスク','高リスク','データ不足']
 };
 const v=labels[state.lang]||labels.en;
 return v[n===null?4:n>=90?0:n>=80?1:n>=60?2:3];
};
function badgeFor(score,moreClass=''){
 const s=document.createElement('span');s.className=`dp75-risk dp75-risk-${tier(score)} ${moreClass}`;
 s.textContent=statusName(score);s.dataset.tier=tier(score);return s;
}
function setGrade(where,score){
 if(!where)return;
 let grade=where.querySelector(':scope > .dp69-grade, :scope > .dp71-risk, :scope > .dp66-grade-badge, :scope > .dp75-risk');
 if(!grade){grade=badgeFor(score);where.append(grade)}
 else{
  grade.classList.add('dp75-risk');for(const key of ['normal','low','medium','high','missing'])grade.classList.remove('dp75-risk-'+key);
  grade.classList.add('dp75-risk-'+tier(score));grade.dataset.tier=tier(score);grade.textContent=statusName(score);
 }
}
function ringScore(node){return numeric(node?.querySelector?.('.dp-status-score[data-score]')?.dataset.score??node?.dataset.score);}
function alignMain(root){
 for(const head of root.querySelectorAll('.dp74-overview-head')){
  const oldAside=head.querySelector(':scope > .dp74-overview-score');if(!oldAside)continue;
  let aside=oldAside;
  // The energy period originally uses a bare ring. Wrap it to match Day/Heart/Sleep.
  if(oldAside.matches('.dp-status-score')){
   aside=document.createElement('div');aside.className='dp69-score-aside dp74-overview-score dp75-overview-aside';
   head.replaceChild(aside,oldAside);oldAside.classList.remove('dp74-overview-score');aside.appendChild(oldAside);
  }
  aside.classList.add('dp75-overview-aside');
  const ring=aside.querySelector('.dp-status-score[data-score]');
  if(ring){ring.classList.add('dp75-main-ring');setGrade(aside,numeric(ring.dataset.score));}
 }
}
function alignHeartVitals(root){
 root.querySelectorAll('.deep-theme-heart .dp66-vital-top').forEach(top=>{
  const caption=top.querySelector(':scope > b'),aside=top.querySelector(':scope > .dp69-vital-aside');
  if(!caption||!aside)return;
  const value=aside.querySelector(':scope > strong'),grade=aside.querySelector(':scope > .dp66-risk-label');
  if(!value||!grade)return;
  const left=document.createElement('div');left.className='dp75-vital-left';
  left.append(caption,value);const right=document.createElement('div');right.className='dp75-vital-right';right.append(grade);
  top.replaceChildren(left,right);top.classList.add('dp75-vital-top');
  // Preserve the actual per-vital score label computed by the original algorithm.
  const cls=[...top.closest('.dp66-vital')?.classList||[]].find(x=>/^dp66-risk-[0-3]$/.test(x));
  const txt=grade.textContent.trim().toLowerCase();
  const st=/資料不足|数据不足|no data|insufficient|데이터 부족|データ不足/.test(txt)?'missing':
   cls?(['normal','low','medium','high'][Number(cls.at(-1))]||'missing'):
   /高風險|高风险|high/.test(txt)?'high':/中風險|中风险|moderate/.test(txt)?'medium':
   /低風險|低风险|low|mild/.test(txt)?'low':'normal';
  grade.classList.add('dp75-risk','dp75-risk-'+st);
  const rank={normal:95,low:85,medium:70,high:45,missing:null};grade.textContent=statusName(rank[st]);
 });
 // HRV's combined status sits on the same right-hand column, centered like other grades.
 root.querySelectorAll('.deep-theme-heart .dp71-mainhead').forEach(head=>{
  if(!head.closest('.dp71-hrv'))return;
  head.classList.add('dp75-hrv-head');
  const s=head.querySelector(':scope > .dp71-risk');if(!s)return;
  s.classList.add('dp75-risk');for(const level of ['normal','low','medium','high','missing'])if(s.classList.contains(level))s.classList.add('dp75-risk-'+level);
 });
}
function alignMetricRings(root){
 if(Number(state.deepType)!==2)return;
 root.querySelectorAll('.dp-vital-heading .dp69-score-aside').forEach(aside=>{
  aside.classList.add('dp75-metric-aside');const ring=aside.querySelector('.dp-status-score');if(!ring)return;
  ring.classList.add('dp75-small-ring');setGrade(aside,numeric(ring.dataset.score));
 });
 root.querySelectorAll('.dp74-rhythm-flow-score').forEach(aside=>{
  aside.classList.add('dp75-rhythm-aside');const ring=aside.querySelector('.dp-status-score');if(!ring)return;
  ring.classList.add('dp75-small-ring');setGrade(aside,numeric(ring.dataset.score));
 });
}
function cleanRhythm(root){
 if(Number(state.deepType)!==0)return;
 root.querySelectorAll('.dp66-rhythm-short,.dp68-rhythm-chart').forEach(card=>{
  card.classList.add('dp75-heart-rhythm');
  const inner=card.querySelector('.dp-status-score');
  if(inner)inner.classList.add('dp75-small-ring');
  const parent=card.querySelector('.dp69-score-aside,.dp70-rhythm-aside,.dp68-rhythm-score');
  if(parent&&inner){parent.classList.add('dp75-heart-rhythm-aside');setGrade(parent,numeric(inner.dataset.score));}
 });
}
const prevDeep=deepView;
deepView=function(){
 const root=toFragment(prevDeep());
 if(!state.detail){try{
  alignMain(root);alignHeartVitals(root);alignMetricRings(root);cleanRhythm(root);
 }catch(e){console.warn('DeepPet V8.75 layout fallback',e)}}
 return toMarkup(root);
};
function friendlyIcon(el){
 if(!el)return;
 el.classList.add('dp75-nearby-icon');
 el.innerHTML='<img src="assets/icons/nearby-pets.svg" alt="" aria-hidden="true" width="50" height="50">';
}
const prevMe=meView;
meView=function(){const root=toFragment(prevMe());root.querySelectorAll('.garden-entry-icon').forEach(friendlyIcon);return toMarkup(root)};
const prevGarden=gardenView;
gardenView=function(){const root=toFragment(prevGarden());const intro=root.querySelector('.garden-top');if(intro&&!intro.querySelector('.dp75-garden-logo')){
 const icon=document.createElement('img');icon.className='dp75-garden-logo';icon.src='assets/icons/nearby-pets.svg';icon.alt='';icon.setAttribute('aria-hidden','true');intro.prepend(icon);
}return toMarkup(root)};
})();
