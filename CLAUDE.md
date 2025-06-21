# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイドラインを提供します。

## 🚨 最重要ルール

**必ず日本語で回答してください。** このプロジェクトは日本語環境で開発されているため、すべてのコミュニケーションは日本語で行う必要があります。

## 🎯 開発方針

### 実装の基本原則
- **シンプル優先**: 無理矢理な実装で複雑化することを避ける
- **手戻り防止**: 将来の変更を見据えた実装を心がける
- **既存活用**: 既存の仕組みを最大限活用し、余計な依存関係は追加しない
- **保守性重視**: シンプルで保守しやすいコードを優先する

### コーディング規約
- **HTML**: セマンティックなタグ使用、BEM記法でクラス命名
- **CSS/SCSS**: モバイルファースト、プロパティの記述順序を統一
- **JavaScript**: ES6+構文、モジュール化、キャメルケース命名
- **PHP**: WordPress規約準拠、エスケープ処理必須、nonce検証
- **Git**: 意味のあるコミットメッセージ（feat/fix/docs等の接頭辞）

## 📝 開発コマンド一覧

### 🚀 クイックスタート（Local環境）
```bash
# プロジェクトルートに移動
cd [your-project-path]

# 初回セットアップ（全自動）
make install

# 開発開始
make dev
```

### 開発サーバー
- `npm run dev` - Vite開発サーバー起動（ポート5173、画像監視付き）
- `npm run build` - 本番用ビルド
- `npm run preview` - ビルドのプレビュー
- `make dev` - 環境構築 + 開発サーバー起動（推奨）

### WordPress Scripts（代替）
- `npm run wp-start` - WordPress scripts開発モード
- `npm run wp-build` - WordPress scriptsでビルド

### テスト
- `npm test` - 全Playwrightテスト実行
- `npm run test:headed` - ブラウザUIありでテスト
- `npm run test:ui` - Playwright UIモード
- `npm run test:report` - テスト結果レポート表示

### 画像管理（WebP変換）
- `npm run dev` - 開発サーバー起動時に画像監視も自動実行（推奨）
- `npm run convert-images` - 全画像をWebPに一括変換
- `npm run watch-images` - src/images/の画像を監視（単体実行）
- `npm run clean-images` - 孤立したWebPファイルを削除
- `npm run build:images` - 画像変換 + ビルド
- `npm run build:clean` - クリーン + 画像変換 + ビルド

### Makefile コマンド
- `make help` - ヘルプ表示
- `make install` - 初回セットアップ
- `make setup` - WP-CLIセットアップ
- `make plugin` - プラグインをシンボリックリンク
- `make status` - 環境状態確認
- `make build` - 本番ビルド

## 🏗️ アーキテクチャ概要

モダンなビルドシステム（Vite + TailwindCSS + SCSS）を採用したWordPressテーマです。

### ビルドシステム統合
- **Vite**: メインビルドツール（`src/js/main.js`をエントリーポイント）
- **WordPress統合**: 開発時は`http://localhost:5173`からアセット読み込み
- **HMR**: ホットモジュールリプレースメントで即時反映

### アセットパイプライン
- **エントリーポイント**: `src/js/main.js`が`src/scss/main.scss`をインポート
- **SCSS**: `@use`構文とTailwindCSSディレクティブを使用
- **TailwindCSS**: `./**/*.php`と`./src/**/*.js`をスキャン
- **出力先**: ビルド後のアセットは`dist/`ディレクトリへ

### 開発環境 vs 本番環境
- **開発環境**: Vite開発サーバー（localhost:5173）から直接配信
- **本番環境**: `dist/`ディレクトリにビルドされたアセットを配信

### ディレクトリ構造
```
theme-name/
├── src/                      # 開発用ソースコード
│   ├── js/                   # フロントエンドJavaScript
│   │   └── main.js          # メインエントリーポイント
│   ├── scss/                 # スタイルシート
│   │   ├── main.scss        # メインSCSS
│   │   └── config.scss      # SCSS設定
│   └── images/              # 画像ファイル（変換元）
├── dist/                    # ビルド後のファイル（自動生成）
├── scripts/                 # 開発支援スクリプト
│   ├── convert-images.js    # 画像変換処理
│   ├── watch-images.js      # 画像監視処理
│   └── convert-images.config.js # 画像変換設定
├── inc/                     # PHP機能分割
├── templates/               # カスタムページテンプレート
└── tests/                   # テストファイル
```

### WordPress テーマ設定
- **テーマサポート**: title-tag, post-thumbnails, automatic-feed-links
- **ナビゲーション**: 'primary'メニューを'メインメニュー'として登録
- **アセット読み込み**: 開発時はES modulesとしてVite clientを読み込み

## 🖼️ WebP画像変換システム

### 🚀 即時変換機能（推奨）
```bash
# 開発サーバー起動（画像監視付き）
npm run dev
```

**画像生成サイトのような即時反映を実現：**
- ✅ `src/images/photo.jpg` **追加** → 即座に `dist/images/photo.webp` 生成
- ✅ `src/images/photo.jpg` **削除** → 即座に `dist/images/photo.webp` 削除  
- ✅ `src/images/photo.jpg` **変更** → 即座に `dist/images/photo.webp` 更新

### 手動変換機能
```bash
# すべての画像を一括変換
npm run convert-images

# ビルドと画像変換を同時に実行
npm run build:images
```

