#!/usr/bin/env node

/**
 * assets同期用スタンドアロンスクリプト
 * Viteプラグインとは別に、確実にassetsを同期するためのスクリプト
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcAssetsDir = path.resolve(__dirname, '../src/assets');
const distAssetsDir = path.resolve(__dirname, '../themes/mythme/dist/assets');

// ディレクトリの差分を取得
function getDirectoryDiff(srcDir, distDir) {
  const srcFiles = new Set();
  const distFiles = new Set();
  
  function scanDir(dir, fileSet, basePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath, fileSet, relativePath);
      } else {
        fileSet.add(relativePath);
      }
    });
  }
  
  scanDir(srcDir, srcFiles);
  scanDir(distDir, distFiles);
  
  return {
    toAdd: [...srcFiles].filter(f => !distFiles.has(f)),
    toRemove: [...distFiles].filter(f => !srcFiles.has(f)),
    toUpdate: [...srcFiles].filter(f => distFiles.has(f))
  };
}

// ファイルをコピー
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

// メイン同期処理
function syncAssets() {
  console.log('🔄 Starting assets synchronization...');
  
  const assetDirs = ['fonts', 'icons', 'videos', 'downloads'];
  
  assetDirs.forEach(dir => {
    const srcDir = path.join(srcAssetsDir, dir);
    const distDir = path.join(distAssetsDir, dir);
    
    const diff = getDirectoryDiff(srcDir, distDir);
    
    // 削除されたファイルを削除
    diff.toRemove.forEach(file => {
      const distFile = path.join(distDir, file);
      if (fs.existsSync(distFile)) {
        fs.unlinkSync(distFile);
        console.log(`🗑️  Removed: ${dir}/${file}`);
      }
    });
    
    // 新規ファイルを追加
    diff.toAdd.forEach(file => {
      const srcFile = path.join(srcDir, file);
      const distFile = path.join(distDir, file);
      copyFile(srcFile, distFile);
      console.log(`➕ Added: ${dir}/${file}`);
    });
    
    // 更新されたファイルをコピー（タイムスタンプチェック）
    diff.toUpdate.forEach(file => {
      const srcFile = path.join(srcDir, file);
      const distFile = path.join(distDir, file);
      
      const srcStat = fs.statSync(srcFile);
      const distStat = fs.statSync(distFile);
      
      if (srcStat.mtime > distStat.mtime) {
        copyFile(srcFile, distFile);
        console.log(`🔄 Updated: ${dir}/${file}`);
      }
    });
  });
  
  console.log('✅ Assets synchronization completed');
}

// 実行
if (import.meta.url === `file://${process.argv[1]}`) {
  syncAssets();
}

export { syncAssets };