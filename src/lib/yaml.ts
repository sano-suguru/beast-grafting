import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ResultAsync } from "neverthrow";
import { parse, stringify } from "yaml";
import type { Beast, Binder } from "../schemas/index.js";

/**
 * YAMLファイルを読み込んでパース
 */
export async function readYaml<T>(filePath: string): Promise<T> {
	const content = await readFile(filePath, "utf-8");
	return parse(content) as T;
}

/**
 * オブジェクトをYAMLファイルに書き込み
 */
export async function writeYaml<T>(filePath: string, data: T): Promise<void> {
	const content = stringify(data);
	await writeFile(filePath, content, "utf-8");
}

/**
 * beasts/ ディレクトリから全ての生存魔獣を読み込む
 */
export async function loadAllBeasts(beastsDir: string): Promise<Beast[]> {
	const files = await readdir(beastsDir);
	const yamlFiles = files.filter(
		(f) => f.endsWith(".yml") || f.endsWith(".yaml"),
	);

	const beasts: Beast[] = [];
	for (const file of yamlFiles) {
		const beast = await readYaml<Beast>(join(beastsDir, file));
		beasts.push(beast);
	}
	return beasts;
}

/**
 * binders/ ディレクトリから獣使いデータを読み込む
 * ファイルが存在しない場合はnullを返す
 */
export async function loadBinder(
	bindersDir: string,
	username: string,
): Promise<Binder | null> {
	const result = await ResultAsync.fromPromise(
		readYaml<Binder>(join(bindersDir, `${username}.yml`)),
		() => null,
	);
	return result.unwrapOr(null);
}

/**
 * 獣使いデータを保存（存在しなければ新規作成）
 */
export async function saveBinder(
	bindersDir: string,
	binder: Binder,
): Promise<void> {
	await writeYaml(join(bindersDir, `${binder.username}.yml`), binder);
}
