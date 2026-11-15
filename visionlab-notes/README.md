# VisionLab Notes｜YOLO 影像辨識知識庫

這是一個可直接部署到 GitHub Pages 的靜態教學網站，內容以 **YOLO、資料標註、模型訓練、微小目標及模型評估** 為主題。專案的重點不只是做出一個首頁，而是以 `AGENTS.md` 定義 AI 可以持續依循的開發規則。

![VisionLab Notes 網站首頁預覽](assets/img/site-preview.png)

## ✨ 功能

- 首頁主題導覽、分類切換與即時關鍵字搜尋。
- 6 篇示範筆記與可共用的文章閱讀模板。
- 文章資料與網頁版型分離，新增文章**不用修改 HTML/CSS/JavaScript**。
- 支援手機 / 平板 / 桌機，使用相對路徑可部署於 GitHub Pages 的子路徑。
- 附 `tools/new_article.py` 與 `tools/validate_content.py`，皆只需 Python 標準函式庫。

## 📁 專案重點

- [`AGENTS.md`](AGENTS.md)：專案目標、命名規範、資料格式、AI 開發流程和驗收條件。
- [`content/index.json`](content/index.json)：類別與文章索引。
- `content/articles/*.json`：每篇文章的分段內文。
- [`assets/js/app.js`](assets/js/app.js)：通用渲染器、路由、搜尋與篩選功能。

## 🖥️ 本機預覽（VS Code 可使用）

1. 用 VS Code **開啟整個 `visionlab-notes` 資料夾**。
2. 在 VS Code 終端機執行：

   ```bash
   python -m http.server 8000
   ```

   Windows 若 `python` 不可用，可改試 `py -m http.server 8000`。

3. 瀏覽器進入 `http://localhost:8000/`。

> 因為網頁透過 `fetch()` 讀取 JSON，請勿直接雙擊 `index.html` 用 `file://` 開啟；這種開啟方式通常會被瀏覽器的安全限制阻擋。

## ➕ 新增新筆記（示範 AI 可重複使用的流程）

在專案根目錄執行：

```bash
python tools/new_article.py \
  --slug confusion-matrix \
  --title "混淆矩陣入門" \
  --category evaluation \
  --summary "理解 TP、FP、FN 與漏檢誤檢的關係。" \
  --minutes 5 \
  --level 入門
```

> Windows PowerShell 可將命令寫在同一行；上面反斜線續行語法適用於 bash / zsh。

工具會自動新增 `content/articles/confusion-matrix.json` 並在 `content/index.json` 登錄文章。再把新 JSON 裡的示範文字改成正式教學內容，完成後執行：

```bash
python tools/validate_content.py
```

通過後重新整理網站，首頁卡片、分類、搜尋、文章頁面都會自動出現新內容。**不需要新建 HTML 檔案。**

## 🚀 將專案上傳 GitHub 並啟用 GitHub Pages

### A. 上傳原始碼

1. 登入 GitHub，在 [New repository](https://github.com/new) 建立公開專案，名稱建議 `visionlab-notes`。
2. 點選 **Add file → Upload files**，將解壓縮後 `visionlab-notes/` **內部的所有檔案與資料夾** 上傳到 Repository 根目錄，提交 Commit。請注意 `.nojekyll` 為隱藏檔，也要上傳。
3. 確認 Repository 最上層就有 `index.html`、`AGENTS.md`、`README.md`、`assets/`、`content/`。不要多包一層 `visionlab-notes/`。

亦可在資料夾中使用 Git CLI（請先把 `YOUR-USERNAME` 改成實際帳號）：

```bash
git init
git add .
git commit -m "Initial VisionLab Notes knowledge base"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/visionlab-notes.git
git push -u origin main
```

### B. 設定 GitHub Pages

1. 開啟 Repository 的 **Settings → Pages**。
2. 在 **Build and deployment** 中選 **Deploy from a branch**。
3. Branch 選 **main**，Folder 選 **/(root)**，點 **Save**。
4. 部署完成後，到 Pages 畫面查看 GitHub 提供的實際網址。一般專案儲存庫的網址形式為：
   `https://YOUR-USERNAME.github.io/visionlab-notes/`
5. 實際點開首頁與至少一篇文章，例如：
   `https://YOUR-USERNAME.github.io/visionlab-notes/#/article/what-is-yolo`

> 上面的 `YOUR-USERNAME` 只是格式範例，**不是已發布的網址**；必須完成 GitHub 上傳與啟用 Pages 後才有真實的可瀏覽連結。

### C. 發布後調整 GitHub 按鈕

首頁右上角 GitHub 按鈕目前指向 `https://github.com/`，請在 `index.html` 找到這個 `href`，替換成**自己的 Repository URL**，再 commit 一次。

## ✅ 提交前自我驗收

- [ ] `AGENTS.md` 規則完整，且與資料夾結構一致。
- [ ] `python tools/validate_content.py` 顯示驗證通過。
- [ ] GitHub Repository 設為 Public，檔案根目錄完整。
- [ ] GitHub Pages 網頁能開啟（不是 404），文章連結與搜尋可使用。
- [ ] 將真實 Repository URL、Pages URL 填入 `SUBMISSION.md`，替換個人資料佔位文字。

## 技術與內容說明

此站採純前端、無後端設計。範例內容為整理式學習筆記，不代表實測結果，也不包含任何真實工業影像、個資或私有資料。網站視覺的物件框圖為自製示意 SVG。字體來自 Google Fonts，有系統字型備援。
