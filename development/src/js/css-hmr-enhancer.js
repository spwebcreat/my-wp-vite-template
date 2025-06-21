/**
 * CSS HMR Enhancer
 * Vite開発環境でのCSS更新時のちらつきを防ぐ
 */

if (import.meta.hot) {
  // 初回読み込み時の処理
  document.addEventListener('DOMContentLoaded', () => {
    // Viteの準備完了を待つ
    const checkViteReady = setInterval(() => {
      if (document.querySelector('[data-vite-dev-id]') || document.querySelector('style[type="text/css"]')) {
        document.body.classList.add('vite-ready');
        clearInterval(checkViteReady);
      }
    }, 10);
    
    // タイムアウト処理（最大300ms待機）
    setTimeout(() => {
      document.body.classList.add('vite-ready');
      clearInterval(checkViteReady);
    }, 300);
  });

  // CSS更新時の処理
  let updateInProgress = false;
  
  import.meta.hot.on('vite:beforeUpdate', (payload) => {
    if (payload.updates.some(update => update.type === 'css-update')) {
      updateInProgress = true;
      // 更新中はトランジションを無効化
      document.body.style.transition = 'none';
    }
  });
  
  import.meta.hot.on('vite:afterUpdate', (payload) => {
    if (updateInProgress) {
      updateInProgress = false;
      // 更新完了後、トランジションを再有効化
      requestAnimationFrame(() => {
        document.body.style.transition = '';
      });
    }
  });
  
  // ページリロード時の処理
  import.meta.hot.on('vite:beforeFullReload', () => {
    // リロード前にフェードアウト
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.1s';
  });
}

// 通常のページ読み込み完了処理
if (!import.meta.hot) {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('vite-ready');
  });
}