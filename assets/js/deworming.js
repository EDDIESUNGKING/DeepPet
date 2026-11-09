/* DeepPet V8.60: pet-specific deworming care logs and in-app reminders.
 * All sample records are demo-only. No dosing recommendations are calculated.
 */
(function(){'use strict';
 const tr={
 zh:{title:'驱虫记录',hint:'按宠物独立保存驱虫品牌、日期和下次提醒',add:'新增驱虫记录',brand:'驱虫品牌／产品',kind:'驱虫类型',external:'体外驱虫',internal:'体内驱虫',both:'体内外驱虫',performed:'驱虫日期',next:'下次提醒日期',note:'备注（选填）',save:'保存记录',cancel:'取消编辑',edit:'编辑',remove:'删除',confirm:'确认删除这条驱虫记录吗？',none:'还没有驱虫记录',nextDue:'下次驱虫提醒',due:'已到提醒日期',soon:'即将到期',record:'记录',done:'记录已保存',error:'请填写品牌及有效日期。下次提醒不得早于驱虫日期。',care:'按体重选择对应规格，用量以产品包装为准。',demo:'以下为该宠物的示例驱虫记录，请根据真实使用情况编辑',weight:'使用时体重',dose:'用量记录（选填）',weightBand:'体重区间',days:'天后',invalid:'请选择记录',reminder:'驱虫提醒'},
 zht:{title:'驅蟲紀錄',hint:'依每隻寵物分開儲存驅蟲品牌、日期及下次提醒',add:'新增驅蟲紀錄',brand:'驅蟲品牌／產品',kind:'驅蟲類型',external:'體外驅蟲',internal:'體內驅蟲',both:'體內外驅蟲',performed:'驅蟲日期',next:'下次提醒日期',note:'備註（選填）',save:'儲存紀錄',cancel:'取消編輯',edit:'編輯',remove:'刪除',confirm:'確定刪除這筆驅蟲紀錄嗎？',none:'尚無驅蟲紀錄',nextDue:'下次驅蟲提醒',due:'已到提醒日期',soon:'即將到期',record:'紀錄',done:'紀錄已儲存',error:'請填寫品牌及有效日期。下次提醒不可早於驅蟲日期。',care:'依體重選擇相應規格，使用量以產品包裝標示為準。',demo:'以下是這隻寵物的示例驅蟲紀錄，請依實際情況編輯',weight:'使用時體重',dose:'使用量紀錄（選填）',weightBand:'體重區間',days:'天後',invalid:'請選擇紀錄',reminder:'驅蟲提醒'},
 en:{title:'Deworming records',hint:'Track products, treatment dates and reminders for each pet',add:'Add deworming record',brand:'Brand / product',kind:'Treatment type',external:'External parasite',internal:'Internal parasite',both:'Internal & external',performed:'Treatment date',next:'Next reminder date',note:'Notes (optional)',save:'Save record',cancel:'Cancel',edit:'Edit',remove:'Delete',confirm:'Delete this deworming record?',none:'No deworming records yet',nextDue:'Next parasite-care reminder',due:'Reminder due',soon:'Coming up',record:'Record',done:'Record saved',error:'Enter a brand and valid dates. The reminder cannot precede treatment.',care:'Choose the weight-appropriate product size; follow the package directions.',demo:'These are pet-specific demonstration records. Edit them to match actual treatments.',weight:'Weight at treatment',dose:'Dose used (optional)',weightBand:'Weight range',days:'days away',invalid:'Choose a record',reminder:'Parasite-care reminder'},
 ko:{title:'구충 기록',hint:'반려동물별 제품, 사용 날짜와 다음 알림 기록',add:'구충 기록 추가',brand:'구충 제품 / 브랜드',kind:'구충 유형',external:'외부 기생충',internal:'내부 기생충',both:'내·외부 기생충',performed:'사용 날짜',next:'다음 알림 날짜',note:'메모(선택)',save:'기록 저장',cancel:'취소',edit:'수정',remove:'삭제',confirm:'이 구충 기록을 삭제할까요?',none:'아직 구충 기록이 없습니다',nextDue:'다음 구충 알림',due:'알림 날짜가 되었습니다',soon:'곧 예정',record:'기록',done:'저장했습니다',error:'제품명과 올바른 날짜를 입력하세요. 다음 알림은 사용일보다 빠를 수 없습니다.',care:'체중에 맞는 규격을 선택하고 제품 포장 지침을 따르세요.',demo:'아래는 반려동물별 예시 기록입니다. 실제 사용 내역에 맞게 수정해 주세요.',weight:'구충 당시 체중',dose:'사용량(선택)',weightBand:'체중 범위',days:'일 후',invalid:'기록을 선택하세요',reminder:'구충 알림'},
 ja:{title:'駆虫記録',hint:'ペット別に製品・使用日・次回通知を管理',add:'駆虫記録を追加',brand:'製品名・ブランド',kind:'駆虫の種類',external:'外部寄生虫',internal:'内部寄生虫',both:'内外寄生虫',performed:'使用日',next:'次回通知日',note:'メモ（任意）',save:'記録を保存',cancel:'キャンセル',edit:'編集',remove:'削除',confirm:'この駆虫記録を削除しますか？',none:'駆虫記録はありません',nextDue:'次回駆虫通知',due:'通知日です',soon:'まもなく',record:'記録',done:'保存しました',error:'製品名と正しい日付を入力してください。通知日は使用日以降です。',care:'体重に合う製品を選び、製品表示に従ってください。',demo:'ペット別のデモ記録です。実際の記録に合わせて編集してください。',weight:'使用時の体重',dose:'使用量（任意）',weightBand:'体重区分',days:'日後',invalid:'記録を選択',reminder:'駆虫通知'}
 };
 const dogBrand=['NexGard Spectra','Simparica Trio','Bravecto','Drontal Plus','Advocate for Dogs'];
 const catBrand=['Revolution Plus','Broadline','Profender','Advocate for Cats','Stronghold Plus'];
 const presetDays=[-33,-47,-61,-14,-22,-38,-28,-52,-43,-19,-12,-41,-29,-54,-35];
 const remindOffsets=[59,72,38,33,64,83,46,78,51,36,67,52,75,35,81];
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function dict(){return tr[(typeof state!=='undefined'&&state.lang)||'en']||tr.en;}
 function isoDay(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
 function shiftDays(x,n){const d=new Date(`${x}T12:00:00`);d.setDate(d.getDate()+n);return isoDay(d)}
 function today(){return isoDay(new Date());}
 function rows(){
  state.dewormByPet??={};const petKey=String(state.dog);
  if(!(petKey in state.dewormByPet)){
   let initial=[];const idx=Number(state.dog);
   if(Number.isInteger(idx)&&idx>=0&&idx<15&&typeof dogs!=='undefined'&&dogs[idx]){
    const cat=dogs[idx].species==='cat',b=cat?catBrand:dogBrand,d=shiftDays(today(),presetDays[idx]),next=shiftDays(d,remindOffsets[idx]);
    initial=[{id:`demo-deworm-${idx}`,brand:b[idx%5],kind:['both','internal','external'][idx%3],date:d,nextDate:next,weightKg:Number(dogs[idx].weight)||null,dose:'',note:'',sample:true}];
   }
   state.dewormByPet[petKey]=initial;
  }
  return state.dewormByPet[petKey];
 }
 function next(){return rows().filter(x=>x.nextDate).slice().sort((a,b)=>a.nextDate.localeCompare(b.nextDate))[0]||null}
 function label(kind){const d=dict();return d[kind]||d.both}
 function band(weight){const n=Number(weight);if(!Number.isFinite(n)||n<=0)return '—';return n<5?'<5 kg':n<10?'5–<10 kg':n<20?'10–<20 kg':n<40?'20–<40 kg':'≥40 kg';}

 function summary(){const r=next(),d=dict();if(!r)return d.none;return `${r.nextDate} · ${esc(r.brand)}${r.nextDate<=today()?' · '+d.due:''}`}
 function page(){
  const d=dict(),p=currentDog(),list=rows().slice().sort((a,b)=>b.date.localeCompare(a.date));
  const edit=state.dpWormEditId?rows().find(x=>x.id===state.dpWormEditId):null;
  const card=list.length?list.map(x=>`<article class="dp-worm-record"><div class="dp-worm-record-head"><b>${esc(x.brand)}</b><span>${esc(label(x.kind))}</span></div><div>${d.performed}: <b>${esc(x.date)}</b></div><div>${d.next}: <b>${esc(x.nextDate)}</b></div>${Number(x.weightKg)>0?`<div>${d.weight}: <b>${esc(Number(x.weightKg))} kg</b> · ${d.weightBand}: ${band(x.weightKg)}</div>`:''}${x.dose?`<div>${d.dose}: <b>${esc(x.dose)}</b></div>`:''}${x.note?`<p>${esc(x.note)}</p>`:''}<div class="dp-worm-record-buttons"><button type="button" data-action="deworm-edit" data-id="${esc(x.id)}">${d.edit}</button><button type="button" data-action="deworm-delete" data-id="${esc(x.id)}">${d.remove}</button></div></article>`).join(''):`<div class="dp-worm-empty">${d.none}</div>`;
  return `<section class="dp-worm-page"><div class="dp-worm-next"><span>🛡️</span><div><small>${d.nextDue}</small><strong>${summary()}</strong></div></div><p class="dp-worm-note">${d.care}</p>${Number(state.dog)<15?`<p class="dp-worm-demo">${d.demo}</p>`:''}<div class="dp-worm-list">${card}</div><form id="dp-worm-form" class="dp-worm-form"><h3>${edit?d.edit:d.add}</h3><label>${d.brand}<input name="brand" maxlength="90" required value="${esc(edit?.brand||'')}" placeholder="${d.brand}"></label><label>${d.kind}<select name="kind"><option value="both" ${edit?.kind==='both'?'selected':''}>${d.both}</option><option value="external" ${edit?.kind==='external'?'selected':''}>${d.external}</option><option value="internal" ${edit?.kind==='internal'?'selected':''}>${d.internal}</option></select></label><div class="dp-worm-dates"><label>${d.performed}<input name="date" type="date" required value="${esc(edit?.date||today())}"></label><label>${d.next}<input name="nextDate" type="date" required value="${esc(edit?.nextDate||shiftDays(today(),30))}"></label></div><div class="dp-worm-weight-fields"><label>${d.weight} · kg<input name="weightKg" type="number" inputmode="decimal" step="0.1" min="0.1" max="150" required value="${esc(edit?.weightKg??p.weight??'')}"></label><label>${d.dose}<input name="dose" type="text" maxlength="80" value="${esc(edit?.dose||'')}"></label></div><label>${d.note}<textarea name="note" maxlength="300" rows="2">${esc(edit?.note||'')}</textarea></label><small>${d.weightBand}: ${band(edit?.weightKg??p.weight)} · ${d.care}</small><div class="dp-worm-buttons"><button class="dp-worm-submit" type="submit">${d.save}</button>${edit?`<button type="button" data-action="deworm-cancel">${d.cancel}</button>`:''}</div></form></section>`;
 }
 function saveFromForm(form){const d=dict(),fd=new FormData(form);const brand=String(fd.get('brand')||'').trim(),kind=String(fd.get('kind')||'both'),date=String(fd.get('date')||''),nextDate=String(fd.get('nextDate')||''),note=String(fd.get('note')||'').trim(),weightKg=Number(fd.get('weightKg')),dose=String(fd.get('dose')||'').trim();if(!Number.isFinite(weightKg)||weightKg<=0||weightKg>150||!brand||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{4}-\d{2}-\d{2}$/.test(nextDate)||nextDate<date){alert(d.error);return false;}
  const r=rows(),ex=r.find(x=>x.id===state.dpWormEditId);const obj={id:ex?.id||`deworm-${Date.now()}-${Math.floor(Math.random()*10000)}`,brand,kind,date,nextDate,weightKg,dose,note,sample:false};if(ex)Object.assign(ex,obj);else r.push(obj);state.dpWormEditId=null;persist();render(true);return true;
 }
 window.dpWormRows=rows;window.dpWormPage=page;window.dpWormSummary=summary;window.dpWormNext=next;window.dpWormLocale=()=>dict();window.dpWormSave=saveFromForm;
 document.addEventListener('submit',e=>{if(e.target?.id!=='dp-worm-form')return;e.preventDefault();saveFromForm(e.target);},true);
})();
