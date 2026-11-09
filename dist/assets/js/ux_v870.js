/* DeepPet V8.70 - focused UX improvements on top of complete V8.69 app.
   Demo measurements and existing medical-safety limitations remain unchanged. */
(function(){
'use strict';
const L=(zh,zht,en,ko)=>state.lang==='zh'?zh:state.lang==='zht'?zht:state.lang==='ko'?ko:en;
const F=s=>{const t=document.createElement('template');t.innerHTML=s;return t.content;};
const H=f=>{const d=document.createElement('div');d.appendChild(f);return d.innerHTML;};
const text=v=>esc(String(v??''));
const petKey=()=>String(dpCurrentPetId());
const draftKey=()=>petKey()+'|'+String(state.dp70WatchCode||'');
const getDraft=()=>state.dp70FeedbackDrafts?.[draftKey()]||'';
const todayKey=()=>iso(localDate());
function sourceSig(){const s=dpTodayUnifiedScores();return [s.heart,s.sleep,s.energyActivity].map(n=>Number.isFinite(Number(n))?Number(n).toFixed(1):'—').join(':');}
const deepSeenKey=()=>petKey()+'|'+todayKey()+'|'+sourceSig();
function seenDeep(){state.dp70DeepRead??={};return state.dp70DeepRead[deepSeenKey()]||[];}
function markDeep(i){const s=new Set(seenDeep());if(!s.has(i)){s.add(i);state.dp70DeepRead[deepSeenKey()]=[...s];persist();}}
const oldDeepFlags=dpDeepFlags;
dpDeepFlags=function(){return oldDeepFlags().filter(i=>!seenDeep().includes(i));};
const oldDeepIssue=dpDeepIssueHeader;
dpDeepIssueHeader=function(i){const root=F(oldDeepIssue(i));if(seenDeep().includes(i))root.querySelectorAll('.dp-deep-alert-heading .dp-unread-dot').forEach(e=>e.remove());root.querySelectorAll('.dp-deep-alert-heading > b').forEach(e=>{if(e.textContent.includes('紅點')||e.textContent.includes('alert:'))e.textContent=L('今日觀察與建議','今日观察与建议','Today’s observations & advice','오늘의 관찰과 조언');});return H(root);};
const oldDeepView=deepView;
deepView=function(){if(!state.detail&&![null,undefined].includes(state.deepType))markDeep(Number(state.deepType));const root=F(oldDeepView());root.querySelectorAll('.dp-deep-alert-reasons .dp-unread-dot').forEach(e=>e.remove());
 if(state.deepType===1)root.querySelectorAll('p').forEach(el=>{if(/依項圈動靜估算安靜休息及中斷|依项圈动静估算安静休息及中断|Quiet rest and interruptions are estimated from motion|움직임을 통해 조용한 휴식을 추정하며/.test(el.textContent))el.remove();});
 return H(root);};
// A new due reminder becomes unread again if its titles or dates change.
const oldDueCount=dpDueCount;
function dueSig(){return dpTodayCareItems().map(x=>x.title+'|'+x.detail).sort().join('~');}
const healthReadKey=()=>petKey()+'|'+todayKey();
function healthRead(){return state.dp70HealthRead?.[healthReadKey()]===dueSig();}
dpDueCount=function(){return healthRead()?0:oldDueCount();};
// Only an opened Health page marks the displayed reminders as read; a new reminder reopens the dot.
function markHealth(){if(!healthRead()){state.dp70HealthRead??={};state.dp70HealthRead[healthReadKey()]=dueSig();persist();}}

// Prevention: a compact, numbered list with detailed, navigable priority pages.
function watchList(){const d=dp67PreventionData();return dp67WatchItems(d.p,d.type);}
const oldPrevention=dp67WatchMain;
dp67WatchMain=function(){const D=dp67PreventionData(),p=D.p,items=watchList();
 const itemButton=(x,i)=>`<button type="button" class="dp70-watch-row" data-action="dp70-watch-open" data-code="${text(x.code)}"><span class="dp70-watch-index">${String(i+1).padStart(2,'0')}</span><span class="dp70-watch-label">${text(x.name)}<small>${L('查看原因、建議和觀察回饋','查看原因、建议和观察反馈','Why it matters, advice & feedback','이유·권장 사항·관찰 기록')}</small></span><span aria-hidden="true">${vicon('chev',20)}</span></button>`;
 const top=items.slice(0,2).map(itemButton).join(''),extra=items.slice(2).map((x,i)=>itemButton(x,i+2)).join('');
 return `<section class="dp70-watch-hero" aria-label="${L('心肺預防','心肺预防','Heart & breathing prevention','심폐 예방 관리')}"><div class="dp70-watch-heading"><small>${L('預防性健康管理','预防性健康管理','PREVENTIVE CARE','예방 건강 관리')}</small><h2>${L('心肺預防','心肺预防','Heart & Breathing Prevention','심폐 예방 관리')}</h2><p>${L('依這隻寵物的品種、年齡和體重，整理值得留意的事項。','按这只宠物的品种、年龄和体重，整理值得留意的事项。','Priorities based on this pet’s breed, age and weight.','품종·나이·체중을 바탕으로 주요 관찰 사항을 정리합니다.')}</p><div class="dp70-watch-profile"><span>${text(breedText(p))}</span><span>${Number(p.age).toFixed(1)} ${t('years')}</span><span>${Number(p.weight).toFixed(1)} kg</span></div></div><div class="dp70-watch-overview"><div class="dp70-watch-overview-heading"><strong>${L('推估需要留意的重點','推估需要留意的重点','Suggested areas to monitor','주요 관찰 항목')}</strong><span>${items.length} ${L('項','项','areas','개')}</span></div>${top}${extra?`<details class="dp70-watch-more"><summary>${L('查看更多預防重點','查看更多预防重点','More prevention priorities','예방 항목 더 보기')} · +${items.length-2}</summary>${extra}</details>`:''}</div><p class="dp70-prevention-note">${L('依內建照護規則與示範資料整理，不代表 AI 已診斷疾病。','依据内置照护规则和模拟数据整理，不代表 AI 已诊断疾病。','Based on built-in care references and demo data, not an AI diagnosis.','내장 관리 규칙과 데모 자료에 근거하며 질병 진단이 아닙니다.')}</p></section>`;
};
function watchDetail(){const list=watchList(),item=list.find(x=>x.code===state.dp70WatchCode)||list[0];if(!item)return `<div class="app-pad"><p>${L('沒有可查看的預防資料。','没有可查看的预防数据。','No prevention details available.','예방 정보가 없습니다.')}</p></div>`;
 const records=notesForDog().filter(n=>n.preventionCode===item.code).slice().sort((a,b)=>(b.date+' '+b.time).localeCompare(a.date+' '+a.time));
 const h=records.map(n=>`<div class="dp70-note-entry"><small>${text(n.date)} ${text(n.time)}</small><p>${text(n.text)}</p></div>`).join('');
 return `<div class="app-pad dp70-watch-detail-page"><div class="dp70-detail-nav"><button type="button" data-action="dp70-watch-back" aria-label="${L('返回健康管理','返回健康管理','Back to Health','건강 관리로 돌아가기')}">←</button><b>${L('預防重點','预防重点','Prevention priority','예방 관리 항목')}</b></div><section class="card dp70-detail-hero"><small>${L('這隻寵物的個體化觀察','这只宠物的个体化观察','For this pet','이 반려동물의 관리')}</small><h2>${text(item.name)}</h2><p>${text(breedText(currentDog()))} · ${currentDog().age} ${t('years')} · ${currentDog().weight} kg</p></section><section class="card dp70-detail-explain"><h3>${L('為什麼值得留意？','为什么值得留意？','Why pay attention?','왜 주의해야 하나요?')}</h3><p>${text(item.body)}</p><h3>${L('建議做法','建议做法','What you can do','권장 사항')}</h3><p>${text(item.action)}</p><div class="dp70-detail-caution">${L('以上是預防性觀察建議。如出現明顯呼吸費力、昏倒或持續異常，請及時聯絡獸醫。','以上是预防性观察建议。如出现呼吸费力、晕厥或持续异常，请及时联系兽医。','Preventive guidance only. Seek veterinary help for labored breathing, collapse or persistent changes.','예방 목적의 안내입니다. 호흡 곤란·실신·지속적 변화가 있으면 수의사에게 문의하세요.')}</div></section><section class="card dp70-feedback-card"><h3>${L('我的觀察與改善回饋','我的观察与改善反馈','My observations & follow-up','나의 관찰 및 조치 기록')}</h3><p>${L('例如：散步後呼吸是否恢復、是否調整活動時間、已向獸醫詢問的結果。','例如：散步后呼吸是否恢复、是否调整活动时间、已向兽医咨询的结果。','Record what you noticed, any changes you made, or advice from your vet.','관찰 내용, 생활 속 조정 사항 또는 수의사의 권고를 기록하세요.')}</p><label for="dp70-feedback-date">${L('觀察日期','观察日期','Observation date','관찰 날짜')}</label><input id="dp70-feedback-date" type="date" class="form-control" max="${todayKey()}" value="${state.dp70FeedbackDates?.[draftKey()]||todayKey()}"/><label for="dp70-feedback-body">${L('補充觀察內容','补充观察内容','Observation notes','관찰 내용')}</label><textarea id="dp70-feedback-body" class="form-control" rows="4" maxlength="1500" placeholder="${L('記錄你觀察到的情況與採取的做法','记录你观察到的情况与采取的做法','Describe what you observed and did','관찰과 조치 내용을 입력하세요')}">${text(getDraft())}</textarea><button type="button" class="cta full dp70-feedback-submit" data-action="dp70-feedback-save">${L('儲存到額外紀錄','保存到额外记录','Save to Extra Records','추가 기록에 저장')}</button></section><section class="card dp70-feedback-history"><div class="dp70-history-head"><h3>${L('這項建議的追蹤紀錄','这项建议的跟踪记录','Follow-up history','추적 관찰 기록')}</h3><button data-action="dp70-open-notes">${L('查看全部','查看全部','View all','전체 보기')} →</button></div>${records.length?h:`<p class="dp70-no-feedback">${L('尚未新增回饋，記錄後會保存在這隻寵物的額外紀錄內。','尚未新增反馈，记录后会保存在这只宠物的额外记录内。','No feedback yet. Your notes will appear in this pet’s Extra Records.','아직 기록이 없습니다. 메모는 이 반려동물의 추가 기록에 저장됩니다.')}</p>`}</section></div>`;
}
const oldDisplayNote=displayNote;
displayNote=function(n){if(n?.preventionCode)return {cat:L('心肺預防觀察','心肺预防观察','Prevention observation','예방 관찰'),text:n.text||'—'};return oldDisplayNote(n);};
const oldHealth=healthView;
healthView=function(){if(state.detail==='dp70-watch')return watchDetail();if(!state.detail)markHealth();const root=F(oldHealth());if(state.detail)return H(root);if(healthRead())root.querySelectorAll('.section-head .dp-unread-dot').forEach(x=>x.remove());
 // Move food to its own modest card above the standard health record list.
 const menu=root.querySelector('.care-menu'),food=menu?.querySelector('.dp68-food-link');if(menu&&food){food.remove();const box=document.createElement('section');box.className='card dp70-food-card';const consumed=todayFood(),goal=targetFood(),ratio=Math.min(100,Math.round(consumed/Math.max(1,goal)*100));box.innerHTML=`<button data-action="health-detail" data-page="food" class="dp70-food-button"><span class="dp70-food-pict">${vicon('food',26)}</span><span class="dp70-food-info"><b>${t('food')}</b><small>${L('每日飲食目標','每日饮食目标','Daily feeding target','일일 급여 목표')}</small><span class="dp70-food-track"><i style="width:${ratio}%"></i></span></span><span class="dp70-food-numbers">${consumed}<small> / ${goal} kcal</small></span>${vicon('chev',18)}</button>`;menu.parentNode.insertBefore(box,menu);}
 // Notes and recovery are visually independent, vivid entry cards, not appended rows.
 root.querySelectorAll('.dp68-independent-care').forEach(section=>{const b=section.querySelector('[data-page]');if(!b)return;const pg=b.dataset.page,rec=pg==='recovery-care',title=rec?L('恢復情況','恢复情况','Recovery Check','회복 상태'):t('notes'),subtitle=rec?L('生病、術後和日常恢復追蹤','生病、术后和日常恢复追踪','Recovery after illness or procedures','질병·수술 후 회복 추적'):L('記錄你看到的變化與預防回饋','记录观察变化与预防反馈','Observations, changes & preventive feedback','관찰·변화·예방 기록');section.className='card dp70-feature-entry '+(rec?'dp70-feature-recovery':'dp70-feature-notes');section.innerHTML=`<button data-action="health-detail" data-page="${pg}" class="dp70-feature-button"><span class="dp70-feature-illustration" aria-hidden="true">${vicon(rec?'activity':'edit',38)}</span><span class="dp70-feature-info"><b>${title}</b><small>${subtitle}</small></span><span class="dp70-feature-chevron">${vicon('chev',21)}</span></button>`;});
 return H(root);
};
// Standardize both relax/steadiness and load-regulation scores as transparent dotted rings,
// for all selected periods without removing the original trend plots.
function dp70RingRhythm(root){root.querySelectorAll('.dp68-rhythm-score').forEach(aside=>{
 if(aside.querySelector('.dp70-rhythm-score-ring'))return;
 const b=aside.querySelector('.dp69-grade,.dp66-grade-badge');const badge=b?b.outerHTML:'';
 const raw=(aside.firstChild?.textContent||aside.textContent||'').trim();const v=/^(\d+)/.exec(raw);const score=v?Number(v[1]):null;
 aside.innerHTML=`<span class="dp70-rhythm-score-ring">${dpDeepDottedScore(score,'#408caa')}</span>${badge}`;
 aside.classList.add('dp70-rhythm-aside');
 });return root;}
const oldRhythm70=dp66RhythmLoadQuick;
dp66RhythmLoadQuick=function(row){return H(dp70RingRhythm(F(oldRhythm70(row))));};
const oldPeriod70=dpOwnerPeriodDetail;
dpOwnerPeriodDetail=function(kind,cp,days){const root=F(oldPeriod70(kind,cp,days));if(kind===2)dp70RingRhythm(root);return H(root);};

// Me: separate, better-balanced age, baseline and heart-moment visual cards.
const oldMe=meView;
function baselineMiniChart(){const all=demoRecords(state.dog),last=all.slice(-14);const vals=last.map((r,i)=>{const ix=all.length-last.length+i;return validDaySample(r,ix).valid?Number(dpHeartComposite(r)):null;});if(vals.filter(x=>x!==null).length<2)return '';const xs=vals.map((v,i)=>v===null?null:[8+i*18,64-(v-40)*.64]);let paths='',alive=false;xs.forEach(p=>{if(!p){alive=false;return;}paths+=(alive?' L':' M')+p[0].toFixed(1)+' '+p[1].toFixed(1);alive=true;});return `<svg class="dp70-baseline-spark" viewBox="0 0 250 70" aria-hidden="true"><path d="${paths}" fill="none" stroke="#47a5d3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;}
meView=function(){const root=F(oldMe());const age=root.querySelector('.dp68-age-me'),baseline=root.querySelector('.dp-owner-baseline-me'),avatar=root.querySelector('.pet-avatar');
 if(avatar){avatar.src=dp58FaceAsset(state.dog,currentDog());avatar.loading='eager';avatar.decoding='async';}
 if(age){const valid=signalQuality().valid,bio=valid?bioAgeDelta():null,delta=bio?bio.diff:0;age.classList.add('dp70-age-hero');const summary=age.querySelector('summary');if(summary){const old=summary.querySelector('strong');old?.remove();const block=document.createElement('div');block.className='dp70-age-metrics';block.innerHTML=valid?`<div><small>${L('推算年齡','推算年龄','Estimated age','추정 나이')}</small><strong>${bio.bio.toFixed(1)} <em>${t('years')}</em></strong></div><div><small>${L('實際年齡','实际年龄','Actual age','실제 나이')}</small><b>${bio.actual.toFixed(1)} ${t('years')}</b><span class="dp70-age-diff">${delta<0?'−':delta>0?'+':'±'}${Math.abs(delta).toFixed(1)} ${t('years')}</span></div>`:`<div><strong>—</strong><small>${L('資料建立中','数据建立中','Building estimate','추정 중')}</small></div>`;summary.appendChild(block);}
 }
 if(baseline){baseline.classList.add('dp70-baseline-hero');const grow=baseline.querySelector('.grow');if(grow){grow.insertAdjacentHTML('beforeend',`<span class="dp70-baseline-chart-caption">${L('最近 14 天心肺狀態趨勢','最近14天心肺状态趋势','14-day heart & breathing trend','14일 심폐 상태 추세')}</span>${baselineMiniChart()}`);}}
 return H(root);};
// Performance: already generated small face images avoid decoding very large embedded photos.
// Preserve user-uploaded photo overrides and the original portrait used in full-screen Heart Moments.
const oldFreshMe=dp58FreshEmptyTab;
dp58FreshEmptyTab=function(){const root=F(oldFreshMe());const im=root.querySelector('.pet-avatar');if(im)im.decoding='async';return H(root);};

// Preserve free-text feedback across existing background rerenders.
document.addEventListener('input',e=>{if(e.target?.id==='dp70-feedback-body'){state.dp70FeedbackDrafts??={};state.dp70FeedbackDrafts[draftKey()]=e.target.value;}},true);
document.addEventListener('change',e=>{if(e.target?.id==='dp70-feedback-date'){state.dp70FeedbackDates??={};state.dp70FeedbackDates[draftKey()]=e.target.value;}},true);
// Force exactly one behaviour per read notification, across pet/date/score.
document.addEventListener('click',e=>{const a=e.target.closest('[data-action]');if(!a)return;const action=a.dataset.action;if(!['dp70-watch-open','dp70-watch-back','dp70-feedback-save','dp70-open-notes'].includes(action))return;e.preventDefault();e.stopImmediatePropagation();
 if(action==='dp70-watch-open'){state.dp70WatchCode=a.dataset.code;navTo('health','dp70-watch');return;}
 if(action==='dp70-watch-back'){navTo('health');return;}
 if(action==='dp70-open-notes'){navTo('health','notes');return;}
 if(action==='dp70-feedback-save'){
  const n=document.querySelector('#dp70-feedback-body'),d=document.querySelector('#dp70-feedback-date'),value=(n?.value||getDraft()).trim(),day=d?.value||state.dp70FeedbackDates?.[draftKey()]||todayKey();if(!value||value.length>1500||!day||day>todayKey()){toast(t('inputError'));return;}
  const item=watchList().find(x=>x.code===state.dp70WatchCode);if(!item){toast(t('inputError'));return;}
  notesForDog().push({id:'dp70-'+Date.now()+'-'+Math.floor(Math.random()*1000),date:day,time:new Date().toTimeString().slice(0,5),cat:L('健康觀察','健康观察','Health observation','건강 관찰'),text:value,preventionCode:item.code});if(state.dp70FeedbackDrafts)delete state.dp70FeedbackDrafts[draftKey()];persist();render(true);toast(t('saved'));
 }
},true);
})();
