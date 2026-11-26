/* Latest available HRV display. Historical readings are not today's new observations. */
(function(root){'use strict';const prior=render;
function latestGallery(pet,date){const api=root.DeepPetRawGallery143;if(!api)return null;const rows=demoRecords(pet).filter(r=>r.date===date).sort((a,b)=>b.date.localeCompare(a.date));for(const row of rows){const h=api.hrv(pet,row.date);if(h)return {...h,measurementDate:row.date};}return null;}
root.DeepPetLatestAvailableHRV=Object.freeze({gallery:latestGallery,policy:root.DeepPetHrvWindowPolicy});
render=function(){const ret=prior.apply(this,arguments);try{
 if(state.tab!=='deep'||state.detail||state.deepType!==0||Number(state.range)!==1||state.emptyPreview||selectedBlank())return ret;
 const date=state.deepSelectedDate||deepChosenDate(),pet=state.dog;if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return ret;
 const card=document.querySelector('.app-main [data-dp903-metric="hrv"]');if(!card)return ret;
 const host=card.querySelector('.dp903-metric-left')||card;let h=null;
 if(pet===0){const v=root.DeepPetMiloAdaptiveScores.dayScores(date)?.unified?.hrv;if(v)h={...v,measurementDate:date};}
 else if(!dpUsesRealMeasurements(pet))h=latestGallery(pet,date);
 else{const rows=root.DeepPetSignalScoring?.getFeatures(pet)||[];const r=rows.filter(r=>r?.date===date&&r.quality?.hrvValid&&r.hrvWindow?.qualified).sort((a,b)=>b.hrvWindow.end.localeCompare(a.hrvWindow.end))[0];if(r)h={...r.hrvWindow,measurementDate:r.date,qualified:true};}
 if(!h||(h.measurementDate&&h.measurementDate!==date)||!Number.isFinite(h.rmssd)||!Number.isFinite(h.sdnn))return ret;
 const measurement=h.measurementDate||String(h.end||'').slice(0,10)||date,old=measurement!==date;
 const note=document.createElement('p');note.dataset.hrvBacktrack='';note.className='dp-observation-note';note.style.cssText='font-size:11px;line-height:1.45;color:#67758a;overflow-wrap:anywhere;';
 const end=String(h.end||'').replace('T',' '),start=String(h.start||'').replace('T',' '),duration=h.minutes??h.windowMinutes??null;
 const v=`RMSSD ${h.rmssd.toFixed(1)} ms · SDNN ${h.sdnn.toFixed(1)} ms`;
 const lang=state.lang, labels=lang==='en'?['Latest available historical HRV','Selected HRV window','min','Estimate','valid','min; gaps excluded']:lang==='ko'?['최근 과거 HRV','HRV 계산 구간','분','추정','유효','분; 누락 구간 제외']:lang==='zh'?['最近一次历史HRV','HRV计算时段','分钟','估算','有效','分钟，缺口已排除']:['最近一次歷史HRV','HRV計算時段','分鐘','估算','有效','分鐘，缺口已排除'];
 const copy=`${labels[old?0:1]}: ${start||measurement} – ${end} · ${duration??'—'} ${labels[2]}${old?' · '+v:''}${h.qualified===false?' · '+labels[3]:''}`;
 note.textContent=copy+(Number.isFinite(h.validMinutes)&&h.segmented?` · ${labels[4]} ${h.validMinutes.toFixed(2)} ${labels[5]}`:'');host.querySelector('[data-hrv-backtrack]')?.remove();host.append(note);
 }catch(e){console.error('HRV historical provenance',e);}return ret;};
})(window);
