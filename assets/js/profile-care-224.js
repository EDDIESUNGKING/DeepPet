/* Candidate additions: actual birth date, optional dimensions, non-clinical care reminders.
 * LAFA's illustrative appointments remain a distinct, read-only scenario. Never save them as actual medication or veterinary records. */
(function(root){'use strict';
 const U=root.DeepPetUnifiedDeep,L=(tw,zh,en,ko)=>({zht:tw,zh,en,ko})[state.lang]||en;
 const today=()=>iso(localDate());
 const birthdayWindow=(birth,date)=>{if(!U.validBirthDate(birth)||birth>date||!U.validBirthDate(date))return null;let year=+date.slice(0,4),next=U.anniversary(birth,year);if(next<date)next=U.anniversary(birth,++year);const days=Math.round((Date.parse(next)-Date.parse(date))/86400000);return {date:next,days,age:year-Number(birth.slice(0,4))};};
 function birthday(){if(state.emptyPreview||selectedBlank())return null;const d=currentDog(),b=birthdayWindow(d.birthDate,today());if(!b||b.days>7)return null;
  return {...b,name:d.name,title:b.days===0?L('今天是寵物生日！','今天是宠物生日！','Happy birthday!','오늘은 반려동물의 생일이에요!'):L('寵物生日快到了','宠物生日快到了','Birthday coming up','반려동물 생일이 다가와요'),detail:b.days===0?L(`${d.name} 今天滿 ${b.age} 歲。`,`${d.name} 今天满 ${b.age} 岁。`,`${d.name} turns ${b.age} today.`,`${d.name}의 ${b.age}번째 생일이에요.`):L(`${d.name} 距離 ${b.age} 歲生日還有 ${b.days} 天。`,`${d.name} 距离 ${b.age} 岁生日还有 ${b.days} 天。`,`${d.name} turns ${b.age} in ${b.days} day(s).`,`${d.name}의 ${b.age}번째 생일까지 ${b.days}일 남았어요.`)};
 }
 const seenMemory=new Set(),pending=new Set();
 function popup(){if(state.tab!=='home'||state.detail||state.modal||document.querySelector('#dp-intro-root')||document.querySelector('.dp-gallery-loading'))return;const b=birthday();if(!b)return;
  const key=`dp224:birthday:${dpPetId(state.dog)}:${b.date}:${b.days===0?'day':'week'}`;if(seenMemory.has(key)||pending.has(key))return;
  try{if(localStorage.getItem(key))return;}catch{}
  pending.add(key);setTimeout(()=>{pending.delete(key);if(state.tab!=='home'||state.detail||state.modal||document.querySelector('#dp-intro-root'))return;const now=birthday();if(!now||`dp224:birthday:${dpPetId(state.dog)}:${now.date}:${now.days===0?'day':'week'}`!==key)return;toast(now.title+' · '+now.detail);seenMemory.add(key);try{localStorage.setItem(key,'1');}catch{}},800);
 }
 // Actual appointments retain their own existing workflow. These illustrative
 // schedule items only appear for LAFA while a generated-waveform day is selected.
 // They are not real prescriptions, completed vaccinations or exam results.
 function scenario(){if(state.emptyPreview||state.dog!==0||!root.DeepPetMiloAdaptiveScores?.usesFixture(today()))return [];
  const base='2026-11-27',day=today();if(day<base)return [];
  const rec=[
   {id:'care-review',offset:0,page:'med',icon:'med',title:L('用藥安排確認','用药安排确认','Review medication schedule','복약 일정 확인'),time:'19:00'},
   {id:'next-med',offset:1,page:'med',icon:'med',title:L('下次用藥時間確認','下次用药时间确认','Confirm next medication time','다음 복약 시간 확인'),time:'19:00'},
   {id:'vax',offset:3,page:'vaccines',icon:'vaccine',title:L('下次疫苗接種安排','下次疫苗接种安排','Upcoming vaccination visit','다음 예방접종 일정'),time:'10:30'},
   {id:'exam',offset:7,page:'reports',icon:'report',title:L('下次定期體檢安排','下次定期体检安排','Upcoming routine checkup','다음 정기검진 일정'),time:'14:00'},
   {id:'exam-followup',offset:12,page:'reports',icon:'report',title:L('體檢結果回顧安排','体检结果回顾安排','Review checkup results','검진 결과 확인 일정'),time:'11:00'}];
  return rec.map(r=>{let date=U.dateAdd(base,r.offset);while(date<day)date=U.dateAdd(date,30);return {...r,date,type:'preview-care',priority:5,detail:dpFullDate(date)+' · '+r.time+' · '+L('範例行程，非實際預約或醫囑','示例行程，非实际预约或医嘱','Illustrative schedule, not a booking or prescription','예시 일정이며 실제 예약 또는 처방이 아닙니다.'),source:'synthetic-care-scenario'};}).sort((a,b)=>a.date.localeCompare(b.date));
 }
 const oldToday=dpTodayCareItems,oldUpcoming=dpUpcomingCareItems;
 // Advance planning tasks are not overdue medication or medical emergencies.
 dpTodayCareItems=function(){const now=today(),items=scenario();const review=items.filter(x=>x.date===now||(['vax','exam'].includes(x.id)&&x.date>now&&x.date<=U.dateAdd(now,7))).map(x=>x.date===now?x:{...x,appointmentDate:x.date,date:now,title:x.id==='vax'?L('確認近期疫苗安排','确认近期疫苗安排','Review upcoming vaccination','예방접종 예정 확인'):L('確認近期體檢安排','确认近期体检安排','Review upcoming checkup','정기검진 예정 확인')});return [...oldToday(),...review].sort((a,b)=>a.priority-b.priority);};
 dpUpcomingCareItems=function(){const b=birthday(),items=[...oldUpcoming(),...scenario().filter(x=>x.date>today())];if(b&&b.days>0)items.push({id:'birthday-'+b.date,date:b.date,time:'',page:'birthday',icon:'heart',type:'birthday',title:b.title,detail:b.detail});return items.sort((a,b)=>a.date.localeCompare(b.date)||String(a.time||'').localeCompare(String(b.time||''))).slice(0,40);};
 // View read-only reminder details, no accidental confirmation of an illustrative prescription.
 const todayAttrs=dpTodayActionClickAttrs;dpTodayActionClickAttrs=function(item){if(item.type==='preview-care')return `data-action="dp224-preview-care" data-id="${esc(item.id)}"`;return todayAttrs(item);};
 const markup=dpUpcomingCareMarkup;dpUpcomingCareMarkup=function(items){return items.map(x=>x.type==='preview-care'||x.type==='birthday'?`<button type="button" class="care-action dp-upcoming-action" data-action="${x.type==='birthday'?'dp224-birthday':'dp224-preview-care'}" data-id="${esc(x.id)}"><span class="care-action-icon">${vicon(x.icon,18)}</span><span class="grow"><b>${esc(x.title)}</b><small>${esc(x.detail)}</small></span>${vicon('chev',17)}</button>`:markup([x])).join('')||markup([]);};
 const action=onAction;onAction=function(el){if(el?.dataset?.action==='dp224-birthday'){const b=birthday();if(b)toast(b.title+' · '+b.detail);return;}if(el?.dataset?.action==='dp224-preview-care'){const r=scenario().find(x=>x.id===el.dataset.id);if(r)toast(r.title+' · '+r.detail);return;}return action.apply(this,arguments);};
 const modal=renderModal;renderModal=function(...args){const r=modal.apply(this,args);if(!['pet-add','edit-pet'].includes(state.modal))return r;const pre=state.modal==='pet-add'?'addPet':'pet',dob=document.getElementById(pre+'BirthDate'),age=document.getElementById(pre==='addPet'?'addPetAge':'petAgeInput');if(!dob||!age)return r;const sync=()=>{const a=U.ageOnDate(dob.value,today());age.readOnly=Number.isFinite(a);if(Number.isFinite(a))age.value=String(Math.round(a*10)/10);};dob.addEventListener('change',sync);dob.addEventListener('input',sync);if(dob.value)sync();return r;};
 const renderBefore=render;render=function(...args){const r=renderBefore.apply(this,args);try{popup();}catch(e){console.warn('Birthday reminder',e);}return r;};
 root.DeepPetProfileCare224=Object.freeze({birthdayWindow,birthday,scenario});
})(window);
