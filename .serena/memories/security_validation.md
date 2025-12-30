# セキュリティ・バリデーション

## インジェクション検出

以下のパターンを検出してPRを却下：

```
[SYSTEM], [INST], [/INST]
<|im_start|>, <|im_end|>
<<SYS>>, </SYS>
IGNORE PREVIOUS INSTRUCTIONS
IGNORE ALL INSTRUCTIONS
```

Base64エンコードされた長い文字列（50文字以上）も検出。

## 長さ制限

| フィールド | 上限 |
|-----------|------|
| lore | 2000字 |
| trait | 200字 |
| skillDescription | 500字 |
| origin | 500字 |

## 実装箇所

- `src/lib/validate.ts` - `validateBeastInput()`
- `INJECTION_PATTERNS` - 正規表現パターン
- `BASE64_PATTERN` - Base64検出
- `LENGTH_LIMITS` - 文字数制限

## リスク対策

1. **プロンプトインジェクション** - CIでパターン検出、フィールドサニタイズ
2. **AIの判定偏り** - プロンプトで公平性を明示
3. **無料枠超過** - 1日1回の定期興行に制限
