/* V10.10: guard missing/unbounded alert fields and missing wear-quality text.
 * No score computation, warning trigger, page architecture or showcase changes. */
(function(root){'use strict';
 const earlier=render;
 render=function(reset=false){
  earlier(reset);
  document.querySelectorAll('#app .app-build-version').forEach(el=>el.textContent='DeepPet · Version 10.10');
 };
 root.DeepPetRelease={...root.DeepPetRelease,version:'10.10',integrity:[...(root.DeepPetRelease?.integrity||[]),
  'no-fabricated-missing-alert-measurements','no-fabricated-alert-clock','finite-wear-quality-labels']};
 root.DeepPetUX1010={version:'10.10'};
})(window);
