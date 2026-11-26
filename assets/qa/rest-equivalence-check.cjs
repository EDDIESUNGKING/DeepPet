// Compare with V10.192's per-second accumulation by reversing only the batching change.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const dir=require('path').join(__dirname,'../js/');
const original=fs.readFileSync(dir+'unified-deep.js','utf8');
const source=original.replace('forOffsetRuns(offsets,x.minute*60,add);','for(const k of offsets)add(x.minute*60+k,1);').replace('forOffsetRuns(x.validOffsets,x.minute*60,add);','for(const k of x.validOffsets)add(x.minute*60+k,1);');
const a=vm.createContext({}),b=vm.createContext({});for(const [c,s] of [[a,original],[b,source]]){c.window=c;vm.runInContext(s,c);}
const U=a.DeepPetUnifiedDeep,V=b.DeepPetUnifiedDeep,date='2026-11-25';let n=0;
for(const profile of [{species:'dog',age:1,weight:5},{species:'dog',age:11,weight:40},{species:'cat',age:6,weight:4}])for(const variant of [0,1,2,3]){
 const h=new Float32Array(86400).fill(NaN),r=new Float32Array(86400).fill(NaN),m=new Float32Array(86400).fill(NaN),ref=U.group(profile);
 for(let k=0;k<86400;k++){if(variant===1&&k%67<7||variant===2&&k>43000||variant===3&&k%133<29)continue;h[k]=ref.hr+(variant===3&&k%129<25?60:0);r[k]=ref.rr;m[k]=k%150<92?10:k%150<108?34:65;}
 function calc(u){const x=u.fromRows(date,[]);x.secondRates={heart:h,breath:r,motion:m};const z=u.rest(date,x,[],u.group(profile));return JSON.stringify(z);}
 assert.equal(calc(U),calc(V));n++;console.log('PASS',profile.species,profile.age,variant);
}console.log('TOTAL',n);
