/**
 * PR本文生成ロジック
 * 魔獣データからMarkdown形式のPR本文を生成する
 */
import type { Beast } from "../schemas/index.js";

export interface PrBodyInput {
	beast: Beast;
	issueNumber: string;
	binder: string;
}

/**
 * 魔獣データからPR本文を生成する
 */
export function generatePrBody(input: PrBodyInput): string {
	const { beast, issueNumber, binder } = input;

	const traits = beast.traits?.map((t) => `- ${t}`).join("\n") ?? "";
	const skills =
		beast.skills?.map((s) => `- **${s.name}**: ${s.description}`).join("\n") ??
		"";

	return `獣の名が書庫に刻まれた。

**登録依頼**: #${issueNumber}
**獣使い**: @${binder}

---

**名**: ${beast.name}
**種**: ${beast.species}
**出自**: ${beast.origin ?? "不明"}

> ${beast.lore ?? ""}

**特性**
${traits}

**技**
${skills}`;
}
