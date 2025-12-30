import { z } from "zod";

/**
 * 戦闘参加者スキーマ
 */
export const CombatantSchema = z.object({
	name: z.string().min(1),
	binder: z.string().min(1),
});

/**
 * 戦闘記録スキーマ（front matter部分）
 * battle_logs/*.md のメタデータ
 */
export const BattleLogSchema = z.object({
	date: z.string(), // ISO 8601形式
	arena: z.enum(["local", "central", "grand"]),
	combatants: z.tuple([CombatantSchema, CombatantSchema]),
	victor: z.string().min(1),
	death: z.boolean().default(false),
	deceased: z.string().optional(), // 死亡した場合、その魔獣名
});

/**
 * 墓碑スキーマ（front matter部分）
 * graveyard/*.md のメタデータ
 */
export const GravestoneSchema = z.object({
	name: z.string().min(1),
	species: z.string().min(1),
	binder: z.string().min(1),
	wins: z.number().int().min(0),
	losses: z.number().int().min(0),
	arena: z.enum(["local", "central", "grand"]),
	materials_left: z
		.array(
			z.object({
				part: z.string().min(1),
				description: z.string().min(1),
			}),
		)
		.optional(),
});

// 型エクスポート
export type Combatant = z.infer<typeof CombatantSchema>;
export type BattleLog = z.infer<typeof BattleLogSchema>;
export type Gravestone = z.infer<typeof GravestoneSchema>;
