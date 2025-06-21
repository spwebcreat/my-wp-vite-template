# WordPress WebP Converter プラグイン仕様書

## 🎯 概要

WordPressサイトの画像を自動的にWebP形式に変換・配信する高機能プラグイン。
現在テーマ内に実装されているWebP機能を独立したプラグインとして再構築。

## 📋 機能要件

### コア機能
1. **WebP形式のサポート**
   - WebP画像のアップロード許可
   - メディアライブラリでのWebP表示対応

2. **自動変換機能**
   - アップロード時の自動WebP変換
   - 既存画像の一括変換
   - picture要素による自動出力

3. **最適化機能**
   - 画質設定（デフォルト: 85%）
   - 複数サイズの自動生成
   - 遅延読み込み（lazy loading）対応

4. **管理画面機能**
   - 設定画面での詳細カスタマイズ
   - 変換状況の確認
   - 一括処理の実行

## 🏗️ プラグイン構造

```
wp-content/plugins/webp-converter/
├── webp-converter.php          # メインプラグインファイル
├── readme.txt                  # WordPress.org用説明ファイル
├── LICENSE                     # ライセンスファイル
├── uninstall.php              # アンインストール処理
├── includes/                   # コア機能
│   ├── class-webp-converter.php        # メインクラス
│   ├── class-webp-admin.php           # 管理画面クラス
│   ├── class-webp-converter-core.php  # 変換処理クラス
│   ├── class-webp-frontend.php        # フロントエンド出力
│   └── class-webp-ajax.php            # Ajax処理
├── admin/                      # 管理画面関連
│   ├── views/                  # 管理画面テンプレート
│   │   ├── settings-page.php
│   │   └── bulk-convert.php
│   ├── css/
│   │   └── admin.css
│   └── js/
│       └── admin.js
├── assets/                     # フロントエンド用アセット
│   ├── css/
│   └── js/
│       └── lazy-load.js
└── languages/                  # 多言語対応
    └── webp-converter-ja.po
```

## 🔧 技術仕様

### プラグインヘッダー
```php
/**
 * Plugin Name: WebP Converter for Media
 * Plugin URI: https://example.com/webp-converter
 * Description: WordPressの画像を自動的にWebP形式に変換し、サイトの表示速度を向上させます
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * Text Domain: webp-converter
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * License: GPL v2 or later
 */
```

### データベース設計
```sql
-- オプションテーブルに保存する設定
webp_converter_settings = {
    'quality': 85,
    'auto_convert': true,
    'convert_on_upload': true,
    'enable_lazy_load': true,
    'supported_formats': ['jpg', 'jpeg', 'png'],
    'exclude_sizes': [],
    'preserve_original': true
}

-- 変換履歴（別テーブル作成を検討）
CREATE TABLE {$wpdb->prefix}webp_converter_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attachment_id INT NOT NULL,
    original_size INT,
    webp_size INT,
    compression_rate FLOAT,
    converted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_attachment (attachment_id)
);
```

### 主要クラス設計

#### 1. WebP_Converter（メインクラス）
```php
class WebP_Converter {
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->load_dependencies();
        $this->set_locale();
        $this->define_admin_hooks();
        $this->define_public_hooks();
    }
}
```

#### 2. WebP_Converter_Core（変換処理）
```php
class WebP_Converter_Core {
    public function convert_image($attachment_id) {
        // GD/Imagickを使用してWebP変換
    }
    
    public function bulk_convert($attachment_ids) {
        // 一括変換処理
    }
    
    public function get_webp_url($image_url) {
        // WebP URLを生成
    }
}
```

#### 3. WebP_Frontend（フロントエンド出力）
```php
class WebP_Frontend {
    public function filter_content($content) {
        // 投稿内容のimg要素をpicture要素に変換
    }
    
    public function render_picture_element($image_url, $alt, $class) {
        // picture要素を生成
    }
}
```

## 📱 管理画面設計

### 設定ページ
- **基本設定タブ**
  - WebP変換品質（スライダー: 50-100）
  - 自動変換の有効/無効
  - アップロード時変換の有効/無効
  - 対応画像形式の選択

- **詳細設定タブ**
  - 除外する画像サイズ
  - 元画像の保持設定
  - 遅延読み込みの設定
  - カスタムディレクトリ設定

