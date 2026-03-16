import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/lib/models/Order";

export const dynamic = "force-dynamic";

async function getData() {
  const session = await getServerSession(authOptions);
  if (!session) return { orders: [] };

  await dbConnect();
  
  let query = {};
  if (session.user.role !== 'admin') {
    query = { user: session.user.id };
  }
  
  const rawOrders = await Order.find(query).sort({ createdAt: -1 });
  
  const orders = rawOrders.map(o => ({
    id: o._id.toString(),
    network: o.network,
    bundle: o.bundleName.endsWith("GB") ? o.bundleName : `${o.bundleName} GB`,
    phone: o.phoneNumber,
    amount: o.price,
    status: o.status === 'delivered' ? 'Delivered' : o.status === 'failed' ? 'Failed' : 'Processing',
    date: o.createdAt.toISOString()
  }));

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

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">
                    {order.network} • {order.bundle}
                  </p>
                  <p className="text-sm font-medium text-slate-500">{order.phone}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-bold text-slate-900">₵{order.amount.toFixed(2)}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      order.status === "Delivered"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-400">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-sm font-medium text-slate-500">No orders found yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
