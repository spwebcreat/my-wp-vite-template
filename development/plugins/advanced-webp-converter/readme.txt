=== Advanced WebP Converter ===
Contributors: your-team
Tags: webp, image optimization, performance, wp-cli, advanced
Requires at least: 5.8
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

WordPressの画像を自動的にWebP形式に変換し、サイトの表示速度を向上させます。WP-CLI対応で開発効率も向上。

== Description ==

Advanced WebP Converterは、WordPressサイトの画像を自動的にWebP形式に変換する高機能プラグインです。

主な機能:
* 画像アップロード時の自動WebP変換
* 既存画像の一括変換
* picture要素による自動フォールバック
* WP-CLI完全対応
* 遅延読み込み（Lazy Loading）対応
* 詳細な変換統計とレポート

== Installation ==

1. プラグインファイルを `/wp-content/plugins/advanced-webp-converter` ディレクトリにアップロード
2. WordPress管理画面でプラグインを有効化
3. 設定 > Advanced WebP Converter で設定を調整

WP-CLI使用例:
`wp advanced-webp convert-all --quality=85`

== Frequently Asked Questions ==

= WebP形式とは何ですか？ =

WebPはGoogleが開発した次世代画像形式で、JPEGやPNGと比較して30-50%のファイルサイズ削減が可能です。

= 古いブラウザでも表示されますか？ =

はい。picture要素によるフォールバック機能により、WebP未対応ブラウザでは元の画像が表示されます。

== Changelog ==

= 1.0.0 =
* 初回リリース
* 基本的なWebP変換機能
* WP-CLIコマンド対応
* picture要素による自動フォールバック