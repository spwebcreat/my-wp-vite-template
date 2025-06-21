# ディレクトリ構造と役割分担

## 📁 プロジェクト全体構造

```
my-wp/
├── docs/                      # ドキュメント
├── development/               # 開発環境
│   ├── scripts/               # 裏方のコード集（ビルドツール・開発支援）
│   ├── src/                   # 開発環境用のソースコード
│   ├── dist/                  # 開発環境用のビルド後のファイル（自動生成）
│   ├── inc/                   # 開発環境用のPHP機能分割（テーマ内）
│   ├── templates/             # 開発環境用のカスタムページテンプレート
│   └── tests/                 # 開発環境用のテストファイル
│   ├── src/                   # Webサイト用のソースコード
│   │   ├── js/                # フロントエンド JavaScript（書き出し先）
│   │   ├── scss/              # スタイルシート（変換元）
│   │   └── images/            # 画像ファイル（変換元）
│   ├── themes/                # テーマファイル
│   │   └── mythme/            # テーマファイル（テーマ内）
│   │       ├── dist/          # テーマ用のアセット（変換先）
│   │       │   ├── assets/    # テーマ用のソースコード（変換先）
│   │       │   │   ├── css/   # テーマ用のCSS（変換先）
│   │       │   │   ├── js/    # テーマ用のJavaScript（変換先）
│   │       │   │   └── images/    # テーマ用の画像（変換先）
│   │       └── index.php      # テーマ用のPHPファイル
│   │       └── functions.php  # テーマ用のPHPファイル
│   │       └── style.css      # テーマ用のCSSファイル
│   ├── plugins/               # プラグインファイル
│   │   └── plugin-name/       # プラグインファイル（プラグイン内）
```

## 🔧 ディレクトリの役割分担

### **`scripts/` - 裏方のコード集**

**役割**: ビルドツール・開発支援（Webページに直接関係しない）

```
scripts/
├── convert-images.js          # 画像自動変換処理（一括）
├── convert-images.config.js   # 画像変換設定
├── watch-images.js           # 画像監視・即時変換処理
└── clean-images.js           # クリーンアップ処理
```

**特徴**:
- Node.jsで実行される開発支援ツール
- ブラウザでは動作しない
- ビルド時・開発時に実行
- 開発者のための効率化ツール

**実行タイミング**:
```bash
npm run dev              # 開発サーバー起動時（画像監視付き）
npm run build            # ビルド時
npm run convert-images   # 手動一括変換
npm run watch-images     # 画像監視のみ（手動起動）
```

**画像削除の即時反映**:
- ✅ `src/images/photo.jpg` 削除 → 即座に `dist/images/photo.webp` 削除
- ✅ `watch-images.js` がファイルシステムを監視してリアルタイム処理
- ✅ 画像生成サイトのような即時性を実現

### **`src/js/` - Webサイト用のコード**

**役割**: フロントエンドJavaScript（ブラウザで実行）

```
src/js/
├── main.js                    # メインのJavaScript
└── modules/
    ├── image-handler.js       # 画像処理ヘルパー
    ├── swiper-config.js       # Swiperの設定
    └── animation.js           # アニメーション処理
```

**特徴**:
- ブラウザで実際に動作するコード
- ユーザー体験に直接影響
- ES Modulesで記述
- Viteでバンドル・最適化される

**使用例**:
```javascript
// src/js/main.js
import Swiper from 'swiper';
import { createResponsivePicture } from './modules/image-handler.js';

// ユーザーのためのコード
new Swiper('.swiper', { /* 設定 */ });
```

## 🔄 処理の流れ

### **1. 開発時の流れ**
```
1. scripts/convert-images.js → 画像をWebPに変換
2. src/js/main.js → ブラウザで実行
3. Vite → ファイル監視・HMR
```

### **2. ビルド時の流れ**
```
1. scripts/ → 画像変換・最適化
2. src/ → バンドル・圧縮
3. dist/ → 本番用ファイル生成
```

## 📝 実装例

### **scripts/ の使用例**
```javascript
// scripts/convert-images.js
// Gulpライクな自動画像変換
import sharp from 'sharp';

async function convertToWebP(input, output) {
  await sharp(input)
    .webp({ quality: 85 })
    .toFile(output);
}
```

### **src/js/ の使用例**
```javascript
// src/js/modules/swiper-config.js
import Swiper from 'swiper/bundle';

export function initSwiper() {
  return new Swiper('.hero-slider', {
    loop: true,
    autoplay: {
      delay: 5000,
    },
    pagination: {
      el: '.swiper-pagination',
    }
  });
}
```

## 🎯 開発方針

### **scripts/ の開発方針**
- **効率性重視**: 開発効率を向上させるツール
- **自動化**: 手作業を削減
- **設定可能**: config.jsで柔軟にカスタマイズ
- **Gulpライク**: 従来のワークフローを踏襲

### **src/js/ の開発方針**
- **パフォーマンス重視**: ユーザー体験を最優先
- **モジュール化**: 再利用可能なコンポーネント
- **モダンJS**: ES Modules・async/await使用
- **型安全**: TypeScript導入も検討

## 🔗 連携

両ディレクトリは独立していますが、以下で連携します：

1. **scripts/** → 画像を`dist/images/`に出力
2. **src/js/** → `dist/images/`の画像を参照
3. **Vite** → 全体を統合・最適化

この分離により、**開発効率**と**コード品質**を両立させています。