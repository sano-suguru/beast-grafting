import { describe, expect, it } from "vitest";
import {
	getArenaByWins,
	getArenaDisplayName,
	rankBeasts,
} from "../src/lib/ranking.js";
import type { Beast } from "../src/schemas/index.js";

describe("getArenaByWins", () => {
	it("0-2勝は地方", () => {
		expect(getArenaByWins(0)).toBe("local");
		expect(getArenaByWins(1)).toBe("local");
		expect(getArenaByWins(2)).toBe("local");
	});

	it("3-5勝は中央", () => {
		expect(getArenaByWins(3)).toBe("central");
		expect(getArenaByWins(4)).toBe("central");
		expect(getArenaByWins(5)).toBe("central");
	});

	it("6勝以上は大闘技場", () => {
		expect(getArenaByWins(6)).toBe("grand");
		expect(getArenaByWins(10)).toBe("grand");
		expect(getArenaByWins(100)).toBe("grand");
	});
});

describe("getArenaDisplayName", () => {
	it("日本語名を返す", () => {
		expect(getArenaDisplayName("local")).toBe("地方闘技場");
		expect(getArenaDisplayName("central")).toBe("中央闘技場");
		expect(getArenaDisplayName("grand")).toBe("大闘技場");
	});
});

describe("rankBeasts", () => {
	it("階級別に分類して勝利数で降順ソート", () => {
		const beasts: Beast[] = [
			{
				name: "A",
				species: "x",
				binder: "u",
				status: "alive",
				arena: "local",
				wins: 1,
				losses: 0,
			},
			{
				name: "B",
				species: "x",
				binder: "u",
				status: "alive",
				arena: "local",
				wins: 2,
				losses: 0,
			},
			{
				name: "C",
				species: "x",
				binder: "u",
				status: "alive",
				arena: "central",
				wins: 4,
				losses: 1,
			},
			{
				name: "D",
				species: "x",
				binder: "u",
				status: "alive",
				arena: "grand",
				wins: 10,
				losses: 2,
			},
		];

		const ranking = rankBeasts(beasts);

		expect(ranking.get("local")?.map((b) => b.name)).toEqual(["B", "A"]);
		expect(ranking.get("central")?.map((b) => b.name)).toEqual(["C"]);
		expect(ranking.get("grand")?.map((b) => b.name)).toEqual(["D"]);
	});

	it("空の階級も存在する", () => {
		const beasts: Beast[] = [];
		const ranking = rankBeasts(beasts);

		expect(ranking.get("local")).toEqual([]);
		expect(ranking.get("central")).toEqual([]);
		expect(ranking.get("grand")).toEqual([]);
	});
});
