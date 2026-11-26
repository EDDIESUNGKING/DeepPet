/* V10.199 — single source-neutral Deep scoring model. Prototype wellness indices,
 not validated clinical thresholds. All missing evidence remains missing. */
(function(root){'use strict';
const F=Number.isFinite,clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v)),round=v=>F(v)?Math.round(clamp(v)):null;
const mean=a=>{a=a.filter(F);return a.length?a.reduce((s,x)=>s+x,0)/a.length:null};
const median=a=>{a=a.filter(F).sort((a,b)=>a-b);return a.length?(a[(a.length-1)>>1]+a[a.length>>1])/2:null};
const weightedMedian=(rows,key,w)=>{const a=rows.filter(x=>F(x[key])&&F(w(x))&&w(x)>0).slice().sort((x,y)=>x[key]-y[key]);const total=a.reduce((n,x)=>n+w(x),0);let cum=0;for(let i=0;i<a.length;i++){cum+=w(a[i]);if(cum>total/2)return a[i][key];if(Math.abs(cum-total/2)<1e-8)return (a[i][key]+(a[i+1]?.[key]??a[i][key]))/2;}return null;};
const sd=a=>{a=a.filter(F);const m=mean(a);return a.length>1?Math.sqrt(mean(a.map(x=>(x-m)**2))):null};
const W=Object.freeze({cardio:{heart:.32,breath:.32,hrv:.20,stable:.16},energy:{motion:.45,cardio:.25,sleep:.30},calm:{hrv:.35,heart:.30,breath:.20,rest:.15},activityRecovery:{energy:.40,recovery:.35,calm:.25},physiol:{cardio:.35,sleep:.30,activityDomain:.35},rhythm:{hrv:.25,stable:.45,heart:.18,breath:.12}});
function weight(parts,weights,required=[],guard=false){const used=Object.keys(weights).filter(k=>F(parts[k]));
 // All published composite weights are integer percentages. Use integer
 // weights to avoid binary floating-point half-point errors (e.g. 92.5).
 const w=used.reduce((s,k)=>s+Math.round(weights[k]*100),0),num=used.reduce((s,k)=>s+parts[k]*Math.round(weights[k]*100),0);
 const avg=w?num/w:null,weak=used.length?Math.min(...used.map(k=>parts[k])):null;
 const base=F(avg)&&required.every(k=>F(parts[k]))?round(guard?avg-.35*Math.max(0,avg-weak):avg):null;
 return {score:base,weight:w/100,used,complete:w===100,observedMean:F(avg)?round(avg):null,weakest:weak};}
