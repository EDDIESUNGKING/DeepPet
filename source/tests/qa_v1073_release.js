/* V10.73: one responsive empty structure, action coverage and detail routes. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=x=>fs.readFileSync(path.join(base,x),'utf8');
const sourceNames=fs.readdirSync(path.join(base,'assets/js')).filter(x=>/^app_.*\.js$|^ux_.*\.js$/.test(x));
const allSource=sourceNames.map(x=>read('assets/js/'+x)).join('\n');

const displayedActions=[...new Set([...allSource.matchAll(/data-action="([\w-]+)"/g)].map(x=>x[1]))].sort();
// Every literal action must appear at least once beyond its own markup.
// In particular dp909-health-more used to be a clickable but dead button.
for(const action of displayedActions){
 const refs=allSource.split(action).length-1;
 assert(refs>=2||['deep-drill','deep-detail'].includes(action),`Orphan clickable action: ${action}`);
}
assert(displayedActions.length>=235,'Too many routes or modal actions disappeared');
for(const action of ['nav','deep-category','range','deep-day-step','health-detail','health-back','vet-brief','dp909-health-more','dp90-wave-back','pet-add','dp1060-more','alert-open'])
 assert(displayedActions.includes(action)||allSource.includes(`'${action}'`),`Missing route: ${action}`);

const baseContext=(state)=>{
 const context={window:null,state,document:{addEventListener(){},getElementById(){return null;},querySelector(){return null;}},
  localDate:()=>new Date('2026-11-18T12:00:00Z'),dateAdd:(d,n)=>new Date(d.getTime()+n*86400000),iso:d=>d.toISOString().slice(0,10),
  toSimplified:s=>s,vicon:(key)=>`<svg data-icon="${key}"></svg>`,
  t:key=>({deep:'Deep',health:'Health',healthCare:'Health management',food:'Food',med:'Medication',medHint:'Medicine log',vaccines:'Vaccines',vaccineHint:'Vaccine log',reports:'Exams',notes:'Notes'}[key]||key),
  bigHeader:()=>'<h1>Deep</h1>',selectedBlank:()=>state.emptyPreview,dp58FreshPet:()=>false,isFreePet:()=>state.freePet===true,
  blankDeepView:()=>'',freeCareDeepView:()=>'',blankHealthView:()=>'',freeCareHealthView:()=>'',dp924FreshHealthView:()=>'',dp58FreshEmptyTab:()=>'',blankMeView:()=>'',
  deepView:()=>'',healthView:()=>'',renderModal:()=>{},render:()=>{},onAction:()=>{},console};context.window=context;return context;
};
let scenarios=0;
for(const language of ['zht','zh','en','ja','ko'])for(const petState of ['Milo-no-reading','Lucky','Blank'])
 for(let tab=0;tab<3;tab++)for(const days of [1,7,30]){
  const state={lang:language,tab:'deep',deepType:tab,range:days,detail:null,emptyPreview:petState==='Blank',freePet:petState==='Lucky',dog:petState==='Blank'?15:petState==='Lucky'?14:0};
  const vmContext=baseContext(state);
  vm.runInNewContext(read('assets/js/ux_v1063.js'),vmContext);
  const html=vmContext.DeepPetUX1063.emptyDeep();
  assert.equal((html.match(/dp1070-empty-summary/g)||[]).length,1,`${language}/${petState}/${tab}/${days}: repeated empty cards`);
  assert.equal((html.match(/data-action="range"/g)||[]).length,3,'Range selector lost');
  assert.equal((html.match(/data-action="deep-category"/g)||[]).length,3,'Category switcher lost');
  assert(!/N\s*\/\s*A|dp1063-no-data-chart|dp1063-calendar|dp1063-na-meter/.test(html),'Legacy N/A structure remains in Deep');
  assert(html.includes('dp1073-empty-compact'),'Canonical no-data template not selected');
  scenarios++;
 }

for(const language of ['zht','zh','en','ja','ko'])for(const kind of ['heart','breath','sleep','energy']){
 const state={lang:language,tab:'deep',deepType:kind==='sleep'?1:kind==='energy'?2:0,range:1,detail:kind==='heart'||kind==='breath'?'dp90-waveform':'dp936-energy-detail',
  dp90WaveKind:kind,dp90WaveDate:'2026-11-18',deepSelectedDate:'2026-11-18',dog:15,emptyPreview:true};
 const context={...baseContext(state),LANG:Object.fromEntries(['zht','zh','en','ja','ko'].map(l=>[l,{}])),dpUsesRealMeasurements:()=>true,DeepPetSignalScoring:{getDaily:()=>[]}};
 Object.assign(context,{blankDeepView:()=>'',freeCareDeepView:()=>'',blankHealthView:()=>'',freeCareHealthView:()=>'',dp924FreshHealthView:()=>'',healthView:()=>'',deepView:()=>'',render:()=>{},onAction:()=>{},renderModal:()=>{}});
 context.window=context;
 vm.runInNewContext(read('assets/js/ux_v1064.js'),context);
 const detail=context.DeepPetUX1064.safeDetail();
 assert(detail.includes('dp1073-detail-empty'),'Detail uses an outdated screen');
 assert(detail.includes('data-action="dp90-wave-back"'),'Missing detail back navigation');
 assert(!detail.includes('N/A')&&!detail.includes('dp1064-detail-plot'),'Legacy N/A waveform rendered');
 scenarios++;
 }

const state={lang:'zh',tab:'health',detail:null,modal:null,dog:0};
const context={window:null,state,document:{getElementById:()=>null,querySelector:()=>null},
  healthView:()=>'NORMAL HEALTH',meView:()=>'SHARED ME',freeCareMeView:()=>'LEGACY FREE ME',
  dp58FreshEmptyTab:()=>'LEGACY FIRST ME',selectedBlank:()=>false,
  onAction:()=>{throw Error('Unhandled More action');},render:()=>{context.renders++;},renders:0,
  dpUpcomingCareItems:()=>['a','b','c','d','e'],dpUpcomingCareMarkup:rows=>rows.map(x=>`<button data-row="${x}">${x}</button>`).join(''),toSimplified:x=>x};
context.window=context;
vm.runInNewContext(read('assets/js/ux_v1073.js'),context);
context.onAction({dataset:{action:'dp909-health-more'}});
assert.equal(state.detail,'upcoming-all','The More button still has no destination');
assert.equal(context.renders,1,'The More button did not trigger navigation');
const all=context.healthView();
assert(all.includes('dp1073-upcoming-page')&&all.includes('data-row="e"'),'More page did not show the complete list');
assert(all.includes('data-action="health-back"'),'More page cannot return to Health');
state.detail=null;assert.equal(context.healthView(),'NORMAL HEALTH','Full reminders route hijacked ordinary Health');
state.tab='me';
assert.equal(context.freeCareMeView(),'SHARED ME','Lucky still uses a second Me structure');
assert.equal(context.dp58FreshEmptyTab(),'SHARED ME','Registered first pet still uses old Me structure');

const lastSource=read('assets/js/ux_v1064.js');
assert(!lastSource.includes('function careReport()'),'Legacy second exam-report renderer is still retained');
assert(!read('assets/js/ux_v1068.js').includes('function equalEmptyDeep()'),'Older giant N/A renderer must be removed, not merely hidden');
assert(/const value=scoreOf\(samples,key\);[\s\S]{0,180}if\(!good\(value\)\)return;/.test(read('assets/js/ux_v1068.js')),'A selected date without readings can still generate an N/A detail ring');
assert(/function detailReasons\(\)\{\s*if\(state\.tab!==.deep.\|\|!state\.detail\)return;\s*\/\/[^\n]*\n\s*\/\/[^\n]*\n\s*if\(isEmpty\(\)\)return;/m.test(read('assets/js/ux_v1068.js')),'Old detail-score injector still adds N/A to unmeasured routes');
const css=read('assets/css/ux_v1073.css');
assert(css.includes('::after{content:none!important')&&css.includes('.dp1073-detail-chevron'),'Duplicate detail chevrons not suppressed');
const build=read('build.mjs');
assert(build.indexOf("cssPaths.push('assets/css/ux_v1072.css')")<build.indexOf("cssPaths.push('assets/css/ux_v1073.css')"));
assert(build.indexOf("jsPaths.push('assets/js/ux_v1072.js')")<build.indexOf("jsPaths.push('assets/js/ux_v1073.js')"));
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log(`PASS V10.73: ${displayedActions.length} action names, ${scenarios} no-data/detail scenarios, all reminders route, one canonical Deep design`);
