# コードスタイル・規約

## 基本原則

- **推測・創作禁止** — 不明点は `docs/` を読んで確認
- **標準ツール優先** — カスタムスクリプトより業界標準ツール
- **ボーイスカウトルール** — 触れたコードは綺麗にして去る
- **デッドコード禁止** — 未使用コード、コメントアウトは残さない

## エラーハンドリング

- **try-catch/throw 禁止** — ESLintルールで禁止済み
- **neverthrow を使用** — すべてのエラーは `Result` / `ResultAsync` 型で表現
- **外部コードのラップ** — `Result.fromThrowable()` または `ResultAsync.fromPromise()` でラップ
- **エラー伝播** — `result.isErr()` でチェックし、早期リターン

## TypeScript

- ESM（`"type": "module"`）
- `strict: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `verbatimModuleSyntax: true`

## スキーマ・バリデーション

- スキーマは `src/schemas/` に Zod で定義
- 型は Zod から推論で取得（`z.infer<typeof schema>`）
- バリデーションエラーは Zod の parse で処理

## ファイル操作

- front matter 付き Markdown は `gray-matter` で読み書き
- YAML は `yaml` パッケージで処理

## 命名規則

- ファイル名: kebab-case（`battle-log.ts`）
- 変数・関数: camelCase
- 型・クラス: PascalCase
- 定数: UPPER_SNAKE_CASE（必要に応じて）

## ファイル編集ルール

**コマンドを優先すべきファイル**（直接編集しない）:
- `package.json` → `npm init`, `npm pkg set`, `npm install`
- `tsconfig.json` → `npx tsc --init`
- ロックファイル → 自動生成に任せる

**直接編集してよいファイル**:
- `src/` 配下のソースコード
- `docs/` 配下のドキュメント
- `.github/workflows/` のワークフロー定義
