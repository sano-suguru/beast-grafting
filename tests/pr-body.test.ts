import { describe, expect, it } from "vitest";
import type { Beast } from "../src/schemas/index.js";
import { generatePrBody } from "../src/workflows/pr-body.js";

describe("generatePrBody", () => {
	const baseBeast: Beast = {
		name: "試験獣",
		species: "試験種",
		binder: "test-user",
		status: "alive",
		arena: "local",
		wins: 0,
		losses: 0,
	};

	it("基本的なPR本文を生成する", () => {
		const result = generatePrBody({
			beast: baseBeast,
			issueNumber: "42",
			binder: "test-user",
		});

		expect(result).toContain("獣の名が書庫に刻まれた。");
		expect(result).toContain("**登録依頼**: #42");
		expect(result).toContain("**獣使い**: @test-user");
		expect(result).toContain("**名**: 試験獣");
		expect(result).toContain("**種**: 試験種");
	});

	it("originが未設定の場合「不明」と表示する", () => {
		const result = generatePrBody({
			beast: baseBeast,
			issueNumber: "1",
			binder: "user",
		});

		expect(result).toContain("**出自**: 不明");
	});

	it("originが設定されている場合はその値を表示する", () => {
		const beast: Beast = {
			...baseBeast,
			origin: "北の荒野",
		};

		const result = generatePrBody({
			beast,
			issueNumber: "1",
			binder: "user",
		});

		expect(result).toContain("**出自**: 北の荒野");
	});

	it("loreを引用ブロックで表示する", () => {
		const beast: Beast = {
			...baseBeast,
			lore: "古の伝承によれば、この獣は山の神の使いであった。",
		};

		const result = generatePrBody({
			beast,
			issueNumber: "1",
			binder: "user",
		});

		expect(result).toContain(
			"> 古の伝承によれば、この獣は山の神の使いであった。",
		);
	});

	it("traitsをリスト形式で表示する", () => {
		const beast: Beast = {
			...baseBeast,
			traits: ["鋼の牙", "夜目が利く", "素早い"],
		};

		const result = generatePrBody({
			beast,
			issueNumber: "1",
			binder: "user",
		});

		expect(result).toContain("- 鋼の牙");
		expect(result).toContain("- 夜目が利く");
		expect(result).toContain("- 素早い");
	});

	it("skillsを名前と説明で表示する", () => {
		const beast: Beast = {
			...baseBeast,
			skills: [
				{ name: "咆哮", description: "敵を怯ませる" },
				{ name: "突進", description: "全力で突っ込む" },
			],
		};

		const result = generatePrBody({
			beast,
			issueNumber: "1",
			binder: "user",
		});

		expect(result).toContain("- **咆哮**: 敵を怯ませる");
		expect(result).toContain("- **突進**: 全力で突っ込む");
	});

	it("全てのフィールドが設定された完全な魔獣のPR本文を生成する", () => {
		const beast: Beast = {
			name: "灰燼の咆哮者",
			species: "獄炎狼",
			binder: "sano-suguru",
			origin: "アルドゥム荒野",
			lore: "かつて森を守護していた魔狼。",
			traits: ["灰にまみれた体毛", "高い危機察知能力"],
			skills: [
				{ name: "灰塵の息吹", description: "熱風を吐き出す" },
				{ name: "咆哮の境界", description: "大地を震わせる" },
			],
			status: "alive",
			arena: "local",
			wins: 0,
			losses: 0,
		};

		const result = generatePrBody({
			beast,
			issueNumber: "33",
			binder: "sano-suguru",
		});

		expect(result).toContain("**名**: 灰燼の咆哮者");
		expect(result).toContain("**種**: 獄炎狼");
		expect(result).toContain("**出自**: アルドゥム荒野");
		expect(result).toContain("> かつて森を守護していた魔狼。");
		expect(result).toContain("- 灰にまみれた体毛");
		expect(result).toContain("- **灰塵の息吹**: 熱風を吐き出す");
	});
});
