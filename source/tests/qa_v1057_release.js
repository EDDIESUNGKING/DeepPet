/* V10.57: source-of-truth devices, honest unpaired state, cart migration and owner copy. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const src=read('assets/js/app_03.js');
const cut=(start,end)=>{
 const a=src.indexOf(start),b=src.indexOf(end,a+start.length);
 assert(a>=0&&b>a,`missing ${start}`);return src.slice(a,b);
};
const ctx={
 state:{connected:false,deviceType:null,connectedId:'',connectChoice:'bt',shopCart:[],shopSelection:'bt',shopPlan:'yearly',lang:'zht'},
 tr:x=>x,label3:x=>x,esc:x=>String(x),vicon:()=>'<svg class="neutral-device"></svg>',
 button:x=>`<button>${x}</button>`,
};ctx.window=ctx;
vm.runInNewContext([
 cut('const DP_DEVICE_CATALOG','function connectSteps'),
 cut('function devName','function shopCheckout'),
 cut('function deviceCenter','function wizardTitle'),
].join('\n')+'\nthis.unit={DP_DEVICE_CATALOG,COLLARS,SHOP,deviceCenter,dpDevicePhoto,cartSummary,shopView,shopPlanValue};',ctx);
const {DP_DEVICE_CATALOG:catalog,COLLARS,SHOP,deviceCenter,dpDevicePhoto,cartSummary,shopView,shopPlanValue}=ctx.unit;
assert(Object.isFrozen(catalog)&&Object.isFrozen(catalog.bt)&&Object.isFrozen(catalog['4g']));
assert.equal(catalog.bt.image,COLLARS.bt);assert.equal(catalog['4g'].image,COLLARS.g4);
assert.equal(SHOP.find(x=>x.key==='bt').price,catalog.bt.price);
assert.equal(SHOP.find(x=>x.key==='4g').price,catalog['4g'].price);
assert.equal(shopPlanValue('monthly'),catalog['4g'].monthly);
assert.equal(shopPlanValue('yearly'),catalog['4g'].yearly);
assert(catalog.bt.gps===false&&catalog.bt.requiresPlan===false&&catalog['4g'].gps&&catalog['4g'].requiresPlan);
assert(!dpDevicePhoto().includes('<img'));
assert(deviceCenter().includes('dp-device-unpaired-art'));
assert(!deviceCenter().includes(COLLARS.bt)&&!deviceCenter().includes(COLLARS.g4),
 'An unpaired pet must not appear to own a Bluetooth or 4G product');
for(const kind of ['bt','4g']){
 ctx.state.connected=true;ctx.state.deviceType=kind;
 const current=deviceCenter();assert(current.includes(catalog[kind].image));
 assert(!current.includes(catalog[kind==='bt'?'4g':'bt'].image));
}
ctx.state.connected=false;ctx.state.deviceType=null;
ctx.state.shopCart=['bt','old',null,{kind:'4g',plan:'yearly'},{kind:'4g',plan:'monthly'},{kind:'bt',plan:'monthly'}];
const tally=cartSummary();
assert.deepEqual(Array.from(tally.items,x=>x.sourceIndex),[0,3,4,5]);
assert.deepEqual(Array.from(tally.items,x=>x.plan),[null,'yearly','monthly',null]);
assert.equal(tally.hardware,836);assert.equal(tally.annual,49);assert.equal(tally.monthly,5);assert.equal(tally.now,890);
const store=shopView();
for(const index of [0,3,4,5])assert(store.includes(`data-action="shop-remove" data-index="${index}"`));
assert(!store.includes('data-action="shop-remove" data-index="1"'));
assert(store.includes('<details class="dp1057-shop-conditions">'));
assert(/<\/button><\/div>\s*<details class="dp1057-shop-conditions">/.test(store),
 'Disclosure must be outside the product select buttons');
assert(!store.includes('暫存後補傳')&&!store.includes('回家後可讀取暫存'));
ctx.state.shopSelection='4g';
const remoteStore=shopView();
assert(remoteStore.includes('<details class="dp1057-plan-math">'));
assert(remoteStore.includes(`US$${catalog['4g'].monthly} / 月`));
assert(remoteStore.includes(`US$${catalog['4g'].yearly} / 年`));
assert(remoteStore.includes(`省 US$${catalog['4g'].monthly*12-catalog['4g'].yearly}`));
ctx.state.shopCart={broken:true};assert.equal(cartSummary().now,0);assert(shopView().includes('購物車目前沒有商品'));

const narrative={state:{dog:0,lang:'zht',tab:'home',range:1,deepType:0,detail:null},render:()=>{},
 document:{querySelectorAll:()=>[],querySelector:()=>null},demoRecords:()=>[],validDaySample:()=>({valid:true}),
 DeepPetScoreIntegrity:{weights:require('../assets/algorithm/score-integrity-v1.js').weights},toSimplified:x=>x};
narrative.window=narrative;
vm.runInNewContext(read('assets/js/ux_v1055.js'),narrative);
const caseFor=scores=>[{row:{date:'2026-11-17',idx:0,heart:70,breath:18,rmssd:40,activity:40},scores}];
const rounded=narrative.DeepPetUX1055.insight('cardio',caseFor({heart:96,breath:95,hrv:94,stable:95,cardio:89.6}),1);
assert.equal(rounded.level,0,'89.6 shown as 90 must use the >=90 risk category');
const lowComponent=narrative.DeepPetUX1055.insight('cardio',caseFor({heart:97,breath:96,hrv:68,stable:99,cardio:92}),1);
assert.equal(lowComponent.level,0);assert.match(lowComponent.headline,/HRV/);
assert(!/沒有明顯拉低/.test(lowComponent.headline));
assert(lowComponent.action.includes('HRV'),'a low component needs a specific action even with a good composite');
const css=read('assets/css/ux_v1057.css');assert(css.includes('.dp1057-shop-conditions>summary'));
assert(css.includes('.dp-device-unpaired-art'));
const html=read('index.html');assert(html.includes('DeepPet V10.101'));
assert(/assets\/js\/deeppet-v10101-[a-f0-9]{12}\.js/.test(html));
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
console.log('PASS V10.57 unified device catalog, correct unpaired state, old-cart resilience and delete indices, progressive store details, owner score-band/exceptions and compiled entrypoints.');
