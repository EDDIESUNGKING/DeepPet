/* DeepPet V10.61 — context-matched, personal-baseline anomaly candidates.
 * Research-policy thresholds, NOT validated veterinary disease thresholds.
 * Never infer an acute event from a low daily score. Only valid timed signals
 * qualify. Real 20 Hz data requires an independently verified SDK event feed. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DeepPetContextAlertAlgorithm1061=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const med=a=>{const s=a.filter(Number.isFinite).sort((x,y)=>x-y);if(!s.length)return null;const i=s.length>>1;return s.length%2?s[i]:(s[i-1]+s[i])/2;};
 const finite=(x,min,max)=>Number.isFinite(x)&&x>=min&&x<=max;
 const valuesValid=(s)=>s&&['heart','breath','activity'].every(k=>Array.isArray(s[k])&&s[k].length===1440);
 const bounds={heart:[35,260],breath:[6,75]};
 const clockContext=(minute,motion)=>{
  if(!Number.isFinite(motion)||motion>22)return null;
  return minute<420||minute>=1260?'night-rest':'day-rest';
 };
 function dayRepresentative(series,kind,context){
  if(!valuesValid(series)||!bounds[kind])return null;
  const vals=[];
  for(let m=0;m<1440;m++)if(clockContext(m,series.activity[m])===context&&
   finite(series[kind][m],...bounds[kind]))vals.push(series[kind][m]);
  return vals.length>=20?med(vals):null;
 }
 function baseline(history,date,kind,context){
  const selected=new Map();
  for(const x of history||[]){
   if(!x||x.valid!==true||typeof x.date!=='string'||x.date>=date||
    (Date.parse(date+'T12:00:00Z')-Date.parse(x.date+'T12:00:00Z'))>45*86400000)continue;
   if(!selected.has(x.date))selected.set(x.date,x);
  }
  const prior=[...selected.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-14);
  const values=prior.map(x=>dayRepresentative(x.series,kind,context)).filter(Number.isFinite);
  if(values.length<3)return {ready:false,eligibleDays:values.length,center:null,spread:null};
  const center=med(values),mad=med(values.map(v=>Math.abs(v-center)))||0;
  return {ready:values.length>=14,eligibleDays:values.length,center,
   spread:Math.max(1.4826*mad,center*(kind==='heart'?.055:.07),kind==='heart'?3:1)};
 }
 function provisionalFromEarlierToday(series,kind,context,minute){
  // During the first three verified days, use at least 45 older quiet-time
  // minutes from this very pet. Exclude the 20 minutes immediately preceding
  // the candidate so a growing episode cannot define its own baseline.
  const values=[];
  for(let m=Math.max(0,minute-260);m<minute-20;m++)if(
   clockContext(m,series.activity[m])===context&&finite(series[kind][m],...bounds[kind]))values.push(series[kind][m]);
  if(values.length<45)return null;
  const center=med(values),spread=med(values.map(v=>Math.abs(v-center)))||0;
  return {ready:false,eligibleDays:0,center,spread:Math.max(1.4826*spread,
   center*(kind==='heart'?.08:.10),kind==='heart'?5:1.5),sameDayOnly:true};
 }
 function detect({date,series,history=[],maxPerMetric=4}={}){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!valuesValid(series))return [];
  const out=[];
  for(const kind of ['heart','breath']){
   const perKind=[];const historyByContext=Object.fromEntries(['night-rest','day-rest']
    .map(k=>[k,baseline(history,date,kind,k)]));
   let sinceActivity=999;
   for(let minute=12;minute<1428;minute++){
    const motion=series.activity[minute];
    if(!Number.isFinite(motion)||motion>42){sinceActivity=0;continue;}
    sinceActivity++;
    // Exercise, wandering and the first 8 minutes after activity are NOT
    // assessed as resting tachycardia or abnormal respiratory episodes.
    if(sinceActivity<8)continue;
    const context=clockContext(minute,motion),previous=context&&historyByContext[context];
    const base=previous&&Number.isFinite(previous.center)?previous:
     context&&provisionalFromEarlierToday(series,kind,context,minute);
    if(!base||!Number.isFinite(base.center))continue;
    if(perKind.length&&minute-perKind.at(-1).minute<90)continue;
    const five=Array.from({length:5},(_,k)=>minute-2+k);
    const valid=five.filter(m=>clockContext(m,series.activity[m])===context&&
     finite(series[kind][m],...bounds[kind]));
    if(valid.length<5)continue;
    // A single extreme sample or sensor dropout cannot trigger an event.
    const reading=med(valid.map(m=>series[kind][m])),reference=base.center;
    const highDelta=Math.max(kind==='heart'?18:6,reference*(kind==='heart'?.36:.43),base.spread*3.5);
    const lowDelta=Math.max(kind==='heart'?18:5,reference*(kind==='heart'?.34:.40),base.spread*3.5);
    const multiplier=base.ready?1:base.sameDayOnly?1.85:1.45;
    const direction=reading-reference>=highDelta*multiplier?'high':
     reference-reading>=lowDelta*multiplier?'low':null;
    if(!direction)continue;
    const threshold=(direction==='high'?highDelta:lowDelta)*multiplier;
    const crossing=valid.filter(m=>direction==='high'?series[kind][m]-reference>=threshold:
     reference-series[kind][m]>=threshold);
    if(crossing.length<4)continue;
    // No strong alert in the middle of a physiologically implausible 5-minute
    // movement-independent jump. The original signal-quality gate still runs.
    const relative=Math.abs(reading-reference)/Math.max(1,reference);
    perKind.push({source:'context-personal-baseline',date,kind,minute,type:direction,
     value:Number(series[kind][minute].toFixed(1)),reference:Number(reference.toFixed(1)),
     relative:Number(relative.toFixed(4)),level:'high',context,
     baselinePhase:base.ready?'personalized':'provisional',baselineDays:base.eligibleDays});
    if(perKind.length>=maxPerMetric)break;
   }
   out.push(...perKind);
  }
  return out.sort((a,b)=>a.minute-b.minute||a.kind.localeCompare(b.kind));
 }
 return Object.freeze({version:'10.61',detect,baseline,dayRepresentative,clockContext});
});
