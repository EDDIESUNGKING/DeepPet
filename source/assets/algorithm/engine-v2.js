/* DeepPet BCG candidate engine 2.0 — engineering research model.
   Inputs: 20 Hz heart vibration, respiration vibration, motion vibration;
   optional verified high-precision beat times (not assumed available).
   This is a wellness TREND model. It is not calibrated for disease detection,
   clinical sleep stages, or biological age. Keep server-portable, no DOM/storage.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetBCG=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
const median=a=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y),n=b.length,k=n>>1;return n%2?b[k]:(b[k-1]+b[k])/2;};
const sd=a=>{if(a.length<2)return null;const m=mean(a);return Math.sqrt(mean(a.map(v=>(v-m)**2)));};
// SDNN describes a finite set of normal-to-normal intervals; use the sample
// standard deviation (N−1), matching the documented HRV formula. Other
// population-spread uses of sd() in daily motion summaries are unchanged.
const sampleSD=a=>{if(a.length<2)return null;const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1));};
const mad=a=>{const m=median(a);return m===null?null:median(a.map(v=>Math.abs(v-m)));};
// Protect the fourteen-day personal reference against an isolated, extreme
// but technically valid illness/stress day. The cap is symmetric: a very low
// HR/RR day is not automatically treated as better or more normal either.
// This remains an engineering reference, not an age/breed clinical norm.
const robustPersonalMean=values=>{
 const a=(Array.isArray(values)?values:[]).filter(finite);if(!a.length)return null;
 const center=median(a),radius=Math.max(3*1.4826*(mad(a)||0),Math.abs(center)*.15,.25);
 return mean(a.map(v=>clamp(v,center-radius,center+radius)));
};
// Daily SDK chunks may span 30–300 seconds. Every accepted observation
// contributes its actual duration, rather than one equal vote per chunk.
function durationRows(rows,key){return rows.map(r=>({value:r?.[key],seconds:r?.quality?.durationSec})).filter(r=>finite(r.value)&&finite(r.seconds)&&r.seconds>0);}
function durationMean(rows,key){const a=durationRows(rows,key),seconds=a.reduce((s,r)=>s+r.seconds,0);return seconds?a.reduce((s,r)=>s+r.value*r.seconds,0)/seconds:null;}
function durationSD(rows,key){const a=durationRows(rows,key),seconds=a.reduce((s,r)=>s+r.seconds,0);if(a.length<2||!seconds)return null;const center=a.reduce((s,r)=>s+r.value*r.seconds,0)/seconds;return Math.sqrt(a.reduce((s,r)=>s+(r.value-center)**2*r.seconds,0)/seconds);}
function durationMedian(rows,key){const a=durationRows(rows,key).sort((x,y)=>x.value-y.value),seconds=a.reduce((s,r)=>s+r.seconds,0);if(!seconds)return null;let covered=0;for(let i=0;i<a.length;i++){covered+=a[i].seconds;if(Math.abs(covered-seconds/2)<1e-8&&i+1<a.length)return (a[i].value+a[i+1].value)/2;if(covered>seconds/2)return a[i].value;}return a.at(-1).value;}
const score=x=>finite(x)?Math.round(clamp(x)):null;
const grade=n=>!finite(n)?'unavailable':n>=90?'Healthy':n>=80?'Mild':n>=60?'Moderate':'Risk';
// Real BLE/4G SDKs often return Float32Array/Float64Array rather than JS
// arrays. Accept numeric typed buffers, never arbitrary strings or DataView.
const samples=x=>Array.isArray(x)||(ArrayBuffer.isView(x)&&!(x instanceof DataView)&&typeof x.length==='number');
// Engineering candidate, NOT clinically validated percentages: direct vital
// trends (heart + breathing) carry 64%; quality-eligible HRV and mechanical
// beat regularity carry 36%. Recovery weights are unequal because activity
// context and matched post-effort recovery are distinct evidence sources.
const weights={heart:{rest:.58,var:.26,response:.16},breath:{rest:.55,var:.29,persist:.16},hrv:{rmssd:.6,sdnn:.4},stable:{interval:.70,ectopic:.30},cardio:{heart:.32,breath:.32,hrv:.20,stable:.16},sleep:{duration:.34,quiet:.33,breath:.20,continuity:.13},energy:{motion:.46,regularity:.22,rest:.32},recovery:{drop:.82,stability:.18},calm:{hrv:.35,heart:.30,breath:.20,quiet:.15},activityRecovery:{energy:.40,recovery:.35,calm:.25},physiol:{cardio:.42,sleep:.30,activityRecovery:.28},rhythm:{calm:.58,stable:.42},age:{cardio:.32,sleep:.19,activityRecovery:.24,rhythm:.17,trend:.08}};
const weighted=(parts,w,required=[],minCoverage=.55)=>{
 if(required.some(k=>!finite(parts[k])))return null;
 const all=Object.keys(w),valid=all.filter(k=>finite(parts[k]));const tot=all.reduce((a,k)=>a+w[k],0),ws=valid.reduce((a,k)=>a+w[k],0);
 if(!ws||ws/tot<minCoverage)return null;
 return score(valid.reduce((a,k)=>a+w[k]*parts[k],0)/ws);
};
const coverage=(parts,w)=>Object.keys(w).reduce((a,k)=>a+(finite(parts[k])?w[k]:0),0)/Object.values(w).reduce((a,b)=>a+b,0);
const gauss=(z,width=1.65)=>100*Math.exp(-.5*(z/width)**2);
function robust(value,past,relativeFloor=.12){
 if(!finite(value)||past.length<3)return null;
 const c=median(past),spread=Math.max(1.4826*(mad(past)||0),Math.abs(c)*relativeFloor,.25);
 return score(gauss((value-c)/spread));
}
function asym(value,past,floor=.12,upPenalty=1.15){
 if(!finite(value)||past.length<3)return null;
 const c=median(past),spread=Math.max(1.4826*(mad(past)||0),Math.abs(c)*floor,.25),z=(value-c)/spread;
 return score(gauss(z*(z>0?upPenalty:1)));
}
const tail=a=>a.length? a[a.length-1]:null;
function seriesPeaks(samples,fs=20,kind='heart'){
 if(!(Array.isArray(samples)||(ArrayBuffer.isView(samples)&&!(samples instanceof DataView)))||samples.length<fs*12||fs<10)return [];
 const ref=kind==='heart'?.29:.70,maxInterval=kind==='heart'?2.2:9;
 const refractory=Math.floor(ref*fs),pre=Math.max(8,Math.round(fs*(kind==='heart'?3:4)));
 const peak=[];let last=-99999;
 for(let i=pre;i<samples.length-2;i++){
  const v=samples[i];if(!finite(v)||v<=samples[i-1]||v<samples[i+1]||i-last<refractory)continue;
  const nearby=samples.slice(i-pre,i).filter(finite),center=median(nearby),amp=mad(nearby);
  if(!finite(center)||!finite(amp)||v<center+Math.max(amp*(kind==='heart'?.88:.90),1e-7))continue;
  const a=samples[i-1],c=samples[i+1],d=a-2*v+c;
  const delta=Math.abs(d)>1e-8?clamp(.5*(a-c)/d,-.5,.5):0;
  const sec=(i+delta)/fs;
  if(peak.length&&sec-tail(peak)<ref)continue;
  if(peak.length&&sec-tail(peak)>maxInterval){/* possible missed beats; retain but QC rejects gap */}
  peak.push(sec);last=i;
 }
 return peak;
}
// Reject broadband noise that creates coincidental peaks. The 20 Hz waveform must
// show a repeating lag compatible with those peaks; this is signal-quality QC,
// not an arrhythmia detector or proof of biomedical accuracy.
function periodicCoherence(values,intervalSec,fs=20){
 if(!finite(intervalSec)||intervalSec<=0||!samples(values)||values.length<fs*12)return 0;
 const n=values.length,mu=mean(values.filter(finite));
 if(!finite(mu))return 0;
 const l0=Math.round(intervalSec*fs),maxLag=Math.min(n-20,l0+2),minLag=Math.max(3,l0-2);
 let best=-1;
 for(let lag=minLag;lag<=maxLag;lag++){
  let cross=0,aa=0,bb=0,ct=0;
  for(let i=lag;i<n;i+=2){const a=values[i]-mu,b=values[i-lag]-mu;if(!finite(a)||!finite(b))continue;cross+=a*b;aa+=a*a;bb+=b*b;ct++;}
  const r=ct>100&&aa>1e-10&&bb>1e-10?cross/Math.sqrt(aa*bb):0;
  if(r>best)best=r;
 }
 return clamp(best,0,1);
}
function intervalMetrics(times,opt={}){
 if(!samples(times)||times.length<35)return null;
 const lo=opt.species==='cat'?220:250,hi=opt.species==='cat'?1400:2100;
 const seg=[];for(let i=1;i<times.length;i++){
  const interval=(times[i]-times[i-1])*1000;
  if(finite(interval)&&interval>=lo&&interval<=hi)seg.push({value:interval,position:i});
 }
 if(seg.length<30)return null;
 const mm=median(seg.map(x=>x.value));
 const filtered=seg.filter(x=>Math.abs(x.value-mm)<=Math.max(120,mm*.25));
 if(filtered.length<30)return null;
 const nn=filtered.map(x=>x.value),diff=[];
 // Do not join intervals across removed artifacts/missed beats.
 for(let i=1;i<filtered.length;i++)if(filtered[i].position===filtered[i-1].position+1)diff.push(filtered[i].value-filtered[i-1].value);
 const validFrac=filtered.length/Math.max(1,times.length-1);
 const nnSd=sampleSD(nn);
 return {heartRate:60000/mean(nn),nnCount:nn.length,meanNN:mean(nn),sdnn:nnSd,rmssd:diff.length>=25?Math.sqrt(mean(diff.map(x=>x*x))):null,successivePairs:diff.length,validFraction:validFrac,interbeatCV:(nnSd||0)/mean(nn)};
}
function windowFeatures({heartWave,breathWave,motionWave,fs=20,verifiedBeatTimes=null,sdkMetrics=null,profile={}}){
 const h=heartWave||[],b=breathWave||[],m=motionWave||[],len=Math.min(h.length,b.length,m.length);
 if(fs!==20||!samples(h)||!samples(b)||!samples(m)||len<fs*30||h.length!==b.length||h.length!==m.length)
  return {valid:false,reason:'require_aligned_20hz_30sec'};
 const validFraction=a=>a.slice(0,len).filter(finite).length/len;
 if([h,b,m].some(a=>validFraction(a)<.95))return {valid:false,reason:'invalid_or_missing_waveform_samples',quality:{signalValid:false}};
 const motion=m.slice(0,len).filter(finite),amp=motion.length?Math.sqrt(mean(motion.map(v=>v*v))):null;
 const hb=seriesPeaks(h.slice(0,len),fs,'heart'),br=seriesPeaks(b.slice(0,len),fs,'breath');
 const nn=intervalMetrics(hb,{species:profile.species});
 const respIntervals=[];for(let i=1;i<br.length;i++){const d=br[i]-br[i-1];if(d>.5&&d<13)respIntervals.push(d);}
 const breathRate0=respIntervals.length>=3?60/median(respIntervals):null;
 const heartCoherence=nn?periodicCoherence(h.slice(0,len),nn.meanNN/1000,fs):0;
 const breathCoherence=finite(breathRate0)?periodicCoherence(b.slice(0,len),60/breathRate0,fs):0;
 const heartQC=!!(nn&&nn.validFraction>=.75&&heartCoherence>=.15);
 const breathQC=finite(breathRate0)&&breathCoherence>=.15;
 const breathRate=breathQC?breathRate0:null;
 const signalQuality={durationSec:len/fs,cardiacBeatCount:hb.length,respCycleCount:br.length,cardiacCoverage:nn?.validFraction??0,motionRms:amp,heartCoherence,breathCoherence};
 // Independent beat timestamps must describe THIS observed window. Otherwise
 // a copied or incorrectly timestamped beat list can produce believable HRV
 // without any supporting 20Hz waveform duration. Quality-tagged SDK scalar
 // metrics remain separately supported below.
 const verifiedSpan=samples(verifiedBeatTimes)&&verifiedBeatTimes.length>1?
  verifiedBeatTimes[verifiedBeatTimes.length-1]-verifiedBeatTimes[0]:null;
 // A short IBI excerpt must not inherit the duration of a much longer 20 Hz
 // waveform. Beat times may omit the first/last few seconds of a 180 s window;
 // require at least 175 s between usable endpoints as well as a >=180 s window.
 // A verified sequence uses window-relative seconds, starting at or after 0.
 // Validate *every* timestamp, not only its endpoints: an out-of-order or
 // out-of-window beat must never be hidden by a high overall NN pass rate.
 const orderedAndContained=samples(verifiedBeatTimes)&&Array.from(verifiedBeatTimes).every((t,i)=>
  finite(t)&&t>=0&&t<=len/fs+.05&&(i===0||t>verifiedBeatTimes[i-1]));
 const rawHrvEligible=orderedAndContained&&verifiedBeatTimes.length>150&&len/fs>=180&&
  finite(verifiedBeatTimes[0])&&finite(verifiedBeatTimes[verifiedBeatTimes.length-1])&&
  finite(verifiedSpan)&&verifiedSpan>=175&&verifiedSpan<=len/fs+.05;
 const verified=rawHrvEligible?intervalMetrics(verifiedBeatTimes,{species:profile.species}):null;
 const validHrv=!!(verified&&verified.validFraction>=.9&&verified.successivePairs>=100);
 // Supplier can provide independently computed and quality-tagged HRV alongside its 20Hz stream.
 // The scalar metrics are NOT derived from minute-averaged heart rate or an assumed 20Hz NN precision.
 // A quality-tagged OEM aggregate must cover THIS observed window. A three-
 // minute number embedded in an unrelated 30-second chunk is not verifiable.
 const supplierDuration=Number(sdkMetrics?.durationSec),supplierQuality=Number(sdkMetrics?.signalQuality);
 const supplier=!!(sdkMetrics&&sdkMetrics.verified===true&&String(sdkMetrics.methodId||'').trim()&&
  finite(supplierDuration)&&supplierDuration>=180&&supplierDuration<=len/fs+.5&&
  finite(supplierQuality)&&supplierQuality>=.8&&supplierQuality<=1&&
  finite(sdkMetrics.rmssd)&&sdkMetrics.rmssd>0&&sdkMetrics.rmssd<500&&
  finite(sdkMetrics.sdnn)&&sdkMetrics.sdnn>0&&sdkMetrics.sdnn<500);
 const usingSupplier=supplier&&!validHrv,haveHrv=validHrv||supplier;
 return {valid:heartQC&&breathQC,heartRate:heartQC?nn.heartRate:null,breathRate,motionRms:amp,
  meanNN:nn?.meanNN??null,interbeatCV:nn?.interbeatCV??null,
  rmssd:validHrv?verified.rmssd:supplier?sdkMetrics.rmssd:null,
  sdnn:validHrv?verified.sdnn:supplier?sdkMetrics.sdnn:null,
  nnvgr:supplier&&finite(sdkMetrics.nnvgr)?sdkMetrics.nnvgr:null,
  quality:{...signalQuality,hrvValid:haveHrv,heartValid:heartQC,respValid:breathQC,
   hrvProvenance:validHrv?'verified_beat_timestamps':usingSupplier?'sdk_quality_gated_metric':'not_validated_at_20hz',
   hrvDurationSec:validHrv?Math.round(verifiedSpan*10)/10:usingSupplier?supplierDuration:null},source:'20hz-waveform'};
}
function fromRaw(input){
 const rates=[input?.fs,input?.heartHz,input?.breathHz,input?.motionHz].filter(x=>x!==undefined&&x!==null);
 if(rates.some(x=>x!==20))return {valid:false,reason:'require_aligned_20hz_channels',heartHz:input?.heartHz??null,breathHz:input?.breathHz??null,motionHz:input?.motionHz??null};
 const x=windowFeatures({heartWave:input.heartWave,breathWave:input.breathWave,motionWave:input.motionWave,fs:20,verifiedBeatTimes:input.verifiedBeatTimes??null,sdkMetrics:input.sdkMetrics??null,profile:input.profile||{}});
 return {...x,heartHz:20,breathHz:20,motionHz:20};
}
// Streaming service receives one 30–300 s 20 Hz chunk at a time; no full-day arrays in browser.
function fromWaveformChunks(chunks,{date=null,profile={},hoursObserved=null,plannedSamplingSeconds=null,wearConfirmed=false,signalConfirmed=false}={}){
 // In production pass consecutive timestamped 30–60 second windows for the whole day.
 // Reuse the same declared-rate validation as individual SDK windows. A
 // mismatched respiration/motion channel must not slip through daily rollups.
 const all=(chunks||[]).map((x,i)=>({...fromRaw({...x,profile}),startLocalMinute:x.startLocalMinute??(finite(x.startLocalSecond)?x.startLocalSecond/60:finite(x.startEpochMs)&&finite(x.timezoneOffsetMinutes)?(((x.startEpochMs+x.timezoneOffsetMinutes*60000)%86400000+86400000)%86400000)/60000:null),startEpochMs:x.startEpochMs,windowIndex:i}));
 let timelineValid=date===null||strictDate927(date),continuityGapSec=0,prev=null,timeBasis=null;
 const profileOwners=[profile?.petId,profile?.ownerPetId,profile?.profile?.petId].filter(x=>x!==null&&x!==undefined&&String(x).trim()!=='').map(String);
 if(new Set(profileOwners).size>1)timelineValid=false;
 const targetOwner=profileOwners[0]??(profile?.id===null||profile?.id===undefined?null:String(profile.id));
 const seenChunkOwners=new Set();
 const startSeconds=[];
 for(let i=0;i<(chunks||[]).length;i++){
  const row=chunks[i],seconds=finite(row.startEpochMs)?row.startEpochMs/1000:finite(row.startLocalSecond)?row.startLocalSecond:finite(row.startLocalMinute)?row.startLocalMinute*60:null;
  const basis=finite(row.startEpochMs)?'epoch':'local';
  const chunkOwners=[row.petId,row.ownerPetId,row.profile?.petId].filter(x=>x!==null&&x!==undefined&&String(x).trim()!=='').map(String);
  for(const owner of chunkOwners)seenChunkOwners.add(owner);
  if(new Set(chunkOwners).size>1||targetOwner&&chunkOwners.some(owner=>owner!==targetOwner))timelineValid=false;
  startSeconds.push(seconds);
  const dur=(row.heartWave?.length||0)/(row.fs||20);
  if(!finite(seconds)||!finite(dur)||dur<=0||(row.fs??20)!==20||timeBasis&&basis!==timeBasis){timelineValid=false;}
  if(!Array.isArray(row.heartWave)&&!ArrayBuffer.isView(row.heartWave))timelineValid=false;
  if(!row.breathWave||!row.motionWave||row.heartWave?.length!==row.breathWave?.length||row.heartWave?.length!==row.motionWave?.length)timelineValid=false;
  if(finite(row.startLocalSecond)&&finite(row.startLocalMinute)&&Math.abs(row.startLocalSecond-row.startLocalMinute*60)>1)timelineValid=false;
  if(basis==='local'&&(!finite(seconds)||seconds<0||seconds+dur>86400+.05))timelineValid=false;
  if(finite(row.startEpochMs)&&date){const offset=row.timezoneOffsetMinutes;
   const localMs=finite(offset)?row.startEpochMs+offset*60000:NaN,localDate=new Date(localMs);
   if(!finite(offset)||offset < -720||offset>840||!finite(localDate.getTime())||localDate.toISOString().slice(0,10)!==date)timelineValid=false;}
  if(finite(row.startEpochMs)&&finite(row.timezoneOffsetMinutes)){
   const localSec=((row.startEpochMs+row.timezoneOffsetMinutes*60000)%86400000+86400000)%86400000/1000;
   // A single chunk beginning before midnight may carry samples from the
   // next calendar day. Both endpoints must belong to its declared day.
   if(localSec+dur>86400+.05)timelineValid=false;
   if(finite(row.startLocalSecond)&&Math.abs(row.startLocalSecond-localSec)>1)timelineValid=false;
   if(finite(row.startLocalMinute)&&Math.abs(row.startLocalMinute*60-localSec)>1)timelineValid=false;
  }
  if(prev!==null&&finite(seconds)){
   const gap=seconds-prev;
   if(gap < -.05)timelineValid=false; // overlap/backwards time is invalid
   else if(gap>.05)continuityGapSec+=gap; // scheduled sampling pauses are allowed
  }
  prev=finite(seconds)?seconds+dur:null;timeBasis=basis;
 }
 if(seenChunkOwners.size>1)timelineValid=false;
 const wins=all.filter(x=>x.valid);
 if(wins.length<3)return null;
 const hr=wins.map(w=>w.heartRate).filter(finite),rr=wins.map(w=>w.breathRate).filter(finite),mv=wins.map(w=>w.motionRms).filter(finite);
 const med=median(mv),scale=mad(mv)||0;
 const restLimit=med===null?null:med+Math.max(.00001,scale*.5);
 const quiet=wins.filter(w=>finite(w.motionRms)&&w.motionRms<=restLimit);
 // Representative quiet data needs actual time coverage, not three isolated
 // 30-second points or a falsely extrapolated whole night. Two independent
 // quiet episodes (>=3 min each), OR one genuinely contiguous >=30 min block,
 // plus at least 15 observed quiet minutes are research-stage prerequisites.
 const quietObservedSeconds=quiet.reduce((s,w)=>s+(w.quality?.durationSec||0),0);
 const episodes=[];let segment=0;
 for(let i=0;i<all.length;i++){
  const w=all[i],ok=w.valid&&finite(w.motionRms)&&w.motionRms<=restLimit;
  const prev=all[i-1],prevOK=i>0&&prev?.valid&&finite(prev.motionRms)&&prev.motionRms<=restLimit;
  const continuous=prevOK&&finite(startSeconds[i])&&finite(startSeconds[i-1])&&
   finite(prev.quality?.durationSec)&&Math.abs(startSeconds[i]-(startSeconds[i-1]+prev.quality.durationSec))<=.25;
  if(!ok){if(segment>0)episodes.push(segment);segment=0;continue;}
  if(!continuous&&segment>0){episodes.push(segment);segment=0;}
  segment+=w.quality?.durationSec||0;
 }
 if(segment>0)episodes.push(segment);
 const quietEpisodeCount=episodes.filter(s=>s>=180).length;
 const longestQuietSeconds=Math.max(0,...episodes);
 const hasQuietEvidence=quiet.length>=3&&quietObservedSeconds>=900&&
  (quietEpisodeCount>=2||longestQuietSeconds>=1800);
 const quietWins=hasQuietEvidence?quiet:[];
 const validSecs=wins.reduce((a,w)=>a+(w.quality?.durationSec||0),0);
 // Coverage of an explicit sampling SCHEDULE is different from continuous
 // day coverage. Never call 2 h of periodic sampling "12 h worn".
 const hasPlan=finite(plannedSamplingSeconds)&&plannedSamplingSeconds>=1800&&plannedSamplingSeconds<=86400;
 const expectedSecs=hasPlan?plannedSamplingSeconds:86400;
 const plannedCoverage=Math.min(1,validSecs/expectedSecs);
 const observedDayFraction=Math.min(1,validSecs/86400);
 const minVerifiedDay=validSecs>=900;
 // A single half-day recording entirely in the daytime cannot establish a
 // night's sleep, and a 12-hour overnight recording cannot describe day activity.
 // Count only actually observed seconds, and respect 08:00 / 20:00 boundaries.
 const overlap=(a,b,start,end)=>Math.max(0,Math.min(b,end)-Math.max(a,start));
 const nightObservedSeconds=wins.reduce((sum,w)=>{const s=finite(w.startLocalMinute)?w.startLocalMinute*60:null,d=w.quality?.durationSec;
  return sum+(finite(s)&&finite(d)?overlap(0,28800,s,s+d)+overlap(72000,86400,s,s+d):0);},0);
 const dayObservedSeconds=Math.max(0,validSecs-nightObservedSeconds);
 const fullDayRestSupported=observedDayFraction>=.5&&nightObservedSeconds>=14400;
 const fullDayActivitySupported=observedDayFraction>=.5&&dayObservedSeconds>=14400;
 // Do not expand sampled quiet windows into unobserved "sleep" hours.
 // hoursObserved remains accepted as an input for caller compatibility but
 // is not used to claim measurements in a period with no sensor stream.
 // Quiet daytime motion is not overnight rest; only the genuinely observed
 // 20:00–08:00 windows may contribute to the night-rest proxy. This is still
 // not EEG/REM sleep staging and must not be presented as clinical sleep.
 const nightQuietSecs=quiet.reduce((sum,w)=>{const s=finite(w.startLocalMinute)?w.startLocalMinute*60:null,d=w.quality?.durationSec;
  return sum+(finite(s)&&finite(d)?overlap(0,28800,s,s+d)+overlap(72000,86400,s,s+d):0);},0);
 const restfulSecs=nightQuietSecs;
 const restFraction=nightObservedSeconds>0?restfulSecs/nightObservedSeconds:null;
 const rests=quietWins.map(w=>w.heartRate).filter(finite),respQuiet=quietWins.map(w=>w.breathRate).filter(finite);
 const rrmssd=quietWins.map(w=>w.rmssd).filter(finite),rsdnn=quietWins.map(w=>w.sdnn).filter(finite);
 // Recovery: at least one minute before a clear active->quiet transition and 120s after,
 // all from timestamp-adjacent 20Hz window summaries. Never extrapolate unobserved 2min values.
 const recoveryEvents=[];
 const adjacent=(a,b)=>finite(startSeconds[a])&&finite(startSeconds[b])&&finite(all[a]?.quality?.durationSec)&&Math.abs(startSeconds[b]-startSeconds[a]-all[a].quality.durationSec)<=.25;
 for(let j=2;j<all.length-3;j++){
  const prior=all.slice(j-2,j+1),next=all.slice(j+1);
  if(prior.some(w=>!w.valid)||!next[0]?.valid||!adjacent(j-2,j-1)||!adjacent(j-1,j)||!adjacent(j,j+1))continue;
  const exertion=mean(prior.map(w=>w.motionRms));
  if(!finite(exertion)||exertion<=restLimit+Math.max(.00001,scale*.5))continue;
  if(next[0].motionRms>restLimit)continue;
  let elapsed=0,target=null;
  for(let k=j+1;k<all.length;k++){const w=all[k];if(!w.valid||w.motionRms>restLimit||k>j+1&&!adjacent(k-1,k))break;elapsed+=w.quality.durationSec;if(elapsed>=120){target=w;break;}}
  if(!target||elapsed>180)continue;
  const atStop=prior[2].heartRate,after=target.heartRate,drop=atStop-after;
  if(!finite(atStop)||!finite(after)||drop<=0||drop>110)continue;
  const event={minute:finite(all[j].startLocalMinute)?(all[j].startLocalMinute+all[j].quality.durationSec/60)%1440:null,
   intensity:exertion,drop,start:atStop,end:after,durationSec:elapsed};
  if(finite(event.minute)&&(!recoveryEvents.length||event.minute-tail(recoveryEvents).minute>=5))recoveryEvents.push(event);
 }
 const rrNight=wins.filter(w=>finite(w.startLocalMinute)&&((w.startLocalMinute>=1200)||(w.startLocalMinute<480)))
   .filter(w=>w.motionRms<=restLimit).map(w=>w.breathRate).filter(finite);
 const ret={date,profile,heartRate:durationMean(wins,'heartRate'),breathRate:durationMean(wins,'breathRate'),quietHeartRate:durationMedian(quietWins,'heartRate'),quietBreathRate:durationMedian(quietWins,'breathRate'),heartSpread:durationSD(quietWins,'heartRate'),breathSpread:durationSD(quietWins,'breathRate'),quietRhythm:durationMedian(quietWins,'interbeatCV'),
  rmssd:rrmssd.length>=1?durationMedian(quietWins,'rmssd'):null,sdnn:rsdnn.length>=1?durationMedian(quietWins,'sdnn'):null,
  nnvgr:durationMedian(quietWins,'nnvgr'),
  // This is OBSERVED quiet time inside 20:00–08:00, not an extrapolated sleep
  // duration. Multiplying whole-day sample hours by the night quiet fraction
  // previously counted daytime windows as sleep: e.g. 10h day + 2h night
  // could be reported as 9h sleep. No inferred REM/deep stages are claimed.
  restHours:restfulSecs/3600,restFraction,motionMean:durationMean(wins,'motionRms'),motionVariation:durationSD(wins,'motionRms'),motionRegularity:null,
  recoveryDrop:recoveryEvents.length?median(recoveryEvents.map(e=>e.drop)):null,recoveryCount:recoveryEvents.length,recoveryEvents,
  nightBreathRate:rrNight.length>=3?durationMedian(wins.filter(w=>finite(w.startLocalMinute)&&((w.startLocalMinute>=1200)||(w.startLocalMinute<480))&&w.motionRms<=restLimit),'breathRate'):null,
  quality:{heartValid:hr.length>=3,respValid:rr.length>=3,hrvValid:rrmssd.length>=1&&rsdnn.length>=1,
    hrvWindowCount:rrmssd.length,hrvProvenance:rrmssd.length?quietWins.find(w=>finite(w.rmssd))?.quality?.hrvProvenance:null,
    quietWindowCount:quiet.length,quietObservedSeconds,quietEpisodeCount,longestQuietSeconds,
    validWindowCount:wins.length,
    restingEvidenceStatus:hasQuietEvidence?'qualified_quiet_windows':'insufficient_quiet_windows',
    hrvObservationSeconds:quietWins.filter(w=>finite(w.rmssd)&&finite(w.sdnn)).reduce((sum,w)=>sum+(w.quality?.hrvDurationSec||0),0),
    windowCoverage:wins.length/all.length,timeCoverage:minVerifiedDay?plannedCoverage:0,
    samplingCoverage:plannedCoverage,scheduledSeconds:hasPlan?expectedSecs:null,observedSeconds:validSecs,
    observedDayFraction,nightObservedSeconds,dayObservedSeconds,nightQuietObservedSeconds:restfulSecs,
    fullDayRestSupported,fullDayActivitySupported,
    samplingMode:hasPlan?'scheduled':'continuous',restQuality:hasQuietEvidence,
    timeContinuityValid:timelineValid,gapSeconds:continuityGapSec,
    wearValid:wearConfirmed===true,signalValid:signalConfirmed===true,
    source:'20hz-waveform'},source:'20hz-waveform'};
 if(!timelineValid){ret.quality.timeCoverage=0;ret.quality.restQuality=false;ret.nightBreathRate=null;ret.recoveryEvents=[];ret.recoveryDrop=null;ret.recoveryCount=0;}
 return ret;
}
// Demo adapter from the ONLY three synthetic streams. Does not invent RMSSD/SDNN measurements.
function fromMinuteDemo({heart,breath,motion,nightHours=null,nightMotion=null,idx=0,date=null,profile={}}){
 const n=Math.min(heart?.length||0,breath?.length||0,motion?.length||0);if(n<60)return null;
 const usable=[];for(let i=0;i<n;i++)if(finite(heart[i])&&finite(breath[i])&&finite(motion[i]))usable.push(i);
 if(usable.length<60)return null;
 const h=usable.map(i=>heart[i]),rr=usable.map(i=>breath[i]),m=usable.map(i=>motion[i]);
 const restIds=usable.filter(i=>motion[i]<27),q=restIds.length>=30?restIds:usable;
 const qh=q.map(i=>heart[i]),qr=q.map(i=>breath[i]);
 const deltas=[];for(let k=1;k<q.length;k++)if(q[k]-q[k-1]<=2)deltas.push(Math.abs(heart[q[k]]-heart[q[k-1]]));
 const events=[];
 for(let k=8;k<usable.length-3;k++){
  const i=usable[k],bef=mean(motion.slice(i-5,i+1)),aft=mean(motion.slice(i+1,i+4));
  if(bef>40&&aft<24&&finite(heart[i])&&finite(heart[i+2])){
   const start=heart[i],end=heart[i+2],drop=start-end;
   if(drop>0&&drop<100)events.push({minute:i,start,end,drop,intensity:bef});
  }
 }
 const distinct=events.filter((e,i)=>i===0||e.minute-events[i-1].minute>5);
 // HRV proxies are NOT quantified in ms and are NEVER rendered as RMSSD/SDNN.
 const estimatedNight=finite(nightHours)?nightHours:Array.isArray(nightMotion)&&nightMotion.length===960?Array.from({length:32},(_,k)=>nightMotion.slice(k*30,k*30+30)).filter(bin=>mean(bin.filter(finite))<27).length*.5:null;
 return {date,idx,profile,heartRate:mean(h),breathRate:mean(rr),quietHeartRate:median(qh),quietBreathRate:median(qr),heartSpread:sd(qh),breathSpread:sd(qr),quietRhythm:mean(deltas),rmssd:null,sdnn:null,
 restHours:estimatedNight,restFraction:restIds.length/n,motionMean:mean(m),motionVariation:sd(m),motionRegularity:1/(1+(sd(m)||0)),
 recoveryDrop:distinct.length?median(distinct.map(x=>x.drop)):null,recoveryCount:distinct.length,recoveryEvents:distinct,nightBreathRate:null,
 quality:{heartValid:true,respValid:true,hrvValid:false,windowCoverage:usable.length/n,restQuality:q.length>30,source:'minute-demo-no-interbeat'},source:'minute-demo-no-interbeat'};
}
function validBaselineWear(x){if(!x||!strictDate927(x.date)||ownerConflict(x))return false;
 const q=x.quality||{};
 if(q.heartValid!==true||q.respValid!==true||q.timeContinuityValid===false||q.wearValid===false||q.signalValid===false)return false;
 // In real recordings, absent wear/contact confirmation is NOT confirmation.
 // Legacy demo fixtures have a separate explicit synthetic provenance.
 return x.source!=='20hz-waveform'||(q.motionInterference!==true&&[undefined,null,'','continuous','scheduled'].includes(q.samplingMode)&&q.timeContinuityValid===true&&q.wearValid===true&&q.signalValid===true&&Number(q.timeCoverage)>=.5&&
  finite(q.observedSeconds)&&q.observedSeconds>=900&&q.observedSeconds<=86400&&
  finite(q.observedDayFraction)&&Math.abs(q.observedDayFraction-q.observedSeconds/86400)<1e-5&&
  (q.samplingMode!=='scheduled'||finite(q.scheduledSeconds)&&q.scheduledSeconds>=1800&&q.scheduledSeconds<=86400&&q.observedSeconds<=q.scheduledSeconds)&&
  Math.abs(q.timeCoverage-Math.min(1,q.observedSeconds/(q.samplingMode==='scheduled'?q.scheduledSeconds:86400)))<1e-5);
}
function validHrvEvidence(x){
 const q=x?.quality;if(q?.hrvValid!==true||!finite(x.rmssd)||!finite(x.sdnn)||x.rmssd<=0||x.sdnn<=0)return false;
 // The synthetic gallery is a separately identified fixture; only accepted
 // SDK/beat timestamps are qualified as actual owner observations.
 return x.source==='sdk-demo-fixture'||
  (x.source==='20hz-waveform'&&['verified_beat_timestamps','sdk_quality_gated_metric'].includes(q.hrvProvenance));
}
// Owner identity is part of a reference, just as date and physiological
// context are. If one row is tagged and the other is not, do not join them.
const ownerClaims=x=>[x?.petId,x?.ownerPetId,x?.profile?.petId,x?.profile?.id].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='').map(String);
const ownerConflict=x=>new Set(ownerClaims(x)).size>1;
const ownerKey=x=>{const ids=ownerClaims(x);const fallback=x?.profile?.id;
 return ownerConflict(x)?null:ids[0]??(fallback===null||fallback===undefined||String(fallback).trim()===''?null:String(fallback));};
