/* DeepPet V10.51 — compact sleep-card wording without hiding useful reasons.
 * The engine, grades, reports and owner records are intentionally unchanged. */
(function(root){
 'use strict';
 const L=(zh,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:
   state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(zh):zh;
 const finiteScore=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100;
 const average=values=>{const good=values.filter(finiteScore);return good.length?
   Math.round(good.reduce((a,b)=>a+b,0)/good.length):null;};
 function conciseSleep(samples,days){
   const values=samples.map(x=>x.scores?.sleep),score=average(values);
   if(score===null)return L('目前沒有足夠的睡眠記錄。','Not enough sleep readings yet.',
     '睡眠記録がまだ不足しています。','수면 기록이 아직 부족합니다.');
   const prefix=days===1?L('今天睡眠休息','Sleep today: ','今日の睡眠・休息','오늘 수면·휴식'):
     L(`近${days}天睡眠平均`,`Sleep, ${days}-day average: `,`直近${days}日の睡眠平均`,`최근 ${days}일 수면 평균`);
   const suffix=score>=90?L('，接近平常。','; close to usual.','、普段に近い状態です。',', 평소와 비슷합니다.'):
     score>=80?L('，略有偏離。','; slightly different from usual.','、普段と少し異なります。',', 평소와 약간 다릅니다.'):
     score>=60?L('，需要多留意。','; needs attention.','、注意が必要です。',', 주의가 필요합니다.'):
     L('，明顯偏低，應優先關注。','; persistently low—check this first.','、明らかに低く、優先的な確認が必要です。',', 많이 낮아 우선 확인이 필요합니다.');
   return state.lang==='en'?prefix+score+'/100'+suffix:prefix+score+L('分',' pts','点','점')+suffix;
 }
 function compactSleepCard(){
   if(state.tab!=='deep'||state.detail&&state.detail!=='dp908-energy-calendar'||Number(state.deepType)!==1)return;
   const days=Number(state.range);if(![1,7,30].includes(days))return;
   const samples=root.DeepPetUX1050?.scope?.(days)||[];
   if(!samples.length)return;
   const card=document.querySelector(days===1?'#app .dp-owner-sleep':'#app .dp905-sleep-summary');
   if(!card)return;
   const head=card.querySelector(days===1?'.dp1048-sleep-day-head':'.dp1048-sleep-period-head');
   const long=head?.querySelector(days===1?'.dp1050-sleep-day-priority':'.dp1048-sleep-conclusion');
   if(!head||!long||!long.textContent?.trim())return;
   // The long medical context previously occupied a narrow half-width column,
   // producing a tall blank rectangle under the score ring on 7/30-day cards.
   // Preserve every explanation and action but give it the full card width.
   const detail=document.createElement('p');
   detail.className='dp1051-sleep-full-reason';
   detail.textContent=long.textContent;
   long.textContent=conciseSleep(samples,days);
   head.insertAdjacentElement('afterend',detail);
 }
 const previousRender=render;
 render=function(reset=false){previousRender(reset);compactSleepCard();};
 root.DeepPetUX1051={version:'10.51',conciseSleep};
})(window);
