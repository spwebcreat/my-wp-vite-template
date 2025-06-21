<?php
/**
 * Advanced WebP変換のコア機能
 *
 * @package Advanced_WebP_Converter
 */

if (!defined('ABSPATH')) {
    exit;
}

class Advanced_WebP_Converter_Core {
    
    /**
     * 画像を変換
     */
    public function convert_image($attachment_id) {
        $file_path = get_attached_file($attachment_id);
        
        if (!$file_path || !file_exists($file_path)) {
            return new WP_Error('file_not_found', __('画像ファイルが見つかりません。', 'advanced-webp-converter'));
        }
        
        $file_info = pathinfo($file_path);
        $supported_formats = array('jpg', 'jpeg', 'png');
        
        if (!in_array(strtolower($file_info['extension']), $supported_formats)) {
            return new WP_Error('unsupported_format', __('サポートされていない画像形式です。', 'advanced-webp-converter'));
        }
        
        // WebP変換前のアクションフック
        do_action('advanced_webp_converter_before_convert', $attachment_id);
        
        $result = $this->convert_to_webp($file_path, $attachment_id);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        // WebP変換後のアクションフック
        do_action('advanced_webp_converter_after_convert', $attachment_id, $result['webp_path']);
        
        // 変換履歴を保存
        $this->save_conversion_history($attachment_id, $result);
        
        return $result;
    }
    
    /**
     * WebP変換処理
     */
    private function convert_to_webp($file_path, $attachment_id) {
        $upload_dir = wp_upload_dir();
        $relative_path = str_replace($upload_dir['basedir'], '', $file_path);
        $webp_path = $upload_dir['basedir'] . '/webp' . $relative_path;
        $webp_path = preg_replace('/\.(jpg|jpeg|png)$/i', '.webp', $webp_path);
        
        // WebP用ディレクトリを作成
        $webp_dir = dirname($webp_path);
        if (!file_exists($webp_dir)) {
            wp_mkdir_p($webp_dir);
        }
        
        // 設定を取得
        $settings = get_option('advanced_webp_converter_settings', array());
        $quality = apply_filters('advanced_webp_converter_quality', $settings['quality'] ?? 85, $attachment_id);
        
        $original_size = filesize($file_path);
        $conversion_result = false;
        
        // ImageMagickが利用可能な場合
        if (extension_loaded('imagick')) {
            $conversion_result = $this->convert_with_imagick($file_path, $webp_path, $quality);
        }
        
        // GDライブラリで変換（フォールバック）
        if (!$conversion_result && extension_loaded('gd')) {
            $conversion_result = $this->convert_with_gd($file_path, $webp_path, $quality);
        }
        
        if (!$conversion_result) {
            return new WP_Error('conversion_failed', __('WebP変換に失敗しました。', 'advanced-webp-converter'));
        }
        
        $webp_size = file_exists($webp_path) ? filesize($webp_path) : 0;
        $compression_rate = $webp_size > 0 ? (($original_size - $webp_size) / $original_size) * 100 : 0;
        
        return array(
            'webp_path' => $webp_path,
            'webp_url' => $upload_dir['baseurl'] . '/webp' . $relative_path,
            'original_size' => $original_size,
            'webp_size' => $webp_size,
            'compression_rate' => round($compression_rate, 2)
        );
    }
    
