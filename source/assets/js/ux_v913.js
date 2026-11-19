/* V9.13 — final data provenance and score-path guard.
   No new independent formulas. All numeric score queries read DeepPetSignalScoring.
*/
(function(){
 'use strict';
 const api=()=>window.DeepPetSignalScoring;
 if(!api())return;
 const LANG={zh:{hi:'資料不足',proxy:'波形時間精度不足，尚不能確認 RMSSD／SDNN'},zht:{hi:'資料不足',proxy:'波形時間精度不足，尚不能確認 RMSSD／SDNN'},en:{hi:'Insufficient data',proxy:'20 Hz timing not validated for RMSSD / SDNN'},ko:{hi:'자료 부족',proxy:'20Hz로 RMSSD/SDNN 정밀도가 검증되지 않음'},ja:{hi:'データ不足',proxy:'20HzではRMSSD・SDNNの精度未検証'}};
 function decorate(){
  const root=document.getElementById('app');if(!root)return;
  const lbl=LANG[state.lang]||LANG.en,cur=api().getDaily(state.dog),range=Number(state.range||1);
  const sub=range===1?[cur.find(x=>x?.date===deepChosenDate())||null]:window.DeepPetBCG.calendarWindow(cur,range,iso(localDate()));
  const hrvSupported=sub.filter(x=>Number.isFinite(x?.scores?.hrv));
  if(state.tab==='deep'&&Number(state.deepType)===0&&hrvSupported.length===0){
   root.querySelectorAll('.dp903-overview [data-dp903-metric="hrv"], .dp71-hrv, .dp-hrv-pair, .dp-hrv-visible').forEach(node=>{
    if(node.dataset.dp913Hrv==='1')return;
    node.dataset.dp913Hrv='1';
    // Preserve the HRV module, but never show synthetic minute-level NN ms values as measured RMSSD/SDNN.
    const textnodes=[...node.querySelectorAll('strong, b, .metric-value, .dp-hrv-number')];
    for(const el of textnodes){
     const context=(el.parentElement?.textContent||'');
     if(/RMSSD|SDNN/i.test(context)&&/\d/.test(el.textContent||''))el.textContent='—';
    }
    const note=document.createElement('p');note.className='dp913-provenance-note';note.textContent=lbl.proxy;
    if(!node.querySelector('.dp913-provenance-note'))node.append(note);
   });
  }
 }
 // Nightly 20:00–12:00 green/grey strips come from exactly the same three-channel
 // motion series as the candidate nightly rest-duration feature.
 nightSlotSequence=function(dayIndex){
  const rows=demoRecords(state.dog),row=rows[dayIndex];
  if(!row)return Array(32).fill('awake');
  const current=dpSignals(row.date,['activity']).activity;
  const previous=dayIndex>0?dpSignals(rows[dayIndex-1].date,['activity']).activity:current;
  const combined=previous.slice(1200,1440).concat(current.slice(0,720));
  return Array.from({length:32},(_,i)=>{
   const part=combined.slice(i*30,i*30+30).filter(Number.isFinite);
   return part.length&&part.reduce((a,b)=>a+b,0)/part.length<27?'sleep':'awake';
  });
 };
 const older=render;
 render=function(reset=false){older(reset);requestAnimationFrame(decorate);};
 if(document.readyState==='complete')requestAnimationFrame(decorate);
 else window.addEventListener('load',()=>requestAnimationFrame(decorate),{once:true});
})();
