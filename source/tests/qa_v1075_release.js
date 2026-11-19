/* V10.75: canonical layout, data provenance and independent event triage. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),source=f=>fs.readFileSync(path.join(root,f),'utf8');
const date='2026-11-18';
const evidence={window:null};evidence.window=evidence;
vm.runInNewContext(source('assets/algorithm/provenance-v1075.js'),evidence);
const data=evidence.DeepPetDataProvenance1075;
const numbers=Array(1440).fill(80);
let x=data.inspect({petId:15,date,kind:'heart',verifiedWear:true,payload:numbers});
assert.equal(x.values.length,1440);assert.equal(x.meta.coveragePct,100);assert.equal(x.meta.petId,15);
assert.equal(x.meta.identityAssurance,'bridge-request-only','legacy SDK array has no independently checked embedded pet identity');
assert.equal(data.inspect({petId:15,date,kind:'heart',verifiedWear:true,payload:{petId:15,date,kind:'heart',source:'20hz-waveform',values:numbers}}).meta.identityAssurance,'payload-verified');
assert.equal(data.get(15,date,'heart').date,date);
assert.equal(data.inspect({petId:15,date,kind:'heart',verifiedWear:false,payload:numbers}).values.length,0);
for(const [label,payload,reason] of [
 ['wrong owner',{petId:14,date,kind:'heart',source:'20hz-waveform',values:numbers},'pet-mismatch'],
 ['wrong date',{petId:15,date:'2026-11-17',kind:'heart',values:numbers},'date-mismatch'],
 ['wrong channel',{petId:15,date,kind:'breath',values:numbers},'kind-mismatch'],
 ['demo source',{petId:15,date,kind:'heart',source:'gallery-demo',values:numbers},'synthetic-source'],
 ['bad signal',{petId:15,date,kind:'heart',values:numbers,quality:{signalValid:false}},'quality-rejected'],
 ['short capture',{petId:15,date,kind:'heart',values:numbers.slice(0,720)},'minute-coverage-incomplete'],
 ]){
  const result=data.inspect({petId:15,date,kind:'heart',verifiedWear:true,payload});
  assert.equal(result.values.length,0,label);assert.equal(result.meta.reason,reason,label);
 }
assert.equal(data.get(15,date,'heart').coveragePct,50);
assert.equal(data.inspect({petId:15,date,kind:'heart',verifiedWear:true,payload:Array(1440).fill(0)}).values.length,0);
assert.equal(data.inspect({petId:15,date,kind:'restState',verifiedWear:true,payload:Array(1440).fill(0)}).values.length,1440);
data.missing(16,date,'heart');assert.equal(data.get(16,date,'heart').valid,false);

const events={window:null};events.window=events;
vm.runInNewContext(source('assets/algorithm/event-triage-v1075.js'),events);
const triage=events.DeepPetEventTriage1075;
const alerts=triage.emergencyOnly([
 {source:'daily-status',date,kind:'cardio',score:25},
 {source:'rapid',date,localSecond:3300,observations:[{kind:'heart',type:'high'}]},
 {source:'timed',date,minute:900,kind:'breath',durationClass:'sustained'},
 {source:'timed',date,minute:1100,kind:'heart',durationClass:'sudden'},
 {source:'timed',date,minute:1100,kind:'heart',durationClass:'sudden'},
 {source:'timed',date:'2026-11-17',minute:500,kind:'heart'},
 {source:'rapid',date,petId:14,localSecond:1400,observations:[{kind:'heart'}]},
 {source:'timed',date,minute:1550,kind:'heart'}
],{petId:15,date});
assert.equal(alerts.length,3);assert.deepEqual(Array.from(new Set(alerts.map(a=>a.dpEventClass))).sort(),['sudden','sustained']);
assert.equal(triage.classify({source:'daily-score'}),'health-status');
assert.equal(triage.healthPriority({date,scores:{physiol:62,cardio:55,sleep:40,activityRecovery:92}}).length,2);

// The prevention block used to read demoRecords() even for a real owner pet.
// Verify it now uses only independently wear-checked daily features.
const pState={dog:15,lang:'en'};
const pContext={window:null,state:pState,currentDog:()=>({name:'Lucky',species:'dog',breed:{en:'Pug'},age:2,weight:8}),
 dpUsesRealMeasurements:()=>true,demoRecords:()=>{throw Error('Real pets must not read gallery demo records')},
 iso:()=>date,localDate:()=>new Date('2026-11-18T12:00:00Z')};
pContext.DeepPetSignalScoring={getFeatures:()=>[...Array.from({length:7},(_,i)=>({date:`2026-11-${String(i+11).padStart(2,'0')}`,source:'20hz-waveform',quietHeartRate:80,quietBreathRate:15})),
 {date,source:'20hz-waveform',quietHeartRate:160,quietBreathRate:30}],isVerifiedWear:()=>true};
pContext.window=pContext;
vm.runInNewContext(source('assets/js/prevention.js'),pContext);
const personalized=pContext.dp67PreventionData();
assert.equal(personalized.isDemo,false);assert.equal(personalized.enough,true);
assert.equal(personalized.heart.grade,3);assert.equal(personalized.breath.grade,3);

let state={dog:0,tab:'health',detail:'',lang:'en',emptyPreview:false},scopeEmpty=false,petBlank=false,reportScore=94,realMode=false;
const env={window:null,state,healthView:()=>'<old-health/>',blankHealthView:()=>'<old-blank/>',freeCareHealthView:()=>'<old-free/>',
 healthDetail:()=>'<div class="app-pad care-record-page">one canonical detail</div>',
 dp924FreshHealthView:()=>'<old-fresh/>',dp58FreshEmptyTab:()=>'<old-fresh-route/>',selectedBlank:()=>petBlank,
 dp58FreshPet:()=>false,isFreePet:()=>false,dpUsesRealMeasurements:()=>realMode,
 dp67WatchMain:()=>'<section class="card dp941-prevention"><div class="dp941-prevention-heading"><small>Personalized guidance</small><h2>Preventive health</h2></div></section>',
 currentDog:()=>({name:'Lucky',breed:{en:'Pug'},age:2,weight:8.5}),
 bigHeader:()=>'<header class="view-header"><h1 class="app-title">Health</h1></header>',
 dpUpcomingCareItems:()=>Array.from({length:4},(_,i)=>({date, title:'care'+i})),
 dpUpcomingCareMarkup:rows=>'<div class="upcoming-count">'+rows.length+'</div>',
 targetFood:()=>630,vicon:(kind,size)=>`<svg data-icon="${kind}" width="${size}"></svg>`,
 t:key=>({health:'Health',healthCare:'Health management',med:'Medication',medHint:'Medication subtitle',vaccines:'Vaccination',vaccineHint:'Vaccination subtitle'})[key]||key,
 esc:s=>String(s),DeepPetUX1068:{isEmpty:()=>scopeEmpty},DeepPetHealthInsights:{report:()=>reportScore===null?null:{score:reportScore}}};
env.window=env;
vm.runInNewContext(source('assets/js/ux_v1075.js'),env);
const expectedKeys=['dp941-prevention','dp1075-exam','dp-upcoming-care','dp1063-care-list'];
function verifyLayout(html,calories,reportCtas=0){
 assert.match(html,/dp1075-health-page/);assert.match(html,/data-layout="canonical"/);
 assert.equal((html.match(/class="card food-feature dp1070-food dp1071-food dp1072-food"/g)||[]).length,1);
 assert.equal((html.match(/data-page="reports"/g)||[]).length,reportCtas);
 assert.equal((html.match(/data-page="recovery-care"/g)||[]).length,1);
 assert.equal((html.match(/class="health-item[^"]*" data-action="health-detail" data-page="notes"/g)||[]).length,1);
 assert.equal((html.match(/class="card flat care-menu"/g)||[]).length,2);
 assert.equal((html.match(/dp1072-uniform-care/g)||[]).length,2);
 assert(expectedKeys.every(s=>html.includes(s)));
 let offset=0;for(const s of expectedKeys){const i=html.indexOf(s,offset);assert(i>=offset,`Wrong health hierarchy: ${s}`);offset=i+1;}
 assert(html.includes(calories));
 assert(html.indexOf('data-page="med"')<html.indexOf('data-page="vaccines"'));
 assert(html.indexOf('data-page="vaccines"')<html.indexOf('data-page="deworming"'));
}
const milo=env.healthView();verifyLayout(milo,'630 kcal');assert.match(milo,/data-dp916="wizard"/);
scopeEmpty=true;state.dog=15;reportScore=null;realMode=true;
const lucky=env.healthView();verifyLayout(lucky,'630 kcal');
assert(!lucky.includes('dp67-vitals'),'real unmeasured pets must not receive obsolete vitals panels');
assert.equal(lucky,env.blankHealthView());assert.equal(lucky,env.freeCareHealthView());
assert.equal(lucky,env.dp924FreshHealthView());assert.equal(lucky,env.dp58FreshEmptyTab());
assert(lucky.includes('630 kcal'),'A complete pet profile must show its food estimate without sensor readings');
state.dog=16;state.emptyPreview=true;petBlank=true;
const blank=env.healthView();verifyLayout(blank,'No data yet',1);assert.match(blank,/data-action="pet-add"/);
assert(!blank.includes('Lucky'),'blank pet must never inherit a previous pet name in prevention');
assert(!blank.includes('data-dp916="wizard"'),'An entirely blank profile can create a report before registering a pet');
state.detail='food';assert.match(env.healthView(),/dp1076-shared-health-detail/);
state.emptyPreview=false;petBlank=false;assert.match(env.healthView(),/one canonical detail/);
for(const file of ['ux_v1070.js','ux_v1071.js','ux_v1072.js','ux_v1073.js'])assert.match(source('assets/js/'+file),/dp1075-health-page/,'A legacy normalizer still overwrites canonical Health');
assert.match(source('assets/js/app_03.js'),/DeepPetDataProvenance1075/);
assert.match(source('assets/js/ux_v1060.js'),/DeepPetEventTriage1075/);
for(const file of ['ux_v916.js','ux_v1063.js','ux_v1068.js'])assert.match(source('assets/js/'+file),/dp1075-health-page/,'An older post-render mutation still inserts a second template');
assert(!source('assets/js/ux_v916.js').includes('健康模型的第二種證據'));
assert(!source('assets/js/ux_v914.js').includes('dp914-report-eyebrow'));
assert.equal(source('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(source('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log('PASS V10.75: three pet states one Health template; owner/date/quality/coverage; timed events vs low scores');
