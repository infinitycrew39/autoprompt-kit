import { readFile } from "node:fs/promises";
import path from "node:path";

import type { PlanId } from "@/lib/site-data";

export type PromptAssetKey =
  | "master-index"
  | "workflow-blueprints"
  | "starter-pack"
  | "starter-qa"
  | "pro-pack"
  | "pro-chains"
  | "ultimate-vault"
  | "ultimate-bonus";

type PromptAsset = {
  key: PromptAssetKey;
  title: string;
  filename: string;
  minPlan: PlanId;
};

const PLAN_RANK: Record<PlanId, number> = {
  starter: 1,
  professional: 2,
  ultimate: 3,
};

const PROMPT_ASSETS: PromptAsset[] = [
  {
    key: "master-index",
    title: "Master Index",
    filename: "master-index.md",
    minPlan: "starter",
  },
  {
    key: "workflow-blueprints",
    title: "Workflow Blueprints",
    filename: "workflow-blueprints.md",
    minPlan: "starter",
  },
  {
    key: "starter-pack",
    title: "Starter Prompt Pack",
    filename: "starter-pack.md",
    minPlan: "starter",
  },
  {
    key: "starter-qa",
    title: "Prompt QA Checklist",
    filename: "starter-qa.md",
    minPlan: "starter",
  },
  {
    key: "pro-pack",
    title: "Professional Prompt Pack",
    filename: "pro-pack.md",
    minPlan: "professional",
  },
  {
    key: "pro-chains",
    title: "Advanced Chaining Templates",
    filename: "pro-chains.md",
    minPlan: "professional",
  },
  {
    key: "ultimate-vault",
    title: "Ultimate Prompt Vault",
    filename: "ultimate-vault.md",
    minPlan: "ultimate",
  },
  {
    key: "ultimate-bonus",
    title: "Lifetime Bonus Workflows",
    filename: "ultimate-bonus.md",
    minPlan: "ultimate",
  },
];

function getDownloadsDir() {
  return path.join(process.cwd(), "content", "downloads");
}

export function canAccessAsset(plan: PlanId, asset: PromptAsset) {
  return PLAN_RANK[plan] >= PLAN_RANK[asset.minPlan];
}

export function listPromptAssetsForPlan(plan: PlanId) {
  return PROMPT_ASSETS.filter((asset) => canAccessAsset(plan, asset)).map((asset) => ({
    key: asset.key,
    title: asset.title,
    filename: asset.filename,
  }));
}

export function getPromptAssetByKey(key: string) {
  return PROMPT_ASSETS.find((item) => item.key === key) ?? null;
}

export function canAccessAssetKey(plan: PlanId, key: string) {
  const asset = getPromptAssetByKey(key);
  return asset ? canAccessAsset(plan, asset) : false;
}

export async function readPromptAssetContent(key: string) {
  const asset = getPromptAssetByKey(key);
  if (!asset) {
    return null;
  }

  const filePath = path.join(getDownloadsDir(), asset.filename);
  const content = await readFile(filePath, "utf8");
  return { asset, content };
}

export function getDownloadFilenameForKey(key: string) {
  return getPromptAssetByKey(key)?.filename ?? null;
}
