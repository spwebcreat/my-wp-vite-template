#!/usr/bin/env node

/**
 * assets同期用スタンドアロンスクリプト
 * Viteプラグインとは別に、確実にassetsを同期するためのスクリプト
 * 
 * src/assets配下のすべてのディレクトリを動的に検出して同期します
 * - 新規ディレクトリの自動検出
 * - 削除されたディレクトリの自動削除
 * - ファイルの追加/更新/削除の同期
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