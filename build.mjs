/* Build DeepPet static frontend into dist/. Netlify bundles functions separately. */
import {cp,rm,mkdir,copyFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
for(const file of ['index.html','app.js','breed-catalog.js','styles.css'])await copyFile(file,`dist/${file}`);
await cp('assets','dist/assets',{recursive:true});
console.log('DeepPet V8.75 static site copied to dist/');
