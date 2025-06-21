# 画像変換システム 詳細仕様

## 🚀 即時変換機能の技術詳細

### パッケージ構成

```json
{
  "devDependencies": {
    "vite-imagetools": "^7.1.0",    // Vite画像変換プラグイン
    "sharp": "^0.34.2",             // 高速画像処理ライブラリ
    "chokidar": "^4.0.3",           // ファイルシステム監視
    "concurrently": "^9.1.2"        // プロセス並行実行
  }
}
```

### スクリプト構成

```
scripts/
├── convert-images.js          # 一括変換（初回・手動用）
├── watch-images.js           # リアルタイム監視・変換
├── clean-images.js           # 不要ファイル削除
└── convert-images.config.js   # 統一設定ファイル
```

## 📁 ファイル監視の仕組み

### watch-images.js の動作

```javascript
// ファイルシステム監視
const watcher = chokidar.watch('src/images/', {
  ignored: /(^|[\/\\])\../,     // 隠しファイルを無視
  persistent: true,
  ignoreInitial: false          // 既存ファイルも処理
});

// イベントハンドリング
watcher.on('add', handleAdd);       // ファイル追加
watcher.on('change', handleChange); // ファイル変更
watcher.on('unlink', handleDelete); // ファイル削除
```

### 即時反映の流れ

1. **ファイル追加時**
   ```
   src/images/new.jpg 追加
   ↓ chokidar検知
   ↓ sharp処理
   ↓ dist/images/new.webp 生成
   ```

2. **ファイル削除時**
   ```
   src/images/old.jpg 削除
   ↓ chokidar検知
   ↓ 対応するWebPパス計算
   ↓ dist/images/old.webp 削除
   ```

3. **ファイル変更時**
   ```
   src/images/photo.jpg 変更
   ↓ chokidar検知
   ↓ sharp再処理
   ↓ dist/images/photo.webp 更新
   ```

## ⚡ 並行実行システム

### concurrently による統合

```bash
# npm run dev の実行内容
npm run convert-images    # 初回一括変換
npm run dev:watch        # 監視+Vite並行実行

# dev:watch の詳細
concurrently 
  "npm run watch-images"  # 📷 画像監視
  "vite"                 # ⚡ Viteサーバー
  --names "📷,⚡" 
  --prefix-colors "cyan,green"
```

### ログ表示

```
📷 [watch-images] 👀 画像ファイルの監視を開始します...
⚡ [vite] Local: http://localhost:5173/
📷 [watch-images] ✅ 変換完了: photo.jpg → photo.webp
⚡ [vite] [HMR] connected.
📷 [watch-images] 🗑️ 削除: old-photo.webp
```

## 🔧 設定のカスタマイズ

### convert-images.config.js

```javascript
export default {
  // WebP変換品質
  quality: 85,
  
  // 入力ディレクトリ
  inputDirs: ['src/images'],
  
  // 出力ディレクトリ  
  outputDir: 'dist/images',
  
  // 画像名保持（ハッシュなし）
  keepOriginalName: true,
  
  // 即時削除機能
  smartClean: true,
  
  // 対応形式
  supportedFormats: ['.jpg', '.jpeg', '.png']
};
```

## 📊 パフォーマンス最適化

### Sharp の高速処理

```javascript
// 最適化されたWebP変換
await sharp(inputPath)
  .webp({
    quality: 85,    // 品質
    effort: 4       // 圧縮レベル（0-6）
  })
  .toFile(outputPath);
```

### 処理時間の目安

| 画像サイズ | 変換時間 | 削除時間 |
|-----------|---------|---------|
| 100KB JPG | ~50ms   | ~5ms    |
| 1MB JPG   | ~200ms  | ~5ms    |
| 5MB JPG   | ~800ms  | ~5ms    |

## 🛡️ エラーハンドリング

### ファイル操作エラー

```javascript
try {
  await fs.unlink(outputPath);
  console.log(`🗑️ 削除: ${path.basename(outputPath)}`);
} catch (error) {
  // ファイルが存在しない場合は無視
  // エラーログを出力しない
}
```

### 変換エラー

```javascript
try {
  await convertToWebP(inputPath, outputPath);
} catch (error) {
  console.error(`❌ 変換エラー: ${inputPath}`, error.message);
  // 処理は続行（他の画像に影響しない）
}
```

## 🔄 開発ワークフロー

### 標準的な開発フロー

```bash
1. npm run dev                    # 開発サーバー起動
2. src/images/ にファイル操作      # 即時反映
3. ブラウザで確認                 # リアルタイム確認
4. npm run build                 # 本番ビルド
```

### トラブルシューティング

```bash
# 監視が効かない場合
npm run watch-images             # 監視のみ手動起動

# 一括リセット
npm run clean-images             # 全WebP削除
npm run convert-images           # 全画像再変換

# 設定確認
cat scripts/convert-images.config.js
```

## 🎯 設計思想

### Single Source of Truth

- **src/images/**: 真実の情報源（編集対象）
- **dist/images/**: 生成結果（自動管理）
- **即時同期**: srcの変更がdistに即座に反映

### 開発体験優先

- **0秒フィードバック**: ファイル操作と同時に反映
- **手動操作不要**: コマンド実行が不要
- **視覚的フィードバック**: 分かりやすいログ表示

この設計により、**画像生成サイトと同等の即時性**を実現し、最高の開発体験を提供しています。