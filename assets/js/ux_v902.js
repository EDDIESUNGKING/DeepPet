/* DeepPet V9.02 — fixes raised in screenshots (layout, navigation, two-score detail). */
(function(){
'use strict';
const L=(a,b,c,d,e)=>state.lang==='zh'?b:state.lang==='en'?c:state.lang==='ko'?d:state.lang==='ja'?(e||c):a;
const tier=s=>s>=90?'normal':s>=80?'light':s>=60?'medium':'high';
const scoreName=s=>s>=90?L('健康','健康','Healthy','정상','正常'):s>=80?L('低風險','低风险','Mild','가벼운 주의','軽度注意'):s>=60?L('中風險','中风险','Moderate','중간 주의','中程度注意'):L('高風險','高风险','Risk','높은 주의','高度注意');
// Reflow paragraphs into the LEFT column beside each score; no empty left rectangles.
function repairEnergyLayout(markup){
 const wrap=document.createElement('div');wrap.innerHTML=markup;
 const status=wrap.querySelector('.dp901-health-score');
 if(!status)return markup;
 status.classList.add('dp902-flow');
 const top= status.querySelector('.dp901-overall-head'),copy=top?.querySelector('.dp901-overall-copy');
 const summary=status.querySelector(':scope > .dp901-overall-desc,:scope > .dp901-period-notes');
 if(copy&&summary)copy.append(summary);
 for(const card of status.querySelectorAll('.dp901-metric-card')){
  const text=card.querySelector(':scope > .dp901-metric-desc');
  const left=card.querySelector('.dp901-card-copy');
  if(text&&left)left.append(text);
 }
 const cards=[...status.querySelectorAll('.dp901-metric-card')];
 if(cards[2])cards[2].classList.add('dp902-calm-target');
 return wrap.innerHTML;
}
const oldDay=dpOwnerDayDetail;
dpOwnerDayDetail=function(kind,cp,row){return kind===2?repairEnergyLayout(oldDay(kind,cp,row)):oldDay(kind,cp,row);};
const oldPeriod=dpOwnerPeriodDetail;
dpOwnerPeriodDetail=function(kind,cp,days){return kind===2?repairEnergyLayout(oldPeriod(kind,cp,days)):oldPeriod(kind,cp,days);};
// Remove duplicate optional explanation rows that the older framework appended.
const oldDeep=deepView;
deepView=function(){
 const markup=oldDeep();
 if(state.deepType!==2 || state.detail==='dp90-waveform')return markup;
 const root=document.createElement('div');root.innerHTML=markup;
 const notes=[...root.querySelectorAll('.dp-metric-usage-notes')];
 notes.slice(1).forEach(el=>el.remove());
 // The retained third card is already the single rest-and-steadiness entry.
 root.querySelectorAll('.dp90-calm-card').forEach(el=>el.remove());
 return root.innerHTML;
};
// Body rhythm must show its two components AND the two useful interpretation sections.
function rhythmScore(m,k){return dpOwnerQualityValue(rhythmPositiveValue(k,m));}
function rhythmTopic(k){return k==='calm'?L('放鬆與平穩度','放松与平稳度','Rest & steadiness','휴식과 안정도','リラックスと安定度'):L('心搏節奏穩定度','心搏节奏稳定度','Heartbeat rhythm stability','심박 리듬 안정도','心拍リズム安定度');}
function rhythmFinding(k,n,positive){
 const name=rhythmTopic(k),detail=k==='calm'?
 (positive?L('安靜時心搏與 HRV 趨勢較接近這隻寵物的平常基準。','安静时心搏与 HRV 趋势较接近这只宠物的平常基准。','Quiet-time beat and HRV trends are relatively close to this pet’s baseline.','휴식 중 심박 및 HRV가 평소 기준과 비슷합니다.'):L('安靜時的心搏與 HRV 變化值得回看，並結合佩戴、休息及作息比較。','安静时的心搏与 HRV 变化值得回看，结合佩戴、休息和作息比较。','Review quiet-time heartbeat and HRV changes together with fit, rest and routine.','휴식 중 HRV 변화를 착용 상태와 함께 확인하세요.')):
 (positive?L('心搏節奏較接近平常模式，短期變化目前相對平穩。','心搏节奏较接近平常模式，短期变化目前相对平稳。','Beat timing is closer to the usual pattern and appears broadly steady.','심박 간격은 평소 패턴과 비슷합니다.'):L('心搏間隔的近期變化值得回看，請先排除活動與訊號干擾。','心搏间隔的近期变化值得回看，先排除活动与信号干扰。','Review beat-interval changes and first check for movement or signal interference.','심박 간격 변화와 신호 간섭을 확인하세요.'));
 return `<button type="button" class="summary-finding ${positive?'good':'concern'}" data-action="dp90-rhythm-nav" data-key="${k}"><span class="finding-mark">${positive?'✓':'!'}</span><div><b>${name} · ${n}/100 · ${scoreName(n)}</b><p>${detail}</p></div><span aria-hidden="true">›</span></button>`;
}
rhythmDetailModal=function(){
 if(!signalQuality().valid)return qualityInline();
 const m=rhythmData().today,scores=['calm','stable'].map(k=>({k,n:rhythmScore(m,k)}));
 const total=rhythmCompositeScore(m);
 const good=scores.filter(x=>x.n>=90);
 const concerns=scores.filter(x=>x.n<90);
 const helpGood=good.length?good.map(x=>rhythmFinding(x.k,x.n,true)).join(''):
  `<div class="summary-finding neutral">${L('兩項指標目前都未達90分；可以先比較相對較好的項目與自身過往趨勢。','两项指标目前都未达90分，可以先比较相对较好的项目与自身过往趋势。','Neither score is above 90; compare the stronger relative measure with the historical trend.','두 지표 모두 90점 미만이므로 개인 추세를 확인하세요.')}</div>`;
 const helpAttention=concerns.length?concerns.map(x=>rhythmFinding(x.k,x.n,false)).join(''):
  `<div class="summary-finding neutral">${L('目前兩項分數均為正常，尚無明顯需要優先關注的節奏變化。','目前两项分数均为正常，暂无明显需要优先关注的节奏变化。','Both scores are normal; no notable priority rhythm change is shown.','두 점수 모두 정상 범위로 우선 주의할 변화는 없습니다.')}</div>`;
 return `<div class="summary-detail-v44 dp-rhythm-summary dp90-rhythm-detail dp902-rhythm-detail">
 <p class="summary-detail-lead"><strong>${L('身體節奏分數','身体节奏分数','Body rhythm score','몸의 리듬 점수')}：${total}/100</strong></p>
 <p class="dp90-description">${L('僅由「放鬆與平穩度」及「心搏節奏穩定度」兩項平均組成。','仅由「放松与平稳度」及「心搏节奏稳定度」两项平均组成。','Average of exactly two measures: rest & steadiness, and heartbeat rhythm stability.','휴식·안정도와 심박 리듬 안정도 두 점수의 평균입니다.')}</p>
 <div class="summary-three-rings dp90-two-rings">${scores.map(({k,n})=>`<button type="button" class="summary-ring-item" data-action="dp90-rhythm-nav" data-key="${k}"><span class="summary-ring-label">${rhythmTopic(k)}</span>${scoreRing(n)}<span class="summary-ring-status" style="color:${scoreScheme(n).color}">${scoreName(n)} ›</span></button>`).join('')}</div>
 <section class="summary-detail-section"><h3>${L('表現較好的地方','表现较好的地方','What looks good','좋은 부분')}</h3>${helpGood}</section>
 <section class="summary-detail-section"><h3>${L('需要關注的地方','需要关注的地方','What needs attention','주의할 부분')}</h3>${helpAttention}</section>
 <p class="notices">${L('以上為個體趨勢模型展示，不能單獨用於疾病診斷。','以上为个体趋势模型展示，不能单独用于疾病诊断。','These are modeled personal trends, not diagnostic evidence.','개인 추세 모델이며 질병 진단이 아닙니다.')}</p>
 </div>`;
};
// Correct obsolete three-indicator modal header everywhere, without changing other dialogs.
const oldModalUI=modalUI;
modalUI=function(){
 const html=oldModalUI();
 if(state.modal!=='rhythm-detail')return html;
 return html.replace(/三項節奏狀態|三项节奏状态|Three rhythm indicators|리듬 상태 세 가지|3つのリズム指標/g,
    L('兩項身體節奏指標','两项身体节奏指标','Two body rhythm indicators','두 가지 신체 리듬 지표','2つのリズム指標'));
};
// Tap a rhythm score => go to the exact Deep metric, scroll and outline in red temporarily.
const oldAction=onAction;
let highlightTimer=null;
onAction=function(target){
 if(target?.dataset?.action==='dp90-rhythm-nav'){
  const k=target.dataset.key==='stable'?'stable':'calm';
  state.modal='';state.tab='deep';state.detail=null;state.deepType=k==='stable'?0:2;state.range=1;
  state.deepSelectedDate=iso(localDate());
  render(true);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const sc=document.getElementById('main-scroll');
   const el=document.querySelector(k==='stable'?'.dp901-rhythm-card':'.dp902-calm-target');
   if(!sc||!el)return;
   const box=el.getBoundingClientRect(),cont=sc.getBoundingClientRect();
   const targetY=box.top-cont.top+sc.scrollTop-Math.max(24,(sc.clientHeight-box.height)*.28);
   sc.scrollTo({top:Math.max(0,targetY),behavior:'instant'});
   document.querySelectorAll('.dp902-jump-highlight').forEach(x=>x.classList.remove('dp902-jump-highlight'));
   el.classList.add('dp902-jump-highlight');
   if(highlightTimer)clearTimeout(highlightTimer);
   highlightTimer=setTimeout(()=>{if(el.isConnected)el.classList.remove('dp902-jump-highlight');},3700);
  }));
  return;
 }
 return oldAction(target);
};
})();
