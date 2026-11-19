/* V9.20: synthetic report records solely for demonstrating broad and narrow abnormal patterns. */
(function(root){'use strict';
const ranges={WBC:[5.5,16.9],RBC:[5.5,8.5],HGB:[120,180],HCT:[37,55],MCV:[60,77],MCH:[19,25],MCHC:[320,360],PLT:[170,500],ALT:[10,100],AST:[10,50],ALP:[20,150],ALB:[26,40],GLOB:[20,40],TP:[52,78],GLU:[3.9,7.8],BUN:[2.5,9.6],CREA:[44,159],Na:[140,155],K:[3.6,5.5],Cl:[105,120],Ca:[2.15,2.85],P:[.8,2.1],CHOL:[2.8,8],TBIL:[0,9],CK:[20,200],CRP:[0,10]};
// Ranges for illustrative ADULT CANINE comparison only; not substitutes for lab-specific or feline intervals.
function enrich(row,pet,date,rank){const n=String(row.name||'').toUpperCase(),range=ranges[n];if(!range)return {...row,date};
 const species=String((typeof allPets==='function'?allPets()[pet]:null)?.species||'dog').toLowerCase();
 if(species==='cat')return {...row,date,status:'unknown'};
 const [lo,hi]=range,width=hi-lo,raw=Number(row.value);const severity=[0,.05,.12,.33,.42,.68,.85,1.1][pet%8];
 let value=Number.isFinite(raw)?raw:(lo+hi)/2;
 // Cohort patterns vary by pet and report date: normal, scattered mild, many moderate, and extreme outlier.
 const affected=pet%8===0?false:pet%8===1?((n.length+rank)%9===0):pet%8===2?((n.length+rank)%5===0):pet%8>=5?((n.length+rank)%3!==0):((n.length+rank)%4===0);
 if(affected){value=hi+width*severity*(1+(n.charCodeAt(0)%3)*.25); if((n.charCodeAt(0)+pet)%4===0)value=lo-width*severity;}
 else value=Math.min(hi-.04*width,Math.max(lo+.04*width,value));
 return {...row,date,value:+value.toFixed(2),status:'unknown',referenceLow:lo,referenceHigh:hi,referenceUnit:row.unit,referenceSpecies:'dog',referenceLifeStage:'adult',referenceSource:'illustrative_adult_canine',verifiedByVet:false};}
 root.DeepPetExamFixture={enrich};
})(typeof window==='object'?window:globalThis);
