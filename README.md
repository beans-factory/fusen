<div align="center">

# 🗒️ Fusen

**A self-hosted sticky-note app with VS Code-quality editing.**  
Between a sticky-note board and a code editor — for engineers who write.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-green)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-0.1.0-orange)](package.json)

[English](#english) · [日本語](#japanese) · [中文](#chinese)

</div>

---

<a id="english"></a>

## English

### What is Fusen?

Fusen is a **self-hosted memo app** that lives entirely on your own machine or server — no accounts, no cloud sync, no subscription. It combines the visual overview of a sticky-note board with the power of Monaco Editor (the engine behind VS Code).

**Key highlights**

- 📋 **Board view** — Visual card grid. Filter by tags, search in real time.
- ✍️ **Monaco Editor** — Syntax highlighting, autocomplete, Markdown preview.
- 🏷️ **Tags with color** — Many-to-many tagging with a built-in color picker.
- 🔐 **Key-based auth** — Simple, multi-user access control via `.env`.
- 🌍 **7 UI languages** — English, Japanese, French, German, Hindi, Chinese, Korean.
- 📦 **Export to ZIP** — All memos as Markdown files with frontmatter.
- 🎨 **Light / dark theme** — Fully themed via CSS variables.
- ⚙️ **JSON settings** — Every editor option exposed in a live JSON config.

---

### Requirements

- **Node.js** 20 or later
- No database server required — SQLite is bundled.

---

### Quick Start

```bash
# 1. Clone
git clone https://github.com/your-org/fusen.git
cd fusen

# 2. Install dependencies
npm install

# 3. Initialize the database (first time only)
npm run db:push

# 4. Configure access (see Multi-user Setup below)
cp .env.example .env
# edit .env and add USER_KEY_yourname=your-secret-key

# 5. Start development server
npm run dev
```

Open **http://localhost:5173** in your browser and enter your access key.

---

### Production Deployment

```bash
# Build the frontend
npm run build

# Start the single production process
npm start
```

Open **http://localhost:3001** — Fastify serves both the API and the static frontend from one process on one port.

To run in the background:

```bash
# Using PM2
npm install -g pm2
pm2 start npm --name fusen -- start
pm2 save
```

---

### Multi-user Setup

Fusen supports multiple independent users. Each user has their own isolated memo space.

Add one line per user to `.env`:

```env
USER_KEY_alice=replace-with-a-strong-random-key
USER_KEY_bob=another-strong-random-key
```

- The part after `USER_KEY_` becomes the **username** shown in the status bar.
- Each user logs in with their own key — memos are never shared between users.
- If **no** `USER_KEY_*` is defined, the app runs without authentication (local development only).

> **Tip:** Generate a strong key with `node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"`

---

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite file path |
| `PORT` | `3001` | Fastify server port (dev & prod) |
| `DEV_PORT` | `5173` | Vite dev server port (dev only) |
| `USER_KEY_<name>` | *(none)* | Access key per user. Omit all to disable auth. |

---

### In-App Settings

Open settings with **Ctrl+,** or the ⚙ icon. Settings are edited as live JSON.

#### `ui` — Interface

| Key | Default | Options | Description |
|---|---|---|---|
| `theme` | `"dark"` | `"dark"` `"light"` | Color theme |
| `language` | `"en"` | `"en"` `"ja"` `"fr"` `"de"` `"hi"` `"zh"` `"ko"` | UI language |
| `statusBarColor` | `"#f5c842"` | any hex color | Status bar accent color |
| `defaultShowPreview` | `false` | `true` `false` | Show Markdown preview on startup |

#### `editor` — Monaco Editor

| Key | Default | Description |
|---|---|---|
| `fontSize` | `14` | Font size in px |
| `fontFamily` | `"'Fira Code', ..."` | Font stack |
| `tabSize` | `2` | Spaces per tab |
| `wordWrap` | `"on"` | `"on"` or `"off"` |
| `minimap` | `true` | Show minimap |
| `lineNumbers` | `"on"` | `"on"` `"off"` `"relative"` |
| `lineHeight` | `0` | `0` = auto |
| `smoothScrolling` | `true` | Smooth scroll animation |
| `fontLigatures` | `true` | Ligature support (Fira Code etc.) |
| `stickyScroll` | `true` | Sticky header lines |
| `mouseWheelZoom` | `false` | Ctrl+scroll to zoom |
| `bracketPairColorization` | `false` | Colorize bracket pairs |
| `guides` | `true` | Indentation and bracket guides |
| `cursorBlinking` | `"smooth"` | `"blink"` `"smooth"` `"phase"` `"expand"` `"solid"` |
| `renderLineHighlight` | `"line"` | `"none"` `"gutter"` `"line"` `"all"` |

---

### Keyboard Shortcuts

#### Global

| Shortcut | Action |
|---|---|
| `Ctrl+N` | New memo |
| `Ctrl+,` | Open / close settings |
| `Ctrl+.` | Focus search bar |
| `Ctrl+K` | Command palette |

#### Board view

| Shortcut | Action |
|---|---|
| `Ctrl+K` | Command palette |

#### Editor view

| Shortcut | Action |
|---|---|
| `Ctrl+K` or `F1` | Monaco command palette (includes Fusen commands) |
| `Ctrl+F` | Find in document |
| `Ctrl+H` | Find & replace |
| `Ctrl+/` | Toggle line comment |

---

### Commands (Command Palette)

| Command | Description |
|---|---|
| New Memo | Create a new memo and open it |
| Show / Hide Preview | Toggle Markdown preview split |
| Open Settings | Open the settings panel |
| Export All as ZIP | Download all memos as `.md` files in a ZIP |
| Switch to Light / Dark Theme | Toggle color theme |

---

### Project Structure

```
fusen/
├── src/              # Frontend (React + Vite)
│   ├── components/   # UI components
│   ├── views/        # BoardView, etc.
│   ├── layouts/      # MainLayout (editor + topbar)
│   ├── stores/       # Zustand state stores
│   ├── api/          # API client
│   ├── i18n/         # Translations (en, ja, fr, de, hi, zh, ko)
│   ├── utils/        # Helpers (color, export, …)
│   └── types/        # TypeScript types & settings schema
├── server/           # Backend (Fastify + Prisma)
│   ├── routes/       # notes, tags, search, auth
│   └── plugins/      # Prisma plugin
├── prisma/
│   └── schema.prisma # Note + Tag + NoteTag schema
└── .env              # Environment config (never commit)
```

---

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS |
| Editor | Monaco Editor |
| State | Zustand |
| Backend | Fastify |
| ORM | Prisma |
| Database | SQLite |

---

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev servers (Vite + Fastify concurrently) |
| `npm run build` | Build frontend for production |
| `npm start` | Start production server |
| `npm run db:push` | Apply schema changes to DB |
| `npm run db:reset` | ⚠️ Delete DB and re-apply schema (all data lost) |
| `npm run db:generate` | Regenerate Prisma client |

---

### Resetting the Database

> ⚠️ **This deletes all memos and tags permanently.**

```bash
npm run db:reset
```

This removes `prisma/dev.db` and re-applies the schema from scratch. Use it when:

- The schema changed in an incompatible way and `db:push` fails.
- You want to start fresh with an empty database.
- Something is broken and the DB file is corrupted.

After the reset, restart the server:

```bash
npm run dev   # development
# or
npm start     # production
```

---

### License

[MIT](LICENSE)

---

---

<a id="japanese"></a>

## 日本語

### Fusen とは？

Fusen は**セルフホスト型のメモアプリ**です。すべてのデータはあなた自身のマシンまたはサーバーに保存されます。アカウント不要・クラウド同期なし・サブスクリプションなし。

付箋ボードの一覧性と、Monaco Editor（VS Code のエンジン）の編集体験を組み合わせています。

**主な特徴**

- 📋 **ボードビュー** — カードグリッド形式。タグでフィルター・リアルタイム検索。
- ✍️ **Monaco Editor** — シンタックスハイライト・補完・Markdown プレビュー。
- 🏷️ **カラータグ** — 多対多タグ付け＋カラーピッカー内蔵。
- 🔐 **キー認証** — `.env` によるシンプルなマルチユーザー管理。
- 🌍 **7言語対応** — 英語・日本語・フランス語・ドイツ語・ヒンディー語・中国語・韓国語。
- 📦 **ZIP エクスポート** — 全メモを Markdown ファイルとしてまとめてダウンロード。
- 🎨 **ライト / ダークテーマ** — CSS 変数による完全テーマ対応。
- ⚙️ **JSON 設定** — エディタオプションをライブ JSON で編集可能。

---

### 必要なもの

- **Node.js** 20 以上
- データベースサーバー不要（SQLite を同梱）

---

### クイックスタート

```bash
# 1. クローン
git clone https://github.com/your-org/fusen.git
cd fusen

# 2. 依存パッケージをインストール
npm install

# 3. データベースを初期化（初回のみ）
npm run db:push

# 4. アクセスキーを設定（後述のマルチユーザー設定を参照）
cp .env.example .env
# .env を編集して USER_KEY_yourname=your-secret-key を追加

# 5. 開発サーバーを起動
npm run dev
```

ブラウザで **http://localhost:5173** を開き、アクセスキーを入力してください。

---

### 本番環境への展開

```bash
# フロントエンドをビルド
npm run build

# 本番プロセスを起動（1プロセス・1ポートで完結）
npm start
```

**http://localhost:3001** を開いてください。Fastify が API と静的ファイルを両方配信します。

バックグラウンド実行には PM2 が便利です：

```bash
npm install -g pm2
pm2 start npm --name fusen -- start
pm2 save
```

---

### マルチユーザー設定

ユーザーごとに独立したメモ空間が作られます。`.env` に1行ずつ追加するだけです：

```env
USER_KEY_alice=ランダムな強力キー
USER_KEY_bob=別のランダムなキー
```

- `USER_KEY_` の後ろの部分がステータスバーに表示される**ユーザー名**になります。
- 各ユーザーは自分のキーでログインし、メモは完全に分離されます。
- `USER_KEY_*` が**一つも定義されていない**場合は認証なしで動作します（ローカル開発向け）。

> **ヒント:** 強力なキーの生成: `node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"`

---

### 環境変数

| 変数 | デフォルト | 説明 |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite ファイルのパス |
| `PORT` | `3001` | Fastify ポート（開発・本番共通） |
| `DEV_PORT` | `5173` | Vite 開発サーバーのポート（開発時のみ） |
| `USER_KEY_<名前>` | *(なし)* | ユーザーごとのアクセスキー。未定義で認証なし。 |

---

### アプリ内設定

**Ctrl+,** または ⚙ アイコンで設定を開きます。設定はライブ JSON で編集できます。

#### `ui` — インターフェース

| キー | デフォルト | 選択肢 | 説明 |
|---|---|---|---|
| `theme` | `"dark"` | `"dark"` `"light"` | カラーテーマ |
| `language` | `"en"` | `"en"` `"ja"` `"fr"` `"de"` `"hi"` `"zh"` `"ko"` | UI 言語 |
| `statusBarColor` | `"#f5c842"` | 任意の16進数カラー | ステータスバーのアクセントカラー |
| `defaultShowPreview` | `false` | `true` `false` | 起動時に Markdown プレビューを表示 |

#### `editor` — Monaco エディタ

| キー | デフォルト | 説明 |
|---|---|---|
| `fontSize` | `14` | フォントサイズ（px） |
| `fontFamily` | `"'Fira Code', ..."` | フォントの優先順位 |
| `tabSize` | `2` | タブ幅（スペース数） |
| `wordWrap` | `"on"` | 折り返し `"on"` / `"off"` |
| `minimap` | `true` | ミニマップ表示 |
| `lineNumbers` | `"on"` | `"on"` `"off"` `"relative"` |
| `lineHeight` | `0` | 行高さ（`0` で自動） |
| `smoothScrolling` | `true` | スムーズスクロール |
| `fontLigatures` | `true` | 合字（Fira Code など） |
| `stickyScroll` | `true` | スティッキーヘッダー |
| `mouseWheelZoom` | `false` | Ctrl+スクロールでズーム |
| `bracketPairColorization` | `false` | 括弧ペアのカラー強調 |
| `guides` | `true` | インデント・括弧ガイド |

---

### キーボードショートカット

#### グローバル

| ショートカット | 動作 |
|---|---|
| `Ctrl+N` | 新規メモ |
| `Ctrl+,` | 設定を開く / 閉じる |
| `Ctrl+.` | 検索バーにフォーカス |
| `Ctrl+K` | コマンドパレット |

#### エディタビュー

| ショートカット | 動作 |
|---|---|
| `Ctrl+K` / `F1` | Monaco コマンドパレット（Fusen コマンド含む） |
| `Ctrl+F` | ドキュメント内検索 |
| `Ctrl+H` | 検索と置換 |
| `Ctrl+/` | 行コメントのトグル |

---

### コマンドパレット

| コマンド | 説明 |
|---|---|
| 新規メモ | メモを作成してエディタを開く |
| プレビューを表示 / 非表示 | Markdown プレビューの分割表示切替 |
| 設定を開く | 設定パネルを開く |
| 全メモをZIPエクスポート | 全メモを `.md` ファイルとして ZIP でダウンロード |
| ライト / ダークテーマに切替 | テーマを切り替える |

---

### スクリプト一覧

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動（Vite + Fastify 同時起動） |
| `npm run build` | 本番ビルド |
| `npm start` | 本番起動 |
| `npm run db:push` | スキーマを DB に反映 |
| `npm run db:reset` | ⚠️ DB を削除してスキーマを再適用（全データ消去） |
| `npm run db:generate` | Prisma クライアントを再生成 |

---

### データベースをリセットする

> ⚠️ **全メモとタグが完全に削除されます。元に戻せません。**

```bash
npm run db:reset
```

`prisma/dev.db` を削除してスキーマを初期状態から再適用します。以下のような場合に使用してください：

- スキーマの変更が非互換で `db:push` が失敗する。
- 空の状態からやり直したい。
- DB ファイルが壊れてアプリが起動しない。

リセット後はサーバーを再起動してください：

```bash
npm run dev   # 開発時
# または
npm start     # 本番時
```

---

### ライセンス

[MIT](LICENSE)

---

---

<a id="chinese"></a>

## 中文

### 什么是 Fusen？

Fusen 是一款**自托管备忘录应用**。所有数据完全保存在您自己的计算机或服务器上——无需账号、无云同步、无订阅费用。

它将便利贴看板的整体视图与 Monaco Editor（VS Code 的核心引擎）的强大编辑能力结合在一起。

**主要功能**

- 📋 **看板视图** — 卡片网格布局。按标签筛选，实时搜索。
- ✍️ **Monaco 编辑器** — 语法高亮、自动补全、Markdown 实时预览。
- 🏷️ **彩色标签** — 多对多标签系统，内置颜色选择器。
- 🔐 **密钥认证** — 通过 `.env` 文件实现简单的多用户访问控制。
- 🌍 **7 种界面语言** — 英语、日语、法语、德语、印地语、中文、韩语。
- 📦 **导出为 ZIP** — 将所有备忘录导出为带有元数据的 Markdown 文件。
- 🎨 **亮色 / 暗色主题** — 基于 CSS 变量的完整主题支持。
- ⚙️ **JSON 配置** — 所有编辑器选项均可通过实时 JSON 文件修改。

---

### 环境要求

- **Node.js** 20 或更高版本
- 无需数据库服务器（已内置 SQLite）

---

### 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/fusen.git
cd fusen

# 2. 安装依赖
npm install

# 3. 初始化数据库（仅首次需要）
npm run db:push

# 4. 配置访问密钥（参见多用户设置）
cp .env.example .env
# 编辑 .env，添加 USER_KEY_yourname=your-secret-key

# 5. 启动开发服务器
npm run dev
```

在浏览器中打开 **http://localhost:5173**，输入您的访问密钥即可登录。

---

### 生产环境部署

```bash
# 构建前端
npm run build

# 启动生产服务器（单进程、单端口）
npm start
```

打开 **http://localhost:3001** — Fastify 同时提供 API 和静态前端文件。

如需后台运行，推荐使用 PM2：

```bash
npm install -g pm2
pm2 start npm --name fusen -- start
pm2 save
```

---

### 多用户配置

每个用户拥有独立隔离的备忘录空间。在 `.env` 中每行添加一个用户：

```env
USER_KEY_alice=请替换为强随机密钥
USER_KEY_bob=另一个强随机密钥
```

- `USER_KEY_` 后面的部分将成为状态栏中显示的**用户名**。
- 每位用户使用自己的密钥登录，备忘录完全隔离，互不可见。
- 如果**未定义**任何 `USER_KEY_*`，应用将在无认证模式下运行（仅适合本地开发）。

> **提示：** 生成强密钥：`node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"`

---

### 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite 文件路径 |
| `PORT` | `3001` | Fastify 端口（开发和生产通用） |
| `DEV_PORT` | `5173` | Vite 开发服务器端口（仅开发时使用） |
| `USER_KEY_<名称>` | *(无)* | 每位用户的访问密钥。不定义则禁用认证。 |

---

### 应用内设置

按 **Ctrl+,** 或点击 ⚙ 图标打开设置。设置以实时 JSON 格式编辑。

#### `ui` — 界面设置

| 键 | 默认值 | 选项 | 说明 |
|---|---|---|---|
| `theme` | `"dark"` | `"dark"` `"light"` | 颜色主题 |
| `language` | `"en"` | `"en"` `"ja"` `"fr"` `"de"` `"hi"` `"zh"` `"ko"` | 界面语言 |
| `statusBarColor` | `"#f5c842"` | 任意十六进制颜色 | 状态栏强调色 |
| `defaultShowPreview` | `false` | `true` `false` | 启动时显示 Markdown 预览 |

#### `editor` — Monaco 编辑器

| 键 | 默认值 | 说明 |
|---|---|---|
| `fontSize` | `14` | 字体大小（px） |
| `fontFamily` | `"'Fira Code', ..."` | 字体优先级列表 |
| `tabSize` | `2` | 每个制表符的空格数 |
| `wordWrap` | `"on"` | 自动换行 `"on"` / `"off"` |
| `minimap` | `true` | 显示小地图 |
| `lineNumbers` | `"on"` | `"on"` `"off"` `"relative"` |
| `lineHeight` | `0` | 行高（`0` 表示自动） |
| `smoothScrolling` | `true` | 平滑滚动动画 |
| `fontLigatures` | `true` | 连字支持（Fira Code 等） |
| `stickyScroll` | `true` | 粘性标题行 |
| `mouseWheelZoom` | `false` | Ctrl+滚轮缩放 |
| `bracketPairColorization` | `false` | 括号对颜色高亮 |
| `guides` | `true` | 缩进和括号引导线 |

---

### 键盘快捷键

#### 全局

| 快捷键 | 操作 |
|---|---|
| `Ctrl+N` | 新建备忘录 |
| `Ctrl+,` | 打开 / 关闭设置 |
| `Ctrl+.` | 聚焦搜索栏 |
| `Ctrl+K` | 命令面板 |

#### 编辑器视图

| 快捷键 | 操作 |
|---|---|
| `Ctrl+K` / `F1` | Monaco 命令面板（含 Fusen 命令） |
| `Ctrl+F` | 在文档中查找 |
| `Ctrl+H` | 查找与替换 |
| `Ctrl+/` | 切换行注释 |

---

### 命令面板

| 命令 | 说明 |
|---|---|
| 新建备忘录 | 创建新备忘录并打开编辑器 |
| 显示 / 隐藏预览 | 切换 Markdown 预览分屏 |
| 打开设置 | 打开设置面板 |
| 导出全部为 ZIP | 将所有备忘录打包为 ZIP 下载 |
| 切换亮色 / 深色主题 | 切换颜色主题 |

---

### 脚本命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器（Vite + Fastify 并行） |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm run db:push` | 将 schema 变更同步到数据库 |
| `npm run db:reset` | ⚠️ 删除数据库并重新应用 schema（所有数据将丢失） |
| `npm run db:generate` | 重新生成 Prisma 客户端 |

---

### 重置数据库

> ⚠️ **所有备忘录和标签将被永久删除，无法恢复。**

```bash
npm run db:reset
```

此命令会删除 `prisma/dev.db` 文件并从头重新应用数据库结构。适用于以下情况：

- schema 发生不兼容变更，`db:push` 执行失败。
- 需要从空白状态重新开始。
- 数据库文件损坏导致应用无法启动。

重置后请重新启动服务器：

```bash
npm run dev   # 开发环境
# 或
npm start     # 生产环境
```

---

### 许可证

[MIT](LICENSE)
