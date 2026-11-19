/* DeepPet V10.03: inline evidence clarity, stable-owner display metadata.
 * No new screens, cards, navigation, demo entries or scoring weights. */
(function(root){'use strict';
 const say=(zht,zh,en,ko,ja)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='ja'?ja:state.lang==='zh'?zh:zht;
 const dateToday=()=>iso(localDate());
 const isProfileOnly=()=>selectedBlank()||dp58FreshPet()||isFreePet();
 const realToday=()=>{
  if(isProfileOnly())return null;
  const row=(root.DeepPetSignalScoring?.getDaily?.(state.dog)||[]).find(x=>x?.date===dateToday());
  if(row?.source!=='20hz-waveform'||row.integrity?.realEvidenceValid!==true)return null;
  const stableId=typeof dpPetId==='function'?dpPetId(state.dog):null;
  const tags=[row.petUid,row.ownerPetUid,row.profile?.petUid].filter(Boolean).map(String);
  if(new Set(tags).size>1||(tags.length&&tags[0]!==stableId))return null;
  return row;
 };
 // On real-device days the existing urgent card must use precisely the
 // verified events that constrained the scores. Never show a showroom peak
 // merely because its demonstration pet happens to occupy the same slot.
 const oldUrgent=dp66UrgentHome;
 // The UI must not turn absent imported values into a real-looking 0.0, or
 // stringify Infinity/NaN in a warning. This is presentation-only validation:
 // no event is created, discarded, regraded, or fed back into score formulas.
 const eventNumber=raw=>{
  if((typeof raw!=='number'&&typeof raw!=='string')||String(raw).trim()==='')return null;
  const value=Number(raw);
  return Number.isFinite(value)&&value>=0?value.toFixed(1):null;
 };
 const missing=()=>say('未提供','未提供','Not available','자료 없음','データなし');
 const eventTime=e=>{
  if(typeof e.time==='string'&&e.time.trim())return e.time.trim().slice(0,40);
  const minute=e.minute;
  if(Number.isInteger(minute)&&minute>=0&&minute<1440)
   return `${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
  return missing();
 };
 dp66UrgentHome=function(){
  const daily=root.DeepPetSignalScoring?.getDaily?.(state.dog)||[];
  if(!daily.some(d=>d?.source==='20hz-waveform'))return oldUrgent();
  const row=realToday();if(!row)return '';
  const events=(row.integrity?.alerts||[]).filter(e=>e?.date===dateToday());
  if(!events.length)return '';
  const label=say('應急與變化提醒','应急与变化提醒','Priority changes','우선 변화 알림','重要な変化の通知');
  const names={heart:say('心跳狀況','心跳状况','Heartbeat','심박','心拍'),breath:say('呼吸狀況','呼吸状况','Breathing','호흡','呼吸')};
  const levels={light:say('輕度變化','轻度变化','Mild change','경미한 변화','軽度の変化'),medium:say('中度變化','中度变化','Moderate change','중간 변화','中程度の変化'),high:say('顯著變化','显著变化','Marked change','뚜렷한 변화','顕著な変化')};
  const rows=events.slice(0,3).map(e=>{
   const kind=['heart','breath'].includes(e.kind)?e.kind:null;
   const level=['light','medium','high'].includes(e.level)?e.level:null;
   const time=eventTime(e);
   const unit=kind==='heart'?'bpm':kind==='breath'?say('次／分','次／分','/min','회/분','回／分'):'';
   const value=eventNumber(e.value),reference=eventNumber(e.reference);
   const print=n=>n===null?'—':`${n}${unit?' '+unit:''}`;
   const levelName=level?levels[level]:say('變化程度待確認','变化程度待确认','Level not available','정도 확인 필요','程度未確認');
   const kindName=kind?names[kind]:say('健康變化','健康变化','Health change','건강 변화','健康の変化');
   // A device/report timestamp is data, not trusted HTML. Preserve the same
   // time text while preventing imported metadata from creating markup.
   return `<button class="dp905-milo-item" data-dp921="go-alert"><span class="dp905-milo-risk ${level||''}">${levelName}</span><span><b>${kindName} · ${esc(time)}</b><small>${print(value)} · ${say('同活動參考','同活动参考','Activity-matched baseline','동일 활동 기준','同活動の基準')} ${print(reference)}</small></span><span aria-hidden="true">›</span></button>`;
  }).join('');
  const more=events.length>3?`<button class="dp921-urgent-more" data-dp921="all-alerts">More · ${events.length}</button>`:'';
  return `<section class="card dp905-milo-demo"><div class="dp905-milo-heading"><b>${label}</b></div>${rows}${more}</section>`;
 };
 function annotateExistingScores(main){
  if(state.tab!=='home'||state.detail||isProfileOnly())return;
  const lanes=main.querySelectorAll('.dp-summary-lane');if(!lanes.length)return;
  const row=realToday();
  const today=(root.DeepPetSignalScoring?.getDaily?.(state.dog)||[]).find(x=>x?.date===dateToday());
  if(row){
   const quality=row.quality||{};
   const seconds=quality.observedSeconds,ratio=quality.timeCoverage;
   const secondsValid=typeof seconds==='number'&&Number.isFinite(seconds)&&seconds>=0&&seconds<=86400;
   const coverageValid=typeof ratio==='number'&&Number.isFinite(ratio)&&ratio>=0&&ratio<=1;
   const basis=quality.samplingMode==='scheduled'?
    say('計畫量測覆蓋','计划量测覆盖','Scheduled coverage','예정 측정 범위','予定測定カバー率'):
    say('全天有效覆蓋','全天有效覆盖','Daily valid coverage','하루 유효 범위','1日有効カバー率');
   const hintParts=[];
   if(secondsValid){const minutes=Math.round(seconds/60);hintParts.push(say(`有效佩戴 ${minutes} 分鐘`,`有效佩戴 ${minutes} 分钟`,
    `${minutes} min valid wear`,`${minutes}분 유효 착용`,`有効装着 ${minutes}分`));}
   if(coverageValid)hintParts.push(`${basis} ${Math.round(ratio*100)}%`);
   if(hintParts.length)for(const lane of lanes){const secondary=lane.querySelector('.dp-lane-copy>small');if(!secondary)continue;
    const span=document.createElement('span');span.className='dp1003-evidence-inline';span.textContent=hintParts.join(' · ');secondary.appendChild(span);}
  }else if(!Number.isFinite(today?.scores?.physiol)){
   // The existing layout contains two score lanes; both must explain why
   // data is absent. Never leave the rhythm lane blank beside a warning.
   const rhythm=main.querySelector('.dp-rhythm-lane .dp-lane-description');
   if(rhythm&&!rhythm.textContent.trim())rhythm.textContent=say(
    '今日有效佩戴資料不足，暫不評分。','今日有效佩戴资料不足，暂不评分。',
    'Not enough verified wear data today to score.','오늘 유효 착용 자료가 부족해 점수를 표시하지 않습니다.',
    '本日の有効な装着記録が不足しているため、採点できません。');
  }
  // Verified acute changes appear only in the dedicated emergency panel.
 }
 const original=render;
 render=function(reset=false){original(reset);
  const app=document.getElementById('app'),main=app?.querySelector('.app-main');if(!main)return;
  // A stable identifier accompanies the current rendered view, independently
  // of pet order and duplicate display names. This is metadata, not a new UI.
  main.dataset.dpPetUid=selectedBlank()?'':(typeof dpPetId==='function'?dpPetId(state.dog):'');
  main.dataset.dpPetIndex=selectedBlank()?'':String(state.dog);
  annotateExistingScores(main);
  app.querySelectorAll('.app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.03');
 };
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.03',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'stable-pet-uid-on-real-ingestion','per-pet-verified-wear-quality','respiratory-alert-both-score-ceilings',
  'breed-age-weight-preventive-context','neutral-optional-quality-fields']};
 root.DeepPetUX1003={version:'10.03',realToday,annotateExistingScores};
})(window);
