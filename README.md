# 颱風觀測者

正式 App：https://typhoon-watcher-live.pmebruce.workers.dev/

首頁提供 Windy 動態天氣、官方警特報、縣市停班課摘要，以及有適用日期和來源的周邊賣場營業資訊。

## Cloudflare 部署

Cloudflare Workers 連接 `pmebruce/typhoon-watcher` 的 `main` 分支。組建命令為 `npm run build`，部署命令為 `npx wrangler deploy`。預設 `wrangler.jsonc` 與 `wrangler.live.jsonc` 均指向 `typhoon-watcher-live`，入口為 `worker/live.js`。

組建腳本會從 `web/index.html` 產生 `worker/page.js`；Worker 同時服務 `/`、`/index.html` 和 `/api/live`。修改後推送 main 會觸發 Cloudflare 建置。若 GitHub 授權中斷，先修復 GitHub App 的存取，再重新建置或推送新的 commit。

官方天氣及縣市資料在開啟頁面、返回頁面或手動重新整理時讀取，無須 API 金鑰。賣場營業資料依註明日期整理，跨日會顯示「尚未確認」，不會自動假設照常營業。

原頁路徑及風雨圖表仍含 2026/10/23 歷史快照，請依介面資料時間判讀。GitHub Pages 保留為另一個發布管道，正式分享請使用上方 Cloudflare 網址。

原始視覺參考：https://claude.ai/artifact/81UQfWTCWLUjGuPn4Z66Hx