const sameOwner=(a,b)=>ownerKey(a)===ownerKey(b);
// A first real reading must not learn a personalized baseline from showroom
// fixtures. Only records from the same evidence family can calibrate it.
const sameEvidenceFamily=(a,b)=>(a?.source==='20hz-waveform')===(b?.source==='20hz-waveform');
const baselineStart=date=>new Date(Date.parse(date+'T12:00:00Z')-45*86400000).toISOString().slice(0,10);
function mixedOwners(rows){const valid=(Array.isArray(rows)?rows:[]).filter(x=>x&&strictDate927(x.date));
 const ids=new Set(valid.map(ownerKey).filter(Boolean));
 return valid.some(ownerConflict)||ids.size>1||(ids.size===1&&valid.some(x=>ownerKey(x)===null));
}
function metricContextEligible(x,key){
 if(x?.source!=='20hz-waveform')return true;
 const q=x.quality||{};
 // A nominally valid wear day is not necessarily a night-rest or quiet-HRV
 // measurement day. Keep incompatible days out of metric-specific baselines.
 if(['restHours','restFraction','nightBreathRate'].includes(key))
  return q.fullDayRestSupported===true&&q.restQuality===true;
 if(['quietHeartRate','quietBreathRate','quietRhythm','heartSpread','breathSpread','rmssd','sdnn'].includes(key))
  return q.restQuality===true&&Number(q.quietObservedSeconds)>=900&&
   (Number(q.quietEpisodeCount)>=2||Number(q.longestQuietSeconds)>=1800)&&
   (!['rmssd','sdnn'].includes(key)||Number(q.hrvObservationSeconds)>=60);
 if(['motionMean','motionVariation','motionRegularity'].includes(key))
  return q.fullDayActivitySupported===true;
 return true;
}
// The daily score's reference path must use the same provenance-sensitive,
// order-independent day selection as the chart and longitudinal models.
// A raw physiological feature conflict is not detectable by comparing only
// the final scores, because feature objects can have no `scores` field.
function canonicalFeatureDays(rows){
 const choose=new Map(),disputed=new Set();
 const rank=r=>[r.source==='20hz-waveform'?2:r.source==='sdk-demo-fixture'||r.source==='minute-demo-no-interbeat'?1:0,
  r.source==='20hz-waveform'?Number(r.quality?.observedSeconds)||0:0,
  r.source==='20hz-waveform'?Number(r.quality?.timeCoverage)||0:0];
 const cmp=(a,b)=>{const x=rank(a),y=rank(b);return x[0]-y[0]||x[1]-y[1]||x[2]-y[2];};
 const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?
  Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v??null;
 const dataKeys=['heartRate','breathRate','quietHeartRate','quietBreathRate','heartSpread','breathSpread',
  'quietRhythm','rmssd','sdnn','nnvgr','restHours','restFraction','motionMean','motionVariation',
  'motionRegularity','recoveryDrop','recoveryCount','recoveryEvents','nightBreathRate'];
 const qualityKeys=['restQuality','fullDayRestSupported','fullDayActivitySupported','hrvValid','hrvProvenance'];
 const digest=r=>JSON.stringify([dataKeys.map(k=>stable(r[k])),qualityKeys.map(k=>stable(r.quality?.[k]))]);
 for(const row of rows||[]){
  if(!validBaselineWear(row))continue;
  const old=choose.get(row.date);
  if(!old){choose.set(row.date,row);continue;}
  const priority=cmp(row,old);
  if(priority>0){choose.set(row.date,row);disputed.delete(row.date);}
  else if(priority===0&&digest(row)!==digest(old))disputed.add(row.date);
 }
 return [...choose.values()].filter(x=>!disputed.has(x.date));
}
function priorDays(days,idx,key){const result=[],current=days[idx],currentDate=current?.date;
 // Sort by calendar date, then exclude unresolvable same-quality sensor days
 // BEFORE taking up to fourteen prior values for the chosen physiological key.
 const cutoff=currentDate&&baselineStart(currentDate);
 const candidates=canonicalFeatureDays(days.filter((x,k)=>k!==idx&&strictDate927(x?.date)&&currentDate&&x.date>=cutoff&&x.date<currentDate&&sameOwner(x,current)&&sameEvidenceFamily(x,current)))
  .sort((a,b)=>b.date.localeCompare(a.date));
 for(const x of candidates){if(result.length>=14)break;
  if(!metricContextEligible(x,key)||!finite(x[key])||((key==='rmssd'||key==='sdnn')&&!validHrvEvidence(x)))continue;
  result.push(x[key]);
 }return result.reverse();}
