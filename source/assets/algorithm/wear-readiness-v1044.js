/* DeepPet V10.44: contact-signal settling gate for the 20 Hz SDK.
 * Measurement packets start arriving immediately. A transient waveform after
 * a collar is fitted or re-fitted is not instantly declared a reliable vital
 * measurement. This only validates continuity and observable signal presence;
 * it cannot establish a diagnosis or prove that a collar is physically worn.
 *
 * Proposed engineering settings (not claims about other manufacturers):
 * - 2-second quality windows; 6 consecutive good windows (12 seconds) before
 *   signal is considered settled, also after a contact loss.
 * - 2 consecutive invalid windows (4 seconds) to mark signal unavailable.
 * - A single noisy window does not trigger an immediate wear-loss warning.
 * - Physiological scores additionally require the factory/BCG metric-quality
 *   validation: waveform presence alone cannot create a vital sign.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetWearReadiness1044=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const FIN=x=>typeof x==='number'&&Number.isFinite(x);
function waveformPresent(values){
 if(!Array.isArray(values)||values.length!==40||values.some(x=>!FIN(x)))return false;
 const min=Math.min(...values),max=Math.max(...values);
 // This is ONLY a near-flat / missing-channel guard, not an HR/RR classifier.
 return max-min>1e-6;
}
function create(options={}){
 const required=Math.max(3,Math.min(30,Math.trunc(options.goodWindows||6)));
 const allowedGapMs=options.allowedGapMs??350;
 let good=0,bad=0,lastMs=null,status='awaiting_signal',seq=0;
 function reset(kind='awaiting_signal'){
  good=0;bad=0;lastMs=null;status=kind;
  return snapshot();
 }
 function snapshot(extra={}){return Object.freeze({status,settled:status==='settled',goodWindows:good,badWindows:bad,secondsToSettle:Math.max(0,(required-good)*2),sequence:seq,...extra});}
 function update(input={}){
  if(input.connected!==true){seq++;return reset('signal_unavailable');}
  if(!FIN(input.timestampMs)){seq++;return reset('awaiting_signal');}
  if(lastMs!==null&&(input.timestampMs<=lastMs||Math.abs(input.timestampMs-lastMs-2000)>allowedGapMs)){
   good=0;bad=0;status='stabilizing';
  }
  lastMs=input.timestampMs;seq++;
  // Even when SDK quality is affirmatively accepted, a flat or missing raw
  // channel must not be promoted to a reliable signal. A scalar HR/RR of
  // zero is NEVER interpreted as medical arrest by this gate.
  const valid=input.qualityAccepted!==false&&
   waveformPresent(input.heartWave)&&waveformPresent(input.breathWave);
  if(valid){
   bad=0;good=Math.min(required,good+1);
   status=good>=required?'settled':'stabilizing';
  }else{
   bad++;
   if(bad>=2){good=0;status='signal_unavailable';}
   else {good=Math.max(0,good-1);status='checking_signal';}
  }
  return snapshot({metricsEligible:status==='settled'&&input.metricsVerified===true});
 }
 return Object.freeze({update,reset,snapshot});
}
return Object.freeze({version:'10.44',create,waveformPresent});
});