### 設定ファイル
`../../../development/scripts/convert-images.config.js`で詳細設定が可能：
```javascript
export default {
  // WebP変換品質
  quality: 85,
  
  // 入力ディレクトリ
  inputDirs: ['src/images'],
  
  // 出力ディレクトリ  
  outputDir: 'dist/images',
  
  // 画像名保持（ハッシュなし）
  keepOriginalName: true,
  
  // 元画像削除時にWebPも削除
  smartClean: true,
  
  // 対応形式
  supportedFormats: ['.jpg', '.jpeg', '.png'],
  
  // サイズ展開（オプション）
  sizes: [
    { name: 'original', width: null },
    { name: 'thumbnail', width: 300 },
    { name: 'medium', width: 768 },
    { name: 'large', width: 1200 }
  ]
};
```

### JavaScript側での使用方法
```javascript
// vite-imagetoolsによる変換（ビルド時のみ）
import heroImage from '../images/hero.jpg?webp';
import thumbnail from '../images/photo.jpg?w=300&h=300&webp&quality=85';

// 汎用ヘルパー関数（推奨）
import { createResponsivePicture, loadWebPImage } from './modules/image-handler';

// picture要素生成
const picture = createResponsivePicture('/path/to/image.jpg', '代替テキスト', 'img-fluid');

// 動的WebP読み込み
const webpUrl = await loadWebPImage('/path/to/image.jpg');
```

### PHP側での使用方法
```php
// picture要素でWebPとフォールバックを出力
echo theme_picture_webp($image_url, '代替テキスト', 'img-fluid');

// サイズ指定された画像URLを生成
$thumbnail_url = theme_get_sized_image_url($image_url, 300);
```

### 機能一覧
- **chokidar**: ファイルシステム監視によるリアルタイム変換
- **sharp**: 高速画像処理ライブラリ
- **vite-imagetools**: ビルド時の画像最適化（オプション）
- **自動変換**: 投稿内画像を自動的にpicture要素に変換
- **遅延読み込み**: loading="lazy"属性の自動追加
- **スマートクリーンアップ**: 元画像削除時に対応するWebPも自動削除

## 🔧 WP-CLIセットアップ

### 自動セットアップスクリプト
以下の設定が `scripts/setup-local.sh` で自動実行されます：

```bash
# 日本語設定
wp core language install ja --activate
wp option update timezone_string 'Asia/Tokyo'
wp option update date_format Y.m.d
wp option update time_format H:i

# デフォルトコンテンツ削除
wp post delete 1 2 3 --force

# 必須プラグインインストール
wp plugin install wp-pagenavi wp-multibyte-patch mw-wp-form \
  custom-post-type-ui intuitive-custom-post-order duplicate-post \
  custom-post-type-permalinks siteguard backwpup google-sitemap-generator \
  all-in-one-wp-migration --activate

# パーマリンク設定
wp rewrite structure /%post_id%/
wp rewrite flush
```

## 🎨 SCSSアーキテクチャ

### ディレクトリ構造
```
src/scss/
├── main.scss              # メインエントリーポイント
├── foundation/            # 基礎設定
│   ├── _variables.scss    # 変数定義
│   ├── _mixins.scss       # ミックスイン
│   ├── _functions.scss    # SCSS関数
│   └── _reset.scss        # リセットCSS
├── base/                  # ベーススタイル
│   ├── _typography.scss   # タイポグラフィ
│   ├── _global.scss       # グローバルスタイル
│   └── _animations.scss   # アニメーション定義
├── components/            # 再利用可能なコンポーネント
│   ├── _buttons.scss
│   ├── _cards.scss
│   ├── _forms.scss
│   └── _modals.scss
├── layouts/               # レイアウト関連
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _navigation.scss
│   └── _grid.scss
├── pages/                 # ページ固有のスタイル
│   ├── _home.scss
│   ├── _about.scss
│   └── _contact.scss
├── utils/                 # ユーティリティクラス
│   ├── _spacing.scss
│   ├── _display.scss
│   └── _text.scss
└── vendor/                # サードパーティ
    └── _wordpress.scss    # WordPress固有のスタイル
```

### 命名規則
- **BEM**: `.block__element--modifier`
- **プレフィックス**: `c-`（コンポーネント）、`l-`（レイアウト）、`u-`（ユーティリティ）
- **状態**: `.is-active`、`.is-hidden`
- **JavaScriptフック**: `.js-toggle`、`.js-modal-trigger`

### レスポンシブミックスイン
```scss
// モバイルファーストで記述
.component {
  width: 100%;
  
  @include media('md') {
    width: 50%;
  }
  
  @include media('lg') {
    width: 33.333%;
  }
}
```

## 🏗️ プロジェクト構造（推奨）

### 現在の構造
```
sou-space.osaka/            # WordPressインストールディレクトリ
├── app/
│   └── public/
│       └── wp-content/
│           └── themes/
│               └── mythme/  # 現在の作業ディレクトリ
└── development/            # 開発リソース
    ├── docs/              # ドキュメント
    ├── scripts/           # 自動化スクリプト
    ├── themes/            # テーマ開発
    └── plugins/           # プラグイン開発
```

### プラグイン開発
カスタムプラグインの開発時は、シンボリックリンクを使用：
```bash
# 開発ディレクトリ
ln -s /path/to/plugin-dev/webp-converter /path/to/wp-content/plugins/webp-converter
```

## 📚 関連ドキュメント

詳細な情報は `development/docs/` 内の以下のドキュメントを参照：
- `quick-start-local.md` - Local環境のクイックスタート
- `directory-structure.md` - ディレクトリ構造と役割分担
- `coding-standards.md` - コーディング規約
- `scss-architecture.md` - SCSSアーキテクチャ
- `image-conversion-advanced.md` - 画像変換システムの詳細
- `webp-plugin-specification.md` - WebPプラグイン仕様
- `local-development-automation.md` - 開発環境の自動化