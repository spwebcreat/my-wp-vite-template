# Claude Desktop App 設定

このディレクトリには、Claude Desktop Appでプロジェクトを開く際の設定が含まれています。

## ファイル構成

- `commands/` - カスタムコマンド定義
  - `plan-github-issue.md` - GitHub issue実装計画作成コマンド
- `settings.shared.json` - プロジェクト共有設定（Git管理対象）
- `settings.local.json` - ローカル固有設定（Git管理対象外）

## 使い方

1. Claude Desktop Appでプロジェクトを開く
2. `settings.local.json`が自動生成される
3. 必要に応じて権限を調整

## 注意事項

- `settings.local.json`はグローバルgitignoreで除外されています
- プロジェクト固有の設定は`settings.shared.json`に記載してください 