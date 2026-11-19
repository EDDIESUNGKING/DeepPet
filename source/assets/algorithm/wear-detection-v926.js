/* DeepPet V9.26: research candidate for joint heart/breath waveform loss.
   Not a medical detection system. Neither line becoming flat proves that the
   animal stopped breathing; a device/electrode/contact fault is also possible.
   Input: six consecutive two-second, 20 Hz signal windows with RMS features.
   Normally the first three establish a prior baseline and the last three are
   observation. A sustained dual-zero reading also permits a fit reminder
   when the session begins with no usable prior baseline.
*/
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetWearDetector926=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const validDate=x=>Number.isFinite(x)&&x>=0;
const rms=a=>Array.isArray(a)&&a.length?Math.sqrt(a.reduce((s,x)=>s+x*x,0)/a.length):null;
const median=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
function classify(input={}){
 const w=input.windows||[],reason=why=>({kind:'unavailable',reason:why,wearReminder:false,medicalEmergency:false});
 if(input.connected!==true)return reason('offline_or_unpaired');
 if(input.sampleRate!==20||input.timestampsValid!==true)return reason('sample_rate_or_time_invalid');
 if(!Array.isArray(w)||w.length<6)return reason('not_enough_windows');
 const x=w.slice(-6), duration=2000;
 const start=x.map(y=>y?.timestampMs);
 if(start.some(y=>!validDate(y))||start.some((v,i)=>i>0&&(v<=start[i-1]||Math.abs(v-start[i-1]-duration)>300)))return reason('non_contiguous_windows');
 const rows=[];
 for(const q of x){
  const h=q.heartWave,b=q.breathWave;
  if(!Array.isArray(h)||!Array.isArray(b)||h.length!==40||b.length!==40||h.some(v=>!finite(v))||b.some(v=>!finite(v)))return reason('missing_or_invalid_samples');
  rows.push({heart:rms(h),breath:rms(b)});
 }
 const baselineH=median(rows.slice(0,3).map(y=>y.heart)),baselineB=median(rows.slice(0,3).map(y=>y.breath));
 // The factory reports an invalid fit by dropping BOTH channels to zero.
 // A newly started session has no stable pre-drop baseline; still show a
 // re-wear/connection prompt after three consecutive zero windows (6 seconds).
 // This must never become a physiological arrest or a zero health score.
 const dualZero=rows.slice(3).every(y=>y.heart<=1e-7&&y.breath<=1e-7);
 if(baselineH<0.04||baselineB<0.04){
  if(dualZero)return {kind:'zero_signal_refit',reason:'dual_wave_zero_without_baseline',wearReminder:true,signalUnavailable:true,medicalEmergency:false};
  return reason('no_stable_baseline');
 }
 // Simultaneous abrupt amplitude loss, sustained across three whole windows.
 // The two near-zero checks use BOTH relative and absolute limits.
 const bothLow=rows.slice(3).every(y=>y.heart<=Math.min(.025,baselineH*.08)&&y.breath<=Math.min(.025,baselineB*.08));
 const baseStable=rows.slice(0,3).every(y=>y.heart>=baselineH*.5&&y.breath>=baselineB*.5);
 if(!baseStable)return reason('unstable_baseline');
 if(bothLow)return {kind:'possible_loose_collar',reason:dualZero?'dual_wave_zero':'dual_wave_abrupt_loss',wearReminder:true,signalUnavailable:true,medicalEmergency:false,heartBaseline:baselineH,breathBaseline:baselineB};
 const oneLow=rows.slice(3).every(y=>y.heart<=baselineH*.08)||rows.slice(3).every(y=>y.breath<=baselineB*.08);
 return {kind:oneLow?'signal_issue':'normal',reason:oneLow?'single_channel_change':'waves_present',wearReminder:false,medicalEmergency:false};
}
function synthetic(){const windows=[];for(let k=0;k<6;k++){
 const off=k>=3,heartWave=[],breathWave=[];
 for(let i=0;i<40;i++){const t=(k*40+i)/20;heartWave.push(off?0.0001*Math.sin(t):0.7*Math.sin(2*Math.PI*1.35*t));breathWave.push(off?0.0001*Math.cos(t):0.55*Math.sin(2*Math.PI*.25*t));}
 windows.push({timestampMs:1700000000000+k*2000,heartWave,breathWave});
 }return {connected:true,sampleRate:20,timestampsValid:true,windows};}
return {version:'9.26',classify,synthetic};
});
