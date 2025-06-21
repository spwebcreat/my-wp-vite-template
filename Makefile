# ========================================
# My WP Vite Template - Makefile
# ========================================

# パスをエスケープして定義
PROJECT_ROOT := $(shell pwd)
THEME_DIR := "$(PROJECT_ROOT)/development/themes/mythme"
PLUGIN_DIR := "$(PROJECT_ROOT)/development/plugins"
WP_ROOT := "$(PROJECT_ROOT)/app/public"
WP_THEMES := "$(PROJECT_ROOT)/app/public/wp-content/themes"
WP_PLUGINS := "$(PROJECT_ROOT)/app/public/wp-content/plugins"

# Advanced WebP Converter プラグイン関連  
WEBP_PLUGIN_DEV := "$(PROJECT_ROOT)/development/plugins/advanced-webp-converter"
WEBP_PLUGIN_WP := "$(PROJECT_ROOT)/app/public/wp-content/plugins/advanced-webp-converter"

# デフォルトターゲット
.DEFAULT_GOAL := help

# ヘルプ表示
.PHONY: help
help:
	@echo "🏗️  My WP Vite Template プロジェクト管理"
	@echo ""
	@echo "🚀 開発コマンド（どこでも実行可能）:"
	@echo "  make dev        - 開発サーバー起動"
	@echo "  make build      - 本番ビルド"
	@echo "  make clean      - ビルドファイルクリーンアップ"
	@echo ""
	@echo "🔧 セットアップ（どこでも実行可能）:"
	@echo "  make setup       - 開発環境セットアップ"
	@echo "  make links       - シンボリックリンク再作成"
	@echo "  make install     - npm依存関係インストール"
	@echo ""
	@echo "🔌 プラグイン管理（どこでも実行可能）:"
	@echo "  make plugin-new        - WebPプラグイン作成"
	@echo "  make plugin-link       - プラグインリンク作成"
	@echo "  make webp-setup-basic  - WebP基本セットアップ（WP-CLIなし）"
	@echo ""
	@echo "📊 情報表示:"
	@echo "  make status     - プロジェクト状態確認"
	@echo "  make local-info - Local環境セットアップ情報"
	@echo ""
	@echo "📚 その他:"
	@echo "  make start      - 開発開始ガイド表示"
	@echo "  make ide        - IDE (VS Code) を起動"
	@echo ""
	@echo "📖 WordPress設定: LOCAL-SETUP.md を参照"
	@echo ""

# 開発サーバー起動
.PHONY: dev
dev:
	@echo "🔥 開発サーバーを起動中..."
	npm run dev

# 本番ビルド
.PHONY: build
build:
	@echo "📦 本番用ビルドを作成中..."
	npm run build
	@echo "✅ ビルド完了！"

