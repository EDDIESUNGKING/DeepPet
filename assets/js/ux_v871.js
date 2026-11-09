/* DeepPet V8.71 – preventive first, with owner-readable HRV, joined night-time
   heart/breathing observation, and Energy & Recovery. The underlying readings
   are demo fixtures; these view rules do NOT validate disease or emotion models. */
(function(){
'use strict';
const L=(z,s,e,k,j)=>state.lang==='zh'?s:state.lang==='zht'?z:state.lang==='ko'?k:state.lang==='ja'?(j||e):e;
const F=markup=>{const t=document.createElement('template');t.innerHTML=markup;return t.content};
const H=root=>{const d=document.createElement('div');d.append(root);return d.innerHTML};
const fmt=(v,n=1)=>Number(v).toFixed(n);
const avg=a=>a.length?a.reduce((p,c)=>p+Number(c),0)/a.length:null;
const pct=(v,r)=>r>0?Math.abs((v-r)/r):null;
const safe=v=>v===null||v===undefined||v===''?null:Number.isFinite(Number(v))?Number(v):null;
const scoreCls=n=>n===null?'missing':n>=90?'normal':n>=80?'low':n>=60?'medium':'high';
const severity=n=>n===null?L('資料不足','数据不足','More data needed','데이터 부족'):n>=90?L('正常','正常','Normal','정상'):n>=80?L('輕度留意','轻度留意','Mild change','가벼운 변화'):n>=60?L('中度留意','中度留意','Moderate change','중간 변화'):L('需要優先留意','需要优先留意','Priority change','우선 확인 필요');
const guidance=(v,context)=>{
 const head=context==='hrv'?L('心搏變異','心搏变异','heart-rate variability','심박변이도'):context==='rest'?L('夜間狀態','夜间状态','overnight patterns','야간 상태'):L('心肺或恢復','心肺或恢复','heart, breathing or recovery','심폐 또는 회복');
 if(v===null)return L('先累積足夠、同樣條件下的有效記錄，不做風險推斷。','先积累足够、同样条件下的有效记录，不做风险推断。','Build enough valid readings under comparable conditions before interpreting change.','비교 가능한 조건에서 충분한 유효 기록을 먼저 확보하세요.');
 if(v>=90)return L('目前接近平常模式，持續觀察即可。','目前接近平常模式，持续观察即可。','Close to the usual pattern; continue routine observation.','평소와 비슷합니다. 일상 관찰을 이어가세요.');
 if(v>=80)return L(`請先核對${head}是否受剛活動、環境溫度或項圈佩戴影響，休息後再次觀察。`,`请先核对${head}是否受刚活动、环境温度或项圈佩戴影响，休息后再次观察。`,`Check whether ${head} was affected by movement, heat or collar fit; compare again after a quiet rest.`,`활동·기온·착용 상태를 확인하고 충분히 쉰 뒤 다시 비교하세요.`);
 if(v>=60)return L('與近期基準有持續偏離，降低高強度活動、記錄當時症狀；若持續發生，建議聯絡獸醫。','与近期基准有持续偏离，减少高强度活动、记录当时症状；若持续发生，建议联系兽医。','Change differs from usual. Reduce strenuous activity, note any symptoms and consult a veterinarian if it persists.','평소와 차이가 있습니다. 격한 활동을 줄이고 증상을 기록하며 지속 시 수의사와 상담하세요.');
 return L('建議優先複核有效讀數並盡快聯絡獸醫；如出現呼吸困難、昏倒或極度虛弱，請立即求醫。','建议优先复核有效读数并尽快联系兽医；如出现呼吸困难、昏倒或极度虚弱，请立即就医。','Check the signal and contact a veterinarian promptly. Breathing difficulty, collapse or profound weakness requires urgent veterinary care.','신호를 확인하고 신속히 수의사와 상의하세요. 호흡곤란·실신·심한 무기력은 응급 진료가 필요합니다.');
};
const oldGrade=dp66Grade;
// Align the displayed concern tier with the existing shared score colors.
dp66Grade=function(v){if(v==null||!Number.isFinite(Number(v)))return -1;v=Number(v);return v>=90?0:v>=80?1:v>=60?2:3};
const oldScores=dpOwnerDayScores;
dpOwnerDayScores=function(row,withRecovery=false){
 const d=oldScores(row,true),rec=safe(d.recovery);
 d.energyRecovery=rec===null?d.energy:dpOwnerQualityValue((Number(d.energy)+rec)/2);
 d.energyActivity=d.energyRecovery; // Maintain existing consumers while changing the visible concept.
 if(!withRecovery)d.recovery=null;
 return d;
};
function history(row,k){
 const all=demoRecords(state.dog),idx=row.idx,arr=[];
 for(let i=Math.max(0,idx-14);i<idx;i++)if(validDaySample(all[i],i).valid){const x=safe(all[i][k]);if(x!==null&&x>0)arr.push(x)}
 return arr;
}
function hrvComponent(row,k){
 const v=safe(row[k]),vals=history(row,k),ref=avg(vals),enough=vals.length>=3;
 if(v===null||v<=0||!enough)return {v,ref:enough?ref:null,level:null,change:null,score:null};
 const d=pct(v,ref),level=d<=.15?0:d<=.25?1:d<=.40?2:3;
 return {v,ref,level,change:(v-ref)/ref,score:[95,85,70,45][level]};
}
function hrvCard(row){
 const metrics=[['rmssd','RMSSD',L('反映相鄰心跳間的短期變化，常用來觀察休息時的調節情況。','反映相邻心跳间的短期变化，常用来观察休息时的调节情况。','Short-term beat-to-beat variability; useful for observing regulation during quiet rest.','연속 심박 간 단기 변동으로 휴식 시 조절 상태를 참고합니다.')],['sdnn','SDNN',L('反映整段記錄的整體心搏變化，會受到測量長度及活動影響。','反映整段记录的整体心搏变化，会受到测量长度及活动影响。','Overall variability within the recording; affected by measurement duration and activity.','측정 구간 전체의 변동으로 측정 길이와 활동의 영향을 받습니다.')]].map(([k,title,desc])=>({k,title,desc,...hrvComponent(row,k)}));
 const valid=metrics.filter(x=>x.score!==null),composite=valid.length?Math.round(avg(valid.map(x=>x.score))):null;
 return `<section class="card dp71-card dp71-hrv"><div class="dp71-mainhead"><div><h3>HRV · ${L('心搏變異觀察','心搏变异观察','Heart-rate variability','심박변이도')}</h3><p>${L('優先看是否偏離牠自己的平常狀態','优先看是否偏离它自己的平常状态','Compare with this pet’s own usual readings','반려동물의 평소 수치와 비교')}</p></div><span class="dp71-risk ${scoreCls(composite)}">${severity(composite)}</span></div><div class="dp71-hrv-items">${metrics.map(x=>`<div class="dp71-hrv-metric"><div class="dp71-hrv-top"><b>${x.title}</b><strong>${x.v===null?'—':fmt(x.v,1)} <small>ms</small></strong></div><span class="dp71-mini-status ${scoreCls(x.score)}">${severity(x.score)}</span><p>${x.desc}</p><small>${x.ref===null?L('有效歷史值不足，暫不作區間判定','有效历史值不足，暂不作区间判定','Not enough comparable history for a personal range','비교 가능한 이전 데이터가 부족합니다'):L(`與過去有效日平均 ${fmt(x.ref,1)} ms 相比${x.change>=0?'高':'低'} ${fmt(Math.abs(x.change*100),0)}%`,`与过去有效日平均 ${fmt(x.ref,1)} ms 相比${x.change>=0?'高':'低'} ${fmt(Math.abs(x.change*100),0)}%`,`${fmt(Math.abs(x.change*100),0)}% ${x.change>=0?'above':'below'} the previous mean of ${fmt(x.ref,1)} ms`,`이전 평균 ${fmt(x.ref,1)}ms 대비 ${fmt(Math.abs(x.change*100),0)}% ${x.change>=0?'높음':'낮음'}`)}</small></div>`).join('')}</div><div class="dp71-advice ${scoreCls(composite)}"><b>${L('預防提醒','预防提醒','What to watch','관찰 안내')}</b><p>${guidance(composite,'hrv')}</p></div><small class="dp71-caveat">${L('兩項數值不是固定疾病門檻；記錄長度、訊號品質與休息狀態必須可比較。目前是模擬資料。','两项数值不是固定疾病门槛；记录长度、信号质量与休息状态必须可比较。目前是模拟数据。','Neither number has a universal disease cutoff. Compare similar recording lengths and signal quality. Demo readings only.','질환의 보편적 기준값이 아닙니다. 측정 길이·신호 품질·휴식 조건을 맞춰 비교하세요. 데모 데이터입니다.')}</small></section>`;
}
function hrvPeriodCard(rows,days){
 const mid=Math.floor(rows.length/2),early=rows.slice(0,mid),late=rows.slice(mid),items=[
  {k:'rmssd',title:'RMSSD',desc:L('短期心搏間隔變化','短期心搏间隔变化','Short-term beat-to-beat changes','단기 심박 간격 변동')},
  {k:'sdnn',title:'SDNN',desc:L('整段記錄的整體心搏變化','整段记录的整体心搏变化','Overall variability across recordings','전체 기록의 심박 변동')}
 ].map(item=>{const vals=rows.map(x=>safe(x[item.k])).filter(x=>x!==null&&x>0),earlyVals=early.map(x=>safe(x[item.k])).filter(x=>x!==null&&x>0),lateVals=late.map(x=>safe(x[item.k])).filter(x=>x!==null&&x>0);const overall=avg(vals),a=avg(earlyVals),b=avg(lateVals),change=a!==null&&b!==null?(b-a)/a:null;return {...item,overall,change}});
 // Use the same 15%/25%/40% within-baseline HRV-change bands as the daily view.
 // Only four grade labels are shown. Missing comparable days use a neutral dash.
 const changes=items.map(x=>x.change).filter(x=>Number.isFinite(x));
 const maxDeviation=changes.length?Math.max(...changes.map(x=>Math.abs(x))):null;
 const periodScore=maxDeviation===null?null:maxDeviation<=.15?95:maxDeviation<=.25?85:maxDeviation<=.40?70:45;
 const periodLabel=periodScore===null?'—':periodScore>=90?L('正常','正常','Normal','정상','正常'):periodScore>=80?L('輕風險','轻风险','Low concern','경미한 위험','軽度リスク'):periodScore>=60?L('中風險','中风险','Moderate concern','중간 위험','中度リスク'):L('高風險','高风险','High concern','높은 위험','高リスク');
 return `<section class="card dp71-card dp71-hrv"><div class="dp71-mainhead"><div><h3>HRV · ${L('期間心搏變異觀察','期间心搏变异观察','HRV during this period','기간 심박변이도')}</h3><p>${L(`過去 ${days} 天的有效日平均，並比較期間前後半段`, `过去 ${days} 天的有效日平均，并比较期间前后半段`,`${days}-day valid-reading averages; first half vs second half`,`최근 ${days}일 평균과 기간 전후반 비교`)}</p></div><span class="dp71-risk ${scoreCls(periodScore)}">${periodLabel}</span></div><div class="dp71-hrv-items">${items.map(x=>`<div class="dp71-hrv-metric"><div class="dp71-hrv-top"><b>${x.title}</b><strong>${x.overall===null?'—':fmt(x.overall,1)} <small>ms</small></strong></div><p>${x.desc}</p><small>${x.change===null?L('比較資料不足','比较资料不足','Insufficient comparison','비교 자료 부족'):L(`前後半段相差 ${fmt(Math.abs(x.change*100),0)}%`, `前后半段相差 ${fmt(Math.abs(x.change*100),0)}%`,`${fmt(Math.abs(x.change*100),0)}% change between halves`,`전후반 차이 ${fmt(Math.abs(x.change*100),0)}%`)}</small></div>`).join('')}</div><p class="dp71-caveat">${L('這是期間比較，不是固定疾病門檻；需用相同量測條件與訊號品質來解讀。', '这是期间比较，不是固定疾病门槛；需用相同测量条件与信号质量来解读。','This is a within-period comparison, not a disease threshold; use consistent recording conditions.','기간 내 비교이며 질환 기준값이 아닙니다. 동일 조건의 기록이 필요합니다.')}</p></section>`;
}
const nightCache=new Map();
function nightAverages(row){
 const key=state.dog+'|'+row.date;
 if(nightCache.has(key))return nightCache.get(key);
 const streams=dpSignals(row.date,['heart','breath']);
 let x={heart:null,breath:null};
 for(const k of ['heart','breath']){
  const a=streams?.[k];if(Array.isArray(a)&&a.length===1440){const night=a.slice(0,480).concat(a.slice(1200));const good=night.map(Number).filter(Number.isFinite);if(good.length>=600)x[k]=avg(good)}
 }
 nightCache.set(key,x);return x;
}
function nightCompare(row){
 const now=nightAverages(row),rows=demoRecords(state.dog),previous=[];
 for(let i=Math.max(0,row.idx-7);i<row.idx;i++)if(validDaySample(rows[i],i).valid)previous.push(nightAverages(rows[i]));
 const out={};for(const k of ['heart','breath']){const base=avg(previous.map(x=>x[k]).filter(x=>x!==null));out[k]={now:now[k],base,rel:base!==null&&now[k]!==null?(now[k]-base)/base:null}}
 return out;
}
function restLink(row,sleepScore){
 const cmp=nightCompare(row),heart=cmp.heart,breath=cmp.breath;
 const alert=(Math.abs(heart.rel??0)>=.15)||(Math.abs(breath.rel??0)>=.20),lowSleep=sleepScore<80;
 const info=[['heart',heart,'bpm'],['breath',breath,L('次／分','次/分','breaths/min','회/분')]].map(([k,v,unit])=>v.rel===null?null:L(`${k==='heart'?'夜間心跳':'夜間呼吸'}平均 ${fmt(v.now,1)} ${unit}，比近期夜間平均${v.rel>=0?'高':'低'} ${fmt(Math.abs(v.rel*100),0)}%`,`${k==='heart'?'夜间心跳':'夜间呼吸'}平均 ${fmt(v.now,1)} ${unit}，比近期夜间平均${v.rel>=0?'高':'低'} ${fmt(Math.abs(v.rel*100),0)}%`,`${k==='heart'?'Nighttime heart rate':'Nighttime breathing'} ${fmt(v.now,1)} ${unit}, ${fmt(Math.abs(v.rel*100),0)}% ${v.rel>=0?'above':'below'} its recent night mean`,`${k==='heart'?'야간 심박':'야간 호흡'} ${fmt(v.now,1)} ${unit}, 최근 야간 평균보다 ${fmt(Math.abs(v.rel*100),0)}% ${v.rel>=0?'높음':'낮음'}`)).filter(Boolean);
 const headline=lowSleep&&alert?L('休息變化與夜間心肺變化同時出現','休息变化与夜间心肺变化同时出现','Rest and nighttime vital changes occurred together','휴식 변화와 야간 심폐 변화가 함께 나타남'):lowSleep?L('夜間休息需要留意，心肺原因尚不能確認','夜间休息需要留意，心肺原因尚不能确认','Rest needs attention; no cardiac or breathing cause established','휴식 관찰 필요; 심폐 원인 확인 불가'):L('夜間休息與心肺趨勢觀察','夜间休息与心肺趋势观察','Rest and nighttime heart/breathing','야간 휴식과 심폐 추세');
 return `<section class="card dp71-card dp71-night-link"><div class="dp71-mainhead"><div><h3>${L('夜間心肺 × 睡眠觀察','夜间心肺 × 睡眠观察','Overnight heart–breathing × rest','야간 심폐 × 휴식 관찰')}</h3><p>${headline}</p></div><span class="dp71-risk ${lowSleep&&alert?'medium':'normal'}">${lowSleep&&alert?L('共同留意','共同留意','Review together','함께 확인'):L('觀察','观察','Observe','관찰')}</span></div>${info.length?`<div class="dp71-night-facts">${info.map(x=>`<p>${x}</p>`).join('')}</div>`:`<p>${L('可比較的夜間數據不足，先持續累積有效監測。','可比较的夜间数据不足，先持续积累有效监测。','Not enough comparable nighttime readings yet.','비교 가능한 야간 기록이 부족합니다.')}</p>`}<p class="dp71-night-next">${lowSleep&&alert?L('請回看夜間休息中斷、環境溫度、喘氣與活動，若同時有呼吸費力或精神異常，聯絡獸醫。','请回看夜间休息中断、环境温度、喘气与活动，若同时有呼吸费力或精神异常，联系兽医。','Review awakenings, heat, panting and movement. Seek veterinary advice if breathing appears labored or behavior changes.','야간 중단·더위·헐떡임·움직임을 확인하고 호흡이 힘들어 보이면 수의사와 상의하세요.'):L('這是同時段變化提示，不能證明心跳或呼吸造成休息中斷。','这是同时段变化提示，不能证明心跳或呼吸造成休息中断。','Co-occurrence is not proof that heart or breathing changes caused interrupted rest.','동시 변화만으로 심박·호흡이 휴식 중단의 원인이라고 단정할 수 없습니다.')}</p></section>`;
}
function periodNightLink(rows,days){const flagged=rows.filter(r=>dpOwnerDayScores(r).sleep<80&&(dp66VitalGrade(r,'heart')>=1||dp66VitalGrade(r,'breath')>=1));const dates=flagged.slice(-3).map(r=>r.date).join(' · ');return `<section class="card dp71-card dp71-night-link"><h3>${L('睡眠與心肺的共同變化','睡眠与心肺的共同变化','Rest with heart/breathing changes','휴식과 심폐 변화')}</h3><p>${L(`${days} 天內有 ${flagged.length} 天同時出現休息評分較低及心肺變化提示。`,`近 ${days} 天有 ${flagged.length} 天同时出现休息评分较低及心肺变化提示。`,`During ${days} days, ${flagged.length} days had both a lower rest score and a heart/breathing review cue.`,`최근 ${days}일 중 휴식 저하와 심폐 변화가 함께 나타난 날은 ${flagged.length}일입니다.`)} ${dates}</p><small>${L('這是同期間交叉比對，不代表兩者互為因果。','这是同期间交叉比对，不代表两者互为因果。','A cross-check for the period, not evidence of causation.','같은 기간의 비교이며 인과관계를 뜻하지 않습니다.')}</small></section>`;}
function energyMood(score,calm){
 if(score>=85&&calm<75)return L('精力較旺盛，但放鬆指標較平常波動；可能較興奮或緊繃，無法單憑數值判斷開心或緊張。','精力较旺盛，但放松指标较平常波动；可能较兴奋或紧绷，无法单凭数值判断开心或紧张。','Energy is elevated while rest regulation differs from usual; this may reflect excitement or tension, not a confirmed mood.','활력은 높지만 안정 지표가 평소와 달라 흥분 또는 긴장 가능성이 있습니다. 감정 진단은 아닙니다.');
 if(score>=85)return L('精力充足，身體較活躍；可能是活力上升，並不代表一定開心。','精力充足，身体较活跃；可能是活力上升，并不代表一定开心。','Good energy and activity; increased arousal does not automatically mean happiness.','활력과 활동이 높은 편이지만 반드시 행복한 감정을 뜻하지는 않습니다.');
 if(score>=60)return L('精力略低於平常；結合食慾、互動意願及休息情況觀察。','精力略低于平常；结合食欲、互动意愿及休息情况观察。','Energy is somewhat below usual; compare appetite, interaction and rest.','활력이 평소보다 낮아 식욕·상호작용·휴식 상태를 함께 확인하세요.');
 return L('精力明顯下降；請記錄精神、食慾及活動意願，若持續或有其他症狀，建議獸醫評估。不能直接判定沮喪。','精力明显下降；请记录精神、食欲及活动意愿，若持续或有其他症状，建议兽医评估。不能直接判定沮丧。','Energy is substantially lower; track appetite, willingness to engage and other symptoms, and seek veterinary advice if it persists. This does not establish sadness.','활력이 크게 낮아 식욕·상호작용 의지를 기록하고 지속 시 수의사와 상의하세요. 우울감 진단은 아닙니다.');
}
function energyNote(row,period=false){const r=rhythmData().values?.[row.idx],calm=r?dpOwnerQualityValue(rhythmPositiveValue('calm',r)):85,score=dpOwnerDayScores(row,true).energy;return `<section class="dp71-energy-explain"><b>${L('活力與情緒傾向觀察','活力与情绪倾向观察','Energy & possible arousal','활력과 각성 경향')}</b><p>${energyMood(score,calm)}</p></section>`;}
function relaxationAdvice(score){return `<div class="dp71-advice ${scoreCls(score)}"><b>${severity(score)} · ${L('放鬆與平穩度','放松与平稳度','Rest & steadiness','휴식과 안정')}</b><p>${guidance(score,'hrv')}</p><small>${L('根據安靜時心搏變化（包括 RMSSD、SDNN）與個體基準作比較；不是情緒或疾病診斷。','根据安静时心搏变化（包括 RMSSD、SDNN）与个体基准作比较；不是情绪或疾病诊断。','Compared with this pet’s quiet-time HRV pattern (including RMSSD/SDNN); not an emotion or disease diagnosis.','휴식 시 심박변이도(RMSSD/SDNN)를 개인 기준과 비교하며 감정이나 질환 진단이 아닙니다.')}</small></div>`;}
const oldDay=dpOwnerDayDetail;
dpOwnerDayDetail=function(kind,cp,row){
 const src=oldDay(kind,cp,row);if(!validDaySample(row,row.idx).valid)return src;
 const root=F(src);
 if(kind===0){
  const inner=root.querySelector('.dp-owner-heart .dp-owner-status-inner');const vitals=inner?.querySelector('.dp66-vital-grid');
  if(vitals){
   vitals.querySelectorAll('.dp66-vital').forEach(card=>{
    const kind=card.querySelector('[data-action=\"deep-live\"]')?.dataset.kind||'heart';
    const sc=dpOwnerVitalScore(row,kind),grade=dp66Grade(sc);
    if(grade>0){const info=document.createElement('div');info.className='dp71-advice '+scoreCls(sc);
     info.innerHTML=`<b>${L('預防建議','预防建议','Preventive next step','예방을 위한 조치')}</b><p>${guidance(sc,'cardio')}</p>`;
     card.append(info);
    }
   });
   vitals.after(F(hrvCard(row)));
  }
 }
 if(kind===1){const area=root.querySelector('.dp-owner-sleep .dp-owner-status-inner');if(area)area.append(F(restLink(row,dpOwnerDayScores(row).sleep)));}
 if(kind===2){
  root.querySelector('.dp-activity-score-panel')?.remove();
  const energy=root.querySelector('.dp-energy-score-panel');if(energy){const title=energy.querySelector('.dp-vital-heading div');title?.querySelector('strong')?.remove();const note=F(energyNote(row));const sub=energy.querySelector('.dp-owner-subsummary');if(sub)sub.after(note);else energy.append(note);}
  const rec=root.querySelector('.dp-recovery-score-panel');if(rec){const title=rec.querySelector('.dp-vital-heading div');const left=title?.querySelector('strong');if(left){const data=left.textContent.trim();const small=document.createElement('p');small.className='dp71-recovery-delta';small.textContent=data;left.replaceWith(small);}rec.querySelector('.dp-vital-heading b').textContent=L('恢復情況','恢复情况','Recovery status','회복 상태');const sm=rec.querySelector('summary');if(sm)sm.textContent=L('查看兩分鐘恢復曲線','查看两分钟恢复曲线','View 2-minute recovery curve','2분 회복 그래프 보기');}
  const cards=root.querySelectorAll('.dp66-rhythm-item');if(cards.length>1)cards[1].remove();
  const rhythm=root.querySelector('.dp66-rhythm-load');if(rhythm){const title=rhythm.querySelector('h3');if(title)title.textContent=L('放鬆與平穩度','放松与平稳度','Rest & steadiness','휴식과 안정');const data=rhythmData().values[row.idx];if(data)rhythm.append(F(relaxationAdvice(dpOwnerQualityValue(rhythmPositiveValue('calm',data)))));}
  root.querySelectorAll('.dp-owner-activity .dp66-inline-risk').forEach(el=>{if(el.textContent.includes('活動')||el.textContent.includes('Activity status'))el.remove();});
 }
 return H(root);
};
const oldPeriod=dpOwnerPeriodDetail;
dpOwnerPeriodDetail=function(kind,cp,days){
 const src=oldPeriod(kind,cp,days),root=F(src),rows=dayRowsWithIndex(days).filter(r=>validDaySample(r,r.idx).valid);if(!rows.length)return src;
 if(kind===0){const c=root.querySelector('.dp68-period-heart')||root.querySelector('.dp-owner-period-card');if(c)c.append(F(hrvPeriodCard(rows,days)));}
 if(kind===1){const main=root.querySelector('.dp-owner-period-card');if(main)main.after(F(periodNightLink(rows,days)));}
 if(kind===2){
  const panels=root.querySelectorAll('.dp-energy-period-panel');if(panels.length>=2)panels[1].remove();
  const visible=root.querySelectorAll('.dp-energy-period-panel');
  if(visible[0]){visible[0].querySelector('.dp-vital-heading div strong')?.remove();visible[0].append(F(`<p class="dp71-period-energy">${energyMood(Math.round(avg(rows.map(x=>dpOwnerDayScores(x,true).energy))),85)}</p>`));}
  if(visible[1]){const t=visible[1].querySelector('.dp-vital-heading b');if(t)t.textContent=L('恢復情況','恢复情况','Recovery status','회복 상태');visible[1].querySelector('.dp-vital-heading div strong')?.remove();}
  const loadCards=root.querySelectorAll('.dp68-rhythm-chart');if(loadCards.length>1)loadCards[1].remove();
  root.querySelector('.dp66-extra')?.remove();
  const restCard=root.querySelector('.dp68-rhythm-chart');if(restCard){const title=restCard.querySelector('.dp68-rhythm-head b');if(title)title.textContent=L('放鬆與平穩度','放松与平稳度','Rest & steadiness','휴식과 안정');const meanScore=avg(rows.map(r=>{const v=rhythmData().values[r.idx];return v?dpOwnerQualityValue(rhythmPositiveValue('calm',v)):null}).filter(x=>x!==null));restCard.append(F(relaxationAdvice(meanScore===null?null:Math.round(meanScore))));}
  const h=root.querySelector('.dp-period-activity .dp-heart-period-overall h2');if(h)h.textContent=L('精力與恢復狀態','精力与恢复状态','Energy & Recovery','활력과 회복 상태');
  const note=root.querySelector('.dp-period-activity>.dp-owner-subsummary');if(note)note.textContent=L('恢復情況以活動後兩分鐘的心率下降幅度，與牠過往相近活動量的紀錄比較。','恢复情况以活动后两分钟的心率下降幅度，与它过往相近活动量的记录比较。','Recovery compares the two-minute heart-rate drop with this pet’s similar previous activity.','회복은 활동 후 2분 심박 감소를 유사한 이전 활동과 비교합니다.');
 }
 return H(root);
};
// Consistent visual meaning across the three pages: score and risk use same score color.
const oldDeep=deepView;
deepView=function(){
 const root=F(oldDeep());
 if(state.deepType===2){root.querySelectorAll('.tabs .tab').forEach((tab,i)=>{if(i===2){const textNodes=[...tab.childNodes].filter(x=>x.nodeType===Node.TEXT_NODE);for(const text of textNodes)text.textContent=L('精力與恢復','精力与恢复','Energy & Recovery','활력과 회복');}});}
 root.querySelectorAll('.dp-owner-status-heading,.dp-sleep-period-score-head,.dp68-period-overall,.dp-heart-period-overall').forEach(head=>{const number=head.querySelector('.dp-status-score[data-score],.dp-dotted-meter[data-score]');const grade=head.querySelector('.dp69-grade');if(!number||!grade)return;const v=safe(number.dataset.score),cls=scoreCls(v);head.classList.add('dp71-paired-score');grade.classList.remove('dp69-severity-0','dp69-severity-1','dp69-severity-2','dp69-severity-3');grade.classList.add('dp71-risk',cls);grade.textContent=severity(v)});
 return H(root);
};
})();
