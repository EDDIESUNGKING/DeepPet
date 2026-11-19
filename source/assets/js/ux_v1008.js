/* V10.08 release marker: evidence counts are domain-specific and midnight
 * refreshes preserve scroll position. No pages, records or formulas changed. */
(function(root){'use strict';
 const previous=render;
 render=function(reset=false){
  previous(reset);
  document.querySelectorAll('#app .app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.08');
 };
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.08',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'per-domain-sparse-score-evidence','no-midnight-scroll-jump','no-submetric-coverage-overstatement']};
 root.DeepPetUX1008={version:'10.08'};
})(window);
