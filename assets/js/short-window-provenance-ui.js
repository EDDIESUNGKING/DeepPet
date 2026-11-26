/* DeepPet V10.139: annotate scores in the EXISTING card structures only.
   Existing navigation, Home, Health, other pets' datasets and core UI builders untouched. */
(function(root){'use strict';
const calc=root.DeepPetMiloAdaptiveScores;if(!calc||typeof render!=='function')return;
const $=(sel,scope=document)=>scope?.querySelector(sel), $$=(sel,scope=document)=>[...(scope?.querySelectorAll(sel)||[])];
const isMilo=()=>state.dog===0&&!state.emptyPreview&&!(typeof selectedBlank==='function'&&selectedBlank());
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const lang=()=>state.lang||'zh';
const L=(zh,en,ja,ko)=>lang()==='en'?en:lang()==='ja'?ja:lang()==='ko'?ko:lang()==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const date=s=>String(s||'').replaceAll('-','/');
const shortTime=s=>s?date(s.slice(0,10))+' '+s.slice(11,16):'—';
// Keep YYYY/MM/DD once for a same-day interval. For a cross-midnight
// interval in the same year, keep the year once but retain both day labels.
const timeSpan=(a,b)=>{if(!a||!b)return '—';
 const ad=a.slice(0,10),bd=b.slice(0,10),at=a.slice(11,16),bt=b.slice(11,16);
 if(ad===bd)return shortTime(a)+(at===bt?'':'–'+bt);
 return shortTime(a)+'–'+(ad.slice(0,4)===bd.slice(0,4)?date(bd.slice(5))+' '+bt:shortTime(b));
};
const selected=()=>/^\d{4}-\d{2}-\d{2}$/.test(state.deepSelectedDate||'')?state.deepSelectedDate:calc.dates.at(-1);
function coverageText(v,compact=false){
 const c=v?.coverage;
 if(!c?.start||!c?.end)return L('尚未取得可核實的量測起迄','No verified measurement window','確認できる測定時間がありません','확인된 측정 시간이 없습니다');
 const seg=c.segments||[],more=seg.length>1;
 // Do not imply uninterrupted wearing across missing intervals.
 const multi=seg.length>=2&&seg.length<=3;
 const sameDay=multi&&seg.every(x=>x.start.slice(0,10)===seg[0].start.slice(0,10)&&x.end.slice(0,10)===seg[0].start.slice(0,10));
 const s=sameDay?date(seg[0].start.slice(0,10))+' '+seg.map(x=>{
  const a=x.start.slice(11,16),b=x.end.slice(11,16);return a===b?a:a+'–'+b;
 }).join('、'):multi?seg.map(x=>timeSpan(x.start,x.end)).join('；'):timeSpan(c.start,c.end);
 const days=v.fallback&&!compact?L('沿用最近一次合格紀錄 · ','Latest qualified window · ','直近の有効記録 · ','최근 유효 기록 · '):'';
 const suffix=!compact&&finite(c.observedMin)?L(`；有效觀測約 ${Math.round(c.observedMin)} 分鐘${more?'（含中斷）':''}`,`; ${Math.round(c.observedMin)} observed min${more?' (with gaps)':''}`,`；有効約${Math.round(c.observedMin)}分`, `; 유효 관측 약 ${Math.round(c.observedMin)}분`):'';
 return days+s+suffix;
}
function qualityText(v){
 if(v?.level==='missing-reference')return L('已有實測特徵及時間，但未找到適用且已驗證的群體健康評分基準；不可提前使用個體比較。','Measured features exist, but no applicable verified group scoring reference; LAFA personal baseline remains locked.','有効なグループ基準がなく、個体基準は未確立です。','검증된 집단 기준이 없으며 개체 기준은 아직 사용할 수 없습니다.');
 if(!finite(v?.score))return L('尚未通過此項的量測品質條件','Insufficient quality for this metric','この項目の品質条件を未達成','이 항목의 품질 조건 미충족');
 if(Number.isInteger(v.scoredDays))return L(`有分數 ${v.scoredDays}/${v.requiredDays} 日；達觀測門檻 ${v.fullEvidenceDays} 日；部分觀測或估算 ${v.partialEvidenceDays} 日。`,`Scored ${v.scoredDays}/${v.requiredDays} days; ${v.fullEvidenceDays} meet coverage criteria, ${v.partialEvidenceDays} partial or estimated.`,`記録 ${v.scoredDays}/${v.requiredDays} 日・十分な観測 ${v.fullEvidenceDays} 日・部分推定 ${v.partialEvidenceDays} 日`,`점수 ${v.scoredDays}/${v.requiredDays}일 · 충분한 관측 ${v.fullEvidenceDays}일 · 부분 추정 ${v.partialEvidenceDays}일`);
 if(v.level==='group-reference')return L('14 天基準建立前：同體型成年犬安靜狀態群體參考；非獸醫診斷。','Before 14 valid days: matched adult-large-dog quiet-state group reference, not diagnosis.','14日未満：集団基準による参考比較です。','14일 전: 유사 체형 집단 기준 참고값입니다.');
 if(v.level==='blended-reference')return L('14 個先前有效日後：依合格天數調整個體參數，保留群體安全範圍。','After 14 prior valid days: personalize qualified parameters while preserving group safety bounds.','個体30%＋グループ70%の参考値です。','개체 30% + 집단 70% 참고값입니다.');
 if(v.level==='rest-estimate')return L('夜間安靜休息估計，並非 REM／深睡判定','Estimated night rest, not REM/deep sleep','夜間休息の推定（REM／深睡眠ではありません）','야간 휴식 추정값 (REM/깊은 수면 아님)');
 if(v.proxyComposite)return L('這些只是觀測代理，權重完整不代表健康指標已驗證','These are observational proxies, not validated health scores','個体内観測推定であり健康点は未検証','개체 내 관찰 대리점수이며 건강점수는 미검증');
 if(v.level==='proxy'||v.level==='motion-proxy'||v.level==='event-proxy')return L('依現有量測資料推算，僅作趨勢參考','Observational proxy score; not a validated health-risk score','観測代理スコア・検証中','관측 대리 점수 · 추가 검증 필요');
 if((v.level==='partial'||v.notFull)&&!finite(v.weight))return L('部分觀測或估算，僅反映有資料的時段。','Partial or estimated observations; only recorded intervals are represented.','部分観測または推定値です。','일부 관측 또는 추정값입니다.');
 if(v.level==='partial'||v.notFull)return L(`短時部分觀測分 · 已使用 ${(Math.round(100*(v.weight||0)))}% 有效項目權重`,`Partial short-window observation · ${(Math.round(100*(v.weight||0)))}% of available model weights`,`部分推定（使用重み${Math.round(100*(v.weight||0))}%）`,`일부 추정 · ${Math.round(100*(v.weight||0))}% 가중치`);
 return L('依量測資料計算；非獸醫診斷','Short-window observation score, not a veterinary diagnosis','短時間の参考推定であり診断ではありません','단시간 참고 추정값, 수의학 진단 아님');
}
function note(node,v,opts={}){
 if(!node)return;
 const before=node.querySelector(':scope > .dp-observation-note');if(before)before.remove();
 const p=document.createElement('p');p.className='dp-observation-note'+(opts.main?' dp-observation-main':'');
 const title=opts.periodLocked?L(`本期間尚無分數（${opts.periodLocked.qualifiedDays}/${opts.periodLocked.requiredDays} 日）`,`No scores: ${opts.periodLocked.qualifiedDays}/${opts.periodLocked.requiredDays} days`,`ロック中：${opts.periodLocked.qualifiedDays}/${opts.periodLocked.requiredDays}日`,`잠금: ${opts.periodLocked.qualifiedDays}/${opts.periodLocked.requiredDays}일`):
  L('量測依據：','Measured: ','測定期間：','측정 시각: ')+coverageText(v,!opts.main);
 p.innerHTML=`<span class="dp-observation-clock" aria-hidden="true">◷</span><span>${esc(title)}${opts.main?`<small> · ${esc(opts.periodLocked?L('目前沒有可計算的期間分數','No scored dates in this period','全ての有効日が必要です','해당 기간 모든 유효일이 필요합니다'):qualityText(v))}</small>`:''}</span>`;
 node.appendChild(p);
}
function paintCol(el,v,color){if(!el||!v)return;
 if(!finite(v.score)){el.classList.add('none');el.innerHTML='<span class="dp903-no-score">N/A</span>';return;}
 el.classList.remove('none');el.classList.add('dp-observation-scored');
 let circle=typeof dpDeepDottedScore==='function'?dpDeepDottedScore(v.score,color):`<strong>${v.score}</strong>`;
 el.innerHTML=circle+`<span class="dp-observation-grade">${L('分數','Score','点数','점수')}</span>`;
}
function sleepPaint(rootEl,value){if(!value)return;
 if(!finite(value.score)){const el=$('.dp-owner-status-heading .stat-bubble',rootEl);if(el){el.outerHTML=dpDeepDottedScore(null,'#52a97d').replace('<b>—</b><small>/100</small>','<b>N/A</b><small></small>');}const verdict=$('.dp-owner-status-heading .dp-heart-overall-verdict',rootEl);if(verdict)verdict.textContent=L('資料不足','Insufficient data','データ不足','데이터 부족');}
 if(!value?.coverage?.start)return;
 let bubble=$('.dp-owner-status-heading .stat-bubble',rootEl);
 if(bubble&&finite(value.score)&&typeof dpDeepDottedScore==='function'){bubble.outerHTML=dpDeepDottedScore(value.score,'#52a97d');}
 $$('.dp66-status-alert.dp66-risk-na,.dp1098-no-sleep-alert',rootEl).forEach(x=>x.remove());
 const status=$('.dp-owner-status-heading .dp-heart-overall-verdict',rootEl);if(status)status.textContent=finite(value.score)?L('全天睡眠休息','24-hour rest','一日の休息','24시간 휴식'):L('休息資料不足','Insufficient rest data','休息データ不足','휴식 데이터 부족');
 const facts=$$('.dp-owner-sleep-facts > div',rootEl);
 if(facts[0]&&finite(value.quietHours24)){const b=$('b',facts[0]);if(b)b.textContent=value.quietHours24.toFixed(1)+' h';const label=$('span',facts[0]);if(label)label.textContent=L('全天休息時間','Daily rest duration','一日の休息時間','하루 휴식 시간');}
 if(facts[1]&&finite(value.nightInterruptions)){const b=$('b',facts[1]);if(b)b.textContent=String(value.nightInterruptions);const label=$('span',facts[1]);if(label)label.textContent=L('動靜中斷候選','Movement interruption candidates','動きによる中断候補','움직임 중단 추정');}
 const lead=$('.dp1052-sleep-reason',rootEl);if(lead)lead.textContent=L('已取得全天部分心率、呼吸與動靜資料，可估計多段休息；分數是未校準的全天休息觀測指數，不能當作完整睡眠品質或 REM／深睡結果。','Calendar-day heart, breathing and motion are recorded. Quiet rest can be estimated, but the night-rest index uses unvalidated engineering targets; no REM/deep sleep classification.','夜間の心拍・呼吸・動静から休息を推定。','밤 시간의 심박·호흡·움직임으로 휴식을 추정합니다.');
  const originalNoNight=$$('.dp1098-no-sleep-alert,.dp-owner-status-summary,.dp-owner-status-intro',rootEl);if((value.nightHours||0)>0)for(const node of originalNoNight){if(/只有白天|沒有夜間|no night|daytime only|尚無有效睡眠/i.test(node.textContent||''))node.textContent=L('已有跨夜動靜、心率與呼吸資料；尚缺適用的通用睡眠健康評分基準。','Overnight motion, heart and breathing are recorded; a matched group sleep score reference is pending.','夜間記録がありますが集団基準は未検証です。','야간 기록이 있으나 집단 기준은 아직 미확인입니다.');}
 const diff=$('.dp-owner-sleep-difference',rootEl);
  if(diff)diff.textContent=L('本次為全天安靜休息估計，尚無可信的睡眠分期對照。','Estimated daily quiet rest; validated sleep-stage comparison unavailable.','夜間安静休息の推定値で、睡眠段階は未検証です。','야간 안정 휴식 추정값이며 수면 단계는 검증되지 않았습니다.');
 const timeline=$('.dp-owner-sleep-timeline',rootEl);
 if(timeline&&value.measuredDate){const model=calc.dayScores(value.measuredDate).unified.rest;let bar='';for(const bin of model.bins){bar+=`<span class="${!bin.valid?'missing':bin.rest?'rest':'move'}" title="${bin.i/2} h"></span>`;}timeline.innerHTML=`<div class="dp-observation-night-track">${bar}</div><div class="dp-observation-night-ends"><span>00:00</span><span>12:00</span><span>24:00</span></div><p>${L('全天觀測；缺測不補值。','Calendar-day observations; gaps unfilled.','一日の観測','하루 관측')}</p>`;
 }
}
function cardio(rootEl,n,d){const main=$('.dp903-overview',rootEl);if(!main)return;
 const v=calc.period(d,n,'cardio');paintCol($('.dp903-overview-head .dp903-score-col',main),v,'#cf6684');note($('.dp903-overview-copy',main),v,{main:true,periodLocked:n>1&&v.level==='locked'?v:null});
 if(n===1){const lastNote=$('.dp903-overview-copy',main);if(lastNote){for(const p of $$('.dp1139-readings-warning,.dp-owner-deep-coverage-warning',lastNote)){p.textContent=L('短時觀測分與完整日級健康分不同；缺測不補值，波形估算保留來源。','Observation score is not a full-day health score; missing values remain missing; waveform estimates retain provenance.','短期観測値は一日全体の健康点とは異なります。','단기 관측점수는 하루 건강점수와 다릅니다.');}}}
 if(n===1){const explain=$('.dp903-overview-copy>p:not(.dp-observation-note)',main);if(explain){const mode=calc.baselineStage(d);explain.textContent=mode.ready?L('滿14個先前有效日後，依合格資料調整個體心率、呼吸與作息參數；未驗證的HRV估算不入分。','After 14 prior valid days, adapt qualified personal vital and routine parameters; unverified HRV estimates are excluded.','14日以上の有効基準で比較します。','14일 유효 기준 후 개별 생리·휴식 매개변수를 조정합니다.'):L('14天個體基準建立中：只用適用的同物種、年齡與體型參考；沒有適用參考的項目只顯示原始量測，不拿兩三天歷史冒充基準。','The 14-day personal baseline is still building; use applicable species, age and size references only. No 2-day self-comparison.','14日未満は集団基準のみ使用します。','14일 전에는 적합한 집단 기준만 사용합니다.');}}
 for(const key of ['heart','breath','hrv','stable']){
  const card=$(`[data-dp903-metric="${key}"]`,main);if(!card)continue;
  const val=calc.period(d,n,key);paintCol($('.dp903-score-col',card),val,'#cf6684');
  note($('.dp903-metric-left',card),val,{periodLocked:n>1&&val.level==='locked'?val:null});
  const text=$('.dp903-metric-left>p:not(.dp-observation-note)',card);
  if(!text)continue;
  if(key==='hrv'){
   const research=n===1&&root.DeepPetMiloHrvResearch?.byDate?.[d];
   if(research){
    text.textContent=L(`原始BCG逐搏研究估計：RMSSD 約 ${research.rmssdMs} ms；5分鐘SDNN指數約 ${research.sdnnIndexMs} ms（合計 ${research.minutes} 分鐘）。逐搏有漏抓疑慮；未經原廠IBI／ECG驗證，僅作健康趨勢估算。`,`BCG research estimate: RMSSD ~${research.rmssdMs} ms, five-minute SDNN index ~${research.sdnnIndexMs} ms (${research.minutes} min). Missed beats possible; not OEM/ECG validated; included only as a wellness estimate.`,`BCG研究推定: RMSSD約${research.rmssdMs} ms、SDNN指標約${research.sdnnIndexMs} ms。心拍誤検出の可能性があり健康診断値ではありません。`,`BCG 연구 추정: RMSSD 약 ${research.rmssdMs}ms, SDNN 지수 약 ${research.sdnnIndexMs}ms. 검증되지 않은 참고값입니다.`);
    const left=$('.dp903-metric-left',card),heading=$('h3',left);
    if(heading){let reading=$('.milo-verified-value[data-lafa-hrv-research]',left);
      if(!reading){reading=document.createElement('span');reading.className='milo-verified-value';reading.setAttribute('data-lafa-hrv-research','');heading.insertAdjacentElement('afterend',reading);}
      reading.textContent=`RMSSD ≈ ${research.rmssdMs} ms · SDNN ≈ ${research.sdnnIndexMs} ms`;
    }
    // Reuse the original card (no visual-framework changes). Display the
    // existing numerical RESEARCH index with its actual non-contiguous
    // sample duration. Formal HRV health score remains null by design.
    const scoreCol=$('.dp903-score-col',card),valueCell=$('.dp903-no-score',scoreCol);
    if(valueCell){scoreCol.classList.remove('none');valueCell.textContent=finite(val.researchIndex)?
     `${val.researchIndex}（研究指數·累計${research.minutes}分鐘）`:`RMSSD ≈ ${research.rmssdMs} ms`;}
    const provenance=$('.dp913-provenance-note',card);
    if(provenance)provenance.textContent=L('BCG研究估算，未經原廠／ECG驗證，屬健康趨勢估算。','BCG research estimate, not OEM/ECG-validated or a health score.','BCG研究推定（未検証）。','BCG 연구 추정치이며 건강 점수가 아닙니다.');
   } else text.textContent=val.freshness==='stale'?L(`目前HRV已過期；最後合格讀數 ${val.lastRecordedAt?.slice(11,16)||'—'}，不代表現在狀態。`,
    `Current HRV expired; last verified reading at ${val.lastRecordedAt?.slice(11,16)||'—'}. Do not treat as live.`,
    'HRVは期限切れです。以前の測定値は現在を示しません。',
    'HRV 수치가 오래되었습니다. 이전 수치는 현재 상태가 아닙니다.'):
   val.freshness==='long-window-only'?L('只有最近的30／60分鐘平均趨勢，缺少當前合格的短時逐搏HRV；長時高分不可代表現在。',
    'Recent 30/60-min trend only; no verified current short-window HRV. Long averages are not live reassurance.',
    '長時間の傾向のみ。現在の短時間HRVは未確認です。',
    '장시간 추세만 있으며 현재 단기 HRV는 확인되지 않았습니다.'):
   finite(val.rmssd)&&finite(val.sdnn)?L(`RMSSD ${Math.round(val.rmssd)} ms，SDNN ${Math.round(val.sdnn)} ms（${val.mode==='historical'?'歷史紀錄':`近期${Math.round(val.coverage?.observedMin||0)}分鐘`}；${val.lastRecordedAt?.slice(11,16)||'—'}）。`,
    `RMSSD ${Math.round(val.rmssd)} ms, SDNN ${Math.round(val.sdnn)} ms (${val.mode==='historical'?'historical':'recent short window'}; ${val.lastRecordedAt?.slice(11,16)||'—'}).`,
    `RMSSD ${Math.round(val.rmssd)}ms · SDNN ${Math.round(val.sdnn)}ms（過去測定）`,
    `RMSSD ${Math.round(val.rmssd)}ms · SDNN ${Math.round(val.sdnn)}ms (과거 측정)`):
   (val.coverage?.observedMin>0?L('本日已有原始候選波形，但沒有合格的當前逐搏HRV；不以早先的高分代表現在。',
    'Waveform candidates exist but verified recent NN/IBI is unavailable; do not reuse old high scores.',
    '波形はありますが現在の検証済みHRVはありません。',
    '파형은 있으나 현재 검증된 HRV는 없습니다.'):
    L('所選日期沒有可核實的逐搏HRV；不引用其他日期的舊數值。',
    'No verified NN/IBI on this date; never borrow older scores.',
    '選択日に検証済みHRVがありません。',
    '선택한 날짜의 검증된 HRV가 없습니다.'));
  }
  else if(key==='stable')text.textContent=val.coverage?.observedMin>0?
   L('目前只有心率趨勢平穩度代理分，並非由逐搏間隔確認的心搏節奏穩定度。','Rate-trend steadiness proxy only, not verified beat-to-beat rhythm.','心拍数推移の参考値で、拍動間隔の評価ではありません。','심박수 추세 대리 점수로 박동 간격 검증은 아닙니다.'):
   L('所選日期沒有可用的心率趨勢，尚不能判定心搏節奏穩定度。','No heart-rate trend recorded on this date; beat-to-beat rhythm is unavailable.','選択日に心拍傾向がありません。','선택 날짜에 심박 추세 기록이 없습니다.');
  else if(finite(val.score)){const v2=calc.dayScores(val.measuredDate).vitals;
   const measured=key==='heart'?v2.hrMedian:v2.rrMedian;
   const formatted=finite(measured)?String(Math.round(measured*10)/10):'—';
   const headline=$('.milo-verified-value',card);
   if(headline)headline.textContent=formatted+(key==='heart'?' bpm':L(' 次／分',' /min',' 回／分',' 회/분'));
   const basis=calc.baselineStage(d).ready?L('依14天基準與適用群體參考比較。','Compared with established 14-day baseline and applicable group reference.','14日個体基準と集団参照','14일 개체 및 집단 기준 비교'):L('未滿14天，只與適用群體參考比較。','Before 14 days: applicable group reference only.','14日未満：集団基準のみ','14일 전: 집단 기준만 비교');
   text.textContent=key==='heart'?L(`本段心率中位數 ${formatted} bpm。${basis}`,`Window HR median ${formatted} bpm. ${basis}`,`本区間の心拍中央値 ${formatted} bpm`, `현재 심박 중앙값 ${formatted} bpm`):L(`本段呼吸中位數 ${formatted} 次／分。${basis}`,`Window RR median ${formatted}/min. ${basis}`,`本区間の呼吸中央値 ${formatted}/分`,`현재 호흡 중앙값 ${formatted}/분`);
  }
 }
}
function sleep(rootEl,n,d){const main=$('.dp-owner-sleep,.dp905-sleep-summary,.dp-owner-status-card',rootEl);if(!main)return;
 const v=calc.period(d,n,'sleep');if(n===1)sleepPaint(main,v);
 else {paintCol($('.dp903-score-col,.dp901-score-col',main),v,'#52a97d');}
 const title=$('.dp-owner-status-heading,.dp905-sleep-head,.dp-sleep-period-score-head,.dp905-sleep-summary-head',main)||main;
 const dest=title.closest('.dp-owner-status-inner')?title.querySelector('div:first-child')||title:title;
 note(dest,v,{main:true,periodLocked:n>1&&v.level==='locked'?v:null});
 for(const detail of $$('.dp-owner-sleep-facts>div,.dp-owner-sleep-timeline,.dp-owner-sleep-legend',main))note(detail,v,{periodLocked:n>1&&v.level==='locked'?v:null});
}
function energy(rootEl,n,d){const main=$('.dp901-health-score',rootEl);if(!main)return;
 const v=calc.period(d,n,'activityRecovery');paintCol($('.dp901-overall-head .dp901-score-col',main),v,'#4387dc');
 note($('.dp901-overall-copy',main),v,{main:true,periodLocked:n>1&&v.level==='locked'?v:null});
 if(n===1){const msg=$('.dp901-overall-desc',main);if(msg){
  const linked=calc.dayScores(v.measuredDate||d).linkAudit?.steps||[];
  const energyLink=linked.find(z=>z.metric==='energy');
  const fmt=x=>finite(x)?String(x):'N/A';
  msg.textContent=energyLink?L(`精力 ${fmt(energyLink.score)}：動靜 ${fmt(energyLink.inputs.motion)}、心肺 ${fmt(energyLink.inputs.cardio)}、睡眠 ${fmt(energyLink.inputs.sleep)}，按45/25/30權重計算；缺測項不補值。`,`Energy ${fmt(energyLink.score)}: motion ${fmt(energyLink.inputs.motion)}, cardio ${fmt(energyLink.inputs.cardio)}, rest ${fmt(energyLink.inputs.sleep)}; 45/25/30 weights, missing inputs excluded.`,`精力は活動・心肺・休息から計算（45/25/30）。欠測は補完しません。`,`활동·심폐·휴식 기반(45/25/30), 결측값은 보충하지 않습니다.`):L('資料不足。','Insufficient evidence.','データ不足。','데이터 부족.');
 }}
 const keys=['energy','recovery','calm'];$$('.dp901-metric-card',main).slice(0,3).forEach((card,i)=>{
  const x=calc.period(d,n,keys[i]);paintCol($('.dp901-score-col',card),x,'#4387dc');note($('.dp901-card-copy',card)||card,x,{periodLocked:n>1&&x.level==='locked'?x:null});
  const p=$('.dp901-metric-desc',card);if(!p)return;
  if(keys[i]==='recovery'&&finite(x.score)){
   const e=x.primary;
   p.textContent=e?L(`當日最高符合活動轉換條件的心率：${e.start.slice(11,16)} ${e.from} bpm → ${e.end.slice(11,16)} ${e.to} bpm，兩分鐘下降 ${e.drop} bpm。呼吸 ${e.fromRR} → ${e.toRR} 次/分。`,`Highest eligible activity-transition HR: ${e.start.slice(11,16)} ${e.from} → ${e.end.slice(11,16)} ${e.to} bpm; two-minute fall ${e.drop} bpm. Breathing ${e.fromRR} → ${e.toRR}/min.`,`当日の適格な最高心拍 ${e.from} → ${e.to} bpm、2分間の低下 ${e.drop} bpm。`,`당일 적격 최고 심박 ${e.from} → ${e.to} bpm, 2분 감소 ${e.drop} bpm.`):L('期間內有效日的恢復分數平均；缺測日期不補值。','Average recovery score across recorded days; missing days excluded.','有効日の回復スコア平均。','유효일 회복 점수 평균.');
   const oldLabel=$('.dp911-recovery-label',card);
   if(oldLabel)oldLabel.textContent=e?L(`當日選定事件 ${e.start.slice(11,16)}–${e.end.slice(11,16)}；${e.evidence==='oem-120s-summary-endpoints'?'原廠兩分鐘摘要端點估算':'分鐘波形擷取端點估算'}。`,`Selected event ${e.start.slice(11,16)}–${e.end.slice(11,16)}; ${e.evidence==='oem-120s-summary-endpoints'?'OEM summary':'waveform-derived minute'} endpoints.`,`選定イベント ${e.start.slice(11,16)}–${e.end.slice(11,16)}。`,`선택 이벤트 ${e.start.slice(11,16)}–${e.end.slice(11,16)}.`):'';
  }
  else if(keys[i]==='energy'&&finite(x.score))p.textContent=x.dependencyAdjustment>0?
   L(`動靜觀測原始指數 ${x.rawObservationScore}；因當日夜間休息觀測不足，聯動調整 ${x.dependencyAdjustment} 分。此為產品觀測規則，非疾病判定。`,
     `Motion index ${x.rawObservationScore}; reduced ${x.dependencyAdjustment} due to same-date low night-rest observation. Nonclinical heuristic.`,
     `動静推定 ${x.rawObservationScore}。同日の夜間休息による参考調整。`,
     `원시 움직임 지수 ${x.rawObservationScore}; 같은 날 밤 휴식에 따라 참고 조정.`):
   L('首日起依相同心率、呼吸與體動規則計算；第15個有效日起逐項加入個體基準。',
     'Day-one activity observation uses group-stage engineering references; personal baseline starts after 14 prior valid days. Not a veterinary fitness score.',
     '初日から活動観測値を計算できます。個体基準は15日目以降。',
     '첫날부터 활동 관측 가능; 개인 기준은 15번째 유효일부터.');
  else if(keys[i]==='calm'&&finite(x.score))p.textContent=L('未滿14天以同體型犬群體參考比較安靜心率與呼吸；可使用當日HRV估算。','Before 14 days, quiet heart/breathing use matched group references; estimated HRV included in wellness estimate.','安静時心拍・呼吸・割合の推定です。','조용한 심박·호흡·움직임 비율 기반 추정입니다.');
  else if(keys[i]==='recovery'&&!finite(x.score)){
    const observedFall=finite(x.maxDropBpm);
    p.textContent=observedFall?
      L(`本日最大兩分鐘心率下降 ${x.maxDropBpm} bpm；已有量測，但未取得可計分的合格恢復候選。首次合格量測即可使用通用初始模型，不需等待14天。`,
        `Today's greatest two-minute decrease was ${x.maxDropBpm} bpm, but no qualified recovery score. A 14-day personal baseline is not required.`,
        `2分間の心拍低下は記録済みですが、採点可能な回復イベントはありません。`,
        `2분간 심박 감소는 기록됐으나 유효한 회복 점수는 없습니다.`):
      L('所選日期沒有相隔兩分鐘且品質合格的心率回落事件；不引用其他日期，也不產生恢復分數。',
        'No qualified two-minute HR fall on the selected date. Other days are not substituted and no recovery score is issued.',
        '選択日に有効な2分間心拍低下イベントはありません。',
        '선택 날짜에 유효한 2분 심박 감소 기록이 없습니다.');
    const oldLabel=$('.dp911-recovery-label',card);
    if(oldLabel)oldLabel.textContent=observedFall?
      L(`記錄日期：${date(x.measuredDate||d)}；最大下降 ${x.maxDropBpm} bpm，觀測分需檢查事件品質。`,
        `Recorded ${date(x.measuredDate||d)}; maximum decrease ${x.maxDropBpm} bpm, event quality still under review.`,
        `記録済み、イベントの品質を確認中。`,`기록됨; 이벤트 품질 확인 중.`):'';
  }
  else if(keys[i]==='energy'&&!finite(x.score))p.textContent=L('已有動靜紀錄，但缺少可核對的群體精力參考，不能以兩天個體平均替代。','Motion recorded; no verified group energy reference, so the 2-day personal average is not a scoring norm.','検証済みの集団基準がありません。','검증된 집단 기준이 없습니다.');

 });
}
function otherPetsProvenance(rootEl,n,d){
 // Existing gallery scores remain entirely unchanged. These date-indexed
 // fixture records do NOT contain a verified wall-clock sampling time.
 const r=n===1?`${date(d)}`:`${date(new Date(Date.parse(d+'T12:00:00Z')-(n-1)*86400000).toISOString().slice(0,10))} – ${date(d)}`;
 const text=L(`資料日期：${r}；來源尚無精確測量時分。`,`Record dates: ${r}; exact observation times not provided.`,`記録日：${r}（時分は未記録）`,`기록 날짜: ${r}; 정확한 시각은 미기록`);
 const targetList=$$('.dp903-overview-copy,.dp903-metric-left,.dp901-overall-copy,.dp901-card-copy,.dp-owner-status-heading,.dp-owner-sleep-facts > div,.dp905-sleep-head,.dp905-calendar-panel',rootEl);
 for(const t of targetList){const p=document.createElement('p');p.className='dp-observation-note';p.textContent=text;t.append(p);}
}

function historicalDetail(){
 return; // native fixed detail template handled by lafa-canonical-detail.js
 if(!isMilo()||state.detail!=='dp90-waveform')return;
 const day=String(state.dp90WaveDate||selected()),kind=state.dp90WaveKind==='breath'?'breath':'heart';
 if(day==='2026-11-22'){
   const shell=$('.app-main .dp90-wave-page');if(!shell)return;
   const kind=state.dp90WaveKind==='breath'?'breath':'heart';
   const current=calc.lastRelevant(day,kind);
   const stats=$$('.milo-verified-summary > div',shell);
   if(stats[0]&&finite(current.score)){const val=$('strong',stats[0]);if(val)val.textContent=L(`短時觀測分 ${current.score}/100`,`Observed score ${current.score}/100`,`観測 ${current.score}/100`,`관측 ${current.score}/100`);}
   // The detailed value must use the same observation window as its card and score.
   if(stats[1]){const vitals=calc.dayScores(day).vitals;
    const val=kind==='heart'?vitals.hrMedian:vitals.rrMedian;
    const text=$('strong',stats[1]),label=$('small',stats[1]);
    if(finite(val)&&text)text.textContent=String(Math.round(val*10)/10)+(kind==='heart'?' bpm':L(' 次／分',' /min',' 回／分',' 회/분'));
    if(label)label.textContent=L('本段中位數','Window median','本区間中央値','현재 구간 중앙값');
   }
   if(stats[2]&&current.coverage){const val=$('strong',stats[2]);if(val)val.textContent=coverageText(current);}
   const conclusion=$('.milo-verified-conclusion>p',shell);
   if(conclusion&&finite(current.score))conclusion.textContent+=L(' 本頁觀測分依上述最近合格時段計算，不能當作完整全天評分。',' Score uses the latest qualified window, not a full-day assessment.','短時間の観測点です。','최근 유효 구간을 사용한 점수입니다.');
   return;
 } // retain native 20Hz detailed plots
 const rootPage=$('.app-main .dp90-wave-page');if(!rootPage)return;
 const raw=(root.DeepPetMiloHistory545?.samples||[]).filter(x=>x[0].slice(0,10)===day);
 const valid=raw.filter(x=>x[1]>0&&x[2]>0);if(!valid.length)return;
 const key=kind==='heart'?1:2,unit=kind==='heart'?'bpm':L('次／分','/min','回／分','회/분');
 const sort=v=>v.slice().sort((a,b)=>a-b),vals=sort(valid.map(x=>x[key]));
 const med=vals.length%2?vals[vals.length>>1]:(vals[(vals.length>>1)-1]+vals[vals.length>>1])/2;
 const min=vals[0],max=vals.at(-1),v=calc.dayScores(day)[kind];
 const relevant=v.coverage?.start&&v.coverage?.end?valid.filter(x=>x[0]>=v.coverage.start&&x[0]<=v.coverage.end):valid;
 const recentVals=relevant.map(x=>x[key]).sort((a,b)=>a-b),recentMedian=recentVals.length%2?recentVals[recentVals.length>>1]:(recentVals[(recentVals.length>>1)-1]+recentVals[recentVals.length>>1])/2;
 const recentMin=recentVals[0],recentMax=recentVals.at(-1);
 const c=calc.observed(valid.map(x=>({ts:x[0].slice(0,16),hr:x[1],rr:x[2],source:'historical',seconds:120})));
 const t=coverageText({coverage:v.coverage||c}),wholeTime=coverageText({coverage:c});
 const status=finite(v.score)?L(`短時觀測分 ${v.score}/100`,`Observed ${v.score}/100`,`観測 ${v.score}/100`,`관측 ${v.score}/100`):L('測量資料有限','Limited observation','観測情報が限定的','관측 자료 제한');
 const W=350,H=165,left=40,top=14,bottom=31,plotW=W-left-9,plotH=H-top-bottom;
 const first=Date.parse(valid[0][0]+':00'),last=Date.parse(valid.at(-1)[0]+':00');
 const scaleX=t=>left+(Date.parse(t+':00')-first)/Math.max(1,last-first)*plotW;
 const scaleY=x=>top+(1-(x-min+3)/Math.max(1,max-min+6))*plotH;
 let d='',prev=null;
 for(const row of valid){const x=scaleX(row[0].slice(0,16)),y=scaleY(row[key]);
  const dt=prev?Date.parse(row[0]+':00')-Date.parse(prev[0]+':00'):0;
  d+=(prev&&dt<=180000?'L':'M')+x.toFixed(2)+','+y.toFixed(2)+' ';prev=row;}
 // Candidate relative changes are observations, not validated emergency alarms.
 const events=[];for(let i=1;i<valid.length;i++){const prev=valid[i-1],cur=valid[i];
  if(Date.parse(cur[0]+':00')-Date.parse(prev[0]+':00')!==120000)continue;
  const delta=cur[key]-prev[key],limit=kind==='heart'?12:4;
  if(Math.abs(delta)>=limit)events.push({time:cur[0].slice(11,16),delta});
 }
 const title=kind==='heart'?L('心跳狀況','Heart rate','心拍','심박'):L('呼吸狀況','Breathing','呼吸','호흡');
 const chart=`<svg viewBox="0 0 ${W} ${H}" class="dp904-trend-svg" role="img" aria-label="${esc(title+' '+t)}"><line x1="${left}" y1="${H-bottom}" x2="${W-6}" y2="${H-bottom}" stroke="#cbd7e0"/><text x="${left-3}" y="${top+8}" text-anchor="end" font-size="10" fill="#66768b">${max}</text><text x="${left-3}" y="${H-bottom}" text-anchor="end" font-size="10" fill="#66768b">${min}</text><path d="${d}" stroke="${kind==='heart'?'#bb5477':'#487fb8'}" fill="none" stroke-width="2"/><text x="${left}" y="${H-8}" font-size="10" fill="#66768b">${valid[0][0].slice(11,16)}</text><text x="${W-7}" text-anchor="end" y="${H-8}" font-size="10" fill="#66768b">${valid.at(-1)[0].slice(11,16)}</text></svg>`;
 rootPage.querySelectorAll('section.card').forEach(x=>x.remove());
 rootPage.insertAdjacentHTML('beforeend',`<section class="card dp904-wave-card"><div class="dp904-wave-title"><span class="dp904-step">01</span><h3>${esc(title)}</h3></div><div class="milo-verified-summary"><div><small>${L('狀況','Status','状態','상태')}</small><strong>${esc(status)}</strong></div><div><small>${L('本段中位數','Median','中央値','중앙값')}</small><strong>${recentMedian} ${unit}（${recentMin}–${recentMax}）</strong></div><div><small>${L('量測時段','Measurement window','観測期間','측정 구간')}</small><strong>${esc(t)}</strong></div></div><div class="milo-verified-conclusion"><b>${L('結論','Conclusion','結論','결론')}</b><p>${L('已從歷史量測直接計算短時分數與趨勢；這是每2分鐘一次的紀錄，並非連續20Hz原始波形，也不是疾病診斷。','Computed from two-minute historical samples, not a continuous 20 Hz raw waveform or clinical diagnosis.','2分間隔の履歴から算出。20Hz原波形ではありません。','2분 간격 기록에서 계산했으며 연속 20Hz 원시 파형은 아닙니다.')}</p></div></section><section class="card dp904-wave-card"><div class="dp904-wave-title"><span class="dp904-step">02</span><h3>${L('兩分鐘紀錄趨勢','Two-minute recorded trend','2分間隔の記録','2분 간격 추세')}</h3></div>${chart}<p class="dp904-small-note">${L('全段趨勢：','Full trend: ','全体の記録：','전체 기록: ')}${esc(wholeTime)}</p></section><section class="card dp904-wave-card"><div class="dp904-wave-title"><span class="dp904-step">03</span><h3>${L('值得回看的時間點','Changes worth reviewing','確認する変化','확인할 변화')}</h3></div>${events.length?events.slice(0,10).map(x=>`<div class="dp904-event-choice"><b>${esc(x.time)}</b><span>${x.delta>0?'+':''}${x.delta} ${unit}</span></div>`).join(''):L('未找到超出本段相對變化門檻的相鄰時間點。','No adjacent samples met the review threshold.','明確な変化はありません。','뚜렷한 변화 없음')}<p class="dp904-small-note">${L('僅作波動回看，不是醫療或一級提醒。','Relative review markers only, not clinical alerts.','診断や緊急通知ではありません。','진단 또는 응급 알림이 아닙니다.')}</p></section>`);
}

const old=render;
render=function(reset=false){old(reset);try{decorate();}catch(err){console.error('DeepPet short-window provenance',err);}};
function decorate(){if(state.tab!=='deep')return;if(state.detail){historicalDetail();return;}
 const rootEl=$('.app-main .dp-owner-deep');if(!rootEl)return;
 // Fix an existing V10.139 text-only calendar defect: 10/30 was rendered as 1N/A.
 // Use the button's actual date attribute. Do not alter any score, data or layout.
 for(const dayButton of $$('[data-action="dp905-date-open"][data-date]',rootEl)){
  const label=$(':scope > small',dayButton),d=dayButton.getAttribute('data-date');
  if(label&&label.textContent.includes('N/A')&&/^\d{4}-\d{2}-\d{2}$/.test(d))
   label.textContent=date(d.slice(5));
 }
 const n=[1,7,30].includes(Number(state.range))?Number(state.range):1;
 const d=isMilo()?selected():typeof deepChosenDate==='function'?deepChosenDate():null;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(d||''))return;
 // No extra cards, dates or annotations are added to any other pet.
 if(!isMilo())return;
 if(n>1){const lock=calc.period(d,n,'cardio');const quality=$('.dp-range-quality',rootEl);
  if(quality&&lock.level==='locked')quality.textContent=L(`本期間 ${lock.qualifiedDays}/${n} 日有分數；目前資料不足。`,`Scored days ${lock.qualifiedDays}/${n}; insufficient data.`,`有効日 ${lock.qualifiedDays}/${n} · 期間点は全日後`,`유효일 ${lock.qualifiedDays}/${n} · 모두 채워야 기간 점수 해제`);
 }
 if(state.deepType===0)cardio(rootEl,n,d);
 else if(state.deepType===1)sleep(rootEl,n,d);
 else energy(rootEl,n,d);
}
try{decorate();}catch(e){console.error('DeepPet short-window initial',e);}
// Refresh an open Milo Deep page hourly without requiring a full-day recording.
// SDK ingestion also refreshes immediately, inside ingestMeasurements().
if(typeof root.setInterval==='function')root.setInterval(()=>{
 try{if(typeof state!=='undefined'&&state.tab==='deep'&&isMilo()&&document.visibilityState==='visible')render(false);}
 catch(err){console.error('DeepPet hourly observation refresh',err);}
},60*60*1000);
root.DeepPetShortWindowProvenance=Object.freeze({version:'v10.139-small-timestamps',usesExistingLayout:true,periodUnlock:[7,30]});
})(window);
