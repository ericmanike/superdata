"use client";
import { Loader2, X } from "lucide-react";

type TopUpModalProps = {
  open: boolean;
  amount: string;
  onAmountChange: (value: string) => void;
  onPay: () => void;
  onClose: () => void;
  isLoading?: boolean;
};

export function TopUpModal({
  open,
  amount,
  onAmountChange,
  onPay,
  onClose,
  isLoading,
}: TopUpModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 transition-all transform scale-100">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Fund Wallet</p>
            <h3 className="text-xl font-extrabold text-slate-900">Enter Top-up Amount</h3>
          </div>
          <button
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Amount (GHS ₵)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-base font-bold text-slate-400">₵</span>
            <input
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              type="number"
              min="1"
              placeholder="e.g. 50"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 py-3 text-base font-bold text-slate-900 outline-none ring-2 ring-transparent transition focus:bg-white focus:border-[#1e3a8a] focus:ring-blue-100 disabled:opacity-60"
            />
          </div>
          <div className="flex gap-2 pt-1 flex-wrap">
            {["10", "20", "50", "100", "200"].map((quickVal) => (
              <button
                key={quickVal}
                type="button"
                onClick={() => onAmountChange(quickVal)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
              >
                +₵{quickVal}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onPay}
          disabled={isLoading}
          className="mt-6 w-full flex items-center justify-center rounded-xl bg-[#1e3a8a] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#162b64] active:scale-[0.99] disabled:opacity-60 shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Top-up...
            </>
          ) : (
            "Pay with Mobile Money (Moolre)"
          )}
        </button>
        <p className="mt-2.5 text-center text-xs text-slate-500 font-medium">
          Protected by Moolre payment gateway.
        </p>
      </div>
    </div>
  );
}
