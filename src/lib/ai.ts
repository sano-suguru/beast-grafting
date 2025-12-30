import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { err, ok, type Result } from "neverthrow";
import type { AppError } from "./errors.js";

/**
 * GitHub Models経由でAIクライアントを作成
 * 将来Azure OpenAIに移行する場合はこのファイルのみ変更
 */
export function createAIClient(): Result<
	ReturnType<typeof createOpenAICompatible>,
	AppError
> {
	const apiKey = process.env.GITHUB_TOKEN;
	if (!apiKey) {
		return err({
			kind: "AI_GENERATION_ERROR",
			message: "GITHUB_TOKEN environment variable is required",
		});
	}

	return ok(
		createOpenAICompatible({
			name: "github-models",
			baseURL: "https://models.inference.ai.azure.com",
			apiKey,
		}),
	);
}

/**
 * デフォルトのモデル名
 */
export const DEFAULT_MODEL = "gpt-4o";
