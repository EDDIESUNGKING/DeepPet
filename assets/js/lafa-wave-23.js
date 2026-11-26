/* LAFA post-2026-11-23 exhibition capture; same raw generator/decoder as every gallery pet. */
(function(root){'use strict';const date='2026-11-24',source='synthetic-waveform-lafa',profile={species:'dog',weight:55,age:6,hr:66,rr:18},cache=new Map();
function capture(day=date,keepRaw=false){if(typeof day==='boolean'){keepRaw=day;day=date;}if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||day<date)return null;if(cache.has(day)&&!keepRaw)return cache.get(day);const template=root.DeepPetRollingPreview?.lafaTemplate(day)||day;const phase=Math.floor(Date.parse(template+'T12:00:00Z')/86400000)%97;
const heart=[],breath=[],activity=[];
for(let i=0;i<1440;i++){const hour=i/60,quiet=hour<6.75||hour>=21||Math.abs(hour-12.5)<1.25||Math.abs(hour-16)<.65;
 let h=quiet?64:83,r=quiet?16:22,m=quiet?8:35;
 h+=3*Math.sin(i*.037+phase)+1.5*Math.sin(i*.17)+2*Math.sin(phase);r+=.9*Math.sin(i*.049+phase)+.5*Math.sin(phase);m+=4*Math.sin(i*.071+phase);
 for(const start of [445,830,1080]){const t=i-start;if(t>=0&&t<19){h=105+2*Math.sin(i*.15);r=29;m=74+5*Math.sin(i*.19);}else if(t>=19&&t<30){h=66+39*Math.exp(-(t-18)/2.9);r=17+12*Math.exp(-(t-18)/3.2);m=12;}}
 heart.push(h);breath.push(r);activity.push(m);}
 const raw=root.DeepPetRawWave143.generate({heart,breath,activity},Math.floor(Date.parse(template+'T12:00:00Z')/86400000)^20261124,profile),m=root.DeepPetRawWave143.measure(raw);const decoded={...m,date:day,source,previewSourceDate:template};cache.set(day,decoded);while(cache.size>45)cache.delete(cache.keys().next().value);return keepRaw?{...decoded,raw}:decoded;}
function rows(day=date){const s=capture(day);return s?root.DeepPetUnifiedDeep.fromSeries(day,s).map(r=>({...r,day,time:r.ts.slice(11),source})):[];}
function hrv(day=date){const h=root.DeepPetRawGallery143.hrvFromCapture(capture(day),day);if(!h)return null;return {...h,source,mode:'historical',start:day+'T'+new Date(h.beatTimesMs[0]).toISOString().slice(11,19),end:day+'T'+new Date(h.beatTimesMs.at(-1)).toISOString().slice(11,19)};}
root.DeepPetLafaWave23=Object.freeze({date,source,capture,rows,hrv});})(window);
