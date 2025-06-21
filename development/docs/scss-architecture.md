# SCSS アーキテクチャガイド

## 📁 ディレクトリ構造

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
│   ├── _buttons.scss      # ボタン
│   ├── _cards.scss        # カード
│   ├── _forms.scss        # フォーム要素
│   └── _modals.scss       # モーダル
├── layouts/               # レイアウト関連
│   ├── _header.scss       # ヘッダー
│   ├── _footer.scss       # フッター
│   ├── _navigation.scss   # ナビゲーション
│   └── _grid.scss         # グリッドシステム
├── pages/                 # ページ固有のスタイル
│   ├── _home.scss         # トップページ
│   ├── _about.scss        # 会社概要
│   └── _contact.scss      # お問い合わせ
├── utils/                 # ユーティリティクラス
│   ├── _spacing.scss      # マージン・パディング
│   ├── _display.scss      # 表示関連
│   └── _text.scss         # テキスト関連
└── vendor/                # サードパーティ
    └── _wordpress.scss    # WordPress固有のスタイル
```

## 📝 main.scss の構成

```scss
// 1. Tailwind CSS（使用する場合）
@tailwind base;
@tailwind components;
@tailwind utilities;

// 2. Foundation - 変数・関数・ミックスイン
@use "foundation/variables" as *;
@use "foundation/mixins" as *;
@use "foundation/functions" as *;

// 3. Base - リセット・ベーススタイル
@use "foundation/reset";
@use "base/typography";
@use "base/global";
@use "base/animations";

// 4. Vendor - サードパーティ
@use "vendor/wordpress";

// 5. Layout - レイアウト構造
@use "layouts/header";
@use "layouts/footer";
@use "layouts/navigation";
@use "layouts/grid";

// 6. Components - 再利用可能なパーツ
@use "components/buttons";
@use "components/cards";
@use "components/forms";
@use "components/modals";

// 7. Pages - ページ固有スタイル
@use "pages/home";
@use "pages/about";
@use "pages/contact";

// 8. Utilities - ユーティリティクラス
@use "utils/spacing";
@use "utils/display";
@use "utils/text";
```

## 🎯 命名規則

### BEM (Block Element Modifier)

```scss
// Block
.card { }

// Element
.card__title { }
.card__content { }

// Modifier
.card--featured { }
.card__title--large { }
```

### プレフィックス規則

```scss
// コンポーネント
.c-button { }
.c-card { }

// レイアウト
.l-header { }
.l-grid { }

// ユーティリティ
.u-mt-20 { }
.u-text-center { }

// JavaScript フック
.js-toggle { }
.js-modal-trigger { }

// 状態
.is-active { }
.is-hidden { }
```

## 🔧 変数管理

### foundation/_variables.scss

```scss
// カラーパレット
$color-primary: #1a73e8;
$color-secondary: #34a853;
$color-danger: #ea4335;
$color-warning: #fbbc04;

// スペーシング
$spacing-unit: 8px;
$spacing: (
  'xs': $spacing-unit,
  'sm': $spacing-unit * 2,
  'md': $spacing-unit * 3,
  'lg': $spacing-unit * 4,
  'xl': $spacing-unit * 6,
);

// ブレークポイント
$breakpoints: (
  'sm': 640px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px,
);

// フォント
$font-family-base: -apple-system, BlinkMacSystemFont, "游ゴシック体", YuGothic, sans-serif;
$font-family-heading: "游明朝", YuMincho, serif;
```

## 🛠️ ミックスイン例

### foundation/_mixins.scss

```scss
// レスポンシブ
@mixin media($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// フレックスボックスセンタリング
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// テキストトランケート
@mixin text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

## 📦 コンポーネント例

### components/_buttons.scss

```scss
.c-button {
  display: inline-block;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  // サイズバリエーション
  &--small {
    padding: 8px 16px;
    font-size: 14px;
  }

  &--large {
    padding: 16px 32px;
    font-size: 18px;
  }

  // カラーバリエーション
  &--primary {
    background-color: $color-primary;
    color: white;

    &:hover {
      background-color: darken($color-primary, 10%);
    }
  }

  &--secondary {
    background-color: transparent;
    color: $color-primary;
    border: 2px solid $color-primary;

    &:hover {
      background-color: $color-primary;
      color: white;
    }
  }
}
```

## 🚀 開発のベストプラクティス

1. **モジュラー設計**: 1ファイル1責務を徹底
2. **@use/@forward**: @importではなく@use/@forwardを使用
3. **変数の集約**: 色・サイズ・フォントは変数で管理
4. **ネスティング**: 3階層以上の深いネストは避ける
5. **コメント**: 複雑なロジックには必ずコメントを追加

## 🔄 TailwindCSSとの併用

TailwindCSSのユーティリティクラスを使いつつ、複雑なコンポーネントはSCSSで管理：

```scss
// TailwindCSSの@applyを活用
.c-card {
  @apply bg-white rounded-lg shadow-md p-6;
  
  // カスタムスタイル
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
}
```

## 📱 レスポンシブデザイン

モバイルファーストで記述：

```scss
.c-hero {
  padding: 40px 20px;
  
  @include media('md') {
    padding: 60px 40px;
  }
  
  @include media('lg') {
    padding: 80px 60px;
  }
}
```