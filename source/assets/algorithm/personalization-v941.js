/* DeepPet V9.41 — deterministic, profile-first wellness planning.
 * Nutritional estimates are starting points, not prescriptions. No sensor,
 * medication, vaccination, lab, or location records are fabricated here.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetPersonalization941=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const validScore=x=>finite(x)&&x>=0&&x<=100;
const sum=a=>a.reduce((s,v)=>s+v,0);
const mean=a=>a.length?sum(a)/a.length:null;
// The personalized-advice layer must enforce the same complete owner claims
// as the ingestion and score-integrity layers; no silent fourth-field alias.
const ownerClaims=x=>[x?.petId,x?.ownerPetId,x?.profile?.petId,x?.profile?.id].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='').map(String);
const ownerConflict=x=>new Set(ownerClaims(x)).size>1;
const ownerKey=x=>{const ids=ownerClaims(x),fallback=x?.profile?.id;
 return ownerConflict(x)?null:ids[0]??(fallback===null||fallback===undefined||String(fallback).trim()===''?null:String(fallback));};
// Same-day scores must not change when imported data arrives in a different
// order. Prefer qualified physical recordings over showcase fixtures, then
// the longer verified observation. If equally qualified records disagree,
// exclude the disputed calendar day instead of silently choosing a score.
function canonicalDays(records){
 const grouped=new Map();for(const r of records){if(!grouped.has(r.date))grouped.set(r.date,[]);grouped.get(r.date).push(r);}
 const priority=r=>[r.source==='20hz-waveform'?2:1,r.source==='20hz-waveform'&&finite(r.quality?.observedSeconds)?r.quality.observedSeconds:0,
  r.source==='20hz-waveform'&&finite(r.quality?.timeCoverage)?r.quality.timeCoverage:0];
 const order=(a,b)=>{const x=priority(a),y=priority(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return 0;};
 const alike=(a,b)=>[...new Set([...Object.keys(a.scores||{}),...Object.keys(b.scores||{})])].every(k=>Object.is(a.scores?.[k],b.scores?.[k]));
 const days=[];for(const group of grouped.values()){
  const top=group.reduce((best,r)=>order(r,best)>0?r:best,group[0]);
  if(group.filter(r=>order(r,top)===0).every(r=>alike(r,top)))days.push(top);
 }
 return days.sort((a,b)=>a.date.localeCompare(b.date));
}
const realDate=d=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(d||''))return false;
 const ms=Date.parse(d+'T12:00:00Z');return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===d;};
function profileComplete(p,requirePhoto=true){
 if(!p||!String(p.name||'').trim()||!['dog','cat'].includes(p.species))return false;
 const breed=typeof p.breed==='string'?p.breed:p.breed?.en||p.breed?.zh||'';
 if(!breed||/^(not set|n\/a|未設定|未设定|unknown yet)$/i.test(String(breed).trim()))return false;
 if(p.age===null||p.age===undefined||p.age===''||!finite(Number(p.age))||Number(p.age)<0||Number(p.age)>35)return false;
 if(p.weight===null||p.weight===undefined||p.weight===''||!finite(Number(p.weight))||Number(p.weight)<=0||Number(p.weight)>150)return false;
 if(requirePhoto&&(!p.photo||/^(n\/a|placeholder)$/i.test(String(p.photo))))return false;
 // Bundled New Pet pictures and generated emoji avatars are *examples*, not
 // proof that a real owner supplied the required photograph.
 if(requirePhoto&&(p.dpFreshDemo||p.dpFreshPet||p.freeCare)&&p.dpPhotoConfirmed!==true)return false;
 if(requirePhoto&&/^data:image\/svg\+xml/i.test(String(p.photo)))return false;
 return true;
}
// A photograph is mandatory for pairing identity, but not for a transparent
// profile-only food estimate or preventive-care suggestion. These are guidance
// from explicitly entered age/breed/weight, never sensor observations.
const profileBasicsComplete=p=>profileComplete(p,false);
const L={
 ready:['依品種、年齡與體重提供的預防建議','Personalized by breed, age and weight','품종·나이·체중 기반 권장','品種・年齢・体重に基づく提案'],
 blank:['請先完成寵物的照片、姓名、品種、年齡與體重，才會建立專屬建議。','Complete photo, name, breed, age and weight to see recommendations.','사진·이름·품종·나이·체중을 입력하세요.','写真・名前・品種・年齢・体重を先に登録してください。'],
 waiting:['等待有效佩戴資料；累計至少14個有效穿戴日後，將依實際心肺、休息與活動變化補充個別建議。','Awaiting valid wear data. After 14 valid days, monitoring trends can add personalized advice.','유효 착용 14일 후 생체 추세 분석이 추가됩니다.','有効装着14日後に生体傾向から追加の助言を表示します。'],
 profile:['定期健康檢查與品種照護','Routine care for this breed and life stage','품종별 정기 관리','品種と年齢に合った定期ケア'],
 weight:['體重與體態管理','Weight and body condition','체중과 체형 관리','体重と体型の管理'],
 motion:['依年齡安排日常活動','Age-appropriate daily activity','나이에 맞는 활동','年齢に合った活動'],
 dental:['口腔、寄生蟲及例行照護','Dental and preventive care','구강·예방 관리','歯科・予防ケア'],
 teen:['成長期營養與追蹤','Growth and nutrition','성장기 영양','成長期の栄養'],
 mature:['熟齡健康檢查規劃','Senior wellness checkups','노령 건강 검진','シニア健康診断'],
 cardio:['最近心肺分數較個體基準下降','Cardio trend below personal baseline','심폐 추세 저하','心肺傾向が個体基準より低下'],
 sleep:['近期睡眠休息趨勢下降','Sleep-rest trend below baseline','수면·휴식 추세 저하','休息傾向が基準より低下'],
 energy:['最近精力與恢復分數下降','Energy/recovery trend below baseline','활동·회복 추세 저하','活動・回復傾向が低下'],
 report:['近期體檢報告有待追蹤項目','Exam report contains findings to follow up','검진 결과 추적 필요','検査結果に要確認項目'],
};
const text=(key,lang='zht')=>{const i=lang==='en'?1:lang==='ko'?2:lang==='ja'?3:0;const v=L[key]?.[i]||key;return lang==='zh'&&typeof globalThis.toSimplified==='function'?globalThis.toSimplified(v):v;};
const localized=(lang,zht,en,ko,ja)=>{const v=lang==='en'?en:lang==='ko'?ko:lang==='ja'?ja:zht;return lang==='zh'&&typeof globalThis.toSimplified==='function'?globalThis.toSimplified(v):v;};
function sizeClass(p){const en=String(p?.breed?.en||p?.breed||'').toLowerCase();if(p?.species==='cat')return 'cat';
 if(/great dane|mastiff|saint bernard|newfoundland|irish wolfhound/.test(en))return 'giant';
 if(/golden retriever|labrador|rottweiler|german shepherd|alaskan malamute|doberman|boxer/.test(en))return 'large';
 if(/chihuahua|pomeranian|toy poodle|miniature poodle|bichon|maltese|shih tzu|pug/.test(en))return 'small';
 if(/shiba inu|corgi|beagle|border collie/.test(en))return 'medium';
 return Number(p?.weight)>=40?'giant':Number(p?.weight)>=25?'large':Number(p?.weight)<10?'small':'medium';}
function energyFactor(p){if(!profileBasicsComplete(p))return null;const age=Number(p.age),size=sizeClass(p);
 // These are transparent starting assumptions, not breed-specific validated
 // prescriptions. Actual MER varies with sterilization, BCS and activity.
 if(p.species==='cat')return age<1?2.5:age>=11?1.1:1.25;
 if(age<4/12)return 3.0;
 if(age<1)return 2.0;
 if(age>=10||(age>=7&&(size==='large'||size==='giant')))return 1.2;
 return 1.5;}
function diet(p){if(!profileBasicsComplete(p))return {available:false,reason:'missing_profile',rer:null,factor:null,targetKcal:null,unit:'kcal/day'};
 const mass=Number(p.weight),factor=energyFactor(p),rer=70*Math.pow(mass,.75),targetKcal=Math.round(rer*factor/10)*10;
 return {available:true,bodyWeightKg:mass,lifeStageYears:Number(p.age),breed:String(p.breed?.en||p.breed),size:sizeClass(p),rer:Math.round(rer*100)/100,factor,targetKcal,unit:'kcal/day',basis:'RER = 70 × kg^0.75; provisional species/life-stage MER factor',factorUnit:'1 (dimensionless)',vetCalibrate:true,needsBcsReview:p.bcs===null||p.bcs===undefined||!finite(Number(p.bcs)),needsNeuterStatus:!['yes','no'].includes(String(p.neutered||''))};}
function validDays(records,asOf=null,expectedPetId=null){const admitted=[];for(const r of Array.isArray(records)?records:[]){if(!r||!realDate(r.date))continue;if(asOf&&r.date>asOf)continue;
  if(!validScore(r.scores?.physiol)||!validScore(r.scores?.rhythm))continue;
  // Imported score-only rows have no proven wear history. Accept only explicit
  // 20Hz/QC-backed recordings or clearly tagged bundled investor fixtures.
  // Use the SAME explicit showroom source contract as the 30-day wellness
  // model. V9.73 changed the tag, so this layer was silently dropping all
  // 15 exhibition pets from its 14-day trend/personalization pathway.
  const verified=r.source==='20hz-waveform',demo=['synthetic-demo-fixture','synthetic-extreme-showcase-v973'].includes(r.dataProvenance)&&
   ['sdk-demo-fixture','minute-demo-no-interbeat'].includes(r.source);
  if(!verified&&!demo)continue;
  const q=r.quality||{};
  if(q.heartValid===false||q.respValid===false||q.timeContinuityValid===false||q.wearValid===false||q.signalValid===false)continue;
  if(verified&&!(q.heartValid===true&&q.respValid===true&&q.wearValid===true&&q.signalValid===true&&q.timeContinuityValid===true&&Number(q.timeCoverage)>=.5&&finite(q.observedSeconds)&&q.observedSeconds>=900&&q.observedSeconds<=86400&&finite(q.observedDayFraction)&&Math.abs(q.observedDayFraction-q.observedSeconds/86400)<1e-5&&(q.samplingMode!=='scheduled'||finite(q.scheduledSeconds)&&q.scheduledSeconds>=1800&&q.scheduledSeconds<=86400)&&Math.abs(q.timeCoverage-Math.min(1,q.observedSeconds/(q.samplingMode==='scheduled'?q.scheduledSeconds:86400)))<1e-5))continue;
  admitted.push(r);
 }const days=canonicalDays(admitted);
 const identity=ownerKey;
 // Audit before calendar deduplication: two pets with a record on the same
 // date must not silently overwrite each other into one apparently clean day.
 const ids=new Set(admitted.map(identity).filter(Boolean));
 // A selected pet needs positive ownership evidence. An entirely untagged
 // imported history cannot become Milo's 14-day baseline merely because the
 // caller is currently viewing Milo. Legacy single-pet, ownerless calls remain
 // supported when the caller itself does not identify a particular pet.
 const target=expectedPetId===null||expectedPetId===undefined?null:String(expectedPetId).trim();
 return admitted.some(ownerConflict)||ids.size>1||ids.size===1&&admitted.some(x=>identity(x)===null)||
  (target&&(!ids.has(target)||ids.size!==1))?[]:days;}
function observations(records=[],asOf=null,expectedPetId=null){const all=validDays(records,asOf,expectedPetId),latest=all.at(-1)?.date||null;
 // A 14-observation trend is a RECENT change model. Do not compare this
 // week's three days against eleven historical days from months/years ago.
 // Valid wear days are still cumulative for the separate personal baseline.
 const anchor=latest?Date.parse(latest+'T12:00:00Z'):null;
 const days=anchor===null?[]:all.filter(x=>{const t=Date.parse(x.date+'T12:00:00Z');return t<=anchor&&t>anchor-45*86400000;});
 const n=days.length;
 const stale=!!(asOf&&latest&&(Date.parse(asOf+'T12:00:00Z')-Date.parse(latest+'T12:00:00Z'))>7*86400000);
 if(n<14||stale)return {ready:false,validDayCount:n,latest,stale,changes:[],jointTrend:null};
 const prior=days.slice(-14,-3),recent=days.slice(-3),changes=[];
 for(const [key,name] of [['cardio','cardio'],['sleep','sleep'],['activityRecovery','energy']]){
  // Valid composite scores do not guarantee that every subscore is valid.
  // Reject negative/>100 imported component values rather than publishing
  // a fabricated large decline or improvement as personalized guidance.
  const a=prior.map(x=>x.scores?.[key]).filter(validScore),b=recent.map(x=>x.scores?.[key]).filter(validScore);
  if(a.length<7||b.length<2)continue;
  const baseline=mean(a),current=mean(b),delta=Math.round((current-baseline)*10)/10;
  // An 8-point relative decline is a review cue; not a diagnostic cutoff.
  if(delta<=-8)changes.push({key:name,baseline:Math.round(baseline*10)/10,current:Math.round(current*10)/10,delta,unit:'score points',direction:'decline',priorValidCount:a.length,recentValidCount:b.length});
 }
 // Two independent sensor domains declining together is more informative
 // than a single composite number. Require two of the latest three accepted
 // days to corroborate both declines. This is a wellness follow-up cue, not a
 // classifier for cardiac/respiratory disease.
 const coupled=key=>{const older=prior.map(x=>x.scores?.[key]).filter(validScore),newer=recent.map(x=>x.scores?.[key]).filter(validScore);
  return older.length>=9&&newer.length===3?{baseline:mean(older),recent:mean(newer)}:null;};
 const heart=coupled('heart'),breath=coupled('breath');
 let jointTrend=null;
 if(heart&&breath&&heart.recent-heart.baseline<=-8&&breath.recent-breath.baseline<=-8){
  const persistent=recent.filter(x=>validScore(x.scores?.heart)&&validScore(x.scores?.breath)&&
   x.scores.heart<=heart.baseline-6&&x.scores.breath<=breath.baseline-6).length;
  if(persistent>=2)jointTrend={kind:'cardiorespiratory',persistentDays:persistent,
   heartDelta:Math.round((heart.recent-heart.baseline)*10)/10,
   breathDelta:Math.round((breath.recent-breath.baseline)*10)/10,unit:'score points'};
 }
 return {ready:true,validDayCount:n,latest,stale:false,changes,jointTrend};}
// "Recent examination" must be recent relative to the requested day, and
// must belong to this pet. Historical examinations remain available in Health.
const RECENT_EXAM_DAYS=180;
function recentExamEvidence(report,pet,asOf){
 const day=realDate(asOf)?asOf:new Date().toISOString().slice(0,10);
 if(!report||report.present===false||ownerConflict(report)||ownerConflict(pet)||
  !validScore(report.score)||!finite(Number(report.count))||Number(report.count)<=0||
  !realDate(report.latest)||report.latest>day)return false;
 const owner=ownerKey(report),target=ownerKey(pet);
 // Untagged reports cannot be attached to a *named* pet. Conversely, a
 // tagged report must not be interpreted for an anonymous profile.
 if((owner||target)&&owner!==target)return false;
 const age=(Date.parse(day+'T12:00:00Z')-Date.parse(report.latest+'T12:00:00Z'))/86400000;
 return age>=0&&age<=RECENT_EXAM_DAYS;
}
function prevention(p,records=[],report=null,lang='zht',asOf=null){if(!profileBasicsComplete(p))return {available:false,items:[],monitoring:observations([],asOf),message:text('blank',lang)};
 const years=Number(p.age),mass=Number(p.weight),size=sizeClass(p),cat=p.species==='cat';const items=[];
 const add=(key,body,action)=>items.push({code:key,name:text(key,lang),body,action,source:'profile',profileOnly:true});
 const younger=years<1,senior=cat?years>=11:years>=(size==='large'||size==='giant'?7:size==='small'?10:9);
 const breed=p.breed?.zh||p.breed?.en||String(p.breed||'');
 add('profile',localized(lang,`依${breed}、${years.toFixed(1)}歲安排例行健康檢查，確認適合的品種注意事項。`,`For a ${years.toFixed(1)}-year-old ${p.breed?.en||'pet'}, discuss routine veterinary checks and breed-specific concerns.`,`${breed} ${years.toFixed(1)}세의 생활 단계에 맞는 정기 검진과 품종 특성을 수의사와 확인하세요.`,`${breed}、${years.toFixed(1)}歳のライフステージに合わせて定期健診と品種特性を確認しましょう。`),localized(lang,'必要的品種相關檢查，應由獸醫依實際症狀與家族史決定。','Veterinarian determines any breed-specific tests.','필요한 품종별 검사는 증상과 가족력을 고려하여 수의사가 판단합니다.','品種別の検査は、症状や家族歴を踏まえて獣医師が判断します。'));
 add('weight',localized(lang,`目前體重${mass.toFixed(1)}公斤。體重數字不能單獨判定過重；需搭配體態分數（BCS）與體重變化。`,`Recorded weight is ${mass.toFixed(1)} kg. Judge body fat using body condition, not kilograms alone.`,`현재 체중 ${mass.toFixed(1)}kg입니다. 몸무게만으로 비만을 판단하지 말고 체형 점수(BCS)와 변화를 확인하세요.`,`現在の体重は${mass.toFixed(1)}kgです。体重だけで肥満を判断せず、体型スコア（BCS）と推移を確認してください。`),localized(lang,'可與獸醫確認理想體態及每月秤重方式。','Check body condition score with a veterinarian.','수의사와 적정 체형 및 정기적인 체중 측정 방법을 상담하세요.','理想的な体型と定期的な体重測定について獣医師に相談しましょう。'));
 add('motion',localized(lang,`依${younger?'成長':senior?'熟齡':'成年'}階段及${size==='large'||size==='giant'?'大型':'一般'}體型安排活動；留意天氣與疲勞。`,`Match activity to ${younger?'growth stage':senior?'senior stage':'adult stage'}, size, weather and comfort.`,`연령 단계와 체격에 맞춰 활동량을 조정하고 날씨와 피로를 살펴보세요.`,`成長段階・体格に合わせて活動量を調整し、暑さや疲労に注意しましょう。`),localized(lang,'循序調整，出現明顯不適應停止活動。','Increase gradually and stop for distress.','활동량을 서서히 늘리고 불편한 증상이 나타나면 중단하세요.','徐々に調整し、つらそうな様子があれば運動を中止してください。'));
 add('dental',localized(lang,'口腔、疫苗與驅蟲需要依所在地及獸醫建議安排；系統不假設已接種或已用藥。','Review dental health, vaccinations and parasite prevention with the veterinary team; no record is presumed completed.','구강 건강, 예방접종, 구충은 지역 지침과 수의사 권고에 따라 관리하세요. 기록이 없으면 완료로 간주하지 않습니다.','口腔・ワクチン・寄生虫予防は地域と獣医師の助言に従ってください。記録のない処置は実施済みとみなしません。'),localized(lang,'依實際紀錄與醫師確認日期，缺資料時維持未紀錄。','Confirm schedules from actual records.','실제 기록과 수의사 권고를 바탕으로 일정을 확인하세요.','実際の記録と獣医師の指示で予定を確認してください。'));
 if(younger)add('teen',localized(lang,'成長階段宜追蹤體重、營養及活動耐受；不可套用熟齡疾病規則。','Growing pets need growth-stage nutrition and repeated weight checks.','성장기에는 체중, 영양, 활동 내성을 추적하세요. 노령기 기준을 적용하면 안 됩니다.','成長期は体重・栄養・活動耐性を確認し、シニア基準を当てはめないでください。'),localized(lang,'與獸醫核對成長期飲食。','Discuss a growth feeding plan with a vet.','성장기 식단을 수의사와 상의하세요.','成長期の食事計画を獣医師と相談しましょう。'));
 if(senior)add('mature',localized(lang,'熟齡寵物應與獸醫討論較密集的健康檢查、口腔、活動能力及適用的檢驗。','For older pets, discuss checkup frequency, mobility, dental health and any needed tests.','노령기에는 검진 주기, 치아, 운동 능력 및 필요한 검사에 대해 수의사와 상담하세요.','シニア期は健診頻度、歯科、運動能力と必要な検査を獣医師と相談しましょう。'),localized(lang,'僅憑年齡不能判定疾病。','No diagnosis can be inferred from age alone.','나이만으로 질병을 진단할 수 없습니다.','年齢だけでは病気を診断できません。'));
 const monitoring=observations(records,asOf,ownerKey(p));
 if(monitoring.ready)for(const c of monitoring.changes){items.push({code:'trend-'+c.key,name:text(c.key,lang),body:localized(lang,`最近${c.recentValidCount}個有效日平均${c.current}分，之前${c.priorValidCount}個有效日平均${c.baseline}分，變化${c.delta}分。`,`Recent ${c.recentValidCount}-day mean ${c.current}/100 versus prior ${c.priorValidCount}-day mean ${c.baseline}/100 (${c.delta} points).`,`최근 ${c.recentValidCount}개 유효일 평균 ${c.current}점, 이전 ${c.priorValidCount}개 유효일 평균 ${c.baseline}점, 변화 ${c.delta}점입니다.`,`最近${c.recentValidCount}有効日の平均${c.current}点、以前の${c.priorValidCount}有効日${c.baseline}点、差は${c.delta}点です。`),action:localized(lang,'先排除佩戴鬆動、活動與環境干擾；若持續偏離，向獸醫討論。','Check contact, activity and context; discuss persistent change with your vet.','착용 상태와 환경을 확인하고 변화가 지속되면 수의사와 상담하세요.','装着状態や活動・環境を確認し、変化が続く場合は獣医師に相談しましょう。'),source:'monitoring',profileOnly:false,delta:c.delta,unit:c.unit,priorValidCount:c.priorValidCount,recentValidCount:c.recentValidCount});}
 if(monitoring.jointTrend){const j=monitoring.jointTrend;
  items.push({code:'joint-cardiorespiratory',name:localized(lang,'心跳與呼吸同步變化','Combined heart and breathing trend','심박·호흡 동반 변화','心拍と呼吸の同時変化'),
   body:localized(lang,`最近3個有效日的心跳與呼吸評分分別下降${Math.abs(j.heartDelta)}及${Math.abs(j.breathDelta)}分，且至少2日同步偏離。`,`Heart and breathing scores declined by ${Math.abs(j.heartDelta)} and ${Math.abs(j.breathDelta)} points over the latest three valid days, with a concurrent decline on at least two days.`,`최근 3회 유효일에서 심박·호흡 점수가 각각 ${Math.abs(j.heartDelta)}, ${Math.abs(j.breathDelta)}점 하락했고 2일 이상 동반되었습니다.`,`直近3有効日の心拍・呼吸スコアがそれぞれ${Math.abs(j.heartDelta)}点、${Math.abs(j.breathDelta)}点低下し、2日以上で同時に変化しました。`),
   action:localized(lang,'先確認項圈貼合、活動及休息情境；如持續或伴隨明顯不適，請諮詢獸醫。','Check collar fit and comparable resting/activity conditions; if persistent or accompanied by symptoms, consult a veterinarian.','목걸이 착용 상태와 휴식·활동 조건을 확인하고 지속되거나 증상이 있으면 수의사와 상담하세요.','装着状態と同じ休息・活動条件を確認し、変化が続くか症状があれば獣医師に相談してください。'),
   source:'monitoring',profileOnly:false,kind:'joint',heartDelta:j.heartDelta,breathDelta:j.breathDelta});}
 if(recentExamEvidence(report,p,asOf)&&report.score<80)items.push({code:'exam-followup',name:text('report',lang),body:localized(lang,`已確認體檢分數${report.score}/100；應逐項查看檢驗原值、單位及適用參考區間。`,`Examination score ${report.score}/100 from an entered record; interpret individual flagged tests.`,`입력한 검진 점수 ${report.score}/100입니다. 항목별 측정값과 단위, 참고범위를 확인하세요.`,`入力済み健診のスコアは${report.score}/100です。項目ごとの数値・単位・基準範囲を確認してください。`),action:localized(lang,'按體檢日期與獸醫意見追蹤，不以項圈診斷。','Consult the report and veterinarian.','검진일과 수의사 의견에 따라 추적하고 목걸이만으로 진단하지 마세요.','健診日と獣医師の助言に沿って経過を追い、首輪だけで診断しないでください。'),source:'exam',profileOnly:false});
 return {available:true,items,monitoring,profile:{ageYears:years,weightKg:mass,breed:p.breed?.en||p.breed,species:p.species},message:monitoring.ready?text('ready',lang):text('waiting',lang)};
}
return {version:'10.03',profileComplete,profileBasicsComplete,sizeClass,energyFactor,diet,validDays,observations,prevention,recentExamEvidence,text,RECENT_EXAM_DAYS};
});
