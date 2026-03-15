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
    id: "TX-" + o.transaction_id.toUpperCase(),
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
    bundle: o.bundleName,
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
            className="rounded-full bg-[#00caf5] px-5 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90"
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

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent transactions
            </h2>
            <Link
              href="/dashboard/transactions"
              className="text-sm font-semibold text-[#1e3a8a]"
            >
              See all →
            </Link>
          </div>
          <div className="space-y-3">
            {transactions.map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {tx.network} • {tx.bundle}
                  </p>
                  <p className="text-xs text-slate-600">{tx.phone}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    ₵{tx.amount.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs font-semibold ${
                      tx.status === "Success"
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Active orders</h2>
            <Link
              href="/dashboard/orders"
              className="text-sm font-semibold text-[#1e3a8a]"
            >
              Track →
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
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
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href="/dashboard/buy-data"
          className="inline-flex items-center gap-3 rounded-full bg-[#00caf5] px-7 py-4 text-base font-semibold text-slate-900 transition hover:opacity-90"
        >
          View data packages
        </Link>
      </div>
    </div>
  );
}
