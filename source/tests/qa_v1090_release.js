/* DeepPet V10.101 — identity-bound scores, missing values and lab bounds. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'assets/js/app_03.js'),'utf8');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pick=(start,end)=>{const a=app.indexOf(start),b=app.indexOf(end,a);assert(a>=0&&b>a,start);return app.slice(a,b);};

const dogs=[
 {name:'Same Name',photo:'a.jpg',score:[96,93,90]},
 {name:'Same Name',photo:'b.jpg',score:[27,42,54]},
 {name:'Same Name',photo:'c.jpg',score:[60,70,80]}
];
const state={dog:0,lang:'zh',petExtras:[],petOverrides:{0:{name:'Same Name'},1:{name:'Same Name'}}};
const ctx={state,dogs,Number,Math,Symbol,Object};
vm.createContext(ctx);
vm.runInContext(pick('function dpScoreValue(', 'function activityText('),ctx);
vm.runInContext(pick('function allPets()', 'function medsForDog('),ctx);
Object.assign(ctx,{
 dpTodayUnifiedScores:()=>state.dog===0?{heart:96,sleep:96,energyActivity:96}:{heart:88,sleep:88,energyActivity:88},
 dpOwnerQualityValue:n=>Math.round(Math.max(0,Math.min(100,n)))
});
vm.runInContext(pick('function dpRiskGuard(', 'function recoveryEvidence('),ctx);
assert.equal(ctx.score(ctx.currentDog()),96,'current pet gets its daily score');
assert.equal(ctx.score(dogs[1]),41,'different pet with identical name must keep its own score');
assert.equal(ctx.score(dogs[2]),70,'a third pet with identical name must not inherit Milo’s score');
state.dog=1;
assert.equal(ctx.score(ctx.currentDog()),88);
assert.equal(ctx.score(dogs[0]),93,'previously selected pet must not inherit new selected score');
assert.equal(ctx.score({name:'New Pet',dpFreshPet:true,score:[0,0,0]}),null,'a new unmeasured pet is not a red 0-point case');
assert.equal(ctx.score({name:'Legacy',score:['90','not available','98']}),null,'a corrupt third component cannot create a score');
assert.equal(ctx.score({name:'Legacy',score:['90','80','70']}),80,'valid imported numeric strings remain usable');
assert.equal(Object.keys(ctx.currentDog()).includes('DeepPet selected pet'),false);

for(const raw of [null,undefined,'',' ','\t',NaN,Infinity,-1,101,{},[]]){
 assert.equal(ctx.dpScoreValue(raw),null,String(raw));
 assert.equal(ctx.scoreScheme(raw).tone,'unavailable',String(raw));
 assert.equal(ctx.scoreLabel(raw),'数据不足',String(raw));
}
for(const [value,color] of [[0,'risk'],[59.99,'risk'],[60,'watch'],[79.99,'watch'],[80,'good'],[89.99,'good'],[90,'excellent'],[100,'excellent']]){
 assert.equal(ctx.scoreScheme(value).tone,color,String(value));
}
assert.equal(ctx.scoreLabel(59),'高风险');
assert.equal(ctx.scoreLabel(60),'中风险');
assert.equal(ctx.scoreLabel(80),'低风险');
assert.equal(ctx.scoreLabel(90),'健康');
assert.equal(ctx.dpPhysiolComposite('',90,90),null,'missing cardio is not numeric zero');
assert.equal(ctx.dpPhysiolComposite(90,' ',90),null,'whitespace is not a sleep score');
assert.equal(ctx.dpPhysiolComposite(100,100,100),100);
assert.equal(ctx.dpRiskGuard('',[80]),null,'missing headline must not become a scored grade');
vm.runInContext(pick('function dpDottedSvg(', 'function restingPanel('),ctx);
for(const render of [ctx.scoreRing,ctx.dpDotScore,ctx.dpDeepDottedScore]){
 const missing=render(' ');
 assert.match(missing,/aria-label="—"/,'all circular scores must mark missing values unavailable');
 assert.match(missing,/>—</,'all circular scores must show the missing-value dash');
 assert.doesNotMatch(missing,/aria-label="0(?:\s*\/\s*100|\/100)"/);
 const zero=render(0);
 assert.match(zero,/>0</,'a measured zero remains a real zero');
}
ctx.label3=zh=>zh;
vm.runInContext(pick('function dp66Grade(value)', 'function dp66DemoPeak('),ctx);
assert.equal(ctx.dp66Grade(''),-1);
assert.equal(ctx.dp66Grade(' '),-1);
assert.equal(ctx.dp66Grade(0),3);
assert.equal(ctx.dp66Grade(90),0);
assert.equal(ctx.dp66GradeName(-1),'資料不足','unknown is never labelled healthy');

vm.runInContext(pick('function dpReportBoundsValid(', 'const DP_PET_NOTIFICATION_DEFAULTS'),ctx);
assert.equal(ctx.dpReportBoundsValid('',''),true,'optional reference interval may be absent');
assert.equal(ctx.dpReportBoundsValid(' ',' '),true,'both whitespace fields mean no interval');
assert.equal(ctx.dpReportBoundsValid('0','5'),true,'zero is a legitimate lower bound');
assert.equal(ctx.dpReportBoundsValid('-3','0'),true,'negative laboratory ranges are valid');
assert.equal(ctx.dpReportBoundsValid(' ','5'),false,'whitespace is not an actual zero');
assert.equal(ctx.dpReportBoundsValid('0',' '),false,'incomplete reference intervals are invalid');
assert.equal(ctx.dpReportBoundsValid('5','0'),false,'reversed intervals are invalid');
assert.equal(ctx.dpReportBoundsValid('NaN','5'),false);

assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.css/);
console.log('PASS V10.93: duplicate-name isolation, missing versus zero scores, exact grade thresholds and laboratory ranges');
