# 開発コマンド一覧

## セットアップ

```bash
npm install
```

## 開発中の確認

```bash
# 型チェック
npm run typecheck

# リント
npm run lint

# リント（自動修正あり）
npm run lint:fix

# フォーマット
npm run format

# フォーマットチェック
npm run format:check
```

## テスト

```bash
# テスト（watchモード）
npm run test

# テスト（1回実行）
npm run test:run
```

## ビルド

```bash
npm run build
```

## タスク完了時に実行するコマンド

```bash
npm run typecheck && npm run lint && npm run test:run
```

## Git操作

```bash
# git log（PAGER無効化）
git --no-pager log --oneline -10

# gh CLI（PAGER無効化必須）
GH_PAGER='' gh issue list
GH_PAGER='' gh pr list
```

## システムコマンド (macOS / Darwin)

```bash
# ファイル検索
find . -name "*.ts" -type f

# テキスト検索
grep -r "pattern" src/

# ディレクトリ一覧
ls -la

# カレントディレクトリ
pwd
```
