# Beast Binding Arena - プロジェクト概要

## プロジェクトの目的

GitHub Issue で魔獣を登録し、AI が闘技場でバトル描写を生成するヘッドレスゲーム。

**コンセプト: 「高みを目指して、派手にくたばる」**

- 魔獣は消耗品。いつか必ず死ぬ
- 獣使いは永続。名声と資産が蓄積する
- 死は終わりではなく、次への投資

## 技術スタック

| レイヤー       | 技術                |
| -------------- | ------------------- |
| 言語           | TypeScript          |
| ランタイム     | Node.js             |
| AI SDK         | Vercel AI SDK       |
| バリデーション | Zod                 |
| エラーハンドリング | neverthrow      |
| YAML           | yaml                |
| Front matter   | gray-matter         |
| テスト         | Vitest              |
| Linter         | ESLint              |
| Formatter      | Prettier            |
| Git Hooks      | Husky + lint-staged |

## ディレクトリ構成

```
src/
  schemas/         # Zodスキーマ定義
  prompts/         # AIプロンプト（Markdown）
  lib/             # ユーティリティ
  workflows/       # 登録・バトル・死亡処理
tests/             # テストファイル
docs/              # 仕様書・設計書
beasts/            # 生存中の魔獣（YAML）
graveyard/         # 死亡した魔獣の墓碑（Markdown）
binders/           # 獣使いデータ（YAML）
battle_logs/       # 戦闘記録（Markdown）
```

## ワークフロー概要

### 魔獣登録
1. ユーザーがIssue作成（フォーム入力）
2. GitHub Actionsがトリガー
3. フォーム内容からYAML生成
4. 空欄のフィールドをAIが自動生成（origin, lore, traits, skills）
5. PRを自動作成
6. CIでバリデーション（スキーマ、インジェクション検出）
7. 自動マージ → beasts/ に追加
8. 初陣バトル実行

### 定期興行
- 毎日21:00 JSTにcron起動
- beasts/ から対戦カードを生成（同階級ランダム）
- GitHub Models（GPT-4o）でバトル描写生成
- 勝敗・生死を決定
- battle_logs/ に戦闘記録をコミット
- 死亡した魔獣を graveyard/ へ移動
- RANKING.md を更新

## 機能スコープ（骨/肉/皮）