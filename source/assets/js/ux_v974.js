/* DeepPet V9.74 release guard — runs last, after all legacy render patches. */
(function(root){'use strict';
 const previous=render;
 render=function(reset=false){
  previous(reset);
  const footer=document.querySelector('#app .app-build-version');
  if(footer)footer.textContent='DeepPet · Version 9.74';
 };
 root.DeepPetRelease974={version:'9.74',languages:['zh','zht','en','ja'],showcasePets:15,
  dailyContract:'same-pet same-date canonical scores',reviewCurves:['physiol','rhythm']};
})(window);
