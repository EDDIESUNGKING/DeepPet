/* V10.93: execute the real prevention + canonical Health modules together.
 * This catches data-state branches that a static source search cannot detect. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=x=>fs.readFileSync(path.join(root,x),'utf8');
const profile=(name='Milo')=>({name,species:'dog',breed:{en:'Shiba Inu',zh:'柴犬'},age:2,weight:9});
let dog=profile(),blank=false,real=false,score=95,entries=3;
const state={dog:0,tab:'health',detail:'',lang:'zht',emptyPreview:false,connected:false,
 foodTarget:{},devicesByPet:{},range:1};
const A={
 profileComplete:p=>!!p?.name&&!!p?.breed&&p?.age>0&&p?.weight>0,
 profileBasicsComplete:p=>!!p?.name&&!!p?.breed&&p?.age>0&&p?.weight>0,
 prevention:p=>({available:!!p.name,message:p.name?'依個體條件安排預防照護。':'尚無寵物基本資料，建立後將顯示健康建議。',
  items:p.name?Array.from({length:entries},(_,i)=>({code:'item'+i,name:'健康建議 '+i,source:'profile'})):[]}),
 diet:p=>({available:!!p?.name,targetKcal:700})
};
const env={
 window:null,state,DeepPetPersonalization941:A,DeepPetSignalScoring:{getDaily:()=>[]},
 dp67WatchItems:()=>[],dp67ClassifyBreed:()=>0,dp67WatchMain:()=>'<old-prevention/>',
 dp67HomePrevention:()=>'',dpAutoEnergy:()=>null,targetFood:()=>null,
 currentDog:()=>blank?null:dog,selectedBlank:()=>blank,dp58FreshPet:()=>false,isFreePet:()=>false,
 dpUsesRealMeasurements:()=>real,iso:()=> '2026-11-18',localDate:()=>new Date('2026-11-18'),
 onAction:()=>{},dpActivatePet:()=>true,render:()=>{},renderModal:()=>{},toast:()=>{},openModal:()=>{},
 bigHeader:()=>'<header class="view-header"><h1 class="app-title">健康管理</h1></header>',
 dpUpcomingCareItems:()=>[],dpUpcomingCareMarkup:()=>'<p class="empty-inline">尚無健康提醒</p>',
 healthView:()=>'<legacy-health/>',blankHealthView:()=>'<legacy-blank/>',
 freeCareHealthView:()=>'<legacy-free/>',dp924FreshHealthView:()=>'<legacy-fresh/>',
 dp58FreshEmptyTab:()=>'<legacy-route/>',healthDetail:()=>'<section>Details</section>',
 DeepPetHealthInsights:{report:()=>score===null?null:{score}},
 vicon:key=>'<svg data-icon="'+key+'"></svg>',
 t:key=>({health:'健康管理',med:'用藥記錄',medHint:'用藥紀錄',vaccines:'疫苗記錄',vaccineHint:'疫苗紀錄'})[key]||key,
 esc:s=>String(s),DeepPetUX1068:{isEmpty:()=>!real},
 document:{querySelector:()=>null,getElementById:()=>null,querySelectorAll:()=>[]},
 addEventListener:()=>{},setTimeout:()=>{},confirm:()=>true
};
env.window=env;
vm.runInNewContext(source('assets/js/ux_v941.js'),env,{filename:'ux_v941.js'});
assert.match(env.dp67WatchMain(),/dp941-prevention-heading/,'Actual personalized prevention renderer did not install');
vm.runInNewContext(source('assets/js/ux_v1075.js'),env,{filename:'ux_v1075.js'});
const selectors=['dp941-prevention-heading','dp1075-exam','dp-upcoming-care','dp1063-care-list'];
const care=['飲食目標','用藥記錄','疫苗記錄','驅蟲紀錄','健康總結','一鍵生成就醫就診資料','恢復情況','額外記錄'];
function validatePage(label,html,scored){
 assert.match(html,/data-layout="canonical"/,label);
 assert.equal((html.match(/dp941-prevention-heading/g)||[]).length,1,label+' must share prevention card');
 assert.match(html,/<small>個體化健康建議<\/small><h2>預防性健康管理<\/h2>/,label);
 let offset=0;for(const key of selectors){const i=html.indexOf(key,offset);assert(i>=offset,label+' has wrong section order at '+key);offset=i+key.length;}
 const management=html.indexOf('<h2 class="section-title">健康管理</h2>');
 assert(management>html.indexOf('dp-upcoming-care'),label+' management must be fourth');
 offset=management;for(const item of care){const i=html.indexOf(item,offset);assert(i>=offset,label+' missing or reordered '+item);offset=i+item.length;}
 for(const legacy of ['dp916-care-card','dp916-progress','dp67-vitals','dp67-indicator','dp67-prevent-actions','個體化預防重點','心跳狀況','呼吸狀況','心跳狀態','呼吸狀態','查看心肺詳細趨勢','查看心肺趨勢','記錄觀察變化']){
  assert(!html.includes(legacy),label+' leaked obsolete markup: '+legacy);
 }
 assert.equal((html.match(/dp1075-exam/g)||[]).length,1,label+' has duplicate exam section');
 assert.equal((html.match(/dp1063-care-list/g)||[]).length,1,label+' has duplicate management list');
 assert.equal((html.match(/data-page="notes"/g)||[]).length,1,label+' extra records duplicated');
 assert.equal((html.match(/data-page="recovery-care"/g)||[]).length,1,label+' recovery duplicated');
 assert.equal((html.match(/class="card flat care-menu"/g)||[]).length,2,label+' menu geometry differs');
 assert.equal((html.match(/class="dp1096-exam-score /g)||[]).length,1,label+' isolated exam score missing');
 assert(!html.includes('class="dp916-large-score'),'Old score-ring component returned');
 assert.equal(html.includes('dp1096-exam-dots'),scored,label+' wrong exam ring condition');
 if(scored){assert.match(html,/data-score-state="scored"/);assert.match(html,/\/100/);}
 else{assert.match(html,/data-score-state="missing"/);assert(!html.includes('/100'),label+' invented a score');}
}
const milo=env.healthView();validatePage('measured Milo',milo,true);
assert.match(milo,/dp1096-exam-score healthy/,'health score must use green ring');
assert.match(milo,/健康建議 0/);
state.dog=15;dog=profile('Lucky');score=null;real=false;entries=1;
const lucky=env.healthView();validatePage('unmeasured Lucky',lucky,false);
assert.match(lucky,/Shiba Inu/);assert.match(lucky,/700 kcal/);
assert(!lucky.includes('Milo'),'Lucky inherited Milo');
assert.equal(env.blankHealthView(),lucky);
assert.equal(env.freeCareHealthView(),lucky);
assert.equal(env.dp924FreshHealthView(),lucky);
assert.equal(env.dp58FreshEmptyTab(),lucky);
state.dog=16;state.emptyPreview=true;blank=true;dog=null;entries=0;
const empty=env.healthView();validatePage('fully blank profile',empty,false);
assert(!empty.includes('Lucky')&&!empty.includes('Shiba Inu')&&!empty.includes('700 kcal'),'blank inherited profile');
assert.match(empty,/data-action="pet-add"/);
assert.equal((empty.match(/dp941-empty-prevention/g)||[]).length,1);
state.dog=0;state.emptyPreview=false;blank=false;real=true;dog=profile('Milo');
for(const [value,color] of [[91,'healthy'],[84,'mild'],[70,'moderate'],[40,'risk']]){
 score=value;const html=env.healthView();validatePage('score '+value,html,true);
 assert.match(html,new RegExp('dp1096-exam-score '+color),'Wrong risk color '+value);
 assert.equal((html.match(/<circle cx=/g)||[]).length,54,'Exam ring must be bounded to its 54 own dots');
}
score=null;const measuredNoExam=env.healthView();validatePage('measured collar, no exam',measuredNoExam,false);
const css=source('assets/css/ux_v1092.css');
assert.match(css,/\.dp1092-exam-ring\{[\s\S]*border:0 none!important/);
const currentCss=source('assets/css/ux_v1096.css');
assert.match(currentCss,/\.dp1096-exam-dots\{[\s\S]*?width:70px!important/);
assert.match(css,/\.dp1071-no-exam-score\{[\s\S]*border:0 none!important/);
assert.match(source('assets/js/ux_v916.js'),/Never inject legacy report or plan-completion cards/);
assert(!/if\(state\.tab==='health'&&!state\.detail\)\{const reportSpot=/.test(source('assets/js/ux_v916.js')));
assert(!source('assets/js/ux_v916.js').includes('function careCard('),'legacy plan card must be removed from source');
assert(!source('assets/js/ux_v1075.js').includes('dp67-vitals'));
assert(source('build.mjs').includes("cssPaths.push('assets/css/ux_v1092.css')"));
assert.equal(source('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(source('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log('PASS V10.93: actual prevention + canonical Health; Milo, Lucky, blank, 4 exam tiers, missing-exam and legacy removal');
