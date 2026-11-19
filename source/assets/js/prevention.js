/* DeepPet V8.67. Evidence-informed preventive guidance; local, offline, demo safe. */
function dp67L(zh,zht,en,ko){const l=state.lang;return l==='zh'?zh:l==='zht'?zht:l==='ko'?ko:en;}
const DP67_EVIDENCE=[
 {name:'AAHA canine life-stage prevention',url:'https://www.aaha.org/resources/life-stage-canine-2019/life-stage-canine-2019-2/'},
 {name:'Cornell brachycephalic airway guidance',url:'https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-information/brachycephalic-obstructive-airway-syndrome-boas'},
 {name:'Merck veterinary cardiomyopathy',url:'https://www.merckvetmanual.com/circulatory-system/cardiomyopathy-in-dogs-and-cats/dilated-cardiomyopathy-in-dogs-and-cats'},
 {name:'Cornell feline cardiomyopathy',url:'https://www.vet.cornell.edu/pets-get-heart-disease-too'},
 {name:'AAHA/AAFP feline life stages',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10812130/'}
];
function dp67ClassifyBreed(p){
 const v=String(p.breed?.en||'').toLowerCase();const cat=p.species==='cat';
 const flat=/pug|french bulldog|english bulldog|boston terrier|shih tzu|pekingese|lhasa apso|boxer|persian/.test(v);
 const cardiomyopathy=/doberman|boxer|great dane|german shepherd|irish wolfhound|newfoundland|saint bernard|labrador retriever/.test(v);
 // Classify typical breed size FIRST; a mistaken demo weight must not turn a Golden Retriever into a toy breed.
 const typicalLarge=/golden retriever|alaskan malamute|german shepherd|rottweiler|labrador retriever|doberman|great dane|saint bernard|newfoundland|irish wolfhound|boxer/.test(v);
 const typicalSmall=/pug|chihuahua|pomeranian|bichon|toy poodle|miniature poodle|shih tzu|pekingese|cavalier king charles|maltese|french bulldog/.test(v);
 const large=!cat&&(typicalLarge||(!typicalSmall&&Number(p.weight)>=25));
 const small=!cat&&!large&&(typicalSmall||Number(p.weight)<10);
 const checkWeight=typicalLarge&&Number(p.age)>=.8&&Number(p.weight)<10;
 const senior=cat?Number(p.age)>=11:Number(p.age)>=(large?7:small?10:9);
 return {cat,flat,cardiomyopathy,small,large,senior,checkWeight};
}
function dp67PreventionData(){
 const p=currentDog(),type=dp67ClassifyBreed(p);
 // The historical version treated EVERY pet as a showroom fixture. In real
 // mode, use owner-bound, quality-checked daily features; no demoRecords().
 const real=typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements();
 if(real){
  const scorer=window.DeepPetSignalScoring;
  const date=typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):new Date().toISOString().slice(0,10);
  const ownerDays=(scorer?.getFeatures?.(state.dog)||[]).filter(r=>r?.source==='20hz-waveform'&&r.date<=date&&scorer?.isVerifiedWear?.(r)===true).sort((a,b)=>a.date.localeCompare(b.date));
  const current=ownerDays.findLast(r=>r.date===date),history=ownerDays.filter(r=>r.date<date).slice(-14);
  const enough=!!current&&history.length>=7;
  const metric=(kind,field)=>{
   const now=Number(current?.[field]);
   const prior=history.map(r=>Number(r[field])).filter(v=>Number.isFinite(v)&&v>0);
   if(!enough||!Number.isFinite(now)||now<=0||prior.length<7)return {kind,grade:-1,now:null,ref:null,delta:null};
   const sorted=prior.sort((a,b)=>a-b),half=Math.floor(sorted.length/2);
   const ref=sorted.length%2?sorted[half]:(sorted[half-1]+sorted[half])/2;
   const delta=(now-ref)/Math.max(ref,1),abs=Math.abs(delta);
   return {kind,grade:abs>=.16?3:abs>=.10?2:abs>=.06?1:0,now,ref,delta};
  };
  return {p,type,heart:metric('heart','quietHeartRate'),breath:metric('breath','quietBreathRate'),isDemo:false,enough,valid:!!current,validDays:history.length};
 }
 const isDemo=true;
 const all=demoRecords(state.dog);
 const today=all.length?{...all.at(-1),idx:all.length-1}:null;
 const older=all.slice(-15,-1).filter((r,i)=>validDaySample(r,Math.max(0,all.length-15)+i).valid);
 const usable=!!today&&validDaySample(today,today.idx).valid&&signalQuality().valid;
 const enough=older.length>=7&&usable;
 const scan=kind=>{
   const now=Number(today?.[kind]);const hist=older.map(r=>Number(r[kind])).filter(Number.isFinite);
   if(!enough||hist.length<7||!Number.isFinite(now))return {kind,grade:-1,now:Number.isFinite(now)?now:null,ref:null,delta:null};
   const ref=hist.reduce((a,b)=>a+b,0)/hist.length,delta=(now-ref)/Math.max(ref,1),abs=Math.abs(delta);
   // Presentation thresholds ONLY. Not validated diagnostic cutoffs and not emergency criteria.
   const grade=abs>=.16?3:abs>=.10?2:abs>=.06?1:0;
   return {kind,grade,now,ref,delta};
 };
 const heart=scan('heart'),breath=scan('breath');
 return {p,type,heart,breath,isDemo,enough,valid:usable,validDays:older.length};
}
function dp67Severity(x){return x.grade<0?dp67L('基準建立中','基準建立中','Building baseline','기준선 설정 중'):
 x.grade===0?dp67L('未見明顯偏離','未見明顯偏離','No notable change','뚜렷한 변화 없음'):
 x.grade===1?dp67L('輕度變化','輕度變化','Small change','작은 변화'):
 x.grade===2?dp67L('較明顯變化','較明顯變化','Noticeable change','뚜렷한 변화'):
 dp67L('優先留意','優先留意','Review promptly','빠른 확인 필요');}
