/* DeepPet V10.46 trend, structure, date-overlap and anti-fabrication checks. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const chart=require('../assets/algorithm/trend-display-v1046.js');
const root=path.resolve(__dirname,'..');
const src=name=>fs.readFileSync(path.join(root,name),'utf8');
const full=Array.from({length:30},(_,i)=>{
  const date=new Date(Date.UTC(2026,9,18+i)).toISOString().slice(0,10);
  return {date,value:Math.min(100,Math.max(0,82+Math.round(11*Math.sin(i*.71)+4*Math.cos(i*.23))))};
});
const seven=chart.shape(full,7,{mode:'score'}),thirty=chart.shape(full,30,{mode:'score'});
assert.deepEqual(seven.points.map(x=>[x.date,x.value]),
 thirty.points.slice(-7).map(x=>[x.date,x.value]),
 '7-day curve is the exact date-value suffix of 30-day curve');
assert.deepEqual(seven.bounds,thirty.bounds,
 'both ranges retain the exact same scale for a pet and metric');
assert.equal(seven.path.match(/\bM\b/g).length,1,'7 valid days are connected');
assert.equal(thirty.path.match(/\bM\b/g).length,1,'30 valid days are connected');
assert.equal(seven.path.match(/\bL\b/g).length,6,'all 7 daily dots join');
assert.equal(thirty.path.match(/\bL\b/g).length,29,'all 30 daily dots join');
const high=Array.from({length:30},(_,i)=>({
 date:new Date(Date.UTC(2026,10,i+1)).toISOString().slice(0,10),
 value:96+(i%5)
}));
assert(chart.domain(high,'score')[0]>=90,'high-scoring energy has a readable adaptive axis');
assert.deepEqual(chart.shape(high,7,{mode:'score'}).bounds,
 chart.shape(high,30,{mode:'score'}).bounds);
const missing=full.map((r,i)=>i===8?{...r,value:null}:r);
assert.equal(chart.shape(missing,30,{mode:'score'}).path.match(/\bM\b/g).length,2,
 'true missing readings remain a marked gap, never manufactured by joining');
assert.deepEqual(chart.normalize([{date:'2026-11-01',value:null}]),[{date:'2026-11-01',value:null}],
 'N/A is not converted to a zero score');
assert(chart.chart(missing,30,{title:'Recovery',unit:'bpm'}).includes('N/A'),
 'missing-data disclosure is visible');
assert(chart.chart(full,30,{title:'Recovery',unit:'bpm'}).includes('data-chart-values='),
 'chart retains inspectable date and measurement pairs');
const css=src('assets/css/ux_v1046.css'),ux=src('assets/js/ux_v1046.js'),
 build=src('build.mjs'),pack=src('package_latest.mjs'),version=src('VERSION.txt');
for(const name of [
 '.dp1046-primary-head','.dp1046-primary-stack',
 '.dp905-sleep-day','.dp905-sleep-summary',
 '.dp1046-baseline-spark','.dp1046-battery-number',
 '.dp-upcoming-care .dp999-more>summary::after']){
 assert(css.includes(name),name+' must have a focused geometry/color rule');
}
assert(ux.includes('data-chart-kind')===false,'chart markup originates from one pure renderer');
assert(ux.includes('old.outerHTML=activity+score'),'energy details show movement plus score');
assert(ux.includes('mapSeries(rows,key)'),'7/30 recovery and calm share their daily source');
assert(ux.includes('textContent=readable()'),'period controls use only detailed-data label');
assert(ux.includes('newBaselineSpark'),'the 14-day widget has its own score series');
assert(ux.includes('state.connected'),'unpaired devices never invent battery percentage');
for(const name of ['ux_v1046.css','ux_v1046.js','trend-display-v1046.js'])
 assert(build.includes(name),'production bundle must include '+name);
assert(/deeppet-v10101-[a-f0-9]{12}\.js/.test(src('index.html'))&&pack.includes('deeppet-v${tag}-'),
 'package must load the current version-hashed runtime bundle');
assert(/^DeepPet V10\.(?:46|47|48|49|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|79|80|81|82|83|84|85|87|88|89|90|91|92|93|94|95|96|97|98|99|100|101)$/.test(version.trim()));
const old=src('assets/js/app_03.js');
const count=(old.match(/\{name:'(?:Milo|Luna|Coco|Leo|Poppy|Nori|Miso|Mochi|Kiki|Max|Rex|Bella|Simba|Snowy|Lucky)'/g)||[]).length;
assert(count>=12,'gallery pet fixture source has not been stripped');
assert(old.includes('function selectedBlank')&&old.includes('function dp58FreshPet')===false||
 old.includes('function selectedBlank'),'existing blank profile handling remains');
console.log('PASS DeepPet V10.46: 7/30 exact overlap, same y scale, continuous full data, N/A gaps, high-score readability, sleep ring geometry, Me baseline, pairing battery, preserved fixtures, build contract.');
