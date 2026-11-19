/* DeepPet V10.65 — exact verified-second evidence, no fictional interpolation.
 * Daily health scores have no authority to create emergency episodes. */
(function(root){'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:
  state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fullTime=(date,sec)=>`${date} ${String(Math.floor(sec/3600)).padStart(2,'0')}:${String(Math.floor(sec%3600/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
 const metricName=k=>k==='heart'?L('心率','Heart rate','心拍数','심박수'):L('呼吸','Breathing','呼吸数','호흡수');
 const unit=k=>k==='heart'?'bpm':L('次／分','/min','回／分','회/분');
 const metricText=(o)=>`${metricName(o.kind)}${o.type==='high'?L('突然升至',' suddenly rose to ','急に上昇',' 급상승 '):L('突然降至',' suddenly dropped to ','急に低下',' 급하강 ')}${o.value} ${unit(o.kind)}`;
 const rapidEvents=()=>{
  const id=typeof dpCurrentPetId==='function'?String(dpCurrentPetId()):null;
  return id&&Array.isArray(state.dpRapidEventsByPet?.[id])?state.dpRapidEventsByPet[id]:[];
 };
 // Pure renderer: no samples are synthesized. Each x coordinate is based on
 // the recorded epoch millisecond; the final ring is exactly the event point.
 function chartMarkup(event,kind){
  const samples=Array.isArray(event?.evidence)?event.evidence.filter(x=>
   Number.isInteger(x.at)&&Number.isFinite(x[kind])&&x[kind]>0&&x.at<=event.at):[];
  if(samples.length<2)return '';
  const relevant=event.observations.find(x=>x.kind===kind);
  const center=Number.isFinite(relevant?.baseline)?relevant.baseline:null;
  const vals=samples.map(x=>x[kind]);if(center!==null)vals.push(center);
  const lo=Math.max(0,Math.min(...vals)-Math.max(2,(Math.max(...vals)-Math.min(...vals))*.15));
  const hi=Math.max(...vals)+Math.max(2,(Math.max(...vals)-Math.min(...vals))*.15);
  const start=samples[0].at,end=samples.at(-1).at;
  if(end<=start||hi<=lo)return '';
  const x=t=>36+(t-start)/(end-start)*360;
  const y=v=>141-(v-lo)/(hi-lo)*110;
  const points=samples.map(row=>`${x(row.at).toFixed(2)},${y(row[kind]).toFixed(2)}`).join(' ');
  const peak=samples.find(row=>row.at===event.at);
  const point=peak?`<circle class="dp1065-event-halo" cx="${x(peak.at).toFixed(2)}" cy="${y(peak[kind]).toFixed(2)}" r="8"/><circle class="dp1065-event-dot" cx="${x(peak.at).toFixed(2)}" cy="${y(peak[kind]).toFixed(2)}" r="3.2"/>`:'';
  const reference=center===null?'':`<line class="dp1065-base-line" x1="36" x2="396" y1="${y(center).toFixed(2)}" y2="${y(center).toFixed(2)}"/>`;
  // Match the alert's recorded LOCAL date/second instead of converting the
  // epoch into UTC with toISOString(); the latter can be off by many hours.
  const localClock=t=>new Date(Date.parse(event.date+'T00:00:00Z')+
   event.localSecond*1000+(t-event.at)).toISOString().replace('T',' ').slice(0,19);
  const label=metricName(kind),firstFull=localClock(start),lastFull=localClock(end);
  const first=firstFull.slice(11),last=lastFull.slice(11);
  return `<div class="dp1065-measured-plot"><div class="dp1065-plot-title">${esc(label)} (${esc(unit(kind))}) · ${L('逐秒量測','Verified second-by-second','秒単位の実測','초 단위 실측')}</div><svg viewBox="0 0 440 182" role="img" aria-label="${esc(label+' '+firstFull+' — '+lastFull+'; '+(relevant?.value??''))}"><line x1="36" x2="396" y1="141" y2="141" stroke="#aeb9c4"/><line x1="36" x2="36" y1="25" y2="141" stroke="#aeb9c4"/>${reference}<polyline class="dp1065-measured-trace" points="${points}"/>${point}<text x="4" y="31">${hi.toFixed(0)}</text><text x="4" y="142">${lo.toFixed(0)}</text><text x="36" y="163">${first}</text><text x="396" y="163" text-anchor="end">${last}</text><text x="216" y="180" text-anchor="middle">${L('時間','Time','時刻','시간')}</text></svg></div>`;
 }
 function evidencePanel(event){
  const observations=event.observations.filter(x=>['heart','breath'].includes(x.kind));if(!observations.length)return '';
  const heading=observations.map(metricText).join(' · '),time=fullTime(event.date,event.localSecond),
   personal=event.phase==='personalized_14day';
  const references=observations.map(o=>`${metricName(o.kind)} ${o.baseline} ${unit(o.kind)}${personal&&Number.isFinite(o.reference14day)?' · '+L('14天同情境','14-day same-context','14日間同条件','14일 동일 상황')+' '+o.reference14day:''}`).join(' / ');
  const charts=observations.map(o=>chartMarkup(event,o.kind)).filter(Boolean).join('');
  const available=event.evidence?.length>=2;
  const timeLabel=Number.isFinite(event.timezoneOffsetMinutes)?
   L('突發變化 · 時間已核對','Sudden change · verified local time','急変・現地時刻確認済み','급변 · 현지 시간 확인'):
   L('突發變化 · 設備回報時間','Sudden change · device-reported time','急変・機器報告時刻','급변 · 기기 보고 시간');
  return `<section class="card dp1065-evidence-card" aria-label="${L('應急變化量測證據','Verified anomaly evidence','急変の測定証拠','급변 측정 근거')}"><div class="dp1065-tag">${timeLabel}</div><h2>${esc(heading)}</h2><time datetime="${event.date}T${time.split(' ')[1]}">${esc(time)}</time><p class="dp1065-reference">${L('比對基準','Reference','比較基準','비교 기준')}：${esc(references)} <span>(${personal?L('14天個體基準','14-day personal baseline','14日間の個体基準','14일 개체 기준'):L('建立基準前：先前安靜量測','Before 14 days: prior quiet readings','14日未満：安静時の事前測定','14일 전: 이전 안정 측정')})</span></p>${charts||`<p class="dp1065-unavailable">${L('本事件有核對數值，但未保存完整逐秒曲線；不會補造波形。','A verified event value exists, but a full per-second trace was not retained; no curve is fabricated.','値は確認済みですが秒単位の曲線は保存されていません。','측정값은 확인됐지만 초 단위 곡선이 저장되지 않았습니다.')}</p>`}<details class="dp1065-disclosure"><summary>${L('判斷依據與注意事項','Method and limitations','判定根拠と注意事項','판정 근거 및 주의')}</summary><p>${L('已排除無效佩戴訊號、行走及運動後恢復情境；這是生理指標突變提示，不能確診窒息、心臟病或呼吸停止。如寵物有呼吸費力、倒下或牙齦發藍，請立即聯絡急診獸醫。','Poor fit, activity and post-exercise recovery are excluded. This is a vital-change notice, not a diagnosis of choking, heart disease or apnea. Seek emergency veterinary help for labored breathing, collapse or blue gums.','装着状態と活動を確認していますが、診断ではありません。呼吸困難や失神時は緊急受診してください。','착용 상태와 활동을 확인하지만 질병 진단이 아닙니다. 호흡 곤란이나 실신 시 응급 진료를 받으세요.')}</p></details></section>`;
 }
 function enhance(){
  if(state.tab!=='deep'||state.detail!=='dp90-waveform')return;
  const f=state.dp1059AlertFocus;if(!f||f.pet!==state.dog||!Number.isInteger(f.second))return;
  const event=rapidEvents().find(e=>e.source==='rapid'&&e.date===f.date&&
   e.localSecond===f.minute*60+f.second&&e.observations.some(o=>o.kind===f.kind));
  if(!event)return;
  const app=document.getElementById('app');if(!app||app.querySelector('.dp1065-evidence-card'))return;
  const parent=app.querySelector('.app-pad');if(!parent)return;
  const node=document.createElement('div');node.innerHTML=evidencePanel(event);
  const card=node.firstElementChild;if(!card)return;
  const header=parent.querySelector('.dp-independent-head,.dp932-wave-header,.back-btn');
  if(header)header.after(card);else parent.prepend(card);
  // The earlier minute-chart caption duplicates the new exact event verdict.
  // Preserve its minute highlight while removing the repeated prose/peer link
  // (both measured channels are already graphed above).
  app.querySelectorAll('.dp1059-focus-label').forEach(el=>el.remove());
  // The pre-existing all-day chart marks the CONTAINING MINUTE; this card
  // draws the actual second-by-second measurement and circles the true point.
 }
 const previousRender=render;
 render=function(...args){const res=previousRender.apply(this,args);enhance();return res;};
 root.DeepPetUX1065=Object.freeze({version:'10.65',chartMarkup,evidencePanel,enhance});
})(window);
