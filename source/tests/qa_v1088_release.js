/* V10.90: five-language access, intentional empty copy, PDF-report wording
   and the actual shipped source/runtime rebuild contract. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const runtime=path.resolve(root,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('assets/js/app_03.js');
const between=(start,end)=>{
 const i=app.indexOf(start),j=app.indexOf(end,i);
 assert(i>=0&&j>i,`Missing source section: ${start}`);
 return app.slice(i,j);
};
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');

// An intentionally empty localized value must not become a visible raw key.
const getter=app.match(/const t=k=>\{[^\n]+\};/);
assert(getter,'Translation getter unavailable');
for(const lang of ['zh','zht','en','ko','ja']){
 const ctx={state:{lang},LANG:{zh:{notLive:'',other:'保留'},zht:{notLive:''},en:{notLive:''},ko:{notLive:''},ja:{notLive:''}},toTraditional:x=>x};
 vm.runInNewContext(getter[0]+';this.lookup=t;',ctx);
 assert.equal(ctx.lookup('notLive'),'');
 assert.equal(ctx.lookup('other'),'保留');
 assert.equal(ctx.lookup('missing'),'missing');
}

// Both system locale detection and saved manual selection support Korean.
const detect=between('function dpSystemLanguage(){','if(!state.dpLanguageUserOverride)');
for(const [raw,expected] of [['ko-KR','ko'],['ja-JP','ja'],['zh-TW','zht'],['zh-CN','zh'],['en-US','en']]){
 const ctx={navigator:{language:raw,languages:[raw]}};
 vm.runInNewContext(detect,ctx);
 assert.equal(ctx.dpSystemLanguage(),expected);
}
assert.match(app,/\['zh','zht','en','ko','ja'\]\.includes\(state\.lang\)/);
assert.match(app,/\['ko','한국어（Korean）'\]/);
assert.match(app,/case 'pick-language':if\(\['zh','zht','en','ko','ja'\]/);
assert.match(app,/case 'save-language':[\s\S]*?\['zh','zht','en','ko','ja'\]/);

// The report's headings and boilerplate are translated, not the underlying
// medicine, checkup or guardian-entered records. Print view uses this function.
const nodes={
 '.vet-report-tag':{textContent:'DEMO'},
 '.vet-method-note':{textContent:'Statuses are demo/user-reviewed'},
 '.vet-report-footer p':{textContent:'Simulated waveform'},
 '.vet-report-signoff span':{textContent:'Demonstration only'}
};
const med={textContent:'No saved medication. Example format: ...'};
const noSensor={textContent:'only saved care data and clearly marked demo exam records are shown.'};
const userRecord={textContent:"My dog's prescribed medicine and real dosage"};
const fakeRoot={querySelector:sel=>nodes[sel]??null,
 querySelectorAll:sel=>sel==='.vet-care-columns p'?[med,userRecord]:sel==='p'?[noSensor,userRecord]:[],
 get outerHTML(){return JSON.stringify({nodes,med:med.textContent,noSensor:noSensor.textContent,userRecord:userRecord.textContent});}};
const ctx={state:{lang:'en'},DOMParser:class{parseFromString(){return{querySelector:()=>fakeRoot};}},vetReportContent:()=>'<div class="vet-report-root"></div>'};
vm.runInNewContext(read('assets/js/ux_v1088.js'),ctx);
const updated=JSON.parse(ctx.vetReportContent({}));
assert.match(updated.nodes['.vet-report-tag'].textContent,/NOT FOR DIAGNOSIS/);
assert.doesNotMatch(updated.nodes['.vet-report-footer p'].textContent,/demo|simulat|illustrativ/i);
assert.equal(updated.med,'No medication records have been saved.');
assert.match(updated.noSensor,/No collar is connected/);
assert.equal(updated.userRecord,'My dog\'s prescribed medicine and real dosage');

const build=read('build.mjs');
assert.match(build,/await cp\('\.\.\/assets','dist\/assets'/);
assert.match(build,/ux_v1088\.js/);
const runtimeIndex=fs.readFileSync(path.join(runtime,'index.html'),'utf8');
assert.match(runtimeIndex,/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(runtimeIndex,/deeppet-v10101-[a-f0-9]{12}\.css/);
assert(fs.existsSync(path.join(runtime,'assets/onboarding/intro_01.webp')));
assert(fs.existsSync(path.join(runtime,'assets/onboarding/onboarding/intro_01.webp')));
console.log('PASS V10.93: five languages, empty UI labels, guarded printed reports, complete reproducible release');
