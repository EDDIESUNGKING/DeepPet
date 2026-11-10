/* DeepPet V8.72: cross-period correctness fixes.
 * In this demo, score tiers and a single concerning vital are two distinct
 * concepts. Do not rewrite the original simulated daily sensor records. */
(function(){
 'use strict';
 const L=(zh,zht,en,ko)=>state.lang==='zh'?zh:state.lang==='zht'?zht:state.lang==='ko'?ko:en;
 const fragment=markup=>{const t=document.createElement('template');t.innerHTML=markup;return t.content;};
 const serialize=node=>{const el=document.createElement('div');el.appendChild(node);return el.innerHTML;};
 const grade=n=>n==null||!Number.isFinite(Number(n))?-1:Number(n)>=90?0:Number(n)>=80?1:Number(n)>=60?2:3;
 const dayNames=()=>state.lang==='en'?['Healthy','Mild','Moderate','Risk']:state.lang==='ko'?['정상','경미','주의','높음']:state.lang==='zh'?['健康','低风险','中风险','高风险']:['健康','低風險','中風險','高風險'];
 const dayTag=()=>L('單項心肺變化提醒','單項心肺變化提醒','Specific vital needs review','단일 심폐 지표 확인 필요');

 // The Deep header's alert was ALWAYS computed for today. Never place it above
 // a past date or a 7/30-day aggregate, even when the user selected another day.
 const previousIssue=dpDeepIssueHeader;
 dpDeepIssueHeader=function(index){
   if(state.range!==1||deepChosenDate()!==iso(localDate()))return '';
   return previousIssue(index);
 };

 // A period day tile describes that day's OVERALL score. An individual heart
 // or breathing alert can be more severe and is separately flagged with "!";
 // it must not silently override the day tile's score-color category.
 const previousPeriod=dpOwnerPeriodDetail;
 dpOwnerPeriodDetail=function(kind,cp,days){
   const original=previousPeriod(kind,cp,days);
   if(kind!==0)return original;
   const root=fragment(original),panel=root.querySelector('.dp68-period-heart');
   if(!panel)return original;
   const rows=dayRowsWithIndex(days),labels=dayNames(),counts=[0,0,0,0],tiles=[...panel.querySelectorAll('.dp68-risk-day')];
   for(const tile of tiles){
     const row=rows.find(r=>r.date===tile.dataset.date);
     if(!row)continue;
     const valid=validDaySample(row,row.idx).valid;
     const sc=valid?dpHeartComposite(row):null,g=valid?grade(sc):-1;
     if(g>=0)counts[g]++;
     const vital=valid?Math.max(dp66VitalGrade(row,'heart'),dp66VitalGrade(row,'breath')):-1;
     tile.classList.remove('dp68-risk-0','dp68-risk-1','dp68-risk-2','dp68-risk-3','dp68-risk--1');
     tile.classList.add(`dp68-risk-${g}`);
     const span=tile.querySelector('span');if(span)span.textContent=g<0?'—':labels[g];
     tile.title=`${row.date} · ${sc===null?'—':sc+'/100'} · ${g<0?'—':labels[g]}`;
     tile.setAttribute('aria-label',tile.title+(vital>g?' · '+dayTag():''));
     const oldCue=tile.querySelector('.dp872-vital-cue');if(oldCue)oldCue.remove();
     if(vital>g&&g>=0){
       const cue=document.createElement('sup');cue.className='dp872-vital-cue';cue.textContent='!';cue.title=dayTag();
       cue.setAttribute('aria-label',dayTag());tile.append(cue);
     }
   }
   panel.querySelectorAll('.dp68-risk-count').forEach((cell,i)=>{
     const count=cell.querySelector('b');if(count)count.textContent=counts[i]??0;
   });
   const note=panel.querySelector('.dp68-period-lead');
   if(note)note.textContent=L('每日顏色對應當天綜合分數。驚嘆號表示心跳或呼吸單項需另外留意；點日期看詳細時間。','每日颜色对应当天综合分数。感叹号表示心跳或呼吸单项需另外留意；点日期查看具体时间。','Day colors match the daily overall score; ! separately flags a heart or breathing concern. Tap a date for details.','날짜 색상은 종합 점수와 일치합니다. !는 심박 또는 호흡 항목의 추가 확인을 뜻합니다.');
   return serialize(root);
 };

 // For missing days, show genuine calendar spacing and an actual chart gap;
 // joining adjacent *available* points would make missing sensor days look valid.
 const previousMetricChart=dpOwnerPeriodMetricChart;
 dpOwnerPeriodMetricChart=function(rows,key,color,customValues=null,displayUnit=''){
   if(!rows?.length)return previousMetricChart(rows,key,color,customValues,displayUnit);
   const values=customValues||rows.map(r=>Number(r[key]));
   const points=values.map((v,i)=>({value:Number(v),row:rows[i]})).filter(p=>p.row&&Number.isFinite(p.value));
   const dayMs=86400000,epochs=points.map(p=>Date.parse(p.row.date+'T00:00:00Z'));
   if(points.length<2||epochs.some(x=>!Number.isFinite(x)))return previousMetricChart(rows,key,color,customValues,displayUnit);
   const hasGap=epochs.some((value,i)=>i>0&&value-epochs[i-1]>dayMs*1.5);
   if(!hasGap)return previousMetricChart(rows,key,color,customValues,displayUnit);
   const W=350,H=172,left=39,right=9,top=14,bottom=35;
   const begin=epochs[0],end=epochs.at(-1),dur=Math.max(dayMs,end-begin);
   const vals=points.map(p=>p.value),low=Math.min(...vals),high=Math.max(...vals),spread=Math.max(2,high-low),min=low-spread*.2,max=high+spread*.2;
   const x=ms=>left+(W-left-right)*(ms-begin)/dur;
   const y=v=>top+(max-v)/(max-min)*(H-top-bottom);
   const coords=points.map((p,i)=>({x:x(epochs[i]),y:y(p.value),date:p.row.date,value:p.value}));
   let path='',prev=null;
   for(const c of coords){path+=(prev&&Date.parse(c.date+'T00:00:00Z')-Date.parse(prev.date+'T00:00:00Z')<=dayMs*1.5?' L ':' M ')+c.x.toFixed(1)+' '+c.y.toFixed(1);prev=c;}
   const every=Math.max(1,Math.ceil(points.length/7)),ticks=coords.filter((_,i)=>i%every===0||i===coords.length-1);
   const axis=[0,.5,1].map(p=>{const yy=top+p*(H-top-bottom);return `<line x1="${left}" x2="${W-right}" y1="${yy}" y2="${yy}" stroke="#e4e9f1"/><text x="${left-5}" y="${yy+3}" text-anchor="end" font-size="9" fill="#758299">${(max-(max-min)*p).toFixed(key==='sleep'?1:0)}</text>`;}).join('');
   const marks=ticks.map((p,i)=>`<text x="${p.x.toFixed(1)}" y="${H-7}" font-size="9" text-anchor="${i===0?'start':i===ticks.length-1?'end':'middle'}" fill="#758299">${p.date.slice(5).replace('-','/')}</text>`).join('');
   const svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${key} daily trend with missing days left unconnected">${axis}<path d="${path}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>${coords.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${color}"><title>${p.date}: ${p.value}</title></circle>`).join('')}${marks}</svg>`;
   return `<div class="dp-owner-chart-box dp-vital-trend dp872-gapped-chart">${svg}<small class="dp872-chart-warning">${L('部分日期沒有有效記錄，曲線已斷開，不推算缺少的數值。','部分日期没有有效记录，曲线已断开，不推算缺少的数值。','Missing valid days leave breaks in this chart; no values are invented.','유효 기록이 없는 날은 선을 연결하지 않습니다.')}</small></div>`;
 };

 // Keep translated on-screen labels tied to their real app version. Underlying
 // sample numbers remain explicitly demo-only and are not medical assertions.
})();
