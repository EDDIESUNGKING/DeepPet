/* V10.78 image and build regression, updated for V10.79 score-independent alerts.
 * current entrypoint is singular, and stale source version tags are retired. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const runtimeRoot=path.resolve(root,'..');
const main=read('assets/js/app_03.js');
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.doesNotMatch(read('index.source.html'),/DeepPet V10\.11|\?v=10\.09/);
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.css/);
assert.equal((read('index.html').match(/<script src="/g)||[]).length,1,'Only one current runtime entrypoint may load');
const switcher=main.match(/if\(m==='pet-switch'\)[^\n]+/);
assert(switcher,'Pet switcher missing');
assert.match(switcher[0],/face=dp58FaceAsset\(i,pet\)/,'Switcher must use the exact Home avatar resolver');
assert.match(switcher[0],/name=dp58FreshDisplayName\(pet\)/,'Switcher must use the exact Home display name');
assert.match(switcher[0],/src="\$\{esc\(face\)\}"/,'Switcher must escape selected image URLs');
assert.doesNotMatch(switcher[0],/src="\$\{pet\.photo\}"/,'Legacy portrait path revived');
const profiles=(main.match(/src="\$\{esc\(dp58FaceAsset\(state\.dog,d\)\)\}"/g)||[]);
assert.equal(profiles.length,3,'Full profile, free-care profile, and edit-profile dialog must all use shared face resolver');
assert.doesNotMatch(main,/src="\$\{d\.photo\}" class="pet-avatar"/,'Old profile images must not bypass the selected gallery photo');
const helper=main.match(/function dp58FaceAsset\(index,d\)\{[\s\S]*?\n\}/);
assert(helper,'Missing shared face resolver');
const scope={state:{petOverrides:{}},asset:null};vm.runInNewContext(helper[0],scope);
for(let index=0;index<15;index++){
 const photo=scope.dp58FaceAsset(index,{photo:'assets/old_gallery_portrait.jpg'});
 assert.equal(photo,`assets/home_faces/${String(index).padStart(2,'0')}.jpg`);
 assert(fs.existsSync(path.join(runtimeRoot,photo)),`Missing gallery face ${photo}`);
}
const lucky='assets/new_pet_shiba_hero_v1002.jpg';
assert.equal(scope.dp58FaceAsset(15,{photo:lucky}),lucky);
assert(fs.existsSync(path.join(runtimeRoot,lucky)),'Lucky Shiba must have the correct registered profile image');
scope.state.petOverrides[0]={photo:'assets/my-dog.jpg'};
assert.equal(scope.dp58FaceAsset(0,{photo:'assets/my-dog.jpg'}),'assets/my-dog.jpg','User photo must override gallery face');
const alert=read('assets/js/ux_v1068.js'),inject=read('assets/js/ux_v1071.js');
assert.match(alert,/timedShowcaseProfiles=new Set\(Array\.from\(\{length:15\},\(_,i\)=>i\)\)/);
assert.match(alert,/!timedShowcaseProfiles\.has\(state\.dog\)/);
assert.match(inject,/dpAlertScenarioVersion='v1079-score-independent-acutes'/);
assert.match(inject,/originalSignals\(date,\['heart','breath','activity','rest'\]\)/,
 'Overnight rest must be included when the scenario waveform wrapper runs');
assert.match(inject,/data=\{\.\.\.all,heart:all\.heart\.slice\(\)/,
 'Other original data channels must survive all waveform overlays');
console.log('PASS V10.78: shared image sources, independent emergency scenarios, entrypoint and source-template version');
