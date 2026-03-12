import { wallet, transactions } from "@/app/lib/mockData";
import Link from "next/link";

export default function WalletPage() {
  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">Balances & funding</p>
          <h1 className="text-2xl font-bold text-slate-900">Wallet</h1>
        </div>
        <Link
          href="/dashboard/buy-data"
          className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2 text-sm font-semibold text-slate-900"
        >
          Buy Data
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Wallet balance</p>
          <p className="mt-3 text-3xl font-black text-slate-900">
            ₵{wallet.balance.toFixed(2)}
          </p>
          <p className="text-xs text-slate-600">
            Updated {new Date(wallet.lastUpdated).toLocaleString()}
          </p>
          <div className="mt-4 flex gap-3">
            <button className="flex-1 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold transition hover:bg-slate-800">
              Fund wallet
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Funding options</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>• Mobile money (MTN, Telecel, AirtelTigo)</li>
            <li>• Cards & bank transfers</li>
            <li>• Agent float top-ups</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Limits</p>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>Daily spend: ₵3,500</p>
            <p>Pending settlements: ₵420</p>
            <p>Chargebacks: 0</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Payment history</h2>
          <Link
            href="/dashboard/transactions"
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
