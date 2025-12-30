# Beast Binding Arena

GitHub Issueで魔獣を登録し、AIが闘技場でバトル描写を生成するヘッドレスゲーム。

## 遊び方

1. **魔獣登録**: [Issue作成](../../issues/new?template=beast-registration.yml)から魔獣を登録
2. **初陣**: PR がマージされると自動でバトル開始
3. **定期興行**: 毎日21:00 JSTに闘技場で対戦

## ルール

- 魔獣は消耗品。死んだら `graveyard/` へ
- 獣使い（GitHubユーザー）は永続。名声が蓄積
- 同階級ランダムマッチ。指名制なし
- 勝敗はAIが物語で決定

## ディレクトリ構成

```
beasts/       # 生存中の魔獣（YAML）
graveyard/    # 死亡した魔獣の墓碑（Markdown）
binders/      # 獣使いデータ（YAML）
battle_logs/  # 戦闘記録（Markdown）
RANKING.md    # 闘技場番付
```

## 開発

```bash
npm install
npm run typecheck
npm run lint
npm run test
```

## ドキュメント

- [要件定義](docs/01-REQUIREMENTS.md)
- [詳細仕様](docs/02-SPECIFICATION.md)
- [アーキテクチャ](docs/03-ARCHITECTURE.md)

## ライセンス

ISC
