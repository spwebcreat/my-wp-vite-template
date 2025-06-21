<?php
/**
 * My WP Vite Template - functions.php
 * Vite + TailwindCSS + SCSS 開発環境の設定
 * 
 * @author SP WEB CREAT.
 * @link https://www.sp-webcreat.pro/
 */

/**
 * Viteの開発サーバーとの連携
 */
function my_wp_vite_enqueue_assets() {
    // 開発環境では直接Viteのアセットを読み込む
    wp_enqueue_script('vite-client', 'http://localhost:5173/@vite/client', [], '1.0', false);
    wp_enqueue_script('vite-main', 'http://localhost:5173/src/js/main.js', [], '1.0', true);
    
    // Vite用のmodule scriptタグを追加
    add_filter('script_loader_tag', function($tag, $handle) {
        if ($handle === 'vite-client' || $handle === 'vite-main') {
            return str_replace('<script', '<script type="module"', $tag);
        }
        return $tag;
    }, 10, 2);
}
add_action('wp_enqueue_scripts', 'my_wp_vite_enqueue_assets');

/**
 * テーマサポート機能の追加
 */
function my_wp_vite_theme_setup() {
    // 基本的なWordPressサポート機能
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('automatic-feed-links');
    add_theme_support('html5', [
        'search-form',
        'comment-form', 
        'comment-list',
        'gallery',
        'caption'
    ]);
    
    // カスタムロゴサポート
    add_theme_support('custom-logo');
    
    // ワイドアライメントサポート（Gutenberg）
    add_theme_support('align-wide');
    
    // レスポンシブエンベッドサポート
    add_theme_support('responsive-embeds');
    
    // ナビゲーションメニュー
    register_nav_menus([
        'primary' => 'メインメニュー',
        'footer' => 'フッターメニュー',
    ]);
}
add_action('after_setup_theme', 'my_wp_vite_theme_setup');

/**
 * ウィジェットエリアの登録
 */
function my_wp_vite_widgets_init() {
    register_sidebar([
        'name' => 'メインサイドバー',
        'id' => 'sidebar-main',
        'description' => 'メインサイドバーのウィジェットエリア',
        'before_widget' => '<div class="widget %2$s">',
        'after_widget' => '</div>',
        'before_title' => '<h3 class="widget-title">',
        'after_title' => '</h3>',
    ]);
}
add_action('widgets_init', 'my_wp_vite_widgets_init');

// 注意: WebP機能はプラグイン（webp-converter）で提供されます