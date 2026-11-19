/* DeepPet V9.24: transparent score lineage and first-visit experience.
 * UI-only scores are derived from immutable daily engine output; no visual score overrides.
 */
(function(root){'use strict';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const esc24=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const txt=(z,e,k,j)=>state.lang==='en'?e:state.lang==='ko'?k:state.lang==='ja'?(j||e):z;
const round=x=>finite(x)?Math.round(x):null;
const priorTour=tourContent;
tourContent=function(){
 if(!(selectedBlank()||dp58FreshPet()||isFreePet()))return priorTour();
 const n=Math.max(0,Math.min(2,state.tourStep||0));
 const pages=[
  {image:'assets/onboarding/approved_exact_images/page_01.webp',title:txt('先知道牠今天的狀態','Understand today’s health','오늘의 상태 알기'),desc:txt('DeepPet 把心跳、呼吸、休息及精力整合成容易看懂的每日結果，並提示值得留意的變化。','Heart rate, breathing, rest and energy become simple daily insights.','심박수, 호흡, 휴식, 활동을 쉬운 결과로 보여줍니다.')},
  {image:'assets/onboarding/approved_exact_images/page_03.webp',title:txt('沒有項圈，也能開始管理','Start care without a collar','목걸이 없이 건강 관리'),desc:txt('建立寵物檔案後，可記錄飲食、用藥、疫苗、驅蟲和體檢。計畫只顯示完成情況，不影響生理評分。','Track food, medication, vaccines, deworming and exam records for free.','식단·복약·예방접종·건강검진을 기록합니다.')},
  {image:'assets/onboarding/approved_exact_images/page_02.webp',title:txt('配對項圈，開始觀察長期變化','Connect a collar to see trends','목걸이 연결로 추세 보기'),desc:txt('透過 20Hz 心搏、呼吸與動靜感測，累積有效數據後觀察趨勢；首次心跳時刻另有 60 秒量測入口。','With a collar, supported 20Hz signals help reveal trends. The first Heart Moment has a separate 60-second reading.','목걸이의 20Hz 센서로 건강 추세를 볼 수 있습니다.')}
 ];const p=pages[n];
 return `<section class="dp924-tour-modal"><div class="dp924-tour-head"><small>${txt('60 秒認識 DeepPet','DeepPet in 60 seconds','DeepPet 60초 소개')} · ${n+1}/3</small><div class="dp924-tour-meter">${[0,1,2].map(i=>`<span class="${i<=n?'on':''}"></span>`).join('')}</div></div><div class="dp924-tour-visual"><img src="${p.image}" alt=""/></div><h2>${p.title}</h2><p>${p.desc}</p><div class="dp924-tour-actions"><button class="care-outline" data-action="tour-back" ${n===0?'disabled':''}>${txt('上一步','Back','뒤로')}</button><button class="cta full" data-action="${n===2?'tour-enter':'tour-next'}">${n===2?txt('開始使用','Get started','시작하기'):txt('繼續了解','Continue','계속')}</button></div></section>`;
};
const beforeModal=modalUI;
modalUI=function(){
 let html=beforeModal();
 if(state.modal!=='show-summary')return html;
 const day=root.DeepPetSignalScoring?.getDaily(state.dog)?.find(x=>x?.date===iso(localDate())),s=day?.scoreLineage;
 if(!s||![s.cardio,s.sleep,s.activityRecovery,s.sensorComposite,s.final].every(finite))return html;
 const weighted=round(.42*s.cardio+.30*s.sleep+.28*s.activityRecovery);
 // The final score legitimately differs from a plain weighted average when a
 // mandatory low-scoring domain or a verified event sets a display ceiling.
 const gate=root.DeepPetScoreIntegrity;
 const guarded=gate?.riskGuard?.(weighted,[s.cardio,s.sleep,s.activityRecovery])??weighted;
 const eventCeiling=finite(s.eventLimit)?s.eventLimit:100;
 const expectedFinal=Math.min(guarded,eventCeiling);
 const mismatch=guarded!==s.sensorComposite||expectedFinal!==s.final;
 let parts=`<h3>${txt('今日身體狀態怎樣計算？','How today’s body score is calculated','오늘 신체 점수 계산')}</h3><p><b>${txt('當日三項生理結果','Today’s three sensor areas','오늘의 세 가지 신체 점수')}</b>：${s.cardio} × 42% + ${s.sleep} × 30% + ${s.activityRecovery} × 28% = <b>${weighted}</b></p>`;
 const measured=root.DeepPetSignalScoring?.getFeatures?.(state.dog)?.find(x=>x?.date===day.date);
 const live=day.source==='20hz-waveform'||measured?.source==='20hz-waveform';
 const minutes=live&&finite(measured?.quality?.observedSeconds)?Math.round(measured.quality.observedSeconds/60):null;
 const origin=live?txt('已通過品質條件的項圈讀數','Quality-checked collar data','품질 확인된 목걸이 데이터','品質確認済みの首輪記録'):
  txt('展示案例資料，不是真實佩戴讀數','Showroom sample, not a live collar reading','전시용 예시 데이터이며 실제 측정이 아닙니다','展示例であり実測値ではありません');
 parts+=`<p class="dp105-score-lineage-meta"><b>${txt('資料日期','Reading date','기록 날짜','記録日')}：</b><time datetime="${esc24(day.date)}">${esc24(day.date)}</time> · ${origin}${minutes!==null?` · ${minutes} ${txt('分鐘有效觀測','valid observed minutes','분 유효 측정','分の有効観測')}`:''}</p>`;
 const prior=day.baseline?.priorValidWear;
 if(Number.isFinite(prior))parts+=`<p class="dp105-score-lineage-meta">${txt('今日個體參考：此前近45日','Pet-specific reference before this date, within 45 days:','오늘 이전 45일 반려동물 자체 기준:','本日以前45日間の個体基準：')} <b>${Math.min(prior,14)}/14</b> ${txt('個有效佩戴日','valid wear days','유효 착용일','有効装着日')}${prior<14?` · ${txt('仍在建立，不能當成完整個體基準','still building; not a complete this pet’s baseline','반려동물 자체 기준을 구축 중입니다','個体基準の作成中')}`:''}</p>`;
 if(guarded<weighted)parts+=`<p>${txt('因必要生理項目較低，綜合分依原有保護規則調整為','The required-domain guard sets the composite at','필수 영역의 하한 기준으로 종합 점수를 조정했습니다:','重要な項目の低い値に合わせて総合点の上限を調整：')} <b>${guarded}/100</b></p>`;
 // The scoring guard remains active; acute event explanations live under
 // 应急提醒 rather than adding another heart/breath alert to 今日总结.
 parts+=`<p>${txt('體檢報告不參與今日身體狀態或今日身體節奏。長期趨勢及體檢結果會在「我的 → Pet Wellness Model」合併分析。','Examinations never change daily scores. Long-term findings belong to Me → Pet Wellness Model.','검진은 당일 점수에 반영되지 않으며 장기 모델에서 확인합니다.')}</p>`;
 parts+=`<p class="dp924-equation-final">${txt('今日身體狀態','Today’s body score','오늘 신체 점수')}：${s.final} / 100</p>`;
 if(mismatch)parts+=`<p class="dp924-equation-warning">${txt('分數正在重新核對，請重新開啟頁面。','Rechecking score; please reopen.','점수를 재확인해 주세요.')}</p>`;
 const equation=`<section class="dp924-score-equation" data-dp924-audit="${mismatch?'mismatch':'consistent'}">${parts}</section>`;
 return html.replace('<div class="summary-three-rings">',equation+'<div class="summary-three-rings">');
};
// Expose only deterministic audit fields to the QA suite; not an extra consumer metric.
root.DeepPetQA924={lineage(pet=state.dog){return (root.DeepPetSignalScoring?.getDaily(pet)||[]).filter(Boolean).map(day=>{
 const s=day.scoreLineage||{};const c=[s.cardio,s.sleep,s.activityRecovery].every(finite)?round(.42*s.cardio+.30*s.sleep+.28*s.activityRecovery):null;
 const blend=c;
 return {date:day.date,cardio:s.cardio,sleep:s.sleep,activityRecovery:s.activityRecovery,sensor:c,reported:s.sensorComposite,reportScore:s.examScore,reportWeight:0,afterExam:s.afterExam,final:s.final,expected:c,rhythm:day.scores?.rhythm,calm:day.scores?.calm,stable:day.scores?.stable};
 });}};
})(window);
