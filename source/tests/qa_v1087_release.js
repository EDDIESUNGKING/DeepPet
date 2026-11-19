/* V10.90: no customer-facing demo labels; preserve waveform and event engine. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('assets/js/app_03.js');
const fragment=(start,end)=>{const a=app.indexOf(start),b=app.indexOf(end,a);assert(a>=0&&b>a,start);return app.slice(a,b)};
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');

// UI text sanitizer must handle all five shipped language variants and all
// dynamically inserted UI labels, but never mutate internal data-action keys.
const textNode={nodeType:3,nodeValue:'',parentElement:{matches:()=>false}};
const rootNode={nodeType:1,isConnected:true,attrs:{'aria-label':'模擬波形 Demo'},
 matches:()=>false,hasAttribute(k){return Object.hasOwn(this.attrs,k);},
 getAttribute(k){return this.attrs[k];},setAttribute(k,v){this.attrs[k]=v;}};
const fakeDocument={body:null,querySelector:selector=>selector==='#app'?rootNode:null,
 createTreeWalker:()=>{let used=false;return {nextNode:()=>{if(used)return null;used=true;return textNode;}};}};
let capturedToast='';
const presentation={window:{},document:fakeDocument,NodeFilter:{SHOW_ELEMENT:1,SHOW_TEXT:4},
 LANG:Object.fromEntries(['zh','zht','en','ko','ja'].map(k=>[k,{}])),
 render:()=>{textNode.nodeValue='示範波形 · Demo';return true;},
 renderModal:()=>true,toast:msg=>{capturedToast=msg;}};
vm.runInNewContext(read('assets/js/ux_v1087.js'),presentation);
const clean=presentation.window.DeepPetPresentationCleanV1087;
for(const text of [
 '示範波形 · 最近8秒','模拟 GPS','交互演示 · 所有监测数据均为模拟',
 'Illustrative waveform · simulated reading','Demo members','simulated results',
 '데모 파형','시뮬레이션 체험용','デモ波形','シミュレーション'
])assert.doesNotMatch(clean(text),/示範|示范|模拟|模擬|演示|demo|simulat|illustrativ|데모|시뮬레이션|デモ|シミュレーション/i,text);
presentation.render();
assert.equal(textNode.nodeValue,'波形');
assert.equal(rootNode.attrs['aria-label'],'波形');
presentation.toast('GPS DEMO');
assert.equal(capturedToast,'GPS');
for(const language of ['zh','zht','en','ko','ja']){
 assert.equal(presentation.LANG[language].demo,'');
 assert.equal(presentation.LANG[language].notLive,'');
 assert(presentation.LANG[language].disclaimer.length>10,'retain non-demo safety copy');
}
assert.doesNotMatch(fragment('function drawStreaming(','function waveSvg('),/dpUsesRealMeasurements/,'real-pet synthetic wave shutdown must be reverted');
assert.match(fragment('function streamingPanel(','function waveSvg('),/data-stream="\$\{kind\}"/);
assert.doesNotMatch(fragment('function dpHeartPosterSvg(','async function dpDownloadPoster('),/示範波形|Illustrative waveform|showIllustrativeWaves/);
assert.doesNotMatch(fragment('function healthDetail(','function foodDetail('),/demo-ribbon/);

// The selected minute must never be rewritten to noon or clamped away from
// 23:59. Missing neighboring-day source is unknown, not a fake 0 bpm.
const selected='2026-11-18',saved=[{date:selected,minute:0}];
const signals={heart:Array(1440).fill(90),breath:Array(1440).fill(18),activity:Array(1440).fill(10)};
const state={dog:0,dpMomentsByPet:{0:saved},dpPetEpoch:1};
const ctx={state,dpEventsFor:()=>[],dpSignals:()=>signals,demoRecords:()=>[],
 dpAverage:nums=>nums.reduce((sum,n)=>sum+n,0)/nums.length,
 iso:()=>selected,localDate:()=>new Date('2026-11-18T12:00:00'),
 dpTime:m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`,
 label3:a=>a,Math,Number,Date};
vm.runInNewContext(fragment('function dpMomentRows(','function dpMomentActiveEvent('),ctx);
vm.runInNewContext(fragment('function dpMomentActiveEvent(','function dpPosterPath('),ctx);
assert.equal(ctx.dpMomentCardContext().minute,0);
assert.equal(ctx.dpMomentCardContext().preH,null);
assert.equal(ctx.dpMomentCardContext().postH,90);
assert.equal(ctx.dpMomentStats().beforeH,null);
assert.equal(ctx.dpMomentStats().afterH,90);
assert.match(ctx.dpMomentShareLine(),/00:00/);
saved[0].minute=1439;
assert.equal(ctx.dpMomentCardContext().minute,1439);
assert.equal(ctx.dpMomentCardContext().preR,18);
assert.equal(ctx.dpMomentCardContext().postR,null);
assert.equal(ctx.dpMomentStats().beforeR,18);
assert.equal(ctx.dpMomentStats().afterR,null);
assert.match(ctx.dpMomentShareLine(),/23:59/);
assert.match(fragment('function dpHeartMomentScreen(','function dpHRVSummary('),/s\.preH===null\?'—'/);

// Acute events are still timed independently of long-term scores.
const sha=t=>crypto.createHash('sha256').update(t).digest('hex');
assert.equal(sha(fragment('function dpEventsFor(','function dpEventTitle(')),'fea51294a45971da90082dd0ce00b623dece64864db10a3f3fd7b2bf6dc430e7');
for(const [file,expected] of Object.entries({
 'ux_v1059.js':'6be8fa05106254242a039c488047fbb681522ba70b86f5bf47c9eaa76c259404',
 'ux_v1062.js':'de9887cf351136adf0ff685ab2de515143cc693bb763974eddca6f34b5152171',
 'ux_v1065.js':'d2534f4b5c2fb1cb1bcb42f404640954a2cba4cdf241f36141ced132b691376c'
}))assert.equal(sha(read('assets/js/'+file)),expected);
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.css/);
console.log('PASS V10.93: clean customer copy, retained animation, preserved midnight/late-night timestamps, nulls and independent alerts');
