/* DeepPet V10.15 — a single public-display precision and unit contract.
 * Keep raw numbers in the scoring engine; round only at the UI boundary.
 */
(function(root){'use strict';
 const definitions=Object.freeze({
  age:Object.freeze({decimals:1,unit:'years'}),
  score:Object.freeze({decimals:0,unit:'points'}),
  heartRate:Object.freeze({decimals:0,unit:'bpm'}),
  breathing:Object.freeze({decimals:1,unit:'breaths/min'}),
  hrv:Object.freeze({decimals:1,unit:'ms'}),
  weight:Object.freeze({decimals:1,unit:'kg'}),
  sleepHours:Object.freeze({decimals:1,unit:'h'}),
  recoverySeconds:Object.freeze({decimals:0,unit:'s'}),
  percent:Object.freeze({decimals:1,unit:'%'}),
 });
 const valid=value=>typeof value==='number'&&Number.isFinite(value);
 const precision=name=>{
  const entry=definitions[name];
  if(!entry)throw new RangeError(`Unknown display metric: ${name}`);
  return entry.decimals;
 };
 const round=(name,value)=>valid(value)?Number(value.toFixed(precision(name))):null;
 const format=(name,value)=>{
  const n=round(name,value);
  return n===null?'—':n.toFixed(precision(name));
 };
 const difference=(name,estimate,actual)=>{
  const a=round(name,estimate),b=round(name,actual);
  if(a===null||b===null)return null;
  const diff=Number((a-b).toFixed(precision(name)));
  return Object.is(diff,-0)?0:diff;
 };
 const signed=(name,estimate,actual)=>{
  const diff=difference(name,estimate,actual);
  return diff===null?'—':`${diff>0?'+':diff<0?'−':'±'}${format(name,Math.abs(diff))}`;
 };
 const api=Object.freeze({version:'10.15',definitions,valid,precision,round,format,difference,signed});
 root.DeepPetMetric1015=api;
})(window);
