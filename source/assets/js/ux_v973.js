/* DeepPet V9.73 final integration guard. */
(function(root){'use strict';
 const previousRender=render;
 render=function(reset=false){
  previousRender(reset);
  const footer=document.querySelector('#app .app-build-version');
  if(footer)footer.textContent='DeepPet · Version 9.73';
  // A blank or new pet cannot display previous pet readings, even if a late
  // overlay tried to keep old day scores in the page.
  if(typeof selectedBlank==='function'&&selectedBlank()){
   document.querySelectorAll('#app [data-dp926-daily]').forEach(x=>x.removeAttribute('data-dp926-daily'));
  }
 };
 root.DeepPetRelease973={version:'9.73',languages:['zh','zht','en','ja'],showcasePets:15};
})(window);
