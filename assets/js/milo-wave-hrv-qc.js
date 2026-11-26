/* LAFA observational waveform HRV inspector — V10.147
   Leaves all UI/fixture data untouched. Uses only actual consecutive 20Hz B0
   waveform samples; never builds beat intervals from A2 two-minute averages.
   Unknown A/B channel identity does not block segment analysis or retention; only formal scoring requires validated beat identity.
*/
(function(root){'use strict';
const snapshot=root.DeepPetLafaPrecomputed;
if(snapshot?.matchesSource?.()){root.DeepPetMiloHrvResearch=Object.freeze(snapshot.research);root.DeepPetMiloWaveQC=snapshot.qcView();}
else{
const source=root.DeepPetMiloPetHealth20261122||{};
const records=source.records||[];
// This flag can be supplied by a genuinely validated vendor beat-channel decoder;
// it is absent/false in the uploaded capture and is NEVER inferred from a rate match.
const verifiedChannel=name=>source.verifiedBeatChannels?.[name]?.vendorProtocolConfirmed===true;
const median=a=>{if(!a?.length)return null;const b=a.slice().sort((x,y)=>x-y),i=b.length>>1;return b.length%2?b[i]:(b[i-1]+b[i])/2;};
const mean=a=>a.reduce((s,x)=>s+x,0)/Math.max(1,a.length);
const sd=a=>{if(a.length<2)return null;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1));};
const valid=r=>r.quality==='valid'&&r.hr>0&&r.rr>0&&Array.isArray(r.channelA)&&r.channelA.length===20&&r.channelA.every(Number.isFinite)&&Array.isArray(r.channelB)&&r.channelB.length===20&&r.channelB.every(Number.isFinite)&&Number.isFinite(Date.parse(r.at));
// A Bluetooth stream can contain a continuous waveform even when the OEM
// algorithm cannot report a valid one-second HR/RR.  Assess these separately.
const rawRecordValid=r=>Array.isArray(r.channelA)&&r.channelA.length===20&&r.channelA.every(Number.isFinite)&&Array.isArray(r.channelB)&&r.channelB.length===20&&r.channelB.every(Number.isFinite)&&Number.isFinite(Date.parse(r.at));
const rawRuns=[];let rawRun=[];
for(const row of records){if(!rawRecordValid(row)){if(rawRun.length)rawRuns.push(rawRun);rawRun=[];continue;}
 const prev=rawRun.at(-1),sec=prev?(Date.parse(row.at)-Date.parse(prev.at))/1000:0;
 if(rawRun.length&&(sec<.2||sec>1.65)){rawRuns.push(rawRun);rawRun=[];}
 rawRun.push(row);
}
if(rawRun.length)rawRuns.push(rawRun);
const rawCoverageByDay={};
for(const segment of rawRuns){if(!segment.length)continue;const slices=[];let part=[];
 for(const row of segment){if(part.length&&part[0].localDate!==row.localDate){slices.push(part);part=[];}part.push(row);}if(part.length)slices.push(part);
 for(const rows of slices){const date=rows[0].localDate;rawCoverageByDay[date]??={totalSeconds:0,longestContinuousSeconds:0,segments:0,hasContinuous30min:false,hasContinuous60min:false};
 const x=rawCoverageByDay[date];x.totalSeconds+=rows.length;x.segments++;x.longestContinuousSeconds=Math.max(x.longestContinuousSeconds,rows.length);x.hasContinuous30min ||= rows.length>=1800;x.hasContinuous60min ||= rows.length>=3600;}}
const runs=[];let run=[];
for(const row of records){if(!valid(row)){if(run.length)runs.push(run);run=[];continue;}
 const p=run.at(-1),sec=p?(Date.parse(row.at)-Date.parse(p.at))/1000:0;
 if(run.length&&(sec<.65||sec>1.65||row.localDate!==p.localDate)){runs.push(run);run=[];}
 run.push(row);
}
if(run.length)runs.push(run);
const WINDOW=300,STEP=60;const attempts=[];
function candidates(samples){
 const n=samples.length;
 if(n<WINDOW*20)return [];
 // Light baseline subtraction on already filtered OEM channel. No rate imputation.
 const v=new Float64Array(n),smooth=new Float64Array(n);let base=0,amp=0;
 for(let i=0;i<n;i++){base+=.055*(samples[i]-base);v[i]=samples[i]-base;amp+=Math.abs(v[i]);}
 amp/=n;
 for(let i=1;i<n-1;i++)smooth[i]=(v[i-1]+2*v[i]+v[i+1])/4;
 const out=[];let last=-99;
 for(let i=12;i<n-12;i++){
  if(i-last<11||smooth[i]<smooth[i-1]||smooth[i]<=smooth[i+1]||smooth[i]<Math.max(2,amp*.55))continue;
  if(smooth[i]<=smooth[i-10]+amp*.5)continue;
  const z=smooth[i-1]-2*smooth[i]+smooth[i+1],frac=Math.abs(z)>1e-6?Math.max(-.5,Math.min(.5,.5*(smooth[i-1]-smooth[i+1])/z)):0;
  out.push((i+frac)*50);last=i;
 }
 return out;
}
function analyse(window,channel){
 const p=candidates(window.flatMap(r=>r[channel]));const nn=p.slice(1).map((t,i)=>t-p[i]);
 const vendor=window.filter(r=>Number.isFinite(r.hr)&&r.hr>0).map(r=>r.hr);
 const hr=median(vendor);const expected=vendor.length/window.length>=.85?mean(vendor)*window.length/60:null;
 const ratio=expected?p.length/expected:null;
 const invalid=nn.filter(x=>x<300||x>1800).length;
 let jumps=0;for(let i=1;i<nn.length;i++)if(Math.abs(nn[i]-nn[i-1])/Math.max(nn[i],nn[i-1])>.2)jumps++;
 const jumpPct=nn.length>1?100*jumps/(nn.length-1):100;
 const dif=nn.slice(1).map((v,i)=>v-nn[i]);
 const rmssd=dif.length?Math.sqrt(mean(dif.map(x=>x*x))):null,sdnn=sd(nn);
 const reasons=[];
 // Avoid a fixed 240-beat minimum: valid slow heart rates and longer windows differ.
 if(p.length<40)reasons.push('insufficient_peak_count');
 if(vendor.length/window.length<.85)reasons.push('insufficient_vendor_HR_for_independent_check');
 if(!(ratio>=.92&&ratio<=1.08))reasons.push('peak_count_vs_vendor_HR');
 if(invalid)reasons.push('out_of_range_IBI');
 // Large beat-to-beat variation can be normal canine RSA; record as uncertainty,
 // not an automatic human-derived 5% exclusion.
 // Large adjacent variations may be genuine canine respiratory sinus arrhythmia.
 // Keep this as a review flag, not an independent automatic rejection.
 const reviewFlags=jumpPct>35?['IBI_instability_requires_beat_review']:[];
 const signalQC= !reasons.length,sourceVerified=verifiedChannel(channel);
 // There is no channel-level physical identity/ECG beat reference in this ZIP.
 if(!sourceVerified)reasons.push('sensor_channel_identity_not_vendor_verified');
 return {date:window[0].localDate,start:window[0].localDate+'T'+window[0].localTime,end:window.at(-1).localDate+'T'+window.at(-1).localTime,
  channel,observedSeconds:window.length,deviceMedianBpm:hr,expectedBeats:expected===null?null:+expected.toFixed(1),detectedPeaks:p.length,
  beatCountRatio:ratio==null?null:+ratio.toFixed(3),vendorHrAvailableFraction:+(vendor.length/window.length).toFixed(3),invalidIntervals:invalid,largeIntervalJumpPct:+jumpPct.toFixed(1),
  candidateRmssdMs:rmssd==null?null:+rmssd.toFixed(1),candidateSdnnMs:sdnn==null?null:+sdnn.toFixed(1),
  technicalPass:signalQC,sourceVerified,qualified:signalQC&&sourceVerified,failedChecks:reasons,reviewFlags,
  context:'candidate only until beat channel and peak identity are corroborated'};
}
for(const r of runs){if(r.length<WINDOW)continue;
 for(let offset=0;offset+WINDOW<=r.length;offset+=STEP){const window=r.slice(offset,offset+WINDOW);
  for(const channel of ['channelA','channelB'])attempts.push(analyse(window,channel));
 }
}
// Real, uninterrupted 30m/60m waveform attempts.  These are *candidate*
// analyses only: transmitted wave samples alone do not establish NN validity.
// The technical check still requires independently consistent beat detection
// and the manufacturer channel identity. Never count a 30m transmit run as a
// 30m qualified HRV recording merely because packets arrived.
const longWindowAttempts=[];
for(const segment of rawRuns){
 for(const seconds of [1800,3600]){
  if(segment.length<seconds)continue;
  const offsets=[];
  // Include start, middle and end to avoid cherry-picking the first window.
  offsets.push(0,Math.floor((segment.length-seconds)/2),segment.length-seconds);
  for(const offset of [...new Set(offsets)]){
   const w=segment.slice(offset,offset+seconds);
   for(const channel of ['channelA','channelB']){
    const result=analyse(w,channel);
    longWindowAttempts.push({...result,requestedMinutes:seconds/60,
     continuousRawMinutes:seconds/60,heartBeatQualityVerified:result.qualified});
   }
  }
 }
}
// Nonoverlapping windows form actual usable coverage; 5m rolling candidates
// MUST NOT be added up as if they were independent recordings.
const coverageByDay={};
for(const r of runs){if(r.length<WINDOW)continue;const d=r[0].localDate;coverageByDay[d]??={rawConsecutiveSec:0,eligible5MinSec:0,segments:0,longestContinuousSec:0};
 const x=coverageByDay[d];x.rawConsecutiveSec+=r.length;x.eligible5MinSec+=Math.floor(r.length/WINDOW)*WINDOW;x.segments++;x.longestContinuousSec=Math.max(x.longestContinuousSec,r.length);
}
const summary={};
function combineEpochs(candidates,minEpochs){
 // A set of rolling five-minute windows overlaps heavily. Choose disjoint,
 // verified windows before computing extended aggregates. DO NOT stitch IBI
 // across discontinuities or present a pooled SDNN as continuous-time SDNN.
 const selected=[];
 for(const x of candidates.slice().sort((a,b)=>a.end.localeCompare(b.end))){
  const start=Date.parse(x.start),end=Date.parse(x.end);
  if(!selected.length||start>Date.parse(selected.at(-1).end)+999)selected.push(x);
 }
 if(selected.length<minEpochs)return {value:null,rmssdMs:null,sdnnIndexMs:null,qualified:false,verifiedEpochs:selected.length,minutes:selected.length*5};
 const durations=selected.map(x=>Math.max(1,x.detectedPeaks-2));
 const total=durations.reduce((a,b)=>a+b,0);
 const rmssd=Math.sqrt(selected.reduce((sum,x,i)=>sum+durations[i]*(x.candidateRmssdMs**2),0)/total);
 const sdnnIndex=selected.reduce((sum,x,i)=>sum+durations[i]*x.candidateSdnnMs,0)/total;
 return {value:'verified-epoch-aggregate',rmssdMs:+rmssd.toFixed(1),sdnnIndexMs:+sdnnIndex.toFixed(1),
  qualified:true,verifiedEpochs:selected.length,minutes:selected.length*5,
  metricLabel:'RMSSD aggregate & 5-minute SDNN index; NOT continuous multi-hour SDNN'};
}
for(const date of [...new Set(records.map(r=>r.localDate))]){
 const list=attempts.filter(x=>x.date===date),cov=coverageByDay[date]||{rawConsecutiveSec:0,eligible5MinSec:0,segments:0,longestContinuousSec:0};
 const lastAttempt=list.reduce((m,x)=>Math.max(m,Date.parse(x.end)||0),0);
 // Search the full recorded day, not only the latest 30 minutes. The previous
 // cut-off discarded usable earlier periods and caused false 5-minute fallback.
 // Sort strictly by measurement END. A waveform recorded hours earlier is
 // historical evidence, never the current physiological state.
 const recent=list.slice().sort((a,b)=>Date.parse(b.end+'+08:00')-Date.parse(a.end+'+08:00'));
 const passes=recent.filter(x=>x.qualified);
 const tiers={sixtyMinute:combineEpochs(passes,12),thirtyMinute:combineEpochs(passes,6),fiveMinute:combineEpochs(passes,1)};
 const selected=tiers.sixtyMinute.qualified?{minutes:60,...tiers.sixtyMinute}:
  tiers.thirtyMinute.qualified?{minutes:30,...tiers.thirtyMinute}:
  tiers.fiveMinute.qualified?{minutes:5,...tiers.fiveMinute}:null;
 const candidate=recent.filter(x=>Number.isFinite(x.candidateRmssdMs)&&Number.isFinite(x.candidateSdnnMs))
  .sort((a,b)=>Number(b.technicalPass)-Number(a.technicalPass)||
   Math.abs(a.beatCountRatio-1)-Math.abs(b.beatCountRatio-1)||
   a.largeIntervalJumpPct-b.largeIntervalJumpPct)[0]||null;
 const rawCov=rawCoverageByDay[date]||{totalSeconds:0,longestContinuousSeconds:0,hasContinuous30min:false,hasContinuous60min:false};
 const longer=longWindowAttempts.filter(x=>x.date===date);
 const lastWaveEnd=rawRuns.flatMap(s=>s.filter(x=>x.localDate===date).map(x=>x.at)).sort().at(-1)||null;
 const latestResearch=recent.find(x=>Number.isFinite(x.candidateRmssdMs)&&Number.isFinite(x.candidateSdnnMs))||null;
 summary[date]={date,rawWaveformMinutes:+(rawCov.totalSeconds/60).toFixed(1),
  rawLongestContinuousMinutes:+(rawCov.longestContinuousSeconds/60).toFixed(1),
  raw30mAvailable:rawCov.hasContinuous30min,raw60mAvailable:rawCov.hasContinuous60min,
  lastCapturedRawAt:lastWaveEnd,latestResearchCandidateEnd:latestResearch?.end||null,
  latestResearchCandidateTechnicallyQualified:!!latestResearch?.qualified,
  bestResearchCandidateIsHistoricalNotLive:true,
  attempted30m:longer.filter(x=>x.requestedMinutes===30).length,
  attempted60m:longer.filter(x=>x.requestedMinutes===60).length,
  qualified30m:longer.filter(x=>x.requestedMinutes===30&&x.qualified).length,
  qualified60m:longer.filter(x=>x.requestedMinutes===60&&x.qualified).length,
  rawConsecutiveMinutes:+(cov.rawConsecutiveSec/60).toFixed(1),
  fiveMinuteUsableCoverageMinutes:+(cov.eligible5MinSec/60).toFixed(1),
  longestContinuousMinutes:+(cov.longestContinuousSec/60).toFixed(1),
  independentSegments:cov.segments,rolling5MinAttempts:list.length,
  analyzedOnlyRecentThirtyMinutes:false,fiveMinute:tiers.fiveMinute,
  thirtyMinute:tiers.thirtyMinute,sixtyMinute:tiers.sixtyMinute,selected,
  candidateResearchOnly:candidate?{channel:candidate.channel,start:candidate.start,end:candidate.end,
   rmssdMs:candidate.candidateRmssdMs,sdnnMs:candidate.candidateSdnnMs,
   peakCountRatio:candidate.beatCountRatio,largeJumpPct:candidate.largeIntervalJumpPct,
   reasons:candidate.failedChecks}:null,
  reason:selected?'Qualified beat-derived epochs aggregated without gap stitching.':
  'BCG peak identity and stable interval morphology remain unverified; research candidate is not an official HRV score.'};
}
// NEW: minimum-five-minute transparent research fallback for any selected date.
// An uninterrupted BCG capture of >=300 seconds gets a visible beat-detector
// estimate, even when the independent OEM/ECG validation gate fails.  This
// estimate is NEVER an official canine HRV health score or a contributor to
// cardio/calm.  Selection uses the most recent eligible run and its TAIL,
// NOT the most flattering window from hours earlier.  10/30/60 minute
// candidates are retained separately and are not mislabelled as fresh HRV.
// The requested measurement time is NOT the end of whichever raw BCG run
// happened to be longest.  Historic days anchor to the last valid observation
// for THAT DAY, taking both 2-minute A2 and raw 20Hz B0 into account.
// B0-only wave runs cannot silently stand in for later A2 observations.
const observedAnchorByDay={};
const setAnchor=(day,at,kind)=>{
 const ms=Date.parse(at);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day||'')||!Number.isFinite(ms))return;
 const old=observedAnchorByDay[day];
 if(!old||ms>old.ms)observedAnchorByDay[day]={ms,at,kind};
};
for(const r of records){
 if(rawRecordValid(r)||Number.isFinite(r.hr)&&r.hr>0||Number.isFinite(r.rr)&&r.rr>0)
  setAnchor(r.localDate,r.at,'B0 20Hz');
}
for(const r of root.DeepPetMiloHistory545?.samples||[]){
 if(!Array.isArray(r)||!r[0]||!([r[1],r[2],r[3]].some(v=>typeof v==='number'&&Number.isFinite(v)&&v>0)))continue;
 const day=String(r[0]).slice(0,10);
 setAnchor(day,String(r[0]).slice(0,16)+':00+08:00','A2 2-minute trend');
}
const asSGT=ms=>Number.isFinite(ms)?new Date(ms+8*3600000).toISOString().slice(0,19).replace('T',' '):null;
const DAY_END_MAX_GAP_MS=5*60000;
const isLiveAt=ms=>Number.isFinite(ms)&&Date.now()>=ms&&Date.now()-ms<=DAY_END_MAX_GAP_MS;
const dayAnchorPublic=Object.freeze(Object.fromEntries(Object.entries(observedAnchorByDay)
 .map(([day,a])=>[day,Object.freeze({at:asSGT(a.ms),source:a.kind})])));

