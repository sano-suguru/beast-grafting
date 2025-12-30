import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateText } from "ai";
import { err, ok, type Result } from "neverthrow";
import { parse as parseYaml } from "yaml";
import {
	type AppError,
	aiGenerationError,
	binderHasBeastError,
	createAIClient,
	DEFAULT_MODEL,
	loadBinder,
	saveBinder,
	validateBeastInput,
	writeYaml,
} from "../lib/index.js";
import {
	type Beast,
	type BeastInput,
	BeastSchema,
	BinderSchema,
} from "../schemas/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * プロンプトテンプレートを読み込む
 */
async function loadPrompt(name: string): Promise<string> {
	const promptPath = join(__dirname, "..", "prompts", `${name}.md`);
	return readFile(promptPath, "utf-8");
}

/**
 * テンプレート変数を置換
 */
function fillTemplate(template: string, vars: Record<string, unknown>): string {
	let result = template;
	for (const [key, value] of Object.entries(vars)) {
		const placeholder = `{{${key}}}`;
		const stringValue =
			typeof value === "object"
				? JSON.stringify(value, null, 2)
				: String(value ?? "");
		result = result.replaceAll(placeholder, stringValue);
	}
	return result;
}

/**
 * 魔獣登録処理
 * 1. 入力バリデーション
 * 2. 空欄フィールドをAIで自動生成
 * 3. 魔獣YAMLを作成
 * 4. 獣使いデータを更新
 */
export async function registerBeast(
	input: BeastInput,
	beastsDir: string,
	bindersDir: string,
): Promise<Result<Beast, AppError>> {
	// バリデーション
	const validationResult = validateBeastInput(input);
	if (validationResult.isErr()) {
		return err(validationResult.error);
	}
	const validatedInput = validationResult.value;

	// 獣使いの既存魔獣チェック
	const binder = await loadBinder(bindersDir, validatedInput.binder);
	if (binder?.active_beast) {
		return err(binderHasBeastError(validatedInput.binder, binder.active_beast));
	}

	// 空欄フィールドがあればAIで補完
	let completedInput = validatedInput;
	if (
		!validatedInput.origin ||
		!validatedInput.lore ||
		!validatedInput.traits?.length ||
		!validatedInput.skills?.length
	) {
		const generatedResult = await generateBeastFields(validatedInput);
		if (generatedResult.isErr()) {
			return err(generatedResult.error);
		}
		completedInput = generatedResult.value;
	}

	// 魔獣データを構築
	const beast = BeastSchema.parse({
		...completedInput,
		status: "alive",
		arena: "local",
		wins: 0,
		losses: 0,
	});

	// 魔獣YAMLを保存
	const beastFilename = `${slugify(beast.name)}.yml`;
	await writeYaml(join(beastsDir, beastFilename), beast);

	// 獣使いデータを更新
	const updatedBinder =
		binder ?? BinderSchema.parse({ username: validatedInput.binder });
	updatedBinder.active_beast = beast.name;
	await saveBinder(bindersDir, updatedBinder);

	return ok(beast);
}

/**
 * AIで魔獣の空欄フィールドを生成
 */
async function generateBeastFields(
	input: BeastInput,
): Promise<Result<BeastInput, AppError>> {
	const aiResult = createAIClient();
	if (aiResult.isErr()) {
		return err(aiResult.error);
	}
	const ai = aiResult.value;
	const promptTemplate = await loadPrompt("generate-beast");

	const prompt = fillTemplate(promptTemplate, {
		name: input.name,
		species: input.species,
		origin: input.origin ?? "",
		lore: input.lore ?? "",
		traits: input.traits ?? [],
		skills: input.skills ?? [],
	});

	const { text } = await generateText({
		model: ai(DEFAULT_MODEL),
		prompt,
	});

	// YAMLブロックを抽出してパース
	const yamlMatch = text.match(/```yaml\n([\s\S]*?)\n```/);
	if (!yamlMatch?.[1]) {
		return err(aiGenerationError("AIの出力からYAMLを抽出できませんでした"));
	}

	const generated = parseYaml(yamlMatch[1]) as BeastInput;

	return ok({
		...input,
		origin: input.origin || generated.origin,
		lore: input.lore || generated.lore,
		traits: input.traits?.length ? input.traits : generated.traits,
		skills: input.skills?.length ? input.skills : generated.skills,
	});
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
