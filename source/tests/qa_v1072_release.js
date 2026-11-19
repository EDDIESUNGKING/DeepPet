/* V10.72: actual final-layer DOM parity across measured, Lucky and blank pets. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
const state={tab:'health',detail:null,lang:'zht',emptyPreview:false,dog:0};
const makeNode=()=>({className:'food-feature',attributes:{},innerHTML:'LEGACY TEMPLATE',
 setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k];}});
const cases=[];
let list;
// Exercise legacy-compat normalization ONLY when the V10.75 canonical card
// is absent; the production renderer must never normalize the new layout.
const document={querySelector:selector=>selector.includes('dp1075-health-page')?null:list};
const context={window:null,state,document,render:()=>{},vicon:(name,size)=>`<svg data-icon="${name}" width="${size}" height="${size}"></svg>`,
 targetFood:()=>512.3,selectedBlank:()=>state.emptyPreview,toSimplified:s=>s,
 DeepPetUX1068:{isEmpty:()=>state.emptyPreview||state.dog===14}};
context.window=context;
vm.runInNewContext(read('assets/js/ux_v1072.js'),context);
function fixture(){
 const food=makeNode();
 const recovery=makeNode();recovery.dataset={page:'recovery-care'};
 const notes=makeNode();notes.dataset={page:'notes'};
 let duplicates=[];
 list={querySelector:selector=>selector===':scope > .food-feature'?food:null,
  querySelectorAll:selector=>{
   if(selector.includes('recovery-care'))return [recovery,...duplicates];
   if(selector.includes('notes'))return [notes];return [];
  }};
 return {food,recovery,notes,duplicates};
}
for(const lang of ['zht','zh','en','ja','ko']){
 state.lang=lang;
 const snapshot=[];
 for(const [name,dog,blank] of [['Milo',0,false],['Lucky',14,false],['Empty',15,true]]){
  state.dog=dog;state.emptyPreview=blank;
  const nodes=fixture();
  context.DeepPetUX1072.normalizeCards();
  assert.equal(nodes.food.className,'card food-feature dp1072-food');
  assert.equal(nodes.food.getAttribute('data-page'),'food');
  assert.match(nodes.food.innerHTML,/dp1072-food-title/);
  assert.match(nodes.food.innerHTML,/dp1072-food-subtitle/);
  assert.match(nodes.food.innerHTML,/dp1072-food-calories/);
  assert.doesNotMatch(nodes.food.innerHTML,/food-feature-main|food-progress|food-pct|N\/A/);
  assert.match(nodes.food.innerHTML,/512 kcal|暫無數據|No data yet|データなし|아직 데이터 없음/);
  if(name==='Milo')assert.match(nodes.food.innerHTML,/512 kcal/);
  else assert.doesNotMatch(nodes.food.innerHTML,/512 kcal/);
  for(const row of [nodes.recovery,nodes.notes]){
   assert.equal(row.className,'health-item dp1071-shared-row dp1072-uniform-care');
   assert.equal(row.getAttribute('data-action'),'health-detail');
   assert.match(row.innerHTML,/<span class="thumb".*<svg.*<span class="grow"><div class="lbl">.*<div class="hint">/);
  }
  snapshot.push({name,food:nodes.food.innerHTML,recovery:nodes.recovery.innerHTML,notes:nodes.notes.innerHTML});
 }
 // The only permissible difference is actual versus missing calorie content.
 assert.equal(snapshot[0].food.replace('512 kcal','<VALUE>'),snapshot[1].food.replace(/<span class="dp1072-food-calories">.*?<\/span>/,'<span class="dp1072-food-calories"><VALUE></span>'));
 assert.equal(snapshot[1].food,snapshot[2].food);
 assert.equal(snapshot[0].recovery,snapshot[1].recovery);
 assert.equal(snapshot[1].recovery,snapshot[2].recovery);
 assert.equal(snapshot[0].notes,snapshot[1].notes);
 assert.equal(snapshot[1].notes,snapshot[2].notes);
 cases.push(lang);
}
state.dog=0;state.emptyPreview=false;state.lang='zh';
const duplicate=makeNode();duplicate.remove=function(){this.removed=true};
const nodes=fixture();nodes.duplicates.push(duplicate);
context.DeepPetUX1072.normalizeCards();
assert.equal(duplicate.removed,true,'Legacy duplicate recovery card must be removed');
const css=read('assets/css/ux_v1072.css');
assert.match(css,/#fff5c5/,'The measured and unmeasured card must be pale yellow');
assert.match(css,/\.dp1072-food\{/,'The food layout must use its own final selector');
assert.match(css,/font-size:13px!important/,'Care title type scale missing');
assert.match(css,/font-size:11px!important/,'Care subtitle type scale missing');
assert.match(css,/width:49px!important;height:49px!important/,'Care icon sizes differ');
const builder=read('build.mjs');
assert(builder.indexOf("cssPaths.push('assets/css/ux_v1071.css')")<builder.indexOf("cssPaths.push('assets/css/ux_v1072.css')"));
assert(builder.indexOf("jsPaths.push('assets/js/ux_v1071.js')")<builder.indexOf("jsPaths.push('assets/js/ux_v1072.js')"));
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log(`PASS V10.72: five locales × three profiles, pixel-source DOM parity, no score leakage, no duplicate recovery records`);
