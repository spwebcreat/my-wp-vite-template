# 🚀 Local by WP Engine セットアップガイド

このガイドは、**Local by WP Engine** のサイトシェル内で実行するWordPress固有の設定です。

## 📋 前提条件

- **Local by WP Engine** でサイトが作成済み
- **Site Shell** が開いている状態

## 🎯 クイックセットアップ

### Step 1: Site Shellを開く

1. **Local アプリ**を起動
2. **サイトを選択**
3. **「Open site shell」**をクリック
4. ターミナルが開いたら以下を実行

### Step 2: 自動セットアップ実行

```bash
# テーマディレクトリに移動
cd app/public/wp-content/themes/mythme

# 自動セットアップ実行
bash ../../scripts/setup-local.sh
```

## 🛠️ 手動セットアップ（詳細制御）

自動セットアップが失敗した場合や、個別に設定したい場合は以下を実行：

### 基本設定

```bash
# 日本語設定
wp core language install ja --activate

# タイムゾーン設定
wp option update timezone_string 'Asia/Tokyo'
wp option update date_format 'Y年n月j日'
wp option update time_format 'H:i'
```

### クリーンアップ

```bash
# 不要記事の削除
wp post delete 1 2 3 --force 2>/dev/null || echo "デフォルト投稿が見つかりません"

# デフォルトプラグイン削除
wp plugin delete akismet hello 2>/dev/null || echo "デフォルトプラグインが見つかりません"

# デフォルトテーマ削除
wp theme delete twentytwentythree twentytwentytwo 2>/dev/null || echo "デフォルトテーマが見つかりません"
```

### プラグインインストール

#### 基本プラグイン
```bash
wp plugin install wp-multibyte-patch --activate
wp plugin install wp-pagenavi --activate
wp plugin install mw-wp-form --activate
wp plugin install custom-post-type-ui --activate
wp plugin install intuitive-custom-post-order --activate
wp plugin install duplicate-post --activate
wp plugin install custom-post-type-permalinks --activate
```

#### セキュリティ・管理系プラグイン
```bash
wp plugin install siteguard --activate
wp plugin install backwpup --activate
wp plugin install google-sitemap-generator --activate
wp plugin install all-in-one-wp-migration --activate
```

### ページ設定

```bash
# ホームページ作成
HOME_ID=$(wp post create --post_type=page --post_title=Home --post_status=publish --porcelain)
wp option update page_on_front "$HOME_ID"
wp option update show_on_front page
```

### パーマリンク設定

```bash
wp rewrite structure '/%post_id%/'
wp rewrite flush
```

### 開発用設定

```bash
# デバッグ設定
wp config set WP_DEBUG true --raw
wp config set WP_DEBUG_LOG true --raw
wp config set WP_DEBUG_DISPLAY false --raw
wp config set SCRIPT_DEBUG true --raw
```

### その他

```bash
# 翻訳の更新
wp core language update

# テーマ有効化
wp theme activate mythme
```

## 📊 状態確認コマンド

### WordPress情報確認
```bash
# バージョン確認
wp core version

# 有効なプラグイン一覧
wp plugin list --status=active --format=table

# 有効なテーマ確認
wp theme list --status=active

# パーマリンク確認
wp option get permalink_structure
```

### WebP プラグイン関連（プラグイン開発後）

```bash
# WebP Converterプラグイン有効化
wp plugin activate webp-converter

# 全画像をWebP変換
wp webp convert-all --quality=85

# 変換統計確認
wp webp stats

# WebP設定確認
wp webp config get
```

## 🚨 トラブルシューティング

### よくあるエラー

**「wp: command not found」**
```bash
# Site Shellが正しく開いているか確認
which wp
# 結果: /usr/local/bin/wp (正常)
```

**プラグインインストールエラー**
```bash
# インターネット接続確認
ping wordpress.org

# プラグインが既にインストール済みか確認
wp plugin list --name=プラグイン名
```

**テーマが見つからない**
```bash
# テーマディレクトリの確認
ls -la wp-content/themes/

# シンボリックリンクの確認
readlink wp-content/themes/mythme
```

## 💡 開発Tips

### 効率的なワークフロー

1. **初回のみ**: フルセットアップスクリプト実行
2. **日常開発**: 通常のターミナルで `make dev`
3. **WordPress設定変更**: Site Shellで個別コマンド実行

### よく使うコマンドセット

```bash
# 開発中によく使うコマンド
wp plugin list --status=active     # アクティブプラグイン確認
wp theme list                      # インストール済みテーマ一覧
wp option get siteurl              # サイトURL確認
wp user list                       # ユーザー一覧
wp post list --post_type=page      # ページ一覧
```

### エイリアス設定（オプション）

Site Shell用の`.bash_profile`に追加：

```bash
# WordPress用エイリアス
alias wpst='wp theme list --status=active'
alias wpsp='wp plugin list --status=active'
alias wpsi='wp core version && wp core check-update'
```

---

📚 **メインガイドに戻る**: [README.md](README.md#クイックスタート)