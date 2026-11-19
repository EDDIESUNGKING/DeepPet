/* V10.85: no reading / no flagged moment / true calm are separate states. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
const source=read('assets/js/app_03.js');
const fragment=(from,to)=>{const a=source.indexOf(from),b=source.indexOf(to,a);assert(a>=0&&b>a,from);return source.slice(a,b);};
const date='2026-11-18';
const full=(hr=80,rr=16,motion=10)=>({heart:Array(1440).fill(hr),breath:Array(1440).fill(rr),activity:Array(1440).fill(motion)});
const snapshots={};
const context={
 state:{dog:0,lang:'zht',dpMomentsByPet:{0:[{date,minute:720,hr:80,rr:16}]},dpEventIndex:0},
 dpSignals:(day)=>snapshots[day]||{heart:[],breath:[],activity:[]},
 dpEventsFor:()=>[],
 dpEventTitle:()=>'',dpEventLine:()=>'',vicon:()=>'',
 label3:(zh)=>zh,t:(x)=>x,esc:(x)=>String(x),
 iso:()=>date,localDate:()=>new Date(date+'T12:00:00'),
 dpAverage:v=>{const nums=v.filter(Number.isFinite);return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:0;},
 dpTime:m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`,
 deepCurvePath:points=>'M'+points.map(p=>p.join(',')).join(' L'),
 dpMomentFocusCurrent:()=>null,
 dpMomentRows:()=>context.state.dpMomentsByPet[0],
 currentDog:()=>({name:'Milo',photo:'assets/milo.webp'}),breedText:()=> 'Shiba Inu',
 demoRecords:()=>[],dpFullDate:d=>d,DP_HEART_POSTER_PHOTOS:{},
 bcgSample:()=>.1,breathingSample:()=>.2,smoothPath:points=>'M'+points.map(x=>x.join(',')).join('L'),
 Number,Array,Math,Date
};
const run=code=>vm.runInNewContext(code,context);
run(fragment('function dpEventList(','function dp1028Text('));
assert.match(context.dpEventEmptyMessage(date),/有效心率與呼吸記錄不足/);
assert.doesNotMatch(context.dpEventPreview(),/接近平常|平穩/);
snapshots[date]=full();
assert.match(context.dpEventEmptyMessage(date),/沒有標記出值得回看/);
assert.doesNotMatch(context.dpEventEmptyMessage(date),/接近平常/);

run(fragment('function dpBreathingSummary(','function dpQuietNightVitalAverages('));
snapshots[date]=full(80,0,10);
assert.equal(context.dpBreathingSummary(),'','zero breathing is not 100% steady');
snapshots[date]=full(80,16,50);
for(let i=0;i<120;i++)snapshots[date].activity[i]=10;
for(let i=0;i<35;i++)snapshots[date].breath[i]=NaN;
assert.equal(context.dpBreathingSummary(),'','85/120 paired quiet minutes is insufficient');
for(let i=0;i<15;i++)snapshots[date].breath[i]=16;
assert.match(context.dpBreathingSummary(),/100%/,'105/120 valid quiet minutes support a summary');

run(fragment('function dpMovementContrast(','function dpNightLongestRest('));
snapshots[date]=full(80,16,20);
for(let i=0;i<30;i++){snapshots[date].heart[i]=0;snapshots[date].activity[i]=10;}
for(let i=30;i<60;i++)snapshots[date].activity[i]=70;
for(let i=60;i<1440;i++)snapshots[date].activity[i]=NaN;
assert.equal(context.dpMovementContrast(),'','invalid resting HR cannot support moving vs resting comparison');
for(let i=0;i<30;i++)snapshots[date].heart[i]=80;
assert.match(context.dpMovementContrast(),/動靜心肺對照/);

run(fragment('function dpDailyContext(','function dpEventContext('));
snapshots[date]={heart:Array(1440).fill(NaN),breath:Array(1440).fill(NaN),activity:Array(1440).fill(NaN)};
assert.match(context.dpDailyContext(date),/記錄不足/);
for(const h of [0,2])for(let m=h*60;m<(h+1)*60;m++){
 snapshots[date].heart[m]=80+h;snapshots[date].breath[m]=16+h;snapshots[date].activity[m]=10;
}
const sparse=context.dpDailyContext(date);
assert.match(sparse,/22 個小時缺少/,'22 genuinely absent hourly buckets remain gaps');
assert.doesNotMatch(sparse,/NaN|Infinity/,'an incomplete day must not generate invalid SVG coordinates');
assert.equal((sparse.match(/<rect /g)||[]).length,2,'only observed movement hours get bars');
assert.equal((sparse.match(/<path /g)||[]).length,0,'a gap between single-hour dots must not be bridged');
snapshots[date]=full();
const complete=context.dpDailyContext(date);
assert.equal((complete.match(/<rect /g)||[]).length,24);
assert.doesNotMatch(complete,/缺少足夠/);

run(fragment('function dpMomentWindowMean(','function dpMomentActiveEvent('));
run(fragment('function dpMomentActiveEvent(','function dpPosterPath('));
run(fragment('function dpPosterPhoto(','async function dpDownloadPoster('));
delete snapshots[date];
const missing=context.dpMomentStats();
assert.equal(missing.beforeH,null);
assert.equal(missing.afterR,null);
assert.match(context.dpMomentShareLine(),/— → —/);
assert.doesNotMatch(context.dpMomentShareLine(),/0 → 0/);
assert.match(context.dpMomentExportText(),/HR — to —/);
assert.match(context.dpMomentPanel(),/不補造變化數值/);
const blankPoster=context.dpHeartPosterSvg();
assert.match(blankPoster,/原始記錄不足/);
assert.match(blankPoster,/—  →  —  bpm/);
assert.doesNotMatch(blankPoster,/stroke="url\(#hpWave\)" stroke-width="7"/,'no fabricated 20Hz waveform for a saved unobserved moment');
snapshots[date]=full();
for(let m=720;m<732;m++){snapshots[date].heart[m]=90;snapshots[date].breath[m]=19;}
assert.equal(context.dpMomentStats().beforeH,80);
assert.equal(context.dpMomentStats().afterH,90);
assert.match(context.dpMomentShareLine(),/80 → 90 bpm/);
assert.match(context.dpHeartPosterSvg(),/stroke="url\(#hpWave\)" stroke-width="7"/,'observed gallery moment retains its illustration');

// V10.99 only adds navigation origin and consistent heart-first presentation;
// the independently validated event detector remains byte-for-byte unchanged.
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
assert.equal(sha(fragment('function dpEventsFor(','function dpEventTitle(')),'fea51294a45971da90082dd0ce00b623dece64864db10a3f3fd7b2bf6dc430e7');
const criticalModules={
 'ux_v1059.js':'6be8fa05106254242a039c488047fbb681522ba70b86f5bf47c9eaa76c259404',
 'ux_v1062.js':'de9887cf351136adf0ff685ab2de515143cc693bb763974eddca6f34b5152171',
 'ux_v1065.js':'d2534f4b5c2fb1cb1bcb42f404640954a2cba4cdf241f36141ced132b691376c'
};
for(const [m,expected] of Object.entries(criticalModules))assert.equal(sha(read('assets/js/'+m)),expected,'audit expected event module: '+m);
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.css/);
console.log('PASS V10.85: no false calm on missing data, paired quiet readings, daily SVG gaps and saved moment unknowns; acute events unchanged');
