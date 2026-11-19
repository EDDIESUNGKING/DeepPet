/* DeepPet V10.23: direct examination review navigation without new pages. */
(function(root){'use strict';
 const previousAction=onAction;
 onAction=function(target){
  if(target?.dataset?.action==='today-open'&&target.dataset.page==='reports'&&target.dataset.reportKey&&!selectedBlank()){
   const exact=root.DeepPetExam921?.getGroups?.().find(x=>x.key===target.dataset.reportKey);
   if(exact&&typeof root.DeepPetExam921?.showReport==='function'){
    root.DeepPetExam921.showReport(exact.key);
    return;
   }
  }
  // Report deletion or date edits may invalidate a previously rendered link.
  // In that case the original action still opens the Health report list.
  return previousAction(target);
 };
 const previousRender=render;
 render=function(reset=false){
  previousRender(reset);
  document.querySelectorAll('#app .app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.23');
 };
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.23',integrity:[...(root.DeepPetRelease?.integrity||[]),'effective-upcoming-care','one-todo-per-exam-report','direct-examination-review']};
})(window);
