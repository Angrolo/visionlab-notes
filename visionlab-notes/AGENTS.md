# AGENTS.md — VisionLab Notes 專案代理規範

> **AI 在新增、修改或刪除任何專案內容之前，必須先讀完本文件。**
> 本文件是專案的唯一開發慣例來源（source of truth）；若需求與本文件衝突，先提出衝突與具體替代方案，不要自行改變架構。

## 1. 專案定位與目標

- 專案名稱：**VisionLab Notes｜YOLO 影像辨識知識庫**。
- 目標讀者：準備學習 YOLO、資料標註、資料切分、模型訓練與評估的初學者及研究生。
- 核心任務：將影像辨識知識整理成可搜尋、可分類、可逐篇閱讀的短篇學習筆記。
- 長期目標：讓 AI **不必重寫 HTML 頁面**，只要依照資料規格新增一份 JSON，即可擴充內容。
- 成功定義：新文章可透過首頁分類與搜尋找到、打開後版型一致、手機桌機均可正常閱讀。

## 2. 技術棧與不可破壞的約束

1. 使用 **HTML5 + CSS3 + 原生 JavaScript（ES2020+）**，不引入 React、Vue、npm build 或後端服務。
2. 網頁是靜態站，可部署在 **GitHub Pages**；所有資源以相對路徑讀取，禁止寫死網域或網站根目錄 `/`。
3. 所有文章索引在 `content/index.json`，內容放在 `content/articles/<slug>.json`。
4. 首頁及文章細節由 `assets/js/app.js` 共用模板產生，**不可為單篇文章複製一個新的 HTML 檔**。
5. 不新增需要 API key 的第三方功能。不蒐集個資，不在 Repository 儲存金鑰、帳密或私人資料。
6. 不依賴外部圖片或 JavaScript CDN。CSS 字體可使用網路字型，但需提供系統字型 fallback。
7. 使用 `fetch()` 載入 JSON，故本機需透過 HTTP 伺服器預覽；禁止改成 `file://` 相容但破壞架構的實作。

## 3. 專案資料夾結構

```text
visionlab-notes/
├── AGENTS.md                 # AI 開發規則：新增功能前必讀
├── README.md                 # 啟動、部署及維護說明
├── SUBMISSION.md             # 作業繳交範本（發布後再補連結）
├── index.html                # 唯一頁面入口（hash route）
├── .nojekyll                 # GitHub Pages 不使用 Jekyll 處理
├── assets/
│   ├── css/style.css        # 所有顏色、排版、RWD
│   ├── js/app.js             # 路由、搜尋、分類、文章渲染
│   └── img/                  # SVG 與本站自行製作的圖像
├── content/
│   ├── index.json            # 分類列表 + 文章中繼資料
│   └── articles/
│       └── <slug>.json      # 各篇的內文結構
└── tools/
    ├── new_article.py       # 新增文章並自動更新索引
    └── validate_content.py  # 驗證資料完整性
```

## 4. 命名規則

- 文章 slug：**小寫英文 + 數字 + hyphen**，正則 `^[a-z0-9]+(?:-[a-z0-9]+)*$`，例：`confusion-matrix`。
- 文章檔案：`content/articles/<slug>.json`；索引的 `slug` 要與檔名及內文 `slug` 完全相同。
- 分類 ID：英文小寫單字，例：`basics`、`dataset`、`training`、`evaluation`。
- CSS class：`kebab-case`（例：`article-card`）；JS 變數及函式：`camelCase`。
- 圖片：使用 `kebab-case` 檔名，優先用可縮放的 SVG，存放在 `assets/img/`。
- 不使用中文、空白或特殊字元作為檔名，以利 GitHub URL 及跨系統維護。

## 5. 文章索引格式（content/index.json）

分類物件：

```json
{"id":"basics","label":"基礎概念","icon":"◎","tone":"purple"}
```

`tone` **只能使用** `purple`、`teal`、`blue`、`amber`。

文章物件必須包含以下欄位，**不可省略**：

```json
{
  "slug": "confusion-matrix",
  "title": "混淆矩陣入門",
  "category": "evaluation",
  "summary": "一句話說明文章讀完能學到什麼。",
  "minutes": 5,
  "level": "入門",
  "updated": "2026-11-15"
}
```

- `slug`：符合上述正則，且在全部文章中唯一。
- `title`：清楚的繁體中文標題，不使用純廣告式的誇大語氣。
- `category`：必須等於 `categories` 中已存在的 ID。
- `summary`：20～100 字左右、易讀的內容摘要，不要硬塞關鍵字。
- `minutes`：正整數，估計閱讀所需時間。
- `level`：只能是 `入門`、`實作`、`進階`。
- `updated`：ISO 日期 `YYYY-MM-DD`，更新內容時一併更新。
- 文章順序 **由 `articles` 陣列順序決定**，不要透過 JS 或 CSS 隨意排序。

## 6. 文章內容格式（content/articles/<slug>.json）

所有內文一律使用 `sections` 陣列，以共用渲染器產生頁面；範例：

```json
{
  "slug": "confusion-matrix",
  "sections": [
    {"type": "heading", "text": "01 / 基本概念"},
    {"type": "paragraph", "text": "完整段落文字。"},
    {"type": "list", "items": ["項目一", "項目二"]},
    {"type": "callout", "title": "重點提示", "text": "務必注意的事情。"},
    {"type": "code", "language": "PYTHON", "code": "print('Hello')"},
    {"type": "checklist", "items": ["完成知識檢查", "確認資料格式"]}
  ]
}
```

