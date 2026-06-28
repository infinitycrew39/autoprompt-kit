import type { PlanId } from "@/lib/site-data";

import { canAccessAssetKey, getPromptAssetByKey } from "@/lib/prompt-assets";

export type SecuredDownloadItem = {
  name: string;
  href: string;
  key: string;
};

const DOWNLOAD_LABELS: Record<string, string> = {
  "master-index": "AutoPrompt Kit 2026 - Master Index.md",
  "workflow-blueprints": "Agent Workflow Blueprints.md",
  "starter-pack": "Starter Prompt Pack Bundle.md",
  "starter-qa": "Prompt QA Checklist.md",
  "pro-pack": "Professional Prompt Pack Bundle.md",
  "pro-chains": "Advanced Chaining Templates.md",
  "ultimate-vault": "Ultimate Prompt Pack Vault.md",
  "ultimate-bonus": "Lifetime Bonus Workflows.md",
};

const PLAN_DOWNLOAD_KEYS: Record<PlanId, string[]> = {
  starter: ["starter-pack", "starter-qa"],
  professional: ["pro-pack", "pro-chains"],
  ultimate: ["ultimate-vault", "ultimate-bonus"],
};

const COMMON_DOWNLOAD_KEYS = ["master-index", "workflow-blueprints"];

function buildAccessUrl(origin: string, sessionId: string, key: string) {
  const params = new URLSearchParams({
    session_id: sessionId,
    file: key,
  });
  return `${origin}/api/access/download?${params.toString()}`;
}

export function getSecuredDownloadsForPlan(
  plan: PlanId,
  sessionId: string,
  origin: string,
): SecuredDownloadItem[] {
  const keys = new Set<string>(COMMON_DOWNLOAD_KEYS);

  if (plan === "professional" || plan === "ultimate") {
    PLAN_DOWNLOAD_KEYS.professional.forEach((key) => keys.add(key));
  }

  if (plan === "starter") {
    PLAN_DOWNLOAD_KEYS.starter.forEach((key) => keys.add(key));
  }

  if (plan === "ultimate") {
    PLAN_DOWNLOAD_KEYS.ultimate.forEach((key) => keys.add(key));
    PLAN_DOWNLOAD_KEYS.starter.forEach((key) => keys.add(key));
  }

  return Array.from(keys)
    .filter((key) => canAccessAssetKey(plan, key) && getPromptAssetByKey(key))
    .map((key) => ({
      key,
      name: DOWNLOAD_LABELS[key] ?? key,
      href: buildAccessUrl(origin, sessionId, key),
    }));
}
