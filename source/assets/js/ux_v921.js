/* DeepPet V9.22 | Examination reports, coherent score lineage and SDK HRV demonstration.
   These built-in example values do not assert a real veterinary examination or diagnosis.
   Real uploaded images are stored as attachments only; automatic OCR is NOT implemented.
*/
(function(root){'use strict';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const loc=(zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:zh;
// Complete the release's four-language policy for legacy, previously hard-coded
// examination captions. Translation acts on generated markup, never on records.
const EXAM_COPY={
 '新增體檢報告':['Add examination report','検診レポートを追加'],
 '尚無體檢報告':['No examination reports yet','検診レポートはまだありません'],
 '每份報告獨立計分；即使檢測日期相同，也能分開查看。只有實際檢測日期決定今日證據時效，與上傳時間無關。':['Each examination is scored separately, even when visits share a date. Evidence age depends on the test date, not upload time.','各検診は同じ日付でも別々に評価します。記録の新しさはアップロード日ではなく検査日で判断します。'],
 '與上次體檢的變化':['Changes since the previous exam','前回の検診からの変化'],
 '僅比較單位、參考區間與方法相同的指標；以超出適用參考區間的幅度比較，區間內的移動不等同惡化，也不代表疾病診斷。':['Compare only tests with matching units, reference intervals and methods. Moving within the interval does not imply deterioration or a diagnosis.','単位・基準範囲・方法が一致する項目のみ比較します。基準内の変化は悪化や診断を意味しません。'],
 '兩次均在參考區間內':['Within range at both visits','両方の検診で基準範囲内'],
 '轉好 · 超出參考區間幅度縮小':['Improved deviation from reference','基準からの逸脱が減少'],
 '偏離程度相近':['Similar deviation','逸脱の程度はほぼ同じ'],
 '輕微偏離增加':['Slightly larger deviation','逸脱がわずかに増加'],
 '偏離幅度增加':['Deviation increased','逸脱が増加'],
 '偏離幅度顯著增加':['Deviation increased markedly','逸脱が大幅に増加'],
 '心臟與循環':['Heart and circulation','心臓と循環'],
 '呼吸與氧合':['Breathing and oxygenation','呼吸と酸素化'],
 '腎功能':['Kidney function','腎機能'],
 '肝功能':['Liver function','肝機能'],
 '代謝與體況':['Metabolism and condition','代謝と体調'],
 '血液與其他':['Blood and other tests','血液・その他'],
 '項指標':[' indicators','項目'],
 '項需留意':[' flagged','項目に注意'],
 '項高風險':[' high concern','項目が高リスク'],
 '項可比較':[' comparable','項目を比較可能'],
 '點擊展開':['Tap to expand','タップして展開'],
 '返回體檢報告列表':['Back to examination list','検診一覧に戻る'],
 '檢測日期：':['Test date:','検査日：'],
 '檢測機構：':['Clinic:','検査機関：'],
 '數據：':['Tests:','検査項目：'],
 '天前':[' days ago','日前'],
 '項可評估':[' assessable','項目を評価可能'],
 '項（':[' tests (','項目（'],
 '健康':['Healthy','健康'],
 '低風險':['Low concern','低リスク'],
 '中風險':['Moderate concern','中リスク'],
 '高風險':['High concern','高リスク'],
 '判讀背景：檢測當日約 ':['Review context: approximately ','判定条件：検査当時約'],
 '參考區間需符合物種、年齡、體重、檢驗方法和來源；不可因長期異常就當成正常。':['Reference intervals must match species, age, weight, method and source. Long-standing abnormalities must not become normal by adaptation.','基準範囲は種・年齢・体重・検査方法・情報源に適合する必要があります。長期の異常を正常扱いしません。'],
 '當時報告分 ':['Exam score at test time: ','検査当時のスコア：'],
 '。體檢只參與長期 Pet Wellness Model，不改動當天的身體狀態或身體節奏。原始報告分數不因日期變舊而改變；時效僅影響長期模型。':['. The examination contributes only to the long-term Pet Wellness Model, not the two daily scores. Its original score never decays; only its relevance to long-term context changes.','。検診は長期的なPet Wellness Modelにのみ反映され、当日の2つのスコアには反映されません。元の検診スコアは時間経過で変わりません。'],
 '此報告尚無可顯示的檢驗數值。':['No usable test values in this report.','このレポートには表示できる検査値がありません。'],
 '編輯這份報告':['Edit this report','このレポートを編集'],
 '刪除報告':['Delete report','レポートを削除'],
 '內建測試報告僅用於驗收流程；此分級是候選工程模型，尚未經獸醫臨床驗證。所有新上傳數值應與實際檢驗單核對。':['Built-in reports are examples. These grades are an engineering model not clinically validated. Confirm all imported values against the original lab report.','内蔵レポートはサンプルです。分類は未検証の試作モデルであり、診断ではありません。入力値は必ず元の検査票と照合してください。'],
 '請選擇新增方式；每一種方式都會先開啟完整的可編輯體檢表。':['Choose how to add a report. Each option opens an editable examination form.','追加方法を選んでください。どの方法でも編集可能な検診フォームが開きます。'],
 '手動填寫':['Enter manually','手動入力'],
 '本地檔案':['Local file','ローカルファイル'],
 '上傳照片':['Upload photo','写真をアップロード'],
 '拍照':['Take photo','写真を撮る'],
 '新增項目':['New test','新しい項目'],
 '刪除':['Delete','削除'],
 '指標代碼／名稱':['Test code or name','検査コード・名称'],
 '指標名稱':['Test name','検査項目名'],
 '結果單位':['Result unit','結果の単位'],
 '參考區間單位':['Reference unit','基準範囲の単位'],
 '參考下限':['Reference lower bound','基準範囲の下限'],
 '參考上限':['Reference upper bound','基準範囲の上限'],
 '報告標註':['Lab label','検査票の判定'],
 '按數值評估':['Assess numerically','数値で評価'],
 '原單標示正常':['Marked normal by lab','検査票で正常'],
 '原單標示異常':['Marked abnormal by lab','検査票で異常'],
 '原單標示嚴重異常':['Marked critically abnormal','検査票で重大な異常'],
 '必填':['Required','必須'],
 '已預填 ':['Pre-filled ','入力済み：'],
 ' 項可修改的範例數值。這不是自動 OCR 辨識結果；請根據實際檢驗單核對。':[' editable example values. These were not extracted by OCR; verify against the actual report.','件の編集可能なサンプル値を入力済みです。OCRの結果ではありません。実際の検査票で確認してください。'],
 '請逐項填入並核對 ':['Enter and verify ','入力して確認してください：'],
 ' 項檢驗資料；本模式不預填任何檢驗數值。':[' test values; no values are prefilled in this mode.','件の検査値。このモードでは値は自動入力されません。'],
 '保存將更新目前這一份報告。':['Saving updates this report.','保存するとこのレポートを更新します。'],
 '直接保存會建立一份新的獨立報告。':['Saving creates a new separate report.','保存すると新しい独立したレポートを作成します。'],
 '附上檔案或照片':['Attach a file or photo','ファイルまたは写真を添付'],
 '實際檢測日期':['Actual test date','実際の検査日'],
 '醫療機構':['Clinic or medical institution','医療機関'],
 '檢測當日年齡（歲，可選）':['Age at test (years, optional)','検査時の年齢（歳・任意）'],
 '檢測當日體重（kg，可選）':['Weight at test (kg, optional)','検査時の体重（kg・任意）'],
 '檢測日期是唯一的時效基準，上傳日期不影響計分。':['Only the actual test date determines evidence age; upload date does not alter scoring.','情報の新しさは検査日で判定し、アップロード日は採点に影響しません。'],
 '檢驗結果 · ':['Test results · ','検査結果 · '],
 ' 項（可逐項修改）':[' tests (individually editable)','件（項目ごとに編集可能）'],
 '＋ 新增一項檢驗指標':['＋ Add a test','＋ 検査項目を追加'],
 '確認並保存完整報告':['Confirm and save report','確認してレポートを保存'],
 '取消':['Cancel','キャンセル'],
 '編輯體檢報告':['Edit examination report','検診レポートを編集'],
 '結果':['Result','結果'],
 '已保存 ':['Saved ','保存しました：'],
 ' 的體檢報告，共 ':[' examination report, ','の検診レポート、合計'],
 ' 項檢驗結果。':[' results.','件の検査結果。'],
 '返回主頁':['Back to Home','ホームに戻る'],
 '應急與變化提醒':['Urgent and change alerts','緊急・変化の通知'],
 '查看全部':['View all','すべて表示'],
 '非今日採用報告（0%）':['Not used for today (0%)','今日の評価には未使用（0%）']
};
// The original exam text-localizer only supported English and Japanese.
// Korean had been silently falling through to the Traditional Chinese copy.
// Keep this mapping in the existing exam screen; never translate stored data.
const EXAM_COPY_KO={
 '新增體檢報告':'검진 보고서 추가','尚無體檢報告':'검진 보고서가 없습니다',
 '每份報告獨立計分；即使檢測日期相同，也能分開查看。只有實際檢測日期決定今日證據時效，與上傳時間無關。':'검진 보고서는 같은 날짜라도 각각 평가합니다. 업로드 날짜가 아닌 실제 검사 날짜로 기록 시점을 판단합니다.',
 '與上次體檢的變化':'이전 검진과 비교','僅比較單位、參考區間與方法相同的指標；以超出適用參考區間的幅度比較，區間內的移動不等同惡化，也不代表疾病診斷。':'단위·참고 범위·검사 방법이 같은 항목만 비교합니다. 참고 범위 안에서의 변화만으로 악화나 질병을 판단하지 않습니다.',
 '兩次均在參考區間內':'두 검사 모두 참고 범위 안','轉好 · 超出參考區間幅度縮小':'참고 범위 이탈 폭 감소','偏離程度相近':'이탈 정도 비슷함','輕微偏離增加':'이탈 폭 약간 증가','偏離幅度增加':'이탈 폭 증가','偏離幅度顯著增加':'이탈 폭 크게 증가',
 '心臟與循環':'심장과 순환','呼吸與氧合':'호흡과 산소화','腎功能':'신장 기능','肝功能':'간 기능','代謝與體況':'대사와 신체 상태','血液與其他':'혈액 및 기타',
 '項指標':'개 지표','項需留意':'개 주의 항목','項高風險':'개 높은 주의 항목','項可比較':'개 비교 가능','點擊展開':'눌러 펼치기',
 '返回體檢報告列表':'검진 보고서 목록으로','檢測日期：':'검사 날짜:','檢測機構：':'검사 기관:','數據：':'검사 항목:','天前':'일 전','項可評估':'개 평가 가능','項（':'개 (',
 '健康':'양호','低風險':'낮은 주의','中風險':'중간 주의','高風險':'높은 주의','判讀背景：檢測當日約 ':'검사 당시 기준: 약 ',
 '參考區間需符合物種、年齡、體重、檢驗方法和來源；不可因長期異常就當成正常。':'참고 범위는 동물종·나이·체중·검사 방법·출처에 맞아야 합니다. 오래 지속된 이상을 정상으로 간주하지 않습니다.',
 '當時報告分 ':'검사 당시 점수 ','。體檢只參與長期 Pet Wellness Model，不改動當天的身體狀態或身體節奏。原始報告分數不因日期變舊而改變；時效僅影響長期模型。':'점. 검진은 장기 Pet Wellness Model에만 반영되며 오늘의 신체 상태·리듬 점수를 바꾸지 않습니다. 원래 검진 점수는 시간이 지나도 변하지 않습니다.',
 '此報告尚無可顯示的檢驗數值。':'표시할 검사 값이 없습니다.','編輯這份報告':'이 보고서 수정','刪除報告':'보고서 삭제',
 '內建測試報告僅用於驗收流程；此分級是候選工程模型，尚未經獸醫臨床驗證。所有新上傳數值應與實際檢驗單核對。':'내장 보고서는 예시 자료입니다. 이 점수 체계는 수의학적 검증이 완료된 진단 도구가 아닙니다. 실제 검사표를 확인하세요.',
 '請選擇新增方式；每一種方式都會先開啟完整的可編輯體檢表。':'추가 방식을 선택하면 편집 가능한 검진 양식이 열립니다.',
 '手動填寫':'직접 입력','本地檔案':'로컬 파일','上傳照片':'사진 업로드','拍照':'사진 촬영','新增項目':'새 검사 항목','刪除':'삭제',
 '指標代碼／名稱':'검사 코드 또는 이름','指標名稱':'검사 항목명','結果單位':'결과 단위','參考區間單位':'참고 범위 단위','參考下限':'참고 하한','參考上限':'참고 상한',
 '報告標註':'검사표 표시','按數值評估':'수치에 따라 평가','原單標示正常':'검사표상 정상','原單標示異常':'검사표상 이상','原單標示嚴重異常':'검사표상 중대한 이상',
 '必填':'필수','已預填 ':'미리 입력된 ',' 項可修改的範例數值。這不是自動 OCR 辨識結果；請根據實際檢驗單核對。':'개 예시 값이며 수정할 수 있습니다. OCR로 자동 인식한 값이 아니므로 검사표와 대조하세요.',
 '請逐項填入並核對 ':'다음 항목을 입력하고 확인하세요: ',' 項檢驗資料；本模式不預填任何檢驗數值。':'개 검사 값. 이 방식에서는 값을 미리 입력하지 않습니다.',
 '保存將更新目前這一份報告。':'저장하면 현재 보고서가 수정됩니다.','直接保存會建立一份新的獨立報告。':'저장하면 새로운 독립 보고서가 만들어집니다.',
 '附上檔案或照片':'파일 또는 사진 첨부','實際檢測日期':'실제 검사 날짜','醫療機構':'검사 기관','檢測當日年齡（歲，可選）':'검사 당시 나이(세, 선택)','檢測當日體重（kg，可選）':'검사 당시 체중(kg, 선택)',
 '檢測日期是唯一的時效基準，上傳日期不影響計分。':'검사 날짜만 기록 시점의 기준이며 업로드 날짜는 점수에 영향을 주지 않습니다.','檢驗結果 · ':'검사 결과 · ',' 項（可逐項修改）':'개 항목(각각 수정 가능)',
 '＋ 新增一項檢驗指標':'＋ 검사 항목 추가','確認並保存完整報告':'보고서 확인 후 저장','取消':'취소','編輯體檢報告':'검진 보고서 수정','結果':'결과',
 '已保存 ':'저장 완료: ',' 的體檢報告，共 ':' 검진 보고서 · 총 ',' 項檢驗結果。':'개 검사 결과.','返回主頁':'홈으로','應急與變化提醒':'긴급 및 변화 알림','查看全部':'전체 보기',
 '非今日採用報告（0%）':'오늘 반영되지 않은 보고서(0%)'
};
function localizeExamMarkup(html){
 let out=String(html??'');
 if(state.lang==='zht')return out;
 if(!['zh','en','ja','ko'].includes(state.lang))return out;
 const entries=Object.entries(EXAM_COPY).sort((a,b)=>b[0].length-a[0].length),idx=state.lang==='ja'?1:0;
 const koEntries=Object.entries(EXAM_COPY_KO).sort((a,b)=>b[0].length-a[0].length);
 const translate=value=>{
  let result=String(value);
  if(state.lang==='zh')return typeof toSimplified==='function'?toSimplified(result):result;
  if(state.lang==='ko'){for(const [zh,translated] of koEntries)result=result.split(zh).join(translated);return result;}
  for(const [zh,translated] of entries)result=result.split(zh).join(translated[idx]);
  return result;
 };
 // Translate visible text and fixed placeholders ONLY. Never modify an input
 // value, data-id, report code, file reference, or an owner-entered clinic.
 if(typeof document!=='undefined'&&document.createElement){
  const template=document.createElement('template');template.innerHTML=out;
  const walker=document.createTreeWalker(template.content,NodeFilter.SHOW_TEXT);
  const currentName=String(typeof currentDog==='function'?currentDog()?.name||'':'');
  const clinics=new Set((typeof getGroups==='function'?getGroups():[]).map(g=>String(g.clinic||'')));
  while(walker.nextNode()){
   const node=walker.currentNode;
   if(node.parentElement?.closest('script,style,textarea,[data-dp921-raw]'))continue;
   // Dynamic pet identities, test names and clinic labels are source data,
   // even if they coincidentally contain a term in the translation glossary.
   if(node.parentElement?.matches('.dp920-lab-row summary strong,.dp921-test-head b')||clinics.has(node.nodeValue))continue;
   if(currentName&&node.nodeValue.startsWith(currentName+' · ')){
    node.nodeValue=currentName+translate(node.nodeValue.slice(currentName.length));continue;
   }
   if(node.parentElement?.matches('.dp921-report-copy small')&&node.nodeValue.includes(' · ')){
    const cut=node.nodeValue.lastIndexOf(' · ');
    node.nodeValue=node.nodeValue.slice(0,cut)+translate(node.nodeValue.slice(cut));continue;
   }
   node.nodeValue=translate(node.nodeValue);
  }
  for(const node of template.content.querySelectorAll('[placeholder]'))node.setAttribute('placeholder',translate(node.getAttribute('placeholder')));
  return template.innerHTML;
 }
 // Isolated Node VM test fallback: protect raw labels before walking visible
 // HTML text. A combined regex used to consume the opening '<' of the next
 // span, so its protected content could accidentally be translated.
 const protectedSpans=[];
 out=out.replace(/<span\b[^>]*data-dp921-raw[^>]*>[\s\S]*?<\/span>/g,block=>{
  const token=`__DP921_RAW_${protectedSpans.length}__`;protectedSpans.push(block);return token;
 });
 out=out.replace(/>([^<]*)</g,(_,visible)=>'>'+translate(visible)+'<');
 protectedSpans.forEach((block,i)=>{out=out.replace(`__DP921_RAW_${i}__`,block);});
 return out;
}
const dateToday=()=>typeof iso==='function'?iso(localDate()):new Date().toISOString().slice(0,10);
const dateBefore=(days)=>{const d=new Date(dateToday()+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-days);return d.toISOString().slice(0,10)};
const validExamDate=value=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value&&value<=dateToday()};
const profile=petIndex=>({...allPets()[petIndex],...(state.petOverrides?.[petIndex]||{})});
const TEST_LABELS={
 WBC:['白血球','White blood cells'],RBC:['紅血球','Red blood cells'],HGB:['血紅蛋白','Hemoglobin'],HCT:['血球容積比','Hematocrit'],MCV:['平均紅血球體積','Mean corpuscular volume'],MCH:['平均血紅蛋白量','Mean corpuscular hemoglobin'],MCHC:['平均血紅蛋白濃度','Mean corpuscular HGB concentration'],PLT:['血小板','Platelets'],
 ALT:['丙胺酸轉氨酶','Alanine aminotransferase'],AST:['天門冬胺酸轉氨酶','Aspartate aminotransferase'],ALP:['鹼性磷酸酶','Alkaline phosphatase'],GGT:['γ-麩胺醯轉移酶','Gamma-glutamyl transferase'],TBIL:['總膽紅素','Total bilirubin'],ALB:['白蛋白','Albumin'],GLOB:['球蛋白','Globulin'],TP:['總蛋白','Total protein'],
 GLU:['血糖','Glucose'],BUN:['血中尿素氮','Blood urea nitrogen'],CREA:['肌酸酐','Creatinine'],SDMA:['對稱二甲基精胺酸','Symmetric dimethylarginine'],Na:['鈉','Sodium'],K:['鉀','Potassium'],Cl:['氯','Chloride'],Ca:['鈣','Calcium'],P:['磷','Phosphorus'],CHOL:['總膽固醇','Cholesterol'],CK:['肌酸激酶','Creatine kinase'],CRP:['C 反應蛋白','C-reactive protein'],TSH:['甲狀腺刺激素','Thyroid-stimulating hormone'],TRIG:['甘油三酯','Triglycerides']
};
const TEST_KO={WBC:'백혈구',RBC:'적혈구',HGB:'헤모글로빈',HCT:'헤마토크릿',MCV:'평균 적혈구 용적',MCH:'평균 적혈구 혈색소량',MCHC:'평균 혈색소 농도',PLT:'혈소판',ALT:'알라닌 아미노전이효소',AST:'아스파르테이트 아미노전이효소',ALP:'알칼리성 인산분해효소',GGT:'감마 글루타밀 전이효소',TBIL:'총 빌리루빈',ALB:'알부민',GLOB:'글로불린',TP:'총 단백질',GLU:'혈당',BUN:'혈중 요소 질소',CREA:'크레아티닌',SDMA:'대칭 디메틸아르기닌',NA:'나트륨',K:'칼륨',CL:'염소',CA:'칼슘',P:'인',CHOL:'총 콜레스테롤',CK:'크레아틴 키나아제',CRP:'C-반응성 단백질',TSH:'갑상선 자극 호르몬',TRIG:'중성지방'};
const TEST_JA={WBC:'白血球',RBC:'赤血球',HGB:'ヘモグロビン',HCT:'ヘマトクリット',MCV:'平均赤血球容積',MCH:'平均赤血球ヘモグロビン量',MCHC:'平均赤血球ヘモグロビン濃度',PLT:'血小板',ALT:'アラニンアミノトランスフェラーゼ',AST:'アスパラギン酸アミノトランスフェラーゼ',ALP:'アルカリホスファターゼ',GGT:'γ-GT',TBIL:'総ビリルビン',ALB:'アルブミン',GLOB:'グロブリン',TP:'総蛋白',GLU:'血糖',BUN:'尿素窒素',CREA:'クレアチニン',SDMA:'対称性ジメチルアルギニン',NA:'ナトリウム',K:'カリウム',CL:'クロール',CA:'カルシウム',P:'リン',CHOL:'総コレステロール',CK:'クレアチンキナーゼ',CRP:'C反応性蛋白',TSH:'甲状腺刺激ホルモン',TRIG:'中性脂肪'};
function labelTest(code){const name=String(code||'').trim(),key=name.toUpperCase(),pair=TEST_LABELS[key]||TEST_LABELS[name];if(!pair)return name;
 const lang=state.lang;if(lang==='en')return pair[1]+' ('+name+')';if(lang==='ko')return (TEST_KO[key]||pair[1])+' ('+name+')';if(lang==='ja')return (TEST_JA[key]||pair[1])+' ('+name+')';const zh=lang==='zh'&&typeof toSimplified==='function'?toSimplified(pair[0]):pair[0];return zh+'（'+name+'）';}
const DEMO_TESTS=[
 ['WBC',5.5,16.9,'10⁹/L'],['RBC',5.5,8.5,'10¹²/L'],['HGB',120,180,'g/L'],['HCT',37,55,'%'],['MCV',60,77,'fL'],['MCH',19,25,'pg'],['MCHC',320,360,'g/L'],['PLT',170,500,'10⁹/L'],
 ['ALT',10,100,'U/L'],['AST',10,50,'U/L'],['ALP',20,150,'U/L'],['GGT',0,10,'U/L'],['TBIL',0,9,'µmol/L'],['ALB',26,40,'g/L'],['GLOB',20,40,'g/L'],['TP',52,78,'g/L'],
 ['GLU',3.9,7.8,'mmol/L'],['BUN',2.5,9.6,'mmol/L'],['CREA',44,159,'µmol/L'],['SDMA',0,14,'µg/dL'],['Na',140,155,'mmol/L'],['K',3.6,5.5,'mmol/L'],['Cl',105,120,'mmol/L'],['Ca',2.15,2.85,'mmol/L'],['P',.8,2.1,'mmol/L'],['CHOL',2.8,8,'mmol/L'],['CK',20,200,'U/L'],['CRP',0,10,'mg/L'],['TSH',0.02,0.5,'ng/mL'],['TRIG',.2,1.8,'mmol/L']
];
// Candidate display intervals for seeded synthetic dogs/cats, NOT a validated age/weight matched population registry.
function demoRows(petIndex,revision=0){
 const p=profile(petIndex),cat=String(p.species||'').toLowerCase()==='cat';
 return DEMO_TESTS.map(([name,low,high,unit],i)=>{
  let lo=low,hi=high;
  if(cat){if(name==='RBC'){lo=5;hi=10;}if(name==='HCT'){lo=30;hi=45;}if(name==='ALT'){lo=12;hi=130;}if(name==='CREA'){lo=70;hi=180;}if(name==='WBC'){lo=5.5;hi=19.5;}}
  const width=hi-lo,seed=(petIndex*37+i*13+revision*19)%29;
  const severity=[0,.065,.51,.83,.041,0,.34,.92,.18,.012,.69,0,.43,.76,.27,.12][petIndex%16];
  const datedFactor=[1,.78,.60][revision]||1;
  const level=severity*datedFactor;
  const interval=level<.035?29:level<.09?11:level<.22?7:level<.40?5:level<.65?4:3;
  const affected=level>.01&&((i+petIndex*3+revision)%interval===0);
  let v=lo+width*(.23+seed/29*.53);
  if(affected){const excess=.045+level*(.72+(i%5)*.14);v=i%4===0?lo-width*excess:hi+width*excess;}
  const date=dateBefore([8+petIndex%10,107+petIndex%21,335+petIndex%32][revision]);
  return {id:`sample-v921-${petIndex}-${revision}-${i}`,reportId:`demo-v921-${petIndex}-${revision}`,date,clinic:'DeepPet Sample Lab',name,value:Math.round(v*100)/100,unit,status:'unknown',referenceLow:lo,referenceHigh:hi,referenceUnit:unit,referenceSpecies:cat?'cat':'dog',referenceSource:'demonstration_interval_not_verified',verifiedByVet:false,source:'sample',sample:true};
 });
}
function hiddenIds(pet){const ids=state.dp921HiddenReports?.[String(pet)];return Array.isArray(ids)?ids:[];}
const reportKey=(id,date)=>`${String(id)}::${String(date)}`;
function isDemoGallery(petIndex){return Number.isInteger(petIndex)&&petIndex>=0&&petIndex<dogs.length;}
function recordsForPet(petIndex){
 if(root.DeepPetQA936?.virtualBlank?.())return [];
 const ids=hiddenIds(petIndex),rawOverride=state.dp921ReplacedReports?.[String(petIndex)],override=Array.isArray(rawOverride)?rawOverride:[];
 // All 15 editable showroom identities retain three synthetic lab histories;
 // Blank, New Pet and subsequently created owner pets start without samples.
 const demo=!isDemoGallery(petIndex)?[]:Array.from({length:3},(_,r)=>demoRows(petIndex,r)).flat().filter(x=>!ids.includes(x.reportId)&&!ids.includes(reportKey(x.reportId,x.date))&&!override.includes(x.reportId)&&!override.includes(reportKey(x.reportId,x.date)));
 const saved=state.userReportEntries?.[String(petIndex)];
 const custom=(Array.isArray(saved)?saved:[]).filter(x=>x&&typeof x==='object'&&!ids.includes(x.reportId)&&!ids.includes(reportKey(x.reportId,x.date))&&
  (isDemoGallery(petIndex)||!(x.sample===true||x.source==='sample'||x.source==='showcase')));
 // This collection is already explicitly selected by the pet slot. Bind
 // legacy untagged rows to that slot in memory without changing saved
 // records. A tagged record claiming another pet cannot enter the dossier.
 const expected=String(petIndex);
 return demo.concat(custom).filter(row=>{
  const claims=[row.petId,row.ownerPetId,row.profile?.petId].filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='');
  return claims.every(v=>String(v)===expected);
 }).map(row=>({...row,petId:expected}));
}
// Use identical report collection in Home, Health, Deep and fused scores.
root.dp914ReportRecords=recordsForPet;
function getGroups(petIndex=state.dog){
 const m=new Map();for(const row of recordsForPet(petIndex)){
  const id=String(row.reportId||'legacy:'+row.date),key=reportKey(id,row.date);
  if(!m.has(key))m.set(key,{id,key,date:row.date,clinic:row.clinic||'—',source:row.source||'manual',rows:[]});m.get(key).rows.push(row);
 }
 const p={...profile(petIndex),petId:String(petIndex)},L=root.DeepPetLabEvidence;
 return [...m.values()].map(g=>({...g,assessment:L?L.assess(g.rows,p,dateToday()):null})).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
}
function graded(score){return !finite(score)?'pending':score>=90?'healthy':score>=80?'mild':score>=60?'moderate':'risk';}
function grade(score){return !finite(score)?'N/A':score>=90?loc('健康','Healthy','건강','健康'):score>=80?loc('低風險','Low concern','낮은 위험','低リスク'):score>=60?loc('中風險','Moderate concern','중간 위험','中リスク'):loc('高風險','High concern','높은 위험','高リスク');}
const scoreText=x=>finite(x)?`${Math.round(x)} / 100`:'—';
let selectedReport=null,editor=null,editorSource='manual',savedBanner='';
function showList(){state.tab='health';state.detail='dp921-list';state.modal='';render(true);}
function showReport(key){selectedReport=key;state.tab='health';state.detail='dp921-report';state.modal='';render(true);}
function openLatest(){const latest=getGroups()[0];latest?showReport(latest.key):showList();}
function detailRow(x){
 const L=root.DeepPetLabEvidence,item=L.item(x,profile(state.dog),x.date),ref=item.reference||{},value=item.kind==='numeric'?ref.value:Number(x.value),ok=item.kind==='numeric';
 const conflicting=item.kind==='needs_review'&&item.reason==='value_flag_conflict';
 const referenceReady=ref.ok===true&&Number.isFinite(ref.low)&&Number.isFinite(ref.high)&&Number.isFinite(ref.value);
 const delta=referenceReady?(ref.value<ref.low?ref.value-ref.low:ref.value>ref.high?ref.value-ref.high:0):null,unit=x.referenceUnit||ref.unit||x.unit||'—';
 const gap=delta===null?null:Math.abs(delta)/Math.max(Math.abs(ref.high-ref.low),.000001)*100;
 const direction=conflicting?loc('報告標註與數值不一致','Report label and value disagree','검사표 표시와 측정값 불일치','検査票の判定と数値が不一致'):!ok?'N/A':delta===0?loc('在參考範圍內','Within reference range','참고 범위 안','基準範囲内'):delta>0?loc('高於上限','Above upper bound','상한 초과','上限超過'):loc('低於下限','Below lower bound','하한 미만','下限未満');
 const width=gap===null?'—':`${Math.abs(delta).toFixed(2)} ${escapeHTML(unit)} (${loc('區間寬度','interval width','참고 범위 폭','基準範囲幅')} ${gap.toFixed(1)}%)`;
 const reference=escapeHTML(x.referenceSource||ref.referenceSource||'unverified');
 return `<details class="dp920-lab-row ${graded(item.score)}"><summary><span><strong>${escapeHTML(labelTest(x.name))}</strong><small>${escapeHTML(x.value)} ${escapeHTML(x.unit)}</small></span><span class="dp920-risk">${grade(item.score)}</span><b class="dp938-score-ring">${finite(item.score)?Math.round(item.score):'N/A'}<small>${finite(item.score)?'/100':''}</small></b></summary><div class="dp920-lab-detail">
 <div>${loc('檢測值','Test result','검사 결과','検査値')}<b>${escapeHTML(x.value)} ${escapeHTML(x.unit)}</b></div>
 <div>${loc('參考下限','Reference lower bound','참고 하한','基準範囲下限')}<b>${referenceReady?escapeHTML(ref.low):'—'} ${escapeHTML(unit)}</b></div>
 <div>${loc('參考上限','Reference upper bound','참고 상한','基準範囲上限')}<b>${referenceReady?escapeHTML(ref.high):'—'} ${escapeHTML(unit)}</b></div>
 <div>${loc('偏離方向','Deviation direction','이탈 방향','逸脱方向')}<b class="dp938-risk-value">${direction}</b></div>
 <div>${loc('超出幅度','Deviation amount','이탈 정도','逸脱量')}<b class="dp938-risk-value">${width}</b></div>
 <div>${loc('指標分數','Test score','검사 항목 점수','項目スコア')}<b class="dp938-score-ring dp938-mini-score">${finite(item.score)?Math.round(item.score):'N/A'}<small>${finite(item.score)?'/100':''}</small></b></div>
 <p>${loc('參考依據','Reference source','참고 근거','基準の出典')}: <span data-dp921-raw>${reference}</span> · ${conflicting?loc('原報告標註與檢驗數值不一致，請核對原檢驗單；此項暫不評分。','The report label conflicts with the test value. Check the original report; scoring is withheld.','검사표 표시와 측정값이 일치하지 않습니다. 원본을 확인할 때까지 점수를 보류합니다.','検査票の判定と測定値が一致しません。原本確認まで採点を保留します。'):ok?loc('按適用上下限及偏離幅度計算，並非疾病機率。','Calculated from applicable reference bounds and deviation; not a disease probability.','적용 참고 범위와 이탈 정도로 계산하며 질병 확률을 뜻하지 않습니다.','適用基準範囲と逸脱量から算出し、疾患の確率ではありません。'):loc('數值、單位或適用上下限未核對，暫不評分。','Values, units or reference bounds are unverified; no score yet.','검사 값·단위·참고 범위가 확인되지 않아 점수를 보류합니다.','数値・単位・基準範囲を確認できないため採点を保留します。')}</p></div></details>`;
}
function listPage(){const groups=getGroups();return `<div class="app-pad care-record-page dp921-page"><section class="dp921-heading"><button class="dp916-back" data-dp921="back-health">‹ ${loc('返回健康管理','Back to Health','건강으로 돌아가기','健康へ戻る')}</button><h2>${loc('體檢分析','Exam analysis','검진 분석','検診分析')}</h2><p>${escapeHTML(currentDog().name)} · ${groups.length} ${loc('份獨立體檢報告（依實際檢測日排序）','separate examinations, ordered by test date','개 검사 결과','件の検診結果')}</p></section>${savedBanner?`<p class="dp921-success">${escapeHTML(savedBanner)}</p>`:''}<button class="dp916-primary dp921-full" data-dp921="choose-source">＋ ${loc('新增體檢報告','Add examination report','검진 보고서 추가','検診を追加')}</button><div class="dp921-reports">${groups.map((g,i)=>{const a=g.assessment;return `<button class="dp921-report-entry" data-dp921="open-report" data-id="${escapeHTML(g.key)}"><span class="dp921-report-index">${i+1}</span><span class="dp921-report-copy"><strong>${escapeHTML(g.date)}</strong><small>${escapeHTML(g.clinic)} · ${g.rows.length} ${loc('項檢驗','tests','개 항목','項目')}</small><small>${a?.count||0} ${loc('項可評估','assessable','개 평가 가능','項目評価可能')}</small></span><span class="dp921-score ${graded(a?.score)}">${finite(a?.score)?Math.round(a.score):'—'}<small>${grade(a?.score)}</small></span><span class="dp921-arrow">›</span></button>`}).join('')||'<p class="dp916-muted">尚無體檢報告</p>'}</div><p class="dp916-muted">每份報告獨立計分；即使檢測日期相同，也能分開查看。只有實際檢測日期決定今日證據時效，與上傳時間無關。</p></div>`;}
function comparableExamChange(current,previous){
 if(!previous)return '';
 const byName=new Map(previous.rows.map(r=>[String(r.name||'').toUpperCase(),r]));
 const changed=[];
 for(const r of current.rows){const prev=byName.get(String(r.name||'').toUpperCase());if(!prev)continue;
  const a=Number(r.value),b=Number(prev.value),low=Number(r.referenceLow),high=Number(r.referenceHigh);
  if([r.value,prev.value,r.referenceLow,r.referenceHigh,prev.referenceLow,prev.referenceHigh].some(v=>v===null||v===undefined||String(v).trim()==='')||
   !Number.isFinite(a)||!Number.isFinite(b)||!Number.isFinite(low)||!Number.isFinite(high)||high<=low||String(r.unit||'')!==String(prev.unit||'')||
   Number(prev.referenceLow)!==low||Number(prev.referenceHigh)!==high||
   ['referenceSpecies','referenceBreed','referenceLifeStage','referenceSource','referenceAgeMinYears','referenceAgeMaxYears','referenceWeightMinKg','referenceWeightMaxKg'].some(k=>String(r[k]??'')!==String(prev[k]??''))||
   String(r.methodId||'')!==String(prev.methodId||''))continue;
  // Two values anywhere inside the same suitable interval are both in range;
  // drifting toward its edge alone is not evidence of deterioration.
  const deviation=v=>v<low?(low-v)/(high-low):v>high?(v-high)/(high-low):0;
  const was=deviation(b),now=deviation(a);
  const change=now-was;
  const level=change<=.06?'healthy':change<.30?'mild':change<.75?'moderate':'risk';
  const verdict=was===0&&now===0?'兩次均在參考區間內':change<-.06?'轉好 · 超出參考區間幅度縮小':Math.abs(change)<=.06?'偏離程度相近':level==='mild'?'輕微偏離增加':level==='moderate'?'偏離幅度增加':'偏離幅度顯著增加';
  if(Math.abs(a-b)<1e-9)continue;
  changed.push({name:r.name,previous:b,current:a,unit:r.unit,verdict,level});
 }
 if(!changed.length)return '';
 return `<details class="dp921-exam-comparison"><summary><strong>與上次體檢的變化</strong><span>${changed.length} 項可比較 · 點擊展開</span></summary><p>僅比較單位、參考區間與方法相同的指標；以超出適用參考區間的幅度比較，區間內的移動不等同惡化，也不代表疾病診斷。</p><div class="dp921-compare-items">${changed.map(x=>`<div class="dp938-change-${x.level}"><b>${escapeHTML(labelTest(x.name))}</b><span>${x.previous} → ${x.current} ${escapeHTML(x.unit)}</span><small>${x.verdict}</small></div>`).join('')}</div></details>`;
}
function detailPage(){const g=getGroups().find(g=>g.key===selectedReport);if(!g)return listPage();const a=g.assessment,pet=profile(state.dog),reports=getGroups(),previous=reports.find(x=>x.date<g.date&&x.key!==g.key),comparison=comparableExamChange(g,previous);
 const cats=[['cardiac','心臟與循環'],['resp','呼吸與氧合'],['renal','腎功能'],['hepatic','肝功能'],['metabolic','代謝與體況'],['blood','血液與其他']];
 const chunks=cats.map(([id,title])=>{const rows=g.rows.filter(x=>root.DeepPetLabEvidence.family(x.name)===id);if(!rows.length)return '';const score=a?.domains?.find(d=>d.key===id)?.score,flagged=rows.map(x=>root.DeepPetLabEvidence.item(x,pet,x.date)).filter(x=>finite(x.score)&&x.score<90),risk=flagged.filter(x=>x.score<60).length;return `<details class="dp920-domain ${graded(score)}"><summary><strong>${title}</strong><span class="dp938-domain-count">${rows.length} 項指標 · ${flagged.length} 項需留意${risk?` · ${risk} 項高風險`:''}</span><b class="dp938-score-ring dp938-domain-score">${finite(score)?Math.round(score):'N/A'}<small>${finite(score)?'/100':''}</small></b></summary>${rows.map(detailRow).join('')}</details>`}).filter(Boolean).join('');
 const ready=a?.records?.filter(x=>finite(x.score))||[],stats=[0,1,2,3].map(i=>ready.filter(x=>x.level===i).length);
 const d=a?.daysOld,weight=root.DeepPetSignalScoring?.getDaily(state.dog)?.at(-1)?.reportEvidence;
 const wb=weight?.reportId===g.id?Math.round(100*(weight.weight||0))+'%':'非今日採用報告（0%）';
 return `<div class="app-pad care-record-page dp921-page"><button class="dp916-back" data-dp921="list">‹ 返回體檢報告列表</button><div class="dp921-details-head"><div><p class="dp916-eyebrow">${escapeHTML(pet.name)} · ${pet.species==='cat'?'貓':'犬'}</p><h2>${loc('體檢分析 · 檢測報告','Examination report','검진 보고서','検診報告')}</h2><p><b>檢測日期：</b>${escapeHTML(g.date)} · ${d} 天前</p><p><b>檢測機構：</b>${escapeHTML(g.clinic)}</p><p><b>數據：</b>${g.rows.length} 項（${ready.length} 項可評估）</p></div><span class="dp921-score dp921-big ${graded(a?.score)}">${finite(a?.score)?Math.round(a.score):'—'}<small>${grade(a?.score)}</small></span></div>${a?.reason==='report_profile_conflict'?`<p class="dp918-pending-notice">${loc('同一份報告的檢測當日年齡或體重不一致，請核對後才計分。','The examination has conflicting age or weight snapshots. Review before scoring.','검사 당시 나이 또는 체중이 서로 달라 확인 전에는 점수를 산정하지 않습니다.','検査時の年齢または体重に矛盾があります。確認まで採点しません。')}</p>`:''}<div class="dp920-levels">${stats.map((n,i)=>`<span class="${['healthy','mild','moderate','risk'][i]}"><b>${n}</b>${['健康','低風險','中風險','高風險'][i]}</span>`).join('')}</div><p class="dp920-profile">判讀背景：檢測當日約 ${Number.isFinite(a?.profile?.ageYears)?a.profile.ageYears.toFixed(1):'—'} 歲 · ${escapeHTML(a?.profile?.weightKg??pet.weight??'—')} kg。參考區間需符合物種、年齡、體重、檢驗方法和來源；不可因長期異常就當成正常。</p><p class="dp916-muted">當時報告分 ${scoreText(a?.score)}。體檢只參與長期 Pet Wellness Model，不改動當天的身體狀態或身體節奏。原始報告分數不因日期變舊而改變；時效僅影響長期模型。</p>${chunks||'<p class="dp916-muted">此報告尚無可顯示的檢驗數值。</p>'}${comparison}<div class="dp921-actions"><button data-dp921="edit-report" data-id="${escapeHTML(g.key)}" class="dp916-primary">編輯這份報告</button><button data-dp921="delete-report" data-id="${escapeHTML(g.key)}" class="dp916-secondary">刪除報告</button></div><p class="dp916-muted">內建測試報告僅用於驗收流程；此分級是候選工程模型，尚未經獸醫臨床驗證。所有新上傳數值應與實際檢驗單核對。</p></div>`;}
// Let owners reopen the actual IndexedDB attachment from the existing report
// details page. A PDF/image saved with a numeric report must not be stranded.
const originalDetailPage=detailPage;
detailPage=function(){const html=originalDetailPage(),g=getGroups().find(x=>x.key===selectedReport),attachmentId=g?.rows.find(x=>x.attachmentId)?.attachmentId;if(!attachmentId)return html;
 return html.replace('<div class="dp921-actions">',`<div class="dp921-actions"><button data-dp921="open-attachment" data-id="${escapeHTML(g.key)}" class="dp916-secondary">${loc('下載原始報告附件','Download original attachment','원본 첨부파일 다운로드','元の添付ファイルをダウンロード')}</button>`);};
function defaultTemplate(){const rows=demoRows(state.dog,0),preFill=isDemoGallery(state.dog)&&!root.DeepPetProductionMode;
 // Only gallery identities may prefill synthetic lab example values. Real pets get empty inputs.
 return rows.map(r=>({name:r.name,value:preFill?r.value:'',unit:preFill?r.unit:'',referenceUnit:preFill?r.unit:'',status:'unknown',referenceLow:preFill?r.referenceLow:'',referenceHigh:preFill?r.referenceHigh:'',referenceSource:preFill?'user_reviewed_template':'unreviewed',referenceSpecies:r.referenceSpecies}));}
function chooseSource(){editor=null;editorSource='manual';paintEditor('choice');}
function openWizard(source='manual',id=null){editorSource=source;const g=id?getGroups().find(g=>g.key===id):null;editor={id:g?.id||null,originalDate:g?.date||null,date:g?.date||dateToday(),clinic:g?.clinic||(isDemoGallery(state.dog)&&!root.DeepPetProductionMode?'DeepPet Sample Lab':''),ageAtExamYears:g?.rows?.[0]?.ageAtExamYears??'',weightAtExamKg:g?.rows?.[0]?.weightAtExamKg??'',file:null,items:g?g.rows.map(x=>({...x})):defaultTemplate()};paintEditor('edit');}
function paintEditor(mode){let host=document.getElementById('dp921-editor');if(!host){host=document.createElement('div');host.id='dp921-editor';document.body.append(host);}const title=loc('體檢報告核對','Review examination','검진 결과 확인','検診内容確認');
 if(mode==='choice'){host.innerHTML=`<div class="dp916-shade"><section class="dp916-sheet dp921-sheet"><button class="dp916-x" data-dp921="cancel">×</button><h2>新增體檢報告</h2><p>請選擇新增方式；每一種方式都會先開啟完整的可編輯體檢表。</p><div class="dp916-choices">${[['manual','手動填寫'],['file','本地檔案'],['photo','上傳照片'],['camera','拍照']].map(([k,v])=>`<button data-dp921="source" data-source="${k}">${v}</button>`).join('')}</div></section></div>`;return;}
 if(!editor){host.innerHTML='';return;}
 const rowParts=editor.items.map((x,i)=>`<section class="dp921-editor-row" data-dp921-row="${i}"><div class="dp921-test-head"><b>${i+1}. ${escapeHTML(x.name?labelTest(x.name):'新增項目')}</b><button data-dp921="remove-item" data-index="${i}" type="button">刪除</button></div><div class="dp921-fields"><label>指標代碼／名稱<input data-field="name" value="${escapeHTML(x.name)}" placeholder="指標名稱"/></label><label>結果<input data-field="value" type="number" step="any" value="${escapeHTML(x.value)}"/></label><label>結果單位<input data-field="unit" value="${escapeHTML(x.unit)}"/></label><label>參考區間單位<input data-field="referenceUnit" value="${escapeHTML(x.referenceUnit||'')}" placeholder="必填"/></label><label>參考下限<input data-field="referenceLow" type="number" step="any" value="${escapeHTML(x.referenceLow)}"/></label><label>參考上限<input data-field="referenceHigh" type="number" step="any" value="${escapeHTML(x.referenceHigh)}"/></label><label>報告標註<select data-field="status">${[['unknown','按數值評估'],['normal','原單標示正常'],['alert','原單標示異常'],['critical','原單標示嚴重異常']].map(([v,t])=>`<option value="${v}" ${x.status===v?'selected':''}>${t}</option>`).join('')}</select></label></div></section>`);
 const groupNames=[['blood','血液與其他'],['hepatic','肝功能'],['renal','腎功能'],['metabolic','代謝與體況'],['cardiac','心臟與循環'],['resp','呼吸與氧合']];
 const itemGroups=editor.items.map((x,i)=>({group:root.DeepPetLabEvidence?.family(x.name)||'blood',html:rowParts[i]}));
 const chunks=groupNames.map(([id,title])=>{const entries=itemGroups.filter(x=>x.group===id);if(!entries.length)return '';return `<details class="dp924-editor-group" data-group="${id}" ${editor.openGroup===id?'open':''}><summary><strong>${title}</strong><span>${entries.length} 項指標 · ${loc('點擊展開核對','Tap to review','눌러 확인','タップして展開')}</span></summary><div class="dp924-editor-group-body">${entries.map(e=>e.html).join('')}</div></details>`;}).filter(Boolean).join('');
 host.innerHTML=`<div class="dp916-shade"><section class="dp916-sheet dp921-sheet" role="dialog" aria-modal="true" aria-label="${title}"><button class="dp916-x" data-dp921="cancel">×</button><h2>${editor.id?'編輯體檢報告':title}</h2><p class="dp921-template-note">${(!isDemoGallery(state.dog)||root.DeepPetProductionMode)?`請逐項填入並核對 ${editor.items.length} 項檢驗資料；本模式不預填任何檢驗數值。`:`已預填 ${editor.items.length} 項可修改的範例數值。這不是自動 OCR 辨識結果；請根據實際檢驗單核對。`}${editor.id?'保存將更新目前這一份報告。':'直接保存會建立一份新的獨立報告。'}</p>${editorSource==='file'||editorSource==='photo'||editorSource==='camera'?`<label class="dp921-attach">附上檔案或照片<input id="dp921-attach" type="file" accept=".pdf,image/*" ${editorSource==='camera'?'capture="environment"':''}/></label>${editor.file?`<small>${escapeHTML(editor.file.name)}</small>`:''}`:''}<div class="dp921-meta"><label>實際檢測日期<input id="dp921-date" type="date" max="${dateToday()}" value="${escapeHTML(editor.date)}" required/></label><label>醫療機構<input id="dp921-clinic" value="${escapeHTML(editor.clinic)}" required/></label><label>檢測當日年齡（歲，可選）<input id="dp921-age-at-exam" type="number" min="0" max="40" step=".1" value="${escapeHTML(editor.ageAtExamYears)}"/></label><label>檢測當日體重（kg，可選）<input id="dp921-weight-at-exam" type="number" min=".1" max="200" step=".1" value="${escapeHTML(editor.weightAtExamKg)}"/></label></div><p class="dp916-muted">檢測日期是唯一的時效基準，上傳日期不影響計分。</p><h3>檢驗結果 · ${editor.items.length} 項（可逐項修改）</h3><div class="dp921-editor-results">${chunks}</div><button class="dp916-secondary dp921-full" data-dp921="add-item">＋ 新增一項檢驗指標</button><div class="dp921-sticky"><button class="dp916-secondary" data-dp921="cancel">取消</button><button class="dp916-primary" data-dp921="save">確認並保存完整報告</button></div></section></div>`;
}
function captureEditor(){if(!editor)return;editor.date=document.getElementById('dp921-date')?.value||editor.date;editor.clinic=document.getElementById('dp921-clinic')?.value??editor.clinic;editor.ageAtExamYears=document.getElementById('dp921-age-at-exam')?.value??editor.ageAtExamYears;editor.weightAtExamKg=document.getElementById('dp921-weight-at-exam')?.value??editor.weightAtExamKg;
 const previous=editor.items;
 // Preserve non-editable provenance, per-test age/weight applicability and
 // original attachment IDs. Rebuilding only the visible inputs silently erased
 // these fields each time an existing examination was edited.
 editor.items=[...document.querySelectorAll('#dp921-editor [data-dp921-row]')].map(row=>{const i=Number(row.dataset.dp921Row);return {...(previous[i]||{}),...Object.fromEntries([...row.querySelectorAll('[data-field]')].map(inp=>[inp.dataset.field,inp.value]))};});}
// Paint once with the existing form builder, then localize only its display
// markup; the original record values and editable inputs are unchanged.
const paintEditorOriginal=typeof paintEditor==='function'?paintEditor:null;
if(paintEditorOriginal)paintEditor=function(mode){paintEditorOriginal(mode);const host=document.getElementById('dp921-editor');if(host?.innerHTML)host.innerHTML=localizeExamMarkup(host.innerHTML);};
function closeEditor(){editor=null;document.getElementById('dp921-editor')?.replaceChildren();}
function releaseUnreferencedAttachments(ids){
 if(typeof dpDiscardUncommittedReportFile!=='function')return;
 const kept=new Set(Object.values(state.userReportEntries||{}).flatMap(rows=>Array.isArray(rows)?rows:[]).map(row=>row?.attachmentId).filter(Boolean));
 // Older in-app attachment workflows can also own these IndexedDB blobs.
 for(const row of state.reportUploads||[])if(row?.attachmentId)kept.add(row.attachmentId);
 if(state.importFileId)kept.add(state.importFileId);
 for(const id of new Set(ids.filter(Boolean)))if(!kept.has(id))dpDiscardUncommittedReportFile(id);
}
const EXAM_NOTICE={
 invalidMeta:['請填寫有效的實際檢測日期與醫療機構。','Enter a valid test date and veterinary clinic.','유효한 검사 날짜와 동물병원을 입력하세요.','有効な検査日と動物病院名を入力してください。'],
 noTests:['請至少保留一項檢驗結果。','Keep at least one test result.','검사 결과를 한 항목 이상 입력하세요.','検査結果を1項目以上入力してください。'],
 invalidValue:['檢驗數值必須是有效數字。','Each test result must be a valid number.','검사 결과는 유효한 숫자여야 합니다.','検査値は有効な数値にしてください。'],
 missingUnit:['請核對結果單位與參考區間單位；兩者不能留白。','Both result and reference units are required.','결과 단위와 참고 범위 단위를 모두 입력하세요.','結果単位と基準範囲の単位を入力してください。'],
 invalidBounds:['檢驗參考上限必須大於下限。','The reference upper bound must exceed the lower bound.','참고 상한은 하한보다 커야 합니다.','基準範囲の上限は下限より大きくしてください。'],
 unitMismatch:['檢驗數值單位與參考區間單位不相容，請先修正。','Result and reference units are incompatible. Correct them first.','결과 단위와 참고 범위 단위가 호환되지 않습니다. 먼저 수정하세요.','結果単位と基準範囲の単位が一致しません。修正してください。'],
 attachmentUnavailable:['目前無法儲存體檢附件，報告尚未保存。','Cannot store the attachment. The report was not saved.','첨부파일을 저장할 수 없어 보고서도 저장되지 않았습니다.','添付ファイルを保存できず、レポートも保存されませんでした。'],
 attachmentFailed:['體檢附件儲存失敗，請確認儲存空間後重新嘗試。報告尚未保存。','Attachment storage failed. Check available storage and retry; the report was not saved.','첨부파일 저장에 실패했습니다. 저장 공간 확인 후 다시 시도하세요. 보고서는 저장되지 않았습니다.','添付ファイルの保存に失敗しました。空き容量を確認して再試行してください。レポートは保存されていません。'],
 saveFailed:['本機儲存失敗，已恢復原有報告。請確認瀏覽器儲存空間後重試。','Local saving failed; the original report was restored. Check browser storage and retry.','로컬 저장에 실패하여 기존 보고서를 복원했습니다. 브라우저 저장 공간을 확인하고 다시 시도하세요.','保存できなかったため元のレポートに戻しました。ブラウザの保存容量を確認してください。'],
 deleteFailed:['本機儲存失敗，原有報告未刪除。','Local saving failed; the original report was not deleted.','로컬 저장에 실패하여 기존 보고서는 삭제되지 않았습니다.','保存に失敗したため、元のレポートは削除されませんでした。'],
};
function examMessage(zh,en,ko,ja){const result=loc(zh,en,ko,ja);return state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(result):result;}
function examNotice(code){return examMessage(...EXAM_NOTICE[code]);}
async function save(){captureEditor();if(!editor)return;const e=editor;if(!validExamDate(e.date)||!e.clinic.trim()||(e.ageAtExamYears!==''&&(!Number.isFinite(+e.ageAtExamYears)||+e.ageAtExamYears<0||+e.ageAtExamYears>40))||(e.weightAtExamKg!==''&&(!Number.isFinite(+e.weightAtExamKg)||+e.weightAtExamKg<=0||+e.weightAtExamKg>200))){alert(examNotice('invalidMeta'));return;}
 const items=e.items.filter(x=>String(x.name||'').trim()&&String(x.value??'').trim());if(!items.length){alert(examNotice('noTests'));return;}
 for(const x of items){if(!Number.isFinite(Number(x.value))){alert(examNotice('invalidValue'));return;}if(!x.unit?.trim()||!x.referenceUnit?.trim()){alert(examNotice('missingUnit'));return;}
  // A half-entered interval is not an absent interval. Validate both bounds
  // at the save boundary, not only once the laboratory engine later refuses
  // to score this test.
  if(!dpReportBoundsValid(x.referenceLow,x.referenceHigh)){alert(examNotice('invalidBounds'));return;}
  if(String(x.referenceLow??'').trim()!==''&&root.DeepPetLabEvidence.matchUnit(Number(x.value),x.unit,x.referenceUnit,x.name).error){alert(examNotice('unitMismatch'));return;}}
 // The IndexedDB upload may take seconds. Do not let a pet switch attach A's
 // examination to B, or replace an editor B opened while A was uploading.
 const pet=String(state.dog),petEpoch=state.dpPetEpoch;
 let attachmentId=null;if(e.file){if(typeof dpSaveReportFile!=='function'){alert(examNotice('attachmentUnavailable'));return;}try{attachmentId=await dpSaveReportFile(e.file)}catch(err){console.warn('Attachment not stored',err);alert(examNotice('attachmentFailed'));return;}}
 if(String(state.dog)!==pet||state.dpPetEpoch!==petEpoch||editor!==e){if(attachmentId&&typeof dpDiscardUncommittedReportFile==='function')dpDiscardUncommittedReportFile(attachmentId);if(editor===e)closeEditor();return;}
 const id=e.id||`user-${Date.now()}-${Math.floor(Math.random()*100000)}`;
 state.userReportEntries??={};state.userReportEntries[pet]??=[];
 const previousReports=state.userReportEntries[pet].slice(),previousReplacements=(state.dp921ReplacedReports?.[pet]||[]).slice();
 const oldAttachments=state.userReportEntries[pet].filter(x=>String(x.reportId)===id&&x.date===e.originalDate).map(x=>x.attachmentId);
 const selectedAttachment=attachmentId||e.items.find(x=>x.attachmentId)?.attachmentId||null;
 if(e.id){
  state.userReportEntries[pet]=state.userReportEntries[pet].filter(x=>!(String(x.reportId)===id&&x.date===e.originalDate));
  if(id.startsWith('demo-v921')){
   const key=reportKey(id,e.originalDate);state.dp921ReplacedReports??={};state.dp921ReplacedReports[pet]??=[];
   if(!state.dp921ReplacedReports[pet].includes(key))state.dp921ReplacedReports[pet].push(key);
  }
 }
 const wasDemoTemplate=isDemoGallery(state.dog)&&!e.id&&items.every(x=>String(x.referenceSource||'').includes('user_reviewed_template'));for(let i=0;i<items.length;i++){const x=items[i];state.userReportEntries[pet].push({...x,id:`${id}-${i}`,reportId:id,date:e.date,clinic:e.clinic,ageAtExamYears:e.ageAtExamYears===''?null:Number(e.ageAtExamYears),weightAtExamKg:e.weightAtExamKg===''?null:Number(e.weightAtExamKg),source:editorSource,referenceSpecies:profile(state.dog).species,referenceSource:wasDemoTemplate?'user_reviewed_template':'user_entered_unverified',verifiedByVet:false,demoTemplate:wasDemoTemplate,attachmentId:selectedAttachment});}
 root.DeepPetSignalScoring?.invalidate(state.dog);const stored=persist();
 if(!stored){state.userReportEntries[pet]=previousReports;if(state.dp921ReplacedReports?.[pet])state.dp921ReplacedReports[pet]=previousReplacements;root.DeepPetSignalScoring?.invalidate(state.dog);if(attachmentId&&typeof dpDiscardUncommittedReportFile==='function')dpDiscardUncommittedReportFile(attachmentId);alert(examNotice('saveFailed'));return;}
 releaseUnreferencedAttachments(oldAttachments);closeEditor();savedBanner=loc(`已保存 ${e.date} 的體檢報告，共 ${items.length} 項檢驗結果。`,`Saved examination ${e.date} with ${items.length} results.`,`검진 보고서 ${e.date} · 검사 결과 ${items.length}개를 저장했습니다.`,`検診レポート ${e.date} に検査結果 ${items.length} 件を保存しました。`);showList();
}
function deleteReport(id){const g=getGroups().find(g=>g.key===id);if(!g)return;if(!confirm(examMessage(`確定刪除 ${g.date} 的整份體檢報告（${g.rows.length} 項）？`,`Delete the entire examination report dated ${g.date} (${g.rows.length} tests)?`,`검사 날짜 ${g.date}의 보고서 전체(${g.rows.length}개 항목)를 삭제하시겠습니까?`,`検査日 ${g.date} のレポート全体（${g.rows.length} 項目）を削除しますか？`)))return;const pet=String(state.dog),attachments=g.rows.map(row=>row.attachmentId);
 state.userReportEntries??={};
 const previousReports=(state.userReportEntries?.[pet]||[]).slice(),previousHidden=(state.dp921HiddenReports?.[pet]||[]).slice();
 state.userReportEntries[pet]=(state.userReportEntries?.[pet]||[]).filter(x=>!(String(x.reportId)===g.id&&x.date===g.date));
 state.dp921HiddenReports??={};state.dp921HiddenReports[pet]??=[];if(!state.dp921HiddenReports[pet].includes(g.key))state.dp921HiddenReports[pet].push(g.key);
 root.DeepPetSignalScoring?.invalidate(state.dog);const stored=persist();
 if(!stored){state.userReportEntries[pet]=previousReports;state.dp921HiddenReports[pet]=previousHidden;root.DeepPetSignalScoring?.invalidate(state.dog);alert(examNotice('deleteFailed'));return;}
 releaseUnreferencedAttachments(attachments);savedBanner=loc('已刪除指定體檢報告。','Selected examination report deleted.','선택한 검진 보고서를 삭제했습니다.','選択した検診レポートを削除しました。');showList();}
// HRV demo fixture: mean NN is not available in the minute-only renderer. Values below
// represent a separately delivered SDK mock channel for test pets, not inferred HRV.
root.DeepPetDemoHrv921={get(petIndex,date,day,feature){
 if(!feature?.quality?.heartValid)return null;
 // The same independent per-day HRV sample fields feed the chart and score engine.
 // They are fixture data, NOT computed from the minute-averaged heart-rate series.
 const raw=typeof demoRecords==='function'?demoRecords(petIndex).find(r=>r.date===date):null;
 return Number.isFinite(raw?.rmssd)&&Number.isFinite(raw?.sdnn)?{rmssd:raw.rmssd,sdnn:raw.sdnn,source:'sdk-demo-fixture'}:null;
}};
const previousDemoEvent=root.dp911EventFor;
if(typeof previousDemoEvent==='function')root.dp911EventFor=function(date,kind){
 // Three healthy, data-complete example animals should not inherit synthetic urgency fixtures.
 return [0,5,11].includes(state.dog)?null:previousDemoEvent(date,kind);
};
function alertsPage(){
 const today=iso(localDate()),empty=selectedBlank()||dp58FreshPet()||isFreePet();
 const latest=empty?null:root.DeepPetSignalScoring?.getDaily(state.dog)?.find(x=>x?.date===today),events=(latest?.integrity?.alerts||[]).filter(x=>x?.date===today);
 const title=loc('應急與變化提醒','Priority changes','우선 변화 알림','重要な変化の通知');
 const noData=loc('今天尚無有效量測，無法判斷是否有變化。','No verified reading today; changes cannot be assessed.','오늘 유효 측정 기록이 없어 변화를 판단할 수 없습니다.','本日は有効な測定記録がないため、変化を判定できません。');
 const noAlerts=loc('今日沒有已確認的變化提醒。','No verified changes to review today.','오늘 확인된 변화 알림이 없습니다.','本日確認された変化の通知はありません。');
 const kindName=x=>x.kind==='breath'?loc('呼吸變化','Breathing change','호흡 변화','呼吸の変化'):loc('心跳變化','Heartbeat change','심박 변화','心拍の変化');
 return `<div class="app-pad care-record-page dp921-page"><button class="dp916-back" data-dp921="back-home">‹ ${loc('返回主頁','Back to Home','홈으로','ホームへ')}</button><h2>${title}</h2><p>${escapeHTML(currentDog().name)} · ${today} · ${events.length} ${loc('項','items','건','件')}</p>${events.length?events.map((x,i)=>`<button class="dp921-report-entry dp921-full" data-dp921="go-alert" data-kind="${escapeHTML(x.kind||'heart')}"><span class="dp921-report-index">${i+1}</span><span class="dp921-report-copy"><strong>${escapeHTML(kindName(x))}</strong><small>${loc('查看 Deep 心肺分析','View Deep heart/breathing analysis','Deep 심폐 분석 보기','Deepの心肺分析を見る')}</small></span><span>›</span></button>`).join(''):`<p>${latest?noAlerts:noData}</p>`}</div>`;
}
const oldDetail=healthDetail;
healthDetail=function(){if(state.detail==='dp921-list'||state.detail==='reports')return localizeExamMarkup(listPage());if(state.detail==='dp921-report')return localizeExamMarkup(detailPage());if(state.detail==='dp921-alerts')return localizeExamMarkup(alertsPage());return oldDetail();};
const oldModalUI=modalUI;
modalUI=function(){const html=oldModalUI();if(state.modal!=='show-summary')return html;const day=root.DeepPetSignalScoring?.getDaily(state.dog)?.find(x=>x?.date===iso(localDate())),s=day?.scoreLineage;if(!s||!finite(s.sensorComposite))return html;
 const p=loc('今日分數說明','About today’s score','오늘의 점수 안내','今日のスコアについて');
 const observedEvent=(day?.integrity?.alerts||[]).length>0;
 const audit=`<div class="dp921-lineage"><b>${p}</b><p>心肺 ${s.cardio??'—'} 分 · 睡眠 ${s.sleep??'—'} 分 · 精力與恢復 ${s.activityRecovery??'—'} 分。</p><p>${observedEvent?'今天心跳／呼吸的有效變化，已反映在對應生理子項中。':'今天只依據有效感測資料計分。'}</p><p class="dp921-lineage-total">今日身體狀態 <b>${s.final}/100</b></p><small>可以進入「體檢分析」查看檢驗數值，或在 Deep 查看心肺與休息趨勢。</small></div>`;
 return html.replace('<div class="summary-three-rings">',audit+'<div class="summary-three-rings">');};
const oldUrgent=dp66UrgentHome;
dp66UrgentHome=function(){const html=oldUrgent();const today=iso(localDate()),events=(root.DeepPetSignalScoring?.getDaily(state.dog)?.find(x=>x?.date===today)?.integrity?.alerts||[]).filter(x=>x?.date===today);
 if(!events.length||events.length<=3)return html;
 const at=html.lastIndexOf('</section>');return at<0?html:html.slice(0,at)+`<button class="dp921-urgent-more" data-dp921="all-alerts">More · 查看全部 ${events.length} 項提醒</button>`+html.slice(at);
};
// Demonstrate more than three alerts if generated, without inventing extra signal events.
const oldRender=render;
render=function(reset){oldRender(reset);if(state.tab==='home'){
 const lane=document.querySelector('#app .dp-health-lane .dp-lane-description'),d=root.DeepPetSignalScoring?.getDaily(state.dog)?.find(x=>x?.date===iso(localDate()));if(lane&&d?.scoreLineage&&finite(d.scoreLineage.final))lane.title=`今日身體狀態 ${d.scoreLineage.final} 分；點擊查看今日摘要`;
 }};
document.addEventListener('click',e=>{const el=e.target?.closest?.('[data-dp921="open-attachment"]');if(!el)return;
 e.preventDefault();e.stopImmediatePropagation();const g=getGroups().find(x=>x.key===el.dataset.id),id=g?.rows.find(x=>x.attachmentId)?.attachmentId;if(id&&typeof dpOpenReportFile==='function')dpOpenReportFile(id);},true);
document.addEventListener('change',e=>{if(e.target?.id==='dp921-attach'&&editor){captureEditor();editor.file=e.target.files?.[0]||null;paintEditor('edit');}},true);
document.addEventListener('click',e=>{const el=e.target?.closest?.('[data-dp921]');if(!el)return;e.preventDefault();e.stopPropagation();const a=el.dataset.dp921;
 if(a==='back-health'){state.detail=null;render(true)}else if(a==='list')showList();else if(a==='open-report')showReport(el.dataset.id);else if(a==='choose-source')chooseSource();else if(a==='source')openWizard(el.dataset.source);else if(a==='edit-report')openWizard('manual',el.dataset.id);else if(a==='delete-report')deleteReport(el.dataset.id);else if(a==='cancel')closeEditor();else if(a==='add-item'){captureEditor();editor.items.push({name:'',value:'',unit:'',referenceUnit:'',status:'unknown',referenceLow:'',referenceHigh:''});editor.openGroup='blood';paintEditor('edit')}else if(a==='remove-item'){captureEditor();editor.openGroup=el.closest('.dp924-editor-group')?.dataset.group||null;editor.items.splice(Number(el.dataset.index),1);paintEditor('edit')}else if(a==='save')save();else if(a==='all-alerts'){state.tab='health';state.detail='dp921-alerts';render(true)}else if(a==='back-home'){state.tab='home';state.detail=null;render(true)}else if(a==='go-alert'){state.tab='deep';state.detail=null;state.deepType=0;render(true)}
},true);
root.DeepPetExam921={recordsForPet,getGroups,showList,openLatest,openWizard,showReport,resetEditor:closeEditor,source:'candidate-demo-data'};
root.DeepPetSignalScoring?.invalidate();
})(typeof window==='object'?window:globalThis);
