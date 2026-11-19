/* DeepPet V10.88 — complete the language switch and printed-report presentation.
   Only report boilerplate is rewritten; guardian-entered medical records,
   laboratory values, dates, pet identities and warning thresholds remain intact. */
(() => {
 'use strict';
 if (typeof vetReportContent !== 'function' || typeof DOMParser !== 'function') return;
 const previous = vetReportContent;
 const copy = {
  zht: {
   tag: '健康觀察｜非醫療診斷', note: '分類須經飼主或獸醫確認。若缺少可比的參考區間，不能據此判定疾病。',
   limits: '本報告僅供健康趨勢與照護記錄參考，不構成醫療診斷。生理數值須經有效設備訊號、犬貓分別驗證及獸醫判讀後，方可作為醫療決策依據。',
   sign: '健康記錄摘要', noMed: '尚無已保存的用藥紀錄。', noSensor: '尚未連接項圈，沒有可輸出的生理量測資料；以下僅列已保存的健康管理及體檢記錄。'
  },
  zh: {
   tag: '健康观察｜非医疗诊断', note: '分类须经主人或兽医确认。缺少可比较的参考区间时，不能据此判断疾病。',
   limits: '本报告仅供健康趋势与护理记录参考，不构成医疗诊断。生理数值须经过有效设备信号、犬猫分别验证及兽医判读后，才可作为医疗决策依据。',
   sign: '健康记录摘要', noMed: '暂无已保存的用药记录。', noSensor: '尚未连接项圈，没有可输出的生理测量数据；以下仅列已保存的健康管理及体检记录。'
  },
  en: {
   tag: 'HEALTH OBSERVATION · NOT FOR DIAGNOSIS', note: 'Caregivers or veterinarians must verify classifications. Without a valid comparison range, results cannot establish disease.',
   limits: 'This report summarizes health trends and care records; it is not a medical diagnosis. Physiological readings require valid device signals, species-specific validation and veterinary interpretation before medical use.',
   sign: 'Health record summary', noMed: 'No medication records have been saved.', noSensor: 'No collar is connected, so physiological readings are unavailable. Only saved care and examination records are listed.'
  },
  ko: {
   tag: '건강 관찰 · 진단용 아님', note: '분류 결과는 보호자 또는 수의사의 확인이 필요합니다. 비교 가능한 기준 범위가 없으면 질병을 판단할 수 없습니다.',
   limits: '이 문서는 건강 추세와 돌봄 기록 요약이며 의료 진단이 아닙니다. 의료 판단에는 유효한 기기 신호, 종별 검증, 수의사의 해석이 필요합니다.',
   sign: '건강 기록 요약', noMed: '저장된 투약 기록이 없습니다.', noSensor: '목걸리가 연결되지 않아 생체 측정값이 없습니다. 저장된 건강 관리 및 검사 기록만 표시합니다.'
  },
  ja: {
   tag: '健康観察・医療診断ではありません', note: '判定は飼い主または獣医師による確認が必要です。比較可能な基準範囲がない場合、病気を判定することはできません。',
   limits: 'この報告書は健康傾向とケア記録の参考資料であり、医療診断ではありません。医療用途には有効な機器データ、動物種別の検証、獣医師の判断が必要です。',
   sign: '健康記録サマリー', noMed: '保存済みの投薬記録はありません。', noSensor: '首輪が接続されていないため、生理測定値はありません。保存済みのケア・検査記録のみ表示します。'
  }
 };
 vetReportContent = function(...args) {
  const original = previous(...args);
  const parsed = new DOMParser().parseFromString(original, 'text/html');
  const root = parsed.querySelector('.vet-report-root');
  if (!root) return original;
  const words = copy[state.lang] || copy.zht;
  const put = (selector, value) => { const node = root.querySelector(selector); if(node) node.textContent=value; };
  put('.vet-report-tag', words.tag);
  put('.vet-method-note', words.note);
  put('.vet-report-footer p', words.limits);
  put('.vet-report-signoff span', words.sign);
  for (const p of root.querySelectorAll('.vet-care-columns p')) {
   if (/尚無已存用藥|尚无已存用药|No saved medication|저장된 복약 기록 없음|保存済みの投薬記録なし/.test(p.textContent)) p.textContent=words.noMed;
  }
  for (const p of root.querySelectorAll('p')) {
   if (/以下僅列已保存的健康管理資料與示範體檢資料|only saved care data and clearly marked demo exam records/.test(p.textContent)) p.textContent=words.noSensor;
  }
  return root.outerHTML;
 };
})();
