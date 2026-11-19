/* V10.75 regression: preserve low-score insights, never turn them into urgent events. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(base,name),'utf8');
const callbacks=[];
const state={dog:7,tab:'home',lang:'zht',emptyPreview:false,deepType:0,range:7};
const today='2026-11-17';
const mkScores=(cardio,sleep,activityRecovery,valid=true)=>({date:today,source:'sdk-demo-fixture',
 scores:{physiol:Math.round((cardio+sleep+activityRecovery)/3),cardio,sleep,activityRecovery},
 integrity:{realEvidenceValid:valid}});
const rows={7:mkScores(35,48,23),6:mkScores(70,78,83),0:mkScores(96,94,93)};
const children=[];
const fakeNode=()=>({className:'',dataset:{},innerHTML:'',textContent:'',append(){},remove(){},
 setAttribute(){},querySelector(){return null;}});
const panel={dataset:{},querySelectorAll:()=>[],querySelector:()=>null,append(node){children.push(node);}};
const document={addEventListener:(kind,fn,capture)=>callbacks.push({kind,fn,capture}),
 querySelector:()=>panel,createElement:()=>fakeNode()};
const ctx={window:null,state,document,render:()=>{},iso:()=>today,localDate:()=>({}),
 dpUsesRealMeasurements:()=>false,dp58FreshPet:()=>false,isFreePet:()=>false,selectedBlank:()=>false,
 DeepPetAlertEvidence936:{detectEvents:()=>[]},
 DeepPetSignalScoring:{getDaily:pet=>rows[pet]?[rows[pet]]:[]},
 DeepPetUX1059:{gallerySignal:()=>null,combineCoincident:input=>input,
  alertMarkup:e=>`<button data-action="dp1059-alert-open">${e.kind}</button>`}};
ctx.window=ctx;
vm.runInNewContext(read('assets/algorithm/event-triage-v1075.js'),ctx);
vm.runInNewContext(read('assets/js/ux_v1060.js'),ctx);
const api=ctx.DeepPetUX1060;assert.equal(api.version,'10.75-event-only');
assert.equal(api.scoreAlerts,undefined,'obsolete low-score emergency API is removed');
const priority=ctx.DeepPetEventTriage1075.healthPriority;
const mochi=priority(rows[7],{petId:7,date:today});
assert.equal(mochi.length,3);assert.deepEqual(Array.from(mochi,x=>[x.kind,x.score]),
 [['activityRecovery',23],['cardio',35],['sleep',48]]);
assert(mochi.every(x=>x.category==='health-status'&&x.urgent===false&&!('minute'in x)));
assert.equal(priority(rows[6],{date:today}).length,2,'Miso health insights still identify two low categories');
assert.deepEqual(Array.from(priority(rows[6],{date:today}),x=>x.score),[70,78]);
assert.equal(priority(rows[0],{date:today}).length,0);
assert.equal(priority(rows[7],{date:'2026-11-16'}).length,0);
assert.equal(priority({...rows[7],source:'20hz-waveform',integrity:{realEvidenceValid:false}},{date:today}).length,0);
assert.equal(priority({date:today,scores:{physiol:null,cardio:12}}).length,0);
assert.equal(priority(mkScores(79.5,80,100)).length,0,'rounded threshold consistent with score UI');
ctx.render();
assert.match(children.at(-1).textContent,/目前沒有需要關注的變化/);
assert.doesNotMatch(children.at(-1).innerHTML,/偏低|dp1060-score-open/);
state.dog=6;ctx.render();assert.match(children.at(-1).textContent,/目前沒有需要關注的變化/);
assert.doesNotMatch(children.at(-1).innerHTML,/偏低|dp1060-score-open/);
state.dog=7;
ctx.DeepPetAlertEvidence936.detectEvents=()=>[570,690,820,950].map((minute,i)=>({date:today,minute,kind:i%2?'breath':'heart',value:i%2?36:160.3,type:'high',relative:.7}));
ctx.render();assert.equal(children.at(-2).innerHTML.match(/data-action=/g).length,3,'home shows only first three');
assert.equal(children.at(-1).textContent,'More');
const click=callbacks.find(x=>x.kind==='click');assert(click?.capture);
let stopped=0;
const moreBtn={dataset:{action:'dp1060-more'}};
click.fn({target:{closest:()=>moreBtn},preventDefault(){},stopImmediatePropagation(){stopped++;}});
assert.equal(children.at(-2).innerHTML.match(/data-action=/g).length,4,'More expands four independently timed events');
assert.doesNotMatch(children.at(-2).innerHTML,/偏低|dp1060-score-open/,'low scores remain outside urgent events');
assert.equal(children.at(-1).textContent,'收起');
state.dog=6;ctx.DeepPetAlertEvidence936.detectEvents=()=>[];ctx.render();
assert.match(children.at(-1).textContent,/目前沒有需要關注的變化/,'pet switch resets expanded emergency list');
assert.equal(stopped,1);
state.tab='home';state.emptyPreview=true;ctx.render();assert.match(children.at(-1).textContent,/尚無有效量測/);
assert.equal(priority(null).length,0);
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
assert(!read('assets/css/ux_v1060.css').includes('.dp1060-score-critical'),'obsolete low-score urgent styles must be removed');
console.log('PASS V10.75 low health scores separated from urgent events; four timed cases, More, pet isolation, empty and invalid-data guards.');
