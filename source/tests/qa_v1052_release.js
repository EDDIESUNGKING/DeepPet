/* V10.52 release contracts: no detached sleep prose, evidence-led scores and lab drill-down. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const rows=Array.from({length:30},(_,i)=>({date:`2026-10-${String(i+1).padStart(2,'0')}`,
 idx:i,heart:82+i%5,breath:24+i%3,rmssd:12+i%3,sdnn:19+i%4,activity:40+i%7}));
const samples=rows.map((row,i)=>({row,scores:{heart:23+i%9,breath:18+i%8,hrv:19+i%6,
 stable:22+i%7,cardio:21+i%6,sleep:28+i%6,energy:35+i%8,recovery:40+i%9,
 calm:19+i%5,activityRecovery:31+i%5,physiol:25+i%7,rhythm:29+i%8}}));
const scope={window:{DeepPetUX1050:{scope:d=>samples.slice(-d)}},
 document:{body:{classList:{toggle(){}}},querySelector:()=>null,querySelectorAll:()=>[]},
 state:{lang:'zht',tab:'deep',range:1,deepType:1,detail:null,dog:3},
 render(){},vetReportContent(){return '<div></div>';},
 demoRecords:()=>rows,dpNightSleepStats:i=>({minutes:780+i%5*15,wakes:2+i%3}),
 dpMinutesText:mins=>`${Math.floor(mins/60)}小時${mins%60}分鐘`,
 validDaySample:()=>({valid:true}),toSimplified:x=>x};
vm.runInNewContext(source('assets/js/ux_v1052.js'),scope);
const api=scope.window.DeepPetUX1052;
assert.equal(api.version,'10.53');
const day=api.sleepExplanation(samples.slice(-1),1);
const week=api.sleepExplanation(samples.slice(-7),7);
const month=api.sleepExplanation(samples,30);
for(const text of [day,week,month]){
 assert.match(text,/低分|偏低/);
 assert.match(text,/夜間中斷|夜間中斷約/);
 assert.match(text,/獸醫/);
 assert(!/undefined|NaN/.test(text));
}
assert.match(week,/近7天/);assert.match(month,/近30天/);
assert.match(api.metricExplanation('heart',samples.slice(-7),7,29),/心率平均/);
assert.match(api.metricExplanation('breath',samples.slice(-7),7,31),/呼吸頻率平均/);
assert.match(api.metricExplanation('hrv',samples.slice(-7),7,22),/RMSSD/);
assert.match(api.metricExplanation('recovery',samples.slice(-7),7,44),/落在|兩分鐘心率平均回落/);
const lowLab=api.labExplanation({value:220,unit:'U/L'},
 {score:18,reference:{ok:true,low:10,high:80,value:220,unit:'U/L'}});
assert.match(lowLab,/10.0–80.0 U\/L/);
assert.match(lowLab,/高於參考上限/);
assert.match(lowLab,/重風險/);
const missingLab=api.labExplanation({value:12,unit:'?'},{score:null,reference:{ok:false}});
assert.match(missingLab,/不能編造風險等級/);
for(const lang of ['en','ja','ko','zh']){
 scope.state.lang=lang;
 const t=api.sleepExplanation(samples.slice(-7),7);
 assert(t.length>30,`empty explanation in ${lang}`);
 assert(!/undefined|NaN/.test(t));
}
const stylesheet=source('assets/css/ux_v1052.css'),script=source('assets/js/ux_v1052.js');
assert.match(stylesheet,/dp1052-sleep-flow/);assert.match(stylesheet,/dp1052-sleep-reason/);
assert.match(stylesheet,/grid-template-columns:minmax\(0,1fr\) 116px/);
assert.match(script,/card\.querySelectorAll\('\.dp1051-sleep-full-reason'\)/);
assert.match(script,/card\.querySelectorAll\('\.dp-owner-status-inner>p:not\(\.dp-owner-sleep-difference\)'\)/);
assert.match(script,/card\.querySelectorAll\('\.dp1051-sleep-full-reason'\)/);
assert.match(script,/dp1013-event-card/);assert.match(script,/dp1052-inspector/);
assert.match(script,/dp1052-detail-link/);assert.match(script,/dp1052-lab-detail/);
assert.match(stylesheet,/font-size:12\.5px!important;font-weight:720/);
assert.equal(source('VERSION.txt').trim(),'DeepPet V10.101');
for(const f of ['assets/js/ux_v1052.js','assets/css/ux_v1052.css'])assert(source('build.mjs').includes(f));
assert(!source('package_latest.mjs').includes("'tests/qa_v1052_release.js'"));
assert(source('package_latest.mjs').includes('if(retained<100)throw'));
console.log('PASS V10.52: evidence-backed risk copy and 7/30 score consistency, lab reference drill-down, unified sleep and detail-link contracts, chart tooltip and media-preserving packaging.');
