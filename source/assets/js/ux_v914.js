/* V9.14 | Medical-record-first Health card. Evaluation only; no claim of medical diagnosis. */
(function(){'use strict';
function L(zh,en,ko,ja,zht){return state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?(ja||en):state.lang==='zht'?(zht||zh):zh;}
function escText(s){return String(s??'').replace(/[&<>"']/g,v=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]));}
window.__dp914ReportSpotlight=function(){
 // A laboratory report is independently meaningful even when the collar has
 // not measured today, or has never been paired. Never anchor Health's report
 // summary to the most recent sensor-score day or accidentally hide a report
 // uploaded after that day.
 const list=window.dp914ReportRecords?.(state.dog)||[];
 const profile={...currentDog(),petId:String(state.dog)};
 const referenceDate=typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):new Date().toLocaleDateString('sv-SE');
 const report=window.DeepPetLabEvidence?.assess?.(list,profile,referenceDate)||null;
 const has=!!(report?.present&&Number.isFinite(report?.score)),hasRecords=list.length>0,flags=report?.alerts?.length||0;
 const latestRecords=has?list.filter(x=>x.date===report.latest&&(x.reportId||('legacy:'+x.date))===report.reportId):[];
 const attached=latestRecords.some(r=>r.source==='file'||r.attachmentId);
 const reviewed=has&&report.records?.some(r=>r.verifiedByVet===true);
 const title=L('體檢分析','Exam analysis','검진 분석','検診分析');
 const sub=has?L(`最近可評估檢查 ${report.latest} · ${report.count} 項 · ${flags} 項需要留意`,`Latest assessable exam ${report.latest} · ${report.count} tests · ${flags} flagged`,`평가 가능한 최근 검진 ${report.latest} · ${report.count}개 · 확인 필요 ${flags}개`,`評価できる最新検診 ${report.latest} · ${report.count} 項目 · 要確認 ${flags} 件`):hasRecords?L('已有體檢記錄，但部分指標的數值、單位或參考範圍尚待確認。','Examination records are saved; some values, units or reference ranges need review.','검진 기록이 있지만 수치·단위·참고범위 확인이 필요합니다.','検診記録はありますが数値・単位・基準範囲の確認が必要です。'):L('上傳血液、心肺、體況或其他獸醫檢查報告，幫助對照日常監測。','Add veterinary bloodwork, heart, breathing or condition reports to provide context for trends.','혈액·심폐·건강 검진 자료로 일상 추세를 비교하세요.','血液・心肺・体調の検診結果で日々の変化を理解');
 const pending=has&&report.pendingLatest&&report.pendingLatest>report.latest;
 const note=has?(pending?L(`另有較新的 ${report.pendingLatest} 檢查待核對，未取代 ${report.latest} 的可評估結果。`,`A newer ${report.pendingLatest} examination needs review and has not replaced the assessable ${report.latest} result.`,`더 최근 ${report.pendingLatest} 검사 기록은 확인 중이며 이전 평가를 대체하지 않습니다.`,`新しい ${report.pendingLatest} の検診は確認待ちで、評価済み結果を置き換えていません。`):reviewed?L('已有獸醫確認的項目可作為較高可信度依據；其餘項目仍須核對。','Vet-reviewed items provide stronger evidence; other entries still require checking.','수의사가 확인한 항목은 근거가 강하며 나머지는 검증이 필요합니다.','獣医師確認済みの項目を優先し、その他は確認が必要です。'):L('這份結果可用來對照日常趨勢；尚未經獸醫確認的項目不會視為確診。','These results inform daily trends; unreviewed entries are not diagnoses.','검진 내역은 추세 비교에 참고하며 미확인 정보는 진단이 아닙니다.','未確認の結果は診断として扱われません。')):L('報告只影響相關健康證據；即時心跳與呼吸讀數仍獨立顯示。','Reports inform relevant assessments; live heart and breathing values remain independent.','검진 결과는 관련 영역만 참고하며 실시간 신호는 그대로 표시됩니다.','リアルタイム測定値は別々に表示されます。');
 const status=has?`<div class="dp914-report-status">${flags?`<span class="dp914-flag">${flags} ${L('項需留意','flagged','확인 필요','注意項目')}</span>`:`<span>${L('目前無標記需留意項目','No flagged result recorded','표시된 이상 항목 없음','要確認項目なし')}</span>`} · ${reviewed?L('部分經獸醫確認','Some items vet-reviewed','일부 수의사 확인','一部獣医師確認済み'):attached?L('最近可評估報告有附件','Latest assessable report has an attachment','최근 평가 보고서에 첨부파일 있음','最新評価済み報告に添付あり'):L('已記錄結果','Results recorded','결과 저장됨','結果を保存')}</div>`:hasRecords?`<div class="dp914-report-status">${L('已有記錄 · 待核對','Records saved · Review needed','기록 있음 · 확인 필요','記録あり・確認待ち')}</div>`:'';
 return `<section class="dp914-report-hero" aria-label="${escText(title)}"><div class="dp914-report-head"><div class="dp914-report-illustration" aria-hidden="true">${vicon('report',27)}</div><div class="dp914-report-headcopy"><h2>${escText(title)}</h2></div></div><p class="dp914-report-sub">${escText(sub)}</p><p class="dp914-report-note">${escText(note)}</p><div class="dp914-benefits"><span>${L('補足 BCG 無法測到的檢查資訊','Add information BCG cannot measure','BCG로 측정할 수 없는 검사 정보 보완','BCGで測れない検診項目を補完')}</span><span>${L('與日常變化一起追蹤','Compare with daily trends','일일 추세와 함께 비교','日々の推移と比較')}</span></div><div class="dp914-report-actions"><button type="button" class="dp914-upload" data-action="upload-report">${vicon('plus',18)} ${L('上傳／建立體檢報告','Upload or create report','검진 보고서 업로드','検診結果を追加')}</button><button type="button" class="dp914-see" data-action="health-detail" data-page="reports">${hasRecords?L('查看全部報告','View reports','검진 기록 보기','結果一覧'):L('查看體檢記錄','See exam records','검진 기록 보기','検診履歴')} ${vicon('chev',15)}</button></div>${status}</section>`;
};
// Avoid putting an unreviewed report into sensor-event alerts. It affects the score's
// evidence context, not raw HR/RR or emergency signal timestamps.
})();
