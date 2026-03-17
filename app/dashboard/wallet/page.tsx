import Link from "next/link";
import TopUpWallet from "@/components/ui/topUpwallet";
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
  if (role !== 'admin') {
    query = { user: userId };
  }

  const userOrders = await Order.find(query).sort({ createdAt: -1 });

  const transactions = userOrders.map(o => ({
    id: o._id.toString(),
    network: o.network,
    phone: o.phoneNumber,
    bundle: o.bundleName,
    amount: o.price,
    status: o.status === 'delivered' ? 'Success' : o.status === 'failed' ? 'Failed' : 'Pending',
    date: o.createdAt.toISOString()
  }));

  return { 
    wallet: { 
      balance: user?.walletBalance || 0,
      lastUpdated: user?.updatedAt || new Date().toISOString()
    }, 
    transactions: transactions.slice(0, 10) 
  };
}

export default async function WalletPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const { wallet, transactions } = await getData(session.user.id, session.user.role);
  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">Balances & funding</p>
          <h1 className="text-2xl font-bold text-slate-900">Wallet</h1>
        </div>
        <Link
          href="/dashboard/buy-data"
          className="rounded-full bg-[#00c9f5] px-5 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90"
        >
          Buy Data
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Wallet balance</p>
          <p className="mt-3 text-3xl font-black text-slate-900">
            ₵{wallet.balance.toFixed(2)}
          </p>
          <p className="text-xs text-slate-600">
            Updated {new Date(wallet.lastUpdated).toLocaleString()}
          </p>
          <div className="mt-4 flex gap-3">
            <TopUpWallet className="flex-1 rounded-xl bg-[#00c9f5] text-slate-900 px-4 py-3 text-sm font-semibold transition hover:opacity-90 text-center cursor-pointer">
              Fund wallet
            </TopUpWallet>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Funding options</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>• Mobile money (MTN, Telecel, AirtelTigo)</li>
            <li>• Cards & bank transfers</li>
            <li>• Manual top-up</li>
          </ul>
        </div>


      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Payment history</h2>
          <Link
            href="/dashboard/orders"
            className="text-sm font-semibold text-[#1e3a8a]"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-slate-200">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-3 text-sm text-slate-700"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {tx.network} • {tx.bundle}
                </p>
                <p className="text-xs text-slate-500">{tx.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">₵{tx.amount}</p>
                <p className="text-xs text-slate-500">
                  {new Date(tx.date).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
