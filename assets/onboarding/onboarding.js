/* DeepPet V8.63: exact original PNGs; all controls are invisible hit targets. */
(()=>{
 'use strict';
 const root=document.getElementById('dp-intro-root');if(!root)return;
 const stage=root.querySelector('.dp-intro-stage');
 const frame=root.querySelector('.dp-intro-frame');
 const rail=root.querySelector('.dp-intro-rail');
 const slides=[...root.querySelectorAll('.dp-intro-slide')];
 const dots=[...root.querySelectorAll('[data-intro-dot]')];
 const start=root.querySelector('.dp-intro-start-zone');
 let current=0,gesture=null,lock=false;
 const app=document.getElementById('app');
 document.body.classList.add('dp-intro-active');
 if(app)app.setAttribute('inert','');
 function layout(){
  if(!stage.isConnected)return;
  const bounds=frame.getBoundingClientRect();
  const scale=Math.min(bounds.width/941,bounds.height/1672);
  stage.style.width=`${Math.floor(941*scale)}px`;
  stage.style.height=`${Math.floor(1672*scale)}px`;
 }
 function go(num){
  current=Math.min(4,Math.max(0,Number(num)||0));
  rail.style.transform=`translate3d(-${current*100}%,0,0)`;
  start.hidden=current!==4;
  slides.forEach((slide,i)=>slide.setAttribute('aria-hidden',i===current?'false':'true'));
  dots.forEach((dot,i)=>dot.setAttribute('aria-current',i===current?'step':'false'));
 }
 function finish(){
  if(current!==4||lock)return;lock=true;
  // Every Get Started opens the FIRST showcase pet (Milo), not the
  // last pet saved in this browser. Do not clear any pet's saved data.
  // A render is mandatory: removing the intro alone kept stale Luna DOM.
  try {
   if(typeof dpActivatePet==='function' && dpActivatePet(0)){
    state.tab='home';state.detail=null;state.modal='';
    render(true);
   } else if(typeof state!=='undefined'){
    state.dog=0;state.emptyPreview=false;state.tab='home';
    state.detail=null;state.modal='';
    if(typeof render==='function')render(true);
   }
  } catch(err){
   console.error('DeepPet introduction initialization failed',err);
   if(typeof state!=='undefined'){
    state.dog=0;state.tab='home';state.detail=null;state.modal='';
    if(typeof render==='function')render(true);
   }
  }
  document.body.classList.remove('dp-intro-active');
  root.remove();
  if(app)app.removeAttribute('inert');
 }
 start.addEventListener('click',finish);
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
 frame.addEventListener('touchstart',e=>{
  if(e.touches.length===1)gesture={x:e.touches[0].clientX,y:e.touches[0].clientY,kind:'touch'};
 },{passive:true});
 frame.addEventListener('touchend',e=>{
  if(!gesture||gesture.kind!=='touch'||e.changedTouches.length!==1)return;
  const dx=e.changedTouches[0].clientX-gesture.x,dy=e.changedTouches[0].clientY-gesture.y;
  gesture=null;if(Math.abs(dx)>44&&Math.abs(dx)>Math.abs(dy)*1.15)go(current+(dx<0?1:-1));
 },{passive:true});
 frame.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button===0)gesture={x:e.clientX,y:e.clientY,kind:'mouse'};
 });
 frame.addEventListener('pointerup',e=>{
  if(e.pointerType!=='mouse'||!gesture||gesture.kind!=='mouse')return;
  const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
  gesture=null;if(Math.abs(dx)>44&&Math.abs(dx)>Math.abs(dy)*1.15)go(current+(dx<0?1:-1));
 });
 document.addEventListener('keydown',e=>{
  if(!root.isConnected)return;
  if(e.key==='ArrowRight'){e.preventDefault();go(current+1)}
  if(e.key==='ArrowLeft'){e.preventDefault();go(current-1)}
  if((e.key==='Enter'||e.key===' ')&&current===4&&!e.target.closest('button')){e.preventDefault();finish()}
 });
 window.addEventListener('resize',layout,{passive:true});
 window.addEventListener('orientationchange',layout,{passive:true});
 // No localStorage bypass: reloading always starts at page 1.
 layout();go(0);
 window.__DeepPetOnboarding={get index(){return current},get visible(){return root.isConnected},go,finish};
})();
