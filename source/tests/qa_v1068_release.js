/* DeepPet V10.101 — sudden events independent of healthy scores, no new-pet phantom alerts,
 * date/score-grounded reasons, and convex exam weighting. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const dates=Array.from({length:15},(_,i)=>new Date(Date.UTC(2026,10,3+i,12)).toISOString().slice(0,10));
const state={dog:0,lang:'zht',tab:'home',detail:null,deepType:0,range:1,emptyPreview:false};
 const dogs=Array.from({length:15},(_,i)=>({name:['Milo','Luna','Coco'][i]||`Pet${i}`,age:3,weight:10}));
const rows=dates.map((date,idx)=>({date,idx,heart:idx===14?145:90,breath:20,activity:idx===14?15:40,rmssd:35}));
const scoreRows=rows.map((r,i)=>({date:r.date,scores:{heart:i===14?50:94,breath:92,hrv:95,stable:95,sleep:90,energy:i===14?30:90,recovery:80,calm:85}}));
const sampleSeries=(date,wanted)=>{
 const keys=wanted||['heart','breath','activity'],values={heart:Array(1440).fill(95),breath:Array(1440).fill(20),activity:Array(1440).fill(0)};
 return Object.fromEntries(keys.map(k=>[k,values[k]]));
};
const context={window:null,state,dogs,allPets:()=>dogs,render:()=>{},renderModal:()=>{},
 document:{querySelector:()=>null,getElementById:()=>null},console,dpSignals:sampleSeries,
 demoRecords:()=>rows,validDaySample:()=>({valid:true}),dpUsesRealMeasurements:()=>false,
 selectedBlank:()=>state.emptyPreview,dp58FreshPet:()=>false,isFreePet:()=>false,
 iso:d=>d.toISOString().slice(0,10),localDate:()=>new Date('2026-11-17T12:00:00Z'),
 DeepPetUX1050:{scope:days=>days===1?[{row:rows.at(-1),scores:scoreRows.at(-1).scores}]:rows.slice(-days).map((r,j)=>({row:r,scores:scoreRows[r.idx].scores}))},
 DeepPetSignalScoring:{getDaily:()=>scoreRows},toSimplified:s=>s};
 context.window=context;
 context.DeepPetContextAlertAlgorithm1061=require('../assets/algorithm/context-alerts-v1061.js');
 vm.runInNewContext(read('assets/js/ux_v1061.js'),context);
 vm.runInNewContext(read('assets/js/ux_v1068.js'),context);
 const release=context.DeepPetUX1068,detector=context.DeepPetContextAlertAlgorithm1061;
 assert.equal(release.version,'10.68');
 for(let pet=0;pet<15;pet++){
  state.dog=pet;
  const signals=context.dpSignals(dates.at(-1),['heart','breath','activity']);
  const history=dates.slice(0,-1).map(date=>({date,valid:true,series:context.dpSignals(date,['heart','breath','activity'])}));
  const result=detector.detect({date:dates.at(-1),series:signals,history});
  assert(result.length>0,`Pet #${pet} has no measured-minute source-linked acute event, although score should not veto events`);
  const acuteHighScore=context.DeepPetContextAlerts1061.forCurrentPet(dates.at(-1),{date:dates.at(-1),source:'showroom',scores:{physiol:99,heart:99,breath:99}});
  const acuteLowScore=context.DeepPetContextAlerts1061.forCurrentPet(dates.at(-1),{date:dates.at(-1),source:'showroom',scores:{physiol:39,heart:39,breath:39}});
  assert(acuteHighScore.length>0,`High-scoring pet #${pet} must not have sudden events suppressed`);
  assert.equal(JSON.stringify(acuteHighScore),JSON.stringify(acuteLowScore),`Score alone changed acute event detection for pet #${pet}`);
  for(const event of result){
   assert.equal(signals[event.kind][event.minute],event.value,'Timed event and source graph disagree');
   assert(event.minute>=600&&event.minute<=710,'Event time must be its injected minute');
  }
 }
 state.dog=2;
 let why=release.description('heart',[{row:rows.at(-1),scores:scoreRows.at(-1).scores}],1);
 assert.match(why,/50 分|50分/,'Coco heart score 50 must appear in reason');
 assert.match(why,/145 bpm/,'Coco explanation must include source vital number');
 assert.match(why,/高風險/,'Coco high risk needs an explicit status');
 why=release.description('energy',[{row:rows.at(-1),scores:scoreRows.at(-1).scores}],1);
 assert.match(why,/30 分|30分/,'Energy score 30 has explicit reasons');
 assert.match(why,/活動強度|活動指數|活动强度/,'Energy score must discuss measured activity basis');
 why=release.description('heart',rows.slice(-7).map(r=>({row:r,scores:scoreRows[r.idx].scores})),7);
 assert.match(why,/最近7天/,'Weekly conclusion must be period-aware');
 state.emptyPreview=true;assert.equal(release.showroom(),false);
 assert.equal(context.dpSignals(dates.at(-1),['heart','activity']).heart[605],95,'Blank must not inherit showroom sudden reading');
 state.emptyPreview=false;state.dog=15;assert.equal(release.showroom(),false);
 assert.equal(context.dpSignals(dates.at(-1),['heart','activity']).heart[605],95,'New owner must not inherit showroom event');
 const lab=require('../assets/algorithm/lab-evidence-v2.js');
 const profile={id:'Coco',petId:'Coco',species:'dog',age:4,weight:10};
 const record=(name,score,date='2026-11-07')=>({name,value:score,unit:'mg/dL',date,
  reportId:'nov7',petId:'Coco',referenceLow:10,referenceHigh:20,referenceUnit:'mg/dL',referenceSource:'clinic',ageAtExamYears:4,weightAtExamKg:10});
 // Exercise actual scored report rows; the total must be a convex weighted
 // mean of visible domains even with a severe individual finding.
 const assessed=lab.assess([record('CREA',23),record('ALT',37),record('GLU',17),record('WBC',41)],profile,'2026-11-17');
 assert(Number.isFinite(assessed.score),'Report fixture must have an assessable total');
 const domains=assessed.domains.filter(d=>Number.isFinite(d.score)).map(d=>d.score);
 assert(assessed.score>=Math.min(...domains)&&assessed.score<=Math.max(...domains),`Overall ${assessed.score} outside domain range ${domains}`);
 assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
 assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
 assert(read('assets/js/ux_v1068.js').includes('dp1068-exam-risk'));
 console.log('PASS V10.68: 15 gallery pets have source-linked events independent of score, no new/blank leakage, explanation and lab bounds');
