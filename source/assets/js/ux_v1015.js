/* DeepPet V10.15 — pet-scoped evidence provenance and final display gate. */
(function(root){'use strict';
 const L=(tw,cn,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'?cn:tw;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const F=root.DeepPetMetric1015;
 const now=()=>typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):new Date().toISOString().slice(0,10);
 const validPet=pet=>Number.isInteger(pet)&&pet>=0&&typeof allPets==='function'&&!!allPets()[pet];
 const noHealthPet=pet=>{
  const item=typeof allPets==='function'?allPets()[pet]:null;
  const profile={...item,...(state.petOverrides?.[pet]||{})};
  if(profile.dpFreshPet||profile.freeCare)return true;
  return pet===state.dog&&(
   (typeof selectedBlank==='function'&&selectedBlank())||
   (typeof dp58FreshPet==='function'&&dp58FreshPet())||
   (typeof isFreePet==='function'&&isFreePet()));
 };

 // No stored derived state: each invocation fetches this exact pet's data.
 // Showroom fixtures and real 20Hz accepted recordings remain distinguished.
 function snapshot(pet=state.dog,days=30){
  if(!validPet(pet)||noHealthPet(pet))return Object.freeze({petId:String(pet),available:false,reason:'no-accepted-sensor-evidence',validDays:0,periodDays:days,modelVersion:'wellness-v925'});
  if(![1,7,14,30].includes(days))throw new RangeError('Unsupported evidence period');
  const sourceData=root.DeepPetTrust1013?.evidence?.(days,pet);
  const result=root.DeepPetAudit925?.model?.(pet);
  if(!sourceData||sourceData.pet!==pet)return Object.freeze({petId:String(pet),available:false,reason:'evidence-source-unavailable',validDays:0,periodDays:days,modelVersion:'wellness-v925'});
  const real=typeof dpUsesRealMeasurements==='function'&&dpUsesRealMeasurements(pet);
  const rows=sourceData.accepted||[];
  const source=real?'verified-20hz-waveform':'showcase-fixture';
  const ageYears=typeof result?.ageYears==='number'&&Number.isFinite(result.ageYears)?result.ageYears:null;
  const score=typeof result?.score==='number'&&Number.isFinite(result.score)?result.score:null;
  const ageValid=ageYears!==null;
  return Object.freeze({
   petId:String(pet),periodDays:days,periodStart:sourceData.start,periodEnd:sourceData.date,
   latestValidDate:sourceData.latest||null,validDays:rows.length,
   source,modelVersion:'wellness-v925',displayVersion:'10.15',
   score,ageYears,available:Boolean(result?.available)&&score!==null&&ageValid,
   stale:Boolean(result?.stale),reportDate:result?.reportDate||null,
   acceptedDates:Object.freeze(rows.map(r=>r.date)),
   qualityPolicy:real?'verified-wear-and-pet-ownership':'showcase-daily-quality',
   computedFor:now(),
  });
 }

 function evidenceDetails(data){
  const source=data.source==='verified-20hz-waveform'?L('已驗證佩戴的20Hz量測','已验证佩戴的20Hz测量','Verified 20Hz collar readings','装着確認済み20Hz測定','착용 검증된 20Hz 측정'):
   L('預置健康紀錄樣本','预置健康记录样本','Preloaded sample health records','事前登録の健康記録サンプル','기본 제공 건강 기록 샘플');
  const latest=data.latestValidDate||L('尚無有效日期','尚无有效日期','No valid date yet','有効日なし','유효 날짜 없음');
  const basis=data.validDays===0?L('資料不足，無法形成長期結論','数据不足，无法形成长期结论','Insufficient evidence for a long-term conclusion','長期評価にはデータ不足','장기 판단을 위한 데이터 부족'):
   `${data.validDays}/${data.periodDays} ${L('個有效評分日','个有效评分日','valid scored days','有効スコア日','유효 점수 일수')}`;
  const stamp=L('資料截至','资料截至','Data through','記録更新','기록 기준');
  const dataNotes=data.stale?L('近期缺少新測量；請重新配戴項圈以更新分析。','近期缺少新测量；请重新佩戴项圈以更新分析。','No recent readings; reconnect the collar to update this analysis.','最近の測定がありません。再測定してください。','최근 측정이 없습니다. 다시 측정하세요.'):
   L('數值僅供長期健康觀察，不代表疾病診斷。','数值仅供长期健康观察，不代表疾病诊断。','For wellness tracking only, not a diagnosis.','健康記録の参考情報であり診断ではありません。','건강 추적용 정보이며 진단이 아닙니다.');
  return `<details class="dp1015-evidence-card" data-evidence-pet="${esc(data.petId)}" data-model-version="${esc(data.modelVersion)}"><summary>${esc(L('查看本次分析來源','查看本次分析来源','View sources of this analysis','今回の分析元を見る','이번 분석 출처 보기'))}<span aria-hidden="true">⌄</span></summary><div class="dp1015-evidence-content"><p>${esc(stamp)} ${esc(latest)} · ${esc(basis)}</p><p>${esc(L('資料來源','数据来源','Data source','データ元','자료 출처'))}：${esc(source)}</p><p>${esc(L('分析版本','分析版本','Analysis engine','分析バージョン','분석 버전'))}：${esc(data.modelVersion)} · ${esc(L('資料期間','数据期间','Date window','対象期間','날짜 범위'))}：${esc(data.periodStart)} – ${esc(data.periodEnd)}</p>${data.reportDate?`<p>${esc(L('參考體檢日期','参考体检日期','Relevant checkup','参考検診日','참고 검진일'))}：${esc(data.reportDate)}</p>`:''}<p>${esc(dataNotes)}</p></div></details>`;
 }

 const priorRender=render;
 render=function(reset=false){
  priorRender(reset);
  const app=document.getElementById('app');if(!app)return;
  const target=app.querySelector('.dp928-wellness-page .dp928-model-card');
  if(target&&state.tab==='me'&&state.detail==='age-detail'){
   const data=snapshot(state.dog,30);
   if(data.periodStart&&!app.querySelector('.dp1015-evidence-card'))target.insertAdjacentHTML('afterend',evidenceDetails(data));
  }
  // Both Home and analysis derive precision from the same registry after all
  // legacy wrappers have finished rendering. Null stays an unavailable value.
  const age=app.querySelectorAll('.dp928-model-card .dp928-age-metric strong');
  if(age.length){const estimate=noHealthPet(state.dog)?null:root.DeepPetAudit925?.model?.(state.dog)?.ageYears;
   for(const element of age)element.textContent=F.format('age',estimate);
  }
  const scoreEvidence=app.querySelectorAll('.dp1013-score-evidence');
  if(scoreEvidence.length){const dates=snapshot(state.dog,7);
   for(const element of scoreEvidence){
    element.dataset.evidencePet=dates.petId;
    element.dataset.evidenceDates=dates.acceptedDates?.join(',')||'';
    element.dataset.evidenceSource=dates.source||'unavailable';
    element.dataset.modelVersion=dates.modelVersion;
   }
  }
  app.querySelectorAll('.app-build-version').forEach(element=>element.textContent='DeepPet · Version 10.15');
 };
 root.DeepPetEvidence1015=Object.freeze({version:'10.15',snapshot,evidenceDetails});
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.15',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'central-metric-precision-contract','pet-scoped-evidence-snapshot','analysis-evidence-provenance','cross-pet-cross-page-regression']};
})(window);
