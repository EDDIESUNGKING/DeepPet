/* V10.101: restart-date continuity, multi-tab lost-update guard, and honest copy. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const base=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(base,name),'utf8');
const app=read('assets/js/app_03.js');

// A fresh session always starts on Home and its next Deep visit defaults to
// the new local day, even if the last session stored an old manually chosen day.
const first=app.indexOf('let state={...initial,...stored');
const last=app.indexOf('state.range=[1,7,30]',first);
assert(first>0&&last>first);
const restore=stored=>vm.runInNewContext(app.slice(first,last)+'\nstate',{
 initial:{deepSelectedDate:null,range:1},stored,
 iso:()=> '2026-11-19',localDate:()=>new Date('2026-11-19T00:00:00Z')});
for(const manual of [true,false]){
 const s=restore({tab:'deep',detail:'dp90-waveform',deepSelectedDate:'2026-11-18',
  dp1007DayManuallyChosen:manual});
 assert.equal(s.tab,'home');assert.equal(s.detail,null);
 assert.equal(s.deepSelectedDate,'2026-11-19','a re-opened app must not default to yesterday');
 assert.equal(s.dp1007DayManuallyChosen,false);
}
assert.match(app,/case 'nav':\{[\s\S]{0,280}next==='deep'&&state\.tab!=='deep'/);
assert.match(app,/state\.range=1;state\.deepSelectedDate=iso\(localDate\(\)\);state\.dp1007DayManuallyChosen=false/);

// Exercise the REAL persistence function without a browser. Same content
// skips redundant writes; a second tab changing the local file blocks a
// stale tab from replacing it; full storage returns false, not a false save.
const persistStart=app.indexOf('function persist(){');
const persistEnd=app.indexOf('// An owner record must not',persistStart);
assert(persistStart>0&&persistEnd>persistStart);
const persistBody=app.slice(persistStart,persistEnd);
function tab(throws=false){
 let disk=JSON.stringify({emptyPreview:true,foo:1}),writes=0;
 const messages=[];
 const sandbox={window:{},state:{emptyPreview:true,foo:1},dpPersistLastRaw:disk,
  localStorage:{getItem:()=>disk,setItem:(k,v)=>{if(throws)throw Error('quota exceeded');disk=v;writes++;}},
  requestAnimationFrame:fn=>fn(),toast:s=>messages.push(s),
  label3:(zh,en)=>zh};
 const persist=vm.runInNewContext(persistBody+'\npersist',sandbox);
 return {persist,sandbox,messages,get disk(){return disk;},get writes(){return writes;},external:x=>{disk=x;}};
}
const a=tab();assert.equal(a.persist(),true);assert.equal(a.writes,0,
 'a visual rerender must not write unchanged pet records');
a.sandbox.state.foo=2;assert.equal(a.persist(),true);assert.equal(a.writes,1);
a.external(JSON.stringify({emptyPreview:true,foo:900}));
a.sandbox.state.foo=3;
assert.equal(a.persist(),false,'second tab changes must block stale overwrites');
assert.equal(JSON.parse(a.disk).foo,900,'the other tab’s data must survive');
assert.equal(a.writes,1);
assert.match(a.messages.join(' '),/另一個分頁已有更新/);
const full=tab(true);full.sandbox.state.foo=2;
assert.equal(full.persist(),false,'storage quota errors must not report success');
assert.equal(full.writes,0);

const tour=read('assets/js/ux_v1037.js');
assert.match(tour,/<strong>24\/7<\/strong>/);
assert.doesNotMatch(tour,/<strong>7\/24<\/strong>/);
assert.match(tour,/藍牙版超過 5 天，4G 版 2–3 天/);
assert.doesNotMatch(tour,/續航仍可達 3–5 天/);
assert.match(tour,/體重與年齡也用於個體化預防建議及適用體檢參考/);
assert.match(tour,/結合實際年齡推算 AI 生理年齡/);
// The untouched Stage 2/3 tile wording is still present.
for(const phrase of ['看懂每天生理狀態與身體節奏','完整健康追蹤，讓日常管理更有方向',
 '體檢報告、用藥、疫苗，以及飲食與活動紀錄'])assert(tour.includes(phrase));

for(const file of ['ux_v1039.js','ux_v1070.js']){
 const source=read('assets/js/'+file);
 assert.match(source,/textContent=L\('預防性健康管理','Preventive Health Management'/,
  `${file}: user-approved major heading must not have an extra prefix`);
}
// Guard against old headings resurfacing through legacy deep and prevention
// fallbacks: the canonical labels remain the same with or without readings.
for(const legacy of ['ux_v936.js','ux_v931.js','app_03.js']){
 const src=read('assets/js/'+legacy);
 assert(src.includes('心跳狀況')&&src.includes('呼吸狀況'),`${legacy}: canonical deep labels`);
}
assert.match(read('assets/js/ux_v936.js'),/心搏節奏穩定度/);
assert.match(read('assets/js/prevention.js'),/個體化健康建議/);
assert.doesNotMatch(read('assets/js/prevention.js'),/個體化預防重點/);
// Simulated records and gallery count stay governed by the same original
// source; labels used intentionally to demonstrate scenarios are not removed.
assert.match(app,/state\.demoGallery=true/);
assert.match(app,/name:'Lucky'/);
// Lock the V10.100 fixtures and original scoring core byte-for-byte. This
// version changes data presentation and saving only, never showroom values.
const frozen={
 'assets/js/app_01.js':'58ac804f6c3d3cfda075927d35b2064a8d81d340fffc1492f5b87ee5dfee439f',
 'assets/js/app_02.js':'c91d93233130cab64dce078e632ca7aea8617587b83aedba0e0aa0edaaba3b53',
 'assets/algorithm/wellness-v925.js':'d18fed6500c6f9bb0f5edf4542717d1b8d924abf7984c0e9994b59345fa476a0'
};
for(const [filename,hash] of Object.entries(frozen)){
 assert.equal(crypto.createHash('sha256').update(read(filename)).digest('hex'),hash,
  `${filename}: showcase data or wellness rules were unexpectedly changed`);
}
assert.match(read('VERSION.txt'),/DeepPet V10\.101/);
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log('PASS V10.101: restored Today, multi-tab write protection, consistent specs, original showcase');
