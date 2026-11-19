/* V10.43: prospective, owner-specific, context-aware quality and event QA. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const T=require('../assets/algorithm/trend-alerts-v1043.js');
const B=require('../assets/algorithm/engine-v2.js');
const dateAt=n=>new Date(Date.UTC(2026,9,1+n,12)).toISOString().slice(0,10);
const filled=(n=1440,h=72,b=19,m=4,context=null)=>({heart:Array(n).fill(h),breath:Array(n).fill(b),activity:Array(n).fill(m),quality:Array(n).fill(true),...(context?{context:Array(n).fill(context)}:{})});
const history=(count=14,context=null)=>Array.from({length:count},(_,i)=>({date:dateAt(i),valid:true,...filled(1440,72,19,4,context)}));
const target=dateAt(14);
function candidate(h,b,ctx=null){const x={date:target,valid:true,...filled(1440,72,19,4,ctx)};
 for(let i=30;i<35;i++){x.heart[i]=h;x.breath[i]=b;}return x;}
function scan(x,hist=history()){return T.evaluate({...x,history:hist});}
const high=scan(candidate(115,36));assert.equal(high.ready,true);assert(high.events.some(x=>x.kind==='heart'&&x.direction==='high'));assert(high.events.some(x=>x.kind==='breath'&&x.direction==='high'));assert.equal(high.joint?.direction,'breath_high_hr_high');
const low=scan(candidate(40,9));assert(low.events.some(x=>x.kind==='heart'&&x.direction==='low'));assert(low.events.some(x=>x.kind==='breath'&&x.direction==='low'));
const jointLow=scan(candidate(115,9));assert.equal(jointLow.joint?.direction,'breath_low_hr_high');
const unknownQuality=candidate(115,36);unknownQuality.quality[31]=null;assert(!scan(unknownQuality).joint,'missing minute quality cannot count');
const missingQualityHist=history();missingQualityHist[0].quality.fill(undefined);assert.equal(scan(candidate(115,36),missingQualityHist).ready,false,'unproven historical quality does not calibrate');
const motion=candidate(115,36);motion.activity[27]=40;assert.equal(scan(motion).joint,null,'recent exertion must not look like an emergency');
const noContact=candidate(115,36);noContact.breath[31]=0;assert.equal(scan(noContact).joint,null,'zero signal is not low breathing');
assert.equal(scan(candidate(115,36),history(13)).ready,false,'14 earlier distinct days required');
const duplicate=history();duplicate.push({...duplicate[0],heart:Array(1440).fill(96)});
assert.equal(scan(candidate(115,36),duplicate).ready,false,'conflicting equal-coverage day excluded');
const future=history(13);future.push({date:dateAt(15),valid:true,...filled()});
assert.equal(scan(candidate(115,36),future).ready,false,'future day never counts');
const restVsSleep=history(14,'sleep');
for(const x of restVsSleep){for(let i=720;i<1440;i++){x.context[i]='rest';x.heart[i]=92;x.breath[i]=24;}}
const nocturnal=candidate(110,34,'sleep');
for(let i=0;i<1440;i++)if(i>=720){nocturnal.context[i]='rest';nocturnal.heart[i]=92;nocturnal.breath[i]=24;}
const ctxResult=scan(nocturnal,restVsSleep);assert.equal(ctxResult.contextReferences?.sleep?.days,14);
assert(ctxResult.events.some(e=>e.kind==='heart'&&e.context==='sleep'));
const sparseCtx=history(14);
for(let i=0;i<7;i++){sparseCtx[i].context=Array(1440).fill('sleep');}
const noCtx=scan(nocturnal,sparseCtx);assert.equal(noCtx.contextReferences?.sleep?.days,undefined,'seven sleep days cannot claim a complete 14-day sleep reference');
const sixCtx=history(14);for(let i=0;i<6;i++)sixCtx[i].context=Array(1440).fill('sleep');
assert.equal(scan(nocturnal,sixCtx).events.filter(e=>e.context==='sleep').length,0,'6 context days cannot form context-specific alert');

// The exact 70% personalized + 30% cohort weighting stays intact; its P14
// estimate becomes a bounded robust mean, not a plain outlier-sensitive mean.
const oldFeatures=history(14).map((x,i)=>({date:x.date,petId:'pet-test',source:'sdk-demo-fixture',
 quietHeartRate:i===8?270:70,quietBreathRate:19,heartSpread:5,breathSpread:2,heartRate:80,breathRate:22,
 quality:{heartValid:true,respValid:true,restQuality:true},restHours:8,restFraction:.44,motionMean:20,motionVariation:3}));
const newer={...oldFeatures[0],date:dateAt(14),quietHeartRate:74};
const scored=B.scoreDay([...oldFeatures,newer],14,{groupReferenceByKey:{quietHeartRate:75,quietBreathRate:19,heartRate:80,breathRate:22}});
assert.equal(scored?.baseline?.personalWeight,.70);
assert(scored.baseline.references.quietHeartRate.personal<75,'one extreme day must not hijack fourteen-day personal reference');
assert.equal(scored.baseline.references.quietHeartRate.ref,
  .70*scored.baseline.references.quietHeartRate.personal+.30*75);
const partialPeriod=Array.from({length:30},(_,i)=>({date:dateAt(i),petId:'pet-test',scores:{cardio:i<3?88:null,sleep:i<3?88:null,physiol:i<3?88:null}}));
const week=B.periodScores(partialPeriod,7,dateAt(6)),month=B.periodScores(partialPeriod,30,dateAt(29));
assert.equal(week.minQualifiedDays,4);assert.equal(week.scores.cardio,null,'only three good days cannot be reported as a full 7-day score');
assert.equal(month.minQualifiedDays,15);assert.equal(month.scores.sleep,null,'only three good days cannot be reported as a full 30-day score');
partialPeriod[3].scores.cardio=85;
assert(Number.isFinite(B.periodScores(partialPeriod,7,dateAt(6)).scores.cardio),'four good days permit a seven-day estimate');

const ux=fs.readFileSync(require.resolve('../assets/js/ux_v1042.js'),'utf8');
const battery=fs.readFileSync(require.resolve('../assets/js/ux_v1035.js'),'utf8');
const gps=fs.readFileSync(require.resolve('../assets/js/app_03.js'),'utf8');
assert(!ux.includes('dp1042-toggle-wear'),'no duplicate manual unworn interaction');
assert(!battery.includes('dp1042UnwornByPet')&&!gps.includes('dp1042UnwornByPet'),'stale manual-unwear state cannot mask factory signal assessment');
assert(ux.includes('r?.ownerId!==String(state.dog)'),'real history must match selected pet');
assert(ux.includes('current.reason===\'under_14_eligible_days\''),'real pet missing bridge never uses synthetic fallback');
assert(/^DeepPet V10\.(43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|79|80|81|82|83|84|85|87|88|89|90|91|92|93|94|95|96|97|98|99|100|101)$/.test(fs.readFileSync(require.resolve('../VERSION.txt'),'utf8').trim()));
console.log('PASS DeepPet V10.43: no duplicate unwear; 14 valid days; robust P14; context-matched sleep/rest; pre-event quiet; minute-quality/zero/exertion/cross-pet/future-data gates.');
