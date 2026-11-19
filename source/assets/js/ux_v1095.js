/* DeepPet V10.95 — final Health rendering invariant.
 * Health Management has action rows and text only; the sole allowed scored
 * circle sits beside Exam Analysis.  This runs after historical render hooks.
 */
(function(root){'use strict';
 function normalizeHealth(){
  const page=document.querySelector('#app .dp1075-health-page');
  if(!page)return;
  // Older wrappers used to append the plan-completion card after render.
  // Remove those remnants, never removing the exam result itself.
  page.querySelectorAll('.dp916-care-card,.dp916-home-score,.dp-health-progress-ring,.dp-health-completion-meter').forEach(node=>node.remove());
  // The canonical Exam now uses dp1096-exam-score. Any dp916-large-score,
  // large legacy donut or dot meter is obsolete EVEN inside its Exam card.
  page.querySelectorAll('.dp916-large-score,.dp-dot-meter,.dp1092-exam-ring').forEach(node=>node.remove());
 }
 if(typeof render==='function'){
  const previous=render;
  render=function(...args){const output=previous.apply(this,args);normalizeHealth();return output;};
 }
 root.DeepPetHealthLayout1095=Object.freeze({normalizeHealth,version:'10.95'});
})(window);
