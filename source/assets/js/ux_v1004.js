/* DeepPet V10.04: release marker for same-day evidence, bounded personal
 * baseline and explainable score ceilings. No new pages, cards or weights. */
(function(root){'use strict';
 const prior=render;
 render=function(reset=false){
  prior(reset);
  document.querySelectorAll('#app .app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.04');
 };
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.04',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'same-day-alert-and-score-annotations','score-ceiling-equation-consistency',
  'recent-real-personal-baseline','four-language-current-alerts']};
 root.DeepPetUX1004={version:'10.04'};
})(window);
