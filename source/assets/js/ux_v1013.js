/* DeepPet V10.13: observable evidence windows, owned this pet’s baseline, dated care context. */
(function(root){'use strict';
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const L=(traditional,simplified,english,japanese,korean)=>state.lang==='en'?english:state.lang==='ja'?japanese:state.lang==='ko'?korean:state.lang==='zh'?simplified:traditional;
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s);
 const scoreOf=(row,key)=>finite(row?.scores?.[key])?row.scores[key]:null;
 const isReal=()=>typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements();
 const noRecord=()=>selectedBlank()||(typeof dp58FreshPet==='function'&&dp58FreshPet())||isFreePet();
 const today=()=>iso(localDate());

 // No cross-pet caches: every change of selected pet reads that pet's verified
 // scoring output, accepted dates and care journal from their canonical sources.
 function evidence(days=7,pet=state.dog){
  const date=today(),start=iso(dateAdd(localDate(),1-days));
  const model=root.DeepPetSignalScoring;
  const scored=new Map((model?.getDaily?.(pet)||[]).filter(x=>validDate(x?.date)&&x.date>=start&&x.date<=date).map(x=>[x.date,x]));
  const real=dpUsesRealMeasurements(pet);
  const verifiedDates=real?new Set((model?.getFeatures?.(pet)||[])
   .filter(x=>validDate(x?.date)&&x.source==='20hz-waveform'&&model?.isVerifiedWear?.(x)===true).map(x=>x.date)):null;
  const gallery=real?null:demoRecords(pet);
  const rows=Array.from({length:days},(_,i)=>{
   const stamp=iso(dateAdd(localDate(),i+1-days));
   const idx=gallery?.findIndex(x=>x?.date===stamp)??-1;
   const wearable=real?verifiedDates.has(stamp):idx>=0&&qualityForDay(idx,pet).valid;
   const source=wearable?scored.get(stamp):null;
   return {date:stamp,valid:wearable,physiol:scoreOf(source,'physiol'),rhythm:scoreOf(source,'rhythm'),source:real?'verified-waveform':'showcase'};
  });
  const accepted=rows.filter(x=>x.valid&&finite(x.physiol)&&finite(x.rhythm));
  return {pet,start,date,rows,accepted,count:accepted.length,latest:accepted.at(-1)?.date||null};
 }

 // Reference for TODAY must use 14 *previous* accepted dates, not include
 // today's observation. A 14-day wearing badge alone does not imply a
 // 14-day prior score comparison exists for a particular metric.
 function personalChange(metric='physiol',pet=state.dog){
  if(noRecord()||pet!==state.dog)return {ready:false,reason:'new-pet'};
  const base=baselineProfile();
  const model=root.DeepPetSignalScoring,real=dpUsesRealMeasurements(pet),date=today();
  const rows=(model?.getDaily?.(pet)||[]).filter(x=>validDate(x?.date)&&x.date>=iso(dateAdd(localDate(),-45))&&x.date<=date&&finite(scoreOf(x,metric)));
  const validDates=new Set();
  if(real){for(const row of model?.getFeatures?.(pet)||[])if(row?.source==='20hz-waveform'&&model?.isVerifiedWear?.(row)===true)validDates.add(row.date);}
  else for(let i=0;i<demoRecords(pet).length;i++)if(qualityForDay(i,pet).valid)validDates.add(demoRecords(pet)[i].date);
  const accepted=[...new Map(rows.filter(x=>validDates.has(x.date)).map(x=>[x.date,x])).values()].sort((a,b)=>a.date.localeCompare(b.date));
  const earlier=accepted.filter(x=>x.date<date).slice(-14),current=accepted.find(x=>x.date===date);
  if(!base?.ready||earlier.length!==14||!current)return {ready:false,count:earlier.length,updatedOn:accepted.at(-1)?.date||null,reason:!current?'no-today':'building'};
  const mean=earlier.reduce((sum,row)=>sum+scoreOf(row,metric),0)/14;
  const actual=scoreOf(current,metric),delta=actual-mean;
  return {ready:true,count:14,metric,mean,actual,delta,date,from:earlier[0].date,to:earlier.at(-1).date};
 }

 function evidenceNote(metric){
  const e=evidence(7),day=e.latest||today();
  const dated=e.latest?L('資料截至','资料截至','Data through','記録更新','기록 시점')+' '+esc(day):L('尚無有效量測','尚无有效测量','No valid recordings yet','有効な記録なし','유효 기록 없음');
  const rate=`${e.count}/7 ${L('個有效評分日','个有效评分日','valid scored days','有効な採点日','유효 점수일')}`;
  const c=personalChange(metric);
  let change='';
  if(c.ready){
   const num=Math.round(Math.abs(c.delta)*10)/10;
   change=L('與先前14個有效日均分相比','与此前14个有效日均分相比','vs previous 14 valid-day mean','直前14有効日の平均比','이전 14일 평균 대비')+' ';
   change+=(num<.05?L('持平','持平','unchanged','同程度','비슷함'):
    (c.delta>0?'+':'−')+num.toFixed(1)+' '+L('分','分','pts','点','점'));
  }else if(e.count>0){
   change=L('個體比較：仍需14個先前有效日與今日評分','个体比较：需此前14个有效日及今日评分','Pet-specific comparison needs 14 prior valid days plus today','個別比較には過去14有効日と今日の記録が必要','반려동물별 비교에는 이전 유효일 14일과 오늘 점수가 필요');
  }
  return `<span class="dp1013-score-evidence" data-evidence-pet="${state.dog}" title="${esc(L('依品質合格且同一寵物的日期計算；分數變化不是疾病判斷。','按质量合格且属于同一宠物的日期计算；分数变化不是疾病判断。','Only valid, pet-owned dates are used. Changes are not a diagnosis.','同じペットの有効記録のみ使用。診断ではありません。','동일 반려동물의 유효 기록만 사용하며 진단이 아닙니다.'))}"><small>◷ ${dated} · ${rate}</small>${change?`<small class="dp1013-personal-change">${esc(change)}</small>`:''}</span>`;
 }

 function historyEventContext(){
  const period=state.healthSummaryDays===30?30:7,e=evidence(period),all=root.DeepPetUX999?.care?.()||[];
  const eligible=all.filter(x=>validDate(x?.date)&&x.date>=e.start&&x.date<=e.date)
   .filter(x=>['med','vaccine','exam','food','activity','recovery','note'].includes(x.type));
  // One newest entry per category first: frequent food/activity logs must not
  // bury an actual examination or medication in the 12-item compact view.
  const selected=new Set(),preview=[];
  for(const type of ['exam','med','vaccine','food','activity','recovery','note']){
   const entry=eligible.find(x=>x.type===type);
   if(entry){selected.add(entry);preview.push(entry);}
  }
  for(const entry of eligible)if(preview.length<12&&!selected.has(entry)){selected.add(entry);preview.push(entry);}
  const events=preview.sort((a,b)=>b.date.localeCompare(a.date)||String(b.time||'').localeCompare(String(a.time||'')));
  const scores=new Map(e.rows.map(x=>[x.date,x]));
  const labels={med:L('用藥','用药','Medication','投薬','복약'),vaccine:L('疫苗','疫苗','Vaccine','予防接種','접종'),exam:L('體檢','体检','Exam','健診','검진'),food:L('飲食','饮食','Food','食事','식사'),activity:L('活動','活动','Activity','活動','활동'),recovery:L('恢復','恢复','Recovery','回復','회복'),note:L('記錄','记录','Notes','記録','메모')};
  const items=events.map(x=>{
   const day=scores.get(x.date),has=day?.valid&&finite(day.physiol)&&finite(day.rhythm);
   const status=has?`${L('生理狀態','生理状态','Status','生理状態','생리 상태')} ${Math.round(day.physiol)} · ${L('身體節奏','身体节奏','Body rhythm','身体リズム','몸의 리듬')} ${Math.round(day.rhythm)}`:
    L('當日無可用生理評分','当日无可用生理评分','No valid physiological scores that day','当日の有効スコアなし','해당일 유효 점수 없음');
   return `<li><time datetime="${esc(x.date)}">${esc(x.date)}${x.time?' '+esc(x.time):''}</time><span class="dp1013-kind">${esc(labels[x.type])}</span><strong>${esc(x.title)}</strong><small>${esc(status)}</small></li>`;
  }).join('');
  const summary=`${e.count}/${period} ${L('個有效評分日','个有效评分日','valid scored days','有効な採点日','유효 점수일')} · ${e.start} – ${e.date}`;
  const noEvents=L('這段期間沒有已記錄的健康事件；不會自動推測發生過什麼。','该期间没有已记录的健康事件；不会自动推测发生过什么。','No logged health events in this period; none are inferred.','この期間の健康記録はありません。推測で補いません。','해당 기간의 건강 기록이 없어 추측하지 않습니다.');
  const caution=L('相同日期只是時間對照，不代表用藥、飲食或活動造成分數改變，也不能據此診斷。','相同日期只是时间对照，不代表用药、饮食或活动造成分数改变，也不能据此诊断。','Same-day timing does not establish cause, treatment effect or a diagnosis.','同日の記録は因果関係や治療効果、診断を意味しません。','같은 날의 기록은 인과관계·치료 효과·진단을 의미하지 않습니다.');
  return `<details class="card dp1013-event-card"><summary><span><strong>${L('健康事件 × 生理評分','健康事件 × 生理评分','Health events × scores','健康記録 × スコア','건강 사건 × 점수')}</strong><small>${esc(summary)}</small></span><span aria-hidden="true">⌄</span></summary><div class="dp1013-event-content"><p>${esc(L('將同一天的用藥、體檢、飲食、活動及恢復記錄與當日有效評分並列，方便回顧。','并列同日的用药、体检、饮食、活动、恢复记录及有效评分，便于回顾。','See logged care events alongside quality-accepted daily scores.','日々のケア記録と有効なスコアを並べて確認できます。','건강 기록과 유효한 당일 점수를 함께 확인합니다.'))}</p>${items?`<ol>${items}</ol>`:`<p class="dp1013-empty">${esc(noEvents)}</p>`}<p class="dp1013-caution">${esc(caution)}</p></div></details>`;
 }

 const priorRender=render;
 render=function(reset=false){
  priorRender(reset);
  const app=document.getElementById('app');if(!app)return;
  // New Pet has a profile but no verified health evidence; Blank is genuinely
  // empty. Neither may inherit any of another pet's score/baseline events.
  if(!noRecord()&&state.tab==='home'&&!state.detail){
   const selected=app.querySelector('.dp-summary-lanes');
   if(selected){
    for(const [selector,part] of [['.dp-health-lane','physiol'],['.dp-rhythm-lane','rhythm']]){
     const lane=selected.querySelector(selector);
     if(lane)lane.insertAdjacentHTML('beforeend',evidenceNote(part));
    }
   }
  }
  if(!noRecord()&&state.tab==='deep'&&!state.detail){
   const scope=app.querySelector('.dp-owner-deep'),toolbar=scope?.querySelector('.segment');
   if(scope&&toolbar){
    const days=state.range===30?30:state.range===7?7:1,e=evidence(days);
    const last=e.latest?`${L('資料截至','资料截至','Data through','記録更新','기록 시점')} ${e.latest}`:L('尚無有效量測','尚无有效测量','No valid recording','有効な測定なし','유효 측정 없음');
    toolbar.insertAdjacentHTML('afterend',`<p class="dp1013-deep-evidence">◷ ${esc(last)} · ${e.count}/${days} ${L('個有效評分日','个有效评分日','valid scored days','有効な採点日','유효 점수일')}</p>`);
   }
  }
  if(!noRecord()&&state.tab==='health'&&state.detail==='summary'){
   const chartPanels=[...app.querySelectorAll('.dp850-score-panel')];
   chartPanels.forEach((section,i)=>section.insertAdjacentHTML('beforeend',evidenceNote(i===0?'physiol':'rhythm')));
   const journal=app.querySelector('.dp850-care');
   if(journal)journal.insertAdjacentHTML('beforebegin',historyEventContext());
  }
  // All visual result cards use the same terminology; avoid presenting body
  // status and physiological status as if they were separate scores.
  for(const heading of app.querySelectorAll('h1,h2,h3,.dp-lane-copy>strong,.dp850-panel-titles>h3')){
   if(heading.children.length)continue;
   const raw=heading.textContent;
   const replacements=[['身體狀態','生理狀態'],['身体状态','生理状态'],['Body status','Physiological status']];
   let next=raw;for(const [from,to] of replacements)next=next.replaceAll(from,to);
   if(raw!==next)heading.textContent=next;
  }
  app.querySelectorAll('.app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.13');
 };
 root.DeepPetTrust1013={version:'10.13',evidence,personalChange,historyEventContext};
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.13',integrity:[...(root.DeepPetRelease?.integrity||[]),'same-verified-wear-calendar-and-baseline','date-scoped-evidence','prior-14-day-comparisons','same-day-care-context-with-no-causation','no-cross-pet-cache']};
})(window);
