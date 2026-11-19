/* DeepPet V10.50: score-specific narratives and no false reassuring 29/100. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const script=src('assets/js/ux_v1050.js'),css=src('assets/css/ux_v1050.css');
const n=30,rows=Array.from({length:n},(_,i)=>({date:`2026-11-${String(i+1).padStart(2,'0')}`,idx:i}));
// Leo: 7d low, not improving; 30d low; recovery scores vary by day.
const engine=rows.map((r,i)=>({date:r.date,scores:{
  heart:48+(i%4)*3,breath:58+(i%3)*4,hrv:42+(i%5)*2,stable:46+(i%4)*2,
  cardio:48+(i%3)*2,sleep:i>=23?29:i%2?28:32,
  energy:34+(i%7)*3,recovery:39+(i%5)*4,calm:45+(i%6)*3,
  activityRecovery:40+(i%7)*2,physiol:35+(i%5)*3,rhythm:49+(i%6)*2
}}));
const model={window:{DeepPetSignalScoring:{getDaily:()=>engine}},state:{lang:'zht',dog:0,tab:'deep',deepType:1,range:7,detail:null},
 render:()=>{},document:{querySelectorAll:()=>[],querySelector:()=>null},
 validDaySample:()=>({valid:true}),demoRecords:()=>rows,
 dayRowsWithIndex:days=>rows.slice(-days),deepChosenDate:()=>rows.at(-1).date,
 dpNightSleepStats:i=>({minutes:840+(i%4)*15,wakes:1+(i%3)}),dpMinutesText:v=>`${Math.floor(v/60)}小時${v%60}分鐘`,
 currentDog:()=>({species:'dog',name:'Leo'}),iso:d=>d.toISOString().slice(0,10),localDate:()=>new Date('2026-11-30T12:00:00Z')};
vm.runInNewContext(script,model);
const api=model.window.DeepPetUX1050;
assert.equal(api.version,'10.50');
const week=api.scope(7),month=api.scope(30);
assert.equal(week.length,7);assert.equal(month.length,30);
const text=api.sleepNote(week,7);
assert.match(text,/29分/);assert.match(text,/7個有效日低於60分/);
assert.match(text,/即使前後變化不大，仍是持續偏低/);
assert.match(text,/保持安靜|安靜睡眠環境/);
assert.match(text,/獸醫/);
const today=api.sleepNote(api.scope(1),1);
assert.match(today,/今天睡眠休息29分/);
assert.match(today,/休息模式與個體基準差距很大/);
assert.match(api.sleepNote(month,30),/近30天平均/);
for(const key of ['heart','breath','hrv','stable','energy','recovery','calm']){
 const low=api.metricNote(key,30),moderate=api.metricNote(key,72),healthy=api.metricNote(key,94);
 assert.match(low,/30分/);assert.match(low,/獸醫/);
 assert(low.length>moderate.length,`${key}: severe must say more than moderate`);
 assert(moderate.length>healthy.length,`${key}: moderate must say more than healthy`);
}
assert.match(api.metricNote('hrv',29),/不是單純越高越好/);
assert.match(api.metricNote('recovery',29),/兩分鐘/);
assert.match(api.metricNote('calm',29),/不能從這項推斷開心或難過/);
assert.match(api.overallNote(week,0,7),/主要受/);
assert.match(api.overallNote(week,2,7),/主要受/);
const lab=api.labReasons(18,[{name:'ALT',score:12},{name:'CREA',score:18},{name:'WBC',score:28},{name:'GLU',score:95}]);
for(const word of ['18分','ALT','CREA','WBC','獸醫','原始檢驗報告'])assert.match(lab,new RegExp(word));
assert.match(api.labReasons(null,[]),/參考區間/);
assert.match(api.labReasons(97,[{name:'ALT',score:98}]),/97分/);
assert.match(script,/L\('期間重點','Period summary'/);
assert.match(script,/\.dp905-sleep-head>div:first-child>p:not\(\.dp1048-sleep-conclusion\)/);
assert.match(script,/\.dp1050-sleep-day-priority/);
assert.match(script,/\.dp903-metric-left>p/);
assert.match(script,/\.dp901-metric-desc/);
assert.match(script,/\.dp850-score-panel/);
assert.match(script,/\.dp921-details-head/);
assert.match(css,/dp1050-sleep-day-priority/);
assert.match(css,/writing-mode:horizontal-tb!important/);
assert(['DeepPet V10.50','DeepPet V10.51','DeepPet V10.52','DeepPet V10.53','DeepPet V10.54','DeepPet V10.55','DeepPet V10.101'].includes(src('VERSION.txt').trim()));
for(const f of ['assets/js/ux_v1050.js','assets/css/ux_v1050.css'])assert(src('build.mjs').includes(f));
assert.match(src('package_latest.mjs'),/README\.md/);
console.log('PASS DeepPet V10.50: Leo 29/100 remains serious despite flat trend; actionable score-specific text, lab 18/100 reasons, period label, sleep layout, health recap and bundle contracts.');
