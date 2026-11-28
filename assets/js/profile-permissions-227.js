/* Local ownership guard. Server authentication must be enforced separately for a connected product. */
(function(root){'use strict';
 const allowed=()=>dp227CanEditProfile();
 let editTarget=null;
 const identity=()=>allowed()?dpPetId(state.dog):null;
 const matchesEditTarget=()=>state.modal==='edit-pet'&&!!editTarget&&editTarget===identity();
 function strip(){if(allowed())return;for(const el of document.querySelectorAll('#app [data-action="edit-pet"],#app [data-action="avatar-change"]')){
   if(el.tagName==='BUTTON'&&!el.querySelector('img')&&!el.classList.contains('pet-avatar-tap')){el.remove();continue;}
   el.querySelectorAll('.pet-avatar-camera').forEach(x=>x.remove());el.removeAttribute('data-action');el.removeAttribute('tabindex');el.removeAttribute('role');el.removeAttribute('aria-label');if(el.tagName==='BUTTON'){el.disabled=true;el.tabIndex=-1;}
 }}
 const oldModal=renderModal;renderModal=function(...args){if(['edit-pet','avatar-choice'].includes(state.modal)&&!allowed()){state.modal='';editTarget=null;return oldModal.apply(this,args);}if(state.modal==='edit-pet')editTarget=identity();else editTarget=null;return oldModal.apply(this,args);};
 const oldRender=render;render=function(...args){const r=oldRender.apply(this,args);strip();return r;};
 const oldAction=onAction;onAction=function(el){const a=el?.dataset?.action;if(['edit-pet','avatar-change','avatar-camera','avatar-gallery','avatar-save','save-pet'].includes(a)&&(!allowed()||(a==='save-pet'&&!matchesEditTarget()))){dp227ProfileReadOnly();return;}if(['pet-add','pet-add-save'].includes(a)&&(state.dpExternalPublic||state.modal==='pet-public-card'||(state.tab==='me'&&['dp903-profile','dp903-garden','chat'].includes(state.detail))))return;return oldAction.apply(this,arguments);};
 root.DeepPetProfilePermissions227=Object.freeze({allowed,matchesEditTarget});strip();
})(window);
