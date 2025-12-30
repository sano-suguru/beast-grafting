#!/usr/bin/env node
/**
 * バトルCLI
 * GitHub Actionsから呼び出される
 */
import { join } from "node:path";
import { updateRanking } from "../lib/index.js";
import { runDailyBattles, runFirstBattle } from "./battle.js";

const BEASTS_DIR = join(process.cwd(), "beasts");
const BINDERS_DIR = join(process.cwd(), "binders");
const BATTLE_LOGS_DIR = join(process.cwd(), "battle_logs");
const GRAVEYARD_DIR = join(process.cwd(), "graveyard");
const RANKING_FILE = join(process.cwd(), "RANKING.md");

async function main(): Promise<void> {
	const args = process.argv.slice(2);

	if (args.includes("--first-battle")) {
		const beastFile = args[args.indexOf("--first-battle") + 1];
		if (!beastFile) {
			console.error("--first-battle には魔獣ファイルパスが必要です");
			process.exit(1);
		}
		await handleFirstBattle(beastFile);
	} else if (args.includes("--arena")) {
		await handleArenaBattles();
	} else {
		console.error("使用法: battle-cli.ts --first-battle <file> | --arena");
		process.exit(1);
	}

	// ランキング更新
	await updateRankingFile();
}

async function handleFirstBattle(beastFile: string): Promise<void> {
	console.log(`初陣: ${beastFile}`);

	const result = await runFirstBattle(
		beastFile,
		BEASTS_DIR,
		BINDERS_DIR,
		BATTLE_LOGS_DIR,
		GRAVEYARD_DIR,
	);

	if (result.isErr()) {
		console.error(`初陣失敗: ${result.error.message}`);
		if (result.error.details) {
			for (const d of result.error.details) {
				console.error(`  - ${d}`);
			}
		}
		process.exit(1);
	}

	if (!result.value) {
		console.log("対戦相手がいないため、初陣はスキップされました");
		return;
	}

	const { winner, loser, death, deceased } = result.value;
	console.log(`勝者: ${winner.name}`);
	console.log(`敗者: ${loser.name}`);
	if (death && deceased) {
		console.log(`死亡: ${deceased}`);
	}
}

async function handleArenaBattles(): Promise<void> {
	console.log("定期興行開始");

	const result = await runDailyBattles(
		BEASTS_DIR,
		BINDERS_DIR,
		BATTLE_LOGS_DIR,
		GRAVEYARD_DIR,
	);

	if (result.isErr()) {
		console.error(`興行失敗: ${result.error.message}`);
		process.exit(1);
	}

	console.log(`${result.value.length}試合完了`);
	for (const battle of result.value) {
		console.log(
			`  ${battle.winner.name} vs ${battle.loser.name} → ${battle.winner.name}勝利`,
		);
		if (battle.death && battle.deceased) {
			console.log(`    💀 ${battle.deceased} 死亡`);
		}
	}
}

async function updateRankingFile(): Promise<void> {
	await updateRanking(BEASTS_DIR, BINDERS_DIR, GRAVEYARD_DIR, RANKING_FILE);
	console.log("ランキング更新完了");
}

main();
