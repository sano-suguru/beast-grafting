import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Beast, Binder, Gravestone } from "../schemas/index.js";
import { readMarkdownWithFrontMatter } from "./markdown.js";
import { loadAllBeasts } from "./yaml.js";

/**
 * 階級の定義
 */
export type Arena = "local" | "central" | "grand";

/**
 * 勝利数から階級を判定
 */
export function getArenaByWins(wins: number): Arena {
	if (wins >= 6) return "grand";
	if (wins >= 3) return "central";
	return "local";
}

/**
 * 階級の日本語名
 */
export function getArenaDisplayName(arena: Arena): string {
	switch (arena) {
		case "grand":
			return "大闘技場";
		case "central":
			return "中央闘技場";
		case "local":
			return "地方闘技場";
	}
}

/**
 * 魔獣ランキングを生成（階級別、勝利数順）
 */
export function rankBeasts(beasts: Beast[]): Map<Arena, Beast[]> {
	const ranking = new Map<Arena, Beast[]>([
		["grand", []],
		["central", []],
		["local", []],
	]);

	for (const beast of beasts) {
		const arena = beast.arena;
		ranking.get(arena)?.push(beast);
	}

	// 各階級を勝利数で降順ソート
	for (const [_arena, list] of ranking) {
		list.sort((a, b) => b.wins - a.wins);
	}

	return ranking;
}

/**
 * 獣使いランキングを生成（名声順）
 */
export function rankBinders(binders: Binder[]): Binder[] {
	return [...binders].sort((a, b) => b.fame - a.fame);
}

/**
 * RANKING.md を生成
 */
export async function generateRankingMarkdown(
	beastsDir: string,
	bindersDir: string,
	graveyardDir: string,
): Promise<string> {
	// 生存魔獣を読み込み
	const beasts = await loadAllBeasts(beastsDir);
	const beastRanking = rankBeasts(beasts);

	// 獣使いを読み込み
	const binderFiles = await readdir(bindersDir);
	const binders: Binder[] = [];
	for (const file of binderFiles) {
		if (file.endsWith(".yml")) {
			const { default: yaml } = await import("yaml");
			const content = await readFile(join(bindersDir, file), "utf-8");
			binders.push(yaml.parse(content));
		}
	}
	const binderRanking = rankBinders(binders);

	// 墓碑を読み込み
	const gravestoneFiles = await readdir(graveyardDir);
	const gravestones: Gravestone[] = [];
	for (const file of gravestoneFiles) {
		if (file.endsWith(".md")) {
			const { data } = await readMarkdownWithFrontMatter<Gravestone>(
				join(graveyardDir, file),
			);
			gravestones.push(data);
		}
	}

	// Markdown生成
	let md = "# 闘技場番付\n\n";

	for (const arena of ["grand", "central", "local"] as Arena[]) {
		const list = beastRanking.get(arena) ?? [];
		md += `## ${getArenaDisplayName(arena)}\n\n`;
		if (list.length === 0) {
			md += "_該当なし_\n\n";
		} else {
			md += "| 魔獣 | 獣使い | 戦績 |\n";
			md += "| --- | --- | --- |\n";
			for (const beast of list) {
				md += `| ${beast.name} | ${beast.binder} | ${beast.wins}勝${beast.losses}敗 |\n`;
			}
			md += "\n";
		}
	}

	md += "---\n\n## 獣使い名声録\n\n";
	if (binderRanking.length === 0) {
		md += "_該当なし_\n\n";
	} else {
		md += "| 獣使い | 名声 |\n";
		md += "| --- | --- |\n";
		for (const binder of binderRanking) {
			md += `| ${binder.username} | ${binder.fame} |\n`;
		}
		md += "\n";
	}

	md += "---\n\n## 墓標\n\n";
	if (gravestones.length === 0) {
		md += "_該当なし_\n\n";
	} else {
		md += "| 魔獣 | 獣使い | 戦績 |\n";
		md += "| --- | --- | --- |\n";
		for (const gs of gravestones) {
			md += `| ${gs.name} | ${gs.binder} | ${gs.wins}勝${gs.losses}敗 |\n`;
		}
		md += "\n";
	}

	return md;
}

/**
 * RANKING.md を更新
 */
export async function updateRanking(
	beastsDir: string,
	bindersDir: string,
	graveyardDir: string,
	outputPath: string,
): Promise<void> {
	const content = await generateRankingMarkdown(
		beastsDir,
		bindersDir,
		graveyardDir,
	);
	await writeFile(outputPath, content, "utf-8");
}
