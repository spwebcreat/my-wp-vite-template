# Local開発環境の自動化ガイド

## 🎯 概要

Local by Flywheelでの開発環境構築を自動化し、カスタムプラグインのインストールとWP-CLIコマンドの実行を効率化する方法。

## 📋 自動化の選択肢

### 1. シンボリックリンクによる開発（推奨）

カスタムプラグインの開発中は、シンボリックリンクを使用して即座に反映させる方法が最も効率的です。

```bash
# プラグイン開発ディレクトリから直接リンク
ln -s /path/to/your/plugin-dev/webp-converter /Volumes/SP-STORAGE\ 1TB/Cliants/BHF.Inc/SOU/Web/SOU-SPACE/sou-space.osaka/app/public/wp-content/plugins/webp-converter
```

**メリット：**
- ファイル変更が即座に反映
- コピーの手間が不要
- Gitで管理しやすい

### 2. WP-CLIスクリプトの拡張

既存のWP-CLI.txtを拡張して、カスタムプラグインも含めた完全自動化スクリプトを作成。

#### setup-local.sh（推奨構成）

```bash
#!/bin/bash

# 色付きログ出力
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Local WordPress環境セットアップ開始 ===${NC}"

# 基本設定
echo -e "${GREEN}[1/5] 基本設定を適用中...${NC}"
wp core language install ja --activate
wp option update timezone_string 'Asia/Tokyo'
wp option update date_format Y.m.d
wp option update time_format H:i

# 不要なデフォルトコンテンツを削除
echo -e "${GREEN}[2/5] デフォルトコンテンツを削除中...${NC}"
wp post delete 1 2 3 --force

# 公式プラグインのインストール
echo -e "${GREEN}[3/5] 公式プラグインをインストール中...${NC}"
wp plugin install wp-pagenavi wp-multibyte-patch mw-wp-form custom-post-type-ui intuitive-custom-post-order duplicate-post custom-post-type-permalinks --activate
wp plugin install siteguard backwpup google-sitemap-generator all-in-one-wp-migration --activate

# カスタムプラグインのインストール
echo -e "${GREEN}[4/5] カスタムプラグインをインストール中...${NC}"

# WebP Converterプラグイン
PLUGIN_DIR="/Volumes/SP-STORAGE 1TB/Cliants/BHF.Inc/SOU/Web/SOU-SPACE/sou-space.osaka/app/public/wp-content/plugins"
CUSTOM_PLUGIN_SOURCE="../custom-plugins/webp-converter"

if [ -d "$CUSTOM_PLUGIN_SOURCE" ]; then
    echo "WebP Converterプラグインをコピー中..."
    cp -r "$CUSTOM_PLUGIN_SOURCE" "$PLUGIN_DIR/"
    wp plugin activate webp-converter
else
    echo -e "${RED}警告: WebP Converterプラグインが見つかりません${NC}"
fi

# ページとパーマリンク設定
echo -e "${GREEN}[5/5] ページとパーマリンクを設定中...${NC}"
wp post create --post_type=page --post_title=Home --post_status=publish --porcelain
wp rewrite structure /%post_id%/
wp rewrite flush

# 翻訳の更新
wp core language update

echo -e "${BLUE}=== セットアップ完了！ ===${NC}"
```

### 3. Composer統合（高度な自動化）

```json
{
    "name": "your-project/wordpress-theme",
    "type": "wordpress-theme",
    "require": {
        "php": ">=7.4"
    },
    "scripts": {
        "setup-local": [
            "@setup-wordpress",
            "@install-plugins",
            "@activate-theme"
        ],
        "setup-wordpress": "bash scripts/wp-setup.sh",
        "install-plugins": "bash scripts/install-plugins.sh",
        "activate-theme": "wp theme activate mythme",
        "dev": [
            "@setup-local",
            "npm run dev"
        ]
    }
}
```

### 4. Local Blueprints（Local by Flywheel機能）

Localの「Blueprint」機能を使用して、環境全体をテンプレート化。

```json
{
  "name": "SOU Space Development",
  "description": "WebP対応のWordPress開発環境",
  "environment": {
    "php": "8.0",
    "mysql": "8.0",
    "wordpress": "latest"
  },
  "plugins": [
    {
      "name": "wp-pagenavi",
      "version": "latest",
      "activate": true
    },
    {
      "name": "custom-webp-converter",
      "source": "file:///path/to/webp-converter.zip",
      "activate": true
    }
  ],
  "theme": {
    "name": "mythme",
    "source": "file:///path/to/theme.zip"
  },
  "settings": {
    "timezone": "Asia/Tokyo",
    "language": "ja",
    "permalink_structure": "/%post_id%/"
  }
}
```

