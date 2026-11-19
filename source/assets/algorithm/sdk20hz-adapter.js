/* DeepPet SDK 20Hz transport-neutral local prototype.
   All waveform processing goes through DeepPetBCG research-2.0.
   No raw data is persisted or transferred here. Server migration: move entire
   module to private service and expose only signed scores/metadata to UI.
 */
(function(root,factory){const api=factory(root.DeepPetBCG);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetSDK20Hz=api;})(typeof globalThis!=='undefined'?globalThis:this,function(A){
'use strict';
function createSession(profile={},opt={}){
 let date=null,chunks=[],days=[],closed=false,timelineVerified=true,gapSeconds=0,timeBasis=null;
 let wearWindows=[];const WINDOW=40;
 // A separate transient readiness state never alters pet pairing, the
 // historical 14-day reference, or the Me-page fit-reminder test toggle.
 const readiness=typeof globalThis!=='undefined'?globalThis.DeepPetWearReadiness1044?.create?.():null;
 let latestReadiness=readiness?.snapshot()||null;
 // Real sensor sessions cannot be attributed to an anonymous shared
 // identifier: that would make two newly paired pets indistinguishable.
 const id=profile.petId??profile.id;
 if(id===undefined||id===null||String(id).trim()==='')throw Error('pet_identity_required');
 const identityClaims=[profile.petId,profile.ownerPetId,profile.profile?.petId].filter(x=>x!==null&&x!==undefined&&String(x).trim()!=='').map(String);
 if(new Set(identityClaims).size>1)throw Error('conflicting_session_pet_identity');
 // A live adapter can derive the 14-day baseline directly from persisted,
 // source-verified per-day SDK summaries. The native bridge may alternatively
 // supply its own provider; owner/source/quality checks are still mandatory.
 const verifiedHistory=Array.isArray(opt.verifiedHistory)?opt.verifiedHistory:
  Array.isArray(profile.verifiedHistory)?profile.verifiedHistory:[];
 const referenceProvider=typeof opt.referenceProvider==='function'?opt.referenceProvider:
  ({petId,context,at,date})=>globalThis.DeepPetSecondStream1045?.buildContextReference?.({
   petId,context,at,date,history:verifiedHistory})||null;
 const secondStream=typeof globalThis!=='undefined'?globalThis.DeepPetSecondStream1045?.create?.({petId:id,referenceProvider}):null;
 const rapidStream=typeof globalThis!=='undefined'?globalThis.DeepPetRapidEvents1062?.create?.({petId:id,referenceProvider}):null;
 let pendingSeconds=[],lastAcuteKey=null,lastAcuteAt=-Infinity;
 const finiteTimestamp=n=>typeof n==='number'&&Number.isFinite(n);
 const append=({heartWave,breathWave,motionWave,fs=20,heartHz=null,breathHz=null,motionHz=null,petId:chunkPetId=null,ownerPetId:chunkOwnerPetId=null,date:nextDate,startLocalMinute=null,startLocalSecond=null,startEpochMs=null,timezoneOffsetMinutes=null,verifiedBeatTimes=null,sdkMetrics=null,connected=false})=>{
  if(closed)throw Error('session_closed');
  // If transport metadata names an owner, it cannot silently contradict the
  // session's paired pet. Check before finalizing a prior day or storing bytes.
  const chunkOwners=[chunkPetId,chunkOwnerPetId].filter(x=>x!==null&&x!==undefined&&String(x).trim()!=='').map(String);
  if(chunkOwners.some(owner=>owner!==String(id)))throw Error('chunk_pet_identity_mismatch');
  if(fs!==20)throw Error('sdk_requires_exact_20hz');
  if([heartHz,breathHz,motionHz].some(rate=>rate!==null&&rate!==undefined&&rate!==20))throw Error('sdk_requires_exact_20hz_channels');
  const n=Math.min(heartWave?.length||0,breathWave?.length||0,motionWave?.length||0);
  if(n<600||n>18000||n!==heartWave.length||n!==breathWave.length||n!==motionWave.length)throw Error('misaligned_20hz_chunk');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(nextDate||''))throw Error('valid_measurement_date_required');
  const parsed=new Date(nextDate+'T12:00:00Z');
  if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==nextDate)throw Error('invalid_measurement_date');
  if(date&&nextDate<date)throw Error('out_of_order_measurement_day');
  // All validation MUST run before any mutation, including finalizing the last day.
  // Otherwise a rejected chunk can corrupt session date or time basis.
  const startSec=Number.isFinite(startLocalSecond)?startLocalSecond:Number.isFinite(startLocalMinute)?startLocalMinute*60:null;
  const duration=n/fs;
  if(Number.isFinite(startLocalSecond)&&Number.isFinite(startLocalMinute)&&Math.abs(startLocalSecond-startLocalMinute*60)>1)throw Error('conflicting_local_time_fields');
  if(startSec!==null&&(startSec<0||startSec+duration>86400+.05))throw Error('local_measurement_time_outside_date');
  const useEpoch=Number.isFinite(startEpochMs),nextBasis=useEpoch?'epoch':'local';
  const offset=Number.isFinite(timezoneOffsetMinutes)?timezoneOffsetMinutes:profile.timezoneOffsetMinutes;
  let localEpochSecond=null;
  if(useEpoch){
   if(!Number.isFinite(offset)||offset< -720||offset>840)throw Error('timezone_offset_required_for_epoch');
   const localMs=startEpochMs+offset*60000,epochDate=new Date(localMs);
   // A finite millisecond value can still exceed JavaScript Date's supported
   // range. Reject it explicitly before toISOString(), without changing the
   // active day, buffered chunks, or the previously completed score history.
   if(!Number.isFinite(localMs)||!Number.isFinite(epochDate.getTime()))throw Error('invalid_epoch_timestamp');
   const measureDate=epochDate.toISOString().slice(0,10);
   if(measureDate!==nextDate)throw Error('epoch_measurement_date_mismatch');
   localEpochSecond=((localMs%86400000)+86400000)%86400000/1000;
   if(localEpochSecond+duration>86400+.05)throw Error('epoch_chunk_crosses_measurement_date');
   if(startSec!==null&&Math.abs(startSec-localEpochSecond)>1)throw Error('local_epoch_timestamp_disagreement');
  }
  const sameDay=nextDate===date;
  if(sameDay&&timeBasis&&timeBasis!==nextBasis)throw Error('mixed_timestamp_bases');
 if(startSec===null&&!useEpoch)throw Error('measurement_timestamp_required');
  const start=useEpoch?startEpochMs/1000:startSec;
  let delta=null;
  if(sameDay&&chunks.length){
   const last=chunks[chunks.length-1],prevStart=last._start;
   if(start!==null&&prevStart!==null){delta=start-(prevStart+last.heartWave.length/last.fs);
    if(delta<-.05)throw Error('duplicate_or_overlapping_waveform_chunk');}
  }
  if(date&&!sameDay)finalizeDay();
  date=nextDate;
  timeBasis=nextBasis;
  // A scheduled pause is not a corrupted timeline. Only overlapping,
  // backwards, or absent timestamps invalidate chronological provenance.
  if(delta!==null&&delta>.05)gapSeconds+=delta;
  if(start===null||(sameDay&&chunks.length&&delta===null))timelineVerified=false;
  chunks.push({heartWave,breathWave,motionWave,fs,heartHz,breathHz,motionHz,
   startLocalMinute:startSec!==null?startSec/60:localEpochSecond!==null?localEpochSecond/60:null,
   startLocalSecond:startSec!==null?startSec:localEpochSecond,startEpochMs,timezoneOffsetMinutes:offset,
   _start:start,verifiedBeatTimes,sdkMetrics});
  // Live collar-fitting feedback is optional and NEVER labels an emergency.
  // Only an explicitly connected device and validated chronological timestamps
  // feed the fitting detector; sampling pauses reset its short sliding window.
  if(!sameDay){wearWindows=[];if(readiness)latestReadiness=readiness.reset();}
  if(delta!==null&&delta>.05){wearWindows=[];if(readiness)latestReadiness=readiness.reset();}
  const sink=typeof opt.onWearEvidence==='function'?opt.onWearEvidence:(typeof globalThis!=='undefined'&&globalThis.DeepPetWear926?.process?globalThis.DeepPetWear926.process:null);
  const radioReady=(opt.connected===true||connected===true)&&timelineVerified&&finiteTimestamp(start);
  if(!radioReady&&readiness)latestReadiness=readiness.reset('signal_unavailable');
  if(radioReady){
   const startMs=start*1000;
   for(let p=0;p+WINDOW<=n;p+=WINDOW){
    const windowRow={timestampMs:startMs+p/fs*1000,heartWave:Array.from(heartWave.slice(p,p+WINDOW)),breathWave:Array.from(breathWave.slice(p,p+WINDOW))};
    if(readiness){
     latestReadiness=readiness.update({...windowRow,connected:true});
     if(typeof opt.onSignalReadiness==='function')opt.onSignalReadiness({...latestReadiness,petId:id});
    }
    wearWindows.push(windowRow);
    if(wearWindows.length>6)wearWindows.shift();
    if(sink&&wearWindows.length===6){try{sink({petId:id,petName:profile.petName||profile.name||'',connected:true,sampleRate:20,timestampsValid:true,windows:wearWindows.slice(),readiness:latestReadiness});}catch(err){if(opt.onWearError)opt.onWearError(err);}}
   }
  }
  return {petId:id,date,receivedChunks:chunks.length,timeVerified:timelineVerified,gapSeconds,signalReadiness:latestReadiness};
 };
 // Receive exactly 20 Hz per SECOND, not once per 2 minutes. The legacy
 // append() requires >=30s chunks for historical windows, so assemble only
 // 30 contiguous, independently verified seconds before handing data to it.
 // This leaves second-by-second status/callbacks immediate and never invents
 // missing seconds when Bluetooth/4G, contact or timestamps are interrupted.
 const pushSecond=frame=>{
  if(closed)throw Error('session_closed');
  if(!secondStream)throw Error('second_stream_module_required');
  // When the native bridge supplies timezone metadata, verify that the
  // owner's displayed calendar time truly corresponds to the same epoch
  // second. Do this BEFORE mutating either rolling stream.
  const offset=Number.isFinite(frame?.timezoneOffsetMinutes)?frame.timezoneOffsetMinutes:profile.timezoneOffsetMinutes;
  if(Number.isFinite(offset)&&Number.isFinite(frame?.startEpochMs)&&
   Number.isInteger(frame?.startLocalSecond)&&/^\d{4}-\d{2}-\d{2}$/.test(frame?.date||'')){
   if(offset< -720||offset>840)throw Error('invalid_second_timezone_offset');
   const localMs=frame.startEpochMs+offset*60000,localDate=new Date(localMs);
   if(!Number.isFinite(localDate.getTime())||localDate.toISOString().slice(0,10)!==frame.date||
    Math.floor(((localMs%86400000)+86400000)%86400000/1000)!==frame.startLocalSecond)
    throw Error('second_event_local_epoch_timestamp_disagreement');
  }
  const live=secondStream.update(frame);
  if(typeof opt.onSecondUpdate==='function')opt.onSecondUpdate(live);
  const rapid=rapidStream?.update(frame,live)||null;
  // Minute-level sustained change and seconds-level sudden change are separate
  // evidence paths. Prefer seconds-level candidate without duplicate legacy
  // joint callbacks for the same episode.
  const alert=rapid?null:(!rapidStream?live.acuteCandidate:null);
  if(alert&&typeof opt.onAcuteCandidate==='function'){
   const signature=`${id}:${alert.direction}`;
   if(signature!==lastAcuteKey||live.at-lastAcuteAt>=300000){opt.onAcuteCandidate(alert);lastAcuteKey=signature;lastAcuteAt=live.at;}
  }
  if(rapid&&/^\d{4}-\d{2}-\d{2}$/.test(frame.date||'')&&
    Number.isInteger(frame.startLocalSecond)&&frame.startLocalSecond>=0&&frame.startLocalSecond<86400){
   const observed={...rapid,date:frame.date,localSecond:frame.startLocalSecond,
    timezoneOffsetMinutes:Number.isFinite(offset)?offset:null};
   // The host's optional callback must never suppress the owner's local
   // incident record. Likewise, a storage/display failure must not stop the
   // host from receiving the urgent candidate. Keep both paths independent.
   const warn=err=>{
    try{if(typeof opt.onAcuteError==='function')opt.onAcuteError(err);
     else if(typeof console!=='undefined'&&console.error)console.error('DeepPet acute event delivery:',err);}
    catch(reportError){if(typeof console!=='undefined'&&console.error)console.error('DeepPet acute error reporting:',reportError);}
   };
   try{if(typeof globalThis.DeepPetUrgentEvents1062?.capture==='function')globalThis.DeepPetUrgentEvents1062.capture(observed);}
   catch(err){warn(err);}
   try{if(typeof opt.onAcuteCandidate==='function')opt.onAcuteCandidate(observed);}
   catch(err){warn(err);}
  }
  const valid=frame.connected===true&&frame.qualityVerified===true&&
   [frame.heartWave,frame.breathWave,frame.motionWave].every(a=>Array.isArray(a)&&a.length===20&&a.every(finiteTimestamp))&&
   globalThis.DeepPetSecondStream1045.signalPresent(frame.heartWave)&&
   globalThis.DeepPetSecondStream1045.signalPresent(frame.breathWave)&&
   live.signalState!=='signal_unavailable'&&live.signalState!=='checking_signal';
  if(!valid){pendingSeconds=[];return {...live,rapidEvent:rapid,historyChunkSaved:false};}
  const d=frame.date,sec=frame.startLocalSecond;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d||'')||!finiteTimestamp(sec)||sec<0||sec>86399)
   throw Error('second_frame_local_date_and_time_required');
  if(pendingSeconds.length){const prev=pendingSeconds[pendingSeconds.length-1];
   if(prev.date!==d||prev.startLocalSecond+1!==sec||prev.startEpochMs+1000!==frame.startEpochMs)pendingSeconds=[];
  }
  pendingSeconds.push({date:d,startLocalSecond:sec,startEpochMs:frame.startEpochMs,
   heartWave:frame.heartWave,breathWave:frame.breathWave,motionWave:frame.motionWave});
  if(pendingSeconds.length<30)return {...live,rapidEvent:rapid,historyChunkSaved:false};
  const rows=pendingSeconds.splice(0,30),start=rows[0],raw={petId:id,date:start.date,
   startLocalSecond:start.startLocalSecond,connected:true,fs:20,
   heartWave:rows.flatMap(x=>x.heartWave),breathWave:rows.flatMap(x=>x.breathWave),motionWave:rows.flatMap(x=>x.motionWave)};
  append(raw);
  return {...live,rapidEvent:rapid,historyChunkSaved:true};
 };
 const finalizeDay=()=>{
  if(!date)return null;
  const d=A.fromWaveformChunks(chunks,{date,profile,
   plannedSamplingSeconds:opt.plannedSamplingSeconds??null,
   wearConfirmed:opt.wearConfirmed===true,signalConfirmed:opt.signalConfirmed===true});
  if(d){d.quality={...(d.quality||{}),timeContinuityValid:timelineVerified&&d.quality?.timeContinuityValid===true,gapSeconds};
   if(!d.quality.timeContinuityValid){d.quality.timeCoverage=0;d.quality.restQuality=false;d.nightBreathRate=null;d.recoveryEvents=[];d.recoveryDrop=null;d.recoveryCount=0;}
   if(d.quality.timeContinuityValid){days.push(d);days.sort((a,b)=>a.date.localeCompare(b.date));}}
  const result=d?.quality?.timeContinuityValid?A.scoreDay(days,days.findIndex(x=>x===d),opt):null;
  date=null;chunks=[];wearWindows=[];timelineVerified=true;gapSeconds=0;timeBasis=null;
  if(readiness)latestReadiness=readiness.reset(); // release raw buffers and require re-settling on next session/day
  return {features:d,scoring:result};
 };
 const lastResults=()=>days.map((d,i)=>A.scoreDay(days,i,opt));
 const period=range=>A.periodScores(lastResults(),range);
 const finish=()=>{const result=finalizeDay();closed=true;return result;};
 return {append,pushSecond,finalizeDay,lastResults,period,finish,profile:Object.freeze({...profile}),get status(){return {petId:id,date,pendingChunks:chunks.length,days:days.length,timeVerified:timelineVerified,gapSeconds,signalReadiness:latestReadiness,
  perSecondStream:secondStream?.snapshot()||null,pendingVerifiedSeconds:pendingSeconds.length}}};
}
return {version:'20hz-local-adapter-1.3',createSession};
});
