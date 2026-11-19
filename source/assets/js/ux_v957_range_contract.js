/* V9.57: enforce the supported Deep analysis windows without changing Me baseline. */
(function(root){
 'use strict';
 const periods=Object.freeze([1,7,30]);
 const valid=value=>periods.includes(Number(value));
 const normalize=value=>valid(value)?Number(value):7;
 const priorRender=render;
 render=function(reset=false){
  if(state.tab==='deep')state.range=normalize(state.range);
  if(state.dp905WaveRange!=null)state.dp905WaveRange=normalize(state.dp905WaveRange);
  priorRender(reset);
  if(state.tab!=='deep')return;
  const app=document.getElementById('app');
  if(!app)return;
  for(const button of app.querySelectorAll('[data-action="range"],[data-dp931="period"],[data-dp936="energy-range"]')){
   const raw=button.dataset.value??button.dataset.days??button.dataset.range;
   if(!valid(raw))button.remove();
  }
 };
 root.DeepPetUX957={version:'9.57',periods:periods.slice(),normalize};
})(window);
