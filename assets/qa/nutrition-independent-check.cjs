const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const text=fs.readFileSync(path.join(__dirname,'../js/verified.js'),'utf8');
const start=text.indexOf(';/* assets/algorithm/personalization-v941.js */'),end=text.indexOf(';/* assets/js/ux_v941.js */',start);const c={};vm.runInNewContext(text.slice(start,end),c);const A=c.DeepPetPersonalization941;
let cases=0;for(const species of ['dog','cat'])for(const [breed,weights] of [['Mixed breed',[.5,1,4,9,10,24,25,40,55,150]],['Alaskan Malamute',[20,40,55]],['Chihuahua',[1,2,4]]])for(const age of [0,0.2,1/3,.99,1,6,7,10,11,20,35])for(const weight of weights){
 const p={name:'test',species,breed,age,weight};const d=A.diet(p);const rer=70*Math.sqrt(weight*Math.sqrt(weight));assert.equal(d.available,true);assert.ok(Math.abs(d.rer-rer)<=.00500000001);assert.equal(d.targetKcal,Math.floor(rer*d.factor/10+.5)*10);assert.ok(d.vetCalibrate);assert.equal(d.unit,'kcal/day');cases++;
}
const p={name:'test',species:'dog',breed:'mixed',age:2,weight:10};for(const [key,value] of [['name',''],['species','bird'],['breed','not set'],['age',null],['age',-1],['age',36],['age',Infinity],['weight',0],['weight',-1],['weight',151],['weight',NaN]]){assert.equal(A.diet({...p,[key]:value}).available,false);cases++}
console.log(JSON.stringify({cases,failures:0,note:'RER arithmetic and input boundary validation only; MER multipliers not clinically individualized or independently validated.'},null,2));
