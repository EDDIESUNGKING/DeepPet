/* DeepPet — event-only emergency panel; daily low scores stay in insights. */
(function(root){
 'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:
  state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 let expanded=false,lastOwner=null;
 function timedAlerts(date){
  const source=root.DeepPetAlertEvidence936?.detectEvents?.()||[];
  const sampler=root.DeepPetUX1059?.gallerySignal;
  const valid=source.filter(e=>e?.source!=='daily-score'&&['heart','breath'].includes(e?.kind)&&e.date===date&&
   Number.isInteger(e.minute)&&e.minute>=0&&e.minute<1440&&Number.isFinite(e.value)&&e.value>0&&['high','low'].includes(e.type));
  const normalized=valid.map(e=>{
   const plotted=typeof sampler==='function'?sampler(e.kind,e.date,e.minute):null;
   return {...e,value:Number.isFinite(plotted)&&plotted>0?plotted:e.value};
  });
  const unique=new Map();
  for(const e of normalized){const key=`${e.kind}|${e.date}|${e.minute}`;if(!unique.has(key))unique.set(key,e);}
  return root.DeepPetUX1059?.combineCoincident?.([...unique.values()])||[...unique.values()];
 }
 function selectedIdentity(date){return `${state.dog}|${state.emptyPreview===true?'blank':'pet'}|${date}`;}
 function dailyScore(date){
  if(state.emptyPreview===true||typeof selectedBlank==='function'&&selectedBlank()||
   typeof dp58FreshPet==='function'&&dp58FreshPet()||typeof isFreePet==='function'&&isFreePet())return null;
  const row=root.DeepPetSignalScoring?.getDaily?.(state.dog)?.find(x=>x?.date===date);
  if(!row||!Number.isFinite(row.scores?.physiol))return null;
  if(typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements()&&
   (row.source!=='20hz-waveform'||row.integrity?.realEvidenceValid!==true))return null;
  return row;
 }
 function combineForHome(timed,low,rapid=[]){
  // A six-second change that later becomes a four-minute episode is one
  // owner event, not two competing alerts about the same interval.
  const duplicated=x=>rapid.some(e=>e.date===x.date&&Math.abs(Math.floor(e.localSecond/60)-x.minute)<=5&&
   e.observations.some(o=>(x.kind==='combined'?x.primary?.kind===o.kind||x.secondary?.kind===o.kind:x.kind===o.kind)&&o.type===x.type));
  const classify=e=>{
   // A sustained change and an abrupt change are distinct claims. Classify
   // from the SIX preceding plotted minutes, never the daily score. A real
   // second-stream emergency retains its independently verified rapid label.
   if(!e.baselinePhase||!['heart','breath'].includes(e.kind)||e.minute<7)return e.durationClass;
   try{
    const track=dpSignals(e.date,[e.kind])?.[e.kind];
    const prior=track?.[e.minute-6],now=track?.[e.minute];
    if(Number.isFinite(prior)&&Number.isFinite(now)&&
      Math.abs(now-prior)>=(e.kind==='heart'?32:10))return 'sudden';
   }catch{}
   return 'sustained';
  };
  // Home shows only three items before More. Without a consistent descending
  // clock order, yesterday's/early-morning episode can hide a newer emergency.
  // Retain second precision for real verified events and minute precision for
  // illustrated showroom episodes; daily-score statuses never join this list.
  const stamped=[...rapid,...timed.filter(x=>!duplicated(x)).map(x=>({...x,durationClass:classify(x),source:'timed'}))];
  const seconds=e=>Number.isInteger(e.localSecond)?e.localSecond:Number.isInteger(e.minute)?e.minute*60:-1;
  stamped.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||seconds(b)-seconds(a));
  return [...stamped,...low];
 }
 function renderHome(){
  if(state.tab!=='home')return;
  const panel=document.querySelector('#app .dp936-urgent');if(!panel)return;
  const date=iso(localDate()),owner=selectedIdentity(date);
  if(owner!==lastOwner){lastOwner=owner;expanded=false;}
  const scored=dailyScore(date);
  const rapid=root.DeepPetUrgentEvents1062?.forCurrentPet?.(date)||[];
  const contextual=root.DeepPetContextAlerts1061?.forCurrentPet?.(date,scored);
  // A real pet without enough context-matched VERIFIED minute history must
  // never fall back to the historical gallery trend detector. The independent
  // verified-second rapid event stream still works before 14 days.
  const realPet=typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements();
  const timed=scored?(Array.isArray(contextual)?contextual:realPet?[]:timedAlerts(date)):[];
  // V10.61: a low score is NOT itself an emergency event. Those values are
  // explained in the existing Home/Deep summaries. The urgent card shows only
  // independently detected, motion-gated, sustained timed episodes.
  const candidateEvents=combineForHome(timed,[],rapid);
  // V10.75: enforce a strict event channel. Low daily status belongs to the
  // Health/Deep insights, never the emergency panel even on legacy startup.
  const alerts=root.DeepPetEventTriage1075?.emergencyOnly?.(candidateEvents,{petId:state.dog,date})||candidateEvents.filter(e=>e.source!=='daily-status'&&e.source!=='daily-score');
  // Replace legacy rows and the V10.59 no-sudden-change placeholder, using
  // one single More control for the entire combined list.
  panel.querySelectorAll('.dp936-alert-item,.dp1059-alert-list,.dp936-urgent-empty,.dp936-more,.dp1060-alert-list').forEach(x=>x.remove());
  panel.querySelector('.dp936-urgent-head small')?.remove();
  panel.dataset.dp1060Pet=owner;
  // Keep this card in one fixed location even for blank or currently stable
  // profiles; the former early return left the empty case in an old layout.
  const summary=panel.closest?.('.home-page-v30')?.querySelector('.summary-card');
  if(summary&&summary.parentElement===panel.parentElement)summary.before(panel);
  if(!alerts.length){
   const p=document.createElement('p');p.className='dp936-urgent-empty';
   p.textContent=scored&&root.DeepPetContextAlerts1061?L('目前沒有符合條件的異常事件','No qualifying anomaly events','該当する変化はありません','해당 이상 변화 없음'):scored?L('目前沒有需要關注的變化','No changes need attention','注意が必要な変化はありません','주의할 변화가 없습니다'):
    L('尚無有效量測','No verified readings yet','有効な測定はまだありません','유효한 측정 기록이 없습니다');
   panel.append(p);return;
  }
  const list=document.createElement('div');list.className='dp1059-alert-list dp1060-alert-list';
  const visible=expanded?alerts:alerts.slice(0,3);
  list.innerHTML=visible.map(e=>e.source==='rapid'?root.DeepPetUrgentEvents1062.alertMarkup(e):root.DeepPetUX1059.alertMarkup(e)).join('');
  panel.append(list);
  if(alerts.length>3){
   const more=document.createElement('button');more.type='button';more.className='dp936-more dp1060-more';more.dataset.action='dp1060-more';
   more.textContent=expanded?L('收起','Show less','閉じる','접기'):'More';
   panel.append(more);
  }
 }
 document.addEventListener('click',e=>{
  const button=e.target.closest?.('[data-action="dp1060-more"]');
  if(!button)return;
  e.preventDefault();e.stopImmediatePropagation();
  expanded=!expanded;render(false);
 },true);
 const oldRender=render;
 render=function(reset=false){oldRender(reset);renderHome();};
 root.DeepPetUX1060={version:'10.75-event-only',combineForHome,timedAlerts};
})(window);