function personalBaseline(days,idx,key,minDays=14){const arr=priorDays(days,idx,key);if(arr.length<minDays)return null;return {center:median(arr),spread:Math.max(1.4826*(mad(arr)||0),Math.abs(median(arr))*.09,.25),validDays:arr.length};}
function scoreDay(days,idx,options={}){
 const d=days[idx];if(!d)return null;
 // A day failing the validated wearing/time gate must never be scored, nor
 // used to calibrate another day's 14-valid-day personal baseline.
 if(!validBaselineWear(d))return null;
 // Source of truth for the 14-valid-wear-day handoff:
 // before day 14, supported metrics compare against the group proxy G;
 // starting on the NEXT scored day, R=0.30*G+0.70*mean(prior 14 valid P).
 // Unsupported metrics (no meaningful unit-compatible G) retain robust history.
 const cutoff=baselineStart(d.date);
 const priorValidWear=canonicalFeatureDays(days.filter((x,k)=>k!==idx&&x?.date>=cutoff&&x.date<d.date&&sameOwner(x,d)&&sameEvidenceFamily(x,d))).length;
 const personalized=priorValidWear>=14, referenceByKey=options.groupReferenceByKey||{};
 const references={};
 const hs=key=>priorDays(days,idx,key), cmp=(key,f=.14,asymFactor=1)=>{
  if(!finite(d[key]))return null;
  const history=hs(key);
  const group=referenceByKey[key],supported=finite(group)&&group>0;
  // A formal RMSSD/SDNN personal reference requires fourteen previous
  // eligible metric-specific days. Three arbitrary HRV points are not a
  // defensible stable baseline, even if the pet has 14 OTHER wear days.
  const hrvMetric=key==='rmssd'||key==='sdnn';
  if(!supported)return history.length<(hrvMetric?14:3)?null:asymFactor===1?robust(d[key],history,f):asym(d[key],history,f,asymFactor);
  // Fourteen accepted WEAR days do not imply fourteen valid measurements of
  // every individual metric (HRV in particular may be absent). Never apply
  // the 70% individual weighting to a partially observed metric history.
  // A verified cohort reference is available on day one; it must not be
  // artificially blocked by the 3-day threshold for self-history statistics.
  const personal=history.length>=14?robustPersonalMean(history):mean(history);
  const weight=(personalized&&history.length>=14)?0.70:0,ref=weight>0?group*(1-weight)+personal*weight:group;
  const centerSpread=1.4826*(mad(history)||0),scale=Math.max(centerSpread,Math.abs(ref)*f,.25);
  let z=(d[key]-ref)/scale;
  if(!finite(z))return null;
  if(z>0)z*=asymFactor;
  const value=score(100*Math.exp(-.5*(z/1.65)**2));
  references[key]={group,personal,ref,weight,priorValidWear};
  return value;
 };
 const restHeart=cmp('quietHeartRate',.10,1.12),spread=cmp('heartSpread',.18),effort=cmp('heartRate',.15,1.05);
 const heart=weighted({rest:restHeart,var:spread,response:effort},weights.heart,['rest']);
 let breath=weighted({rest:cmp('quietBreathRate',.10,1.23),var:cmp('breathSpread',.2),persist:cmp('breathRate',.13,1.1)},weights.breath,['rest']);
 // Clinical reference is an ADVISORY guard for quiet breathing, not disease classification.
 if(finite(d.quietBreathRate)&&d.quietBreathRate>30&&d.quality?.restQuality&&finite(breath))breath=Math.min(breath,79);
 // HRV belongs to a species-, duration- and context-matched reference or to
 // the pet's own sufficiently observed history. A 58/73 ms one-size-fits-all
 // startup comparator was neither veterinary-calibrated nor valid for cats.
 // Missing reference means unavailable, NEVER an invented plausible score.
 let hrv=validHrvEvidence(d)?weighted({rmssd:cmp('rmssd',.18,.45),sdnn:cmp('sdnn',.20,.45)},weights.hrv,['rmssd','sdnn']):null;
 // Mechanical beat-pattern consistency proxy is NOT an ECG arrhythmia assessment.
 const stable=weighted({interval:cmp('quietRhythm',.22),ectopic:cmp('heartSpread',.20)},weights.stable,['interval']);
 const cardioParts={heart,breath,hrv,stable};
 const ownerDay=d.source==='20hz-waveform';
 const cardioWeights=ownerDay?{heart:.5,breath:.5}:weights.cardio;
 const recoveryWeights=ownerDay?{energy:1/3,recovery:1/3,calm:1/3}:weights.activityRecovery;
 let cardio=weighted(cardioParts,cardioWeights,['heart','breath'],.64);
 // A missing quality-controlled HRV or beat-pattern input can never masquerade
 // as a complete 90+ four-component cardio assessment.
 if(finite(cardio)&&(!finite(hrv)||!finite(stable)))cardio=Math.min(cardio,89);
 const sleepParts={duration:cmp('restHours',.21),quiet:cmp('restFraction',.17),breath:cmp('nightBreathRate',.12,1.15),continuity:cmp('motionVariation',.24)};
 const dailyCoverage=(d.source==='minute-demo-no-interbeat'||d.source==='sdk-demo-fixture')||(d.quality?.timeCoverage??0)>=.5;
 // A day with a few excellent scheduled windows does not establish sleep or
 // activity duration across the missing hours. A verified overnight rollup
 // could be supplied later by the device SDK, but is not assumed here.
 const restCoverage=d.source!=='20hz-waveform'||(d.quality?.fullDayRestSupported===true&&Number(d.quality?.observedDayFraction)>=.5&&Number(d.quality?.nightObservedSeconds)>=14400);
 const activityCoverage=d.source!=='20hz-waveform'||(d.quality?.fullDayActivitySupported===true&&Number(d.quality?.observedDayFraction)>=.5&&Number(d.quality?.dayObservedSeconds)>=14400);
 const sleep=dailyCoverage&&restCoverage?weighted(sleepParts,weights.sleep,['duration','quiet']):null;
 const energyParts={motion:cmp('motionMean',.21),regularity:cmp('motionVariation',.27),rest:cmp('restHours',.21)};
 const energy=dailyCoverage&&activityCoverage?weighted(energyParts,weights.energy,['motion','rest']):null;
 // Compare recovery only against genuinely similar preceding effort intensities.
 const current=d.recoveryEvents?.filter(e=>finite(e.drop)&&finite(e.intensity))||[];
 // Reference only eligible, distinct PREVIOUS calendar days within 30 days;
 // an unworn/corrupt day, a future record or a dense duplicate day cannot
 // become artificial recovery evidence merely by preceding the array index.
 const history=[],todayUTC=Date.parse(d.date+'T12:00:00Z');
 const chronologicalPast=canonicalFeatureDays(days.filter((past,k)=>k!==idx&&strictDate927(past?.date)&&past.date<d.date&&sameOwner(past,d)))
  .sort((a,b)=>b.date.localeCompare(a.date));
 for(const past of chronologicalPast){
  const when=Date.parse(past.date+'T12:00:00Z');
  if(!finite(when)||when>=todayUTC||todayUTC-when>30*86400000)continue;
  for(const e of past.recoveryEvents||[])if(finite(e.drop)&&e.drop>0&&finite(e.intensity)&&e.intensity>=0)history.push(e);
 }
 // Motion RMS is often a fractional sensor-scale value (e.g. 0.04), not an
 // integer activity score. The old absolute tolerance of 8 caused virtually
 // every effort to match. Require ±25% comparable effort, with a tiny sensor
 // noise floor, and count each historical recovery episode only ONCE.
 const matched=history.filter(y=>current.some(x=>x.intensity>0&&
  Math.abs(y.intensity-x.intensity)<=Math.max(.001,x.intensity*.25))).map(y=>y.drop);
 const recoveryParts={drop:matched.length>=3?robust(d.recoveryDrop,matched,.25):null,stability:cmp('quietHeartRate',.13)};
 const recovery=matched.length>=3?weighted(recoveryParts,weights.recovery,['drop']):null;
 const calmParts={hrv,heart:cmp('quietHeartRate',.13,1.10),breath:cmp('quietBreathRate',.13,1.17),quiet:cmp('restFraction',.19)};
 const calm=weighted(calmParts,weights.calm,['heart','breath'],.60);
 const activityRecoveryParts={energy,recovery,calm},activityRecovery=weighted(activityRecoveryParts,recoveryWeights,['energy','recovery','calm'],1);
 const rhythm=weighted({calm,stable},weights.rhythm,['calm','stable']);
 const physiol=weighted({cardio,sleep,activityRecovery},weights.physiol,['cardio','sleep','activityRecovery']);
 const scores={heart,breath,hrv,stable,cardio,sleep,energy,recovery,calm,activityRecovery,rhythm,physiol};
 const confC=finite(cardio)?coverage(cardioParts,cardioWeights):0, confS=finite(sleep)?coverage(sleepParts,weights.sleep):0;
 const confCalm=finite(calm)?coverage(calmParts,weights.calm):0,confRec=finite(recovery)?coverage(recoveryParts,weights.recovery):0;
 const confE=finite(energy)?coverage(energyParts,weights.energy):0;
 const confA=finite(activityRecovery)?recoveryWeights.energy*confE+recoveryWeights.recovery*confRec+recoveryWeights.calm*confCalm:0;
 const confidence={cardio:confC,sleep:confS,energy:confE,recovery:confRec,calm:confCalm,activityRecovery:confA,
  physiol:finite(physiol)?(.42*confC+.30*confS+.28*confA):0,
  rhythm:finite(rhythm)?(.58*confCalm+.42*coverage({interval:stable},{interval:1})):0,
  hrv:finite(hrv)?1:0};
 const phase=personalized?'personalized':hs('quietHeartRate').length>=3?'provisional':'insufficient-baseline';
 return {date:d.date,petId:ownerKey(d),dayIndex:idx+1,phase,baseline:{priorValidWear,ready:personalized,personalWeight:personalized?.70:0,references},scores,confidence,grade:Object.fromEntries(Object.entries(scores).map(([key,val])=>[key,grade(val)])),quality:d.quality,source:d.source,modelVersion:'2.5-fourfactor-robust-personal'};
}
function biologicalAge(actualAge,days,results,opt={}){
 if(!finite(actualAge)||actualAge<=0)return null;
 const good=results.filter(x=>x&&strictDate927(x.date)&&finite(x.scores?.physiol)&&x.scores.physiol>=0&&x.scores.physiol<=100&&finite(x.scores?.rhythm)&&x.scores.rhythm>=0&&x.scores.rhythm<=100&&x.quality?.heartValid===true&&x.quality?.respValid===true&&
  (x.source!=='20hz-waveform'||validBaselineWear(x)));
 // A long-term age trajectory cannot be a mixture of two pets' days.
 if(good.some(ownerConflict)||new Set(good.map(ownerKey).filter(Boolean)).size>1||good.some(x=>ownerKey(x))&&good.some(x=>!ownerKey(x)))return null;
 if(opt.petId&&good.some(x=>x.petId!==String(opt.petId)))return null;
 // Unlike a last-write-wins Map, the same calendar day cannot create an
 // arbitrary biological age when equally qualified scores disagree.
 const unique=calendarWindow(good,365);
 if(unique.length<14)return null;
 const latest=unique.at(-1).date,anchor=Date.parse(latest+'T12:00:00Z');
 const recent=unique.filter(x=>{const t=Date.parse(x.date+'T12:00:00Z');return Number.isFinite(t)&&t<=anchor&&t>anchor-30*86400000;});
 if(recent.length<14)return null;
 const window=recent,meanKey=k=>mean(window.map(s=>s.scores[k]).filter(finite));
 const physical=meanKey('physiol'),rhythm=meanKey('rhythm');
 // One unified source: fusion-adjusted final daily scores, never raw positive-only subscores.
 const index=score(.75*physical+.25*rhythm);
 if(!finite(index))return null;
 // Exactly the same 0.08 years / score-point inverse mapping as the
 // long-term wellness model. Lab effects enter only that model, not here.
 const delta=Math.round((85-index)*.08*100)/100;
 return {estimateYears:Math.round(Math.max(.1,actualAge+delta)*100)/100,deltaYears:delta,index,validDays:window.length,physiol14:Math.round(physical),rhythm14:Math.round(rhythm),phase:'research-sensor-only',isValidated:false};
}
function strictDate927(d){if(!/^\d{4}-\d{2}-\d{2}$/.test(d||''))return false;const v=Date.parse(d+'T12:00:00Z');return finite(v)&&new Date(v).toISOString().slice(0,10)===d;}
function calendarWindow(results,range,asOfDate=null){
 const n=Math.max(1,Math.min(365,Math.trunc(Number(range)||1)));
 const all=(results||[]).filter(x=>x&&strictDate927(x.date));
 // A periodic score can otherwise silently average Milo and Luna, including
 // two different pets recorded on the same calendar date. Audit BEFORE the
 // date deduplication; never turn an ambiguous collection into a green score.
 if(mixedOwners(all))return [];
 // A given date is a calendar anchor, not an instruction to take the last N entries.
 const last=strictDate927(asOfDate)?asOfDate:all.reduce((max,x)=>!max||x.date>max?x.date:max,null);
 if(!last)return [];
 const anchor=Date.parse(last+'T12:00:00Z'),grouped=new Map();
 for(const row of all){const t=Date.parse(row.date+'T12:00:00Z');if(t<=anchor&&t>anchor-n*86400000){if(!grouped.has(row.date))grouped.set(row.date,[]);grouped.get(row.date).push(row);}}
 // Both explicitly tagged showroom generations outrank unidentified records;
 // the V9.73 provenance rename must not downgrade known fixtures to 0.
 const priority=r=>[r.source==='20hz-waveform'?2:['synthetic-demo-fixture','synthetic-extreme-showcase-v973'].includes(r.dataProvenance)?1:0,
  r.source==='20hz-waveform'&&finite(r.quality?.observedSeconds)?r.quality.observedSeconds:0,
  r.source==='20hz-waveform'&&finite(r.quality?.timeCoverage)?r.quality.timeCoverage:0];
 const compare=(a,b)=>{const x=priority(a),y=priority(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return 0;};
 const alike=(a,b)=>[...new Set([...Object.keys(a.scores||{}),...Object.keys(b.scores||{})])].every(k=>Object.is(a.scores?.[k],b.scores?.[k]));
 const distinct=[];for(const group of grouped.values()){
  // Preserve historic ownerless visual-only rows, while giving qualified
  // BCG days a deterministic provenance/coverage precedence.
  if(group.every(r=>priority(r)[0]===0)){
   // Even unannotated legacy days must not be chosen by insertion order.
   if(group.every(r=>alike(r,group[0])))distinct.push(group[0]);
   continue;
  }
  const best=group.reduce((prev,r)=>compare(r,prev)>0?r:prev,group[0]);
  if(group.filter(r=>compare(r,best)===0).every(r=>alike(r,best)))distinct.push(best);
 }
 // A period average and biological-age trajectory must never blend showroom
 // fixtures with live sensor evidence from different dates. If the requested
 // window contains real readings, only those readings form its statistics;
 // otherwise the explicitly synthetic gallery keeps its original history.
 const sorted=distinct.sort((a,b)=>a.date.localeCompare(b.date));
 return sorted.some(r=>r.source==='20hz-waveform')?sorted.filter(r=>r.source==='20hz-waveform'):sorted;
}
function periodScores(results,range,asOfDate=null){
 const n=Math.max(1,Math.min(365,Math.trunc(Number(range)||1)));
 const ownerConflict=mixedOwners(results);
 const xs=calendarWindow(results,n,asOfDate);
 const last=strictDate927(asOfDate)?asOfDate:xs.at(-1)?.date,anchor=last?Date.parse(last+'T12:00:00Z'):null;
 const safeScore=x=>finite(x)&&x>=0&&x<=100;
 // One good day inside a 30-day chart must not be presented as a precise
 // 30-day mean. Require >=50% qualified days PER metric, not simply one
 // general 'wear day' or a completely different metric's history.
 const required=n>=7?Math.ceil(n*.5):1;
 const keys=Object.keys(weights).concat(['physiol']),out={},metricValidDays={};
 for(const k of keys){const vals=xs.map(x=>x?.scores?.[k]).filter(safeScore);
  metricValidDays[k]=vals.length;out[k]=vals.length>=required?score(mean(vals)):null;}
 return {days:n,validDays:xs.filter(x=>safeScore(x?.scores?.physiol)).length,observedDays:xs.length,
  minQualifiedDays:required,metricValidDays,rangeStart:last?new Date(anchor-(n-1)*86400000).toISOString().slice(0,10):null,
  rangeEnd:last||null,scores:out,reason:ownerConflict?'mixed_pet_identity':null};}
return {version:'research-2.4',weights,scoreDay,periodScores,calendarWindow,personalBaseline,biologicalAge,fromRaw,fromWaveformChunks,windowFeatures,fromMinuteDemo,intervalMetrics,peakTimes:seriesPeaks,weighted,grade,robustDeviation:robust,deviation:(x,ref,tol=.15)=>finite(x)&&finite(ref)&&ref>0?score(gauss((x-ref)/(Math.abs(ref)*tol))):null,valid:finite};
});
