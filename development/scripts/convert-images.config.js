/**
 * 画像変換設定ファイル
 * このファイルをカスタマイズして画像変換の設定を変更できます
 */

export default {
  // WebP変換の品質（1-100）
  quality: 85,
  
  // 変換努力レベル（0-6）数値が高いほど時間をかけて圧縮
  effort: 4,
  
  // サイズバリエーション設定（デフォルトはオリジナルサイズのみ）
  sizes: [
    { name: 'original', width: null }
  ],
  
  // 入力ディレクトリ
  inputDirs: [
    'src/images'
  ],
  
  // 出力ディレクトリ（ディレクトリ構成と画像名を保持）
  outputDir: 'dist/images',
  
  // 対応する画像形式
  supportedFormats: ['.jpg', '.jpeg', '.png'],
  
  // ディレクトリ構造を保持
  keepDirectoryStructure: true,
  
  // 画像名を保持（ハッシュを付けない）
  keepOriginalName: true,
  
  // 既存のWebPファイルを上書き
  overwrite: true,
  
  // スマートクリーンアップ（推奨: 有効）
  // src画像を削除すると、対応するdist/WebPも自動削除
  smartClean: true,
  
  // 自動変換モード（Gulpライク）
  autoConvert: true
};