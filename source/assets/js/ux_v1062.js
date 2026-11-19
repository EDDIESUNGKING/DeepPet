/* V10.62: owner-isolated verified seconds events. Home displays only the
 * current pet's observed events, independent of their daily average score.
 * Alerts inside this WebApp do not constitute background phone push service. */
(function(root){'use strict';
 const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ja'?ja:state.lang==='ko'?ko:
  state.lang==='zh'&&typeof toSimplified==='function'?toSimplified(tw):tw;
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const names={heart:()=>L('心率','Heart rate','心拍数','심박수'),breath:()=>L('呼吸','Breathing','呼吸数','호흡수')};
 const datePattern=/^\d{4}-\d{2}-\d{2}$/;
 const hhmmss=sec=>`${String(Math.floor(sec/3600)).padStart(2,'0')}:${String(Math.floor(sec%3600/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
 function capture(candidate){
  if(candidate?.source!=='verified_second_stream'||candidate.verifiedRate!==true||
   !['rest','sleep'].includes(candidate.context)||!datePattern.test(candidate.date||'')||
   !Number.isInteger(candidate.localSecond)||candidate.localSecond<0||candidate.localSecond>=86400||
   !Number.isInteger(candidate.at)||candidate.at%1000!==0||!candidate.petId||
   !Number.isInteger(candidate.secondsConfirmed)||candidate.secondsConfirmed<4||candidate.secondsConfirmed>20||
   !Array.isArray(candidate.observations)||!candidate.observations.length)return false;
  const observations=candidate.observations.filter(x=>['heart','breath'].includes(x.kind)&&
   ['high','low'].includes(x.type)&&Number.isFinite(x.value)&&x.value>0&&
   Number.isFinite(x.baseline)&&x.baseline>0&&Number.isFinite(x.threshold)&&x.threshold>0);
  if(!observations.length||observations.length!==candidate.observations.length||observations.length>2||
   new Set(observations.map(x=>x.kind)).size!==observations.length)return false;
  // Only preserve an original, consecutive, verified-second segment whose
  // final timestamp is exactly the triggering sample. Nothing is fabricated.
  const evidence=Array.isArray(candidate.evidence)?candidate.evidence.filter(x=>x&&
   Number.isInteger(x.at)&&x.at%1000===0&&x.at<=candidate.at&&candidate.at-x.at<24000&&
   (x.heart===null||Number.isFinite(x.heart)&&x.heart>0)&&
   (x.breath===null||Number.isFinite(x.breath)&&x.breath>0)).slice(-24):[];
  // A newly published emergency event must bring its own source segment;
  // a number or a claim of six seconds without six recorded seconds is not
  // independently auditable. Legacy stored alerts are not rewritten here.
  if(!Array.isArray(candidate.evidence)||evidence.length<candidate.secondsConfirmed||
   evidence.length!==candidate.evidence.length)return false;
  if(evidence.some((x,i)=>i>0&&x.at!==evidence[i-1].at+1000)||
   evidence.length&&evidence.at(-1).at!==candidate.at)return false;
  if(evidence.length&&observations.some(o=>!Number.isFinite(evidence.at(-1)[o.kind])||
   Math.abs(evidence.at(-1)[o.kind]-o.value)>.11))return false;
  // Prove the claimed consecutive triggering seconds, rather than merely
  // matching the LAST numerical point. Rates are saved to 0.1 precision;
  // a 0.11 margin covers storage rounding, not a different state.
  const confirming=evidence.slice(-candidate.secondsConfirmed);
  if(observations.some(o=>confirming.some(row=>!Number.isFinite(row[o.kind])||
   (o.type==='high'?row[o.kind]<o.threshold-.11:row[o.kind]>o.threshold+.11))))return false;
  // Native epoch and local displayed time must describe the same instant
  // whenever the bridge supplies its device timezone. Never silently attach
  // a measured value to an unrelated wall-clock time.
  const offset=candidate.timezoneOffsetMinutes;
  if(offset!==undefined&&offset!==null){
   if(!Number.isFinite(offset)||offset< -720||offset>840)return false;
   const localMs=candidate.at+offset*60000,localDate=new Date(localMs);
   if(!Number.isFinite(localDate.getTime())||localDate.toISOString().slice(0,10)!==candidate.date||
    Math.floor(((localMs%86400000)+86400000)%86400000/1000)!==candidate.localSecond)return false;
  }
  const id=String(candidate.petId),byPet=state.dpRapidEventsByPet||(state.dpRapidEventsByPet={});
  const list=Array.isArray(byPet[id])?byPet[id]:[];
  // Merge only truly simultaneous observations. Two separate sudden changes
  // even eight seconds apart have different source evidence and timestamps.
  const recent=list.find(e=>e.at===candidate.at&&e.date===candidate.date&&
   e.localSecond===candidate.localSecond&&e.context===candidate.context);
  const event={source:'rapid',petId:id,date:candidate.date,localSecond:candidate.localSecond,
   at:candidate.at,context:candidate.context,timezoneOffsetMinutes:Number.isFinite(offset)?offset:null,
   phase:candidate.phase,secondsConfirmed:candidate.secondsConfirmed,observations,evidence};
  if(recent){
   for(const obs of observations)if(!recent.observations.some(x=>x.kind===obs.kind&&x.type===obs.type))recent.observations.push(obs);
   if(evidence.length>recent.evidence?.length){recent.evidence=evidence;recent.at=candidate.at;recent.localSecond=candidate.localSecond;}
  }else list.unshift(event);
  // Retain a bounded 30-day evidence history for the owner's 7/30-day review.
  // Offline sync may deliver an older verified incident after a newer one.
  // Retention is relative to the newest observed instant, not upload order.
  const newest=Math.max(candidate.at,...list.map(e=>Number.isFinite(e.at)?e.at:-Infinity));
  byPet[id]=list.filter(e=>Number.isFinite(e.at)&&e.at<=newest&&newest-e.at<=30*86400000)
   .sort((a,b)=>b.at-a.at).slice(0,96);
  if(typeof persist==='function')persist();
  if(state.tab==='home'&&typeof render==='function'&&String(typeof dpCurrentPetId==='function'?dpCurrentPetId():'')===id)render(false);
  return true;
 }
 function forCurrentPet(date){
  if(state.emptyPreview===true||!datePattern.test(date||'')||
   typeof selectedBlank==='function'&&selectedBlank()||
   typeof dp58FreshPet==='function'&&dp58FreshPet()||
   typeof isFreePet==='function'&&isFreePet())return [];
  const id=typeof dpCurrentPetId==='function'?dpCurrentPetId():'';
  return (state.dpRapidEventsByPet?.[id]||[]).filter(e=>e.date===date&&e.petId===id&&e.source==='rapid'&&e.observations?.length)
   .sort((a,b)=>b.localSecond-a.localSecond);
 }
 function alertMarkup(e){
  // Two simultaneous drops open the heart curve first and offer an immediate
  // switch to the breathing curve at the SAME verified second and date.
  const obs=e.observations.slice(0,2).sort((a,b)=>(a.kind==='heart'?0:1)-(b.kind==='heart'?0:1));
  const primary=obs[0],other=obs.find(x=>x.kind!==primary.kind),minute=Math.floor(e.localSecond/60);
  const part=x=>`${names[x.kind]()}${x.type==='high'?L('突然升至',' suddenly rose to ','急に上昇',' 급상승 '):L('突然降至',' suddenly fell to ','急に低下',' 급하강 ')}${x.value} ${x.kind==='heart'?'bpm':L('次／分','/min','回／分','회/분')}`;
  const title=other?`${part(primary)} · ${part(other)}`:part(primary);
  return `<button type="button" class="dp936-alert-item dp1059-alert-item dp1062-acute-item" data-action="dp1059-alert-open" data-kind="${primary.kind}" data-date="${e.date}" data-minute="${minute}" data-second="${e.localSecond%60}" data-value="${primary.value}" data-peer="${other?.kind||''}" data-peer-value="${other?.value??''}" data-event-type="${primary.type}" aria-label="${escape(title+' · '+e.date+' '+hhmmss(e.localSecond))}"><span class="dp1059-alert-symbol" aria-hidden="true">!</span><span class="dp1059-alert-copy"><strong>${escape(title)}</strong><time datetime="${e.date}T${hhmmss(e.localSecond)}">${e.date} ${hhmmss(e.localSecond)}</time></span><span class="dp1059-alert-arrow" aria-hidden="true">›</span></button>`;
 }
 root.DeepPetUrgentEvents1062=Object.freeze({version:'10.62',capture,forCurrentPet,alertMarkup});
})(window);
