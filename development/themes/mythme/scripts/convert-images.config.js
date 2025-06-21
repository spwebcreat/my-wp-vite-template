/**
 * 開発環境用画像変換設定
 * テーマ側の静的アセット変換を担当
 * プラグイン側とは役割分担：
 * - テーマ: 開発時の静的画像変換（src/images → dist/images）
 * - プラグイン: WordPress内の動的画像変換（uploads内）
 */

export default {
  // 入力ディレクトリ
  inputDir: 'src/images',
  
  // 出力ディレクトリ
  outputDir: 'dist/images',
  
  // 変換設定
  quality: 85,
  
  // サポートする形式
  supportedFormats: ['.jpg', '.jpeg', '.png'],
  
  // WebP変換を有効にする
  enableWebP: true,
  
  // 元画像も保持する（フォールバック用）
  preserveOriginal: true,
  
  // サイズ展開（必要に応じて）
  sizes: [
    { name: 'original', width: null }
  ],
  
  // スマートクリーンアップ（元画像削除時にWebPも削除）
  smartClean: true,
  
  // 変換前にdist/imagesをクリア
  cleanBeforeConvert: false,
  
  // ログレベル
  logLevel: 'info' // 'info', 'warn', 'error', 'debug'
};