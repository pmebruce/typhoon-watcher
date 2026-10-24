# 颱風觀測者

Windy 動態天氣、中央氣象署警特報與各縣市停班課摘要。

## 每次開啟時更新（本分支）

前端使用 `runtime-config.json` 中的 endpoint，在每次開啟、從背景返回及按下重新整理時查詢官方資料，不使用背景排程。原先固定數字與圖表收進歷史資料，預設收合。

`worker/live.js` 是 Cloudflare Workers 的公開、唯讀資料服務，僅向中央氣象署 RSS 與人事行政總處固定網址發出請求，不需要金鑰。失敗時回報來源不可用，不回傳前一天的數值。

先部署 `wrangler.live.jsonc`，把回傳的 `/api/live` URL 填入 `runtime-config.json`，確認查詢成功後再合併 main。

目前 endpoint 留空，**本分支不可直接合併部署**。Cloudflare 登入與部署尚待完成。

## GitHub Pages

執行 `node scripts/build-pages.mjs` 建置 public。main 分支推送後由 GitHub Actions 部署；本分支已移除原本 5 分鐘排程。

人事總處的「已達停止上班及上課標準」與實際「停止上班、停止上課」分別顯示，避免誤判公告。

原始視覺參考：https://claude.ai/artifact/81UQfWTCWLUjGuPn4Z66Hx
