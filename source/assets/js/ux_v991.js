/* DeepPet V9.91 — owner-identity integrity and translated, readable tour. */
(function(root){'use strict';
 root.DeepPetRelease={...root.DeepPetRelease,version:'9.91',ownerClaims:4,showroomSourceContract:'two-known-fixtures'};
 const previousRender=render;
 render=function(reset=false){
  previousRender(reset);
  const app=document.getElementById('app');if(!app)return;
  for(const el of app.querySelectorAll('.app-build-version'))el.textContent='DeepPet · Version 9.91';
 };
 root.DeepPetUX991={version:'9.91',knownSourceLabels:['synthetic-demo-fixture','synthetic-extreme-showcase-v973'],expectedOwnerClaims:['petId','ownerPetId','profile.petId','profile.id']};
})(window);
