<?php
class Advanced_WebP_Admin {
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }
    
    public function add_admin_menu() {
        add_options_page(
            'Advanced WebP Converter設定',
            'Advanced WebP Converter',
            'manage_options',
            'advanced-webp-converter',
            array($this, 'settings_page')
        );
    }
    
    public function register_settings() {
        register_setting('advanced_webp_converter_settings', 'advanced_webp_converter_settings');
    }
    
    public function settings_page() {
        echo '<div class="wrap"><h1>Advanced WebP Converter設定</h1><p>設定機能は次回のアップデートで実装予定です。</p></div>';
    }
}