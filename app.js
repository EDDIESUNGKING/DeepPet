/* DeepPet V8.54 — static Heart Moment runtime configuration.
   The full existing APP and Heart Moment implementation live in assets/js/. */
(function(){'use strict';
 const bands=[{min:90,key:'happy',color:'#66e7aa'},{min:80,key:'calm',color:'#6ac0ff'},{min:60,key:'soft',color:'#ffbc68'},{min:0,key:'sad',color:'#ff8592'}];
 window.DeepPetStaticHeart=Object.freeze({
  version:'8.69',
  measurementSeconds:60,
  source:'simulated-demo-until-collar-sdk-connected',
  levels:bands,
  grade(score){const n=Number(score);return Number.isFinite(n)?bands.find(x=>n>=x.min)?.key:null},
  hasGeneratedPortrait(petKey,grade){try{return !!window.localStorage?.getItem?.(`dp_portrait_${petKey}_${grade}`)}catch(e){return false}}
 });
})();
