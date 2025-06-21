<?php
/**
 * My WP Vite Template - functions.php
 * Vite + TailwindCSS + SCSS 開発環境の設定
 * 
 * @author SP WEB CREAT.
 * @link https://www.sp-webcreat.pro/
 */

/**
 * Viteアセットの読み込み（開発・本番環境対応）
 */
function my_wp_vite_enqueue_assets() {
    $is_development = defined('WP_DEBUG') && WP_DEBUG;
    
    // 開発環境の場合、Viteサーバーの生存確認
    $vite_server_running = false;
    if ($is_development) {
        $context = stream_context_create(['http' => ['timeout' => 1]]);
        $vite_check = @file_get_contents('http://localhost:5173/@vite/client', false, $context);
        $vite_server_running = $vite_check !== false;
    }
    
    if ($is_development && $vite_server_running) {
        // 開発環境: Viteサーバーから直接読み込み
        wp_enqueue_script('vite-client', 'http://localhost:5173/@vite/client', [], '1.0', false);
        wp_enqueue_script('vite-main', 'http://localhost:5173/development/src/js/main.js', [], '1.0', true);
        
        // 開発環境でのFOUC（Flash of Unstyled Content）対策
        // 初期CSSを即座に適用するためのインラインスタイル
        add_action('wp_head', function() {
            ?>
            <style id="vite-dev-css">
                /* 開発環境での初期スタイル - FOUC防止 */
                body { opacity: 0; transition: opacity 0.3s ease-in-out; }
                body.vite-ready { opacity: 1; }
            </style>
            <script>
                // Viteの準備が完了したらbodyを表示
                if (typeof window !== 'undefined') {
                    let viteReadyTimeout = setTimeout(() => {
                        document.body.classList.add('vite-ready');
                    }, 100);
                    
                    // Viteのモジュールが読み込まれたら即座に表示
                    if (import.meta && import.meta.hot) {
                        import.meta.hot.on('vite:connect', () => {
                            clearTimeout(viteReadyTimeout);
                            document.body.classList.add('vite-ready');
                        });
                    }
                }
            </script>
            <?php
        }, 5);
        
        // Vite用のmodule scriptタグを追加
        add_filter('script_loader_tag', function($tag, $handle) {
            if ($handle === 'vite-client' || $handle === 'vite-main') {
                return str_replace('<script', '<script type="module"', $tag);
            }
            return $tag;
        }, 10, 2);
    } else {
        // 本番環境: ビルド済みアセットを読み込み
        $manifest_path = get_template_directory() . '/dist/.vite/manifest.json';
        
        if (file_exists($manifest_path)) {
            $manifest = json_decode(file_get_contents($manifest_path), true);
            
            if (isset($manifest['development/src/js/main.js'])) {
                $main_js = $manifest['development/src/js/main.js']['file'];
                $main_css = $manifest['development/src/js/main.js']['css'][0] ?? null;
                
                // CSSを読み込み
                if ($main_css) {
                    wp_enqueue_style('main-css', get_template_directory_uri() . '/dist/' . $main_css, [], '1.0');
                }
                
                // JSを読み込み
                wp_enqueue_script('main-js', get_template_directory_uri() . '/dist/' . $main_js, [], '1.0', true);
            }
        } else {
            // フォールバック: ビルド済みアセットがない場合
            wp_enqueue_style('fallback-css', get_template_directory_uri() . '/style.css', [], '1.0');
        }
    }
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