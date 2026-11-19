/* DeepPet V9.27 | i18n for examination workflows; visible high-priority alerts.
 * Only consumer-facing wording is changed: no alternate score formulas.
 */
(function(root){'use strict';
const translations={
 '檢測日期': ['Test date','검사일','検査日'], '檢測機構':['Veterinary clinic','검사 기관','検査機関'], '數據':['Results','결과','検査値'],
 '判讀背景':['Interpretation context','판독 조건','判定条件'], '實際檢測日期':['Actual test date','실제 검사일','実際の検査日'],
 '檢測值':['Measured result','검사 수치','測定値'], '參考下限':['Reference low','기준 하한','基準下限'], '參考上限':['Reference high','기준 상한','基準上限'],
 '參考區間單位':['Reference unit','기준 단위','基準単位'], '結果單位':['Result unit','결과 단위','測定単位'],
 '偏離方向':['Deviation direction','범위 이탈 방향','逸脱方向'], '超出幅度':['Amount beyond range','기준 범위 초과','範囲外の程度'],
 '指標分數':['Test score','항목 점수','項目スコア'], '參考依據':['Reference source','참고 기준','基準の出典'],
 '在參考範圍內':['Within reference range','기준 범위 내','基準範囲内'], '高於上限':['Above upper limit','상한 초과','上限超過'], '低於下限':['Below lower limit','하한 미만','下限未満'],
 '待核對':['Review required','확인 필요','要確認'], '當時報告分':['Report score at test date','검사 당시 점수','検査時点のスコア'],
 '與上次體檢的變化':['Changes since previous examination','이전 검사 대비 변화','前回検診との変化'],
 '點擊展開':['Tap to expand','눌러 펼치기','タップして展開'], '點擊展開核對':['Tap to review','눌러 확인','タップして確認'],
 '心臟與循環':['Heart and circulation','심장 및 순환','心臓・循環'], '呼吸與氧合':['Breathing and oxygenation','호흡 및 산소화','呼吸・酸素化'],
 '腎功能':['Kidney function','신장 기능','腎機能'], '肝功能':['Liver function','간 기능','肝機能'],
 '代謝與體況':['Metabolism and condition','대사 및 체형','代謝・体格'], '血液與其他':['Blood and other','혈액 및 기타','血液・その他'],
 '返回體檢報告列表':['Back to reports','검진 목록으로','検診一覧へ'], '返回主頁':['Back to Home','홈으로','ホームへ'],
 '編輯這份報告':['Edit this report','이 보고서 편집','この報告を編集'], '刪除報告':['Delete report','보고서 삭제','報告を削除'],
 '新增體檢報告':['Add examination','검진 보고서 추가','検診を追加'], '編輯體檢報告':['Edit examination','검진 편집','検診を編集'],
 '手動填寫':['Manual entry','수동 입력','手動入力'], '本地檔案':['Choose file','파일 선택','ファイルを選択'],
 '上傳照片':['Upload photo','사진 업로드','写真を追加'], '拍照':['Take photo','촬영','写真を撮る'],
 '體檢報告核對':['Review examination','검진 내용 확인','検診内容の確認'], '檢驗結果':['Test results','검사 결과','検査結果'],
 '檢驗參考下限':['Reference low','기준 하한','基準下限'], '檢驗參考上限':['Reference high','기준 상한','基準上限'],
 '原單標示正常':['Marked normal','원본 정상 표시','報告書で正常'], '原單標示異常':['Marked abnormal','원본 이상 표시','報告書で異常'],
 '原單標示嚴重異常':['Marked critical','원본 고위험 표시','報告書で重度異常'], '按數值評估':['Evaluate by values','수치로 평가','数値で評価'],
 '報告標註':['Report flag','보고서 표시','報告書の判定'], '指標代碼／名稱':['Test code/name','검사항목 코드/이름','検査項目コード・名称'],
 '新增項目':['New test','새 검사 항목','新しい項目'], '新增一項檢驗指標':['Add another test','검사 항목 추가','項目を追加'],
 '附上檔案或照片':['Attach file/photo','파일·사진 첨부','ファイル・写真を添付'],
 '醫療機構':['Veterinary clinic','동물병원','動物病院'], '實際檢測日期':['Actual test date','실제 검사일','実際の検査日'],
 '檢測當日年齡':['Age at test','검사 당시 나이','検査時年齢'], '檢測當日體重':['Weight at test','검사 당시 체중','検査時体重'],
 '可選':['optional','선택','任意'], '必填':['required','필수','必須'], '取消':['Cancel','취소','キャンセル'], '刪除':['Remove','삭제','削除'],
 '確認並保存完整報告':['Confirm and save report','확인 후 저장','確認して保存'],
 '需要留意':['Needs attention','주의 필요','要注意'], '中風險':['Moderate concern','중간 위험','中程度の注意'], '低風險':['Low concern','낮은 위험','軽度の注意'],
 '高風險':['High concern','높은 위험','注意が必要'], '健康':['Within range','정상 범위','基準範囲内'],
 '天前':['days ago','일 전','日前'], '項可評估':['assessable tests','개 평가 가능','項目を評価可能'], '項檢驗':['tests','개 검사','検査項目'],
 '項指標':['tests','개 항목','項目'], '項可比較':['comparable tests','개 항목 비교 가능','項目を比較可能'],
 '回到主頁':['Back to Home','홈으로','ホームへ'], '應急與變化提醒':['Important changes','중요한 변화','重要な変化'],
 '查看 Deep 心肺分析與資料曲線':['View Deep heart/breathing trends','심폐 추세 확인','心肺の傾向を見る'],
 '今天沒有已偵測的變化提醒':['No observed changes requiring review today','오늘 확인할 변화 없음','本日の注意変化なし'],
 '：':[': ',': ', '：']
};
const entries=Object.entries(translations).sort((a,b)=>b[0].length-a[0].length);
const localeIndex=()=>state.lang==='en'?0:state.lang==='ko'?1:state.lang==='ja'?2:-1;
function translate(){const idx=localeIndex();if(idx<0)return;
 for(const selector of ['#app .dp921-page','#dp921-editor']){
  const area=document.querySelector(selector);if(!area)continue;
  const walker=document.createTreeWalker(area,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){if(!node.parentElement||node.parentElement.closest('script,style'))continue;
   let s=node.nodeValue||'';if(!/[\u3400-\u9fff]/.test(s))continue;
   for(const [from,to] of entries){if(s.includes(from))s=s.split(from).join(to[idx]);}
   if(s!==node.nodeValue)node.nodeValue=s;
  }
  area.querySelectorAll('input[placeholder]').forEach(input=>{let v=input.getAttribute('placeholder');for(const [from,to] of entries)if(v.includes(from))v=v.split(from).join(to[idx]);input.setAttribute('placeholder',v);});
 }
}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;translate()});}
const priorRender=render;
render=function(reset=false){priorRender(reset);schedule();};
const observer=new MutationObserver(ms=>{if(ms.some(m=>m.target?.id==='dp921-editor'||m.target?.closest?.('#dp921-editor')||[...m.addedNodes].some(n=>n.nodeType===1&&n.id==='dp921-editor')))schedule();});
observer.observe(document.body,{childList:true,subtree:true});
if(document.readyState!=='loading')schedule();else document.addEventListener('DOMContentLoaded',schedule,{once:true});
root.DeepPetUI927={translate,version:'9.27'};
})(window);
