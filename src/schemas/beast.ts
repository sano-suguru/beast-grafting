import { z } from "zod";

/**
 * スキルスキーマ
 */
export const SkillSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1),
});

/**
 * 素材スキーマ（拡張ポイント：将来の素材システム用）
 */
export const MaterialSchema = z.object({
	from: z.string().min(1),
	part: z.string().min(1),
	description: z.string().min(1),
});

/**
 * 血統スキーマ（拡張ポイント：将来の血統システム用）
 */
export const BloodlineSchema = z.object({
	parent: z.string().min(1),
	inherited_skill: z.string().min(1),
});

/**
 * 魔獣スキーマ
 * - 必須: name, species, binder
 * - 任意（空ならAI生成）: origin, lore, traits, skills
 * - システム管理: status, arena, wins, losses
 * - 拡張: materials, bloodline
 */
export const BeastSchema = z.object({
	// --- 必須（ユーザー入力） ---
	name: z.string().min(1),
	species: z.string().min(1),
	binder: z.string().min(1),

	// --- 任意（空ならAI生成） ---
	origin: z.string().optional(),
	lore: z.string().optional(),
	traits: z.array(z.string()).max(5).optional(),
	skills: z.array(SkillSchema).max(3).optional(),

	// --- システム管理 ---
	status: z.enum(["alive", "dead"]).default("alive"),
	arena: z.enum(["local", "central", "grand"]).default("local"),
	wins: z.number().int().min(0).default(0),
	losses: z.number().int().min(0).default(0),

	// --- 拡張ポイント（MVP外、スキーマのみ定義） ---
	materials: z.array(MaterialSchema).optional(),
	bloodline: BloodlineSchema.optional(),
});

/**
 * 魔獣登録時の入力スキーマ（最小入力）
 */
export const BeastInputSchema = z.object({
	name: z.string().min(1),
	species: z.string().min(1),
	binder: z.string().min(1),
	origin: z.string().optional(),
	lore: z.string().optional(),
	traits: z.array(z.string()).max(5).optional(),
	skills: z.array(SkillSchema).max(3).optional(),
	materials: z.array(MaterialSchema).optional(),
	bloodline: BloodlineSchema.optional(),
});

// 型エクスポート（推論で取得）
export type Skill = z.infer<typeof SkillSchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type Bloodline = z.infer<typeof BloodlineSchema>;
export type Beast = z.infer<typeof BeastSchema>;
export type BeastInput = z.infer<typeof BeastInputSchema>;
