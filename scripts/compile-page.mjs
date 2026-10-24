import {readFile,writeFile} from 'node:fs/promises';
const html=await readFile(new URL('../web/index.html',import.meta.url),'utf8');
const handler=await readFile(new URL('../worker/handler.js',import.meta.url),'utf8');
await writeFile(new URL('../worker/index.js',import.meta.url),'const PAGE='+JSON.stringify(html)+';\n'+handler);

await writeFile(new URL('../worker/page.js',import.meta.url),'export default '+JSON.stringify(html)+';\n');
