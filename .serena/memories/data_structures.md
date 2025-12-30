# データ構造仕様

## 魔獣（beasts/*.yml）

```yaml
# --- 必須（ユーザー入力） ---
name: 喰尾のグリム
species: 屍食い鬣犬
binder: username

# --- 任意（空ならAI生成） ---
origin: 東部戦線跡地にて捕獲
lore: |
  大飢饉の年、東部戦線に打ち捨てられた兵の屍が丘を成した...
traits:
  - 腐肉を喰らい続けた不死の飢え
  - 鈍重だが、顎の力は鉄をも噛み砕く
skills:
  - name: 死臭の息
    description: 腐敗の瘴気を吐く。浴びた者の傷口から壊死が広がる

# --- システム管理 ---
status: alive  # alive | dead
arena: local   # local | central | grand
wins: 0
losses: 0
pr_number: 123  # 登録時のPR番号（optional）

# --- 拡張ポイント（肉スコープ） ---
materials: []   # 素材システム用
bloodline: {}   # 血統システム用
```

## バリデーション制限

- traits: 最大5つ
- skills: 最大3つ
- lore: 2000字以下
- trait: 各200字以下
- origin: 500字以下
- skillDescription: 500字以下

## 獣使い（binders/*.yml）

```yaml
username: example
fame: 120
materials:
  - from: 喰尾のグリム
    part: 心臓
    description: まだ脈打つかのような、黒ずんだ心臓
active_beast: 現在の魔獣名
```

## 戦闘記録（battle_logs/*.md）

front matter付きMarkdown。

```yaml
---
date: 2024-12-30T21:00:00+09:00
arena: local
combatants:
  - name: 喰尾のグリム
    binder: user1
  - name: 静寂のイル
    binder: user2
victor: 静寂のイル
death: false
---
```

## 墓碑（graveyard/*.md）

```yaml
---
name: 喰尾のグリム
species: 屍食い鬣犬
binder: user1
wins: 7
losses: 3
arena: central
materials_left:
  - part: 心臓
    description: まだ脈打つかのような、黒ずんだ心臓
---
```

## 階級

- local（地方）: 0-2勝
- central（中央）: 3-5勝
- grand（大闘技場）: 6勝〜
