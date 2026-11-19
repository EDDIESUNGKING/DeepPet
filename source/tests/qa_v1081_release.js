/* V10.82: real packaged illustration paths, canonical build identity and
 * inherited V10.80 event chronology must remain intact. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const runtimeRoot=path.resolve(root,'..');
const resolveAsset=p=>fs.existsSync(path.join(root,p))?path.join(root,p):path.join(runtimeRoot,p);
const exists=p=>fs.existsSync(resolveAsset(p));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(resolveAsset(p))).digest('hex');
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
const src=read('index.html');
assert.match(src,/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(src,/deeppet-v10101-[a-f0-9]{12}\.css/);
const bundlePath=src.match(/assets\/js\/deeppet-v10101-[a-f0-9]{12}\.js/)[0];
const cssPath=src.match(/assets\/css\/deeppet-v10101-[a-f0-9]{12}\.css/)[0];
const bundle=read(bundlePath),css=read(cssPath);
const artwork=[
 ...[1,2,3,4,5].map(n=>`intro_${String(n).padStart(2,'0')}.webp`),
 ...[1,2,3,4,5].map(n=>`scenes/scene_${String(n).padStart(2,'0')}.webp`),
 ...[1,2,3].map(n=>`approved_exact_images/page_${String(n).padStart(2,'0')}.webp`)
];
for(const file of artwork){
 const publicFile=`assets/onboarding/${file}`;
 const canonicalFile=`assets/onboarding/onboarding/${file}`;
 assert(exists(publicFile),`Referenced onboarding artwork missing: ${publicFile}`);
 assert.equal(hash(publicFile),hash(canonicalFile),`Artwork alias must be identical: ${file}`);
}
// Inventory every literal bundled image path; an image missing from the
// complete ZIP is a real visual defect even if JS unit tests pass.
const imageRx=/assets\/[\w./-]+\.(?:webp|png|jpg|jpeg|svg|gif)/g;
const images=[...new Set([...(src.match(imageRx)||[]),...(bundle.match(imageRx)||[])])];
for(const img of images)assert(exists(img),`Compiled UI references missing image: ${img}`);
assert(images.length>=50,`Asset inventory unexpectedly sparse: ${images.length}`);
assert(css.includes("url('../onboarding/scenes/scene_01.webp')"));
assert(exists('assets/onboarding/scenes/scene_01.webp'));

// Final renderer runs after historical modules that still set old footer
// labels. The effective build version must remain authoritative after render.
const badge={textContent:'DeepPet Version 9.73'};
const context={window:{DeepPetBuildVersion:'10.90',DeepPetRelease:{version:'9.90'},addEventListener:()=>{}},
 state:{tab:'me',dog:0,emptyPreview:false,dpPetEpoch:1,detail:null,modal:'',deepType:0,range:1},
 document:{querySelectorAll:selector=>selector==='#app .app-build-version'?[badge]:[]},
 render:()=>{badge.textContent='DeepPet Version 10.07';}};
vm.runInNewContext(read('assets/js/ux_v1076.js'),context,{filename:'ux_v1076.js'});
context.render();
assert.equal(badge.textContent,'DeepPet Version 10.90');
assert.equal(context.window.DeepPetRelease.version,'10.90');
console.log(`PASS V10.81 regression: ${artwork.length} restored onboarding assets, ${images.length} packaged images, authoritative release badge`);
