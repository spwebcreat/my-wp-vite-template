<?php
/**
 * Plugin Name: Advanced WebP Converter
 * Plugin URI: https://github.com/your-organization/advanced-webp-converter
 * Description: WordPressの画像を自動的にWebP形式に変換し、サイトの表示速度を向上させます。WP-CLI対応で開発効率も向上。
 * Version: 1.0.0
 * Author: Your Development Team
 * Author URI: https://your-website.com
 * Text Domain: advanced-webp-converter
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package Advanced_WebP_Converter
 */

// プラグインの直接実行を防ぐ
if (!defined('ABSPATH')) {
    exit;
}

// プラグインの定数定義
define('ADVANCED_WEBP_CONVERTER_VERSION', '1.0.0');
define('ADVANCED_WEBP_CONVERTER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ADVANCED_WEBP_CONVERTER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ADVANCED_WEBP_CONVERTER_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * プラグインの有効化フック
 */
function advanced_webp_converter_activate() {
    // デフォルト設定を作成
    $default_settings = array(
        'quality' => 85,
        'auto_convert' => true,
        'convert_on_upload' => true,
        'enable_lazy_load' => true,
        'supported_formats' => array('jpg', 'jpeg', 'png'),
        'exclude_sizes' => array(),
        'preserve_original' => true
    );
    
    add_option('advanced_webp_converter_settings', $default_settings);
    
    // アップロードディレクトリにWebP用サブディレクトリを作成
    $upload_dir = wp_upload_dir();
    $webp_dir = $upload_dir['basedir'] . '/webp';
    if (!file_exists($webp_dir)) {
        wp_mkdir_p($webp_dir);
    }
}
register_activation_hook(__FILE__, 'advanced_webp_converter_activate');

/**
 * プラグインの無効化フック
 */
function advanced_webp_converter_deactivate() {
    // 一時的な設定やキャッシュをクリア
    delete_transient('advanced_webp_converter_bulk_progress');
}
register_deactivation_hook(__FILE__, 'advanced_webp_converter_deactivate');

/**
 * プラグインのメインクラス
 */
class Advanced_WebP_Converter {
    
    /**
     * シングルトンインスタンス
     */
    private static $instance = null;
    
    /**
     * プラグイン設定
     */
    private $settings;
    
    /**
     * シングルトンインスタンスを取得
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * コンストラクタ
     */
    private function __construct() {
        $this->settings = get_option('advanced_webp_converter_settings', array());
        $this->load_dependencies();
        $this->set_locale();
        $this->define_admin_hooks();
        $this->define_public_hooks();
        $this->register_wp_cli_commands();
    }
    
    /**
     * 依存関係の読み込み
     */
    private function load_dependencies() {
        require_once ADVANCED_WEBP_CONVERTER_PLUGIN_DIR . 'includes/class-advanced-webp-converter-core.php';
        require_once ADVANCED_WEBP_CONVERTER_PLUGIN_DIR . 'includes/class-advanced-webp-frontend.php';
        
        if (is_admin()) {
            require_once ADVANCED_WEBP_CONVERTER_PLUGIN_DIR . 'includes/class-advanced-webp-admin.php';
            require_once ADVANCED_WEBP_CONVERTER_PLUGIN_DIR . 'includes/class-advanced-webp-ajax.php';
        }
        
        // WP-CLI対応
        if (defined('WP_CLI') && WP_CLI) {
            require_once ADVANCED_WEBP_CONVERTER_PLUGIN_DIR . 'includes/class-advanced-webp-cli.php';
        }
    }
    
    /**
     * 多言語設定
     */
    private function set_locale() {
        add_action('plugins_loaded', function() {
            load_plugin_textdomain(
                'advanced-webp-converter',
                false,
                dirname(ADVANCED_WEBP_CONVERTER_PLUGIN_BASENAME) . '/languages/'
            );
        });
    }
    
    /**
     * 管理画面フックの定義
     */
    private function define_admin_hooks() {
        if (is_admin()) {
            $admin = new Advanced_WebP_Admin();
            $ajax = new Advanced_WebP_Ajax();
        }
    }
    
    /**
     * フロントエンドフックの定義
     */
    private function define_public_hooks() {
        $frontend = new Advanced_WebP_Frontend();
        
        // WebPファイルタイプの許可
        add_filter('upload_mimes', array($this, 'add_webp_mime_type'));
        
        // 画像アップロード時の自動変換
        if (isset($this->settings['convert_on_upload']) && $this->settings['convert_on_upload']) {
            add_action('wp_generate_attachment_metadata', array($this, 'convert_on_upload'), 10, 2);
        }
    }
    
    /**
     * WP-CLIコマンドの登録
     */
    private function register_wp_cli_commands() {
        if (defined('WP_CLI') && WP_CLI) {
            WP_CLI::add_command('advanced-webp', 'Advanced_WebP_CLI');
        }
    }
    
    /**
     * WebPマイムタイプを追加
     */
    public function add_webp_mime_type($mimes) {
        $mimes['webp'] = 'image/webp';
        return $mimes;
    }
    
    /**
     * アップロード時の自動変換
     */
    public function convert_on_upload($metadata, $attachment_id) {
        $converter = new Advanced_WebP_Converter_Core();
        $converter->convert_image($attachment_id);
        return $metadata;
    }
    
    /**
     * 設定を取得
     */
    public function get_settings() {
        return $this->settings;
    }
    
    /**
     * 設定を更新
     */
    public function update_settings($new_settings) {
        $this->settings = wp_parse_args($new_settings, $this->settings);
        update_option('advanced_webp_converter_settings', $this->settings);
    }
}

/**
 * プラグインの初期化
 */
function advanced_webp_converter_init() {
    return Advanced_WebP_Converter::get_instance();
}

// プラグインを開始
add_action('plugins_loaded', 'advanced_webp_converter_init');

/**
 * 後方互換性のためのヘルパー関数
 * テーマで使用されている場合に対応
 */
if (!function_exists('theme_picture_webp')) {
    function theme_picture_webp($image_url, $alt = '', $class = '') {
        $frontend = new Advanced_WebP_Frontend();
        return $frontend->render_picture_element($image_url, $alt, $class);
    }
}