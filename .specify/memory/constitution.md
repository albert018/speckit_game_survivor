<!--
Sync Impact Report
==================
- Version change: 0.0.0 → 1.0.0
- This is the initial ratification; no prior principles existed.
- Added Principles:
  - I. Core Tech Stack
  - II. Game Architecture
  - III. Difficulty & Balance
  - IV. Collision & Performance Optimization
  - V. Coding Standards & Prohibitions
  - VI. Testing & Quality
- Added Sections:
  - Rendering & Resolution Constraints
  - Development Workflow
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes needed (generic template)
  - .specify/templates/spec-template.md ✅ no changes needed (generic template)
  - .specify/templates/tasks-template.md ✅ no changes needed (generic template)
- Follow-up TODOs: None
-->

# 倖存者遊戲開發憲法 (Survivor Game Project Constitution)

## Core Principles

### I. Core Tech Stack

- 語言：MUST 使用 **TypeScript**，嚴格模式 (`strict: true`)。
- 構建工具：MUST 使用 **Vite** 作為開發與打包工具。
- 渲染引擎：MUST 使用 **HTML5 Canvas 2D API** 或 **PixiJS** 進行渲染。
- **禁止**使用 DOM 元素（`<div>`、`<span>` 等）來表示遊戲內實體（敵人、投射物、寶石）。DOM 操作的效能成本在高實體數量下不可接受。
- 解析度：邏輯解析度固定為 **640×360**，按比例縮放至視窗大小，保持 Lo-fi 像素感。渲染管線 MUST 以此邏輯解析度為基準座標系統。

**理由**：統一技術選型可減少整合風險；固定邏輯解析度確保不同螢幕尺寸下視覺一致性與碰撞判定穩定性。

### II. Game Architecture

- **ECS 模式 (Entity-Component-System)**：MUST 採用類 ECS 架構。將「位置 (Position)」、「血量 (Health)」、「攻擊邏輯 (Attack)」、「渲染 (Renderable)」等拆分為獨立的 Component，由 System 統一處理。此架構 MUST 能支撐畫面上同時存在超過 **500 個實體**（敵人 + 寶石 + 投射物）。
- **Delta Time 驅動**：所有移動、冷卻、計時器計算 MUST 基於 `deltaTime`（幀間隔時間），確保在 60Hz / 144Hz / 不穩定幀率下遊戲速度一致。禁止使用固定幀率假設（如硬編碼 `1/60`）。
- **物件池 (Object Pooling)**：所有高頻生成/銷毀的實體類型——「敵人」、「投射物」、「經驗值寶石」——MUST 使用物件池管理。禁止在遊戲循環中頻繁 `new` 與垃圾回收。物件池 MUST 提供 `acquire()` 與 `release()` 介面。

**理由**：ECS 天然支援資料導向設計，利於快取命中與批次處理；Delta Time 消除硬體差異；物件池避免 GC 卡頓。

### III. Difficulty & Balance

- **公式至上**：所有敵人的 HP、傷害、生成數量的增長 MUST 嚴格遵循規格書中定義的公式：`基礎值 × 1.25^(階級 - 1)`。任何偏離此公式的數值調整 MUST 在 `balance.ts` 中以命名常數的形式明確記錄。
- **數值解耦**：所有平衡參數（初始 HP、技能倍率、成長係數、冷卻時間、經驗值需求等）MUST 集中定義在 `src/config/balance.ts` 中。嚴禁在邏輯代碼中散落魔術數字 (magic numbers)。
- 難度階級上限 MUST 經過數值驗證，確保在第 15 階（約 30 分鐘遊玩時間）時數值不溢出、不產生 `NaN`、不導致遊戲不可玩。

**理由**：集中管理數值便於迭代調平衡；公式化增長確保可預測的難度曲線。

### IV. Collision & Performance Optimization

