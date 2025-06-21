# 🚀 Local開発環境 クイックスタートガイド

## 1分で始める開発環境構築

### 📋 前提条件
- Local by Flywheel がインストール済み
- サイトシェルを開いている（LocalでOpen Site Shell）

### 🎯 最速セットアップ（推奨）

```bash
# テーマディレクトリに移動
cd /app/public/wp-content/themes/mythme

# 初回セットアップ（全自動）
make install

# 開発開始
make dev
```

これだけで開発環境が整います！🎉

### 📝 個別コマンド

```bash
# 環境状態を確認
make status

# WP-CLIセットアップのみ実行
make setup

# プラグインをリンク
make plugin

# 本番ビルド
make build

# ヘルプを表示
make help
```

### 🔧 手動実行（Makefileが使えない場合）

```bash
# セットアップスクリプトを直接実行
cd /app/public
bash wp-content/themes/mythme/scripts/setup-local.sh

# 開発サーバー起動
cd wp-content/themes/mythme
npm install
npm run dev
```

### 📁 プラグイン開発の流れ

1. **開発ディレクトリで作業**
   ```
   /path/to/your/projects/plugins/webp-converter/
   ```

2. **シンボリックリンクで接続**
   ```bash
   make plugin
   ```

3. **変更が即座に反映！**

### 🎨 カスタマイズ

#### WP-CLI.txtの編集
既存のコマンドリストに追加：
```bash
# カスタムプラグインの有効化
wp plugin activate webp-converter

# 開発用オプション
wp option update webp_converter_debug true
```

#### Makefileの拡張
新しいタスクを追加：
```makefile
.PHONY: my-task
my-task:
	@echo "カスタムタスク実行中..."
	# ここにコマンドを追加
```

### 🚨 トラブルシューティング

**Q: make: command not found**
A: WindowsではGit Bashまたは WSL を使用してください

**Q: プラグインが見つからない**
A: `make plugin-dev` でディレクトリを作成してから開発

**Q: 権限エラー**
A: `chmod +x scripts/setup-local.sh` を実行

### 💡 プロのヒント

1. **エイリアス設定**（.bashrcや.zshrcに追加）
   ```bash
   alias wpsetup='cd /app/public/wp-content/themes/mythme && make setup'
   alias wpdev='cd /app/public/wp-content/themes/mythme && make dev'
   ```

2. **VS Code統合**
   tasks.json に追加：
   ```json
   {
     "label": "Local Setup",
     "type": "shell",
     "command": "make setup",
     "problemMatcher": []
   }
   ```

3. **チーム共有**
   - このドキュメントをチームWikiに
   - Makefileをプロジェクトリポジトリに含める
   - 新メンバーは `make install` だけでOK！