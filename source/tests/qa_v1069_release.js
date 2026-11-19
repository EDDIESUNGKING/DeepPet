/* DeepPet V10.73 — adversarial copy, owner isolation, and no-data DOM parity. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const current='2026-11-17',earlier=['2026-11-13','2026-11-14','2026-11-15','2026-11-16'];
let records=earlier.map((date,idx)=>({date,idx,heart:90,breath:21,activity:40,rmssd:32}));
records.push({date:current,idx:4,heart:152,breath:37,activity:65,rmssd:22});
const score={heart:48,breath:52,energy:30,sleep:47,recovery:55,stable:53,calm:62,hrv:57};
const state={dog:2,lang:'zht',tab:'deep',detail:null,deepType:0,range:1,emptyPreview:false};
let documentStub={querySelector:()=>null,getElementById:()=>null};
const context={window:null,state,console,document:documentStub,render:()=>{},renderModal:()=>{},
 selectedBlank:()=>state.emptyPreview,dp58FreshPet:()=>false,isFreePet:()=>false,dpUsesRealMeasurements:()=>false,
 demoRecords:()=>records,validDaySample:()=>({valid:true}),dpSignals:()=>({heart:[],breath:[],activity:[]}),
 localDate:()=>new Date('2026-11-17T12:00:00Z'),iso:d=>d.toISOString().slice(0,10),
 DeepPetUX1050:{scope:()=>records.map(row=>({row,scores:score}))},
 DeepPetContextAlerts1061:{eligible:()=>false},
 dpNightSleepStats:()=>({minutes:null,wakes:null}),
 dpOwnerRecoveryComparison:()=>({average:17,reference:null}),
 vicon:(kind)=>`[${kind}]`,toSimplified:s=>s};
context.window=context;
vm.runInNewContext(read('assets/js/ux_v1068.js'),context);
const api=context.DeepPetUX1068;
const one=[{row:records.at(-1),scores:score}];
assert.match(api.description('heart',one,1),/152 bpm/);
assert.match(api.description('heart',one,1),/高風險/);
assert.match(api.description('energy',one,1),/上升/,'High activity with a low energy score must not be called lower activity');
assert.doesNotMatch(api.description('energy',one,1),/活動強度及持續時間低於/);
assert.match(api.description('recovery',one,1),/相似活動的比較基準尚不足/);
assert.match(api.description('sleep',one,1),/缺少可核對的休息/);
records=records.slice(-2);
for(const key of ['heart','breath','hrv','energy']){
 const explanation=api.description(key,[{row:records.at(-1),scores:score}],1);
 assert(!/與較早有效日平均 \d+/.test(explanation),`${key}: invented earlier baseline`);
 assert.match(explanation,/先前有效日|歷史比較|先前記錄/,`${key}: missing baseline caveat`);
}
const healthy={...score,heart:95,calm:97};
assert.match(api.description('heart',[{row:records.at(-1),scores:healthy}],1),/尚無足夠先前有效日/);
assert.doesNotMatch(api.description('heart',[{row:records.at(-1),scores:healthy}],1),/接近個體參考範圍/);
assert.doesNotMatch(api.description('calm',[{row:records.at(-1),scores:score}],1),/偏離日常平穩模式/);
for(const lang of ['zht','zh','en','ja','ko']){
 state.lang=lang;
 for(const key of ['heart','breath','hrv','stable','sleep','energy','recovery','calm']){
  const value=api.description(key,[{row:records.at(-1),scores:score}],1);
  assert(value.length>22&&!value.includes('NaN'),`${lang} ${key}: malformed reason`);
 }
}
state.lang='zht';state.emptyPreview=true;
let section;
context.document=documentStub={querySelector:selector=>selector==='#app .dp1063-empty-deep'?{
 querySelector:part=>part==='.dp1063-empty-card'?section:null}:null,getElementById:()=>null};
for(const kind of [0,1,2])for(const range of [1,7,30]){
 state.tab='deep';state.detail=null;state.deepType=kind;state.range=range;
 section={className:'CANONICAL',innerHTML:'ONE NEUTRAL MESSAGE',nextElementSibling:null};context.render();
 assert.equal(section.innerHTML,'ONE NEUTRAL MESSAGE',`${kind}/${range}: an older Deep template overwrote the canonical screen`);
}
// A blank pet retains the old selected index; no phantom detail score is injected.
let detailHTML='';const detailPage={querySelectorAll:()=>[],querySelector:()=>null,
 append:e=>{detailHTML=e.innerHTML;}};
context.document=documentStub={querySelector:s=>s==='#app .app-pad'?detailPage:null,
 createElement:()=>({innerHTML:'',className:''}),getElementById:()=>null};
state.tab='deep';state.detail='dp90-waveform';state.dp90WaveKind='heart';state.dp90WaveDate=current;
context.render();assert.equal(detailHTML,'','Blank detail inherited a stale N/A or Coco score card');
// The blank health spotlight must not invoke a prior pet's report selector.
let normalReportCalls=0,spotlightHTML='';context.__dp914ReportSpotlight=()=>{normalReportCalls++;return 'PRIOR PET LAB';};
const fakeReport={classList:{add:()=>{}},querySelector:()=>({textContent:''})};
const fakeRoot={classList:{add:()=>{}},querySelector:s=>s==='.dp-upcoming-care'?{
 previousElementSibling:{before:()=>{}}}:null,querySelectorAll:()=>[]};
context.document=documentStub={getElementById:()=>null,
 querySelector:s=>s==='#app .app-pad'?fakeRoot:null,
 createElement:()=>({className:'',classList:{add:()=>{}},after:()=>{},
  set innerHTML(s){spotlightHTML=s;},get firstElementChild(){return fakeReport;}})};
state.tab='health';state.detail=null;context.render();
assert.equal(normalReportCalls,0,'Blank profile loaded previous pet examination records');
assert.equal(spotlightHTML,'','Retired V10.68 Health renderer must never inject its former blank exam template');
assert.match(read('assets/js/ux_v1075.js'),/if\(!noProfile\(\)\)try\{report=/,
 'Current Health report must guard the selected pet before reading examination history');
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log('PASS V10.69/73: bounded evidence copy across 5 languages, no second empty Deep template, blank detail and lab isolation');
