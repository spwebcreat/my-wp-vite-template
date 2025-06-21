#!/usr/bin/env node

/**
 * 画像ファイル監視スクリプト
 * src/images/ の変更を即座に検知してWebP変換を実行
 * Gulpライクな即時反映を実現
 */

import chokidar from 'chokidar';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 設定ファイルを読み込み
let userConfig = {};
try {
  const configModule = await import('./convert-images.config.js');
  userConfig = configModule.default;
} catch (error) {
  console.log('📋 設定ファイルが見つかりません。デフォルト設定を使用します。');
}

// デフォルト設定
const defaultConfig = {
  inputDirs: [
    path.join(__dirname, '../src/images')
  ],
  outputDir: path.join(__dirname, '../dist/images'),
  supportedFormats: ['.jpg', '.jpeg', '.png'],
  webpOptions: {
    quality: 85,
    effort: 4
  },
  keepOriginalName: true
};

// 設定をマージ
const config = {
  ...defaultConfig,
  ...userConfig,
  webpOptions: {
    ...defaultConfig.webpOptions,
    ...(userConfig.webpOptions || {})
  },
  inputDirs: (userConfig.inputDirs || defaultConfig.inputDirs).map(dir => 
    path.isAbsolute(dir) ? dir : path.join(__dirname, '..', dir)
  ),
  outputDir: path.isAbsolute(userConfig.outputDir || defaultConfig.outputDir) 
    ? (userConfig.outputDir || defaultConfig.outputDir)
    : path.join(__dirname, '..', userConfig.outputDir || defaultConfig.outputDir)
};

/**
 * ディレクトリを再帰的に作成
 */
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error(`ディレクトリ作成エラー: ${dir}`, error);
  }
}

/**
 * 画像ファイルかどうかチェック
 */
function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return config.supportedFormats.includes(ext);
}

/**
 * 画像をWebPに変換
 */
async function convertToWebP(inputPath, outputPath) {
  try {
    const image = sharp(inputPath);
    
    await image
      .webp(config.webpOptions)
      .toFile(outputPath);
    
    console.log(`✅ 変換完了: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ 変換エラー: ${inputPath}`, error.message);
  }
}

/**
 * 単一ファイルを処理
 */
async function processFile(filePath, action = 'add') {
  if (!isImageFile(filePath)) return;
  
  // 入力ディレクトリを特定
  const inputDir = config.inputDirs.find(dir => filePath.startsWith(dir));
  if (!inputDir) return;
  
  const relativePath = path.relative(inputDir, filePath);
  const parsedPath = path.parse(relativePath);
  
  const outputFileName = config.keepOriginalName 
    ? `${parsedPath.name}.webp`
    : `${parsedPath.name}-${Date.now()}.webp`;
  
  const outputPath = path.join(
    config.outputDir,
    parsedPath.dir,
    outputFileName
  );
  
  if (action === 'add' || action === 'change') {
    // ファイル追加・変更時はWebPに変換
    await ensureDir(path.dirname(outputPath));
    await convertToWebP(filePath, outputPath);
  } else if (action === 'unlink') {
    // ファイル削除時は対応するWebPを削除
    try {
      await fs.unlink(outputPath);
      console.log(`🗑️  削除: ${path.basename(outputPath)}`);
    } catch (error) {
      // ファイルが存在しない場合は無視
    }
  }
}

/**
 * ファイルウォッチャーを開始
 */
function startWatcher() {
  console.log('👀 画像ファイルの監視を開始します...');
  console.log('📁 監視対象:', config.inputDirs.map(dir => path.relative(process.cwd(), dir)));
  console.log('📁 出力先:', path.relative(process.cwd(), config.outputDir));
  console.log('');
  
  const watcher = chokidar.watch(config.inputDirs, {
    ignored: /(^|[\/\\])\../, // 隠しファイルを無視
    persistent: true,
    ignoreInitial: false // 既存ファイルも処理
  });
  
  // ファイル追加時
  watcher.on('add', async (filePath) => {
    console.log(`📷 画像追加: ${path.relative(process.cwd(), filePath)}`);
    await processFile(filePath, 'add');
  });
  
  // ファイル変更時
  watcher.on('change', async (filePath) => {
    console.log(`🔄 画像変更: ${path.relative(process.cwd(), filePath)}`);
    await processFile(filePath, 'change');
  });
  
  // ファイル削除時
  watcher.on('unlink', async (filePath) => {
    console.log(`❌ 画像削除: ${path.relative(process.cwd(), filePath)}`);
    await processFile(filePath, 'unlink');
  });
  
  // エラー時
  watcher.on('error', (error) => {
    console.error('❌ ウォッチャーエラー:', error);
  });
  
  console.log('✨ 監視中... ファイルを変更すると即座に反映されます');
  console.log('⏹️  停止するには Ctrl+C を押してください\n');
  
  return watcher;
}

// プロセス終了時の処理
process.on('SIGINT', () => {
  console.log('\n👋 ファイル監視を停止しました');
  process.exit(0);
});

// ウォッチャーを開始
startWatcher();