import { readFile, writeFile } from "node:fs/promises";
import matter from "gray-matter";
import type { BattleLog, Gravestone } from "../schemas/index.js";

/**
 * front matter付きMarkdownを読み込む
 */
export async function readMarkdownWithFrontMatter<T>(
	filePath: string,
): Promise<{ data: T; content: string }> {
	const fileContent = await readFile(filePath, "utf-8");
	const { data, content } = matter(fileContent);
	return { data: data as T, content };
}

/**
 * front matter付きMarkdownを書き込む
 */
export async function writeMarkdownWithFrontMatter<
	T extends Record<string, unknown>,
>(filePath: string, data: T, content: string): Promise<void> {
	const output = matter.stringify(content, data);
	await writeFile(filePath, output, "utf-8");
}

/**
 * 戦闘記録ファイル名を生成
 * 形式: YYYY-MM-DD-{beast1}-vs-{beast2}.md
 */
export function generateBattleLogFilename(
	date: Date,
	beast1Name: string,
	beast2Name: string,
): string {
	const dateStr = date.toISOString().split("T")[0];
	const slug1 = slugify(beast1Name);
	const slug2 = slugify(beast2Name);
	return `${dateStr}-${slug1}-vs-${slug2}.md`;
}

/**
 * 墓碑ファイル名を生成
 */
export function generateGravestoneFilename(beastName: string): string {
	return `${slugify(beastName)}.md`;
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

/**
 * 戦闘記録のMarkdownを生成
 */
export function formatBattleLog(log: BattleLog, narrative: string): string {
	return `# ${log.combatants[0].name} vs ${log.combatants[1].name}

${narrative}`;
}

/**
 * 墓碑のMarkdownを生成
 */
export function formatGravestone(
	gravestone: Gravestone,
	epitaph: string,
): string {
	return `# ${gravestone.name}

${epitaph}`;
}
