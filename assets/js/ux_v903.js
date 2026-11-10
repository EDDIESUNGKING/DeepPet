/* DeepPet 9.03 — score-source unification, uniform Deep metric layout and standalone social navigation.
   Scores are illustrative within-pet trend scores, NOT validated clinical danger thresholds. */
(function(){
'use strict';
const L=(a,b,c,d,e)=>state.lang==='zh'?b:state.lang==='en'?c:state.lang==='ko'?d:state.lang==='ja'?(e||c):a;
const finite=v=>v===null||v===undefined||v===''||!Number.isFinite(Number(v))?null:Number(v);
const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
const avgScore=a=>a.length?Math.round(avg(a)):null;
const safe=(v,n=0)=>finite(v)===null?'—':Number(v).toFixed(n);
const grade=s=>s===null?L('資料不足','数据不足','Insufficient data','자료 부족','データ不足'):s>=90?L('正常','正常','Normal','정상','正常'):s>=80?L('輕風險','轻风险','Low concern','가벼운 주의','軽度注意'):s>=60?L('中風險','中风险','Moderate concern','중간 주의','中程度注意'):L('高風險','高风险','High concern','높은 주의','高度注意');
const verdict=s=>s===null?L('資料不足','数据不足','Insufficient data','자료 부족','データ不足'):s>=90?L('表現很好','表现很好','Doing great','매우 좋아요','良好'):s>=80?L('狀態穩定','状态稳定','Looking steady','안정적이에요','安定'):s>=60?L('稍微留意','稍微留意','Keep an eye on it','주의 필요','注意'):L('需要多留意','需要多留意','Needs attention','주의가 필요해요','要注意');
const tier=s=>s===null?'none':s>=90?'normal':s>=80?'light':s>=60?'medium':'high';
const color=s=>s===null?'#a9b0bd':scoreScheme(s).color;
const complete=a=>a.every(x=>finite(x)!==null);
const clipped=x=>Math.round(Math.max(0,Math.min(100,Number(x))));
// HRV has no clinical universal normal threshold. For this simulation, compare RMSSD
// and SDNN against preceding valid dates; avoid learning future dates as a baseline.
function hrvScore(row){
 const rows=demoRecords(state.dog),i=Number.isInteger(row.idx)?row.idx:rows.findIndex(x=>x.date===row.date);
 if(i<0||!validDaySample(row,i).valid)return null;
 const prev=rows.slice(Math.max(0,i-14),i).filter((r,j)=>validDaySample(r,Math.max(0,i-14)+j).valid);
 if(prev.length<3)return null;
 const scores=['rmssd','sdnn'].map(k=>{
  const value=finite(row[k]),v=prev.map(r=>finite(r[k])).filter(x=>x!==null&&x>0),ref=avg(v);
  if(value===null||value<=0||v.length<3||ref===null||ref<=0)return null;
  const dev=Math.abs(value-ref)/ref;
  return dev<=.15?95:dev<=.25?85:dev<=.40?70:45;
 });
 return complete(scores)?avgScore(scores):null;
}
function four(row){
 const idx=Number.isInteger(row.idx)?row.idx:demoRecords(state.dog).findIndex(x=>x.date===row.date);
 if(idx<0||!validDaySample(row,idx).valid)return {heart:null,breath:null,hrv:null,stable:null,all:null};
 const r={...row,idx},m=rhythmData().values[idx],values=[dpOwnerVitalScore(r,'heart'),dpOwnerVitalScore(r,'breath'),hrvScore(r),m?clipped(rhythmPositiveValue('stable',m)):null];
 return {heart:values[0],breath:values[1],hrv:values[2],stable:values[3],all:complete(values)?avgScore(values):null};
}
function three(row){
 const idx=Number.isInteger(row.idx)?row.idx:demoRecords(state.dog).findIndex(x=>x.date===row.date);
 if(idx<0||!validDaySample(row,idx).valid)return {energy:null,recovery:null,calm:null,all:null};
 const r={...row,idx},v=previousDayScores(r,true),m=rhythmData().values[idx],rec=dpOwnerRecoveryComparison(r),parts=[finite(v.energy),finite(rec?.score),m?clipped(rhythmPositiveValue('calm',m)):null];
 return {energy:parts[0],recovery:parts[1],calm:parts[2],all:complete(parts)?avgScore(parts):null};
}
const previousDayScores=dpOwnerDayScores;
dpOwnerDayScores=function(row,withRecovery=false){
 const v=previousDayScores(row,true),h=four(row),e=threeRaw(row,v);
 v.heart=h.all;v.energy=e.energy;v.recovery=e.recovery;v.calm=e.calm;v.energyActivity=e.all;v.energyRecovery=e.all;
 return v;
};
// Avoid recursively calling dpOwnerDayScores from three().
function threeRaw(row,v){
 const idx=Number.isInteger(row.idx)?row.idx:demoRecords(state.dog).findIndex(x=>x.date===row.date);
 if(idx<0||!validDaySample(row,idx).valid)return {energy:null,recovery:null,calm:null,all:null};
 const m=rhythmData().values[idx],rec=dpOwnerRecoveryComparison({...row,idx}),parts=[finite(v.energy),finite(rec?.score),m?clipped(rhythmPositiveValue('calm',m)):null];
 return {energy:parts[0],recovery:parts[1],calm:parts[2],all:complete(parts)?avgScore(parts):null};
}
// Compat consumers of the original heart/composite functions see exactly the same four items.
dpHeartComposite=function(row){return four(row).all;};
dpOwnerPeriodHeartScore=function(rows){const valid=rows.map(four).filter(x=>x.all!==null);if(!valid.length)return null;return avgScore(['heart','breath','hrv','stable'].map(k=>avgScore(valid.map(x=>x[k]))));};
// Keep Today composite strictly aligned with the Deep sub-metrics.
const previousUnified=dpTodayUnifiedScores;
dpTodayUnifiedScores=function(){const v=previousUnified(),rows=demoRecords(state.dog),idx=rows.length-1,cur={...rows[idx],idx},h=four(cur),b=dpOwnerDayScores(cur,true);v.heart=h.all;v.energy=b.energy;v.recovery=b.recovery;v.energyActivity=b.energyActivity;return v;};

function scoreBlock(score,main=false){return `<div class="dp903-score-col ${main?'main':'sub'} ${tier(score)}">${score===null?'<div class="dp903-no-score">—</div>':dpDeepDottedScore(score,color(score))}<span class="dp903-grade">${grade(score)}</span></div>`;}
function metricName(key){return ({heart:L('心跳狀況','心跳状况','Heart rate','심박 상태','心拍状況'),breath:L('呼吸狀況','呼吸状况','Breathing','호흡 상태','呼吸状況'),hrv:'HRV',stable:L('心搏節奏穩定度','心搏节奏稳定度','Heartbeat rhythm stability','심박 리듬 안정도','心拍リズム安定度')})[key]||key};
function details(body,title){return body?`<details class="dp903-expand"><summary>${title||L('查看趨勢','查看趋势','View trend','추세 보기','推移を見る')}</summary><div class="dp903-expand-body">${body}</div></details>`:'';}
function metricCard(key,n,desc,extras='',chart=''){
 return `<section class="dp903-metric-card" data-dp903-metric="${key}"><div class="dp903-metric-left"><h3>${metricName(key)}</h3><p>${desc}</p></div>${scoreBlock(n)}${extras}${chart}</section>`;
}
function mainCard(title,number,desc,metrics,kind){
 return `<section class="card dp903-overview dp903-${kind}" data-dp903-composite="${number===null?'':number}"><div class="dp903-overview-head"><div class="dp903-overview-copy"><h2>${title}</h2><h3>${verdict(number)}</h3><p>${desc}</p></div>${scoreBlock(number,true)}</div><div class="dp903-metric-list">${metrics.join('')}</div><p class="dp903-score-method">${kind==='heart'?L('心肺綜合分由心跳、呼吸、HRV 與心搏節奏穩定度四項平均；缺少有效 HRV 記錄時不硬算綜合分。','心肺综合分由心跳、呼吸、HRV 与心搏节奏稳定度四项平均；缺少有效 HRV 记录时不强行计算综合分。','Overall cardio score is the mean of heart rate, breathing, HRV and rhythm stability. Missing HRV means no composite.','심박·호흡·HRV·리듬 안정도 네 점수의 평균입니다.','心拍・呼吸・HRV・リズム安定度の平均です。'):L('精力與恢復綜合分由精力、恢復、放鬆與平穩度三項平均。','精力与恢复综合分由精力、恢复、放松与平稳度三项平均。','Energy & recovery score is the average of all three displayed components.','활력·회복·안정도 세 점수의 평균입니다.','活力・回復・リラックスの3つの平均です。')}</p></section>`;
}
function dayHeart(cp,row){
 const h=four(row),i=row.idx,r=rhythmData().values[i];
 const timed=kind=>`<button class="dp903-open-wave" type="button" data-action="dp90-wave-open" data-kind="${kind}">${L('查看波形詳情','查看波形详情','View marked trend','파형 상세 보기','波形詳細を見る')} ›</button>`;
 const hrdesc=L(`當日平均心率 ${safe(row.heart,0)} bpm；依照個體過往有效心率記錄比較。`,`当日平均心率 ${safe(row.heart,0)} bpm；与这只宠物过去有效记录比较。`,`Daily average ${safe(row.heart,0)} bpm, compared with this pet's valid history.`,`일평균 심박수 ${safe(row.heart,0)} bpm.`,`本日の平均心拍 ${safe(row.heart,0)} bpm。`);
 const rrdesc=L(`當日平均呼吸 ${safe(row.breath,1)} 次／分；請結合休息及活動狀態觀察。`,`当日平均呼吸 ${safe(row.breath,1)} 次／分；结合休息及活动情况比较。`,`Daily average breathing ${safe(row.breath,1)}/min; compare similar rest and activity states.`,`일평균 호흡 ${safe(row.breath,1)}회/분.`,`本日の平均呼吸 ${safe(row.breath,1)}回/分。`);
 const hrvDesc=L(`RMSSD ${safe(row.rmssd,1)} ms、SDNN ${safe(row.sdnn,1)} ms；分數參考同一隻寵物之前有效紀錄的相對變化，不是絕對疾病門檻。`,`RMSSD ${safe(row.rmssd,1)} ms、SDNN ${safe(row.sdnn,1)} ms；评分依据同宠物历史有效记录的相对变化，不是疾病门槛。`,`RMSSD ${safe(row.rmssd,1)} ms, SDNN ${safe(row.sdnn,1)} ms. Scored by deviation from this pet's valid prior readings, not clinical cutoffs.`,`RMSSD ${safe(row.rmssd,1)}ms, SDNN ${safe(row.sdnn,1)}ms.`,`RMSSD ${safe(row.rmssd,1)}ms、SDNN ${safe(row.sdnn,1)}ms。`);
 const rhythmDesc=L('比較安靜時的心搏間隔與這隻寵物的平常模式；不是心電圖診斷。','比较安静时的心搏间隔与这只宠物的平常模式；不是心电图诊断。','Compares quiet-time beat intervals with this pet’s usual pattern, not an ECG diagnosis.','휴식 중 심박 간격을 개인 기준과 비교합니다.','安静時の心拍間隔を個体基準と比較します。');
 const metrics=[metricCard('heart',h.heart,hrdesc,timed('heart'),details(dpOwnerVitalDaily('heart',row),L('查看心跳趨勢','查看心跳趋势','Heart-rate trend','심박 추세','心拍推移'))),metricCard('breath',h.breath,rrdesc,timed('breath'),details(dpOwnerVitalDaily('breath',row),L('查看呼吸趨勢','查看呼吸趋势','Breathing trend','호흡 추세','呼吸推移'))),metricCard('hrv',h.hrv,hrvDesc),metricCard('stable',h.stable,rhythmDesc,`<details class="dp903-beat-help"><summary>${L('什麼是心搏節奏穩定度？','什么是心搏节奏稳定度？','What is heartbeat rhythm stability?','심박 리듬 안정도란?','心拍リズム安定度とは？')}</summary><p>${L('以有效心搏間隔的變化與個體基準比較，分數越高表示越接近平常模式。並非變化越小就越健康，不能判定心律不整。','以有效心搏间隔与个体基准比较，分数越高表示越接近平常模式。不是变化越小就越健康，不能判定心律失常。','Compares valid beat intervals with the individual baseline. High scores mean close to usual; it cannot diagnose arrhythmia.','개인 심박 간격 기준과 비교하며 부정맥 진단이 아닙니다.','個体基準と比べた傾向で、不整脈の診断ではありません。')}</p></details>` )];
 return mainCard(L('心肺綜合狀態','心肺综合状态','Overall heart & breathing','심폐 종합 상태','心肺総合状態'),h.all,L('當日四項指標的分數使用同一個有效資料基準；點開各模塊可查看趨勢與波形。','当日四项分数来自同一只宠物的有效记录；可展开查看趋势与波形。','The four indicator scores refer to this pet’s valid history; open each section to review trends.','네 점수는 개인 유효 기록을 기준으로 합니다.','4項目を同じ基準で評価します。'),metrics,'heart');
}
function periodHeart(cp,days){
 const entries=dayRowsWithIndex(days).filter(r=>validDaySample(r,r.idx).valid).map(r=>({r,v:four(r)}));
 const valid=entries.filter(x=>x.v.all!==null);const keys=['heart','breath','hrv','stable'];
 const vals=Object.fromEntries(keys.map(k=>[k,valid.length?avgScore(valid.map(x=>x.v[k])):null]));
 const overall=complete(keys.map(k=>vals[k]))?avgScore(keys.map(k=>vals[k])):null;
 const intro=L(`最近 ${days} 天共有 ${valid.length} 天完成四項有效評分，綜合分數是以下四項期間平均分的算術平均。`,`最近 ${days} 天有 ${valid.length} 天具备四项有效评分，综合分是下方四项期间平均分的算术平均。`,`Across ${days} days, ${valid.length} days have all four valid scores. The overall score is the arithmetic mean of the four displayed averages.`,`최근 ${days}일 중 ${valid.length}일에 네 점수가 있습니다.`,`最近 ${days} 日間の有効記録 ${valid.length} 日の平均です。`);
 const trend=k=>details(valid.length>1?dpOwnerPeriodMetricChart(valid.map(x=>x.r),k,'#ba5376',valid.map(x=>x.v[k]),'/100'):L('有效資料不足','有效数据不足','Not enough data','데이터 부족','有効データ不足'),L('查看每日分數趨勢','查看每日分数趋势','Daily score trend','일별 점수 추세','日別点数'));
 const rm=valid.length?avg(valid.map(x=>finite(x.r.rmssd)).filter(x=>x!==null)):null,sd=valid.length?avg(valid.map(x=>finite(x.r.sdnn)).filter(x=>x!==null)):null;
 const descriptions={
 heart:L('心跳狀況取有效日心跳分數的平均，避免混用單次值。','心跳状况取有效日心跳评分的平均，不混用单次数值。','Mean of valid daily heart-rate scores.','유효 심박 점수 평균.','有効日の心拍平均。'),
 breath:L('呼吸狀況取有效日呼吸分數的平均。','呼吸状况取有效日呼吸评分的平均。','Mean of valid daily breathing scores.','유효 호흡 점수 평균.','有効日の呼吸平均。'),
 hrv:L(`HRV 平均分取同一批有效日的 HRV 分數平均；RMSSD ${safe(rm,1)} ms，SDNN ${safe(sd,1)} ms。`,`HRV 平均分来自同一批有效日的 HRV 分数；RMSSD ${safe(rm,1)} ms、SDNN ${safe(sd,1)} ms。`,`HRV mean score on the same valid days; RMSSD ${safe(rm,1)} ms and SDNN ${safe(sd,1)} ms.`,`HRV 평균; RMSSD ${safe(rm,1)}ms, SDNN ${safe(sd,1)}ms.`,`HRV 平均；RMSSD ${safe(rm,1)}ms、SDNN ${safe(sd,1)}ms。`),
 stable:L('心搏節奏穩定度取同一批有效日的分數平均。','心搏节奏稳定度取同一批有效日分数平均。','Mean of rhythm-stability scores over the same valid days.','리듬 안정도 평균.','リズム安定度の平均。')
 };
 return mainCard(L('心肺綜合狀態','心肺综合状态','Overall heart & breathing','심폐 종합 상태','心肺総合状態'),overall,intro,keys.map(k=>metricCard(k,vals[k],descriptions[k],'',trend(k))),'heart');
}
function threePeriodScores(days){
 const rows=dayRowsWithIndex(days).filter(r=>validDaySample(r,r.idx).valid),valid=rows.map(r=>({r,v:three(r)})).filter(x=>x.v.all!==null);
 const keys=['energy','recovery','calm'],vals=Object.fromEntries(keys.map(k=>[k,valid.length?avgScore(valid.map(x=>x.v[k])):null]));
 return {valid,vals,overall:valid.length?avgScore(keys.map(k=>vals[k])):null};
}
const priorDayDetail=dpOwnerDayDetail;
dpOwnerDayDetail=function(kind,cp,row){if(kind===0)return dayHeart(cp,row);return priorDayDetail(kind,cp,row);};
const priorPeriodDetail=dpOwnerPeriodDetail;
dpOwnerPeriodDetail=function(kind,cp,days){
 if(kind===0)return periodHeart(cp,days);
 if(kind!==2)return priorPeriodDetail(kind,cp,days);
 const result=priorPeriodDetail(kind,cp,days),data=threePeriodScores(days);
 const root=document.createElement('div');root.innerHTML=result;
 const overview=root.querySelector('.dp901-overall-head .dp901-score-col');
 if(overview){overview.outerHTML=scoreBlock(data.overall,true);}
 const status=root.querySelector('.dp901-overall-verdict');if(status)status.textContent=verdict(data.overall);
 const panel=root.querySelector('.dp901-health-score');if(panel)panel.dataset.dp903Composite=data.overall===null?'':data.overall;
 // Score cards use exactly the same valid days as the combined score, preventing off-by-one rounding gaps.
 const panels=root.querySelectorAll('.dp901-metric-card');
 ['energy','recovery','calm'].forEach((k,i)=>{
  const card=panels[i],val=data.vals[k];if(!card)return;
  const meter=card.querySelector('.dp901-score-col');if(meter)meter.outerHTML=scoreBlock(val,false);
 });
 return root.innerHTML;
};
const prevDeep=deepView;
deepView=function(){
 const markup=prevDeep();if(state.detail==='dp90-waveform')return markup;
 const root=document.createElement('div');root.innerHTML=markup;
 // Remove stale standalone HRV and rhythm cards from earlier wrappers when the new four-card layout is present.
 if(state.deepType===0){const primary=root.querySelector('.dp903-heart');if(primary){
  root.querySelectorAll('.dp71-hrv,.dp901-rhythm-card,.dp66-rhythm-short,.dp90-wave-shortcuts,.dp-hrv-visible').forEach(el=>{if(!primary.contains(el))el.remove();});
 }}
 // All three Deep categories use the same primary circular score dimensions.
 if(state.deepType===1){root.querySelectorAll('.dp-owner-status-heading .dp-status-score,.dp74-overview-head .dp-status-score,.dp-heart-period-overall .dp-status-score,.dp-sleep-period-score-head .dp-status-score').forEach(el=>el.classList.add('dp903-main-ring'));}
 return root.innerHTML;
};

// Keep title and back control of age detail consistent with its entry point.
const oldAge=dpAgeFullPage;
dpAgeFullPage=function(){
 const root=document.createElement('div');root.innerHTML=oldAge();
 const title=root.querySelector('.dp-independent-head b');if(title)title.textContent=L('AI 推算生理年齡','AI推算生理年龄','AI estimated biological age','AI 추정 생리 나이','AI 推定生理年齢');
 root.querySelectorAll('[data-action="age-detail-back"]').forEach((el,i)=>{if(!el.closest('.dp-independent-head'))el.remove();});
 return root.innerHTML;
};

// Standalone nearby-pets navigator: Map | List | Messages | Friends.
const oldGarden=gardenView;
function messageUnreadCount(){
 return Object.keys(dpChatStore()).filter(k=>dpFriendAuthorizedForThread(k)).reduce((sum,key)=>sum+dpThreadUnread(key),0);
}
function inboxOnly(){
 const root=document.createElement('div');root.innerHTML=gardenInbox();
 root.querySelectorAll('.dp-social-inbox').forEach(el=>el.remove());
 const badge=root.querySelector('.garden-inbox .pill');
 if(badge){const count=messageUnreadCount();const conversations=Object.keys(dpChatStore()).filter(k=>dpFriendAuthorizedForThread(k)&&(dpChatStore()[k]||[]).length).length;
   badge.textContent=String(conversations)+(count?` · ${count} ${L('未讀','未读','unread','안 읽음','未読')}`:'');}
 return root.innerHTML;
}
function friendsOnly(){
 dpSocialSeedShowcase();
 return `<section class="dp903-friends-page"><div class="dp903-friends-heading"><h3>${L('好友與申請','好友与申请','Friends & requests','친구 및 요청','友だちと申請')}</h3><button class="dp903-add-friend" data-action="dp-friend-menu">＋ ${L('加好友','加好友','Add friend','친구 추가','友だち追加')}</button></div>${dpFriendRequestsContent()}</section>`;
}
gardenView=function(){
 const mode=['map','list','messages','friends'].includes(state.gardenMode)?state.gardenMode:'map';
 if(mode==='friends')return `<div class="garden-overview dp903-garden-overview">${gardenTopAndTabs(mode)}${friendsOnly()}</div>`;
 const oldMode=state.gardenMode;state.gardenMode=mode;
 const root=document.createElement('div');root.innerHTML=oldGarden();state.gardenMode=oldMode;
 const tabs=root.querySelector('.garden-tabs');if(tabs)tabs.outerHTML=fourTabs(mode);
 if(mode==='messages'){
  const oldInbox=root.querySelector('.garden-inbox');if(oldInbox)oldInbox.outerHTML=inboxOnly();
 }
 return root.innerHTML;
};
function fourTabs(mode){return `<div class="garden-tabs dp903-garden-tabs">${[
 ['map',L('地圖','地图','Map','지도','地図')],['list',L('列表','列表','List','목록','リスト')],['messages',L('訊息','讯息','Messages','메시지','メッセージ')],['friends',L('好友','好友','Friends','친구','友だち')]
 ].map(([m,n])=>`<button type="button" class="${mode===m?'active':''}" data-action="dp903-garden-mode" data-mode="${m}">${n}${m==='messages'&&messageUnreadCount()?` <span class="dp-tab-unread">${messageUnreadCount()}</span>`:''}${m==='friends'&&dpPendingToMe().length?` <span class="dp-tab-unread">${dpPendingToMe().length}</span>`:''}</button>`).join('')}</div>`;}
function gardenTopAndTabs(mode){
 return `<div class="garden-top"><span class="garden-kicker">DeepPet Pet Garden</span><h3>${L('附近的毛孩，都在這裡相遇','附近的毛孩，都在这里相遇','Meet pets nearby','근처 반려동물과 만나보세요','近くのペット')}</h3><p>${L('地圖與距離是互動示例，並非真實附近用戶。','地图与距离是互动示例，并非真实附近用户。','Map and distances are illustrative only.','지도와 거리는 예시입니다.','地図はデモです。')}</p></div>${fourTabs(mode)}`;
}
function gardenStandalone(){return `<div class="app-pad dp-independent-page dp903-garden-page"><header class="dp-independent-head"><button type="button" data-action="dp903-garden-back" aria-label="Back">←</button><b>${L('附近的寵物','附近的宠物','Nearby pets','주변 반려동물','近くのペット')}</b></header>${gardenView()}<div class="footer-space"></div></div>`;}
function petProfileStandalone(){return `<div class="app-pad dp-independent-page dp903-profile-page"><header class="dp-independent-head"><button data-action="dp903-profile-back">←</button><b>${L('寵物公開檔案','宠物公开档案','Public pet profile','공개 프로필','公開プロフィール')}</b></header>${gardenPublicProfile()}<div class="footer-space"></div></div>`;}
const originalMe=meView;
meView=function(){if(state.detail==='dp903-garden')return gardenStandalone();if(state.detail==='dp903-profile')return petProfileStandalone();return originalMe();};
const originalChat=chatFullPage;
chatFullPage=function(){
 const root=document.createElement('div');root.innerHTML=originalChat();
 root.querySelectorAll('.dp-chat-more-wrap,.dp-chat-demo-indicator').forEach(e=>e.remove());
 return root.innerHTML;
};
const originalBottom=bottomNav;
bottomNav=function(){if((state.tab==='me'&&['dp903-garden','dp903-profile','chat'].includes(state.detail))||(state.tab==='deep'&&state.detail==='dp90-waveform'))return '';return originalBottom();};
const originalAction=onAction;
onAction=function(target){
 const action=target?.dataset?.action;
 // The rhythm-stability card moved into the four-card heart section. Keep the
 // Home score shortcut pointing to that exact card rather than a removed legacy card.
 if(action==='dp90-rhythm-nav'){
  const isStable=target.dataset.key==='stable';
  state.modal='';state.tab='deep';state.detail=null;state.deepType=isStable?0:2;state.range=1;
  state.deepSelectedDate=iso(localDate());render(true);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const selector=isStable?'[data-dp903-metric="stable"]':'.dp902-calm-target';
    const el=document.querySelector(selector),sc=document.getElementById('main-scroll');
    if(!el||!sc)return;
    const pos=el.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop-25;
    sc.scrollTo({top:Math.max(0,pos),behavior:'instant'});
    el.classList.add('dp902-jump-highlight');
    setTimeout(()=>{if(el.isConnected)el.classList.remove('dp902-jump-highlight');},3700);
  }));
  return;
 }
 if(action==='garden-detail'||action==='garden-inbox-open'){
  state.dp903GardenOrigin={tab:state.tab,detail:state.detail};state.modal='';state.tab='me';state.detail='dp903-garden';state.gardenMode=action==='garden-inbox-open'?'messages':(state.gardenMode||'map');render(true);return;
 }
 if(action==='dp903-garden-back'){
  state.modal='';const origin=state.dp903GardenOrigin||{tab:'me',detail:null};state.tab=origin.tab||'me';state.detail=origin.detail&&origin.detail!=='dp903-garden'?origin.detail:null;render(true);return;
 }
 if(action==='dp903-garden-mode'||action==='set-garden-mode'){
  state.gardenMode=['map','list','messages','friends'].includes(target.dataset.mode)?target.dataset.mode:'map';state.modal='';state.tab='me';state.detail='dp903-garden';render(true);return;
 }
 if(action==='chat-to-inbox'){
  state.tab='me';state.modal='';state.detail='dp903-garden';state.gardenMode='messages';render(true);return;
 }
 if(action==='garden-select-pet'||action==='garden-close-pet'||action==='toggle-garden-visibility'||action==='garden-gps-demo'||action==='garden-enable-gps'||action==='garden-follow'){
  const before=state.detail;
  const r=originalAction(target);
  if(before==='dp903-garden'){state.modal='';state.detail='dp903-garden';state.tab='me';render(true);}return r;
 }
 if(action==='garden-open-profile'){
  state.dp903ProfileReturn=state.detail==='chat'?'chat':'dp903-garden';state.gardenProfileId=target.dataset.id||state.chatWith;state.modal='';state.tab='me';state.detail='dp903-profile';render(true);return;
 }
 if(action==='garden-profile-back'||action==='dp903-profile-back'){
  state.tab='me';state.modal='';state.detail=state.dp903ProfileReturn==='chat'?'chat':'dp903-garden';render(true);return;
 }
 if(action==='garden-profile-message'){
  const id=target.dataset.id||state.gardenProfileId;
  if(!dpFriendAuthorizedForThread(id)){
    toast(L('需要雙方同意成為好友後才能傳送訊息。','需要双方同意成为好友后才能发送讯息。','Both pet owners must accept friendship before messaging.','양측 친구 동의가 필요합니다.','友だち承認後にメッセージできます。'));
    return;
  }
  dpOpenChat(id);return;
 }
 if(action==='dp-friend-accept'||action==='dp-friend-deny'||action==='dp-friend-request'){
  const result=originalAction(target);if(state.detail==='dp903-garden'||state.detail==='dp903-profile'){state.modal='';render(true);}return result;
 }
 if(action==='dp-friend-chat'){
  // Existing friend records open the full-screen chat, returning to the Messages tab.
  state.gardenMode='messages';const result=originalAction(target);return result;
 }
 if(action==='garden-message'||action==='garden-open-selected-chat'){
  const id=action==='garden-message'?target.dataset.id:state.gardenSelected;
  if(!dpFriendAuthorizedForThread(id)){
    // No modal for a not-yet-friend pet; open a full-screen public profile.
    state.gardenProfileId=id;state.dp903ProfileReturn='dp903-garden';
    state.tab='me';state.modal='';state.detail='dp903-profile';render(true);
    return;
  }
  state.gardenMode='messages';return originalAction(target);
 }
 return originalAction(target);
};
})();
