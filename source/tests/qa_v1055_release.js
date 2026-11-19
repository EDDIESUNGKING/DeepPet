/* V10.55: weighted attribution, clear owner copy and expandable evidence. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const base=path.join(__dirname,'..');
const read=x=>fs.readFileSync(path.join(base,x),'utf8');
const weights=require(path.join(base,'assets/algorithm/score-integrity-v1.js')).weights;
const ctx={
 state:{dog:3,lang:'zht',tab:'home',range:1,deepType:1,detail:null},
 DeepPetScoreIntegrity:{weights},
 render:()=>{},
 document:{querySelectorAll:()=>[],querySelector:()=>null},
 demoRecords:()=>[],
 validDaySample:()=>({valid:true}),
 DeepPetSignalScoring:{getDaily:()=>[]},
 dpNightSleepStats:()=>({minutes:870,wakes:2}),
 toSimplified:x=>x,
};
ctx.window=ctx;
vm.runInNewContext(read('assets/js/ux_v1055.js'),ctx);
const engine=ctx.DeepPetUX1055;
assert(engine,'narrative engine registered');
const d=(date,scores)=>({row:{date,idx:12,heart:88,breath:28,rmssd:31,sdnn:47,activity:45},scores});
const weak={heart:91,breath:27,hrv:36,stable:93,cardio:45,energy:85,recovery:31,calm:88,
 activityRecovery:58,sleep:31,physiol:42,rhythm:86};
const day=[d('2026-11-17',weak)];
const cardio=engine.insight('cardio',day,1);
assert.deepEqual(Array.from(cardio.focus,x=>x.key),['breath','hrv','heart'].slice(0,3).filter(x=>x!=='heart'));
assert.match(cardio.headline,/缺少可核對的主要波動原因/,'without matched measurements, do not invent breathing/HRV causes');
assert(!/\.32|\.20|加權公式|32%/.test(cardio.headline+cardio.details.map(x=>x.text).join('')),'no internal weights in UI');
assert(cardio.headline.length<55,'owner should get a short visible headline');
assert(cardio.details.some(x=>x.title==='持續多久'));
assert(cardio.details.some(x=>x.title==='怎樣算改善'));
const energy=engine.insight('activityRecovery',day,1);
assert.equal(energy.focus[0].key,'recovery','reason ranking uses weighted impact');
const sleep=engine.insight('sleep',day,1);
assert.match(sleep.headline,/缺少可核對的主要波動原因/,
 'two interruptions and 14.5 hours alone cannot establish the cause of a 31 score');
assert.match(sleep.details.map(x=>x.text).join(''),/無法誠實判定/);
const week=Array.from({length:7},(_,i)=>d(`2026-11-${String(10+i).padStart(2,'0')}`,{...weak,sleep:29+i%3,cardio:27+i%3}));
const period=engine.insight('sleep',week,7);
assert.match(period.details.find(x=>x.title==='持續多久').text,/7 日低於60分/);
assert.match(period.details.find(x=>x.title==='持續多久').text,/持續偏低/);
const healthy=engine.insight('cardio',[d('2026-11-17',{...weak,heart:96,breath:95,hrv:91,stable:94,cardio:95})],1);
assert.equal(healthy.level,0);assert(healthy.headline.length<38);assert(!/應優先/.test(healthy.headline));
const missing=engine.insight('cardio',[d('2026-11-17',{heart:null,breath:null,hrv:null,stable:null,cardio:null})],1);
assert.equal(missing.level,-1);assert.match(missing.headline,/資料不足/);
ctx.state.lang='en';assert.match(engine.insight('cardio',day,1).headline,/do not yet establish/);
const css=read('assets/css/ux_v1055.css'),js=read('assets/js/ux_v1055.js');
assert(css.includes('dp1055-details[open]')&&css.includes('summary::after{content:none!important;'));
assert(js.includes('insertNarrative(p,insight(\'sleep\',samples,days))'));
assert(js.includes('insertNarrative(p,result)')&&js.includes('function exam()'));
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
console.log('PASS V10.55 concise layered risk narratives, weighted causes, dated persistence, reference evidence, recovery signals, healthy/no-data cases and four-language source.');
