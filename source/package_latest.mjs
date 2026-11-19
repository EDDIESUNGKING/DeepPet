/* Build a deliberately minimal user-facing release directory.
   This is not included inside the delivered archive. */
import {readFile,copyFile,mkdir,readdir} from 'node:fs/promises';
import {resolve,join,dirname,relative,basename} from 'node:path';

const root=process.cwd();
const manifest=(await readFile('VERSION.txt','utf8')).trim();
const match=/^DeepPet V(\d+\.\d+)$/.exec(manifest);
if(!match)throw Error('Incorrect version manifest');
const tag=match[1].replace('.','');
// A packaged source/ directory sits directly inside its runtime. Old versions
// resolved the output to that parent and recursively deleted the entire app.
// Export a NEW sibling folder, and fail rather than overwrite an existing one.
const target=resolve(root,'..','..',`release_v${tag}_export`);
const html=await readFile('index.html','utf8');
const css=html.match(new RegExp(`assets/css/deeppet-v${tag}-[a-f0-9]{12}\\.css`))?.[0];
const js=html.match(new RegExp(`assets/js/deeppet-v${tag}-[a-f0-9]{12}\\.js`))?.[0];
if(!css||!js)throw Error('Missing compiled entrypoints');
await mkdir(target); // EEXIST is intentional: no silent loss of previous exports.
const copy=async path=>{const dest=join(target,path);await mkdir(dirname(dest),{recursive:true});await copyFile(join(root,path),dest);};
await Promise.all(['index.html','VERSION.txt',css,js].map(copy));
let retained=0,excluded=0;
async function media(dir,base=root){
 for(const entry of await readdir(join(base,dir),{withFileTypes:true})){
  const rel=join(dir,entry.name);
  if(entry.isDirectory()){await media(rel,base);continue;}
  if(!entry.isFile())continue;
  if(/\.(?:js|css|map|ts|jsx|tsx)$/i.test(entry.name)||/^deeppet-v\d+-/i.test(basename(entry.name))){excluded++;continue;}
  const dest=join(target,rel);await mkdir(dirname(dest),{recursive:true});
  await copyFile(join(base,rel),dest);retained++;
 }
}
// Binary artwork is stored once in the adjacent runtime folder. The source
// folder holds the editable JS/CSS/algorithms, not duplicated gallery photos.
await media('assets',resolve(root,'..'));
if(retained<100)throw Error(`Incomplete image/media assets: only ${retained} files`);
const unpacked=await readdir(target);
if(unpacked.join(',')!==['VERSION.txt','assets','index.html'].join(','))throw Error('Unexpected output roots');
// The executable release stays minimal; its source is shipped in a separate
// self-contained folder in the SAME archive for professional SDK handoff.
let sourceFiles=0;
const reportName=`V${match[1]}_数据与用词审查报告.md`;
const reports=(await readdir(root)).includes(reportName)?[reportName]:[];
for(const file of ['index.html','index.source.html','app.js','styles.css','breed-catalog.js','build.mjs','package_latest.mjs','README.md',...reports,'VERSION.txt']){
 const dest=join(target,'source',file);await mkdir(dirname(dest),{recursive:true});await copyFile(join(root,file),dest);sourceFiles++;
}
for(const dir of ['assets/js','assets/css','assets/algorithm','assets/onboarding','tests']){
 for(const entry of await readdir(join(root,dir),{withFileTypes:true})){
  if(!entry.isFile()||!/\.(?:js|css)$/i.test(entry.name))continue;
  if(/^deeppet-v\d+-/.test(entry.name)&&![basename(css),basename(js)].includes(entry.name))continue;
  const rel=join(dir,entry.name),dest=join(target,'source',rel);
  await mkdir(dirname(dest),{recursive:true});await copyFile(join(root,rel),dest);sourceFiles++;
 }
}
const latest=(await readFile(join(target,'index.html'),'utf8'));
if(!latest.includes(css)||!latest.includes(js))throw Error('Broken bundle references');
console.log(`Packaged ${manifest}: ${retained} media files, ${sourceFiles} original source files; ${excluded} historical bundles excluded from runtime`);
console.log(`Entry: ${relative(target,join(target,'index.html'))}; CSS ${css}; JS ${js}`);
