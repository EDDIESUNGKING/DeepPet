/* Milo 2026-11-22 measured-data pipeline. No invented medical scores. */
(function(root){'use strict';
 const data=root.DeepPetMiloPetHealth20261122;
 if(data?.ownerPet!=='Milo'||!Array.isArray(data.records))return;
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const median=arr=>{if(!arr.length)return null;const a=[...arr].sort((x,y)=>x-y),i=a.length>>1;return a.length%2?a[i]:(a[i-1]+a[i])/2;};
 const quantile=(v,p)=>{if(!v.length)return null;const a=[...v].sort((x,y)=>x-y),i=(a.length-1)*p,l=Math.floor(i),h=Math.ceil(i);return a[l]+(a[h]-a[l])*(i-l);};
 const good=r=>r&&r.quality==='valid'&&finite(r.hr)&&finite(r.rr)&&r.hr>0&&r.rr>0;
 const raw=data.records.filter(r=>r&&/^\d{4}-\d{2}-\d{2}$/.test(r.localDate)&&Number.isFinite(Date.parse(r.at)));
 const rows=raw.slice().sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
 const allDays=[...new Set(rows.map(r=>r.localDate))].sort();
 const firstDate=allDays[0],lastDate=allDays.at(-1);
 const sessions=[];let seg=[];
 for(const r of rows){const prev=seg.at(-1),dt=prev?(Date.parse(r.at)-Date.parse(prev.at))/1000:null;
  if(seg.length&&(dt<0||dt>12)){sessions.push(seg);seg=[];} seg.push(r);
 }
 if(seg.length)sessions.push(seg);
 const rawChannelsAvailable=rows.some(r=>Array.isArray(r.channelA)&&Array.isArray(r.channelB)&&r.channelA.length===20&&r.channelB.length===20);
 const dayRows=date=>rows.filter(r=>r.localDate===date);
 const inRange=(end,range)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(end))return [];
  const lo=new Date(end+'T12:00:00Z');lo.setUTCDate(lo.getUTCDate()-range+1);const a=lo.toISOString().slice(0,10);
  return rows.filter(r=>r.localDate>=a&&r.localDate<=end);
 };
 function describe(rawInput){
  const all=rawInput||[],valid=all.filter(good),hr=valid.map(r=>r.hr),rr=valid.map(r=>r.rr);
  const start=all[0]?.localTime||null,end=all.at(-1)?.localTime||null;
  const ts=[...new Set(valid.map(r=>r.localTime?.slice(0,5)).filter(Boolean))];
  return {records:all.length,pairedValid:valid.length,missing:all.length-valid.length,coverageMinutes:ts.length,
   heart:median(hr),breath:median(rr),hrMin:hr.length?Math.min(...hr):null,hrMax:hr.length?Math.max(...hr):null,
   rrMin:rr.length?Math.min(...rr):null,rrMax:rr.length?Math.max(...rr):null,
   hrQ05:quantile(hr,.05),hrQ95:quantile(hr,.95),rrQ05:quantile(rr,.05),rrQ95:quantile(rr,.95),
   start,end,qualityFraction:all.length?valid.length/all.length:0};
 }
 function minuteSeries(kind,date){
  const map=new Map();const key=kind==='breath'?'rr':'hr';
  for(const r of dayRows(date)){
   if(!good(r))continue;
   const time=r.localTime?.slice(0,5);if(!/^\d\d:\d\d$/.test(time))continue;
   if(!map.has(time))map.set(time,[]);map.get(time).push(r[key]);
  }
  return [...map].sort(([a],[b])=>a.localeCompare(b)).map(([time,v])=>({time,count:v.length,value:median(v),low:Math.min(...v),high:Math.max(...v),qualified:v.length>=30}));
 }
 // These are relative review markers ONLY, never clinical or emergency alarms.
 // Compare two consecutive well-observed minutes to the same captured-day median.
 function events(kind,date){
  const rawMinutes=minuteSeries(kind,date),reference=median(rawMinutes.filter(v=>v.qualified).map(v=>v.value));
  if(reference===null)return [];
  const tol=kind==='heart'?Math.max(12,reference*.16):Math.max(4,reference*.22);
  const run=[],out=[];
  function flush(){if(run.length>=2){const values=run.map(x=>x.value),m=median(values),f=run[0];
    out.push({time:f.time,endTime:run.at(-1).time,value:m,delta:+(m-reference).toFixed(1),baseline:reference,minuteCount:run.length,
      direction:m>reference?'high':'low',kind});}run.length=0;}
  for(let i=0;i<rawMinutes.length;i++){
   const m=rawMinutes[i],direction=m.value>reference?'high':'low';
   const prev=run.at(-1),mins=t=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
   const continuous=prev&&mins(m.time)-mins(prev.time)===1;
   if(m.qualified&&Math.abs(m.value-reference)>=tol){
    if(run.length&&(!continuous||direction!==(run[0].value>reference?'high':'low')))flush();run.push(m);
   }else flush();
  }
  flush();return out.slice(0,8);
 }
 // Raw data do not identify which 20 Hz channel is beat-to-beat or movement.
 // A PetHealth rate is not an NN interval; this capture contains no overnight
 // history or confirmed post-exercise start/end times. Never invent the fields.
 function measuredDay(date){
  const x=describe(dayRows(date));return {date,source:'pethealth-b0-partial-rate-capture',petId:'0',
   measurements:{heartRate:x.heart,breathRate:x.breath,heartMin:x.hrMin,heartMax:x.hrMax,breathMin:x.rrMin,breathMax:x.rrMax},
   quality:{pairedValid:x.pairedValid,records:x.records,validFraction:x.qualityFraction,observedMinutes:x.coverageMinutes,
    beatIntervalValid:false,motionChannelVerified:false,overnightVerified:false,exerciseRecoveryVerified:false,
    dayCoverageValidated:false,clinicalThresholdValidated:false},
   scores:{heart:null,breath:null,hrv:null,stable:null,cardio:null,sleep:null,energy:null,recovery:null,calm:null,activityRecovery:null,physiol:null,rhythm:null},
   notes:['只有短時間心率與呼吸資料','沒有經驗證的個體參考基準或全天覆蓋','原始20Hz通道尚未確認物理意義']};
 }
 function scoreWithExistingEngine(date){
  // Preserve exact verified.js scoreDay evidence gate. Data that do not meet
  // strict 24-h quality and reference conditions intentionally return null.
  // Calling with the partial day must not overwrite gallery fixtures.
  const day=measuredDay(date),e=root.DeepPetBCG;
  let candidate=null;
  if(e?.scoreDay){try{candidate=e.scoreDay([{
    date,petId:'0',source:'20hz-waveform',heartRate:day.measurements.heartRate,
    breathRate:day.measurements.breathRate,quietHeartRate:null,quietBreathRate:null,
    quality:{heartValid:day.quality.pairedValid>0,respValid:day.quality.pairedValid>0,
      wearValid:false,signalValid:false,timeContinuityValid:false,timeCoverage:0,
      observedSeconds:day.quality.pairedValid,observedDayFraction:day.quality.pairedValid/86400}
   }],0,{groupReferenceByKey:{}});}catch(error){candidate=null;}}
  return candidate?.scores||day.scores;
 }
 const api=Object.freeze({version:'10.139-real-evidence-pipeline',ownerPet:'Milo',dates:Object.freeze(allDays),
  recordsCount:rows.length,rawChannelsAvailable,dayRows,inRange,describe,minuteSeries,events,measuredDay,
  scoreWithExistingEngine,latestDate:lastDate,firstDate,sessionWindows:sessions.map(s=>({start:s[0].localTime,end:s.at(-1).localTime,frames:s.length})),
  global:describe(rows)});
 root.DeepPetMiloVerifiedPipeline=api;
})(window);
