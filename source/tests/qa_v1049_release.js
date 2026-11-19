/* DeepPet V10.49: grade each stored veterinary test, preserve missing-data
 * safety and owner isolation; route reminders without expanding inline. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const lab=require('../assets/algorithm/lab-evidence-v2.js');
const fixture=src('assets/algorithm/exam-fixtures-v920.js');
const script=src('assets/js/ux_v1049.js');
const css=src('assets/css/ux_v1049.css');

const actual={state:{lang:'zht',dog:4,tab:'deep',range:1,detail:null},
 window:{DeepPetLabEvidence:lab},render:()=>{},
 dpDeepIssueHeader:()=>'',healthDetail:()=>'',onAction:()=>{},
 vetReportContent:()=>'',dpTodayUnifiedScores:()=>({heart:96}),
 selectedBlank:()=>false,isFreePet:()=>false,dp58FreshPet:()=>false,
 demoRecords:()=>[{date:'2026-11-16'}],validDaySample:()=>({valid:true}),
 dpOwnerExplanation:()=> '心肺狀態相對平穩，請結合整天走勢觀察。',
 vicon:()=>'',dpUpcomingCareItems:()=>[],dpUpcomingCareMarkup:()=>'',
 document:{getElementById:()=>null,querySelectorAll:()=>[]}};
vm.runInNewContext(script,actual);
const grading=actual.window.DeepPetUX1049.gradeLab;
const profile={species:'dog',petId:'4',age:5,weight:19};
const sample=(value,limits={},status='unknown')=>({name:'ALT',value,
 unit:'U/L',status,date:'2026-11-15',petId:'4',referenceLow:10,referenceHigh:100,
 referenceUnit:'U/L',referenceSpecies:'dog',...limits});
assert.equal(grading(sample(40),profile).label,'健康');
assert.equal(grading(sample(40),profile).category,'healthy');
const riskScores=[
 {value:104,category:'mild',label:'輕風險'},
 {value:115,category:'moderate',label:'中風險'},
 {value:135,category:'risk',label:'重風險'}
];
for(const {value,category,label} of riskScores){
 const actualGrade=grading(sample(value),profile);
 // The evidence engine's exact numeric score, not a hard-coded laboratory
 // threshold, determines which one of the four user-facing tiers appears.
 assert.equal(actualGrade.category,actualGrade.score>=90?'healthy':actualGrade.score>=80?'mild':actualGrade.score>=60?'moderate':'risk');
 assert.equal(actualGrade.category,category);
 assert.equal(actualGrade.label,label);
}
assert.equal(grading(sample(40,{referenceSpecies:'cat'}),profile).category,'pending',
  'a dog must not be graded using an explicitly feline reference');
assert.equal(grading(sample(40,{unit:'unsupported'}),profile).category,'pending');
assert.equal(grading(sample('',{referenceLow:null,referenceHigh:null}),profile).category,'pending');
assert.equal(grading(sample(130,{status:'normal'}),profile).category,'pending',
  'contradictory normal flag and out-of-range number must not be silently declared healthy');
assert.equal(grading(sample(40,{petId:'12'}),profile).category,'pending',
  'another pet’s saved result must not be assigned to Poppy');

// The actual synthetic fixture ships unknown status labels alongside valid,
// complete numeric references. Those MUST become assessable grades in reports.
const fx={window:{DeepPetExamFixture:null},allPets:()=>Array.from({length:15},()=>({species:'dog'}))};
vm.runInNewContext(fixture,fx);
const illustrative=fx.window.DeepPetExamFixture.enrich({name:'ALT',value:'38',unit:'U/L',status:'normal'},4,'2026-11-15',0);
assert.equal(illustrative.status,'unknown');
assert.notEqual(grading({...illustrative,petId:'4'},profile).category,'pending',
  'real reference intervals in Poppy showcase records must not all read pending');

// Positive observation card is displayed ONLY if no alert already exists.
const card=actual.dpDeepIssueHeader(0);
assert.match(card,/今日觀察與建議/);
assert.match(card,/96\/100/);
assert.match(script,/if\(index!==0\|\|original\|\|state\.detail/,
  'do not duplicate existing alert cards');

const navigation=[];
actual.navTo=(tab,detail)=>navigation.push([tab,detail||null]);
actual.onAction({dataset:{action:'dp1049-upcoming-open'}});
actual.onAction({dataset:{action:'dp1049-upcoming-back'}});
assert.deepEqual(navigation,[['health','upcoming-all'],['health',null]],
  'open and back are distinct routed pages');
actual.state.tab='health';actual.state.detail='dp1049-upcoming-all';
actual.dpUpcomingCareItems=()=>[{date:'2026-11-20',title:'疫苗'},{date:'2026-11-27',title:'回診'}];
actual.dpUpcomingCareMarkup=items=>items.map(x=>`<p>${x.date} ${x.title}</p>`).join('');
actual.window.DeepPetUX1073={upcomingAllPage:()=>`<div class="dp1073-upcoming-page">${actual.dpUpcomingCareMarkup(actual.dpUpcomingCareItems())}</div>`};
const fullPage=actual.healthDetail();
assert.match(fullPage,/dp1073-upcoming-page/);
assert.match(fullPage,/2026-11-20/);
assert.match(fullPage,/2026-11-27/);

assert.match(script,/state\.detail!=='dp1049-upcoming-all'/);
assert.match(script,/navTo\('health','upcoming-all'\)/);
assert.match(script,/navTo\('health'\)/);
assert.match(script,/old\.replaceWith\(button\)/);
assert.match(script,/button\.textContent='More'/);
assert.match(script,/root\.DeepPetLabEvidence/);
assert.match(script,/engine\?\.item\?\.\(x,profile,x\.date\)/);
assert.match(script,/vetReportContent=function\(d\)/);
assert.match(css,/\.dp1049-upcoming-more/);
assert.match(css,/dp1049-lab-healthy/);
assert.match(css,/dp1049-lab-risk/);
assert(['DeepPet V10.49','DeepPet V10.50','DeepPet V10.51','DeepPet V10.52','DeepPet V10.53','DeepPet V10.54','DeepPet V10.55','DeepPet V10.101'].includes(src('VERSION.txt').trim()));
assert.match(src('build.mjs'),/jsPaths\.push\('assets\/js\/ux_v1049\.js'\)/);
assert.match(src('build.mjs'),/cssPaths\.push\('assets\/css\/ux_v1049\.css'\)/);
assert.match(src('package_latest.mjs'),/README\.md/);
console.log('PASS DeepPet V10.49: healthy/low/moderate/high result scores, real Poppy lab references, unassessable and owner mismatch gates, neutral heart note, full-list More navigation and build version.');
