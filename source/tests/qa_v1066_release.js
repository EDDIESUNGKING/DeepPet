/* DeepPet V10.73: alert evidence integrity, local seconds and 30-day lookup. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.join(__dirname,'..'),source=p=>fs.readFileSync(path.join(base,p),'utf8');
const petId='milo-verified-test',epoch=Date.UTC(2026,10,17,9,31,35);
const state={dog:0,lang:'zht',tab:'home',detail:null,range:7,deepType:0,
 emptyPreview:false,dpRapidEventsByPet:{}};
const ctx={window:null,state,persist:()=>{},render:()=>{},dpCurrentPetId:()=>petId,
 selectedBlank:()=>false,dp58FreshPet:()=>false,isFreePet:()=>false,
 iso:d=>d.toISOString().slice(0,10),localDate:()=>new Date(Date.UTC(2026,10,17,12)),
 document:{getElementById:()=>null,querySelector:()=>null},console};ctx.window=ctx;
for(const f of ['ux_v1062.js','ux_v1065.js','ux_v1066.js'])
 vm.runInNewContext(source('assets/js/'+f),ctx);
function sample(seconds=0,kind='heart',backDays=0){
 const at=epoch+seconds*1000-backDays*86400000;
 const displayed=new Date(at+480*60000);
 const localSecond=displayed.getUTCHours()*3600+displayed.getUTCMinutes()*60+displayed.getUTCSeconds();
 const observation={kind,type:'high',value:kind==='heart'?145:40,
  baseline:kind==='heart'?80:20,threshold:kind==='heart'?116:34};
 const evidence=Array.from({length:6},(_,i)=>({at:at-5000+i*1000,
  heart:145,breath:40}));
 return {source:'verified_second_stream',verifiedRate:true,petId,date:displayed.toISOString().slice(0,10),
  localSecond,at,timezoneOffsetMinutes:480,context:'rest',observations:[observation],evidence,
  phase:'personalized_14day',secondsConfirmed:6};
}
const event=sample();
assert.equal(ctx.DeepPetUrgentEvents1062.capture(event),true);
assert.equal(ctx.DeepPetUrgentEvents1062.capture({...sample(8,'breath'),observations:[
 {...sample(8,'breath').observations[0]}]}),true);
assert.equal(state.dpRapidEventsByPet[petId].length,2,'Distinct seconds are not collapsed into one incident');
assert.equal(state.dpRapidEventsByPet[petId][0].localSecond,17*3600+31*60+43);
assert.equal(ctx.DeepPetUrgentEvents1062.capture(sample(8,'heart')),true);
assert.equal(state.dpRapidEventsByPet[petId].length,2,'Same-second independent channels merge');
assert.equal(state.dpRapidEventsByPet[petId][0].observations.length,2);
const badSample=sample(10,'heart');badSample.evidence.at(-1).heart=null;
assert.equal(ctx.DeepPetUrgentEvents1062.capture(badSample),false,'Missing measured channel is not proof of a detected value');
assert.equal(ctx.DeepPetUrgentEvents1062.capture({...sample(10),evidence:undefined}),false,
 'No evidence means no newly published urgent incident');
assert.equal(ctx.DeepPetUrgentEvents1062.capture({...sample(10),localSecond:17*3600+31*60+46}),false,
 'Native date/time and epoch disagreement is refused');
assert.equal(ctx.DeepPetUrgentEvents1062.capture({...sample(10),timezoneOffsetMinutes:0}),false,
 'Wrong timezone cannot silently shift event position');
const chart=ctx.DeepPetUX1065.chartMarkup(event,'heart');
assert.match(chart,/2026-11-17 17:31:30/,'Accessible graphic has the owner-local full start time');
assert.match(chart,/>17:31:35<\/text>/,'Visible x-axis matches true local detection instant');
assert.match(chart,/>時間<\/text>/,'Horizontal axis indicates time, not physiological units');
assert.match(chart,/心率 \(bpm\)/,'Vertical physiological unit is explicit');
assert.match(chart,/dp1065-event-halo/,'Circle marks the actual measured triggering sample');
assert(source('assets/js/ux_v1059.js').includes('const measured=verifiedSecond?null:gallerySignal(k,date,minute)'),
 'Second-stamped SDK values cannot be overwritten with showroom minute readings');
assert.equal(ctx.DeepPetUrgentEvents1062.capture(sample(0,'heart',20)),true);
assert.equal(ctx.DeepPetUX1066.historyForCurrentPet(7).length,2,
 'Weekly history excludes old events and keeps different observed seconds');
assert.equal(ctx.DeepPetUX1066.historyForCurrentPet(30).length,3,
 'Thirty-day history includes older verified source evidence');
const list=ctx.DeepPetUX1066.historyMarkup(ctx.DeepPetUX1066.historyForCurrentPet(7),7);
assert.match(list,/突發變化紀錄/);assert.match(list,/2026-11-17 17:31:43/);
assert(!list.includes('2026-10-28'),'Collapsed weekly details cannot leak older incidents');
ctx.dpCurrentPetId=()=> 'unrelated-owner';
assert.equal(ctx.DeepPetUX1066.historyForCurrentPet(30).length,0,'History is strictly pet/owner isolated');
ctx.dpCurrentPetId=()=>petId;ctx.selectedBlank=()=>true;
assert.equal(ctx.DeepPetUX1066.historyForCurrentPet(30).length,0,'Blank profile shows no prior pet evidence');
assert.equal(source('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(source('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
assert(source('assets/js/deeppet-v10101-'+source('index.html').match(/deeppet-v10101-([a-f0-9]{12})\.js/)[1]+'.js')
 .includes('DeepPetUX1066'),'Compiled standalone app includes latest audit layer');
console.log('PASS V10.66: no 8s event conflation; timezone and sensor integrity; real local axes; 7/30-day pet-isolated history');
