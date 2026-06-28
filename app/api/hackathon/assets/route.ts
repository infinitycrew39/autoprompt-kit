import { NextResponse } from "next/server";

import { listPromptAssetsForPlan, readPromptAssetContent } from "@/lib/prompt-assets";
import { verifyPaidPurchase } from "@/lib/purchase-access";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id")?.trim();
    const key = url.searchParams.get("key")?.trim();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id." }, { status: 401 });
    }

    const purchase = await verifyPaidPurchase(sessionId);
    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found or not paid." }, { status: 403 });
    }

    if (!key) {
      return NextResponse.json({
        sessionId: purchase.sessionId,
        plan: purchase.plan,
        assets: listPromptAssetsForPlan(purchase.plan),
      });
    }

    const assetContent = await readPromptAssetContent(key);
    if (!assetContent) {
      return NextResponse.json({ error: "Unknown asset key." }, { status: 404 });
    }

    const allowed = listPromptAssetsForPlan(purchase.plan).some((asset) => asset.key === key);
    if (!allowed) {
      return NextResponse.json({ error: "This asset is not included in your plan." }, { status: 403 });
    }

    return NextResponse.json({
      asset: assetContent.asset,
      content: assetContent.content,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read prompt asset.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
