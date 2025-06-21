<?php
/**
 * Advanced WebP Converter WP-CLI Commands
 */

if (!defined('ABSPATH')) {
    exit;
}

class Advanced_WebP_CLI extends WP_CLI_Command {
    
    /**
     * すべての画像をWebPに変換
     *
     * ## OPTIONS
     *
     * [--quality=<quality>]
     * : WebP品質 (50-100)
     * ---
     * default: 85
     * ---
     *
     * [--batch-size=<size>]
     * : バッチサイズ
     * ---
     * default: 50
     * ---
     *
     * [--dry-run]
     * : 実行せずに変換対象を表示
     *
     * ## EXAMPLES
     *
     *     wp advanced-webp convert-all
     *     wp advanced-webp convert-all --quality=90
     *     wp advanced-webp convert-all --batch-size=100
     *     wp advanced-webp convert-all --dry-run
     */
    public function convert_all($args, $assoc_args) {
        $quality = WP_CLI\Utils\get_flag_value($assoc_args, 'quality', 85);
        $batch_size = WP_CLI\Utils\get_flag_value($assoc_args, 'batch-size', 50);
        $dry_run = WP_CLI\Utils\get_flag_value($assoc_args, 'dry-run', false);
        
        $converter = new Advanced_WebP_Converter_Core();
        $convertible_images = $converter->get_convertible_images();
        
        if (empty($convertible_images)) {
            WP_CLI::success('変換対象の画像がありません。');
            return;
        }
        
        WP_CLI::log(sprintf('変換対象: %d 個の画像', count($convertible_images)));
        
        if ($dry_run) {
            WP_CLI::log('--- DRY RUN MODE ---');
            foreach ($convertible_images as $attachment_id) {
                $title = get_the_title($attachment_id);
                $file_path = get_attached_file($attachment_id);
                WP_CLI::log(sprintf('ID: %d, タイトル: %s, パス: %s', $attachment_id, $title, $file_path));
            }
            return;
        }
        
        // 設定を一時的に更新
        $original_settings = get_option('advanced_webp_converter_settings', array());
        $temp_settings = $original_settings;
        $temp_settings['quality'] = $quality;
        update_option('advanced_webp_converter_settings', $temp_settings);
        
        $progress = WP_CLI\Utils\make_progress_bar('変換中', count($convertible_images));
        
        $total_converted = 0;
        $total_failed = 0;
        $total_saved = 0;
        
        // バッチ処理
        $batches = array_chunk($convertible_images, $batch_size);
        
        foreach ($batches as $batch) {
            $result = $converter->bulk_convert($batch);
            
            $total_converted += $result['converted'];
            $total_failed += $result['failed'];
            
            foreach ($result['results'] as $item) {
                if ($item['status'] === 'success') {
                    $total_saved += $item['data']['original_size'] - $item['data']['webp_size'];
                }
                $progress->tick();
            }
            
            gc_collect_cycles();
        }
        
        $progress->finish();
        
        // 設定を元に戻す
        update_option('advanced_webp_converter_settings', $original_settings);
        
        WP_CLI::success(sprintf(
            '変換完了: %d 個成功, %d 個失敗, %s 節約',
            $total_converted,
            $total_failed,
            size_format($total_saved)
        ));
    }
    
    /**
     * 特定の画像をWebPに変換
     */
    public function convert($args, $assoc_args) {
        $attachment_id = intval($args[0]);
        $quality = WP_CLI\Utils\get_flag_value($assoc_args, 'quality', 85);
        
        if (!$attachment_id) {
            WP_CLI::error('有効なAttachment IDを指定してください。');
        }
        
        $attachment = get_post($attachment_id);
        if (!$attachment || $attachment->post_type !== 'attachment') {
            WP_CLI::error('指定されたAttachment IDが見つかりません。');
        }
        
        $original_settings = get_option('advanced_webp_converter_settings', array());
        $temp_settings = $original_settings;
        $temp_settings['quality'] = $quality;
        update_option('advanced_webp_converter_settings', $temp_settings);
        
        $converter = new Advanced_WebP_Converter_Core();
        $result = $converter->convert_image($attachment_id);
        
        update_option('advanced_webp_converter_settings', $original_settings);
        
        if (is_wp_error($result)) {
            WP_CLI::error($result->get_error_message());
        }
        
        WP_CLI::success(sprintf(
            '変換完了: %s → %s (%.2f%% 節約)',
            size_format($result['original_size']),
            size_format($result['webp_size']),
            $result['compression_rate']
        ));
    }
    
