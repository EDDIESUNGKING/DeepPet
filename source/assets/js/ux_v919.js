/* DeepPet V9.19: UI displays score-reconciliation provenance, never a second formula. */
(function(){'use strict';
function lang(zht,zh,en,ko,ja){return state.lang==='zh'?zh:state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?(ja||en):zht;}
function renderEvidence(){
 // A last recorded day is not necessarily today. Never label yesterday's
 // evidence or event count as today's when the collar was not worn today.
 const today=iso(localDate());
 const result=window.DeepPetSignalScoring?.getDaily(state.dog)?.find(x=>x?.date===today);
 if(!result||state.detail||state.modal||selectedBlank()||dp58FreshPet()||isFreePet())return;
 const evidence=result.integrity||{};
 if(state.tab==='home'){
  const target=document.querySelector('#app .summary-card, #app .dp-health-overview, #app .dp-today-summary');
  if(target){
   let info=target.querySelector('.dp919-score-evidence');
   if(!info){info=document.createElement('p');info.className='dp919-score-evidence';target.append(info);}
   const parts=[];
   // Heart/breathing events belong exclusively to the emergency-alert module.
   // Examination history belongs to the long-term Pet Wellness Model (Me).
   // Never imply that uploading a report changes today's sensor result.
   if(!evidence.hasValidHrv)parts.push(lang('HRV 尚無有效逐搏資料','HRV 尚无有效逐搏数据','Beat-to-beat HRV not yet available','HRV 데이터 부족','HRV の有効データ不足'));
   info.textContent=parts.join(' · ');
   info.hidden=!parts.length;
  }
 }
}
const priorRender=render;
render=function(reset=false){priorRender(reset);renderEvidence();};
// A user arriving from Home's alert should return Home, not to a Deep tab
// they never selected. Deep-origin wave views continue using their own back route.
const previousAction=onAction;
onAction=function(target){
 const action=target?.dataset?.action;
 if(action==='dp911-alert-open')state.dp919AlertReturnTab=state.tab;
 if(action==='dp90-wave-back'&&state.dp919AlertReturnTab){
  const back=state.dp919AlertReturnTab;state.dp919AlertReturnTab=null;
  state.detail=null;state.dp905WaveMode=null;state.dp905WaveRange=null;
  state.tab=back;render(true);return;
 }
 return previousAction(target);
};
window.DeepPetAudit919={version:'9.19',snapshot:(petIndex=state.dog)=>{
 const all=DeepPetSignalScoring.getDaily(petIndex);
 return {pet:petIndex,daily:all.map(x=>({date:x?.date,scores:x?.scores,alerts:x?.integrity?.alerts||[],reportIndex:x?.reportEvidence?.score??null,integrity:x?.integrity?{eventGate:x.integrity.eventGradeGate,reportGate:x.integrity.reportGradeGate}:null})),seven:DeepPetBCG.periodScores(all,7),thirty:DeepPetBCG.periodScores(all,30)};
}};
})();
