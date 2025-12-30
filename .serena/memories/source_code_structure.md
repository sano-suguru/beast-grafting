# ソースコード構成

## ディレクトリ構造

```
src/
  schemas/         # Zodスキーマ定義
    beast.ts       # 魔獣スキーマ（BeastSchema, BeastInputSchema）
    binder.ts      # 獣使いスキーマ
    battle-log.ts  # 戦闘記録スキーマ
    index.ts       # 再エクスポート
  
  prompts/         # AIプロンプト（Markdown）
    world.md       # 共通世界観（AI生成時に自動挿入）
    generate-beast.md  # 魔獣自動生成
    battle.md      # バトル描写生成
  
  lib/             # ユーティリティ
    ai.ts          # AIクライアント生成（GitHub Models経由）
    errors.ts      # AppError型定義、エラーファクトリ
    validate.ts    # バリデーション（スキーマ + インジェクション検出）
    yaml.ts        # YAML読み書き
    markdown.ts    # Markdown生成、front matter処理
    ranking.ts     # ランキング生成
    prompt.ts      # プロンプトテンプレート処理
    index.ts       # 再エクスポート
  
  workflows/       # ビジネスロジック
    register.ts    # 魔獣登録処理
    register-cli.ts # 登録CLIエントリポイント
    battle.ts      # バトル実行
    battle-cli.ts  # バトルCLIエントリポイント
    death.ts       # 死亡処理
    index.ts       # 再エクスポート
```

## 主要なエクスポート

### スキーマ（src/schemas/）
- `BeastSchema`, `BeastInputSchema` - 魔獣定義
- `BinderSchema` - 獣使い定義
- `BattleLogSchema` - 戦闘記録定義
- 型は `z.infer<typeof Schema>` で推論

### エラー（src/lib/errors.ts）
- `AppError` - 共通エラー型
- `ErrorKind` - エラー種別タグ
- ファクトリ関数: `validationError()`, `injectionError()`, `aiGenerationError()`等

### AI（src/lib/ai.ts）
- `createAIClient()` - GitHub Models経由でVercel AI SDKクライアント生成
- `DEFAULT_MODEL` = "gpt-4o"

### ワークフロー（src/workflows/）
- `registerBeast()` - 魔獣登録（バリデーション→AI補完→保存）
- `executeBattle()` - 単一バトル実行
- `generateMatchups()` - 同階級マッチング生成
- `processDeath()` - 死亡処理

## neverthrowパターン

すべての関数は `Result<T, AppError>` または `ResultAsync<T, AppError>` を返す。

```typescript
// 成功
return ok(value);

// 失敗
return err(validationError(errors));

// 外部ライブラリのラップ
const result = Result.fromThrowable(parseYaml)(content);

// 非同期
const result = await ResultAsync.fromPromise(
  fetch(url),
  (e) => createError("UNKNOWN_ERROR", String(e))
);
```
