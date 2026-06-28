import { NextResponse } from "next/server";

import { findPaidPurchasesByEmail } from "@/lib/purchase-access";

type RestoreBody = {
  email?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RestoreBody;
    const email = body.email?.trim() ?? "";

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const purchases = await findPaidPurchasesByEmail(email);
    if (purchases.length === 0) {
      return NextResponse.json(
        { error: "No paid purchase found for this email." },
        { status: 404 },
      );
    }

    const latest = purchases[0];

    return NextResponse.json({
      sessionId: latest.sessionId,
      plan: latest.plan,
      totalPurchases: purchases.length,
      purchases: purchases.map((purchase) => ({
        sessionId: purchase.sessionId,
        plan: purchase.plan,
        updatedAt: purchase.updatedAt,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Restore failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
