# GitHub Actions ワークフロー

## CI (.github/workflows/ci.yml)

コード品質チェック（push/PRトリガー）

```bash
npm run typecheck  # 型チェック
npm run lint       # ESLint
npm run format:check  # Prettier
npm run test:run   # Vitest
```

対象外パス: beasts/, binders/, battle_logs/, graveyard/, RANKING.md

## register.yml

Issue作成 → 魔獣登録 → PR作成

## battle.yml

PR merge → 初陣バトル実行

## arena.yml

定期興行（毎日21:00 JST、cron）

## その他

- codeql.yml - セキュリティスキャン
- sbom.yml - SBOM生成
- dependabot.yml - 依存関係更新
