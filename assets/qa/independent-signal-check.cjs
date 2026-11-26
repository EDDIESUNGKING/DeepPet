const assert=require('assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');global.window=globalThis;
const J=fs.readFileSync(path.join(__dirname,'../js/verified.js'),'utf8'),i=J.indexOf('window.DeepPetUnifiedHrvMath=Object.freeze({'),j=J.indexOf('\nconst dpBeatDemoHrvCache',i);vm.runInThisContext(J.slice(i,j));const H=DeepPetUnifiedHrvMath;
const avg=a=>a.reduce((s,v)=>s+v,0)/a.length;
function oracle(t,mask){const intervals=t.slice(1).map((v,i)=>v-t[i]),ok=intervals.map((v,i)=>v>=220&&v<=2200&&(!mask||mask[i]===true)),n=intervals.filter((v,i)=>ok[i]),mu=avg(n),dif=intervals.slice(1).flatMap((v,i)=>ok[i]&&ok[i+1]?[v-intervals[i]]:[]);return {rmssd:Math.sqrt(avg(dif.map(v=>v*v))),sdnn:Math.sqrt(n.reduce((s,v)=>s+(v-mu)**2,0)/(n.length-1))};}
const timestamps=nn=>nn.reduce((a,x)=>(a.push(a.at(-1)+x),a),[0]);const near=(a,b)=>assert(Math.abs(a-b)<1e-9);
let n=0;const check=(s,f)=>{f();n++;console.log('PASS',s)};
check('constant 800ms IBI exact zero RMSSD SDNN',()=>{const m=H.metrics(timestamps(Array(400).fill(800)));near(m.rmssd,0);near(m.sdnn,0)});
check('alternating 700/900ms exact 200ms RMSSD',()=>{const t=timestamps(Array.from({length:400},(_,i)=>i%2?900:700));const m=H.metrics(t),e=oracle(t);near(m.rmssd,200);near(m.sdnn,e.sdnn)});
check('missing intervals cannot bridge successive difference',()=>{const t=timestamps(Array.from({length:400},(_,i)=>i%3?810:710)),mask=Array.from({length:400},(_,i)=>i%31!==0);const m=H.metrics(t,{mask}),e=oracle(t,mask);near(m.rmssd,e.rmssd);near(m.sdnn,e.sdnn)});
check('duplicate or backward times rejected',()=>{const t=timestamps(Array(400).fill(800));t[10]=t[9];assert.equal(H.metrics(t),null);t[10]=t[9]-20;assert.equal(H.metrics(t),null)});
const freq=[20,50,100,255],result=[];for(const hz of freq){const trueTimes=timestamps(Array(400).fill(803)),q=trueTimes.map(t=>Math.round(t*hz/1000)*1000/hz),m=H.metrics(q),e=oracle(q);near(m.rmssd,e.rmssd);near(m.sdnn,e.sdnn);result.push({samplingHz:hz,gridMs:1000/hz,constantTrueIBIms:803,RMSSDfromQuantizedPeaks:m.rmssd,SDNNfromQuantizedPeaks:m.sdnn});n++;}
console.log(JSON.stringify({checks:n,quantizationExample:result,note:'Ideal constant IBI with nearest-grid quantization. Illustrative only, not actual device error or clinical validation; interpolated peaks may differ.'},null,2));
