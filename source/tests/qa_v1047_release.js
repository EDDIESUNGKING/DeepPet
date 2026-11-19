/* DeepPet V10.47: no missing-as-zero rollups or fabricated hourly scores. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const src=p=>fs.readFileSync(path.join(root,p),'utf8');
const extract=(file,begin,end)=>{
 const txt=src(file),i=txt.indexOf(begin),j=txt.indexOf(end,i+begin.length);
 assert(i>=0&&j>i,`Unable to isolate ${begin}`);
 return txt.slice(i,j);
};
const run=(code,scope,expose)=>{
 const sandbox={...scope};vm.runInNewContext(code+`\nglobalThis.exposed=${expose};`,sandbox);
 return sandbox.exposed;
};
const clamp=x=>x===null||x===undefined||x===''||!Number.isFinite(Number(x))?null:Number(x);
const mean=a=>a.length?Math.round(a.reduce((s,x)=>s+x,0)/a.length):null;
const mockRows=[
 {idx:0,date:'2026-11-11',energy:82,recovery:76,calm:64,all:74},
 {idx:1,date:'2026-11-12',energy:88,recovery:null,calm:92,all:86},
 {idx:2,date:'2026-11-13',energy:92,recovery:80,calm:null,all:85},
 {idx:3,date:'2026-11-14',energy:96,recovery:null,calm:88,all:null}
];
const scores=run(extract('assets/js/ux_v903.js','function threePeriodScores(days){','const priorDayDetail'),{
 dayRowsWithIndex:()=>mockRows,validDaySample:()=>({valid:true}),
 three:r=>({energy:r.energy,recovery:r.recovery,calm:r.calm,all:r.all}),
 finite:clamp,avgScore:mean
},'threePeriodScores');
const aggregate=scores(30);
assert.equal(aggregate.vals.energy,90,'energy mean must include four individually valid days');
assert.equal(aggregate.vals.recovery,78,'two missing recovery dates are not zero values');
assert.equal(aggregate.vals.calm,81,'missing calm date is not zero and its denominator is three');
assert.equal(aggregate.overall,82,'overall uses only the three valid daily composites');

const rowDates=Array.from({length:7},(_,i)=>({idx:i,date:`2026-11-${String(i+10).padStart(2,'0')}`}));
const metric=run(extract('assets/js/app_03.js','function dpOwnerPeriodMetricChart(rows,key,color,customValues=null,displayUnit=\'\'){','function dpHrvValuesPanel'),{
 state:{range:7},dayRowsWithIndex:()=>rowDates,label3:(a)=>a,esc:x=>x,
 inspectSvg:s=>s
},'dpOwnerPeriodMetricChart');
const metricHtml=metric([rowDates[0],rowDates[1],rowDates[3],rowDates[4],rowDates[5],rowDates[6]],
 'energy','#4387dc',[81,84,88,86,90,92],'/100');
assert((metricHtml.match(/\bM\s+\d/g)||[]).length===2,
 'true missing calendar date creates a second path segment');
assert(metricHtml.includes('2026-11-16')===false,'date ticks use the original short calendar labels');

let chartValues=null,chartMeta=null;
const activity=Array.from({length:1440},(_,minute)=>minute<720?20:80);
const hourly=run(extract('assets/js/app_03.js','function dpEnergyHourlyChart(row,dayScore){','// V8.66:'),{
 dpSignals:()=>({activity}),label3:x=>x,deepCurvePath:pts=>pts.map((p,i)=>(i?'L':'M')+p.join(',')).join(' '),
 inspectSvg:(svg,values,meta)=>{chartValues=Array.from(values);chartMeta=meta;return svg;}
},'dpEnergyHourlyChart');
const first=hourly({date:'2026-11-16'},5);
assert.equal(chartValues.length,24,'hourly movement chart contains 24 observed hourly means');
assert(chartValues.slice(0,12).every(x=>x===20));
assert(chartValues.slice(12).every(x=>x===80));
assert.equal(chartMeta.kind,'activity','activity is not mislabeled hourly energy');
assert.equal(chartMeta.unit,'%');
assert(!first.includes('每小時精力分數'),'no fabricated hourly energy claim');
hourly({date:'2026-11-16'},99);
assert(chartValues.slice(0,12).every(x=>x===20),
 'hourly activity line must not change when the daily energy score changes');

let recoveryValues=null,recoveryMeta=null;
const heart=Array(1440).fill(84);heart[9]=130;heart[11]=111;heart[12]=100;
const recoveryCurve=run(extract('assets/js/app_03.js','function dpOwnerRecoveryCurve(row,recovery){','function dpOwnerRhythmCard'),{
 state:{range:1},dpSignals:()=>({heart}),dpTime:minute=>String(minute),
 label3:x=>x,inspectSvg:(svg,values,meta)=>{
  recoveryValues=Array.from(values);recoveryMeta=meta;return svg;
 }
},'dpOwnerRecoveryCurve');
const recoveryHtml=recoveryCurve({date:'2026-11-16'},{minute:10});
assert.deepEqual(recoveryValues,[130,111,100],
 '0/60/120-second recovery observations must be the original minute values');
assert.deepEqual(Array.from(recoveryMeta.timeLabels),['0 s','60 s','120 s']);
assert(recoveryHtml.includes('不再補造15秒波動'),
 'explicitly disclose that artificial 15-second observations were removed');
assert(!extract('assets/js/app_03.js','function dpOwnerRecoveryCurve(row,recovery){','function dpOwnerRhythmCard').includes('Math.sin('),
 'recovery plot must not add decorative sinusoidal values');

const data=[
 {idx:0,date:'2026-11-15',valid:true},
 {idx:1,date:'2026-11-16',valid:true},
 {idx:2,date:'2026-11-17',valid:true}
];
const engine=[{scores:{energy:78,calm:72}},{scores:{energy:null,calm:61}},{scores:{energy:80,calm:87}}];
const mapSeries=run(extract('assets/js/ux_v1046.js','function mapSeries(records,metric) {','function newBaselineSpark()'),{
 root:{DeepPetSignalScoring:{getDaily:()=>engine}},state:{dog:0},
 rhythmData:()=>({values:[{calm:99},{calm:98},{calm:97}]}),
 dpOwnerDayScores:()=>({energy:99}),dpRecovery2Min:()=>({average:17}),
 dpSignals:()=>({activity:Array(1440).fill(20)}),
 dpOwnerQualityValue:x=>Math.round(x),finite:x=>typeof x==='number'&&Number.isFinite(x)
},'mapSeries');
assert.deepEqual(Array.from(mapSeries(data,'energy'),x=>x.value),[78,null,80],
 'energy detail must be the same source as the parent score cards');
assert.deepEqual(Array.from(mapSeries(data,'calm'),x=>x.value),[72,61,87],
 'calm detail must not display unrelated legacy rhythm values');

const dailyTrend=run(extract('assets/js/ux_v905.js','function dailyTrend(rows,metric){','const oldPeriod'),{
 dayScore:r=>r.score,T:x=>x,metricLabel:x=>x,dateTitle:x=>x.slice(5)
},'dailyTrend');
const dailyHtml=dailyTrend([{date:'2026-11-10',score:88},{date:'2026-11-11',score:null},
 {date:'2026-11-12',score:92}], 'energy');
assert((dailyHtml.match(/\bM\d/g)||[]).length===2,
 'weekly daily-score SVG must not bridge a genuine missing day');

const ux=src('assets/js/ux_v1046.js'),version=src('VERSION.txt').trim();
assert(ux.includes('stamp.textContent=freshness'),'SDK battery freshness must not be reparsed as HTML');
assert(['DeepPet V10.47','DeepPet V10.48','DeepPet V10.49','DeepPet V10.50','DeepPet V10.51','DeepPet V10.52','DeepPet V10.53','DeepPet V10.54','DeepPet V10.55','DeepPet V10.101'].includes(version));
assert(src('build.mjs').includes('ux_v1046.js'),'production contains corrected V10.46 display layer');
assert(src('package_latest.mjs').includes('README.md'),'editable source and guidance must be included in the source package');
console.log('PASS DeepPet V10.47: per-metric denominators, aligned engine scores, real hourly activity, real 0/60/120-second recovery observations, gap-aware curves and safe battery timestamp.');
