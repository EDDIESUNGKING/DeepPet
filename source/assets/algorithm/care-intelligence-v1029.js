/* DeepPet V10.29 — read-only explanation and date-context selectors.
 * Uses existing measured/recorded values; never recalculates health scores,
 * adjusts a waveform, estimates a missing sample or infers medical causality.
 */
(function(root,factory){
 const api=factory(root?.DeepPetCareIntelligence1028);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DeepPetCareIntelligence1029=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(previous){'use strict';
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const dateMs=s=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;
  const ms=Date.parse(s+'T12:00:00Z');return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===s?ms:null;};
 const minute=s=>{const m=typeof s==='string'?/^([01]\d|2[0-3]):([0-5]\d)$/.exec(s):null;return m?Number(m[1])*60+Number(m[2]):null;};
 const previousCore=previous||(typeof require==='function'?require('./care-intelligence-v1028.js'):null);
 function periodHighlight(rows,{days,end,metrics}={}){
  const comparison=previousCore?.comparePeriod(rows,{days,end,metrics});
  if(!comparison?.ready)return {ready:false,reason:'insufficient-dated-values',comparison,highlight:null};
  const thresholdByKey=new Map((metrics||[]).map(m=>[m.key,Number(m.threshold)||0]));
  const candidates=comparison.metrics.filter(x=>x.ready).map(x=>{
   const band=Math.max(Math.abs(x.before)*.05,Math.abs(thresholdByKey.get(x.key)||0),1e-9);
   return {...x,significance:x.direction==='steady'?0:Math.abs(x.delta)/band};
  }).sort((a,b)=>b.significance-a.significance||String(a.key).localeCompare(String(b.key)));
  const target=candidates[0],start=dateMs(comparison.start),endMs=dateMs(comparison.end);
  const excluded=new Set(comparison.duplicateDates||[]),once=new Map();
  for(const r of Array.isArray(rows)?rows:[]){const ms=dateMs(r?.date);
   if(ms===null||ms<start||ms>endMs||excluded.has(r.date)||!finite(r.values?.[target.key]))continue;
   if(once.has(r.date))excluded.add(r.date);else once.set(r.date,r.values[target.key]);}
  for(const d of excluded)once.delete(d);
  const series=[...once].map(([date,value])=>({date,value})).sort((a,b)=>a.date.localeCompare(b.date));
  const low=series.reduce((a,b)=>!a||b.value<a.value?b:a,null);
  const high=series.reduce((a,b)=>!a||b.value>a.value?b:a,null);
  let step=null;
  for(let i=1;i<series.length;i++){
   if(dateMs(series[i].date)-dateMs(series[i-1].date)!==86400000)continue;
   const delta=series[i].value-series[i-1].value;
   if(!step||Math.abs(delta)>Math.abs(step.delta))step={from:series[i-1].date,to:series[i].date,delta};
  }
  return {ready:true,comparison,highlight:{...target,low,high,step,observations:series.length}};
 }
 // Original health entries are never deleted or rewritten. Selected extreme
 // dates get context first; other dated records remain in a separate group.
 function periodCareContext(events,{days,end,keyDates=[]}={}){
  if(!Number.isInteger(days)||days<1||days>90||dateMs(end)===null)return {featured:[],other:[],total:0};
  const lo=dateMs(end)-(days-1)*86400000,hi=dateMs(end),keys=new Set(keyDates.filter(x=>dateMs(x)!==null));
  const featured=[],other=[];
  for(const event of Array.isArray(events)?events:[]){const date=dateMs(event?.date);
   if(date===null||date<lo||date>hi||typeof event.title!=='string')continue;
   (keys.has(event.date)?featured:other).push({...event,time:minute(event.time)===null?'':event.time});
  }
  const order=(a,b)=>b.date.localeCompare(a.date)||
   (a.time&&b.time?a.time.localeCompare(b.time):a.time?-1:b.time?1:0)||a.title.localeCompare(b.title);
  featured.sort(order);other.sort(order);
  return {featured,other,total:featured.length+other.length};
 }
 function todayDecision(items,{nowMinutes}={}){
  const list=Array.isArray(items)?items:[],clock=finite(nowMinutes)&&nowMinutes>=0&&nowMinutes<1440?nowMinutes:null;
  const isCore=x=>x?.type==='deep'&&/^deep-[012]$/.test(String(x?.id||''));
  const urgent=list.filter(x=>Number(x?.priority)===0).length;
  const persistent=list.filter(x=>isCore(x)&&Number(x.continuityDays)>=2).length;
  const scheduledDue=list.filter(x=>x?.type==='med'&&clock!==null&&minute(x.scheduledTime)!==null&&minute(x.scheduledTime)<=clock).length;
  function reason(item){
   if(!item)return 'general';
   if(isCore(item))return Number(item.score)<60?'low-score-priority':Number(item.continuityDays)>=2?'persistent-low-score':'low-score';
   if(item.type==='deep')return 'physiological-event';
   if(item.type==='med')return clock!==null&&minute(item.scheduledTime)!==null&&minute(item.scheduledTime)<=clock?'scheduled-time-passed':'scheduled-today';
   if(item.type==='report')return 'exam-review';
   if(item.type==='vax'||item.type==='deworm')return 'care-plan';
   if(item.type==='chat')return 'today-message';
   return 'today-care';
  }
  return {urgent,persistent,scheduledDue,total:list.length,reason};
 }
 return Object.freeze({version:'10.29',periodHighlight,periodCareContext,todayDecision});
});