    /**
     * 変換統計を表示
     */
    public function stats($args, $assoc_args) {
        $converter = new Advanced_WebP_Converter_Core();
        $stats = $converter->get_conversion_stats();
        
        WP_CLI::log('=== Advanced WebP変換統計 ===');
        WP_CLI::log(sprintf('変換済み画像数: %d', $stats['total_converted']));
        WP_CLI::log(sprintf('元画像サイズ合計: %s', size_format($stats['total_original_size'])));
        WP_CLI::log(sprintf('WebPサイズ合計: %s', size_format($stats['total_webp_size'])));
        WP_CLI::log(sprintf('節約サイズ合計: %s', size_format($stats['total_saved'])));
        WP_CLI::log(sprintf('平均圧縮率: %.2f%%', $stats['average_compression']));
    }
    
    /**
     * WebP変換可能な画像を検索
     */
    public function search($args, $assoc_args) {
        $format = WP_CLI\Utils\get_flag_value($assoc_args, 'format', 'table');
        
        $converter = new Advanced_WebP_Converter_Core();
        $convertible_images = $converter->get_convertible_images();
        
        if (empty($convertible_images)) {
            WP_CLI::success('変換対象の画像がありません。');
            return;
        }
        
        if ($format === 'count') {
            WP_CLI::log(count($convertible_images));
            return;
        }
        
        $items = array();
        foreach ($convertible_images as $attachment_id) {
            $title = get_the_title($attachment_id);
            $file_path = get_attached_file($attachment_id);
            $file_size = file_exists($file_path) ? filesize($file_path) : 0;
            $mime_type = get_post_mime_type($attachment_id);
            
            $items[] = array(
                'ID' => $attachment_id,
                'Title' => $title,
                'Size' => size_format($file_size),
                'Type' => $mime_type,
                'Path' => $file_path
            );
        }
        
        WP_CLI\Utils\format_items($format, $items, array('ID', 'Title', 'Size', 'Type', 'Path'));
    }
    
    /**
     * WebP変換設定を管理
     */
    public function config($args, $assoc_args) {
        $action = isset($args[0]) ? $args[0] : 'get';
        $key = isset($args[1]) ? $args[1] : null;
        $value = isset($args[2]) ? $args[2] : null;
        
        $settings = get_option('advanced_webp_converter_settings', array());
        
        switch ($action) {
            case 'get':
                if ($key) {
                    if (isset($settings[$key])) {
                        WP_CLI::log($settings[$key]);
                    } else {
                        WP_CLI::error("設定キー '{$key}' が見つかりません。");
                    }
                } else {
                    WP_CLI::log('=== Advanced WebP Converter 設定 ===');
                    foreach ($settings as $k => $v) {
                        if (is_array($v)) {
                            $v = implode(', ', $v);
                        } elseif (is_bool($v)) {
                            $v = $v ? 'true' : 'false';
                        }
                        WP_CLI::log(sprintf('%s: %s', $k, $v));
                    }
                }
                break;
                
            case 'set':
                if (!$key || $value === null) {
                    WP_CLI::error('キーと値を指定してください。');
                }
                
                if ($value === 'true') {
                    $value = true;
                } elseif ($value === 'false') {
                    $value = false;
                } elseif (is_numeric($value)) {
                    $value = intval($value);
                }
                
                $settings[$key] = $value;
                update_option('advanced_webp_converter_settings', $settings);
                WP_CLI::success(sprintf("設定 '%s' を '%s' に更新しました。", $key, $value));
                break;
                
            case 'reset':
                $default_settings = array(
                    'quality' => 85,
                    'auto_convert' => true,
                    'convert_on_upload' => true,
                    'enable_lazy_load' => true,
                    'supported_formats' => array('jpg', 'jpeg', 'png'),
                    'exclude_sizes' => array(),
                    'preserve_original' => true
                );
                
                update_option('advanced_webp_converter_settings', $default_settings);
                WP_CLI::success('設定をデフォルトにリセットしました。');
                break;
                
            default:
                WP_CLI::error("不明なアクション: {$action}");
        }
    }
}