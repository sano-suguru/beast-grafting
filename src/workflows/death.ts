import { unlink } from "node:fs/promises";
import { join } from "node:path";
import {
	formatGravestone,
	generateGravestoneFilename,
	loadBinder,
	saveBinder,
	writeMarkdownWithFrontMatter,
} from "../lib/index.js";
import type { Beast, Gravestone } from "../schemas/index.js";

/**
 * 死亡処理
 * 1. 魔獣を beasts/ から削除
 * 2. graveyard/ に墓碑を作成
 * 3. 素材を生成して獣使いに追加
 * 4. 獣使いの active_beast を null に
 * 5. 名声を加算
 */
export async function processDeath(
	beast: Beast,
	deathReason: string,
	beastsDir: string,
	bindersDir: string,
	graveyardDir: string,
): Promise<void> {
	// 墓碑データを構築
	const gravestone: Gravestone = {
		name: beast.name,
		species: beast.species,
		binder: beast.binder,
		wins: beast.wins,
		losses: beast.losses,
		arena: beast.arena,
		materials_left: generateMaterials(beast),
	};

	// 墓碑の物語（簡易版、将来的にはAI生成も可能）
	const epitaph = generateEpitaph(beast, deathReason);

	// 墓碑を保存
	const gravestoneFilename = generateGravestoneFilename(beast.name);
	await writeMarkdownWithFrontMatter(
		join(graveyardDir, gravestoneFilename),
		gravestone,
		formatGravestone(gravestone, epitaph),
	);

	// beasts/ から削除
	const beastFilename = `${slugify(beast.name)}.yml`;
	await unlink(join(beastsDir, beastFilename));

	// 獣使いデータを更新
	const binder = await loadBinder(bindersDir, beast.binder);
	if (binder) {
		// 素材を追加
		const newMaterials =
			gravestone.materials_left?.map((m) => ({
				from: beast.name,
				part: m.part,
				description: m.description,
			})) ?? [];
		binder.materials.push(...newMaterials);

		// active_beast を null に
		binder.active_beast = null;

		// 名声を加算（戦績に応じて）
		binder.fame += calculateFameFromDeath(beast);

		await saveBinder(bindersDir, binder);
	}
}

/**
 * 死亡した魔獣から素材を生成
 * （MVP版：シンプルなルールベース、将来はAI生成も可能）
 */
function generateMaterials(
	beast: Beast,
): { part: string; description: string }[] {
	const materials: { part: string; description: string }[] = [];

	// 基本素材：種族に応じた部位
	materials.push({
		part: "骨",
		description: `${beast.species}の骨。硬く、冷たい`,
	});

	// 勝利数に応じて追加素材
	if (beast.wins >= 3) {
		materials.push({
			part: "心臓",
			description: `戦いの中で鍛えられた心臓。まだ微かに脈打つ`,
		});
	}

	if (beast.wins >= 6) {
		materials.push({
			part: "魂の欠片",
			description: `闘争の記憶が凝縮された、見えざる何か`,
		});
	}

	return materials;
}

/**
 * 墓碑銘を生成
 */
function generateEpitaph(beast: Beast, deathReason: string): string {
	const record = `${beast.wins}勝${beast.losses}敗`;

	return `${beast.arena === "grand" ? "大闘技場" : beast.arena === "central" ? "中央闘技場" : "地方闘技場"}にて、${record}の戦績を残し倒れた。

死因: ${deathReason}

${beast.lore ? `かつてこう語られた——\n\n> ${beast.lore.split("\n")[0]}` : ""}`;
}

/**
 * 死亡時の名声計算
 */
function calculateFameFromDeath(beast: Beast): number {
	let fame = 0;

	// 勝利数に応じた基本名声
	fame += beast.wins * 10;

	// 階級ボーナス
	if (beast.arena === "grand") {
		fame += 50;
	} else if (beast.arena === "central") {
		fame += 20;
	}

	return fame;
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