    /**
     * ImageMagickを使用した変換
     */
    private function convert_with_imagick($file_path, $webp_path, $quality) {
        try {
            $imagick = new Imagick($file_path);
            $imagick->setImageFormat('webp');
            $imagick->setImageCompressionQuality($quality);
            $imagick->stripImage();
            
            $result = $imagick->writeImage($webp_path);
            $imagick->clear();
            $imagick->destroy();
            
            return $result;
        } catch (Exception $e) {
            error_log('Advanced WebP Converter ImageMagick Error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * GDライブラリを使用した変換
     */
    private function convert_with_gd($file_path, $webp_path, $quality) {
        $file_info = pathinfo($file_path);
        $extension = strtolower($file_info['extension']);
        
        try {
            switch ($extension) {
                case 'jpg':
                case 'jpeg':
                    $image = imagecreatefromjpeg($file_path);
                    break;
                case 'png':
                    $image = imagecreatefrompng($file_path);
                    imagealphablending($image, false);
                    imagesavealpha($image, true);
                    break;
                default:
                    return false;
            }
            
            if (!$image) {
                return false;
            }
            
            $result = imagewebp($image, $webp_path, $quality);
            imagedestroy($image);
            
            return $result;
        } catch (Exception $e) {
            error_log('Advanced WebP Converter GD Error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * 一括変換処理
     */
    public function bulk_convert($attachment_ids) {
        $converted_count = 0;
        $failed_count = 0;
        $results = array();
        
        foreach ($attachment_ids as $attachment_id) {
            $result = $this->convert_image($attachment_id);
            
            if (is_wp_error($result)) {
                $failed_count++;
                $results[] = array(
                    'attachment_id' => $attachment_id,
                    'status' => 'failed',
                    'error' => $result->get_error_message()
                );
            } else {
                $converted_count++;
                $results[] = array(
                    'attachment_id' => $attachment_id,
                    'status' => 'success',
                    'data' => $result
                );
            }
            
            if (memory_get_usage() > (ini_get('memory_limit') * 0.8)) {
                gc_collect_cycles();
            }
        }
        
        do_action('advanced_webp_converter_bulk_complete', $converted_count, $failed_count);
        
        return array(
            'converted' => $converted_count,
            'failed' => $failed_count,
            'results' => $results
        );
    }
    
    /**
     * WebP URLを取得
     */
    public function get_webp_url($image_url) {
        $upload_dir = wp_upload_dir();
        
        if (preg_match('/\.webp$/i', $image_url)) {
            return $image_url;
        }
        
        $webp_url = str_replace($upload_dir['baseurl'], $upload_dir['baseurl'] . '/webp', $image_url);
        $webp_url = preg_replace('/\.(jpg|jpeg|png)$/i', '.webp', $webp_url);
        
        $webp_path = str_replace($upload_dir['baseurl'], $upload_dir['basedir'], $webp_url);
        
        if (file_exists($webp_path)) {
            return $webp_url;
        }
        
        return false;
    }
    
    /**
     * 変換履歴を保存
     */
    private function save_conversion_history($attachment_id, $result) {
        $history = get_option('advanced_webp_converter_history', array());
        
        $history[$attachment_id] = array(
            'converted_at' => current_time('mysql'),
            'original_size' => $result['original_size'],
            'webp_size' => $result['webp_size'],
            'compression_rate' => $result['compression_rate']
        );
        
        if (count($history) > 1000) {
            $history = array_slice($history, -1000, null, true);
        }
        
        update_option('advanced_webp_converter_history', $history);
    }
    
    /**
     * 変換可能な画像IDを取得
     */
    public function get_convertible_images() {
        $args = array(
            'post_type' => 'attachment',
            'post_mime_type' => array('image/jpeg', 'image/jpg', 'image/png'),
            'post_status' => 'inherit',
            'posts_per_page' => -1,
            'fields' => 'ids'
        );
        
        return get_posts($args);
    }
    
    /**
     * 変換統計を取得
     */
    public function get_conversion_stats() {
        $history = get_option('advanced_webp_converter_history', array());
        
        $total_converted = count($history);
        $total_original_size = 0;
        $total_webp_size = 0;
        
        foreach ($history as $record) {
            $total_original_size += $record['original_size'];
            $total_webp_size += $record['webp_size'];
        }
        
        $total_saved = $total_original_size - $total_webp_size;
        $average_compression = $total_original_size > 0 ? (($total_saved / $total_original_size) * 100) : 0;
        
        return array(
            'total_converted' => $total_converted,
            'total_original_size' => $total_original_size,
            'total_webp_size' => $total_webp_size,
            'total_saved' => $total_saved,
            'average_compression' => round($average_compression, 2)
        );
    }
}