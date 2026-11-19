/* DeepPet V10.72 — one DOM contract for every pet's Health food and care rows.
 * Real readings may change values, never component shape or spacing.
 */
(function(root){'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const noData=()=>state.emptyPreview===true||(typeof selectedBlank==='function'&&selectedBlank())||root.DeepPetUX1068?.isEmpty?.()===true;
 const foodLabel=()=>L('飲食目標','Food target','食事目標','식사 목표');
 const dailyLabel=()=>L('每日飲食目標','Daily food target','毎日の食事目標','일일 식사 목표');
 const unavailableLabel=()=>L('暫無數據','No data yet','データなし','아직 데이터 없음');
 const careRows=()=>({
  'recovery-care':{
   title:L('恢復情況','Recovery status','回復状況','회복 상황'),
   subtitle:L('生病、術後以及日常恢復追蹤','Track illness, post-surgery and daily recovery','病気・術後・日常の回復を記録','질병·수술 후·일상 회복 추적'),
   icon:'activity',background:'#edf6ff'
  },
  notes:{
   title:L('額外記錄','Additional records','追加記録','추가 기록'),
   subtitle:L('記錄觀察變化與預防反饋','Record observed changes and preventive feedback','観察の変化と予防ケアの結果を記録','관찰 변화와 예방 관리 결과 기록'),
   icon:'notes',background:'#edf2ff'
  }
 });
 function normalizeCards(){
  if(state.tab!=='health'||state.detail)return;
  if(document.querySelector('#app .dp1075-health-page'))return;
  const list=document.querySelector('#app .dp1070-health-page .dp1063-care-list');
  if(!list)return;
  const blank=noData();
  const food=list.querySelector(':scope > .food-feature');
  if(food){
   // A score or an automatically computed estimate is not an actual diet log.
   // Only render a target for a registered pet with usable measurements.
   const kcal=blank?null:(typeof targetFood==='function'?Number(targetFood()):NaN);
   const calories=Number.isFinite(kcal)&&kcal>0?`${Math.round(kcal)} kcal`:unavailableLabel();
   food.className='card food-feature dp1072-food';
   food.setAttribute('data-action','health-detail');food.setAttribute('data-page','food');
   food.innerHTML=`<span class="dp1072-food-icon" aria-hidden="true">${vicon('food',26)}</span><span class="dp1072-food-copy"><strong class="dp1072-food-title">${foodLabel()}</strong><small class="dp1072-food-subtitle">${dailyLabel()}</small></span><span class="dp1072-food-calories">${calories}</span>`;
  }
  const rules=careRows();
  for(const [page,rule] of Object.entries(rules)){
   const items=[...list.querySelectorAll(`.health-item[data-page="${page}"]`)];
   const item=items.shift();if(!item)continue;
   for(const duplicate of items)duplicate.remove();
   // Same child tags, same icon size and same component classes on Milo,
   // Lucky and the entirely blank profile. Preserve the existing action.
   item.className='health-item dp1071-shared-row dp1072-uniform-care';
   item.setAttribute('data-action','health-detail');
   item.innerHTML=`<span class="thumb" style="background:${rule.background}">${vicon(rule.icon,23)}</span><span class="grow"><div class="lbl">${rule.title}</div><div class="hint">${rule.subtitle}</div></span>${vicon('chev',19)}`;
  }
 }
 const before=render;
 render=function(...args){const value=before.apply(this,args);normalizeCards();return value;};
 root.DeepPetUX1072=Object.freeze({version:'10.72',normalizeCards,foodLabel,dailyLabel,careRows});
})(window);
