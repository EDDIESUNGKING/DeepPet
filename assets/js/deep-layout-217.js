/* V10.217: final presentation adapter. No score, date or waveform changes. */
(function(){'use strict';
const Q=(e,s)=>e?.querySelector(s), A=(e,s)=>Array.from(e?.querySelectorAll(s)||[]);
const primary='.dp903-overview-head,.dp-owner-sleep .dp-owner-status-heading,.dp905-sleep-summary .dp905-sleep-head,.dp901-overall-head';
const rail='.dp903-score-col,.dp901-score-col,.dp1042-score-stack,.dp1054-sleep-meter,.dp90-unavailable';
const duplicate='.dp1040-status,.dp903-grade,.dp901-score-tag,.dp75-risk,.dp69-grade';
function compact(){
 const app=Q(document,'#app'),main=Q(app,'.app-main');if(!main)return;
 // Replace long repeated notices with one short, visible provenance chip.
 const notes=A(app,'[data-dp-investor-disclosure],[data-lafa-source]');
 if(notes.length){const chip=notes[0];for(const n of notes.slice(1))n.remove();chip.className='dp217-source-chip';chip.removeAttribute('style');chip.textContent=({zht:'含示例資料',zh:'含示例数据',en:'Includes sample data',ko:'예시 데이터 포함'})[state.lang]||'Includes sample data';chip.title=({zht:'部分紀錄為合成或歷史樣本輪替，非當日實測。',zh:'部分记录为合成或历史样本轮替，非当日实测。',en:'Some records are generated or replayed, not new measurements.',ko:'일부 기록은 생성 또는 재사용 표본이며 당일 실측값이 아닙니다.'})[state.lang]||'Some records are generated or replayed, not new measurements.';const host=Q(main,'.pet-top-strip-wrap');if(host)host.after(chip);else main.prepend(chip);}
 if(state.tab!=='deep'||state.detail)return;
 const deep=Q(main,'.dp-owner-deep');if(!deep)return;
 for(const head of A(deep,primary)){
   const title=Q(head,'h2'),score=Q(head,rail)||Q(head,'.dp-status-score,.dp903-no-score');if(!title||!score)continue;
   head.classList.add('dp217-primary');title.parentElement.classList.add('dp217-title');score.classList.add('dp217-primary-score');
   for(const tag of A(score,duplicate))tag.remove();
   const parent=head.parentElement, key=['cardio','sleep','activityRecovery'][Number(state.deepType)];const guidance=Q(parent,`:scope > [data-dp215-metric="${key}"]`);if(guidance)head.after(guidance);
   // Centre the existing headline in the energy overview, without inventing new content.
   if(key==='activityRecovery'){
     let sub=Q(head,'.dp901-period-notes,.dp901-overall-desc');if(!sub){sub=document.createElement('p');sub.className='dp217-energy-caption';sub.textContent=({zht:'綜合精力、活動後恢復及放鬆與平穩度。',zh:'综合精力、活动后恢复及放松与平稳度。',en:'Overall energy, post-activity recovery and calmness.',ko:'활력, 활동 후 회복 및 안정도를 종합합니다.'})[state.lang]||'Overall energy, post-activity recovery and calmness.';title.after(sub);}sub.classList.add('dp217-energy-caption');}
 }
 for(const card of A(deep,'.dp903-metric-card,.dp901-metric-card')){
   const copy=Q(card,'.dp903-metric-left,.dp901-card-copy'),score=Q(card,rail);if(!copy||!score)continue;
   const guide=Q(card,':scope > .dp215-guidance');const title=Q(copy,'h3');for(const tag of A(score,duplicate))tag.remove();
   if(guide&&title){title.after(guide);card.classList.add('dp217-child');}
 }
}
const old=render;render=function(...args){const r=old.apply(this,args);try{compact();}catch(e){console.error('V10.221 layout',e);}return r;};render(false);
})();
