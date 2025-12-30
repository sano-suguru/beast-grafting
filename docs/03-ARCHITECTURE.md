# Beast Binding Arena - アーキテクチャ設計書

## 技術スタック

| レイヤー       | 技術          |
| -------------- | ------------- |
| 言語           | TypeScript    |
| ランタイム     | Node.js       |
| AI SDK         | Vercel AI SDK |
| バリデーション | Zod           |
| YAML           | yaml          |
| Front matter   | gray-matter   |
| テスト         | Vitest        |

## 決定理由

### TypeScript

Python、Deno、Goも候補だったが、TypeScriptを選択。

- 型安全で保守しやすい
- AI SDK（Vercel AI SDK）との統合がモダン
- GitHub Actionsで標準サポート
- front matter、YAMLのエコシステムが成熟

### Vercel AI SDK

OpenAI SDK、Azure SDK、直接RESTも候補だったが、Vercel AI SDKを選択。

- プロバイダー非依存（GitHub Models → Azure OpenAI移行が容易）
- ストリーミング、構造化出力に標準対応
- TypeScriptネイティブ

GitHub ModelsはOpenAI互換エンドポイントを提供しているため、Vercel AI SDKでそのまま使える。

### Zod

JSON Schema + ajv、Yupも候補だったが、Zodを選択。

- TypeScriptネイティブ、型推論が効く
- スキーマ定義がソースコードと一体化
- 必要ならJSON Schema出力も可能（zod-to-json-schema）

### Vitest

Jestも候補だったが、Vitestを選択。

- モダン、高速
- ESM対応が良い
- 設定がシンプル

## ディレクトリ構成

```
src/
  schemas/         # Zodスキーマ定義
  prompts/         # AIプロンプト（Markdown）
  lib/
    ai.ts          # AI呼び出し
    validate.ts    # バリデーション
    yaml.ts        # YAML読み書き
    markdown.ts    # Markdown生成、front matter処理
    ranking.ts     # ランキング生成
  workflows/
    register.ts    # 魔獣登録処理
    battle.ts      # バトル実行
    death.ts       # 死亡処理
tests/
```

## プロンプト管理

AIプロンプトは `src/prompts/*.md` で管理。

- 調整頻度が高い
- 非エンジニアもレビューできる
- ソースコードに埋め込まない

```
src/prompts/
  generate-beast.md    # 魔獣自動生成
  battle.md            # バトル描写生成（死亡判定含む）
```

## GitHub Actions構成

```yaml
# .github/workflows/register.yml
# Issue作成 → YAML生成 → PR作成

# .github/workflows/battle.yml
# PR merge → 初陣バトル実行

# .github/workflows/arena.yml
# cron(21:00 JST) → 定期興行
```

## 依存関係

```json
{
  "dependencies": {
    "ai": "^3.x",
    "@ai-sdk/openai": "^0.x",
    "zod": "^3.x",
    "yaml": "^2.x",
    "gray-matter": "^4.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vitest": "^1.x",
    "@types/node": "^20.x"
  }
}
```

## 外部サービス

| サービス       | 用途                 |
| -------------- | -------------------- |
| GitHub Models  | AI呼び出し（GPT-4o） |
| GitHub Actions | ワークフロー実行     |

## 将来の拡張ポイント

### Azure OpenAI移行

Vercel AI SDKのプロバイダーを差し替えるだけ。

```typescript
// Before: GitHub Models
import { createOpenAI } from '@ai-sdk/openai';
const ai = createOpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN,
});

// After: Azure OpenAI
import { createAzure } from '@ai-sdk/azure';
const ai = createAzure({
  resourceName: 'your-resource',
  apiKey: process.env.AZURE_API_KEY,
});
```

### Discord連携

GitHub ActionsからWebhookでDiscordに通知。追加の依存は不要。