function dp67VitalDescription(x){
 if(x.grade<0)return dp67L('先累積有效的安靜時資料，才能比較個體的平常狀態。','先累積有效的安靜時資料，才能比較個體的平常狀態。','Collect more valid resting readings before comparing with this pet’s usual pattern.','안정 시 유효 측정값을 모은 뒤 평소 상태와 비교해요.');
 const unit=x.kind==='heart'?'bpm':dp67L('次／分','次／分','breaths/min','회/분');
 const n=x.now==null?'—':Math.round(x.now),base=x.ref==null?'—':x.ref.toFixed(1),pc=x.delta==null?'—':(Math.abs(x.delta)*100).toFixed(1)+'%';
 const diff=x.delta>0?dp67L('高於','高於','above','높음'):dp67L('低於','低於','below','낮음');
 return dp67L(`今天 ${n} ${unit}，與近期安靜時平均 ${base} 相比${diff} ${pc}。`,`今天 ${n} ${unit}，與近期安靜時平均 ${base} 相比${diff} ${pc}。`,
  `Today: ${n} ${unit}; ${pc} ${diff} a recent resting average of ${base}.`,
  `오늘 ${n} ${unit}, 최근 안정 시 평균 ${base} 대비 ${pc} ${diff}.`);
}
function dp67VitalAdvice(x,type){
 if(x.grade<0)return dp67L('保持正常佩戴，在安靜時繼續觀察。','保持正常佩戴，在安靜時繼續觀察。','Keep tracking during quiet rest with good contact.','안정 시 착용 상태를 확인하고 계속 관찰하세요.');
 if(x.grade===0)return dp67L('延續日常追蹤；沒有偏離不代表能排除疾病。','延續日常追蹤；沒有偏離不代表能排除疾病。','Continue routine tracking. Stable trends cannot rule out disease.','정기적으로 추적하세요. 추세가 안정적이어도 질병이 배제되지는 않습니다.');
 const heart=x.kind==='heart';
 return heart?dp67L('先確認是否剛運動、緊張或天氣炎熱；若持續異常，或伴隨虛弱、倒下，請聯絡獸醫。','先確認是否剛運動、緊張或天氣炎熱；若持續異常，或伴隨虛弱、倒下，請聯絡獸醫。',
  'Check recent activity, stress and heat. If changes persist, or there is weakness or collapse, contact a vet.','활동·스트레스·더위를 확인하세요. 변화가 지속되거나 힘이 없고 쓰러지면 수의사와 상담하세요.'):
 dp67L('先排除熱喘、運動和興奮；若安靜時仍持續喘促或呼吸費力，請儘快就醫。','先排除熱喘、運動和興奮；若安靜時仍持續喘促或呼吸費力，請儘快就醫。',
  'Check heat, panting, activity and excitement. Persistent labored breathing at rest needs prompt veterinary care.','더위·운동·흥분을 확인하세요. 휴식 중 호흡 곤란이 지속되면 신속히 진료받으세요.');
}
function dp67WatchItems(p,type){
 const items=[];
 if(type.flat&&!type.cat){items.push({code:'airway',name:dp67L('短鼻呼吸守護','短鼻呼吸守護','Short-muzzle breathing','단두종 호흡 관리'),body:dp67L('短鼻品種較容易出現氣道阻力；留意安靜時呼吸聲、喘氣及高溫下的活動耐受度。','短鼻品種較容易出現氣道阻力；留意安靜時呼吸聲、喘氣及高溫下的活動耐受度。','Short-muzzled breeds can experience airway obstruction. Watch resting breathing sounds, panting and heat tolerance.','단두종은 기도 폐쇄에 취약할 수 있어요. 휴식 시 호흡 소리, 헐떡임, 더위에 대한 반응을 관찰하세요.'),action:dp67L('保持涼爽、避免過度運動；出現呼吸費力應儘快就醫。','保持涼爽、避免過度運動；出現呼吸費力應儘快就醫。','Keep cool, avoid overexertion, and seek veterinary care for breathing effort.','시원하게 유지하고 무리한 운동을 피하세요. 호흡 곤란은 진료가 필요해요.')});}
 if(type.flat&&type.cat){items.push({code:'cat-airway',name:dp67L('短鼻貓呼吸照護','短鼻貓呼吸照護','Short-muzzle cat breathing','단두종 고양이 호흡 관리'),body:dp67L('短鼻貓在高溫、緊張或活動後可能更容易呼吸費力；留意安靜時呼吸聲與恢復情況。','短鼻貓在高溫、緊張或活動後可能更容易呼吸費力；留意安靜時呼吸聲與恢復情況。','Short-muzzled cats may struggle more in heat or stress; watch resting breathing and recovery.','단두종 고양이는 더위와 스트레스에 민감할 수 있어요. 안정 시 호흡과 회복을 관찰하세요.'),action:dp67L('保持涼爽；若明顯呼吸費力，應立即尋求獸醫協助。','保持涼爽；若明顯呼吸費力，應立即尋求獸醫協助。','Keep cool and seek urgent veterinary care for labored breathing.','시원하게 유지하고 호흡이 힘들다면 즉시 진료받으세요.')});}
 if(type.cardiomyopathy){items.push({code:'cardiac',name:dp67L('心臟健康追蹤','心臟健康追蹤','Heart-health follow-up','심장 건강 추적'),body:dp67L('部分同類品種有心肌疾病相關風險；特別留意安靜時心率趨勢、耐力下降和不明原因疲倦。','部分同類品種有心肌疾病相關風險；特別留意安靜時心率趨勢、耐力下降和不明原因疲倦。','Some related breeds have increased susceptibility to heart-muscle disease. Watch resting trends, exercise tolerance and unexplained fatigue.','일부 관련 견종은 심근 질환 소인이 있어요. 안정 시 심박 변화와 활동 내성, 피로를 살펴보세요.'),action:dp67L('健康檢查時主動詢問獸醫是否需要心臟評估。','健康檢查時主動詢問獸醫是否需要心臟評估。','Ask your vet whether a heart exam is appropriate at routine checkups.','정기 검진에서 심장 검사 필요 여부를 수의사에게 문의하세요.')});}
 if(type.small&&!type.flat&&Number(p.age)>=7){items.push({code:'valve',name:dp67L('熟齡小型犬心臟聽診','熟齡小型犬心臟聽診','Maturing small-dog heart review','성숙기 소형견 심장 점검'),body:dp67L('這隻小型犬已進入較成熟階段；可在例行檢查時與獸醫討論心音、心臟瓣膜及安靜呼吸的變化。','這隻小型犬已進入較成熟階段；可在例行檢查時與獸醫討論心音、心臟瓣膜及安靜呼吸的變化。','This small dog is entering a more mature stage. Discuss heart sounds, valve health and resting breathing at routine examinations.','이 소형견은 성숙기에 접어들었습니다. 정기 검진에서 심장 소리와 안정 시 호흡을 점검하세요.'),action:dp67L('依獸醫建議安排例行聽診；項圈不能取代檢查。','依獸醫建議安排例行聽診；項圈不能取代檢查。','Follow veterinary guidance for routine checks; a collar is not a substitute.','정기 진찰을 받고 목걸이 수치로 대체하지 마세요.')});}
 if(type.cat&&/ragdoll|british shorthair|persian|maine coon|sphynx/.test(String(p.breed?.en||'').toLowerCase())){items.push({code:'breed-cat-heart',name:dp67L('品種相關心臟評估','品種相關心臟評估','Breed-related heart follow-up','품종 관련 심장 점검'),body:dp67L('這個貓咪品種在一些研究中較常被提及與心肌疾病相關；個體是否患病不能靠品種或項圈判定。','這個貓咪品種在一些研究中較常被提及與心肌疾病相關；個體是否患病不能靠品種或項圈判定。','Some studies report a greater prevalence of heart-muscle disease in this breed. Breed or collar readings cannot diagnose an individual cat.','일부 연구에서 이 품종은 심근 질환과 관련해 더 자주 언급돼요. 품종이나 목걸이 수치로 개체의 질병을 진단할 수 없어요.'),action:dp67L('例行健檢時詢問獸醫是否需要聽診或心臟超音波評估。','例行健檢時詢問獸醫是否需要聽診或心臟超音波評估。','Ask a vet whether cardiac listening or ultrasound evaluation is appropriate.','진료 시 청진이나 심장 초음파가 필요한지 문의하세요.')});}
 if(type.cat){items.push({code:'cat-heart',name:dp67L('貓咪安靜心肺觀察','貓咪安靜心肺觀察','Cat resting heart & breathing','고양이 안정 시 심폐 관찰'),body:dp67L('貓咪心臟問題可能在早期沒有明顯表現。觀察休息時呼吸、活動力與食慾變化。','貓咪心臟問題可能在早期沒有明顯表現。觀察休息時呼吸、活動力與食慾變化。','Heart problems in cats can be subtle. Watch breathing at rest, activity and appetite.','고양이의 심장 문제는 초기 증상이 미미할 수 있어요. 안정 시 호흡, 활동성, 식욕을 관찰하세요.'),action:dp67L('有持續變化時諮詢獸醫；不能用穿戴數據自行排除心臟病。','有持續變化時諮詢獸醫；不能用穿戴數據自行排除心臟病。','Consult a vet for persistent changes; wearable data cannot rule out heart disease.','변화가 지속되면 진료받으세요. 웨어러블 수치로 심장 질환을 배제할 수 없습니다.')});}
 if(type.senior){items.push({code:'senior',name:dp67L('熟齡定期評估','熟齡定期評估','Senior wellness review','노령기 건강 점검'),body:dp67L('隨年齡增長，追蹤安靜心率、呼吸及活動耐力的長期變化，比只看單次數字更有意義。','隨年齡增長，追蹤安靜心率、呼吸及活動耐力的長期變化，比只看單次數字更有意義。','Long-term changes in resting heart rate, breathing and stamina can be more useful than isolated readings.','안정 시 심박, 호흡, 활동 내성의 장기 추세가 단일 수치보다 도움이 됩니다.'),action:dp67L('熟齡寵物可向獸醫討論更頻繁的健康檢查。','熟齡寵物可向獸醫討論更頻繁的健康檢查。','Discuss more frequent wellness exams with your veterinarian.','노령 반려동물의 검진 주기를 수의사와 상의하세요.')});}
 if(type.large){items.push({code:'size',name:dp67L('體型與活動耐力','體型與活動耐力','Body size & exercise tolerance','체격과 활동 내성'),body:dp67L('大型犬較適合比較相近活動量下的心跳恢復和安靜呼吸趨勢。','大型犬較適合比較相近活動量下的心跳恢復和安靜呼吸趨勢。','For large dogs, compare resting breathing and heart-rate recovery after similar exertion.','대형견은 비슷한 활동 후 회복과 안정 시 호흡 추세를 비교해요.'),action:dp67L('若明顯較以前容易疲倦或呼吸費力，請諮詢獸醫。','若明顯較以前容易疲倦或呼吸費力，請諮詢獸醫。','Ask a vet about worsening stamina or labored breathing.','활동 내성이 떨어지거나 호흡이 힘들어지면 수의사에게 문의하세요.')});}
 if(type.checkWeight){items.push({code:'profile-check',name:dp67L('請核對體重資料','請核對體重資料','Check the weight entry','체중 정보 확인'),body:dp67L('目前填寫的體重與這個品種常見體型差異較大，建議核對寵物資料。','目前填寫的體重與這個品種常見體型差異較大，建議核對寵物資料。','This weight entry seems unusual for the listed breed and age. Please verify the profile.','이 품종과 나이에 비해 입력된 체중이 특이합니다. 정보를 확인해 주세요.'),action:dp67L('資料核對後，再以體重變化追蹤健康。','資料核對後，再以體重變化追蹤健康。','Verify the weight before drawing any weight-related conclusions.','체중 관련 판단 전에 입력 값을 확인하세요.')});}
 const age=Number(p.age),small=type.small,large=type.large,cat=type.cat;
 if(Number.isFinite(age)&&age<1){items.push({code:'young-growth',name:dp67L('幼年成長與心肺適應','幼年成长与心肺适应','Puppy/kitten development','유년기 성장 확인'),body:dp67L('目前仍在成長期；按品種與體型觀察運動後恢復、營養與體重成長，不以熟齡標準評估。','目前仍在成長期；按品種與體型觀察運動後恢復、營養與體重成長，不以熟齡標準評估。','In the growing stage; follow age-appropriate activity recovery, nutrition and growth. Senior screening is not indicated by age alone.','성장기이므로 운동 회복과 영양·체중 성장을 확인하세요.'),action:dp67L('與獸醫確認疫苗、驅蟲和成長期檢查。','與獸醫確認疫苗、驅蟲和成長期檢查。','Review vaccines, parasite prevention and growth checks with a vet.','예방접종·구충·성장 검진을 확인하세요.')});}
 else if(Number.isFinite(age)&&age<4){items.push({code:'young-adult',name:dp67L('青年期心肺與活動基準','青年期心肺与活动基准','Young-adult activity and resting patterns','청년기 심폐·활동 확인'),body:dp67L(`目前 ${age.toFixed(1)} 歲，屬於較年輕的成犬／成貓階段；優先比較安靜心跳、呼吸和活動後恢復，不應套用熟齡心臟提醒。`,`目前 ${age.toFixed(1)} 歲，屬於較年輕的成犬／成貓階段；優先比較安靜心跳、呼吸和活動後恢復，不應套用熟齡心臟提醒。`,`At ${age.toFixed(1)} years, prioritize resting heart/breathing and post-activity recovery trends, not age-related senior-heart warnings.`,`현재 ${age.toFixed(1)}세이며 안정 시 심박·호흡과 활동 후 회복을 살펴보세요.`),action:dp67L('持續規律活動與年度例行健康檢查，並觀察熱天及劇烈活動後的恢復。','持續規律活動與年度例行健康檢查，並觀察熱天及劇烈活動後的恢復。','Maintain appropriate activity and routine wellness visits; watch recovery after heat or exercise.','정기 검진과 무리하지 않는 운동을 유지하세요.')});}
 else if(!type.senior){items.push({code:'adult-maintenance',name:dp67L('成年期耐力與心肺變化','成年期耐力与心肺变化','Adult stamina and cardio trends','성견·성묘 심폐 추적'),body:dp67L('成年期優先看同樣活動量下的心跳恢復、安靜呼吸與持續變化；若下降應及時討論。','成年期優先看同樣活動量下的心跳恢復、安靜呼吸與持續變化；若下降應及時討論。','In adulthood compare recovery and quiet breathing under comparable activity; discuss persistent reductions in stamina.','비슷한 활동량에서 회복과 안정 시 호흡을 비교하세요.'),action:dp67L('例行檢查時更新品種、體重、活動史與任何症狀。','例行檢查時更新品種、體重、活動史與任何症狀。','Update your vet on breed, weight, activity pattern and symptoms.','정기 검진 때 변화 정보를 공유하세요.')});}
 items.push({code:'resting-baseline',name:dp67L('安靜呼吸與佩戴品質','安静呼吸与佩戴品质','Resting breathing and sensor contact','안정 호흡과 센서 접촉'),body:dp67L('優先記錄安靜或睡眠時的呼吸與心跳；跑動、玩耍、喘氣和鬆動都可能干擾比較。','優先記錄安靜或睡眠時的呼吸與心跳；跑動、玩耍、喘氣和鬆動都可能干擾比較。','Compare heart/breathing during quiet rest or sleep; exercise, panting and loose contact can distort readings.','수면·휴식 중 심박과 호흡을 비교하고 접촉 불량에 주의하세요.'),action:dp67L('有持續變化時先確認佩戴和活動狀態，再與獸醫討論。','有持續變化時先確認佩戴和活動狀態，再與獸醫討論。','Check collar fit and context, then discuss sustained changes with a vet.','착용 상태를 확인하고 지속적 변화는 수의사와 상담하세요.')});
 items.push({code:'weight',name:dp67L('體重與身體狀況','體重與身體狀況','Weight & body condition','체중과 체형 상태'),body:dp67L('目前體重為 '+Number(p.weight).toFixed(1)+' 公斤。單靠公斤數無法判斷過重，請同時觀察腰身與體態。','目前體重為 '+Number(p.weight).toFixed(1)+' 公斤。單靠公斤數無法判斷過重，請同時觀察腰身與體態。',
 'Current weight: '+Number(p.weight).toFixed(1)+' kg. Weight alone cannot diagnose excess body fat; check body condition too.',
 '현재 체중 '+Number(p.weight).toFixed(1)+'kg. 체중만으로 과체중을 판단하지 말고 체형도 확인하세요.'),action:dp67L('維持適當體態有助於減少心肺負擔。','維持適當體態有助於減少心肺負擔。','Maintaining a healthy body condition can help reduce strain.','건강한 체형을 유지하면 부담을 줄이는 데 도움이 됩니다.')});
 if(type.senior){
  items.push({code:'senior-rest',name:dp67L('熟齡睡眠與休息變化','熟龄睡眠与休息变化','Senior rest and sleep changes','노령기 수면·휴식 변화'),body:dp67L('隨著年齡增加，觀察夜間是否較常醒來、安靜時是否更常喘氣，以及平時活動量是否逐漸下降。','随着年龄增加，观察夜间是否较常醒来、安静时是否更常喘气，以及平时活动量是否逐渐下降。','With age, monitor new nighttime awakenings, panting at rest and gradual changes in activity.','나이가 들수록 야간 각성, 안정 시 호흡, 활동량 변화에 주의하세요.'),action:dp67L('記錄持續的睡眠、呼吸或活動改變，於健檢時討論。','记录持续的睡眠、呼吸或活动改变，于健检时讨论。','Record persistent changes and discuss them at a wellness exam.','지속되는 변화를 기록하고 검진에서 상담하세요.')});
  items.push({code:'senior-exam',name:dp67L('熟齡健康檢查規劃','熟龄健康检查规划','Senior veterinary checkup plan','노령기 정기 검진'),body:dp67L('依物種、品種、體型和過往體檢結果，與獸醫討論較密集的健康檢查及是否需要血液、腎功能和心臟評估。','依物种、品种、体型和过往体检结果，与兽医讨论较密集的健康检查及是否需要血液、肾功能和心脏评估。','Discuss appropriate checkup frequency and whether bloodwork, renal and heart evaluations are warranted by breed and history.','품종과 병력에 따라 혈액·신장·심장 검진 주기를 상담하세요.'),action:dp67L('以獸醫實際檢查和合適的檢驗方法為準，勿僅按項圈推斷疾病。','以兽医实际检查和合适的检验方法为准，勿仅按项圈推断疾病。','Use veterinary testing, not collar estimates, to assess diseases.','질병 평가는 실제 수의학 검사를 기준으로 하세요.')});
 }
 return items;
}
function dp67Indicator(x,title,icon){
 const label=dp67Severity(x);return `<div class="dp67-indicator level-${x.grade<0?'unknown':x.grade}"><div class="dp67-indicator-title"><span>${icon} ${title}</span><b>${label}</b></div><p>${dp67VitalDescription(x)}</p><small>${dp67VitalAdvice(x)}</small></div>`;
}
function dp67WatchMain(){
 const D=dp67PreventionData(),{p,type,heart,breath,isDemo}=D,items=dp67WatchItems(p,type);
 const caption=dp67L('依品種、年齡、體重及近期有效記錄整理；不是疾病診斷。','依品種、年齡、體重及近期有效紀錄整理；不是疾病診斷。','Based on breed, age, weight and recent valid readings. Not a diagnosis.','품종, 나이, 체중 및 최근 유효 측정값 기반. 질병 진단이 아닙니다.');
 const warn=(heart.grade>=2||breath.grade>=2)?dp67L('今天有變化值得先確認','今天有變化值得先確認','A recent change needs a closer look','최근 변화 확인이 필요해요'):D.enough?dp67L('繼續追蹤，預防重點已更新','繼續追蹤，預防重點已更新','Keep tracking—prevention focus updated','예방 포인트가 업데이트됐어요'):dp67L('正在建立個體參考','正在建立個體參考','Building this pet’s reference','개별 기준선을 만들고 있어요');
 return `<section class="dp67-prevention" aria-label="${dp67L('個體化健康建議','个体化健康建议','Personalized health advice','맞춤 건강 관리 조언')}">
 <div class="dp67-hero"><div class="dp67-eyebrow">${dp67L('個體化心肺預防','個體化心肺預防','PERSONAL HEART & BREATHING PREVENTION','맞춤 심폐 예방 관리')}</div><h2>${dp67L('先知道該預防什麼','先知道該預防什麼','Know what to watch early','미리 주의할 점을 확인하세요')}</h2><p>${warn}</p><div class="dp67-profile"><span>${esc(breedText(p))}</span><span>${Number(p.age).toFixed(1)} ${t('years')}</span><span>${Number(p.weight).toFixed(1)} kg</span></div></div>
 <div class="dp67-vitals">${dp67Indicator(heart,dp67L('心跳狀態','心跳狀態','Heart-rate pattern','심박 상태'),'♥')}${dp67Indicator(breath,dp67L('呼吸狀態','呼吸狀態','Breathing pattern','호흡 상태'),'◉')}</div>
 <div class="dp67-watch"><h3>${dp67L('根據牠的條件，值得長期留意','根據牠的條件，值得長期留意','Tailored prevention priorities','맞춤 예방 관리 포인트')}</h3>${items.slice(0,type.senior?8:5).map((item,i)=>`<div class="dp67-priority"><div class="dp67-priority-no">${String(i+1).padStart(2,'0')}</div><div><b>${item.name}</b><p>${item.body}</p><small>${item.action}</small></div></div>`).join('')}</div>
 <div class="dp67-prevent-actions"><button type="button" data-action="deep-category" data-index="0">${dp67L('查看心肺詳細趨勢','查看心肺詳細趨勢','View heart & breathing trends','심폐 추세 보기')} →</button><button type="button" data-action="health-detail" data-page="notes">${dp67L('記錄觀察症狀','記錄觀察症狀','Log an observation','증상 관찰 기록')} →</button></div>
 <div class="dp67-sources"><p>${caption} ${isDemo?dp67L('目前是模擬數據。','目前是模擬數據。','Demo readings only.','데모 측정값입니다.'):''}</p><p>${dp67L('如出現呼吸費力、嘴唇／牙齦發紫、虛弱或昏倒，請立即尋求獸醫協助，不要等待 APP 預警。','如出現呼吸費力、嘴唇／牙齦發紫、虛弱或昏倒，請立即尋求獸醫協助，不要等待 APP 預警。','For labored breathing, blue gums, profound weakness or collapse, seek urgent veterinary care—do not wait for the app.','호흡 곤란, 잇몸 청색증, 심한 쇠약 또는 쓰러짐이 있으면 앱을 기다리지 말고 즉시 진료받으세요.')}</p><details><summary>${dp67L('預防資料依據','預防資料依據','Prevention evidence','예방 정보 출처')}</summary>${DP67_EVIDENCE.map(e=>`<a href="${e.url}" rel="noopener noreferrer" target="_blank">${e.name} ↗</a>`).join('')}</details></div></section>`;
}
function dp67HomePrevention(){
 const D=dp67PreventionData(),{heart,breath,p}=D;const priority=[heart,breath].filter(x=>x.grade>=1).sort((a,b)=>b.grade-a.grade)[0];
 const title=priority?priority.kind==='heart'?dp67L('心跳變化值得關注','心跳變化值得關注','Check today’s heart trend','오늘 심박 추세 확인'):dp67L('呼吸變化值得關注','呼吸變化值得關注','Check today’s breathing trend','오늘 호흡 추세 확인'):dp67L('根據品種與年齡，了解預防重點','根據品種與年齡，了解預防重點','Your pet’s pet-specific prevention focus','품종과 나이에 맞춘 예방 포인트');
 return `<button class="card dp67-home-card" data-action="nav" data-page="health"><div class="dp67-home-icon">✦</div><div class="grow"><b>${dp67L('個體化心肺預防','個體化心肺預防','Preventive heart & breathing care','맞춤 심폐 예방 관리')}</b><p>${title}</p><small>${esc(breedText(p))} · ${Number(p.age).toFixed(1)} ${t('years')} · ${Number(p.weight).toFixed(1)}kg</small></div><span class="dp67-home-arrow">›</span></button>`;
}
function dp67AgeHealth(){const valid=signalQuality().valid&&Number.isFinite(bioAgeDelta().bio);return `<section class="card dp67-age"><details><summary><span>✦ ${dp67L('AI 推算生理年齡（長期趨勢）','AI 推算生理年齡（長期趨勢）','AI-estimated biological age (long-term)','AI 추정 생체 나이 (장기 추세)')}</span><b>${valid?bioAgeDelta().bio.toFixed(1)+' '+t('years'):'—'}</b></summary><div class="dp67-age-body"><p>${dp67L('這是模型估算的長期參考，不是每天都需要查看的健康警報。','這是模型估算的長期參考，不是每天都需要查看的健康警報。','A long-term model estimate—not a daily health warning.','장기적인 모델 추정치이며 매일 확인해야 하는 건강 경고가 아닙니다.')}</p>${valid?ageTrendCard(true):''}<button data-action="age-detail" class="dp67-age-more">${dp67L('查看詳細解釋','查看詳細解釋','View details','자세히 보기')} →</button></div></details></section>`;}
