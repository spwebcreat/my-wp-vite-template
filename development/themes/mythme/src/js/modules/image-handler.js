/**
 * フロントエンド画像ハンドリングモジュール
 * テーマ側は純粋なDOM操作とUI機能に集中
 * WebP変換機能はAdvanced WebP Converterプラグインが担当
 */

/**
 * 静的画像を動的にインポート
 * @param {string} imagePath - 画像のパス
 * @returns {Promise<string>} 画像のURL
 */
export async function loadImage(imagePath) {
  try {
    const module = await import(/* @vite-ignore */ imagePath);
    return module.default;
  } catch (error) {
    console.error('画像の読み込みに失敗しました:', error);
    return null;
  }
}

/**
 * 遅延読み込み対応の画像要素を作成（プラグインと連携）
 * @param {string} imageUrl - 画像のURL
 * @param {string} alt - 代替テキスト
 * @param {Object} options - オプション設定
 * @returns {HTMLImageElement} img要素
 */
export function createLazyImage(imageUrl, alt = '', options = {}) {
  const img = document.createElement('img');
  
  img.src = imageUrl;
  img.alt = alt;
  img.loading = 'lazy'; // ネイティブ遅延読み込み
  
  if (options.className) img.className = options.className;
  if (options.width) img.width = options.width;
  if (options.height) img.height = options.height;
  
  return img;
}

/**
 * レスポンシブ画像のsrcsetを生成
 * @param {string} baseUrl - ベースとなる画像URL
 * @param {Array} sizes - サイズの配列 [{width: 400, suffix: '-medium'}, ...]
 * @returns {string} srcset文字列
 */
export function generateSrcset(baseUrl, sizes = []) {
  if (!sizes.length) return '';
  
  const srcsetParts = sizes.map(size => {
    const url = baseUrl.replace(/(\.[^.]+)$/, `${size.suffix}$1`);
    return `${url} ${size.width}w`;
  });
  
  return srcsetParts.join(', ');
}

/**
 * 画像のプリロード
 * @param {string} imageUrl - プリロードする画像のURL
 * @param {string} as - リソースタイプ（デフォルト: 'image'）
 */
export function preloadImage(imageUrl, as = 'image') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = imageUrl;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * 画像が読み込まれているかチェック
 * @param {HTMLImageElement} img - チェックする画像要素
 * @returns {Promise<boolean>} 読み込み完了でtrue
 */
export function waitForImageLoad(img) {
  return new Promise((resolve) => {
    if (img.complete) {
      resolve(true);
    } else {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    }
  });
}

/**
 * 画像ギャラリーのDOM操作ヘルパー
 * @param {Array} images - 画像の配列
 * @param {HTMLElement} container - コンテナ要素
 */
export function renderImageGallery(images, container) {
  if (!container) {
    console.error('コンテナ要素が見つかりません');
    return;
  }
  
  const fragment = document.createDocumentFragment();
  
  images.forEach((image, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'gallery-item';
    wrapper.dataset.index = index;
    
    const img = createLazyImage(image.url, image.alt, {
      className: 'gallery-image',
      width: image.width,
      height: image.height
    });
    
    wrapper.appendChild(img);
    fragment.appendChild(wrapper);
  });
  
  container.appendChild(fragment);
}