const dateAdd=(d,n)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
const stamp=(d,i)=>d+'T'+String(Math.floor(i/60)).padStart(2,'0')+':'+String(i%60).padStart(2,'0');
// Home resting reference envelope: broad physiological ranges, not diagnostic cutoffs.
// Continuous size adjustment avoids discontinuities; age and activity targets are engineering priors.
// Life-stage model: approximate expected lifespan from adult size (not a diagnosis or a breed-specific survival forecast).
// Use known adult/ideal mass if supplied; puppies' current mass is not a reliable adult-size predictor.
// Breed adult-mass priors (kg, rounded AKC adult ranges); not clinical rate thresholds.
const BREEDS=[[/alaskan malamute|阿拉斯加|말라뮤트/i,'malamute',36],[/golden retriever|金毛|黃金獵犬|골든 리트리버/i,'golden',29],[/labrador|拉布拉多/i,'labrador',30],[/german shepherd|德国牧羊|德國牧羊/i,'german-shepherd',34],[/saint bernard|st\.? bernard|圣伯纳|聖伯納/i,'saint-bernard',65],[/rottweiler|罗威纳|羅威納/i,'rottweiler',46],[/standard poodle|巨型贵宾|巨型貴賓|标准贵宾|標準貴賓/i,'standard-poodle',25],[/miniature poodle|迷你贵宾|迷你貴賓/i,'miniature-poodle',6],[/toy poodle|玩具贵宾|玩具貴賓/i,'toy-poodle',2.5],[/shiba|柴犬/i,'shiba',9],[/beagle|比格|米格魯/i,'beagle',10],[/french bulldog|法斗|法鬥|法国斗牛|法國鬥牛/i,'french-bulldog',11,true],[/pug|巴哥|八哥/i,'pug',7,true],[/english bulldog|英国斗牛|英國鬥牛/i,'bulldog',21,true],[/boxer|拳师|拳師/i,'boxer',28,true],[/cavalier king charles/i,'cavalier',7],[/chihuahua|吉娃娃/i,'chihuahua',2.5],[/dachshund|腊肠|臘腸/i,'dachshund',null],[/persian|波斯/i,'persian',null,true],[/exotic shorthair|异国短毛|異國短毛/i,'exotic',null,true],[/ragdoll|布偶/i,'ragdoll',null],[/british shorthair|英短|英国短毛|英國短毛/i,'british-shorthair',null],[/bengal|孟加拉/i,'bengal',null],[/scottish fold|折耳/i,'scottish-fold',null]];
const breedName=p=>typeof p.breed==='string'?p.breed:Object.values(p.breed||{}).join(' ');
const isCat=p=>{const v=String(p.species??'').trim().toLowerCase();if(/^(cat|feline|貓|猫|貓咪|猫咪|ねこ|ネコ|고양이)$/.test(v))return true;if(/^(dog|canine|犬|狗|狗狗|イヌ|いぬ|개|강아지)$/.test(v))return false;return /\bcat\b|貓|猫/i.test(breedName(p))||BREEDS.slice(18).some(x=>x[0].test(breedName(p)));};
const numericProfile=v=>(typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&F(Number(v))?Number(v):null;
const positiveNumber=v=>numericProfile(v)>0?numericProfile(v):null;
const validAge=v=>{const n=numericProfile(v);return F(n)&&n>=0?n:null;};
function breedProfile(p){const cat=isCat(p),name=breedName(p),found=BREEDS.find((x,i)=>(cat?i>=18:i<18)&&x[0].test(name));return {id:found?.[1]??'unknown-or-mixed',adultMassPrior:cat?null:found?.[2]??null,respiratoryAttention:found?.[3]===true,known:!!found};}
function lifeStage(p){const cat=isCat(p),kg=positiveNumber(p.weight)??positiveNumber(p.weightKg),age=validAge(p.age)??validAge(p.ageYears),knownAge=F(age),breed=breedProfile(p),adult=positiveNumber(p.adultWeightKg)??positiveNumber(p.idealWeightKg),isJuvenile=knownAge&&age<1,mass=F(adult)?adult:!cat&&isJuvenile&&F(breed.adultMassPrior)?breed.adultMassPrior:F(kg)?kg:breed.adultMassPrior??(cat?4.5:20);
 const interp=(x,knots)=>{if(x<=knots[0][0])return knots[0][1];for(let i=1;i<knots.length;i++)if(x<=knots[i][0]){const [a,b]=knots[i-1],[c,d]=knots[i];return b+(d-b)*(x-a)/(c-a);}return knots.at(-1)[1];};
 const lifespan=cat?14:interp(mass,[[5,13.5],[10,13.5],[20,12.7],[40,11.5],[55,9.5],[75,9.5]]),seniorAt=cat?10:.75*lifespan,matureAt=cat?7:Math.min(4,.30*lifespan),a=knownAge?age:4,young=clamp(1-a,0,1),maturity=clamp((a-1)/Math.max(1,seniorAt-1),0,1),aging=clamp((a-matureAt)/Math.max(1,lifespan-matureAt),0,1),senior=clamp((a-seniorAt)/Math.max(1,lifespan-seniorAt),0,1);
 return {age:knownAge?age:null,mass,estimatedLifespan:lifespan,seniorAt,matureAt,stage:!knownAge?'unknown':a<1?'juvenile':a<matureAt?'young-adult':a<seniorAt?'mature-adult':'senior',young,maturity,aging,senior,breed,adultMassSource:F(adult)&&adult>0?"provided-adult":!cat&&isJuvenile&&F(breed.adultMassPrior)?"breed-prior":F(kg)&&kg>0?"measured":"fallback",adultMassUncertain:!cat&&a<1&&!(F(adult)&&adult>0)};}
function group(p){const life=lifeStage(p),cat=isCat(p),{mass,young,maturity,aging,senior}=life,t=clamp(Math.log(mass/5)/Math.log(45/5),0,1);
 // Broad safety envelope is not relaxed for older animals. Mild center adjustment only; actual clinical age-specific percentiles are not established here.
 // AI-COLLAR home resting medians: small ~65, small/medium ~62, large ~59.5 bpm.
 // Smooth size approximation; young/adult/older effect follows direction of cohort evidence.
 const sizeHr=67-8*clamp(Math.log(mass/5)/Math.log(60/5),0,1);
 const hr=cat?132+12*young+3*aging:sizeHr+19*young+8*aging,hrLow=cat?100:50-5*t,hrHigh=cat?160+15*young:140-20*t+20*young;
 const rr=cat?22+2*young:17.2-1.6*clamp(Math.log(mass/10)/Math.log(40/10),0,1)+4.4*young+.5*aging;
 // Conservative prototype targets; lower expected activity with relative life stage, not lower attainable score.
 const activityTarget=(cat?.20:.28)*(1+.15*young+.08*(1-maturity)-.30*aging)*(cat?1:1-.08*t);
 return {hr,rr,hrLow,hrHigh,rrLow:cat?15:12,rrHigh:30,night:(cat?8:7)+.35*aging+.45*young+(cat?0:.35*t),day:(cat?6:5)+.65*aging+.75*young+(cat?0:.45*t),activityTarget,quietTarget:(cat?.48:.40)+.035*aging,species:cat?'cat':'dog',breed:life.breed,lifeStage:life,hrvScale:1-.10*aging};}
// Outside-band distance is scale-normalized. A normal band is not a single ideal point.
function bandLoss(v,lo,hi){return !F(v)||!F(lo)||!F(hi)||lo<=0||hi<=lo?null:Math.max(0,(lo-v)/lo,(v-hi)/hi);}
function bandScore(v,lo,hi,k=5){const d=bandLoss(v,lo,hi);return F(d)?100*Math.exp(-k*d*d):null;}
// Normal envelope establishes safety; center-fit and within-day changes establish quality.
// A good but not optimal observation can score well without automatically becoming 100.
function vitalFit(v,key,ref){const heart=key==='hr',lo=heart?ref.hrLow:ref.rrLow,hi=heart?ref.hrHigh:ref.rrHigh,center=heart?ref.hr:ref.rr;
 const broad=bandScore(v,lo,hi);if(!F(broad)||!F(center)||center<=0)return null;
 const relative=Math.abs(v-center)/center,tolerance=heart?(ref.hrTolerance??0):(ref.rrTolerance??0);
 return broad*(1-.18*(1-Math.exp(-8*Math.max(0,relative-tolerance)**2)));}
const contextualRefs=new WeakMap();
const refAt=(ref,ts)=>{const h=Number(ts?.slice(11,13)),part=h<8||h>=20?'night':'day',c=F(h)?ref.contextPersonal?.[part]:null;if(!c)return ref;let entry=contextualRefs.get(ref);if(!entry){entry={};contextualRefs.set(ref,entry);}const old=entry[part];if(old&&old.hr===c.hr&&old.rr===c.rr)return old;return entry[part]=Object.assign(Object.create(ref),{hr:c.hr,rr:c.rr});};
const smooth01=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
const motionLoad=x=>smooth01((x-25)/50);
// Keep the minute series for charts; score homogeneous, time-aligned observed runs.
// A historical aggregate is still a summary, not a sequence of measured beats.
function jointRuns(a){return jointSeries(a).flatMap(x=>Array.isArray(x.jointRuns)?x.jointRuns:motionGood(x)?[x]:[]);}
function* preciseRuns(a,lo=0,hi=86400){
 const w=a?.secondRates;if(!w){yield* jointRuns(a);return;}
 for(let m=Math.max(0,Math.floor(lo/60));m<Math.min(1440,Math.ceil(hi/60));m++){let run=null;for(let k=0;k<60;k++){const i=m*60+k,h=w.heart[i],r=w.breath[i],motion=w.motion[i];if(!validRate(h)||!validRate(r,120)||!usableMotion({motion})){if(run){yield run;run=null;}continue;}
 if(!run||run.hr!==h||run.rr!==r||run.motion!==motion){if(run)yield run;run={ts:a[m].ts,hr:h,rr:r,motion,seconds:0,motionSeconds:0,validOffsets:[],intervalSummaryOnly:false,rateWindowSeconds:1};}run.seconds++;run.motionSeconds++;run.validOffsets.push(k);}if(run)yield run;}
}
function* causalRuns(a){for(const z of preciseRuns(a)){if(z.rateWindowSeconds===1&&!z.intervalSummaryOnly&&Array.isArray(z.validOffsets)&&z.validOffsets.length>1){for(const k of z.validOffsets)yield {...z,seconds:1,motionSeconds:1,validOffsets:[k]};}else yield z;}}
function contextVitals(a,precise=false,causal=false){
 const out=[];let carried=0,lastEnd=null,previousStamp=null,parsed=NaN;
 for(const z of (causal?causalRuns(a):precise?preciseRuns(a):jointRuns(a))){
  if(z.ts!==previousStamp){previousStamp=z.ts;parsed=Date.parse(z.ts+'+08:00')/1000;}const t=parsed,offsets=Array.isArray(z.validOffsets)?z.validOffsets:null;
  const start=F(t)?t+(offsets?.[0]??0):null,n=Math.min(z.seconds,z.motionSeconds??z.seconds);
  if(!F(start)||!F(n)||n<=0)continue;
  if(lastEnd===null||start<lastEnd||start-lastEnd>5)carried=0;
  else carried*=Math.exp(-(start-lastEnd)/45);
  const active=motionLoad(z.motion),prior=carried;
  // A brief jolt has little residual load; a sustained effort builds load over time.
  const decay=Math.exp(-n/(active>prior?25:45));
  carried=active+(prior-active)*decay;
  const load=Math.max(active,prior*(45/n)*(1-Math.exp(-n/45)));
  out.push({...z,contextLoad:clamp(load,0,1),restWeight:1-smooth01((load-.08)/.52)});
  lastEnd=offsets?.length? t+offsets.at(-1)+1 : start+n;
 }return out;}
const contextualUpper=(key,ref,load)=>(key==='hr'?ref.hrHigh:ref.rrHigh)+load*(key==='hr'?90:48);
const extremeBounds=(key,ref)=>key==='hr'?(ref.species==='cat'?[55,280]:[30,250]):[6,90];
function contextLoss(v,key,ref,load){const [low,high]=extremeBounds(key,ref),ordinary=bandLoss(v,ref[key+'Low'],contextualUpper(key,ref,load));if(!F(ordinary))return null;const extreme=v>=high?.30+(v-high)/high:v<=low?.30+(low-v)/low:0;return Math.max(ordinary,extreme);}
// Independent engineering alert screen on the very same timed evidence as scoring.
// Confirmation timestamp is the end of the qualifying run, not a future peak.
function waveformAlerts(date,a,ref){const out=[],streak=new Map(),incidents=new Map();let last=null;
 for(const z of contextVitals(a,true,true)){const t=Number(z.ts.slice(11,13))*3600+Number(z.ts.slice(14,16))*60,offsets=z.validOffsets??(z.seconds===60?Array.from({length:60},(_,i)=>i):[]);if(z.intervalSummaryOnly||z.rateWindowSeconds!==1||!offsets.length){streak.clear();incidents.clear();last=null;continue;}
 const center=refAt(ref,z.ts),quiet=z.motion<=25&&z.contextLoad<=.20;
 for(const k of offsets){const sec=t+k,available=a.secondRates?.available?.[sec]??z.availableSecond??sec+1;if(!F(available)||available<sec+1-.01||available>86400){streak.clear();incidents.clear();last=null;continue;}if(last!==null&&sec!==last+1){streak.clear();incidents.clear();}last=sec;
 const rules=[];for(const [kind,key] of [['heart','hr'],['breath','rr']]){const v=z[key],lo=ref[key+'Low'],hi=ref[key+'High'],c=center[key];if(!F(v)||!F(c))continue;
 // Independent broad engineering screen, not a clinical diagnosis; movement never disables extremes.
 const [extremeLow,extremeHigh]=extremeBounds(key,ref);
 if(v>=extremeHigh)rules.push({id:kind+'-absolute-high',kind,type:'high',value:v,reference:extremeHigh,need:10,source:'activity-independent-extreme-review'});
 if(v<=extremeLow)rules.push({id:kind+'-absolute-low',kind,type:'low',value:v,reference:extremeLow,need:10,source:'activity-independent-extreme-review'});
 if(!quiet){const upper=contextualUpper(key,ref,z.contextLoad);if(v>upper*1.20)rules.push({id:kind+'-activity-high',kind,type:'high',value:v,reference:upper,need:30,source:'activity-context-review'});continue;}
 const ready=(key==='hr'?ref.personalHeartWeight:ref.personalBreathWeight)>0;
 const high=Math.max(hi,Math.min(hi*1.30,c+(ready?1:1.25)*Math.max(key==='hr'?24:9,c*(key==='hr'?.45:.70)))),low=Math.min(lo,Math.max(lo*.70,c-(ready?1:1.25)*Math.max(key==='hr'?24:9,c*(key==='hr'?.45:.70))));
 if(v>high)rules.push({id:kind+'-high',kind,type:'high',value:v,reference:c,need:10,source:'waveform-severe-review'});
 if(v<low)rules.push({id:kind+'-low',kind,type:'low',value:v,reference:c,need:10,source:'waveform-severe-review'});
 const deltaHigh=Math.max(key==='hr'?18:6,c*(key==='hr'?.36:.43))*(ready?1:1.45),deltaLow=Math.max(key==='hr'?18:5,c*(key==='hr'?.34:.40))*(ready?1:1.45);
 if(v>=c+deltaHigh)rules.push({id:kind+'-moderate-high',kind,type:'high',value:v,reference:c,need:240,source:'waveform-context-review'});
 if(v<=c-deltaLow)rules.push({id:kind+'-moderate-low',kind,type:'low',value:v,reference:c,need:240,source:'waveform-context-review'});
 if(key==='rr'&&v>30)rules.push({id:'resp-30',kind,type:'high',value:v,reference:30,need:ref.breed?.respiratoryAttention?180:300,source:'resting-respiratory-review'});
 if(key==='rr'&&v>=40)rules.push({id:'resp-40',kind,type:'high',value:v,reference:30,need:120,source:'resting-respiratory-review'});
 }const active=new Set(rules.map(x=>x.id)),directions=new Set(rules.map(x=>x.kind+'|'+x.type));for(const id of streak.keys())if(!active.has(id))streak.delete(id);for(const id of incidents.keys())if(!directions.has(id))incidents.delete(id);
 for(const rule of rules){let q=streak.get(rule.id);if(!q){q={start:sec,n:0};streak.set(rule.id,q);}q.n++;q.available=Math.max(q.available??0,available);if(q.n<rule.need)continue;
 // Prefer the independent extreme confirmation when the current evidence is already extreme.
 // A lower-priority timer may resume if the extreme subsides before confirmation.
 if(rule.source!=='activity-independent-extreme-review'&&rules.some(x=>x.kind===rule.kind&&x.type===rule.type&&x.source==='activity-independent-extreme-review'))continue;
 const direction=rule.kind+'|'+rule.type,priority=rule.source==='activity-independent-extreme-review'?4:rule.source==='waveform-severe-review'?3:rule.id==='resp-40'?2:1,previous=incidents.get(direction);if(previous&&previous.priority>=priority)continue;const confirmed=Math.max(sec,Math.ceil(q.available)-1);if(confirmed>=86400)continue;incidents.set(direction,{priority});
 const event={date,kind:rule.kind,type:rule.type,minute:Math.floor(confirmed/60),second:confirmed%60,localSecond:confirmed,startSecond:q.start,evidenceEndSecond:sec,secondsConfirmed:q.n,value:+rule.value.toFixed(1),reference:+rule.reference.toFixed(1),relative:Math.abs(rule.value-rule.reference)/rule.reference,source:rule.source,escalated:!!previous,level:'high',durationClass:rule.need>=120?'sustained':'sudden',baselinePhase:ref.ready?'personalized':'provisional',baselineDays:ref.validPriorDays??0};
 // One event per overlapping same-direction incident; later confirmation must not replace its original timestamp.
 out.push(event);
 }}
 }return out.sort((a,b)=>a.localSecond-b.localSecond);}
function vitalScore(a,key,ref){const heart=key==='hr',lo=heart?ref.hrLow:ref.rrLow,hi=heart?ref.hrHigh:ref.rrHigh,center=heart?ref.hr:ref.rr,items=a.map(x=>({v:x[key],seconds:Math.min(x.seconds,x.motionSeconds??x.seconds),ts:x.ts,offsets:Array.isArray(x.validOffsets)?x.validOffsets:null,load:x.contextLoad??0,rw:x.restWeight??1})).filter(x=>F(x.v)&&x.seconds>0).sort((x,y)=>x.ts.localeCompare(y.ts)),total=items.reduce((n,x)=>n+x.seconds,0),restTotal=items.reduce((n,x)=>n+x.seconds*x.rw,0),med=weightedMedian(items,'v',x=>x.seconds*x.rw);
 if(!total)return {level:null,stability:null,score:null,burden:null,median:med,secondsOutside:0,severeRunSeconds:0,severeDoseSeconds:0};
 let sum=0,fit=0,run=0,runMax=0,runLoss=0,worst=0,previous=NaN,prevValue=null,prevSeconds=0,secondsOutside=0,runSide=0,jump=0,jumpWorst=0,jumpTime=0,acuteWorst=0,prevRestWeight=0,previousEnd=NaN,severeDose=0,previousSevereEnd=NaN;
 let previousStamp=null,parsed=NaN;
 for(const x of items){// Exercise raises the upper contextual envelope only; low rates are never excused.
  const contextualHi=contextualUpper(key,ref,x.load),rawLoss=contextLoss(x.v,key,ref,x.load),loss=rawLoss*(x.v<lo?1.35:1),t=x.ts===previousStamp?parsed:(previousStamp=x.ts,parsed=Date.parse(x.ts+'+08:00'));sum+=x.seconds*(1-Math.exp(-loss));fit+=x.seconds*x.rw*vitalFit(x.v,key,refAt(ref,x.ts));if(loss>0)secondsOutside+=x.seconds;
  // A single observed severe resting excursion contributes; sustained episodes contribute more.
  acuteWorst=Math.max(acuteWorst,(1-Math.exp(-loss))*(1-Math.exp(-x.seconds/90)));
  const start=t+(x.offsets?.[0]??0)*1000,end=t+(x.offsets?.length?x.offsets.at(-1)+1:x.seconds)*1000;
  if(F(prevValue)&&start===previousEnd&&prevSeconds>=1&&x.seconds>=1&&x.rw>=.95&&prevRestWeight>=.95){const change=Math.abs(x.v-prevValue)/Math.max(center,prevValue,x.v),j=Math.max(0,change-(heart?.18:.25));jump+=j*Math.min(x.seconds,prevSeconds);jumpTime+=Math.min(x.seconds,prevSeconds);jumpWorst=Math.max(jumpWorst,j);}
  if(loss>=.30){severeDose+=x.seconds*(1-Math.exp(-loss));const side=x.v<lo?-1:1;
   // Partial summaries without verified second positions cannot prove continuity.
   const offsets=x.offsets??(x.seconds===60?Array.from({length:60},(_,i)=>i):[]);
   if(!offsets.length){run=0;runLoss=0;previousSevereEnd=NaN;}
   for(const k of offsets){const instant=t+k*1000;if(instant!==previousSevereEnd||side!==runSide){run=0;runLoss=0;}run++;runLoss+=(1-Math.exp(-loss));runSide=side;previousSevereEnd=instant+1000;runMax=Math.max(runMax,run);acuteWorst=Math.max(acuteWorst,(runLoss/run)*(1-Math.exp(-run/90)));if(run>=120){worst=Math.max(worst,(runLoss/run)*(1-Math.exp(-run/180)));}}
  }else{run=0;runLoss=0;runSide=0;previousSevereEnd=NaN;}previous=t;previousEnd=end;prevValue=x.v;prevSeconds=x.seconds;prevRestWeight=x.rw;
 }
 const anchor=heart?ref.initialAnchor?.hr:ref.initialAnchor?.rr,anchorDrift=F(anchor)&&F(med)?Math.max(0,Math.abs(med-anchor)/anchor-(heart?.12:.15)):0;
 const burden=sum/total,trend=(heart?ref.personalHeartWeight:ref.personalBreathWeight)>0?Math.max(0,Math.abs(med-center)/center-.18):0,transitionBurden=jumpTime?jump/jumpTime:0,episode=Math.max(worst,.65*acuteWorst),repeatedBurden=1-Math.exp(-Math.max(0,severeDose-120)/900);
 const level=restTotal>=900&&F(med)?round((.55*vitalFit(med,key,ref)+.45*fit/restTotal)*Math.exp(-1.8*burden-.75*episode-.65*repeatedBurden-1.2*trend**2-2*anchorDrift**2)):null;
 const stability=restTotal>=900?round(100*Math.exp(-2*burden-.5*episode-.45*repeatedBurden-1.8*transitionBurden-.45*jumpWorst)):null;
 const score=weight({level,stability},{level:.75,stability:.25},['level']).score;
 return {level,stability,score,burden,anchorDrift,secondsOutside,severeRunSeconds:runMax,severeBurden:worst,severeDoseSeconds:severeDose,repeatedBurden,acuteBurden:acuteWorst,transitionBurden,largestTransition:jumpWorst,meanFit:restTotal?fit/restTotal:null,median:med,restEquivalentSeconds:restTotal,contextObservedSeconds:total};}
const validRate=(x,max=350)=>F(x)&&x>0&&x<=max;
const good=x=>x&&validRate(x.hr)&&validRate(x.rr,120)&&F(x.seconds)&&x.seconds>0;
const usableMotion=x=>x&&F(x.motion)&&x.motion>=0&&x.motion<119;
const boundedSeconds=x=>F(x)?(Math.abs(x-60)<1e-6?60:clamp(x,0,60)):0;
const motionGood=x=>good(x)&&usableMotion(x)&&(x.motionSeconds===undefined||F(x.motionSeconds)&&x.motionSeconds>0);
function quietStats(a){a=jointRuns(a);const q=a.filter(x=>motionGood(x)&&x.motion<=25);return q.reduce((n,x)=>n+Math.min(x.seconds,x.motionSeconds??x.seconds),0)>=900?{hr:weightedMedian(q,'hr',x=>Math.min(x.seconds,x.motionSeconds??x.seconds)),rr:weightedMedian(q,'rr',x=>Math.min(x.seconds,x.motionSeconds??x.seconds)),count:q.length}:null;}
// Calibration days are not just days with a normal median. Reject materially abnormal
// observed contextual burden independently for each channel. Same envelopes as daily scoring;
// engineering eligibility guard, not a diagnostic threshold. Do not count ordinary exercise.
function calibrationEvidence(a,ref){a=jointSeries(a);
 const out={hr:{observed:0,outsideDose:0,severeDose:0,acute:0,extremeSeconds:0,extremeRun:0,severeRun:0},rr:{observed:0,outsideDose:0,severeDose:0,acute:0,extremeSeconds:0,extremeRun:0,severeRun:0}};
 const track={hr:{end:null,run:0,side:null},rr:{end:null,run:0,side:null}},severeTrack={hr:{end:null,run:0,side:null},rr:{end:null,run:0,side:null}};
 for(const x of contextVitals(a,true)){const load=x.contextLoad,seconds=Math.min(x.seconds,x.motionSeconds??x.seconds),t=Number(x.ts.slice(11,13))*3600+Number(x.ts.slice(14,16))*60,offsets=x.validOffsets??(seconds===60?Array.from({length:60},(_,i)=>i):[]);
  for(const k of ['hr','rr']){const e=out[k],z=track[k],loss=bandLoss(x[k],k==='hr'?ref.hrLow:ref.rrLow,contextualUpper(k,ref,load));if(!F(loss)||seconds<=0)continue;e.observed+=seconds;e.outsideDose+=seconds*(1-Math.exp(-loss));if(loss>=.30)e.severeDose+=seconds*(1-Math.exp(-loss));const high=k==='hr'?(ref.species==='cat'?280:250):90,low=k==='hr'?(ref.species==='cat'?55:30):6,side=x[k]>=high?'high':x[k]<=low?'low':null;
   if(side){e.extremeSeconds+=seconds;e.severeDose+=seconds;}e.acute=Math.max(e.acute,(1-Math.exp(-loss))*(1-Math.exp(-seconds/90)));
   const severe=severeTrack[k],direction=x[k]<ref[k+'Low']?'low':'high';if(loss>=.30&&offsets.length){for(const j of offsets){const at=t+j;if(severe.end!==at||severe.side!==direction)severe.run=0;severe.run++;severe.end=at+1;severe.side=direction;e.severeRun=Math.max(e.severeRun,severe.run);}}else{severe.end=null;severe.run=0;severe.side=null;}
   // An abnormal run spanning variable rates must not disappear into separate short bins.
   if(!side||!offsets.length){z.end=null;z.run=0;z.side=null;continue;}for(const k of offsets){const at=t+k;if(z.end!==at||z.side!==side)z.run=0;z.run++;z.end=at+1;z.side=side;e.extremeRun=Math.max(e.extremeRun,z.run);}
  }}
 for(const e of Object.values(out)){e.burden=e.observed?e.outsideDose/e.observed:null;e.eligible=e.observed>=3600&&e.severeDose<60&&e.severeRun<120&&e.extremeRun<10&&e.acute<.25&&e.burden<.10;}
 return out;
}
// A day is admissible only when its synchronized observation is distributed over the day.
// Each day contributes one robust statistic, not a vote per sample. This prevents wear duration bias.
const baselineDayCache=new WeakMap();
function baselineDay(a,g){
 const key=[g.species,g.hr,g.rr,g.hrLow,g.hrHigh,g.rrLow,g.rrHigh].join('|'),old=baselineDayCache.get(a);if(old?.key===key)return old.result;
 const supported=preciseRuns(a),blocks=Array(6).fill(0),quietBlocks=Array(6).fill(0),dayParts={night:{seconds:0,rest:0},day:{seconds:0,rest:0}};let seconds=0,activity=0;
 const quiet=[];
 for(const z of supported){const hour=Number(z.ts.slice(11,13)),b=Math.floor(hour/4),n=Math.min(z.seconds,z.motionSeconds??z.seconds);if(b<0||b>=6||!F(n)||n<=0)continue;seconds+=n;blocks[b]+=n;const part=dayParts[hour<8||hour>=20?'night':'day'];part.seconds+=n;activity+=n*smooth01((z.motion-25)/20);if(z.motion<=25){quietBlocks[b]+=n;part.rest+=n;quiet.push({...z,n,period:hour<8||hour>=20?'night':'day'});}}
 let result=null;
 if(seconds>=21600&&blocks.filter(n=>n>=1800).length>=3&&quietBlocks.filter(n=>n>=450).length>=2&&quiet.reduce((n,z)=>n+z.n,0)>=900){
 const robust=(rows,k)=>{const center=weightedMedian(rows,k,z=>z.n);return {center,mad:F(center)?weightedMedian(rows.map(z=>({...z,delta:Math.abs(z[k]-center)})),'delta',z=>z.n):null};};
 const h=robust(quiet,'hr'),r=robust(quiet,'rr');
 const parts=Object.fromEntries(Object.entries(dayParts).map(([k,v])=>[k,{...v,hours:v.seconds>=32400?12*v.rest/v.seconds:null}]));
 const contextCenters=Object.fromEntries(['night','day'].map(period=>{const z=quiet.filter(x=>x.period===period);return [period,z.reduce((n,x)=>n+x.n,0)>=1800?{hr:robust(z,'hr').center,rr:robust(z,'rr').center}:null];}));
 result={hr:h.center,rr:r.center,hrMad:h.mad,rrMad:r.mad,contextCenters,calibration:calibrationEvidence(a,g),seconds,parts,activity:seconds>=64800&&Object.values(parts).every(x=>x.seconds>=32400)?activity/seconds:null,quiet:seconds>=64800&&Object.values(parts).every(x=>x.seconds>=32400)?quiet.reduce((n,z)=>n+z.n,0)/seconds:null};}
 baselineDayCache.set(a,{key,result});return result;
}
const anchorPrefix='dp-initial-anchor-v1:';
function validDate(d){return typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&F(Date.parse(d+'T12:00:00Z'))&&new Date(Date.parse(d+'T12:00:00Z')).toISOString().slice(0,10)===d;}
function validAnchor(a){return !!(a&&a.days===14&&F(a.hr)&&a.hr>=25&&a.hr<=350&&F(a.rr)&&a.rr>=1&&a.rr<=120&&validDate(a.firstDate)&&validDate(a.lastDate)&&Date.parse(a.lastDate+'T12:00:00Z')-Date.parse(a.firstDate+'T12:00:00Z')>=13*86400000);}
function storedAnchor(key){if(typeof key!=='string'||!key)return null;try{const a=JSON.parse(root.localStorage?.getItem(anchorPrefix+key)||'null');return validAnchor(a)?{days:14,hr:a.hr,rr:a.rr,firstDate:a.firstDate,lastDate:a.lastDate}:null;}catch{return null;}}
function readAnchor(key,date){const a=storedAnchor(key);return a&&a.lastDate<date?a:null;}
function saveAnchor(key,a){if(typeof key!=='string'||!key||!validAnchor(a))return false;try{if(!root.localStorage)return false;const old=storedAnchor(key);if(old)return JSON.stringify(old)===JSON.stringify({days:14,hr:a.hr,rr:a.rr,firstDate:a.firstDate,lastDate:a.lastDate});root.localStorage.setItem(anchorPrefix+key,JSON.stringify({days:14,hr:a.hr,rr:a.rr,firstDate:a.firstDate,lastDate:a.lastDate}));return true;}catch{return false;}}
function restoreAnchor(key,a,profile,asOf){const g=group(profile);if(!validAnchor(a)||!validDate(asOf)||a.lastDate>=asOf||a.hr<g.hrLow||a.hr>g.hrHigh||a.rr<g.rrLow||a.rr>g.rrHigh)return false;return saveAnchor(key,a);}
function reference(p,date,get,priorDates=[],anchorKey=null){const g=group(p),eligible=[];
 for(const d of [...new Set(priorDates.filter(d=>validDate(d)&&d<date&&d>=dateAdd(date,-45)))].sort().reverse()){const a=get(d);if(!Array.isArray(a))continue;const z=baselineDay(a,g);if(z)eligible.push({date:d,...z});if(eligible.length===14)break;}
 const ready=eligible.length===14,ph=ready?median(eligible.map(x=>x.hr)):null,pr=ready?median(eligible.map(x=>x.rr)):null;
 const heartDays=eligible.filter(x=>x.hr>=g.hrLow&&x.hr<=g.hrHigh&&x.calibration.hr.eligible),breathDays=eligible.filter(x=>x.rr>=g.rrLow&&x.rr<=g.rrHigh&&x.calibration.rr.eligible);
 // Up to 60% individual influence after 14 valid days; do not widen group safety envelopes.
 // Require 10 clean days per metric, shrink uncertain observations toward the group prior.
 const hw=ready&&heartDays.length>=10&&ph>=g.hrLow&&ph<=g.hrHigh?.60*heartDays.length/14:0,bw=ready&&breathDays.length>=10&&pr>=g.rrLow&&pr<=g.rrHigh?.60*breathDays.length/14:0;
 const blend=(base,obs,w,limit=.25)=>F(obs)&&w>0?base+w*(clamp(obs,base*(1-limit),base*(1+limit))-base):base;
 const savedCandidate=readAnchor(anchorKey,date),savedAnchor=savedCandidate&&savedCandidate.hr>=g.hrLow&&savedCandidate.hr<=g.hrHigh&&savedCandidate.rr>=g.rrLow&&savedCandidate.rr<=g.rrHigh?savedCandidate:null,anchor=[];for(const d of (savedAnchor?[]:[...new Set(priorDates.filter(d=>validDate(d)&&d<date))].sort())){const a=get(d);if(!Array.isArray(a))continue;const z=baselineDay(a,g);if(z&&z.calibration.hr.eligible&&z.calibration.rr.eligible&&z.hr>=g.hrLow&&z.hr<=g.hrHigh&&z.rr>=g.rrLow&&z.rr<=g.rrHigh)anchor.push({date:d,...z});if(anchor.length===14)break;}
 const computedAnchor={days:anchor.length,hr:anchor.length===14?median(anchor.map(x=>x.hr)):null,rr:anchor.length===14?median(anchor.map(x=>x.rr)):null,firstDate:anchor[0]?.date??null,lastDate:anchor.at(-1)?.date??null};const initialAnchor=savedAnchor??computedAnchor;if(initialAnchor===computedAnchor)saveAnchor(anchorKey,computedAnchor);const anchorHr=initialAnchor.hr,anchorRr=initialAnchor.rr;
 const anchored=(v,center,limit)=>F(center)&&F(v)?clamp(v,center*(1-limit),center*(1+limit)):v;
 const hr=blend(g.hr,anchored(median(heartDays.map(x=>x.hr)),anchorHr,.12),hw),rr=blend(g.rr,anchored(median(breathDays.map(x=>x.rr)),anchorRr,.15),bw);
 // Learn normal variability from robust within-day and between-day spread, not from extreme events.
 const tolerance=(rows,key,base,w)=>{if(!w)return 0;const m=median(rows.map(z=>z[key])),within=median(rows.map(z=>z[key+'Mad'])),between=median(rows.map(z=>Math.abs(z[key]-m)));return w*clamp(1.4826*Math.max(within??0,between??0)/base,0,.10);};
 const contextPersonal=Object.fromEntries(['night','day'].map(k=>{const hs=heartDays.map(z=>z.contextCenters[k]?.hr).filter(F),rs=breathDays.map(z=>z.contextCenters[k]?.rr).filter(F);return [k,{hr:ready&&hs.length>=10?blend(g.hr,anchored(median(hs),anchorHr,.12),hw,.25):hr,rr:ready&&rs.length>=10?blend(g.rr,anchored(median(rs),anchorRr,.15),bw,.25):rr,heartDays:hs.length,breathDays:rs.length}];}));
 const clean=eligible.filter(x=>x.calibration.hr.eligible&&x.calibration.rr.eligible&&x.hr>=g.hrLow&&x.hr<=g.hrHigh&&x.rr>=g.rrLow&&x.rr<=g.rrHigh);
 const behavior=clean.filter(x=>F(x.activity)&&F(x.quiet)&&F(x.parts.night.hours)&&F(x.parts.day.hours));
 // A chronically immobile or excessively active pet must not redefine that behavior as healthy.
 const sane=behavior.filter(x=>x.activity>=.5*g.activityTarget&&x.activity<=2*g.activityTarget&&x.parts.night.hours+x.parts.day.hours>=.65*(g.night+g.day)&&x.parts.night.hours+x.parts.day.hours<=1.35*(g.night+g.day));
 const aw=ready&&sane.length>=10?.45*sane.length/14:0;
 const personal={night:median(sane.map(z=>z.parts.night.hours)),day:median(sane.map(z=>z.parts.day.hours)),activityTarget:median(sane.map(z=>z.activity)),quietTarget:median(sane.map(z=>z.quiet))};
 return {...g,hr,rr,initialAnchor,contextPersonal,night:blend(g.night,personal.night,aw,.20),day:blend(g.day,personal.day,aw,.20),activityTarget:blend(g.activityTarget,personal.activityTarget,aw,.20),quietTarget:blend(g.quietTarget,personal.quietTarget,aw,.20),hrTolerance:tolerance(heartDays,'hr',hr,hw),rrTolerance:tolerance(breathDays,'rr',rr,bw),ready,validPriorDays:eligible.length,requiredDays:14,priorDates:eligible.map(x=>x.date).reverse(),groupWeight:1-(hw+bw)/2,personalWeight:(hw+bw)/2,personalHeartWeight:hw,personalBreathWeight:bw,personalBehaviorWeight:aw,personalBehaviorEligibleDays:sane.length,personalBehavior:personal,personalOutsideReference:ready&&(heartDays.length<14||breathDays.length<14),personalObservedHr:ph,personalObservedRr:pr,personalHeartEligibleDays:heartDays.length,personalBreathEligibleDays:breathDays.length,personalCalibrationDays:eligible.map(x=>({date:x.date,heartMedian:x.hr,breathMedian:x.rr,heart:x.calibration.hr,breath:x.calibration.rr}))};}
const waveRowsCache=new WeakMap(),sharedRunOffsets=new Map(),fullMinuteOffsets=Object.freeze(Array.from({length:60},(_,i)=>i));
function compactRunOffsets(a){const key=a[0]+":"+a.length;let v=sharedRunOffsets.get(key);if(!v){v=Object.freeze(a);sharedRunOffsets.set(key,v);}return v;}
function fromSeries(date,s){const cache=s?.rateWindows&&waveRowsCache.get(s);if(cache?.date===date)return cache.rows;const rows=Array.from({length:1440},(_,i)=>({ts:stamp(date,i),hr:validRate(s?.heart?.[i])?s.heart[i]:null,rr:validRate(s?.breath?.[i],120)?s.breath[i]:null,motion:usableMotion({motion:s?.activity?.[i]})?s.activity[i]:null,seconds:validRate(s?.heart?.[i])&&validRate(s?.breath?.[i],120)?boundedSeconds(s?.validSeconds===undefined?60:s.validSeconds?.[i]):0,motionSeconds:validRate(s?.heart?.[i])&&validRate(s?.breath?.[i],120)&&usableMotion({motion:s?.activity?.[i]})?boundedSeconds(s?.validSeconds===undefined?60:s.validSeconds?.[i]):0}));
 const w=s?.rateWindows;if(w?.seconds===5&&w.heart?.length===17280&&w.breath?.length===17280&&w.mask?.length===17280){
 const secondComplete=["heart","breath","motion"].every(k=>s.secondRates?.[k]?.length===86400);
 if(!secondComplete)for(let m=0;m<1440;m++){const x=rows[m];x.jointRuns=[];x.validOffsets=[];for(let j=0;j<12;j++){const k=m*12+j,h=w.heart[k],r=w.breath[k],motion=w.motion?.[k]??x.motion,mask=w.mask[k];if(!validRate(h)||!validRate(r,120)||!usableMotion({motion})||!Number.isInteger(mask)||mask<1||mask>31)continue;
 // Split noncontiguous seconds, so missing time cannot prolong an event.
 let run=null;for(let t=0;t<5;t++){if(!(mask&(1<<t))){run=null;continue;}const offset=j*5+t;if(!run){run={ts:x.ts,hr:h,rr:r,motion,seconds:0,motionSeconds:0,validOffsets:[],intervalSummaryOnly:false,rateWindowSeconds:5};x.jointRuns.push(run);}run.validOffsets.push(offset);run.seconds++;run.motionSeconds++;x.validOffsets.push(offset);}}
 x.seconds=x.motionSeconds=x.validOffsets.length;if(!x.seconds){x.hr=x.rr=null;}else{x.motion=x.jointRuns.reduce((n,z)=>n+z.motion*z.seconds,0)/x.seconds;}}
 // Store the actual decoder-selected HRV evidence, not a caller-assigned score.
 rows.waveHrv=s.hrvWindow??null;rows.secondRates=s.secondRates??null;rows.rateWindowSeconds=5;
 // A high-resolution observation is authoritative; stale display aggregates must
 // not add coverage, erase valid minutes, or change a daily score's scope.
 if(rows.secondRates){const z=rows.secondRates;if(!['heart','breath','motion'].every(k=>z[k]?.length===86400)){rows.secondRates=null;rows.waveHrv=null;}else for(let m=0;m<1440;m++){const x=rows[m];let h=0,r=0,v=0,n=0;const offsets=[];for(let k=0;k<60;k++){const at=m*60+k;if(!validRate(z.heart[at])||!validRate(z.breath[at],120)||!usableMotion({motion:z.motion[at]}))continue;n++;h+=z.heart[at];r+=z.breath[at];v+=z.motion[at];offsets.push(k);}x.seconds=x.motionSeconds=n;x.validOffsets=n===60?fullMinuteOffsets:offsets;x.hr=n?h/n:null;x.rr=n?r/n:null;x.motion=n?v/n:null;
 x.jointRuns=[];let run=null;for(const k of offsets){if(!run||k!==run.validOffsets.at(-1)+1||Math.floor(k/5)!==Math.floor(run.validOffsets[0]/5)){run={ts:x.ts,hr:0,rr:0,motion:0,seconds:0,motionSeconds:0,validOffsets:[],intervalSummaryOnly:false,rateWindowSeconds:5};x.jointRuns.push(run);}const at=m*60+k;run.hr+=z.heart[at];run.rr+=z.breath[at];run.motion+=z.motion[at];run.seconds++;run.motionSeconds++;run.validOffsets.push(k);}for(const r of x.jointRuns){r.hr/=r.seconds;r.rr/=r.seconds;r.motion/=r.seconds;r.validOffsets=compactRunOffsets(r.validOffsets);}}}
 else for(const x of rows){if(x.seconds){x.hr=x.jointRuns.reduce((n,z)=>n+z.hr*z.seconds,0)/x.seconds;x.rr=x.jointRuns.reduce((n,z)=>n+z.rr*z.seconds,0)/x.seconds;}}
 waveRowsCache.set(s,{date,rows});
 }return rows;}

// A2 minute aggregates remain aggregates. Expand only their explicitly recorded
// coverage into minute bins, not fake beat intervals. Later SDK rows win; B0
// may supply heart/breath but never manufacture a missing motion reading.
function fromRows(date,rows){
 const validStamp=t=>typeof t==='string'&&t.slice(0,10)===date&&/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(t);
 const out=fromSeries(date,{}),rank={historical:1,b0:2,sdk:3},bins=Array.from({length:1440},()=>[]);
 for(let r of rows){if(!r||!validStamp(r.ts)||!Number.isInteger(r.seconds)||r.seconds<=0||r.seconds>120||(r.secondOffsets!==undefined&&!Array.isArray(r.secondOffsets))||r.quality===false||r.quality==='invalid'||r.qualityConfirmed===false||r.contactGood===false)continue;const t=r.ts.slice(11,19).split(':').map(Number),start=t[0]*3600+t[1]*60+(t[2]||0);if(!Number.isFinite(start)||start<0||start>=86400)continue;
 const n=Math.max(0,Math.min(86400-start,Math.floor(r.seconds||0)));let support;if(Array.isArray(r.secondOffsets)){const offsets=[...new Set(r.secondOffsets)];if(offsets.some(k=>!Number.isInteger(k)||k<start%60||k>=60)||offsets.length!==n)continue;support=offsets.map(k=>Math.floor(start/60)*60+k);}else support=Array.from({length:n},(_,k)=>Math.floor(start)+k);
 const observedStart=support[0];const availabilityValid=r.availableSecond===undefined||F(r.availableSecond)&&r.availableSecond>=observedStart+1&&r.availableSecond<=86400;const exact=r.source==='sdk'&&r.seconds===1&&r.rateWindowSeconds===1&&r.intervalSummaryOnly!==true&&availabilityValid;r={...r,rateWindowSeconds:exact?1:null,peakProvenance:exact?r.peakProvenance:undefined,availableSecond:exact&&F(r.availableSecond)&&r.availableSecond>=observedStart+1&&r.availableSecond<=86400?r.availableSecond:undefined};
 const per=new Map();for(const k of support){if(k<0||k>=86400)continue;const i=Math.floor(k/60);if(!per.has(i))per.set(i,[]);per.get(i).push(k%60);}for(const [i,ss] of per)bins[i].push({r,support:ss,priority:rank[r.source]||1});}
 for(let i=0;i<1440;i++){const x=out[i],b=bins[i];x.seconds=0;if(!b.length)continue;
 // Union explicitly observed support rather than replacing a complete A2
 // minute with a sparse higher-priority B0 packet. A2 support is an interval
 // estimate, not a reconstructed 60/120-second waveform or individual beats.
 const v=Array(60).fill(null),m=Array(60).fill(null);
 function put(arr,k,e,fields){const old=arr[k];if(!old||e.priority>old.priority){arr[k]=e;return;}if(e.priority===old.priority&&(old.conflict||fields.some(f=>old.r[f]!==e.r[f])))arr[k]={priority:e.priority,conflict:true};}
 for(const e of b.sort((a,b)=>a.priority-b.priority)){for(const k of e.support){if(good(e.r))put(v,k,e,['hr','rr','rateWindowSeconds','peakProvenance','intervalSummaryOnly','availableSecond']);if(usableMotion(e.r))put(m,k,e,['motion','rateWindowSeconds','intervalSummaryOnly','availableSecond']);}}
 for(let k=0;k<60;k++){if(v[k]?.conflict)v[k]=null;if(m[k]?.conflict)m[k]=null;}
 const usable=v.filter(Boolean),motion=m.filter((z,k)=>z&&v[k]);x.seconds=usable.length;x.motionSeconds=motion.length;
 // Summaries are representative values of distinct coverage, never IBI.
 if(usable.length){x.hr=median(usable.map(e=>e.r.hr));x.rr=median(usable.map(e=>e.r.rr));x.rank=Math.max(...usable.map(e=>e.priority));}
 if(motion.length){x.motion=median(motion.map(e=>e.r.motion));const joint=v.filter((e,k)=>e&&m[k]);if(joint.length!==usable.length){x.contextHr=median(joint.map(e=>e.r.hr));x.contextRr=median(joint.map(e=>e.r.rr));}}
 x.coverageSources=[...new Set(usable.map(e=>e.r.source))];x.intervalSummaryOnly=usable.some(e=>e.r.source==='historical');x.secondOffsets=v.flatMap((e,k)=>e?[k]:[]);x.validOffsets=v.flatMap((e,k)=>e&&m[k]? [k]:[]);
 // Store a compact sequence of joint runs, never reconstruct the pulse/BCG waveform.
 x.jointRuns=[];let run=null;
 for(const k of x.validOffsets){const h=v[k].r,move=m[k].r,summary=h.source==='historical'||move.source==='historical'||h.intervalSummaryOnly===true||move.intervalSummaryOnly===true,exact=!summary&&h.rateWindowSeconds===1&&move.rateWindowSeconds===1,rateWindowSeconds=exact?1:null,availableSecond=exact&&(F(h.availableSecond)||F(move.availableSecond))?Math.max(h.availableSecond??i*60+k+1,move.availableSecond??i*60+k+1):null,peakProvenance=exact?h.peakProvenance:undefined;
  if(!run||run.validOffsets.at(-1)!==k-1||run.hr!==h.hr||run.rr!==h.rr||run.motion!==move.motion||run.intervalSummaryOnly!==summary||run.peakProvenance!==peakProvenance||run.rateWindowSeconds!==rateWindowSeconds||run.availableSecond!==availableSecond){run={ts:x.ts,hr:h.hr,rr:h.rr,motion:move.motion,seconds:0,motionSeconds:0,validOffsets:[],intervalSummaryOnly:summary,rateWindowSeconds,availableSecond,peakProvenance};x.jointRuns.push(run);}
  run.validOffsets.push(k);run.seconds++;run.motionSeconds++;
 }
 }
 // Preserve actual OEM 2-minute sample timestamps separately from expanded coverage bins.
 // These are summary endpoints, never reconstructed instantaneous pulse values.
 const endpoints=new Map(),conflicts=new Set();for(const r of rows){if(!r||!validStamp(r.ts)||r.source!=='historical'||r.seconds!==120||!motionGood(r)||r.quality===false||r.quality==='invalid'||r.qualityConfirmed===false||r.contactGood===false)continue;const k=Date.parse(r.ts+'+08:00'),prev=endpoints.get(k);if(prev&&['hr','rr','motion'].some(f=>prev[f]!==r[f]))conflicts.add(k);else endpoints.set(k,{...r});}out.recoverySamples=[...endpoints].filter(([k])=>!conflicts.has(k)).map(([,r])=>r);
 return out;
}
// Context-conditioned scoring uses vital rates from exactly the seconds with motion support.
// Preserve the original all-vital median and coverage for evidence and raw displays.
function jointSeries(a){if(!a.some(x=>F(x?.contextHr)&&F(x?.contextRr)))return a;const out=a.map(x=>F(x?.contextHr)&&F(x?.contextRr)?{...x,hr:x.contextHr,rr:x.contextRr}:x);for(const key of ['recoverySamples','waveHrv','secondRates','rateWindowSeconds'])if(a[key]!==undefined)out[key]=a[key];return out;}
const value=(v,ref,k)=>F(v)&&F(ref)&&ref>0?round(100*Math.exp(-k*((v-ref)/ref)**2)):null;
// Calendar-day polyphasic rest estimate. Per-minute evidence is retained;
// short movement during a rest bout is tolerated. Missing time is never rest.
function forOffsetRuns(offsets,base,add){
 let start=null,last=null;for(const k of offsets){if(start===null){start=last=k;continue;}if(k===last+1){last=k;continue;}add(base+start,last-start+1);start=last=k;}if(start!==null)add(base+start,last-start+1);
}
function rest(date,cur,prev,ref){
 const seq=jointSeries(cur),preciseByMinute=seq.secondRates?Array.from({length:1440},()=>[]):null;if(preciseByMinute)for(const z of preciseRuns(seq))preciseByMinute[Number(z.ts.slice(11,13))*60+Number(z.ts.slice(14,16))].push(z);
 const slots=Array(48).fill('missing'),bins=[],timeline=[];
 const valid=seq.map((x,i)=>preciseByMinute?preciseByMinute[i].length>0:motionGood(x)),quiet=seq.map((x,i)=>valid[i]&&(preciseByMinute?preciseByMinute[i].reduce((n,z)=>n+z.motion*z.seconds,0)/preciseByMinute[i].reduce((n,z)=>n+z.seconds,0):x.motion)<=25);
 const resting=seq.map((x,i)=>{if(!valid[i])return false;if(quiet[i])return true; // quiet rest, not proof of sleep
  if(x.motion>45)return false;
  // A short movement or a change of posture is consistent with a rest bout.
  // Use available local context only; a missing minute cannot bridge a bout.
  const left=i>0&&valid[i-1]&&quiet[i-1],right=i+1<seq.length&&valid[i+1]&&quiet[i+1];
  const near=[i-2,i-1,i+1,i+2].filter(j=>j>=0&&j<seq.length&&valid[j]);
  const contextual=left&&right||near.length>=3&&near.filter(j=>quiet[j]).length>=3&&(left||right);
  return contextual&&x.hr>=ref.hrLow*.75&&x.hr<=ref.hrHigh&&x.rr>=ref.rrLow*.75&&x.rr<=ref.rrHigh;});
 for(let i=0;i<48;i++){const a=[];for(let j=i*30;j<(i+1)*30;j++)if(valid[j]){const x=seq[j],seconds=preciseByMinute?preciseByMinute[j].reduce((n,z)=>n+z.seconds,0):Math.min(x.seconds,x.motionSeconds??x.seconds);if(seconds>0){const pieces=(preciseByMinute?.[j]??(Array.isArray(x.jointRuns)?x.jointRuns:[x])).map(z=>({...z,seconds:Math.min(z.seconds,z.motionSeconds??z.seconds),minute:j,resting:z.motion<=25||z.motion<=45&&resting[j]&&z.hr>=ref.hrLow*.75&&z.hr<=ref.hrHigh&&z.rr>=ref.rrLow*.75&&z.rr<=ref.rrHigh})).filter(z=>z.seconds>0);
 const actualSeconds=pieces.reduce((n,z)=>n+z.seconds,0);if(!actualSeconds)continue;const restSeconds=pieces.reduce((n,z)=>n+(z.resting?z.seconds:0),0),y={...x,seconds:actualSeconds,hr:pieces.reduce((n,z)=>n+z.hr*z.seconds,0)/actualSeconds,rr:pieces.reduce((n,z)=>n+z.rr*z.seconds,0)/actualSeconds,motion:pieces.reduce((n,z)=>n+z.motion*z.seconds,0)/actualSeconds,...(preciseByMinute?{secondOffsets:pieces.flatMap(z=>z.validOffsets??[])}:Array.isArray(x.validOffsets)?{secondOffsets:x.validOffsets}:{}),resting:restSeconds>=actualSeconds/2,restSeconds,pieces,minute:j};a.push(y);timeline.push(y);}}
  const seconds=a.reduce((v,x)=>v+x.seconds,0),quietSeconds=a.reduce((v,x)=>v+x.restSeconds,0),fraction=seconds?quietSeconds/seconds:null;
  slots[i]=seconds?(fraction>=.5?'sleep':'awake'):'missing';bins.push({i,valid:seconds>0,rest:seconds>0&&fraction>=.5,heart:mean(a.map(x=>x.hr)),breath:mean(a.map(x=>x.rr)),motion:mean(a.map(x=>x.motion)),quiet:fraction,restEvidence:fraction,night:i<16||i>=40,seconds,quietSeconds});}
 function part(a,target,span){let total=0,quiet=0,run=0,longest=0,events=0,interruptions=0,previousEnd=null,previousRest=false,unknownQuiet=0,unknownTotal=0,bouts=[];const q=[];
  const close=()=>{if(run)bouts.push(run);run=0;};
  for(const x of a.flatMap(z=>z.pieces||[z])){total+=x.seconds;if(x.resting){quiet+=x.seconds;q.push(x);}
   const offsets=Array.isArray(x.validOffsets)?x.validOffsets:null;
   const add=(t,n)=>{const adjacent=t===previousEnd;if(!adjacent)close();if(x.resting){if(!run)events++;run+=n;longest=Math.max(longest,run);}else{if(adjacent&&previousRest)interruptions++;close();}previousEnd=t+n;previousRest=x.resting;};
   if(x.seconds===60&&!offsets){add(x.minute*60,60);continue;}
   if(!offsets){close();previousEnd=null;previousRest=false;unknownTotal+=x.seconds;if(x.resting)unknownQuiet+=x.seconds;continue;}
   forOffsetRuns(offsets,x.minute*60,add);
  }close();
  const fraction=total?quiet/total:null,expected=target/span;
  // Preserve observed quiet time, but isolated stops are weak rest evidence.
  // A three-minute support taper is an engineering prior, not a sleep-stage label.
  const supportedRestSeconds=unknownQuiet+bouts.reduce((v,n)=>v+Math.min(1,n/180)*n,0),supportedFraction=total?supportedRestSeconds/total:null;
  const ds=total?round(100*Math.min(1,supportedFraction/expected)*Math.exp(-5*Math.max(0,fraction-Math.min(.95,expected+.12))**2)):null;
  // A quiet animal can have elevated vitals. Duration and physiology are separate.
  const hs=vitalScore(q,'hr',ref),rs=vitalScore(q,'rr',ref);const fs=q.length?round(q.reduce((sum,x)=>sum+x.seconds*Math.sqrt(vitalFit(x.hr,'hr',refAt(ref,x.ts))*vitalFit(x.rr,'rr',refAt(ref,x.ts))),0)/quiet*Math.exp(-.45*Math.max(hs.severeBurden??0,rs.severeBurden??0,.65*(hs.acuteBurden??0),.65*(rs.acuteBurden??0)))):total?0:null;
  // Multiple rest bouts are normal; reward time in bouts >= 2 min, not a single longest sleep.
  const knownQuiet=quiet-unknownQuiet,cs=knownQuiet>0&&knownQuiet>=.75*quiet?round(100*bouts.reduce((v,n)=>v+Math.min(1,n/120)*n,0)/knownQuiet):quiet===0&&total>0?0:null;
  const qualified=total>=span*3600*.75&&unknownTotal<=.25*total,enough=qualified;
  const computed=weight({duration:ds,fraction:fs,continuity:cs},{duration:.60,fraction:.30,continuity:.10},['duration','fraction','continuity'],true).score;
  return {score:enough&&F(computed)?computed:null,hours:+(quiet/3600).toFixed(2),observedHours:+(total/3600).toFixed(2),observedSeconds:total,restSeconds:quiet,supportedRestSeconds,supportedRestFraction:supportedFraction,durationScore:ds,fractionScore:fs,qualityScore:fs,continuityScore:cs,quietFraction:fraction,restFraction:fraction,longestHours:longest/3600,longestRestHours:longest/3600,interruptions,restBlocks:events,coverageFraction:total/(span*3600),partial:!qualified,qualified};}
 // Quiet wake and sleep cannot be distinguished reliably from these channels alone.
 // Estimate sustained low-motion, in-band rest separately; never relabel it as REM or deep sleep.
 let probableRestSeconds=0,run=0,last=null;const flush=()=>{if(run>=180)probableRestSeconds+=run;run=0;last=null;};
 for(const x of timeline.flatMap(z=>z.pieces||[z])){const ok=x.resting&&x.hr>=ref.hrLow&&x.hr<=ref.hrHigh&&x.rr>=ref.rrLow&&x.rr<=ref.rrHigh;if(!ok){flush();continue;}const add=(t,n)=>{if(t!==last)flush();run+=n;last=t+n;};if(Array.isArray(x.validOffsets)){forOffsetRuns(x.validOffsets,x.minute*60,add);}else if(x.seconds===60)add(x.minute*60,60);else flush();}flush();
 const night=part(timeline.filter(x=>x.minute<480||x.minute>=1200),ref.night,12),day=part(timeline.filter(x=>x.minute>=480&&x.minute<1200),ref.day,12),all=part(timeline,ref.night+ref.day,24);
 // Both night and day must independently meet the coverage rule for a daily score.
 const nightWeight=.60,dayWeight=.40;const observedWeights={night:night.qualified?nightWeight:0,day:day.qualified?dayWeight:0};let num=0,den=0;
 for(const [key,obj] of [['night',night],['day',day]])if(F(obj.score)){num+=obj.score*observedWeights[key];den+=observedWeights[key];}
 const weighted=F(all.score)&&den ? .60*all.score+.40*num/den : all.score;
 // Excess quiet time is penalized only when observed coverage supports the inference.
 const excessive=all.qualified?100*Math.exp(-12*Math.max(0,all.restFraction-Math.min(.92,(ref.night+ref.day)/24+.15))**2):100;
 const score=all.qualified&&night.qualified&&day.qualified&&F(weighted)?round(weighted*excessive/100):null;
 for(const x of timeline){delete x.pieces;delete x.jointRuns;}
 return {date,slots,bins,night,day,all,nightHours:night.hours,dayHours:day.hours,restHours:all.hours,score,timeline,weight:{night:nightWeight,day:dayWeight,allDay:.60,dayNight:.40},observedWeights,partial:!all.qualified||!night.qualified||!day.qualified,source:'unified-calendar-day-polyphasic-rest-estimate',probableRestSeconds,sleepStagesVerified:false};}
function recovery(a,ref){
 a=jointSeries(a);const candidates=[],support=x=>Math.min(x.seconds,x.motionSeconds??x.seconds),day=a.find(x=>x?.ts)?.ts.slice(0,10);
 const time=(k)=>day+'T'+String(Math.floor(k/3600)).padStart(2,'0')+':'+String(Math.floor(k/60)%60).padStart(2,'0')+':'+String(k%60).padStart(2,'0');
 function add(points,kind,start,baseH,baseR,load,mode,trace=null){
  const [x,...rest]=points,y=rest.at(-1);if(!x||!y||!points.every(z=>good({...z,seconds:1}))||x.hr<baseH+(mode==='post-activity'?Math.max(15,.20*baseH):Math.max(8,.12*baseH)))return;
  const index=(key,base,lo,hi,minRise)=>{const initial=x[key],end=y[key],excess=initial-base;
   if(key==='rr'&&excess<minRise){const trajectory=trace??points;const loss=mean(trajectory.map(z=>bandLoss(z[key],lo,hi)**2));return round(100*Math.exp(-6*bandLoss(end,lo,hi)**2-6*loss-2*Math.max(0,(end-initial)/Math.max(initial,1))**2));}
   const progress=z=>clamp((initial-z[key])/Math.max(minRise,excess),0,1);
   // End point dominates, intermediate recovery rewards earlier return to baseline.
   const endProgress=progress(y),early=rest.length>1?mean(rest.slice(0,-1).map(progress)):endProgress;
   // Dropping below the healthy resting envelope is not successful recovery.
   const residual=bandLoss(end,lo,hi),undershoot=Math.max(0,(base-end)/base-.15),remaining=Math.max(0,(end-base)/base-.10);
   if(!trace)return round(100*(.80*endProgress+.20*early)*Math.exp(-8*residual**2-3*undershoot**2-2*remaining**2));
   const earlyProgress=mean(trace.slice(0,61).map(progress)),integrated=mean(trace.map(progress));let best=0,rebound=0;for(const z of trace){const q=progress(z);best=Math.max(best,q);rebound=Math.max(rebound,best-q);}
   const instability=mean(trace.map(z=>Math.max(0,(base-z[key])/base-.15)**2+Math.max(0,(z[key]-initial)/Math.max(base,1))**2));
   const unsafe=mean(trace.map(z=>Math.max(0,(lo-z[key])/lo)**2));
   return round(100*(.35*endProgress+.20*earlyProgress+.25*integrated+.20*(1-rebound))*Math.exp(-8*residual**2-3*undershoot**2-2*remaining**2-5*instability-8*unsafe-1.2*rebound));};
  const hScore=index('hr',baseH,ref.hrLow,ref.hrHigh,8),rScore=index('rr',baseR,ref.rrLow,ref.rrHigh,2),score=weight({heart:hScore,breath:rScore},{heart:.80,breath:.20},['heart','breath'],true).score;
  candidates.push({minute:Math.floor(start/60),start:time(start),end:time(start+120),from:x.hr,to:y.hr,peak:x.hr,at2:y.hr,drop:x.hr-y.hr,rrDrop:x.rr-y.rr,fromRR:x.rr,toRR:y.rr,baseH,baseR,baseHeartSource:'preceding-normal-rest-or-profile-reference',baseBreathSource:'preceding-normal-rest-or-profile-reference',hrLow:ref.hrLow,hrHigh:ref.hrHigh,rrLow:ref.rrLow,rrHigh:ref.rrHigh,heartScore:hScore,breathScore:rScore,intensity:load,score,evidence:kind,estimated:kind!=='aligned-second-rate-windows',midpoint:points.length>=3?points[Math.floor(points.length/2)].hr:null,points:points.map((z,i)=>({second:i*120/(points.length-1),hr:z.hr,rr:z.rr})),mode});
 }
 // Time-aligned second-level rate evidence. A zero or an invalid reading cannot
 // be a recovery endpoint. Historical two-minute summaries cannot fill gaps.
 const dense=a.secondRates,seconds=dense?{get(k){const h=dense.heart[k],r=dense.breath[k],motion=dense.motion[k];return validRate(h)&&validRate(r,120)&&usableMotion({motion})?{hr:h,rr:r,motion}:undefined;},*[Symbol.iterator](){for(let k=0;k<86400;k++){const z=this.get(k);if(z)yield [k,z];}}}:new Map();if(!dense)for(const z of preciseRuns(a)){if(z.intervalSummaryOnly||z.rateWindowSeconds!==1||!Array.isArray(z.validOffsets)||!motionGood(z))continue;const m=Number(z.ts.slice(11,13))*60+Number(z.ts.slice(14,16));for(const k of z.validOffsets)seconds.set(m*60+k,z);}
 function windowAt(k,lo,hi){const w=[];for(let i=k+lo;i<=k+hi;i++){const z=seconds.get(i);if(z)w.push(z);}return w.length>=hi-lo+1?{hr:median(w.map(x=>x.hr)),rr:median(w.map(x=>x.rr)),motion:median(w.map(x=>x.motion))}:null;}
 const baseline=(start)=>{const q=[];for(let k=Math.max(0,start-14400);k<start-30;k+=5){const z=seconds.get(k);if(z&&z.motion<=25&&z.hr>=ref.hrLow&&z.hr<=ref.hrHigh&&z.rr>=ref.rrLow&&z.rr<=ref.rrHigh)q.push(z);}const fallback=refAt(ref,time(start));return {hr:q.length>=60?median(q.map(x=>x.hr)):fallback.hr,rr:q.length>=60?median(q.map(x=>x.rr)):fallback.rr};};
 function* candidateSeconds(){if(!dense){yield* seconds;return;}for(let k=30;k+120<86400;k++){const h=dense.heart[k],motion=dense.motion[k],later=dense.motion[k+10],previous=dense.heart[k-25];if(!(motion>=45&&later<=30||motion<=25&&later<=30&&h-previous>=8))continue;const z=seconds.get(k);if(z)yield [k,z];}}
 let lastCandidate=-120;for(const [k,z] of candidateSeconds()){if(k<30||k+120>=86400||k-lastCandidate<120)continue;const z1=seconds.get(k+10),z0=seconds.get(k-25);if(!z1||!z0||!(z.motion>=45&&z1.motion<=30||z.motion<=25&&z1.motion<=30&&z.hr-z0.hr>=8))continue;const before=windowAt(k,-14,0),after=windowAt(k,1,15),initial=windowAt(k,-4,0),prior=windowAt(k,-30,-16);if(!before||!after||!initial)continue;
  const exercise=z.motion>=45&&seconds.get(k+1)?.motion<=30&&before.motion>=45&&after.motion<=30,possibleQuiet=before.motion<=25&&after.motion<=30&&prior&&before.hr-prior.hr>=Math.max(20,.25*prior.hr);if(!exercise&&!possibleQuiet)continue;const base=baseline(k),quietPeak=possibleQuiet&&prior.hr<base.hr+Math.max(8,.12*base.hr)&&before.hr>=base.hr+Math.max(8,.12*base.hr);
  if(!exercise&&!quietPeak||initial.hr<base.hr+Math.max(8,.12*base.hr))continue;
  let covered=0,gap=0,maxGap=0,relapse=0;for(let i=0;i<=120;i++){const q=seconds.get(k+i);if(q){covered++;gap=0;if(i>0&&q.motion>35)relapse++;}else{gap++;maxGap=Math.max(gap,maxGap);}}
  if(covered!==121||maxGap>0||relapse>0)continue;const points=[initial,...[30,60,90,120].map(x=>windowAt(k+x,-4,0))];if(points.some(x=>!x))continue;
  const countBefore=candidates.length;add(points,'aligned-second-rate-windows',k,base.hr,base.rr,before.motion,exercise?'post-activity':'quiet-elevation',Array.from({length:121},(_,i)=>seconds.get(k+i)));if(candidates.length>countBefore)lastCandidate=k;
 }
 // Full minute summaries support a *representative* 120-second separation,
 // not a second-precise curve. Partial or misaligned minutes do not qualify.
 for(let i=1;i<a.length-2;i++){const [x,m,y]=a.slice(i,i+3),p=a[i-1];if(![x,m,y].every(z=>motionGood(z)&&support(z)>=59&&!z.intervalSummaryOnly&&!Array.isArray(z.validOffsets)))continue;
  const start=i*60;if(candidates.some(e=>Math.abs(Date.parse(e.start+'+08:00')-Date.parse(time(start)+'+08:00'))<120000))continue;
  const exercise=motionGood(p)&&support(p)>=59&&p.motion>=45&&x.motion>=45&&m.motion<=30&&y.motion<=30,quietPeak=motionGood(p)&&support(p)>=59&&p.motion<=25&&x.motion<=25&&m.motion<=30&&y.motion<=30&&p.hr<ref.hr+8&&x.hr>=ref.hr+Math.max(20,.25*ref.hr)&&x.hr-p.hr>=Math.max(20,.25*p.hr);
  if(!exercise&&!quietPeak)continue;const prior=a.slice(Math.max(0,i-240),i-1).filter(z=>motionGood(z)&&support(z)>=59&&z.motion<=25&&z.hr>=ref.hrLow&&z.hr<=ref.hrHigh&&z.rr>=ref.rrLow&&z.rr<=ref.rrHigh);
  add([x,m,y],'minute-waveform-endpoints',start,prior.length>=5?median(prior.map(z=>z.hr)):ref.hr,prior.length>=5?median(prior.map(z=>z.rr)):ref.rr,x.motion,exercise?'post-activity':'quiet-elevation');
 }
 // No top-five peak bias: retain all non-overlapping events, exact evidence first.
 const events=[];for(const x of candidates.sort((x,y)=>Number(x.estimated)-Number(y.estimated)||x.start.localeCompare(y.start))){if(events.some(y=>x.start<=y.end&&y.start<=x.end))continue;events.push(x);}
 const exact=events.filter(x=>!x.estimated),eligible=exact.length?exact:events,postActivity=eligible.filter(x=>x.mode==='post-activity'),pool=postActivity.length?postActivity:eligible,ranked=pool.slice().sort((x,y)=>x.score-y.score||x.start.localeCompare(y.start)),primary=ranked[Math.floor((ranked.length-1)/2)]??null;
 return {events,primary,candidateCount:candidates.length,score:primary?.score??null,drop:primary?.drop??null,estimated:primary?.estimated??false,selection:'lower-median-of-nonoverlapping-comparable-events-prefer-aligned-seconds-and-post-activity',summaryEndpointCount:events.filter(x=>x.estimated).length};}
function hrvEvidence(hrv,date){const bpm=hrv?.bpm??hrv?.nvgr,rm=hrv?.rmssd,sdn=hrv?.sdnn,n=hrv?.minutes;
 const stampTime=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?$/.test(v)&&v.slice(0,10)===date?Date.parse(v+'+08:00'):NaN;
 const begin=stampTime(hrv?.start),end=stampTime(hrv?.end),span=(end-begin)/60000,coverage=hrv?.validMinutes??(hrv?.source==='verified-sdk-aggregate'?n:null);
 const plausible=F(bpm)&&bpm>=60000/2200&&bpm<=60000/220&&F(rm)&&F(sdn)&&rm>=0&&sdn>=0&&rm<=1980&&sdn<=1010&&rm<=2.1*sdn+1&&(!F(hrv?.bpm)||!F(hrv?.nvgr)||Math.abs(hrv.bpm-hrv.nvgr)<=Math.max(3,.08*bpm));
 const usable=F(span)&&[5,10,30,60].includes(n)&&span>=n-.1&&span<=n+.1&&F(coverage)&&coverage<=span+.05&&coverage>=n*(hrv.qualified===true?.90:.80);
 const accepted=!!(plausible&&usable&&hrv.qualified===true&&hrv.quality!==false&&hrv.quality!=='invalid'&&hrv.qualityConfirmed!==false&&hrv.contactGood!==false);
 return {bpm,rm,sdn,n,begin,end,plausible,usable,accepted};}
function hrvBoundToObservation(a,h,date,e=hrvEvidence(h,date)){
 if(!e.usable||!Array.isArray(a))return false;const origin=Date.parse(date+'T00:00:00+08:00'),lo=(e.begin-origin)/1000,hi=(e.end-origin)/1000;let observed=0,rate=0,quiet=0,verifiedSeconds=0;
 for(const z of preciseRuns(a,lo,hi)){const m=Number(z.ts.slice(11,13))*3600+Number(z.ts.slice(14,16))*60;if(m>=hi||m+60<=lo)continue;const n=Array.isArray(z.validOffsets)?z.validOffsets.reduce((v,k)=>v+Math.max(0,Math.min(m+k+1,hi)-Math.max(m+k,lo)),0):z.seconds>=59.999?Math.max(0,Math.min(m+60,hi)-Math.max(m,lo)):0;observed+=n;rate+=n*z.hr;if(z.motion<=25)quiet+=n;if(z.rateWindowSeconds===1&&z.peakProvenance==='verified-beat-timestamps'&&!z.intervalSummaryOnly)verifiedSeconds+=n;}
 if(observed<.90*(hi-lo)||observed<=0||Math.abs(rate/observed-e.bpm)>Math.max(10,.20*e.bpm))return false;
 if(quiet<.90*observed)return false;
 {let w=a.waveHrv;if(!w&&!a.rateWindowSeconds&&h?.beatEvidence&&h.source==='verified-beat-timestamps'){if(verifiedSeconds<.90*observed)return false;const b=h.beatEvidence,t=b.times,mask=b.mask;if(!Array.isArray(t)||t.length<40||t.length>20000||!Array.isArray(mask)||mask.length!==t.length-1||mask.some(x=>typeof x!=='boolean')||t.some((v,i)=>!F(v)||v<0||v>=86400000||i>0&&v<=t[i-1]))return false;const predicted=new Map();for(let j=0;j<mask.length;j++){if(!mask[j])continue;const dt=t[j+1]-t[j];if(dt<220||dt>2200)continue;for(let k=Math.floor(t[j]/1000);k<Math.ceil(t[j+1]/1000);k++){const dur=Math.max(0,Math.min(t[j+1],(k+1)*1000)-Math.max(t[j],k*1000));if(!dur)continue;const v=predicted.get(k)??[0,0];v[0]+=dur;v[1]+=dur*60000/dt;predicted.set(k,v);}}
 let compare=0,agree=0;for(const z of preciseRuns(a,lo,hi)){if(z.peakProvenance!=='verified-beat-timestamps')continue;const m=Number(z.ts.slice(11,13))*3600+Number(z.ts.slice(14,16))*60;if(m>=hi||m+60<=lo)continue;for(const k of z.validOffsets??[]){const at=m+k,overlap=Math.max(0,Math.min(at+1,hi)-Math.max(at,lo));if(overlap<=0)continue;const v=predicted.get(at);if(!v||v[0]<999)continue;const expected=v[1]/v[0];compare+=overlap;if(Math.abs(z.hr-expected)<=Math.max(5,.08*expected))agree+=overlap;}}
 if(compare<.80*(hi-lo)||agree<.90*compare)return false;
 const m=root.DeepPetUnifiedHrvMath.metrics(t,{mask});if(m&&m.coverage>=.90)w={m,n:e.n,selected:t};}if(!w||!w.m||w.n!==e.n||Math.abs(w.selected[0]/1000-lo)>1.01||Math.abs(w.selected.at(-1)/1000-hi)>1.01)return false;
 const same=(a,b)=>F(a)&&F(b)&&Math.abs(a-b)<=Math.max(.01,Math.abs(b)*.001);if(!same(e.rm,w.m.rmssd)||!same(e.sdn,w.m.sdnn)||!same(e.bpm,w.m.bpm)||!same(h.regularity,w.m.regularity))return false;}
 return true;
}
function quietHrv(a,h,date,ref){const e=hrvEvidence(h,date);if(!e.accepted||!hrvBoundToObservation(a,h,date,e))return null;const start=(e.begin-Date.parse(date+'T00:00:00+08:00'))/1000,end=(e.end-Date.parse(date+'T00:00:00+08:00'))/1000;let observed=0,quiet=0;for(const z of preciseRuns(a,start,end)){const m=Number(z.ts.slice(11,13))*3600+Number(z.ts.slice(14,16))*60;const n=Array.isArray(z.validOffsets)?z.validOffsets.reduce((v,k)=>v+Math.max(0,Math.min(m+k+1,end)-Math.max(m+k,start)),0):z.seconds>=59.999?Math.max(0,Math.min(m+60,end)-Math.max(m,start)):0;observed+=n;if(z.motion<=25&&z.hr>=ref.hrLow&&z.hr<=ref.hrHigh&&z.rr>=ref.rrLow&&z.rr<=ref.rrHigh)quiet+=n;}if(observed<.85*(end-start)||quiet<.90*observed||!F(h.regularity)||h.regularity<80||!h.source||((Number(h.start.slice(11,13))<8||Number(h.start.slice(11,13))>=20)!==(Number(h.end.slice(11,13))<8||Number(h.end.slice(11,13))>=20)))return null;return {...e,rmRatio:e.rm*e.bpm/60000,sdRatio:e.sdn*e.bpm/60000,context:Number(h.end.slice(11,13))<8||Number(h.end.slice(11,13))>=20?'night':'day'};}
function personalHrv(ref,date,get,getHrv,current){const now=quietHrv(get(date),current,date,ref);if(!ref.ready||!now||typeof getHrv!=='function')return {weight:0,days:0};const clean=new Set(ref.personalCalibrationDays.filter(x=>x.heart.eligible&&x.breath.eligible).map(x=>x.date));const rows=ref.priorDates.filter(d=>clean.has(d)).map(d=>{const h=getHrv(d);return h&&h.source===current.source?quietHrv(get(d),h,d,ref):null;}).filter(z=>z&&z.n===now.n&&z.context===now.context&&Math.abs(z.bpm-now.bpm)<=.25*now.bpm&&z.rmRatio>0&&z.sdRatio>0);const weight=rows.length>=10?.40*rows.length/14:0,rm=median(rows.map(x=>x.rmRatio)),sd=median(rows.map(x=>x.sdRatio));return {weight,days:rows.length,rmRatio:rm,sdRatio:sd,drop:weight?Math.max(0,1-now.rmRatio/rm,1-now.sdRatio/sd):0};}
const recHistoryCache=new WeakMap();
function recoveryReference(ref,get){const buckets={};if(!ref.ready)return buckets;for(const d of ref.priorDates){const clean=ref.personalCalibrationDays.find(x=>x.date===d);if(!clean?.heart.eligible||!clean?.breath.eligible)continue;const a=get(d);if(!Array.isArray(a))continue;const key=JSON.stringify([ref.hr,ref.rr,ref.hrLow,ref.hrHigh,ref.rrLow,ref.rrHigh,ref.contextPersonal]);let entry=recHistoryCache.get(a);if(!entry||entry.key!==key){entry={key,result:recovery(a,ref)};recHistoryCache.set(a,entry);}const daily={};for(const e of entry.result.events){if(e.mode!=='post-activity'||!F(e.score)||e.score<60)continue;const k=(e.estimated?'estimated':'exact')+'|'+(e.intensity>=70?'high':'moderate');(daily[k]??=[]).push(e.score);}for(const [k,v] of Object.entries(daily))(buckets[k]??=[]).push(median(v));}return Object.fromEntries(Object.entries(buckets).map(([k,v])=>[k,{days:v.length,center:median(v),weight:v.length>=10?.30*v.length/14:0}]));}
// V10.216: one-way wellness guard. Engineering policy, not a clinical diagnosis.
// Independent raw observations are unchanged; a low downstream score never changes upstream measures.
function enforceLinked(m){
 if(!m?.scores||m.linkAudit?.directionalVersion==='10.216')return m;
 const s=m.scores, complete=m.evidence?.complete||{}, steps=m.linkAudit?.steps||[], changes=[];
 const ceiling=v=>v<20?59:v<40?79:v<60?89:100;
 const cap=(key,inputs)=>{if(!F(s[key])||complete[key]!==true)return;const eligible=inputs.filter(k=>complete[k]===true&&F(s[k]));if(!eligible.length)return;const max=Math.min(...eligible.map(k=>ceiling(s[k])));if(s[key]>max){changes.push({metric:key,from:s[key],to:max,inputs:Object.fromEntries(eligible.map(k=>[k,s[k]])),rule:'directional-wellness-ceiling'});s[key]=max;}};
 const update=(k)=>{const t=steps.find(x=>x.metric===k);if(t)t.score=s[k];if(m.weights?.[k])m.weights[k].score=s[k];};
 const beforeSleep=s.sleep;cap('sleep',['heart','breath']);if(s.sleep!==beforeSleep&&m.rest){m.rest.unrestrictedScore??=beforeSleep;m.rest.score=s.sleep;}
 const e=steps.find(x=>x.metric==='energy');if(e&&s.sleep!==beforeSleep&&F(s.energy)&&F(e.inputs.sleep)){const prev=s.energy;e.inputs.sleep=Math.min(e.inputs.sleep,s.sleep);const w=weight(e.inputs,W.energy,['motion','cardio','sleep'],true);if(F(w.score)){s.energy=Math.min(prev,w.score);if(s.energy!==prev)changes.push({metric:'energy',from:prev,to:s.energy,inputs:{sleep:s.sleep},rule:'linked-rest-recalculation'});if(m.weights?.energy)Object.assign(m.weights.energy,w,{score:s.energy});}if(m.details?.energy){m.details.energy.sleep=s.sleep;m.details.energy.sleepForEnergy=e.inputs.sleep;}}
 cap('energy',['sleep','cardio']);update('energy');
 const ar=steps.find(x=>x.metric==='activityRecovery');if(ar&&F(s.activityRecovery)&&F(s.energy)&&ar.inputs.energy!==s.energy){const prev=s.activityRecovery;ar.inputs.energy=s.energy;const w=weight(ar.inputs,W.activityRecovery,['energy','calm'],true);if(F(w.score)){s.activityRecovery=Math.min(prev,w.score);if(s.activityRecovery!==prev)changes.push({metric:'activityRecovery',from:prev,to:s.activityRecovery,inputs:{energy:s.energy},rule:'linked-energy-recalculation'});if(m.weights?.activityRecovery)Object.assign(m.weights.activityRecovery,w,{score:s.activityRecovery});}}
 cap('activityRecovery',['energy','recovery','calm']);update('activityRecovery');
 if(m.linkAudit){m.linkAudit.directionalVersion='10.216';m.linkAudit.directionalChanges=changes;const flags=m.linkAudit.flags;if(Array.isArray(flags)){for(const [k,f] of [['sleep','rest-load'],['energy','energy-load']])if(F(s[k])&&s[k]<80&&!flags.includes(f))flags.push(f);}}
 if(m.evidence?.observedScores&&F(s.activityRecovery))m.evidence.observedScores.activityRecovery=s.activityRecovery;
 return m;
}
function scoreDay({date,profile,get,priorDates,hrv,getHrv,anchorKey=null}){const a=jointSeries(get(date)),p=get(dateAdd(date,-1)),ref=reference(profile,date,get,priorDates,anchorKey),v=a.filter(good),context=contextVitals(a,true),q=context.filter(x=>x.motion<=25),restingVitals=context.filter(x=>x.restWeight>=.95),H=restingVitals.map(x=>x.hr),R=restingVitals.map(x=>x.rr),h=vitalScore(context,'hr',ref),r=vitalScore(context,'rr',ref),mh=h.median,mr=r.median,hlevel=h.level,rlevel=r.level,hs=h.stability,rs=r.stability,heart=h.score,breath=r.score;
 // Identical numerical map. Unverified beat detector estimates are displayed
 // separately and excluded from composite evidence for ANY source.
 const bpm=hrv?.bpm??hrv?.nvgr,rm=hrv?.rmssd,sdn=hrv?.sdnn;
 const hrvPlausible=F(bpm)&&bpm>=60000/2200&&bpm<=60000/220&&F(rm)&&F(sdn)&&rm>=0&&sdn>=0&&rm<=1980&&sdn<=1010&&rm<=2.1*sdn+1&&(!F(hrv?.bpm)||!F(hrv?.nvgr)||Math.abs(hrv.bpm-hrv.nvgr)<=Math.max(3,.08*bpm));
 const groupHrvScore=hrvPlausible?root.DeepPetUnifiedHrvMath.score(rm,sdn,1,null,bpm,ref):null;
 const hrvPersonal=personalHrv(ref,date,get,getHrv,hrv);ref.hrvPersonal=hrvPersonal;
 const hrvScore=F(groupHrvScore)?round(groupHrvScore*(1-hrvPersonal.weight*Math.max(0,(hrvPersonal.drop??0)-.15))):null;
 // Same numeric map for all admitted same-day observations. Research estimates never participate in scores.
 const stampTime=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?$/.test(v)&&v.slice(0,10)===date?Date.parse(v+'+08:00'):NaN;
 const begin=stampTime(hrv?.start),end=stampTime(hrv?.end),span=(end-begin)/60000,n=hrv?.minutes;
 // The last beat may fall up to six seconds inside the nominal window. No instant/undated/cross-day HRV.
 const sameDay=F(span)&&[5,10,30,60].includes(n)&&span>=n-.1&&span<=n+.1;
 const coverage=hrv?.validMinutes??(hrv?.source==='verified-sdk-aggregate'?n:null);
 const usable=sameDay&&F(coverage)&&coverage<=span+.05&&coverage>=n*(hrv.qualified===true?.90:.80);
 const estimate=!!(usable&&hrv.qualified!==true&&F(hrvScore));
 const accepted=!!(usable&&hrv.qualified===true&&hrv.quality!==false&&hrv.quality!=='invalid'&&hrv.qualityConfirmed!==false&&hrv.contactGood!==false&&F(hrvScore)&&hrvBoundToObservation(a,hrv,date)),stable=accepted&&F(hrv.regularity)&&hrv.regularity>=0&&hrv.regularity<=100?round(hrv.regularity):null;
 const jointRisk=context.reduce((o,z)=>{const sec=Math.min(z.seconds,z.motionSeconds??z.seconds),hl=contextLoss(z.hr,'hr',ref,z.contextLoad),rl=contextLoss(z.rr,'rr',ref,z.contextLoad);if(F(hl)&&F(rl)&&hl>=.30&&rl>=.30){o.seconds+=sec;o.dose+=sec*(1-Math.exp(-Math.min(hl,rl)));}return o;},{seconds:0,dose:0});
 const c=weight({heart,breath,hrv:accepted?hrvScore:null,stable},W.cardio,['heart','breath'],true);if(F(c.score)&&jointRisk.seconds>0)c.score=round(c.score*(1-.12*(1-Math.exp(-jointRisk.dose/180))));c.observedScore=c.score;if(!c.complete||context.reduce((n,z)=>n+Math.min(z.seconds,z.motionSeconds??z.seconds),0)<.75*86400)c.score=null;
 const sleep=rest(date,a,p,ref),m=context,motionSec=m.reduce((n,x)=>n+Math.min(x.seconds,x.motionSeconds??x.seconds),0),active=motionSec?m.reduce((n,x)=>n+Math.min(x.seconds,x.motionSeconds??x.seconds)*smooth01((x.motion-25)/20),0)/motionSec:null,quietFraction=motionSec?q.reduce((n,x)=>n+Math.min(x.seconds,x.motionSeconds??x.seconds),0)/motionSec:null,activeObservedDayFraction=F(active)?active*motionSec/86400:null,activity=F(active)?round(100*Math.min(active/ref.activityTarget,1)*(1-.35*(1-Math.exp(-1.2*Math.max(0,activeObservedDayFraction/ref.activityTarget-1.35)**2)))):null,quietQuality=motionSec&&q.length?q.reduce((n,x)=>n+Math.min(x.seconds,x.motionSeconds??x.seconds)*Math.sqrt(vitalFit(x.hr,'hr',refAt(ref,x.ts))*vitalFit(x.rr,'rr',refAt(ref,x.ts)))/100,0)/motionSec:motionSec?0:null,restFraction=F(quietQuality)?round(100*quietQuality/ref.quietTarget):null,motion=weight({activity,rest:restFraction},{activity:.7,rest:.3},['activity','rest']).score;
 const fullDay=motionSec>=.75*86400&&!sleep.partial;
 const activityBlocks=Array(6).fill(0),observedBlocks=Array(6).fill(0);for(const z of m){const k=Math.floor(Number(z.ts.slice(11,13))/4),n=Math.min(z.seconds,z.motionSeconds??z.seconds);if(k>=0&&k<6){observedBlocks[k]+=n;activityBlocks[k]+=n*smooth01((z.motion-25)/20);}}const activeTotal=activityBlocks.reduce((n,x)=>n+x,0),activityConcentration=activeTotal>0?Math.max(...activityBlocks)/activeTotal:null,distributionPenalty=fullDay&&observedBlocks.every(n=>n>=7200)&&F(activityConcentration)?Math.min(.12,.24*Math.max(0,activityConcentration-.60)):0;
 const distributedMotion=F(motion)?round(motion*(1-distributionPenalty)):null;const priorRest=Array.isArray(p)&&p.some(motionGood)?rest(dateAdd(date,-1),p,[],ref):null;
 const priorSleep=priorRest&&!priorRest.partial&&F(priorRest.score)?priorRest.score:null,priorSleepValues=F(priorSleep)?[priorSleep]:[];
 if(fullDay)for(let k=2;k<=3;k++){const prior=get(dateAdd(date,-k));if(!Array.isArray(prior)||!prior.some(motionGood))continue;const r=rest(dateAdd(date,-k),prior,[],ref);if(!r.partial&&F(r.score))priorSleepValues.push(r.score);}
 const fatigueRest=priorSleepValues.length>=2?mean(priorSleepValues):priorSleep;
 const sleepForEnergy=F(sleep.score)&&F(fatigueRest)?round(.80*sleep.score+.20*Math.min(sleep.score,fatigueRest)):sleep.score;
 const e=weight({motion:fullDay?distributedMotion:null,cardio:c.score,sleep:sleepForEnergy},W.energy,['motion','cardio','sleep'],true);const rec=recovery(a,ref);const recPersonal=rec.primary?.mode==='post-activity'&&ref.ready?recoveryReference(ref,get):{};ref.recoveryPersonal=recPersonal;
 if(rec.primary){const key=(rec.primary.estimated?'estimated':'exact')+'|'+(rec.primary.intensity>=70?'high':'moderate'),b=recPersonal[key];if(b?.weight&&F(rec.score)){rec.groupScore=rec.score;rec.score=round(rec.score-b.weight*Math.max(0,b.center-rec.score-5));rec.primary={...rec.primary,groupScore:rec.primary.score,score:rec.score};}}
 const calm=weight({hrv:accepted?hrvScore:null,heart,breath,rest:fullDay?restFraction:null},W.calm,['heart','breath'],true);calm.observedScore=calm.score;if(!calm.complete||!fullDay)calm.score=null;const ar=weight({energy:e.score,recovery:round(rec.score),calm:calm.score},W.activityRecovery,['energy','calm'],true);ar.observedScore=ar.score;if(!ar.complete)ar.score=null;
 const s={heart,breath,hrv:accepted?hrvScore:null,stable,cardio:c.score,sleep:sleep.score,energy:e.score,recovery:round(rec.score),calm:calm.score,activityRecovery:ar.score};const pureMotion=weight({activity,rest:F(quietFraction)?round(100*Math.min(1,quietFraction/ref.quietTarget)*Math.exp(-4*Math.max(0,quietFraction-ref.quietTarget-.30)**2)):null},{activity:.7,rest:.3},['activity','rest']).score;
 const restDomain=z=>weight({duration:z.durationScore,continuity:z.continuityScore},{duration:.85,continuity:.15},['duration','continuity'],true).score;const restDomains=[restDomain(sleep.all),restDomain(sleep.night),restDomain(sleep.day)];const sleepDomain=fullDay&&F(s.sleep)&&restDomains.every(F)?round(.60*restDomains[0]+.40*(.60*restDomains[1]+.40*restDomains[2])):null;
 const distributedPure=F(pureMotion)?round(pureMotion*(1-distributionPenalty)):null;
 const activityAdjusted=F(distributedPure)&&F(s.recovery)&&rec.primary?.mode==='post-activity'?round(distributedPure-.30*Math.max(0,distributedPure-s.recovery)):distributedPure;
 const activityDomain={score:fullDay?activityAdjusted:null,used:fullDay?['motion',...(rec.primary?.mode==='post-activity'&&F(s.recovery)?['recovery']:[])]:[],complete:fullDay&&F(activityAdjusted),method:'motion-minus-30-percent-of-positive-recovery-shortfall'};
 const physical=weight({cardio:s.cardio,sleep:sleepDomain,activityDomain:fullDay?activityAdjusted:null},W.physiol,['cardio','sleep','activityDomain'],true);
 const rhythmEvidence=weight({hrv:s.hrv,stable:s.stable,heart:hs,breath:rs},W.rhythm,['hrv','stable','heart','breath'],true);
 s.physiol=fullDay?physical.score:null;s.rhythm=fullDay?rhythmEvidence.score:null;
 const dayCoverage=(a.secondRates?motionSec:v.reduce((n,x)=>n+x.seconds,0))/86400,contextCoverage=motionSec/86400,fullContext=contextCoverage>=.75,fullHrv=accepted&&hrv?.qualified===true,complete={heart:F(heart)&&fullContext,breath:F(breath)&&fullContext,hrv:fullHrv,stable:fullHrv&&F(stable),cardio:c.complete&&fullContext&&fullHrv,energy:e.complete&&fullContext&&!sleep.partial&&c.complete,calm:calm.complete&&fullContext&&fullHrv,recovery:F(rec.score)&&['aligned-second-rate-windows','minute-waveform-endpoints'].includes(rec.primary?.evidence),recoveryExact:F(rec.score)&&rec.primary?.evidence==='aligned-second-rate-windows',sleep:F(sleep.score)&&!sleep.partial};complete.energy=complete.energy&&complete.cardio;complete.activityRecovery=ar.complete&&complete.energy&&complete.calm&&complete.recovery;complete.physiol=complete.cardio&&complete.sleep&&F(pureMotion)&&F(s.physiol);complete.rhythm=fullDay&&rhythmEvidence.complete&&F(s.rhythm);const flags=[];if(jointRisk.seconds>=20)flags.push('concurrent-cardiorespiratory-deviation');if(h.acuteBurden>=.10||r.acuteBurden>=.10||h.severeDoseSeconds>=60||r.severeDoseSeconds>=60)flags.push('brief-resting-vital-deviation');if(h.severeRunSeconds>=120||r.severeRunSeconds>=120)flags.push('sustained-resting-vital-deviation');if(F(c.score)&&c.score<80)flags.push('cardio-load');if(F(sleep.score)&&sleep.score<80)flags.push('rest-load');if(F(e.score)&&e.score<80)flags.push('energy-load');if(F(rec.score)&&rec.score<60)flags.push('slow-observed-recovery');
 const steps=[{metric:'physiol',inputs:{cardio:s.cardio,sleep:sleepDomain,activityDomain:fullDay?activityAdjusted:null},weights:W.physiol,used:physical.used,score:s.physiol},{metric:'activityDomain',inputs:{motion:fullDay?distributedPure:null,recovery:rec.primary?.mode==='post-activity'?s.recovery:null},weights:{recoveryShortfall:.30},used:fullDay?['motion',...(rec.primary?.mode==='post-activity'&&F(s.recovery)?['recovery']:[])]:[],score:fullDay?activityAdjusted:null,method:'motion-minus-30-percent-of-positive-recovery-shortfall'},{metric:'energy',inputs:{motion:fullDay?distributedMotion:null,cardio:c.score,sleep:sleepForEnergy},weights:W.energy,used:e.used,score:e.score},{metric:'calm',inputs:{hrv:accepted?hrvScore:null,heart,breath,rest:fullDay?restFraction:null},weights:W.calm,used:calm.used,score:calm.score},{metric:'activityRecovery',inputs:{energy:e.score,recovery:s.recovery,calm:s.calm},weights:W.activityRecovery,used:ar.used,score:ar.score}];
 return enforceLinked({date,scores:s,ref,rest:sleep,hrvAccepted:accepted,hrvVerified:accepted&&hrv?.qualified===true,estimatedHrv:false,estimatedComposite:!complete.physiol,evidence:{coverage:dayCoverage,contextCoverage,complete,jointRisk,estimatedHrv:false,scope:fullDay?'day':'observed-window',observedScores:{cardio:c.observedScore,calm:calm.observedScore,activityRecovery:ar.observedScore},referenceOutside:ref.personalOutsideReference===true},hrv,candidateHrvScore:estimate?hrvScore:accepted?null:hrvScore,weights:{cardio:c,energy:e,calm,activityRecovery:ar,activityDomain,physiol:physical},linkAudit:{steps,flags,sleepEvidence:F(sleep.score)},details:{heart:{medianBpm:mh,referenceBpm:ref.hr,observedSd:sd(H),levelScore:hlevel,stabilityScore:hs,band:[ref.hrLow,ref.hrHigh],deviation:h},breath:{medianPerMin:mr,referencePerMin:ref.rr,observedSd:sd(R),levelScore:rlevel,stabilityScore:rs,band:[ref.rrLow,ref.rrHigh],deviation:r},energy:{intensity:fullDay?activity:null,regularity:null,rest:fullDay?restFraction:null,avgMotion:mean(m.map(x=>x.motion)),activeFraction:active,activeObservedDayFraction,activityConcentration,distributionPenalty,activityCoverage:motionSec/86400,quietFraction,physiologicallyWeightedQuietFraction:quietQuality,cardio:c.score,sleep:sleep.score,priorSleep,fatigueRest,priorSleepDays:priorSleepValues.length,sleepForEnergy},calm:{hrv:accepted?hrvScore:null,heart,breath,quiet:fullDay?restFraction:null},recovery:rec},observedMinutes:v.reduce((s,x)=>s+x.seconds/60,0),motionMinutes:m.reduce((s,x)=>s+Math.min(x.seconds,x.motionSeconds??x.seconds)/60,0),vitals:{hrMedian:median(v.map(x=>x.hr)),rrMedian:median(v.map(x=>x.rr)),heartSpread:sd(H),breathSpread:sd(R)}});
}
// Preserve the mean of recorded scores; coverage is a separate property. A
// calendar of partial/estimated observations is not a complete monitoring period.
// Plain score maps remain supported by numeric consumers, but cannot prove coverage.
// Source and pet ownership are independent claims; contradictions are not a third data source.
function sourceKind(x){const tags=[x?.dataProvenance,x?.source,x?.unified?.dataProvenance,x?.unified?.source],kinds=new Set();for(const tag of tags){if(typeof tag!=='string')continue;if(/^synthetic(?:-|$)/.test(tag)||['sdk-demo-fixture','minute-demo-no-interbeat'].includes(tag))kinds.add('synthetic');if(['owner-A2-B0-SDK','sdk-waveform-unified','20hz-waveform'].includes(tag))kinds.add('real');}return kinds.size>1?'conflict':kinds.size===1?[...kinds][0]:null;}
function periodOwner(x){const ids=[x?.petId,x?.ownerPetId,x?.profile?.petId,x?.profile?.id,x?.unified?.petId,x?.unified?.ownerPetId].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='').map(String);return new Set(ids).size>1?'conflict':ids[0]??null;}
function period(days,n,key,asOf=null){
 n=Number.isInteger(n)&&n>=1&&n<=365?n:1;
 const input=(Array.isArray(days)?days:[]).filter(x=>validDate(x?.date));
 const latest=asOf===null?input.map(x=>x.date).sort().at(-1):validDate(asOf)?asOf:null;
 const window=latest?input.filter(x=>x.date<=latest&&x.date>=dateAdd(latest,1-n)):[];
 // A current period never rolls backwards to an older measurement date.
 // A synthetic day and an actual recorded day are not one longitudinal population.
 const source=sourceKind;const owners=new Set(window.map(periodOwner).filter(v=>v!==null));const ownerConflict=owners.has('conflict')||owners.size>1||owners.size===1&&window.some(x=>periodOwner(x)===null);
 const measured=window.filter(x=>source(x)&&(x.evidence?.coverage>0||Object.values(x.scores??{}).some(v=>F(v)&&v>=0&&v<=100)));
 const newest=measured.map(x=>x.date).sort().at(-1),kinds=new Set(measured.filter(x=>x.date===newest).map(source));
 const mode=kinds.size===1&&!kinds.has('conflict')?[...kinds][0]:null;
 const dateSources=new Map();for(const x of measured){if(!dateSources.has(x.date))dateSources.set(x.date,new Set());dateSources.get(x.date).add(source(x));}const conflicted=new Set([...dateSources].filter(([,v])=>v.size>1||v.has('conflict')).map(([d])=>d));
 const groups=new Map();for(const x of window){if(ownerConflict||kinds.size>1||kinds.has('conflict')||conflicted.has(x.date)||mode&&source(x)!==mode)continue;const v=(x.scores??x)[key];if(!groups.has(x.date))groups.set(x.date,[]);if(F(v)&&v>=0&&v<=100)groups.get(x.date).push(x);}
 const scored=[];for(const [d,rows] of groups){if(!rows.length)continue;const full=rows.filter(x=>x.evidence?.complete?.[key]===true),use=full.length?full:rows;if(use.every(x=>(x.scores??x)[key]===(use[0].scores??use[0])[key]))scored.push(use[0]);}
 scored.sort((a,b)=>a.date.localeCompare(b.date));
 const full=scored.filter(x=>x.evidence?.complete?.[key]===true),partial=scored.filter(x=>x.evidence?.complete?.[key]===false),unknown=scored.length-full.length-partial.length;
 const qualified=n===1?scored:full,observed=scored.map(x=>(x.scores??x)[key]),values=qualified.map(x=>(x.scores??x)[key]),minimumDays=Math.max(1,Math.ceil(n*.5));
 return {score:values.length>=minimumDays?round(mean(values)):null,observedMean:observed.length?round(mean(observed)):null,minimumDays,worstScore:values.length?Math.min(...values):null,lowDays:values.filter(v=>v<60).length,below80Days:values.filter(v=>v<80).length,qualifiedDays:values.length,qualifiedDates:qualified.map(x=>x.date),asOf:latest,sourceMode:mode,ownerConflict,excludedSourceConflictDates:[...conflicted].sort(),scoredDays:scored.length,fullEvidenceDays:full.length,partialEvidenceDays:partial.length,unknownEvidenceDays:unknown,requiredDays:n,estimatedDays:['recovery','activityRecovery'].includes(key)?full.filter(x=>x.evidence?.complete?.recoveryExact!==true).length:0,complete:full.length===n&&scored.length===n};}
root.DeepPetUnifiedDeep=Object.freeze({version:'10.216',enforceLinked,storedAnchor,restoreAnchor,sourceKind,periodOwner,breedProfile,hrvEvidence,personalHrv,recoveryReference,weights:W,scoreDay,waveformAlerts,hrvBoundToObservation,group,lifeStage,reference,baselineEligible:(a,p)=>Array.isArray(a)&&!!baselineDay(a,group(p)),bandScore,vitalFit,vitalScore,contextVitals,fromSeries,fromRows,rest,recovery,period,dateAdd});
})(typeof window==='undefined'?globalThis:window);
