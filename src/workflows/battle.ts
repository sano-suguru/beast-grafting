import { join } from "node:path";
import { generateText } from "ai";
import { err, ok, type Result } from "neverthrow";
import {
	type AppError,
	aiGenerationError,
	createAIClient,
	DEFAULT_MODEL,
	fillTemplate,
	formatBattleLog,
	generateBattleLogFilename,
	getArenaByWins,
	loadAllBeasts,
	loadPrompt,
	writeMarkdownWithFrontMatter,
	writeYaml,
} from "../lib/index.js";
import type { BattleLog, Beast } from "../schemas/index.js";
import { processDeath } from "./death.js";

/**
 * バトル結果
 */
export interface BattleResult {
	log: BattleLog;
	narrative: string;
	winner: Beast;
	loser: Beast;
	death: boolean;
	deceased: string | null;
}

/**
 * 同階級の魔獣からランダムにマッチングを生成
 */
export function generateMatchups(beasts: Beast[]): [Beast, Beast][] {
	const matchups: [Beast, Beast][] = [];

	// 階級別にグループ化
	const byArena = new Map<string, Beast[]>();
	for (const beast of beasts) {
		const arena = beast.arena;
		if (!byArena.has(arena)) {
			byArena.set(arena, []);
		}
		byArena.get(arena)?.push(beast);
	}

	// 各階級でペアを生成
	for (const [, arenaBeasts] of byArena) {
		// シャッフル
		const shuffled = [...arenaBeasts].sort(() => Math.random() - 0.5);

		// 2体ずつペアに
		for (let i = 0; i + 1 < shuffled.length; i += 2) {
			const first = shuffled[i];
			const second = shuffled[i + 1];
			if (first && second) {
				matchups.push([first, second]);
			}
		}
	}

	return matchups;
}

/**
 * 単一のバトルを実行
 */
export async function executeBattle(
	beastA: Beast,
	beastB: Beast,
	beastsDir: string,
	bindersDir: string,
	battleLogsDir: string,
	graveyardDir: string,
): Promise<Result<BattleResult, AppError>> {
	const aiResult = createAIClient();
	if (aiResult.isErr()) {
		return err(aiResult.error);
	}
	const ai = aiResult.value;
	const promptTemplate = await loadPrompt("battle");

	const prompt = fillTemplate(promptTemplate, {
		beast_a: beastA,
		beast_b: beastB,
	});

	const { text } = await generateText({
		model: ai(DEFAULT_MODEL),
		prompt,
	});

	// JSONを抽出してパース
	const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
	if (!jsonMatch?.[1]) {
		return err(aiGenerationError("AIの出力からJSONを抽出できませんでした"));
	}

	const result = JSON.parse(jsonMatch[1]) as {
		narrative: string;
		victor: string;
		death: boolean;
		deceased: string | null;
		death_reason: string | null;
	};

	// 勝者・敗者を特定
	const winner = result.victor === beastA.name ? beastA : beastB;
	const loser = result.victor === beastA.name ? beastB : beastA;

	// 戦績更新
	winner.wins += 1;
	loser.losses += 1;

	// 階級昇格チェック
	const newArena = getArenaByWins(winner.wins);
	if (newArena !== winner.arena) {
		winner.arena = newArena;
	}

	// 戦闘記録を保存
	const now = new Date();
	const log: BattleLog = {
		date: now.toISOString(),
		arena: beastA.arena,
		combatants: [
			{ name: beastA.name, binder: beastA.binder },
			{ name: beastB.name, binder: beastB.binder },
		],
		victor: winner.name,
		death: result.death,
		deceased: result.deceased ?? undefined,
	};

	const logFilename = generateBattleLogFilename(now, beastA.name, beastB.name);
	const logContent = formatBattleLog(
		log,
		result.narrative.replace(/\\n/g, "\n"),
	);
	await writeMarkdownWithFrontMatter(
		join(battleLogsDir, logFilename),
		log,
		logContent,
	);

	// 死亡処理
	if (result.death && result.deceased) {
		const deadBeast = result.deceased === beastA.name ? beastA : beastB;
		await processDeath(
			deadBeast,
			result.death_reason ?? "不明",
			beastsDir,
			bindersDir,
			graveyardDir,
		);
	} else {
		// 生存した場合、更新された魔獣データを保存
		await writeYaml(join(beastsDir, `${slugify(winner.name)}.yml`), winner);
		await writeYaml(join(beastsDir, `${slugify(loser.name)}.yml`), loser);
	}

	return ok({
		log,
		narrative: result.narrative,
		winner,
		loser,
		death: result.death,
		deceased: result.deceased,
	});
}

/**
 * 初陣バトル：新規魔獣の最初の戦い
 */
export async function runFirstBattle(
	newBeastFile: string,
	beastsDir: string,
	bindersDir: string,
	battleLogsDir: string,
	graveyardDir: string,
): Promise<Result<BattleResult | null, AppError>> {
	const { readFile } = await import("node:fs/promises");
	const { parse: parseYaml } = await import("yaml");
	const { BeastSchema } = await import("../schemas/index.js");

	// 新規魔獣を読み込み
	const content = await readFile(newBeastFile, "utf-8");
	const newBeast = BeastSchema.parse(parseYaml(content));

	// 他の魔獣を取得（同階級優先）
	const allBeasts = await loadAllBeasts(beastsDir);
	const opponents = allBeasts.filter(
		(b) => b.name !== newBeast.name && b.status === "alive",
	);

	if (opponents.length === 0) {
		return ok(null); // 対戦相手なし
	}

	// 同階級の相手を優先、いなければランダム
	const sameArena = opponents.filter((b) => b.arena === newBeast.arena);
	const pool = sameArena.length > 0 ? sameArena : opponents;
	const opponent = pool[Math.floor(Math.random() * pool.length)];

	if (!opponent) {
		return ok(null);
	}

	return executeBattle(
		newBeast,
		opponent,
		beastsDir,
		bindersDir,
		battleLogsDir,
		graveyardDir,
	);
}

/**
 * 定期興行：全マッチングを実行
 */
export async function runDailyBattles(
	beastsDir: string,
	bindersDir: string,
	battleLogsDir: string,
	graveyardDir: string,
): Promise<Result<BattleResult[], AppError>> {
	const beasts = await loadAllBeasts(beastsDir);
	const matchups = generateMatchups(beasts);

	const results: BattleResult[] = [];
	for (const [beastA, beastB] of matchups) {
		const result = await executeBattle(
			beastA,
			beastB,
			beastsDir,
			bindersDir,
			battleLogsDir,
			graveyardDir,
		);
		if (result.isErr()) {
			return err(result.error);
		}
		results.push(result.value);
	}

	return ok(results);
}

/**
 * 文字列をファイル名用にスラッグ化
 */
function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, "-")
		.replace(/^-+|-+$/g, "");
}
