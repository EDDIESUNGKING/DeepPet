/* V10.96: execute real Home todo factory for Lucky/Blank and the current
 * Health exam renderer; ensure no legacy SVG-score class can escape its card. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=x=>fs.readFileSync(path.join(base,x),'utf8');
const state={dog:0,lang:'zht',tab:'home',detail:null,emptyPreview:false};
const icon=(name,size)=>`<svg class="line-icon" data-icon="${name}" width="${size}" height="${size}"></svg>`;
const source=read('assets/js/app_03.js');
const focusStart=source.indexOf('function focusCard(){');
const focusSlice=source.slice(focusStart,source.indexOf('// V8.18:',focusStart));
assert(focusSlice.includes('function focusCard(){'));
const measuredCtx={state,dpAllTodayAttentionItems:()=>[{title:'需处理',type:'care'}],dpTodayActionCard:()=>'<button class="dp-today-action"></button>',label3:(zh)=>zh,vicon:icon};
const measured=vm.runInNewContext(focusSlice+'\nfocusCard()',measuredCtx);
assert.match(measured,/focus-feature focus-watch dp-today-focus/);
assert.match(measured,/class="row spread"/);
assert.match(measured,/data-icon="spark"/);
assert.match(measured,/class="focus-count"/);

const env={window:null,state,render:()=>{},selectedBlank:()=>state.emptyPreview,
 dp58FreshPet:()=>!state.emptyPreview&&state.dog===15,isFreePet:()=>false,
 currentDog:()=>({}),vicon:icon,toSimplified:x=>x,DeepPetRelease:{},
 document:{querySelectorAll:()=>[]}};
env.window=env;
vm.runInNewContext(read('assets/js/ux_v1001.js'),env);
function noData(kind){
 state.dog=kind==='Lucky'?15:0;state.emptyPreview=kind==='Blank';
 let markup='';const anchor={insertAdjacentHTML:(_side,html)=>{markup=html;}};
 const main={querySelectorAll:()=>[],querySelector:q=>q==='.dp936-urgent,.summary-card,.dp-combined-summary'?anchor:null};
 env.DeepPetUX1001.homeToday(main);
 assert(markup,kind+' did not create Home To-dos');
 assert.match(markup,/focus-feature focus-watch dp-today-focus/);
 assert.match(markup,/class="row spread"/);
 assert.match(markup,/data-icon="spark"/);
 assert.match(markup,/class="focus-count"/);
 assert(!markup.includes('focus-steady'),kind+' uses the old green styling');
 assert(!markup.includes('dp936-home-todo'),kind+' old card remains');
 return markup;
}
const lucky=noData('Lucky'),blank=noData('Blank');
assert.equal(lucky,blank,'Lucky and Blank Home todo markup differ');
const measuredIcon=[...measured.matchAll(/<svg[^>]+data-icon="([^"]+)"/g)][0][1];
const luckyIcon=[...lucky.matchAll(/<svg[^>]+data-icon="([^"]+)"/g)][0][1];
assert.equal(measuredIcon,luckyIcon,'To-do icon is not the same measured icon');
const measuredBase=read('assets/css/styles_01.css'),patch=read('assets/css/ux_v1096.css');
assert.match(measuredBase,/\.dp-today-focus>\.row \.focus-eyebrow\{[^}]*color:#8d573b/);
assert.match(patch,/\.dp1001-empty-todos>\.row \.focus-eyebrow,[\s\S]*?color:#8d573b!important/);
assert.match(patch,/\.dp1001-empty-todos\{[\s\S]*?17px 15px 18px/);

const reportSrc=read('assets/js/ux_v1075.js');
assert(!reportSrc.includes('class="dp916-large-score'),'The canonical Health HTML retained a legacy ring');
assert(reportSrc.includes('dp1096-exam-score'));
assert(reportSrc.includes('dp1096-exam-dots'));
assert.match(reportSrc,/Array\.from\(\{length:54\}/);
for(const prop of ['width:70px!important','height:70px!important','max-width:70px!important','max-height:70px!important','overflow:hidden!important']){
 assert(patch.includes(prop),'Missing fixed ring containment: '+prop);
}
assert.match(patch,/\.dp1096-exam-score\.healthy\{color:#24a56c/);
assert.match(patch,/\.dp1096-exam-score\.mild\{color:#2f6fe4/);
assert.match(patch,/\.dp1096-exam-score\.moderate\{color:#d58b2d/);
assert.match(patch,/\.dp1096-exam-score\.risk\{color:#d9534f/);
const lastCleanup=read('assets/js/ux_v1095.js');
assert.match(lastCleanup,/querySelectorAll\('\.dp916-large-score,\.dp-dot-meter,\.dp1092-exam-ring'\)\.forEach\(node=>node\.remove\(\)\)/);
// Exercise the last render wrapper on a realistic legacy-contamination fixture.
// It must purge unwanted progress circles throughout Health without touching
// the new 70px ring that lives exclusively in the Exam card.
const legacySelectors=['.dp916-care-card','.dp916-home-score','.dp-health-progress-ring',
 '.dp-health-completion-meter','.dp916-large-score','.dp-dot-meter','.dp1092-exam-ring'];
const legacyNodes=legacySelectors.map(selector=>({selector,removed:false,remove(){this.removed=true;}}));
const newExamRing={selector:'.dp1096-exam-score',removed:false,remove(){this.removed=true;}};
const fakePage={querySelectorAll(selector){return [...legacyNodes,newExamRing].filter(node=>selector.split(',').includes(node.selector));}};
const cleanupCtx={window:null,render:()=>'<render-ok>',document:{querySelector:selector=>selector==='#app .dp1075-health-page'?fakePage:null}};
cleanupCtx.window=cleanupCtx;
vm.runInNewContext(lastCleanup,cleanupCtx);
assert.equal(cleanupCtx.render(),'<render-ok>');
assert(legacyNodes.every(node=>node.removed),'Old Health progress or exam ring survived final renderer');
assert.equal(newExamRing.removed,false,'The canonical Exam score was removed by cleanup');
const build=read('build.mjs');
assert(build.includes("cssPaths.push('assets/css/ux_v1096.css')"));
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
console.log('PASS V10.96 Home To-do icon + color parity for Lucky/Blank and bounded Exam-only score ring');
