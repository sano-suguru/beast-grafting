// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default defineConfig(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	prettierConfig,
	{
		files: ["src/**/*.ts", "tests/**/*.ts", "scripts/**/*.ts"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
		},
		rules: {
			// neverthrow: try-catch/throwを禁止
			"no-restricted-syntax": [
				"error",
				{
					selector: "TryStatement",
					message:
						"try-catch is not allowed. Use neverthrow's Result type instead. If wrapping external code, use Result.fromThrowable() or ResultAsync.fromPromise().",
				},
				{
					selector: "ThrowStatement",
					message:
						"throw is not allowed. Return err() from neverthrow instead.",
				},
			],
			// 未使用変数は警告（_prefixは許可）
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
		},
	},
	{
		ignores: ["node_modules/**", "dist/**", "*.js", "*.cjs", "*.mjs"],
	},
);