### 5. Makefile による統合（シンプルで強力）

```makefile
# Makefile
.PHONY: setup dev build clean

# 変数定義
SITE_PATH = /Volumes/SP-STORAGE\ 1TB/Cliants/BHF.Inc/SOU/Web/SOU-SPACE/sou-space.osaka/app/public
PLUGIN_PATH = $(SITE_PATH)/wp-content/plugins
THEME_PATH = $(SITE_PATH)/wp-content/themes/mythme

# 開発環境セットアップ
setup:
	@echo "🚀 開発環境をセットアップ中..."
	@cd $(SITE_PATH) && bash $(THEME_PATH)/scripts/setup-local.sh
	@make install-custom-plugins
	@echo "✅ セットアップ完了！"

# カスタムプラグインのインストール
install-custom-plugins:
	@echo "📦 カスタムプラグインをインストール中..."
	@if [ ! -L "$(PLUGIN_PATH)/webp-converter" ]; then \
		ln -s $(PWD)/plugins/webp-converter $(PLUGIN_PATH)/webp-converter; \
		cd $(SITE_PATH) && wp plugin activate webp-converter; \
	fi

# 開発サーバー起動
dev: setup
	@echo "🔥 開発サーバーを起動中..."
	@cd $(THEME_PATH) && npm run dev

# ビルド
build:
	@echo "📦 本番用ビルドを作成中..."
	@cd $(THEME_PATH) && npm run build
	@cd plugins/webp-converter && zip -r webp-converter.zip . -x "*.git*"

# クリーンアップ
clean:
	@echo "🧹 クリーンアップ中..."
	@rm -rf $(PLUGIN_PATH)/webp-converter
	@cd $(SITE_PATH) && wp plugin deactivate webp-converter --uninstall
```

## 🔧 推奨ワークフロー

### 初回セットアップ
```bash
# 1. リポジトリをクローン
git clone your-repo.git
cd your-repo

# 2. 自動セットアップ実行
make setup

# 3. 開発開始
make dev
```

### 日常の開発
```bash
# 開発サーバー起動（自動で最新状態に）
make dev

# プラグインの更新を反映
make install-custom-plugins

# 本番用ビルド
make build
```

## 📁 推奨ディレクトリ構造

```
project-root/
├── Makefile                    # 自動化スクリプト
├── composer.json              # Composer設定（オプション）
├── scripts/                   # 自動化スクリプト
│   ├── setup-local.sh        # Local環境セットアップ
│   └── install-plugins.sh    # プラグインインストール
├── themes/                    # テーマ開発
│   └── mythme/
├── plugins/                   # カスタムプラグイン開発
│   └── webp-converter/
└── docs/                      # ドキュメント
    └── local-development-automation.md
```

## 🚀 メリット

1. **即座の反映**: シンボリックリンクで開発中の変更が即座に反映
2. **一貫性**: 誰でも同じ環境を構築可能
3. **効率性**: 手動作業を削減
4. **拡張性**: 新しいプラグインやテーマを簡単に追加

## ✅ 実装済み機能

### WebP Converter プラグイン自動化
```bash
# プラグインセットアップ（Makefile統合済み）
make webp-setup      # プラグイン有効化 + 初期設定
make webp-convert    # 全画像をWebP変換
make webp-stats      # 変換統計表示
make webp-config     # 設定確認

# 完全セットアップ
make setup-full      # テーマ + プラグイン + WebP設定
```

### WP-CLI拡張コマンド（実装済み）
```bash
# WebP変換機能
wp webp convert-all --quality=85 --batch-size=50
wp webp convert 123 --quality=90
wp webp search --format=table
wp webp stats
wp webp config get quality
wp webp config set quality 90
```

### 自動化スクリプト
- ✅ `setup-local-webp.sh` - WebP プラグイン専用セットアップ
- ✅ Makefile統合 - 全機能を `make` コマンドで管理
- ✅ シンボリックリンク自動作成
- ✅ プラグイン有効化とWP-CLI連携

## 🎯 次のステップ

1. ✅ Makefileまたはシェルスクリプトを選択（完了）
2. ✅ プロジェクトルートに配置（完了）
3. 🚧 READMEに使用方法を記載（必要に応じて）
4. 🚧 チーム全体で共有

**現在は `make setup-full` 一発で全ての環境構築が完了します！**