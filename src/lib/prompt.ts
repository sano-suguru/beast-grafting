import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = join(__dirname, "..", "prompts");

/**
 * プロンプトテンプレートを読み込む
 * world.md を先頭に自動挿入する
 */
export async function loadPrompt(name: string): Promise<string> {
	const [world, prompt] = await Promise.all([
		readFile(join(PROMPTS_DIR, "world.md"), "utf-8"),
		readFile(join(PROMPTS_DIR, `${name}.md`), "utf-8"),
	]);
	return `${world}\n\n---\n\n${prompt}`;
}

/**
 * テンプレート変数を置換
 * ネストしたオブジェクト（例: beast_a.name）にも対応
 */
export function fillTemplate(
	template: string,
	vars: Record<string, unknown>,
): string {
	let result = template;

	function replacePlaceholders(
		obj: Record<string, unknown>,
		prefix = "",
	): void {
		for (const [key, value] of Object.entries(obj)) {
			const fullKey = prefix ? `${prefix}.${key}` : key;
			if (
				typeof value === "object" &&
				value !== null &&
				!Array.isArray(value)
			) {
				replacePlaceholders(value as Record<string, unknown>, fullKey);
			} else {
				const placeholder = `{{${fullKey}}}`;
				const stringValue = Array.isArray(value)
					? JSON.stringify(value, null, 2)
					: String(value ?? "");
				result = result.replaceAll(placeholder, stringValue);
			}
		}
	}

	replacePlaceholders(vars);
	return result;
}
