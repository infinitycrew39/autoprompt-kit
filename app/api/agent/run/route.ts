import { buildObjectiveWithPurchasedAsset } from "@/lib/prompt-context";
import { runAutonomousBusinessOps } from "@/lib/agent-runtime";
import { canAccessAssetKey } from "@/lib/prompt-assets";
import { verifyPaidPurchase } from "@/lib/purchase-access";
import { NextResponse } from "next/server";

type RunBody = {
  objective?: string;
  budgetCents?: number;
  promptAssetKey?: string;
  sessionId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RunBody;
    const objective = body.objective?.trim();
    const budgetCents = Number(body.budgetCents ?? 5000);
    const promptAssetKey = body.promptAssetKey?.trim();
    const sessionId = body.sessionId?.trim();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId. Complete checkout first." }, { status: 401 });
    }

    const purchase = await verifyPaidPurchase(sessionId);
    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found or not paid." }, { status: 403 });
    }

    if (!objective) {
      return NextResponse.json({ error: "Missing objective." }, { status: 400 });
    }

    if (!Number.isFinite(budgetCents) || budgetCents <= 0) {
      return NextResponse.json({ error: "Invalid budgetCents." }, { status: 400 });
    }

    if (promptAssetKey && !canAccessAssetKey(purchase.plan, promptAssetKey)) {
      return NextResponse.json({ error: "Selected asset is not included in your plan." }, { status: 403 });
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
