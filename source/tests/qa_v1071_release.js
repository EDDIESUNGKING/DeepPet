/* DeepPet V10.73: emergency demonstration is tied to the same minute series;
 * no missing-profile events or evidence-free score-driven alarms. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const days=Array.from({length:15},(_,i)=>new Date(Date.UTC(2026,10,3+i,12)).toISOString().slice(0,10));
const pets=Array.from({length:15},(_,i)=>({name:i===3?'Leo':`Pet${i}`,age:4,weight:6}));
const state={dog:3,lang:'zht',tab:'home',detail:null,range:1,deepType:0,emptyPreview:false};
const rows=days.map((date,i)=>({date,idx:i,heart:96,breath:27,activity:0,rmssd:30}));
const scoreRows=rows.map(row=>({date:row.date,scores:{physiol:55,heart:55,breath:40,energy:35,sleep:40}}));
const sample=(date,wanted)=>{
 const values={heart:Array(1440).fill(96),breath:Array(1440).fill(27),activity:Array(1440).fill(0),rest:Array(1440).fill(80)};
 return Object.fromEntries((wanted||Object.keys(values)).map(k=>[k,values[k]]));
};
const context={window:null,state,dogs:pets,allPets:()=>pets,render:()=>{},renderModal:()=>{},console,
 document:{querySelector:()=>null,getElementById:()=>null},dpSignals:sample,
 demoRecords:()=>rows,validDaySample:()=>({valid:true}),dpUsesRealMeasurements:()=>false,
 selectedBlank:()=>state.emptyPreview,dp58FreshPet:()=>false,isFreePet:()=>false,
 iso:d=>d.toISOString().slice(0,10),localDate:()=>new Date('2026-11-17T12:00:00Z'),
 DeepPetUX1050:{scope:()=>[]},DeepPetSignalScoring:{getDaily:()=>scoreRows},toSimplified:s=>s};
context.window=context;
context.DeepPetContextAlertAlgorithm1061=require('../assets/algorithm/context-alerts-v1061.js');
for(const file of ['ux_v1061.js','ux_v1068.js','ux_v1071.js'])vm.runInNewContext(read(`assets/js/${file}`),context);
const detector=context.DeepPetContextAlertAlgorithm1061,day=days.at(-1);
let pugs=0;
const uniqueLowScenarios=new Set();
const healthyProfiles=new Set([0,1,5,9,11]);
const mediumProfiles=new Set([4,6,13]);
for(let i=0;i<15;i++){
 state.dog=i;
 const series=context.dpSignals(day,['heart','breath','activity']);
 const allChannels=context.dpSignals(day);
 assert.equal(allChannels.rest.length,1440,`Pet ${i} lost its rest timeline after emergency waveform injection`);
 assert.equal(allChannels.rest[330],80,'An acute heart/breath scenario must not overwrite sleep or rest state');
 assert.equal(context.dpSignals(day,['rest']).rest[330],80,'Rest-only consumers must see the identical original rest minute');
 const history=days.slice(0,-1).map(date=>({date,valid:true,series:context.dpSignals(date,['heart','breath','activity'])}));
 const events=detector.detect({date:day,series,history,maxPerMetric:6});
 if(healthyProfiles.has(i))assert(events.length>=1,`Stable showcase ${i} must still be able to exhibit a sudden independently detected event`);
 if(mediumProfiles.has(i))assert(events.length>=1&&events.length<=2,`Intermediate showcase ${i} needs one limited timed episode`);
 if(i===3){
  pugs=events.length;
  assert(pugs>=4,`Pug has ${pugs}, expected several distinct timestamped events`);
  assert(events.some(x=>x.kind==='heart'&&x.type==='high'));
  assert(events.some(x=>x.kind==='heart'&&x.type==='low'));
  assert(events.some(x=>x.kind==='breath'&&x.type==='high'));
  assert(events.some(x=>x.kind==='breath'&&x.type==='low'));
 }
 for(const e of events){
  assert.equal(series[e.kind][e.minute],e.value,`Pet ${i} graph does not match event`);
  const chart=context.dpSignals(day,[e.kind])[e.kind];
  assert.equal(chart[e.minute],e.value,`Pet ${i} single-metric waveform differs`);
 }
 if([2,3,7,8,10,12,14].includes(i)){
  assert(events.length>=3,`Low-score gallery pet ${i} needs source-linked variety`);
  assert(new Set(events.map(x=>x.minute)).size>=3,`Low-score gallery pet ${i} needs three separately timed events`);
  const signature=events.filter(x=>x.minute<1100).map(x=>`${x.kind}|${x.minute}|${x.value}`).join(';');
  assert(!uniqueLowScenarios.has(signature),`Low-score gallery pet ${i} reused another pet's entire emergency episode series`);
  uniqueLowScenarios.add(signature);
 }
}
assert.equal(uniqueLowScenarios.size,7);
state.emptyPreview=true;state.dog=3;
const blank=context.dpSignals(day,['heart','breath','activity']);
assert.equal(blank.heart[330],96);
assert.equal(blank.breath[520],27);
assert.equal(context.DeepPetContextAlerts1061.eligible(),false);
const css=read('assets/css/ux_v1071.css'),js=read('assets/js/ux_v1071.js'),canonical=read('assets/js/ux_v1075.js');
assert.match(canonical,/dp1071-exam-score-col|dp1071-exam-heading/);
assert.match(canonical,/data-dp916=\\?"wizard\\?"|data-dp916="wizard"/);
assert.match(js,/dpDottedSvg\(score\?\?0,color\)/);
assert.match(css,/\.dp1071-one-arrow::before.*\.dp1071-one-arrow::after/);
assert.match(css,/\.dp1071-shared-row/);
assert.match(css,/#eeeafe/);
assert.match(css,/font-weight:400!important/);
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log(`PASS V10.71: Pug ${pugs} timed events, 15-pet waveform identity, empty-owner isolation, unified health and detail design contracts`);
