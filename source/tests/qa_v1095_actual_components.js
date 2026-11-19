/* DeepPet V10.101: compare no-signal cards with the actual measured factories.
 * Exercises Lucky and a fully blank profile, for Day / 7 / 30 days, and
 * explicitly guards four heart + three recovery card labels and Health rings.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(dir,p),'utf8');
const text=(v)=>String(v||'');
const count=(s,re)=>(s.match(re)||[]).length;
const state={dog:15,lang:'zht',tab:'deep',deepType:0,range:1,detail:null,emptyPreview:false};
const T=(a,b,c,d,e)=>a;
const env903={window:null,state,L:T,tier:()=>'',color:()=>'',grade:n=>n===null?'資料不足':'健康',verdict:n=>n===null?'資料不足':'健康',dpDeepDottedScore:n=>`<i class="measured-ring">${n}</i>`};
env903.window=env903;
const heartSrc=read('assets/js/ux_v903.js');
const heartSlice=heartSrc.slice(heartSrc.indexOf('function scoreBlock('),heartSrc.indexOf('function dayHeart('));
assert(heartSlice.includes('function unmeasuredHeart('));
const heart=vm.runInNewContext(heartSlice+'\n({shared:window.DeepPetSharedCards903,metricCard,mainCard})',env903);
const env901={window:null,state,dpDeepDottedScore:n=>`<i class="measured-ring">${n}</i>`,scoreScheme:()=>({color:'#5e79b0'}),dpMetricUsageNotes:()=>'<p class="dp-measurement-method"></p>'};
env901.window=env901;
const energySrc=read('assets/js/ux_v901.js');
const energySlice=energySrc.slice(energySrc.indexOf('const tx='),energySrc.indexOf('function rhythmHelp('));
assert(energySlice.includes('function unmeasuredEnergy('));
const energy=vm.runInNewContext(energySlice+'\n({shared:window.DeepPetSharedCards901,metricCard})',env901);
const env905={window:null,state,T,localDate:()=>new Date('2026-11-18T12:00:00Z'),dateAdd:(d,n)=>{const v=new Date(d);v.setDate(v.getDate()+n);return v;},iso:d=>d.toISOString().slice(0,10),dayScore:()=>{throw Error('Blank calendar must not access samples');},dayGrade:()=>{throw Error('Blank calendar must not access grades');},ratingText:()=> '資料不足',metricLabel:()=> '睡眠狀態',modalWarning:()=>{throw Error('Demo disclaimer leaked');},dp911EventFor:()=>{throw Error('Blank calendar must not access events');}};
env905.window=env905;
const sleepSrc=read('assets/js/ux_v905.js');
const calendarSlice=sleepSrc.slice(sleepSrc.indexOf('function calendar('),sleepSrc.indexOf('function wavePeriod('));
const sleepSlice=sleepSrc.slice(sleepSrc.indexOf('function unmeasuredSleepPeriod('),sleepSrc.indexOf('function sleepDay('));
const sleep=vm.runInNewContext(calendarSlice+'\n'+sleepSlice+'\nwindow.DeepPetSharedCards905',env905);
// Exercise the actual second-level detail factories too. Previously these
// silently fell back to a lone "insufficient data" card when selected Blank.
env905.window.DeepPetCanonicalUI1094={unmeasured:()=>true};
env905.detailBack=label=>`<header class="dp-independent-head"><button data-action="dp905-detail-back">←</button>${label}</header>`;
env905.dateTitle=date=>date?.slice(5)||'—';
env905.e=x=>String(x??'');env905.rowFor=()=>{throw Error('Blank detail tried to read a gallery pet row');};
env905.isValid=()=>false;env905.dpSignals=()=>{throw Error('No-signal detail read a waveform');};
const secondLevel=vm.runInNewContext(sleepSrc.slice(sleepSrc.indexOf('function wavePeriod('),sleepSrc.indexOf('function sleepPeriod('))+'\n'+sleepSrc.slice(sleepSrc.indexOf('function sleepDay('),sleepSrc.indexOf('function dailyTrend('))+'\n'+sleepSrc.slice(sleepSrc.indexOf('function energyCalendarPage('),sleepSrc.indexOf('// Four-card heart analysis'))+'\n({wavePeriod,dayDetail,sleepDay,energyCalendarPage})',env905);

const cardTags=html=>[...html.matchAll(/<section class="([^"]+)(?:"|\s)/g)].map(x=>x[1].split(' ').slice(0,3).join(' '));
const expectedHeart=['heart','breath','hrv','stable'];
const expectedEnergy=['精力情況','恢復情況','放鬆與平穩度'];
for(const days of [1,7,30]){
 const h=heart.shared.unmeasuredHeart(days);
 const e=energy.shared.unmeasuredEnergy(days);
 assert.equal(count(h,/class="dp903-metric-card"/g),4,`heart count ${days}`);
 assert.deepEqual([...h.matchAll(/data-dp903-metric="(\w+)"/g)].map(x=>x[1]),expectedHeart);
 assert.deepEqual([...h.matchAll(/<h3>(心跳狀況|呼吸狀況|HRV|心搏節奏穩定度)<\/h3>/g)].map(x=>x[1]),['心跳狀況','呼吸狀況','HRV','心搏節奏穩定度']);
 assert.equal(count(e,/class="dp901-metric-card"/g),3,`energy count ${days}`);
 assert.deepEqual([...e.matchAll(/<h3>(精力情況|恢復情況|放鬆與平穩度)<\/h3>/g)].map(x=>x[1]),expectedEnergy);
 assert.doesNotMatch(h+e,/心跳情況|心跳情况|活動情況|活动情况|兩分鐘心率恢復|两分钟心率恢复/);
 // A measured card made with the same factory must retain its core class,
 // metric-specific data attribute and score-column hierarchy.
 const measuredHeart=heart.metricCard('heart',87,'measured');
 assert.deepEqual(cardTags(measuredHeart),cardTags(heart.metricCard('heart',null,'empty')));
 assert(h.includes('dp903-overview-head')&&measuredHeart.includes('dp903-score-col'));
 const measuredEnergy=energy.metricCard('精力情況',87,'measured');
 assert.deepEqual(cardTags(measuredEnergy),cardTags(energy.metricCard('精力情況',null,'empty')));
 assert(e.includes('dp901-overall-head')&&measuredEnergy.includes('dp901-score-col'));
 assert(e.includes(days===1?'data-action="dp905-energy-day-link"':'data-action="dp908-energy-period-open"'));
 assert(!/\b\d{2}\s*\/100\b/.test(h+e),'A fabricated score was rendered');
 if(days>1){
  const s=sleep.unmeasuredSleepPeriod(days);
  assert.match(s,/dp905-sleep-summary/);
  assert.match(s,/dp905-calendar-panel/);
  assert.equal(count(s,/data-action="dp905-date-open"/g),days);
  assert.equal(count(s,/data-score=""/g),days);
  assert(!s.includes('示範')&&!s.includes('模擬'));
 }
}
state.range=7;state.dp90WaveKind='heart';
const wave=secondLevel.wavePeriod();
assert(wave.includes('dp905-wave-period')&&wave.includes('dp905-period-lead')&&wave.includes('dp905-calendar-panel'));
assert.equal(count(wave,/data-action="dp905-date-open"/g),7);
const detail=secondLevel.dayDetail('heart','2026-11-18');
assert(detail.includes('dp905-overview')&&detail.includes('dp905-day-stats')&&detail.includes('dp908-inspect-chart'));
assert(!detail.includes('模拟')&&!detail.includes('示範'));
const sleepDay=secondLevel.sleepDay('2026-11-18');
assert(sleepDay.includes('dp905-sleep-day')&&sleepDay.includes('dp905-day-stats')&&sleepDay.includes('dp908-synced-sleep'));
const energyCalendar=secondLevel.energyCalendarPage();
assert(energyCalendar.includes('dp908-energy-calendar-page')&&energyCalendar.includes('dp905-energy-calendar')&&energyCalendar.includes('dp905-calendar-panel'));
assert.equal(count(energyCalendar,/data-action="dp905-date-open"/g),7);
const shell={window:null,state,t:key=>({deep:'深入分析',heartCategory:'心肺狀態',sleepCategory:'睡眠狀態',activeCategory:'精力恢復'})[key]||key,toSimplified:v=>v,vicon:(i,s)=>`<svg class="icon-${i}"></svg>`,dpDeepDottedScore:()=>'<div class="dp-status-score" data-score=""><div class="stat-inner"><b>—</b></div></div>',homeView:()=>'<div>HOME</div>',deepView:()=>'<div>MEASURED_DEEP</div>',dp58FreshHome:()=>'',freeCareHomeView:()=>'',blankHomeView:()=>'',blankDeepView:()=>'',freeCareDeepView:()=>'',dp58FreshEmptyTab:()=>'',selectedBlank:()=>state.emptyPreview,dp58FreshPet:()=>state.dog===15&&!state.emptyPreview,isFreePet:()=>false,dpUsesRealMeasurements:()=>false,bigHeader:()=>'<header></header>',deepDatePicker:()=>'<input type="date">',DeepPetSharedPage936:{render:()=>'<div>HOME</div>',virtualEmpty:()=>false},DeepPetSharedCards903:heart.shared,DeepPetSharedCards901:energy.shared,DeepPetSharedCards905:sleep};
shell.window=shell;
vm.runInNewContext(read('assets/js/ux_v1094.js'),shell);
for(const category of [0,1,2])for(const days of [1,7,30]){
 state.deepType=category;state.range=days;state.detail=null;
 const results=[];
 for(const kind of ['lucky','blank']){
  state.dog=kind==='lucky'?15:0;state.emptyPreview=kind==='blank';
  const page=shell.deepView();results.push(page);
  assert(page.includes(['dp903-overview','dp-owner-sleep','dp901-health-score'][category])||(category===1&&days>1&&page.includes('dp905-sleep-summary')));
  assert.equal(count(page,/class="tab (?:active)?"/g),3);
  assert.equal(count(page,/class="seg-btn (?:active)?"/g),3);
  assert(!page.includes('MEASURED_DEEP'));
  if(category===0)assert.equal(count(page,/class="dp903-metric-card"/g),4);
  if(category===2)assert.equal(count(page,/class="dp901-metric-card"/g),3);
 }
 assert.equal(results[0],results[1],`Lucky/Blank differ in Deep ${category}/${days}`);
}
state.dog=0;state.emptyPreview=false;state.detail=null;assert.equal(shell.deepView(),'<div>MEASURED_DEEP</div>');

// Exercise the production Health factory itself, not a duplicate test template.
const healthState={dog:0,lang:'zht',emptyPreview:false,detail:null,tab:'health'};
const healthEnv={window:null,state:healthState,healthView:()=>'',blankHealthView:()=>'',freeCareHealthView:()=>'',dp58FreshEmptyTab:()=>'',selectedBlank:()=>healthState.emptyPreview,dp58FreshPet:()=>healthState.dog===15,isFreePet:()=>false,toSimplified:v=>v,esc:x=>String(x),vicon:n=>`<svg class="icon-${n}"></svg>`,bigHeader:()=>'<header>健康管理</header>',t:k=>({health:'健康管理',med:'用藥記錄',vaccines:'疫苗記錄',medHint:'用藥提示',vaccineHint:'接種提示',notes:'額外記錄'})[k]||k,targetFood:()=>450,dp67WatchMain:()=>'<section class="card dp941-prevention"><h3>個體化健康建議</h3><h2>預防性健康管理</h2></section>',dpUpcomingCareItems:()=>[],dpUpcomingCareMarkup:()=>'<p>尚無提醒</p>',DeepPetHealthInsights:{report:()=>({score:84})}};
healthEnv.window=healthEnv;
vm.runInNewContext(read('assets/js/ux_v1075.js'),healthEnv);
for(const kind of ['measured','lucky','blank']){
 healthState.dog=kind==='measured'?0:15;healthState.emptyPreview=kind==='blank';
 const html=healthEnv.DeepPetCanonicalUI1075.canonicalHealth();
 const sectionLabels=['預防性健康管理','體檢分析','<h2 class="section-title">近期健康提醒','<h2 class="section-title">健康管理'];
 let previous=-1;for(const label of sectionLabels){const index=html.indexOf(label);assert(index>previous,`${kind} Health order: ${label}`);previous=index;}
 for(const label of ['飲食目標','用藥記錄','疫苗記錄','驅蟲紀錄','健康總結','一鍵生成就醫就診資料','恢復情況','額外記錄'])assert(html.includes(label),`${kind} Health item missing ${label}`);
 assert.equal(count(html,/class="dp1096-exam-score (?:healthy|mild|moderate|risk|none)"/g),1);
 assert.equal(count(html,/dp916-care-card/g),0,'Old care completion ring returned');
 assert.equal(count(html,/dp1096-exam-dots/g),kind==='blank'?0:1);
}
const guard=read('assets/js/ux_v1095.js');
assert(guard.includes("'.dp916-large-score,.dp-dot-meter,.dp1092-exam-ring'"));
const build=read('build.mjs');assert(build.includes("jsPaths.push('assets/js/ux_v1095.js')"));
assert(build.includes("cssPaths.push('assets/css/ux_v1095.css')"));
console.log('PASS V10.96 measured factories + no-signal drilldowns: heart x4, energy x3, sleep and wave calendars, 18 no-data pages, Health exam-only ring');
