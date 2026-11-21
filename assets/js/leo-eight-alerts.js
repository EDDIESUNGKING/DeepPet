/* DeepPet V10.139 Leo gallery-only visual fixture.
 * Six additional, non-diagnostic OBSERVATION cards from Leo's own existing
 * minute-level sample readings. They are NOT verified sudden-change events;
 * no clinical detector, scoring, samples, persisted data or other pet changes.
 * Two existing detected urgent cards remain intact. */
(function(){'use strict';
 let expanded=false,ownerKey='';
 const htmlEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const dayClock=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
 const l=(tw,zh,en,ja,ko)=>({zht:tw,zh,en,ja,ko})[state.lang]||tw;
 const isLeo=()=>Number(state.dog)===3 &&
   String(allPets()[3]?.name||'').toLowerCase()==='leo' &&
   !state.emptyPreview && !(typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements());
 const specs=[
  {minute:595,kind:'breath',label:()=>l('呼吸偏快，請核對','呼吸偏快，请核对','Breathing faster than usual','呼吸が速め・要確認','호흡이 빠름 · 확인')},
  {minute:248,kind:'heart',label:()=>l('夜間心率偏高','夜间心率偏高','Elevated overnight heart rate','夜間の心拍が高め','야간 심박 높음')},
  {minute:211,kind:'breath',label:()=>l('安靜時呼吸偏快','安静时呼吸偏快','Fast breathing at rest','安静時の呼吸が速め','안정 시 호흡 빠름')},
  {minute:142,kind:'heart',label:()=>l('心率較平常偏高','心率较平常偏高','Higher-than-usual heart rate','普段より心拍が高め','평소보다 높은 심박')},
  {minute:104,kind:'breath',label:()=>l('呼吸狀態需確認','呼吸状态需确认','Breathing needs a check','呼吸の状態を確認','호흡 상태 확인')},
  {minute:38,kind:'heart',label:()=>l('心率變化需留意','心率变化需留意','Heart rate needs review','心拍の変化を確認','심박 변화 확인')}
 ];
 function sampleCards(){
  const date=typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):'';
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return [];
  let traces;
  try{traces=dpSignals(date,['heart','breath']);}catch{return [];}
  if(!Array.isArray(traces?.heart)||traces.heart.length!==1440||
     !Array.isArray(traces?.breath)||traces.breath.length!==1440)return [];
  return specs.flatMap(spec=>{
   const val=traces[spec.kind][spec.minute];
   if(!Number.isFinite(val)||val<=0)return [];
   const unit=spec.kind==='heart'?'bpm':l('次／分','次/分','/min','回／分','회/분');
   const time=dayClock(spec.minute);
   const text=`${spec.label()} · ${Math.round(val)} ${unit}`;
   const el=document.createElement('button');el.type='button';
   el.className='dp936-alert-item dp1059-alert-item dp141-leo-observation';
   const d=el.dataset;d.action='dp1059-alert-open';d.kind=spec.kind;d.date=date;d.minute=String(spec.minute);
   d.value=String(Number(val.toFixed(2)));d.peer='';d.peerValue='';d.eventType='high';
   el.setAttribute('aria-label',text+' · '+date+' '+time);
   el.innerHTML=`<span class="dp1059-alert-symbol" aria-hidden="true">↑</span>`+
     `<span class="dp1059-alert-copy"><strong>${htmlEsc(text)}</strong><time datetime="${date}T${time}">${date} ${time}</time></span>`+
     `<span class="dp1059-alert-arrow" aria-hidden="true">›</span>`;
   return [el];
  });
 }
 function moment(el){
  const b=el.matches('.dp140-dual-alert')?el.querySelector('.dp140-alert-choice'):el;
  const m=Number(b?.dataset.minute);
  return Number.isFinite(m)?m:-1;
 }
 function showLeoGallery(){
  if(state.tab!=='home'||state.detail||!isLeo())return;
  const panel=document.querySelector('#app .dp936-urgent');if(!panel)return;
  const date=typeof iso==='function'?iso(localDate()):'';
  const identity=`${state.dog}|${date}|${state.lang}`;
  if(identity!==ownerKey){ownerKey=identity;expanded=false;}
  const current=[...panel.querySelectorAll('.dp1059-alert-list .dp1059-alert-item')];
  const samples=sampleCards();
  if(current.length<2||current.length>3||samples.length!==6)return;
  // Singapore local time includes the original 20:21 respiratory alert; before
  // that time only two source alerts exist. Both cases produce exactly eight.
  const extras=samples.slice(0,8-current.length);
  const all=[...current,...extras].sort((a,b)=>moment(b)-moment(a));
  const both=all.findIndex(el=>el.classList.contains('dp140-dual-alert'));
  if(all.length!==8||![2,3].includes(both))return; // third or fourth, never last
  panel.querySelectorAll('.dp1059-alert-list,.dp936-more,.dp936-urgent-empty').forEach(el=>el.remove());
  const list=document.createElement('div');list.className='dp1059-alert-list dp1060-alert-list dp141-leo-gallery';
  list.append(...(expanded?all:all.slice(0,3)));panel.append(list);
  const more=document.createElement('button');more.className='dp936-more dp1060-more dp141-leo-more';
  more.type='button';more.dataset.action='dp141-leo-more';more.setAttribute('aria-expanded',String(expanded));
  more.textContent=expanded?l('收起','收起','Show less','閉じる','접기'):l('More · 查看全部 8 項','More · 查看全部 8 项','More · View all 8','More · 8件すべて','More · 8개 모두 보기');
  panel.append(more);
 }
 document.addEventListener('click',function(event){
  const btn=event.target?.closest?.('[data-action="dp141-leo-more"]');
  if(!btn)return;
  event.preventDefault();event.stopImmediatePropagation();
  expanded=!expanded;render(false);
 },true);
 const previous=render;
 render=function(...args){const x=previous.apply(this,args);try{showLeoGallery();}catch(err){console.warn('Leo card gallery layout:',err);}return x;};
 window.DeepPetLeoGallery141=Object.freeze({version:'10.139-gallery8',sampleCount:6});
})();
