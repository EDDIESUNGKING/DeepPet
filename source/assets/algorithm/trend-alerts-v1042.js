/* DeepPet V10.42 | quality-gated personal vital-change screening.
 * Exploratory wellness triage, NOT a validated airway/heart diagnostic.
 * The 14 earlier eligible wear days are required; current-day or future data
 * never enters the reference. Each alert also needs sustained low-motion data.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetTrendAlerts1042=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const median=a=>{const n=a.filter(finite).sort((x,y)=>x-y);return n.length?n[Math.floor(n.length/2)]/2+n[Math.floor((n.length-1)/2)]/2:null;};
 const dateOK=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T12:00:00Z'));
 const good=(h,b,m,quality)=>finite(h)&&finite(b)&&finite(m)&&h>5&&b>1&&m>=0&&m<24&&quality!==false;
 const normalizeDay=(x)=>{
  if(!dateOK(x?.date)||x.valid!==true||!Array.isArray(x.heart)||!Array.isArray(x.breath)||!Array.isArray(x.activity))return null;
  const h=[],b=[],len=Math.min(x.heart.length,x.breath.length,x.activity.length);
  for(let i=0;i<len;i++)if(good(x.heart[i],x.breath[i],x.activity[i],x.quality?.[i])){h.push(x.heart[i]);b.push(x.breath[i]);}
  return h.length>=30&&b.length>=30?{date:x.date,heart:median(h),breath:median(b)}:null;
 };
 const eventFor=(kind,direction,minute,value,reference,delta)=>{const severe=delta>=(kind==='heart'?.60:.80);return {kind,direction,minute,time:`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`,value,reference,diff:value-reference,relative:(value-reference)/reference,severity:severe?3:2,level:severe?'high':'medium',valid:true,delta};};
 function evaluate({date,heart,breath,activity,quality=null,valid=true,history=[]}={}){
  if(!dateOK(date)||valid!==true||!Array.isArray(heart)||!Array.isArray(breath)||!Array.isArray(activity))return {ready:false,reason:'invalid_current',events:[],joint:null};
  const cutoff=new Date(Date.parse(date+'T12:00:00Z')-45*86400000).toISOString().slice(0,10);
  const selected=new Map();
  for(const row of history){const d=normalizeDay(row);if(d&&d.date<date&&d.date>=cutoff)selected.set(d.date,d);}
  const prior=[...selected.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-14);
  if(prior.length<14)return {ready:false,reason:'under_14_eligible_days',validBaselineDays:prior.length,events:[],joint:null};
  const refHeart=median(prior.map(x=>x.heart)),refBreath=median(prior.map(x=>x.breath));
  if(!finite(refHeart)||!finite(refBreath)||refHeart<=0||refBreath<=0)return {ready:false,reason:'no_valid_reference',events:[],joint:null};
  const madH=median(prior.map(x=>Math.abs(x.heart-refHeart))),madB=median(prior.map(x=>Math.abs(x.breath-refBreath)));
  const limits={
   heartHigh:Math.max(refHeart*1.35,refHeart+Math.max(16,3*(madH||0))),
   heartLow:Math.min(refHeart*.72,refHeart-Math.max(15,3*(madH||0))),
   breathHigh:Math.max(refBreath*1.5,refBreath+Math.max(7,3*(madB||0))),
   breathLow:Math.min(refBreath*.60,refBreath-Math.max(6,3*(madB||0)))
  };
  const n=Math.min(heart.length,breath.length,activity.length,1440),best={};let joint=null;
  // Three consecutive one-minute readings indicate sustained change, not a
  // single motion spike or an isolated telemetry dropout. 10-minute earlier
  // quiet context is required for the joint "sudden" classification.
  for(let i=13;i<n;i++){
   const window=[i-2,i-1,i];
   if(!window.every(k=>good(heart[k],breath[k],activity[k],quality?.[k])))continue;
   const mh=median(window.map(k=>heart[k])),mb=median(window.map(k=>breath[k]));
   const flags={heartHigh:window.every(k=>heart[k]>=limits.heartHigh),heartLow:window.every(k=>heart[k]<=limits.heartLow),
    breathHigh:window.every(k=>breath[k]>=limits.breathHigh),breathLow:window.every(k=>breath[k]<=limits.breathLow)};
   for(const [key,hit] of Object.entries(flags)){
    if(!hit)continue;
    const kind=key.startsWith('heart')?'heart':'breath',direction=key.endsWith('High')?'high':'low';
    const v=kind==='heart'?mh:mb,ref=kind==='heart'?refHeart:refBreath;
    const candidate=eventFor(kind,direction,i,v,ref,Math.abs(v-ref)/ref);
    if(!best[key]||candidate.delta>best[key].delta)best[key]=candidate;
   }
   if(!flags.heartHigh||!(flags.breathHigh||flags.breathLow))continue;
   const before=[];
   for(let k=i-12;k<=i-4;k++)if(good(heart[k],breath[k],activity[k],quality?.[k]))before.push(k);
   if(before.length<7)continue;
   const earlierHeart=median(before.map(k=>heart[k])),earlierBreath=median(before.map(k=>breath[k]));
   const hrJump=mh>=earlierHeart*1.16,rrJump=flags.breathHigh?mb>=earlierBreath*1.22:mb<=earlierBreath*.78;
   if(!hrJump||!rrJump)continue;
   const candidate={kind:'joint',direction:flags.breathHigh?'breath_high_hr_high':'breath_low_hr_high',
    minute:i,time:`${String(Math.floor(i/60)).padStart(2,'0')}:${String(i%60).padStart(2,'0')}`,
    heart:mh,breath:mb,referenceHeart:refHeart,referenceBreath:refBreath,previousHeart:earlierHeart,
    previousBreath:earlierBreath,severity:3,level:'high',valid:true,delta:(mh/refHeart-1)+Math.abs(mb/refBreath-1)};
   if(!joint||candidate.delta>joint.delta)joint=candidate;
  }
  const events=Object.values(best).sort((a,b)=>b.delta-a.delta);
  return {ready:true,validBaselineDays:prior.length,reference:{heart:refHeart,breath:refBreath},events,joint};
 }
 return Object.freeze({version:'10.42',evaluate,median,normalizeDay});
});
