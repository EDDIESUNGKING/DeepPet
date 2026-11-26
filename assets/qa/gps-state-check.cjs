const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const code=fs.readFileSync(path.join(__dirname,'../js/release-206.js'),'utf8');
const body=code.slice(code.indexOf('const finite='),code.indexOf('const calendarState='));
const now=1700000000000;
const state={dog:1,emptyPreview:false,connected:true,deviceType:'4g',connectedId:'REAL-1',geoPositionsByPet:{'1':{source:'verified-4g-gps',deviceId:'REAL-1',point:[150,80],time:now}}};
const c={state,root:{DeepPetLiveRadioSession:{matches:(p,id)=>p===1&&id==='REAL-1'}},dogs:[{},{}],currentDog:()=>({}),gpsForCurrentPet:()=>true,Date:{now:()=>now}};
vm.runInNewContext(body+';globalThis.test={preview,paired,freshLocation,located};',c);
const t=c.test,v=state.geoPositionsByPet['1'];let n=0;
function test(label,fn){fn();n++;console.log('PASS '+label)}
test('fresh authenticated location',()=>assert.equal(t.located(),true));
for(const [key,value,label] of [['point',null,'missing coordinate'],['point',[NaN,80],'invalid coordinate'],['point',[361,80],'outside map bounds'],['time',now-120000,'expired location'],['time',now+6000,'future location'],['deviceId','OTHER','other device'],['source','demo','unverified source']])test(label,()=>{const old=v[key];v[key]=value;assert.equal(t.located(),false);v[key]=old;});
test('other pet',()=>{state.dog=0;assert.equal(t.located(),false);state.dog=1});
test('disconnected',()=>{state.connected=false;assert.equal(t.located(),false);state.connected=true});
test('wrong product',()=>{state.deviceType='bluetooth';assert.equal(t.located(),false);state.deviceType='4g'});
test('blank',()=>{state.emptyPreview=true;assert.equal(t.located(),false);state.emptyPreview=false});
test('preview isolated from authenticated fresh location',()=>{state.connectedId='DP-VIRTUAL-4G-001';assert.equal(t.preview(),true);assert.equal(t.freshLocation(),false);state.connectedId='REAL-1'});
console.log('TOTAL '+n+'; isolated state transitions, not real radio or geographic lat/lon.');
