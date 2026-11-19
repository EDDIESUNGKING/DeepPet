/* V10.06: release-integrity audit helpers, no new screens or UI modules. */
(function(root){'use strict';
 const version='10.06';
 function selectedReportEvidence(index=state.dog){
  const records=root.dp914ReportRecords?.(index)||[];
  const profile={...(typeof allPets==='function'?allPets()[index]||{}:currentDog()),petId:String(index)};
  const today=typeof iso==='function'&&typeof localDate==='function'?iso(localDate()):new Date().toLocaleDateString('sv-SE');
  const assessment=root.DeepPetLabEvidence?.assess?.(records,profile,today)||null;
  return {petId:String(index),recordCount:records.length,assessable:Number.isFinite(assessment?.score),
    lastAssessableDate:assessment?.score!==null?assessment?.latest||null:null,
    pendingDate:assessment?.pendingLatest||null};
 }
 root.DeepPetUX1006={version:'10.06',selectedReportEvidence};
 root.DeepPetRelease={...root.DeepPetRelease,version,
  integrity:[...(root.DeepPetRelease?.integrity||[]),'fresh-lab-evidence-without-collar','persistent-owner-pet-identities']};
})(window);
