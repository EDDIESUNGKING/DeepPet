/* V10.83: overnight windows must agree and missing rest cannot be silently
 * replaced by awake readings; 24h chart has exactly 24 distinct hour bins. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
const source=read('assets/js/app_03.js');
const between=(start,end)=>{
 const a=source.indexOf('function '+start+'('),b=source.indexOf('function '+end+'(',a+1);
 assert(a>=0&&b>a,`missing function range: ${start} / ${end}`);
 return source.slice(a,b);
};
const yesterday='2026-11-17',today='2026-11-18';
const day=({heart,breath})=>({heart:Array(1440).fill(heart),breath:Array(1440).fill(breath),activity:Array(1440).fill(10),rest:Array(1440).fill(100)});
const prior=day({heart:60,breath:12}),current=day({heart:90,breath:18});
// Extreme readings outside 21:00-08:00 must never contaminate the night.
prior.heart.fill(220,1200,1260);prior.breath.fill(50,1200,1260);
current.heart.fill(250,480,720);current.breath.fill(45,480,720);
let capturedBins=[],capturedOptions=null;
const ctx={
 iso:v=>v.toISOString().slice(0,10),localDate:()=>new Date(today+'T12:00:00'),
 dateAdd:(d,n)=>new Date(d.getTime()+n*86400000),
 dpSignals:date=>date===yesterday?prior:current,
 dpAverage:xs=>{const a=xs.filter(Number.isFinite);return a.reduce((s,v)=>s+v,0)/Math.max(1,a.length);},
 label3:zh=>zh,baselineProfile:()=>({breath:16}),
 dpChart:values=>{capturedBins=Array.from(values);return '<svg></svg>';},
 inspectSvg:(_svg,_values,options)=>{capturedOptions=options;return '<svg></svg>';},
 dpNightLongestRest:()=>'',dpSleepEnergyLine:()=>'',Math,Number,Array,Date
};
vm.runInNewContext(between('dpQuietNightVitalAverages','dpNightBreathing')+between('dpNightBreathing','dpSleepEnergyLine'),ctx);
const overnight=ctx.dpQuietNightVitalAverages(today);
assert.equal(overnight.samples,660,'one 21:00-08:00 window must have 660 possible minutes');
assert.equal(overnight.hr,82,'do not include old 20:00 hour or current 08:00-12:00');
assert.equal(overnight.rr,16);
assert.match(ctx.dpNightBreathing(today),/16\.4/,'night breathing mean uses same measured window');
assert.equal(capturedBins.length,22,'21:00-08:00 is 22 half-hour bins');
// An awake hour must create missing chart points rather than 0 bpm or a
// fabricated quiet-period reading from the awake minutes.
current.rest.fill(0,240,300);
const withGap=ctx.dpNightBreathing(today);
assert(Number.isNaN(capturedBins[14])&&Number.isNaN(capturedBins[15]));
assert.match(withGap,/2 個半小時缺少有效的安靜記錄/);
assert.equal(capturedOptions.yCoords[14],null);
assert.equal(capturedOptions.yCoords[15],null);
current.rest.fill(0);prior.rest.fill(0);
assert.equal(ctx.dpQuietNightVitalAverages(today).hr,null,'no rest proof means no quiet-heart average');
assert.equal(ctx.dpQuietNightVitalAverages(today).rr,null,'no rest proof means no quiet-breath average');
assert.match(ctx.dpNightBreathing(today),/夜間安靜呼吸記錄不足/,'never label awake breathing as quiet overnight');
// A real bridge with heart/breath but no motion/rest data must also be empty.
current.rest=[];prior.rest=[];
assert.equal(ctx.dpQuietNightVitalAverages(today).hr,null);
assert.match(ctx.dpNightBreathing(today),/夜間呼吸資料不足/);

const chartCoords=[];
const chartCtx={
 dpSignals:()=>({heart:Array.from({length:1440},(_,i)=>50+Math.floor(i/60)),breath:Array.from({length:1440},(_,i)=>10+Math.floor(i/60)),activity:Array.from({length:1440},(_,i)=>i/60)}),
 dpAverage:ctx.dpAverage,label3:zh=>zh,deepCurvePath:pts=>{chartCoords.push(Array.from(pts,p=>Array.from(p)));return 'M0 0L1 1';},
 esc:v=>String(v),Math,Number,Array
};
vm.runInNewContext(between('dpDailyContext','dpEventContext'),chartCtx);
const daily=chartCtx.dpDailyContext(today);
assert.match(daily,/24小時心肺與動靜節奏/);
assert.equal(chartCoords.length,2,'one path each for heart and breathing');
assert.equal(chartCoords[0].length,24,'24h heart line uses 24 hour means, not 25');
assert.equal(chartCoords[1].length,24,'24h breathing line uses 24 hour means, not 25');
assert(chartCoords[0][23][0]>chartCoords[0][22][0]);
assert(chartCoords[0][23][0]<348,'23:00-24:00 bucket occupies its real centered interval');

// The shared inspector must never position a dot at an invalid point.
const inspect=between('inspectPoint','pointerInspect');
const nodes={},node=tag=>({tag,attrs:{},setAttribute(k,v){this.attrs[k]=String(v);}});
const svg={querySelector:s=>nodes[s]||null,appendChild(el){nodes[el.tag==='line'?'.dp-cursor-line':'.dp-cursor-dot']=el;}};
const reading={textContent:''},wrapper={dataset:{inspectorId:'0'},querySelector:s=>s==='svg'?svg:s==='.dp-chart-current'?reading:null,classList:{add(){}}};
const plotRegistry=[{values:[12,NaN,18],kind:'breath',unit:'/min',timeLabels:['21:00','21:30','22:00'],left:30,right:2,top:11,bottom:25,width:350,height:125,yCoords:[55,null,22],color:'#309b77'}];
const inspectorCtx={plotRegistry,document:{createElementNS:(_uri,tag)=>node(tag)},inspectValueText:v=>Number.isFinite(v)?v.toFixed(1):'—',Math,Number};
vm.runInNewContext(inspect,inspectorCtx);
inspectorCtx.inspectPoint(wrapper,1);
assert.equal(nodes['.dp-cursor-dot'].attrs.visibility,'hidden');
assert.match(reading.textContent,/21:30.*—/);
inspectorCtx.inspectPoint(wrapper,2);
assert.equal(nodes['.dp-cursor-dot'].attrs.visibility,'visible');
assert.match(reading.textContent,/22:00.*18\.0/);

assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.css/);
console.log('PASS V10.83: one 21-08 night window; no awake/sparse night measurements; 24 distinct hour buckets; missing inspector data stays blank');
