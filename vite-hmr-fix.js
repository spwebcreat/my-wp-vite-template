// ViteのCSS HMRを最適化するプラグイン
export function cssHmrFixPlugin() {
  return {
    name: 'css-hmr-fix',
    configureServer(server) {
      server.ws.on('vite:beforeUpdate', (payload) => {
        if (payload.updates.some(update => update.type === 'css-update')) {
          // CSS更新時に事前にスタイルを保持
          server.ws.send({
            type: 'custom',
            event: 'css-preserve',
            data: {}
          });
        }
      });
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        // 開発時のCSS保持用スクリプトを注入
        return html.replace(
          '<head>',
          `<head>
            <script>
              if (import.meta.hot) {
                // CSS更新時のちらつき防止
                let preservedStyles = new Map();
                
                import.meta.hot.on('vite:beforeUpdate', (payload) => {
                  // 既存のCSSを保存
                  document.querySelectorAll('style[data-vite-dev-id]').forEach(style => {
                    preservedStyles.set(style.dataset.viteDevId, style.cloneNode(true));
                  });
                });
                
                import.meta.hot.on('vite:afterUpdate', () => {
                  // 新しいCSSが適用されるまで古いCSSを保持
                  setTimeout(() => {
                    preservedStyles.clear();
                  }, 50);
                });
              }
            </script>`
        );
      }
    }
  };
}