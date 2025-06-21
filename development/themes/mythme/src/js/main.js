import '../scss/main.scss';

console.log('🎯 Vite is working! JavaScript loaded successfully');
console.log('🎨 SCSS + TailwindCSS should be loaded too');
console.log('🖼️  開発環境でもWebP変換が有効です（本番と同じ体験）');

// フロントエンド画像ハンドリングモジュールの使用例
import { loadImage, createLazyImage, renderImageGallery } from './modules/image-handler.js';

// DOMContentLoadedで画像処理を初期化
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM loaded - 画像ハンドリング初期化中...');
  
  // 遅延読み込み画像の例
  const lazyImages = document.querySelectorAll('[data-lazy-src]');
  lazyImages.forEach(el => {
    const lazySrc = el.dataset.lazySrc;
    const lazyImg = createLazyImage(lazySrc, el.alt, {
      className: el.className,
      width: el.width,
      height: el.height
    });
    el.parentNode.replaceChild(lazyImg, el);
  });
  
  // 静的画像の動的読み込み例
  const imageContainer = document.querySelector('.image-container');
  if (imageContainer) {
    // 静的画像をViteで処理して表示
    loadImage('../images/mv02.jpg').then(imageUrl => {
      if (imageUrl) {
        const img = createLazyImage(imageUrl, 'メイン画像', {
          className: 'hero-image',
          width: 800,
          height: 600
        });
        imageContainer.appendChild(img);
        console.log('✅ 静的画像を読み込みました');
      }
    }).catch(err => {
      console.log('⚠️ 静的画像の読み込みをスキップしました');
    });
  }
  
  console.log('✅ 画像ハンドリング初期化完了');
});

