/* DeepPet V10.66: owner-scoped retrospective verification of sudden events.
 * Adds no synthetic alerts, samples, diagnoses, pages, or numerical scores. */
(function(root){'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:
  state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 function historyForCurrentPet(days){
  if(![7,30].includes(days)||state.emptyPreview===true||
   typeof selectedBlank==='function'&&selectedBlank()||
   typeof dp58FreshPet==='function'&&dp58FreshPet()||
   typeof isFreePet==='function'&&isFreePet())return [];
  const id=typeof dpCurrentPetId==='function'?String(dpCurrentPetId()):'';
  if(!id||!Array.isArray(state.dpRapidEventsByPet?.[id]))return [];
  const today=typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):null;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(today||''))return [];
  const from=new Date(Date.parse(today+'T00:00:00Z')-(days-1)*86400000).toISOString().slice(0,10);
  return state.dpRapidEventsByPet[id].filter(e=>e?.source==='rapid'&&e.petId===id&&
   /^\d{4}-\d{2}-\d{2}$/.test(e.date||'')&&e.date>=from&&e.date<=today&&
   Number.isFinite(e.at)&&Number.isInteger(e.localSecond)&&e.localSecond>=0&&e.localSecond<86400&&
   Array.isArray(e.observations)&&e.observations.length).slice().sort((a,b)=>b.at-a.at);
 }
 function historyMarkup(events,days){
  if(!events.length)return '';
  const item=root.DeepPetUrgentEvents1062?.alertMarkup;
  if(typeof item!=='function')return '';
  const count=events.length;
  return `<details class="card dp1066-history"><summary><span>${L('突發變化紀錄','Sudden-change history','急変の記録','급변 기록')}</span><small>${days}${L('天',' days','日','일')} · ${count}${L('次',' events','件','건')}</small></summary><div class="dp1066-history-list">${events.map(item).join('')}</div></details>`;
 }
 function enhance(){
  if(state.tab!=='deep'||state.detail||Number(state.deepType)!==0)return;
  const days=Number(state.range);if(days!==7&&days!==30)return;
  const events=historyForCurrentPet(days);if(!events.length)return;
  const deep=document.querySelector('#app .dp-owner-deep');
  if(!deep||deep.querySelector('.dp1066-history'))return;
  const container=document.createElement('div');container.innerHTML=historyMarkup(events,days);
  const section=container.firstElementChild;if(!section)return;
  const spacer=deep.querySelector(':scope > .footer-space');
  if(spacer)deep.insertBefore(section,spacer);else deep.appendChild(section);
 }
 const before=render;
 render=function(...args){const result=before.apply(this,args);enhance();return result;};
 root.DeepPetUX1066=Object.freeze({version:'10.66',historyForCurrentPet,historyMarkup,enhance});
})(window);
