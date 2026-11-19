/* DeepPet V10.48: remove misleading flat showcase scores and redundant UI. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const app=src('assets/js/app_03.js'),fixture=src('assets/js/ux_v912.js');
const ux=src('assets/js/ux_v1048.js'),css=src('assets/css/ux_v1048.css');

// Run the real gallery-case scoring function rather than retyping a duplicate
// formula in the test. Poppy is a deliberately lower-energy German shepherd.
const result=/\n (const showcaseRhythm=[\s\S]*?\n \};)\n const scores=baseScores\.map/.exec(fixture);
assert(result,'must locate the actual showroom-case function');
const weights={cardio:{heart:.32,breath:.32,hrv:.20,stable:.16},
  activityRecovery:{energy:.40,recovery:.35,calm:.25},rhythm:{calm:.58,stable:.42},
  physiol:{cardio:.42,sleep:.30,activityRecovery:.28}};
const weighted=(scores,w,keys)=>Math.round(keys.reduce((a,k)=>a+(Number(scores[k])||0)*w[k],0));
const context={dogs:Array.from({length:15},()=>({score:[95,83,61],species:'dog'})),
  integrity:{weights,weighted,riskGuard:n=>n}};
vm.runInNewContext(result[1]+'\nthis.showroomCase=showroomCase;',context);
const recoveryScores=Array.from({length:30},(_,day)=>
  context.showroomCase({scores:{hrv:85}},4,day).scores.recovery);
const energyScores=Array.from({length:30},(_,day)=>
  context.showroomCase({scores:{hrv:85}},4,day).scores.energy);
assert(new Set(recoveryScores).size>3,'Poppy recovery cannot be a fixed 84 on all 30 days');
assert(new Set(energyScores).size>3,'Poppy energy cannot be a straight line');
assert(new Set(recoveryScores.slice(-7)).size>1,'Poppy recovery must vary in the latest seven days');
assert(new Set(energyScores.slice(-7)).size>1,'Poppy energy must vary in the latest seven days');
assert(!recoveryScores.every(n=>n===84));
assert(recoveryScores.some(n=>n<80),'an 80-point portrait must not force a weak component to 82+');

const epoch=Date.UTC(2026,9,17),rows=Array.from({length:30},(_,idx)=>({
  idx,date:new Date(epoch+idx*86400000).toISOString().slice(0,10)}));
const engine=rows.map((r,i)=>({date:r.date,scores:{
  cardio:82+(i%3),sleep:76+(i%7),energy:60+(i%6),
  recovery:63+(i%5)*3,calm:79+(i%4),hrv:85-(i%4),stable:87+(i%3),
  activityRecovery:70+(i%5)}}));
const state={lang:'zht',dog:4,tab:'deep',deepType:2,range:30,detail:''};
let excluded=-1;
const testCtx={window:{DeepPetSignalScoring:{getDaily:()=>engine}},state,
  meView:()=>'',deviceCenter:()=>'',deepView:()=>'',render:()=>{},
  dayRowsWithIndex:n=>rows.slice(-n),validDaySample:r=>({valid:r.idx!==excluded}),
  dpOwnerDayScores:()=>({}),rhythmData:()=>({values:[]}),
  document:{createElement:()=>({innerHTML:''}),querySelectorAll:()=>[]}};
const exposing=ux.replace(/\}\)\(window\);\s*$/,
  'root.__qa1048={scores,chartScores,sleepSummary,heartSummary,energySummary,plainDescription};})(window);');
assert.notEqual(exposing,ux,'unit instrumentation must expose internal pure functions');
vm.runInNewContext(exposing,testCtx);
const api=testCtx.window.__qa1048;
const full=api.scores(30,'recovery'),week=api.scores(7,'recovery');
assert.deepEqual(Array.from(week,x=>x.value),Array.from(full.slice(-7),x=>x.value),
  '7-day chart must use the exact same dated score values as the 30-day suffix');
assert(new Set(Array.from(full,x=>x.value)).size>1);
assert.equal(api.chartScores(30,'recovery').length,30);
excluded=26;
assert.equal(api.chartScores(30,'recovery')[26].value,null,
  'genuine unobserved days must remain gaps in the recovery plot');
excluded=-1;
assert.match(api.sleepSummary(7),/近7天睡眠休息/);
assert.match(api.sleepSummary(30),/近30天睡眠休息/);
assert.match(api.heartSummary(7),/HRV.*心搏節奏/);
assert.match(api.energySummary(30),/精力.*活動後恢復.*休息時/);
assert.match(api.plainDescription('recovery'),/兩分鐘/);
assert.match(api.plainDescription('calm'),/安靜休息.*接近平常/);

assert(/const add='';/.test(app),'remove technical 7/30 change panel and single-day care overlay');
assert(/charts\[0\]\.remove\(\)/.test(ux),'remove duplicated activity-intensity period graph');
assert(/chartScores\(30,'recovery'\),days/.test(ux),'use full 30-day score axis for either period');
assert(/if\(days===1\)[\s\S]*scoreAt\(row,key,engine\)/.test(ux),
  'day recovery and calm must use the same dated source as 7/30-day scores');
assert(!/class="dp1048-baseline-mark"/.test(ux)&&/dp1046-baseline-spark/.test(src('assets/js/ux_v1046.js')),
  'the 14-day entry keeps a real dated score curve instead of an invented wave');
assert(/dp1048-sleep-day-head h2[\s\S]*white-space:nowrap!important/.test(css),
  'the single-day sleep title is forcibly horizontal and nonwrapping');
assert(/\.dp1048-sleep-conclusion/.test(css)&&/copy\.append\(p\)/.test(ux),
  '7/30-day sleep conclusion is adjacent to its subtitle, not after a tall ring');
assert(/\.dp1048-battery-inline[\s\S]*background:transparent!important/.test(css),
  'battery cannot appear in a pale-green box');
assert(/pair-back-results["\]][\s\S]*white-space:nowrap!important/.test(css),
  'pairing Back button stays horizontal');
assert(src('build.mjs').includes('ux_v1048.js')&&src('build.mjs').includes('ux_v1048.css'));
assert(src('package_latest.mjs').includes('README.md'));
assert(['DeepPet V10.48','DeepPet V10.49','DeepPet V10.50','DeepPet V10.51','DeepPet V10.52','DeepPet V10.53','DeepPet V10.54','DeepPet V10.55','DeepPet V10.101'].includes(src('VERSION.txt').trim()));
console.log('PASS DeepPet V10.48: Poppy day-varying gallery scores, dated 7/30 consistency, plain summaries, compact battery, horizontal sleep titles, one energy trend, decor baseline and pairing widths.');
