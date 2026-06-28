import { NextResponse } from "next/server";

import { listRecentOrders } from "@/lib/orders";

type SearchParams = {
  limit?: string;
  status?: string;
  format?: string;
};

function toCsvValue(value: string | number | boolean | null | undefined) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replaceAll('"', '""')}"`;
}

function toCsv(
  orders: Array<{
    sessionId: string;
    plan: string;
    customerEmail: string;
    amountTotal: number;
    currency: string;
    paymentStatus: string;
    deliveryEmailSent: boolean;
    deliveryEmailReason?: string;
    createdAt: string;
    updatedAt: string;
  }>,
) {
  const headers = [
    "sessionId",
    "plan",
    "customerEmail",
    "amountTotal",
    "currency",
    "paymentStatus",
    "deliveryEmailSent",
    "deliveryEmailReason",
    "createdAt",
    "updatedAt",
  ];

  const rows = orders.map((order) =>
    [
      order.sessionId,
      order.plan,
      order.customerEmail,
      order.amountTotal,
      order.currency,
      order.paymentStatus,
      order.deliveryEmailSent,
      order.deliveryEmailReason ?? "",
      order.createdAt,
      order.updatedAt,
    ]
      .map(toCsvValue)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requiredToken = process.env.ADMIN_DASHBOARD_TOKEN;
    const accessToken = searchParams.get("token")?.trim();

    if (requiredToken && accessToken !== requiredToken) {
      return NextResponse.json({ error: "Admin access required." }, { status: 401 });
    }

    const params: SearchParams = {
      limit: searchParams.get("limit") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      format: searchParams.get("format") ?? undefined,
    };

    const parsedLimit = Number(params.limit ?? "20");
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 20;

    const orders = await listRecentOrders(limit);
    const filtered = params.status
      ? orders.filter((order) => order.paymentStatus === params.status)
      : orders;

    if (params.format === "csv") {
      return new Response(toCsv(filtered), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="orders.csv"',
        },
      });
    }

    return NextResponse.json({
      total: filtered.length,
      orders: filtered,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list orders.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