- **一括変換タブ**
  - 既存画像の検索・フィルタ
  - 変換対象の選択
  - プログレスバー表示
  - 変換履歴の表示

### ダッシュボードウィジェット
- 変換済み画像数
- 節約された容量
- 最近の変換履歴

## 🔌 フック・フィルター

### アクションフック
```php
// 画像変換前
do_action('webp_converter_before_convert', $attachment_id);

// 画像変換後
do_action('webp_converter_after_convert', $attachment_id, $webp_path);

// 一括変換完了
do_action('webp_converter_bulk_complete', $converted_count);
```

### フィルターフック
```php
// 変換品質の調整
apply_filters('webp_converter_quality', $quality, $attachment_id);

// 対応形式の追加
apply_filters('webp_converter_supported_formats', $formats);

// picture要素の出力カスタマイズ
apply_filters('webp_converter_picture_output', $html, $image_url);
```

## 🚀 実装の流れ

### ✅ フェーズ1: 基本機能（完了）
1. ✅ プラグインの基本構造作成
2. ✅ WebPアップロードサポート
3. ✅ 基本的な変換機能実装
4. ✅ picture要素出力機能
5. ✅ WP-CLI完全対応

### 🔄 フェーズ2: 管理画面（一部実装済み）
1. ✅ 基本設定ページの実装
2. 🚧 一括変換機能（CLI版完了）
3. 🚧 Ajax処理の実装（基本構造のみ）
4. 🚧 プログレス表示（次回実装予定）

### 📋 フェーズ3: 最適化（次回実装予定）
1. ✅ 遅延読み込み実装（基本版）
2. 🚧 キャッシュ機能
3. 🚧 パフォーマンス最適化
4. ✅ エラーハンドリング強化

## 🎯 WP-CLIコマンド一覧（実装済み）

```bash
# 全画像をWebPに変換
wp webp convert-all [--quality=85] [--batch-size=50] [--dry-run]

# 特定画像をWebPに変換
wp webp convert <attachment-id> [--quality=85]

# 変換統計を表示
wp webp stats

# 変換可能画像を検索
wp webp search [--format=table|csv|json|count]

# 設定管理
wp webp config get [key]
wp webp config set <key> <value>
wp webp config reset
```

## 🔒 セキュリティ対策

1. **権限チェック**
   ```php
   if (!current_user_can('manage_options')) {
       wp_die(__('権限がありません', 'webp-converter'));
   }
   ```

2. **Nonce検証**
   ```php
   if (!wp_verify_nonce($_POST['_wpnonce'], 'webp_converter_settings')) {
       wp_die(__('不正なリクエストです', 'webp-converter'));
   }
   ```

3. **データサニタイズ**
   ```php
   $quality = absint($_POST['quality']);
   $quality = max(50, min(100, $quality));
   ```

## 📊 パフォーマンス考慮

1. **非同期処理**
   - 大量画像の変換時はバックグラウンド処理
   - WP-Cronまたはカスタムキューシステム

2. **メモリ管理**
   - 画像サイズに応じたメモリ制限調整
   - 分割処理の実装

3. **キャッシュ戦略**
   - 変換済みURLのキャッシュ
   - Transients APIの活用

## 🌐 互換性

### 対応環境
- WordPress 5.8以上
- PHP 7.4以上
- GDライブラリまたはImageMagick

### テスト済みプラグイン
- WP Super Cache
- W3 Total Cache
- Autoptimize
- EWWW Image Optimizer

## 📝 移行ガイド

### テーマからプラグインへの移行手順
1. プラグインをインストール・有効化
2. テーマの`functions.php`から`require_once`行を削除
3. テーマの`inc/webp-support.php`を削除
4. 設定を確認・調整
5. 動作確認

### 後方互換性
- 既存の`theme_picture_webp()`関数は維持
- プラグイン側で同名関数を条件付きで定義

## 🎯 今後の拡張予定

1. **CDN連携**
   - CloudflareのPolish連携
   - その他CDNサービス対応

2. **高度な最適化**
   - AVIF形式サポート
   - 条件付き配信（ブラウザ判定）

3. **分析機能**
   - 変換効果の可視化
   - パフォーマンス改善レポート

## 📚 参考リソース

- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- [WebP画像形式について（Google）](https://developers.google.com/speed/webp)
- [画像最適化のベストプラクティス](https://web.dev/fast/#optimize-your-images)