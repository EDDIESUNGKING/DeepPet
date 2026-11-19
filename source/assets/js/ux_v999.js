/* DeepPet 9.99: original four-tab architecture, nonduplicated Home scores, Heart Moments QA. */
(function(root){'use strict';
 const A=root.DeepPetIntelligence995;
 if(!A){console.error('DeepPet V9.99 insight module unavailable');return;}
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const messages={
  timeline:['日常健康紀錄','Daily health records','일상 건강 기록','日々の健康記録','日常健康记录'],
  timelineExplain:['整理近90天的用藥、疫苗、體檢、飲食與活動；點選類別即可篩選。時間先後不代表藥物療效。','Browse the last 90 days of medication, vaccines, exams, food and activity. Filter by category; timing alone does not prove treatment effects.','최근 90일의 투약·접종·검진·식사·활동을 분류해 확인하세요. 기록의 순서만으로 치료 효과를 판단할 수 없습니다.','過去90日間の投薬・予防接種・健診・食事・活動を種類別に確認できます。記録の順序だけで薬の効果は判断できません。','整理近90天的用药、疫苗、体检、饮食与活动；点击类别即可筛选。时间先后不代表药物疗效。'],
  timelineNone:['目前沒有這類健康紀錄。','There are no records in this category yet.','이 종류의 건강 기록은 아직 없습니다.','この種類の健康記録はまだありません。','目前没有这类健康记录。'],
  allRecords:['全部','All','전체','すべて','全部'],
  recordsUnit:['筆','records','건','件','条'],
  more:['查看更多','Show more','더 보기','もっと見る','查看更多'],less:['收起','Show less','접기','閉じる','收起'],
  day:['天','days','일','日','天'],dayFraction:['占全天','of the day','하루 중','一日のうち','占全天'],
  latest:['最近','Latest','최근','最近','最近'],
  cardio:['心肺狀態','Cardio','심폐','心肺','心肺状态'],sleep:['睡眠休息','Sleep/rest','수면·휴식','睡眠・休息','睡眠休息'],
  activityRecovery:['精力與恢復','Energy/recovery','활동·회복','活力・回復','精力与恢复'],
  med:['用藥','Medication','복약','投薬','用药'],vaccine:['疫苗','Vaccination','접종','予防接種','疫苗'],
  exam:['體檢','Examination','검진','健康診断','体检'],food:['飲食','Food','식사','食事','饮食'],
  activity:['活動','Activity','활동','活動','活动'],recovery:['恢復','Recovery','회복','回復','恢复'],note:['額外記錄','Note','메모','記録','额外记录']
 };
 const loc=k=>{const items=messages[k];if(!items)return k;const lang=state.lang;return items[lang==='en'?1:lang==='ko'?2:lang==='ja'?3:lang==='zh'?4:0];};
 const dateToday=()=>iso(localDate());
 const gallery=()=>!selectedBlank()&&state.dog>=0&&state.dog<15&&!currentDog().dpFixtureInvalidated;
 const context=()=>A.insight({petId:String(state.dog),rows:selectedBlank()?[]:(root.DeepPetSignalScoring?.getDaily?.(state.dog)||[]),
   asOf:dateToday(),allowOwnerlessGallery:gallery()});
 const readCare=()=>{
  const id=String(state.dog),demo=typeof dpReviewDemoCare==='function'?dpReviewDemoCare(state.dog):{med:[],reports:[],vaccines:[]};
  // A scheduled treatment is a reminder, not evidence that a dose was taken.
  const medUser=(state.medHistoryByPet?.[id]||[]).filter(r=>r.status==='taken');
  const vaccine=typeof allVaxForDog==='function'?allVaxForDog():[];
  // Laboratory storage is one row PER TEST INDICATOR. Group by report ID +
  // examination date to avoid inventing twenty separate veterinary visits.
  const reports=[...new Map((root.dp914ReportRecords?.(state.dog)||[]).filter(r=>r?.date&&A.ownerValid(r,id,true)).map(r=>{
   const reportId=String(r.reportId||`legacy:${r.date}:${r.clinic||''}`),key=`${reportId}|${r.date}`;
   return [key,{id:reportId,reportId,date:r.date,clinic:r.clinic||'',name:r.clinic||loc('exam'),
    sample:r.sample===true||r.source==='sample',source:r.source,petId:r.petId,ownerPetId:r.ownerPetId,profile:r.profile}];
  })).values()];
  const meals=Object.entries(state.mealItems||{}).filter(([k,rows])=>k.startsWith(id+'-')&&Array.isArray(rows)).flatMap(([key,rows])=>rows.map((r,i)=>({date:r.date||key.slice(id.length+1),id:r.id||`meal-${key}-${i}`,name:loc('food'),...r})));
  const behavior=typeof behaviorLogForPet==='function'?behaviorLogForPet():[];
  const plan=state.carePlans?.[id]||{},recovery=[...(plan.checkins||[]).map((x,i)=>({...x,id:x.id||`checkin-${i}-${x.date}`,name:loc('recovery')}))];
  for(const p of state.carePlanHistoryByPet?.[id]||[])for(const [i,x] of (p.checkins||[]).entries())recovery.push({...x,id:x.id||`old-${p.started}-${i}`,name:loc('recovery')});
  const notes=state.notesByDog?.[id]||[];
  // Scheduled future vaccines must not suppress the gallery's historical,
  // completed vaccine examples. Once real completed rows exist, prefer them.
  const completedVaccines=vaccine.filter(r=>r.status==='done');
  const sources={medications:[...demo.med,...medUser],
   vaccinations:completedVaccines.length?vaccine:[...vaccine,...demo.vaccines],
   reports:reports.length?reports:demo.reports,meals,activity:behavior,recovery,notes};
  // The engine's 90-row cap is intentional for a single feed. Applying it
  // once to ALL seven categories can hide older vaccination/exam examples
  // behind many meals and activity events. Apply that same bound per category.
  return Object.entries(sources).flatMap(([key,value])=>A.eventTimeline({petId:id,asOf:dateToday(),fromDays:90,[key]:value}))
   .sort((a,b)=>b.date.localeCompare(a.date)||b.time.localeCompare(a.time)||a.type.localeCompare(b.type));
 };
 const expanded=new Map(),timelineFilterByPet=new Map();
 function timelineCard(){
  const id=String(state.dog),list=readCare(),type=timelineFilterByPet.get(id)||'all';
  const categories=['med','vaccine','exam','food','activity','recovery','note'];
  const countByType=new Map(categories.map(t=>[t,list.filter(x=>x.type===t).length]));
  const availableType=type==='all'||(countByType.get(type)||0)>0?type:'all';
  if(type!==availableType)timelineFilterByPet.delete(id);
  const filtered=availableType==='all'?list:list.filter(x=>x.type===availableType);
  const shown=expanded.get(id)||6,visible=filtered.slice(0,shown);
  // Show the most recent recorded actions without inventing any medical
  // inference. Each shortcut opens that category's existing history.
  const highlights=['exam','vaccine','med'].map(key=>({key,item:list.find(x=>x.type===key)})).filter(x=>x.item);
  const latestLinks=highlights.map(({key,item})=>`<button type="button" data-dp992="filter" data-kind="${key}" class="dp998-latest" aria-label="${loc('latest')} ${loc(key)} ${esc(item.date)}"><small>${loc('latest')} ${loc(key)}</small><strong>${esc(item.date.slice(5))}</strong></button>`).join('');
  const filters=[['all',list.length],...categories.map(t=>[t,countByType.get(t)||0]).filter(([,n])=>n>0)].map(([key,n])=>
   `<button type="button" class="dp997-history-filter ${availableType===key?'active':''}" data-dp992="filter" data-kind="${key}" aria-pressed="${availableType===key?'true':'false'}">${key==='all'?loc('allRecords'):loc(key)} <span>${n}</span></button>`).join('');
  const destination={med:'med',vaccine:'vaccines',exam:'reports',food:'food',recovery:'recovery-care',note:'notes'};
  return `<section class="card dp992-card dp992-timeline dp997-history"><div class="dp992-heading"><h3>▤ ${loc('timeline')}</h3><span class="dp992-count">${list.length} ${loc('recordsUnit')}</span></div><p>${loc('timelineExplain')}</p>${latestLinks?`<div class="dp998-latest-row" role="group" aria-label="${loc('latest')} ${loc('timeline')}">${latestLinks}</div>`:''}<div class="dp997-history-filters" role="group" aria-label="${loc('timeline')}">${filters}</div>
   ${visible.length?`<ol class="dp992-events">${visible.map(x=>`<li><span class="dp992-event-date">${esc(x.date.slice(5))}${x.time?' '+esc(x.time):''}</span><button type="button" class="dp992-event-line" ${x.type==='activity'?'data-dp992="deep" data-category="2"':`data-action="health-detail" data-page="${destination[x.type]||'notes'}"`}><i class="dp992-type dp992-${x.type}">${loc(x.type)}</i><strong>${esc(x.title)}</strong><span aria-hidden="true">↗</span></button></li>`).join('')}</ol>`:`<p class="dp992-no-records">${loc('timelineNone')}</p>`}
   ${filtered.length>6?`<button type="button" class="dp992-toggle" data-dp992="more">${shown>=filtered.length?loc('less'):loc('more')} (${visible.length}/${filtered.length})</button>`:''}</section>`;
 }
 const activePage=()=>!state.detail&&['home','deep','health','me'].includes(state.tab);
 // The Home preventive card has been superseded by Health's original
 // preventive-health section. Do not move or duplicate that section.
 dp67HomePrevention=function(){return '';};
 function todayDelta(value){
  if(!Number.isFinite(value))return '';
  const up=value>0,down=value<0,mark=up?'↑':down?'↓':'→',spoken=up?['較昨日上升','Up since yesterday']:down?['較昨日下降','Down since yesterday']:['與昨日持平','Unchanged since yesterday'];
  const label=state.lang==='en'?spoken[1]:spoken[0];
  return `<span class="dp999-daily-delta ${up?'up':down?'down':'same'}" aria-label="${label} ${Math.abs(value)}"><span aria-hidden="true">${mark}</span> ${up?'+':''}${value}</span>`;
 }
 function mergeDailyDeltas(main,data){
  // One visual home for scores: the two original dotted-score lanes.
  const lanes=[['.dp-health-lane',data.daily?.delta,data.daily?.score],['.dp-rhythm-lane',data.daily?.rhythmDelta,data.daily?.rhythm]];
  for(const [selector,change,current] of lanes){
   const lane=main.querySelector(selector),title=lane?.querySelector('.dp-lane-copy>strong'),meter=lane?.querySelector('.dp-lane-meter');
   const shown=Number(meter?.textContent?.match(/\d{1,3}/)?.[0]);
   if(!title||!Number.isFinite(shown)||shown!==current||!Number.isFinite(change))continue;
   title.insertAdjacentHTML('beforeend',todayDelta(change));
  }
 }
 const todayTodoLabel=()=>state.lang==='en'?'Today’s to-dos':state.lang==='ko'?'오늘 할 일':state.lang==='ja'?'今日のタスク':state.lang==='zh'?'今日待办':'今日待辦';
 function restoreTodayTodo(main){
  const focus=main.querySelector('.dp-today-focus .focus-eyebrow');
  if(focus){const label=todayTodoLabel();
   // Keep the icon and existing priority actions; only clarify the heading.
   const icon=focus.querySelector('svg');focus.replaceChildren();if(icon)focus.append(icon);focus.append(document.createTextNode(' '+label));}
  // Older Home wrappers may have cached one of several prevention layouts.
  main.querySelectorAll('.dp941-prevention-mini,.dp905-prevent-home,.dp67-home-card,.dp68-prevent-button').forEach(x=>x.remove());
 }
 function repairUpcomingMore(main){
  // V10.75+ owns the entire Health reminder card. Rebuilding it here was
  // deleting its canonical More button and reintroducing a V9.99 route.
  if(main.classList?.contains('dp1075-health-page'))return;
  const host=main.querySelector('.dp-upcoming-care');if(!host)return;
  const items=dpUpcomingCareItems();
  // Two legacy decorators both appended More. Rebuild only the upcoming
  // list, retaining its original actions and first-three presentation.
  const head=items.slice(0,3),extra=items.slice(3);
  host.innerHTML=dpUpcomingCareMarkup(head)+(extra.length?`<details class="dp999-more"><summary>More · ${extra.length}</summary><div class="dp999-more-rows">${dpUpcomingCareMarkup(extra)}</div></details>`:'');
 }
 const previousRender=render;
 render=function(reset=false){previousRender(reset);
  const app=document.getElementById('app'),main=app?.querySelector('.app-main>.app-pad');if(!main)return;
  if(state.tab==='home'&&state.detail==='today-all'){
   const label=main.querySelector('.dp-today-more-page .dp-independent-head b');if(label)label.textContent=todayTodoLabel();return;
  }
  if(!activePage())return;
  const isBlank=selectedBlank(),isFresh=dp58FreshPet()||isFreePet();
  // Blank remains a completely empty identity; New Pet displays only basic
  // profile values until real measurements / user-entered records exist.
  if(!isBlank&&!isFresh){
   // Health only needs pet-scoped health history; don't recompute the signal
   // model when users just open a vaccination or feeding overview.
   const data=state.tab==='home'?context():null;
   if(state.tab==='home')mergeDailyDeltas(main,data);
  }
  if(state.tab==='home')restoreTodayTodo(main);
  if(state.tab==='health')repairUpcomingMore(main);
  // This release deliberately adds no new top-level or section-level cards.
  for(const el of app.querySelectorAll('.app-build-version'))el.textContent='DeepPet · Version 9.99';
 };
 document.addEventListener('click',ev=>{const target=ev.target.closest?.('[data-dp992]');if(!target)return;ev.preventDefault();ev.stopImmediatePropagation();
  if(target.dataset.dp992==='filter'){const id=String(state.dog),kind=target.dataset.kind||'all';
   if(!['all','med','vaccine','exam','food','activity','recovery','note'].includes(kind))return;
   timelineFilterByPet.set(id,kind);expanded.delete(id);render(false);return;}
  if(target.dataset.dp992==='more'){const key=String(state.dog),kind=timelineFilterByPet.get(key)||'all',count=readCare().filter(x=>kind==='all'||x.type===kind).length;
   const shown=expanded.get(key)||6;if(shown>=count)expanded.delete(key);else expanded.set(key,Math.min(count,shown+24));render(false);return;}
  if(target.dataset.dp992==='home'){state.tab='home';state.detail=null;render(true);document.querySelector('.summary-card')?.scrollIntoView?.({block:'center',behavior:'smooth'});return;}
  if(target.dataset.dp992==='deep'){state.tab='deep';state.detail=null;state.deepType=Number(target.dataset.category)||0;state.range=1;render(true);}
 },true);
 root.DeepPetRelease={...root.DeepPetRelease,version:'9.99',purpose:'investor-showcase-and-internal-qa',petSwitch:'two-distinct-states',intelligence:['inline-daily-score-deltas','today-only-todos','single-upcoming-more','heart-photo-and-png','nonduplicated-health-architecture'],integrity:['full-showcase-records','two-separate-empty-profiles','complete-lab-chart-axes','all-fifteen-scenarios-preserved']};
 root.DeepPetUX999={version:'9.99',insight:context,care:readCare,visibleOrder:()=>showcasePetOrder(),blank:()=>selectedBlank(),newPetIndex:()=>allPets().findIndex(p=>p?.dpFreshDemo===true)};
})(window);
