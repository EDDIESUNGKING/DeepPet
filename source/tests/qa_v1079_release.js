/* DeepPet V10.101 — score is independent of time-linked sudden events. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const source=read('assets/js/ux_v1068.js');
const multievents=read('assets/js/ux_v1071.js');
const controller=read('assets/js/ux_v1061.js');
const detector=read('assets/algorithm/context-alerts-v1061.js');
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(source,/timedShowcaseProfiles=new Set\(Array\.from\(\{length:15\},\(_,i\)=>i\)\)/,
 'All 15 gallery cases must remain eligible for sudden episodes');
assert.match(source,/!showroom\(\)\|\|!timedShowcaseProfiles\.has\(state\.dog\)/,
 'Live/new/blank owners must not inherit simulated events');
assert.match(multievents,/dpAlertScenarioVersion='v1079-score-independent-acutes'/,
 'Old no-event alert caches must be invalidated');
assert.match(multievents,/originalSignals\(date,\['heart','breath','activity','rest'\]\)/,
 'Sleep and rest timelines must still be present');
assert.match(controller,/detector\.detect\(\{date,series:currentSeries\(date\),history\}\)/,
 'Gallery alerts must be source-detected, not inferred from daily score');
assert.match(detector,/if\(crossing\.length<4\)continue/,
 'A single extreme minute must not be counted as a sustained event');
const runtime=read('index.html');
assert.match(runtime,/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(runtime,/deeppet-v10101-[a-f0-9]{12}\.css/);
assert.equal((runtime.match(/<script src="/g)||[]).length,1);
console.log('PASS V10.79: all 15 gallery profiles can show independently detected sudden events regardless of score');
