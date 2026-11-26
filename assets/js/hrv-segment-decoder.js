/* V10.147: conservative local waveform quality inspection. Unknown B0 channel
   identity remains provisional; no vendor-rate fitting or invented beats. */
(function(root){'use strict';
const median=a=>{if(!a.length)return null;const b=a.slice().sort((x,y)=>x-y),i=b.length>>1;return b.length%2?b[i]:(b[i-1]+b[i])/2;};
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function detect(samples,fs,polarity,method){const a=Array.from(samples),v=[];let base=a[0]||0;for(const x of a){base+=.06*(x-base);v.push(polarity*(x-base));}const sm=v.map((x,i)=>(v[Math.max(0,i-1)]+2*x+v[Math.min(v.length-1,i+1)])/4),center=median(sm),mad=median(sm.map(x=>Math.abs(x-center)))||0;const radius=Math.max(2,Math.round(fs*.3)),threshold=Math.max(2,mad*(method===0?1.3:1.0)),refractory=Math.max(2,Math.floor(fs*.24)),peaks=[];
for(let i=radius;i<sm.length-radius;i++){if(sm[i]<sm[i-1]||sm[i]<=sm[i+1])continue;const prom=sm[i]-Math.max(Math.min(...sm.slice(i-radius,i)),Math.min(...sm.slice(i+1,i+radius+1)));if(method===0?prom<threshold:sm[i]-center<threshold||prom<threshold*.7)continue;if(peaks.length&&i-peaks.at(-1)<refractory){if(sm[i]>sm[peaks.at(-1)])peaks[peaks.length-1]=i;continue;}peaks.push(i);}
return peaks.map(i=>{const den=sm[i-1]-2*sm[i]+sm[i+1],f=den?Math.max(-.5,Math.min(.5,.5*(sm[i-1]-sm[i+1])/den)):0;return (i+f)*1000/fs;});}
// Independent shape-based detector: remove local baseline, locate prominent peaks,
// then use repeating pulse morphology to suppress secondary/noisy peaks.
// No artificial beats, no reference-rate pacing, no selection by health score.
function shapeDetect(samples,fs,polarity){
 const a=Array.from(samples),r=Math.max(2,Math.round(fs*.5)),v=a.map((x,i)=>{const lo=Math.max(0,i-r),hi=Math.min(a.length,i+r+1);return polarity*(x-median(a.slice(lo,hi)));});
 const sm=v.map((x,i)=>(v[Math.max(0,i-1)]+2*x+v[Math.min(v.length-1,i+1)])/4),center=median(sm),mad=median(sm.map(x=>Math.abs(x-center)))||0;
 const cand=[],w=Math.max(2,Math.round(fs*.2)),edge=w+1;
 for(let i=edge;i<sm.length-edge;i++){if(sm[i]<=sm[i+1]||sm[i]<sm[i-1])continue;const prom=sm[i]-Math.max(Math.min(...sm.slice(i-w,i)),Math.min(...sm.slice(i+1,i+w+1)));if(prom<Math.max(1.5,mad*.65))continue;
  const z=sm.slice(i-w,i+w+1),m=mean(z),norm=Math.sqrt(z.reduce((q,x)=>q+(x-m)**2,0));if(norm<1e-8)continue;cand.push({i,prom,shape:z.map(x=>(x-m)/norm)});}
 if(cand.length<5)return [];
 const dot=(a,b)=>a.reduce((q,x,i)=>q+x*b[i],0),strong=cand.slice().sort((a,b)=>b.prom-a.prom).slice(0,Math.min(40,cand.length));
 const template=strong.reduce((best,c)=>{const support=strong.filter(t=>dot(c.shape,t.shape)>=.83).length;return !best||support>best.support?{shape:c.shape,support}:best;},null);
 if(template.support<Math.max(3,strong.length*.20))return [];
 const p=[];for(const c of cand){c.corr=dot(c.shape,template.shape);if(c.corr<.78)continue;const prev=p.at(-1);if(prev&&c.i-prev.i<Math.max(2,Math.round(fs*.28))){if(c.prom*c.corr>prev.prom*prev.corr)p[p.length-1]=c;continue;}p.push(c);}
 return p.map(({i})=>{const den=sm[i-1]-2*sm[i]+sm[i+1],f=den?Math.max(-.5,Math.min(.5,.5*(sm[i-1]-sm[i+1])/den)):0;return (i+f)*1000/fs;});
}
function agreement(a,b){let i=0,j=0,n=0;while(i<a.length&&j<b.length){const d=a[i]-b[j];if(Math.abs(d)<=100){n++;i++;j++;}else if(d<0)i++;else j++;}return n/Math.max(a.length,b.length,1);}
function decodeBlock(rows,channel,polarity,fs=20){
// Each packet contributes exactly one nominal second. Equal total sample count
// is insufficient: 19 + 21 samples would silently shift the time axis.
if(!Array.isArray(rows)||rows.length<2||!Number.isInteger(fs)||fs<1||fs>1000)return null;
let first=null,prev=null;for(const r of rows){const a=r?.[channel],t=Date.parse(r?.at);if(!Array.isArray(a)||a.length!==fs||!a.every(Number.isFinite)||!Number.isFinite(t))return null;if(prev!==null&&(t-prev<200||t-prev>1650))return null;if(first===null)first=t;prev=t;}
// Packet arrival times are only a transport-clock consistency check, not individual beat timestamps.
if(Math.abs(prev-first-(rows.length-1)*1000)>1000)return null;
const samples=rows.flatMap(r=>r[channel]),present=rows.map(r=>{const a=r[channel];const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)))>=3;});if(samples.length!==rows.length*fs||!samples.every(Number.isFinite))return null;
const original=detect(samples,fs,polarity,0),secondary=detect(samples,fs,polarity,1),shape=shapeDetect(samples,fs,polarity),v=rows.filter(r=>r.hr>0&&Number.isFinite(r.hr)).map(r=>r.hr),ref=median(v),presence=present.filter(Boolean).length/rows.length;
 const evaluate=(a,b,method)=>{const agree=agreement(a,b),nn=a.slice(1).map((x,i)=>x-a[i]),good=nn.filter(x=>x>=220&&x<=2200),bpm=good.length?60000/mean(good):null,rateError=ref==null||bpm==null?null:Math.abs(bpm-ref)/ref;return {a,agree,nn,good,bpm,rateError,method};};
 const legacy=evaluate(original,secondary,'prominence'),morph=evaluate(shape,original,'morphology');
 // A morphology alternative may replace the original only with independent peak
 // agreement and improved rate concordance; rate never generates a timestamp.
 const better=morph.a.length>=8&&morph.agree>=.75&&morph.good.length/Math.max(1,morph.nn.length)>=.9&&(ref==null?morph.agree>legacy.agree+.05:morph.rateError!=null&&legacy.rateError!=null&&morph.rateError+.025<legacy.rateError);
 const chosen=better?morph:legacy,{a,agree,nn,good,bpm,method}=chosen,rateOK=ref==null||bpm!=null&&Math.abs(bpm-ref)<=Math.max(12,.20*ref);
