# 動画ファイル

こちらに動画ファイル (.mp4, .webm) を配置してください。

例:
- hero-video.mp4
- background-loop.webm

## 使用方法

```php
// テーマ内での参照方法
<video>
  <source src="<?php echo get_template_directory_uri(); ?>/dist/assets/videos/hero-video.mp4" type="video/mp4">
</video>
```