/**
 * 開発環境用画像クリーンアップスクリプト
 * 不要なWebPファイルや出力ディレクトリのクリーンアップ
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './convert-images.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

// ログ出力
const log = {
  info: (msg) => console.log(`🧹 ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  debug: (msg) => config.logLevel === 'debug' && console.log(`🔍 ${msg}`)
};

// ディレクトリ削除（再帰的）
async function removeDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      await fs.promises.rm(dirPath, { recursive: true, force: true });
      return true;
    }
    return false;
  } catch (error) {
    log.error(`ディレクトリ削除失敗: ${dirPath} - ${error.message}`);
    return false;
  }
}

// 画像ファイルかチェック
function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return config.supportedFormats.includes(ext) || ext === '.webp';
}

// 不要なWebPファイルの検出と削除
async function cleanOrphanedWebP(outputDir) {
  const inputDir = path.join(projectRoot, config.inputDir);
  let cleaned = 0;
  
  async function checkDirectory(dir, relativeDir = '') {
    const fullDir = path.join(dir, relativeDir);
    if (!fs.existsSync(fullDir)) return;
    
    try {
      const items = await fs.promises.readdir(fullDir);
      
      for (const item of items) {
        const fullPath = path.join(fullDir, item);
        const stat = await fs.promises.stat(fullPath);
        
        if (stat.isDirectory()) {
          await checkDirectory(dir, path.join(relativeDir, item));
        } else if (item.endsWith('.webp')) {
          // 対応する元画像があるかチェック
          const nameWithoutExt = path.parse(item).name;
          const possibleOriginals = config.supportedFormats.map(ext => 
            path.join(inputDir, relativeDir, `${nameWithoutExt}${ext}`)
          );
          
          const hasOriginal = possibleOriginals.some(originalPath => fs.existsSync(originalPath));
          
          if (!hasOriginal) {
            await fs.promises.unlink(fullPath);
            cleaned++;
            log.success(`不要なWebPファイルを削除: ${path.join(relativeDir, item)}`);
          }
        }
      }
    } catch (error) {
      log.error(`ディレクトリ処理エラー: ${fullDir} - ${error.message}`);
    }
  }
  
  await checkDirectory(outputDir);
  return cleaned;
}

// 空のディレクトリを削除
async function removeEmptyDirectories(dirPath) {
  let removed = 0;
  
  async function checkDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    try {
      const items = await fs.promises.readdir(dir);
      
      // サブディレクトリを再帰的にチェック
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.promises.stat(fullPath);
        
        if (stat.isDirectory()) {
          await checkDirectory(fullPath);
        }
      }
      
      // 現在のディレクトリが空かチェック
      const currentItems = await fs.promises.readdir(dir);
      if (currentItems.length === 0 && dir !== path.join(projectRoot, config.outputDir)) {
        await fs.promises.rmdir(dir);
        removed++;
        log.debug(`空のディレクトリを削除: ${path.relative(projectRoot, dir)}`);
      }
    } catch (error) {
      log.debug(`ディレクトリチェックエラー: ${dir} - ${error.message}`);
    }
  }
  
  await checkDirectory(dirPath);
  return removed;
}

// ファイルサイズを取得
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

// ディレクトリサイズを計算
async function calculateDirectorySize(dirPath) {
  let totalSize = 0;
  let fileCount = 0;
  
  async function calcSize(dir) {
    if (!fs.existsSync(dir)) return;
    
    try {
      const items = await fs.promises.readdir(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.promises.stat(fullPath);
        
        if (stat.isDirectory()) {
          await calcSize(fullPath);
        } else {
          totalSize += stat.size;
          fileCount++;
        }
      }
    } catch (error) {
      log.debug(`サイズ計算エラー: ${dir} - ${error.message}`);
    }
  }
  
  await calcSize(dirPath);
  return { totalSize, fileCount };
}

// メイン処理
async function main() {
  const startTime = Date.now();
  
  log.info('画像クリーンアップを開始します...');
  log.info('');
  
  const outputDir = path.join(projectRoot, config.outputDir);
  
  // 出力ディレクトリの状況確認
  if (fs.existsSync(outputDir)) {
    const beforeStats = await calculateDirectorySize(outputDir);
    log.info(`📊 クリーンアップ前: ${beforeStats.fileCount}ファイル, ${(beforeStats.totalSize / 1024 / 1024).toFixed(2)}MB`);
  } else {
    log.info('📂 出力ディレクトリが存在しません');
    return;
  }
  
  let cleanedWebP = 0;
  let removedDirs = 0;
  
  // 処理選択
  const args = process.argv.slice(2);
  const fullClean = args.includes('--full') || args.includes('-f');
  
  if (fullClean) {
    // 完全クリーンアップ
    log.info('🗑️  完全クリーンアップモード: 出力ディレクトリを削除します');
    const removed = await removeDirectory(outputDir);
    if (removed) {
      log.success('出力ディレクトリを完全に削除しました');
    }
  } else {
    // 選択的クリーンアップ
    log.info('🔍 不要なWebPファイルをスキャンしています...');
    cleanedWebP = await cleanOrphanedWebP(outputDir);
    
    log.info('📁 空のディレクトリをチェックしています...');
    removedDirs = await removeEmptyDirectories(outputDir);
  }
  
  // 結果表示
  const afterStats = fs.existsSync(outputDir) ? await calculateDirectorySize(outputDir) : { totalSize: 0, fileCount: 0 };
  const duration = Date.now() - startTime;
  
  log.info('');
  
  if (fullClean) {
    log.success('完全クリーンアップが完了しました！');
  } else {
    if (cleanedWebP > 0) {
      log.success(`${cleanedWebP}個の不要なWebPファイルを削除しました`);
    } else {
      log.success('不要なWebPファイルはありませんでした');
    }
    
    if (removedDirs > 0) {
      log.success(`${removedDirs}個の空ディレクトリを削除しました`);
    }
  }
  
  log.info(`📊 クリーンアップ後: ${afterStats.fileCount}ファイル, ${(afterStats.totalSize / 1024 / 1024).toFixed(2)}MB`);
  log.debug(`⏱️  処理時間: ${duration}ms`);
  
  log.info('');
  log.info('💡 使用方法:');
  log.info('   npm run clean-images        # 選択的クリーンアップ');
  log.info('   npm run clean-images -- --full  # 完全クリーンアップ');
}

// 実行
main().catch(error => {
  log.error(`クリーンアップ処理でエラーが発生しました: ${error.message}`);
  process.exit(1);
});