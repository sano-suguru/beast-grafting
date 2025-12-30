import { join } from "node:path";
import { generateText } from "ai";
import { err, ok, type Result } from "neverthrow";
import { parse as parseYaml } from "yaml";
import {
	type AppError,
	aiGenerationError,
	binderHasBeastError,
	createAIClient,
	DEFAULT_MODEL,
	fillTemplate,
	loadBinder,
	loadPrompt,
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

/**
 * GitHub Issue Formの未入力値を空として扱う
 */
function isEmptyResponse(value: string | undefined | null): boolean {
	return !value || value === "_No response_";
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

	// traitsから_No response_を除去
	const cleanedTraits = validatedInput.traits?.filter(
		(t) => !isEmptyResponse(t),
	);

	// 空欄フィールドがあればAIで補完
	let completedInput = validatedInput;
	if (
		isEmptyResponse(validatedInput.origin) ||
		isEmptyResponse(validatedInput.lore) ||
		!cleanedTraits?.length ||
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

	// _No response_を除去したtraits
	const inputTraits = input.traits?.filter((t) => !isEmptyResponse(t));

	return ok({
		...input,
		origin: isEmptyResponse(input.origin) ? generated.origin : input.origin,
		lore: isEmptyResponse(input.lore) ? generated.lore : input.lore,
		traits: inputTraits?.length ? inputTraits : generated.traits,
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
