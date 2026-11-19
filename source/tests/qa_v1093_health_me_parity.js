/* V10.93: compare real route and component code, not merely release labels. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=x=>fs.readFileSync(path.join(base,x),'utf8');

// A frozen function pointer used to send Blank to the outdated Me layout.
// The real V9.36 routing adapter must call the current Me function instead.
{
 const state={dog:0,tab:'me',detail:null,emptyPreview:true,petOverrides:{},lang:'zht',connected:false};
 const dogs=[{name:'Milo',age:3,weight:9,breed:{en:'Shiba Inu'}}];
 let saveCount=0;
 const env={window:null,state,dogs,render(){},renderModal(){},onAction(){},
  homeView:()=>'',deepView:()=>'',healthView:()=>'',meView:()=>'<section data-template="stale"></section>',
  blankHomeView:()=>'',blankDeepView:()=>'',blankHealthView:()=>'',blankMeView:()=>'',
  dp58FreshHome:()=>'',freeCareHomeView:()=>'',freeCareDeepView:()=>'',freeCareHealthView:()=>'',freeCareMeView:()=>'',
  dp924FreshHealthView:()=>'',dp58FreshEmptyTab:()=>'',dp58FreshPet:()=>false,isFreePet:()=>false,
  selectedBlank:()=>state.emptyPreview,dpUsesRealMeasurements:()=>false,dpSignals:()=>[],
  persist:()=>{saveCount++;},allPets:()=>[...dogs,{name:'Lucky'}],
  addEventListener(){},document:{addEventListener(){},getElementById(){return null;},querySelector(){return null;}},
  localDate:()=>new Date('2026-11-18'),iso:()=> '2026-11-18',
  console,toast(){},openModal(){},vicon(){return ''}};
 env.window=env;
 vm.runInNewContext(read('assets/js/ux_v936.js'),env,{filename:'ux_v936.js'});
 env.meView=()=>'<section class="shared-me-template" data-template="latest"></section>';
 const blank=env.blankMeView();
 assert.match(blank,/data-template="latest"/,'Blank called an old Me function');
 assert.equal(state.dog,0);assert.equal(state.emptyPreview,true);
 assert.equal(Object.keys(state.petOverrides).length,0,'Shadow pet leaked into persistent overrides');
 state.emptyPreview=false;state.dog=1;
 const lucky=env.freeCareMeView();
 assert.equal(lucky,blank,'Lucky and Blank must call the same current Me component');
 assert.equal(lucky,env.meView());
 assert(saveCount>=2,'Identity restoration did not run');
}

// Me's real production HTML factory must have one invariant top-level shell.
// A missing profile changes only field contents and actions, not the sections.
{
 const src=read('assets/js/app_03.js');
 const start=src.indexOf('function meView(){'),end=src.indexOf('function bottomNav(){',start);
 assert(start>0&&end>start,'Cannot locate the actual Me template');
 const state={dog:0,lang:'zht',tab:'me',detail:null,connected:false,deviceType:null};
 let pet={name:'Milo',age:3,weight:9,breed:{en:'Shiba Inu'}};
 const env={state,currentDog:()=>pet,bigHeader:()=>'<header class="view-header"></header>',
  t:x=>x,label3:x=>x,tr:x=>x,esc:x=>String(x),
  dp58FaceAsset:()=> 'assets/pet-photo-placeholder.svg',breedText:p=>p.breed?.en||'N/A',
  dpCurrentPetId:()=>pet.name?'DP-123':'',dpOwnerBaselineMe:()=>'<button class="card dp-owner-baseline-me"></button>',
  deviceCenter:()=>'<section class="card device-center"></section>',
  shopIllustrationSVG:()=>'<svg></svg>',vicon:()=>'<svg></svg>',
  dpUnreadCount:()=>0,nearbyPets:()=>[],panel:()=>'<button class="health-item"></button>',
  dpFlagDot:()=>''};
 vm.runInNewContext(src.slice(start,end),env,{filename:'app_03_meView.js'});
 function inspect(name,dogIndex,profile){state.dog=dogIndex;pet=profile;const h=env.meView();
  const components=['profile-hero','dp-owner-baseline-me','device-center','store-entry','garden-entry','care-menu'];
  let i=0;for(const key of components){const next=h.indexOf(key,i);assert(next>=i,name+' component order '+key);i=next+key.length;}
  assert.equal((h.match(/class="card profile-hero"/g)||[]).length,1);
  assert.equal((h.match(/class="card device-center"/g)||[]).length,1);
  assert.equal((h.match(/class="card store-entry"/g)||[]).length,1);
  // Cross-pet differences are DATA within the same tag and class geometry.
  return [...h.matchAll(/<\/?([a-z][a-z0-9-]*)\b/g)].map(x=>x[0][1]==='/'?'/'+x[1]:x[1]);
 }
 const milo=inspect('Milo',0,{name:'Milo',age:3,weight:9,breed:{en:'Shiba Inu'}});
 const lucky=inspect('Lucky',15,{name:'Lucky',age:2,weight:9,breed:{en:'Shiba Inu'}});
 const blank=inspect('Blank',16,{name:'',age:null,weight:null,breed:{en:''}});
 assert.deepEqual(lucky,milo,'Lucky Me markup has a different element structure');
 assert.deepEqual(blank,milo,'Blank Me markup has a different element structure');
}

// The V10.00 post-render adapter must keep the actual profile hero for Blank.
// It must never switch to a completely different empty-profile-card section.
{
 const state={tab:'me',detail:null,lang:'zht',emptyPreview:true};
 const parts={};for(const key of ['.pet-avatar','.pet-name','.pet-caption','.device-identity','.dp-profile-id'])parts[key]={textContent:'old',src:'old.jpg',alt:'old'};
 const buttons=['edit-pet','avatar-change','dp-friend-menu'].map(name=>({dataset:{action:name},textContent:'',matches(){return true;}}));
 const classes=new Set();const hero={classList:{add:c=>classes.add(c)},setAttribute(k,v){this[k]=v;},
  querySelector:k=>parts[k]||null,querySelectorAll:()=>buttons};
 Object.defineProperty(hero,'outerHTML',{set(){throw new Error('Hero was replaced with another template');}});
 const main={querySelector:q=>q==='.profile-hero'?hero:null};
 const env={window:null,state,render(){},selectedBlank:()=>state.emptyPreview,
  dp58FreshPet:()=>false,isFreePet:()=>false,currentDog:()=>({}),
  document:{addEventListener(){},getElementById(){return null;},querySelector(){return null;}},
  t:x=>x,esc:x=>x,breedText:()=>'',console};env.window=env;
 vm.runInNewContext(read('assets/js/ux_v1000.js'),env,{filename:'ux_v1000.js'});
 env.DeepPetUX1000.profileOnlyMe({querySelector:()=>main});
 assert(classes.has('dp1093-empty-profile'));
 assert.equal(parts['.pet-avatar'].src,'assets/pet-photo-placeholder.svg');
 assert.match(parts['.pet-name'].textContent,/尚未建立寵物/);
 assert.equal(parts['.dp-profile-id'].textContent,'ID · N/A');
 // Blank retains the production button identities and SVG children. Routing
 // these controls to Add Pet happens at click time, without duplicate labels.
 assert.deepEqual(buttons.map(b=>b.dataset.action),['edit-pet','avatar-change','dp-friend-menu']);
 assert.equal(hero['data-profile-state'],'blank');
}

// Device assistant is one Me component, including on the empty profile.
{
 const src=read('assets/js/ux_v926.js'),state={tab:'me',detail:null,emptyPreview:false,dog:0};
 let inserted='';
 const area={insertAdjacentHTML(_where,html){inserted=html;}};
 const app={querySelector:s=>s==='.device-center'?area:null,querySelectorAll:()=>[]};
 const env={window:null,state,render(){},onAction(){},dpCurrentPetId:()=>state.emptyPreview?'':'DP-1',
  selectedBlank:()=>state.emptyPreview,isFreePet:()=>false,currentDog:()=>({name:'Milo'}),
  localStorage:{getItem:()=>null,setItem(){}},
  document:{addEventListener(){},getElementById:id=>id==='app'?app:null},
  console,toast(){},vicon:()=>''};env.window=env;
 vm.runInNewContext(src,env,{filename:'ux_v926.js'});
 function assistant(label,blank){state.emptyPreview=blank;inserted='';env.render();assert.match(inserted,/dp926-wear-card/,label);
  assert(!inserted.includes('模擬'),'Obsolete test label was visible in '+label);
  return [...inserted.matchAll(/<\/?([a-z][a-z0-9-]*)\b/g)].map(x=>x[0][1]==='/'?'/'+x[1]:x[1]);
 }
 const milo=assistant('Milo',false),lucky=assistant('Lucky',false),blank=assistant('Blank',true);
 assert.deepEqual(lucky,milo);assert.deepEqual(blank,milo);
 state.emptyPreview=true;inserted='';env.render();assert.equal((inserted.match(/disabled aria-disabled="true"/g)||[]).length,3);
}

const healthCss=read('assets/css/ux_v1092.css');
assert.match(healthCss,/\.dp1092-exam-ring\{[\s\S]*?border:0 none!important/);
assert.match(read('assets/js/ux_v1058.js'),/const count=54,lit=Math\.round\(n\/100\*count\)/);
assert(!read('assets/js/ux_v1048.js').includes('class="dp1048-baseline-mark"'),
 'An invented baseline wave can still appear for an unmeasured pet');
assert(!/\(state\.tab==='home'\|\|state\.tab==='me'\)\&\&!state\.detail\)profileOnlyBasics/.test(read('assets/js/ux_v1040.js')));
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
console.log('PASS V10.93: real Me routing, shared profile hero, 7 Me modules, safe actions, one exam ring');
