import {readFile,mkdir,writeFile} from 'node:fs/promises';
let html=await readFile('web/index.html','utf8');
html=html.replace("fetch('/api/warnings'","fetch('./warnings.xml'").replace('開啟頁面時更新 · 每 5 分鐘重查','每 5 分鐘重讀已同步公告').replace('來源：中央氣象署 RSS。','來源：中央氣象署 RSS，由 GitHub 排程同步（排程可能延遲）。');
await mkdir('public',{recursive:true});await writeFile('public/index.html',html);await writeFile('public/.nojekyll','');
