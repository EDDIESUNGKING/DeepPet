/* DeepPet V9.09 — concise, data-proximate explanations and consistent navigation.
   UI changes only; original measurement / score computation remains intact. */
(function(){
'use strict';
const L=(tw,cn,en,ko,ja)=>state.lang==='zh'?cn:state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?(ja||en):tw;
const escTxt=s=>String(s||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const status=s=>s===null||!Number.isFinite(Number(s))?L('資料不足','数据不足','Insufficient data','자료 부족','データ不足'):+s>=90?L('健康','健康','Healthy','건강','健康'):+s>=80?L('低風險','低风险','Mild','낮은 위험','低リスク'):+s>=60?L('中風險','中风险','Moderate','중간 위험','中リスク'):L('高風險','高风险','Risk','높은 위험','高リスク');
const note=(msg,klass='')=>`<div class="dp909-what ${klass}"><span class="dp909-what-icon" aria-hidden="true">i</span><p>${msg}</p></div>`;
const hrvText=()=>`<div class="dp909-brief"><p><b>RMSSD</b>　${L('看相鄰心跳間隔的短期變化，幫助了解休息時的自主調節。','看相邻心跳间隔的短期变化，帮助了解休息时身体的自主调节。','Short-term variation between beats; useful for understanding regulation at rest.','인접 박동 간격의 짧은 변화입니다.','隣り合う心拍間隔の短期変動を表します。')}</p><p><b>SDNN</b>　${L('看整段心搏間隔的整體變化，反映這段時間心搏節奏的變動幅度。','看整段心搏间隔的整体变化，反映一段时间内心搏节奏的变化幅度。','Overall beat-interval variation across the measured period.','측정 구간 전체의 심박 간격 변화를 보여줍니다.','測定期間全体の心拍間隔の変動を表します。')}</p><p>${L('兩項要與這隻寵物自己的有效基準比較，並不是數值越高越健康。','两项都要与这只宠物自己的有效基准比较，并不是越高越健康。','Compare both with this pet’s own valid baseline; higher is not always better.','반려동물 자신의 기준과 비교하세요.','この子自身の基準と比較します。')}</p></div>`;
const beatText=()=>L('比較安靜時心搏間隔是否接近牠自己的平常節奏；分數越高表示越接近平常，不代表已排除心律問題。','比较安静时心搏间隔是否接近它自己的平常节奏；分数越高表示越接近平常，不代表已排除心律问题。','Compares quiet-time beat timing with this pet’s usual pattern. Higher means closer to normal for this pet, not proof of no arrhythmia.','휴식 시 심박 간격이 평소 패턴에 가까운지 보여줍니다.','安静時の心拍間隔が普段に近いか比較します。');
const energyText=()=>L('精力分數：比較牠自己的活動、休息和近期規律；分數越高，表示越接近平常的良好狀態。','精力分数：比较它自己的活动、休息和近期规律；分数越高，表示越接近平常的良好状态。','Energy score compares movement and rest to this pet’s routine. Higher means closer to its usual favorable pattern.','활동·휴식 패턴을 개인 기준과 비교한 점수입니다.','活動と休息を個体基準と比較した点数です。');
const recoveryText=()=>L('恢復分數：比較活動停止後兩分鐘心率下降多少 bpm。在相近運動強度下，回落較快通常較理想，但不是下降越多就一定越健康。','恢复分数：比较运动停止后两分钟心率下降多少 bpm。在相近运动强度下，回落较快通常较理想，但不是下降越多就一定越健康。','Recovery compares the heart-rate drop in two minutes after activity. Faster return is often favorable for similar effort, but a larger drop is not always better.','활동 후 2분 심박 감소량을 비슷한 운동과 비교합니다.','運動後2分間の心拍低下量を類似の活動と比較します。');
const calmText=()=>L('放鬆與平穩度：看休息時的心搏間隔、RMSSD、SDNN 與牠自己的基準是否接近；分數越高表示更接近平常，不直接代表情緒好壞。','放松与平稳度：看休息时的心搏间隔、RMSSD、SDNN 与它自己的基准是否接近；分数越高表示更接近平常，不直接代表情绪好坏。','Rest & steadiness compares quiet-time beat intervals and HRV with this pet’s baseline. Higher means closer to usual, not a mood diagnosis.','휴식 중 심박 간격과 HRV를 개인 기준과 비교합니다.','安静時の心拍間隔とHRVを個体基準と比較します。');
const curvePercent=()=>L('<b>圖表百分比＝該時段的活動強度指數</b>，不是健康分數或電量。0% 接近靜止，100% 代表模型中較高的活動強度；數值升高不一定越健康，要看休息與恢復。','<b>曲线百分比＝该时段的活动强度指数</b>，不是健康分数或电量。0% 接近静止，100% 代表模型中较高的活动强度；数值高不代表一定更健康，还要结合休息与恢复。','<b>Percent = movement-intensity index at that time</b>, not a health score or battery level. Near 0% means rest and 100% means high modeled activity. Higher is not necessarily healthier.','백분율은 활동 강도 지수입니다. 건강 점수가 아닙니다.','％は活動強度を示し、健康点数ではありません。');
function replaceExact(root,oldText,newText){root.querySelectorAll('*').forEach(el=>{if(el.children.length||!el.textContent)return;if(el.textContent.trim()===oldText)el.textContent=newText;});}
function prune(root){
 if(!root)return;
 root.querySelectorAll('.demo-ribbon,.dp905-sim-note,.dp70-prevention-note,.dp68-prevent-note,.dp904-warning').forEach(el=>el.remove());
 // A disclosure about the absence of hardware remains accessible in Settings → Privacy.
 root.querySelectorAll('.dp905-milo-heading>small,.dp905-milo-demo>p').forEach(el=>el.remove());
 // Remove redundant explanatory accordion: the explanation is already beside the relevant score.
 if(state.tab==='deep')root.querySelectorAll('.dp-metric-usage-notes,.dp903-beat-help,.dp90-beat-help,.dp901-rhythm-help').forEach(el=>el.remove());
}
function decorateDeep(root){
 if(state.tab!=='deep')return;
 root.querySelectorAll('[data-dp903-metric="hrv"]').forEach(card=>{
  card.querySelectorAll('.dp904-hrv-help').forEach(n=>n.remove());
  const left=card.querySelector('.dp903-metric-left');if(left&&!left.querySelector('.dp909-brief'))left.insertAdjacentHTML('beforeend',hrvText());
 });
 root.querySelectorAll('[data-dp903-metric="stable"]').forEach(card=>{
  card.querySelectorAll('details').forEach(x=>x.remove());
  const p=card.querySelector('.dp903-metric-left p');if(p)p.textContent=beatText();
 });
 // The 3 energy/recovery metrics have distinct, non-duplicated definitions.
 root.querySelectorAll('.dp901-metric-card,.dp903-metric-card').forEach(card=>{
  const id=card.dataset.dp903Metric||'';
  const name=(card.querySelector('h3')?.textContent||'').toLowerCase();
  const type=id==='energy'||/精力情況|精力情况|energy status|활력 상태/i.test(name)?'energy':id==='recovery'||/恢復情況|恢复情况|recovery status|회복 상태/i.test(name)?'recovery':id==='calm'||/放鬆與平穩度|放松与平稳度|rest.*steadiness/i.test(name)?'calm':'';
  if(!type||card.querySelector('.dp909-brief'))return;
  const explanation={energy:energyText(),recovery:recoveryText(),calm:calmText()}[type];
  const target=card.querySelector('.dp903-metric-left')||card;
  target.insertAdjacentHTML('beforeend',`<div class="dp909-brief"><p>${explanation}</p></div>`);
 });
 // Chart reads must stay tied to their actual plotted data and date.
 if(state.detail==='dp905-energy-day'){
  const box=root.querySelector('.dp905-overview');
  if(box&&!box.querySelector('.dp909-percent-guide')){
   const chart=box.querySelector('.dp908-inspect-chart');
   if(chart)chart.insertAdjacentHTML('beforebegin',note(curvePercent(),'dp909-percent-guide'));
  }
 }
 if(state.detail==='dp905-energy-day'||state.detail==='dp90-waveform'&&state.dp905WaveMode==='day'){
  const box=root.querySelector('.dp905-overview');
  if(box&&!box.querySelector('.dp909-day-note')){
   const n=Number(root.querySelector('.dp905-day-stats b:last-child')?.textContent||0);
   const label=L('讀圖重點','读图重点','How to read','그래프 안내','見方');
   box.insertAdjacentHTML('beforeend',note(`<b>${label}</b>　${n>0?L('圖中的圈選處是需要回看的變化時段；請移動滑鼠讀取準確時間與數值，點選下方時段放大。','图中圈选的是值得回看的变化时段；移动鼠标读取准确时间与数值，点击下方时段可放大。','Flagged points mark times worth reviewing. Hover for exact time and value; select an interval below to zoom.','표시 지점을 선택하면 확대됩니다.','選択すると拡大します。'):L('當天未標出優先變化，仍可在曲線上滑動查看每分鐘資料。','当天没有优先标记的变化，仍可在曲线上滑动查看每分钟数据。','No priority changes flagged; hover to inspect each minute.','그래프에서 수치를 확인하세요.','グラフの値を確認してください。')}`,'dp909-day-note'));
  }
 }
 if(state.detail==='dp90-waveform'){
  const cards=root.querySelectorAll('.dp904-wave-page .dp904-wave-card');
  cards.forEach((card,i)=>{
   const noteEl=card.querySelector('.dp904-small-note');
   if(noteEl){noteEl.textContent=i===0?L('波形隨時間持續更新；未連接項圈時不代表實際感測訊號。','波形随时间更新；未连接项圈时不代表实际传感器信号。','Animated waveform; without a connected collar this is not a live sensor reading.','목걸이 연결 전에는 실측 데이터가 아닙니다.','首輪接続前は実測データではありません。'):i===1?L('移動滑鼠讀取全天時間與數值，選下方時段可放大。','移动鼠标读取全天时间与数值，选择下方时段可放大。','Hover for daily time and value; select a segment below to zoom.','그래프의 시간과 값을 확인하세요.','全日の時刻と値を確認できます。'):L('放大所選時段，與當日平均比較。','放大所选时段，与当天平均比较。','Zoomed interval compared with the daily mean.','선택 구간의 상세 정보입니다.','選択時間帯の拡大図です。');}
   const svg=card.querySelector('svg.dp904-trend-svg');if(!svg||svg.closest('.dp908-inspect-chart'))return;
   const ticks=[...svg.querySelectorAll('text')].map(x=>x.textContent||'').filter(t=>/^\d{2}:\d{2}$/.test(t));
   const times=ticks.map(t=>Number(t.slice(0,2))*60+Number(t.slice(3)));
   const a=i===1?0:Math.min(...times),b=i===1?1439:Math.max(...times);
   const metric=state.dp90WaveKind==='breath'?'breath':'heart',date=state.dp90WaveDate||deepChosenDate();
   const parent=document.createElement('div');parent.className='dp908-inspect-chart dp909-wave-inspector';parent.dataset.metric=metric;parent.dataset.date=date;parent.dataset.start=String(Number.isFinite(a)?a:0);parent.dataset.end=String(Number.isFinite(b)?b:1439);parent.dataset.unit=metric==='heart'?'bpm':L('次／分','次／分','/min','회/분','回／分');parent.tabIndex=0;parent.setAttribute('role','group');
   svg.parentNode.insertBefore(parent,svg);parent.appendChild(svg);
   const read=document.createElement('div');read.className='dp908-chart-readout';read.setAttribute('aria-live','polite');read.textContent=L('滑動或點擊曲線，顯示詳細時間與數值','滑动或点击曲线，显示详细时间与数值','Hover or tap to inspect time and readings','그래프에서 값을 확인하세요.','グラフから時刻と数値を確認');parent.appendChild(read);
  });
 }
}
function decorateHome(root){
 if(state.tab!=='home')return;
 root.querySelectorAll('.dp905-prevent-home,.dp68-prevent-button,.dp67-home-card.dp68-prevent-button').forEach(el=>el.remove());
 const heading=root.querySelector('.dp905-milo-heading b,.dp66-urgent-header strong');
 if(heading)heading.textContent=L('應急提醒','应急提醒','Urgent alerts','긴급 알림','緊急のお知らせ');
 root.querySelectorAll('.dp-today-focus .focus-eyebrow,.dp-today-more-page .dp-independent-head b').forEach(el=>{
  el.textContent=L('待辦事項','待办事项','To-do items','할 일','対応事項');
 });
 root.classList.toggle('dp909-full-tasks',state.detail==='today-all');
 for(const [selector,value] of [
  ['.dp-health-lane .dp-lane-description',signalQuality().valid?status(score(currentDog())):L('資料不足','数据不足','Insufficient data','자료 부족','データ不足')],
  ['.dp-rhythm-lane .dp-lane-description',signalQuality().valid?status(rhythmCompositeScore()):L('資料不足','数据不足','Insufficient data','자료 부족','データ不足')]
 ]){const el=root.querySelector(selector);if(el)el.textContent=value;}
}
function decorateHealth(root){
 if(state.tab!=='health')return;
 const detail=root.querySelector('.dp70-watch-detail-page');
 if(detail){detail.classList.add('dp909-simplify-card');detail.querySelectorAll('.dp70-feedback-history').forEach(n=>n.remove());if(state.dp909FromWatchAll){const back=detail.querySelector('[data-action=dp70-watch-back]');if(back)back.dataset.action='dp909-watch-all-back';}}
 root.querySelectorAll('.dp905-more,.dp70-watch-more>summary').forEach(b=>b.classList.add('dp909-more'));
 // The care reminder list is already pet-scoped. Only show More if there are over three items.
 const ahead=root.querySelector('.dp-upcoming-care');
 if(ahead&&ahead.querySelectorAll('.dp-upcoming-action').length>3){
  const rows=[...ahead.querySelectorAll('.dp-upcoming-action')];rows.slice(3).forEach(x=>x.remove());
  ahead.insertAdjacentHTML('beforeend',`<button class="dp909-more" data-action="dp909-health-more">More</button>`);
 }
}
function cleanRepetitiveNotices(root){
 if(!root)return;
 const wordMap=[
  ['当日模拟趋势','当日趋势'],['當日模擬趨勢','當日趨勢'],['Daily demo trend','Daily trend'],
  ['这是模拟观察线索，不等于已诊断心律不整或呼吸疾病。','图中变化需结合呼吸、活动与兽医判断，不能单凭曲线确诊疾病。'],
  ['這是模擬觀察線索，不等於已診斷心律不整或呼吸疾病。','圖中變化需結合呼吸、活動與獸醫判讀，不能只憑曲線確診疾病。'],
  ['These are demo review cues, not diagnosed arrhythmia or respiratory disease.','These trend changes cannot diagnose arrhythmia or respiratory disease.'],
  ['Interactive example only: map positions and distances are fictional.','Location requires a connected 4G collar and owner-approved sharing; the current map is not live tracking.'],
  ['地圖與距離均為可互動示例，並不代表真的有人在附近。','地圖位置須連接 4G 項圈並經主人同意分享，未連接時不代表即時定位。'],
  ['地图与距离均为可互动示例，并不代表真的有人在附近。','地图位置须连接 4G 项圈并经主人同意分享，未连接时不代表实时定位。'],
  ['Try the 4G GPS map demo','Explore the 4G GPS map'],
  ['試用 4G GPS 地圖展示','查看 4G GPS 地圖'],['试用 4G GPS 地图展示','查看 4G GPS 地图'],
  ['模擬連接','設備狀態預覽'],['模拟连接','设备状态预览'],['Simulate connection','Preview device status'],
  ['確認模擬付款','確認訂單預覽'],['确认模拟付款','确认订单预览'],['Confirm simulated payment','Confirm order preview']
 ];
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while(node=walker.nextNode()){
  if(node.parentElement?.closest('textarea,input,[contenteditable],.chat-bubble,.dp-im-row,.dp70-note-entry,.dp-today-action .ai-suggestion-body'))continue;
  const original=node.nodeValue||'';if(!/模擬|模拟|示範|示范|demo|simulat|interactive example/i.test(original))continue;
  let value=original;for(const [a,b] of wordMap)value=value.replaceAll(a,b);
  if(value!==original)node.nodeValue=value;
 }
 // Remove visual development notices only, not owner-entered notes, medication records, or safety guidance.
 root.querySelectorAll('.dp905-sim-note,.dp67-prevent-note,.dp905-milo-heading>small').forEach(n=>n.remove());
 for(const e of root.querySelectorAll('.dp905-overview>p,.dp904-small-note,.dp70-prevention-note')){
  if(/示範|示范|demo|演示|模拟|模擬|interactive example/i.test(e.textContent||'')){
   if(e.matches('.dp905-overview>p')) e.textContent=L('圈選處表示值得回看的變化，點選時段可放大。','圈选处表示值得回看的变化，点击时段可以放大。','Circled points mark changes worth reviewing; select an interval to zoom.','표시 지점을 선택하면 확대됩니다.','選択した区間を拡大できます。');
   else e.remove();
  }
 }
 // A small source note stays in the privacy screen so unconnected readings are never presented as verified data.
 const p=root.querySelector('.dp-privacy-detail,.privacy-detail-page');
 if(p&&!p.querySelector('.dp909-source-info'))p.insertAdjacentHTML('beforeend',`<p class="dp909-source-info">${L('資料來源：未連接項圈時使用內建資料；連接後請以設備實測為準。','数据来源：未连接项圈时使用内置数据；连接后请以设备实测为准。','Data source: built-in readings are shown until a collar is connected; rely on device readings after connection.','장치 연결 전에는 내장 데이터가 표시됩니다.','接続前は内蔵データを表示します。')}</p>`);
}
function updateAfterRender(){
 const root=document.getElementById('app');if(!root)return;
 prune(root);decorateDeep(root);decorateHome(root);decorateHealth(root);cleanRepetitiveNotices(root);
 // From a dedicated To-do list, keep a direct route back from child sections.
 if(state.dp909FromTodo&&(state.tab==='deep'||state.tab==='health')&&state.detail!=='today-all'&&!root.querySelector('.dp909-back-tasks')){
  const main=root.querySelector('.app-main');if(main)main.insertAdjacentHTML('afterbegin',`<button data-action="dp909-back-to-list" class="dp909-back-tasks">← ${L('返回待辦事項','返回待办事项','Back to to-do items','할 일로 돌아가기','対応事項に戻る')}</button>`);
 }
}
const priorRender=render;
render=function(reset=false){priorRender(reset);updateAfterRender();};
const priorModal=renderModal;
renderModal=function(){priorModal();const root=document.getElementById('overlay-root');if(!root)return;
 const title=root.querySelector('.modal-head h2');if(title&&/三項節奏|三项节奏|Three rhythm/i.test(title.textContent||''))title.textContent=L('兩項身體節奏指標','两项身体节奏指标','Two body rhythm indicators','두 가지 리듬 지표','2つの体内リズム指標');
 const score=root.querySelector('.dp-rhythm-summary');if(score){score.querySelectorAll('.dp90-description').forEach(el=>{if(/三項|三项|three items/i.test(el.textContent||''))el.textContent=L('由放鬆與平穩度、心搏節奏穩定度兩項分數平均組成。','由放松与平稳度、心搏节奏稳定度两项分数平均组成。','Average of rest & steadiness and heartbeat rhythm stability.','두 점수의 평균입니다.','2項目の平均です。');});}
 prune(root);cleanRepetitiveNotices(root);
};
const prevHealthView=healthView;
healthView=function(){if(state.detail==='dp905-watch-all')state.dp909FromWatchAll=true;return prevHealthView();};
const priorBottom=bottomNav;
bottomNav=function(){if(state.tab==='home'&&state.detail==='today-all')return '';return priorBottom();};
const priorAction=onAction;
onAction=function(target){
 const a=target?.dataset?.action;
 if(a==='dp909-watch-all-back'){state.dp909FromWatchAll=false;navTo('health','dp905-watch-all');return;}
 if(a==='dp909-back-to-list'){state.dp909FromTodo=false;navTo('home','today-all');return;}
 if(a==='today-open'&&state.tab==='home'&&state.detail==='today-all')state.dp909FromTodo=true;
 if(a==='nav'||a==='today-more-back'||a==='today-more-open')state.dp909FromTodo=false;
 if(a==='health-back'&&state.dp909FromTodo){state.dp909FromTodo=false;navTo('home','today-all');return;}
 return priorAction(target);
};
// Prevention notes have an independent event handler; route list-origin Back to that list.
document.addEventListener('click',ev=>{
 const btn=ev.target.closest?.('[data-action]');if(!btn)return;
 const a=btn.dataset.action;
 if(a==='dp70-watch-open'&&state.tab==='health'&&state.detail==='dp905-watch-all')state.dp909FromWatchAll=true;
 if(a==='dp70-watch-back'&&state.dp909FromWatchAll){ev.preventDefault();ev.stopImmediatePropagation();state.dp909FromWatchAll=false;navTo('health','dp905-watch-all');}
},true);
// User-facing tab name changes; keep the existing internal routing identifiers.
for(const lang of ['zh','zht','en','ko','ja'])if(LANG[lang])LANG[lang].home=({zh:'首页',zht:'首頁',en:'Home',ko:'홈',ja:'ホーム'})[lang];
render(true);
})();
