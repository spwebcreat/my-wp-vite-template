#!/bin/bash

# 色付きログ出力
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== WebP Converter Plugin セットアップ開始 ===${NC}"

# 基本設定（相対パスで設定）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SITE_PATH="$PROJECT_ROOT/app/public"
PLUGIN_DEV_PATH="$PROJECT_ROOT/development/plugins/webp-converter"
PLUGIN_WP_PATH="$SITE_PATH/wp-content/plugins/webp-converter"

echo -e "${GREEN}[1/5] プラグインリンクを作成中...${NC}"
if [ ! -L "$PLUGIN_WP_PATH" ]; then
    ln -s "$PLUGIN_DEV_PATH" "$PLUGIN_WP_PATH"
    echo "✅ シンボリックリンク作成完了"
else
    echo "⚠️  シンボリックリンクは既に存在します"
fi

echo -e "${GREEN}[2/5] プラグインを有効化中...${NC}"
cd "$SITE_PATH"
wp plugin activate webp-converter
if [ $? -eq 0 ]; then
    echo "✅ WebP Converter プラグイン有効化完了"
else
    echo -e "${RED}❌ プラグインの有効化に失敗しました${NC}"
fi

echo -e "${GREEN}[3/5] WebP Converter設定を初期化中...${NC}"
wp webp config set quality 85
wp webp config set auto_convert true
wp webp config set convert_on_upload true
wp webp config set enable_lazy_load true
echo "✅ 設定初期化完了"

echo -e "${GREEN}[4/5] WebP変換可能な画像を検索中...${NC}"
CONVERTIBLE_COUNT=$(wp webp search --format=count)
echo "📊 変換可能な画像: $CONVERTIBLE_COUNT 個"

if [ "$CONVERTIBLE_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}[確認] 既存画像をWebPに変換しますか？ (y/N)${NC}"
    read -p "> " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}[5/5] 既存画像をWebPに変換中...${NC}"
        wp webp convert-all --quality=85 --batch-size=10
        echo "✅ 既存画像の変換完了"
    else
        echo "⏭️  既存画像の変換をスキップしました"
    fi
else
    echo "⏭️  変換対象の画像がありませんでした"
fi

echo -e "${GREEN}現在の設定を確認中...${NC}"
wp webp config get

echo -e "${GREEN}変換統計を表示中...${NC}"
wp webp stats

echo -e "${BLUE}=== WebP Converter Plugin セットアップ完了！ ===${NC}"
echo ""
echo "🚀 使用可能なWP-CLIコマンド:"
echo "  wp webp convert-all        # 全画像をWebPに変換"
echo "  wp webp convert <ID>       # 特定画像をWebPに変換"
echo "  wp webp search             # 変換可能画像を検索"
echo "  wp webp stats              # 変換統計を表示"
echo "  wp webp config get         # 設定を表示"
echo "  wp webp config set key val # 設定を変更"
echo ""
echo "📖 詳細: wp help webp"