#!/usr/bin/env node

/**
 * 画像を自動的にWebPに変換するスクリプト
 * src/images/内のすべての画像を自動的にWebP形式に変換
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 設定ファイルを読み込み（存在しない場合はデフォルト設定を使用）
let userConfig = {};
try {
  const configModule = await import('./convert-images.config.js');
  userConfig = configModule.default;
} catch (error) {
  console.log('📋 カスタム設定ファイルが見つかりません。デフォルト設定を使用します。');
}

// デフォルト設定
const defaultConfig = {
  inputDirs: [
    path.join(__dirname, '../src/images')
  ],
  outputDir: path.join(__dirname, '../themes/mythme/dist/assets/images'),
  supportedFormats: ['.jpg', '.jpeg', '.png'],
  webpOptions: {
    quality: 85,
    effort: 4
  },
  sizes: [
    { name: 'original', width: null }
  ],
  keepDirectoryStructure: true,
  overwrite: true,
  cleanBeforeConvert: false,
  smartClean: true
};

// 設定をマージ
const config = {
  ...defaultConfig,
  ...userConfig,
  webpOptions: {
    ...defaultConfig.webpOptions,
    ...(userConfig.webpOptions || {})
  },
  // 入力ディレクトリを絶対パスに変換
  inputDirs: (userConfig.inputDirs || defaultConfig.inputDirs).map(dir => 
    path.isAbsolute(dir) ? dir : path.join(__dirname, '..', dir)
  ),
  // 出力ディレクトリを絶対パスに変換
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
async function convertToWebP(inputPath, outputPath, options = {}) {
  try {
    const image = sharp(inputPath);
    
    // サイズ指定がある場合はリサイズ
    if (options.width) {
      image.resize(options.width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }
    
    // WebPに変換
    await image
      .webp(config.webpOptions)
      .toFile(outputPath);
    
    console.log(`✅ 変換完了: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ 変換エラー: ${inputPath}`, error.message);
  }
}

/**
 * ディレクトリ内のすべての画像を処理
 */
async function processDirectory(inputDir) {
  try {
    // ディレクトリが存在しない場合はスキップ
    try {
      await fs.access(inputDir);
    } catch {
      console.log(`📁 ディレクトリが存在しません: ${inputDir}`);
      return;
    }
    
    const files = await fs.readdir(inputDir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(inputDir, file.name);
      
      if (file.isDirectory()) {
        // サブディレクトリを再帰的に処理
        await processDirectory(fullPath);
      } else if (file.isFile() && isImageFile(file.name)) {
        // Gulpライクな変換：ディレクトリ構成と画像名を保持
        const relativePath = path.relative(inputDir, fullPath);
        const parsedPath = path.parse(relativePath);
        
        // 出力ファイル名を生成（元の名前 + .webp）
        const outputFileName = config.keepOriginalName 
          ? `${parsedPath.name}.webp`
          : `${parsedPath.name}-${Date.now()}.webp`;
        
        const outputPath = path.join(
          config.outputDir,
          parsedPath.dir,
          outputFileName
        );
        
        // 出力ディレクトリを作成
        await ensureDir(path.dirname(outputPath));
        
        // WebPに変換（オリジナルサイズのみ）
        await convertToWebP(fullPath, outputPath, { width: null });
      }
    }
  } catch (error) {
    console.error(`ディレクトリ処理エラー: ${inputDir}`, error);
  }
}

/**
 * 出力ディレクトリをクリーンアップ
 */
async function cleanOutputDirectory() {
  if (config.cleanBeforeConvert) {
    console.log('🧹 出力ディレクトリをクリーンアップしています...');
    try {
      await fs.rm(config.outputDir, { recursive: true, force: true });
      console.log('✅ クリーンアップ完了');
    } catch (error) {
      console.error('❌ クリーンアップエラー:', error.message);
    }
  }
}

/**
 * 不要なWebP画像を削除（元画像が存在しないもの）
 */
async function removeOrphanedWebPFiles() {
  console.log('\n🔍 不要なWebP画像をチェックしています...');
  
  const sourceImages = new Set();
  
  // すべての元画像のパスを収集
  for (const inputDir of config.inputDirs) {
    try {
      await collectSourceImages(inputDir, sourceImages);
    } catch (error) {
      // ディレクトリが存在しない場合は続行
    }
  }
  
  // distディレクトリから不要なWebP画像を削除
  await cleanOrphanedFiles(config.outputDir, sourceImages);
}

/**
 * 元画像のパスを収集
 */
async function collectSourceImages(dir, imageSet) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        await collectSourceImages(fullPath, imageSet);
      } else if (file.isFile() && isImageFile(file.name)) {
        const fileNameWithoutExt = path.basename(file.name, path.extname(file.name));
        imageSet.add(fileNameWithoutExt);
      }
    }
  } catch (error) {
    // エラーは無視
  }
}

/**
 * 不要なWebPファイルを削除
 */
async function cleanOrphanedFiles(dir, sourceImages) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    let deletedCount = 0;
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        await cleanOrphanedFiles(fullPath, sourceImages);
      } else if (file.isFile() && path.extname(file.name) === '.webp') {
        const baseName = path.basename(file.name, '.webp');
        
        if (!sourceImages.has(baseName)) {
          await fs.unlink(fullPath);
          console.log(`🗑️  削除: ${file.name}`);
          deletedCount++;
        }
      }
    }
    
    if (deletedCount > 0) {
      console.log(`✅ ${deletedCount}個の不要なWebP画像を削除しました`);
    } else {
      console.log('✅ 不要な画像はありませんでした');
    }
  } catch (error) {
    // エラーは無視
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🖼️  画像のWebP変換を開始します...\n');
  
  // クリーンアップオプションが有効な場合
  if (config.cleanBeforeConvert) {
    await cleanOutputDirectory();
  }
  
  // 出力ディレクトリを作成
  await ensureDir(config.outputDir);
  
  // 各入力ディレクトリを処理
  for (const inputDir of config.inputDirs) {
    console.log(`\n📂 処理中: ${inputDir}`);
    await processDirectory(inputDir);
  }
  
  // 不要なWebP画像を削除（smartCleanが有効な場合）
  if (config.smartClean) {
    await removeOrphanedWebPFiles();
  }
  
  console.log('\n✨ すべての画像の変換が完了しました！');
  console.log(`📁 出力先: ${config.outputDir}`);
}

// 実行
main().catch(console.error);