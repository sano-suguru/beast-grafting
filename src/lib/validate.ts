import { err, ok, type Result } from "neverthrow";
import { type BeastInput, BeastInputSchema } from "../schemas/index.js";
import { type AppError, validationError } from "./errors.js";

/**
 * プロンプトインジェクション検出パターン
 */
const INJECTION_PATTERNS = [
	/\[SYSTEM\]/i,
	/\[INST\]/i,
	/\[\/INST\]/i,
	/<\|im_start\|>/i,
	/<\|im_end\|>/i,
	/<<SYS>>/i,
	/<\/SYS>/i,
	/IGNORE PREVIOUS INSTRUCTIONS/i,
	/IGNORE ALL INSTRUCTIONS/i,
];

/**
 * Base64エンコードされた文字列を検出
 */
const BASE64_PATTERN = /^[A-Za-z0-9+/]{50,}={0,2}$/;

/**
 * フィールドの長さ制限
 */
const LENGTH_LIMITS = {
	lore: 2000,
	trait: 200,
	skillDescription: 500,
	origin: 500,
} as const;

/**
 * 文字列にインジェクションパターンが含まれているかチェック
 */
function containsInjectionPattern(text: string): boolean {
	return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * 文字列がBase64エンコードされているかチェック
 */
function isBase64Encoded(text: string): boolean {
	return BASE64_PATTERN.test(text.trim());
}

/**
 * 魔獣入力データのバリデーション（スキーマ + セキュリティ）
 * @returns Result<BeastInput, AppError> - 成功時は検証済みデータ、失敗時はエラー
 */
export function validateBeastInput(
	input: unknown,
): Result<BeastInput, AppError> {
	const errors: string[] = [];

	// Zodスキーマでパース
	const parseResult = BeastInputSchema.safeParse(input);
	if (!parseResult.success) {
		for (const issue of parseResult.error.issues) {
			errors.push(`${issue.path.join(".")}: ${issue.message}`);
		}
		return err(validationError(errors));
	}

	const data = parseResult.data;

	// インジェクション検出
	const fieldsToCheck = [
		{ name: "name", value: data.name },
		{ name: "species", value: data.species },
		{ name: "origin", value: data.origin },
		{ name: "lore", value: data.lore },
	];

	for (const field of fieldsToCheck) {
		if (field.value && containsInjectionPattern(field.value)) {
			errors.push(`${field.name}: 禁止されたパターンが含まれています`);
		}
		if (field.value && isBase64Encoded(field.value)) {
			errors.push(
				`${field.name}: Base64エンコードされた文字列は許可されていません`,
			);
		}
	}

	// traits の個別チェック
	if (data.traits) {
		for (let i = 0; i < data.traits.length; i++) {
			const trait = data.traits[i];
			if (trait && containsInjectionPattern(trait)) {
				errors.push(`traits[${i}]: 禁止されたパターンが含まれています`);
			}
			if (trait && trait.length > LENGTH_LIMITS.trait) {
				errors.push(`traits[${i}]: ${LENGTH_LIMITS.trait}文字を超えています`);
			}
		}
	}

	// skills の個別チェック
	if (data.skills) {
		for (let i = 0; i < data.skills.length; i++) {
			const skill = data.skills[i];
			if (!skill) continue;
			if (containsInjectionPattern(skill.name)) {
				errors.push(`skills[${i}].name: 禁止されたパターンが含まれています`);
			}
			if (containsInjectionPattern(skill.description)) {
				errors.push(
					`skills[${i}].description: 禁止されたパターンが含まれています`,
				);
			}
			if (skill.description.length > LENGTH_LIMITS.skillDescription) {
				errors.push(
					`skills[${i}].description: ${LENGTH_LIMITS.skillDescription}文字を超えています`,
				);
			}
		}
	}

	// 長さ制限チェック
	if (data.lore && data.lore.length > LENGTH_LIMITS.lore) {
		errors.push(`lore: ${LENGTH_LIMITS.lore}文字を超えています`);
	}
	if (data.origin && data.origin.length > LENGTH_LIMITS.origin) {
		errors.push(`origin: ${LENGTH_LIMITS.origin}文字を超えています`);
	}

	if (errors.length > 0) {
		return err(validationError(errors));
	}

	return ok(data);
}
