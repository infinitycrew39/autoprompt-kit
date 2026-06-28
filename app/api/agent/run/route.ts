import { NextResponse } from "next/server";

import { buildObjectiveWithPurchasedAsset } from "@/lib/prompt-context";
import { runAutonomousBusinessOps } from "@/lib/agent-runtime";

type RunBody = {
  objective?: string;
  budgetCents?: number;
  promptAssetKey?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RunBody;
    const objective = body.objective?.trim();
    const budgetCents = Number(body.budgetCents ?? 5000);
    const promptAssetKey = body.promptAssetKey?.trim();

    if (!objective) {
      return NextResponse.json({ error: "Missing objective." }, { status: 400 });
    }

    if (!Number.isFinite(budgetCents) || budgetCents <= 0) {
      return NextResponse.json({ error: "Invalid budgetCents." }, { status: 400 });
    }

    const objectiveWithContext = await buildObjectiveWithPurchasedAsset(objective, promptAssetKey);

    const origin = new URL(request.url).origin;
    const run = await runAutonomousBusinessOps({
      objective: objectiveWithContext,
      budgetCents: Math.floor(budgetCents),
      origin,
    });

    return NextResponse.json({ run });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent run failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
