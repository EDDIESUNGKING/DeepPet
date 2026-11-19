/* DeepPet V10.99 — focused alert landing and deterministic Home return.
 * Presentation/navigation only: does not touch measurements, scores, pets
 * or the deliberately simulated checkout/showroom. */
(function(root){'use strict';
 const matches=(focus)=>focus&&focus.pet===state.dog&&state.tab==='deep'&&
   state.detail==='dp90-waveform'&&state.dp90WaveDate===focus.date&&
   state.dp90WaveKind===focus.kind&&state.dp932WaveMinute===focus.minute;
 function landing(){
  const page=document.querySelector('#app .dp932-wave-page, #app .dp904-wave-page');
  if(!page)return null;
  const section=page.querySelectorAll('.dp932-wave-section, .dp904-wave-card')[1];
  return section||null;
 }
 function focusAlert(){
  const token=state.dp1059AlertFocus;
  if(!state.dp1099AlertNeedsScroll||!matches(token))return false;
  const element=landing();if(!element)return false;
  element.classList.add('dp1099-alert-destination');
  element.dataset.dp1099Time=`${token.date} ${String(Math.floor(token.minute/60)).padStart(2,'0')}:${String(token.minute%60).padStart(2,'0')}`;
  // Wait for all nested legacy render wrappers to complete and for the card
  // to have its final height. Scroll the actual mobile scroll container.
  const date=token.date,kind=token.kind,minute=token.minute,pet=token.pet;
  const scroll=()=>{
   if(!matches({date,kind,minute,pet})||!element.isConnected)return;
   try{element.scrollIntoView({block:'start',inline:'nearest',behavior:'instant'});}
   catch{element.scrollIntoView(true);}
  };
  if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>requestAnimationFrame(scroll));
  else setTimeout(scroll,0);
  state.dp1099AlertNeedsScroll=false;
  return true;
 }
 function energyLanding(){
  if(!state.dp1099EnergyNeedsScroll||state.tab!=='deep'||state.deepType!==2||state.detail)return false;
  const section=document.querySelector('#app .dp932-energy-changes');if(!section)return false;
  section.classList.add('dp1099-alert-destination');
  if(state.dp919AlertReturnTab==='home'&&!section.querySelector('[data-action="dp1099-home-return"]')){
   const back=document.createElement('button');back.type='button';back.dataset.action='dp1099-home-return';
   back.className='dp1099-home-return';back.textContent=state.lang==='en'?'← Back to Home':'← 返回首頁';
   section.prepend(back);
  }
  const targetMinute=state.dp932EnergyMinute,pet=state.dog;
  const scroll=()=>{if(state.tab!=='deep'||state.deepType!==2||state.dog!==pet||state.dp932EnergyMinute!==targetMinute||!section.isConnected)return;
   try{section.scrollIntoView({block:'start',behavior:'instant'});}catch{section.scrollIntoView(true);}};
  if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>requestAnimationFrame(scroll));else setTimeout(scroll,0);
  state.dp1099EnergyNeedsScroll=false;return true;
 }
 document.addEventListener('click',e=>{
  if(!e.target.closest?.('[data-action="dp1099-home-return"]'))return;
  e.preventDefault();e.stopImmediatePropagation();
  state.dp919AlertReturnTab=null;state.dp1099EnergyNeedsScroll=false;
  state.tab='home';state.detail=null;render(true);
 },true);
 const oldRender=render;
 render=function(reset=false){oldRender(reset);focusAlert();energyLanding();};
 root.DeepPetUX1099=Object.freeze({version:'10.99',landing,focusAlert,energyLanding});
})(window);
