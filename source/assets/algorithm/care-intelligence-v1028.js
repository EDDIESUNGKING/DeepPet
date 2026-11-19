/* DeepPet V10.28 — explanatory, non-diagnostic intelligence.
 * Pure helpers. Never alter scores, sampling, waveform, or signal-quality rules.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DeepPetCareIntelligence1028=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const dateMs=s=>{if(typeof s!=='string'||!/^(\d{4})-(\d{2})-(\d{2})$/.test(s))return null;
  const d=Date.parse(s+'T12:00:00Z');return Number.isFinite(d)&&new Date(d).toISOString().slice(0,10)===s?d:null;};
 const minute=s=>{const m=typeof s==='string'?/^([01]\d|2[0-3]):([0-5]\d)$/.exec(s):null;return m?Number(m[1])*60+Number(m[2]):null;};
 const mean=a=>a.reduce((sum,x)=>sum+x,0)/a.length;
 function comparePeriod(rows,{days,end,metrics}={}){
  if(!Number.isInteger(days)||days<4||days>90||dateMs(end)===null)return {ready:false,reason:'invalid-period',metrics:[]};
  const endMs=dateMs(end),startMs=endMs-(days-1)*86400000,halfMs=startMs+Math.floor(days/2)*86400000;
  const perDay=new Map(),collisions=new Set();
  for(const x of Array.isArray(rows)?rows:[]){const ms=dateMs(x?.date);if(ms===null||ms<startMs||ms>endMs)continue;
   if(perDay.has(x.date))collisions.add(x.date);else perDay.set(x.date,x);}
  for(const date of collisions)perDay.delete(date);
  const daysSorted=[...perDay.values()].sort((a,b)=>a.date.localeCompare(b.date));
  const result=(Array.isArray(metrics)?metrics:[]).map(({key,unit='',threshold=0})=>{
   const eligible=daysSorted.filter(r=>finite(r.values?.[key]));
   const early=eligible.filter(r=>dateMs(r.date)<halfMs),late=eligible.filter(r=>dateMs(r.date)>=halfMs);
   if(early.length<2||late.length<2)return {key,unit,ready:false,earlyDays:early.length,lateDays:late.length};
   const before=mean(early.map(r=>r.values[key])),after=mean(late.map(r=>r.values[key]));
   const delta=after-before,pct=Math.abs(before)>1e-9?100*delta/Math.abs(before):null;
   const band=Math.max(Math.abs(Number(threshold)||0),Math.abs(before)*.05);
   const direction=Math.abs(delta)<band?'steady':delta>0?'up':'down';
   const recent=eligible.slice(-3),threeConsecutive=recent.length===3&&dateMs(recent[2].date)-dateMs(recent[0].date)===2*86400000&&
    recent.every((r,i)=>i===0||dateMs(r.date)-dateMs(recent[i-1].date)===86400000);
   const sustained=threeConsecutive&&direction!=='steady'&&recent.every(r=>direction==='up'?r.values[key]>before+band:r.values[key]<before-band);
   return {key,unit,ready:true,before,after,delta,pct,direction,sustained,earlyDays:early.length,lateDays:late.length};
  });
  return {ready:result.some(x=>x.ready),start:new Date(startMs).toISOString().slice(0,10),end,uniqueDays:daysSorted.length,duplicateDates:[...collisions].sort(),metrics:result};
 }
 function adjacentLowDays(rows,end,limit=3,cutoff=80){
  const valid=new Map(),collisions=new Set();for(const r of Array.isArray(rows)?rows:[]){if(dateMs(r?.date)===null||!finite(r.score))continue;if(valid.has(r.date))collisions.add(r.date);else valid.set(r.date,r.score);}
  for(const date of collisions)valid.delete(date);
  let count=0,ts=dateMs(end);if(ts===null)return 0;
  for(let i=0;i<limit;i++){const date=new Date(ts-i*86400000).toISOString().slice(0,10);if(!valid.has(date)||valid.get(date)>=cutoff)break;count++;}return count;
 }
 function timedContext(events,date,centerMinute=null,windowMinutes=90){
  if(dateMs(date)===null)return {near:[],untimed:[],otherTimed:[]};
  const list=(Array.isArray(events)?events:[]).filter(e=>e?.date===date&&typeof e.title==='string');
  const center=finite(centerMinute)?centerMinute:null,near=[],untimed=[],otherTimed=[];
  for(const e of list){const when=minute(e.time);if(when===null)untimed.push(e);
   else if(center===null||Math.abs(when-center)<=windowMinutes)near.push({...e,minute:when});
   else otherTimed.push({...e,minute:when});}
  near.sort((a,b)=>a.minute-b.minute||a.title.localeCompare(b.title));
  return {near,untimed,otherTimed};
 }
 function sortAttention(items){return (Array.isArray(items)?items:[]).map((item,i)=>({item,i})).sort((a,b)=>
  (Number(a.item.priority??5)-Number(b.item.priority??5))||
  (Number(b.item.continuityDays||0)-Number(a.item.continuityDays||0))||
  (String(a.item.scheduledTime||'99:99').localeCompare(String(b.item.scheduledTime||'99:99')))||a.i-b.i).map(x=>x.item);}
 return Object.freeze({version:'10.28',comparePeriod,adjacentLowDays,timedContext,sortAttention});
});
