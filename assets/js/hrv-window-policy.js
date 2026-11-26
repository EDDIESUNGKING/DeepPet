/* V10.147: newest endpoint first, then 60/30/10/5. Retain qualified intervals, mask gaps; never fabricate beats. */
(function(root){'use strict';
const tiers=Object.freeze([60,30,10,5]);
function select(windows,acceptable=()=>true){return tiers.map(n=>windows?.[n]).find(w=>w&&acceptable(w))||null;}
function search(endpoints,evaluate,acceptable=Boolean){for(const endpoint of endpoints){for(const minutes of tiers){const value=evaluate(endpoint,minutes);if(value&&acceptable(value))return {endpoint,minutes,value};}}return null;}
function* packetEndpoints(runs,cutoff=Infinity){for(const run of runs.slice().sort((a,b)=>Date.parse(b.at(-1).at)-Date.parse(a.at(-1).at))){for(let end=run.length;end>=300;end--){if(Date.parse(run[end-1].at)<=cutoff)yield {run,end,at:run[end-1].at};}}}
function* beatEndpoints(times,quality){for(let i=times.length-1;i>=39;i--){if(quality[i]!==true)continue;yield {index:i,end:times[i]};}}
function lowerBound(a,x){let l=0,r=a.length;while(l<r){const m=(l+r)>>>1;if(a[m]<x)l=m+1;else r=m;}return l;}
// Retain good intervals, never compute a difference across a rejected interval.
// A nominal window may contain small gaps; measured NN coverage is explicit.
function withinDay(times,quality,opts){const a=opts.minTime??-Infinity,b=opts.maxTime??Infinity;const lo=lowerBound(times,a),hi=lowerBound(times,b);return [times.slice(lo,hi),quality.slice(lo,hi)];}
function beatWindow(times,quality,math,opts={}){if(!Array.isArray(times)||!Array.isArray(quality)||times.length!==quality.length||times.some((t,i)=>!Number.isFinite(t)||(i&&t<=times[i-1]))||opts.intervalMask&&opts.intervalMask.length!==times.length-1)return null;if(opts.minTime!=null||opts.maxTime!=null){const lo=lowerBound(times,opts.minTime??-Infinity),hi=lowerBound(times,opts.maxTime??Infinity);if(opts.intervalMask)opts={...opts,intervalMask:opts.intervalMask.slice(lo,Math.max(lo,hi-1))};[times,quality]=withinDay(times,quality,opts);}if(!times.length||quality.length!==times.length||!math||times.some((t,i)=>!Number.isFinite(t)||(i&&t<=times[i-1])))return null;
 const threshold=opts.minCoverage??.90, minFraction=opts.minIntervalFraction??.90;
 const sums=new Float64Array(times.length),counts=new Uint32Array(times.length),mask=[];
 for(let i=1;i<times.length;i++){const dt=times[i]-times[i-1],ok=quality[i]===true&&quality[i-1]===true&&dt>=220&&dt<=2200&&(!opts.intervalMask||opts.intervalMask[i-1]===true);mask.push(ok);sums[i]=sums[i-1]+(ok?dt:0);counts[i]=counts[i-1]+Number(ok);}
 return search(beatEndpoints(times,quality),(e,n)=>{const lo=lowerBound(times,e.end-n*60000),hi=e.index+1;if(hi-lo<40||e.end-times[lo]<n*60000-6000)return null;
 const good=sums[hi-1]-sums[lo],fraction=(counts[hi-1]-counts[lo])/(hi-lo-1);if(good/(n*60000)<threshold||fraction<minFraction)return null;
 const selected=times.slice(lo,hi),selectedMask=mask.slice(lo,hi-1),m=math.metrics(selected,{mask:selectedMask,estimate:opts.estimate===true});
 return m&&m.coverage>=threshold?{selected,mask:selectedMask,m,n,validMinutes:good/60000,excludedMinutes:n-good/60000,nominalMinutes:n,segmented:selectedMask.some(x=>!x)}:null;
 })?.value||null;}
// Provisional fragment analysis: only actual retained intervals count toward
// effective duration. Never label sparse observations a continuous HRV.
function fragmentedWindow(times,quality,math,opts={}){if(!Array.isArray(times)||!Array.isArray(quality)||times.length!==quality.length||times.some((t,i)=>!Number.isFinite(t)||(i&&t<=times[i-1]))||opts.intervalMask&&opts.intervalMask.length!==times.length-1)return null;if(opts.minTime!=null||opts.maxTime!=null){const lo=lowerBound(times,opts.minTime??-Infinity),hi=lowerBound(times,opts.maxTime??Infinity);if(opts.intervalMask)opts={...opts,intervalMask:opts.intervalMask.slice(lo,Math.max(lo,hi-1))};[times,quality]=withinDay(times,quality,opts);}
 if(!times.length||quality.length!==times.length||times.some((t,i)=>!Number.isFinite(t)||(i&&t<=times[i-1])))return null;
 const minMs=(opts.minEffectiveMinutes??5)*60000, sums=new Float64Array(times.length),mask=[];
 for(let i=1;i<times.length;i++){const dt=times[i]-times[i-1],ok=quality[i]===true&&quality[i-1]===true&&dt>=220&&dt<=2200&&(!opts.intervalMask||opts.intervalMask[i-1]===true);mask.push(ok);sums[i]=sums[i-1]+(ok?dt:0);}
 return search(beatEndpoints(times,quality),(e,n)=>{const lo=lowerBound(times,e.end-n*60000),hi=e.index+1,good=sums[hi-1]-sums[lo];if(good<minMs||hi-lo<40)return null;
 const selected=times.slice(lo,hi),selectedMask=mask.slice(lo,hi-1),m=math.metrics(selected,{mask:selectedMask,estimate:true,fragmentedEstimate:true});
 return m?{selected,mask:selectedMask,m,n,validMinutes:good/60000,excludedMinutes:n-good/60000,nominalMinutes:n,segmented:true,fragmentedEstimate:true}:null;
 })?.value||null;
}
function verifiedRuns(times,math,opts={}){const clean=[],q=[];let gap=false;for(const t of times){if(!Number.isFinite(t)){gap=true;continue;}clean.push(t);q.push(!gap);gap=false;}if(clean.some((t,i)=>i&&t<=clean[i-1]))return null;return beatWindow(clean,q,math,opts);}
// Provider-verified, chunk-relative beat timestamps (seconds). Only concatenate
// consecutive chunks from the same already validated pet timeline. Invalid
// chunks or missing beat timestamps split runs. Aggregates are never expanded.
function fromChunks(chunks,starts,math,opts={}){const groups=[];let beats=[],end=null;const flush=()=>{if(beats.length)groups.push(beats);beats=[];end=null;};const scalars=[];
 for(let i=0;i<chunks.length;i++){const x=chunks[i];if(!x){flush();continue;}const a=Number.isFinite(starts[i])?starts[i]*1000:NaN,d=(x.heartWave?.length||0)/(x.fs||20)*1000,ts=x.verifiedBeatTimes;
  const valid=Number.isFinite(a)&&Number.isFinite(d)&&d>0&&ts&&(Array.isArray(ts)||ArrayBuffer.isView(ts))&&Array.from(ts).length>1&&Array.from(ts).every((t,j)=>Number.isFinite(t)&&t>=0&&t*1000<=d+50&&(!j||t>ts[j-1]))&&ts[0]<=2.2&&d-ts[ts.length-1]*1000<=2200;
  if(!valid)flush();else{if(end!==null&&Math.abs(a-end)>250)flush();for(const t of ts){const v=a+t*1000;if(beats.length&&v===beats.at(-1))continue;beats.push(v);}end=a+d;}
  const m=x.sdkMetrics,n=Number(m?.durationSec)/60;if(a>=(opts.minTime??-Infinity)&&a+d<=(opts.maxTime??Infinity)&&m?.verified===true&&String(m.methodId||'').trim()&&m.signalQuality>=.8&&m.signalQuality<=1&&tiers.includes(n)&&Math.abs(d-n*60000)<=500&&Number.isFinite(m.rmssd)&&m.rmssd>=0&&Number.isFinite(m.sdnn)&&m.sdnn>=0&&Number.isFinite(m.nvgr)&&m.nvgr>0){scalars.push({minutes:n,start:a,end:a+d,rmssd:m.rmssd,sdnn:m.sdnn,nvgr:Number.isFinite(m.nvgr)?m.nvgr:null,regularity:null,source:'verified-sdk-aggregate'});}
 }flush();const candidates=scalars.slice();for(let i=groups.length-1;i>=0;i--){const r=verifiedRuns(groups[i],math,opts);if(r)candidates.push({minutes:r.n,start:r.selected[0],end:r.selected.at(-1),rmssd:r.m.rmssd,sdnn:r.m.sdnn,nvgr:r.m.bpm,regularity:r.m.regularity,source:'verified-beat-timestamps',validMinutes:r.validMinutes,excludedMinutes:r.excludedMinutes,segmented:r.segmented,beatEvidence:{times:r.selected.map(t=>t-(opts.minTime??0)),mask:r.mask}});}
 // Reuse valid intervals from separate chunks; boundary beats are marked invalid
 // so a gap can never contribute an NN interval or a successive difference.
 if(groups.length>1){const t=[],q=[];for(const g of groups){for(let j=0;j<g.length;j++){t.push(g[j]);q.push(j!==0||t.length===1);}}if(t.every((v,i)=>!i||v>t[i-1])){const r=beatWindow(t,q,math,opts);if(r)candidates.push({minutes:r.n,start:r.selected[0],end:r.selected.at(-1),rmssd:r.m.rmssd,sdnn:r.m.sdnn,nvgr:r.m.bpm,regularity:r.m.regularity,source:'verified-beat-timestamps',validMinutes:r.validMinutes,excludedMinutes:r.excludedMinutes,segmented:r.segmented,beatEvidence:{times:r.selected.map(t=>t-(opts.minTime??0)),mask:r.mask}});}}
 // Last beat timestamp is the actual endpoint for raw NN; no rounding to a later chunk.
 return candidates.sort((a,b)=>b.end-a.end||b.minutes-a.minutes)[0]||null;
}
function session(sessions,cutoff,parse,minTime=-Infinity){const eligible=sessions.filter(r=>{if(!r||!Number.isFinite(r.durationSec)||!tiers.some(n=>r.durationSec>=n*60&&r.durationSec<=n*60+6))return false;const b=parse(r.end),a=r.start==null?b-r.durationSec*1000:parse(r.start);return Number.isFinite(a)&&Number.isFinite(b)&&a<b&&a>=minTime&&b<=cutoff&&Math.abs((b-a)/1000-r.durationSec)<=6;});const endpoints=[...new Set(eligible.map(r=>parse(r.end)))].sort((a,b)=>b-a);return search(endpoints,(e,n)=>eligible.filter(r=>parse(r.end)===e&&r.durationSec>=n*60&&r.durationSec<=n*60+6).sort((a,b)=>b.durationSec-a.durationSec)[0])?.value||null;}
root.DeepPetHrvWindowPolicy=Object.freeze({tiers,select,search,packetEndpoints,beatWindow,fragmentedWindow,verifiedRuns,fromChunks,session,trailingMs:(end,minutes)=>end-minutes*60000});
})(typeof window==='undefined'?globalThis:window);
