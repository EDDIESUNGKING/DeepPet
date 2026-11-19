/* DeepPet V10.49 — one consistent Deep observation heading, a full upcoming-
 * care route, and lab grades from the existing reference-aware evidence model.
 * No added navigation tabs, no replacement of the existing pet/test records. */
(function(root){
 'use strict';
 const L=(zht,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:
   state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zht):zht;
 const escHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100;
 const grade=n=>n>=90?['healthy',L('健康','Healthy','健康','건강')]:
   n>=80?['mild',L('輕風險','Mild concern','軽度リスク','경미한 위험')]:
   n>=60?['moderate',L('中風險','Moderate concern','中リスク','중간 위험')]:
   ['risk',L('重風險','Severe concern','高リスク','높은 위험')];

 // The original alert component is intentionally conditional (<90), but all
 // three Deep categories should communicate today's observation. For a stable
 // cardio day add a calm, evidence-based note rather than an invented alert.
 const previousIssue=dpDeepIssueHeader;
 dpDeepIssueHeader=function(index){
   const original=previousIssue(index);
   if(index!==0||original||state.detail||selectedBlank()||isFreePet()||dp58FreshPet())return original;
   const score=dpTodayUnifiedScores()?.heart;
   if(!valid(score)||score<90)return original;
   const measured=demoRecords(state.dog).at(-1);
   if(!measured||!validDaySample(measured,demoRecords(state.dog).length-1)?.valid)return original;
   const row=typeof dpOwnerExplanation==='function'?
     dpOwnerExplanation(0,score,measured):L('今天的心肺表現平穩。','Heart and breathing look steady today.','今日の心肺は安定しています。','오늘 심폐 상태가 안정적입니다.');
   return `<section class="dp-deep-alert-reasons dp1049-steady-cardio" aria-label="${escHtml(L('今日觀察與建議','Today’s observations & advice','今日の観察とアドバイス','오늘의 관찰과 조언'))}"><div class="dp-deep-alert-heading"><b>${L('今日觀察與建議','Today’s observations & advice','今日の観察とアドバイス','오늘의 관찰과 조언')}</b><span>${Math.round(score)}/100</span></div><div class="dp-deep-alert-lines"><p>${vicon('check',15)}<span>${escHtml(row)}</span></p></div></section>`;
 };

 // Health's More previously used native <details> and opened inline. Keep
 // exactly three short reminders in Health; display ALL on a separate page.
 const previousHealthDetail=healthDetail;
 healthDetail=function(){
   if(state.detail!=='dp1049-upcoming-all')return previousHealthDetail();
   // A stale V10.49 bookmark must still open the single current reminder
   // detail, never revive an older independently styled page.
   return root.DeepPetUX1073?.upcomingAllPage?.()||previousHealthDetail();
 };

 const previousAction=onAction;
 onAction=function(el){
   const action=el?.dataset?.action;
   if(action==='dp1049-upcoming-open'){navTo('health','upcoming-all');return;}
   if(action==='dp1049-upcoming-back'){navTo('health');return;}
   return previousAction(el);
 };

 // Veterinary summary used stale normal/alert/unknown storage labels. Its
 // existing lab model already knows each result's units, species, reference
 // interval, date and severity score; use that SAME per-result assessment.
 // Incompatible/absent references must still yield an honest no-grade state.
 const previousVet=vetReportContent;
 function gradeLab(x,profile){
   const engine=root.DeepPetLabEvidence;
   const result=engine?.item?.(x,profile,x.date)||null;
   const score=valid(result?.score)?result.score:null;
   if(score===null)return {score:null,category:'pending',label:L('資料不足','Not assessable','判定不可','평가 불가'),kind:result?.kind||'unverified'};
   const [category,label]=grade(score);
   return {score,category,label,kind:result.kind};
 }
 vetReportContent=function(d){
   const html=previousVet(d),host=document.createElement('div');host.innerHTML=html;
   const table=host.querySelector('.vet-report-lab-table');
   if(!table)return html;
   const pet={...d.pet,petId:String(state.dog)},rows=Array.isArray(d.labs)?d.labs:[];
   const classes=rows.map(row=>gradeLab(row,pet));
   const counts={healthy:0,mild:0,moderate:0,risk:0,pending:0};
   classes.forEach(x=>{counts[x.category]++;});
   const tbody=table.querySelector('tbody');
   if(tbody){
     tbody.innerHTML=rows.map((x,i)=>{
       const item=classes[i],info=labI18n(x.name),name=info.known?
         (state.lang==='ko'?info.ko:state.lang==='ja'?info.ja:state.lang==='en'?info.en:info.zh):x.name;
       const status=`<span class="vet-lab-status dp1049-lab-${item.category}">${escHtml(item.label)}</span>`;
       const value=x.value===null||x.value===undefined||String(x.value).trim()===''?'—':escHtml(x.value);
       return `<tr><td><strong>${escHtml(name)} (${escHtml(info.code)})</strong><small>${escHtml(info.known?info.en:L('自訂檢驗項目','Custom test','カスタム検査','사용자 검사'))}</small></td><td>${value} ${escHtml(x.unit||'')}</td><td>${status}</td></tr>`;
     }).join('')||`<tr><td colspan="3">${L('尚無體檢檢驗紀錄','No examination results','検査記録がありません','검사 기록 없음')}</td></tr>`;
   }
   const header=host.querySelector('.vet-report-lab-head');
   if(header){
     const count=[['healthy',L('健康','Healthy','健康','건강')],['mild',L('輕風險','Mild concern','軽度リスク','경미한 위험')],['moderate',L('中風險','Moderate','中リスク','중간 위험')],['risk',L('重風險','Severe concern','高リスク','높은 위험')]]
       .filter(([key])=>counts[key]).map(([key,label])=>`${counts[key]} ${label}`);
     if(counts.pending)count.push(`${counts.pending} ${L('資料不足','Not assessable','判定不可','평가 불가')}`);
     const span=header.querySelector('span:last-child');if(span)span.textContent=count.join(' · ')||L('沒有檢驗結果','No results','結果なし','검사 결과 없음');
   }
   const section=table.closest('.vet-report-section');
   const note=section?.querySelector('.vet-method-note');
   if(note)note.textContent=L('逐項分類沿用健康管理中的體檢評分：依這隻寵物適用的檢驗參考區間、單位與偏離幅度計算（≥90 健康、80–89 輕風險、60–79 中風險、<60 重風險）。資料或參考區間不足時顯示「資料不足」，不直接判斷疾病。',
     'Individual categories use the same examination score as Health: applicable lab intervals, units and size of deviation (≥90 healthy; 80–89 low; 60–79 moderate; <60 high concern). Missing or incompatible references are not graded. These are not diagnoses.',
     '各項目は健康管理と同じ参照範囲・単位・乖離に基づく評価です。資料不足の場合は判定しません。診断ではありません。',
     '건강 관리와 동일한 기준 범위, 단위, 편차를 사용합니다. 근거가 부족하면 평가하지 않으며 진단이 아닙니다.');
   return host.innerHTML;
 };
 function upcomingMore(app){
   if(state.tab!=='health'||state.detail)return;
   if(app.querySelector('.dp1075-health-page'))return;
   const list=app.querySelector('.dp-upcoming-care');if(!list)return;
   const old=list.querySelector('.dp999-more');if(!old)return;
   const button=document.createElement('button');button.type='button';button.className='dp1049-upcoming-more';
   button.dataset.action='dp1049-upcoming-open';button.textContent='More';
   button.setAttribute('aria-label',L('查看全部近期健康提醒','View all upcoming reminders','リマインダーをすべて見る','전체 알림 보기'));
   old.replaceWith(button);
 }
 const previousRender=render;
 render=function(reset=false){previousRender(reset);const app=document.getElementById('app');if(app)upcomingMore(app);
   document.querySelectorAll('.app-build-version').forEach(el=>el.textContent='DeepPet Version '+(root.DeepPetBuildVersion||'10.49'));
 };
 root.DeepPetUX1049={version:'10.49',gradeLab};
})(window);
