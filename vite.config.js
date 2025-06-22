import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { cssHmrFixPlugin } from './vite-hmr-fix.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// カスタムプラグイン: src/assetsをdist/assetsにコピー（開発時・ビルド時両対応）
const copyAssetsPlugin = () => {
  const srcAssetsDir = path.resolve(__dirname, 'development/src/assets');
  const distAssetsDir = path.resolve(__dirname, 'development/themes/mythme/dist/assets');
  
  // デバウンス用のタイムアウトを保持
  let syncTimeout = null;
  
  // ファイル単位でのコピー（Gulpライクな処理）
  const copyFile = (srcFile, destFile) => {
    const destDir = path.dirname(destFile);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcFile, destFile);
  };
  
  // ファイル単位での削除
  const deleteFile = (destFile) => {
    if (fs.existsSync(destFile)) {
      fs.unlinkSync(destFile);
      // 空のディレクトリを削除
      const dir = path.dirname(destFile);
      try {
        const files = fs.readdirSync(dir);
        if (files.length === 0) {
          fs.rmdirSync(dir);
        }
      } catch (e) {
        // ディレクトリが削除できない場合は無視
      }
    }
  };
  
  // 初回の全コピー
  const copyRecursive = (src, dest) => {
    if (!fs.existsSync(src)) return;
    
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      fs.readdirSync(src).forEach(childItem => {
        copyRecursive(
          path.join(src, childItem),
          path.join(dest, childItem)
        );
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };
  
  const copyAssets = () => {
    // src/assets配下のすべてのディレクトリを動的に取得してコピー
    if (fs.existsSync(srcAssetsDir)) {
      fs.readdirSync(srcAssetsDir).forEach(item => {
        const itemPath = path.join(srcAssetsDir, item);
        if (fs.statSync(itemPath).isDirectory()) {
          copyRecursive(
            itemPath,
            path.join(distAssetsDir, item)
          );
        }
      });
    }
    console.log('📁 Assets copied to dist/assets/');
  };

  // Gulpライクな差分同期
  const syncAssets = () => {
    console.log('🔄 Syncing assets...');
    
    // src/assets配下のすべてのディレクトリを動的に取得
    const getAssetDirs = () => {
      if (!fs.existsSync(srcAssetsDir)) return [];
      
      return fs.readdirSync(srcAssetsDir)
        .filter(item => {
          const itemPath = path.join(srcAssetsDir, item);
          return fs.statSync(itemPath).isDirectory();
        });
    };
    
    // dist/assets配下のディレクトリも取得（srcに存在しないものを検出）
    const getDistDirs = () => {
      if (!fs.existsSync(distAssetsDir)) return [];
      
      return fs.readdirSync(distAssetsDir)
        .filter(item => {
          const itemPath = path.join(distAssetsDir, item);
          return fs.statSync(itemPath).isDirectory();
        });
    };
    
    const srcDirs = getAssetDirs();
    const distDirs = getDistDirs();
    
    // distにのみ存在するディレクトリを削除
    distDirs.forEach(dir => {
      if (!srcDirs.includes(dir)) {
        const distDir = path.join(distAssetsDir, dir);
        // ディレクトリを再帰的に削除
        fs.rmSync(distDir, { recursive: true, force: true });
        console.log(`🗑️  Removed directory: ${dir}/`);
      }
    });
    
    // 各ディレクトリの差分を計算して同期
    srcDirs.forEach(dir => {
      const srcDir = path.join(srcAssetsDir, dir);
      const distDir = path.join(distAssetsDir, dir);
      
      // srcに存在するファイルのリストを作成
      const srcFiles = new Set();
      const scanDir = (dir, baseDir, fileSet) => {
        if (!fs.existsSync(dir)) return;
        
        fs.readdirSync(dir).forEach(item => {
          const fullPath = path.join(dir, item);
          const relativePath = path.relative(baseDir, fullPath);
          
          if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath, baseDir, fileSet);
          } else {
            fileSet.add(relativePath);
          }
        });
      };
      
      scanDir(srcDir, srcDir, srcFiles);
      
      // distに存在するファイルで、srcに存在しないものを削除
      if (fs.existsSync(distDir)) {
        const distFiles = new Set();
        scanDir(distDir, distDir, distFiles);
        
        distFiles.forEach(file => {
          if (!srcFiles.has(file)) {
            const distFile = path.join(distDir, file);
            deleteFile(distFile);
            console.log(`🗑️  Removed: ${dir}/${file}`);
          }
        });
      }
      
      // srcのファイルをdistにコピー（新規または更新）
      srcFiles.forEach(file => {
        const srcFile = path.join(srcDir, file);
        const distFile = path.join(distDir, file);
        
        let shouldCopy = !fs.existsSync(distFile);
        if (!shouldCopy) {
          // ファイルが存在する場合は更新時刻をチェック
          const srcStat = fs.statSync(srcFile);
          const distStat = fs.statSync(distFile);
          shouldCopy = srcStat.mtime > distStat.mtime;
        }
        
        if (shouldCopy) {
          copyFile(srcFile, distFile);
          console.log(`📄 Updated: ${dir}/${file}`);
        }
      });
    });
    
    console.log('✅ Assets synchronized');
  };

  return {
    name: 'copy-assets',
    // 開発サーバー起動時に実行
    configureServer(server) {
      // 初回コピー
      copyAssets();
      
      console.log('💡 Gulpライクな自動同期を設定中...');
      
      // Node.js標準のfs.watchFileを使用（より安定）
      const getWatchedDirs = () => {
        if (!fs.existsSync(srcAssetsDir)) return [];
        return fs.readdirSync(srcAssetsDir)
          .filter(item => {
            const itemPath = path.join(srcAssetsDir, item);
            return fs.statSync(itemPath).isDirectory();
          });
      };
      
      const watchers = new Map();
      const dirWatchers = new Map(); // ディレクトリ監視用
      
      // ディレクトリ内のすべてのファイルを監視
      const setupWatchers = (isUpdate = false) => {
        // 更新時のみ、新規ファイルを追加で監視
        if (!isUpdate) {
          // 初回は全クリア
          watchers.forEach((_, file) => {
            fs.unwatchFile(file);
          });
          watchers.clear();
          
          dirWatchers.forEach((_, dir) => {
            fs.unwatchFile(dir);
          });
          dirWatchers.clear();
        }
        
        // src/assets自体を監視（新規ディレクトリの追加/削除を検出）
        if (!dirWatchers.has(srcAssetsDir)) {
          try {
            const watcher = fs.watch(srcAssetsDir, { recursive: false }, (eventType, filename) => {
              console.log(`📁 Assets root ${eventType}: ${filename || ''}`);
              if (syncTimeout) clearTimeout(syncTimeout);
              syncTimeout = setTimeout(() => {
                syncAssets();
                // ディレクトリの追加/削除があった場合は監視対象を更新
                setTimeout(() => setupWatchers(true), 100);
              }, 500);
            });
            dirWatchers.set(srcAssetsDir, watcher);
          } catch (error) {
            console.error(`❌ Error watching assets root:`, error.message);
          }
        }
        
        const watchedDirs = getWatchedDirs();
        watchedDirs.forEach(dir => {
          const dirPath = path.join(srcAssetsDir, dir);
          if (!fs.existsSync(dirPath)) return;
          
          // ディレクトリ自体を監視（重複登録を防ぐ）
          if (!dirWatchers.has(dirPath)) {
            // fs.watchを使用（より高速で信頼性が高い）
            try {
              const watcher = fs.watch(dirPath, { recursive: false }, (eventType, filename) => {
                console.log(`📁 Directory ${eventType}: ${dir}/${filename || ''}`);
                if (syncTimeout) clearTimeout(syncTimeout);
                syncTimeout = setTimeout(() => {
                  syncAssets();
                  // ファイル追加/削除があった場合は監視対象を更新
                  if (eventType === 'rename') {
                    setTimeout(() => setupWatchers(true), 100);
                  }
                }, 500);
              });
              dirWatchers.set(dirPath, watcher);
            } catch (error) {
              console.error(`❌ Error watching directory ${dir}:`, error.message);
            }
          }
          
          // ディレクトリ内のファイルを再帰的に監視
          const watchFilesInDir = (dir) => {
            if (!fs.existsSync(dir)) return;
            
            try {
              fs.readdirSync(dir).forEach(item => {
                const fullPath = path.join(dir, item);
                
                // ファイルが既に削除されている可能性があるためチェック
                if (!fs.existsSync(fullPath)) return;
                
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                  // サブディレクトリも監視
                  if (!dirWatchers.has(fullPath)) {
                    try {
                      const watcher = fs.watch(fullPath, { recursive: false }, (eventType, filename) => {
                        console.log(`📁 Subdirectory ${eventType}: ${path.relative(srcAssetsDir, fullPath)}/${filename || ''}`);
                        if (syncTimeout) clearTimeout(syncTimeout);
                        syncTimeout = setTimeout(() => {
                          syncAssets();
                          if (eventType === 'rename') {
                            setTimeout(() => setupWatchers(true), 100);
                          }
                        }, 500);
                      });
                      dirWatchers.set(fullPath, watcher);
                    } catch (error) {
                      console.error(`❌ Error watching subdirectory ${fullPath}:`, error.message);
                    }
                  }
                  watchFilesInDir(fullPath);
                } else {
                  // ファイルの監視を開始（重複チェック済み）
                  if (!watchers.has(fullPath)) {
                    fs.watchFile(fullPath, { interval: 1000 }, (curr, prev) => {
                      if (curr.mtime !== prev.mtime) {
                        console.log(`📝 File changed: ${path.relative(srcAssetsDir, fullPath)}`);
                        if (syncTimeout) clearTimeout(syncTimeout);
                        syncTimeout = setTimeout(() => syncAssets(), 500);
                      }
                    });
                    watchers.set(fullPath, true);
                  }
                }
              });
            } catch (error) {
              console.error(`❌ Error watching files in ${dir}:`, error.message);
            }
          };
          
          watchFilesInDir(dirPath);
        });
        
        if (!isUpdate) {
          console.log(`✅ Watching ${watchers.size} files and ${dirWatchers.size} directories`);
        }
      };
      
      // 初回セットアップ
      setupWatchers();
      
      // 定期的な同期のみ（監視の再設定は不要）
      const syncInterval = setInterval(() => {
        console.log('🔄 Periodic sync check...');
        syncAssets();
      }, 30000); // 30秒ごとに同期チェック
      
      // HTTPエンドポイントも維持
      server.middlewares.use('/__sync-assets', (req, res) => {
        if (req.method === 'POST') {
          console.log('🔄 Manual sync triggered');
          syncAssets();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(405);
          res.end();
        }
      });
      
      // サーバー停止時のクリーンアップ
      server.httpServer?.on('close', () => {
        // すべてのファイル監視を停止
        watchers.forEach((_, file) => {
          fs.unwatchFile(file);
        });
        watchers.clear();
        
        // すべてのディレクトリ監視を停止（fs.watchはcloseメソッドを使用）
        dirWatchers.forEach((watcher) => {
          if (watcher && typeof watcher.close === 'function') {
            watcher.close();
          }
        });
        dirWatchers.clear();
        
        clearInterval(syncInterval);
        if (syncTimeout) clearTimeout(syncTimeout);
      });
      
      console.log('✅ Gulpライクな自動同期が有効になりました');
      const initialDirs = getWatchedDirs();
      console.log(`📁 監視中: ${initialDirs.length > 0 ? initialDirs.join(', ') : 'なし'}`);
      
      // 3秒後に初回同期
      setTimeout(() => {
        console.log('🧪 Initial sync...');
        syncAssets();
      }, 3000);

      // 既存のchokidar設定は念のため残す（将来的に動作する可能性）

      // ファイル変更監視
      console.log('👀 Watching assets directory:', srcAssetsDir);
      
      // より詳細な監視設定
      const watcher = chokidar.watch(srcAssetsDir, {
        ignored: /^\.|node_modules/, // . で始まるファイルとnode_modulesのみ除外
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100
        },
        usePolling: true, // より確実な監視のためpollingを使用
        interval: 100
      });
      
      console.log('🔍 Chokidar watch options:', {
        directory: srcAssetsDir,
        exists: fs.existsSync(srcAssetsDir),
        readable: fs.accessSync ? 'checking...' : 'unknown'
      });
      
      try {
        fs.accessSync(srcAssetsDir, fs.constants.R_OK);
        console.log('✅ Assets directory is readable');
      } catch (error) {
        console.error('❌ Assets directory access error:', error.message);
      }
      
      watcher.on('change', (path) => {
        console.log('📁 Assets changed:', path, 'copying...');
        copyAssets();
      });
      
      watcher.on('add', (path) => {
        console.log('📁 Asset added:', path, 'copying...');
        copyAssets();
      });
      
      watcher.on('unlink', (path) => {
        console.log('📁 Asset removed:', path, 'synchronizing...');
        syncAssets();
      });
      
      watcher.on('error', error => {
        console.error('❌ Watcher error:', error);
      });
      
      watcher.on('ready', () => {
        console.log('✅ Asset watcher ready');
      });
    },
    // ビルド時にも実行
    writeBundle() {
      copyAssets();
    }
  };
};

export default defineConfig({
  root: process.cwd(),
  base: '/',
  publicDir: false,
  plugins: [copyAssetsPlugin(), cssHmrFixPlugin()],
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', '**/*.svg'],
  define: {
    __HMR_CONFIG_NAME__: JSON.stringify('default'),
    __BASE__: JSON.stringify('/')
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./development/src', import.meta.url)),
      '@scss': fileURLToPath(new URL('./development/src/scss', import.meta.url)),
      '@js': fileURLToPath(new URL('./development/src/js', import.meta.url)),
      '@images': fileURLToPath(new URL('./development/src/images', import.meta.url))
    }
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `
          // グローバルSCSS変数やミックスインがあればここに追加
        `
      }
    }
  },
  build: {
    manifest: true,
    outDir: 'development/themes/mythme/dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'development/src/js/main.js')
      },
      output: {
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost', 
      port: 5173,
      clientPort: 5173
    },
    watch: {
      usePolling: true,
      interval: 100,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      // EventEmitter memory leak警告を軽減
      chokidar: {
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100
        }
      }
    },
    // CSSホットリロード最適化
    css: {
      hmr: {
        overlay: false
      }
    }
  }
});