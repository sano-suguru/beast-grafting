/**
 * アプリケーション共通のエラー型定義
 */

/**
 * エラーの種類を識別するためのタグ
 */
export type ErrorKind =
	| "VALIDATION_ERROR"
	| "INJECTION_DETECTED"
	| "BINDER_HAS_BEAST"
	| "AI_GENERATION_ERROR"
	| "FILE_NOT_FOUND"
	| "PARSE_ERROR"
	| "UNKNOWN_ERROR";

/**
 * アプリケーション共通エラー
 */
export interface AppError {
	kind: ErrorKind;
	message: string;
	details?: string[] | undefined;
}

/**
 * エラー作成ヘルパー
 */
export function createError(
	kind: ErrorKind,
	message: string,
	details?: string[],
): AppError {
	if (details === undefined) {
		return { kind, message };
	}
	return { kind, message, details };
}

/**
 * バリデーションエラー
 */
export function validationError(errors: string[]): AppError {
	return createError("VALIDATION_ERROR", "入力データが無効です", errors);
}

/**
 * インジェクション検出エラー
 */
export function injectionError(field: string): AppError {
	return createError(
		"INJECTION_DETECTED",
		`${field}: 禁止されたパターンが含まれています`,
	);
}

/**
 * 獣使い既存魔獣エラー
 */
export function binderHasBeastError(binder: string, beast: string): AppError {
	return createError(
		"BINDER_HAS_BEAST",
		`獣使い ${binder} は既に魔獣 ${beast} を所持しています`,
	);
}

/**
 * AI生成エラー
 */
export function aiGenerationError(detail: string): AppError {
	return createError("AI_GENERATION_ERROR", "AI生成に失敗しました", [detail]);
}

/**
 * パースエラー
 */
export function parseError(detail: string): AppError {
	return createError("PARSE_ERROR", "パースに失敗しました", [detail]);
}
