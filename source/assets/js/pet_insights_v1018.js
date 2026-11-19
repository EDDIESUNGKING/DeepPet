/* DeepPet V10.18: transparent interpretation of existing evidence only.
 * No recalculation of physiological/rhythm/longitudinal scoring.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DeepPetInsights1018=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const numeric=x=>typeof x==='number'&&Number.isFinite(x);
 const between=(x,lo,hi)=>numeric(x)&&x>=lo&&x<=hi;
 const one=x=>Math.round(x*10)/10;
 const dateNumber=s=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;
  const ms=Date.parse(`${s}T12:00:00Z`);return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===s?ms:null;};

 function explainModel(model){
  if(!model?.available||!between(model.score,0,100))return Object.freeze({available:false,reason:model?.reason||'no-longitudinal-score'});
  const physiology=between(model.physiology,0,100)?model.physiology:null;
  const rhythm=between(model.rhythm,0,100)?model.rhythm:null;
  const weightedLoss=physiology===null||rhythm===null?null:Object.freeze({physiology:one(.75*(100-physiology)),rhythm:one(.25*(100-rhythm))});
  const mainFactor=weightedLoss===null?'unknown':Math.abs(weightedLoss.physiology-weightedLoss.rhythm)<1?'balanced':weightedLoss.physiology>weightedLoss.rhythm?'physiology':'rhythm';
  const examUsed=between(model.reportScore,0,100)&&numeric(model.reportWeight)&&model.reportWeight>0&&typeof model.reportDate==='string';
  const examEffect=examUsed&&numeric(model.sensorScore)?Math.max(0,Math.round(model.sensorScore-model.score)):0;
  const ageAvailable=between(model.ageYears,0,100)&&numeric(model.actualAge)&&model.ageAvailable!==false;
  return Object.freeze({available:true,physiology,rhythm,mainFactor,weightedLoss,
   longitudinalDays:Number.isInteger(model.days)?model.days:0,periodDays:30,
   sensorScore:between(model.sensorScore,0,100)?model.sensorScore:null,
   score:model.score,examUsed,examEffect,examDate:examUsed?model.reportDate:null,
   groupComparisonInModel:false,ageAvailable,ageYears:ageAvailable?model.ageYears:null,
   actualAge:ageAvailable?model.actualAge:null});
 }

 function baselineStage(baseline,{hasProfile=true,today=null}={}){
  if(!hasProfile)return Object.freeze({key:'no-profile',completed:false,days:0,missing:14});
  const days=Number.isInteger(baseline?.days)&&baseline.days>=0?baseline.days:0;
  if(days===0)return Object.freeze({key:'no-evidence',completed:false,days:0,missing:14});
  if(days<14||baseline?.ready!==true)return Object.freeze({key:'collecting',completed:false,days,missing:Math.max(0,14-days)});
  // Finishing the fourteenth date does not retroactively change that date's score.
  const pending=baseline.todayPersonalizationReady===false&&(!today||baseline.updatedOn===today);
  return Object.freeze({key:pending?'ready-next-day':'active',completed:true,days,missing:0});
 }

 function compareEvents(scoredDays,careEvents,{start,end,windowDays=3,maxEvents=3,petId=null}={}){
  const from=dateNumber(start),to=dateNumber(end);
  if(from===null||to===null||from>to)throw new RangeError('Invalid comparison period');
  if(!Number.isInteger(windowDays)||windowDays<1||windowDays>7)throw new RangeError('Invalid comparison window');
  const samePet=row=>petId===null||petId===undefined||
   [row?.petId,row?.ownerPetId,row?.profile?.petId].every(id=>id===undefined||id===null||String(id)===String(petId));
  const validRows=new Map(),duplicatedDates=new Set();
  for(const row of Array.isArray(scoredDays)?scoredDays:[]){
   const ts=dateNumber(row?.date);
   if(ts===null||ts<from||ts>to||!samePet(row)||row.valid!==true||!between(row.physiol,0,100)||!between(row.rhythm,0,100))continue;
   // Duplicate dates are unsafe to average without a canonical daily winner.
   if(validRows.has(row.date))duplicatedDates.add(row.date);
   else validRows.set(row.date,row);
  }
  const rows=[...validRows.values()].filter(row=>!duplicatedDates.has(row.date));
  const types=new Set(['med','vaccine','exam','food','activity','recovery','note']);
  const seen=new Set(),eventDays=new Map();
  const events=(Array.isArray(careEvents)?careEvents:[]).filter(x=>types.has(x?.type)&&samePet(x)&&dateNumber(x.date)!==null&&dateNumber(x.date)>=from&&dateNumber(x.date)<=to)
   .sort((a,b)=>b.date.localeCompare(a.date)||String(a.type).localeCompare(String(b.type)));
  for(const event of events){
   const key=`${event.date}|${event.type}|${event.id??event.title??''}`;
   if(seen.has(key))continue;seen.add(key);
   if(!eventDays.has(event.date))eventDays.set(event.date,[]);
   eventDays.get(event.date).push(Object.freeze({id:String(event.id??key),type:event.type,title:String(event.title||'')}));
  }
  const eligible=[];
  let omittedForInsufficientDays=0;
  for(const [eventDate,dayEvents] of eventDays){
   const eventTs=dateNumber(eventDate);
   const before=rows.filter(r=>{const dt=(eventTs-dateNumber(r.date))/86400000;return dt>=1&&dt<=windowDays;});
   const after=rows.filter(r=>{const dt=(dateNumber(r.date)-eventTs)/86400000;return dt>=1&&dt<=windowDays;});
   // Two real dates on BOTH sides, excluding the event day, are the minimum.
   if(before.length<2||after.length<2){omittedForInsufficientDays+=dayEvents.length;continue;}
   const avg=(a,key)=>a.reduce((sum,r)=>sum+r[key],0)/a.length;
   const overlappingOtherEvents=[...eventDays.keys()].some(d=>d!==eventDate&&Math.abs(dateNumber(d)-eventTs)/86400000<=windowDays);
   // All events on one date share the same before/after windows; never attribute
   // identical physiological changes to distinct medications or activities.
   const result=Object.freeze({id:dayEvents[0].id,date:eventDate,type:dayEvents[0].type,title:dayEvents[0].title,
    events:Object.freeze(dayEvents),eventCount:dayEvents.length,multipleEvents:dayEvents.length>1,overlappingOtherEvents,
    beforeDays:before.length,afterDays:after.length,
    physiologyDelta:one(avg(after,'physiol')-avg(before,'physiol')),
    rhythmDelta:one(avg(after,'rhythm')-avg(before,'rhythm')),
    isCausal:false});
   eligible.push(result);
  }
  const limit=Number.isInteger(maxEvents)&&maxEvents>=1?maxEvents:3;
  return Object.freeze({periodStart:start,periodEnd:end,recordedEvents:seen.size,recordedDates:eventDays.size,
   compared:Object.freeze(eligible.slice(0,limit)),comparableDates:eligible.length,
   omittedForInsufficientDays,limitedForDisplay:Math.max(0,eligible.length-limit),windowDays});
 }
 return Object.freeze({version:'10.18',explainModel,baselineStage,compareEvents});
});
