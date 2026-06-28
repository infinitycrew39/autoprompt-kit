import { ShieldAlert } from "lucide-react";

import { listAdminOrders } from "@/lib/admin-orders";

type AdminOrdersPageProps = {
  searchParams: {
    token?: string;
    status?: string;
  };
};

const statuses = ["all", "paid", "expired", "unpaid"] as const;

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || "usd").toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const requiredToken = process.env.ADMIN_DASHBOARD_TOKEN;
  const accessToken = searchParams.token;
  const selectedStatus = searchParams.status ?? "all";

  if (requiredToken && accessToken !== requiredToken) {
    return (
      <main className="min-h-screen py-16">
        <div className="container max-w-2xl">
          <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 text-amber-100">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5" />
              <div>
                <h1 className="font-display text-2xl text-white">Admin Access Required</h1>
                <p className="mt-2 text-sm text-amber-100/90">
                  This dashboard is protected. Add a valid token in URL query to continue.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const orders = await listAdminOrders(100);
  const filteredOrders = selectedStatus !== "all"
    ? orders.filter((order) => order.paymentStatus === selectedStatus)
    : orders;

  const tokenQuery = accessToken ? `token=${encodeURIComponent(accessToken)}&` : "";

  return (
    <main className="min-h-screen py-12">
      <div className="container space-y-6">
        <header className="space-y-2">
          <h1 className="font-display text-3xl text-white sm:text-4xl">Orders Dashboard</h1>
          <p className="text-sm text-slate-300">
            Live orders synced from Stripe checkout sessions, with delivery status from webhook logs.
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          <p>Total orders: {filteredOrders.length}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {statuses.map((status) => {
            const href =
              status === "all"
                ? `/admin/orders${accessToken ? `?token=${encodeURIComponent(accessToken)}` : ""}`
                : `/admin/orders?${tokenQuery}status=${encodeURIComponent(status)}`;
            const isActive = selectedStatus === status;

            return (
              <a
                key={status}
                href={href}
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition-colors ${
                  isActive
                    ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/30"
                }`}
              >
                {status}
              </a>
            );
          })}

          <a
            href={`/api/orders?${tokenQuery}limit=100${selectedStatus !== "all" ? `&status=${encodeURIComponent(selectedStatus)}` : ""}&format=csv`}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-slate-300 transition-colors hover:border-cyan-300/30"
          >
            Export CSV
          </a>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              No orders found yet. Complete a checkout or run local webhook test to populate data.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <article
                key={order.sessionId}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-xl text-white">{order.plan.toUpperCase()} plan</h2>
                  <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-wide text-cyan-200">
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <p>Session: {order.sessionId}</p>
                  <p>Amount: {formatAmount(order.amountTotal, order.currency)}</p>
                  <p>Email: {order.customerEmail || "N/A"}</p>
                  <p>Updated: {new Date(order.updatedAt).toLocaleString()}</p>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-[#0A1428]/60 p-3">
                  <p>
                    Delivery email: {order.deliveryEmailSent ? "Sent" : "Not sent"}
                    {order.deliveryEmailReason ? ` (${order.deliveryEmailReason})` : ""}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
