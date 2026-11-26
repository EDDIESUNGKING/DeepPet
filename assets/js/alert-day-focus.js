/* V10.168: restore temporal context when a native all-day plot is unavailable.
   Historical summaries are observations, not raw waveform. No interpolation. */
(function(root){'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const F=Number.isFinite,clock=s=>`${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}`;
 function chart(rows,kind,second,start,end){
  const x=t=>38+(t-start)/(end-start)*310,pts=rows.filter(r=>r.second>=start&&r.second<end&&F(r.value)&&r.value>0),values=pts.map(r=>r.value),lo=values.length?Math.max(0,Math.min(...values)-4):0,hi=values.length?Math.max(lo+8,Math.max(...values)+4):100,y=v=>122-(v-lo)/(hi-lo)*96;
  const minute=Math.floor(second/60)*60,center=x(second),left=Math.max(38,Math.min(348,x(minute))),right=Math.max(left,Math.min(348,x(minute+60))),width=Math.max(2,right-left);
  const grid=values.length?[0,.5,1].map(q=>`<line x1="38" x2="348" y1="${26+96*q}" y2="${26+96*q}" stroke="#cdd5df" opacity=".55"/><text x="33" y="${30+96*q}" text-anchor="end" font-size="10" fill="currentColor">${Math.round(hi-(hi-lo)*q)}</text>`).join(''):'';
  const marks=pts.map(r=>`<circle cx="${x(r.second).toFixed(2)}" cy="${y(r.value).toFixed(2)}" r="1.8" fill="${kind==='heart'?'#d36d8e':'#42a3bf'}"/>`).join('');
  const ticks=[start,(start+end)/2,end].map((t,i)=>`<text x="${x(t)}" y="145" text-anchor="${['start','middle','end'][i]}" font-size="10" fill="currentColor">${clock(t)}</text>`).join('');
  return `<svg class="dp932-chart" viewBox="0 0 360 152" role="img" aria-label="${L('事件時間與記錄值','Event time and recorded values','発生時刻と記録値','이벤트 시간 및 기록값')}">${grid}<rect data-dp168-alert-minute="${minute/60}" x="${Math.min(346,left)}" width="${Math.min(348-Math.min(346,left),width)}" y="21" height="103" fill="#d52d63" opacity=".13"/><line x1="${center}" x2="${center}" y1="21" y2="124" stroke="#d52d63" stroke-width="1.4" stroke-dasharray="3 3"/>${marks}<line x1="38" x2="348" y1="124" y2="124" stroke="#9aa7b6"/>${ticks}</svg>`;
 }
 function enhance(){
  const f=state.dp1059AlertFocus;if(!f||f.pet!==state.dog||state.tab!=='deep'||state.detail!=='dp90-waveform'||f.date!==state.dp90WaveDate||f.minute!==state.dp932WaveMinute||f.kind!==state.dp90WaveKind||!Number.isInteger(f.second))return;
  const app=document.getElementById('app'),e=app?.querySelector('.dp1065-evidence-card');if(!e||app.querySelector('[data-dp168-alert-minute]')||app.querySelector('.dp932-wave-section svg.dp932-chart'))return;
  const second=f.minute*60+f.second,field=f.kind==='heart'?'hr':'rr';
  // Do not borrow an illustrative gallery day or the 23-Nov fixture for a verified event.
  const raw=state.dog===0?root.DeepPetMiloAdaptiveScores?.recordedDayRows?.(f.date)||[]:[];
  const rows=raw.filter(r=>r.ts?.slice(0,10)===f.date&&F(r[field])&&r[field]>0&&['historical','b0','sdk'].includes(r.source)).map(r=>{const [h,m,s=0]=r.ts.slice(11).split(':').map(Number);return {second:h*3600+m*60+s,value:r[field]};}).filter(r=>F(r.second)&&r.second>=0&&r.second<86400);
  const start=Math.max(0,second-1800),end=Math.min(86400,second+1800),count=rows.filter(r=>r.second>=start&&r.second<end).length;
  const card=document.createElement('section');card.className='card dp168-alert-day-context';
  const unit=f.kind==='heart'?'bpm':'/min',label=L('全天觀測與異常時段','Day observations and event time','一日の観測と急変時刻','하루 관측 및 이상 시각');
  card.innerHTML=`<h3>${label} · ${f.date}</h3><p class="dp1065-reference">${rows.length?L('點為已記錄的彙整觀測值，非逐秒波形。','Dots are recorded summary observations, not second-by-second waveform.','点は記録された集計値です。','점은 기록된 요약 관측값입니다.')+' ('+unit+')':L('沒有可核對的全天觀測值；只標記事件時間，不補畫曲線。','No matching day observations; the event time is marked without inventing a trace.','照合できる一日データはありません。時刻のみ表示します。','확인 가능한 하루 데이터 없음. 이벤트 시각만 표시합니다.')}</p>${chart(rows,f.kind,second,0,86400)}<h3>${L('異常時段放大','Event time zoom','急変時刻の拡大','이상 시각 확대')}</h3>${chart(rows,f.kind,second,start,end)}${count?'':`<p class="dp1065-reference">${L('此放大時段缺少彙整觀測；精確秒數及數值請看上方證據。','No summary observations in this window; see the exact second-level evidence above.','この区間の集計値なし。上の秒単位の記録をご確認ください。','이 구간 요약 관측 없음. 위의 초 단위 근거를 확인하세요.')}</p>`}`;
  e.after(card);
  if(state.dp1099AlertNeedsScroll){state.dp1099AlertNeedsScroll=false;requestAnimationFrame(()=>{if(e.isConnected&&state.dp1059AlertFocus===f)e.scrollIntoView({block:'start',behavior:'instant'});});}
 }
 root.DeepPetAlertDayFocus168=Object.freeze({enhance,chart});
})(window);
