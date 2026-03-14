"use client";

type TopUpModalProps = {
  open: boolean;
  amount: string;
  onAmountChange: (value: string) => void;
  onPay: () => void;
  onClose: () => void;
};

export function TopUpModal({ open, amount, onAmountChange, onPay, onClose }: TopUpModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">Top up wallet</p>
            <h3 className="text-xl font-bold text-slate-900">Enter amount</h3>
          </div>
          <button className="text-slate-500 hover:text-slate-800" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <label className="text-sm font-semibold text-slate-700">Amount (₵)</label>
          <input
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            type="number"
            min="1"
            placeholder="100"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none ring-2 ring-transparent focus:ring-cyan-400/50"
          />
        </div>

        <button
          onClick={onPay}
          className="mt-5 w-full rounded-xl bg-[#1e3a8a] px-4 py-3 text-sm font-semibold text-white"
        >
          Pay with Paystack
        </button>
        <p className="mt-2 text-xs text-slate-500">
          You will be redirected to Paystack to complete this payment securely.
        </p>
      </div>
    </div>
  );
}
