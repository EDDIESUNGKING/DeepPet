/* DeepPet 9.94: explainable insights with per-pet real-source precedence.
 * No independent medical scores, inferred medication effects or fabricated
 * measurements. Deterministic and reusable in Node tests / mobile WebView. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetIntelligence994=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const validScore=x=>finite(x)&&x>=0&&x<=100;
const strictDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d+'T12:00:00Z'))&&new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d;
const dateMs=d=>Date.parse(d+'T12:00:00Z');
const ownerClaims=x=>[x?.petId,x?.ownerPetId,x?.profile?.petId,x?.profile?.id].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='').map(String);
const ownerValid=(x,petId,allowOwnerless=false)=>{const ids=ownerClaims(x);return new Set(ids).size<=1&&(ids.length?ids[0]===String(petId):allowOwnerless);};
const galleryTags=new Set(['synthetic-demo-fixture','synthetic-extreme-showcase-v973']);
const realQuality=q=>{
 if(!q||q.motionInterference===true||!['heartValid','respValid','wearValid','signalValid','timeContinuityValid'].every(k=>q[k]===true))return false;
 if(q.samplingMode!==undefined&&q.samplingMode!==null&&q.samplingMode!==''&& !['continuous','scheduled'].includes(q.samplingMode))return false;
 const observed=q.observedSeconds,scheduled=q.samplingMode==='scheduled',budget=scheduled?q.scheduledSeconds:86400;
 return finite(observed)&&observed>=900&&observed<=86400&&(!scheduled||finite(budget)&&budget>=1800&&budget<=86400&&observed<=budget)&&
 finite(q.observedDayFraction)&&Math.abs(q.observedDayFraction-observed/86400)<1e-5&&finite(q.timeCoverage)&&
 Math.abs(q.timeCoverage-Math.min(1,observed/budget))<1e-5&&q.timeCoverage>=.5;
};
const kindOf=x=>x?.source==='20hz-waveform'?(realQuality(x.quality)?'verified':null):
 (galleryTags.has(x?.dataProvenance)&&['sdk-demo-fixture','minute-demo-no-interbeat'].includes(x?.source)&&
 x?.quality?.heartValid!==false&&x?.quality?.respValid!==false&&x?.quality?.timeContinuityValid!==false)?'sample':null;
const qRank=x=>[kindOf(x)==='verified'?2:1,finite(x.quality?.observedSeconds)?x.quality.observedSeconds:0,finite(x.quality?.timeCoverage)?x.quality.timeCoverage:0];
const cmp=(a,b)=>{const x=qRank(a),y=qRank(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return 0;};
const sameScores=(a,b)=>Object.keys({...a.scores,...b.scores}).every(k=>Object.is(a.scores?.[k],b.scores?.[k]));
function admitted(rows,petId,asOf,allowOwnerlessGallery=false){
 const grouped=new Map(),exclude=[];
 // A real device's rejected wear day must never silently fall back to a
 // healthy showroom score on the same calendar date.
 const realDates=new Set((Array.isArray(rows)?rows:[]).filter(r=>r?.source==='20hz-waveform'&&ownerValid(r,petId,false)&&strictDate(r.date)&&r.date<=asOf).map(r=>r.date));
 for(const r of Array.isArray(rows)?rows:[]){
  const kind=kindOf(r),ownerless=allowOwnerlessGallery&&kind==='sample';
  if(kind==='sample'&&realDates.has(r.date)){exclude.push({date:r.date,reason:'real_sensor_takes_precedence'});continue;}
  if(!r||!strictDate(r.date)||r.date>asOf||!kind||!ownerValid(r,petId,ownerless)||!validScore(r.scores?.physiol)||!validScore(r.scores?.rhythm)){exclude.push({date:r?.date||null,reason:'ineligible'});continue;}
  if(!grouped.has(r.date))grouped.set(r.date,[]);grouped.get(r.date).push(r);
 }
 const days=[];for(const [date,list] of grouped){const best=list.reduce((p,r)=>cmp(p,r)>=0?p:r);
  if(list.filter(r=>cmp(r,best)===0).some(r=>!sameScores(r,best))){exclude.push({date,reason:'conflicting_same_day'});continue;}
  days.push(best);
 }
 return {days:days.sort((a,b)=>a.date.localeCompare(b.date)),excluded:exclude};
}
const metricKeys=['cardio','sleep','activityRecovery','rhythm'];
const median=values=>{const x=values.filter(validScore).sort((a,b)=>a-b);return x.length?x.length%2?x[(x.length-1)/2]:(x[x.length/2-1]+x[x.length/2])/2:null;};
function scoreChange(days,asOf){
 const today=days.find(x=>x.date===asOf)||null;
 if(!today)return {available:false,date:asOf,score:null,rhythm:null,delta:null,components:[]};
 const prior=days.filter(x=>x.date<asOf).at(-1)||null;
 const consecutive=!!prior&&dateMs(today.date)-dateMs(prior.date)===86400000;
 const components=metricKeys.map(key=>({key,score:validScore(today.scores?.[key])?Math.round(today.scores[key]):null,
  delta:consecutive&&validScore(today.scores?.[key])&&validScore(prior.scores?.[key])?Math.round(today.scores[key]-prior.scores[key]):null}));
 const physDelta=consecutive&&validScore(prior.scores?.physiol)?Math.round(today.scores.physiol-prior.scores.physiol):null;
 const rhythmDelta=consecutive&&validScore(prior.scores?.rhythm)?Math.round(today.scores.rhythm-prior.scores.rhythm):null;
 const prioritized=components.filter(x=>x.score!==null).sort((a,b)=>{
  const pa=(a.score<90?90-a.score:0)+Math.max(0,-(a.delta||0));
  const pb=(b.score<90?90-b.score:0)+Math.max(0,-(b.delta||0));return pb-pa;
 });
 return {available:true,date:asOf,source:kindOf(today),score:Math.round(today.scores.physiol),
  rhythm:Math.round(today.scores.rhythm),delta:physDelta,rhythmDelta,priorDate:prior?.date||null,
  consecutive,components,focus:prioritized.filter(x=>x.key!=='rhythm').slice(0,2),alerts:(today.integrity?.alerts||[]).filter(x=>['heart','breath'].includes(x.kind)&&x.date===asOf)};
}
function qualityStatus(rows,days,asOf,petId,excluded=[],allowOwnerlessGallery=false){
 const valid=days.find(x=>x.date===asOf);
 if(valid){const kind=kindOf(valid);return {level:kind==='verified'?'verified':'sample',date:asOf,
  coverage:kind==='verified'?valid.quality.timeCoverage:null,observedSeconds:kind==='verified'?valid.quality.observedSeconds:null,
  basis:kind==='verified'&&valid.quality.samplingMode==='scheduled'?'scheduled':'day',
  dayFraction:kind==='verified'?valid.quality.observedDayFraction:null,
  reason:kind==='verified'?'eligible_real':'showroom_example'};}
 if(excluded.some(x=>x.date===asOf&&x.reason==='conflicting_same_day'))return {level:'conflict',date:asOf,coverage:null,reason:'conflicting_day'};
 const today=(Array.isArray(rows)?rows:[]).filter(r=>r?.date===asOf);
 if(!today.length)return {level:'missing',date:asOf,coverage:null,reason:'no_reading'};
 const scoped=today.filter(r=>ownerValid(r,petId,allowOwnerlessGallery&&kindOf(r)==='sample'));
 if(!scoped.length)return {level:'conflict',date:asOf,coverage:null,reason:'identity_conflict'};
 const qc=(scoped.find(r=>r.source==='20hz-waveform')||scoped[0]).quality||{};
 const reason=qc.wearValid===false?'wear':qc.motionInterference===true?'motion':qc.signalValid===false?'signal':qc.timeContinuityValid===false?'continuity':
  finite(qc.timeCoverage)&&qc.timeCoverage<.5?'coverage':'unverified';
 return {level:'insufficient',date:asOf,coverage:null,reason};
}
function personalizedAlerts(days,asOf){
 const today=days.find(x=>x.date===asOf);if(!today)return {ready:false,alerts:[],validBaselineDays:0};
 // Fourteen PRECEDING, independent dates. Require two recent low readings to
 // avoid spurious one-day alerts; never turn a missing day into 0 points.
 // Bound calendar age: 14 readings from last year cannot define today's norm
 // even if the two most recent days happened this week.
 const minDate=new Date(dateMs(asOf)-45*86400000).toISOString().slice(0,10);
 const history=days.filter(x=>x.date<asOf&&x.date>=minDate).slice(-30),baseline=history.slice(0,-3),recent=history.slice(-2).concat(today);
 const enough=baseline.length>=14;if(!enough)return {ready:false,alerts:[],validBaselineDays:baseline.length};
 const alerts=[];
 if(recent.some(x=>dateMs(asOf)-dateMs(x.date)>7*86400000))return {ready:true,alerts:[],validBaselineDays:baseline.length};
 for(const key of metricKeys){const ref=median(baseline.map(x=>x.scores?.[key]));const current=today.scores?.[key];
  if(!validScore(ref)||!validScore(current)||current>ref-10)continue;
  const low=recent.filter(x=>validScore(x.scores?.[key])&&x.scores[key]<=ref-10).length;
  if(low>=2)alerts.push({key,baseline:Math.round(ref),latest:Math.round(current),drop:Math.round(ref-current),daysLow:low});
 }
 return {ready:true,alerts:alerts.sort((a,b)=>b.drop-a.drop),validBaselineDays:baseline.length};
}
const safeText=x=>String(x??'').trim().slice(0,150);
function eventTimeline({petId,asOf,fromDays=30,medications=[],vaccinations=[],reports=[],meals=[],activity=[],recovery=[],notes=[]}={}){
 if(!strictDate(asOf))return [];
 const start=dateMs(asOf)-(Math.max(1,Math.min(90,Number(fromDays)||30))-1)*86400000;
 const spec=[['med',medications],['vaccine',vaccinations],['exam',reports],['food',meals],['activity',activity],['recovery',recovery],['note',notes]];
 const out=[],seen=new Set();
 for(const [type,rows] of spec)for(const r of Array.isArray(rows)?rows:[]){
  const date=r?.doneDate&&type==='vaccine'&&r.status==='done'?r.doneDate:r?.date;
  if(!strictDate(date)||date>asOf||dateMs(date)<start||!ownerValid(r,petId,true)||r.deleted===true)continue;
  // Timeline records actual completed care; future/pending schedules belong
  // exclusively to the reminder system, not historical events.
  if(type==='vaccine'&&r.status!=='done')continue;
  if(type==='med'&&r.status!=='taken')continue;
  const title=safeText(r.name||r.clinic||r.cat||r.kind||r.reasonNote||r.text||({food:'饮食记录',activity:'活动记录',recovery:'恢复观察'}[type]));
  const id=String(r.id||r.reportId||`${date}:${r.time||''}:${title}`);
  // Morning and evening doses share a prescription ID but are two real
  // administrations. Deduplicate by slot/time as well as schedule identity.
  const slot=type==='med'?`|${safeText(r.time||'')}|${r.slot===undefined?'':safeText(r.slot)}`:'';
  const unique=`${type}|${date}|${id}${slot}`;
  if(seen.has(unique))continue;seen.add(unique);
  out.push({type,date,time:safeText(r.time||''),title:title||type,
   sample:r.sample===true||r.source==='sample',status:r.status||'recorded',id});
 }
 return out.sort((a,b)=>b.date.localeCompare(a.date)||b.time.localeCompare(a.time)||a.type.localeCompare(b.type)).slice(0,90);
}
function insight({petId,rows=[],asOf,allowOwnerlessGallery=false}={}){
 if(!strictDate(asOf))return {daily:{available:false},quality:{level:'missing'},personal:{ready:false,alerts:[]},days:[],excluded:[]};
 const {days,excluded}=admitted(rows,petId,asOf,allowOwnerlessGallery);
 return {daily:scoreChange(days,asOf),quality:qualityStatus(rows,days,asOf,petId,excluded,allowOwnerlessGallery),personal:personalizedAlerts(days,asOf),days,excluded};
}
return {version:'9.94',strictDate,ownerValid,realQuality,kindOf,admitted,scoreChange,qualityStatus,personalizedAlerts,eventTimeline,insight};
});
