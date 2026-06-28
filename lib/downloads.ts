import type { PlanId } from "@/lib/site-data";

export type DownloadItem = {
  name: string;
  href: string;
};

const validPlans: PlanId[] = ["starter", "professional", "ultimate"];

function envOrFallback(value: string | undefined, fallback = "#") {
  return value && value.trim().length > 0 ? value : fallback;
}

const commonDownloads: DownloadItem[] = [
  {
    name: "AutoPrompt Kit 2026 - Master Index.md",
    href: envOrFallback(process.env.DOWNLOAD_URL_MASTER_INDEX, "/downloads/master-index.md"),
  },
  {
    name: "Agent Workflow Blueprints.md",
    href: envOrFallback(
      process.env.DOWNLOAD_URL_WORKFLOW_BLUEPRINTS,
      "/downloads/workflow-blueprints.md",
    ),
  },
];

const planDownloads: Record<PlanId, DownloadItem[]> = {
  starter: [
    {
      name: "Starter Prompt Pack Bundle.md",
      href: envOrFallback(process.env.DOWNLOAD_URL_STARTER_PACK, "/downloads/starter-pack.md"),
    },
    {
      name: "Prompt QA Checklist.md",
      href: envOrFallback(process.env.DOWNLOAD_URL_STARTER_QA, "/downloads/starter-qa.md"),
    },
  ],
  professional: [
    {
      name: "Professional Prompt Pack Bundle.md",
      href: envOrFallback(process.env.DOWNLOAD_URL_PRO_PACK, "/downloads/pro-pack.md"),
    },
    {
      name: "Advanced Chaining Templates.md",
      href: envOrFallback(process.env.DOWNLOAD_URL_PRO_CHAINS, "/downloads/pro-chains.md"),
    },
  ],
  ultimate: [
    {
      name: "Ultimate Prompt Pack Vault.md",
      href: envOrFallback(
        process.env.DOWNLOAD_URL_ULTIMATE_VAULT,
        "/downloads/ultimate-vault.md",
      ),
    },
    {
      name: "Lifetime Bonus Workflows.md",
      href: envOrFallback(
        process.env.DOWNLOAD_URL_ULTIMATE_BONUS,
        "/downloads/ultimate-bonus.md",
      ),
    },
  ],
};

export function toPlanId(value: string | null | undefined): PlanId | undefined {
  if (!value) {
    return undefined;
  }

  return validPlans.includes(value as PlanId) ? (value as PlanId) : undefined;
}

export function getDownloadsForPlan(plan: PlanId | undefined): DownloadItem[] {
  if (!plan) {
    return commonDownloads;
  }

  return [...commonDownloads, ...(planDownloads[plan] ?? [])];
}
