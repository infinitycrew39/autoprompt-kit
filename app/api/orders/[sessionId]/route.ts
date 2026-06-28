import { NextResponse } from "next/server";

import { getOrderBySessionId } from "@/lib/orders";

type Params = {
  params: {
    sessionId: string;
  };
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const sessionId = params.sessionId;
    const order = await getOrderBySessionId(sessionId);

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
