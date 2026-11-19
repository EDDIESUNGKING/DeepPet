/* V10.77: regression against historical DOM overwrite and back-route leaks. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=file=>fs.readFileSync(path.join(root,file),'utf8');
assert.equal(source('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(source('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
for(const name of ['ux_v992','ux_v993','ux_v994','ux_v995','ux_v996','ux_v997','ux_v998']){
 assert(!fs.existsSync(path.join(root,'assets/js',name+'.js')),`${name} must not remain an active/shippped alternative renderer`);
 assert(!source('build.mjs').includes(`'assets/js/${name}.js'`));
}
const v999=source('assets/js/ux_v999.js');
assert.match(v999,/function repairUpcomingMore\(main\)\{[\s\S]{0,280}main\.classList\?\.contains\('dp1075-health-page'\)/);
const v1011=source('assets/js/ux_v1011.js');
assert.match(v1011,/function preventiveCare\(app\)\{[\s\S]{0,290}app\.querySelector\('\.dp1075-health-page'\)/);
assert.doesNotMatch(v1011,/main\.innerHTML=careAllPage\(\)/);
assert.match(source('assets/js/ux_v1039.js'),/function fixHealth\(app\)[\s\S]{0,210}pad\.classList\.contains\('dp1075-health-page'\)/);
assert.match(source('assets/js/ux_v1058.js'),/function careProgress\(\)[\s\S]{0,310}querySelector\('#app \.dp1075-health-page'\)/);
const v1049=source('assets/js/ux_v1049.js');
assert.match(v1049,/if\(app\.querySelector\('\.dp1075-health-page'\)\)return/);
assert.match(v1049,/if\(action==='dp1049-upcoming-open'\)\{navTo\('health','upcoming-all'\)/);
assert.match(v1049,/DeepPetUX1073\?\.upcomingAllPage/);
assert.match(source('assets/js/ux_v1075.js'),/\['upcoming-all','dp1049-upcoming-all'\]\.includes\(state\.detail\)/);

let modalRenders=0,regularRenders=0,allowDiscard=true,forwardCount=0;
const state={dog:0,emptyPreview:false,tab:'home',detail:null,modal:'',lang:'en',deepType:0,range:1};
const events=[],listeners={};
const history={state:null,pushState(payload){this.state=payload;events.push(['push',payload]);},
 replaceState(payload){this.state=payload;events.push(['replace',payload]);},
 forward(){forwardCount++;}};
const dom={querySelectorAll(){return [];}};
const sandbox={window:null,state,history,document:dom,confirm(){return allowDiscard;},
 addEventListener(type,fn){listeners[type]=fn;},
 render(){regularRenders++;},renderModal(){modalRenders++;},
 closeModal(){state.modal='';sandbox.renderModal();},
 onAction(target){const a=target?.dataset?.action;
  if(a==='health-detail'){state.tab='health';state.detail=target.dataset.page;sandbox.render(true);}
  else if(a==='health-back'){state.detail=null;sandbox.render(true);}
  else if(a==='open-editor'){state.modal='report-edit';sandbox.renderModal();}
  else if(a==='modal-close'){sandbox.closeModal();}
  else if(a==='select-pet'){state.dog=8;state.tab='home';state.detail=null;state.modal='';sandbox.render(true);}
 },toSimplified:s=>s};
sandbox.window=sandbox;
vm.runInNewContext(source('assets/js/ux_v1076.js'),sandbox);
sandbox.render();
const initial=events[0][1];
sandbox.onAction({dataset:{action:'health-detail',page:'reports'}});
assert.equal(events.filter(x=>x[0]==='push').length,1,'forward detail navigation should push');
sandbox.onAction({dataset:{action:'health-back'}});
assert.equal(events.filter(x=>x[0]==='push').length,1,'app Back must not push a stale old route');
assert.equal(history.state.deepPetRoute.detail,null);
sandbox.onAction({dataset:{action:'open-editor'}});
assert.equal(history.state.deepPetRoute.modal,'report-edit');
assert.equal(events.filter(x=>x[0]==='push').length,2,'opening a dialog should be a Back-able state');
allowDiscard=false;
listeners.popstate({state:initial});
assert.equal(state.modal,'report-edit','cancelled discard must preserve the draft');
assert.equal(forwardCount,1,'cancelled discard should restore the current history entry');
allowDiscard=true;
listeners.popstate({state:initial});
assert.equal(state.modal,'');assert.equal(state.tab,'home');
assert(modalRenders>=2&&regularRenders>=3,'dialog and page should both be rendered correctly');
sandbox.onAction({dataset:{action:'open-editor'}});
const pushed=events.filter(x=>x[0]==='push').length;
sandbox.onAction({dataset:{action:'modal-close'}});
assert.equal(events.filter(x=>x[0]==='push').length,pushed,'closing editor must not push a new state');
assert.equal(history.state.deepPetRoute.modal,'');
const badForward={...history.state,deepPetRoute:{...history.state.deepPetRoute,modal:'report-edit'}};
listeners.popstate({state:badForward});
assert.equal(state.modal,'','old browser Forward state must not recreate an editor');
assert.equal(history.state.deepPetRoute.modal,'','old Forward state must be sanitized');
const beforeSwitch=events.filter(x=>x[0]==='push').length;
sandbox.onAction({dataset:{action:'select-pet'}});
assert.equal(events.filter(x=>x[0]==='push').length,beforeSwitch,'pet change is an identity replace');
listeners.popstate({state:initial});
assert.equal(state.dog,8);assert.equal(state.tab,'home');assert.equal(state.detail,null);
state.dpPetEpoch=2;state.dog=0;state.tab='health';state.detail='reports';sandbox.render(true);
listeners.popstate({state:initial});
assert.equal(state.dog,0);assert.equal(state.tab,'home');assert.equal(state.detail,null,
 'A pet reselected after another pet is a new visit; its old editor/detail route is invalid');
assert.match(source('assets/css/ux_v1076.css'),/dp1068-exam-risk/);
assert.match(source('assets/js/ux_v1071.js'),/dpAlertScenarioVersion='v1079-score-independent-acutes'/);
console.log('PASS V10.77: retired legacy overrides, canonical More, modal Back/Forward, unsaved-draft confirmation, same-pet and cross-pet route isolation');