// The last uninterrupted B0 capture of each day is the historical HRV anchor.
// Drop isolated trailing packets (<5min) rather than moving the anchor to an
// older "best looking" recording. Never join disconnected runs.
const hrvMinFiveResearchByDay={},lastConnectedByDay={};
// Independent polarity/prominence detector: report agreement, not a rate-fitted
// replacement. No manufactured intervals or retrospective threshold tuning.
function prominenceDiagnostic(raw,channel){
 const data=raw.flatMap(r=>r[channel]),v=new Float64Array(data.length);let b=0;
 for(let i=0;i<data.length;i++){b+=.06*(data[i]-b);v[i]=data[i]-b;}
 const smooth=Array.from(v,(x,i)=>(v[Math.max(0,i-1)]+2*x+v[Math.min(v.length-1,i+1)])/4);
 const threshold=Math.max(2,sd(smooth)*.65);const out={};
 for(const polarity of [1,-1]){const a=smooth.map(x=>polarity*x),peaks=[];
  for(let i=6;i<a.length-6;i++){if(a[i]<a[i-1]||a[i]<=a[i+1])continue;
   const prominence=a[i]-Math.max(Math.min(...a.slice(i-6,i)),Math.min(...a.slice(i+1,i+7)));
   if(prominence<threshold)continue;
   if(peaks.length&&i-peaks.at(-1)<5){if(a[i]>a[peaks.at(-1)])peaks[peaks.length-1]=i;continue;}peaks.push(i);}
  const nn=peaks.slice(1).map((x,i)=>(x-peaks[i])*50),valid=nn.filter(x=>x>=220&&x<=2200);
  out[polarity===1?'positive':'negative']={peaks:peaks.length,plausibleIntervalFraction:nn.length?+(valid.length/nn.length).toFixed(3):0,medianIntervalMs:median(valid)};
 }return out;
}
const clamp01=x=>Math.max(0,Math.min(1,x));
const allDates=[...new Set(records.map(r=>r.localDate))].sort();
function researchIntervalEstimate(run,minutes,channel){
 const raw=run.slice(-minutes*60),last=raw.at(-1),result=analyse(raw,channel);
 // The original detector produced implausible RMSSD >1000ms from missed peaks.
 // Use adjacent, physiologically plausible beat intervals only. Do NOT bridge
 // a rejected interval; gaps invalidate adjacent RMSSD difference pairs.
 const peaks=candidates(raw.flatMap(r=>r[channel]));
 const nn=peaks.slice(1).map((t,i)=>t-peaks[i]);
 const medianNN=median(nn.filter(x=>x>=320&&x<=1600));
 const minNN=medianNN?Math.max(320,medianNN*.65):320;
 const maxNN=medianNN?Math.min(1600,medianNN*1.35):1600;
 const keep=nn.map(x=>x>=minNN&&x<=maxNN);
 const good=nn.filter((x,i)=>keep[i]);
 const paired=[];
 for(let i=1;i<nn.length;i++)if(keep[i]&&keep[i-1])paired.push(nn[i]-nn[i-1]);
 const metrics=root.DeepPetUnifiedHrvMath.metrics(peaks,{mask:keep,estimate:true});
 const rmssd=metrics?.rmssd??null;
 const sdnn=metrics?.sdnn??null;
 const expected=result.expectedBeats;
 const detectedRatio=expected?peaks.length/expected:null;
 const rateAgreement=detectedRatio===null?0:clamp01(1-Math.abs(1-detectedRatio));
 const coverage=nn.length?good.length/nn.length:0;
 const pairCoverage=nn.length>1?paired.length/(nn.length-1):0;
 // Packet presence, OEM HR-rate presence, and actual waveform presence are
 // three different quantities.  A low-amplitude or flat 20Hz packet is NOT twenty
 // usable cardiac samples.  Use the chosen channel's within-packet range
 // solely as an auditable signal-presence proxy, not as cardiac proof.
 const waveformSeconds=raw.filter(r=>{
  const a=r[channel];return Array.isArray(a)&&a.length===20&&
   (function(){const mean=a.reduce((z,v)=>z+v,0)/20;return Math.sqrt(a.reduce((z,v)=>z+(v-mean)*(v-mean),0)/20)>=3;})();
 }).length;
 const waveformSecondsFraction=waveformSeconds/Math.max(1,raw.length);
 const beatRateAgreement=detectedRatio!==null&&detectedRatio>=.85&&detectedRatio<=1.15;
 const detectorPlausible=beatRateAgreement&&pairCoverage>=.65;
 const windowQuality={transmittedSeconds:raw.length,waveformSeconds,
  waveformSecondsFraction:+waveformSecondsFraction.toFixed(3),
  vendorHrSeconds:raw.filter(r=>Number.isFinite(r.hr)&&r.hr>0).length,
  detectorPlausible,reason:waveformSecondsFraction<.80?'low_waveform_coverage':
   !detectorPlausible?'beat_detector_disagreement':'candidate_quality_pass'};
 // Quality index is deliberately separate from physiological HRV. A poor
 // detector cannot yield a 95/100 "good health" claim by construction.
 const confidence=clamp01(.35*rateAgreement+.30*coverage+.35*pairCoverage);
 // Consistent with the same 60/40 RMSSD/SDNN PROTOTYPE transform used for
 // synthetic source. Not a veterinary reference range or medical score.
 const rawIndex=rmssd===null||sdnn===null?null:root.DeepPetUnifiedHrvMath.score(rmssd,sdnn,1,null,metrics?.bpm);
 const grade=rawIndex;
 return {...result,minutes,rmssdMs:rmssd===null?null:+rmssd.toFixed(1),sdnnMs:sdnn===null?null:+sdnn.toFixed(1),
  engineeringScore:grade,unadjustedResearchIndex:rawIndex,nvgr:metrics?.bpm??null,regularity:metrics?.regularity??null,
  signalConfidence:+confidence.toFixed(3),windowQuality,detectorPlausible,candidateGoodIntervals:good.length,
  candidateAdjacentPairs:paired.length,pairCoverage:+pairCoverage.toFixed(3),
  waveformEnd: last.localDate+' '+last.localTime,
  scoreMeaning:'unverified prototype index; quality separately reported'};
}
// Segment-first waveform search. Channel provenance is evaluated separately
// from local waveform plausibility and does not prevent research search.
const policy=root.DeepPetHrvWindowPolicy,confirmed=['channelA','channelB'].filter(verifiedChannel);
const selectableDays=[...new Set([...allDates,...Object.keys(observedAnchorByDay)])].sort();
const segmented=root.DeepPetHrvSegmentDecoder.inspect(rawRuns,root.DeepPetUnifiedHrvMath,policy);
const segmentedLedger=segmented.streams.map(s=>({channel:s.channel,polarity:s.polarity,blocks:s.blocks,detectedBeats:s.times.length,retainedBeats:s.quality.filter(Boolean).length,retainedNN:s.times.slice(1).flatMap((t,i)=>s.quality[i]&&s.quality[i+1]&&t-s.times[i]>=220&&t-s.times[i]<=2200?[[s.times[i],t]]:[])}));
for(const day of selectableDays){
 const cutoff=Date.parse(day+'T23:59:59.999+08:00'),minTime=Date.parse(day+'T00:00:00+08:00');
 const eligible=rawRuns.filter(r=>r.length&&Date.parse(r[0].at)<=cutoff&&Date.parse(r.at(-1).at)>=minTime);
 const options={},allChannelDiagnostics={};
 const evaluate=(e,n,channels)=>{if(e.end<n*60)return null;const raw=e.run.slice(e.end-n*60,e.end);const all=channels.map(c=>researchIntervalEstimate(raw,n,c));return all.filter(x=>Number.isFinite(x.rmssdMs)&&Number.isFinite(x.sdnnMs)&&Number.isFinite(x.engineeringScore)).sort((a,b)=>Number(b.qualified)-Number(a.qualified)||Number(b.technicalPass)-Number(a.technicalPass)||b.signalConfidence-a.signalConfidence);};
 // Search ALL captured segments regardless of channel metadata. Certification
 // affects formal eligibility only, not signal retention or research selection.
 const formal=confirmed.length?segmented.latest(cutoff,{minTime,channels:confirmed,minCoverage:.9,minIntervalFraction:.9}):null;
 const research=segmented.latest(cutoff,{minTime,minCoverage:.8,minIntervalFraction:.8,estimate:true});
 const fragmented=segmented.latest(cutoff,{minTime,fragmentedEstimate:true,minEffectiveMinutes:5});
 // Select latest qualifying endpoint before duration; sparse fragments are an explicitly separate fallback, not a 60-min HRV.
 const chosen=[formal,research].filter(Boolean).sort((a,b)=>b.selected.at(-1)-a.selected.at(-1)||b.n-a.n||Number(b===formal)-Number(a===formal))[0]||fragmented;if(!chosen)continue;
 const isFormal=chosen===formal;
 const selectedEndMs=chosen.selected.at(-1),startMs=chosen.selected[0];
 const containing=eligible.find(r=>Date.parse(r[0].at)<=selectedEndMs&&Date.parse(r.at(-1).at)+1000>=selectedEndMs)||[];
 const lastRun=containing.filter(r=>Date.parse(r.at)<=selectedEndMs);
 const lastCaptured=lastRun.at(-1);if(!lastCaptured)continue;
 const start=asSGT(startMs).replace(' ','T'),end=asSGT(selectedEndMs).replace(' ','T');
 const score=root.DeepPetUnifiedHrvMath.score(chosen.m.rmssd,chosen.m.sdnn,1,chosen.m.regularity,chosen.m.bpm);
 const selected={minutes:chosen.n,start,end,channel:chosen.channel,rmssdMs:+chosen.m.rmssd.toFixed(1),sdnnMs:+chosen.m.sdnn.toFixed(1),nvgr:chosen.m.bpm,regularity:chosen.m.regularity,engineeringScore:score,unadjustedResearchIndex:score,signalConfidence:chosen.m.coverage,sourceVerified:verifiedChannel(chosen.channel),technicalPass:!chosen.fragmentedEstimate,failedChecks:isFormal?[]:['sensor_channel_identity_not_vendor_verified','independent_ECG_or_vendor_IBI_validation_pending']};
 for(const duration of policy.tiers){
  if(lastRun.length<duration*60)continue;
  const allChecks=['channelA','channelB'].map(c=>researchIntervalEstimate(lastRun,duration,c));
  const checks=allChecks.filter(x=>Number.isFinite(x.rmssdMs)&&Number.isFinite(x.sdnnMs)&&Number.isFinite(x.engineeringScore));
  allChannelDiagnostics[duration]=allChecks.map(x=>({channel:x.channel,detectedPeaks:x.detectedPeaks,expectedBeats:x.expectedBeats,invalidIntervals:x.invalidIntervals,beatCountRatio:x.beatCountRatio,pairCoverage:x.pairCoverage,wavePresence:x.windowQuality.waveformSecondsFraction,technicalPass:x.technicalPass,channelVerified:x.sourceVerified,failedChecks:x.failedChecks,reviewFlags:x.reviewFlags}));
  if(checks.length)options[duration]=checks.sort((a,b)=>Number(b.qualified)-Number(a.qualified)||Number(b.technicalPass)-Number(a.technicalPass)||b.signalConfidence-a.signalConfidence)[0];
 }
 const diagnostics=Object.fromEntries(Object.entries(options).map(([n,x])=>[n,{...x.windowQuality,beatCountRatio:x.beatCountRatio,pairCoverage:x.pairCoverage,signalConfidence:x.signalConfidence,detectorPlausible:x.detectorPlausible}]));
 const latestRaw=rawRuns.flatMap(r=>r.filter(x=>Date.parse(x.at)<=cutoff&&Date.parse(x.at)>=minTime)).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at))[0];
 const actualRawEndMs=Date.parse(latestRaw?.at||lastCaptured.at),selectedEnd=selectedEndMs;
 const tailGapSeconds=Math.max(0,(actualRawEndMs-selectedEnd)/1000),lastDayRecordMs=observedAnchorByDay[day]?.ms??actualRawEndMs,gap=Math.max(0,(lastDayRecordMs-selectedEnd)/60000);
 const fragmentEstimate=fragmented?Object.freeze({minutes:fragmented.n,validMinutes:fragmented.validMinutes,excludedMinutes:fragmented.excludedMinutes,start:asSGT(fragmented.selected[0]).replace(' ','T'),end:asSGT(fragmented.selected.at(-1)).replace(' ','T'),channel:fragmented.channel,polarity:fragmented.polarity,rmssdMs:fragmented.m.rmssd,sdnnMs:fragmented.m.sdnn,regularity:fragmented.m.regularity,nvgr:fragmented.m.bpm,score:root.DeepPetUnifiedHrvMath.score(fragmented.m.rmssd,fragmented.m.sdnn,1,fragmented.m.regularity,fragmented.m.bpm),retainedIntervals:fragmented.m.beatCount,adjacentPairs:fragmented.m.pairCount,qualified:false,segmented:true}):null;
 const item=Object.freeze({date:day,measurementDate:lastCaptured.localDate,fragmentEstimate,fragmentedEstimate:!!chosen.fragmentedEstimate,minutes:selected.minutes,end:selected.end,start:selected.start,channel:selected.channel,rawAvailableMinutes:+(lastRun.length/60).toFixed(1),rmssdMs:selected.rmssdMs,sdnnMs:selected.sdnnMs,nvgr:selected.nvgr,regularity:selected.regularity,
  researchScore:selected.engineeringScore,referenceIndex:selected.engineeringScore,signalConfidence:selected.signalConfidence,rawPhysiologicalIndex:selected.unadjustedResearchIndex,
  signalQuality:isFormal?'qualified':'estimated-from-BCG',source:'actual-B0-segmented-waveform',qualified:isFormal,formalSearchExhausted:!formal,formalGate:confirmed.length?'quality':'channel-validation-pending',validMinutes:chosen.validMinutes,excludedMinutes:chosen.excludedMinutes,segmented:chosen.segmented,retainedIntervals:chosen.m.beatCount,adjacentPairs:chosen.m.pairCount,polarity:chosen.polarity,
  scoreType:isFormal?'beat-derived-engineering-index':'unverified-prototype-index',lastObservedAt:asSGT(lastDayRecordMs),lastWaveformAt:asSGT(selectedEnd),lastRawPacketAt:asSGT(actualRawEndMs),trailingRawGapSeconds:+tailGapSeconds.toFixed(2),primaryWindowMinutes:selected.minutes,trendCandidateMinutes:null,
  channelVerified:selected.sourceVerified===true,technicalPass:selected.technicalPass===true,missingRecentWaveform:gap>5,windowEndOffsetSeconds:+tailGapSeconds.toFixed(2),gapFromLastObservationMinutes:+gap.toFixed(1),representativeOfLastObservedMoment:gap<=5,isLiveNow:isLiveAt(selectedEnd),
  candidateWindows:Object.freeze(Object.fromEntries(Object.entries(options).map(([n,v])=>[n,Object.freeze({minutes:v.minutes,rmssdMs:v.rmssdMs,sdnnMs:v.sdnnMs,researchScore:v.engineeringScore,signalConfidence:v.signalConfidence,beatCountRatio:v.beatCountRatio,pairCoverage:v.pairCoverage,wavePresence:v.windowQuality?.waveformSecondsFraction,detectorPlausible:v.detectorPlausible,windowQuality:v.windowQuality,start:v.start,end:v.end,failedChecks:v.failedChecks,reviewFlags:v.reviewFlags,technicalPass:v.technicalPass,sourceVerified:v.sourceVerified})]))),
  windowSelectionPolicy:'Newest captured endpoint first; 60,30,10,5 minutes then earlier endpoint until data exhausted. No unverified research estimate enters formal health scores.',windowDiagnostics:diagnostics,allChannelDiagnostics,
  independentFiveMinuteDiagnostics:Object.fromEntries(['channelA','channelB'].map(c=>[c,prominenceDiagnostic(lastRun.slice(-300),c)])),longWaveformAvailableMinutes:Math.min(60,Math.floor(lastRun.length/60)),failedChecks:selected.failedChecks,disclaimer:isFormal?'Engineering output from confirmed beat channel; not a diagnosis.':'Research-only engineering output, not verified canine NN/IBI or a health diagnosis.'});
 hrvMinFiveResearchByDay[day]=item;lastConnectedByDay[day]={...item,lastConnectedEpochMs:selectedEnd};
}
// Retire the previous hard-coded 10-minute/91-point candidate. It was not
// produced by a validated 30m pipeline and must not be shown as a current
// veterinary HRV score. The record remains accessible as historical QA only.
root.DeepPetMiloHrvResearch=Object.freeze({byDate:{},
 legacyRejected:{'2026-11-22':{rmssdMs:148.0,sdnnIndexMs:109.7,minutes:10,
  reason:'Legacy 5m candidates failed qualified NN checks; 91/100 was an arbitrary saturating index, not a verified canine HRV health score.'}},
 version:'2026-11-23-long-window-QC-retire-unverified-91'});
