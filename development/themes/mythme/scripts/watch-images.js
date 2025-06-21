/**
 * 開発環境用画像監視スクリプト
 * ファイル変更をリアルタイムで監視してWebP変換を実行
 * Viteのホットリロードと連携
 */

import chokidar from 'chokidar';
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
  info: (msg) => console.log(`👀 ${msg}`),
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

// 元画像コピー
async function copyOriginal(inputPath, outputPath) {
  try {
    await fs.promises.copyFile(inputPath, outputPath);
    return true;
  } catch (error) {
    log.error(`元画像コピー失敗: ${inputPath} - ${error.message}`);
    return false;
  }
}

// 相対パスを取得
function getRelativePath(fullPath, basePath) {
  return path.relative(basePath, fullPath);
}

// 出力パスを生成
function getOutputPaths(inputPath) {
  const inputDir = path.join(projectRoot, config.inputDir);
  const outputDir = path.join(projectRoot, config.outputDir);
  const relativePath = getRelativePath(inputPath, inputDir);
  const outputDirForFile = path.join(outputDir, path.dirname(relativePath));
  const nameWithoutExt = path.parse(relativePath).name;
  const ext = path.parse(relativePath).ext;
  
  return {
    outputDir: outputDirForFile,
    webpPath: path.join(outputDirForFile, `${nameWithoutExt}.webp`),
    originalPath: path.join(outputDirForFile, `${nameWithoutExt}${ext}`)
  };
}

// 画像処理（追加・変更時）
async function processImage(inputPath) {
  if (!isImageFile(inputPath)) return;
  
  const { outputDir, webpPath, originalPath } = getOutputPaths(inputPath);
  ensureDir(outputDir);
  
  const fileName = path.basename(inputPath);
  const nameWithoutExt = path.parse(fileName).name;
  
  // WebP変換
  if (config.enableWebP) {
    const webpSuccess = await convertToWebP(inputPath, webpPath);
    if (webpSuccess) {
      log.success(`変換完了: ${fileName} → ${nameWithoutExt}.webp`);
    }
  }
  
  // 元画像コピー
  if (config.preserveOriginal) {
    await copyOriginal(inputPath, originalPath);
    log.debug(`元画像コピー: ${fileName}`);
  }
}

// 画像削除時の処理
async function removeImage(inputPath) {
  if (!isImageFile(inputPath)) return;
  
  const { webpPath, originalPath } = getOutputPaths(inputPath);
  
  try {
    // WebPファイル削除
    if (fs.existsSync(webpPath)) {
      await fs.promises.unlink(webpPath);
      log.info(`WebPファイル削除: ${path.basename(webpPath)}`);
    }
    
    // 元画像削除
    if (config.preserveOriginal && fs.existsSync(originalPath)) {
      await fs.promises.unlink(originalPath);
      log.debug(`元画像削除: ${path.basename(originalPath)}`);
    }
  } catch (error) {
    log.error(`ファイル削除失敗: ${error.message}`);
  }
}

// メイン処理
function main() {
  const inputDir = path.join(projectRoot, config.inputDir);
  const outputDir = path.join(projectRoot, config.outputDir);
  
  log.info('画像ファイルの監視を開始します...');
  log.info(`📁 監視対象: [ '${config.inputDir}' ]`);
  log.info(`📁 出力先: ${config.outputDir}`);
  log.info('');
  log.success('✨ 監視中... ファイルを変更すると即座に反映されます');
  log.info('⏹️  停止するには Ctrl+C を押してください');
  log.info('');
  
  // 出力ディレクトリ作成
  ensureDir(outputDir);
  
  // chokidarでファイル監視
  const watcher = chokidar.watch(inputDir, {
    ignored: /(^|[\/\\])\../, // 隠しファイルを無視
    persistent: true,
    ignoreInitial: false, // 初期ファイルも処理
    awaitWriteFinish: { // ファイル書き込み完了を待つ
      stabilityThreshold: 100,
      pollInterval: 50
    }
  });
  
  // ファイル追加・変更時
  watcher.on('add', async (filePath) => {
    const fileName = path.basename(filePath);
    if (isImageFile(filePath)) {
      log.info(`📷 画像追加: ${getRelativePath(filePath, inputDir)}`);
      await processImage(filePath);
    }
  });
  
  watcher.on('change', async (filePath) => {
    const fileName = path.basename(filePath);
    if (isImageFile(filePath)) {
      log.info(`📷 画像変更: ${getRelativePath(filePath, inputDir)}`);
      await processImage(filePath);
    }
  });
  
  // ファイル削除時
  watcher.on('unlink', async (filePath) => {
    const fileName = path.basename(filePath);
    if (isImageFile(filePath)) {
      log.info(`🗑️  画像削除: ${getRelativePath(filePath, inputDir)}`);
      await removeImage(filePath);
    }
  });
  
  // エラーハンドリング
  watcher.on('error', (error) => {
    log.error(`監視エラー: ${error.message}`);
  });
  
  // 終了処理
  process.on('SIGINT', () => {
    log.info('');
    log.info('🛑 ファイル監視を停止します...');
    watcher.close().then(() => {
      log.success('監視停止完了');
      process.exit(0);
    });
  });
}

// 実行
main();