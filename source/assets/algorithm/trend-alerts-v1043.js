/* DeepPet V10.43 | context-matched, quality-gated personal change screening.
 * Exploratory wellness triage, NOT a validated airway/heart diagnostic.
 * The 14 earlier eligible wear days are required; current-day or future data
 * never enters the reference. Each alert also needs sustained low-motion data.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetTrendAlerts1043=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const median=a=>{const n=a.filter(finite).sort((x,y)=>x-y);return n.length?n[Math.floor(n.length/2)]/2+n[Math.floor((n.length-1)/2)]/2:null;};
 const dateOK=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T12:00:00Z'));
 // A supplied quality array is a positive assertion for EVERY accepted minute.
 // Missing/null/undefined entries are not silently promoted to good readings.
 const good=(h,b,m,quality,i)=>finite(h)&&finite(b)&&finite(m)&&h>5&&b>1&&m>=0&&m<24&&
  (!Array.isArray(quality)||quality[i]===true);
 const contextAt=(context,i)=>{
  if(!Array.isArray(context))return 'quiet';
  return context[i]==='sleep'?'sleep':context[i]==='rest'?'rest':context[i]==='quiet'?'quiet':null;
 };
 const normalizeDay=(x)=>{
  if(!dateOK(x?.date)||x.valid!==true||!Array.isArray(x.heart)||!Array.isArray(x.breath)||!Array.isArray(x.activity))return null;
  const h=[],b=[],byContext={sleep:{h:[],b:[]},rest:{h:[],b:[]}},len=Math.min(x.heart.length,x.breath.length,x.activity.length);
  for(let i=0;i<len;i++)if(good(x.heart[i],x.breath[i],x.activity[i],x.quality,i)){
   h.push(x.heart[i]);b.push(x.breath[i]);const key=contextAt(x.context,i);
   if(byContext[key]){byContext[key].h.push(x.heart[i]);byContext[key].b.push(x.breath[i]);}
  }
  // One day's context contribution must contain at least 30 genuinely valid
  // minutes; isolated sleep/rest snippets are not representative. The
  // historical daily median is weighted ONCE per date regardless of whether
  // that pet supplied 30 minutes or 10 hours on another date.
  const contexts={};for(const [name,g] of Object.entries(byContext))if(g.h.length>=30)
   contexts[name]={heart:median(g.h),breath:median(g.b),minutes:g.h.length};
  return h.length>=30&&b.length>=30?{date:x.date,heart:median(h),breath:median(b),contexts,minutes:h.length}:null;
 };
 const eventFor=(kind,direction,minute,value,reference,delta)=>{const severe=delta>=(kind==='heart'?.60:.80);return {kind,direction,minute,time:`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`,value,reference,diff:value-reference,relative:(value-reference)/reference,severity:severe?3:2,level:severe?'high':'medium',valid:true,delta};};
 function evaluate({date,heart,breath,activity,context=null,quality=null,valid=true,history=[]}={}){
  if(!dateOK(date)||valid!==true||!Array.isArray(heart)||!Array.isArray(breath)||!Array.isArray(activity))return {ready:false,reason:'invalid_current',events:[],joint:null};
  const cutoff=new Date(Date.parse(date+'T12:00:00Z')-45*86400000).toISOString().slice(0,10);
  const selected=new Map(),disputed=new Set();
  for(const row of history){const d=normalizeDay(row);if(!d||d.date>=date||d.date<cutoff)continue;
   const old=selected.get(d.date);
   if(!old||d.minutes>old.minutes){selected.set(d.date,d);disputed.delete(d.date);}
   else if(d.minutes===old.minutes&&JSON.stringify(d)!==JSON.stringify(old))disputed.add(d.date);
  }
  for(const date of disputed)selected.delete(date);
  const prior=[...selected.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-14);
  if(prior.length<14)return {ready:false,reason:'under_14_eligible_days',validBaselineDays:prior.length,events:[],joint:null};
  const refHeart=median(prior.map(x=>x.heart)),refBreath=median(prior.map(x=>x.breath));
  if(!finite(refHeart)||!finite(refBreath)||refHeart<=0||refBreath<=0)return {ready:false,reason:'no_valid_reference',events:[],joint:null};
  const reference=(rows)=>{
   // Do not call a seven-day subset a completed context-specific 14-day
   // reference: sleep and daytime rest must each have their own 14 days.
   if(rows.length<14)return null;
   const h=median(rows.map(x=>x.heart)),b=median(rows.map(x=>x.breath));
   if(!finite(h)||!finite(b)||h<=0||b<=0)return null;
   const mh=median(rows.map(x=>Math.abs(x.heart-h))),mb=median(rows.map(x=>Math.abs(x.breath-b)));
   return {heart:h,breath:b,days:rows.length,limits:{
    heartHigh:Math.max(h*1.35,h+Math.max(16,3*(mh||0))),
    heartLow:Math.min(h*.72,h-Math.max(15,3*(mh||0))),
    breathHigh:Math.max(b*1.5,b+Math.max(7,3*(mb||0))),
    breathLow:Math.min(b*.60,b-Math.max(6,3*(mb||0)))}};
  };
  const general=reference(prior),contextReferences={};
  for(const name of ['sleep','rest']){
   const days=prior.map(x=>x.contexts[name]).filter(Boolean);
   if(days.length>=14)contextReferences[name]=reference(days);
  }
  if(!general)return {ready:false,reason:'no_valid_reference',events:[],joint:null};
  const n=Math.min(heart.length,breath.length,activity.length,1440),best={};let joint=null;
  // A sudden event requires both a three-minute sustained deviation and a
  // preceding, similar-context, low-motion reference. This removes ordinary
  // after-exercise recovery and changes at a rest/sleep boundary.
  for(let i=13;i<n;i++){
   const window=[i-2,i-1,i];
   if(!window.every(k=>good(heart[k],breath[k],activity[k],quality,k)))continue;
   const ctx=contextAt(context,i);
   if(ctx===null||window.some(k=>contextAt(context,k)!==ctx))continue;
   // If the SDK explicitly identifies a context but lacks seven matched
   // historical days, do not substitute another physiological state.
   const ref=ctx==='quiet'?general:contextReferences[ctx];if(!ref)continue;
   const mh=median(window.map(k=>heart[k])),mb=median(window.map(k=>breath[k]));
   // An exercise/motion transition within the five preceding minutes is a
   // common non-emergency reason for a raised heart rate. Reject it here.
   if(![i-7,i-6,i-5,i-4,i-3].every(k=>good(heart[k],breath[k],activity[k],quality,k)&&contextAt(context,k)===ctx))continue;
   const priorMinutes=[];
   for(let k=i-12;k<=i-4;k++)if(good(heart[k],breath[k],activity[k],quality,k)&&contextAt(context,k)===ctx)priorMinutes.push(k);
   if(priorMinutes.length<7)continue;
   const earlierHeart=median(priorMinutes.map(k=>heart[k])),earlierBreath=median(priorMinutes.map(k=>breath[k]));
   if(earlierHeart<ref.heart*.78||earlierHeart>ref.heart*1.22||
      earlierBreath<ref.breath*.68||earlierBreath>ref.breath*1.32)continue;
   const limits=ref.limits;
   const flags={heartHigh:window.every(k=>heart[k]>=limits.heartHigh),heartLow:window.every(k=>heart[k]<=limits.heartLow),
    breathHigh:window.every(k=>breath[k]>=limits.breathHigh),breathLow:window.every(k=>breath[k]<=limits.breathLow)};
   for(const [key,hit] of Object.entries(flags)){
    if(!hit)continue;
    const kind=key.startsWith('heart')?'heart':'breath',direction=key.endsWith('High')?'high':'low';
    const v=kind==='heart'?mh:mb,base=kind==='heart'?ref.heart:ref.breath;
    const candidate={...eventFor(kind,direction,i,v,base,Math.abs(v-base)/base),context:ctx,baselineDays:ref.days,
     evidenceMinutes:window.length,priorComparableMinutes:priorMinutes.length};
    if(!best[key]||candidate.delta>best[key].delta)best[key]=candidate;
   }
   if(!flags.heartHigh||!(flags.breathHigh||flags.breathLow))continue;
   const hrJump=mh>=earlierHeart*1.16,rrJump=flags.breathHigh?mb>=earlierBreath*1.22:mb<=earlierBreath*.78;
   if(!hrJump||!rrJump)continue;
   const candidate={kind:'joint',direction:flags.breathHigh?'breath_high_hr_high':'breath_low_hr_high',
    minute:i,time:`${String(Math.floor(i/60)).padStart(2,'0')}:${String(i%60).padStart(2,'0')}`,
    heart:mh,breath:mb,referenceHeart:ref.heart,referenceBreath:ref.breath,previousHeart:earlierHeart,
    previousBreath:earlierBreath,context:ctx,baselineDays:ref.days,priorComparableMinutes:priorMinutes.length,
    severity:3,level:'high',valid:true,delta:(mh/ref.heart-1)+Math.abs(mb/ref.breath-1)};
   if(!joint||candidate.delta>joint.delta)joint=candidate;
  }
  const events=Object.values(best).sort((a,b)=>b.delta-a.delta);
  return {ready:true,validBaselineDays:prior.length,reference:{heart:refHeart,breath:refBreath},
   contextReferences:Object.fromEntries(Object.entries(contextReferences).map(([name,v])=>[name,{heart:v.heart,breath:v.breath,days:v.days}])),events,joint};
 }
 return Object.freeze({version:'10.43',evaluate,median,normalizeDay});
});
