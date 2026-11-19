/* DeepPet release builder: VERSION.txt is the single production version source. */
import {readFile,writeFile,mkdir,rm,copyFile,cp,readdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const releaseText=(await readFile('VERSION.txt','utf8')).trim();
const releaseMatch=/^DeepPet V(\d+\.\d+)$/.exec(releaseText);
if(!releaseMatch)throw new Error('Invalid VERSION.txt: expected DeepPet Vmajor.minor');
const releaseVersion=releaseMatch[1];
const releaseTag=`v${releaseVersion.replace('.','')}`;
// Archived onboarding artwork was nested one directory deeper when imported.
// Keep original source paths stable and materialize the exact image aliases
// referenced by the intro, nearby-pets and feature walkthrough screens.
// Without this, the first-run intro and three secondary tours show broken art.
const introAliases=[
 ...[1,2,3,4,5].map(n=>`intro_${String(n).padStart(2,'0')}.webp`),
 ...[1,2,3,4,5].map(n=>`scenes/scene_${String(n).padStart(2,'0')}.webp`),
 ...[1,2,3].map(n=>`approved_exact_images/page_${String(n).padStart(2,'0')}.webp`)
];
for(const relative of introAliases){
 const destination=`assets/onboarding/${relative}`;
 await mkdir(destination.slice(0,destination.lastIndexOf('/')),{recursive:true});
 // Complete releases keep large artwork at the runtime root, next to source/.
 // The previous build assumed it was duplicated under source/assets and failed
 // with ENOENT when buyers rebuilt the actual distributed ZIP.
 let original;
 for(const candidate of [`assets/onboarding/onboarding/${relative}`,`../assets/onboarding/onboarding/${relative}`,`../assets/onboarding/${relative}`]){
  try {await access(candidate);original=candidate;break;}catch{}
 }
 if(!original)throw new Error(`Missing required onboarding artwork: ${relative}`);
 await copyFile(original,destination);
}
const src=await readFile('index.source.html','utf8');
const cssPaths=[...src.matchAll(/<link\s+[^>]*href="([^"]+\.css(?:\?[^"]*)?)"[^>]*rel="stylesheet"[^>]*\/?>/g)].map(m=>m[1].split('?')[0]);
const jsPaths=[...src.matchAll(/<script\s+src="([^"]+\.js(?:\?[^"]*)?)"\s*><\/script>/g)].map(m=>m[1].split('?')[0]);
if(cssPaths.length<12||jsPaths.length<16)throw new Error(`Missing files: css=${cssPaths.length}, js=${jsPaths.length}`);
cssPaths.push('assets/css/ux_v938.css');
cssPaths.push('assets/css/ux_v941.css');
cssPaths.push('assets/css/ux_v943.css');
cssPaths.push('assets/css/ux_v945.css');
cssPaths.push('assets/css/ux_v990.css');
cssPaths.push('assets/css/ux_v993.css');
cssPaths.push('assets/css/ux_v997.css');
cssPaths.push('assets/css/ux_v999.css');
cssPaths.push('assets/css/ux_v1000.css');
cssPaths.push('assets/css/ux_v1001.css');
cssPaths.push('assets/css/ux_v1003.css');
cssPaths.push('assets/css/ux_v1005.css');
cssPaths.push('assets/css/ux_v1011.css');
cssPaths.push('assets/css/ux_v1012.css');
cssPaths.push('assets/css/ux_v1013.css');
cssPaths.push('assets/css/ux_v1015.css');
cssPaths.push('assets/css/ux_v1017.css');
cssPaths.push('assets/css/ux_v1028.css');
cssPaths.push('assets/css/ux_v1029.css');
cssPaths.push('assets/css/ux_v1030.css');
cssPaths.push('assets/css/ux_v1031.css');
cssPaths.push('assets/css/ux_v1032.css');
cssPaths.push('assets/css/ux_v1033.css');
cssPaths.push('assets/css/ux_v1034.css');
cssPaths.push('assets/css/ux_v1035.css');
cssPaths.push('assets/css/ux_v1036.css');
cssPaths.push('assets/css/ux_v1037.css');
cssPaths.push('assets/css/ux_v1039.css');
cssPaths.push('assets/css/ux_v1040.css');
cssPaths.push('assets/css/ux_v1041.css');
cssPaths.push('assets/css/ux_v1042.css');
cssPaths.push('assets/css/ux_v1044.css');
cssPaths.push('assets/css/ux_v1046.css');
cssPaths.push('assets/css/ux_v1048.css');
cssPaths.push('assets/css/ux_v1049.css');
cssPaths.push('assets/css/ux_v1050.css');
cssPaths.push('assets/css/ux_v1051.css');
cssPaths.push('assets/css/ux_v1052.css');
cssPaths.push('assets/css/ux_v1054.css');
cssPaths.push('assets/css/ux_v1055.css');
cssPaths.push('assets/css/ux_v1056.css');
cssPaths.push('assets/css/ux_v1057.css');
cssPaths.push('assets/css/ux_v1058.css');
cssPaths.push('assets/css/ux_v1059.css');
cssPaths.push('assets/css/ux_v1060.css');
cssPaths.push('assets/css/ux_v1061.css');
cssPaths.push('assets/css/ux_v1062.css');
cssPaths.push('assets/css/ux_v1063.css');
cssPaths.push('assets/css/ux_v1064.css');
cssPaths.push('assets/css/ux_v1065.css');
cssPaths.push('assets/css/ux_v1066.css');
cssPaths.push('assets/css/ux_v1068.css');
cssPaths.push('assets/css/ux_v1070.css');
cssPaths.push('assets/css/ux_v1071.css');
cssPaths.push('assets/css/ux_v1072.css');
cssPaths.push('assets/css/ux_v1073.css');
cssPaths.push('assets/css/ux_v1075.css');
cssPaths.push('assets/css/ux_v1076.css');
cssPaths.push('assets/css/ux_v1092.css');
cssPaths.push('assets/css/ux_v1094.css');
cssPaths.push('assets/css/ux_v1095.css');
cssPaths.push('assets/css/ux_v1096.css');
cssPaths.push('assets/css/ux_v1097.css');
cssPaths.push('assets/css/ux_v1098.css'); // Sleep day: same measured ring, alert and timeline slots for N/A.
cssPaths.push('assets/css/ux_v1099.css'); // Anchored emergency landing, nowrap exam counts, normal-weight period focus.
jsPaths.push('assets/js/ux_v939_tour.js');
jsPaths.push('assets/js/ux_v938.js');
jsPaths.push('assets/algorithm/personalization-v941.js');
jsPaths.push('assets/js/ux_v941.js');
jsPaths.push('assets/js/ux_v957_range_contract.js');
jsPaths.splice(jsPaths.indexOf('assets/js/ux_v973.js'),1);
jsPaths.splice(jsPaths.indexOf('assets/js/ux_v974.js'),1);
jsPaths.splice(jsPaths.indexOf('assets/js/ux_v975.js'),1);
jsPaths.splice(jsPaths.indexOf('assets/js/ux_v976.js'),1);
jsPaths.splice(jsPaths.indexOf('assets/js/ux_v977.js'),1);
jsPaths.splice(jsPaths.indexOf('assets/js/ux_v978.js'),1);
jsPaths.splice(jsPaths.indexOf('assets/js/ux_v979.js'),1);
jsPaths.splice(jsPaths.indexOf('assets/js/ux_v980.js'),1);
jsPaths.push('assets/js/ux_v973.js');
jsPaths.push('assets/js/ux_v974.js');
jsPaths.push('assets/js/ux_v975.js');
jsPaths.push('assets/js/ux_v976.js');
jsPaths.push('assets/js/ux_v977.js');
jsPaths.push('assets/js/ux_v978.js');
jsPaths.push('assets/js/ux_v979.js');
jsPaths.push('assets/js/ux_v980.js');
jsPaths.push('assets/js/ux_v981.js');
jsPaths.push('assets/js/ux_v982.js');
jsPaths.push('assets/js/ux_v983.js');
jsPaths.push('assets/js/ux_v984.js');
jsPaths.push('assets/js/ux_v985.js');
jsPaths.push('assets/js/ux_v986.js');
jsPaths.push('assets/js/ux_v987.js');
jsPaths.push('assets/js/ux_v988.js');
jsPaths.push('assets/js/ux_v989.js');
jsPaths.push('assets/js/ux_v990.js');
jsPaths.push('assets/js/ux_v991.js');
jsPaths.push('assets/algorithm/intelligence-v995.js');
jsPaths.push('assets/js/ux_v999.js');
jsPaths.push('assets/js/ux_v1000.js');
jsPaths.push('assets/js/ux_v1001.js');
jsPaths.push('assets/js/ux_v1002.js');
jsPaths.push('assets/js/ux_v1003.js');
jsPaths.push('assets/js/ux_v1004.js');
jsPaths.push('assets/js/ux_v1005.js');
jsPaths.push('assets/js/ux_v1006.js');
jsPaths.push('assets/js/ux_v1007.js');
jsPaths.push('assets/js/ux_v1008.js');
jsPaths.push('assets/js/ux_v1009.js');
jsPaths.push('assets/js/ux_v1010.js');
jsPaths.push('assets/js/ux_v1011.js');
jsPaths.push('assets/js/ux_v1012.js');
jsPaths.push('assets/js/ux_v1013.js');
jsPaths.push('assets/js/ux_v1014.js');
jsPaths.push('assets/js/metric_format_v1015.js');
jsPaths.push('assets/js/ux_v1015.js');
jsPaths.push('assets/js/pet_insights_v1017.js');
jsPaths.push('assets/js/pet_insights_v1018.js');
jsPaths.push('assets/js/ux_v1017.js');
jsPaths.push('assets/js/ux_v1023.js');
jsPaths.push('assets/algorithm/care-intelligence-v1028.js');
jsPaths.push('assets/algorithm/care-intelligence-v1029.js');
jsPaths.push('assets/js/ux_v1029.js');
jsPaths.push('assets/algorithm/care-intelligence-v1030.js');
jsPaths.push('assets/js/ux_v1030.js');
jsPaths.push('assets/js/ux_v1031.js');
jsPaths.push('assets/js/ux_v1032.js');
jsPaths.push('assets/js/ux_v1033.js');
jsPaths.push('assets/js/ux_v1035.js');
jsPaths.push('assets/js/ux_v1036.js');
jsPaths.push('assets/js/ux_v1037.js');
jsPaths.push('assets/js/ux_v1039.js');
jsPaths.push('assets/js/ux_v1040.js');
jsPaths.push('assets/js/ux_v1041.js');
jsPaths.push('assets/algorithm/trend-alerts-v1042.js');
jsPaths.push('assets/algorithm/trend-alerts-v1043.js');
jsPaths.push('assets/algorithm/wear-readiness-v1044.js');
jsPaths.push('assets/algorithm/second-by-second-v1045.js');
jsPaths.push('assets/js/ux_v1042.js');
jsPaths.push('assets/algorithm/trend-display-v1046.js');
jsPaths.push('assets/js/ux_v1046.js');
jsPaths.push('assets/js/ux_v1048.js');
jsPaths.push('assets/js/ux_v1049.js');
jsPaths.push('assets/js/ux_v1050.js');
jsPaths.push('assets/js/ux_v1051.js');
jsPaths.push('assets/js/ux_v1052.js');
jsPaths.push('assets/js/ux_v1055.js');
jsPaths.push('assets/js/ux_v1056.js');
jsPaths.push('assets/js/ux_v1058.js');
jsPaths.push('assets/js/ux_v1059.js');
jsPaths.push('assets/algorithm/context-alerts-v1061.js');
jsPaths.push('assets/algorithm/rapid-events-v1062.js');
jsPaths.push('assets/js/ux_v1061.js');
jsPaths.push('assets/js/ux_v1062.js');
jsPaths.push('assets/js/ux_v1060.js');
jsPaths.push('assets/js/ux_v1063.js');
jsPaths.push('assets/js/ux_v1064.js');
jsPaths.push('assets/js/ux_v1065.js');
jsPaths.push('assets/js/ux_v1066.js');
jsPaths.push('assets/js/ux_v1068.js');
jsPaths.push('assets/js/ux_v1070.js');
jsPaths.push('assets/js/ux_v1071.js');
jsPaths.push('assets/js/ux_v1072.js');
jsPaths.push('assets/js/ux_v1073.js');
jsPaths.push('assets/algorithm/provenance-v1075.js');
jsPaths.push('assets/algorithm/event-triage-v1075.js');
jsPaths.push('assets/js/ux_v1075.js');
jsPaths.push('assets/js/ux_v1076.js');
jsPaths.push('assets/js/ux_v1087.js'); // Final pass affects visible presentation copy only.
jsPaths.push('assets/js/ux_v1088.js'); // Korean access and report-export text consistency.
jsPaths.push('assets/js/ux_v1094.js'); // Single no-data Home/Deep design and route contract.
jsPaths.push('assets/js/ux_v1095.js'); // Last Health ring cleanup: scored exam only.
jsPaths.push('assets/js/ux_v1097.js'); // Owner lifecycle: blank -> profile -> verified 20 Hz readings.
jsPaths.push('assets/js/ux_v1099.js'); // Last render pass: scroll Home alerts to exact dated waveform section.
const cssParts=await Promise.all(cssPaths.map(async x=>`/* ${x} */\n`+await readFile(x,'utf8')));
const jsParts=await Promise.all(jsPaths.map(async x=>`\n;/* ${x} */\n`+await readFile(x,'utf8')));
const cssBundle=cssParts.join('\n');
// The same verified VERSION.txt value drives the visible Me footer, document
// title, release metadata and cache-busting bundle names on every build.
const jsBundle=`window.DeepPetBuildVersion=${JSON.stringify(releaseVersion)};\n`+jsParts.join('\n');
const cssHash=createHash('sha256').update(cssBundle).digest('hex').slice(0,12), jsHash=createHash('sha256').update(jsBundle).digest('hex').slice(0,12);
const cssName=`assets/css/deeppet-${releaseTag}-${cssHash}.css`,jsName=`assets/js/deeppet-${releaseTag}-${jsHash}.js`;
// Release hygiene: remove every obsolete compiled bundle; keep original source modules and photos intact.
for (const dir of ['assets/css','assets/js']) for (const file of await readdir(dir)) if (/^deeppet-v\d+-.*\.(?:css|js)$/.test(file)) await rm(`${dir}/${file}`,{force:true});
await writeFile(cssName,cssBundle);await writeFile(jsName,jsBundle);
let html=src.replace(/<link\s+[^>]*href="([^"]+\.css(?:\?[^"]*)?)"[^>]*rel="stylesheet"[^>]*\/?>/g,'').replace(/<script\s+src="([^"]+\.js(?:\?[^"]*)?)"\s*><\/script>/g,'');
html=html.replace(/DeepPet V\d+\.\d+/g,`DeepPet V${releaseVersion}`).replace('</head>',`<link href="${cssName}" rel="stylesheet"/></head>`);
html=html.replace('</body>',`<script src="${jsName}"></script>\n<script>window.addEventListener('error',function(e){if(e.target?.tagName==='SCRIPT'){var shell=document.getElementById('app');if(shell&&!shell.querySelector('.app-main')){var el=document.getElementById('dp-safe-start-message');if(el)el.textContent='启动资源载入失败。请点击重新载入。';}}},true);if(!window.__DeepPetOnboarding){var root=document.getElementById('dp-intro-root'),dots=root?.querySelectorAll('[data-intro-dot]'),start=root?.querySelector('.dp-intro-start-zone'),rail=root?.querySelector('.dp-intro-rail');if(root&&dots&&start){dots.forEach((b,i)=>b.addEventListener('click',()=>{rail.style.transform='translate3d(-'+(i*100)+'%,0,0)';start.hidden=i!==4}));start.addEventListener('click',()=>{root.remove();document.body.classList.remove('dp-intro-active');var shell=document.getElementById('app');if(shell&&!shell.querySelector('.app-main')){shell.innerHTML='<div role="alert" style="padding:60px 20px;text-align:center;line-height:1.8"><h2>DeepPet 启动失败</h2><p>应用程序未能完整载入。请重新载入。</p><button style="background:#6856ce;color:white;border:0;border-radius:10px;padding:12px 18px" onclick="location.reload()">重新载入 / Retry</button></div>';}});}}<\/script></body>`);
await writeFile('index.html',html);
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
for(const file of ['index.html','app.js','breed-catalog.js','styles.css'])await copyFile(file,`dist/${file}`);
// All photographs and language-specific intro screens live in the parent
// runtime; overlay source files and freshly compiled bundles on that inventory.
await cp('../assets','dist/assets',{recursive:true});
await cp('assets','dist/assets',{recursive:true,force:true});
// Keep the directly openable release root in lockstep with the source build.
for(const dir of ['assets/css','assets/js'])for(const file of await readdir(`../${dir}`))if(/^deeppet-v\d+-.*\.(?:css|js)$/.test(file))await rm(`../${dir}/${file}`,{force:true});
await copyFile('index.html','../index.html');
await copyFile(cssName,`../${cssName}`);
await copyFile(jsName,`../${jsName}`);
await writeFile('../VERSION.txt',releaseText+'\n');
console.log(`DeepPet V${releaseVersion}: ${cssPaths.length} CSS and ${jsPaths.length} JS source files bundled`);
console.log(`Bundles: ${cssName} (${cssBundle.length} chars); ${jsName} (${jsBundle.length} chars)`);
