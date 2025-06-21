#!/usr/bin/env node

/**
 * 画像クリーンアップ専用スクリプト
 * 不要なWebP画像を削除する
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    path.join(__dirname, '../src/images'),
    path.join(__dirname, '../assets/images'),
    path.join(__dirname, '../public/images')
  ],
  outputDir: path.join(__dirname, '../dist/images'),
  supportedFormats: ['.jpg', '.jpeg', '.png']
};

// 設定をマージ
const config = {
  ...defaultConfig,
  ...userConfig,
  inputDirs: (userConfig.inputDirs || defaultConfig.inputDirs).map(dir => 
    path.isAbsolute(dir) ? dir : path.join(__dirname, '..', dir)
  ),
  outputDir: path.isAbsolute(userConfig.outputDir || defaultConfig.outputDir) 
    ? (userConfig.outputDir || defaultConfig.outputDir)
    : path.join(__dirname, '..', userConfig.outputDir || defaultConfig.outputDir)
};

/**
 * 画像ファイルかどうかチェック
 */
function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return config.supportedFormats.includes(ext);
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
        const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
        const fileNameWithoutExt = path.basename(file.name, path.extname(file.name));
        imageSet.add(path.join(path.dirname(relativePath), fileNameWithoutExt));
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
        deletedCount += await cleanOrphanedFiles(fullPath, sourceImages);
      } else if (file.isFile() && path.extname(file.name) === '.webp') {
        const baseName = path.basename(file.name, '.webp');
        const cleanBaseName = baseName.replace(/-(thumbnail|small|medium|large|xlarge|hero|original)$/, '');
        const relativePath = path.relative(config.outputDir, fullPath);
        const imageKey = path.join(path.dirname(relativePath), cleanBaseName);
        
        if (!sourceImages.has(imageKey)) {
          await fs.unlink(fullPath);
          console.log(`🗑️  削除: ${file.name}`);
          deletedCount++;
        }
      }
    }
    
    return deletedCount;
  } catch (error) {
    return 0;
  }
}

/**
 * 空のディレクトリを削除
 */
async function removeEmptyDirectories(dir) {
  try {
    const files = await fs.readdir(dir);
    
    // サブディレクトリを再帰的に処理
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await removeEmptyDirectories(fullPath);
      }
    }
    
    // 現在のディレクトリが空の場合は削除
    const currentFiles = await fs.readdir(dir);
    if (currentFiles.length === 0 && dir !== config.outputDir) {
      await fs.rmdir(dir);
      console.log(`📁 空のディレクトリを削除: ${path.basename(dir)}`);
    }
  } catch (error) {
    // エラーは無視
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🧹 画像クリーンアップを開始します...\n');
  
  // 出力ディレクトリが存在しない場合は終了
  try {
    await fs.access(config.outputDir);
  } catch {
    console.log('📁 出力ディレクトリが存在しません。クリーンアップをスキップします。');
    return;
  }
  
  const sourceImages = new Set();
  
  // すべての元画像のパスを収集
  console.log('🔍 元画像を検索しています...');
  for (const inputDir of config.inputDirs) {
    try {
      await collectSourceImages(inputDir, sourceImages);
    } catch (error) {
      // ディレクトリが存在しない場合は続行
    }
  }
  
  console.log(`📊 ${sourceImages.size}個の元画像を発見しました`);
  
  // 不要なWebP画像を削除
  console.log('\n🗑️  不要なWebP画像を削除しています...');
  const deletedCount = await cleanOrphanedFiles(config.outputDir, sourceImages);
  
  // 空のディレクトリを削除
  console.log('\n📁 空のディレクトリを削除しています...');
  await removeEmptyDirectories(config.outputDir);
  
  if (deletedCount > 0) {
    console.log(`\n✨ クリーンアップ完了！${deletedCount}個のファイルを削除しました`);
  } else {
    console.log('\n✅ 削除する不要なファイルはありませんでした');
  }
}

// 実行
main().catch(console.error);