# クリーンアップ
.PHONY: clean
clean:
	@echo "🧹 ビルドファイルをクリーンアップ中..."
	rm -rf development/themes/mythme/dist/*
	@echo "✅ クリーンアップ完了！"

# 開発環境セットアップ
.PHONY: setup
setup:
	@echo "🔧 開発環境をセットアップ中..."
	@mkdir -p $(PLUGIN_DIR)
	@mkdir -p development/scripts
	@mkdir -p development/docs
	@make links
	@make install
	@echo "✅ セットアップ完了！"

# npm依存関係インストール
.PHONY: install
install:
	@echo "📦 npm依存関係をインストール中..."
	npm install
	@echo "✅ インストール完了！"

# シンボリックリンク作成
.PHONY: links
links:
	@echo "🔗 シンボリックリンクを作成中..."
	@if [ ! -L $(WP_THEMES)/mythme ]; then \
		ln -sf ../../../../development/themes/mythme $(WP_THEMES)/mythme; \
		echo "✅ テーマリンク作成完了"; \
	else \
		echo "⚠️  テーマリンクは既に存在します"; \
	fi
	@if [ -d $(WEBP_PLUGIN_DEV) ] && [ ! -L $(WEBP_PLUGIN_WP) ]; then \
		ln -sf ../../../../development/plugins/advanced-webp-converter $(WP_PLUGINS)/advanced-webp-converter; \
		echo "✅ プラグインリンク作成完了"; \
	else \
		echo "⚠️  プラグインリンクは既に存在します"; \
	fi

# WebPプラグイン作成
.PHONY: plugin-new
plugin-new:
	@echo "🔌 WebP Converterプラグインを作成中..."
	@if [ ! -d "$(PLUGIN_DIR)/webp-converter" ]; then \
		mkdir -p $(PLUGIN_DIR)/webp-converter; \
		echo "✅ プラグインディレクトリを作成しました"; \
		echo "   場所: $(PLUGIN_DIR)/webp-converter"; \
	else \
		echo "⚠️  プラグインディレクトリは既に存在します"; \
	fi

# プラグインリンク作成
.PHONY: plugin-link
plugin-link:
	@echo "🔗 プラグインリンクを作成中..."
	@if [ -d "$(PLUGIN_DIR)/webp-converter" ] && [ ! -L "$(WP_PLUGINS)/webp-converter" ]; then \
		ln -s ../../../../development/plugins/webp-converter $(WP_PLUGINS)/webp-converter; \
		cd $(WP_ROOT) && wp plugin activate webp-converter; \
		echo "✅ プラグインリンク作成＆有効化完了"; \
	else \
		echo "⚠️  プラグインが見つからないか、既にリンクされています"; \
	fi

# プロジェクト状態確認
.PHONY: status
status:
	@echo "📊 My WP Vite Template プロジェクト状態:"
	@echo ""
	@echo "📁 プロジェクトルート: $(PROJECT_ROOT)"
	@echo "🎨 テーマディレクトリ: $(THEME_DIR)"
	@echo "🔌 プラグインディレクトリ: $(PLUGIN_DIR)"
	@echo ""
	@echo "🔗 シンボリックリンク状態:"
	@if [ -L "$(WP_THEMES)/mythme" ]; then \
		echo "  ✅ テーマ: $(WP_THEMES)/mythme -> $$(readlink $(WP_THEMES)/mythme)"; \
	else \
		echo "  ❌ テーマ: リンクされていません"; \
	fi
	@if [ -L "$(WP_PLUGINS)/webp-converter" ]; then \
		echo "  ✅ プラグイン: $(WP_PLUGINS)/webp-converter -> $$(readlink $(WP_PLUGINS)/webp-converter)"; \
	else \
		echo "  ❌ プラグイン: リンクされていません"; \
	fi

# Local環境情報表示
.PHONY: local-info
local-info:
	@echo "🌐 Local環境セットアップ情報:"
	@echo ""
	@echo "📖 詳細なWordPressセットアップ手順:"
	@echo "   cat LOCAL-SETUP.md"
	@echo ""
	@echo "🚀 クイックセットアップ:"
	@echo "   1. Local by WP Engine でサイト作成"
	@echo "   2. Site Shell を開く"
	@echo "   3. bash ../../scripts/setup-local.sh を実行"

# IDE用の統合コマンド
.PHONY: ide
ide:
	@echo "💻 IDE を起動中..."
	@code $(PROJECT_ROOT)

# WebP Converter関連のコマンド
.PHONY: webp-setup
webp-setup:
	@echo "🔌 WebP Converter プラグインをセットアップ中..."
	@bash "$(PROJECT_ROOT)/development/scripts/setup-local-webp.sh"

.PHONY: webp-setup-basic
webp-setup-basic:
	@echo "🔌 WebP Converter 基本セットアップ（WP-CLIなし）..."
	@bash "$(PROJECT_ROOT)/development/scripts/setup-local-basic.sh"


# 開発環境の完全セットアップ
.PHONY: setup-full
setup-full:
	@echo "🔧 完全な開発環境をセットアップ中..."
	@make setup
	@make webp-setup-basic
	@echo "✅ 完全セットアップ完了！"
	@echo ""
	@echo "📌 WordPressの詳細設定:"
	@echo "   詳細は LOCAL-SETUP.md を参照してください"
	@echo "   または 'make local-info' で手順を確認"

# 開発開始用の統合コマンド
.PHONY: start
start:
	@echo "🚀 開発を開始します..."
	@make status
	@echo ""
	@echo "📚 WordPress設定は LOCAL-SETUP.md を参照"
	@echo ""
	@echo "👍 次のコマンドで開発サーバーを起動してください:"
	@echo "   make dev"