/* V10.63: no-data view parity, onboarding, independent photo crop. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
const html=read('index.html');
assert.match(html,/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(html,/deeppet-v10101-[a-f0-9]{12}\.css/);
const tour=read('assets/js/ux_v1037.js');
for(const v of ['看懂每天生理狀態與身體節奏','結合心肺、HRV、睡眠、精力與恢復','體檢報告會自動納入 AI 寵物健康模型校正','基於前三步的深度分析'])assert(tour.includes(v),`Tour lacks ${v}`);
const form=read('assets/js/app_03.js');
const petForm=form.slice(form.indexOf("if(m==='pet-add')"),form.indexOf("if(m==='edit-pet')"));
assert(!petForm.includes('addPetBcs'),'New pet still asks for BCS');
assert(!petForm.includes('placeholder="5"')&&!petForm.includes('placeholder="8.5"'),'Defaults remain in new pet');
assert(petForm.includes('id="addPetName"')&&petForm.includes('id="addPetHeight"'));
const patch=read('assets/js/ux_v1063.js');
const css=read('assets/css/ux_v1063.css');
assert(patch.includes('DataTransfer()')&&patch.includes('canvas.toBlob')&&patch.includes('pointermove'),'Crop workflow missing');
assert(css.includes('.dp1063-crop-circle')&&css.includes('#dp931-pet-photo'),'Photo crop controls not styled');

for(const lang of ['zht','zh','en','ja','ko'])for(const kind of [0,1,2])for(const range of [1,7,30]){
 const state={lang,tab:'deep',deepType:kind,range,detail:null,dog:0,emptyPreview:true,deepSelectedDate:null,modal:''};
 const context={window:null,state,document:{addEventListener(){},getElementById(){return null;}},localDate:()=>new Date('2026-11-17T12:00:00Z'),dateAdd:(d,n)=>new Date(d.getTime()+n*86400000),iso:d=>d.toISOString().slice(0,10),
  toSimplified:s=>s, vicon:(kind)=>`<svg data-icon="${kind}"></svg>`,t:k=>({deep:'Deep',health:'Health',healthCare:'Health management',food:'Food',med:'Medication',medHint:'Medicine log',vaccines:'Vaccines',vaccineHint:'Vaccine log',reports:'Exams'}[k]||k),
  bigHeader:()=>'<h1 class="app-title">Deep</h1>', dpDottedSvg:()=>'<svg class="dots"/>',selectedBlank:()=>true,dp58FreshPet:()=>false,isFreePet:()=>false,
  blankDeepView:()=>'',freeCareDeepView:()=>'',blankHealthView:()=>'',freeCareHealthView:()=>'',dp924FreshHealthView:()=>'',dp58FreshEmptyTab:()=>'',blankMeView:()=>'',
  deepView:()=>'',healthView:()=>'',renderModal:()=>{},render:()=>{},console};context.window=context;
 vm.runInNewContext(patch,context,{filename:'ux_v1063.js'});
 const deep=context.DeepPetUX1063.emptyDeep(),health=context.DeepPetUX1063.emptyHealth();
 assert(deep.includes('dp-owner-deep')&&deep.includes('deep-themed')&&deep.includes('dp-owner-status-card'));
 assert.equal((deep.match(/data-action="deep-category"/g)||[]).length,3);
 assert.equal((deep.match(/data-action="range"/g)||[]).length,3);
 assert.equal((deep.match(/class="tab-icon"/g)||[]).length,3,'No-data icons missing');
 assert(!deep.includes('N/A')&&!deep.includes('/100'),'No-data screen must not show N/A score circles');
 assert(deep.includes('dp1073-empty-compact')&&deep.includes('dp1070-empty-summary'),'Old second empty-page template survived');
 assert.equal((deep.match(/dp1070-empty-summary/g)||[]).length,1,'Only one neutral no-data card may appear');
 assert(!deep.includes('牠'));
 if(range===1)assert(deep.includes('deep-day-picker')&&deep.includes('deepDayDate'),'Single day picker missing');
 else {assert(deep.includes('deep-date-compact')&&deep.includes('data-action="deep-select-day"'));assert(!deep.includes('dp1063-calendar'),'Empty charts/calendars must not occupy space');}
 if(kind===0&&lang==='zht')assert(deep.includes('心肺綜合狀態'));
 if(kind===1&&lang==='zht')assert(deep.includes('睡眠情況')&&deep.includes('睡眠狀態'));
 if(kind===2&&lang==='zht')assert(deep.includes('精力與恢復狀態'));
 assert(health.includes('dp1063-care-list')&&health.includes('food-feature')&&health.includes('data-page="summary"'));
 assert(!health.includes('EAF711')&&!health.includes('EDF6FF'));
 const carePages=['food','med','vaccines','deworming','summary','recovery-care','notes'];let last=-1;
 for(const pg of carePages){const at=health.indexOf(`data-page="${pg}"`);assert(at>last,`Incorrect care order ${pg}`);last=at;}
}
console.log('PASS V10.63/73: 5 languages × 3 Deep tabs × 3 ranges, one neutral empty state, care order, four-stage tour, photo crop.');
