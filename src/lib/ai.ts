import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { err, ok, type Result } from "neverthrow";
import type { AppError } from "./errors.js";

/**
 * GitHub Models経由でAIクライアントを作成
 * 将来Azure OpenAIに移行する場合はこのファイルのみ変更
 */
export function createAIClient(): Result<OpenAIProvider, AppError> {
	const apiKey = process.env.GITHUB_TOKEN;
	if (!apiKey) {
		return err({
			kind: "AI_GENERATION_ERROR",
			message: "GITHUB_TOKEN environment variable is required",
		});
	}

	return ok(
		createOpenAI({
			baseURL: "https://models.inference.ai.azure.com",
			apiKey,
			compatibility: "compatible", // GitHub Models は /chat/completions を使用
		}),
	);
}

/**
 * デフォルトのモデル名
 */
export const DEFAULT_MODEL = "gpt-4o";
