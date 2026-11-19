/* DeepPet V10.30: comparison/explanation only. No scoring or waveform changes. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DeepPetCareIntelligence1030=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const dateMs=s=>{if(typeof s!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s))return null;
  const ms=Date.parse(s+'T12:00:00Z');return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===s?ms:null;};
 function todayComparedWithRecent(rows,{date,score,previousDays=6,minPast=3,margin=3}={}){
  const end=dateMs(date);
  if(end===null||!finite(score)||score<0||score>100||!Number.isInteger(previousDays)||previousDays<1||previousDays>30)return {ready:false,reason:'invalid-input'};
  const seen=new Map(),duplicates=new Set();
  for(const row of Array.isArray(rows)?rows:[]){const time=dateMs(row?.date);
   if(time===null||time>=end||time<end-previousDays*86400000||!finite(row.score)||row.score<0||row.score>100)continue;
   if(seen.has(row.date))duplicates.add(row.date);else seen.set(row.date,row.score);
  }
  for(const key of duplicates)seen.delete(key);
  const past=[...seen].sort(([a],[b])=>a.localeCompare(b));
  if(past.length<minPast)return {ready:false,reason:'insufficient-prior-dates',pastDays:past.length};
  const mean=past.reduce((sum,[,value])=>sum+value,0)/past.length,delta=score-mean;
  const yesterday=new Date(end-86400000).toISOString().slice(0,10),prior=seen.get(yesterday);
  return {ready:true,score,mean,delta,pastDays:past.length,yesterdayDelta:finite(prior)?score-prior:null,
   direction:Math.abs(delta)<margin?'steady':delta>0?'up':'down',
   periodFrom:new Date(end-previousDays*86400000).toISOString().slice(0,10),periodTo:yesterday};
 }
 function periodPattern(highlight,{displayThreshold=0}={}){
  if(!highlight||!finite(highlight.before)||!finite(highlight.after))return {code:'unavailable'};
  if(highlight.direction==='steady'){
   const step=Math.abs(highlight.step?.delta||0);
   const burst=finite(step)&&step>=Math.max(2*Math.abs(displayThreshold),Math.abs(highlight.before)*.10,1e-9);
   return {code:burst?'steady-with-fluctuation':'steady',earlyDays:highlight.earlyDays,lateDays:highlight.lateDays};
  }
  return {code:highlight.sustained?'supported-recent':'change-not-confirmed-sustained',earlyDays:highlight.earlyDays,lateDays:highlight.lateDays};
 }
 return Object.freeze({version:'10.30',todayComparedWithRecent,periodPattern});
});
