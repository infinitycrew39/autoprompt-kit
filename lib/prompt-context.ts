import { readFile } from "node:fs/promises";
import path from "node:path";

import { getPromptAssetByKey } from "@/lib/prompt-assets";

export async function buildObjectiveWithPurchasedAsset(objective: string, promptAssetKey?: string) {
  const trimmedObjective = objective.trim();
  if (!promptAssetKey) {
    return trimmedObjective;
  }

  const asset = getPromptAssetByKey(promptAssetKey);
  if (!asset) {
    return trimmedObjective;
  }

  try {
    const filePath = path.join(process.cwd(), "public", asset.publicPath.replace(/^\//, ""));
    const content = await readFile(filePath, "utf8");
    const contextExcerpt = content.slice(0, 1600);

    return [
      trimmedObjective,
      `Purchased prompt asset: ${asset.title}`,
      "Use this context when planning execution:",
      contextExcerpt,
    ].join("\n\n");
  } catch {
    return trimmedObjective;
  }
}