root.DeepPetMiloWaveQC=Object.freeze({version:'10.150-same-day-endpoint-first',segmentLedger:Object.freeze(segmentedLedger),totalFrames:records.length,
 testedWindows:attempts.length,qualifiedWindows:attempts.filter(x=>x.qualified).length,
 rawCoverageByDay:Object.freeze(rawCoverageByDay),dayLastObservations:dayAnchorPublic,minimumFiveMinuteResearch:Object.freeze(hrvMinFiveResearchByDay),lastConnectedHRV:Object.freeze(lastConnectedByDay),longWindowAttempts:Object.freeze(longWindowAttempts),
 attempts:Object.freeze(attempts),coverageByDay:Object.freeze(coverageByDay),summary:Object.freeze(summary),
 policy:'Latest usable beat endpoint, 60/30/10/5 priority, then earlier endpoints on the same local day. Mask excluded intervals, retain accepted interval ledger. Unverified owner numerical estimates retain provenance for research display only; excluded from the owner composite scores.'});

} // Immutable-source QC fast path; otherwise execute the original calculation.

// Render research results on the SAME existing LAFA HRV card.  Neither
// other pets nor daily/period health score pipelines receive these estimates.
(function installMinimumFiveResearchDisplay(){
 let observer=null,busy=false;
 function apply(){
  if(typeof state==='undefined'||state.tab!=='deep'||state.dog!==0||state.deepType!==0||Number(state.range)!==1||state.emptyPreview)return;
  const day=state.deepSelectedDate;
  const est=root.DeepPetMiloWaveQC?.lastConnectedHRV?.[day];
  const card=document.querySelector('.app-main .dp-owner-deep [data-dp903-metric="hrv"]');
  if(!card||!est)return;
  const selected=root.DeepPetMiloAdaptiveScores?.dayScores(day)?.hrv;if(selected&&Number.isFinite(selected.score))return;
  const displayScore=selected?.researchIndex??est.researchScore;
  const en=state.lang==='en',simple=state.lang==='zh',ko=state.lang==='ko';const L=(tw,zh,english,korean)=>en?english:ko?korean:simple?zh:tw;
  const when=String(est.lastWaveformAt).replace(' ',' ').slice(11,16);
  const label=en?`${est.minutes} min · through ${when}`:`${est.minutes}${simple?'分钟':'分鐘'}·截至${when}`;
  const left=card.querySelector('.dp903-metric-left');
  if(!left)return;
  // Preserve the native DeepPet score ring: one numeric score, with only a
  // short duration caption.  Never replace the score circle with a dashed
  // N/A placeholder, a score category, or an approximate-number string.
  const title=left.querySelector('h3');if(title&&title.textContent!=='HRV')title.textContent='HRV';
  const desc=en?`RMSSD ${est.rmssdMs} ms · SDNN ${est.sdnnMs} ms`:
   `RMSSD ${est.rmssdMs} ms · SDNN ${est.sdnnMs} ms`;
  const p=left.querySelector(':scope > p:not(.dp-observation-note):not(.dp145-hrv-evidence)');if(p&&p.textContent!==desc)p.textContent=desc;
  const col=card.querySelector('.dp903-score-col');
  if(col){
   const ring=col.querySelector('.dp-status-score');if(ring)ring.remove();
   let missing=col.querySelector('.dp903-no-score');if(!missing){missing=document.createElement('div');missing.className='dp903-no-score';col.prepend(missing);}const pendingText=L(`約 ${displayScore}`,`约 ${displayScore}`,`≈ ${displayScore}`,`약 ${displayScore}`);if(missing.textContent!==pendingText)missing.textContent=pendingText;
   let research=col.querySelector('[data-lafa-hrv-research-score]');if(!research){research=document.createElement('span');research.dataset.lafaHrvResearchScore='';research.className='dp-observation-grade';col.appendChild(research);}
   const line=L(`估算 · 有效${est.validMinutes.toFixed(1)}分鐘`,`估算 · 有效${est.validMinutes.toFixed(1)}分钟`,`Estimate · ${est.validMinutes.toFixed(1)} min retained`,`추정 · 유효 ${est.validMinutes.toFixed(1)}분`);if(research.textContent!==line)research.textContent=line;
  }
  const stableCard=document.querySelector('.app-main .dp-owner-deep [data-dp903-metric="stable"]');
  if(stableCard&&Number.isFinite(est.regularity)&&!est.qualified){
   const sc=stableCard.querySelector('.dp903-score-col'),sp=stableCard.querySelector('.dp903-metric-left > p');
   if(sc){let value=sc.querySelector('.dp903-no-score');if(!value){value=document.createElement('span');value.className='dp903-no-score';sc.prepend(value);}const t=L(`約 ${est.regularity}`,`约 ${est.regularity}`,`≈ ${est.regularity}`,`약 ${est.regularity}`);if(value.textContent!==t)value.textContent=t;let label=sc.querySelector('[data-estimated-rhythm]');if(!label){label=document.createElement('span');label.dataset.estimatedRhythm='';label.className='dp-observation-grade';sc.append(label);}const text=L('估算','估算','Estimate','추정');if(label.textContent!==text)label.textContent=text;}
   if(sp){const text=L('由保留波形估算節奏；漏搏或多抓峰值可能影響結果。','由保留波形估算节奏；漏搏或多抓峰值可能影响结果。','Waveform-derived rhythm estimate; missed or extra peaks may affect accuracy.','파형으로 추정한 심박 패턴이며 박동 누락이나 중복 검출의 영향을 받을 수 있습니다.');if(sp.textContent!==text)sp.textContent=text;}
  }
  if(est.fragmentEstimate){const f=est.fragmentEstimate;let fragment=left.querySelector('[data-hrv-fragment-estimate]');if(!fragment){fragment=document.createElement('p');fragment.dataset.hrvFragmentEstimate='';fragment.className='dp-observation-note';left.append(fragment);}const text=ko?`분할 추정: 관찰 ${f.minutes}분, 유효 ${f.validMinutes.toFixed(2)}분; RMSSD ${f.rmssdMs.toFixed(1)} ms, SDNN ${f.sdnnMs.toFixed(1)} ms; 누락 구간 제외.`:en?`Additional fragmented estimate: ${f.minutes} min observation; ${f.validMinutes.toFixed(2)} min retained; RMSSD ${f.rmssdMs.toFixed(1)} ms, SDNN ${f.sdnnMs.toFixed(1)} ms; gaps excluded.`:`分段累計估算：${f.minutes} 分鐘觀測窗，保留 ${f.validMinutes.toFixed(2)} 分鐘；RMSSD ${f.rmssdMs.toFixed(1)} ms、SDNN ${f.sdnnMs.toFixed(1)} ms；已排除缺口。`;if(fragment.textContent!==text)fragment.textContent=text;}
  // The HRV duration is specifically the last uninterrupted 5/10/30/60m
  // interval, not the entire day-long A2 history or B0 transport session.
  const provenance=left.querySelector('.dp-observation-note');
  if(provenance&&est.start&&est.end){
   const startAt=String(est.start).slice(0,16),endAt=String(est.end).slice(0,16);
   const label=ko?`측정 구간 ${startAt}–${endAt} (${est.minutes}분)`:en?`Measured ${startAt}–${endAt} (${est.minutes} min)`:
    `量測時段 ${startAt}–${endAt}（${est.minutes}${simple?'分钟':'分鐘'}）`;
   if(provenance.textContent!==label)provenance.textContent=label;
  }
  // Keep the actual capture time available without making an old reading
  // appear live or changing the meaning of a real-device measurement.
  let lastNote=left.querySelector('[data-dp145-hrv-evidence]');if(!lastNote){lastNote=document.createElement('p');lastNote.dataset.dp145HrvEvidence='';lastNote.className='dp145-hrv-evidence';left.appendChild(lastNote);}
  const dateEnd=String(est.lastObservedAt||'').slice(0,16),lastRaw=String(est.lastRawPacketAt||'').slice(11,19),count=est.allChannelDiagnostics?.[est.minutes]?.find(x=>x.channel===est.channel);
  const vm=Number(est.validMinutes||0).toFixed(2),ex=Number(est.excludedMinutes||0).toFixed(2),cov=(100*(est.signalConfidence||0)).toFixed(1);
  const msg=ko?`마지막 원시 파형 ${lastRaw}, 요약 ${dateEnd}. 후보 NN ${vm}분, 제외 ${ex}분, 범위 ${cov}%. ${est.qualified?"검증된 채널":"박동 검출이 추정 정확도에 영향을 줄 수 있습니다"}.`:en?`Last raw ${lastRaw}; summary ${dateEnd}. Candidate NN ${vm} min; excluded ${ex} min; coverage ${cov}%. ${est.qualified?'Validated channel':'Waveform estimate: beat identification may affect accuracy'}.`:`最後原始波形 ${lastRaw}；摘要截至 ${dateEnd}。有效候選間隔 ${vm} 分鐘；排除 ${ex} 分鐘；覆蓋 ${cov}%。${est.qualified?'通道已驗證':'波形估算：逐搏辨識可能影響準確度'}。`;
  if(lastNote.textContent!==msg)lastNote.textContent=msg;
  const foot=card.querySelector('.dp913-provenance-note');
  if(foot){const last=String(est.lastObservedAt||'').slice(11,16);const t=ko?`마지막 연속 파형 ${when}, 생리 요약 ${last}. ${est.missingRecentWaveform?"하루 말의 연속 파형 없음. ":""}박동 검출이 추정 정확도에 영향을 줄 수 있습니다.`:en?`Last waveform ${when}; trend through ${last}. ${est.missingRecentWaveform?'No end-of-day beat waveform. ':''}Beat detection may affect estimate accuracy.`:`最後連續波形 ${when}；生理摘要截至 ${last}。${est.missingRecentWaveform?'缺少日末逐搏波形；':''}心搏辨識可能影響估算準確度。`;if(foot.textContent!==t)foot.textContent=t;}
 }
 function schedule(){if(busy)return;busy=true;Promise.resolve().then(()=>{busy=false;try{apply()}catch(e){console.warn('HRV last-connected card',e)}})}
 function start(){if(!document.body)return;observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true});schedule()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

})(window);
