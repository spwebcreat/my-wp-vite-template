# 🚀 My WP Vite Template

モダンなWordPress開発環境テンプレート（Vite + TailwindCSS + SCSS）

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![WordPress](https://img.shields.io/badge/WordPress-%3E%3D5.8-blue.svg)](https://wordpress.org/)

## 📋 概要

このテンプレートは、モダンなWordPress開発環境を提供します：

- **⚡ Vite**: 高速な開発サーバーとホットリロード
- **🎨 TailwindCSS**: ユーティリティファーストのCSS
- **💅 SCSS**: パワフルなCSS拡張
- **🖼️ WebP自動変換**: 画像最適化システム
- **🧪 Playwright**: E2Eテスト環境
- **📦 Makefile**: 開発タスクの自動化
- **🔧 Local by WP Engine**: 推奨ローカル環境

## 🎯 必要な環境

- **Node.js** 16以上
- **npm** 7以上
- **Local by WP Engine** または他のローカルWordPress環境
- **Git**

## 🚀 クイックスタート

#### Step 1: Local by WP Engineでサイト作成

1. **Local by WP Engine**を起動
2. **Create a new site**をクリック
3. サイト設定：
   - **Site name**: `my-project-name`（任意）
   - **Environment**: `Preferred`
   - **WordPress**: 最新版
4. サイトを作成し、**Site shell**を開く

#### Step 2: プロジェクトルートでテンプレート展開

Local shellで以下を実行：

```bash
# テンプレートを現在のディレクトリに展開
git clone --depth 1 https://github.com/spwebcreat/my-wp-vite-template.git temp-template
rsync -av temp-template/ ./
rm -rf temp-template
```

### Step 3: WordPressの初期設定（テーマ設定、プラグインインストール等）

```bash
# ルートディレクトリで開発環境のセットアップを実行
bash ../../development/scripts/setup-local.sh
```

> 📖 **詳細なWordPress設定手順**: [LOCAL-SETUP.md](LOCAL-SETUP.md) を参照

### Step 4: 開発環境のセットアップ

```bash
# ルートディレクトリで開発環境のセットアップを実行
make setup
```

### Step 5: 開発サーバー起動

```bash
# 開発サーバー起動（画像監視付き）
make dev
```

これで以下にアクセス可能：
- **WordPress**: Local by WP Engineで確認
- **Vite開発サーバー**: http://localhost:5173

## 📁 ディレクトリ構造

```
your-wordpress-project/
├── README.md                    # このファイル
├── Makefile                     # 開発タスク自動化
├── CLAUDE.md                    # Claude Code設定
├── development/                 # 開発リソース
│   ├── themes/
│   │   └── mythme/             # メインテーマ(シンボリックリンク)
│   │       ├── src/            # 開発用ソース
│   │       │   ├── js/         # JavaScript
│   │       │   ├── scss/       # SCSS
│   │       │   └── images/     # 画像（WebP変換元）
│   │       ├── dist/           # ビルド出力
│   │       ├── scripts/        # 画像変換スクリプト
│   │       ├── functions.php   # WordPressテーマ設定
│   │       ├── index.php       # メインテンプレート
│   │       ├── style.css       # テーマヘッダー
│   │       ├── package.json    # npm設定
│   │       └── vite.config.js  # Vite設定
│   ├── docs/                   # ドキュメント
│   ├── scripts/                # セットアップスクリプト
│   └── plugins/                # カスタムプラグイン開発(シンボリックリンク)
├── app/                        # WordPressインストール（Local by WP Engine）
│   └── public/                 # WordPressルート
├── conf/                       # サーバー設定（Local by WP Engine）
└── logs/                       # ログファイル（Local by WP Engine）
```

## 🛠️ 開発コマンド

### 基本コマンド
```bash
# development/themes/mythme ディレクトリで実行
make dev        # 開発サーバー起動
make build      # 本番ビルド
make setup      # 開発環境セットアップ
make status     # プロジェクト状態確認
```

### 画像変換
```bash
npm run dev                # 開発サーバー（画像監視付き）
npm run convert-images     # 全画像一括変換
npm run clean-images       # 不要WebP削除
```

### テスト
```bash
npm test                   # Playwrightテスト実行
npm run test:headed        # UIありテスト
npm run test:ui            # テストUI表示
```

## 🖼️ WebP画像変換システム

### 即時変換機能
```bash
# development/themes/mythme ディレクトリで実行
npm run dev
```

**画像操作が即座に反映：**
- ✅ `src/images/photo.jpg` **追加** → 即座に `dist/images/photo.webp` 生成
- ✅ `src/images/photo.jpg` **削除** → 即座に `dist/images/photo.webp` 削除
- ✅ `src/images/photo.jpg` **変更** → 即座に `dist/images/photo.webp` 更新

### 設定
`scripts/convert-images.config.js`で品質等を調整可能：
```javascript
export default {
  quality: 85,              // WebP品質
  smartClean: true,         // 自動削除
  keepOriginalName: true,   // ファイル名保持
};
```

## 🎨 カスタマイズ

### カラー設定
`tailwind.config.js`で色を変更：
```javascript
colors: {
  'primary': {
    500: '#3b82f6',    // メインカラー
  }
}
```

### フォント設定
`tailwind.config.js`でフォントを変更：
```javascript
fontFamily: {
  'sans': ['Inter', 'Noto Sans JP', 'system-ui'],
}
```

## 📝 WP-CLI セットアップ内容



- 日本語インストール・有効化
- タイムゾーン設定（Asia/Tokyo）
- 推奨プラグインインストール：
  - wp-pagenavi
  - wp-multibyte-patch
  - mw-wp-form
  - custom-post-type-ui
  - その他セキュリティ・SEO系
- パーマリンク設定
- デフォルトコンテンツ削除

## 🔧 トラブルシューティング

### エラー対処法

**`make: command not found`**
```bash
# macOS: Xcode Command Line Tools
xcode-select --install

# Windows: WSLまたはGit Bash使用
```

**`npm install`でエラー**
```bash
# Node.jsバージョン確認
node -v  # 16以上必要

# キャッシュクリア
npm cache clean --force
```

**Viteサーバーが起動しない**
```bash
# ポート確認
lsof -i :5173

# 別ポートで起動
npx vite --port 3000
```

**テンプレートの展開でエラー**
```bash
# rsyncが利用できない場合の手動展開
git clone https://github.com/spwebcreat/my-wp-vite-template.git temp-template
cp -r temp-template/* ./
cp -r temp-template/.* ./ 2>/dev/null || true  # 隠しファイルもコピー
rm -rf temp-template
```

## 📚 詳細ドキュメント

- 🚀 **[LOCAL-SETUP.md](LOCAL-SETUP.md)** - Local by WP Engine でのWordPress設定手順
- 📖 [セットアップガイド](development/docs/local-development-automation.md)
- 🏗️ [アーキテクチャ](development/docs/scss-architecture.md)
- 📝 [コーディング規約](development/docs/coding-standards.md)
- 🖼️ [WebP詳細](development/docs/image-conversion-advanced.md)

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチ作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエスト作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 👨‍💻 作者

**SP WEB CREAT.**
- Website: https://www.sp-webcreat.pro/

---