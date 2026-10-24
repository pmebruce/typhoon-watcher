import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
await mkdir('public',{recursive:true});await copyFile('web/index.html','public/index.html');await copyFile('web/live-ui.js','public/live-ui.js');await copyFile('runtime-config.json','public/runtime-config.json');await writeFile('public/.nojekyll','');
