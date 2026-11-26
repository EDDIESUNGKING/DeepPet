// Independent expected values for the repaired missing-data / identity boundaries.
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const s=fs.readFileSync(path.join(__dirname,'../js/verified.js'),'utf8');
const segment=(a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i+1);assert(i>=0&&j>i);return s.slice(i,j)};
const ctx=vm.createContext({state:{dog:1,petOverrides:{1:{weight:10,photo:'data:x',name:'a'}}},window:{},iso:()=> '2026-11-25',localDate:()=>new Date(),avg:a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null,streams:{},motion:[],breath:[]});
ctx.dpSignals=()=>ctx.streams;ctx.minuteDemoSeries=k=>k==='breath'?ctx.breath:ctx.motion;ctx.eventRevision=()=>1;
vm.runInContext(segment('function dpScoreProfileOverrides','function dpGalleryRevision')+segment('function dpGalleryRevision','\n')+'\n'+segment('const dpQuietRespCache=new Map();','function dpQuietRespModel')+segment('const nightCache=new Map();','function nightCompare')+segment('const quietCache=new Map();','const originalRhythm')+segment(';/* assets/algorithm/provenance-v1075.js */',';/* assets/algorithm/event-triage-v1075.js */'),ctx);
let n=0;const eq=(a,b,label)=>{assert.equal(a,b,label);n++};
const row={date:'2026-11-25',breath:20,activity:0};
ctx.streams={heart:Array(1440).fill(null),breath:Array(1440).fill(null)};eq(ctx.nightAverages(row).heart,null,'missing night is not zero');
ctx.streams={heart:Array(1440).fill(80),breath:Array(1440).fill(20)};ctx.streams.heart.fill(null,0,100);eq(ctx.nightAverages(row).heart,80,'exclude 100 missing minutes');eq(ctx.nightAverages(row).breath,20,'night breath');
ctx.window.DeepPetSignalBridge={revision:2};ctx.streams.heart.fill(90);eq(ctx.nightAverages(row).heart,90,'SDK revision refresh');
ctx.motion=Array(1440).fill(null);ctx.breath=Array(1440).fill(20);eq(ctx.dpQuietRespDatum(row).value,null,'missing movement is not rest');
ctx.motion.fill(0);eq(ctx.dpQuietRespDatum(row).value,20,'true zero movement accepted');
ctx.streams={heart:Array.from({length:1440},(_,i)=>80+i%2),activity:Array(1440).fill(null)};eq(ctx.quietVariation(row.date),null,'missing activity blocks stable variation');ctx.streams.activity.fill(0);eq(ctx.quietVariation(row.date),1,'absolute adjacent variation');
const rev=ctx.dpGalleryRevision(1);ctx.state.petOverrides[1].photo='data:y';ctx.state.petOverrides[1].name='b';eq(ctx.dpGalleryRevision(1),rev,'cosmetic profile does not invalidate');ctx.state.petOverrides[1].weight=12;eq(ctx.dpGalleryRevision(1)===rev,false,'physical profile invalidates');
const P=ctx.window.DeepPetDataProvenance1075;const input={petId:1,date:'2026-11-25',kind:'heart',verifiedWear:true,payload:Array(1440).fill(80)};eq(P.inspect(input).meta.valid,true,'valid provenance');for(const petId of [null,'',-1,1.5,false,' 1 '])eq(P.inspect({...input,petId}).meta.valid,false,'invalid identity');eq(P.inspect({...input,date:'2026-02-30'}).meta.valid,false,'invalid date');eq(P.inspect({...input,date:'2024-02-29'}).meta.valid,true,'leap day');
P.missing(1,'2025-01-01','heart');for(let i=0;i<360;i++)P.missing(i+100,'2025-01-01','heart');eq(P.get(1,'2025-01-01','heart'),null,'bounded missing cache');
// Simulate an interrupted drag during rerender with actual EventTarget listeners.
let strip,slider;function elements(){strip=Object.assign(new EventTarget(),{scrollWidth:1000,clientWidth:200,scrollLeft:100,querySelector:()=>null});slider=Object.assign(new EventTarget(),{value:'0'});}
elements();const w=new EventTarget();const u=vm.createContext({window:w,document:{querySelector:s=>s==='.pet-top-strip'?strip:slider},AbortController});
vm.runInContext(segment('let dpPetStripController=null;','let dpFriendCameraStream'),u);
const emit=(el,type,props)=>el.dispatchEvent(Object.assign(new Event(type),props));
u.setupPetStrip();emit(strip,'pointerdown',{pointerType:'mouse',button:0,clientX:100});emit(w,'pointermove',{clientX:50});eq(strip.scrollLeft,150,'mouse drag works');
const oldStrip=strip;elements();u.setupPetStrip();emit(w,'pointermove',{clientX:0});eq(oldStrip.scrollLeft,150,'old drag canceled on rerender');eq(strip.scrollLeft,100,'new strip not moved by old drag');
u.setupPetStrip();emit(strip,'pointerdown',{pointerType:'mouse',button:0,clientX:100});emit(w,'pointermove',{clientX:80});eq(strip.scrollLeft,120,'new drag works');emit(w,'pointerup',{});emit(w,'pointermove',{clientX:0});eq(strip.scrollLeft,120,'pointer release clears global drag');
console.log(JSON.stringify({assertions:n,errors:0}));
