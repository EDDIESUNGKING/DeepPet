/* V10.99: functional Home→abnormal interval→Home and honest score reasons. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(base,name),'utf8');
const date='2026-11-18',profile={lang:'zh',dog:0,tab:'deep',detail:null,deepType:0,range:1};
const scoring={date,source:'sdk-demo-fixture',quietHeartRate:152,heartSpread:55,heartRate:130,
 quietBreathRate:33,breathSpread:11,breathRate:30,rmssd:13,sdnn:20,quietRhythm:.18,
 restHours:14,restFraction:.15,nightBreathRate:36,motionVariation:.57,motionMean:.04,
 recoveryDrop:4,quality:{}};
const reference={quietHeartRate:82,heartSpread:15,heartRate:92,quietBreathRate:20,breathSpread:4,breathRate:22,
 rmssd:42,sdnn:61,quietRhythm:.75,restHours:13,restFraction:.68,nightBreathRate:20,
 motionVariation:.20,motionMean:.31,recoveryDrop:22};
const samples=[{row:{date,idx:29},scores:{heart:19,breath:27,hrv:24,stable:18,cardio:22,
 sleep:31,energy:13,recovery:16,calm:22,activityRecovery:17}}];
const ledger={date,source:'sdk-demo-fixture',scores:samples[0].scores,
 baseline:{references:Object.fromEntries(Object.entries(reference).map(([key,ref])=>[key,{ref}]))}};
const context={window:null,state:profile,render:()=>{},document:{querySelector:()=>null,querySelectorAll:()=>[]},
 DeepPetSignalScoring:{getFeatures:()=>[scoring],getDaily:()=>[ledger]},
 DeepPetUX1050:{scope:()=>samples},DeepPetScoreIntegrity:{weights:{
 cardio:{heart:.32,breath:.32,hrv:.20,stable:.16},
 activityRecovery:{energy:.40,recovery:.35,calm:.25}}},
 toSimplified:s=>s};
context.window=context;
vm.runInNewContext(read('assets/js/ux_v1055.js'),context);
for(const [key,needle] of [['heart','安靜時心率'],['breath','安靜時呼吸速度'],
 ['hrv','RMSSD'],['stable','心搏節奏'],['sleep','安靜的比例'],
 ['energy','活動強度'],['recovery','兩分鐘心率'],['calm','休息時心率']]){
 const insight=context.DeepPetUX1055.insight(key,samples,1);
 assert(insight.level>=2,`${key} should retain high-risk status`);
 const reason=insight.details.find(x=>/數據依據/.test(x.title))?.text||'';
 assert(reason.includes(needle),`${key}: missing measured reason: ${reason}`);
 assert(/參考/.test(reason),`${key}: must show comparison baseline`);
 assert(/%/.test(reason),`${key}: must show size of deviation`);
}
for(const days of [1,7,30])for(const key of ['cardio','sleep','activityRecovery']){
 const reason=context.DeepPetUX1055.insight(key,samples,days);
 assert(reason.details.some(x=>x.title==='數據依據'&&/參考/.test(x.text)),`${key}/${days} explanation`);
}
assert.match(context.DeepPetUX1055.insight('sleep',samples,1).details[0].text,/安靜的比例/);
const noRefs={...context.DeepPetSignalScoring,getDaily:()=>[{...ledger,baseline:{references:{}}}],getFeatures:()=>[scoring]};
context.DeepPetSignalScoring=noRefs;
assert.match(context.DeepPetUX1055.evidenceFor('sleep',samples,1),/無法誠實判定/,
 'no comparable evidence must never invent an interruption/REM explanation');

const section={isConnected:true,dataset:{},classList:{added:[],add(x){this.added.push(x);}},scrollCount:0,
 scrollIntoView(arg){assert.equal(arg.block,'start');this.scrollCount++;}};
const page={querySelectorAll:()=>[{},section]};
const nav={window:null,state:{dog:0,tab:'deep',detail:'dp90-waveform',dp90WaveDate:date,
 dp90WaveKind:'heart',dp932WaveMinute:725,dp1099AlertNeedsScroll:true,
 dp1059AlertFocus:{pet:0,date,kind:'heart',minute:725}},render:()=>{},
 document:{querySelector:()=>page,addEventListener:()=>{}},requestAnimationFrame:fn=>fn()};
nav.window=nav;
vm.runInNewContext(read('assets/js/ux_v1099.js'),nav);
nav.render(true);
assert.equal(section.scrollCount,1,'Home alert must scroll to second Full-day wave section');
assert(section.classList.added.includes('dp1099-alert-destination'));
assert.equal(nav.state.dp1099AlertNeedsScroll,false);
assert.equal(section.dataset.dp1099Time,'2026-11-18 12:05');
nav.render(true);assert.equal(section.scrollCount,1,'ordinary rerenders must not jerk the page');
nav.state.dp90WaveKind='breath';nav.state.dp1059AlertFocus.kind='breath';
nav.state.dp1099AlertNeedsScroll=true;nav.render(true);
assert.equal(section.scrollCount,2,'switching to simultaneous breathing must focus again');

const source=read('assets/js/ux_v932.js');
const body=source.slice(source.indexOf('function action(k,el){'),source.indexOf("document.addEventListener('click',e=>{const el=e.target.closest?.('[data-dp932]')"));
const waveState={dog:0,tab:'deep',detail:'dp90-waveform',dp932WaveMinute:725,
 dp919AlertReturnTab:'home',dp1059AlertFocus:{pet:0},dp1099AlertNeedsScroll:true};
const action=vm.runInNewContext(body+'\naction',{state:waveState,render:()=>{},iso:()=>date,localDate:()=>new Date()});
action('wave-back',{});
assert.equal(waveState.tab,'home','wave back from Home alert must return Home');
assert.equal(waveState.detail,null);
assert.equal(waveState.dp919AlertReturnTab,null);
assert.equal(waveState.dp1059AlertFocus,null);
assert.equal(waveState.dp1099AlertNeedsScroll,false);

const rapid={window:null,state:{lang:'zh'},toSimplified:s=>s};rapid.window=rapid;
vm.runInNewContext(read('assets/js/ux_v1062.js'),rapid);
const acute=rapid.DeepPetUrgentEvents1062.alertMarkup({date,localSecond:12*3600+5*60+11,
 observations:[{kind:'breath',type:'low',value:13},{kind:'heart',type:'low',value:52}]});
assert.match(acute,/data-kind="heart"/);
assert.match(acute,/data-peer="breath"/);
assert.match(acute,/data-minute="725"/);
assert.match(acute,/data-second="11"/);

const styles=read('assets/css/ux_v1099.css');
assert.match(styles,/\.dp938-domain-count\{[\s\S]*?white-space:nowrap!important/);
assert.match(styles,/\.dp905-sleep-summary \.dp1054-period-kicker/);
assert.match(styles,/font-weight:400!important/);
assert.match(read('assets/js/ux_v1050.js'),/labI18n\(x\.name\)\.zh/);
assert.match(read('assets/js/ux_v921.js'),/項高風險/);
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log('PASS V10.99: alert anchors, Home return, simultaneous precision, 3×3 plain-language evidence, bilingual labs, nowrap labels');
