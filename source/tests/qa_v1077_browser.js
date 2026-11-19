/* Browser-level smoke and geometry QA for V10.77, no external services. */
// Run on a workstation with permission to start Chromium:
// DEEPPET_BROWSER_QA=1 node tests/qa_v1077_browser.js
// This build workspace rejects browser process sockets (EPERM). Treat that
// as "not executed", never as proof of visual parity.
if(process.env.DEEPPET_BROWSER_QA!=='1'){
 console.log('SKIP V10.77 BROWSER: opt-in only; run on a workstation with browser permissions');
 process.exit(0);
}
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const issues=[];
 page.on('pageerror',error=>issues.push(error.message));
 const target=pathToFileURL(path.join(__dirname,'..','index.html')).href;
 await page.goto(target,{waitUntil:'load'});
 await page.waitForTimeout(500);
 const ready=await page.evaluate(()=>({render:typeof render,state:typeof state,loaded:!!document.querySelector('.app-main'),intro:!!document.getElementById('dp-intro-root')}));
 assert.equal(ready.render,'function',`App render failed: ${JSON.stringify(ready)}; errors=${issues.join(' | ')}`);
 await page.evaluate(()=>{document.getElementById('dp-intro-root')?.remove();document.body.classList.remove('dp-intro-active');});
 const luckyIndex=await page.evaluate(()=>allPets().findIndex(p=>p?.dpFreshDemo===true));
 assert(luckyIndex>=15,'Lucky must be a named, registered but unmeasured pet');
 const examples=[['Milo',0,false],['Lucky',luckyIndex,false],['Empty',luckyIndex,true]];
 const audits=[];
 for(const [name,index,blank] of examples){
  const meta=await page.evaluate(({index,blank})=>{
   state.lang='zht';state.dog=index;state.tab='health';state.detail=null;state.emptyPreview=blank;
   if(typeof render==='function')render(true);
   const root=document.querySelector('#app'),food=root.querySelector('.dp1072-food');
   const care=key=>root.querySelector(`.dp1072-uniform-care[data-page="${key}"]`);
   const geo=node=>{if(!node)return null;const box=node.getBoundingClientRect(),css=getComputedStyle(node);return {width:Math.round(box.width),height:Math.round(box.height),bg:css.backgroundColor,font:css.fontSize,html:node.innerHTML.slice(0,120)};};
   const circle=root.querySelector('.dp1075-exam .dp916-large-score'),risk=root.querySelector('.dp1075-exam .dp1071-exam-status');
   const mid=x=>x?x.getBoundingClientRect().left+x.getBoundingClientRect().width/2:null;
   return {food:geo(food),recovery:geo(care('recovery-care')),notes:geo(care('notes')),
    scoreOffset:circle&&risk?Math.round(mid(circle)-mid(risk)):null,
    prevention:root.querySelector('.dp941-prevention')?.innerText||'',
    preventionStructure:root.querySelector('.dp941-prevention')?.className||'',
    smallHeading:root.querySelector('.dp941-prevention-heading small')?.innerText||'',
    largeHeading:root.querySelector('.dp941-prevention-heading h2')?.innerText||'',
    oldHealthCount:root.querySelectorAll('.dp916-care-card,.dp67-vitals,.dp67-indicator,.dp67-prevent-actions').length,
    scoredExamRing:!!root.querySelector('.dp1075-exam .dp1092-exam-ring'),
    missingExam:!!root.querySelector('.dp1075-exam [data-score-state="missing"]'),
    foodText:food?.innerText||'',reports:root.querySelectorAll('.health-item[data-page="reports"],.dp1064-report-entry').length,
    exams:root.querySelectorAll('.dp1070-exam').length,
    headings:[...root.querySelectorAll('h1,h2')].map(x=>x.innerText).slice(0,12)};
  },{index,blank});
  audits.push({name,...meta});
  assert(meta.food,`${name} missing shared yellow food card`);
  assert(meta.recovery&&meta.notes,`${name} missing shared recovery/notes card`);
  assert(meta.preventionStructure.includes('dp941-prevention'),`${name} is routed to the old prevention template`);
  assert.equal(meta.smallHeading,'個體化健康建議',`${name} has the wrong prevention subheading`);
  assert.equal(meta.largeHeading,'預防性健康管理',`${name} has the wrong prevention headline`);
  assert.equal(meta.oldHealthCount,0,`${name} still renders legacy progress/vitals`);
  assert(meta.scoredExamRing!==meta.missingExam,`${name} exam ring does not match the scored/missing state`);
  assert.equal(meta.scoreOffset,0,`${name} exam risk status is not centered under its score`);
  assert.equal(meta.reports,0,`${name} retained an obsolete duplicate report menu`);
 }
 assert(audits.find(x=>x.name==='Empty').prevention.includes('建立'),'Blank pet must retain the canonical no-profile guidance');
 const reminder=await page.evaluate(()=>{
  const original=dpUpcomingCareItems;
  try{
   dpUpcomingCareItems=()=>Array.from({length:5},(_,i)=>({date:'2026-11-'+String(i+19).padStart(2,'0'),page:'med',icon:'med',title:'Care '+i,detail:'Scheduled'}));
   state.dog=0;state.emptyPreview=false;state.tab='health';state.detail=null;render(true);
   const app=document.querySelector('#app');
   const canonical=app.querySelector('.dp1075-health-more'),legacy=app.querySelector('.dp999-more,.dp1049-upcoming-more');
   canonical?.click();
   const route=state.detail,all=app.querySelector('.dp1073-upcoming-page'),count=all?.querySelectorAll('.dp-upcoming-action').length||0;
   app.querySelector('.dp1073-upcoming-page .back-btn')?.click();
   return {button:!!canonical,legacy:!!legacy,route,count,returned:state.tab==='health'&&!state.detail};
  }finally{dpUpcomingCareItems=original;}
 });
 assert(reminder.button&&!reminder.legacy&&reminder.route==='upcoming-all'&&reminder.count===5&&reminder.returned,
  `Canonical upcoming-care More/back navigation failed: ${JSON.stringify(reminder)}`);
 for(const key of ['food','recovery','notes']){
  const values=audits.map(x=>x[key]);
  assert.equal(new Set(values.map(x=>x.height)).size,1,`Health ${key} row heights differ across pets`);
  assert.equal(new Set(values.map(x=>x.bg)).size,1,`Health ${key} backgrounds differ across pets`);
 }
 for(const [name,index,blank] of examples){
  for(const type of [0,1,2])for(const days of [1,7,30]){
   const checks=await page.evaluate(({index,blank,type,days})=>{
    state.dog=index;state.emptyPreview=blank;state.tab='deep';state.detail=null;state.deepType=type;state.range=days;render(true);
    const root=document.querySelector('#app');
    return {category:root.querySelectorAll('[data-action="deep-category"]').length,
     ranges:root.querySelectorAll('[data-action="range"]').length,
     empty:root.querySelectorAll('.dp1073-empty-compact').length,
     na:root.querySelectorAll('.dp1068-na-metric,.dp1063-na-meter,.dp1063-calendar').length,
     summary:root.innerText.slice(0,150)};
   },{index,blank,type,days});
   assert(checks.category>=3,`${name}/${type}/${days} category tabs missing`);
   assert(checks.ranges>=3,`${name}/${type}/${days} range controls missing`);
   if(name!=='Milo'){
    assert.equal(checks.empty,1,`${name}/${type}/${days} uses an alternative empty structure`);
    assert.equal(checks.na,0,`${name}/${type}/${days} contains obsolete N/A giant circles`);
   }
  }
 }
 assert.equal(issues.length,0,`Browser runtime errors: ${issues.join(' | ')}`);
 console.log('PASS V10.77 BROWSER: centered Health grades, shared pet layouts, reminder More/back and 27 Deep scenarios');
 console.log('HEALTH_GEOMETRY '+JSON.stringify(audits));
 await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
