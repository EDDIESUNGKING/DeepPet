/* V10.74: adversarial provenance, detail routing, and no second Health design. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
const app=read('assets/js/app_03.js');
function section(from,to){const start=app.indexOf(from),end=app.indexOf(to,start+from.length);
 assert(start>=0&&end>start,`Cannot isolate ${from}`);return app.slice(start,end);}
const date='2026-11-18';
let real=false,demoCalls=0,minuteCalls=0,hasData=false,verified=false,bridgeValue=null;
const state={dog:0,dpVerifiedDaysByPet:{},inspectDate:date,inspectKind:'heart',range:1};
const owner={dpFixtureInvalidated:false,dpFreshPet:false,freeCare:false};
const context={window:null,state,dogs:Array(15).fill({}),currentDog:()=>owner,
 dpUsesRealMeasurements:()=>real,minuteDemoSeries:(kind)=>{demoCalls++;return Array(1440).fill(kind==='heart'?64:13);},
 demoRecords:()=>[{date,heart:98,breath:12,restState:1,idx:29}],nightMinuteSequence:()=>Array(960).fill(1),
 nightSlotSequence:()=>Array(32).fill('sleep'),label3:(a)=>a,minuteKindLabel:kind=>kind,
 plotMinuteChart:values=>`<svg data-first="${values[0]}" data-count="${values.length}"></svg>`,
 localDate:()=>new Date(date+'T12:00:00Z'),iso:d=>d.toISOString().slice(0,10),
 DeepPetSignalScoring:{isVerifiedWear:row=>row?.verified===true},
 DeepPetSignalBridge:{minuteSeries:()=>{minuteCalls++;return bridgeValue;}}};
context.window=context;
vm.runInNewContext(section('function dpSignals(','function dpAverage(')+'\nthis.get=dpSignals;',context);
let result=context.get(date,['heart']).heart;
assert.equal(result[0],64,'Gallery waveform was replaced with bridge data');
assert.equal(minuteCalls,0,'Gallery should not contact real bridge');
real=true;state.dog=15;
result=context.get(date,['heart']).heart;
assert.equal(result.length,0,'Owner without verified wear got a generated waveform');
assert.equal(demoCalls,1,'Owner silently called gallery waveform generator');
state.dpVerifiedDaysByPet['15']=[{date,verified:true}];
bridgeValue=null;
assert.equal(context.get(date,['heart']).heart.length,0,'Verified day without minute bridge must not invent 24h samples');
bridgeValue=Array(1440).fill(80);
assert.equal(context.get(date,['heart']).heart[0],80,'Verified minute bridge was ignored');
bridgeValue=Array(1440).fill(0);
assert.equal(context.get(date,['heart']).heart.length,0,'Flat zero heart data must not plot as a physiological value');
assert.equal(context.get(date,['breath']).breath.length,0,'Flat zero breathing data must not plot as a physiological value');
assert.equal(context.get(date,['rest']).rest.length,1440,'True resting-state zero is valid');
bridgeValue=Array(1440).fill('80');
assert.equal(context.get(date,['heart']).heart.length,0,'String-encoded minute data must be rejected until normalized by SDK');
state.dog=0;state.dpVerifiedDaysByPet['0']=[{date,verified:true}];bridgeValue=null;
assert.equal(context.get(date,['heart']).heart.length,0,'An edited gallery pet borrowed its old showcase trace');

vm.runInNewContext(section('function minuteDetailView(){','function plotMinuteChart(')+'\nthis.detail=minuteDetailView;',context);
state.dog=15;context.dpSignals=(d,k)=>({[k[0]]:hasData?Array(1440).fill(75):[]});
hasData=false;
for(const kind of ['heart','breath','activityIntensity','restState']){
 state.inspectKind=kind;
 assert.match(context.detail(),/當日尚無有效資料/,`Real ${kind} minute detail used demo data`);
}
hasData=true;
state.inspectKind='heart';
assert.match(context.detail(),/data-first="75"/,'Real minute detail failed to use actual bridge values');
assert.doesNotMatch(context.detail(),/示範序列/,'Real minute detail claims to be generated demo data');
state.inspectKind='restState';
assert.doesNotMatch(context.detail(),/sleep-matrix-wrap/,'Real rest detail borrowed the 30-minute demo night matrix');
real=false;state.dog=0;state.inspectKind='heart';
assert.match(context.detail(),/data-first="64"/,'Gallery detail lost its approved illustrative trace');

const deepContext={window:null,state:{dog:15,range:30},dpUsesRealMeasurements:()=>true,
 dayRowsWithIndex:()=>[{date,idx:0,heart:125,sleep:8}],deepDayRows:()=>[{date,idx:0,heart:125}],
 validDaySample:()=>({valid:true}),dpSignals:()=>({heart:[],breath:[],activity:[],rest:[]}),
 minuteDemoSeries:()=>{throw Error('Real deep chart called minuteDemoSeries')},nightMinuteSequence:()=>{throw Error('Real deep chart called nightMinuteSequence')},
 nightRestHours:()=>{throw Error('Real deep chart called nightRestHours')},
 windowExtra:1,minuteClock:m=>String(m),iso:()=>date,
 DeepPetSignalScoring:{getFeatures:()=>[{date,restHours:7.4,quality:{fullDayRestSupported:false}}]}};
deepContext.window=deepContext;
vm.runInNewContext(section('function deepTimePoints(','function deepCurvePath(')+'\nthis.points=deepTimePoints;',deepContext);
assert.equal(deepContext.points('heart',30).length,0,'Thirty-day chart showed stale aggregate without verified minute evidence');
assert.equal(deepContext.points('restState',30).length,0,'Rest hours without full-day quality proof were shown');
assert.equal(deepContext.points('activityIntensity',7).length,0,'Seven-day activity chart invented absent source data');
deepContext.DeepPetSignalScoring.getFeatures=()=>[{date,restHours:7.4,quality:{fullDayRestSupported:true}}];
assert.equal(deepContext.points('restState',30)[0].v,7.4,'Verified rest aggregate disappeared');

const sleepSource=read('assets/js/ux_v1071.js');
const fnStart=sleepSource.indexOf(' function briefDailySleep(){'),fnEnd=sleepSource.indexOf(' const previous=render;',fnStart);
assert(fnStart>=0&&fnEnd>fnStart);
let sleepCalls=0,realSleep=true,description='';
const display={set textContent(value){description=value;},get textContent(){return description;}};
const page={querySelector:()=>display,querySelectorAll:()=>[display]};
const sleepContext={window:null,root:null,state:{tab:'deep',detail:null,deepType:1,range:1},noData:()=>false,
 dpUsesRealMeasurements:()=>realSleep,dpNightSleepStats:()=>{sleepCalls++;return {minutes:720,wakes:9}},
 L:(tw)=>tw,document:{querySelector:()=>page}};
sleepContext.window=sleepContext;sleepContext.root={DeepPetUX1068:{scope:()=>[{row:{idx:29},scores:{sleep:55}}]}};
vm.runInNewContext(sleepSource.slice(fnStart,fnEnd)+'\nthis.brief=briefDailySleep;',sleepContext);
sleepContext.brief();
assert.equal(sleepCalls,0,'Live sleep explanation borrowed 12-hour/9-wakings gallery stats');
assert.match(description,/尚無可核對/,'Measured sleep explanation falsely asserts a cause');
realSleep=false;sleepContext.brief();
assert.equal(sleepCalls,1,'Showroom sleep explanation lost its scenario-specific reason');

const parity=read('assets/js/ux_v1072.js');
assert(parity.includes("food.className='card food-feature dp1072-food'"));
assert(parity.includes("item.className='health-item dp1071-shared-row dp1072-uniform-care'"));
const structural=read('assets/js/ux_v1073.js');
assert(structural.includes('dropAdditional(nodes,nodes[0])'));
assert(structural.includes("page.querySelectorAll('.dp1064-report-entry,.health-item[data-page=\"reports\"],.dp916-care-card')"));
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log('PASS V10.74: gallery/real source isolation, 1/7/30-day provenance, sleep evidence, shared Health cards and navigation');
