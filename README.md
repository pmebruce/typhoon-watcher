# 颱風觀測者

Windy 動態天氣、中央氣象署警特報與各縣市停班課摘要。

## 部署到 Cloudflare Workers

在 Workers & Pages 建立應用程式，連接這個 GitHub 儲存庫，選擇 main 分支。

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`

不需要 API 金鑰。`/api/warnings` 由 Worker 取得氣象署公開 RSS，前端每 5 分鐘重新讀取。Windy 使用官方嵌入地圖。

## 修改

修改 `web/index.html` 或 `worker/handler.js` 後執行 `npm run build`，生成 `worker/index.js`。GitHub 更新後由 Cloudflare 自動建置部署。

## 資料說明

Windy 圖層與最新警特報由各來源供應。原頁路徑、風雨及停班課表格仍是 2026/10/23 資料快照，並未自動同步；請依介面資料時間與官方最新公告判讀。

原始視覺參考：https://claude.ai/artifact/81UQfWTCWLUjGuPn4Z66Hx
