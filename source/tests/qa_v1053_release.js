/* V10.53 — evidence boundaries, disjoint week comparisons and restrained copy. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const src=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const rows=Array.from({length:30},(_,i)=>({
 date:`2026-10-${String(i+1).padStart(2,'0')}`,idx:i,heart:70+i,breath:19+i/10,
 rmssd:12+i/5,sdnn:20+i/5,activity:30+i
}));
const samples=rows.map((row,i)=>({row,scores:{
 heart:29+i%3,breath:49+i%3,hrv:12+i%3,stable:15+i%3,cardio:39+i%3,
 sleep:29+i%3,energy:34+i%3,recovery:30+i%3,calm:31+i%3,
 activityRecovery:32+i%3,physiol:28+i%3,rhythm:33+i%3
}}));
const scope={window:{DeepPetUX1050:{scope:days=>samples.slice(-days)}},
 document:{body:{classList:{toggle(){}}},querySelector(){return null;},querySelectorAll(){return [];}},
 state:{lang:'zht',tab:'deep',range:30,deepType:0,detail:null,dog:3},
 render(){},vetReportContent(){return '<div></div>';},demoRecords:()=>rows,
 validDaySample:()=>({valid:true}),toSimplified:s=>s,
 dpNightSleepStats:idx=>({minutes:720+idx*2,wakes:2+idx%4}),
 dpMinutesText:minutes=>`${Math.floor(minutes/60)}小時${Math.round(minutes%60)}分鐘`
};
vm.runInNewContext(src('assets/js/ux_v1052.js'),scope);
const api=scope.window.DeepPetUX1052;
assert.equal(api.version,'10.53');
const heart=api.metricExplanation('heart',samples,30,29);
assert.match(heart,/這項評分很低/);
assert.match(heart,/本期最近7個有效日心率平均 96次\/分/);
assert.match(heart,/本期前段有效日平均 73次\/分/);
assert(!heart.includes('平均 85次/分'), 'must not compare overlapping 30-day mean against first week');
assert.match(heart,/獸醫/);
const day=api.sleepExplanation(samples.slice(-1),1);
const week=api.sleepExplanation(samples.slice(-7),7);
const month=api.sleepExplanation(samples,30);
for(const t of [day,week,month]){
 assert.match(t,/中斷/);assert.match(t,/獸醫/);
 assert(!/睡眠休息\s+\d+\s+分/.test(t),'the ring already shows the score');
 assert(!/undefined|NaN/.test(t));
}
assert.match(month,/30個有效日低於60分/);
assert(!/持續的明顯低分/.test(week),'must not imply indefinite history from short window');
const explanation=api.compositeExplanation(['heart','breath','hrv','stable'],'cardio',samples,30);
assert.match(explanation,/心跳/);
assert.match(explanation,/心搏節奏/);
assert.match(explanation,/HRV|心搏節奏/);
const script=src('assets/js/ux_v1052.js');
assert(script.includes("compositeExplanation(['heart','breath','hrv','stable'],'cardio',samples,days)"));
assert(!script.includes("compositeExplanation(['heart','breath'],'cardio',samples,days)"));
const headings=src('assets/js/app_03.js');
assert(!headings.includes('今日紅點原因與建議'));
assert(headings.includes('今日觀察與建議'));
const riskCopy=src('assets/js/ux_v1040.js');
assert(!riskCopy.includes("return '非常健康。'"));
const healthy=api.metricExplanation('heart',samples,30,94);
assert(!/一貫|接近日常/.test(healthy),'a high score alone does not prove a personal baseline match');
const pkg=src('package_latest.mjs');
assert(pkg.includes('release_v${tag}_export')&&pkg.includes('deeppet-v${tag}-'));
assert.doesNotMatch(pkg,/await rm\(target,\{recursive:true/,'A packaging helper must never delete a populated release');
assert(!pkg.includes("'tests/qa_v1043_release.js'"));
assert.equal(src('VERSION.txt').trim(),'DeepPet V10.101');
console.log('PASS V10.53: 30-day nonoverlapping comparisons, correct cardio components, evidence-rich low-score sleep, no duplicate ring scores, neutral health copy, clean full-source package.');
