/* DeepPet V10.132 — quality first, time-aligned multi-sensor risk interpretation.
 * Do not infer respiratory arrest, heart failure or terminal events from a
 * wellness score or from a 20Hz collar's single missing sensor channel.
 */
(function(root){'use strict';
const langs=['zht','zh','en','ja','ko'];
const i18n={
 zht:{missing:'訊號中斷，沒有有效分數',missingNote:'心跳、呼吸與活動訊號同時中斷；可能是項圈移位或接觸不足。請調整位置、戴穩後再同步。',gaps:n=>`這段期間有 ${n} 天疑似接觸中斷，趨勢已留空，不當作 0 分。`,warn:'佩戴訊號需要確認',alert:'重要生理警示',emergency:'立即急診',uncertain:'單項訊號異常，先檢查寵物與項圈',uncertainNote:'其中一項測不到，不能只憑項圈斷定心跳或呼吸停止。請立刻看寵物有沒有正常呼吸、反應與活動；若有呼吸困難或虛脫，立即急診。',rest:'安靜狀態下心跳和呼吸持續大幅升高',restNote:'兩項同時明顯高於平常，且沒有相應活動。立即查看呼吸是否費力、精神是否正常，持續異常請立即聯絡獸醫；喘不過氣、牙齦發藍或虛脫，直接急診。',emergencyNote:'出現呼吸費力、倒下、無反應或牙齦發藍，立即前往獸醫急診。',noBaseline:'缺少可靠的個體參考或活動資訊，暫不判定夜間心肺危急事件。',stable:'目前有效量測沒有達到複合危急條件。',signalCard:'項圈訊號',period:'期間資料完整度'},
 zh:{missing:'信号中断，没有有效分数',missingNote:'心跳、呼吸和活动信号同时中断；可能是项圈移位或接触不足。请调整位置、戴稳后再同步。',gaps:n=>`这段期间有 ${n} 天疑似接触中断，趋势留空，不当作0分。`,warn:'需要检查佩戴信号',alert:'重要生理警示',emergency:'立即急诊',uncertain:'单项信号异常，先检查宠物和项圈',uncertainNote:'其中一项测不到，不能只凭项圈断定心跳或呼吸停止。请马上查看宠物的呼吸、反应和活动；如果呼吸困难或虚脱，立即急诊。',rest:'安静时心跳和呼吸持续大幅升高',restNote:'两项同时明显高于平常，但没有相应活动。马上检查是否呼吸费力、精神异常；持续异常立即联系兽医，喘不过气、牙龈发蓝或虚脱直接急诊。',emergencyNote:'出现呼吸费力、倒下、无反应或牙龈发蓝，立即去兽医急诊。',noBaseline:'缺少可靠的个体参考或活动信息，暂不能判断夜间心肺危急事件。',stable:'目前有效测量没有达到复合危急条件。',signalCard:'项圈信号',period:'期间数据完整度'},
 en:{missing:'Signal lost — no valid score',missingNote:'Heart, breathing and movement signals stopped together. The collar may have shifted or lost contact. Refit it and sync again.',gaps:n=>`${n} day(s) had likely contact loss. Trend points are gaps, not zero scores.`,warn:'Check collar signal',alert:'Important health alert',emergency:'Emergency vet now',uncertain:'One signal missing: check your pet and collar now',uncertainNote:'A missing sensor channel alone does not prove breathing or heartbeat has stopped. Check breathing and responsiveness immediately. Breathing distress or collapse needs emergency care.',rest:'Heart rate and breathing remain unusually high at rest',restNote:'Both are far above the pet’s reference while movement is low. Check breathing effort and behavior now; seek veterinary advice immediately if it continues. Breathing distress, blue gums or collapse means ER.',emergencyNote:'Laboured breathing, collapse, unresponsiveness or blue gums require immediate emergency veterinary care.',noBaseline:'Reliable baseline or movement data is unavailable; no rest-time crisis is inferred.',stable:'No verified combination of immediate danger signals detected.',signalCard:'Collar signal',period:'Record completeness'},
 ja:{missing:'信号が途切れたため点数なし',missingNote:'心拍・呼吸・動きの信号が同時に途切れました。首輪のずれや接触不良が考えられます。位置を直して再同期してください。',gaps:n=>`この期間に接触不良の疑いがある日が${n}日あります。0点ではなく欠測として表示します。`,warn:'首輪の信号を確認',alert:'重要な健康警告',emergency:'直ちに救急動物病院へ',uncertain:'一部の信号が途切れています。今すぐ状態を確認',uncertainNote:'一項目が測れないだけで心停止・呼吸停止とは断定できません。呼吸と反応、装着状態を直ちに確認。呼吸困難・虚脱なら救急へ。',rest:'安静時に心拍と呼吸がともに高い状態が続いています',restNote:'動きが少ないのに、両方とも普段より著しく高い状態です。呼吸の苦しさと様子をすぐ確認し、続けば直ちに獣医へ。呼吸困難・青い歯ぐき・虚脱は救急です。',emergencyNote:'呼吸困難、虚脱、反応がない、歯ぐきが青い場合は直ちに救急へ。',noBaseline:'個体の参考値または活動情報が不足しているため、危急イベントとは判定しません。',stable:'確認できた信号に複合的な緊急条件はありません。',signalCard:'首輪の信号',period:'記録の完全性'},
 ko:{missing:'신호 중단 — 유효한 점수 없음',missingNote:'심박·호흡·움직임 신호가 함께 끊겼습니다. 목걸이가 움직였거나 밀착이 안 됐을 수 있습니다. 위치를 조정하고 다시 동기화하세요.',gaps:n=>`이 기간에 접촉 불량이 의심되는 날이 ${n}일 있습니다. 0점이 아니라 결측으로 표시합니다.`,warn:'목걸이 신호 확인',alert:'중요 건강 경고',emergency:'즉시 응급 동물병원',uncertain:'한 가지 신호가 끊겼습니다. 지금 반려동물 확인',uncertainNote:'센서 하나가 안 잡힌다고 심박·호흡 정지를 단정할 수 없습니다. 호흡·반응·착용 상태를 즉시 확인하세요. 호흡곤란이나 쓰러짐은 응급진료가 필요합니다.',rest:'안정 시 심박과 호흡이 모두 매우 높은 상태가 지속됩니다',restNote:'움직임이 적은데 두 수치가 평소보다 크게 높습니다. 호흡과 반응을 즉시 살피고 지속되면 바로 수의사에게 연락하세요. 호흡곤란·청색 잇몸·쓰러짐은 응급진료입니다.',emergencyNote:'호흡곤란·쓰러짐·반응 없음·푸른 잇몸은 즉시 응급진료가 필요합니다.',noBaseline:'개별 기준 또는 활동 정보가 부족해 위급 이벤트로 단정하지 않습니다.',stable:'확인된 복합 응급 조건은 없습니다.',signalCard:'목걸이 신호',period:'기간 데이터 완전성'}
};
const lang=()=>i18n[state.lang]||i18n.zht;
const finite=n=>typeof n==='number'&&Number.isFinite(n);
// Explicit per-channel acquisition flags are not synonymous with numeric 0:
// motion=0 means correctly observed stillness when motionPresent=true.
function evalOne(x){
 const hr=Number(x.hr),rr=Number(x.rr),motion=Number(x.motion),q=x.quality!==false;
 if(hr===0&&rr===0&&motion===0&&x.motionPresent!==true)return {kind:'signal-lost',severity:'unknown',score:null,missing:3,valid:false};
 const hrPresent=x.heartPresent===false?false:x.heartPresent===true?true:finite(hr)&&hr>0;
 const rrPresent=x.breathPresent===false?false:x.breathPresent===true?true:finite(rr)&&rr>0;
 const moPresent=x.motionPresent===false?false:x.motionPresent===true?true:x.motion!==null&&x.motion!==undefined&&finite(motion)&&motion>=0;
 const missing=[!hrPresent,!rrPresent,!moPresent].filter(Boolean).length;
 if(missing===3)return {kind:'signal-lost',severity:'unknown',score:null,missing:3,valid:false};
 if(missing>0)return {kind:'partial-signal',severity:'urgent-check',score:null,missing,valid:false};
 if(!q||x.contactGood===false)return {kind:'poor-quality',severity:'unknown',score:null,valid:false};
 return {kind:'valid',severity:'normal',score:null,valid:true,hr,rr,motion,at:x.at||null};
}
function classify(samples,context={}){
 const xs=(Array.isArray(samples)?samples:[]).slice(-600);
 if(!xs.length)return {kind:'no-record',severity:'unknown',score:null,valid:false};
 if(context.observedDistress===true||context.collapse===true||context.blueGums===true||context.unresponsive===true){return {kind:'symptom-emergency',severity:'critical',score:null,valid:false};}
 const latest=evalOne(xs[xs.length-1]);
 if(latest.kind!=='valid')return latest;
 const valid=xs.map(evalOne).filter(x=>x.valid);
 if(valid.length<3)return {kind:'insufficient',severity:'unknown',score:null,valid:true};
 const base=context.baseline||{};
 if(!finite(base.hr)||base.hr<=0||!finite(base.rr)||base.rr<=0||context.motionValidated!==true)return {kind:'insufficient-context',severity:'unknown',score:null,valid:true};
 const last=valid.slice(-120);const window=last.filter(v=>v.at&&Number.isFinite(Date.parse(v.at)));
 const elapsed=window.length?Date.parse(window.at(-1).at)-Date.parse(window[0].at):0;
 const continuous=window.length>=8&&window.every((v,i)=>i===0||(Date.parse(v.at)-Date.parse(window[i-1].at)>=0&&Date.parse(v.at)-Date.parse(window[i-1].at)<=5000));
 const high=(v)=>v.hr>=Math.max(base.hr*1.38,base.hr+25)&&v.rr>=Math.max(base.rr*1.55,base.rr+10)&&v.motion<=Math.max(0.08,Number(context.quietMotionMax)||0.12);
 const recent=last.slice(-Math.min(last.length,30));
 if((context.resting===true||context.sleepWindow===true)&&continuous&&elapsed>=20000&&recent.filter(high).length>=Math.ceil(recent.length*.8)&&recent.length>=8){
  return {kind:'sustained-cardiorespiratory-rest',severity:'critical',valid:true,score:null,seconds:Math.floor(elapsed/1000),samples:recent.length};
 }
 return {kind:'valid',severity:'normal',valid:true,score:null};
}
function message(result){const l=lang();switch(result?.kind){case 'signal-lost':return {title:l.missing,detail:l.missingNote};case 'partial-signal':return {title:l.uncertain,detail:l.uncertainNote};case 'sustained-cardiorespiratory-rest':return {title:l.rest,detail:l.restNote};case 'symptom-emergency':return {title:l.emergency,detail:l.emergencyNote};case 'poor-quality':return {title:l.warn,detail:l.missingNote};case 'no-record':return {title:'',detail:''};default:return {title:'',detail:''};}}
// Shared time-window correlation. Input timestamps, NOT labels or day averages,
// establish overlap. A chronological association does NOT prove causation.
function timeLinked(heart=[],breath=[],sleep=[],energy=[],options={}){
 const bucket=Number(options.bucketMs)||60000;
 const byTime=items=>{const m=new Map();for(const x of items){
  const t=Date.parse(x?.at||x?.time||'');if(!Number.isFinite(t)||x.valid===false||x.quality===false)continue;
  const bin=Math.floor(t/bucket),prev=m.get(bin)||[];prev.push(x);m.set(bin,prev);
 }return m;};
 const h=byTime(heart),b=byTime(breath),sl=byTime(sleep),en=byTime(energy);
 const bins=[...new Set([...h.keys(),...b.keys(),...sl.keys(),...en.keys()])].sort((a,b)=>a-b);
 const overlapping=bins.filter(k=>h.has(k)&&b.has(k)&&sl.has(k));
 return {observedBins:bins.length,cardioSleepBins:overlapping.length,
  cardioSleepPeriods:overlapping.map(x=>new Date(x*bucket).toISOString()),
  nextDayEnergyAvailable:[...en.keys()].some(k=>[...sl.keys()].some(s=>k>s&&k-s<=(86400000/bucket))),
  causationEstablished:false,missingTimeSeries:!h.size||!b.size||!sl.size};
}
const live=[];let latest=null;
root.addEventListener('dp132-reading',ev=>{
 const d=ev.detail;if(!d||state.dog!==0||state.emptyPreview)return;
 live.push({...d,motionPresent:false});if(live.length>600)live.shift();
 // motion flags in the vendor B0 frame are NOT validated as movement;
 // we cannot trigger resting/tachypnea diagnosis without confirmed activity.
 latest=classify(live,{motionValidated:false});update();
});
function recentGaps(days){const n=Math.min(30,Math.max(1,Number(days)||1));if(state.dog<15||state.dog>=dogs.length)return 0;
 const start=30-n;return Array.from({length:n},(_,i)=>qualityForDay(start+i,state.dog)).filter(x=>x?.reasons?.includes('detached')).length;}
function update(){
 if(state.emptyPreview||!['deep','home'].includes(state.tab))return;
 const rootEl=document.querySelector('#app .app-pad');if(!rootEl)return;
 rootEl.querySelectorAll('.dp132-signal-note').forEach(n=>n.remove());
 const l=lang(),days=state.tab==='deep'?([1,7,30].includes(Number(state.range))?Number(state.range):1):1;
 let note=null,severity='unknown';
 if(state.dog===0&&latest&&latest.kind!=='valid'&&latest.kind!=='insufficient'&&latest.kind!=='insufficient-context'){
  note=message(latest);severity=latest.severity;
 }else if(state.dog>=15&&state.dog<dogs.length){
  const gaps=recentGaps(days);
  if(gaps){note=days===1?{title:l.missing,detail:l.missingNote}:{title:l.period,detail:l.gaps(gaps)};severity='unknown';}
 }
 if(!note?.title)return;
 const el=document.createElement('section');el.className='dp132-signal-note card';el.dataset.dp132Severity=severity;
 const heading=document.createElement('strong');heading.textContent=note.title;
 const text=document.createElement('p');text.textContent=note.detail;el.append(heading,text);
 const anchor=rootEl.querySelector('.dp130-sync')||rootEl.querySelector('.dp-owner-deep')||rootEl.querySelector('.dp-home-summary');
 if(anchor?.parentElement===rootEl)anchor.insertAdjacentElement('afterend',el);else rootEl.insertBefore(el,rootEl.firstElementChild);
}
const originalRender=render;
render=function(...args){const ret=originalRender.apply(this,args);try{update();root.DeepPetBuildVersion='10.139';document.querySelectorAll('#app .app-build-version').forEach(el=>{el.textContent=el.textContent.replace(/10\.13[0-8]/g,'10.139')});}catch(e){console.warn('DP132 UI',e);}return ret;};
root.DeepPetSignalGuard132=Object.freeze({version:'10.132',evalOne,classify,message,recentGaps,timeLinked,liveSnapshot:()=>({count:live.length,latest})});
})(window);
