# コーディング規約

## 🎯 基本方針

1. **可読性優先**: コードは書く時間より読む時間の方が長い
2. **一貫性**: プロジェクト全体で統一されたスタイル
3. **保守性**: 将来の変更に柔軟に対応できる構造
4. **パフォーマンス**: ユーザー体験を最優先に

## 📝 HTML規約

### 基本ルール

```html
<!-- セマンティックなHTML5タグを使用 -->
<header class="l-header">
  <nav class="c-navigation" role="navigation" aria-label="メインメニュー">
    <ul class="c-navigation__list">
      <li class="c-navigation__item">
        <a href="/" class="c-navigation__link">ホーム</a>
      </li>
    </ul>
  </nav>
</header>

<!-- アクセシビリティ属性を忘れずに -->
<button type="button" class="c-button js-modal-trigger" aria-label="メニューを開く">
  <span class="c-button__icon"></span>
</button>
```

### 命名規則

- ID: キャメルケース `userId`
- Class: BEM記法 `block__element--modifier`
- data属性: ケバブケース `data-user-id`

## 🎨 CSS/SCSS規約

### プロパティの記述順序

```scss
.component {
  // 1. ポジショニング
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  
  // 2. ボックスモデル
  display: flex;
  width: 100%;
  height: 50px;
  padding: 10px;
  margin: 0 auto;
  
  // 3. タイポグラフィ
  font-family: sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  
  // 4. 装飾
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  
  // 5. その他
  transition: all 0.3s ease;
  cursor: pointer;
}
```

### メディアクエリ

```scss
// モバイルファーストで記述
.component {
  width: 100%;
  
  @include media('md') {
    width: 50%;
  }
  
  @include media('lg') {
    width: 33.333%;
  }
}
```

## 💻 JavaScript規約

### ES6+構文を使用

```javascript
// クラス定義
class Component {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    this.bindEvents();
  }
  
  bindEvents() {
    this.element.addEventListener('click', this.handleClick.bind(this));
  }
  
  handleClick(event) {
    event.preventDefault();
    // 処理
  }
}

// モジュール化
export default Component;
```

### 命名規則

```javascript
// 定数: アッパースネークケース
const API_ENDPOINT = 'https://api.example.com';

// 変数・関数: キャメルケース
let userName = 'John';
function getUserData() {}

// クラス: パスカルケース
class UserProfile {}

// プライベートメソッド: アンダースコア接頭辞
_privateMethod() {}
```

## 🔧 PHP規約（WordPress）

### WordPress コーディング規約に準拠

```php
<?php
/**
 * カスタム投稿タイプの登録
 *
 * @package ThemeName
 */

namespace ThemeName\PostTypes;

/**
 * News投稿タイプクラス
 */
class News {
    /**
     * コンストラクタ
     */
    public function __construct() {
        add_action( 'init', [ $this, 'register' ] );
    }
    
    /**
     * 投稿タイプを登録
     *
     * @return void
     */
    public function register() {
        $args = [
            'label'        => 'お知らせ',
            'public'       => true,
            'has_archive'  => true,
            'show_in_rest' => true,
            'supports'     => [ 'title', 'editor', 'thumbnail' ],
        ];
        
        register_post_type( 'news', $args );
    }
}
```

### セキュリティ

```php
// 出力時は必ずエスケープ
echo esc_html( $title );
echo esc_url( $link );
echo esc_attr( $class );

// SQLクエリはプリペアドステートメント使用
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->posts} WHERE post_type = %s",
        'post'
    )
);

// nonce検証
if ( ! wp_verify_nonce( $_POST['nonce'], 'action_name' ) ) {
    die( 'Security check' );
}
```

## 📁 ファイル・フォルダ命名規則

```
// HTML/PHP: ケバブケース
page-about.php
template-contact.php

// SCSS: アンダースコア接頭辞
_variables.scss
_mixins.scss

// JavaScript: キャメルケース
userProfile.js
apiClient.js

// 画像: ケバブケース
hero-background.jpg
icon-arrow-right.svg
```

## 🖼️ 画像最適化

1. **フォーマット選択**
   - 写真: WebP（フォールバックでJPEG）
   - アイコン・ロゴ: SVG
   - 透過画像: WebP/PNG

2. **命名規則**
   ```
   用途-説明-サイズ.拡張子
   hero-top-1920x1080.jpg
   icon-menu-24x24.svg
   ```

3. **最適化**
   - 適切な圧縮率
   - レスポンシブ画像の使用
   - 遅延読み込みの実装

## 🔄 Git コミットメッセージ

```
<type>: <subject>

<body>

<footer>
```

### Type
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット修正
- `refactor`: リファクタリング
- `test`: テスト
- `chore`: ビルド・補助ツール

### 例
```
feat: お問い合わせフォームを追加

Contact Form 7を使用したお問い合わせフォームを実装
バリデーション機能とメール送信機能を含む

Closes #123
```

## ✅ コードレビューチェックリスト

- [ ] 命名規則に従っているか
- [ ] 適切にコメントが書かれているか
- [ ] セキュリティ対策がされているか
- [ ] パフォーマンスを考慮しているか
- [ ] レスポンシブ対応されているか
- [ ] アクセシビリティ対応されているか
- [ ] エラーハンドリングがされているか
- [ ] 再利用可能な設計になっているか