/* V10.44 regression contract: preserve original fit reminder test and switch,
   provide separately simulated signal outage, and qualify settling windows. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const A=require('../assets/algorithm/wear-readiness-v1044.js');
const D=require('../assets/algorithm/wear-detection-v926.js');
const moduleSrc=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const good=(ms,verified=false)=>({connected:true,timestampMs:ms,heartWave:Array.from({length:40},(_,i)=>.6*Math.sin(i/4)),breathWave:Array.from({length:40},(_,i)=>.4*Math.sin(i/12)),...(verified?{metricsVerified:true}:{})});
const flat=ms=>({...good(ms),heartWave:Array(40).fill(0),breathWave:Array(40).fill(0)});
assert.equal(A.waveformPresent(good(0).heartWave),true);
assert.equal(A.waveformPresent(flat(0).heartWave),false);
assert.equal(A.create().update({...flat(0),qualityAccepted:true}).settled,false,'SDK quality flag cannot override a flat waveform');
const x=A.create();
for(let i=0;i<5;i++){const r=x.update(good(i*2000));assert.equal(r.settled,false,'no instant measurement on first five windows');assert.equal(r.metricsEligible,false);}
assert.equal(x.update(good(10000)).settled,true,'six accepted 2-second windows settle after 12 s');
assert.equal(x.update(flat(12000)).status,'checking_signal','one noisy window cannot instantly conclude slipped collar');
assert.equal(x.update(flat(14000)).status,'signal_unavailable','two invalid windows make signal unavailable');
for(let i=0;i<5;i++)assert.equal(x.update(good(16000+i*2000)).settled,false,'recovery needs fresh stable signal');
assert.equal(x.update(good(26000,true)).metricsEligible,true,'metrics require independent factory verification flag');
assert.equal(x.update({connected:false,timestampMs:28000}).status,'signal_unavailable');
assert.equal(x.update(good(30000)).settled,false,'radio reconnect cannot inherit old stability');
const y=A.create();
assert.equal(y.snapshot().status,'awaiting_signal','different pet/session must have independent readiness');
const outOfOrder=A.create();outOfOrder.update(good(0));outOfOrder.update(good(2000));
assert.equal(outOfOrder.update(good(12000)).goodWindows,1,'timeline gap resets stabilization');

const store=new Map();let popup=null;const doc={
 createElement(){return {innerHTML:'',id:'',className:'',remove(){popup=null;}};},
 body:{appendChild(node){popup=node;}},
 getElementById(id){return id==='dp926-wear-popup'?popup:null;},
 addEventListener(){},
};
const sandbox={window:null,state:{dog:0,lang:'en',tab:'me',detail:null},document:doc,
 onAction(){},render(){},selectedBlank(){return false;},isFreePet(){return false;},
 currentDog(){return {name:'Milo'};},dpCurrentPetId(){return 'pet-Milo';},
 DeepPetWearDetector926:D,
 localStorage:{getItem(k){return store.get(k)||null;},setItem(k,v){store.set(k,v);}},
};sandbox.window=sandbox;
vm.runInNewContext(moduleSrc('assets/js/ux_v926.js'),sandbox,{filename:'ux_v926.js'});
assert(moduleSrc('assets/js/ux_v926.js').includes('data-action="dp926-wear-toggle"'),'original reminder switch remains present');
assert(moduleSrc('assets/js/ux_v926.js').includes('data-action="dp926-wear-test"'),'original loose-fit test remains present');
assert(moduleSrc('assets/js/ux_v926.js').includes('data-action="dp1044-wear-test-radio"'),'second outage-preview test exists');
assert.equal(sandbox.DeepPetWear926.enabled(),true,'the original reminder default is on');
sandbox.onAction({dataset:{action:'dp926-wear-test'}});
assert(popup?.innerHTML.includes('Please re-fit the collar'));
assert(!popup.innerHTML.includes('dp926-wear-disable'),'preview popup must never turn off user switch');
assert.equal(store.size,0,'preview never persists any simulated wear state');
sandbox.onAction({dataset:{action:'dp926-wear-close'}});
sandbox.onAction({dataset:{action:'dp1044-wear-test-radio'}});
assert(popup?.innerHTML.includes('Signal temporarily unavailable'));
assert(!popup.innerHTML.includes('dp926-wear-disable'));
assert.equal(store.size,0,'radio preview never changes device pairing, quality or score');
sandbox.onAction({dataset:{action:'dp926-wear-close'}});
sandbox.onAction({dataset:{action:'dp926-wear-toggle'}});
assert.equal(sandbox.DeepPetWear926.enabled(),false,'real original switch still works');
sandbox.DeepPetWear926.preview();
assert.equal(sandbox.DeepPetWear926.enabled(),false,'preview cannot reset reminder preference');
assert(!popup.innerHTML.includes('dp926-wear-disable'));

// Exercise the actual neutral 20Hz adapter without requiring physical SDK.
const SDKModule=require('../assets/algorithm/sdk20hz-adapter.js');
globalThis.DeepPetWearReadiness1044=A;
const statusLog=[];
const sdk=SDKModule.createSession({petId:'pet-test'}, {connected:true,onSignalReadiness:s=>statusLog.push(s)});
const wave=(n,period)=>Array.from({length:n},(_,i)=>.7*Math.sin(2*Math.PI*i/period));
const makeChunk=(at,zero=false,connected=true)=>({petId:'pet-test',date:'2026-11-16',startLocalSecond:at,fs:20,connected,
 heartWave:zero?Array(600).fill(0):wave(600,16),breathWave:zero?Array(600).fill(0):wave(600,92),motionWave:Array(600).fill(0)});
assert.equal(sdk.append(makeChunk(0)).signalReadiness.settled,true,'healthy sample sequence recovers after 12 seconds');
assert.equal(sdk.append(makeChunk(30,true)).signalReadiness.status,'signal_unavailable','continuous zeros are a signal issue, not zero vital signs');
assert.equal(sdk.append(makeChunk(60)).signalReadiness.settled,true,'signal can re-establish after its next good 12 seconds');
assert(statusLog.length>=45);
assert.equal(sdk.status.petId,'pet-test');
assert.match(fs.readFileSync(path.join(__dirname,'..','VERSION.txt'),'utf8').trim(),/^DeepPet V10\.(?:44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|79|80|81|82|83|84|85|87|88|89|90|91|92|93|94|95|96|97|98|99|100|101)$/);
console.log('PASS DeepPet V10.44: original reminder switch, both non-mutating preview scenarios, 12-second settling, loss/recovery, 20Hz owner session.');
