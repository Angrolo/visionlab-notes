# 作業繳交範本（請先補齊個人資料與真實網址）

**繳交標題：** 高科大 [學號] 電信碩二 [姓名] YOLO 影像辨識知識庫

## 1. 專案簡介

本專案名稱為 **VisionLab Notes｜YOLO 影像辨識知識庫**，主題聚焦於 YOLO 物件偵測、資料標註、資料切分、模型訓練、微小目標偵測及模型評估。網站具備分類瀏覽、文章搜尋與文章閱讀功能，並使用可重複使用的版型，讓後續增加學習筆記不需要重新製作網頁。

## 2. GitHub Repository 連結

**[請貼上 GitHub 公開 Repository 的實際網址]**

## 3. 網頁連結

**[請貼上 GitHub Pages 實際完成部署的網址]**

## 4. AGENTS.md

完整規範放在 Repository 根目錄的 `AGENTS.md`：**[請貼上 GitHub 上 AGENTS.md 檔案的真實連結]**。

這份文件明確定義專案目的、技術選型、檔案結構、命名規則、內容資料格式、頁面風格、AI 新增與修改流程，以及驗收標準。

## 5. 未來如何利用規則繼續擴充？

未來若要新增一篇「混淆矩陣入門」，AI 先讀取 `AGENTS.md`，確認主題與資料格式，再執行 `python tools/new_article.py` 建立 JSON 文章模板，撰寫內容並執行 `python tools/validate_content.py` 驗證。網站會根據 `content/index.json` 自動生成新文章卡片，並使用共用版型顯示內文。因此新增文章不需要修改 `index.html`、CSS 或 JavaScript，可維持視覺一致性與可擴充性。

---

繳交前檢查：學號、姓名、三個實際連結都已替換；Repository 為 Public，網站首頁和文章都能開啟。
