import { z } from "zod";
import { MaterialSchema } from "./beast.js";

/**
 * 獣使いスキーマ
 * - username: GitHubユーザー名
 * - fame: 名声ポイント
 * - materials: 死亡した魔獣から得た素材
 * - active_beast: 現在所持している魔獣（1体のみ）
 */
export const BinderSchema = z.object({
	username: z.string().min(1),
	fame: z.number().int().min(0).default(0),
	materials: z.array(MaterialSchema).default([]),
	active_beast: z.string().nullable().default(null),
});

// 型エクスポート
export type Binder = z.infer<typeof BinderSchema>;
