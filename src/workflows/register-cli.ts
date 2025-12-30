#!/usr/bin/env node
/**
 * 魔獣登録CLI
 * GitHub Actionsから呼び出される
 */
import { join } from "node:path";
import type { BeastInput } from "../schemas/index.js";
import { registerBeast } from "./register.js";

const BEASTS_DIR = join(process.cwd(), "beasts");
const BINDERS_DIR = join(process.cwd(), "binders");

async function main(): Promise<void> {
	const input: BeastInput = {
		name: process.env.BEAST_NAME ?? "",
		species: process.env.BEAST_SPECIES ?? "",
		binder: process.env.BINDER ?? "",
		origin: process.env.BEAST_ORIGIN || undefined,
		lore: process.env.BEAST_LORE || undefined,
		traits: parseList(process.env.BEAST_TRAITS),
		skills: parseSkills(process.env.BEAST_SKILLS),
	};

	if (!input.name || !input.species || !input.binder) {
		console.error("必須フィールドが不足しています: name, species, binder");
		process.exit(1);
	}

	console.log(`魔獣「${input.name}」を登録中...`);

	const result = await registerBeast(input, BEASTS_DIR, BINDERS_DIR);

	if (result.isErr()) {
		console.error(`登録失敗: ${result.error.message}`);
		process.exit(1);
	}

	console.log(`魔獣「${result.value.name}」を登録しました`);
	console.log(`種族: ${result.value.species}`);
	console.log(`獣使い: ${result.value.binder}`);
}

function parseList(value: string | undefined): string[] | undefined {
	if (!value?.trim()) return undefined;
	return value
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

function parseSkills(
	value: string | undefined,
): Array<{ name: string; description: string }> | undefined {
	if (!value?.trim()) return undefined;
	return value
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const [name, ...rest] = line.split(":");
			return {
				name: name?.trim() ?? "",
				description: rest.join(":").trim(),
			};
		})
		.filter((skill) => skill.name && skill.description);
}

main();
