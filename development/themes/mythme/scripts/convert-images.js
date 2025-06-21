/**
 * 開発環境用画像変換スクリプト
 * テーマ側の静的アセット変換専用（プラグインとは役割分担）
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './convert-images.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

// ログ出力
const log = {
  info: (msg) => console.log(`🖼️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  debug: (msg) => config.logLevel === 'debug' && console.log(`🔍 ${msg}`)
};

// ディレクトリ作成
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log.debug(`ディレクトリ作成: ${dirPath}`);
  }
}

// 画像ファイルかチェック
function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return config.supportedFormats.includes(ext);
}

// WebP変換
async function convertToWebP(inputPath, outputPath, quality = config.quality) {
  try {
    await sharp(inputPath)
      .webp({ quality })
      .toFile(outputPath);
    return true;
  } catch (error) {
    log.error(`WebP変換失敗: ${inputPath} - ${error.message}`);
    return false;
  }
}

// 元画像コピー（フォールバック用）
async function copyOriginal(inputPath, outputPath) {
  try {
    await fs.promises.copyFile(inputPath, outputPath);
    return true;
  } catch (error) {
    log.error(`元画像コピー失敗: ${inputPath} - ${error.message}`);
    return false;
  }
}

// ディレクトリを再帰的に処理
async function processDirectory(inputDir, outputDir, relativePath = '') {
  const fullInputDir = path.join(inputDir, relativePath);
  const fullOutputDir = path.join(outputDir, relativePath);
  
  if (!fs.existsSync(fullInputDir)) {
    log.warn(`入力ディレクトリが見つかりません: ${fullInputDir}`);
    return { converted: 0, copied: 0, failed: 0 };
  }
  
  ensureDir(fullOutputDir);
  
  const items = await fs.promises.readdir(fullInputDir);
  let stats = { converted: 0, copied: 0, failed: 0 };
  
  for (const item of items) {
    const inputPath = path.join(fullInputDir, item);
    const stat = await fs.promises.stat(inputPath);
    
    if (stat.isDirectory()) {
      // 再帰的にサブディレクトリを処理
      const subStats = await processDirectory(inputDir, outputDir, path.join(relativePath, item));
      stats.converted += subStats.converted;
      stats.copied += subStats.copied;
      stats.failed += subStats.failed;
    } else if (isImageFile(inputPath)) {
      const nameWithoutExt = path.parse(item).name;
      const ext = path.parse(item).ext;
      
      // WebP変換
      if (config.enableWebP) {
        const webpOutputPath = path.join(fullOutputDir, `${nameWithoutExt}.webp`);
        const webpSuccess = await convertToWebP(inputPath, webpOutputPath);
        
        if (webpSuccess) {
          stats.converted++;
          log.success(`変換完了: ${item} → ${nameWithoutExt}.webp`);
        } else {
          stats.failed++;
        }
      }
      
      // 元画像も保持（フォールバック用）
      if (config.preserveOriginal) {
        const originalOutputPath = path.join(fullOutputDir, item);
        const copySuccess = await copyOriginal(inputPath, originalOutputPath);
        
        if (copySuccess) {
          stats.copied++;
          log.debug(`元画像コピー: ${item}`);
        } else {
          stats.failed++;
        }
      }
    }
  }
  
  return stats;
}

// 不要なWebPファイルのクリーンアップ
async function cleanupOrphanedWebP(outputDir) {
  if (!config.smartClean) return 0;
  
  const inputDir = path.join(projectRoot, config.inputDir);
  let cleaned = 0;
  
  async function checkDirectory(dir, relativeDir = '') {
    const fullDir = path.join(dir, relativeDir);
    if (!fs.existsSync(fullDir)) return;
    
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
          log.info(`不要なWebPファイルを削除: ${path.join(relativeDir, item)}`);
        }
      }
    }
  }
  
  await checkDirectory(outputDir);
  return cleaned;
}

// メイン処理
async function main() {
  const startTime = Date.now();
  
  log.info('画像のWebP変換を開始します...');
  log.info('');
  
  const inputDir = path.join(projectRoot, config.inputDir);
  const outputDir = path.join(projectRoot, config.outputDir);
  
  log.debug(`入力: ${inputDir}`);
  log.debug(`出力: ${outputDir}`);
  
  // 出力ディレクトリ作成
  ensureDir(outputDir);
  
  // クリーンアップ（オプション）
  if (config.cleanBeforeConvert) {
    log.info('出力ディレクトリをクリーンアップ中...');
    await fs.promises.rm(outputDir, { recursive: true, force: true });
    ensureDir(outputDir);
  }
  
  // 画像変換処理
  log.info(`📂 処理中: ${inputDir}`);
  const stats = await processDirectory(inputDir, outputDir);
  
  // 不要ファイルのクリーンアップ
  log.info('🔍 不要なWebP画像をチェックしています...');
  const cleaned = await cleanupOrphanedWebP(outputDir);
  
  // 結果表示
  const duration = Date.now() - startTime;
  log.info('');
  
  if (stats.converted > 0) {
    log.success(`${stats.converted}個の画像をWebPに変換しました`);
  }
  if (stats.copied > 0) {
    log.debug(`${stats.copied}個の元画像をコピーしました`);
  }
  if (stats.failed > 0) {
    log.warn(`${stats.failed}個の画像で処理に失敗しました`);
  }
  if (cleaned > 0) {
    log.success(`${cleaned}個の不要なWebPファイルを削除しました`);
  } else {
    log.success('不要な画像はありませんでした');
  }
  
  log.info('');
  log.success('すべての画像の変換が完了しました！');
  log.info(`📁 出力先: ${outputDir}`);
  log.debug(`⏱️  処理時間: ${duration}ms`);
}

// 実行
main().catch(error => {
  log.error(`変換処理でエラーが発生しました: ${error.message}`);
  process.exit(1);
});