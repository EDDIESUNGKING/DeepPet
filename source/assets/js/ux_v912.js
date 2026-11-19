/* DeepPet V9.12: candidate signal-first scoring adapter.
   Source-only model. Isolated from UI and suitable for eventual server migration.
   THIS BROWSER IMPLEMENTATION IS NOT A VALIDATED DIAGNOSTIC ALGORITHM.
*/
(function(){
'use strict';
if(!window.DeepPetBCG){console.error('DeepPetBCG engine not loaded');return;}
const A=window.DeepPetBCG;
const L973=(zh,en,ja)=>state.lang==='ja'?ja:state.lang==='en'?en:state.lang==='zh'?toSimplified(zh):zh;
// One-time migration of the legacy auto-seeded empty Coco recovery episode.
if(state.dpV812CocoShowcaseSeeded && state.carePlans?.['2']?.reasonNote==='活動後恢復觀察' && !(state.carePlans['2'].checkins||[]).length){delete state.carePlans['2'];persist();}
const perPet=new Map();
const verifiedCache=new Map();
function currentDogForIndex(index){return {...(allPets()[index]||{}),...(state.petOverrides?.[index]||{})};}
function trueWear(x){const gate=typeof window==='object'?window.DeepPetScoreIntegrity?.realEvidenceValid:null;
 if(typeof gate==='function')return gate(x)===true;
 const q=x?.quality,d=/^\d{4}-\d{2}-\d{2}$/.test(x?.date||'')?new Date(x.date+'T12:00:00Z'):null;return x?.source==='20hz-waveform'&&[undefined,null,'','continuous','scheduled'].includes(q?.samplingMode)&&q?.motionInterference!==true&&q?.heartValid===true&&q?.respValid===true&&q?.timeContinuityValid===true&&q?.wearValid===true&&q?.signalValid===true&&Number(q?.timeCoverage)>=.5&&Number.isFinite(q?.observedSeconds)&&q.observedSeconds>=900&&q.observedSeconds<=86400&&Number.isFinite(q?.observedDayFraction)&&Math.abs(q.observedDayFraction-q.observedSeconds/86400)<1e-5&&(q.samplingMode!=='scheduled'||Number.isFinite(q.scheduledSeconds)&&q.scheduledSeconds>=1800&&q.scheduledSeconds<=86400&&q.observedSeconds<=q.scheduledSeconds)&&Math.abs(q.timeCoverage-Math.min(1,q.observedSeconds/(q.samplingMode==='scheduled'?q.scheduledSeconds:86400)))<1e-5&&d!==null&&Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===x.date;}
function measuredBundle(index){
 const saved=state.dpVerifiedDaysByPet?.[String(index)];
 const animal=currentDogForIndex(index),reports=typeof window.dp914ReportRecords==='function'?window.dp914ReportRecords(index):[];
 const groupReferenceByKey=window.DeepPetVerifiedReferenceForPet?.(animal)||{};
 const today=typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):new Date().toLocaleDateString('sv-SE');
 // A 30-day report formerly recomputed every verified history day on EACH
 // card/row read. Use a content-keyed cache: a new SDK day, lab report, pet
 // profile or reference invalidates the result even if storage was edited.
 const stablePetId=typeof dpPetId==='function'?dpPetId(index):String(index);
 const signature=JSON.stringify({today,petIndex:index,stablePetId,saved:Array.isArray(saved)?saved:[],reports,groupReferenceByKey,
  profile:{species:animal.species,age:animal.age,weight:animal.weight,breed:animal.breed,name:animal.name}});
 const previous=verifiedCache.get(index);
 if(previous?.signature===signature)return previous.result;
 // Historical storage can contain previously admitted, now future-dated
 // records (wrong clock/time-zone or an older migration). No future measurement
 // may change today's scores, the 14-day baseline or the 7/30-day trends.
 const byDate=new Map(),disputed=new Set();
 const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v??null;
 const fingerprint=r=>JSON.stringify({measurements:['heartRate','breathRate','quietHeartRate','quietBreathRate','heartSpread','breathSpread',
  'quietRhythm','rmssd','sdnn','nnvgr','restHours','restFraction','motionMean','motionVariation',
  'motionRegularity','recoveryDrop','nightBreathRate','scores'].map(k=>stable(r[k])),
  events:['recoveryEvents','verifiedEvents'].map(k=>(Array.isArray(r[k])?r[k]:[]).map(stable).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))),
  evidence:['restQuality','fullDayRestSupported','fullDayActivitySupported','hrvValid','hrvProvenance','nightObservedSeconds','dayObservedSeconds'].map(k=>stable(r.quality?.[k]))});
 const rank=r=>[r.quality?.observedSeconds??0,r.quality?.timeCoverage??0];
 const compare=(a,b)=>{const x=rank(a),y=rank(b);return x[0]-y[0]||x[1]-y[1];};
 for(const row of Array.isArray(saved)?saved:[]){
  if(!trueWear(row)||row.date>today)continue;
  // New SDK records carry a stable identity in addition to their historic
  // numeric bucket. A later pet occupying this bucket cannot inherit them.
  const stableClaims=[row.petUid,row.ownerPetUid,row.profile?.petUid].filter(v=>v!==undefined&&v!==null&&String(v).trim()!=='').map(String);
  if(new Set(stableClaims).size>1||(stableClaims.length&&stableClaims[0]!==stablePetId))continue;
  // Device changes are allowed over a pet's lifetime; only the pet identity,
  // not the currently paired hardware ID, owns historical measurements.
  // The storage bucket is owner-specific. Bind legacy untagged summaries to
  // this owner in memory; never accept explicitly different owner identities.
  // V9.93: this bucket's numeric pet index is the canonical device owner.
  // Previous code accepted *either* index or arbitrary animal.id / petId;
  // mixed claims (15 + 0) could then be relabelled to 15 and pass downstream.
  // A future UUID-backed SDK must normalize IDs at ingestion, never here.
  const ownerClaims=[row.petId,row.ownerPetId,row.profile?.petId,row.profile?.id]
   .filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='').map(String);
  if(ownerClaims.some(v=>v!==String(index)))continue;
  const candidate={...row,petId:String(index),profile:{...(row.profile||{}),petId:String(index)}};
  const prev=byDate.get(row.date);
  if(!prev){byDate.set(row.date,candidate);continue;}
  const precedence=compare(candidate,prev);
  if(precedence>0){byDate.set(row.date,candidate);disputed.delete(row.date);}
  else if(precedence===0&&fingerprint(candidate)!==fingerprint(prev))disputed.add(row.date);
 }
 // An old storage migration can contain same-day, equal-quality conflicting
 // recordings. Exclude disputed days rather than take whichever record arrived
 // last; the originals remain in storage for a later user-visible resolution.
 const days=[...byDate.values()].filter(x=>!disputed.has(x.date)).sort((a,b)=>a.date.localeCompare(b.date));
 const results=days.map((d,i)=>{
  const base=A.scoreDay(days,i,{groupReferenceByKey});
  if(!base)return null;
  const withReport=window.DeepPetReportFusion?.fuse(base,reports,d.date,{...currentDogForIndex(index),petId:String(index)})||base;
  return window.DeepPetScoreIntegrity?.reconcile(withReport,Array.isArray(d.verifiedEvents)?d.verifiedEvents:[])||withReport;
 });
 const result={days,scores:results,wearValid:days.map(()=>true),excludedAmbiguousDays:[...disputed].sort(),source:'verified-20hz-daily-summary'};
 verifiedCache.set(index,{signature,result});
 return result;
}
function bundle(petIndex=state.dog){
 if(!Number.isInteger(petIndex)||petIndex<0||petIndex>=allPets().length)return {days:[],scores:[]};
 // Fresh, unpaired profiles do not inherit the six weeks of simulated demo records.
 // A real SDK ingestion pipeline must explicitly provide verified data before scoring.
 const animal=currentDogForIndex(petIndex);
 if(petIndex>=dogs.length||animal.dpFixtureInvalidated||animal.dpFreshPet===true||animal.freeCare===true){
  return petIndex>=dogs.length?measuredBundle(petIndex):{days:[],scores:[]};
 }
 const rows=demoRecords(petIndex);
 const bridge=window.DeepPetSignalBridge;
 const revision=(typeof bridge?.getRevision==='function'?bridge.getRevision(petIndex):bridge?.revisionByPet?.[petIndex]??bridge?.revision??0);
 const profileRevision=JSON.stringify(state.petOverrides?.[petIndex]||{});
 const reportRevision=JSON.stringify({entries:state.userReportEntries?.[petIndex]||[],overrides:state.reportOverridesByDog?.[petIndex]||{},hidden:state.reportHiddenDatesByDog?.[petIndex]||[],examHidden:state.dp921HiddenReports?.[petIndex]||[],examReplaced:state.dp921ReplacedReports?.[petIndex]||[]});
 const wearValid=rows.map((row,i)=>typeof qualityForDay!=='function'||qualityForDay(i,petIndex).valid);
 const key=petIndex+'|'+String(revision)+'|'+profileRevision+'|'+reportRevision+'|'+wearValid.map(x=>x?'1':'0').join('')+'|'+rows.map(x=>x.date).join(',');
 if(perPet.has(key))return perPet.get(key);
 // dpSignals reads the globally selected pet. Pin the intended pet while creating
 // its isolated feature cache; otherwise cross-pet queries silently reuse Milo data.
 const previousPet=state.dog;
 let days;
 try{
  state.dog=petIndex;
  days=rows.map((row,i)=>{
   // The 30 calendar dates are NOT thirty measured days. Exclude the fixture's
   // unworn/failed-quality dates from scoring, trends, and individual baseline.
   if(!wearValid[i])return null;
   const streams=dpSignals(row.date,['heart','breath','activity']);
   const previousStreams=i>0&&wearValid[i-1]?dpSignals(rows[i-1].date,['activity']):null;
   const nightMotion=previousStreams?previousStreams.activity.slice(1200,1440).concat(streams.activity.slice(0,720)):null;
   const feature=A.fromMinuteDemo({heart:streams.heart,breath:streams.breath,motion:streams.activity,nightMotion,idx:i,date:row.date,profile:{species:currentDog().species,ageYears:currentDog().age,weightKg:currentDog().weight,breed:breedText(currentDog())}});
   // Development data fixture representing HRV supplied by a collar SDK.
   // This is NOT inferred from 1/minute heart rates. Production requires actual SDK RMSSD/SDNN and signal-quality gates.
   const demoHrv=window.DeepPetDemoHrv921?.get(petIndex,row.date,i,feature);
   if(demoHrv&&feature.quality?.windowCoverage>=.5){feature.rmssd=demoHrv.rmssd;feature.sdnn=demoHrv.sdnn;feature.quality.hrvValid=true;feature.quality.hrvProvenance='sdk-demo-fixture';feature.source='sdk-demo-fixture';}
   return feature;
  });
 }finally{state.dog=previousPet;}
 const reference=typeof animalGroupReference==='function'?animalGroupReference(animal,rows):null;
 const groupReferenceByKey=reference?{quietHeartRate:reference.hr,heartRate:reference.hr,quietBreathRate:reference.breath,breathRate:reference.breath,restHours:reference.sleep,rmssd:reference.rm,sdnn:reference.sd}:{};
 const baseScores=days.map((feature,i)=>{
  let original=A.scoreDay(days,i,{groupReferenceByKey});if(!original)return null;
  // Synthetic profiles are clearly identified as fixtures; the scoring engine
  // is never overruled with preselected healthy minimums.
  original={...original,dataProvenance:'synthetic-demo-fixture'};
  const cohort=window.DeepPetCohort920;
  // Real cohort registry must come from separately validated population references.
  // No peer database is fabricated from the 15 built-in demonstration pets.
  const comparison=cohort?.merge(original.scores,feature,feature.profile,window.DeepPetVerifiedCohorts||[]);
  if(!comparison?.available)return {...original,peerComparison:comparison||{available:false}};
  const scores={...comparison.scores},W=window.DeepPetScoreIntegrity?.weights;
  if(W){const weighted=window.DeepPetScoreIntegrity.weighted;
   // Four independent scored sources contribute to cardio. Optional missing
   // features are normalized out by the shared weighted-score engine.
   scores.cardio=window.DeepPetScoreIntegrity.riskGuard(
    weighted(scores,W.cardio,['heart','breath']),
    [scores.heart,scores.breath,scores.hrv,scores.stable]);
   if(scores.cardio!==null&&(scores.hrv===null||scores.stable===null))scores.cardio=Math.min(scores.cardio,89);
   scores.physiol=weighted(scores,W.physiol,['cardio','sleep','activityRecovery']);}
  return {...original,scores,peerComparison:comparison};
 });
 const fusion=window.DeepPetReportFusion;
 const records=typeof window.dp914ReportRecords==='function'?window.dp914ReportRecords(petIndex):[];
 const integrity=window.DeepPetScoreIntegrity;
 // The fifteen showroom profiles are deliberately different synthetic cases.
 // Their original showcase score triples are CASE PARAMETERS, never owner
 // measurements or a population/medical reference. Preserve all raw trends
 // and let the shared integrity engine apply its alert caps afterward.
 const showcaseRhythm=[96,88,44,24,91,98,74,37,15,91,38,97,68,88,51];
 const showcasePortraitTarget=[95,84,38,22,80,98,77,35,17,87,38,97,61,84,53];
 const showroomCase=(base,index,day,feature)=>{
  if(!base?.scores||index>=dogs.length)return base;
  const W=integrity?.weights,weighted=integrity?.weighted,riskGuard=integrity?.riskGuard;
  if(!W||!weighted||!riskGuard)return base;
  const raw=dogs[index]?.score;
  if(!Array.isArray(raw)||raw.length<3)return base;
  const clamp=x=>Math.max(7,Math.min(99,Math.round(x)));
  const pulse=Math.round(2.5*Math.sin(day*.47+index*.63));
  const drift=Math.round(2.5*Math.cos(day*.38+index*.42));
  // Prevent a blue/amber showroom portrait from getting a contradictory red
  // top-line score solely because one older proxy dimension crossed a tier.
  const desired=showcasePortraitTarget[index],tierFloor=desired>=90?90:desired>=80?80:desired>=60?60:0;
  const keepBand=v=>clamp(Math.max(v,tierFloor?Math.min(99,tierFloor+2):7));
  const cardio=keepBand(raw[0]+pulse),sleep=keepBand(raw[1]+drift);
  // V10.48: the gallery's BLUE/GREEN portrait tier must never force each
  // different component into that same tier. Poppy's lower-energy case was
  // being clamped to 82 daily, making recovery (activity + 2) a false 84/100
  // straight line across both 7- and 30-day views. Preserve each dated
  // scenario's own change; the composite retains its own weighted meaning.
  const activity=clamp(raw[2]+pulse-drift);
  const rhythm=clamp(showcaseRhythm[index]+Math.round(2*Math.sin(day*.53+index)));
  // A gallery CASE may have an intentionally extreme target score; however a
  // day with no paired valid HRV observations must not receive a made-up
  // complete HRV component merely because its portrait is labelled healthy.
  const hrvEligible=feature===undefined?Number.isFinite(base.scores.hrv):feature?.quality?.hrvValid===true&&Number.isFinite(feature.rmssd)&&feature.rmssd>0&&Number.isFinite(feature.sdnn)&&feature.sdnn>0;
  // Display-case calibration only: scale both accepted NN-variability numbers
  // against the species-specific fixture midpoint. Monotone in BOTH values;
  // never simply set HRV score equal to the preselected heart/respiratory case.
  // These 29/44 and 35/52-ms anchors are internal illustration parameters,
  // NOT veterinary norms, and are NEVER used for owner sensor scoring.
  const cat=dogs[index]?.species==='cat',rmMid=cat?29:35,sdMid=cat?44:52;
  const hrvCase=feature===undefined?clamp(cardio+((index+2)%5)-2):hrvEligible?
   clamp(90+60*Math.log(.60*feature.rmssd/rmMid+.40*feature.sdnn/sdMid)):null;
  const s={...base.scores,
   heart:clamp(cardio+(index%3)-1),breath:clamp(cardio+((index+1)%3)-1),
   hrv:hrvEligible?hrvCase:null,stable:clamp(rhythm-((index+2)%3)),
   calm:clamp(rhythm+(index%3)-1),
   energy:clamp(activity+((index+2)%5)-2),recovery:clamp(activity+(index%5)-2),
   sleep};
  s.cardio=riskGuard(weighted(s,W.cardio,['heart','breath']),
   [s.heart,s.breath,s.hrv,s.stable]);
  if(s.cardio!==null&&(s.hrv===null||s.stable===null))s.cardio=Math.min(s.cardio,89);
  s.activityRecovery=riskGuard(weighted(s,W.activityRecovery,['energy','recovery','calm']),[s.energy,s.recovery,s.calm]);
  s.rhythm=riskGuard(weighted(s,W.rhythm,['calm','stable']),[s.calm,s.stable]);
  s.physiol=riskGuard(weighted(s,W.physiol,['cardio','sleep','activityRecovery']),[s.cardio,s.sleep,s.activityRecovery]);
  return {...base,petId:String(index),scores:s,dataProvenance:'synthetic-extreme-showcase-v973'};
 };
 const scores=baseScores.map((result,i)=>{
  if(!result)return null;
  const merged=fusion?fusion.fuse(result,records,days[i].date,{...currentDogForIndex(petIndex),petId:String(petIndex)}):result;
  let eventList=[];
  if(typeof window.dp911EventFor==='function'){
   const previous=state.dog;
   try{state.dog=petIndex;eventList=['heart','breath'].map(kind=>window.dp911EventFor(days[i].date,kind)).filter(Boolean);}
   finally{state.dog=previous;}
  }
  const demonstration=showroomCase(merged,petIndex,i,days[i]);
  return integrity?integrity.reconcile(demonstration,eventList):demonstration;
 });
 const result={days,scores,wearValid,source:'synthetic-demo-fixture'};perPet.set(key,result);if(perPet.size>16)perPet.clear();
 return result;
}
function forRow(row){if(!row)return null;return bundle().scores.find(x=>x?.date===row.date)||null;}
function ingestVerifiedDay(index,day,deviceId){
 if(!Number.isInteger(index)||index<dogs.length||index>=allPets().length)return {accepted:false,reason:'only_user_pet'};
 const linked=state.devicesByPet?.[String(index)],pet=currentDogForIndex(index);
 if(!window.DeepPetPersonalization941?.profileComplete(pet,true))return {accepted:false,reason:'incomplete_profile'};
 if(!linked?.connected||!linked.connectedId||linked.connectedId!==deviceId||
  window.DeepPetLiveRadioSession?.matches(index,deviceId)!==true)return {accepted:false,reason:'no_live_paired_session'};
 const stablePetId=typeof dpPetId==='function'?dpPetId(index):String(index);
 if(!stablePetId)return {accepted:false,reason:'pet_identity_missing'};
 const stableClaims=[day.petUid,day.ownerPetUid,day.profile?.petUid].filter(v=>v!==undefined&&v!==null&&String(v).trim()!=='').map(String);
 if(stableClaims.some(v=>v!==stablePetId))return {accepted:false,reason:'pet_stable_identity_mismatch'};
 if(!trueWear(day))return {accepted:false,reason:'insufficient_verified_signal'};
 // Device records are dated in the pet's selected local day. UTC can still
 // be yesterday just after midnight in Asia-Pacific time zones.
 const localToday=typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):new Date().toISOString().slice(0,10);
 if(day.date>localToday)return {accepted:false,reason:'future_recording_date'};
 const admissibleIds=new Set([String(index),pet.id,pet.petId].filter(x=>x!==null&&x!==undefined).map(String));
 const incomingClaims=[day.petId,day.ownerPetId,day.profile?.petId,day.profile?.id].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='');
 if(incomingClaims.some(v=>!admissibleIds.has(String(v))))
  return {accepted:false,reason:'pet_identity_mismatch'};
 // Bind the verified session to the current pet. Preserve only events from
 // that identity; the signal-verification gate runs again at reconciliation.
 const verifiedEvents=Array.isArray(day.verifiedEvents)?day.verifiedEvents.filter(e=>{
  const claims=[e?.petId,e?.ownerPetId,e?.profile?.petId,e?.profile?.id].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='');
  const stable=[e?.petUid,e?.ownerPetUid,e?.profile?.petUid].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='');
  return e&&claims.every(v=>admissibleIds.has(String(v)))&&stable.every(v=>String(v)===stablePetId);
 }).map(e=>({...e,petId:String(index),petUid:stablePetId,ownerPetUid:stablePetId})):[];
 const accepted={...day,petId:String(index),ownerPetId:String(index),petUid:stablePetId,ownerPetUid:stablePetId,deviceId,
  verifiedEvents,quality:{...day.quality},
  profile:{petId:String(index),petUid:stablePetId,species:pet.species,ageYears:pet.age,weightKg:pet.weight,breed:pet.breed?.en||pet.breed}};
 // Do not persist a 20 Hz raw waveform in Web localStorage. Persist quality
 // controlled daily summaries only; historical days survive a 30-day gap.
 state.dpVerifiedDaysByPet??={};const saved=state.dpVerifiedDaysByPet[String(index)];
 const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v??null;
 const fingerprint=r=>JSON.stringify({measurements:['heartRate','breathRate','quietHeartRate','quietBreathRate','heartSpread','breathSpread',
  'quietRhythm','rmssd','sdnn','nnvgr','restHours','restFraction','motionMean','motionVariation',
  'motionRegularity','recoveryDrop','nightBreathRate','scores'].map(k=>stable(r[k])),
  events:['recoveryEvents','verifiedEvents'].map(k=>(Array.isArray(r[k])?r[k]:[]).map(stable).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))),
  evidence:['restQuality','fullDayRestSupported','fullDayActivitySupported','hrvValid','hrvProvenance','nightObservedSeconds','dayObservedSeconds'].map(k=>stable(r.quality?.[k]))});
 const compare=(a,b)=>Number(a.quality.observedSeconds)-Number(b.quality.observedSeconds)||Number(a.quality.timeCoverage)-Number(b.quality.timeCoverage);
 const map=new Map();
 const disputed=new Set();
 for(const x of Array.isArray(saved)?saved:[])if(trueWear(x)&&
  [x.petUid,x.ownerPetUid,x.profile?.petUid].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='').every(v=>String(v)===stablePetId)&&
  [x.petId,x.ownerPetId,x.profile?.petId,x.profile?.id].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='')
   .every(v=>String(v)===String(index))){
  const old=map.get(x.date);
  if(!old){map.set(x.date,x);continue;}
  const precedence=compare(x,old);
  if(precedence>0){map.set(x.date,x);disputed.delete(x.date);}
  else if(precedence===0&&fingerprint(x)!==fingerprint(old))disputed.add(x.date);
 }
 const existing=map.get(day.date);
 if(existing){
  const precedence=compare(accepted,existing);
  if(disputed.has(day.date)&&precedence<=0)return {accepted:false,reason:'ambiguous_existing_day'};
  if(precedence<0)return {accepted:false,reason:Number(accepted.quality.observedSeconds)<Number(existing.quality.observedSeconds)?'existing_longer_verified_day':'existing_higher_coverage_day'};
  if(precedence===0){
   if(fingerprint(existing)===fingerprint(accepted))return {accepted:true,unchanged:true,validDays:map.size};
   return {accepted:false,reason:'conflicting_equal_quality_day'};
  }
 }
 map.set(day.date,accepted);
 const previousRows=Array.isArray(saved)?saved.slice():null;
 const ownerExtra=state.petExtras?.[index-dogs.length];
 const previousFresh=ownerExtra?{fresh:ownerExtra.dpFreshPet,freeCare:ownerExtra.freeCare}:null;
 const ownerOverride=state.petOverrides?.[String(index)];
 const previousOverride=ownerOverride?{fresh:ownerOverride.dpFreshPet,freeCare:ownerOverride.freeCare}:null;
 state.dpVerifiedDaysByPet[String(index)]=[...map.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-365);
 if(ownerExtra){ownerExtra.dpFreshPet=false;ownerExtra.freeCare=false;}
 if(ownerOverride){ownerOverride.dpFreshPet=false;ownerOverride.freeCare=false;}
 perPet.clear();verifiedCache.delete(index);
 let persisted=false;try{persisted=!!persist();}catch(_error){persisted=false;}
 if(!persisted){
  if(previousRows===null)delete state.dpVerifiedDaysByPet[String(index)];
  else state.dpVerifiedDaysByPet[String(index)]=previousRows;
  if(ownerExtra){ownerExtra.dpFreshPet=previousFresh.fresh;ownerExtra.freeCare=previousFresh.freeCare;}
  if(ownerOverride){ownerOverride.dpFreshPet=previousOverride.fresh;ownerOverride.freeCare=previousOverride.freeCare;}
  perPet.clear();verifiedCache.delete(index);
  return {accepted:false,reason:'storage_failed'};
 }
 // Successful device ingestion changes the selected owner from N/A to the
 // measured presentation immediately. A refresh or pet re-selection is not
 // required, and updating another pet never steals the active identity.
 if(index===state.dog&&!state.emptyPreview&&typeof render==='function'){
  try{render(true);}catch(error){console.error('Verified reading saved; refresh view failed',error);}
 }
 return {accepted:true,validDays:state.dpVerifiedDaysByPet[String(index)].length};
}
window.DeepPetSignalScoring={version:'9.64-research-20hz',getDaily:(petIndex=state.dog)=>bundle(petIndex).scores,getFeatures:(petIndex=state.dog)=>bundle(petIndex).days,isVerifiedWear:trueWear,ingestVerifiedDay,scoreFromRaw:A.fromRaw,engine:A,invalidate:(petIndex=null)=>{for(const k of perPet.keys())if(petIndex===null||k.startsWith(String(petIndex)+'|'))perPet.delete(k);if(petIndex===null)verifiedCache.clear();else verifiedCache.delete(petIndex);window.dp911ClearEventCache?.(petIndex);}};
const originalDay=dpOwnerDayScores;
dpOwnerDayScores=function(row,withRecovery=false){
 const real=state.dog>=dogs.length||currentDog().dpFreshPet||currentDog().dpFixtureInvalidated||currentDog().freeCare;
 const v=forRow(row)?.scores;
 // The legacy originalDay() uses a fictional daily fixture, including an
 // activity score. Do not invoke it at all for a real or edited animal.
 if(real){
  const measured=k=>Number.isFinite(v?.[k])?v[k]:null;
  return {heart:measured('cardio'),sleep:measured('sleep'),energy:measured('energy'),
   activity:null,recovery:measured('recovery'),calm:measured('calm'),
   stable:measured('stable'),hrv:measured('hrv'),energyActivity:measured('activityRecovery'),
   energyRecovery:measured('activityRecovery'),physiol:measured('physiol'),
   rhythm:measured('rhythm'),engine:v?'verified-20hz':'unmeasured-N/A'};
 }
 const prev=originalDay(row,true);
 if(!v){
  const ix=Number.isInteger(row?.idx)?row.idx:demoRecords(state.dog).findIndex(r=>r.date===row?.date);
  if(ix>=0&&typeof qualityForDay==='function'&&!qualityForDay(ix,state.dog).valid)
   return {...prev,heart:null,sleep:null,energy:null,recovery:null,calm:null,stable:null,hrv:null,energyActivity:null,energyRecovery:null,physiol:null,rhythm:null,engine:'unworn-N/A'};
  return prev;
 }
 return {...prev,heart:v.cardio,sleep:v.sleep,energy:v.energy,recovery:v.recovery,calm:v.calm,stable:v.stable,hrv:v.hrv,energyActivity:v.activityRecovery,energyRecovery:v.activityRecovery,physiol:v.physiol,rhythm:v.rhythm,engine:'research-v2'};
};
const oldVital=dpOwnerVitalScore;
dpOwnerVitalScore=function(row,kind){const s=forRow(row)?.scores;
 if(s)return kind==='heart'?s.heart:kind==='breath'?s.breath:oldVital(row,kind);
 if(state.dog>=dogs.length||currentDog().dpFreshPet||currentDog().dpFixtureInvalidated)return null;
 const idx=Number.isInteger(row?.idx)?row.idx:demoRecords(state.dog).findIndex(r=>r.date===row?.date);
 if(idx>=0&&typeof qualityForDay==='function'&&!qualityForDay(idx,state.dog).valid)return null;
 return oldVital(row,kind);
};
dpHeartComposite=function(row){return forRow(row)?.scores?.cardio??null;};
dpOwnerPeriodHeartScore=function(rows){const scored=rows.map(row=>forRow(row)?.scores.cardio).filter(Number.isFinite);return scored.length?Math.round(scored.reduce((a,b)=>a+b,0)/scored.length):null;};
const oldRhythm=rhythmData;
rhythmData=function(){
 const data=oldRhythm(),list=bundle().scores;
 const dayScores=new Map(list.filter(x=>x?.date).map(x=>[x.date,x.scores]));
 const isOwner=state.dog>=dogs.length;
 for(let i=0;i<data.values.length;i++){
  const date=data.rows?.[i]?.date,s=dayScores.get(date);
  // Sparse real SDK days are NOT positional indexes into a 30-day UI calendar.
  // Unmeasured/unworn dates must not retain synthetic rhythm results.
  data.values[i].__dpDate=date;
  data.values[i].calm=Number.isFinite(s?.calm)?s.calm:null;
  data.values[i].stable=Number.isFinite(s?.stable)?s.stable:null;
  data.values[i].recover=Number.isFinite(s?.recovery)?s.recovery:null;
  if(isOwner)data.values[i].load=null;
 }
 data.today=data.values.find(v=>v.__dpDate===iso(localDate()))||null;
 return data;
};
rhythmCompositeScore=function(m=rhythmData().today){
 if(!m)return null;
 // The exact dated engine score already contains verified-event caps.
 if(m.__dpDate)return bundle().scores.find(x=>x?.date===m.__dpDate)?.scores?.rhythm??null;
 const calm=Number.isFinite(m?.calm)?m.calm:null,stable=Number.isFinite(m?.stable)?m.stable:null;
 const base=Number.isFinite(calm)&&Number.isFinite(stable)?A.weighted({calm,stable},{calm:.58,stable:.42},['calm','stable']):null;
 return window.DeepPetScoreIntegrity?.riskGuard(base,[calm,stable])??null;
};
dpTodayUnifiedScores=function(){
 const last=bundle().scores.find(x=>x?.date===iso(localDate()))?.scores;if(!last)return {heart:null,sleep:null,energyActivity:null};
 return {heart:last.cardio,sleep:last.sleep,energy:last.energy,recovery:last.recovery,calm:last.calm,stable:last.stable,hrv:last.hrv,energyActivity:last.activityRecovery,physiol:last.physiol,rhythm:last.rhythm};
};
score=function(d=currentDog()){
 // Resolve only a real collection object or currentDog()'s private identity
 // marker. A name, even an apparently unique one, is editable display text,
 // never proof that a detached object owns this pet's health measurements.
 const galleryIndex=dogs.indexOf(d);
 if(galleryIndex>=0)return bundle(galleryIndex).scores.find(x=>x?.date===iso(localDate()))?.scores?.physiol??null;
 const objectIndex=allPets().indexOf(d);
 if(objectIndex>=0)return bundle(objectIndex).scores.find(x=>x?.date===iso(localDate()))?.scores?.physiol??null;
 const selectedIndex=d&&typeof DP_SELECTED_PET_MARK!=='undefined'?d[DP_SELECTED_PET_MARK]:null;
 if(Number.isInteger(selectedIndex)&&selectedIndex===state.dog)
  return bundle(selectedIndex).scores.find(x=>x?.date===iso(localDate()))?.scores?.physiol??null;
 return null;
};
const oldBio=currentBioAge;
currentBioAge=function(){const estimate=window.DeepPetAudit925?.model?.(state.dog);return Number.isFinite(estimate?.ageYears)?estimate.ageYears:null;};
// The age chart must use the same candidate engine, not legacy row.bio snapshots.
ageTrendCard=function(compact=false){
 const all=bundle(),pet=currentDog(),pts=all.scores.map((s,i)=>({date:s?.date,age:A.biologicalAge(pet.age,all.days.slice(0,i+1),all.scores.slice(0,i+1))?.estimateYears??null})).filter(x=>x.age!==null);
 if(pts.length<3)return `<p class="dp912-age-wait">${L973('可用有效評分日不足，暫不顯示年齡指數趨勢。','Not enough valid scoring days for an age-index trend.','有効な測定日が不足しているため年齢指数の傾向を表示できません。')}</p>`;
 const w=340,h=compact?135:182,l=35,r=8,t=15,b=33,min=Math.floor((Math.min(...pts.map(x=>x.age))-.08)*10)/10,max=Math.ceil((Math.max(...pts.map(x=>x.age))+.08)*10)/10,den=Math.max(.1,max-min);
 const x=i=>l+(w-l-r)*i/(pts.length-1),y=v=>t+(max-v)/den*(h-t-b);
 const d=pts.map((p,i)=>`${i?'L':'M'}${x(i).toFixed(1)} ${y(p.age).toFixed(1)}`).join(' ');
 return `<div class="age-trend-panel"><b>${L973('候選健康年齡指數趨勢','Estimated wellness-age index trend','推定健康年齢指数の推移')}</b><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Estimated age trend"><path d="${d}" fill="none" stroke="#7866e5" stroke-width="2.6" stroke-linejoin="round"/>${pts.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p.age)}" r="3" fill="#7866e5"><title>${p.date} · ${p.age.toFixed(1)}</title></circle>`).join('')}<text x="${l}" y="${h-5}" font-size="10" fill="#64748b">${pts[0].date}</text><text x="${w-r}" y="${h-5}" font-size="10" fill="#64748b" text-anchor="end">${pts.at(-1).date}</text><text x="${l-4}" y="${t}" font-size="10" fill="#64748b" text-anchor="end">${max.toFixed(1)}</text><text x="${l-4}" y="${h-b}" font-size="10" fill="#64748b" text-anchor="end">${min.toFixed(1)}</text></svg></div>`;
};
dpBioAgeReasons=function(){
 const all=bundle(),p=A.biologicalAge(currentDog().age,all.days,all.scores),s=all.scores.at(-1)?.scores||{};
 return `<div class="dp912-age-factors"><b>${L973('加權健康趨勢依據','Weighted wellness factors','健康傾向の評価要素')}</b><p>${L973('參考心肺、睡眠休息、精力恢復、身體節奏與長期趨勢。','Uses cardio, sleep/rest, energy/recovery, body rhythm and longer-term trends.','心肺・睡眠と休息・回復・身体リズム・長期傾向を参照します。')}</p><p>${L973('當前指數：','Index: ','現在の指数：')}${p?.index??'—'}/100 · ${L973('估算差值','age offset','推定年齢差')} ${p?.deltaYears??'—'} ${L973('歲','years','歳')}。</p></div>`;
};
// Present the new computed index prominently, never claim medical biological age validation.
const oldAgeFull=dpAgeFullPage;
dpAgeFullPage=function(){
 let html=oldAgeFull();const val=A.biologicalAge(currentDog().age,bundle().days,bundle().scores);
 const tip=L973(`候選生理年齡指數 ${val?.index??'—'}/100；尚未經真實犬貓資料驗證，不可當成臨床生理年齡。`,
 `Candidate index ${val?.index??'—'}/100; not a clinically validated biological age.`,
 `推定健康年齢指数 ${val?.index??'—'}/100。犬猫の実測データで検証されていないため、診断には使えません。`);
 return html.replace('</header>',`</header><p class="dp912-model-label">${tip}</p>`);
};
// Keep one objective source for the 14-day health baseline and weekly/monthly score family.
const priorBaseline=dpBaselineAverageStats;
dpBaselineAverageStats=function(){
 // Fourteen VALID observation days, not the final fourteen array entries:
 // sparse/worn-off dates must not push earlier accepted dates out of baseline.
 // For real readings, average only recent eligible days. Showroom rows stay
 // intact and are evaluated under their existing 30-day demonstration window.
 const owner=state.dog>=dogs.length||currentDog().dpFixtureInvalidated;
 const earliest=owner?iso(dateAdd(localDate(),-45)):null;
 const scores=bundle().scores.filter(x=>x&&(!owner||x.date>=earliest&&x.date<=iso(localDate()))&&Number.isFinite(x.scores?.physiol)&&Number.isFinite(x.scores?.rhythm))
  .slice(-14).map(x=>x.scores);
 if(!scores.length)return {days:0,phys:null,rhythm:null,combined:null};
 const mean=k=>scores.reduce((a,s)=>a+s[k],0)/scores.length;
 return {days:scores.length,phys:mean('physiol'),rhythm:mean('rhythm'),combined:A.weighted({physiol:mean('physiol'),rhythm:mean('rhythm')},{physiol:.7,rhythm:.3},['physiol','rhythm'])};
};
// An observation episode is NEVER auto-created. The existing care-plan-start flow remains the only start action.
const originalCare=dpCareTimeline;
dpCareTimeline=function(){
 const plan=carePlanForPet();
 if(!plan?.started)return `<section class="card dp912-care-start"><h3>${L973('恢復觀察尚未開始','Recovery observation has not started','回復の経過観察は未開始です')}</h3><p>${L973('請先選擇恢復觀察原因，主動按「開始恢復觀察」；開始前不會建立14天記錄。','Choose a reason and press Start recovery observation to create the first day.','理由を選び「回復の観察を開始」を押してください。開始前に14日間の記録は作成されません。')}</p></section>`;
 return originalCare();
};
})();

/* Keep the scoring engine as the single displayed numeric source in key summary cards. */
(function(){
'use strict';
const data=()=>window.DeepPetSignalScoring?.getDaily(state.dog)||[];
const F=v=>v===null||v===undefined||!Number.isFinite(Number(v))?null:Math.round(Number(v));
const avg=xs=>{const a=xs.filter(v=>v!==null&&Number.isFinite(v));return a.length?Math.round(a.reduce((s,v)=>s+v,0)/a.length):null;};
function sFor(key){
 const all=data();const range=Number(state.range||1),end=range===1?deepChosenDate():iso(localDate());
 const subset=range===1?[all.find(x=>x?.date===end)||null]:window.DeepPetBCG.calendarWindow(all,range,end);
 return avg(subset.map(x=>x?.scores?.[key]??null));
}
function meterHTML(value){
 return value===null?'<div class="dp903-no-score">—</div>':dpDeepDottedScore(value,scoreScheme(value).color);
}
function replaceScore(node,value){
 if(!node)return;
 const status=value===null?(state.lang==='en'?'Insufficient data':'資料不足'):scoreLabel(value),ring=meterHTML(value);
 const container=node.closest('.dp903-score-col,.dp901-score-col,.dp903-overview,.dp-owner-status-heading')||node;
 const oldRing=node.querySelector('.dp-status-score,.dp-dotted-meter,.dp-uniform-dotted,.dp903-no-score,.dp90-unavailable')||node;
 if(oldRing===node)node.innerHTML=ring+`<span class="dp903-grade">${status}</span>`;
 else{oldRing.outerHTML=ring;const t=node.querySelector('.dp903-grade,.dp901-score-tag,.dp75-risk,.dp69-grade');if(t)t.textContent=status;}
 if(value!==null)node.setAttribute('data-score',String(value));
 else node.removeAttribute('data-score');
}
function syncDeep(){
 const root=document.querySelector('#app .dp-owner-deep');if(!root)return;
 const category=Number(state.deepType),major=category===0?'cardio':category===1?'sleep':'activityRecovery';
 for(const card of root.querySelectorAll('.dp903-overview')){
   const main=card.querySelector('.dp903-overview-head .dp903-score-col');if(main)replaceScore(main,sFor(major));
   card.querySelectorAll('[data-dp903-metric]').forEach(node=>{
     const k=node.dataset.dp903Metric,metric=k==='heart'?'heart':k==='breath'?'breath':k==='hrv'?'hrv':'stable';
     const score=node.querySelector('.dp903-score-col');if(score)replaceScore(score,sFor(metric));
   });
 }
 for(const card of root.querySelectorAll('.dp901-health-score')){
   const top=card.querySelector(':scope > .dp901-overall-head .dp901-score-col');if(top)replaceScore(top,sFor(major));
   card.querySelectorAll('.dp901-metric-card').forEach((node,i)=>{const key=['energy','recovery','calm'][i];const meter=node.querySelector('.dp901-score-col');if(meter)replaceScore(meter,sFor(key));});
 }
 const topScore=root.querySelector('.dp-owner-sleep .dp75-overview-aside, .dp-owner-sleep .dp69-score-aside, .dp-sleep-period-score-head .dp69-score-aside');
 if(topScore)replaceScore(topScore,sFor('sleep'));
 if(category===1){
  const sleepPeriodRing=root.querySelector('.dp905-sleep-head > .dp-status-score');
  if(sleepPeriodRing){const n=sFor('sleep');sleepPeriodRing.outerHTML=meterHTML(n);}
 }
 if(category===2){
  // The multi-day energy view has a different card wrapper than the daily view.
  const periodMain=root.querySelector('.dp903-score-col.main:not(.dp903-overview .dp903-score-col)');
  if(periodMain)replaceScore(periodMain,sFor('activityRecovery'));
  const energyCards=root.querySelectorAll('.dp905-energy-period .dp903-score-col.sub, .dp901-period-notes ~ .dp903-metric-list .dp903-score-col.sub');
  if(energyCards.length===3){['energy','recovery','calm'].forEach((k,i)=>replaceScore(energyCards[i],sFor(k)));}
 }
}
function syncHome(){
 const root=document.querySelector('#app');if(!root)return;
 // The newest recorded day can be yesterday: never reuse it as today's score.
 const today=data().find(x=>x?.date===iso(localDate()))?.scores||null;
 for(const [selector,k] of [['.dp-health-lane','physiol'],['.dp-rhythm-lane','rhythm']]){
  const button=root.querySelector(selector);if(!button)continue;const value=F(today?.[k]);
  const meter=button.querySelector('.dp-lane-meter');if(meter)meter.innerHTML=dpDotScore(value,k==='rhythm'?'rhythm':'health');
  button.style.setProperty('--score-color',value===null?'#aab0bc':scoreScheme(value).color);
 }
}
const oldRender=render;
render=function(reset=false){oldRender(reset);if(state.tab==='home')syncHome();if(state.tab==='deep')syncDeep();};
setTimeout(()=>{try{render(false);}catch(e){console.error('V9.12 initial sync',e);}},0);
})();
