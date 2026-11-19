/* V10.76 regressions: one Health route, stable fixtures, same score columns,
 * clear Deep findings and back-navigation owner isolation. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const dir=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(dir,p),'utf8');
const runtimeDir=path.resolve(dir,'..'); // Packaged binary artwork is shared at release root.
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
const app=read('index.html');
assert.match(app,/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(app,/deeppet-v10101-[a-f0-9]{12}\.css/);
assert.doesNotMatch(app,/deeppet-v1075-/);
const build=read('build.mjs');
assert.match(build,/ux_v1076\.js/);assert.match(build,/ux_v1076\.css/);
const ui=read('assets/js/ux_v1075.js'),signals=read('assets/js/ux_v1071.js');
assert.match(ui,/healthView=canonical;/);
assert.match(ui,/blankHealthView=canonical;/);
assert.match(ui,/freeCareHealthView=canonical;/);
assert.match(ui,/dp924FreshHealthView=canonical;/);
assert.match(ui,/canonicalDetail\(\)/);
assert.match(ui,/\['upcoming-all','dp1049-upcoming-all'\]\.includes\(state\.detail\)/,'Upcoming Care More must not fall into an empty generic detail');
assert.match(ui,/\['dp905-watch-all','dp70-watch'\]/,'Preventive drill-down buttons must keep their specialized routes');
assert.match(ui,/if\(!noProfile\(\)\)try\{kcal=Number\(targetFood\(\)\)/);
assert.match(signals,/dpShowcaseScenarioVersion=833/);
assert.match(signals,/dpAlertScenarioVersion='v1079-score-independent-acutes'/);
assert.doesNotMatch(signals,/dpShowcaseScenarioVersion='v1071/);
assert.doesNotMatch(read('assets/js/ux_v1068.js'),/state\.dpShowcaseScenarioVersion\s*=/);
assert.match(read('assets/js/ux_v1061.js'),/dpAlertScenarioVersion/);
const examCSS=read('assets/css/ux_v1076.css');
for(const expected of ['grid-template-rows:70px auto','grid-row:2','justify-self:center','--dp1076-ring-size','dp1068-exam-risk'])
 assert(examCSS.includes(expected),`Missing alignment constraint: ${expected}`);
assert.match(read('assets/js/ux_v1059.js'),/state\.dp919AlertReturnTab=state\.tab/);
const state={dog:2,emptyPreview:false,tab:'home',detail:null,deepType:0,range:1,deepSelectedDate:'2026-11-18',lang:'en'};
const listeners={},entries=[];
const history={state:null,replaceState(r){this.state=r;entries.push(['replace',r]);},
 pushState(r){this.state=r;entries.push(['push',r]);}};
let renderCount=0;
const context={window:null,state,history,document:{querySelectorAll:()=>[]},render(){renderCount++;},
 addEventListener(type,fn){listeners[type]=fn;},toSimplified:v=>v};
context.window=context;
vm.runInNewContext(read('assets/js/ux_v1076.js'),context);
const api=context.DeepPetUX1076;
assert.equal(api.simpleFinding(95).includes('Looking good'),true);
assert.equal(api.simpleFinding(85).includes('small change'),true);
assert.equal(api.simpleFinding(70).includes('noticeable change'),true);
assert.equal(api.simpleFinding(30).includes('contact a vet'),true);
assert.equal(api.simpleFinding(NaN).includes('Not enough data'),true);
context.render(); // initialize browser-history identity
state.tab='health';context.render();
state.detail='food';context.render();
assert.equal(entries.filter(x=>x[0]==='push').length,2);
const home=entries.find(x=>x[0]==='replace')[1];
listeners.popstate({state:home});
assert.equal(state.tab,'home');assert.equal(state.detail,null);
assert(renderCount>=4,'popstate must rerender its restored view');
const pushesBefore=entries.filter(x=>x[0]==='push').length;
state.dog=8;state.tab='health';state.detail=null;context.render();
assert.equal(entries.filter(x=>x[0]==='push').length,pushesBefore,'pet switch must not create a cross-owner browser route');
listeners.popstate({state:{deepPetRoute:{...home.deepPetRoute,tab:'deep',detail:'dp90-waveform'}}});
assert.equal(state.tab,'home');assert.equal(state.detail,null,'back into a different owner must be rejected');
assert(fs.readdirSync(path.join(runtimeDir,'assets','demo_score_portraits')).length>=15,'gallery portraits must be packaged');
assert(fs.existsSync(path.join(runtimeDir,'assets','product','deeppet-collar-bluetooth.png')));
console.log('PASS V10.76: one canonical Health entry, gallery stability, visual centerline, readable Deep hints, origin-safe return and owner-safe browser Back');
