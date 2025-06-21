<?php
class Advanced_WebP_Frontend {
    public function __construct() {
        add_filter('the_content', array($this, 'filter_content'));
        add_filter('widget_text', array($this, 'filter_content'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
    }
    
    public function filter_content($content) {
        if (is_admin() || is_feed()) {
            return $content;
        }
        
        $pattern = '/<img([^>]+)src=["\']([^"\'>]+)["\']([^>]*)>/i';
        $content = preg_replace_callback($pattern, array($this, 'replace_img_with_picture'), $content);
        
        return $content;
    }
    
    private function replace_img_with_picture($matches) {
        $img_attributes = $matches[1] . $matches[3];
        $src = $matches[2];
        
        preg_match('/alt=["\']([^"\'>]*)["\']/', $img_attributes, $alt_matches);
        $alt = isset($alt_matches[1]) ? $alt_matches[1] : '';
        
        preg_match('/class=["\']([^"\'>]*)["\']/', $img_attributes, $class_matches);
        $class = isset($class_matches[1]) ? $class_matches[1] : '';
        
        return $this->render_picture_element($src, $alt, $class, $img_attributes);
    }
    
    public function render_picture_element($image_url, $alt = '', $class = '', $additional_attributes = '') {
        $converter = new Advanced_WebP_Converter_Core();
        $webp_url = $converter->get_webp_url($image_url);
        
        if (!$webp_url) {
            return sprintf('<img src="%s" alt="%s" class="%s" %s>', 
                esc_attr($image_url), 
                esc_attr($alt), 
                esc_attr($class),
                $additional_attributes
            );
        }
        
        $picture_html = '<picture>';
        $picture_html .= sprintf('<source srcset="%s" type="image/webp">', esc_attr($webp_url));
        
        $img_attributes = array();
        $img_attributes[] = sprintf('src="%s"', esc_attr($image_url));
        $img_attributes[] = sprintf('alt="%s"', esc_attr($alt));
        
        if ($class) {
            $img_attributes[] = sprintf('class="%s"', esc_attr($class));
        }
        
        $clean_attributes = preg_replace('/\s*srcset=["\'][^"\'>]*["\']/', '', $additional_attributes);
        if (trim($clean_attributes)) {
            $img_attributes[] = trim($clean_attributes);
        }
        
        $picture_html .= sprintf('<img %s>', implode(' ', $img_attributes));
        $picture_html .= '</picture>';
        
        return apply_filters('advanced_webp_converter_picture_output', $picture_html, $image_url);
    }
    
    public function enqueue_frontend_assets() {
        wp_enqueue_script(
            'advanced-webp-converter-support',
            ADVANCED_WEBP_CONVERTER_PLUGIN_URL . 'assets/js/webp-support.js',
            array(),
            ADVANCED_WEBP_CONVERTER_VERSION,
            true
        );
    }
}