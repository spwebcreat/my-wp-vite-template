#!/bin/bash

# ========================================
# My WP Vite Template - セットアップスクリプト
# ========================================

# 色付きログ出力
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# ヘッダー表示
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Local WordPress 環境セットアップ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# スクリプトの場所から相対的にパスを設定
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SITE_ROOT="$PROJECT_ROOT/app/public"

log_info "サイトルート: $SITE_ROOT"

# WP-CLIの存在確認
if ! command -v wp &> /dev/null; then
    log_error "WP-CLIがインストールされていません"
    echo "Localのサイトシェルから実行してください"
    exit 1
fi

# 基本設定
log_info "基本設定を適用中..."
cd "$SITE_ROOT"

# 日本語設定
wp core language install ja --activate
log_success "日本語設定完了"

# タイムゾーン設定
wp option update timezone_string 'Asia/Tokyo'
wp option update date_format 'Y年n月j日'
wp option update time_format 'H:i'
log_success "タイムゾーン設定完了"

# 不要なデフォルトコンテンツを削除
log_info "デフォルトコンテンツを削除中..."
wp post delete 1 2 3 --force 2>/dev/null || log_warning "デフォルト投稿が見つかりません"
wp plugin delete akismet hello 2>/dev/null || log_warning "デフォルトプラグインが見つかりません"
wp theme delete twentytwentythree twentytwentytwo 2>/dev/null || log_warning "デフォルトテーマが見つかりません"
log_success "クリーンアップ完了"

# 公式プラグインのインストール
log_info "必須プラグインをインストール中..."

# 基本プラグイン
BASIC_PLUGINS=(
    "wp-multibyte-patch"
    "wp-pagenavi"
    "mw-wp-form"
    "intuitive-custom-post-order"
    "duplicate-post"
    "custom-post-type-permalinks"
)

# セキュリティ・管理系プラグイン
ADMIN_PLUGINS=(
    "siteguard"
    "backwpup"
    "google-sitemap-generator"
    "all-in-one-wp-migration"
)

# プラグインインストール関数
install_plugins() {
    local plugins=("$@")
    for plugin in "${plugins[@]}"; do
        if wp plugin is-installed "$plugin" 2>/dev/null; then
            log_warning "$plugin は既にインストール済み"
        else
            wp plugin install "$plugin" --activate
            log_success "$plugin インストール完了"
        fi
    done
}

# プラグインをインストール
install_plugins "${BASIC_PLUGINS[@]}"
install_plugins "${ADMIN_PLUGINS[@]}"

# カスタムプラグインのインストール（今後の拡張用）
log_info "カスタムプラグインをチェック中..."

# WebP Converterプラグインのパス
PLUGIN_DIR="$SITE_ROOT/wp-content/plugins"
WEBP_PLUGIN_PATH="$PLUGIN_DIR/webp-converter"

# プラグインが存在する場合は有効化
if [ -d "$WEBP_PLUGIN_PATH" ]; then
    wp plugin activate webp-converter
    log_success "WebP Converterプラグインを有効化しました"
else
    log_warning "WebP Converterプラグインはまだインストールされていません"
    echo "  → プラグイン開発後に '$PLUGIN_DIR' に配置してください"
fi

# ページ作成
log_info "基本ページを作成中..."
if ! wp post list --post_type=page --title="Home" --format=count | grep -q "1"; then
    HOME_ID=$(wp post create --post_type=page --post_title=Home --post_status=publish --porcelain)
    wp option update page_on_front "$HOME_ID"
    wp option update show_on_front page
    log_success "ホームページ作成完了"
else
    log_warning "ホームページは既に存在します"
fi

# パーマリンク設定
log_info "パーマリンクを設定中..."
wp rewrite structure '/%post_id%/'
wp rewrite flush
log_success "パーマリンク設定完了"

# 翻訳の更新
log_info "翻訳ファイルを更新中..."
wp core language update
log_success "翻訳更新完了"

# テーマの有効化確認
THEME_NAME="mythme"  # カスタムテーマ名（必要に応じて変更）
CURRENT_THEME=$(wp theme list --status=active --field=name)
if [ "$CURRENT_THEME" != "$THEME_NAME" ]; then
    log_warning "$THEME_NAME テーマが有効ではありません"
    if wp theme is-installed "$THEME_NAME"; then
        wp theme activate "$THEME_NAME"
        log_success "$THEME_NAME テーマを有効化しました"
    else
        log_warning "$THEME_NAME テーマがインストールされていません"
        log_info "手動でテーマを有効化してください"
    fi
fi

# 開発用設定
log_info "開発用設定を適用中..."
wp config set WP_DEBUG true --raw
wp config set WP_DEBUG_LOG true --raw
wp config set WP_DEBUG_DISPLAY false --raw
wp config set SCRIPT_DEBUG true --raw
log_success "開発用設定完了"

# 完了メッセージ
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   セットアップが完了しました！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "次のステップ:"
echo "1. テーマディレクトリで 'npm install' を実行"
echo "2. 'npm run dev' で開発サーバーを起動"
echo "3. WebP Converterプラグインを開発後、plugins/ディレクトリに配置"
echo ""
echo -e "${BLUE}Happy Coding! 🚀${NC}"