- **空間分割 (Spatial Partitioning)**：針對大量實體的碰撞偵測，MUST 實作 **Grid-based partitioning** 或 **Quadtree**。禁止使用 O(n²) 雙重迴圈遍歷所有實體對進行碰撞檢查。
- **渲染批次 (Batching)**：相同類型的實體 MUST 使用同一紋理 (Texture / SpriteSheet) 進行批次渲染，減少 draw call 數量。
- 禁止在核心遊戲循環（update / render）中進行：
  - 大型陣列的 `filter()`、`map()`、`reduce()` 等產生新陣列的操作
  - 複雜的矩陣運算
  - 任何同步 I/O 操作

**理由**：空間分割將碰撞檢測從 O(n²) 降至近似 O(n)；批次渲染大幅降低 GPU draw call 開銷。

### V. Coding Standards & Prohibitions

- **命名慣例**：
  - 類別 / 介面 / 型別：`PascalCase`
  - 變數 / 函式：`camelCase`
  - 常數（含平衡參數）：`SCREAMING_SNAKE_CASE`
- **禁止事項**：
  - 禁止在 update / render 循環中使用 `console.log`（僅允許在開發模式的 debug utility 中使用）
  - 禁止使用 `any` 型別（tsconfig 中 MUST 啟用 `noImplicitAny: true`）
  - 禁止在核心循環中進行會觸發 GC 的操作（如字串拼接、臨時物件建立）
- **模組組織**：遊戲代碼 MUST 按 ECS 架構組織為 `components/`、`systems/`、`entities/` 目錄結構。配置集中於 `config/`。

**理由**：嚴格的型別紀律降低運行時錯誤；命名一致性提高可讀性與協作效率。

### VI. Testing & Quality

- **數值驗證測試**：MUST 針對「難度階級公式」撰寫單元測試，覆蓋以下場景：
  - 第 1 階的基礎值正確性
  - 第 15 階（30 分鐘）時數值不溢出、不產生 `NaN`
  - 極端階級（如第 50 階）時數值仍為有限正數 (`Number.isFinite`)
- **平衡參數完整性測試**：MUST 驗證 `balance.ts` 中所有必要參數皆已定義且為合法數值。
- 測試框架：使用 **Vitest**（與 Vite 生態整合）。

**理由**：數值型遊戲最常見的 bug 來自公式溢出與參數缺失；自動化測試可在每次修改後即時驗證。

## Rendering & Resolution Constraints

- 邏輯座標系統：原點 (0, 0) 位於畫布左上角，X 軸向右、Y 軸向下。
- 所有遊戲邏輯計算 MUST 在 640×360 邏輯解析度下進行。
- 渲染至實際 Canvas 時，MUST 使用統一的縮放因子 `scale = min(windowWidth / 640, windowHeight / 360)` 進行等比縮放。
- 玩家輸入座標 MUST 經過反向縮放轉換至邏輯座標後才能用於遊戲邏輯。
- MUST 支援瀏覽器視窗 resize 事件，動態重新計算縮放因子。

## Development Workflow

- 所有新功能 MUST 先在 `src/config/balance.ts` 中定義相關數值參數，再進行邏輯實作。
- 每個 System MUST 為獨立模組，具有明確的輸入 Component 集合與職責邊界。
- 新增實體類型時 MUST 同時在物件池中註冊對應的工廠函式。
- 效能敏感的變更 MUST 在 500+ 實體場景下進行基準測試，確認無掉幀。

## Governance

- 本憲法為倖存者遊戲專案的最高技術準則，所有 PR / Code Review MUST 驗證是否符合上述原則。
- 修訂程序：任何對本憲法的修訂 MUST 包含：(1) 修改動機說明、(2) 影響範圍分析、(3) 版本號更新。
- 版本策略採用語義化版本 (Semantic Versioning)：
  - MAJOR：刪除或根本性重新定義原則
  - MINOR：新增原則或大幅擴展既有指導
  - PATCH：措辭修正、澄清、排版調整
- 合規審查：每個 feature branch 合併前 MUST 檢查是否違反本憲法任一條款。

**Version**: 1.0.0 | **Ratified**: 2026-03-31 | **Last Amended**: 2026-03-31
