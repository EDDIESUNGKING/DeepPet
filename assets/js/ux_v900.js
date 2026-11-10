/* DeepPet V9.0 — semantic model and UI consolidation.
   Demo only: the generated one-minute series is NOT raw BCG/ECG and cannot establish apnea, arrhythmia or sudden-death risk. */
(function(){
'use strict';
const L=(a,b,c,d,e)=>state.lang==='zh'?b:state.lang==='en'?c:state.lang==='ko'?d:state.lang==='ja'?(e||c):a;
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const avgScore=a=>a.length?dpOwnerQualityValue(mean(a)):null;
const safe=(v,d=0)=>v===null||v===undefined||!Number.isFinite(Number(v))?'—':Number(v).toFixed(d);
const es=x=>typeof esc==='function'?esc(String(x)):String(x);
const grade=s=>s===null?L('資料不足','数据不足','Insufficient data','데이터 부족','データ不足'):s>=90?L('健康','健康','Healthy','건강','健康'):s>=80?L('輕風險','轻风险','Low Risk','가벼운 주의','軽度注意'):s>=60?L('中風險','中风险','Middle Risk','중간 주의','中程度注意'):L('高風險','高风险','High Risk','높은 주의','高度注意');
const themeClass=s=>s===null?'none':s>=90?'normal':s>=80?'light':s>=60?'medium':'high';
const panelScore=(n,large=false)=>n===null?`<div class="dp90-unavailable">—</div>`:`<div class="dp90-indicator ${themeClass(n)}${large?' major':''}">${dpDeepDottedScore(n,'#4387dc')}<span class="dp90-status">${grade(n)}</span></div>`;

// The visible two-part body rhythm score is NOT the retired three-component score.
rhythmCompositeScore=function(m=rhythmData().today){if(!m)return null;return dpOwnerQualityValue((rhythmPositiveValue('calm',m)+rhythmPositiveValue('stable',m))/2);};
const previousScores=dpOwnerDayScores;
dpOwnerDayScores=function(row,withRecovery=false){
 const v=previousScores(row,true);
 // Recovery is the drop in heart rate over two minutes, scored against like-for-like examples.
 // No recovery data: don't invent a recovery score. Energy-only is identified in the UI.
 const recovery=Number.isFinite(Number(v.recovery))&&v.recovery!==null?Number(v.recovery):null;
 v.energyActivity=dpOwnerQualityValue(recovery===null?v.energy:(v.energy+recovery)/2);
 return v;
};

// Interpretations follow the same computed data displayed in the current UI.
dpDailyNarrative=function(d=currentDog(),m=rhythmData().today){
 const q=dpTodayUnifiedScores(),phys=score(d),calm=dpOwnerQualityValue(rhythmPositiveValue('calm',m)),stable=dpOwnerQualityValue(rhythmPositiveValue('stable',m)),rhythm=rhythmCompositeScore(m);
 const categories=[q.heart,q.sleep,q.energyActivity],weak=categories.indexOf(Math.min(...categories)),rWeak=calm<=stable?'calm':'stable';
 const health=phys>=90?L('今天整體狀態很好。','今天整体状态很好。','Overall health looks strong today.','오늘 전반적인 상태가 좋습니다.'):
 phys>=80?L('今天整體狀態穩定。','今天整体状态稳定。','Overall health is fairly steady today.','전반적인 건강 상태가 안정적입니다.'):
 L('今天有些指標偏離平常。','今天部分指标偏离平常。','Some measurements differ from usual today.','일부 지표가 평소와 다릅니다.');
 const second=[q.heart,q.sleep,q.energyActivity][weak];const weakText=weak===0?L('優先回看心跳與呼吸的有效紀錄。','优先查看心跳与呼吸的有效记录。','Review heart-rate and breathing readings first.','심박과 호흡 기록을 먼저 확인하세요.'):
 weak===1?L('可比較夜間休息中斷與時長。','可以比较夜间休息中断和时长。','Compare overnight rest duration and interruptions.','야간 휴식과 중단 횟수를 확인하세요.'):
 L('重點比較精力與活動後兩分鐘的心率恢復。','重点比较精力与活动后两分钟的心率恢复。','Compare energy with the two-minute post-activity heart-rate drop.','활력과 활동 후 2분 심박 감소를 확인하세요.');
 const rhythmText=rhythm>=90?L('放鬆與心搏節奏表現都很穩定。','放松与心搏节奏表现都很稳定。','Calmness and heartbeat rhythm are steady.','안정도와 심박 리듬이 안정적입니다.'):
 rhythm>=80?L('身體節奏整體接近平常。','身体节奏整体接近平常。','Body rhythm is broadly near usual.','몸의 리듬이 대체로 평소와 비슷합니다.'):
 L('身體節奏有值得回看的變化。','身体节奏出现值得查看的变化。','Body rhythm shows changes worth reviewing.','몸의 리듬 변화를 확인해 주세요.');
 const rSecond=rWeak==='calm'?L('可查看放鬆與平穩度的近期變化。','可查看放松与平稳度的近期变化。','Review recent rest-and-steadiness trends.','휴식과 안정도 추세를 확인하세요.'):
 L('可查看心搏節奏穩定度。','可查看心搏节奏稳定度。','Review heartbeat rhythm stability.','심박 리듬 안정도를 확인하세요.');
 return {health:signalQuality().valid?`${health}${second<80?weakText:''}`:qualityMessage(),rhythm:signalQuality().valid?`${rhythmText}${rhythm<90?rSecond:''}`:qualityMessage()};
};

// No additional load-regulation category in the Home focus list.
const oldAttention=attentionItems;
attentionItems=function(d=currentDog()){
 return oldAttention(d).map(it=>{
  if(it.kind!=='load'){
   if(it.kind==='activity'){
    it.title=L('精力與恢復有變化','精力与恢复有变化','Energy and recovery changed','활력 및 회복에 변화');
    it.why=L(`精力與恢復綜合分 ${it.value}/100，請比較精力及兩分鐘心率回落。`,`精力与恢复综合分 ${it.value}/100，请比较精力及两分钟心率下降幅度。`,`Energy and recovery score ${it.value}/100; review energy and the two-minute HR drop.`,`활력·회복 점수 ${it.value}/100. 2분 심박 감소를 비교하세요.`);
   }
   return it;
  }
  return {...it,kind:'recovery',title:L('兩分鐘恢復變化','两分钟恢复变化','Two-minute recovery change','2분 회복 변화'),why:L('活動後心率回落與近期紀錄不同；請查看精力與恢復。','活动后心率下降幅度与近期记录不同；请查看精力与恢复。','Post-activity heart-rate drop differs from recent records.','활동 후 심박 감소가 최근 기록과 다릅니다.')};
 });
};

// Only two source scores in the click-through summary, each navigating to its own Deep metric.
rhythmDetailModal=function(){
 if(!signalQuality().valid)return qualityInline();
 const m=rhythmData().today,keys=['calm','stable'],s=rhythmCompositeScore(m);
 return `<div class="summary-detail-v44 dp-rhythm-summary dp90-rhythm-detail"><p class="summary-detail-lead"><strong>${L('身體節奏分數','身体节奏分数','Body rhythm score','몸의 리듬 점수')}：${s} /100</strong></p><p class="dp90-description">${L('由「放鬆與平穩度」及「心搏節奏穩定度」兩項分數的平均組成。點擊下方任一項，直接前往對應分析。','由「放松与平稳度」及「心搏节奏稳定度」两项分数平均组成。点击下方指标直接查看对应分析。','Average of two measures: rest & steadiness and heartbeat rhythm stability. Tap a score to view its Deep analysis.','휴식·안정도와 심박 리듬 안정도 두 점수의 평균입니다.')}</p><div class="summary-three-rings dp90-two-rings">${keys.map(k=>{const n=dpOwnerQualityValue(rhythmPositiveValue(k,m));return `<button class="summary-ring-item" data-action="dp90-rhythm-nav" data-key="${k}"><span class="summary-ring-label">${rhythmLabel(k)}</span>${scoreRing(n)}<span class="summary-ring-status" style="color:${scoreScheme(n).color}">${grade(n)} ›</span></button>`}).join('')}</div><p class="notices">${L('這些是模型化的個體趨勢分數，不能單獨判斷疾病。','这些是模型化的个体趋势分数，不能单独诊断疾病。','Modeled personal trend scores; not a medical diagnosis.','개인 추세 점수이며 진단이 아닙니다.')}</p></div>`;
};

// Only heart rhythm stability needs explanation in the heart category.
const priorHeartCard=dpOwnerRhythmCard,priorPeriodRhythm=dp66PeriodRhythm;
const beatExplanation=()=>`<details class="dp90-beat-help"><summary>${L('什麼是心搏節奏穩定度？','什么是心搏节奏稳定度？','What is heartbeat rhythm stability?','심박 리듬 안정도란?')}</summary><p>${L('比較有效心搏間隔的規律性、短期變化與這隻寵物的個體基準；分數越高代表越接近模型定義的平常模式。不能由此診斷心律不整，也不是變化越小越健康。','比较有效心搏间隔的规律性、短期变化与这只宠物的个体基准；较高分表示更接近平常模式。不能诊断心律失常，也不是变化越小越健康。','Compares valid beat-interval consistency and short-term variation with this pet’s own pattern. It cannot diagnose arrhythmia.','유효 심박 간격의 일관성과 단기 변화를 개인 기준에 비교합니다. 부정맥 진단이 아닙니다.')}</p></details>`;
dpOwnerRhythmCard=function(row,cp){return priorHeartCard(row,cp).replace('</section>',beatExplanation()+'</section>');};
dp66PeriodRhythm=function(rows,cp){return priorPeriodRhythm(rows,cp).replace('</section>',beatExplanation()+'</section>');};

// Energy / Recovery score methods reflect exactly the three visible indicators.
dpMetricUsageNotes=function(kind){if(kind!==2)return '';
 const entries=[
 [L('精力情況','精力情况','Energy status','활력 상태'),L('根據有效的活動與休息模式推估精力分數。示範版使用模擬情境，並非直接量到精力。','根据有效活动与休息模式估算精力分数。演示版是模拟数据，不是直接测到精力。','Estimated from movement/rest patterns; the demo is simulated and energy is not directly sensed.','활동·휴식 패턴으로 추정하며 데모 데이터입니다.')],
 [L('恢復情況','恢复情况','Recovery status','회복 상태'),L('以活動停止點前後心率為依據，測算之後兩分鐘內心率下降了多少 bpm；對照同一隻寵物、相近運動強度與有效品質的紀錄。不是直接測量疾病風險。','以活动停止点为起点，测算随后两分钟内心率下降多少 bpm，并与同宠物相近运动强度的有效记录比较。不是疾病风险诊断。','Scores the heart-rate drop (bpm) within two minutes after activity ends, compared with similar valid efforts for the same pet; not a disease-risk measurement.','활동 종료 후 2분 동안 심박수가 얼마나 감소했는지 비교합니다.')],
 [L('放鬆與平穩度','放松与平稳度','Rest & steadiness','휴식과 안정도'),L('比較安靜時有效心搏間隔、RMSSD 與 SDNN 和個體基準的變化；不能由此斷定情緒、疼痛或疾病。','比较安静状态下有效心搏间隔、RMSSD、SDNN 与个体基准；不能由此推断情绪、疼痛或疾病。','Compares quiet-time beat intervals, RMSSD and SDNN to the pet’s baseline; not an emotion or disease test.','휴식 중 심박 간격과 HRV를 개인 기준과 비교하며 진단이 아닙니다.')]
 ];
 return `<details class="card dp-metric-usage-notes dp-collapsible-note"><summary><h3>${L('各項分數測算依據與指標解釋','各项分数测算依据与指标解释','Score methods & explanations','점수 산정 및 지표 설명')}</h3><span class="dp-note-chevron" aria-hidden="true"></span></summary><div class="dp-note-reveal dp90-only-three">${entries.map(([t,d])=>`<div class="dp-metric-note-row"><b>${t}</b><p>${d}</p></div>`).join('')}</div><p class="dp-metric-note-footer">${L('只用於觀察個體趨勢；正式設備須先完成犬貓分別的量測驗證。','仅用于观察个体趋势；正式设备需要完成犬猫分别验证。','For personal trend review only; species-specific validation is needed before clinical use.','개인 추세 비교용입니다.')}</p></details>`;
};
// The old advanced section must not show the retired load indicator.
const priorComponents=dpComponentScorePanel;
dpComponentScorePanel=function(kind){if(kind!==2)return priorComponents(kind);const m=rhythmData().values,rows=state.range===1?demoRecords(state.dog).filter(r=>r.date===deepChosenDate()):dayRowsWithIndex(state.range).filter(r=>validDaySample(r,r.idx).valid),vals=rows.map(r=>m[r.idx]).filter(Boolean).map(x=>dpOwnerQualityValue(rhythmPositiveValue('calm',x))),v=avgScore(vals);
 return `<section class="card dp-component-panel dp90-calm-card" id="dp-component-section"><h3>${L('放鬆與平穩度','放松与平稳度','Rest & steadiness','휴식과 안정도')}</h3><div class="dp90-two-col"><p>${L('依安靜狀態下的心搏間隔與 HRV 趨勢，與這隻寵物的有效個體紀錄比較。','根据安静状态下心搏间隔与 HRV 趋势，与宠物个人有效记录比较。','Compared with valid quiet-time heartbeat interval and HRV history.','휴식 시 유효 HRV를 개인 추세와 비교합니다.')}</p>${panelScore(v)}</div></section>`;};

function scoreCard(name,score,detail,chart,other=''){
 return `<section class="dp-vital-panel dp90-three-card"><div class="dp-vital-heading"><div><b>${name}</b></div>${panelScore(score)}</div><p class="dp90-description">${detail}</p>${other}${chart}</section>`;
}
const oldDay=dpOwnerDayDetail,oldPeriod=dpOwnerPeriodDetail;
dpOwnerDayDetail=function(kind,cp,row){if(kind!==2)return oldDay(kind,cp,row);
 const v=dpOwnerDayScores(row,true),m=rhythmData().values[row.idx],calm=m?dpOwnerQualityValue(rhythmPositiveValue('calm',m)):null,recovery=dpOwnerRecoveryComparison(row),recScore=recovery?.score??null;
 const recText=recovery?L(`活動停止後兩分鐘，心率平均下降 ${safe(recovery.average,1)} bpm。${recovery.reference!==null?`相近活動的前期均值為 ${safe(recovery.reference,1)} bpm，差異 ${recovery.diff>=0?'+':''}${safe(recovery.diff,1)} bpm。`:'相近活動紀錄不足，正在建立比較基準。'}`,`活动结束后两分钟，心率平均下降 ${safe(recovery.average,1)} bpm。${recovery.reference!==null?`此前类似活动均值 ${safe(recovery.reference,1)} bpm，变化 ${recovery.diff>=0?'+':''}${safe(recovery.diff,1)} bpm。`:'类似活动有效记录不足，暂时无法比较基准。'}`,`Heart rate dropped ${safe(recovery.average,1)} bpm within two minutes of activity stopping. ${recovery.reference!==null?`Comparable prior average ${safe(recovery.reference,1)} bpm; change ${safe(recovery.diff,1)} bpm.`:'Comparable prior efforts are insufficient.'}`,`활동 종료 후 2분간 평균 ${safe(recovery.average,1)} bpm 감소했습니다.`):L('當天沒有足夠品質的活動結束點與心率序列，暫不給出恢復分數。','当天没有足够质量的活动结束点和心率序列，不显示恢复分数。','There is no valid activity-end/heart-rate pair, so a recovery score is withheld.','유효 회복 자료가 없어 점수를 표시하지 않습니다.');
 const overall=scoreCard(L('精力情況','精力情况','Energy status','활력 상태'),v.energy,L('由活動與休息記錄估算當日精力，須與自身日常模式比較。','由活动与休息记录估算当日精力，需与自身日常记录比较。','Estimated from movement/rest and compared to this pet’s routine.','활동·휴식 패턴을 기준으로 추정합니다.'),`<details class="dp66-expand"><summary>${L('查看精力趨勢','查看精力趋势','View energy trend','활력 추세 보기')}</summary>${dpEnergyHourlyChart(row,v.energy)}</details>`);
 const recoverCard=scoreCard(L('恢復情況','恢复情况','Recovery status','회복 상태'),recScore,recText,recovery?`<details class="dp66-expand"><summary>${L('查看兩分鐘心率回落曲線','查看两分钟心率下降曲线','View two-minute HR recovery','2분 심박 회복 보기')}</summary>${dpOwnerRecoveryCurve(row,recovery)}</details>`:'',recovery?`<div class="dp90-recovery-numbers"><span>${L('停止時','停止时','At stop','종료 시')} <b>${safe(recovery.peak,1)} bpm</b></span><span>${L('兩分鐘後','两分钟后','After 2 min','2분 후')} <b>${safe(recovery.at2,1)} bpm</b></span></div>`:'');
 const calmCard=scoreCard(L('放鬆與平穩度','放松与平稳度','Rest & steadiness','휴식과 안정도'),calm,L('依安靜時的心搏間隔和 HRV 變化，與個體基準比較；不能代表情緒診斷。','根据安静时心搏间隔和 HRV 变化与个体基准比较，不能诊断情绪或疾病。','Quiet-time beat intervals and HRV are compared with personal baseline; not a mood diagnosis.','휴식 중 HRV와 개인 기준을 비교합니다.'),'');
 return `<section class="card dp-owner-status-card dp-owner-activity dp90-energy-view"><div class="dp-owner-status-inner"><div class="dp-owner-status-heading dp-heart-overall-heading"><div><h2>${L('精力與恢復狀態','精力与恢复状态','Energy & Recovery','활력과 회복 상태')}</h2><p class="dp-heart-overall-verdict">${dpOwnerStatus(v.energyActivity)}</p></div>${panelScore(v.energyActivity,true)}</div><p class="dp90-description">${L(`今天精力 ${v.energy} 分，${recScore===null?'有效恢復紀錄不足':`恢復 ${recScore} 分；活動後兩分鐘心率平均下降 ${safe(recovery.average,1)} bpm`}。`,`今天精力 ${v.energy} 分，${recScore===null?'有效恢复记录不足':`恢复 ${recScore} 分；活动后两分钟心率平均下降 ${safe(recovery.average,1)} bpm`}。`,`Energy ${v.energy}/100; ${recScore===null?'recovery not yet available':`recovery ${recScore}/100, HR decreased ${safe(recovery.average,1)} bpm over two minutes`}.`,`오늘 활력 ${v.energy}점, 회복 ${recScore===null?'자료 부족':recScore+'점'}.`)}</p>${overall}${recoverCard}${calmCard}</div></section>`;
};
dpOwnerPeriodDetail=function(kind,cp,days){if(kind!==2){let out=oldPeriod(kind,cp,days);if(kind===0){const current=deepChosenDate();out+=`<section class="card dp90-wave-shortcuts"><h3>${L('波形與異常時間回看','波形与异常时间回看','Signal review','파형 및 변화 시점')}</h3><div class="dp90-wave-buttons"><button class="dp66-live-link" data-action="dp90-wave-open" data-kind="heart">${L('心跳趨勢詳情','心跳趋势详情','Heart-rate detail','심박 추세')}</button><button class="dp66-live-link" data-action="dp90-wave-open" data-kind="breath">${L('呼吸趨勢詳情','呼吸趋势详情','Breathing detail','호흡 추세')}</button></div></section>`;}return out;}
 const rows=dayRowsWithIndex(days).filter(r=>validDaySample(r,r.idx).valid);if(!rows.length)return `<section class="card">${L('有效資料不足','有效数据不足','Not enough data','유효 데이터 부족')}</section>`;
 const scores=rows.map(r=>dpOwnerDayScores(r,true)),m=rhythmData().values;
 const entries=[{k:'energy',title:L('精力情況','精力情况','Energy status','활력 상태'),vals:scores.map(x=>x.energy)},
 {k:'recovery',title:L('恢復情況','恢复情况','Recovery status','회복 상태'),vals:scores.map(x=>x.recovery)},
 {k:'calm',title:L('放鬆與平穩度','放松与平稳度','Rest & steadiness','휴식과 안정도'),vals:rows.map(r=>m[r.idx]?dpOwnerQualityValue(rhythmPositiveValue('calm',m[r.idx])):null)}];
 const overall=avgScore(scores.map(x=>x.energyActivity));
 const e=avgScore(entries[0].vals.filter(Number.isFinite)),r=avgScore(entries[1].vals.filter(x=>x!==null&&Number.isFinite(x))),c=avgScore(entries[2].vals.filter(x=>x!==null&&Number.isFinite(x)));
 const recoveryData=rows.map(x=>dpOwnerRecoveryComparison(x)).filter(Boolean),dropAvg=mean(recoveryData.map(x=>x.average)),half=Math.floor(rows.length/2),first=rows.slice(0,half),last=rows.slice(half);
 const part=k=>{const v=rs=>rs.map(x=>dpOwnerDayScores(x,true)[k]).filter(x=>x!==null&&Number.isFinite(x));const a=v(first),b=v(last);return a.length&&b.length?mean(b)-mean(a):null;};
 const energyDiff=part('energy'),recDiff=part('recovery');
 const line1=L(`最近 ${days} 天精力平均 ${e??'—'} 分；${energyDiff===null?'有效資料不足以比較前後半段':Math.abs(energyDiff)<3?'前後半段維持接近':`後半段比前半段${energyDiff>=0?'高':'低'}約 ${Math.abs(energyDiff).toFixed(0)} 分`}。`,`最近 ${days} 天精力平均 ${e??'—'} 分；${energyDiff===null?'有效数据不足以比较前后半段':Math.abs(energyDiff)<3?'前后半段变化不大':`后半段比前半段${energyDiff>=0?'高':'低'}约 ${Math.abs(energyDiff).toFixed(0)} 分`}。`,`Over ${days} days, energy averaged ${e??'—'}/100; ${energyDiff===null?'not enough data to compare':Math.abs(energyDiff)<3?'little change across the period':`${energyDiff>0?'higher':'lower'} by ${Math.abs(energyDiff).toFixed(0)} points in the latter half`}.`,`최근 ${days}일 활력 평균 ${e??'—'}점입니다.`);
 const line2=L(`恢復分數平均 ${r??'—'} 分；${dropAvg===null?'尚無有效的兩分鐘回落量':`活動後兩分鐘心率平均下降 ${safe(dropAvg,1)} bpm`}。${recDiff===null?'':Math.abs(recDiff)<3?'前後半段恢復表現接近。':`後半段恢復分數${recDiff>0?'上升':'下降'}約 ${Math.abs(recDiff).toFixed(0)} 分。`}`,`恢复分数平均 ${r??'—'} 分；${dropAvg===null?'没有有效的两分钟下降幅度':`活动后两分钟心率平均下降 ${safe(dropAvg,1)} bpm`}。${recDiff===null?'':Math.abs(recDiff)<3?'前后半段恢复表现接近。':`后半段恢复分数${recDiff>0?'上升':'下降'}约 ${Math.abs(recDiff).toFixed(0)} 分。`}`,`Recovery averaged ${r??'—'}/100; ${dropAvg===null?'valid two-minute drops unavailable':`mean post-activity drop ${safe(dropAvg,1)} bpm over two minutes`}.`,`회복 평균 ${r??'—'}점이며 2분 심박 감소 ${safe(dropAvg,1)} bpm입니다.`);
 const line3=L(`放鬆與平穩度平均 ${c??'—'} 分；這項分數比較安靜時的心搏與個體基準，不代表情緒診斷。`,`放松与平稳度平均 ${c??'—'} 分；此分数基于安静心搏和个体基准，并非情绪诊断。`,`Rest and steadiness averaged ${c??'—'}/100, compared with quiet-time personal trends; not a mood diagnosis.`,`휴식·안정도 평균 ${c??'—'}점입니다.`);
 return `<section class="card dp-owner-period-card dp-period-activity dp90-energy-view"><div class="dp-heart-period-overall"><div><h2>${L('精力與恢復狀態','精力与恢复状态','Energy & Recovery','활력과 회복 상태')}</h2><p class="dp-heart-overall-verdict">${dpOwnerStatus(overall)}</p></div>${panelScore(overall,true)}</div><div class="dp90-period-story"><p>${line1}</p><p>${line2}</p><p>${line3}</p></div>${entries.map(x=>{const pairs=rows.map((row,i)=>({row,v:x.vals[i]})).filter(z=>z.v!==null&&Number.isFinite(z.v)),v=avgScore(pairs.map(z=>z.v)),desc=x.k==='recovery'?L('依活動停止後兩分鐘心率下降量比較相近強度的有效紀錄。','按活动停止后两分钟心率下降量，对比相近强度的有效记录。','Compared using the HR drop over two minutes after activity stops.','활동 종료 후 2분 심박 감소를 비교합니다.'):x.k==='calm'?L('比較安靜時 HRV 與個體基準。','比较安静时 HRV 和个体基准。','Compares quiet-time HRV with the personal baseline.','휴식 중 HRV를 개인 기준과 비교합니다.'):L('比較精力與活動休息的日常變化。','比较精力与活动休息的日常变化。','Compares energy with daily movement/rest patterns.','활력과 일상 활동·휴식을 비교합니다.');return scoreCard(x.title,v,desc,`<details class="dp66-expand"><summary>${L('查看每日趨勢','查看每日趋势','View daily trend','일별 추세')}</summary>${pairs.length>1?dpOwnerPeriodMetricChart(pairs.map(z=>z.row),x.k,'#4387dc',pairs.map(z=>z.v),'/100'):L('有效資料不足','有效数据不足','Not enough data','유효 데이터 부족')}</details>`);}).join('')}</section>`;
};

// Precise flagged minute on a demonstrated one-minute series, NEVER described as a raw waveform event.
function signalData(date,kind){
 const r=dpSignals(date,[kind,'heart','breath']);const series=r[kind];
 if(!Array.isArray(series)||series.length!==1440)return null;
 const peak=dp66DemoPeak(date,kind),time=peak?.time??'12:00';let index=Math.max(0,Math.min(1439,(Number(time.slice(0,2))*60+Number(time.slice(3,5)))));
 const vals=series.map(Number),current=vals[index];if(!Number.isFinite(current))return null;
 const earlier=demoRecords(state.dog).filter(x=>x.date<date).slice(-14),reference=earlier.map(row=>dpSignals(row.date,[kind])?.[kind]?.[index]).filter(Number.isFinite);
 const ref=reference.length>=3?mean(reference):mean(vals),refName=reference.length>=3?L('之前有效日同分鐘均值','此前有效日同分钟均值','Previous valid days at same minute','이전 유효일 동시간 평균'):L('當日平均（參考）','当日平均（参考）','Day mean (reference)','당일 평균');
 return {date,kind,vals,heart:r.heart,breath:r.breath,index,time,current,ref,refName,n:reference.length,diff:current-ref};
}
function isShortNose(p=currentDog()){const species=String(p.species||'dog').toLowerCase();if(species==='cat')return false;return /巴哥|八哥|pug|法鬥|法斗|法國鬥牛|法国斗牛|french\s*bulldog|english\s*bulldog|boston\s*terrier|波士頓梗|波士顿梗|短鼻|英鬥|英斗/i.test(String(breedText(p)||'')+' '+String(p.breed||''));}
function breedAdvice(kind){const d=currentDog(),short=isShortNose(d),breed=breedText(d);if(kind==='breath'&&short)return `<div class="dp90-breed-alert"><h3>${L('短鼻犬：優先留意呼吸變化','短鼻犬：优先留意呼吸变化','Short-nosed breed: breathing priority','단두종: 호흡 우선')}</h3><p>${L('巴哥、法鬥等短鼻犬較容易出現上呼吸道問題。特別留意安靜時持續喘促、呼吸費力、熱天不耐受或活動後無法平復。項圈不能單獨辨別阻塞或缺氧。','巴哥、法斗等短鼻犬更需要关注上呼吸道问题，尤其是安静时持续喘促、呼吸费力、炎热天气不耐受或运动后无法缓解。项圈不能诊断气道阻塞或缺氧。','Brachycephalic dogs may have airway problems. Watch for labored breathing at rest, heat intolerance, or difficulty settling after exercise. A collar cannot diagnose obstruction or low oxygen.','단두종은 기도 문제가 발생할 수 있습니다. 휴식 시 호흡 곤란과 열 스트레스를 확인하세요.')}</p></div>`;
 if(/阿拉斯加|malamute/i.test(String(breed)) )return `<div class="dp90-breed-note">${L('阿拉斯加犬：體重、關節、運動耐受與日常活動可作為照護重點；心肺波形不能用來判斷腸胃病或關節疾病。','阿拉斯加犬：更适合同时关注体重、关节和活动耐受；心肺波形不能诊断肠胃或关节疾病。','For Malamutes, weight, joints and exercise tolerance may be useful care priorities; this heart/breathing trend cannot diagnose gut or joint disease.','알래스칸 맬러뮤트는 체중과 관절도 함께 확인하세요.')}</div>`;
 return `<div class="dp90-breed-note">${L('個體判讀需要結合品種、年齡、體型、日常活動及自身基準，不能僅靠單條曲線判定疾病。','应结合品种、年龄、体型、活动与个人基准，不能仅凭曲线诊断疾病。','Interpret with breed, age, size, activity and personal baseline; no diagnosis from a single chart.','품종·나이·활동·개인 기준을 함께 검토합니다.')}</div>`;
}
function waveDetail(){
 const kind=state.dp90WaveKind==='breath'?'breath':'heart',date=state.dp90WaveDate||deepChosenDate(),d=signalData(date,kind),isHeart=kind==='heart',color=isHeart?'#be4f73':'#b16c83',unit=isHeart?'bpm':L('次／分','次／分','/min','회/분');
 const title=isHeart?L('心跳趨勢與變化位置','心跳趋势与变化位置','Heart-rate trend & flagged point','심박 추세 및 변화 위치'):L('呼吸趨勢與變化位置','呼吸趋势与变化位置','Breathing trend & flagged point','호흡 추세 및 변화 위치');
 if(!d)return `<div class="app-pad dp90-wave-page"><header class="dp-independent-head"><button data-action="dp90-wave-back">←</button><b>${title}</b></header><section class="card">${L('這一天沒有可用的逐分鐘記錄。','这一天没有可用的逐分钟记录。','No valid minute-level record is available for this date.','유효한 분 단위 기록이 없습니다.')}</section></div>`;
 const start=Math.max(0,Math.min(1349,d.index-45)),indices=Array.from({length:91},(_,i)=>start+i),v=indices.map(i=>d.vals[i]),min=Math.min(...v,d.ref)-2,max=Math.max(...v,d.ref)+2,W=360,H=206,pl=38,pr=12,pt=20,pb=43,
 x=idx=>pl+(idx-start)*(W-pl-pr)/(indices.length-1),y=val=>pt+(max-val)/Math.max(.01,max-min)*(H-pt-pb),pts=indices.map(i=>`${x(i).toFixed(1)},${y(d.vals[i]).toFixed(1)}`),pointX=x(d.index),pointY=y(d.current);
 const axes=[0,30,60,90].map(i=>{const at=start+i,hh=String(Math.floor(at/60)).padStart(2,'0'),mm=String(at%60).padStart(2,'0');return `<text x="${x(at)}" y="${H-14}" text-anchor="${i===0?'start':i===90?'end':'middle'}" font-size="10" fill="#8890a2">${hh}:${mm}</text>`}).join('');
 const svg=`<svg viewBox="0 0 ${W} ${H}" class="dp90-signal-plot" role="img" aria-label="${es(title)}"><line x1="${pl}" y1="${y(d.ref)}" x2="${W-pr}" y2="${y(d.ref)}" stroke="#a4afbb" stroke-width="1.5" stroke-dasharray="5 4"/><polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2.7" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${pointX}" cy="${pointY}" r="13.5" fill="#fff" fill-opacity=".5" stroke="#e15b64" stroke-width="2.7"/><circle cx="${pointX}" cy="${pointY}" r="4" fill="#e15b64"/><line x1="${pointX}" y1="${pt-2}" x2="${pointX}" y2="${H-pb}" stroke="#e15b64" stroke-width="1.25" stroke-dasharray="3 4"/>${axes}<text x="${pl}" y="12" font-size="10" fill="#657087">${unit}</text></svg>`;
 const gradeLevel=dp66VitalGrade(demoRecords(state.dog).map((r,i)=>({...r,idx:i})).find(r=>r.date===date),kind),companion=isHeart?d.breath?.[d.index]:d.heart?.[d.index],otherUnit=isHeart?L('次／分','次／分','/min','회/분'):'bpm';
 return `<div class="app-pad dp90-wave-page"><header class="dp-independent-head"><button data-action="dp90-wave-back" aria-label="Back">←</button><b>${title}</b></header><div class="dp90-wave-pet"><b>${es(currentDog().name)}</b><span>${es(breedText(currentDog()))} · ${es(date)}</span></div><section class="card dp90-wave-overview"><div class="dp90-wave-title"><h2>${L('示範訊號變化點','示范信号变化点','Illustrative signal change','시뮬레이션 변화 지점')}</h2><span class="dp90-grade ${themeClass(gradeLevel<0?null:dpOwnerVitalScore(demoRecords(state.dog).map((r,i)=>({...r,idx:i})).find(r=>r.date===date),kind))}">${gradeLevel<0?L('資料不足','数据不足','Insufficient data','자료 부족'):grade(dpOwnerVitalScore(demoRecords(state.dog).map((r,i)=>({...r,idx:i})).find(r=>r.date===date),kind))}</span></div><div class="dp90-time">${es(date)}　${d.time}</div><div class="dp90-wave-values"><div><small>${isHeart?L('當分鐘心率','当分钟心率','Heart rate at minute','해당 분 심박'):L('當分鐘呼吸','当分钟呼吸','Breathing at minute','해당 분 호흡')}</small><strong>${safe(d.current,1)} <em>${unit}</em></strong></div><div><small>${d.refName}</small><strong>${safe(d.ref,1)} <em>${unit}</em></strong></div><div><small>${L('與參考的差異','与参考值的差异','Difference from reference','기준 대비 차이')}</small><strong>${d.diff>0?'+':''}${safe(d.diff,1)} <em>${unit}</em></strong></div></div><p class="dp90-wave-caption">${L('紅色圓圈精準標出圖中示範序列的該分鐘數值，不是臨床判定的異常起止時間。','红色圆圈定位到示范序列中该分钟的数值，不是临床判断的异常开始或结束时间。','The red circle marks this minute’s plotted demo value—not a clinically determined event onset/end.','빨간 원은 데모의 분당 값을 표시하며 임상 진단이 아닙니다.')}</p></section><section class="card dp90-wave-plot-card"><h3>${L('變化時間附近的趨勢（前後約45分鐘）','变化时间附近的趋势（前后约45分钟）','Trend around flagged time (±45 min)','변화 시점 전후 약 45분')}</h3>${svg}<div class="dp90-wave-legend"><span style="color:${color}">● ${isHeart?L('心率','心率','Heart rate','심박'):L('呼吸','呼吸','Breathing','호흡')}</span><span>┄ ${L('參考線','参考线','Reference','기준선')}</span><span style="color:#df5a61">◯ ${L('標記點','标记点','Flagged minute','표시 시간')}</span></div><p>${L(`同步觀察：該分鐘${isHeart?'呼吸':'心率'} ${safe(companion,1)} ${otherUnit}。僅表明同一分鐘兩項讀數，不能證明因果關係。`,`同步观察：该分钟${isHeart?'呼吸':'心率'} ${safe(companion,1)} ${otherUnit}。只有同一分钟的读数，不能证实因果关系。`,`Concurrent ${isHeart?'breathing':'heart-rate'} value: ${safe(companion,1)} ${otherUnit}. Coincidence does not establish cause.`,`동일한 분의 다른 지표 ${safe(companion,1)} ${otherUnit}입니다.`)}</p></section>${breedAdvice(kind)}<section class="card dp90-wave-safety"><b>${L('何時需要立即就醫','何时需要立即就医','When to seek emergency veterinary care','응급 진료 신호')}</b><p>${L('若實際出現呼吸明顯費力、黏膜發藍、倒下、失去意識等症狀，請立即尋求獸醫急診，不要等待 APP 警示或依此曲線自行判斷。','若实际出现呼吸明显费力、牙龈发蓝、倒下或失去意识，请立即就医，不要等待 APP 预警。','Labored breathing, blue gums, collapse or loss of consciousness need emergency veterinary help. Do not wait for an app alert.','호흡 곤란, 잇몸 청색증, 쓰러짐은 즉시 동물병원으로 가야 합니다.')}</p></section><p class="dp90-demo-warning">${L('本頁使用逐分鐘模擬資料；並非原始 255Hz BCG 波形、20Hz SDK 資料，也不能識別呼吸暫停、心律不整或預測猝死。真實波形需在硬體 SDK 接入、訊號品質控制與獸醫驗證後提供。','本页为逐分钟模拟数据，并非原始 255Hz BCG 波形或 20Hz SDK 数据，无法识别呼吸暂停、心律失常或预测猝死。','This page uses simulated minute-level data, not raw 255Hz BCG or the 20Hz SDK waveform. It cannot diagnose apnea, arrhythmia or predict sudden death.','시뮬레이션 분 단위 데이터이며 진단이나 급사 예측이 아닙니다.')}</p><div class="footer-space"></div></div>`;
}

// Replace the old modal with an independent navigable Deep sub-page.
const previousDeep=deepView;
deepView=function(){
 if(state.detail==='dp90-waveform')return waveDetail();
 const markup=previousDeep();
 const frag=document.createElement('div');frag.innerHTML=markup;
 // Every heart/breath waveform entry opens the same navigable detail page, not a modal.
 frag.querySelectorAll('[data-action="deep-live"][data-kind]').forEach(btn=>{
  btn.dataset.action='dp90-wave-open';
  const text=btn.querySelector('span')||btn;
  if(text.textContent&&/波形|waveform|파형/i.test(text.textContent)){
    text.textContent=L('查看波形詳情','查看波形详情','View marked waveform','파형 상세 보기');
  }
 });
 if(state.deepType!==2)return frag.innerHTML;
 // Older presentation layer inserts a second bold narrative and duplicate risk badge.
 // Retain only the measured, normal-weight three-indicator interpretation.
 frag.querySelectorAll('.dp90-energy-view .dp73-narrative').forEach(el=>el.remove());
 frag.querySelectorAll('.dp90-energy-view .dp90-indicator > .dp75-risk').forEach(el=>el.remove());
 return frag.innerHTML;
};
const oldVital=dp66VitalCard;
dp66VitalCard=function(row,kind){let card=oldVital(row,kind);return card.replace('data-action="deep-live"','data-action="dp90-wave-open"').replace(L('查看即時波形','查看即时波形','View live waveform','실시간 파형 보기'),L('查看波形與異常時間','查看波形与异常时间','Review marked trend','표시된 변화 보기'));};
const actionOld=onAction;
onAction=function(target){const action=target?.dataset?.action;
 if(action==='dp90-wave-open'){state.dp90WaveKind=target.dataset.kind==='breath'?'breath':'heart';state.dp90WaveDate=state.range===1?deepChosenDate():iso(localDate());state.tab='deep';state.modal='';state.detail='dp90-waveform';render(true);return;}
 if(action==='dp90-wave-back'){state.detail=null;render(true);return;}
 if(action==='dp90-rhythm-nav'){
  const k=target.dataset.key==='stable'?'stable':'calm';state.modal='';state.tab='deep';state.detail=null;state.deepType=k==='stable'?0:2;state.range=1;state.deepSelectedDate=iso(localDate());render(true);
  requestAnimationFrame(()=>{const el=document.querySelector(k==='stable'?'.dp66-rhythm-short':'.dp90-calm-card');const sc=document.getElementById('main-scroll');if(el&&sc)sc.scrollTo({top:Math.max(0,el.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop-24),behavior:'smooth'});});return;
 }
 return actionOld(target);
};

// Remove legacy displayed fifth-/third-component terminology without touching unrelated pet health records.
function cleanText(root){if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let t;while((t=walker.nextNode())){
  const original=t.nodeValue||'';let s=original;
  s=s.replace(/負荷調節表現|负荷调节表现|負荷調節|负荷调节|Load Regulation|Load regulation|load regulation|Load balance|load balance|부하 조절 능력|부하 조절|負荷表現|负荷表现/g,L('恢復情況','恢复情况','Recovery status','회복 상태'));
  s=s.replace(/精力活動|精力活动|精力與活動|精力与活动/g,L('精力與恢復','精力与恢复','Energy & Recovery','활력과 회복'));
  s=s.replace(/放鬆、恢復情況及心搏節奏三項|放松、恢复情况及心搏节奏三项/g,L('放鬆與平穩度及心搏節奏穩定度兩項','放松与平稳度及心搏节奏稳定度两项','the two body-rhythm metrics','두 리듬 점수'));
  s=s.replace(/放鬆 · 恢復情況 · 心搏穩定|放松 · 恢复情况 · 心搏稳定/g,L('放鬆與平穩度 · 心搏節奏穩定度','放松与平稳度 · 心搏节奏稳定度','Rest & steadiness · Heartbeat stability','휴식과 안정 · 심박 안정'));
  if(s!==original)t.nodeValue=s;
 }}
const oldRender=render;
render=function(reset){oldRender(reset);cleanText(document.querySelector('#app'));cleanText(document.querySelector('#overlay-root'));};
const oldRenderModal=renderModal;
renderModal=function(){oldRenderModal();cleanText(document.querySelector('#overlay-root'));};

// Start with a consistent render, including refreshed summary percentages.
render(true);
})();
