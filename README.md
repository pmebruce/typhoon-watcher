# 颱風觀測者

Windy 動態天氣、中央氣象署警特報與各縣市停班課摘要。

網站透過 GitHub Pages 發布。GitHub Actions 在 main 分支更新時部署，並每 5 分鐘排程重新同步氣象署 RSS；排程可能延遲，公告時間以來源發布時間為準。

修改 `web/index.html` 後推送 main，即會重新部署。Pages 使用 `scripts/build-pages.mjs` 建立靜態網站與已同步的 `warnings.xml`。不需 API 金鑰。

`worker/handler.js` 與 `scripts/compile-page.mjs` 保留伺服器版本原始碼；日後若改用 Cloudflare Workers，可執行 `npm run build` 後依 `wrangler.jsonc` 部署。

Windy 與最新公告由各來源提供。原頁路徑、風雨及停班課表格仍為 2026/10/23 資料快照，並未自動同步；請依介面資料時間與官方最新公告判讀。

原始視覺參考：https://claude.ai/artifact/81UQfWTCWLUjGuPn4Z66Hx
