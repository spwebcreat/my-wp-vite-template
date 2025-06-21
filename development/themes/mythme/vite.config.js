import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [],
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', '**/*.svg'],
  define: {
    __HMR_CONFIG_NAME__: JSON.stringify('default'),
    __BASE__: JSON.stringify('/')
  },
  build: {
    manifest: true,
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/js/main.js')
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: {
      clientPort: 5173
    }
  }
});