import { transactions } from "@/lib/mockData";

export default function TransactionsPage() {
  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <p className="text-sm text-slate-600">History</p>
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-6 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
          <span>ID</span>
          <span>Network</span>
          <span>Phone</span>
          <span>Bundle</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-slate-200 text-sm">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="grid grid-cols-6 items-center px-4 py-3 text-slate-700"
            >
              <span className="font-semibold text-slate-900">{tx.id}</span>
              <span>{tx.network}</span>
              <span className="text-slate-300">{tx.phone}</span>
              <span>{tx.bundle}</span>
              <span className="font-semibold text-slate-900">
                ₵{tx.amount.toFixed(2)}
              </span>
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  tx.status === "Success"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {tx.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
