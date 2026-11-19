/* V10.82: newest emergencies must be visible before More, empty and measured
 * Home use one card location, and retired version-writers cannot execute. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('assets/js/ux_v1060.js');
const retired=[1016,1018,1019,1020,1021,1022,1024,1025,1026,1027,1028];
const builder=read('build.mjs');
for(const number of retired){
 const file=`assets/js/ux_v${number}.js`;
 assert(!fs.existsSync(path.join(root,file)),`Inactive V${number} version-writer still in source`);
 assert(!builder.includes(`jsPaths.push('${file}')`),`Inactive V${number} version-writer still bundled`);
}
assert(builder.includes("jsPaths.push('assets/js/ux_v1023.js')"),
 'V10.23 direct examination navigation must remain active');

let moved=0,appended=0;
const parent={},panel={dataset:{},parentElement:parent,
 querySelectorAll:()=>[],querySelector:()=>null,
 closest:()=>({querySelector:()=>summary}),append:()=>appended++};
const summary={parentElement:parent,before:node=>{assert.equal(node,panel);moved++;}};
const context={window:{},state:{dog:0,tab:'home',detail:null,emptyPreview:false,lang:'en'},
 document:{addEventListener:()=>{},querySelector:()=>panel,createElement:()=>({className:'',textContent:''})},
 render:()=>{},iso:()=> '2026-11-18',localDate:()=>new Date('2026-11-18'),
 dpSignals:()=>({heart:Array(1440).fill(80),breath:Array(1440).fill(20)})};
vm.runInNewContext(source,context,{filename:'ux_v1060.js'});
const combine=context.window.DeepPetUX1060.combineForHome;
const date='2026-11-18',minuteEvent=minute=>({date,minute,kind:'heart',type:'high',value:190});
const rapid={source:'rapid',date,localSecond:53000,
 observations:[{kind:'breath',type:'high'}]};
const result=combine([minuteEvent(200),minuteEvent(1000)],[],[rapid]);
assert.deepEqual(Array.from(result,x=>Number.isInteger(x.localSecond)?x.localSecond:x.minute*60),
 [60000,53000,12000], 'Latest events should be first across second and minute sources');
const duplicated=combine([minuteEvent(880)],[],[{...rapid,localSecond:880*60,
 observations:[{kind:'heart',type:'high'}]}]);
assert.equal(duplicated.length,1,'Same incident must not appear twice');
context.render(true);
assert.equal(moved,1,'No-event Home must place its urgent card next to Today Summary');
assert.equal(appended,1,'No-event Home must show its empty state in the same card');
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
const runtime=read('index.html');
assert.match(runtime,/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(runtime,/deeppet-v10101-[a-f0-9]{12}\.css/);
assert.equal((runtime.match(/<script src="/g)||[]).length,1);
const cssPath=runtime.match(/assets\/css\/deeppet-v10101-[a-f0-9]{12}\.css/)[0],css=read(cssPath);
const finalContract=css.lastIndexOf('/* assets/css/ux_v1076.css */');
assert(finalContract>0&&css.slice(finalContract).includes('grid-template-rows:70px auto!important'),
 'The final Health score/status centering contract must survive bundling');
assert(css.slice(finalContract).includes('.dp1068-detail-score-head>.dp1068-detail-ring .stat-inner'),
 'Detailed Deep score must retain centered numerals inside its ring');
assert(css.slice(finalContract).includes('.dp921-page .dp1068-exam-score-wrap>.dp1068-exam-risk'),
 'Exam detail status must remain directly centered under the numeric ring');
console.log('PASS V10.80 regression: newest events first, deduped, fixed empty-alert location and removed stale version-writers');
