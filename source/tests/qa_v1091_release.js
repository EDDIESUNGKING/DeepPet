/* DeepPet V10.101: final score adapter, owner profile, lab editor and safe text. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('assets/js/app_03.js');
const finalScore=read('assets/js/ux_v912.js');
const exam=read('assets/js/ux_v921.js');
const waves=read('assets/js/ux_v904.js');
const pick=(src,start,end)=>{const a=src.indexOf(start),b=src.indexOf(end,a);assert(a>=0&&b>a,`${start} / ${end}`);return src.slice(a,b);};

// The compiled UI's late V9.12 adapter replaces app_03.score. Test that
// actual replacement, not just its safe earlier implementation.
const dogs=[{name:'Milo',score:[95,95,95]},{name:'Milo',score:[20,20,20]}];
const extras=[{name:'Milo',freeCare:true},{name:'Only One'}];
const state={dog:0,petExtras:extras};
const mark=Symbol('selected');
const byIndex={0:96,1:27,2:null,3:null};
const ctx={dogs,state,Math,Number,DP_SELECTED_PET_MARK:mark,
 allPets:()=>[...dogs,...extras],
 currentDog:()=>Object.defineProperty({...([...dogs,...extras][state.dog])},mark,{value:state.dog}),
 iso:()=> '2026-11-18',localDate:()=>new Date('2026-11-18T12:00:00Z'),
 bundle:(n=state.dog)=>({scores:byIndex[n]===null?[]:[{date:'2026-11-18',scores:{physiol:byIndex[n]}}]}),score:()=>-999};
vm.createContext(ctx);
vm.runInContext(pick(finalScore,'score=function(d=currentDog())','const oldBio=currentBioAge'),ctx);
assert.equal(ctx.score(ctx.currentDog()),96);
assert.equal(ctx.score(dogs[1]),27,'showcase object receives its own score');
assert.equal(ctx.score({...dogs[1]}),null,'a detached duplicate-name clone must not receive selected pet data');
assert.equal(ctx.score({name:'Only One'}),null,'a unique display name is also not an ownership credential');
assert.equal(ctx.score({name:'Milo',score:[99,99,99]}),null,'an arbitrary display-only object cannot claim a health score');
assert.equal(ctx.score(null),null);
state.dog=1;
assert.equal(ctx.score(ctx.currentDog()),27);
assert.equal(ctx.score(dogs[0]),96);
assert.equal(ctx.score({...dogs[0]}),null);
state.dog=2;
assert.equal(ctx.score(ctx.currentDog()),null,'an unmeasured new profile has no score');
assert.equal(ctx.score(dogs[0]),96,'gallery scores remain intact');

// A newly added pet contains only its own profile and deliberately empty
// biomarkers, independent of every built-in gallery case.
const owner={name:'New Guardian Pet',species:'dog',age:3,weight:12.5,heightCm:42,bcs:5,
 breedSelected:()=>({zh:'柴犬',zht:'柴犬',en:'Shiba Inu',ko:'시바견'}),
 dpSecureId:()=> 'DP-OWNER-TEST',petAvatar:()=> 'data:image/svg+xml,test'};
vm.createContext(owner);
vm.runInContext(pick(app,"const selected=breedSelected('addPet',species);",'  state.petExtras??=[];')+'globalThis.created=d;',owner);
const created=owner.created;
for(const field of ['score','bio','hr','rr','rest','recovery','normalRecovery','target'])assert.equal(created[field],null,`${field} must not be copied from Luna`);
assert.equal(created.freeCare,true);
assert.equal(created.dpFreshPet,true);
assert.equal(created.name,'New Guardian Pet');
assert.equal(created.publicId,'DP-OWNER-TEST');
assert.equal(created.breed.en,'Shiba Inu');
assert.equal(Object.keys(created).length,21,'the new profile should have no hidden gallery-only keys');

// Validate the real examination editor's save boundary, including a single
// missing bound, a genuine numeric zero and a completely absent interval.
const alerts=[];
const ex={state:{dog:0,dpPetEpoch:0,userReportEntries:{}},root:{DeepPetLabEvidence:{matchUnit:()=>({})},DeepPetSignalScoring:{invalidate:()=>{}}},
 editor:null,editorSource:'manual',captureEditor:()=>{},validExamDate:()=>true,examNotice:x=>x,
 alert:x=>alerts.push(x),dpReportBoundsValid:null,persist:()=>true,
 profile:()=>({species:'dog'}),isDemoGallery:()=>false,
 releaseUnreferencedAttachments:()=>{},closeEditor:()=>{},showList:()=>{},loc:zh=>zh,
 Math,Number,Date,String,Object,Array,console};
vm.createContext(ex);
vm.runInContext(pick(app,'function dpReportBoundsValid(', '// V8.32: hard boundary'),ex);
vm.runInContext(pick(exam,'async function save(){captureEditor()','function deleteReport('),ex);
const fresh=(low,high)=>{ex.editor={id:null,originalDate:null,date:'2026-11-18',clinic:'Clinic',ageAtExamYears:'',weightAtExamKg:'',file:null,items:[{name:'ALT',value:'42',unit:'U/L',referenceUnit:'U/L',referenceLow:low,referenceHigh:high,status:'unknown'}]};};
(async()=>{
 fresh('', '90');await ex.save();assert.equal(alerts.at(-1),'invalidBounds');assert.equal(Object.keys(ex.state.userReportEntries).length,0);
 fresh('0', '');await ex.save();assert.equal(alerts.at(-1),'invalidBounds');assert.equal(Object.keys(ex.state.userReportEntries).length,0);
 fresh('90','0');await ex.save();assert.equal(alerts.at(-1),'invalidBounds');assert.equal(Object.keys(ex.state.userReportEntries).length,0);
 fresh('0','90');await ex.save();assert.equal(ex.state.userReportEntries['0'].length,1,'zero-bound interval must be saved');
 ex.state.userReportEntries={};fresh('','');await ex.save();assert.equal(ex.state.userReportEntries['0'].length,1,'both unspecified bounds are valid pending review');

 const safe={currentDog:()=>({name:'<img src=x onerror=alert(1)>'}),homePetStrip:()=>'',bigHeader:()=>'',t:()=>'',
  vicon:()=>'',label3:zh=>zh,esc:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')};
 vm.createContext(safe);
 vm.runInContext(pick(app,'function freeCareDeepView()','function freeCareMeView()'),safe);
 const html=safe.freeCareDeepView();
 assert.doesNotMatch(html,/<img src=x/,'pet name must be text, never injected markup');
 assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.match(waves,/<strong>\$\{esc\(currentDog\(\)\.name\)\}<\/strong>/,'waveform header must escape the pet name too');
 assert.match(app,/!Number\.isInteger\(days\)\|\|days<1\|\|days>365/,'medication duration must be whole days');
 assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
 assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
 assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.css/);
 console.log('PASS V10.93: final score identity, fresh-pet isolation, lab ranges, medication schedules and text injection');
})().catch(err=>{console.error(err);process.exitCode=1;});
