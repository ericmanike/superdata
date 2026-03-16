import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order";

export const dynamic = "force-dynamic";

async function getData(userId: string, role: string) {
  await dbConnect();
  const user = await User.findById(userId);
  
  let query = {};
  let adminBalance = 0;
  
  if (role === 'admin') {
    // For admins, get total stats and all orders
    query = {};
    const allUsers = await User.find({}, 'walletBalance');
    adminBalance = allUsers.reduce((sum, u) => sum + (u.walletBalance || 0), 0);
  } else {
    query = { user: userId };
  }

  const userOrders = await Order.find(query).sort({ createdAt: -1 });

  const transactions = userOrders.map(o => ({
    id: "TX-" + (o.transaction_id || "PENDING").toUpperCase(),
    network: o.network,
    phone: o.phoneNumber,
    bundle: o.bundleName,
    amount: o.price,
    status: o.status === 'delivered' ? 'Success' : o.status === 'failed' ? 'Failed' : 'Pending',
    date: o.createdAt.toISOString()
  }));

  const orders = userOrders.map(o => ({
    id: o._id.toString(),
    network: o.network,
    phone: o.phoneNumber,
    bundle: o.bundleName.endsWith("GB") ? o.bundleName : `${o.bundleName} GB`,
    amount: o.price,
    status: o.status === 'delivered' ? 'Delivered' : o.status === 'failed' ? 'Failed' : 'Processing',
  }));

  return { 
    user,
    wallet: { balance: user?.walletBalance || 0 },
    adminBalance,
    transactions: transactions.slice(0, 5),
    orders: orders.slice(0, 5)
  };
}





export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const { user, wallet, adminBalance, transactions, orders } = await getData(session.user.id, session.user.role);






  const stats = [
    { label: "Total orders", value: orders.length, change: "All time" },
    { label: "Pending orders", value: orders.filter((o:any) => o.status !== "Delivered").length, change: "Awaiting fulfillment" },
    {
      label: "My balance",
      value: `₵${wallet.balance.toFixed(2)}`,
      change: "Available to spend",
    },
  ];

  if (session.user.role === 'admin') {
    stats.push({
      label: "Admin balance",
      value: `₵${adminBalance.toFixed(2)}`,
      change: "Total system funds",
    });
  }

  return (
    <div className="space-y-8 text-slate-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600 uppercase tracking-widest font-bold">{user?.role || "User"}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/buy-data"
            className="rounded-full bg-[#00c9f5] px-5 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90"
          >
            Quick Buy Data
          </Link>
          <Link
            href="/dashboard/transactions"
            className="rounded-full px-5 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-900/20 transition hover:ring-slate-900/40"
          >
            View Transactions
          </Link>
        </div>
      </div>

      <div className={`grid gap-4 sm:grid-cols-2 ${session.user.role === 'admin' ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
        {stats.map((stat:any ) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-600">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-emerald-700">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent activity
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-sm font-semibold text-[#1e3a8a]"
          >
            Manage orders →
          </Link>
        </div>
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
            >
              <div className="flex items-center gap-4">
                <div className={`grid h-10 w-10 place-items-center rounded-xl font-bold ${
                  order.network === 'MTN' ? 'bg-amber-100 text-amber-700' : 
                  order.network === 'Telecel' ? 'bg-rose-100 text-rose-700' : 
                  'bg-sky-100 text-sky-700'
                }`}>
                  {order.network[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {order.network} • {order.bundle}
                  </p>
                  <p className="text-xs font-medium text-slate-500">{order.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">₵{order.amount.toFixed(2)}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                  order.status === 'Delivered' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {order.status}
                </p>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500">
              No recent activity.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-emerald-900">Need help?</h4>
            <p className="text-sm text-emerald-800">Reach our team any time for delivery checks, wallet issues, or payout help.</p>
          </div>
        </div>
        <a 
          href="https://wa.me/233531727714" 
          target="_blank" 
          className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600 shadow-md shadow-emerald-200"
        >
          Start chat
        </a>
      </div>

      <div className="flex justify-center">
        <Link
          href="/dashboard/buy-data"
          className="inline-flex items-center gap-3 rounded-full bg-[#00c9f5] px-7 py-4 text-base font-semibold text-slate-900 transition hover:opacity-90"
        >
          View data packages
        </Link>
      </div>
    </div>
  );
}
