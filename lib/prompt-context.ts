import { getPromptAssetByKey } from "@/lib/prompt-assets";
import { readPromptAssetContent } from "@/lib/prompt-assets";

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
    const assetContent = await readPromptAssetContent(promptAssetKey);
    if (!assetContent) {
      return trimmedObjective;
    }

    const contextExcerpt = assetContent.content.slice(0, 1600);

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
