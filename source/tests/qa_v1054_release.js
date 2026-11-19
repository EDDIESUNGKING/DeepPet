/* DeepPet V10.54 — weighted score, observed alerts, provenance and layout contract. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const base=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const integrity=require(path.join(base,'assets/algorithm/score-integrity-v1.js'));
const components={heart:78,breath:81,hrv:44,stable:61,energy:85,recovery:42,calm:79};
const cardio=integrity.weighted(components,integrity.weights.cardio,['heart','breath']);
const cardioWithoutExtras=integrity.weighted({heart:78,breath:81},integrity.weights.cardio,['heart','breath']);
assert.notEqual(cardio,cardioWithoutExtras,'HRV and rhythm stability must change cardio');
assert.equal(cardio,69,'32/32/20/16 four-component weighted result');
assert.equal(integrity.weighted(components,integrity.weights.activityRecovery,['energy','calm']),68,'energy, recovery and calm are weighted 40/35/25');
assert.equal(integrity.weighted({heart:78,breath:81,hrv:null,stable:null},integrity.weights.cardio,['heart','breath']),cardioWithoutExtras,'optional missing features are never treated as zeros');
const source912=read('assets/js/ux_v912.js'),extracted=/\n (const showcaseRhythm=[\s\S]*?\n \};)\n const scores=baseScores\.map/.exec(source912);
assert(extracted,'real showroom-case function exists');
const wctx={dogs:[{score:[82,80,67],species:'dog'}],integrity};
vm.runInNewContext(extracted[1]+'\nthis.scoreCase=showroomCase;',wctx);
const caseScore=wctx.scoreCase({scores:{hrv:83}},0,12).scores;
assert.equal(caseScore.cardio,integrity.riskGuard(integrity.weighted(caseScore,integrity.weights.cardio,['heart','breath']),[caseScore.heart,caseScore.breath,caseScore.hrv,caseScore.stable]));
assert.equal(caseScore.activityRecovery,integrity.riskGuard(integrity.weighted(caseScore,integrity.weights.activityRecovery,['energy','recovery','calm']),[caseScore.energy,caseScore.recovery,caseScore.calm]));

const ymd='2026-11-17';
const row={date:ymd,idx:29,heart:90,breath:18};
const pets=[{name:'Leo'},{name:'Milo'}];
const H=Array(1440).fill(100),B=Array(1440).fill(21),M=Array(1440).fill(5);
for(let t=600;t<617;t++)H[t]=154;
for(let t=605;t<624;t++)B[t]=37;
const ctx={console,state:{dog:0,lang:'zht',petOverrides:{},tab:'home'},dogs:pets,
 allPets:()=>pets,demoRecords:()=>[row],validDaySample:()=>({valid:true}),
 dpSignals:(date,kinds)=>({heart:ctx.state.dog===0?H:Array(1440).fill(100),breath:ctx.state.dog===0?B:Array(1440).fill(21),activity:M}),
 dp66DemoPeak:()=>({time:'01:00'}),dp58FreshPet:()=>false,selectedBlank:()=>false,signalQuality:()=>({valid:true}),
 scoreLabel:()=>'',rhythmData:()=>({rows:[],values:[]}),rhythmCompositeScore:()=>null,
 dpOwnerPeriodDetail:()=>'',dp66UrgentHome:()=>'',onAction:()=>{},renderModal:()=>{},render:()=>{},
 document:{getElementById:()=>null},localDate:()=>new Date(ymd+'T12:00:00Z'),iso:()=>ymd};
 ctx.window=ctx;
 vm.runInNewContext(read('assets/js/ux_v911.js'),ctx);
 const heart=ctx.dp911EventFor(ymd,'heart'),breath=ctx.dp911EventFor(ymd,'breath');
 assert(heart&&breath,'missed rolling peaks must trigger trace-level fallback');
 assert(heart.minute>=597&&heart.minute<=621);
 assert(breath.minute>=602&&breath.minute<=628);
 assert.equal(heart.level,'high');assert.equal(breath.level,'high');
 const urgent=ctx.dp66UrgentHome();
 assert.match(urgent,/心跳與呼吸同時明顯變化/);
 assert.match(urgent,/154\.0 bpm/);
 ctx.state.dog=1;
 assert.equal(ctx.dp911EventFor(ymd,'heart'),null,'healthy pet cannot inherit Leo trace');
 ctx.state.dog=2;
 assert.equal(ctx.dp911EventFor(ymd,'breath'),null,'new pet cannot inherit synthetic alerts');

 const sleepJs=read('assets/js/ux_v1052.js'),sleepCss=read('assets/css/ux_v1054.css');
 assert(sleepJs.includes("head.insertBefore(left,head.firstChild)"),'text column must be first for older first-child selectors');
 assert(sleepJs.includes("left.classList.add('dp1054-sleep-copy')"));
 assert(sleepJs.includes("side.classList.add('dp1054-sleep-meter')"));
 assert(sleepJs.includes("left.querySelectorAll(':scope > p').forEach(x=>x.remove())"),'no duplicated paragraph inside sleep title');
 assert(/grid-template-columns:minmax\(0,1fr\) 116px!important/.test(sleepCss));
 assert(/dp1054-sleep-copy[\s\S]*?grid-column:1!important/.test(sleepCss));
 assert(/dp1054-sleep-meter[\s\S]*?grid-column:2!important/.test(sleepCss));
 assert(sleepJs.includes("compositeExplanation(['heart','breath','hrv','stable'],'cardio'"));
 const source936=read('assets/js/ux_v936.js');
 assert(source936.includes("root.dp911EventFor(date,kind)"),'Home should use dated trace evidence');
 assert(source936.includes("source:'daily-score'"),'persistent-low is distinguished from a sudden event');
 assert(source936.includes("'alert-summary'"),'persistent score must open source detail');
 const homeRestorer=read('assets/js/ux_v990.js'),emptyHome=read('assets/js/ux_v935.js');
 assert(homeRestorer.includes("state.tab!=='me'"),'Me only model placement');
 assert(emptyHome.includes('${summary}${focus}${gps}'),'blank Home has no wellness model');
 assert(!read('assets/js/ux_v925.js').includes("insertAdjacentHTML('beforebegin',modelCard())"));
 const modelJs=read('assets/js/ux_v925.js'),evidenceJs=read('assets/js/ux_v1015.js');
 assert(modelJs.includes('整體健康評分來源')&&modelJs.includes('AI 推算生理年齡來源'));
 assert(modelJs.includes('查看分析來源')&&evidenceJs.includes('查看本次分析來源'));
 assert(!modelJs.includes('結合近期生理趨勢與適用的體檢紀錄'));
 assert(sleepCss.includes("summary::marker{content:''!important;}")&&sleepCss.includes('summary::after'));
 assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
 console.log('PASS V10.54 weighted composites, day-scanned observed heart/breath events, empty-new isolation, structural sleep columns and Me-only provenance.');
