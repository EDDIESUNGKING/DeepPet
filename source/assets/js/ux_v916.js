/* DeepPet V9.16 | Health dossier, evidence index and care-plan adherence.
   Candidate design: not a validated disease diagnosis or an OCR engine.
   All exported calculations intentionally pure and server-migration-friendly. */
(function(){'use strict';
const clip=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
const n=x=>Number.isFinite(Number(x))?Number(x):null;
const l=(zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:zh;
const escV=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>typeof iso==='function'?iso(localDate()):new Date().toISOString().slice(0,10);
const families=[
 ['cardiac',['心臟與循環','Cardiac & circulation','심장·순환','心臓・循環'],.26,/NT.?PROBNP|TROPONIN|CARDIAC|ECHO|心臟|心脏|心超|心肌/i],
 ['resp',['呼吸與氧合','Respiratory & oxygen','호흡·산소','呼吸・酸素'],.20,/SPO2|BLOOD GAS|呼吸|血氧|氧飽和|氧饱和|氣道|气道|LUNG|RESPIR/i],
 ['renal',['腎功能','Kidney','신장','腎臓'],.17,/CREA|CREATININE|BUN|SDMA|腎|肾|尿素/i],
 ['hepatic',['肝功能','Liver','간','肝臓'],.11,/ALT|AST|ALP|GGT|BILE|TBIL|肝|胆紅|胆红/i],
 ['metabolic',['代謝與體況','Metabolic & body condition','대사·체형','代謝・体調'],.16,/GLU|FRUCTOSAMINE|BCS|OBESITY|肥胖|體況|体况|糖|體重|体重/i],
 ['blood',['血液與其他','Blood & other','혈액·기타','血液・その他'],.10,/./]
];
function family(name){return families.find(f=>f[0]!=='blood'&&f[3].test(String(name||'')))?.[0]||'blood';}
function graded(v){return v===null?'none':v>=90?'healthy':v>=80?'mild':v>=60?'moderate':'risk';}
function grade(v){return v===null?l('資料不足','Insufficient data','데이터 부족','データ不足'):v>=90?l('健康','Healthy','건강','健康'):v>=80?l('低風險','Mild','경도 주의','軽度'):v>=60?l('中風險','Moderate','중간 주의','中程度'):l('高風險','Risk','고위험','高リスク');}
const severity=x=>{const s=String(x.status||'unknown').toLowerCase();return s==='critical'?2:s==='alert'||s==='abnormal'?1:s==='normal'||s==='healthy'||s==='ok'?0:null;};
function analyze(records,refDay=today(),profile=null){
 const L=window.DeepPetLabEvidence;
 const pet=profile||currentDog();
 const e=L?L.assess(records||[],pet,refDay):{score:null,present:false,records:[],alerts:[],domains:[],coverage:0,confidence:0};
 const labels=Object.fromEntries(families.map(f=>[f[0],l(...f[1])]));
 return {score:e.score??null,coverage:e.coverage??0,confidence:e.confidence??0,
  domains:(e.domains||[]).map(d=>({...d,label:labels[d.key]||d.key})),
  items:e.records||[],alerts:e.alerts||[],date:e.latest||null,daysOld:e.daysOld??null,
  pet:state.dog,count:e.records?.length||0,reviewed:e.count||0,
  pending:[...(e.records||[]).filter(r=>r.score===null),...(e.pendingRecords||[])],pendingLatest:e.pendingLatest??null,mostRecentSubmitted:e.mostRecentSubmitted??null,reason:e.reason||'',profile:e.profile||null};
}

function report(){try{return analyze(window.dp914ReportRecords?.(state.dog)||[],today(),{...currentDog(),petId:String(state.dog)})}catch(e){console.warn('Dossier index unavailable',e);return analyze([])}}
function pill(s){return `<span class="dp916-pill ${graded(s)}">${grade(s)}</span>`;}
function care(){
 const todayKey=today();let food=null,med=null,vax=null,worm=null;
 try{const total=dpFoodTotals(),hasFoodRecords=Array.isArray(total?.meals)?total.meals.length>0:Number(total?.mealCount||0)>0;const target=Number(targetFood()),actual=Number(total?.kcal);food=hasFoodRecords&&target>0?Math.round(clip(100-100*Math.abs(actual-target)/Math.max(target,1))):null;}catch{}
 try{const doses=dpMedDue(todayKey);med=doses.length?Math.round(doses.filter(x=>x.status==='taken').length/doses.length*100):null;}catch{}
 try{const rows=allVaxForDog();const scheduled=rows.filter(x=>x.date<=todayKey);vax=scheduled.length?Math.round(scheduled.filter(x=>x.status==='done').length/scheduled.length*100):null;}catch{}
 try{const rows=dpWormRows();const scheduled=rows.filter(x=>x.nextDate&&x.nextDate<=todayKey);if(scheduled.length){const due=scheduled.filter(x=>!rows.some(y=>y!==x&&y.date>=x.nextDate));worm=Math.round(100*(scheduled.length-due.length)/scheduled.length);}else worm=null;}catch{}
 return [{key:'food',label:l('飲食目標','Feeding plan','급여 목표','食事目標'),value:food,detail:l('今日熱量與目標的接近程度','Today’s logged calories vs target','오늘 칼로리 목표 대비','今日の摂取量と目標'),page:'food'},
 {key:'med',label:l('用藥安排','Medication plan','투약 일정','投薬予定'),value:med,detail:l('今日已確認的劑次比例','Doses confirmed today','오늘 확인된 투약 비율','本日の確認済み投与'),page:'med'},
 {key:'vax',label:l('疫苗計畫','Vaccination plan','예방접종 계획','予防接種計画'),value:vax,detail:l('已到期安排的完成比例','Due scheduled items completed','예정 완료율','期限到来の完了率'),page:'vaccines'},
 {key:'worm',label:l('驅蟲計畫','Deworming plan','구충 계획','駆虫計画'),value:worm,detail:l('已到期安排的完成比例','Due scheduled items completed','완료 비율','予定の完了率'),page:'deworming'}];
}
function summaryTile(){const d=report(),name=l('體檢分析','Exam analysis','검진 분석','検診分析');return `<section class="dp916-home-card"><div class="dp916-between"><div><span class="dp916-eyebrow">${l('長期健康證據','LONG-TERM EVIDENCE','장기 건강 근거','長期健康データ')}</span><h3>${name}</h3><p>${d.date?l('最近可評估報告：','Latest assessed examination: ','평가된 검사: ','評価済み検診：')+escV(d.date):l('尚未加入體檢報告','No examination report yet','검사 결과 없음','検査結果なし')}</p></div><div class="dp916-home-score ${graded(d.score)}">${d.score??'—'}<small>${d.score===null?l('待建立','Pending','대기','未登録'):'/100'}</small></div></div><p class="dp916-muted">${d.date?(d.alerts.length?l(`有 ${d.alerts.length} 項檢查結果值得追蹤，建議查看檢查日期與建議。`,`${d.alerts.length} result(s) deserve follow-up. Review the findings and dates.`,`${d.alerts.length}개 항목 확인 필요`,`確認すべき項目 ${d.alerts.length} 件`):l('檢驗紀錄可與日常趨勢一起比較。','Compare veterinary results with daily trends.','검사 결과와 일일 추세를 비교하세요.','検査結果と日々の傾向を比較できます。')):l('上傳檢查結果，建立日常監測之外的長期健康背景。','Add a report to enrich the longitudinal health record.','검사 결과를 추가하세요.','検診結果で健康記録を充実させましょう。')}</p><button class="dp916-primary" data-dp916="home-latest">${d.date?l('查看體檢分析','View exam insights','검진 인사이트','検診分析を見る'):l('新增體檢報告','Build health dossier','건강 기록 시작','健康ファイルを作成')}</button></section>`;}
function healthCard(){
 if(window.DeepPetCanonicalUI1075?.reportCard)return window.DeepPetCanonicalUI1075.reportCard();
 const d=report();return `<section class="dp916-health-card"><div class="dp916-between"><div><span class="dp914-report-illustration">${vicon('report',27)}</span><h3>${l('體檢分析','Exam analysis','검진 분석','検診分析')}</h3><p>${d.date?l('有效評估日期：','Assessed: ','평가 날짜: ','評価日：')+escV(d.date):l('尚無體檢紀錄','No report yet','검진 기록 없음','検診記録なし')}</p></div><div class="dp916-large-score ${graded(d.score)}">${d.score??'—'}</div></div><div class="dp916-actions"><button class="dp916-primary" data-dp916="wizard">${l('上傳／建立體檢報告','Upload / create exam report','검진 보고서 업로드·작성','検診結果を登録・作成')}</button><button class="dp916-secondary" data-dp916="open">${l('查看體檢紀錄','View exam records','검진 기록','検診記録を見る')}</button></div></section>`;
}
function advice(x){const f=family(x.name);const map={
 cardiac:l('記錄安靜呼吸與活動後恢復變化，向獸醫確認是否需要心臟複查。','Log resting breathing and recovery; ask your vet whether follow-up cardiac tests are appropriate.','휴식 호흡과 회복을 기록하세요.','安静時の呼吸と回復を記録してください。'),
 resp:l('記錄安靜呼吸率及異常出現時段，出現呼吸困難應即時尋求獸醫協助。','Log resting breathing and event times; seek prompt veterinary help for breathing difficulty.','호흡 변화를 기록하고 상담하세요.','呼吸変化を記録して相談してください。'),
 renal:l('留意飲水、排尿及食慾變化，依獸醫建議安排複查。','Track water intake, urination and appetite; arrange recheck as advised.','음수, 소변, 식욕을 기록하세요.','飲水、排尿、食欲を記録してください。'),
 hepatic:l('記錄食慾、精神、嘔吐及用藥情況，確認是否需複查。','Track appetite, energy, vomiting and medications; ask about follow-up.','식욕과 복약을 기록하세요.','食欲や投薬を記録してください。'),
 metabolic:l('記錄體重、食量及活動變化，與獸醫核對體況目標。','Track weight, food intake and activity; review body-condition goals with your vet.','체중과 식사량을 기록하세요.','体重と食事量を記録してください。'),
 blood:l('核對檢驗單位、參考範圍及複查時間。','Check units, report reference ranges and follow-up timing.','검사 범위를 확인하세요.','基準値と再検日を確認してください。')};return map[f]||map.blood;}
function insightView(){
 const d=report(),pets=currentDog(),rows=d.items||[],ready=rows.filter(x=>Number.isFinite(x.score));
 const counts=[0,1,2,3].map(i=>ready.filter(x=>x.level===i).length);
 const age=d.profile?.ageYears??pets.age,weight=d.profile?.weightKg??pets.weight;
 const show=x=>{
  const r=x.reference||{},ok=x.kind==='numeric',hasValue=x.value!==undefined&&x.value!==null;
  const v=ok?r.value:Number(x.value),lo=r.low,hi=r.high,unit=r.unit||x.unit||'—';
  const delta=ok?(v<lo?v-lo:v>hi?v-hi:0):null;
  const pctGap=ok&&delta!==null?100*Math.abs(delta)/Math.max(hi-lo,.001):null;
  const status=!ok?'待核對':['健康','低風險','中風險','高風險'][x.level??0];
  const cls=!ok?'pending':['healthy','mild','moderate','risk'][x.level??0];
  return `<details class="dp920-lab-row ${cls}"><summary><span><strong>${escV(x.name||'—')}</strong><small>${ok?escV(Number(v.toFixed(2)))+' '+escV(unit):hasValue?escV(x.value)+' '+escV(unit):'—'}</small></span><span class="dp920-risk">${status}</span><b>${Number.isFinite(x.score)?x.score+'/100':'—'}</b></summary><div class="dp920-lab-detail"><div><span>檢測值</span><b>${ok?escV(Number(v.toFixed(2))):escV(x.value??'—')} ${escV(unit)}</b></div><div><span>參考下限</span><b>${ok?escV(lo):'—'} ${escV(unit)}</b></div><div><span>參考上限</span><b>${ok?escV(hi):'—'} ${escV(unit)}</b></div><div><span>偏離方向</span><b>${!ok?'待確認':delta===0?'範圍內':delta>0?'高於上限':'低於下限'}</b></div><div><span>超出幅度</span><b>${!ok?'—':Math.abs(delta).toFixed(2)+' '+escV(unit)+'（區間寬度 '+pctGap.toFixed(1)+'%）'}</b></div><div><span>項目評分</span><b>${Number.isFinite(x.score)?x.score+'/100':'不計分'}</b></div><p>判讀依據：${escV(r.referenceSource||r.basis||'需確認報告參考區間')}；${!ok?'缺少適用參考區間／單位或資料衝突，暫不評分。':'依此檢驗項目的區間偏離程度計算，不等於疾病機率。'}</p></div></details>`;
 };
 const maxDays=d.daysOld??null;
 // A saved examination can be newer than the last collar reading. Disclose
 // TODAY's potential report weight using the exact existing fusion formula,
 // without implying that an absent daily sensor score was calculated.
 const todayKey=today(),fusionProbe=window.DeepPetReportFusion?.fuse?.({date:todayKey,scores:{}},window.dp914ReportRecords?.(state.dog)||[],todayKey,{...currentDog(),petId:String(state.dog)});
 const fusionWeight=fusionProbe?.reportEvidence?.weight;
 const head=`<section class="dp916-detail dp920-detail"><button data-dp916="back" class="dp916-back">‹ 返回健康管理</button><div class="dp916-between"><div><span class="dp916-eyebrow">${escV(pets.name||'')} · ${pets.species==='cat'?'貓':'犬'}</span><h2>體檢分析｜完整檢驗指標</h2><p>實際檢測日期：<b>${escV(d.date||'—')}</b>　${maxDays===null?'':`距今 ${maxDays} 天`}</p></div><div class="dp916-large-score ${graded(d.score)}">${d.score??'—'}<small>/100</small></div></div><p class="dp920-profile">檢測時背景：${Number(age).toFixed(1)} 歲 · ${escV(weight)} kg　｜參考區間必須符合犬／貓、年齡、體型及檢驗方法。</p><div class="dp920-levels">${['健康','低風險','中風險','高風險'].map((name,i)=>`<span class="${['healthy','mild','moderate','risk'][i]}"><b>${counts[i]}</b>${name}</span>`).join('')}</div><p class="dp916-muted">檢驗結果 ${ready.length} 項可評估；${rows.length-ready.length} 項待核對 · 以今天為基準的潛在報告參考權重 ${typeof fusionWeight==='number'?(fusionWeight*100).toFixed(1)+'%':'—'}。僅依實際檢測日期計算時效；沒有有效項圈分數的日期不會因此產生健康分數。</p>`;
 const domains=`<h3>依檢驗類別展開所有指標</h3>${d.domains.map(g=>`<details class="dp920-domain" open><summary><strong>${escV(g.label)}</strong><span>${g.count} 項有效指標 · ${g.score??'—'}/100</span></summary>${rows.filter(x=>x.family===g.key).map(show).join('')||'<p class="dp916-muted">此類別沒有檢驗資料</p>'}</details>`).join('')}`;
 const foot=`${d.pendingLatest?`<p class="dp918-pending-notice">較新的 ${escV(d.pendingLatest)} 檢測報告尚不足以評分，未取代上一份有效報告。</p>`:''}<p class="dp916-muted">所有指標可展開查看檢測值、單位、上下限、偏離幅度與分數。此為工程候選分級，不可直接用於疾病診斷；範例犬科參考區間不適用於所有品種／年齡／檢驗機構。</p><div class="dp916-actions"><button class="dp916-primary" data-dp916="wizard">新增體檢資料</button><button class="dp916-secondary" data-dp916="records">歷史報告與編輯</button></div></section>`;
 return head+domains+foot;
}
let wizard=null,stage='pick',source='manual';
function draft(){return {date:today(),clinic:'',notes:'',items:[{name:'ALT',value:'',unit:'U/L',status:'unknown',referenceLow:'',referenceHigh:'',referenceAgeMinYears:'',referenceAgeMaxYears:''}]};}
const exampleItems=[{name:'ALT',value:'',unit:'U/L',status:'unknown',referenceLow:'',referenceHigh:'',referenceAgeMinYears:'',referenceAgeMaxYears:''},{name:'CREA',value:'',unit:'mg/dL',status:'unknown',referenceLow:'',referenceHigh:'',referenceAgeMinYears:'',referenceAgeMaxYears:''},{name:'BCS',value:'',unit:'/9',status:'unknown',referenceLow:'',referenceHigh:'',referenceAgeMinYears:'',referenceAgeMaxYears:''}];
function wizardBody(){const w=wizard;let content='';if(stage==='prepare')content=`<p class="dp916-muted">${l('正在準備可核對的檢驗欄位……','Preparing fields for review…','항목 준비 중…','確認用の項目を準備中…')}</p><div class="dp916-progress"><i style="width:75%"></i></div>`;else if(stage==='pick')content=`<p>${l('選擇輸入方式。照片／檔案會先建立可核對的候選欄位，不會將範例數值視為已辨識結果。','Choose an input method. Photo/file starts with editable candidate fields, never automatically confirmed lab results.','입력 방법을 고르세요.','入力方法を選択')}</p><div class="dp916-choices">${[['file',l('本地檔案','Local file','파일','ファイル')],['photo',l('本地照片','Photo library','사진','写真')],['camera',l('拍照','Camera','카메라','カメラ')],['manual',l('手動填寫','Manual entry','직접 입력','手入力')]].map(([k,t])=>`<button data-dp916="pick" data-source="${k}">${t}</button>`).join('')}</div>`;
 else content=`<p class="dp916-muted">${source==='manual'?l('請輸入報告上的數值；無法確認的項目請保持待確認。','Enter values from your report; keep unknown results unreviewed.','검사값을 입력하세요.','値を入力してください。'):l('已建立可編輯欄位。現在未連接自動影像辨識；請依原始報告逐項核對後才可保存。','Editable fields are ready. Image recognition is not connected in this workflow; verify each result against the document before saving.','검사값을 확인하세요.','原本と照合して保存してください。')}</p>${source!=='manual'?`<label class="dp916-file-label">${l('附上原始檔案／照片','Attach source image/file','파일 첨부','添付ファイル')} <input id="dp916-file" type="file" accept="image/*,.pdf" ${source==='camera'?'capture="environment"':''}/></label>${w.file?`<p class="dp916-muted">${escV(w.file.name)}</p>`:''}`:''}<label>${l('體檢日期','Exam date','검사 날짜','検査日')}<input id="dp916-date" type="date" max="${today()}" value="${escV(w.date)}"/></label><label>${l('醫療機構','Clinic / laboratory','동물병원','医療機関')}<input id="dp916-clinic" value="${escV(w.clinic)}"/></label><p class="dp917-exam-profile">${l('判讀使用寵物檔案的種類、年齡及體重；身高和體況需在「我的→編輯檔案」填寫。參考上下限請抄自該份報告，沒有區間時不會僅憑上傳給高分。','Species, age and weight come from the pet profile. Add height/BCS in Me → Edit profile. Copy laboratory reference limits from this report; uploading alone never earns a high score.','품종·나이·체중을 확인하세요.','種別・年齢・体重と検査基準値を確認してください。')}</p><h4>${l('檢驗結果（可修改）','Review and edit results','검사 결과','検査結果')}</h4>${w.items.map((x,i)=>`<div class="dp916-edit-row" data-row="${i}"><input aria-label="Test name" data-field="name" value="${escV(x.name)}" placeholder="ALT / CREA / ..."/><input aria-label="Result" data-field="value" value="${escV(x.value)}" placeholder="${l('數值','Value','값','値')}"/><input aria-label="Unit" data-field="unit" value="${escV(x.unit)}" placeholder="Unit"/><select data-field="status"><option value="unknown" ${x.status==='unknown'?'selected':''}>${l('待確認','Unreviewed','미확인','未確認')}</option><option value="normal" ${x.status==='normal'?'selected':''}>${l('報告標示正常','Within report range','정상','基準内')}</option><option value="alert" ${x.status==='alert'?'selected':''}>${l('報告標示異常','Flagged in report','주의','異常')}</option><option value="critical" ${x.status==='critical'?'selected':''}>${l('報告標示嚴重異常','Critical flag in report','중증 이상','重大な異常')}</option></select><button data-dp916="remove-row" data-index="${i}" title="Remove">×</button><div class="dp917-references"><label>${l('報告參考下限','Lab lower limit','참고 하한','基準下限')}<input data-field="referenceLow" type="number" step="any" value="${escV(x.referenceLow??'')}" placeholder="—"/></label><label>${l('報告參考上限','Lab upper limit','참고 상한','基準上限')}<input data-field="referenceHigh" type="number" step="any" value="${escV(x.referenceHigh??'')}" placeholder="—"/></label><label>${l('適用最小年齡(歲)','Age from (years)','나이 시작','適用年齢から')}<input data-field="referenceAgeMinYears" type="number" min="0" max="35" step=".1" value="${escV(x.referenceAgeMinYears??'')}" placeholder="—"/></label><label>${l('適用最大年齡(歲)','Age to (years)','나이 끝','適用年齢まで')}<input data-field="referenceAgeMaxYears" type="number" min="0" max="35" step=".1" value="${escV(x.referenceAgeMaxYears??'')}" placeholder="—"/></label></div></div>`).join('')}<button class="dp916-secondary" data-dp916="add-row">＋ ${l('增加檢驗項目','Add test','항목 추가','項目追加')}</button><button class="dp916-primary" data-dp916="save">${l('確認並保存報告','Confirm and save report','확인 후 저장','確認して保存')}</button>`;
 return `<div class="dp916-shade"><div class="dp916-sheet"><button class="dp916-x" data-dp916="close">×</button><h2>${l('體檢資料整理','Examination review','검진 기록 검토','検診記録の確認')}</h2>${content}</div></div>`;}
function redrawWizard(){let root=document.getElementById('dp916-wizard');if(!root){root=document.createElement('div');root.id='dp916-wizard';document.body.appendChild(root);}root.innerHTML=wizard?wizardBody():'';}
function readDraft(){if(!wizard||stage!=='edit')return;wizard.date=document.getElementById('dp916-date')?.value||wizard.date;wizard.clinic=document.getElementById('dp916-clinic')?.value||'';wizard.items=[...document.querySelectorAll('.dp916-edit-row')].map(el=>Object.fromEntries([...el.querySelectorAll('[data-field]')].map(x=>[x.dataset.field,x.value])));}
function openWizard(){if(window.DeepPetExam921)return window.DeepPetExam921.openWizard();wizard=draft();stage='pick';redrawWizard();}
async function save(){readDraft();if(!wizard?.date||wizard.date>today()||!wizard.clinic.trim())return alert(l('請確認日期和醫療機構。','Check date and clinic.','날짜와 병원을 확인하세요.','日付と医療機関を確認してください。'));
 const items=wizard.items.filter(x=>x.name.trim()&&x.value.trim());if(!items.length)return alert(l('至少輸入一筆有效的檢驗結果。','Enter at least one result.','결과를 입력하세요.','結果を入力してください。'));
 for(const x of items){if(x.referenceAgeMinYears!==''&&x.referenceAgeMaxYears!==''&&Number(x.referenceAgeMinYears)>Number(x.referenceAgeMaxYears))return alert(l('年齡適用範圍有誤。','Check age reference limits.','나이 범위를 확인하세요.','年齢範囲を確認してください。'));if(!Number.isFinite(Number(x.value)))return alert(l('檢驗結果需要有效數值。','Test results must be numeric.','숫자를 확인하세요.','数値を確認してください。'));if(x.referenceLow!==''&&x.referenceHigh!==''&&Number(x.referenceLow)>=Number(x.referenceHigh)&&String(x.name).toUpperCase()!=='BCS')return alert(l('參考區間上下限有誤。','Check reference limits.','참고 범위를 확인하세요.','基準範囲を確認してください。'));}
 const originalWizard=wizard,pet=String(state.dog),petEpoch=state.dpPetEpoch;
 let attachmentId=null;if(wizard.file&&typeof dpSaveReportFile==='function'){try{attachmentId=await dpSaveReportFile(wizard.file)}catch(e){console.warn('Could not save original attachment',e);}}
 if(String(state.dog)!==pet||state.dpPetEpoch!==petEpoch||wizard!==originalWizard){if(attachmentId&&typeof dpDiscardUncommittedReportFile==='function')dpDiscardUncommittedReportFile(attachmentId);return;}
 const reportId='dossier'+Date.now();state.userReportEntries??={};state.userReportEntries[pet]??=[];
 for(const [i,x] of items.entries()){state.userReportEntries[pet].push({...x,id:reportId+'-'+i,reportId,date:wizard.date,clinic:wizard.clinic,source:attachmentId?'file':'manual',sourceFile:wizard.file?.name||'',verifiedByVet:false,attachmentId});}
 if(window.DeepPetSignalScoring?.invalidate)window.DeepPetSignalScoring.invalidate(state.dog);
 persist();wizard=null;redrawWizard();state.tab='health';state.detail='dp916-insight';render(true);
}
function show(){if(window.DeepPetExam921)return window.DeepPetExam921.showList();state.tab='health';state.detail='dp916-insight';render(true);}
function enhance(){const main=document.querySelector('.app-main');if(!main)return;
 // Main Health is fully rendered once in V10.75. Never prepend a historical
 // exam hero and care-completion template to an already complete page.
 if(state.tab==='health'&&!state.detail&&main.querySelector('.dp1075-health-page'))return;
 if(state.tab==='home'&&state.detail===null){const summary=main.querySelector('.summary-card');if(summary&&!main.querySelector('.dp916-home-card'))summary.insertAdjacentHTML('afterend',summaryTile());}
 // The main Health page is exclusively owned by the canonical renderer.
 // Never inject legacy report or plan-completion cards, even as a fallback:
 // those outdated blocks could put a huge progress ring beneath Health Care.
 if(state.tab==='health'&&state.detail==='reports'){main.querySelector('.care-record-page')?.querySelector('.dp-report-list')?.insertAdjacentHTML('beforebegin',healthCard());}
}
const oldHealthDetail=healthDetail;healthDetail=function(){if(state.detail==='dp916-insight')return `<div class="app-pad care-record-page">${insightView()}<div class="footer-space"></div></div>`;return oldHealthDetail();};
const oldRender=render;render=function(reset){oldRender(reset);enhance();};
document.addEventListener('change',ev=>{if(ev.target?.id==='dp916-file'&&wizard){readDraft();wizard.file=ev.target.files?.[0]||null;redrawWizard();}},true);
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-dp916]');if(!el)return;ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();const a=el.dataset.dp916;
 if(a==='home-latest'&&window.DeepPetExam921)window.DeepPetExam921.openLatest();else if(a==='open')show();else if(a==='wizard')openWizard();else if(a==='pick'){source=el.dataset.source;wizard.items=source==='manual'?draft().items:exampleItems.map(x=>({...x}));if(source==='manual'){stage='edit';redrawWizard();}else{stage='prepare';redrawWizard();const selected=source,ownerWizard=wizard,ownerPet=state.dog,ownerEpoch=state.dpPetEpoch;setTimeout(()=>{if(wizard===ownerWizard&&state.dog===ownerPet&&state.dpPetEpoch===ownerEpoch&&stage==='prepare'&&source===selected){stage='edit';redrawWizard();}},520);}}else if(a==='add-row'){readDraft();wizard.items.push({name:'',value:'',unit:'',status:'unknown',referenceLow:'',referenceHigh:'',referenceAgeMinYears:'',referenceAgeMaxYears:''});redrawWizard();}else if(a==='remove-row'){readDraft();wizard.items.splice(Number(el.dataset.index),1);if(!wizard.items.length)wizard.items.push({name:'',value:'',unit:'',status:'unknown',referenceLow:'',referenceHigh:'',referenceAgeMinYears:'',referenceAgeMaxYears:''});redrawWizard();}else if(a==='save')save();else if(a==='close'){wizard=null;redrawWizard();}else if(a==='back'){state.detail=null;render(true);}else if(a==='records'){state.detail='reports';render(true);}else if(a==='care'){navTo('health',el.dataset.page);}
},true);
window.DeepPetHealthInsights={analyze,care,report,grade,family,resetWizard:()=>{wizard=null;document.getElementById('dp916-wizard')?.replaceChildren();},version:'v9.17-numeric-evidence'};
})();
