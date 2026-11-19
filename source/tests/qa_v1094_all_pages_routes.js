/* V10.96 all-pet parity: test real production adapters and their actions.
 * The data-rich Deep internals remain the verified source of score values;
 * all no-data identities now share the same navigation/shell/icon grammar.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(dir,p),'utf8');

const state={dog:0,lang:'zht',tab:'home',detail:null,deepType:0,range:7,emptyPreview:false};
const sources=[];const measuredMarkup='<div class="app-pad deep-themed deep-theme-heart dp-owner-deep" data-owner="Milo"></div>';
let sharedCalls=0;
const env={window:null,state,console,
 t:key=>({heartCategory:'心肺狀態',sleepCategory:'睡眠狀態',activeCategory:'精力與恢復狀態',deep:'Deep'})[key]||key,
 toSimplified:v=>v,vicon:(name,size)=>`<svg class="app-icon icon-${name}" data-size="${size}"></svg>`,
 dpDeepDottedScore:()=>'<div class="stat-bubble dp-uniform-dotted dp-status-score" data-score=""><div class="stat-inner"><b>—</b><small>/100</small></div></div>',
 homeView:()=>'<div class="app-pad home-page-v30" data-source="gallery"></div>',
 deepView:()=>measuredMarkup,blankHomeView:()=>'',freeCareHomeView:()=>'',dp58FreshHome:()=>'',
 blankDeepView:()=>'',freeCareDeepView:()=>'',dp58FreshEmptyTab:()=>'<div data-branch="old"></div>',
 selectedBlank:()=>state.emptyPreview,dp58FreshPet:()=>!state.emptyPreview&&state.dog===15,
 isFreePet:()=>!state.emptyPreview&&state.dog>15,
 dpUsesRealMeasurements:()=>false,
 deepDatePicker:()=>'<div class="deep-day-picker"><button data-action="deep-day-step" data-delta="-1">‹</button><input type="date" id="deepDayDate"><button data-action="deep-day-step" data-delta="1">›</button></div>',
 bigHeader:()=>'<header class="view-header"></header>',
 DeepPetSharedPage936:{render:tab=>{assert.equal(tab,'home');sharedCalls++;return env.homeView();},virtualEmpty:()=>false},
 DeepPetSharedCards903:{unmeasuredHeart:days=>`<section class="card dp903-overview dp903-heart" data-days="${days}">${['heart','breath','hrv','stable'].map(x=>`<section class="dp903-metric-card" data-dp903-metric="${x}"><span class="dp903-no-score">—</span></section>`).join('')}</section>`},
 DeepPetSharedCards901:{unmeasuredEnergy:days=>`<section class="card dp901-health-score" data-days="${days}">${['精力情況','恢復情況','放鬆與平穩度'].map(x=>`<section class="dp901-metric-card"><h3>${x}</h3><span class="dp90-unavailable">N/A</span></section>`).join('')}</section>`},
 DeepPetSharedCards905:{unmeasuredSleepPeriod:days=>`<section class="card dp905-sleep-summary" data-days="${days}">N/A</section><section class="card dp905-calendar-panel"><button data-action="dp905-date-open">N/A</button></section>`}};
env.window=env;
vm.runInNewContext(read('assets/js/ux_v1094.js'),env,{filename:'ux_v1094.js'});

function identity(kind){state.emptyPreview=kind==='blank';state.dog=kind==='milo'?0:kind==='lucky'?15:0;state.detail=null;}
const home=[];
for(const kind of ['milo','lucky','blank']){identity(kind);
 const output=kind==='milo'?env.homeView():kind==='lucky'?env.dp58FreshHome():env.blankHomeView();
 home.push(output);
 assert.match(output,/home-page-v30/,kind+' is using the legacy unrelated Home page');
 assert.doesNotMatch(output,/dp935-empty-home|dp931-newcomer-page|dp932-wizard/);
}
assert.deepEqual(home[1],home[0],'Lucky Home factory differs from showroom Home');
assert.deepEqual(home[2],home[0],'Blank Home factory differs from showroom Home');
assert.equal(sharedCalls,2);

const structure=x=>[...x.matchAll(/<\/?([a-z][a-z0-9-]*)\b/g)].map(m=>m[0].startsWith('</')?'/'+m[1]:m[1]);
const keyClasses=x=>[...x.matchAll(/class="([^"]+)"/g)].map(m=>m[1].replace(/\s+/g,' ').trim());
const actions=x=>[...x.matchAll(/data-action="([^"]+)"/g)].map(m=>m[1]);
let views=0;
for(const category of [0,1,2])for(const days of [1,7,30]){
 state.tab='deep';state.deepType=category;state.range=days;
 const results=[];
 for(const kind of ['lucky','blank']){identity(kind);
  const page=kind==='lucky'?env.dp58FreshEmptyTab():env.blankDeepView();
  assert.match(page,/dp1094-canonical-deep/);
  assert.match(page,/data-layout="canonical"/);
  assert.match(page,/data-measurement-state="empty"/);
  assert.doesNotMatch(page,/dp1063-empty-deep|dp943-empty-deep|dp931-empty-deep|dp1073-empty-compact/);
  assert.doesNotMatch(page,/data-action="heart-moment"|data-action="view-trend"/);
  assert.equal((page.match(/class="tab (?:active)?"/g)||[]).length,3);
  assert.equal((page.match(/class="seg-btn (?:active)?"/g)||[]).length,3);
  for(const icon of ['heart','moon','activity'])assert(page.includes('icon-'+icon),kind+' missing '+icon+' icon');
  for(const action of ['deep-category','range','deep-day-step'])assert(actions(page).includes(action),kind+' missing '+action+' route');
  assert.match(page,category===0?/dp903-metric-card/:category===1?(days===1?/dp-owner-sleep-difference/:/dp905-calendar-panel/):/dp901-metric-card/);
  assert(!/\b(?:72|80|95|96)\s*\/100\b/.test(page),'an invented score was shown');
  results.push(page);views++;
 }
 assert.deepEqual(structure(results[0]),structure(results[1]),'Lucky/Blank Deep tags differ '+category+'/'+days);
 assert.deepEqual(keyClasses(results[0]),keyClasses(results[1]),'Lucky/Blank Deep classes differ '+category+'/'+days);
 assert.deepEqual(actions(results[0]),actions(results[1]),'Lucky/Blank Deep actions differ '+category+'/'+days);
 // Shared top-level shell and icon/route taxonomy with measured Deep.
 assert(results[0].includes('deep-themed deep-theme-'));
 assert(results[0].includes('dp-owner-deep'));
 assert(results[0].includes(['dp903-overview','dp-owner-sleep','dp901-health-score'][category])||(category===1&&days>1&&results[0].includes('dp905-sleep-summary')));
}
identity('milo');state.detail=null;assert.equal(env.deepView(),measuredMarkup,'Measured Deep was replaced with placeholder');
identity('lucky');state.tab='deep';state.detail='dp90-waveform';assert.equal(env.deepView(),measuredMarkup,'Safe existing detail router was overridden');
assert(views===18);

// Release-bundle registration is part of routing: an unbundled patch is dead code.
const build=read('build.mjs');assert(build.includes("jsPaths.push('assets/js/ux_v1094.js')"));
assert(build.includes("cssPaths.push('assets/css/ux_v1094.css')"));

// Every new click target belongs to a defined existing handler contract.
const sourcesText=fs.readdirSync(path.join(dir,'assets/js')).filter(x=>x.endsWith('.js')).map(x=>read('assets/js/'+x)).join('\n');
for(const action of ['deep-category','range','deep-day-step','health-back','health-detail','vet-brief','show-summary','rhythm-detail']){
 assert(sourcesText.includes(`'${action}'`)||sourcesText.includes(`"${action}"`),`No handler reference for ${action}`);
}
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
console.log('PASS V10.96 cross-pet Home/Deep parity, 18 empty-route variants, tabs/ranges/actions/icons, measured path intact');
