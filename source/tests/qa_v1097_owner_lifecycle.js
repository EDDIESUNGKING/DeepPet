/* V10.97: regress actual owner lifecycle and previously missed visual states. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const app=read('assets/js/app_03.js');
const ux936=read('assets/js/ux_v936.js');
const ux1094=read('assets/js/ux_v1094.js');
const moment=read('assets/js/app_04.js');

// Brand-new browser selection is genuinely blank. Newly registered pets do
// not start with an invented zero-score array or a simulated countdown.
assert.match(app,/state\.emptyPreview=firstEverLaunch\|\|awaitingFirstProfile\?true:!!state\.emptyPreview/);
assert.match(app,/hasOwnerCreatedPet=state\.petExtras\.some\(p=>p&&!p\.dpFreshDemo\)/);
assert.match(app,/state\.dpPetSelectionMade=true/);
assert.match(app,/dpFreshPet:true,freeCare:true,name,photo,publicId:dpSecureId\(\),score:null/);
assert.match(app,/score:null,[\s\S]{0,190}publicId:dpSecureId\(\),freeCare:true,dpFreshPet:true/);
assert.match(app,/function dp58Acquired\(\)\{[^\n]+simulated===true\?null/);
assert.match(moment,/const firstMeasurement=false/);
assert.doesNotMatch(moment,/firstMeasurement\?66\+/);
assert.doesNotMatch(moment,/firstMeasurement\?17\+/);
assert.match(moment,/if\(isDemo&&scoreVisible&&\(initialHR!==null\|\|initialRR!==null\)\)raf=requestAnimationFrame\(animate\)/);
assert.match(moment,/Daily summary only · no live waveform/);
const ingest=read('assets/js/ux_v912.js');
assert.match(ingest,/if\(ownerExtra\)\{ownerExtra\.dpFreshPet=false;ownerExtra\.freeCare=false;\}/);
assert.match(ingest,/if\(ownerOverride\)\{ownerOverride\.dpFreshPet=false;ownerOverride\.freeCare=false;\}/);
assert.match(ingest,/if\(index===state\.dog&&!state\.emptyPreview&&typeof render==='function'\)/,
 'accepted data must automatically refresh the current pet');
assert.match(read('assets/js/ux_v941.js'),/Number\(state\.dog\)>=15&&!\(root\.DeepPetSignalScoring\?\.getDaily/,
 'a verified owner must leave registration-only action restrictions');

// The main Home zero-task state must look identical to an unmeasured zero-task
// state: spark icon, brown focus-watch theme, the same count rail and text.
const start=app.indexOf('function focusCard(){'),end=app.indexOf('// V8.18:',start);
const focus={state:{lang:'zht'},dpAllTodayAttentionItems:()=>[],label3:zh=>zh,
 vicon:(name,size)=>`<svg data-icon="${name}" width="${size}"></svg>`};
const measuredZero=vm.runInNewContext(app.slice(start,end)+'\nfocusCard()',focus);
for(const part of ['focus-watch','dp1001-empty-todos','data-icon="spark"','focus-count','0 項','今天尚無待辦事項'])assert(measuredZero.includes(part),part);
assert(!measuredZero.includes('focus-steady'));

// A real owner pet with one verified day must graduate to the measured Deep
// factory. Previously UX936 sent every owner pet to noSignalDeep() forever.
{
 const state={dog:16,tab:'deep',detail:null,emptyPreview:false,range:7,deepType:0,lang:'zht',petOverrides:{}};
 const verified=[{date:'2026-11-18',source:'20hz-waveform',quality:{heartValid:true,respValid:true,wearValid:true,signalValid:true,timeContinuityValid:true,timeCoverage:.75,observedSeconds:64800,observedDayFraction:.75,samplingMode:'continuous'},scores:{physiol:88}}];
 const env={window:null,state,dogs:Array.from({length:15},()=>({name:'Gallery'})),
  render(){},renderModal(){},onAction(){},persist(){return true;},
  dp58FreshPet(){return false;},isFreePet(){return false;},selectedBlank(){return false;},
  dpUsesRealMeasurements(){return true;},dpSignals(){return {};},
  allPets(){return Array.from({length:17},(_,i)=>({name:`Pet ${i}`}));},
  homeView(){return '<home/>';},deepView(){return '<div data-source="measured"></div>';},
  healthView(){return '<health/>';},meView(){return '<me/>';},
  blankHomeView(){},blankDeepView(){},blankHealthView(){},blankMeView(){},
  dp58FreshHome(){},freeCareHomeView(){},freeCareDeepView(){},freeCareHealthView(){},freeCareMeView(){},
  dp924FreshHealthView(){},dp58FreshEmptyTab(){},console,
  DeepPetSignalScoring:{getDaily:()=>verified},document:{addEventListener(){},getElementById(){return null;},querySelector(){return null;}}};
 env.window=env;
 vm.runInNewContext(ux936,env);
 assert.match(env.deepView(),/data-source="measured"/,'verified owner was sent to obsolete no-data Deep layout');
 env.DeepPetSharedPage936={virtualEmpty:()=>false,render:()=>'<home/>'};
 env.deepView=()=>'<div data-source="measured"></div>';
 env.deepDatePicker=()=>'';env.vicon=()=>'';env.t=()=>'';
 env.bigHeader=()=>'';env.dp58FreshPet=()=>false;env.isFreePet=()=>false;
 vm.runInNewContext(ux1094,env);
 assert.equal(env.DeepPetCanonicalUI1094.unmeasured(),false);
 assert.match(env.deepView(),/data-source="measured"/);
 // A verified partial recording must switch page structure even if its
 // composite score is not computable yet. All older guards must agree.
 verified[0].scores={physiol:null};
 assert.match(env.deepView(),/data-source="measured"/);
 assert.equal(env.DeepPetCanonicalUI1094.unmeasured(),false);
 for(const file of ['ux_v1063.js','ux_v1064.js','ux_v1068.js']){
  const old=read('assets/js/'+file);
  assert.doesNotMatch(old,/\.some\(x=>[^\n]*scores\?\.physiol/,file+' must not require a computed composite score');
 }
 verified.length=0;
 assert.equal(env.DeepPetCanonicalUI1094.unmeasured(),true,'no-data owner must remain empty before accepted measurements');
}

// Actual Deep score components must find the pet-owned verified day by DATE,
// not by an array offset that shifts when a device has missing days.
{
 const src=read('assets/js/ux_v903.js');
 const slice=src.slice(src.indexOf('function four(row)'),src.indexOf('function scoreBlock('));
 const days=[{date:'2026-11-15',scores:{heart:31,breath:33,cardio:32,energy:41,recovery:42,calm:43,activityRecovery:42}},
  {date:'2026-11-18',scores:{heart:91,breath:92,cardio:90,energy:83,recovery:84,calm:85,activityRecovery:84}}];
 const env={state:{dog:16},window:{DeepPetSignalScoring:{getDaily:()=>days}},
  demoRecords:()=>[{date:'2026-11-18',idx:0}],dpUsesRealMeasurements:()=>true,
  dpOwnerDayScores:()=>({}),dpTodayUnifiedScores:()=>({}),console,
  avgScore:x=>Math.round(x.reduce((a,b)=>a+b,0)/x.length)};
 vm.runInNewContext(slice,env);
 assert.equal(env.four({date:'2026-11-18',idx:0}).all,90);
 assert.equal(env.three({date:'2026-11-18',idx:0}).all,84);
 assert.equal(env.four({date:'2026-11-17',idx:0}).all,null,'a missing date must stay N/A');
}

// The Health detail factory is shared; blank uses an isolated temporary pet
// and comes back to its original identity without overwriting gallery data.
{
 const state={dog:0,emptyPreview:true,detail:'med',lang:'zht'};
 let calls=0;
 const env={window:null,state,healthView(){return '<old/>';},healthDetail(){return '<div class="app-pad care-record-page"><h1>Medication</h1><button data-action="med-add">Add</button></div>';},
  blankHealthView(){},freeCareHealthView(){},dp924FreshHealthView(){},dp58FreshEmptyTab(){},
  selectedBlank(){return state.emptyPreview;},dp58FreshPet(){return false;},isFreePet(){return false;},
  t:x=>x,vicon:()=>'',dp67WatchMain:()=>'',bigHeader:()=>'',
  document:{createElement:()=>null},DeepPetSharedPage936:{render(tab){calls++;assert.equal(tab,'health');
   const old=state.emptyPreview;state.emptyPreview=false;
   try{return env.healthView();}finally{state.emptyPreview=old;}}}};
 env.window=env;
 vm.runInNewContext(read('assets/js/ux_v1075.js'),env);
 const blank=env.healthView();
 assert.match(blank,/class="app-pad care-record-page"/);
 assert.match(blank,/data-action="med-add"/);
 assert(!blank.includes('dp1073-detail-empty'));
 assert.equal(calls,1);assert.equal(state.emptyPreview,true);assert.equal(state.dog,0);
}

// A blank pet keeps exactly the same Me icon and label slots. The click
// contract redirects to profile creation without changing the button DOM.
{
 const src=read('assets/js/ux_v1000.js');
 assert(!src.includes("button.textContent=t('新增寵物'"));
 const state={emptyPreview:true,tab:'me',detail:null};const actions=[];
 const env={window:null,state,onAction:x=>actions.push(x.dataset.action),dpUsesRealMeasurements:()=>true};env.window=env;
 vm.runInNewContext(read('assets/js/ux_v1097.js'),env);
 for(const action of ['edit-pet','avatar-change','dp-friend-menu'])env.onAction({dataset:{action},closest:()=>true});
 assert.deepEqual(actions,['pet-add','pet-add','pet-add']);
}

const build=read('build.mjs');
assert(build.includes("jsPaths.push('assets/js/ux_v1097.js')"));
assert(build.includes("cssPaths.push('assets/css/ux_v1097.css')"));
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log('PASS V10.97 new owner blank → registered N/A → verified measured, shared Health/Me, zero-task style, dated score isolation');
