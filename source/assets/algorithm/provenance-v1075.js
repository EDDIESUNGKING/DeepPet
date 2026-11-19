/* DeepPet V10.75 — verified ownership, timestamp, wear and coverage metadata.
 * Display-only provenance. It never estimates a missing physiological reading.
 */
(function(root){'use strict';
 const store=new Map(),DATE=/^\d{4}-\d{2}-\d{2}$/;
 const key=(petId,date,kind)=>`${petId}|${date}|${kind}`;
 const numeric=v=>typeof v==='number'&&Number.isFinite(v);
 const safeId=value=>Number.isInteger(Number(value))?Number(value):null;
 function inspect({petId,date,kind,verifiedWear,payload}){
  const id=safeId(petId),object=payload&&!Array.isArray(payload)&&typeof payload==='object'?payload:null;
  const values=Array.isArray(payload)?payload:object?.values;
  const sampleCount=Array.isArray(values)?values.length:0;
  const validCount=Array.isArray(values)?values.filter(v=>numeric(v)&&(!['heart','breath'].includes(kind)||v>0)).length:0;
  const matchingPet=!object||object.petId===undefined&&object.pet===undefined||safeId(object.petId??object.pet)===id;
  const matchingDate=!object||object.date===undefined||object.date===date;
  const matchingKind=!object||object.kind===undefined||object.kind===kind;
  const source=object?.source||'sdk-bridge-legacy';
  const sourceTrusted=!/demo|mock|sample|showcase|fixture/i.test(String(source));
  const quality=object?.quality||{};
  const qualityAccepted=quality.wearValid!==false&&quality.signalValid!==false&&quality.wearQuality!=='poor'&&quality.signalQuality!=='poor';
  const minuteCoverage=sampleCount===1440?validCount/1440:Math.min(validCount,1440)/1440;
  const valid=DATE.test(String(date))&&id!==null&&verifiedWear===true&&matchingPet&&matchingDate&&matchingKind&&sourceTrusted&&qualityAccepted&&sampleCount===1440&&validCount===1440;
  const reason=valid?'verified':verifiedWear!==true?'wear-not-verified':!matchingPet?'pet-mismatch':!matchingDate?'date-mismatch':!matchingKind?'kind-mismatch':!sourceTrusted?'synthetic-source':!qualityAccepted?'quality-rejected':sampleCount!==1440?'minute-coverage-incomplete':'invalid-minute-values';
  const identityAssurance=object&&object.petId!==undefined&&object.date!==undefined&&object.kind!==undefined?'payload-verified':'bridge-request-only';
  const info=Object.freeze({petId:id,date,kind,source,valid,reason,verifiedWear:verifiedWear===true,validMinutes:validCount,totalMinutes:1440,coveragePct:Math.round(minuteCoverage*100),identityAssurance,
   timestampMode:object?.minuteTimestamps?'explicit':'minute-index',wearQuality:quality.wearQuality??(verifiedWear===true?'verified':'unverified'),signalQuality:quality.signalQuality??(quality.signalValid===false?'invalid':'not-declared')});
  store.set(key(id,date,kind),info);
  // Bound the metadata cache: it contains no raw waveforms or sensitive photos.
  if(store.size>360){const first=store.keys().next().value;store.delete(first);}
  return {values:valid?values.slice():[],meta:info};
 }
 function missing(petId,date,kind,reason='minute-coverage-unavailable'){
  const id=safeId(petId);
  const info=Object.freeze({petId:id,date,kind,source:'none',valid:false,reason,verifiedWear:false,validMinutes:0,totalMinutes:1440,coveragePct:0,identityAssurance:'unverified',timestampMode:'none',wearQuality:'unverified',signalQuality:'not-declared'});
  store.set(key(id,date,kind),info);return info;
 }
 const get=(petId,date,kind)=>store.get(key(safeId(petId),date,kind))||null;
 root.DeepPetDataProvenance1075=Object.freeze({version:'10.75',inspect,missing,get});
})(window);
