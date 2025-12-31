#!/usr/bin/env node
/**
 * PR本文生成CLI
 * 魔獣YAMLを読み込み、Markdown形式のPR本文を生成する
 */
import { readFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import { BeastSchema } from "../schemas/index.js";
import { generatePrBody } from "./pr-body.js";

async function main(): Promise<void> {
	const beastFile = process.env.BEAST_FILE;
	const issueNumber = process.env.ISSUE_NUMBER;
	const binder = process.env.BINDER;

	if (!beastFile) {
		console.error("BEAST_FILE が指定されていません");
		process.exit(1);
	}

	if (!issueNumber || !binder) {
		console.error("ISSUE_NUMBER または BINDER が指定されていません");
		process.exit(1);
	}

	const content = await readFile(beastFile, "utf-8");
	const data = parseYaml(content);
	const beast = BeastSchema.parse(data);

	const body = generatePrBody({ beast, issueNumber, binder });

	// GitHub Actions の GITHUB_OUTPUT に書き込む
	const outputFile = process.env.GITHUB_OUTPUT;
	if (outputFile) {
		const { appendFile } = await import("node:fs/promises");
		// 複数行の値を出力するためにデリミタを使用
		const delimiter = `EOF_${Date.now()}`;
		await appendFile(
			outputFile,
			`pr_body<<${delimiter}\n${body}\n${delimiter}\n`,
		);
	} else {
		// ローカルテスト用
		console.log(body);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
