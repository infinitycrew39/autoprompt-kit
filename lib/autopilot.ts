import { runAutonomousBusinessOps } from "@/lib/agent-runtime";
import { buildObjectiveWithPurchasedAsset } from "@/lib/prompt-context";

type AutopilotInput = {
  origin: string;
  budgetCents: number;
  promptAssetKey?: string;
  limit?: number;
};

function parseObjectivesFromEnv() {
  const raw = process.env.AUTOPILOT_OBJECTIVES_JSON?.trim();
  if (!raw) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  } catch {
    return [];
  }
}

function defaultObjectives() {
  return [
    "Run a 7-day autonomous growth sprint to generate qualified leads and 3 paid checkouts.",
    "Launch one revenue offer and provision one SaaS workspace with strict budget controls.",
    "Execute a weekly operations cycle and produce an auditable action log for enterprise review.",
  ];
}

export async function runAutopilotBatch(input: AutopilotInput) {
  const envObjectives = parseObjectivesFromEnv();
  const objectives = envObjectives.length > 0 ? envObjectives : defaultObjectives();
  const limitedObjectives = objectives.slice(0, Math.max(1, input.limit ?? 2));

  const runs = [];
  for (const objective of limitedObjectives) {
    const objectiveWithContext = await buildObjectiveWithPurchasedAsset(
      objective,
      input.promptAssetKey,
    );

    const run = await runAutonomousBusinessOps({
      objective: objectiveWithContext,
      budgetCents: input.budgetCents,
      origin: input.origin,
    });

    runs.push(run);
  }

  const spentCents = runs.reduce((sum, run) => sum + run.spentCents, 0);
  const projectedRevenueCents = runs.reduce((sum, run) => sum + run.projectedRevenueCents, 0);

  return {
    mode: "autopilot",
    count: runs.length,
    spentCents,
    projectedRevenueCents,
    roiCents: projectedRevenueCents - spentCents,
    runs,
  };
}
