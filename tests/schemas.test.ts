import { describe, expect, it } from "vitest";
import {
	BattleLogSchema,
	BeastInputSchema,
	BeastSchema,
	BinderSchema,
	GravestoneSchema,
} from "../src/schemas/index.js";

describe("BeastSchema", () => {
	it("必須フィールドのみで有効", () => {
		const input = {
			name: "グリム",
			species: "鬣犬",
			binder: "testuser",
		};
		const result = BeastSchema.safeParse(input);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe("alive");
			expect(result.data.arena).toBe("local");
			expect(result.data.wins).toBe(0);
			expect(result.data.losses).toBe(0);
		}
	});

	it("全フィールドで有効", () => {
		const input = {
			name: "喰尾のグリム",
			species: "屍食い鬣犬",
			binder: "testuser",
			origin: "東部戦線跡地にて捕獲",
			lore: "大飢饉の年に生まれた。",
			traits: ["腐肉を喰らう", "顎が強い"],
			skills: [{ name: "死臭の息", description: "腐敗の瘴気を吐く" }],
			status: "alive",
			arena: "local",
			wins: 3,
			losses: 1,
		};
		const result = BeastSchema.safeParse(input);
		expect(result.success).toBe(true);
	});

	it("traitsが5つを超えると無効", () => {
		const input = {
			name: "テスト",
			species: "テスト",
			binder: "user",
			traits: ["1", "2", "3", "4", "5", "6"],
		};
		const result = BeastSchema.safeParse(input);
		expect(result.success).toBe(false);
	});

	it("skillsが3つを超えると無効", () => {
		const input = {
			name: "テスト",
			species: "テスト",
			binder: "user",
			skills: [
				{ name: "1", description: "d" },
				{ name: "2", description: "d" },
				{ name: "3", description: "d" },
				{ name: "4", description: "d" },
			],
		};
		const result = BeastSchema.safeParse(input);
		expect(result.success).toBe(false);
	});
});

describe("BeastInputSchema", () => {
	it("最小入力で有効", () => {
		const input = {
			name: "グリム",
			species: "鬣犬",
			binder: "testuser",
		};
		const result = BeastInputSchema.safeParse(input);
		expect(result.success).toBe(true);
	});
});

describe("BinderSchema", () => {
	it("新規獣使いのデフォルト値", () => {
		const input = { username: "newuser" };
		const result = BinderSchema.safeParse(input);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.fame).toBe(0);
			expect(result.data.materials).toEqual([]);
			expect(result.data.active_beast).toBe(null);
		}
	});
});

describe("BattleLogSchema", () => {
	it("有効な戦闘記録", () => {
		const input = {
			date: "2024-12-30T21:00:00+09:00",
			arena: "local",
			combatants: [
				{ name: "グリム", binder: "user1" },
				{ name: "イル", binder: "user2" },
			],
			victor: "イル",
			death: false,
		};
		const result = BattleLogSchema.safeParse(input);
		expect(result.success).toBe(true);
	});
});

describe("GravestoneSchema", () => {
	it("有効な墓碑", () => {
		const input = {
			name: "グリム",
			species: "鬣犬",
			binder: "user1",
			wins: 5,
			losses: 2,
			arena: "central",
			materials_left: [{ part: "心臓", description: "まだ脈打つ心臓" }],
		};
		const result = GravestoneSchema.safeParse(input);
		expect(result.success).toBe(true);
	});
});
