
export const dynamic = "force-dynamic";

async function getData() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  async function safeFetchJson<T>(path: string, fallback: T): Promise<T> {
    try {
      const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
      if (!res.ok) return fallback;
      return (await res.json()) as T;
    } catch {
      return fallback;
    }
  }

  const orders = await safeFetchJson("/api/orders", [] as any[]);
  return { orders };
}

export default async function OrdersPage() {
  const { orders } = await getData();
  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <p className="text-sm text-slate-600">Fulfillment</p>
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {order.network} • {order.bundle}
                </p>
                <p className="text-xs text-slate-600">{order.phone}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  order.status === "Delivered"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {new Date(order.date).toLocaleString()}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full ${
                  order.status === "Delivered"
                    ? "w-full bg-emerald-400"
                    : "w-2/3 animate-pulse bg-amber-300"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
