DeepPet V8.59 — 五頁引導畫面 + V8.58 完整網站

每次直接打開或重新整理網址，都會先顯示五頁：
1. 多隻狗狗大集合 — DeepPet 健康照護介紹
2. 阿拉斯加雪橇犬 — Deep 深度分析
3. 拉布拉多 — Health 健康管理
4. 優雅貴賓犬 — AI 生理年齡、長期趨勢
5. 跑動的法國鬥牛犬 — 4G LTE Worldwide 全球定位

觸控左右滑動、電腦滑鼠水平拖曳、鍵盤左右鍵，以及底部分頁點都可以切換。
Get Started 只存在並可點擊於第5頁。按下後進入 V8.58 APP，不會在 APP 內部換分頁時再出現。
本版本故意不把「已看過引導」存入 localStorage / sessionStorage，故只要網址重新載入（F5/重新整理/新開網址）就會從第一頁再開始，這是設計要求。

部署：
- Netlify Drop：解壓 ZIP，拖曳包含 index.html 的整個資料夾至 https://app.netlify.com/drop/ 。
- Git/Netlify Build：netlify.toml 使用 node build.mjs，輸出 dist；assets/onboarding 會由整個 assets 資料夾一同複製。

原有 V8.58 功能：15 隻示例寵物、新寵物 New Pet 60 秒測量、空白檔案、Home/Deep/Health/Me、照片及健康回顧等既有程式全部保留。
引導頁素材取自既有使用者確認的「DeepPad Pet Care Onboarding Carousel」設計，但頂部品牌文字已改為 DeepPet。設計中的手機小畫面為原先提供的視覺稿，不等同對真實裝置操作的驗證。

本版本使用本地靜態素材，不依賴額外服務顯示引導頁。
網站內的生理資料仍屬模擬資料，尚未接入真實項圈 SDK；新寵物的 AI 表情生成功能仍需外部 API。