// Vendor HR is only corroboration where present; missing vendor summary alone is not a rejection.
const plausible=a.length>=8&&agree>=(method==='morphology'?.75:.80)&&good.length/Math.max(nn.length,1)>=.9&&presence>=.80&&rateOK;
const t=a.map(x=>Date.parse(rows[0].at)+x),q=a.map((x,i)=>{const s=Math.floor(x/1000),lo=Math.floor((i?a[i-1]:x)/1000);return plausible&&present.slice(lo,s+1).every(Boolean)&&present[s]===true;});return {t,q,agree,presence,rateOK,plausible,ref,bpm,method,legacyRateError:legacy.rateError,morphologyRateError:morph.rateError,channel,polarity,start:rows[0].at,end:rows.at(-1).at};}
function inspect(runs,math,policy){const streams=[];for(const channel of ['channelA','channelB'])for(const polarity of [1,-1]){const times=[],quality=[],blocks=[];for(const run of runs){for(let i=0;i<run.length;i+=30){const rows=run.slice(i,i+30);if(rows.length<10)continue;const b=decodeBlock(rows,channel,polarity);if(!b)continue;blocks.push({...b,t:undefined,q:undefined});for(let j=0;j<b.t.length;j++){const t=b.t[j];if(times.length&&t<=times.at(-1))continue;times.push(t);quality.push(b.q[j]&&j>0);}}}streams.push({channel,polarity,times,quality,blocks});}return {streams,latest(cutoff,opts={}){const candidates=[];for(const s of streams){if(opts.channels&&!opts.channels.includes(s.channel))continue;const i=s.times.findIndex(t=>t>cutoff),end=i<0?s.times.length:i;if(!end)continue;const r=(opts.fragmentedEstimate?policy.fragmentedWindow:policy.beatWindow)(s.times.slice(0,end),s.quality.slice(0,end),math,opts);if(r)candidates.push({...r,channel:s.channel,polarity:s.polarity});}return candidates.sort((a,b)=>b.selected.at(-1)-a.selected.at(-1)||b.n-a.n||b.m.coverage-a.m.coverage)[0]||null;}};}
root.DeepPetHrvSegmentDecoder=Object.freeze({detect,shapeDetect,decodeBlock,inspect,agreement});
})(typeof window==='undefined'?globalThis:window);
