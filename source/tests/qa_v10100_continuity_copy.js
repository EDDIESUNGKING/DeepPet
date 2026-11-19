/* V10.100: real sparse-day mapping, date-window parity, pet state and tour copy. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(base,name),'utf8');
const code=name=>read(`assets/js/${name}.js`);
const date='2026-11-18';
const dates=Array.from({length:30},(_,i)=>`2026-11-${String(i+1).padStart(2,'0')}`);
const calendar=dates.map(d=>({date:d,heart:91}));
const ledger=[
 {date:'2026-11-11',scores:{heart:76,sleep:70}},
 {date:'2026-11-12',scores:{heart:79,sleep:74}},
 {date:'2026-11-13',scores:{heart:82,sleep:78}},
 {date,scores:{heart:22,sleep:31}}
];

// A real pet's four measured days do not align with the thirty displayed
// calendar slots. Yesterday's score must never come from daily[calendarIndex].
const reason={state:{dog:3,lang:'zh'},window:null,
 demoRecords:()=>calendar,validDaySample:()=>({valid:true}),
 render:()=>{},document:{querySelectorAll:()=>[]},
 DeepPetSignalScoring:{getDaily:()=>ledger,getFeatures:()=>[]},
 DeepPetScoreIntegrity:{weights:{}}};
reason.window=reason;
vm.runInNewContext(code('ux_v1055'),reason);
const insight=reason.DeepPetUX1055.insight('heart',[{row:{date,idx:17},scores:{heart:22}}],1);
const persistence=insight.details.find(x=>x.title==='持續多久')?.text||'';
assert.match(persistence,/之前有效日平均 79 分/,'compare to genuinely measured earlier dates');
assert.match(persistence,/2026-11-18較低/,'historical day must be named explicitly');
reason.iso=()=> '2026-11-19';reason.localDate=()=>new Date();
reason.DeepPetSignalScoring.getFeatures=()=>[{date,source:'sdk-demo-fixture',quietHeartRate:110}];
reason.DeepPetSignalScoring.getDaily=()=>[...ledger.slice(0,-1),{
 ...ledger.at(-1),baseline:{references:{quietHeartRate:{ref:70}}}}];
const historical=reason.DeepPetUX1055.insight('heart',[{row:{date,idx:17},scores:{heart:22}}],1);
const historicalEvidence=historical.details.find(x=>x.title==='數據依據')?.text||'';
assert.match(historicalEvidence,/2026-11-18安靜時心率/);
assert.doesNotMatch(historicalEvidence,/今天安靜時心率/);

// Wave detail reason fallback has its own score lookup and must join on date.
const detailSrc=code('ux_v1058'),start=detailSrc.indexOf(' function daySamples(date){');
const end=detailSrc.indexOf(' function showReasonOnDataPage(){',start);
assert(start>0&&end>start);
const samplesContext={state:{dog:3},root:{
 DeepPetUX1050:{scope:()=>[]},DeepPetSignalScoring:{getDaily:()=>ledger}},
 demoRecords:()=>calendar,validDaySample:()=>({valid:true})};
const daySamples=vm.runInNewContext(detailSrc.slice(start,end)+'\ndaySamples',samplesContext);
assert.equal(daySamples(date)[0].scores.heart,22);
assert.equal(daySamples('2026-11-14').length,0,'unobserved days stay empty');

const cardSrc=code('ux_v1048'),cardStart=cardSrc.indexOf(' function scoreAt(');
const cardEnd=cardSrc.indexOf(' function scores(',cardStart);
assert(cardStart>0&&cardEnd>cardStart);
const scoreAt=vm.runInNewContext(cardSrc.slice(cardStart,cardEnd)+'\nscoreAt',{
 dpOwnerDayScores:()=>({sleep:99}),rhythmData:()=>null,
 state:{dog:3},dpUsesRealMeasurements:()=>true,
 valid:n=>typeof n==='number'&&n>=0&&n<=100});
assert.equal(scoreAt({date,idx:29},'sleep',ledger),31,
 'last calendar slot must resolve its actual sparse score');
assert.equal(scoreAt({date:'2026-11-15',idx:14},'sleep',ledger),null,
 'absent real measurement must not be filled by demo fallback');
assert.equal(scoreAt({date,idx:29},'sleep',[]),null,
 'an unscored owner day must not use gallery-only fallback');

// All 7/30-day score, label and completeness adapters must end on today even
// if the user previously inspected November 2 as a single historical date.
const scoreSrc=code('ux_v918');
const selectedStart=scoreSrc.indexOf('function selected(){');
const selectedEnd=scoreSrc.indexOf('function value(',selectedStart);
const anchors=[];
const shared={state:{dog:3,range:7,deepSelectedDate:'2026-11-02'},
 window:{DeepPetBCG:{calendarWindow:(all,n,end)=>{anchors.push([n,end]);return all.filter(x=>x.date<=end).slice(-n);}}},
 iso:()=>date,localDate:()=>new Date(),deepChosenDate:()=> '2026-11-02',
 api:()=>({getDaily:()=>ledger,getFeatures:()=>[]})};
const selected=vm.runInNewContext(scoreSrc.slice(selectedStart,selectedEnd)+'\nselected',shared);
assert.equal(selected().days.at(-1).date,date);
shared.state.range=30;assert.equal(selected().days.at(-1).date,date);
assert.deepEqual(anchors.map(x=>[...x]),[[7,date],[30,date]]);
shared.state.range=1;assert.equal(selected().days.length,0,
 'a selected unmeasured day must show no data, not today');

const label={window:null,state:{dog:3,range:7,deepSelectedDate:'2026-11-02',deepType:0},
 iso:()=>date,localDate:()=>new Date(),deepChosenDate:()=> '2026-11-02',
 DeepPetSignalScoring:{getDaily:()=>ledger},DeepPetBCG:{calendarWindow:(all,n,end)=>all.filter(x=>x.date<=end).slice(-n)},
 document:{querySelectorAll:()=>[]},render:()=>{}};
label.window=label;
vm.runInNewContext(code('ux_v1009'),label);
assert.equal(label.DeepPetUX1009.dateForKey('heart'),'2026-11-11 – 2026-11-18');
assert.match(code('ux_v912'),/end=range===1\?deepChosenDate\(\):iso\(localDate\(\)\)/);
assert.match(code('ux_v1007'),/const n=Number\(state\.range\),anchor=dateKey\(\)/);

// Midnight rollover only changes the automatic Today selection. A user who
// explicitly chose that same calendar day should not lose their selection.
let today='2026-11-18';
const dayCtx={window:null,state:{dog:3,tab:'deep',detail:null,range:1,
  deepSelectedDate:'2026-11-18',dp1007DayManuallyChosen:true},
 iso:()=>today,localDate:()=>new Date(),render:()=>{},
 document:{querySelectorAll:()=>[],querySelector:()=>null,visibilityState:'visible',
  activeElement:{matches:()=>false},addEventListener:()=>{}},
 DeepPetSignalScoring:{invalidate:()=>{}},addEventListener:()=>{}};
dayCtx.window=dayCtx;
vm.runInNewContext(code('ux_v1007'),dayCtx);
today='2026-11-19';dayCtx.render();
assert.equal(dayCtx.state.deepSelectedDate,'2026-11-18','manual day survives midnight');
today='2026-11-18';dayCtx.state.dp1007DayManuallyChosen=false;
// A separately initialized session checks automatic Today rollover.
const auto={...dayCtx,state:{...dayCtx.state,dp1007DayManuallyChosen:false,
 deepSelectedDate:'2026-11-18'},render:()=>{}};
auto.window=auto;
vm.runInNewContext(code('ux_v1007'),auto);
today='2026-11-19';auto.render();
assert.equal(auto.state.deepSelectedDate,'2026-11-19','automatic Today moves at midnight');

const app=code('app_03');
for(const field of ['dp1059AlertFocus','dp919AlertReturnTab','dp90WaveDate',
 'dp932WaveMinute','dp905ChosenDate','dp905WaveMode','dp1007DayManuallyChosen']){
 const reset=app.slice(app.indexOf('function dpResetPetTransient(){'),app.indexOf('function dpActivatePet('));
 assert(reset.includes(`state.${field}=`),`pet switch must clear ${field}`);
}
assert.match(app,/state\.dp1007DayManuallyChosen=true;state\.chartPoint=-1;render\(\)/);
assert.match(code('ux_v1063'),/if\(action!=='deep-select-day'\)state\.dp1007DayManuallyChosen=true/,
 'blank and Lucky date navigation must also preserve explicit selections');
assert.match(code('ux_v932'),/state\.dp1059AlertFocus=\{pet:state\.dog,date:alertDate,minute:alertMinute/);

// Preserve stages 2 and 3; verify that steps 1 and 4 make only supportable claims.
const tour=code('ux_v1037');
assert.match(tour,/不同產品的量測間隔可能從數分鐘到約半小時不等/);
assert.match(tour,/藍牙版超過 5 天，4G 版 2–3 天/);
assert.match(tour,/結合實際年齡推算 AI 生理年齡/);
assert.match(tour,/體重與年齡也用於個體化預防建議及適用體檢參考/);
assert.match(tour,/key:'scores'/);
assert.match(tour,/key:'care'/);
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log('PASS V10.100: sparse dates, period labels, midnight, pet reset, tour stages and final bundle');
