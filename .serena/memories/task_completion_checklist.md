# タスク完了時チェックリスト

## 必須チェック

タスク完了時は以下のコマンドを実行して確認：

```bash
npm run typecheck && npm run lint && npm run test:run
```

## 詳細

1. **型チェック** (`npm run typecheck`)
   - TypeScriptの型エラーがないこと

2. **リント** (`npm run lint`)
   - ESLintエラーがないこと
   - 特に `no-restricted-syntax` ルール（try-catch/throw禁止）に注意

3. **テスト** (`npm run test:run`)
   - すべてのテストがパスすること

## 追加確認（推奨）

- **フォーマット**: `npm run format:check` でフォーマット確認
- **未使用import**: 不要なimportが残っていないか
- **デッドコード**: 未使用の変数・関数がないか
- **TODO**: 解決できるTODOは対応済みか

## コミット前

Husky + lint-staged が自動でリント・フォーマットを実行。
手動で確認する必要は通常ないが、エラーが出た場合は修正。
