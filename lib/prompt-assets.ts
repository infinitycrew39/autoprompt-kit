export type PromptAssetKey = "starter-pack" | "starter-qa" | "master-index" | "workflow-blueprints";

type PromptAsset = {
  key: PromptAssetKey;
  title: string;
  publicPath: string;
};

const PROMPT_ASSETS: PromptAsset[] = [
  {
    key: "starter-pack",
    title: "Starter Prompt Pack",
    publicPath: "/downloads/starter-pack.md",
  },
  {
    key: "starter-qa",
    title: "Prompt QA Checklist",
    publicPath: "/downloads/starter-qa.md",
  },
  {
    key: "master-index",
    title: "Master Index",
    publicPath: "/downloads/master-index.md",
  },
  {
    key: "workflow-blueprints",
    title: "Workflow Blueprints",
    publicPath: "/downloads/workflow-blueprints.md",
  },
];

export function listPromptAssets() {
  return PROMPT_ASSETS;
}

export function getPromptAssetByKey(key: string) {
  return PROMPT_ASSETS.find((item) => item.key === key) ?? null;
}
