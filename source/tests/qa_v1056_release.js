/* V10.56: authentic product-image identity + specifications + entrypoint contract. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const base=path.join(__dirname,'..');
const root=path.resolve(base,'../..');
// Production ZIP keeps shared binary media beside the editable source folder.
const mediaBase=fs.existsSync(path.join(base,'assets/product'))?base:path.resolve(base,'..');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const js=read('assets/js/app_03.js');
const source=(a,b)=>{const start=js.indexOf(a),end=js.indexOf(b,start+a.length);assert(start>=0&&end>start,`Could not extract ${a}`);return js.slice(start,end);};
const context={
 state:{connected:true,deviceType:'bt',connectedId:'DP-VIRTUAL-BT-001',lang:'zht',
   pairStage:0,pairType:'bt',pairSelected:'DP-VIRTUAL-BT-001',dog:0,dpPetEpoch:1,
   shopSelection:'bt',shopPlan:'yearly',shopCart:[]},
 tr:(zh)=>zh,label3:(zh)=>zh,dpShopL:(zh)=>zh,
 esc:x=>String(x),button:(title)=>`<button>${title}</button>`,vicon:()=>'<svg></svg>',
 cartSummary:()=>({items:[],hardware:0,annual:0,monthly:0,now:0}),
 shopPlanValue:plan=>plan==='monthly'?5:49,planPicker:()=>'<div>4G plan</div>',
 dpPairSearchResults:()=>[],
};
context.window=context;
const sections=[
 source('const DP_DEVICE_CATALOG','function connectSteps'),
 source('function devName','function shopItem'),
 source('function dpShopFeature','function shopCheckout'),
 source('function deviceCenter','function wizardTitle'),
 source('function wizardTitle','// V7.8'),
];
vm.runInNewContext(sections.join('\n')+'\nthis.subject={COLLARS,SHOP,collarCard,shopView,deviceCenter,wizardView};',context);
const {COLLARS,SHOP,collarCard,shopView,deviceCenter,wizardView}=context.subject;
assert.equal(Object.isFrozen(COLLARS),true,'mapping is immutable');
assert.equal(COLLARS.bt,'assets/product/deeppet-collar-bluetooth.png');
assert.equal(COLLARS.g4,'assets/product/deeppet-collar-4g-gps.png');
assert.equal(SHOP.find(x=>x.key==='bt').price,189);
assert.equal(SHOP.find(x=>x.key==='4g').price,229);
for(const [type,uploaded,dimensions] of [
 ['bt','BT DeepPet(1).png',[1774,887]],
 ['4g','4G DeepPet.png',[1672,941]],
]){
 const a=fs.readFileSync(path.join(mediaBase,COLLARS[type==='4g'?'g4':type]));
 const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
 // The previous upload folder is not part of the self-contained release ZIP.
 // Freeze its verified exact-byte digest so QA still detects image swaps.
 const known={bt:'c405176f6081b361886828f9d4498d3bc2771f9208f815d18187bf26c42cbb09',
  '4g':'2ebeaa91049efa3fcdb3ed4c7038ff075fe6395c5f7f501d554b98fd22f1e825'};
 const uploadPath=path.join(root,'upload',uploaded);
 if(fs.existsSync(uploadPath))assert.equal(sha(a),sha(fs.readFileSync(uploadPath)),`${type} must match supplied image`);
 assert.equal(sha(a),known[type],`${type} must preserve owner-approved bytes`);
 assert.deepEqual([a.readUInt32BE(16),a.readUInt32BE(20)],dimensions);
}
for(const kind of ['bt','4g']){
 const opposite=kind==='bt'?'4g':'bt';
 const imageFor=x=>x==='4g'?COLLARS.g4:COLLARS.bt;
 context.state.deviceType=kind;
 context.state.connectedId=`DP-VIRTUAL-${kind.toUpperCase()}-001`;
 const me=deviceCenter(),card=collarCard(kind);
 assert(me.includes(`src="${imageFor(kind)}"`),`Me must select ${kind}`);
 assert(!me.includes(`src="${imageFor(opposite)}"`));
 assert(card.includes(`src="${imageFor(kind)}"`),`setup must select ${kind}`);
 context.state.pairStage=2;context.state.pairType=kind;
 const wizard=wizardView();
 assert(wizard.includes(`src="${imageFor(kind)}"`),`pair confirmation must select ${kind}`);
 assert(!wizard.includes(`src="${imageFor(opposite)}"`));
}
context.state.pairStage=0;context.state.pairType='bt';
const choices=wizardView();
assert(choices.includes(`data-type="bt"><img src="${COLLARS.bt}"`));
assert(choices.includes(`data-type="4g"><img src="${COLLARS.g4}"`));
for(const selected of ['bt','4g']){
 context.state.shopSelection=selected;
 const html=shopView();
 const bts=html.slice(html.indexOf('data-type="bt"'),html.indexOf('data-type="4g"'));
 const g4s=html.slice(html.indexOf('data-type="4g"'),html.indexOf('</button>',html.indexOf('data-type="4g"')));
 assert(bts.includes(`src="${COLLARS.bt}"`),'store Bluetooth photo');
 assert(g4s.includes(`src="${COLLARS.g4}"`),'store 4G+GPS photo');
 assert(bts.includes('US$189')&&g4s.includes('US$229'));
 assert(bts.includes('超過 5 天')&&g4s.includes('2–3 天'),'battery targets differ correctly');
 assert(bts.includes('不含定位'),'Bluetooth is health-only');
 assert(g4s.includes('eSIM'),'4G requires eSIM');
 assert(!html.includes('約 20 g')&&!html.includes('約 40 g')&&!html.includes('暫存約 7 天'),'unverified specifications removed');
}
const finalLayer=read('assets/js/ux_v1056.js'),css=read('assets/css/ux_v1056.css');
assert(finalLayer.includes("state.modal!=='pair-success'")&&finalLayer.includes("state.pairStage===1"));
assert(finalLayer.includes('data-dp-product')&&finalLayer.includes('photo(model)'));
assert(css.includes('object-fit:contain!important')&&css.includes('transform:none!important'));
const index=read('index.html');
assert(index.includes('deeppet-v10101-')&&index.includes('DeepPet V10.101'));
const compiled=fs.readFileSync(path.join(base,index.match(/assets\/js\/deeppet-v10101-[a-f0-9]+\.js/)[0]),'utf8');
assert(compiled.includes(COLLARS.g4)&&compiled.includes(COLLARS.bt));
assert(!compiled.includes('assets/embedded_posters/9241b6e264d7.png'));
assert(!compiled.includes('assets/embedded_posters/f6df013de3cf.png'));
console.log('PASS V10.56 exact 4G/Bluetooth images, My Device and pairing stages, both store products, distinct prices/batteries, no old photos, bundled entrypoints.');
