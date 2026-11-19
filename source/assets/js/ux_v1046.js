/* DeepPet V10.46: shared score meter, honest connected period charts,
 * readable pairing battery and the actual 14-valid-day score sparkline. */
(function (root) {
 'use strict';
 const trend = root.DeepPetTrendDisplay1046;
 const L = (zht,en,ja,ko) => state.lang === 'en' ? en : state.lang === 'ja' ? ja :
   state.lang === 'ko' ? ko : state.lang === 'zh' && typeof toSimplified === 'function' ?
   toSimplified(zht) : zht;
 const finite = v => typeof v === 'number' && Number.isFinite(v);
 const gallery = () => !state.emptyPreview && !selectedBlank() &&
   !dp58FreshPet() && state.dog < dogs.length && !currentDog()?.dpFixtureInvalidated;
 const readable = () => L('查看詳細數據','View detailed data','詳細データを見る','상세 데이터 보기');
 const svgFor = (entries,days,kind,title,unit,color,mode='adaptive') =>
   trend.chart(entries,days,{kind,title,unit,color,mode,
     missing:L('缺測日期顯示 N/A，不使用補造分數','Missing dates remain N/A; no scores are invented','欠測日を推定しません','누락 날짜는 보완하지 않습니다')});
 function scoped30() {
   if (!gallery()) return [];
   return dayRowsWithIndex(30).map(r => ({...r,valid:validDaySample(r,r.idx)?.valid === true}));
 }
 function mapSeries(records,metric) {
   const rhythms=metric==='calm'?rhythmData()?.values:null;
   const engineDays=(metric==='energy'||metric==='calm')?
     root.DeepPetSignalScoring?.getDaily?.(state.dog):null;
   return records.map(r=>{
     if(!r.valid)return {date:r.date,value:null};
     try {
       if(metric==='energy'||metric==='calm'){
         // The period card uses the V9.03 `three(row)` display-source
         // contract: the same indexed engine score takes precedence over
         // all older fixture calculations. Never stitch those two sources.
         const engine=engineDays?.[r.idx]?.scores;
         if(engine){const v=engine[metric];return {date:r.date,value:
           finite(v)&&v>=0&&v<=100?v:null};}
         if(metric==='energy')return {date:r.date,value:dpOwnerDayScores(r,true).energy};
         const raw=rhythms?.[r.idx]?.calm;
         return {date:r.date,value:finite(raw)?dpOwnerQualityValue(raw):null};
       }
       if(metric==='recovery')return {date:r.date,value:dpRecovery2Min(r.date)?.average??null};
       if(metric==='activity') {
         const raw=dpSignals(r.date,['activity'])?.activity;
         if(!Array.isArray(raw)||raw.length!==1440||raw.some(x=>!finite(x)))return {date:r.date,value:null};
         return {date:r.date,value:Math.round(raw.reduce((sum,x)=>sum+x,0)/raw.length*10)/10};
       }
     } catch (_) { /* no invented signal, no artificial value */ }
     return {date:r.date,value:null};
   });
 }
 function newBaselineSpark() {
   const baseline=baselineProfile(),daily=root.DeepPetSignalScoring?.getDaily?.(state.dog)||[];
   const byDate=new Map(daily.filter(x=>x&&typeof x.date==='string').map(x=>[x.date,x.scores]));
   const points=(baseline.window||[]).slice(-14).map(r=>{
     // The baseline report compares a 75/25 health/rhythm composite. Keep
     // the preview curve on that identical definition, not a new 70/30 mix.
     const s=byDate.get(r.date),v=finite(s?.physiol)&&finite(s?.rhythm) ?
       .75*s.physiol+.25*s.rhythm:null;
     return {date:r.date,value:v};
   });
   if(points.filter(x=>finite(x.value)).length<2)return '';
   const s=trend.shape(points,points.length,{mode:'score'});
   const X=p=>6+(p.x-s.left)*(224/(s.width-s.left-s.right));
   const Y=p=>p.y===null?null:5+(p.y-s.top)*(42/(s.height-s.top-s.bottom));
   const visible=s.points.filter(p=>p.y!==null);
   let path='',joined=false;
   for(const p of s.points){if(p.y===null){joined=false;continue;}
     path+=(joined?' L ':' M ')+X(p).toFixed(2)+' '+Y(p).toFixed(2);joined=true;}
   const dates=visible.map(p=>`<circle cx="${X(p).toFixed(2)}" cy="${Y(p).toFixed(2)}" r="2" fill="#208bb8"><title>${p.date} · ${p.value.toFixed(1)}/100</title></circle>`).join('');
   return `<svg class="dp70-baseline-spark dp1046-baseline-spark" viewBox="0 0 244 63" role="img" aria-label="${L('最近14個有效監測日的健康基準評分趨勢','Score trend across the last 14 valid monitoring days','直近14有効日の健康基準スコア','최근 유효 14일 건강 기준 점수 추세')}"><line x1="6" y1="49" x2="230" y2="49" stroke="#c3dae7"/><line x1="6" y1="5" x2="6" y2="49" stroke="#c3dae7"/><path d="${path.trim()}" fill="none" stroke="#258fbe" stroke-width="2.7" stroke-linejoin="round" stroke-linecap="round"/>${dates}<text x="6" y="61" font-size="8.8" fill="#527e93">${visible[0].date.slice(5)}</text><text x="230" y="61" font-size="8.8" text-anchor="end" fill="#527e93">${visible.at(-1).date.slice(5)}</text></svg>`;
 }
 const previousMe=meView;
 meView=function(){
   const html=previousMe(),wrap=document.createElement('div');wrap.innerHTML=html;
   const baseline=wrap.querySelector('.dp70-baseline-hero .grow');
   if(baseline) {
     baseline.querySelector('.dp70-baseline-spark')?.remove();
     const caption=baseline.querySelector('.dp70-baseline-chart-caption');
     if(caption)caption.textContent=L('最近14個有效監測日 · 健康基準分數','Last 14 valid days · baseline score','直近14有効日 · 健康基準','최근 유효 14일 · 건강 기준 점수');
     const chart=newBaselineSpark();
     if(chart)baseline.insertAdjacentHTML('beforeend',chart);
     else if(caption)caption.textContent=L('有效分數尚不足兩天，基準曲線建立中','Waiting for two valid score days','有効日が不足しています','유효 점수 날짜가 부족합니다');
   }
   return wrap.innerHTML;
 };
 const previousCenter=deviceCenter;
 deviceCenter=function(){
   const html=previousCenter(),host=document.createElement('div');host.innerHTML=html;
   const center=host.querySelector('.device-center'),top=center?.querySelector('.device-center-top');
   if(!center||!top||!state.connected)return html;
   const present=center.querySelector('.dp1033-battery-meta,.dp1035-battery-device');
   const pct=root.DeepPetPresentation1035?.battery?.()?.percent;
   const fromText=present?.textContent?.match(/(100|\d{1,2})\s*%/);
   const value=Number.isInteger(pct)?pct:fromText?Number(fromText[1]):null;
   // Keep the original SDK timestamp when supplied. A sample collar has only
   // a gallery battery number, never a fabricated last-sync timestamp.
   const notice=document.createElement('div');notice.className='dp1046-device-battery-row';
   if(Number.isInteger(value)&&value>=0&&value<=100){
     const freshness=present?.querySelector('.dp1033-battery-time')?.textContent||'';
     notice.innerHTML=`<span class="dp1046-battery-icon" aria-hidden="true">▰</span><span>${L('項圈電量','Collar battery','首輪の電池','목걸이 배터리')}</span><strong class="dp1046-battery-number">${value}%</strong>`;
     if(freshness){const stamp=document.createElement('small');stamp.textContent=freshness;notice.append(stamp);}
     present?.remove();
   }else {
     notice.innerHTML=`<span>${L('項圈電量','Collar battery','首輪の電池','목걸이 배터리')}</span><strong class="dp1046-battery-pending">N/A</strong><small>${L('等待設備回傳','Awaiting device data','取得待ち','기기 데이터 대기')}</small>`;
   }
   top.after(notice);return host.innerHTML;
 };
 function changePeriodDetail(html){
   if(!gallery()||Number(state.deepType)!==2||![7,30].includes(Number(state.range)))return html;
   const host=document.createElement('div');host.innerHTML=html;
   const rows=scoped30(),cards=[...host.querySelectorAll('.dp901-health-score .dp901-metric-card')];
   for(const [index,key,title,unit,mode] of [
     [1,'recovery',L('活動後2分鐘心率回落 · 逐日數據','Two-minute HR recovery by date','日別2分間心拍回復','활동 후 2분 심박 회복'), 'bpm','adaptive'],
     [2,'calm',L('放鬆與平穩度 · 逐日分數','Rest and steadiness daily scores','落ち着き・安定度の日別点数','휴식과 안정도 일별 점수'),'/100','score']]){
     const card=cards[index],body=card?.querySelector('.dp901-expand-body');
     if(!body)continue;
     body.innerHTML=svgFor(mapSeries(rows,key),Number(state.range),key,title,unit,'#4387dc',mode);
   }
   return host.innerHTML;
 }
 function changeEnergyDetail(html){
   if(!gallery()||state.detail!=='dp908-energy-calendar'||![7,30].includes(Number(state.range)))return html;
   const host=document.createElement('div');host.innerHTML=html;
   const section=host.querySelector('.dp905-energy-calendar'),old=section?.querySelector('.dp908-daily-inspector');
   if(!section||!old)return html;
   const rows=scoped30(),days=Number(state.range);
   const activity=svgFor(mapSeries(rows,'activity'),days,'activity',
     L('每日活動強度平均值','Daily mean movement intensity','日別活動強度の平均','일별 평균 활동 강도'),'%','#337dc3');
   const score=svgFor(mapSeries(rows,'energy'),days,'energy',
     L('每日精力分數','Daily energy score','日別活力スコア','일별 활력 점수'),'/100','#4b87dc','score');
   section.querySelector('h3').textContent=L('精力與活動休息的期間變化','Energy and movement over the period','活力と活動・休息の推移','활력과 활동·휴식 변화');
   const originalIntro=section.querySelector('p');
   if(originalIntro)originalIntro.textContent=L(
     '下方先顯示實際日別活動強度，再顯示精力評分。全天內起伏與每日平均分屬不同尺度；相同日期在7天和30天圖上使用相同數據。',
     'Movement intensity and energy score are different measures. Intraday fluctuations need not alter a daily score. The same dates use identical values in both ranges.',
     '日内の変動と日別スコアは異なります。同じ日付は7日・30日で同じ値を使用します。',
     '일중 변동과 일별 점수는 서로 다릅니다. 동일 날짜는 같은 값을 사용합니다.');
   old.outerHTML=activity+score;
   return host.innerHTML;
 }
 const previousDeep=deepView;
 deepView=function(){
   let html=previousDeep();
   html=changePeriodDetail(html);
   html=changeEnergyDetail(html);
   return html;
 };
 function primaryMeters(app){
   const heads=app.querySelectorAll([
     '.dp-owner-deep .dp-owner-status-heading',
     '.dp-owner-deep .dp-sleep-period-score-head',
     '.dp-owner-deep .dp-heart-period-overall',
     '.dp-owner-deep .dp905-sleep-summary>.dp905-sleep-head',
     '.dp905-sleep-day>.dp905-sleep-head',
     '.dp-owner-deep .dp903-overview-head',
     '.dp-owner-deep .dp901-overall-head'
   ].join(','));
   for(const head of heads){
     const ring=head.querySelector('.dp-status-score[data-score]');
     if(!ring)continue;
     head.classList.add('dp1046-primary-head');
     // Main rings must not be nested in a stale, fixed-size legacy score aside.
     let stack=ring.closest('.dp1042-score-stack,.dp1040-score-stack,.dp903-score-col.main,.dp901-score-col');
     if(!stack||!head.contains(stack)){
       stack=document.createElement('div');stack.className='dp1046-primary-stack';
       ring.before(stack);stack.append(ring);
     }
     stack.classList.add('dp1046-primary-stack');
     if(head.closest('.dp905-sleep-day')){
       const n=Number(ring.dataset.score);
       if(ring.dataset.score!==''&&Number.isFinite(n)&&!stack.querySelector('.dp1040-status')){
         const grade=document.createElement('span'),api=root.DeepPetUX1040;
         grade.className=`dp1040-status dp1040-tier-${api.tier(n)}`;
         grade.textContent=api.label(n);grade.dataset.dp1040Score=String(n);
         grade.dataset.dp1040Key='sleep';grade.setAttribute('role','button');grade.tabIndex=0;stack.append(grade);
       }
     }
     const n=Number(ring.dataset.score);
     if(ring.dataset.score!==''&&Number.isFinite(n)){
       const color=scoreScheme(n).color;
       ring.style.setProperty('--sc',color);ring.style.setProperty('--dp-dots',color);
     }
   }
 }
 function labels(app){
   if(state.tab==='deep'&&[7,30].includes(Number(state.range))){
     app.querySelectorAll('.dp-owner-deep .dp903-expand>summary,.dp-owner-deep .dp901-expand>summary').forEach(s=>{s.textContent=readable();});
   }
   if(state.tab==='health'&&!state.detail){
     app.querySelectorAll('.dp-upcoming-care .dp999-more>summary').forEach(s=>{
       s.textContent=s.parentElement?.open?L('收起','Show less','閉じる','접기'):'More';
     });
   }
 }
 const oldRender=render;
 render=function(reset=false){
   oldRender(reset);
   const app=document.querySelector('#app');
   if(!app)return;
   if(state.tab==='deep')primaryMeters(app);
   labels(app);
   app.querySelectorAll('.app-build-version').forEach(x=>x.textContent='DeepPet Version '+(root.DeepPetBuildVersion||'10.46'));
 };
 root.DeepPetUX1046=Object.freeze({version:'10.46',newBaselineSpark,scoped30,mapSeries});
 root.DeepPetRelease={...root.DeepPetRelease,version:root.DeepPetBuildVersion||'10.46',
   integrity:[...(root.DeepPetRelease?.integrity||[]),
    'same-main-ring-across-sleep-day-week-month',
    'actual-14-valid-day-personal-health-sparkline',
    'paired-battery-number-explicit-not-color-inherited',
    '7-day-is-30-day-suffix-with-identical-observations',
    'period-detail-axes-share-30-day-domain',
    'separate-energy-score-from-daily-movement',
    'no-missing-clinical-values-fabricated',
    'health-upcoming-more-text-only']};
})(window);
