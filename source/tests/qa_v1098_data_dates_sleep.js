/* V10.99: reproduce sparse-date bugs, partial owner evidence and no-data sleep parity. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const rootDir=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(rootDir,file),'utf8');
const source=read('assets/js/ux_v1050.js');
const code=source.slice(source.indexOf(' const scope=days=>'),source.indexOf(' const get=(samples,key)'));
const date='2026-11-18';
const feature={date,source:'20hz-waveform',heartRate:91,breathRate:23,rmssd:47,sdnn:61};
const daily=[{date,source:'20hz-waveform',scores:{heart:93,breath:82,cardio:88,physiol:null}}];
const env={state:{dog:16},root:{DeepPetSignalScoring:{getDaily:()=>daily,getFeatures:()=>[feature]}},
 dayRowsWithIndex:()=>[{date,idx:29}],validDaySample:()=>({valid:true}),
 dpUsesRealMeasurements:()=>true,demoRecords:()=>[{date}],deepChosenDate:()=>date};
const seven=vm.runInNewContext('(function(){'+code+'\nreturn scope(7)})()',env);
assert.equal(seven.length,1,'one verified date must not disappear because its calendar index is 29');
assert.equal(seven[0].scores.heart,93);
assert.equal(seven[0].row.heart,91);
assert.equal(seven[0].row.breath,23);
assert.equal(seven[0].row.rmssd,47);
const one=vm.runInNewContext('(function(){'+code+'\nreturn scope(1)})()',env);
assert.equal(one.length,1,'the same verified day must render in Day mode');
const cardio=read('assets/js/ux_v903.js');
assert.match(cardio,/daily\?\.find\(day=>day\?\.date===row\?\.date\)/);
assert.match(cardio,/featureByDate\.get\(x\.r\.date\)\?\.rmssd/);
assert.doesNotMatch(cardio,/features\?\.\[x\.r\.idx\]/);
assert.match(source,/這段期間的記錄和自己的基準接近/);
assert.doesNotMatch(source,/四周的記錄和自己的基準接近/);
const app=read('assets/js/app_03.js');
const launchBlock=app.slice(app.indexOf('const hasOwnerCreatedPet='),app.indexOf('if(firstEverLaunch||awaitingFirstProfile){state.dog=0;state.demoGallery=true;}')+'if(firstEverLaunch||awaitingFirstProfile){state.dog=0;state.demoGallery=true;}'.length);
function selectedOnOpen(pets,selectionMade,priorBlank=false,epoch=0){
 const state={petExtras:pets,emptyPreview:priorBlank,dog:0,dpPetSelectionMade:selectionMade,dpPetEpoch:epoch};
 vm.runInNewContext('(function(){'+launchBlock+'})()',{state,firstEverLaunch:false});return state;
}
assert.equal(selectedOnOpen([{dpFreshDemo:true,name:'Lucky'}],false).emptyPreview,true,
 'saved language/settings without an owner profile must still open Blank');
assert.equal(selectedOnOpen([{dpFreshDemo:true,name:'Lucky'}],true).emptyPreview,false,
 'an explicitly chosen showroom pet must remain selected');
assert.equal(selectedOnOpen([{name:'Owner pet'}],false).emptyPreview,false,
 'a genuine saved owner profile must not be hidden by first-run logic');
assert.equal(selectedOnOpen([{dpFreshDemo:true,name:'Lucky'}],false,false,2).emptyPreview,false,
 'prior manually switched gallery sessions remain visible after upgrade');

const moment=read('assets/js/app_04.js');
const take=moment.slice(moment.indexOf('function verifiedOwnerRows('),moment.indexOf('function db(){'));
const quality={heartValid:true,respValid:true,wearValid:true,signalValid:true,timeContinuityValid:true,
 observedSeconds:43200,observedDayFraction:.5,timeCoverage:.5,samplingMode:'continuous'};
const ownerFeature={...feature,quality};
const m={window:null,state:{dog:16,emptyPreview:false},dogs:Array(15).fill({}),allPets:()=>Array(17).fill({}),
 validScore:v=>v!==null&&v!==undefined&&Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=100};
m.window=m;m.DeepPetSignalScoring={getFeatures:()=>[ownerFeature],getDaily:()=>daily};
let r=vm.runInNewContext(take+'\nverifiedOwnerRows(16)',m);
assert.equal(r.length,1,'owner readings must exist while composite wellness score is N/A');
assert.equal(r[0].score,null);
assert.equal(r[0].heart,91);
assert.equal(r[0].breath,23);
assert.equal(r[0].rmssd,47);
daily[0].scores.physiol=92;
r=vm.runInNewContext(take+'\nverifiedOwnerRows(16)',m);
assert.equal(r[0].score,92,'an eventual verified score must show on the same day');
ownerFeature.quality={...quality,wearValid:false};
assert.equal(vm.runInNewContext(take+'\nverifiedOwnerRows(16)',m).length,0,'rejected wear must stay missing');
ownerFeature.quality=quality;

const integrity=require('../assets/algorithm/score-integrity-v1.js');
const parts={heart:92,breath:98,hrv:60,stable:60,sleep:91,energy:92,recovery:94,calm:98};
const verified={date,source:'20hz-waveform',petId:'16',scores:parts,quality:{...quality,hrvValid:true,hrvProvenance:'sdk_quality_gated_metric'}};
const owner=integrity.reconcile(verified,[]);
assert.equal(owner.scores.cardio,95,'owner cardio must average only heart and breathing');
assert.equal(owner.scores.activityRecovery,95,'owner energy/recovery must average its three visible metrics');
assert.deepEqual(owner.scoreLineage.componentWeights.cardio,{heart:.5,breath:.5});
const gallery=integrity.reconcile({...verified,source:'sdk-demo-fixture',petId:'0'},[]);
assert.equal(gallery.scores.cardio,82,'gallery weighted cardio fixture stays unchanged');
assert.equal(gallery.scores.activityRecovery,94,'gallery weighted recovery fixture stays unchanged');
assert.deepEqual(gallery.scoreLineage.componentWeights.cardio,integrity.weights.cardio);
assert.equal(integrity.weights.cardio.hrv,.20);
assert.equal(integrity.weights.activityRecovery.energy,.40);

const ui=read('assets/js/ux_v1094.js');
const identity={dog:15,emptyPreview:false,tab:'deep',detail:null,deepType:1,range:1,lang:'zht'};
const web={window:null,state:identity,selectedBlank:()=>identity.emptyPreview,dp58FreshPet:()=>!identity.emptyPreview&&identity.dog===15,
 isFreePet:()=>false,dpUsesRealMeasurements:()=>false,deepView:()=>'',homeView:()=>'',
 blankHomeView:()=>'',dp58FreshHome:()=>'',freeCareHomeView:()=>'',blankDeepView:()=>'',freeCareDeepView:()=>'',
 dp58FreshEmptyTab:()=>'',DeepPetSharedPage936:{render:()=>'',virtualEmpty:()=>false},
 DeepPetSharedCards903:{unmeasuredHeart:()=>''},DeepPetSharedCards905:{unmeasuredSleepPeriod:()=>''},
 DeepPetSharedCards901:{unmeasuredEnergy:()=>''},
 t:x=>x,toSimplified:x=>x,bigHeader:()=>'',vicon:()=>'',deepDatePicker:()=>'',
 dpDeepDottedScore:()=>'<div class="dp-status-score" data-score=""><div class="stat-inner"><b>—</b></div></div>'};
web.window=web;vm.runInNewContext(ui,web);
const lucky=web.deepView();identity.emptyPreview=true;identity.dog=0;
const blank=web.deepView();
assert.equal(blank,lucky,'Lucky and completely blank profiles share the exact same Sleep DOM');
for(const classname of ['dp1048-sleep-day-head','dp1052-sleep-flow','dp1046-primary-stack','dp66-status-alert',
 'dp-owner-sleep-facts','dp-owner-sleep-difference','dp-owner-sleep-wave','dp-sleep-slot-widget'])assert(blank.includes(classname),classname);
assert.equal((blank.match(/data-action="sleep-slot"/g)||[]).length,32);
assert.match(blank,/N\/A/);
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(read('build.mjs'),/ux_v1098\.css/);
console.log('PASS V10.99: sparse verified dates, no borrowed raw HRV, partial Heart Moments, real-only averages, gallery preservation, sleep-day structural slots');
