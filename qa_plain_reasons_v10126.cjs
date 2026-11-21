const fs=require('fs'),vm=require('vm'),assert=require('assert');
const app={};const context={window:app,console};vm.createContext(context);
for(const file of ['deeppet-v10124-adaptive-narrative.js','deeppet-v10125-cause-ledger.js','deeppet-v10126-plain-reasons.js']){
  vm.runInContext(fs.readFileSync(__dirname+'/assets/js/'+file,'utf8'),context,{filename:file});
}
const languages=['zht','zh','en','ko','ja'];
function translate(lang,tw,en,ko,ja){if(lang==='zht')return tw;if(lang==='en')return en;if(lang==='ko')return ko;if(lang==='ja')return ja;
 const d={'風':'风','險':'险','數':'数','據':'据','測':'测','時':'时','間':'间','錄':'录','體':'体','變':'变','較':'较','動':'动','靜':'静','無':'无','價':'价','項':'项','顯':'显','嚴':'严','實':'实','與':'与','會':'会','這':'这','對':'对','需':'需','擇':'择','應':'应','緩':'缓','況':'况','夠':'够','務':'务','監':'监','較':'较','覺':'觉'};
 return [...tw].map(ch=>d[ch]||ch).join('');}
const samples={
 normal:{quietHeartRate:102,quietBreathRate:23,rmssd:45,sdnn:60,restHours:9.0,activity:160,recoveryDrop:12,heartRate:104},
 high:{quietHeartRate:150,quietBreathRate:41,rmssd:10,sdnn:14,restHours:5.2,activity:40,recoveryDrop:5,heartRate:155},
 low:{quietHeartRate:50,quietBreathRate:10,rmssd:90,sdnn:120,restHours:14,activity:250,recoveryDrop:20,heartRate:51}
};
const refs={quietHeartRate:100,quietBreathRate:22,rmssd:48,sdnn:62,restHours:9.5,activity:158,recoveryDrop:12.5};
const rows=[];let count=0;
const keys=['cardio','heart','breath','hrv','stable','sleep','energy','recovery','calm','activityRecovery','rhythm'];
for(const lang of languages){for(const key of keys){for(const score of [0,3,8,12,19,21,33,48,59,60,66,72,78,80,85,89,90,94,98,100]){
 const source=score<60?'high':'normal';const scores=Object.fromEntries([...keys.map(k=>[k,score]),['physiol',score]]);
 const c={key,keyName:key,score,scores,source:'display-fixture',features:samples[source],references:refs,date:'2026-11-20',days:1,isCurrent:true,translate:(...v)=>translate(lang,...v)};
 const band=app.DeepPetAdaptiveRisk124.band(score);
 const risk=app.DeepPetAdaptiveRisk124.describe(c);
 const ledger=app.DeepPetCompleteCauses125.explain(c);
 const plain=app.DeepPetPlainReasons126.explain(c);
 assert(band&&risk.lines.length&&Array.isArray(ledger.lines)&&Array.isArray(plain),'missing output');
 if(score<90){assert(plain.length>=2,'missing plain-language summary '+key+':'+score); assert(plain.every(x=>typeof x==='string'&&x.length>8),'incomplete language '+lang);}
 if(score<20){assert(ledger.ledger.length>=8,'missing all scored reasons '+key+':'+score);assert(plain.join(' ').includes('150')||plain.join(' ').includes('41')||plain.join(' ').includes('5.2')||plain.join(' ').includes('40')||plain.join(' ').includes('10')||key==='rhythm','missing measured values '+key+':'+score)}
 for(const l of [...plain,...ledger.lines,...risk.lines]){assert(!/\bundefined\b|\bNaN\b|\[object Object\]/.test(l),'bad interpolated value: '+l);}
 rows.push({lang,key,score,band:band.id,rules:risk.rules.length,plain:plain.length,evidence:ledger.lines.length});count++;
}}}
let distinct = new Set();for(let n=0;n<=100;n++){const b=app.DeepPetAdaptiveRisk124.band(n);assert(b);distinct.add(b.id);}assert.strictEqual(distinct.size,16);
for(const lang of languages){
 const make=(key,feat)=>{let s={cardio:4,heart:8,breath:2,hrv:2,stable:5,sleep:9,energy:5,recovery:69,calm:5,activityRecovery:19,rhythm:4};return {key,keyName:key,score:s[key],scores:s,source:'display-fixture',features:feat,references:refs,date:'2026-11-20',days:1,isCurrent:true,translate:(...v)=>translate(lang,...v)};};
 for(const key of ['heart','breath']){
  const up=app.DeepPetPlainReasons126.explain(make(key,samples.high)).join(' '),down=app.DeepPetPlainReasons126.explain(make(key,samples.low)).join(' ');
  assert.notStrictEqual(up,down,'up/down cannot be same: '+lang+' '+key);
 }
 const h=app.DeepPetPlainReasons126.explain(make('cardio',samples.high)).join(' ');
 const nl=app.DeepPetPlainReasons126.explain(make('cardio',{...samples.high,quietHeartRate:NaN,quietBreathRate:null})).join(' ');
 assert(!/\bNaN\b|\bundefined\b/.test(nl));assert(h!==nl,'missing observations should change copy');
}
fs.writeFileSync(__dirname+'/QA_PLAIN_OUTPUT_SAMPLE_V10.126.json',JSON.stringify(rows.filter(r=>r.lang==='zht'&&r.key==='cardio'),null,2));
console.log('PASS plain/dynamic risk tests',count,'contexts, 16 score bands, 5 languages, direction variation');
