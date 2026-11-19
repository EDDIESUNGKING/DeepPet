/* DeepPet V10.51: reproduce report rendering, prevent empty sleep-card half. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const old=read('assets/js/ux_v1050.js'),next=read('assets/js/ux_v1051.js');
const rows=Array.from({length:30},(_,i)=>({date:`2026-11-${String(i+1).padStart(2,'0')}`,idx:i}));
const daily=rows.map((r,i)=>({date:r.date,scores:{sleep:i>=23?29:i%2?28:32}}));
let activePage=null,activeCard=null,petCalls=0;
const reportRow={reportId:'R-LEO',date:'2026-11-30',petId:'3',name:'ALT',value:210,unit:'U/L'};
const appendable=()=>({children:[],append(node){this.children.push(node);}});
const node=(extra={})=>({textContent:'',...extra});
const document={createElement:tag=>node({tag,className:''}),
 querySelector:sel=>sel==='#app .dp921-page'?activePage:
   sel==='#app .dp905-sleep-summary'||sel==='#app .dp-owner-sleep'?activeCard:null,
 querySelectorAll:()=>[]};
const model={window:{
 DeepPetSignalScoring:{getDaily:()=>daily},
 dp914ReportRecords:dog=>dog===3?[reportRow]:[],
 DeepPetLabEvidence:{assess:(records,pet)=>{
   assert.equal(pet.petId,'3','exam score must be scoped to selected pet');
   assert.equal(pet.name,'Leo','exam profile must follow actual pet');
   return {score:18,latest:'2026-11-30',records:[
     {name:'ALT',score:12},{name:'CREA',score:18},{name:'WBC',score:28}]};
 }}},
 state:{lang:'zht',dog:3,tab:'health',detail:'dp921-report',deepType:1,range:7},
 render:()=>{},document,validDaySample:()=>({valid:true}),demoRecords:()=>rows,
 dayRowsWithIndex:days=>rows.slice(-days),deepChosenDate:()=>rows[29].date,
 dpNightSleepStats:i=>({minutes:840+i%4*10,wakes:2}),dpMinutesText:v=>`${Math.floor(v/60)}小時${v%60}分鐘`,
 currentDog:()=>{petCalls++;return {species:'dog',name:'Leo'};},
 localDate:()=>new Date('2026-11-30T12:00:00Z'),iso:d=>d.toISOString().slice(0,10)};
vm.runInNewContext(old,model);
vm.runInNewContext(next,model);
const title=node({textContent:'檢測日期：2026-11-30',inserted:null,
 querySelector:sel=>sel==='.dp921-score'?node({textContent:'18'}):null,
 insertAdjacentElement(where,child){assert.equal(where,'afterend');this.inserted=child;}});
activePage={querySelector:sel=>sel==='.dp921-details-head'?title:
 sel==='[data-dp921="edit-report"]'?{dataset:{id:'R-LEO::2026-11-30'}}:null};
// In the old release the first call throws: ReferenceError: profile is not defined.
assert.doesNotThrow(()=>model.render());
assert.match(title.inserted?.textContent||'',/體檢18分/);
assert.match(title.inserted.textContent,/ALT/);
assert.match(title.inserted.textContent,/獸醫/);
assert.equal(petCalls,1);

const copy=appendable();
const entry={dataset:{id:'R-LEO::2026-11-30'},querySelector:sel=>sel==='.dp921-report-copy'?copy:null};
activePage={querySelectorAll:sel=>sel==='.dp921-report-entry'?[entry]:[]};
model.state.detail='dp921-list';
assert.doesNotThrow(()=>model.render());
assert.match(copy.children[0]?.textContent||'',/ALT/);
assert.equal(petCalls,2);

// Moving to another pet must not reuse Leo's visible report explanation.
model.state.dog=4;
const wrongOwnerCopy=appendable();
activePage={querySelectorAll:()=>[{dataset:{id:'R-LEO::2026-11-30'},
 querySelector:()=>wrongOwnerCopy}]};
assert.doesNotThrow(()=>model.render());
assert.equal(wrongOwnerCopy.children.length,0,'do not leak another pet’s lab reason');
model.state.dog=3;

function sleepCard(days){
 const long=node({textContent:'原本的長解釋'}),sub=node({textContent:'期間重點'}),added=[];
 const head={firstElementChild:null,querySelector:sel=>sel==='.dp1048-sleep-conclusion'?long:null,
  insertAdjacentElement(where,child){assert.equal(where,'afterend');added.push(child);}};
 const card={querySelector:sel=>{
   if(sel==='.dp1048-sleep-period-head')return head;
   if(sel==='.dp905-sleep-head>div:first-child>p:not(.dp1048-sleep-conclusion)')return sub;
   if(sel==='.dp1048-sleep-conclusion')return long;
   return null;
 }};
 activeCard=card;model.state.tab='deep';model.state.detail=null;model.state.range=days;
 assert.doesNotThrow(()=>model.render());
 assert.equal(sub.textContent,'期間重點');
 assert.match(long.textContent,days===7?/近7天睡眠平均29分/:/近30天睡眠平均/);
 assert(long.textContent.length<55,'narrow column must keep a brief verdict');
 assert.equal(added.length,1,'place full explanation below the two-column heading');
 assert(added[0].textContent.length>long.textContent.length*2,'full-width block must retain real reasons');
 assert.match(added[0].textContent,/即使前後變化不大，仍是持續偏低/);
 assert.match(added[0].textContent,/獸醫/);
}
sleepCard(7);sleepCard(30);
const brief=model.window.DeepPetUX1051.conciseSleep([{scores:{sleep:31}}],1);
assert.match(brief,/今天睡眠休息31分/);
assert.match(brief,/明顯偏低/);
const langs=['en','ja','ko','zh'];
for(const lang of langs){model.state.lang=lang;const label=model.window.DeepPetUX1051.conciseSleep([{scores:{sleep:29}}],1);
 assert(label.includes('29'),`missing score for ${lang}`);assert(!/undefined|NaN/.test(label));}
assert(['DeepPet V10.51','DeepPet V10.52','DeepPet V10.53','DeepPet V10.54','DeepPet V10.55','DeepPet V10.101'].includes(read('VERSION.txt').trim()));
for(const p of ['assets/js/ux_v1051.js','assets/css/ux_v1051.css'])assert(read('build.mjs').includes(p));
assert.match(read('package_latest.mjs'),/README\.md/);
assert.match(read('package_latest.mjs'),/await media\('assets',resolve\(root,'\.\.'\)\);/,
 'archive packaging must source all gallery photos from the canonical release asset tree');
assert.match(read('package_latest.mjs'),/await media\('assets',resolve\(root,'\.\.'\)\);/,
 'new product photos must be included even when older gallery photos exist');
assert.match(read('package_latest.mjs'),/if\(retained<100\)throw Error/,
 'asset completeness should fail closed rather than deliver blank portraits');
assert(!old.includes('...profile(state.dog)'),'private profile accessor must not recur');
assert.match(read('assets/css/ux_v1051.css'),/dp1051-sleep-full-reason/);
console.log('PASS DeepPet V10.51: live report list/detail no private-scope crash, pet-owned exam notes, full-width 7/30 sleep reasons, brief low-score verdict, four-language text and build contracts.');