**允許的 `type` 只有這六種**：

| type | 必填欄位 | 用途 |
| --- | --- | --- |
| `heading` | `text` | 章節標題；會自動出現在右側文章目錄 |
| `paragraph` | `text` | 段落內文 |
| `list` | `items`（非空字串陣列） | 一般條列 |
| `callout` | `title`, `text` | 補充資訊或風險提醒 |
| `code` | `language`, `code` | 程式碼範例 |
| `checklist` | `items`（非空字串陣列） | 讀者自我檢查清單 |

**每篇文章必須：**至少有兩個 `heading`，至少一個 `paragraph`、至少一個 `checklist`。每段保持簡潔，專有名詞首次出現需簡單解釋，避免未驗證的「100% 準確」等承諾。若有程式範例，必須標示它是可直接執行還是示意模板，並寫明必要前提。不得捏造實驗數值、實測成果、引用來源或圖表數據。

## 7. 網頁風格與 UX 規則

- 視覺風格：**清爽的技術學習網站**；白色內容卡、淺灰背景、深靛色主視覺、紫色動作強調色。
- 色彩 token 定義在 `assets/css/style.css` 的 `:root`，例如 `--ink`、`--muted`、`--primary`、`--bg`、`--line`。**優先引用既有 token**。
- 頁面由 Header、左側學習分類、主要內容、Footer 組成；手機寬度下收合側欄，主要內容改成單欄。
- 新增內容**必須重用** `article-card`、`article-head`、`article-body` 等樣式，不為某篇文章私加一套不一致的 UI。
- 字體可讀性：正文行高約 1.8～2.0；輸入框、按鈕與連結須有明顯焦點/hover 狀態。
- 無障礙：圖片需要有意義的 `alt`，導航具有語意化標籤；按鈕必須可用鍵盤操作；不要只靠顏色傳達資訊。
- 桌機與手機都要可瀏覽（至少檢查 1440px、768px、375px）。不要讓內容在水平軸溢出。

## 8. 新增文章的標準操作流程（AI 必須照做）

1. **先檢查** `content/index.json` 是否已有相同主題與 slug，避免重複。
2. 用以下命令建立草稿（推薦，不要自己手動同步兩個檔案）：

   ```bash
   python tools/new_article.py --slug confusion-matrix --title "混淆矩陣入門" --category evaluation --summary "學會讀懂物件偵測中的誤檢與漏檢。" --minutes 5 --level 入門
   ```

3. 開啟產生的 `content/articles/confusion-matrix.json`，將模板替換成**有教學價值**的真實內容。
4. 確認 `content/index.json` 的新文章分類、閱讀時間和名稱正確。
5. 在根目錄執行 `python tools/validate_content.py`，**無錯誤才能視為完成**。
6. 本機執行 `python -m http.server 8000`，開啟 `http://localhost:8000/`，檢查：首頁有新卡片、搜尋得到、分類正確、詳情可開、手機可閱讀。
7. 如果只有新增文章，**不可修改** `index.html` 或 `assets/js/app.js`；除非遇到渲染器不支援的需求且提出理由。
8. 說明本次新增的 slug、分類、測試結果與受影響檔案，避免只回答「完成」。

## 9. 修改與刪除的規則

- 修改既有文章：保持原 slug 不變以避免既有網址失效；更新內容後同步修改 `updated`。
- 改標題與摘要：只需改 `content/index.json`，內文別重複存放中繼資料。
- 刪除文章：**先確認需求**，再同時移除 `content/index.json` 內的項目與 `content/articles/<slug>.json`，最後重新驗證。
- 新增分類：必須加入 `categories`，且 `tone` 使用合法值，再確認側欄與篩選按鈕自動出現。
- 新增 `section.type`：先同步更新 `assets/js/app.js`、本文件第 6 節與 `tools/validate_content.py`，再使用新型別。
- HTML 內容必須進行字元跳脫（escaping）；禁止把未經處理的使用者輸入塞入 `innerHTML`。現有 `esc()` 不得刪除。
- 禁止為「修改小地方」隨意新增前端框架、重新命名整個專案或移除舊資料。

## 10. 驗收清單（Definition of Done）

- [ ] `python tools/validate_content.py` 通過，無 missing/duplicate/invalid slug。
- [ ] 每篇文章可從首頁點開，且瀏覽器重新整理後仍能開啟文章。
- [ ] 搜尋與分類功能有效，切換後沒有錯誤訊息。
- [ ] 新增一篇文章後，不需要修改 HTML/CSS/JS 就可顯示。
- [ ] 手機與桌機版面正常，文字沒有切斷、重疊或水平捲動。
- [ ] 瀏覽器 Console 無明顯錯誤，網路請求沒有找不到的檔案。
- [ ] `AGENTS.md` 與專案實際結構一致；若架構真的改變，務必同步更新文件。
- [ ] GitHub Pages 發布後，從公開網址實際測試首頁、文章詳情與重新整理。

## 11. AI 回答/提交格式

每次開發任務完成，請用繁體中文簡潔提供：

1. **本次變更**：具體新增/修正了什麼。
2. **變動檔案**：列出路徑。
3. **驗證結果**：有執行的指令、結果；未測的部分明確說明。
4. **延伸方式**：若未來要新增類似內容，沿用哪個結構或指令。

> 核心精神：**內容與版型分離、資料規格固定、修改可驗證、規則可重複使用。**
