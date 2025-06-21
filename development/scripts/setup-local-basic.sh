#!/bin/bash

# 色付きログ出力
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== WebP Converter Plugin 基本セットアップ ===${NC}"

# 基本設定（相対パスで設定）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SITE_PATH="$PROJECT_ROOT/app/public"
PLUGIN_DEV_PATH="$PROJECT_ROOT/development/plugins/webp-converter"
PLUGIN_WP_PATH="$SITE_PATH/wp-content/plugins/webp-converter"

echo -e "${GREEN}[1/3] プラグインリンクを作成中...${NC}"
if [ ! -L "$PLUGIN_WP_PATH" ]; then
    ln -sf "$PLUGIN_DEV_PATH" "$PLUGIN_WP_PATH"
    echo "✅ シンボリックリンク作成完了"
else
    echo "⚠️  シンボリックリンクは既に存在します"
fi

echo -e "${GREEN}[2/3] プラグインファイルの存在確認...${NC}"
if [ -f "$PLUGIN_WP_PATH/webp-converter.php" ]; then
    echo "✅ プラグインファイルが正常にリンクされています"
    echo "📄 メインファイル: $PLUGIN_WP_PATH/webp-converter.php"
else
    echo -e "${RED}❌ プラグインファイルが見つかりません${NC}"
    exit 1
fi

echo -e "${GREEN}[3/3] WordPress 管理画面での手動有効化が必要です${NC}"
echo ""
echo -e "${BLUE}=== 手動セットアップ手順 ===${NC}"
echo ""
echo "🌐 WordPress管理画面にアクセスしてください："
echo "   http://sou-space.osaka.local/wp-admin/"
echo ""
echo "🔌 プラグイン管理で以下を実行："
echo "   1. 「プラグイン」 > 「インストール済みプラグイン」に移動"
echo "   2. 「WebP Converter for Media」を探す"
echo "   3. 「有効化」をクリック"
echo ""
echo "⚙️  有効化後の確認："
echo "   - 設定 > WebP Converter でプラグイン設定を確認"
echo "   - メディア > ライブラリ でWebPアップロードをテスト"
echo ""

# Local by Flywheel 専用のWP-CLI説明
echo -e "${YELLOW}🖥️  WP-CLIを使用する場合（Local環境内）:${NC}"
echo ""
echo "1. Local by Flywheelアプリを開く"
echo "2. サイト「sou-space.osaka」を選択"
echo "3. 「Open site shell」をクリック"
echo "4. 以下のコマンドを実行："
echo ""
echo "   # プラグイン有効化"
echo "   wp plugin activate webp-converter"
echo ""
echo "   # WebP設定"
echo "   wp webp config set quality 85"
echo "   wp webp config set auto_convert true"
echo ""
echo "   # 画像変換（画像がある場合）"
echo "   wp webp convert-all --quality=85"
echo ""

echo -e "${BLUE}=== 基本セットアップ完了！ ===${NC}"
echo ""
echo "✅ プラグインファイルは正常に配置されました"
echo "🔧 WordPress管理画面からプラグインを有効化してください"
echo "📖 詳細: $PROJECT_ROOT/README.md"