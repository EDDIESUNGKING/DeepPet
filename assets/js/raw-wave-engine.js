/* 20 Hz lossless sparse sample representation. Generation and measurement are separate.
   Sparse nonzero samples on zero baseline; sample indices and amplitudes are the raw data.
   Prototype synthetic pulse morphology, not validation of the vendor BCG detector. */
(function(root){'use strict';
const FS=20, DT=50, DAY=86400000, clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function random(seed){let x=seed|0||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
function pulse(samples,t,amp){const k=Math.round(t/DT);if(k<1||k>=DAY/DT-1)return;for(let j=-1;j<=1;j++){const x=k+j,delta=(x*DT-t)/100;samples.push(x,amp*(1-delta*delta));}}
// The only information passed to the decoder is sampled amplitude and sample index.
function peaks(samples,quality=null){const out=[];for(let i=0;i+5<samples.length;i+=2){const k=samples[i+2],l=samples[i+1],m=samples[i+3],r=samples[i+5];if(!Number.isInteger(k)||k<1||k>=DAY/DT-1||![l,m,r].every(Number.isFinite)||samples[i]!==k-1||samples[i+4]!==k+1||m<.4||m<l||m<r)continue;const den=l-2*m+r;if(den>=-1e-8)continue;const offset=clamp(.5*(l-r)/den,-.5,.5);const t=(k+offset)*DT;if(out.length&&t<=out.at(-1))continue;out.push(t);if(quality)quality.push(m-.25*(l-r)*offset>=.85);i+=4;}return out;}
function measure(raw){if(!raw||raw.fs!==FS||!Array.isArray(raw.heart)||!Array.isArray(raw.breath)||!Array.isArray(raw.motion))return null;const beatQuality=[];const bt=peaks(raw.heart,beatQuality),rt=peaks(raw.breath),n=1440;
 // Accepted adjacent intervals only. A missing span never becomes a slow beat.
 const bins=(times,quality,min,max)=>{const count=new Float64Array(n),duration=new Float64Array(n),segments=[],intervalMask=[];
 for(let k=1;k<times.length;k++){const dt=times[k]-times[k-1];intervalMask[k-1]=false;if(dt<min||dt>max||quality&&(!quality[k]||!quality[k-1]))continue;
 // A possible isolated missing peak requires a following valid interval.
 // Track that dependency rather than backdating a retrospective confirmation.
 const prev=k>1?times[k-1]-times[k-2]:null,next=k+1<times.length?times[k+1]-times[k]:null;
 const prevGood=Number.isFinite(prev)&&prev>=min&&prev<=max&&(!quality||quality[k-2]);
 const needsNext=prevGood&&dt>Math.max(prev*1.8,prev+2*DT);
 const nextGood=Number.isFinite(next)&&next>=min&&next<=max&&(!quality||quality[k+1]);
 if(needsNext&&(!nextGood||next<dt*.65))continue;
 intervalMask[k-1]=true;const lo=times[k-1],hi=times[k];const available=(needsNext?times[k+1]:hi)+1.5*DT;segments.push([lo,hi,dt,available]);for(let i=Math.max(0,Math.floor(lo/60000));i<=Math.floor(hi/60000)&&i<n;i++){const overlap=Math.max(0,Math.min(hi,(i+1)*60000)-Math.max(lo,i*60000));duration[i]+=overlap;count[i]+=overlap/dt;}}
 return {rates:Array.from(duration,(s,i)=>s>=30000&&count[i]>0?+(60000*count[i]/s).toFixed(3):null),segments,intervalMask};};
 const hb=bins(bt,beatQuality,195,3000),rb=bins(rt,null,495,20000),validSeconds=Array(n).fill(0);
 // 5-second interval-supported rate estimates. Integrate only the true common
 // heart/breath support and valid motion; retain the exact supported seconds.
 // Cycle rates are retrospective estimates, not instantaneous samples or ECG.
 const motionSec=new Float32Array(86400);motionSec.fill(NaN);
 // RLE minutes use four repeating samples; dense minutes contain all 1200 samples.
 // Dense motion is decoded in actual one-second blocks, not spread across a minute.
 for(let m=0;m<n;m++){const block=raw.motion[m];if(!block||![4,1200].includes(block.length))continue;
 for(let k=0;k<60;k++){let sum=0,ok=true;for(let j=0;j<20;j++){const v=block.length===4?block[j%4]:block[k*20+j];if(!Number.isFinite(v)){ok=false;break;}sum+=Math.abs(v);}const a=sum/10;if(ok&&a<119)motionSec[m*60+k]=a;}}
 const activity=Array.from({length:n},(_,i)=>{let total=0,count=0;for(let k=i*60;k<(i+1)*60;k++)if(Number.isFinite(motionSec[k])){total+=motionSec[k];count++;}return count?+(total/count).toFixed(3):null;});
 const size=17280,hrSum=new Float64Array(86400),rrSum=new Float64Array(86400),secSupport=new Float64Array(86400),available=new Float32Array(86400);
 let i=0,j=0;while(i<hb.segments.length&&j<rb.segments.length){const h=hb.segments[i],r=rb.segments[j],lo=Math.max(h[0],r[0]),hi=Math.min(h[1],r[1]);
 if(hi>lo){for(let k=Math.floor(lo/1000);k<Math.ceil(hi/1000)&&k<86400;k++){if(!Number.isFinite(motionSec[k]))continue;const ms=Math.max(0,Math.min(hi,(k+1)*1000)-Math.max(lo,k*1000));if(!ms)continue;secSupport[k]+=ms;available[k]=Math.max(available[k],Math.max(h[3],r[3],(k+1)*1000)/1000);hrSum[k]+=ms*60000/h[2];rrSum[k]+=ms*60000/r[2];}}
 if(h[1]<=r[1])i++;else j++;}
 const wh=new Float32Array(size),wr=new Float32Array(size),wm=new Float32Array(size),mask=new Uint8Array(size);wh.fill(NaN);wr.fill(NaN);wm.fill(NaN);
 const minuteH=new Float64Array(n),minuteR=new Float64Array(n);
 for(let w=0;w<size;w++){let bits=0,count=0,motionSum=0,hTotal=0,rTotal=0;for(let k=0;k<5;k++){const at=w*5+k;if(secSupport[at]>=999.5){bits|=1<<k;count++;motionSum+=motionSec[at];hTotal+=hrSum[at]/secSupport[at];rTotal+=rrSum[at]/secSupport[at];}}const m=Math.floor(w/12);if(!count)continue;wh[w]=hTotal/count;wr[w]=rTotal/count;wm[w]=motionSum/count;mask[w]=bits;validSeconds[m]+=count;minuteH[m]+=wh[w]*count;minuteR[m]+=wr[w]*count;}
 // Display is still minute-resolution, but scoring and alerts use rateWindows.
 for(let m=0;m<n;m++){hb.rates[m]=validSeconds[m]?+(minuteH[m]/validSeconds[m]).toFixed(3):null;rb.rates[m]=validSeconds[m]?+(minuteR[m]/validSeconds[m]).toFixed(3):null;}
 const rateWindows={seconds:5,heart:wh,breath:wr,motion:wm,mask};
 const sh=new Float32Array(86400),sr=new Float32Array(86400),sm=new Float32Array(86400);sh.fill(NaN);sr.fill(NaN);sm.fill(NaN);for(let k=0;k<86400;k++)if(secSupport[k]>=999.5){sh[k]=hrSum[k]/secSupport[k];sr[k]=rrSum[k]/secSupport[k];sm[k]=motionSec[k];}const secondRates={heart:sh,breath:sr,motion:sm,available};
 const hrvQuality=beatQuality.map((q,i)=>q&&Number.isFinite(motionSec[Math.floor(bt[i]/1000)])&&motionSec[Math.floor(bt[i]/1000)]<=25);const hrvWindow=root.DeepPetHrvWindowPolicy.beatWindow(bt,hrvQuality,root.DeepPetUnifiedHrvMath,{intervalMask:hb.intervalMask});if(hrvWindow){const start=hrvWindow.selected[0]-12000,end=hrvWindow.selected.at(-1)+12000,resp=rt.filter(t=>t>=start&&t<=end);hrvWindow.m=root.DeepPetUnifiedHrvMath.metrics(hrvWindow.selected,{mask:hrvWindow.mask,respiratoryPeaksMs:resp});}const tail=bt.filter(t=>t>=DAY-3600000);return {heart:hb.rates,breath:rb.rates,activity,validSeconds,rateWindows,secondRates,beatTimesMs:tail,beatQuality:beatQuality.slice(bt.length-tail.length),hrvWindow,respPeakCount:rt.length,beatCount:bt.length,sampleRate:FS};
}
function generate({heart,breath,activity},seed,profile){const rng=random(seed),raw={fs:FS,heart:[],breath:[],motion:[]};let t=1000,phase=0;const refH=Number(profile.hr)||85,refR=Number(profile.rr)||18;const contactStart=DAY-60000*[5,10,30,60][(seed>>>0)%4];
 while(t<DAY-100){const i=Math.min(1439,Math.floor(t/60000)),h=clamp(heart[i],28,265),r=clamp(breath[i],4,85),m=clamp(activity[i],0,110),load=clamp(Math.max((h-refH)/Math.max(20,.28*refH),(r-refR)/Math.max(5,.35*refR)),0,2),quiet=clamp(1-m/105,0,1);
  // Respiratory sinus modulation is regular; additional unpredictable timing changes
  // are independent waveform characteristics, not a target score.
  const base=60000/h;phase+=2*Math.PI*r/60*base/1000;const rsa=clamp(.016+.095*quiet-.035*load,.005,.12),jitter=.012+.065*load+.015*m/100;
  const rare=rng()<.003+.045*load?(rng()<.5?-1:1)*(.12+.15*rng())*load:0;
  const interval=clamp(base*(1+rsa*Math.sin(phase)+jitter*(2*rng()-1)+rare),205,2140);
  pulse(raw.heart,t,t>=DAY-3600000&&t<contactStart?.55+.12*rng():1+.08*rng());t+=interval;
 }
 t=1000;while(t<DAY-100){const i=Math.min(1439,Math.floor(t/60000));pulse(raw.breath,t,1+.06*rng());t+=60000/clamp(breath[i],4,85)*(1+.025*(2*rng()-1));}
 for(let i=0;i<1440;i++){const a=clamp(activity[i],0,110);raw.motion.push([0,a,0,-a]);}
 return raw;
}
function extractMinute(raw,i,channel){const out=new Float32Array(1200);if(!raw||i<0||i>=1440)return out;if(channel==='motion'){const b=raw.motion[i];if(b)for(let j=0;j<1200;j++)out[j]=b.length===1200?b[j]:b[j%4];return out;}const a=raw[channel]||[],lo=i*1200,hi=lo+1200;let left=0,right=Math.floor(a.length/2);while(left<right){const mid=(left+right)>>>1;if(a[mid*2]<lo)left=mid+1;else right=mid;}for(let j=left*2;j+1<a.length&&a[j]<hi;j+=2)if(Number.isInteger(a[j])&&a[j]>=lo&&Number.isFinite(a[j+1]))out[a[j]-lo]=a[j+1];return out;}
root.DeepPetRawWave143=Object.freeze({generate,measure,peaks,extractMinute,fs:FS});
})(typeof window==='undefined'?globalThis:window);
