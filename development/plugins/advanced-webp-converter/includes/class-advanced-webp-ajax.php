<?php
class Advanced_WebP_Ajax {
    public function __construct() {
        add_action('wp_ajax_advanced_webp_bulk_convert', array($this, 'handle_bulk_convert'));
        add_action('wp_ajax_advanced_webp_get_stats', array($this, 'handle_get_stats'));
    }
    
    public function handle_bulk_convert() {
        check_ajax_referer('advanced_webp_converter_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('権限がありません');
        }
        
        wp_send_json_success(array('message' => 'Ajax機能は次回のアップデートで実装予定です。'));
    }
    
    public function handle_get_stats() {
        check_ajax_referer('advanced_webp_converter_admin', 'nonce');
        
        $converter = new Advanced_WebP_Converter_Core();
        $stats = $converter->get_conversion_stats();
        
        wp_send_json_success($stats);
    }
}