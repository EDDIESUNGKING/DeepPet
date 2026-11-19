/* DeepPet V9.32: Engineering-level change markers for minute-level trend samples.
   These are relative high/low points, NOT verified apnea, arrhythmia, or emergencies. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetChange932=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const finite=x=>Number.isFinite(x);
const median=a=>{const b=a.filter(finite).sort((x,y)=>x-y);return b.length?b[Math.floor(b.length/2)]:null};
function detect(values,{kind='heart',minDistance=35,maxEvents=30}={}){
 if(!Array.isArray(values)||values.length<60)return [];
 const n=values.length,valid=values.filter(finite);if(valid.length<n*.90)return [];
 const med=median(valid);if(!finite(med))return [];
 const local=x=>{const a=[];for(let j=Math.max(0,x-30);j<=Math.min(n-1,x+30);j+=3){if(finite(values[j]))a.push(values[j]);}return median(a)};
 const sm=values.map((v,i)=>{let sum=0,count=0;for(let j=Math.max(0,i-2);j<=Math.min(n-1,i+2);j++){if(finite(values[j])){sum+=values[j];count++;}}return count?sum/count:null;});
 const noise=median(sm.filter(finite).map(v=>Math.abs(v-med)))||0;
 const base=kind==='breath'?Math.max(1.15,noise*1.1,med*.055):kind==='activity'?Math.max(13,noise*1.75):Math.max(8,noise*1.65,med*.085);
 const candidates=[];
 for(let i=20;i<n-20;i++){
  const v=sm[i];if(!finite(v))continue;
  let max=true,min=true;
  for(let j=i-12;j<=i+12;j++)if(j!==i&&finite(sm[j])){if(sm[j]>v+1e-6||(sm[j]===v&&j<i))max=false;if(sm[j]<v-1e-6||(sm[j]===v&&j<i))min=false;}
  if(!max&&!min)continue;
  const reference=local(i);if(!finite(reference))continue;
  const deviation=v-reference,type=max?'high':'low',prominence=Math.abs(deviation);
  const threshold=type==='high'?base:base*.88;
  if((max&&deviation>=threshold)||(min&&-deviation>=threshold))candidates.push({minute:i,value:Number(values[i]),smoothed:Number(v.toFixed(2)),reference:Number(reference.toFixed(2)),deviation:Number(deviation.toFixed(2)),type,prominence});
 }
 // Keep independent high/low extrema; choose strongest of nearby candidates of the same sign.
 candidates.sort((a,b)=>b.prominence-a.prominence);
 const kept=[];
 for(const e of candidates){if(kept.every(x=>x.type!==e.type||Math.abs(x.minute-e.minute)>=minDistance)){kept.push(e);if(kept.length>=maxEvents)break;}}
 // When a real-looking day has gradual broad changes but no sharp spike,
 // show the actual daily maximum/minimum as informational extrema (not risk events).
 if(kept.length===0){
   let highI=-1,lowI=-1;for(let i=12;i<n-12;i++){if(!finite(sm[i]))continue;if(highI<0||sm[i]>sm[highI])highI=i;if(lowI<0||sm[i]<sm[lowI])lowI=i;}
   const dailySpan=highI>=0&&lowI>=0?sm[highI]-sm[lowI]:0;
   const minSpan=kind==='breath'?2.3:kind==='activity'?18:10;
   if(dailySpan>=minSpan){for(const [i,type] of [[highI,'high'],[lowI,'low']]){
     const reference=med,delta=sm[i]-reference;
     kept.push({minute:i,value:Number(values[i]),smoothed:Number(sm[i].toFixed(2)),reference:Number(reference.toFixed(2)),deviation:Number(delta.toFixed(2)),type,prominence:Math.abs(delta),informational:true});
   }}
 }
 return kept.sort((a,b)=>a.minute-b.minute).map(({prominence,...e})=>e);
}
function summarize(values,opts){return {events:detect(values,opts),length:values?.length||0};}
return {detect,summarize};
});
