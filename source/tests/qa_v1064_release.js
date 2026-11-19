/* DeepPet V10.73: independent no-data details, module parity, copy audit. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const patch=read('assets/js/ux_v1064.js'),css=read('assets/css/ux_v1064.css');
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.css/);
assert(patch.includes('source===\'20hz-waveform\'')&&patch.includes('wearValid===true')&&patch.includes('signalValid===true'));
assert(patch.includes('startsWith(t(\'careToday\'))'));
assert(!patch.includes('function careReport()')&&!patch.includes('dp1064-empty-reports'),'Legacy second exam-report insertion must be removed');
assert(css.includes('.dp1064-height-only>div')&&css.includes('.dp1064-method'));

function fixture(lang,blank,fresh=false){
 const state={lang,tab:'deep',deepType:0,detail:'dp90-waveform',dog:20,emptyPreview:blank,dp90WaveKind:'breath',dp90WaveDate:'2026-11-16'};
 const root={window:null,state,LANG:Object.fromEntries(['zht','zh','en','ja','ko'].map(l=>[l,{}])),
  document:{getElementById:()=>null,querySelector:()=>null},
  localDate:()=>new Date('2026-11-17T12:00:00Z'),iso:d=>d.toISOString().slice(0,10),
  toSimplified:s=>s,selectedBlank:()=>blank,dp58FreshPet:()=>fresh,isFreePet:()=>false,
  dpUsesRealMeasurements:()=>true,DeepPetSignalScoring:{getDaily:()=>[]},
  t:k=>({food:'Food Target',health:'Health',healthCare:'Care management',med:'Medication',vaccines:'Vaccines',reports:'Reports',notes:'Notes',careToday:'Today to-do'}[k]||k),
  blankDeepView:()=>'OLD BLANK PAGE',freeCareDeepView:()=>'OLD FREE PAGE',dp58FreshEmptyTab:()=>'OLD FRESH PAGE',deepView:()=>'OLD DATA WAVEFORM',
  blankHealthView:()=>'OLD BLANK HEALTH',freeCareHealthView:()=>'OLD FREE HEALTH',dp924FreshHealthView:()=>'OLD FRESH HEALTH',healthView:()=>'OLD DATA HEALTH',healthDetail:()=>'CURRENT DATA HEALTH',
  renderModal:()=>{},onAction:()=>{},render:()=>{},vicon:()=>'<svg/>',console};root.window=root;
 vm.runInNewContext(patch,root,{filename:'ux_v1064.js'});
 // V10.76 removes this former Health detail fork and installs one shared view.
 vm.runInNewContext(read('assets/js/ux_v1075.js'),root,{filename:'ux_v1075.js'});
 return root;
}
for(const lang of ['zht','zh','en','ja','ko']){
 const ctx=fixture(lang,true),s=ctx.state;
 const deep=ctx.blankDeepView();
 assert(!deep.includes('N/A')&&!deep.includes('OLD DATA WAVEFORM')&&deep.includes('dp1073-detail-empty'),'Blank detail leaked an obsolete N/A chart');
 assert(deep.includes('2026-11-16')&&!deep.includes('/100'),'Wrong date or unavailable score');
 assert(ctx.DeepPetUX1064.unmeasured(),'Blank profile must be unmeasured');
 s.tab='health';s.detail='med';
 const care=ctx.blankHealthView();
 assert(!care.includes('N/A')&&care.includes('data-action="pet-add"')&&care.includes('dp1076-shared-health-detail')&&!care.includes('OLD BLANK HEALTH'),'Blank Health detail reused legacy screen');
 const labels=ctx.LANG[lang];
 assert(labels.heartCategory&&labels.sleepCategory&&labels.activeCategory,`Missing ${lang} category labels`);
}
const fresh=fixture('zht',false,true);
assert(fresh.deepView().includes('dp1073-detail-empty')&&!fresh.deepView().includes('OLD DATA WAVEFORM'));
assert(fresh.dp58FreshEmptyTab().includes('dp1073-detail-empty'));
fresh.state.tab='health';fresh.state.detail='notes';
assert.equal(fresh.dp924FreshHealthView(),'CURRENT DATA HEALTH','Named first-time pet should reach normal Health detail instead of the obsolete onboarding page');
const gallery=fixture('en',false,false);gallery.dpUsesRealMeasurements=()=>false;
assert.equal(gallery.deepView(),'OLD DATA WAVEFORM',"Gallery's intentionally seeded show-and-tell data should remain available");
console.log('PASS V10.64: five-language labels, no-data Deep/Health detail isolation, owner routes, redundant copy and module wiring.');
