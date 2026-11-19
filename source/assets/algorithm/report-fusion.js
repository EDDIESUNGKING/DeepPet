/* DeepPet 9.17 | Shared laboratory evidence fused into BCG wellness trends.
 * Never boosts a BCG abnormality merely because other lab values are normal.
 * Laboratory references are source/method/species/age specific, and must be entered.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DeepPetReportFusion=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
const finite=x=>typeof x==='number'&&Number.isFinite(x);
function fuse(base,records=[],date,profile={}){
 if(!base)return null;
 const L=(typeof DeepPetLabEvidence!=='undefined'?DeepPetLabEvidence:null);
 if(!L)return {...base,reportEvidence:{present:false,applied:false,reason:'no_lab_engine'}};
 const exam=L.assess(records,profile,date||base.date);
 if(exam.score===null){return {...base,reportEvidence:{...exam,applied:false,bcgScores:{...(base.scores||{})},reason:exam.reason}};}
 const origin=base.scores||{};
 // The sensor branches remain sensor-only. A lab report is blended only once in
 // score-integrity, avoiding double subtraction and hidden reweighting of HRV/rhythm.
 const recency=exam.daysOld<=0?1:Math.exp(-Math.log(13)*exam.daysOld/365);
 const numeric=exam.records.filter(x=>x.kind==='numeric').length;
 const evidenceQuality=exam.count?numeric/exam.count:0;
 const trusted=exam.records.some(x=>x.verifiedByVet===true);
 const coverageFactor=Math.min(1,Math.max(.35,(exam.coverage||0)/60));
 const reliability=recency*evidenceQuality*coverageFactor*(trusted?1:.85);
 const potentialWeight=clamp(.65*reliability,0,.65);
 const reportWeight=exam.score<90?potentialWeight:0;
 const scores={...origin};
 const grade=x=>x>=90?'Healthy':x>=80?'Mild':x>=60?'Moderate':'Risk';
 return {...base,scores,grade:Object.fromEntries(Object.entries(scores).filter(([,v])=>finite(v)).map(([k,v])=>[k,grade(v)])),reportEvidence:{...exam,applied:exam.score<90&&reportWeight>0,weight:Math.round(reportWeight*10000)/10000,potentialWeight:Math.round(potentialWeight*10000)/10000,reportIndex:exam.score,recencyFactor:recency,examDate:exam.latest,bcgScores:origin,scoreDelta:0,confidence:trusted?'reviewed':'provisional'}};
}
function normalize(entries,day,profile={}){const L=typeof DeepPetLabEvidence!=='undefined'?DeepPetLabEvidence:null;return L?L.assess(entries,profile,day):{present:false};}
function evidenceIndex(alerts){const L=typeof DeepPetLabEvidence!=='undefined'?DeepPetLabEvidence:null;return L?L.assess(alerts.map(x=>({...x,date:x.date||new Date().toISOString().slice(0,10)})),{},new Date().toISOString().slice(0,10)).score:null;}
return {version:'9.17',normalize,evidenceIndex,fuse,domain:name=>(typeof DeepPetLabEvidence!=='undefined'?DeepPetLabEvidence.family(name):'blood'),labFamily:name=>(typeof DeepPetLabEvidence!=='undefined'?DeepPetLabEvidence.family(name):'blood')};
});
